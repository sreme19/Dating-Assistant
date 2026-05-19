import { randomUUID } from 'crypto';
import {
  Session,
  SessionMode,
  BestieSubMode,
  SessionStatus,
  SessionContext,
  ConversationTurn,
  EngineResponse,
  SessionSummary,
  MAX_TURNS_PER_SESSION,
} from '../models/types.js';
import { DatabaseManager } from '../database/manager.js';
import { ClaudeClient } from '../api/ClaudeClient.js';

/**
 * ConversationEngine orchestrates multi-turn conversations
 * 
 * Validates: Requirements 2, 6, 22
 */
export class ConversationEngine {
  private db: DatabaseManager;
  private claude: ClaudeClient;

  constructor(db: DatabaseManager, claude: ClaudeClient) {
    this.db = db;
    this.claude = claude;
  }

  /**
   * Initialize a new conversation session
   * 
   * @param userId - User ID
   * @param mode - Session mode (bestie or wingman)
   * @param subMode - Sub-mode for bestie (interview or preferences)
   * @param matchId - Match ID (required for interview mode)
   * @returns Promise that resolves to the created session
   * @throws Error if initialization fails
   */
  async initializeSession(
    userId: string,
    mode: SessionMode,
    subMode?: BestieSubMode,
    matchId?: string
  ): Promise<Session> {
    if (!userId || typeof userId !== 'string') {
      throw new Error('userId must be a non-empty string');
    }

    if (!mode || !['bestie', 'wingman'].includes(mode)) {
      throw new Error('mode must be either "bestie" or "wingman"');
    }

    // Validate interview mode requirements
    if (mode === SessionMode.BESTIE && subMode === BestieSubMode.INTERVIEW && !matchId) {
      throw new Error('matchId is required for interview mode');
    }

    const session: Session = {
      sessionId: randomUUID(),
      userId,
      mode,
      subMode,
      turnCount: 0,
      maxTurns: MAX_TURNS_PER_SESSION,
      status: SessionStatus.ACTIVE,
      createdAt: new Date(),
      updatedAt: new Date(),
      matchId,
    };

    // Save to database
    await this.db.createSession(session);

    return session;
  }

  /**
   * Process user input and generate a response
   * 
   * @param sessionId - Session ID
   * @param userInput - User input message
   * @returns Promise that resolves to the engine response
   * @throws Error if processing fails
   */
  async processUserInput(sessionId: string, userInput: string): Promise<EngineResponse> {
    if (!sessionId || typeof sessionId !== 'string') {
      throw new Error('sessionId must be a non-empty string');
    }

    if (!userInput || typeof userInput !== 'string') {
      throw new Error('userInput must be a non-empty string');
    }

    // Validate session state
    const session = await this.db.getSession(sessionId);
    if (!session) {
      throw new Error('Session not found');
    }

    if (session.status !== SessionStatus.ACTIVE) {
      throw new Error(`Session is not active (status: ${session.status})`);
    }

    if (session.turnCount >= session.maxTurns) {
      throw new Error(`Session has reached maximum turns (${session.maxTurns})`);
    }

    // Build conversation context
    const context = await this.getSessionContext(sessionId);

    // Build prompt based on mode
    let systemPrompt = '';
    let userMessage = userInput;

    if (session.mode === SessionMode.BESTIE) {
      if (session.subMode === BestieSubMode.INTERVIEW) {
        systemPrompt = this.buildInterviewSystemPrompt(context);
        userMessage = this.buildInterviewUserMessage(context, userInput);
      } else if (session.subMode === BestieSubMode.PREFERENCES) {
        systemPrompt = this.buildPreferenceSystemPrompt(context);
        userMessage = this.buildPreferenceUserMessage(context, userInput);
      }
    } else if (session.mode === SessionMode.WINGMAN) {
      systemPrompt = this.buildWingmanSystemPrompt(context);
      userMessage = this.buildWingmanUserMessage(context, userInput);
    }

    // Get response from Claude
    const assistantMessage = await this.claude.generateResponse(systemPrompt, userMessage);

    // Create and save conversation turn
    const turnNumber = session.turnCount + 1;
    const turn: ConversationTurn = {
      turnId: randomUUID(),
      sessionId,
      turnNumber,
      userMessage: userInput,
      assistantMessage,
      timestamp: new Date(),
      metadata: {},
    };

    await this.db.saveConversationTurn(turn);

    // Update session
    session.turnCount = turnNumber;
    session.updatedAt = new Date();

    // Auto-complete if reached max turns
    if (session.turnCount >= session.maxTurns) {
      session.status = SessionStatus.COMPLETED;
    }

    await this.db.updateSession(session);

    return {
      message: assistantMessage,
      turnNumber,
      turnsRemaining: session.maxTurns - session.turnCount,
    };
  }

  /**
   * Get the session context
   * 
   * @param sessionId - Session ID
   * @returns Promise that resolves to the session context
   */
  async getSessionContext(sessionId: string): Promise<SessionContext> {
    const session = await this.db.getSession(sessionId);
    if (!session) {
      throw new Error('Session not found');
    }

    const history = await this.db.getConversationHistory(sessionId);

    return {
      sessionId,
      userId: session.userId,
      mode: session.mode,
      subMode: session.subMode,
      turnCount: session.turnCount,
      maxTurns: session.maxTurns,
      conversationHistory: history,
      matchId: session.matchId,
    };
  }

  /**
   * Check if a conversation can continue
   * 
   * @param sessionId - Session ID
   * @returns Promise that resolves to true if conversation can continue
   */
  async canContinueConversation(sessionId: string): Promise<boolean> {
    try {
      const session = await this.db.getSession(sessionId);
      if (!session) {
        return false;
      }

      if (session.status !== SessionStatus.ACTIVE) {
        return false;
      }

      if (session.turnCount >= session.maxTurns) {
        return false;
      }

      return true;
    } catch {
      return false;
    }
  }

  /**
   * Finalize a session and generate summary
   * 
   * @param sessionId - Session ID
   * @returns Promise that resolves to the session summary
   */
  async finalizeSession(sessionId: string): Promise<SessionSummary> {
    const session = await this.db.getSession(sessionId);
    if (!session) {
      throw new Error('Session not found');
    }

    const history = await this.db.getConversationHistory(sessionId);

    // Update session status
    session.status = SessionStatus.COMPLETED;
    session.updatedAt = new Date();
    await this.db.updateSession(session);

    return {
      sessionId,
      userId: session.userId,
      mode: session.mode,
      subMode: session.subMode,
      totalTurns: session.turnCount,
      createdAt: session.createdAt,
      completedAt: new Date(),
    };
  }

  /**
   * Synthesize a male personality profile from an interview conversation log.
   */
  async synthesizeMalePersonality(conversationLog: string, name: string, matchInfo: string): Promise<string> {
    const systemPrompt = `You are a dating analyst. Read an interview conversation and write a concise, honest personality profile of the man in markdown.

Structure it as:
# Personality Profile — {name}

## Who He Is
2-3 sentences capturing his overall vibe and character.

## What He's Looking For
Bullet points drawn directly from his answers.

## Green Flags
Bullet points — genuine positives surfaced in the interview.

## Yellow Flags
Bullet points — things worth watching or probing further.

## Red Flags
Bullet points — genuine concerns, or "None identified" if clean.

## Compatibility Pattern
1 paragraph on what type of woman he'd likely suit best, based on his answers.

Be honest, specific, and base everything on what was actually said — no filler.`;

    const userMessage = `Name: ${name}\n${matchInfo}\n\nInterview log:\n${conversationLog}`;
    return this.claude.generateResponse(systemPrompt, userMessage);
  }

  /**
   * Build interview system prompt
   */
  private buildInterviewSystemPrompt(context: SessionContext): string {
    return `You are AI Bestie, a sharp dating coach helping a woman evaluate a male match.

You do TWO things:
1. Ask him questions to assess compatibility with her preferences
2. When he asks questions ABOUT HER, answer on her behalf using her stated preferences

STRICT response format — every single reply must follow this exactly:
**[✅ / ⚠️ / 🚩]** One sentence on compatibility or relevance.
**Read:** 2 sentences max on what his response reveals (or what you're answering about her).
**Ask him:** 1-2 questions OR **Tell him:** 1-2 statements about her position (if answering his questions).

Rules for answers ABOUT HER:
- Draw directly from her stated preferences (already in the conversation)
- Be honest and clear about what she wants
- If he asks "what are you looking for?" answer based on her preferences
- If he asks "what's your deal-breaker?" answer based on her stated red flags
- Keep her agency visible — she chose this interview, these are her terms

Rules for all responses:
- ALWAYS end with either "Ask him:" or "Tell him:" — non-negotiable
- NO summaries, NO vibe-check tables, NO round recaps, NO extra sections
- If he's off-track, say so in the Read line, then keep probing
- One question per turn unless clarifying something specific
- Tone: direct, warm, girlfriend-energy`;
  }

  /**
   * Build interview user message
   */
  private buildInterviewUserMessage(context: SessionContext, userInput: string): string {
    let message = '';

    if (context.conversationHistory.length > 0) {
      message += 'Previous conversation:\n';
      context.conversationHistory.forEach((turn) => {
        message += `User: ${turn.userMessage}\nAI: ${turn.assistantMessage}\n\n`;
      });
    }

    message += `New information: ${userInput}`;
    return message;
  }

  /**
   * Build preference system prompt
   */
  private buildPreferenceSystemPrompt(context: SessionContext): string {
    return `You are AI Bestie, helping a woman understand and articulate her dating preferences.

Your role:
- Ask progressive, thoughtful questions about dating goals
- Help identify patterns and themes in preferences
- Explore different dimensions of compatibility
- Identify potential conflicts or contradictions
- Build a comprehensive understanding of what she values

Focus on:
- Core values and life goals
- Relationship timeline and expectations
- Deal-breakers and red flags
- Lifestyle compatibility
- Emotional and intellectual connection`;
  }

  /**
   * Build preference user message
   */
  private buildPreferenceUserMessage(context: SessionContext, userInput: string): string {
    let message = '';

    if (context.conversationHistory.length > 0) {
      message += 'Previous conversation:\n';
      context.conversationHistory.forEach((turn) => {
        message += `User: ${turn.userMessage}\nAI: ${turn.assistantMessage}\n\n`;
      });
      message += 'Based on previous answers, ask deeper follow-up questions.\n\n';
    } else {
      message += 'Start with an opening question about dating goals.\n\n';
    }

    message += `User response: ${userInput}`;
    return message;
  }

  /**
   * Build wingman system prompt
   */
  private buildWingmanSystemPrompt(context: SessionContext): string {
    return `You are AI Wingman, a sharp and direct dating coach for men.

If the man shared his profile (from a past interview) at the start of the session, use it as your foundation — reference specific things from his profile when relevant, call out patterns you notice, and tailor every piece of advice to who he actually is rather than giving generic tips.

Your role:
- Give actionable, specific advice — no vague platitudes
- Reference his profile context when it's relevant ("Based on how you came across in your interview...")
- Be honest if his behavior is the problem
- Keep advice practical and grounded in the real situation he describes

Focus on:
- What to say and how to say it
- Reading the situation accurately
- Fixing patterns that are holding him back
- Building genuine connections, not just tactics`;
  }

  /**
   * Build wingman user message
   */
  private buildWingmanUserMessage(context: SessionContext, userInput: string): string {
    let message = '';

    if (context.conversationHistory.length > 0) {
      message += 'Previous conversation:\n';
      context.conversationHistory.forEach((turn) => {
        message += `User: ${turn.userMessage}\nAI: ${turn.assistantMessage}\n\n`;
      });
    }

    message += `Question/Scenario: ${userInput}`;
    return message;
  }
}
