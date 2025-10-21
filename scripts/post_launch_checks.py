#!/usr/bin/env python3
"""
Post-Launch Health Checks
Liv Hana | Tier 1 100% True Absolute Standard | Autonomous Orchestration Master
One Shot, One Kill. Grow baby grow and sell baby sell.
"""

import argparse
import json
import requests
import sys
import time
from datetime import datetime
from pathlib import Path


def check_service_health(url, service_name, timeout=5):
    """Check if a service is healthy."""
    try:
        response = requests.get(url, timeout=timeout)
        if response.status_code == 200:
            return True, f"{service_name}: HEALTHY (200)"
        else:
            return False, f"{service_name}: DOWN ({response.status_code})"
    except requests.exceptions.RequestException as e:
        return False, f"{service_name}: DOWN ({str(e)})"


def check_mcp_broker():
    """Check MCP broker reachability."""
    # Check if MCP broker is running
    try:
        # This would be the actual MCP broker health check
        # For now, we'll check if the port is open
        import socket
        sock = socket.socket(socket.AF_INET, socket.SOCK_STREAM)
        sock.settimeout(5)
        result = sock.connect_ex(('localhost', 3000))  # Assuming MCP broker on port 3000
        sock.close()
        
        if result == 0:
            return True, "MCP Broker: HEALTHY (port 3000)"
        else:
            return False, "MCP Broker: DOWN (port 3000)"
    except Exception as e:
        return False, f"MCP Broker: DOWN ({str(e)})"


def check_secrets_present():
    """Check if required secrets are present."""
    # This would check for secrets in GSM or environment
    # For now, we'll check if the secrets config exists
    secrets_file = Path("config/secrets.required.json")
    if secrets_file.exists():
        return True, "Secrets: CONFIGURED"
    else:
        return False, "Secrets: MISSING CONFIG"


def check_voice_stream():
    """Check if voice stream is live."""
    # Check voice service
    voice_healthy, voice_msg = check_service_health("http://localhost:8080/health", "Voice Service")
    
    # Check reasoning gateway
    reasoning_healthy, reasoning_msg = check_service_health("http://localhost:4002/health", "Reasoning Gateway")
    
    # Check compliance service
    compliance_healthy, compliance_msg = check_service_health("http://localhost:8000/health", "Compliance Service")
    
    # Check voice cockpit
    cockpit_healthy, cockpit_msg = check_service_health("http://localhost:5173/health", "Voice Cockpit")
    
    return {
        'voice_service': voice_healthy,
        'reasoning_gateway': reasoning_healthy,
        'compliance_service': compliance_healthy,
        'voice_cockpit': cockpit_healthy,
        'messages': [voice_msg, reasoning_msg, compliance_msg, cockpit_msg]
    }


def run_health_checks():
    """Run all health checks."""
    print("Running post-launch health checks...")
    
    # Check MCP broker
    mcp_healthy, mcp_msg = check_mcp_broker()
    print(mcp_msg)
    
    # Check secrets
    secrets_healthy, secrets_msg = check_secrets_present()
    print(secrets_msg)
    
    # Check voice stream
    voice_results = check_voice_stream()
    for msg in voice_results['messages']:
        print(msg)
    
    # Overall health status
    all_healthy = (
        mcp_healthy and 
        secrets_healthy and 
        voice_results['voice_service'] and 
        voice_results['reasoning_gateway'] and 
        voice_results['compliance_service'] and 
        voice_results['voice_cockpit']
    )
    
    if all_healthy:
        print("✅ All health checks passed")
        return True
    else:
        print("⚠️ Some health checks failed")
        return False


def update_state_file(state_path, health_status):
    """Update state file with health check results."""
    state = {
        "stay_tooned": True,
        "timestamp": datetime.now().isoformat(),
        "health_checks": {
            "status": "passed" if health_status else "failed",
            "timestamp": datetime.now().isoformat()
        },
        "last_command": "post_launch_checks",
        "last_transcript": "Health checks completed",
        "next_actions": [
            "Start Voice Cockpit: cd frontend/herbitrage-voice && node server.js",
            "Test Voice Interface: curl http://localhost:5173/health",
            "Begin Team Training: Use docs/VOICE_COCKPIT_TRAINING_GUIDE.md"
        ]
    }
    
    try:
        with open(state_path, 'w') as f:
            json.dump(state, f, indent=2)
        print(f"State file updated: {state_path}")
        return True
    except Exception as e:
        print(f"Error updating state file: {e}", file=sys.stderr)
        return False


def main():
    parser = argparse.ArgumentParser(description='Post-launch health checks for Claude Tier-1')
    parser.add_argument('--log', required=True, help='Path to log file')
    parser.add_argument('--state', required=True, help='Path to state JSON file')
    
    args = parser.parse_args()
    
    # Run health checks
    health_status = run_health_checks()
    
    # Update state file
    update_state_file(args.state, health_status)
    
    # Log results
    try:
        with open(args.log, 'a') as f:
            f.write(f"\n[POST_LAUNCH] {datetime.now()} – Health checks {'PASSED' if health_status else 'FAILED'}\n")
    except Exception as e:
        print(f"Warning: Could not write to log file: {e}", file=sys.stderr)
    
    return health_status


if __name__ == '__main__':
    success = main()
    sys.exit(0 if success else 1)
