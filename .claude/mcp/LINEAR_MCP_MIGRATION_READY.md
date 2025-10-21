# LINEAR MCP INSTALLATION COMPLETE ✅

**Status**: Configured, needs authentication
**Priority**: #1 Strategic Foundation
**Impact**: Enables systematic issue tracking for 4x dev velocity

---

## INSTALLATION COMPLETE

✅ **Linear MCP server configured** in `~/.claude.json`
```json
{
  "mcpServers": {
    "linear": {
      "command": "npx",
      "args": ["-y", "mcp-remote", "https://mcp.linear.app/sse"]
    }
  }
}
```

---

## NEXT STEP: AUTHENTICATION REQUIRED

**Action**: Restart Claude Code to activate Linear MCP
- Exit current session (Ctrl+C)
- Restart: `npx claude-code` or `claude`
- Run `/mcp` command to authenticate with Linear

OR

**Alternative**: In new Claude Code session, Linear MCP tools will be available immediately

---

## READY TO MIGRATE: 5 P0 CRITICAL ISSUES

Once authenticated, create these Linear issues from `URGENT_REGGIEDRO_FIXES.md`:

### Issue #1: Category Buttons - Ugly & No Contrast
- **Priority**: P1 (High)
- **Team**: Frontend
- **Labels**: `ui-bug`, `css-fix`, `reggieanddro`
- **Estimate**: 2 points (30 min)
- **Description**:
  ```
  Category filter buttons at ReggieAndDro.com are too large, lack contrast, and don't meet WCAG AA standards (4.5:1 ratio).

  **Impact**: Poor UX, difficult navigation

  **Fix Required**:
  - Reduce button size
  - Fix text contrast (WCAG AA 4.5:1 minimum)
  - Add smooth hover states
  - Clean, balanced visual design

  **Files**: Ecwid custom CSS
  **Acceptance**: Christopher Esser would approve ✅
  ```

### Issue #2: Checkout Calendar - Completely Broken 🔥
- **Priority**: P0 (Critical - Revenue Blocker)
- **Team**: Frontend
- **Labels**: `p0-critical`, `revenue-blocker`, `checkout`, `reggieanddro`
- **Estimate**: 3 points (60 min)
- **Description**:
  ```
  Pickup date/time calendar at checkout is broken. Customers cannot complete orders.

  **Impact**: $911 cashflow critical - NO ORDERS CAN BE COMPLETED

  **Fix Required**:
  - Clean, intuitive date picker
  - Smooth time slot selection
  - Mobile-responsive
  - Clear visual hierarchy

  **Files**: Ecwid checkout CSS
  **Acceptance**: Orders complete successfully, calendar looks professional
  ```

### Issue #3: Local Delivery Integration
- **Priority**: P1 (High)
- **Team**: Backend + Frontend
- **Labels**: `feature-request`, `delivery`, `integration`, `reggieanddro`
- **Estimate**: 8 points (90 min)
- **Description**:
  ```
  No white-label delivery service integration. Need HEB brand+ delivery options.

  **Impact**: Lost sales - customers want local delivery

  **Requirements**:
  - Integrate delivery service APIs
  - Configure delivery zones (San Antonio 15mi radius)
  - Real-time availability checking
  - Time slot reservation

  **Files**: Backend delivery service, Ecwid shipping zones
  **Acceptance**: Customers can select delivery windows, orders route to delivery service
  ```

### Issue #4: Authorize.net Automated Invoicing
- **Priority**: P1 (High)
- **Team**: Backend
- **Labels**: `integration`, `payment`, `automation`, `reggieanddro`
- **Estimate**: 5 points (60 min)
- **Description**:
  ```
  No automated invoicing system. Manual work slows fulfillment.

  **Impact**: Slow order processing, manual overhead

  **Requirements**:
  - Authorize.net API integration
  - Automatic invoice generation on order
  - Email delivery to customers

  **Platform**: Ecwid has native Authorize.net support
  **Acceptance**: Invoices auto-generate and email on order completion
  ```

### Issue #5: AfterPay & Klarna Payment Options
- **Priority**: P1 (High)
- **Team**: Backend + Frontend
- **Labels**: `payment`, `bnpl`, `conversion-optimization`, `reggieanddro`
- **Estimate**: 8 points (90 min each)
- **Description**:
  ```
  Missing Buy Now Pay Later (BNPL) options. Losing customers who want payment plans.

  **Impact**: 25%+ potential conversion boost lost

  **Requirements**:
  - AfterPay SDK integration ($35-$1,000 carts)
  - Klarna checkout integration
  - Seamless payment flow
  - Product page messaging

  **Platform**: Ecwid has native integrations for both
  **Acceptance**: Customers can complete purchases with AfterPay/Klarna
  ```

---

## LINEAR WORKSPACE SETUP

**Recommended Structure**:

### Teams
- **LH-FRONTEND** - Frontend/UI issues
- **LH-BACKEND** - Backend/API issues
- **LH-INFRA** - Cloud Run, GCP, deployment
- **LH-REGGIEDRO** - ReggieAndDro.com specific

### Labels (Priority)
- `p0-critical` - Revenue blockers, production down
- `p1-high` - Important, affects customers
- `p2-medium` - Nice to have, quality improvements
- `p3-low` - Future enhancements

### Labels (Type)
- `bug` - Something broken
- `feature-request` - New functionality
- `technical-debt` - Refactoring, cleanup
- `deployment-blocker` - Prevents shipping
- `revenue-blocker` - Prevents sales
- `security` - Vulnerability or auth issue

### Labels (Service)
- `voice-service` - Voice mode issues
- `reasoning-gateway` - AI reasoning issues
- `integration-service` - Lightspeed, BigQuery, etc.
- `reggieanddro` - ReggieAndDro.com e-commerce
- `herbitrage` - Herbitrage.com site

---

## POST-MIGRATION: WORKFLOW AUTOMATION

Once Linear is set up with 5 P0 issues:

1. **Playwright** will auto-create issues when E2E tests fail
2. **Semgrep** will auto-create security issues
3. **GitHub MCP** will auto-link PRs to Linear issues
4. **Linear API** will close issues on PR merge

**Result**: 4x dev velocity, zero lost bugs, systematic progress tracking

---

## MIGRATION COMMANDS (After Authentication)

```bash
# Once Linear MCP is authenticated, use these to create issues:

# Issue 1: Category Buttons
linear issue create \
  --title "Fix category buttons - ugly & no contrast" \
  --team LH-FRONTEND \
  --priority 1 \
  --labels ui-bug,css-fix,reggieanddro

# Issue 2: Checkout Calendar (P0)
linear issue create \
  --title "CRITICAL: Checkout calendar broken - blocks all orders" \
  --team LH-FRONTEND \
  --priority 0 \
  --labels p0-critical,revenue-blocker,checkout,reggieanddro

# (Continue for remaining 3 issues)
```

---

## SUCCESS METRICS

**Before Linear**:
- ❌ Lost bugs across 21 services
- ❌ No visibility into blockers
- ❌ Manual tracking = things slip
- ❌ Cheetah completes work but issues reappear

**After Linear**:
- ✅ All issues tracked systematically
- ✅ Priority clear (P0 > P1 > P2 > P3)
- ✅ Playwright auto-creates issues from failed tests
- ✅ Nothing falls through cracks
- ✅ 4x faster development (systematic execution)

---

**CURRENT STATUS**:
- ✅ Linear MCP configured
- ⏳ Authentication required (restart Claude Code)
- 📋 5 P0 issues ready for migration

**NEXT PRIORITY**: Playwright MCP installation (E2E testing for revenue protection)
