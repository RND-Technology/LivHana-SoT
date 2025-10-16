### **Edge Case Bug:**

```javascript
// ⚠️ ISSUE: Race condition in ticket allocation
const startTicketNumber = raffle.tickets_sold + 1; // ❌ Not atomic!

for (let i = 0; i < numTickets; i++) {
  const ticketNumber = startTicketNumber + i;
  tickets.push({ ticket_number: ticketNumber });
}
```

**FIX:** Use Redis atomic counter:

```javascript
async function allocateTicketNumbers(raffleId, numTickets) {
  const counterKey = `raffle:${raffleId}:ticket_counter`;
  
  // Atomic increment
  const startTicket = await redis.incrby(counterKey, numTickets);
  const ticketNumbers = [];
  
  for (let i = 0; i < numTickets; i++) {
    ticketNumbers.push(startTicket - numTickets + i + 1);
  }
  
  return ticketNumbers;
}
```

---
