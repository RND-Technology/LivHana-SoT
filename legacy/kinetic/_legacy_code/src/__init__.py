"""
LivHana-SoT: Sovereign AI Agent Swarm
Main package initialization
"""

from .core.agent_orchestrator import orchestrator
from .core.llm_config import llm_config
from .core.mcp_server import mcp_server
from .core.agent_scaler import agent_scaler

__version__ = "1.0.0"
__author__ = "Jesse Niesen <jesse@reggieanddro.com>"
__description__ = "Sovereign AI Agent Swarm with Local LLM Integration and Truth Verification"

__all__ = [
    'orchestrator',
    'llm_config',
    'mcp_server',
    'agent_scaler'
]
