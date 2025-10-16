### **D. Compliance Check (Cannabis-Specific)**

```json
{
  "compliance_score": "number", // 0-100
  "age_gate": {
    "required": "boolean",
    "verified": "boolean",
    "method": "string" // "21+ biometric ID"
  },
  "coa_available": "boolean",
  "coa_url": "string",
  "coa_validation": {
    "thca_percentage": "number",
    "delta9_thc_percentage": "number",
    "legal_in_state": "boolean",
    "state": "string",
    "nist_validated": "boolean",
    "full_panel_tested": "boolean",
    "pesticides_detected": "boolean",
    "heavy_metals_detected": "boolean",
    "microbials_detected": "boolean"
  },
  "cr_packaging": {
    "required": "boolean",
    "compliant": "boolean"
  },
  "warnings": [
    "string" // "No COA available", "Pesticides detected"
  ]
}
```
