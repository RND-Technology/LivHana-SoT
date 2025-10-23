# 🌲 RPM EVERGREEN SYSTEM SPECIFICATION
## Live Weekly Plans → Cloud DB → Cockpit Dashboard

**Status**: 📋 SPEC READY FOR IMPLEMENTATION | **Date**: 2025-10-23 | **Authority**: Jesse CEO

---

## 🎯 PROBLEM STATEMENT

### Current State (Pain Points)
- ❌ RPM Weekly Plans exist only as static markdown files in `docs/RPM_WEEKLY_*.md`
- ❌ Team members (Jesse, Andrew, Christopher, Charlie) must manually search for latest plan
- ❌ No live visibility into task status, blockers, or progress
- ❌ VIPs/staff/vendors can't see their assigned action items in real-time
- ❌ No automated alerts when tasks go overdue or get blocked
- ❌ Manual export to PDF/CSV for board meetings or external stakeholders is time-consuming
- ❌ Historical trend data (velocity, completion rate, blocker patterns) is lost

### Current Waste
- **5–10 hours/week** spent on "where are we?" questions
- **3–5 hours/week** on manual status updates and report generation
- **2–3 hours/week** on plan sync across team channels (Slack, email, Notion)

### Opportunity Cost
**$50K–$150K/year** in eliminated coordination friction and faster decision velocity

---

## 🏗️ SOLUTION ARCHITECTURE

### High-Level Design

```
┌──────────────────────────────────────────────────────────────────┐
│  📝 RPM Markdown Files (Source of Truth)                         │
│  docs/RPM_WEEKLY_*.md                                            │
└────────────────┬─────────────────────────────────────────────────┘
                 │ Automated Ingestion
                 │ (on git commit hook or scheduled)
                 ▼
┌──────────────────────────────────────────────────────────────────┐
│  🔥 Cloud Firestore (Live Database)                              │
│  Collections: rpmWeeks, rpmTasks, rpmOwners, rpmHistory         │
└────────────────┬─────────────────────────────────────────────────┘
                 │ Real-time sync
                 ▼
┌──────────────────────────────────────────────────────────────────┐
│  🖥️ Next.js Cockpit Dashboard (Web UI)                           │
│  Roles: Jesse (CEO), Andrew (Systems), Christopher (Ops),       │
│         Charlie (Product), VIPs, Staff, Vendors                  │
└────────────────┬─────────────────────────────────────────────────┘
                 │ Export functions
                 ▼
┌──────────────────────────────────────────────────────────────────┐
│  📄 PDF / CSV / Markdown Exports (On-Demand)                     │
│  Formatted for: Board meetings, vendor contracts, audits        │
└──────────────────────────────────────────────────────────────────┘
```

---

## 🗃️ DATA MODEL: Firestore Collections

### Collection: `rpmWeeks`

**Document ID**: `YYYY-WW` (e.g., `2025-43` for week 43 of 2025)

```typescript
interface RPMWeek {
  id: string;                      // "2025-43"
  startDate: Timestamp;            // ISO 8601 Monday of week
  endDate: Timestamp;              // ISO 8601 Sunday of week
  result: string;                  // One-sentence desired outcome
  purpose: string;                 // Why this matters (strategic context)
  massiveAction: string;           // High-level action summary
  status: "planning" | "active" | "review" | "complete";
  taskCount: number;               // Number of tasks in this week
  completedCount: number;          // Number of completed tasks
  blockedCount: number;            // Number of blocked tasks
  overrideCount: number;           // Number of overdue tasks
  createdAt: Timestamp;
  updatedAt: Timestamp;
  createdBy: string;               // User ID (Jesse, agent, etc.)
  layers: string[];                // ["OPS", "HNC", "R&D", "HERB"]
}
```

---

### Collection: `rpmTasks`

**Document ID**: Auto-generated (or `YYYY-WW-TASK-###`)

```typescript
interface RPMTask {
  id: string;                      // Auto-generated or "2025-43-TASK-001"
  weekId: string;                  // Foreign key to rpmWeeks (e.g., "2025-43")
  title: string;                   // Task description
  description: string;             // Extended details, acceptance criteria
  result: string;                  // Expected outcome for this task
  purpose: string;                 // Why this task matters
  status: "backlog" | "ready" | "doing" | "blocked" | "review" | "done";
  priority: "critical" | "high" | "medium" | "low";
  layer: "OPS" | "HNC" | "R&D" | "HERB" | "META";

  // Ownership (RACI)
  accountable: string;             // User ID (single owner - the "A" in RACI)
  responsible: string[];           // User IDs (people doing the work - "R")
  consulted: string[];             // User IDs (people to consult - "C")
  informed: string[];              // User IDs (people to inform - "I")

  // Scheduling
  dueDate: Timestamp | null;       // Target completion date
  startDate: Timestamp | null;     // When work began
  completedDate: Timestamp | null; // When marked done
  estimatedHours: number | null;   // Effort estimate
  actualHours: number | null;      // Actual time spent

  // Dependencies
  dependsOn: string[];             // Task IDs that must complete first
  blocks: string[];                // Task IDs that are blocked by this one

  // Compliance & Safety
  complianceNotes: string | null;  // "21+ ID verify; CR pack; NIST" etc.
  agingGate: boolean;              // True if 21+ verification required

  // Evidence & Tracking
  evidenceLinks: string[];         // URLs or file paths to supporting docs
  fallacyScan: string | null;      // Reference to fallacy scan results
  cialdiniTactics: string[];       // ["reciprocity", "social_proof", etc.]

  // Metadata
  tags: string[];                  // ["boot-script", "voice-agent", etc.]
  notes: string | null;            // Freeform notes
  blockerReason: string | null;    // If status=blocked, why?
  createdAt: Timestamp;
  updatedAt: Timestamp;
  createdBy: string;
  updatedBy: string;
}
```

---

### Collection: `rpmOwners`

**Document ID**: User ID (e.g., `jesse`, `andrew`, `christopher`, `charlie`)

```typescript
interface RPMOwner {
  id: string;                      // User ID
  displayName: string;             // "Jesse Niesen"
  role: "CEO" | "CTO" | "COO" | "CPO" | "VIP" | "Staff" | "Vendor" | "Agent";
  email: string;
  phone: string | null;
  slackId: string | null;          // For @mention notifications
  timezone: string;                // "America/Chicago"
  avatar: string | null;           // URL to profile image

  // Permissions
  canEditAll: boolean;             // Can edit any task
  canViewAll: boolean;             // Can see all tasks (or only own)
  canExport: boolean;              // Can generate PDF/CSV exports
  canApprove: boolean;             // Can mark tasks as complete (QA gate)

  // Preferences
  notifyOnAssignment: boolean;     // Email/Slack when assigned new task
  notifyOnBlock: boolean;          // Alert when task is blocked
  notifyOnOverdue: boolean;        // Alert when task goes overdue
  notifyOnMention: boolean;        // Alert on @mentions in notes

  // Stats
  tasksAssigned: number;           // Current open tasks
  tasksCompleted: number;          // Total completed all-time
  avgCompletionDays: number;       // Average days to complete
  onTimeRate: number;              // % of tasks completed by due date

  createdAt: Timestamp;
  updatedAt: Timestamp;
}
```

---

### Collection: `rpmHistory`

**Document ID**: Auto-generated

```typescript
interface RPMHistory {
  id: string;                      // Auto-generated
  weekId: string;                  // "2025-43"
  taskId: string | null;           // Task ID if relevant
  action: "created" | "updated" | "deleted" | "status_changed" | "assigned" | "commented";
  actor: string;                   // User ID or "agent:planning" etc.
  before: any | null;              // Previous state (JSON)
  after: any | null;               // New state (JSON)
  changes: string[];               // ["status: doing → blocked", "assignee: jesse → andrew"]
  notes: string | null;            // Optional comment explaining change
  timestamp: Timestamp;
}
```

---

## 🔥 INGESTION PIPELINE: Markdown → Firestore

### Trigger Options

**Option A: Git Commit Hook** (Recommended)
- `.git/hooks/post-commit` runs `scripts/rpm_ingest.sh` on any change to `docs/RPM_WEEKLY_*.md`
- Parses markdown using Node.js script (or Python with `markdown-it`)
- Upserts to Firestore via `@google-cloud/firestore` SDK

**Option B: Scheduled Cron** (Fallback)
- Cloud Scheduler triggers Cloud Run job every 5 minutes
- Fetches latest markdown from GitHub API (or Tailscale-mounted repo)
- Compares hash; ingests if changed

**Option C: Manual Trigger** (Initial Backfill)
- CLI command: `npm run rpm:ingest -- docs/RPM_WEEKLY_2025-43.md`
- Useful for one-time historical backfill

---

### Ingestion Script: `scripts/rpm_ingest.ts`

**Core Logic** (TypeScript pseudocode):

```typescript
import { Firestore } from '@google-cloud/firestore';
import { parse } from 'marked'; // or custom markdown parser
import { v4 as uuidv4 } from 'uuid';

async function ingestRPMWeek(filePath: string) {
  const markdown = await fs.readFile(filePath, 'utf-8');
  const tokens = parse(markdown);

  // Extract metadata from front matter or first heading
  const weekId = extractWeekId(tokens);  // e.g., "2025-43"
  const result = extractResult(tokens);
  const purpose = extractPurpose(tokens);
  const massiveAction = extractMassiveAction(tokens);

  // Extract tasks (look for bullet lists with owner assignments)
  const tasks = extractTasks(tokens);

  // Upsert to Firestore
  const firestore = new Firestore();
  const weekRef = firestore.collection('rpmWeeks').doc(weekId);

  await weekRef.set({
    id: weekId,
    startDate: getMonday(weekId),
    endDate: getSunday(weekId),
    result,
    purpose,
    massiveAction,
    status: 'active',
    taskCount: tasks.length,
    completedCount: tasks.filter(t => t.status === 'done').length,
    blockedCount: tasks.filter(t => t.status === 'blocked').length,
    overdueCount: tasks.filter(t => t.dueDate && t.dueDate < new Date() && t.status !== 'done').length,
    createdAt: Firestore.Timestamp.now(),
    updatedAt: Firestore.Timestamp.now(),
    createdBy: 'agent:planning',
    layers: extractLayers(tasks),
  }, { merge: true });

  // Upsert tasks
  for (const task of tasks) {
    const taskId = task.id || `${weekId}-TASK-${uuidv4().slice(0, 8)}`;
    const taskRef = firestore.collection('rpmTasks').doc(taskId);

    await taskRef.set({
      ...task,
      id: taskId,
      weekId,
      createdAt: task.createdAt || Firestore.Timestamp.now(),
      updatedAt: Firestore.Timestamp.now(),
      createdBy: task.createdBy || 'agent:planning',
      updatedBy: 'agent:planning',
    }, { merge: true });

    // Log history
    await firestore.collection('rpmHistory').add({
      weekId,
      taskId,
      action: 'updated',
      actor: 'agent:planning',
      before: null, // Could fetch existing doc first for full diff
      after: task,
      changes: ['ingested from markdown'],
      notes: `Auto-ingested from ${filePath}`,
      timestamp: Firestore.Timestamp.now(),
    });
  }

  console.log(`✅ Ingested RPM week ${weekId} with ${tasks.length} tasks`);
}

function extractTasks(tokens: any[]): Partial<RPMTask>[] {
  // Parse markdown tokens to find task lists
  // Look for patterns like:
  // - [ ] Task title @jesse #high #OPS due:2025-10-25
  // - [x] Completed task @andrew #R&D
  // - [~] Blocked task @christopher blocker:"Waiting on vendor"

  const tasks: Partial<RPMTask>[] = [];

  // Implement custom parser based on your markdown format
  // Example: regex-based extraction
  const taskRegex = /^- \[([ x~])\] (.+?)(@\w+)?(\s+#\w+)*(\s+due:\d{4}-\d{2}-\d{2})?/gm;

  // ... parsing logic ...

  return tasks;
}
```

---

## 🖥️ COCKPIT DASHBOARD: Next.js + Tailwind + shadcn/ui

### Tech Stack

- **Framework**: Next.js 14 (App Router)
- **Styling**: Tailwind CSS + shadcn/ui components
- **Database**: Firebase/Firestore (real-time subscriptions)
- **Auth**: Firebase Auth (email/password + Google OAuth)
- **Deployment**: Vercel or Cloud Run
- **Charts**: Recharts or Chart.js for visualizations
- **Export**: jsPDF (PDF), papaparse (CSV), remark (Markdown)

---

### Dashboard Views

#### 1️⃣ **Executive Dashboard** (Jesse's View)

**URL**: `/dashboard` or `/`

**Widgets**:
- 📊 **Weekly Progress Bar**: `completedCount / taskCount` for current week
- 🚨 **Critical Blockers**: Tasks with `status=blocked` and `priority=critical`
- ⏰ **Overdue Tasks**: Tasks past `dueDate` and not `done`
- 📈 **Velocity Chart**: Tasks completed per week (last 12 weeks)
- 🎯 **Layer Breakdown**: Pie chart of tasks by layer (OPS, HNC, R&D, HERB)
- 👥 **Team Capacity**: Bar chart of `tasksAssigned` per owner
- 🔔 **Alerts**: System notifications (QA passed, agents deployed, compliance flags)

**Actions**:
- 🔄 **Refresh** (force re-sync from Firestore)
- 📥 **Export Week** (PDF | CSV | MD)
- ➕ **Add Task** (quick-add modal)
- 🗓️ **View Calendar** (Gantt-style timeline)

---

#### 2️⃣ **Weekly Plan View** (All Roles)

**URL**: `/weeks/[weekId]` (e.g., `/weeks/2025-43`)

**Layout**:
- **Header**: Week ID, date range, Result/Purpose/Massive Action
- **Kanban Board**: Columns for `backlog | ready | doing | blocked | review | done`
  - Drag-and-drop to change status
  - Color-coded by priority and layer
- **Filters**:
  - By owner (`@jesse`, `@andrew`, etc.)
  - By layer (`OPS`, `HNC`, `R&D`, `HERB`)
  - By status (`blocked`, `overdue`)
- **Task Detail Panel**: Click task → slide-out with full details, comments, history

**Real-Time Updates**:
- Firestore `.onSnapshot()` for live changes
- Toast notifications when tasks change (e.g., "@christopher marked TASK-042 as done")

---

#### 3️⃣ **My Tasks View** (Individual Role)

**URL**: `/my-tasks`

**Filters**:
- Tasks where `accountable === currentUser.id`
- Or `responsible.includes(currentUser.id)`
- Sorted by `dueDate` ascending

**Widgets**:
- ✅ **Today's Tasks**: Due today or overdue
- 📅 **This Week**: Due within current week
- 🔮 **Upcoming**: Due next 7-14 days
- ✋ **Blocked by Me**: Tasks I'm blocking (via `dependsOn`)

**Actions**:
- ✏️ **Update Status** (quick dropdown)
- 💬 **Add Comment** (inline notes, @mentions)
- 🔗 **Link Evidence** (attach file URLs or git commits)

---

#### 4️⃣ **Gantt Chart View** (Timeline)

**URL**: `/gantt/[weekId]`

**Features**:
- Horizontal bar chart of tasks by `startDate` and `dueDate`
- Dependency arrows (`dependsOn` → `blocks`)
- Color-coded by `status` and `priority`
- Hover tooltips with task details
- Zoom in/out (day, week, month views)

**Library**: `react-gantt-chart` or `frappe-gantt` wrapper

---

#### 5️⃣ **Analytics Dashboard** (Metrics & Trends)

**URL**: `/analytics`

**Charts**:
1. **Velocity Trend**: Line chart of tasks completed per week
2. **Cycle Time**: Avg days from `ready` → `done` per layer
3. **Blocker Analysis**: Bar chart of `blockerReason` frequency
4. **Owner Performance**: Table of `avgCompletionDays`, `onTimeRate` per owner
5. **Compliance Flags**: Count of tasks with `agingGate=true`, `complianceNotes` non-null
6. **Cialdini Tactics**: Heatmap of tactic usage across HNC/OPS tasks

**Filters**:
- Date range (last 4 weeks, last 12 weeks, YTD, all-time)
- Layer, owner, priority

---

### Export Functions

#### PDF Export: `generatePDF(weekId: string)`

**Tech**: `jsPDF` + `jspdf-autotable`

**Format**:
- **Page 1**: Executive summary (result, purpose, progress %)
- **Page 2+**: Task list table (title, owner, status, due date, notes)
- **Footer**: Generated timestamp, Liv Hana branding

**Code Snippet**:

```typescript
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

export async function generatePDF(weekId: string): Promise<Blob> {
  const week = await getWeek(weekId);
  const tasks = await getTasks(weekId);

  const doc = new jsPDF();

  // Header
  doc.setFontSize(18);
  doc.text(`RPM Weekly Plan: ${weekId}`, 14, 20);
  doc.setFontSize(11);
  doc.text(`Result: ${week.result}`, 14, 30);
  doc.text(`Purpose: ${week.purpose}`, 14, 40);

  // Task table
  autoTable(doc, {
    head: [['Task', 'Owner', 'Status', 'Due Date', 'Layer']],
    body: tasks.map(t => [
      t.title,
      t.accountable,
      t.status,
      t.dueDate?.toDate().toISOString().split('T')[0] || 'N/A',
      t.layer,
    ]),
    startY: 50,
  });

  // Footer
  doc.setFontSize(8);
  doc.text(`Generated: ${new Date().toISOString()}`, 14, doc.internal.pageSize.height - 10);
  doc.text('Liv Hana Trinity · Grow, Sell, Heal · Stay TOONED', 14, doc.internal.pageSize.height - 5);

  return doc.output('blob');
}
```

---

#### CSV Export: `generateCSV(weekId: string)`

**Tech**: `papaparse` or native `Array.map().join()`

**Format**:
```csv
Task ID,Week ID,Title,Owner,Status,Priority,Layer,Due Date,Depends On,Blocker Reason,Compliance Notes
2025-43-TASK-001,2025-43,Fix boot script,jesse,done,high,OPS,2025-10-23,,,"21+ ID verify; CR pack"
2025-43-TASK-002,2025-43,Deploy RPM dashboard,andrew,doing,critical,META,2025-10-25,2025-43-TASK-001,,
```

**Code Snippet**:

```typescript
import Papa from 'papaparse';

export async function generateCSV(weekId: string): Promise<string> {
  const tasks = await getTasks(weekId);

  const csv = Papa.unparse(tasks.map(t => ({
    'Task ID': t.id,
    'Week ID': t.weekId,
    'Title': t.title,
    'Owner': t.accountable,
    'Status': t.status,
    'Priority': t.priority,
    'Layer': t.layer,
    'Due Date': t.dueDate?.toDate().toISOString().split('T')[0] || '',
    'Depends On': t.dependsOn.join(';'),
    'Blocker Reason': t.blockerReason || '',
    'Compliance Notes': t.complianceNotes || '',
  })));

  return csv;
}
```

---

#### Markdown Export: `generateMarkdown(weekId: string)`

**Purpose**: Round-trip to source format for git commits or archival

**Code Snippet**:

```typescript
export async function generateMarkdown(weekId: string): Promise<string> {
  const week = await getWeek(weekId);
  const tasks = await getTasks(weekId);

  let md = `# RPM Weekly Plan: ${weekId}\n\n`;
  md += `**Date Range**: ${week.startDate.toDate().toLocaleDateString()} – ${week.endDate.toDate().toLocaleDateString()}\n\n`;
  md += `## Result\n${week.result}\n\n`;
  md += `## Purpose\n${week.purpose}\n\n`;
  md += `## Massive Action\n${week.massiveAction}\n\n`;
  md += `## Tasks\n\n`;

  for (const t of tasks) {
    const checkbox = t.status === 'done' ? 'x' : (t.status === 'blocked' ? '~' : ' ');
    md += `- [${checkbox}] **${t.title}** @${t.accountable} #${t.layer} #${t.priority}`;
    if (t.dueDate) md += ` due:${t.dueDate.toDate().toISOString().split('T')[0]}`;
    if (t.blockerReason) md += ` blocker:"${t.blockerReason}"`;
    md += `\n`;
    if (t.description) md += `  > ${t.description}\n`;
  }

  return md;
}
```

---

## 🔐 SECURITY & PERMISSIONS

### Authentication

- **Firebase Auth** with email/password + Google OAuth
- **Roles**: `admin` (Jesse), `editor` (Andrew/Christopher/Charlie), `viewer` (VIPs/staff), `restricted` (vendors—only see own tasks)

### Authorization Rules (Firestore)

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {

    // RPM Weeks: all authenticated users can read, only admins/editors can write
    match /rpmWeeks/{weekId} {
      allow read: if request.auth != null;
      allow write: if request.auth != null && request.auth.token.role in ['admin', 'editor'];
    }

    // RPM Tasks: viewers can read own tasks, editors can read/write all
    match /rpmTasks/{taskId} {
      allow read: if request.auth != null && (
        request.auth.token.role in ['admin', 'editor', 'viewer'] ||
        resource.data.accountable == request.auth.uid ||
        request.auth.uid in resource.data.responsible
      );
      allow write: if request.auth != null && request.auth.token.role in ['admin', 'editor'];
    }

    // RPM Owners: all can read, only admins can write
    match /rpmOwners/{ownerId} {
      allow read: if request.auth != null;
      allow write: if request.auth != null && request.auth.token.role == 'admin';
    }

    // RPM History: all can read for audit trail, writes auto-generated server-side
    match /rpmHistory/{historyId} {
      allow read: if request.auth != null;
      allow write: if false; // Only server-side functions can write
    }
  }
}
```

### Compliance Notes

- **Age-Gating**: Tasks with `agingGate=true` must have `complianceNotes` referencing "21+ ID verify"
- **Secrets**: Never store API keys or credentials in Firestore (use Secret Manager)
- **Audit Trail**: All changes logged to `rpmHistory` for compliance/regulatory review

---

## 🚀 DEPLOYMENT PLAN

### Phase 1: MVP (Week 1)

**Goal**: Basic CRUD + live sync + PDF export

- ✅ Firestore collections set up
- ✅ Ingestion script (`scripts/rpm_ingest.ts`) working
- ✅ Next.js dashboard with auth (email/password only)
- ✅ Weekly Plan View with Kanban board (no drag-drop yet)
- ✅ PDF export (`generatePDF()`)
- ✅ Deploy to Vercel or Cloud Run

**Acceptance**:
- Jesse can log in, see current week's tasks, export PDF
- Tasks update in real-time when ingestion runs

---

### Phase 2: Core Features (Week 2)

**Goal**: Full CRUD + CSV/MD export + drag-drop Kanban

- ✅ CSV export (`generateCSV()`)
- ✅ Markdown export (`generateMarkdown()`)
- ✅ Drag-and-drop status changes in Kanban
- ✅ Task detail panel with comments and history
- ✅ My Tasks view (filtered by owner)
- ✅ Basic analytics dashboard (velocity chart, blocker list)

**Acceptance**:
- Andrew/Christopher/Charlie can manage their own tasks
- CSV export works for vendor contracts

---

### Phase 3: Advanced (Week 3)

**Goal**: Gantt chart + alerts + mobile-responsive

- ✅ Gantt chart view (`/gantt/[weekId]`)
- ✅ Email/Slack alerts on overdue tasks
- ✅ Mobile-responsive layout (Tailwind breakpoints)
- ✅ @mention support in task comments (notify via Slack)
- ✅ Historical backfill (ingest last 12 weeks of RPM plans)

**Acceptance**:
- Jesse can view Gantt on iPad
- Automated Slack alerts fire for blockers

---

### Phase 4: Polish (Week 4)

**Goal**: Performance + security + docs

- ✅ Firestore indexes optimized for queries
- ✅ Role-based access control fully enforced
- ✅ User onboarding flow (create account, set prefs)
- ✅ Documentation: `/docs/rpm-dashboard-guide.md`
- ✅ Load testing (handle 1000+ tasks, 50+ concurrent users)

**Acceptance**:
- Page load < 2s on desktop, < 4s on mobile
- Security audit passes (no leaks, proper auth)

---

## 💰 COST ESTIMATE

### Infrastructure (Monthly)

| Service | Usage | Cost |
|---------|-------|------|
| **Cloud Firestore** | ~10K reads/day, ~1K writes/day | $0.50 |
| **Firebase Auth** | ~20 active users | $0 (free tier) |
| **Cloud Run** (Next.js) | ~1M requests/month | $5 |
| **Vercel** (alternative) | Pro plan | $20 |
| **Cloud Scheduler** (ingestion) | 12 jobs/hour | $0.30 |
| **Cloud Storage** (PDF exports) | ~1 GB | $0.02 |
| **Total (Cloud Run)** | | **~$6/month** |
| **Total (Vercel)** | | **~$21/month** |

**Recommendation**: Start with Cloud Run (cheaper, more control); migrate to Vercel if deployment friction emerges.

---

### Development Time

| Task | Effort | Owner |
|------|--------|-------|
| Firestore schema + ingestion script | 1 day | Andrew (or agent) |
| Next.js dashboard MVP (Phase 1) | 2 days | Agent + Christopher review |
| PDF/CSV/MD export functions | 0.5 days | Agent |
| Kanban + My Tasks views (Phase 2) | 1.5 days | Agent + Charlie review |
| Gantt chart + analytics (Phase 3) | 1 day | Agent + Jesse review |
| Security + docs (Phase 4) | 0.5 days | Agent + Andrew review |
| **Total** | **6.5 days** | **$0 (agent labor)** |

**Human Review Time**: ~5 hours total (1 hour per phase for Jesse/Andrew/Christopher/Charlie)

---

## 🔥 FASTEST PATH TO CASH

### Option A: Internal Efficiency Gains (Immediate)

**Value**: Eliminate 8–13 hours/week of coordination waste

**ROI Calc**:
- Jesse's time: $500/hour × 3 hours/week = $1,500/week saved
- Andrew/Christopher/Charlie: $200/hour × 5 hours/week = $1,000/week saved
- **Total**: $2,500/week = **$130K/year**

**Timeline**: 1–2 weeks to MVP

---

### Option B: Productize as SaaS (3–6 months)

**Concept**: "RPM Weekly Plan Dashboard" as a standalone product for other SMBs

**Pricing**:
- **Starter**: $49/month (1 team, up to 50 tasks/week)
- **Pro**: $199/month (unlimited teams, integrations, white-label)
- **Enterprise**: $999/month (dedicated instance, custom compliance)

**TAM**: ~500K SMBs in USA using RPM or similar planning frameworks

**Penetration**: 0.1% = 500 customers × $199/month avg = **$100K/month = $1.2M/year**

**Effort**: 3–6 months to polish, add multi-tenancy, Stripe billing, marketing site

**Risk**: Moderate (market validation needed, sales/marketing required)

---

### Option C: Sell as Consulting Package (Immediate)

**Offer**: "RPM Dashboard Setup + 30-Day Support" for $25K

**Target**: 5–10 clients in Liv Hana's network (other THC operators, wellness brands)

**Revenue**: 5 clients × $25K = **$125K** (one-time)

**Timeline**: Immediate (start selling next week after MVP)

**Risk**: Low (proven internal use case, testimonial from Jesse)

---

### Recommendation: **Option A + Option C Hybrid**

1. **Week 1–2**: Build MVP for internal use (achieve immediate $130K/year value)
2. **Week 3**: Package as consulting offer, pitch to 3 warm leads
3. **Month 2–3**: Close 2–3 clients at $25K each = **$50K–$75K** revenue
4. **Month 4+**: Evaluate SaaS potential based on client feedback

**Total Value (Year 1)**: $130K internal + $50K–$75K consulting = **$180K–$205K**

---

## 📋 ACCEPTANCE CRITERIA (MVP)

### Functional

- ✅ Jesse can log in to dashboard at `https://cockpit.livhana.com`
- ✅ Current week's RPM plan displayed in Kanban view
- ✅ Task status changes reflect in Firestore within 1 second
- ✅ PDF export downloads with proper formatting and branding
- ✅ CSV export includes all task fields
- ✅ Markdown export round-trips back to source format (lossless)

### Non-Functional

- ✅ Page load time < 3 seconds on desktop
- ✅ Mobile-responsive (usable on iPhone/iPad)
- ✅ Auth works (email/password + Google OAuth)
- ✅ Security rules prevent unauthorized access
- ✅ No secrets or credentials exposed in client code

### Compliance

- ✅ Tasks with `agingGate=true` flagged visually (red border or icon)
- ✅ Compliance notes visible in task detail panel
- ✅ Audit trail (rpmHistory) logs all changes with timestamps

---

## 🛠️ IMPLEMENTATION CHECKLIST

### Setup

- [ ] Create Firebase project: `liv-hana-rpm-dashboard`
- [ ] Enable Firestore, Auth, Storage
- [ ] Set up Firestore collections (`rpmWeeks`, `rpmTasks`, `rpmOwners`, `rpmHistory`)
- [ ] Deploy security rules to Firestore
- [ ] Create Next.js project: `npx create-next-app@latest cockpit --typescript --tailwind --app`
- [ ] Install deps: `npm install firebase @google-cloud/firestore jspdf jspdf-autotable papaparse recharts shadcn-ui`

### Development

- [ ] Build `scripts/rpm_ingest.ts` (markdown parser + Firestore uploader)
- [ ] Test ingestion with `docs/RPM_WEEKLY_2025-43.md`
- [ ] Create Next.js pages: `/dashboard`, `/weeks/[weekId]`, `/my-tasks`, `/gantt/[weekId]`, `/analytics`
- [ ] Implement Kanban board with real-time Firestore sync
- [ ] Add PDF export button and `generatePDF()` function
- [ ] Add CSV export button and `generateCSV()` function
- [ ] Add Markdown export button and `generateMarkdown()` function
- [ ] Deploy to Cloud Run: `gcloud run deploy cockpit --source . --region us-central1`

### Testing

- [ ] Smoke test: Jesse logs in, sees tasks, exports PDF/CSV
- [ ] Load test: Create 1000 tasks, verify page loads in < 3s
- [ ] Security test: Attempt to access another user's tasks (should fail)
- [ ] Mobile test: Open on iPhone, verify layout and touch interactions

### Launch

- [ ] Announce to team in Slack: "RPM Dashboard is live!"
- [ ] Schedule 30-min walkthrough for Jesse/Andrew/Christopher/Charlie
- [ ] Update `docs/mobile-control.md` with dashboard URL and usage notes
- [ ] Monitor Firestore usage and Cloud Run costs for first week

---

## 📚 RELATED SPECS

- `.claude/TIER1_HIGH5_AGENT_FUNNEL.md` (agent architecture)
- `docs/mobile-control.md` (team workflows)
- `docs/tier1_recon_plan.md` (PO1 task tracking)
- `.claude/TIER1_FUNNEL_AUTHORITY.md` (decision gates)

---

## 🦄 NEXT STEPS

1. **Approve this spec** (Jesse)
2. **Assign to Artifacts Agent** (create Firestore schema, Next.js scaffold)
3. **Execution Agent** (deploy to Cloud Run, test ingestion script)
4. **QA Agent** (validate security rules, test exports)
5. **Ops** (announce launch, train team)

---

**Document Authority**: Jesse CEO (Liv Hana Command)
**Last Updated**: 2025-10-23 03:00 CST
**Status**: READY FOR IMPLEMENTATION
**Estimated Completion**: 1–2 weeks to MVP

---

🦄 **Liv Hana Trinity**: Grow, Sell, Heal.
📊 **Mission**: Transform weekly plans into live intelligence
⚡ **Method**: Firestore + Next.js + Atomic Exports
✅ **Standard**: Lifeward (Is it true? Show the receipt.)

**Stay TOONED.** 🚀
