import Anthropic from '@anthropic-ai/sdk';
import { readFileSync, writeFileSync, mkdirSync, existsSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const PROJECT_ROOT = join(__dirname, '..');
const MALE_PROFILES_DIR = join(PROJECT_ROOT, 'male_profiles');

// Load API key from saved config
const configPath = join(process.env.HOME, '.dating-assistant', 'config.json');
const { anthropicApiKey } = JSON.parse(readFileSync(configPath, 'utf-8'));
const client = new Anthropic({ apiKey: anthropicApiKey });

const SYSTEM_PROMPT = `You are a dating analyst. Read an interview conversation and write a concise, honest personality profile of the man in markdown.

Structure it as:
# Personality Profile — {name}

## Who He Is
2-3 sentences capturing his overall vibe and character.

## What He's Looking For
Bullet points drawn directly from his answers.

## Green Flags
Bullet points — genuine positives surfaced in the interview.

## Yellow Flags
Bullet points — things worth watching or probing further.

## Red Flags
Bullet points — genuine concerns, or "None identified" if clean.

## Compatibility Pattern
1 paragraph on what type of woman he'd likely suit best, based on his answers.

Be honest, specific, and base everything on what was actually said — no filler.`;

async function synthesize(name, info, conversationLog) {
  const response = await client.messages.create({
    model: 'claude-sonnet-4-6',
    max_tokens: 1024,
    system: SYSTEM_PROMPT,
    messages: [{ role: 'user', content: `Name: ${name}\n${info}\n\nInterview log:\n${conversationLog}` }],
  });
  return response.content[0].text.trim();
}

function makeId(name) {
  const chars = 'abcdefghijklmnopqrstuvwxyz0123456789';
  const code = Array.from({ length: 6 }, () => chars[Math.floor(Math.random() * chars.length)]).join('');
  return `${name.toLowerCase().replace(/\s+/g, '_')}_${code}`;
}

const interviews = [
  {
    name: 'John',
    info: 'Age: 20\nOccupation: student\nInterests: partying',
    logPath: join(PROJECT_ROOT, 'profiles/jessica_e89f0f/interviews/john_2026-05-19/conversation.md'),
    interviewedBy: 'Jessica',
  },
  {
    name: 'Tim',
    info: 'Age: 30\nOccupation: VC\nInterests: traveling',
    logPath: join(PROJECT_ROOT, 'profiles/sarah_045db3/interviews/tim_2026-05-19/conversation.md'),
    interviewedBy: 'Sarah',
  },
];

for (const interview of interviews) {
  console.log(`\nProcessing ${interview.name}...`);

  const log = readFileSync(interview.logPath, 'utf-8');
  const id = makeId(interview.name);
  const profileDir = join(MALE_PROFILES_DIR, id);
  const interviewsDir = join(profileDir, 'interviews');
  mkdirSync(interviewsDir, { recursive: true });

  // profile.json
  const meta = {
    id,
    name: interview.name,
    info: interview.info,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };
  writeFileSync(join(profileDir, 'profile.json'), JSON.stringify(meta, null, 2));

  // copy interview log
  const copyName = `${interview.interviewedBy.toLowerCase()}_2026-05-19.md`;
  writeFileSync(join(interviewsDir, copyName), log);

  // synthesize personality
  console.log(`  Synthesizing personality.md via Claude...`);
  const personality = await synthesize(interview.name, interview.info, log);
  writeFileSync(join(profileDir, 'personality.md'), personality);

  console.log(`  ✅ Saved → male_profiles/${id}/`);
  console.log(`\n--- personality.md preview ---`);
  console.log(personality.split('\n').slice(0, 12).join('\n'));
  console.log('...\n');
}
