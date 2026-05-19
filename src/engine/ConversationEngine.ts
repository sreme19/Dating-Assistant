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
   * Build interview system prompt
   */
  private buildInterviewSystemPrompt(context: SessionContext): string {
    return `You are AI Bestie, a sharp and caring dating coach helping a woman evaluate a male match.

Your job:
- Ask ONE question at a time — never list multiple questions
- Tailor every question to HER specific preferences (provided in the first message)
- After each of his answers, evaluate compatibility honestly before asking the next question

Response format for every follow-up turn:
**Compatibility:** [✅ Green / ⚠️ Yellow / 🚩 Red flag] — one sentence why
**Read:** 2-3 sentences on what his answer reveals
**Ask:** ONE follow-up question only

Evaluation rules:
- If he's not her type, say so plainly: "Honestly girl, this doesn't line up with what you said you want in [X]..."
- But ALWAYS continue — one mismatch isn't the full picture
- Never end the interview; keep probing even when things look bad
- Tone: warm, direct, girlfriend-energy — no fluff, no sugarcoating`;
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
    return `You are AI Wingman, a strategic dating coach for men.

Your role:
- Provide actionable, strategic dating advice
- Help navigate dating scenarios with confidence
- Explain the reasoning behind recommendations
- Maintain context across multiple turns
- Focus on practical next steps

Focus on:
- Communication strategies
- Building genuine connections
- Reading social cues
- Handling rejection gracefully
- Long-term relationship building`;
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
