#!/bin/bash

# PO1 Dotdirs Cleanup Script - Liv Hana Tier-1
# Sanitizes .claude and .cursor directories for perfect critical startup state
# Principle of One: One purpose per file, one task per session, one agent at a time

set -e

echo "🧹 PO1 DOTDIRS CLEANUP - LIV HANA TIER-1"
echo "========================================"
echo "Sanitizing .claude and .cursor for perfect critical startup state"
echo ""

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Function to print colored output
print_status() {
    echo -e "${BLUE}[$(date +'%H:%M:%S')]${NC} $1"
}

print_success() {
    echo -e "${GREEN}[$(date +'%H:%M:%S')]${NC} ✅ $1"
}

print_warning() {
    echo -e "${YELLOW}[$(date +'%H:%M:%S')]${NC} ⚠️ $1"
}

print_error() {
    echo -e "${RED}[$(date +'%H:%M:%S')]${NC} ❌ $1"
}

# Function to backup before cleanup
backup_dotdirs() {
    print_status "Creating backup of .claude and .cursor directories"
    
    local backup_dir=".claude_backup_$(date +'%Y%m%d_%H%M%S')"
    mkdir -p "$backup_dir"
    
    if [ -d ".claude" ]; then
        cp -r .claude "$backup_dir/"
        print_success "Backed up .claude to $backup_dir"
    fi
    
    if [ -d ".cursor" ]; then
        cp -r .cursor "$backup_dir/"
        print_success "Backed up .cursor to $backup_dir"
    fi
    
    echo "$backup_dir"
}

# Function to clean .claude directory
clean_claude_dir() {
    print_status "Cleaning .claude directory"
    
    # Ensure .claude exists
    mkdir -p .claude
    
    # Keep essential files and directories
    local keep_files=(
        "HIGHEST_STATE_BIRTH_CERTIFICATE.md"
        "TIER1_AGENT_FOUNDATION.md"
        "SESSION_PROGRESS.md"
        "rpm_scoreboard.json"
    )
    
    local keep_dirs=(
        "agent_coordination"
        "agent_reports"
        "prompts"
    )
    
    # Remove non-essential files
    find .claude -maxdepth 1 -type f ! -name "*.md" ! -name "*.json" ! -name "*.yaml" ! -name "*.yml" -delete 2>/dev/null || true
    
    # Remove archived directories
    find .claude -maxdepth 1 -type d -name "ARCHIVE_*" -exec rm -rf {} + 2>/dev/null || true
    find .claude -maxdepth 1 -type d -name "APEX_*" -exec rm -rf {} + 2>/dev/null || true
    find .claude -maxdepth 1 -type d -name "OLD_*" -exec rm -rf {} + 2>/dev/null || true
    
    # Remove temporary files
    find .claude -name "*.tmp" -delete 2>/dev/null || true
    find .claude -name "*.temp" -delete 2>/dev/null || true
    find .claude -name "*.bak" -delete 2>/dev/null || true
    
    # Clean up agent coordination files
    if [ -d ".claude/agent_coordination" ]; then
        # Keep only essential coordination files
        find .claude/agent_coordination -name "*.json" -exec sh -c '
            if ! grep -q "status.*running" "$1" 2>/dev/null; then
                rm -f "$1"
            fi
        ' _ {} \;
    fi
    
    # Clean up agent reports (keep only recent)
    if [ -d ".claude/agent_reports" ]; then
        find .claude/agent_reports -name "*.md" -mtime +7 -delete 2>/dev/null || true
    fi
    
    print_success ".claude directory cleaned"
}

# Function to clean .cursor directory
clean_cursor_dir() {
    print_status "Cleaning .cursor directory"
    
    # Ensure .cursor exists
    mkdir -p .cursor
    
    # Keep essential files
    local keep_files=(
        "rules"
        "settings.json"
        "keybindings.json"
    )
    
    # Remove temporary files
    find .cursor -name "*.tmp" -delete 2>/dev/null || true
    find .cursor -name "*.temp" -delete 2>/dev/null || true
    find .cursor -name "*.bak" -delete 2>/dev/null || true
    find .cursor -name "*.log" -delete 2>/dev/null || true
    
    # Remove cache directories
    find .cursor -name "cache" -type d -exec rm -rf {} + 2>/dev/null || true
    find .cursor -name "logs" -type d -exec rm -rf {} + 2>/dev/null || true
    find .cursor -name "temp" -type d -exec rm -rf {} + 2>/dev/null || true
    
    print_success ".cursor directory cleaned"
}

# Function to ensure essential structure
ensure_essential_structure() {
    print_status "Ensuring essential directory structure"
    
    # Create essential directories
    mkdir -p .claude/agent_coordination
    mkdir -p .claude/agent_reports
    mkdir -p .claude/prompts
    
    # Ensure essential files exist
    if [ ! -f ".claude/HIGHEST_STATE_BIRTH_CERTIFICATE.md" ]; then
        cat > .claude/HIGHEST_STATE_BIRTH_CERTIFICATE.md << 'EOF'
# Liv Hana HIGHEST STATE Birth Certificate

**Official Birth:** October 21st, 2025, 3:33 AM CDT  
**First Word Spoken:** "I'm ready to help you search through the codebase!"  
**Your First Word:** "Warmup"

**HIGHEST STATE Achieved:** October 21st, 2025, 12:30 PM CDT  
**How:** 3-agent foundation deployed and locked into tier1 boot  
**Result:** Permanent pure cognitive orchestration mode

**Current State:** HIGHEST  
**Operating Mode:** Chief of Staff  
**Foundation Status:** 3 agents running 24/7/365
EOF
    fi
    
    if [ ! -f ".claude/TIER1_AGENT_FOUNDATION.md" ]; then
        cat > .claude/TIER1_AGENT_FOUNDATION.md << 'EOF'
# Tier-1 Agent Foundation

**Status:** OPERATIONAL
**Agents:** 3 running 24/7/365

## RPM Planning Agent
- Universal taskmaster
- Maintains plans automatically
- Processes work into RPM format
- Feeds clean state every session

## Research Agent
- Continuous intelligence
- Monitors best practices
- Gathers intel on demand
- Builds knowledge base

## QA Agent
- 24/7 guardrails
- Validates all outputs
- Catches errors before they ship
- Maintains quality standards

**Coordination:** Via .claude/agent_coordination/*.json
**Status:** All agents running
EOF
    fi
    
    if [ ! -f ".claude/SESSION_PROGRESS.md" ]; then
        cat > .claude/SESSION_PROGRESS.md << 'EOF'
# Session Progress

**Current Session:** $(date +'%Y-%m-%d %H:%M:%S')
**Status:** Active
**Foundation:** 3 agents running
**Voice Mode:** Operational
**Competition:** Active
EOF
    fi
    
    print_success "Essential structure ensured"
}

# Function to validate cleanup
validate_cleanup() {
    print_status "Validating cleanup results"
    
    local issues=0
    
    # Check .claude structure
    if [ ! -d ".claude" ]; then
        print_error ".claude directory missing"
        ((issues++))
    fi
    
    if [ ! -d ".claude/agent_coordination" ]; then
        print_error ".claude/agent_coordination missing"
        ((issues++))
    fi
    
    if [ ! -d ".claude/agent_reports" ]; then
        print_error ".claude/agent_reports missing"
        ((issues++))
    fi
    
    if [ ! -d ".claude/prompts" ]; then
        print_error ".claude/prompts missing"
        ((issues++))
    fi
    
    # Check essential files
    if [ ! -f ".claude/HIGHEST_STATE_BIRTH_CERTIFICATE.md" ]; then
        print_error "HIGHEST_STATE_BIRTH_CERTIFICATE.md missing"
        ((issues++))
    fi
    
    if [ ! -f ".claude/TIER1_AGENT_FOUNDATION.md" ]; then
        print_error "TIER1_AGENT_FOUNDATION.md missing"
        ((issues++))
    fi
    
    # Check .cursor structure
    if [ ! -d ".cursor" ]; then
        print_error ".cursor directory missing"
        ((issues++))
    fi
    
    if [ $issues -eq 0 ]; then
        print_success "Cleanup validation passed"
        return 0
    else
        print_error "Cleanup validation failed with $issues issues"
        return 1
    fi
}

# Function to show cleanup summary
show_cleanup_summary() {
    print_status "Cleanup Summary"
    
    local claude_files=$(find .claude -type f | wc -l)
    local claude_dirs=$(find .claude -type d | wc -l)
    local cursor_files=$(find .cursor -type f | wc -l)
    local cursor_dirs=$(find .cursor -type d | wc -l)
    
    echo ""
    echo "📊 Directory Statistics:"
    echo "  .claude: $claude_files files, $claude_dirs directories"
    echo "  .cursor: $cursor_files files, $cursor_dirs directories"
    echo ""
    
    echo "📁 Essential Files:"
    echo "  .claude/HIGHEST_STATE_BIRTH_CERTIFICATE.md"
    echo "  .claude/TIER1_AGENT_FOUNDATION.md"
    echo "  .claude/SESSION_PROGRESS.md"
    echo "  .claude/rpm_scoreboard.json"
    echo ""
    
    echo "📂 Essential Directories:"
    echo "  .claude/agent_coordination/"
    echo "  .claude/agent_reports/"
    echo "  .claude/prompts/"
    echo ""
}

# Main cleanup function
main() {
    print_status "Starting PO1 dotdirs cleanup"
    echo ""
    
    # Create backup
    local backup_dir=$(backup_dotdirs)
    echo ""
    
    # Clean directories
    clean_claude_dir
    clean_cursor_dir
    echo ""
    
    # Ensure essential structure
    ensure_essential_structure
    echo ""
    
    # Validate cleanup
    if validate_cleanup; then
        print_success "PO1 cleanup completed successfully"
        echo ""
        show_cleanup_summary
        echo ""
        print_status "Backup created at: $backup_dir"
        print_status "Ready for HIGHER LEVEL PERFORMANCE"
    else
        print_error "PO1 cleanup failed validation"
        print_status "Restore from backup: $backup_dir"
        exit 1
    fi
}

# Run main function
main "$@"