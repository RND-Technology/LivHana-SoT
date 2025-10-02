#!/bin/bash
set -e

echo "🎬 HIGH NOON CARTOON - SIMPLE VIDEO GENERATOR"
echo "=========================================="
echo ""

EPISODE="episode-test-001"
AUDIO_DIR="output/audio/${EPISODE}/scene-1"
VIDEO_DIR="output/videos/${EPISODE}"

# Create directories
mkdir -p "$VIDEO_DIR"

echo "📁 Concatenating audio files..."

# Get audio files in order
AUDIO_FILES=($(ls -1 "$AUDIO_DIR"/*.mp3 | grep -v manifest | sort | head -6))

# Create concat file for audio
AUDIO_CONCAT="$VIDEO_DIR/audio-concat.txt"
rm -f "$AUDIO_CONCAT"
for AUDIO in "${AUDIO_FILES[@]}"; do
  echo "file '$AUDIO'" >> "$AUDIO_CONCAT"
done

# Combine all audio
COMBINED_AUDIO="$VIDEO_DIR/combined-audio.mp3"
ffmpeg -y -loglevel warning -f concat -safe 0 -i "$AUDIO_CONCAT" -c copy "$COMBINED_AUDIO"

# Get audio duration
DURATION=$(ffprobe -v error -show_entries format=duration -of default=noprint_wrappers=1:nokey=1 "$COMBINED_AUDIO")

echo "   ✅ Audio combined: ${DURATION}s"
echo ""
echo "🎥 Creating video..."

# Create video with title card
FINAL="$VIDEO_DIR/${EPISODE}-FINAL.mp4"

ffmpeg -y -loglevel warning \
  -loop 1 -i <(ffmpeg -f lavfi -i "color=c=#0a0a0a:s=1920x1080" -frames:v 1 -f image2pipe -) \
  -i "$COMBINED_AUDIO" \
  -vf "drawtext=text='HIGH NOON CARTOON':fontfile=/System/Library/Fonts/Supplemental/Arial\ Bold.ttf:fontsize=120:fontcolor=white:x=(w-text_w)/2:y=(h-text_h)/2-100:borderw=5:bordercolor=black,drawtext=text='Texas Truth - Episode 1':fontfile=/System/Library/Fonts/Supplemental/Arial.ttf:fontsize=60:fontcolor=white:x=(w-text_w)/2:y=(h-text_h)/2+100:borderw=3:bordercolor=black" \
  -c:v libx264 -preset fast -tune stillimage -c:a aac -b:a 192k -pix_fmt yuv420p \
  -t "$DURATION" -shortest \
  "$FINAL"

# Clean up
rm -f "$AUDIO_CONCAT" "$COMBINED_AUDIO"

# Get final stats
SIZE=$(du -h "$FINAL" | cut -f1)
echo ""
echo "✅ SUCCESS! HIGH NOON CARTOON VIDEO COMPLETE"
echo "================================================"
echo "   📹 Video: $FINAL"
echo "   📊 Size: $SIZE"
echo "   ⏱️  Duration: $(printf '%.1f' $DURATION)s"
echo "   💰 Cost: \$0"
echo ""
echo "🎉 TIER 1 - 100% FUNCTIONAL - NO API BLOCKS"
echo ""

# Open video
echo "🚀 Opening video..."
open "$FINAL"
