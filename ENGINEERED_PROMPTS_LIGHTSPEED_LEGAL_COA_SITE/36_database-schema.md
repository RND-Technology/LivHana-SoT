### **Database Schema:**
```sql
CREATE TABLE products (
  id SERIAL PRIMARY KEY,
  sku VARCHAR(100) UNIQUE NOT NULL,
  name VARCHAR(255) NOT NULL,
  category VARCHAR(100)
);

CREATE TABLE coas (
  id SERIAL PRIMARY KEY,
  product_id INTEGER REFERENCES products(id),
  batch_number VARCHAR(100) UNIQUE NOT NULL,
  lab_name VARCHAR(255) NOT NULL,
  test_date DATE NOT NULL,
  pdf_url TEXT NOT NULL,
  created_at TIMESTAMP DEFAULT NOW(),
  expires_at DATE NOT NULL
);

CREATE TABLE cannabinoids (
  id SERIAL PRIMARY KEY,
  coa_id INTEGER REFERENCES coas(id),
  name VARCHAR(50) NOT NULL,
  percentage DECIMAL(5,3) NOT NULL,
  unit VARCHAR(10) DEFAULT '%'
);

CREATE TABLE compliance_status (
  id SERIAL PRIMARY KEY,
  coa_id INTEGER REFERENCES coas(id),
  texas_compliant BOOLEAN NOT NULL,
  federal_compliant BOOLEAN NOT NULL,
  all_tests_passed BOOLEAN NOT NULL,
  notes TEXT
);
```
