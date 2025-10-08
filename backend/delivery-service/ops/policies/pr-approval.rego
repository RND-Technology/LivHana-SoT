# Open Policy Agent (OPA) policy for PR approvals
# Unfuckwithable Code Protocol: Policy-as-code gates

package livhana.pr_approval

import future.keywords.if
import future.keywords.in

# Default: deny all PRs until rules pass
default allow := false

# Allow PR if all conditions met
allow if {
    has_required_approvals
    no_failing_tests
    no_security_violations
    meets_coverage_threshold
    follows_naming_convention
    has_valid_spec
}

# Risk tier classification
risk_tier := tier if {
    is_critical_path
    tier := "critical"
} else := tier if {
    is_security_related
    tier := "high"
} else := tier if {
    is_api_change
    tier := "medium"
} else := "low"

# Critical path files require 2 approvals
is_critical_path if {
    some file in input.pr.files
    startswith(file, "src/adapters/")
}

is_critical_path if {
    some file in input.pr.files
    startswith(file, "src/lib/orchestrator")
}

# Security-related changes require security review
is_security_related if {
    some file in input.pr.files
    contains(file, "auth")
}

is_security_related if {
    some file in input.pr.files
    contains(file, "webhook")
}

# API changes require spec update
is_api_change if {
    some file in input.pr.files
    startswith(file, "src/")
    endswith(file, ".ts")
    not has_corresponding_spec(file)
}

# Check if spec exists for changed file
has_corresponding_spec(file) if {
    spec_file := replace(file, "src/", "specs/")
    spec_file_yaml := replace(spec_file, ".ts", ".spec.yaml")
    spec_file_yaml in input.pr.files
}

# Required approvals based on risk tier
has_required_approvals if {
    risk_tier == "critical"
    count(input.pr.approvals) >= 2
    has_codeowner_approval
}

has_required_approvals if {
    risk_tier == "high"
    count(input.pr.approvals) >= 2
}

has_required_approvals if {
    risk_tier == "medium"
    count(input.pr.approvals) >= 1
}

has_required_approvals if {
    risk_tier == "low"
    count(input.pr.approvals) >= 1
}

# Check if codeowner approved
has_codeowner_approval if {
    some approval in input.pr.approvals
    approval.user in data.codeowners
}

# No failing tests
no_failing_tests if {
    input.ci.tests.unit.status == "passed"
    input.ci.tests.properties.status == "passed"
    input.ci.tests.fuzz.status == "passed"
}

# No security violations from red team
no_security_violations if {
    input.ci.security.red_team.critical_count == 0
    input.ci.security.red_team.high_count == 0
}

# Coverage threshold
meets_coverage_threshold if {
    input.ci.coverage.lines >= 80
    input.ci.coverage.branches >= 80
    input.ci.coverage.functions >= 80
}

# Naming convention: feat/fix/docs/refactor/test
follows_naming_convention if {
    startswith(input.pr.branch, "feat/")
}

follows_naming_convention if {
    startswith(input.pr.branch, "fix/")
}

follows_naming_convention if {
    startswith(input.pr.branch, "docs/")
}

follows_naming_convention if {
    startswith(input.pr.branch, "refactor/")
}

follows_naming_convention if {
    startswith(input.pr.branch, "test/")
}

# Spec exists for all new features
has_valid_spec if {
    risk_tier == "low"
}

has_valid_spec if {
    every file in input.pr.files {
        not startswith(file, "src/")
    }
}

has_valid_spec if {
    every file in input.pr.files {
        not endswith(file, ".ts")
    }
}

has_valid_spec if {
    every file in input.pr.files {
        has_corresponding_spec(file)
    }
}

# Violation messages
violations[msg] {
    not has_required_approvals
    msg := sprintf("Insufficient approvals for %s risk tier (required: %d, got: %d)", [
        risk_tier,
        required_approval_count,
        count(input.pr.approvals)
    ])
}

violations[msg] {
    not no_failing_tests
    msg := "Tests failing - fix before merge"
}

violations[msg] {
    not no_security_violations
    msg := sprintf("Security violations found - critical: %d, high: %d", [
        input.ci.security.red_team.critical_count,
        input.ci.security.red_team.high_count
    ])
}

violations[msg] {
    not meets_coverage_threshold
    msg := sprintf("Coverage below threshold - lines: %d%% (need 80%%)", [input.ci.coverage.lines])
}

violations[msg] {
    not follows_naming_convention
    msg := sprintf("Branch name '%s' doesn't follow convention (feat/fix/docs/refactor/test)", [input.pr.branch])
}

violations[msg] {
    not has_valid_spec
    msg := "Changed files missing corresponding specs"
}

required_approval_count := count if {
    risk_tier == "critical"
    count := 2
} else := count if {
    risk_tier == "high"
    count := 2
} else := 1
