### Issue 2: Missing ageVerificationSchema Export

**Error:** `SyntaxError: The requested module does not provide an export named 'ageVerificationSchema'`
**Root Cause:** validation/schemas.js used CommonJS
**Solution:** Converted to ES6 export syntax
**Status:** ✅ RESOLVED
