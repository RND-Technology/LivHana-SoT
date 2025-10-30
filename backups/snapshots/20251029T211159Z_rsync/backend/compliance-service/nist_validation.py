#!/usr/bin/env python3
from __future__ import annotations

from dataclasses import dataclass
from typing import Set

# Allowed cannabinoids for current NIST-approved methods (example placeholder)
NIST_ALLOWED: Set[str] = {"CBD", "CBG", "CBN", "THC", "THCV"}

@dataclass(frozen=True)
class NistValidationRequest:
    cannabinoid: str

@dataclass(frozen=True)
class NistValidationResult:
    valid: bool
    reason: str


def validate_nist(req: NistValidationRequest) -> NistValidationResult:
    name = (req.cannabinoid or "").upper().strip()
    if name in NIST_ALLOWED:
        return NistValidationResult(True, f"nist_ok:{name}")
    return NistValidationResult(False, f"nist_block:{name}")


if __name__ == "__main__":
    import os
    can = os.environ.get("TEST_CANNABINOID", "THC")
    res = validate_nist(NistValidationRequest(can))
    print({"valid": res.valid, "reason": res.reason})
