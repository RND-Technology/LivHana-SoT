#!/usr/bin/env python3
"""
Render Claude Prompt
Builds engineered system prompt with org context, guardrails, RPM DNA, and continuity cues
"""

import sys
import json
import yaml
import argparse
from pathlib import Path
from datetime import datetime

def load_session_progress(root_dir, lines=20):
    """Load recent session progress for context continuity"""
    progress_path = Path(root_dir) / '.claude' / 'SESSION_PROGRESS.md'
    if not progress_path.exists():
        return "No session progress available"
    
    with open(progress_path) as f:
        all_lines = f.readlines()
    
    # Get last N lines
    recent = ''.join(all_lines[-lines:])
    return recent.strip()

def load_rpm_current(root_dir):
    """Load current RPM plan summary"""
    rpm_path = Path(root_dir) / 'RPM_WEEKLY_PLAN_CURRENT.md'
    if not rpm_path.exists():
        return "No RPM plan available"
    
    with open(rpm_path) as f:
        content = f.read()
    
    # Extract just the header and result/purpose sections (first ~200 lines)
    lines = content.split('\n')[:50]
    return '\n'.join(lines).strip()

def load_runtime_state(state_path):
    """Load previous runtime state for continuity"""
    if not Path(state_path).exists():
        return {
            'last_boot': None,
            'last_command': None,
            'session_count': 0,
            'stay_tooned': False
        }
    
    with open(state_path) as f:
        return json.load(f)

def render_prompt(config, root_dir, state):
    """Render the complete engineered prompt"""
    
    prompt_parts = []
    
    # Header
    prompt_parts.append("# 🎼 LIV HANA ORCHESTRATION LAYER - CLAUDE TIER-1")
    prompt_parts.append(f"**Model:** {config['persona']['model']}")
    prompt_parts.append(f"**Role:** {config['persona']['role']}")
    prompt_parts.append(f"**Boot Time:** {datetime.now().strftime('%Y-%m-%d %H:%M:%S %Z')}")
    prompt_parts.append(f"**Session Count:** {state['session_count'] + 1}")
    prompt_parts.append("")
    
    # Greeting & Tone
    prompt_parts.append("## Greeting")
    prompt_parts.append(config['persona']['greeting'])
    prompt_parts.append("")
    prompt_parts.append("## Tone & Style")
    prompt_parts.append(config['persona']['tone'])
    prompt_parts.append("")
    
    # Mission
    mission = config['mission']
    prompt_parts.append("## Mission")
    prompt_parts.append(f"**Primary:** {mission['primary']}")
    prompt_parts.append(f"**Strategy:** {mission['strategy']}")
    prompt_parts.append(f"**Motto:** {mission['motto']}")
    prompt_parts.append(f"**Week:** {mission['week']}")
    prompt_parts.append("")
    
    # RPM DNA
    rpm = config['rpm_dna']
    prompt_parts.append("## RPM DNA - Tier-1 Execution Standards")
    prompt_parts.append(f"**Framework:** {rpm['framework']}")
    prompt_parts.append("**Principles:**")
    for principle in rpm['principles']:
        prompt_parts.append(f"- {principle}")
    prompt_parts.append("")
    
    # Compliance Guardrails
    prompt_parts.append("## Compliance Guardrails (Non-Negotiable)")
    guardrails = config['compliance_guardrails']
    
    for name, details in guardrails.items():
        status = "🟢 ACTIVE" if details.get('active') else "🔴 INACTIVE"
        prompt_parts.append(f"### {name.replace('_', ' ').title()} {status}")
        prompt_parts.append(f"- **Description:** {details.get('description', 'N/A')}")
        if 'enforcement' in details:
            prompt_parts.append(f"- **Enforcement:** {details['enforcement']}")
        if 'verification' in details:
            prompt_parts.append(f"- **Verification:** {details['verification']}")
        prompt_parts.append("")
    
    # Systems Deployed
    prompt_parts.append("## Systems Deployed")
    systems = config['systems_deployed']
    for system_name, system_info in systems.items():
        status = system_info.get('status', 'Unknown')
        prompt_parts.append(f"### {system_name.replace('_', ' ').title()}")
        prompt_parts.append(f"**Status:** {status}")
        if 'scripts' in system_info:
            prompt_parts.append(f"**Scripts:** {len(system_info['scripts'])} scripts")
        if 'modules' in system_info:
            prompt_parts.append(f"**Modules:** {', '.join(system_info['modules'])}")
        if 'nodes' in system_info:
            prompt_parts.append(f"**Nodes:** {system_info['nodes']}-node workflow")
        prompt_parts.append("")
    
    # Critical Blockers
    blockers = config.get('critical_blockers', {})
    if blockers.get('secrets'):
        prompt_parts.append("## 🚨 Critical Blockers")
        prompt_parts.append(f"**{len(blockers['secrets'])} secrets blocking execution:**")
        for secret in blockers['secrets']:
            prompt_parts.append(f"- **{secret['name']}** ({secret['priority']}): {secret['purpose']}")
        prompt_parts.append("")
    
    # Immediate Priorities
    priorities = config.get('immediate_priorities', [])
    if priorities:
        prompt_parts.append("## Immediate Priorities (Ordered)")
        for priority in priorities:
            prompt_parts.append(f"{priority['order']}. **{priority['task']}**")
            prompt_parts.append(f"   - Impact: {priority['impact']}")
            prompt_parts.append(f"   - Command: `{priority['command']}`")
        prompt_parts.append("")
    
    # Today's Schedule
    schedule = config.get('todays_schedule', {})
    if schedule:
        prompt_parts.append(f"## Today's Schedule ({schedule['date']})")
        for block in schedule.get('blocks', []):
            prompt_parts.append(f"- **{block['time']}:** {block['task']}")
        prompt_parts.append("")
    
    # Continuity Context
    prompt_parts.append("## Session Continuity (Stay TOONED)")
    if state['last_boot']:
        prompt_parts.append(f"**Last Boot:** {state['last_boot']}")
    if state['last_command']:
        prompt_parts.append(f"**Last Command:** `{state['last_command']}`")
    
    prompt_parts.append("")
    prompt_parts.append("### Recent Activity (SESSION_PROGRESS.md tail)")
    prompt_parts.append("```")
    prompt_parts.append(load_session_progress(root_dir))
    prompt_parts.append("```")
    prompt_parts.append("")
    
    prompt_parts.append("### Current RPM Plan Summary")
    prompt_parts.append("```")
    prompt_parts.append(load_rpm_current(root_dir))
    prompt_parts.append("```")
    prompt_parts.append("")
    
    # Voice Mode Config
    voice = config.get('voice_mode_config', {})
    if voice:
        prompt_parts.append("## Voice Mode Configuration")
        mcp_servers = voice.get('mcp_servers', [])
        if mcp_servers:
            prompt_parts.append("**MCP Servers:**")
            for server in mcp_servers:
                prompt_parts.append(f"- {server['name']} ({server['type']}): {server['status']}")
        
        error_recovery = voice.get('error_recovery', {})
        if error_recovery:
            prompt_parts.append("")
            prompt_parts.append("**Error Recovery:**")
            for error_type, action in error_recovery.items():
                prompt_parts.append(f"- {error_type}: {action}")
        prompt_parts.append("")
    
    # Final Instructions
    prompt_parts.append("## Ready to Execute")
    prompt_parts.append("You are now fully primed with:")
    prompt_parts.append("✅ Mission context and strategic objectives")
    prompt_parts.append("✅ Compliance guardrails (LifeWard, 21+, GA-56, COA)")
    prompt_parts.append("✅ System status and critical blockers")
    prompt_parts.append("✅ Today's schedule and immediate priorities")
    prompt_parts.append("✅ Session continuity from previous work")
    prompt_parts.append("")
    prompt_parts.append("**Standing by for directive.** What would you like to execute first?")
    prompt_parts.append("")
    prompt_parts.append("---")
    prompt_parts.append("🌟 **ONE SHOT, ONE KILL | GROW BABY GROW, SELL BABY SELL**")
    
    return '\n'.join(prompt_parts)

def main():
    parser = argparse.ArgumentParser(description='Render engineered Claude prompt')
    parser.add_argument('--config', required=True, help='Path to claude_tier1_context.yaml')
    parser.add_argument('--state', required=True, help='Path to claude_tier1_state.json')
    parser.add_argument('--out', required=True, help='Output file for rendered prompt')
    parser.add_argument('--root', help='Root directory (auto-detected if not provided)')
    
    args = parser.parse_args()
    
    # Determine root directory
    if args.root:
        root_dir = Path(args.root)
    else:
        root_dir = Path(__file__).parent.parent
    
    print(f"[RENDER] Loading config: {args.config}")
    with open(args.config) as f:
        config = yaml.safe_load(f)
    
    print(f"[RENDER] Loading state: {args.state}")
    state = load_runtime_state(args.state)
    
    print(f"[RENDER] Rendering prompt...")
    prompt = render_prompt(config, root_dir, state)
    
    print(f"[RENDER] Writing to: {args.out}")
    with open(args.out, 'w') as f:
        f.write(prompt)
    
    # Update state
    state['last_boot'] = datetime.now().isoformat()
    state['session_count'] += 1
    state['stay_tooned'] = True
    
    with open(args.state, 'w') as f:
        json.dump(state, f, indent=2)
    
    print(f"[RENDER] ✅ Prompt rendered ({len(prompt)} chars)")
    print(f"[RENDER] ✅ State updated (session #{state['session_count']})")

if __name__ == '__main__':
    main()
