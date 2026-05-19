import sqlite3 from 'sqlite3';
import { readFileSync } from 'fs';
import { join } from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = join(__filename, '..');

/**
 * Initialize the SQLite database with schema
 * Creates the database file if it doesn't exist and runs all schema migrations
 * 
 * @param dbPath - Path to the SQLite database file
 * @returns Promise that resolves when database is initialized
 * @throws Error if database initialization fails
 */
export async function initializeDatabase(dbPath: string): Promise<void> {
  return new Promise((resolve, reject) => {
    const db = new sqlite3.Database(dbPath, (err) => {
      if (err) {
        reject(new Error(`Failed to open database at ${dbPath}: ${err.message}`));
        return;
      }

      // Enable foreign keys
      db.run('PRAGMA foreign_keys = ON', (pragmaErr) => {
        if (pragmaErr) {
          db.close();
          reject(new Error(`Failed to enable foreign keys: ${pragmaErr.message}`));
          return;
        }

        // Read schema file
        let schema: string;
        try {
          const schemaPath = join(__dirname, 'schema.sql');
          schema = readFileSync(schemaPath, 'utf-8');
        } catch (readErr) {
          db.close();
          reject(new Error(`Failed to read schema file: ${readErr instanceof Error ? readErr.message : String(readErr)}`));
          return;
        }

        // Execute schema
        db.exec(schema, (execErr) => {
          if (execErr) {
            db.close();
            reject(new Error(`Failed to execute schema: ${execErr.message}`));
            return;
          }

          // Close database connection
          db.close((closeErr) => {
            if (closeErr) {
              reject(new Error(`Failed to close database: ${closeErr.message}`));
              return;
            }
            resolve();
          });
        });
      });
    });
  });
}

/**
 * Get the default database path
 * Uses a local database file in the user's home directory
 * 
 * @returns Path to the default database file
 */
export function getDefaultDatabasePath(): string {
  const homeDir = process.env.HOME || process.env.USERPROFILE || './';
  return join(homeDir, '.dating-assistant', 'database.db');
}

/**
 * Verify database connection and schema
 * Checks that the database is accessible and all required tables exist
 * 
 * @param dbPath - Path to the SQLite database file
 * @returns Promise that resolves to true if database is valid, false otherwise
 */
export async function verifyDatabase(dbPath: string): Promise<boolean> {
  return new Promise((resolve) => {
    const db = new sqlite3.Database(dbPath, (err) => {
      if (err) {
        resolve(false);
        return;
      }

      // Check if required tables exist
      const requiredTables = [
        'users',
        'sessions',
        'conversation_turns',
        'custom_prompts',
        'matches',
        'knowledge_bases'
      ];

      let tablesChecked = 0;
      let allTablesExist = true;

      requiredTables.forEach((table) => {
        db.get(
          `SELECT name FROM sqlite_master WHERE type='table' AND name=?`,
          [table],
          (err, row) => {
            tablesChecked++;
            if (err || !row) {
              allTablesExist = false;
            }

            if (tablesChecked === requiredTables.length) {
              db.close();
              resolve(allTablesExist);
            }
          }
        );
      });
    });
  });
}
