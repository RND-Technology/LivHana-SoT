### **Age Gate Enforcement:**

```javascript
if (product.category === "cannabis" || product.contains_thc) {
  if (!user.age_verified || user.age < 21) {
    return {
      error: "Age verification required",
      message: "You must be 21+ to view this product",
      action: "redirect_to_age_gate"
    };
  }
}
```
