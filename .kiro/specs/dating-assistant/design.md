# Design Document: Dating Assistant

## Overview

The Dating Assistant is a local CLI-based AI dating coach system that provides personalized dating advice and interview capabilities through two distinct modes: AI Bestie (for female users) and AI Wingman (for male users). The system leverages Claude AI for intelligent conversation, SQLite for local data persistence, and supports multi-turn conversations with custom prompt management. The application operates entirely on the user's local machine with no server hosting requirements.

The system is designed to handle complex dating scenarios through specialized knowledge bases, profile management, and context-aware conversation flows. Female users benefit from AI Bestie's ability to interview male matches and gather preference information, while male users receive strategic dating advice grounded in relationship expertise.

## Architecture

```mermaid
graph TD
    A[CLI Entry Point] --> B{User Mode Selection}
    B -->|Female User| C[AI Bestie Mode]
    B -->|Male User| D[AI Wingman Mode]
    
    C --> C1[Sub-mode A: Interview Matches]
    C --> C2[Sub-mode B: Gather Preferences]
    
    C1 --> E[Conversation Engine]
    C2 --> E
    D --> E
    
    E --> F[Claude API Client]
    E --> G[SQLite Database]
    E --> H[Knowledge Base Manager]
    
    G --> G1[User Profiles]
    G --> G2[Conversation History]
    G --> G3[Custom Prompts]
    G --> G4[Match Profiles]
    G --> G5[Knowledge Base]
    
    H --> H1[Female Preferences KB]
    H --> H2[Art of Dating KB]
    
    F --> I[Claude LLM]


## Sequence Diagrams

### AI Bestie Mode - Interview Matches Flow

```mermaid
sequenceDiagram
    participant User as Female User
    participant CLI as CLI Interface
    participant Engine as Conversation Engine
    participant KB as Knowledge Base
    participant Claude as Claude API
    participant DB as SQLite DB
    
    User->>CLI: Select AI Bestie > Interview Mode
    CLI->>Engine: Initialize session with female profile
    Engine->>DB: Load female user profile & preferences
    DB-->>Engine: Profile data + KB context
    Engine->>KB: Retrieve female preferences KB
    KB-->>Engine: Preference context
    
    User->>CLI: Provide male match info
    CLI->>Engine: Process match input
    Engine->>Claude: Generate interview questions (with context)
    Claude-->>Engine: Questions + reasoning
    Engine->>DB: Store conversation turn
    Engine->>CLI: Display questions to user
    
    User->>CLI: Enter male match responses
    CLI->>Engine: Process response
    Engine->>Claude: Analyze response + generate follow-up
    Claude-->>Engine: Analysis + next questions
    Engine->>DB: Store conversation turn
    Engine->>CLI: Display analysis & next questions
    
    Note over User,DB: Repeat until 50 turns or user exits
    
    User->>CLI: End session
    CLI->>Engine: Finalize session
    Engine->>DB: Store final conversation summary
    DB-->>Engine: Confirmation
    Engine->>CLI: Display session summary


### AI Bestie Mode - Gather Preferences Flow

```mermaid
sequenceDiagram
    participant User as Female User
    participant CLI as CLI Interface
    participant Engine as Conversation Engine
    participant Claude as Claude API
    participant DB as SQLite DB
    
    User->>CLI: Select AI Bestie > Gather Preferences
    CLI->>Engine: Initialize preference gathering session
    Engine->>Claude: Generate initial preference questions
    Claude-->>Engine: Opening questions
    Engine->>CLI: Display questions
    
    User->>CLI: Answer preference questions
    CLI->>Engine: Process answers
    Engine->>DB: Store preference answer
    Engine->>Claude: Generate follow-up questions based on answers
    Claude-->>Engine: Contextual follow-up questions
    Engine->>CLI: Display follow-up questions
    
    Note over User,DB: Continue until comprehensive KB built
    
    User->>CLI: Complete preference gathering
    CLI->>Engine: Finalize KB
    Engine->>DB: Store complete preference KB
    DB-->>Engine: Confirmation
    Engine->>CLI: Display KB summary
```

### AI Wingman Mode - Advice Flow

```mermaid
sequenceDiagram
    participant User as Male User
    participant CLI as CLI Interface
    participant Engine as Conversation Engine
    participant KB as Knowledge Base
    participant Claude as Claude API
    participant DB as SQLite DB
    
    User->>CLI: Select AI Wingman Mode
    CLI->>Engine: Initialize wingman session
    Engine->>KB: Load Art of Dating KB
    KB-->>Engine: Dating expertise context
    
    User->>CLI: Ask dating question or provide context
    CLI->>Engine: Process user input
    Engine->>Claude: Generate advice (with KB context)
    Claude-->>Engine: Strategic advice + reasoning
    Engine->>DB: Store conversation turn
    Engine->>CLI: Display advice
    
    User->>CLI: Follow-up question or new scenario
    CLI->>Engine: Process input
    Engine->>Claude: Generate contextual advice
    Claude-->>Engine: Advice + next steps
    Engine->>DB: Store conversation turn
    Engine->>CLI: Display advice
    
    Note over User,DB: Continue until 50 turns or user exits


## Components and Interfaces

### Component 1: CLI Interface Manager

**Purpose**: Handles all user interaction through command-line interface, mode selection, and session management.

**Interface**:
```typescript
interface CLIManager {
  displayMainMenu(): Promise<UserMode>
  displayModeSelection(mode: UserMode): Promise<SubMode>
  displayConversation(message: string): Promise<void>
  getUserInput(): Promise<string>
  displaySessionSummary(summary: SessionSummary): Promise<void>
  displayError(error: string): Promise<void>
  confirmAction(prompt: string): Promise<boolean>
}
```

**Responsibilities**:
- Display main menu and mode selection
- Handle user input and validation
- Format and display conversation messages
- Manage session lifecycle (start, continue, end)
- Display errors and confirmations

### Component 2: Conversation Engine

**Purpose**: Orchestrates multi-turn conversations, manages context, enforces turn limits, and coordinates with Claude API and database.

**Interface**:
```typescript
interface ConversationEngine {
  initializeSession(userId: string, mode: UserMode, subMode?: SubMode): Promise<Session>
  processUserInput(sessionId: string, input: string): Promise<EngineResponse>
  getSessionContext(sessionId: string): Promise<SessionContext>
  finalizeSession(sessionId: string): Promise<SessionSummary>
  canContinueConversation(sessionId: string): Promise<boolean>
}
```

**Responsibilities**:
- Initialize and manage conversation sessions
- Track conversation turn count (max 50)
- Maintain conversation context and history
- Coordinate with Claude API for responses
- Persist conversation state to database
- Enforce business rules (turn limits, mode constraints)

### Component 3: Claude API Client

**Purpose**: Manages communication with Claude API, prompt construction, and response parsing.

**Interface**:
```typescript
interface ClaudeClient {
  generateResponse(prompt: string, context: ConversationContext): Promise<string>
  generateInterviewQuestions(matchInfo: string, femaleProfile: UserProfile): Promise<string[]>
  analyzeMatchResponse(response: string, previousContext: string): Promise<AnalysisResult>
  generateDatingAdvice(userInput: string, knowledgeBase: string): Promise<string>
}
```

**Responsibilities**:
- Construct system and user prompts
- Call Claude API with appropriate parameters
- Parse and validate API responses
- Handle API errors and retries
- Manage token usage and rate limiting

### Component 4: Database Manager

**Purpose**: Handles all SQLite database operations for persistence and retrieval.

**Interface**:
```typescript
interface DatabaseManager {
  createSession(session: Session): Promise<string>
  saveConversationTurn(turn: ConversationTurn): Promise<void>
  getConversationHistory(sessionId: string): Promise<ConversationTurn[]>
  getUserProfile(userId: string): Promise<UserProfile>
  saveUserProfile(profile: UserProfile): Promise<void>
  getCustomPrompts(userId: string): Promise<CustomPrompt[]>
  saveCustomPrompt(prompt: CustomPrompt): Promise<void>
  getKnowledgeBase(userId: string, type: KBType): Promise<KnowledgeBase>
  saveKnowledgeBase(kb: KnowledgeBase): Promise<void>
}
```

**Responsibilities**:
- Create and manage database schema
- Store and retrieve user profiles
- Persist conversation history
- Manage custom prompts
- Store and retrieve knowledge bases
- Handle database transactions

### Component 5: Knowledge Base Manager

**Purpose**: Manages knowledge bases for both AI Bestie and AI Wingman modes.

**Interface**:
```typescript
interface KnowledgeBaseManager {
  buildFemalePreferencesKB(preferences: PreferenceData[]): Promise<KnowledgeBase>
  retrieveFemalePreferencesKB(userId: string): Promise<KnowledgeBase>
  loadDatingExpertiseKB(): Promise<KnowledgeBase>
  formatKBForPrompt(kb: KnowledgeBase): Promise<string>
  updateKBFromConversation(sessionId: string, kb: KnowledgeBase): Promise<KnowledgeBase>
}
```

**Responsibilities**:
- Build female preference knowledge bases from gathered data
- Load and manage Art of Dating expertise KB
- Format knowledge bases for inclusion in prompts
- Update KBs based on new conversation insights
- Ensure KB consistency and accuracy

### Component 6: Profile Manager

**Purpose**: Manages user profiles, match profiles, and profile-related operations.

**Interface**:
```typescript
interface ProfileManager {
  createUserProfile(userId: string, mode: UserMode): Promise<UserProfile>
  updateUserProfile(profile: UserProfile): Promise<void>
  createMatchProfile(userId: string, matchInfo: string): Promise<MatchProfile>
  getMatchProfile(matchId: string): Promise<MatchProfile>
  listMatchProfiles(userId: string): Promise<MatchProfile[]>
}
```

**Responsibilities**:
- Create and manage user profiles
- Store match information
- Retrieve profile data for context
- Validate profile data


## Data Models

### Model 1: User Profile

```typescript
interface UserProfile {
  userId: string
  mode: 'female' | 'male'
  username: string
  createdAt: Date
  updatedAt: Date
  metadata: {
    ageRange?: string
    location?: string
    interests?: string[]
  }
}
```

**Validation Rules**:
- userId must be unique and non-empty
- mode must be either 'female' or 'male'
- username must be non-empty and unique
- createdAt and updatedAt must be valid dates
- metadata fields are optional but must be valid if provided

### Model 2: Conversation Session

```typescript
interface Session {
  sessionId: string
  userId: string
  mode: 'bestie' | 'wingman'
  subMode?: 'interview' | 'preferences'
  turnCount: number
  maxTurns: number
  status: 'active' | 'completed' | 'paused'
  createdAt: Date
  updatedAt: Date
  matchId?: string
}
```

**Validation Rules**:
- sessionId must be unique
- userId must reference valid user
- mode must be 'bestie' or 'wingman'
- turnCount must be >= 0 and <= maxTurns
- maxTurns must be 50
- status must be one of: active, completed, paused
- matchId required for interview mode

### Model 3: Conversation Turn

```typescript
interface ConversationTurn {
  turnId: string
  sessionId: string
  turnNumber: number
  userMessage: string
  assistantMessage: string
  timestamp: Date
  metadata: {
    tokensUsed?: number
    responseTime?: number
  }
}
```

**Validation Rules**:
- turnId must be unique
- sessionId must reference valid session
- turnNumber must be sequential and >= 1
- userMessage and assistantMessage must be non-empty
- timestamp must be valid date
- metadata fields are optional

### Model 4: Custom Prompt

```typescript
interface CustomPrompt {
  promptId: string
  userId: string
  name: string
  content: string
  mode: 'bestie' | 'wingman'
  createdAt: Date
  updatedAt: Date
}
```

**Validation Rules**:
- promptId must be unique
- userId must reference valid user
- name must be non-empty and unique per user
- content must be non-empty
- mode must be 'bestie' or 'wingman'
- Maximum 20 custom prompts per user

### Model 5: Match Profile

```typescript
interface MatchProfile {
  matchId: string
  userId: string
  matchName: string
  matchInfo: string
  createdAt: Date
  updatedAt: Date
  interviewSessions: string[]
}
```

**Validation Rules**:
- matchId must be unique
- userId must reference valid user
- matchName must be non-empty
- matchInfo must be non-empty
- interviewSessions must be array of valid sessionIds

### Model 6: Knowledge Base

```typescript
interface KnowledgeBase {
  kbId: string
  userId: string
  type: 'female_preferences' | 'dating_expertise'
  content: string
  sourceData: Record<string, any>
  createdAt: Date
  updatedAt: Date
  version: number
}
```

**Validation Rules**:
- kbId must be unique
- userId must reference valid user (except for dating_expertise which is global)
- type must be 'female_preferences' or 'dating_expertise'
- content must be non-empty
- version must be >= 1


## Algorithmic Pseudocode

### Main Processing Algorithm: Process User Input

```pascal
ALGORITHM processUserInput(sessionId, userInput)
INPUT: sessionId (string), userInput (string)
OUTPUT: response (EngineResponse)

BEGIN
  ASSERT sessionId IS NOT NULL AND userInput IS NOT NULL
  
  // Step 1: Validate session state
  session ← database.getSession(sessionId)
  IF session IS NULL THEN
    RETURN Error("Session not found")
  END IF
  
  IF session.status ≠ 'active' THEN
    RETURN Error("Session is not active")
  END IF
  
  IF session.turnCount >= session.maxTurns THEN
    RETURN Error("Maximum conversation turns reached")
  END IF
  
  // Step 2: Load conversation context
  ASSERT session.turnCount >= 0
  history ← database.getConversationHistory(sessionId)
  context ← buildConversationContext(session, history)
  
  // Step 3: Build prompt based on mode
  IF session.mode = 'bestie' THEN
    IF session.subMode = 'interview' THEN
      prompt ← buildInterviewPrompt(context, userInput)
    ELSE IF session.subMode = 'preferences' THEN
      prompt ← buildPreferencePrompt(context, userInput)
    END IF
  ELSE IF session.mode = 'wingman' THEN
    prompt ← buildAdvicePrompt(context, userInput)
  END IF
  
  // Step 4: Get response from Claude
  response ← claudeClient.generateResponse(prompt, context)
  
  // Step 5: Store conversation turn
  turn ← createConversationTurn(
    sessionId,
    session.turnCount + 1,
    userInput,
    response
  )
  database.saveConversationTurn(turn)
  
  // Step 6: Update session
  session.turnCount ← session.turnCount + 1
  session.updatedAt ← now()
  database.updateSession(session)
  
  // Step 7: Check if session should auto-complete
  IF session.turnCount >= session.maxTurns THEN
    session.status ← 'completed'
    database.updateSession(session)
  END IF
  
  ASSERT response IS NOT NULL AND response.length > 0
  RETURN EngineResponse(response, session.turnCount, session.maxTurns)
END
```

**Preconditions**:
- sessionId references valid, active session
- userInput is non-empty string
- Database is accessible
- Claude API is available

**Postconditions**:
- Conversation turn is stored in database
- Session turn count is incremented
- Response is returned to user
- Session status may be updated to 'completed'

**Loop Invariants**: N/A (no loops in main algorithm)

### Prompt Building Algorithm: Build Interview Prompt

```pascal
ALGORITHM buildInterviewPrompt(context, userInput)
INPUT: context (SessionContext), userInput (string)
OUTPUT: prompt (string)

BEGIN
  ASSERT context IS NOT NULL AND userInput IS NOT NULL
  
  // Step 1: Load female user profile
  femaleProfile ← database.getUserProfile(context.userId)
  ASSERT femaleProfile IS NOT NULL
  
  // Step 2: Load female preferences KB
  preferencesKB ← database.getKnowledgeBase(context.userId, 'female_preferences')
  
  // Step 3: Load match profile
  matchProfile ← database.getMatchProfile(context.matchId)
  ASSERT matchProfile IS NOT NULL
  
  // Step 4: Get conversation history for context
  history ← context.conversationHistory
  
  // Step 5: Build system prompt
  systemPrompt ← "You are AI Bestie, a dating coach helping a woman evaluate male matches."
  systemPrompt ← systemPrompt + "\n\nFemale User Profile:\n" + formatProfile(femaleProfile)
  
  IF preferencesKB IS NOT NULL THEN
    systemPrompt ← systemPrompt + "\n\nFemale Preferences & Red Flags:\n" + preferencesKB.content
  END IF
  
  systemPrompt ← systemPrompt + "\n\nMatch Profile:\n" + formatProfile(matchProfile)
  
  // Step 6: Build user message with history
  userMessage ← formatConversationHistory(history)
  userMessage ← userMessage + "\n\nNew information about match:\n" + userInput
  
  // Step 7: Construct full prompt
  prompt ← systemPrompt + "\n\n" + userMessage
  
  ASSERT prompt.length > 0
  RETURN prompt
END
```

**Preconditions**:
- context contains valid userId and matchId
- userInput is non-empty
- Database contains required profiles and KB

**Postconditions**:
- Returns well-formed prompt string
- Prompt includes all necessary context
- Prompt is ready for Claude API

**Loop Invariants**: N/A

### Preference Gathering Algorithm: Build Preference Prompt

```pascal
ALGORITHM buildPreferencePrompt(context, userInput)
INPUT: context (SessionContext), userInput (string)
OUTPUT: prompt (string)

BEGIN
  ASSERT context IS NOT NULL AND userInput IS NOT NULL
  
  // Step 1: Get conversation history
  history ← context.conversationHistory
  
  // Step 2: Build system prompt
  systemPrompt ← "You are AI Bestie, helping a woman understand her dating preferences."
  systemPrompt ← systemPrompt + "\n\nYour goal: Ask thoughtful questions to understand:"
  systemPrompt ← systemPrompt + "\n- What she values in a partner"
  systemPrompt ← systemPrompt + "\n- Her dating goals and timeline"
  systemPrompt ← systemPrompt + "\n- Red flags and deal-breakers"
  systemPrompt ← systemPrompt + "\n- Lifestyle compatibility factors"
  
  // Step 3: Build user message
  userMessage ← formatConversationHistory(history)
  userMessage ← userMessage + "\n\nUser response:\n" + userInput
  
  // Step 4: Add guidance for follow-ups
  IF history.length > 0 THEN
    userMessage ← userMessage + "\n\nBased on previous answers, ask deeper follow-up questions."
  ELSE
    userMessage ← userMessage + "\n\nStart with an opening question about dating goals."
  END IF
  
  // Step 5: Construct full prompt
  prompt ← systemPrompt + "\n\n" + userMessage
  
  ASSERT prompt.length > 0
  RETURN prompt
END
```

**Preconditions**:
- context is valid
- userInput is non-empty string

**Postconditions**:
- Returns well-formed prompt for preference gathering
- Prompt guides AI to ask progressive questions

**Loop Invariants**: N/A


### Dating Advice Algorithm: Build Advice Prompt

```pascal
ALGORITHM buildAdvicePrompt(context, userInput)
INPUT: context (SessionContext), userInput (string)
OUTPUT: prompt (string)

BEGIN
  ASSERT context IS NOT NULL AND userInput IS NOT NULL
  
  // Step 1: Load dating expertise KB
  datingKB ← database.getKnowledgeBase(NULL, 'dating_expertise')
  ASSERT datingKB IS NOT NULL
  
  // Step 2: Get conversation history
  history ← context.conversationHistory
  
  // Step 3: Build system prompt
  systemPrompt ← "You are AI Wingman, a dating coach for men."
  systemPrompt ← systemPrompt + "\n\nYou provide strategic dating advice based on proven principles:"
  systemPrompt ← systemPrompt + "\n" + datingKB.content
  
  // Step 4: Build user message
  userMessage ← formatConversationHistory(history)
  userMessage ← userMessage + "\n\nUser question/scenario:\n" + userInput
  
  // Step 5: Add guidance
  userMessage ← userMessage + "\n\nProvide actionable, strategic advice with clear next steps."
  
  // Step 6: Construct full prompt
  prompt ← systemPrompt + "\n\n" + userMessage
  
  ASSERT prompt.length > 0
  RETURN prompt
END
```

**Preconditions**:
- context is valid
- userInput is non-empty
- Dating expertise KB is loaded

**Postconditions**:
- Returns well-formed prompt for dating advice
- Prompt includes expertise KB context

**Loop Invariants**: N/A

### Session Validation Algorithm: Can Continue Conversation

```pascal
ALGORITHM canContinueConversation(sessionId)
INPUT: sessionId (string)
OUTPUT: canContinue (boolean)

BEGIN
  ASSERT sessionId IS NOT NULL
  
  // Step 1: Retrieve session
  session ← database.getSession(sessionId)
  IF session IS NULL THEN
    RETURN false
  END IF
  
  // Step 2: Check status
  IF session.status ≠ 'active' THEN
    RETURN false
  END IF
  
  // Step 3: Check turn limit
  IF session.turnCount >= session.maxTurns THEN
    RETURN false
  END IF
  
  // Step 4: Verify database connectivity
  IF NOT database.isConnected() THEN
    RETURN false
  END IF
  
  // Step 5: Verify Claude API availability
  IF NOT claudeClient.isAvailable() THEN
    RETURN false
  END IF
  
  RETURN true
END
```

**Preconditions**:
- sessionId is valid string

**Postconditions**:
- Returns boolean indicating if conversation can continue
- Checks all necessary conditions

**Loop Invariants**: N/A


## Key Functions with Formal Specifications

### Function 1: initializeSession()

```typescript
function initializeSession(
  userId: string,
  mode: 'bestie' | 'wingman',
  subMode?: 'interview' | 'preferences',
  matchId?: string
): Promise<Session>
```

**Preconditions**:
- `userId` references valid user profile
- `mode` is either 'bestie' or 'wingman'
- If mode is 'bestie' and subMode is 'interview', matchId must be provided
- Database is accessible

**Postconditions**:
- Returns valid Session object with:
  - `sessionId` is unique and non-empty
  - `turnCount` equals 0
  - `maxTurns` equals 50
  - `status` equals 'active'
  - `createdAt` and `updatedAt` are current timestamp
- Session is persisted to database
- No side effects on user profile or other sessions

**Loop Invariants**: N/A

### Function 2: processUserInput()

```typescript
function processUserInput(
  sessionId: string,
  userInput: string
): Promise<EngineResponse>
```

**Preconditions**:
- `sessionId` references valid, active session
- `userInput` is non-empty string
- Session turn count < 50
- Database is accessible
- Claude API is available

**Postconditions**:
- Returns EngineResponse with:
  - `message` is non-empty string from Claude
  - `turnNumber` equals previous turnCount + 1
  - `turnsRemaining` equals maxTurns - new turnCount
- Conversation turn is stored in database
- Session turn count is incremented
- If turnCount reaches 50, session status becomes 'completed'
- No mutations to user input

**Loop Invariants**: N/A

### Function 3: buildConversationContext()

```typescript
function buildConversationContext(
  session: Session,
  history: ConversationTurn[]
): Promise<SessionContext>
```

**Preconditions**:
- `session` is valid Session object
- `history` is array of ConversationTurn objects in chronological order
- All turns in history belong to session

**Postconditions**:
- Returns SessionContext with:
  - `sessionId` matches input session
  - `userId` matches input session
  - `conversationHistory` contains all turns
  - `turnCount` matches session.turnCount
  - `mode` and `subMode` match session
- Context is ready for prompt building
- No mutations to input objects

**Loop Invariants**: N/A

### Function 4: generateResponse()

```typescript
function generateResponse(
  prompt: string,
  context: SessionContext
): Promise<string>
```

**Preconditions**:
- `prompt` is non-empty string
- `context` is valid SessionContext
- Claude API key is configured
- Claude API is accessible

**Postconditions**:
- Returns non-empty string response from Claude
- Response is contextually relevant to prompt
- Response respects conversation mode and constraints
- No side effects on database or session state

**Loop Invariants**: N/A

### Function 5: saveConversationTurn()

```typescript
function saveConversationTurn(
  turn: ConversationTurn
): Promise<void>
```

**Preconditions**:
- `turn` is valid ConversationTurn object
- `turn.sessionId` references valid session
- `turn.turnNumber` is sequential
- Database is accessible and writable

**Postconditions**:
- Turn is persisted to database
- Turn can be retrieved by sessionId and turnNumber
- No mutations to input turn object
- Database transaction completes successfully

**Loop Invariants**: N/A

### Function 6: getKnowledgeBase()

```typescript
function getKnowledgeBase(
  userId: string | null,
  type: 'female_preferences' | 'dating_expertise'
): Promise<KnowledgeBase>
```

**Preconditions**:
- If type is 'female_preferences', userId must reference valid user
- If type is 'dating_expertise', userId can be null (global KB)
- Database is accessible

**Postconditions**:
- Returns valid KnowledgeBase object with:
  - `type` matches input type
  - `content` is non-empty string
  - `version` is >= 1
- For 'female_preferences': KB is specific to userId
- For 'dating_expertise': KB is global
- Returns null if KB doesn't exist (not an error)

**Loop Invariants**: N/A


## Example Usage

### Example 1: Female User - AI Bestie Interview Mode

```typescript
// Initialize session for interviewing a male match
const session = await engine.initializeSession(
  'user-female-001',
  'bestie',
  'interview',
  'match-john-001'
)

// First turn: Provide match information
const response1 = await engine.processUserInput(
  session.sessionId,
  'His name is John, 32, works in tech, loves hiking and cooking'
)
// AI Bestie generates initial interview questions

// Second turn: Provide match's response
const response2 = await engine.processUserInput(
  session.sessionId,
  'He said he wants a serious relationship, values honesty and independence'
)
// AI Bestie analyzes response and generates follow-up questions

// Continue until 50 turns or user exits
const canContinue = await engine.canContinueConversation(session.sessionId)
if (!canContinue) {
  const summary = await engine.finalizeSession(session.sessionId)
  console.log('Interview complete:', summary)
}
```

### Example 2: Female User - AI Bestie Preference Gathering

```typescript
// Initialize preference gathering session
const session = await engine.initializeSession(
  'user-female-001',
  'bestie',
  'preferences'
)

// First turn: AI Bestie asks opening question
const response1 = await engine.processUserInput(
  session.sessionId,
  'I want to understand my dating preferences better'
)
// AI Bestie: "What are your top 3 qualities you look for in a partner?"

// Second turn: User answers
const response2 = await engine.processUserInput(
  session.sessionId,
  'Honesty, ambition, and kindness'
)
// AI Bestie: "Tell me more about what ambition means to you..."

// Continue building preference KB
// After session completes, KB is stored and used for future interviews
```

### Example 3: Male User - AI Wingman Mode

```typescript
// Initialize wingman session
const session = await engine.initializeSession(
  'user-male-001',
  'wingman'
)

// First turn: Ask for dating advice
const response1 = await engine.processUserInput(
  session.sessionId,
  'I matched with someone on a dating app. How should I start the conversation?'
)
// AI Wingman: "Based on proven dating principles, here's a strategic approach..."

// Second turn: Follow-up question
const response2 = await engine.processUserInput(
  session.sessionId,
  'She responded positively. What should I do next?'
)
// AI Wingman: "Here are the next strategic steps..."

// Continue for up to 50 turns
```

### Example 4: Custom Prompt Usage

```typescript
// Create custom prompt for AI Bestie
const customPrompt = await profileManager.createCustomPrompt({
  userId: 'user-female-001',
  name: 'Red Flag Detector',
  content: 'Focus on identifying potential red flags in the match\'s responses',
  mode: 'bestie'
})

// Use custom prompt in interview
const response = await engine.processUserInput(
  session.sessionId,
  'He said he doesn\'t believe in marriage but wants to be together forever'
)
// AI Bestie applies custom prompt logic to analyze response
```


## Correctness Properties

### Property 1: Session Turn Limit Enforcement

**Universal Quantification**: For all sessions S and all conversation turns T in S:
- If turnCount(S) >= 50, then canContinueConversation(S) = false
- If canContinueConversation(S) = false, then status(S) = 'completed'
- No new turns can be added to S after status becomes 'completed'

**Test Description**: Verify that sessions automatically complete at 50 turns and no additional turns can be added.

### Property 2: Conversation Context Consistency

**Universal Quantification**: For all sessions S and all turns T in S:
- If T is stored in database, then T.sessionId = S.sessionId
- If T.turnNumber = N, then exactly one turn exists with turnNumber = N in S
- All turns in S are ordered by turnNumber in ascending order
- No gaps exist in turnNumber sequence

**Test Description**: Verify that conversation history maintains referential integrity and sequential ordering.

### Property 3: Knowledge Base Isolation

**Universal Quantification**: For all users U1, U2 where U1 ≠ U2:
- If KB is of type 'female_preferences' for U1, then KB is not accessible to U2
- If KB is of type 'dating_expertise', then KB is accessible to all users
- Each user's female_preferences KB is unique and independent

**Test Description**: Verify that female preference KBs are user-specific and dating expertise KB is global.

### Property 4: Custom Prompt Limit

**Universal Quantification**: For all users U:
- count(customPrompts(U)) <= 20
- If count(customPrompts(U)) = 20, then createCustomPrompt(U) fails with error
- All custom prompts for U are unique by name

**Test Description**: Verify that users cannot exceed 20 custom prompts and names are unique.

### Property 5: Session Mode Consistency

**Universal Quantification**: For all sessions S:
- If mode(S) = 'bestie' and subMode(S) = 'interview', then matchId(S) is not null
- If mode(S) = 'bestie' and subMode(S) = 'preferences', then matchId(S) is null
- If mode(S) = 'wingman', then subMode(S) is null
- mode(S) and subMode(S) remain constant throughout session lifetime

**Test Description**: Verify that session mode and subMode combinations are valid and immutable.

### Property 6: User Profile Integrity

**Universal Quantification**: For all user profiles P:
- P.userId is unique across all profiles
- P.mode is either 'female' or 'male'
- P.createdAt <= P.updatedAt
- P.username is unique across all profiles
- All profile metadata fields are valid if present

**Test Description**: Verify that user profiles maintain data integrity and uniqueness constraints.

### Property 7: API Response Validity

**Universal Quantification**: For all Claude API responses R:
- R is non-empty string
- R is contextually relevant to the prompt
- R respects conversation mode constraints
- R does not exceed reasonable length limits
- R is successfully stored in database

**Test Description**: Verify that all API responses are valid and properly persisted.

### Property 8: Database Transaction Atomicity

**Universal Quantification**: For all database operations OP:
- If OP completes successfully, all changes are persisted
- If OP fails, no partial changes are committed
- All related operations (e.g., save turn + update session) complete together
- No orphaned records exist

**Test Description**: Verify that database operations maintain ACID properties.


## Error Handling

### Error Scenario 1: Session Not Found

**Condition**: User attempts to continue a conversation with invalid or expired sessionId
**Response**: System returns error "Session not found" and prompts user to start new session
**Recovery**: User can select mode and start fresh session; previous sessions remain in history

### Error Scenario 2: Turn Limit Exceeded

**Condition**: User attempts to add turn when session has reached 50 turns
**Response**: System displays "Conversation limit reached (50 turns)" and offers session summary
**Recovery**: User can start new session with same mode/match or review completed session

### Error Scenario 3: Claude API Unavailable

**Condition**: Claude API is unreachable or returns error
**Response**: System displays "Unable to reach AI assistant. Please try again." with retry option
**Recovery**: System retries up to 3 times with exponential backoff; if persistent, user can save session and retry later

### Error Scenario 4: Database Connection Lost

**Condition**: SQLite database becomes inaccessible during operation
**Response**: System displays "Database error. Your conversation may not be saved." and offers to retry
**Recovery**: System attempts to reconnect; if successful, resumes operation; if failed, user can exit and retry

### Error Scenario 5: Invalid User Input

**Condition**: User provides empty or malformed input
**Response**: System displays "Please provide valid input" and re-prompts
**Recovery**: User can re-enter input; no session state is affected

### Error Scenario 6: Custom Prompt Limit Exceeded

**Condition**: User attempts to create 21st custom prompt
**Response**: System displays "Maximum 20 custom prompts reached. Delete one to add new."
**Recovery**: User can delete existing prompt or use existing prompts

### Error Scenario 7: Match Profile Not Found

**Condition**: User attempts to interview match that doesn't exist
**Response**: System displays "Match profile not found" and offers to create new match
**Recovery**: User can create new match profile or select existing match

### Error Scenario 8: Knowledge Base Not Available

**Condition**: Female preferences KB or dating expertise KB cannot be loaded
**Response**: System displays warning but continues with generic prompts
**Recovery**: System attempts to rebuild KB from stored data; user can continue conversation with reduced context


## Testing Strategy

### Unit Testing Approach

**Scope**: Individual functions and components in isolation

**Key Test Cases**:
- Session initialization with valid/invalid parameters
- Turn count validation and limit enforcement
- Prompt building with various context combinations
- Database CRUD operations for all models
- Custom prompt creation and limit enforcement
- Knowledge base loading and formatting
- User input validation and sanitization
- Error handling for each error scenario

**Coverage Goals**: Minimum 80% code coverage for core business logic

**Test Framework**: Vitest (already in project dependencies)

**Example Test**:
```typescript
describe('ConversationEngine', () => {
  it('should enforce 50-turn limit', async () => {
    const session = await engine.initializeSession(userId, 'bestie', 'interview', matchId)
    
    // Add 50 turns
    for (let i = 0; i < 50; i++) {
      await engine.processUserInput(session.sessionId, `Input ${i}`)
    }
    
    // 51st turn should fail
    expect(() => engine.processUserInput(session.sessionId, 'Input 51'))
      .rejects.toThrow('Maximum conversation turns reached')
  })
})
```

### Property-Based Testing Approach

**Property Test Library**: fast-check (recommended for TypeScript)

**Key Properties to Test**:
1. **Turn Count Monotonicity**: Turn count always increases by exactly 1 with each input
2. **Session Immutability**: Session mode and subMode never change after creation
3. **Knowledge Base Isolation**: Female preference KBs are never shared between users
4. **Custom Prompt Uniqueness**: No two custom prompts have same name for same user
5. **Conversation History Ordering**: All turns are ordered by turnNumber with no gaps
6. **Database Consistency**: All stored data can be retrieved exactly as stored

**Example Property Test**:
```typescript
import fc from 'fast-check'

describe('ConversationEngine - Property Tests', () => {
  it('should maintain turn count monotonicity', () => {
    fc.assert(
      fc.property(
        fc.array(fc.string({ minLength: 1 }), { minLength: 1, maxLength: 50 }),
        async (inputs) => {
          const session = await engine.initializeSession(userId, 'bestie', 'interview', matchId)
          
          for (let i = 0; i < inputs.length; i++) {
            const response = await engine.processUserInput(session.sessionId, inputs[i])
            expect(response.turnNumber).toBe(i + 1)
          }
        }
      )
    )
  })
})
```

### Integration Testing Approach

**Scope**: Multiple components working together

**Key Test Scenarios**:
1. Complete AI Bestie interview flow (5-10 turns)
2. Complete preference gathering flow (5-10 turns)
3. Complete AI Wingman advice flow (5-10 turns)
4. Session persistence and retrieval
5. Custom prompt application in conversation
6. Knowledge base integration in prompts
7. Error recovery and retry logic
8. Database transaction rollback on failure

**Test Data**: Use fixtures for user profiles, match profiles, and knowledge bases

**Example Integration Test**:
```typescript
describe('AI Bestie Interview Flow', () => {
  it('should complete full interview with context', async () => {
    // Setup
    const femaleProfile = await createTestFemaleProfile()
    const matchProfile = await createTestMatchProfile()
    const preferencesKB = await createTestPreferencesKB()
    
    // Execute
    const session = await engine.initializeSession(
      femaleProfile.userId,
      'bestie',
      'interview',
      matchProfile.matchId
    )
    
    const response1 = await engine.processUserInput(session.sessionId, 'Match info...')
    const response2 = await engine.processUserInput(session.sessionId, 'Match response...')
    
    // Verify
    expect(response1.message).toContain('question')
    expect(response2.message).toContain('follow-up')
    
    const history = await engine.getSessionContext(session.sessionId)
    expect(history.conversationHistory).toHaveLength(2)
  })
})
```

### End-to-End Testing Approach

**Scope**: Complete user workflows from CLI entry to session completion

**Key Scenarios**:
1. New female user: Create profile → Gather preferences → Interview match
2. Returning female user: Load profile → Interview new match
3. New male user: Create profile → Ask dating questions
4. Returning male user: Load profile → Continue advice session
5. Session recovery: Interrupt and resume session
6. Custom prompt workflow: Create → Apply → Verify

**Test Environment**: Local SQLite database with test data

**Verification**: Check database state, CLI output, and session summaries


## Performance Considerations

### Conversation Response Time

**Requirement**: Claude API responses should be delivered to user within 10 seconds

**Optimization Strategies**:
- Cache frequently used knowledge bases in memory
- Implement prompt caching for repeated patterns
- Use streaming responses for long Claude outputs
- Implement request timeout with graceful degradation

**Monitoring**: Track average response time per mode and alert if exceeds 10 seconds

### Database Query Performance

**Requirement**: Database queries should complete within 500ms

**Optimization Strategies**:
- Index sessionId, userId, and turnNumber columns
- Use prepared statements to prevent query compilation overhead
- Implement connection pooling for concurrent operations
- Archive old sessions to separate database for historical queries

**Monitoring**: Log slow queries and analyze patterns

### Memory Usage

**Requirement**: Application should use < 500MB RAM during normal operation

**Optimization Strategies**:
- Stream large conversation histories instead of loading all at once
- Implement lazy loading for knowledge bases
- Clear session context after processing each turn
- Use pagination for conversation history retrieval

**Monitoring**: Track memory usage and implement garbage collection tuning

### Conversation History Retrieval

**Requirement**: Retrieving full conversation history should complete within 1 second

**Optimization Strategies**:
- Limit history retrieval to last N turns (e.g., 10) for context building
- Use database indexes on sessionId and turnNumber
- Implement caching for recently accessed sessions
- Consider denormalizing frequently accessed data

### Concurrent User Sessions

**Requirement**: Support multiple concurrent sessions without performance degradation

**Optimization Strategies**:
- Use connection pooling for database access
- Implement request queuing for Claude API calls
- Use async/await for non-blocking operations
- Implement rate limiting to prevent API quota exhaustion

**Monitoring**: Track concurrent session count and API rate limit usage

### Knowledge Base Size

**Requirement**: Knowledge bases should remain < 100KB for fast retrieval

**Optimization Strategies**:
- Summarize female preferences KB periodically
- Use compression for stored knowledge bases
- Implement KB versioning to manage growth
- Archive old KB versions

**Monitoring**: Track KB size growth and implement cleanup policies


## Security Considerations

### API Key Management

**Threat**: Anthropic API key exposure in code or logs

**Mitigation Strategies**:
- Store API key in environment variables only (never in code)
- Use .env.local file with .gitignore protection
- Implement key rotation mechanism
- Never log API keys or sensitive data
- Use separate API keys for development and production

**Implementation**: Load from process.env.ANTHROPIC_API_KEY at startup

### Data Privacy

**Threat**: User profiles and conversation data exposure

**Mitigation Strategies**:
- Store all data locally in SQLite (no cloud transmission)
- Implement file-level encryption for SQLite database
- Use secure file permissions (600) for database file
- Implement data retention policies (auto-delete old sessions)
- Provide user option to export and delete all data

**Implementation**: Use SQLite encryption extension or file system encryption

### Input Validation

**Threat**: Injection attacks through user input

**Mitigation Strategies**:
- Validate all user input before processing
- Use parameterized queries for database operations
- Sanitize input before sending to Claude API
- Implement length limits on all input fields
- Reject suspicious patterns (SQL keywords, script tags, etc.)

**Implementation**: Use input validation library and prepared statements

### Conversation Context Leakage

**Threat**: Sensitive information from one user appearing in another user's context

**Mitigation Strategies**:
- Strictly isolate user data by userId
- Verify userId ownership before retrieving data
- Implement access control checks on all database queries
- Never mix user contexts in prompts
- Implement audit logging for data access

**Implementation**: Add userId verification to all database queries

### Claude API Security

**Threat**: Malicious prompts or prompt injection attacks

**Mitigation Strategies**:
- Implement prompt validation before sending to API
- Use system prompts to constrain AI behavior
- Implement output validation and sanitization
- Monitor for suspicious patterns in AI responses
- Implement rate limiting to prevent abuse

**Implementation**: Validate prompts and implement response filtering

### Local File Security

**Threat**: Unauthorized access to SQLite database file

**Mitigation Strategies**:
- Set restrictive file permissions (600) on database file
- Store database in user's home directory
- Implement file access logging
- Use OS-level file encryption if available
- Warn user about file security implications

**Implementation**: Set file permissions at database creation time

### Session Management

**Threat**: Session hijacking or unauthorized session access

**Mitigation Strategies**:
- Use cryptographically secure session IDs
- Implement session timeout (e.g., 24 hours)
- Verify session ownership before operations
- Implement session invalidation on logout
- Log all session access attempts

**Implementation**: Use crypto.randomUUID() for session IDs

### Dependency Security

**Threat**: Vulnerable dependencies in npm packages

**Mitigation Strategies**:
- Use npm audit to identify vulnerabilities
- Keep dependencies updated regularly
- Use exact versions in package.json (no wildcards)
- Implement dependency scanning in CI/CD
- Review security advisories for critical packages

**Implementation**: Run npm audit regularly and update dependencies


## Dependencies

### Core Dependencies

**Anthropic SDK** (`@anthropic-ai/sdk`)
- Purpose: Claude API integration
- Version: ^0.92.0 (from existing package.json)
- Usage: Generate responses, manage API communication

**SQLite** (`better-sqlite3` or `sqlite3`)
- Purpose: Local database for persistence
- Recommendation: `better-sqlite3` for synchronous operations in CLI
- Usage: Store profiles, conversations, custom prompts, knowledge bases

**CLI Framework** (e.g., `commander` or `yargs`)
- Purpose: Command-line interface and argument parsing
- Recommendation: `commander` for clean, intuitive CLI
- Usage: Mode selection, session management, user input handling

**Environment Variables** (`dotenv`)
- Purpose: Load configuration from .env files
- Version: Latest stable
- Usage: Load ANTHROPIC_API_KEY and other config

### Development Dependencies

**TypeScript** (`typescript`)
- Purpose: Type safety and development experience
- Version: ^6.0.2 (from existing package.json)
- Usage: Write type-safe code

**Vitest** (`vitest`)
- Purpose: Unit and integration testing
- Version: ^4.1.6 (from existing package.json)
- Usage: Test framework for all test suites

**Fast-Check** (`fast-check`)
- Purpose: Property-based testing
- Recommendation: Latest stable
- Usage: Generate test cases for property tests

**ESLint** and **Prettier**
- Purpose: Code quality and formatting
- Recommendation: Latest stable
- Usage: Maintain code consistency

### Optional Dependencies

**Chalk** (`chalk`)
- Purpose: Colored terminal output
- Usage: Improve CLI readability with colors

**Ora** (`ora`)
- Purpose: Terminal spinners and progress indicators
- Usage: Show loading states during API calls

**Inquirer** (`inquirer`)
- Purpose: Interactive CLI prompts
- Usage: Alternative to simple input for complex selections

### Dependency Management

**Lock File**: Use package-lock.json to ensure reproducible builds

**Update Strategy**:
- Review security advisories weekly
- Update minor/patch versions monthly
- Test major version updates in separate branch
- Document breaking changes

**Conflict Resolution**:
- Prefer packages with active maintenance
- Avoid packages with known security issues
- Use exact versions for critical dependencies
- Allow minor/patch updates for stable packages


## Database Schema

### Users Table

```sql
CREATE TABLE users (
  user_id TEXT PRIMARY KEY,
  mode TEXT NOT NULL CHECK (mode IN ('female', 'male')),
  username TEXT NOT NULL UNIQUE,
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  metadata JSON
);
```

### Sessions Table

```sql
CREATE TABLE sessions (
  session_id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL,
  mode TEXT NOT NULL CHECK (mode IN ('bestie', 'wingman')),
  sub_mode TEXT CHECK (sub_mode IN ('interview', 'preferences', NULL)),
  turn_count INTEGER NOT NULL DEFAULT 0,
  max_turns INTEGER NOT NULL DEFAULT 50,
  status TEXT NOT NULL CHECK (status IN ('active', 'completed', 'paused')),
  match_id TEXT,
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(user_id),
  FOREIGN KEY (match_id) REFERENCES match_profiles(match_id)
);

CREATE INDEX idx_sessions_user_id ON sessions(user_id);
CREATE INDEX idx_sessions_status ON sessions(status);
```

### Conversation Turns Table

```sql
CREATE TABLE conversation_turns (
  turn_id TEXT PRIMARY KEY,
  session_id TEXT NOT NULL,
  turn_number INTEGER NOT NULL,
  user_message TEXT NOT NULL,
  assistant_message TEXT NOT NULL,
  timestamp DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  metadata JSON,
  FOREIGN KEY (session_id) REFERENCES sessions(session_id),
  UNIQUE (session_id, turn_number)
);

CREATE INDEX idx_turns_session_id ON conversation_turns(session_id);
CREATE INDEX idx_turns_turn_number ON conversation_turns(turn_number);
```

### Custom Prompts Table

```sql
CREATE TABLE custom_prompts (
  prompt_id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL,
  name TEXT NOT NULL,
  content TEXT NOT NULL,
  mode TEXT NOT NULL CHECK (mode IN ('bestie', 'wingman')),
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(user_id),
  UNIQUE (user_id, name)
);

CREATE INDEX idx_prompts_user_id ON custom_prompts(user_id);
```

### Match Profiles Table

```sql
CREATE TABLE match_profiles (
  match_id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL,
  match_name TEXT NOT NULL,
  match_info TEXT NOT NULL,
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(user_id)
);

CREATE INDEX idx_matches_user_id ON match_profiles(user_id);
```

### Knowledge Bases Table

```sql
CREATE TABLE knowledge_bases (
  kb_id TEXT PRIMARY KEY,
  user_id TEXT,
  type TEXT NOT NULL CHECK (type IN ('female_preferences', 'dating_expertise')),
  content TEXT NOT NULL,
  source_data JSON,
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  version INTEGER NOT NULL DEFAULT 1,
  FOREIGN KEY (user_id) REFERENCES users(user_id)
);

CREATE INDEX idx_kb_user_id ON knowledge_bases(user_id);
CREATE INDEX idx_kb_type ON knowledge_bases(type);
```

### User Profiles Table

```sql
CREATE TABLE user_profiles (
  profile_id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL UNIQUE,
  age_range TEXT,
  location TEXT,
  interests JSON,
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(user_id)
);

CREATE INDEX idx_profiles_user_id ON user_profiles(user_id);
```


## Implementation Roadmap

### Phase 1: Core Infrastructure (Week 1-2)

**Deliverables**:
- Project setup with TypeScript and CLI framework
- SQLite database schema and migrations
- Environment configuration (.env.local)
- Basic CLI menu structure

**Tasks**:
- Initialize Node.js project with dependencies
- Create database schema with all tables
- Implement DatabaseManager component
- Create CLI entry point with mode selection
- Set up error handling framework

### Phase 2: Conversation Engine (Week 2-3)

**Deliverables**:
- ConversationEngine component
- Claude API client integration
- Session management
- Turn limit enforcement

**Tasks**:
- Implement ConversationEngine class
- Integrate Anthropic SDK
- Build prompt construction logic
- Implement session lifecycle management
- Add turn counting and limit enforcement

### Phase 3: AI Bestie Mode (Week 3-4)

**Deliverables**:
- AI Bestie interview sub-mode
- AI Bestie preference gathering sub-mode
- Knowledge base management
- Profile management

**Tasks**:
- Implement interview prompt building
- Implement preference gathering prompt building
- Build KnowledgeBaseManager component
- Implement ProfileManager component
- Create match profile management

### Phase 4: AI Wingman Mode (Week 4-5)

**Deliverables**:
- AI Wingman advice mode
- Dating expertise knowledge base
- Advice prompt building

**Tasks**:
- Implement wingman prompt building
- Load and format dating expertise KB
- Create wingman-specific logic
- Test advice generation

### Phase 5: Custom Prompts & Advanced Features (Week 5-6)

**Deliverables**:
- Custom prompt management
- Custom prompt application in conversations
- Session persistence and recovery
- User profile management

**Tasks**:
- Implement custom prompt CRUD operations
- Integrate custom prompts into prompt building
- Add session recovery logic
- Implement user profile management

### Phase 6: Testing & Optimization (Week 6-7)

**Deliverables**:
- Unit tests (80%+ coverage)
- Property-based tests
- Integration tests
- Performance optimization

**Tasks**:
- Write unit tests for all components
- Write property-based tests
- Write integration tests
- Profile and optimize performance
- Implement caching strategies

### Phase 7: Documentation & Polish (Week 7-8)

**Deliverables**:
- User documentation
- Developer documentation
- CLI help text
- Error message improvements

**Tasks**:
- Write user guide
- Write API documentation
- Improve CLI UX
- Add helpful error messages
- Final testing and bug fixes

## CLI Interface Design

### Main Menu

```
╔════════════════════════════════════════╗
║     Dating Assistant - Main Menu       ║
╚════════════════════════════════════════╝

Select your role:
  1. Female User (AI Bestie)
  2. Male User (AI Wingman)
  3. View Previous Sessions
  4. Settings
  5. Exit

Enter choice (1-5):
```

### AI Bestie Sub-Menu

```
╔════════════════════════════════════════╗
║        AI Bestie - Select Mode         ║
╚════════════════════════════════════════╝

What would you like to do?
  1. Interview a Male Match
  2. Gather My Preferences
  3. View Previous Interviews
  4. Manage Custom Prompts
  5. Back to Main Menu

Enter choice (1-5):
```

### Conversation Display

```
╔════════════════════════════════════════╗
║    Interview with John - Turn 3/50     ║
╚════════════════════════════════════════╝

AI Bestie: Based on what you've shared, I'm curious about his 
approach to conflict resolution. How does he typically handle 
disagreements?

Your response:
_
```

### Session Summary

```
╔════════════════════════════════════════╗
║       Interview Summary - John         ║
╚════════════════════════════════════════╝

Total Turns: 15/50
Duration: 12 minutes
Key Insights:
  • Strong communication skills
  • Values independence
  • Career-focused
  • Potential red flag: Avoids commitment discussion

Save this interview? (y/n):
```


## Design Decisions & Rationale

### Decision 1: Local SQLite vs Cloud Database

**Decision**: Use local SQLite database instead of cloud-hosted database

**Rationale**:
- User privacy: All data stays on user's machine
- No server hosting costs
- Works offline without internet connection
- Simpler deployment and setup
- Faster local queries

**Trade-offs**:
- No automatic backups (user responsible)
- No multi-device sync
- Limited scalability for large datasets

**Mitigation**: Provide export/backup functionality and clear documentation

### Decision 2: 50-Turn Conversation Limit

**Decision**: Hard limit of 50 turns per session

**Rationale**:
- Prevents excessive API costs
- Encourages focused conversations
- Matches typical dating conversation depth
- Prevents token limit issues with Claude
- Encourages session breaks and reflection

**Trade-offs**:
- Users may want longer conversations
- May feel artificial to some users

**Mitigation**: Allow session resumption and provide clear turn counter

### Decision 3: Two Distinct Modes (Bestie vs Wingman)

**Decision**: Separate AI Bestie and AI Wingman modes instead of unified mode

**Rationale**:
- Different user needs and contexts
- Allows specialized knowledge bases
- Clearer user experience
- Easier to customize prompts per mode
- Better context isolation

**Trade-offs**:
- More code to maintain
- Users must choose mode upfront

**Mitigation**: Clear mode descriptions and easy switching

### Decision 4: Custom Prompts Limit of 20

**Decision**: Maximum 20 custom prompts per user

**Rationale**:
- Prevents database bloat
- Encourages prompt curation
- Manageable number for user selection
- Balances flexibility with simplicity

**Trade-offs**:
- Users may want more customization

**Mitigation**: Provide prompt templates and examples

### Decision 5: Synchronous Database Operations

**Decision**: Use synchronous database operations (better-sqlite3) instead of async

**Rationale**:
- CLI applications are typically single-threaded
- Simpler code without async/await complexity
- Faster for small to medium datasets
- Better error handling and debugging

**Trade-offs**:
- Blocks event loop during queries
- Not suitable for high-concurrency scenarios

**Mitigation**: Optimize queries and add indexes; acceptable for CLI use case

### Decision 6: Knowledge Base as Formatted Text

**Decision**: Store knowledge bases as formatted text strings instead of structured data

**Rationale**:
- Easy to include in Claude prompts
- Flexible format for different KB types
- Simple to version and update
- Works well with LLM context windows

**Trade-offs**:
- Harder to query specific KB sections
- Less structured than database tables

**Mitigation**: Implement KB formatting functions and indexing

### Decision 7: Session-Based Architecture

**Decision**: Organize conversations around sessions instead of continuous chat

**Rationale**:
- Clear session boundaries
- Easy to manage turn limits
- Supports session recovery
- Better for multi-match interviews
- Clearer user experience

**Trade-offs**:
- Users must explicitly start/end sessions
- Cannot seamlessly continue across sessions

**Mitigation**: Provide session recovery and easy session creation

### Decision 8: No User Authentication

**Decision**: No authentication system; rely on local file access control

**Rationale**:
- Local CLI application (no multi-user server)
- Simpler implementation
- User controls file access via OS permissions
- Reduces complexity

**Trade-offs**:
- No multi-user support on same machine
- No account recovery mechanism

**Mitigation**: Document file location and backup procedures; future enhancement for multi-user support


## Correctness Properties

*A property is a characteristic or behavior that should hold true across all valid executions of a system—essentially, a formal statement about what the system should do. Properties serve as the bridge between human-readable specifications and machine-verifiable correctness guarantees.*

### Property 1: Session Turn Limit Enforcement

*For any* session S, if turnCount(S) >= 50, then canContinueConversation(S) = false, and no new turns can be added to S.

**Validates: Requirements 2.7, 2.8, 6.5, 6.6, 6.7, 22.3, 22.4**

### Property 2: User Profile Persistence and Retrieval

*For any* user profile P created with valid userId, mode, and username, storing P and then retrieving it by userId should return an equivalent profile with all fields intact.

**Validates: Requirements 1.4, 1.5, 1.8, 11.1, 11.2**

### Property 3: Conversation Turn Sequential Ordering

*For any* session S with conversation history H, all turns in H should have sequential turnNumbers starting from 1, with no gaps, and should be retrievable in chronological order.

**Validates: Requirements 6.3, 6.4, 6.9, 9.3, 9.4, 9.5**

### Property 4: Custom Prompt Limit Enforcement

*For any* user U, the count of custom prompts for U should never exceed 20, and attempting to create a 21st prompt should fail with an error.

**Validates: Requirements 7.4, 7.5, 25.4**

### Property 5: Knowledge Base User Isolation

*For any* two different users U1 and U2, if KB1 is a female_preferences KB for U1, then KB1 should not be accessible to U2. The global dating_expertise KB should be accessible to all users.

**Validates: Requirements 8.2, 8.3, 8.8**

### Property 6: Match Profile Association Consistency

*For any* match profile M created for user U, M should be associated with U, and retrieving M should return the correct user association without modification.

**Validates: Requirements 12.1, 12.2, 12.8, 12.9**

### Property 7: Session State Transition Validity

*For any* session S, state transitions should follow valid paths: 'active' → 'paused' → 'active', or 'active' → 'completed'. No other transitions should be allowed.

**Validates: Requirements 22.1, 22.2, 22.3, 22.4, 22.5, 22.6, 22.7, 22.8, 22.9**

### Property 8: Conversation Context Consistency

*For any* session S with context C built from session data, C should include all necessary information (user profile, KB, history) without duplication or corruption.

**Validates: Requirements 9.1, 9.2, 9.6, 9.7, 9.8, 9.9**

### Property 9: Mode-Specific Feature Isolation

*For any* user U in female mode, U should not have access to AI Wingman features, and vice versa. Features should be isolated by mode.

**Validates: Requirements 24.3, 24.4, 24.5, 24.6, 24.7, 24.8, 24.9**

### Property 10: Data Validation on Creation

*For any* data object (profile, session, turn, prompt, KB) with invalid fields, the creation should fail with a validation error, and no invalid object should be stored in the database.

**Validates: Requirements 14.1, 14.2, 14.3, 14.4, 14.5, 14.6, 14.7, 14.8, 14.9**

### Property 11: Preference KB Round-Trip

*For any* preference gathering session that completes successfully, the resulting KB should be storable and retrievable, and when formatted for use in an interview, should contain all gathered preference information.

**Validates: Requirements 4.5, 4.6, 4.7, 4.8, 4.9, 8.1, 8.4, 8.6, 8.9**

### Property 12: Interview Session Coherence

*For any* interview session with match profile M and female profile F, all generated questions should be contextually relevant to M and F, and should maintain coherence across turns.

**Validates: Requirements 3.5, 3.6, 3.7, 3.8, 3.9, 18.1, 18.2, 18.3, 18.4, 18.5, 18.6, 18.7, 18.8, 18.9**

### Property 13: Wingman Session Context Preservation

*For any* wingman session, the Dating Expertise KB should be loaded at session start and should remain consistent across all turns in the session.

**Validates: Requirements 5.2, 5.3, 5.4, 5.5, 5.6, 5.7, 20.1, 20.2, 20.3, 20.4, 20.5, 20.6, 20.7, 20.8, 20.9**

### Property 14: Session Recovery Completeness

*For any* session S that is paused and then resumed, the resumed session should have identical state to the paused session, including all conversation history and turn count.

**Validates: Requirements 11.4, 11.5, 11.6, 11.7, 22.5, 22.6, 22.7**

### Property 15: Match Profile Interview Association

*For any* interview session I that references match profile M, the association should be bidirectional: M should list I in its interviewSessions, and I should reference M correctly.

**Validates: Requirements 3.8, 12.5, 12.6, 12.8, 12.9**
