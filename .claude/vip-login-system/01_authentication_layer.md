### 1. Authentication Layer
```python
# backend/vip-auth-service/main.py
from fastapi import FastAPI, Depends, HTTPException, status
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from passlib.context import CryptContext
from jose import JWTError, jwt
from datetime import datetime, timedelta
import redis
import psycopg2
from typing import Optional

app = FastAPI(title="VIP Authentication Service", version="1.0.0")

# Security configuration
SECRET_KEY = "your-secret-key"  # From Replit Secrets
ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = 30
REFRESH_TOKEN_EXPIRE_DAYS = 7

# Password hashing
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

# Redis for session management
redis_client = redis.Redis(host='localhost', port=6379, db=0)

# Database connection
DATABASE_URL = "your-database-url"  # From Replit Secrets

class VIPUser:
    def __init__(self, user_id: str, email: str, role: str, permissions: list):
        self.user_id = user_id
        self.email = email
        self.role = role
        self.permissions = permissions

class VIPAuthService:
    def __init__(self):
        self.db_connection = psycopg2.connect(DATABASE_URL)
    
    def authenticate_user(self, email: str, password: str) -> Optional[VIPUser]:
        """Authenticate VIP user with email and password"""
        cursor = self.db_connection.cursor()
        cursor.execute("""
            SELECT user_id, email, password_hash, role, permissions
            FROM vip_users 
            WHERE email = %s AND active = true
        """, (email,))
        
        user = cursor.fetchone()
        if not user:
            return None
            
        user_id, email, password_hash, role, permissions = user
        
        if not pwd_context.verify(password, password_hash):
            return None
            
        return VIPUser(user_id, email, role, permissions)
    
    def create_access_token(self, user: VIPUser) -> str:
        """Create JWT access token"""
        expire = datetime.utcnow() + timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
        to_encode = {
            "sub": user.user_id,
            "email": user.email,
            "role": user.role,
            "permissions": user.permissions,
            "exp": expire
        }
        return jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)
    
    def create_refresh_token(self, user: VIPUser) -> str:
        """Create JWT refresh token"""
        expire = datetime.utcnow() + timedelta(days=REFRESH_TOKEN_EXPIRE_DAYS)
        to_encode = {
            "sub": user.user_id,
            "type": "refresh",
            "exp": expire
        }
        return jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)

# Dependency for JWT token validation
security = HTTPBearer()

def get_current_user(credentials: HTTPAuthorizationCredentials = Depends(security)) -> VIPUser:
    """Get current authenticated VIP user"""
    try:
        payload = jwt.decode(credentials.credentials, SECRET_KEY, algorithms=[ALGORITHM])
        user_id = payload.get("sub")
        email = payload.get("email")
        role = payload.get("role")
        permissions = payload.get("permissions", [])
        
        if user_id is None:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Invalid authentication credentials"
            )
            
        return VIPUser(user_id, email, role, permissions)
    except JWTError:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid authentication credentials"
        )

# API Endpoints
@app.post("/api/vip/auth/login")
async def login(email: str, password: str):
    """VIP user login endpoint"""
    auth_service = VIPAuthService()
    user = auth_service.authenticate_user(email, password)
    
    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid email or password"
        )
    
    access_token = auth_service.create_access_token(user)
    refresh_token = auth_service.create_refresh_token(user)
    
    # Store refresh token in Redis
    redis_client.setex(f"refresh_token:{user.user_id}", 
                      REFRESH_TOKEN_EXPIRE_DAYS * 24 * 3600, 
                      refresh_token)
    
    return {
        "access_token": access_token,
        "refresh_token": refresh_token,
        "token_type": "bearer",
        "user": {
            "user_id": user.user_id,
            "email": user.email,
            "role": user.role,
            "permissions": user.permissions
        }
    }

@app.post("/api/vip/auth/refresh")
async def refresh_token(refresh_token: str):
    """Refresh access token"""
    try:
        payload = jwt.decode(refresh_token, SECRET_KEY, algorithms=[ALGORITHM])
        user_id = payload.get("sub")
        
        if payload.get("type") != "refresh":
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Invalid token type"
            )
        
        # Verify refresh token exists in Redis
        stored_token = redis_client.get(f"refresh_token:{user_id}")
        if not stored_token or stored_token.decode() != refresh_token:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Invalid refresh token"
            )
        
        # Get user details and create new access token
        auth_service = VIPAuthService()
        cursor = auth_service.db_connection.cursor()
        cursor.execute("""
            SELECT user_id, email, role, permissions
            FROM vip_users 
            WHERE user_id = %s AND active = true
        """, (user_id,))
        
        user_data = cursor.fetchone()
        if not user_data:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="User not found"
            )
        
        user_id, email, role, permissions = user_data
        user = VIPUser(user_id, email, role, permissions)
        
        new_access_token = auth_service.create_access_token(user)
        
        return {
            "access_token": new_access_token,
            "token_type": "bearer"
        }
        
    except JWTError:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid refresh token"
        )

@app.post("/api/vip/auth/logout")
async def logout(current_user: VIPUser = Depends(get_current_user)):
    """VIP user logout endpoint"""
    # Remove refresh token from Redis
    redis_client.delete(f"refresh_token:{current_user.user_id}")
    
    return {"message": "Successfully logged out"}

@app.get("/api/vip/auth/profile")
async def get_profile(current_user: VIPUser = Depends(get_current_user)):
    """Get VIP user profile"""
    return {
        "user_id": current_user.user_id,
        "email": current_user.email,
        "role": current_user.role,
        "permissions": current_user.permissions
    }
```
