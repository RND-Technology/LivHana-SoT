#!/bin/bash

# TRINITY STACK DEPLOYMENT SCRIPT
# Mission: Deploy unified LivHana E2E with voice-first cockpit, DeepSeek autonomy, compliance guardrails

set -e

PROJECT_ID=${GCP_PROJECT_ID:-"livhana-trinity"}
REGION=${GCP_REGION:-"us-central1"}

echo "🚀 TRINITY STACK DEPLOYMENT INITIATED"
echo "📍 Project: $PROJECT_ID"
echo "🌎 Region: $REGION"
echo "⏰ Timestamp: $(date)"

# Validate 1Password CLI
if ! command -v op &> /dev/null; then
    echo "❌ 1Password CLI not found. Install with: brew install 1password-cli"
    exit 1
fi

# Validate GCP CLI
if ! command -v gcloud &> /dev/null; then
    echo "❌ Google Cloud CLI not found. Install with: brew install google-cloud-sdk"
    exit 1
fi

# Validate Docker
if ! command -v docker &> /dev/null; then
    echo "❌ Docker not found. Install Docker Desktop"
    exit 1
fi

echo "✅ Prerequisites validated"

# Create Docker secrets (1Password integration)
echo "🔐 Creating Docker secrets from 1Password..."

# ElevenLabs API Key
echo "Retrieving ElevenLabs API key..."
ELEVENLABS_KEY=$(op item get ELEVENLABS_API_KEY --vault LivHana-Ops-Keys --reveal --fields credential 2>/dev/null || echo "")
if [ -n "$ELEVENLABS_KEY" ]; then
    echo "$ELEVENLABS_KEY" | docker secret create elevenlabs_api_key - 2>/dev/null || echo "Secret already exists"
    echo "✅ ElevenLabs API key configured"
else
    echo "⚠️  ElevenLabs API key not found in 1Password"
fi

# Anthropic API Key
echo "Retrieving Anthropic API key..."
ANTHROPIC_KEY=$(op item get ANTHROPIC_API_KEY --vault LivHana-Ops-Keys --reveal --fields credential 2>/dev/null || echo "")
if [ -n "$ANTHROPIC_KEY" ]; then
    echo "$ANTHROPIC_KEY" | docker secret create anthropic_api_key - 2>/dev/null || echo "Secret already exists"
    echo "✅ Anthropic API key configured"
else
    echo "⚠️  Anthropic API key not found in 1Password"
fi

# OpenAI API Key
echo "Retrieving OpenAI API key..."
# Use the correct vault to avoid 'isn't an item' errors
OPENAI_KEY=$(op item get OPENAI_API_KEY --vault LivHana-Ops-Keys --reveal --fields credential 2>/dev/null || echo "")
if [ -n "$OPENAI_KEY" ]; then
    echo "$OPENAI_KEY" | docker secret create openai_api_key - 2>/dev/null || echo "Secret already exists"
    echo "✅ OpenAI API key configured"
else
    echo "⚠️  OpenAI API key not found in 1Password"
fi

# Deploy Trinity Stack
echo "🏗️  Deploying Trinity Stack..."
docker-compose -f docker-compose.unified.yml down --remove-orphans
docker-compose -f docker-compose.unified.yml build --no-cache
docker-compose -f docker-compose.unified.yml up -d

# Wait for services to be healthy
echo "🏥 Waiting for services to be healthy..."
sleep 30

# Health checks
echo "🔍 Running health checks..."

services=("vibe-cockpit:5173" "integration-service:3005" "voice-service:8080" "reasoning-gateway:4002" "redis:6379")
all_healthy=true

for service in "${services[@]}"; do
    service_name=$(echo $service | cut -d: -f1)
    port=$(echo $service | cut -d: -f2)
    
    if [ "$service_name" = "redis" ]; then
        if docker exec trinity_redis_1 redis-cli ping | grep -q PONG; then
            echo "✅ $service_name: Healthy"
        else
            echo "❌ $service_name: Unhealthy"
            all_healthy=false
        fi
    else
        if curl -f -s http://localhost:$port/health > /dev/null; then
            echo "✅ $service_name: Healthy"
        else
            echo "❌ $service_name: Unhealthy"
            all_healthy=false
        fi
    fi
done

if [ "$all_healthy" = true ]; then
    echo ""
    echo "🎉 TRINITY STACK DEPLOYMENT SUCCESSFUL!"
    echo ""
    echo "🔗 Service URLs:"
    echo "   Frontend (Vibe Cockpit): http://localhost:5173"
    echo "   Voice Service: http://localhost:8080"
    echo "   Reasoning Gateway: http://localhost:4002"
    echo "   Integration Service: http://localhost:3005"
    echo "   Redis: localhost:6379"
    echo ""
    echo "📋 Next Steps:"
    echo "1. Configure domain mappings for production"
    echo "2. Set up SSL certificates"
    echo "3. Configure monitoring and alerting"
    echo "4. Run Playwright test suite"
    echo ""
    echo "📊 Monitor with:"
    echo "   docker-compose -f docker-compose.unified.yml logs -f"
    echo "   docker-compose -f docker-compose.unified.yml ps"
else
    echo ""
    echo "❌ DEPLOYMENT FAILED - Some services are unhealthy"
    echo "📋 Troubleshooting:"
    echo "   docker-compose -f docker-compose.unified.yml logs"
    echo "   docker-compose -f docker-compose.unified.yml ps"
    exit 1
fi
