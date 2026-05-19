/**
 * Core TypeScript interfaces and types for the Dating Assistant application
 * Defines all data models, enums, and validation types used throughout the system
 */

// ============================================================================
// ENUMS
// ============================================================================

/**
 * User mode - determines which AI coach the user interacts with
 */
export enum UserMode {
  FEMALE = 'female',
  MALE = 'male',
}

/**
 * Session mode - determines the type of conversation
 */
export enum SessionMode {
  BESTIE = 'bestie',
  WINGMAN = 'wingman',
}

/**
 * Sub-mode for AI Bestie - determines the specific task
 */
export enum BestieSubMode {
  INTERVIEW = 'interview',
  PREFERENCES = 'preferences',
}

/**
 * Session status - tracks the lifecycle of a conversation
 */
export enum SessionStatus {
  ACTIVE = 'active',
  COMPLETED = 'completed',
  PAUSED = 'paused',
}

/**
 * Knowledge base type - determines the purpose and scope of the KB
 */
export enum KBType {
  FEMALE_PREFERENCES = 'female_preferences',
  DATING_EXPERTISE = 'dating_expertise',
}

// ============================================================================
// USER PROFILE INTERFACES
// ============================================================================

/**
 * User profile metadata - optional fields for user customization
 */
export interface UserProfileMetadata {
  ageRange?: string;
  location?: string;
  interests?: string[];
}

/**
 * User profile - represents a Dating Assistant user
 * Validates: Requirements 1, 14
 */
export interface UserProfile {
  userId: string;
  mode: UserMode;
  username: string;
  createdAt: Date;
  updatedAt: Date;
  metadata: UserProfileMetadata;
}

// ============================================================================
// SESSION INTERFACES
// ============================================================================

/**
 * Conversation session - represents a bounded conversation with max 50 turns
 * Validates: Requirements 2, 14, 22
 */
export interface Session {
  sessionId: string;
  userId: string;
  mode: SessionMode;
  subMode?: BestieSubMode;
  turnCount: number;
  maxTurns: number;
  status: SessionStatus;
  createdAt: Date;
  updatedAt: Date;
  matchId?: string;
}

// ============================================================================
// CONVERSATION TURN INTERFACES
// ============================================================================

/**
 * Conversation turn metadata - optional performance and usage metrics
 */
export interface ConversationTurnMetadata {
  tokensUsed?: number;
  responseTime?: number;
}

/**
 * Conversation turn - represents a single exchange in a session
 * Validates: Requirements 6, 9, 14
 */
export interface ConversationTurn {
  turnId: string;
  sessionId: string;
  turnNumber: number;
  userMessage: string;
  assistantMessage: string;
  timestamp: Date;
  metadata: ConversationTurnMetadata;
}

// ============================================================================
// CUSTOM PROMPT INTERFACES
// ============================================================================

/**
 * Custom prompt - user-defined instruction that modifies AI behavior
 * Validates: Requirements 7, 14
 */
export interface CustomPrompt {
  promptId: string;
  userId: string;
  name: string;
  content: string;
  mode: SessionMode;
  createdAt: Date;
  updatedAt: Date;
}

// ============================================================================
// MATCH PROFILE INTERFACES
// ============================================================================

/**
 * Match profile - information about a potential romantic partner
 * Validates: Requirements 12, 14
 */
export interface MatchProfile {
  matchId: string;
  userId: string;
  matchName: string;
  matchInfo: string;
  createdAt: Date;
  updatedAt: Date;
  interviewSessions: string[];
}

// ============================================================================
// KNOWLEDGE BASE INTERFACES
// ============================================================================

/**
 * Knowledge base - structured information used to inform AI responses
 * Validates: Requirements 8, 14
 */
export interface KnowledgeBase {
  kbId: string;
  userId?: string;
  type: KBType;
  content: string;
  sourceData: Record<string, any>;
  createdAt: Date;
  updatedAt: Date;
  version: number;
}

// ============================================================================
// SESSION CONTEXT INTERFACES
// ============================================================================

/**
 * Session context - accumulated conversation history and metadata for prompt building
 * Validates: Requirements 9, 10
 */
export interface SessionContext {
  sessionId: string;
  userId: string;
  mode: SessionMode;
  subMode?: BestieSubMode;
  turnCount: number;
  maxTurns: number;
  conversationHistory: ConversationTurn[];
  userProfile?: UserProfile;
  matchProfile?: MatchProfile;
  matchId?: string;
  preferencesKB?: KnowledgeBase;
  datingExpertiseKB?: KnowledgeBase;
  customPrompts?: CustomPrompt[];
}

// ============================================================================
// ENGINE RESPONSE INTERFACES
// ============================================================================

/**
 * Engine response - result of processing user input
 */
export interface EngineResponse {
  message: string;
  turnNumber: number;
  turnsRemaining: number;
}

/**
 * Session summary - summary of a completed session
 */
export interface SessionSummary {
  sessionId: string;
  userId: string;
  mode: SessionMode;
  subMode?: BestieSubMode;
  totalTurns: number;
  createdAt: Date;
  completedAt: Date;
  keyInsights?: string[];
  matchId?: string;
}

// ============================================================================
// ANALYSIS RESULT INTERFACES
// ============================================================================

/**
 * Analysis result - result of analyzing match responses
 */
export interface AnalysisResult {
  analysis: string;
  followUpQuestions: string[];
  redFlags?: string[];
}

// ============================================================================
// VALIDATION TYPES
// ============================================================================

/**
 * Validation result - result of validating data
 */
export interface ValidationResult {
  isValid: boolean;
  errors: ValidationError[];
}

/**
 * Validation error - specific validation error
 */
export interface ValidationError {
  field: string;
  message: string;
}

// ============================================================================
// TYPE GUARDS
// ============================================================================

/**
 * Type guard to check if a value is a valid UserMode
 */
export function isUserMode(value: any): value is UserMode {
  return Object.values(UserMode).includes(value);
}

/**
 * Type guard to check if a value is a valid SessionMode
 */
export function isSessionMode(value: any): value is SessionMode {
  return Object.values(SessionMode).includes(value);
}

/**
 * Type guard to check if a value is a valid BestieSubMode
 */
export function isBestieSubMode(value: any): value is BestieSubMode {
  return Object.values(BestieSubMode).includes(value);
}

/**
 * Type guard to check if a value is a valid SessionStatus
 */
export function isSessionStatus(value: any): value is SessionStatus {
  return Object.values(SessionStatus).includes(value);
}

/**
 * Type guard to check if a value is a valid KBType
 */
export function isKBType(value: any): value is KBType {
  return Object.values(KBType).includes(value);
}

/**
 * Type guard to check if an object is a UserProfile
 */
export function isUserProfile(value: any): value is UserProfile {
  return (
    value !== null &&
    value !== undefined &&
    typeof value === 'object' &&
    typeof value.userId === 'string' &&
    isUserMode(value.mode) &&
    typeof value.username === 'string' &&
    value.createdAt instanceof Date &&
    value.updatedAt instanceof Date &&
    typeof value.metadata === 'object'
  );
}

/**
 * Type guard to check if an object is a Session
 */
export function isSession(value: any): value is Session {
  return (
    value !== null &&
    value !== undefined &&
    typeof value === 'object' &&
    typeof value.sessionId === 'string' &&
    typeof value.userId === 'string' &&
    isSessionMode(value.mode) &&
    typeof value.turnCount === 'number' &&
    typeof value.maxTurns === 'number' &&
    isSessionStatus(value.status) &&
    value.createdAt instanceof Date &&
    value.updatedAt instanceof Date
  );
}

/**
 * Type guard to check if an object is a ConversationTurn
 */
export function isConversationTurn(value: any): value is ConversationTurn {
  return (
    value !== null &&
    value !== undefined &&
    typeof value === 'object' &&
    typeof value.turnId === 'string' &&
    typeof value.sessionId === 'string' &&
    typeof value.turnNumber === 'number' &&
    typeof value.userMessage === 'string' &&
    typeof value.assistantMessage === 'string' &&
    value.timestamp instanceof Date &&
    typeof value.metadata === 'object'
  );
}

/**
 * Type guard to check if an object is a CustomPrompt
 */
export function isCustomPrompt(value: any): value is CustomPrompt {
  return (
    value !== null &&
    value !== undefined &&
    typeof value === 'object' &&
    typeof value.promptId === 'string' &&
    typeof value.userId === 'string' &&
    typeof value.name === 'string' &&
    typeof value.content === 'string' &&
    isSessionMode(value.mode) &&
    value.createdAt instanceof Date &&
    value.updatedAt instanceof Date
  );
}

/**
 * Type guard to check if an object is a MatchProfile
 */
export function isMatchProfile(value: any): value is MatchProfile {
  return (
    value !== null &&
    value !== undefined &&
    typeof value === 'object' &&
    typeof value.matchId === 'string' &&
    typeof value.userId === 'string' &&
    typeof value.matchName === 'string' &&
    typeof value.matchInfo === 'string' &&
    value.createdAt instanceof Date &&
    value.updatedAt instanceof Date &&
    Array.isArray(value.interviewSessions)
  );
}

/**
 * Type guard to check if an object is a KnowledgeBase
 */
export function isKnowledgeBase(value: any): value is KnowledgeBase {
  return (
    value !== null &&
    value !== undefined &&
    typeof value === 'object' &&
    typeof value.kbId === 'string' &&
    isKBType(value.type) &&
    typeof value.content === 'string' &&
    typeof value.sourceData === 'object' &&
    value.createdAt instanceof Date &&
    value.updatedAt instanceof Date &&
    typeof value.version === 'number'
  );
}

// ============================================================================
// CONSTANTS
// ============================================================================

/**
 * Maximum number of turns per session
 */
export const MAX_TURNS_PER_SESSION = 50;

/**
 * Maximum number of custom prompts per user
 */
export const MAX_CUSTOM_PROMPTS_PER_USER = 20;

/**
 * Default knowledge base version
 */
export const DEFAULT_KB_VERSION = 1;

/**
 * API response timeout in milliseconds
 */
export const API_RESPONSE_TIMEOUT = 30000;

/**
 * Database operation timeout in milliseconds
 */
export const DB_OPERATION_TIMEOUT = 5000;
