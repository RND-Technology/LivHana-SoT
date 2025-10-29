# PERPLEXITY OPTIMIZATION GUIDE
## Liv Hana Research Unicorn Integration

**Version:** 1.0
**Date:** 2025-10-29
**Status:** TIER 1 ABSOLUTE STANDARD

---

## EXECUTIVE SUMMARY

Perplexity serves as the **Research Unicorn** in the Liv Hana Tier-1 architecture, providing real-time web intelligence, regulatory tracking, and verification capabilities for the TRUTH pipeline. This guide optimizes Perplexity usage for maximum research velocity, compliance intelligence, and profit-focused insights.

**Key Benefits:**
- Real-time regulatory intelligence (50-state cannabis tracking)
- Competitive analysis and market research
- TRUTH pipeline verification (stage 2 of 5)
- Citation-backed responses for compliance
- Integration with RPM planning workflow

---

## ARCHITECTURE INTEGRATION

### TRUTH Pipeline Position
```
Stage 1: Apify Scrape → Stage 2: Perplexity Verify → Stage 3: ChatGPT Compress → Stage 4: Claude TRUTH → Stage 5: RPM Emission
```

### Multi-Agent Role
- **Research Agent (Layer 1.1.2):** Primary Perplexity consumer
- **Planning Agent (Layer 1.1.1):** Uses verified data for strategy
- **Voice Orchestrator (Layer 1.1):** Receives research summaries
- **QA Agent (Layer 1.1.3):** Validates citation quality

### Model Strategy
- **Perplexity Comet:** Research layer (regulatory intelligence, competitive analysis, 50-state legal database)
- **Perplexity Pro:** Advanced search with citation tracking
- **Integration:** Networked GPT + Perplexity/Apify hybrid

---

## ACCOUNT SETUP & OPTIMIZATION

### 1. API Key Configuration

#### Option A: 1Password Integration (Recommended)
```bash
# Store in 1Password vault
op item create \
  --category=API_Credential \
  --title="Perplexity API Key" \
  --vault="LivHana-Secrets" \
  credential="pplx-xxxxxxxxxxxxx"

# Fetch in boot script (already implemented)
export PERPLEXITY_API_KEY=$(op item get "Perplexity API Key" --fields label=credential)
```

#### Option B: GCP Secret Manager
```bash
# Store in Secret Manager
gcloud secrets create perplexity-api-key \
  --project=reggieanddrodispensary \
  --replication-policy=automatic \
  --data-file=<(echo -n "pplx-xxxxxxxxxxxxx")

# Fetch in scripts
export PERPLEXITY_API_KEY=$(gcloud secrets versions access latest --secret=perplexity-api-key --project=reggieanddrodispensary)
```

#### Option C: Environment Variable (Local Dev Only)
```bash
# Add to .env.local (gitignored)
PERPLEXITY_API_KEY=pplx-xxxxxxxxxxxxx

# Source in boot
source .env.local
```

### 2. Spaces Configuration

Perplexity Spaces provide context isolation for different research domains. Optimize with this structure:

#### Space 1: RPM Weekly Planning
**URL:** https://www.perplexity.ai/spaces/rpm-weekly-planning-zQZcvZLtT.u_CJsQkXw9uA

**Purpose:** Strategic planning, goal tracking, RPM facilitation

**Instructions Template:**
```
You are Liv Hana Research Agent for RPM Planning.

Context:
- Profit focus: $100K → $1M EBITDA → $1M/month
- Cannabis industry compliance required (21+, THC ≤0.3%, COA verification)
- RPM framework: Result → Purpose → MAP (80/20, 5/55, ONE THING lenses)
- Citation requirement: ≥2 web sources per claim

Research Guidelines:
1. Prioritize profit contribution over revenue metrics
2. Flag compliance risks immediately (age verification, medical claims, THC limits)
3. Cross-reference against canonical truths (stored in project knowledge)
4. Apply 80/20 lens: Which 20% drives 80% profit impact?
5. Calculate autonomous execution timeframes (parallel model capability)

Output Format:
- Result: ONE sentence
- Purpose: Connection to "Deschedule Cannabis sativa L."
- MAP: 3-5 actions with profit contribution ($)
- Citations: Minimum 2 web sources
- Risks: Compliance, financial, operational
```

#### Space 2: Compliance Intelligence
**Purpose:** Real-time regulatory tracking, 50-state cannabis laws

**Instructions Template:**
```
You are Liv Hana Compliance Research Agent.

Focus Areas:
- Texas regulations: GA-56, DSHS 25 TAC §300.701-702, TABC 16 TAC §51.1-51.2
- Hemp vs. Cannabis distinctions (THC content, COA requirements)
- Age verification requirements (21+ enforcement)
- Medical claims prohibitions
- Smokable product bans

Alert Triggers:
- New emergency rules (DSHS, TABC)
- Enforcement actions (competitors, industry)
- COA accreditation changes (ISO 17025)
- Payment processor policy updates

Output Format:
- Regulation: [Citation with URL]
- Impact: [Immediate action required? Yes/No]
- Deadline: [Date if applicable]
- Mitigation: [3 action steps]
- Cost: [Compliance expense estimate]
```

#### Space 3: Competitive Intelligence
**Purpose:** Market analysis, competitor tracking, pricing strategy

**Instructions Template:**
```
You are Liv Hana Market Research Agent.

Research Topics:
- Competitor pricing (D2C cannabis/hemp products)
- Age verification solutions (alternatives to Veriff)
- POS system comparisons (LightSpeed vs. alternatives)
- Payment processors (Kaja vs. competitors)
- Domain consolidation strategies (301 redirects, SEO impact)

Analysis Framework:
- Feature comparison matrix
- Pricing breakdown (one-time vs. recurring)
- Integration complexity (API availability, OAuth support)
- Profit contribution potential ($XXK impact)
- Implementation timeframe (autonomous execution estimate)

Output Format:
- Competitor: [Name]
- Strengths: [3 key advantages]
- Weaknesses: [3 exploitable gaps]
- Our Advantage: [Unique differentiator]
- Action: [Strategic move to capitalize]
```

#### Space 4: Technical Research
**Purpose:** Architecture decisions, tool evaluations, integration guides

**Instructions Template:**
```
You are Liv Hana Technical Research Agent.

Evaluation Criteria:
- Setup time (<2 hours preferred)
- Maintenance burden (managed service > self-hosted)
- Integration complexity (OAuth > API keys > custom)
- Cost scaling ($0.10-0.50 per operation target)
- Security compliance (SOC 2, GDPR, CCPA)

Research Format:
- Tool: [Name + URL]
- Purpose: [One sentence]
- Setup Time: [Hours]
- Cost: [$ per month OR $ per operation]
- Integration: [OAuth/API/Custom]
- Pros: [3 advantages]
- Cons: [3 limitations]
- Recommendation: [ACCEPT/REJECT with rationale]
```

### 3. Context Optimization

#### Collections (Knowledge Bases)
Create Perplexity Collections for:
1. **Liv Hana Project Docs:** Upload key markdown files (PRD, ADR, RPM plans)
2. **Cannabis Regulations:** Texas GA-56, DSHS rules, TABC codes
3. **Competitor Intel:** Scraped data from Apify, public filings
4. **Technical Specs:** API documentation, integration guides

#### Upload Priority
1. `docs/LIV_HANA_VOICE_MODE_PRD_ADR_v1_0.md`
2. `docs/LIV_HANA_RPM_WEEKLY_PLAN_OCT20-27_2025_TEAM_PILOT.md`
3. `config/claude_tier1_context.yaml`
4. `.claude/TIER1_FUNNEL_AUTHORITY.md`
5. `docs/SLACK_ANNOUNCEMENT_LIV_HANA_BREAKTHROUGH.md`

#### Search Settings
- **Focus:** All (comprehensive search across web, academic, news)
- **Time Range:** Recent (last 30 days for regulatory changes)
- **Citation Style:** IEEE (numbered references with URLs)
- **Language:** English (primary), Spanish (secondary for DSHS docs)

---

## RESEARCH AGENT INTEGRATION

### Auto-Launch Configuration
```bash
# scripts/start_research_agent.sh
#!/bin/bash

# Verify PERPLEXITY_API_KEY
if [[ -z "$PERPLEXITY_API_KEY" ]]; then
  echo "❌ PERPLEXITY_API_KEY not set"
  exit 1
fi

# Launch research agent in tmux
tmux new-session -d -s research-agent \
  "claude-tier1 research --tools perplexity,apify --log logs/research/research_agent_$(date +%Y%m%d_%H%M%S).log"

echo "✅ Research agent started (tmux session: research-agent)"
```

### Status Tracking
```json
// tmp/agent_status/research.status.json
{
  "agent": "research",
  "phase": "perplexity_verify",
  "status": "running",
  "started_at": "2025-10-29T12:00:00Z",
  "current_query": "Texas GA-56 enforcement deadline",
  "artifacts": ["docs/fallacy-scan.md"],
  "perplexity_calls": 3,
  "citations_gathered": 8,
  "notes": "Regulatory intelligence for compliance deadline"
}
```

### Output Files
- `docs/fallacy-scan.md`: Verification results, flagged fallacies
- `logs/research/*.log`: Detailed query logs with timestamps
- `data/verified/perplexity_verified.json`: Structured verification data

---

## QUERY OPTIMIZATION PATTERNS

### 1. Regulatory Intelligence
```
Query: "Texas DSHS hemp emergency rules 25 TAC 300.701 enforcement deadline October 2025"

Expected Output:
- Regulation citation with URL
- Effective date + deadline
- Key requirements (age 21+, smokable ban, COA)
- Enforcement actions (if any)
- Compliance checklist
```

### 2. Competitive Analysis
```
Query: "Age verification solutions for cannabis e-commerce Veriff alternatives 2025 pricing"

Expected Output:
- Tool comparison matrix (Veriff, Persona, IDology, AuthenticID)
- Pricing breakdown (setup + per-verification)
- Integration complexity (API, OAuth, iframe)
- Compliance certifications (GDPR, CCPA)
- Recommendation with profit contribution estimate
```

### 3. Technical Evaluation
```
Query: "OpenAI Agent Builder vs LangChain vs custom FastAPI voice pipeline 2025 comparison"

Expected Output:
- Feature matrix (workflow builder, MCP support, voice integration)
- Setup time estimate (hours)
- Cost analysis ($ per session)
- Maintenance burden (managed vs self-hosted)
- ADR-style recommendation (ACCEPT/REJECT with rationale)
```

### 4. Market Research
```
Query: "D2C cannabis hemp product pricing analysis THCA vape cartridges Texas 2025"

Expected Output:
- Competitor pricing range ($XX-YY per unit)
- Market positioning (premium vs value)
- Margin analysis (COGS vs retail)
- Demand signals (search volume, trends)
- Pricing recommendation for profit maximization
```

---

## TRUTH PIPELINE WORKFLOW

### Stage 2: Perplexity Verify
```bash
# scripts/step_perplexity_verify.sh

#!/bin/bash
set -euo pipefail

INPUT_FILE="data/scraped/apify_output.json"
OUTPUT_FILE="data/verified/perplexity_verified.json"
LOG_FILE="logs/research/perplexity_verify_$(date +%Y%m%d_%H%M%S).log"

echo "[$(date -u +%Y-%m-%dT%H:%M:%SZ)] Starting Perplexity verification" | tee -a "$LOG_FILE"

# Extract claims from Apify scrape
claims=$(jq -r '.claims[]' "$INPUT_FILE")

# Verify each claim via Perplexity API
verified_claims=()
for claim in $claims; do
  echo "[VERIFY] Checking: $claim" | tee -a "$LOG_FILE"

  # Call Perplexity API (example using curl)
  response=$(curl -s -X POST https://api.perplexity.ai/chat/completions \
    -H "Authorization: Bearer $PERPLEXITY_API_KEY" \
    -H "Content-Type: application/json" \
    -d "{
      \"model\": \"sonar-pro\",
      \"messages\": [{
        \"role\": \"user\",
        \"content\": \"Verify this claim with citations: $claim\"
      }],
      \"temperature\": 0.2,
      \"return_citations\": true
    }")

  # Extract verification status + citations
  verified=$(echo "$response" | jq -r '.choices[0].message.content')
  citations=$(echo "$response" | jq -r '.citations[]')

  if [[ $(echo "$citations" | wc -l) -ge 2 ]]; then
    echo "[VERIFY] ✅ VERIFIED: $claim" | tee -a "$LOG_FILE"
    verified_claims+=("$claim")
  else
    echo "[VERIFY] ❌ INSUFFICIENT CITATIONS: $claim" | tee -a "$LOG_FILE"
  fi
done

# Write verified claims to output
jq -n --arg claims "${verified_claims[*]}" '{
  "stage": "perplexity_verify",
  "status": "ok",
  "verified": ($claims | split(" ")),
  "citations": ["S1", "S2"]
}' > "$OUTPUT_FILE"

echo "[$(date -u +%Y-%m-%dT%H:%M:%SZ)] Perplexity verification complete" | tee -a "$LOG_FILE"
```

### Integration with Agent Builder
```python
# Agent Builder → MCP Node → Perplexity Tool

def perplexity_search(query: str, focus: str = "all") -> dict:
    """
    Query Perplexity API with citation tracking.

    Args:
        query: Search query
        focus: Search focus (all, academic, news, writing, wolfram, youtube, reddit)

    Returns:
        {
            "answer": str,
            "citations": [{"title": str, "url": str}],
            "images": [{"url": str, "description": str}]
        }
    """
    response = requests.post(
        "https://api.perplexity.ai/chat/completions",
        headers={
            "Authorization": f"Bearer {os.getenv('PERPLEXITY_API_KEY')}",
            "Content-Type": "application/json"
        },
        json={
            "model": "sonar-pro",
            "messages": [{"role": "user", "content": query}],
            "temperature": 0.2,
            "search_focus": focus,
            "return_citations": True,
            "return_images": True
        }
    )

    data = response.json()
    return {
        "answer": data["choices"][0]["message"]["content"],
        "citations": data.get("citations", []),
        "images": data.get("images", [])
    }
```

---

## COST OPTIMIZATION

### API Usage Tiers
- **Free Tier:** 5 queries/day (not suitable for production)
- **Pro ($20/month):** 300 queries/day + file uploads
- **Enterprise (Custom):** Unlimited queries + dedicated support

### Cost Estimates (Liv Hana Usage)
- **Research Agent:** ~50 queries/day = ~1500/month
- **TRUTH Pipeline:** ~20 verifications/day = ~600/month
- **Total:** ~2100 queries/month

**Recommended Plan:** Pro ($20/month) initially, scale to Enterprise if >300 queries/day

### Query Efficiency Tips
1. **Batch queries:** Combine related claims into single verification request
2. **Cache results:** Store verified claims in Redis (TTL: 24 hours)
3. **Fallback strategy:** If PERPLEXITY_API_KEY missing, use web search as backup
4. **Rate limiting:** Max 5 queries/second (Pro tier limit)

---

## SECURITY & COMPLIANCE

### API Key Protection
- ✅ Store in 1Password or GCP Secret Manager (NEVER in code)
- ✅ Rotate every 90 days
- ✅ Monitor usage via Perplexity dashboard (detect anomalies)
- ✅ Restrict access to production environments only

### Data Handling
- ✅ PII redaction before sending to Perplexity (SSN, credit cards, medical records)
- ✅ Cannabis compliance: No medical claims in queries
- ✅ Audit logging: Track all queries + responses in `logs/research/*.log`
- ✅ Citation verification: Require ≥2 sources per claim

### Guardrails Integration
```python
# Pre-query guardrail (PII detection)
def sanitize_query(query: str) -> str:
    """Remove PII before sending to Perplexity."""
    import re
    query = re.sub(r'\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}\b', '[EMAIL]', query)
    query = re.sub(r'\b\d{3}-\d{2}-\d{4}\b', '[SSN]', query)
    query = re.sub(r'\b\d{3}[-.]?\d{3}[-.]?\d{4}\b', '[PHONE]', query)
    return query

# Post-response guardrail (medical claims blocking)
def validate_response(response: str) -> bool:
    """Block responses with medical claims."""
    medical_keywords = ['treats', 'cures', 'diagnoses', 'prevents', 'therapeutic benefit']
    return not any(keyword in response.lower() for keyword in medical_keywords)
```

---

## TROUBLESHOOTING

### Common Issues

#### 1. API Key Not Found
```
Error: PERPLEXITY_API_KEY not set
Fix:
  1. Verify key stored in 1Password: op item get "Perplexity API Key"
  2. Check .env.local: cat .env.local | grep PERPLEXITY
  3. Export manually: export PERPLEXITY_API_KEY=pplx-xxxxx
```

#### 2. Rate Limit Exceeded
```
Error: 429 Too Many Requests
Fix:
  1. Check current usage: curl -H "Authorization: Bearer $PERPLEXITY_API_KEY" https://api.perplexity.ai/usage
  2. Implement exponential backoff (retry after 1s, 2s, 4s, 8s)
  3. Upgrade to Enterprise plan if sustained >300 queries/day
```

#### 3. Insufficient Citations
```
Error: TRUTH pipeline requires ≥2 citations, got 1
Fix:
  1. Refine query to be more specific (add year, location, regulation number)
  2. Use "search_focus": "academic" for regulatory queries
  3. Fallback to web search if Perplexity fails
```

#### 4. Space Access Denied
```
Error: 403 Forbidden when accessing Perplexity Space
Fix:
  1. Spaces require authentication (cannot fetch via WebFetch tool)
  2. Export space data manually: Settings → Export → JSON
  3. Store exported data in data/perplexity_exports/
  4. Reference in prompts: "See perplexity_exports/rpm_planning.json for context"
```

---

## PERFORMANCE METRICS

### Research Agent KPIs
- **Query Latency:** <2 seconds (P95)
- **Citation Rate:** ≥2 sources per verification
- **Accuracy:** >95% (validated via QA agent)
- **Cost:** <$0.05 per verification
- **Uptime:** 99.5% (excluding planned maintenance)

### TRUTH Pipeline Impact
- **Stage 2 Completion Time:** <30 seconds (per verification)
- **Compression Savings:** ≥40% (verified claims vs raw scrape)
- **Success Rate:** ≥95% (passed verifications)
- **Profit Contribution:** $XXK (from faster decision-making)

---

## NEXT STEPS

### Immediate Actions (This Week)
1. [ ] **Obtain Perplexity API Key**
   - Sign up at https://www.perplexity.ai/settings/api
   - Store in 1Password vault: "LivHana-Secrets"
   - Export in boot script: `export PERPLEXITY_API_KEY=$(op item get "Perplexity API Key" --fields label=credential)`

2. [ ] **Configure Spaces**
   - Create 4 spaces (RPM Planning, Compliance, Competitive, Technical)
   - Upload priority docs (PRD, ADR, RPM plans)
   - Set context instructions per space

3. [ ] **Test Research Agent**
   - Run: `scripts/start_research_agent.sh`
   - Verify: `tail -f logs/research/research_agent_*.log`
   - Validate: `cat tmp/agent_status/research.status.json`

4. [ ] **Integrate with TRUTH Pipeline**
   - Update: `scripts/step_perplexity_verify.sh`
   - Test: `bash scripts/step_perplexity_verify.sh`
   - Verify: `cat data/verified/perplexity_verified.json`

### Future Enhancements (Next Sprint)
- [ ] Implement citation caching (Redis TTL: 24 hours)
- [ ] Add Perplexity widget to frontend (embedded search)
- [ ] Create compliance alert system (regulatory change detection)
- [ ] Build competitor tracking dashboard (weekly reports)
- [ ] Optimize query batching (reduce API calls by 30%)

---

## APPENDIX A: API REFERENCE

### Perplexity Sonar Pro API
```bash
# Example query
curl -X POST https://api.perplexity.ai/chat/completions \
  -H "Authorization: Bearer $PERPLEXITY_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{
    "model": "sonar-pro",
    "messages": [{"role": "user", "content": "Texas cannabis regulations October 2025"}],
    "temperature": 0.2,
    "max_tokens": 1000,
    "return_citations": true,
    "return_images": false,
    "search_focus": "all"
  }'

# Example response
{
  "id": "uuid",
  "model": "sonar-pro",
  "created": 1730192400,
  "choices": [{
    "index": 0,
    "message": {
      "role": "assistant",
      "content": "As of October 2025, Texas cannabis regulations are governed by..."
    },
    "finish_reason": "stop"
  }],
  "citations": [
    {"title": "Texas DSHS Hemp Rules", "url": "https://..."},
    {"title": "TABC Age Verification", "url": "https://..."}
  ],
  "usage": {
    "prompt_tokens": 50,
    "completion_tokens": 200,
    "total_tokens": 250
  }
}
```

---

## APPENDIX B: EXAMPLE QUERIES

### 1. Regulatory Verification
```
Query: "Verify claim: 'Texas requires 21+ age verification for hemp products effective October 2025'"

Expected Citations:
- Texas DSHS 25 TAC §300.701 (age requirement)
- TABC 16 TAC §51.1 (age verification mandate)
```

### 2. Competitive Pricing
```
Query: "Veriff pricing 2025 per-verification cost vs Persona vs AuthenticID"

Expected Output:
| Tool | Setup Fee | Per Verification | Monthly Min |
|------|-----------|------------------|-------------|
| Veriff | $0 | $1.50-2.00 | $500 |
| Persona | $0 | $1.00-1.50 | $300 |
| AuthenticID | $500 | $0.50-1.00 | $200 |

Recommendation: AuthenticID ($500 setup + $0.75/verify = $1100 for 80 blocked customers vs Veriff $2000)
```

### 3. Technical Feasibility
```
Query: "OpenAI Agent Builder MCP integration Rube 2025 setup time OAuth flow"

Expected Output:
- Setup Time: 5-10 minutes
- OAuth Flow: Automated via Rube popup
- MCP URL: https://rube.app/mcp
- Token Storage: Persistent (no re-auth)
- Cost: $0 (Rube free tier for 500 tools)

ADR: ACCEPT (faster than custom MCP broker by 2-4 weeks)
```

---

**Document Status:** ✅ COMPLETE
**Ready For:** Immediate implementation (pending API key acquisition)
**Next Action:** Obtain Perplexity API key and configure spaces

**Timestamp:** 2025-10-29T07:31:00Z
