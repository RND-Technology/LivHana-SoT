"""
LivHana-SoT: Main Application Entry Point
Sovereign AI Agent Swarm with Local LLM Integration
"""

import asyncio
import logging
import uvicorn
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import List, Optional, Dict, Any
import time
from datetime import datetime

from src import orchestrator, llm_config
from src.core.database import database
from monitoring.prometheus_metrics import metrics

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

# Initialize FastAPI app
app = FastAPI(
    title="LivHana-SoT AI Agent Swarm",
    description="Sovereign AI Agent Swarm with Local LLM Integration and Truth Verification",
    version="1.0.0"
)

# Use a different port if 8000 is in use
import os
PORT = int(os.getenv("PORT", 8080))  # Changed to 8080 to avoid conflicts
HOST = os.getenv("HOST", "0.0.0.0")

# Add CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Pydantic models
class ChatRequest(BaseModel):
    message: str
    context: Optional[str] = ""
    preferred_agent: Optional[str] = None
    citations: Optional[List[str]] = None

class ChatResponse(BaseModel):
    response: str
    agent_name: str
    confidence: float
    timestamp: str
    verification_passed: bool
    requires_correction: bool
    verification_details: Optional[Dict[str, Any]] = None
    business_data: Optional[List[Dict[str, Any]]] = None
    cannabis_data: Optional[List[Dict[str, Any]]] = None
    interaction_id: Optional[int] = None

class HealthResponse(BaseModel):
    status: str
    system_health: Dict[str, Any]
    llm_status: str
    active_agents: List[str]
    timestamp: str

# Startup event
@app.on_event("startup")
async def startup_event():
    """Initialize the LivHana system on startup"""
    logger.info("🚀 Starting LivHana-SoT AI Agent Swarm...")
    
    # Verify LLM connection
    if llm_config._verify_server_connection():
        logger.info("✅ Local LLM server connection verified")
    else:
        logger.warning("⚠️ Local LLM server not available - some features may not work")
    
    # Start health monitoring
    metrics.start_health_monitoring(interval=60)
    
    logger.info("✅ LivHana-SoT system initialized successfully")

# Health check endpoint
@app.get("/health", response_model=HealthResponse)
async def health_check():
    """Comprehensive health check endpoint"""
    try:
        system_health = orchestrator.get_system_health()
        llm_status = "connected" if llm_config._verify_server_connection() else "disconnected"
        
        return HealthResponse(
            status="healthy" if system_health["overall_health"]["status"] == "healthy" else "degraded",
            system_health=system_health,
            llm_status=llm_status,
            active_agents=list(system_health["active_agents"]),
            timestamp=datetime.now().isoformat()
        )
    except Exception as e:
        logger.error(f"❌ Health check failed: {e}")
        raise HTTPException(status_code=500, detail=f"Health check failed: {str(e)}")

# Main chat endpoint
@app.post("/chat", response_model=ChatResponse)
async def chat(request: ChatRequest):
    """Main chat endpoint with truth verification"""
    try:
        start_time = time.time()
        
        # Route request to appropriate agent
        response = await orchestrator.route_request(
            user_input=request.message,
            context=request.context or "",
            preferred_agent=request.preferred_agent,
            citations=request.citations
        )
        
        duration = time.time() - start_time

        # Record metrics
        metrics.record_response_time(
            response.agent_name,
            "api_request",
            duration
        )

        # Log interaction to database
        await database.log_agent_interaction(
            agent_name=response.agent_name,
            user_message=request.message,
            agent_response=response.content,
            confidence_score=response.confidence,
            verification_passed=not response.requires_correction,
            processing_time=duration
        )

        # Get real business data if requested
        business_data = None
        if "business" in request.message.lower() or "revenue" in request.message.lower():
            business_data = await database.get_business_metrics(days=7)

        # Get cannabis data if requested
        cannabis_data = None
        if "strain" in request.message.lower() or "cannabis" in request.message.lower():
            cannabis_data = await database.get_cannabis_strains(limit=5)

        return ChatResponse(
            response=response.content,
            agent_name=response.agent_name,
            confidence=response.confidence,
            timestamp=response.timestamp.isoformat(),
            verification_passed=not response.requires_correction,
            requires_correction=response.requires_correction,
            verification_details=response.verification_result,
            business_data=business_data,
            cannabis_data=cannabis_data
        )
        
    except Exception as e:
        logger.error(f"❌ Chat request failed: {e}")
        metrics.record_agent_error("api", "chat_error")
        raise HTTPException(status_code=500, detail=f"Chat request failed: {str(e)}")

# Agent-specific endpoints
@app.post("/chat/{agent_name}", response_model=ChatResponse)
async def chat_with_agent(agent_name: str, request: ChatRequest):
    """Chat with a specific agent"""
    try:
        if agent_name not in orchestrator.agents:
            raise HTTPException(status_code=404, detail=f"Agent '{agent_name}' not found")
        
        response = await orchestrator.route_request(
            user_input=request.message,
            context=request.context or "",
            preferred_agent=agent_name,
            citations=request.citations
        )
        
        return ChatResponse(
            response=response.content,
            agent_name=response.agent_name,
            confidence=response.confidence,
            timestamp=response.timestamp.isoformat(),
            verification_passed=not response.requires_correction,
            requires_correction=response.requires_correction,
            verification_details=response.verification_result
        )
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"❌ Agent chat request failed: {e}")
        raise HTTPException(status_code=500, detail=f"Agent chat failed: {str(e)}")

# List available agents
@app.get("/agents")
async def list_agents():
    """List all available agents"""
    try:
        return {
            "agents": list(orchestrator.agents.keys()),
            "active_agents": list(orchestrator.active_agents),
            "total_agents": len(orchestrator.agents)
        }
    except Exception as e:
        logger.error(f"❌ Failed to list agents: {e}")
        raise HTTPException(status_code=500, detail=f"Failed to list agents: {str(e)}")

# Metrics endpoint
@app.get("/metrics")
async def get_metrics():
    """Get Prometheus metrics"""
    try:
        from prometheus_client import generate_latest, CONTENT_TYPE_LATEST
        from fastapi.responses import Response
        
        return Response(
            generate_latest(),
            media_type=CONTENT_TYPE_LATEST
        )
    except Exception as e:
        logger.error(f"❌ Failed to get metrics: {e}")
        raise HTTPException(status_code=500, detail=f"Failed to get metrics: {str(e)}")

# System status endpoint
@app.get("/status")
async def get_status():
    """Get detailed system status"""
    try:
        return {
            "system_health": orchestrator.get_system_health(),
            "llm_config": {
                "model_name": llm_config.model_name,
                "base_url": llm_config.base_url,
                "connected": llm_config._verify_server_connection()
            },
            "uptime": time.time(),
            "timestamp": datetime.now().isoformat()
        }
    except Exception as e:
        logger.error(f"❌ Failed to get status: {e}")
        raise HTTPException(status_code=500, detail=f"Failed to get status: {str(e)}")

# Business metrics endpoint
@app.get("/business/metrics")
async def get_business_metrics(days: int = 30):
    """Get business metrics for the last N days"""
    try:
        return await database.get_business_metrics(days=days)
    except Exception as e:
        logger.error(f"❌ Failed to get business metrics: {e}")
        raise HTTPException(status_code=500, detail=f"Failed to get business metrics: {str(e)}")

# Cannabis strains endpoint
@app.get("/cannabis/strains")
async def get_cannabis_strains(strain_type: str = None, limit: int = 50):
    """Get cannabis strain data"""
    try:
        return await database.get_cannabis_strains(strain_type=strain_type, limit=limit)
    except Exception as e:
        logger.error(f"❌ Failed to get cannabis strains: {e}")
        raise HTTPException(status_code=500, detail=f"Failed to get cannabis strains: {str(e)}")

# Root endpoint
@app.get("/")
async def root():
    """Root endpoint with system information"""
    return {
        "name": "LivHana-SoT AI Agent Swarm",
        "version": "1.0.0",
        "description": "Sovereign AI Agent Swarm with Local LLM Integration",
        "status": "operational",
        "endpoints": {
            "chat": "/chat",
            "health": "/health",
            "agents": "/agents",
            "metrics": "/metrics",
            "status": "/status"
        }
    }

if __name__ == "__main__":
    # Start the application
    logger.info("🚀 Starting LivHana-SoT server...")
    uvicorn.run(
        "main:app",
        host=HOST,
        port=PORT,
        reload=False,
        log_level="info"
    )
