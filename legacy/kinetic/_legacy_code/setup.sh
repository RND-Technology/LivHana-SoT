#!/bin/bash
# LivHana-SoT: One-Shot Setup Script
# Sovereign AI Agent Swarm Bootstrap

set -e

echo "🚀 LivHana-SoT: Sovereign AI Agent Swarm Setup"
echo "=============================================="

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Function to print colored output
print_status() {
    echo -e "${GREEN}✅ $1${NC}"
}

print_warning() {
    echo -e "${YELLOW}⚠️  $1${NC}"
}

print_error() {
    echo -e "${RED}❌ $1${NC}"
}

print_info() {
    echo -e "${BLUE}ℹ️  $1${NC}"
}

# Check if running on macOS
if [[ "$OSTYPE" != "darwin"* ]]; then
    print_warning "This script is optimized for macOS. Proceeding anyway..."
fi

# Check for required tools
print_info "Checking prerequisites..."

# Check Docker
if ! command -v docker &> /dev/null; then
    print_error "Docker is not installed. Please install Docker Desktop first."
    exit 1
fi
print_status "Docker found"

# Check Docker Compose
if ! command -v docker-compose &> /dev/null; then
    print_error "Docker Compose is not installed. Please install Docker Compose first."
    exit 1
fi
print_status "Docker Compose found"

# Check if running on Apple Silicon
if [[ $(uname -m) == "arm64" ]]; then
    print_status "Apple Silicon detected - optimizing for M4 Max"
    export DOCKER_DEFAULT_PLATFORM=linux/arm64
else
    print_warning "Not running on Apple Silicon - performance may be suboptimal"
fi

# Create necessary directories
print_info "Creating directory structure..."
mkdir -p models logs data monitoring/grafana/dashboards monitoring/grafana/datasources
print_status "Directory structure created"

# Check for model file
print_info "Checking for DeepSeek-Coder-33B model..."
if [ ! -f "models/deepseek-coder-33b-instruct.gguf" ]; then
    print_warning "DeepSeek-Coder-33B model not found in models/ directory"
    print_info "Please download the model file:"
    echo "  mkdir -p models"
    echo "  wget -O models/deepseek-coder-33b-instruct.gguf [MODEL_DOWNLOAD_URL]"
    echo ""
    print_info "Or use the model download script:"
    echo "  ./scripts/download_model.sh"
    echo ""
    read -p "Continue without model? (y/N): " -n 1 -r
    echo
    if [[ ! $REPLY =~ ^[Yy]$ ]]; then
        print_error "Setup cancelled. Please download the model first."
        exit 1
    fi
else
    print_status "Model file found"
fi

# Create environment file if it doesn't exist
if [ ! -f ".env" ]; then
    print_info "Creating environment configuration..."
    cp env.example .env
    print_status "Environment file created from template"
    print_warning "Please edit .env file with your actual configuration values"
else
    print_status "Environment file already exists"
fi

# Set up logging
print_info "Setting up logging configuration..."
cat > logging.conf << 'EOF'
[loggers]
keys=root,livhana

[handlers]
keys=consoleHandler,fileHandler

[formatters]
keys=simpleFormatter,jsonFormatter

[logger_root]
level=INFO
handlers=consoleHandler

[logger_livhana]
level=INFO
handlers=consoleHandler,fileHandler
qualname=livhana
propagate=0

[handler_consoleHandler]
class=StreamHandler
level=INFO
formatter=simpleFormatter
args=(sys.stdout,)

[handler_fileHandler]
class=FileHandler
level=INFO
formatter=jsonFormatter
args=('logs/livhana.log',)

[formatter_simpleFormatter]
format=%(asctime)s - %(name)s - %(levelname)s - %(message)s

[formatter_jsonFormatter]
format={"timestamp": "%(asctime)s", "logger": "%(name)s", "level": "%(levelname)s", "message": "%(message)s"}
EOF
print_status "Logging configuration created"

# Create systemd service file (for Linux systems)
if [[ "$OSTYPE" == "linux-gnu"* ]]; then
    print_info "Creating systemd service file..."
    sudo tee /etc/systemd/system/livhana.service > /dev/null << EOF
[Unit]
Description=LivHana-SoT AI Agent Swarm
Requires=docker.service
After=docker.service

[Service]
Type=oneshot
RemainAfterExit=yes
WorkingDirectory=$(pwd)
ExecStart=/usr/bin/docker-compose up -d
ExecStop=/usr/bin/docker-compose down
TimeoutStartSec=0

[Install]
WantedBy=multi-user.target
EOF
    print_status "Systemd service file created"
fi

# Create startup script
print_info "Creating startup script..."
cat > start_livhana.sh << 'EOF'
#!/bin/bash
# LivHana-SoT Startup Script

echo "🚀 Starting LivHana-SoT AI Agent Swarm..."

# Check if Docker is running
if ! docker info > /dev/null 2>&1; then
    echo "❌ Docker is not running. Please start Docker Desktop first."
    exit 1
fi

# Start services
docker-compose up -d

# Wait for services to be ready
echo "⏳ Waiting for services to start..."
sleep 30

# Check health
echo "🔍 Checking system health..."
if curl -f http://localhost:8000/health > /dev/null 2>&1; then
    echo "✅ LivHana-SoT is running successfully!"
    echo "📊 API: http://localhost:8000"
    echo "📈 Metrics: http://localhost:8000/metrics"
    echo "📊 Grafana: http://localhost:3000 (admin/livhana2024)"
    echo "🔍 Prometheus: http://localhost:9090"
else
    echo "❌ Health check failed. Check logs with: docker-compose logs"
fi
EOF

chmod +x start_livhana.sh
print_status "Startup script created"

# Create stop script
print_info "Creating stop script..."
cat > stop_livhana.sh << 'EOF'
#!/bin/bash
# LivHana-SoT Stop Script

echo "🛑 Stopping LivHana-SoT AI Agent Swarm..."

docker-compose down

echo "✅ LivHana-SoT stopped"
EOF

chmod +x stop_livhana.sh
print_status "Stop script created"

# Create model download script
print_info "Creating model download script..."
mkdir -p scripts
cat > scripts/download_model.sh << 'EOF'
#!/bin/bash
# DeepSeek-Coder-33B Model Download Script

echo "📥 Downloading DeepSeek-Coder-33B model..."

# Create models directory
mkdir -p models

# Model download URLs (replace with actual URLs)
MODEL_URL="https://huggingface.co/deepseek-ai/deepseek-coder-33b-instruct-gguf/resolve/main/deepseek-coder-33b-instruct-q4_k_m.gguf"
MODEL_FILE="models/deepseek-coder-33b-instruct.gguf"

echo "Downloading from: $MODEL_URL"
echo "Saving to: $MODEL_FILE"

# Download with progress bar
wget --progress=bar:force -O "$MODEL_FILE" "$MODEL_URL"

if [ $? -eq 0 ]; then
    echo "✅ Model downloaded successfully"
    echo "File size: $(du -h $MODEL_FILE | cut -f1)"
else
    echo "❌ Model download failed"
    exit 1
fi
EOF

chmod +x scripts/download_model.sh
print_status "Model download script created"

# Create test script
print_info "Creating test script..."
cat > test_livhana.sh << 'EOF'
#!/bin/bash
# LivHana-SoT Test Script

echo "🧪 Testing LivHana-SoT AI Agent Swarm..."

# Test health endpoint
echo "Testing health endpoint..."
if curl -f http://localhost:8000/health; then
    echo "✅ Health check passed"
else
    echo "❌ Health check failed"
    exit 1
fi

# Test chat endpoint
echo "Testing chat endpoint..."
curl -X POST http://localhost:8000/chat \
  -H "Content-Type: application/json" \
  -d '{"message": "Hello, Liv Hana! What is your mission?", "context": "Test message"}' \
  | jq '.'

echo "✅ Test completed"
EOF

chmod +x test_livhana.sh
print_status "Test script created"

# Install jq if not present (for JSON parsing in tests)
if ! command -v jq &> /dev/null; then
    print_warning "jq not found. Installing for JSON parsing..."
    if [[ "$OSTYPE" == "darwin"* ]]; then
        if command -v brew &> /dev/null; then
            brew install jq
        else
            print_warning "Please install jq manually: https://stedolan.github.io/jq/"
        fi
    elif [[ "$OSTYPE" == "linux-gnu"* ]]; then
        sudo apt-get update && sudo apt-get install -y jq
    fi
fi

# Final setup summary
echo ""
echo "🎉 LivHana-SoT Setup Complete!"
echo "=============================="
echo ""
print_info "Next steps:"
echo "1. Download the model: ./scripts/download_model.sh"
echo "2. Edit configuration: nano .env"
echo "3. Start the system: ./start_livhana.sh"
echo "4. Test the system: ./test_livhana.sh"
echo ""
print_info "Access points:"
echo "• API: http://localhost:8000"
echo "• Health: http://localhost:8000/health"
echo "• Metrics: http://localhost:8000/metrics"
echo "• Grafana: http://localhost:3000 (admin/livhana2024)"
echo "• Prometheus: http://localhost:9090"
echo ""
print_info "Management commands:"
echo "• Start: ./start_livhana.sh"
echo "• Stop: ./stop_livhana.sh"
echo "• Test: ./test_livhana.sh"
echo "• Logs: docker-compose logs -f"
echo "• Status: docker-compose ps"
echo ""
print_warning "Remember to download the DeepSeek-Coder-33B model before starting!"
echo ""
print_status "Setup completed successfully! 🚀"

