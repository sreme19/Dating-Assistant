import { DatabaseManager } from './database/manager.js';
import { initializeDatabase } from './database/init.js';
import { CLIManager } from './cli/CLIManager.js';
import { ConversationEngine } from './engine/ConversationEngine.js';
import { ClaudeClient } from './api/ClaudeClient.js';
import { ConfigLoader } from './config/ConfigLoader.js';
import { BestieInterviewMode } from './cli/BestieInterviewMode.js';
import { BestiePreferenceMode } from './cli/BestiePreferenceMode.js';
import { WingmanAdviceMode } from './cli/WingmanAdviceMode.js';
import { CustomPromptManager } from './database/CustomPromptManager.js';
import { MatchProfileManager } from './database/MatchProfileManager.js';
import { KnowledgeBaseManager } from './database/KnowledgeBaseManager.js';
import { SessionManager } from './database/SessionManager.js';
import { SessionMode, BestieSubMode } from './models/types.js';

/**
 * Main application entry point
 */
async function main(): Promise<void> {
  let db: DatabaseManager | null = null;
  let cli: CLIManager | null = null;

  try {
    // Initialize CLI
    cli = new CLIManager();
    cli.displayLoading('Initializing database');

    // Load configuration
    const config = ConfigLoader.getInstance();
    config.validate();

    // Initialize database
    db = new DatabaseManager(config.getDatabasePath());
    await initializeDatabase(config.getDatabasePath());

    cli.displaySuccess('Database initialized');

    // Initialize API client
    const claude = new ClaudeClient(config.getClaudeApiKey());

    // Initialize managers
    const engine = new ConversationEngine(db, claude);
    const customPromptManager = new CustomPromptManager(db);
    const matchProfileManager = new MatchProfileManager(db);
    const kbManager = new KnowledgeBaseManager(db);
    const sessionManager = new SessionManager(db);

    // Main loop
    let running = true;
    while (running) {
      try {
        // Display main menu
        const userMode = await cli.displayMainMenu();

        // Get or create user profile
        let userProfile = await db.getUserProfileByUsername(userMode === 'female' ? 'female_user' : 'male_user');
        if (!userProfile) {
          const username = userMode === 'female' ? 'female_user' : 'male_user';
          userProfile = {
            userId: `user_${userMode}_${Date.now()}`,
            mode: userMode,
            username,
            createdAt: new Date(),
            updatedAt: new Date(),
            metadata: {},
          };
          await db.createUserProfile(userProfile);
        }

        // Display mode selection
        const selection = await cli.displayModeSelection(userMode);

        if (!selection) {
          continue;
        }

        // Route to appropriate mode
        if (userMode === 'female') {
          if (selection === 'interview') {
            const mode = new BestieInterviewMode(cli, engine, db, matchProfileManager, kbManager);
            await mode.run(userProfile.userId);
          } else if (selection === 'preferences') {
            const mode = new BestiePreferenceMode(cli, engine, db, kbManager);
            await mode.run(userProfile.userId);
          } else if (selection === 'sessions') {
            await displaySessions(cli, sessionManager, userProfile.userId);
          } else if (selection === 'prompts') {
            await manageCustomPrompts(cli, customPromptManager, userProfile.userId, SessionMode.BESTIE);
          }
        } else {
          if (selection === 'wingman') {
            const mode = new WingmanAdviceMode(cli, engine, db);
            await mode.run(userProfile.userId);
          } else if (selection === 'sessions') {
            await displaySessions(cli, sessionManager, userProfile.userId);
          } else if (selection === 'prompts') {
            await manageCustomPrompts(cli, customPromptManager, userProfile.userId, SessionMode.WINGMAN);
          }
        }
      } catch (error) {
        if (cli) {
          cli.displayError(error instanceof Error ? error.message : String(error));
        }
      }
    }
  } catch (error) {
    if (cli) {
      cli.displayError(error instanceof Error ? error.message : String(error));
    } else {
      console.error('Fatal error:', error);
    }
    process.exit(1);
  } finally {
    // Graceful shutdown
    if (db) {
      try {
        await db.close();
      } catch (error) {
        console.error('Error closing database:', error);
      }
    }
  }
}

/**
 * Display previous sessions
 */
async function displaySessions(
  cli: CLIManager,
  sessionManager: SessionManager,
  userId: string
): Promise<void> {
  cli.clearScreen();
  cli.displayInfo('Loading sessions...');

  const sessions = await sessionManager.listSessions(userId);

  if (sessions.length === 0) {
    cli.displayInfo('No sessions found');
    return;
  }

  console.log('\nPrevious Sessions:\n');
  sessions.forEach((session, index) => {
    console.log(`${index + 1}. ${session.mode} - ${session.status} (${session.turnCount}/${session.maxTurns} turns)`);
    console.log(`   Created: ${session.createdAt.toLocaleString()}`);
    console.log();
  });

  await cli.getUserInput('Press Enter to continue');
}

/**
 * Manage custom prompts
 */
async function manageCustomPrompts(
  cli: CLIManager,
  manager: CustomPromptManager,
  userId: string,
  mode: SessionMode
): Promise<void> {
  cli.clearScreen();
  cli.displayInfo('Custom Prompts Management');

  const prompts = await manager.getCustomPrompts(userId, mode);

  if (prompts.length === 0) {
    cli.displayInfo('No custom prompts found');
    return;
  }

  console.log('\nYour Custom Prompts:\n');
  prompts.forEach((prompt, index) => {
    console.log(`${index + 1}. ${prompt.name}`);
    console.log(`   ${prompt.content.substring(0, 50)}...`);
    console.log();
  });

  await cli.getUserInput('Press Enter to continue');
}

// Run the application
main().catch(error => {
  console.error('Fatal error:', error);
  process.exit(1);
});
