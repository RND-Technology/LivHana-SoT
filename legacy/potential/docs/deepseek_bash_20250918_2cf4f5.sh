#!/bin/bash
set -e # Exit on any error

echo "🚀 Liv Hana AI - E2E One-Shot Bootstrap"
echo "========================================"

# ---------------- 
# 1. ENV VALIDATION
# ----------------
echo "[1/6] Validating environment and secrets..."
if [ ! -f .env ]; then
    echo "ERROR: Critical .env file not found. Please create it from .env.example before running this script."
    exit 1
fi

# Check for essential credentials in .env
if ! grep -q "SQUARE_ACCESS_TOKEN=" .env; then
    echo "WARNING: SQUARE_ACCESS_TOKEN not found in .env. Square integrations will fail."
fi
if ! grep -q "OPENAI_API_KEY=" .env; then
    echo "WARNING: OPENAI_API_KEY not found in .env. OpenAI integrations will fail."
fi

# ----------------
# 2. CLEAN SLATE
# ----------------
echo "[2/6] Ensuring a clean build slate..."
docker-compose down --volumes --remove-orphans 2>/dev/null || true
find . -name "__pycache__" -type d -exec rm -rf {} + 2>/dev/null || true
find . -name "*.pyc" -delete 2>/dev/null || true

# ----------------
# 3. BUILD MCP SERVICES
# ----------------
echo "[3/6] Building MCP Core and Deputy services..."
docker-compose build mcp-core mcp-deputy
echo "✅ Build complete."

# ----------------
# 4. BOOTSTRAP MEMORY & ADRs
# ----------------
echo "[4/6] Bootstrapping AI Memory and ADRs..."
# This script should commit the initial ADRs and memory index to Git.
./scripts/setup_memory.sh

# ----------------
# 5. DEPLOY INFRASTRUCTURE
# ----------------
echo "[5/6] Deploying Cloud Infrastructure (Terraform)..."
cd mcp/deploy/terraform
terraform init -upgrade
terraform plan -out=tfplan
terraform apply -auto-approve tfplan
cd ../../..
echo "✅ Cloud infrastructure deployed."

# ----------------
# 6. LAUNCH THE SYSTEM
# ----------------
echo "[6/6] Launching Liv Hana AI System..."
docker-compose up -d mcp-core mcp-deputy

echo "========================================"
echo "✅ BOOTSTRAP COMPLETE"
echo "========================================"
echo "Services are starting..."
echo "- MCP Core: http://localhost:8000"
echo "- MCP Deputy: http://localhost:8001"
echo "- Ollama (Host): http://localhost:11434"
echo ""
echo "Run 'docker-compose logs -f' to monitor startup."
echo "Run './scripts/test_integrations.sh' to validate connections."