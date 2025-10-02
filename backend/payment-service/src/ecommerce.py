"""
Secure Cannabis E-Commerce Application
Production-ready implementation with database persistence and security hardening
"""

import os
import uuid
import logging
from datetime import datetime, timedelta
from typing import Optional, List, Dict, Any
from decimal import Decimal

from fastapi import FastAPI, HTTPException, Depends, Request, Response, status
from pydantic import BaseModel, validator
from sqlalchemy.orm import Session
import httpx

from .lightspeed_integration import LightSpeedClient
from .cannabis_compliance import CannabisComplianceChecker
from .payment_processor import KAJAPaymentProcessor
from .database import (
    get_db, init_database, Customer, FreeGramTransaction, 
    PaymentTransaction, ComplianceLog, SystemLog, OAuthToken
)
from .production_security import security, limiter, get_current_session, setup_security

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# FastAPI application with security
app = FastAPI(
    title="Reggie & Dro Secure Cannabis Empire API",
    description="Production Cannabis E-Commerce with LightSpeed Integration",
    version="1.0.0"
)

# Setup security middleware
setup_security(app)

# Initialize services
lightspeed_client = LightSpeedClient()
compliance_checker = CannabisComplianceChecker()
payment_processor = KAJAPaymentProcessor()

# Pydantic models
class CustomerVerification(BaseModel):
    customer_id: str
    date_of_birth: str  # YYYY-MM-DD
    id_verified: bool = False

class FreeGramRequest(BaseModel):
    customer_id: str
    membership_id: str
    customer_verification: CustomerVerification

class OrderItem(BaseModel):
    item_id: str
    quantity: int
    price: Optional[Decimal] = None
    
    @validator('quantity')
    def validate_quantity(cls, v):
        if v <= 0:
            raise ValueError('Quantity must be greater than 0')
        return v

class CannabisOrder(BaseModel):
    customer_id: str
    items: List[OrderItem]
    order_type: str = "standard"
    payment_method: Optional[str] = None
    customer_verification: CustomerVerification

class InventoryItem(BaseModel):
    item_id: str
    name: str
    description: str
    thc_content: str
    cbd_content: str
    quantity: int
    price: Decimal
    compliance_status: str
    free_gram_eligible: bool = False

# Database initialization
@app.on_event("startup")
async def startup_event():
    """Initialize secure cannabis e-commerce system"""
    logger.info("🚀 Starting secure cannabis e-commerce system...")
    
    try:
        # Initialize database
        init_database()
        
        # Log startup
        logger.info("✅ Reggie & Dro Cannabis Empire - System Online")
        logger.info(f"Environment: {os.getenv('ENVIRONMENT', 'development')}")
        logger.info(f"LightSpeed Account: {lightspeed_client.account_id}")
        
    except Exception as e:
        logger.error(f"❌ Startup failed: {e}")
        raise

# Helper functions
def create_secure_session(request: Request, response: Response, db: Session, user_id: str = None) -> dict:
    """Create secure session with signed cookies"""
    session_data = security.create_session(request, db, user_id)
    security.set_secure_cookie(response, "session_id", session_data["session_id"])
    return session_data

# Health check
@app.get("/")
async def root():
    """Health check and service status"""
    return {
        "service": "Reggie & Dro Secure Cannabis Empire",
        "status": "operational",
        "timestamp": datetime.now().isoformat(),
        "security": "production_ready",
        "compliance": "texas_hemp_law",
        "business_license": "Texas DSHS License #690"
    }

# OAuth2 endpoints with security
@app.get("/api/lightspeed/oauth/authorize")
@limiter.limit("5/minute")
async def lightspeed_oauth_authorize(
    request: Request, 
    response: Response,
    db: Session = Depends(get_db)
):
    """Secure LightSpeed OAuth2 authorization"""
    try:
        # Create secure session
        session_data = create_secure_session(request, response, db)
        session_id = session_data["session_id"]
        
        # Generate OAuth URL
        auth_data = lightspeed_client.generate_authorization_url(session_id)
        
        # Log OAuth initiation
        log_entry = SystemLog(
            log_level="INFO",
            log_category="oauth",
            message="LightSpeed OAuth2 initiated",
            session_id=session_id,
            ip_address=request.client.host if request.client else "unknown"
        )
        db.add(log_entry)
        db.commit()
        
        return {
            "success": True,
            "authorization_url": auth_data["authorization_url"],
            "csrf_token": session_data["csrf_token"],
            "expires_in": auth_data["expires_in"]
        }
        
    except Exception as e:
        logger.error(f"OAuth authorization failed: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Authorization failed"
        )

@app.get("/api/lightspeed/oauth/callback")
@limiter.limit("10/minute")
async def lightspeed_oauth_callback(
    request: Request,
    code: Optional[str] = None,
    state: Optional[str] = None,
    error: Optional[str] = None,
    db: Session = Depends(get_db)
):
    """Secure OAuth2 callback handler"""
    if error:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Authorization denied: {error}"
        )
    
    if not code or not state:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Authorization code and state required"
        )
    
    # Get session
    session = security.get_session(request, db)
    if not session:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid session"
        )
    
    try:
        # Exchange code for token
        token_cache = await lightspeed_client.exchange_code_for_token(
            code, state, session["session_id"]
        )
        
        # Store token in database
        oauth_token = OAuthToken(
            user_id=session.get("user_id", "system"),
            session_id=session["session_id"],
            access_token=token_cache.access_token,
            refresh_token=token_cache.refresh_token,
            expires_at=token_cache.expires_at,
            account_id=token_cache.account_id,
            scope=lightspeed_client.scope
        )
        db.add(oauth_token)
        
        # Log success
        log_entry = SystemLog(
            log_level="INFO",
            log_category="oauth",
            message=f"OAuth2 completed for account {token_cache.account_id}",
            session_id=session["session_id"],
            details={"account_id": token_cache.account_id}
        )
        db.add(log_entry)
        db.commit()
        
        return {
            "success": True,
            "message": "LightSpeed integration activated",
            "account_id": token_cache.account_id,
            "expires_at": token_cache.expires_at.isoformat()
        }
        
    except Exception as e:
        logger.error(f"OAuth callback failed: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Authentication failed"
        )

# Cannabis inventory with security
@app.get("/api/cannabis/inventory", response_model=List[InventoryItem])
@limiter.limit("30/minute")
async def get_cannabis_inventory(
    request: Request,
    db: Session = Depends(get_db)
):
    """Get compliant cannabis inventory"""
    try:
        # Get inventory from LightSpeed
        raw_items = await lightspeed_client.get_cannabis_inventory()
        
        inventory_items = []
        for raw_item in raw_items:
            # Check compliance
            compliance_result = await compliance_checker.check_item_compliance(raw_item)
            
            # Log compliance check
            compliance_log = ComplianceLog(
                item_id=raw_item.get("itemID"),
                item_name=raw_item.get("description", "Unknown"),
                check_type="inventory_compliance",
                check_result="passed" if compliance_result["compliant"] else "failed",
                check_details=compliance_result["checks"],
                thc_percentage=compliance_result.get("thc_content")
            )
            db.add(compliance_log)
            
            if compliance_result["compliant"]:
                item = InventoryItem(
                    item_id=raw_item.get("itemID"),
                    name=raw_item.get("description", "Unknown Product"),
                    description=raw_item.get("note", ""),
                    thc_content=raw_item.get("customField1", "Not specified"),
                    cbd_content=raw_item.get("customField2", "Not specified"),
                    quantity=int(float(raw_item.get("qtyOnHand", 0))),
                    price=Decimal(str(raw_item.get("defaultCost", 0))),
                    compliance_status="compliant",
                    free_gram_eligible=compliance_checker.is_free_gram_eligible(raw_item)
                )
                inventory_items.append(item)
        
        db.commit()
        return inventory_items
        
    except Exception as e:
        logger.error(f"Failed to fetch inventory: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Inventory unavailable"
        )

# Free gram processing with security
@app.post("/api/cannabis/free-gram-request")
@limiter.limit("3/minute")
async def process_free_gram_request(
    http_request: Request,
    request: FreeGramRequest,
    db: Session = Depends(get_db),
    session: dict = Depends(get_current_session)
):
    """Process secure free gram request"""
    try:
        # Verify customer age
        age_verification = await compliance_checker.verify_customer_age(
            request.customer_verification
        )
        
        if not age_verification["eligible"]:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail=age_verification["reason"]
            )
        
        # Check daily limit
        existing_today = db.query(FreeGramTransaction).filter(
            FreeGramTransaction.customer_id == request.customer_id,
            FreeGramTransaction.transaction_date >= datetime.utcnow().date()
        ).count()
        
        if existing_today >= 1:
            raise HTTPException(
                status_code=status.HTTP_429_TOO_MANY_REQUESTS,
                detail="Daily free gram limit reached"
            )
        
        # Get available products
        inventory = await get_cannabis_inventory(db)
        free_gram_products = [item for item in inventory if item.free_gram_eligible and item.quantity > 10]
        
        if not free_gram_products:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="No free gram products available"
            )
        
        selected_product = free_gram_products[0]
        
        # Process transaction
        free_gram_tx = FreeGramTransaction(
            customer_id=request.customer_id,
            item_id=selected_product.item_id,
            item_name=selected_product.name,
            quantity=1,
            original_price=selected_product.price,
            discount_amount=selected_product.price,
            final_price=Decimal('0.00'),
            thc_content=selected_product.thc_content,
            compliance_checked=True,
            age_verified=True,
            program_type="daily_free_gram"
        )
        
        db.add(free_gram_tx)
        db.commit()
        
        logger.info(f"Free gram processed for customer {request.customer_id}")
        
        return {
            "success": True,
            "message": "Free gram processed successfully",
            "product": {
                "name": selected_product.name,
                "thc_content": selected_product.thc_content
            },
            "next_available": (datetime.now() + timedelta(days=1)).isoformat()
        }
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Free gram processing failed: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Processing failed"
        )

# Admin endpoints with authentication
@app.get("/api/admin/status")
async def admin_status(
    db: Session = Depends(get_db),
    session: dict = Depends(get_current_session)
):
    """Admin system status with authentication"""
    from .database import get_database_stats
    
    stats = get_database_stats()
    token_info = lightspeed_client.get_token_info()
    
    return {
        "system_status": "operational",
        "database_stats": stats,
        "lightspeed_integration": {
            "authenticated": token_info is not None,
            "account_id": lightspeed_client.account_id
        },
        "security": {
            "sessions_active": stats.get("active_sessions", 0),
            "environment": os.getenv("ENVIRONMENT", "development")
        }
    }

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
# Last optimized: 2025-10-02
