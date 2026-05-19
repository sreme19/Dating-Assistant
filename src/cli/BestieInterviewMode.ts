import { randomUUID } from 'crypto';
import { existsSync, readdirSync, readFileSync } from 'fs';
import { join, resolve, dirname } from 'path';
import { fileURLToPath } from 'url';
import inquirer from 'inquirer';
import { CLIManager } from './CLIManager.js';
import { ConversationEngine } from '../engine/ConversationEngine.js';
import { DatabaseManager } from '../database/manager.js';
import { MatchProfileManager } from '../database/MatchProfileManager.js';
import { KnowledgeBaseManager } from '../database/KnowledgeBaseManager.js';
import { MatchProfile, SessionMode, BestieSubMode } from '../models/types.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const PROJECT_ROOT = resolve(__dirname, '../..');
const PROFILES_DIR = join(PROJECT_ROOT, 'profiles');

interface ProfileMeta {
  id: string;
  name: string;
  age: string;
  createdAt: string;
}

function loadExistingProfiles(): ProfileMeta[] {
  if (!existsSync(PROFILES_DIR)) return [];
  return readdirSync(PROFILES_DIR, { withFileTypes: true })
    .filter(d => d.isDirectory())
    .flatMap(d => {
      try {
        return [JSON.parse(readFileSync(join(PROFILES_DIR, d.name, 'profile.json'), 'utf-8')) as ProfileMeta];
      } catch {
        return [];
      }
    });
}

function loadPreferences(profileId: string): string | null {
  const mdPath = join(PROFILES_DIR, profileId, 'preferences.md');
  if (!existsSync(mdPath)) return null;
  return readFileSync(mdPath, 'utf-8');
}

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

  async run(userId: string): Promise<void> {
    try {
      this.cli.clearScreen();

      // Step 1: pick female profile to base the interview on
      const femaleProfile = await this.selectFemaleProfile();
      const preferences = loadPreferences(femaleProfile.id);

      if (!preferences) {
        this.cli.displayInfo(`No preferences found for ${femaleProfile.name}. Questions will be generic.`);
      } else {
        this.cli.displaySuccess(`Loaded preferences for ${femaleProfile.name}`);
      }

      // Step 2: collect match info
      const matchProfile = await this.collectMatchInformation(userId);

      // Step 3: start session
      const session = await this.engine.initializeSession(
        userId,
        SessionMode.BESTIE,
        BestieSubMode.INTERVIEW,
        matchProfile.matchId
      );

      this.cli.displaySuccess(`Interview session started for ${matchProfile.matchName}`);
      this.cli.displayInfo(`Session ID: ${session.sessionId}`);

      // Step 4: run interview
      await this.runConversationLoop(session.sessionId, userId, matchProfile, femaleProfile, preferences);

      const summary = await this.engine.finalizeSession(session.sessionId);
      this.cli.displaySessionSummary(summary);
    } catch (error) {
      await this.cli.displayError(error instanceof Error ? error.message : String(error));
    }
  }

  private async selectFemaleProfile(): Promise<ProfileMeta> {
    const profiles = loadExistingProfiles();

    if (profiles.length === 0) {
      throw new Error('No female profiles found. Please go to "Gather Preferences" first to create a profile.');
    }

    if (profiles.length === 1) {
      this.cli.displayInfo(`Using profile: ${profiles[0].name}`);
      return profiles[0];
    }

    const { selected } = await inquirer.prompt([{
      type: 'list',
      name: 'selected',
      message: 'Which profile is this interview for?',
      choices: profiles.map(p => ({
        name: `${p.name}, age ${p.age}  [${p.id}]`,
        value: p.id,
      })),
    }]);

    return profiles.find(p => p.id === selected)!;
  }

  private async collectMatchInformation(userId: string): Promise<MatchProfile> {
    this.cli.displayInfo("Now let's enter the match's details.");

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

    await this.matchManager.createMatchProfile(profile);
    this.cli.displaySuccess(`Match profile created for ${matchName}`);

    return profile;
  }

  private async runConversationLoop(
    sessionId: string,
    userId: string,
    matchProfile: MatchProfile,
    femaleProfile: ProfileMeta,
    preferences: string | null
  ): Promise<void> {
    // Build opening trigger — includes female preferences so AI tailors every question to her
    const prefSection = preferences
      ? `\n\n---\nHER PREFERENCES (use these to tailor every question and evaluation):\n${preferences}\n---`
      : '';

    const openingTrigger =
      `Female profile: ${femaleProfile.name}, age ${femaleProfile.age}${prefSection}\n\n` +
      `Match to interview: ${matchProfile.matchName}\n${matchProfile.matchInfo}\n\n` +
      `Generate 3-4 opening interview questions for ${matchProfile.matchName} based on her preferences. ` +
      `Also give an initial compatibility snapshot based on his profile alone.`;

    this.cli.displayLoading(`Generating opening questions for ${matchProfile.matchName}`);
    const opening = await this.engine.processUserInput(sessionId, openingTrigger);
    this.cli.displayConversation('AI', opening.message);

    while (await this.engine.canContinueConversation(sessionId)) {
      const session = await this.db.getSession(sessionId);
      if (!session) throw new Error('Session not found');

      this.cli.displayTurnCount(session.turnCount, session.maxTurns);

      const matchResponse = await this.cli.getUserInput(
        `What did ${matchProfile.matchName} say? (or "exit" to end)`
      );

      if (matchResponse.toLowerCase() === 'exit') break;

      this.cli.displayLoading('Analyzing response');
      const response = await this.engine.processUserInput(sessionId, matchResponse);
      this.cli.displayConversation('AI', response.message);
    }
  }
}
