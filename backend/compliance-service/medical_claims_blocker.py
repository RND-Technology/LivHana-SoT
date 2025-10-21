#!/usr/bin/env python3
from __future__ import annotations

from dataclasses import dataclass
import re
from typing import List

# Very conservative phrases to block; refine with NLP later
BLOCK_PATTERNS: List[re.Pattern] = [
    re.compile(r"cures?\s+\w+", re.IGNORECASE),
    re.compile(r"treats?\s+\w+", re.IGNORECASE),
    re.compile(r"diagnos(es|e)\s+\w+", re.IGNORECASE),
    re.compile(r"prevents?\s+\w+", re.IGNORECASE),
]

@dataclass(frozen=True)
class ClaimsCheckResult:
    allowed: bool
    flags: List[str]


def check_claims(text: str) -> ClaimsCheckResult:
    flags: List[str] = []
    for pat in BLOCK_PATTERNS:
        if pat.search(text or ""):
            flags.append(pat.pattern)
    return ClaimsCheckResult(allowed=(len(flags) == 0), flags=flags)


if __name__ == "__main__":
    import sys
    sample = sys.argv[1] if len(sys.argv) > 1 else "This product treats insomnia"
    res = check_claims(sample)
    print({"allowed": res.allowed, "flags": res.flags})
