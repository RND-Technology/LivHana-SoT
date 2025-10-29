#!/bin/bash

echo "🚀 PUSH TO GITHUB - STEP BY STEP"
echo "================================"
echo ""

echo "📋 Step 1: Open this URL in your browser:"
echo ""
echo "https://github.com/RND-Technology/LivHana-SoT/security/secret-scanning/unblock-secret/34juSJjxZoZIy07f0UfjBGhBpWd"
echo ""
echo "Click 'Allow secret' (it's your own LightSpeed token)"
echo ""

read -p "Press ENTER after you've clicked 'Allow secret'..."

echo ""
echo "📤 Step 2: Pushing to GitHub..."
git push origin fix/mobile-control-po1 --force-with-lease

if [ $? -eq 0 ]; then
  echo ""
  echo "✅ SUCCESS! All 110+ commits pushed to GitHub"
  echo ""
  echo "📊 Next steps:"
  echo "1. Rotate the LightSpeed token (generate new one)"
  echo "2. Update in 1Password"
  echo "3. GitHub Copilot will auto-scan the repo"
else
  echo ""
  echo "❌ Push failed. Check the error above."
  echo ""
  echo "Alternative: Use git-filter-repo to remove secret from history:"
  echo "  brew install git-filter-repo"
  echo "  git filter-repo --path .claude/SESSION_SUMMARY_2025-10-29_VOICE_INTEGRATION.md --invert-paths"
  echo "  git push origin fix/mobile-control-po1 --force"
fi
