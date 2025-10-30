#!/bin/bash

# Colors for output
GREEN='\033[0;32m'
RED='\033[0;31m'
NC='\033[0m'

echo -e "${GREEN}🚀 Starting LivHana Boot Sequence...${NC}"

# Create backup directory for dependencies
BACKUP_DIR="backups/dependencies_$(date +%Y%m%d_%H%M%S)"
mkdir -p "$BACKUP_DIR"

# Install all dependencies locally
echo -e "${GREEN}📦 Installing dependencies...${NC}"
npm install || { echo -e "${RED}Failed to install dependencies${NC}"; exit 1; }

# Backup node_modules
echo -e "${GREEN}💾 Backing up dependencies...${NC}"
cp -r node_modules "$BACKUP_DIR/" || { echo -e "${RED}Failed to backup dependencies${NC}"; exit 1; }
cp package*.json "$BACKUP_DIR/" || { echo -e "${RED}Failed to backup package files${NC}"; exit 1; }

# Build the project
echo -e "${GREEN}🏗️ Building project...${NC}"
npm run build || { echo -e "${RED}Build failed${NC}"; exit 1; }

# Validate environment
echo -e "${GREEN}✅ Validating environment...${NC}"
npm run validate:env || { echo -e "${RED}Environment validation failed${NC}"; exit 1; }

# Start all services in development mode
echo -e "${GREEN}🌟 Starting all services...${NC}"
npm run dev:all

echo -e "${GREEN}✨ LivHana Boot Sequence Complete!${NC}"
