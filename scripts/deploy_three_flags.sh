#!/bin/bash

# Liv Hana Three-Flag Deployment Script
# Deploys Custom GPT, Slack Bot, and Replit Prototype in parallel

set -e

echo "🚀 LIV HANA THREE-FLAG DEPLOYMENT"
echo "=================================="
echo "Deploying Custom GPT, Slack Bot, and Replit Prototype"
echo "Competition tracking via port 8001 API"
echo ""

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Function to print colored output
print_status() {
    echo -e "${BLUE}[$(date +'%H:%M:%S')]${NC} $1"
}

print_success() {
    echo -e "${GREEN}[$(date +'%H:%M:%S')]${NC} ✅ $1"
}

print_warning() {
    echo -e "${YELLOW}[$(date +'%H:%M:%S')]${NC} ⚠️ $1"
}

print_error() {
    echo -e "${RED}[$(date +'%H:%M:%S')]${NC} ❌ $1"
}

# Function to check service health
check_service() {
    local service_name=$1
    local port=$2
    
    if curl -s "http://localhost:$port/health" > /dev/null 2>&1; then
        print_success "$service_name is healthy (port $port)"
        return 0
    else
        print_error "$service_name is down (port $port)"
        return 1
    fi
}

# Function to submit deployment prediction
submit_deployment_prediction() {
    local flag_name=$1
    local roi_target=$2
    local timeframe=$3
    
    print_status "Submitting deployment prediction for $flag_name"
    
    curl -X POST http://localhost:8001/api/v1/projections \
        -H "Content-Type: application/json" \
        -d "{
            \"participant\": \"liv_hana\",
            \"metric\": \"roi_per_day\",
            \"value\": $roi_target,
            \"unit\": \"USD\",
            \"timeframe\": \"${timeframe}d\",
            \"confidence\": 0.85,
            \"context\": {
                \"project\": \"three_flag_deployment\",
                \"flag\": \"$flag_name\",
                \"session\": \"$(date +'%Y-%m-%d_%H-%M-%S')\"
            }
        }" > /dev/null 2>&1
    
    print_success "Prediction submitted for $flag_name: \$$roi_target/day"
}

# Function to check 3-agent foundation
check_foundation() {
    print_status "Checking 3-agent foundation status"
    
    if [ -f ".claude/agent_coordination/rpm_state.json" ] && 
       [ -f ".claude/agent_coordination/research_feed.json" ] && 
       [ -f ".claude/agent_coordination/qa_metrics.json" ]; then
        print_success "3-agent foundation files present"
        
        # Check if agents are running
        local rpm_status=$(jq -r '.status' .claude/agent_coordination/rpm_state.json 2>/dev/null || echo "unknown")
        local research_status=$(jq -r '.status' .claude/agent_coordination/research_feed.json 2>/dev/null || echo "unknown")
        local qa_status=$(jq -r '.status' .claude/agent_coordination/qa_metrics.json 2>/dev/null || echo "unknown")
        
        if [ "$rpm_status" = "running" ] && [ "$research_status" = "running" ] && [ "$qa_status" = "running" ]; then
            print_success "All 3 agents are running"
            return 0
        else
            print_warning "Some agents not running: RPM=$rpm_status, Research=$research_status, QA=$qa_status"
            return 1
        fi
    else
        print_error "3-agent foundation files missing"
        return 1
    fi
}

# Function to check voice services
check_voice_services() {
    print_status "Checking voice services"
    
    local stt_running=false
    local tts_running=false
    
    if lsof -i :2022 | grep -q whisper; then
        print_success "STT (Whisper) running on port 2022"
        stt_running=true
    else
        print_warning "STT (Whisper) not running on port 2022"
    fi
    
    if lsof -i :8880 | grep -q python; then
        print_success "TTS (Kokoro) running on port 8880"
        tts_running=true
    else
        print_warning "TTS (Kokoro) not running on port 8880"
    fi
    
    if [ "$stt_running" = true ] && [ "$tts_running" = true ]; then
        print_success "Voice services operational"
        return 0
    else
        print_warning "Voice services partially operational"
        return 1
    fi
}

# Function to deploy Custom GPT
deploy_custom_gpt() {
    print_status "Starting Custom GPT deployment (Flag 1)"
    
    # Submit prediction
    submit_deployment_prediction "custom_gpt" 300 30
    
    # Create deployment directory
    mkdir -p deployment/custom_gpt
    
    # Copy deployment files
    cp deployment/custom_gpt_deployment.md deployment/custom_gpt/
    
    print_success "Custom GPT deployment files ready"
    print_status "Next steps:"
    echo "  1. Go to ChatGPT → Create GPT"
    echo "  2. Paste configuration from deployment/custom_gpt_deployment.md"
    echo "  3. Configure Actions with compliance endpoints"
    echo "  4. Publish to ChatGPT App Store"
    echo "  5. Test on mobile device"
    
    return 0
}

# Function to deploy Slack Bot
deploy_slack_bot() {
    print_status "Starting Slack Bot deployment (Flag 2)"
    
    # Submit prediction
    submit_deployment_prediction "slack_bot" 500 30
    
    # Create deployment directory
    mkdir -p deployment/slack_bot
    
    # Copy deployment files
    cp deployment/slack_bot_deployment.md deployment/slack_bot/
    
    # Create package.json
    cat > deployment/slack_bot/package.json << 'EOF'
{
  "name": "liv-hana-slack-bot",
  "version": "1.0.0",
  "description": "Liv Hana Team Assistant Slack Bot",
  "main": "main.js",
  "scripts": {
    "start": "node main.js",
    "dev": "nodemon main.js"
  },
  "dependencies": {
    "@slack/bolt": "^3.12.0",
    "axios": "^1.6.0",
    "dotenv": "^16.3.0"
  },
  "devDependencies": {
    "nodemon": "^3.0.0"
  }
}
EOF

    # Create main.js
    cat > deployment/slack_bot/main.js << 'EOF'
const { App } = require('@slack/bolt');
const axios = require('axios');

const app = new App({
  token: process.env.SLACK_BOT_TOKEN,
  signingSecret: process.env.SLACK_SIGNING_SECRET
});

// Slash command handlers
app.command('/liv', async ({ command, ack, respond }) => {
  await ack();
  
  await respond({
    text: "Liv Hana here, full state.",
    blocks: [
      {
        type: "section",
        text: {
          type: "mrkdwn",
          text: "*Status:* Operational\n*Voice Mode:* Available\n*Competition:* Active"
        }
      }
    ]
  });
});

app.command('/prediction', async ({ command, ack, respond }) => {
  await ack();
  
  try {
    const response = await axios.post('http://localhost:8001/api/v1/projections', {
      participant: 'slack_bot',
      metric: 'roi_per_day',
      value: 500,
      unit: 'USD',
      timeframe: '30d',
      confidence: 0.85,
      context: {
        project: 'slack_bot_deployment',
        source: 'slack_bot'
      }
    });
    
    await respond({
      text: "Prediction Submitted",
      blocks: [
        {
          type: "section",
          text: {
            type: "mrkdwn",
            text: "*Projection:* $500/day ROI\n*Confidence:* 85%\n*Status:* Submitted successfully"
          }
        }
      ]
    });
  } catch (error) {
    await respond({
      text: "Error submitting prediction",
      blocks: [
        {
          type: "section",
          text: {
            type: "mrkdwn",
            text: "*Error:* " + error.message
          }
        }
      ]
    });
  }
});

(async () => {
  await app.start(process.env.PORT || 3000);
  console.log('Liv Hana Slack Bot is running!');
})();
EOF

    # Create .env template
    cat > deployment/slack_bot/.env.template << 'EOF'
SLACK_BOT_TOKEN=xoxb-your-bot-token
SLACK_SIGNING_SECRET=your-signing-secret
PORT=3000
EOF

    print_success "Slack Bot deployment files ready"
    print_status "Next steps:"
    echo "  1. Create Slack app at api.slack.com/apps"
    echo "  2. Configure OAuth & Permissions"
    echo "  3. Install to workspace"
    echo "  4. Copy .env.template to .env and fill in tokens"
    echo "  5. Run: npm install && npm start"
    
    return 0
}

# Function to deploy Replit Prototype
deploy_replit_prototype() {
    print_status "Starting Replit Prototype deployment (Flag 3)"
    
    # Submit prediction
    submit_deployment_prediction "replit_prototype" 400 30
    
    # Create deployment directory
    mkdir -p deployment/replit_prototype
    
    # Copy deployment files
    cp deployment/replit_prototype_deployment.md deployment/replit_prototype/
    
    # Create package.json
    cat > deployment/replit_prototype/package.json << 'EOF'
{
  "name": "liv-hana-voice-portal",
  "version": "1.0.0",
  "description": "Liv Hana Voice Portal - Replit Prototype",
  "main": "src/main.tsx",
  "scripts": {
    "start": "react-scripts start",
    "build": "react-scripts build",
    "test": "react-scripts test",
    "eject": "react-scripts eject"
  },
  "dependencies": {
    "react": "^18.2.0",
    "react-dom": "^18.2.0",
    "react-scripts": "5.0.1",
    "typescript": "^4.9.5",
    "tailwindcss": "^3.3.0"
  },
  "devDependencies": {
    "@types/react": "^18.2.0",
    "@types/react-dom": "^18.2.0"
  }
}
EOF

    # Create basic App.tsx
    cat > deployment/replit_prototype/src/App.tsx << 'EOF'
import React, { useState, useEffect } from 'react';

function App() {
  const [status, setStatus] = useState('Liv Hana here, full state.');
  const [mode, setMode] = useState('mentor');

  useEffect(() => {
    // Check voice services
    checkVoiceServices();
  }, []);

  const checkVoiceServices = async () => {
    try {
      const sttResponse = await fetch('http://localhost:2022/health');
      const ttsResponse = await fetch('http://localhost:8880/health');
      
      if (sttResponse.ok && ttsResponse.ok) {
        setStatus('Voice mode active. STT: Whisper, TTS: Kokoro.');
      } else {
        setStatus('Voice mode unavailable. Using text mode.');
      }
    } catch (error) {
      setStatus('Voice services offline. Text mode only.');
    }
  };

  return (
    <div className="min-h-screen bg-gray-900 text-white">
      <div className="container mx-auto px-4 py-8">
        <header className="text-center mb-8">
          <h1 className="text-4xl font-bold mb-2">Liv Hana VIP</h1>
          <p className="text-gray-400">Chief of Staff AI for Cannabis Intelligence</p>
          <div className="mt-4 p-4 bg-gray-800 rounded-lg">
            <p className="text-green-400">{status}</p>
          </div>
        </header>
        
        <div className="text-center">
          <p>Replit Prototype Ready for Deployment</p>
          <p>Voice Interface: Coming Soon</p>
          <p>Competition Tracking: Active</p>
        </div>
      </div>
    </div>
  );
}

export default App;
EOF

    print_success "Replit Prototype deployment files ready"
    print_status "Next steps:"
    echo "  1. Go to replit.com"
    echo "  2. Create new React + TypeScript project"
    echo "  3. Name: 'Liv Hana Voice Portal'"
    echo "  4. Import code from deployment/replit_prototype/"
    echo "  5. Deploy and test"
    
    return 0
}

# Function to show competition status
show_competition_status() {
    print_status "Checking competition system status"
    
    local leaderboard_response=$(curl -s "http://localhost:8001/api/v1/leaderboard?type=daily&limit=5" 2>/dev/null || echo '{"leaderboard":[]}')
    local leaderboard_count=$(echo "$leaderboard_response" | jq '.leaderboard | length' 2>/dev/null || echo "0")
    
    if [ "$leaderboard_count" -gt 0 ]; then
        print_success "Competition system active with $leaderboard_count entries"
        echo "$leaderboard_response" | jq '.leaderboard[] | "\(.rank). \(.participant): \(.accuracy)% ($$.roiPerDay/day)"' 2>/dev/null || echo "  No entries yet"
    else
        print_warning "Competition system ready but no entries yet"
    fi
}

# Main deployment function
main() {
    print_status "Starting Liv Hana Three-Flag Deployment"
    echo ""
    
    # Pre-flight checks
    print_status "Running pre-flight checks..."
    
    local all_services_healthy=true
    local foundation_healthy=true
    local voice_healthy=true
    
    # Check critical services
    check_service "Voice Service" 8080 || all_services_healthy=false
    check_service "Reasoning Gateway" 4002 || all_services_healthy=false
    check_service "Compliance Service" 8000 || all_services_healthy=false
    check_service "Accuracy Competition Service" 8001 || all_services_healthy=false
    
    # Check 3-agent foundation
    check_foundation || foundation_healthy=false
    
    # Check voice services
    check_voice_services || voice_healthy=false
    
    echo ""
    
    if [ "$all_services_healthy" = true ] && [ "$foundation_healthy" = true ]; then
        print_success "All systems operational - proceeding with deployment"
        echo ""
        
        # Deploy all three flags
        print_status "Deploying all three flags in parallel..."
        echo ""
        
        # Flag 1: Custom GPT
        deploy_custom_gpt
        echo ""
        
        # Flag 2: Slack Bot
        deploy_slack_bot
        echo ""
        
        # Flag 3: Replit Prototype
        deploy_replit_prototype
        echo ""
        
        # Show competition status
        show_competition_status
        echo ""
        
        print_success "Three-Flag Deployment Complete!"
        print_status "All deployment files ready in deployment/ directory"
        print_status "Competition tracking active via port 8001 API"
        print_status "Next: Follow deployment steps for each flag"
        
    else
        print_error "Pre-flight checks failed - deployment aborted"
        print_status "Issues detected:"
        [ "$all_services_healthy" = false ] && echo "  - Critical services down"
        [ "$foundation_healthy" = false ] && echo "  - 3-agent foundation not running"
        [ "$voice_healthy" = false ] && echo "  - Voice services partially operational"
        echo ""
        print_status "Fix issues and run script again"
        exit 1
    fi
}

# Run main function
main "$@"
