---
name: Pull Request
about: Submit changes to Liv Hana E2E Mission
title: '[TYPE]: Brief description of changes'
labels: ['needs-review']
assignees: ''
---

## 📋 Pull Request Checklist

### ✅ Pre-submission Requirements
- [ ] **Conventional Commit**: Commit message follows `type(scope): description` format
- [ ] **ADR Link**: Architectural changes include ADR reference (if applicable)
- [ ] **Tests**: All tests pass (`npm test`)
- [ ] **Linting**: Code passes linting (`npm run lint`)
- [ ] **Documentation**: Documentation updated (if applicable)
- [ ] **Changelog**: CHANGELOG.md updated (if applicable)

### 🏗️ Architectural Changes
If this PR contains architectural changes, please provide:
- [ ] **ADR Reference**: Link to relevant ADR (e.g., `ADR-001`)
- [ ] **Impact Assessment**: Description of system-wide impact
- [ ] **Migration Plan**: Steps for deployment (if applicable)
- [ ] **Rollback Plan**: Steps to revert changes (if applicable)

### 📚 Documentation Changes
If this PR modifies documentation:
- [ ] **Diátaxis Category**: Document categorized correctly (Tutorial/How-to/Reference/Explanation)
- [ ] **Front-matter**: Includes diataxis, owner, last-reviewed fields
- [ ] **Cross-references**: Links to related documents updated
- [ ] **Index Update**: docs/INDEX.md updated (if applicable)

### 🧪 Testing
- [ ] **Unit Tests**: New functionality has unit tests
- [ ] **Integration Tests**: Integration points tested
- [ ] **Playwright Tests**: UI changes tested (if applicable)
- [ ] **Manual Testing**: Manual verification completed

### 🔒 Security & Compliance
- [ ] **No Secrets**: No API keys, passwords, or sensitive data exposed
- [ ] **Compliance**: Changes comply with cannabis industry regulations
- [ ] **Guardrails**: AI guardrails maintained (if applicable)
- [ ] **Permissions**: Proper IAM permissions set (if applicable)

## 📝 Description

### What Changed
Brief description of what this PR changes.

### Why
Explanation of why this change is needed.

### How
High-level description of how the change was implemented.

## 🔗 Related Issues
- Fixes #
- Closes #
- Related to #

## 📊 Impact Assessment

### Systems Affected
- [ ] Backend Services
- [ ] Frontend Cockpits
- [ ] Automation Pipelines
- [ ] Documentation
- [ ] Infrastructure
- [ ] Other: _______________

### Risk Level
- [ ] Low (minor changes, no system impact)
- [ ] Medium (moderate changes, limited system impact)
- [ ] High (major changes, system-wide impact)
- [ ] Critical (breaking changes, requires coordination)

## 🚀 Deployment Notes

### Prerequisites
- [ ] Database migrations (if applicable)
- [ ] Environment variables (if applicable)
- [ ] Service dependencies (if applicable)
- [ ] Other: _______________

### Deployment Steps
1. Step 1
2. Step 2
3. Step 3

### Post-deployment Verification
- [ ] Health checks pass
- [ ] Key functionality verified
- [ ] Performance metrics acceptable
- [ ] Error rates normal

## 📸 Screenshots (if applicable)
<!-- Add screenshots for UI changes -->

## 🧪 Testing Instructions
<!-- Provide steps for reviewers to test the changes -->

## 📚 Additional Context
<!-- Add any other context about the PR here -->

---

## 🎯 Review Focus Areas
Please pay special attention to:
- [ ] Code quality and maintainability
- [ ] Performance implications
- [ ] Security considerations
- [ ] Documentation completeness
- [ ] Test coverage
- [ ] Compliance requirements

## 📋 Release Notes
<!-- Summarize changes for release notes -->
