import { randomUUID } from 'crypto';
import { existsSync, mkdirSync, writeFileSync, readdirSync, readFileSync } from 'fs';
import { join, resolve, dirname } from 'path';
import { fileURLToPath } from 'url';
import inquirer from 'inquirer';
import { CLIManager } from './CLIManager.js';
import { ConversationEngine } from '../engine/ConversationEngine.js';
import { DatabaseManager } from '../database/manager.js';
import { KnowledgeBaseManager } from '../database/KnowledgeBaseManager.js';
import { SessionMode, BestieSubMode, KBType } from '../models/types.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const PROJECT_ROOT = resolve(__dirname, '../..');
const PROFILES_DIR = join(PROJECT_ROOT, 'female_profiles');

interface ProfileMeta {
  id: string;
  name: string;
  age: string;
  createdAt: string;
}

function makeProfileId(name: string): string {
  const shortCode = randomUUID().replace(/-/g, '').slice(0, 6);
  return `${name.toLowerCase().replace(/\s+/g, '_')}_${shortCode}`;
}

function loadExistingProfiles(): ProfileMeta[] {
  if (!existsSync(PROFILES_DIR)) return [];
  return readdirSync(PROFILES_DIR, { withFileTypes: true })
    .filter(d => d.isDirectory())
    .flatMap(d => {
      const metaPath = join(PROFILES_DIR, d.name, 'profile.json');
      try {
        return [JSON.parse(readFileSync(metaPath, 'utf-8')) as ProfileMeta];
      } catch {
        return [];
      }
    });
}

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

  async run(userId: string): Promise<void> {
    try {
      this.cli.clearScreen();

      // Step 1: pick existing profile or create new one
      const profile = await this.selectOrCreateProfile();
      const profileDir = join(PROFILES_DIR, profile.id);

      this.cli.displaySuccess(`Using profile: ${profile.name} (${profile.id})`);
      this.cli.displayInfo(`Folder: ${profileDir}`);
      this.cli.displayInfo('You can drop images, PDFs, or notes into that folder anytime.');

      // Step 2: preference conversation
      const session = await this.engine.initializeSession(
        userId,
        SessionMode.BESTIE,
        BestieSubMode.PREFERENCES
      );

      this.cli.displayInfo("Let's explore your dating preferences. Type \"done\" when finished.");

      const preferences = await this.runConversationLoop(session.sessionId, userId);

      // Step 3: append to preferences.md (or create it)
      const md = this.buildMarkdown(profile.name, profile.age, profile.id, preferences);
      writeFileSync(join(profileDir, 'preferences.md'), md);

      // Step 4: save to SQLite for AI use
      await this.saveToKnowledgeBase(userId, md, preferences);

      await this.engine.finalizeSession(session.sessionId);

      this.cli.displaySuccess('Preferences saved!');
      this.cli.displayInfo(`Profile folder: ${profileDir}`);
    } catch (error) {
      await this.cli.displayError(error instanceof Error ? error.message : String(error));
    }
  }

  private async selectOrCreateProfile(): Promise<ProfileMeta> {
    const existing = loadExistingProfiles();

    if (existing.length === 0) {
      this.cli.displayInfo("No profiles found. Let's create one.");
      return this.createNewProfile();
    }

    const choices = [
      ...existing.map(p => ({
        name: `${p.name}, ${p.age}  [${p.id}]`,
        value: p.id,
      })),
      { name: '+ Create new profile', value: '__new__' },
    ];

    const { selected } = await inquirer.prompt([{
      type: 'list',
      name: 'selected',
      message: 'Select a profile or create a new one:',
      choices,
    }]);

    if (selected === '__new__') return this.createNewProfile();

    return existing.find(p => p.id === selected)!;
  }

  private async createNewProfile(): Promise<ProfileMeta> {
    const name = await this.cli.getUserInput('Your name');
    const age = await this.cli.getUserInput('Your age');
    const id = makeProfileId(name);
    const profileDir = join(PROFILES_DIR, id);

    mkdirSync(profileDir, { recursive: true });

    const meta: ProfileMeta = { id, name, age, createdAt: new Date().toISOString() };
    writeFileSync(join(profileDir, 'profile.json'), JSON.stringify(meta, null, 2));

    return meta;
  }

  private async runConversationLoop(sessionId: string, userId: string): Promise<string[]> {
    const preferences: string[] = [];

    this.cli.displayLoading('Starting preference session');
    const opening = await this.engine.processUserInput(
      sessionId,
      'Please ask me your first question about my dating preferences.'
    );
    this.cli.displayConversation('AI', opening.message);

    while (await this.engine.canContinueConversation(sessionId)) {
      const session = await this.db.getSession(sessionId);
      if (!session) throw new Error('Session not found');

      this.cli.displayTurnCount(session.turnCount, session.maxTurns);

      const userInput = await this.cli.getUserInput('Your response (or "done" to finish)');
      if (userInput.toLowerCase() === 'done') break;

      preferences.push(userInput);

      this.cli.displayLoading('Generating follow-up');
      const response = await this.engine.processUserInput(sessionId, userInput);
      this.cli.displayConversation('AI', response.message);
    }

    return preferences;
  }

  private buildMarkdown(name: string, age: string, profileId: string, preferences: string[]): string {
    const lines: string[] = [
      `# Dating Preferences — ${name}`,
      ``,
      `| Field | Value |`,
      `|---|---|`,
      `| Name | ${name} |`,
      `| Age | ${age} |`,
      `| Profile ID | \`${profileId}\` |`,
      `| Updated | ${new Date().toLocaleString()} |`,
      ``,
      `---`,
      ``,
      `## Preferences`,
      ``,
    ];

    preferences.forEach((p, i) => lines.push(`${i + 1}. ${p}`));

    lines.push('');
    lines.push('---');
    lines.push('');
    lines.push('> *Add images, PDFs, or notes to this folder for future reference.*');

    return lines.join('\n');
  }

  private async saveToKnowledgeBase(userId: string, content: string, preferences: string[]): Promise<void> {
    const existing = await this.kbManager.getKnowledgeBaseByUserAndType(userId, KBType.FEMALE_PREFERENCES);
    const sourceData = { preferences, synthesizedAt: new Date().toISOString() };

    if (existing) {
      existing.content = content;
      existing.sourceData = sourceData;
      existing.version += 1;
      existing.updatedAt = new Date();
      await this.kbManager.updateKnowledgeBase(existing);
    } else {
      await this.kbManager.createKnowledgeBase({
        kbId: randomUUID(),
        userId,
        type: KBType.FEMALE_PREFERENCES,
        content,
        sourceData,
        createdAt: new Date(),
        updatedAt: new Date(),
        version: 1,
      });
    }
  }
}
