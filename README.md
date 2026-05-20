# Dating Assistant

A local CLI-based AI dating coach. Runs entirely on your computer — no server, no account, no cloud storage.

Two modes:
- **AI Bestie** (female users) — build a preference profile, then interview men one question at a time
- **AI Wingman** (male users) — get direct, personalised dating advice based on how you actually come across

📖 **Full documentation:** [github.com/sreme19/Dating-Assistant/wiki](https://github.com/sreme19/Dating-Assistant/wiki)

🆕 **Latest feature notes:** see [LATEST_FEATURES.md](LATEST_FEATURES.md)

---

## Quick setup

### 1. Install Node.js
Download from [nodejs.org](https://nodejs.org/) (LTS version). Verify with `node --version` — needs to be v18 or higher.

### 2. Clone and install
```bash
git clone https://github.com/sreme19/Dating-Assistant.git
cd "Dating Assistant"
npm install
npm run build
```

### 3. Get an Anthropic API key
Free account at [console.anthropic.com](https://console.anthropic.com) → API Keys → Create Key.

### 4. Run
```bash
npm start
```

On first launch the app asks for your API key once, saves it locally, and never asks again.

---

## How it works

### AI Bestie (female users)

**Gather Preferences** — creates your personal profile folder and runs a conversation to understand what you're looking for. Saved to `female_profiles/yourname_id/preferences.md`.

**Interview a Match** — pick your profile, enter the man's details, and AI Bestie generates one tailored question at a time. You paste in his answers; it gives you a compatibility read (✅ / ⚠️ / 🚩) and the next question. At the end, you can save a male profile with an AI-written personality summary.

### AI Wingman (male users)

Select your profile (or create one). If you've been interviewed through this app before, your `personality.md` is loaded as context — advice is based on how you actually came across, not generic tips. Ask about any situation and get specific, actionable guidance.

---

## Where your data lives

| What | Where |
|---|---|
| API key | `~/.dating-assistant/config.json` |
| Database | `~/.dating-assistant/data.db` |
| Female profiles + preferences | `Dating Assistant/female_profiles/` |
| Male profiles + personality | `Dating Assistant/male_profiles/` |
| Interview transcripts | Inside each female profile folder |

Current profile library:
- 22 female archetype profiles
- 21 male archetype profiles
- Optional `photos/` folders for profile visuals

You can drop images, PDFs, or notes into any profile folder — the app won't touch them.

---

## Project structure

```
src/
├── api/              ClaudeClient.ts — Anthropic API integration
├── cli/              CLIManager, BestieInterviewMode, BestiePreferenceMode, WingmanAdviceMode
├── config/           ConfigLoader.ts — API key + settings
├── database/         SQLite managers for sessions, profiles, knowledge bases
├── engine/           ConversationEngine.ts — prompt building + session logic
├── models/           TypeScript types
└── index.ts          Entry point
```

---

## Development commands

```bash
npm run build       # compile TypeScript
npm start           # run the app
npm run dev         # run without compiling (ts-node)
npm run test:run    # run all tests once
npm test            # run tests in watch mode
npm run lint        # lint
```

173 tests, all passing.

---

## Privacy

All data is stored locally. The only external call is to the Anthropic API to generate responses (same as any AI chat tool). Nothing is stored by Anthropic beyond standard API logs.

---

## License

MIT
