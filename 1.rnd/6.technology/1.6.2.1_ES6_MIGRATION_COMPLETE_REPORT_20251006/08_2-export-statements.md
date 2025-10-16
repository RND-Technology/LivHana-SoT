### 2. Export Statements

**Before:**

```javascript
module.exports = {
  ageVerificationSchema,
  loginSchema
};
```

**After:**

```javascript
export {
  ageVerificationSchema,
  loginSchema
};
```
