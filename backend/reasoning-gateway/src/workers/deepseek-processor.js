import OpenAI from 'openai';
import { withRequestContext } from '../../../common/logging/context.js';
import { evaluateGuardrails } from '../../../common/guardrails/index.js';
import { createMemoryStore } from '../../../common/memory/store.js';
import { recordFeedback } from '../../../common/feedback/index.js';
import { enrichReasoningContext, learnFromReasoningResult } from '../memory_learning.js';

const createDeepSeekClient = () => {
  const apiKey = process.env.DEEPSEEK_API_KEY;
  if (!apiKey) {
    throw new Error('Missing DEEPSEEK_API_KEY');
  }

  return new OpenAI({
    apiKey,
    baseURL: process.env.DEEPSEEK_API_BASE_URL ?? 'http://deepseek-stub:8080/v1',
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
  const stream = await client.chat.completions.create(payload);

  for await (const chunk of stream) {
    const content = chunk.choices?.[0]?.delta?.content;
    if (content) {
      onDelta?.(content);
    }
    
    if (chunk.choices?.[0]?.finish_reason === 'stop') {
      return chunk;
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

    let enrichedPrompt = prompt;
    let learningContext = null;

    if (metadata?.customerId && process.env.ENABLE_MEMORY_LEARNING === 'true') {
      try {
        const enrichment = await enrichReasoningContext({
          customerId: metadata.customerId,
          sessionId,
          prompt,
          logger: contextLogger,
        });
        enrichedPrompt = enrichment.enrichedPrompt;
        learningContext = enrichment.context;
        contextLogger?.info?.({ customerId: metadata.customerId }, 'Enriched prompt with customer context');
      } catch (error) {
        contextLogger?.warn?.({ error: error.message }, 'Failed to enrich context, using original prompt');
      }
    }

    const payload = createInferencePayload({ prompt: enrichedPrompt, metadata });

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

    if (metadata?.customerId && process.env.ENABLE_MEMORY_LEARNING === 'true') {
      try {
        await learnFromReasoningResult({
          customerId: metadata.customerId,
          sessionId,
          prompt,
          response: aggregatedText,
          metadata: {
            ...metadata,
            jobId: job.id,
            context: learningContext,
          },
          logger: contextLogger,
        });
        contextLogger?.info?.({ customerId: metadata.customerId }, 'Learned from reasoning result');
      } catch (error) {
        contextLogger?.warn?.({ error: error.message }, 'Failed to learn from reasoning result');
      }
    }

    return resultPayload;
  };
};
