#### Suite 4: Voice Mode E2E Tests

**File:** `tests/e2e/integration/voice-mode-e2e.spec.ts`

**Purpose:** Verify voice synthesis, reasoning integration, and real-time streaming

**Test Cases:**

```typescript
test.describe('Voice Mode - Complete User Experience', () => {

  test('Open voice mode and select voice', async ({ page }) => {
    // Setup: Load dashboard
    // Action: Click Voice Mode button
    // Assert: Modal opens
    // Assert: 4 voice options displayed (Rachel, Domi, Bella, Elli)
    // Action: Select "Rachel" voice
    // Assert: Voice settings saved to localStorage
  });

  test('Test voice synthesis with ElevenLabs', async ({ page }) => {
    // Setup: Voice mode open
    // Action: Click "Test Voice" button
    // Assert: Loading indicator appears
    // Assert: POST to /api/elevenlabs/synthesize with auth token
    // Assert: Audio blob returned
    // Assert: Audio plays in browser
    // Assert: "Speaking" status displayed
  });

  test('Submit reasoning job from voice panel', async ({ page }) => {
    // Setup: Voice mode open
    // Action: Enter prompt: "Summarize sales data"
    // Action: Click "Request Reasoning"
    // Assert: Status changes to "submitting" → "queued" → "progress"
    // Assert: Job ID displayed
    // Assert: SSE connection established
    // Assert: Partial results stream in
    // Assert: Final result displayed
    // Assert: Status changes to "completed"
  });

  test('Handle voice synthesis error gracefully', async ({ page, context }) => {
    // Setup: Mock ElevenLabs API error (403 or 500)
    // Action: Click "Test Voice"
    // Assert: Error message displayed
    // Assert: Voice service status = "down"
    // Assert: No audio plays
    // Assert: User can retry
  });

  test('Voice settings persist across sessions', async ({ page, context }) => {
    // Setup: Select Bella voice, adjust stability to 75%
    // Action: Close voice mode
    // Action: Refresh page
    // Action: Reopen voice mode
    // Assert: Bella still selected
    // Assert: Stability still at 75%
  });
});
```

---
