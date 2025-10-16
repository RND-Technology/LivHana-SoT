### 1. Approval Workflow

- All proposals are stored in Redis
- Status tracking: pending → approved/rejected → implemented/failed
- Approval required for:
  - Critical changes
  - Production deployments
  - Major refactorings
  - New features
