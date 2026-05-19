# Contributing to Dating Assistant

Thank you for your interest in contributing to the Dating Assistant project! This document provides guidelines and instructions for contributing.

## Code of Conduct

- Be respectful and inclusive
- Provide constructive feedback
- Focus on the code, not the person
- Help others learn and grow

## Getting Started

### Prerequisites
- Node.js 18 or higher
- npm or yarn
- Git
- Anthropic API key

### Development Setup

1. Fork the repository
2. Clone your fork:
   ```bash
   git clone https://github.com/YOUR_USERNAME/Dating-Assistant.git
   cd "Dating Assistant"
   ```

3. Add upstream remote:
   ```bash
   git remote add upstream https://github.com/sreme19/Dating-Assistant.git
   ```

4. Install dependencies:
   ```bash
   npm install
   ```

5. Create a feature branch:
   ```bash
   git checkout -b feature/your-feature-name
   ```

6. Set up environment:
   ```bash
   cp .env.example .env
   export ANTHROPIC_API_KEY=your_api_key_here
   ```

## Development Workflow

### Code Style

- Use TypeScript with strict mode enabled
- Follow ESLint configuration
- Use meaningful variable and function names
- Add JSDoc comments to all public functions

### Testing

All code must include tests:

```bash
# Run tests
npm run test:run

# Run tests in watch mode
npm test

# Run specific test file
npm test -- src/path/to/file.test.ts
```

- Aim for >80% code coverage
- Test both happy paths and error cases
- Use descriptive test names

### Building

```bash
npm run build
```

Ensure no TypeScript errors before committing.

### Linting

```bash
npm run lint
```

Fix all linting issues before submitting a PR.

## Commit Guidelines

### Commit Message Format

```
<type>(<scope>): <subject>

<body>

<footer>
```

### Types
- **feat**: A new feature
- **fix**: A bug fix
- **docs**: Documentation only changes
- **style**: Changes that don't affect code meaning (formatting, etc.)
- **refactor**: Code change that neither fixes a bug nor adds a feature
- **perf**: Code change that improves performance
- **test**: Adding or updating tests
- **chore**: Changes to build process, dependencies, etc.

### Examples

```
feat(cli): add session history display

Add ability to view and filter previous sessions from main menu.
Implements session listing with pagination and filtering options.

Closes #123
```

```
fix(database): handle connection timeout gracefully

Implement retry logic for database connections with exponential backoff.
Fixes issue where app would crash on temporary connection loss.

Fixes #456
```

## Pull Request Process

1. **Update your branch**:
   ```bash
   git fetch upstream
   git rebase upstream/main
   ```

2. **Push to your fork**:
   ```bash
   git push origin feature/your-feature-name
   ```

3. **Create Pull Request**:
   - Use a clear, descriptive title
   - Reference any related issues
   - Describe what changes were made and why
   - Include screenshots for UI changes

4. **PR Checklist**:
   - [ ] Code follows style guidelines
   - [ ] All tests pass
   - [ ] New tests added for new functionality
   - [ ] Documentation updated
   - [ ] No breaking changes (or documented)
   - [ ] Commit messages are clear

5. **Review Process**:
   - At least one approval required
   - All CI checks must pass
   - Address review comments
   - Rebase and force push if needed

## Areas for Contribution

### High Priority
- Bug fixes
- Performance improvements
- Test coverage improvements
- Documentation improvements

### Medium Priority
- New features (discuss in issue first)
- Refactoring for clarity
- Error handling improvements

### Lower Priority
- Code style improvements
- Minor optimizations
- Comment improvements

## Reporting Issues

### Bug Reports

Include:
- Clear description of the bug
- Steps to reproduce
- Expected behavior
- Actual behavior
- Environment (OS, Node version, etc.)
- Error messages or logs

### Feature Requests

Include:
- Clear description of the feature
- Use case and motivation
- Proposed implementation (if any)
- Examples or mockups

## Documentation

### README Updates
- Keep setup instructions current
- Update feature list if adding features
- Add troubleshooting for common issues

### Code Documentation
- Add JSDoc comments to all public functions
- Document complex algorithms
- Include examples for non-obvious usage

### Wiki Updates
- Add guides for new features
- Update architecture docs if structure changes
- Add troubleshooting guides

## Questions?

- Check existing issues and discussions
- Review the Wiki for common questions
- Open a discussion for questions

## License

By contributing, you agree that your contributions will be licensed under the MIT License.

## Recognition

Contributors will be recognized in:
- CONTRIBUTORS.md file
- Release notes for significant contributions
- GitHub contributors page

Thank you for contributing to Dating Assistant! 🎉
