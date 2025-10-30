### LAYER 4: HERB (HERBITRAGE) - COMMERCE PLATFORM

**Project Structure:**

```
herbitrage-commerce/
├── frontend/
│   ├── pages/
│   │   ├── marketplace/
│   │   ├── membership/
│   │   └── raffle/
│   ├── components/
│   │   ├── ProductCard/
│   │   ├── PaymentForm/
│   │   └── AgeGate/
│   └── styles/
├── backend/
│   ├── api/
│   │   ├── products/
│   │   ├── payments/
│   │   ├── memberships/
│   │   └── raffles/
│   ├── services/
│   │   ├── square.service.js
│   │   ├── inventory.service.js
│   │   └── compliance.service.js
│   └── middleware/
│       ├── auth.js
│       ├── age-verification.js
│       └── rate-limiting.js
└── config/
    ├── payment.config.js
    └── inventory.config.js
```

**1. Blue Dream Raffle System**

```javascript
// backend/api/raffles/blue-dream.js
const express = require('express');
const crypto = require('crypto');
const router = express.Router();

// Blue Dream Raffle Entry Endpoint
router.post('/enter-raffle', async (req, res) => {
  const { 
    customerInfo, 
    entryType, 
    quantity, 
    paymentToken 
  } = req.body;
  
  try {
    // Age verification check
    const ageVerified = await verifyCustomerAge(customerInfo.email);
    if (!ageVerified) {
      return res.status(403).json({ 
        error: 'Age verification required for raffle entry' 
      });
    }
    
    // Validate entry type and pricing
    const entryTypes = {
      'single': { price: 10, entries: 1 },
      'power': { price: 25, entries: 3 },
      'ultimate': { price: 50, entries: 7 }
    };
    
    const selectedEntry = entryTypes[entryType];
    if (!selectedEntry) {
      return res.status(400).json({ error: 'Invalid entry type' });
    }
    
    const totalAmount = selectedEntry.price * quantity;
    
    // Process payment with Square
    const paymentResult = await processRafflePayment({
      token: paymentToken,
      amount: totalAmount,
      customerInfo: customerInfo,
      metadata: {
        raffleType: 'blue-dream',
        entryType: entryType,
        quantity: quantity,
        entries: selectedEntry.entries * quantity
      }
    });
    
    if (!paymentResult.success) {
      return res.status(400).json({ error: 'Payment processing failed' });
    }
    
    // Generate raffle entries
    const raffleEntries = [];
    const totalEntries = selectedEntry.entries * quantity;
    
    for (let i = 0; i < totalEntries; i++) {
      const entryId = generateRaffleEntryId();
      raffleEntries.push({
        id: entryId,
        raffleType: 'blue-dream',
        customerEmail: customerInfo.email,
        entryNumber: await getNextEntryNumber(),
        timestamp: new Date().toISOString(),
        paymentId: paymentResult.paymentId,
        orderId: paymentResult.orderId
      });
    }
    
    // Store entries in database
    await storeRaffleEntries(raffleEntries);
    
    // Send confirmation email
    await sendRaffleConfirmation({
      customerInfo: customerInfo,
      entries: raffleEntries,
      totalAmount: totalAmount,
      entryType: entryType
    });
    
    // Track analytics
    trackRaffleEntry({
      raffleType: 'blue-dream',
      entryType: entryType,
      quantity: quantity,
      totalAmount: totalAmount,
      customerEmail: customerInfo.email
    });
    
    res.json({
      success: true,
      message: 'Raffle entries purchased successfully!',
      entries: raffleEntries.length,
      entryNumbers: raffleEntries.map(e => e.entryNumber),
      nextDrawing: await getNextDrawingDate(),
      prize: {
        name: 'Blue Dream Premium Bundle',
        description: 'Top-shelf Blue Dream flower, concentrates, and exclusive merchandise',
        estimatedValue: '$500+'
      }
    });
    
  } catch (error) {
    console.error('Raffle entry error:', error);
    res.status(500).json({ error: 'Unable to process raffle entry' });
  }
});

// Get current raffle status
router.get('/status', async (req, res) => {
  try {
    const currentRaffle = await getCurrentRaffleInfo();
    
    res.json({
      raffleId: currentRaffle.id,
      name: 'Blue Dream Premium Bundle',
      description: 'Top-shelf Blue Dream flower, concentrates, and exclusive merchandise',
      prizeValue: '$500+',
      totalEntries: currentRaffle.totalEntries,
      entriesRemaining: currentRaffle.maxEntries - currentRaffle.totalEntries,
      drawingDate: currentRaffle.drawingDate,
      status: currentRaffle.status,
      entryOptions: [
        {
          type: 'single',
          price: 10,
          entries: 1,
          description: 'Single entry for $10'
        },
        {
          type: 'power',
          price: 25,
          entries: 3,
          popular: true,
          description: 'Power Pack - 3 entries for $25'
        },
        {
          type: 'ultimate',
          price: 50,
          entries: 7,
          description: 'Ultimate Pack - 7 entries for $50'
        }
      ]
    });
  } catch (error) {
    console.error('Raffle status error:', error);
    res.status(500).json({ error: 'Unable to fetch raffle status' });
  }
});

// Drawing execution (admin only)
router.post('/execute-drawing', async (req, res) => {
  try {
    // Admin authentication check
    const isAdmin = await verifyAdminAuth(req.headers.authorization);
    if (!isAdmin) {
      return res.status(403).json({ error: 'Admin access required' });
    }
    
    const currentRaffle = await getCurrentRaffleInfo();
    
    if (currentRaffle.status !== 'ready_for_drawing') {
      return res.status(400).json({ error: 'Raffle not ready for drawing' });
    }
    
    // Get all valid entries
    const entries = await getRaffleEntries(currentRaffle.id);
    
    if (entries.length === 0) {
      return res.status(400).json({ error: 'No valid entries found' });
    }
    
    // Secure random winner selection
    const randomBytes = crypto.randomBytes(4);
    const randomNumber = randomBytes.readUInt32BE(0);
    const winningIndex = randomNumber % entries.length;
    const winner = entries[winningIndex];
    
    // Record drawing results
    const drawingResult = {
      raffleId: currentRaffle.id,
      winnerEntryId: winner.id,
      winnerEmail: winner.customerEmail,
      totalEntries: entries.length,
      drawingTimestamp: new Date().toISOString(),
      randomSeed: randomBytes.toString('hex'),
      verificationHash: crypto
        .createHash('sha256')
        .update(JSON.stringify({
          raffleId: currentRaffle.id,
          winnerEntryId: winner.id,
          timestamp: Date.now()
        }))
        .digest('hex')
    };
    
    await recordDrawingResult(drawingResult);
    
    // Notify winner
    await notifyRaffleWinner(winner, currentRaffle);
    
    // Update raffle status
    await updateRaffleStatus(currentRaffle.id, 'completed');
    
    // Create next raffle
    await createNextRaffle();
    
    res.json({
      success: true,
      drawing: {
        raffleId: currentRaffle.id,
        winnerEntryNumber: winner.entryNumber,
        totalEntries: entries.length,
        drawingDate: new Date().toISOString(),
        verificationHash: drawingResult.verificationHash
      }
    });
    
  } catch (error) {
    console.error('Drawing execution error:', error);
    res.status(500).json({ error: 'Unable to execute drawing' });
  }
});

function generateRaffleEntryId() {
  const timestamp = Date.now().toString();
  const random = crypto.randomBytes(4).toString('hex');
  return `BD${timestamp.slice(-8)}${random}`.toUpperCase();
}

async function processRafflePayment(paymentData) {
  // Integration with Square Payments API
  const { Client, Environment } = require('square');
  const client = new Client({
    accessToken: process.env.SQUARE_ACCESS_TOKEN,
    environment: Environment.Production
  });
  
  try {
    const payment = await client.paymentsApi.createPayment({
      sourceId: paymentData.token,
      idempotencyKey: crypto.randomUUID(),
      amountMoney: {
        amount: paymentData.amount * 100, // Convert to cents
        currency: 'USD'
      },
      buyerEmailAddress: paymentData.customerInfo.email,
      note: `Blue Dream Raffle - ${paymentData.metadata.entryType} (${paymentData.metadata.entries} entries)`,
      metadata: paymentData.metadata
    });
    
    return {
      success: true,
      paymentId: payment.result.payment.id,
      orderId: payment.result.payment.orderId
    };
  } catch (error) {
    console.error('Square payment error:', error);
    return { success: false, error: error.message };
  }
}

module.exports = router;
```

---
