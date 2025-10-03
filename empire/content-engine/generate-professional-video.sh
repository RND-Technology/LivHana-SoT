#!/bin/bash
set -e

echo "🎬 HIGH NOON CARTOON - PROFESSIONAL PRODUCTION"
echo "=============================================="
echo ""

EPISODE="episode-test-001"
AUDIO_DIR="output/audio/${EPISODE}/scene-1"
VIDEO_DIR="output/videos/${EPISODE}"
SCRIPT="output/scripts/${EPISODE}.json"

mkdir -p "$VIDEO_DIR"

# Get all audio files
AUDIO_FILES=($(ls -1 "$AUDIO_DIR"/*.mp3 | grep -v manifest | sort | head -6))

echo "🎙️ Found ${#AUDIO_FILES[@]} audio files"
echo "📝 Creating professional video with animated titles..."
echo ""

# Create concat file
CONCAT_FILE="$VIDEO_DIR/audio-list.txt"
rm -f "$CONCAT_FILE"
for AUDIO in "${AUDIO_FILES[@]}"; do
  echo "file '$AUDIO'" >> "$CONCAT_FILE"
done

# Combine all audio
COMBINED="$VIDEO_DIR/combined.mp3"
ffmpeg -y -loglevel error -f concat -safe 0 -i "$CONCAT_FILE" -c copy "$COMBINED"

# Get duration
DURATION=$(ffprobe -v error -show_entries format=duration -of default=noprint_wrappers=1:nokey=1 "$COMBINED")
echo "⏱️  Total duration: ${DURATION}s"

# Create professional video with animated text
FINAL="$VIDEO_DIR/HIGH-NOON-CARTOON-PROFESSIONAL.mp4"

echo "🎨 Rendering professional video..."

ffmpeg -y -loglevel warning -stats \
  -f lavfi -i "color=c=#0a0a0a:s=1920x1080:d=$DURATION:r=30" \
  -i "$COMBINED" \
  -filter_complex "[0:v]drawtext=text='HIGH NOON CARTOON':fontfile=/System/Library/Fonts/Supplemental/Arial\ Bold.ttf:fontsize=140:fontcolor=white:x=(w-text_w)/2:y=(h-text_h)/2-120:enable='between(t,0,3)':alpha='if(lt(t,0.5),t/0.5,if(lt(t,2.5),1,if(lt(t,3),(3-t)/0.5,0)))':borderw=6:bordercolor=black,drawtext=text='Episode 1\: Texas Truth':fontfile=/System/Library/Fonts/Supplemental/Arial.ttf:fontsize=70:fontcolor=#FFD700:x=(w-text_w)/2:y=(h-text_h)/2+80:enable='between(t,0.5,3)':alpha='if(lt(t,1),0,if(lt(t,1.5),(t-1)/0.5,if(lt(t,2.5),1,if(lt(t,3),(3-t)/0.5,0))))':borderw=4:bordercolor=black,drawtext=text='JESSE TESTIFIES AT TEXAS CAPITOL':fontfile=/System/Library/Fonts/Supplemental/Arial\ Bold.ttf:fontsize=50:fontcolor=white:x=(w-text_w)/2:y=h-100:enable='gte(t,3)':borderw=3:bordercolor=black[v]" \
  -map "[v]" -map 1:a \
  -c:v libx264 -preset medium -crf 23 -c:a aac -b:a 192k -pix_fmt yuv420p -shortest \
  "$FINAL"

# Cleanup
rm -f "$CONCAT_FILE" "$COMBINED"

# Stats
SIZE=$(du -h "$FINAL" | cut -f1)
echo ""
echo "✅ PROFESSIONAL VIDEO COMPLETE!"
echo "   File: $FINAL"
echo "   Size: $SIZE"
echo "   Duration: $(printf '%.1f' $DURATION)s"
echo ""
echo "🎬 OPENING VIDEO NOW..."
open "$FINAL"

# Optimized: 2025-10-02
