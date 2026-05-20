# FAQ

---

### Is my data private?

Yes. Everything stays on your computer. The only external call the app makes is to the Anthropic API to generate AI responses — it sends your conversation text to Anthropic's servers to get a reply, the same way any AI chat app works. No data is stored by Anthropic beyond the standard API usage logs.

---

### Do I need to enter my API key every time?

No. You enter it once on your first launch. It's saved to `~/.dating-assistant/config.json` on your computer. Every launch after that is automatic.

---

### How much does it cost to use?

The app itself is free. You pay for Anthropic API usage, which is very cheap for personal use — typically less than a dollar for many hours of use. New Anthropic accounts get free credits to start with.

---

### Can two women share the same app?

Yes. Each woman creates her own profile with her name and age, and gets her own folder. Their preferences and interviews are completely separate.

---

### Can I use the app for multiple men?

Yes. Each man gets his own profile folder. When entering Wingman mode, just pick the right profile from the list.

---

### What happens if a man was interviewed by two different women?

He'll have one profile folder, but the `interviews/` subfolder inside it will contain transcripts from both women. The `personality.md` is written after the most recent interview, so it reflects the latest picture.

---

### Can I edit my preferences file directly?

Yes. `preferences.md` is a plain text file — open it in any text editor (TextEdit, Notepad, VS Code, Notion). Changes you make there will be picked up next time an interview is run. Just keep the markdown formatting intact.

---

### The AI gave weird or off-topic advice. What happened?

This sometimes happens if:
- The question was too vague — try adding more context
- The session has been running a very long time — start a new session
- There was an API glitch — the app retries automatically, but occasionally a response lands wrong

If it keeps happening, type `exit`, restart the app, and start a new session.

---

### I'm getting an error about the API key

Make sure:
1. Your key starts with `sk-ant-`
2. You have credits remaining on your Anthropic account (check at [console.anthropic.com](https://console.anthropic.com))
3. You're connected to the internet

To reset the saved key, delete the config file and re-launch:
```bash
rm ~/.dating-assistant/config.json
npm start
```

---

### How do I start over completely?

```bash
rm ~/.dating-assistant/config.json
rm ~/.dating-assistant/data.db
rm -rf "Dating Assistant/profiles"
rm -rf "Dating Assistant/male_profiles"
```

Then run `npm start` and you'll be starting fresh.

---

### Can I run this on Windows?

Yes, but it's been primarily tested on Mac. If you run into issues on Windows, check that:
- You're using PowerShell or Git Bash, not the old `cmd`
- Node.js is properly installed and in your PATH
- File paths with spaces are quoted correctly

---

### Does it work without internet?

No. The app needs to connect to the Anthropic API to generate responses. Everything else (profiles, preferences, session history) works offline, but you won't get AI responses without a connection.

---

### I found a bug or want to suggest something

Open an issue at [github.com/sreme19/Dating-Assistant/issues](https://github.com/sreme19/Dating-Assistant/issues). Include what you were doing, what you expected to happen, and what actually happened.
