# Liv Hana Monorepo: The Unified Source of Truth

This repository is the single, unified source of truth for the Liv Hana project. It contains all code, documentation, pipelines, and configurations necessary for local development and eventual cloud deployment.

## Mission

To develop and deploy Liv Hana, a System-of-Thoughts (SoT) framework for orchestrating AI agents to achieve complex, end-to-end missions.

## Getting Started

1. **Clone the repository:**

    ```bash
    git clone <your-new-repo-url>
    cd LivHana-Monorepo
    ```

2. **Configure your environment:**
    - Copy the `.env.example` file to `.env`.
    - Edit the `.env` file and add your secret API keys (`GITHUB_TOKEN`, `OPENAI_API_KEY`, etc.).
3. **Run the setup script:**

    ```bash
    bash scripts/setup.sh
    ```

4. **Validate your setup:**

    ```bash
    bash scripts/validate.sh
    ```

## AI Agent Usage (Cursor / DeepSeek Coder)

This monorepo is optimized for AI-driven development. Use the `.cursorrules` file with Cursor and provide the entire repository as context to your local LLM. The master plan for development is located in `docs/SPEC.md`.
