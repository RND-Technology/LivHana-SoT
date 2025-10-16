### **Memory Management:**

```javascript
// ⚠️ ISSUE: Stores all proposals in Redis indefinitely
await this.redis.set(
  `improvement:proposal:${proposal.id}`,
  JSON.stringify(proposal),
  { EX: 30 * 24 * 60 * 60 } // 30 days
);
```

**ENHANCEMENT:** Add proposal archival:

```javascript
// After proposal is implemented or rejected for >7 days, archive to BigQuery
async function archiveOldProposals() {
  const cutoffDate = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
  const proposals = await this.getAllProposals();
  
  const toArchive = proposals.filter(p => 
    (p.status === 'implemented' || p.status === 'rejected') &&
    new Date(p.implementedAt || p.rejectedAt) < cutoffDate
  );
  
  if (toArchive.length > 0) {
    await this.bigQuery.dataset('ai_learning').table('archived_proposals').insert(toArchive);
    
    for (const p of toArchive) {
      await this.redis.del(`improvement:proposal:${p.id}`);
    }
    
    this.logger.info({ archived: toArchive.length }, 'Archived old proposals to BigQuery');
  }
}
```

---
