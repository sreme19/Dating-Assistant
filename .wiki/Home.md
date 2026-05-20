# Dating Assistant Wiki

**Dating Assistant** is a private, local AI dating coach that runs on your computer. Conversations, profiles, preferences, transcripts, and photo assets stay on your machine. The app only calls the Anthropic API when it needs an AI response.

There are two main modes:

| Mode | Who it's for | What it does |
|---|---|---|
| **AI Bestie** | Women | Builds preference profiles, interviews matches, evaluates compatibility, and saves transcripts |
| **AI Wingman** | Men | Gives dating advice using saved profile and personality context |

## Where To Start

- **First time here?** [Installation & Setup](Installation-and-Setup)
- **Already installed?** [Quick Start](Quick-Start)
- **Want the newest feature overview?** [Latest Features](Latest-Features)
- **Female user?** [AI Bestie Guide](AI-Bestie-Guide)
- **Male user?** [AI Wingman Guide](AI-Wingman-Guide)
- **Want to understand saved files?** [Your Profile Folders](Your-Profile-Folders)
- **Something not working?** [Troubleshooting](Troubleshooting)
- **Questions?** [FAQ](FAQ)

## Latest Highlights

- 43 archetype profile folders across the repository
- 22 female profiles in `female_profiles/`
- 21 male profiles in `male_profiles/`
- Female preference files in `female_profiles/<profile>/preferences.md`
- Male personality summaries in `male_profiles/<profile>/personality.md`
- Interview transcripts saved inside profile folders when available
- Optional `photos/` folders populated through Unsplash or Replicate workflows
- AI Bestie can answer match questions from the woman's saved preferences
- AI Wingman can ground advice in the selected male profile's saved personality context

## How Data Is Stored

Everything is local. No account, no cloud storage, no app server.

| What | Where |
|---|---|
| API key | `~/.dating-assistant/config.json` |
| App database | `~/.dating-assistant/data.db` |
| Female profiles and preferences | `Dating Assistant/female_profiles/` |
| Male profiles and personality summaries | `Dating Assistant/male_profiles/` |
| Interview transcripts | Inside profile `interviews/` folders |
| Profile photos | Inside profile `photos/` folders |

## Quick Setup

```bash
git clone https://github.com/sreme19/Dating-Assistant.git
cd "Dating Assistant"
npm install
npm run build
npm start
```

## Project Status

- TypeScript CLI application
- SQLite local persistence
- Anthropic Claude API integration
- 173 passing tests with 1 skipped optional test
- MIT licensed

## Community

- [GitHub Repository](https://github.com/sreme19/Dating-Assistant)
- [Issues](https://github.com/sreme19/Dating-Assistant/issues)
- [Discussions](https://github.com/sreme19/Dating-Assistant/discussions)

---

**Last Updated**: May 21, 2026
