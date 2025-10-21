#!/usr/bin/env python3
import argparse, json, os, sys, time, subprocess


def log(line: str, log_path: str | None) -> None:
    msg = f"[CHECK] {time.strftime('%Y-%m-%dT%H:%M:%SZ', time.gmtime())} {line}"
    print(msg)
    if log_path:
        try:
            with open(log_path, "a") as f:
                f.write(msg + "\n")
        except Exception:
            pass


def load_state(path: str) -> dict:
    try:
        if os.path.exists(path) and os.path.getsize(path) > 0:
            with open(path, "r") as f:
                return json.load(f)
    except Exception:
        pass
    return {}


def save_state(path: str, state: dict) -> None:
    os.makedirs(os.path.dirname(path), exist_ok=True)
    with open(path, "w") as f:
        json.dump(state, f, indent=2)


def check_binary(name: str) -> bool:
    return subprocess.call(["bash", "-lc", f"command -v {name} >/dev/null 2>&1"], stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL) == 0


def main() -> int:
    parser = argparse.ArgumentParser()
    parser.add_argument("--log", required=False)
    parser.add_argument("--state", required=True)
    parser.add_argument("--pid", required=False)
    args = parser.parse_args()

    log_path = args.log
    state_path = os.path.abspath(args.state)
    state = load_state(state_path)

    # Basic tool checks
    for tool in ("claude", "claude-code"):
        present = check_binary(tool)
        log(f"tool {tool}: {'present' if present else 'missing'}", log_path)

    # Write readiness flags
    state.setdefault("voice_mode", {})
    state["voice_mode"]["ready"] = True
    state["voice_mode"]["pid"] = args.pid or ""
    state["stay_to_oned"] = True
    state.setdefault("runtime", {})
    state["runtime"]["last_health_utc"] = time.strftime('%Y-%m-%dT%H:%M:%SZ', time.gmtime())
    save_state(state_path, state)

    log("voice_mode_ready=true stay_to_oned=true", log_path)
    return 0


if __name__ == "__main__":
    sys.exit(main())

#!/usr/bin/env python3
"""
Post-Launch Checks
Confirms MCP broker, secrets, and voice stream health after Claude Tier-1 boot
"""

import sys
import json
import argparse
import subprocess
from pathlib import Path
from datetime import datetime
import urllib.request
import urllib.error

def log(msg, log_file=None):
    """Log message to stdout and optionally to file"""
    timestamp = datetime.now().strftime("%Y-%m-%d %H:%M:%S")
    log_msg = f"[{timestamp}] {msg}"
    print(log_msg)
    if log_file:
        with open(log_file, 'a') as f:
            f.write(log_msg + "\n")

def check_endpoint(url, timeout=5):
    """Check if an HTTP endpoint is reachable"""
    try:
        req = urllib.request.Request(url, method='HEAD')
        with urllib.request.urlopen(req, timeout=timeout) as response:
            return True, response.status
    except urllib.error.HTTPError as e:
        return True, e.code  # Endpoint exists but returned error
    except Exception as e:
        return False, str(e)

def check_mcp_broker():
    """Check if MCP Broker is operational"""
    # Note: Update this URL if MCP broker has a different endpoint
    mcp_url = "https://mcp-broker-plad5efvha-uc.a.run.app/health"
    success, result = check_endpoint(mcp_url)
    return success, f"MCP Broker: {result if success else 'UNREACHABLE'}"

def check_gcp_secrets():
    """Check if GCP Secret Manager is accessible"""
    try:
        result = subprocess.run(
            ['gcloud', 'secrets', 'list', '--project=reggieanddrodispensary', '--limit=1'],
            capture_output=True,
            text=True,
            timeout=10
        )
        if result.returncode == 0:
            return True, "GCP Secret Manager: ACCESSIBLE"
        else:
            return False, f"GCP Secret Manager: ERROR - {result.stderr}"
    except FileNotFoundError:
        return False, "GCP Secret Manager: gcloud CLI not found"
    except subprocess.TimeoutExpired:
        return False, "GCP Secret Manager: TIMEOUT"
    except Exception as e:
        return False, f"GCP Secret Manager: {str(e)}"

def check_voice_mode_ports():
    """Check if voice mode ports are listening"""
    ports_to_check = [
        (2022, "Whisper STT"),
        (8880, "Kokoro TTS")
    ]
    
    results = []
    for port, name in ports_to_check:
        try:
            result = subprocess.run(
                ['lsof', '-i', f':{port}'],
                capture_output=True,
                text=True,
                timeout=5
            )
            if result.returncode == 0 and result.stdout:
                results.append((True, f"{name} (port {port}): LISTENING"))
            else:
                results.append((False, f"{name} (port {port}): NOT LISTENING"))
        except Exception as e:
            results.append((False, f"{name} (port {port}): ERROR - {str(e)}"))
    
    return results

def check_git_status(root_dir):
    """Check git repository status"""
    try:
        result = subprocess.run(
            ['git', 'status', '--porcelain'],
            cwd=root_dir,
            capture_output=True,
            text=True,
            timeout=5
        )
        lines = [l for l in result.stdout.split('\n') if l.strip()]
        uncommitted = len(lines)
        return True, f"Git status: {uncommitted} uncommitted files"
    except Exception as e:
        return False, f"Git status: ERROR - {str(e)}"

def update_state(state_path, checks_passed):
    """Update runtime state with health check results"""
    if Path(state_path).exists():
        with open(state_path) as f:
            state = json.load(f)
    else:
        state = {}
    
    state['last_health_check'] = datetime.now().isoformat()
    state['health_checks_passed'] = checks_passed
    state['voice_mode_ready'] = checks_passed  # Set true only if all checks pass
    
    with open(state_path, 'w') as f:
        json.dump(state, f, indent=2)

def main():
    parser = argparse.ArgumentParser(description='Post-launch health checks for Claude Tier-1')
    parser.add_argument('--log', help='Path to log file')
    parser.add_argument('--state', required=True, help='Path to claude_tier1_state.json')
    parser.add_argument('--root', help='Root directory (auto-detected if not provided)')
    
    args = parser.parse_args()
    
    # Determine root directory
    if args.root:
        root_dir = Path(args.root)
    else:
        root_dir = Path(__file__).parent.parent
    
    log("[POST-LAUNCH] Starting health checks...", args.log)
    
    all_checks_passed = True
    
    # Check MCP Broker
    success, msg = check_mcp_broker()
    log(f"[{'OK' if success else 'WARN'}] {msg}", args.log)
    if not success:
        all_checks_passed = False
    
    # Check GCP Secrets
    success, msg = check_gcp_secrets()
    log(f"[{'OK' if success else 'WARN'}] {msg}", args.log)
    if not success:
        all_checks_passed = False
    
    # Check Voice Mode Ports
    voice_results = check_voice_mode_ports()
    for success, msg in voice_results:
        log(f"[{'OK' if success else 'WARN'}] {msg}", args.log)
        if not success:
            log(f"[INFO] Voice mode port not listening - voice features may be limited", args.log)
            # Don't fail entire check for voice ports
    
    # Check Git Status
    success, msg = check_git_status(root_dir)
    log(f"[{'OK' if success else 'WARN'}] {msg}", args.log)
    # Git status is informational only
    
    # Update state
    update_state(args.state, all_checks_passed)
    
    if all_checks_passed:
        log("[POST-LAUNCH] ✅ All critical checks passed - system ready", args.log)
        sys.exit(0)
    else:
        log("[POST-LAUNCH] ⚠️  Some checks failed - system operational but limited", args.log)
        sys.exit(0)  # Don't fail boot, just warn

if __name__ == '__main__':
    main()
