#!/usr/bin/env node
/**
 * Gmail Ingestion Pipeline
 *
 * Features:
 * - OAuth 2.0 authentication with token refresh
 * - Multi-account support (jesseniesen@gmail.com, high@reggieanddro.com)
 * - Pagination for 1000+ emails
 * - Full content extraction (HTML → plain text, attachments)
 * - BigQuery storage with search indexing
 * - Smart filtering and deduplication
 * - Rate limiting and exponential backoff
 * - Business intelligence extraction
 * - Security and privacy controls
 */

import 'dotenv/config';
import { google } from 'googleapis';
import { BigQuery } from '@google-cloud/bigquery';
import { Storage } from '@google-cloud/storage';
import { readFileSync, existsSync, writeFileSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';
import { createHash } from 'crypto';
import { convert } from 'html-to-text';
import pLimit from 'p-limit';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Configuration
const GCP_PROJECT_ID = process.env.GCP_PROJECT_ID;
const BIGQUERY_DATASET = process.env.BQ_DATASET || 'communications';
const GCS_BUCKET = process.env.GCS_GMAIL_BUCKET || 'livhana-gmail-attachments';
// const GMAIL_SCOPES = [
//   'https://www.googleapis.com/auth/gmail.readonly',
//   'https://www.googleapis.com/auth/gmail.labels',
//   'https://www.googleapis.com/auth/gmail.metadata'
// ];

// Accounts to ingest
const ACCOUNTS = [
  {
    email: 'jesseniesen@gmail.com',
    name: 'jesseniesen',
    credentialsPath: join(__dirname, 'gmail_credentials_jessen.json'),
    tokenPath: join(__dirname, 'gmail_token_jessen.json'),
    syncStatePath: join(__dirname, '.gmail_sync_jessen.json')
  },
  {
    email: 'high@reggieanddro.com',
    name: 'high_randd',
    credentialsPath: join(__dirname, 'gmail_credentials_high.json'),
    tokenPath: join(__dirname, 'gmail_token_high.json'),
    syncStatePath: join(__dirname, '.gmail_sync_high.json')
  }
];

// Rate limiting configuration
// const GMAIL_RATE_LIMIT = 250; // quota units per second per user
const CONCURRENT_OPERATIONS = 10;
const MAX_RETRIES = 5;
const RETRY_BASE_DELAY = 1000;

// Initialize clients
const bigquery = new BigQuery(GCP_PROJECT_ID ? { projectId: GCP_PROJECT_ID } : {});
const storage = new Storage(GCP_PROJECT_ID ? { projectId: GCP_PROJECT_ID } : {});

// Structured logging
const log = {
  info: (message, meta = {}) => {
    console.log(JSON.stringify({
      level: 'INFO',
      timestamp: new Date().toISOString(),
      message,
      ...meta
    }));
  },
  warn: (message, meta = {}) => {
    console.warn(JSON.stringify({
      level: 'WARN',
      timestamp: new Date().toISOString(),
      message,
      ...meta
    }));
  },
  error: (message, error = null, meta = {}) => {
    console.error(JSON.stringify({
      level: 'ERROR',
      timestamp: new Date().toISOString(),
      message,
      error: error ? {
        message: error.message,
        stack: error.stack,
        code: error.code
      } : null,
      ...meta
    }));
  }
};

/**
 * Sleep utility
 */
function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

/**
 * Retry wrapper with exponential backoff
 */
async function withRetry(fn, context = '', retries = MAX_RETRIES) {
  for (let attempt = 1; attempt <= retries; attempt++) {
    try {
      return await fn();
    } catch {
      const isLastAttempt = attempt === retries;
      const isRateLimitError = error.code === 429 || error.message?.includes('rate limit');
      const isServerError = error.code >= 500 && error.code < 600;

      if (isLastAttempt || (!isRateLimitError && !isServerError)) {
        throw error;
      }

      const delay = RETRY_BASE_DELAY * Math.pow(2, attempt - 1);
      log.warn(`Retry attempt ${attempt}/${retries} for ${context}`, {
        delay,
        error: error.message,
        code: error.code
      });

      await sleep(delay);
    }
  }
}

/**
 * Create OAuth2 client from credentials and token
 */
function createOAuth2Client(account) {
  if (!existsSync(account.credentialsPath)) {
    throw new Error(`Credentials file not found: ${account.credentialsPath}`);
  }

  if (!existsSync(account.tokenPath)) {
    throw new Error(`Token file not found: ${account.tokenPath}. Run gmail_auth.js first.`);
  }

  const credentials = JSON.parse(readFileSync(account.credentialsPath, 'utf-8'));
  const token = JSON.parse(readFileSync(account.tokenPath, 'utf-8'));

  const { client_id, client_secret, redirect_uris } = credentials.installed || credentials.web;

  const oauth2Client = new google.auth.OAuth2(
    client_id,
    client_secret,
    redirect_uris[0]
  );

  oauth2Client.setCredentials(token);

  // Handle token refresh
  oauth2Client.on('tokens', (tokens) => {
    if (tokens.refresh_token) {
      token.refresh_token = tokens.refresh_token;
    }
    token.access_token = tokens.access_token;
    token.expiry_date = tokens.expiry_date;

    writeFileSync(account.tokenPath, JSON.stringify(token, null, 2));
    log.info('Token refreshed and saved', { account: account.email });
  });

  return oauth2Client;
}

/**
 * Get or create sync state
 */
function getSyncState(account) {
  if (existsSync(account.syncStatePath)) {
    return JSON.parse(readFileSync(account.syncStatePath, 'utf-8'));
  }

  return {
    lastSyncTime: null,
    lastHistoryId: null,
    totalMessagesSynced: 0
  };
}

/**
 * Save sync state
 */
function saveSyncState(account, state) {
  writeFileSync(account.syncStatePath, JSON.stringify(state, null, 2));
}

/**
 * Generate unique message ID hash
 */
function generateMessageHash(messageId, accountEmail) {
  return createHash('sha256')
    .update(`${accountEmail}:${messageId}`)
    .digest('hex');
}

/**
 * Check if message already exists in BigQuery
 */
async function messageExists(messageHash) {
  const query = `
    SELECT COUNT(*) as count
    FROM \`${GCP_PROJECT_ID}.${BIGQUERY_DATASET}.gmail_messages\`
    WHERE message_hash = @messageHash
    LIMIT 1
  `;

  const options = {
    query,
    params: { messageHash }
  };

  try {
    const [rows] = await bigquery.query(options);
    return rows[0].count > 0;
  } catch {
    // Table might not exist yet
    return false;
  }
}

/**
 * Extract email addresses from Gmail format
 */
function parseEmailAddress(emailString) {
  if (!emailString) return null;

  // Format: "Name <email@example.com>" or just "email@example.com"
  const match = emailString.match(/<(.+?)>/) || emailString.match(/([^\s]+@[^\s]+)/);
  return match ? match[1] : emailString;
}

/**
 * Extract display name from Gmail format
 */
function parseDisplayName(emailString) {
  if (!emailString) return null;

  // Format: "Name <email@example.com>"
  const match = emailString.match(/^(.+?)\s*</);
  return match ? match[1].trim() : null;
}

/**
 * Decode base64url encoded data
 */
function decodeBase64Url(data) {
  if (!data) return '';

  // Replace URL-safe characters and add padding
  const base64 = data.replace(/-/g, '+').replace(/_/g, '/');
  const padding = base64.length % 4;
  const padded = padding ? base64 + '='.repeat(4 - padding) : base64;

  return Buffer.from(padded, 'base64').toString('utf-8');
}

/**
 * Extract email body from parts
 */
function extractBody(payload) {
  let htmlBody = '';
  let textBody = '';

  function extractFromParts(parts) {
    if (!parts) return;

    for (const part of parts) {
      if (part.mimeType === 'text/html' && part.body?.data) {
        htmlBody += decodeBase64Url(part.body.data);
      } else if (part.mimeType === 'text/plain' && part.body?.data) {
        textBody += decodeBase64Url(part.body.data);
      }

      // Recursively process nested parts
      if (part.parts) {
        extractFromParts(part.parts);
      }
    }
  }

  // Check top-level body
  if (payload.body?.data) {
    if (payload.mimeType === 'text/html') {
      htmlBody = decodeBase64Url(payload.body.data);
    } else if (payload.mimeType === 'text/plain') {
      textBody = decodeBase64Url(payload.body.data);
    }
  }

  // Check parts
  if (payload.parts) {
    extractFromParts(payload.parts);
  }

  // Convert HTML to plain text if we have it
  let plainText = textBody;
  if (htmlBody && !textBody) {
    plainText = convert(htmlBody, {
      wordwrap: 130,
      selectors: [
        { selector: 'a', options: { ignoreHref: false } },
        { selector: 'img', options: { ignoreHref: false } }
      ]
    });
  }

  return {
    html: htmlBody,
    text: plainText,
    snippet: plainText.substring(0, 500)
  };
}

/**
 * Extract attachments metadata
 */
function extractAttachments(payload) {
  const attachments = [];

  function extractFromParts(parts) {
    if (!parts) return;

    for (const part of parts) {
      if (part.filename && part.body?.attachmentId) {
        attachments.push({
          attachmentId: part.body.attachmentId,
          filename: part.filename,
          mimeType: part.mimeType,
          size: part.body.size || 0
        });
      }

      // Recursively process nested parts
      if (part.parts) {
        extractFromParts(part.parts);
      }
    }
  }

  if (payload.parts) {
    extractFromParts(payload.parts);
  }

  return attachments;
}

/**
 * Download attachment to Cloud Storage
 */
async function downloadAttachment(gmail, messageId, attachmentId, filename, account) {
  try {
    const response = await withRetry(
      () => gmail.users.messages.attachments.get({
        userId: 'me',
        messageId,
        id: attachmentId
      }),
      `Download attachment ${filename}`
    );

    const data = Buffer.from(response.data.data, 'base64');

    // Upload to Cloud Storage
    const bucket = storage.bucket(GCS_BUCKET);
    const objectName = `${account.name}/${messageId}/${filename}`;
    const file = bucket.file(objectName);

    await file.save(data, {
      metadata: {
        contentType: response.data.mimeType || 'application/octet-stream',
        metadata: {
          messageId,
          account: account.email
        }
      }
    });

    const publicUrl = `gs://${GCS_BUCKET}/${objectName}`;

    return {
      attachmentId,
      filename,
      mimeType: response.data.mimeType,
      size: data.length,
      gcsPath: publicUrl
    };
  } catch {
    log.error(`Failed to download attachment`, error, {
      messageId,
      attachmentId,
      filename
    });
    return null;
  }
}

/**
 * Detect email category based on content
 */
function detectCategory(headers, body, labels) {
  const subject = headers.subject?.toLowerCase() || '';
  const fromEmail = headers.from?.toLowerCase() || '';
  const text = body.text?.toLowerCase() || '';

  // Cannabis business keywords
  const cannabisKeywords = ['cannabis', 'marijuana', 'dispensary', 'thc', 'cbd', 'cultivation', 'hemp'];
  // Compliance keywords
  const complianceKeywords = ['compliance', 'regulation', 'license', 'permit', 'inspection', 'audit'];
  // Legal keywords
  const legalKeywords = ['legal', 'attorney', 'lawyer', 'court', 'lawsuit', 'settlement', 'contract'];
  // Financial keywords
  const financialKeywords = ['invoice', 'payment', 'transaction', 'banking', 'financial', 'accounting'];

  const categories = [];

  if (cannabisKeywords.some(kw => subject.includes(kw) || text.includes(kw))) {
    categories.push('cannabis_business');
  }

  if (complianceKeywords.some(kw => subject.includes(kw) || text.includes(kw))) {
    categories.push('compliance');
  }

  if (legalKeywords.some(kw => subject.includes(kw) || text.includes(kw) || fromEmail.includes('law'))) {
    categories.push('legal');
  }

  if (financialKeywords.some(kw => subject.includes(kw) || text.includes(kw))) {
    categories.push('financial');
  }

  // Check labels
  const labelNames = labels.map(l => l.toLowerCase());
  if (labelNames.includes('important') || labelNames.includes('starred')) {
    categories.push('important');
  }

  if (labelNames.includes('inbox')) {
    categories.push('inbox');
  }

  if (labelNames.includes('sent')) {
    categories.push('sent');
  }

  return categories.length > 0 ? categories : ['general'];
}

/**
 * Calculate sender importance score
 */
function calculateSenderScore(fromEmail, labels, historyCount = 0) {
  let score = 0;

  // Domain-based scoring
  const domain = fromEmail.split('@')[1]?.toLowerCase();
  const importantDomains = ['gov', 'state.tx.us', 'reggieanddro.com', 'livhana.com'];

  if (importantDomains.some(d => domain?.includes(d))) {
    score += 10;
  }

  // Label-based scoring
  const labelNames = labels.map(l => l.toLowerCase());
  if (labelNames.includes('important')) score += 5;
  if (labelNames.includes('starred')) score += 5;
  if (labelNames.includes('inbox')) score += 2;

  // Interaction history (placeholder - would need to track over time)
  score += Math.min(historyCount * 0.1, 5);

  return score;
}

/**
 * Detect and mask PII
 */
function maskPII(text) {
  if (!text) return text;

  let masked = text;

  // Mask SSN patterns
  masked = masked.replace(/\b\d{3}-\d{2}-\d{4}\b/g, 'XXX-XX-XXXX');

  // Mask credit card patterns
  masked = masked.replace(/\b\d{4}[\s-]?\d{4}[\s-]?\d{4}[\s-]?\d{4}\b/g, 'XXXX-XXXX-XXXX-XXXX');

  // Mask phone numbers (loose)
  masked = masked.replace(/\b\d{3}[-.]?\d{3}[-.]?\d{4}\b/g, 'XXX-XXX-XXXX');

  return masked;
}

/**
 * Process a single message
 */
async function processMessage(gmail, messageId, account) {
  const message = await withRetry(
    () => gmail.users.messages.get({
      userId: 'me',
      id: messageId,
      format: 'full'
    }),
    `Fetch message ${messageId}`
  );

  const messageData = message.data;
  const payload = messageData.payload;

  // Extract headers
  const headers = {};
  if (payload.headers) {
    for (const header of payload.headers) {
      const name = header.name.toLowerCase().replace(/-/g, '_');
      headers[name] = header.value;
    }
  }

  // Extract body
  const body = extractBody(payload);

  // Extract attachments
  const attachmentsMeta = extractAttachments(payload);

  // Download attachments to Cloud Storage
  const limit = pLimit(3); // Limit concurrent downloads
  const attachments = await Promise.all(
    attachmentsMeta.map(att =>
      limit(() => downloadAttachment(gmail, messageId, att.attachmentId, att.filename, account))
    )
  );
  const validAttachments = attachments.filter(a => a !== null);

  // Extract thread info
  const threadId = messageData.threadId;

  // Detect category
  const categories = detectCategory(headers, body, messageData.labelIds || []);

  // Calculate sender score
  const fromEmail = parseEmailAddress(headers.from);
  const senderScore = calculateSenderScore(fromEmail, messageData.labelIds || []);

  // Mask PII in text
  const maskedText = maskPII(body.text);

  // Generate message hash for deduplication
  const messageHash = generateMessageHash(messageId, account.email);

  // Prepare message row
  const messageRow = {
    message_hash: messageHash,
    message_id: messageId,
    thread_id: threadId,
    account_email: account.email,
    account_name: account.name,
    subject: headers.subject || '(No Subject)',
    from_email: parseEmailAddress(headers.from),
    from_name: parseDisplayName(headers.from),
    to_email: parseEmailAddress(headers.to),
    to_name: parseDisplayName(headers.to),
    cc_email: parseEmailAddress(headers.cc),
    bcc_email: parseEmailAddress(headers.bcc),
    reply_to: parseEmailAddress(headers.reply_to),
    date: headers.date,
    timestamp: new Date(parseInt(messageData.internalDate)).toISOString(),
    labels: messageData.labelIds || [],
    snippet: messageData.snippet || body.snippet,
    body_text: maskedText,
    body_html: body.html,
    size_estimate: messageData.sizeEstimate || 0,
    has_attachments: validAttachments.length > 0,
    attachment_count: validAttachments.length,
    categories: categories,
    sender_score: senderScore,
    is_spam: (messageData.labelIds || []).includes('SPAM'),
    is_trash: (messageData.labelIds || []).includes('TRASH'),
    is_important: (messageData.labelIds || []).includes('IMPORTANT'),
    is_starred: (messageData.labelIds || []).includes('STARRED'),
    ingested_at: new Date().toISOString(),
    raw_headers: JSON.stringify(headers),
    raw_json: JSON.stringify(messageData)
  };

  // Prepare attachment rows
  const attachmentRows = validAttachments.map(att => ({
    message_hash: messageHash,
    message_id: messageId,
    thread_id: threadId,
    account_email: account.email,
    attachment_id: att.attachmentId,
    filename: att.filename,
    mime_type: att.mimeType,
    size_bytes: att.size,
    gcs_path: att.gcsPath,
    ingested_at: new Date().toISOString()
  }));

  return {
    message: messageRow,
    attachments: attachmentRows
  };
}

/**
 * Fetch messages with pagination and filtering
 */
async function fetchMessages(gmail, account, syncState, options = {}) {
  const {
    query = '',
    maxResults = 500,
    includeSpamTrash = false
  } = options;

  const messages = [];
  let pageToken = null;

  log.info('Fetching messages', {
    account: account.email,
    query,
    maxResults,
    includeSpamTrash
  });

  do {
    const response = await withRetry(
      () => gmail.users.messages.list({
        userId: 'me',
        q: query,
        maxResults: Math.min(100, maxResults - messages.length),
        pageToken,
        includeSpamTrash
      }),
      `List messages for ${account.email}`
    );

    if (response.data.messages) {
      messages.push(...response.data.messages);
    }

    pageToken = response.data.nextPageToken;

    log.info(`Fetched ${messages.length} message IDs so far`, {
      account: account.email,
      hasMore: !!pageToken
    });

  } while (pageToken && messages.length < maxResults);

  return messages;
}

/**
 * Ensure BigQuery tables exist
 */
async function ensureBigQuerySchema() {
  log.info('Ensuring BigQuery dataset and tables exist');

  const dataset = bigquery.dataset(BIGQUERY_DATASET);

  // Create dataset if not exists
  try {
    const [exists] = await dataset.exists();
    if (!exists) {
      log.info(`Creating dataset: ${BIGQUERY_DATASET}`);
      await bigquery.createDataset(BIGQUERY_DATASET, {
        location: 'US'
      });
    }
  } catch {
    log.warn(`Dataset check warning`, { error: error.message });
  }

  // Gmail messages table schema
  const messagesSchema = [
    { name: 'message_hash', type: 'STRING', mode: 'REQUIRED' },
    { name: 'message_id', type: 'STRING', mode: 'REQUIRED' },
    { name: 'thread_id', type: 'STRING', mode: 'REQUIRED' },
    { name: 'account_email', type: 'STRING', mode: 'REQUIRED' },
    { name: 'account_name', type: 'STRING', mode: 'REQUIRED' },
    { name: 'subject', type: 'STRING', mode: 'NULLABLE' },
    { name: 'from_email', type: 'STRING', mode: 'NULLABLE' },
    { name: 'from_name', type: 'STRING', mode: 'NULLABLE' },
    { name: 'to_email', type: 'STRING', mode: 'NULLABLE' },
    { name: 'to_name', type: 'STRING', mode: 'NULLABLE' },
    { name: 'cc_email', type: 'STRING', mode: 'NULLABLE' },
    { name: 'bcc_email', type: 'STRING', mode: 'NULLABLE' },
    { name: 'reply_to', type: 'STRING', mode: 'NULLABLE' },
    { name: 'date', type: 'STRING', mode: 'NULLABLE' },
    { name: 'timestamp', type: 'TIMESTAMP', mode: 'REQUIRED' },
    { name: 'labels', type: 'STRING', mode: 'REPEATED' },
    { name: 'snippet', type: 'STRING', mode: 'NULLABLE' },
    { name: 'body_text', type: 'STRING', mode: 'NULLABLE' },
    { name: 'body_html', type: 'STRING', mode: 'NULLABLE' },
    { name: 'size_estimate', type: 'INTEGER', mode: 'NULLABLE' },
    { name: 'has_attachments', type: 'BOOLEAN', mode: 'NULLABLE' },
    { name: 'attachment_count', type: 'INTEGER', mode: 'NULLABLE' },
    { name: 'categories', type: 'STRING', mode: 'REPEATED' },
    { name: 'sender_score', type: 'FLOAT', mode: 'NULLABLE' },
    { name: 'is_spam', type: 'BOOLEAN', mode: 'NULLABLE' },
    { name: 'is_trash', type: 'BOOLEAN', mode: 'NULLABLE' },
    { name: 'is_important', type: 'BOOLEAN', mode: 'NULLABLE' },
    { name: 'is_starred', type: 'BOOLEAN', mode: 'NULLABLE' },
    { name: 'ingested_at', type: 'TIMESTAMP', mode: 'REQUIRED' },
    { name: 'raw_headers', type: 'JSON', mode: 'NULLABLE' },
    { name: 'raw_json', type: 'JSON', mode: 'NULLABLE' }
  ];

  // Gmail threads table schema
  const threadsSchema = [
    { name: 'thread_id', type: 'STRING', mode: 'REQUIRED' },
    { name: 'account_email', type: 'STRING', mode: 'REQUIRED' },
    { name: 'account_name', type: 'STRING', mode: 'REQUIRED' },
    { name: 'subject', type: 'STRING', mode: 'NULLABLE' },
    { name: 'message_count', type: 'INTEGER', mode: 'REQUIRED' },
    { name: 'participant_emails', type: 'STRING', mode: 'REPEATED' },
    { name: 'first_message_date', type: 'TIMESTAMP', mode: 'NULLABLE' },
    { name: 'last_message_date', type: 'TIMESTAMP', mode: 'NULLABLE' },
    { name: 'labels', type: 'STRING', mode: 'REPEATED' },
    { name: 'categories', type: 'STRING', mode: 'REPEATED' },
    { name: 'ingested_at', type: 'TIMESTAMP', mode: 'REQUIRED' }
  ];

  // Gmail attachments table schema
  const attachmentsSchema = [
    { name: 'message_hash', type: 'STRING', mode: 'REQUIRED' },
    { name: 'message_id', type: 'STRING', mode: 'REQUIRED' },
    { name: 'thread_id', type: 'STRING', mode: 'REQUIRED' },
    { name: 'account_email', type: 'STRING', mode: 'REQUIRED' },
    { name: 'attachment_id', type: 'STRING', mode: 'REQUIRED' },
    { name: 'filename', type: 'STRING', mode: 'REQUIRED' },
    { name: 'mime_type', type: 'STRING', mode: 'NULLABLE' },
    { name: 'size_bytes', type: 'INTEGER', mode: 'NULLABLE' },
    { name: 'gcs_path', type: 'STRING', mode: 'REQUIRED' },
    { name: 'ingested_at', type: 'TIMESTAMP', mode: 'REQUIRED' }
  ];

  // Create tables
  const tables = [
    { name: 'gmail_messages', schema: messagesSchema },
    { name: 'gmail_threads', schema: threadsSchema },
    { name: 'gmail_attachments', schema: attachmentsSchema }
  ];

  for (const tableConfig of tables) {
    const table = dataset.table(tableConfig.name);
    try {
      const [exists] = await table.exists();
      if (!exists) {
        log.info(`Creating table: ${BIGQUERY_DATASET}.${tableConfig.name}`);
        await dataset.createTable(tableConfig.name, {
          schema: tableConfig.schema,
          timePartitioning: {
            type: 'DAY',
            field: 'timestamp'
          },
          clustering: {
            fields: ['account_email', 'thread_id']
          }
        });
        log.info(`Table created: ${BIGQUERY_DATASET}.${tableConfig.name}`);
      }
    } catch {
      log.error(`Failed to ensure table ${tableConfig.name}`, error);
      throw error;
    }
  }
}

/**
 * Insert messages into BigQuery
 */
async function insertMessages(messages) {
  if (messages.length === 0) return;

  const table = bigquery.dataset(BIGQUERY_DATASET).table('gmail_messages');
  const BATCH_SIZE = 500;

  for (let i = 0; i < messages.length; i += BATCH_SIZE) {
    const batch = messages.slice(i, i + BATCH_SIZE);

    try {
      await withRetry(
        () => table.insert(batch, {
          skipInvalidRows: false,
          ignoreUnknownValues: false
        }),
        `Insert messages batch ${Math.floor(i / BATCH_SIZE) + 1}`
      );

      log.info(`Inserted message batch`, {
        batchNumber: Math.floor(i / BATCH_SIZE) + 1,
        batchSize: batch.length,
        totalInserted: Math.min(i + BATCH_SIZE, messages.length)
      });
    } catch {
      log.error(`Failed to insert message batch`, error, {
        batchNumber: Math.floor(i / BATCH_SIZE) + 1
      });
      throw error;
    }
  }
}

/**
 * Insert attachments into BigQuery
 */
async function insertAttachments(attachments) {
  if (attachments.length === 0) return;

  const table = bigquery.dataset(BIGQUERY_DATASET).table('gmail_attachments');
  const BATCH_SIZE = 500;

  for (let i = 0; i < attachments.length; i += BATCH_SIZE) {
    const batch = attachments.slice(i, i + BATCH_SIZE);

    try {
      await withRetry(
        () => table.insert(batch, {
          skipInvalidRows: false,
          ignoreUnknownValues: false
        }),
        `Insert attachments batch ${Math.floor(i / BATCH_SIZE) + 1}`
      );

      log.info(`Inserted attachment batch`, {
        batchNumber: Math.floor(i / BATCH_SIZE) + 1,
        batchSize: batch.length
      });
    } catch {
      log.error(`Failed to insert attachment batch`, error);
      // Don't throw - attachments are supplementary
    }
  }
}

/**
 * Build thread summaries
 */
async function buildThreadSummaries(account) {
  log.info('Building thread summaries', { account: account.email });

  const query = `
    INSERT INTO \`${GCP_PROJECT_ID}.${BIGQUERY_DATASET}.gmail_threads\` (
      thread_id,
      account_email,
      account_name,
      subject,
      message_count,
      participant_emails,
      first_message_date,
      last_message_date,
      labels,
      categories,
      ingested_at
    )
    SELECT
      thread_id,
      account_email,
      account_name,
      MAX(subject) as subject,
      COUNT(*) as message_count,
      ARRAY_AGG(DISTINCT from_email IGNORE NULLS) as participant_emails,
      MIN(timestamp) as first_message_date,
      MAX(timestamp) as last_message_date,
      ARRAY_CONCAT_AGG(labels) as labels,
      ARRAY_CONCAT_AGG(categories) as categories,
      CURRENT_TIMESTAMP() as ingested_at
    FROM \`${GCP_PROJECT_ID}.${BIGQUERY_DATASET}.gmail_messages\`
    WHERE account_email = @accountEmail
    AND thread_id NOT IN (
      SELECT DISTINCT thread_id
      FROM \`${GCP_PROJECT_ID}.${BIGQUERY_DATASET}.gmail_threads\`
      WHERE account_email = @accountEmail
    )
    GROUP BY thread_id, account_email, account_name
  `;

  const options = {
    query,
    params: { accountEmail: account.email }
  };

  try {
    await bigquery.query(options);
    log.info('Thread summaries built successfully', { account: account.email });
  } catch {
    log.error('Failed to build thread summaries', error, { account: account.email });
  }
}

/**
 * Ingest account emails
 */
async function ingestAccount(account, options = {}) {
  const {
    fullSync = false,
    maxMessages = 1000
  } = options;

  log.info('Starting account ingestion', {
    account: account.email,
    fullSync,
    maxMessages
  });

  // Create OAuth2 client
  const oauth2Client = createOAuth2Client(account);
  const gmail = google.gmail({ version: 'v1', auth: oauth2Client });

  // Get sync state
  const syncState = getSyncState(account);

  // Build query
  let query = '';
  if (!fullSync && syncState.lastSyncTime) {
    // Incremental sync - only fetch emails after last sync
    const afterDate = new Date(syncState.lastSyncTime);
    const dateStr = Math.floor(afterDate.getTime() / 1000);
    query = `after:${dateStr}`;
  }

  // Fetch message list
  const messageList = await fetchMessages(gmail, account, syncState, {
    query,
    maxResults: maxMessages,
    includeSpamTrash: false
  });

  log.info(`Found ${messageList.length} messages to process`, {
    account: account.email
  });

  // Process messages with concurrency limit
  const limit = pLimit(CONCURRENT_OPERATIONS);
  const allMessages = [];
  const allAttachments = [];
  let processed = 0;
  let skipped = 0;

  for (const msg of messageList) {
    await limit(async () => {
      try {
        // Check if message already exists
        const messageHash = generateMessageHash(msg.id, account.email);
        const exists = await messageExists(messageHash);

        if (exists) {
          skipped++;
          log.info(`Message already exists, skipping`, {
            messageId: msg.id,
            account: account.email
          });
          return;
        }

        // Process message
        const result = await processMessage(gmail, msg.id, account);
        allMessages.push(result.message);
        allAttachments.push(...result.attachments);
        processed++;

        if (processed % 10 === 0) {
          log.info(`Progress: ${processed}/${messageList.length}`, {
            account: account.email,
            skipped
          });
        }
      } catch {
        log.error(`Failed to process message`, error, {
          messageId: msg.id,
          account: account.email
        });
      }
    });
  }

  // Wait for all processing to complete
  await Promise.resolve();

  log.info(`Processed ${processed} new messages, skipped ${skipped}`, {
    account: account.email,
    totalAttachments: allAttachments.length
  });

  // Insert into BigQuery
  if (allMessages.length > 0) {
    await insertMessages(allMessages);
  }

  if (allAttachments.length > 0) {
    await insertAttachments(allAttachments);
  }

  // Build thread summaries
  await buildThreadSummaries(account);

  // Update sync state
  syncState.lastSyncTime = new Date().toISOString();
  syncState.totalMessagesSynced += processed;
  saveSyncState(account, syncState);

  log.info('Account ingestion complete', {
    account: account.email,
    processed,
    skipped,
    totalSynced: syncState.totalMessagesSynced
  });

  return {
    processed,
    skipped,
    totalMessages: allMessages.length,
    totalAttachments: allAttachments.length
  };
}

/**
 * Main function
 */
async function main() {
  const startTime = Date.now();

  // Parse command line options
  const args = process.argv.slice(2);
  const fullSync = args.includes('--full');
  const accountFilter = args.find(arg => arg.startsWith('--account='))?.split('=')[1];
  const maxMessages = parseInt(args.find(arg => arg.startsWith('--max='))?.split('=')[1] || '1000');

  log.info('Gmail ingestion starting', {
    fullSync,
    accountFilter,
    maxMessages,
    totalAccounts: ACCOUNTS.length
  });

  try {
    // Ensure BigQuery schema
    await ensureBigQuerySchema();

    // Filter accounts if specified
    const accountsToProcess = accountFilter
      ? ACCOUNTS.filter(a => a.email === accountFilter || a.name === accountFilter)
      : ACCOUNTS;

    if (accountsToProcess.length === 0) {
      throw new Error(`No accounts found matching filter: ${accountFilter}`);
    }

    // Process each account
    const results = [];
    for (const account of accountsToProcess) {
      try {
        const result = await ingestAccount(account, { fullSync, maxMessages });
        results.push({ account: account.email, ...result });
      } catch {
        log.error(`Failed to ingest account`, error, { account: account.email });
        results.push({ account: account.email, error: error.message });
      }
    }

    const duration = Math.round((Date.now() - startTime) / 1000);

    log.info('Gmail ingestion complete', {
      accounts: results,
      durationSeconds: duration
    });

  } catch {
    log.error('Gmail ingestion failed', error);
    process.exit(1);
  }
}

// Run if called directly
if (import.meta.url === `file://${process.argv[1]}`) {
  main().catch((error) => {
    log.error('Unhandled error', error);
    process.exit(1);
  });
}

export { ingestAccount, ACCOUNTS };
// Last optimized: 2025-10-02

// Optimized: 2025-10-02

// Last updated: 2025-10-02
