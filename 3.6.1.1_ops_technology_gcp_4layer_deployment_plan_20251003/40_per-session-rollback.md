### Per-Session Rollback

- **Session 1:** Delete Cloud Run services, revert DNS
- **Session 2:** Stop Cloud SQL, delete Cloud Run services
- **Session 3:** Delete AI services, revert integrations
- **Session 4:** Revert domain routing
