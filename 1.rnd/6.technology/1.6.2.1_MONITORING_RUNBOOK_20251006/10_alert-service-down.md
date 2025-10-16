#### Alert: Service Down

**Trigger**: Health check endpoint returns 503 or is unreachable

**Impact**: Service is unavailable to users

**Response**:

1. Check service logs: `docker logs <container_name>`
2. Check if process is running: `pm2 list` or `systemctl status <service>`
3. Check resource usage: `htop` or `docker stats`
4. Restart service if crashed: `pm2 restart <service>` or `systemctl restart <service>`
5. Check recent deployments - rollback if necessary
6. Investigate root cause in logs and monitoring

**Escalation**: If not resolved in 15 minutes, escalate to DevOps lead
