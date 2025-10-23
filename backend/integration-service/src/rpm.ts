import express from 'express';
import jwt from 'jsonwebtoken';
import { Pool } from 'pg';
import { stringify } from 'csv-stringify/sync';
import { createQueue, enqueueJob } from '../../common/queue/index.js';

const router = express.Router();

// DB pool
const pool = new Pool({ connectionString: process.env.DATABASE_URL });

// Simple JWT middleware
function requireJWT(req: express.Request, res: express.Response, next: express.NextFunction) {
  try {
    const hdr = req.headers.authorization || '';
    const token = hdr.startsWith('Bearer ') ? hdr.slice(7) : undefined;
    if (!token) return res.status(401).json({ error: 'missing token' });
    jwt.verify(token, process.env.JWT_SECRET || 'dev-secret');
    next();
  } catch (e: any) {
    return res.status(401).json({ error: 'invalid token' });
  }
}

// Helpers
async function getCurrentWeekId(client: Pool) {
  const { rows } = await client.query(
    `select id from rpm_weeks where week_start <= now() and week_end >= now() order by version desc limit 1`
  );
  return rows[0]?.id;
}

router.get('/weeks/current', async (_req, res) => {
  try {
    const id = await getCurrentWeekId(pool);
    res.json({ id });
  } catch (e: any) {
    res.status(500).json({ error: e.message });
  }
});

router.get('/weeks/:id/items', async (req, res) => {
  try {
    const { rows } = await pool.query('select * from rpm_items where week_id = $1 order by due_date asc nulls last', [req.params.id]);
    res.json({ items: rows });
  } catch (e: any) {
    res.status(500).json({ error: e.message });
  }
});

router.post('/weeks/:id/items', requireJWT, async (req, res) => {
  try {
    const { title, result, purpose, map_json, owner_role, owner_user, status, due_date, cialdini, compliance_flags, tags } = req.body;
    const { rows } = await pool.query(
      `insert into rpm_items (week_id,title,result,purpose,map_json,owner_role,owner_user,status,due_date,cialdini,compliance_flags,tags,created_at,updated_at)
       values ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,now(),now()) returning id`,
      [req.params.id, title, result, purpose, map_json, owner_role, owner_user, status, due_date, cialdini, compliance_flags, tags]
    );
    res.json({ id: rows[0].id });
  } catch (e: any) {
    res.status(500).json({ error: e.message });
  }
});

// Export queue
const exportQueue = createQueue('rpm.export');

// POST /api/rpm/weeks/upsert - Ensure active week exists (JWT required)
router.post('/weeks/upsert', requireJWT, async (req, res) => {
  try {
    const { week_start, week_end, version = 1 } = req.body;
    const today = new Date();
    const weekStart = week_start || new Date(today.getFullYear(), today.getMonth(), today.getDate() - today.getDay() + 1);
    const weekEnd = week_end || new Date(weekStart.getTime() + 6 * 24 * 60 * 60 * 1000);
    
    const { rows } = await pool.query(
      `insert into rpm_weeks (week_start, week_end, version, created_at, updated_at)
       values ($1, $2, $3, now(), now())
       on conflict (week_start, week_end) do update set updated_at = now()
       returning id`,
      [weekStart, weekEnd, version]
    );
    res.json({ id: rows[0].id, week_start: weekStart, week_end: weekEnd });
  } catch (e: any) {
    res.status(500).json({ error: e.message });
  }
});

// POST /api/rpm/weeks/:id/export - Queue export job (JWT required)
router.post('/weeks/:id/export', requireJWT, async (req, res) => {
  try {
    const format = (req.query.format as string) || 'md';
    const weekId = req.params.id as string;
    
    // Verify week exists
    const { rows: weekRows } = await pool.query('select id from rpm_weeks where id = $1', [weekId]);
    if (weekRows.length === 0) {
      return res.status(404).json({ error: 'Week not found' });
    }
    
    // Store export record first to get ID
    const { rows: exportRows } = await pool.query(
      `insert into rpm_exports (week_id, format, status, created_at)
       values ($1, $2, 'queued', now()) returning id`,
      [weekId, format]
    );
    const exportId = exportRows[0].id;
    
    // Enqueue job with exportId in opts
    const job = await enqueueJob(exportQueue, 'export', { weekId, format }, { 
      removeOnComplete: true,
      exportId 
    });
    
    // Update export record with job_id
    await pool.query(
      `update rpm_exports set job_id = $1 where id = $2`,
      [job.id, exportId]
    );
    
    res.json({ export_id: exportId, job: { id: job.id, queue: 'rpm.export' } });
  } catch (e: any) {
    res.status(500).json({ error: e.message });
  }
});

// GET /api/rpm/exports/:exportId - Fetch export metadata (JWT required)
router.get('/exports/:exportId', requireJWT, async (req, res) => {
  try {
    const { rows } = await pool.query(
      'select * from rpm_exports where id = $1',
      [req.params.exportId]
    );
    if (rows.length === 0) {
      return res.status(404).json({ error: 'Export not found' });
    }
    res.json(rows[0]);
  } catch (e: any) {
    res.status(500).json({ error: e.message });
  }
});

// PATCH /api/rpm/items/:id - Update item status/fields (JWT required)
router.patch('/items/:id', requireJWT, async (req, res) => {
  try {
    const { id } = req.params;
    const updates = req.body;
    
    // Build dynamic update query
    const fields = [];
    const values = [];
    let paramIdx = 1;
    
    const allowedFields = ['status', 'owner_role', 'owner_user', 'due_date', 'tags', 'compliance_flags'];
    for (const [key, value] of Object.entries(updates)) {
      if (allowedFields.includes(key)) {
        fields.push(`${key} = $${paramIdx}`);
        values.push(value);
        paramIdx++;
      }
    }
    
    if (fields.length === 0) {
      return res.status(400).json({ error: 'No valid fields to update' });
    }
    
    fields.push(`updated_at = now()`);
    values.push(id);
    
    const { rows } = await pool.query(
      `update rpm_items set ${fields.join(', ')} where id = $${paramIdx} returning *`,
      values
    );
    
    if (rows.length === 0) {
      return res.status(404).json({ error: 'Item not found' });
    }
    
    res.json(rows[0]);
  } catch (e: any) {
    res.status(500).json({ error: e.message });
  }
});

export default router;


