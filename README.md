# Dating Assistant

A local CLI-based AI dating coach system that provides personalized dating advice and interview capabilities through two distinct modes: AI Bestie (for female users) and AI Wingman (for male users). The system operates entirely on your local machine with no server hosting requirements.

## Features

### AI Bestie Mode (Female Users)
- **Interview Matches**: Structured interview questions to evaluate male matches based on your preferences
- **Gather Preferences**: Build a personalized preferences knowledge base through guided conversation
- **Session Management**: Resume previous sessions and track interview history
- **Custom Prompts**: Create custom instructions to personalize AI behavior

### AI Wingman Mode (Male Users)
- **Strategic Dating Advice**: Get actionable dating advice grounded in relationship expertise
- **Context-Aware Conversations**: Maintain conversation context across multiple turns
- **Session Management**: Resume previous sessions and track advice history
- **Custom Prompts**: Create custom instructions to personalize AI behavior

## Architecture

- **CLI Interface**: Intuitive command-line user interaction with clear menus
- **Conversation Engine**: Multi-turn conversation management with 50-turn limit per session
- **Claude API Integration**: AI-powered responses using Anthropic's Claude model
- **SQLite Database**: Local data persistence with referential integrity
- **Knowledge Base Management**: Female preferences and dating expertise knowledge bases
- **Session Persistence**: All conversations are saved locally for future reference

## Project Structure

```
src/
├── cli/                    # CLI interface and mode implementations
│   ├── CLIManager.ts       # Main CLI interface
│   ├── BestieInterviewMode.ts
│   ├── BestiePreferenceMode.ts
│   └── WingmanAdviceMode.ts
├── engine/                 # Conversation engine
│   ├── ConversationEngine.ts
│   └── PromptBuilder.ts
├── database/               # Database operations
│   ├── manager.ts          # Main database manager
│   ├── CustomPromptManager.ts
│   ├── MatchProfileManager.ts
│   ├── KnowledgeBaseManager.ts
│   ├── SessionManager.ts
│   ├── schema.sql
│   └── init.ts
├── api/                    # Claude API client
│   └── ClaudeClient.ts
├── config/                 # Configuration management
│   └── ConfigLoader.ts
├── models/                 # TypeScript types and interfaces
│   └── types.ts
├── utils/                  # Utility functions
│   └── validators.ts
└── index.ts                # Application entry point
```

## Setup

### Prerequisites
- Node.js 18 or higher
- npm or yarn
- Anthropic API key (get one at https://console.anthropic.com)

### Installation

1. Clone the repository and navigate to the project directory:
```bash
cd "Dating Assistant"
```

2. Install dependencies:
```bash
npm install
```

3. Set up environment variables:
```bash
# Copy the example environment file
cp .env.example .env

# Edit .env and add your Anthropic API key
export ANTHROPIC_API_KEY=your_api_key_here
```

4. Build the project:
```bash
npm run build
```

5. Run the application:
```bash
npm start
```

## Usage

### Starting the Application
```bash
npm start
```

### Main Menu
When you start the application, you'll see:
1. **Female User (AI Bestie)** - For female users
2. **Male User (AI Wingman)** - For male users

### AI Bestie Mode (Female Users)
1. **Interview a Match** - Evaluate a male match through structured questions
   - Enter match information (name, age, occupation, interests)
   - AI Bestie will generate interview questions
   - Provide match responses and get analysis
   - Session ends after 50 turns or when you exit

2. **Gather My Preferences** - Build your dating preferences knowledge base
   - Answer questions about your dating goals
   - AI Bestie will ask progressive follow-up questions
   - Your preferences are saved for future interviews

3. **View Previous Sessions** - See all your past interview and preference sessions

4. **Manage Custom Prompts** - Create custom instructions for AI Bestie

### AI Wingman Mode (Male Users)
1. **Get Dating Advice** - Ask dating questions and get strategic advice
   - Ask about dating scenarios or strategies
   - Get actionable recommendations
   - Maintain context across multiple turns
   - Session ends after 50 turns or when you exit

2. **View Previous Sessions** - See all your past advice sessions

3. **Manage Custom Prompts** - Create custom instructions for AI Wingman

## Development

### Available Commands
- `npm run build` - Build the TypeScript project
- `npm start` - Run the compiled application
- `npm run dev` - Run in development mode with ts-node
- `npm test` - Run tests in watch mode
- `npm run test:run` - Run tests once
- `npm run lint` - Lint the code

### Running Tests
```bash
# Run all tests
npm run test:run

# Run tests in watch mode
npm test

# Run specific test file
npm test -- src/database/manager.test.ts
```

### Project Statistics
- **Test Coverage**: 173 tests across 7 test files
- **Lines of Code**: ~3,400+ lines of implementation
- **Database Tables**: 7 tables with referential integrity
- **API Integration**: Anthropic Claude API with retry logic

## Data Models

### User Profile
- Stores user information (female or male)
- Optional metadata (age range, location, interests)
- Unique username per user

### Session
- Represents a conversation session
- Maximum 50 turns per session
- Status tracking (active, paused, completed)
- Mode-specific (bestie or wingman)

### Conversation Turn
- Individual message exchange
- Stores user input and AI response
- Sequential turn numbering
- Timestamp and metadata

### Match Profile
- Information about a potential romantic partner
- Associated interview sessions
- Created by female users

### Knowledge Base
- Female preferences KB (user-specific)
- Dating expertise KB (global)
- Version tracking for updates

### Custom Prompt
- User-defined instructions
- Mode-specific (bestie or wingman)
- Maximum 20 prompts per user

## Database

The application uses SQLite for local data persistence. The database is automatically created on first run at:
- Default: `~/.dating-assistant/data.db`
- Custom: Set `DB_PATH` environment variable

### Database Features
- Foreign key constraints for referential integrity
- Indexes for performance optimization
- Automatic schema initialization
- Transaction support for data consistency

## Configuration

Configuration is managed through environment variables:

```bash
# Required
ANTHROPIC_API_KEY=your_api_key_here

# Optional
DB_PATH=/custom/path/to/database.db
```

See `.env.example` for all available options.

## Error Handling

The application includes comprehensive error handling:
- Database connection errors with retry logic
- Claude API errors with automatic retries
- Input validation with clear error messages
- Graceful shutdown on errors

## Performance

- Response generation: < 30 seconds
- Database operations: < 500ms - 2 seconds
- Application startup: < 5 seconds
- Conversation history retrieval: < 1 second

## Security & Privacy

- All data is stored locally on your machine
- No personal data is transmitted to external servers (except Claude API)
- Claude API communication uses HTTPS encryption
- API key is stored in environment variables
- No sensitive data is logged to console or files

## Troubleshooting

### "ANTHROPIC_API_KEY not found"
Make sure you've set the environment variable:
```bash
export ANTHROPIC_API_KEY=your_api_key_here
```

### Database errors
The database is automatically created on first run. If you encounter issues:
1. Delete the database file: `rm ~/.dating-assistant/data.db`
2. Restart the application

### API timeout errors
If you're experiencing timeouts:
1. Check your internet connection
2. Verify your API key is valid
3. Try again (automatic retry logic is built-in)

## Requirements Met

This implementation satisfies all 25 requirements from the specification:
- ✅ User mode selection and profile management
- ✅ Session initialization and management
- ✅ AI Bestie interview mode
- ✅ AI Bestie preference gathering mode
- ✅ AI Wingman advice mode
- ✅ Conversation turn management and limits
- ✅ Custom prompt management
- ✅ Knowledge base management
- ✅ Conversation context and history
- ✅ Prompt construction and AI response generation
- ✅ Session persistence and recovery
- ✅ Match profile management
- ✅ Error handling and validation
- ✅ Data validation and integrity
- ✅ Performance and efficiency
- ✅ Security and privacy
- ✅ CLI user interface
- ✅ AI Bestie interview mode - question generation
- ✅ AI Bestie preference gathering - progressive questioning
- ✅ AI Wingman advice mode - strategic guidance
- ✅ Database schema and persistence
- ✅ Session state transitions
- ✅ Claude API integration
- ✅ Multi-mode support and mode switching
- ✅ Edge cases and boundary conditions

## License

MIT

## Support

For issues or questions, please refer to the specification documents in `.kiro/specs/dating-assistant/`
