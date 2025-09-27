"""
LivHana-SoT: Truth Verification Layer
TruthCascade class for fact-checking, logical consistency, and source validation
"""

import re
import logging
from typing import Dict, List, Any, Optional
from urllib.parse import urlparse
import requests
from datetime import datetime

logger = logging.getLogger(__name__)

class TruthCascade:
    """
    Truth verification system for LivHana AI Agent Swarm
    Implements fact-checking, logical consistency, and source validation
    """
    
    def __init__(self):
        self.contradiction_patterns = [
            # Cannabis-specific contradictions
            r"(?i)(cannabis.*illegal.*legal)",
            r"(?i)(thc.*safe.*dangerous)",
            r"(?i)(hemp.*marijuana.*same.*different)",
            
            # General logical contradictions
            r"(?i)(always.*never)",
            r"(?i)(all.*none)",
            r"(?i)(impossible.*possible)",
            
            # Business contradictions
            r"(?i)(profit.*loss.*same)",
            r"(?i)(increase.*decrease.*simultaneously)",
        ]
        
        # Known fact database (in production, this would be a proper database)
        self.known_facts = {
            "cannabis_legal_status": {
                "texas": "medical_only",
                "california": "recreational_legal",
                "federal": "schedule_1"
            },
            "thc_effects": {
                "psychoactive": True,
                "medical_benefits": "research_ongoing",
                "safety_profile": "generally_safe_adults"
            }
        }
        
        # Compliance rules for LivHana
        self.compliance_rules = [
            "21+ only",
            "no medical claims",
            "natural cannabinoids only",
            "NIST-validated novel cannabinoids",
            "brands not characters"
        ]
    
    def fact_check(self, response: str) -> Dict[str, Any]:
        """
        Fact-check response against known facts and contradiction patterns
        
        Args:
            response: The AI response to verify
            
        Returns:
            Dictionary with pass status, score, and corrections
        """
        try:
            corrections = []
            score = 1.0
            
            # Check for contradiction patterns
            for pattern in self.contradiction_patterns:
                if re.search(pattern, response):
                    corrections.append(f"Contradiction detected: {pattern}")
                    score -= 0.3
            
            # Check cannabis-specific facts
            if "cannabis" in response.lower():
                if "legal in texas" in response.lower() and "recreational" in response.lower():
                    corrections.append("Incorrect: Cannabis recreational use is not legal in Texas")
                    score -= 0.4
                
                if "medical claims" in response.lower():
                    corrections.append("Compliance violation: No medical claims allowed")
                    score -= 0.5
            
            # Check compliance rules
            for rule in self.compliance_rules:
                if rule == "21+ only" and "under 21" in response.lower():
                    corrections.append("Compliance violation: Must be 21+ only")
                    score -= 0.3
                
                if rule == "no medical claims" and any(term in response.lower() for term in ["cure", "treat", "medicine", "therapeutic"]):
                    corrections.append("Compliance violation: No medical claims allowed")
                    score -= 0.4
            
            # Check for hallucinated data
            if re.search(r"\d{4}-\d{2}-\d{2}", response):  # Date patterns
                # In production, validate dates against known events
                pass
            
            # Check for specific numbers that might be hallucinated
            if re.search(r"\$[\d,]+", response):  # Money amounts
                # In production, validate against known financial data
                pass
            
            return {
                "pass": score >= 0.7,
                "score": max(0.0, score),
                "corrections": corrections
            }
            
        except Exception as e:
            logger.error(f"❌ Fact check failed: {e}")
            return {
                "pass": False,
                "score": 0.0,
                "corrections": [f"Fact check error: {str(e)}"]
            }
    
    def logical_consistency_check(self, response: str, context: str = "") -> Dict[str, Any]:
        """
        Check for internal logical fallacies within the response
        
        Args:
            response: The AI response to check
            context: Additional context for consistency checking
            
        Returns:
            Dictionary with consistency status
        """
        try:
            issues = []
            
            # Check for circular reasoning
            if re.search(r"(?i)(because.*because)", response):
                issues.append("Circular reasoning detected")
            
            # Check for false dichotomies
            if re.search(r"(?i)(either.*or.*nothing)", response):
                issues.append("False dichotomy detected")
            
            # Check for hasty generalizations
            if re.search(r"(?i)(all.*always.*never)", response):
                issues.append("Hasty generalization detected")
            
            # Check for ad hominem attacks
            if re.search(r"(?i)(stupid|idiot|moron)", response):
                issues.append("Ad hominem attack detected")
            
            # Check for strawman arguments
            if re.search(r"(?i)(obviously.*clearly.*everyone knows)", response):
                issues.append("Potential strawman argument")
            
            # Check for context consistency
            if context and response:
                # Simple keyword consistency check
                context_keywords = set(re.findall(r'\b\w+\b', context.lower()))
                response_keywords = set(re.findall(r'\b\w+\b', response.lower()))
                
                # Check if response introduces completely unrelated topics
                overlap = len(context_keywords.intersection(response_keywords))
                if len(response_keywords) > 0 and overlap / len(response_keywords) < 0.1:
                    issues.append("Response may be off-topic")
            
            return {
                "is_consistent": len(issues) == 0,
                "issues": issues
            }
            
        except Exception as e:
            logger.error(f"❌ Logical consistency check failed: {e}")
            return {
                "is_consistent": False,
                "issues": [f"Consistency check error: {str(e)}"]
            }
    
    def source_validation(self, citations: List[str]) -> Dict[str, Any]:
        """
        Validate provided URLs/sources
        
        Args:
            citations: List of URLs or source references
            
        Returns:
            Dictionary with validation status
        """
        try:
            valid_sources = []
            invalid_sources = []
            
            for citation in citations:
                if not citation:
                    continue
                
                # Check if it's a URL
                if citation.startswith(('http://', 'https://')):
                    try:
                        parsed = urlparse(citation)
                        if parsed.netloc and parsed.scheme:
                            # Basic URL validation
                            response = requests.head(citation, timeout=5)
                            if response.status_code < 400:
                                valid_sources.append(citation)
                            else:
                                invalid_sources.append(f"{citation} - HTTP {response.status_code}")
                        else:
                            invalid_sources.append(f"{citation} - Invalid URL format")
                    except Exception as e:
                        invalid_sources.append(f"{citation} - {str(e)}")
                
                # Check for known reliable domains
                elif any(domain in citation.lower() for domain in [
                    'texas.gov', 'dshs.texas.gov', 'legis.state.tx.us',
                    'nist.gov', 'fda.gov', 'cdc.gov'
                ]):
                    valid_sources.append(citation)
                
                else:
                    # Assume it's a reference that needs manual validation
                    invalid_sources.append(f"{citation} - Requires manual validation")
            
            return {
                "is_valid": len(valid_sources) > 0 and len(invalid_sources) == 0,
                "valid_sources": valid_sources,
                "invalid_sources": invalid_sources,
                "total_sources": len(citations)
            }
            
        except Exception as e:
            logger.error(f"❌ Source validation failed: {e}")
            return {
                "is_valid": False,
                "valid_sources": [],
                "invalid_sources": [f"Validation error: {str(e)}"],
                "total_sources": len(citations) if citations else 0
            }
    
    def comprehensive_verification(self, response: str, context: str = "", citations: List[str] = None) -> Dict[str, Any]:
        """
        Run all verification checks on a response
        
        Args:
            response: The AI response to verify
            context: Additional context for checking
            citations: List of sources/citations
            
        Returns:
            Comprehensive verification results
        """
        try:
            # Run all checks
            fact_result = self.fact_check(response)
            logic_result = self.logical_consistency_check(response, context)
            source_result = self.source_validation(citations or [])
            
            # Calculate overall score
            overall_score = (
                fact_result["score"] * 0.4 +
                (1.0 if logic_result["is_consistent"] else 0.0) * 0.3 +
                (1.0 if source_result["is_valid"] else 0.0) * 0.3
            )
            
            # Determine if response passes
            passes = (
                fact_result["pass"] and
                logic_result["is_consistent"] and
                source_result["is_valid"]
            )
            
            return {
                "passes": passes,
                "overall_score": overall_score,
                "fact_check": fact_result,
                "logical_consistency": logic_result,
                "source_validation": source_result,
                "timestamp": datetime.now().isoformat(),
                "requires_correction": not passes
            }
            
        except Exception as e:
            logger.error(f"❌ Comprehensive verification failed: {e}")
            return {
                "passes": False,
                "overall_score": 0.0,
                "error": str(e),
                "requires_correction": True
            }

    async def verify_statement_async(self, statement: str, context: str = "") -> Dict[str, Any]:
        """Verify a statement asynchronously"""
        # For now, just call the synchronous method
        # In a real implementation, this could be parallelized
        return self.comprehensive_verification(statement, context)

# Global instance
truth_cascade = TruthCascade()
