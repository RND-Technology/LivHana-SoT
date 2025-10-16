### **E. Trust/Reputation Score**

```json
{
  "trust_score": "number", // 0-100
  "vendor_rating": "number", // 1-5 stars
  "verified_reviews": "number",
  "dispute_rate": "number", // percentage
  "recall_history": [
    {
      "date": "ISO-8601",
      "reason": "string",
      "resolved": "boolean"
    }
  ],
  "certifications": [
    "string" // "BBB Accredited", "USDA Organic"
  ],
  "provenance": {
    "grown_in": "string",
    "manufactured_in": "string",
    "lab_tested_by": "string"
  }
}
```
