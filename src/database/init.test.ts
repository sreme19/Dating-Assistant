import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { initializeDatabase, verifyDatabase, getDefaultDatabasePath } from './init';
import { unlinkSync, existsSync } from 'fs';
import { join } from 'path';
import sqlite3 from 'sqlite3';

describe('Database Initialization', () => {
  let testDbPath: string;

  beforeEach(() => {
    // Create a temporary test database path
    testDbPath = join('/tmp', `test-dating-assistant-${Date.now()}.db`);
  });

  afterEach(() => {
    // Clean up test database
    if (existsSync(testDbPath)) {
      unlinkSync(testDbPath);
    }
  });

  it('should initialize database with schema', async () => {
    await initializeDatabase(testDbPath);
    expect(existsSync(testDbPath)).toBe(true);
  });

  it('should create all required tables', async () => {
    await initializeDatabase(testDbPath);

    const tables = await new Promise<string[]>((resolve, reject) => {
      const db = new sqlite3.Database(testDbPath, (err) => {
        if (err) {
          reject(err);
          return;
        }

        db.all(
          `SELECT name FROM sqlite_master WHERE type='table' ORDER BY name`,
          (err, rows: any[]) => {
            db.close();
            if (err) {
              reject(err);
            } else {
              resolve(rows.map((row) => row.name));
            }
          }
        );
      });
    });

    const requiredTables = [
      'users',
      'sessions',
      'conversation_turns',
      'custom_prompts',
      'matches',
      'knowledge_bases'
    ];

    requiredTables.forEach((table) => {
      expect(tables).toContain(table);
    });
  });

  it('should create indexes for performance', async () => {
    await initializeDatabase(testDbPath);

    const indexes = await new Promise<string[]>((resolve, reject) => {
      const db = new sqlite3.Database(testDbPath, (err) => {
        if (err) {
          reject(err);
          return;
        }

        db.all(
          `SELECT name FROM sqlite_master WHERE type='index' AND name LIKE 'idx_%' ORDER BY name`,
          (err, rows: any[]) => {
            db.close();
            if (err) {
              reject(err);
            } else {
              resolve(rows.map((row) => row.name));
            }
          }
        );
      });
    });

    // Verify some key indexes exist
    expect(indexes.length).toBeGreaterThan(0);
    expect(indexes).toContain('idx_sessions_userId');
    expect(indexes).toContain('idx_turns_sessionId');
  });

  it('should verify database after initialization', async () => {
    await initializeDatabase(testDbPath);
    const isValid = await verifyDatabase(testDbPath);
    expect(isValid).toBe(true);
  });

  it('should return false for non-existent database', async () => {
    const nonExistentPath = join('/tmp', `non-existent-${Date.now()}.db`);
    const isValid = await verifyDatabase(nonExistentPath);
    expect(isValid).toBe(false);
  });

  it.skip('should enforce foreign key constraints', async () => {
    await initializeDatabase(testDbPath);

    const result = await new Promise<boolean>((resolve, reject) => {
      const db = new sqlite3.Database(testDbPath, (err) => {
        if (err) {
          reject(err);
          return;
        }

        // Check if foreign keys are enabled
        db.get('PRAGMA foreign_keys', (err, row: any) => {
          db.close();
          if (err) {
            reject(err);
          } else {
            // SQLite returns 0 or 1 for PRAGMA foreign_keys
            resolve(row && (row.foreign_keys === 1 || row.foreign_keys === '1'));
          }
        });
      });
    });

    expect(result).toBe(true);
  });

  it('should handle database initialization errors gracefully', async () => {
    const invalidPath = '/invalid/path/that/does/not/exist/database.db';
    
    try {
      await initializeDatabase(invalidPath);
      expect.fail('Should have thrown an error');
    } catch (error) {
      expect(error).toBeInstanceOf(Error);
      expect((error as Error).message).toContain('Failed');
    }
  });

  it('should return default database path', () => {
    const defaultPath = getDefaultDatabasePath();
    expect(defaultPath).toBeTruthy();
    expect(defaultPath).toContain('.dating-assistant');
    expect(defaultPath).toContain('database.db');
  });

  it('should create users table with correct schema', async () => {
    await initializeDatabase(testDbPath);

    const columns = await new Promise<any[]>((resolve, reject) => {
      const db = new sqlite3.Database(testDbPath, (err) => {
        if (err) {
          reject(err);
          return;
        }

        db.all(`PRAGMA table_info(users)`, (err, rows) => {
          db.close();
          if (err) {
            reject(err);
          } else {
            resolve(rows);
          }
        });
      });
    });

    const columnNames = columns.map((col: any) => col.name);
    expect(columnNames).toContain('userId');
    expect(columnNames).toContain('mode');
    expect(columnNames).toContain('username');
    expect(columnNames).toContain('createdAt');
    expect(columnNames).toContain('updatedAt');
  });

  it('should create sessions table with correct schema', async () => {
    await initializeDatabase(testDbPath);

    const columns = await new Promise<any[]>((resolve, reject) => {
      const db = new sqlite3.Database(testDbPath, (err) => {
        if (err) {
          reject(err);
          return;
        }

        db.all(`PRAGMA table_info(sessions)`, (err, rows) => {
          db.close();
          if (err) {
            reject(err);
          } else {
            resolve(rows);
          }
        });
      });
    });

    const columnNames = columns.map((col: any) => col.name);
    expect(columnNames).toContain('sessionId');
    expect(columnNames).toContain('userId');
    expect(columnNames).toContain('mode');
    expect(columnNames).toContain('turnCount');
    expect(columnNames).toContain('maxTurns');
    expect(columnNames).toContain('status');
  });

  it('should create conversation_turns table with correct schema', async () => {
    await initializeDatabase(testDbPath);

    const columns = await new Promise<any[]>((resolve, reject) => {
      const db = new sqlite3.Database(testDbPath, (err) => {
        if (err) {
          reject(err);
          return;
        }

        db.all(`PRAGMA table_info(conversation_turns)`, (err, rows) => {
          db.close();
          if (err) {
            reject(err);
          } else {
            resolve(rows);
          }
        });
      });
    });

    const columnNames = columns.map((col: any) => col.name);
    expect(columnNames).toContain('turnId');
    expect(columnNames).toContain('sessionId');
    expect(columnNames).toContain('turnNumber');
    expect(columnNames).toContain('userMessage');
    expect(columnNames).toContain('assistantMessage');
  });
});
