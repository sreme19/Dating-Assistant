# Troubleshooting

---

## App won't start

### "Cannot find module" or "command not found"

You haven't built the app yet, or the build is out of date.

```bash
cd "Dating Assistant"
npm install
npm run build
npm start
```

### "ANTHROPIC_API_KEY not found" or similar key error

The API key config file may be missing or corrupted. Delete it and re-launch — the app will ask you to enter it again:

```bash
rm ~/.dating-assistant/config.json
npm start
```

### "Database error" on startup

The database file may be corrupted. Delete it — it will be recreated automatically (you will lose session history, but profile folders are untouched):

```bash
rm ~/.dating-assistant/data.db
npm start
```

---

## Typing issues

### Text jumps around or characters appear in the wrong place

This was a known bug in older versions (caused by the inquirer library). Make sure you're on the latest version:

```bash
git pull
npm run build
npm start
```

If the issue persists, try making your terminal window wider — text wrapping across narrow windows can still cause minor cursor issues.

---

## AI responses

### The app says "Generating..." but nothing comes back

This usually means an API timeout. The app retries automatically up to 3 times. If all retries fail, you'll see an error message. Check:
- You're connected to the internet
- Your Anthropic account has credits ([console.anthropic.com](https://console.anthropic.com))

### The AI is asking me about myself instead of interviewing the man

This was a bug in earlier versions. Make sure you've run `npm run build` after the latest `git pull`. The interview mode was fixed to auto-generate the first question from the man's profile — you shouldn't need to type anything to kick it off.

### The AI is giving a long summary instead of just the next question

Same as above — rebuild after updating:
```bash
git pull
npm run build
npm start
```

### The AI response has markdown symbols (`**bold**`, `##headers`) showing as plain text

This is normal — the terminal doesn't render markdown formatting visually. The content is still correct. If you want to read it formatted, copy the interview transcript from your profile folder and open it in a markdown viewer (Notion, VS Code, GitHub).

---

## Profiles

### "No profiles found" when trying to interview

You need to create a female preference profile first before running an interview. Go to:

`AI Bestie → Gather My Preferences` → create your profile → then try Interview a Match again.

### My profile isn't showing in the list

Check that the folder exists and contains a valid `profile.json`:

```bash
ls "Dating Assistant/profiles/"
cat "Dating Assistant/profiles/yourname_id/profile.json"
```

If the file is missing or unreadable, the profile won't appear in the list. You'll need to create a new one.

### personality.md wasn't created after an interview

This requires a successful API call at the end of the interview. If the call failed (API error, no internet), the profile folder will exist but `personality.md` won't be there. The Wingman will still work — it'll just give generic advice rather than profile-specific advice.

To generate it manually: there's no automated retry yet. You can interview the same person again and save the profile at the end of that session.

---

## Getting more help

- Check the [FAQ](FAQ)
- Open an issue at [github.com/sreme19/Dating-Assistant/issues](https://github.com/sreme19/Dating-Assistant/issues)
