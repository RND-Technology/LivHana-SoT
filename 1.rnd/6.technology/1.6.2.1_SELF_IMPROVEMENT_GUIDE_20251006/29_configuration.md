## Configuration

Edit configuration in `self-improvement-loop.js`:

```javascript
this.config = {
  minInteractionsForLearning: 100,        // Min interactions before learning
  minErrorsForBugReport: 5,               // Min error frequency for bug report
  minFeatureRequestsForProposal: 3,       // Min requests for feature proposal
  performanceThresholdMs: 2000,           // Response time threshold
  analysisInterval: 24 * 60 * 60 * 1000, // Analysis interval (24h)
  approvalRequired: true,                 // Require approval for changes
  maxAutoFixesPerDay: 5,                  // Max auto-fixes without approval
  testRequired: true,                     // Require tests for all changes
};

this.safetyChecks = {
  requireApproval: true,                  // Require approval
  requireTests: true,                     // Require tests
  requireReview: true,                    // Require review
  allowProductionDeploy: false,           // Allow prod deployment
  maxChangesPerProposal: 10,              // Max file changes per proposal
  maxLinesPerChange: 500,                 // Max lines changed per file
};
```
