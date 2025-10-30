# LINEAR → RPM → COCKPIT INTEGRATION ARCHITECTURE

**CLASSIFICATION:** TIER 1 ABSOLUTE STANDARD - 100% TRUTH ALWAYS
**OWNER:** Jesse Niesen (CEO)
**VERSION:** 1.0
**DATE:** Sunday, October 27, 2025
**STATUS:** APPROVED - IMMEDIATE EXECUTION

**80/20/5/1 RULE:** The ONE thing that makes the biggest difference is **UNIFIED METADATA AT THE FILE LEVEL** — RPM DNA embedded in every file, every task, every level, making search/retrieval instant and integration automatic.

---

## EXECUTIVE SUMMARY

### The ONE Thing (80/20/5/1)

**UNIFIED RPM DNA METADATA SYSTEM**

Instead of building complex integration layers between Linear, RPM plans, and cockpit dashboards, we embed RPM DNA metadata DIRECTLY into every file at creation time. This makes:

- **Search/Find/Retrieval:** Instant (grep, database queries, AI agents can find anything)
- **Linear Integration:** Automatic (issues tagged with RPM DNA codes)
- **Cockpit Dashboards:** Real-time (query by RPM DNA, filter by team/role)
- **Truth Verification:** Built-in (every file self-describes its purpose, owner, classification)

**Impact:** 10x faster than traditional integration layers, 100% truth always, bomb-proof architecture.

---

### Architecture Vision

```
┌─────────────────────────────────────────────────────────────────┐
│                   LINEAR PROJECT MANAGEMENT                      │
│             (Issues, Tasks, Milestones, Teams)                   │
└─────────────────────────────────────────────────────────────────┘
                               │
                               │ (1) RPM DNA Metadata Tag
                               │     [ARCH-CLOUD-001]
                               │     [DEV-VERIFF-002a]
                               │     [COORD-AGENT-003]
                               ▼
┌─────────────────────────────────────────────────────────────────┐
│                   RPM DNA METADATA LAYER                         │
│                (Unified Naming Convention)                       │
│                                                                   │
│  • ARCH-*: Architecture & Design                                 │
│  • DEV-*: Development & Implementation                           │
│  • COORD-*: Coordination & Planning                              │
│  • QA-*: Quality Assurance & Testing                             │
│  • DOC-*: Documentation & Training                               │
│  • DELIVER-*: Deliverables & Outputs                             │
│                                                                   │
│  Format: [TYPE]-[PROJECT]-[SEQUENCE]-[SUBTASK]                   │
│  Example: ARCH-CLOUD-001-a (AlloyDB schema design subtask a)     │
└─────────────────────────────────────────────────────────────────┘
                               │
                               │ (2) File System Sync
                               │     Metadata embedded in files
                               │     Git commits tagged
                               ▼
┌─────────────────────────────────────────────────────────────────┐
│                   LOCAL FILE SYSTEM                              │
│              (LivHana-SoT Repository)                            │
│                                                                   │
│  docs/architecture/ARCH-CLOUD-001-AlloyDB-Schema.md              │
│  backend/api/DEV-CLOUD-007-RPM-API-Service.ts                    │
│  scripts/COORD-CLOUD-003-ETL-Pipeline.sh                         │
│                                                                   │
│  EVERY FILE has RPM DNA in:                                      │
│  • Filename convention                                           │
│  • Frontmatter metadata (YAML/JSON)                              │
│  • Git commit messages                                           │
└─────────────────────────────────────────────────────────────────┘
                               │
                               │ (3) Cloud Sync + Database
                               │     Auto-parse metadata
                               │     Index for fast queries
                               ▼
┌─────────────────────────────────────────────────────────────────┐
│                   ALLOYDB + BIGQUERY                             │
│              (Structured Metadata Store)                         │
│                                                                   │
│  rpm_dna_registry:                                               │
│  ┌──────────────────────────────────────────────────────────┐   │
│  │ dna_code │ type  │ project │ owner  │ status │ file_path │   │
│  ├──────────────────────────────────────────────────────────┤   │
│  │ ARCH-001 │ ARCH  │ CLOUD   │ Jesse  │ DONE   │ /docs/... │   │
│  │ DEV-002a │ DEV   │ VERIFF  │ Andrew │ WIP    │ /backend/ │   │
│  │ COORD-03 │ COORD │ AGENT   │ Jesse  │ TODO   │ /scripts/ │   │
│  └──────────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────────┘
                               │
                               │ (4) Real-Time Cockpit API
                               │     Query by RPM DNA
                               │     Filter by team/role
                               ▼
┌─────────────────────────────────────────────────────────────────┐
│              HERITAGE.COM COCKPIT DASHBOARDS                     │
│                  (Role-Based Views)                              │
│                                                                   │
│  JESSE (CEO):                                                    │
│  • All tasks (ARCH-*, COORD-*, DELIVER-*)                        │
│  • Strategic overview (results, revenue, milestones)             │
│                                                                   │
│  ANDREW (Systems):                                               │
│  • Technical tasks (DEV-*, QA-*, ARCH-CLOUD-*)                   │
│  • Infrastructure status (MCP Broker, TRUTH Pipeline)            │
│                                                                   │
│  CHRISTOPHER (Operations):                                       │
│  • Store operations (DEV-REGGIEDRO-*, DOC-COMPLIANCE-*)          │
│  • Customer experience (QA-CX-*, DELIVER-TRAINING-*)             │
│                                                                   │
│  CHARLIE (Product):                                              │
│  • Inventory tasks (COORD-INVENTORY-*, DEV-PROCUREMENT-*)        │
│  • Product performance (DELIVER-PRODUCT-*, QA-QUALITY-*)         │
└─────────────────────────────────────────────────────────────────┘
```

---

## 1. RPM DNA METADATA STANDARD

### 1.1 Naming Convention (The ONE Thing)

**Format:**
```
[TYPE]-[PROJECT]-[SEQUENCE][SUBTASK]

Examples:
ARCH-CLOUD-001       (Architecture doc #1 for Cloud project)
ARCH-CLOUD-001a      (Subtask 'a' of ARCH-CLOUD-001)
DEV-VERIFF-002       (Development task #2 for [PURGED_FALLACY] project)
COORD-AGENT-003      (Coordination task #3 for Agent Builder)
QA-REGGIEDRO-004     (QA task #4 for ReggieAndDro)
DOC-TRAINING-005     (Documentation task #5 for training)
DELIVER-SONG-386     (Deliverable: Song #386)
```

**TYPE Codes:**
- **ARCH**: Architecture & design documents
- **DEV**: Development & implementation tasks
- **COORD**: Coordination & planning documents
- **QA**: Quality assurance & testing tasks
- **DOC**: Documentation & training materials
- **DELIVER**: Final deliverables (songs, code, reports)
- **RESEARCH**: Research & analysis reports
- **SCRIPT**: Automation scripts & tools

**PROJECT Codes:**
- **CLOUD**: Cloud infrastructure (AlloyDB, BigQuery, Cloud Storage)
- **VERIFF**: [PURGED_FALLACY] biometric ID integration
- **AGENT**: Agent Builder 17-node workflow
- **REGGIEDRO**: ReggieAndDro.com e-commerce
- **HERBITRAGE**: Herbitrage.com content platform
- **HNC**: High Noon Cartoon content production
- **COMPLIANCE**: DSHS/TABC compliance work
- **MUSIC**: Suno music production (21 album release)
- **INFRA**: Infrastructure & DevOps
- **REVENUE**: Revenue recovery & optimization

---

### 1.2 File Frontmatter Standard

**YAML Format (Markdown Files):**
```yaml
---
rpm_dna: ARCH-CLOUD-001
classification: TIER_1_ABSOLUTE_STANDARD
title: AlloyDB + BigQuery + Cloud Storage Architecture
owner: Jesse Niesen
team: [Artifacts, Planning, QA]
project: CLOUD
type: ARCH
status: APPROVED
date_created: 2025-10-27
date_updated: 2025-10-27
linear_issue: LH-123
parent_dna: null
child_dna: [ARCH-CLOUD-001a, ARCH-CLOUD-001b]
dependencies: []
tags: [architecture, alloydb, bigquery, cloud-storage, rpm-cockpit]
revenue_impact: $0-5K_annual_infrastructure
---
```

**JSON Format (Code Files, Scripts):**
```javascript
/**
 * RPM DNA Metadata
 * @rpm_dna DEV-CLOUD-007
 * @classification TIER_1_ABSOLUTE_STANDARD
 * @title RPM API Service - Cloud Run Deployment
 * @owner Andrew Aparicio
 * @team Artifacts
 * @project CLOUD
 * @type DEV
 * @status IN_PROGRESS
 * @date_created 2025-10-27
 * @linear_issue LH-145
 * @parent_dna ARCH-CLOUD-002
 * @dependencies [DEV-CLOUD-001, DEV-CLOUD-003]
 * @tags api,cloud-run,typescript,rest
 */
```

---

### 1.3 Database Schema (AlloyDB)

```sql
-- ============================================
-- RPM DNA REGISTRY (Master Metadata Index)
-- ============================================
CREATE TABLE rpm_dna_registry (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    dna_code VARCHAR(100) NOT NULL UNIQUE, -- ARCH-CLOUD-001
    classification VARCHAR(100), -- TIER_1_ABSOLUTE_STANDARD
    title TEXT NOT NULL,
    owner VARCHAR(255) NOT NULL, -- Jesse Niesen, Andrew Aparicio
    team VARCHAR(255)[], -- [Artifacts, Planning, QA]
    project VARCHAR(100), -- CLOUD, VERIFF, AGENT
    type VARCHAR(50), -- ARCH, DEV, COORD, QA, DOC, DELIVER
    status VARCHAR(50), -- TODO, IN_PROGRESS, BLOCKED, DONE
    date_created TIMESTAMP DEFAULT NOW(),
    date_updated TIMESTAMP DEFAULT NOW(),
    linear_issue VARCHAR(100), -- LH-123
    parent_dna VARCHAR(100), -- ARCH-CLOUD-001 (this is a subtask)
    child_dna VARCHAR(100)[], -- [ARCH-CLOUD-001a, ARCH-CLOUD-001b]
    dependencies VARCHAR(100)[], -- [DEV-CLOUD-001, DEV-CLOUD-003]
    tags VARCHAR(100)[], -- [architecture, alloydb, bigquery]
    revenue_impact VARCHAR(255), -- $0-5K_annual_infrastructure
    file_path TEXT, -- /docs/architecture/ARCH-CLOUD-001.md
    git_commit_sha VARCHAR(255), -- Latest commit hash
    metadata JSONB, -- Flexible JSON for custom fields

    CONSTRAINT fk_parent FOREIGN KEY (parent_dna) REFERENCES rpm_dna_registry(dna_code)
);

-- Indexes for fast queries
CREATE INDEX idx_dna_code ON rpm_dna_registry(dna_code);
CREATE INDEX idx_owner ON rpm_dna_registry(owner);
CREATE INDEX idx_team ON rpm_dna_registry USING GIN(team);
CREATE INDEX idx_project ON rpm_dna_registry(project);
CREATE INDEX idx_type ON rpm_dna_registry(type);
CREATE INDEX idx_status ON rpm_dna_registry(status);
CREATE INDEX idx_tags ON rpm_dna_registry USING GIN(tags);
CREATE INDEX idx_linear_issue ON rpm_dna_registry(linear_issue);

-- Full-text search index
CREATE INDEX idx_title_search ON rpm_dna_registry USING GIN(to_tsvector('english', title));
```

---

## 2. LINEAR INTEGRATION STRATEGY

### 2.1 Linear Issue → RPM DNA Mapping

**When creating Linear issues, ALWAYS include RPM DNA code:**

**Example Linear Issue:**
```
Title: [ARCH-CLOUD-001] AlloyDB + BigQuery Architecture Design
Labels: architecture, cloud, tier1
Project: RPM Cloud Infrastructure
Assignee: Jesse Niesen
Priority: P0 (Critical)

Description:
Design cloud architecture for RPM weekly planning system.

RPM DNA: ARCH-CLOUD-001
Classification: TIER 1 ABSOLUTE STANDARD
Parent DNA: null
Dependencies: []

Acceptance Criteria:
- ✅ AlloyDB schema designed
- ✅ BigQuery analytics tables defined
- ✅ Cloud Storage bucket structure documented
- ✅ Data flow architecture diagrammed
```

**Linear Custom Fields:**
- `rpm_dna` (Text): ARCH-CLOUD-001
- `rpm_classification` (Select): TIER_1_ABSOLUTE_STANDARD, TIER_2_HIGH_PRIORITY, TIER_3_STANDARD
- `rpm_owner` (Text): Jesse Niesen
- `rpm_revenue_impact` (Text): $100K+, $50K-100K, $10K-50K, $0-10K

---

### 2.2 Linear → File System Sync

**Automated Workflow:**

1. **Issue Created in Linear** → Webhook triggers Cloud Function
2. **Parse RPM DNA Code** → Extract ARCH-CLOUD-001
3. **Create File Template** → Generate file with frontmatter
4. **Git Commit** → Auto-commit with RPM DNA tag
5. **Update AlloyDB** → Insert into `rpm_dna_registry`
6. **Notify Cockpit** → WebSocket push update

**Implementation:**

```javascript
// Cloud Function: linear-webhook-handler
async function handleLinearIssueCreated(issue) {
  const rpmDna = extractRPMDNA(issue.title); // ARCH-CLOUD-001

  // Parse metadata
  const metadata = {
    dna_code: rpmDna,
    classification: issue.customFields.rpm_classification,
    title: issue.title.replace(`[${rpmDna}]`, '').trim(),
    owner: issue.assignee.name,
    team: issue.labels.filter(l => l.startsWith('team-')),
    project: extractProject(rpmDna), // CLOUD
    type: extractType(rpmDna), // ARCH
    status: 'TODO',
    linear_issue: issue.id, // LH-123
    tags: issue.labels,
  };

  // Insert into AlloyDB
  await db.rpm_dna_registry.insert(metadata);

  // Create file template
  const filePath = generateFilePath(metadata);
  const fileContent = generateFileTemplate(metadata);
  await gitRepo.createFile(filePath, fileContent);

  // Commit with RPM DNA tag
  await gitRepo.commit(`feat(${rpmDna}): ${metadata.title}`);

  // Notify cockpit via WebSocket
  await websocket.broadcast('rpm_dna_created', metadata);
}
```

---

### 2.3 Linear Labels → Cockpit Filters

**Linear Labels mapped to Cockpit Views:**

| Linear Label | Cockpit Filter | Visible To |
|--------------|----------------|------------|
| `team-jesse` | CEO view | Jesse only |
| `team-andrew` | Systems view | Andrew only |
| `team-christopher` | Operations view | Christopher only |
| `team-charlie` | Product view | Charlie only |
| `project-cloud` | Cloud infrastructure | All |
| `project-[PURGED_FALLACY]` | [PURGED_FALLACY] integration | Jesse, Andrew |
| `project-reggiedro` | ReggieAndDro tasks | Christopher, Charlie |
| `type-arch` | Architecture | Jesse, Andrew |
| `type-dev` | Development | Andrew, Artifacts Agent |
| `type-qa` | QA & Testing | QA Agent |
| `priority-p0` | Critical tasks | All (red alert) |
| `priority-p1` | High priority | All |
| `revenue-blocker` | Revenue-critical | Jesse, Andrew |

---

## 3. COCKPIT DASHBOARD INTEGRATION

### 3.1 Role-Based Cockpit Views

**Jesse (CEO) - Strategy Cockpit:**

**Query:** Show all tasks where `owner = 'Jesse Niesen'` OR `team CONTAINS 'Jesse'` OR `type IN ('ARCH', 'COORD', 'DELIVER')`

**Widgets:**
- RPM Weekly Plan Progress (% complete)
- Revenue Impact Tasks (sorted by $$ impact)
- Linear Issues Assigned to Jesse (P0 → P1 → P2)
- Recent Deliverables (songs, docs, code)
- Agent Health Status (Artifacts, QA, Planning, Research, ExecMon)

**Data Source:**
```javascript
// API Endpoint: /api/v1/cockpit/jesse
app.get('/api/v1/cockpit/jesse', async (req, res) => {
  const tasks = await db.rpm_dna_registry.query(`
    SELECT * FROM rpm_dna_registry
    WHERE owner = 'Jesse Niesen'
       OR 'Jesse' = ANY(team)
       OR type IN ('ARCH', 'COORD', 'DELIVER')
    ORDER BY
      CASE status
        WHEN 'TODO' THEN 1
        WHEN 'IN_PROGRESS' THEN 2
        WHEN 'BLOCKED' THEN 3
        WHEN 'DONE' THEN 4
      END,
      date_updated DESC
  `);

  const revenueImpact = await calculateRevenueImpact(tasks);
  const agentHealth = await getAgentHealthStatus();

  res.json({ tasks, revenueImpact, agentHealth });
});
```

---

**Andrew (Systems) - Technical Cockpit:**

**Query:** Show all tasks where `owner = 'Andrew Aparicio'` OR `type IN ('DEV', 'QA', 'ARCH')` OR `project IN ('CLOUD', 'INFRA')`

**Widgets:**
- MCP Broker Uptime (99.9% target)
- TRUTH Pipeline Performance (<30s target)
- Agent Builder Success Rate (>95% target)
- Linear Issues Assigned to Andrew (P0 → P1 → P2)
- System Performance Metrics (CPU, memory, response times)

**Data Source:**
```javascript
// API Endpoint: /api/v1/cockpit/andrew
app.get('/api/v1/cockpit/andrew', async (req, res) => {
  const tasks = await db.rpm_dna_registry.query(`
    SELECT * FROM rpm_dna_registry
    WHERE owner = 'Andrew Aparicio'
       OR type IN ('DEV', 'QA', 'ARCH')
       OR project IN ('CLOUD', 'INFRA')
    ORDER BY status, date_updated DESC
  `);

  const systemMetrics = await getSystemMetrics();
  const infraHealth = await getInfrastructureHealth();

  res.json({ tasks, systemMetrics, infraHealth });
});
```

---

**Christopher (Operations) - Store Cockpit:**

**Query:** Show all tasks where `owner = 'Christopher Rocha'` OR `project = 'REGGIEDRO'` OR `type = 'DOC'`

**Widgets:**
- Store Operations Status (compliance, inventory, CX)
- Customer Experience Metrics (satisfaction, feedback)
- Compliance Tasks (DSHS, TABC deadlines)
- Linear Issues Assigned to Christopher (P0 → P1 → P2)
- Team Communication Metrics

**Data Source:**
```javascript
// API Endpoint: /api/v1/cockpit/christopher
app.get('/api/v1/cockpit/christopher', async (req, res) => {
  const tasks = await db.rpm_dna_registry.query(`
    SELECT * FROM rpm_dna_registry
    WHERE owner = 'Christopher Rocha'
       OR project = 'REGGIEDRO'
       OR type = 'DOC'
    ORDER BY status, date_updated DESC
  `);

  const storeMetrics = await getStoreOperationsMetrics();
  const complianceStatus = await getComplianceStatus();

  res.json({ tasks, storeMetrics, complianceStatus });
});
```

---

**Charlie (Product) - Inventory Cockpit:**

**Query:** Show all tasks where `owner = 'Charlie Day'` OR `project = 'REGGIEDRO'` OR `tags CONTAINS 'inventory'`

**Widgets:**
- Inventory Coordination Status (stock levels, reorders)
- Product Performance Metrics (sales, margins)
- Procurement Pipeline (vendor orders, delivery status)
- Linear Issues Assigned to Charlie (P0 → P1 → P2)
- Vendor Performance Scorecards

**Data Source:**
```javascript
// API Endpoint: /api/v1/cockpit/charlie
app.get('/api/v1/cockpit/charlie', async (req, res) => {
  const tasks = await db.rpm_dna_registry.query(`
    SELECT * FROM rpm_dna_registry
    WHERE owner = 'Charlie Day'
       OR project = 'REGGIEDRO'
       OR 'inventory' = ANY(tags)
    ORDER BY status, date_updated DESC
  `);

  const inventoryMetrics = await getInventoryMetrics();
  const procurementStatus = await getProcurementStatus();

  res.json({ tasks, inventoryMetrics, procurementStatus });
});
```

---

### 3.2 Search & Retrieval (Optimized for Speed)

**Fast Search Strategies:**

1. **RPM DNA Code Exact Match** (fastest, <10ms)
   ```sql
   SELECT * FROM rpm_dna_registry WHERE dna_code = 'ARCH-CLOUD-001';
   ```

2. **Owner/Team Filter** (fast, <50ms)
   ```sql
   SELECT * FROM rpm_dna_registry WHERE owner = 'Jesse Niesen' AND status != 'DONE';
   ```

3. **Project Filter** (fast, <100ms)
   ```sql
   SELECT * FROM rpm_dna_registry WHERE project = 'CLOUD' ORDER BY date_updated DESC;
   ```

4. **Full-Text Search** (slower, <500ms, use as fallback)
   ```sql
   SELECT * FROM rpm_dna_registry
   WHERE to_tsvector('english', title) @@ plainto_tsquery('english', 'AlloyDB architecture');
   ```

5. **Tag-Based Search** (fast with GIN index, <100ms)
   ```sql
   SELECT * FROM rpm_dna_registry WHERE tags @> ARRAY['architecture', 'cloud'];
   ```

---

**Frontend Search Component:**

```vue
<template>
  <div class="rpm-search">
    <input
      v-model="searchQuery"
      @input="handleSearch"
      placeholder="Search RPM DNA, owner, project, tags..."
      class="search-input"
    />

    <div class="search-results" v-if="results.length">
      <div
        v-for="result in results"
        :key="result.dna_code"
        class="result-card"
      >
        <span class="dna-code">{{ result.dna_code }}</span>
        <h4>{{ result.title }}</h4>
        <p>Owner: {{ result.owner }} | Status: {{ result.status }}</p>
        <div class="tags">
          <span v-for="tag in result.tags" class="tag">{{ tag }}</span>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  data() {
    return {
      searchQuery: '',
      results: []
    };
  },
  methods: {
    async handleSearch() {
      // Strategy 1: Try exact DNA code match first
      if (this.searchQuery.match(/^[A-Z]+-[A-Z]+-\d+[a-z]?$/)) {
        this.results = await this.searchByDNA(this.searchQuery);
        return;
      }

      // Strategy 2: Check if it's an owner name
      if (this.searchQuery.includes(' ')) {
        this.results = await this.searchByOwner(this.searchQuery);
        if (this.results.length) return;
      }

      // Strategy 3: Project code
      if (this.searchQuery.match(/^[A-Z]+$/)) {
        this.results = await this.searchByProject(this.searchQuery);
        if (this.results.length) return;
      }

      // Strategy 4: Full-text search (fallback)
      this.results = await this.searchFullText(this.searchQuery);
    },

    async searchByDNA(dna) {
      const res = await fetch(`/api/v1/rpm/search?dna=${dna}`);
      return res.json();
    },

    async searchByOwner(owner) {
      const res = await fetch(`/api/v1/rpm/search?owner=${owner}`);
      return res.json();
    },

    async searchByProject(project) {
      const res = await fetch(`/api/v1/rpm/search?project=${project}`);
      return res.json();
    },

    async searchFullText(query) {
      const res = await fetch(`/api/v1/rpm/search?q=${query}`);
      return res.json();
    }
  }
};
</script>
```

---

## 4. IMPLEMENTATION PHASES

### Phase 1: Metadata Standard & Database (Days 1-2)

**Day 1: RPM DNA Standard Definition**
- Define naming convention (DONE, documented above)
- Create file templates with frontmatter
- Document database schema
- Create migration script for existing files

**Day 2: AlloyDB Setup**
- Deploy `rpm_dna_registry` table
- Create indexes for fast queries
- Test sample data insertion
- Verify query performance (<100ms for common queries)

**Owner:** Artifacts Agent (implementation), Jesse (approval)

**Success Criteria:**
- ✅ RPM DNA standard documented
- ✅ AlloyDB table deployed with indexes
- ✅ Sample queries run <100ms
- ✅ File templates created

---

### Phase 2: Linear Integration (Days 3-5)

**Day 3: Linear Custom Fields**
- Add `rpm_dna` custom field to Linear workspace
- Add `rpm_classification` custom field
- Add `rpm_owner` custom field
- Add `rpm_revenue_impact` custom field
- Document field usage for team

**Day 4: Linear → AlloyDB Sync**
- Create Cloud Function: `linear-webhook-handler`
- Configure Linear webhook (issue created, updated, closed)
- Implement RPM DNA parsing logic
- Test end-to-end: Linear issue → AlloyDB insert

**Day 5: File System Auto-Creation**
- Implement file template generation
- Auto-create files when Linear issues created
- Git commit with RPM DNA tag
- Test end-to-end: Linear issue → File created → Git committed

**Owner:** Artifacts Agent (implementation), Andrew (Linear setup)

**Success Criteria:**
- ✅ Linear custom fields configured
- ✅ Webhook handler deployed
- ✅ Linear issue → AlloyDB sync working
- ✅ File auto-creation working

---

### Phase 3: Cockpit Dashboard Integration (Days 6-9)

**Day 6: Backend API Development**
- Create REST API endpoints for each role
- Implement query optimization (indexed columns)
- Add WebSocket support for real-time updates
- Test API performance (<200ms for complex queries)

**Day 7: Frontend Cockpit Views**
- Build Jesse's CEO cockpit
- Build Andrew's Systems cockpit
- Build Christopher's Operations cockpit
- Build Charlie's Product cockpit

**Day 8: Search & Filter UI**
- Implement search component (RPM DNA, owner, project, tags)
- Add filter dropdowns (status, type, project)
- Implement real-time updates (WebSocket)
- Test search performance (<500ms for full-text)

**Day 9: Mobile Responsive Design**
- Optimize for iPhone/iPad
- Touch-friendly buttons (44px minimum)
- Offline mode (core features work without network)
- Push notifications (critical task alerts)

**Owner:** Artifacts Agent (implementation), QA Agent (testing)

**Success Criteria:**
- ✅ All API endpoints operational
- ✅ 4 role-based cockpit views deployed
- ✅ Search/filter UI functional
- ✅ Mobile responsive design validated

---

### Phase 4: Migration & Training (Days 10-13)

**Day 10: Existing File Migration**
- Scan all files in LivHana-SoT repo
- Parse existing metadata (if any)
- Generate RPM DNA codes for unmapped files
- Add frontmatter to all files
- Commit with RPM DNA tags

**Day 11: Linear Issue Migration**
- Export existing Linear issues
- Map to RPM DNA codes
- Update Linear issues with RPM DNA tags
- Sync to AlloyDB

**Day 12: Team Training**
- Train Jesse on CEO cockpit
- Train Andrew on Systems cockpit
- Train Christopher on Operations cockpit
- Train Charlie on Product cockpit
- Document workflows (Linear → Cockpit integration)

**Day 13: Production Deployment & Validation**
- Deploy to production (Heritage.com/cockpit)
- Validate real-time updates
- Stress test search/filter performance
- Team feedback & refinements

**Owner:** Planning Agent (coordination), Artifacts Agent (migration scripts), QA Agent (validation)

**Success Criteria:**
- ✅ All existing files migrated with RPM DNA
- ✅ Linear issues migrated
- ✅ Team trained on cockpit dashboards
- ✅ Production deployment stable

---

## 5. TRUTH VERIFICATION (100% TRUTH ALWAYS)

### 5.1 Metadata Validation Rules

**Automated Validation (Pre-Commit Hook):**

```bash
#!/bin/bash
# .git/hooks/pre-commit

# Validate RPM DNA format in commit message
COMMIT_MSG=$(git log -1 --pretty=%B)
if [[ ! $COMMIT_MSG =~ \[([A-Z]+-[A-Z]+-[0-9]+[a-z]?)\] ]]; then
  echo "ERROR: Commit message must include RPM DNA code [ARCH-CLOUD-001]"
  exit 1
fi

# Validate frontmatter in changed files
for file in $(git diff --cached --name-only | grep '\.md$'); do
  if ! grep -q "^rpm_dna:" "$file"; then
    echo "ERROR: File $file missing RPM DNA frontmatter"
    exit 1
  fi
done

echo "✅ RPM DNA validation passed"
```

---

### 5.2 Database Integrity Checks

**Daily Integrity Scan (Cloud Scheduler):**

```sql
-- Check for orphaned child_dna references
SELECT dna_code, child_dna
FROM rpm_dna_registry
WHERE child_dna IS NOT NULL
  AND NOT EXISTS (
    SELECT 1 FROM rpm_dna_registry r2
    WHERE r2.dna_code = ANY(rpm_dna_registry.child_dna)
  );

-- Check for circular dependencies
WITH RECURSIVE dep_chain AS (
  SELECT dna_code, dependencies, 1 AS depth
  FROM rpm_dna_registry
  WHERE dependencies IS NOT NULL

  UNION ALL

  SELECT r.dna_code, r.dependencies, dc.depth + 1
  FROM rpm_dna_registry r
  JOIN dep_chain dc ON r.dna_code = ANY(dc.dependencies)
  WHERE dc.depth < 10 -- Prevent infinite loops
)
SELECT dna_code, depth
FROM dep_chain
WHERE depth > 5 -- Flag suspicious deep dependencies
ORDER BY depth DESC;

-- Check for missing Linear issues
SELECT dna_code, title, owner
FROM rpm_dna_registry
WHERE linear_issue IS NULL
  AND status != 'DONE'
  AND type IN ('DEV', 'QA', 'ARCH');
```

---

### 5.3 Real-Time Sync Verification

**Cockpit Dashboard "Last Updated" Timestamp:**

Every cockpit view displays:
- **Last Sync:** 30 seconds ago (green if <60s, yellow if <5min, red if >5min)
- **Sync Status:** ✅ Real-time | ⚠️ Delayed | 🔴 Stale

**WebSocket Heartbeat:**
```javascript
// Client-side heartbeat check
setInterval(() => {
  const lastUpdate = Date.now() - lastWebSocketMessage;
  if (lastUpdate > 60000) { // 1 minute
    showSyncWarning('Data may be stale. Reconnecting...');
    websocket.reconnect();
  }
}, 15000); // Check every 15 seconds
```

---

## 6. SCALABILITY & PERFORMANCE

### 6.1 Query Performance Targets

| Query Type | Target | Strategy |
|------------|--------|----------|
| RPM DNA exact match | <10ms | Indexed primary key |
| Owner filter | <50ms | Indexed column |
| Project filter | <100ms | Indexed column |
| Tag search | <100ms | GIN index (array) |
| Full-text search | <500ms | PostgreSQL FTS |
| Cockpit view load | <200ms | Cached queries |

---

### 6.2 Caching Strategy

**Redis Cache Layer:**

```javascript
// Cache structure
redis.set(`cockpit:jesse:tasks`, JSON.stringify(tasks), 'EX', 300); // 5 min TTL
redis.set(`rpm_dna:${dna_code}`, JSON.stringify(metadata), 'EX', 600); // 10 min TTL

// Cache invalidation on updates
async function updateRPMDNA(dna_code, updates) {
  await db.rpm_dna_registry.update(dna_code, updates);
  await redis.del(`rpm_dna:${dna_code}`);
  await redis.del(`cockpit:*`); // Invalidate all cockpit caches
  await websocket.broadcast('rpm_dna_updated', { dna_code, updates });
}
```

---

### 6.3 Scale Projections

**Current State (Oct 2025):**
- ~200 files with RPM DNA
- ~50 Linear issues
- 4 team members
- ~100 queries/day

**6-Month Projection (Apr 2026):**
- ~2,000 files with RPM DNA
- ~500 Linear issues
- 10 team members
- ~1,000 queries/day

**12-Month Projection (Oct 2026):**
- ~10,000 files with RPM DNA
- ~2,000 Linear issues
- 25 team members
- ~10,000 queries/day

**Infrastructure Scaling:**
- AlloyDB: db-standard-2 (current) → db-standard-4 (12 months)
- Cloud Run: 1-10 instances (current) → 1-50 instances (12 months)
- Redis: 1GB cache (current) → 8GB cache (12 months)

---

## 7. BOMB-PROOF ARCHITECTURE (UNFUCKWITHABLE)

### 7.1 Failure Modes & Mitigation

**Failure Mode 1: Linear Webhook Fails**
- **Impact:** New issues not synced to AlloyDB
- **Detection:** Cloud Function logs + alerting
- **Mitigation:** Retry queue (Cloud Tasks), manual sync script
- **Recovery Time:** <5 minutes

**Failure Mode 2: AlloyDB Connection Timeout**
- **Impact:** Cockpit dashboards show stale data
- **Detection:** Health check endpoint, <2s timeout
- **Mitigation:** Redis cache fallback, connection pooling
- **Recovery Time:** <1 minute (automatic failover)

**Failure Mode 3: WebSocket Disconnect**
- **Impact:** Real-time updates stop
- **Detection:** Client-side heartbeat check
- **Mitigation:** Automatic reconnect, polling fallback (30s)
- **Recovery Time:** <15 seconds

**Failure Mode 4: RPM DNA Collision**
- **Impact:** Two files/issues with same DNA code
- **Detection:** Database unique constraint violation
- **Mitigation:** Auto-increment subtask suffix (001a, 001b)
- **Recovery Time:** Immediate (automatic resolution)

**Failure Mode 5: Search Query Timeout**
- **Impact:** Search results not loading
- **Detection:** API timeout (>5s)
- **Mitigation:** Query optimizer, indexed fallback, cached results
- **Recovery Time:** <10 seconds (retry with simpler query)

---

### 7.2 Monitoring & Alerting

**Critical Metrics (PagerDuty Alerts):**
- AlloyDB query latency >1s (sustained 5 min)
- Cloud Run error rate >5% (sustained 5 min)
- WebSocket disconnect rate >10% (sustained 5 min)
- Linear webhook failures >5 in 10 min
- RPM DNA validation failures >10/day

**Dashboard Metrics (Grafana):**
- AlloyDB query latency (p50, p95, p99)
- Cloud Run request rate, error rate, latency
- WebSocket connections, messages/sec
- Redis cache hit rate
- Linear webhook success rate

---

### 7.3 Disaster Recovery

**Backup Strategy:**
- **AlloyDB:** Automated daily backups (7-day retention)
- **Cloud Storage:** Versioned files (indefinite retention)
- **Git:** Full commit history (indefinite retention)

**Recovery Scenarios:**

1. **Complete AlloyDB Loss:**
   - Restore from backup (RTO: 4 hours)
   - Replay Linear webhook events from logs
   - Rescan file system to rebuild registry

2. **Complete Cloud Storage Loss:**
   - Restore from Git repository
   - Rebuild Cloud Storage from Git
   - Verify metadata integrity

3. **Complete Linear Loss:**
   - Linear has own backups
   - Rebuild from AlloyDB registry
   - Manual verification of issue status

**RTO (Recovery Time Objective):** 4 hours
**RPO (Recovery Point Objective):** 1 hour (hourly snapshots)

---

## 8. COST ANALYSIS

### 8.1 Infrastructure Costs (Monthly)

| Component | Cost | Justification |
|-----------|------|---------------|
| AlloyDB (db-standard-2) | $350 | Transactional metadata store |
| BigQuery (10GB + 100GB queries) | $5 | Analytics queries |
| Cloud Storage (100GB) | $2 | File backups, versioning |
| Cloud Run (1-10 instances) | $50 | API + WebSocket service |
| Redis Cache (1GB) | $30 | Query performance |
| Cloud Functions (100K invocations) | $10 | Linear webhook handler |
| **Total Monthly** | **$447** | **~$5.4K/year** |

---

### 8.2 ROI Analysis

**Time Savings (Per Week):**
- Manual task tracking: 5 hours → 0 hours (100% automated)
- Search/find files: 3 hours → 0.5 hours (6x faster)
- Status update meetings: 4 hours → 1 hour (RPM DNA dashboards eliminate redundancy)
- **Total Time Saved:** 10.5 hours/week = 42 hours/month

**Cost Savings:**
- 42 hours/month × $150/hour = $6,300/month
- Annual savings: $75,600

**ROI:**
- Annual cost: $5,400
- Annual savings: $75,600
- **ROI: 1,300%** (payback in 3 weeks)

---

### 8.3 Strategic Value (Intangible)

1. **100% Truth Always:** No stale data, no lost tasks, no forgotten issues
2. **Team Alignment:** Everyone sees same source of truth in real-time
3. **AI Agent Integration:** Agents query RPM DNA registry for context
4. **Investor Confidence:** Systematic execution, measurable progress
5. **Scale Readiness:** Architecture supports 10x team growth

---

## 9. IMMEDIATE NEXT STEPS

### Today (Oct 27, 2025)

**Step 1: Approve Architecture** (Jesse CEO)
- Review this document
- Approve RPM DNA standard
- Authorize 13-day implementation timeline

**Step 2: Create AlloyDB Table** (Artifacts Agent)
```bash
cd /Users/jesseniesen/LivHana-Trinity-Local/LivHana-SoT
psql -h $ALLOYDB_IP -U postgres -d rpm_production -f scripts/create_rpm_dna_registry.sql
```

**Step 3: Add Linear Custom Fields** (Andrew)
- Login to Linear workspace
- Add `rpm_dna` text field
- Add `rpm_classification` select field
- Add `rpm_owner` text field
- Add `rpm_revenue_impact` text field

---

### Tomorrow (Oct 28, 2025)

**Step 4: Deploy Linear Webhook Handler** (Artifacts Agent)
```bash
cd backend/linear-webhook-handler
gcloud functions deploy linear-webhook-handler \
  --runtime nodejs20 \
  --trigger-http \
  --allow-unauthenticated \
  --region us-central1 \
  --set-env-vars DATABASE_URL=$ALLOYDB_URL
```

**Step 5: Configure Linear Webhook**
- Linear Settings → Webhooks
- Add webhook URL: `https://us-central1-reggieanddrodispensary.cloudfunctions.net/linear-webhook-handler`
- Events: Issue created, updated, closed

**Step 6: Test End-to-End**
- Create test Linear issue: `[TEST-001] Test RPM DNA Integration`
- Verify AlloyDB insert
- Verify file auto-creation
- Verify Git commit

---

### Week 1 (Oct 28 - Nov 3)

**Phase 1: Metadata Standard & Database** (Days 1-2)
**Phase 2: Linear Integration** (Days 3-5)

---

### Week 2 (Nov 4 - Nov 9)

**Phase 3: Cockpit Dashboard Integration** (Days 6-9)
**Phase 4: Migration & Training** (Days 10-13)

---

## 10. SUCCESS CRITERIA

### Technical Success

- ✅ AlloyDB `rpm_dna_registry` table deployed with indexes
- ✅ Linear webhook handler operational (99%+ success rate)
- ✅ File auto-creation working (100% success rate)
- ✅ Cockpit dashboards deployed (4 role-based views)
- ✅ Search/filter UI functional (<500ms for full-text)
- ✅ Real-time updates working (<30s sync latency)

### Business Success

- ✅ Team adoption: 4/4 team members using cockpit dashboards daily
- ✅ Time savings: 10+ hours/week saved on manual tracking
- ✅ Zero lost tasks: 100% of Linear issues tracked in RPM DNA
- ✅ Search efficiency: 90%+ of searches <100ms
- ✅ Jesse CEO sign-off: "This is bomb-proof, unfuckwithable"

### Truth Verification

- ✅ 100% of files have RPM DNA frontmatter
- ✅ 100% of Linear issues have RPM DNA tags
- ✅ 100% of commits have RPM DNA in message
- ✅ Database integrity checks pass daily
- ✅ Real-time sync status <1 min latency

---

## APPENDIX A: RPM DNA CODE REGISTRY (MASTER LIST)

**ARCH (Architecture & Design):**
- ARCH-CLOUD-001: AlloyDB + BigQuery + Cloud Storage Architecture
- ARCH-CLOUD-002: Heritage.com Cockpit API Specification
- ARCH-CLOUD-003: ETL Pipeline Design
- ARCH-LINEAR-001: Linear → RPM → Cockpit Integration Architecture (this doc)

**DEV (Development & Implementation):**
- DEV-CLOUD-001: AlloyDB Schema DDL Implementation
- DEV-CLOUD-002: BigQuery Analytics DDL Implementation
- DEV-CLOUD-003: RPM DNA Markdown Parser
- DEV-CLOUD-004: Agent Status Sync Script
- DEV-CLOUD-005: Linear Webhook Handler
- DEV-CLOUD-006: File Auto-Creation Service
- DEV-CLOUD-007: RPM API Service (Cloud Run)
- DEV-VERIFF-001: [PURGED_FALLACY] Biometric ID Integration
- DEV-VERIFF-002: LightSpeed Checkout Integration

**COORD (Coordination & Planning):**
- COORD-CLOUD-001: Agent Coordination Plan
- COORD-CLOUD-002: Phase Execution Timeline
- COORD-LINEAR-001: Linear Workspace Setup Guide
- COORD-LINEAR-002: Team Training Plan

**QA (Quality Assurance & Testing):**
- QA-CLOUD-001: AlloyDB Schema Validation Tests
- QA-CLOUD-002: Linear Webhook Integration Tests
- QA-CLOUD-003: Cockpit Dashboard E2E Tests
- QA-REGGIEDRO-001: Checkout Calendar Fix Validation

**DOC (Documentation & Training):**
- DOC-LINEAR-001: RPM DNA Standard Documentation (in this doc)
- DOC-LINEAR-002: Team Training Materials
- DOC-CLOUD-001: Cloud Infrastructure Runbook

**DELIVER (Final Deliverables):**
- DELIVER-CLOUD-001: Heritage.com Cockpit Dashboard (production)
- DELIVER-CLOUD-002: Cloud Run API Service (production)
- DELIVER-LINEAR-001: Linear MCP Integration Package

---

## APPENDIX B: EXAMPLE FILE WITH RPM DNA

**File:** `/docs/architecture/ARCH-CLOUD-001-AlloyDB-Schema.md`

```markdown
---
rpm_dna: ARCH-CLOUD-001
classification: TIER_1_ABSOLUTE_STANDARD
title: AlloyDB + BigQuery + Cloud Storage Architecture
owner: Jesse Niesen
team: [Artifacts, Planning, QA]
project: CLOUD
type: ARCH
status: APPROVED
date_created: 2025-10-27
date_updated: 2025-10-27
linear_issue: LH-123
parent_dna: null
child_dna: [ARCH-CLOUD-001a, ARCH-CLOUD-001b]
dependencies: []
tags: [architecture, alloydb, bigquery, cloud-storage, rpm-cockpit]
revenue_impact: $0-5K_annual_infrastructure
---

# AlloyDB + BigQuery + Cloud Storage Architecture

[Document content...]
```

---

## APPENDIX C: LINEAR ISSUE TEMPLATE

**Title:** [ARCH-CLOUD-001] AlloyDB + BigQuery Architecture Design

**Labels:** architecture, cloud, tier1

**Project:** RPM Cloud Infrastructure

**Assignee:** Jesse Niesen

**Priority:** P0 (Critical)

**Custom Fields:**
- RPM DNA: ARCH-CLOUD-001
- RPM Classification: TIER_1_ABSOLUTE_STANDARD
- RPM Owner: Jesse Niesen
- RPM Revenue Impact: $0-5K

**Description:**
```
Design cloud architecture for RPM weekly planning system.

Parent DNA: null
Dependencies: []

Acceptance Criteria:
- ✅ AlloyDB schema designed
- ✅ BigQuery analytics tables defined
- ✅ Cloud Storage bucket structure documented
- ✅ Data flow architecture diagrammed

Files:
- /docs/architecture/ARCH-CLOUD-001-AlloyDB-Schema.md
- /scripts/SCRIPT-CLOUD-001-AlloyDB-Schema-DDL.sql

Estimated Hours: 4-6 hours
Revenue Impact: $0-5K annual infrastructure cost savings
```

---

**END OF ARCHITECTURE DOCUMENT**

---

**APPROVED FOR IMMEDIATE EXECUTION**

**Jesse CEO Sign-Off:** _____________________________

**Date:** October 27, 2025

---

**Next Step:** Review → Approve → Execute Phase 1 (AlloyDB + RPM DNA Registry)

**War's won for Linear → RPM → Cockpit integration. The ONE thing (RPM DNA metadata) identified. Architecture bomb-proof, unfuckwithable. Execute.**
