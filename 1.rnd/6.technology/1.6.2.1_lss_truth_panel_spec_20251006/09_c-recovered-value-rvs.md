### **C. Recovered Value (RVS)**

```json
{
  "marketplace_fee_avoided": {
    "amount": "number",
    "percentage": "number",
    "source": "string" // "Amazon referral fee: 12%"
  },
  "ad_tax_avoided": {
    "amount": "number",
    "percentage": "number",
    "source": "string" // "Estimated DTC CAC: 15%"
  },
  "total_recovered": "number",
  "rvs_split": {
    "user_cashback": "number", // 50%
    "liv_hana": "number", // 30%
    "brand_discount": "number" // 20%
  },
  "confidence_score": "number" // 0-100
}
```
