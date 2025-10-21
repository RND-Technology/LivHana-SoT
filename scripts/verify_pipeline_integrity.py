#!/usr/bin/env python3
"""
Pipeline Integrity Verification
Liv Hana | Tier 1 100% True Absolute Standard | Autonomous Orchestration Master
One Shot, One Kill. Grow baby grow and sell baby sell.
"""

import argparse
import json
import subprocess
import sys
import yaml
from pathlib import Path


def load_yaml_config(config_path):
    """Load YAML configuration file."""
    try:
        with open(config_path, 'r') as f:
            return yaml.safe_load(f)
    except Exception as e:
        print(f"Error loading config: {e}", file=sys.stderr)
        return None


def verify_truth_pipeline():
    """Verify TRUTH Pipeline integrity."""
    print("Verifying TRUTH Pipeline integrity...")
    
    # Check if pipeline script exists
    pipeline_script = Path("scripts/verify_pipeline_integrity.sh")
    if not pipeline_script.exists():
        print("⚠️ TRUTH Pipeline script not found")
        return False
    
    try:
        # Run the pipeline verification
        result = subprocess.run(
            ["bash", str(pipeline_script)],
            capture_output=True,
            text=True,
            timeout=60
        )
        
        if result.returncode == 0:
            print("✅ TRUTH Pipeline: All tests passed")
            return True
        else:
            print(f"⚠️ TRUTH Pipeline: Some tests failed")
            print(f"Output: {result.stdout}")
            print(f"Error: {result.stderr}")
            return False
            
    except subprocess.TimeoutExpired:
        print("⚠️ TRUTH Pipeline: Verification timed out")
        return False
    except Exception as e:
        print(f"⚠️ TRUTH Pipeline: Error during verification: {e}")
        return False


def verify_agent_builder(config):
    """Verify Agent Builder configuration."""
    print("Verifying Agent Builder configuration...")
    
    # Check Agent Builder config
    agent_config = config.get('agent_builder', {})
    if not agent_config:
        print("⚠️ Agent Builder: No configuration found")
        return False
    
    # Check required fields
    required_fields = ['workflow_id', 'workflow_name', 'version', 'nodes', 'secrets']
    missing_fields = [field for field in required_fields if field not in agent_config]
    
    if missing_fields:
        print(f"⚠️ Agent Builder: Missing fields: {missing_fields}")
        return False
    
    # Check node count
    expected_nodes = agent_config.get('nodes', 0)
    if expected_nodes < 17:
        print(f"⚠️ Agent Builder: Expected 17+ nodes, found {expected_nodes}")
        return False
    
    # Check secrets count
    expected_secrets = agent_config.get('secrets', 0)
    if expected_secrets < 8:
        print(f"⚠️ Agent Builder: Expected 8+ secrets, found {expected_secrets}")
        return False
    
    print(f"✅ Agent Builder: {expected_nodes} nodes, {expected_secrets} secrets configured")
    return True


def verify_compliance_guardrails(config):
    """Verify compliance guardrails configuration."""
    print("Verifying compliance guardrails...")
    
    compliance = config.get('compliance', {})
    if not compliance:
        print("⚠️ Compliance: No guardrails configured")
        return False
    
    # Check required guardrails
    required_guardrails = [
        'age21', 'pii_protection', 'cannabis_compliance', 
        'medical_claims', 'financial_accuracy', 'secrets_handling'
    ]
    
    missing_guardrails = []
    disabled_guardrails = []
    
    for guardrail in required_guardrails:
        if guardrail not in compliance:
            missing_guardrails.append(guardrail)
        elif not compliance[guardrail].get('enabled', False):
            disabled_guardrails.append(guardrail)
    
    if missing_guardrails:
        print(f"⚠️ Compliance: Missing guardrails: {missing_guardrails}")
        return False
    
    if disabled_guardrails:
        print(f"⚠️ Compliance: Disabled guardrails: {disabled_guardrails}")
        return False
    
    print(f"✅ Compliance: {len(compliance)} guardrails configured and enabled")
    return True


def verify_voice_configuration(config):
    """Verify voice configuration."""
    print("Verifying voice configuration...")
    
    voice_config = config.get('voice', {})
    if not voice_config:
        print("⚠️ Voice: No configuration found")
        return False
    
    # Check voice modes
    modes = voice_config.get('modes', {})
    required_modes = ['brevity', 'mentor', 'silence']
    
    missing_modes = [mode for mode in required_modes if mode not in modes]
    if missing_modes:
        print(f"⚠️ Voice: Missing modes: {missing_modes}")
        return False
    
    # Check STT/TTS config
    stt_config = voice_config.get('stt_config', {})
    tts_config = voice_config.get('tts_config', {})
    
    if not stt_config or not tts_config:
        print("⚠️ Voice: Missing STT/TTS configuration")
        return False
    
    print(f"✅ Voice: {len(modes)} modes configured")
    return True


def verify_performance_targets(config):
    """Verify performance targets."""
    print("Verifying performance targets...")
    
    performance = config.get('performance', {})
    if not performance:
        print("⚠️ Performance: No targets configured")
        return False
    
    # Check voice performance
    voice_perf = performance.get('voice', {})
    if not voice_perf:
        print("⚠️ Performance: No voice targets configured")
        return False
    
    # Check orchestrator performance
    orchestrator_perf = performance.get('orchestrator', {})
    if not orchestrator_perf:
        print("⚠️ Performance: No orchestrator targets configured")
        return False
    
    print("✅ Performance: Targets configured for voice and orchestrator")
    return True


def verify_revenue_targets(config):
    """Verify revenue targets."""
    print("Verifying revenue targets...")
    
    revenue = config.get('revenue', {})
    if not revenue:
        print("⚠️ Revenue: No targets configured")
        return False
    
    # Check required targets
    required_targets = ['recovery_target', 'protection_target', 'dshs_deadline']
    missing_targets = [target for target in required_targets if target not in revenue]
    
    if missing_targets:
        print(f"⚠️ Revenue: Missing targets: {missing_targets}")
        return False
    
    print(f"✅ Revenue: {len(revenue)} targets configured")
    return True


def main():
    parser = argparse.ArgumentParser(description='Verify pipeline integrity')
    parser.add_argument('--config', required=True, help='Path to YAML config file')
    parser.add_argument('--log', required=True, help='Path to log file')
    
    args = parser.parse_args()
    
    # Load configuration
    config = load_yaml_config(args.config)
    if config is None:
        sys.exit(1)
    
    # Run verification checks
    checks = [
        verify_truth_pipeline,
        lambda: verify_agent_builder(config),
        lambda: verify_compliance_guardrails(config),
        lambda: verify_voice_configuration(config),
        lambda: verify_performance_targets(config),
        lambda: verify_revenue_targets(config)
    ]
    
    passed_checks = 0
    total_checks = len(checks)
    
    for check in checks:
        if check():
            passed_checks += 1
    
    # Log results
    try:
        with open(args.log, 'a') as f:
            f.write(f"\n[VERIFY] {passed_checks}/{total_checks} checks passed\n")
    except Exception as e:
        print(f"Warning: Could not write to log file: {e}", file=sys.stderr)
    
    # Summary
    print(f"\nVerification Summary: {passed_checks}/{total_checks} checks passed")
    
    if passed_checks == total_checks:
        print("✅ All verification checks passed")
        return True
    else:
        print("⚠️ Some verification checks failed")
        return False


if __name__ == '__main__':
    success = main()
    sys.exit(0 if success else 1)