import path from 'path';
import { fileURLToPath } from 'url';
import { homedir } from 'os';

/**
 * ConfigLoader handles configuration management
 * 
 * Validates: Requirements 23, 16
 */
export class ConfigLoader {
  private static instance: ConfigLoader;
  private config: Record<string, any> = {};

  private constructor() {
    this.loadConfiguration();
  }

  /**
   * Get singleton instance
   */
  static getInstance(): ConfigLoader {
    if (!ConfigLoader.instance) {
      ConfigLoader.instance = new ConfigLoader();
    }
    return ConfigLoader.instance;
  }

  /**
   * Load configuration from environment and files
   */
  private loadConfiguration(): void {
    // Load Claude API key
    const apiKey = process.env.ANTHROPIC_API_KEY;
    if (!apiKey) {
      throw new Error('ANTHROPIC_API_KEY environment variable is not set');
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
