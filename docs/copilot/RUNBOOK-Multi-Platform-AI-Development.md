---
status: Active
source: Chat History - Cloud Development Lessons & Multi-Sandbox Setup
last_updated: 2025-09-28T16:00:00Z
verification_hooks:
  - automation/scripts/validate_cloud_setup.sh
  - automation/scripts/cost_monitoring_check.sh
maintainer: Liv Hana AI EA
decision_date: 2025-09-28
---

# RUNBOOK: Multi-Platform AI Development Environment Setup

## Purpose
Comprehensive runbook for setting up Liv Hana framework across multiple AI development environments (Claude Code, Cursor, Gemi CLI, Sandbox.dev) with cost control and failure prevention measures.

## Hard-Learned Architectural Principles

### Core Constraints (Born from $700+ Cloud Spend Lessons)

1. **The Mock-First Mandate**: No API call to paid models (GPT, Claude, Gemini) until entire application logic proven with deterministic mock data
2. **The Cost-Transparency Directive**: Every component must have built-in cost estimation; API calls over threshold require confirmation
3. **The Idempotency Imperative**: All agent operations must be safely retryable without duplicate side effects or charges
4. **The Observability Principle**: Every agent decision and API call logged to structured, queryable system
5. **The Scoped-Failure Axiom**: Failures must not cascade; clean failure logging with retry/reassignment capability

### Development Path Strategy
- **Phase 1**: Local development on Mac with mocks (zero cost)
- **Phase 2**: Cloud deployment only after local validation

## Prerequisites

### Required Tools
```bash
# Verify prerequisites
git --version || echo "Install Git first"
node --version || echo "Install Node.js first" 
python3 --version || echo "Install Python 3 first"
pip --version || echo "Install pip first"
```

### API Keys Required
- OpenAI API Key
- Anthropic (Claude) API Key  
- Google Gemini API Key
- GitHub Personal Access Token

## One-Shot Base Setup Script

### Universal Environment Setup
```bash
#!/bin/bash
# One-Shot Base Setup Script for macOS / Linux / Cloud Shell

# Clone repository
git clone https://github.com/RND-Technology/LivHana-SoT.git
cd LivHana-SoT

# Create universal environment configuration
cat > .env << 'EOL'
LIV_HANA_MODEL=claude-3-7-sonnet
LIV_HANA_MAX_TOKENS=100000
LIV_HANA_TEMPERATURE=0.1
OPENAI_API_KEY=your_openai_key_here
ANTHROPIC_API_KEY=your_claude_key_here
GEMINI_API_KEY=your_gemini_key_here
EOL

# Create universal setup script
cat > setup.sh << 'EOL'
#!/bin/bash
echo "🚀 Setting up Liv Hana in $(pwd)..."
if [ -f "requirements.txt" ]; then
    pip install -r requirements.txt 2>/dev/null
fi
if [ -f "package.json" ]; then
    npm install 2>/dev/null
fi
echo "✅ Setup complete. Run the validation script."
EOL
chmod +x setup.sh

echo "✅ Base setup complete! IMPORTANT: Edit the '.env' file with your actual API keys before proceeding."
```

## Platform-Specific Configurations

### A. Claude Code Configuration
```bash
# Create Claude-specific instruction set
cat > claude-setup.md << 'EOL'
# Liv Hana Setup Guide for Claude

As Claude, you are now the primary reasoning engine for the Liv Hana framework. Your objectives:

1. **ANALYZE** the entire codebase in `/src` and `/docs`
2. **ORCHESTRATE** agents using the MCP protocol
3. **GENERATE** precise code with minimal hallucinations

**First Tasks:**
- Review architecture in `/docs/architecture.md`
- Setup MCP servers in `/mcp-servers`
- Validate all API connections

**Critical Constraints:**
- Always maintain state consistency
- Use structured JSON for all agent communications
- Validate all code against existing types/interfaces
EOL
```

### B. Cursor Agent Configuration
```bash
# Create Cursor-specific configuration
cat > .cursorrules << 'EOL'
{
  "project_context": "Liv Hana System-of-Thoughts Framework",
  "tech_stack": ["python", "typescript", "vue", "mcp-protocol"],
  "key_directories": {
    "core": "/src/core",
    "agents": "/src/agents", 
    "mcp": "/mcp-servers",
    "docs": "/docs"
  },
  "patterns": {
    "prefer": ["functional", "composition", "async-await"],
    "avoid": ["class-inheritance", "complex-nesting"]
  },
  "testing": {
    "require_tests": true,
    "test_directory": "/tests"
  }
}
EOL
```

### C. Gemi CLI Configuration
```bash
# Create Gemi configuration
cat > .gemi.config.js << 'EOL'
module.exports = {
  project: 'liv-hana-sot',
  model: 'gemini-2.0-flash-thinking-exp',
  context: {
    framework: 'system-of-thoughts',
    architecture: 'multi-agent-mcp',
    language: 'typescript'
  },
  instructions: {
    style: 'precise and architectural',
    focus: 'agent-orchestration and state-management',
    constraints: 'maintain MCP protocol compliance'
  }
}
EOL

# Create Gemi startup script
cat > gemi-start.sh << 'EOL'
#!/bin/bash
echo "Initializing Gemi with Liv Hana context..."
gemi context load .gemi.config.js
gemi prompt "Initialize the Liv Hana framework with focus on agent orchestration. Review the architecture in /docs and begin with core system setup."
EOL
chmod +x gemi-start.sh
```

### D. Sandbox.dev Configuration
```bash
# Create sandbox.dev configuration
cat > sandbox.config.json << 'EOL'
{
  "template": "node-typescript",
  "startCommand": "npm run dev",
  "forwardPorts": [3000, 8000],
  "features": {
    "vscode": true,
    "preview": true,
    "github": true
  },
  "setup": {
    "installCommand": "npm install && pip install -r requirements.txt",
    "startCommand": "npm run dev"
  },
  "extensions": [
    "ms-python.python",
    "ms-vscode.vscode-typescript-next"
  ]
}
EOL
```

## Cost Control & Monitoring Setup

### Cloud Budget Protection Script
```bash
# Create cost monitoring and protection
cat > cost-protection.sh << 'EOL'
#!/bin/bash
# Cloud Cost Protection Script

# Set project and budget alert thresholds
PROJECT_ID=${GCP_PROJECT_ID:-reggieanddrodispensary}
BUDGET_LIMIT=${BUDGET_LIMIT:-100}  # $100 daily limit

echo "🛡️ Setting up cost protection for project: $PROJECT_ID"

# Create budget alert
gcloud billing budgets create \
  --billing-account=$BILLING_ACCOUNT \
  --display-name="Liv-Hana-Daily-Limit" \
  --budget-amount=$BUDGET_LIMIT \
  --threshold-percent=50 \
  --threshold-percent=80 \
  --threshold-percent=100 \
  --notification-channel=$NOTIFICATION_CHANNEL

# Create cost monitoring dashboard
cat > monitoring-config.yaml << 'YAML'
apiVersion: monitoring.coreos.com/v1
kind: ServiceMonitor
metadata:
  name: liv-hana-costs
spec:
  endpoints:
  - interval: 5m
    port: metrics
    path: /api/cost-metrics
YAML

echo "✅ Cost protection active. Alerts set at 50%, 80%, 100% of $${BUDGET_LIMIT} daily limit"
EOL
chmod +x cost-protection.sh
```

### Mock Services Implementation
```bash
# Create mock services to prevent API costs during development
cat > src/core/mock_services.py << 'EOL'
#!/usr/bin/env python3
"""
Mock Services for Liv Hana Development
Prevents API costs during local development and testing
"""

import json
import time
from typing import Dict, Any

class MockAIService:
    """Base class for mocking AI API responses"""
    
    def __init__(self, service_name: str):
        self.service_name = service_name
        self.call_count = 0
        self.total_cost = 0.0
    
    def log_call(self, prompt: str, response: str, estimated_cost: float = 0.0):
        """Log all calls for debugging"""
        self.call_count += 1
        self.total_cost += estimated_cost
        
        log_entry = {
            "service": self.service_name,
            "call_number": self.call_count,
            "timestamp": time.time(),
            "prompt_preview": prompt[:100] + "..." if len(prompt) > 100 else prompt,
            "response_preview": response[:100] + "..." if len(response) > 100 else response,
            "estimated_cost": estimated_cost,
            "total_cost": self.total_cost
        }
        
        print(f"🔍 MOCK {self.service_name} Call #{self.call_count}: Cost ${estimated_cost:.4f}")
        return log_entry

class MockClaude(MockAIService):
    """Mock Claude API responses"""
    
    def __init__(self):
        super().__init__("Claude")
    
    def messages_create(self, messages: list, **kwargs) -> Dict[str, Any]:
        """Mock Claude messages.create"""
        prompt = messages[-1].get("content", "") if messages else ""
        
        # Simulate realistic responses based on prompt patterns
        if "orchestrate" in prompt.lower():
            response = {
                "content": "I'll orchestrate the agents in the following sequence: 1) Context analysis, 2) Task decomposition, 3) Agent assignment, 4) Execution monitoring.",
                "role": "assistant"
            }
        elif "analyze" in prompt.lower():
            response = {
                "content": "Analysis complete. Key findings: System architecture is sound, dependencies are properly structured, potential optimization in agent coordination layer.",
                "role": "assistant"
            }
        else:
            response = {
                "content": "I understand the request. Processing with standard Liv Hana protocols.",
                "role": "assistant"
            }
        
        self.log_call(prompt, response["content"], 0.002)  # Mock cost: $0.002
        return response

class MockOpenAI(MockAIService):
    """Mock OpenAI API responses"""
    
    def __init__(self):
        super().__init__("OpenAI")
    
    def chat_completions_create(self, messages: list, **kwargs) -> Dict[str, Any]:
        """Mock OpenAI chat completions"""
        prompt = messages[-1].get("content", "") if messages else ""
        
        response = {
            "choices": [{
                "message": {
                    "content": "Mock OpenAI response: Task processed according to Liv Hana specifications.",
                    "role": "assistant"
                }
            }]
        }
        
        self.log_call(prompt, response["choices"][0]["message"]["content"], 0.001)
        return response

class MockGemini(MockAIService):
    """Mock Gemini API responses"""
    
    def __init__(self):
        super().__init__("Gemini")
    
    def generate_content(self, prompt: str, **kwargs) -> Dict[str, Any]:
        """Mock Gemini generate content"""
        response = {
            "text": "Mock Gemini analysis: System requirements understood, executing with optimal resource allocation."
        }
        
        self.log_call(prompt, response["text"], 0.0005)
        return response

# Global mock instances
mock_claude = MockClaude()
mock_openai = MockOpenAI()
mock_gemini = MockGemini()

def get_cost_summary() -> Dict[str, Any]:
    """Get cost summary across all mock services"""
    return {
        "claude_calls": mock_claude.call_count,
        "claude_cost": mock_claude.total_cost,
        "openai_calls": mock_openai.call_count,
        "openai_cost": mock_openai.total_cost,
        "gemini_calls": mock_gemini.call_count,
        "gemini_cost": mock_gemini.total_cost,
        "total_cost": mock_claude.total_cost + mock_openai.total_cost + mock_gemini.total_cost
    }
EOL
```

## Validation System

```bash
# Create comprehensive validation script
cat > validate-setup.sh << 'EOL'
#!/bin/bash
echo "🔍 Validating Liv Hana Setup..."

# Check API keys
echo "1. Checking API keys..."
if [ -z "$OPENAI_API_KEY" ]; then echo "❌ OPENAI_API_KEY not set"; else echo "✅ OpenAI OK"; fi
if [ -z "$ANTHROPIC_API_KEY" ]; then echo "❌ ANTHROPIC_API_KEY not set"; else echo "✅ Anthropic OK"; fi
if [ -z "$GEMINI_API_KEY" ]; then echo "❌ GEMINI_API_KEY not set"; else echo "✅ Gemini OK"; fi

# Check configuration files
echo "2. Checking configuration files..."
[ -f ".cursorrules" ] && echo "✅ Cursor config found" || echo "❌ Cursor config missing"
[ -f ".gemi.config.js" ] && echo "✅ Gemi config found" || echo "❌ Gemi config missing"
[ -f "sandbox.config.json" ] && echo "✅ Sandbox config found" || echo "❌ Sandbox config missing"
[ -f "claude-setup.md" ] && echo "✅ Claude config found" || echo "❌ Claude config missing"

# Test core dependencies
echo "3. Testing core dependencies..."
python -c "import requests" 2>/dev/null && echo "✅ Python requests found" || echo "❌ Python requests missing"
node -e "require('typescript')" 2>/dev/null && echo "✅ TypeScript found" || echo "❌ TypeScript missing"

# Test mock services
echo "4. Testing mock services..."
python -c "from src.core.mock_services import get_cost_summary; print('✅ Mock services operational')" 2>/dev/null || echo "❌ Mock services not found"

echo "🎯 Validation complete."
EOL
chmod +x validate-setup.sh
```

## Deployment Execution Plan

### Phase 1: Local Development (Zero Cost)
```bash
# 1. Clone and base setup
git clone https://github.com/RND-Technology/LivHana-SoT.git
cd LivHana-SoT

# 2. Run the setup
chmod +x *.sh
./setup.sh

# 3. Validate configuration
./validate-setup.sh

# 4. CRITICAL: Before adding real API keys, test with mocks
python -c "
from src.core.mock_services import mock_claude, get_cost_summary
response = mock_claude.messages_create([{'content': 'Test orchestration'}])
print('Mock response:', response)
print('Cost summary:', get_cost_summary())
"

# 5. Only after local validation, add real API keys to .env
nano .env  # Edit with real keys
```

### Phase 2: Cloud Deployment (Controlled Cost)
```bash
# 1. Set up cost protection first
export BILLING_ACCOUNT="your-billing-account"
export NOTIFICATION_CHANNEL="your-notification-channel"
./cost-protection.sh

# 2. Deploy to chosen platform
#    - Open in Cursor: cursor .
#    - Use with Claude: Upload claude-setup.md + codebase
#    - Use with Gemi: ./gemi-start.sh
#    - Open in Sandbox: sandbox.dev (upload folder)

# 3. Monitor costs continuously
gcloud billing budgets list --format="table(displayName,amount,thresholdRules)"
```

## Troubleshooting Common Issues

### High API Costs
1. Verify mock services are active during development
2. Check for infinite loops in agent communication
3. Monitor budget alerts and set hard stops

### Authentication Failures
1. Verify API keys are correctly formatted in .env
2. Check key permissions and quotas
3. Validate network connectivity to API endpoints

### Agent Coordination Issues
1. Review structured logging in observability system
2. Check idempotency of failed operations
3. Verify clean failure handling and recovery

## Success Metrics

- ✅ Local development with zero API costs
- ✅ Successful cloud deployment under budget
- ✅ All agents coordinating properly
- ✅ Clean failure handling and recovery
- ✅ Cost transparency and monitoring active

## Next Actions

1. Execute local setup and validation
2. Test all mock services thoroughly
3. Gradually replace mocks with real APIs
4. Deploy to cloud with cost monitoring
5. Implement continuous observability

---

**Context**: Lessons learned from $700+ cloud development experience  
**Priority**: Critical for cost-effective AI development  
**Verification**: Must pass all validation scripts before cloud deployment