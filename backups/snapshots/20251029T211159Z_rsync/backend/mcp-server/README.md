# Liv Hana TRUTH Pipeline MCP Server

---
**Last Audited:** 2025-10-29
**Audited By:** Liv Hana (Tier-1)
**Marine Corps Standard:** Upheld ✅
**Next Audit:** 2025-11-28 (30 days)
---


Production-ready MCP (Model Context Protocol) server integrating the Liv Hana TRUTH pipeline with ChatGPT Apps SDK for cannabis dispensary intelligence.

## Overview

This MCP server provides ChatGPT with real-time access to:

- **Cannabis dispensary data** with TRUTH verification
- **Market trend analysis** with compliance checking
- **Regulatory compliance verification**
- **Profit opportunity estimation** with RPM framework
- **Complete TRUTH pipeline** execution (5-stage verification)

### Compliance Framework

**AGE21 + PII Safeguards Enforced:**

- Age verification (21+ years) required for all cannabis queries
- Personal identifiable information (PII) automatically scrubbed
- State-specific jurisdiction compliance validation
- Regulatory framework adherence

## Architecture

### TRUTH Pipeline Stages

1. **Apify Scraping** (`step_apify_scrape.sh`)
   - Real-time dispensary data collection
   - Google Maps API integration
   - Structured data extraction

2. **Perplexity Verification** (`step_perplexity_verify.sh`)
   - Multi-source fact verification
   - Cross-reference validation
   - Confidence scoring

3. **GPT-5 Compression** (`step_compress_chatgpt5.sh`)
   - Token-efficient data compression
   - Context window optimization
   - Semantic preservation

4. **Claude TRUTH Synthesis** (`step_claude_truth.sh`)
   - TRUTH contract validation
   - Testable claims generation
   - Source traceability enforcement

5. **RPM Emission** (`step_rpm_emit.sh`)
   - Result-Purpose-Massive Actions framework
   - Profit contribution estimates
   - Autonomous action identification

### MCP Resources

The server exposes these resources to ChatGPT:

- `truth://dispensary-intelligence` - Real-time dispensary data
- `truth://market-analysis` - Market trends and insights
- `truth://compliance-status` - Compliance verification framework
- `truth://profit-estimates` - ROI calculations with RPM
- `truth://pipeline-schema` - TRUTH output JSON schema

### MCP Tools

The server provides these callable tools:

- `search_dispensaries` - Location-based dispensary search
- `analyze_market_trends` - Cannabis market trend analysis
- `verify_compliance` - Regulatory compliance checking
- `calculate_profit_estimates` - ROI and profit estimates
- `run_truth_pipeline` - Execute full or partial TRUTH pipeline

## Installation

### Prerequisites

- Python 3.11+
- Git
- API keys:
  - Apify API token
  - Perplexity API key
  - OpenAI API key
  - Anthropic API key

### Quick Start

1. **Clone repository:**

```bash
cd /path/to/LivHana-SoT/backend/mcp-server
```

2. **Install dependencies:**

```bash
pip install -e .
```

3. **Configure environment:**

```bash
cp .env.example .env
# Edit .env with your API keys
```

4. **Test server locally:**

```bash
python -m src.server
```

### Docker Deployment

```bash
# Build image
docker-compose build

# Run server
docker-compose up -d

# View logs
docker-compose logs -f livhana-truth-mcp
```

## ChatGPT Integration

### Developer Mode Setup

1. **Open ChatGPT Desktop App** (with Developer Mode enabled)

2. **Navigate to Settings** → **Integrations** → **MCP Servers**

3. **Add new server:**

```json
{
  "name": "Liv Hana TRUTH Pipeline",
  "command": "python",
  "args": ["-m", "src.server"],
  "cwd": "/path/to/LivHana-SoT/backend/mcp-server",
  "env": {
    "LIVHANA_ROOT": "/path/to/LivHana-SoT",
    "APIFY_API_TOKEN": "your_apify_token",
    "PERPLEXITY_API_KEY": "your_perplexity_key",
    "OPENAI_API_KEY": "your_openai_key",
    "ANTHROPIC_API_KEY": "your_anthropic_key"
  }
}
```

4. **Test connection:**

```
Ask ChatGPT: "List available TRUTH pipeline resources"
```

### Production Deployment

For production deployment with HTTPS endpoint:

1. **Deploy to cloud server** (AWS, GCP, Azure)

2. **Expose HTTPS endpoint** (use ngrok for testing):

```bash
ngrok http 3000
```

3. **Update ChatGPT configuration** with HTTPS URL

4. **Enable authentication** (OAuth 2.1 recommended)

## Usage Examples

### Example 1: Search Dispensaries

**ChatGPT Prompt:**

```
Search for cannabis dispensaries in Denver, CO within 10 miles.
I confirm I am 21+ years old.
```

**MCP Tool Call:**

```json
{
  "tool": "search_dispensaries",
  "arguments": {
    "location": "Denver, CO",
    "radius_miles": 10,
    "max_results": 20,
    "age_verified": true,
    "jurisdiction_compliant": true
  }
}
```

**Response:**

```json
{
  "status": "ok",
  "results": {
    "total_queries": 1,
    "total_files": 1,
    "items": [...]
  },
  "compliance": "AGE21 + PII safeguards enforced"
}
```

### Example 2: Analyze Market Trends

**ChatGPT Prompt:**

```
Analyze cannabis market trends in California for the last 90 days.
Focus on edibles and concentrates. I am 21+.
```

**MCP Tool Call:**

```json
{
  "tool": "analyze_market_trends",
  "arguments": {
    "region": "California",
    "time_period_days": 90,
    "categories": ["edibles", "concentrates"],
    "age_verified": true
  }
}
```

### Example 3: Verify Compliance

**ChatGPT Prompt:**

```
Check the full compliance status for dispensary ID: DISP-12345
```

**MCP Tool Call:**

```json
{
  "tool": "verify_compliance",
  "arguments": {
    "dispensary_id": "DISP-12345",
    "check_type": "full"
  }
}
```

### Example 4: Calculate Profit Estimates

**ChatGPT Prompt:**

```
Estimate profit for investing $50,000 in the Colorado edibles market
over 12 months. I am 21+.
```

**MCP Tool Call:**

```json
{
  "tool": "calculate_profit_estimates",
  "arguments": {
    "market_segment": "Colorado edibles",
    "investment_amount": 50000,
    "timeframe_months": 12,
    "age_verified": true
  }
}
```

**Response includes RPM massive actions:**

```json
{
  "status": "ok",
  "rpm_analysis": {
    "result": "...",
    "purpose": "...",
    "massive_actions": [
      {
        "action": "Launch edibles product line",
        "profit_contribution_estimate": "$15,000/month",
        "timeframe_hours_parallel": 720,
        "autonomous_capable": false,
        "dependencies": ["licensing", "facility"],
        "guardrails": ["AGE21", "state_testing"]
      }
    ]
  }
}
```

### Example 5: Run Full TRUTH Pipeline

**ChatGPT Prompt:**

```
Run the complete TRUTH pipeline for cannabis dispensaries in Seattle.
```

**MCP Tool Call:**

```json
{
  "tool": "run_truth_pipeline",
  "arguments": {
    "query": "cannabis dispensaries Seattle WA",
    "stages": []  // Empty = run all stages
  }
}
```

**Pipeline execution:**

1. Scrape dispensary data (Apify)
2. Verify facts (Perplexity)
3. Compress data (GPT-5)
4. Synthesize TRUTH (Claude)
5. Generate RPM (Massive Actions)

## Configuration

### Environment Variables

| Variable | Required | Description |
|----------|----------|-------------|
| `LIVHANA_ROOT` | Yes | Repository root path |
| `APIFY_API_TOKEN` | Yes | Apify API token |
| `PERPLEXITY_API_KEY` | Yes | Perplexity API key |
| `OPENAI_API_KEY` | Yes | OpenAI API key |
| `ANTHROPIC_API_KEY` | Yes | Anthropic API key |
| `LOG_LEVEL` | No | Logging level (default: INFO) |
| `PIPELINE_STAGE_TIMEOUT` | No | Stage timeout in seconds (default: 300) |

### ChatGPT Configuration Files

- `config/chatgpt-config.json` - ChatGPT Apps SDK configuration
- `config/server-manifest.json` - MCP server manifest
- `.env.example` - Environment template

## Testing

### Unit Tests

```bash
# Install dev dependencies
pip install -e ".[dev]"

# Run tests
pytest tests/ -v

# Run with coverage
pytest tests/ --cov=src --cov-report=html
```

### Integration Tests

```bash
# Test full pipeline
python tests/test_integration.py

# Test individual stages
python tests/test_pipeline_stages.py
```

### Manual Testing with MCP Inspector

```bash
# Install MCP inspector
npm install -g @modelcontextprotocol/inspector

# Run inspector
mcp-inspector python -m src.server
```

## Troubleshooting

### Common Issues

**1. API Key Errors**

```
ERROR: APIFY_API_TOKEN environment variable is required
```

**Solution:** Verify `.env` file has all required API keys

**2. Pipeline Stage Timeout**

```
ERROR: Stage apify_scrape timed out
```

**Solution:** Increase `PIPELINE_STAGE_TIMEOUT` or check network connectivity

**3. AGE21 Verification Failure**

```
ERROR: AGE21_VERIFICATION_REQUIRED
```

**Solution:** Ensure `age_verified: true` in tool arguments

**4. Schema Validation Error**

```
ERROR: TRUTH output failed schema validation
```

**Solution:** Check TRUTH output against `schemas/truth_output.schema.json`

### Debug Mode

Enable detailed logging:

```bash
export LOG_LEVEL=DEBUG
python -m src.server
```

### Logs Location

- **Container logs:** `docker-compose logs -f`
- **Local logs:** `stdout/stderr`
- **Pipeline logs:** Check script output in `data/` directory

## Security

### Compliance Enforcement

All cannabis-related queries enforce:

- **AGE21 verification** - User must confirm 21+ years old
- **PII scrubbing** - Personal data automatically removed
- **Jurisdiction validation** - State-specific law compliance

### API Key Management

- Store API keys in `.env` (never commit to Git)
- Use environment variables in production
- Rotate keys regularly
- Use least-privilege access

### Data Privacy

- No PII stored in pipeline outputs
- Dispensary data anonymized where possible
- User queries not logged with identifiers
- GDPR/CCPA compliant data handling

## Performance

### Optimization Tips

1. **Cache TRUTH outputs** - Reuse recent pipeline results
2. **Parallel stage execution** - Run independent stages concurrently
3. **Token compression** - Use GPT-5 compression stage
4. **Resource pooling** - Maintain API connection pools

### Benchmarks

| Operation | Avg Time | Token Usage |
|-----------|----------|-------------|
| Dispensary search | 5-10s | 500-1000 |
| Market analysis | 15-30s | 2000-4000 |
| Full TRUTH pipeline | 60-120s | 5000-10000 |

## Contributing

### Development Workflow

1. Create feature branch
2. Implement changes
3. Add tests
4. Run linters: `black src/` and `ruff check src/`
5. Update documentation
6. Submit pull request

### Code Style

- **Black** for formatting
- **Ruff** for linting
- **MyPy** for type checking
- **Pydantic** for data validation

## License

Proprietary - Liv Hana © 2025

## Support

- **Documentation:** [Liv Hana Developer Portal](https://dev.livhana.com)
- **Issues:** GitHub Issues
- **Email:** <dev@livhana.com>
- **Slack:** #truth-pipeline channel

## Roadmap

### Phase 1 (Current)

- [x] MCP server implementation
- [x] TRUTH pipeline integration
- [x] AGE21 + PII compliance
- [x] ChatGPT Apps SDK compatibility

### Phase 2 (Q4 2025)

- [ ] Real-time data streaming
- [ ] WebSocket transport support
- [ ] Advanced caching layer
- [ ] Multi-region deployment

### Phase 3 (Q1 2026)

- [ ] Mobile SDK integration
- [ ] Voice interface support
- [ ] Blockchain verification layer
- [ ] International expansion

## Acknowledgments

- **OpenAI** - ChatGPT Apps SDK and GPT-5
- **Anthropic** - Claude and MCP protocol
- **Apify** - Web scraping infrastructure
- **Perplexity** - Fact verification API

---

**Built with TRUTH. Deployed with confidence.**

For day-one App Store submission when the store opens.
