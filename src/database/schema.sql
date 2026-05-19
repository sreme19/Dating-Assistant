-- Dating Assistant SQLite Database Schema

-- Enable foreign keys
PRAGMA foreign_keys = ON;

-- Users table
CREATE TABLE IF NOT EXISTS users (
  userId TEXT PRIMARY KEY NOT NULL,
  mode TEXT NOT NULL CHECK (mode IN ('female', 'male')),
  username TEXT NOT NULL UNIQUE,
  createdAt TEXT NOT NULL,
  updatedAt TEXT NOT NULL,
  ageRange TEXT,
  location TEXT,
  interests TEXT
);

-- Sessions table
CREATE TABLE IF NOT EXISTS sessions (
  sessionId TEXT PRIMARY KEY NOT NULL,
  userId TEXT NOT NULL,
  mode TEXT NOT NULL CHECK (mode IN ('bestie', 'wingman')),
  subMode TEXT CHECK (subMode IN ('interview', 'preferences', NULL)),
  turnCount INTEGER NOT NULL DEFAULT 0 CHECK (turnCount >= 0 AND turnCount <= 50),
  maxTurns INTEGER NOT NULL DEFAULT 50,
  status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'completed', 'paused')),
  createdAt TEXT NOT NULL,
  updatedAt TEXT NOT NULL,
  matchId TEXT,
  FOREIGN KEY (userId) REFERENCES users(userId) ON DELETE CASCADE,
  FOREIGN KEY (matchId) REFERENCES matches(matchId) ON DELETE SET NULL
);

-- Conversation turns table
CREATE TABLE IF NOT EXISTS conversation_turns (
  turnId TEXT PRIMARY KEY NOT NULL,
  sessionId TEXT NOT NULL,
  turnNumber INTEGER NOT NULL CHECK (turnNumber >= 1),
  userMessage TEXT NOT NULL,
  assistantMessage TEXT NOT NULL,
  timestamp TEXT NOT NULL,
  tokensUsed INTEGER,
  responseTime INTEGER,
  FOREIGN KEY (sessionId) REFERENCES sessions(sessionId) ON DELETE CASCADE,
  UNIQUE (sessionId, turnNumber)
);

-- Custom prompts table
CREATE TABLE IF NOT EXISTS custom_prompts (
  promptId TEXT PRIMARY KEY NOT NULL,
  userId TEXT NOT NULL,
  name TEXT NOT NULL,
  content TEXT NOT NULL,
  mode TEXT NOT NULL CHECK (mode IN ('bestie', 'wingman')),
  createdAt TEXT NOT NULL,
  updatedAt TEXT NOT NULL,
  FOREIGN KEY (userId) REFERENCES users(userId) ON DELETE CASCADE,
  UNIQUE (userId, name)
);

-- Match profiles table
CREATE TABLE IF NOT EXISTS matches (
  matchId TEXT PRIMARY KEY NOT NULL,
  userId TEXT NOT NULL,
  matchName TEXT NOT NULL,
  matchInfo TEXT NOT NULL,
  createdAt TEXT NOT NULL,
  updatedAt TEXT NOT NULL,
  FOREIGN KEY (userId) REFERENCES users(userId) ON DELETE CASCADE
);

-- Knowledge bases table
CREATE TABLE IF NOT EXISTS knowledge_bases (
  kbId TEXT PRIMARY KEY NOT NULL,
  userId TEXT,
  type TEXT NOT NULL CHECK (type IN ('female_preferences', 'dating_expertise')),
  content TEXT NOT NULL,
  sourceData TEXT,
  createdAt TEXT NOT NULL,
  updatedAt TEXT NOT NULL,
  version INTEGER NOT NULL DEFAULT 1 CHECK (version >= 1),
  FOREIGN KEY (userId) REFERENCES users(userId) ON DELETE CASCADE
);

-- Indexes for performance optimization

-- User queries
CREATE INDEX IF NOT EXISTS idx_users_username ON users(username);

-- Session queries
CREATE INDEX IF NOT EXISTS idx_sessions_userId ON sessions(userId);
CREATE INDEX IF NOT EXISTS idx_sessions_status ON sessions(status);
CREATE INDEX IF NOT EXISTS idx_sessions_createdAt ON sessions(createdAt);

-- Conversation turn queries
CREATE INDEX IF NOT EXISTS idx_turns_sessionId ON conversation_turns(sessionId);
CREATE INDEX IF NOT EXISTS idx_turns_sessionId_turnNumber ON conversation_turns(sessionId, turnNumber);

-- Custom prompt queries
CREATE INDEX IF NOT EXISTS idx_prompts_userId ON custom_prompts(userId);
CREATE INDEX IF NOT EXISTS idx_prompts_userId_mode ON custom_prompts(userId, mode);

-- Match profile queries
CREATE INDEX IF NOT EXISTS idx_matches_userId ON matches(userId);

-- Knowledge base queries
CREATE INDEX IF NOT EXISTS idx_kb_userId_type ON knowledge_bases(userId, type);
CREATE INDEX IF NOT EXISTS idx_kb_type ON knowledge_bases(type);
