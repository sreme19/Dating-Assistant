import { CustomPrompt, SessionMode, ValidationResult, ValidationError } from '../models/types.js';
import { DatabaseManager } from './manager.js';

/**
 * CustomPromptManager handles all custom prompt operations
 * 
 * Validates: Requirements 7, 14
 */
export class CustomPromptManager {
  private db: DatabaseManager;
  private readonly MAX_PROMPTS_PER_USER = 20;

  constructor(db: DatabaseManager) {
    this.db = db;
  }

  /**
   * Create a new custom prompt
   * 
   * @param prompt - Custom prompt to create
   * @returns Promise that resolves to the created prompt
   * @throws Error if creation fails or validation fails
   */
  async createCustomPrompt(prompt: CustomPrompt): Promise<CustomPrompt> {
    // Validate prompt
    const validation = this.validateCustomPrompt(prompt);
    if (!validation.isValid) {
      throw new Error(`Invalid custom prompt: ${validation.errors.map(e => e.message).join(', ')}`);
    }

    // Check if user already has 20 prompts
    const existingPrompts = await this.getCustomPrompts(prompt.userId, prompt.mode);
    if (existingPrompts.length >= this.MAX_PROMPTS_PER_USER) {
      throw new Error(`User has reached maximum of ${this.MAX_PROMPTS_PER_USER} custom prompts`);
    }

    // Check if name is unique for this user
    const existingWithName = existingPrompts.find(p => p.name === prompt.name);
    if (existingWithName) {
      throw new Error(`Custom prompt with name "${prompt.name}" already exists for this user`);
    }

    // Create the prompt in the database
    return new Promise((resolve, reject) => {
      const sql = `
        INSERT INTO custom_prompts (
          promptId, userId, name, content, mode, createdAt, updatedAt
        ) VALUES (?, ?, ?, ?, ?, ?, ?)
      `;

      this.db['db']?.run(
        sql,
        [
          prompt.promptId,
          prompt.userId,
          prompt.name,
          prompt.content,
          prompt.mode,
          prompt.createdAt.toISOString(),
          prompt.updatedAt.toISOString(),
        ],
        (err: any) => {
          if (err) {
            reject(new Error(`Failed to create custom prompt: ${err.message}`));
          } else {
            resolve(prompt);
          }
        }
      );
    });
  }

  /**
   * Get all custom prompts for a user and mode
   * 
   * @param userId - User ID
   * @param mode - Session mode (bestie or wingman)
   * @returns Promise that resolves to array of custom prompts
   */
  async getCustomPrompts(userId: string, mode: SessionMode): Promise<CustomPrompt[]> {
    return new Promise((resolve, reject) => {
      const sql = `
        SELECT * FROM custom_prompts 
        WHERE userId = ? AND mode = ?
        ORDER BY createdAt DESC
      `;

      this.db['db']?.all(sql, [userId, mode], (err: any, rows: any[]) => {
        if (err) {
          reject(new Error(`Failed to get custom prompts: ${err.message}`));
        } else {
          const prompts = (rows || []).map((row) => ({
            promptId: row.promptId,
            userId: row.userId,
            name: row.name,
            content: row.content,
            mode: row.mode as SessionMode,
            createdAt: new Date(row.createdAt),
            updatedAt: new Date(row.updatedAt),
          }));
          resolve(prompts);
        }
      });
    });
  }

  /**
   * Get a custom prompt by ID
   * 
   * @param promptId - Prompt ID
   * @returns Promise that resolves to the custom prompt or null
   */
  async getCustomPrompt(promptId: string): Promise<CustomPrompt | null> {
    return new Promise((resolve, reject) => {
      const sql = `SELECT * FROM custom_prompts WHERE promptId = ?`;

      this.db['db']?.get(sql, [promptId], (err: any, row: any) => {
        if (err) {
          reject(new Error(`Failed to get custom prompt: ${err.message}`));
        } else if (!row) {
          resolve(null);
        } else {
          resolve({
            promptId: row.promptId,
            userId: row.userId,
            name: row.name,
            content: row.content,
            mode: row.mode as SessionMode,
            createdAt: new Date(row.createdAt),
            updatedAt: new Date(row.updatedAt),
          });
        }
      });
    });
  }

  /**
   * Update a custom prompt
   * 
   * @param prompt - Custom prompt to update
   * @returns Promise that resolves to the updated prompt
   * @throws Error if update fails or validation fails
   */
  async updateCustomPrompt(prompt: CustomPrompt): Promise<CustomPrompt> {
    // Validate prompt
    const validation = this.validateCustomPrompt(prompt);
    if (!validation.isValid) {
      throw new Error(`Invalid custom prompt: ${validation.errors.map(e => e.message).join(', ')}`);
    }

    // Check if prompt exists
    const existing = await this.getCustomPrompt(prompt.promptId);
    if (!existing) {
      throw new Error('Custom prompt not found');
    }

    // Check if new name is unique (if name changed)
    if (existing.name !== prompt.name) {
      const existingPrompts = await this.getCustomPrompts(prompt.userId, prompt.mode);
      const existingWithName = existingPrompts.find(p => p.name === prompt.name);
      if (existingWithName) {
        throw new Error(`Custom prompt with name "${prompt.name}" already exists for this user`);
      }
    }

    return new Promise((resolve, reject) => {
      const sql = `
        UPDATE custom_prompts SET
          name = ?, content = ?, updatedAt = ?
        WHERE promptId = ?
      `;

      this.db['db']?.run(
        sql,
        [
          prompt.name,
          prompt.content,
          prompt.updatedAt.toISOString(),
          prompt.promptId,
        ],
        (err: any) => {
          if (err) {
            reject(new Error(`Failed to update custom prompt: ${err.message}`));
          } else {
            resolve(prompt);
          }
        }
      );
    });
  }

  /**
   * Delete a custom prompt
   * 
   * @param promptId - Prompt ID
   * @returns Promise that resolves when prompt is deleted
   */
  async deleteCustomPrompt(promptId: string): Promise<void> {
    return new Promise((resolve, reject) => {
      const sql = `DELETE FROM custom_prompts WHERE promptId = ?`;

      this.db['db']?.run(sql, [promptId], (err: any) => {
        if (err) {
          reject(new Error(`Failed to delete custom prompt: ${err.message}`));
        } else {
          resolve();
        }
      });
    });
  }

  /**
   * Validate a custom prompt
   * 
   * @param prompt - Custom prompt to validate
   * @returns Validation result
   */
  private validateCustomPrompt(prompt: any): ValidationResult {
    const errors: ValidationError[] = [];

    if (!prompt.promptId || typeof prompt.promptId !== 'string') {
      errors.push({ field: 'promptId', message: 'promptId must be a non-empty string' });
    }

    if (!prompt.userId || typeof prompt.userId !== 'string') {
      errors.push({ field: 'userId', message: 'userId must be a non-empty string' });
    }

    if (!prompt.name || typeof prompt.name !== 'string') {
      errors.push({ field: 'name', message: 'name must be a non-empty string' });
    }

    if (!prompt.content || typeof prompt.content !== 'string') {
      errors.push({ field: 'content', message: 'content must be a non-empty string' });
    }

    if (!prompt.mode || !['bestie', 'wingman'].includes(prompt.mode)) {
      errors.push({ field: 'mode', message: 'mode must be either "bestie" or "wingman"' });
    }

    if (!(prompt.createdAt instanceof Date)) {
      errors.push({ field: 'createdAt', message: 'createdAt must be a valid Date' });
    }

    if (!(prompt.updatedAt instanceof Date)) {
      errors.push({ field: 'updatedAt', message: 'updatedAt must be a valid Date' });
    }

    return {
      isValid: errors.length === 0,
      errors,
    };
  }
}
