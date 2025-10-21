#!/usr/bin/env python3
from __future__ import annotations

import os
from dataclasses import dataclass
from datetime import date

AGE_LIMIT = 21

@dataclass(frozen=True)
class AgeCheckRequest:
    birthdate: date

@dataclass(frozen=True)
class AgeCheckResult:
    allowed: bool
    reason: str


def calculate_age(birthdate: date, today: date | None = None) -> int:
    today = today or date.today()
    years = today.year - birthdate.year
    if (today.month, today.day) < (birthdate.month, birthdate.day):
        years -= 1
    return years


def verify_age(req: AgeCheckRequest) -> AgeCheckResult:
    age = calculate_age(req.birthdate)
    if age >= AGE_LIMIT:
        return AgeCheckResult(True, f"age_ok:{age}")
    return AgeCheckResult(False, f"age_block:{age}")


if __name__ == "__main__":
    # simple cli smoke
    bd = os.environ.get("TEST_BIRTHDATE", "2005-01-01")
    y, m, d = map(int, bd.split("-"))
    res = verify_age(AgeCheckRequest(date(y, m, d)))
    print({"allowed": res.allowed, "reason": res.reason})
