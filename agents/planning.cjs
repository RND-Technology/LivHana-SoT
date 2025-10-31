#!/usr/bin/env node
const { spawn } = require('child_process');
const path = require('path');

let port = 5014;
const portIndex = process.argv.indexOf('--port');
if (portIndex !== -1) port = parseInt(process.argv[portIndex + 1], 10);

const pythonScript = path.join(__dirname, '..', 'scripts', 'agents', 'implementations', 'planning_agent.py');
console.log(`🚀 planning agent (port ${port})`);

const proc = spawn('python3', [pythonScript, '--port', port.toString()], {
  cwd: path.join(__dirname, '..'),
  stdio: ['inherit', 'inherit', 'inherit']
});

process.on('SIGTERM', () => proc.kill('SIGTERM'));
process.on('SIGINT', () => proc.kill('SIGINT'));
proc.on('exit', (code) => process.exit(code || 0));
