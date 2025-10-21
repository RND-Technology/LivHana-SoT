#!/usr/bin/env bash
# RUNNABLE COMMAND - RPM Weekly Plan Execution
# Date: October 21, 2025
# Status: CRITICAL PATH - Revenue Recovery + Tech Implementation

set -euo pipefail

echo "========================================="
echo "RPM MASTER PLAN EXECUTION"
echo "Week: October 21-27, 2025"
echo "========================================="
echo

# Change to repo directory
cd "$(dirname "$0")"
REPO_ROOT="$(pwd)"

echo "Repository: $REPO_ROOT"
echo

# ============================================================================
# STEP 1: REVIEW MASTER PLAN (1 minute)
# ============================================================================

echo "📊 STEP 1: Review Master RPM Plan"
echo "-----------------------------------"
echo "Reading: RPM_MASTER_PLAN_OCT21-27_2025_AI_OPTIMIZED.md"
echo

if [[ -f "RPM_MASTER_PLAN_OCT21-27_2025_AI_OPTIMIZED.md" ]]; then
    echo "✅ Master plan found (940 lines, AI-optimized)"
    echo
    echo "KEY SECTIONS:"
    echo "  - Executive Dashboard (JSON metrics)"
    echo "  - Financial Targets: \$125K-175K revenue recovery"
    echo "  - Technical Implementation: 3/8 tasks complete"
    echo "  - Compliance: DSHS deadline Oct 26"
    echo "  - Team Roles: Jesse, Andrew, Christopher, Charlie"
    echo
    read -p "Press ENTER to continue to Priority 1 (Secrets Sync)..."
else
    echo "❌ Master plan not found!"
    exit 1
fi

# ============================================================================
# STEP 2: SECRETS SYNC (15 minutes) - UNBLOCKS EVERYTHING
# ============================================================================

echo
echo "🔴 STEP 2: Secrets Sync (CRITICAL BLOCKER)"
echo "-------------------------------------------"
echo "Missing secrets: 4"
echo "  1. DEEPSEEK_API_KEY"
echo "  2. BLUECHECK_API_KEY"
echo "  3. GITHUB_PERSONAL_ACCESS_TOKEN"
echo "  4. JWT_SECRET1 (+ 2 aliases)"
echo
echo "Impact: Unblocks Agent Builder + TRUTH Pipeline full execution"
echo "Timeline: 15 minutes (interactive prompts)"
echo

if [[ -f "scripts/add_missing_secrets.sh" ]]; then
    echo "✅ Secrets script found"
    echo
    read -p "Execute secrets sync script now? (y/N): " -n 1 -r
    echo
    if [[ $REPLY =~ ^[Yy]$ ]]; then
        bash scripts/add_missing_secrets.sh
        echo
        echo "✅ Secrets sync complete!"
        echo
    else
        echo "⏭️  Skipping secrets sync (you can run manually later)"
        echo "   Command: bash scripts/add_missing_secrets.sh"
    fi
else
    echo "❌ Secrets script not found at: scripts/add_missing_secrets.sh"
fi

# ============================================================================
# STEP 3: TRUTH PIPELINE TEST (30 minutes) - AFTER SECRETS
# ============================================================================

echo
echo "🟠 STEP 3: TRUTH Pipeline Test (after secrets)"
echo "-----------------------------------------------"
echo "Pipeline stages:"
echo "  1. Apify scrape (data collection)"
echo "  2. Perplexity verify (cross-reference)"
echo "  3. ChatGPT compress (semantic dedup)"
echo "  4. Claude truth (synthesis + guardrails)"
echo "  5. RPM emit (Result → Purpose → MAP)"
echo

if [[ -f "scripts/verify_pipeline_integrity.sh" ]]; then
    echo "✅ Pipeline validation script found"
    echo
    read -p "Test TRUTH Pipeline now? (y/N): " -n 1 -r
    echo
    if [[ $REPLY =~ ^[Yy]$ ]]; then
        echo "Running dry-run validation..."
        bash scripts/verify_pipeline_integrity.sh
        echo
        echo "✅ Pipeline integrity check complete!"
    else
        echo "⏭️  Skipping pipeline test"
        echo "   Command: bash scripts/verify_pipeline_integrity.sh"
    fi
else
    echo "❌ Pipeline validation script not found"
fi

# ============================================================================
# STEP 4: COMPLIANCE SERVICE DEPLOYMENT (10 minutes)
# ============================================================================

echo
echo "🟡 STEP 4: Compliance Service Deployment"
echo "-----------------------------------------"
echo "Service: REST API (AGE21 + NIST + Medical Claims)"
echo "Platform: Google Cloud Run"
echo "Endpoints:"
echo "  - /api/v1/verify-age"
echo "  - /api/v1/validate-cannabinoid"
echo "  - /api/v1/check-medical-claims"
echo

if [[ -d "backend/compliance-service" ]]; then
    echo "✅ Compliance service found"
    echo
    read -p "Deploy to Cloud Run now? (y/N): " -n 1 -r
    echo
    if [[ $REPLY =~ ^[Yy]$ ]]; then
        cd backend/compliance-service
        echo "Deploying to Google Cloud Run..."
        gcloud run deploy compliance-service \
            --source . \
            --region us-central1 \
            --project reggieanddrodispensary \
            --allow-unauthenticated \
            --memory 512Mi \
            --cpu 1 \
            --max-instances 10
        cd "$REPO_ROOT"
        echo
        echo "✅ Compliance service deployed!"
    else
        echo "⏭️  Skipping deployment"
        echo "   Command: cd backend/compliance-service && gcloud run deploy compliance-service --source ."
    fi
else
    echo "❌ Compliance service not found at: backend/compliance-service"
fi

# ============================================================================
# STEP 5: GIT STATUS & COMMIT RECOMMENDATIONS
# ============================================================================

echo
echo "📋 STEP 5: Git Status & Next Steps"
echo "-----------------------------------"
echo

# Show git status
if command -v git &> /dev/null; then
    MODIFIED_COUNT=$(git status --short | wc -l | tr -d ' ')
    echo "Modified/new files: $MODIFIED_COUNT"
    echo
    git status --short | head -20
    echo
    
    if [[ $MODIFIED_COUNT -gt 0 ]]; then
        echo "Recommended commit sequence:"
        echo "  1. Meeting analysis (5 files) - docs: meeting analysis Oct 2025"
        echo "  2. TRUTH Pipeline (7 files) - feat: implement TRUTH Pipeline"
        echo "  3. Compliance Service (9 files) - feat: compliance verification API"
        echo "  4. Secrets guide (3 files) - docs: secrets management"
        echo "  5. Documentation (3 files) - docs: implementation summary"
        echo
        echo "See: INTEGRATION_STATUS_2025-10-21.md for full commit commands"
    fi
fi

# ============================================================================
# SUMMARY
# ============================================================================

echo
echo "========================================="
echo "EXECUTION SUMMARY"
echo "========================================="
echo
echo "✅ Completed:"
echo "  - MCP Broker: OPERATIONAL"
echo "  - TRUTH Pipeline: IMPLEMENTED"
echo "  - Compliance Service: READY"
echo
echo "⏳ Blocked (requires manual action):"
echo "  - Secrets Sync: 4 API keys (15 min)"
echo "  - Agent Builder: 17-node workflow"
echo
echo "📊 Status:"
echo "  - Technical: 3/8 tasks complete (37.5%)"
echo "  - Revenue Target: \$125K-175K this week"
echo "  - DSHS Deadline: October 26, 2025"
echo
echo "🚀 Next Action:"
echo "  bash scripts/add_missing_secrets.sh"
echo
echo "========================================="
echo "DOCUMENTATION:"
echo "  - Master Plan: RPM_MASTER_PLAN_OCT21-27_2025_AI_OPTIMIZED.md"
echo "  - Integration: INTEGRATION_STATUS_2025-10-21.md"
echo "  - Next Steps: NEXT_STEPS.md"
echo "========================================="
echo

exit 0

