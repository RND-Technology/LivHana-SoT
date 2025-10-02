import Ajv from 'ajv';

const ajv = new Ajv({ allErrors: true, removeAdditional: true });

const promptSchema = {
  type: 'object',
  properties: {
    prompt: { type: 'string', minLength: 1, maxLength: Number(process.env.GUARDRAIL_PROMPT_MAX_LENGTH ?? 4000) },
    sessionId: { type: 'string', minLength: 1, maxLength: 128 },
    metadata: { type: 'object', additionalProperties: true },
  },
  required: ['prompt'],
  additionalProperties: false,
};

const compileSchema = (schema) => ajv.compile(schema);
const validatePrompt = compileSchema(promptSchema);

const bannedPhrases = (process.env.GUARDRAIL_BANNED_PHRASES ?? '')
  .split(',')
  .map((phrase) => phrase.trim())
  .filter(Boolean);

const createPromptFilters = () => [
  {
    name: 'prompt-schema-validation',
    run: ({ payload }) => {
      const valid = validatePrompt(payload);
      if (!valid) {
        return {
          allowed: false,
          reason: 'INVALID_PROMPT_SCHEMA',
          details: validatePrompt.errors,
        };
      }
      return { allowed: true };
    },
  },
  {
    name: 'banned-phrases-check',
    run: ({ payload }) => {
      if (!bannedPhrases.length) {
        return { allowed: true };
      }

      const found = bannedPhrases.find((phrase) => payload.prompt?.toLowerCase().includes(phrase.toLowerCase()));
      if (found) {
        return {
          allowed: false,
          reason: 'BANNED_PHRASE_DETECTED',
          details: { phrase: found },
        };
      }

      return { allowed: true };
    },
  },
];

export const promptFilters = createPromptFilters();

export const evaluateGuardrails = async ({ payload, logger, filters = promptFilters } = {}) => {
  for (const filter of filters) {
    try {
      const result = await Promise.resolve(filter.run({ payload }));
      if (!result.allowed) {
        logger?.warn?.({ reason: result.reason, details: result.details }, `Guardrail blocked by ${filter.name}`);
        return { allowed: false, ...result };
      }
    } catch (error) {
      logger?.error?.({ error: error.message }, `Guardrail filter ${filter.name} failed`);
      return { allowed: false, reason: 'GUARDRAIL_ERROR', details: error.message };
    }
  }

  return { allowed: true };
};
// Last optimized: 2025-10-02

// Optimized: 2025-10-02

// Last updated: 2025-10-02
