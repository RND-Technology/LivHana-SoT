/**
 * Agent Status API Route
 * Provides coordination status for dual Tier-1 agents
 */
import { Router } from 'express';
import { promises as fs } from 'fs';
import path from 'path';
const router = Router();
const ROOT = process.cwd();
const TASK_DIR = path.join(ROOT, 'tmp/agent_status/codex_tasks');
const HEARTBEAT_LIVHANA = path.join(ROOT, 'tmp/agent_status/livhana_status/heartbeat.json');
const HEARTBEAT_CODEX = path.join(ROOT, 'tmp/agent_status/codex_status/heartbeat.json');
/**
 * GET /api/agents/status
 * Returns current coordination status
 */
router.get('/status', async (_req, res) => {
    try {
        // Count pending tasks
        let pendingCount = 0;
        try {
            const files = await fs.readdir(TASK_DIR);
            const requestFiles = files.filter(f => f.endsWith('.request.json'));
            const resultFiles = files.filter(f => f.endsWith('.result.json'));
            // Pending = requests without matching results
            for (const requestFile of requestFiles) {
                const taskId = requestFile.replace('task_', '').replace('.request.json', '');
                const resultFile = `task_${taskId}.result.json`;
                if (!resultFiles.includes(resultFile)) {
                    pendingCount++;
                }
            }
        }
        catch (err) {
            // Task dir doesn't exist or is empty
            pendingCount = 0;
        }
        // Read heartbeats
        const heartbeats = [];
        try {
            const livhanaData = await fs.readFile(HEARTBEAT_LIVHANA, 'utf-8');
            const livhana = JSON.parse(livhanaData);
            heartbeats.push({
                agent: livhana.agent_name || 'livhana-layer1.1',
                status: livhana.status || 'unknown',
                lastSeen: livhana.last_heartbeat || 'never',
                uptime: livhana.uptime_seconds || 0,
                activeTasks: livhana.active_tasks || []
            });
        }
        catch (err) {
            // Livhana heartbeat not available
            heartbeats.push({
                agent: 'livhana-layer1.1',
                status: 'offline',
                lastSeen: 'never',
                uptime: 0,
                activeTasks: []
            });
        }
        try {
            const codexData = await fs.readFile(HEARTBEAT_CODEX, 'utf-8');
            const codex = JSON.parse(codexData);
            heartbeats.push({
                agent: codex.agent_name || 'codex-cursor',
                status: codex.status || 'unknown',
                lastSeen: codex.last_heartbeat || 'never',
                uptime: codex.uptime_seconds || 0,
                activeTasks: codex.active_tasks || []
            });
        }
        catch (err) {
            // CODEX heartbeat not available
            heartbeats.push({
                agent: 'codex-cursor',
                status: 'offline',
                lastSeen: 'never',
                uptime: 0,
                activeTasks: []
            });
        }
        res.json({
            pending: pendingCount,
            heartbeats
        });
    }
    catch (err) {
        console.error('[AgentStatus] Error:', err);
        res.status(500).json({
            pending: 0,
            heartbeats: [],
            error: err instanceof Error ? err.message : 'Unknown error'
        });
    }
});
export default router;
