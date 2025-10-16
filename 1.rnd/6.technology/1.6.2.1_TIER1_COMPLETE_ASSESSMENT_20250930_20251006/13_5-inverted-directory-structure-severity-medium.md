### 5. **INVERTED DIRECTORY STRUCTURE** - SEVERITY: MEDIUM

**Issue:** Legacy folders inside SoT repo instead of parallel Trinity structure

**Current (WRONG):**

```
LivHana-SoT/
└── legacy/
    ├── kinetic/
    ├── potential/
    └── entropic/
```

**Intended (CORRECT):**

```
LivHana-Trinity-Local/
├── LivHana-SoT/        # Active production code
├── LivHana-Kinetic/    # Trinity member
├── LivHana-Potential/  # Trinity member
└── LivHana-Entropic/   # Trinity member
```

**Impact:** Confusion, duplicated code, violates Trinity Law
**Remediation:** Move legacy/ out to parent directory

---
