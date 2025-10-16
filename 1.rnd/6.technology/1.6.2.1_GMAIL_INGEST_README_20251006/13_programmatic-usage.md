### Programmatic Usage

```javascript
import { ingestAccount, ACCOUNTS } from './gmail_ingest.js';

// Ingest specific account
const account = ACCOUNTS[0]; // jesseniesen@gmail.com
const result = await ingestAccount(account, {
  fullSync: false,
  maxMessages: 1000
});

console.log(`Processed: ${result.processed}`);
console.log(`Skipped: ${result.skipped}`);
```
