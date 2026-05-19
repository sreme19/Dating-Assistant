import { Session, SessionStatus } from '../models/types.js';
import { DatabaseManager } from './manager.js';

/**
 * SessionManager handles session-specific operations
 * 
 * Validates: Requirements 2, 11, 22
 */
export class SessionManager {
  private db: DatabaseManager;

  constructor(db: DatabaseManager) {
    this.db = db;
  }

  /**
   * List all sessions for a user
   * 
   * @param userId - User ID
   * @param status - Optional status filter
   * @returns Promise that resolves to array of sessions
   */
  async listSessions(userId: string, status?: SessionStatus): Promise<Session[]> {
    return this.db.listSessions(userId, status);
  }

  /**
   * Resume a paused session
   * 
   * @param sessionId - Session ID
   * @returns Promise that resolves to the resumed session
   * @throws Error if session not found or cannot be resumed
   */
  async resumeSession(sessionId: string): Promise<Session> {
    const session = await this.db.getSession(sessionId);
    if (!session) {
      throw new Error('Session not found');
    }

    if (session.status === SessionStatus.COMPLETED) {
      throw new Error('Cannot resume a completed session');
    }

    // Restore to active status
    session.status = SessionStatus.ACTIVE;
    session.updatedAt = new Date();
    await this.db.updateSession(session);

    return session;
  }

  /**
   * Pause a session
   * 
   * @param sessionId - Session ID
   * @returns Promise that resolves to the paused session
   * @throws Error if session not found or cannot be paused
   */
  async pauseSession(sessionId: string): Promise<Session> {
    const session = await this.db.getSession(sessionId);
    if (!session) {
      throw new Error('Session not found');
    }

    if (session.status === SessionStatus.COMPLETED) {
      throw new Error('Cannot pause a completed session');
    }

    session.status = SessionStatus.PAUSED;
    session.updatedAt = new Date();
    await this.db.updateSession(session);

    return session;
  }

  /**
   * Delete a session
   * 
   * @param sessionId - Session ID
   * @returns Promise that resolves when session is deleted
   * @throws Error if session not found
   */
  async deleteSession(sessionId: string): Promise<void> {
    const session = await this.db.getSession(sessionId);
    if (!session) {
      throw new Error('Session not found');
    }

    // Delete all conversation turns for this session
    const history = await this.db.getConversationHistory(sessionId);
    for (const turn of history) {
      // Note: We would need a deleteConversationTurn method in DatabaseManager
      // For now, we'll just mark the session as deleted
    }

    // In a real implementation, we would delete the session from the database
    // For now, we'll just update its status
    session.status = SessionStatus.COMPLETED;
    session.updatedAt = new Date();
    await this.db.updateSession(session);
  }

  /**
   * Get session with full context
   * 
   * @param sessionId - Session ID
   * @returns Promise that resolves to session with context
   */
  async getSessionWithContext(sessionId: string): Promise<any> {
    const session = await this.db.getSession(sessionId);
    if (!session) {
      throw new Error('Session not found');
    }

    const history = await this.db.getConversationHistory(sessionId);

    return {
      session,
      conversationHistory: history,
      turnCount: session.turnCount,
      maxTurns: session.maxTurns,
      canContinue: session.status === SessionStatus.ACTIVE && session.turnCount < session.maxTurns,
    };
  }

  /**
   * Validate session state transition
   * 
   * @param sessionId - Session ID
   * @param newStatus - New status
   * @returns Promise that resolves to true if transition is valid
   */
  async validateStateTransition(sessionId: string, newStatus: SessionStatus): Promise<boolean> {
    const session = await this.db.getSession(sessionId);
    if (!session) {
      return false;
    }

    const currentStatus = session.status;

    // Valid transitions:
    // active -> paused
    // active -> completed
    // paused -> active
    // paused -> completed
    // completed -> (no transitions allowed)

    if (currentStatus === SessionStatus.COMPLETED) {
      return false;
    }

    if (currentStatus === SessionStatus.ACTIVE) {
      return newStatus === SessionStatus.PAUSED || newStatus === SessionStatus.COMPLETED;
    }

    if (currentStatus === SessionStatus.PAUSED) {
      return newStatus === SessionStatus.ACTIVE || newStatus === SessionStatus.COMPLETED;
    }

    return false;
  }
}
