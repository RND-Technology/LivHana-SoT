#!/bin/bash
# Verify service health and ports
# Part of EA_PRECISION audit infrastructure
set -euo pipefail

echo "=== Service Health Verification ==="
echo "Date: $(date)"
echo ""

# Service definitions
declare -A SERVICES
SERVICES=(
    ["voice-service"]="http://localhost:4001/health"
    ["reasoning-gateway"]="http://localhost:4002/health"
    ["integration-service"]="http://localhost:3005/health"
    ["frontend"]="http://localhost:5173/"
)

declare -A PORTS
PORTS=(
    ["voice-service"]=4001
    ["reasoning-gateway"]=4002
    ["integration-service"]=3005
    ["frontend"]=5173
    ["redis"]=6379
)

# Check if port is listening
check_port() {
    local port=$1
    if command -v lsof >/dev/null 2>&1; then
        lsof -i ":$port" >/dev/null 2>&1
    elif command -v netstat >/dev/null 2>&1; then
        netstat -ln | grep ":$port " >/dev/null 2>&1
    elif command -v ss >/dev/null 2>&1; then
        ss -ln | grep ":$port " >/dev/null 2>&1
    else
        # Fallback: try to connect
        timeout 1 bash -c "cat < /dev/null > /dev/tcp/localhost/$port" 2>/dev/null
    fi
}

# Check service health
check_health() {
    local name=$1
    local url=$2
    
    echo -n "  $name: "
    
    if curl -s -f -m 5 "$url" > /dev/null 2>&1; then
        echo "✅ Healthy"
        return 0
    else
        echo "❌ Unhealthy or unreachable"
        return 1
    fi
}

echo "=== Port Check ==="
PORTS_OK=0
PORTS_TOTAL=${#PORTS[@]}

for service in "${!PORTS[@]}"; do
    port=${PORTS[$service]}
    echo -n "  $service (port $port): "
    
    if check_port "$port"; then
        echo "✅ Listening"
        ((PORTS_OK++))
    else
        echo "❌ Not listening"
    fi
done

echo ""
echo "=== Health Endpoint Check ==="
HEALTH_OK=0
HEALTH_TOTAL=${#SERVICES[@]}

for service in "${!SERVICES[@]}"; do
    url=${SERVICES[$service]}
    if check_health "$service" "$url"; then
        ((HEALTH_OK++))
    fi
done

echo ""
echo "=== Summary ==="
echo "Ports listening: $PORTS_OK/$PORTS_TOTAL"
echo "Health checks passing: $HEALTH_OK/$HEALTH_TOTAL"

if [ $PORTS_OK -eq $PORTS_TOTAL ] && [ $HEALTH_OK -eq $HEALTH_TOTAL ]; then
    echo "✅ All services operational"
    exit 0
else
    echo "❌ Some services are not operational"
    exit 1
fi
