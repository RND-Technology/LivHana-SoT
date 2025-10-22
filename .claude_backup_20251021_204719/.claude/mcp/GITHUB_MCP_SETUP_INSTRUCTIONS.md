# GITHUB MCP INSTALLATION INSTRUCTIONS 📋

**Status**: Ready to configure (requires GitHub PAT)
**Priority**: #4 Workflow Automation
**Impact**: Auto-link PRs to Linear, clean git workflows, deployment checks

---

## PREREQUISITES REQUIRED

### 1. GitHub Personal Access Token (PAT)
You need a GitHub PAT with **`repo`** scope access.

**Create PAT**:
1. Go to: https://github.com/settings/tokens/new
2. Name: `Claude Code MCP Server`
3. Scopes required:
   - ✅ `repo` (full repository access)
   - ✅ `workflow` (GitHub Actions)
   - ✅ `read:org` (read organization data)
4. Click "Generate token"
5. **Copy token immediately** (you won't see it again!)

### 2. Docker (Optional - for local setup)
Check if Docker is installed:
```bash
docker --version
```

If not installed: https://docs.docker.com/get-docker/

---

## CONFIGURATION OPTIONS

### OPTION 1: Remote Server (Recommended) ⭐

**Pros**: No Docker required, simple setup
**Cons**: Requires PAT in command (can be stored securely)

**Command**:
```bash
# Replace YOUR_GITHUB_PAT with actual token
claude mcp add --transport http github \
  https://api.githubcopilot.com/mcp \
  -H "Authorization: Bearer YOUR_GITHUB_PAT"
```

**OR Manual config** in `~/.claude.json`:
```json
{
  "mcpServers": {
    "linear": { ... },
    "playwright": { ... },
    "semgrep": { ... },
    "github": {
      "type": "streamable-http",
      "url": "https://api.githubcopilot.com/mcp",
      "headers": {
        "Authorization": "Bearer YOUR_GITHUB_PAT"
      }
    }
  }
}
```

### OPTION 2: Local Docker Server

**Pros**: PAT stored in environment variable
**Cons**: Requires Docker running

**Step 1**: Set environment variable
```bash
# Add to ~/.zshrc or ~/.bashrc
export GITHUB_PERSONAL_ACCESS_TOKEN="your_github_pat_here"

# Reload shell
source ~/.zshrc
```

**Step 2**: Add to `~/.claude.json`
```json
{
  "mcpServers": {
    "linear": { ... },
    "playwright": { ... },
    "semgrep": { ... },
    "github": {
      "command": "docker",
      "args": [
        "run",
        "-i",
        "--rm",
        "-e",
        "GITHUB_PERSONAL_ACCESS_TOKEN",
        "ghcr.io/github/github-mcp-server"
      ],
      "env": {
        "GITHUB_PERSONAL_ACCESS_TOKEN": "${GITHUB_PERSONAL_ACCESS_TOKEN}"
      }
    }
  }
}
```

### OPTION 3: 1Password Integration (Most Secure) 🔒

If you're already using 1Password CLI (op):

**Step 1**: Store PAT in 1Password
```bash
# Create secure note with GitHub PAT
op item create \
  --category="API Credential" \
  --title="GitHub MCP PAT" \
  --vault="LivHana-Ops-Keys" \
  credential="your_github_pat_here"
```

**Step 2**: Create wrapper script
```bash
cat > ~/.local/bin/github-mcp-with-1password.sh << 'EOF'
#!/bin/bash
export GITHUB_PERSONAL_ACCESS_TOKEN=$(op item get "GitHub MCP PAT" --vault "LivHana-Ops-Keys" --fields credential --reveal 2>&1)
docker run -i --rm -e GITHUB_PERSONAL_ACCESS_TOKEN ghcr.io/github/github-mcp-server
EOF

chmod +x ~/.local/bin/github-mcp-with-1password.sh
```

**Step 3**: Add to `~/.claude.json`
```json
{
  "mcpServers": {
    "github": {
      "command": "/Users/jesseniesen/.local/bin/github-mcp-with-1password.sh",
      "args": []
    }
  }
}
```

---

## GITHUB MCP CAPABILITIES

Once configured, GitHub MCP enables:

### Repository Management
```javascript
// Create repository
await github.createRepository('new-service', {
  description: 'New microservice',
  private: true
});

// List repositories
const repos = await github.listRepositories('livhana-ecosystem');

// Clone/pull latest
await github.syncRepository('LivHana-SoT');
```

### Issue & PR Automation
```javascript
// Create PR from Linear issue
await github.createPullRequest({
  title: '[LH-123] Fix checkout calendar bug',
  body: 'Fixes: #123\n\nCloses Linear issue LH-123',
  head: 'fix/checkout-calendar',
  base: 'main'
});

// Auto-link Linear issues
await github.linkIssueInPR(prNumber, 'LH-123');

// Request reviews
await github.requestReview(prNumber, ['reviewer1', 'reviewer2']);
```

### CI/CD Monitoring
```javascript
// Check workflow status
const workflows = await github.listWorkflowRuns('LivHana-SoT');

// Get deployment status
const deploys = await github.listDeployments('main');

// Trigger workflow
await github.triggerWorkflow('deploy-production.yml');
```

### Code Analysis
```javascript
// Search code
const results = await github.searchCode('TODO', 'LivHana-SoT');

// Get file contents
const content = await github.getFile('backend/voice-service/src/index.js');

// Create commit
await github.createCommit({
  message: 'Fix: Update CORS configuration',
  files: [
    { path: 'backend/voice-service/src/index.js', content: '...' }
  ]
});
```

---

## INTEGRATION WORKFLOWS

### 1. Linear → GitHub → Linear Pipeline
```
Linear issue created (P0)
    ↓
Engineer creates branch: git checkout -b fix/LH-123
    ↓
Code changes committed
    ↓
GitHub MCP creates PR:
  - Title includes Linear issue number
  - Body links to Linear issue
  - Requests reviewers automatically
    ↓
CI runs (Playwright + Semgrep)
    ↓ (pass)
PR approved & merged
    ↓
GitHub MCP updates Linear:
  - Issue status → "Done"
  - Adds PR link to issue
  - Closes issue
```

### 2. Automated PR Creation
```bash
# From Linear issue, auto-create PR
linear issue show LH-123 | github-mcp create-pr \
  --title "Fix checkout calendar" \
  --branch "fix/LH-123" \
  --base "main" \
  --reviewers "team-leads"
```

### 3. Deployment Workflow
```
Git push to main
    ↓
GitHub Actions triggered
    ↓
GitHub MCP monitors workflow:
  - Build status
  - Test results
  - Deployment status
    ↓ (success)
Linear issues in PR auto-closed
    ↓
Slack notification sent
```

---

## RECOMMENDED GITHUB ACTIONS WORKFLOWS

### Deploy with Pre-checks
```yaml
name: Deploy to Production

on:
  push:
    branches: [main]

jobs:
  pre-checks:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4

      # Semgrep security scan
      - name: Security Scan
        run: semgrep scan --config=auto --error

      # Playwright E2E tests
      - name: E2E Tests
        run: |
          cd tests/e2e
          npm ci
          npx playwright install --with-deps
          npm test

  deploy:
    needs: pre-checks
    runs-on: ubuntu-latest
    steps:
      - name: Deploy to Cloud Run
        run: |
          gcloud run deploy voice-service \
            --image=gcr.io/${{ secrets.GCP_PROJECT }}/voice-service:${{ github.sha }}

      - name: Update Linear issues
        run: |
          # Extract Linear issue IDs from commit messages
          # Mark as deployed
          node scripts/update-linear-on-deploy.js
```

---

## VERIFICATION AFTER SETUP

Once GitHub MCP is configured:

### Test Connection
```bash
# Restart Claude Code
claude restart

# Verify MCP servers
claude mcp list

# Test GitHub connection
# In Claude Code session:
# "List my GitHub repositories"
# Should return list of repos
```

### Test Capabilities
```bash
# Create a test PR
# "Create a PR for branch test-github-mcp to main"

# Check workflows
# "What's the status of the latest GitHub Actions run?"

# Search code
# "Find all TODO comments in backend/voice-service"
```

---

## CURRENT STATUS

**Installed**:
- ✅ Linear MCP (issue tracking)
- ✅ Playwright MCP (E2E testing)
- ✅ Semgrep MCP (security scanning)

**Pending**:
- ⏳ GitHub MCP (requires PAT configuration)

**Next Steps**:
1. Create GitHub PAT (https://github.com/settings/tokens/new)
2. Choose configuration method (Remote HTTP recommended)
3. Add to `~/.claude.json` OR run `claude mcp add` command
4. Restart Claude Code
5. Test: "List my GitHub repositories"

---

## SECURITY BEST PRACTICES

### ✅ DO:
- Store PAT in 1Password or environment variable
- Use minimal required scopes (repo, workflow, read:org)
- Rotate PAT every 90 days
- Use different PATs for different tools

### ❌ DON'T:
- Commit PAT to git repositories
- Share PAT in chat logs or screenshots
- Use admin/full-access PATs
- Store PAT in plain text files

---

## ALTERNATIVE: Skip GitHub MCP

If you prefer not to configure GitHub MCP immediately, you can still:

1. Use `gh` CLI for GitHub operations (already available)
2. Manual PR creation via web UI
3. Use GitHub Actions without MCP monitoring
4. Add GitHub MCP later when needed

**Current setup (Linear + Playwright + Semgrep) already provides 80% of value!**

---

**RECOMMENDED ACTION**:
1. Create GitHub PAT now
2. Use Option 1 (Remote Server) for simplest setup
3. Add to config: See "OPTION 1" above
4. Restart Claude Code
5. Test connection

**NEXT PRIORITY AFTER GITHUB MCP**: Run first scans and create Linear issues from findings
