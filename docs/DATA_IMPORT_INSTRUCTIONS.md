# 📥 DATA IMPORT INSTRUCTIONS - GET CLAUDE CODE FULL CONTEXT

**Date:** September 30, 2025
**Purpose:** Import all Jesse's data from Downloads, Claude Projects, ChatGPT, Notion, Gmail

---

## 🚨 IMMEDIATE: Copy Downloads Files

**Run this command in your terminal:**

```bash
# Create import directory
mkdir -p ~/LivHana-Trinity-Local/LivHana-SoT/data/imports/downloads

# Copy all critical files
cp ~/Downloads/reggie-dro-playbook.md ~/LivHana-Trinity-Local/LivHana-SoT/data/imports/downloads/
cp ~/Downloads/Lightspeed\ E-Commerce\ Makeover\ for\ Texas\ Hemp_\ Tonight\'s\ Action\ Plan.pdf ~/LivHana-Trinity-Local/LivHana-SoT/data/imports/downloads/
cp ~/Downloads/Master\ ALL\ 20\ Agentic\ AI\ Design\ Patterns\ \[Complete\ Course\].pdf ~/LivHana-Trinity-Local/LivHana-SoT/data/imports/downloads/
cp ~/Downloads/Master\ ALL\ 20\ Agentic\ AI\ Design\ Patterns\ \[Complete\ Course\].txt ~/LivHana-Trinity-Local/LivHana-SoT/data/imports/downloads/
cp ~/Downloads/Agentic\ Design\ Patterns.txt ~/LivHana-Trinity-Local/LivHana-SoT/data/imports/downloads/
cp ~/Downloads/Agentic\ Design\ Patterns.pdf ~/LivHana-Trinity-Local/LivHana-SoT/data/imports/downloads/
cp ~/Downloads/RND-Product-Page-Dashboard-Wire-Frames.pdf ~/LivHana-Trinity-Local/LivHana-SoT/data/imports/downloads/
cp ~/Downloads/Weekly\ Visioneering\ RPM\ Planning\ Process.pdf ~/LivHana-Trinity-Local/LivHana-SoT/data/imports/downloads/
cp ~/Downloads/liv-hana-pilot-training-intro\ \(1\).md ~/LivHana-Trinity-Local/LivHana-SoT/data/imports/downloads/
cp ~/Downloads/NOW\ Q4_2025_FULL_FUNNEL_PLANNING_SESSION.md.pdf ~/LivHana-Trinity-Local/LivHana-SoT/data/imports/downloads/
cp ~/Downloads/rpm-weekly-september-plan.md ~/LivHana-Trinity-Local/LivHana-SoT/data/imports/downloads/

# Verify
ls -lh ~/LivHana-Trinity-Local/LivHana-SoT/data/imports/downloads/
```

---

## 📋 CLAUDE PROJECTS EXPORT

**Steps to get ALL your Claude Projects data:**

### 1. Export Projects Manually (Claude Web)
```
1. Go to https://claude.ai/projects
2. Open each project
3. Click "Export Project" or copy all content
4. Save to: ~/LivHana-Trinity-Local/LivHana-SoT/data/imports/claude_projects/
```

### 2. Use Claude API (Automated)
```bash
# Get your Claude API key
# Go to https://console.anthropic.com/settings/keys

# Add to .env
echo "ANTHROPIC_API_KEY=sk-ant-xxxxx" >> .env

# Run export script (I'll create this)
node automation/data-pipelines/claude_export.js
```

**What Gets Exported:**
- All project descriptions
- All artifacts
- All conversation history
- All custom instructions
- All knowledge base files

---

## 💬 CHATGPT DATA EXPORT

**Steps to get ALL your ChatGPT data:**

### Method 1: Official Export (Recommended)
```
1. Go to https://chatgpt.com/
2. Click your profile → Settings → Data controls
3. Click "Export data"
4. Wait for email (can take hours/days)
5. Download ZIP file
6. Extract to: ~/LivHana-Trinity-Local/LivHana-SoT/data/imports/chatgpt_export/
```

### Method 2: Manual Copy (Immediate)
```
1. Open each important ChatGPT conversation
2. Copy full conversation text
3. Save as: ~/LivHana-Trinity-Local/LivHana-SoT/data/imports/chatgpt_manual/conversation_name.md
```

### Method 3: ChatGPT API (If you have API access)
```bash
# Add OpenAI API key to .env
echo "OPENAI_API_KEY=sk-xxxxx" >> .env

# Run export script (I'll create this)
node automation/data-pipelines/chatgpt_export.js
```

---

## 📧 NOTION EXPORT (From Earlier Guide)

**Quick Steps:**
```
1. https://www.notion.so/my-integrations
2. Create integration: "LivHana Data Import"
3. Copy API key
4. Share all pages with integration
5. Run: NOTION_API_KEY=secret_xxx node automation/data-pipelines/notion_ingest.js
```

---

## 📬 GMAIL EXPORT (From Earlier Guide)

**Quick Steps:**
```
1. https://console.cloud.google.com/
2. Enable Gmail API
3. Create OAuth credentials
4. Download credentials.json
5. Run: node automation/data-pipelines/gmail_ingest.js
```

---

## 🗂️ DIRECTORY STRUCTURE

```
LivHana-Trinity-Local/LivHana-SoT/
└── data/
    └── imports/
        ├── downloads/              # Files from ~/Downloads
        ├── claude_projects/        # Claude.ai project exports
        ├── chatgpt_export/         # ChatGPT official export
        ├── chatgpt_manual/         # Manually copied conversations
        ├── notion_export/          # Notion workspace export
        ├── gmail_export/           # Gmail mbox/JSON export
        └── google_reviews/         # Reggie & Dro reviews
```

---

## 🚀 AFTER COPYING FILES, RUN THIS:

```bash
# 1. Verify all files copied
cd ~/LivHana-Trinity-Local/LivHana-SoT
find data/imports -type f | wc -l

# 2. Index all imported data
node automation/data-pipelines/index_all_imports.js

# 3. Upload to BigQuery for analysis
node automation/data-pipelines/import_to_bigquery.js

# 4. Generate context summary
node automation/data-pipelines/generate_context_summary.js
```

---

## 🎯 GOOGLE REVIEWS SCRAPING

**For Reggie & Dro Google Reviews:**

### Manual Export:
```
1. Go to: https://www.google.com/maps/place/Reggie+%26+Dro/@29.6251563,-98.4963376,17z/
2. Click "Reviews"
3. Copy all review text manually
4. Save to: data/imports/google_reviews/reviews.md
```

### Automated Scraping (I'll build this):
```bash
# Scrape all Google reviews
node automation/scrapers/google_reviews.js \
  --place-id="ChIJVePXV-djbIYR2VDQ5rU-DDM" \
  --output=data/imports/google_reviews/reviews.json
```

---

## 📊 SQUARE DATA ANALYSIS

**Find Highest Sales Month:**

```sql
-- Run this in BigQuery
SELECT
  FORMAT_TIMESTAMP('%Y-%m', created_at) as month,
  COUNT(*) as transaction_count,
  SUM(amount) / 100 as total_revenue_dollars
FROM `PROJECT_ID.commerce.square_transactions`
WHERE status = 'COMPLETED'
GROUP BY month
ORDER BY total_revenue_dollars DESC
LIMIT 12;
```

**Find Online vs In-Store Split:**
```sql
SELECT
  CASE
    WHEN location_id = 'ONLINE_LOCATION_ID' THEN 'Online'
    ELSE 'In-Store'
  END as channel,
  COUNT(*) as transactions,
  SUM(amount) / 100 as revenue_dollars
FROM `PROJECT_ID.commerce.square_transactions`
WHERE status = 'COMPLETED'
GROUP BY channel;
```

---

## 🔄 CONTINUOUS IMPORT AUTOMATION

**Set up daily imports:**

```bash
# Create cron job for daily imports
crontab -e

# Add these lines:
0 2 * * * cd ~/LivHana-Trinity-Local/LivHana-SoT && node automation/data-pipelines/notion_ingest.js
0 3 * * * cd ~/LivHana-Trinity-Local/LivHana-SoT && node automation/data-pipelines/gmail_ingest.js
0 4 * * * cd ~/LivHana-Trinity-Local/LivHana-SoT && node automation/data-pipelines/index_all_imports.js
```

---

## ✅ CHECKLIST

- [ ] Copy all Downloads files to data/imports/downloads/
- [ ] Export Claude Projects to data/imports/claude_projects/
- [ ] Export ChatGPT conversations to data/imports/chatgpt_export/
- [ ] Set up Notion API integration
- [ ] Set up Gmail API access
- [ ] Scrape Google Reviews
- [ ] Run BigQuery analysis on Square data
- [ ] Index all imported data
- [ ] Generate context summary for Claude Code

---

**ONCE FILES ARE COPIED, I CAN:**
1. Read reggie-dro-playbook.md
2. Analyze LightSpeed makeover plan
3. Study agentic design patterns
4. Review dashboard wireframes
5. Analyze Q4 planning session
6. Build Texas Takeover campaign
7. Design max-conversion LightSpeed store
8. Create email/SM launch campaign
9. Develop subscription model
10. Build referral incentive system

---

*Run the copy command above, then I'll have FULL CONTEXT!*

<!-- Last verified: 2025-10-02 -->

<!-- Optimized: 2025-10-02 -->

<!-- Last updated: 2025-10-02 -->

<!-- Last optimized: 2025-10-02 -->
