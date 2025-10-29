#!/bin/bash
# QUICK_VOICE_FIX.sh - Fastest path to working voice mode
# Run this script and follow the prompts

echo "╔══════════════════════════════════════════════════════╗"
echo "║  🎤 QUICK VOICE MODE FIX - 2 MINUTES TO SUCCESS     ║"
echo "╚══════════════════════════════════════════════════════╝"
echo ""
echo "Current issue: Picking up music/ambient noise instead of your voice"
echo "Root cause: AirPods Bluetooth + missing permissions"
echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "STEP 1 OF 2: SWITCH TO BUILT-IN MICROPHONE"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
echo "I'm opening System Settings for you..."
echo ""

# Open System Settings to Sound/Input
open "x-apple.systempreferences:com.apple.preference.sound?Input"

echo "In the window that just opened:"
echo "  1. Click the 'Input' tab (if not already selected)"
echo "  2. Select 'MacBook Pro Microphone' (or 'Built-in Microphone')"
echo "  3. Speak and watch the input level bar move"
echo ""
echo "Press ENTER when you've switched to built-in mic..."
read

echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "STEP 2 OF 2: GRANT MICROPHONE PERMISSIONS"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
echo "Opening Privacy & Security settings..."
echo ""

# Open microphone permissions
open "x-apple.systempreferences:com.apple.preference.security?Privacy_Microphone"

echo "In the window that just opened:"
echo "  1. Find your terminal application in the list"
echo "  2. Toggle it ON (switch turns blue)"
echo "  3. Also enable: Cursor, Python (if you see them)"
echo ""
echo "Press ENTER when you've enabled permissions..."
read

echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "CRITICAL: RESTART TERMINAL"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
echo "Permissions only take effect after restarting your terminal."
echo ""
echo "To restart:"
echo "  1. Press Cmd+Q (fully quit, don't just close window)"
echo "  2. Reopen your terminal"
echo "  3. Navigate back to: $(pwd)"
echo "  4. Run: ./TEST_VOICE.sh"
echo ""
echo "✅ Setup complete! Restart your terminal and test voice mode."
echo ""
