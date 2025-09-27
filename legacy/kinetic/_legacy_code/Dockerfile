# LivHana-SoT: Sovereign AI Agent Swarm
# Production-grade Docker container with local LLM integration

FROM python:3.11-slim

# Set working directory
WORKDIR /app

# Install system dependencies
RUN apt-get update && apt-get install -y \
    build-essential \
    curl \
    git \
    && rm -rf /var/lib/apt/lists/*

# Install Python dependencies
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Copy application code
COPY src/ ./src/
COPY lib/ ./lib/
COPY monitoring/ ./monitoring/
COPY *.py ./

# Create directories for logs and data
RUN mkdir -p /app/logs /app/data /app/models

# Set environment variables
ENV PYTHONPATH=/app
ENV LIVHANA_ENV=production
ENV LLM_BASE_URL=http://localhost:8080/v1
ENV METRICS_PORT=8000

# Expose ports
EXPOSE 8000 8080

# Health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=5s --retries=3 \
    CMD curl -f http://localhost:8000/health || exit 1

# Start command
CMD ["python", "main.py"]
