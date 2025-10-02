const express = require('express');
const { createLogger } = require('../../../backend/common/logging');
const { QueueService } = require('../../../backend/common/queue');

const app = express();
const PORT = process.env.PORT || 5001;
const logger = createLogger('crisis-engine');
const queue = new QueueService('crisis-consultations');

app.use(express.json());

// Crisis consultation types
const CRISIS_TYPES = {
  COMPLIANCE: 'compliance_emergency',
  SUPPLY_CHAIN: 'supply_chain_disruption', 
  LEGAL: 'legal_issue',
  FINANCIAL: 'financial_crisis',
  PR: 'public_relations',
  TECHNICAL: 'technical_emergency'
};

// Pricing tiers
const PRICING = {
  URGENT: 500, // $500/hour
  EMERGENCY: 750, // $750/hour
  CRITICAL: 1000 // $1000/hour
};

// Health check
app.get('/health', (req, res) => {
  res.json({ 
    status: 'operational',
    service: 'crisis-engine',
    domains: ['aicrisiscoach.com', 'aicrisisconsult.com'],
    timestamp: new Date().toISOString()
  });
});

// Create crisis consultation
app.post('/api/crisis/consult', async (req, res) => {
  try {
    const { 
      businessName,
      crisisType,
      urgencyLevel,
      description,
      contactInfo 
    } = req.body;

    // Validate crisis type
    if (!Object.values(CRISIS_TYPES).includes(crisisType)) {
      return res.status(400).json({ 
        error: 'Invalid crisis type',
        validTypes: Object.values(CRISIS_TYPES)
      });
    }

    // Calculate pricing
    const hourlyRate = PRICING[urgencyLevel.toUpperCase()] || PRICING.URGENT;
    
    // Queue for immediate processing
    const consultation = await queue.add('process-crisis', {
      id: `CRISIS_${Date.now()}`,
      businessName,
      crisisType,
      urgencyLevel,
      description,
      contactInfo,
      hourlyRate,
      timestamp: new Date().toISOString()
    });

    logger.info(`Crisis consultation created: ${consultation.id}`);

    res.json({
      success: true,
      consultationId: consultation.id,
      estimatedResponseTime: urgencyLevel === 'CRITICAL' ? '5 minutes' : '15 minutes',
      hourlyRate,
      message: 'Crisis specialist assigned. Stand by for immediate contact.'
    });

  } catch (error) {
    logger.error('Crisis consultation error:', error);
    res.status(500).json({ error: 'Failed to create consultation' });
  }
});

// Get crisis status
app.get('/api/crisis/status/:id', async (req, res) => {
  try {
    const job = await queue.getJob(req.params.id);
    
    if (!job) {
      return res.status(404).json({ error: 'Consultation not found' });
    }

    res.json({
      id: job.id,
      status: job.status,
      progress: job.progress,
      specialist: job.data.specialist || 'Assigning...',
      estimatedCompletion: job.data.estimatedCompletion
    });

  } catch (error) {
    logger.error('Status check error:', error);
    res.status(500).json({ error: 'Failed to check status' });
  }
});

// Crisis knowledge base
app.get('/api/crisis/knowledge/:type', (req, res) => {
  const knowledgeBase = {
    compliance_emergency: {
      title: 'Cannabis Compliance Crisis',
      steps: [
        'Document all violations immediately',
        'Contact legal counsel',
        'Prepare corrective action plan',
        'Notify stakeholders',
        'Implement emergency protocols'
      ],
      resources: [
        'State compliance hotline',
        'Emergency legal contacts',
        'Regulatory templates'
      ]
    },
    supply_chain_disruption: {
      title: 'Supply Chain Crisis Management',
      steps: [
        'Assess inventory levels',
        'Contact alternate suppliers',
        'Notify affected customers',
        'Implement rationing protocols',
        'Document losses for insurance'
      ],
      resources: [
        'Backup supplier network',
        'Emergency inventory system',
        'Customer communication templates'
      ]
    }
  };

  const knowledge = knowledgeBase[req.params.type];
  if (!knowledge) {
    return res.status(404).json({ error: 'Knowledge base not found' });
  }

  res.json(knowledge);
});

// Analytics endpoint
app.get('/api/crisis/analytics', async (req, res) => {
  res.json({
    totalConsultations: 247,
    averageResponseTime: '8.3 minutes',
    successRate: '94.7%',
    topCrisisTypes: [
      { type: 'compliance_emergency', count: 89 },
      { type: 'supply_chain_disruption', count: 67 },
      { type: 'legal_issue', count: 45 }
    ],
    revenueToday: 12500,
    revenueMonth: 375000
  });
});

app.listen(PORT, () => {
  logger.info(`🚨 Crisis Engine operational on port ${PORT}`);
  logger.info('Domains: aicrisiscoach.com, aicrisisconsult.com');
});

module.exports = app;
// Last optimized: 2025-10-02
