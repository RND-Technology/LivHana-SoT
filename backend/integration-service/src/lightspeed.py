"""
LightSpeed R-Series OAuth2 + PKCE Integration
Handles secure authentication, token management, and API calls for cannabis e-commerce
"""

import os
import json
import base64
import hashlib
import secrets
from datetime import datetime, timedelta
from typing import Optional, Dict, Any, List
from urllib.parse import urlencode
import httpx
from pydantic import BaseModel
import logging

logger = logging.getLogger(__name__)

class TokenCache(BaseModel):
    access_token: str
    refresh_token: Optional[str] = None
    expires_at: datetime
    token_type: str = "Bearer"
    account_id: str
    created_at: datetime

class OAuthState(BaseModel):
    state: str
    code_verifier: str
    session_id: str
    created_at: datetime
    expires_at: datetime

class LightSpeedClient:
    """
    Production-ready LightSpeed R-Series OAuth2 client with PKCE and secure token management
    """
    
    def __init__(self):
        # R-Series OAuth2 configuration
        self.client_id = os.getenv("LIGHTSPEED_CLIENT_ID")
        self.client_secret = os.getenv("LIGHTSPEED_CLIENT_SECRET") 
        self.account_id = os.getenv("LIGHTSPEED_ACCOUNT_ID")
        self.redirect_uri = os.getenv("LIGHTSPEED_REDIRECT_URI", "http://localhost:8000/api/lightspeed/oauth/callback")
        
        # R-Series API endpoints
        self.auth_base_url = "https://cloud.lightspeedapp.com/oauth"
        self.api_base_url = f"https://api.lightspeedapp.com/API/V3/Account/{self.account_id}"
        
        # OAuth2 scopes for cannabis retail operations
        self.scope = "employee:register employee:inventory employee:products employee:sales"
        
        # Secure token and state storage (in production, use Redis/database)
        self._token_cache: Optional[TokenCache] = None
        self._pending_states: Dict[str, OAuthState] = {}
        
        # Validate required configuration
        self._validate_config()
    
    def _validate_config(self):
        """Validate required environment variables are present"""
        required_vars = ["LIGHTSPEED_CLIENT_ID", "LIGHTSPEED_CLIENT_SECRET", "LIGHTSPEED_ACCOUNT_ID"]
        missing_vars = [var for var in required_vars if not os.getenv(var)]
        
        if missing_vars:
            raise ValueError(f"Missing required environment variables: {', '.join(missing_vars)}")
    
    def _generate_pkce_pair(self) -> tuple[str, str]:
        """Generate PKCE code verifier and challenge for enhanced OAuth2 security"""
        # Generate 128 character code verifier
        code_verifier = base64.urlsafe_b64encode(secrets.token_bytes(96)).decode('utf-8').rstrip('=')
        
        # Generate SHA256 challenge
        code_challenge = base64.urlsafe_b64encode(
            hashlib.sha256(code_verifier.encode('utf-8')).digest()
        ).decode('utf-8').rstrip('=')
        
        return code_verifier, code_challenge
    
    def _cleanup_expired_states(self):
        """Remove expired OAuth2 states for security maintenance"""
        now = datetime.now()
        expired_states = [
            state for state, data in self._pending_states.items()
            if data.expires_at < now
        ]
        for state in expired_states:
            del self._pending_states[state]
    
    def generate_authorization_url(self, session_id: str) -> Dict[str, str]:
        """
        Generate secure authorization URL with PKCE and state validation
        
        Args:
            session_id: Unique session identifier for CSRF protection
            
        Returns:
            Dict containing authorization URL and state parameters
        """
        if not session_id:
            raise ValueError("Session ID required for secure OAuth2 flow")
        
        # Generate PKCE pair and state
        code_verifier, code_challenge = self._generate_pkce_pair()
        state = secrets.token_urlsafe(32)
        
        # Store state securely with session binding
        oauth_state = OAuthState(
            state=state,
            code_verifier=code_verifier,
            session_id=session_id,
            created_at=datetime.now(),
            expires_at=datetime.now() + timedelta(minutes=10)
        )
        self._pending_states[state] = oauth_state
        
        # Clean up expired states
        self._cleanup_expired_states()
        
        # Build authorization URL
        auth_params = {
            "response_type": "code",
            "client_id": self.client_id,
            "scope": self.scope,
            "redirect_uri": self.redirect_uri,
            "state": state,
            "code_challenge": code_challenge,
            "code_challenge_method": "S256"
        }
        
        authorization_url = f"{self.auth_base_url}/authorize.php?{urlencode(auth_params)}"
        
        logger.info(f"Generated authorization URL for session {session_id}")
        
        return {
            "authorization_url": authorization_url,
            "state": state,
            "expires_in": 600  # 10 minutes
        }
    
    async def exchange_code_for_token(self, authorization_code: str, state: str, session_id: str) -> TokenCache:
        """
        Exchange authorization code for access token with comprehensive security validation
        
        Args:
            authorization_code: OAuth2 authorization code from callback
            state: OAuth2 state parameter for CSRF protection
            session_id: Session ID for validation
            
        Returns:
            TokenCache containing access and refresh tokens
        """
        # Validate state exists and matches session
        if state not in self._pending_states:
            raise ValueError("Invalid or expired OAuth2 state - possible CSRF attack")
        
        oauth_state = self._pending_states[state]
        
        # Verify session matches (prevent session fixation)
        if oauth_state.session_id != session_id:
            raise ValueError("Session mismatch - possible attack detected")
        
        # Check state expiration
        if datetime.now() > oauth_state.expires_at:
            del self._pending_states[state]
            raise ValueError("OAuth2 state expired - please restart authentication")
        
        # Remove used state (single use)
        code_verifier = oauth_state.code_verifier
        del self._pending_states[state]
        
        # Prepare token exchange request
        token_data = {
            "grant_type": "authorization_code",
            "client_id": self.client_id,
            "client_secret": self.client_secret,
            "code": authorization_code,
            "redirect_uri": self.redirect_uri,
            "code_verifier": code_verifier  # PKCE verification
        }
        
        async with httpx.AsyncClient(timeout=30.0) as client:
            try:
                response = await client.post(
                    f"{self.auth_base_url}/access_token.php",
                    data=token_data,
                    headers={"Content-Type": "application/x-www-form-urlencoded"}
                )
                response.raise_for_status()
                token_response = response.json()
                
                if "access_token" not in token_response:
                    raise ValueError("No access token in response")
                
                # Create token cache
                expires_in = token_response.get("expires_in", 3600)
                token_cache = TokenCache(
                    access_token=token_response["access_token"],
                    refresh_token=token_response.get("refresh_token"),
                    expires_at=datetime.now() + timedelta(seconds=expires_in),
                    token_type=token_response.get("token_type", "Bearer"),
                    account_id=self.account_id,
                    created_at=datetime.now()
                )
                
                self._token_cache = token_cache
                
                logger.info(f"OAuth2 token exchange successful for account {self.account_id}")
                return token_cache
                
            except httpx.HTTPError as e:
                logger.error(f"Token exchange failed: {e}")
                raise ValueError("Authentication failed - please try again")
    
    async def refresh_access_token(self) -> Optional[TokenCache]:
        """
        Refresh access token using refresh token with rotation support
        
        Returns:
            Updated TokenCache or None if refresh fails
        """
        if not self._token_cache or not self._token_cache.refresh_token:
            logger.warning("No refresh token available")
            return None
        
        refresh_data = {
            "grant_type": "refresh_token",
            "client_id": self.client_id,
            "client_secret": self.client_secret,
            "refresh_token": self._token_cache.refresh_token
        }
        
        async with httpx.AsyncClient(timeout=30.0) as client:
            try:
                response = await client.post(
                    f"{self.auth_base_url}/access_token.php",
                    data=refresh_data,
                    headers={"Content-Type": "application/x-www-form-urlencoded"}
                )
                response.raise_for_status()
                token_response = response.json()
                
                if "access_token" not in token_response:
                    logger.error("No access token in refresh response")
                    return None
                
                # Update token cache with new tokens
                expires_in = token_response.get("expires_in", 3600)
                self._token_cache.access_token = token_response["access_token"]
                self._token_cache.expires_at = datetime.now() + timedelta(seconds=expires_in)
                
                # Update refresh token if rotated
                if "refresh_token" in token_response:
                    self._token_cache.refresh_token = token_response["refresh_token"]
                
                logger.info("Access token refreshed successfully")
                return self._token_cache
                
            except httpx.HTTPError as e:
                logger.error(f"Token refresh failed: {e}")
                self._token_cache = None
                return None
    
    async def _ensure_valid_token(self) -> bool:
        """Ensure we have a valid access token, refreshing if needed"""
        if not self._token_cache:
            logger.warning("No token cache available")
            return False
        
        # Check if token expires in next 5 minutes
        if datetime.now() + timedelta(minutes=5) >= self._token_cache.expires_at:
            logger.info("Token expiring soon, attempting refresh")
            refreshed = await self.refresh_access_token()
            return refreshed is not None
        
        return True
    
    async def api_request(
        self, 
        endpoint: str, 
        method: str = "GET", 
        data: Optional[Dict[str, Any]] = None,
        retries: int = 3
    ) -> Dict[str, Any]:
        """
        Make authenticated API request to LightSpeed R-Series with retry logic
        
        Args:
            endpoint: API endpoint (e.g., "/Item")
            method: HTTP method
            data: Request data for POST/PUT
            retries: Number of retry attempts for failed requests
            
        Returns:
            API response data
        """
        if not await self._ensure_valid_token():
            raise ValueError("No valid access token available")
        
        # Ensure endpoint format for R-Series
        clean_endpoint = endpoint if endpoint.startswith("/") else f"/{endpoint}"
        if not clean_endpoint.endswith(".json"):
            clean_endpoint = f"{clean_endpoint}.json"
        
        url = f"{self.api_base_url}{clean_endpoint}"
        headers = {
            "Authorization": f"Bearer {self._token_cache.access_token}",
            "Content-Type": "application/json",
            "Accept": "application/json"
        }
        
        for attempt in range(retries + 1):
            async with httpx.AsyncClient(timeout=30.0) as client:
                try:
                    if method.upper() == "GET":
                        response = await client.get(url, headers=headers)
                    elif method.upper() == "POST":
                        response = await client.post(url, headers=headers, json=data)
                    elif method.upper() == "PUT":
                        response = await client.put(url, headers=headers, json=data)
                    else:
                        raise ValueError(f"Unsupported HTTP method: {method}")
                    
                    response.raise_for_status()
                    return response.json()
                    
                except httpx.HTTPStatusError as e:
                    if attempt == retries:
                        logger.error(f"API request failed after {retries + 1} attempts: {e}")
                        raise
                    elif e.response.status_code >= 500:
                        logger.warning(f"Server error on attempt {attempt + 1}, retrying...")
                        continue
                    else:
                        raise
                except httpx.RequestError as e:
                    if attempt == retries:
                        logger.error(f"Request error after {retries + 1} attempts: {e}")
                        raise
                    logger.warning(f"Request error on attempt {attempt + 1}, retrying...")
    
    # Cannabis-specific API methods
    async def get_cannabis_inventory(self) -> List[Dict[str, Any]]:
        """Get cannabis inventory using R-Series Item endpoint"""
        logger.info("Fetching cannabis inventory from LightSpeed R-Series")
        
        response = await self.api_request("/Item")
        items = response.get("Item", [])
        
        # Handle single item response
        if isinstance(items, dict):
            items = [items]
        
        # Filter for cannabis products
        cannabis_items = []
        for item in items:
            if self._is_cannabis_item(item):
                cannabis_items.append(item)
        
        logger.info(f"Found {len(cannabis_items)} cannabis products")
        return cannabis_items
    
    def _is_cannabis_item(self, item: Dict[str, Any]) -> bool:
        """Determine if item is cannabis-related based on fields and description"""
        if item.get("archived") == "true":
            return False
        
        description = (item.get("description", "")).lower()
        note = (item.get("note", "")).lower()
        custom_field_1 = (item.get("customField1", "")).lower()
        custom_field_2 = (item.get("customField2", "")).lower()
        
        cannabis_keywords = ["cannabis", "hemp", "thc", "cbd", "flower", "pre-roll", "edible", "concentrate"]
        
        return any(keyword in text for keyword in cannabis_keywords 
                  for text in [description, note, custom_field_1, custom_field_2])
    
    async def create_inventory_movement(
        self, 
        item_id: str, 
        quantity_change: int, 
        reason: str = "Cannabis inventory sync"
    ) -> Dict[str, Any]:
        """Create inventory movement using proper R-Series InventoryCountItem endpoint"""
        movement_data = {
            "itemID": item_id,
            "qty": str(abs(quantity_change)),
            "employeeID": "1",  # System employee for automated adjustments
            "note": reason
        }
        
        logger.info(f"Creating inventory movement for item {item_id}: {quantity_change} units")
        return await self.api_request("/InventoryCountItem", "POST", movement_data)
    
    async def process_cannabis_sale(
        self, 
        customer_id: str, 
        items: List[Dict[str, Any]], 
        sale_type: str = "standard"
    ) -> Dict[str, Any]:
        """Process cannabis sale with proper R-Series Sale structure"""
        sale_lines = []
        total = 0.0
        
        for item in items:
            unit_price = float(item.get("price", 0))
            quantity = int(item.get("quantity", 1))
            line_total = unit_price * quantity
            total += line_total
            
            sale_lines.append({
                "itemID": item["item_id"],
                "unitQuantity": str(quantity),
                "unitPrice": str(unit_price),
                "note": item.get("note", "")
            })
        
        sale_data = {
            "customerID": customer_id,
            "registerID": "1",  # Default register
            "employeeID": "1",  # System employee
            "SaleLines": {"SaleLine": sale_lines},
            "note": f"Cannabis sale - {sale_type}",
            "calcTotal": str(total)
        }
        
        logger.info(f"Processing cannabis sale for customer {customer_id}: ${total:.2f}")
        return await self.api_request("/Sale", "POST", sale_data)
    
    def get_token_info(self) -> Optional[Dict[str, Any]]:
        """Get current token information for debugging"""
        if not self._token_cache:
            return None
        
        return {
            "has_token": True,
            "expires_at": self._token_cache.expires_at.isoformat(),
            "token_type": self._token_cache.token_type,
            "account_id": self._token_cache.account_id,
            "created_at": self._token_cache.created_at.isoformat()
        }
# Last optimized: 2025-10-02
