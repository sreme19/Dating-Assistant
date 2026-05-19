import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { randomUUID } from 'crypto';
import { DatabaseManager } from './manager.js';
import { MatchProfileManager } from './MatchProfileManager.js';
import { MatchProfile } from '../models/types.js';
import { initializeDatabase } from './init.js';
import { join } from 'path';
import { unlinkSync } from 'fs';

describe('MatchProfileManager', () => {
  let db: DatabaseManager;
  let manager: MatchProfileManager;
  let testDbPath: string;
  let userId: string;

  beforeEach(async () => {
    testDbPath = join('/tmp', `test-db-${randomUUID()}.db`);
    db = new DatabaseManager(testDbPath);
    await initializeDatabase(testDbPath);
    manager = new MatchProfileManager(db);
    userId = randomUUID();

    // Create a test user
    await db.createUserProfile({
      userId,
      mode: 'female',
      username: 'test_user',
      createdAt: new Date(),
      updatedAt: new Date(),
      metadata: {},
    });
  });

  afterEach(async () => {
    await db.close();
    try {
      unlinkSync(testDbPath);
    } catch {
      // Ignore cleanup errors
    }
  });

  describe('createMatchProfile', () => {
    it('should create a match profile', async () => {
      const profile: MatchProfile = {
        matchId: randomUUID(),
        userId,
        matchName: 'John',
        matchInfo: 'Age: 30, Occupation: Engineer',
        createdAt: new Date(),
        updatedAt: new Date(),
        interviewSessions: [],
      };

      const created = await manager.createMatchProfile(profile);
      expect(created.matchId).toBe(profile.matchId);
      expect(created.matchName).toBe('John');
    });

    it('should validate required fields', async () => {
      const invalidProfile: any = {
        matchId: randomUUID(),
        userId,
        matchName: '',
        matchInfo: 'Age: 30',
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      await expect(manager.createMatchProfile(invalidProfile)).rejects.toThrow();
    });
  });

  describe('getMatchProfile', () => {
    it('should retrieve a match profile', async () => {
      const profile: MatchProfile = {
        matchId: randomUUID(),
        userId,
        matchName: 'John',
        matchInfo: 'Age: 30, Occupation: Engineer',
        createdAt: new Date(),
        updatedAt: new Date(),
        interviewSessions: [],
      };

      await manager.createMatchProfile(profile);
      const retrieved = await manager.getMatchProfile(profile.matchId);

      expect(retrieved).not.toBeNull();
      expect(retrieved?.matchName).toBe('John');
    });

    it('should return null for non-existent profile', async () => {
      const retrieved = await manager.getMatchProfile(randomUUID());
      expect(retrieved).toBeNull();
    });
  });

  describe('listMatchProfiles', () => {
    it('should list all match profiles for a user', async () => {
      const profile1: MatchProfile = {
        matchId: randomUUID(),
        userId,
        matchName: 'John',
        matchInfo: 'Age: 30',
        createdAt: new Date(),
        updatedAt: new Date(),
        interviewSessions: [],
      };

      const profile2: MatchProfile = {
        matchId: randomUUID(),
        userId,
        matchName: 'Jane',
        matchInfo: 'Age: 28',
        createdAt: new Date(),
        updatedAt: new Date(),
        interviewSessions: [],
      };

      await manager.createMatchProfile(profile1);
      await manager.createMatchProfile(profile2);

      const profiles = await manager.listMatchProfiles(userId);
      expect(profiles).toHaveLength(2);
    });

    it('should return empty array if no profiles exist', async () => {
      const profiles = await manager.listMatchProfiles(userId);
      expect(profiles).toHaveLength(0);
    });
  });

  describe('updateMatchProfile', () => {
    it('should update a match profile', async () => {
      const profile: MatchProfile = {
        matchId: randomUUID(),
        userId,
        matchName: 'John',
        matchInfo: 'Age: 30',
        createdAt: new Date(),
        updatedAt: new Date(),
        interviewSessions: [],
      };

      await manager.createMatchProfile(profile);

      profile.matchInfo = 'Age: 31, Occupation: Senior Engineer';
      profile.updatedAt = new Date();

      const updated = await manager.updateMatchProfile(profile);
      expect(updated.matchInfo).toContain('Senior Engineer');
    });
  });

  describe('deleteMatchProfile', () => {
    it('should delete a match profile', async () => {
      const profile: MatchProfile = {
        matchId: randomUUID(),
        userId,
        matchName: 'John',
        matchInfo: 'Age: 30',
        createdAt: new Date(),
        updatedAt: new Date(),
        interviewSessions: [],
      };

      await manager.createMatchProfile(profile);
      await manager.deleteMatchProfile(profile.matchId);

      const retrieved = await manager.getMatchProfile(profile.matchId);
      expect(retrieved).toBeNull();
    });
  });
});
