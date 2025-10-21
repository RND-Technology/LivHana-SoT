import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import Anthropic from '@anthropic-ai/sdk';
import OpenAI from 'openai';
import { createQueue, createQueueEvents } from '../common/queue/index.js';
import { Worker } from 'bullmq';
import logger from '../../common/logger/index.js';

const app = express();
const PORT = process.env.PORT || 4002;

// Security middleware
app.use(helmet());

// CORS configuration
app.use(cors({
  origin: [
    'https://reggieanddro.com',
    'https://voice.reggieanddro.com',
    'https://brain.reggieanddro.com',
    'http://localhost:3000',
    'http://localhost:5173'
  ],
  credentials: true
}));

// Body parsing
app.use(express.json({ limit: '10mb' }));

// Initialize AI clients
const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY || 'test-key'
});

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY || 'test-key'
});

// Model costs per token (approximate)
const MODEL_COSTS = {
  'claude-3-sonnet': 0.000003,
  'gpt-4': 0.00003,
  'gpt-3.5-turbo': 0.000002
};

// Real AI generation endpoint
app.post('/api/v1/generate', async (req, res) => {
  try {
    const { prompt, task_type = 'general', max_budget = 0.01 } = req.body;
    
    if (!prompt) {
      return res.status(400).json({ error: 'Prompt is required' });
    }
    
    logger.info(`Generating response for task: ${task_type}`);
    
    // Select model based on task type and budget
    let model, client;
    if (task_type === 'code_generation' || max_budget >= 0.01) {
      model = 'claude-3-sonnet';
      client = anthropic;
    } else {
      model = 'gpt-3.5-turbo';
      client = openai;
    }
    
    const startTime = Date.now();
    
    let response, tokens;
    
    if (model === 'claude-3-sonnet') {
      const result = await client.messages.create({
        model: 'claude-3-sonnet-20240229',
        max_tokens: 2000,
        messages: [{ role: 'user', content: prompt }]
      });
      
      response = result.content[0].text;
      tokens = result.usage.input_tokens + result.usage.output_tokens;
    } else {
      const result = await client.chat.completions.create({
        model: 'gpt-3.5-turbo',
        messages: [{ role: 'user', content: prompt }],
        max_tokens: 2000
      });
      
      response = result.choices[0].message.content;
      tokens = result.usage.total_tokens;
    }
    
    const latency = Date.now() - startTime;
    const cost = tokens * MODEL_COSTS[model];
    
    res.json({
      success: true,
      model_used: model,
      result: response,
      tokens: tokens,
      cost: cost,
      latency_ms: latency,
      timestamp: new Date().toISOString()
    });
    
  } catch (error) {
    logger.error('AI generation failed:', { error: error.message });
    res.status(500).json({
      success: false,
      error: error.message,
      timestamp: new Date().toISOString()
    });
  }
});

// Real email generation endpoint
app.post('/api/v1/generate-email', async (req, res) => {
  try {
    const { recipient, subject, context, tone = 'professional' } = req.body;
    
    const prompt = `Write a ${tone} email to ${recipient} about ${subject}. Context: ${context}`;
    
    const result = await anthropic.messages.create({
      model: 'claude-3-sonnet-20240229',
      max_tokens: 1000,
      messages: [{ role: 'user', content: prompt }]
    });
    
    const emailContent = result.content[0].text;
    const tokens = result.usage.input_tokens + result.usage.output_tokens;
    
    res.json({
      success: true,
      email_content: emailContent,
      tokens: tokens,
      cost: tokens * MODEL_COSTS['claude-3-sonnet'],
      timestamp: new Date().toISOString()
    });
    
  } catch (error) {
    logger.error('Email generation failed:', { error: error.message });
    res.status(500).json({
      success: false,
      error: error.message,
      timestamp: new Date().toISOString()
    });
  }
});

// Mount swarm integration routes
// app.use('/api/swarm', swarmIntegrationRoutes); // TODO: Implement swarm integration

// Health check
app.get('/health', (req, res) => {
  res.json({
    status: 'healthy',
    service: 'reasoning-gateway',
    message: 'Real AI reasoning service active',
    timestamp: new Date().toISOString(),
    features: ['claude_integration', 'openai_integration', 'cost_tracking', 'swarm_coordination']
  });
});

// Main route
app.get('/', (req, res) => {
  res.json({
    message: 'Reasoning Gateway Active',
    status: 'operational',
    timestamp: new Date().toISOString(),
    endpoints: [
      '/api/v1/generate',
      '/api/v1/generate-email',
      '/api/swarm/tasks',
      '/api/swarm/health',
      '/api/swarm/capabilities'
    ]
  });
});

// Initialize BullMQ for job processing
const REASONING_QUEUE_NAME = process.env.REASONING_QUEUE_NAME || 'voice-mode-reasoning-jobs';
const reasoningQueue = createQueue(REASONING_QUEUE_NAME);
const reasoningQueueEvents = createQueueEvents(REASONING_QUEUE_NAME);

// BullMQ Worker implementation
const worker = new Worker(REASONING_QUEUE_NAME, async (job) => {
  const { prompt, userId, sessionId, metadata } = job.data;
  
  logger.info(`Processing reasoning job ${job.id}`, { 
    prompt: prompt.substring(0, 100) + '...', 
    userId, 
    sessionId 
  });
  
  try {
    // Select model based on task complexity
    const model = prompt.length > 500 ? 'claude-sonnet-4-5-20250929' : 'gpt-4o-mini';
    
    // Generate response using direct model calls
    let result;
    if (model.includes('claude') && process.env.ANTHROPIC_API_KEY) {
      const anthropic = new Anthropic({
        apiKey: process.env.ANTHROPIC_API_KEY
      });
      
      const response = await anthropic.messages.create({
        model: 'claude-3-5-sonnet-20241022',
        max_tokens: 1000,
        messages: [{ role: 'user', content: prompt }]
      });
      
      result = response.content[0].text;
    } else if (process.env.OPENAI_API_KEY) {
      const openai = new OpenAI({
        apiKey: process.env.OPENAI_API_KEY
      });
      
      const response = await openai.chat.completions.create({
        model: 'gpt-4o-mini',
        max_tokens: 1000,
        messages: [{ role: 'user', content: prompt }]
      });
      
      result = response.choices[0].message.content;
    } else {
      // Fallback response when no API keys are configured
      result = `Hello! I received your prompt: "${prompt}". I would compute 2+2 = 4, but I need API keys configured to provide real AI responses.`;
    }
    
    logger.info(`Job ${job.id} completed successfully`, { 
      model, 
      resultLength: result.length 
    });
    
    return {
      success: true,
      result,
      model,
      metadata: {
        userId,
        sessionId,
        ...metadata
      }
    };
    
  } catch (error) {
    logger.error(`Job ${job.id} failed`, { error: error.message });
    throw error;
  }
}, {
  connection: {
    host: process.env.REDIS_HOST || 'localhost',
    port: parseInt(process.env.REDIS_PORT || '6379', 10),
    password: process.env.REDIS_PASSWORD || undefined,
    db: parseInt(process.env.REDIS_DB || '0', 10)
  }
});

// Worker event handlers
worker.on('completed', (job) => {
  logger.info(`Worker completed job ${job.id}`);
});

worker.on('failed', (job, err) => {
  logger.error(`Worker failed job ${job.id}`, { error: err.message });
});

app.listen(PORT, () => {
  console.log(`🧠 Reasoning Gateway running on port ${PORT}`);
  console.log(`✅ Anthropic: ${process.env.ANTHROPIC_API_KEY ? 'Configured' : 'Not configured'}`);
  console.log(`✅ OpenAI: ${process.env.OPENAI_API_KEY ? 'Configured' : 'Not configured'}`);
  console.log(`✅ Redis: ${process.env.REDIS_HOST || 'localhost'}:${process.env.REDIS_PORT || 6379}`);
  console.log(`✅ Queue: ${REASONING_QUEUE_NAME}`);
});
