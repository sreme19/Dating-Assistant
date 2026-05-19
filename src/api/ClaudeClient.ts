import Anthropic from '@anthropic-ai/sdk';
import { SessionContext } from '../models/types.js';

/**
 * ClaudeClient handles all communication with Claude API
 * 
 * Validates: Requirements 23, 13
 */
export class ClaudeClient {
  private client: Anthropic;
  private readonly MAX_RETRIES = 3;
  private readonly RETRY_DELAY = 1000; // ms
  private readonly REQUEST_TIMEOUT = 30000; // ms

  constructor(apiKey?: string) {
    const key = apiKey || process.env.ANTHROPIC_API_KEY;
    if (!key) {
      throw new Error('Claude API key not found. Set ANTHROPIC_API_KEY environment variable.');
    }
    this.client = new Anthropic({ apiKey: key });
  }

  /**
   * Generate a response from Claude
   * 
   * @param systemPrompt - System prompt defining the AI's role
   * @param userMessage - User message to respond to
   * @returns Promise that resolves to the response text
   * @throws Error if generation fails
   */
  async generateResponse(systemPrompt: string, userMessage: string): Promise<string> {
    if (!systemPrompt || typeof systemPrompt !== 'string') {
      throw new Error('System prompt must be a non-empty string');
    }

    if (!userMessage || typeof userMessage !== 'string') {
      throw new Error('User message must be a non-empty string');
    }

    let lastError: Error | null = null;

    for (let attempt = 0; attempt < this.MAX_RETRIES; attempt++) {
      try {
        const response = await Promise.race([
          this.client.messages.create({
            model: 'claude-sonnet-4-6',
            max_tokens: 1024,
            system: systemPrompt,
            messages: [
              {
                role: 'user',
                content: userMessage,
              },
            ],
          }),
          this.createTimeoutPromise(this.REQUEST_TIMEOUT),
        ]);

        // Validate response
        if (!response || typeof response !== 'object') {
          throw new Error('Invalid response from Claude API');
        }

        const content = (response as any).content;
        if (!Array.isArray(content) || content.length === 0) {
          throw new Error('Empty response from Claude API');
        }

        const textContent = content.find((c: any) => c.type === 'text');
        if (!textContent || !textContent.text) {
          throw new Error('No text content in Claude response');
        }

        const text = textContent.text.trim();
        if (!text) {
          throw new Error('Empty text response from Claude API');
        }

        return text;
      } catch (error) {
        lastError = error instanceof Error ? error : new Error(String(error));

        // Don't retry on validation errors
        if (lastError.message.includes('Invalid response') || lastError.message.includes('Empty response')) {
          throw lastError;
        }

        // Wait before retrying
        if (attempt < this.MAX_RETRIES - 1) {
          await this.delay(this.RETRY_DELAY * (attempt + 1));
        }
      }
    }

    throw new Error(`Failed to generate response after ${this.MAX_RETRIES} attempts: ${lastError?.message}`);
  }

  /**
   * Generate interview questions for AI Bestie
   * 
   * @param systemPrompt - System prompt for interview mode
   * @param matchInfo - Information about the match
   * @param conversationHistory - Previous conversation turns
   * @returns Promise that resolves to the questions
   */
  async generateInterviewQuestions(
    systemPrompt: string,
    matchInfo: string,
    conversationHistory: string = ''
  ): Promise<string> {
    const userMessage = conversationHistory
      ? `${conversationHistory}\n\nMatch information:\n${matchInfo}`
      : `Match information:\n${matchInfo}\n\nPlease generate initial interview questions.`;

    return this.generateResponse(systemPrompt, userMessage);
  }

  /**
   * Analyze a match response
   * 
   * @param systemPrompt - System prompt for interview mode
   * @param matchResponse - The match's response
   * @param conversationHistory - Previous conversation turns
   * @returns Promise that resolves to the analysis
   */
  async analyzeMatchResponse(
    systemPrompt: string,
    matchResponse: string,
    conversationHistory: string = ''
  ): Promise<string> {
    const userMessage = conversationHistory
      ? `${conversationHistory}\n\nMatch response:\n${matchResponse}\n\nPlease analyze this response and generate follow-up questions.`
      : `Match response:\n${matchResponse}\n\nPlease analyze this response.`;

    return this.generateResponse(systemPrompt, userMessage);
  }

  /**
   * Generate dating advice for AI Wingman
   * 
   * @param systemPrompt - System prompt for wingman mode
   * @param userQuestion - The user's question or scenario
   * @param conversationHistory - Previous conversation turns
   * @returns Promise that resolves to the advice
   */
  async generateDatingAdvice(
    systemPrompt: string,
    userQuestion: string,
    conversationHistory: string = ''
  ): Promise<string> {
    const userMessage = conversationHistory
      ? `${conversationHistory}\n\nNew question:\n${userQuestion}`
      : `Question:\n${userQuestion}`;

    return this.generateResponse(systemPrompt, userMessage);
  }

  /**
   * Check if the API is available
   * 
   * @returns Promise that resolves to true if available, false otherwise
   */
  async isAvailable(): Promise<boolean> {
    try {
      // Try to make a simple API call
      await Promise.race([
        this.client.messages.create({
          model: 'claude-sonnet-4-6',
          max_tokens: 10,
          messages: [
            {
              role: 'user',
              content: 'ping',
            },
          ],
        }),
        this.createTimeoutPromise(5000),
      ]);
      return true;
    } catch {
      return false;
    }
  }

  /**
   * Create a timeout promise
   * 
   * @param ms - Timeout in milliseconds
   * @returns Promise that rejects after the timeout
   */
  private createTimeoutPromise(ms: number): Promise<never> {
    return new Promise((_, reject) => {
      setTimeout(() => {
        reject(new Error(`Request timeout after ${ms}ms`));
      }, ms);
    });
  }

  /**
   * Delay execution
   * 
   * @param ms - Delay in milliseconds
   * @returns Promise that resolves after the delay
   */
  private delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
}
