#!/usr/bin/env bash
# scripts/tests/unit/test_helpers.sh
# Unit tests for shell helper scripts.

set -euo pipefail

ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/../../.." && pwd)"
export ROOT

# Load helpers and scripts to test
# shellcheck source=scripts/helpers/logging.sh
source "$ROOT/scripts/helpers/logging.sh"
# shellcheck source=scripts/helpers/tmux_session_manager.sh
source "$ROOT/scripts/helpers/tmux_session_manager.sh"
# shellcheck source=scripts/helpers/secret_scrubber.sh
source "$ROOT/scripts/helpers/secret_scrubber.sh"

# --- Test Tmux Session Manager ---
test_tmux_manager() {
    info "Running tests for tmux_session_manager.sh..."
    local test_service="test-service-$$"

    # Ensure tmux is installed
    if ! command -v tmux &> /dev/null; then
        warning "tmux not found, skipping tmux tests."
        return 0
    fi

    # Cleanup before starting
    stop_session "$test_service" >/dev/null 2>&1 || true

    # Test 1: Session creation
    start_session "$test_service" "sleep 60"
    if ! session_exists "$test_service"; then
        error "FAIL: Session '$test_service' should exist but doesn't."
        return 1
    fi
    success "PASS: Session creation"

    # Test 2: Session stopping
    stop_session "$test_service"
    if session_exists "$test_service"; then
        error "FAIL: Session '$test_service' should not exist but does."
        return 1
    fi
    success "PASS: Session stopping"

    # Test 3: Stop all sessions
    start_session "${test_service}_1" "sleep 60"
    start_session "${test_service}_2" "sleep 60"
    stop_all_sessions
    if session_exists "${test_service}_1" || session_exists "${test_service}_2"; then
        error "FAIL: Not all managed sessions were stopped."
        # Cleanup
        tmux list-sessions | grep "^${SESSION_PREFIX}_" | awk '{print $1}' | xargs -I {} tmux kill-session -t {}
        return 1
    fi
    success "PASS: Stop all sessions"
}

# --- Test Secret Scrubber ---
test_secret_scrubber() {
    info "Running tests for secret_scrubber.sh..."
    
    local test_cases=(
        "my api key is sk_live_1234567890123456789ABCDEF"
        "aws key: AKIAIOSFODNN7EXAMPLE"
        "aws secret: wJalrXUtnFEMI/K7MDENG/bPxRfiCYEXAMPLEKEY"
        "db password='hard-to-guess-password!'"
        "op://vault/item/secret"
    )
    local expected="[REDACTED]"

    for i in "${!test_cases[@]}"; do
        local input="${test_cases[$i]}"
        local output
        output=$(echo "$input" | scrub_stream)
        
        # This is a bit brittle, but works for these test cases.
        # A more robust solution might check for the absence of the original secret.
        if [[ "$input" == *"sk_live"* ]]; then
            [[ "$output" == *"my api key is [REDACTED]"* ]] || {
              error "FAIL: OpenAI-style key not redacted"; error "Output: $output"; return 1; }
        elif [[ "$input" == *"AKIA"* ]]; then
            [[ "$output" == *"aws key: [REDACTED]"* ]] || { error "FAIL: AWS access key not redacted"; error "Output: $output"; return 1; }
        elif [[ "$input" == *"wJalrX"* ]]; then
            [[ "$output" == *"aws secret: [REDACTED]"* ]] || { error "FAIL: AWS secret key not redacted"; error "Output: $output"; return 1; }
        elif [[ "$input" == *"password"* ]]; then
            [[ "$output" == *"db [REDACTED]"* ]] || { error "FAIL: password assignment not redacted"; error "Output: $output"; return 1; }
        elif [[ "$input" == *"op://"* ]]; then
            [[ "$output" == "[REDACTED]" ]] || { error "FAIL: 1Password reference not redacted"; error "Output: $output"; return 1; }
        fi

        if [[ "$output" == "$input" ]]; then
            error "FAIL: Secret scrubber test case $((i+1)) failed."
            error "  Input:    '$input'"
            error "  Output:   '$output'"
            return 1
        fi
    done
    success "PASS: All secret scrubber stream tests passed."

    # Test file scrubbing
    local test_file
    test_file=$(mktemp)
    echo "my secret is sk_live_1234567890123456789ABCDEF" > "$test_file"
    scrub_file "$test_file"
    if ! grep -q "[REDACTED]" "$test_file"; then
        error "FAIL: scrub_file did not correctly redact content."
        cat "$test_file"
        rm "$test_file"
        return 1
    fi
    rm "$test_file"
    success "PASS: scrub_file test passed."
}


# --- Main Execution ---
main() {
    test_tmux_manager
    echo
    test_secret_scrubber
    echo
    success "All helper tests passed."
}

main
