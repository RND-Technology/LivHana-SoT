import { Worker } from 'bullmq';
import { Pool } from 'pg';
import { stringify } from 'csv-stringify/sync';
import { writeFileSync, mkdirSync, createReadStream, readFileSync } from 'fs';
import path from 'path';
import crypto from 'crypto';
import { Storage } from '@google-cloud/storage';
import puppeteer from 'puppeteer';

const pool = new Pool({ connectionString: process.env.DATABASE_URL });

async function fetchItems(weekId: string) {
  const { rows } = await pool.query('select * from rpm_items where week_id = $1 order by due_date asc nulls last', [weekId]);
  return rows;
}

const outDir = path.resolve(process.cwd(), 'out');
mkdirSync(outDir, { recursive: true });
const storage = new Storage({ projectId: process.env.GCP_PROJECT_ID });
const bucketName = process.env.GCS_BUCKET || 'livhana-rpm-exports';

export const worker = new Worker('rpm.export', async job => {
  const { weekId, format } = job.data as { weekId: string, format: string };
  // Mark export as processing at job start
  try {
    const expId = job.opts?.exportId as string | undefined;
    if (expId) {
      await pool.query(`update rpm_exports set status = 'processing' where id = $1`, [expId]);
    }
  } catch (e) {
    console.error('Failed to mark export processing:', e);
  }
  const items = await fetchItems(weekId);
  const ts = new Date().toISOString().replace(/[:.]/g, '-');

  const uploadAndSign = async (localPath: string, remoteName: string) => {
    const bucket = storage.bucket(bucketName);
    await bucket.upload(localPath, { destination: remoteName, predefinedAcl: 'private' });
    const file = bucket.file(remoteName);
    const [url] = await file.getSignedUrl({ version: 'v4', action: 'read', expires: Date.now() + 24*60*60*1000 });
    
    // Proper SHA256 hash calculation
    const fileBuffer = readFileSync(localPath);
    const hash = crypto.createHash('sha256');
    hash.update(fileBuffer);
    
    return { url, gcs_path: `gs://${bucketName}/${remoteName}`, sha256: hash.digest('hex') };
  };

  if (format === 'csv') {
    const csv = stringify(items, { header: true });
    const file = path.join(outDir, `rpm_${weekId}_${ts}.csv`);
    writeFileSync(file, csv, 'utf-8');
    const remote = `rpm/${weekId}/plan.csv`;
    return await uploadAndSign(file, remote);
  }

  if (format === 'md') {
    const lines: string[] = [];
    lines.push(`# RPM Week ${weekId}`);
    lines.push('');
    for (const it of items) {
      lines.push(`- [${it.status}] ${it.title} — owner: ${it.owner_role || ''} ${it.owner_user || ''}`);
    }
    const file = path.join(outDir, `rpm_${weekId}_${ts}.md`);
    writeFileSync(file, lines.join('\n'), 'utf-8');
    const remote = `rpm/${weekId}/plan.md`;
    return await uploadAndSign(file, remote);
  }

  if (format === 'pdf') {
    // Generate PDF via Puppeteer
    const browser = await puppeteer.launch({ headless: true });
    const page = await browser.newPage();
    
    const html = `<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <style>
    body { font-family: Arial, sans-serif; padding: 20px; }
    h1 { color: #333; }
    ul { list-style: none; padding: 0; }
    li { padding: 8px; border-bottom: 1px solid #eee; }
    .status { font-weight: bold; }
  </style>
</head>
<body>
  <h1>RPM Week ${weekId}</h1>
  <ul>
    ${items.map((it: any) => `<li><span class="status">[${it.status}]</span> ${it.title}</li>`).join('')}
  </ul>
</body>
</html>`;
    
    await page.setContent(html);
    const pdfBuffer = await page.pdf({ format: 'A4', printBackground: true });
    await browser.close();
    
    const file = path.join(outDir, `rpm_${weekId}_${ts}.pdf`);
    writeFileSync(file, pdfBuffer);
    const remote = `rpm/${weekId}/plan.pdf`;
    return await uploadAndSign(file, remote);
  }

  throw new Error(`Unknown format: ${format}`);
}, { connection: { host: process.env.REDIS_HOST || 'localhost', port: +(process.env.REDIS_PORT || '6379') } });

worker.on('completed', async (job, result) => {
  console.log('rpm.export completed', job.id, result);
  
  // Update export record with metadata
  try {
    const { weekId, format } = job.data as { weekId: string, format: string };
    const expId = job.opts?.exportId;
    
    if (expId && result) {
      await pool.query(
        `update rpm_exports set status = 'completed', gcs_path = $1, url = $2, sha256 = $3, completed_at = now() where id = $4`,
        [result.gcs_path, result.url, result.sha256, expId]
      );
    }
  } catch (e) {
    console.error('Failed to update export record:', e);
  }
  
  // Optionally dump to local /out if env flag set
  if (process.env.RPM_EXPORT_LOCAL_DUMP === '1') {
    const { weekId, format } = job.data as { weekId: string, format: string };
    const localPath = path.join(outDir, `plan.${format}`);
    console.log(`Local dump enabled: ${localPath}`);
  }
});

worker.on('failed', async (job, err) => {
  console.error('rpm.export failed', job?.id, err);
  
  // Update export record with error
  try {
    const expId = job?.opts?.exportId;
    if (expId) {
      await pool.query(
        `update rpm_exports set status = 'failed', error = $1, failed_at = now() where id = $2`,
        [err.message, expId]
      );
    }
  } catch (e) {
    console.error('Failed to update export record error:', e);
  }
});


