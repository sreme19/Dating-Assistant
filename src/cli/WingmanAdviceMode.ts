import { randomUUID } from 'crypto';
import { existsSync, mkdirSync, readdirSync, readFileSync, writeFileSync } from 'fs';
import { join, resolve, dirname } from 'path';
import { fileURLToPath } from 'url';
import inquirer from 'inquirer';
import { CLIManager } from './CLIManager.js';
import { ConversationEngine } from '../engine/ConversationEngine.js';
import { DatabaseManager } from '../database/manager.js';
import { SessionMode } from '../models/types.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const PROJECT_ROOT = resolve(__dirname, '../..');
const MALE_PROFILES_DIR = join(PROJECT_ROOT, 'male_profiles');

interface MaleProfileMeta {
  id: string;
  name: string;
  info: string;
  createdAt?: string;
  updatedAt?: string;
}

function loadMaleProfiles(): MaleProfileMeta[] {
  if (!existsSync(MALE_PROFILES_DIR)) return [];
  return readdirSync(MALE_PROFILES_DIR, { withFileTypes: true })
    .filter(d => d.isDirectory())
    .flatMap(d => {
      try {
        return [JSON.parse(readFileSync(join(MALE_PROFILES_DIR, d.name, 'profile.json'), 'utf-8')) as MaleProfileMeta];
      } catch {
        return [];
      }
    });
}

function loadPersonality(profileId: string): string | null {
  const mdPath = join(MALE_PROFILES_DIR, profileId, 'personality.md');
  if (!existsSync(mdPath)) return null;
  return readFileSync(mdPath, 'utf-8');
}

export class WingmanAdviceMode {
  private cli: CLIManager;
  private engine: ConversationEngine;
  private db: DatabaseManager;

  constructor(cli: CLIManager, engine: ConversationEngine, db: DatabaseManager) {
    this.cli = cli;
    this.engine = engine;
    this.db = db;
  }

  async run(userId: string): Promise<void> {
    try {
      this.cli.clearScreen();

      // Step 1: pick or create male profile
      const maleProfile = await this.selectOrCreateMaleProfile();
      const personality = loadPersonality(maleProfile.id);

      if (personality) {
        this.cli.displaySuccess(`Loaded profile for ${maleProfile.name}`);
      } else {
        this.cli.displayInfo(`No interview history found for ${maleProfile.name} yet. Advice will be general.`);
      }

      // Step 2: start session
      const session = await this.engine.initializeSession(userId, SessionMode.WINGMAN);
      this.cli.displaySuccess('Wingman session started');
      this.cli.displayInfo(`Session ID: ${session.sessionId}`);

      // Step 3: inject profile as context on turn 1 if available
      if (personality) {
        this.cli.displayLoading('Loading your profile into context');
        const contextTrigger =
          `Here is my profile based on how I came across in a past interview:\n\n${personality}\n\n` +
          `Use this as context for all advice you give me today.`;
        const ack = await this.engine.processUserInput(session.sessionId, contextTrigger);
        this.cli.displayConversation('AI', ack.message);
      }

      // Step 4: advice loop
      await this.runConversationLoop(session.sessionId, maleProfile.name);

      const summary = await this.engine.finalizeSession(session.sessionId);
      this.cli.displaySessionSummary(summary);
    } catch (error) {
      await this.cli.displayError(error instanceof Error ? error.message : String(error));
    }
  }

  private async selectOrCreateMaleProfile(): Promise<MaleProfileMeta> {
    const profiles = loadMaleProfiles();

    if (profiles.length === 0) {
      this.cli.displayInfo("No profiles found. Let's create one.");
      return this.createNewMaleProfile();
    }

    const choices = [
      ...profiles.map(p => ({
        name: `${p.name}  [${p.id}]`,
        value: p.id,
      })),
      { name: '+ New profile', value: '__new__' },
    ];

    const { selected } = await inquirer.prompt([{
      type: 'list',
      name: 'selected',
      message: 'Select your profile or create a new one:',
      choices,
    }]);

    if (selected === '__new__') return this.createNewMaleProfile();
    return profiles.find(p => p.id === selected)!;
  }

  private async createNewMaleProfile(): Promise<MaleProfileMeta> {
    const name = await this.cli.getUserInput('Your name');
    const age = await this.cli.getUserInput('Your age');
    const occupation = await this.cli.getUserInput('Your occupation');

    const shortCode = randomUUID().replace(/-/g, '').slice(0, 6);
    const id = `${name.toLowerCase().replace(/\s+/g, '_')}_${shortCode}`;
    const info = `Age: ${age}\nOccupation: ${occupation}`;

    const profileDir = join(MALE_PROFILES_DIR, id);
    mkdirSync(join(profileDir, 'interviews'), { recursive: true });

    const meta: MaleProfileMeta = { id, name, info, createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() };
    writeFileSync(join(profileDir, 'profile.json'), JSON.stringify(meta, null, 2));

    this.cli.displaySuccess(`Profile created → male_profiles/${id}/`);
    return meta;
  }

  private async runConversationLoop(sessionId: string, name: string): Promise<void> {
    while (await this.engine.canContinueConversation(sessionId)) {
      const session = await this.db.getSession(sessionId);
      if (!session) throw new Error('Session not found');

      this.cli.displayTurnCount(session.turnCount, session.maxTurns);

      const userInput = await this.cli.getUserInput('Your question or situation (or "exit" to end)');
      if (userInput.toLowerCase() === 'exit') break;

      this.cli.displayLoading('Generating advice');
      const response = await this.engine.processUserInput(sessionId, userInput);
      this.cli.displayConversation('AI', response.message);
    }
  }
}
