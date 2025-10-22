# Mobile Control for Liv Hana

## Overview

This document describes the mobile control solutions for managing Liv Hana's voice mode and services remotely.

## Primary Solution: Slack Bridge

### Architecture

- **Slack App**: Creates `/agent` slash commands
- **Webhook**: Handles Slack events in `backend/integration-service/src/slack/bridge.ts`
- **Security**: JWT auth, rate limiting, signature verification
- **Exposure**: Cloudflare Tunnel or Tailscale Funnel (no inbound ports)

### Available Commands

```
/agent start-voice    # Start voice session
/agent silence        # Pause voice output
/agent resume         # Resume voice output
/agent status         # Check system status
/agent logs           # View recent logs
```

### Setup

1. Create Slack App at https://api.slack.com/apps
2. Configure slash commands: `/agent`
3. Enable Interactivity: Add webhook URL
4. Deploy webhook to `backend/integration-service/src/slack/bridge.ts`
5. Expose via Cloudflare Tunnel or Tailscale Funnel

### Guardrails

- JWT verification on all requests
- Rate limiting: 10 requests/minute
- Message filtering: No PII in logs
- Audit trail: All commands logged to BigQuery

## Backup Solution: Tailscale + SSH

### Architecture

- **Tailscale**: VPN on Mac and iPhone
- **SSH**: Secure shell access from iPhone
- **tmux**: Persistent session management
- **Helpers**: `vmute`/`vresume` commands

### Setup

1. Install Tailscale on Mac
2. Install Tailscale on iPhone (Blink/Termius app)
3. Connect both devices to Tailscale network
4. SSH from iPhone to Mac: `ssh <tailscale-ip>`
5. Create tmux session: `tmux new -s voice`
6. Run voice commands in tmux session

### Helper Commands

Create `~/.zshrc` aliases:

```bash
alias vmute='echo "silence" > /tmp/voice_command'
alias vresume='echo "resume" > /tmp/voice_command'
```

### Usage

From iPhone:
1. Open Blink/Termius
2. Connect to Mac via Tailscale IP
3. Attach to tmux: `tmux attach -t voice`
4. Run commands: `vmute`, `vresume`, etc.

## Verification

### Slack Bridge
```bash
# Test from Slack
/agent status

# Check webhook logs
tail -f logs/slack-bridge.log
```

### Tailscale SSH
```bash
# From iPhone
ssh <tailscale-ip> 'tmux ls'

# Should show:
# voice: 1 windows (created <timestamp>)
```

## Rollback Plan

If mobile control fails:

1. **Fallback**: Use desktop access
2. **Emergency**: SSH via Tailscale directly
3. **Recovery**: Restart services via `START.sh`

## Security Notes

- Never expose ports directly to internet
- Always use tunnels (Cloudflare/Tailscale)
- JWT secrets managed via 1Password
- Rate limiting prevents abuse
- All commands logged for audit

## Troubleshooting

### Slack Bridge Not Responding
1. Check webhook URL is correct
2. Verify JWT secret is set
3. Check Slack signature verification
4. Review logs: `tail -f logs/slack-bridge.log`

### Tailscale SSH Not Working
1. Verify both devices connected to Tailscale
2. Check firewall rules
3. Test ping: `ping <tailscale-ip>`
4. Verify SSH key is authorized

### Commands Not Executing
1. Check Redis connectivity
2. Verify JWT auth is working
3. Review guardrail logs
4. Check service health: `curl http://localhost:3005/health`

