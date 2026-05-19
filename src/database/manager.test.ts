import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { DatabaseManager } from './manager.js';
import { initializeDatabase } from './init.js';
import {
  UserProfile,
  UserMode,
  Session,
  SessionMode,
  SessionStatus,
  BestieSubMode,
  MAX_TURNS_PER_SESSION,
} from '../models/types.js';
import { randomUUID } from 'crypto';
import { join } from 'path';
import { unlinkSync, existsSync } from 'fs';
import { tmpdir } from 'os';

/**
 * Test suite for DatabaseManager user profile persistence methods
 * Validates: Requirements 1, 14
 */
describe('DatabaseManager - User Profile Persistence', () => {
  let manager: DatabaseManager;
  let testDbPath: string;

  beforeEach(async () => {
    // Create a temporary database for testing
    testDbPath = join(tmpdir(), `test-db-${randomUUID()}.db`);
    await initializeDatabase(testDbPath);
    manager = new DatabaseManager(testDbPath);
  });

  afterEach(async () => {
    // Clean up
    await manager.close();
    if (existsSync(testDbPath)) {
      unlinkSync(testDbPath);
    }
  });

  describe('createUserProfile', () => {
    it('should create a new user profile with valid data', async () => {
      const profile: UserProfile = {
        userId: 'user-001',
        mode: UserMode.FEMALE,
        username: 'alice',
        createdAt: new Date(),
        updatedAt: new Date(),
        metadata: {
          ageRange: '25-30',
          location: 'New York',
          interests: ['hiking', 'reading'],
        },
      };

      const created = await manager.createUserProfile(profile);

      expect(created.userId).toBe(profile.userId);
      expect(created.mode).toBe(profile.mode);
      expect(created.username).toBe(profile.username);
      expect(created.metadata.ageRange).toBe(profile.metadata.ageRange);
      expect(created.metadata.location).toBe(profile.metadata.location);
      expect(created.metadata.interests).toEqual(profile.metadata.interests);
    });

    it('should create a user profile with minimal metadata', async () => {
      const profile: UserProfile = {
        userId: 'user-002',
        mode: UserMode.MALE,
        username: 'bob',
        createdAt: new Date(),
        updatedAt: new Date(),
        metadata: {},
      };

      const created = await manager.createUserProfile(profile);

      expect(created.userId).toBe(profile.userId);
      expect(created.username).toBe(profile.username);
      expect(created.metadata.ageRange).toBeUndefined();
      expect(created.metadata.location).toBeUndefined();
      expect(created.metadata.interests).toBeUndefined();
    });

    it('should reject duplicate userId', async () => {
      const profile1: UserProfile = {
        userId: 'user-003',
        mode: UserMode.FEMALE,
        username: 'charlie',
        createdAt: new Date(),
        updatedAt: new Date(),
        metadata: {},
      };

      const profile2: UserProfile = {
        userId: 'user-003',
        mode: UserMode.MALE,
        username: 'diana',
        createdAt: new Date(),
        updatedAt: new Date(),
        metadata: {},
      };

      await manager.createUserProfile(profile1);

      await expect(manager.createUserProfile(profile2)).rejects.toThrow(
        "User ID 'user-003' already exists"
      );
    });

    it('should reject duplicate username', async () => {
      const profile1: UserProfile = {
        userId: 'user-004',
        mode: UserMode.FEMALE,
        username: 'eve',
        createdAt: new Date(),
        updatedAt: new Date(),
        metadata: {},
      };

      const profile2: UserProfile = {
        userId: 'user-005',
        mode: UserMode.MALE,
        username: 'eve',
        createdAt: new Date(),
        updatedAt: new Date(),
        metadata: {},
      };

      await manager.createUserProfile(profile1);

      await expect(manager.createUserProfile(profile2)).rejects.toThrow(
        "Username 'eve' already exists"
      );
    });

    it('should reject invalid userId', async () => {
      const profile: UserProfile = {
        userId: '',
        mode: UserMode.FEMALE,
        username: 'frank',
        createdAt: new Date(),
        updatedAt: new Date(),
        metadata: {},
      };

      await expect(manager.createUserProfile(profile)).rejects.toThrow(
        'User profile validation failed'
      );
    });

    it('should reject invalid mode', async () => {
      const profile: any = {
        userId: 'user-006',
        mode: 'invalid',
        username: 'grace',
        createdAt: new Date(),
        updatedAt: new Date(),
        metadata: {},
      };

      await expect(manager.createUserProfile(profile)).rejects.toThrow(
        'User profile validation failed'
      );
    });

    it('should reject invalid username', async () => {
      const profile: UserProfile = {
        userId: 'user-007',
        mode: UserMode.FEMALE,
        username: '',
        createdAt: new Date(),
        updatedAt: new Date(),
        metadata: {},
      };

      await expect(manager.createUserProfile(profile)).rejects.toThrow(
        'User profile validation failed'
      );
    });

    it('should reject invalid createdAt', async () => {
      const profile: any = {
        userId: 'user-008',
        mode: UserMode.FEMALE,
        username: 'henry',
        createdAt: 'not-a-date',
        updatedAt: new Date(),
        metadata: {},
      };

      await expect(manager.createUserProfile(profile)).rejects.toThrow(
        'User profile validation failed'
      );
    });

    it('should reject invalid metadata interests', async () => {
      const profile: any = {
        userId: 'user-009',
        mode: UserMode.FEMALE,
        username: 'iris',
        createdAt: new Date(),
        updatedAt: new Date(),
        metadata: {
          interests: 'not-an-array',
        },
      };

      await expect(manager.createUserProfile(profile)).rejects.toThrow(
        'User profile validation failed'
      );
    });
  });

  describe('getUserProfile', () => {
    it('should retrieve an existing user profile', async () => {
      const profile: UserProfile = {
        userId: 'user-010',
        mode: UserMode.FEMALE,
        username: 'jack',
        createdAt: new Date(),
        updatedAt: new Date(),
        metadata: {
          ageRange: '30-35',
          location: 'Los Angeles',
          interests: ['yoga', 'cooking'],
        },
      };

      await manager.createUserProfile(profile);
      const retrieved = await manager.getUserProfile('user-010');

      expect(retrieved).not.toBeNull();
      expect(retrieved?.userId).toBe(profile.userId);
      expect(retrieved?.mode).toBe(profile.mode);
      expect(retrieved?.username).toBe(profile.username);
      expect(retrieved?.metadata.ageRange).toBe(profile.metadata.ageRange);
      expect(retrieved?.metadata.location).toBe(profile.metadata.location);
      expect(retrieved?.metadata.interests).toEqual(profile.metadata.interests);
    });

    it('should return null for non-existent user', async () => {
      const retrieved = await manager.getUserProfile('non-existent-user');
      expect(retrieved).toBeNull();
    });

    it('should preserve dates correctly', async () => {
      const now = new Date();
      const profile: UserProfile = {
        userId: 'user-011',
        mode: UserMode.MALE,
        username: 'kate',
        createdAt: now,
        updatedAt: now,
        metadata: {},
      };

      await manager.createUserProfile(profile);
      const retrieved = await manager.getUserProfile('user-011');

      expect(retrieved?.createdAt).toEqual(now);
      expect(retrieved?.updatedAt).toEqual(now);
    });
  });

  describe('updateUserProfile', () => {
    it('should update an existing user profile', async () => {
      const profile: UserProfile = {
        userId: 'user-012',
        mode: UserMode.FEMALE,
        username: 'liam',
        createdAt: new Date(),
        updatedAt: new Date(),
        metadata: {
          ageRange: '25-30',
        },
      };

      await manager.createUserProfile(profile);

      const updated: UserProfile = {
        ...profile,
        metadata: {
          ageRange: '30-35',
          location: 'Chicago',
          interests: ['music', 'art'],
        },
        updatedAt: new Date(),
      };

      const result = await manager.updateUserProfile(updated);

      expect(result.metadata.ageRange).toBe('30-35');
      expect(result.metadata.location).toBe('Chicago');
      expect(result.metadata.interests).toEqual(['music', 'art']);
    });

    it('should update username if unique', async () => {
      const profile: UserProfile = {
        userId: 'user-013',
        mode: UserMode.FEMALE,
        username: 'mia',
        createdAt: new Date(),
        updatedAt: new Date(),
        metadata: {},
      };

      await manager.createUserProfile(profile);

      const updated: UserProfile = {
        ...profile,
        username: 'mia-updated',
        updatedAt: new Date(),
      };

      await manager.updateUserProfile(updated);
      const retrieved = await manager.getUserProfile('user-013');

      expect(retrieved?.username).toBe('mia-updated');
    });

    it('should reject update with duplicate username', async () => {
      const profile1: UserProfile = {
        userId: 'user-014',
        mode: UserMode.FEMALE,
        username: 'noah',
        createdAt: new Date(),
        updatedAt: new Date(),
        metadata: {},
      };

      const profile2: UserProfile = {
        userId: 'user-015',
        mode: UserMode.MALE,
        username: 'olivia',
        createdAt: new Date(),
        updatedAt: new Date(),
        metadata: {},
      };

      await manager.createUserProfile(profile1);
      await manager.createUserProfile(profile2);

      const updated: UserProfile = {
        ...profile2,
        username: 'noah',
        updatedAt: new Date(),
      };

      await expect(manager.updateUserProfile(updated)).rejects.toThrow(
        "Username 'noah' already exists"
      );
    });

    it('should reject update for non-existent user', async () => {
      const profile: UserProfile = {
        userId: 'non-existent',
        mode: UserMode.FEMALE,
        username: 'paul',
        createdAt: new Date(),
        updatedAt: new Date(),
        metadata: {},
      };

      await expect(manager.updateUserProfile(profile)).rejects.toThrow(
        "User ID 'non-existent' does not exist"
      );
    });

    it('should reject invalid profile data on update', async () => {
      const profile: UserProfile = {
        userId: 'user-016',
        mode: UserMode.FEMALE,
        username: 'quinn',
        createdAt: new Date(),
        updatedAt: new Date(),
        metadata: {},
      };

      await manager.createUserProfile(profile);

      const invalid: any = {
        ...profile,
        mode: 'invalid',
        updatedAt: new Date(),
      };

      await expect(manager.updateUserProfile(invalid)).rejects.toThrow(
        'User profile validation failed'
      );
    });
  });

  describe('getUserProfileByUsername', () => {
    it('should retrieve user profile by username', async () => {
      const profile: UserProfile = {
        userId: 'user-017',
        mode: UserMode.FEMALE,
        username: 'rachel',
        createdAt: new Date(),
        updatedAt: new Date(),
        metadata: {
          location: 'Boston',
        },
      };

      await manager.createUserProfile(profile);
      const retrieved = await manager.getUserProfileByUsername('rachel');

      expect(retrieved).not.toBeNull();
      expect(retrieved?.userId).toBe('user-017');
      expect(retrieved?.username).toBe('rachel');
      expect(retrieved?.metadata.location).toBe('Boston');
    });

    it('should return null for non-existent username', async () => {
      const retrieved = await manager.getUserProfileByUsername('non-existent-username');
      expect(retrieved).toBeNull();
    });
  });

  describe('listUserProfiles', () => {
    it('should list all user profiles', async () => {
      const profile1: UserProfile = {
        userId: 'user-018',
        mode: UserMode.FEMALE,
        username: 'sam',
        createdAt: new Date(),
        updatedAt: new Date(),
        metadata: {},
      };

      const profile2: UserProfile = {
        userId: 'user-019',
        mode: UserMode.MALE,
        username: 'tina',
        createdAt: new Date(),
        updatedAt: new Date(),
        metadata: {},
      };

      await manager.createUserProfile(profile1);
      await manager.createUserProfile(profile2);

      const profiles = await manager.listUserProfiles();

      expect(profiles.length).toBeGreaterThanOrEqual(2);
      expect(profiles.some((p) => p.userId === 'user-018')).toBe(true);
      expect(profiles.some((p) => p.userId === 'user-019')).toBe(true);
    });

    it('should return empty array when no profiles exist', async () => {
      const profiles = await manager.listUserProfiles();
      expect(Array.isArray(profiles)).toBe(true);
    });

    it('should return profiles ordered by creation date', async () => {
      const profile1: UserProfile = {
        userId: 'user-020',
        mode: UserMode.FEMALE,
        username: 'uma',
        createdAt: new Date('2024-01-01'),
        updatedAt: new Date('2024-01-01'),
        metadata: {},
      };

      const profile2: UserProfile = {
        userId: 'user-021',
        mode: UserMode.MALE,
        username: 'victor',
        createdAt: new Date('2024-01-02'),
        updatedAt: new Date('2024-01-02'),
        metadata: {},
      };

      await manager.createUserProfile(profile1);
      await manager.createUserProfile(profile2);

      const profiles = await manager.listUserProfiles();
      const indices = profiles.map((p) => p.userId);

      // Most recent should come first
      const victor = indices.indexOf('user-021');
      const uma = indices.indexOf('user-020');
      expect(victor).toBeLessThan(uma);
    });
  });

  describe('deleteUserProfile', () => {
    it('should delete a user profile', async () => {
      const profile: UserProfile = {
        userId: 'user-022',
        mode: UserMode.FEMALE,
        username: 'wendy',
        createdAt: new Date(),
        updatedAt: new Date(),
        metadata: {},
      };

      await manager.createUserProfile(profile);
      await manager.deleteUserProfile('user-022');

      const retrieved = await manager.getUserProfile('user-022');
      expect(retrieved).toBeNull();
    });

    it('should not throw error when deleting non-existent user', async () => {
      await expect(manager.deleteUserProfile('non-existent')).resolves.not.toThrow();
    });
  });

  describe('Validation edge cases', () => {
    it('should handle metadata with all fields', async () => {
      const profile: UserProfile = {
        userId: 'user-023',
        mode: UserMode.FEMALE,
        username: 'xavier',
        createdAt: new Date(),
        updatedAt: new Date(),
        metadata: {
          ageRange: '35-40',
          location: 'Seattle',
          interests: ['photography', 'travel', 'cooking'],
        },
      };

      const created = await manager.createUserProfile(profile);
      const retrieved = await manager.getUserProfile('user-023');

      expect(retrieved?.metadata.ageRange).toBe('35-40');
      expect(retrieved?.metadata.location).toBe('Seattle');
      expect(retrieved?.metadata.interests).toEqual(['photography', 'travel', 'cooking']);
    });

    it('should handle metadata with empty interests array', async () => {
      const profile: UserProfile = {
        userId: 'user-024',
        mode: UserMode.MALE,
        username: 'yara',
        createdAt: new Date(),
        updatedAt: new Date(),
        metadata: {
          interests: [],
        },
      };

      const created = await manager.createUserProfile(profile);
      const retrieved = await manager.getUserProfile('user-024');

      expect(retrieved?.metadata.interests).toEqual([]);
    });

    it('should reject profile with invalid interests (non-string items)', async () => {
      const profile: any = {
        userId: 'user-025',
        mode: UserMode.FEMALE,
        username: 'zoe',
        createdAt: new Date(),
        updatedAt: new Date(),
        metadata: {
          interests: ['valid', 123, 'also-valid'],
        },
      };

      await expect(manager.createUserProfile(profile)).rejects.toThrow(
        'User profile validation failed'
      );
    });

    it('should handle whitespace-only userId as invalid', async () => {
      const profile: UserProfile = {
        userId: '   ',
        mode: UserMode.FEMALE,
        username: 'alex',
        createdAt: new Date(),
        updatedAt: new Date(),
        metadata: {},
      };

      await expect(manager.createUserProfile(profile)).rejects.toThrow(
        'User profile validation failed'
      );
    });

    it('should handle whitespace-only username as invalid', async () => {
      const profile: UserProfile = {
        userId: 'user-026',
        mode: UserMode.FEMALE,
        username: '   ',
        createdAt: new Date(),
        updatedAt: new Date(),
        metadata: {},
      };

      await expect(manager.createUserProfile(profile)).rejects.toThrow(
        'User profile validation failed'
      );
    });
  });
});

describe('DatabaseManager - Session Persistence', () => {
  let dbPath: string;
  let manager: DatabaseManager;

  beforeEach(async () => {
    // Create a temporary database for testing
    dbPath = join(tmpdir(), `test-db-${randomUUID()}.db`);
    await initializeDatabase(dbPath);
    manager = new DatabaseManager(dbPath);

    // Create test users
    await createTestUser(manager, 'user-001', UserMode.MALE);
    await createTestUser(manager, 'user-female-001', UserMode.FEMALE);
  });

  afterEach(async () => {
    if (existsSync(dbPath)) {
      unlinkSync(dbPath);
    }
  });

  describe('createSession()', () => {
    it('should create a new session with valid data', async () => {
      const session: Session = {
        sessionId: randomUUID(),
        userId: 'user-001',
        mode: SessionMode.WINGMAN,
        turnCount: 0,
        maxTurns: MAX_TURNS_PER_SESSION,
        status: SessionStatus.ACTIVE,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      const sessionId = await manager.createSession(session);
      expect(sessionId).toBe(session.sessionId);

      // Verify session was stored
      const retrieved = await manager.getSession(sessionId);
      expect(retrieved).not.toBeNull();
      expect(retrieved!.sessionId).toBe(session.sessionId);
      expect(retrieved!.userId).toBe(session.userId);
      expect(retrieved!.mode).toBe(SessionMode.WINGMAN);
      expect(retrieved!.status).toBe(SessionStatus.ACTIVE);
      expect(retrieved!.turnCount).toBe(0);
    });

    it('should create a bestie interview session with matchId', async () => {
      // Create a match profile first
      await createTestMatch(manager, 'match-001', 'user-female-001');

      const session: Session = {
        sessionId: randomUUID(),
        userId: 'user-female-001',
        mode: SessionMode.BESTIE,
        subMode: BestieSubMode.INTERVIEW,
        turnCount: 0,
        maxTurns: MAX_TURNS_PER_SESSION,
        status: SessionStatus.ACTIVE,
        createdAt: new Date(),
        updatedAt: new Date(),
        matchId: 'match-001',
      };

      const sessionId = await manager.createSession(session);
      const retrieved = await manager.getSession(sessionId);

      expect(retrieved!.mode).toBe(SessionMode.BESTIE);
      expect(retrieved!.subMode).toBe(BestieSubMode.INTERVIEW);
      expect(retrieved!.matchId).toBe('match-001');
    });

    it('should create a bestie preference gathering session', async () => {
      const session: Session = {
        sessionId: randomUUID(),
        userId: 'user-female-001',
        mode: SessionMode.BESTIE,
        subMode: BestieSubMode.PREFERENCES,
        turnCount: 0,
        maxTurns: MAX_TURNS_PER_SESSION,
        status: SessionStatus.ACTIVE,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      const sessionId = await manager.createSession(session);
      const retrieved = await manager.getSession(sessionId);

      expect(retrieved!.mode).toBe(SessionMode.BESTIE);
      expect(retrieved!.subMode).toBe(BestieSubMode.PREFERENCES);
    });

    it('should reject session with non-active status', async () => {
      const session: Session = {
        sessionId: randomUUID(),
        userId: 'user-001',
        mode: SessionMode.WINGMAN,
        turnCount: 0,
        maxTurns: MAX_TURNS_PER_SESSION,
        status: SessionStatus.COMPLETED,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      await expect(manager.createSession(session)).rejects.toThrow(
        'New sessions must have status "active"'
      );
    });

    it('should reject session with non-zero turnCount', async () => {
      const session: Session = {
        sessionId: randomUUID(),
        userId: 'user-001',
        mode: SessionMode.WINGMAN,
        turnCount: 5,
        maxTurns: MAX_TURNS_PER_SESSION,
        status: SessionStatus.ACTIVE,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      await expect(manager.createSession(session)).rejects.toThrow(
        'New sessions must have turnCount of 0'
      );
    });

    it('should reject interview session without matchId', async () => {
      const session: Session = {
        sessionId: randomUUID(),
        userId: 'user-female-001',
        mode: SessionMode.BESTIE,
        subMode: BestieSubMode.INTERVIEW,
        turnCount: 0,
        maxTurns: MAX_TURNS_PER_SESSION,
        status: SessionStatus.ACTIVE,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      await expect(manager.createSession(session)).rejects.toThrow(
        'Interview sessions must have a matchId'
      );
    });

    it('should reject session with incorrect maxTurns', async () => {
      const session: Session = {
        sessionId: randomUUID(),
        userId: 'user-001',
        mode: SessionMode.WINGMAN,
        turnCount: 0,
        maxTurns: 100,
        status: SessionStatus.ACTIVE,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      await expect(manager.createSession(session)).rejects.toThrow(
        `maxTurns must be ${MAX_TURNS_PER_SESSION}`
      );
    });
  });

  describe('getSession()', () => {
    it('should retrieve an existing session', async () => {
      const session: Session = {
        sessionId: randomUUID(),
        userId: 'user-001',
        mode: SessionMode.WINGMAN,
        turnCount: 0,
        maxTurns: MAX_TURNS_PER_SESSION,
        status: SessionStatus.ACTIVE,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      await manager.createSession(session);
      const retrieved = await manager.getSession(session.sessionId);

      expect(retrieved).not.toBeNull();
      expect(retrieved!.sessionId).toBe(session.sessionId);
      expect(retrieved!.userId).toBe(session.userId);
    });

    it('should return null for non-existent session', async () => {
      const retrieved = await manager.getSession('non-existent-id');
      expect(retrieved).toBeNull();
    });

    it('should preserve all session fields', async () => {
      // Create a match profile first
      await createTestMatch(manager, 'match-001', 'user-female-001');

      const now = new Date();
      const session: Session = {
        sessionId: randomUUID(),
        userId: 'user-female-001',
        mode: SessionMode.BESTIE,
        subMode: BestieSubMode.INTERVIEW,
        turnCount: 0,
        maxTurns: MAX_TURNS_PER_SESSION,
        status: SessionStatus.ACTIVE,
        createdAt: now,
        updatedAt: now,
        matchId: 'match-001',
      };

      await manager.createSession(session);
      const retrieved = await manager.getSession(session.sessionId);

      expect(retrieved!.sessionId).toBe(session.sessionId);
      expect(retrieved!.userId).toBe(session.userId);
      expect(retrieved!.mode).toBe(session.mode);
      expect(retrieved!.subMode).toBe(session.subMode);
      expect(retrieved!.turnCount).toBe(session.turnCount);
      expect(retrieved!.maxTurns).toBe(session.maxTurns);
      expect(retrieved!.status).toBe(session.status);
      expect(retrieved!.matchId).toBe(session.matchId);
    });
  });

  describe('updateSession()', () => {
    it('should update session turnCount', async () => {
      const session: Session = {
        sessionId: randomUUID(),
        userId: 'user-001',
        mode: SessionMode.WINGMAN,
        turnCount: 0,
        maxTurns: MAX_TURNS_PER_SESSION,
        status: SessionStatus.ACTIVE,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      await manager.createSession(session);

      // Update turnCount
      session.turnCount = 5;
      await manager.updateSession(session);

      const retrieved = await manager.getSession(session.sessionId);
      expect(retrieved!.turnCount).toBe(5);
    });

    it('should transition session from active to paused', async () => {
      const session: Session = {
        sessionId: randomUUID(),
        userId: 'user-001',
        mode: SessionMode.WINGMAN,
        turnCount: 0,
        maxTurns: MAX_TURNS_PER_SESSION,
        status: SessionStatus.ACTIVE,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      await manager.createSession(session);

      // Transition to paused
      session.status = SessionStatus.PAUSED;
      await manager.updateSession(session);

      const retrieved = await manager.getSession(session.sessionId);
      expect(retrieved!.status).toBe(SessionStatus.PAUSED);
    });

    it('should transition session from paused to active', async () => {
      const session: Session = {
        sessionId: randomUUID(),
        userId: 'user-001',
        mode: SessionMode.WINGMAN,
        turnCount: 5,
        maxTurns: MAX_TURNS_PER_SESSION,
        status: SessionStatus.PAUSED,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      // Create paused session directly
      await createTestSessionDirect(manager, session);

      // Transition to active
      session.status = SessionStatus.ACTIVE;
      await manager.updateSession(session);

      const retrieved = await manager.getSession(session.sessionId);
      expect(retrieved!.status).toBe(SessionStatus.ACTIVE);
    });

    it('should auto-complete session when turnCount reaches max', async () => {
      const session: Session = {
        sessionId: randomUUID(),
        userId: 'user-001',
        mode: SessionMode.WINGMAN,
        turnCount: MAX_TURNS_PER_SESSION - 1,
        maxTurns: MAX_TURNS_PER_SESSION,
        status: SessionStatus.ACTIVE,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      // Create session with high turn count
      await createTestSessionDirect(manager, session);

      // Increment to max
      session.turnCount = MAX_TURNS_PER_SESSION;
      await manager.updateSession(session);

      const retrieved = await manager.getSession(session.sessionId);
      expect(retrieved!.status).toBe(SessionStatus.COMPLETED);
      expect(retrieved!.turnCount).toBe(MAX_TURNS_PER_SESSION);
    });

    it('should reject invalid state transition from completed', async () => {
      const session: Session = {
        sessionId: randomUUID(),
        userId: 'user-001',
        mode: SessionMode.WINGMAN,
        turnCount: MAX_TURNS_PER_SESSION,
        maxTurns: MAX_TURNS_PER_SESSION,
        status: SessionStatus.COMPLETED,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      // Create completed session
      await createTestSessionDirect(manager, session);

      // Try to transition to active
      session.status = SessionStatus.ACTIVE;
      await expect(manager.updateSession(session)).rejects.toThrow(
        'Invalid state transition from completed to active'
      );
    });

    it('should reject invalid turnCount', async () => {
      const session: Session = {
        sessionId: randomUUID(),
        userId: 'user-001',
        mode: SessionMode.WINGMAN,
        turnCount: 0,
        maxTurns: MAX_TURNS_PER_SESSION,
        status: SessionStatus.ACTIVE,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      await manager.createSession(session);

      // Try to set invalid turnCount
      session.turnCount = MAX_TURNS_PER_SESSION + 1;
      await expect(manager.updateSession(session)).rejects.toThrow(
        `turnCount must be between 0 and ${MAX_TURNS_PER_SESSION}`
      );
    });

    it('should reject update for non-existent session', async () => {
      const session: Session = {
        sessionId: 'non-existent-id',
        userId: 'user-001',
        mode: SessionMode.WINGMAN,
        turnCount: 0,
        maxTurns: MAX_TURNS_PER_SESSION,
        status: SessionStatus.ACTIVE,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      await expect(manager.updateSession(session)).rejects.toThrow('Session not found');
    });
  });

  describe('listSessions()', () => {
    it('should list all sessions for a user', async () => {
      const userId = 'user-001';
      const sessions: Session[] = [];

      for (let i = 0; i < 3; i++) {
        const session: Session = {
          sessionId: randomUUID(),
          userId,
          mode: SessionMode.WINGMAN,
          turnCount: 0,
          maxTurns: MAX_TURNS_PER_SESSION,
          status: SessionStatus.ACTIVE,
          createdAt: new Date(),
          updatedAt: new Date(),
        };
        sessions.push(session);
        await manager.createSession(session);
      }

      const retrieved = await manager.listSessions(userId);
      expect(retrieved).toHaveLength(3);
      expect(retrieved.every((s) => s.userId === userId)).toBe(true);
    });

    it('should filter sessions by status', async () => {
      const userId = 'user-001';

      // Create active session
      const activeSession: Session = {
        sessionId: randomUUID(),
        userId,
        mode: SessionMode.WINGMAN,
        turnCount: 0,
        maxTurns: MAX_TURNS_PER_SESSION,
        status: SessionStatus.ACTIVE,
        createdAt: new Date(),
        updatedAt: new Date(),
      };
      await manager.createSession(activeSession);

      // Create paused session
      const pausedSession: Session = {
        sessionId: randomUUID(),
        userId,
        mode: SessionMode.WINGMAN,
        turnCount: 5,
        maxTurns: MAX_TURNS_PER_SESSION,
        status: SessionStatus.PAUSED,
        createdAt: new Date(),
        updatedAt: new Date(),
      };
      await createTestSessionDirect(manager, pausedSession);

      // List active sessions
      const active = await manager.listSessions(userId, SessionStatus.ACTIVE);
      expect(active).toHaveLength(1);
      expect(active[0].status).toBe(SessionStatus.ACTIVE);

      // List paused sessions
      const paused = await manager.listSessions(userId, SessionStatus.PAUSED);
      expect(paused).toHaveLength(1);
      expect(paused[0].status).toBe(SessionStatus.PAUSED);
    });

    it('should return empty list for user with no sessions', async () => {
      const retrieved = await manager.listSessions('user-with-no-sessions');
      expect(retrieved).toHaveLength(0);
    });

    it('should return sessions ordered by creation date (newest first)', async () => {
      const userId = 'user-001';
      const sessions: Session[] = [];

      for (let i = 0; i < 3; i++) {
        const session: Session = {
          sessionId: randomUUID(),
          userId,
          mode: SessionMode.WINGMAN,
          turnCount: 0,
          maxTurns: MAX_TURNS_PER_SESSION,
          status: SessionStatus.ACTIVE,
          createdAt: new Date(Date.now() - i * 1000),
          updatedAt: new Date(),
        };
        sessions.push(session);
        await manager.createSession(session);
      }

      const retrieved = await manager.listSessions(userId);
      expect(retrieved).toHaveLength(3);

      // Should be ordered newest first
      for (let i = 0; i < retrieved.length - 1; i++) {
        expect(retrieved[i].createdAt.getTime()).toBeGreaterThanOrEqual(
          retrieved[i + 1].createdAt.getTime()
        );
      }
    });
  });

  describe('canContinueSession()', () => {
    it('should return true for active session with turns remaining', async () => {
      const session: Session = {
        sessionId: randomUUID(),
        userId: 'user-001',
        mode: SessionMode.WINGMAN,
        turnCount: 10,
        maxTurns: MAX_TURNS_PER_SESSION,
        status: SessionStatus.ACTIVE,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      await createTestSessionDirect(manager, session);

      const canContinue = await manager.canContinueSession(session.sessionId);
      expect(canContinue).toBe(true);
    });

    it('should return false for completed session', async () => {
      const session: Session = {
        sessionId: randomUUID(),
        userId: 'user-001',
        mode: SessionMode.WINGMAN,
        turnCount: MAX_TURNS_PER_SESSION,
        maxTurns: MAX_TURNS_PER_SESSION,
        status: SessionStatus.COMPLETED,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      await createTestSessionDirect(manager, session);

      const canContinue = await manager.canContinueSession(session.sessionId);
      expect(canContinue).toBe(false);
    });

    it('should return false for paused session', async () => {
      const session: Session = {
        sessionId: randomUUID(),
        userId: 'user-001',
        mode: SessionMode.WINGMAN,
        turnCount: 10,
        maxTurns: MAX_TURNS_PER_SESSION,
        status: SessionStatus.PAUSED,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      await createTestSessionDirect(manager, session);

      const canContinue = await manager.canContinueSession(session.sessionId);
      expect(canContinue).toBe(false);
    });

    it('should return false when turnCount reaches max', async () => {
      const session: Session = {
        sessionId: randomUUID(),
        userId: 'user-001',
        mode: SessionMode.WINGMAN,
        turnCount: MAX_TURNS_PER_SESSION,
        maxTurns: MAX_TURNS_PER_SESSION,
        status: SessionStatus.ACTIVE,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      await createTestSessionDirect(manager, session);

      const canContinue = await manager.canContinueSession(session.sessionId);
      expect(canContinue).toBe(false);
    });

    it('should return false for non-existent session', async () => {
      const canContinue = await manager.canContinueSession('non-existent-id');
      expect(canContinue).toBe(false);
    });
  });

  describe('Session State Transitions - Property 1: Session Turn Limit Enforcement', () => {
    it('should enforce that sessions cannot exceed 50 turns', async () => {
      const session: Session = {
        sessionId: randomUUID(),
        userId: 'user-001',
        mode: SessionMode.WINGMAN,
        turnCount: 0,
        maxTurns: MAX_TURNS_PER_SESSION,
        status: SessionStatus.ACTIVE,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      await manager.createSession(session);

      // Increment to max
      for (let i = 1; i <= MAX_TURNS_PER_SESSION; i++) {
        session.turnCount = i;
        await manager.updateSession(session);
      }

      const retrieved = await manager.getSession(session.sessionId);
      expect(retrieved!.turnCount).toBe(MAX_TURNS_PER_SESSION);
      expect(retrieved!.status).toBe(SessionStatus.COMPLETED);

      // Verify cannot continue
      const canContinue = await manager.canContinueSession(session.sessionId);
      expect(canContinue).toBe(false);
    });

    it('should auto-complete session at exactly 50 turns', async () => {
      const session: Session = {
        sessionId: randomUUID(),
        userId: 'user-001',
        mode: SessionMode.WINGMAN,
        turnCount: MAX_TURNS_PER_SESSION - 1,
        maxTurns: MAX_TURNS_PER_SESSION,
        status: SessionStatus.ACTIVE,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      await createTestSessionDirect(manager, session);

      // Increment to max
      session.turnCount = MAX_TURNS_PER_SESSION;
      await manager.updateSession(session);

      const retrieved = await manager.getSession(session.sessionId);
      expect(retrieved!.status).toBe(SessionStatus.COMPLETED);
    });
  });
});

/**
 * Helper function to create a test user
 */
async function createTestUser(
  manager: DatabaseManager,
  userId: string,
  mode: UserMode
): Promise<void> {
  const profile: UserProfile = {
    userId,
    mode,
    username: `user-${randomUUID()}`,
    createdAt: new Date(),
    updatedAt: new Date(),
    metadata: {},
  };
  await manager.createUserProfile(profile);
}

/**
 * Helper function to create a test match profile
 */
async function createTestMatch(
  manager: DatabaseManager,
  matchId: string,
  userId: string
): Promise<void> {
  return new Promise((resolve, reject) => {
    const sql = `
      INSERT INTO matches (matchId, userId, matchName, matchInfo, createdAt, updatedAt)
      VALUES (?, ?, ?, ?, ?, ?)
    `;
    const now = new Date().toISOString();
    manager['db'].run(
      sql,
      [matchId, userId, 'Test Match', 'Test match info', now, now],
      (err) => {
        if (err) reject(err);
        else resolve();
      }
    );
  });
}

/**
 * Helper function to create a test session directly (bypassing validation)
 */
async function createTestSessionDirect(
  manager: DatabaseManager,
  session: Session
): Promise<void> {
  return new Promise((resolve, reject) => {
    const sql = `
      INSERT INTO sessions (
        sessionId, userId, mode, subMode, turnCount, maxTurns, status, createdAt, updatedAt, matchId
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `;
    manager['db'].run(
      sql,
      [
        session.sessionId,
        session.userId,
        session.mode,
        session.subMode || null,
        session.turnCount,
        session.maxTurns,
        session.status,
        session.createdAt.toISOString(),
        session.updatedAt.toISOString(),
        session.matchId || null,
      ],
      (err) => {
        if (err) reject(err);
        else resolve();
      }
    );
  });
}


/**
 * Test suite for DatabaseManager conversation turn persistence methods
 * Validates: Requirements 6, 9, 14
 */
describe('DatabaseManager - Conversation Turn Persistence', () => {
  let manager: DatabaseManager;
  let testDbPath: string;
  let testUserId: string;
  let testSessionId: string;

  beforeEach(async () => {
    // Create a temporary database for testing
    testDbPath = join(tmpdir(), `test-db-${randomUUID()}.db`);
    await initializeDatabase(testDbPath);
    manager = new DatabaseManager(testDbPath);

    // Create test user and session
    testUserId = randomUUID();
    testSessionId = randomUUID();

    const userProfile: UserProfile = {
      userId: testUserId,
      mode: UserMode.FEMALE,
      username: `test-user-${randomUUID()}`,
      createdAt: new Date(),
      updatedAt: new Date(),
      metadata: {},
    };
    await manager.createUserProfile(userProfile);

    const session: Session = {
      sessionId: testSessionId,
      userId: testUserId,
      mode: SessionMode.BESTIE,
      turnCount: 0,
      maxTurns: 50,
      status: SessionStatus.ACTIVE,
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    await manager.createSession(session);
  });

  afterEach(async () => {
    await manager.close();
    if (existsSync(testDbPath)) {
      unlinkSync(testDbPath);
    }
  });

  describe('saveConversationTurn()', () => {
    it('should save a conversation turn with sequential turnNumber', async () => {
      const turn = {
        turnId: randomUUID(),
        sessionId: testSessionId,
        turnNumber: 1,
        userMessage: 'Hello, can you help me?',
        assistantMessage: 'Of course! How can I assist you?',
        timestamp: new Date(),
        metadata: {},
      };

      await manager.saveConversationTurn(turn);

      const retrieved = await manager.getConversationTurn(turn.turnId);
      expect(retrieved).toBeDefined();
      expect(retrieved?.turnNumber).toBe(1);
      expect(retrieved?.userMessage).toBe(turn.userMessage);
      expect(retrieved?.assistantMessage).toBe(turn.assistantMessage);
    });

    it('should enforce sequential turnNumber validation', async () => {
      // Save first turn
      const turn1 = {
        turnId: randomUUID(),
        sessionId: testSessionId,
        turnNumber: 1,
        userMessage: 'First message',
        assistantMessage: 'First response',
        timestamp: new Date(),
        metadata: {},
      };
      await manager.saveConversationTurn(turn1);

      // Try to save turn with non-sequential number (should fail)
      const turn3 = {
        turnId: randomUUID(),
        sessionId: testSessionId,
        turnNumber: 3,
        userMessage: 'Third message',
        assistantMessage: 'Third response',
        timestamp: new Date(),
        metadata: {},
      };

      await expect(manager.saveConversationTurn(turn3)).rejects.toThrow(
        'Invalid turn number. Expected 2, got 3'
      );
    });

    it('should save turn with metadata (tokens, response time)', async () => {
      const turn = {
        turnId: randomUUID(),
        sessionId: testSessionId,
        turnNumber: 1,
        userMessage: 'Test message',
        assistantMessage: 'Test response',
        timestamp: new Date(),
        metadata: {
          tokensUsed: 150,
          responseTime: 1234,
        },
      };

      await manager.saveConversationTurn(turn);

      const retrieved = await manager.getConversationTurn(turn.turnId);
      expect(retrieved?.metadata.tokensUsed).toBe(150);
      expect(retrieved?.metadata.responseTime).toBe(1234);
    });

    it('should save multiple turns sequentially', async () => {
      for (let i = 1; i <= 5; i++) {
        const turn = {
          turnId: randomUUID(),
          sessionId: testSessionId,
          turnNumber: i,
          userMessage: `Message ${i}`,
          assistantMessage: `Response ${i}`,
          timestamp: new Date(),
          metadata: {},
        };
        await manager.saveConversationTurn(turn);
      }

      const history = await manager.getConversationHistory(testSessionId);
      expect(history).toHaveLength(5);
      expect(history[0].turnNumber).toBe(1);
      expect(history[4].turnNumber).toBe(5);
    });
  });

  describe('getConversationHistory()', () => {
    it('should return empty array for session with no turns', async () => {
      const history = await manager.getConversationHistory(testSessionId);
      expect(history).toEqual([]);
    });

    it('should return turns in chronological order by turnNumber', async () => {
      // Save turns in sequential order (validation requires this)
      const turn1 = {
        turnId: randomUUID(),
        sessionId: testSessionId,
        turnNumber: 1,
        userMessage: 'First',
        assistantMessage: 'Response 1',
        timestamp: new Date(),
        metadata: {},
      };

      const turn2 = {
        turnId: randomUUID(),
        sessionId: testSessionId,
        turnNumber: 2,
        userMessage: 'Second',
        assistantMessage: 'Response 2',
        timestamp: new Date(),
        metadata: {},
      };

      const turn3 = {
        turnId: randomUUID(),
        sessionId: testSessionId,
        turnNumber: 3,
        userMessage: 'Third',
        assistantMessage: 'Response 3',
        timestamp: new Date(),
        metadata: {},
      };

      // Save in sequential order
      await manager.saveConversationTurn(turn1);
      await manager.saveConversationTurn(turn2);
      await manager.saveConversationTurn(turn3);

      const history = await manager.getConversationHistory(testSessionId);
      expect(history).toHaveLength(3);
      expect(history[0].turnNumber).toBe(1);
      expect(history[1].turnNumber).toBe(2);
      expect(history[2].turnNumber).toBe(3);
    });

    it('should include both user and assistant messages', async () => {
      const turn = {
        turnId: randomUUID(),
        sessionId: testSessionId,
        turnNumber: 1,
        userMessage: 'User question',
        assistantMessage: 'Assistant answer',
        timestamp: new Date(),
        metadata: {},
      };

      await manager.saveConversationTurn(turn);

      const history = await manager.getConversationHistory(testSessionId);
      expect(history[0].userMessage).toBe('User question');
      expect(history[0].assistantMessage).toBe('Assistant answer');
    });

    it('should return turns only for the specified session', async () => {
      // Create another session
      const anotherSessionId = randomUUID();
      const anotherSession: Session = {
        sessionId: anotherSessionId,
        userId: testUserId,
        mode: SessionMode.BESTIE,
        turnCount: 0,
        maxTurns: 50,
        status: SessionStatus.ACTIVE,
        createdAt: new Date(),
        updatedAt: new Date(),
      };
      await manager.createSession(anotherSession);

      // Save turn to first session
      const turn1 = {
        turnId: randomUUID(),
        sessionId: testSessionId,
        turnNumber: 1,
        userMessage: 'Message 1',
        assistantMessage: 'Response 1',
        timestamp: new Date(),
        metadata: {},
      };
      await manager.saveConversationTurn(turn1);

      // Save turn to second session
      const turn2 = {
        turnId: randomUUID(),
        sessionId: anotherSessionId,
        turnNumber: 1,
        userMessage: 'Message 2',
        assistantMessage: 'Response 2',
        timestamp: new Date(),
        metadata: {},
      };
      await manager.saveConversationTurn(turn2);

      const history1 = await manager.getConversationHistory(testSessionId);
      const history2 = await manager.getConversationHistory(anotherSessionId);

      expect(history1).toHaveLength(1);
      expect(history2).toHaveLength(1);
      expect(history1[0].userMessage).toBe('Message 1');
      expect(history2[0].userMessage).toBe('Message 2');
    });
  });

  describe('getTurnCount()', () => {
    it('should return 0 for session with no turns', async () => {
      const count = await manager.getTurnCount(testSessionId);
      expect(count).toBe(0);
    });

    it('should return correct count after saving turns', async () => {
      for (let i = 1; i <= 5; i++) {
        const turn = {
          turnId: randomUUID(),
          sessionId: testSessionId,
          turnNumber: i,
          userMessage: `Message ${i}`,
          assistantMessage: `Response ${i}`,
          timestamp: new Date(),
          metadata: {},
        };
        await manager.saveConversationTurn(turn);
      }

      const count = await manager.getTurnCount(testSessionId);
      expect(count).toBe(5);
    });

    it('should return count only for specified session', async () => {
      // Create another session
      const anotherSessionId = randomUUID();
      const anotherSession: Session = {
        sessionId: anotherSessionId,
        userId: testUserId,
        mode: SessionMode.BESTIE,
        turnCount: 0,
        maxTurns: 50,
        status: SessionStatus.ACTIVE,
        createdAt: new Date(),
        updatedAt: new Date(),
      };
      await manager.createSession(anotherSession);

      // Save 3 turns to first session
      for (let i = 1; i <= 3; i++) {
        const turn = {
          turnId: randomUUID(),
          sessionId: testSessionId,
          turnNumber: i,
          userMessage: `Message ${i}`,
          assistantMessage: `Response ${i}`,
          timestamp: new Date(),
          metadata: {},
        };
        await manager.saveConversationTurn(turn);
      }

      // Save 2 turns to second session
      for (let i = 1; i <= 2; i++) {
        const turn = {
          turnId: randomUUID(),
          sessionId: anotherSessionId,
          turnNumber: i,
          userMessage: `Message ${i}`,
          assistantMessage: `Response ${i}`,
          timestamp: new Date(),
          metadata: {},
        };
        await manager.saveConversationTurn(turn);
      }

      const count1 = await manager.getTurnCount(testSessionId);
      const count2 = await manager.getTurnCount(anotherSessionId);

      expect(count1).toBe(3);
      expect(count2).toBe(2);
    });
  });

  describe('getConversationTurnByNumber()', () => {
    it('should retrieve a turn by session ID and turn number', async () => {
      const turn = {
        turnId: randomUUID(),
        sessionId: testSessionId,
        turnNumber: 1,
        userMessage: 'Test message',
        assistantMessage: 'Test response',
        timestamp: new Date(),
        metadata: {},
      };

      await manager.saveConversationTurn(turn);

      const retrieved = await manager.getConversationTurnByNumber(testSessionId, 1);
      expect(retrieved).toBeDefined();
      expect(retrieved?.turnId).toBe(turn.turnId);
      expect(retrieved?.userMessage).toBe(turn.userMessage);
    });

    it('should return null for non-existent turn number', async () => {
      const retrieved = await manager.getConversationTurnByNumber(testSessionId, 999);
      expect(retrieved).toBeNull();
    });
  });

  describe('getLastConversationTurn()', () => {
    it('should return null for session with no turns', async () => {
      const lastTurn = await manager.getLastConversationTurn(testSessionId);
      expect(lastTurn).toBeNull();
    });

    it('should return the last turn in a session', async () => {
      for (let i = 1; i <= 3; i++) {
        const turn = {
          turnId: randomUUID(),
          sessionId: testSessionId,
          turnNumber: i,
          userMessage: `Message ${i}`,
          assistantMessage: `Response ${i}`,
          timestamp: new Date(),
          metadata: {},
        };
        await manager.saveConversationTurn(turn);
      }

      const lastTurn = await manager.getLastConversationTurn(testSessionId);
      expect(lastTurn).toBeDefined();
      expect(lastTurn?.turnNumber).toBe(3);
      expect(lastTurn?.userMessage).toBe('Message 3');
    });
  });

  describe('Sequential turnNumber validation - Property 2', () => {
    it('should maintain sequential turnNumbers across multiple saves', async () => {
      // Save 10 turns
      for (let i = 1; i <= 10; i++) {
        const turn = {
          turnId: randomUUID(),
          sessionId: testSessionId,
          turnNumber: i,
          userMessage: `Message ${i}`,
          assistantMessage: `Response ${i}`,
          timestamp: new Date(),
          metadata: {},
        };
        await manager.saveConversationTurn(turn);
      }

      const history = await manager.getConversationHistory(testSessionId);

      // Verify no gaps in sequence
      for (let i = 0; i < history.length; i++) {
        expect(history[i].turnNumber).toBe(i + 1);
      }

      // Verify all turns are in order
      for (let i = 1; i < history.length; i++) {
        expect(history[i].turnNumber).toBeGreaterThan(history[i - 1].turnNumber);
      }
    });

    it('should reject duplicate turnNumbers in same session', async () => {
      const turn1 = {
        turnId: randomUUID(),
        sessionId: testSessionId,
        turnNumber: 1,
        userMessage: 'Message 1',
        assistantMessage: 'Response 1',
        timestamp: new Date(),
        metadata: {},
      };
      await manager.saveConversationTurn(turn1);

      // Try to save another turn with turnNumber 1
      const turn1Duplicate = {
        turnId: randomUUID(),
        sessionId: testSessionId,
        turnNumber: 1,
        userMessage: 'Duplicate message',
        assistantMessage: 'Duplicate response',
        timestamp: new Date(),
        metadata: {},
      };

      await expect(manager.saveConversationTurn(turn1Duplicate)).rejects.toThrow(
        'Invalid turn number. Expected 2, got 1'
      );
    });

    it('should verify turnNumber is sequential when retrieving history', async () => {
      // Save turns with gaps (should fail)
      const turn1 = {
        turnId: randomUUID(),
        sessionId: testSessionId,
        turnNumber: 1,
        userMessage: 'Message 1',
        assistantMessage: 'Response 1',
        timestamp: new Date(),
        metadata: {},
      };
      await manager.saveConversationTurn(turn1);

      const turn2 = {
        turnId: randomUUID(),
        sessionId: testSessionId,
        turnNumber: 2,
        userMessage: 'Message 2',
        assistantMessage: 'Response 2',
        timestamp: new Date(),
        metadata: {},
      };
      await manager.saveConversationTurn(turn2);

      const history = await manager.getConversationHistory(testSessionId);

      // Verify sequential ordering
      expect(history[0].turnNumber).toBe(1);
      expect(history[1].turnNumber).toBe(2);
      expect(history[1].turnNumber).toBe(history[0].turnNumber + 1);
    });
  });
});
