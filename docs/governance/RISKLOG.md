# RISKLOG – LivHana-SoT

| ID | Category | Description | Likelihood | Impact | Status | Mitigation | Owner | Reviewed |
|----|----------|-------------|-----------|--------|--------|------------|-------|----------|
| R1 | Orchestration | Multi-model router not implemented | M | H | Open | Build baseline router + verification scripts | Liv | 2025-09-28 |
| R2 | Knowledge | Memory snapshot spec undefined | M | M | Open | Finalize `SNAPSHOT_SPEC.md` + automation | Liv | 2025-09-28 |
| R3 | Compliance | Automated gating verification absent | L | H | Monitored | Ship `check_age_gate.sh` + dashboard tile | Liv | 2025-09-28 |
| R4 | Coverage | Critical workflow inventory incomplete | M | M | Open | Populate `NSM_matrix.md` + enforce checker | Liv | 2025-09-28 |
| R5 | Drift | Infra changes not continuously diffed | L | M | Watch | Add infra plan check to CI (`check_infra_plan.sh`) | Liv | 2025-09-28 |

**Legend**  Likelihood/Impact: L=Low, M=Medium, H=High. Status: Open | Monitored | Watch | Mitigated | Closed.

**Review cadence:** Weekly (High Noon T-30 cycle). Update `Reviewed` column each session. Continuous mitigation required before Go-Live.

<!-- Last verified: 2025-10-02 -->

<!-- Optimized: 2025-10-02 -->

<!-- Last updated: 2025-10-02 -->
