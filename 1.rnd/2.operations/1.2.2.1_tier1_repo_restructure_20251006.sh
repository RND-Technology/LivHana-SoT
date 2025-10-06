#!/bin/bash
# Optimized: 2025-10-02
# RPM: 1.6.2.3.automation-scripts-optimization
# Session: Elephant Strategy Batch 1

# Tier-1 Repository Restructuring Script
# Transforms chaos into perfect architecture


# Colors
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
MAGENTA='\033[0;35m'
CYAN='\033[0;36m'
NC='\033[0m'

WORKSPACE_ROOT="/Users/jesseniesen/LivHana-Trinity-Local/LivHana-SoT"
cd "$WORKSPACE_ROOT" || exit

echo "═══════════════════════════════════════════════════════════════"
echo "       🚀 TIER-1 REPOSITORY RESTRUCTURING INITIATED"
echo "═══════════════════════════════════════════════════════════════"
echo ""

# Create proper directory structure
echo -e "${CYAN}📁 Creating Tier-1 Directory Structure...${NC}"
mkdir -p backend/cannabis-service/{src,tests,docs}
mkdir -p backend/payment-service/{src,tests,docs}
mkdir -p backend/integration-service/{src,tests,docs}
mkdir -p backend/shared/{utils,middleware,models}
mkdir -p docs/{architecture,api,deployment,testing}
mkdir -p tests/{unit,integration,e2e}
mkdir -p .github/workflows
mkdir -p scripts/{dev,prod,migration}

# Move scattered Python files to proper services
echo -e "${YELLOW}🔄 Organizing Cannabis Service Files...${NC}"
if [[ -f "cannabis_compliance.py" ]]; then
    mv cannabis_compliance.py backend/cannabis-service/src/compliance.py
    echo -e "  ${GREEN}✓${NC} Moved cannabis_compliance.py → backend/cannabis-service/src/"
fi

if [[ -f "production_cannabis_api.py" ]]; then
    mv production_cannabis_api.py backend/cannabis-service/src/api.py
    echo -e "  ${GREEN}✓${NC} Moved production_cannabis_api.py → backend/cannabis-service/src/"
fi

if [[ -f "production_ready_cannabis_api.py" ]]; then
    # This looks like a duplicate, archive it
    mkdir -p .archive/duplicates
    mv production_ready_cannabis_api.py .archive/duplicates/
    echo -e "  ${YELLOW}⚠${NC} Archived duplicate production_ready_cannabis_api.py"
fi

# Move payment files
echo -e "${YELLOW}🔄 Organizing Payment Service Files...${NC}"
if [[ -f "payment_processor.py" ]]; then
    mv payment_processor.py backend/payment-service/src/processor.py
    echo -e "  ${GREEN}✓${NC} Moved payment_processor.py → backend/payment-service/src/"
fi

if [[ -f "cannabis_payment_service.js" ]]; then
    mv cannabis_payment_service.js backend/payment-service/src/cannabis_payment.js
    echo -e "  ${GREEN}✓${NC} Moved cannabis_payment_service.js → backend/payment-service/src/"
fi

if [[ -f "secure_ecommerce.py" ]]; then
    mv secure_ecommerce.py backend/payment-service/src/ecommerce.py
    echo -e "  ${GREEN}✓${NC} Moved secure_ecommerce.py → backend/payment-service/src/"
fi

# Move integration files
echo -e "${YELLOW}🔄 Organizing Integration Service Files...${NC}"
if [[ -f "lightspeed_integration.py" ]]; then
    mv lightspeed_integration.py backend/integration-service/src/lightspeed.py
    echo -e "  ${GREEN}✓${NC} Moved lightspeed_integration.py → backend/integration-service/src/"
fi

if [[ -f "business_api_integration.js" ]]; then
    mv business_api_integration.js backend/integration-service/src/business_api.js
    echo -e "  ${GREEN}✓${NC} Moved business_api_integration.js → backend/integration-service/src/"
fi

# Move database to shared
if [[ -f "database.py" ]]; then
    mv database.py backend/shared/models/database.py
    echo -e "  ${GREEN}✓${NC} Moved database.py → backend/shared/models/"
fi

# Move deployment scripts
echo -e "${YELLOW}🔄 Organizing Scripts...${NC}"
if [[ -f "business_deployment.sh" ]]; then
    mv business_deployment.sh scripts/prod/deploy_business.sh
    echo -e "  ${GREEN}✓${NC} Moved business_deployment.sh → scripts/prod/"
fi

if [[ -f "security_fix.sh" ]]; then
    mv security_fix.sh scripts/migration/security_fix.sh
    echo -e "  ${GREEN}✓${NC} Moved security_fix.sh → scripts/migration/"
fi

# Organize documentation
echo -e "${CYAN}📚 Organizing Documentation...${NC}"
if [[ -f "PRD_P1_Cannabis_Payment_Processing.md" ]]; then
    mv PRD_P1_Cannabis_Payment_Processing.md docs/architecture/PRD_Cannabis_Payment.md
    echo -e "  ${GREEN}✓${NC} Moved PRD to docs/architecture/"
fi

for adr in ADR-*.md ULTIMATE_ADR*.md; do
    if [[ -f "$adr" ]]; then
        mv "$adr" docs/architecture/
        echo -e "  ${GREEN}✓${NC} Moved $adr → docs/architecture/"
    fi
done

if [[ -f "SYSTEM_PROMPT.md" ]] || [[ -f "ULTIMATE_SYSTEM_PROMPT_Constitutional_Charter.md" ]]; then
    mkdir -p docs/governance
    mv ./*SYSTEM_PROMPT*.md docs/governance/ 2>/dev/null || true
    echo -e "  ${GREEN}✓${NC} Moved system prompts → docs/governance/"
fi

# Create service package.json files
echo -e "${BLUE}📦 Creating Service Configurations...${NC}"

# Cannabis Service package.json
cat > backend/cannabis-service/package.json << 'EOF'
{
  "name": "@livhana/cannabis-service",
  "version": "1.0.0",
  "description": "Cannabis compliance and regulatory service",
  "main": "src/index.js",
  "scripts": {
    "start": "node src/index.js",
    "dev": "nodemon src/index.js",
    "test": "jest",
    "lint": "eslint src/"
  },
  "dependencies": {
    "express": "^4.18.2",
    "joi": "^17.9.2",
    "winston": "^3.10.0"
  },
  "devDependencies": {
    "jest": "^29.6.2",
    "nodemon": "^3.0.1",
    "eslint": "^8.45.0"
  }
}
EOF
echo -e "  ${GREEN}✓${NC} Created cannabis-service/package.json"

# Payment Service package.json
cat > backend/payment-service/package.json << 'EOF'
{
  "name": "@livhana/payment-service",
  "version": "1.0.0",
  "description": "Payment processing service with cannabis compliance",
  "main": "src/index.js",
  "scripts": {
    "start": "node src/index.js",
    "dev": "nodemon src/index.js",
    "test": "jest",
    "lint": "eslint src/"
  },
  "dependencies": {
    "express": "^4.18.2",
    "stripe": "^12.0.0",
    "square": "^29.0.0",
    "winston": "^3.10.0"
  },
  "devDependencies": {
    "jest": "^29.6.2",
    "nodemon": "^3.0.1",
    "eslint": "^8.45.0"
  }
}
EOF
echo -e "  ${GREEN}✓${NC} Created payment-service/package.json"

# Create README for each service
echo -e "${MAGENTA}📝 Creating Service Documentation...${NC}"

cat > backend/cannabis-service/README.md << 'EOF'
# Cannabis Compliance Service

## Overview
Handles all cannabis-related compliance, age verification, and regulatory requirements.

## API Endpoints
- `POST /api/verify/age` - Age gate verification
- `GET /api/compliance/status` - Compliance status check
- `POST /api/compliance/validate` - Validate transaction compliance

## Environment Variables
- `COMPLIANCE_API_KEY` - API key for compliance checks
- `MIN_AGE` - Minimum age requirement (default: 21)

## Testing
```bash
npm test
```
EOF
echo -e "  ${GREEN}✓${NC} Created cannabis-service/README.md"

# Create root .gitignore updates
echo -e "${CYAN}🔧 Updating .gitignore...${NC}"
cat >> .gitignore << 'EOF'

# Tier-1 Additions
.archive/
*.log
*.tmp
.DS_Store
coverage/
EOF
echo -e "  ${GREEN}✓${NC} Updated .gitignore"

# Create docker-compose for all services
echo -e "${BLUE}🐳 Creating Unified Docker Compose...${NC}"
cat > docker-compose.yml << 'EOF'
version: '3.8'

services:
  cannabis-service:
    build: ./backend/cannabis-service
    ports:
      - "3003:3000"
    environment:
      - NODE_ENV=development
      - REDIS_URL=redis://redis:6379
    depends_on:
      - redis

  payment-service:
    build: ./backend/payment-service
    ports:
      - "3004:3000"
    environment:
      - NODE_ENV=development
      - REDIS_URL=redis://redis:6379
    depends_on:
      - redis

  voice-service:
    build: ./backend/voice-service
    ports:
      - "3001:3000"
    environment:
      - NODE_ENV=development
      - REDIS_URL=redis://redis:6379
    depends_on:
      - redis

  reasoning-gateway:
    build: ./backend/reasoning-gateway
    ports:
      - "3002:3000"
    environment:
      - NODE_ENV=development
      - REDIS_URL=redis://redis:6379
    depends_on:
      - redis

  redis:
    image: redis:7-alpine
    ports:
      - "6379:6379"
    volumes:
      - redis_data:/data

volumes:
  redis_data:
EOF
echo -e "  ${GREEN}✓${NC} Created unified docker-compose.yml"

# Summary
echo ""
echo "═══════════════════════════════════════════════════════════════"
echo -e "${GREEN}              ✅ TIER-1 RESTRUCTURING COMPLETE${NC}"
echo "═══════════════════════════════════════════════════════════════"
echo ""
echo "📊 Changes Made:"
echo "  • Organized scattered files into proper services"
echo "  • Created cannabis-service, payment-service, integration-service"
echo "  • Moved documentation to docs/ hierarchy"
echo "  • Created service package.json configurations"
echo "  • Added unified docker-compose.yml"
echo "  • Archived duplicate files"
echo ""
echo -e "${YELLOW}⚠️  Next Steps:${NC}"
echo "  1. Review file movements with: git status"
echo "  2. Install dependencies: cd backend/<service> && npm install"
echo "  3. Run tests: npm test"
echo "  4. Commit changes: git add -A && git commit -m 'feat: Tier-1 repository restructuring'"
echo ""

# Last updated: 2025-10-02

# Last optimized: 2025-10-02
