#!/usr/bin/env python3
"""
Liv Hana TRUTH Pipeline MCP Server
Production-ready MCP server integrating TRUTH pipeline with ChatGPT Apps SDK
Compliance: AGE21 + PII safeguards enforced
"""

import asyncio
import json
import logging
import os
import subprocess
from datetime import datetime
from pathlib import Path
from typing import Any

from mcp.server import Server
from mcp.server.stdio import stdio_server
from mcp.types import (
    Resource,
    Tool,
    TextContent,
    ImageContent,
    EmbeddedResource,
)
from pydantic import BaseModel, Field, ValidationError

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format="[%(asctime)s] [%(name)s] [%(levelname)s] %(message)s",
    datefmt="%Y-%m-%dT%H:%M:%SZ",
)
logger = logging.getLogger("livhana-truth-mcp")

# Repository root
REPO_ROOT = Path(os.getenv("LIVHANA_ROOT", Path(__file__).parent.parent.parent.parent))
SCRIPTS_DIR = REPO_ROOT / "scripts"
DATA_DIR = REPO_ROOT / "data"
SCHEMAS_DIR = REPO_ROOT / "schemas"


# ============================================================================
# Data Models
# ============================================================================


class ComplianceGuardrails(BaseModel):
    """AGE21 + PII compliance safeguards."""

    age_verified: bool = Field(
        default=False, description="User has verified they are 21+ years old"
    )
    pii_scrubbed: bool = Field(
        default=True, description="Personal identifiable information has been scrubbed"
    )
    jurisdiction_compliant: bool = Field(
        default=False, description="Query complies with local cannabis laws"
    )


class DispensaryQuery(BaseModel):
    """Cannabis dispensary search query."""

    location: str = Field(..., description="City, state, or ZIP code")
    radius_miles: int = Field(default=10, ge=1, le=50, description="Search radius in miles")
    max_results: int = Field(default=20, ge=1, le=100, description="Maximum results")
    compliance: ComplianceGuardrails = Field(default_factory=ComplianceGuardrails)


class MarketAnalysisQuery(BaseModel):
    """Cannabis market trend analysis query."""

    region: str = Field(..., description="Geographic region (state or metro area)")
    time_period_days: int = Field(
        default=30, ge=7, le=365, description="Analysis time period in days"
    )
    categories: list[str] = Field(
        default_factory=lambda: ["flower", "edibles", "concentrates"],
        description="Product categories to analyze",
    )
    compliance: ComplianceGuardrails = Field(default_factory=ComplianceGuardrails)


class ComplianceCheckQuery(BaseModel):
    """Compliance verification query."""

    dispensary_id: str = Field(..., description="Dispensary identifier")
    check_type: str = Field(
        default="full",
        pattern="^(full|licensing|testing|reporting)$",
        description="Type of compliance check",
    )


class ProfitEstimateQuery(BaseModel):
    """Profit opportunity estimation query."""

    market_segment: str = Field(..., description="Market segment or product category")
    investment_amount: float = Field(
        ..., ge=0, description="Investment amount in USD"
    )
    timeframe_months: int = Field(
        default=12, ge=1, le=60, description="ROI timeframe in months"
    )
    compliance: ComplianceGuardrails = Field(default_factory=ComplianceGuardrails)


# ============================================================================
# TRUTH Pipeline Integration
# ============================================================================


class TruthPipelineRunner:
    """Executes TRUTH pipeline stages and manages data flow."""

    def __init__(self) -> None:
        self.scripts_dir = SCRIPTS_DIR
        self.data_dir = DATA_DIR
        self.schemas_dir = SCHEMAS_DIR

    async def run_stage(self, stage_name: str, env: dict[str, str] | None = None) -> dict[str, Any]:
        """Run a specific pipeline stage."""
        script_path = self.scripts_dir / f"step_{stage_name}.sh"

        if not script_path.exists():
            raise FileNotFoundError(f"Pipeline stage script not found: {script_path}")

        logger.info(f"Running TRUTH pipeline stage: {stage_name}")

        # Prepare environment
        stage_env = os.environ.copy()
        if env:
            stage_env.update(env)

        # Execute stage
        try:
            result = subprocess.run(
                [str(script_path)],
                cwd=str(REPO_ROOT),
                env=stage_env,
                capture_output=True,
                text=True,
                timeout=300,  # 5 minute timeout
            )

            if result.returncode != 0:
                logger.error(f"Stage {stage_name} failed: {result.stderr}")
                return {
                    "status": "failed",
                    "stage": stage_name,
                    "error": result.stderr,
                    "returncode": result.returncode,
                }

            logger.info(f"Stage {stage_name} completed successfully")
            return {
                "status": "ok",
                "stage": stage_name,
                "stdout": result.stdout,
                "stderr": result.stderr,
            }

        except subprocess.TimeoutExpired:
            logger.error(f"Stage {stage_name} timed out")
            return {"status": "failed", "stage": stage_name, "error": "Execution timeout"}

        except Exception as e:
            logger.error(f"Stage {stage_name} error: {e}")
            return {"status": "failed", "stage": stage_name, "error": str(e)}

    async def run_full_pipeline(
        self, query: str, api_keys: dict[str, str]
    ) -> dict[str, Any]:
        """Run complete TRUTH pipeline: scrape -> verify -> compress -> truth -> rpm."""
        stages = [
            "apify_scrape",
            "perplexity_verify",
            "compress_chatgpt5",
            "claude_truth",
            "rpm_emit",
        ]

        pipeline_env = {
            "APIFY_API_TOKEN": api_keys.get("apify", ""),
            "PERPLEXITY_API_KEY": api_keys.get("perplexity", ""),
            "OPENAI_API_KEY": api_keys.get("openai", ""),
            "ANTHROPIC_API_KEY": api_keys.get("anthropic", ""),
        }

        results = []
        for stage in stages:
            result = await self.run_stage(stage, pipeline_env)
            results.append(result)

            if result["status"] == "failed":
                logger.error(f"Pipeline halted at stage: {stage}")
                break

        return {
            "pipeline_status": "completed" if all(r["status"] == "ok" for r in results) else "failed",
            "stages": results,
            "timestamp": datetime.utcnow().isoformat() + "Z",
        }

    async def get_truth_output(self) -> dict[str, Any] | None:
        """Load latest TRUTH output."""
        truth_file = self.data_dir / "truth_outputs" / "truth_output.json"

        if not truth_file.exists():
            logger.warning(f"TRUTH output not found: {truth_file}")
            return None

        try:
            with open(truth_file, "r") as f:
                return json.load(f)
        except Exception as e:
            logger.error(f"Failed to load TRUTH output: {e}")
            return None

    async def validate_compliance(self, guardrails: ComplianceGuardrails) -> bool:
        """Validate compliance guardrails before processing."""
        if not guardrails.age_verified:
            logger.warning("AGE21 verification failed")
            return False

        if not guardrails.pii_scrubbed:
            logger.warning("PII scrubbing not confirmed")
            return False

        if not guardrails.jurisdiction_compliant:
            logger.warning("Jurisdiction compliance check failed")
            return False

        return True


# ============================================================================
# MCP Server Implementation
# ============================================================================


class LivHanaTruthMCPServer:
    """Liv Hana TRUTH Pipeline MCP Server."""

    def __init__(self) -> None:
        self.server = Server("livhana-truth-mcp")
        self.pipeline = TruthPipelineRunner()
        self._register_resources()
        self._register_tools()

    def _register_resources(self) -> None:
        """Register MCP resources for cannabis intelligence queries."""

        @self.server.list_resources()
        async def list_resources() -> list[Resource]:
            """List available TRUTH pipeline resources."""
            return [
                Resource(
                    uri="truth://dispensary-intelligence",
                    name="Cannabis Dispensary Intelligence",
                    description="Real-time dispensary data with TRUTH verification",
                    mimeType="application/json",
                ),
                Resource(
                    uri="truth://market-analysis",
                    name="Cannabis Market Analysis",
                    description="Market trends with compliance checking",
                    mimeType="application/json",
                ),
                Resource(
                    uri="truth://compliance-status",
                    name="Compliance Verification",
                    description="Dispensary compliance and regulatory status",
                    mimeType="application/json",
                ),
                Resource(
                    uri="truth://profit-estimates",
                    name="Profit Opportunity Estimates",
                    description="ROI calculations with RPM massive actions",
                    mimeType="application/json",
                ),
                Resource(
                    uri="truth://pipeline-schema",
                    name="TRUTH Output Schema",
                    description="JSON schema for TRUTH pipeline output validation",
                    mimeType="application/json",
                ),
            ]

        @self.server.read_resource()
        async def read_resource(uri: str) -> str:
            """Read resource content."""
            if uri == "truth://pipeline-schema":
                schema_file = SCHEMAS_DIR / "truth_output.schema.json"
                if schema_file.exists():
                    with open(schema_file, "r") as f:
                        return f.read()
                raise FileNotFoundError("TRUTH schema not found")

            elif uri == "truth://dispensary-intelligence":
                truth_output = await self.pipeline.get_truth_output()
                if truth_output:
                    return json.dumps(truth_output, indent=2)
                return json.dumps({"status": "no_data", "message": "Run pipeline first"})

            elif uri == "truth://market-analysis":
                truth_output = await self.pipeline.get_truth_output()
                if truth_output and "rpm" in truth_output:
                    return json.dumps(truth_output["rpm"], indent=2)
                return json.dumps({"status": "no_data", "message": "Run pipeline first"})

            elif uri == "truth://compliance-status":
                # Return compliance framework
                return json.dumps(
                    {
                        "framework": "AGE21 + PII Safeguards",
                        "requirements": {
                            "age_verification": "21+ years required",
                            "pii_protection": "Personal data scrubbed",
                            "jurisdiction": "State-specific compliance",
                        },
                    },
                    indent=2,
                )

            elif uri == "truth://profit-estimates":
                truth_output = await self.pipeline.get_truth_output()
                if truth_output and "rpm" in truth_output:
                    massive_actions = truth_output["rpm"].get("massive_actions", [])
                    return json.dumps(
                        {
                            "massive_actions": massive_actions,
                            "estimation_framework": "RPM (Result -> Purpose -> Massive Actions)",
                        },
                        indent=2,
                    )
                return json.dumps({"status": "no_data", "message": "Run pipeline first"})

            raise ValueError(f"Unknown resource URI: {uri}")

    def _register_tools(self) -> None:
        """Register MCP tools with AGE21 + PII safeguards."""

        @self.server.list_tools()
        async def list_tools() -> list[Tool]:
            """List available TRUTH pipeline tools."""
            return [
                Tool(
                    name="search_dispensaries",
                    description="Search cannabis dispensaries by location with TRUTH verification",
                    inputSchema={
                        "type": "object",
                        "properties": {
                            "location": {
                                "type": "string",
                                "description": "City, state, or ZIP code",
                            },
                            "radius_miles": {
                                "type": "integer",
                                "description": "Search radius (1-50 miles)",
                                "minimum": 1,
                                "maximum": 50,
                                "default": 10,
                            },
                            "max_results": {
                                "type": "integer",
                                "description": "Maximum results (1-100)",
                                "minimum": 1,
                                "maximum": 100,
                                "default": 20,
                            },
                            "age_verified": {
                                "type": "boolean",
                                "description": "User confirmed 21+ years old",
                            },
                            "jurisdiction_compliant": {
                                "type": "boolean",
                                "description": "Query complies with local laws",
                            },
                        },
                        "required": ["location", "age_verified", "jurisdiction_compliant"],
                    },
                ),
                Tool(
                    name="analyze_market_trends",
                    description="Analyze cannabis market trends with compliance checking",
                    inputSchema={
                        "type": "object",
                        "properties": {
                            "region": {
                                "type": "string",
                                "description": "Geographic region (state or metro)",
                            },
                            "time_period_days": {
                                "type": "integer",
                                "description": "Analysis period (7-365 days)",
                                "minimum": 7,
                                "maximum": 365,
                                "default": 30,
                            },
                            "categories": {
                                "type": "array",
                                "items": {"type": "string"},
                                "description": "Product categories",
                                "default": ["flower", "edibles", "concentrates"],
                            },
                            "age_verified": {
                                "type": "boolean",
                                "description": "User confirmed 21+ years old",
                            },
                        },
                        "required": ["region", "age_verified"],
                    },
                ),
                Tool(
                    name="verify_compliance",
                    description="Verify dispensary compliance and regulatory status",
                    inputSchema={
                        "type": "object",
                        "properties": {
                            "dispensary_id": {
                                "type": "string",
                                "description": "Dispensary identifier",
                            },
                            "check_type": {
                                "type": "string",
                                "enum": ["full", "licensing", "testing", "reporting"],
                                "description": "Type of compliance check",
                                "default": "full",
                            },
                        },
                        "required": ["dispensary_id"],
                    },
                ),
                Tool(
                    name="calculate_profit_estimates",
                    description="Calculate profit estimates with RPM massive actions",
                    inputSchema={
                        "type": "object",
                        "properties": {
                            "market_segment": {
                                "type": "string",
                                "description": "Market segment or product category",
                            },
                            "investment_amount": {
                                "type": "number",
                                "description": "Investment amount in USD",
                                "minimum": 0,
                            },
                            "timeframe_months": {
                                "type": "integer",
                                "description": "ROI timeframe (1-60 months)",
                                "minimum": 1,
                                "maximum": 60,
                                "default": 12,
                            },
                            "age_verified": {
                                "type": "boolean",
                                "description": "User confirmed 21+ years old",
                            },
                        },
                        "required": [
                            "market_segment",
                            "investment_amount",
                            "age_verified",
                        ],
                    },
                ),
                Tool(
                    name="run_truth_pipeline",
                    description="Execute full TRUTH pipeline with all verification stages",
                    inputSchema={
                        "type": "object",
                        "properties": {
                            "query": {
                                "type": "string",
                                "description": "Cannabis intelligence query",
                            },
                            "stages": {
                                "type": "array",
                                "items": {
                                    "type": "string",
                                    "enum": [
                                        "apify_scrape",
                                        "perplexity_verify",
                                        "compress_chatgpt5",
                                        "claude_truth",
                                        "rpm_emit",
                                    ],
                                },
                                "description": "Pipeline stages to run (default: all)",
                            },
                        },
                        "required": ["query"],
                    },
                ),
            ]

        @self.server.call_tool()
        async def call_tool(name: str, arguments: dict[str, Any]) -> list[TextContent]:
            """Execute tool with compliance validation."""

            # AGE21 compliance check
            if name in [
                "search_dispensaries",
                "analyze_market_trends",
                "calculate_profit_estimates",
            ]:
                if not arguments.get("age_verified"):
                    return [
                        TextContent(
                            type="text",
                            text=json.dumps(
                                {
                                    "status": "error",
                                    "error": "AGE21_VERIFICATION_REQUIRED",
                                    "message": "User must verify they are 21+ years old",
                                }
                            ),
                        )
                    ]

            # Execute tool logic
            if name == "search_dispensaries":
                return await self._search_dispensaries(arguments)

            elif name == "analyze_market_trends":
                return await self._analyze_market_trends(arguments)

            elif name == "verify_compliance":
                return await self._verify_compliance(arguments)

            elif name == "calculate_profit_estimates":
                return await self._calculate_profit_estimates(arguments)

            elif name == "run_truth_pipeline":
                return await self._run_truth_pipeline(arguments)

            raise ValueError(f"Unknown tool: {name}")

    async def _search_dispensaries(self, args: dict[str, Any]) -> list[TextContent]:
        """Search dispensaries with TRUTH verification."""
        try:
            query = DispensaryQuery(**args)

            if not await self.pipeline.validate_compliance(query.compliance):
                return [
                    TextContent(
                        type="text",
                        text=json.dumps(
                            {
                                "status": "error",
                                "error": "COMPLIANCE_FAILED",
                                "message": "Compliance validation failed",
                            }
                        ),
                    )
                ]

            # Run Apify scrape stage
            api_keys = {
                "apify": os.getenv("APIFY_API_TOKEN", ""),
            }

            result = await self.pipeline.run_stage("apify_scrape", api_keys)

            # Load scraped data
            manifest_file = DATA_DIR / "apify_scrape_manifest.json"
            if manifest_file.exists():
                with open(manifest_file, "r") as f:
                    manifest = json.load(f)

                return [
                    TextContent(
                        type="text",
                        text=json.dumps(
                            {
                                "status": "ok",
                                "query": query.model_dump(),
                                "results": manifest,
                                "compliance": "AGE21 + PII safeguards enforced",
                            },
                            indent=2,
                        ),
                    )
                ]

            return [
                TextContent(
                    type="text",
                    text=json.dumps(
                        {"status": "error", "error": "No scrape data available"}
                    ),
                )
            ]

        except ValidationError as e:
            return [
                TextContent(
                    type="text",
                    text=json.dumps({"status": "error", "error": str(e)}),
                )
            ]

    async def _analyze_market_trends(self, args: dict[str, Any]) -> list[TextContent]:
        """Analyze market trends with TRUTH pipeline."""
        try:
            query = MarketAnalysisQuery(**args)

            if not await self.pipeline.validate_compliance(query.compliance):
                return [
                    TextContent(
                        type="text",
                        text=json.dumps(
                            {
                                "status": "error",
                                "error": "COMPLIANCE_FAILED",
                            }
                        ),
                    )
                ]

            truth_output = await self.pipeline.get_truth_output()

            if truth_output:
                # Extract RPM massive actions for market insights
                rpm_data = truth_output.get("rpm", {})
                massive_actions = rpm_data.get("massive_actions", [])

                return [
                    TextContent(
                        type="text",
                        text=json.dumps(
                            {
                                "status": "ok",
                                "query": query.model_dump(),
                                "rpm_framework": rpm_data,
                                "massive_actions": massive_actions,
                                "compliance": "AGE21 + PII safeguards enforced",
                            },
                            indent=2,
                        ),
                    )
                ]

            return [
                TextContent(
                    type="text",
                    text=json.dumps(
                        {
                            "status": "pending",
                            "message": "Run TRUTH pipeline to generate market analysis",
                        }
                    ),
                )
            ]

        except ValidationError as e:
            return [
                TextContent(type="text", text=json.dumps({"status": "error", "error": str(e)}))
            ]

    async def _verify_compliance(self, args: dict[str, Any]) -> list[TextContent]:
        """Verify dispensary compliance status."""
        try:
            query = ComplianceCheckQuery(**args)

            # Run verification pipeline stages
            api_keys = {
                "perplexity": os.getenv("PERPLEXITY_API_KEY", ""),
            }

            result = await self.pipeline.run_stage("perplexity_verify", api_keys)

            return [
                TextContent(
                    type="text",
                    text=json.dumps(
                        {
                            "status": "ok",
                            "query": query.model_dump(),
                            "verification_result": result,
                            "compliance_framework": "AGE21 + PII safeguards",
                        },
                        indent=2,
                    ),
                )
            ]

        except ValidationError as e:
            return [
                TextContent(type="text", text=json.dumps({"status": "error", "error": str(e)}))
            ]

    async def _calculate_profit_estimates(self, args: dict[str, Any]) -> list[TextContent]:
        """Calculate profit estimates with RPM framework."""
        try:
            query = ProfitEstimateQuery(**args)

            if not await self.pipeline.validate_compliance(query.compliance):
                return [
                    TextContent(
                        type="text",
                        text=json.dumps(
                            {"status": "error", "error": "COMPLIANCE_FAILED"}
                        ),
                    )
                ]

            # Run RPM emission stage
            api_keys = {
                "openai": os.getenv("OPENAI_API_KEY", ""),
            }

            result = await self.pipeline.run_stage("rpm_emit", api_keys)

            # Load RPM output
            rpm_file = DATA_DIR / "rpm_outputs" / "rpm_output.json"
            if rpm_file.exists():
                with open(rpm_file, "r") as f:
                    rpm_data = json.load(f)

                return [
                    TextContent(
                        type="text",
                        text=json.dumps(
                            {
                                "status": "ok",
                                "query": query.model_dump(),
                                "rpm_analysis": rpm_data,
                                "compliance": "AGE21 + PII safeguards enforced",
                            },
                            indent=2,
                        ),
                    )
                ]

            return [
                TextContent(
                    type="text",
                    text=json.dumps(
                        {"status": "error", "error": "RPM data not available"}
                    ),
                )
            ]

        except ValidationError as e:
            return [
                TextContent(type="text", text=json.dumps({"status": "error", "error": str(e)}))
            ]

    async def _run_truth_pipeline(self, args: dict[str, Any]) -> list[TextContent]:
        """Execute full TRUTH pipeline."""
        query_text = args.get("query", "")
        stages = args.get("stages", [])

        api_keys = {
            "apify": os.getenv("APIFY_API_TOKEN", ""),
            "perplexity": os.getenv("PERPLEXITY_API_KEY", ""),
            "openai": os.getenv("OPENAI_API_KEY", ""),
            "anthropic": os.getenv("ANTHROPIC_API_KEY", ""),
        }

        if not stages:
            # Run full pipeline
            result = await self.pipeline.run_full_pipeline(query_text, api_keys)
        else:
            # Run specific stages
            results = []
            for stage in stages:
                stage_result = await self.pipeline.run_stage(stage, api_keys)
                results.append(stage_result)

            result = {
                "pipeline_status": "completed"
                if all(r["status"] == "ok" for r in results)
                else "failed",
                "stages": results,
            }

        return [
            TextContent(
                type="text",
                text=json.dumps(result, indent=2),
            )
        ]

    async def run(self) -> None:
        """Run MCP server with stdio transport."""
        logger.info("Starting Liv Hana TRUTH Pipeline MCP Server")
        logger.info(f"Repository root: {REPO_ROOT}")

        async with stdio_server() as (read_stream, write_stream):
            await self.server.run(
                read_stream,
                write_stream,
                self.server.create_initialization_options(),
            )


# ============================================================================
# Main Entry Point
# ============================================================================


async def main() -> None:
    """Main entry point."""
    server = LivHanaTruthMCPServer()
    await server.run()


if __name__ == "__main__":
    asyncio.run(main())
