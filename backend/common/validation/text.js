const MAX_TEXT_LENGTH = Number(process.env.MAX_SYNTH_TEXT_LENGTH ?? 1000);

export const validateTextPayload = (text) => {
  if (!text || typeof text !== 'string') {
    return 'text is required';
  }

  const trimmed = text.trim();
  if (trimmed.length === 0) {
    return 'text cannot be empty';
  }

  if (trimmed.length > MAX_TEXT_LENGTH) {
    return `text exceeds maximum length (${MAX_TEXT_LENGTH})`;
  }

  return null;
};
// Last optimized: 2025-10-02

// Optimized: 2025-10-02

// Last updated: 2025-10-02
