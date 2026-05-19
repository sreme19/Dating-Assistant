import path from 'path';
import { fileURLToPath } from 'url';
import { homedir } from 'os';
import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'fs';

const CONFIG_DIR = path.join(homedir(), '.dating-assistant');
const CONFIG_FILE = path.join(CONFIG_DIR, 'config.json');

export class ConfigLoader {
  private static instance: ConfigLoader;
  private config: Record<string, any> = {};

  private constructor() {
    this.loadConfiguration();
  }

  static getInstance(): ConfigLoader {
    if (!ConfigLoader.instance) {
      ConfigLoader.instance = new ConfigLoader();
    }
    return ConfigLoader.instance;
  }

  /** Returns true if an API key is available (env or saved config), without throwing. */
  static hasApiKey(): boolean {
    if (process.env.ANTHROPIC_API_KEY) return true;
    try {
      if (existsSync(CONFIG_FILE)) {
        const saved = JSON.parse(readFileSync(CONFIG_FILE, 'utf-8'));
        return !!saved.anthropicApiKey;
      }
    } catch {}
    return false;
  }

  /** Persist the API key to ~/.dating-assistant/config.json for future runs. */
  static saveApiKey(key: string): void {
    if (!existsSync(CONFIG_DIR)) mkdirSync(CONFIG_DIR, { recursive: true });
    let existing: Record<string, any> = {};
    try {
      if (existsSync(CONFIG_FILE)) existing = JSON.parse(readFileSync(CONFIG_FILE, 'utf-8'));
    } catch {}
    writeFileSync(CONFIG_FILE, JSON.stringify({ ...existing, anthropicApiKey: key }, null, 2), { mode: 0o600 });
  }

  /** Reset the saved instance so the next getInstance() picks up a freshly saved key. */
  static reset(): void {
    ConfigLoader.instance = undefined as any;
  }

  private loadConfiguration(): void {
    // Priority: env var → saved config file
    let apiKey = process.env.ANTHROPIC_API_KEY;
    if (!apiKey && existsSync(CONFIG_FILE)) {
      try {
        const saved = JSON.parse(readFileSync(CONFIG_FILE, 'utf-8'));
        apiKey = saved.anthropicApiKey;
      } catch {}
    }
    if (!apiKey) {
      throw new Error('Anthropic API key not found. Run the app once to set it up.');
    }
    this.config.claudeApiKey = apiKey;

    // Load database path
    const dbPath = process.env.DB_PATH || path.join(homedir(), '.dating-assistant', 'data.db');
    this.config.dbPath = dbPath;

    // Load other configuration
    this.config.maxTurnsPerSession = 50;
    this.config.maxCustomPromptsPerUser = 20;
    this.config.apiTimeout = 30000; // ms
    this.config.maxRetries = 3;
  }

  /**
   * Get configuration value
   */
  get(key: string): any {
    return this.config[key];
  }

  /**
   * Get all configuration
   */
  getAll(): Record<string, any> {
    return { ...this.config };
  }

  /**
   * Validate configuration
   */
  validate(): boolean {
    const requiredKeys = ['claudeApiKey', 'dbPath'];
    for (const key of requiredKeys) {
      if (!this.config[key]) {
        throw new Error(`Missing required configuration: ${key}`);
      }
    }
    return true;
  }

  /**
   * Get Claude API key (secure)
   */
  getClaudeApiKey(): string {
    const key = this.config.claudeApiKey;
    if (!key) {
      throw new Error('Claude API key not configured');
    }
    return key;
  }

  /**
   * Get database path
   */
  getDatabasePath(): string {
    return this.config.dbPath;
  }

  /**
   * Get max turns per session
   */
  getMaxTurnsPerSession(): number {
    return this.config.maxTurnsPerSession;
  }

  /**
   * Get max custom prompts per user
   */
  getMaxCustomPromptsPerUser(): number {
    return this.config.maxCustomPromptsPerUser;
  }

  /**
   * Get API timeout
   */
  getApiTimeout(): number {
    return this.config.apiTimeout;
  }

  /**
   * Get max retries
   */
  getMaxRetries(): number {
    return this.config.maxRetries;
  }
}
