## 🤖 AUTOMATED NOTION INGESTION SCRIPT

**File:** `automation/data-pipelines/notion_ingest.js`

```javascript
import { Client } from '@notionhq/client';
import { BigQuery } from '@google-cloud/bigquery';
import { writeFileSync, mkdirSync } from 'fs';

const notion = new Client({ auth: process.env.NOTION_API_KEY });
const bigquery = new BigQuery({ projectId: process.env.GCP_PROJECT_ID });

async function ingestNotion() {
  console.log('🔄 Ingesting Notion workspace...');

  // List all pages
  const pages = await notion.search({
    filter: { property: 'object', value: 'page' }
  });

  const pageData = [];

  for (const page of pages.results) {
    const pageId = page.id;
    const title = page.properties?.title?.title?.[0]?.plain_text || 'Untitled';

    // Get page content
    const blocks = await notion.blocks.children.list({ block_id: pageId });

    // Extract text from blocks
    const content = blocks.results
      .map(block => extractBlockText(block))
      .join('\\n');

    // Save to array
    pageData.push({
      id: pageId,
      title,
      content,
      url: page.url,
      created_time: page.created_time,
      last_edited_time: page.last_edited_time,
      metadata: JSON.stringify(page)
    });

    // Export as markdown
    mkdirSync('data/notion_export', { recursive: true });
    writeFileSync(
      \`data/notion_export/\${title.replace(/[^a-z0-9]/gi, '_')}.md\`,
      \`# \${title}\\n\\n\${content}\`
    );

    console.log(\`  ✓ Ingested: \${title}\`);
  }

  // Upload to BigQuery
  await bigquery
    .dataset('knowledge')
    .table('notion_pages')
    .insert(pageData);

  console.log(\`✅ Ingested \${pageData.length} Notion pages\`);
}

function extractBlockText(block) {
  if (block.type === 'paragraph') {
    return block.paragraph.rich_text
      .map(t => t.plain_text)
      .join('');
  }
  if (block.type === 'heading_1') {
    return '# ' + block.heading_1.rich_text
      .map(t => t.plain_text)
      .join('');
  }
  // Add more block types as needed
  return '';
}

ingestNotion().catch(console.error);
```

---
