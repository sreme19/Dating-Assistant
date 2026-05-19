import sqlite3 from 'sqlite3';
import {
  Session,
  SessionStatus,
  SessionMode,
  BestieSubMode,
  MAX_TURNS_PER_SESSION,
} from '../models/types.js';

/**
 * Connection pool configuration
 */
interface PoolConfig {
  maxConnections: number;
  connectionTimeout: number;
  retryAttempts: number;
  retryDelay: number;
}

/**
 * DatabaseManager class handles all SQLite database operations with connection pooling,
 * error handling, and retry logic.
 * 
 * Validates: Requirements 21, 13
 */
export class DatabaseManager {
  private dbPath: string;
  public db: sqlite3.Database | null = null;
  private config: PoolConfig;
  private isInitialized: boolean = false;
  private isShuttingDown: boolean = false;

  /**
   * Create a new DatabaseManager instance
   * 
   * @param dbPath - Path to the SQLite database file
   * @param config - Optional pool configuration
   */
  constructor(
    dbPath: string,
    config: Partial<PoolConfig> = {}
  ) {
    this.dbPath = dbPath;
    this.config = {
      maxConnections: config.maxConnections ?? 5,
      connectionTimeout: config.connectionTimeout ?? 5000,
      retryAttempts: config.retryAttempts ?? 3,
      retryDelay: config.retryDelay ?? 100,
    };
  }

  /**
   * Connect to the database
   * Creates a single connection for use in operations
   * 
   * @returns Promise that resolves when connected
   * @throws Error if connection fails
   */
  async connect(): Promise<void> {
    if (this.isInitialized) {
      return;
    }

    return new Promise((resolve, reject) => {
      this.db = new sqlite3.Database(this.dbPath, (err) => {
        if (err) {
          reject(new Error(`Failed to connect to database: ${err.message}`));
          return;
        }

        // Enable foreign keys
        this.db!.run('PRAGMA foreign_keys = ON', (pragmaErr) => {
          if (pragmaErr) {
            this.db!.close();
            this.db = null;
            reject(new Error(`Failed to enable foreign keys: ${pragmaErr.message}`));
            return;
          }

          this.isInitialized = true;
          resolve();
        });
      });
    });
  }

  /**
   * Disconnect from the database
   * Closes the database connection gracefully
   * 
   * @returns Promise that resolves when disconnected
   */
  async disconnect(): Promise<void> {
    if (!this.db) {
      return;
    }

    return new Promise((resolve, reject) => {
      this.db!.close((err) => {
        if (err) {
          reject(new Error(`Failed to close database: ${err.message}`));
        } else {
          this.db = null;
          this.isInitialized = false;
          resolve();
        }
      });
    });
  }

  /**
   * Create a new session
   * 
   * @param session - Session to create
   * @returns Promise that resolves to the session ID
   * @throws Error if creation fails or validation fails
   */
  async createSession(session: Session): Promise<string> {
    if (!this.db) {
      throw new Error('Database not connected');
    }

    // Validate session
    if (session.status !== SessionStatus.ACTIVE) {
      throw new Error('New sessions must have status "active"');
    }

    if (session.turnCount !== 0) {
      throw new Error('New sessions must have turnCount of 0');
    }

    if (session.maxTurns !== MAX_TURNS_PER_SESSION) {
      throw new Error(`maxTurns must be ${MAX_TURNS_PER_SESSION}`);
    }

    if (session.mode === SessionMode.BESTIE && session.subMode === BestieSubMode.INTERVIEW && !session.matchId) {
      throw new Error('Interview sessions must have a matchId');
    }

    return new Promise((resolve, reject) => {
      const sql = `
        INSERT INTO sessions (
          sessionId, userId, mode, subMode, turnCount, maxTurns, status, createdAt, updatedAt, matchId
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `;

      this.db!.run(
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
          if (err) {
            reject(new Error(`Failed to create session: ${err.message}`));
          } else {
            resolve(session.sessionId);
          }
        }
      );
    });
  }

  /**
   * Get a session by ID
   * 
   * @param sessionId - Session ID
   * @returns Promise that resolves to the session or null
   */
  async getSession(sessionId: string): Promise<Session | null> {
    if (!this.db) {
      throw new Error('Database not connected');
    }

    return new Promise((resolve, reject) => {
      const sql = `SELECT * FROM sessions WHERE sessionId = ?`;

      this.db!.get(sql, [sessionId], (err, row: any) => {
        if (err) {
          reject(new Error(`Failed to get session: ${err.message}`));
        } else if (!row) {
          resolve(null);
        } else {
          resolve({
            sessionId: row.sessionId,
            userId: row.userId,
            mode: row.mode as SessionMode,
            subMode: row.subMode as BestieSubMode | undefined,
            turnCount: row.turnCount,
            maxTurns: row.maxTurns,
            status: row.status as SessionStatus,
            createdAt: new Date(row.createdAt),
            updatedAt: new Date(row.updatedAt),
            matchId: row.matchId,
          });
        }
      });
    });
  }

  /**
   * Update a session
   * 
   * @param session - Session to update
   * @returns Promise that resolves when session is updated
   * @throws Error if update fails or validation fails
   */
  async updateSession(session: Session): Promise<void> {
    if (!this.db) {
      throw new Error('Database not connected');
    }

    // Validate turnCount
    if (session.turnCount < 0 || session.turnCount > MAX_TURNS_PER_SESSION) {
      throw new Error(`turnCount must be between 0 and ${MAX_TURNS_PER_SESSION}`);
    }

    // Check if session exists
    const existing = await this.getSession(session.sessionId);
    if (!existing) {
      throw new Error('Session not found');
    }

    // Validate state transitions
    if (existing.status === SessionStatus.COMPLETED && session.status !== SessionStatus.COMPLETED) {
      throw new Error(`Invalid state transition from ${existing.status} to ${session.status}`);
    }

    // Auto-complete session if turnCount reaches max
    let finalStatus = session.status;
    if (session.turnCount >= MAX_TURNS_PER_SESSION) {
      finalStatus = SessionStatus.COMPLETED;
    }

    return new Promise((resolve, reject) => {
      const sql = `
        UPDATE sessions SET
          mode = ?, subMode = ?, turnCount = ?, maxTurns = ?, status = ?, updatedAt = ?, matchId = ?
        WHERE sessionId = ?
      `;

      this.db!.run(
        sql,
        [
          session.mode,
          session.subMode || null,
          session.turnCount,
          session.maxTurns,
          finalStatus,
          session.updatedAt.toISOString(),
          session.matchId || null,
          session.sessionId,
        ],
        (err) => {
          if (err) {
            reject(new Error(`Failed to update session: ${err.message}`));
          } else {
            resolve();
          }
        }
      );
    });
  }

  /**
   * List sessions for a user
   * 
   * @param userId - User ID
   * @param status - Optional status filter
   * @returns Promise that resolves to array of sessions
   */
  async listSessions(userId: string, status?: SessionStatus): Promise<Session[]> {
    if (!this.db) {
      throw new Error('Database not connected');
    }

    return new Promise((resolve, reject) => {
      let sql = `SELECT * FROM sessions WHERE userId = ?`;
      const params: any[] = [userId];

      if (status) {
        sql += ` AND status = ?`;
        params.push(status);
      }

      sql += ` ORDER BY createdAt DESC`;

      this.db!.all(sql, params, (err, rows: any[]) => {
        if (err) {
          reject(new Error(`Failed to list sessions: ${err.message}`));
        } else {
          const sessions = (rows || []).map((row) => ({
            sessionId: row.sessionId,
            userId: row.userId,
            mode: row.mode as SessionMode,
            subMode: row.subMode as BestieSubMode | undefined,
            turnCount: row.turnCount,
            maxTurns: row.maxTurns,
            status: row.status as SessionStatus,
            createdAt: new Date(row.createdAt),
            updatedAt: new Date(row.updatedAt),
            matchId: row.matchId,
          }));
          resolve(sessions);
        }
      });
    });
  }

  /**
   * Check if a session can continue
   * 
   * @param sessionId - Session ID
   * @returns Promise that resolves to true if session can continue, false otherwise
   */
  async canContinueSession(sessionId: string): Promise<boolean> {
    if (!this.db) {
      return false;
    }

    try {
      const session = await this.getSession(sessionId);
      if (!session) {
        return false;
      }

      if (session.status !== SessionStatus.ACTIVE) {
        return false;
      }

      if (session.turnCount >= session.maxTurns) {
        return false;
      }

      return true;
    } catch {
      return false;
    }
  }

  /**
   * Check if the database manager is initialized
   * 
   * @returns True if initialized, false otherwise
   */
  isReady(): boolean {
    return this.isInitialized && !this.isShuttingDown && this.db !== null;
  }
}
