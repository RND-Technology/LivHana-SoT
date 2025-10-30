#!/usr/bin/env bash
# Agent Management Module (Principle of One)

spawn_agents() {
  echo "🤖 Spawning 5-agent topology..."

  mkdir -p tmp/agent_status/shared

  spawn_agent "planning" 5014
  spawn_agent "research" 5015
  spawn_agent "artifact" 5013
  spawn_agent "execmon" 5017
  spawn_agent "qa" 5016

  echo "✅ Agents spawned"
}

spawn_agent() {
  local name="$1"
  local port="$2"

  tmux has-session -t "$name" 2>/dev/null && { echo "  ℹ️  $name running"; return; }

  # Check if shim exists
  if [[ ! -f "agents/${name}.cjs" ]]; then
    create_agent_shim "$name" "$port"
  fi

  tmux new-session -d -s "$name" "node agents/${name}.cjs --port $port"
  sleep 2
  echo "  ✅ $name spawned"
}

create_agent_shim() {
  local name="$1"
  local port="$2"

  mkdir -p agents

  cat > "agents/${name}.cjs" << 'EOF_OUTER'
#!/usr/bin/env node
const { spawn } = require('child_process');
const path = require('path');

let port = PORT_PLACEHOLDER;
const portIndex = process.argv.indexOf('--port');
if (portIndex !== -1) port = parseInt(process.argv[portIndex + 1], 10);

const pythonScript = path.join(__dirname, '..', 'scripts', 'agents', 'implementations', 'NAME_PLACEHOLDER_agent.py');
console.log(`🚀 NAME_PLACEHOLDER agent (port ${port})`);

const proc = spawn('python3', [pythonScript, '--port', port.toString()], {
  cwd: path.join(__dirname, '..'),
  stdio: ['inherit', 'inherit', 'inherit']
});

process.on('SIGTERM', () => proc.kill('SIGTERM'));
process.on('SIGINT', () => proc.kill('SIGINT'));
proc.on('exit', (code) => process.exit(code || 0));
EOF_OUTER

  # Replace placeholders
  sed -i.bak "s/PORT_PLACEHOLDER/${port}/g" "agents/${name}.cjs"
  sed -i.bak "s/NAME_PLACEHOLDER/${name}/g" "agents/${name}.cjs"
  rm -f "agents/${name}.cjs.bak"

  chmod +x "agents/${name}.cjs"
}
