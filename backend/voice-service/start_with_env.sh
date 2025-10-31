#!/bin/bash

# Load environment from .env file
set -a
source .env
set +a

echo "Starting voice service with API key (length: ${#OPENAI_API_KEY})"

# Start the service
npm start
