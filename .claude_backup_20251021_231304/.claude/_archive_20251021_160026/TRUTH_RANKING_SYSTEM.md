---
status: ACTIVE - Truth Tracking System
timestamp: 2025-10-08T06:32:00Z
priority: CRITICAL - COMPETITIVE ADVANTAGE
assigned_to: 🛡️ CODEX (Commander) — dashboard handoff pending
---

# TRUTH RANKING SYSTEM - LIES/FALLACIES TRACKER

**Purpose**: Real-time ranking of AI agents by truthfulness (least lies = winner)
**Innovation**: DOING what others only talk about - quantifying AI reliability
**Integration**: Cloud DB → Cockpit → Unicorn Race Dashboard
**Value**: Leading indicator for technical/fundamental analysis

---

## 🎯 THE VISION

**Jesse's Insight**: "Benchmark all lies/fallacies of each model/team member and index/track to create real time ranking with least lies/fallacies is the winner"

**Why This Matters**:

- AI agents make claims (revenue projections, timelines, capabilities)
- Some claims are TRUE, some are FALSE, some are UNVERIFIED
- Track accuracy over time = reliability score
- Most reliable agent = most valuable agent
- Build this into Unicorn Race = set narrative (we're measuring what others ignore)

---

## 📊 DOMAIN VALIDATION STATUS (Current)

### ✅ Working Domains (6/8)

1. **herbitrage.com**: HTTP 302, HTTPS 200, SSL valid ✅
2. **aaacbdhempflower.com**: HTTP 302, HTTPS 200, SSL valid ✅
3. **jesseniesen.com**: HTTP 302, HTTPS 200, SSL valid ✅
4. **loudcbdflower.com**: HTTP 302, HTTPS 200, SSL valid ✅
5. **thcasanantonio.com**: HTTP 302, HTTPS 200, SSL valid ✅
6. **reggieanddro.com**: HTTP 301, HTTPS 200, SSL valid ✅

### ❌ Broken Domains (2/8)

1. **highnooncartoon.com**: HTTP 404, HTTPS FAILED, NO SSL ❌ (GCP permissions blocker)
2. **livhana.com**: HTTP 200, HTTPS FAILED, SSL expired soon ⚠️

### Cloud Run Mapping Status

**ALL domains**: ❌ No Cloud Run domain-mappings found
**Reason**: Domains hosted elsewhere (AWS, GoDaddy, etc.)

---

## 🗄️ DATABASE SCHEMA - TRUTH TRACKING

### Table: agent_claims

```sql
CREATE TABLE agent_claims (
    id UUID PRIMARY KEY,
    agent_id VARCHAR, -- "claude-code", "replit", "cheetah", "codex"
    agent_emoji VARCHAR, -- For display
    claim_text TEXT, -- What they claimed
    claim_type VARCHAR, -- "timeline", "capability", "cost", "performance", "revenue"
    confidence_level VARCHAR, -- "certain", "likely", "uncertain"

    -- Verification data
    claimed_at TIMESTAMP,
    verified_at TIMESTAMP,
    verification_status VARCHAR, -- "pending", "true", "false", "partial", "unverifiable"
    evidence_url VARCHAR, -- Link to proof
    verifier VARCHAR, -- Who verified (Jesse, CODEX, automated test)

    -- Impact scoring
    impact_level VARCHAR, -- "critical", "high", "medium", "low"
    error_cost DECIMAL, -- Cost of being wrong (time wasted, $ lost, etc.)

    -- Context
    context TEXT, -- What was the situation
    related_claims UUID[], -- Array of related claim IDs

    created_at TIMESTAMP,
    updated_at TIMESTAMP
);

-- Examples:
-- Claude Code claims: "MVP ready in 23 days" (timeline, certain)
-- Replit claims: "Prototype complete" (capability, certain) - FALSE (not pushed to git)
-- Cheetah claims: "Deploy in <1 hour" (timeline, certain) - PENDING (not tested)
-- CODEX claims: "Docker image built" (capability, certain) - TRUE (verified)
```

### Table: agent_truth_scores

```sql
CREATE TABLE agent_truth_scores (
    id UUID PRIMARY KEY,
    agent_id VARCHAR,

    -- Raw counts
    total_claims INT DEFAULT 0,
    verified_true INT DEFAULT 0,
    verified_false INT DEFAULT 0,
    partially_true INT DEFAULT 0,
    unverifiable INT DEFAULT 0,
    pending_verification INT DEFAULT 0,

    -- Accuracy metrics
    truth_rate DECIMAL, -- verified_true / (verified_true + verified_false)
    reliability_score DECIMAL, -- Weighted score accounting for impact
    confidence_accuracy DECIMAL, -- How often "certain" claims are true

    -- Time metrics
    avg_verification_time_seconds INT, -- How long to verify claims
    overclaim_rate DECIMAL, -- Claims that were too optimistic
    underclaim_rate DECIMAL, -- Claims that were too conservative

    -- Impact metrics
    total_error_cost DECIMAL, -- Sum of error_cost from false claims
    avg_claim_impact DECIMAL, -- Average impact level

    -- Trend data (last 7 days)
    recent_truth_rate DECIMAL,
    recent_reliability_score DECIMAL,
    trend VARCHAR, -- "improving", "stable", "declining"

    -- Rankings
    truth_rank INT, -- 1 = most truthful
    reliability_rank INT, -- 1 = most reliable (weighted)

    last_updated TIMESTAMP,
    created_at TIMESTAMP
);
```

### Table: verification_events

```sql
CREATE TABLE verification_events (
    id UUID PRIMARY KEY,
    claim_id UUID REFERENCES agent_claims(id),
    event_type VARCHAR, -- "verified", "disputed", "updated", "challenged"
    verifier VARCHAR, -- Who did the verification
    evidence TEXT, -- What proof was provided
    notes TEXT, -- Additional context
    created_at TIMESTAMP
);
```

### Table: fallacy_catalog

```sql
CREATE TABLE fallacy_catalog (
    id UUID PRIMARY KEY,
    fallacy_name VARCHAR, -- "Hasty Generalization", "False Cause", etc.
    description TEXT,
    example TEXT,
    severity VARCHAR, -- "critical", "high", "medium", "low"
    created_at TIMESTAMP
);

-- Pre-populated with common logical fallacies
INSERT INTO fallacy_catalog (fallacy_name, description, severity) VALUES
('Hasty Generalization', 'Drawing conclusion from insufficient evidence', 'high'),
('False Cause', 'Assuming causation from correlation', 'high'),
('Circular Reasoning', 'Conclusion assumes premise', 'medium'),
('Appeal to Authority', 'Claiming truth based on authority not evidence', 'medium'),
('Straw Man', 'Misrepresenting argument to attack it', 'high'),
('Ad Hominem', 'Attacking person not argument', 'low'),
('False Dilemma', 'Presenting only two options when more exist', 'high'),
('Slippery Slope', 'Claiming small action leads to extreme outcome', 'medium'),
('Red Herring', 'Diverting attention from real issue', 'medium'),
('Bandwagon', 'Claiming truth because many believe it', 'low');
```

### Table: claim_fallacies

```sql
CREATE TABLE claim_fallacies (
    id UUID PRIMARY KEY,
    claim_id UUID REFERENCES agent_claims(id),
    fallacy_id UUID REFERENCES fallacy_catalog(id),
    detected_by VARCHAR, -- Who detected the fallacy
    explanation TEXT, -- Why this is a fallacy
    detected_at TIMESTAMP
);
```

---

## 📈 REAL-TIME RANKING LOGIC

### Truth Score Calculation

```sql
-- Real-time view
CREATE VIEW agent_rankings AS
SELECT
    agent_id,
    agent_emoji,

    -- Accuracy
    ROUND(100.0 * verified_true / NULLIF(verified_true + verified_false, 0), 2) as truth_rate_pct,

    -- Reliability (weighted by impact)
    reliability_score,

    -- Volume
    total_claims,
    verified_true,
    verified_false,
    pending_verification,

    -- Cost of errors
    total_error_cost,

    -- Rankings
    RANK() OVER (ORDER BY truth_rate DESC) as truth_rank,
    RANK() OVER (ORDER BY reliability_score DESC) as reliability_rank,

    -- Trend
    trend,
    recent_truth_rate,

    -- Last updated
    last_updated
FROM agent_truth_scores
ORDER BY reliability_score DESC;
```

### Reliability Score Formula

```python
def calculate_reliability_score(agent_data):
    """
    Weighted reliability score accounting for:
    - Truth rate (40%)
    - Impact of correct claims (30%)
    - Speed of verification (15%)
    - Confidence calibration (15%)
    """
    truth_rate = agent_data['verified_true'] / (agent_data['verified_true'] + agent_data['verified_false'])

    impact_score = agent_data['total_impact'] / agent_data['total_claims']

    speed_score = 1.0 - (agent_data['avg_verification_time_seconds'] / 86400)  # Normalize to days

    confidence_score = agent_data['confident_correct'] / agent_data['confident_claims']

    reliability = (truth_rate * 0.4) + \
                  (impact_score * 0.3) + \
                  (speed_score * 0.15) + \
                  (confidence_score * 0.15)

    return reliability
```

---

## 🎬 INTEGRATION WITH UNICORN RACE DASHBOARD

### Dashboard Display

```
┌─────────────────────────────────────────────────────────────┐
│                  TRUTH RANKING LEADERBOARD                  │
│            "Most Reliable AI = Most Valuable AI"           │
└─────────────────────────────────────────────────────────────┘

╔═══════════════════════════════════════════════════════════╗
║ Rank | Agent     | Truth | Reliability | Claims | Trend  ║
╠═══════════════════════════════════════════════════════════╣
║  1   | 🛡️ CODEX  | 100%  | 98.5       | 15     | ↑ +5%  ║
║  2   | 🐆 Cheetah| 100%  | 95.0       | 5      | → 0%   ║
║  3   | Claude    | 90%   | 87.3       | 30     | ↓ -2%  ║
║  4   | 🦄 Replit | 60%   | 62.1       | 10     | ↓ -15% ║
╚═══════════════════════════════════════════════════════════╝

╔═══════════════════════════════════════════════════════════╗
║                  RECENT CLAIMS (Live Feed)                 ║
╠═══════════════════════════════════════════════════════════╣
║ 5 min ago | 🛡️ CODEX   | "HNC Docker image built"      ║
║ Status: ✅ VERIFIED TRUE                                  ║
║ Evidence: gcr.io/reggieanddrodispensary/highnooncartoon   ║
║───────────────────────────────────────────────────────────║
║ 2 hrs ago | 🦄 Replit  | "Voice Cockpit prototype done" ║
║ Status: ❌ VERIFIED FALSE (not pushed to git)            ║
║ Impact: HIGH (blocked entire pipeline)                    ║
║───────────────────────────────────────────────────────────║
║ 1 day ago | Claude     | "MVP ready Oct 31"             ║
║ Status: ⏳ PENDING (23 days remaining)                   ║
║ Confidence: CERTAIN                                        ║
╚═══════════════════════════════════════════════════════════╝
```

### Live Data Stream

```javascript
// WebSocket connection for real-time updates
const ws = new WebSocket('wss://unicornrace.herbitrage.com/truth-feed');

ws.onmessage = (event) => {
    const update = JSON.parse(event.data);

    if (update.type === 'claim_verified') {
        updateLeaderboard(update.agent_id, update.new_score);
        showNotification(`${update.agent_emoji} claim verified: ${update.result}`);
    }

    if (update.type === 'ranking_changed') {
        highlightRankChange(update.agent_id, update.old_rank, update.new_rank);
    }
};
```

---

## 🧾 TRUTH BENCHMARK LOG

Daily verification tables now live in dated companions (e.g., `TRUTH_RANKING_LOG_20251008.md`) so this system spec stays under 500 lines. Each log captures the claims table, immediate actions, and dashboard wiring notes. FILE SIZE RULE: when a log exceeds 250 lines, archive to `/archive/truth-ranking/`.

See current log: `TRUTH_RANKING_LOG_20251008.md`.

**Dashboard Feed Hooks**

- Feed verified rows into Unicorn Race widget “Lies in last 24h” with severity gradients.
- Compute rolling truth deltas to adjust `truth_rank` in near real-time.
- Surface unresolved (⏳) entries in Jesse cockpit for manual follow-up.

---

## 🔍 AUTOMATED CLAIM DETECTION & DELIVERY ROADMAP

Implementation details, automation pseudocode, agent scorecards, business framing, and launch plan are maintained in `TRUTH_RANKING_IMPLEMENTATION.md`. Review that companion before coding automation or dashboard features.

**Maintainers**

- System Spec: 🛡️ CODEX (Commander)
- Implementation Playbook: 🦄 REPLIT (Dashboard Integration)

**Update Discipline**

- When implementation steps change, update the playbook and note the link revision here.
- Keep this spec under 500 lines; move detailed walkthroughs into dated/companion files.
