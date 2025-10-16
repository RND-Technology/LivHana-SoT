### **Code Quality Issues:**

```javascript
// ⚠️ ISSUE: BigQuery doesn't support UPDATE well
async function updateMembershipStatus(membershipId, updates) {
  // BigQuery doesn't support UPDATE directly, so we insert a new record
  logger.info('Membership updated', { membershipId, updates });
  return updates; // ❌ This doesn't actually update anything!
}
```

**FIX:** Use Cloud Firestore for operational data, BigQuery for analytics:

```javascript
async function updateMembershipStatus(membershipId, updates) {
  // Update in Firestore (operational database)
  await firestore.collection('memberships').doc(membershipId).update(updates);
  
  // Async write to BigQuery for analytics
  await pubsub.publish('membership-updates', {
    membershipId,
    updates,
    timestamp: new Date().toISOString()
  });
  
  return updates;
}
```

---
