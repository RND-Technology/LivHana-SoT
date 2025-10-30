#!/usr/bin/env bash
# scripts/tests/unit/test_guards.sh
# Unit tests for shell guard scripts.

set -euo pipefail

ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/../../.." && pwd)"
export ROOT

# Load helpers and scripts to test
# shellcheck source=scripts/helpers/logging.sh
source "$ROOT/scripts/helpers/logging.sh"
# shellcheck source=scripts/guards/validate_pid_file.sh
source "$ROOT/scripts/guards/validate_pid_file.sh"
# shellcheck source=scripts/guards/check_port_collision.sh
source "$ROOT/scripts/guards/check_port_collision.sh"

# --- Test PID Validation ---
test_validate_pid_file() {
    info "Running tests for validate_pid_file.sh..."
    local test_pid_file
    test_pid_file=$(mktemp)

    # Test 1: Write and read a live PID
    write_pid "$$" "$test_pid_file" "bash"
    local read_back
    read_back=$(read_pid "$test_pid_file" "bash")
    if [[ "$read_back" != "$$" ]]; then
        error "FAIL: Live PID did not match. Expected $$, got $read_back"
        return 1
    fi
    success "PASS: Live PID write/read"

    # Test 2: Stale PID file cleanup
    echo "99999" > "$test_pid_file"
    read_pid "$test_pid_file" >/dev/null || true
    if [[ -f "$test_pid_file" ]]; then
        error "FAIL: Stale PID file was not cleaned up."
        return 1
    fi
    success "PASS: Stale PID file cleanup"

    # Test 3: Invalid PID file cleanup
    echo "not-a-pid" > "$test_pid_file"
    read_pid "$test_pid_file" >/dev/null || true
    if [[ -f "$test_pid_file" ]]; then
        error "FAIL: Invalid PID file was not cleaned up."
        return 1
    fi
    success "PASS: Invalid PID file cleanup"

    rm -f "$test_pid_file"
}

# --- Test Port Collision ---
test_check_port_collision() {
    info "Running tests for check_port_collision.sh..."
    local test_port=49152 # Use an ephemeral port

    # Cleanup: Ensure port is free before starting
    if lsof -ti :"$test_port" >/dev/null; then
        warning "Port $test_port was occupied before test. Killing process."
        lsof -ti :"$test_port" | xargs kill -9
        sleep 1 # Give time for port to be released
    fi

    # Test 1: Available port
    if ! check_port_collision "$test_port" "test-service"; then
        error "FAIL: check_port_collision reported a collision on a free port."
        return 1
    fi
    success "PASS: Available port check"

    # Test 2: Occupied port
    info "Binding to port $test_port for collision test..."
    # Use python to create a reliable listener, as 'nc' behavior can vary.
    python -c "import socket; s = socket.socket(); s.bind(('', $test_port)); s.listen(1); s.accept()" &
    local listener_pid=$!
    
    # Ensure the listener is running before checking the port
    sleep 1 

    if ! ps -p "$listener_pid" > /dev/null; then
        error "FAIL: Test listener failed to start."
        return 1
    fi

    if check_port_collision "$test_port" "test-service" 2>/dev/null; then
        error "FAIL: check_port_collision did not detect an occupied port."
        kill "$listener_pid" 2>/dev/null || true
        return 1
    fi
    success "PASS: Occupied port detection"

    kill "$listener_pid" 2>/dev/null || true
}

# --- Main Execution ---
main() {
    test_validate_pid_file
    echo
    test_check_port_collision
    echo
    success "All guard tests passed."
}

main
