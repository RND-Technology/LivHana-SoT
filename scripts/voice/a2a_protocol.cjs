#!/usr/bin/env node

/**
 * A2A (Agent-to-Agent) Protocol Implementation
 * Based on Google's JSON-RPC & SSE standard
 *
 * Enables:
 * - Agent capability discovery
 * - Task routing and delegation
 * - Context sharing
 * - Coordination without conflicts
 */

const fs = require('fs');
const path = require('path');

const AGENT_CONTEXT_DIR = path.join(__dirname, '../../tmp/agent_context');
const SHARED_KNOWLEDGE = path.join(__dirname, '../../tmp/shared_knowledge.jsonl');

class A2AProtocol {
  constructor() {
    this.agents = {};
    this.loadAgents();
  }

  /**
   * Load all agent contexts from disk
   */
  loadAgents() {
    const files = fs.readdirSync(AGENT_CONTEXT_DIR);
    files.forEach(file => {
      if (file.endsWith('.json')) {
        const agentData = JSON.parse(
          fs.readFileSync(path.join(AGENT_CONTEXT_DIR, file), 'utf8')
        );
        this.agents[agentData.agent_id] = agentData;
      }
    });
    console.log(`Loaded ${Object.keys(this.agents).length} agents`);
  }

  /**
   * Discover agent capabilities
   * JSON-RPC method: agent.discover
   */
  discover(agentId) {
    const agent = this.agents[agentId];
    if (!agent) {
      return {
        jsonrpc: '2.0',
        error: { code: -32602, message: 'Agent not found' },
        id: null
      };
    }

    return {
      jsonrpc: '2.0',
      result: {
        agent_id: agent.agent_id,
        agent_name: agent.agent_name,
        status: agent.status,
        capabilities: agent.capabilities,
        specializations: agent.specializations,
        latency_p50_ms: agent.latency_metrics.current_p50_ms,
        voice_characteristics: agent.voice_characteristics
      },
      id: 1
    };
  }

  /**
   * Route task to best agent based on capabilities
   */
  routeTask(task) {
    const { type, priority, requires_capabilities } = task;

    // Score each agent for this task
    const scores = Object.entries(this.agents).map(([id, agent]) => {
      let score = 0;

      // Match required capabilities
      if (requires_capabilities) {
        const matchedCapabilities = requires_capabilities.filter(cap =>
          agent.capabilities.includes(cap)
        ).length;
        score += matchedCapabilities * 10;
      }

      // Prioritize based on latency if urgent
      if (priority === 'urgent' && agent.latency_metrics.current_p50_ms) {
        score += (5000 - agent.latency_metrics.current_p50_ms) / 100;
      }

      // Prefer active agents
      if (agent.status === 'active') {
        score += 5;
      }

      return { agent_id: id, agent, score };
    });

    // Sort by score descending
    scores.sort((a, b) => b.score - a.score);

    const bestAgent = scores[0];

    return {
      jsonrpc: '2.0',
      method: 'task.route',
      params: {
        task_id: task.id || Date.now(),
        routed_to: bestAgent.agent_id,
        reason: `Best match with score ${bestAgent.score}`,
        capabilities_matched: bestAgent.agent.capabilities.filter(cap =>
          task.requires_capabilities?.includes(cap)
        )
      }
    };
  }

  /**
   * Share knowledge between agents
   */
  shareKnowledge(knowledge) {
    const knowledgeEntry = {
      agent: knowledge.agent,
      category: knowledge.category,
      insight: knowledge.insight,
      evidence: knowledge.evidence,
      applicability: knowledge.applicability || Object.keys(this.agents),
      timestamp: new Date().toISOString(),
      priority: knowledge.priority || 'medium'
    };

    // Append to shared knowledge file
    fs.appendFileSync(
      SHARED_KNOWLEDGE,
      JSON.stringify(knowledgeEntry) + '\n'
    );

    // Notify applicable agents
    return {
      jsonrpc: '2.0',
      method: 'knowledge.share',
      params: {
        knowledge_id: Date.now(),
        shared_with: knowledgeEntry.applicability,
        timestamp: knowledgeEntry.timestamp
      }
    };
  }

  /**
   * Update agent status
   */
  updateAgentStatus(agentId, updates) {
    if (!this.agents[agentId]) {
      return { error: 'Agent not found' };
    }

    // Merge updates
    Object.assign(this.agents[agentId], updates);
    this.agents[agentId].last_updated = new Date().toISOString();

    // Save to disk
    const filePath = path.join(AGENT_CONTEXT_DIR, `${agentId}.json`);
    fs.writeFileSync(
      filePath,
      JSON.stringify(this.agents[agentId], null, 2)
    );

    return {
      jsonrpc: '2.0',
      result: {
        agent_id: agentId,
        updated: true,
        timestamp: this.agents[agentId].last_updated
      }
    };
  }

  /**
   * Get coordination state for all agents
   */
  getCoordinationState() {
    return {
      jsonrpc: '2.0',
      result: {
        total_agents: Object.keys(this.agents).length,
        active_agents: Object.values(this.agents).filter(a => a.status === 'active').length,
        agents: Object.entries(this.agents).map(([id, agent]) => ({
          agent_id: id,
          agent_name: agent.agent_name,
          status: agent.status,
          capabilities_count: agent.capabilities.length,
          current_latency_p50: agent.latency_metrics.current_p50_ms
        })),
        timestamp: new Date().toISOString()
      }
    };
  }
}

// CLI Interface
if (require.main === module) {
  const protocol = new A2AProtocol();
  const command = process.argv[2];

  switch (command) {
    case 'discover':
      const agentId = process.argv[3];
      console.log(JSON.stringify(protocol.discover(agentId), null, 2));
      break;

    case 'route':
      const taskJson = process.argv[3];
      const task = JSON.parse(taskJson);
      console.log(JSON.stringify(protocol.routeTask(task), null, 2));
      break;

    case 'share':
      const knowledgeJson = process.argv[3];
      const knowledge = JSON.parse(knowledgeJson);
      console.log(JSON.stringify(protocol.shareKnowledge(knowledge), null, 2));
      break;

    case 'status':
      console.log(JSON.stringify(protocol.getCoordinationState(), null, 2));
      break;

    case 'update':
      const updateAgentId = process.argv[3];
      const updatesJson = process.argv[4];
      const updates = JSON.parse(updatesJson);
      console.log(JSON.stringify(protocol.updateAgentStatus(updateAgentId, updates), null, 2));
      break;

    default:
      console.log(`
A2A Protocol CLI

Usage:
  node a2a_protocol.js discover <agent_id>
  node a2a_protocol.js route '<task_json>'
  node a2a_protocol.js share '<knowledge_json>'
  node a2a_protocol.js status
  node a2a_protocol.js update <agent_id> '<updates_json>'

Examples:
  node a2a_protocol.js discover liv_hana
  node a2a_protocol.js route '{"type":"code_fix","requires_capabilities":["code_implementation"]}'
  node a2a_protocol.js share '{"agent":"liv_hana","category":"api","insight":"GPT-5 uses max_completion_tokens"}'
  node a2a_protocol.js status
      `);
  }
}

module.exports = { A2AProtocol };
