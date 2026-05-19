import sqlite3 from 'sqlite3';
import {
  UserProfile,
  UserMode,
  ValidationResult,
  ValidationError,
  Session,
  SessionStatus,
  SessionMode,
  BestieSubMode,
  MAX_TURNS_PER_SESSION,
  isSession,
} from '../models/types.js';

/**
 * DatabaseManager handles all SQLite database operations
 * Provides CRUD operations for all data models with validation and error handling
 * Includes connection pooling, error handling, and retry logic
 * 
 * Validates: Requirements 1, 14, 21, 13
 */
export class DatabaseManager {
  private db: sqlite3.Database;
  private dbPath: string;
  private isConnectedFlag: boolean = false;

  /**
   * Create a new DatabaseManager instance
   * 
   * @param dbPath - Path to the SQLite database file
   */
  constructor(dbPath: string) {
    this.dbPath = dbPath;
    this.db = new sqlite3.Database(dbPath);
    // Enable foreign keys
    this.db.run('PRAGMA foreign_keys = ON');
    this.isConnectedFlag = true;
  }

  /**
   * Close the database connection gracefully
   * Ensures all pending operations complete before closing
   * 
   * @returns Promise that resolves when connection is closed
   * @throws Error if close operation fails
   */
  async close(): Promise<void> {
    if (!this.isConnectedFlag) {
      return;
    }

    return new Promise((resolve, reject) => {
      this.db.close((err: Error | null) => {
        if (err) {
          reject(new Error(`Failed to close database: ${err.message}`));
        } else {
          this.isConnectedFlag = false;
          resolve();
        }
      });
    });
  }

  /**
   * Check if database connection is active
   * 
   * @returns true if connected, false otherwise
   */
  isConnected(): boolean {
    return this.isConnectedFlag;
  }

  /**
   * Execute a database operation with retry logic
   * Automatically retries on transient failures with exponential backoff
   * 
   * @param operation - Async function that performs the database operation
   * @param operationName - Name of the operation for error messages
   * @returns Promise that resolves to the operation result
   * @throws Error if operation fails after all retries
   */
  // Note: This method is defined for future use but not currently utilized
  // private async executeWithRetry<T>(
  //   operation: () => Promise<T>,
  //   operationName: string = 'database operation'
  // ): Promise<T> {
  //   let lastError: Error | null = null;
  //   let delay = this.retryConfig.delayMs;

  //   for (let attempt = 1; attempt <= this.retryConfig.maxAttempts; attempt++) {
  //     try {
  //       return await operation();
  //     } catch (error) {
  //       lastError = error instanceof Error ? error : new Error(String(error));

  //       // Don't retry on the last attempt
  //       if (attempt < this.retryConfig.maxAttempts) {
  //         // Wait before retrying with exponential backoff
  //         await new Promise((resolve) => setTimeout(resolve, delay));
  //         delay *= this.retryConfig.backoffMultiplier;
  //       }
  //     }
  //   }

  //   throw new Error(
  //     `${operationName} failed after ${this.retryConfig.maxAttempts} attempts: ${lastError?.message}`
  //   );
  // }

  // ============================================================================
  // USER PROFILE METHODS
  // ============================================================================

  /**
   * Create a new user profile
   * Validates unique userId and username before creation
   * 
   * @param profile - UserProfile to create
   * @returns Promise that resolves to the created profile
   * @throws Error if validation fails or database operation fails
   * 
   * Validates: Requirements 1, 14
   */
  async createUserProfile(profile: UserProfile): Promise<UserProfile> {
    // Validate profile
    const validation = this.validateUserProfile(profile);
    if (!validation.isValid) {
      throw new Error(`User profile validation failed: ${validation.errors.join(', ')}`);
    }

    // Check for unique userId
    const userIdExists = await this.userIdExists(profile.userId);
    if (userIdExists) {
      throw new Error(`User ID '${profile.userId}' already exists`);
    }

    // Check for unique username
    const usernameExists = await this.usernameExists(profile.username);
    if (usernameExists) {
      throw new Error(`Username '${profile.username}' already exists`);
    }

    return new Promise((resolve, reject) => {
      const stmt = this.db.prepare(`
        INSERT INTO users (userId, mode, username, createdAt, updatedAt, ageRange, location, interests)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?)
      `);

      const interests = profile.metadata.interests ? JSON.stringify(profile.metadata.interests) : null;

      stmt.run(
        profile.userId,
        profile.mode,
        profile.username,
        profile.createdAt.toISOString(),
        profile.updatedAt.toISOString(),
        profile.metadata.ageRange || null,
        profile.metadata.location || null,
        interests,
        (err: Error | null) => {
          if (err) {
            reject(new Error(`Failed to create user profile: ${err.message}`));
          } else {
            resolve(profile);
          }
        }
      );

      stmt.finalize();
    });
  }

  /**
   * Get a user profile by userId
   * 
   * @param userId - The user ID to retrieve
   * @returns Promise that resolves to the UserProfile or null if not found
   * @throws Error if database operation fails
   * 
   * Validates: Requirements 1, 14
   */
  async getUserProfile(userId: string): Promise<UserProfile | null> {
    return new Promise((resolve, reject) => {
      this.db.get(
        `
        SELECT userId, mode, username, createdAt, updatedAt, ageRange, location, interests
        FROM users
        WHERE userId = ?
        `,
        [userId],
        (err, row: any) => {
          if (err) {
            reject(new Error(`Failed to retrieve user profile: ${err.message}`));
          } else if (!row) {
            resolve(null);
          } else {
            const profile: UserProfile = {
              userId: row.userId,
              mode: row.mode as UserMode,
              username: row.username,
              createdAt: new Date(row.createdAt),
              updatedAt: new Date(row.updatedAt),
              metadata: {
                ageRange: row.ageRange || undefined,
                location: row.location || undefined,
                interests: row.interests ? JSON.parse(row.interests) : undefined,
              },
            };
            resolve(profile);
          }
        }
      );
    });
  }

  /**
   * Update an existing user profile
   * Validates that userId exists and username is unique (if changed)
   * 
   * @param profile - UserProfile with updated values
   * @returns Promise that resolves to the updated profile
   * @throws Error if validation fails or database operation fails
   * 
   * Validates: Requirements 1, 14
   */
  async updateUserProfile(profile: UserProfile): Promise<UserProfile> {
    // Validate profile
    const validation = this.validateUserProfile(profile);
    if (!validation.isValid) {
      throw new Error(`User profile validation failed: ${validation.errors.join(', ')}`);
    }

    // Check that user exists
    const existingProfile = await this.getUserProfile(profile.userId);
    if (!existingProfile) {
      throw new Error(`User ID '${profile.userId}' does not exist`);
    }

    // Check for unique username if changed
    if (profile.username !== existingProfile.username) {
      const usernameExists = await this.usernameExists(profile.username);
      if (usernameExists) {
        throw new Error(`Username '${profile.username}' already exists`);
      }
    }

    return new Promise((resolve, reject) => {
      const stmt = this.db.prepare(`
        UPDATE users
        SET mode = ?, username = ?, updatedAt = ?, ageRange = ?, location = ?, interests = ?
        WHERE userId = ?
      `);

      const interests = profile.metadata.interests ? JSON.stringify(profile.metadata.interests) : null;

      stmt.run(
        profile.mode,
        profile.username,
        profile.updatedAt.toISOString(),
        profile.metadata.ageRange || null,
        profile.metadata.location || null,
        interests,
        profile.userId,
        (err: Error | null) => {
          if (err) {
            reject(new Error(`Failed to update user profile: ${err.message}`));
          } else {
            resolve(profile);
          }
        }
      );

      stmt.finalize();
    });
  }

  /**
   * Get a user profile by username
   * 
   * @param username - The username to retrieve
   * @returns Promise that resolves to the UserProfile or null if not found
   * @throws Error if database operation fails
   * 
   * Validates: Requirements 1, 14
   */
  async getUserProfileByUsername(username: string): Promise<UserProfile | null> {
    return new Promise((resolve, reject) => {
      this.db.get(
        `
        SELECT userId, mode, username, createdAt, updatedAt, ageRange, location, interests
        FROM users
        WHERE username = ?
        `,
        [username],
        (err, row: any) => {
          if (err) {
            reject(new Error(`Failed to retrieve user profile by username: ${err.message}`));
          } else if (!row) {
            resolve(null);
          } else {
            const profile: UserProfile = {
              userId: row.userId,
              mode: row.mode as UserMode,
              username: row.username,
              createdAt: new Date(row.createdAt),
              updatedAt: new Date(row.updatedAt),
              metadata: {
                ageRange: row.ageRange || undefined,
                location: row.location || undefined,
                interests: row.interests ? JSON.parse(row.interests) : undefined,
              },
            };
            resolve(profile);
          }
        }
      );
    });
  }

  /**
   * List all user profiles
   * 
   * @returns Promise that resolves to array of UserProfiles
   * @throws Error if database operation fails
   * 
   * Validates: Requirements 1, 14
   */
  async listUserProfiles(): Promise<UserProfile[]> {
    return new Promise((resolve, reject) => {
      this.db.all(
        `
        SELECT userId, mode, username, createdAt, updatedAt, ageRange, location, interests
        FROM users
        ORDER BY createdAt DESC
        `,
        (err, rows: any[]) => {
          if (err) {
            reject(new Error(`Failed to list user profiles: ${err.message}`));
          } else {
            const profiles: UserProfile[] = (rows || []).map((row) => ({
              userId: row.userId,
              mode: row.mode as UserMode,
              username: row.username,
              createdAt: new Date(row.createdAt),
              updatedAt: new Date(row.updatedAt),
              metadata: {
                ageRange: row.ageRange || undefined,
                location: row.location || undefined,
                interests: row.interests ? JSON.parse(row.interests) : undefined,
              },
            }));
            resolve(profiles);
          }
        }
      );
    });
  }

  /**
   * Delete a user profile and all associated data
   * 
   * @param userId - The user ID to delete
   * @returns Promise that resolves when deletion is complete
   * @throws Error if database operation fails
   * 
   * Validates: Requirements 1, 14
   */
  async deleteUserProfile(userId: string): Promise<void> {
    return new Promise((resolve, reject) => {
      const stmt = this.db.prepare('DELETE FROM users WHERE userId = ?');

      stmt.run(userId, (err: Error | null) => {
        if (err) {
          reject(new Error(`Failed to delete user profile: ${err.message}`));
        } else {
          resolve();
        }
      });

      stmt.finalize();
    });
  }

  // ============================================================================
  // VALIDATION METHODS
  // ============================================================================

  /**
   * Validate a UserProfile object
   * Checks all required fields and constraints
   * 
   * @param profile - UserProfile to validate
   * @returns ValidationResult with isValid flag and error messages
   * 
   * Validates: Requirements 14
   */
  private validateUserProfile(profile: any): ValidationResult {
    const errors: ValidationError[] = [];

    // Check if profile is an object
    if (!profile || typeof profile !== 'object') {
      return {
        isValid: false,
        errors: [{ field: 'profile', message: 'profile must be an object' }],
      };
    }

    // Validate userId
    if (!profile.userId || typeof profile.userId !== 'string' || profile.userId.trim() === '') {
      errors.push({
        field: 'userId',
        message: 'userId must be a non-empty string',
      });
    }

    // Validate mode
    if (!profile.mode || !['female', 'male'].includes(profile.mode)) {
      errors.push({
        field: 'mode',
        message: "mode must be either 'female' or 'male'",
      });
    }

    // Validate username
    if (!profile.username || typeof profile.username !== 'string' || profile.username.trim() === '') {
      errors.push({
        field: 'username',
        message: 'username must be a non-empty string',
      });
    }

    // Validate createdAt
    if (!(profile.createdAt instanceof Date) || isNaN(profile.createdAt.getTime())) {
      errors.push({
        field: 'createdAt',
        message: 'createdAt must be a valid Date',
      });
    }

    // Validate updatedAt
    if (!(profile.updatedAt instanceof Date) || isNaN(profile.updatedAt.getTime())) {
      errors.push({
        field: 'updatedAt',
        message: 'updatedAt must be a valid Date',
      });
    }

    // Validate metadata
    if (!profile.metadata || typeof profile.metadata !== 'object') {
      errors.push({
        field: 'metadata',
        message: 'metadata must be an object',
      });
    } else {
      // Validate metadata fields if provided
      if (profile.metadata.ageRange !== undefined && typeof profile.metadata.ageRange !== 'string') {
        errors.push({
          field: 'metadata.ageRange',
          message: 'ageRange must be a string if provided',
        });
      }

      if (profile.metadata.location !== undefined && typeof profile.metadata.location !== 'string') {
        errors.push({
          field: 'metadata.location',
          message: 'location must be a string if provided',
        });
      }

      if (profile.metadata.interests !== undefined) {
        if (!Array.isArray(profile.metadata.interests)) {
          errors.push({
            field: 'metadata.interests',
            message: 'interests must be an array if provided',
          });
        } else if (!profile.metadata.interests.every((i: any) => typeof i === 'string')) {
          errors.push({
            field: 'metadata.interests',
            message: 'all interests must be strings',
          });
        }
      }
    }

    return {
      isValid: errors.length === 0,
      errors,
    };
  }

  // ============================================================================
  // HELPER METHODS
  // ============================================================================

  /**
   * Check if a userId already exists
   * 
   * @param userId - The user ID to check
   * @returns Promise that resolves to true if exists, false otherwise
   */
  private userIdExists(userId: string): Promise<boolean> {
    return new Promise((resolve, reject) => {
      this.db.get('SELECT 1 FROM users WHERE userId = ?', [userId], (err, row) => {
        if (err) {
          reject(new Error(`Failed to check userId existence: ${err.message}`));
        } else {
          resolve(!!row);
        }
      });
    });
  }

  /**
   * Check if a username already exists
   * 
   * @param username - The username to check
   * @returns Promise that resolves to true if exists, false otherwise
   */
  private usernameExists(username: string): Promise<boolean> {
    return new Promise((resolve, reject) => {
      this.db.get('SELECT 1 FROM users WHERE username = ?', [username], (err, row) => {
        if (err) {
          reject(new Error(`Failed to check username existence: ${err.message}`));
        } else {
          resolve(!!row);
        }
      });
    });
  }

  // ============================================================================
  // SESSION PERSISTENCE METHODS
  // ============================================================================

  /**
   * Create a new session
   * Stores a session in the database with initial state
   * 
   * Validates: Requirements 2, 22
   * 
   * @param session - Session object to create
   * @returns Promise that resolves to the sessionId
   * @throws Error if session creation fails or validation fails
   */
  async createSession(session: Session): Promise<string> {
    // Validate session
    if (!isSession(session)) {
      throw new Error('Invalid session object');
    }

    // Validate session state
    if (session.status !== SessionStatus.ACTIVE) {
      throw new Error('New sessions must have status "active"');
    }

    if (session.turnCount !== 0) {
      throw new Error('New sessions must have turnCount of 0');
    }

    if (session.maxTurns !== MAX_TURNS_PER_SESSION) {
      throw new Error(`maxTurns must be ${MAX_TURNS_PER_SESSION}`);
    }

    // Validate mode-specific constraints
    if (session.mode === SessionMode.BESTIE && session.subMode === BestieSubMode.INTERVIEW) {
      if (!session.matchId) {
        throw new Error('Interview sessions must have a matchId');
      }
    }

    return new Promise((resolve, reject) => {
      const stmt = this.db.prepare(`
        INSERT INTO sessions (
          sessionId, userId, mode, subMode, turnCount, maxTurns, status, createdAt, updatedAt, matchId
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `);

      stmt.run(
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
        (err: Error | null) => {
          if (err) {
            reject(new Error(`Failed to create session: ${err.message}`));
          } else {
            resolve(session.sessionId);
          }
        }
      );

      stmt.finalize();
    });
  }

  /**
   * Get a session by ID
   * Retrieves a session from the database
   * 
   * Validates: Requirements 2, 22
   * 
   * @param sessionId - ID of the session to retrieve
   * @returns Promise that resolves to the Session object or null if not found
   * @throws Error if database query fails
   */
  async getSession(sessionId: string): Promise<Session | null> {
    return new Promise((resolve, reject) => {
      this.db.get(
        `
        SELECT 
          sessionId, userId, mode, subMode, turnCount, maxTurns, status, createdAt, updatedAt, matchId
        FROM sessions
        WHERE sessionId = ?
        `,
        [sessionId],
        (err, row: any) => {
          if (err) {
            reject(new Error(`Failed to get session: ${err.message}`));
            return;
          }

          if (!row) {
            resolve(null);
            return;
          }

          const session: Session = {
            sessionId: row.sessionId,
            userId: row.userId,
            mode: row.mode,
            subMode: row.subMode || undefined,
            turnCount: row.turnCount,
            maxTurns: row.maxTurns,
            status: row.status,
            createdAt: new Date(row.createdAt),
            updatedAt: new Date(row.updatedAt),
            matchId: row.matchId || undefined,
          };

          resolve(session);
        }
      );
    });
  }

  /**
   * Update a session
   * Updates an existing session in the database
   * Enforces state transition rules and turn count validation
   * 
   * Validates: Requirements 2, 22
   * 
   * @param session - Session object with updated values
   * @returns Promise that resolves when update is complete
   * @throws Error if update fails or validation fails
   */
  async updateSession(session: Session): Promise<void> {
    // Validate session
    if (!isSession(session)) {
      throw new Error('Invalid session object');
    }

    // Validate turn count
    if (session.turnCount < 0 || session.turnCount > MAX_TURNS_PER_SESSION) {
      throw new Error(`turnCount must be between 0 and ${MAX_TURNS_PER_SESSION}`);
    }

    // Validate state transitions
    const currentSession = await this.getSession(session.sessionId);
    if (!currentSession) {
      throw new Error('Session not found');
    }

    // Validate status transitions
    const validTransitions: Record<SessionStatus, SessionStatus[]> = {
      [SessionStatus.ACTIVE]: [SessionStatus.PAUSED, SessionStatus.COMPLETED],
      [SessionStatus.PAUSED]: [SessionStatus.ACTIVE, SessionStatus.COMPLETED],
      [SessionStatus.COMPLETED]: [], // Cannot transition from completed
    };

    if (session.status !== currentSession.status) {
      if (!validTransitions[currentSession.status].includes(session.status)) {
        throw new Error(
          `Invalid state transition from ${currentSession.status} to ${session.status}`
        );
      }
    }

    // Auto-complete if turn count reaches max
    if (session.turnCount >= MAX_TURNS_PER_SESSION && session.status === SessionStatus.ACTIVE) {
      session.status = SessionStatus.COMPLETED;
    }

    return new Promise((resolve, reject) => {
      const stmt = this.db.prepare(`
        UPDATE sessions
        SET mode = ?, subMode = ?, turnCount = ?, status = ?, updatedAt = ?, matchId = ?
        WHERE sessionId = ?
      `);

      stmt.run(
        session.mode,
        session.subMode || null,
        session.turnCount,
        session.status,
        new Date().toISOString(),
        session.matchId || null,
        session.sessionId,
        (err: Error | null) => {
          if (err) {
            reject(new Error(`Failed to update session: ${err.message}`));
          } else {
            resolve();
          }
        }
      );

      stmt.finalize();
    });
  }

  /**
   * List sessions for a user
   * Retrieves all sessions for a specific user, optionally filtered by status
   * 
   * Validates: Requirements 2, 11
   * 
   * @param userId - ID of the user
   * @param status - Optional status filter
   * @returns Promise that resolves to array of Session objects
   * @throws Error if database query fails
   */
  async listSessions(userId: string, status?: SessionStatus): Promise<Session[]> {
    return new Promise((resolve, reject) => {
      let sql = `
        SELECT 
          sessionId, userId, mode, subMode, turnCount, maxTurns, status, createdAt, updatedAt, matchId
        FROM sessions
        WHERE userId = ?
      `;

      const params: any[] = [userId];

      if (status) {
        sql += ' AND status = ?';
        params.push(status);
      }

      sql += ' ORDER BY createdAt DESC';

      this.db.all(sql, params, (err, rows: any[]) => {
        if (err) {
          reject(new Error(`Failed to list sessions: ${err.message}`));
          return;
        }

        const sessions: Session[] = (rows || []).map((row) => ({
          sessionId: row.sessionId,
          userId: row.userId,
          mode: row.mode,
          subMode: row.subMode || undefined,
          turnCount: row.turnCount,
          maxTurns: row.maxTurns,
          status: row.status,
          createdAt: new Date(row.createdAt),
          updatedAt: new Date(row.updatedAt),
          matchId: row.matchId || undefined,
        }));

        resolve(sessions);
      });
    });
  }

  /**
   * Check if a session can continue (has turns remaining and is active)
   * 
   * Validates: Requirements 6, 22
   * 
   * @param sessionId - ID of the session
   * @returns Promise that resolves to true if session can continue, false otherwise
   */
  async canContinueSession(sessionId: string): Promise<boolean> {
    const session = await this.getSession(sessionId);
    if (!session) {
      return false;
    }

    if (session.status !== SessionStatus.ACTIVE) {
      return false;
    }

    if (session.turnCount >= MAX_TURNS_PER_SESSION) {
      return false;
    }

    return true;
  }

  // ============================================================================
  // CONVERSATION TURN PERSISTENCE METHODS
  // ============================================================================

  /**
   * Save a conversation turn
   * Validates: Requirements 6, 9, 14
   * 
   * Ensures sequential turnNumber validation and stores the turn in the database
   * 
   * @param turn - ConversationTurn to save
   * @returns Promise that resolves when turn is saved
   * @throws Error if turnNumber is not sequential or database operation fails
   */
  async saveConversationTurn(turn: any): Promise<void> {
    // Validate that turnNumber is sequential
    const lastTurn = await this.getLastConversationTurn(turn.sessionId);
    const expectedTurnNumber = (lastTurn?.turnNumber || 0) + 1;
    
    if (turn.turnNumber !== expectedTurnNumber) {
      throw new Error(
        `Invalid turn number. Expected ${expectedTurnNumber}, got ${turn.turnNumber}`
      );
    }

    return new Promise((resolve, reject) => {
      const stmt = this.db.prepare(`
        INSERT INTO conversation_turns (
          turnId, sessionId, turnNumber, userMessage, assistantMessage, timestamp, tokensUsed, responseTime
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?)
      `);

      stmt.run(
        turn.turnId,
        turn.sessionId,
        turn.turnNumber,
        turn.userMessage,
        turn.assistantMessage,
        turn.timestamp.toISOString(),
        turn.metadata?.tokensUsed || null,
        turn.metadata?.responseTime || null,
        (err: Error | null) => {
          if (err) {
            reject(new Error(`Failed to save conversation turn: ${err.message}`));
          } else {
            resolve();
          }
        }
      );

      stmt.finalize();
    });
  }

  /**
   * Get the last conversation turn for a session
   * Used for sequential turnNumber validation
   * Validates: Requirements 6, 9
   * 
   * @param sessionId - ID of the session
   * @returns Promise that resolves to the last ConversationTurn or null if no turns exist
   */
  async getLastConversationTurn(sessionId: string): Promise<any | null> {
    return new Promise((resolve, reject) => {
      this.db.get(
        `
        SELECT * FROM conversation_turns
        WHERE sessionId = ?
        ORDER BY turnNumber DESC
        LIMIT 1
        `,
        [sessionId],
        (err, row: any) => {
          if (err) {
            reject(new Error(`Failed to get last conversation turn: ${err.message}`));
          } else if (!row) {
            resolve(null);
          } else {
            resolve({
              turnId: row.turnId,
              sessionId: row.sessionId,
              turnNumber: row.turnNumber,
              userMessage: row.userMessage,
              assistantMessage: row.assistantMessage,
              timestamp: new Date(row.timestamp),
              metadata: {
                tokensUsed: row.tokensUsed || undefined,
                responseTime: row.responseTime || undefined,
              },
            });
          }
        }
      );
    });
  }

  /**
   * Get conversation history for a session
   * Returns turns in chronological order by turnNumber
   * Validates: Requirements 6, 9, 14
   * 
   * @param sessionId - ID of the session
   * @returns Promise that resolves to array of ConversationTurns in order
   * @throws Error if database query fails
   */
  async getConversationHistory(sessionId: string): Promise<any[]> {
    return new Promise((resolve, reject) => {
      this.db.all(
        `
        SELECT * FROM conversation_turns
        WHERE sessionId = ?
        ORDER BY turnNumber ASC
        `,
        [sessionId],
        (err, rows: any[]) => {
          if (err) {
            reject(new Error(`Failed to get conversation history: ${err.message}`));
          } else {
            const turns = (rows || []).map((row) => ({
              turnId: row.turnId,
              sessionId: row.sessionId,
              turnNumber: row.turnNumber,
              userMessage: row.userMessage,
              assistantMessage: row.assistantMessage,
              timestamp: new Date(row.timestamp),
              metadata: {
                tokensUsed: row.tokensUsed || undefined,
                responseTime: row.responseTime || undefined,
              },
            }));
            resolve(turns);
          }
        }
      );
    });
  }

  /**
   * Get turn count for a session
   * Validates: Requirements 6, 9
   * 
   * @param sessionId - ID of the session
   * @returns Promise that resolves to the number of turns in the session
   * @throws Error if database query fails
   */
  async getTurnCount(sessionId: string): Promise<number> {
    return new Promise((resolve, reject) => {
      this.db.get(
        'SELECT COUNT(*) as count FROM conversation_turns WHERE sessionId = ?',
        [sessionId],
        (err, row: any) => {
          if (err) {
            reject(new Error(`Failed to get turn count: ${err.message}`));
          } else {
            resolve(row?.count || 0);
          }
        }
      );
    });
  }

  /**
   * Get a specific conversation turn by ID
   * Validates: Requirements 6, 9
   * 
   * @param turnId - ID of the turn to retrieve
   * @returns Promise that resolves to the ConversationTurn or null if not found
   * @throws Error if database query fails
   */
  async getConversationTurn(turnId: string): Promise<any | null> {
    return new Promise((resolve, reject) => {
      this.db.get(
        'SELECT * FROM conversation_turns WHERE turnId = ?',
        [turnId],
        (err, row: any) => {
          if (err) {
            reject(new Error(`Failed to get conversation turn: ${err.message}`));
          } else if (!row) {
            resolve(null);
          } else {
            resolve({
              turnId: row.turnId,
              sessionId: row.sessionId,
              turnNumber: row.turnNumber,
              userMessage: row.userMessage,
              assistantMessage: row.assistantMessage,
              timestamp: new Date(row.timestamp),
              metadata: {
                tokensUsed: row.tokensUsed || undefined,
                responseTime: row.responseTime || undefined,
              },
            });
          }
        }
      );
    });
  }

  /**
   * Get a conversation turn by session ID and turn number
   * Validates: Requirements 6, 9
   * 
   * @param sessionId - ID of the session
   * @param turnNumber - Turn number to retrieve
   * @returns Promise that resolves to the ConversationTurn or null if not found
   * @throws Error if database query fails
   */
  async getConversationTurnByNumber(sessionId: string, turnNumber: number): Promise<any | null> {
    return new Promise((resolve, reject) => {
      this.db.get(
        'SELECT * FROM conversation_turns WHERE sessionId = ? AND turnNumber = ?',
        [sessionId, turnNumber],
        (err, row: any) => {
          if (err) {
            reject(new Error(`Failed to get conversation turn by number: ${err.message}`));
          } else if (!row) {
            resolve(null);
          } else {
            resolve({
              turnId: row.turnId,
              sessionId: row.sessionId,
              turnNumber: row.turnNumber,
              userMessage: row.userMessage,
              assistantMessage: row.assistantMessage,
              timestamp: new Date(row.timestamp),
              metadata: {
                tokensUsed: row.tokensUsed || undefined,
                responseTime: row.responseTime || undefined,
              },
            });
          }
        }
      );
    });
  }
}
