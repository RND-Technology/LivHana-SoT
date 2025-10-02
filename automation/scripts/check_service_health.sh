#!/usr/bin/env bash
set -euo pipefail

source "$(dirname "$0")/common.sh"

log_info "Checking service health"
if command -v gcloud >/dev/null 2>&1; then
  log_info "gcloud detected – skipping API calls (requires authenticated session)"
else
  log_warn "gcloud CLI not found – running manifest level checks only"
fi

for manifest in "$ROOT_DIR"/cloud-run/*.yaml; do
  [ -f "$manifest" ] || continue
  service_name="$(basename "$manifest" .yaml)"
  log_info "Service manifest detected: $service_name"
  if ! grep -q 'livenessProbe' "$manifest"; then
    log_warn "No livenessProbe configured in $service_name"
  fi
  if ! grep -q 'readinessProbe' "$manifest"; then
    log_warn "No readinessProbe configured in $service_name"
  fi
done


# Helper: mint short-lived JWTs for service health
SESSION_JWT_SECRET=${SESSION_JWT_SECRET:-local-secret}
VOICE_JWT_SECRET=${VOICE_JWT_SECRET:-$SESSION_JWT_SECRET}
VOICE_JWT_AUDIENCE=${VOICE_JWT_AUDIENCE:-$JWT_AUDIENCE}
VOICE_JWT_ISSUER=${VOICE_JWT_ISSUER:-$JWT_ISSUER}
REASONING_JWT_SECRET=${REASONING_JWT_SECRET:-$SESSION_JWT_SECRET}
REASONING_JWT_AUDIENCE=${REASONING_JWT_AUDIENCE:-$JWT_AUDIENCE}
REASONING_JWT_ISSUER=${REASONING_JWT_ISSUER:-$JWT_ISSUER}
JWT_AUDIENCE=${JWT_AUDIENCE:-livhana-local}
JWT_ISSUER=${JWT_ISSUER:-livhana}
JWT_ALGORITHMS=${JWT_ALGORITHMS:-HS256}

mint_health_token() {
  local secret="$1"
  SESSION_TOKEN_SECRET="$secret" node --input-type=module <<'NODE'
import jwt from 'jsonwebtoken';
const secret = process.env.SESSION_TOKEN_SECRET || 'local-secret';
const audience = process.env.JWT_AUDIENCE_OVERRIDE || process.env.JWT_AUDIENCE || 'livhana-local';
const issuer = process.env.JWT_ISSUER_OVERRIDE || process.env.JWT_ISSUER || 'livhana';
const algorithm = (process.env.JWT_ALGORITHMS || 'HS256').split(',')[0].trim();
const token = jwt.sign({ sub: 'healthcheck', aud: audience, iss: issuer, scope: 'health:read' }, secret, { algorithm, expiresIn: '5m' });
console.log(token);
NODE
}

VOICE_HEALTH_JWT=$(JWT_AUDIENCE_OVERRIDE="$VOICE_JWT_AUDIENCE" JWT_ISSUER_OVERRIDE="$VOICE_JWT_ISSUER" mint_health_token "$VOICE_JWT_SECRET")
REASONING_HEALTH_JWT=$(JWT_AUDIENCE_OVERRIDE="$REASONING_JWT_AUDIENCE" JWT_ISSUER_OVERRIDE="$REASONING_JWT_ISSUER" mint_health_token "$REASONING_JWT_SECRET")
VOICE_AUTH_HEADER="Authorization: Bearer ${VOICE_HEALTH_JWT}"
REASONING_AUTH_HEADER="Authorization: Bearer ${REASONING_HEALTH_JWT}"

log_info "Checking local service health endpoints"

services=(
  "voice-service:http://localhost:4001/healthz"
  "reasoning-gateway:http://localhost:4002/healthz"
  "voice-mode:http://localhost:4001/health/voice-mode"
)

queue_checks=(
  "voice-reasoning-queue:http://localhost:4002/api/reasoning/result/test"
)

for entry in "${services[@]}"; do
  name="${entry%%:*}"
  url="${entry#*:}"
  header="$VOICE_AUTH_HEADER"
  if [[ "$name" == "reasoning-gateway" ]]; then
    header="$REASONING_AUTH_HEADER"
  fi
  if curl --fail --silent --max-time 5 -H "$header" "$url" >/dev/null; then
    log_info "Service $name healthy"
  else
    log_warn "Service $name health check failed"
  fi
done

log_info "Checking reasoning queue endpoints"
for entry in "${queue_checks[@]}"; do
  name="${entry%%:*}"
  url="${entry#*:}"
  if curl --silent --max-time 5 -H "$REASONING_AUTH_HEADER" "$url" | grep -q 'Job not found'; then
    log_info "Queue endpoint $name responding"
  else
    log_warn "Queue endpoint $name did not return expected response"
  fi
done

log_info "Service health check finished"

# Last updated: 2025-10-02

# Last optimized: 2025-10-02
