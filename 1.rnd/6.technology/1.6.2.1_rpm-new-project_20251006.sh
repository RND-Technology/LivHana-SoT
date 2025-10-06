#!/bin/bash
# Optimized: 2025-10-02
# RPM: 1.6.2.3.automation-scripts-optimization
# Session: Elephant Strategy Batch 1
set -euo pipefail

# RPM New Project Creator
# Interactive script to create new RPM DNA formatted project folder

set -e

REPO_ROOT=$(git rev-parse --show-toplevel 2>/dev/null || pwd)
cd "$REPO_ROOT" || exit

echo ""
echo "🚀 RPM DNA NEW PROJECT CREATOR"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

# AOM Selection
echo "1️⃣  SELECT AREA OF MASTERY (AOM):"
echo "   1 = Financial"
echo "   2 = Business/Career"
echo "   3 = Relationships/Love"
echo "   4 = Health/Fitness"
echo "   5 = Learning/Growth"
echo "   6 = Contribution/Legacy"
echo "   7 = Recreation/Adventure"
echo "   8 = Environment/Lifestyle"
read -r -p "   Enter AOM number (1-8): " AOM

case $AOM in
  1) AOM_NAME="FIN" ;;
  2) AOM_NAME="BIZ" ;;
  3) AOM_NAME="REL" ;;
  4) AOM_NAME="HEA" ;;
  5) AOM_NAME="LEA" ;;
  6) AOM_NAME="CON" ;;
  7) AOM_NAME="FUN" ;;
  8) AOM_NAME="ENV" ;;
  *) echo "❌ Invalid AOM"; exit 1 ;;
esac

echo ""
echo "2️⃣  SELECT CIRCLE OF INFLUENCE (COI):"
echo "   HMP = HemPress3 (Crown Jewel)"
echo "   RND = Reggie & Dro (Revenue Engine)"
echo "   TWK = TerpWorks (Revenue Engine)"
echo "   HNC = High Noon Cartoon (Growth Engine)"
echo "   OPS = One Plant Solution (Growth Engine)"
echo "   HRB = Herbitrage (Incubator)"
echo "   CCO = CannaCo (Incubator)"
echo "   SYS = System-wide"
read -r -p "   Enter COI code: " COI
COI=$(echo "$COI" | tr '[:lower:]' '[:upper:]')

echo ""
echo "3️⃣  SELECT PRIORITY LEVEL (RPM):"
echo "   001-099 = MUST (do or die)"
echo "   100-199 = RESULTS (high ROI)"
echo "   200-299 = PROGRESS (important)"
echo "   300-399 = OPTIMIZATION (nice to have)"
echo "   400-499 = MAINTENANCE (keep lights on)"
echo "   500-599 = RESEARCH (future potential)"
echo "   600-699 = DELEGATED (others responsible)"
echo "   700-799 = WAITING (blocked)"
echo "   800-899 = SOMEDAY/MAYBE (backlog)"
read -r -p "   Enter RPM number (001-899): " RPM

# Validate RPM format (3 digits)
if ! [[ "$RPM" =~ ^[0-9]{3}$ ]]; then
  echo "❌ RPM must be 3 digits (e.g., 010, 150, 500)"
  exit 1
fi

echo ""
echo "4️⃣  SELECT ACTION VERB:"
echo "   Common: BUILD, LAUNCH, OPTIMIZE, FIX, DEPLOY, DESIGN,"
echo "           RESEARCH, DOCUMENT, TEST, INTEGRATE, AUTOMATE"
read -r -p "   Enter action verb: " ACTION
ACTION=$(echo "$ACTION" | tr '[:lower:]' '[:upper:]')

echo ""
echo "5️⃣  DESCRIBE CONTEXT (kebab-case):"
echo "   Examples: delivery-api, leafly-profile, episode-1"
read -r -p "   Enter context: " CONTEXT
CONTEXT=$(echo "$CONTEXT" | tr '[:upper:]' '[:lower:]' | tr ' ' '-')

DATE=$(date +%Y%m%d)

# Build folder name
FOLDER="${AOM}-${AOM_NAME}.${COI}.${RPM}.${ACTION}.${CONTEXT}.${DATE}"

echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "📁 CREATING PROJECT:"
echo "   $FOLDER"
echo ""
read -r -p "   Proceed? (y/n): " CONFIRM

if [ "$CONFIRM" != "y" ] && [ "$CONFIRM" != "Y" ]; then
  echo "❌ Cancelled"
  exit 0
fi

# Create folder
mkdir -p "$FOLDER"

# Create basic structure inside
mkdir -p "$FOLDER/docs"
mkdir -p "$FOLDER/src"

# Create README
cat > "$FOLDER/README.md" <<EOF
# ${ACTION}: ${CONTEXT}

**AOM:** ${AOM}-${AOM_NAME}
**COI:** ${COI}
**Priority:** ${RPM}
**Created:** $(date +%Y-%m-%d)

## Objective
[What are you trying to achieve?]

## Success Criteria
- [ ] [Measurable outcome 1]
- [ ] [Measurable outcome 2]
- [ ] [Measurable outcome 3]

## Timeline
- **Start:** $(date +%Y-%m-%d)
- **Target:** [YYYY-MM-DD]
- **Actual:** [YYYY-MM-DD]

## ROI Estimate
- **Investment:** [Time/money]
- **Expected Return:** [Revenue/savings/value]
- **Payback Period:** [Days/weeks]

## Tasks
- [ ] [Task 1]
- [ ] [Task 2]
- [ ] [Task 3]

## Notes
[Additional context, dependencies, blockers]

---
**RPM DNA:** ${FOLDER}
EOF

echo ""
echo "✅ Project created successfully!"
echo ""
echo "📁 Location: $FOLDER"
echo "📝 README: $FOLDER/README.md"
echo ""
echo "🎯 Current stack rank:"
find . -maxdepth 1 -type d -name "[0-9]-*" -print | sort | head -5 | nl -w2 -s'. '
echo ""
echo "💡 Next steps:"
echo "   cd $FOLDER"
echo "   [Start working on your project]"
echo "   git add ."
echo "   git commit -m \"${AOM}-${AOM_NAME}.${COI}.${RPM}: Initialize ${CONTEXT}\""
echo ""
