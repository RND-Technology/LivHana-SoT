#!/usr/bin/env python3
"""Unit tests for hardened artifact agent helpers."""

from __future__ import annotations

import importlib.machinery
import importlib.util
import json
import sys
import tempfile
import unittest
from pathlib import Path

MODULE_PATH = Path(__file__).resolve().parents[1] / "artifact_agent.py"
LOADER = importlib.machinery.SourceFileLoader("artifact_agent_module_for_tests", str(MODULE_PATH))
SPEC = importlib.util.spec_from_loader(LOADER.name, LOADER)
assert SPEC and SPEC.loader  # basic sanity
MODULE = importlib.util.module_from_spec(SPEC)
sys.modules[LOADER.name] = MODULE
LOADER.exec_module(MODULE)  # type: ignore[arg-type]

ArtifactAgent = MODULE.ArtifactAgent
atomic_write_json = MODULE.atomic_write_json
utc_iso = MODULE.utc_iso


class ArtifactAgentTestCase(unittest.TestCase):
    """Validate Artifact Agent helpers and state transitions."""

    def setUp(self) -> None:
        self.tmp = tempfile.TemporaryDirectory()
        root = Path(self.tmp.name)
        self.status_file = root / "artifact.status.json"
        self.log_file = root / "artifact.log"
        self.audit_log = root / "artifact_audit.jsonl"
        self.registry_file = root / "registry.json"
        self.coord_log = root / "coordination.jsonl"
        self.codex_dir = root / "codex"

        self.agent = ArtifactAgent(
            status_file=self.status_file,
            log_file=self.log_file,
            audit_log_file=self.audit_log,
            registry_file=self.registry_file,
            coordination_log=self.coord_log,
            codex_dir=self.codex_dir,
            poll_interval=5,
            port=5099,
            install_signal_handlers=False,
        )

    def tearDown(self) -> None:
        self.tmp.cleanup()

    def test_atomic_write_json_roundtrip(self) -> None:
        payload = {"hello": "world", "at": utc_iso()}
        atomic_write_json(self.status_file, payload)
        with self.status_file.open(encoding="utf-8") as handle:
            read_back = json.load(handle)
        self.assertEqual(read_back["hello"], "world")

    def test_registry_update_creates_entry(self) -> None:
        self.agent._update_registry(status="active")  # type: ignore[attr-defined]
        registry = json.loads(self.registry_file.read_text(encoding="utf-8"))
        self.assertIn("artifact", registry.get("agents", {}))
        entry = registry["agents"]["artifact"]
        self.assertEqual(entry["status"], "active")
        self.assertEqual(entry["port"], 5099)

    def test_scan_codex_results_records_audit(self) -> None:
        self.codex_dir.mkdir(parents=True, exist_ok=True)
        task_id = "1234"
        result_file = self.codex_dir / f"task_{task_id}.result.json"
        result_file.write_text(
            json.dumps(
                {
                    "task_id": task_id,
                    "status": "completed",
                    "source_agent": "codex-cursor",
                    "completed_at": utc_iso(),
                    "result": {
                        "summary": "Generated artifact",
                        "artifacts_created": ["/tmp/output.md"],
                    },
                }
            ),
            encoding="utf-8",
        )

        new_results = self.agent._scan_codex_results()  # type: ignore[attr-defined]
        self.assertEqual(new_results, [task_id])
        self.assertEqual(self.agent.state.processed_total, 1)
        self.assertEqual(len(self.agent.state.recent_tasks), 1)

        audit_lines = self.audit_log.read_text(encoding="utf-8").strip().splitlines()
        self.assertEqual(len(audit_lines), 1)
        audit_payload = json.loads(audit_lines[0])
        self.assertEqual(audit_payload["task_id"], task_id)
        self.assertEqual(audit_payload["event"], "codex_task_result")


if __name__ == "__main__":
    unittest.main()
