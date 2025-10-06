---
diataxis: how-to
owner: Jesse Niesen (CEO)
last-reviewed: 2025-10-06
---

# Contributing to Liv Hana E2E Mission

**Purpose**: Guidelines for contributing to the Liv Hana E2E Mission codebase with emphasis on Conventional Commits, ADR linking, and Tier 1 Option A standards.

## 🎯 Quick Start

### Prerequisites
- Node.js 18+ and npm 8+
- Git with conventional commit configuration
- Access to Liv Hana development environment
- Understanding of Diátaxis documentation framework

### Getting Started
1. Fork the repository
2. Clone your fork: `git clone https://github.com/YOUR_USERNAME/LivHana-SoT.git`
3. Install dependencies: `npm install`
4. Run tests: `npm test`
5. Create a feature branch: `git checkout -b feat/your-feature-name`

## 📝 Commit Standards

### Conventional Commits Required
All commits must follow the [Conventional Commits](https://www.conventionalcommits.org/) specification:

```
<type>[optional scope]: <description>

[optional body]

[optional footer(s)]
```

### Supported Types
- `feat`: New feature
- `fix`: Bug fix
- `docs`: Documentation changes
- `style`: Code style changes (formatting, etc.)
- `refactor`: Code refactoring
- `perf`: Performance improvements
- `test`: Adding or updating tests
- `build`: Build system changes
- `ci`: CI/CD changes
- `chore`: Maintenance tasks
- `revert`: Reverting previous commits

### Examples
```bash
# Good
feat(voice): add ElevenLabs v3 integration
fix(checkout): resolve pickup date selection issue
docs(adr): add ADR-005 for payment processing
perf(api): optimize database queries by 40%

# Bad
Fixed stuff
Updated files
Changes
```

## 🏗️ Architectural Decision Records (ADRs)

### When ADRs Are Required
- **New architectural patterns**
- **Technology stack changes**
- **System-wide configuration changes**
- **Security model changes**
- **Performance-critical decisions**

### ADR Format (Nygard Schema)
```markdown
---
diataxis: explanation
owner: [Name]
adr: ADR-XXX
last-reviewed: YYYY-MM-DD
status: proposed|accepted|deprecated
---

# ADR-XXX: [Title]

## Status
[proposed|accepted|deprecated]

## Context
[Background and problem statement]

## Decision
[The change that is being proposed or made]

## Consequences
### Positive
- [Benefits]

### Negative
- [Drawbacks]
```

### ADR Linking in Commits
For architectural changes, include ADR reference:
```bash
feat(architecture): implement voice queue system

Implements ADR-002: Voice Mode Queue Architecture & Guardrails
- Add Redis-based queue management
- Implement BullMQ for job processing
- Add guardrails for compliance

Closes #123
```

## 📚 Documentation Standards

### Diátaxis Framework
All documentation must be categorized using the [Diátaxis framework](https://diataxis.fr/):

- **Tutorial**: Learning-oriented (step-by-step guides)
- **How-to**: Problem-oriented (solving specific problems)
- **Reference**: Information-oriented (technical specifications)
- **Explanation**: Understanding-oriented (background and context)

### Front-matter Required
```markdown
---
diataxis: [tutorial|how-to|reference|explanation]
owner: [Name]
adr: [ADR-XXX if applicable]
last-reviewed: YYYY-MM-DD
---
```

### Documentation Updates
- Update `docs/INDEX.md` when adding new documentation
- Cross-reference related documents
- Maintain consistent naming conventions
- Include clickable links for better navigation

## 🧪 Testing Requirements

### Test Coverage
- **Unit tests**: Minimum 80% coverage for new code
- **Integration tests**: For API endpoints and service interactions
- **Playwright tests**: For UI changes and user workflows
- **Manual testing**: For complex user scenarios

### Running Tests
```bash
# All tests
npm test

# Unit tests only
npm run test:unit

# Integration tests
npm run test:integration

# Playwright tests
npm run test:e2e

# Coverage report
npm run test:coverage
```

### Test Naming
```javascript
// Good
describe('VoiceService', () => {
  describe('processVoiceRequest', () => {
    it('should return audio response for valid input', () => {
      // test implementation
    });
  });
});

// Bad
describe('test', () => {
  it('works', () => {
    // test implementation
  });
});
```

## 🔒 Security & Compliance

### No Secrets in Code
- Never commit API keys, passwords, or sensitive data
- Use environment variables or secret management
- Use `op run` for 1Password secrets
- Add `.env.example` files for required variables

### Cannabis Compliance
- Follow Texas cannabis regulations
- Implement age verification where required
- Use compliant language (avoid "weed" terminology)
- Maintain audit trails for transactions

### AI Guardrails
- Implement content filtering for AI responses
- Add compliance checks before AI processing
- Log all AI interactions for audit purposes
- Implement rate limiting and abuse prevention

## 🚀 Pull Request Process

### Pre-submission Checklist
- [ ] Conventional commit message
- [ ] ADR link (if architectural)
- [ ] Tests pass
- [ ] Linting passes
- [ ] Documentation updated
- [ ] CHANGELOG.md updated
- [ ] No secrets exposed
- [ ] Security review completed

### PR Template
Use the provided PR template (`.github/PULL_REQUEST_TEMPLATE.md`) which includes:
- Pre-submission requirements
- Architectural change checklist
- Documentation change checklist
- Testing requirements
- Security & compliance checklist

### Review Process
1. **Automated checks**: CI/CD pipeline runs tests and linting
2. **Code review**: At least one team member reviews
3. **Security review**: For changes affecting security or compliance
4. **Documentation review**: For documentation changes
5. **Final approval**: Maintainer approval required

## 📊 Code Quality Standards

### Linting
```bash
# Run linting
npm run lint

# Fix auto-fixable issues
npm run lint:fix

# Check specific file
npx eslint src/file.js
```

### Code Style
- Follow ESLint configuration
- Use Prettier for formatting
- Consistent naming conventions
- Clear variable and function names
- Proper error handling

### Performance
- Optimize database queries
- Implement caching where appropriate
- Monitor memory usage
- Profile performance-critical code

## 🔄 Release Process

### Semantic Versioning
We follow [Semantic Versioning](https://semver.org/):
- **MAJOR**: Breaking changes
- **MINOR**: New features (backward compatible)
- **PATCH**: Bug fixes (backward compatible)

### Changelog
- Update `CHANGELOG.md` for all releases
- Use [Keep a Changelog](https://keepachangelog.com/) format
- Categorize changes (Added, Changed, Fixed, Removed)
- Include links to relevant issues and PRs

### Release Notes
- Summarize changes for users
- Highlight breaking changes
- Include migration instructions
- Link to relevant documentation

## 🆘 Getting Help

### Resources
- [Documentation Hub](./docs/README.md)
- [ADR Index](./docs/adr/)
- [Architecture Guide](./docs/architecture/)
- [API Reference](./docs/specs/)

### Communication
- **Issues**: Use GitHub Issues for bugs and feature requests
- **Discussions**: Use GitHub Discussions for questions and ideas
- **Slack**: #liv-hana-dev channel for real-time communication
- **Email**: dev@livhana.com for sensitive matters

### Mentorship
- New contributors are paired with experienced team members
- Code review sessions for learning
- Documentation contributions welcome
- Ask questions early and often

## 🎯 Tier 1 Option A Standards

### Quality Metrics
- **Code coverage**: Minimum 80%
- **Performance**: Sub-100ms API response times
- **Reliability**: 99.9% uptime target
- **Security**: Zero critical vulnerabilities
- **Documentation**: 100% API coverage

### Continuous Improvement
- Regular code quality reviews
- Performance monitoring and optimization
- Security audits and updates
- Documentation maintenance
- Team knowledge sharing

---

## 📋 Quick Reference

### Common Commands
```bash
# Development
npm run dev          # Start development server
npm run build        # Build for production
npm run test         # Run all tests
npm run lint         # Run linting

# Git
git commit -m "feat(scope): description"
git push origin feat/feature-name

# Documentation
npm run docs:build   # Build documentation
npm run docs:serve   # Serve documentation locally
```

### File Structure
```
LivHana-SoT/
├── docs/           # Documentation
├── backend/        # Backend services
├── frontend/       # Frontend applications
├── tests/          # Test files
├── .github/        # GitHub workflows and templates
└── CHANGELOG.md    # Release notes
```

---

**Last Updated**: 2025-10-06  
**Version**: 1.0.0  
**Maintainer**: Jesse Niesen (CEO)
