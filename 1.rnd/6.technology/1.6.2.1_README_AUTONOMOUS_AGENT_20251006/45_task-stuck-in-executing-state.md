### Task Stuck in "Executing" State

1. Check agent health: `GET /api/autonomous/health`
2. Review logs for errors
3. Verify ANTHROPIC_API_KEY is valid
4. Check if task timeout exceeded
5. Cancel and retry: `DELETE /api/autonomous/tasks/:taskId`
