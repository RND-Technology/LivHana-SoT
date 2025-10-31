#!/usr/bin/env bash
# Instance Lock Module (Principle of One)
# Prevents duplicate Liv Hana instances from causing coordination chaos

acquire_instance_lock() {
  local lock_file="$ROOT_DIR/.claude/instance_lock.json"
  local current_pid=$$
  local current_timestamp=$(date -u +%Y-%m-%dT%H:%M:%SZ)

  mkdir -p "$(dirname "$lock_file")"

  # Check if lock exists
  if [[ -f "$lock_file" ]]; then
    local existing_pid=$(jq -r '.pid // empty' "$lock_file" 2>/dev/null)
    local existing_timestamp=$(jq -r '.timestamp // empty' "$lock_file" 2>/dev/null)

    if [[ -n "$existing_pid" ]]; then
      # Check if existing process still running
      if kill -0 "$existing_pid" 2>/dev/null; then
        echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
        echo "⚠️  ANOTHER LIV HANA INSTANCE DETECTED"
        echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
        echo ""
        echo "  Existing Instance:"
        echo "    PID: $existing_pid"
        echo "    Started: $existing_timestamp"
        echo ""
        echo "  Options:"
        echo "    1) TAKEOVER - Kill existing instance and claim control"
        echo "    2) EXIT - Quit and let existing instance continue"
        echo ""
        read -p "  Enter choice (1 or 2): " choice

        case "$choice" in
          1)
            echo ""
            echo "  🔫 Sending SIGTERM to PID $existing_pid..."
            kill -TERM "$existing_pid" 2>/dev/null
            sleep 2

            if kill -0 "$existing_pid" 2>/dev/null; then
              echo "  💀 Force killing PID $existing_pid..."
              kill -9 "$existing_pid" 2>/dev/null
              sleep 1
            fi

            rm -f "$lock_file"
            echo "  ✅ Takeover successful"
            ;;
          2)
            echo ""
            echo "  ✅ Exiting - existing instance continues"
            exit 0
            ;;
          *)
            echo ""
            echo "  ❌ Invalid choice - exiting"
            exit 1
            ;;
        esac
      else
        # Stale lock file - process not running
        echo "  🧹 Cleaning stale instance lock (PID $existing_pid no longer running)"
        rm -f "$lock_file"
      fi
    fi
  fi

  # Create new lock file
  cat > "$lock_file" <<EOF
{
  "pid": $current_pid,
  "timestamp": "$current_timestamp",
  "host": "$(hostname)",
  "user": "$USER",
  "working_directory": "$ROOT_DIR"
}
EOF

  echo "  🔒 Instance lock acquired (PID $current_pid)"
  return 0
}

release_instance_lock() {
  local lock_file="$ROOT_DIR/.claude/instance_lock.json"

  if [[ -f "$lock_file" ]]; then
    local lock_pid=$(jq -r '.pid // empty' "$lock_file" 2>/dev/null)

    # Only release if we own the lock
    if [[ "$lock_pid" == "$$" ]]; then
      rm -f "$lock_file"
      echo "  🔓 Instance lock released"
    fi
  fi
}

# Register cleanup handler
trap_instance_cleanup() {
  trap 'release_instance_lock' EXIT SIGTERM SIGINT
}
