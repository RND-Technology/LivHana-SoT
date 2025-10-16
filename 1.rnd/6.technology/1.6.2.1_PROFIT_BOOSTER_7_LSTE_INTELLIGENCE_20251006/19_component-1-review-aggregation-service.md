### **Component 1: Review Aggregation Service**

**File:** `backend/review-intelligence/src/index.js`
**Port:** 5002
**Purpose:** Scrape, match, and analyze reviews from all platforms

**Features:**

- Scrape Yelp, Leafly, AllBud, Google, BBB, etc.
- Extract customer name, username, review text, star rating
- Match username to customer ID (fuzzy matching)
- Extract LSTE data from text using Claude Sonnet 4.5
- Store in BigQuery (table: `external_reviews`)

**API Endpoints:**

```javascript
POST /api/reviews/scrape   // Trigger scrape job (all platforms)
GET /api/reviews/status    // Check scrape job status
GET /api/reviews/platform/:name  // Get reviews from specific platform
POST /api/reviews/match    // Match username to customer ID
GET /api/reviews/customer/:id    // Get all reviews for customer
```

---
