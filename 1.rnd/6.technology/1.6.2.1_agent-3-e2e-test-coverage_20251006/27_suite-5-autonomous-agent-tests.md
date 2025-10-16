#### Suite 5: Autonomous Agent Tests

**File:** `tests/e2e/integration/autonomous-agent.spec.ts`

**Purpose:** Verify autonomous agent task execution, approval, and learning

**Test Cases:**

```typescript
test.describe('Autonomous Agent - Full Lifecycle', () => {

  test('Execute task with approval required', async ({ page, request }) => {
    // Setup: Admin user with auth token
    // Action: POST /api/autonomous/execute
    // Payload: { task: "Analyze top 10 products", requireApproval: true }
    // Assert: Task created with status "pending_approval"
    // Assert: Task ID returned
    // Action: POST /api/autonomous/approve/:taskId
    // Assert: Status changes to "executing"
    // Assert: Results returned when complete
  });

  test('Execute task without approval (auto-execute)', async ({ page, request }) => {
    // Setup: Admin user
    // Action: POST /api/autonomous/execute
    // Payload: { task: "Get dashboard metrics", requireApproval: false }
    // Assert: Task immediately executes
    // Assert: Status "executing" → "completed"
    // Assert: Results available via GET /api/autonomous/tasks/:taskId
  });

  test('Cancel in-progress task', async ({ page, request }) => {
    // Setup: Task executing
    // Action: DELETE /api/autonomous/tasks/:taskId
    // Assert: Task status changes to "cancelled"
    // Assert: Execution stops
    // Assert: Partial results preserved
  });

  test('Rollback completed task', async ({ page, request }) => {
    // Setup: Task completed with side effects
    // Action: POST /api/autonomous/rollback/:taskId
    // Payload: { reason: "Incorrect data" }
    // Assert: Rollback executed
    // Assert: Changes reverted
    // Assert: Rollback logged in learnings
  });

  test('Real-time SSE streaming of task progress', async ({ page }) => {
    // Setup: Load Autonomous Dashboard
    // Action: Execute long-running task
    // Action: Subscribe to /api/autonomous/stream/:taskId
    // Assert: SSE connection established
    // Assert: Progress events received
    // Assert: UI updates in real-time
    // Assert: Completion event received
  });

  test('Agent capabilities discovery', async ({ page, request }) => {
    // Action: GET /api/autonomous/capabilities
    // Assert: Returns list of available actions
    // Assert: Each action has name, description, parameters
    // Assert: At least 10 capabilities available
  });

  test('Agent learnings persistence', async ({ page, request }) => {
    // Setup: Execute task that generates learning
    // Action: GET /api/autonomous/learnings
    // Assert: Returns learnings array
    // Assert: Learnings include success/failure patterns
    // Assert: Learnings have timestamps and task references
  });
});
```

---
