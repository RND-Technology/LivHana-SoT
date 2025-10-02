# 🔍 FILE CLASSIFICATION ANALYSIS - AOM/COI/RPM

**Purpose**: Determine correct AOM (Area of Management), COI (Category of Improvement), RPM (Block) for all files

---

## 📋 CURRENT FILES TO CLASSIFY

### Root Directory Files

| Current Filename | AOM | COI | RPM | Correct Name |
|------------------|-----|-----|-----|--------------|
| `EMPIRE_COCKPIT_DEPLOYMENT_COMPLETE.md` | **engineering** | **deployment** | **empire_cockpit** | `engineering_deployment_empire_cockpit_complete_20251002.md` |
| `empire_rpm_coi_cockpit_optimization_complete_20251002.md` | **engineering** | **optimization** | **empire_cockpit** | `engineering_optimization_empire_cockpit_complete_20251002.md` |
| `RPM_DNA_FILE_NAMING_SIMPLE.md` | **operations** | **standards** | **file_naming** | `operations_standards_file_naming_system.md` |
| `RPM_DNA_FILE_NAMING_SYSTEM_GUIDE.md` | **operations** | **standards** | **file_naming** | `operations_standards_file_naming_guide.md` |
| `RPM_DNA_FUSION_EMPIRE_E2E_FRAMEWORK.md` | **strategy** | **framework** | **rpm_dna_fusion** | `strategy_framework_rpm_dna_fusion_e2e.md` |
| `SESSION_SUMMARY_RPM_DNA_FUSION.md` | **operations** | **documentation** | **session_summary** | `operations_documentation_session_summary_rpm_dna_fusion.md` |
| `SHIP_STATUS.md` | **operations** | **tracking** | **ship_status** | `operations_tracking_ship_status.md` |

---

## 🎯 AOM (AREA OF MANAGEMENT) DEFINITIONS

| AOM | Description | Examples |
|-----|-------------|----------|
| **strategy** | High-level vision, planning, frameworks | Empire plans, RPM framework, vision docs |
| **engineering** | Technical implementation, code, deployment | Cockpit build, optimization, DevOps |
| **operations** | Day-to-day execution, standards, tracking | File naming, sessions, status tracking |
| **marketing** | Marketing, growth, content creation | HNC marketing, campaigns |
| **product** | Product design, features, UX | Product specs, user stories |
| **compliance** | Age verification, COA, regulations | Compliance docs, legal |
| **commerce** | Sales, POS, transactions | Wall of Weed, checkout |

---

## 🔄 COI (CATEGORY OF IMPROVEMENT) DEFINITIONS

**COI = Constant and Never-Ending Improvement (Critical Success Factor)**

| COI | Description | Focus |
|-----|-------------|-------|
| **deployment** | Deploying systems to production | Docker, K8s, CI/CD |
| **optimization** | Making existing systems better | Performance, code quality |
| **standards** | Establishing conventions and patterns | File naming, coding standards |
| **framework** | Building reusable frameworks | RPM, AOM, COI systems |
| **documentation** | Recording knowledge and decisions | Summaries, guides |
| **tracking** | Monitoring progress and status | Ship status, metrics |
| **integration** | Connecting systems together | API, POS, third-party |
| **automation** | Reducing manual work | Scripts, CI/CD |

---

## 📦 RPM BLOCK DEFINITIONS

**RPM Block = Reality-Project-Mission unit**

| RPM Block | Description |
|-----------|-------------|
| **empire_cockpit** | The main Empire Cockpit application |
| **file_naming** | File naming system and standards |
| **rpm_dna_fusion** | RPM/DNA framework integration |
| **session_summary** | Session summaries and progress |
| **ship_status** | Shipping and deployment status |
| **gamification** | XP, levels, missions system |
| **api_client** | API client and integration |
| **dashboard** | Dashboard UI components |

---

## ✅ RENAMING PLAN

### 1. Strategy Documents
```
FROM: RPM_DNA_FUSION_EMPIRE_E2E_FRAMEWORK.md
TO:   strategy_framework_rpm_dna_fusion_e2e.md
WHY:  Framework for E2E strategy
```

### 2. Engineering/Deployment Documents
```
FROM: EMPIRE_COCKPIT_DEPLOYMENT_COMPLETE.md
TO:   engineering_deployment_empire_cockpit_complete_20251002.md
WHY:  Engineering AOM, Deployment COI, Empire Cockpit RPM Block

FROM: empire_rpm_coi_cockpit_optimization_complete_20251002.md
TO:   engineering_optimization_empire_cockpit_complete_20251002.md
WHY:  Engineering AOM, Optimization COI (continuous improvement!)
```

### 3. Operations/Standards Documents
```
FROM: RPM_DNA_FILE_NAMING_SIMPLE.md
TO:   operations_standards_file_naming_system.md
WHY:  Operations AOM, Standards COI (establishing patterns)

FROM: RPM_DNA_FILE_NAMING_SYSTEM_GUIDE.md
TO:   operations_standards_file_naming_guide.md
WHY:  Operations AOM, Standards COI (comprehensive guide)
```

### 4. Operations/Documentation
```
FROM: SESSION_SUMMARY_RPM_DNA_FUSION.md
TO:   operations_documentation_session_summary_rpm_dna.md
WHY:  Operations AOM, Documentation COI
```

### 5. Operations/Tracking
```
FROM: SHIP_STATUS.md
TO:   operations_tracking_ship_status.md
WHY:  Operations AOM, Tracking COI (monitoring progress)
```

---

## 🏗️ EMPIRE-COCKPIT SUBDIRECTORY STRUCTURE

**Keep as-is** - Already well-organized by Next.js conventions:
- `src/lib/gamification.ts` → Utilities (good)
- `src/lib/api-client.ts` → Utilities (good)
- `src/components/DashboardTile.tsx` → Components (good)
- `src/app/page.tsx` → Pages (good)

**Why?** Standard Next.js structure is already optimal for engineering projects.

---

## 🎯 GREP ENABLEMENT

After renaming, you can:

### Find all Strategy files
```bash
grep "strategy_" *.md
# → All strategic framework documents
```

### Find all Engineering/Deployment files
```bash
grep "engineering_deployment" *.md
# → All deployment-related engineering work
```

### Find all Engineering/Optimization files (COI!)
```bash
grep "engineering_optimization" *.md
# → All continuous improvement in engineering
```

### Find all Operations/Standards files
```bash
grep "operations_standards" *.md
# → All operational standards and conventions
```

### Create RPM Plan for Empire Cockpit
```bash
grep "empire_cockpit" *.md
# → All files related to Empire Cockpit RPM block
```

---

## 📊 CLASSIFICATION SUMMARY

| AOM | Count | Files |
|-----|-------|-------|
| **engineering** | 2 | Cockpit deployment, optimization |
| **operations** | 4 | File naming, sessions, tracking |
| **strategy** | 1 | RPM/DNA framework |

| COI | Count | Files |
|-----|-------|-------|
| **deployment** | 1 | Cockpit deployment |
| **optimization** | 1 | Cockpit optimization (CONTINUOUS IMPROVEMENT!) |
| **standards** | 2 | File naming system |
| **framework** | 1 | RPM/DNA fusion |
| **documentation** | 1 | Session summary |
| **tracking** | 1 | Ship status |

| RPM Block | Count | Files |
|-----------|-------|-------|
| **empire_cockpit** | 2 | Deployment, optimization |
| **file_naming** | 2 | System, guide |
| **rpm_dna_fusion** | 1 | Framework |
| **session_summary** | 1 | Session docs |
| **ship_status** | 1 | Status tracking |

---

## ✅ READY TO EXECUTE

Next steps:
1. Execute renames with `git mv`
2. Update any internal references
3. Commit with comprehensive message
4. Push to GitHub for verification

**TIER-1 CLASSIFICATION COMPLETE!** 🦄🔥

---

<!-- Pattern: [AOM]_[COI]_[RPM_BLOCK]_[context]_[timestamp].md -->
<!-- AOM = Area of Management -->
<!-- COI = Category of Improvement (Constant and Never-Ending!) -->
<!-- RPM Block = Reality-Project-Mission unit -->
