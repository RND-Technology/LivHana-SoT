# Codex CLI Setup - Blockers Identified

## Status: ⚠️ BLOCKED - Installation Failed

**Issue**: Codex CLI installation URL not accessible
- `curl https://cli.codex.sh/install` failed with "Could not resolve host"
- Codex CLI not found in system PATH

## Setup Steps (Pending Install)

### 1. Install Codex CLI
```bash
# Primary method (failed):
curl https://cli.codex.sh/install | bash

# Alternative methods to try:
# - Check vendor-provided install command
# - Download binary from GitHub releases
# - Install via Homebrew: brew install codex-cli
```

### 2. Authenticate
```bash
codex auth login
# Complete browser flow
codex status  # Verify authenticated
```

### 3. Cursor Settings
- Settings → Features → disable "Enable CLI sandbox"
- Restart Cursor

### 4. Git Integration
```bash
codex git enable
# Or confirm existing global git config
```

### 5. Cloud Projects
```bash
codex cloud projects init
# Select cloud provider (GCP/AWS/Azure)
# Finish wizard
```

### 6. Repository Configuration
Create `codex.yml` in repo root:
```yaml
# codex.yml
version: 1
project:
  name: LivHana-SoT
  path: .
  cloud:
    provider: gcp  # or aws, azure
    project_id: livhana-codex
```

### 7. Restart & Connect
```bash
# Relaunch Cursor
codex project connect
codex agent status  # Confirm local + cloud workspaces visible
```

## Next Steps

1. **Find Alternative Install Method**: Check Codex documentation for current installation URL
2. **Manual Installation**: Download binary if available
3. **Contact Support**: Reach out to Codex team for installation guidance
4. **Proceed Without**: Continue with current setup if Codex not required

## Current State

- Codex CLI: Not installed
- Authentication: Not available
- Git Integration: Not configured
- Cloud Projects: Not initialized
- Agent Status: Not available

**Recommendation**: Research current Codex CLI installation method or proceed with alternative tooling.

