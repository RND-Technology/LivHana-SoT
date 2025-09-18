# ADR-0002: Containerized Build & Deployment Stack

## Status
ACCEPTED - 2024-09-17

## Context
The Liv Hana AI system comprises multiple microservices (mcp-core, mcp-deputy) and requires a deterministic, repeatable, and agent-friendly build and deployment process to achieve E2E mission success. The stack must leverage local GPU resources (M4 Max 48GB) for optimal Ollama performance while remaining portable to cloud CPU environments.

## Decision
We will adopt a multi-stage Docker build process for all services, orchestrated by `docker-compose` with environment-specific profiles. The runtime configuration will be optimized for the Apple Silicon GPU via `ollama`'s Metal backend and `q8_0` quantization for maximum performance within the 48GB memory constraint.

**Key Stack Decisions:**
*   **Base Images:** `python:3.11-slim-bookworm` for Python services. `node:20-alpine` for any future Node.js services.
*   **Orchestration:** `docker-compose` for local development and testing. `terraform` + `google-cloud-sdk` for GCP provisioning.
*   **Ollama Optimization:** The `ollama` service will run natively on the host (Mac OS) for maximum Metal GPU integration, not inside a container, due to current limitations with Docker on Mac for GPU passthrough. It will be connected to the containerized MCP services via the host's network.
*   **KV Cache:** `export OLLAMA_KV_CACHE_TYPE="q8_0"` is mandated for memory-efficient operation on the M4 Max.
*   **Environment:** A single `.env` file will be the source of truth for all environment variables, loaded by `docker-compose` and referenced by Terraform.

## Consequences
*   **Positive:** Builds are reproducible across any machine with Docker installed. The setup is optimized for the target M4 Max hardware.
*   **Negative:** Mac-hosted Ollama creates a slight hybrid deployment model. Full containerization of Ollama would require a Linux host with NVIDIA GPUs for a pure Docker environment.
*   **Risk:** The "one-shot" script must handle the complexity of configuring both the containerized services and the host-level Ollama process. Automation must be robust.