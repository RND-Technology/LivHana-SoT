"""
LivHana-SoT: MCP Server Implementation
Exposes LivHana tools and resources via Model Context Protocol
"""

import os
import json
import asyncio
import logging
from typing import Dict, Any, List, Optional, Union
from datetime import datetime

import httpx
from mcp.server.fastmcp import FastMCP
from mcp.types import TextContent

from .agent_orchestrator import orchestrator
from .llm_config import llm_config
from lib.verification import truth_cascade
from monitoring.prometheus_metrics import metrics

logger = logging.getLogger(__name__)

class LivHanaMCPServer:
    """MCP Server for LivHana Sovereign AI Agent Swarm"""

    def __init__(self):
        self.app = FastMCP("LivHana-MCP-Server", dependencies=["httpx", "requests"])
        self.api_base_url = os.getenv("API_BASE_URL", "http://localhost:8000")
        self.client_timeout = int(os.getenv("MCP_CLIENT_TIMEOUT", "30"))

        # Initialize HTTP client
        self.http_client = httpx.AsyncClient(
            timeout=self.client_timeout,
            base_url=self.api_base_url
        )

        # Register MCP tools and resources
        self._register_tools()
        self._register_resources()

    def _register_tools(self):
        """Register LivHana tools with MCP server"""

        # Chat with LivHana agents
        @self.app.tool()
        async def chat_with_agent(message: str, agent_name: str = "liv_hana", context: str = "") -> str:
            """Chat with a specific LivHana agent"""
            try:
                response = await self.http_client.post(
                    f"/chat/{agent_name}",
                    json={
                        "message": message,
                        "context": context
                    }
                )
                response.raise_for_status()
                result = response.json()

                return f"Agent {result['agent_name']} responded: {result['response']}"

            except Exception as e:
                logger.error(f"Chat tool error: {e}")
                return f"Error: {str(e)}"

        # Get system health status
        @self.app.tool()
        async def get_system_health() -> str:
            """Get comprehensive system health status"""
            try:
                response = await self.http_client.get("/health")
                response.raise_for_status()
                result = response.json()

                health_status = result.get("status", "unknown")
                active_agents = result.get("active_agents", [])
                llm_status = result.get("llm_status", "unknown")

                return json.dumps({
                    "status": health_status,
                    "active_agents": active_agents,
                    "llm_status": llm_status,
                    "timestamp": result.get("timestamp")
                }, indent=2)

            except Exception as e:
                logger.error(f"Health check tool error: {e}")
                return f"Error: {str(e)}"

        # List available agents
        @self.app.tool()
        async def list_agents() -> str:
            """List all available LivHana agents"""
            try:
                response = await self.http_client.get("/agents")
                response.raise_for_status()
                result = response.json()

                agents = result.get("agents", [])
                active = result.get("active_agents", [])
                total = result.get("total_agents", 0)

                return json.dumps({
                    "available_agents": agents,
                    "active_agents": active,
                    "total_agents": total
                }, indent=2)

            except Exception as e:
                logger.error(f"List agents tool error: {e}")
                return f"Error: {str(e)}"

        # Get system metrics
        @self.app.tool()
        async def get_metrics() -> str:
            """Get Prometheus metrics from the system"""
            try:
                response = await self.http_client.get("/metrics")
                response.raise_for_status()
                return response.text

            except Exception as e:
                logger.error(f"Metrics tool error: {e}")
                return f"Error: {str(e)}"

        # Run truth verification on content
        @self.app.tool()
        async def verify_truth(content: str, context: str = "") -> str:
            """Run truth verification on content"""
            try:
                # Use the local truth verification system
                verification_result = truth_cascade.comprehensive_verification(
                    content, context
                )

                return json.dumps(verification_result, indent=2)

            except Exception as e:
                logger.error(f"Truth verification tool error: {e}")
                return f"Error: {str(e)}"

        # Get agent-specific response
        @self.app.tool()
        async def get_agent_response(agent_name: str, message: str, context: str = "") -> str:
            """Get response from a specific agent"""
            try:
                response = await self.http_client.post(
                    f"/chat/{agent_name}",
                    json={
                        "message": message,
                        "context": context
                    }
                )
                response.raise_for_status()
                result = response.json()

                return json.dumps(result, indent=2)

            except Exception as e:
                logger.error(f"Agent response tool error: {e}")
                return f"Error: {str(e)}"

    def _register_resources(self):
        """Register LivHana resources with MCP server"""

        # System status resource
        @self.app.resource("system://status")
        async def get_system_status() -> str:
            """Current system status"""
            try:
                health = orchestrator.get_system_health()
                return json.dumps(health, indent=2)
            except Exception as e:
                return f"Error getting system status: {str(e)}"

        # Available agents resource
        @self.app.resource("system://agents")
        async def get_available_agents() -> str:
            """List of available agents"""
            try:
                agents = list(orchestrator.agents.keys())
                return json.dumps({
                    "agents": agents,
                    "count": len(agents)
                }, indent=2)
            except Exception as e:
                return f"Error getting agents: {str(e)}"

        # System configuration resource
        @self.app.resource("system://config")
        async def get_system_config() -> str:
            """System configuration"""
            try:
                config = {
                    "model_name": llm_config.model_name,
                    "base_url": llm_config.base_url,
                    "api_key": "****",  # Masked for security
                    "default_params": llm_config.default_params
                }
                return json.dumps(config, indent=2)
            except Exception as e:
                return f"Error getting system config: {str(e)}"

        # Compliance rules resource
        @self.app.resource("compliance://rules")
        async def get_compliance_rules() -> str:
            """LivHana compliance rules"""
            try:
                rules = {
                    "age_verification": "21+ only",
                    "medical_claims": "No medical claims whatsoever",
                    "cannabinoids": "Natural cannabinoids only",
                    "validation": "NIST-validated methods",
                    "brands": "Brands are not characters",
                    "satire": "Satire for public figures only"
                }
                return json.dumps(rules, indent=2)
            except Exception as e:
                return f"Error getting compliance rules: {str(e)}"

    async def start(self):
        """Start the MCP server"""
        logger.info("🚀 Starting LivHana MCP Server...")

        # FastMCP handles all the protocol details automatically
        # Just run the server
        async with self.app.run() as server:
            await server.wait_closed()

    async def stop(self):
        """Stop the MCP server"""
        logger.info("🛑 Stopping LivHana MCP Server...")
        await self.http_client.aclose()

# Global MCP server instance
mcp_server = LivHanaMCPServer()

if __name__ == "__main__":
    # Configure logging
    logging.basicConfig(
        level=logging.INFO,
        format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
    )

    # Start the MCP server
    async def main():
        await mcp_server.start()

    asyncio.run(main())
