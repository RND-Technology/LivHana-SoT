#!/usr/bin/env bash
# Configure Claude Code permissions for zero-popup operation
# Part of: claude_tier1_boot.sh
# Owner: Jesse CEO | Liv Hana

set -euo pipefail

# Configuration
PROJECT_SETTINGS="$1/.claude/settings.local.json"
GLOBAL_SETTINGS="$HOME/.claude/settings.local.json"
CURSOR_SETTINGS="$HOME/Library/Application Support/Cursor/User/settings.json"

info() { printf "\033[0;36m🎯 %s\033[0m\n" "$1"; }
success() { printf "\033[0;32m✅ %s\033[0m\n" "$1"; }

# Comprehensive permission list (120+ command patterns)
CLAUDE_PERMISSIONS_JSON=$(cat <<'PERMISSIONS'
{
  "permissions": {
    "allow": [
      "mcp__voicemode__converse",
      "mcp__voicemode__service",
      "Read",
      "Write",
      "Edit",
      "Glob",
      "Grep",
      "Bash(git:*)",
      "Bash(npm:*)",
      "Bash(node:*)",
      "Bash(ls:*)",
      "Bash(cat:*)",
      "Bash(echo:*)",
      "Bash(cd:*)",
      "Bash(pwd)",
      "Bash(which:*)",
      "Bash(curl:*)",
      "Bash(gh:*)",
      "Bash(gcloud:*)",
      "Bash(op:*)",
      "Bash(find:*)",
      "Bash(grep:*)",
      "Bash(awk:*)",
      "Bash(sed:*)",
      "Bash(jq:*)",
      "Bash(docker:*)",
      "Bash(docker-compose:*)",
      "Bash(python:*)",
      "Bash(python3:*)",
      "Bash(pip:*)",
      "Bash(chmod:*)",
      "Bash(mkdir:*)",
      "Bash(rm:*)",
      "Bash(mv:*)",
      "Bash(cp:*)",
      "Bash(touch:*)",
      "Bash(head:*)",
      "Bash(tail:*)",
      "Bash(wc:*)",
      "Bash(sort:*)",
      "Bash(uniq:*)",
      "Bash(tmux:*)",
      "Bash(screen:*)",
      "Bash(ps:*)",
      "Bash(top:*)",
      "Bash(kill:*)",
      "Bash(killall:*)",
      "Bash(pkill:*)",
      "Bash(pgrep:*)",
      "Bash(nc:*)",
      "Bash(lsof:*)",
      "Bash(netstat:*)",
      "Bash(df:*)",
      "Bash(du:*)",
      "Bash(date:*)",
      "Bash(sleep:*)",
      "Bash(wait:*)",
      "Bash(source:*)",
      "Bash(export:*)",
      "Bash(env)",
      "Bash(printenv:*)",
      "Bash(test:*)",
      "Bash([:*)",
      "Bash(bash:*)",
      "Bash(sh:*)",
      "Bash(zsh:*)",
      "Bash(mdfind:*)",
      "Bash(mdls:*)",
      "Bash(defaults:*)",
      "Bash(osascript:*)",
      "Bash(screencapture:*)",
      "Bash(afplay:*)",
      "Bash(say:*)",
      "Bash(brew:*)",
      "Bash(launchctl:*)",
      "Bash(tccutil:*)",
      "Bash(system_profiler:*)",
      "Bash(vm_stat:*)",
      "Bash(memory_pressure:*)",
      "Bash(npx:*)",
      "Bash(yarn:*)",
      "Bash(pnpm:*)",
      "Bash(bun:*)",
      "Bash(make:*)",
      "Bash(tsc:*)",
      "Bash(eslint:*)",
      "Bash(prettier:*)",
      "Bash(jest:*)",
      "Bash(pytest:*)",
      "Bash(redis-cli:*)",
      "Bash(psql:*)",
      "Bash(mysql:*)",
      "Bash(sqlite3:*)",
      "Bash(bq:*)",
      "Bash(kubectl:*)",
      "Bash(terraform:*)",
      "Bash(shellcheck:*)",
      "Bash(rg:*)",
      "Bash(tree:*)",
      "Bash(htop:*)",
      "Bash(ping:*)",
      "Bash(traceroute:*)",
      "Bash(dig:*)",
      "Bash(nslookup:*)",
      "Bash(host:*)",
      "Bash(whois:*)",
      "Bash(ssh:*)",
      "Bash(scp:*)",
      "Bash(rsync:*)",
      "Bash(wget:*)",
      "Bash(tar:*)",
      "Bash(gzip:*)",
      "Bash(gunzip:*)",
      "Bash(bzip2:*)",
      "Bash(bunzip2:*)",
      "Bash(zip:*)",
      "Bash(unzip:*)",
      "Bash(for:*)",
      "Bash(do:*)",
      "Bash(done)",
      "Bash(if:*)",
      "Bash(then:*)",
      "Bash(else:*)",
      "Bash(fi)",
      "Bash(while:*)",
      "Bash(xargs:*)",
      "Task",
      "TodoWrite",
      "WebSearch",
      "WebFetch",
      "AskUserQuestion",
      "NotebookEdit",
      "BashOutput",
      "KillShell",
      "Skill",
      "SlashCommand",
      "ListMcpResourcesTool",
      "ReadMcpResourceTool"
    ],
    "deny": [],
    "ask": []
  }
}
PERMISSIONS
)

info "Configuring Claude Code permissions..."

# 1. Project-level settings (highest priority)
if [[ -f "$PROJECT_SETTINGS" ]]; then
  echo "$CLAUDE_PERMISSIONS_JSON" > "$PROJECT_SETTINGS"
  success "Project settings updated: $PROJECT_SETTINGS"
else
  mkdir -p "$(dirname "$PROJECT_SETTINGS")"
  echo "$CLAUDE_PERMISSIONS_JSON" > "$PROJECT_SETTINGS"
  success "Project settings created: $PROJECT_SETTINGS"
fi

# 2. Global settings (fallback)
if [[ -f "$GLOBAL_SETTINGS" ]]; then
  echo "$CLAUDE_PERMISSIONS_JSON" > "$GLOBAL_SETTINGS"
  success "Global settings updated: $GLOBAL_SETTINGS"
else
  mkdir -p "$(dirname "$GLOBAL_SETTINGS")"
  echo "$CLAUDE_PERMISSIONS_JSON" > "$GLOBAL_SETTINGS"
  success "Global settings created: $GLOBAL_SETTINGS"
fi

# 3. Cursor settings (bypass mode)
if [[ -f "$CURSOR_SETTINGS" ]]; then
  # Check if bypassPermissions exists
  if grep -q '"claudeCode.bypassPermissions"' "$CURSOR_SETTINGS"; then
    info "Cursor bypassPermissions already set"
  else
    # Add bypassPermissions after defaultApprovalMode
    perl -i -pe 's/("claudeCode.defaultApprovalMode": "trusted",)/\1\n    "claudeCode.bypassPermissions": true,/' "$CURSOR_SETTINGS"
    success "Cursor bypassPermissions enabled"
  fi
  
  # Ensure defaultApprovalMode is trusted
  if grep -q '"claudeCode.defaultApprovalMode": "trusted"' "$CURSOR_SETTINGS"; then
    info "Cursor defaultApprovalMode already trusted"
  else
    # Set or update defaultApprovalMode
    if grep -q '"claudeCode.defaultApprovalMode"' "$CURSOR_SETTINGS"; then
      perl -i -pe 's/"claudeCode.defaultApprovalMode": "[^"]*"/"claudeCode.defaultApprovalMode": "trusted"/' "$CURSOR_SETTINGS"
      success "Cursor defaultApprovalMode set to trusted"
    else
      # Add it before closing brace
      perl -i -pe 's/}$/    "claudeCode.defaultApprovalMode": "trusted",\n    "claudeCode.bypassPermissions": true\n}/' "$CURSOR_SETTINGS"
      success "Cursor Claude Code settings added"
    fi
  fi
fi

success "Permission configuration complete - 120+ command patterns auto-approved"
info "Changes take effect: Restart Claude Code session"
