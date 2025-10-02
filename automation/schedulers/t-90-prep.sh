#!/bin/bash
# T-90 Preparation Scheduler
# Runs 90 minutes before High Noon (10:30 UTC daily)

set -e

echo "🚀 T-90 Preparation Phase - $(date)"

# Environment setup
export COMPLIANCE_LEVEL="21+"
export SOVEREIGN_TRINITY="LivHana-SoT,LivHana-Kinetic,LivHana-Potential"

# 1. Validate Sovereign Context
echo "📋 Validating Sovereign Context..."
if [ ! -f "highnoon/context_manifest.yaml" ]; then
    echo "❌ Context manifest not found. Creating..."
    ./highnoon/create_context_manifest.sh
fi

# 2. Check Trinity Repository Status
echo "🔍 Checking Trinity Repository Status..."
./scripts/check_trinity_status.sh

# 3. Pre-flight Compliance Check
echo "🛡️ Running Pre-flight Compliance Check..."
./scripts/validate_compliance.sh

# 4. Prepare Data Layer
echo "📊 Preparing Data Layer..."
./scripts/prep_ingestion_data.sh

# 5. Validate Service Readiness
echo "✅ Validating Service Readiness..."
./scripts/check_service_readiness.sh

# 6. Generate T-90 Report
echo "📝 Generating T-90 Report..."
cat > t90_report_$(date +%Y%m%d_%H%M%S).md << EOF
# T-90 Preparation Report
Generated: $(date -u +%Y-%m-%dT%H:%M:%SZ)

## Sovereign Status
- ✅ Context manifest: Present
- ✅ Trinity repositories: All accessible
- ✅ Compliance gates: Validated
- ✅ Data layer: Prepared
- ✅ Services: Ready

## Next Steps
- High Noon sync scheduled for $(date -u +%H:%M:%S) UTC
- All systems prepared for deployment
- 21+ compliance maintained
EOF

echo "✅ T-90 Preparation Complete!"

# Last updated: 2025-10-02
