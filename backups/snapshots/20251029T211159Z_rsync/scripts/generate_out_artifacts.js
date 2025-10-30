#!/usr/bin/env node
/*
 Generates /out artifacts from transcripts and canon files.
 Outputs: ingestion.md, RPM_THIS_WEEK.md, gantt.md, kanban.json, index.json,
          pdr_additions.md, adr_additions.md, cockpit_deltas.md
 Usage:
   node scripts/generate_out_artifacts.js "GOOGLE MEET Meetings Oct thru 10:21 AM.txt"
*/
const fs = require('fs');
const path = require('path');

function read(file) {
  try { return fs.readFileSync(file, 'utf-8'); } catch { return ''; }
}

function writeOut(name, content) {
  const outDir = path.resolve(process.cwd(), 'out');
  fs.mkdirSync(outDir, { recursive: true });
  const fp = path.join(outDir, name);
  fs.writeFileSync(fp, content, 'utf-8');
  return fp;
}

function dedupeLines(text) {
  const seen = new Set();
  const lines = text.split(/\r?\n/);
  const out = [];
  for (const line of lines) {
    const key = line.trim();
    if (key.length === 0) { out.push(line); continue; }
    if (!seen.has(key)) { seen.add(key); out.push(line); }
  }
  return out.join('\n');
}

function extractSessions(text) {
  const lines = text.split(/\r?\n/);
  const sessions = [];
  const headerRe = /(Oct|Sep|Nov)\s+\d{1,2},\s*2025/i;
  let current = null;
  for (const line of lines) {
    if (headerRe.test(line)) {
      if (current) sessions.push(current);
      current = { header: line.trim(), lines: [] };
    } else if (current) {
      current.lines.push(line);
    }
  }
  if (current) sessions.push(current);
  return sessions;
}

function findClaims(text) {
  const claimRe = /(must|will|shall|blocked|requires|need to|status:|Summary|Decision)/i;
  return text.split(/\r?\n/).filter(l => claimRe.test(l)).slice(0, 400);
}

function findAssumptions(text) {
  const re = /(assume|likely|seems|appears|should|probably)/i;
  return text.split(/\r?\n/).filter(l => re.test(l)).slice(0, 200);
}

function loadUnsolvedFromMeetings() {
  const fp = path.resolve('Meetings_2025-10.md');
  const md = read(fp);
  if (!md) return [];
  const rows = [];
  const lines = md.split(/\r?\n/);
  for (const line of lines) {
    if (/^\|\s*STR-/.test(line)) {
      const parts = line.split('|').map(s => s.trim());
      // | ID | Title | Owners | Due | Priority | DependsOn | RPM DNA | Compliance Tags |
      rows.push({
        id: parts[1], title: parts[2], owners: parts[3], due: parts[4], priority: parts[5], dependsOn: parts[6], rpm: parts[7], compliance: parts[8]
      });
    }
  }
  return rows;
}

function buildKanban(unsolved) {
  const columns = { Backlog: [], Doing: [], Blocked: [], Review: [], Done: [] };
  for (const it of unsolved) {
    const status = it.priority?.toLowerCase().includes('critical') ? 'Doing' : 'Backlog';
    columns[status].push({ task: it.title, id: it.id, owner: it.owners, due: it.due, depends: it.dependsOn || '' });
  }
  return { columns };
}

function buildIndex(unsolved) {
  const items = unsolved.map((it, i) => ({
    id: it.id || `U${i+1}`, 
    status: 'unsolved', 
    owners: it.owners, 
    due_date: it.due || null,
    timestamp: new Date().toISOString(),
    cialdini: ['commitment','authority'], 
    rpm_context: it.rpm || '', 
    compliance_flags: (it.compliance||'').split(',').map(s=>s.trim()).filter(Boolean),
    truth_trace: {
      source: 'meeting_transcripts',
      extracted_at: new Date().toISOString(),
      canonical_refs: []
    }
  }));
  return { 
    generated: new Date().toISOString(),
    items,
    summary: {
      total: items.length,
      owners: [...new Set(items.map(i => i.owners))],
      compliance_checks: items.reduce((sum, i) => sum + i.compliance_flags.length, 0)
    }
  };
}

function buildGantt(unsolved) {
  const today = new Date();
  function fmt(d){return d.toISOString().slice(0,10);} 
  const lines = [
    'gantt',
    '    dateFormat  YYYY-MM-DD',
    '    title Liv Hana RPM Weekly Plan',
  ];
  let day = 0;
  for (const it of unsolved.slice(0, 15)) {
    const start = new Date(today.getTime() + day*86400000);
    const dur = it.priority?.toLowerCase().includes('critical') ? 2 : 1;
    const end = new Date(start.getTime() + (dur-1)*86400000);
    lines.push(`    section ${it.owners || 'Team'}`);
    lines.push(`    ${it.title.replace(/[:]/g,'-').substring(0, 40)} :${fmt(start)}, ${dur}d`);
    day += 1;
  }
  return lines.join('\n');
}

function rpmThisWeek(unsolved) {
  const roles = ['Jesse (CEO)','Andrew (Systems/Ops)','Christopher (Ops/CX)','Charlie (Product/Procurement)'];
  const today = new Date();
  const monday = new Date(today); monday.setDate(today.getDate() - ((today.getDay()+6)%7));
  function dstr(d){return d.toISOString().slice(0,10);} 
  const lines = ['# RPM — This Week (CST)', '', `Week of ${dstr(monday)}`, ''];
  for (const role of roles) {
    lines.push(`## ${role}`);
    const picks = unsolved.filter(u => (u.owners||'').includes(role.split(' ')[0])).slice(0,3);
    picks.forEach((p,i)=>{
      lines.push(`- ${p.title} — ${p.due || 'TBD'} (Result → Purpose → MAP[${i+1}])`);
    });
    if (picks.length===0) lines.push('- Backlog triage + support');
    lines.push('');
  }
  lines.push('---');
  lines.push('_Lifeward guardrails: 21+ ID, no medical claims, NIST/ISO-validated methods._');
  return lines.join('\n');
}

function pdrAdditions() {
  return `# PDR Additions\n\n- Voice autostart MAX_AUTO toggle and status surfaces.\n- RPM Cockpit panel with downloads (MD/CSV/PDF) and inline Mermaid Gantt.\n- Age-gate CTA fix with pre-checkout disclosure modal.\n- Compliance Verification App UX flows (COA lookup, NIST badges).\n`;
}

function adrAdditions() {
  return `# ADR Additions\n\n- Introduce /api/rpm service with Postgres + Redis queue.\n- Export worker (BullMQ) writing artifacts to /out (md/csv; pdf via Puppeteer).\n- Standardize names: Rube MCP, Claude, LightSpeed.\n- MAX_AUTO tmux orchestration for voice + 5 subagents with status JSON.\n`;
}

function cockpitDeltas() {
  return `# Cockpit Deltas\n\n- Add RPM Weekly Plan panel with filters, inline Gantt, and Download buttons (MD/CSV/PDF).\n- Health banner for MAX_AUTO agents (voice/planning/research/artifact/exec/qa).\n- Compliance widget: COA validity + age-gate state.\n`;
}

function main() {
  const transcriptPath = process.argv[2] || path.resolve('data/meetings/oct_2025_transcripts.txt');
  const raw = read(transcriptPath);
  const text = dedupeLines(raw);
  const sessions = extractSessions(text);
  const claims = findClaims(text);
  const assumptions = findAssumptions(text);
  const unsolved = loadUnsolvedFromMeetings();

  // ingestion.md
  const ing = [];
  ing.push('# Ingestion — Meetings (3 weeks)');
  ing.push('');
  ing.push('## Sessions');
  sessions.slice(0, 20).forEach((s, i) => { ing.push(`- ${i+1}. ${s.header}`); });
  ing.push('');
  ing.push('## Factual Claims');
  claims.slice(0, 50).forEach(l => ing.push(`- ${l}`));
  ing.push('');
  ing.push('## Assumptions');
  assumptions.slice(0, 30).forEach(l => ing.push(`- ${l}`));
  ing.push('');
  ing.push('## Critical Findings');
  ing.push('- MCP endpoint + secrets required; age-gate button bug present; LightSpeed visibility gap.');
  ing.push('- Lifeward guardrails enforced: 21+, no medical claims, NIST/ISO methods.');
  writeOut('MEETING_INGESTION_OCT_2025.md', ing.join('\n'));

  // RPM_THIS_WEEK.md
  writeOut('RPM_THIS_WEEK.md', rpmThisWeek(unsolved));

  // gantt.md
  writeOut('gantt.md', buildGantt(unsolved));

  // kanban.csv
  const kanbanData = buildKanban(unsolved);
  const csvLines = ['Status,Task,Layer,Owner,Due,Depends,Notes'];
  for (const [status, items] of Object.entries(kanbanData.columns)) {
    for (const item of items) {
      csvLines.push(`${status},"${item.task}",RPM,"${item.owner}","${item.due}","${item.depends}",""`);
    }
  }
  writeOut('kanban.csv', csvLines.join('\n'));

  // index.json
  writeOut('index.json', JSON.stringify(buildIndex(unsolved), null, 2));

  // pdr / adr / cockpit deltas
  writeOut('pdr_additions.md', pdrAdditions());
  writeOut('adr_additions.md', adrAdditions());
  writeOut('cockpit_deltas.md', cockpitDeltas());

  // YouTube agent backlog spec
  const yt = `# YouTube Publishing Agent (Backlog)\n\n- Trigger: Google Drive 'Meet recording finished'\n- Pull: Drive API locate MP4 by meeting ID\n- Transform: optional FFmpeg title card (Cloud Run Job)\n- Upload: YouTube Data API v3, set title/desc/tags/playlist\n- Metadata: derive from RPM/HNC canon (episode, date, CTA)\n- Platform: Cloud Run + Scheduler + Secret Manager\n- Compliance: 21+ age gate, no medical claims, CR/NIST refs\n`;
  writeOut('yt_agent_backlog.md', yt);

  console.log('Artifacts written to /out');
}

if (require.main === module) {
  main();
}


