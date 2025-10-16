## FAQ

**Q: Can the agent modify any file in the system?**
A: No, file access is restricted to the project directory only.

**Q: What happens if a task fails?**
A: The agent automatically attempts rollback and provides a recovery plan.

**Q: Can I run multiple tasks simultaneously?**
A: Yes, up to MAX_CONCURRENT_TASKS (default: 5) can run in parallel.

**Q: How long are task results stored?**
A: Currently stored in memory. In production, implement Redis or database storage.

**Q: Can the agent access external APIs?**
A: Yes, if configured, it can make HTTP requests and query databases.

**Q: Is the learning data shared across instances?**
A: Yes, if BigQuery is enabled, learnings are shared across all instances.

**Q: Can I customize the approval workflow?**
A: Yes, implement custom approval logic in the approve endpoint handler.
