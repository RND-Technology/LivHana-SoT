#!/usr/bin/env bash
# Voice Latency Benchmark Harness
# Measures P50, P95, P99 latency across multiple requests
set -euo pipefail

VOICE_SERVICE_URL="http://localhost:8080"
NUM_REQUESTS="${1:-30}"  # Default 30 requests for statistical significance

echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "📊 Voice Latency Benchmark Harness"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
echo "Configuration:"
echo "  Service URL: ${VOICE_SERVICE_URL}"
echo "  Number of requests: ${NUM_REQUESTS}"
echo ""

# Verify service is running
if ! curl -sf --max-time 2 "${VOICE_SERVICE_URL}/health" >/dev/null 2>&1; then
  echo "❌ Voice service not responding"
  exit 1
fi

echo "Running benchmark..."
echo ""

# Array to store latencies
declare -a latencies=()

# Test queries for variety
QUERIES=(
  "What is 2+2?"
  "Define terpenes."
  "Explain indica vs sativa."
  "What are cannabinoids?"
  "How does THC work?"
)

# Run requests
for i in $(seq 1 "$NUM_REQUESTS"); do
  QUERY="${QUERIES[$((i % ${#QUERIES[@]}))]}"
  
  # Measure latency using curl timing
  LATENCY=$(curl -w '%{time_total}' -o /dev/null -s -X POST "${VOICE_SERVICE_URL}/api/reasoning/chat" \
    -H "Content-Type: application/json" \
    -d "{\"message\": \"${QUERY}\"}")
  
  # Convert to milliseconds
  LATENCY_MS=$(echo "$LATENCY * 1000" | bc | cut -d'.' -f1)
  latencies+=("$LATENCY_MS")
  
  printf "  Request %2d/%d: %4dms\r" "$i" "$NUM_REQUESTS" "$LATENCY_MS"
done

echo ""
echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "📈 Results"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

# Sort latencies
IFS=$'\n' sorted=($(sort -n <<<"${latencies[*]}"))
unset IFS

# Calculate statistics
MIN="${sorted[0]}"
MAX="${sorted[$((NUM_REQUESTS - 1))]}"

# Calculate mean
SUM=0
for lat in "${latencies[@]}"; do
  SUM=$((SUM + lat))
done
MEAN=$((SUM / NUM_REQUESTS))

# Calculate percentiles
P50_IDX=$(((NUM_REQUESTS * 50) / 100))
P95_IDX=$(((NUM_REQUESTS * 95) / 100))
P99_IDX=$(((NUM_REQUESTS * 99) / 100))

P50="${sorted[$P50_IDX]}"
P95="${sorted[$P95_IDX]}"
P99="${sorted[$P99_IDX]}"

# Calculate standard deviation
VARIANCE=0
for lat in "${latencies[@]}"; do
  DIFF=$((lat - MEAN))
  VARIANCE=$((VARIANCE + DIFF * DIFF))
done
VARIANCE=$((VARIANCE / NUM_REQUESTS))
STDDEV=$(echo "sqrt($VARIANCE)" | bc)

# Display results
echo "Latency Statistics (${NUM_REQUESTS} requests):"
echo ""
echo "  Min:    ${MIN}ms"
echo "  P50:    ${P50}ms (median)"
echo "  P95:    ${P95}ms"
echo "  P99:    ${P99}ms"
echo "  Max:    ${MAX}ms"
echo "  Mean:   ${MEAN}ms"
echo "  StdDev: ${STDDEV}ms"
echo ""

# Target assessment
echo "Target Assessment:"
if [[ $P50 -lt 2000 ]]; then
  echo "  ✅ P50 < 2000ms (EXCELLENT)"
elif [[ $P50 -lt 3000 ]]; then
  echo "  🟡 P50 < 3000ms (GOOD)"
else
  echo "  ❌ P50 >= 3000ms (NEEDS OPTIMIZATION)"
fi

if [[ $P95 -lt 5000 ]]; then
  echo "  ✅ P95 < 5000ms (ACCEPTABLE)"
else
  echo "  ❌ P95 >= 5000ms (HIGH TAIL LATENCY)"
fi
echo ""

# Distribution visualization (simple histogram)
echo "Distribution (10 buckets):"
BUCKET_SIZE=$(( (MAX - MIN) / 10 + 1 ))
declare -a buckets=(0 0 0 0 0 0 0 0 0 0)

for lat in "${latencies[@]}"; do
  BUCKET_IDX=$(( (lat - MIN) / BUCKET_SIZE ))
  if [[ $BUCKET_IDX -ge 10 ]]; then
    BUCKET_IDX=9
  fi
  buckets[$BUCKET_IDX]=$((buckets[$BUCKET_IDX] + 1))
done

MAX_COUNT=0
for count in "${buckets[@]}"; do
  if [[ $count -gt $MAX_COUNT ]]; then
    MAX_COUNT=$count
  fi
done

for i in {0..9}; do
  RANGE_START=$((MIN + i * BUCKET_SIZE))
  RANGE_END=$((MIN + (i + 1) * BUCKET_SIZE))
  COUNT="${buckets[$i]}"
  BAR_LENGTH=$(( COUNT * 40 / MAX_COUNT ))
  
  printf "  %4d-%4dms [%2d]: " "$RANGE_START" "$RANGE_END" "$COUNT"
  printf '█%.0s' $(seq 1 "$BAR_LENGTH")
  echo ""
done
echo ""

# Save results
RESULTS_FILE="tmp/voice_benchmark_$(date +%Y%m%d_%H%M%S).json"
mkdir -p tmp

cat > "$RESULTS_FILE" <<EOJSON
{
  "timestamp": "$(date -u +%Y-%m-%dT%H:%M:%SZ)",
  "service_url": "${VOICE_SERVICE_URL}",
  "num_requests": ${NUM_REQUESTS},
  "statistics": {
    "min_ms": ${MIN},
    "p50_ms": ${P50},
    "p95_ms": ${P95},
    "p99_ms": ${P99},
    "max_ms": ${MAX},
    "mean_ms": ${MEAN},
    "stddev_ms": ${STDDEV}
  },
  "latencies_ms": [$(IFS=,; echo "${latencies[*]}")]
}
EOJSON

echo "📁 Results saved to: $RESULTS_FILE"
echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
