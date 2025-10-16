### LightSpeed Status (CORRECTED)

**Current State:** LIVE but OAuth blocked

- **Integration File:** `automation/data-pipelines/lightspeed_ingest.ts`
- **Status:** Returns 401 (awaiting KAJA OAuth approval)
- **Playbook:** `docs/Lightspeed_Migration_Playbook_UNF.md` (complete migration plan exists)
- **Strategy:** Square → LightSpeed migration
  - Dual-write during transition (max 30 days)
  - Export catalog/customers from Square
  - Import to LightSpeed
  - Switch checkout to LightSpeed
  - Sunset Square
