#!/usr/bin/env bash
# 🔥 FIX: 1Password check - PERMANENT FIX
# Jesse has had this break for A MONTH - NO MORE

set -euo pipefail

BOOT_SCRIPT="/Users/jesseniesen/LivHana-Trinity-Local/LivHana-SoT/scripts/claude_tier1_boot.sh"
BACKUP="/Users/jesseniesen/LivHana-Trinity-Local/LivHana-SoT/scripts/claude_tier1_boot.sh.backup_$(date +%s)"

echo "🔥 FIXING 1PASSWORD CHECK - PERMANENT"
echo ""

# Backup
cp "$BOOT_SCRIPT" "$BACKUP"
echo "✅ Backup: $BACKUP"

# Create fixed version
cat > "$BOOT_SCRIPT.fixed" << 'BOOTEOF'
ensure_op_session() {
  local account="${OP_ACCOUNT_SLUG:-reggiedro.1password.com}"
  local verbosity="${1:-show}"

  if ! command -v op >/dev/null 2>&1; then
    error "1Password CLI (op) not found. Install via: brew install 1password-cli"
    exit 1
  fi

  # FIXED: Simple, robust check - if op whoami returns ANYTHING, we're authenticated
  local whoami_output
  whoami_output="$(op whoami 2>/dev/null || echo '')"
  
  # Check 1: Using service account token
  if [[ -n "${OP_SERVICE_ACCOUNT_TOKEN:-}" ]]; then
    if [[ -n "$whoami_output" ]]; then
      [[ "$verbosity" == "show" ]] && success "1Password authenticated via service account"
      return 0
    fi
    error "OP_SERVICE_ACCOUNT_TOKEN set but authentication failed"
    exit 1
  fi

  # Check 2: Already authenticated (SIMPLIFIED - no fragile regex)
  if [[ -n "$whoami_output" ]]; then
    # If we got ANY output from whoami, we're authenticated
    if echo "$whoami_output" | grep -qi "Email:\|URL:"; then
      if [[ "$verbosity" == "show" ]]; then
        local email=$(echo "$whoami_output" | grep "Email:" | awk '{print $2}' || echo "authenticated")
        success "1Password authenticated: $email"
      fi
      return 0
    fi
  fi

  # Check 3: Need to sign in
  info "Attempting 1Password sign-in for ${account}..."
  export OP_BIOMETRIC_UNLOCK_ENABLED=1

  if ! op signin --account "${account}" >/dev/null 2>&1; then
    error "1Password sign-in failed"
    error "Manual: op signin --account ${account}"
    exit 1
  fi

  # VERIFY: Check again after signin (SIMPLIFIED)
  whoami_output="$(op whoami 2>/dev/null || echo '')"
  if [[ -n "$whoami_output" ]] && echo "$whoami_output" | grep -qi "Email:\|URL:"; then
    success "1Password authenticated successfully"
    return 0
  fi

  # Only fail if we truly can't authenticate
  error "1Password authentication failed - CLI integration may not be enabled"
  error "Fix: Open 1Password → Settings → Developer → Enable CLI integration"
  exit 1
}
BOOTEOF

# Find the ensure_op_session function and replace it
echo ""
echo "🔧 Replacing ensure_op_session function..."

# Extract everything before ensure_op_session
sed -n '1,/^ensure_op_session() {/p' "$BOOT_SCRIPT" | head -n -1 > "$BOOT_SCRIPT.new"

# Add the fixed function
cat "$BOOT_SCRIPT.fixed" >> "$BOOT_SCRIPT.new"

# Extract everything after the old ensure_op_session function ends
sed -n '/^ensure_op_session() {/,/^}/p' "$BOOT_SCRIPT" | tail -n +2 > /tmp/old_function.txt
LINE_COUNT=$(wc -l < /tmp/old_function.txt)
sed -n "$(($(grep -n '^ensure_op_session() {' "$BOOT_SCRIPT" | head -1 | cut -d: -f1) + LINE_COUNT + 1)),\$p" "$BOOT_SCRIPT" >> "$BOOT_SCRIPT.new"

# Replace
mv "$BOOT_SCRIPT.new" "$BOOT_SCRIPT"
chmod +x "$BOOT_SCRIPT"

echo "✅ Boot script updated"
echo ""
echo "🧪 TESTING FIX..."
echo ""

# Test the function directly
source "$BOOT_SCRIPT"
if ensure_op_session show; then
  echo ""
  echo "🌟 SUCCESS - 1PASSWORD CHECK FIXED"
  echo ""
  echo "✅ op whoami works"
  echo "✅ Boot script check PASSES"
  echo "✅ NO MORE BULLSHIT ERRORS"
  echo ""
  echo "Backup saved: $BACKUP"
  exit 0
else
  echo "❌ Fix failed - restoring backup"
  mv "$BACKUP" "$BOOT_SCRIPT"
  exit 1
fi
