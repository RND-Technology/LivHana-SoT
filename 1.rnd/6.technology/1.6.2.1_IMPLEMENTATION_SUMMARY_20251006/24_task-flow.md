### Task Flow

```
User Request → Admin Auth → Create Task → Queue Execution
     ↓
Async Processing:
  1. Analyze (Claude Extended Thinking)
  2. Plan (with rollback strategy)
  3. Execute (step-by-step)
  4. Verify (tests + criteria)
  5. Learn (BigQuery storage)
     ↓
[Optional] → Approval Required → Human Decision → Deploy/Rollback
     ↓
Complete → Learnings Stored → Available for Future Tasks
```
