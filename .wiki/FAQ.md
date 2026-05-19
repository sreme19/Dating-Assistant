# Frequently Asked Questions (FAQ)

## General Questions

### What is Dating Assistant?

Dating Assistant is a local CLI-based AI dating coach system with two modes:
- **AI Bestie**: For female users to interview and evaluate matches
- **AI Wingman**: For male users to get strategic dating advice

All data is stored locally on your machine using SQLite.

### Is it free?

The application is free and open-source (MIT License). You need an Anthropic API key for Claude AI, which has a free tier with $5 in credits.

### Is my data private?

Yes! All data is stored locally on your machine. The only external communication is with Claude API (HTTPS encrypted). No personal data is sent elsewhere.

### What are the system requirements?

- Node.js 18 or higher
- npm or yarn
- ~50MB disk space
- Internet connection (for Claude API)
- Anthropic API key

### How do I get an API key?

1. Go to [console.anthropic.com](https://console.anthropic.com)
2. Sign up for free
3. Create an API key
4. Add to `.env` file

### Can I use it on Mac/Linux/Windows?

Yes! Dating Assistant works on all platforms:
- macOS
- Linux
- Windows (with WSL or native Node.js)

## Installation & Setup

### How do I install Dating Assistant?

```bash
git clone https://github.com/sreme19/Dating-Assistant.git
cd "Dating Assistant"
npm install
cp .env.example .env
# Add API key to .env
npm run build
npm start
```

See [Installation & Setup](Installation-&-Setup) for detailed instructions.

### What if npm install fails?

Try these steps:
1. Clear cache: `npm cache clean --force`
2. Delete node_modules: `rm -rf node_modules`
3. Try again: `npm install`

See [Troubleshooting](Troubleshooting) for more solutions.

### Where is my database stored?

Default: `~/.dating-assistant/data.db`

To use custom location, set in `.env`:
```bash
DB_PATH=/path/to/custom/database.db
```

### Can I backup my data?

Yes! Your database is a regular SQLite file:
```bash
cp ~/.dating-assistant/data.db ~/backup/data.db
```

## Usage Questions

### How do I start the application?

```bash
npm start
```

Then select your mode (AI Bestie or AI Wingman).

### What's the difference between AI Bestie and AI Wingman?

- **AI Bestie**: For female users
  - Interview matches
  - Build preferences KB
  - Track interview history

- **AI Wingman**: For male users
  - Get dating advice
  - Maintain conversation context
  - Build dating skills

### How many turns can I have per session?

Maximum 50 turns per session. Sessions auto-complete at the limit.

### Can I pause and resume sessions?

Yes! Sessions are automatically saved. You can pause anytime and resume later.

### How many custom prompts can I create?

Maximum 20 custom prompts per user.

### Can I delete sessions?

Yes! From "View Previous Sessions", you can delete any session.

### Can I export my data?

Currently, data is stored in SQLite. You can:
1. Access database directly with SQLite tools
2. Export to CSV using SQLite commands
3. Backup entire database file

## AI & API Questions

### How does AI Bestie work?

1. You provide match information
2. AI Bestie generates interview questions
3. You provide match responses
4. AI Bestie analyzes and provides insights

### How does AI Wingman work?

1. You ask a dating question
2. AI Wingman provides strategic advice
3. You can ask follow-up questions
4. Conversation context is maintained

### What AI model is used?

Claude 3 (Anthropic's latest model). The specific version is configured in the code.

### How long does a response take?

Typically 5-15 seconds. Maximum timeout is 30 seconds.

### What if I run out of API credits?

You'll get an error message. You can:
1. Wait for monthly credit reset
2. Purchase additional credits
3. Check usage at [console.anthropic.com](https://console.anthropic.com)

### Can I use a different AI model?

Currently, only Claude is supported. Future versions may support other models.

## Data & Privacy Questions

### Is my data encrypted?

Data is stored locally in SQLite (not encrypted by default). For encryption, you can:
1. Encrypt the database file
2. Use encrypted storage
3. Use full-disk encryption

### Can I share my database?

Yes, but be careful! The database contains:
- Your preferences
- Interview history
- Custom prompts
- All conversation data

Only share with trusted people.

### How do I delete all my data?

```bash
rm ~/.dating-assistant/data.db
```

This deletes the entire database. You can also delete specific sessions from the app.

### Is my API key stored securely?

Your API key is stored in `.env` file (not committed to git). Best practices:
- Never commit `.env` to version control
- Never share your API key
- Use environment variables in production

### What data is sent to Claude API?

Only the conversation content needed to generate responses:
- Your questions/input
- Conversation history
- Match information (if relevant)
- Custom prompts

No personal data beyond what you provide.

## Performance Questions

### Why is the app slow?

Possible causes:
- Slow internet connection
- Large database
- System resources low
- API rate limiting

See [Performance Tuning](Performance-Tuning) for optimization tips.

### How can I speed up the app?

1. Check internet connection
2. Close other applications
3. Restart the app
4. Delete old sessions if database is large
5. Check API status

### How much disk space does it use?

- Application: ~50MB
- Database: Grows with usage (typically <10MB)
- Total: Usually <100MB

## Troubleshooting Questions

### The app crashes on startup

Try these steps:
1. Delete database: `rm ~/.dating-assistant/data.db`
2. Restart application
3. Check Node.js version: `node --version`

See [Troubleshooting](Troubleshooting) for more solutions.

### I can't connect to the API

Check:
1. Internet connection
2. API key is valid
3. API status at [console.anthropic.com](https://console.anthropic.com)
4. Firewall isn't blocking connection

### My session won't save

Try:
1. Check disk space
2. Verify database permissions
3. Restart application
4. Check database file exists

### Tests are failing

Try:
1. Ensure dependencies installed: `npm install`
2. Clear build: `rm -rf dist/`
3. Rebuild: `npm run build`
4. Run tests: `npm run test:run`

## Development Questions

### Can I contribute?

Yes! See [Contributing Guide](Contributing-Guide) for details.

### How do I run tests?

```bash
npm run test:run      # Run once
npm test              # Watch mode
npm test -- file.ts   # Specific file
```

### How do I build the project?

```bash
npm run build
```

Output goes to `dist/` directory.

### How do I run in development mode?

```bash
npm run dev
```

This uses ts-node for faster development.

### What's the code structure?

```
src/
├── cli/          # CLI interface
├── engine/       # Conversation engine
├── database/     # Database operations
├── api/          # Claude API client
├── config/       # Configuration
├── models/       # TypeScript types
└── utils/        # Utilities
```

See [Architecture Overview](Architecture-Overview) for details.

## Feature Questions

### Will there be a web interface?

Yes, it's planned for a future version.

### Will there be multi-user support?

Yes, it's planned for a future version.

### Can I use it on mobile?

Not currently. Mobile app is planned for future.

### Can I export conversations?

Not currently, but it's planned for a future version.

### Can I use different AI models?

Not currently. Only Claude is supported.

## License & Legal Questions

### What license is this under?

MIT License. See [LICENSE](../LICENSE) for details.

### Can I use this commercially?

Yes, the MIT License allows commercial use.

### Can I modify the code?

Yes, the MIT License allows modifications.

### Do I need to credit the project?

Not required by license, but appreciated!

## Still Have Questions?

- 📖 Check [Troubleshooting](Troubleshooting) guide
- 🐛 Search [GitHub Issues](https://github.com/sreme19/Dating-Assistant/issues)
- 💬 Ask on [GitHub Discussions](https://github.com/sreme19/Dating-Assistant/discussions)
- 📚 Read [Architecture Overview](Architecture-Overview)

---

**Last Updated**: May 19, 2026
**Version**: 1.0.0
