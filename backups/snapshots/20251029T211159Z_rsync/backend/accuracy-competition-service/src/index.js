#!/usr/bin/env node
/**
 * RPM Accuracy Competition Service
 * ROI/$/Day is KING. Cash flow (passive profits) RULES business decisions.
 * 
 * Systematic accuracy measurement with RPM DNA baked in:
 * - Models vs Humans vs Selves competition
 * - Projected vs Actual: Timeframe, Cost, ROI
 * - Primary KPI: ROI/$/Day accuracy
 * - Secondary KPI: Cash flow projection accuracy
 * - Guardrails: Values, Results, Purpose compliance
 */

const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const compression = require('compression');
const winston = require('winston');
const cron = require('node-cron');
const { v4: uuidv4 } = require('uuid');

// Import services
const AccuracyService = require('./services/accuracy-service');
const CompetitionService = require('./services/competition-service');
const LeaderboardService = require('./services/leaderboard-service');
const DatabaseService = require('./services/database-service');

// Configure logging
const logger = winston.createLogger({
  level: 'info',
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.json()
  ),
  transports: [
    new winston.transports.Console(),
    new winston.transports.File({ filename: 'logs/accuracy-competition.log' })
  ]
});

// Initialize Express app
const app = express();
const PORT = process.env.PORT || 8001;

// Middleware
app.use(helmet());
app.use(compression());
app.use(cors({
  origin: process.env.ALLOWED_ORIGINS?.split(',') || ['http://localhost:3000', 'http://localhost:8080'],
  credentials: true
}));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// Request logging
app.use((req, res, next) => {
  logger.info(`${req.method} ${req.path}`, {
    ip: req.ip,
    userAgent: req.get('User-Agent'),
    timestamp: new Date().toISOString()
  });
  next();
});

// Initialize services
const databaseService = new DatabaseService();
const accuracyService = new AccuracyService(databaseService);
const competitionService = new CompetitionService(databaseService);
const leaderboardService = new LeaderboardService(databaseService);

// Health check
app.get('/health', (req, res) => {
  res.json({
    status: 'healthy',
    service: 'accuracy-competition-service',
    version: '1.0.0',
    timestamp: new Date().toISOString(),
    features: [
      'accuracy_measurement',
      'competition_management',
      'leaderboard_tracking',
      'roi_cashflow_metrics'
    ]
  });
});

// ============================================================================
// ACCURACY MEASUREMENT ENDPOINTS
// ============================================================================

// Submit projection
app.post('/api/v1/projections', async (req, res) => {
  try {
    const projection = req.body;
    projection.id = uuidv4();
    projection.timestamp = new Date().toISOString();
    
    const result = await accuracyService.submitProjection(projection);
    
    logger.info('Projection submitted', {
      id: projection.id,
      participant: projection.participant,
      metric: projection.metric,
      value: projection.value
    });
    
    res.json({
      success: true,
      projection: result,
      message: 'Projection submitted successfully'
    });
  } catch (error) {
    logger.error('Projection submission failed', { error: error.message });
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// Submit actual result
app.post('/api/v1/actuals', async (req, res) => {
  try {
    const actual = req.body;
    actual.id = uuidv4();
    actual.timestamp = new Date().toISOString();
    
    const result = await accuracyService.submitActual(actual);
    
    logger.info('Actual result submitted', {
      id: actual.id,
      participant: actual.participant,
      metric: actual.metric,
      value: actual.value
    });
    
    res.json({
      success: true,
      actual: result,
      message: 'Actual result submitted successfully'
    });
  } catch (error) {
    logger.error('Actual submission failed', { error: error.message });
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// Calculate accuracy score
app.post('/api/v1/accuracy/calculate', async (req, res) => {
  try {
    const { projectionId, actualId } = req.body;
    
    const accuracyScore = await accuracyService.calculateAccuracy(projectionId, actualId);
    
    res.json({
      success: true,
      accuracy: accuracyScore,
      message: 'Accuracy calculated successfully'
    });
  } catch (error) {
    logger.error('Accuracy calculation failed', { error: error.message });
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// ============================================================================
// COMPETITION MANAGEMENT ENDPOINTS
// ============================================================================

// Create competition
app.post('/api/v1/competitions', async (req, res) => {
  try {
    const competition = req.body;
    competition.id = uuidv4();
    competition.createdAt = new Date().toISOString();
    
    const result = await competitionService.createCompetition(competition);
    
    logger.info('Competition created', {
      id: competition.id,
      name: competition.name,
      type: competition.type
    });
    
    res.json({
      success: true,
      competition: result,
      message: 'Competition created successfully'
    });
  } catch (error) {
    logger.error('Competition creation failed', { error: error.message });
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// Join competition
app.post('/api/v1/competitions/:id/join', async (req, res) => {
  try {
    const { id } = req.params;
    const { participant } = req.body;
    
    const result = await competitionService.joinCompetition(id, participant);
    
    logger.info('Participant joined competition', {
      competitionId: id,
      participant: participant
    });
    
    res.json({
      success: true,
      result: result,
      message: 'Joined competition successfully'
    });
  } catch (error) {
    logger.error('Competition join failed', { error: error.message });
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// ============================================================================
// LEADERBOARD ENDPOINTS
// ============================================================================

// Get current leaderboard
app.get('/api/v1/leaderboard', async (req, res) => {
  try {
    const { type = 'daily', limit = 50 } = req.query;
    
    const leaderboard = await leaderboardService.getLeaderboard(type, limit);
    
    res.json({
      success: true,
      leaderboard: leaderboard,
      type: type,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    logger.error('Leaderboard fetch failed', { error: error.message });
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// Get participant stats
app.get('/api/v1/participants/:id/stats', async (req, res) => {
  try {
    const { id } = req.params;
    const { period = '7d' } = req.query;
    
    const stats = await leaderboardService.getParticipantStats(id, period);
    
    res.json({
      success: true,
      participant: id,
      stats: stats,
      period: period,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    logger.error('Participant stats fetch failed', { error: error.message });
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// ============================================================================
// ANALYTICS ENDPOINTS
// ============================================================================

// Get accuracy trends
app.get('/api/v1/analytics/trends', async (req, res) => {
  try {
    const { period = '30d', metric = 'roi_per_day' } = req.query;
    
    const trends = await accuracyService.getAccuracyTrends(period, metric);
    
    res.json({
      success: true,
      trends: trends,
      period: period,
      metric: metric,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    logger.error('Analytics trends fetch failed', { error: error.message });
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// Get improvement recommendations
app.get('/api/v1/analytics/recommendations/:participantId', async (req, res) => {
  try {
    const { participantId } = req.params;
    
    const recommendations = await accuracyService.getImprovementRecommendations(participantId);
    
    res.json({
      success: true,
      participant: participantId,
      recommendations: recommendations,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    logger.error('Recommendations fetch failed', { error: error.message });
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// ============================================================================
// SCHEDULED TASKS
// ============================================================================

// Daily accuracy calculation (runs at midnight)
cron.schedule('0 0 * * *', async () => {
  logger.info('Running daily accuracy calculation');
  try {
    await accuracyService.calculateDailyAccuracy();
    await leaderboardService.updateDailyLeaderboard();
    logger.info('Daily accuracy calculation completed');
  } catch (error) {
    logger.error('Daily accuracy calculation failed', { error: error.message });
  }
});

// Weekly competition results (runs Sundays at 6 AM)
cron.schedule('0 6 * * 0', async () => {
  logger.info('Running weekly competition results');
  try {
    await competitionService.calculateWeeklyResults();
    await leaderboardService.updateWeeklyLeaderboard();
    logger.info('Weekly competition results completed');
  } catch (error) {
    logger.error('Weekly competition results failed', { error: error.message });
  }
});

// ============================================================================
// ERROR HANDLING
// ============================================================================

// eslint-disable-next-line no-unused-vars
app.use((err, req, res, _next) => {
  logger.error('Unhandled error', {
    error: err.message,
    stack: err.stack,
    path: req.path,
    method: req.method
  });
  
  res.status(500).json({
    success: false,
    error: 'Internal server error',
    message: process.env.NODE_ENV === 'development' ? err.message : 'Something went wrong'
  });
});

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({
    success: false,
    error: 'Not found',
    message: `Route ${req.method} ${req.originalUrl} not found`
  });
});

// ============================================================================
// STARTUP
// ============================================================================

async function startServer() {
  try {
    // Initialize database
    await databaseService.initialize();
    logger.info('Database initialized');
    
    // Start server
    app.listen(PORT, () => {
      logger.info(`🎯 Accuracy Competition Service running on port ${PORT}`);
      logger.info(`📊 ROI/$/Day is KING. Cash flow RULES business decisions.`);
      logger.info(`🏆 Competition system ready for Models vs Humans vs Selves`);
      logger.info(`🚀 RPM DNA baked in. Accuracy measurement active.`);
    });
  } catch (error) {
    logger.error('Server startup failed', { error: error.message });
    process.exit(1);
  }
}

// Graceful shutdown
process.on('SIGTERM', () => {
  logger.info('SIGTERM received, shutting down gracefully');
  process.exit(0);
});

process.on('SIGINT', () => {
  logger.info('SIGINT received, shutting down gracefully');
  process.exit(0);
});

// Start the server
startServer();

module.exports = app;
