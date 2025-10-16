### **Component 4: Incentivized Review System**

**File:** `frontend/vibe-cockpit/src/components/IncentivizedReviewModal.jsx`
**Purpose:** Reward customers for leaving detailed LSTE reviews

**Features:**

- Prompt customer after purchase (7 days delay)
- Show current reward: "$5 credit for review"
- Tiered rewards:
  - Basic review (headline + body): $5 credit
  - LSTE review (all 4 metrics): $10 credit
  - Photo review (image upload): $15 credit
  - Video review (YouTube link): $25 credit
- Instant credit to account (visible in next purchase)

**Reward ROI:**

```
Cost: $10 credit per review
Value: 10 reviews × $10 = $100 cost
Benefit:
- 10 reviews = higher Google ranking (more organic traffic)
- 10 reviews = social proof (higher conversion rate)
- 10 reviews = LSTE data (better inventory decisions)
- Estimated value: $500 in additional revenue per 10 reviews
ROI: $500 / $100 = 500% ROI
```

**API Endpoints:**

```javascript
POST /api/reviews/incentive/trigger  // Trigger review prompt (7 days after purchase)
GET /api/reviews/incentive/stats     // Get reward stats (total credits given)
POST /api/reviews/incentive/reward   // Award credit to customer
```

---
