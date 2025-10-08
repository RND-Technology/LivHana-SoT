#!/bin/bash

# LOG-CLAIM.SH - Automated Claim Logging with Receipts
# Automatically logs agent claims with verification evidence

set -e

# Configuration
CLAIMS_DB="/Users/jesseniesen/LivHana-Trinity-Local/LivHana-SoT/.claude/agent_claims.json"
RECEIPTS_DIR="/Users/jesseniesen/LivHana-Trinity-Local/LivHana-SoT/reports"
TRUTH_LOG="/Users/jesseniesen/LivHana-Trinity-Local/LivHana-SoT/.claude/TRUTH_RANKING_LOG_$(date +%Y%m%d).md"

# Usage
usage() {
    echo "Usage: $0 <agent> <claim_type> <claim_text> [evidence_files...]"
    echo ""
    echo "Agent: cheetah, claude, replit, codex"
    echo "Claim Type: timeline, capability, cost, status"
    echo "Claim Text: The actual claim made"
    echo "Evidence Files: Optional files to attach as proof"
    echo ""
    echo "Examples:"
    echo "  $0 cheetah timeline 'Will complete delivery service in 2 hours'"
    echo "  $0 cheetah capability 'Built Nash-beating middleware' backend/delivery-service/"
    echo "  $0 cheetah cost 'Saves $50+ per order vs Nash' README.md"
    exit 1
}

# Validate arguments
if [ $# -lt 3 ]; then
    usage
fi

AGENT="$1"
CLAIM_TYPE="$2"
CLAIM_TEXT="$3"
shift 3
EVIDENCE_FILES=("$@")

# Validate agent
case "$AGENT" in
    cheetah|claude|replit|codex)
        ;;
    *)
        echo "Error: Invalid agent '$AGENT'. Must be one of: cheetah, claude, replit, codex"
        exit 1
        ;;
esac

# Validate claim type
case "$CLAIM_TYPE" in
    timeline|capability|cost|status)
        ;;
    *)
        echo "Error: Invalid claim type '$CLAIM_TYPE'. Must be one of: timeline, capability, cost, status"
        exit 1
        ;;
esac

# Generate claim ID
CLAIM_ID="$(date +%Y%m%d)_${AGENT}_$(echo "$CLAIM_TEXT" | md5sum | cut -c1-8)"

# Create receipts directory if it doesn't exist
mkdir -p "$RECEIPTS_DIR/$AGENT/receipts"

# Create receipt file
RECEIPT_FILE="$RECEIPTS_DIR/$AGENT/receipts/${CLAIM_ID}.md"
cat > "$RECEIPT_FILE" << EOF
# $(echo "$AGENT" | tr '[:lower:]' '[:upper:]') RECEIPT - ${CLAIM_ID}
**Date**: $(date -u +%Y-%m-%dT%H:%M:%SZ)  
**Agent**: $AGENT  
**Claim Type**: $CLAIM_TYPE  
**Claim Text**: "$CLAIM_TEXT"  
**Status**: ⏳ PENDING VERIFICATION

---

## 📋 CLAIM DETAILS

**Claim**: $CLAIM_TEXT  
**Type**: $CLAIM_TYPE  
**Agent**: $AGENT  
**Timestamp**: $(date -u +%Y-%m-%dT%H:%M:%SZ)  
**Claim ID**: $CLAIM_ID

---

## 🔍 EVIDENCE ATTACHED

EOF

# Add evidence files if provided
if [ ${#EVIDENCE_FILES[@]} -gt 0 ]; then
    echo "**Evidence Files**: ${#EVIDENCE_FILES[@]} files attached" >> "$RECEIPT_FILE"
    echo "" >> "$RECEIPT_FILE"
    
    for file in "${EVIDENCE_FILES[@]}"; do
        if [ -f "$file" ]; then
            echo "- \`$file\` - $(wc -l < "$file") lines" >> "$RECEIPT_FILE"
        elif [ -d "$file" ]; then
            echo "- \`$file/\` - directory with $(find "$file" -type f | wc -l) files" >> "$RECEIPT_FILE"
        else
            echo "- \`$file\` - NOT FOUND" >> "$RECEIPT_FILE"
        fi
    done
else
    echo "**Evidence Files**: None provided" >> "$RECEIPT_FILE"
fi

cat >> "$RECEIPT_FILE" << EOF

---

## 🎯 VERIFICATION CRITERIA

### Timeline Claims
- [ ] Deadline met: $(date -u +%Y-%m-%dT%H:%M:%SZ)
- [ ] Work completed as claimed
- [ ] Quality standards met

### Capability Claims
- [ ] Feature implemented
- [ ] Code committed to git
- [ ] Tests passing
- [ ] Documentation complete

### Cost Claims
- [ ] Actual costs measured
- [ ] Savings calculated
- [ ] Comparison validated

### Status Claims
- [ ] Current state verified
- [ ] Metrics accurate
- [ ] Evidence current

---

## 📊 VERIFICATION STATUS

**Status**: ⏳ PENDING  
**Verifier**: TBD  
**Verification Date**: TBD  
**Result**: TBD  
**Notes**: TBD

---

**Receipt Generated**: $(date -u +%Y-%m-%dT%H:%M:%SZ)  
**Next Review**: $(date -u -d '+24 hours' +%Y-%m-%dT%H:%M:%SZ)
EOF

# Create or update claims database
if [ ! -f "$CLAIMS_DB" ]; then
    cat > "$CLAIMS_DB" << EOF
{
  "claims": [],
  "last_updated": "$(date -u +%Y-%m-%dT%H:%M:%SZ)"
}
EOF
fi

# Add claim to database
jq --arg id "$CLAIM_ID" \
   --arg agent "$AGENT" \
   --arg type "$CLAIM_TYPE" \
   --arg text "$CLAIM_TEXT" \
   --arg timestamp "$(date -u +%Y-%m-%dT%H:%M:%SZ)" \
   --arg receipt "$RECEIPT_FILE" \
   '.claims += [{
     "id": $id,
     "agent": $agent,
     "type": $type,
     "text": $text,
     "timestamp": $timestamp,
     "status": "pending",
     "receipt_file": $receipt,
     "evidence_files": $ARGS.named
   }] | .last_updated = $timestamp' \
   "$CLAIMS_DB" > "$CLAIMS_DB.tmp" && mv "$CLAIMS_DB.tmp" "$CLAIMS_DB"

# Update truth log if it exists
if [ -f "$TRUTH_LOG" ]; then
    # Add new claim to truth log
    echo "| $(date +%Y-%m-%d) | 🐆 $AGENT | \"$CLAIM_TEXT\" | ⏳ **UNVERIFIED** | Receipt: \`$RECEIPT_FILE\` | Medium — pending verification | Logged as $CLAIM_ID |" >> "$TRUTH_LOG"
else
    # Create new truth log for today
    cat > "$TRUTH_LOG" << EOF
---
diataxis: log
owner: Jesse Niesen (CEO)
timestamp: $(date -u +%Y-%m-%dT%H:%M:%SZ)
status: active - daily truth benchmark
critical: YES - trust verification
---

# TRUTH BENCHMARK LOG — $(date +%Y-%m-%d)

| Date | Agent | Claim (verbatim) | Verification Status | Evidence Snapshot | Impact | Notes |
|------|-------|------------------|----------------------|-------------------|--------|-------|
| $(date +%Y-%m-%d) | 🐆 $AGENT | "$CLAIM_TEXT" | ⏳ **UNVERIFIED** | Receipt: \`$RECEIPT_FILE\` | Medium — pending verification | Logged as $CLAIM_ID |

---

**Next Update**: Append new verified claims or create \`TRUTH_RANKING_LOG_$(date -d '+1 day' +%Y%m%d).md\` after midnight UTC.
EOF
fi

echo "✅ Claim logged successfully!"
echo "📋 Claim ID: $CLAIM_ID"
echo "📄 Receipt: $RECEIPT_FILE"
echo "🗄️ Database: $CLAIMS_DB"
echo "📊 Truth Log: $TRUTH_LOG"
echo ""
echo "🔍 Verification commands:"
echo "  jq '.claims[] | select(.id == \"$CLAIM_ID\")' $CLAIMS_DB"
echo "  cat $RECEIPT_FILE"
echo "  grep '$CLAIM_ID' $TRUTH_LOG"
