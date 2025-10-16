### Sync Scheduler Performance

**File**: `/backend/integration-service/src/square-sync-scheduler.js`

**CRITICAL ISSUE**: Synchronous execSync (lines 17-21)

```javascript
const output = execSync('node scripts/sync-square-to-bigquery.js', {
  cwd: __dirname + '/..',
  encoding: 'utf8',
  timeout: 300000 // 5 min timeout - BLOCKS EVERYTHING
});
```

**Problem**: Blocks Node.js event loop for up to 5 minutes

**Fix**: Convert to async spawn

```javascript
import { spawn } from 'child_process';

function startSquareSyncScheduler() {
  cron.schedule(SYNC_SCHEDULE, () => {
    const child = spawn('node', ['scripts/sync-square-to-bigquery.js'], {
      cwd: path.join(__dirname, '..'),
      detached: true,
      stdio: 'ignore'
    });
    child.unref(); // Don't block parent process
  });
}
```

---
