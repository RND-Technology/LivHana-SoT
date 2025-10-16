## Security Considerations

1. **Admin-Only Access**: All endpoints require admin role in JWT
2. **Human-in-the-Loop**: Use `requireApproval: true` for sensitive operations
3. **Rollback Support**: Emergency rollback available for all completed tasks
4. **Audit Trail**: All actions logged with user ID and timestamp
5. **Rate Limiting**: Consider implementing rate limits in production
6. **File Access**: Agent restricted to project directories
7. **Command Execution**: Bash commands run in sandboxed environment

---
