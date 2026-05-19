import {
  UserProfile,
  Session,
  ConversationTurn,
  CustomPrompt,
  MatchProfile,
  KnowledgeBase,
  ValidationResult,
  ValidationError,
} from '../models/types.js';

/**
 * Validation utilities for all data models
 * 
 * Validates: Requirements 14, 13
 */
export class Validators {
  /**
   * Validate a user profile
   */
  static validateUserProfile(profile: any): ValidationResult {
    const errors: ValidationError[] = [];

    if (!profile.userId || typeof profile.userId !== 'string') {
      errors.push({ field: 'userId', message: 'userId must be a non-empty string' });
    }

    if (!profile.mode || !['female', 'male'].includes(profile.mode)) {
      errors.push({ field: 'mode', message: 'mode must be either "female" or "male"' });
    }

    if (!profile.username || typeof profile.username !== 'string') {
      errors.push({ field: 'username', message: 'username must be a non-empty string' });
    }

    if (!(profile.createdAt instanceof Date)) {
      errors.push({ field: 'createdAt', message: 'createdAt must be a valid Date' });
    }

    if (!(profile.updatedAt instanceof Date)) {
      errors.push({ field: 'updatedAt', message: 'updatedAt must be a valid Date' });
    }

    return {
      isValid: errors.length === 0,
      errors,
    };
  }

  /**
   * Validate a session
   */
  static validateSession(session: any): ValidationResult {
    const errors: ValidationError[] = [];

    if (!session.sessionId || typeof session.sessionId !== 'string') {
      errors.push({ field: 'sessionId', message: 'sessionId must be a non-empty string' });
    }

    if (!session.userId || typeof session.userId !== 'string') {
      errors.push({ field: 'userId', message: 'userId must be a non-empty string' });
    }

    if (!session.mode || !['bestie', 'wingman'].includes(session.mode)) {
      errors.push({ field: 'mode', message: 'mode must be either "bestie" or "wingman"' });
    }

    if (typeof session.turnCount !== 'number' || session.turnCount < 0) {
      errors.push({ field: 'turnCount', message: 'turnCount must be a non-negative number' });
    }

    if (typeof session.maxTurns !== 'number' || session.maxTurns !== 50) {
      errors.push({ field: 'maxTurns', message: 'maxTurns must be 50' });
    }

    if (!session.status || !['active', 'completed', 'paused'].includes(session.status)) {
      errors.push({ field: 'status', message: 'status must be one of: active, completed, paused' });
    }

    if (!(session.createdAt instanceof Date)) {
      errors.push({ field: 'createdAt', message: 'createdAt must be a valid Date' });
    }

    if (!(session.updatedAt instanceof Date)) {
      errors.push({ field: 'updatedAt', message: 'updatedAt must be a valid Date' });
    }

    return {
      isValid: errors.length === 0,
      errors,
    };
  }

  /**
   * Validate a conversation turn
   */
  static validateConversationTurn(turn: any): ValidationResult {
    const errors: ValidationError[] = [];

    if (!turn.turnId || typeof turn.turnId !== 'string') {
      errors.push({ field: 'turnId', message: 'turnId must be a non-empty string' });
    }

    if (!turn.sessionId || typeof turn.sessionId !== 'string') {
      errors.push({ field: 'sessionId', message: 'sessionId must be a non-empty string' });
    }

    if (typeof turn.turnNumber !== 'number' || turn.turnNumber < 1) {
      errors.push({ field: 'turnNumber', message: 'turnNumber must be a positive number' });
    }

    if (!turn.userMessage || typeof turn.userMessage !== 'string') {
      errors.push({ field: 'userMessage', message: 'userMessage must be a non-empty string' });
    }

    if (!turn.assistantMessage || typeof turn.assistantMessage !== 'string') {
      errors.push({ field: 'assistantMessage', message: 'assistantMessage must be a non-empty string' });
    }

    if (!(turn.timestamp instanceof Date)) {
      errors.push({ field: 'timestamp', message: 'timestamp must be a valid Date' });
    }

    return {
      isValid: errors.length === 0,
      errors,
    };
  }

  /**
   * Validate a custom prompt
   */
  static validateCustomPrompt(prompt: any): ValidationResult {
    const errors: ValidationError[] = [];

    if (!prompt.promptId || typeof prompt.promptId !== 'string') {
      errors.push({ field: 'promptId', message: 'promptId must be a non-empty string' });
    }

    if (!prompt.userId || typeof prompt.userId !== 'string') {
      errors.push({ field: 'userId', message: 'userId must be a non-empty string' });
    }

    if (!prompt.name || typeof prompt.name !== 'string') {
      errors.push({ field: 'name', message: 'name must be a non-empty string' });
    }

    if (!prompt.content || typeof prompt.content !== 'string') {
      errors.push({ field: 'content', message: 'content must be a non-empty string' });
    }

    if (!prompt.mode || !['bestie', 'wingman'].includes(prompt.mode)) {
      errors.push({ field: 'mode', message: 'mode must be either "bestie" or "wingman"' });
    }

    if (!(prompt.createdAt instanceof Date)) {
      errors.push({ field: 'createdAt', message: 'createdAt must be a valid Date' });
    }

    if (!(prompt.updatedAt instanceof Date)) {
      errors.push({ field: 'updatedAt', message: 'updatedAt must be a valid Date' });
    }

    return {
      isValid: errors.length === 0,
      errors,
    };
  }

  /**
   * Validate a match profile
   */
  static validateMatchProfile(profile: any): ValidationResult {
    const errors: ValidationError[] = [];

    if (!profile.matchId || typeof profile.matchId !== 'string') {
      errors.push({ field: 'matchId', message: 'matchId must be a non-empty string' });
    }

    if (!profile.userId || typeof profile.userId !== 'string') {
      errors.push({ field: 'userId', message: 'userId must be a non-empty string' });
    }

    if (!profile.matchName || typeof profile.matchName !== 'string') {
      errors.push({ field: 'matchName', message: 'matchName must be a non-empty string' });
    }

    if (!profile.matchInfo || typeof profile.matchInfo !== 'string') {
      errors.push({ field: 'matchInfo', message: 'matchInfo must be a non-empty string' });
    }

    if (!(profile.createdAt instanceof Date)) {
      errors.push({ field: 'createdAt', message: 'createdAt must be a valid Date' });
    }

    if (!(profile.updatedAt instanceof Date)) {
      errors.push({ field: 'updatedAt', message: 'updatedAt must be a valid Date' });
    }

    return {
      isValid: errors.length === 0,
      errors,
    };
  }

  /**
   * Validate a knowledge base
   */
  static validateKnowledgeBase(kb: any): ValidationResult {
    const errors: ValidationError[] = [];

    if (!kb.kbId || typeof kb.kbId !== 'string') {
      errors.push({ field: 'kbId', message: 'kbId must be a non-empty string' });
    }

    if (kb.userId !== null && kb.userId !== undefined && typeof kb.userId !== 'string') {
      errors.push({ field: 'userId', message: 'userId must be a string or null' });
    }

    if (!kb.type || !['female_preferences', 'dating_expertise'].includes(kb.type)) {
      errors.push({ field: 'type', message: 'type must be either "female_preferences" or "dating_expertise"' });
    }

    if (!kb.content || typeof kb.content !== 'string') {
      errors.push({ field: 'content', message: 'content must be a non-empty string' });
    }

    if (typeof kb.sourceData !== 'object' || kb.sourceData === null) {
      errors.push({ field: 'sourceData', message: 'sourceData must be an object' });
    }

    if (!(kb.createdAt instanceof Date)) {
      errors.push({ field: 'createdAt', message: 'createdAt must be a valid Date' });
    }

    if (!(kb.updatedAt instanceof Date)) {
      errors.push({ field: 'updatedAt', message: 'updatedAt must be a valid Date' });
    }

    if (typeof kb.version !== 'number' || kb.version < 1) {
      errors.push({ field: 'version', message: 'version must be a number >= 1' });
    }

    return {
      isValid: errors.length === 0,
      errors,
    };
  }
}
