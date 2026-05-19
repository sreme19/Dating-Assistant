/**
 * Unit tests for core TypeScript interfaces and types
 * Validates: Requirements 1, 2, 14
 */

import { describe, it, expect } from 'vitest';
import {
  UserMode,
  SessionMode,
  BestieSubMode,
  SessionStatus,
  KBType,
  UserProfile,
  Session,
  ConversationTurn,
  CustomPrompt,
  MatchProfile,
  KnowledgeBase,
  SessionContext,
  EngineResponse,
  SessionSummary,
  AnalysisResult,
  ValidationResult,
  isUserMode,
  isSessionMode,
  isBestieSubMode,
  isSessionStatus,
  isKBType,
  isUserProfile,
  isSession,
  isConversationTurn,
  isCustomPrompt,
  isMatchProfile,
  isKnowledgeBase,
  MAX_TURNS_PER_SESSION,
  MAX_CUSTOM_PROMPTS_PER_USER,
  DEFAULT_KB_VERSION,
  API_RESPONSE_TIMEOUT,
  DB_OPERATION_TIMEOUT,
} from './types';

// ============================================================================
// ENUM TESTS
// ============================================================================

describe('Enums', () => {
  describe('UserMode', () => {
    it('should have FEMALE and MALE values', () => {
      expect(UserMode.FEMALE).toBe('female');
      expect(UserMode.MALE).toBe('male');
    });
  });

  describe('SessionMode', () => {
    it('should have BESTIE and WINGMAN values', () => {
      expect(SessionMode.BESTIE).toBe('bestie');
      expect(SessionMode.WINGMAN).toBe('wingman');
    });
  });

  describe('BestieSubMode', () => {
    it('should have INTERVIEW and PREFERENCES values', () => {
      expect(BestieSubMode.INTERVIEW).toBe('interview');
      expect(BestieSubMode.PREFERENCES).toBe('preferences');
    });
  });

  describe('SessionStatus', () => {
    it('should have ACTIVE, COMPLETED, and PAUSED values', () => {
      expect(SessionStatus.ACTIVE).toBe('active');
      expect(SessionStatus.COMPLETED).toBe('completed');
      expect(SessionStatus.PAUSED).toBe('paused');
    });
  });

  describe('KBType', () => {
    it('should have FEMALE_PREFERENCES and DATING_EXPERTISE values', () => {
      expect(KBType.FEMALE_PREFERENCES).toBe('female_preferences');
      expect(KBType.DATING_EXPERTISE).toBe('dating_expertise');
    });
  });
});

// ============================================================================
// TYPE GUARD TESTS
// ============================================================================

describe('Type Guards', () => {
  describe('isUserMode', () => {
    it('should return true for valid UserMode values', () => {
      expect(isUserMode('female')).toBe(true);
      expect(isUserMode('male')).toBe(true);
    });

    it('should return false for invalid values', () => {
      expect(isUserMode('invalid')).toBe(false);
      expect(isUserMode(null)).toBe(false);
      expect(isUserMode(undefined)).toBe(false);
      expect(isUserMode(123)).toBe(false);
    });
  });

  describe('isSessionMode', () => {
    it('should return true for valid SessionMode values', () => {
      expect(isSessionMode('bestie')).toBe(true);
      expect(isSessionMode('wingman')).toBe(true);
    });

    it('should return false for invalid values', () => {
      expect(isSessionMode('invalid')).toBe(false);
      expect(isSessionMode(null)).toBe(false);
      expect(isSessionMode(undefined)).toBe(false);
    });
  });

  describe('isBestieSubMode', () => {
    it('should return true for valid BestieSubMode values', () => {
      expect(isBestieSubMode('interview')).toBe(true);
      expect(isBestieSubMode('preferences')).toBe(true);
    });

    it('should return false for invalid values', () => {
      expect(isBestieSubMode('invalid')).toBe(false);
      expect(isBestieSubMode(null)).toBe(false);
    });
  });

  describe('isSessionStatus', () => {
    it('should return true for valid SessionStatus values', () => {
      expect(isSessionStatus('active')).toBe(true);
      expect(isSessionStatus('completed')).toBe(true);
      expect(isSessionStatus('paused')).toBe(true);
    });

    it('should return false for invalid values', () => {
      expect(isSessionStatus('invalid')).toBe(false);
      expect(isSessionStatus(null)).toBe(false);
    });
  });

  describe('isKBType', () => {
    it('should return true for valid KBType values', () => {
      expect(isKBType('female_preferences')).toBe(true);
      expect(isKBType('dating_expertise')).toBe(true);
    });

    it('should return false for invalid values', () => {
      expect(isKBType('invalid')).toBe(false);
      expect(isKBType(null)).toBe(false);
    });
  });

  describe('isUserProfile', () => {
    it('should return true for valid UserProfile objects', () => {
      const profile: UserProfile = {
        userId: 'user-001',
        mode: UserMode.FEMALE,
        username: 'jane_doe',
        createdAt: new Date(),
        updatedAt: new Date(),
        metadata: {
          ageRange: '25-30',
          location: 'New York',
          interests: ['hiking', 'reading'],
        },
      };
      expect(isUserProfile(profile)).toBe(true);
    });

    it('should return false for invalid UserProfile objects', () => {
      expect(isUserProfile(null)).toBe(false);
      expect(isUserProfile({})).toBe(false);
      expect(isUserProfile({ userId: 'user-001' })).toBe(false);
      expect(
        isUserProfile({
          userId: 'user-001',
          mode: 'invalid',
          username: 'jane_doe',
          createdAt: new Date(),
          updatedAt: new Date(),
          metadata: {},
        })
      ).toBe(false);
    });
  });

  describe('isSession', () => {
    it('should return true for valid Session objects', () => {
      const session: Session = {
        sessionId: 'session-001',
        userId: 'user-001',
        mode: SessionMode.BESTIE,
        subMode: BestieSubMode.INTERVIEW,
        turnCount: 5,
        maxTurns: 50,
        status: SessionStatus.ACTIVE,
        createdAt: new Date(),
        updatedAt: new Date(),
        matchId: 'match-001',
      };
      expect(isSession(session)).toBe(true);
    });

    it('should return false for invalid Session objects', () => {
      expect(isSession(null)).toBe(false);
      expect(isSession({})).toBe(false);
      expect(
        isSession({
          sessionId: 'session-001',
          userId: 'user-001',
          mode: 'invalid',
          turnCount: 5,
          maxTurns: 50,
          status: 'active',
          createdAt: new Date(),
          updatedAt: new Date(),
        })
      ).toBe(false);
    });
  });

  describe('isConversationTurn', () => {
    it('should return true for valid ConversationTurn objects', () => {
      const turn: ConversationTurn = {
        turnId: 'turn-001',
        sessionId: 'session-001',
        turnNumber: 1,
        userMessage: 'Hello',
        assistantMessage: 'Hi there!',
        timestamp: new Date(),
        metadata: {
          tokensUsed: 100,
          responseTime: 1500,
        },
      };
      expect(isConversationTurn(turn)).toBe(true);
    });

    it('should return false for invalid ConversationTurn objects', () => {
      expect(isConversationTurn(null)).toBe(false);
      expect(isConversationTurn({})).toBe(false);
      expect(
        isConversationTurn({
          turnId: 'turn-001',
          sessionId: 'session-001',
          turnNumber: 1,
          userMessage: 'Hello',
          assistantMessage: 'Hi there!',
          timestamp: 'not-a-date',
          metadata: {},
        })
      ).toBe(false);
    });
  });

  describe('isCustomPrompt', () => {
    it('should return true for valid CustomPrompt objects', () => {
      const prompt: CustomPrompt = {
        promptId: 'prompt-001',
        userId: 'user-001',
        name: 'Red Flag Detector',
        content: 'Focus on identifying red flags',
        mode: SessionMode.BESTIE,
        createdAt: new Date(),
        updatedAt: new Date(),
      };
      expect(isCustomPrompt(prompt)).toBe(true);
    });

    it('should return false for invalid CustomPrompt objects', () => {
      expect(isCustomPrompt(null)).toBe(false);
      expect(isCustomPrompt({})).toBe(false);
    });
  });

  describe('isMatchProfile', () => {
    it('should return true for valid MatchProfile objects', () => {
      const match: MatchProfile = {
        matchId: 'match-001',
        userId: 'user-001',
        matchName: 'John',
        matchInfo: 'Tech worker, 32, loves hiking',
        createdAt: new Date(),
        updatedAt: new Date(),
        interviewSessions: ['session-001', 'session-002'],
      };
      expect(isMatchProfile(match)).toBe(true);
    });

    it('should return false for invalid MatchProfile objects', () => {
      expect(isMatchProfile(null)).toBe(false);
      expect(isMatchProfile({})).toBe(false);
      expect(
        isMatchProfile({
          matchId: 'match-001',
          userId: 'user-001',
          matchName: 'John',
          matchInfo: 'Tech worker',
          createdAt: new Date(),
          updatedAt: new Date(),
          interviewSessions: 'not-an-array',
        })
      ).toBe(false);
    });
  });

  describe('isKnowledgeBase', () => {
    it('should return true for valid KnowledgeBase objects', () => {
      const kb: KnowledgeBase = {
        kbId: 'kb-001',
        userId: 'user-001',
        type: KBType.FEMALE_PREFERENCES,
        content: 'Preferences content',
        sourceData: { key: 'value' },
        createdAt: new Date(),
        updatedAt: new Date(),
        version: 1,
      };
      expect(isKnowledgeBase(kb)).toBe(true);
    });

    it('should return false for invalid KnowledgeBase objects', () => {
      expect(isKnowledgeBase(null)).toBe(false);
      expect(isKnowledgeBase({})).toBe(false);
      expect(
        isKnowledgeBase({
          kbId: 'kb-001',
          userId: 'user-001',
          type: 'invalid',
          content: 'Content',
          sourceData: {},
          createdAt: new Date(),
          updatedAt: new Date(),
          version: 1,
        })
      ).toBe(false);
    });
  });
});

// ============================================================================
// INTERFACE INSTANTIATION TESTS
// ============================================================================

describe('Interface Instantiation', () => {
  it('should create a valid UserProfile', () => {
    const profile: UserProfile = {
      userId: 'user-001',
      mode: UserMode.FEMALE,
      username: 'jane_doe',
      createdAt: new Date(),
      updatedAt: new Date(),
      metadata: {
        ageRange: '25-30',
        location: 'New York',
        interests: ['hiking', 'reading'],
      },
    };
    expect(profile.userId).toBe('user-001');
    expect(profile.mode).toBe(UserMode.FEMALE);
    expect(profile.username).toBe('jane_doe');
  });

  it('should create a valid Session', () => {
    const session: Session = {
      sessionId: 'session-001',
      userId: 'user-001',
      mode: SessionMode.BESTIE,
      subMode: BestieSubMode.INTERVIEW,
      turnCount: 0,
      maxTurns: 50,
      status: SessionStatus.ACTIVE,
      createdAt: new Date(),
      updatedAt: new Date(),
      matchId: 'match-001',
    };
    expect(session.sessionId).toBe('session-001');
    expect(session.turnCount).toBe(0);
    expect(session.maxTurns).toBe(50);
    expect(session.status).toBe(SessionStatus.ACTIVE);
  });

  it('should create a valid ConversationTurn', () => {
    const turn: ConversationTurn = {
      turnId: 'turn-001',
      sessionId: 'session-001',
      turnNumber: 1,
      userMessage: 'Hello',
      assistantMessage: 'Hi there!',
      timestamp: new Date(),
      metadata: {},
    };
    expect(turn.turnNumber).toBe(1);
    expect(turn.userMessage).toBe('Hello');
    expect(turn.assistantMessage).toBe('Hi there!');
  });

  it('should create a valid CustomPrompt', () => {
    const prompt: CustomPrompt = {
      promptId: 'prompt-001',
      userId: 'user-001',
      name: 'Red Flag Detector',
      content: 'Focus on identifying red flags',
      mode: SessionMode.BESTIE,
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    expect(prompt.name).toBe('Red Flag Detector');
    expect(prompt.mode).toBe(SessionMode.BESTIE);
  });

  it('should create a valid MatchProfile', () => {
    const match: MatchProfile = {
      matchId: 'match-001',
      userId: 'user-001',
      matchName: 'John',
      matchInfo: 'Tech worker, 32, loves hiking',
      createdAt: new Date(),
      updatedAt: new Date(),
      interviewSessions: [],
    };
    expect(match.matchName).toBe('John');
    expect(match.interviewSessions).toHaveLength(0);
  });

  it('should create a valid KnowledgeBase', () => {
    const kb: KnowledgeBase = {
      kbId: 'kb-001',
      userId: 'user-001',
      type: KBType.FEMALE_PREFERENCES,
      content: 'Preferences content',
      sourceData: {},
      createdAt: new Date(),
      updatedAt: new Date(),
      version: 1,
    };
    expect(kb.type).toBe(KBType.FEMALE_PREFERENCES);
    expect(kb.version).toBe(1);
  });

  it('should create a valid SessionContext', () => {
    const context: SessionContext = {
      sessionId: 'session-001',
      userId: 'user-001',
      mode: SessionMode.BESTIE,
      subMode: BestieSubMode.INTERVIEW,
      turnCount: 5,
      maxTurns: 50,
      conversationHistory: [],
    };
    expect(context.turnCount).toBe(5);
    expect(context.maxTurns).toBe(50);
    expect(context.conversationHistory).toHaveLength(0);
  });

  it('should create a valid EngineResponse', () => {
    const response: EngineResponse = {
      message: 'This is a response',
      turnNumber: 1,
      turnsRemaining: 49,
    };
    expect(response.message).toBe('This is a response');
    expect(response.turnsRemaining).toBe(49);
  });

  it('should create a valid SessionSummary', () => {
    const summary: SessionSummary = {
      sessionId: 'session-001',
      userId: 'user-001',
      mode: SessionMode.BESTIE,
      subMode: BestieSubMode.INTERVIEW,
      totalTurns: 10,
      createdAt: new Date(),
      completedAt: new Date(),
      keyInsights: ['Insight 1', 'Insight 2'],
      matchId: 'match-001',
    };
    expect(summary.totalTurns).toBe(10);
    expect(summary.keyInsights).toHaveLength(2);
  });

  it('should create a valid AnalysisResult', () => {
    const result: AnalysisResult = {
      analysis: 'This is an analysis',
      followUpQuestions: ['Question 1', 'Question 2'],
      redFlags: ['Red flag 1'],
    };
    expect(result.followUpQuestions).toHaveLength(2);
    expect(result.redFlags).toHaveLength(1);
  });

  it('should create a valid ValidationResult', () => {
    const result: ValidationResult = {
      isValid: false,
      errors: ['Error 1', 'Error 2'],
    };
    expect(result.isValid).toBe(false);
    expect(result.errors).toHaveLength(2);
  });
});

// ============================================================================
// CONSTANTS TESTS
// ============================================================================

describe('Constants', () => {
  it('should have correct MAX_TURNS_PER_SESSION', () => {
    expect(MAX_TURNS_PER_SESSION).toBe(50);
  });

  it('should have correct MAX_CUSTOM_PROMPTS_PER_USER', () => {
    expect(MAX_CUSTOM_PROMPTS_PER_USER).toBe(20);
  });

  it('should have correct DEFAULT_KB_VERSION', () => {
    expect(DEFAULT_KB_VERSION).toBe(1);
  });

  it('should have correct API_RESPONSE_TIMEOUT', () => {
    expect(API_RESPONSE_TIMEOUT).toBe(30000);
  });

  it('should have correct DB_OPERATION_TIMEOUT', () => {
    expect(DB_OPERATION_TIMEOUT).toBe(5000);
  });
});

// ============================================================================
// EDGE CASE TESTS
// ============================================================================

describe('Edge Cases', () => {
  it('should handle UserProfile with minimal metadata', () => {
    const profile: UserProfile = {
      userId: 'user-001',
      mode: UserMode.MALE,
      username: 'john_doe',
      createdAt: new Date(),
      updatedAt: new Date(),
      metadata: {},
    };
    expect(profile.metadata).toEqual({});
  });

  it('should handle Session without optional fields', () => {
    const session: Session = {
      sessionId: 'session-001',
      userId: 'user-001',
      mode: SessionMode.WINGMAN,
      turnCount: 0,
      maxTurns: 50,
      status: SessionStatus.ACTIVE,
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    expect(session.subMode).toBeUndefined();
    expect(session.matchId).toBeUndefined();
  });

  it('should handle ConversationTurn with empty metadata', () => {
    const turn: ConversationTurn = {
      turnId: 'turn-001',
      sessionId: 'session-001',
      turnNumber: 1,
      userMessage: 'Test',
      assistantMessage: 'Response',
      timestamp: new Date(),
      metadata: {},
    };
    expect(turn.metadata.tokensUsed).toBeUndefined();
    expect(turn.metadata.responseTime).toBeUndefined();
  });

  it('should handle MatchProfile with empty interview sessions', () => {
    const match: MatchProfile = {
      matchId: 'match-001',
      userId: 'user-001',
      matchName: 'Jane',
      matchInfo: 'Info',
      createdAt: new Date(),
      updatedAt: new Date(),
      interviewSessions: [],
    };
    expect(match.interviewSessions).toHaveLength(0);
  });

  it('should handle KnowledgeBase without userId (global KB)', () => {
    const kb: KnowledgeBase = {
      kbId: 'kb-global-001',
      type: KBType.DATING_EXPERTISE,
      content: 'Global dating expertise',
      sourceData: {},
      createdAt: new Date(),
      updatedAt: new Date(),
      version: 1,
    };
    expect(kb.userId).toBeUndefined();
  });

  it('should handle SessionContext with optional fields', () => {
    const context: SessionContext = {
      sessionId: 'session-001',
      userId: 'user-001',
      mode: SessionMode.WINGMAN,
      turnCount: 0,
      maxTurns: 50,
      conversationHistory: [],
    };
    expect(context.subMode).toBeUndefined();
    expect(context.userProfile).toBeUndefined();
    expect(context.customPrompts).toBeUndefined();
  });
});
