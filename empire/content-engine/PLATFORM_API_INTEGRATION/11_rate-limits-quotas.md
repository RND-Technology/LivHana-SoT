### Rate Limits & Quotas

**Default Quota**: 10,000 units per day

**Operation Costs**:

- Video upload: 1,600 units
- Video update: 50 units
- Video list: 1 unit

**Daily Capacity**:

- ~6 video uploads per day (basic quota)
- Request quota increase if needed

**Quota Management**:

```javascript
// youtube-quota.mjs

export class YouTubeQuotaManager {
  constructor(dailyLimit = 10000) {
    this.dailyLimit = dailyLimit;
    this.used = 0;
    this.resetDate = new Date();
    this.resetDate.setHours(24, 0, 0, 0); // Resets at midnight PT
  }

  checkQuota(operation) {
    const costs = {
      upload: 1600,
      update: 50,
      list: 1,
      search: 100
    };

    const cost = costs[operation] || 0;

    if (this.used + cost > this.dailyLimit) {
      throw new Error(`Quota exceeded. Used: ${this.used}/${this.dailyLimit}`);
    }

    this.used += cost;
    return true;
  }

  getRemainingQuota() {
    return this.dailyLimit - this.used;
  }

  resetIfNeeded() {
    if (new Date() >= this.resetDate) {
      this.used = 0;
      this.resetDate = new Date();
      this.resetDate.setHours(24, 0, 0, 0);
    }
  }
}
```

---
