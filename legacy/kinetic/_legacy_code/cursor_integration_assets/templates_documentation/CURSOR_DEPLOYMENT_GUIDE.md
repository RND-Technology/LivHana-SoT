### CURSOR DEPLOYMENT GUIDE

Prereqs:
- macOS, Cursor latest, GitHub login, access to this repo

Setup (15 minutes):
1) Open folder in Cursor: `LivHana-SoT/`
2) Load prompt: `cursor_integration_assets/one_shot_prompts/MASTER_AUTONOMOUS_CANNABIS_EMPIRE_PROMPT.md`
3) Configure models: DeepSeek local primary; OpenAI/Anthropic fallback via secrets
4) Install extensions: GitHub, Copilot, Python, Docker, Kubernetes
5) Copy `.env` from `env.example`; add provider keys; run `./setup.sh`

Run:
- Local APIs: `uvicorn main:app --reload`
- Monitoring: `docker compose up -d prometheus grafana`

Validate:
- Run tests: `pytest -q`
- Open dashboards: http://localhost:9090 and Grafana

Ship:
- Create branch, make edits, run CI, open PR; ArgoCD deploys on merge

