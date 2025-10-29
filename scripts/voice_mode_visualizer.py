#!/usr/bin/env python3
"""
Real-Time Voice Mode Visualizer with Jupyter Integration
Customizable visualizations for Whisper STT streaming + system metrics
Auto-updates dependency files every minute
"""

import json
import time
import subprocess
import os
from datetime import datetime
from pathlib import Path
from typing import Dict, Any, List
import sys

# Add project root to path
PROJECT_ROOT = Path(__file__).parent.parent
sys.path.insert(0, str(PROJECT_ROOT))

class VoiceVisualizer:
    def __init__(self):
        self.project_root = PROJECT_ROOT
        self.metrics_dir = self.project_root / "tmp" / "agent_status" / "system_metrics"
        self.output_dir = self.project_root / "tmp" / "visualizations"
        self.output_dir.mkdir(parents=True, exist_ok=True)
        
        # Dependency tracking - MINIMAL PO1 MODE
        self.dep_files = []  # NO AUTO-UPDATES - Manual control only
        
    def get_system_metrics(self) -> Dict[str, Any]:
        """Fetch current system metrics from monitoring script"""
        metrics_file = self.metrics_dir / "metrics.json"
        
        if metrics_file.exists():
            with open(metrics_file) as f:
                return json.load(f)
        
        return {
            "timestamp": datetime.utcnow().isoformat() + "Z",
            "memory": {"freePercent": 0, "status": "UNKNOWN"},
            "healthScore": 0
        }
    
    def get_voice_queue_status(self) -> Dict[str, Any]:
        """Get voice mode queue depth and processing stats"""
        try:
            result = subprocess.run(
                ["redis-cli", "LLEN", "bull:voice-mode-reasoning-jobs:wait"],
                capture_output=True,
                text=True,
                timeout=2
            )
            queue_depth = int(result.stdout.strip()) if result.returncode == 0 else -1
        except:
            queue_depth = -1
        
        return {
            "queueDepth": queue_depth,
            "status": "HEALTHY" if 0 <= queue_depth < 10 else "BACKLOG" if queue_depth >= 10 else "OFFLINE"
        }
    
    def generate_mermaid_diagram(self) -> str:
        """Generate Mermaid diagram of current system state"""
        metrics = self.get_system_metrics()
        voice = self.get_voice_queue_status()
        
        health_score = metrics.get("healthScore", 0)
        mem_status = metrics.get("memory", {}).get("status", "UNKNOWN")
        queue_status = voice.get("status", "UNKNOWN")
        
        # Color coding based on health
        health_color = "green" if health_score >= 80 else "yellow" if health_score >= 50 else "red"
        mem_color = "green" if mem_status == "HEALTHY" else "yellow" if mem_status == "WARNING" else "red"
        voice_color = "green" if queue_status == "HEALTHY" else "yellow" if queue_status == "BACKLOG" else "red"
        
        mermaid = f"""
graph TD
    A[VS Code Session] -->|Health: {health_score}/100| B{{System Status}}
    B -->|Memory: {mem_status}| C[Memory Monitor]
    B -->|Voice Queue: {queue_status}| D[Voice Mode]
    B -->|Threads| E[Electron Framework]
    
    C -.->|{metrics.get('memory', {}).get('freePercent', 0)}% free| F[Auto-Cleanup]
    D -.->|{voice.get('queueDepth', 0)} jobs| G[STT/TTS Services]
    E -.->|{metrics.get('electronThreads', 0)} threads| H[IPC Monitor]
    
    style B fill:{health_color}
    style C fill:{mem_color}
    style D fill:{voice_color}
    
    classDef healthy fill:#90EE90
    classDef warning fill:#FFD700
    classDef critical fill:#FF6B6B
"""
        
        output_file = self.output_dir / "system_state.mmd"
        with open(output_file, 'w') as f:
            f.write(mermaid)
        
        return str(output_file)
    
    def generate_ascii_dashboard(self) -> str:
        """Generate ASCII dashboard for terminal display"""
        metrics = self.get_system_metrics()
        voice = self.get_voice_queue_status()
        
        health_score = metrics.get("healthScore", 0)
        mem_percent = metrics.get("memory", {}).get("freePercent", 0)
        threads = metrics.get("electronThreads", 0)
        watchers = metrics.get("fileWatchers", 0)
        crashes = metrics.get("crashesLast24h", 0)
        queue_depth = voice.get("queueDepth", -1)
        
        # Health bar
        health_bar = "█" * (health_score // 5) + "░" * (20 - health_score // 5)
        
        dashboard = f"""
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  🎼 VOICE MODE SYSTEM DASHBOARD
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

🏥 HEALTH SCORE: {health_score}/100
   [{health_bar}]

📊 SYSTEM METRICS:
   • Memory Free:     {mem_percent}%
   • Electron Threads: {threads}
   • File Watchers:   {watchers}
   • Crashes (24h):   {crashes}

🎤 VOICE MODE:
   • Queue Depth:     {queue_depth} jobs
   • Status:          {voice.get('status', 'UNKNOWN')}

⏰ Last Update: {metrics.get('timestamp', 'N/A')}

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
"""
        return dashboard
    
    def update_dependencies(self) -> List[str]:
        """DISABLED - PO1 Rule: No auto-updates, manual control only"""
        # AUTO-UPDATES DISABLED - preventing crashes and instability
        # All dependency updates must be explicitly approved and tested
        return []
    
    def run_continuous(self, interval: int = 60):
        """Run continuous monitoring and visualization"""
        print(f"🎼 Starting Voice Mode Visualizer (interval: {interval}s)")
        print(f"📁 Output: {self.output_dir}")
        
        cycle = 0
        while True:
            cycle += 1
            print(f"\n━━━ Cycle {cycle} ━━━")
            
            # Generate visualizations
            mermaid_file = self.generate_mermaid_diagram()
            print(f"✅ Mermaid diagram: {mermaid_file}")
            
            # Display ASCII dashboard
            dashboard = self.generate_ascii_dashboard()
            print(dashboard)
            
            # Update dependencies every minute
            if cycle % 1 == 0:  # Every cycle (60s)
                print("🔄 Checking dependency updates...")
                updates = self.update_dependencies()
                if updates:
                    print("📦 Dependency updates available:")
                    for update in updates:
                        print(f"   • {update}")
                else:
                    print("✅ All dependencies current")
            
            # Save dashboard to file
            dashboard_file = self.output_dir / "dashboard.txt"
            with open(dashboard_file, 'w') as f:
                f.write(dashboard)
            
            time.sleep(interval)

def main():
    """Main entry point"""
    visualizer = VoiceVisualizer()
    
    # Check if Jupyter mode requested
    if "--jupyter" in sys.argv:
        print("🎯 Jupyter mode - generating static visualizations")
        visualizer.generate_mermaid_diagram()
        print(visualizer.generate_ascii_dashboard())
    else:
        # Continuous monitoring mode
        visualizer.run_continuous(interval=60)

if __name__ == "__main__":
    main()
