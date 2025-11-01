# Custom Agent Setup Guide for LivHana-SoT

**Version**: 2025-11-01  
**Owner**: RND-Technology / LivHana-SoT  
**Purpose**: Guide for creating custom GitHub Copilot agents optimized for this repository

---

## What is a Custom Agent?

A custom agent is a specialized AI assistant that can be configured with specific knowledge about your repository, coding standards, and workflows. Custom agents can:

- Understand your repository structure and conventions
- Follow your specific coding standards and patterns
- Assist with common tasks specific to your project
- Provide context-aware suggestions

---

## How to Create a Custom Agent

### Option 1: GitHub Copilot Workspace (Recommended)

GitHub Copilot Workspace allows you to create custom agents through the GitHub interface:

1. **Access Settings**:
   - Go to your repository: `https://github.com/RND-Technology/LivHana-SoT`
   - Navigate to Settings → Copilot

2. **Configure Custom Instructions**:
   - The `.github/copilot-instructions.md` file is automatically detected
   - GitHub Copilot will use these instructions when providing suggestions

3. **Enable for Organization** (if using GitHub Teams/Enterprise):
   - Go to Organization Settings → Copilot
   - Enable custom instructions for all repositories
   - Configure organization-wide policies

### Option 2: Using GitHub Copilot Extensions

GitHub Copilot Extensions (currently in beta) allow for more advanced customization:

1. **Check Beta Access**:
   - Visit: https://github.com/features/copilot/extensions
   - Request access if not already enrolled

2. **Create Extension**:
   - Navigate to GitHub Marketplace
   - Select "Create Extension"
   - Connect to your repository

3. **Configure Extension**:
   - Point to `.github/copilot-instructions.md`
   - Add additional context files if needed
   - Set up API endpoints for custom logic (optional)

---

## Configuration for LivHana-SoT

### Current Setup

Your repository is now configured with:

✅ **`.github/copilot-instructions.md`** - Core instructions file  
✅ **Verification-First Principles** - Safety and truth prioritized  
✅ **Repository Context** - Services, ports, and patterns documented  
✅ **Development Standards** - TypeScript, Shell, Security guidelines  
✅ **Pre-commit Checklist** - Quick reference for developers

### What's Already Working

GitHub Copilot will automatically:
- Read the `.github/copilot-instructions.md` file
- Apply these instructions when generating code suggestions
- Follow the verification-first approach
- Respect the coding standards and patterns

### How to Verify It's Working

1. **Open VS Code** with GitHub Copilot extension installed
2. **Open a file** in the repository (e.g., `backend/voice-service/src/index.js`)
3. **Start typing** a comment like:
   ```javascript
   // Create a new health endpoint that returns
   ```
4. **Observe suggestions** - They should follow the patterns in copilot-instructions.md

---

## Advanced Customization

### Add Custom Context Files

You can enhance the custom agent by creating additional context files:

1. **`.github/copilot-context/`** directory (create if needed):
   ```bash
   mkdir -p .github/copilot-context
   ```

2. **Add context files**:
   - `common-patterns.md` - Frequently used code patterns
   - `api-examples.md` - API endpoint examples
   - `testing-patterns.md` - Test structure examples

3. **Reference in instructions**:
   ```markdown
   See `.github/copilot-context/common-patterns.md` for examples
   ```

### Configure VS Code Settings

Add to `.vscode/settings.json`:
```json
{
  "github.copilot.advanced": {
    "contextFiles": [
      ".github/copilot-instructions.md",
      ".github/copilot-context/*.md"
    ]
  }
}
```

---

## Using the Custom Agent

### In VS Code

1. **Code Suggestions**: Type naturally and Copilot will suggest code
2. **Copilot Chat**: Press `Ctrl+I` (or `Cmd+I` on Mac) to open chat
3. **Ask Questions**: "@workspace How do I add a new service?"
4. **Get Context**: Copilot will reference your instructions automatically

### In GitHub Codespaces

Same as VS Code - the instructions are automatically loaded.

### In Pull Requests

GitHub Copilot can assist with:
- Code review comments
- Suggesting improvements
- Explaining code changes

---

## Best Practices

### Keep Instructions Updated

- Update `.github/copilot-instructions.md` when patterns change
- Document new services, conventions, or standards
- Add examples of good vs bad patterns

### Use Clear Language

- Be specific about requirements
- Use examples to illustrate patterns
- Avoid ambiguous instructions

### Test the Agent

- Try common tasks and verify suggestions match standards
- Collect feedback from team members
- Iterate on instructions based on usage

### Version Control

- Commit all changes to instruction files
- Use conventional commits: `docs(copilot): update patterns`
- Reference ADRs when making architectural changes

---

## Troubleshooting

### Copilot Not Following Instructions

**Check:**
- File is at `.github/copilot-instructions.md` (exact path)
- File is in markdown format
- No syntax errors in the file
- VS Code GitHub Copilot extension is up to date

**Try:**
- Reload VS Code window
- Clear Copilot cache: Command Palette → "Copilot: Clear Cache"
- Check VS Code Output panel → "GitHub Copilot" for errors

### Instructions Too Long

**Current status**: Your instructions are 471 lines (within limits)

**If too long:**
- Split into multiple files in `.github/copilot-context/`
- Reference external files from main instructions
- Focus on high-level principles in main file

### Suggestions Don't Match Patterns

**Improve by:**
- Adding more specific examples
- Documenting anti-patterns to avoid
- Including code snippets in instructions
- Being explicit about required vs optional patterns

---

## Next Steps

### Immediate Actions

1. ✅ Instructions file is created and configured
2. ✅ Verification-first principles are documented
3. ✅ Repository context is captured

### Optional Enhancements

1. **Add Code Examples**: Create `.github/copilot-context/examples/`
2. **Document Patterns**: Add common patterns file
3. **Team Training**: Share guide with team members
4. **Collect Feedback**: Monitor how well Copilot follows instructions
5. **Iterate**: Update instructions based on team feedback

### Monitoring Effectiveness

Track:
- Time saved on common tasks
- Consistency of generated code
- Reduction in code review feedback
- Team satisfaction with suggestions

---

## Resources

- [GitHub Copilot Documentation](https://docs.github.com/en/copilot)
- [Copilot for Business](https://docs.github.com/en/copilot/overview-of-github-copilot/about-github-copilot-for-business)
- [Best Practices Guide](https://gh.io/copilot-coding-agent-tips)
- [Copilot Extensions](https://github.com/features/copilot/extensions)

---

## Summary

**You're all set!** 🎉

Your repository now has:
- ✅ Custom Copilot instructions configured
- ✅ Verification-first principles documented
- ✅ Repository-specific patterns defined
- ✅ Development standards captured

GitHub Copilot will automatically use these instructions when:
- Providing code suggestions in VS Code
- Answering questions in Copilot Chat
- Assisting with code reviews
- Generating new code

**No additional setup required** - just start using GitHub Copilot in your repository and it will follow these guidelines automatically.

---

**Questions?** Open an issue or ask in your team chat!
