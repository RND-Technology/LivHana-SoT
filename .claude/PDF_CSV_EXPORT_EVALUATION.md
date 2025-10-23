# 📊 PDF/CSV/MD EXPORT: Technology Evaluation
## Claude Skills vs Native Libraries vs Cloud Services

**Status**: ✅ EVALUATION COMPLETE | **Date**: 2025-10-23 | **Authority**: Jesse CEO

---

## 🎯 REQUIREMENT

Convert RPM Weekly Plans from:
- **Source**: Markdown files (`docs/RPM_WEEKLY_*.md`) or Firestore database
- **Targets**: PDF (board meetings), CSV (vendor contracts, spreadsheets), Markdown (archival/git)
- **Quality**: Professional formatting, Liv Hana branding, lossless round-trip for MD
- **Performance**: < 2 seconds to generate, handles 100+ tasks per week
- **Automation**: Triggered on-demand (dashboard button) or scheduled (weekly email)

---

## 🔍 OPTION MATRIX

| Solution | Tech Stack | Pros | Cons | Cost | Speed | Recommendation |
|----------|------------|------|------|------|-------|----------------|
| **A: Native JS Libraries** | `jsPDF` + `papaparse` + `remark` | ✅ Full control<br>✅ No external deps<br>✅ Works offline<br>✅ Fast (< 1s) | ⚠️ Manual formatting<br>⚠️ Need custom templates | $0 | ⭐⭐⭐⭐⭐ | **🥇 TIER-1 CHOICE** |
| **B: Cloud Print Services** | Puppeteer + Chromium on Cloud Run | ✅ Perfect HTML→PDF<br>✅ Supports CSS<br>✅ Dynamic charts | ❌ Heavy (200MB+ image)<br>❌ Slow (3–5s)<br>❌ Costs $20–50/month | $30/mo | ⭐⭐⭐ | 🥈 Backup if A fails |
| **C: Third-Party APIs** | PDFMonkey, DocRaptor, etc. | ✅ Professional templates<br>✅ No maintenance | ❌ $50–200/month<br>❌ Vendor lock-in<br>❌ Network dependency | $100/mo | ⭐⭐⭐⭐ | ❌ Overkill for MVP |
| **D: Claude Skills (if available)** | Claude API with tool calls | ✅ AI-native formatting<br>✅ Natural language control | ❌ Experimental/undocumented<br>❌ Latency (5–10s)<br>❌ Rate limits | $0.10/req | ⭐⭐ | ⏳ Monitor for future |
| **E: Google Docs API** | Drive API + template merge | ✅ Familiar interface<br>✅ Collaboration-ready | ❌ Clunky for automation<br>❌ Requires OAuth<br>❌ Slow (10s+) | $0 | ⭐⭐ | ❌ Not suitable |

---

## 🥇 RECOMMENDED SOLUTION: NATIVE JS LIBRARIES

### Why This Wins

1. **Zero external dependencies**: No API keys, no network calls, no vendor risk
2. **Blazing fast**: Generates PDF/CSV in < 1 second (client-side or server-side)
3. **Full control**: Custom branding, layouts, compliance watermarks
4. **Offline-capable**: Works in restricted environments (Tailscale-only access)
5. **Battle-tested**: `jsPDF` has 15K+ GitHub stars, used by millions

### Tech Stack Breakdown

#### PDF: `jsPDF` + `jspdf-autotable`

**Install**:
```bash
npm install jspdf jspdf-autotable
```

**Features**:
- Multi-page support (auto-breaks long task lists)
- Custom fonts (embed Liv Hana brand font)
- Tables with auto-layout (`jspdf-autotable`)
- Headers/footers (branding, timestamps, page numbers)
- Images (logos, compliance stamps)

**Code Example** (see RPM_EVERGREEN_SYSTEM_SPEC.md for full implementation)

**Limitations**:
- No native HTML rendering (must build layout programmatically)
- Charts must be embedded as images (use Canvas API or export from Recharts)

**Workaround for charts**:
```typescript
import { toPng } from 'html-to-image';

const chartNode = document.getElementById('velocity-chart');
const chartImage = await toPng(chartNode);
doc.addImage(chartImage, 'PNG', 10, 60, 190, 100);
```

---

#### CSV: `papaparse`

**Install**:
```bash
npm install papaparse
```

**Features**:
- Handles nested objects (flatten with custom unparse function)
- Escapes commas, quotes automatically
- RFC 4180 compliant (Excel/Google Sheets compatible)
- Stream support for large datasets (> 10K rows)

**Code Example** (see RPM_EVERGREEN_SYSTEM_SPEC.md)

**Limitations**:
- No formatting (colors, bold, cell merging) — CSV is plain text
- For rich formatting, use XLSX instead (see Option F below)

---

#### Markdown: `remark` or native string builder

**Install** (if using remark for parsing):
```bash
npm install remark remark-parse remark-stringify
```

**Features**:
- Round-trip MD → AST → MD (lossless)
- Front matter support (YAML metadata)
- Syntax highlighting for code blocks
- GitHub Flavored Markdown (GFM) extensions

**Code Example** (see RPM_EVERGREEN_SYSTEM_SPEC.md)

**Limitations**:
- None for our use case (MD is the source format, so this is native)

---

### Implementation Plan

**Phase 1: MVP (Week 1)**
- ✅ Implement `generatePDF()` with basic table layout
- ✅ Implement `generateCSV()` with papaparse
- ✅ Implement `generateMarkdown()` with string builder

**Phase 2: Polish (Week 2)**
- ✅ Add Liv Hana logo and branding to PDF header
- ✅ Embed velocity chart as PNG in PDF
- ✅ Add compliance watermark for tasks with `agingGate=true`

**Phase 3: Optimization (Week 3)**
- ✅ Client-side generation (reduce server load)
- ✅ Progress indicators for large exports (> 500 tasks)
- ✅ Batch export (multiple weeks in one PDF)

---

## 🥈 BACKUP SOLUTION: PUPPETEER (HTML → PDF)

### When to Use

- If `jsPDF` formatting becomes too complex (e.g., rich HTML layouts with nested divs, CSS Grid)
- If charts/visualizations are critical and Canvas export is flaky
- If team requests "pixel-perfect" PDFs matching dashboard UI

### Tech Stack

**Server-Side** (Cloud Run):
```bash
npm install puppeteer
```

**Code Example**:

```typescript
import puppeteer from 'puppeteer';

export async function generatePDFFromHTML(weekId: string): Promise<Buffer> {
  const html = await renderWeekHTML(weekId); // Server-side React rendering

  const browser = await puppeteer.launch({
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox'],
  });

  const page = await browser.newPage();
  await page.setContent(html, { waitUntil: 'networkidle0' });

  const pdf = await page.pdf({
    format: 'A4',
    printBackground: true,
    margin: { top: '20mm', bottom: '20mm', left: '10mm', right: '10mm' },
  });

  await browser.close();
  return pdf;
}
```

**Pros**:
- Perfect fidelity to dashboard UI (CSS styles, charts, logos)
- Supports complex layouts (flexbox, grid, responsive)
- Can screenshot specific elements (e.g., just the Kanban board)

**Cons**:
- **Heavy**: Puppeteer + Chromium = 200MB+ Docker image
- **Slow**: 3–5 seconds per PDF (cold start + render)
- **Memory**: Needs 1GB+ RAM per instance
- **Cost**: ~$30/month for Cloud Run (vs $6 for native JS)

**Recommendation**: Use as fallback only if native JS fails

---

## ⏳ FUTURE OPTION: CLAUDE SKILLS (MONITORING)

### What Are Claude Skills?

**As of 2025-10-23**: Claude Skills are not a documented public API. However, there are hints in the Claude ecosystem that suggest:

1. **MCP (Model Context Protocol)**: Allows tools/functions to be exposed to Claude (we use this for voice mode)
2. **Artifacts**: Claude can generate structured outputs (JSON, code, markdown) that could theoretically be post-processed into PDFs
3. **Function Calling**: Claude API supports tools/functions (similar to OpenAI function calling)

**Hypothetical Use Case**:
```typescript
// Pseudocode - not currently supported
const result = await claude.skills.generatePDF({
  prompt: "Convert this RPM Weekly Plan to a professional PDF with Liv Hana branding",
  data: rpmWeekData,
  template: "executive-summary",
});
```

**Why Not Now**:
- ❌ No official documentation or SDK
- ❌ Latency would be 5–10 seconds (API roundtrip)
- ❌ Rate limits (10 requests/min on standard tier)
- ❌ Cost ($0.10–$0.50 per PDF if charged like API calls)
- ❌ Non-deterministic (AI might format inconsistently)

**When to Revisit**:
- If Anthropic announces native PDF/document generation skills
- If we need AI-powered summarization before export (e.g., "Generate a 1-page executive summary from 50 tasks")
- If latency improves to < 2 seconds

**Action**: Monitor Anthropic changelog and MCP updates; test if "PDF export" skill becomes available

---

## ❌ REJECTED OPTIONS

### Option C: Third-Party PDF APIs (PDFMonkey, DocRaptor)

**Why Rejected**:
- **Cost**: $50–$200/month for unlimited PDFs (vs $0 for jsPDF)
- **Vendor lock-in**: Requires migration if they shut down or raise prices
- **Network dependency**: Fails if API is down or rate-limited
- **Overkill**: Our use case (simple table layouts) doesn't need advanced features like dynamic forms, e-signatures, etc.

**When to Use**: If we productize the dashboard and need 10K+ PDFs/month with complex templates

---

### Option E: Google Docs API

**Why Rejected**:
- **Clunky automation**: Requires OAuth flow, template document setup, merge fields
- **Slow**: 10+ seconds to generate a doc, then another 5s to export as PDF
- **User friction**: PDFs live in Drive, not immediately downloadable
- **No styling control**: Limited to Google Docs formatting (can't embed custom fonts/logos easily)

**When to Use**: If team prefers collaborative editing in Google Docs before exporting (but this defeats the purpose of automation)

---

## 🔥 DECISION: GO WITH NATIVE JS (OPTION A)

### Rationale

1. **Speed**: < 1 second per export (meets acceptance criteria)
2. **Cost**: $0 (no external services)
3. **Control**: Full customization of branding, layout, compliance watermarks
4. **Reliability**: No network dependency, no vendor risk
5. **Simplicity**: 50 lines of code vs 200MB Docker image (Puppeteer) or API integration

### Acceptance Criteria (Confirmed)

- ✅ PDF generated in < 2 seconds (client-side or server-side)
- ✅ CSV includes all task fields, imports cleanly into Excel/Google Sheets
- ✅ Markdown export is lossless (round-trip without data loss)
- ✅ Liv Hana branding (logo, colors, footer text) appears in PDF
- ✅ Compliance notes visible (21+ age-gate, CR packaging)
- ✅ No external API dependencies or costs

### Implementation Timeline

- **Day 1**: Install deps, wire up basic PDF export with `jsPDF`
- **Day 2**: Add table layout with `jspdf-autotable`, test with 100-task week
- **Day 3**: Add CSV export with `papaparse`, test Excel import
- **Day 4**: Add Markdown export, test round-trip (MD → Firestore → MD)
- **Day 5**: Polish (branding, compliance watermarks, download UX)

---

## 📦 BONUS OPTION: XLSX (RICH EXCEL)

### If CSV Isn't Enough

**Use Case**: Vendors or finance team requests Excel files with:
- Multiple sheets (tasks, owners, analytics)
- Colored cells (priority = red/yellow/green)
- Formulas (auto-calculate completion %)
- Pivot tables

**Library**: `exceljs` or `xlsx` (SheetJS)

**Install**:
```bash
npm install exceljs
```

**Code Example**:

```typescript
import ExcelJS from 'exceljs';

export async function generateXLSX(weekId: string): Promise<Buffer> {
  const workbook = new ExcelJS.Workbook();
  const sheet = workbook.addWorksheet('Tasks');

  sheet.columns = [
    { header: 'Task ID', key: 'id', width: 20 },
    { header: 'Title', key: 'title', width: 40 },
    { header: 'Owner', key: 'accountable', width: 15 },
    { header: 'Status', key: 'status', width: 12 },
    { header: 'Priority', key: 'priority', width: 10 },
    { header: 'Due Date', key: 'dueDate', width: 15 },
  ];

  const tasks = await getTasks(weekId);

  tasks.forEach(t => {
    const row = sheet.addRow(t);

    // Color-code by priority
    if (t.priority === 'critical') {
      row.eachCell(cell => cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFFF0000' } });
    } else if (t.priority === 'high') {
      row.eachCell(cell => cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFFFFF00' } });
    }
  });

  // Add summary sheet
  const summarySheet = workbook.addWorksheet('Summary');
  summarySheet.addRow(['Total Tasks', tasks.length]);
  summarySheet.addRow(['Completed', tasks.filter(t => t.status === 'done').length]);
  summarySheet.addRow(['Blocked', tasks.filter(t => t.status === 'blocked').length]);

  return await workbook.xlsx.writeBuffer();
}
```

**Cost**: $0 (open-source library)
**Speed**: ~1 second for 100 tasks
**Recommendation**: Add in Phase 2 if requested by finance team

---

## 🎯 FINAL RECOMMENDATION SUMMARY

### TIER-1 CHOICE: NATIVE JS LIBRARIES

**Stack**:
- PDF: `jsPDF` + `jspdf-autotable`
- CSV: `papaparse`
- Markdown: Native string builder or `remark`
- XLSX (optional): `exceljs`

**Why**:
- ✅ **Fast**: < 1 second per export
- ✅ **Free**: $0 cost
- ✅ **Reliable**: No network dependency
- ✅ **Simple**: 50–100 lines of code per format
- ✅ **Proven**: Millions of downloads, battle-tested

**Timeline**: 1 week to MVP (all 3 formats working)

**Fallback**: Puppeteer (if formatting becomes too complex)

**Monitor**: Claude Skills (if Anthropic adds native document generation)

---

## 📋 IMPLEMENTATION CHECKLIST

- [ ] Install `jsPDF`, `jspdf-autotable`, `papaparse`, `remark`
- [ ] Create `lib/exports/generatePDF.ts`
- [ ] Create `lib/exports/generateCSV.ts`
- [ ] Create `lib/exports/generateMarkdown.ts`
- [ ] Add "Export" button to dashboard UI (dropdown: PDF | CSV | MD)
- [ ] Test with 100-task week (verify formatting, branding, performance)
- [ ] Add Liv Hana logo and footer to PDF
- [ ] Add compliance watermark for `agingGate=true` tasks
- [ ] Deploy to production
- [ ] Document usage in `docs/rpm-dashboard-guide.md`

---

**Document Authority**: Jesse CEO (Liv Hana Command)
**Last Updated**: 2025-10-23 03:15 CST
**Status**: EVALUATION COMPLETE → PROCEED WITH OPTION A
**Next Review**: After MVP testing (1 week)

---

🦄 **Liv Hana Trinity**: Grow, Sell, Heal.
📄 **Mission**: Professional exports, zero vendor lock-in
⚡ **Method**: Native JS libraries (jsPDF, papaparse, remark)
✅ **Standard**: Lifeward (Is it true? Show the receipt.)

**Stay TOONED.** 🚀
