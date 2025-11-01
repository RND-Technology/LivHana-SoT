#!/bin/bash
# Latency probe - measures p95 latency for critical endpoints
# Part of EA_PRECISION audit infrastructure
set -euo pipefail

echo "=== Latency Probe ==="
echo "Date: $(date)"
echo ""

RESULTS_FILE="latency-results-$(date +%Y%m%d-%H%M%S).json"

# Check if services are running
check_service() {
    local url=$1
    local name=$2
    
    if curl -s -f "$url" > /dev/null 2>&1; then
        echo "✅ $name is reachable"
        return 0
    else
        echo "❌ $name is not reachable at $url"
        return 1
    fi
}

# Measure latency
measure_latency() {
    local url=$1
    local name=$2
    local iterations=20
    
    echo ""
    echo "Measuring $name latency ($iterations requests)..."
    
    local times=()
    for i in $(seq 1 $iterations); do
        local start=$(date +%s%3N)
        if curl -s -f -o /dev/null "$url" 2>/dev/null; then
            local end=$(date +%s%3N)
            local duration=$((end - start))
            times+=("$duration")
            echo -n "."
        else
            echo -n "x"
        fi
    done
    echo ""
    
    # Calculate statistics
    if [ ${#times[@]} -gt 0 ]; then
        local sorted=($(printf '%s\n' "${times[@]}" | sort -n))
        local p50_index=$(( ${#sorted[@]} * 50 / 100 ))
        local p95_index=$(( ${#sorted[@]} * 95 / 100 ))
        local p99_index=$(( ${#sorted[@]} * 99 / 100 ))
        
        local p50=${sorted[$p50_index]}
        local p95=${sorted[$p95_index]}
        local p99=${sorted[$p99_index]}
        
        echo "  p50: ${p50}ms"
        echo "  p95: ${p95}ms"
        echo "  p99: ${p99}ms"
        
        # Check against SLO
        local target=$3
        if [ $p95 -lt $target ]; then
            echo "  ✅ p95 within SLO (<${target}ms)"
        else
            echo "  ❌ p95 exceeds SLO (>=${target}ms)"
        fi
    else
        echo "  ❌ All requests failed"
    fi
}

echo "Checking service availability..."
check_service "http://localhost:4001/health" "Voice Service" || true
check_service "http://localhost:4002/health" "Reasoning Gateway" || true
check_service "http://localhost:5173/" "Frontend" || true

echo ""
echo "=== Latency Measurements ==="

# Measure latencies (only if services are up)
if check_service "http://localhost:4001/health" "Voice Service" 2>/dev/null; then
    measure_latency "http://localhost:4001/health" "Voice Service Health" 250
fi

if check_service "http://localhost:4002/health" "Reasoning Gateway" 2>/dev/null; then
    measure_latency "http://localhost:4002/health" "Reasoning Gateway Health" 250
fi

echo ""
echo "✅ Latency probe complete"
echo "Note: For production measurements, run with services under load"
