/**
 * Leaderboard Service
 * Manages leaderboards and participant rankings
 * ROI/$/Day is KING. Cash flow (passive profits) RULES business decisions.
 */

const moment = require('moment');
const winston = require('winston');

class LeaderboardService {
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
        new winston.transports.File({ filename: 'logs/leaderboard-service.log' })
      ]
    });
  }

  /**
   * Get current leaderboard
   */
  async getLeaderboard(type = 'daily', limit = 50) {
    try {
      let query;
      let params = [];

      switch (type) {
        case 'daily':
          query = `
            SELECT 
              participant,
              composite_score,
              roi_accuracy,
              timeframe_accuracy,
              cost_accuracy,
              cash_flow_accuracy,
              rank,
              date
            FROM leaderboard 
            WHERE period = 'daily' 
            AND date = ?
            ORDER BY rank ASC
            LIMIT ?
          `;
          params = [moment().format('YYYY-MM-DD'), limit];
          break;

        case 'weekly':
          query = `
            SELECT 
              participant,
              composite_score,
              roi_accuracy,
              timeframe_accuracy,
              cost_accuracy,
              cash_flow_accuracy,
              rank,
              date
            FROM leaderboard 
            WHERE period = 'weekly' 
            AND date = ?
            ORDER BY rank ASC
            LIMIT ?
          `;
          params = [moment().format('YYYY-MM-DD'), limit];
          break;

        case 'monthly':
          query = `
            SELECT 
              participant,
              composite_score,
              roi_accuracy,
              timeframe_accuracy,
              cost_accuracy,
              cash_flow_accuracy,
              rank,
              date
            FROM leaderboard 
            WHERE period = 'monthly' 
            AND date = ?
            ORDER BY rank ASC
            LIMIT ?
          `;
          params = [moment().format('YYYY-MM-DD'), limit];
          break;

        case 'all_time':
          query = `
            SELECT 
              participant,
              AVG(composite_score) as composite_score,
              AVG(roi_accuracy) as roi_accuracy,
              AVG(timeframe_accuracy) as timeframe_accuracy,
              AVG(cost_accuracy) as cost_accuracy,
              AVG(cash_flow_accuracy) as cash_flow_accuracy,
              COUNT(*) as total_entries
            FROM leaderboard 
            WHERE period = 'daily'
            GROUP BY participant
            ORDER BY composite_score DESC
            LIMIT ?
          `;
          params = [limit];
          break;

        default:
          throw new Error(`Invalid leaderboard type: ${type}`);
      }

      const results = await this.db.query(query, params);
      
      // Add rank if not present
      const leaderboard = results.map((entry, index) => ({
        ...entry,
        rank: entry.rank || index + 1
      }));

      this.logger.info('Leaderboard fetched', {
        type,
        limit,
        count: leaderboard.length
      });

      return leaderboard;
    } catch (error) {
      this.logger.error('Leaderboard fetch failed', { error: error.message });
      throw error;
    }
  }

  /**
   * Get participant stats
   */
  async getParticipantStats(participantId, period = '7d') {
    try {
      const stats = await this.db.query(`
        SELECT 
          metric,
          AVG(accuracy_score) as avg_accuracy,
          MIN(accuracy_score) as min_accuracy,
          MAX(accuracy_score) as max_accuracy,
          COUNT(*) as total_entries,
          STDDEV(accuracy_score) as std_deviation
        FROM accuracy_scores 
        WHERE participant = ? 
        AND created_at >= datetime('now', '-${period}')
        GROUP BY metric
      `, [participantId]);

      // Get composite score trend
      const trend = await this.db.query(`
        SELECT 
          DATE(created_at) as date,
          AVG(accuracy_score) as avg_accuracy
        FROM accuracy_scores 
        WHERE participant = ? 
        AND created_at >= datetime('now', '-${period}')
        GROUP BY DATE(created_at)
        ORDER BY date ASC
      `, [participantId]);

      // Get improvement rate
      const improvement = await this.calculateImprovementRate(participantId, period);

      // Get current rank
      const currentRank = await this.getCurrentRank(participantId);

      // Get best performance
      const bestPerformance = await this.db.query(`
        SELECT 
          metric,
          MAX(accuracy_score) as best_accuracy,
          DATE(created_at) as best_date
        FROM accuracy_scores 
        WHERE participant = ? 
        AND created_at >= datetime('now', '-${period}')
        GROUP BY metric
      `, [participantId]);

      this.logger.info('Participant stats fetched', {
        participant: participantId,
        period,
        metricsCount: stats.length
      });

      return {
        participant: participantId,
        period,
        stats,
        trend,
        improvement,
        currentRank,
        bestPerformance,
        timestamp: new Date().toISOString()
      };
    } catch (error) {
      this.logger.error('Participant stats fetch failed', { error: error.message });
      throw error;
    }
  }

  /**
   * Calculate improvement rate
   */
  async calculateImprovementRate(participantId, period = '7d') {
    try {
      const firstHalf = await this.db.query(`
        SELECT AVG(accuracy_score) as avg_accuracy
        FROM accuracy_scores 
        WHERE participant = ? 
        AND created_at >= datetime('now', '-${period}')
        AND created_at <= datetime('now', '-${period.replace('d', '')/2}d')
      `, [participantId]);

      const secondHalf = await this.db.query(`
        SELECT AVG(accuracy_score) as avg_accuracy
        FROM accuracy_scores 
        WHERE participant = ? 
        AND created_at >= datetime('now', '-${period.replace('d', '')/2}d')
      `, [participantId]);

      if (firstHalf.length === 0 || secondHalf.length === 0) {
        return 0;
      }

      const firstAvg = firstHalf[0].avg_accuracy;
      const secondAvg = secondHalf[0].avg_accuracy;

      if (firstAvg === 0) {
        return secondAvg > 0 ? 100 : 0;
      }

      const improvementRate = ((secondAvg - firstAvg) / firstAvg) * 100;
      return Math.round(improvementRate * 100) / 100;
    } catch (error) {
      this.logger.error('Improvement rate calculation failed', { error: error.message });
      return 0;
    }
  }

  /**
   * Get current rank
   */
  async getCurrentRank(participantId) {
    try {
      const rank = await this.db.queryOne(`
        SELECT rank
        FROM leaderboard 
        WHERE participant = ? 
        AND period = 'daily'
        AND date = ?
      `, [participantId, moment().format('YYYY-MM-DD')]);

      return rank ? rank.rank : null;
    } catch (error) {
      this.logger.error('Current rank fetch failed', { error: error.message });
      return null;
    }
  }

  /**
   * Update daily leaderboard
   */
  async updateDailyLeaderboard() {
    try {
      const date = moment().format('YYYY-MM-DD');
      
      // Get all participants with their composite scores
      const participants = await this.db.query(`
        SELECT 
          participant,
          AVG(accuracy_score) as composite_score,
          AVG(CASE WHEN metric = 'roi_per_day' THEN accuracy_score END) as roi_accuracy,
          AVG(CASE WHEN metric = 'timeframe' THEN accuracy_score END) as timeframe_accuracy,
          AVG(CASE WHEN metric = 'cost' THEN accuracy_score END) as cost_accuracy,
          AVG(CASE WHEN metric = 'cash_flow' THEN accuracy_score END) as cash_flow_accuracy
        FROM accuracy_scores 
        WHERE DATE(created_at) = ?
        GROUP BY participant
        ORDER BY composite_score DESC
      `, [date]);

      // Clear existing daily leaderboard
      await this.db.run(`
        DELETE FROM leaderboard 
        WHERE period = 'daily' AND date = ?
      `, [date]);

      // Insert new rankings
      for (let i = 0; i < participants.length; i++) {
        const participant = participants[i];
        await this.db.run(`
          INSERT INTO leaderboard (
            id, participant, composite_score, roi_accuracy, timeframe_accuracy,
            cost_accuracy, cash_flow_accuracy, rank, period, date, created_at
          ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        `, [
          require('uuid').v4(),
          participant.participant,
          participant.composite_score || 0,
          participant.roi_accuracy || 0,
          participant.timeframe_accuracy || 0,
          participant.cost_accuracy || 0,
          participant.cash_flow_accuracy || 0,
          i + 1,
          'daily',
          date,
          new Date().toISOString()
        ]);
      }

      this.logger.info('Daily leaderboard updated', {
        date,
        participantsCount: participants.length
      });
    } catch (error) {
      this.logger.error('Daily leaderboard update failed', { error: error.message });
      throw error;
    }
  }

  /**
   * Update weekly leaderboard
   */
  async updateWeeklyLeaderboard() {
    try {
      const weekStart = moment().startOf('week').format('YYYY-MM-DD');
      const weekEnd = moment().endOf('week').format('YYYY-MM-DD');
      
      // Get all participants with their weekly composite scores
      const participants = await this.db.query(`
        SELECT 
          participant,
          AVG(accuracy_score) as composite_score,
          AVG(CASE WHEN metric = 'roi_per_day' THEN accuracy_score END) as roi_accuracy,
          AVG(CASE WHEN metric = 'timeframe' THEN accuracy_score END) as timeframe_accuracy,
          AVG(CASE WHEN metric = 'cost' THEN accuracy_score END) as cost_accuracy,
          AVG(CASE WHEN metric = 'cash_flow' THEN accuracy_score END) as cash_flow_accuracy
        FROM accuracy_scores 
        WHERE DATE(created_at) >= ? AND DATE(created_at) <= ?
        GROUP BY participant
        ORDER BY composite_score DESC
      `, [weekStart, weekEnd]);

      // Clear existing weekly leaderboard
      await this.db.run(`
        DELETE FROM leaderboard 
        WHERE period = 'weekly' AND date = ?
      `, [weekEnd]);

      // Insert new rankings
      for (let i = 0; i < participants.length; i++) {
        const participant = participants[i];
        await this.db.run(`
          INSERT INTO leaderboard (
            id, participant, composite_score, roi_accuracy, timeframe_accuracy,
            cost_accuracy, cash_flow_accuracy, rank, period, date, created_at
          ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        `, [
          require('uuid').v4(),
          participant.participant,
          participant.composite_score || 0,
          participant.roi_accuracy || 0,
          participant.timeframe_accuracy || 0,
          participant.cost_accuracy || 0,
          participant.cash_flow_accuracy || 0,
          i + 1,
          'weekly',
          weekEnd,
          new Date().toISOString()
        ]);
      }

      this.logger.info('Weekly leaderboard updated', {
        weekStart,
        weekEnd,
        participantsCount: participants.length
      });
    } catch (error) {
      this.logger.error('Weekly leaderboard update failed', { error: error.message });
      throw error;
    }
  }

  /**
   * Get top performers by metric
   */
  async getTopPerformersByMetric(metric, limit = 10) {
    try {
      const performers = await this.db.query(`
        SELECT 
          participant,
          AVG(accuracy_score) as avg_accuracy,
          COUNT(*) as total_entries,
          MAX(accuracy_score) as best_accuracy,
          MIN(accuracy_score) as worst_accuracy
        FROM accuracy_scores 
        WHERE metric = ?
        AND created_at >= datetime('now', '-30d')
        GROUP BY participant
        ORDER BY avg_accuracy DESC
        LIMIT ?
      `, [metric, limit]);

      this.logger.info('Top performers fetched', {
        metric,
        limit,
        count: performers.length
      });

      return performers;
    } catch (error) {
      this.logger.error('Top performers fetch failed', { error: error.message });
      throw error;
    }
  }

  /**
   * Get competition standings
   */
  async getCompetitionStandings(competitionId) {
    try {
      const standings = await this.db.query(`
        SELECT 
          cp.participant,
          AVG(acs.accuracy_score) as composite_score,
          AVG(CASE WHEN acs.metric = 'roi_per_day' THEN acs.accuracy_score END) as roi_accuracy,
          AVG(CASE WHEN acs.metric = 'timeframe' THEN acs.accuracy_score END) as timeframe_accuracy,
          AVG(CASE WHEN acs.metric = 'cost' THEN acs.accuracy_score END) as cost_accuracy,
          AVG(CASE WHEN acs.metric = 'cash_flow' THEN acs.accuracy_score END) as cash_flow_accuracy,
          COUNT(acs.id) as total_entries
        FROM competition_participants cp
        LEFT JOIN accuracy_scores acs ON cp.participant = acs.participant
        WHERE cp.competition_id = ?
        AND cp.status = 'active'
        GROUP BY cp.participant
        ORDER BY composite_score DESC
      `, [competitionId]);

      // Add ranks
      const rankedStandings = standings.map((standing, index) => ({
        ...standing,
        rank: index + 1
      }));

      this.logger.info('Competition standings fetched', {
        competitionId,
        participantsCount: rankedStandings.length
      });

      return rankedStandings;
    } catch (error) {
      this.logger.error('Competition standings fetch failed', { error: error.message });
      throw error;
    }
  }
}

module.exports = LeaderboardService;
