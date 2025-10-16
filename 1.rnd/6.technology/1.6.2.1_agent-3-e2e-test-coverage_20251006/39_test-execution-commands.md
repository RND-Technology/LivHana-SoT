### Test Execution Commands

```json
// package.json scripts
{
  "scripts": {
    "test:e2e:smoke": "playwright test tests/e2e/smoke --workers=1",
    "test:e2e:integration": "playwright test tests/e2e/integration",
    "test:e2e:errors": "playwright test tests/e2e/error-scenarios",
    "test:e2e:performance": "playwright test tests/e2e/performance",
    "test:e2e:all": "playwright test",
    "test:e2e:debug": "playwright test --debug",
    "test:e2e:ui": "playwright test --ui",
    "test:e2e:report": "playwright show-report",
  }
}
```

---
