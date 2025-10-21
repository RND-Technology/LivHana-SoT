#!/bin/bash
echo "🚀 Voice Mode Boot Sequence Initiated..."
echo "Injecting guardrails, secrets, and refund logic..."

bash "$(dirname "$0")/guardrails_sync.sh"
bash "$(dirname "$0")/secrets_smoke_test.sh"
bash "$(dirname "$0")/veriff_refund_job.sh"

echo "✅ Voice Mode Ready for Agent Builder Session 1"
