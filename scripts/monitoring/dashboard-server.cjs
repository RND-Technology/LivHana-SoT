#!/usr/bin/env node
/**
 * Visual Dashboard Server for Charlie
 * Real-time agent status monitoring at localhost:9000
 * WebSocket updates every 2 seconds
 */

const http = require('http');
const fs = require('fs');
const path = require('path');
const { WebSocketServer } = require('ws');

const PORT = 9000;
const ROOT_DIR = path.join(__dirname, '../..');
const AGENT_STATUS_DIR = path.join(ROOT_DIR, 'tmp/agent_status');

// Security: Basic auth configuration
const DASHBOARD_API_KEY = process.env.DASHBOARD_API_KEY || 'dev-key-change-in-production';

// Dashboard state
let dashboardState = {
  currentAgent: 'none',
  currentTask: 'idle',
  progress: 0,
  lastActions: [],
  agents: {
    planning: { status: 'unknown', lastSeen: null },
    research: { status: 'unknown', lastSeen: null },
    artifact: { status: 'unknown', lastSeen: null },
    execmon: { status: 'unknown', lastSeen: null },
    qa: { status: 'unknown', lastSeen: null }
  },
  timestamp: new Date().toISOString()
};

// Read agent status files
function updateDashboardState() {
  const agents = ['planning', 'research', 'artifact', 'execmon', 'qa'];

  agents.forEach(agent => {
    const statusFile = path.join(AGENT_STATUS_DIR, `${agent}.status.json`);

    try {
      if (fs.existsSync(statusFile)) {
        const stats = fs.statSync(statusFile);
        const data = JSON.parse(fs.readFileSync(statusFile, 'utf8'));

        dashboardState.agents[agent] = {
          status: data.status || 'active',
          lastSeen: stats.mtime.toISOString(),
          task: data.current_task || null
        };

        // Update current agent/task if this agent is active
        if (data.status === 'active' && data.current_task) {
          dashboardState.currentAgent = agent;
          dashboardState.currentTask = data.current_task;
        }
      }
    } catch (err) {
      dashboardState.agents[agent].status = 'error';
    }
  });

  dashboardState.timestamp = new Date().toISOString();
}

// Security: Authentication middleware
function authenticate(req) {
  const authHeader = req.headers['authorization'];

  if (!authHeader) {
    return { authorized: false, error: 'Missing Authorization header' };
  }

  // Support both "Bearer <key>" and raw key
  const providedKey = authHeader.startsWith('Bearer ')
    ? authHeader.slice(7)
    : authHeader;

  if (providedKey !== DASHBOARD_API_KEY) {
    return { authorized: false, error: 'Invalid API key' };
  }

  return { authorized: true };
}

// Serve HTML dashboard
const server = http.createServer((req, res) => {
  // Security: Authenticate all requests except health check
  if (req.url !== '/health') {
    const auth = authenticate(req);
    if (!auth.authorized) {
      res.writeHead(401, {
        'Content-Type': 'application/json',
        'WWW-Authenticate': 'Bearer realm="Dashboard"'
      });
      res.end(JSON.stringify({
        error: 'Unauthorized',
        message: auth.error,
        hint: 'Set DASHBOARD_API_KEY environment variable or use Authorization header'
      }));
      return;
    }
  }

  if (req.url === '/') {
    res.writeHead(200, { 'Content-Type': 'text/html' });
    res.end(getHTML());
  } else if (req.url === '/api/status') {
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify(dashboardState));
  } else if (req.url === '/health') {
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ status: 'healthy', timestamp: new Date().toISOString() }));
  } else {
    res.writeHead(404);
    res.end('Not Found');
  }
});

// WebSocket server
const wss = new WebSocketServer({ server });

wss.on('connection', (ws) => {
  console.log('[Dashboard] Client connected');

  // Send initial state
  ws.send(JSON.stringify(dashboardState));

  // Send updates every 2 seconds
  const interval = setInterval(() => {
    if (ws.readyState === 1) { // OPEN
      updateDashboardState();
      ws.send(JSON.stringify(dashboardState));
    }
  }, 2000);

  ws.on('close', () => {
    console.log('[Dashboard] Client disconnected');
    clearInterval(interval);
  });
});

// Update dashboard state every 2 seconds
setInterval(updateDashboardState, 2000);

server.listen(PORT, () => {
  console.log(`✅ Visual Dashboard running at http://localhost:${PORT}`);
  console.log(`📊 WebSocket updates every 2 seconds`);
  console.log(`🎯 Purpose: Clear execution visibility for Charlie`);
});

function getHTML() {
  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Liv Hana Dashboard</title>
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body {
      font-family: 'Monaco', 'Courier New', monospace;
      background: #0a0a0a;
      color: #00ff00;
      padding: 20px;
    }
    .container { max-width: 1200px; margin: 0 auto; }
    h1 {
      font-size: 24px;
      margin-bottom: 20px;
      text-align: center;
      color: #00ff00;
      text-shadow: 0 0 10px #00ff00;
    }
    .grid {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 20px;
      margin-bottom: 20px;
    }
    .card {
      background: #1a1a1a;
      border: 2px solid #00ff00;
      border-radius: 8px;
      padding: 20px;
      box-shadow: 0 0 20px rgba(0, 255, 0, 0.2);
    }
    .card h2 {
      font-size: 18px;
      margin-bottom: 15px;
      color: #00ff00;
    }
    .agent-grid {
      display: grid;
      grid-template-columns: repeat(5, 1fr);
      gap: 10px;
    }
    .agent {
      background: #2a2a2a;
      border: 1px solid #444;
      border-radius: 4px;
      padding: 10px;
      text-align: center;
      transition: all 0.3s;
    }
    .agent.active {
      background: #1a4a1a;
      border-color: #00ff00;
      box-shadow: 0 0 10px rgba(0, 255, 0, 0.3);
    }
    .agent-name {
      font-size: 12px;
      font-weight: bold;
      margin-bottom: 5px;
      text-transform: uppercase;
    }
    .agent-status {
      font-size: 10px;
      color: #888;
    }
    .agent.active .agent-status { color: #00ff00; }
    .current-task {
      font-size: 20px;
      color: #00ff00;
      margin: 10px 0;
      padding: 15px;
      background: #1a4a1a;
      border-radius: 4px;
      text-align: center;
    }
    .progress-bar {
      width: 100%;
      height: 30px;
      background: #2a2a2a;
      border-radius: 4px;
      overflow: hidden;
      margin: 10px 0;
    }
    .progress-fill {
      height: 100%;
      background: linear-gradient(90deg, #00ff00, #00aa00);
      transition: width 0.5s ease;
      display: flex;
      align-items: center;
      justify-content: center;
      color: #000;
      font-weight: bold;
    }
    .actions-list {
      list-style: none;
    }
    .action-item {
      background: #2a2a2a;
      padding: 10px;
      margin-bottom: 8px;
      border-left: 3px solid #00ff00;
      border-radius: 4px;
      font-size: 12px;
    }
    .timestamp {
      font-size: 10px;
      color: #666;
      text-align: center;
      margin-top: 20px;
    }
  </style>
</head>
<body>
  <div class="container">
    <h1>🎖️ LIV HANA - VISUAL DASHBOARD</h1>

    <div class="grid">
      <div class="card">
        <h2>CURRENT EXECUTION</h2>
        <div id="currentAgent">Agent: <span style="color: #00ff00;">none</span></div>
        <div class="current-task" id="currentTask">idle</div>
        <div class="progress-bar">
          <div class="progress-fill" id="progressBar" style="width: 0%">0%</div>
        </div>
      </div>

      <div class="card">
        <h2>AGENT TOPOLOGY (5/5)</h2>
        <div class="agent-grid" id="agentGrid"></div>
      </div>
    </div>

    <div class="card">
      <h2>LAST 3 ACTIONS</h2>
      <ul class="actions-list" id="actionsList"></ul>
    </div>

    <div class="timestamp" id="timestamp">Last update: --</div>
  </div>

  <script>
    const ws = new WebSocket('ws://localhost:${PORT}');

    ws.onmessage = (event) => {
      const data = JSON.parse(event.data);
      updateDashboard(data);
    };

    function updateDashboard(data) {
      // Current agent/task
      document.getElementById('currentAgent').innerHTML =
        'Agent: <span style="color: #00ff00;">' + data.currentAgent + '</span>';
      document.getElementById('currentTask').textContent = data.currentTask;

      // Progress bar
      const progress = data.progress || 0;
      const progressBar = document.getElementById('progressBar');
      progressBar.style.width = progress + '%';
      progressBar.textContent = progress + '%';

      // Agents
      const agentGrid = document.getElementById('agentGrid');
      agentGrid.innerHTML = '';
      Object.entries(data.agents).forEach(([name, agent]) => {
        const div = document.createElement('div');
        div.className = 'agent' + (data.currentAgent === name ? ' active' : '');
        div.innerHTML = \`
          <div class="agent-name">\${name}</div>
          <div class="agent-status">\${agent.status}</div>
        \`;
        agentGrid.appendChild(div);
      });

      // Last 3 actions
      const actionsList = document.getElementById('actionsList');
      actionsList.innerHTML = '';
      (data.lastActions || []).slice(0, 3).forEach(action => {
        const li = document.createElement('li');
        li.className = 'action-item';
        li.textContent = action;
        actionsList.appendChild(li);
      });

      // Timestamp
      document.getElementById('timestamp').textContent =
        'Last update: ' + new Date(data.timestamp).toLocaleTimeString();
    }
  </script>
</body>
</html>`;
}
