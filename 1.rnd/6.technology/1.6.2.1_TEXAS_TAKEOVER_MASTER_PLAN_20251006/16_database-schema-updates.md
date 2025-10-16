### DATABASE SCHEMA UPDATES

**New Tables Required:**

```sql
-- Customer Verification Status
CREATE TABLE customer_verification (
  id SERIAL PRIMARY KEY,
  customer_email VARCHAR(255) UNIQUE NOT NULL,
  customer_phone VARCHAR(20),
  veriff_approved BOOLEAN DEFAULT FALSE,
  veriff_date TIMESTAMP,
  veriff_document_id VARCHAR(255),
  membership_signed BOOLEAN DEFAULT FALSE,
  membership_date TIMESTAMP,
  membership_ip_address VARCHAR(45),
  email_optin BOOLEAN DEFAULT FALSE,
  email_optin_date TIMESTAMP,
  email_optin_source VARCHAR(50),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Order Flags
CREATE TABLE order_verification_flags (
  id SERIAL PRIMARY KEY,
  order_id VARCHAR(50) NOT NULL,
  customer_email VARCHAR(255) NOT NULL,
  flag_type VARCHAR(50) NOT NULL, -- 'veriff_needed', 'membership_needed', 'optin_needed'
  flag_status VARCHAR(20) DEFAULT 'pending', -- 'pending', 'completed', 'refunded'
  auto_refund_date TIMESTAMP NOT NULL,
  reminder_emails_sent INT DEFAULT 0,
  last_reminder_sent TIMESTAMP,
  resolved_at TIMESTAMP,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Loyalty Points
CREATE TABLE loyalty_points (
  id SERIAL PRIMARY KEY,
  customer_email VARCHAR(255) NOT NULL,
  points_earned INT DEFAULT 0,
  points_redeemed INT DEFAULT 0,
  points_balance INT DEFAULT 0,
  last_transaction_date TIMESTAMP,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Loyalty Transactions
CREATE TABLE loyalty_transactions (
  id SERIAL PRIMARY KEY,
  customer_email VARCHAR(255) NOT NULL,
  transaction_type VARCHAR(50), -- 'purchase', 'review', 'referral', 'redemption', 'bonus'
  points_change INT NOT NULL, -- positive for earning, negative for redemption
  order_id VARCHAR(50),
  description TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Referrals
CREATE TABLE referral_tracking (
  id SERIAL PRIMARY KEY,
  referrer_email VARCHAR(255) NOT NULL,
  referred_email VARCHAR(255) NOT NULL,
  referral_code VARCHAR(50) UNIQUE NOT NULL,
  referred_order_id VARCHAR(50),
  referral_status VARCHAR(20) DEFAULT 'pending', -- 'pending', 'completed', 'credited'
  referrer_credit_amount DECIMAL(10,2),
  credited_at TIMESTAMP,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Reviews
CREATE TABLE product_reviews (
  id SERIAL PRIMARY KEY,
  product_id VARCHAR(50) NOT NULL,
  customer_email VARCHAR(255) NOT NULL,
  order_id VARCHAR(50) NOT NULL,
  rating INT NOT NULL CHECK (rating >= 1 AND rating <= 5),
  review_title VARCHAR(255),
  review_text TEXT,
  review_photos JSONB, -- array of photo URLs
  verified_purchase BOOLEAN DEFAULT TRUE,
  loyalty_points_awarded INT DEFAULT 50,
  approved BOOLEAN DEFAULT FALSE,
  moderation_notes TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_customer_email ON customer_verification(customer_email);
CREATE INDEX idx_order_flags ON order_verification_flags(order_id, flag_status);
CREATE INDEX idx_loyalty_customer ON loyalty_points(customer_email);
CREATE INDEX idx_referral_code ON referral_tracking(referral_code);
CREATE INDEX idx_product_reviews ON product_reviews(product_id, approved);
```

---
