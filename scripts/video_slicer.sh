#!/bin/bash
###############################################################################
# VIDEO SLICER: Long Session → Viral Clips
# Generate multiple duration clips from long video recordings
#
# Usage: ./video_slicer.sh input.mp4 [output_dir]
#
# Generates clips: 1hr, 30min, 20min, 15min, 10min, 5min, 3min, 2min, 1min,
#                  30sec, 15sec, 10sec, 5sec
###############################################################################

set -e

INPUT_VIDEO="$1"
OUTPUT_DIR="${2:-./video_clips}"

if [[ -z "$INPUT_VIDEO" ]]; then
  echo "❌ Error: No input video specified"
  echo "Usage: $0 input.mp4 [output_dir]"
  exit 1
fi

if [[ ! -f "$INPUT_VIDEO" ]]; then
  echo "❌ Error: Input video not found: $INPUT_VIDEO"
  exit 1
fi

# Check for ffmpeg
if ! command -v ffmpeg &> /dev/null; then
  echo "❌ Error: ffmpeg not installed. Install with: brew install ffmpeg"
  exit 1
fi

mkdir -p "$OUTPUT_DIR"

BASENAME=$(basename "$INPUT_VIDEO" .mp4)

echo "🎬 VIDEO SLICER: Generating viral clips from $INPUT_VIDEO"
echo "📁 Output directory: $OUTPUT_DIR"
echo ""

# Get video duration
DURATION=$(ffprobe -v error -show_entries format=duration -of default=noprint_wrappers=1:nokey=1 "$INPUT_VIDEO")
DURATION_INT=$(printf "%.0f" "$DURATION")

echo "📊 Input video duration: ${DURATION_INT}s ($(date -u -r $DURATION_INT +"%H:%M:%S"))"
echo ""

# Define clip durations (in seconds)
declare -A CLIPS=(
  ["1hr"]=3600
  ["30min"]=1800
  ["20min"]=1200
  ["15min"]=900
  ["10min"]=600
  ["5min"]=300
  ["3min"]=180
  ["2min"]=120
  ["1min"]=60
  ["30sec"]=30
  ["15sec"]=15
  ["10sec"]=10
  ["5sec"]=5
)

# Sort by duration (longest first)
for clip in "1hr" "30min" "20min" "15min" "10min" "5min" "3min" "2min" "1min" "30sec" "15sec" "10sec" "5sec"; do
  clip_duration=${CLIPS[$clip]}

  if [[ $clip_duration -gt $DURATION_INT ]]; then
    echo "⏭️  Skipping $clip (longer than source video)"
    continue
  fi

  output_file="$OUTPUT_DIR/${BASENAME}_${clip}.mp4"

  echo "✂️  Generating $clip clip..."

  # Extract from beginning of video
  ffmpeg -i "$INPUT_VIDEO" \
    -t $clip_duration \
    -c:v libx264 -preset fast -crf 23 \
    -c:a aac -b:a 128k \
    -y \
    "$output_file" \
    2>&1 | grep -E "time=|error" || true

  if [[ -f "$output_file" ]]; then
    file_size=$(du -h "$output_file" | cut -f1)
    echo "   ✅ Created: $output_file ($file_size)"
  else
    echo "   ❌ Failed to create $clip clip"
  fi

  echo ""
done

echo "🎉 Video slicing complete!"
echo "📁 All clips saved to: $OUTPUT_DIR"
echo ""
echo "Generated clips:"
ls -lh "$OUTPUT_DIR"/${BASENAME}_*.mp4 2>/dev/null || echo "No clips generated"
