### What This Guide CANNOT Execute (Without Translation) ⚠️

- **No Trinity awareness:** Guide assumes standalone Flask microservices, but Trinity uses:
  - `voice-service` (Cloud Run)
  - `reasoning-gateway` (Cloud Run)
  - `empire-cockpit` (frontend)
  - BigQuery (analytics, not PostgreSQL for transactional data)
- **No GCP deployment patterns:** Guide references Heroku/Docker, not Cloud Run with VPC connectors + Redis
- **No existing codebase integration:** Guide generates new code, but Trinity backend already exists at `/backend/` and `/empire/`

---
