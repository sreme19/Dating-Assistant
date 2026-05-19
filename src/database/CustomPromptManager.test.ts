import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { randomUUID } from 'crypto';
import { DatabaseManager } from './manager.js';
import { CustomPromptManager } from './CustomPromptManager.js';
import { CustomPrompt, SessionMode } from '../models/types.js';
import { initializeDatabase } from './init.js';
import { join } from 'path';
import { unlinkSync } from 'fs';

describe('CustomPromptManager', () => {
  let db: DatabaseManager;
  let manager: CustomPromptManager;
  let testDbPath: string;
  let userId: string;

  beforeEach(async () => {
    testDbPath = join('/tmp', `test-db-${randomUUID()}.db`);
    db = new DatabaseManager(testDbPath);
    await initializeDatabase(testDbPath);
    manager = new CustomPromptManager(db);
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

  describe('createCustomPrompt', () => {
    it('should create a custom prompt', async () => {
      const prompt: CustomPrompt = {
        promptId: randomUUID(),
        userId,
        name: 'Test Prompt',
        content: 'This is a test prompt',
        mode: SessionMode.BESTIE,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      const created = await manager.createCustomPrompt(prompt);
      expect(created.promptId).toBe(prompt.promptId);
      expect(created.name).toBe('Test Prompt');
    });

    it('should reject duplicate names for same user', async () => {
      const prompt1: CustomPrompt = {
        promptId: randomUUID(),
        userId,
        name: 'Duplicate Name',
        content: 'First prompt',
        mode: SessionMode.BESTIE,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      const prompt2: CustomPrompt = {
        promptId: randomUUID(),
        userId,
        name: 'Duplicate Name',
        content: 'Second prompt',
        mode: SessionMode.BESTIE,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      await manager.createCustomPrompt(prompt1);
      await expect(manager.createCustomPrompt(prompt2)).rejects.toThrow();
    });

    it('should enforce 20 prompt limit per user', async () => {
      // Create 20 prompts
      for (let i = 0; i < 20; i++) {
        const prompt: CustomPrompt = {
          promptId: randomUUID(),
          userId,
          name: `Prompt ${i}`,
          content: `Content ${i}`,
          mode: SessionMode.BESTIE,
          createdAt: new Date(),
          updatedAt: new Date(),
        };
        await manager.createCustomPrompt(prompt);
      }

      // Try to create 21st prompt
      const prompt21: CustomPrompt = {
        promptId: randomUUID(),
        userId,
        name: 'Prompt 21',
        content: 'Content 21',
        mode: SessionMode.BESTIE,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      await expect(manager.createCustomPrompt(prompt21)).rejects.toThrow();
    });
  });

  describe('getCustomPrompts', () => {
    it('should retrieve custom prompts for user and mode', async () => {
      const prompt1: CustomPrompt = {
        promptId: randomUUID(),
        userId,
        name: 'Prompt 1',
        content: 'Content 1',
        mode: SessionMode.BESTIE,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      const prompt2: CustomPrompt = {
        promptId: randomUUID(),
        userId,
        name: 'Prompt 2',
        content: 'Content 2',
        mode: SessionMode.WINGMAN,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      await manager.createCustomPrompt(prompt1);
      await manager.createCustomPrompt(prompt2);

      const bestiePrompts = await manager.getCustomPrompts(userId, SessionMode.BESTIE);
      expect(bestiePrompts).toHaveLength(1);
      expect(bestiePrompts[0].name).toBe('Prompt 1');

      const wingmanPrompts = await manager.getCustomPrompts(userId, SessionMode.WINGMAN);
      expect(wingmanPrompts).toHaveLength(1);
      expect(wingmanPrompts[0].name).toBe('Prompt 2');
    });

    it('should return empty array if no prompts exist', async () => {
      const prompts = await manager.getCustomPrompts(userId, SessionMode.BESTIE);
      expect(prompts).toHaveLength(0);
    });
  });

  describe('updateCustomPrompt', () => {
    it('should update a custom prompt', async () => {
      const prompt: CustomPrompt = {
        promptId: randomUUID(),
        userId,
        name: 'Original Name',
        content: 'Original content',
        mode: SessionMode.BESTIE,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      await manager.createCustomPrompt(prompt);

      prompt.name = 'Updated Name';
      prompt.content = 'Updated content';
      prompt.updatedAt = new Date();

      const updated = await manager.updateCustomPrompt(prompt);
      expect(updated.name).toBe('Updated Name');
      expect(updated.content).toBe('Updated content');
    });

    it('should reject update with duplicate name', async () => {
      const prompt1: CustomPrompt = {
        promptId: randomUUID(),
        userId,
        name: 'Prompt 1',
        content: 'Content 1',
        mode: SessionMode.BESTIE,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      const prompt2: CustomPrompt = {
        promptId: randomUUID(),
        userId,
        name: 'Prompt 2',
        content: 'Content 2',
        mode: SessionMode.BESTIE,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      await manager.createCustomPrompt(prompt1);
      await manager.createCustomPrompt(prompt2);

      prompt2.name = 'Prompt 1';
      await expect(manager.updateCustomPrompt(prompt2)).rejects.toThrow();
    });
  });

  describe('deleteCustomPrompt', () => {
    it('should delete a custom prompt', async () => {
      const prompt: CustomPrompt = {
        promptId: randomUUID(),
        userId,
        name: 'Test Prompt',
        content: 'Test content',
        mode: SessionMode.BESTIE,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      await manager.createCustomPrompt(prompt);
      await manager.deleteCustomPrompt(prompt.promptId);

      const retrieved = await manager.getCustomPrompt(prompt.promptId);
      expect(retrieved).toBeNull();
    });
  });
});
