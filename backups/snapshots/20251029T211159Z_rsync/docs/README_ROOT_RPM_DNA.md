# Root Workspace RPM DNA Tier 1 Option A

## Mission Statement
This root workspace mirrors RPM DNA Tier 1 Option A discipline. Every asset outside `LivHana-SoT/` must live in exactly one RPM DNA-aligned directory. No loose files. No mystery folders. No vendor dump zones.

## Directory Structure & Governance

### 0.archive/
**Purpose**: Cold storage, zipped drops, old exports  
**Rules**: Read-only, organized by date, compressed when possible  
**Examples**: Legacy repos, old exports, archived outputs

### 1.rnd/
**Purpose**: Active R&D assets (scripts, prototypes)  
**Subdirectories**:
- `video/` - Video automation code and pipelines
- `data-labs/` - Data experiments, CSVs, analysis scripts
- `automation/` - Automation scripts, engines, improvement loops

### 2.biz/
**Purpose**: External-facing docs, decks, PDFs  
**Subdirectories**:
- `strategy/` - Strategic documents, plans, analysis
- `landing/` - Landing pages, marketing materials
- `docs/` - Documentation, guides, specifications

### 3.ops/
**Purpose**: Deployment + DNS tooling outside repo  
**Subdirectories**:
- `dns/` - DNS configuration, redirects, zone files
- `deploy/` - Deployment scripts, automation

### 4.media/
**Purpose**: Final renders, images, thumbnails  
**Rules**: Final production assets only, organized by project

### 5.outputs/
**Purpose**: Machine-generated artifacts (logs, JSON, reports)  
**Rules**: Auto-generated content, organized by date/project

### 6.tmp/
**Purpose**: Short-lived scratchpad  
**Rules**: Auto-pruned weekly, temporary files only

### LivHana-SoT/
**Purpose**: Source-of-truth repository  
**Rules**: Untouched, follows git workflow

## Enforcement Rules

1. **No loose files**: Every file must live in exactly one RPM DNA directory
2. **RPM DNA naming**: Files inherit `<RPM code>_<slug>.<ext>` convention where relevant
3. **Repo-worthy assets**: Move to `LivHana-SoT/` under correct lane with commits
4. **No stray artifacts**: Remove Finder/system artifacts
5. **Regular cleanup**: Weekly review of `6.tmp/`, monthly archive review

## Compliance Check
```bash
find . -maxdepth 1 -mindepth 1 ! -name 'LivHana-SoT' ! -name '0.archive' \
  ! -name '1.rnd' ! -name '2.biz' ! -name '3.ops' ! -name '4.media' \
  ! -name '5.outputs' ! -name '6.tmp' ! -name 'README_ROOT_RPM_DNA.md'
```
**Expected**: No results (empty output)

## Governance
- **Owner**: Cheetah 🐆 (Taskmaster)
- **Last Updated**: 2025-10-08T18:50:00Z
- **Review Cycle**: Weekly compliance check
- **Escalation**: Any violations escalate to Taskmaster

---
**Status**: Active - Tier 1 Option A discipline enforced
/Users/jesseniesen/LivHana-Trinity-Local/
├── 0.archive/                     # Cold storage, zipped drops, old exports
├── 1.rnd/                         # Active R&D assets (scripts, prototypes)
│   ├── video/                     # Video automation code (32 items)
│   ├── data-labs/                 # Data experiments, CSVs (9 items)
│   └── automation/                # Automation scripts (13 items)
├── 2.biz/                         # External-facing docs, decks, PDFs
│   ├── strategy/                  # Strategic documents (1 item)
│   ├── landing/                   # Landing pages (15 items)
│   └── docs/                      # Documentation (9 items)
├── 3.ops/                         # Deployment + DNS tooling
│   ├── dns/                       # DNS configuration (4 items)
│   └── deploy/                    # Deployment scripts (4 items)
├── 4.media/                       # Final renders, images (4 items)
├── 5.outputs/                     # Machine-generated artifacts (5 items)
├── 6.tmp/                         # Short-lived scratchpad (empty)
├── LivHana-SoT/                   # Source-of-truth repo (untouched)
├── Macintosh HD/                   # System directory (untouched)
└── README_ROOT_RPM_DNA.md         # Governance documentation
