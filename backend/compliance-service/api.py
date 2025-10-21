#!/usr/bin/env python3
"""
Liv Hana Compliance Service API
Unified REST API for AGE21, NIST, and Medical Claims compliance
Compliance: LifeWard standard, 21+ age-gate, NIST methods
"""

from fastapi import FastAPI, HTTPException, Header
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field
from datetime import date, datetime
from typing import List, Optional
import logging

# Import compliance modules
from age_verification import verify_age, AgeCheckRequest
from nist_validation import validate_nist, NistValidationRequest
from medical_claims_blocker import check_claims

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format="[%(asctime)s] [%(name)s] [%(levelname)s] %(message)s",
)
logger = logging.getLogger("compliance-api")

# FastAPI app
app = FastAPI(
    title="Liv Hana Compliance Service",
    description="AGE21 + NIST + Medical Claims verification",
    version="1.0.0",
)

# CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # TODO: Restrict in production
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ============================================================================
# Request/Response Models
# ============================================================================

class AgeVerificationRequest(BaseModel):
    birthdate: str = Field(..., description="Birthdate in YYYY-MM-DD format")
    
class AgeVerificationResponse(BaseModel):
    allowed: bool
    age: int
    reason: str
    timestamp: str
    compliance: dict

class NistValidationRequestModel(BaseModel):
    cannabinoid: str = Field(..., description="Cannabinoid name (e.g., THC, CBD)")
    
class NistValidationResponse(BaseModel):
    valid: bool
    cannabinoid: str
    reason: str
    timestamp: str
    compliance: dict

class MedicalClaimsRequest(BaseModel):
    text: str = Field(..., description="Text content to check for medical claims")
    
class MedicalClaimsResponse(BaseModel):
    allowed: bool
    flags: List[str]
    timestamp: str
    compliance: dict
    severity: str

class ComprehensiveComplianceRequest(BaseModel):
    """
    Comprehensive compliance check combining all three checks
    """
    birthdate: Optional[str] = Field(None, description="Birthdate for age verification")
    cannabinoids: Optional[List[str]] = Field(None, description="List of cannabinoids to validate")
    content: Optional[str] = Field(None, description="Content to check for medical claims")
    
class ComprehensiveComplianceResponse(BaseModel):
    overall_compliant: bool
    age_check: Optional[dict] = None
    nist_check: Optional[dict] = None
    medical_claims_check: Optional[dict] = None
    timestamp: str
    compliance_score: float

# ============================================================================
# Health Check
# ============================================================================

@app.get("/health")
async def health_check():
    """Health check endpoint"""
    return {
        "status": "healthy",
        "service": "compliance-service",
        "version": "1.0.0",
        "features": [
            "age_verification",
            "nist_validation",
            "medical_claims_blocker"
        ],
        "timestamp": datetime.utcnow().isoformat() + "Z"
    }

# ============================================================================
# Age Verification Endpoint
# ============================================================================

@app.post("/api/v1/verify-age", response_model=AgeVerificationResponse)
async def verify_age_endpoint(
    request: AgeVerificationRequest,
    x_compliance_token: Optional[str] = Header(None)
):
    """
    Verify user age (21+ enforcement)
    
    - **birthdate**: User's birthdate in YYYY-MM-DD format
    - Returns: Age verification result with compliance metadata
    """
    try:
        # Parse birthdate
        bd = date.fromisoformat(request.birthdate)
        
        # Perform age check
        age_req = AgeCheckRequest(birthdate=bd)
        result = verify_age(age_req)
        
        # Calculate age for response
        today = date.today()
        age = today.year - bd.year - ((today.month, today.day) < (bd.month, bd.day))
        
        logger.info(f"Age verification: age={age}, allowed={result.allowed}")
        
        return AgeVerificationResponse(
            allowed=result.allowed,
            age=age,
            reason=result.reason,
            timestamp=datetime.utcnow().isoformat() + "Z",
            compliance={
                "age21_enforced": True,
                "lifeward_principle": True,
                "threshold": 21
            }
        )
        
    except ValueError as e:
        logger.error(f"Invalid birthdate format: {e}")
        raise HTTPException(status_code=400, detail=f"Invalid birthdate format: {str(e)}")
    except Exception as e:
        logger.error(f"Age verification error: {e}")
        raise HTTPException(status_code=500, detail=str(e))

# ============================================================================
# NIST Validation Endpoint
# ============================================================================

@app.post("/api/v1/validate-cannabinoid", response_model=NistValidationResponse)
async def validate_cannabinoid_endpoint(
    request: NistValidationRequestModel,
    x_compliance_token: Optional[str] = Header(None)
):
    """
    Validate cannabinoid using NIST-approved methods
    
    - **cannabinoid**: Cannabinoid name (THC, CBD, CBG, CBN, THCV)
    - Returns: NIST validation result
    """
    try:
        # Perform NIST validation
        nist_req = NistValidationRequest(cannabinoid=request.cannabinoid)
        result = validate_nist(nist_req)
        
        logger.info(f"NIST validation: cannabinoid={request.cannabinoid}, valid={result.valid}")
        
        return NistValidationResponse(
            valid=result.valid,
            cannabinoid=request.cannabinoid.upper(),
            reason=result.reason,
            timestamp=datetime.utcnow().isoformat() + "Z",
            compliance={
                "nist_validated": True,
                "novel_cannabinoid_gate": True,
                "lifeward_principle": True
            }
        )
        
    except Exception as e:
        logger.error(f"NIST validation error: {e}")
        raise HTTPException(status_code=500, detail=str(e))

# ============================================================================
# Medical Claims Blocker Endpoint
# ============================================================================

@app.post("/api/v1/check-medical-claims", response_model=MedicalClaimsResponse)
async def check_medical_claims_endpoint(
    request: MedicalClaimsRequest,
    x_compliance_token: Optional[str] = Header(None)
):
    """
    Check content for prohibited medical claims
    
    - **text**: Content to analyze
    - Returns: Medical claims detection result
    """
    try:
        # Check for medical claims
        result = check_claims(request.text)
        
        # Determine severity
        severity = "CRITICAL" if not result.allowed else "OK"
        
        logger.info(f"Medical claims check: allowed={result.allowed}, flags={len(result.flags)}")
        
        return MedicalClaimsResponse(
            allowed=result.allowed,
            flags=result.flags,
            timestamp=datetime.utcnow().isoformat() + "Z",
            compliance={
                "no_medical_claims": result.allowed,
                "lifeward_principle": True,
                "fda_compliance": True
            },
            severity=severity
        )
        
    except Exception as e:
        logger.error(f"Medical claims check error: {e}")
        raise HTTPException(status_code=500, detail=str(e))

# ============================================================================
# Comprehensive Compliance Check
# ============================================================================

@app.post("/api/v1/comprehensive-check", response_model=ComprehensiveComplianceResponse)
async def comprehensive_compliance_check(
    request: ComprehensiveComplianceRequest,
    x_compliance_token: Optional[str] = Header(None)
):
    """
    Comprehensive compliance check combining all three validations
    
    - **birthdate**: Optional - User birthdate for age verification
    - **cannabinoids**: Optional - List of cannabinoids to validate
    - **content**: Optional - Content to check for medical claims
    - Returns: Comprehensive compliance result
    """
    try:
        results = {}
        compliance_scores = []
        
        # Age verification
        if request.birthdate:
            bd = date.fromisoformat(request.birthdate)
            age_req = AgeCheckRequest(birthdate=bd)
            age_result = verify_age(age_req)
            today = date.today()
            age = today.year - bd.year - ((today.month, today.day) < (bd.month, bd.day))
            
            results["age_check"] = {
                "allowed": age_result.allowed,
                "age": age,
                "reason": age_result.reason
            }
            compliance_scores.append(1.0 if age_result.allowed else 0.0)
        
        # NIST validation
        if request.cannabinoids:
            nist_results = []
            for cannabinoid in request.cannabinoids:
                nist_req = NistValidationRequest(cannabinoid=cannabinoid)
                nist_result = validate_nist(nist_req)
                nist_results.append({
                    "cannabinoid": cannabinoid.upper(),
                    "valid": nist_result.valid,
                    "reason": nist_result.reason
                })
                compliance_scores.append(1.0 if nist_result.valid else 0.0)
            
            results["nist_check"] = {
                "results": nist_results,
                "all_valid": all(r["valid"] for r in nist_results)
            }
        
        # Medical claims check
        if request.content:
            claims_result = check_claims(request.content)
            results["medical_claims_check"] = {
                "allowed": claims_result.allowed,
                "flags": claims_result.flags
            }
            compliance_scores.append(1.0 if claims_result.allowed else 0.0)
        
        # Calculate overall compliance
        overall_compliant = all([
            results.get("age_check", {}).get("allowed", True),
            results.get("nist_check", {}).get("all_valid", True),
            results.get("medical_claims_check", {}).get("allowed", True)
        ])
        
        compliance_score = sum(compliance_scores) / len(compliance_scores) if compliance_scores else 1.0
        
        logger.info(f"Comprehensive check: compliant={overall_compliant}, score={compliance_score}")
        
        return ComprehensiveComplianceResponse(
            overall_compliant=overall_compliant,
            age_check=results.get("age_check"),
            nist_check=results.get("nist_check"),
            medical_claims_check=results.get("medical_claims_check"),
            timestamp=datetime.utcnow().isoformat() + "Z",
            compliance_score=compliance_score
        )
        
    except ValueError as e:
        logger.error(f"Invalid request format: {e}")
        raise HTTPException(status_code=400, detail=f"Invalid request format: {str(e)}")
    except Exception as e:
        logger.error(f"Comprehensive compliance check error: {e}")
        raise HTTPException(status_code=500, detail=str(e))

# ============================================================================
# Main Entry Point
# ============================================================================

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(
        "api:app",
        host="0.0.0.0",
        port=8000,
        reload=True,
        log_level="info"
    )

