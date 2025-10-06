/**
 * Optimized: 2025-10-02
 * RPM: 1.6.2.3.backend-common-optimization
 * Session: Elephant Strategy Batch 1
 *
 * Validates free-form text payloads consumed by synthesis services
 * to ensure downstream agents never process empty or overly large strings.
 */
const MAX_TEXT_LENGTH = Number(process.env.MAX_SYNTH_TEXT_LENGTH ?? 1000);

/**
 * Validates incoming text content and returns a human readable error message
 * when the payload fails requirements. A return value of null means the
 * payload passes validation.
 *
 * @param {string} text - raw text payload supplied by clients
 * @returns {string|null} descriptive validation error or null
 */
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
