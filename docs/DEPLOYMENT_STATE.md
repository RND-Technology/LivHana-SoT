# MCP Broker Deployment State - 2025-10-17

## OPERATIONAL STATUS

- Cloud Run Service: mcp-broker-prod (revision 00007-g6r)
- URL: <https://mcp-broker-prod-plad5efvha-uc.a.run.app/mcp/invoke>
- Protocol: JSON-RPC 2.0
- Auth: Bearer token via Secret Manager
- Tools: 3 (compliance, inventory, legislative)
- Status: OPERATIONAL ✅

## CREDENTIALS

- Project: reggieanddrodispensary
- Region: us-central1
- Token Secret: op-service-account-token
- Service Account: <mcp-broker-sa@reggieanddrodispensary.iam.gserviceaccount.com>

## ARCHITECTURE

- Platform: Google Cloud Run
- Container: us-central1-docker.pkg.dev/reggieanddrodispensary/mcp-broker-repo/mcp-broker-prod:mcp-v2-fixed
- Framework: FastAPI + Gunicorn + Uvicorn
- Scaling: 1-10 instances, 2Gi RAM, 2 CPU

## NEXT MISSION

OpenAI Agent Builder integration for Liv Hana RPM workflow automation
