import { randomUUID } from 'crypto';
import { CLIManager } from './CLIManager.js';
import { ConversationEngine } from '../engine/ConversationEngine.js';
import { DatabaseManager } from '../database/manager.js';
import { KnowledgeBaseManager } from '../database/KnowledgeBaseManager.js';
import { SessionMode, BestieSubMode, KBType } from '../models/types.js';

/**
 * BestiePreferenceMode handles AI Bestie preference gathering mode
 * 
 * Validates: Requirements 4, 24
 */
export class BestiePreferenceMode {
  private cli: CLIManager;
  private engine: ConversationEngine;
  private db: DatabaseManager;
  private kbManager: KnowledgeBaseManager;

  constructor(
    cli: CLIManager,
    engine: ConversationEngine,
    db: DatabaseManager,
    kbManager: KnowledgeBaseManager
  ) {
    this.cli = cli;
    this.engine = engine;
    this.db = db;
    this.kbManager = kbManager;
  }

  /**
   * Run the preference gathering mode
   * 
   * @param userId - User ID
   */
  async run(userId: string): Promise<void> {
    try {
      // Initialize session
      const session = await this.engine.initializeSession(
        userId,
        SessionMode.BESTIE,
        BestieSubMode.PREFERENCES
      );

      this.cli.displaySuccess('Preference gathering session started');
      this.cli.displayInfo(`Session ID: ${session.sessionId}`);
      this.cli.displayInfo('Let\'s explore your dating preferences through conversation.');

      // Run conversation loop
      const preferences = await this.runConversationLoop(session.sessionId, userId);

      // Build and store KB
      await this.buildAndStorePreferencesKB(userId, preferences);

      // Generate and display summary
      const summary = await this.engine.finalizeSession(session.sessionId);
      this.cli.displaySessionSummary(summary);
      this.cli.displaySuccess('Your preferences have been saved and will be used in future interviews!');
    } catch (error) {
      this.cli.displayError(error instanceof Error ? error.message : String(error));
    }
  }

  /**
   * Run the conversation loop
   */
  private async runConversationLoop(sessionId: string, userId: string): Promise<string[]> {
    const preferences: string[] = [];

    while (await this.engine.canContinueConversation(sessionId)) {
      const session = await this.db.getSession(sessionId);
      if (!session) {
        throw new Error('Session not found');
      }

      this.cli.displayTurnCount(session.turnCount, session.maxTurns);

      // Get user input
      const userInput = await this.cli.getUserInput('Your response (or "done" to finish)');

      if (userInput.toLowerCase() === 'done') {
        break;
      }

      // Store preference
      preferences.push(userInput);

      // Process input
      this.cli.displayLoading('Generating follow-up question');
      const response = await this.engine.processUserInput(sessionId, userInput);

      this.cli.displayConversation('AI', response.message);
    }

    return preferences;
  }

  /**
   * Build and store preferences KB
   */
  private async buildAndStorePreferencesKB(userId: string, preferences: string[]): Promise<void> {
    // Check if user already has a preferences KB
    let existingKB = await this.kbManager.getKnowledgeBaseByUserAndType(userId, KBType.FEMALE_PREFERENCES);

    const kbContent = this.synthesizePreferences(preferences);
    const sourceData = { preferences, synthesizedAt: new Date().toISOString() };

    if (existingKB) {
      // Update existing KB
      existingKB.content = kbContent;
      existingKB.sourceData = sourceData;
      existingKB.version += 1;
      existingKB.updatedAt = new Date();
      await this.kbManager.updateKnowledgeBase(existingKB);
      this.cli.displaySuccess(`Preferences KB updated (version ${existingKB.version})`);
    } else {
      // Create new KB
      const newKB = {
        kbId: randomUUID(),
        userId,
        type: KBType.FEMALE_PREFERENCES,
        content: kbContent,
        sourceData,
        createdAt: new Date(),
        updatedAt: new Date(),
        version: 1,
      };
      await this.kbManager.createKnowledgeBase(newKB);
      this.cli.displaySuccess('Preferences KB created');
    }
  }

  /**
   * Synthesize preferences from conversation
   */
  private synthesizePreferences(preferences: string[]): string {
    if (preferences.length === 0) {
      return 'No preferences gathered yet.';
    }

    let content = 'DATING PREFERENCES SUMMARY\n';
    content += '='.repeat(40) + '\n\n';

    preferences.forEach((pref, index) => {
      content += `${index + 1}. ${pref}\n`;
    });

    content += '\n' + '='.repeat(40) + '\n';
    content += 'These preferences will be used to evaluate potential matches.';

    return content;
  }
}
