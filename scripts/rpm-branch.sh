#!/bin/bash
# RPM Git Branch Creator
# Creates git branches using RPM DNA naming convention
# Branch name matches top priority folder for easy tracking

set -e

if [ -z "$1" ]; then
  echo "❌ Usage: ./rpm-branch.sh \"Description of work\""
  echo ""
  echo "Example:"
  echo "  ./rpm-branch.sh \"Add DoorDash integration\""
  echo ""
  echo "This will create a branch like:"
  echo "  2-BIZ.RND.010.add-doordash-integration.20251002"
  echo ""
  exit 1
fi

REPO_ROOT=$(git rev-parse --show-toplevel)
cd "$REPO_ROOT"

# Get top priority folder prefix (AOM.COI.RPM)
TOP_FOLDER=$(ls -1 | grep -E "^[0-9]-" | head -1)

if [ -z "$TOP_FOLDER" ]; then
  echo "❌ No RPM DNA formatted folders found"
  echo "💡 Create a priority folder first, then create a branch"
  exit 1
fi

# Extract AOM.COI.RPM from folder name
PREFIX=$(echo "$TOP_FOLDER" | cut -d'.' -f1-3)

# Convert description to kebab-case
DESC=$(echo "$1" | tr '[:upper:]' '[:lower:]' | tr ' ' '-' | sed 's/[^a-z0-9-]//g')

# Add timestamp
DATE=$(date +%Y%m%d)

# Build branch name
BRANCH="${PREFIX}.${DESC}.${DATE}"

# Create branch
git checkout -b "$BRANCH"

echo "✅ Created branch: $BRANCH"
echo ""
echo "📁 Working on: $TOP_FOLDER"
echo "🔀 Branch: $BRANCH"
echo ""
echo "💡 When done:"
echo "   git add ."
echo "   git commit -m \"${PREFIX}: ${1}\""
echo "   git push -u origin $BRANCH"
echo ""

# Optimized: 2025-10-02
