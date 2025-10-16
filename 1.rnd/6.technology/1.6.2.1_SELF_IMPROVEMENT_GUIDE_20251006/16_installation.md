### Installation

1. **Install Dependencies**

```bash
cd backend/reasoning-gateway
npm install @anthropic-ai/sdk
```

2. **Setup BigQuery Tables** (if not already done)

```sql
-- Create learning dataset
CREATE SCHEMA IF NOT EXISTS ai_learning;

-- Customer interactions table
CREATE TABLE IF NOT EXISTS ai_learning.customer_interactions (
  customer_id STRING,
  interaction_type STRING,
  message STRING,
  response STRING,
  metadata JSON,
  sentiment_score FLOAT64,
  outcome STRING,
  timestamp TIMESTAMP
);

-- Performance metrics table
CREATE TABLE IF NOT EXISTS performance.api_metrics (
  endpoint STRING,
  response_time_ms INT64,
  error_rate FLOAT64,
  timestamp TIMESTAMP
);

-- Error logs table
CREATE TABLE IF NOT EXISTS logs.error_logs (
  error_message STRING,
  error_stack STRING,
  endpoint STRING,
  timestamp TIMESTAMP
);
```

3. **Setup Cron Jobs**

```bash
cd backend/reasoning-gateway/scripts
chmod +x setup-cron.sh run-improvement-cycle.js
./setup-cron.sh
```

4. **Setup Systemd Service** (for production)

```bash
# Copy service files
sudo cp scripts/livhana-improvement.service /etc/systemd/system/
sudo cp scripts/livhana-improvement.timer /etc/systemd/system/

# Enable and start
sudo systemctl daemon-reload
sudo systemctl enable livhana-improvement.timer
sudo systemctl start livhana-improvement.timer

# Check status
sudo systemctl status livhana-improvement.timer
```

5. **Start the Reasoning Gateway**

```bash
npm start
```
