# Installation And Setup

## Requirements

- Node.js 18 or newer
- npm
- Git
- Anthropic API key
- Internet access for AI responses

## Install

```bash
git clone https://github.com/sreme19/Dating-Assistant.git
cd "Dating Assistant"
npm install
npm run build
npm start
```

## API Key

On first launch, the app asks for your Anthropic API key and saves it locally:

```text
~/.dating-assistant/config.json
```

You do not need to enter it every time.

## Verify The App

```bash
npm run build
npm run test:run
```

Expected test baseline:

- 173 passing tests
- 1 skipped optional test

## Verify Profile Folders

The current app uses:

```bash
ls female_profiles
ls male_profiles
```

Expected layout:

- female preferences in `female_profiles/<profile>/preferences.md`
- male personality summaries in `male_profiles/<profile>/personality.md`
- optional photos in profile `photos/` folders
- optional transcripts in profile `interviews/` folders

## Local Data

| Data | Location |
|---|---|
| API config | `~/.dating-assistant/config.json` |
| SQLite database | `~/.dating-assistant/data.db` |
| Female profiles | `female_profiles/` |
| Male profiles | `male_profiles/` |

## Next

- [Quick Start](Quick-Start)
- [Latest Features](Latest-Features)
- [AI Bestie Guide](AI-Bestie-Guide)
- [AI Wingman Guide](AI-Wingman-Guide)
