import fs from 'fs/promises';
import path from 'path';

const MEMORY_PATH = path.join(process.cwd(), 'tmp/agent_status/memory_loop.json');

export async function syncMemory(agentId, context) {
  let memory = {};
  try {
    const raw = await fs.readFile(MEMORY_PATH, 'utf8');
    memory = JSON.parse(raw);
  } catch {
    memory = { agents: {}, last_sync_timestamp: null };
  }

  memory.agents[agentId] = {
    ...memory.agents[agentId],
    ...context,
    last_update: new Date().toISOString()
  };

  memory.last_sync_timestamp = new Date().toISOString();

  // Atomic write pattern (Marine Corps standard)
  const tmp = `${MEMORY_PATH}.tmp`;
  await fs.writeFile(tmp, JSON.stringify(memory, null, 2));
  await fs.rename(tmp, MEMORY_PATH);
}

export async function getSharedContext(agentId) {
  try {
    const raw = await fs.readFile(MEMORY_PATH, 'utf8');
    const memory = JSON.parse(raw);
    return memory.agents[agentId] || {};
  } catch {
    return {};
  }
}
