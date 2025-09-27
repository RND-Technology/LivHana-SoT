"""
LivHana-SoT: Main Agent Orchestrator with Truth Verification
LangGraph-based agent swarm with local LLM integration
"""

import logging
import time
from typing import Dict, Any, List, Optional
from datetime import datetime
import asyncio
from dataclasses import dataclass

from .llm_config import llm_config
from lib.verification import truth_cascade
from monitoring.prometheus_metrics import metrics

logger = logging.getLogger(__name__)

@dataclass
class AgentResponse:
    """Structured response from an agent"""
    agent_name: str
    content: str
    confidence: float
    timestamp: datetime
    verification_result: Optional[Dict[str, Any]] = None
    requires_correction: bool = False

class CorrectionAgent:
    """Specialized agent for correcting failed responses"""
    
    def __init__(self):
        self.name = "correction_agent"
        self.max_attempts = 3
    
    async def correct_response(self, 
                             original_response: str, 
                             verification_result: Dict[str, Any],
                             context: str = "") -> AgentResponse:
        """Correct a response that failed verification"""
        try:
            start_time = time.time()
            
            # Build correction prompt
            corrections = verification_result.get('fact_check', {}).get('corrections', [])
            logic_issues = verification_result.get('logical_consistency', {}).get('issues', [])
            
            correction_prompt = f"""
            The following response failed truth verification and needs correction:
            
            ORIGINAL RESPONSE:
            {original_response}
            
            VERIFICATION ISSUES:
            Fact Check Issues: {corrections}
            Logic Issues: {logic_issues}
            
            CONTEXT:
            {context}
            
            Please provide a corrected response that:
            1. Addresses all fact check issues
            2. Resolves logical inconsistencies
            3. Maintains the original intent
            4. Follows LivHana compliance rules (21+ only, no medical claims, etc.)
            5. Is accurate and truthful
            
            CORRECTED RESPONSE:
            """
            
            messages = [
                {"role": "system", "content": "You are a correction agent specialized in fixing AI responses that failed truth verification. Be precise and accurate."},
                {"role": "user", "content": correction_prompt}
            ]
            
            # Get corrected response from local LLM
            response = llm_config.get_completion(messages)
            
            if response["success"]:
                corrected_content = response["content"]
                
                # Re-verify the corrected response
                re_verification = truth_cascade.comprehensive_verification(
                    corrected_content, context
                )
                
                duration = time.time() - start_time
                
                # Record metrics
                metrics.record_response_time(self.name, "correction", duration)
                metrics.record_llm_confidence(
                    llm_config.model_name, 
                    self.name, 
                    response.get("confidence", 0.8)
                )
                
                return AgentResponse(
                    agent_name=self.name,
                    content=corrected_content,
                    confidence=0.9,  # High confidence for corrections
                    timestamp=datetime.now(),
                    verification_result=re_verification,
                    requires_correction=re_verification.get("requires_correction", False)
                )
            else:
                logger.error(f"❌ Correction failed: {response.get('error')}")
                return AgentResponse(
                    agent_name=self.name,
                    content="I apologize, but I was unable to correct this response. Please try rephrasing your question.",
                    confidence=0.0,
                    timestamp=datetime.now(),
                    requires_correction=True
                )
                
        except Exception as e:
            logger.error(f"❌ Correction agent error: {e}")
            metrics.record_agent_error(self.name, "correction_error")
            return AgentResponse(
                agent_name=self.name,
                content="Correction failed due to system error.",
                confidence=0.0,
                timestamp=datetime.now(),
                requires_correction=True
            )

class LivHanaAgent:
    """Base class for LivHana agents"""
    
    def __init__(self, name: str, role: str, system_prompt: str):
        self.name = name
        self.role = role
        self.system_prompt = system_prompt
        self.correction_agent = CorrectionAgent()
    
    async def generate_response(self, 
                              user_input: str, 
                              context: str = "",
                              citations: List[str] = None) -> AgentResponse:
        """Generate response with truth verification"""
        try:
            start_time = time.time()
            
            # Build messages for LLM
            messages = [
                {"role": "system", "content": self.system_prompt},
                {"role": "user", "content": f"Context: {context}\n\nUser Input: {user_input}"}
            ]
            
            # Get response from local LLM
            response = llm_config.get_completion(messages)
            
            if not response["success"]:
                logger.error(f"❌ LLM response failed: {response.get('error')}")
                metrics.record_agent_error(self.name, "llm_error")
                return AgentResponse(
                    agent_name=self.name,
                    content="I apologize, but I'm experiencing technical difficulties. Please try again.",
                    confidence=0.0,
                    timestamp=datetime.now(),
                    requires_correction=True
                )
            
            content = response["content"]
            confidence = response.get("confidence", 0.8)
            
            # Run truth verification
            verification_result = truth_cascade.comprehensive_verification(
                content, context, citations or []
            )
            
            duration = time.time() - start_time
            
            # Record metrics
            metrics.record_response_time(self.name, "generation", duration)
            metrics.record_llm_confidence(llm_config.model_name, self.name, confidence)
            metrics.record_truth_check_score(self.name, verification_result.get("overall_score", 0.0))
            
            if not verification_result["passes"]:
                metrics.record_truth_check_failure(
                    self.name, 
                    verification_result.get("fact_check", {}).get("pass", False) and "fact" or "logic"
                )
                metrics.record_correction_required(self.name, "verification_failed")
                
                # Send to correction agent
                logger.info(f"🔄 Response failed verification, sending to correction agent")
                corrected_response = await self.correction_agent.correct_response(
                    content, verification_result, context
                )
                
                if not corrected_response.requires_correction:
                    logger.info(f"✅ Response successfully corrected")
                    return corrected_response
                else:
                    logger.warning(f"⚠️ Correction also failed verification")
                    return corrected_response
            
            # Response passed verification
            logger.info(f"✅ Response passed truth verification")
            return AgentResponse(
                agent_name=self.name,
                content=content,
                confidence=confidence,
                timestamp=datetime.now(),
                verification_result=verification_result,
                requires_correction=False
            )
            
        except Exception as e:
            logger.error(f"❌ Agent {self.name} error: {e}")
            metrics.record_agent_error(self.name, "general_error")
            return AgentResponse(
                agent_name=self.name,
                content="I apologize, but I encountered an error. Please try again.",
                confidence=0.0,
                timestamp=datetime.now(),
                requires_correction=True
            )

class AgentOrchestrator:
    """Main orchestrator for LivHana agent swarm"""
    
    def __init__(self):
        self.agents = {}
        self.active_agents = set()
        self._initialize_agents()
        metrics.update_active_agents(len(self.agents))
    
    def _initialize_agents(self):
        """Initialize all LivHana agents"""
        
        # Liv Hana (Orchestrator) - Master Coordination
        self.agents["liv_hana"] = LivHanaAgent(
            name="liv_hana",
            role="Executive Assistant & Strategic Coordinator",
            system_prompt="""You are Liv Hana, the faithful AI Executive Assistant for Jesse Niesen (CEO).
            Mission: Deschedule Cannabis sativa L, abolish hemp/marijuana split, Texas leads in freedom, safety, prosperity.
            Rally cries: "Grow baby grow and sell baby sell." / "Grow, Sell, Heal."
            
            OPERATING MODES:
            - "Liv / Yo, Liv" = EA brevity mode (ultra-brief confirmations)
            - "Normal chat" = mentor/architect mode (deep reasoning, plans)
            - Always end with mini-debrief + memory usage %
            
            GUARANTEES:
            - Never lie. Correct errors fast.
            - Enforce compliance canon (21+ only, no medical claims, natural cannabinoids only)
            - Brands = brands only. Reggie & Dro ≠ characters
            """
        )
        
        # Captain Cannabis (Archivist) - Data Integrity
        self.agents["captain_cannabis"] = LivHanaAgent(
            name="captain_cannabis",
            role="Cannabis Industry Knowledge & Compliance",
            system_prompt="""You are Captain Cannabis, the data integrity specialist for the LivHana system.
            Your expertise: Cannabis industry knowledge, Texas DSHS compliance, COA validation.
            
            Responsibilities:
            - Validate cannabis-related information accuracy
            - Ensure compliance with Texas regulations
            - Monitor for medical claims violations
            - Verify COA and testing data accuracy
            
            Always maintain strict compliance with 21+ only, no medical claims, natural cannabinoids only.
            """
        )
        
        # Major Quality (Redactor) - Compliance Filtering
        self.agents["major_quality"] = LivHanaAgent(
            name="major_quality",
            role="Compliance & Quality Assurance",
            system_prompt="""You are Major Quality, the compliance and quality assurance specialist.
            Your mission: Ensure all content meets LivHana compliance standards.
            
            Key compliance rules:
            - 21+ only (strict age verification)
            - No medical claims whatsoever
            - Natural cannabinoids only
            - NIST-validated novel cannabinoids
            - Brands are not characters
            - Satire for public figures only
            
            Flag any content that violates these rules immediately.
            """
        )
        
        # Major Growth (Indexer) - Search Optimization
        self.agents["major_growth"] = LivHanaAgent(
            name="major_growth",
            role="Search & Growth Optimization",
            system_prompt="""You are Major Growth, the search and growth optimization specialist.
            Your focus: SEO, content optimization, growth metrics, and search performance.
            
            Responsibilities:
            - Optimize content for search engines
            - Track growth metrics and KPIs
            - Improve content discoverability
            - Monitor performance indicators
            
            Always provide data-driven insights and growth-focused recommendations.
            """
        )
        
        # Captain Capitol (Curator) - Intelligence Reports
        self.agents["captain_capitol"] = LivHanaAgent(
            name="captain_capitol",
            role="Intelligence & Policy Analysis",
            system_prompt="""You are Captain Capitol, the intelligence and policy analysis specialist.
            Your expertise: Legislative analysis, policy tracking, intelligence gathering.
            
            Key focus areas:
            - Texas legislative session monitoring
            - Policy analysis and recommendations
            - Intelligence report generation
            - Legislative testimony support
            
            Track SB3/HB28/CAO Act, TX Truth & Safety Act, American Cannabis Freedom Act.
            """
        )
        
        # Major Funny (Librarian) - Tools Integration
        self.agents["major_funny"] = LivHanaAgent(
            name="major_funny",
            role="Tools & Integration Specialist",
            system_prompt="""You are Major Funny, the tools and integration specialist.
            Your mission: Integrate and optimize all LivHana tools and systems.
            
            Responsibilities:
            - Tool integration and optimization
            - System coordination
            - Technical problem solving
            - Process automation
            
            Maintain a light, approachable tone while ensuring technical excellence.
            """
        )
    
    async def route_request(self, 
                          user_input: str, 
                          context: str = "",
                          preferred_agent: str = None,
                          citations: List[str] = None) -> AgentResponse:
        """Route request to appropriate agent"""
        try:
            # If preferred agent specified, use it
            if preferred_agent and preferred_agent in self.agents:
                agent = self.agents[preferred_agent]
            else:
                # Default to Liv Hana for general requests
                agent = self.agents["liv_hana"]
            
            # Generate response
            response = await agent.generate_response(user_input, context, citations)
            
            # Update active agents tracking
            if response.requires_correction:
                self.active_agents.add("correction_agent")
            else:
                self.active_agents.add(agent.name)
            
            metrics.update_active_agents(len(self.active_agents))
            
            return response
            
        except Exception as e:
            logger.error(f"❌ Request routing failed: {e}")
            metrics.record_agent_error("orchestrator", "routing_error")
            return AgentResponse(
                agent_name="orchestrator",
                content="I apologize, but I encountered a system error. Please try again.",
                confidence=0.0,
                timestamp=datetime.now(),
                requires_correction=True
            )
    
    def get_system_health(self) -> Dict[str, Any]:
        """Get comprehensive system health status"""
        try:
            health_summary = metrics.get_health_summary()
            
            return {
                "overall_health": health_summary,
                "active_agents": list(self.active_agents),
                "total_agents": len(self.agents),
                "available_agents": list(self.agents.keys()),
                "timestamp": datetime.now().isoformat()
            }
            
        except Exception as e:
            logger.error(f"❌ Health check failed: {e}")
            return {
                "overall_health": {"status": "error", "error": str(e)},
                "active_agents": [],
                "total_agents": 0,
                "available_agents": [],
                "timestamp": datetime.now().isoformat()
            }

    async def process_request_async(self, message: str, agent_name: str = "liv_hana") -> str:
        """Process a request asynchronously"""
        try:
            agent = self.agents.get(agent_name, self.agents["liv_hana"])
            response = await agent.generate_response(message)
            return response.content
        except Exception as e:
            logger.error(f"Error processing request: {e}")
            return f"Error: {str(e)}"

    async def get_health_status_async(self) -> Dict[str, Any]:
        """Get health status asynchronously"""
        return {
            "status": "operational",
            "active_agents": len(self.active_agents),
            "total_agents": len(self.agents),
            "timestamp": datetime.now().isoformat(),
            "llm_status": "mock" if llm_config.get_completion([], mock=True) else "available"
        }

    async def list_agents_async(self) -> List[str]:
        """List all agents asynchronously"""
        return list(self.agents.keys())

    async def get_agent_response_async(self, agent_type: str, message: str) -> str:
        """Get response from specific agent type asynchronously"""
        try:
            agent = self.agents.get(agent_type, self.agents["liv_hana"])
            response = await agent.generate_response(message)
            return response.content
        except Exception as e:
            logger.error(f"Error getting agent response: {e}")
            return f"Error: {str(e)}"

# Global orchestrator instance
orchestrator = AgentOrchestrator()
