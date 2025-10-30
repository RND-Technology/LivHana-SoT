# Race Automation Scripts

This directory contains helper scripts that make the Lane 2 CI/CD metrics reproducible across other lanes in the Unicorn Race orchestration.

## Available Scripts

- `generate_tests_matrix.sh` – Parses the latest frontend test log (or falls back to Lane 2 baseline) and produces `.race/aggregate/tests.json` with totals and pass rate.
- `update_profit_signal.sh` – Combines the test matrix with CI timing metrics to compute a weighted profit signal in `.race/aggregate/profit_signal.json`.
- `score_lanes.sh` – Aggregates `.race/status/*.json` into a scoreboard summary that other orchestrators can consume.
- `update_comet_dashboard.sh` – Builds the final dashboard artifact, including fusion gate readiness logic.

Run the scripts in the order listed above to refresh the complete telemetry bundle.
