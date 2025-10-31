#!/usr/bin/env node
const { spawn } = require('child_process');
const path = require('path');

let port = 5013;
const portIndex = process.argv.indexOf('--port');
if (portIndex !== -1) port = parseInt(process.argv[portIndex + 1], 10);

const rootDir = path.join(__dirname, '..');
const pythonScript = path.join(rootDir, 'scripts', 'agents', 'implementations', 'artifact_agent.py');
console.log(`🚀 artifact agent (port ${port})`);

// Artifact agent requires additional arguments
const args = [
  pythonScript,
  '--port', port.toString(),
  '--status-file', path.join(rootDir, 'tmp/agent_status/artifact.status.json'),
  '--log-file', path.join(rootDir, 'logs/artifact_agent.log'),
  '--audit-log', path.join(rootDir, 'logs/artifact_audit.log'),
  '--registry-file', path.join(rootDir, 'tmp/agent_status/shared/agent_registry.json'),
  '--coord-log', path.join(rootDir, 'logs/artifact_coord.log')
];

const proc = spawn('python3', args, {
  cwd: rootDir,
  stdio: ['inherit', 'inherit', 'inherit']
});

process.on('SIGTERM', () => proc.kill('SIGTERM'));
process.on('SIGINT', () => proc.kill('SIGINT'));
proc.on('exit', (code) => process.exit(code || 0));
