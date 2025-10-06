"""
Cannabis Compliance Checker
Texas hemp law compliance and age verification for Reggie & Dro
"""

import os
import logging
from datetime import datetime, timedelta, date
from typing import Dict, Any, List, Optional
from decimal import Decimal
from pydantic import BaseModel

class CustomerVerification(BaseModel):
    customer_id: str
    date_of_birth: str  # YYYY-MM-DD format
    id_verified: bool = False

logger = logging.getLogger(__name__)

class CannabisComplianceChecker:
    """
    Cannabis compliance validation for Texas hemp laws and age restrictions
    """
    
    def __init__(self):
        # Texas hemp law compliance (≤0.3% Δ9 THC)
        self.max_thc_percentage = 0.3
        self.min_age_requirement = 21
        
        # Daily limits and tracking (use database in production)
        self._daily_free_gram_tracking = {}
    
    async def check_item_compliance(self, item: Dict[str, Any]) -> Dict[str, Any]:
        """
        Check cannabis item compliance against Texas hemp laws
        
        Args:
            item: LightSpeed Item data structure
            
        Returns:
            Compliance result with status and checks
        """
        compliance = {
            "compliant": True,
            "status": "compliant", 
            "checks": []
        }
        
        # Check if item is archived
        if item.get("archived") == "true":
            compliance["checks"].append({
                "check": "archived_status",
                "passed": False,
                "message": "Item is archived and unavailable"
            })
            compliance["compliant"] = False
            compliance["status"] = "archived"
            return compliance
        
        # Check THC content compliance (Texas hemp: ≤0.3% Δ9 THC)
        thc_check = self._check_thc_content(item)
        compliance["checks"].append(thc_check)
        if not thc_check["passed"]:
            compliance["compliant"] = False
            compliance["status"] = "non_compliant_thc"
        
        # Check age restriction requirements
        age_check = self._check_age_restriction(item)
        compliance["checks"].append(age_check)
        if not age_check["passed"]:
            compliance["compliant"] = False
        
        # Check labeling requirements
        labeling_check = self._check_labeling_requirements(item)
        compliance["checks"].append(labeling_check)
        if not labeling_check["passed"]:
            compliance["compliant"] = False
        
        # Check inventory availability
        inventory_check = self._check_inventory_availability(item)
        compliance["checks"].append(inventory_check)
        if not inventory_check["passed"]:
            compliance["compliant"] = False
            compliance["status"] = "out_of_stock"
        
        return compliance
    
    def _check_thc_content(self, item: Dict[str, Any]) -> Dict[str, Any]:
        """Check THC content against Texas hemp limits"""
        # Extract THC content from customField1
        thc_string = item.get("customField1", "0")
        
        # Parse THC percentage (handle various formats)
        thc_content = self._parse_thc_percentage(thc_string)
        
        if thc_content is None:
            return {
                "check": "thc_content_format",
                "passed": False,
                "message": f"Invalid THC content format: {thc_string}",
                "value": thc_string
            }
        
        if thc_content > self.max_thc_percentage:
            return {
                "check": "thc_limit",
                "passed": False,
                "message": f"THC content {thc_content}% exceeds Texas hemp limit of {self.max_thc_percentage}%",
                "value": thc_content,
                "limit": self.max_thc_percentage
            }
        
        return {
            "check": "thc_limit", 
            "passed": True,
            "message": f"THC content {thc_content}% within legal limits",
            "value": thc_content,
            "limit": self.max_thc_percentage
        }
    
    def _parse_thc_percentage(self, thc_string: str) -> Optional[float]:
        """Parse THC percentage from various string formats"""
        if not thc_string:
            return 0.0
        
        # Clean the string
        cleaned = thc_string.lower().replace("%", "").replace("thc:", "").replace("δ9", "").strip()
        
        # Handle "< 0.3" format
        if cleaned.startswith("<"):
            cleaned = cleaned[1:].strip()
        
        # Handle "0.3%" or similar
        try:
            return float(cleaned)
        except ValueError:
            logger.warning(f"Could not parse THC content: {thc_string}")
            return None
    
    def _check_age_restriction(self, item: Dict[str, Any]) -> Dict[str, Any]:
        """Check age restriction compliance"""
        # Check various fields for age restriction indicators
        custom_field_3 = item.get("customField3", "").lower()
        note = item.get("note", "").lower()
        description = item.get("description", "").lower()
        
        age_indicators = ["21+", "adult only", "age restricted", "21 and over"]
        
        has_age_restriction = any(
            indicator in field
            for indicator in age_indicators
            for field in [custom_field_3, note, description]
        )
        
        if not has_age_restriction:
            return {
                "check": "age_restriction",
                "passed": False,
                "message": "Product must be age-restricted to 21+",
                "requirement": f"{self.min_age_requirement}+"
            }
        
        return {
            "check": "age_restriction",
            "passed": True,
            "message": "Age restriction properly set to 21+",
            "requirement": f"{self.min_age_requirement}+"
        }
    
    def _check_labeling_requirements(self, item: Dict[str, Any]) -> Dict[str, Any]:
        """Check product labeling requirements"""
        description = item.get("description", "")
        note = item.get("note", "")
        custom_field_2 = item.get("customField2", "")
        
        # Check required labeling elements
        has_description = description and len(description.strip()) > 5
        
        # Check for lab testing indicators
        lab_indicators = ["tested", "lab tested", "coa", "certificate of analysis", "lab results"]
        has_lab_testing = any(
            indicator in field.lower()
            for indicator in lab_indicators
            for field in [note, custom_field_2, description]
        )
        
        missing_requirements = []
        if not has_description:
            missing_requirements.append("product description")
        if not has_lab_testing:
            missing_requirements.append("lab testing documentation")
        
        if missing_requirements:
            return {
                "check": "labeling",
                "passed": False,
                "message": f"Missing required labeling: {', '.join(missing_requirements)}",
                "missing": missing_requirements
            }
        
        return {
            "check": "labeling",
            "passed": True,
            "message": "Required labeling complete",
            "requirements_met": ["product description", "lab testing documentation"]
        }
    
    def _check_inventory_availability(self, item: Dict[str, Any]) -> Dict[str, Any]:
        """Check if item has available inventory"""
        qty_on_hand = float(item.get("qtyOnHand", 0))
        
        if qty_on_hand <= 0:
            return {
                "check": "inventory_availability",
                "passed": False,
                "message": "Product is out of stock",
                "quantity": qty_on_hand
            }
        
        return {
            "check": "inventory_availability", 
            "passed": True,
            "message": f"Product available ({int(qty_on_hand)} units)",
            "quantity": qty_on_hand
        }
    
    def is_free_gram_eligible(self, item: Dict[str, Any]) -> bool:
        """Check if item is eligible for free gram program"""
        # Check customField3 or note for free gram eligibility
        custom_field_3 = item.get("customField3", "").lower()
        note = item.get("note", "").lower()
        
        free_gram_indicators = ["free_gram", "free gram", "promotional", "sample"]
        
        is_eligible = any(
            indicator in field
            for indicator in free_gram_indicators
            for field in [custom_field_3, note]
        )
        
        # Must also be compliant and have sufficient inventory
        if is_eligible:
            qty_on_hand = float(item.get("qtyOnHand", 0))
            return qty_on_hand > 10  # Keep 10 in reserve
        
        return False
    
    async def verify_customer_age(self, verification: CustomerVerification) -> Dict[str, Any]:
        """Verify customer meets age requirements (21+)"""
        try:
            # Parse date of birth
            birth_date = datetime.strptime(verification.date_of_birth, "%Y-%m-%d").date()
            today = date.today()
            
            # Calculate age
            age = today.year - birth_date.year - (
                (today.month, today.day) < (birth_date.month, birth_date.day)
            )
            
            eligible = age >= self.min_age_requirement
            
            if not eligible:
                return {
                    "eligible": False,
                    "age": age,
                    "reason": f"Customer must be {self.min_age_requirement}+ years old (currently {age})",
                    "requirement": self.min_age_requirement,
                    "id_verified": verification.id_verified
                }
            
            if not verification.id_verified:
                return {
                    "eligible": False,
                    "age": age, 
                    "reason": "ID verification required for cannabis purchases",
                    "requirement": "Valid government-issued ID",
                    "id_verified": False
                }
            
            logger.info(f"Age verification passed for customer {verification.customer_id}: {age} years")
            
            return {
                "eligible": True,
                "age": age,
                "reason": "Customer meets all age requirements",
                "requirement": self.min_age_requirement,
                "id_verified": True,
                "verified_at": datetime.now().isoformat()
            }
            
        except ValueError as e:
            logger.error(f"Invalid date of birth format: {verification.date_of_birth}")
            return {
                "eligible": False,
                "age": None,
                "reason": "Invalid date of birth format (use YYYY-MM-DD)",
                "requirement": "Valid date of birth",
                "id_verified": verification.id_verified
            }
    
    async def check_daily_free_gram_limit(self, customer_id: str) -> Dict[str, Any]:
        """Check if customer has exceeded daily free gram limit"""
        today_key = f"{customer_id}_{date.today().isoformat()}"
        
        current_count = self._daily_free_gram_tracking.get(today_key, 0)
        daily_limit = 1  # 1 free gram per day per customer
        
        if current_count >= daily_limit:
            return {
                "allowed": False,
                "current_count": current_count,
                "daily_limit": daily_limit,
                "message": f"Daily free gram limit of {daily_limit} already reached",
                "reset_time": (datetime.now().replace(hour=0, minute=0, second=0) + timedelta(days=1)).isoformat()
            }
        
        return {
            "allowed": True,
            "current_count": current_count,
            "daily_limit": daily_limit,
            "remaining": daily_limit - current_count,
            "message": f"Customer can receive {daily_limit - current_count} more free gram(s) today"
        }
    
    async def record_free_gram_transaction(self, customer_id: str, item_id: str) -> Dict[str, Any]:
        """Record free gram transaction for daily limit tracking"""
        today_key = f"{customer_id}_{date.today().isoformat()}"
        
        current_count = self._daily_free_gram_tracking.get(today_key, 0)
        self._daily_free_gram_tracking[today_key] = current_count + 1
        
        logger.info(f"Free gram recorded for customer {customer_id}: {current_count + 1}/1 today")
        
        return {
            "recorded": True,
            "customer_id": customer_id,
            "item_id": item_id,
            "count_today": current_count + 1,
            "recorded_at": datetime.now().isoformat()
        }
    
    def get_compliance_summary(self) -> Dict[str, Any]:
        """Get compliance system summary"""
        return {
            "compliance_system": "Texas Hemp Law Compliance Engine",
            "regulations": {
                "thc_limit": f"≤{self.max_thc_percentage}% Δ9 THC",
                "age_requirement": f"{self.min_age_requirement}+",
                "id_verification": "Required",
                "labeling": "Description and lab testing required"
            },
            "free_gram_program": {
                "daily_limit": "1 free gram per customer",
                "eligibility": "21+ with ID verification",
                "inventory_reserve": "10 units minimum"
            },
            "tracking": {
                "compliance_checks": "Real-time",
                "age_verification": "Per transaction",
                "daily_limits": "Automatic enforcement"
            }
        }
# Last optimized: 2025-10-02

# Optimized: 2025-10-02
