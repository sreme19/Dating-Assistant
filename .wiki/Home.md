# Dating Assistant Wiki

Welcome to the Dating Assistant Wiki! This is your comprehensive guide to understanding, using, and contributing to the Dating Assistant project.

## Quick Links

### Getting Started
- [Installation & Setup](Installation-&-Setup)
- [Quick Start Guide](Quick-Start-Guide)
- [Configuration](Configuration)

### User Guides
- [AI Bestie Mode Guide](AI-Bestie-Mode-Guide)
- [AI Wingman Mode Guide](AI-Wingman-Mode-Guide)
- [Session Management](Session-Management)
- [Custom Prompts](Custom-Prompts)

### Developer Documentation
- [Architecture Overview](Architecture-Overview)
- [Database Schema](Database-Schema)
- [API Integration](API-Integration)
- [Testing Guide](Testing-Guide)
- [Contributing Guide](Contributing-Guide)

### Troubleshooting & Support
- [Troubleshooting](Troubleshooting)
- [FAQ](FAQ)
- [Performance Tuning](Performance-Tuning)

### Project Information
- [Requirements](Requirements)
- [Design Document](Design-Document)
- [Implementation Status](Implementation-Status)

## Project Overview

Dating Assistant is a local CLI-based AI dating coach system with two distinct modes:

### AI Bestie Mode (Female Users)
- Interview potential matches with structured questions
- Build a personalized preferences knowledge base
- Track interview history and insights
- Create custom prompts for personalized AI behavior

### AI Wingman Mode (Male Users)
- Get strategic dating advice from an AI coach
- Maintain context across multiple conversation turns
- Track advice history for future reference
- Create custom prompts for personalized guidance

## Key Features

✅ **Local Storage**: All data stored on your machine - no cloud required
✅ **AI-Powered**: Uses Claude API for intelligent responses
✅ **Session Management**: Save and resume conversations anytime
✅ **Custom Prompts**: Personalize AI behavior with custom instructions
✅ **Knowledge Bases**: Build and maintain preference profiles
✅ **Error Recovery**: Automatic retry logic and graceful error handling
✅ **Comprehensive Testing**: 173 tests with 100% pass rate
✅ **Full Documentation**: Complete guides and API documentation

## System Requirements

- Node.js 18 or higher
- npm or yarn
- Anthropic API key (free tier available)
- ~50MB disk space for database

## Quick Start

```bash
# 1. Clone the repository
git clone https://github.com/sreme19/Dating-Assistant.git
cd "Dating Assistant"

# 2. Install dependencies
npm install

# 3. Set up environment
cp .env.example .env
export ANTHROPIC_API_KEY=your_api_key_here

# 4. Build and run
npm run build
npm start
```

## Project Statistics

- **Implementation**: ~3,400+ lines of TypeScript
- **Tests**: 173 comprehensive tests
- **Database**: 7 tables with referential integrity
- **Documentation**: Complete guides and API docs
- **Requirements**: All 25 requirements implemented

## Architecture Highlights

- **Modular Design**: Clear separation of concerns
- **Type Safety**: Full TypeScript strict mode
- **Error Handling**: Comprehensive error recovery
- **Performance**: Optimized queries and caching
- **Security**: Local storage with HTTPS API communication

## Contributing

We welcome contributions! See [Contributing Guide](Contributing-Guide) for details.

### Ways to Contribute
- Report bugs and suggest features
- Improve documentation
- Add tests and improve coverage
- Submit code improvements
- Help with translations

## Support

- 📖 Check the [FAQ](FAQ) for common questions
- 🐛 Report issues on [GitHub Issues](https://github.com/sreme19/Dating-Assistant/issues)
- 💬 Start a discussion on [GitHub Discussions](https://github.com/sreme19/Dating-Assistant/discussions)
- 📚 Read the [Troubleshooting Guide](Troubleshooting)

## License

This project is licensed under the MIT License. See [LICENSE](../LICENSE) for details.

## Roadmap

### Current Version (v1.0.0)
- ✅ Core features complete
- ✅ Full test coverage
- ✅ Comprehensive documentation

### Future Enhancements
- [ ] Web interface
- [ ] Multi-user support
- [ ] Database encryption
- [ ] Advanced analytics
- [ ] Mobile app
- [ ] Conversation export
- [ ] Advanced matching algorithms

## Community

- **GitHub**: [sreme19/Dating-Assistant](https://github.com/sreme19/Dating-Assistant)
- **Issues**: [Report bugs or request features](https://github.com/sreme19/Dating-Assistant/issues)
- **Discussions**: [Ask questions and share ideas](https://github.com/sreme19/Dating-Assistant/discussions)

---

**Last Updated**: May 19, 2026
**Version**: 1.0.0
**Status**: Production Ready ✅
