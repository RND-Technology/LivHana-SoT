## Rate Limiting & Quota Management

```javascript
// rate-limiter.mjs

export class RateLimiter {
  constructor(config) {
    this.limits = config;
    this.usage = {};
    this.resetTimes = {};
  }

  /**
   * Check if request can be made
   */
  async checkLimit(platform, operation = 'default') {
    const key = `${platform}:${operation}`;
    const limit = this.limits[platform]?.[operation] || { requests: 100, window: 3600000 };

    // Initialize tracking
    if (!this.usage[key]) {
      this.usage[key] = [];
      this.resetTimes[key] = Date.now() + limit.window;
    }

    // Reset if window has passed
    if (Date.now() >= this.resetTimes[key]) {
      this.usage[key] = [];
      this.resetTimes[key] = Date.now() + limit.window;
    }

    // Remove old requests outside window
    const cutoff = Date.now() - limit.window;
    this.usage[key] = this.usage[key].filter(timestamp => timestamp > cutoff);

    // Check if limit reached
    if (this.usage[key].length >= limit.requests) {
      const oldestRequest = this.usage[key][0];
      const waitTime = limit.window - (Date.now() - oldestRequest);
      throw new Error(`Rate limit exceeded for ${platform}. Retry in ${Math.ceil(waitTime / 1000)}s`);
    }

    // Record this request
    this.usage[key].push(Date.now());
    return true;
  }

  /**
   * Get remaining requests for platform
   */
  getRemaining(platform, operation = 'default') {
    const key = `${platform}:${operation}`;
    const limit = this.limits[platform]?.[operation]?.requests || 100;
    const used = this.usage[key]?.length || 0;
    return limit - used;
  }
}

/**
 * Platform rate limit configurations
 */
export const rateLimitConfig = {
  youtube: {
    upload: { requests: 6, window: 86400000 }, // 6 per day
    update: { requests: 100, window: 86400000 }
  },
  tiktok: {
    upload: { requests: 20, window: 86400000 }, // Estimated limit
    default: { requests: 1000, window: 86400000 }
  },
  instagram: {
    upload: { requests: 25, window: 86400000 },
    default: { requests: 200, window: 3600000 }
  },
  twitter: {
    tweet: { requests: 300, window: 900000 }, // 300 per 15 min
    media: { requests: 15, window: 3600000 }
  }
};
```

---
