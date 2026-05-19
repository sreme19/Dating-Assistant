import { SessionContext, UserProfile, MatchProfile, KnowledgeBase } from '../models/types.js';

/**
 * PromptBuilder constructs prompts for different conversation modes
 * 
 * Validates: Requirements 10, 18, 19, 20
 */
export class PromptBuilder {
  /**
   * Build interview prompt for AI Bestie
   * 
   * @param context - Session context
   * @param userProfile - Female user profile
   * @param matchProfile - Match profile
   * @param preferencesKB - Female preferences KB (optional)
   * @returns Object with system and user prompts
   */
  static buildInterviewPrompt(
    context: SessionContext,
    userProfile: UserProfile,
    matchProfile: MatchProfile,
    preferencesKB?: KnowledgeBase
  ): { systemPrompt: string; userMessage: string } {
    const systemPrompt = this.buildInterviewSystemPrompt(userProfile, matchProfile, preferencesKB);
    const userMessage = this.buildInterviewUserMessage(context, matchProfile);

    return { systemPrompt, userMessage };
  }

  /**
   * Build preference gathering prompt for AI Bestie
   * 
   * @param context - Session context
   * @param userProfile - Female user profile
   * @returns Object with system and user prompts
   */
  static buildPreferencePrompt(
    context: SessionContext,
    userProfile: UserProfile
  ): { systemPrompt: string; userMessage: string } {
    const systemPrompt = this.buildPreferenceSystemPrompt(userProfile);
    const userMessage = this.buildPreferenceUserMessage(context);

    return { systemPrompt, userMessage };
  }

  /**
   * Build wingman advice prompt for AI Wingman
   * 
   * @param context - Session context
   * @param datingExpertiseKB - Dating expertise KB
   * @returns Object with system and user prompts
   */
  static buildAdvicePrompt(
    context: SessionContext,
    datingExpertiseKB: KnowledgeBase
  ): { systemPrompt: string; userMessage: string } {
    const systemPrompt = this.buildWingmanSystemPrompt(datingExpertiseKB);
    const userMessage = this.buildWingmanUserMessage(context);

    return { systemPrompt, userMessage };
  }

  /**
   * Build interview system prompt
   */
  private static buildInterviewSystemPrompt(
    userProfile: UserProfile,
    matchProfile: MatchProfile,
    preferencesKB?: KnowledgeBase
  ): string {
    let prompt = `You are AI Bestie, a dating coach helping a woman evaluate male matches through structured interviews.

Your role:
- Ask thoughtful, progressive questions to understand the match
- Identify potential red flags in responses
- Reference the woman's preferences and values
- Provide analysis of compatibility signals
- Maintain a supportive, non-judgmental tone

Focus on:
- Values and life goals
- Relationship expectations
- Communication style
- Emotional intelligence
- Compatibility with stated preferences

---

FEMALE USER PROFILE:
Name: ${userProfile.username}
Age Range: ${userProfile.metadata?.ageRange || 'Not specified'}
Location: ${userProfile.metadata?.location || 'Not specified'}
Interests: ${userProfile.metadata?.interests?.join(', ') || 'Not specified'}

---

MATCH PROFILE:
Name: ${matchProfile.matchName}
Information: ${matchProfile.matchInfo}`;

    if (preferencesKB) {
      prompt += `

---

FEMALE PREFERENCES & RED FLAGS:
${preferencesKB.content}`;
    }

    return prompt;
  }

  /**
   * Build interview user message
   */
  private static buildInterviewUserMessage(context: SessionContext, matchProfile: MatchProfile): string {
    let message = '';

    if (context.conversationHistory.length > 0) {
      message += 'CONVERSATION HISTORY:\n';
      context.conversationHistory.forEach((turn) => {
        message += `User: ${turn.userMessage}\n`;
        message += `AI Bestie: ${turn.assistantMessage}\n\n`;
      });
    } else {
      message += `Please generate initial interview questions for ${matchProfile.matchName} based on the profile information above.\n\n`;
    }

    return message;
  }

  /**
   * Build preference system prompt
   */
  private static buildPreferenceSystemPrompt(userProfile: UserProfile): string {
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
- Emotional and intellectual connection

---

USER PROFILE:
Name: ${userProfile.username}
Age Range: ${userProfile.metadata?.ageRange || 'Not specified'}
Location: ${userProfile.metadata?.location || 'Not specified'}
Interests: ${userProfile.metadata?.interests?.join(', ') || 'Not specified'}`;
  }

  /**
   * Build preference user message
   */
  private static buildPreferenceUserMessage(context: SessionContext): string {
    let message = '';

    if (context.conversationHistory.length > 0) {
      message += 'CONVERSATION HISTORY:\n';
      context.conversationHistory.forEach((turn) => {
        message += `User: ${turn.userMessage}\n`;
        message += `AI Bestie: ${turn.assistantMessage}\n\n`;
      });
      message += 'Based on the previous conversation, ask deeper follow-up questions to better understand her preferences.\n';
    } else {
      message += 'Start with an opening question about her dating goals and what she\'s looking for in a partner.\n';
    }

    return message;
  }

  /**
   * Build wingman system prompt
   */
  private static buildWingmanSystemPrompt(datingExpertiseKB: KnowledgeBase): string {
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
- Long-term relationship building

---

DATING EXPERTISE KNOWLEDGE BASE:
${datingExpertiseKB.content}`;
  }

  /**
   * Build wingman user message
   */
  private static buildWingmanUserMessage(context: SessionContext): string {
    let message = '';

    if (context.conversationHistory.length > 0) {
      message += 'CONVERSATION HISTORY:\n';
      context.conversationHistory.forEach((turn) => {
        message += `User: ${turn.userMessage}\n`;
        message += `AI Wingman: ${turn.assistantMessage}\n\n`;
      });
    }

    return message;
  }
}
