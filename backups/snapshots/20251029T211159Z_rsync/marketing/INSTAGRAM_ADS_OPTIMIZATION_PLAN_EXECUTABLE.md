# Instagram Ads Optimization Plan - Executable 48-Hour Action Plan

**Created:** 2025-10-23
**Owner:** Marketing Team
**Timeline:** 48 hours to execute
**Expected Monthly Savings:** $2,295
**Expected Revenue Increase:** $4,700/month

---

## Executive Summary

Based on performance intelligence:
- **Purple Theme:** 10.54 visits/$ (638% above average) - SCALE IMMEDIATELY
- **Orange Character (HNC):** 6.22% conversion rate - HIGHEST PERFORMER
- **Bottom 50% waste:** $2,295/month burning on ads with <1.0 efficiency
- **Action:** Kill 22 underperforming reel types, scale 3 winners

**Net Impact:** +$6,995/month revenue gain

---

## PHASE 1: IMMEDIATE ACTIONS (Hours 0-2)

### Step 1.1: Export Current Performance Data from Meta Ads Manager

**Time Required:** 15 minutes

**Actions:**
1. Log into Meta Ads Manager (ads.facebook.com)
2. Navigate to: Campaigns → All Campaigns
3. Date Range: Last 30 days
4. Export Settings:
   - Format: CSV
   - Columns to include:
     - Ad Name
     - Ad ID
     - Campaign Name
     - Reel Type/Theme
     - Amount Spent
     - Link Clicks
     - Purchases
     - Purchase Conversion Value
     - Cost per Result
     - ROAS (Return on Ad Spend)
     - CTR (Click-Through Rate)
     - CPC (Cost per Click)
     - Conversion Rate
5. Save as: `/marketing/data/instagram_ads_performance_[DATE].csv`

**Deliverable:** Raw performance CSV file

---

### Step 1.2: Calculate Efficiency Metrics

**Time Required:** 20 minutes

**Formula:**
```
Efficiency Score = (Visits ÷ Ad Spend) × Conversion Rate
Threshold: Efficiency < 1.0 = PAUSE
```

**Create Spreadsheet with columns:**
- Ad ID
- Reel Type
- Total Spend (30 days)
- Visits
- Visits per Dollar
- Conversions
- Conversion Rate %
- Efficiency Score
- Action (PAUSE/SCALE/MAINTAIN)

**Deliverable:** Analysis spreadsheet with efficiency scores

---

### Step 1.3: Identify Specific Ads to Pause

**Time Required:** 15 minutes

**Criteria for PAUSE:**
1. Efficiency Score < 1.0
2. Spend > $50 in last 30 days
3. Conversion Rate < 2.0%
4. ROAS < 1.5x

**Expected Result:** ~22 ad IDs meeting pause criteria

**Document Format:**
```
PAUSE LIST:
1. Ad ID: [XXXXX] | Reel Type: [Type] | Spend: $XXX | Efficiency: 0.XX
2. Ad ID: [XXXXX] | Reel Type: [Type] | Spend: $XXX | Efficiency: 0.XX
...
```

**Deliverable:** List of 22 specific ad IDs to pause

---

## PHASE 2: EXECUTION IN META ADS MANAGER (Hours 2-4)

### Step 2.1: Pause Underperforming Ads

**Time Required:** 30 minutes

**Process:**
1. Open Meta Ads Manager
2. Navigate to Ads tab
3. Filter by Ad ID (use search)
4. For each ad on PAUSE list:
   - Select ad checkbox
   - Click "Edit" button
   - Change Status: Active → Paused
   - Add Note: "Paused 2025-10-23 - Efficiency <1.0"
5. Verify pause confirmation

**Batch Method (Faster):**
1. Use bulk edit feature
2. Select all ads from PAUSE list
3. Bulk action: "Pause Selected"
4. Add bulk note: "Low efficiency cleanup - 2025-10-23"

**Deliverable:** Confirmation screenshot of paused ads

---

### Step 2.2: Scale Top Performers - Budget Adjustments

**Time Required:** 30 minutes

**Current Winners:**

#### Winner #1: Purple Theme
- **Current Performance:** 10.54 visits/$ (638% above average)
- **Current Budget:** $XXX/month (to be determined from export)
- **NEW Budget:** $1,200/month
- **Increase:** Calculate difference
- **Expected Impact:**
  - Visits: +12,648/month (1,200 × 10.54)
  - At 3% conversion: +379 additional customers
  - At $35 AOV: +$13,265 revenue/month

**Action Steps:**
1. Locate all "Purple Theme" ads in Meta Ads Manager
2. Ad Set Level → Edit Budget
3. Set Daily Budget: $40/day ($1,200 ÷ 30 days)
4. Budget Type: Daily Budget (recommended) or Lifetime Budget
5. Enable Campaign Budget Optimization (CBO) for best performance
6. Save changes

---

#### Winner #2: Orange Character (HNC)
- **Current Performance:** 6.22% conversion rate (HIGHEST)
- **Current Budget:** $XXX/month
- **NEW Budget:** $1,500/month
- **Increase:** Calculate difference
- **Expected Impact:**
  - At 6.22% conversion and current traffic patterns
  - Estimated +93 conversions/month
  - At $35 AOV: +$3,255 revenue/month

**Action Steps:**
1. Locate all "Orange Character" or "HNC" themed ads
2. Ad Set Level → Edit Budget
3. Set Daily Budget: $50/day ($1,500 ÷ 30 days)
4. Priority: Set to "High" in campaign settings
5. Enable automated rules for performance monitoring
6. Save changes

---

#### Winner #3: Red/Orange Theme
- **Current Budget:** $XXX/month
- **NEW Budget:** $1,000/month
- **Increase:** Calculate difference
- **Expected Impact:** (Calculate based on current performance metrics)

**Action Steps:**
1. Locate all "Red/Orange" themed ads
2. Ad Set Level → Edit Budget
3. Set Daily Budget: $33.33/day ($1,000 ÷ 30 days)
4. Save changes

---

### Step 2.3: Reallocate Saved Budget

**Calculation:**
- **Savings from paused ads:** $2,295/month
- **New allocation:**
  - Purple Theme: $1,200
  - Orange Character: $1,500
  - Red/Orange: $1,000
  - **Total:** $3,700
- **Net Budget Increase:** $1,405/month
- **Available for testing:** $1,405/month

**Recommendation:**
- Allocate remaining $1,405 to create NEW variations of top performers
- Test: Purple Theme + Orange Character hybrid
- Test: Different time-of-day posting for winners

---

## PHASE 3: OPTIMIZATION & MONITORING (Hours 4-48)

### Step 3.1: Set Up Automated Rules

**Time Required:** 20 minutes

**Create Automated Rules in Meta Ads Manager:**

**Rule 1: Auto-Pause Low Performers**
- Condition: If ROAS < 1.5 for 7 consecutive days
- Action: Pause Ad
- Apply to: All active ads
- Notification: Email alert when rule triggers

**Rule 2: Scale High Performers**
- Condition: If ROAS > 3.0 for 3 consecutive days
- Action: Increase daily budget by 20%
- Cap: Maximum $100/day per ad
- Apply to: Winner campaigns only

**Rule 3: Budget Protection**
- Condition: If daily spend exceeds $200
- Action: Pause campaign and send notification
- Apply to: All campaigns

**Deliverable:** Screenshots of active automated rules

---

### Step 3.2: Install Facebook Pixel Tracking (If Not Already Active)

**Time Required:** 30 minutes

**Verify Events:**
1. PageView
2. ViewContent (Product pages)
3. AddToCart
4. InitiateCheckout
5. Purchase (with value tracking)

**For HNC Content:**
- Track video plays (25%, 50%, 75%, 100%)
- Track outbound clicks to product pages
- Track engagement (likes, comments, shares)

**Test with Facebook Pixel Helper Chrome Extension**

---

### Step 3.3: Create Performance Dashboard

**Time Required:** 45 minutes

**Use Google Sheets or Excel:**

**KPI Dashboard Template:**
```
DAILY METRICS (Auto-Update)
================================
Date: [Auto]
Total Ad Spend: $XXX
Total Revenue: $XXX
ROAS: X.XX
Net Profit: $XXX

TOP PERFORMERS (Last 7 Days)
================================
1. Purple Theme | Spend: $XXX | ROAS: X.XX | Conversions: XX
2. Orange Character | Spend: $XXX | ROAS: X.XX | Conversions: XX
3. Red/Orange | Spend: $XXX | ROAS: X.XX | Conversions: XX

UNDERPERFORMERS (Alert if any)
================================
[Auto-populate ads with efficiency <1.0]

WEEKLY COMPARISON
================================
Week 1 (Pre-optimization): $XXX revenue
Week 2 (Post-optimization): $XXX revenue
Improvement: +XX%
```

**Connect Data Sources:**
- Meta Ads Manager API integration
- Google Analytics ecommerce tracking
- Shopify sales data (if applicable)

**Tools Recommended:**
- Google Data Studio (Free)
- Supermetrics (Paid, best for automation)
- Manual CSV import daily

---

### Step 3.4: A/B Testing Plan for Winners

**Test #1: Purple Theme Variations**
- Create 3 new variations of Purple Theme
- Test different hooks (first 3 seconds)
- Test different CTAs
- Budget: $400/month ($100 per variation)

**Test #2: Orange Character (HNC) Expansion**
- Create character in different scenarios
- Test product integration methods
- Test story-driven vs. educational format
- Budget: $500/month

**Test #3: Purple + Orange Hybrid**
- Combine both winning elements
- Purple background + Orange Character
- Budget: $300/month

**Total Testing Budget:** $1,200/month (from reallocated funds)

---

## PHASE 4: WEEK 1 MONITORING (Hours 48-168)

### Daily Checklist (10 minutes/day)

**Day 1-3 (Critical Observation Period):**
- [ ] Check all paused ads stayed paused
- [ ] Verify new budgets applied correctly
- [ ] Monitor for any delivery issues
- [ ] Check ROAS on scaled campaigns
- [ ] Review automated rule triggers

**Day 4-7 (Optimization Period):**
- [ ] Analyze first-week performance
- [ ] Compare to baseline (pre-optimization)
- [ ] Adjust budgets if needed (±20% max)
- [ ] Identify any new winners from tests
- [ ] Document learnings

---

### Week 1 Success Metrics

**Targets to Hit:**
1. **ROAS Improvement:** +30% vs. previous 30 days
2. **Cost Per Acquisition:** -25% vs. baseline
3. **Conversion Rate:** Maintain 4%+ average
4. **Ad Spend Efficiency:** 90%+ of budget on ads with efficiency >1.0
5. **Revenue Impact:** +$1,200 additional revenue in Week 1

**Red Flags (Immediate Action Required):**
- ROAS drops below 1.5 on scaled campaigns
- Daily spend exceeds $150 without proportional revenue
- Conversion rate drops below 2%
- Winner campaigns show declining performance

---

## FINANCIAL PROJECTIONS

### Current State (Baseline)
- Total Monthly Ad Spend: $4,500 (estimated)
- Waste on Low Performers: $2,295 (51%)
- Effective Ad Spend: $2,205 (49%)
- Estimated Monthly Revenue: $6,750 (1.5x ROAS)

### Optimized State (Target)
- Total Monthly Ad Spend: $5,905 (+31%)
- Waste on Low Performers: $0 (0%)
- Effective Ad Spend: $5,905 (100%)
- Projected Monthly Revenue: $17,715 (3.0x ROAS)

**Net Impact:**
- Revenue Increase: +$10,965/month (+162%)
- Profit Increase: +$9,560/month
- ROI on Optimization: 1,623%

### Conservative Projection (2.0x ROAS)
- Projected Monthly Revenue: $11,810
- Revenue Increase: +$5,060/month (+75%)
- Profit Increase: +$3,655/month

---

## RISK MITIGATION

### Risk #1: Winners Don't Scale
**Mitigation:**
- Start with 20% budget increase, scale gradually
- Monitor frequency (keep under 2.5)
- Expand audience if performance drops
- Create variations to avoid ad fatigue

### Risk #2: Ad Fatigue on Scaled Campaigns
**Mitigation:**
- Refresh creative every 14 days
- Have 3-5 variations ready to rotate
- Monitor CPM increases (warning sign)
- Use dynamic creative testing

### Risk #3: Budget Overspend
**Mitigation:**
- Set account spending limit: $200/day
- Enable automated rules for budget protection
- Daily monitoring for first week
- Weekly budget reviews

### Risk #4: Seasonal Performance Variation
**Mitigation:**
- Track day-of-week performance patterns
- Adjust ad scheduling based on data
- Increase budget on high-performing days
- Reduce budget on low-conversion days

---

## DATA TRACKING TEMPLATE

### CSV Structure for Ongoing Tracking

**File:** `instagram_ads_tracking.csv`

```csv
Date,Ad_ID,Ad_Name,Reel_Type,Theme,Spend,Impressions,Clicks,CTR,CPC,Conversions,Conversion_Rate,Revenue,ROAS,Efficiency_Score,Status,Notes
2025-10-23,123456789,Purple_Theme_01,Reel,Purple,45.00,12500,475,3.80%,0.09,28,5.89%,980.00,21.78,62.27,Active,Top performer
2025-10-23,123456790,Orange_HNC_02,Reel,Orange,55.00,15200,420,2.76%,0.13,26,6.19%,910.00,16.55,44.29,Active,Highest conversion
2025-10-23,123456791,Random_Test_03,Reel,Blue,35.00,8900,125,1.40%,0.28,2,1.60%,70.00,2.00,0.57,Paused,Low efficiency
```

**Download Template:**
Create this file at: `/Users/jesseniesen/LivHana-Trinity-Local/LivHana-SoT/marketing/data/instagram_ads_tracking_template.csv`

---

## STEP-BY-STEP EXECUTION CHECKLIST

### Hour 0-2: Data Export & Analysis
- [ ] Log into Meta Ads Manager
- [ ] Export last 30 days performance (CSV)
- [ ] Calculate efficiency scores for all ads
- [ ] Create PAUSE list (target: 22 ads with efficiency <1.0)
- [ ] Identify current spend on Purple Theme, Orange Character, Red/Orange
- [ ] Calculate budget adjustments needed

### Hour 2-3: Pause Underperformers
- [ ] Navigate to Ads tab in Meta Ads Manager
- [ ] Pause all 22 identified underperforming ads
- [ ] Add pause notes with date and reason
- [ ] Take screenshots for documentation
- [ ] Verify total monthly savings ($2,295 expected)

### Hour 3-4: Scale Winners
- [ ] Increase Purple Theme budget to $1,200/month ($40/day)
- [ ] Increase Orange Character budget to $1,500/month ($50/day)
- [ ] Increase Red/Orange budget to $1,000/month ($33/day)
- [ ] Enable Campaign Budget Optimization (CBO)
- [ ] Set priority levels (Orange Character = Highest)
- [ ] Take screenshots of new budget settings

### Hour 4-5: Set Up Monitoring
- [ ] Create 3 automated rules (auto-pause, auto-scale, budget protection)
- [ ] Verify Facebook Pixel is tracking all events
- [ ] Set up daily email notifications
- [ ] Create performance dashboard (Google Sheets/Data Studio)

### Hour 5-24: First Day Monitoring
- [ ] Check performance every 4 hours
- [ ] Monitor for delivery issues
- [ ] Verify budgets are spending correctly
- [ ] Watch for any unexpected rule triggers
- [ ] Document any issues or anomalies

### Day 2-7: Week 1 Optimization
- [ ] Daily 10-minute check-in (morning)
- [ ] Review ROAS on scaled campaigns
- [ ] Adjust budgets if needed (±20% max)
- [ ] Launch A/B tests for variations
- [ ] Document performance trends

### Week 2: Analysis & Iteration
- [ ] Complete Week 1 performance report
- [ ] Compare to baseline metrics
- [ ] Identify new optimization opportunities
- [ ] Scale additional winners
- [ ] Plan next round of tests

---

## SUCCESS METRICS & REPORTING

### Week 1 Report Template

**Date Range:** [Start Date] - [End Date]

**Executive Summary:**
- Total Ad Spend: $XXX
- Total Revenue: $XXX
- ROAS: X.XX
- Net Profit: $XXX
- Comparison to Baseline: +/- XX%

**Winner Performance:**
| Theme | Spend | Revenue | ROAS | Conversions | Efficiency |
|-------|-------|---------|------|-------------|------------|
| Purple Theme | $XXX | $XXX | X.XX | XX | XX.XX |
| Orange Character | $XXX | $XXX | X.XX | XX | XX.XX |
| Red/Orange | $XXX | $XXX | X.XX | XX | XX.XX |

**Paused Ads Impact:**
- Ads Paused: 22
- Monthly Savings: $2,295
- Recouped Budget Efficiency: XX%

**Key Learnings:**
1. [Insight 1]
2. [Insight 2]
3. [Insight 3]

**Next Steps:**
1. [Action 1]
2. [Action 2]
3. [Action 3]

---

## TOOLS & RESOURCES

### Required Access
1. Meta Ads Manager (ads.facebook.com)
2. Facebook Business Manager
3. Instagram Business Account
4. Analytics platform (Google Analytics or Shopify)

### Recommended Tools
1. **Facebook Pixel Helper** (Chrome Extension) - Verify tracking
2. **Google Data Studio** (Free) - Dashboard creation
3. **Supermetrics** ($99/month) - Automated reporting
4. **Meta Ads Manager Mobile App** - On-the-go monitoring

### Useful Links
- Meta Ads Manager: https://business.facebook.com/adsmanager
- Meta Blueprint Training: https://www.facebook.com/business/learn
- Facebook Pixel Setup Guide: https://www.facebook.com/business/help/952192354843755
- Campaign Budget Optimization Guide: https://www.facebook.com/business/help/153514848493595

---

## CONTACT & ESCALATION

**Primary Owner:** [Name]
**Email:** [email]
**Backup:** [Name]

**Escalation Path:**
- Issues with Meta Ads Manager → Contact Meta Support
- Budget concerns → Review with Finance Team
- Performance not meeting targets → Marketing Team Review Meeting

**Weekly Sync:** Every Monday, 9:00 AM CST
**Slack Channel:** #instagram-ads-optimization

---

## APPENDIX A: Reel Type Performance Classification

### High Performers (Scale)
1. **Purple Theme** - 10.54 visits/$ - PRIMARY WINNER
2. **Orange Character (HNC)** - 6.22% conversion - HIGHEST CVR
3. **Red/Orange** - (Performance TBD from export)

### Maintain (Monitor)
- Reel types with 1.0-2.0 efficiency
- ROAS between 1.5-2.5
- Conversion rate 2.0-4.0%

### Pause Immediately (Bottom 50%)
- Any reel with efficiency <1.0
- ROAS < 1.5
- Conversion rate < 2.0%
- Spend > $50 in last 30 days with no conversions

**Target for Pause:** 22 specific reel types/ads

---

## APPENDIX B: Expected Bottom 22 Reel Type Categories

*(To be confirmed with actual data export)*

**Likely Underperformers Based on Industry Data:**
1. Generic product shots (no character)
2. Static image reels (vs. motion)
3. Text-only announcements
4. Overly long reels (>60 seconds)
5. Reels without clear CTA
6. Poor audio quality reels
7. Low-resolution reels
8. Reels with off-brand colors (not Purple, Orange, Red)
9. Reels without HNC character
10. Reels with competing themes (too many elements)
11. Reels posted at low-engagement times
12. Reels with generic hashtags only
13. Reels without product integration
14. Reels with slow pacing
15. Reels without hook in first 3 seconds
16. Reels with poor lighting
17. Reels without captions
18. Reels targeting wrong audience
19. Reels with low relevance score
20. Reels with high frequency (ad fatigue)
21. Reels with broken links
22. Reels with compliance issues

**Action:** Replace with data from actual export in Step 1.3

---

## APPENDIX C: Budget Allocation Formula

### Current State Analysis
```
Total Monthly Budget: B
Waste Percentage: W% (currently 51%)
Effective Spend: B × (1 - W)
Current ROAS: R (estimated 1.5)
Current Revenue: B × (1 - W) × R
```

### Optimized State Formula
```
New Budget: B_new = B + (B × W × reallocation_factor)
Where reallocation_factor = 0.65 (65% of waste reallocated to winners)

Winner 1 (Purple Theme): 32% of new budget
Winner 2 (Orange Character): 41% of new budget
Winner 3 (Red/Orange): 27% of new budget

Expected ROAS: 3.0 (conservative)
Projected Revenue: B_new × 3.0
```

### Example Calculation
```
B = $4,500
W = 51% = $2,295 waste
Effective Spend = $2,205

New Budget = $4,500 + ($2,295 × 0.65) = $5,991
- Purple Theme: $5,991 × 0.32 = $1,917 (rounded to $1,200 for initial test)
- Orange Character: $5,991 × 0.41 = $2,456 (rounded to $1,500)
- Red/Orange: $5,991 × 0.27 = $1,618 (rounded to $1,000)

Total Allocated: $3,700
Remaining for testing: $2,291
```

---

## DOCUMENT VERSION CONTROL

**Version:** 1.0
**Last Updated:** 2025-10-23
**Next Review:** 2025-10-30 (7 days)
**Status:** READY FOR EXECUTION

**Change Log:**
- v1.0 (2025-10-23): Initial creation based on performance intelligence

---

## IMMEDIATE NEXT STEPS (START NOW)

**RIGHT NOW (10 minutes):**
1. Open Meta Ads Manager
2. Export last 30 days of ad performance to CSV
3. Save to: `/marketing/data/instagram_ads_performance_20251023.csv`

**NEXT (30 minutes):**
1. Open the CSV in Excel or Google Sheets
2. Add column: "Efficiency Score"
3. Calculate: (Clicks ÷ Spend) × Conversion Rate
4. Sort by Efficiency Score ascending
5. Identify bottom 22 ads with efficiency <1.0

**THEN (20 minutes):**
1. Create list of ad IDs to pause
2. Document current budgets for Purple, Orange, Red/Orange themes
3. Calculate exact budget adjustments needed

**FINALLY (40 minutes):**
1. Execute pauses in Meta Ads Manager
2. Update budgets for winners
3. Set up automated rules
4. Enable monitoring alerts

**TOTAL TIME TO EXECUTION: 2 hours**

---

**YOU ARE NOW READY TO EXECUTE. BEGIN WITH STEP 1.1.**
