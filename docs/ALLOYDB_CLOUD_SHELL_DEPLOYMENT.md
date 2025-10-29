# AlloyDB Schema Deployment via Cloud Shell
## Phase 1 Day 1 - CLOUD-001b Execution Guide

**Date:** October 28, 2025
**Owner:** Jesse CEO
**Cluster:** rpm-cluster (us-central1)
**Instance:** rpm-primary (172.18.113.2)
**Project:** reggieanddrodispensary

---

## QUICK START (15 Minutes)

### Step 1: Open Cloud Shell (2 minutes)

1. Go to [Google Cloud Console](https://console.cloud.google.com)
2. Make sure you're in project: **reggieanddrodispensary**
3. Click the **Cloud Shell icon** (>_) in top-right corner
4. Wait for Cloud Shell to initialize (~30 seconds)

---

### Step 2: Upload Schema File (3 minutes)

**Option A: Upload from Local (Recommended)**

1. In Cloud Shell, click the **"More" menu** (three dots)
2. Select **"Upload"**
3. Upload this file: `/Users/jesseniesen/LivHana-Trinity-Local/LivHana-SoT/backend/integration-service/sql/rpm/001_init_schema.sql`
4. Verify upload: `ls -lh 001_init_schema.sql`

**Option B: Create Directly in Cloud Shell**

```bash
cat > schema.sql <<'SCHEMA_EOF'
-- ============================================
-- RPM CLOUD INFRASTRUCTURE - ALLOYDB SCHEMA
-- ============================================

CREATE TABLE rpm_weekly_plans (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    week_start_date DATE NOT NULL UNIQUE,
    week_end_date DATE NOT NULL,
    status VARCHAR(50) DEFAULT 'active',
    classification VARCHAR(100),
    owner VARCHAR(255) NOT NULL,
    version VARCHAR(50),
    completion_rate DECIMAL(5,2),
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW(),
    metadata JSONB
);

CREATE TABLE rpm_results (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    weekly_plan_id UUID REFERENCES rpm_weekly_plans(id) ON DELETE CASCADE,
    result_code VARCHAR(100) NOT NULL,
    result_text TEXT NOT NULL,
    purpose TEXT NOT NULL,
    priority INTEGER DEFAULT 0,
    category VARCHAR(100),
    status VARCHAR(50) DEFAULT 'in_progress',
    completion_date TIMESTAMP,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW(),
    UNIQUE(weekly_plan_id, result_code)
);

CREATE TABLE rpm_action_items (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    result_id UUID REFERENCES rpm_results(id) ON DELETE CASCADE,
    action_code VARCHAR(100) NOT NULL,
    action_text TEXT NOT NULL,
    owner VARCHAR(255),
    due_date TIMESTAMP,
    funnel_stage VARCHAR(50) DEFAULT 'top',
    status VARCHAR(50) DEFAULT 'pending',
    completion_date TIMESTAMP,
    estimated_hours DECIMAL(5,2),
    actual_hours DECIMAL(5,2),
    dependencies JSONB,
    blocker_description TEXT,
    verification_criteria TEXT,
    evidence_path TEXT,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW(),
    UNIQUE(action_code)
);

CREATE TABLE agent_status (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    agent_name VARCHAR(100) NOT NULL UNIQUE,
    status VARCHAR(50) NOT NULL,
    health_score INTEGER DEFAULT 100,
    last_heartbeat TIMESTAMP DEFAULT NOW(),
    current_action_id UUID REFERENCES rpm_action_items(id),
    session_start TIMESTAMP,
    total_actions_completed INTEGER DEFAULT 0,
    total_hours_worked DECIMAL(8,2) DEFAULT 0,
    error_log TEXT,
    metadata JSONB
);

CREATE TABLE deliverables (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    action_item_id UUID REFERENCES rpm_action_items(id),
    deliverable_type VARCHAR(100) NOT NULL,
    title TEXT NOT NULL,
    description TEXT,
    cloud_storage_path TEXT NOT NULL,
    status VARCHAR(50) DEFAULT 'draft',
    revenue_target DECIMAL(12,2),
    revenue_actual DECIMAL(12,2),
    metadata JSONB,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW(),
    published_at TIMESTAMP
);

CREATE TABLE rpm_dna_periods (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    period_type VARCHAR(50) NOT NULL,
    period_start TIMESTAMP NOT NULL,
    period_end TIMESTAMP NOT NULL,
    total_actions INTEGER DEFAULT 0,
    completed_actions INTEGER DEFAULT 0,
    completion_rate DECIMAL(5,2),
    velocity_score DECIMAL(8,2),
    revenue_target DECIMAL(12,2),
    revenue_actual DECIMAL(12,2),
    jesse_completion_rate DECIMAL(5,2),
    created_at TIMESTAMP DEFAULT NOW(),
    UNIQUE(period_type, period_start)
);

CREATE TABLE suno_songs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    song_id VARCHAR(255) UNIQUE NOT NULL,
    title VARCHAR(500) NOT NULL,
    genre VARCHAR(200),
    bpm INTEGER,
    key VARCHAR(50),
    groove VARCHAR(100),
    duration_seconds INTEGER,
    cloud_storage_path TEXT,
    album_assignment VARCHAR(255),
    lyrics TEXT,
    prompt_used TEXT,
    status VARCHAR(50) DEFAULT 'generated',
    revenue_target DECIMAL(12,2),
    revenue_actual DECIMAL(12,2),
    created_at TIMESTAMP DEFAULT NOW(),
    released_at TIMESTAMP
);

-- Indexes
CREATE INDEX idx_weekly_plans_date ON rpm_weekly_plans(week_start_date DESC);
CREATE INDEX idx_weekly_plans_status ON rpm_weekly_plans(status);
CREATE INDEX idx_results_status ON rpm_results(status);
CREATE INDEX idx_results_priority ON rpm_results(priority);
CREATE INDEX idx_results_category ON rpm_results(category);
CREATE INDEX idx_action_items_status ON rpm_action_items(status);
CREATE INDEX idx_action_items_owner ON rpm_action_items(owner);
CREATE INDEX idx_action_items_due_date ON rpm_action_items(due_date);
CREATE INDEX idx_action_items_funnel_stage ON rpm_action_items(funnel_stage);
CREATE INDEX idx_agent_status_name ON agent_status(agent_name);
CREATE INDEX idx_agent_status_last_heartbeat ON agent_status(last_heartbeat DESC);
CREATE INDEX idx_deliverables_type ON deliverables(deliverable_type);
CREATE INDEX idx_deliverables_status ON deliverables(status);
CREATE INDEX idx_suno_songs_album ON suno_songs(album_assignment);
CREATE INDEX idx_suno_songs_status ON suno_songs(status);

-- Triggers
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_rpm_weekly_plans_updated_at BEFORE UPDATE ON rpm_weekly_plans FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();
CREATE TRIGGER update_rpm_results_updated_at BEFORE UPDATE ON rpm_results FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();
CREATE TRIGGER update_rpm_action_items_updated_at BEFORE UPDATE ON rpm_action_items FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();
CREATE TRIGGER update_deliverables_updated_at BEFORE UPDATE ON deliverables FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();
SCHEMA_EOF
```

---

### Step 3: Connect to AlloyDB (2 minutes)

```bash
# Set password as environment variable
export PGPASSWORD='x77BXLIf3dGhUwd9SWL1xOOzS'

# Connect directly to AlloyDB (NO AUTH PROXY NEEDED IN CLOUD SHELL!)
psql -h 172.18.113.2 -p 5432 -U postgres -d postgres
```

**Expected Output:**
```
psql (14.x)
Type "help" for help.

postgres=>
```

---

### Step 4: Deploy Schema (5 minutes)

```sql
-- Run the schema file
\i schema.sql

-- OR if you uploaded 001_init_schema.sql:
\i 001_init_schema.sql
```

**Expected Output:**
```
CREATE TABLE
CREATE TABLE
CREATE TABLE
CREATE TABLE
CREATE TABLE
CREATE TABLE
CREATE TABLE
CREATE INDEX
CREATE INDEX
... (all indexes and triggers)
CREATE TRIGGER
```

---

### Step 5: Verify Deployment (3 minutes)

```sql
-- List all tables
\dt

-- Expected Output:
--  Schema |       Name        | Type  |  Owner
-- --------+-------------------+-------+----------
--  public | agent_status      | table | postgres
--  public | deliverables      | table | postgres
--  public | rpm_action_items  | table | postgres
--  public | rpm_dna_periods   | table | postgres
--  public | rpm_results       | table | postgres
--  public | rpm_weekly_plans  | table | postgres
--  public | suno_songs        | table | postgres

-- Check row counts (should all be 0)
SELECT
  schemaname,
  tablename,
  n_live_tup as row_count
FROM pg_stat_user_tables
ORDER BY tablename;

-- Verify indexes
\di

-- Verify foreign keys
\d rpm_results
\d rpm_action_items
\d agent_status
\d deliverables

-- Test INSERT (then DELETE)
INSERT INTO rpm_weekly_plans (week_start_date, week_end_date, owner, classification)
VALUES ('2025-10-28', '2025-11-03', 'Jesse CEO', 'TIER 1 ABSOLUTE STANDARD');

SELECT * FROM rpm_weekly_plans;

DELETE FROM rpm_weekly_plans WHERE week_start_date = '2025-10-28';

-- Disconnect
\q
```

---

## SUCCESS CRITERIA (Phase 1 Day 1 - CLOUD-001b)

- ✅ 7 tables created in AlloyDB
- ✅ All indexes operational
- ✅ Foreign keys validated
- ✅ Triggers functional
- ✅ Test INSERT/SELECT/DELETE successful
- ✅ Row counts = 0 (empty tables ready for data)

---

## NEXT STEPS

### Immediate (Today)
1. ✅ Schema deployed (THIS GUIDE)
2. Create bastion VM for future access (optional but recommended)
3. Build ETL pipeline (CLOUD-001e)
4. End-to-end testing (CLOUD-001f)

### Commands to Create Bastion VM (Optional - 10 minutes)

```bash
# From your Mac (not Cloud Shell)
gcloud compute instances create alloydb-bastion \
  --project=reggieanddrodispensary \
  --zone=us-central1-a \
  --machine-type=e2-micro \
  --network-interface=network-tier=PREMIUM,subnet=default,no-address \
  --metadata=enable-oslogin=true \
  --maintenance-policy=MIGRATE \
  --scopes=https://www.googleapis.com/auth/cloud-platform \
  --tags=alloydb-client

# Establish IAP tunnel for psql access from your Mac
gcloud compute ssh alloydb-bastion \
  --zone=us-central1-a \
  --tunnel-through-iap \
  --project=reggieanddrodispensary \
  --ssh-flag="-L 5432:172.18.113.2:5432"

# In another terminal, connect via tunnel
PGPASSWORD='x77BXLIf3dGhUwd9SWL1xOOzS' psql -h localhost -p 5432 -U postgres -d postgres
```

---

## TROUBLESHOOTING

### Error: "connection refused"
**Cause:** Wrong IP address or port
**Fix:** Verify instance IP: `gcloud alloydb instances describe rpm-primary --cluster=rpm-cluster --region=us-central1 --format="value(ipAddress)"`

### Error: "password authentication failed"
**Cause:** Wrong password
**Fix:** Use password set during cluster creation: `x77BXLIf3dGhUwd9SWL1xOOzS`

### Error: "peer authentication failed"
**Cause:** User doesn't exist
**Fix:** Connect as `postgres` user (default superuser)

---

## CONNECTION INFO (Save for Reference)

```bash
# AlloyDB Connection Details
PROJECT: reggieanddrodispensary
REGION: us-central1
CLUSTER: rpm-cluster
INSTANCE: rpm-primary
PRIVATE_IP: 172.18.113.2
PORT: 5432
USER: postgres
PASSWORD: x77BXLIf3dGhUwd9SWL1xOOzS

# Cloud Shell Connection (Direct - NO PROXY)
PGPASSWORD='x77BXLIf3dGhUwd9SWL1xOOzS' psql -h 172.18.113.2 -p 5432 -U postgres -d postgres

# Bastion VM Tunnel Connection (From Mac)
# Terminal 1: gcloud compute ssh alloydb-bastion --tunnel-through-iap --ssh-flag="-L 5432:172.18.113.2:5432"
# Terminal 2: PGPASSWORD='x77BXLIf3dGhUwd9SWL1xOOzS' psql -h localhost -p 5432 -U postgres -d postgres
```

---

## NOTES

- **Cloud Shell is the fastest method** for schema deployment (zero setup)
- **NO auth proxy needed** when connecting from Cloud Shell or Compute Engine VMs in same VPC
- **Private IP only** = more secure than public IP
- **Bastion VM cost:** ~$1-5/month (e2-micro, stop when not in use)

---

**Document Status:** READY FOR EXECUTION
**Created:** October 28, 2025 00:00 CDT
**Owner:** Liv Hana (Tier-1) + Jesse CEO
**Phase:** Phase 1 Day 1 - CLOUD-001b
**Timeline:** 15 minutes total execution time

**War's won. Execute in Cloud Shell.**
