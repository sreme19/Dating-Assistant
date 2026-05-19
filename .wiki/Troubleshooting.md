# Troubleshooting Guide

Solutions to common issues and problems.

## Installation Issues

### "Node.js not found"

**Problem**: Command `node` not recognized

**Solutions**:
1. Install Node.js from [nodejs.org](https://nodejs.org/)
2. Restart terminal after installation
3. Verify: `node --version`
4. On Mac with Homebrew: `brew install node`

### "npm install fails"

**Problem**: Dependencies won't install

**Solutions**:
1. Clear npm cache: `npm cache clean --force`
2. Delete node_modules: `rm -rf node_modules`
3. Delete package-lock.json: `rm package-lock.json`
4. Try again: `npm install`
5. Check internet connection
6. Try with `npm install --legacy-peer-deps`

### "TypeScript compilation errors"

**Problem**: `npm run build` fails

**Solutions**:
1. Ensure Node.js 18+: `node --version`
2. Clear build: `rm -rf dist/`
3. Reinstall dependencies: `npm install`
4. Rebuild: `npm run build`
5. Check for syntax errors in source files

## Configuration Issues

### "ANTHROPIC_API_KEY not found"

**Problem**: Application can't find API key

**Solutions**:
1. Create `.env` file: `cp .env.example .env`
2. Add API key to `.env`: `ANTHROPIC_API_KEY=sk-ant-...`
3. Verify environment variable: `echo $ANTHROPIC_API_KEY`
4. If not set: `export ANTHROPIC_API_KEY=your_key_here`
5. Restart terminal after setting environment variable

### "Invalid API key"

**Problem**: API key is rejected

**Solutions**:
1. Verify API key format (starts with `sk-ant-`)
2. Check key is not expired
3. Generate new key at [console.anthropic.com](https://console.anthropic.com)
4. Ensure no extra spaces in `.env` file
5. Verify key has sufficient credits

### "Database path not found"

**Problem**: Custom database path doesn't work

**Solutions**:
1. Ensure directory exists: `mkdir -p /path/to/dir`
2. Check permissions: `ls -la /path/to/dir`
3. Use absolute path, not relative
4. On Mac: Use `~` for home directory
5. Verify path in `.env` file

## Runtime Issues

### "API timeout error"

**Problem**: Claude API requests timeout

**Solutions**:
1. Check internet connection
2. Verify API key is valid
3. Check API status at [console.anthropic.com](https://console.anthropic.com)
4. Try again (automatic retry included)
5. Check if API rate limit reached
6. Increase timeout in `.env`: `API_TIMEOUT=60000`

### "Database connection error"

**Problem**: Can't connect to database

**Solutions**:
1. Delete database: `rm ~/.dating-assistant/data.db`
2. Restart application (database will be recreated)
3. Check disk space: `df -h`
4. Check file permissions: `ls -la ~/.dating-assistant/`
5. Try custom database path in `.env`

### "Database locked error"

**Problem**: Database is locked by another process

**Solutions**:
1. Close other instances of application
2. Wait a few seconds and try again
3. Delete database and restart: `rm ~/.dating-assistant/data.db`
4. Check for stuck processes: `ps aux | grep node`
5. Kill stuck process: `kill -9 <PID>`

### "No response from AI"

**Problem**: AI doesn't respond to input

**Solutions**:
1. Check internet connection
2. Verify API key is set and valid
3. Check API status at [console.anthropic.com](https://console.anthropic.com)
4. Try simpler input (shorter text)
5. Restart application
6. Check application logs for errors

## Application Issues

### "Application crashes on startup"

**Problem**: App crashes immediately

**Solutions**:
1. Check for errors: `npm run build`
2. Verify `.env` file exists
3. Check database: `rm ~/.dating-assistant/data.db`
4. Restart application
5. Check Node.js version: `node --version`
6. Try development mode: `npm run dev`

### "Menu not displaying correctly"

**Problem**: CLI menu appears broken

**Solutions**:
1. Resize terminal window
2. Clear terminal: `clear`
3. Restart application
4. Check terminal supports colors
5. Try different terminal application

### "Input not being accepted"

**Problem**: Can't type or input is ignored

**Solutions**:
1. Ensure terminal is focused
2. Try pressing Enter after input
3. Check for stuck processes
4. Restart application
5. Try different terminal

### "Session not saving"

**Problem**: Session data not persisted

**Solutions**:
1. Check database permissions
2. Verify disk space available
3. Check database file exists: `ls ~/.dating-assistant/data.db`
4. Try restarting application
5. Check application logs for errors

## Performance Issues

### "Application is slow"

**Problem**: App responds slowly

**Solutions**:
1. Check system resources: `top` or Activity Monitor
2. Close other applications
3. Check internet connection speed
4. Verify API key has sufficient credits
5. Try restarting application
6. Check database size: `ls -lh ~/.dating-assistant/data.db`

### "Database queries are slow"

**Problem**: Database operations take too long

**Solutions**:
1. Check database size
2. Delete old sessions if database is large
3. Verify indexes are created
4. Check disk space available
5. Try on faster storage device

### "API responses are slow"

**Problem**: Claude API takes too long

**Solutions**:
1. Check internet connection
2. Try simpler prompts
3. Check API status
4. Verify API key has sufficient credits
5. Try during off-peak hours

## Data Issues

### "Lost session data"

**Problem**: Session data disappeared

**Solutions**:
1. Check database file exists: `ls ~/.dating-assistant/data.db`
2. Verify database permissions
3. Check if database was deleted
4. Restore from backup if available
5. Create new session

### "Corrupted database"

**Problem**: Database appears corrupted

**Solutions**:
1. Delete database: `rm ~/.dating-assistant/data.db`
2. Restart application (database will be recreated)
3. Restore from backup if available
4. Check disk for errors

### "Can't resume session"

**Problem**: Session won't resume

**Solutions**:
1. Verify session exists: View Previous Sessions
2. Check session status (should be paused)
3. Try restarting application
4. Check database is accessible
5. Try creating new session

## Testing Issues

### "Tests fail"

**Problem**: `npm run test:run` shows failures

**Solutions**:
1. Ensure all dependencies installed: `npm install`
2. Check Node.js version: `node --version`
3. Clear build: `rm -rf dist/`
4. Rebuild: `npm run build`
5. Run tests again: `npm run test:run`

### "Tests timeout"

**Problem**: Tests take too long or timeout

**Solutions**:
1. Check system resources
2. Close other applications
3. Increase timeout in vitest config
4. Run specific test: `npm test -- src/path/to/test.ts`
5. Check for infinite loops in code

## Getting Help

If you can't find a solution:

1. **Check FAQ**: [FAQ](FAQ) - Common questions
2. **Search Issues**: [GitHub Issues](https://github.com/sreme19/Dating-Assistant/issues)
3. **Ask Question**: [GitHub Discussions](https://github.com/sreme19/Dating-Assistant/discussions)
4. **Report Bug**: [New Issue](https://github.com/sreme19/Dating-Assistant/issues/new)

### When Reporting Issues

Include:
- Error message (exact text)
- Steps to reproduce
- Expected behavior
- Actual behavior
- Environment (OS, Node version, etc.)
- Relevant logs or screenshots

## Advanced Troubleshooting

### Enable Debug Logging

Set environment variable:
```bash
export DEBUG=dating-assistant:*
npm start
```

### Check Application Logs

View recent logs:
```bash
# On Mac/Linux
tail -f ~/.dating-assistant/logs.txt

# Or check database directly
sqlite3 ~/.dating-assistant/data.db ".tables"
```

### Reset Application

Complete reset (WARNING: Deletes all data):
```bash
# Delete database
rm ~/.dating-assistant/data.db

# Delete node_modules
rm -rf node_modules

# Reinstall
npm install

# Rebuild
npm run build

# Run
npm start
```

---

**Last Updated**: May 19, 2026
**Version**: 1.0.0
