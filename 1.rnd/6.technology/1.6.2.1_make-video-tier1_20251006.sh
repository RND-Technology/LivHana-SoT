#!/bin/bash
# Optimized: 2025-10-02
# RPM: 1.6.2.3.automation-scripts-optimization
# Session: Elephant Strategy Batch 1
set -euo pipefail

set -e

echo "🎬 HIGH NOON CARTOON - TIER 1 VIDEO GENERATION"
echo "=============================================="
echo ""

EPISODE="episode-test-001"
AUDIO_DIR="output/audio/${EPISODE}/scene-1"
VIDEO_DIR="output/videos/${EPISODE}"

# Create video directory
mkdir -p "$VIDEO_DIR"

# Read dialogue from script
DIALOGUE=(
  "JESSE: Chairman, distinguished members... Texas hemp already creates fifteen thousand jobs"
  "LIV HANA: Jesse's testimony is supported by Texas Department of Agriculture data"
  "COMMITTEE CHAIRMAN: Ma'am, are you... artificial intelligence?"
  "LIV HANA: Yes sir. Even AI can see Texas is losing tax revenue to Colorado"
  "JESSE: We're not asking government to pick winners"
  "NARRATOR: Will the Lone Star State choose liberty... or let fear override facts?"
)

# Get audio files
mapfile -t AUDIO_FILES < <(find "$AUDIO_DIR" -maxdepth 1 -type f -name '*.mp3' ! -name '*manifest*' | sort | head -6)

echo "📝 Found ${#AUDIO_FILES[@]} audio files"
echo "💬 Found ${#DIALOGUE[@]} dialogue lines"
echo ""

# Generate segments
SEGMENTS=()
for i in "${!AUDIO_FILES[@]}"; do
  AUDIO="${AUDIO_FILES[$i]}"
  TEXT="${DIALOGUE[$i]}"
  SEGMENT="$VIDEO_DIR/segment-$i.mp4"

  echo "[$((i+1))/${#AUDIO_FILES[@]}] Processing: $(basename "$AUDIO")"

  # Get audio duration
  DURATION=$(ffprobe -v error -show_entries format=duration -of default=noprint_wrappers=1:nokey=1 "$AUDIO")

  # Create black frame with text
  ffmpeg -y -loglevel error \
    -f lavfi -i "color=c=#1a1a1a:s=1920x1080:d=$DURATION:r=30" \
    -i "$AUDIO" \
    -vf "drawtext=text='$TEXT':fontfile=/System/Library/Fonts/Supplemental/Arial.ttf:fontsize=48:fontcolor=white:x=(w-text_w)/2:y=(h-text_h)/2:borderw=3:bordercolor=black" \
    -c:v libx264 -preset ultrafast -c:a aac -b:a 128k -pix_fmt yuv420p -shortest \
    "$SEGMENT"

  SEGMENTS+=("$SEGMENT")
  echo "   ✅ Created segment $((i+1))"
done

echo ""
echo "🎞️ Concatenating ${#SEGMENTS[@]} segments..."

# Create concat file
CONCAT_FILE="$VIDEO_DIR/concat.txt"
rm -f "$CONCAT_FILE"
for SEG in "${SEGMENTS[@]}"; do
  printf "file '%s'\n" "$(basename "$SEG")" >> "$CONCAT_FILE"
done

# Concatenate
FINAL="$VIDEO_DIR/${EPISODE}-FINAL.mp4"
ffmpeg -y -loglevel error -f concat -safe 0 -i "$CONCAT_FILE" -c copy "$FINAL"

# Clean up
rm -f "$CONCAT_FILE"
for SEG in "${SEGMENTS[@]}"; do
  rm -f "$SEG"
done

# Get final stats
SIZE=$(du -h "$FINAL" | cut -f1)
DURATION=$(ffprobe -v error -show_entries format=duration -of default=noprint_wrappers=1:nokey=1 "$FINAL" | awk '{printf "%.1f", $1}')

echo ""
echo "✅ SUCCESS!"
echo "   Video: $FINAL"
echo "   Size: $SIZE"
echo "   Duration: ${DURATION}s"
echo ""
echo "💰 Cost: \$0 (no image generation)"
echo "⏱️  Time: ~30 seconds"
echo "🎉 HIGH NOON CARTOON - READY TO WATCH!"
echo ""
