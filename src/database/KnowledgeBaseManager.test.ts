import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { randomUUID } from 'crypto';
import { DatabaseManager } from './manager.js';
import { KnowledgeBaseManager } from './KnowledgeBaseManager.js';
import { KnowledgeBase, KBType } from '../models/types.js';
import { initializeDatabase } from './init.js';
import { join } from 'path';
import { unlinkSync } from 'fs';

describe('KnowledgeBaseManager', () => {
  let db: DatabaseManager;
  let manager: KnowledgeBaseManager;
  let testDbPath: string;
  let userId: string;

  beforeEach(async () => {
    testDbPath = join('/tmp', `test-db-${randomUUID()}.db`);
    db = new DatabaseManager(testDbPath);
    await initializeDatabase(testDbPath);
    manager = new KnowledgeBaseManager(db);
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

  describe('createKnowledgeBase', () => {
    it('should create a female preferences KB', async () => {
      const kb: KnowledgeBase = {
        kbId: randomUUID(),
        userId,
        type: KBType.FEMALE_PREFERENCES,
        content: 'Preferences: honesty, ambition, kindness',
        sourceData: { preferences: ['honesty', 'ambition', 'kindness'] },
        createdAt: new Date(),
        updatedAt: new Date(),
        version: 1,
      };

      const created = await manager.createKnowledgeBase(kb);
      expect(created.kbId).toBe(kb.kbId);
      expect(created.type).toBe(KBType.FEMALE_PREFERENCES);
    });

    it('should create a global dating expertise KB', async () => {
      const kb: KnowledgeBase = {
        kbId: randomUUID(),
        userId: null,
        type: KBType.DATING_EXPERTISE,
        content: 'Dating tips and strategies',
        sourceData: { tips: ['be authentic', 'listen actively'] },
        createdAt: new Date(),
        updatedAt: new Date(),
        version: 1,
      };

      const created = await manager.createKnowledgeBase(kb);
      expect(created.type).toBe(KBType.DATING_EXPERTISE);
      expect(created.userId).toBeNull();
    });

    it('should validate required fields', async () => {
      const invalidKB: any = {
        kbId: randomUUID(),
        userId,
        type: KBType.FEMALE_PREFERENCES,
        content: '',
        sourceData: {},
        createdAt: new Date(),
        updatedAt: new Date(),
        version: 1,
      };

      await expect(manager.createKnowledgeBase(invalidKB)).rejects.toThrow();
    });
  });

  describe('getKnowledgeBase', () => {
    it('should retrieve a KB by ID', async () => {
      const kb: KnowledgeBase = {
        kbId: randomUUID(),
        userId,
        type: KBType.FEMALE_PREFERENCES,
        content: 'Test preferences',
        sourceData: {},
        createdAt: new Date(),
        updatedAt: new Date(),
        version: 1,
      };

      await manager.createKnowledgeBase(kb);
      const retrieved = await manager.getKnowledgeBase(kb.kbId);

      expect(retrieved).not.toBeNull();
      expect(retrieved?.content).toBe('Test preferences');
    });

    it('should return null for non-existent KB', async () => {
      const retrieved = await manager.getKnowledgeBase(randomUUID());
      expect(retrieved).toBeNull();
    });
  });

  describe('getKnowledgeBaseByUserAndType', () => {
    it('should retrieve user-specific KB by type', async () => {
      const kb: KnowledgeBase = {
        kbId: randomUUID(),
        userId,
        type: KBType.FEMALE_PREFERENCES,
        content: 'User preferences',
        sourceData: {},
        createdAt: new Date(),
        updatedAt: new Date(),
        version: 1,
      };

      await manager.createKnowledgeBase(kb);
      const retrieved = await manager.getKnowledgeBaseByUserAndType(userId, KBType.FEMALE_PREFERENCES);

      expect(retrieved).not.toBeNull();
      expect(retrieved?.userId).toBe(userId);
    });

    it('should retrieve global KB by type', async () => {
      const kb: KnowledgeBase = {
        kbId: randomUUID(),
        userId: null,
        type: KBType.DATING_EXPERTISE,
        content: 'Global dating tips',
        sourceData: {},
        createdAt: new Date(),
        updatedAt: new Date(),
        version: 1,
      };

      await manager.createKnowledgeBase(kb);
      const retrieved = await manager.getKnowledgeBaseByUserAndType(null, KBType.DATING_EXPERTISE);

      expect(retrieved).not.toBeNull();
      expect(retrieved?.userId).toBeNull();
    });
  });

  describe('updateKnowledgeBase', () => {
    it('should update a KB', async () => {
      const kb: KnowledgeBase = {
        kbId: randomUUID(),
        userId,
        type: KBType.FEMALE_PREFERENCES,
        content: 'Original content',
        sourceData: {},
        createdAt: new Date(),
        updatedAt: new Date(),
        version: 1,
      };

      await manager.createKnowledgeBase(kb);

      kb.content = 'Updated content';
      kb.version = 2;
      kb.updatedAt = new Date();

      const updated = await manager.updateKnowledgeBase(kb);
      expect(updated.content).toBe('Updated content');
      expect(updated.version).toBe(2);
    });
  });

  describe('formatKBForPrompt', () => {
    it('should format KB content for prompt inclusion', () => {
      const kb: KnowledgeBase = {
        kbId: randomUUID(),
        userId,
        type: KBType.FEMALE_PREFERENCES,
        content: 'Preferences: honesty, ambition',
        sourceData: {},
        createdAt: new Date(),
        updatedAt: new Date(),
        version: 1,
      };

      const formatted = manager.formatKBForPrompt(kb);
      expect(formatted).toBe('Preferences: honesty, ambition');
    });
  });
});
