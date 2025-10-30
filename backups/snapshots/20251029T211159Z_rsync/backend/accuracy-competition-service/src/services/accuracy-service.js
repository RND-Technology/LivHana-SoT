/**
 * Accuracy Service
 * Core accuracy measurement and calculation engine
 * ROI/$/Day is KING. Cash flow (passive profits) RULES business decisions.
 */

const moment = require('moment');
const winston = require('winston');

class AccuracyService {
  constructor(databaseService) {
    this.db = databaseService;
    this.logger = winston.createLogger({
      level: 'info',
      format: winston.format.combine(
        winston.format.timestamp(),
        winston.format.json()
      ),
      transports: [
        new winston.transports.Console(),
        new winston.transports.File({ filename: 'logs/accuracy-service.log' })
      ]
    });
    
    // Accuracy weights (ROI/$/Day is KING)
    this.weights = {
      roi_per_day: 0.40,    // 40% - Primary KPI
      timeframe: 0.25,       // 25% - Time accuracy
      cost: 0.20,           // 20% - Cost accuracy
      cash_flow: 0.15       // 15% - Cash flow accuracy
    };
  }

  /**
   * Submit a projection
   */
  async submitProjection(projection) {
    try {
      // Validate projection
      this.validateProjection(projection);
      
      // Store projection
      const result = await this.db.query(`
        INSERT INTO projections (
          id, participant, metric, value, unit, timeframe, 
          confidence, context, timestamp, created_at
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `, [
        projection.id,
        projection.participant,
        projection.metric,
        projection.value,
        projection.unit || 'USD',
        projection.timeframe || '30d',
        projection.confidence || 0.8,
        JSON.stringify(projection.context || {}),
        projection.timestamp,
        new Date().toISOString()
      ]);

      this.logger.info('Projection submitted', {
        id: projection.id,
        participant: projection.participant,
        metric: projection.metric,
        value: projection.value
      });

      return result;
    } catch (error) {
      this.logger.error('Projection submission failed', { error: error.message });
      throw error;
    }
  }

  /**
   * Submit an actual result
   */
  async submitActual(actual) {
    try {
      // Validate actual
      this.validateActual(actual);
      
      // Store actual
      const result = await this.db.query(`
        INSERT INTO actuals (
          id, participant, metric, value, unit, timeframe,
          context, timestamp, created_at
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
      `, [
        actual.id,
        actual.participant,
        actual.metric,
        actual.value,
        actual.unit || 'USD',
        actual.timeframe || '30d',
        JSON.stringify(actual.context || {}),
        actual.timestamp,
        new Date().toISOString()
      ]);

      this.logger.info('Actual result submitted', {
        id: actual.id,
        participant: actual.participant,
        metric: actual.metric,
        value: actual.value
      });

      return result;
    } catch (error) {
      this.logger.error('Actual submission failed', { error: error.message });
      throw error;
    }
  }

  /**
   * Calculate accuracy between projection and actual
   */
  async calculateAccuracy(projectionId, actualId) {
    try {
      // Get projection and actual
      const projection = await this.db.query(`
        SELECT * FROM projections WHERE id = ?
      `, [projectionId]);

      const actual = await this.db.query(`
        SELECT * FROM actuals WHERE id = ?
      `, [actualId]);

      if (!projection || !actual) {
        throw new Error('Projection or actual not found');
      }

      // Calculate accuracy score
      const accuracyScore = this.calculateAccuracyScore(
        projection.value,
        actual.value,
        projection.metric
      );

      // Store accuracy result
      const result = await this.db.query(`
        INSERT INTO accuracy_scores (
          id, projection_id, actual_id, participant, metric,
          projected_value, actual_value, accuracy_score, 
          timestamp, created_at
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `, [
        require('uuid').v4(),
        projectionId,
        actualId,
        projection.participant,
        projection.metric,
        projection.value,
        actual.value,
        accuracyScore,
        new Date().toISOString(),
        new Date().toISOString()
      ]);

      this.logger.info('Accuracy calculated', {
        projectionId,
        actualId,
        participant: projection.participant,
        metric: projection.metric,
        accuracyScore
      });

      return {
        accuracyScore,
        projection,
        actual,
        result
      };
    } catch (error) {
      this.logger.error('Accuracy calculation failed', { error: error.message });
      throw error;
    }
  }

  /**
   * Calculate accuracy score for a specific metric
   */
  calculateAccuracyScore(projectedValue, actualValue, metric) {
    if (projectedValue === 0 && actualValue === 0) {
      return 100.0; // Perfect accuracy
    }

    if (projectedValue === 0 || actualValue === 0) {
      return 0.0; // Complete miss
    }

    // Calculate accuracy based on metric type
    switch (metric) {
      case 'roi_per_day':
        return this.calculateROIAccuracy(projectedValue, actualValue);
      case 'timeframe':
        return this.calculateTimeframeAccuracy(projectedValue, actualValue);
      case 'cost':
        return this.calculateCostAccuracy(projectedValue, actualValue);
      case 'cash_flow':
        return this.calculateCashFlowAccuracy(projectedValue, actualValue);
      default:
        return this.calculateGenericAccuracy(projectedValue, actualValue);
    }
  }

  /**
   * Calculate ROI/$/Day accuracy (KING metric)
   */
  calculateROIAccuracy(projectedROI, actualROI) {
    // ROI accuracy is critical - use logarithmic scale for better sensitivity
    const ratio = Math.min(projectedROI, actualROI) / Math.max(projectedROI, actualROI);
    const accuracy = Math.pow(ratio, 0.5) * 100; // Square root for better sensitivity
    
    return Math.round(accuracy * 100) / 100; // Round to 2 decimal places
  }

  /**
   * Calculate timeframe accuracy
   */
  calculateTimeframeAccuracy(projectedDays, actualDays) {
    const ratio = Math.min(projectedDays, actualDays) / Math.max(projectedDays, actualDays);
    return Math.round(ratio * 100 * 100) / 100;
  }

  /**
   * Calculate cost accuracy
   */
  calculateCostAccuracy(projectedCost, actualCost) {
    const ratio = Math.min(projectedCost, actualCost) / Math.max(projectedCost, actualCost);
    return Math.round(ratio * 100 * 100) / 100;
  }

  /**
   * Calculate cash flow accuracy
   */
  calculateCashFlowAccuracy(projectedCashFlow, actualCashFlow) {
    const ratio = Math.min(projectedCashFlow, actualCashFlow) / Math.max(projectedCashFlow, actualCashFlow);
    return Math.round(ratio * 100 * 100) / 100;
  }

  /**
   * Calculate generic accuracy
   */
  calculateGenericAccuracy(projectedValue, actualValue) {
    const ratio = Math.min(projectedValue, actualValue) / Math.max(projectedValue, actualValue);
    return Math.round(ratio * 100 * 100) / 100;
  }

  /**
   * Calculate composite accuracy score
   */
  async calculateCompositeAccuracy(participant, timeframe = '30d') {
    try {
      const scores = await this.db.query(`
        SELECT metric, AVG(accuracy_score) as avg_accuracy
        FROM accuracy_scores 
        WHERE participant = ? 
        AND created_at >= datetime('now', '-${timeframe}')
        GROUP BY metric
      `, [participant]);

      let compositeScore = 0;
      let totalWeight = 0;

      scores.forEach(score => {
        const weight = this.weights[score.metric] || 0;
        compositeScore += score.avg_accuracy * weight;
        totalWeight += weight;
      });

      return totalWeight > 0 ? compositeScore / totalWeight : 0;
    } catch (error) {
      this.logger.error('Composite accuracy calculation failed', { error: error.message });
      throw error;
    }
  }

  /**
   * Get accuracy trends
   */
  async getAccuracyTrends(period = '30d', metric = 'roi_per_day') {
    try {
      const trends = await this.db.query(`
        SELECT 
          DATE(created_at) as date,
          AVG(accuracy_score) as avg_accuracy,
          COUNT(*) as count
        FROM accuracy_scores 
        WHERE metric = ? 
        AND created_at >= datetime('now', '-${period}')
        GROUP BY DATE(created_at)
        ORDER BY date DESC
      `, [metric]);

      return trends;
    } catch (error) {
      this.logger.error('Accuracy trends fetch failed', { error: error.message });
      throw error;
    }
  }

  /**
   * Get improvement recommendations
   */
  async getImprovementRecommendations(participantId) {
    try {
      // Get participant's accuracy by metric
      const accuracyByMetric = await this.db.query(`
        SELECT 
          metric,
          AVG(accuracy_score) as avg_accuracy,
          COUNT(*) as count
        FROM accuracy_scores 
        WHERE participant = ? 
        AND created_at >= datetime('now', '-30d')
        GROUP BY metric
        ORDER BY avg_accuracy ASC
      `, [participantId]);

      // Get best performers for each metric
      const bestPerformers = await this.db.query(`
        SELECT 
          metric,
          participant,
          AVG(accuracy_score) as avg_accuracy
        FROM accuracy_scores 
        WHERE created_at >= datetime('now', '-30d')
        GROUP BY metric, participant
        HAVING avg_accuracy = (
          SELECT MAX(avg_accuracy) 
          FROM (
            SELECT AVG(accuracy_score) as avg_accuracy
            FROM accuracy_scores 
            WHERE metric = accuracy_scores.metric 
            AND created_at >= datetime('now', '-30d')
            GROUP BY participant
          )
        )
      `);

      // Generate recommendations
      const recommendations = accuracyByMetric.map(metric => {
        const bestPerformer = bestPerformers.find(bp => bp.metric === metric.metric);
        return {
          metric: metric.metric,
          currentAccuracy: metric.avg_accuracy,
          count: metric.count,
          recommendation: this.generateRecommendation(metric, bestPerformer),
          priority: this.weights[metric.metric] || 0.1
        };
      });

      return recommendations.sort((a, b) => b.priority - a.priority);
    } catch (error) {
      this.logger.error('Recommendations generation failed', { error: error.message });
      throw error;
    }
  }

  /**
   * Generate improvement recommendation
   */
  generateRecommendation(metric, bestPerformer) {
    const recommendations = {
      roi_per_day: `Focus on ROI/$/Day accuracy - this is your KING metric. Current: ${metric.avg_accuracy.toFixed(1)}%. Best performer: ${bestPerformer?.avg_accuracy.toFixed(1)}%`,
      timeframe: `Improve timeframe estimation accuracy. Current: ${metric.avg_accuracy.toFixed(1)}%. Best performer: ${bestPerformer?.avg_accuracy.toFixed(1)}%`,
      cost: `Enhance cost projection accuracy. Current: ${metric.avg_accuracy.toFixed(1)}%. Best performer: ${bestPerformer?.avg_accuracy.toFixed(1)}%`,
      cash_flow: `Optimize cash flow prediction accuracy. Current: ${metric.avg_accuracy.toFixed(1)}%. Best performer: ${bestPerformer?.avg_accuracy.toFixed(1)}%`
    };

    return recommendations[metric.metric] || 'Focus on improving accuracy across all metrics';
  }

  /**
   * Calculate daily accuracy for all participants
   */
  async calculateDailyAccuracy() {
    try {
      const participants = await this.db.query(`
        SELECT DISTINCT participant FROM accuracy_scores
      `);

      for (const participant of participants) {
        const compositeScore = await this.calculateCompositeAccuracy(participant.participant, '1d');
        
        await this.db.query(`
          INSERT INTO daily_accuracy (
            id, participant, composite_score, date, created_at
          ) VALUES (?, ?, ?, ?, ?)
        `, [
          require('uuid').v4(),
          participant.participant,
          compositeScore,
          moment().format('YYYY-MM-DD'),
          new Date().toISOString()
        ]);
      }

      this.logger.info('Daily accuracy calculation completed');
    } catch (error) {
      this.logger.error('Daily accuracy calculation failed', { error: error.message });
      throw error;
    }
  }

  /**
   * Validate projection
   */
  validateProjection(projection) {
    if (!projection.participant) {
      throw new Error('Participant is required');
    }
    if (!projection.metric) {
      throw new Error('Metric is required');
    }
    if (typeof projection.value !== 'number') {
      throw new Error('Value must be a number');
    }
    if (projection.value < 0) {
      throw new Error('Value cannot be negative');
    }
  }

  /**
   * Validate actual
   */
  validateActual(actual) {
    if (!actual.participant) {
      throw new Error('Participant is required');
    }
    if (!actual.metric) {
      throw new Error('Metric is required');
    }
    if (typeof actual.value !== 'number') {
      throw new Error('Value must be a number');
    }
    if (actual.value < 0) {
      throw new Error('Value cannot be negative');
    }
  }
}

module.exports = AccuracyService;
