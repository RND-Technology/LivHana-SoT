### **COA Validation:**

```javascript
if (product.category === "cannabis") {
  if (!product.coa_available) {
    return {
      warning: "No Certificate of Analysis available",
      compliance_score: Math.min(compliance_score, 60),
      recommendation: "Choose products with COAs for safety"
    };
  }

  if (product.coa_validation.pesticides_detected) {
    return {
      error: "Pesticides detected in COA",
      compliance_score: 0,
      recommendation: "DO NOT PURCHASE - Safety concern"
    };
  }
}
```

---
