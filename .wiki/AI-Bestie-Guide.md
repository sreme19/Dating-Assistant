# AI Bestie Guide — Female Users

AI Bestie helps women build a preference profile and interview matches one question at a time. It evaluates answers against the woman's saved preferences instead of giving generic dating advice.

## What AI Bestie Does

### Gather My Preferences

This flow builds a personal preference profile.

The app saves the result to:

```text
female_profiles/<profile>/preferences.md
```

That file becomes the context AI Bestie uses in future match interviews.

### Interview a Match

This flow evaluates a specific man.

AI Bestie can:

- show existing male profiles before collecting new match details
- generate tailored questions from the selected woman's preferences
- read each answer and return green, yellow, or red compatibility signals
- suggest the next question to ask
- save interview transcripts inside profile folders
- create or update a male profile with a `personality.md` summary

## Profile Library

The current project includes 22 female archetype profiles in `female_profiles/`.

Each female profile can include:

- `profile.json`
- `preferences.md`
- `interviews/`
- `photos/`

See [Latest Features](Latest-Features) for the full profile-library overview.

## Setting Up Your Preference Profile

1. Select `Female User (AI Bestie)`.
2. Choose `Gather My Preferences`.
3. Enter your name and age, or select an existing profile.
4. Answer the preference questions honestly and specifically.
5. Type `done` when you have covered enough.
6. Review or edit `female_profiles/<profile>/preferences.md` later if your preferences change.

## Interviewing A Match

1. Select `Interview a Match`.
2. Pick the female profile whose preferences should guide the interview.
3. Select an existing male profile or enter match details.
4. AI Bestie generates the first question.
5. Paste the match's answer.
6. Review the flag, read, and next suggested question.
7. Type `exit` when done.
8. Save the profile/transcript if prompted.

Each response usually includes:

- **Green signal**: aligned with the selected preferences
- **Yellow signal**: worth clarifying
- **Red signal**: conflicts with a stated preference or boundary
- **Read**: what the answer suggests
- **Ask him**: the next question

## Answering Match Questions

AI Bestie can also help when a match asks the woman a question. It uses the saved female preference file so the answer stays aligned with her values, boundaries, and dating goals.

Use this for:

- preparing concise responses
- checking whether a match's question style feels compatible
- avoiding generic answers

## Tips

- Be specific in `preferences.md`; vague preferences create vague questions.
- Paste the match's actual words when possible.
- Ask one question at a time.
- Keep preference files updated as your standards or deal-breakers change.
- Review transcripts later from the profile folder.
