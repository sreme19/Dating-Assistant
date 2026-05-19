import { MatchProfile, ValidationResult, ValidationError } from '../models/types.js';
import { DatabaseManager } from './manager.js';

/**
 * MatchProfileManager handles all match profile operations
 * 
 * Validates: Requirements 12, 14
 */
export class MatchProfileManager {
  private db: DatabaseManager;

  constructor(db: DatabaseManager) {
    this.db = db;
  }

  /**
   * Create a new match profile
   * 
   * @param profile - Match profile to create
   * @returns Promise that resolves to the created profile
   * @throws Error if creation fails or validation fails
   */
  async createMatchProfile(profile: MatchProfile): Promise<MatchProfile> {
    // Validate profile
    const validation = this.validateMatchProfile(profile);
    if (!validation.isValid) {
      throw new Error(`Invalid match profile: ${validation.errors.map(e => e.message).join(', ')}`);
    }

    return new Promise((resolve, reject) => {
      const sql = `
        INSERT INTO matches (
          matchId, userId, matchName, matchInfo, createdAt, updatedAt
        ) VALUES (?, ?, ?, ?, ?, ?)
      `;

      this.db['db']?.run(
        sql,
        [
          profile.matchId,
          profile.userId,
          profile.matchName,
          profile.matchInfo,
          profile.createdAt.toISOString(),
          profile.updatedAt.toISOString(),
        ],
        (err: any) => {
          if (err) {
            reject(new Error(`Failed to create match profile: ${err.message}`));
          } else {
            resolve(profile);
          }
        }
      );
    });
  }

  /**
   * Get a match profile by ID
   * 
   * @param matchId - Match ID
   * @returns Promise that resolves to the match profile or null
   */
  async getMatchProfile(matchId: string): Promise<MatchProfile | null> {
    return new Promise((resolve, reject) => {
      const sql = `SELECT * FROM matches WHERE matchId = ?`;

      this.db['db']?.get(sql, [matchId], (err: any, row: any) => {
        if (err) {
          reject(new Error(`Failed to get match profile: ${err.message}`));
        } else if (!row) {
          resolve(null);
        } else {
          resolve({
            matchId: row.matchId,
            userId: row.userId,
            matchName: row.matchName,
            matchInfo: row.matchInfo,
            createdAt: new Date(row.createdAt),
            updatedAt: new Date(row.updatedAt),
            interviewSessions: [],
          });
        }
      });
    });
  }

  /**
   * Get a match profile with all associated interview sessions
   * 
   * @param matchId - Match ID
   * @returns Promise that resolves to the match profile with sessions or null
   */
  async getMatchProfileWithSessions(matchId: string): Promise<MatchProfile | null> {
    const profile = await this.getMatchProfile(matchId);
    if (!profile) {
      return null;
    }

    // Get all interview sessions for this match
    return new Promise((resolve, reject) => {
      const sql = `
        SELECT sessionId FROM sessions 
        WHERE matchId = ? 
        ORDER BY createdAt DESC
      `;

      this.db['db']?.all(sql, [matchId], (err: any, rows: any[]) => {
        if (err) {
          reject(new Error(`Failed to get interview sessions: ${err.message}`));
        } else {
          profile.interviewSessions = (rows || []).map(row => row.sessionId);
          resolve(profile);
        }
      });
    });
  }

  /**
   * List all match profiles for a user
   * 
   * @param userId - User ID
   * @returns Promise that resolves to array of match profiles
   */
  async listMatchProfiles(userId: string): Promise<MatchProfile[]> {
    return new Promise((resolve, reject) => {
      const sql = `
        SELECT * FROM matches 
        WHERE userId = ?
        ORDER BY createdAt DESC
      `;

      this.db['db']?.all(sql, [userId], (err: any, rows: any[]) => {
        if (err) {
          reject(new Error(`Failed to list match profiles: ${err.message}`));
        } else {
          const profiles = (rows || []).map((row) => ({
            matchId: row.matchId,
            userId: row.userId,
            matchName: row.matchName,
            matchInfo: row.matchInfo,
            createdAt: new Date(row.createdAt),
            updatedAt: new Date(row.updatedAt),
            interviewSessions: [],
          }));
          resolve(profiles);
        }
      });
    });
  }

  /**
   * List all match profiles for a user with their interview sessions
   * 
   * @param userId - User ID
   * @returns Promise that resolves to array of match profiles with sessions
   */
  async listMatchProfilesWithSessions(userId: string): Promise<MatchProfile[]> {
    const profiles = await this.listMatchProfiles(userId);
    
    // Load interview sessions for each profile
    const profilesWithSessions = await Promise.all(
      profiles.map(async (profile) => {
        return new Promise<MatchProfile>((resolve, reject) => {
          const sql = `
            SELECT sessionId FROM sessions 
            WHERE matchId = ? 
            ORDER BY createdAt DESC
          `;

          this.db['db']?.all(sql, [profile.matchId], (err: any, rows: any[]) => {
            if (err) {
              reject(new Error(`Failed to get interview sessions: ${err.message}`));
            } else {
              profile.interviewSessions = (rows || []).map(row => row.sessionId);
              resolve(profile);
            }
          });
        });
      })
    );

    return profilesWithSessions;
  }

  /**
   * Update a match profile
   * 
   * @param profile - Match profile to update
   * @returns Promise that resolves to the updated profile
   * @throws Error if update fails or validation fails
   */
  async updateMatchProfile(profile: MatchProfile): Promise<MatchProfile> {
    // Validate profile
    const validation = this.validateMatchProfile(profile);
    if (!validation.isValid) {
      throw new Error(`Invalid match profile: ${validation.errors.map(e => e.message).join(', ')}`);
    }

    // Check if profile exists
    const existing = await this.getMatchProfile(profile.matchId);
    if (!existing) {
      throw new Error('Match profile not found');
    }

    return new Promise((resolve, reject) => {
      const sql = `
        UPDATE matches SET
          matchName = ?, matchInfo = ?, updatedAt = ?
        WHERE matchId = ?
      `;

      this.db['db']?.run(
        sql,
        [
          profile.matchName,
          profile.matchInfo,
          profile.updatedAt.toISOString(),
          profile.matchId,
        ],
        (err: any) => {
          if (err) {
            reject(new Error(`Failed to update match profile: ${err.message}`));
          } else {
            resolve(profile);
          }
        }
      );
    });
  }

  /**
   * Delete a match profile
   * 
   * @param matchId - Match ID
   * @returns Promise that resolves when profile is deleted
   */
  async deleteMatchProfile(matchId: string): Promise<void> {
    return new Promise((resolve, reject) => {
      const sql = `DELETE FROM matches WHERE matchId = ?`;

      this.db['db']?.run(sql, [matchId], (err: any) => {
        if (err) {
          reject(new Error(`Failed to delete match profile: ${err.message}`));
        } else {
          resolve();
        }
      });
    });
  }

  /**
   * Validate a match profile
   * 
   * @param profile - Match profile to validate
   * @returns Validation result
   */
  private validateMatchProfile(profile: any): ValidationResult {
    const errors: ValidationError[] = [];

    if (!profile.matchId || typeof profile.matchId !== 'string') {
      errors.push({ field: 'matchId', message: 'matchId must be a non-empty string' });
    }

    if (!profile.userId || typeof profile.userId !== 'string') {
      errors.push({ field: 'userId', message: 'userId must be a non-empty string' });
    }

    if (!profile.matchName || typeof profile.matchName !== 'string') {
      errors.push({ field: 'matchName', message: 'matchName must be a non-empty string' });
    }

    if (!profile.matchInfo || typeof profile.matchInfo !== 'string') {
      errors.push({ field: 'matchInfo', message: 'matchInfo must be a non-empty string' });
    }

    if (!(profile.createdAt instanceof Date)) {
      errors.push({ field: 'createdAt', message: 'createdAt must be a valid Date' });
    }

    if (!(profile.updatedAt instanceof Date)) {
      errors.push({ field: 'updatedAt', message: 'updatedAt must be a valid Date' });
    }

    return {
      isValid: errors.length === 0,
      errors,
    };
  }
}
