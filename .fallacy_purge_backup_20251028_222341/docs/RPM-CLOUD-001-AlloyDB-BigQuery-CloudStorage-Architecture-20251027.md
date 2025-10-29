# RPM CLOUD INFRASTRUCTURE ARCHITECTURE
## AlloyDB + BigQuery + Cloud Storage + Heritage.com Cockpit
### ASAP Execution Plan - Jesse CEO Directive

**CLASSIFICATION:** TIER 1 ABSOLUTE STANDARD
**OWNER:** Jesse Niesen (CEO)
**VERSION:** 1.0
**DATE:** Sunday, October 27, 2025
**STATUS:** IMMEDIATE PRIORITY - ASAP EXECUTION

---

## EXECUTIVE SUMMARY

**Mission:** Move RPM Weekly Planning Full Funnel Visioneering Workflow to cloud infrastructure (AlloyDB + BigQuery + Cloud Storage) and wire into Heritage.com VIP Cockpit for real-time visibility.

**Timeline:** 8-13 days ASAP execution (4 phases)
**Current State:** RPM plans in local markdown files, agents operational, boot system stable
**Target State:** Cloud-native RPM system with real-time VIP dashboard

**Strategic Value:**
- **Visibility:** VIPs see real-time RPM status, action progress, revenue targets vs actuals
- **Intelligence:** BigQuery analytics on completion rates, velocity trends, bottleneck identification
- **Scalability:** Cloud infrastructure supports team growth, multi-project coordination
- **Automation:** Automated sync from local → cloud → dashboard (zero manual work)

---

## 1. CLOUD ARCHITECTURE DESIGN

### 1.1 AlloyDB (PostgreSQL-compatible Transactional Database)

**Purpose:** Store structured RPM data for real-time queries and updates

#### **Schema Design:**

```sql
-- ============================================
-- RPM WEEKLY PLANS TABLE
-- ============================================
CREATE TABLE rpm_weekly_plans (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    week_start_date DATE NOT NULL UNIQUE,
    week_end_date DATE NOT NULL,
    status VARCHAR(50) DEFAULT 'active', -- active, completed, archived
    classification VARCHAR(100), -- e.g. "TIER 1 ABSOLUTE STANDARD"
    owner VARCHAR(255) NOT NULL, -- Jesse CEO, team member
    version VARCHAR(50),
    completion_rate DECIMAL(5,2), -- percentage of actions completed
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW(),
    metadata JSONB -- flexible for custom fields
);

-- ============================================
-- RESULTS (What we're committed to achieving)
-- ============================================
CREATE TABLE rpm_results (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    weekly_plan_id UUID REFERENCES rpm_weekly_plans(id) ON DELETE CASCADE,
    result_code VARCHAR(100) NOT NULL, -- R1, R2, R3, etc.
    result_text TEXT NOT NULL,
    purpose TEXT NOT NULL, -- WHY this matters (compelling reason)
    priority INTEGER DEFAULT 0, -- 1=highest, 2=high, 3=medium, etc.
    category VARCHAR(100), -- ARCH, DEV, DOCS, PLAN, etc.
    status VARCHAR(50) DEFAULT 'in_progress', -- not_started, in_progress, blocked, completed
    completion_date TIMESTAMP,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW(),
    UNIQUE(weekly_plan_id, result_code)
);

-- ============================================
-- ACTION ITEMS (Massive Action Plan)
-- ============================================
CREATE TABLE rpm_action_items (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    result_id UUID REFERENCES rpm_results(id) ON DELETE CASCADE,
    action_code VARCHAR(100) NOT NULL, -- ARCH-BOOT-001a, etc.
    action_text TEXT NOT NULL,
    owner VARCHAR(255), -- Agent name or "Jesse"
    due_date TIMESTAMP,
    funnel_stage VARCHAR(50) DEFAULT 'top', -- top, middle, bottom
    status VARCHAR(50) DEFAULT 'pending', -- pending, in_progress, blocked, completed
    completion_date TIMESTAMP,
    estimated_hours DECIMAL(5,2),
    actual_hours DECIMAL(5,2),
    dependencies JSONB, -- array of action_code strings
    blocker_description TEXT,
    verification_criteria TEXT,
    evidence_path TEXT, -- cloud storage path to evidence
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW(),
    UNIQUE(action_code)
);

-- ============================================
-- AGENT STATUS & HEALTH
-- ============================================
CREATE TABLE agent_status (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    agent_name VARCHAR(100) NOT NULL UNIQUE,
    status VARCHAR(50) NOT NULL, -- active, idle, error, offline
    health_score INTEGER DEFAULT 100, -- 0-100
    last_heartbeat TIMESTAMP DEFAULT NOW(),
    current_action_id UUID REFERENCES rpm_action_items(id),
    session_start TIMESTAMP,
    total_actions_completed INTEGER DEFAULT 0,
    total_hours_worked DECIMAL(8,2) DEFAULT 0,
    error_log TEXT,
    metadata JSONB -- cpu, memory, process_id, etc.
);

-- ============================================
-- DELIVERABLES (Songs, code, docs, etc.)
-- ============================================
CREATE TABLE deliverables (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    action_item_id UUID REFERENCES rpm_action_items(id),
    deliverable_type VARCHAR(100) NOT NULL, -- song, code, document, album, video
    title TEXT NOT NULL,
    description TEXT,
    cloud_storage_path TEXT NOT NULL, -- gs://bucket/path/to/file
    status VARCHAR(50) DEFAULT 'draft', -- draft, review, approved, published
    revenue_target DECIMAL(12,2),
    revenue_actual DECIMAL(12,2),
    metadata JSONB, -- genre, duration, file_size, artist, etc.
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW(),
    published_at TIMESTAMP
);

-- ============================================
-- RPM DNA PERIODS (Time periodization tracking)
-- ============================================
CREATE TABLE rpm_dna_periods (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    period_type VARCHAR(50) NOT NULL, -- daily, weekly, monthly, quarterly
    period_start TIMESTAMP NOT NULL,
    period_end TIMESTAMP NOT NULL,
    total_actions INTEGER DEFAULT 0,
    completed_actions INTEGER DEFAULT 0,
    completion_rate DECIMAL(5,2), -- percentage
    velocity_score DECIMAL(8,2), -- actions per day
    revenue_target DECIMAL(12,2),
    revenue_actual DECIMAL(12,2),
    jesse_completion_rate DECIMAL(5,2), -- Jesse's personal completion rate
    created_at TIMESTAMP DEFAULT NOW(),
    UNIQUE(period_type, period_start)
);

-- ============================================
-- SUNO SONG CATALOG (386+ songs)
-- ============================================
CREATE TABLE suno_songs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    song_id VARCHAR(255) UNIQUE NOT NULL, -- Suno generated ID
    title VARCHAR(500) NOT NULL,
    genre VARCHAR(200),
    bpm INTEGER,
    key VARCHAR(50),
    groove VARCHAR(100),
    duration_seconds INTEGER,
    cloud_storage_path TEXT, -- gs://livhana-rpm-datalake/deliverables/songs/raw/
    album_assignment VARCHAR(255), -- "21 album release", etc.
    lyrics TEXT,
    prompt_used TEXT,
    status VARCHAR(50) DEFAULT 'generated', -- generated, reviewed, mastered, released
    revenue_target DECIMAL(12,2),
    revenue_actual DECIMAL(12,2),
    created_at TIMESTAMP DEFAULT NOW(),
    released_at TIMESTAMP
);

-- ============================================
-- INDEXES FOR PERFORMANCE
-- ============================================
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
```

---

### 1.2 BigQuery (Analytics Data Warehouse)

**Purpose:** Historical analytics, trend analysis, business intelligence

#### **Dataset Structure:**

```sql
-- ============================================
-- DATASET: rpm_analytics
-- ============================================

-- TABLE: action_completion_metrics
-- PURPOSE: Track action completion rates by owner, funnel stage, time period
CREATE TABLE rpm_analytics.action_completion_metrics (
    date DATE,
    owner STRING,
    funnel_stage STRING,
    total_actions INT64,
    completed_actions INT64,
    completion_rate FLOAT64,
    avg_hours_to_complete FLOAT64,
    blocked_actions INT64,
    avg_estimated_hours FLOAT64,
    avg_actual_hours FLOAT64,
    estimation_accuracy FLOAT64 -- actual / estimated
);

-- TABLE: revenue_correlation
-- PURPOSE: Correlate action completion with revenue outcomes
CREATE TABLE rpm_analytics.revenue_correlation (
    week_start DATE,
    result_id STRING,
    result_text STRING,
    action_items_completed INT64,
    action_items_total INT64,
    completion_rate FLOAT64,
    revenue_target NUMERIC,
    revenue_actual NUMERIC,
    revenue_achievement_rate FLOAT64,
    profit_margin FLOAT64
);

-- TABLE: agent_performance
-- PURPOSE: Track agent productivity, health, errors over time
CREATE TABLE rpm_analytics.agent_performance (
    date DATE,
    agent_name STRING,
    actions_completed INT64,
    avg_completion_time_hours FLOAT64,
    health_score_avg FLOAT64,
    health_score_min FLOAT64,
    error_count INT64,
    idle_time_hours FLOAT64,
    active_time_hours FLOAT64,
    utilization_rate FLOAT64
);

-- TABLE: funnel_velocity
-- PURPOSE: Identify bottlenecks in full funnel (top → middle → bottom)
CREATE TABLE rpm_analytics.funnel_velocity (
    week_start DATE,
    funnel_stage STRING,
    actions_entered INT64,
    actions_completed INT64,
    avg_days_in_stage FLOAT64,
    bottleneck_score FLOAT64, -- higher = more bottleneck
    completion_rate FLOAT64
);

-- TABLE: rpm_plan_effectiveness
-- PURPOSE: Evaluate RPM plan quality and execution consistency
CREATE TABLE rpm_analytics.rpm_plan_effectiveness (
    week_start DATE,
    total_results INT64,
    results_achieved INT64,
    total_actions INT64,
    actions_completed INT64,
    on_time_completion_rate FLOAT64, -- actions completed by due date
    jesse_completion_rate FLOAT64, -- Jesse's personal completion rate
    team_completion_rate FLOAT64, -- Team (non-Jesse) completion rate
    avg_cycle_time_days FLOAT64, -- action creation → completion
    velocity_score FLOAT64 -- actions per day
);

-- TABLE: deliverable_metrics
-- PURPOSE: Track deliverable production and revenue generation
CREATE TABLE rpm_analytics.deliverable_metrics (
    date DATE,
    deliverable_type STRING,
    deliverables_created INT64,
    deliverables_published INT64,
    revenue_target NUMERIC,
    revenue_actual NUMERIC,
    revenue_achievement_rate FLOAT64,
    avg_time_to_publish_days FLOAT64
);

-- TABLE: suno_album_analytics
-- PURPOSE: Track 21 album release progress and song catalog
CREATE TABLE rpm_analytics.suno_album_analytics (
    date DATE,
    album_name STRING,
    songs_generated INT64,
    songs_mastered INT64,
    songs_released INT64,
    total_duration_minutes FLOAT64,
    avg_bpm FLOAT64,
    genre_distribution STRING, -- JSON string
    revenue_target NUMERIC,
    revenue_actual NUMERIC
);
```

---

### 1.3 Cloud Storage Data Lake

**Purpose:** Raw file storage, versioned backups, evidence preservation

#### **Bucket Organization:**

```
gs://livhana-rpm-datalake/
├── rpm-plans/
│   ├── raw/                        # Original markdown files
│   │   ├── 2025/
│   │   │   ├── W43/                # Week 43 (Oct 21-27, 2025)
│   │   │   │   ├── RPM-WEEKLY-001-20251021.md
│   │   │   │   └── RPM-WEEKLY-001-20251021.json
│   │   │   ├── W44/
│   │   │   └── W45/
│   │   └── 2026/
│   └── processed/                  # Structured JSON for ETL
│       └── 2025/
│           └── W43/
│               ├── weekly_plan.json
│               ├── results.json
│               └── actions.json
├── agent-outputs/
│   ├── artifacts/                  # Artifacts Agent deliverables
│   │   └── 2025/10/
│   │       └── code_implementations/
│   ├── qa/                         # QA Agent reports
│   │   └── test_reports/
│   ├── planning/                   # Planning Agent strategies
│   │   └── coordination_plans/
│   ├── research/                   # Research Agent findings
│   │   └── methodology_summaries/
│   └── execmon/                    # Execution Monitor logs
│       └── script_executions/
├── deliverables/
│   ├── songs/
│   │   ├── raw/
│   │   │   └── suno-386-songs/     # 386 Suno songs
│   │   │       ├── song-001.mp3
│   │   │       ├── song-001-metadata.json
│   │   │       └── ...
│   │   └── albums/
│   │       └── 21-album-release/
│   │           ├── album-01/
│   │           │   ├── track-01.mp3
│   │           │   ├── track-01-lyrics.txt
│   │           │   └── track-01-metadata.json
│   │           └── ...
│   ├── code/
│   │   └── deployments/
│   │       └── 2025/10/
│   ├── documents/
│   │   └── 2025/10/
│   └── videos/
│       └── hnc-content/            # High Noon Tooned episodes
│           └── days-15-21/
├── session-logs/
│   └── 2025/
│       └── 10/
│           ├── SESSION_PROGRESS_20251027.md
│           └── claude_tier1_state_20251027.json
├── agent-status/
│   └── snapshots/
│       └── 2025/10/27/
│           ├── 08-00-00_agent_registry.json
│           ├── 08-15-00_agent_registry.json
│           └── ...
└── analytics/
    ├── exports/                    # BigQuery export snapshots
    │   └── 2025/10/
    └── reports/                    # Generated reports
        └── weekly/
            └── 2025-W43-summary.pdf
```

#### **Lifecycle Policies:**

- **rpm-plans/raw/**: Keep all versions (indefinite retention)
- **agent-outputs/**: Keep 90 days, archive to Coldline after 30 days
- **session-logs/**: Keep 180 days, archive to Coldline after 60 days
- **agent-status/snapshots/**: Keep 30 days, delete after
- **deliverables/songs/**: Keep all versions (indefinite retention)
- **analytics/exports/**: Keep 365 days, archive to Coldline after 180 days

---

### 1.4 Data Flow Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                    LOCAL ENVIRONMENT                             │
│                   (LivHana-SoT Repository)                       │
└─────────────────────────────────────────────────────────────────┘
                               │
                               │ (1) Automated Sync
                               │     Via boot script
                               │     + Watchdog (every 15 min)
                               ▼
┌─────────────────────────────────────────────────────────────────┐
│                 CLOUD STORAGE DATA LAKE                          │
│              (gs://livhana-rpm-datalake)                         │
│                                                                   │
│  • RPM markdown files (versioned)                                │
│  • Agent status JSON (snapshots)                                 │
│  • Session logs (timestamped)                                    │
│  • Deliverables (songs, code, docs)                              │
└─────────────────────────────────────────────────────────────────┘
                               │
                               │ (2) ETL Pipeline
                               │     Cloud Functions
                               │     + Dataflow (batch)
                               ▼
┌─────────────────────────────────────────────────────────────────┐
│                    ALLOYDB (Transactional)                       │
│              (reggieanddrodispensary:us-central1)                │
│                                                                   │
│  • rpm_weekly_plans                                              │
│  • rpm_results                                                   │
│  • rpm_action_items                                              │
│  • agent_status                                                  │
│  • deliverables                                                  │
│  • suno_songs                                                    │
└─────────────────────────────────────────────────────────────────┘
                               │
                               │ (3) Scheduled Export
                               │     (Hourly BigQuery sync)
                               ▼
┌─────────────────────────────────────────────────────────────────┐
│               BIGQUERY (Analytics Warehouse)                     │
│              (reggieanddrodispensary:rpm_analytics)              │
│                                                                   │
│  • action_completion_metrics                                     │
│  • revenue_correlation                                           │
│  • agent_performance                                             │
│  • funnel_velocity                                               │
│  • rpm_plan_effectiveness                                        │
└─────────────────────────────────────────────────────────────────┘
                               │
                               │ (4) Real-Time API
                               │     Cloud Run + WebSocket
                               ▼
┌─────────────────────────────────────────────────────────────────┐
│              HERITAGE.COM VIP COCKPIT                            │
│                  (https://heritage.com/cockpit)                  │
│                                                                   │
│  • Current Week RPM Status                                       │
│  • Action Items Live Feed                                        │
│  • Revenue Targets vs Actuals                                    │
│  • Agent Health Dashboard                                        │
│  • Deliverables Completed                                        │
│  • Full Funnel Visioneering                                      │
└─────────────────────────────────────────────────────────────────┘
```

---

## 2. HERITAGE.COM COCKPIT SPECIFICATION

### 2.1 Authentication & Access Control

**VIP-Only Access:**
- Firebase Auth or Google OAuth 2.0
- Whitelist: Jesse CEO + VIP stakeholders
- Role-based access control (RBAC):
  - **Admin:** Jesse (full read/write)
  - **VIP:** Read-only dashboard access
  - **Team:** Read-only for assigned actions

**Session Management:**
- JWT tokens (15-minute expiry, refresh token rotation)
- Secure cookie storage (httpOnly, SameSite=Strict)
- Automatic logout after 1 hour inactivity

---

### 2.2 Real-Time Data Sync

**WebSocket Connection:**
- Primary: WebSocket for live updates (action completions, agent status changes)
- Fallback: 30-second polling if WebSocket unavailable
- Optimistic UI updates with conflict resolution

**Event Types:**
- `ACTION_COMPLETED`: Action item marked complete
- `ACTION_BLOCKED`: Action item blocked with reason
- `AGENT_STATUS_CHANGE`: Agent health score change
- `REVENUE_UPDATE`: Revenue actual updated
- `DELIVERABLE_PUBLISHED`: New deliverable published

---

### 2.3 Dashboard Sections

#### **Section 1: RPM Weekly Overview**

**Display:**
- Current week date range (e.g., "Oct 21-27, 2025")
- Results committed (with progress bars per result)
- Overall completion rate (actions completed / total actions)
- Jesse's personal completion rate (Jesse-owned actions)
- Week-over-week velocity trend (sparkline chart)

**Metrics:**
- Total actions: 28
- Actions completed: 19 (68%)
- Jesse's completion rate: 75%
- Velocity: 2.7 actions/day

---

#### **Section 2: Action Items Live Feed**

**Display:**
- Real-time action completions (last 24 hours)
- In-progress actions with owners
- Blocked actions with blocker descriptions
- Upcoming due dates (next 7 days)

**Filters:**
- By owner (Jesse, Artifacts, QA, Planning, Research, ExecMon)
- By funnel stage (top, middle, bottom)
- By status (pending, in_progress, blocked, completed)

**Action Card Format:**
```
┌─────────────────────────────────────────────────────────┐
│ ✅ Boot System Fixed (2 minutes ago)                    │
│ Owner: Jesse | Funnel: Bottom | Due: Oct 27            │
│ Evidence: /docs/ops/BOOT_FIX_DOCUMENTATION_20251027.md │
└─────────────────────────────────────────────────────────┘
```

---

#### **Section 3: Revenue Tracking**

**Display:**
- Revenue targets for current week (per result)
- Revenue actuals (updated daily)
- Achievement rate (actual / target %)
- Top revenue-generating deliverables
- Historical trend chart (last 8 weeks)

**Metrics:**
- Revenue target: $125K-175K
- Revenue actual: $98K (as of Oct 27)
- Achievement rate: 65% (week-to-date)
- Top deliverable: Jumio Integration ($60K revenue unlock)

---

#### **Section 4: Agent Health Status**

**Display:**
- Agent name, status (active/idle/error/offline)
- Health score (0-100) with visual indicator
  - 🟢 90-100: Excellent
  - 🟡 70-89: Good
  - 🟠 50-69: Fair
  - 🔴 0-49: Critical
- Current action assigned
- Last heartbeat timestamp
- Error logs (if applicable)

**Agent Cards:**
```
┌─────────────────────────────────────────────────────────┐
│ 🟢 Artifacts Agent        Health: 98                    │
│ Status: Active                                          │
│ Current: ARCH-BOOT-001c (Voice greeting implementation) │
│ Last Heartbeat: 30 seconds ago                          │
└─────────────────────────────────────────────────────────┘
```

---

#### **Section 5: Deliverables Completed**

**Display:**
- Songs released (with links to Suno/Spotify/YouTube)
- Code deployments (with GitHub commit links)
- Documents published (with cloud storage links)
- Album progress (21 album release tracking)
- Deliverable metadata (genre, duration, revenue)

**Deliverable Cards:**
```
┌─────────────────────────────────────────────────────────┐
│ 🎵 "Jesse's Judicial Victory" (Day 19)                  │
│ Genre: Country | BPM: 78 | Key: D Major                │
│ Duration: 3:42 | Released: Oct 25, 2025                │
│ Revenue Target: $2K | Actual: $1.2K (60%)              │
│ Links: [Suno] [Spotify] [YouTube]                      │
└─────────────────────────────────────────────────────────┘
```

---

#### **Section 6: Full Funnel Visioneering**

**Display:**
- Visual funnel diagram (top → middle → bottom)
- Action count per funnel stage
- Bottleneck identification (stages with slowest velocity)
- Funnel completion rate
- Average days per funnel stage

**Funnel Visualization:**
```
┌─────────────────────────────────────────────────────────┐
│  TOP FUNNEL         MIDDLE FUNNEL        BOTTOM FUNNEL  │
│  (Ideation)         (Execution)          (Completion)   │
│                                                          │
│  ┌──────────┐       ┌──────────┐         ┌──────────┐  │
│  │ 12 actions│   →  │15 actions│    →    │ 7 actions│  │
│  │ 2.1 days  │       │ 3.8 days │         │ 1.5 days │  │
│  └──────────┘       └──────────┘         └──────────┘  │
│                                                          │
│  🔴 Bottleneck: Middle Funnel (3.8 days avg)            │
│  Recommendation: Parallelize execution tasks            │
└─────────────────────────────────────────────────────────┘
```

---

### 2.4 API Endpoints

**Base URL:** `https://api.heritage.com/v1`

**Authentication:** Bearer token (JWT)

#### **RPM Plan Endpoints:**

```
GET  /rpm/current-week
     Response: { week_start, week_end, results[], actions[], completion_rate }

GET  /rpm/action-items
     Query params: ?status=in_progress&owner=Jesse&funnel_stage=middle
     Response: { actions: [...] }

POST /rpm/action-items/:id/complete
     Body: { actual_hours, evidence_path }
     Response: { success: true, action: {...} }

POST /rpm/action-items/:id/block
     Body: { blocker_description }
     Response: { success: true, action: {...} }
```

#### **Revenue Endpoints:**

```
GET  /rpm/revenue-summary
     Query params: ?week_start=2025-10-21
     Response: { revenue_target, revenue_actual, achievement_rate, top_deliverables[] }
```

#### **Agent Endpoints:**

```
GET  /agents/status
     Response: { agents: [{ name, status, health_score, current_action, last_heartbeat }] }

GET  /agents/:name/history
     Query params: ?days=7
     Response: { actions_completed[], avg_completion_time, error_count }
```

#### **Deliverables Endpoints:**

```
GET  /deliverables
     Query params: ?type=song&status=published&limit=10
     Response: { deliverables: [...] }

GET  /deliverables/:id
     Response: { id, title, type, cloud_storage_path, metadata, revenue_target, revenue_actual }
```

#### **Analytics Endpoints:**

```
GET  /analytics/funnel-velocity
     Query params: ?week_start=2025-10-21
     Response: { funnel_stages: [{ stage, actions_entered, actions_completed, avg_days }] }

GET  /analytics/completion-trends
     Query params: ?period=weekly&weeks=8
     Response: { weeks: [{ week_start, completion_rate, velocity_score }] }
```

#### **WebSocket Endpoint:**

```
WS   /ws/rpm-updates
     Auth: JWT token in query string (?token=xxx)
     Events: ACTION_COMPLETED, ACTION_BLOCKED, AGENT_STATUS_CHANGE, REVENUE_UPDATE
```

---

### 2.5 Dashboard Wireframe (ASCII Art)

```
┌────────────────────────────────────────────────────────────────────┐
│  HERITAGE.COM - RPM COCKPIT                   [VIP: Jesse CEO]     │
├────────────────────────────────────────────────────────────────────┤
│  Week of Oct 21-27, 2025                                           │
│  ▓▓▓▓▓▓▓▓▓▓▓▓▓▓░░░░  68% Complete  (19/28 actions)                │
├────────────────────────────────────┬───────────────────────────────┤
│  RESULTS COMMITTED                 │  REVENUE TRACKER              │
│  ✅ Boot System Fixed (100%)       │  Target: $125K-175K           │
│  ⚡ Cloud RPM Infra (30%)          │  Actual: $98K                 │
│  ⚡ 21 Album Release (45%)         │  Rate: 65% ✓ (Week-to-Date)  │
│  ⚡ Time Estimation Protocol (20%) │                               │
├────────────────────────────────────┼───────────────────────────────┤
│  LIVE ACTION FEED                  │  AGENT HEALTH                 │
│  ✅ Jesse: Boot script fixed (2m)  │  🟢 Artifacts  98             │
│  ⚡ Artifacts: AlloyDB schema (now)│  🟢 QA Agent   95             │
│  ⚡ Planning: BigQuery setup (now) │  🟢 Planning   92             │
│  🚫 Research: API auth (blocked)   │  🟡 Research   78             │
│                                    │  🟢 ExecMon    96             │
├────────────────────────────────────┴───────────────────────────────┤
│  FULL FUNNEL VISIONEERING                                          │
│  Top [12 actions] → Middle [15 actions] → Bottom [7 actions]      │
│  🔴 Bottleneck: Middle Funnel (3.8 days avg)                       │
│  Recommendation: Parallelize Artifacts + Research tasks            │
├────────────────────────────────────────────────────────────────────┤
│  DELIVERABLES COMPLETED (Last 7 Days)                              │
│  🎵 5 Songs Released  📄 3 Docs Published  💻 12 Code Commits      │
│                                                                     │
│  Latest: "Jesse's Judicial Victory" (Country, 3:42, $1.2K rev)    │
└────────────────────────────────────────────────────────────────────┘
```

---

## 3. ASAP IMPLEMENTATION TIMELINE

### **Phase 1: Cloud Setup + Schema Design (Days 1-3)**

**Day 1 (Oct 28):** AlloyDB Instance Setup
- Create AlloyDB cluster in `reggieanddrodispensary` project
- Region: `us-central1` (same as current infrastructure)
- Instance type: `db-standard-2` (2 vCPUs, 7.5GB RAM)
- Database name: `rpm_production`
- Execute schema DDL (all tables + indexes)
- Test connection from Cloud Run environment

**Day 2 (Oct 29):** Cloud Storage + BigQuery Setup
- Create bucket: `gs://livhana-rpm-datalake`
- Configure lifecycle policies (retention, archival)
- Create BigQuery dataset: `rpm_analytics`
- Execute BigQuery table DDL
- Test data export: AlloyDB → BigQuery

**Day 3 (Oct 30):** ETL Pipeline Design
- Design Cloud Function for markdown parsing (RPM plans → JSON)
- Design Dataflow job for AlloyDB ingestion
- Create sync script for agent status snapshots
- Test end-to-end: Local markdown → Cloud Storage → AlloyDB

**Owner:** Artifacts Agent (implementation), QA Agent (validation)
**Success Criteria:**
- ✅ AlloyDB cluster operational, schema deployed
- ✅ Cloud Storage bucket created with lifecycle policies
- ✅ BigQuery dataset operational with tables
- ✅ ETL pipeline tested with sample RPM plan

---

### **Phase 2: Data Migration + API Development (Days 4-8)**

**Day 4 (Oct 31):** Historical RPM Plan Migration
- Parse existing RPM plans from `/docs/RPM_*.md`
- Convert to JSON format
- Upload to Cloud Storage (`rpm-plans/raw/2025/`)
- Ingest into AlloyDB (`rpm_weekly_plans`, `rpm_results`, `rpm_action_items`)
- Verify data integrity (spot-check 5 plans)

**Day 5 (Nov 1):** Agent Status Migration
- Parse `tmp/agent_status/*.json` files
- Create agent status snapshots in Cloud Storage
- Ingest into AlloyDB (`agent_status` table)
- Set up automated sync (every 15 minutes via watchdog)

**Day 6 (Nov 2):** Suno Song Catalog Migration
- Parse 386 Suno song metadata files
- Upload song files to Cloud Storage (`deliverables/songs/raw/`)
- Ingest metadata into AlloyDB (`suno_songs` table)
- Tag album assignments (21 album release tracking)

**Day 7 (Nov 3):** Cloud Run API Development
- Create Cloud Run service: `rpm-api`
- Implement REST API endpoints (see Section 2.4)
- Implement WebSocket endpoint for real-time updates
- Deploy to production (`https://api.heritage.com/v1`)

**Day 8 (Nov 4):** BigQuery Analytics Implementation
- Create scheduled queries (hourly export from AlloyDB)
- Implement analytics tables (action_completion_metrics, revenue_correlation, etc.)
- Test sample queries (completion trends, funnel velocity)
- Create Looker Studio dashboard (optional visualization)

**Owner:** Artifacts Agent (implementation), Planning Agent (coordination), QA Agent (validation)
**Success Criteria:**
- ✅ 10+ RPM plans migrated to AlloyDB
- ✅ Agent status syncing every 15 minutes
- ✅ 386 Suno songs cataloged in AlloyDB
- ✅ Cloud Run API operational with all endpoints
- ✅ BigQuery analytics tables populated

---

### **Phase 3: Heritage.com Cockpit Integration (Days 9-11)**

**Day 9 (Nov 5):** Frontend Dashboard Development
- Create Next.js app for Heritage.com Cockpit
- Implement authentication (Firebase Auth or Google OAuth)
- Build dashboard sections (see Section 2.3)
- Integrate with Cloud Run API (REST + WebSocket)

**Day 10 (Nov 6):** Real-Time Data Sync Implementation
- Implement WebSocket connection for live updates
- Implement optimistic UI updates
- Add fallback polling (30-second intervals)
- Test event handling (action completions, agent status changes)

**Day 11 (Nov 7):** Dashboard Refinement
- Implement filters (owner, funnel stage, status)
- Add full funnel visioneering visualization
- Add revenue tracking charts
- Mobile-responsive design (iPhone/iPad compatible)

**Owner:** Artifacts Agent (implementation), QA Agent (validation)
**Success Criteria:**
- ✅ Dashboard accessible at `https://heritage.com/cockpit`
- ✅ VIP authentication working
- ✅ Real-time updates functional (WebSocket)
- ✅ All 6 dashboard sections operational
- ✅ Mobile-responsive design

---

### **Phase 4: VIP Testing + Deployment (Days 12-13)**

**Day 12 (Nov 8):** VIP Testing
- Jesse CEO testing session (1-2 hours)
- Verify all dashboard sections
- Test real-time updates (complete action, see live update)
- Test mobile access (iPhone)
- Collect feedback for refinements

**Day 13 (Nov 9):** Production Deployment + Documentation
- Address VIP feedback (minor refinements)
- Deploy production version to Heritage.com
- Update boot script to auto-sync on every boot
- Document VIP access instructions
- Create training video for VIP stakeholders

**Owner:** QA Agent (testing), Artifacts Agent (deployment), Planning Agent (documentation)
**Success Criteria:**
- ✅ Jesse CEO sign-off on dashboard
- ✅ Production deployment stable
- ✅ Auto-sync operational (boot script integration)
- ✅ VIP access instructions documented

---

## 4. RPM DNA FILE NAMING CONVENTIONS

**Applied to All Cloud Infrastructure Files:**

### **Architecture Documents:**

```
ARCH-CLOUD-001-AlloyDB-BigQuery-CloudStorage-Architecture-20251027.md
ARCH-CLOUD-002-Heritage-Cockpit-API-Specification-20251027.md
ARCH-CLOUD-003-ETL-Pipeline-Design-20251027.md
```

### **Implementation Scripts:**

```
SCRIPT-CLOUD-001-AlloyDB-Schema-DDL-20251027.sql
SCRIPT-CLOUD-002-BigQuery-Analytics-DDL-20251027.sql
SCRIPT-CLOUD-003-RPM-Markdown-Parser-20251027.py
SCRIPT-CLOUD-004-Agent-Status-Sync-20251027.sh
```

### **Coordination Plans:**

```
COORD-CLOUD-001-Agent-Coordination-Plan-20251027.md
COORD-CLOUD-002-Phase-Execution-Timeline-20251027.md
```

### **Deliverables:**

```
DELIVER-CLOUD-001-Heritage-Cockpit-Dashboard-20251109.zip
DELIVER-CLOUD-002-Cloud-Run-API-Service-20251104.tar.gz
```

---

## 5. RISK MITIGATION & CONTINGENCY PLANNING

### **RISK 1: AlloyDB Connection Latency**

**Probability:** LOW (15%)
**Impact:** MEDIUM (Dashboard slow, poor UX)
**Mitigation:**
- Connection pooling (max 20 connections)
- Query optimization (indexed columns)
- Redis caching layer (action items, agent status)
- Fallback: Direct BigQuery queries (slower but functional)

### **RISK 2: ETL Pipeline Failures**

**Probability:** MEDIUM (30%)
**Impact:** MEDIUM (Data sync delays, stale dashboard)
**Mitigation:**
- Retry logic with exponential backoff
- Error logging to Cloud Logging
- Alerting to Jesse via SMS (critical failures)
- Manual sync script (fallback for critical updates)

### **RISK 3: Heritage.com Hosting Issues**

**Probability:** LOW (10%)
**Impact:** HIGH (VIP dashboard unavailable)
**Mitigation:**
- Deploy to Cloud Run (high availability)
- Health checks every 1 minute
- Auto-scaling (1-10 instances)
- Fallback: Direct access to Cloud Run URL (bypass Heritage.com DNS)

### **RISK 4: VIP Authentication Complexity**

**Probability:** MEDIUM (25%)
**Impact:** LOW (VIP onboarding friction)
**Mitigation:**
- Simple Google OAuth (1-click sign-in)
- Pre-whitelist VIP emails
- Training video (5-minute walkthrough)
- Jesse as first tester (validate UX)

### **RISK 5: Real-Time Sync Lag**

**Probability:** MEDIUM (30%)
**Impact:** LOW (Dashboard 30-60 seconds stale)
**Mitigation:**
- WebSocket primary (instant updates)
- Polling fallback (30-second intervals)
- Optimistic UI updates (show immediately, sync in background)
- "Last updated" timestamp visible on dashboard

---

## 6. SUCCESS METRICS (13-Day Completion)

### **Technical Metrics:**

- ✅ AlloyDB cluster operational with 100% uptime
- ✅ Cloud Storage bucket with 10+ RPM plans migrated
- ✅ BigQuery analytics tables populated with historical data
- ✅ Cloud Run API with <100ms latency (p95)
- ✅ Heritage.com Cockpit with <2s page load time

### **Business Metrics:**

- ✅ VIP dashboard accessible 24/7
- ✅ Real-time action completions visible within 30 seconds
- ✅ Revenue tracking accurate to within $1K
- ✅ Agent health monitoring operational
- ✅ Suno song catalog fully migrated (386 songs)

### **User Metrics:**

- ✅ Jesse CEO sign-off on dashboard
- ✅ VIP stakeholders trained and accessing dashboard
- ✅ Zero authentication issues reported
- ✅ Mobile-responsive design validated on iPhone/iPad

### **Automation Metrics:**

- ✅ Boot script auto-syncs RPM data every boot
- ✅ Agent status syncs every 15 minutes (automated)
- ✅ BigQuery analytics updated hourly (automated)
- ✅ Zero manual data entry required

---

## 7. NEXT STEPS (Post-Deployment)

### **Week 1 (Nov 10-16): Refinement**

- Collect VIP feedback (usability, feature requests)
- Optimize query performance (add indexes if needed)
- Implement advanced analytics (predictive velocity, bottleneck alerts)
- Add notification system (email/SMS alerts for blocked actions)

### **Week 2 (Nov 17-23): Expansion**

- Add team member dashboards (Andrew, Christopher, Charlie)
- Implement mobile app (iOS/Android)
- Integrate with calendar (auto-block time for actions)
- Add voice command integration ("Liv Hana, show me my actions")

### **Month 2 (Dec 2025): Advanced Features**

- Predictive analytics (forecast completion dates)
- AI-powered recommendations (bottleneck mitigation)
- Multi-project support (R&D, HNC, OPS separate RPM plans)
- Investor dashboard (high-level metrics for fundraising)

---

## 8. ESTIMATED COSTS (13-Day Implementation + Ongoing)

### **Implementation Costs (Days 1-13):**

- **Artifacts Agent:** 80 hours @ $150/hour = $12,000
- **Planning Agent:** 20 hours @ $150/hour = $3,000
- **QA Agent:** 30 hours @ $150/hour = $4,500
- **Research Agent:** 10 hours @ $150/hour = $1,500
- **Total Implementation:** $21,000

### **Infrastructure Costs (Monthly):**

- **AlloyDB:** db-standard-2 instance = $350/month
- **Cloud Storage:** 100GB @ $0.02/GB = $2/month
- **BigQuery:** 10GB storage + 100GB queries = $5/month
- **Cloud Run:** API service (1-10 instances) = $50/month
- **Total Monthly:** $407/month (~$5K/year)

### **ROI Analysis:**

**Benefits:**
- **Visibility:** VIP dashboard eliminates 5+ hours/week status update meetings
- **Efficiency:** Automated sync saves 10+ hours/week manual data entry
- **Intelligence:** Analytics enable proactive bottleneck mitigation (10% velocity improvement)

**Time Savings:** 15 hours/week = 60 hours/month = $9K/month (@ $150/hour)
**Payback Period:** 2.3 months ($21K implementation / $9K monthly benefit)
**12-Month ROI:** 410% ($108K benefit vs $26K total cost)

---

## APPENDIX A: ALLOYDB INSTANCE CONFIGURATION

```yaml
instance_name: rpm-production-primary
cluster_name: rpm-cluster
region: us-central1
availability_type: REGIONAL # High availability
machine_type: db-standard-2 # 2 vCPUs, 7.5GB RAM
storage_type: SSD
storage_capacity: 100GB
backup_enabled: true
backup_retention_days: 7
point_in_time_recovery: true
network: default
private_ip: true # VPC peering required
```

---

## APPENDIX B: BIGQUERY SCHEDULED QUERY EXAMPLE

```sql
-- Scheduled query: Hourly export from AlloyDB to BigQuery
-- Schedule: Every hour at :00
-- Destination: rpm_analytics.action_completion_metrics

INSERT INTO `reggieanddrodispensary.rpm_analytics.action_completion_metrics`
SELECT
  CURRENT_DATE() AS date,
  owner,
  funnel_stage,
  COUNT(*) AS total_actions,
  SUM(CASE WHEN status = 'completed' THEN 1 ELSE 0 END) AS completed_actions,
  SAFE_DIVIDE(
    SUM(CASE WHEN status = 'completed' THEN 1 ELSE 0 END),
    COUNT(*)
  ) * 100 AS completion_rate,
  AVG(
    CASE
      WHEN status = 'completed'
      THEN TIMESTAMP_DIFF(completion_date, created_at, HOUR)
      ELSE NULL
    END
  ) AS avg_hours_to_complete,
  SUM(CASE WHEN status = 'blocked' THEN 1 ELSE 0 END) AS blocked_actions,
  AVG(estimated_hours) AS avg_estimated_hours,
  AVG(actual_hours) AS avg_actual_hours,
  SAFE_DIVIDE(AVG(actual_hours), AVG(estimated_hours)) AS estimation_accuracy
FROM
  `rpm_production.rpm_action_items`
WHERE
  created_at >= TIMESTAMP_SUB(CURRENT_TIMESTAMP(), INTERVAL 24 HOUR)
GROUP BY
  owner,
  funnel_stage;
```

---

## APPENDIX C: CLOUD RUN API DEPLOYMENT COMMAND

```bash
# Deploy rpm-api service to Cloud Run
gcloud run deploy rpm-api \
  --image gcr.io/reggieanddrodispensary/rpm-api:latest \
  --platform managed \
  --region us-central1 \
  --allow-unauthenticated \
  --set-env-vars "DATABASE_URL=postgres://alloydb-ip:5432/rpm_production" \
  --set-env-vars "JWT_SECRET=op://LivHana-Ops-Keys/JWT_SECRET/credential" \
  --set-env-vars "GCP_PROJECT_ID=reggieanddrodispensary" \
  --min-instances 1 \
  --max-instances 10 \
  --memory 2Gi \
  --cpu 2 \
  --timeout 60s \
  --service-account rpm-api@reggieanddrodispensary.iam.gserviceaccount.com
```

---

**END OF ARCHITECTURE DOCUMENT**

---

**READY FOR JESSE CEO REVIEW AND APPROVAL**

**Next Step:** Review architecture → Approve → Execute Phase 1 (AlloyDB setup)

**War's won for cloud infrastructure visioneering. Full funnel mapped. ASAP timeline defined. Execute.**
