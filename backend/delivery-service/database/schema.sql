-- DELIVERY SERVICE DATABASE SCHEMA
--
-- Created: 2025-10-04
-- Purpose: Store delivery records for multi-provider orchestration

-- Deliveries table
CREATE TABLE IF NOT EXISTS deliveries (
  id SERIAL PRIMARY KEY,

  -- Order details
  order_id VARCHAR(255) UNIQUE NOT NULL,
  lightspeed_order_id VARCHAR(255),

  -- Provider details
  provider VARCHAR(50) NOT NULL, -- 'doordash', 'uber', 'roadie', 'goshare'
  provider_delivery_id VARCHAR(255) UNIQUE NOT NULL,

  -- Customer details
  customer_id VARCHAR(255),
  customer_name VARCHAR(255) NOT NULL,
  customer_phone VARCHAR(50) NOT NULL,
  customer_email VARCHAR(255),

  -- Addresses
  pickup_address TEXT NOT NULL,
  pickup_lat DECIMAL(10, 8),
  pickup_lng DECIMAL(11, 8),

  dropoff_address TEXT NOT NULL,
  dropoff_lat DECIMAL(10, 8),
  dropoff_lng DECIMAL(11, 8),
  dropoff_instructions TEXT,

  -- Delivery details
  distance_miles DECIMAL(6, 2),
  zone VARCHAR(50),

  -- Status tracking
  status VARCHAR(50) NOT NULL, -- 'created', 'assigned', 'picked_up', 'in_transit', 'delivered', 'cancelled', 'failed'
  tracking_url TEXT,
  estimated_delivery_time TIMESTAMP,
  actual_delivery_time TIMESTAMP,

  -- Driver details (updated via webhooks)
  driver_name VARCHAR(255),
  driver_phone VARCHAR(50),
  driver_location_lat DECIMAL(10, 8),
  driver_location_lng DECIMAL(11, 8),
  driver_location_updated_at TIMESTAMP,

  -- Pricing
  delivery_fee DECIMAL(10, 2) NOT NULL,
  provider_cost DECIMAL(10, 2),
  order_total DECIMAL(10, 2) NOT NULL,

  -- Timestamps
  created_at TIMESTAMP NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP NOT NULL DEFAULT NOW(),
  completed_at TIMESTAMP,
  cancelled_at TIMESTAMP,

  -- Metadata
  cancellation_reason TEXT,
  error_message TEXT,
  raw_provider_response JSONB,

  -- Indexes for common queries
  INDEX idx_order_id (order_id),
  INDEX idx_provider_delivery_id (provider_delivery_id),
  INDEX idx_customer_phone (customer_phone),
  INDEX idx_status (status),
  INDEX idx_created_at (created_at),
  INDEX idx_estimated_delivery_time (estimated_delivery_time)
);

-- Delivery status history
CREATE TABLE IF NOT EXISTS delivery_status_history (
  id SERIAL PRIMARY KEY,
  delivery_id INTEGER NOT NULL REFERENCES deliveries(id) ON DELETE CASCADE,

  status VARCHAR(50) NOT NULL,
  provider_status VARCHAR(100),

  driver_location_lat DECIMAL(10, 8),
  driver_location_lng DECIMAL(11, 8),

  notes TEXT,
  raw_webhook_payload JSONB,

  created_at TIMESTAMP NOT NULL DEFAULT NOW(),

  INDEX idx_delivery_id (delivery_id),
  INDEX idx_created_at (created_at)
);

-- Provider performance metrics
CREATE TABLE IF NOT EXISTS provider_metrics (
  id SERIAL PRIMARY KEY,

  provider VARCHAR(50) NOT NULL,
  date DATE NOT NULL,

  -- Volume
  total_deliveries INTEGER DEFAULT 0,
  successful_deliveries INTEGER DEFAULT 0,
  cancelled_deliveries INTEGER DEFAULT 0,
  failed_deliveries INTEGER DEFAULT 0,

  -- Performance
  avg_delivery_time_minutes INTEGER,
  avg_cost DECIMAL(10, 2),
  avg_distance_miles DECIMAL(6, 2),

  -- Reliability
  on_time_deliveries INTEGER DEFAULT 0,
  late_deliveries INTEGER DEFAULT 0,

  created_at TIMESTAMP NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP NOT NULL DEFAULT NOW(),

  UNIQUE (provider, date),
  INDEX idx_provider_date (provider, date)
);

-- Zone performance (for zone-based pricing optimization)
CREATE TABLE IF NOT EXISTS zone_metrics (
  id SERIAL PRIMARY KEY,

  zone VARCHAR(50) NOT NULL,
  date DATE NOT NULL,

  total_deliveries INTEGER DEFAULT 0,
  avg_delivery_time_minutes INTEGER,
  avg_cost DECIMAL(10, 2),

  created_at TIMESTAMP NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP NOT NULL DEFAULT NOW(),

  UNIQUE (zone, date),
  INDEX idx_zone_date (zone, date)
);

-- Customer delivery preferences
CREATE TABLE IF NOT EXISTS customer_preferences (
  id SERIAL PRIMARY KEY,

  customer_id VARCHAR(255) UNIQUE NOT NULL,
  customer_phone VARCHAR(50) UNIQUE NOT NULL,

  -- Preferences
  preferred_provider VARCHAR(50),
  default_address TEXT,
  default_instructions TEXT,

  -- History
  total_deliveries INTEGER DEFAULT 0,
  last_delivery_at TIMESTAMP,

  -- Contact preferences
  sms_notifications BOOLEAN DEFAULT TRUE,
  email_notifications BOOLEAN DEFAULT TRUE,

  created_at TIMESTAMP NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP NOT NULL DEFAULT NOW(),

  INDEX idx_customer_id (customer_id),
  INDEX idx_customer_phone (customer_phone)
);

-- Create update trigger for updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_deliveries_updated_at
BEFORE UPDATE ON deliveries
FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_provider_metrics_updated_at
BEFORE UPDATE ON provider_metrics
FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_zone_metrics_updated_at
BEFORE UPDATE ON zone_metrics
FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_customer_preferences_updated_at
BEFORE UPDATE ON customer_preferences
FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column();

-- Create views for common queries

-- Active deliveries view
CREATE OR REPLACE VIEW active_deliveries AS
SELECT
  d.*,
  EXTRACT(EPOCH FROM (NOW() - d.created_at))/60 AS minutes_since_created,
  EXTRACT(EPOCH FROM (d.estimated_delivery_time - NOW()))/60 AS minutes_until_estimated_delivery
FROM deliveries d
WHERE d.status IN ('created', 'assigned', 'picked_up', 'in_transit')
ORDER BY d.estimated_delivery_time ASC;

-- Provider performance summary
CREATE OR REPLACE VIEW provider_performance_summary AS
SELECT
  p.provider,
  SUM(p.total_deliveries) AS total_deliveries,
  SUM(p.successful_deliveries) AS successful_deliveries,
  ROUND(AVG(p.avg_delivery_time_minutes), 2) AS avg_delivery_time_minutes,
  ROUND(AVG(p.avg_cost), 2) AS avg_cost,
  ROUND(100.0 * SUM(p.on_time_deliveries) / NULLIF(SUM(p.total_deliveries), 0), 2) AS on_time_percentage
FROM provider_metrics p
WHERE p.date >= CURRENT_DATE - INTERVAL '30 days'
GROUP BY p.provider
ORDER BY on_time_percentage DESC;

-- Daily delivery summary
CREATE OR REPLACE VIEW daily_delivery_summary AS
SELECT
  DATE(d.created_at) AS delivery_date,
  d.provider,
  COUNT(*) AS total_deliveries,
  COUNT(*) FILTER (WHERE d.status = 'delivered') AS successful_deliveries,
  COUNT(*) FILTER (WHERE d.status = 'cancelled') AS cancelled_deliveries,
  COUNT(*) FILTER (WHERE d.status = 'failed') AS failed_deliveries,
  ROUND(AVG(d.distance_miles), 2) AS avg_distance,
  ROUND(AVG(d.delivery_fee), 2) AS avg_fee,
  ROUND(SUM(d.delivery_fee), 2) AS total_revenue
FROM deliveries d
GROUP BY DATE(d.created_at), d.provider
ORDER BY delivery_date DESC, d.provider;

-- Schema complete
-- Run: psql -U postgres -d livhana_delivery < schema.sql
