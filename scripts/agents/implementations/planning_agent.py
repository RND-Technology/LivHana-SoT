#!/usr/bin/env python3
"""RPM Planning Agent - Generates RPM plans from voice/text input."""
import argparse
import json
import logging
import signal
import sys
import time
import yaml
from datetime import datetime
from http.server import BaseHTTPRequestHandler, ThreadingHTTPServer
from pathlib import Path

logging.basicConfig(level=logging.INFO, format='[%(asctime)s] %(message)s')
logger = logging.getLogger(__name__)

ROOT_DIR = Path(__file__).resolve().parents[3]
PLANS_DIR = ROOT_DIR / 'rpm' / 'plans'
TASKS_DIR = ROOT_DIR / 'tmp' / 'agent_status' / 'tasks'
PLANS_DIR.mkdir(parents=True, exist_ok=True)
TASKS_DIR.mkdir(parents=True, exist_ok=True)

class RPMPlanGenerator:
    """Generates RPM plans following RPM DNA structure."""

    def generate_plan(self, directive: str, context: dict = None) -> dict:
        """Generate RPM plan from directive.

        Args:
            directive: Human-readable task description
            context: Optional context (files, dependencies, etc.)

        Returns:
            dict: RPM plan with Results/Purpose/MAP structure
        """
        # Parse directive to extract key elements
        plan_name = self._extract_plan_name(directive)

        # Build RPM DNA structure
        plan = {
            'type': 'rpm_plan',
            'id': f"RPM-{datetime.now().strftime('%Y%m%d-%H%M')}",
            'timestamp': datetime.now().isoformat(),
            'status': 'draft',
            'plan_name': plan_name,
            'directive': directive,
            'results': self._define_results(directive),
            'purpose': self._define_purpose(directive),
            'massive_action_plan': self._define_map(directive, context),
            'context': context or {},
            'metrics': {
                'estimated_time_minutes': 0,
                'complexity': 'medium',
                'priority': 'P1'
            }
        }

        return plan

    def _extract_plan_name(self, directive: str) -> str:
        """Extract clean plan name from directive."""
        # Simple extraction: take first 5 words, clean up
        words = directive.split()[:5]
        return ' '.join(words).rstrip('.,!?')

    def _define_results(self, directive: str) -> list:
        """Define RESULTS - what specific outcomes we're committed to."""
        # Parse directive to identify deliverables
        results = []

        # Basic heuristic: look for action verbs + objects
        if 'build' in directive.lower() or 'create' in directive.lower():
            results.append({
                'result': f"Functional implementation of {directive}",
                'verification': "Code executes without errors, tests pass",
                'status': 'pending'
            })

        if 'fix' in directive.lower():
            results.append({
                'result': f"Bug resolved: {directive}",
                'verification': "Issue no longer reproduces",
                'status': 'pending'
            })

        if 'document' in directive.lower():
            results.append({
                'result': f"Documentation created for {directive}",
                'verification': "Docs readable and accurate",
                'status': 'pending'
            })

        # Default result if no specific pattern matched
        if not results:
            results.append({
                'result': directive,
                'verification': "Objective completed and verified",
                'status': 'pending'
            })

        return results

    def _define_purpose(self, directive: str) -> str:
        """Define PURPOSE - why this matters."""
        # Extract purpose based on context
        purpose_map = {
            'fix': "Resolve blocking issue preventing system functionality",
            'build': "Enable new capabilities for user/system",
            'document': "Improve knowledge transfer and maintainability",
            'optimize': "Improve performance and user experience",
            'test': "Ensure reliability and prevent regressions"
        }

        for keyword, purpose in purpose_map.items():
            if keyword in directive.lower():
                return purpose

        return "Support strategic objectives and improve system capability"

    def _define_map(self, directive: str, context: dict = None) -> list:
        """Define MAP - Massive Action Plan steps."""
        actions = []

        # Generate action steps based on directive type
        if 'build' in directive.lower() or 'create' in directive.lower():
            actions = [
                {
                    'step': 1,
                    'action': 'Research existing patterns and templates',
                    'estimate_minutes': 10,
                    'status': 'pending'
                },
                {
                    'step': 2,
                    'action': f'Implement core logic for {directive}',
                    'estimate_minutes': 30,
                    'status': 'pending'
                },
                {
                    'step': 3,
                    'action': 'Write tests and validate functionality',
                    'estimate_minutes': 15,
                    'status': 'pending'
                },
                {
                    'step': 4,
                    'action': 'Document implementation and usage',
                    'estimate_minutes': 10,
                    'status': 'pending'
                }
            ]
        elif 'fix' in directive.lower():
            actions = [
                {
                    'step': 1,
                    'action': 'Reproduce issue and identify root cause',
                    'estimate_minutes': 15,
                    'status': 'pending'
                },
                {
                    'step': 2,
                    'action': 'Implement fix',
                    'estimate_minutes': 20,
                    'status': 'pending'
                },
                {
                    'step': 3,
                    'action': 'Verify fix resolves issue',
                    'estimate_minutes': 10,
                    'status': 'pending'
                }
            ]
        else:
            # Generic action plan
            actions = [
                {
                    'step': 1,
                    'action': f'Execute: {directive}',
                    'estimate_minutes': 30,
                    'status': 'pending'
                },
                {
                    'step': 2,
                    'action': 'Verify completion',
                    'estimate_minutes': 10,
                    'status': 'pending'
                }
            ]

        # Calculate total estimated time
        total_est = sum(a['estimate_minutes'] for a in actions)

        return actions

    def save_plan(self, plan: dict) -> Path:
        """Save plan to file system."""
        filename = f"{plan['id']}-{plan['plan_name'].replace(' ', '-')[:30]}.yaml"
        filepath = PLANS_DIR / filename

        with open(filepath, 'w') as f:
            yaml.dump(plan, f, default_flow_style=False, sort_keys=False)

        logger.info(f"Plan saved: {filepath}")
        return filepath

class PlanningAgentServer(BaseHTTPRequestHandler):
    """HTTP server for RPM Planning Agent."""

    generator = RPMPlanGenerator()

    def do_GET(self):
        if self.path == '/health':
            self.send_response(200)
            self.send_header('Content-Type', 'application/json')
            self.end_headers()
            self.wfile.write(json.dumps({
                "status": "ok",
                "agent": "planning",
                "capabilities": ["generate_rpm_plan", "parse_directive"]
            }).encode())
        else:
            self.send_error(404)

    def do_POST(self):
        if self.path == '/generate_plan':
            content_length = int(self.headers['Content-Length'])
            body = self.rfile.read(content_length)
            data = json.loads(body.decode())

            directive = data.get('directive', '')
            context = data.get('context', {})

            if not directive:
                self.send_error(400, "Missing 'directive' in request")
                return

            # Generate plan
            plan = self.generator.generate_plan(directive, context)
            filepath = self.generator.save_plan(plan)

            # Send response
            self.send_response(200)
            self.send_header('Content-Type', 'application/json')
            self.end_headers()
            self.wfile.write(json.dumps({
                'status': 'success',
                'plan_id': plan['id'],
                'filepath': str(filepath),
                'plan': plan
            }).encode())
        else:
            self.send_error(404)

    def log_message(self, format, *args):
        pass

def check_for_tasks():
    """Check for pending task requests and process them."""
    for task_file in TASKS_DIR.glob('*.request.json'):
        try:
            with open(task_file, 'r') as f:
                task = json.load(f)

            if task.get('agent') == 'planning' and task.get('action') == 'generate_plan':
                logger.info(f"Processing task: {task['task_id']}")

                # Generate plan
                generator = RPMPlanGenerator()
                plan = generator.generate_plan(
                    task['directive'],
                    task.get('context', {})
                )
                filepath = generator.save_plan(plan)

                # Write result
                result_file = task_file.parent / f"{task['task_id']}.result.json"
                with open(result_file, 'w') as f:
                    json.dump({
                        'task_id': task['task_id'],
                        'status': 'completed',
                        'result': {
                            'plan_id': plan['id'],
                            'filepath': str(filepath)
                        },
                        'completed_at': datetime.now().isoformat()
                    }, f, indent=2)

                # Remove request file
                task_file.unlink()
                logger.info(f"Task completed: {task['task_id']}")

        except Exception as e:
            logger.error(f"Error processing task {task_file}: {e}")

def main():
    parser = argparse.ArgumentParser()
    parser.add_argument('--port', type=int, default=5014)
    parser.add_argument('--task-mode', action='store_true', help='Run in task processing mode (no HTTP server)')
    args = parser.parse_args()

    if args.task_mode:
        logger.info("Planning agent started in task processing mode")
        try:
            while True:
                check_for_tasks()
                time.sleep(5)
        except KeyboardInterrupt:
            logger.info("Planning agent shutting down")
            sys.exit(0)
    else:
        server = ThreadingHTTPServer(('127.0.0.1', args.port), PlanningAgentServer)

        def shutdown_handler(signum, frame):
            logger.info("Planning agent shutting down")
            server.shutdown()
            sys.exit(0)

        signal.signal(signal.SIGTERM, shutdown_handler)
        signal.signal(signal.SIGINT, shutdown_handler)

        logger.info(f"RPM Planning agent started on port {args.port}")
        logger.info("Capabilities: generate_rpm_plan, parse_directive, file-based task processing")
        server.serve_forever()

if __name__ == '__main__':
    main()
