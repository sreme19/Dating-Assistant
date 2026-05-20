# Latest Features

Reviewed on 2026-05-21.

This page documents the latest Dating Assistant features now reflected in the GitHub Wiki.

## What's New

Dating Assistant now includes a larger archetype-based profile library, clearer profile folder naming, interview transcript persistence, male personality summaries, and an optional profile-photo workflow.

Current repository state:

- 43 total archetype profile folders
- 22 female profiles in `female_profiles/`
- 21 male profiles in `male_profiles/`
- saved preference files for female profiles
- saved personality summaries for male profiles
- interview transcripts inside profile folders when available
- optional `photos/` folders for visual profile references

## Profile Library

Profile folders are named with readable persona and archetype slugs, for example:

- `female_profiles/jade_Sugar_Baby_s3k9fp/`
- `female_profiles/anjali_Traditional_Family_First_g3s7mn/`
- `male_profiles/kai_ENM_Polyamorous_w8m3ns/`
- `male_profiles/victor_Sugar_Daddy_e6p4rl/`

This makes it easier to browse profiles directly in GitHub, pair interviews with personas, and debug saved data.

## Female Profiles

Female profile folders usually include:

- `profile.json` for structured identity and archetype metadata
- `preferences.md` for dating preferences, boundaries, compatibility signals, and screening logic
- `interviews/` for saved interview transcripts
- `photos/` for optional profile visuals

Recent archetypes include traditional family-first, modern family-first professional, NRI / diaspora-bridging, high-value feminist, therapy-speak over-sharer, recently divorced, older dater under time pressure, outdoorsy adventure seeker, artist / creative idealist, soft life seeker, spiritually awakened, serial dater, tech founder, ENM / polyamorous, monogamish, swinger, BDSM / kink-oriented, and sugar baby / arrangement seeker personas.

## Male Profiles

Male profile folders usually include:

- `profile.json` for structured identity and archetype metadata
- `personality.md` for the AI-readable personality summary used by Wingman mode
- `interviews/` for saved interview notes
- `photos/` for optional profile visuals

Recent archetypes include progressive-traditional, family-pressure registrant, emotionally unavailable / avoidant, conflict avoidant, serial monogamist, perpetually busy, ambitious founder types, self-made ambitious, finance / corporate, young student, ENM / polyamorous, monogamish, swinger, BDSM / dominant, and sugar daddy / generous benefactor personas.

## AI Bestie Updates

AI Bestie now has richer saved context to work from:

- Female users can build a preference profile in `female_profiles/<profile>/preferences.md`.
- Interview mode can use that saved preference file to generate tailored questions.
- The app shows existing male profiles before collecting new match details.
- Interview transcripts can be saved under the relevant female profile.
- Male profiles can be created or updated with AI-written personality summaries.
- AI Bestie can answer a match's questions using the woman's saved preferences, helping prepare two-way dating conversations.

## AI Wingman Updates

AI Wingman now benefits from the male profile library:

- Male users can select or create a male profile.
- If `personality.md` exists, Wingman uses it as context.
- Advice can reflect how the user came across in prior interviews, not just the current question.
- Sessions remain locally persisted through the same database-backed conversation engine.

## Photo Workflow

The project includes a batch photo script:

```bash
node scripts/download-photos.mjs --unsplash
node scripts/download-photos.mjs --replicate
```

API keys are saved locally in `~/.dating-assistant/config.json`.

Recent script improvements:

- portrait-focused search terms for supported archetypes
- archetype search-term lookup from stable profile IDs
- automatic `photos/` directory creation
- HTTP and HTTPS download support
- Replicate API error handling before polling
- Replicate polling URL validation

## Data Layout

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

## Review Notes

The latest review fixed a photo-script lookup issue where most archetype profiles could fall back to generic name-only searches instead of archetype-specific portrait searches.

Known follow-ups:

- Some profile folders still have fewer than five photos.
- Some existing photo filenames do not match the containing persona, so photo/persona fit should be manually reviewed.
- Empty `photos/` directories are not tracked by Git unless a placeholder file is added.
- A profile validation script would help check missing preferences, missing personality summaries, and photo coverage.
