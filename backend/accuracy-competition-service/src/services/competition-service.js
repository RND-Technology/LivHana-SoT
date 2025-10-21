/**
 * Competition Service
 * Manages competitions and tournament systems
 * ROI/$/Day is KING. Cash flow (passive profits) RULES business decisions.
 */

const moment = require('moment');
const winston = require('winston');

class CompetitionService {
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
        new winston.transports.File({ filename: 'logs/competition-service.log' })
      ]
    });
  }

  /**
   * Create competition
   */
  async createCompetition(competition) {
    try {
      // Validate competition
      this.validateCompetition(competition);

      // Insert competition
      const result = await this.db.run(`
        INSERT INTO competitions (
          id, name, type, description, start_date, end_date, status, created_at
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?)
      `, [
        competition.id,
        competition.name,
        competition.type,
        competition.description || '',
        competition.start_date,
        competition.end_date,
        competition.status || 'active',
        competition.created_at
      ]);

      this.logger.info('Competition created', {
        id: competition.id,
        name: competition.name,
        type: competition.type
      });

      return result;
    } catch (error) {
      this.logger.error('Competition creation failed', { error: error.message });
      throw error;
    }
  }

  /**
   * Join competition
   */
  async joinCompetition(competitionId, participant) {
    try {
      // Check if competition exists
      const competition = await this.db.queryOne(`
        SELECT * FROM competitions WHERE id = ? AND status = 'active'
      `, [competitionId]);

      if (!competition) {
        throw new Error('Competition not found or inactive');
      }

      // Check if participant already joined
      const existingParticipant = await this.db.queryOne(`
        SELECT * FROM competition_participants 
        WHERE competition_id = ? AND participant = ?
      `, [competitionId, participant]);

      if (existingParticipant) {
        throw new Error('Participant already joined this competition');
      }

      // Add participant to competition
      const result = await this.db.run(`
        INSERT INTO competition_participants (
          id, competition_id, participant, joined_at, status
        ) VALUES (?, ?, ?, ?, ?)
      `, [
        require('uuid').v4(),
        competitionId,
        participant,
        new Date().toISOString(),
        'active'
      ]);

      this.logger.info('Participant joined competition', {
        competitionId,
        participant
      });

      return result;
    } catch (error) {
      this.logger.error('Competition join failed', { error: error.message });
      throw error;
    }
  }

  /**
   * Leave competition
   */
  async leaveCompetition(competitionId, participant) {
    try {
      const result = await this.db.run(`
        UPDATE competition_participants 
        SET status = 'inactive' 
        WHERE competition_id = ? AND participant = ?
      `, [competitionId, participant]);

      this.logger.info('Participant left competition', {
        competitionId,
        participant
      });

      return result;
    } catch (error) {
      this.logger.error('Competition leave failed', { error: error.message });
      throw error;
    }
  }

  /**
   * Get competition details
   */
  async getCompetition(competitionId) {
    try {
      const competition = await this.db.queryOne(`
        SELECT * FROM competitions WHERE id = ?
      `, [competitionId]);

      if (!competition) {
        throw new Error('Competition not found');
      }

      // Get participants
      const participants = await this.db.query(`
        SELECT * FROM competition_participants 
        WHERE competition_id = ? AND status = 'active'
      `, [competitionId]);

      return {
        ...competition,
        participants: participants.map(p => p.participant)
      };
    } catch (error) {
      this.logger.error('Competition fetch failed', { error: error.message });
      throw error;
    }
  }

  /**
   * Get all competitions
   */
  async getAllCompetitions(status = 'active') {
    try {
      const competitions = await this.db.query(`
        SELECT 
          c.*,
          COUNT(cp.id) as participant_count
        FROM competitions c
        LEFT JOIN competition_participants cp ON c.id = cp.competition_id AND cp.status = 'active'
        WHERE c.status = ?
        GROUP BY c.id
        ORDER BY c.created_at DESC
      `, [status]);

      this.logger.info('Competitions fetched', {
        status,
        count: competitions.length
      });

      return competitions;
    } catch (error) {
      this.logger.error('Competitions fetch failed', { error: error.message });
      throw error;
    }
  }

  /**
   * Calculate weekly results
   */
  async calculateWeeklyResults() {
    try {
      const weekStart = moment().startOf('week').format('YYYY-MM-DD');
      const weekEnd = moment().endOf('week').format('YYYY-MM-DD');

      // Get all active competitions
      const competitions = await this.db.query(`
        SELECT * FROM competitions 
        WHERE status = 'active' 
        AND start_date <= ? 
        AND end_date >= ?
      `, [weekEnd, weekStart]);

      for (const competition of competitions) {
        // Calculate results for each competition
        const results = await this.db.query(`
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
          AND DATE(acs.created_at) >= ? AND DATE(acs.created_at) <= ?
          GROUP BY cp.participant
          ORDER BY composite_score DESC
        `, [competition.id, weekStart, weekEnd]);

        // Store weekly results
        for (let i = 0; i < results.length; i++) {
          const result = results[i];
          await this.db.run(`
            INSERT INTO weekly_accuracy (
              id, participant, composite_score, week_start, week_end, created_at
            ) VALUES (?, ?, ?, ?, ?, ?)
          `, [
            require('uuid').v4(),
            result.participant,
            result.composite_score || 0,
            weekStart,
            weekEnd,
            new Date().toISOString()
          ]);
        }

        this.logger.info('Weekly results calculated', {
          competitionId: competition.id,
          participantsCount: results.length
        });
      }
    } catch (error) {
      this.logger.error('Weekly results calculation failed', { error: error.message });
      throw error;
    }
  }

  /**
   * Create tournament
   */
  async createTournament(tournament) {
    try {
      const competition = {
        id: require('uuid').v4(),
        name: tournament.name || `Tournament ${moment().format('YYYY-MM-DD')}`,
        type: 'tournament',
        description: tournament.description || 'Weekly accuracy tournament',
        start_date: tournament.start_date || moment().startOf('week').format('YYYY-MM-DD'),
        end_date: tournament.end_date || moment().endOf('week').format('YYYY-MM-DD'),
        status: 'active',
        created_at: new Date().toISOString()
      };

      const result = await this.createCompetition(competition);

      // Auto-join all active participants
      const activeParticipants = await this.db.query(`
        SELECT DISTINCT participant FROM accuracy_scores
        WHERE created_at >= datetime('now', '-7d')
      `);

      for (const participant of activeParticipants) {
        try {
          await this.joinCompetition(competition.id, participant.participant);
        } catch (error) {
          // Ignore errors for participants who can't join
          this.logger.warn('Participant could not join tournament', {
            participant: participant.participant,
            error: error.message
          });
        }
      }

      this.logger.info('Tournament created', {
        id: competition.id,
        participantsCount: activeParticipants.length
      });

      return result;
    } catch (error) {
      this.logger.error('Tournament creation failed', { error: error.message });
      throw error;
    }
  }

  /**
   * Get tournament standings
   */
  async getTournamentStandings(tournamentId) {
    try {
      const standings = await this.db.query(`
        SELECT 
          cp.participant,
          AVG(acs.accuracy_score) as composite_score,
          AVG(CASE WHEN acs.metric = 'roi_per_day' THEN acs.accuracy_score END) as roi_accuracy,
          AVG(CASE WHEN acs.metric = 'timeframe' THEN acs.accuracy_score END) as timeframe_accuracy,
          AVG(CASE WHEN acs.metric = 'cost' THEN acs.accuracy_score END) as cost_accuracy,
          AVG(CASE WHEN acs.metric = 'cash_flow' THEN acs.accuracy_score END) as cash_flow_accuracy,
          COUNT(acs.id) as total_entries,
          MAX(acs.accuracy_score) as best_accuracy,
          MIN(acs.accuracy_score) as worst_accuracy
        FROM competition_participants cp
        LEFT JOIN accuracy_scores acs ON cp.participant = acs.participant
        WHERE cp.competition_id = ?
        AND cp.status = 'active'
        GROUP BY cp.participant
        ORDER BY composite_score DESC
      `, [tournamentId]);

      // Add ranks and performance metrics
      const rankedStandings = standings.map((standing, index) => {
        const consistency = standing.total_entries > 0 ? 
          (1 - (standing.worst_accuracy / standing.best_accuracy)) * 100 : 0;

        return {
          ...standing,
          rank: index + 1,
          consistency: Math.round(consistency * 100) / 100,
          improvement_potential: Math.round((100 - standing.composite_score) * 100) / 100
        };
      });

      this.logger.info('Tournament standings fetched', {
        tournamentId,
        participantsCount: rankedStandings.length
      });

      return rankedStandings;
    } catch (error) {
      this.logger.error('Tournament standings fetch failed', { error: error.message });
      throw error;
    }
  }

  /**
   * Validate competition
   */
  validateCompetition(competition) {
    if (!competition.name) {
      throw new Error('Competition name is required');
    }
    if (!competition.type) {
      throw new Error('Competition type is required');
    }
    if (!competition.start_date) {
      throw new Error('Start date is required');
    }
    if (!competition.end_date) {
      throw new Error('End date is required');
    }
    if (moment(competition.start_date).isAfter(moment(competition.end_date))) {
      throw new Error('Start date must be before end date');
    }
  }
}

module.exports = CompetitionService;
