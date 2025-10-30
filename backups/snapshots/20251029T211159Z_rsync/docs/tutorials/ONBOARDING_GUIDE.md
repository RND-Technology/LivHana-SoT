---
diataxis: tutorial
owner: Jesse Niesen (CEO)
last-reviewed: 2025-10-06
---

# 🚀 Liv Hana E2E Mission Onboarding Guide

**Purpose**: Complete onboarding tutorial for new team members to understand the Liv Hana E2E Mission, its architecture, and how to contribute effectively.

## 🎯 Learning Objectives

By the end of this tutorial, you will:

- Understand the Liv Hana E2E Mission and its goals
- Navigate the codebase and documentation effectively
- Set up your development environment
- Understand the architecture and key components
- Know how to contribute following Tier 1 Option A standards
- Be familiar with compliance and security requirements

## 📋 Prerequisites

### Required Knowledge

- Basic understanding of Node.js and JavaScript
- Familiarity with Git and GitHub
- Understanding of REST APIs
- Basic knowledge of cannabis industry regulations (we'll cover this)

### Required Tools

- Node.js 18+ and npm 8+
- Git
- VS Code or Cursor IDE
- 1Password CLI (for secret management)
- Google Cloud CLI (for deployment)

## 🏗️ Step 1: Understanding the Mission

### What is Liv Hana E2E Mission?

Liv Hana is a comprehensive cannabis business platform that combines:

- **Voice-first cockpit**: AI-powered voice interactions
- **DeepSeek autonomy**: Advanced reasoning and decision-making
- **Compliance guardrails**: Built-in regulatory compliance
- **Swarm orchestration**: Coordinated multi-service operations

### Key Principles

1. **Tier 1 Option A**: Highest quality standards
2. **RPM DNA**: Systematic approach to prioritization
3. **Compliance First**: Regulatory compliance built-in
4. **Voice-First**: Natural language interactions
5. **Agentic Patterns**: AI-driven automation

### Business Context

- **Primary Domain**: reggieanddro.com
- **Industry**: Cannabis dispensary operations
- **Compliance**: Texas cannabis regulations
- **Scale**: 50k+ monthly transactions target

## 🛠️ Step 2: Environment Setup

### 1. Clone the Repository

```bash
git clone https://github.com/RND-Technology/LivHana-SoT.git
cd LivHana-SoT
```

### 2. Install Dependencies

```bash
npm install
```

### 3. Set Up Environment Variables

```bash
cp .env.example .env
# Edit .env with your configuration
```

### 4. Install Additional Tools

```bash
# 1Password CLI
brew install 1password-cli

# Google Cloud CLI
brew install google-cloud-sdk

# Playwright for testing
npx playwright install
```

### 5. Verify Installation

```bash
npm test
npm run lint
```

## 📚 Step 3: Documentation Navigation

### Understanding Diátaxis Framework

Our documentation follows the [Diátaxis framework](https://diataxis.fr/):

- **Tutorial** (this guide): Learning-oriented
- **How-to**: Problem-solving guides
- **Reference**: Technical specifications
- **Explanation**: Background and context

### Key Documentation Files

1. **[README.md](../README.md)**: Overview and quick start
2. **[INDEX.md](../INDEX.md)**: Complete documentation index
3. **[CHANGELOG.md](../../CHANGELOG.md)**: Release history
4. **[CONTRIBUTING.md](../../.github/CONTRIBUTING.md)**: Contribution guidelines

### Navigation Tips

- Use the [INDEX.md](../INDEX.md) for finding specific documentation
- Filter by Diátaxis category or owner
- Look for front-matter metadata for document purpose
- Follow cross-references between related documents

## 🏗️ Step 4: Architecture Overview

### System Architecture

```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   Frontend      │    │   Backend       │    │   Infrastructure │
│   Cockpits      │    │   Services      │    │   & DevOps      │
├─────────────────┤    ├─────────────────┤    ├─────────────────┤
│ • Vibe Cockpit  │    │ • Voice Service │    │ • Cloud Run     │
│ • Empire Cockpit│    │ • Reasoning     │    │ • Redis Queue   │
│ • Admin Panel   │    │   Gateway       │    │ • Secret Mgmt   │
└─────────────────┘    │ • Integration   │    │ • CI/CD         │
                       │   Service       │    │ • Monitoring    │
                       └─────────────────┘    └─────────────────┘
```

### Key Components

#### Backend Services

- **Voice Service**: ElevenLabs integration for voice processing
- **Reasoning Gateway**: DeepSeek 33B for AI reasoning
- **Integration Service**: Third-party integrations (Kaja, [PURGED_FALLACY], etc.)

#### Frontend Cockpits

- **Vibe Cockpit**: Customer-facing interface
- **Empire Cockpit**: Internal operations dashboard
- **Admin Panel**: System administration

#### Infrastructure

- **Cloud Run**: Serverless deployment
- **Redis**: Queue management and caching
- **Secret Manager**: Secure credential storage
- **CI/CD**: Automated testing and deployment

### Data Flow

1. **Voice Input** → Voice Service → Reasoning Gateway
2. **API Requests** → Integration Service → External APIs
3. **User Actions** → Frontend → Backend → Database
4. **Compliance** → Guardrails → Audit Logs

## 🔒 Step 5: Compliance & Security

### Cannabis Compliance

- **Age Verification**: Required for all customer interactions
- **Language Compliance**: Avoid "weed" terminology, use "cannabis"
- **Transaction Tracking**: All sales must be auditable
- **State Regulations**: Follow Texas cannabis laws

### Security Requirements

- **No Secrets in Code**: Use environment variables or secret management
- **JWT Authentication**: For all API endpoints
- **Guardrails**: Content filtering for AI responses
- **Audit Logging**: Track all system interactions

### Compliance Checklist

- [ ] Age verification implemented
- [ ] Compliant language used
- [ ] Transaction logging enabled
- [ ] Audit trail maintained
- [ ] Security headers set
- [ ] Rate limiting implemented

## 🧪 Step 6: Development Workflow

### 1. Create a Feature Branch

```bash
git checkout -b feat/your-feature-name
```

### 2. Make Changes

- Follow coding standards
- Write tests for new functionality
- Update documentation if needed

### 3. Test Your Changes

```bash
npm test
npm run lint
npm run test:e2e
```

### 4. Commit with Conventional Commits

```bash
git commit -m "feat(voice): add new voice processing feature"
```

### 5. Create Pull Request

- Use the PR template
- Include ADR reference if architectural
- Ensure all checks pass

### 6. Code Review

- Address feedback
- Update documentation
- Merge when approved

## 📊 Step 7: Understanding RPM DNA

### RPM DNA System

RPM DNA is our prioritization and organization system:

- **R**: Risk assessment
- **P**: Priority ranking
- **M**: Mission alignment
- **DNA**: Document, Navigate, Act

### File Naming Convention

```
[AOM#].[COI#].[RPM#].[ACTION#]_[DESCRIPTION]_[DATE].md
```

Example: `1.6.2.1_empire-visual-spec_20251006.md`

### Priority Levels

- **Tier 1**: Critical, mission-critical
- **Tier 2**: Important, high priority
- **Tier 3**: Nice to have, lower priority

## 🎯 Step 8: Key Workflows

### Daily Workflow

1. Check [RPM Weekly Plan](../RPM_WEEKLY_PLAN_OCT4-12_2025.md)
2. Review [Incomplete Work Status](../INCOMPLETE_WORK_STATUS.md)
3. Check [Deployment Status](../DEPLOYMENT_STATUS.md)
4. Update progress in relevant tracking documents

### Weekly Workflow

1. Review weekly plan updates
2. Assess priority changes
3. Update incomplete work status
4. Plan next week's priorities

### Release Workflow

1. Update CHANGELOG.md
2. Create release notes
3. Deploy to staging
4. Run full test suite
5. Deploy to production
6. Monitor system health

## 🚀 Step 9: First Contribution

### Choose a Good First Issue

Look for issues labeled:

- `good-first-issue`
- `documentation`
- `tutorial`
- `help-wanted`

### Example First Contribution

1. **Fix a typo** in documentation
2. **Add a test** for existing functionality
3. **Update documentation** for clarity
4. **Add a tutorial** for a specific workflow

### Contribution Checklist

- [ ] Issue exists or created
- [ ] Branch created from main
- [ ] Changes implemented
- [ ] Tests written and passing
- [ ] Documentation updated
- [ ] PR created with template
- [ ] Code review completed
- [ ] Merged to main

## 📞 Step 10: Getting Help

### Resources

- **Documentation**: [INDEX.md](../INDEX.md)
- **Issues**: GitHub Issues
- **Discussions**: GitHub Discussions
- **Slack**: #liv-hana-dev channel

### When to Ask for Help

- Stuck on a problem for more than 30 minutes
- Unclear requirements
- Need clarification on architecture
- Security or compliance questions
- Performance issues

### How to Ask for Help

1. **Search first**: Check documentation and issues
2. **Provide context**: What you're trying to do
3. **Include details**: Error messages, code snippets
4. **Be specific**: What help you need

## ✅ Step 11: Verification

### Knowledge Check

Answer these questions to verify your understanding:

1. What is the Liv Hana E2E Mission?
2. What are the four main pillars?
3. How do you navigate the documentation?
4. What is the Diátaxis framework?
5. How do you make a contribution?
6. What are the compliance requirements?
7. How do you use the RPM DNA system?

### Practical Exercise

1. **Set up your environment** following Step 2
2. **Navigate to a specific document** using the INDEX
3. **Make a small change** (fix a typo)
4. **Create a PR** following the workflow
5. **Get it merged** through code review

## 🎉 Congratulations

You've completed the Liv Hana E2E Mission onboarding tutorial! You now have:

- ✅ Understanding of the mission and architecture
- ✅ Development environment set up
- ✅ Knowledge of documentation structure
- ✅ Familiarity with compliance requirements
- ✅ Ability to contribute effectively
- ✅ Understanding of workflows and processes

### Next Steps

1. **Explore the codebase** more deeply
2. **Pick up your first issue** from the backlog
3. **Join team meetings** to understand current priorities
4. **Ask questions** and continue learning
5. **Start contributing** to the mission

### Continuous Learning

- **Stay updated** with weekly plans
- **Read ADRs** to understand architectural decisions
- **Participate in code reviews** to learn from others
- **Contribute to documentation** to help future team members
- **Share knowledge** with the team

---

**Welcome to the Liv Hana E2E Mission team!** 🚀

**Last Updated**: 2025-10-06  
**Version**: 1.0.0  
**Next Review**: 2025-11-06
