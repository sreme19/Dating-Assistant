# Latest Feature Documentation

Reviewed on 2026-05-21.

This document summarizes the latest project updates in the current repository state and the feature behavior users can expect after pulling the newest GitHub version.

## Executive Summary

Dating Assistant is now a local-first CLI dating coach with two opinionated user paths:

- **AI Bestie** for women who want preference discovery, match interviews, compatibility reads, and saved interview notes.
- **AI Wingman** for men who want advice grounded in their saved personality notes and prior interview context.

The newest updates expand the project beyond the original database-backed CLI engine by adding a large archetype-based profile library, renamed profile folders, interview transcript persistence, male personality summaries, and a batch photo workflow for making profile folders more visual.

## Latest Updates Reviewed

### Archetype Profile Library

The repository now includes **43 profile folders**:

- **22 female profiles** in `female_profiles/`
- **21 male profiles** in `male_profiles/`

Each profile folder is named with a readable persona/archetype slug and a stable suffix, for example:

- `female_profiles/jade_Sugar_Baby_s3k9fp/`
- `female_profiles/anjali_Traditional_Family_First_g3s7mn/`
- `male_profiles/kai_ENM_Polyamorous_w8m3ns/`
- `male_profiles/victor_Sugar_Daddy_e6p4rl/`

This naming makes browsing, pairing, and debugging easier than generic profile IDs.

### Female Profile Content

Female profile folders generally contain:

- `profile.json`: structured identity and archetype metadata.
- `preferences.md`: narrative preferences, boundaries, compatibility signals, and screening logic.
- `interviews/`: saved interview transcripts when present.
- `photos/`: downloaded or generated visual references when present.

Recent female archetypes include:

- Traditional family-first
- Modern family-first professional
- NRI / diaspora-bridging
- High-value feminist
- Ambitious professional / corporate
- Therapy-speak over-sharer
- Recently divorced
- Older dater under time pressure
- Outdoorsy / adventure seeker
- Artist / creative idealist
- Soft life seeker
- Spiritually awakened
- Serial dater
- Everygirl
- Tech founder
- Ethical non-monogamy / polyamory
- Monogamish
- Swinger / couples-play oriented
- BDSM / kink-oriented
- Sugar baby / arrangement seeker

### Male Profile Content

Male profile folders generally contain:

- `profile.json`: structured identity and archetype metadata.
- `personality.md`: AI-readable personality summary used by Wingman mode.
- `interviews/`: saved interview notes when present.
- `photos/`: downloaded or generated visual references when present.

Recent male archetypes include:

- Progressive-traditional
- Family-pressure registrant
- Emotionally unavailable / avoidant
- Emotionally immature
- Conflict avoidant
- Golden retriever / friendly persona
- Nice guy / overextended
- Serial monogamist
- Serial dater
- Perpetually busy
- Ambitious tech / founder types
- Self-made ambitious
- Finance / corporate
- Young student
- Ethical non-monogamy / polyamory
- Monogamish
- Swinger / couples-play oriented
- BDSM / dominant
- Sugar daddy / generous benefactor

## User-Facing Features

### AI Bestie Preference Gathering

AI Bestie can run a guided preference interview for a female user. The output is saved as a profile folder and preference document that later becomes context for match interviews.

Key behavior:

- Asks progressive questions instead of collecting everything upfront.
- Saves preference context locally.
- Builds a reusable dating preference knowledge base.
- Keeps the app local-first, with only Anthropic API calls leaving the machine.

### AI Bestie Match Interview

AI Bestie can interview a potential match one question at a time.

Key behavior:

- Lets the user pick an existing female profile.
- Shows existing male profiles before collecting new match details.
- Generates tailored questions using the woman’s `preferences.md`.
- Accepts the match’s answer and returns compatibility signals:
  - positive indicators
  - cautions
  - red flags
- Saves interview transcripts under the relevant female profile.
- Can create or update male profile/personality records from the interview.

### Match-Question Answering

The interview flow can now support the match asking the woman questions too. AI Bestie answers from the female profile’s preferences, helping simulate or prepare a two-way dating conversation.

This is useful for:

- Testing whether a match’s question style feels compatible.
- Preparing concise answers that stay consistent with the woman’s boundaries.
- Keeping the assistant anchored in the saved preference profile instead of generic dating advice.

### AI Wingman Advice

AI Wingman gives male users direct dating guidance using saved male profile context.

Key behavior:

- Selects or creates a male profile.
- Loads `personality.md` when available.
- Gives advice based on how the user appears in prior interviews, not only what they ask in the moment.
- Uses the shared conversation engine and local database persistence.

## Photo Workflow

The `scripts/download-photos.mjs` script supports batch profile photo population from:

- Unsplash search
- Replicate image generation

Usage:

```bash
node scripts/download-photos.mjs --unsplash
node scripts/download-photos.mjs --replicate
```

API keys are stored locally in `~/.dating-assistant/config.json` after first use.

Latest script improvements:

- Uses portrait-focused search terms for supported archetypes.
- Supports both HTTP and HTTPS JSON requests without CommonJS `require`.
- Detects Replicate API error payloads before polling.
- Validates Replicate polling URLs before making follow-up requests.
- Creates profile `photos/` directories automatically.
- Resolves archetype search terms from stable profile IDs, so keys like `jade_Sugar_Baby` correctly match folders like `jade_Sugar_Baby_s3k9fp`.

## Data Layout

Current important paths:

| Data | Path |
|---|---|
| Female profiles | `female_profiles/` |
| Female preferences | `female_profiles/<profile>/preferences.md` |
| Female-led interview transcripts | `female_profiles/<profile>/interviews/` |
| Male profiles | `male_profiles/` |
| Male personality summaries | `male_profiles/<profile>/personality.md` |
| Male-side interview notes | `male_profiles/<profile>/interviews/` |
| Profile photos | `female_profiles/<profile>/photos/`, `male_profiles/<profile>/photos/` |
| Local API config | `~/.dating-assistant/config.json` |
| Local SQLite database | `~/.dating-assistant/data.db` |

## Developer Features

### TypeScript CLI Architecture

The implementation remains organized around:

- `src/cli/`: interactive modes and menus.
- `src/engine/`: conversation orchestration and prompt construction.
- `src/api/`: Anthropic API client.
- `src/database/`: SQLite persistence and domain managers.
- `src/models/`: shared TypeScript types.
- `src/utils/`: validation helpers.

### Persistence

The app persists:

- users
- sessions
- conversation turns
- custom prompts
- match profiles
- knowledge bases
- profile files and transcripts

The SQLite layer uses validation, foreign keys, and manager classes so CLI flows do not manipulate raw database state directly.

### Testing

The documented baseline is:

- 173 tests
- database, validation, conversation engine, match profile, custom prompt, and knowledge base coverage
- `npm run test:run` for one-shot verification
- `npm run build` for TypeScript compilation

## Review Notes

The latest review found and addressed a photo-script issue where archetype search terms were not being selected for most profiles because lookup used display name plus the first archetype word. The script now resolves search terms from `profile.id`.

Remaining data-quality notes:

- Some profile folders have fewer than five photos.
- Some photo filenames do not match the containing persona, which suggests earlier downloads may have reused or mismatched assets.
- `.DS_Store` files exist locally but are ignored by `.gitignore` and should not be committed.
- Empty `photos/` directories are not tracked by Git unless a placeholder file is added.

## Recommended Next Steps

- Re-run the photo script after confirming the preferred source, then manually review photo/persona fit.
- Add a lightweight validation script for profile schema, missing archetypes, missing preferences/personality files, and photo coverage.
- Consider adding a `PROFILE_LIBRARY.md` index if the archetype library continues growing.
- Add tests or a dry-run mode for `scripts/download-photos.mjs`.
