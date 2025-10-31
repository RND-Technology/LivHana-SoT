import { createHash } from 'crypto';

const FALLACY_PATTERNS = [
  /\b(always|never|100%|guaranteed)\b/i,
  /\bcomplete(d)?\b.*\bbefore\b.*\bverif/i,
  /\b(perfect|flawless|zero\s+errors?)\b/i
];

const HALLUCINATION_KEYWORDS = [
  'definitely', 'certainly', 'unquestionably',
  'without a doubt', 'proven fact'
];

export function safePromptFilter(req, res, next) {
  const { prompt, message } = req.body;
  const input = prompt || message || '';

  const flagged = {
    fallacies: FALLACY_PATTERNS.filter(p => p.test(input)),
    hallucinations: HALLUCINATION_KEYWORDS.filter(k => input.toLowerCase().includes(k)),
    hash: createHash('sha256').update(input).digest('hex').slice(0, 8)
  };

  if (flagged.fallacies.length > 0 || flagged.hallucinations.length > 0) {
    console.warn(`[SafePrompt] Flagged input ${flagged.hash}:`, flagged);
    req.safeprompt_warnings = flagged;
  }

  req.safeprompt_hash = flagged.hash;
  next();
}

export function safePromptResponse(req, res, next) {
  const originalJson = res.json.bind(res);
  res.json = function(data) {
    if (req.safeprompt_warnings) {
      data.safeprompt_warnings = req.safeprompt_warnings;
    }
    return originalJson(data);
  };
  next();
}
