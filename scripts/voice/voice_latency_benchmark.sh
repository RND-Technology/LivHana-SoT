#!/usr/bin/env bash
# Voice Latency Benchmark - Measure p50/p95/p99 latencies
# Created: 2025-10-30 by Liv Hana (Claude Code Agent)

set -euo pipefail

VOICE_BASE_URL="${VOICE_BASE_URL:-http://127.0.0.1:8080}"
SAMPLES="${BENCHMARK_SAMPLES:-100}"
OUTPUT_FILE="logs/voice_latency_benchmark_$(date +%Y%m%d_%H%M%S).json"

mkdir -p logs

echo "🔬 Voice Latency Benchmark"
echo "   Base URL: $VOICE_BASE_URL"
echo "   Samples: $SAMPLES"
echo

# Test /health endpoint
echo "Testing /health endpoint ($SAMPLES samples)..."
> /tmp/voice_bench_times.txt

for i in $(seq 1 $SAMPLES); do
  time_total=$(curl -s -o /dev/null -w '%{time_total}' "$VOICE_BASE_URL/health" 2>/dev/null || echo "0")
  echo "$time_total" >> /tmp/voice_bench_times.txt
  printf "\r  Progress: %d/%d" "$i" "$SAMPLES"
done
echo

# Calculate statistics
times=$(cat /tmp/voice_bench_times.txt | grep -v '^0$' | sort -n)
count=$(echo "$times" | wc -l | tr -d ' ')

if [[ $count -eq 0 ]]; then
  echo "❌ All requests failed"
  exit 1
fi

# Percentiles
p50_idx=$(( count * 50 / 100 ))
p95_idx=$(( count * 95 / 100 ))
p99_idx=$(( count * 99 / 100 ))

p50=$(echo "$times" | sed -n "${p50_idx}p")
p95=$(echo "$times" | sed -n "${p95_idx}p")
p99=$(echo "$times" | sed -n "${p99_idx}p")
min=$(echo "$times" | head -n 1)
max=$(echo "$times" | tail -n 1)
avg=$(echo "$times" | awk '{sum+=$1} END {print sum/NR}')

# Convert to milliseconds
p50_ms=$(echo "$p50 * 1000" | bc)
p95_ms=$(echo "$p95 * 1000" | bc)
p99_ms=$(echo "$p99 * 1000" | bc)
min_ms=$(echo "$min * 1000" | bc)
max_ms=$(echo "$max * 1000" | bc)
avg_ms=$(echo "$avg * 1000" | bc)

echo
echo "📊 Results:"
echo "   Min:  ${min_ms} ms"
echo "   Avg:  ${avg_ms} ms"
echo "   p50:  ${p50_ms} ms (median)"
echo "   p95:  ${p95_ms} ms"
echo "   p99:  ${p99_ms} ms"
echo "   Max:  ${max_ms} ms"
echo

# Save JSON
cat > "$OUTPUT_FILE" <<EOF
{
  "timestamp": "$(date -u +%Y-%m-%dT%H:%M:%SZ)",
  "base_url": "$VOICE_BASE_URL",
  "endpoint": "/health",
  "samples": $count,
  "latency_ms": {
    "min": $min_ms,
    "avg": $avg_ms,
    "p50": $p50_ms,
    "p95": $p95_ms,
    "p99": $p99_ms,
    "max": $max_ms
  }
}
EOF

echo "✅ Results saved to $OUTPUT_FILE"
rm /tmp/voice_bench_times.txt
