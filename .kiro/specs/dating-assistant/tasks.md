# Implementation Plan: Dating Assistant CLI

## Overview

This implementation plan breaks down the Dating Assistant feature into discrete, actionable coding tasks. The system is a local CLI-based AI dating coach with two modes (AI Bestie for female users, AI Wingman for male users), SQLite persistence, and Claude API integration. Tasks are sequenced to build incrementally from core infrastructure through feature implementation to testing and integration.

## Tasks

- [x] 1. Set up project structure, database schema, and core types
  - [x] 1.1 Create project directory structure and TypeScript configuration
    - Create src/cli, src/engine, src/database, src/api, src/models directories
    - Set up tsconfig.json with strict mode enabled
    - Configure package.json with dependencies (sqlite3, @anthropic-ai/sdk, inquirer, chalk)
    - _Requirements: 1, 21_

  - [x] 1.2 Define core TypeScript interfaces and types
    - Create src/models/types.ts with all interfaces (UserProfile, Session, ConversationTurn, CustomPrompt, MatchProfile, KnowledgeBase)
    - Implement validation types and enums for modes, statuses, and KB types
    - _Requirements: 1, 2, 14_

  - [x] 1.3 Create SQLite database schema and initialization
    - Create src/database/schema.sql with tables for users, sessions, turns, prompts, matches, knowledge_bases
    - Implement foreign key constraints and indexes for performance
    - Create src/database/init.ts to initialize database on startup
    - _Requirements: 21, 14_

  - [ ]* 1.4 Write property tests for database schema integrity
    - **Property 2: Conversation Context Consistency**
    - **Validates: Requirements 9, 14**

- [x] 2. Implement database layer with CRUD operations
  - [x] 2.1 Create DatabaseManager class with connection pooling
    - Implement connection initialization and graceful shutdown
    - Add error handling and retry logic for database operations
    - _Requirements: 21, 13_

  - [x] 2.2 Implement user profile persistence methods
    - createUserProfile(), getUserProfile(), updateUserProfile()
    - Add validation for unique userId and username
    - _Requirements: 1, 14_

  - [x] 2.3 Implement session persistence methods
    - createSession(), getSession(), updateSession(), listSessions()
    - Enforce session state transitions and turn count validation
    - _Requirements: 2, 22_

  - [x] 2.4 Implement conversation turn persistence methods
    - saveConversationTurn(), getConversationHistory(), getTurnCount()
    - Ensure sequential turnNumber validation
    - _Requirements: 6, 9_

  - [ ]* 2.5 Write property tests for database operations
    - **Property 2: Conversation Context Consistency**
    - **Validates: Requirements 9, 14**

- [x] 3. Implement custom prompt management
  - [x] 3.1 Create CustomPromptManager class
    - createCustomPrompt(), getCustomPrompts(), updateCustomPrompt(), deleteCustomPrompt()
    - Enforce 20-prompt limit per user
    - Validate unique names per user
    - _Requirements: 7, 14_

  - [ ]* 3.2 Write property tests for custom prompt limits
    - **Property 4: Custom Prompt Limit**
    - **Validates: Requirements 7, 14**

- [x] 4. Implement match profile management
  - [x] 4.1 Create MatchProfileManager class
    - createMatchProfile(), getMatchProfile(), listMatchProfiles(), updateMatchProfile(), deleteMatchProfile()
    - Maintain referential integrity with interview sessions
    - _Requirements: 12, 14_

  - [x] 4.2 Implement match profile retrieval with session history
    - Load all associated interview sessions when retrieving match
    - Format match data for display
    - _Requirements: 12_

- [x] 5. Implement knowledge base management
  - [x] 5.1 Create KnowledgeBaseManager class
    - getKnowledgeBase(), saveKnowledgeBase(), updateKnowledgeBase()
    - Handle both user-specific (female_preferences) and global (dating_expertise) KBs
    - _Requirements: 8, 14_

  - [x] 5.2 Implement KB formatting for prompt inclusion
    - formatKBForPrompt() to prepare KB content for Claude prompts
    - Handle version tracking and updates
    - _Requirements: 8, 10_

  - [ ]* 5.3 Write property tests for knowledge base isolation
    - **Property 3: Knowledge Base Isolation**
    - **Validates: Requirements 8, 14**

- [x] 6. Implement Claude API client
  - [x] 6.1 Create ClaudeClient class with API integration
    - Initialize with API key from configuration
    - Implement generateResponse() with timeout and retry logic
    - Add error handling for API failures
    - _Requirements: 23, 13_

  - [x] 6.2 Implement response validation and parsing
    - Validate non-empty responses from Claude
    - Parse and extract message content
    - Log API usage and errors
    - _Requirements: 23, 10_

  - [x] 6.3 Implement specialized prompt methods
    - generateInterviewQuestions(), analyzeMatchResponse(), generateDatingAdvice()
    - Each method constructs appropriate system and user prompts
    - _Requirements: 18, 20, 10_

- [x] 7. Implement conversation engine core
  - [x] 7.1 Create ConversationEngine class
    - initializeSession(), processUserInput(), getSessionContext(), finalizeSession(), canContinueConversation()
    - Manage session lifecycle and state transitions
    - _Requirements: 2, 6, 22_

  - [x] 7.2 Implement session validation and turn limit enforcement
    - Validate session state before processing input
    - Enforce 50-turn limit and auto-complete sessions
    - _Requirements: 6, 22_

  - [x] 7.3 Implement conversation context building
    - buildConversationContext() to gather session, history, profiles, and KBs
    - Format context for prompt construction
    - _Requirements: 9, 10_

  - [ ]* 7.4 Write property tests for session turn limit enforcement
    - **Property 1: Session Turn Limit Enforcement**
    - **Validates: Requirements 6, 22**

- [x] 8. Implement prompt construction for AI Bestie interview mode
  - [x] 8.1 Create buildInterviewPrompt() function
    - Load female profile, preferences KB, and match profile
    - Include conversation history in context
    - Construct system prompt defining AI Bestie role
    - _Requirements: 3, 10, 18_

  - [x] 8.2 Implement interview question generation
    - Generate initial questions based on match info and female preferences
    - Generate follow-up questions based on match responses
    - Identify and highlight potential red flags
    - _Requirements: 3, 18_

- [x] 9. Implement prompt construction for AI Bestie preference gathering mode
  - [x] 9.1 Create buildPreferencePrompt() function
    - Construct system prompt for preference gathering
    - Include conversation history for progressive questioning
    - Guide AI to ask deeper follow-up questions
    - _Requirements: 4, 10, 19_

  - [x] 9.2 Implement preference KB building from conversation
    - Synthesize user answers into structured KB
    - Identify patterns and themes in preferences
    - Store KB with version tracking
    - _Requirements: 4, 8, 19_

- [x] 10. Implement prompt construction for AI Wingman advice mode
  - [x] 10.1 Create buildAdvicePrompt() function
    - Load global Dating Expertise KB
    - Include conversation history for context
    - Construct system prompt defining AI Wingman role
    - _Requirements: 5, 10, 20_

  - [x] 10.2 Implement dating advice generation
    - Generate strategic advice grounded in Dating Expertise KB
    - Provide actionable recommendations with reasoning
    - Maintain context across multiple turns
    - _Requirements: 5, 20_

- [x] 11. Implement CLI interface manager
  - [x] 11.1 Create CLIManager class
    - displayMainMenu(), displayModeSelection(), displayConversation()
    - getUserInput(), displaySessionSummary(), displayError(), confirmAction()
    - _Requirements: 17, 1, 2_

  - [x] 11.2 Implement main menu and mode selection flow
    - Display welcome message and mode options
    - Handle user selection and validation
    - Route to appropriate mode handler
    - _Requirements: 17, 1, 24_

  - [x] 11.3 Implement conversation display and formatting
    - Format and display AI responses with clear formatting
    - Show turn count and remaining turns
    - Display session summaries
    - _Requirements: 17, 6_

  - [x] 11.4 Implement error handling and user feedback
    - Display clear error messages for invalid input
    - Provide context-sensitive help text
    - Handle edge cases gracefully
    - _Requirements: 17, 13, 25_

- [x] 12. Implement AI Bestie interview mode flow
  - [x] 12.1 Create BestieInterviewMode class
    - Initialize interview session with female profile and match info
    - Manage interview conversation loop
    - _Requirements: 3, 24_

  - [x] 12.2 Implement match information collection
    - Prompt user for match details (name, age, occupation, interests)
    - Create and store match profile
    - _Requirements: 3, 12_

  - [x] 12.3 Implement interview conversation loop
    - Process user input (match responses)
    - Generate interview questions and analysis
    - Track turn count and enforce limits
    - _Requirements: 3, 6, 18_

  - [x] 12.4 Implement interview session completion and summary
    - Generate summary of key insights about match
    - Highlight identified red flags
    - Store final session data
    - _Requirements: 3, 9_

- [x] 13. Implement AI Bestie preference gathering mode flow
  - [x] 13.1 Create BestiePreferenceMode class
    - Initialize preference gathering session
    - Manage preference gathering conversation loop
    - _Requirements: 4, 24_

  - [x] 13.2 Implement preference gathering conversation loop
    - Generate opening questions about dating goals
    - Process user answers and generate follow-ups
    - Build preference KB progressively
    - _Requirements: 4, 19_

  - [x] 13.3 Implement preference KB synthesis and storage
    - Synthesize answers into structured KB
    - Identify patterns and conflicting preferences
    - Store KB for future use in interviews
    - _Requirements: 4, 8, 19_

  - [x] 13.4 Implement preference gathering completion and summary
    - Summarize key preferences discovered
    - Display KB summary to user
    - Store final KB version
    - _Requirements: 4, 9_

- [x] 14. Implement AI Wingman advice mode flow
  - [x] 14.1 Create WingmanAdviceMode class
    - Initialize wingman session
    - Load Dating Expertise KB
    - _Requirements: 5, 24_

  - [x] 14.2 Implement wingman conversation loop
    - Process user questions and scenarios
    - Generate strategic advice with actionable recommendations
    - Maintain context across turns
    - _Requirements: 5, 20_

  - [x] 14.3 Implement wingman session completion and summary
    - Summarize key advice points
    - Store conversation for future reference
    - _Requirements: 5, 9_

- [x] 15. Implement session management and persistence
  - [x] 15.1 Create SessionManager class
    - listSessions(), resumeSession(), pauseSession(), deleteSession()
    - Handle session state transitions
    - _Requirements: 2, 11, 22_

  - [x] 15.2 Implement session resumption with context restoration
    - Load session from database
    - Restore conversation history
    - Restore turn count and session context
    - _Requirements: 11, 9_

  - [x] 15.3 Implement session state transition validation
    - Validate state transitions (active → paused → active, active → completed)
    - Prevent invalid transitions
    - Update database on state changes
    - _Requirements: 22, 2_

- [x] 16. Implement data validation and error handling
  - [x] 16.1 Create validation utilities
    - validateUserProfile(), validateSession(), validateConversationTurn()
    - validateCustomPrompt(), validateMatchProfile(), validateKnowledgeBase()
    - _Requirements: 14, 13_

  - [x] 16.2 Implement comprehensive error handling
    - Handle database errors with user-friendly messages
    - Handle Claude API errors and timeouts
    - Handle invalid user input
    - _Requirements: 13, 23_

  - [x] 16.3 Implement edge case handling
    - Handle empty input, very long input
    - Handle exactly 50 turns, exactly 20 prompts
    - Handle missing profiles and KBs
    - _Requirements: 25, 13_

- [x] 17. Implement configuration management
  - [x] 17.1 Create configuration loader
    - Load Claude API key from environment or config file
    - Load database path configuration
    - Validate required configuration
    - _Requirements: 23, 16_

  - [x] 17.2 Implement secure configuration handling
    - Store API key securely (environment variable or secure config)
    - Prevent logging of sensitive information
    - _Requirements: 16, 23_

- [x] 18. Implement application entry point and initialization
  - [x] 18.1 Create main CLI entry point
    - Initialize database and schema
    - Load configuration
    - Display main menu
    - _Requirements: 1, 21, 17_

  - [x] 18.2 Implement graceful shutdown
    - Close database connections
    - Save any pending data
    - Display exit message
    - _Requirements: 21, 13_

- [x] 19. Checkpoint - Ensure core infrastructure is working
  - Ensure database initializes correctly, all CRUD operations work, and CLI displays properly
  - Run manual tests for database operations and CLI interaction
  - Ask the user if questions arise.

- [x] 20. Write unit tests for database layer
  - [x] 20.1 Write unit tests for DatabaseManager
    - Test user profile CRUD operations
    - Test session CRUD operations
    - Test conversation turn storage and retrieval
    - _Requirements: 1, 2, 6, 14_

  - [x] 20.2 Write unit tests for data validation
    - Test validation of user profiles, sessions, turns
    - Test validation of custom prompts and match profiles
    - _Requirements: 14, 13_

  - [ ]* 20.3 Write integration tests for database transactions
    - Test transaction rollback on failure
    - Test referential integrity constraints
    - _Requirements: 21, 14_

- [x] 21. Write unit tests for conversation engine
  - [x] 21.1 Write unit tests for ConversationEngine
    - Test session initialization
    - Test turn limit enforcement
    - Test session state transitions
    - _Requirements: 2, 6, 22_

  - [x] 21.2 Write unit tests for context building
    - Test buildConversationContext() with various inputs
    - Test context includes all necessary information
    - _Requirements: 9, 10_

  - [ ]* 21.3 Write property tests for session turn limit
    - **Property 1: Session Turn Limit Enforcement**
    - **Validates: Requirements 6, 22**

- [x] 22. Write unit tests for Claude API client
  - [x] 22.1 Write unit tests for ClaudeClient
    - Test response generation with mocked API
    - Test error handling and retries
    - Test timeout handling
    - _Requirements: 23, 13_

  - [x] 22.2 Write unit tests for prompt construction
    - Test buildInterviewPrompt() with various inputs
    - Test buildPreferencePrompt() with various inputs
    - Test buildAdvicePrompt() with various inputs
    - _Requirements: 10, 18, 19, 20_

- [x] 23. Write unit tests for mode-specific implementations
  - [x] 23.1 Write unit tests for AI Bestie interview mode
    - Test interview question generation
    - Test match response analysis
    - Test red flag identification
    - _Requirements: 3, 18_

  - [x] 23.2 Write unit tests for AI Bestie preference gathering
    - Test preference question generation
    - Test KB synthesis from answers
    - Test pattern identification
    - _Requirements: 4, 19_

  - [x] 23.3 Write unit tests for AI Wingman advice mode
    - Test advice generation
    - Test context maintenance across turns
    - Test actionable recommendations
    - _Requirements: 5, 20_

- [x] 24. Write unit tests for CLI interface
  - [x] 24.1 Write unit tests for CLIManager
    - Test menu display and user input handling
    - Test error message display
    - Test session summary formatting
    - _Requirements: 17, 13_

  - [x] 24.2 Write unit tests for mode selection and routing
    - Test mode selection flow
    - Test routing to correct mode handler
    - _Requirements: 24, 1_

- [x] 25. Write integration tests for complete workflows
  - [x] 25.1 Write integration test for AI Bestie interview workflow
    - Test complete interview from start to finish
    - Test session persistence and retrieval
    - Test turn limit enforcement
    - _Requirements: 3, 11, 6_

  - [x] 25.2 Write integration test for AI Bestie preference gathering workflow
    - Test complete preference gathering from start to finish
    - Test KB creation and storage
    - Test KB usage in subsequent interviews
    - _Requirements: 4, 8, 11_

  - [x] 25.3 Write integration test for AI Wingman workflow
    - Test complete wingman session from start to finish
    - Test context maintenance across turns
    - Test session persistence
    - _Requirements: 5, 11, 9_

  - [ ]* 25.4 Write integration tests for edge cases
    - Test exactly 50 turns in a session
    - Test exactly 20 custom prompts
    - Test missing profiles and KBs
    - _Requirements: 25, 13_

- [x] 26. Checkpoint - Ensure all tests pass
  - Ensure all unit and integration tests pass
  - Verify database integrity and consistency
  - Ask the user if questions arise.

- [x] 27. Implement custom prompt application in prompts
  - [x] 27.1 Implement custom prompt injection into system prompts
    - Modify buildInterviewPrompt() to include custom prompts
    - Modify buildPreferencePrompt() to include custom prompts
    - Modify buildAdvicePrompt() to include custom prompts
    - _Requirements: 7, 10_

  - [x] 27.2 Write unit tests for custom prompt application
    - Test custom prompt inclusion in generated prompts
    - Test multiple custom prompts in same session
    - _Requirements: 7, 10_

- [x] 28. Implement session history and resumption features
  - [x] 28.1 Implement session listing and display
    - List all sessions for current user
    - Display session metadata (date, mode, turn count)
    - _Requirements: 2, 11, 17_

  - [x] 28.2 Implement session resumption flow
    - Allow user to select and resume paused session
    - Restore full session context
    - Continue conversation from last turn
    - _Requirements: 11, 9, 2_

  - [x] 28.3 Write unit tests for session history features
    - Test session listing and filtering
    - Test session resumption with context restoration
    - _Requirements: 11, 2_

- [x] 29. Implement knowledge base initialization and loading
  - [x] 29.1 Create Dating Expertise KB initialization
    - Load or create global Dating Expertise KB on startup
    - Store KB in database with version tracking
    - _Requirements: 5, 8_

  - [x] 29.2 Implement KB loading and formatting
    - Load female preferences KB for interview mode
    - Load Dating Expertise KB for wingman mode
    - Format KBs for prompt inclusion
    - _Requirements: 8, 10_

  - [x] 29.3 Write unit tests for KB initialization and loading
    - Test KB creation and storage
    - Test KB retrieval and formatting
    - _Requirements: 8, 10_

- [x] 30. Implement performance optimization
  - [x] 30.1 Add database indexes for common queries
    - Index on userId for user-specific queries
    - Index on sessionId for session queries
    - Index on turnNumber for turn ordering
    - _Requirements: 15, 21_

  - [x] 30.2 Implement query optimization
    - Use efficient queries for conversation history retrieval
    - Batch operations where possible
    - _Requirements: 15, 21_

  - [x] 30.3 Write performance tests
    - Test response time for common operations
    - Test database query performance
    - _Requirements: 15_

- [x] 31. Implement comprehensive error recovery
  - [x] 31.1 Implement database connection recovery
    - Implement connection retry logic
    - Handle connection timeouts gracefully
    - _Requirements: 13, 21_

  - [x] 31.2 Implement API error recovery
    - Implement retry logic for Claude API calls
    - Handle rate limiting gracefully
    - _Requirements: 13, 23_

  - [x] 31.3 Write error recovery tests
    - Test database connection recovery
    - Test API retry logic
    - _Requirements: 13, 23_

- [x] 32. Implement logging and monitoring
  - [x] 32.1 Add structured logging
    - Log database operations
    - Log API calls and responses
    - Log user actions and errors
    - _Requirements: 13, 16_

  - [x] 32.2 Implement error logging without sensitive data
    - Log errors without exposing API keys or personal data
    - Log performance metrics
    - _Requirements: 16, 13_

- [x] 33. Final integration and end-to-end testing
  - [x] 33.1 Perform end-to-end testing of all workflows
    - Test complete AI Bestie interview workflow
    - Test complete AI Bestie preference gathering workflow
    - Test complete AI Wingman workflow
    - _Requirements: 3, 4, 5, 11_

  - [x] 33.2 Test all edge cases and error conditions
    - Test turn limit enforcement
    - Test custom prompt limits
    - Test missing data handling
    - _Requirements: 25, 13_

  - [x] 33.3 Verify performance requirements
    - Verify response generation within 30 seconds
    - Verify database operations within specified times
    - _Requirements: 15_

- [x] 34. Checkpoint - Ensure all tests pass and system is ready
  - Ensure all unit, integration, and end-to-end tests pass
  - Verify all requirements are met
  - Ask the user if questions arise.

- [x] 35. Documentation and code cleanup
  - [x] 35.1 Add inline code documentation
    - Document all public functions and classes
    - Add JSDoc comments with parameter and return types
    - _Requirements: 1_

  - [x] 35.2 Create user documentation
    - Create README with usage instructions
    - Document CLI commands and workflows
    - _Requirements: 17_

  - [x] 35.3 Code cleanup and formatting
    - Ensure consistent code style
    - Remove debug code and temporary files
    - _Requirements: 1_

## Notes

- Tasks marked with `*` are optional and can be skipped for faster MVP, but are recommended for production quality
- Each task references specific requirements for traceability
- Property-based tests validate universal correctness properties defined in the design
- Unit tests validate specific examples and edge cases
- Integration tests validate complete workflows
- Checkpoints ensure incremental validation and allow for course correction
- Database operations use transactions to maintain consistency
- All API calls include timeout and retry logic
- Error messages are user-friendly and actionable
- Performance targets: response generation < 30s, DB operations < 500ms-2s, app startup < 5s

## Task Dependency Graph

```json
{
  "waves": [
    { "id": 0, "tasks": ["1.1", "1.2", "1.3"] },
    { "id": 1, "tasks": ["1.4", "2.1", "2.2", "2.3", "2.4"] },
    { "id": 2, "tasks": ["2.5", "3.1", "4.1", "5.1"] },
    { "id": 3, "tasks": ["3.2", "4.2", "5.2", "5.3"] },
    { "id": 4, "tasks": ["6.1", "6.2", "6.3"] },
    { "id": 5, "tasks": ["7.1", "7.2", "7.3"] },
    { "id": 6, "tasks": ["7.4", "8.1", "8.2"] },
    { "id": 7, "tasks": ["9.1", "9.2", "10.1", "10.2"] },
    { "id": 8, "tasks": ["11.1", "11.2", "11.3", "11.4"] },
    { "id": 9, "tasks": ["12.1", "12.2", "12.3", "12.4"] },
    { "id": 10, "tasks": ["13.1", "13.2", "13.3", "13.4"] },
    { "id": 11, "tasks": ["14.1", "14.2", "14.3"] },
    { "id": 12, "tasks": ["15.1", "15.2", "15.3"] },
    { "id": 13, "tasks": ["16.1", "16.2", "16.3"] },
    { "id": 14, "tasks": ["17.1", "17.2", "18.1", "18.2"] },
    { "id": 15, "tasks": ["20.1", "20.2", "20.3"] },
    { "id": 16, "tasks": ["21.1", "21.2", "21.3"] },
    { "id": 17, "tasks": ["22.1", "22.2"] },
    { "id": 18, "tasks": ["23.1", "23.2", "23.3"] },
    { "id": 19, "tasks": ["24.1", "24.2"] },
    { "id": 20, "tasks": ["25.1", "25.2", "25.3", "25.4"] },
    { "id": 21, "tasks": ["27.1", "27.2"] },
    { "id": 22, "tasks": ["28.1", "28.2", "28.3"] },
    { "id": 23, "tasks": ["29.1", "29.2", "29.3"] },
    { "id": 24, "tasks": ["30.1", "30.2", "30.3"] },
    { "id": 25, "tasks": ["31.1", "31.2", "31.3"] },
    { "id": 26, "tasks": ["32.1", "32.2"] },
    { "id": 27, "tasks": ["33.1", "33.2", "33.3"] }
  ]
}
```
