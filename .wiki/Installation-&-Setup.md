# Installation & Setup Guide

## Prerequisites

Before installing Dating Assistant, ensure you have:

- **Node.js**: Version 18 or higher
  - Download from [nodejs.org](https://nodejs.org/)
  - Verify: `node --version`

- **npm or yarn**: Package manager
  - npm comes with Node.js
  - Verify: `npm --version`

- **Git**: Version control (optional, for cloning)
  - Download from [git-scm.com](https://git-scm.com/)

- **Anthropic API Key**: Required for Claude API
  - Get free key at [console.anthropic.com](https://console.anthropic.com)
  - Free tier includes $5 in credits

- **Disk Space**: ~50MB for database and dependencies

## Installation Steps

### Step 1: Clone the Repository

```bash
git clone https://github.com/sreme19/Dating-Assistant.git
cd "Dating Assistant"
```

Or download as ZIP from GitHub and extract.

### Step 2: Install Dependencies

```bash
npm install
```

This installs all required packages:
- `@anthropic-ai/sdk`: Claude API client
- `sqlite3`: Database driver
- `inquirer`: CLI prompts
- `chalk`: Terminal colors
- `typescript`: Type checking
- `vitest`: Testing framework

### Step 3: Configure Environment

Copy the example environment file:

```bash
cp .env.example .env
```

Edit `.env` and add your Anthropic API key:

```bash
# .env
ANTHROPIC_API_KEY=sk-ant-your-api-key-here
```

**Important**: Never commit `.env` to version control!

### Step 4: Build the Project

```bash
npm run build
```

This compiles TypeScript to JavaScript in the `dist/` directory.

### Step 5: Run the Application

```bash
npm start
```

The application will:
1. Initialize the database (if needed)
2. Load configuration
3. Display the main menu

## Verification

### Verify Installation

```bash
# Check Node.js version
node --version  # Should be v18.0.0 or higher

# Check npm version
npm --version   # Should be 8.0.0 or higher

# Check dependencies installed
npm list        # Should show all packages

# Run tests
npm run test:run  # Should show 173 tests passing
```

### First Run

When you run the application for the first time:

1. Database will be created at `~/.dating-assistant/data.db`
2. Schema will be initialized automatically
3. Main menu will display

## Configuration

### Environment Variables

Create or edit `.env` file:

```bash
# Required
ANTHROPIC_API_KEY=your_api_key_here

# Optional
DB_PATH=/custom/path/to/database.db
MAX_TURNS_PER_SESSION=50
MAX_CUSTOM_PROMPTS_PER_USER=20
API_TIMEOUT=30000
MAX_RETRIES=3
```

### Database Location

Default: `~/.dating-assistant/data.db`

To use custom location:

```bash
export DB_PATH=/path/to/custom/database.db
npm start
```

## Development Setup

For development with hot reload:

```bash
# Install dev dependencies (already done by npm install)
npm install

# Run in development mode
npm run dev

# Run tests in watch mode
npm test

# Run linter
npm run lint
```

## Troubleshooting Installation

### "Node.js not found"
- Install Node.js from [nodejs.org](https://nodejs.org/)
- Restart terminal after installation
- Verify: `node --version`

### "npm install fails"
- Clear npm cache: `npm cache clean --force`
- Delete `node_modules`: `rm -rf node_modules`
- Try again: `npm install`

### "ANTHROPIC_API_KEY not found"
- Ensure `.env` file exists in project root
- Verify API key is set: `echo $ANTHROPIC_API_KEY`
- If not set: `export ANTHROPIC_API_KEY=your_key_here`

### "Database error on startup"
- Delete database: `rm ~/.dating-assistant/data.db`
- Restart application
- Database will be recreated

### "Port already in use"
- Dating Assistant uses CLI only (no port)
- If error mentions port, check for other processes
- Restart terminal

### "TypeScript compilation errors"
- Ensure Node.js version is 18+
- Clear build: `rm -rf dist/`
- Rebuild: `npm run build`

## Uninstallation

To completely remove Dating Assistant:

```bash
# Remove project directory
rm -rf "Dating Assistant"

# Remove database
rm ~/.dating-assistant/data.db

# Remove npm cache (optional)
npm cache clean --force
```

## Next Steps

After installation:

1. Read [Quick Start Guide](Quick-Start-Guide)
2. Choose your mode:
   - [AI Bestie Mode Guide](AI-Bestie-Mode-Guide) for female users
   - [AI Wingman Mode Guide](AI-Wingman-Mode-Guide) for male users
3. Check [Configuration](Configuration) for advanced options
4. See [Troubleshooting](Troubleshooting) if issues arise

## Getting Help

- 📖 Check [FAQ](FAQ) for common questions
- 🐛 Report issues on [GitHub Issues](https://github.com/sreme19/Dating-Assistant/issues)
- 💬 Ask questions on [GitHub Discussions](https://github.com/sreme19/Dating-Assistant/discussions)
- 📚 Read [Troubleshooting Guide](Troubleshooting)

---

**Last Updated**: May 19, 2026
**Version**: 1.0.0
