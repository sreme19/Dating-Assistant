# Requirements Document: Dating Assistant

## Introduction

The Dating Assistant is a local CLI-based AI dating coach system that provides personalized dating advice and interview capabilities. The system serves two distinct user groups: female users through AI Bestie mode and male users through AI Wingman mode. All data persists locally using SQLite, and the system leverages Claude AI for intelligent conversation. The application operates entirely on the user's local machine with no server hosting requirements.

This requirements document derives from the approved technical design and specifies the functional and non-functional requirements that the system must satisfy.

## Glossary

- **AI Bestie**: Specialized mode for female users providing interview and preference gathering capabilities
- **AI Wingman**: Specialized mode for male users providing strategic dating advice
- **Conversation Turn**: A single exchange consisting of user input and AI response
- **Session**: A bounded conversation with a maximum of 50 turns
- **Knowledge Base (KB)**: Structured information used to inform AI responses (female preferences or dating expertise)
- **Custom Prompt**: User-defined instruction that modifies AI behavior within a session
- **Match Profile**: Information about a potential romantic partner being evaluated
- **User Profile**: Information about the Dating Assistant user (age range, location, interests)
- **Interview Mode**: AI Bestie sub-mode for evaluating male matches through structured questions
- **Preference Gathering Mode**: AI Bestie sub-mode for understanding female user's dating preferences
- **Session Context**: The accumulated conversation history and metadata needed to generate appropriate responses
- **Turn Limit**: Maximum of 50 conversation turns per session
- **Claude API**: Anthropic's language model API used for generating AI responses
- **SQLite Database**: Local relational database for persisting user data and conversation history

## Requirements

### Requirement 1: User Mode Selection and Profile Management

**User Story:** As a user, I want to select my role (female or male) and create a profile, so that the system can provide personalized dating assistance tailored to my needs.

#### Acceptance Criteria

1. WHEN a user launches the Dating Assistant, THE System SHALL display a main menu with mode selection options
2. WHEN a user selects "Female User", THE System SHALL initialize AI Bestie mode and load or create a female user profile
3. WHEN a user selects "Male User", THE System SHALL initialize AI Wingman mode and load or create a male user profile
4. WHEN a user creates a new profile, THE System SHALL store the profile in the SQLite database with a unique user ID
5. WHEN a user launches the application, THE System SHALL retrieve their existing profile if one exists
6. WHEN a user profile is created, THE System SHALL initialize metadata fields (age range, location, interests) as optional
7. WHEN a user profile is updated, THE System SHALL persist changes to the database immediately
8. WHEN a user profile is retrieved, THE System SHALL return all stored metadata without modification

### Requirement 2: Session Initialization and Management

**User Story:** As a user, I want to start a new conversation session, so that I can have focused interactions with the AI coach within defined boundaries.

#### Acceptance Criteria

1. WHEN a user initiates a new session, THE System SHALL create a Session object with status 'active'
2. WHEN a session is created, THE System SHALL set turnCount to 0 and maxTurns to 50
3. WHEN a session is created, THE System SHALL assign a unique sessionId and store it in the database
4. WHEN a session is created, THE System SHALL record the current timestamp as createdAt
5. WHEN a user views active sessions, THE System SHALL display all sessions with status 'active' for that user
6. WHEN a user resumes a paused session, THE System SHALL restore the session to 'active' status
7. WHEN a session reaches 50 turns, THE System SHALL automatically set status to 'completed'
8. WHEN a session is completed, THE System SHALL prevent new turns from being added to that session
9. WHEN a user ends a session manually, THE System SHALL set status to 'completed' and store the final timestamp

### Requirement 3: AI Bestie Interview Mode

**User Story:** As a female user, I want to interview male matches through structured questions, so that I can evaluate their compatibility and identify potential red flags.

#### Acceptance Criteria

1. WHEN a female user selects Interview Mode, THE System SHALL prompt for match information (name, age, occupation, interests)
2. WHEN match information is provided, THE System SHALL create a Match Profile and store it in the database
3. WHEN an interview session starts, THE System SHALL load the female user's profile and preferences KB
4. WHEN an interview session starts, THE System SHALL load the match profile information
5. WHEN the AI generates interview questions, THE System SHALL base them on the female user's preferences and the match information
6. WHEN the user provides a match response, THE System SHALL analyze it in context of previous responses
7. WHEN the user provides a match response, THE System SHALL generate follow-up questions or analysis
8. WHEN an interview session completes, THE System SHALL store all conversation turns with the match profile reference
9. WHEN an interview session completes, THE System SHALL generate a summary of key insights about the match

### Requirement 4: AI Bestie Preference Gathering Mode

**User Story:** As a female user, I want to articulate and refine my dating preferences, so that I can better understand what I'm looking for in a partner.

#### Acceptance Criteria

1. WHEN a female user selects Preference Gathering Mode, THE System SHALL initialize a preference gathering session
2. WHEN a preference gathering session starts, THE System SHALL generate opening questions about dating goals
3. WHEN the user answers preference questions, THE System SHALL store the answers in the database
4. WHEN the user answers preference questions, THE System SHALL generate contextual follow-up questions
5. WHEN preference gathering progresses, THE System SHALL build a comprehensive Female Preferences Knowledge Base
6. WHEN a preference gathering session completes, THE System SHALL store the KB with type 'female_preferences'
7. WHEN a preference gathering session completes, THE System SHALL associate the KB with the user's profile
8. WHEN a female user has a preferences KB, THE System SHALL use it in subsequent interview sessions
9. WHEN a preferences KB is updated, THE System SHALL increment the version number

### Requirement 5: AI Wingman Advice Mode

**User Story:** As a male user, I want to receive strategic dating advice, so that I can navigate dating scenarios with confidence and effectiveness.

#### Acceptance Criteria

1. WHEN a male user selects AI Wingman Mode, THE System SHALL initialize a wingman session
2. WHEN a wingman session starts, THE System SHALL load the global Dating Expertise Knowledge Base
3. WHEN a male user asks a dating question, THE System SHALL generate advice grounded in the Dating Expertise KB
4. WHEN the user provides context about a dating scenario, THE System SHALL analyze it and provide strategic next steps
5. WHEN the user asks follow-up questions, THE System SHALL maintain conversation context across turns
6. WHEN the AI generates advice, THE System SHALL include actionable recommendations
7. WHEN a wingman session completes, THE System SHALL store all conversation turns in the database
8. WHEN a wingman session completes, THE System SHALL generate a summary of key advice points

### Requirement 6: Conversation Turn Management and Limits

**User Story:** As a system, I want to enforce conversation turn limits, so that API costs are controlled and sessions remain focused.

#### Acceptance Criteria

1. WHEN a user submits input in an active session, THE System SHALL increment the turn count by 1
2. WHEN a turn is processed, THE System SHALL store the user message and AI response in the database
3. WHEN a turn is stored, THE System SHALL assign a sequential turnNumber starting from 1
4. WHEN a turn is stored, THE System SHALL record the timestamp
5. WHEN turnCount reaches 50, THE System SHALL prevent new turns from being added
6. WHEN turnCount reaches 50, THE System SHALL automatically set session status to 'completed'
7. WHEN a user attempts to add a turn to a completed session, THE System SHALL return an error
8. WHEN a session is active, THE System SHALL display the current turn count and remaining turns to the user
9. WHEN retrieving conversation history, THE System SHALL return turns in chronological order by turnNumber

### Requirement 7: Custom Prompt Management

**User Story:** As a user, I want to create and manage custom prompts, so that I can personalize the AI's behavior to my specific needs.

#### Acceptance Criteria

1. WHEN a user creates a custom prompt, THE System SHALL store it with a unique promptId
2. WHEN a custom prompt is created, THE System SHALL associate it with the user and mode (bestie or wingman)
3. WHEN a custom prompt is created, THE System SHALL validate that the name is unique per user
4. WHEN a user has 20 custom prompts, THE System SHALL prevent creation of additional prompts
5. WHEN a user lists custom prompts, THE System SHALL display all prompts for the selected mode
6. WHEN a user deletes a custom prompt, THE System SHALL remove it from the database
7. WHEN a user updates a custom prompt, THE System SHALL persist changes to the database
8. WHEN a custom prompt is applied to a session, THE System SHALL incorporate it into the system prompt
9. WHEN a custom prompt is applied, THE System SHALL modify AI behavior according to the prompt content

### Requirement 8: Knowledge Base Management

**User Story:** As a system, I want to manage knowledge bases for both female preferences and dating expertise, so that AI responses are informed by relevant context.

#### Acceptance Criteria

1. WHEN a female user completes preference gathering, THE System SHALL create a Knowledge Base with type 'female_preferences'
2. WHEN a female preferences KB is created, THE System SHALL store it with the user's ID
3. WHEN a female preferences KB is created, THE System SHALL set version to 1
4. WHEN a female preferences KB is updated, THE System SHALL increment the version number
5. WHEN a female user starts an interview, THE System SHALL retrieve her preferences KB if it exists
6. WHEN a preferences KB is retrieved, THE System SHALL format it for inclusion in the Claude prompt
7. WHEN the system initializes, THE System SHALL load the global Dating Expertise KB
8. WHEN the Dating Expertise KB is loaded, THE System SHALL make it available to all male users
9. WHEN a KB is stored, THE System SHALL persist both the formatted content and source data

### Requirement 9: Conversation Context and History

**User Story:** As a system, I want to maintain accurate conversation context, so that AI responses are coherent and contextually appropriate.

#### Acceptance Criteria

1. WHEN a session is active, THE System SHALL maintain a complete history of all conversation turns
2. WHEN building a prompt, THE System SHALL include relevant conversation history
3. WHEN retrieving conversation history, THE System SHALL return turns in chronological order
4. WHEN a turn is added, THE System SHALL verify that turnNumber is sequential
5. WHEN conversation history is retrieved, THE System SHALL include both user messages and AI responses
6. WHEN a session context is built, THE System SHALL include user profile information
7. WHEN a session context is built, THE System SHALL include relevant knowledge bases
8. WHEN a session context is built, THE System SHALL include any applied custom prompts
9. WHEN conversation context is used in a prompt, THE System SHALL format it for clarity

### Requirement 10: Prompt Construction and AI Response Generation

**User Story:** As a system, I want to construct appropriate prompts for different modes, so that Claude generates contextually relevant responses.

#### Acceptance Criteria

1. WHEN an interview session is active, THE System SHALL construct prompts that include female profile and preferences
2. WHEN an interview session is active, THE System SHALL construct prompts that include match profile information
3. WHEN an interview session is active, THE System SHALL construct prompts that include conversation history
4. WHEN a preference gathering session is active, THE System SHALL construct prompts that guide progressive questioning
5. WHEN a wingman session is active, THE System SHALL construct prompts that include the Dating Expertise KB
6. WHEN a wingman session is active, THE System SHALL construct prompts that include conversation history
7. WHEN a prompt is constructed, THE System SHALL include a system message defining the AI's role
8. WHEN a prompt is sent to Claude, THE System SHALL receive a response within a reasonable timeout
9. WHEN Claude returns a response, THE System SHALL validate that it is non-empty before storing

### Requirement 11: Session Persistence and Recovery

**User Story:** As a user, I want my sessions to persist, so that I can resume conversations later without losing progress.

#### Acceptance Criteria

1. WHEN a session is created, THE System SHALL store it in the SQLite database
2. WHEN a session is active, THE System SHALL persist all conversation turns to the database
3. WHEN a user views previous sessions, THE System SHALL retrieve all sessions for that user
4. WHEN a user resumes a paused session, THE System SHALL restore the session state from the database
5. WHEN a session is resumed, THE System SHALL load all previous conversation turns
6. WHEN a session is resumed, THE System SHALL restore the turn count
7. WHEN a session is resumed, THE System SHALL restore the session context
8. WHEN the application crashes, THE System SHALL preserve all persisted data
9. WHEN a user queries session history, THE System SHALL return sessions ordered by creation date

### Requirement 12: Match Profile Management

**User Story:** As a female user, I want to manage profiles of male matches, so that I can organize and track multiple interviews.

#### Acceptance Criteria

1. WHEN a female user creates a match profile, THE System SHALL store it with a unique matchId
2. WHEN a match profile is created, THE System SHALL associate it with the user
3. WHEN a match profile is created, THE System SHALL store match name and information
4. WHEN a female user lists match profiles, THE System SHALL display all matches she has interviewed
5. WHEN a female user views a match profile, THE System SHALL display all associated interview sessions
6. WHEN a match profile is updated, THE System SHALL persist changes to the database
7. WHEN a match profile is deleted, THE System SHALL remove it from the database
8. WHEN an interview session references a match, THE System SHALL maintain the reference in the database
9. WHEN a match profile is retrieved, THE System SHALL include all associated interview sessions

### Requirement 13: Error Handling and Validation

**User Story:** As a system, I want to handle errors gracefully, so that users receive clear feedback and the system remains stable.

#### Acceptance Criteria

1. WHEN a user provides invalid input, THE System SHALL display a clear error message
2. WHEN a database operation fails, THE System SHALL log the error and display a user-friendly message
3. WHEN the Claude API is unavailable, THE System SHALL display an error and prevent session continuation
4. WHEN a session reaches the turn limit, THE System SHALL inform the user and prevent further turns
5. WHEN a user attempts an invalid action, THE System SHALL explain why the action is not allowed
6. WHEN a custom prompt limit is reached, THE System SHALL inform the user of the limit
7. WHEN a database connection fails, THE System SHALL attempt to reconnect or display an error
8. WHEN a user profile is missing required fields, THE System SHALL prompt for the missing information
9. WHEN an unexpected error occurs, THE System SHALL log it and display a generic error message

### Requirement 14: Data Validation and Integrity

**User Story:** As a system, I want to validate all data, so that the database maintains integrity and consistency.

#### Acceptance Criteria

1. WHEN a user profile is created, THE System SHALL validate that userId is unique and non-empty
2. WHEN a user profile is created, THE System SHALL validate that mode is either 'female' or 'male'
3. WHEN a session is created, THE System SHALL validate that userId references a valid user
4. WHEN a session is created, THE System SHALL validate that mode is either 'bestie' or 'wingman'
5. WHEN a conversation turn is stored, THE System SHALL validate that sessionId references a valid session
6. WHEN a conversation turn is stored, THE System SHALL validate that turnNumber is sequential
7. WHEN a custom prompt is created, THE System SHALL validate that name is non-empty and unique per user
8. WHEN a custom prompt is created, THE System SHALL validate that content is non-empty
9. WHEN a knowledge base is stored, THE System SHALL validate that type is either 'female_preferences' or 'dating_expertise'

### Requirement 15: Performance and Efficiency

**User Story:** As a system, I want to perform efficiently, so that users experience responsive interactions.

#### Acceptance Criteria

1. WHEN a user submits input, THE System SHALL generate a response within 30 seconds
2. WHEN retrieving conversation history, THE System SHALL return results within 1 second
3. WHEN loading a session, THE System SHALL restore all context within 2 seconds
4. WHEN querying the database, THE System SHALL use indexes to optimize performance
5. WHEN storing a conversation turn, THE System SHALL complete the operation within 500ms
6. WHEN a user lists sessions, THE System SHALL display results within 1 second
7. WHEN the application starts, THE System SHALL initialize within 5 seconds
8. WHEN conversation history grows large, THE System SHALL maintain query performance through indexing
9. WHEN the database grows, THE System SHALL maintain acceptable performance

### Requirement 16: Security and Privacy

**User Story:** As a user, I want my data to be secure and private, so that my personal information and conversations are protected.

#### Acceptance Criteria

1. WHEN the application stores data, THE System SHALL store it locally on the user's machine
2. WHEN the application stores data, THE System SHALL not transmit personal data to external servers (except Claude API)
3. WHEN the application communicates with Claude API, THE System SHALL use HTTPS encryption
4. WHEN the application stores the Claude API key, THE System SHALL store it in a secure configuration file
5. WHEN a user deletes a session, THE System SHALL remove all associated conversation turns from the database
6. WHEN a user deletes a profile, THE System SHALL remove all associated data from the database
7. WHEN the database file is accessed, THE System SHALL rely on OS-level file permissions for access control
8. WHEN the application runs, THE System SHALL not log sensitive user information to console or files
9. WHEN the application stores conversation data, THE System SHALL not encrypt it (user controls file access)

### Requirement 17: CLI User Interface

**User Story:** As a user, I want a clear and intuitive command-line interface, so that I can easily navigate the application.

#### Acceptance Criteria

1. WHEN the application starts, THE System SHALL display a main menu with clear options
2. WHEN a user selects a mode, THE System SHALL display mode-specific sub-menus
3. WHEN a conversation is active, THE System SHALL display the current turn count and remaining turns
4. WHEN the AI generates a response, THE System SHALL display it clearly formatted
5. WHEN a session completes, THE System SHALL display a summary of key information
6. WHEN an error occurs, THE System SHALL display a clear error message
7. WHEN a user needs help, THE System SHALL provide context-sensitive help text
8. WHEN a user views session history, THE System SHALL display sessions in a readable format
9. WHEN a user manages custom prompts, THE System SHALL display prompts in a clear list

### Requirement 18: AI Bestie Interview Mode - Question Generation

**User Story:** As AI Bestie, I want to generate thoughtful interview questions, so that female users can effectively evaluate male matches.

#### Acceptance Criteria

1. WHEN an interview starts, THE System SHALL generate initial questions based on match information
2. WHEN the user provides a match response, THE System SHALL analyze it for compatibility signals
3. WHEN the user provides a match response, THE System SHALL generate follow-up questions based on the response
4. WHEN generating questions, THE System SHALL reference the female user's preferences KB
5. WHEN generating questions, THE System SHALL identify potential red flags in responses
6. WHEN generating questions, THE System SHALL progress from surface-level to deeper topics
7. WHEN an interview progresses, THE System SHALL maintain coherence across questions
8. WHEN an interview completes, THE System SHALL provide analysis of key compatibility factors
9. WHEN an interview completes, THE System SHALL highlight any identified red flags

### Requirement 19: AI Bestie Preference Gathering - Progressive Questioning

**User Story:** As AI Bestie, I want to guide users through progressive questioning, so that they develop a comprehensive understanding of their preferences.

#### Acceptance Criteria

1. WHEN preference gathering starts, THE System SHALL ask opening questions about dating goals
2. WHEN the user answers a question, THE System SHALL generate follow-up questions based on their answer
3. WHEN preference gathering progresses, THE System SHALL explore different preference dimensions
4. WHEN preference gathering progresses, THE System SHALL identify patterns and themes
5. WHEN the user provides answers, THE System SHALL synthesize them into a coherent preferences KB
6. WHEN preference gathering completes, THE System SHALL summarize the user's key preferences
7. WHEN preference gathering completes, THE System SHALL identify any conflicting preferences
8. WHEN preference gathering completes, THE System SHALL store the KB for future use
9. WHEN a preferences KB is built, THE System SHALL format it for use in interview mode

### Requirement 20: AI Wingman Advice Mode - Strategic Guidance

**User Story:** As AI Wingman, I want to provide strategic dating advice, so that male users can navigate dating scenarios effectively.

#### Acceptance Criteria

1. WHEN a wingman session starts, THE System SHALL load the Dating Expertise Knowledge Base
2. WHEN a male user asks a dating question, THE System SHALL provide advice grounded in the KB
3. WHEN the user describes a dating scenario, THE System SHALL analyze it and provide strategic next steps
4. WHEN the user asks follow-up questions, THE System SHALL maintain context and build on previous advice
5. WHEN generating advice, THE System SHALL include actionable recommendations
6. WHEN generating advice, THE System SHALL explain the reasoning behind recommendations
7. WHEN the user provides new information, THE System SHALL adjust advice accordingly
8. WHEN a wingman session completes, THE System SHALL summarize key advice points
9. WHEN a wingman session completes, THE System SHALL store the conversation for future reference

### Requirement 21: Database Schema and Persistence

**User Story:** As a system, I want to persist all data reliably, so that user information and conversations are preserved.

#### Acceptance Criteria

1. WHEN the application initializes, THE System SHALL create the SQLite database if it doesn't exist
2. WHEN the application initializes, THE System SHALL create all required tables with proper schema
3. WHEN the application initializes, THE System SHALL create indexes for performance optimization
4. WHEN data is stored, THE System SHALL use foreign keys to maintain referential integrity
5. WHEN data is stored, THE System SHALL use constraints to enforce data validation
6. WHEN a transaction completes, THE System SHALL commit changes to the database
7. WHEN a transaction fails, THE System SHALL rollback changes to maintain consistency
8. WHEN the database grows, THE System SHALL maintain performance through proper indexing
9. WHEN the application shuts down, THE System SHALL close database connections gracefully

### Requirement 22: Session State Transitions

**User Story:** As a system, I want to manage session state correctly, so that sessions transition through valid states.

#### Acceptance Criteria

1. WHEN a session is created, THE System SHALL set status to 'active'
2. WHEN a session is active, THE System SHALL allow turns to be added
3. WHEN a session reaches 50 turns, THE System SHALL automatically transition to 'completed'
4. WHEN a session is completed, THE System SHALL prevent new turns from being added
5. WHEN a user pauses a session, THE System SHALL set status to 'paused'
6. WHEN a user resumes a paused session, THE System SHALL set status to 'active'
7. WHEN a session is paused, THE System SHALL preserve all conversation history
8. WHEN a session transitions to completed, THE System SHALL record the completion timestamp
9. WHEN a session state changes, THE System SHALL update the database immediately

### Requirement 23: Claude API Integration

**User Story:** As a system, I want to integrate with Claude API reliably, so that users receive high-quality AI responses.

#### Acceptance Criteria

1. WHEN the application initializes, THE System SHALL load the Claude API key from configuration
2. WHEN a prompt is ready, THE System SHALL send it to Claude API via HTTPS
3. WHEN Claude API returns a response, THE System SHALL parse it and extract the message
4. WHEN Claude API is unavailable, THE System SHALL display an error to the user
5. WHEN Claude API returns an error, THE System SHALL log it and display a user-friendly message
6. WHEN a request times out, THE System SHALL retry up to 3 times before failing
7. WHEN a response is received, THE System SHALL validate that it is non-empty
8. WHEN a response is received, THE System SHALL store it in the database
9. WHEN the API key is invalid, THE System SHALL display an error and prevent session continuation

### Requirement 24: Multi-Mode Support and Mode Switching

**User Story:** As a system, I want to support multiple modes, so that different user types can access appropriate features.

#### Acceptance Criteria

1. WHEN a user selects Female mode, THE System SHALL initialize AI Bestie with available sub-modes
2. WHEN a user selects Male mode, THE System SHALL initialize AI Wingman
3. WHEN a user is in Female mode, THE System SHALL not display AI Wingman features
4. WHEN a user is in Male mode, THE System SHALL not display AI Bestie features
5. WHEN a user switches modes, THE System SHALL preserve previous sessions
6. WHEN a user switches modes, THE System SHALL load mode-appropriate data
7. WHEN a user is in AI Bestie mode, THE System SHALL display Interview and Preference Gathering options
8. WHEN a user is in AI Wingman mode, THE System SHALL display Advice option
9. WHEN a session is created, THE System SHALL enforce mode-specific constraints

### Requirement 25: Edge Cases and Boundary Conditions

**User Story:** As a system, I want to handle edge cases gracefully, so that the application remains stable under unusual conditions.

#### Acceptance Criteria

1. WHEN a user provides empty input, THE System SHALL display an error and prompt for valid input
2. WHEN a user provides very long input, THE System SHALL accept it and process it
3. WHEN a session has exactly 50 turns, THE System SHALL prevent the 51st turn
4. WHEN a user has exactly 20 custom prompts, THE System SHALL prevent creation of the 21st
5. WHEN a database query returns no results, THE System SHALL handle it gracefully
6. WHEN a user profile has no preferences KB, THE System SHALL proceed without it
7. WHEN a match profile has no interview sessions, THE System SHALL display an empty list
8. WHEN the application receives invalid configuration, THE System SHALL display an error
9. WHEN the database file is corrupted, THE System SHALL display an error and suggest recovery steps

