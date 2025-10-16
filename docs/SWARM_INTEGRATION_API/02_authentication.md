## Authentication

All endpoints (except `/health`) require authentication via headers:

```
X-API-Key: <your-api-key>
X-Agent-Id: <agent-identifier>
```

**Agent IDs:**
- `claude-code-cli` - Claude Code CLI terminal agent
- `cursor-ide` - Cursor IDE coding agent
- `replit-agent` - Replit cloud execution agent
- `orchestrator` - External orchestrator/user
