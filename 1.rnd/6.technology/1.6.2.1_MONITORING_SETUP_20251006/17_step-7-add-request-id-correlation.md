## Step 7: Add Request ID Correlation

Update logging middleware:

```javascript
import { withRequestId, requestLogger, errorLogger } from '../../common/logging';

// Add request ID middleware FIRST
app.use(withRequestId(logger));

// Then other middleware
app.use(requestLogger(logger));

// ... routes ...

// Error logger at the end
app.use(errorLogger(logger));
```
