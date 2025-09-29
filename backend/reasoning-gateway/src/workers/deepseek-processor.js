import OpenAI from 'openai';
import { withRequestContext } from '../../../common/logging/context.js';
import { evaluateGuardrails } from '../../../common/guardrails/index.js';
import { createMemoryStore } from '../../../common/memory/store.js';
import { recordFeedback } from '../../../common/feedback/index.js';

const createDeepSeekClient = () => {
  const apiKey = process.env.DEEPSEEK_API_KEY;
  if (!apiKey) {
    throw new Error('Missing DEEPSEEK_API_KEY');
  }

  return new OpenAI({
    apiKey,
    baseURL: process.env.DEEPSEEK_API_BASE_URL ?? 'https://api.deepseek.com/v1',
  });
};

const createInferencePayload = ({ prompt, metadata }) => ({
  model: process.env.DEEPSEEK_MODEL ?? 'deepseek-chat',
  max_tokens: Number(process.env.DEEPSEEK_MAX_TOKENS ?? 512),
  temperature: Number(process.env.DEEPSEEK_TEMPERATURE ?? 0.2),
  stream: true,
  messages: [
    {
      role: 'system',
      content: process.env.DEEPSEEK_SYSTEM_PROMPT ?? 'You are the Liv Hana reasoning specialist. Provide concise, actionable insights with compliance guardrails.',
    },
    {
      role: 'user',
      content: prompt,
    },
  ],
  metadata,
});

const streamDeepSeekResponse = async ({ client, payload, onDelta }) => {
  const stream = await client.responses.stream(payload);

  for await (const event of stream) {
    if (event.type === 'response.output_text.delta') {
      onDelta?.(event.delta);
    }

    if (event.type === 'response.completed') {
      return event.response;
    }
  }

  throw new Error('DeepSeek stream ended without completion');
};

export const createDeepSeekWorkerProcessor = ({ logger }) => {
  const client = createDeepSeekClient();

  return async (job) => {
    const { prompt, sessionId, metadata } = job.data ?? {};
    const contextLogger = withRequestContext(logger, job.id);
    const memoryStore = await createMemoryStore({ logger: contextLogger });

    contextLogger?.info?.({ jobId: job.id, sessionId, metadata }, 'Processing reasoning job');

    const guardrailResult = await evaluateGuardrails({ payload: { prompt, sessionId, metadata }, logger: contextLogger });
    if (!guardrailResult.allowed) {
      contextLogger?.warn?.({ guardrailResult }, 'Reasoning job blocked by guardrail');
      await memoryStore.appendHistory(job.id, { type: 'guardrail-block', details: guardrailResult });
      throw new Error(`Guardrail blocked reasoning job: ${guardrailResult.reason}`);
    }

    await memoryStore.appendHistory(job.id, { type: 'guardrail-pass', timestamp: new Date().toISOString() });

    const payload = createInferencePayload({ prompt, metadata });

    let aggregatedText = '';
    const response = await streamDeepSeekResponse({
      client,
      payload,
      onDelta: async (delta) => {
        aggregatedText += delta;
        job.updateProgress({ delta });
        await memoryStore.appendHistory(job.id, { type: 'delta', delta });
      },
    });

    contextLogger?.info?.({ jobId: job.id, outputLength: aggregatedText.length }, 'DeepSeek reasoning completed');

    const resultPayload = {
      output: aggregatedText,
      response,
      sessionId,
      metadata,
    };

    await memoryStore.set(job.id, { ...resultPayload, guardrailResult });
    await recordFeedback({ jobId: job.id, prompt, response: aggregatedText });

    return resultPayload;
  };
};
