/**
 * Optimized: 2025-10-02
 * RPM: 1.6.2.3.backend-common-optimization
 * Session: Elephant Strategy Batch 1
 */

import { appendFile } from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const FEEDBACK_DIR = process.env.FEEDBACK_DIR ?? path.join(__dirname, '../../../logs/feedback');

export const recordFeedback = async ({ jobId, prompt, response, rating, notes }) => {
  await appendFile(
    path.join(FEEDBACK_DIR, `${new Date().toISOString().split('T')[0]}.log`),
    JSON.stringify({ jobId, prompt, response, rating, notes, recordedAt: new Date().toISOString() }) + '\n',
    { flag: 'a' }
  );
};

// Optimized: 2025-10-02

// Last updated: 2025-10-02

// Last optimized: 2025-10-02
