import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { randomUUID } from 'crypto';
import { DatabaseManager } from '../database/manager.js';
import { ConversationEngine } from './ConversationEngine.js';
import { ClaudeClient } from '../api/ClaudeClient.js';
import { SessionMode, BestieSubMode, SessionStatus, MAX_TURNS_PER_SESSION } from '../models/types.js';
import { initializeDatabase } from '../database/init.js';
import { join } from 'path';
import { unlinkSync } from 'fs';

describe('ConversationEngine', () => {
  let db: DatabaseManager;
  let claude: ClaudeClient;
  let engine: ConversationEngine;
  let testDbPath: string;
  let userId: string;

  beforeEach(async () => {
    testDbPath = join('/tmp', `test-db-${randomUUID()}.db`);
    db = new DatabaseManager(testDbPath);
    await initializeDatabase(testDbPath);

    // Mock Claude client
    claude = {
      generateResponse: vi.fn().mockResolvedValue('Test response'),
    } as any;

    engine = new ConversationEngine(db, claude);
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

  describe('initializeSession', () => {
    it('should create a new session', async () => {
      const session = await engine.initializeSession(userId, SessionMode.BESTIE, BestieSubMode.PREFERENCES);

      expect(session.userId).toBe(userId);
      expect(session.mode).toBe(SessionMode.BESTIE);
      expect(session.subMode).toBe(BestieSubMode.PREFERENCES);
      expect(session.status).toBe(SessionStatus.ACTIVE);
      expect(session.turnCount).toBe(0);
      expect(session.maxTurns).toBe(MAX_TURNS_PER_SESSION);
    });

    it('should require matchId for interview mode', async () => {
      await expect(
        engine.initializeSession(userId, SessionMode.BESTIE, BestieSubMode.INTERVIEW)
      ).rejects.toThrow();
    });

    it('should create interview session with matchId', async () => {
      // Create a match profile first
      const matchId = randomUUID();
      await new Promise<void>((resolve, reject) => {
        db['db']?.run(
          `INSERT INTO matches (matchId, userId, matchName, matchInfo, createdAt, updatedAt) 
           VALUES (?, ?, ?, ?, ?, ?)`,
          [matchId, userId, 'Test Match', 'Test info', new Date().toISOString(), new Date().toISOString()],
          (err: any) => {
            if (err) reject(err);
            else resolve();
          }
        );
      });

      const session = await engine.initializeSession(
        userId,
        SessionMode.BESTIE,
        BestieSubMode.INTERVIEW,
        matchId
      );

      expect(session.matchId).toBe(matchId);
    });
  });

  describe('processUserInput', () => {
    it('should process user input and return response', async () => {
      const session = await engine.initializeSession(userId, SessionMode.WINGMAN);

      const response = await engine.processUserInput(session.sessionId, 'Test question');

      expect(response.message).toBe('Test response');
      expect(response.turnNumber).toBe(1);
      expect(response.turnsRemaining).toBe(MAX_TURNS_PER_SESSION - 1);
    });

    it('should increment turn count', async () => {
      const session = await engine.initializeSession(userId, SessionMode.WINGMAN);

      await engine.processUserInput(session.sessionId, 'First question');
      await engine.processUserInput(session.sessionId, 'Second question');

      const updated = await db.getSession(session.sessionId);
      expect(updated?.turnCount).toBe(2);
    });

    it('should reject input for non-active session', async () => {
      const session = await engine.initializeSession(userId, SessionMode.WINGMAN);
      session.status = SessionStatus.COMPLETED;
      await db.updateSession(session);

      await expect(
        engine.processUserInput(session.sessionId, 'Test question')
      ).rejects.toThrow();
    });

    it('should auto-complete session at max turns', async () => {
      const session = await engine.initializeSession(userId, SessionMode.WINGMAN);

      // Process MAX_TURNS_PER_SESSION turns
      for (let i = 0; i < MAX_TURNS_PER_SESSION; i++) {
        await engine.processUserInput(session.sessionId, `Question ${i}`);
      }

      const completed = await db.getSession(session.sessionId);
      expect(completed?.status).toBe(SessionStatus.COMPLETED);
    });
  });

  describe('canContinueConversation', () => {
    it('should return true for active session with turns remaining', async () => {
      const session = await engine.initializeSession(userId, SessionMode.WINGMAN);

      const canContinue = await engine.canContinueConversation(session.sessionId);
      expect(canContinue).toBe(true);
    });

    it('should return false for completed session', async () => {
      const session = await engine.initializeSession(userId, SessionMode.WINGMAN);
      session.status = SessionStatus.COMPLETED;
      await db.updateSession(session);

      const canContinue = await engine.canContinueConversation(session.sessionId);
      expect(canContinue).toBe(false);
    });

    it('should return false when max turns reached', async () => {
      const session = await engine.initializeSession(userId, SessionMode.WINGMAN);

      // Process MAX_TURNS_PER_SESSION turns
      for (let i = 0; i < MAX_TURNS_PER_SESSION; i++) {
        await engine.processUserInput(session.sessionId, `Question ${i}`);
      }

      const canContinue = await engine.canContinueConversation(session.sessionId);
      expect(canContinue).toBe(false);
    });
  });

  describe('finalizeSession', () => {
    it('should finalize a session', async () => {
      const session = await engine.initializeSession(userId, SessionMode.WINGMAN);
      await engine.processUserInput(session.sessionId, 'Test question');

      const summary = await engine.finalizeSession(session.sessionId);

      expect(summary.sessionId).toBe(session.sessionId);
      expect(summary.userId).toBe(userId);
      expect(summary.totalTurns).toBe(1);
      expect(summary.completedAt).toBeDefined();
    });

    it('should set session status to completed', async () => {
      const session = await engine.initializeSession(userId, SessionMode.WINGMAN);

      await engine.finalizeSession(session.sessionId);

      const completed = await db.getSession(session.sessionId);
      expect(completed?.status).toBe(SessionStatus.COMPLETED);
    });
  });

  describe('getSessionContext', () => {
    it('should retrieve session context', async () => {
      const session = await engine.initializeSession(userId, SessionMode.WINGMAN);

      const context = await engine.getSessionContext(session.sessionId);

      expect(context.sessionId).toBe(session.sessionId);
      expect(context.userId).toBe(userId);
      expect(context.mode).toBe(SessionMode.WINGMAN);
      expect(context.conversationHistory).toEqual([]);
    });

    it('should include conversation history', async () => {
      const session = await engine.initializeSession(userId, SessionMode.WINGMAN);
      await engine.processUserInput(session.sessionId, 'Test question');

      const context = await engine.getSessionContext(session.sessionId);

      expect(context.conversationHistory).toHaveLength(1);
      expect(context.conversationHistory[0].userMessage).toBe('Test question');
    });
  });
});
