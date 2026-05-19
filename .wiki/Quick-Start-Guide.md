# Quick Start Guide

Get up and running with Dating Assistant in 5 minutes!

## Installation (2 minutes)

```bash
# 1. Clone repository
git clone https://github.com/sreme19/Dating-Assistant.git
cd "Dating Assistant"

# 2. Install dependencies
npm install

# 3. Configure
cp .env.example .env
# Edit .env and add your ANTHROPIC_API_KEY

# 4. Build and run
npm run build
npm start
```

## First Run

When you start the application, you'll see:

```
╔════════════════════════════════════════╗
║     Welcome to Dating Assistant        ║
║                                        ║
║  Choose your mode:                     ║
║  1. Female User (AI Bestie)            ║
║  2. Male User (AI Wingman)             ║
╚════════════════════════════════════════╝
```

## AI Bestie Mode (Female Users)

### Interview a Match

1. Select "Interview a Match"
2. Enter match information:
   - Name
   - Age
   - Occupation
   - Interests
3. AI Bestie generates interview questions
4. Provide match responses
5. Get analysis and insights

**Example:**
```
Match Name: John
Age: 28
Occupation: Software Engineer
Interests: Hiking, Photography

AI Bestie: "Based on John's profile, I'd like to ask:
What are your long-term career goals?"

You: "I want to start my own tech company"

AI Bestie: "That's ambitious! How do you balance
work-life balance with that goal?"
```

### Gather Preferences

1. Select "Gather My Preferences"
2. Answer questions about your dating goals
3. AI Bestie asks progressive follow-up questions
4. Your preferences are saved automatically

**Example:**
```
AI Bestie: "What are your top 3 qualities in a partner?"

You: "Ambition, kindness, and humor"

AI Bestie: "Great! Tell me more about what
'ambition' means to you..."
```

### View Sessions

1. Select "View Previous Sessions"
2. See all past interviews and preference sessions
3. Resume any paused session
4. View session summaries

## AI Wingman Mode (Male Users)

### Get Dating Advice

1. Select "Get Dating Advice"
2. Ask your dating question or describe a scenario
3. AI Wingman provides strategic advice
4. Continue conversation for follow-up questions

**Example:**
```
You: "How do I approach someone I'm interested in?"

AI Wingman: "Great question! Here's my strategic approach:
1. Make genuine eye contact
2. Start with a genuine compliment
3. Ask an open-ended question..."

You: "What if they seem uninterested?"

AI Wingman: "Good question. Here's how to read signals..."
```

### View Sessions

1. Select "View Previous Sessions"
2. See all past advice sessions
3. Resume any paused session
4. Review advice history

## Common Tasks

### Create Custom Prompt

1. From main menu, select "Manage Custom Prompts"
2. Choose "Create New Prompt"
3. Enter prompt name and content
4. Prompt is applied to all future conversations

**Example:**
```
Name: "Focus on red flags"
Content: "Pay special attention to any red flags
in the match's responses and highlight them."
```

### Resume a Session

1. From main menu, select "View Previous Sessions"
2. Choose session to resume
3. Conversation continues from where it left off
4. Turn count continues from previous session

### Check Session Limits

- **Maximum turns per session**: 50
- **Maximum custom prompts**: 20 per user
- **Session timeout**: None (save anytime)

## Tips & Tricks

### AI Bestie Mode
- Be specific about match details for better questions
- Your preferences are used to evaluate matches
- Build preferences first for better interviews
- Review red flags identified by AI Bestie

### AI Wingman Mode
- Provide context for better advice
- Ask follow-up questions for deeper insights
- Save sessions to review advice later
- Create custom prompts for specific scenarios

### General
- Sessions auto-save after each turn
- You can pause and resume anytime
- Custom prompts apply to all future conversations
- Database is stored locally on your machine

## Keyboard Shortcuts

- `Ctrl+C`: Exit current session
- `Ctrl+D`: Exit application
- Arrow keys: Navigate menus
- Enter: Select option

## Troubleshooting

### "API timeout"
- Check internet connection
- Verify API key is valid
- Try again (automatic retry included)

### "Database error"
- Delete database: `rm ~/.dating-assistant/data.db`
- Restart application

### "No response from AI"
- Check API key is set
- Verify internet connection
- Check API status at [console.anthropic.com](https://console.anthropic.com)

## Next Steps

- Read [AI Bestie Mode Guide](AI-Bestie-Mode-Guide) for detailed features
- Read [AI Wingman Mode Guide](AI-Wingman-Mode-Guide) for detailed features
- Check [Custom Prompts](Custom-Prompts) for advanced customization
- See [Troubleshooting](Troubleshooting) for common issues

## Need Help?

- 📖 [FAQ](FAQ) - Common questions
- 🐛 [GitHub Issues](https://github.com/sreme19/Dating-Assistant/issues) - Report bugs
- 💬 [GitHub Discussions](https://github.com/sreme19/Dating-Assistant/discussions) - Ask questions
- 📚 [Troubleshooting](Troubleshooting) - Common problems

---

**Last Updated**: May 19, 2026
**Version**: 1.0.0
