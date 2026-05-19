import { randomUUID } from 'crypto';
import { existsSync, mkdirSync, readdirSync, readFileSync, writeFileSync, appendFileSync } from 'fs';
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
const PROFILES_DIR = join(PROJECT_ROOT, 'female_profiles');
const MALE_PROFILES_DIR = join(PROJECT_ROOT, 'male_profiles');

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
      const interviewLogPath = await this.runConversationLoop(session.sessionId, userId, matchProfile, femaleProfile, preferences);

      const summary = await this.engine.finalizeSession(session.sessionId);
      this.cli.displaySessionSummary(summary);

      // Step 5: offer to save a male profile
      await this.offerSaveMaleProfile(matchProfile, femaleProfile.name, interviewLogPath);
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

    const existingMales = this.loadMaleProfiles();
    let profile: MatchProfile;

    if (existingMales.length > 0) {
      const choices = [
        ...existingMales.map(p => ({
          name: `${p.name}  [${p.id}]`,
          value: p.id,
        })),
        { name: '+ Create new profile', value: '__new__' },
      ];

      const { selected } = await inquirer.prompt([{
        type: 'list',
        name: 'selected',
        message: 'Select an existing male profile or create a new one:',
        choices,
      }]);

      if (selected === '__new__') {
        profile = await this.createNewMatchProfile(userId);
      } else {
        const maleProfile = existingMales.find(p => p.id === selected)!;
        profile = {
          matchId: randomUUID(),
          userId,
          matchName: maleProfile.name,
          matchInfo: maleProfile.info,
          createdAt: new Date(),
          updatedAt: new Date(),
          interviewSessions: [],
        };
        await this.matchManager.createMatchProfile(profile);
        this.cli.displaySuccess(`Using profile for ${maleProfile.name}`);
      }
    } else {
      profile = await this.createNewMatchProfile(userId);
    }

    return profile;
  }

  private async createNewMatchProfile(userId: string): Promise<MatchProfile> {
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

  private makeInterviewDir(femaleProfileId: string, matchName: string): string {
    const date = new Date().toISOString().slice(0, 10);
    const slug = matchName.toLowerCase().replace(/\s+/g, '_');
    const dir = join(PROFILES_DIR, femaleProfileId, 'interviews', `${slug}_${date}`);
    mkdirSync(dir, { recursive: true });
    return dir;
  }

  private appendToLog(logPath: string, speaker: string, text: string): void {
    const line = `\n### ${speaker}\n${text}\n`;
    appendFileSync(logPath, line);
  }

  private async runConversationLoop(
    sessionId: string,
    userId: string,
    matchProfile: MatchProfile,
    femaleProfile: ProfileMeta,
    preferences: string | null
  ): Promise<string> {
    // Set up interview log file
    const interviewDir = this.makeInterviewDir(femaleProfile.id, matchProfile.matchName);
    const logPath = join(interviewDir, 'conversation.md');
    const header =
      `# Interview — ${matchProfile.matchName}\n` +
      `**Profile:** ${femaleProfile.name} (${femaleProfile.id})\n` +
      `**Date:** ${new Date().toLocaleString()}\n` +
      `**Match:** ${matchProfile.matchName}, ${matchProfile.matchInfo.replace(/\n/g, ' | ')}\n\n---\n`;
    writeFileSync(logPath, header);

    const prefSection = preferences
      ? `\n\n---\nHER PREFERENCES:\n${preferences}\n---`
      : '';

    const openingTrigger =
      `Female profile: ${femaleProfile.name}, age ${femaleProfile.age}${prefSection}\n\n` +
      `Match to interview: ${matchProfile.matchName}\n${matchProfile.matchInfo}\n\n` +
      `Give a one-sentence initial compatibility note based on his profile, then ask your FIRST single question.`;

    this.cli.displayLoading(`Starting interview with ${matchProfile.matchName}`);
    const opening = await this.engine.processUserInput(sessionId, openingTrigger);
    this.cli.displayConversation('AI', opening.message);
    this.appendToLog(logPath, 'AI Bestie', opening.message);

    while (await this.engine.canContinueConversation(sessionId)) {
      const session = await this.db.getSession(sessionId);
      if (!session) throw new Error('Session not found');

      this.cli.displayTurnCount(session.turnCount, session.maxTurns);

      const matchResponse = await this.cli.getUserInput(
        `What did ${matchProfile.matchName} say? (or "exit" to end)`
      );

      if (matchResponse.toLowerCase() === 'exit') break;

      this.appendToLog(logPath, matchProfile.matchName, matchResponse);

      this.cli.displayLoading('Analyzing response');
      const response = await this.engine.processUserInput(sessionId, matchResponse);
      this.cli.displayConversation('AI', response.message);
      this.appendToLog(logPath, 'AI Bestie', response.message);
    }

    this.cli.displaySuccess(`Conversation saved → ${interviewDir}`);
    return logPath;
  }

  private async offerSaveMaleProfile(
    matchProfile: MatchProfile,
    interviewedBy: string,
    logPath: string
  ): Promise<void> {
    const { save } = await inquirer.prompt([{
      type: 'confirm',
      name: 'save',
      message: `Save a profile for ${matchProfile.matchName}?`,
      default: true,
    }]);
    if (!save) return;

    // Build or find profile ID
    const existingProfiles = this.loadMaleProfiles();
    let maleProfileId: string;

    const match = existingProfiles.find(
      p => p.name.toLowerCase() === matchProfile.matchName.toLowerCase()
    );

    if (match) {
      maleProfileId = match.id;
      this.cli.displayInfo(`Updating existing profile for ${matchProfile.matchName}`);
    } else {
      const shortCode = randomUUID().replace(/-/g, '').slice(0, 6);
      maleProfileId = `${matchProfile.matchName.toLowerCase().replace(/\s+/g, '_')}_${shortCode}`;
    }

    const profileDir = join(MALE_PROFILES_DIR, maleProfileId);
    const interviewsDir = join(profileDir, 'interviews');
    mkdirSync(interviewsDir, { recursive: true });

    // Write profile.json
    const meta = {
      id: maleProfileId,
      name: matchProfile.matchName,
      info: matchProfile.matchInfo,
      createdAt: match ? undefined : new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    writeFileSync(join(profileDir, 'profile.json'), JSON.stringify(meta, null, 2));

    // Copy interview log into his folder
    const interviewCopyName = `${interviewedBy.toLowerCase().replace(/\s+/g, '_')}_${new Date().toISOString().slice(0, 10)}.md`;
    const logContent = readFileSync(logPath, 'utf-8');
    writeFileSync(join(interviewsDir, interviewCopyName), logContent);

    // Synthesize personality.md via Claude
    this.cli.displayLoading(`Synthesizing ${matchProfile.matchName}'s personality profile`);
    try {
      const personality = await this.engine.synthesizeMalePersonality(
        logContent,
        matchProfile.matchName,
        matchProfile.matchInfo
      );
      writeFileSync(join(profileDir, 'personality.md'), personality);
      this.cli.displaySuccess(`Male profile saved → male_profiles/${maleProfileId}/`);
    } catch (err) {
      this.cli.displayInfo('Could not synthesize personality (API error) — profile saved without it.');
    }
  }

  private loadMaleProfiles(): Array<{ id: string; name: string; info: string }> {
    if (!existsSync(MALE_PROFILES_DIR)) return [];
    return readdirSync(MALE_PROFILES_DIR, { withFileTypes: true })
      .filter(d => d.isDirectory())
      .flatMap(d => {
        try {
          const meta = JSON.parse(readFileSync(join(MALE_PROFILES_DIR, d.name, 'profile.json'), 'utf-8'));
          return [{ id: meta.id, name: meta.name, info: meta.info || '' }];
        } catch {
          return [];
        }
      });
  }
}
