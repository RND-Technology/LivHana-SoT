---
diataxis: tutorial
owner: Jesse Niesen (CEO)
last-reviewed: 2025-10-06
---

# 🛠️ Development Environment Setup Tutorial

**Purpose**: Step-by-step tutorial for setting up a complete development environment for the Liv Hana E2E Mission codebase.

## 🎯 Learning Objectives

By the end of this tutorial, you will:

- Have a fully functional development environment
- Understand all required tools and their purposes
- Be able to run the entire system locally
- Know how to debug and troubleshoot issues
- Understand the deployment pipeline

## 📋 Prerequisites

### System Requirements

- **macOS**: 10.15+ (Catalina or later)
- **RAM**: 8GB minimum, 16GB recommended
- **Storage**: 10GB free space
- **Network**: Stable internet connection

### Required Accounts

- GitHub account with repository access
- Google Cloud Platform account
- 1Password account (for secret management)

## 🚀 Step 1: Install Core Tools

### 1.1 Install Homebrew

```bash
/bin/bash -c "$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/HEAD/install.sh)"
```

### 1.2 Install Node.js and npm

```bash
# Install Node.js 18 LTS
brew install node@18

# Verify installation
node --version  # Should show v18.x.x
npm --version   # Should show 8.x.x or later
```

### 1.3 Install Git

```bash
brew install git

# Configure Git
git config --global user.name "Your Name"
git config --global user.email "your.email@example.com"
git config --global init.defaultBranch main
```

### 1.4 Install VS Code or Cursor

```bash
# VS Code
brew install --cask visual-studio-code

# Or Cursor (recommended for AI assistance)
brew install --cask cursor
```

## 🔧 Step 2: Install Development Tools

### 2.1 Install 1Password CLI

```bash
brew install 1password-cli

# Verify installation
op --version
```

### 2.2 Install Google Cloud CLI

```bash
brew install google-cloud-sdk

# Initialize gcloud
gcloud init

# Verify installation
gcloud --version
```

### 2.3 Install Docker

```bash
brew install --cask docker

# Start Docker Desktop
open -a Docker
```

### 2.4 Install Additional Tools

```bash
# Install useful development tools
brew install jq yq tree curl wget

# Install Node.js tools globally
npm install -g nodemon concurrently
```

## 📁 Step 3: Clone and Setup Repository

### 3.1 Clone Repository

```bash
git clone https://github.com/RND-Technology/LivHana-SoT.git
cd LivHana-SoT
```

### 3.2 Install Dependencies

```bash
npm install
```

### 3.3 Set Up Environment Variables

```bash
# Copy example environment file
cp .env.example .env

# Edit with your configuration
code .env
```

### 3.4 Install Playwright

```bash
npx playwright install
```

## 🔐 Step 4: Configure Secret Management

### 4.1 Set Up 1Password CLI

```bash
# Sign in to 1Password
op signin

# Test access
op list items
```

### 4.2 Configure Environment Secrets

```bash
# Example .env configuration
echo "GITHUB_TOKEN=\$(op read 'op://LivHana-Trinity-Local Development/GITHUB_TOKEN/password')" >> .env
echo "GCP_PROJECT_ID=reggieanddrodispensary" >> .env
echo "GCP_REGION=us-central1" >> .env
```

### 4.3 Test Secret Access

```bash
# Test 1Password access
op read 'op://LivHana-Trinity-Local Development/GITHUB_TOKEN/password'

# Test environment loading
source .env
echo $GITHUB_TOKEN
```

## ☁️ Step 5: Configure Google Cloud

### 5.1 Authenticate with GCP

```bash
# Login to Google Cloud
gcloud auth login

# Set project
gcloud config set project reggieanddrodispensary

# Verify access
gcloud projects describe reggieanddrodispensary
```

### 5.2 Enable Required APIs

```bash
# Enable required services
gcloud services enable run.googleapis.com
gcloud services enable cloudbuild.googleapis.com
gcloud services enable secretmanager.googleapis.com
gcloud services enable artifactregistry.googleapis.com
```

### 5.3 Configure Docker for GCP

```bash
# Configure Docker authentication
gcloud auth configure-docker us-central1-docker.pkg.dev
```

## 🧪 Step 6: Verify Installation

### 6.1 Run Tests

```bash
# Run all tests
npm test

# Run specific test suites
npm run test:unit
npm run test:integration
npm run test:e2e
```

### 6.2 Run Linting

```bash
# Check code quality
npm run lint

# Fix auto-fixable issues
npm run lint:fix
```

### 6.3 Build Project

```bash
# Build for production
npm run build

# Verify build output
ls -la dist/
```

## 🚀 Step 7: Start Development Server

### 7.1 Start Backend Services

```bash
# Start all services
npm run dev

# Or start individually
npm run dev:backend
npm run dev:frontend
```

### 7.2 Verify Services

```bash
# Check service health
curl http://localhost:8080/health
curl http://localhost:3000/health
```

### 7.3 Access Applications

- **Frontend**: <http://localhost:3000>
- **Backend API**: <http://localhost:8080>
- **Admin Panel**: <http://localhost:3000/admin>

## 🔍 Step 8: Debugging Setup

### 8.1 VS Code Debug Configuration

Create `.vscode/launch.json`:

```json
{
  "version": "0.2.0",
  "configurations": [
    {
      "name": "Debug Backend",
      "type": "node",
      "request": "launch",
      "program": "${workspaceFolder}/backend/integration-service/src/index.js",
      "env": {
        "NODE_ENV": "development"
      },
      "console": "integratedTerminal"
    },
    {
      "name": "Debug Frontend",
      "type": "node",
      "request": "launch",
      "program": "${workspaceFolder}/frontend/cockpit/server.js",
      "env": {
        "NODE_ENV": "development"
      },
      "console": "integratedTerminal"
    }
  ]
}
```

### 8.2 Logging Configuration

```bash
# Enable debug logging
export DEBUG=livhana:*
export LOG_LEVEL=debug

# Start with debug logging
npm run dev
```

### 8.3 Common Debug Commands

```bash
# Check running processes
ps aux | grep node

# Check port usage
lsof -i :8080
lsof -i :3000

# Check logs
tail -f logs/application.log
```

## 🐳 Step 9: Docker Development

### 9.1 Build Docker Images

```bash
# Build all images
docker-compose build

# Build specific service
docker-compose build integration-service
```

### 9.2 Run with Docker

```bash
# Start all services
docker-compose up

# Start in background
docker-compose up -d

# View logs
docker-compose logs -f
```

### 9.3 Docker Debugging

```bash
# Access running container
docker-compose exec integration-service bash

# Check container status
docker-compose ps

# Restart specific service
docker-compose restart integration-service
```

## 🔄 Step 10: CI/CD Pipeline

### 10.1 Local CI Simulation

```bash
# Run full CI pipeline locally
npm run ci:local

# This runs:
# - npm install
# - npm run lint
# - npm run test
# - npm run build
# - npm run test:e2e
```

### 10.2 GitHub Actions

```bash
# Check GitHub Actions status
gh run list

# View specific run
gh run view [RUN_ID]
```

### 10.3 Deployment Testing

```bash
# Test deployment locally
npm run deploy:local

# Test Cloud Run deployment
npm run deploy:staging
```

## 🛠️ Step 11: IDE Configuration

### 11.1 VS Code Extensions

Install recommended extensions:

```bash
# Install extensions
code --install-extension ms-vscode.vscode-typescript-next
code --install-extension esbenp.prettier-vscode
code --install-extension ms-vscode.vscode-eslint
code --install-extension ms-playwright.playwright
code --install-extension ms-vscode.vscode-json
```

### 11.2 VS Code Settings

Create `.vscode/settings.json`:

```json
{
  "editor.formatOnSave": true,
  "editor.codeActionsOnSave": {
    "source.fixAll.eslint": true
  },
  "typescript.preferences.importModuleSpecifier": "relative",
  "files.exclude": {
    "**/node_modules": true,
    "**/dist": true,
    "**/.git": true
  }
}
```

### 11.3 Cursor Configuration

If using Cursor, configure AI settings:

```json
{
  "claudeCode.defaultApprovalMode": "trusted",
  "claudeCode.maxTokens": 200000,
  "claudeCode.extendedContextWindow": true,
  "claudeCode.parallelProcessing": true,
  "claudeCode.smartIndexing": true,
  "claudeCode.deepCodebaseAnalysis": true,
  "claudeCode.memoryOptimization": true,
  "claudeCode.tier1Mode": true
}
```

## 🔧 Step 12: Troubleshooting

### 12.1 Common Issues

#### Node.js Version Issues

```bash
# Check Node.js version
node --version

# Switch Node.js versions
nvm use 18
# or
brew unlink node@16 && brew link node@18
```

#### Permission Issues

```bash
# Fix npm permissions
sudo chown -R $(whoami) ~/.npm
sudo chown -R $(whoami) /usr/local/lib/node_modules
```

#### Port Conflicts

```bash
# Find process using port
lsof -i :8080

# Kill process
kill -9 [PID]

# Or use different port
PORT=8081 npm run dev
```

#### Docker Issues

```bash
# Reset Docker
docker system prune -a

# Restart Docker Desktop
killall Docker && open -a Docker
```

### 12.2 Environment Issues

```bash
# Check environment variables
env | grep NODE
env | grep GCP

# Reload environment
source .env

# Check shell configuration
echo $SHELL
cat ~/.zshrc | grep -i node
```

### 12.3 Network Issues

```bash
# Check network connectivity
ping google.com
curl -I https://github.com

# Check DNS
nslookup github.com

# Reset network
sudo dscacheutil -flushcache
sudo killall -HUP mDNSResponder
```

## ✅ Step 13: Verification Checklist

### 13.1 Installation Verification

- [ ] Node.js 18+ installed and working
- [ ] npm 8+ installed and working
- [ ] Git configured with user information
- [ ] VS Code/Cursor installed with extensions
- [ ] 1Password CLI installed and authenticated
- [ ] Google Cloud CLI installed and authenticated
- [ ] Docker installed and running

### 13.2 Repository Verification

- [ ] Repository cloned successfully
- [ ] Dependencies installed (`npm install`)
- [ ] Environment variables configured
- [ ] Playwright installed
- [ ] Tests passing (`npm test`)
- [ ] Linting passing (`npm run lint`)
- [ ] Build successful (`npm run build`)

### 13.3 Service Verification

- [ ] Backend services start (`npm run dev:backend`)
- [ ] Frontend services start (`npm run dev:frontend`)
- [ ] Health checks pass
- [ ] Applications accessible in browser
- [ ] Docker services working
- [ ] CI/CD pipeline functional

### 13.4 Development Verification

- [ ] Debugging configuration working
- [ ] Logging visible and useful
- [ ] Hot reload working
- [ ] Error handling visible
- [ ] Performance monitoring active
- [ ] Secret management working

## 🎉 Success

You now have a complete development environment for the Liv Hana E2E Mission! You can:

- ✅ **Develop locally** with hot reload
- ✅ **Run tests** and verify code quality
- ✅ **Debug issues** with proper tooling
- ✅ **Deploy to staging** for testing
- ✅ **Contribute code** following standards
- ✅ **Troubleshoot problems** effectively

### Next Steps

1. **Complete the [Onboarding Guide](./ONBOARDING_GUIDE.md)**
2. **Pick up your first issue** from the backlog
3. **Join team meetings** to understand current priorities
4. **Start contributing** to the mission

### Maintenance

- **Update dependencies** regularly (`npm update`)
- **Keep tools updated** (`brew update && brew upgrade`)
- **Monitor system resources** (RAM, disk space)
- **Backup important configurations**

---

**Last Updated**: 2025-10-06  
**Version**: 1.0.0  
**Next Review**: 2025-11-06
