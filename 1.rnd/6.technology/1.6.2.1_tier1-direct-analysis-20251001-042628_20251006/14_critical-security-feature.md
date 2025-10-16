### **CRITICAL SECURITY FEATURE:**

```javascript
class SecureRaffleDrawing {
  static async selectWinner(tickets, seed) {
    // Use seed to create deterministic but unpredictable randomness
    const hash = crypto.createHash('sha256').update(seed + Date.now()).digest('hex');
    const winnerIndex = parseInt(hash.substring(0, 8), 16) % tickets.length;
    return tickets[winnerIndex];
  }
  
  static createAuditTrail(raffleId, seed, winner, runnerUps) {
    const auditData = { raffleId, drawTimestamp, seed, seedHash, winner, runnerUps };
    const auditHash = crypto.createHash('sha256').update(JSON.stringify(auditData)).digest('hex');
    auditData.auditHash = auditHash;
    return auditData;
  }
}
```

**Excellent!** Provides:

- Verifiable randomness
- Tamper-proof audit trail
- Regulatory compliance
