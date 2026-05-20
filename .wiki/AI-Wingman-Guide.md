# AI Wingman Guide — Male Users

AI Wingman is a direct dating coach for male users. It gives practical advice using the selected male profile, including `personality.md` when that file exists.

## What AI Wingman Does

AI Wingman can:

- answer dating questions
- help interpret conversations and dates
- suggest specific next messages or next steps
- call out patterns from prior interview context
- use saved personality summaries for more personal advice

## Profile Library

The current project includes 21 male archetype profiles in `male_profiles/`.

Each male profile can include:

- `profile.json`
- `personality.md`
- `interviews/`
- `photos/`

See [Latest Features](Latest-Features) for the full profile-library overview.

## Getting Started

1. Select `Male User (AI Wingman)`.
2. Select an existing profile or create a new one.
3. If the profile has `personality.md`, Wingman loads it as context.
4. Ask your question or describe your situation.
5. Ask follow-ups as the situation evolves.

## Why `personality.md` Matters

`personality.md` is an AI-written read of how a man came across during an interview.

When available, Wingman can use it to give advice based on observed patterns, such as:

- giving short answers to emotional questions
- over-explaining
- avoiding commitment topics
- coming across as too intense too quickly
- showing strong positives that should be leaned into

This makes the advice more specific than a generic AI chat.

## Example Use

```text
Your question or situation:
I've been talking to someone for two weeks. Things felt good, but now her replies are shorter. What should I do?
```

Wingman should respond with:

- a read of what may be happening
- what not to do
- a specific next action
- messaging guidance when useful
- any relevant pattern from the selected profile

## Tips

- Give concrete context: timeline, messages, tone, and what already happened.
- Do not clean up the awkward parts; Wingman is better with the real version.
- Read your own `personality.md` so you know what context Wingman is using.
- Follow up after trying the advice so Wingman can adjust.
