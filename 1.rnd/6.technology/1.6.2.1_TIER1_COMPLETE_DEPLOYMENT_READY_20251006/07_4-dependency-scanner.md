### 4. Dependency Scanner

✅ Automated unused dependency detector
✅ Scans all services
✅ Auto-remove option
✅ "Best code is no code" principle

**Files:**

- `automation/validators/dependency_scanner.js` - Dependency cleaner

**Usage:**

```bash
# Scan for unused deps
node automation/validators/dependency_scanner.js

# Auto-remove unused
node automation/validators/dependency_scanner.js --remove
```
