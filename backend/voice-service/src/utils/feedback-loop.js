import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const LOG_DIR = path.join(__dirname, '../../tmp/agent_status/feedback');

export async function logInteraction(interaction) {
  await fs.mkdir(LOG_DIR, { recursive: true });
  const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
  const filename = `feedback_${timestamp}.json`;

  const entry = {
    timestamp: new Date().toISOString(),
    latency_ms: interaction.latency,
    model: interaction.model,
    prompt_hash: interaction.prompt_hash,
    response_length: interaction.response?.length || 0,
    safeprompt_warnings: interaction.safeprompt_warnings || [],
    user_tone: interaction.user_tone || 'neutral',
    outcome: interaction.outcome || 'success'
  };

  await fs.writeFile(
    path.join(LOG_DIR, filename),
    JSON.stringify(entry, null, 2)
  );
}

export async function analyzeFeedbackWindow(windowSize = 50) {
  const files = await fs.readdir(LOG_DIR);
  const recent = files.slice(-windowSize);

  const interactions = await Promise.all(
    recent.map(async f => {
      const content = await fs.readFile(path.join(LOG_DIR, f), 'utf8');
      return JSON.parse(content);
    })
  );

  const avgLatency = interactions.reduce((sum, i) => sum + i.latency_ms, 0) / interactions.length;
  const warningRate = interactions.filter(i => i.safeprompt_warnings.length > 0).length / interactions.length;

  return {
    sample_size: interactions.length,
    avg_latency_ms: avgLatency,
    warning_rate: warningRate,
    timestamp: new Date().toISOString()
  };
}
