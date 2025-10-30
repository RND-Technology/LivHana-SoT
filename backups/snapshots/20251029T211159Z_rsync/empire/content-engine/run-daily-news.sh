#!/bin/bash

################################################################################
# DAILY CANNABIS NEWS AUTOMATION SCRIPT
#
# This script runs the news ingestion pipeline daily.
# Add to crontab for automated execution:
#
# Example crontab entry (runs daily at 9 AM):
# 0 9 * * * /path/to/empire/content-engine/run-daily-news.sh >> /path/to/logs/news-pipeline.log 2>&1
#
# Or for multiple times per day:
# 0 9,15,21 * * * /path/to/empire/content-engine/run-daily-news.sh
################################################################################

# Configuration
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PIPELINE_SCRIPT="${SCRIPT_DIR}/news-ingestion-pipeline.mjs"
LOG_DIR="${SCRIPT_DIR}/output/news/logs"
TODAY=$(date +%Y-%m-%d)
TIMESTAMP=$(date +%Y-%m-%d_%H-%M-%S)

# Ensure log directory exists
mkdir -p "${LOG_DIR}"

# Log file
LOG_FILE="${LOG_DIR}/pipeline-${TIMESTAMP}.log"

# Function to log messages
log() {
    echo "[$(date +'%Y-%m-%d %H:%M:%S')] $1" | tee -a "${LOG_FILE}"
}

# Start execution
log "========================================"
log "CANNABIS NEWS PIPELINE - DAILY RUN"
log "========================================"
log "Script Directory: ${SCRIPT_DIR}"
log "Pipeline Script: ${PIPELINE_SCRIPT}"
log "Date: ${TODAY}"
log "Timestamp: ${TIMESTAMP}"
log ""

# Check if Node.js is available
if ! command -v node &> /dev/null; then
    log "ERROR: Node.js is not installed or not in PATH"
    exit 1
fi

log "Node.js version: $(node --version)"
log ""

# Check if pipeline script exists
if [ ! -f "${PIPELINE_SCRIPT}" ]; then
    log "ERROR: Pipeline script not found at ${PIPELINE_SCRIPT}"
    exit 1
fi

# Change to script directory
cd "${SCRIPT_DIR}" || exit 1

# Run the pipeline
log "Starting news ingestion pipeline..."
log ""

if node "${PIPELINE_SCRIPT}" >> "${LOG_FILE}" 2>&1; then
    log ""
    log "✓ Pipeline execution completed successfully"
    EXIT_CODE=0
else
    log ""
    log "✗ Pipeline execution failed with exit code $?"
    EXIT_CODE=1
fi

log ""
log "Log saved to: ${LOG_FILE}"
log "========================================"

# Optional: Send notification (uncomment and configure as needed)
# If you want to send Slack notifications, email, etc.
# if [ $EXIT_CODE -eq 0 ]; then
#     # Success notification
#     curl -X POST -H 'Content-type: application/json' \
#         --data '{"text":"Cannabis News Pipeline completed successfully for '"${TODAY}"'"}' \
#         YOUR_SLACK_WEBHOOK_URL
# else
#     # Failure notification
#     curl -X POST -H 'Content-type: application/json' \
#         --data '{"text":"⚠️ Cannabis News Pipeline FAILED for '"${TODAY}"'"}' \
#         YOUR_SLACK_WEBHOOK_URL
# fi

# Optional: Clean up old logs (keep last 30 days)
find "${LOG_DIR}" -name "pipeline-*.log" -type f -mtime +30 -delete 2>/dev/null

exit $EXIT_CODE
