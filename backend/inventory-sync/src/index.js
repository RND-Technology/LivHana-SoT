import express from 'express';

const app = express();
app.use(express.json());

// Real-time inventory synchronization
const inventorySources = {
  'square': { apiKey: process.env.SQUARE_API_KEY, lastSync: null },
  'lightspeed': { apiKey: process.env.LIGHTSPEED_API_KEY, lastSync: null },
  'ecwid': { apiKey: process.env.ECWID_API_KEY, lastSync: null }
};

// Sync inventory across all platforms
app.post('/api/v1/sync-inventory', async (req, res) => {
  try {
    const { source } = req.body;
    
    const syncResults = [];
    
    if (source) {
      // Sync specific source
      const result = await syncInventorySource(source);
      syncResults.push(result);
    } else {
      // Sync all sources
      for (const [sourceName] of Object.entries(inventorySources)) {
        const result = await syncInventorySource(sourceName);
        syncResults.push(result);
      }
    }
    
    res.json({
      success: true,
      syncResults,
      timestamp: new Date().toISOString()
    });
    
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

async function syncInventorySource(source) {
  // Simulate inventory sync
  const startTime = Date.now();
  
  // Mock sync process
  await new Promise(resolve => setTimeout(resolve, 1000));
  
  const endTime = Date.now();
  
  return {
    source,
    status: 'success',
    itemsSynced: Math.floor(Math.random() * 1000) + 100,
    duration: endTime - startTime,
    lastSync: new Date().toISOString()
  };
}

// Get inventory status
app.get('/api/v1/inventory-status', async (req, res) => {
  try {
    const status = {};
    
    for (const [source, config] of Object.entries(inventorySources)) {
      status[source] = {
        connected: true,
        lastSync: config.lastSync || new Date().toISOString(),
        itemCount: Math.floor(Math.random() * 5000) + 1000,
        status: 'operational'
      };
    }
    
    res.json({
      success: true,
      sources: status,
      overallStatus: 'operational'
    });
    
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// Health check
app.get('/health', (req, res) => {
  res.json({
    status: 'healthy',
    service: 'inventory-sync',
    message: 'Real-time inventory synchronization operational'
  });
});

const PORT = process.env.PORT || 8080;
app.listen(PORT, () => {
  console.log(`📦 Inventory Sync running on port ${PORT}`);
});
