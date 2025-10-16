### Bug Fix Proposal

```json
{
  "id": "bugfix-1234567890",
  "type": "bugfix",
  "priority": "high",
  "title": "Fix: TypeError in customer profile endpoint",
  "description": "Recurring error (15 occurrences) when profile.metadata is null",
  "implementation": {
    "file": "backend/api/customer.js",
    "fix": "Add null check before accessing metadata.preferences",
    "code": "const prefs = profile?.metadata?.preferences || {};"
  },
  "tests": [
    "Test with null metadata",
    "Test with undefined profile",
    "Test with valid data"
  ],
  "requiresApproval": false,
  "autoFixEligible": true
}
```
