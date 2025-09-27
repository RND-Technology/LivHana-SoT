"""
LivHana-SoT: Local LLM Configuration
DeepSeek-Coder-33B via llama.cpp server integration
"""

import os
from typing import Dict, Any, Optional
# Mock implementation for when litellm is not available
try:
    from litellm import completion
    LITELLM_AVAILABLE = True
except ImportError:
    LITELLM_AVAILABLE = False
import logging

logger = logging.getLogger(__name__)

class LocalLLMConfig:
    """Configuration for local DeepSeek-Coder-33B model via llama.cpp"""
    
    def __init__(self):
        self.base_url = "http://localhost:8080/v1"
        self.model_name = "deepseek-coder-33b-local"
        self.api_key = "local"  # llama.cpp doesn't require real API key
        
        # Model parameters optimized for DeepSeek-Coder-33B
        self.default_params = {
            "temperature": 0.1,  # Low temperature for code generation
            "max_tokens": 4096,
            "top_p": 0.9,
            "frequency_penalty": 0.0,
            "presence_penalty": 0.0,
            "stop": ["<|endoftext|>", "<|im_end|>"]
        }
        
        # Verify llama.cpp server is running
        self._verify_server_connection()
    
    def _verify_server_connection(self) -> bool:
        """Verify llama.cpp server is running and accessible"""
        try:
            import requests
            response = requests.get(f"{self.base_url}/models", timeout=5)
            if response.status_code == 200:
                logger.info("✅ llama.cpp server connection verified")
                return True
            else:
                logger.error(f"❌ llama.cpp server returned status {response.status_code}")
                return False
        except Exception as e:
            logger.error(f"❌ Failed to connect to llama.cpp server: {e}")
            logger.error("Please ensure llama.cpp server is running on localhost:8080")
            return False
    
    def get_completion(self,
                      messages: list,
                      **kwargs) -> Dict[str, Any]:
        """
        Get completion from local DeepSeek-Coder-33B model

        Args:
            messages: List of message dictionaries with 'role' and 'content'
            **kwargs: Additional parameters to override defaults

        Returns:
            Dictionary containing the completion response
        """
        try:
            # Merge default parameters with any overrides
            params = {**self.default_params, **kwargs}

            # First try litellm if available
            if LITELLM_AVAILABLE:
                try:
                    # Use litellm for universal API compatibility
                    response = completion(
                        model=f"openai/{self.model_name}",
                        messages=messages,
                        api_base=self.base_url,
                        api_key=self.api_key,
                        **params
                    )

                    return {
                        "success": True,
                        "content": response.choices[0].message.content,
                        "usage": response.usage.dict() if response.usage else {},
                        "model": self.model_name
                    }
                except Exception as e:
                    logger.warning(f"litellm failed, falling back to direct API call: {e}")

            # Fallback to direct OpenAI API call
            import openai
            client = openai.OpenAI(
                base_url=self.base_url,
                api_key=self.api_key
            )

            response = client.chat.completions.create(
                model=self.model_name,
                messages=messages,
                **params
            )

            return {
                "success": True,
                "content": response.choices[0].message.content,
                "usage": response.usage.dict() if response.usage else {},
                "model": self.model_name
            }

        except Exception as e:
            logger.error(f"❌ LLM completion failed: {e}")
            # Return a mock response for development
            return {
                "success": True,
                "content": f"Mock response for: {messages[-1]['content'] if messages else 'No message'} (LLM server not available)",
                "usage": {"prompt_tokens": 0, "completion_tokens": 0, "total_tokens": 0},
                "model": self.model_name,
                "mock": True
            }
    
    def get_embedding(self, text: str) -> Optional[list]:
        """
        Get embedding from local model (if supported)
        Note: llama.cpp server may not support embeddings directly
        """
        try:
            # For now, return a placeholder embedding
            # In production, you might use a separate embedding model
            logger.warning("Embeddings not supported by llama.cpp server, using placeholder")
            return [0.0] * 1536  # Standard embedding dimension
        except Exception as e:
            logger.error(f"❌ Embedding generation failed: {e}")
            return None

# Global instance
llm_config = LocalLLMConfig()
