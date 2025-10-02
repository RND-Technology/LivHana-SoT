"""
Production Database Models for Cannabis E-Commerce
SQLAlchemy models for sessions, OAuth tokens, compliance tracking, and audit trails
"""

import os
import uuid
from datetime import datetime, timedelta
from typing import Optional, List, Dict, Any
from sqlalchemy import create_engine, Column, String, DateTime, Integer, Boolean, Text, Numeric, JSON, Index
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker, Session
from sqlalchemy.dialects.postgresql import UUID, JSONB
import logging

logger = logging.getLogger(__name__)

# Database configuration
DATABASE_URL = os.getenv("DATABASE_URL")
if not DATABASE_URL:
    raise ValueError("DATABASE_URL environment variable is required")

# Create SQLAlchemy engine with production settings
engine = create_engine(
    DATABASE_URL,
    pool_size=20,
    max_overflow=0,
    pool_recycle=3600,  # Recycle connections after 1 hour
    pool_pre_ping=True,  # Verify connections before use
    echo=os.getenv("DEBUG", "false").lower() == "true"
)

SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
Base = declarative_base()

class BaseModel(Base):
    """Base model with common fields"""
    __abstract__ = True
    
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow, nullable=False)

class UserSession(BaseModel):
    """Secure user sessions with signed cookies"""
    __tablename__ = "user_sessions"
    
    session_id = Column(String(128), unique=True, nullable=False, index=True)
    user_id = Column(String(128), nullable=True)  # Optional user binding
    ip_address = Column(String(45), nullable=True)  # IPv4 or IPv6
    user_agent = Column(Text, nullable=True)
    csrf_token = Column(String(64), nullable=False)
    expires_at = Column(DateTime, nullable=False)
    active = Column(Boolean, default=True, nullable=False)
    
    # Session data as JSON
    data = Column(JSONB, nullable=True)
    
    # Security tracking
    login_attempts = Column(Integer, default=0)
    last_activity = Column(DateTime, default=datetime.utcnow)
    
    # Indexes for performance
    __table_args__ = (
        Index('idx_session_active_expires', 'active', 'expires_at'),
        Index('idx_session_user_active', 'user_id', 'active'),
    )

class OAuthState(BaseModel):
    """OAuth2 state tracking with PKCE"""
    __tablename__ = "oauth_states"
    
    state = Column(String(64), unique=True, nullable=False, index=True)
    session_id = Column(String(128), nullable=False)
    code_verifier = Column(String(128), nullable=False)
    code_challenge = Column(String(64), nullable=False)
    redirect_uri = Column(Text, nullable=False)
    scope = Column(String(512), nullable=False)
    expires_at = Column(DateTime, nullable=False)
    used = Column(Boolean, default=False)
    
    # Security tracking
    ip_address = Column(String(45), nullable=True)
    user_agent = Column(Text, nullable=True)

class OAuthToken(BaseModel):
    """OAuth2 access and refresh tokens"""
    __tablename__ = "oauth_tokens"
    
    user_id = Column(String(128), nullable=False, index=True)
    session_id = Column(String(128), nullable=False)
    
    # Token data
    access_token = Column(Text, nullable=False)
    refresh_token = Column(Text, nullable=True)
    token_type = Column(String(32), default="Bearer")
    expires_at = Column(DateTime, nullable=False)
    
    # LightSpeed specific
    account_id = Column(String(128), nullable=False)
    scope = Column(String(512), nullable=False)
    
    # Token management
    active = Column(Boolean, default=True)
    refresh_count = Column(Integer, default=0)
    last_refreshed = Column(DateTime, nullable=True)
    
    # Indexes
    __table_args__ = (
        Index('idx_token_user_active', 'user_id', 'active'),
        Index('idx_token_expires', 'expires_at'),
    )

class Customer(BaseModel):
    """Customer information with age verification"""
    __tablename__ = "customers"
    
    customer_id = Column(String(128), unique=True, nullable=False, index=True)
    
    # Personal information
    first_name = Column(String(128), nullable=True)
    last_name = Column(String(128), nullable=True)
    email = Column(String(256), nullable=True, index=True)
    phone = Column(String(32), nullable=True)
    
    # Age verification
    date_of_birth = Column(DateTime, nullable=True)  # Store as date for age calculation
    age_verified = Column(Boolean, default=False)
    id_verified = Column(Boolean, default=False)
    id_verification_date = Column(DateTime, nullable=True)
    
    # Address
    address_line_1 = Column(String(256), nullable=True)
    address_line_2 = Column(String(256), nullable=True)
    city = Column(String(128), nullable=True)
    state = Column(String(32), nullable=True)
    zip_code = Column(String(16), nullable=True)
    country = Column(String(2), default="US")
    
    # Status
    active = Column(Boolean, default=True)
    membership_id = Column(String(128), nullable=True, index=True)
    
    # Indexes
    __table_args__ = (
        Index('idx_customer_verified', 'age_verified', 'id_verified', 'active'),
    )

class FreeGramTransaction(BaseModel):
    """Free gram program transaction tracking"""
    __tablename__ = "free_gram_transactions"
    
    customer_id = Column(String(128), nullable=False, index=True)
    item_id = Column(String(128), nullable=False)
    item_name = Column(String(256), nullable=False)
    
    # Transaction details
    quantity = Column(Integer, default=1)
    original_price = Column(Numeric(10, 2), nullable=False)
    discount_amount = Column(Numeric(10, 2), nullable=False)
    final_price = Column(Numeric(10, 2), default=0.00)
    
    # Compliance tracking
    thc_content = Column(String(32), nullable=True)
    compliance_checked = Column(Boolean, default=True)
    age_verified = Column(Boolean, default=True)
    
    # LightSpeed integration
    lightspeed_sale_id = Column(String(128), nullable=True)
    lightspeed_transaction_id = Column(String(128), nullable=True)
    
    # Program tracking
    transaction_date = Column(DateTime, default=datetime.utcnow)
    program_type = Column(String(32), default="daily_free_gram")
    
    # Indexes
    __table_args__ = (
        Index('idx_free_gram_customer_date', 'customer_id', 'transaction_date'),
        Index('idx_free_gram_date', 'transaction_date'),
    )

class ComplianceLog(BaseModel):
    """Cannabis compliance audit trail"""
    __tablename__ = "compliance_logs"
    
    # Item information
    item_id = Column(String(128), nullable=False, index=True)
    item_name = Column(String(256), nullable=False)
    
    # Compliance check results
    check_type = Column(String(64), nullable=False)  # thc_content, age_restriction, labeling, etc.
    check_result = Column(String(32), nullable=False)  # passed, failed, warning
    check_details = Column(JSONB, nullable=False)
    
    # Texas hemp law specific
    thc_percentage = Column(Numeric(5, 2), nullable=True)
    thc_limit = Column(Numeric(5, 2), default=0.3)
    
    # Associated transaction
    transaction_id = Column(String(128), nullable=True)
    customer_id = Column(String(128), nullable=True)
    
    # Check metadata
    check_timestamp = Column(DateTime, default=datetime.utcnow)
    checker_version = Column(String(32), nullable=True)
    
    # Indexes
    __table_args__ = (
        Index('idx_compliance_item_result', 'item_id', 'check_result'),
        Index('idx_compliance_timestamp', 'check_timestamp'),
        Index('idx_compliance_customer', 'customer_id'),
    )

class PaymentTransaction(BaseModel):
    """Payment transaction records"""
    __tablename__ = "payment_transactions"
    
    # Transaction identifiers
    transaction_id = Column(String(128), unique=True, nullable=False, index=True)
    customer_id = Column(String(128), nullable=False, index=True)
    
    # Payment details
    amount = Column(Numeric(10, 2), nullable=False)
    payment_method = Column(String(32), nullable=False)  # credit_card, debit_card, bank_account
    payment_status = Column(String(32), nullable=False)  # pending, completed, failed, refunded
    
    # Gateway information
    gateway = Column(String(32), nullable=False)  # authorize_net, simulation
    gateway_transaction_id = Column(String(128), nullable=True)
    auth_code = Column(String(32), nullable=True)
    
    # Order information
    order_items = Column(JSONB, nullable=False)
    order_total = Column(Numeric(10, 2), nullable=False)
    
    # Cannabis specific
    cannabis_transaction = Column(Boolean, default=True)
    compliance_verified = Column(Boolean, default=True)
    age_verified = Column(Boolean, default=True)
    
    # Processing information
    processed_at = Column(DateTime, nullable=True)
    failed_reason = Column(Text, nullable=True)
    retry_count = Column(Integer, default=0)
    
    # Refund tracking
    refunded = Column(Boolean, default=False)
    refund_amount = Column(Numeric(10, 2), nullable=True)
    refund_date = Column(DateTime, nullable=True)
    refund_reason = Column(Text, nullable=True)
    
    # Indexes
    __table_args__ = (
        Index('idx_payment_customer_status', 'customer_id', 'payment_status'),
        Index('idx_payment_status_date', 'payment_status', 'created_at'),
        Index('idx_payment_gateway', 'gateway', 'gateway_transaction_id'),
    )

class InventoryMovement(BaseModel):
    """Inventory movement tracking for compliance"""
    __tablename__ = "inventory_movements"
    
    # Item information
    item_id = Column(String(128), nullable=False, index=True)
    item_name = Column(String(256), nullable=False)
    
    # Movement details
    movement_type = Column(String(32), nullable=False)  # sale, adjustment, free_gram, return
    quantity_before = Column(Integer, nullable=False)
    quantity_change = Column(Integer, nullable=False)
    quantity_after = Column(Integer, nullable=False)
    
    # Transaction association
    transaction_id = Column(String(128), nullable=True)
    customer_id = Column(String(128), nullable=True)
    
    # Reason and notes
    reason = Column(String(256), nullable=False)
    notes = Column(Text, nullable=True)
    
    # Employee tracking
    employee_id = Column(String(128), nullable=True)
    
    # LightSpeed synchronization
    lightspeed_synced = Column(Boolean, default=False)
    lightspeed_sync_date = Column(DateTime, nullable=True)
    
    # Indexes
    __table_args__ = (
        Index('idx_inventory_item_date', 'item_id', 'created_at'),
        Index('idx_inventory_type', 'movement_type'),
        Index('idx_inventory_customer', 'customer_id'),
    )

class SystemLog(BaseModel):
    """System audit logs for cannabis retail compliance"""
    __tablename__ = "system_logs"
    
    # Log classification
    log_level = Column(String(16), nullable=False)  # INFO, WARNING, ERROR, CRITICAL
    log_category = Column(String(32), nullable=False)  # oauth, compliance, payment, inventory
    
    # Log content
    message = Column(Text, nullable=False)
    details = Column(JSONB, nullable=True)
    
    # Context
    user_id = Column(String(128), nullable=True)
    customer_id = Column(String(128), nullable=True)
    session_id = Column(String(128), nullable=True)
    transaction_id = Column(String(128), nullable=True)
    
    # Technical context
    ip_address = Column(String(45), nullable=True)
    user_agent = Column(Text, nullable=True)
    endpoint = Column(String(256), nullable=True)
    
    # Indexes
    __table_args__ = (
        Index('idx_log_level_category', 'log_level', 'log_category'),
        Index('idx_log_timestamp', 'created_at'),
        Index('idx_log_user', 'user_id'),
        Index('idx_log_customer', 'customer_id'),
    )

# Database dependency for FastAPI
def get_db():
    """Get database session for FastAPI dependency injection"""
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

# Database initialization
def init_database():
    """Initialize database tables"""
    logger.info("Initializing cannabis e-commerce database...")
    
    try:
        # Create all tables
        Base.metadata.create_all(bind=engine)
        
        # Verify tables were created
        with SessionLocal() as db:
            # Test basic query
            from sqlalchemy import text
            db.execute(text("SELECT 1")).fetchone()
            
        logger.info("✅ Database initialization completed successfully")
        
        # Log table creation
        table_count = len(Base.metadata.tables)
        logger.info(f"Created {table_count} tables: {list(Base.metadata.tables.keys())}")
        
        return True
        
    except Exception as e:
        logger.error(f"❌ Database initialization failed: {e}")
        raise

# Database maintenance
def cleanup_expired_sessions():
    """Clean up expired sessions and OAuth states"""
    with SessionLocal() as db:
        # Clean expired sessions
        expired_sessions = db.query(UserSession).filter(
            UserSession.expires_at < datetime.utcnow()
        ).delete()
        
        # Clean expired OAuth states
        expired_states = db.query(OAuthState).filter(
            OAuthState.expires_at < datetime.utcnow()
        ).delete()
        
        db.commit()
        
        logger.info(f"Cleaned up {expired_sessions} expired sessions and {expired_states} expired OAuth states")
        return expired_sessions + expired_states

def get_database_stats() -> Dict[str, Any]:
    """Get database statistics for monitoring"""
    with SessionLocal() as db:
        stats = {}
        
        # Count records in each table
        for table_name, table_class in {
            "sessions": UserSession,
            "oauth_states": OAuthState,
            "oauth_tokens": OAuthToken,
            "customers": Customer,
            "free_gram_transactions": FreeGramTransaction,
            "compliance_logs": ComplianceLog,
            "payment_transactions": PaymentTransaction,
            "inventory_movements": InventoryMovement,
            "system_logs": SystemLog
        }.items():
            stats[table_name] = db.query(table_class).count()
        
        # Active sessions
        stats["active_sessions"] = db.query(UserSession).filter(
            UserSession.active == True,
            UserSession.expires_at > datetime.utcnow()
        ).count()
        
        # Recent free gram transactions (last 24 hours)
        stats["recent_free_grams"] = db.query(FreeGramTransaction).filter(
            FreeGramTransaction.transaction_date > datetime.utcnow() - timedelta(hours=24)
        ).count()
        
        return stats

# Initialize database on module import
if __name__ == "__main__":
    init_database()
# Last optimized: 2025-10-02
