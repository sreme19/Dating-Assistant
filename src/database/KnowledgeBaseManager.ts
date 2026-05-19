import { KnowledgeBase, KBType, ValidationResult, ValidationError } from '../models/types.js';
import { DatabaseManager } from './manager.js';

/**
 * KnowledgeBaseManager handles all knowledge base operations
 * 
 * Validates: Requirements 8, 14
 */
export class KnowledgeBaseManager {
  private db: DatabaseManager;

  constructor(db: DatabaseManager) {
    this.db = db;
  }

  /**
   * Create a new knowledge base
   * 
   * @param kb - Knowledge base to create
   * @returns Promise that resolves to the created KB
   * @throws Error if creation fails or validation fails
   */
  async createKnowledgeBase(kb: KnowledgeBase): Promise<KnowledgeBase> {
    // Validate KB
    const validation = this.validateKnowledgeBase(kb);
    if (!validation.isValid) {
      throw new Error(`Invalid knowledge base: ${validation.errors.map(e => e.message).join(', ')}`);
    }

    return new Promise((resolve, reject) => {
      const sql = `
        INSERT INTO knowledge_bases (
          kbId, userId, type, content, sourceData, createdAt, updatedAt, version
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?)
      `;

      this.db['db']?.run(
        sql,
        [
          kb.kbId,
          kb.userId || null,
          kb.type,
          kb.content,
          JSON.stringify(kb.sourceData),
          kb.createdAt.toISOString(),
          kb.updatedAt.toISOString(),
          kb.version,
        ],
        (err: any) => {
          if (err) {
            reject(new Error(`Failed to create knowledge base: ${err.message}`));
          } else {
            resolve(kb);
          }
        }
      );
    });
  }

  /**
   * Get a knowledge base by ID
   * 
   * @param kbId - Knowledge base ID
   * @returns Promise that resolves to the KB or null
   */
  async getKnowledgeBase(kbId: string): Promise<KnowledgeBase | null> {
    return new Promise((resolve, reject) => {
      const sql = `SELECT * FROM knowledge_bases WHERE kbId = ?`;

      this.db['db']?.get(sql, [kbId], (err: any, row: any) => {
        if (err) {
          reject(new Error(`Failed to get knowledge base: ${err.message}`));
        } else if (!row) {
          resolve(null);
        } else {
          resolve({
            kbId: row.kbId,
            userId: row.userId,
            type: row.type as KBType,
            content: row.content,
            sourceData: JSON.parse(row.sourceData),
            createdAt: new Date(row.createdAt),
            updatedAt: new Date(row.updatedAt),
            version: row.version,
          });
        }
      });
    });
  }

  /**
   * Get a knowledge base by user ID and type
   * 
   * @param userId - User ID (null for global KBs)
   * @param type - Knowledge base type
   * @returns Promise that resolves to the KB or null
   */
  async getKnowledgeBaseByUserAndType(userId: string | null, type: KBType): Promise<KnowledgeBase | null> {
    return new Promise((resolve, reject) => {
      let sql = `SELECT * FROM knowledge_bases WHERE type = ?`;
      const params: any[] = [type];

      if (userId) {
        sql += ` AND userId = ?`;
        params.push(userId);
      } else {
        sql += ` AND userId IS NULL`;
      }

      this.db['db']?.get(sql, params, (err: any, row: any) => {
        if (err) {
          reject(new Error(`Failed to get knowledge base: ${err.message}`));
        } else if (!row) {
          resolve(null);
        } else {
          resolve({
            kbId: row.kbId,
            userId: row.userId,
            type: row.type as KBType,
            content: row.content,
            sourceData: JSON.parse(row.sourceData),
            createdAt: new Date(row.createdAt),
            updatedAt: new Date(row.updatedAt),
            version: row.version,
          });
        }
      });
    });
  }

  /**
   * Update a knowledge base
   * 
   * @param kb - Knowledge base to update
   * @returns Promise that resolves to the updated KB
   * @throws Error if update fails or validation fails
   */
  async updateKnowledgeBase(kb: KnowledgeBase): Promise<KnowledgeBase> {
    // Validate KB
    const validation = this.validateKnowledgeBase(kb);
    if (!validation.isValid) {
      throw new Error(`Invalid knowledge base: ${validation.errors.map(e => e.message).join(', ')}`);
    }

    // Check if KB exists
    const existing = await this.getKnowledgeBase(kb.kbId);
    if (!existing) {
      throw new Error('Knowledge base not found');
    }

    return new Promise((resolve, reject) => {
      const sql = `
        UPDATE knowledge_bases SET
          content = ?, sourceData = ?, updatedAt = ?, version = ?
        WHERE kbId = ?
      `;

      this.db['db']?.run(
        sql,
        [
          kb.content,
          JSON.stringify(kb.sourceData),
          kb.updatedAt.toISOString(),
          kb.version,
          kb.kbId,
        ],
        (err: any) => {
          if (err) {
            reject(new Error(`Failed to update knowledge base: ${err.message}`));
          } else {
            resolve(kb);
          }
        }
      );
    });
  }

  /**
   * Delete a knowledge base
   * 
   * @param kbId - Knowledge base ID
   * @returns Promise that resolves when KB is deleted
   */
  async deleteKnowledgeBase(kbId: string): Promise<void> {
    return new Promise((resolve, reject) => {
      const sql = `DELETE FROM knowledge_bases WHERE kbId = ?`;

      this.db['db']?.run(sql, [kbId], (err: any) => {
        if (err) {
          reject(new Error(`Failed to delete knowledge base: ${err.message}`));
        } else {
          resolve();
        }
      });
    });
  }

  /**
   * Format a knowledge base for inclusion in a prompt
   * 
   * @param kb - Knowledge base to format
   * @returns Formatted KB content as string
   */
  formatKBForPrompt(kb: KnowledgeBase): string {
    // Simple formatting: just return the content
    // In a real implementation, this could do more sophisticated formatting
    return kb.content;
  }

  /**
   * Validate a knowledge base
   * 
   * @param kb - Knowledge base to validate
   * @returns Validation result
   */
  private validateKnowledgeBase(kb: any): ValidationResult {
    const errors: ValidationError[] = [];

    if (!kb.kbId || typeof kb.kbId !== 'string') {
      errors.push({ field: 'kbId', message: 'kbId must be a non-empty string' });
    }

    if (kb.userId !== null && kb.userId !== undefined && typeof kb.userId !== 'string') {
      errors.push({ field: 'userId', message: 'userId must be a string or null' });
    }

    if (!kb.type || !['female_preferences', 'dating_expertise'].includes(kb.type)) {
      errors.push({ field: 'type', message: 'type must be either "female_preferences" or "dating_expertise"' });
    }

    if (!kb.content || typeof kb.content !== 'string') {
      errors.push({ field: 'content', message: 'content must be a non-empty string' });
    }

    if (typeof kb.sourceData !== 'object' || kb.sourceData === null) {
      errors.push({ field: 'sourceData', message: 'sourceData must be an object' });
    }

    if (!(kb.createdAt instanceof Date)) {
      errors.push({ field: 'createdAt', message: 'createdAt must be a valid Date' });
    }

    if (!(kb.updatedAt instanceof Date)) {
      errors.push({ field: 'updatedAt', message: 'updatedAt must be a valid Date' });
    }

    if (typeof kb.version !== 'number' || kb.version < 1) {
      errors.push({ field: 'version', message: 'version must be a number >= 1' });
    }

    return {
      isValid: errors.length === 0,
      errors,
    };
  }
}
