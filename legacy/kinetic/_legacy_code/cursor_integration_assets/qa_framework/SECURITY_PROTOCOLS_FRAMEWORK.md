### SECURITY PROTOCOLS FRAMEWORK

Identity:
- SSO, MFA, device posture; scoped service accounts for workloads

Secrets:
- KMS + Secret Manager; rotate; no secrets in code or logs

Network:
- mTLS, private egress, egress allowlist; WAF and rate limits

Data:
- Encrypt at rest/in transit; DLP tokenization; PII minimization and masking

AppSec:
- SAST/SCA/DAST in CI; dependency pinning; SBOMs; signed releases

IR:
- 24/7 on-call; playbooks; incident reviews; key compromise runbooks

Audit:
- Immutable logs; tamper-evident storage; access reviews monthly

