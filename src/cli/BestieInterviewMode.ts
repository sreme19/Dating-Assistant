import { randomUUID } from 'crypto';
import { CLIManager } from './CLIManager.js';
import { ConversationEngine } from '../engine/ConversationEngine.js';
import { PromptBuilder } from '../engine/PromptBuilder.js';
import { DatabaseManager } from '../database/manager.js';
import { MatchProfileManager } from '../database/MatchProfileManager.js';
import { KnowledgeBaseManager } from '../database/KnowledgeBaseManager.js';
import { MatchProfile, SessionMode, BestieSubMode } from '../models/types.js';

/**
 * BestieInterviewMode handles AI Bestie interview mode
 * 
 * Validates: Requirements 3, 24
 */
export class BestieInterviewMode {
  private cli: CLIManager;
  private engine: ConversationEngine;
  private db: DatabaseManager;
  private matchManager: MatchProfileManager;
  private kbManager: KnowledgeBaseManager;

  constructor(
    cli: CLIManager,
    engine: ConversationEngine,
    db: DatabaseManager,
    matchManager: MatchProfileManager,
    kbManager: KnowledgeBaseManager
  ) {
    this.cli = cli;
    this.engine = engine;
    this.db = db;
    this.matchManager = matchManager;
    this.kbManager = kbManager;
  }

  /**
   * Run the interview mode
   * 
   * @param userId - User ID
   */
  async run(userId: string): Promise<void> {
    try {
      // Collect match information
      const matchProfile = await this.collectMatchInformation(userId);

      // Initialize session
      const session = await this.engine.initializeSession(
        userId,
        SessionMode.BESTIE,
        BestieSubMode.INTERVIEW,
        matchProfile.matchId
      );

      this.cli.displaySuccess(`Interview session started with ${matchProfile.matchName}`);
      this.cli.displayInfo(`Session ID: ${session.sessionId}`);

      // Run conversation loop
      await this.runConversationLoop(session.sessionId, userId, matchProfile);

      // Generate and display summary
      const summary = await this.engine.finalizeSession(session.sessionId);
      this.cli.displaySessionSummary(summary);
    } catch (error) {
      this.cli.displayError(error instanceof Error ? error.message : String(error));
    }
  }

  /**
   * Collect match information from user
   */
  private async collectMatchInformation(userId: string): Promise<MatchProfile> {
    this.cli.clearScreen();
    this.cli.displayInfo('Let\'s start by gathering information about the match.');

    const matchName = await this.cli.getUserInput('Match name');
    const matchAge = await this.cli.getUserInput('Match age');
    const matchOccupation = await this.cli.getUserInput('Match occupation');
    const matchInterests = await this.cli.getUserInput('Match interests (comma-separated)');

    const matchInfo = `Age: ${matchAge}\nOccupation: ${matchOccupation}\nInterests: ${matchInterests}`;

    const profile: MatchProfile = {
      matchId: randomUUID(),
      userId,
      matchName,
      matchInfo,
      createdAt: new Date(),
      updatedAt: new Date(),
      interviewSessions: [],
    };

    // Save match profile
    await this.matchManager.createMatchProfile(profile);
    this.cli.displaySuccess(`Match profile created for ${matchName}`);

    return profile;
  }

  /**
   * Run the conversation loop
   */
  private async runConversationLoop(
    sessionId: string,
    userId: string,
    matchProfile: MatchProfile
  ): Promise<void> {
    while (await this.engine.canContinueConversation(sessionId)) {
      const session = await this.db.getSession(sessionId);
      if (!session) {
        throw new Error('Session not found');
      }

      this.cli.displayTurnCount(session.turnCount, session.maxTurns);

      // Get user input
      const userInput = await this.cli.getUserInput('Match response (or "exit" to end)');

      if (userInput.toLowerCase() === 'exit') {
        break;
      }

      // Process input
      this.cli.displayLoading('Generating response');
      const response = await this.engine.processUserInput(sessionId, userInput);

      this.cli.displayConversation('AI', response.message);
    }
  }
}
