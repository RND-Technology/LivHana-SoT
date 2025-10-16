### Cron Schedule

```bash
# Daily at 2 AM - Analyze yesterday's data
0 2 * * * npm run improvement:daily

# Monday at 6 AM - Generate proposals
0 6 * * 1 npm run improvement:weekly

# 1st of month at 8 AM - Refactoring report
0 8 1 * * npm run improvement:monthly

# Every hour - Auto-execute approved
0 * * * * npm run improvement:auto
```
