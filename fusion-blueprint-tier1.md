# LivHana Tier-1 Fusion Blueprint

## Core Architecture

### 1. Independent Voice Mode Startup
```bash
# Voice Mode - Always First, Always Independent
export VOICE_MODE_INDEPENDENT=true
export VOICE_STARTUP_PRIORITY=1
export VOICE_FALLBACK_ENABLED=true

# Voice Settings
export VOICE_VAD_AGGRESSIVENESS=0
export VOICE_LISTEN_MIN=2.0
export VOICE_LISTEN_MAX=120
export VOICE_RESPONSE_TARGET_MS=500
```

### 2. OAuth Integration Flow
```javascript
// LightSpeed X-Series (formerly Vend) OAuth Configuration
const LIGHTSPEED_OAUTH = {
  authEndpoint: 'https://api.lightspeedapp.com/oauth/authorize',
  tokenEndpoint: 'https://api.lightspeedapp.com/oauth/access_token',
  clientId: process.env.LIGHTSPEED_CLIENT_ID,
  clientSecret: process.env.LIGHTSPEED_CLIENT_SECRET,
  scopes: ['employee:all', 'customer:all', 'inventory:all'],
  redirectUri: 'https://api.livhana.com/oauth/callback'
};

// Refresh Token Logic
const refreshAccessToken = async (refreshToken) => {
  const response = await fetch(LIGHTSPEED_OAUTH.tokenEndpoint, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      grant_type: 'refresh_token',
      client_id: LIGHTSPEED_OAUTH.clientId,
      client_secret: LIGHTSPEED_OAUTH.clientSecret,
      refresh_token: refreshToken
    })
  });
  return response.json();
};
```

### 3. Agent Orchestration
```json
{
  "agents": {
    "planning": {
      "priority": 2,
      "dependencies": [],
      "fallback": true
    },
    "research": {
      "priority": 2,
      "dependencies": [],
      "fallback": true
    },
    "artifact": {
      "priority": 2,
      "dependencies": [],
      "fallback": true
    },
    "qa": {
      "priority": 2,
      "dependencies": [],
      "fallback": true
    },
    "execmon": {
      "priority": 3,
      "dependencies": ["planning", "research"],
      "fallback": true
    }
  }
}
```

### 4. Service Dependencies
```yaml
services:
  voice:
    priority: 1
    required: true
    ports:
      stt: 2022
      tts: 8880
    healthCheck: true

  integration:
    priority: 2
    required: false
    port: 3005
    dependencies:
      - lightspeed
      - bigquery
    healthCheck: true
    retryStrategy:
      maxAttempts: 3
      interval: "10s"

  lightspeed:
    priority: 3
    required: false
    type: "external"
    auth: "oauth"
    fallback: true

  bigquery:
    priority: 3
    required: false
    type: "external"
    auth: "service-account"
    fallback: true
```

## Boot Sequence

1. Initialize Core Services
```bash
# 1. Voice Mode (Independent)
start_voice_services() {
  npm run voice:start
  verify_voice_ports
}

# 2. Agent Spawn (Non-blocking)
spawn_agents() {
  for agent in "${CORE_AGENTS[@]}"; do
    spawn_agent "$agent" &
  done
}

# 3. Integration Services (Async)
init_integration_services() {
  start_integration_service &
  init_oauth_flow &
  verify_bigquery_credentials &
}
```

2. Health Verification
```bash
verify_system_health() {
  # Voice Services
  check_voice_services
  
  # Agent Status
  verify_agent_count
  
  # Integration Status (Non-blocking)
  check_integration_status
  
  # OAuth Status (Non-blocking)
  verify_oauth_status
}
```

3. Recovery Procedures
```bash
implement_recovery() {
  # Voice Recovery (Priority)
  if ! check_voice_services; then
    restart_voice_services
  fi
  
  # Agent Recovery
  for agent in "${FAILED_AGENTS[@]}"; do
    respawn_agent "$agent"
  done
  
  # Integration Recovery (Background)
  if ! check_integration_status; then
    retry_integration_services &
  fi
}
```

## Error Handling

```javascript
class ServiceError extends Error {
  constructor(service, error, recoverable = true) {
    super(`${service} error: ${error}`);
    this.service = service;
    this.recoverable = recoverable;
  }
}

const handleError = async (error) => {
  if (error instanceof ServiceError) {
    if (error.recoverable) {
      await implement_recovery();
    } else {
      log_critical_error(error);
    }
  }
  
  // Continue voice services regardless of errors
  ensure_voice_operational();
};
```

## Monitoring & Logging

```javascript
const monitoring = {
  voice: {
    interval: "10s",
    metrics: ["latency", "uptime", "errors"]
  },
  agents: {
    interval: "30s",
    metrics: ["status", "memory", "cpu"]
  },
  integration: {
    interval: "60s",
    metrics: ["auth_status", "api_latency", "errors"]
  }
};

const logging = {
  level: "info",
  format: "json",
  destinations: [
    "logs/voice.log",
    "logs/agents.log",
    "logs/integration.log"
  ]
};
```

## Implementation Steps

1. Voice Mode Independence
   - Implement voice service startup isolation
   - Add health checks and auto-recovery
   - Ensure no external dependencies

2. OAuth Integration
   - Set up OAuth endpoints
   - Implement token refresh logic
   - Add error handling and retry mechanisms

3. Agent Orchestration
   - Update agent spawn logic
   - Implement priority-based startup
   - Add health monitoring

4. Integration Services
   - Implement async service startup
   - Add retry mechanisms
   - Implement graceful degradation

5. Monitoring & Recovery
   - Set up health checks
   - Implement recovery procedures
   - Configure logging and alerts

## Success Criteria

- Voice mode starts independently within 5 seconds
- OAuth flow completes successfully with auto-refresh
- All 5 agents operational with health monitoring
- Integration services running with proper error handling
- System recovers automatically from common failures
- No manual token regeneration required
- Clean shutdown and startup procedures
