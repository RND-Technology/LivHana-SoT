### GitHub Actions Workflow

**File:** `.github/workflows/e2e-tests.yml`

```yaml
name: E2E Tests

on:
  push:
    branches: [main, develop]
  pull_request:
    branches: [main]

jobs:
  e2e-tests:
    runs-on: ubuntu-latest
    timeout-minutes: 30

    services:
      postgres:
        image: postgres:15
        env:
          POSTGRES_PASSWORD: test
        options: >-
          --health-cmd pg_isready
          --health-interval 10s
          --health-timeout 5s
          --health-retries 5

    steps:
      - uses: actions/checkout@v3

      - name: Setup Node.js
        uses: actions/setup-node@v3
        with:
          node-version: '18'
          cache: 'npm'

      - name: Install dependencies
        run: |
          cd backend/integration-service && npm ci
          cd ../reasoning-gateway && npm ci
          cd ../../frontend/vibe-cockpit && npm ci

      - name: Setup test environment
        run: |
          cp .env.test .env
          export GCP_PROJECT_ID=test-project
          export GOOGLE_APPLICATION_CREDENTIALS=./test-credentials.json

      - name: Start backend services
        run: |
          cd backend/integration-service && npm start &
          cd backend/reasoning-gateway && npm start &
          sleep 10  # Wait for services to start

      - name: Install Playwright
        run: cd frontend/vibe-cockpit && npx playwright install --with-deps

      - name: Run E2E tests
        run: cd frontend/vibe-cockpit && npx playwright test
        env:
          CI: true

      - name: Upload test results
        if: always()
        uses: actions/upload-artifact@v3
        with:
          name: playwright-report
          path: frontend/vibe-cockpit/playwright-report/

      - name: Upload failure screenshots
        if: failure()
        uses: actions/upload-artifact@v3
        with:
          name: failure-screenshots
          path: frontend/vibe-cockpit/test-results/

      - name: Notify on failure
        if: failure()
        uses: 8398a7/action-slack@v3
        with:
          status: ${{ job.status }}
          text: 'E2E tests failed! Check artifacts for details.'
          webhook_url: ${{ secrets.SLACK_WEBHOOK }}
```
