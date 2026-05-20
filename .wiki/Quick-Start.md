# Quick Start

## Install And Run

```bash
git clone https://github.com/sreme19/Dating-Assistant.git
cd "Dating Assistant"
npm install
npm run build
npm start
```

On first launch, enter your Anthropic API key. The app saves it locally at `~/.dating-assistant/config.json`.

## Choose A Mode

### AI Bestie

Use this when you want to:

- create or select a female profile
- gather dating preferences
- interview a match
- evaluate answers against saved preferences
- save transcripts and optional male personality summaries

Female profiles live in `female_profiles/`.

### AI Wingman

Use this when you want to:

- create or select a male profile
- get direct dating advice
- use saved `personality.md` context when available
- continue advice sessions across multiple turns

Male profiles live in `male_profiles/`.

## Current Profile Library

The app currently includes:

- 22 female archetype profiles
- 21 male archetype profiles
- optional photos in profile `photos/` folders
- saved transcripts in profile `interviews/` folders when available

See [Latest Features](Latest-Features) for the newest feature overview.

## Common Commands

```bash
npm run build
npm start
npm run dev
npm run test:run
```

## Next Pages

- [AI Bestie Guide](AI-Bestie-Guide)
- [AI Wingman Guide](AI-Wingman-Guide)
- [Your Profile Folders](Your-Profile-Folders)
- [Troubleshooting](Troubleshooting)
