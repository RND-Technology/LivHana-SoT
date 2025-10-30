#!/usr/bin/env python3
"""
Linear ↔ RPM DNA Integration Engine
Token-efficient GraphQL queries with selective field extraction.
Maps Linear issues to RPM DNA taxonomy for agent context injection.
"""

import os
import json
import hashlib
from datetime import datetime, timezone
from typing import Dict, List, Optional
from pathlib import Path

# Token-efficient GraphQL fragments (only essential fields)
ISSUE_CORE_FIELDS = """
fragment IssueCore on Issue {
  id
  identifier
  title
  priority
  state { name }
  assignee { name email }
  labels { nodes { name } }
  project { name }
  createdAt
  updatedAt
}
"""

class LinearRPMSync:
    """Token-efficient Linear sync with RPM DNA mapping."""
    
    def __init__(self, api_key: str, cache_dir: str = "tmp/linear_cache"):
        self.api_key = api_key
        self.cache_dir = Path(cache_dir)
        self.cache_dir.mkdir(parents=True, exist_ok=True)
        self.api_url = "https://api.linear.app/graphql"
        
    def _graphql_request(self, query: str, variables: Optional[Dict] = None) -> Dict:
        """Execute GraphQL query with minimal token overhead."""
        import requests
        
        headers = {
            "Authorization": self.api_key,
            "Content-Type": "application/json"
        }
        
        payload = {"query": query}
        if variables:
            payload["variables"] = variables
            
        response = requests.post(self.api_url, json=payload, headers=headers, timeout=10)
        response.raise_for_status()
        return response.json()
    
    def extract_rpm_dna(self, issue_title: str) -> Optional[str]:
        """Extract RPM DNA code from issue title: [ARCH-CLOUD-001] Title"""
        import re
        match = re.search(r'\[([A-Z]+-[A-Z0-9]+-\d+)\]', issue_title)
        return match.group(1) if match else None
    
    def map_to_rpm_taxonomy(self, issue: Dict) -> Dict:
        """Map Linear issue to RPM DNA structure."""
        rpm_dna = self.extract_rpm_dna(issue['title'])
        
        # Parse RPM DNA components
        tier = "TIER_3"  # Default
        if rpm_dna:
            if any(label in issue.get('labels', {}).get('nodes', []) 
                   for label in [{'name': 'tier1'}, {'name': 'p0-critical'}]):
                tier = "TIER_1"
            elif issue['priority'] <= 1:
                tier = "TIER_2"
        
        # Map Linear priority (0-4) to RPM CSF
        csf_map = {
            0: "CRITICAL_STANDARD",  # P0
            1: "HIGH_STANDARD",      # P1
            2: "STANDARD",           # P2
            3: "BASELINE",           # P3
            4: "NICE_TO_HAVE"        # P4
        }
        
        return {
            "rpm_dna": rpm_dna,
            "linear_id": issue['identifier'],
            "linear_uuid": issue['id'],
            "title": issue['title'].replace(f"[{rpm_dna}]", "").strip() if rpm_dna else issue['title'],
            "tier": tier,
            "csf": csf_map.get(issue['priority'], "BASELINE"),
            "owner": issue.get('assignee', {}).get('name', 'Unassigned'),
            "status": issue['state']['name'],
            "labels": [label['name'] for label in issue.get('labels', {}).get('nodes', [])],
            "project": issue.get('project', {}).get('name', 'No Project'),
            "created": issue['createdAt'],
            "updated": issue['updatedAt']
        }
    
    def fetch_active_issues(self, team_id: Optional[str] = None, limit: int = 50) -> List[Dict]:
        """Fetch active issues with token-efficient query."""
        
        team_filter = f', team: {{id: {{eq: "{team_id}"}}}}' if team_id else ""
        
        query = f"""
        {ISSUE_CORE_FIELDS}
        
        query FetchActiveIssues {{
          issues(
            first: {limit}
            filter: {{
              state: {{type: {{nin: ["completed", "canceled"]}}}}{team_filter}
            }}
            orderBy: updatedAt
          ) {{
            nodes {{
              ...IssueCore
            }}
          }}
        }}
        """
        
        result = self._graphql_request(query)
        return result['data']['issues']['nodes']
    
    def sync_to_cache(self, team_id: Optional[str] = None) -> Dict:
        """Sync Linear issues to local cache with RPM DNA mapping."""
        issues = self.fetch_active_issues(team_id)
        rpm_mapped = [self.map_to_rpm_taxonomy(issue) for issue in issues]
        
        # Cache by RPM DNA
        cache_file = self.cache_dir / f"linear_sync_{datetime.now(timezone.utc).strftime('%Y%m%d_%H%M%S')}.json"
        
        sync_data = {
            "synced_at": datetime.now(timezone.utc).isoformat(),
            "issue_count": len(rpm_mapped),
            "rpm_mapped_count": sum(1 for i in rpm_mapped if i['rpm_dna']),
            "issues": rpm_mapped
        }
        
        cache_file.write_text(json.dumps(sync_data, indent=2))
        
        # Create symlink to latest
        latest_link = self.cache_dir / "latest.json"
        if latest_link.exists():
            latest_link.unlink()
        latest_link.symlink_to(cache_file.name)
        
        return sync_data
    
    def inject_agent_context(self, agent_name: str) -> str:
        """Generate context string for agent prompts from Linear cache."""
        latest_cache = self.cache_dir / "latest.json"
        
        if not latest_cache.exists():
            return f"# {agent_name} Linear Context\n\nNo cached Linear data available."
        
        data = json.loads(latest_cache.read_text())
        
        # Filter issues assigned to or relevant to agent
        relevant_issues = [
            issue for issue in data['issues']
            if agent_name.lower() in issue['owner'].lower() or
               agent_name.lower() in ' '.join(issue['labels']).lower()
        ]
        
        context = f"""# {agent_name} Linear Context (Synced: {data['synced_at']})

**Active Issues**: {len(relevant_issues)}/{data['issue_count']}
**RPM DNA Mapped**: {data['rpm_mapped_count']}/{data['issue_count']}

## Your Assigned Tasks
"""
        
        for issue in relevant_issues[:10]:  # Limit to 10 for token efficiency
            context += f"""
### {issue['linear_id']}: {issue['title']}
- **RPM DNA**: {issue['rpm_dna'] or 'Not mapped'}
- **Tier**: {issue['tier']}
- **CSF**: {issue['csf']}
- **Status**: {issue['status']}
- **Labels**: {', '.join(issue['labels'])}
"""
        
        return context
    
    def create_issue(self, title: str, description: str, priority: int = 2, 
                    team_id: str = None, labels: List[str] = None) -> Dict:
        """Create Linear issue with RPM DNA in title."""
        
        mutation = """
        mutation CreateIssue($input: IssueCreateInput!) {
          issueCreate(input: $input) {
            success
            issue {
              id
              identifier
              url
            }
          }
        }
        """
        
        variables = {
            "input": {
                "title": title,
                "description": description,
                "priority": priority,
                "teamId": team_id,
                "labelIds": labels or []
            }
        }
        
        result = self._graphql_request(mutation, variables)
        return result['data']['issueCreate']['issue']


def main():
    """CLI interface for Linear RPM sync."""
    import sys
    
    api_key = os.getenv("LINEAR_API_KEY")
    if not api_key:
        print("ERROR: LINEAR_API_KEY environment variable not set")
        print("Fetch from 1Password: op read 'op://LivHana/Linear API Key/credential'")
        sys.exit(1)
    
    sync = LinearRPMSync(api_key)
    
    if len(sys.argv) < 2:
        print("Usage: linear_sync.py [sync|context <agent_name>|create <title>]")
        sys.exit(1)
    
    command = sys.argv[1]
    
    if command == "sync":
        team_id = sys.argv[2] if len(sys.argv) > 2 else None
        result = sync.sync_to_cache(team_id)
        print(f"✅ Synced {result['issue_count']} issues")
        print(f"📊 RPM DNA mapped: {result['rpm_mapped_count']}/{result['issue_count']}")
        print(f"📁 Cache: tmp/linear_cache/latest.json")
        
    elif command == "context":
        if len(sys.argv) < 3:
            print("ERROR: Agent name required")
            sys.exit(1)
        agent_name = sys.argv[2]
        context = sync.inject_agent_context(agent_name)
        print(context)
        
    elif command == "create":
        if len(sys.argv) < 3:
            print("ERROR: Issue title required")
            sys.exit(1)
        title = sys.argv[2]
        issue = sync.create_issue(title, "Created via linear_sync.py")
        print(f"✅ Created: {issue['identifier']} - {issue['url']}")
    
    else:
        print(f"Unknown command: {command}")
        sys.exit(1)


if __name__ == "__main__":
    main()
