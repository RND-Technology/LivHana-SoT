"""
Texas Full Panel COA Checker - Backend API
Texas DSHS Compliance + NIST Validation + Phone Camera Scanning
Based on KCA Labs COA Template → TTSA "Texas Full Panel" Standard
"""

from fastapi import FastAPI, File, UploadFile, Form, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from pydantic import BaseModel
from typing import Optional, Dict, List
import os
import re
import json
import base64
from datetime import datetime
import hashlib

app = FastAPI(title="Texas COA Checker", version="1.0.0")

# CORS for phone camera access
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ============================================================================
# TEXAS FULL PANEL STANDARD - Based on KCA Labs Template
# ============================================================================

TEXAS_FULL_PANEL_REQUIREMENTS = {
    "cannabinoids": [
        "Delta-9 THC",
        "THCA",
        "CBD",
        "CBDA",
        "CBG",
        "CBGA",
        "CBC",
        "CBN",
        "Delta-8 THC",  # Track for compliance
        "THCV",
        "Total THC",
        "Total CBD"
    ],
    "heavy_metals": [
        "Lead (Pb)",
        "Arsenic (As)",
        "Cadmium (Cd)",
        "Mercury (Hg)"
    ],
    "microbial": [
        "Total Aerobic Count",
        "Total Yeast and Mold",
        "E. coli",
        "Salmonella",
        "Aspergillus"
    ],
    "pesticides": [
        "Minimum 15 pesticides required",
        "NIST validation required for novel cannabinoids"
    ],
    "mycotoxins": [
        "Aflatoxins (B1, B2, G1, G2)",
        "Ochratoxin A"
    ],
    "residual_solvents": [
        "Butane",
        "Propane",
        "Ethanol",
        "Acetone",
        "Isopropanol",
        "Hexane",
        "Heptane"
    ]
}

TEXAS_HEMP_COMPLIANCE = {
    "max_total_thc": 0.3,  # Texas hemp law ≤0.3% Total THC
    "dshs_license_required": True,
    "license_number": "690",  # Reggie & Dro dispensary
    "age_restriction": 21,
    "nist_required_for_novel": True
}

# NIST-validated method patterns
NIST_VALIDATED_METHODS = [
    r"NIST.*\d+",
    r"ISO.*17025",
    r"AOAC.*\d+",
    r"USP.*\d+",
    r"EPA.*\d+",
    r"HPLC.*UV.*DAD",
    r"GC.*MS.*MS",
    r"LC.*MS.*MS"
]

# Novel cannabinoid detection (requires NIST validation)
NOVEL_CANNABINOIDS = [
    "THCP", "THCPO", "THCV", "HHCP", "HHC",
    "Delta-10", "Delta-8-THC-O", "THCB", "THCH"
]

# ============================================================================
# DATA MODELS
# ============================================================================

class COAUpload(BaseModel):
    sku: str
    batch: str
    lab_name: Optional[str]
    collection_date: Optional[str]

class COAValidationResult(BaseModel):
    id: str
    sku: str
    batch: str
    lab_name: Optional[str]
    texas_compliant: bool
    total_thc: Optional[float]
    nist_validated: bool
    novel_cannabinoid: bool
    validation_flags: List[str]
    cannabinoids: Dict
    contaminants: Dict
    test_date: Optional[str]
    parsed_text: str
    qr_code: str  # For easy sharing/verification

# ============================================================================
# COA PARSING ENGINE
# ============================================================================

def extract_text_from_image(file_content: bytes) -> str:
    """
    Extract text from image using OCR
    In production: Use Google Cloud Vision API or AWS Textract
    For prototype: Simple pattern matching on uploaded text
    """
    # Simulate OCR - in production would call:
    # from google.cloud import vision
    # client = vision.ImageAnnotatorClient()
    # image = vision.Image(content=file_content)
    # response = client.text_detection(image=image)
    # return response.full_text_annotation.text
    
    # Prototype: decode if it's base64 encoded text
    try:
        decoded = base64.b64decode(file_content).decode('utf-8')
        return decoded
    except:
        return file_content.decode('utf-8', errors='ignore')

def extract_text_from_pdf(file_content: bytes) -> str:
    """
    Extract text from PDF
    In production: Use PyPDF2 or pdfplumber
    """
    # Prototype: treat as text
    return file_content.decode('utf-8', errors='ignore')

def parse_cannabinoid_panel(text: str) -> Dict:
    """
    Extract cannabinoid values from COA text
    """
    cannabinoids = {}
    
    # Pattern: "Delta-9 THC: 0.25%"
    for cannabinoid in TEXAS_FULL_PANEL_REQUIREMENTS["cannabinoids"]:
        pattern = rf"{re.escape(cannabinoid)}[:\s]+([0-9.]+)\s*%"
        match = re.search(pattern, text, re.IGNORECASE)
        if match:
            cannabinoids[cannabinoid] = float(match.group(1))
    
    # Calculate Total THC if not present
    if "Total THC" not in cannabinoids:
        thc = cannabinoids.get("Delta-9 THC", 0)
        thca = cannabinoids.get("THCA", 0)
        # Total THC = THC + (THCA × 0.877)
        cannabinoids["Total THC"] = thc + (thca * 0.877)
    
    return cannabinoids

def parse_contaminants(text: str) -> Dict:
    """
    Extract heavy metals, microbial, pesticide data
    """
    contaminants = {
        "heavy_metals": {},
        "microbial": {},
        "pesticides": {},
        "mycotoxins": {},
        "residual_solvents": {}
    }
    
    # Heavy metals (pattern: "Lead: 0.05 ppm" or "ND")
    for metal in TEXAS_FULL_PANEL_REQUIREMENTS["heavy_metals"]:
        pattern = rf"{re.escape(metal)}[:\s]+([0-9.]+|ND|<LOQ)"
        match = re.search(pattern, text, re.IGNORECASE)
        if match:
            value = match.group(1)
            contaminants["heavy_metals"][metal] = "PASS" if value in ["ND", "<LOQ"] else value
    
    # Microbial (pattern: "E. coli: <10 CFU/g")
    for microbe in TEXAS_FULL_PANEL_REQUIREMENTS["microbial"]:
        pattern = rf"{re.escape(microbe)}[:\s]+([<>0-9.]+\s*CFU|ND|PASS|FAIL)"
        match = re.search(pattern, text, re.IGNORECASE)
        if match:
            contaminants["microbial"][microbe] = match.group(1)
    
    return contaminants

def detect_nist_validation(text: str) -> bool:
    """
    Check if COA indicates NIST-validated method
    """
    for pattern in NIST_VALIDATED_METHODS:
        if re.search(pattern, text, re.IGNORECASE):
            return True
    return False

def detect_novel_cannabinoids(cannabinoids: Dict) -> bool:
    """
    Check if cannabinoid panel contains novel cannabinoids
    """
    for cannabinoid in cannabinoids.keys():
        if any(novel in cannabinoid.upper() for novel in NOVEL_CANNABINOIDS):
            return True
    return False

def validate_texas_compliance(total_thc: float, nist_validated: bool, novel: bool) -> tuple:
    """
    Validate Texas hemp compliance
    Returns: (is_compliant, flags)
    """
    flags = []
    
    # Check THC limit
    if total_thc > TEXAS_HEMP_COMPLIANCE["max_total_thc"]:
        flags.append(f"⚠️ EXCEEDS TEXAS LIMIT: {total_thc}% THC (max 0.3%)")
    
    # Check novel cannabinoid NIST requirement
    if novel and not nist_validated:
        flags.append("❌ NOVEL CANNABINOID REQUIRES NIST-VALIDATED METHOD")
    
    # Check for missing required panels
    # (In production, would verify all required tests present)
    
    is_compliant = len(flags) == 0
    
    if is_compliant:
        flags.append("✅ TEXAS COMPLIANT - ≤0.3% Total THC")
        if nist_validated:
            flags.append("✅ NIST-VALIDATED METHOD")
    
    return is_compliant, flags

def generate_qr_code(coa_id: str) -> str:
    """
    Generate verification QR code
    In production: Use qrcode library to generate actual QR image
    """
    verification_url = f"https://texascannabis.org/verify/{coa_id}"
    return verification_url

# ============================================================================
# API ENDPOINTS
# ============================================================================

@app.post("/api/v1/coa/upload", response_model=COAValidationResult)
async def upload_coa(
    file: UploadFile = File(...),
    sku: str = Form(...),
    batch: str = Form(...),
    lab_name: Optional[str] = Form(None)
):
    """
    Upload COA (PDF or Image from phone camera) for validation
    """
    try:
        # Read file
        file_content = await file.read()
        
        # Extract text based on file type
        if file.filename.lower().endswith('.pdf'):
            text = extract_text_from_pdf(file_content)
        else:  # Image (jpg, png, etc)
            text = extract_text_from_image(file_content)
        
        # Parse cannabinoid panel
        cannabinoids = parse_cannabinoid_panel(text)
        
        # Parse contaminants
        contaminants = parse_contaminants(text)
        
        # Get Total THC
        total_thc = cannabinoids.get("Total THC", 0.0)
        
        # Detect NIST validation
        nist_validated = detect_nist_validation(text)
        
        # Detect novel cannabinoids
        novel_cannabinoid = detect_novel_cannabinoids(cannabinoids)
        
        # Validate Texas compliance
        texas_compliant, validation_flags = validate_texas_compliance(
            total_thc, nist_validated, novel_cannabinoid
        )
        
        # Generate unique ID
        coa_id = hashlib.sha256(f"{sku}-{batch}-{datetime.now().isoformat()}".encode()).hexdigest()[:16]
        
        # Generate QR code for verification
        qr_code = generate_qr_code(coa_id)
        
        # In production: Store to database
        # db.execute("INSERT INTO coa (id, sku, batch, ...) VALUES (...)")
        
        return COAValidationResult(
            id=coa_id,
            sku=sku,
            batch=batch,
            lab_name=lab_name,
            texas_compliant=texas_compliant,
            total_thc=total_thc,
            nist_validated=nist_validated,
            novel_cannabinoid=novel_cannabinoid,
            validation_flags=validation_flags,
            cannabinoids=cannabinoids,
            contaminants=contaminants,
            test_date=datetime.now().isoformat(),
            parsed_text=text[:500],  # First 500 chars for preview
            qr_code=qr_code
        )
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"COA processing error: {str(e)}")

@app.get("/api/v1/coa/{coa_id}")
async def get_coa(coa_id: str):
    """
    Retrieve COA validation results by ID
    """
    # In production: Query database
    # result = db.query("SELECT * FROM coa WHERE id = ?", coa_id)
    
    return JSONResponse({
        "id": coa_id,
        "message": "COA verification endpoint - in production would return stored COA data",
        "verification_url": f"https://texascannabis.org/verify/{coa_id}"
    })

@app.post("/api/v1/coa/quick-check")
async def quick_check(
    total_thc: float = Form(...),
    has_novel_cannabinoids: bool = Form(False),
    nist_validated: bool = Form(False)
):
    """
    Quick compliance check without full COA upload
    """
    texas_compliant, validation_flags = validate_texas_compliance(
        total_thc, nist_validated, has_novel_cannabinoids
    )
    
    return {
        "texas_compliant": texas_compliant,
        "total_thc": total_thc,
        "max_allowed": TEXAS_HEMP_COMPLIANCE["max_total_thc"],
        "validation_flags": validation_flags,
        "dshs_license": TEXAS_HEMP_COMPLIANCE["license_number"]
    }

@app.get("/api/v1/standards/texas-full-panel")
async def get_texas_standards():
    """
    Get Texas Full Panel requirements
    """
    return {
        "requirements": TEXAS_FULL_PANEL_REQUIREMENTS,
        "compliance": TEXAS_HEMP_COMPLIANCE,
        "novel_cannabinoids": NOVEL_CANNABINOIDS,
        "nist_methods": NIST_VALIDATED_METHODS
    }

@app.get("/health")
async def health_check():
    """Health check endpoint"""
    return {
        "status": "healthy",
        "service": "Texas COA Checker",
        "version": "1.0.0",
        "dshs_license": TEXAS_HEMP_COMPLIANCE["license_number"]
    }

# ============================================================================
# STARTUP
# ============================================================================

if __name__ == "__main__":
    import uvicorn
    
    port = int(os.environ.get("PORT", 8000))
    
    print("=" * 60)
    print("🌿 TEXAS COA CHECKER BACKEND STARTING")
    print("=" * 60)
    print(f"Texas DSHS License: #{TEXAS_HEMP_COMPLIANCE['license_number']}")
    print(f"Max THC: {TEXAS_HEMP_COMPLIANCE['max_total_thc']}%")
    print(f"Port: {port}")
    print("=" * 60)
    
    uvicorn.run(
        app,
        host="0.0.0.0",
        port=port,
        log_level="info"
    )
