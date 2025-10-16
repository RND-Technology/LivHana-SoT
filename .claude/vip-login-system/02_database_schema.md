### 2. Database Schema
```sql
-- VIP Users Table
CREATE TABLE vip_users (
    user_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    first_name VARCHAR(100) NOT NULL,
    last_name VARCHAR(100) NOT NULL,
    role VARCHAR(50) NOT NULL CHECK (role IN ('admin', 'manager', 'staff', 'vip')),
    permissions JSONB NOT NULL DEFAULT '[]',
    active BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    last_login TIMESTAMP,
    failed_login_attempts INTEGER DEFAULT 0,
    locked_until TIMESTAMP
);

-- VIP Sessions Table
CREATE TABLE vip_sessions (
    session_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES vip_users(user_id),
    access_token_hash VARCHAR(255) NOT NULL,
    refresh_token_hash VARCHAR(255) NOT NULL,
    ip_address INET,
    user_agent TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    expires_at TIMESTAMP NOT NULL,
    active BOOLEAN DEFAULT true
);

-- VIP Audit Logs Table
CREATE TABLE vip_audit_logs (
    log_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES vip_users(user_id),
    action VARCHAR(100) NOT NULL,
    resource VARCHAR(100) NOT NULL,
    resource_id VARCHAR(255),
    details JSONB,
    ip_address INET,
    user_agent TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- VIP Permissions Table
CREATE TABLE vip_permissions (
    permission_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(100) UNIQUE NOT NULL,
    description TEXT,
    resource VARCHAR(100) NOT NULL,
    action VARCHAR(100) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- VIP Role Permissions Table
CREATE TABLE vip_role_permissions (
    role VARCHAR(50) NOT NULL,
    permission_id UUID REFERENCES vip_permissions(permission_id),
    PRIMARY KEY (role, permission_id)
);

-- Insert default permissions
INSERT INTO vip_permissions (name, description, resource, action) VALUES
('read_customers', 'View customer data', 'customers', 'read'),
('write_customers', 'Modify customer data', 'customers', 'write'),
('read_orders', 'View order data', 'orders', 'read'),
('write_orders', 'Modify order data', 'orders', 'write'),
('read_inventory', 'View inventory data', 'inventory', 'read'),
('write_inventory', 'Modify inventory data', 'inventory', 'write'),
('read_compliance', 'View compliance data', 'compliance', 'read'),
('write_compliance', 'Modify compliance data', 'compliance', 'write'),
('read_analytics', 'View analytics data', 'analytics', 'read'),
('read_dashboard', 'Access dashboard', 'dashboard', 'read'),
('write_dashboard', 'Modify dashboard', 'dashboard', 'write'),
('read_cockpit', 'Access cockpit', 'cockpit', 'read'),
('write_cockpit', 'Modify cockpit', 'cockpit', 'write');

-- Insert default role permissions
INSERT INTO vip_role_permissions (role, permission_id) VALUES
('admin', (SELECT permission_id FROM vip_permissions WHERE name = 'read_customers')),
('admin', (SELECT permission_id FROM vip_permissions WHERE name = 'write_customers')),
('admin', (SELECT permission_id FROM vip_permissions WHERE name = 'read_orders')),
('admin', (SELECT permission_id FROM vip_permissions WHERE name = 'write_orders')),
('admin', (SELECT permission_id FROM vip_permissions WHERE name = 'read_inventory')),
('admin', (SELECT permission_id FROM vip_permissions WHERE name = 'write_inventory')),
('admin', (SELECT permission_id FROM vip_permissions WHERE name = 'read_compliance')),
('admin', (SELECT permission_id FROM vip_permissions WHERE name = 'write_compliance')),
('admin', (SELECT permission_id FROM vip_permissions WHERE name = 'read_analytics')),
('admin', (SELECT permission_id FROM vip_permissions WHERE name = 'read_dashboard')),
('admin', (SELECT permission_id FROM vip_permissions WHERE name = 'write_dashboard')),
('admin', (SELECT permission_id FROM vip_permissions WHERE name = 'read_cockpit')),
('admin', (SELECT permission_id FROM vip_permissions WHERE name = 'write_cockpit'));

-- Insert default VIP user (password: admin123)
INSERT INTO vip_users (email, password_hash, first_name, last_name, role, permissions) VALUES
('admin@reggieanddro.com', '$2b$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewdBPj4Z4qZ4Z4Z4', 'Admin', 'User', 'admin', '["read_customers", "write_customers", "read_orders", "write_orders", "read_inventory", "write_inventory", "read_compliance", "write_compliance", "read_analytics", "read_dashboard", "write_dashboard", "read_cockpit", "write_cockpit"]');
```
