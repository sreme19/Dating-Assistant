import inquirer from 'inquirer';
import chalk from 'chalk';
import { UserMode, SessionMode, BestieSubMode } from '../models/types.js';

/**
 * CLIManager handles all CLI interactions
 * 
 * Validates: Requirements 17, 1, 2
 */
export class CLIManager {
  /**
   * Display the main menu
   * 
   * @returns Promise that resolves to the selected user mode
   */
  async displayMainMenu(): Promise<UserMode> {
    console.clear();
    console.log(chalk.bold.cyan('╔════════════════════════════════════════╗'));
    console.log(chalk.bold.cyan('║     Welcome to Dating Assistant        ║'));
    console.log(chalk.bold.cyan('║   Your Personal AI Dating Coach        ║'));
    console.log(chalk.bold.cyan('╚════════════════════════════════════════╝'));
    console.log();

    const answers = await inquirer.prompt([
      {
        type: 'list',
        name: 'mode',
        message: 'Select your role:',
        choices: [
          { name: '👩 Female User (AI Bestie)', value: 'female' },
          { name: '👨 Male User (AI Wingman)', value: 'male' },
          { name: '❌ Exit', value: 'exit' },
        ],
      },
    ]);

    if (answers.mode === 'exit') {
      console.log(chalk.yellow('Goodbye!'));
      process.exit(0);
    }

    return answers.mode as UserMode;
  }

  /**
   * Display mode selection menu
   * 
   * @param mode - User mode
   * @returns Promise that resolves to the selected sub-mode or action
   */
  async displayModeSelection(mode: UserMode): Promise<string | null> {
    console.clear();
    console.log(chalk.bold.cyan(`\n${mode === 'female' ? '👩 AI Bestie Mode' : '👨 AI Wingman Mode'}\n`));

    if (mode === 'female') {
      const answers = await inquirer.prompt([
        {
          type: 'list',
          name: 'subMode',
          message: 'What would you like to do?',
          choices: [
            { name: '💬 Interview a Match', value: 'interview' },
            { name: '💭 Gather My Preferences', value: 'preferences' },
            { name: '📋 View Previous Sessions', value: 'sessions' },
            { name: '⚙️  Manage Custom Prompts', value: 'prompts' },
            { name: '⬅️  Back to Main Menu', value: 'back' },
          ],
        },
      ]);

      if (answers.subMode === 'back') {
        return null;
      }

      return answers.subMode;
    } else {
      const answers = await inquirer.prompt([
        {
          type: 'list',
          name: 'mode',
          message: 'What would you like to do?',
          choices: [
            { name: '💬 Get Dating Advice', value: 'wingman' },
            { name: '📋 View Previous Sessions', value: 'sessions' },
            { name: '⚙️  Manage Custom Prompts', value: 'prompts' },
            { name: '⬅️  Back to Main Menu', value: 'back' },
          ],
        },
      ]);

      if (answers.mode === 'back') {
        return null;
      }

      return answers.mode;
    }
  }

  /**
   * Display a conversation message
   * 
   * @param role - Role (User or AI)
   * @param message - Message to display
   */
  displayConversation(role: 'User' | 'AI', message: string): void {
    if (role === 'User') {
      console.log(chalk.blue(`\n👤 You: ${message}`));
    } else {
      console.log(chalk.green(`\n🤖 AI: ${message}`));
    }
  }

  /**
   * Get user input
   * 
   * @param prompt - Prompt text
   * @returns Promise that resolves to the user input
   */
  async getUserInput(prompt: string = 'Your response'): Promise<string> {
    const answers = await inquirer.prompt([
      {
        type: 'input',
        name: 'input',
        message: prompt,
        validate: (input: string) => {
          if (!input || input.trim().length === 0) {
            return 'Please enter a non-empty response';
          }
          return true;
        },
      },
    ]);

    return answers.input.trim();
  }

  /**
   * Display session summary
   * 
   * @param summary - Summary object
   */
  displaySessionSummary(summary: any): void {
    console.log(chalk.bold.cyan('\n╔════════════════════════════════════════╗'));
    console.log(chalk.bold.cyan('║        Session Summary                 ║'));
    console.log(chalk.bold.cyan('╚════════════════════════════════════════╝'));
    console.log();
    console.log(chalk.yellow(`Session ID: ${summary.sessionId}`));
    console.log(chalk.yellow(`Mode: ${summary.mode}`));
    if (summary.subMode) {
      console.log(chalk.yellow(`Sub-mode: ${summary.subMode}`));
    }
    console.log(chalk.yellow(`Turns: ${summary.turnCount}`));
    console.log(chalk.yellow(`Started: ${summary.createdAt.toLocaleString()}`));
    if (summary.completedAt) {
      console.log(chalk.yellow(`Completed: ${summary.completedAt.toLocaleString()}`));
    }
    console.log();
  }

  /**
   * Display an error message
   * 
   * @param error - Error message
   */
  displayError(error: string): void {
    console.log(chalk.red(`\n❌ Error: ${error}\n`));
  }

  /**
   * Display a success message
   * 
   * @param message - Success message
   */
  displaySuccess(message: string): void {
    console.log(chalk.green(`\n✅ ${message}\n`));
  }

  /**
   * Display an info message
   * 
   * @param message - Info message
   */
  displayInfo(message: string): void {
    console.log(chalk.cyan(`\nℹ️  ${message}\n`));
  }

  /**
   * Confirm an action
   * 
   * @param prompt - Confirmation prompt
   * @returns Promise that resolves to true if confirmed
   */
  async confirmAction(prompt: string): Promise<boolean> {
    const answers = await inquirer.prompt([
      {
        type: 'confirm',
        name: 'confirmed',
        message: prompt,
        default: false,
      },
    ]);

    return answers.confirmed;
  }

  /**
   * Display turn count and remaining turns
   * 
   * @param turnCount - Current turn count
   * @param maxTurns - Maximum turns
   */
  displayTurnCount(turnCount: number, maxTurns: number): void {
    const remaining = maxTurns - turnCount;
    const percentage = Math.round((turnCount / maxTurns) * 100);
    console.log(chalk.gray(`\n[Turn ${turnCount}/${maxTurns} | ${remaining} remaining | ${percentage}%]\n`));
  }

  /**
   * Display a loading message
   * 
   * @param message - Loading message
   */
  displayLoading(message: string): void {
    console.log(chalk.yellow(`\n⏳ ${message}...\n`));
  }

  /**
   * Clear the screen
   */
  clearScreen(): void {
    console.clear();
  }

  /**
   * Display a separator
   */
  displaySeparator(): void {
    console.log(chalk.gray('─'.repeat(40)));
  }
}
