import { CLIManager } from './CLIManager.js';
import { ConversationEngine } from '../engine/ConversationEngine.js';
import { DatabaseManager } from '../database/manager.js';
import { SessionMode } from '../models/types.js';

/**
 * WingmanAdviceMode handles AI Wingman advice mode
 * 
 * Validates: Requirements 5, 24
 */
export class WingmanAdviceMode {
  private cli: CLIManager;
  private engine: ConversationEngine;
  private db: DatabaseManager;

  constructor(
    cli: CLIManager,
    engine: ConversationEngine,
    db: DatabaseManager
  ) {
    this.cli = cli;
    this.engine = engine;
    this.db = db;
  }

  /**
   * Run the wingman advice mode
   * 
   * @param userId - User ID
   */
  async run(userId: string): Promise<void> {
    try {
      // Initialize session
      const session = await this.engine.initializeSession(
        userId,
        SessionMode.WINGMAN
      );

      this.cli.displaySuccess('Wingman session started');
      this.cli.displayInfo(`Session ID: ${session.sessionId}`);
      this.cli.displayInfo('Ask me anything about dating and I\'ll provide strategic advice.');

      // Run conversation loop
      await this.runConversationLoop(session.sessionId, userId);

      // Generate and display summary
      const summary = await this.engine.finalizeSession(session.sessionId);
      this.cli.displaySessionSummary(summary);
    } catch (error) {
      this.cli.displayError(error instanceof Error ? error.message : String(error));
    }
  }

  /**
   * Run the conversation loop
   */
  private async runConversationLoop(sessionId: string, userId: string): Promise<void> {
    while (await this.engine.canContinueConversation(sessionId)) {
      const session = await this.db.getSession(sessionId);
      if (!session) {
        throw new Error('Session not found');
      }

      this.cli.displayTurnCount(session.turnCount, session.maxTurns);

      // Get user input
      const userInput = await this.cli.getUserInput('Your question or scenario (or "exit" to end)');

      if (userInput.toLowerCase() === 'exit') {
        break;
      }

      // Process input
      this.cli.displayLoading('Generating advice');
      const response = await this.engine.processUserInput(sessionId, userInput);

      this.cli.displayConversation('AI', response.message);
    }
  }
}
