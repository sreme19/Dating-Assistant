# Architecture Documentation

## System Overview

The Dating Assistant is a local CLI-based AI dating coach system with two distinct modes:
- **AI Bestie**: For female users to interview and evaluate male matches
- **AI Wingman**: For male users to get strategic dating advice

The system uses Claude API for AI capabilities and SQLite for local data persistence.

## High-Level Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                    User Interface (CLI)                      │
│  ┌──────────────────────────────────────────────────────┐   │
│  │  CLIManager                                          │   │
│  │  - Main menu display                                 │   │
│  │  - Mode selection and routing                        │   │
│  │  - Conversation display and formatting               │   │
│  │  - Error handling and user feedback                  │   │
│  └──────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────┘
                            ↓
┌─────────────────────────────────────────────────────────────┐
│                    Mode Handlers                             │
│  ┌──────────────────┐  ┌──────────────────┐  ┌────────────┐ │
│  │ BestieInterview  │  │ BestiePreference │  │  Wingman   │ │
│  │ Mode             │  │ Mode             │  │  Mode      │ │
│  └──────────────────┘  └──────────────────┘  └────────────┘ │
└─────────────────────────────────────────────────────────────┘
                            ↓
┌─────────────────────────────────────────────────────────────┐
│              Conversation Engine                             │
│  ┌──────────────────────────────────────────────────────┐   │
│  │  ConversationEngine                                  │   │
│  │  - Session initialization and validation            │   │
│  │  - Turn limit enforcement (50 turns max)            │   │
│  │  - Context building and retrieval                   │   │
│  │  - Session state management                         │   │
│  └──────────────────────────────────────────────────────┘   │
│  ┌──────────────────────────────────────────────────────┐   │
│  │  PromptBuilder                                       │   │
│  │  - Interview prompt construction                    │   │
│  │  - Preference gathering prompt construction         │   │
│  │  - Wingman advice prompt construction               │   │
│  │  - Custom prompt injection                          │   │
│  └──────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────┘
                    ↓                    ↓
        ┌───────────────────┐  ┌────────────────────┐
        │  Claude API       │  │  Database Layer    │
        │  (ClaudeClient)   │  │  (DatabaseManager) │
        └───────────────────┘  └────────────────────┘
                                        ↓
                            ┌───────────────────────┐
                            │  SQLite Database      │
                            │  (7 tables)           │
                            └───────────────────────┘
```

## Component Architecture

### 1. CLI Layer (`src/cli/`)

#### CLIManager
- **Responsibility**: Main CLI interface and user interaction
- **Key Methods**:
  - `displayMainMenu()`: Show main menu options
  - `displayModeSelection()`: Show mode selection
  - `displayConversation()`: Display AI responses
  - `getUserInput()`: Get user input with validation
  - `displaySessionSummary()`: Show session summary
  - `displayError()`: Show error messages

#### Mode Handlers
- **BestieInterviewMode**: Interview workflow for female users
  - Collect match information
  - Generate interview questions
  - Process match responses
  - Generate session summary
  
- **BestiePreferenceMode**: Preference gathering for female users
  - Ask preference questions
  - Synthesize preferences into KB
  - Store KB for future use
  
- **WingmanAdviceMode**: Advice workflow for male users
  - Process user questions
  - Generate strategic advice
  - Maintain conversation context

### 2. Engine Layer (`src/engine/`)

#### ConversationEngine
- **Responsibility**: Orchestrate conversation flow and session management
- **Key Methods**:
  - `initializeSession()`: Create new session
  - `processUserInput()`: Process and validate user input
  - `getSessionContext()`: Build conversation context
  - `finalizeSession()`: Complete session
  - `canContinueConversation()`: Check turn limit

#### PromptBuilder
- **Responsibility**: Construct prompts for Claude API
- **Key Methods**:
  - `buildInterviewPrompt()`: Build interview mode prompt
  - `buildPreferencePrompt()`: Build preference gathering prompt
  - `buildAdvicePrompt()`: Build wingman advice prompt
  - `injectCustomPrompts()`: Add user custom prompts

### 3. Database Layer (`src/database/`)

#### DatabaseManager
- **Responsibility**: CRUD operations and database management
- **Key Methods**:
  - User profile operations
  - Session management
  - Conversation turn storage
  - Custom prompt management
  - Match profile management
  - Knowledge base management

#### Specialized Managers
- **CustomPromptManager**: Manage user custom prompts (max 20)
- **MatchProfileManager**: Manage match profiles and history
- **KnowledgeBaseManager**: Manage female preferences and dating expertise KBs
- **SessionManager**: Manage session lifecycle

### 4. API Layer (`src/api/`)

#### ClaudeClient
- **Responsibility**: Claude API integration
- **Key Methods**:
  - `generateResponse()`: Generate AI response with retry logic
  - `generateInterviewQuestions()`: Generate interview questions
  - `analyzeMatchResponse()`: Analyze match responses
  - `generateDatingAdvice()`: Generate dating advice
- **Features**:
  - 30-second timeout per request
  - 3 retry attempts with exponential backoff
  - Response validation
  - Error handling

### 5. Configuration Layer (`src/config/`)

#### ConfigLoader
- **Responsibility**: Load and manage configuration
- **Features**:
  - Environment variable loading
  - API key management
  - Database path configuration
  - Default values
  - Configuration validation

### 6. Models Layer (`src/models/`)

#### TypeScript Interfaces
- `UserProfile`: User information and metadata
- `Session`: Conversation session with state
- `ConversationTurn`: Individual message exchange
- `CustomPrompt`: User-defined instructions
- `MatchProfile`: Potential romantic partner info
- `KnowledgeBase`: Female preferences or dating expertise

### 7. Utilities Layer (`src/utils/`)

#### Validators
- User profile validation
- Session validation
- Conversation turn validation
- Custom prompt validation
- Match profile validation
- Knowledge base validation

## Data Flow

### Interview Mode Flow
```
User Input
    ↓
CLIManager (display prompt)
    ↓
BestieInterviewMode (collect match info)
    ↓
ConversationEngine (initialize session)
    ↓
PromptBuilder (build interview prompt with KB)
    ↓
ClaudeClient (generate questions)
    ↓
DatabaseManager (save turn)
    ↓
CLIManager (display response)
    ↓
Loop until 50 turns or user exits
    ↓
SessionManager (finalize session)
```

### Preference Gathering Flow
```
User Input
    ↓
CLIManager (display prompt)
    ↓
BestiePreferenceMode (initialize)
    ↓
ConversationEngine (initialize session)
    ↓
PromptBuilder (build preference prompt)
    ↓
ClaudeClient (generate questions)
    ↓
DatabaseManager (save turn)
    ↓
CLIManager (display response)
    ↓
Loop until 50 turns or user exits
    ↓
KnowledgeBaseManager (synthesize KB)
    ↓
SessionManager (finalize session)
```

### Wingman Advice Flow
```
User Input
    ↓
CLIManager (display prompt)
    ↓
WingmanAdviceMode (initialize)
    ↓
ConversationEngine (initialize session)
    ↓
PromptBuilder (build advice prompt with dating KB)
    ↓
ClaudeClient (generate advice)
    ↓
DatabaseManager (save turn)
    ↓
CLIManager (display response)
    ↓
Loop until 50 turns or user exits
    ↓
SessionManager (finalize session)
```

## Database Schema

### Tables

1. **users**
   - userId (PK)
   - username (UNIQUE)
   - userType (female/male)
   - metadata (JSON)
   - createdAt, updatedAt

2. **sessions**
   - sessionId (PK)
   - userId (FK)
   - mode (interview/preference/wingman)
   - status (active/paused/completed)
   - turnCount
   - createdAt, updatedAt

3. **conversation_turns**
   - turnId (PK)
   - sessionId (FK)
   - turnNumber
   - userInput
   - aiResponse
   - createdAt

4. **custom_prompts**
   - promptId (PK)
   - userId (FK)
   - mode (bestie/wingman)
   - name (UNIQUE per user)
   - content
   - createdAt, updatedAt

5. **match_profiles**
   - matchId (PK)
   - userId (FK)
   - name
   - age, occupation, interests
   - metadata (JSON)
   - createdAt, updatedAt

6. **knowledge_bases**
   - kbId (PK)
   - userId (FK) - NULL for global
   - type (female_preferences/dating_expertise)
   - content (JSON)
   - version
   - createdAt, updatedAt

7. **interview_sessions**
   - interviewId (PK)
   - sessionId (FK)
   - matchId (FK)
   - summary
   - redFlags (JSON)
   - createdAt

### Indexes
- userId on all user-related tables
- sessionId on turns and interviews
- turnNumber on turns (for ordering)
- mode on sessions (for filtering)

## Error Handling Strategy

### Database Errors
- Connection retry with exponential backoff
- Graceful degradation
- User-friendly error messages
- Transaction rollback on failure

### API Errors
- Retry logic (3 attempts)
- Timeout handling (30 seconds)
- Rate limiting handling
- Fallback responses

### Input Validation
- All user input validated
- Type checking with TypeScript
- Business logic validation
- Clear error messages

## Performance Considerations

### Database Optimization
- Indexes on common queries
- Connection pooling
- Batch operations where possible
- Query optimization

### API Optimization
- Response caching (where applicable)
- Timeout handling
- Retry logic with backoff
- Efficient prompt construction

### Memory Management
- Stream large responses
- Clean up old sessions
- Efficient data structures
- Garbage collection friendly

## Security Considerations

### Data Protection
- Local storage only
- No external transmission except Claude API
- HTTPS for API communication
- Input validation and sanitization

### API Key Management
- Environment variable storage
- Never logged or exposed
- Secure configuration loading
- No hardcoded secrets

### Error Handling
- No sensitive data in error messages
- Secure logging practices
- User-friendly error messages
- Detailed internal logging

## Scalability Considerations

### Current Limitations
- Single-user per database
- CLI-only interface
- Local storage only

### Future Improvements
- Multi-user support
- Web interface
- Cloud storage option
- Horizontal scaling

## Testing Architecture

### Unit Tests
- Component-level testing
- Mocked dependencies
- Edge case coverage
- Error scenario testing

### Integration Tests
- Workflow-level testing
- Component interaction
- Database integration
- API integration

### Performance Tests
- Response time validation
- Database query performance
- Memory usage monitoring
- Load testing

## Deployment Architecture

### Development
- Local development with ts-node
- Watch mode for changes
- Local SQLite database

### Production
- Compiled TypeScript
- Environment-based configuration
- Local SQLite database
- Graceful error handling

## Extension Points

### Adding New Modes
1. Create new mode class in `src/cli/`
2. Implement mode interface
3. Add to CLIManager routing
4. Create tests

### Adding New Managers
1. Create manager class in `src/database/`
2. Implement CRUD operations
3. Add to DatabaseManager
4. Create tests

### Adding New Features
1. Identify required components
2. Implement in appropriate layer
3. Add tests
4. Update documentation

## Dependencies

### Core Dependencies
- `@anthropic-ai/sdk`: Claude API client
- `sqlite3`: SQLite database driver
- `inquirer`: CLI prompts
- `chalk`: Terminal colors

### Development Dependencies
- `typescript`: Type checking
- `vitest`: Testing framework
- `@types/node`: Node.js types
- `eslint`: Code linting

## Conclusion

The Dating Assistant architecture is designed for:
- **Clarity**: Clear separation of concerns
- **Maintainability**: Easy to understand and modify
- **Testability**: Comprehensive test coverage
- **Scalability**: Foundation for future growth
- **Security**: Data protection and privacy
- **Performance**: Optimized operations

For more details, see specific component documentation in the Wiki.
