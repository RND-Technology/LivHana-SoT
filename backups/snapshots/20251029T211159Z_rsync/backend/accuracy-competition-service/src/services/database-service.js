/**
 * Database Service
 * SQLite database management for accuracy competition system
 */

const sqlite3 = require('sqlite3').verbose();
const path = require('path');
const fs = require('fs');

class DatabaseService {
  constructor() {
    this.db = null;
    this.dbPath = path.join(__dirname, '../../data/accuracy_competition.db');
  }

  /**
   * Initialize database
   */
  async initialize() {
    return new Promise((resolve, reject) => {
      // Ensure data directory exists
      const dataDir = path.dirname(this.dbPath);
      if (!fs.existsSync(dataDir)) {
        fs.mkdirSync(dataDir, { recursive: true });
      }

      // Connect to database
      this.db = new sqlite3.Database(this.dbPath, (err) => {
        if (err) {
          console.error('Database connection failed:', err);
          reject(err);
        } else {
          console.log('Connected to SQLite database');
          this.createTables().then(resolve).catch(reject);
        }
      });
    });
  }

  /**
   * Create database tables
   */
  async createTables() {
    const tables = [
      // Projections table
      `CREATE TABLE IF NOT EXISTS projections (
        id TEXT PRIMARY KEY,
        participant TEXT NOT NULL,
        metric TEXT NOT NULL,
        value REAL NOT NULL,
        unit TEXT DEFAULT 'USD',
        timeframe TEXT DEFAULT '30d',
        confidence REAL DEFAULT 0.8,
        context TEXT,
        timestamp TEXT NOT NULL,
        created_at TEXT NOT NULL
      )`,

      // Actuals table
      `CREATE TABLE IF NOT EXISTS actuals (
        id TEXT PRIMARY KEY,
        participant TEXT NOT NULL,
        metric TEXT NOT NULL,
        value REAL NOT NULL,
        unit TEXT DEFAULT 'USD',
        timeframe TEXT DEFAULT '30d',
        context TEXT,
        timestamp TEXT NOT NULL,
        created_at TEXT NOT NULL
      )`,

      // Accuracy scores table
      `CREATE TABLE IF NOT EXISTS accuracy_scores (
        id TEXT PRIMARY KEY,
        projection_id TEXT NOT NULL,
        actual_id TEXT NOT NULL,
        participant TEXT NOT NULL,
        metric TEXT NOT NULL,
        projected_value REAL NOT NULL,
        actual_value REAL NOT NULL,
        accuracy_score REAL NOT NULL,
        timestamp TEXT NOT NULL,
        created_at TEXT NOT NULL,
        FOREIGN KEY (projection_id) REFERENCES projections (id),
        FOREIGN KEY (actual_id) REFERENCES actuals (id)
      )`,

      // Daily accuracy table
      `CREATE TABLE IF NOT EXISTS daily_accuracy (
        id TEXT PRIMARY KEY,
        participant TEXT NOT NULL,
        composite_score REAL NOT NULL,
        date TEXT NOT NULL,
        created_at TEXT NOT NULL
      )`,

      // Weekly accuracy table
      `CREATE TABLE IF NOT EXISTS weekly_accuracy (
        id TEXT PRIMARY KEY,
        participant TEXT NOT NULL,
        composite_score REAL NOT NULL,
        week_start TEXT NOT NULL,
        week_end TEXT NOT NULL,
        created_at TEXT NOT NULL
      )`,

      // Competitions table
      `CREATE TABLE IF NOT EXISTS competitions (
        id TEXT PRIMARY KEY,
        name TEXT NOT NULL,
        type TEXT NOT NULL,
        description TEXT,
        start_date TEXT NOT NULL,
        end_date TEXT NOT NULL,
        status TEXT DEFAULT 'active',
        created_at TEXT NOT NULL
      )`,

      // Competition participants table
      `CREATE TABLE IF NOT EXISTS competition_participants (
        id TEXT PRIMARY KEY,
        competition_id TEXT NOT NULL,
        participant TEXT NOT NULL,
        joined_at TEXT NOT NULL,
        status TEXT DEFAULT 'active',
        FOREIGN KEY (competition_id) REFERENCES competitions (id)
      )`,

      // Leaderboard table
      `CREATE TABLE IF NOT EXISTS leaderboard (
        id TEXT PRIMARY KEY,
        participant TEXT NOT NULL,
        composite_score REAL NOT NULL,
        roi_accuracy REAL NOT NULL,
        timeframe_accuracy REAL NOT NULL,
        cost_accuracy REAL NOT NULL,
        cash_flow_accuracy REAL NOT NULL,
        rank INTEGER NOT NULL,
        period TEXT NOT NULL,
        date TEXT NOT NULL,
        created_at TEXT NOT NULL
      )`
    ];

    for (const table of tables) {
      await this.query(table);
    }

    console.log('Database tables created successfully');
  }

  /**
   * Execute query
   */
  query(sql, params = []) {
    return new Promise((resolve, reject) => {
      this.db.all(sql, params, (err, rows) => {
        if (err) {
          console.error('Query failed:', err);
          reject(err);
        } else {
          resolve(rows);
        }
      });
    });
  }

  /**
   * Execute single query
   */
  queryOne(sql, params = []) {
    return new Promise((resolve, reject) => {
      this.db.get(sql, params, (err, row) => {
        if (err) {
          console.error('Query failed:', err);
          reject(err);
        } else {
          resolve(row);
        }
      });
    });
  }

  /**
   * Execute insert/update/delete
   */
  run(sql, params = []) {
    return new Promise((resolve, reject) => {
      this.db.run(sql, params, function(err) {
        if (err) {
          console.error('Query failed:', err);
          reject(err);
        } else {
          resolve({ id: this.lastID, changes: this.changes });
        }
      });
    });
  }

  /**
   * Close database connection
   */
  close() {
    return new Promise((resolve, reject) => {
      this.db.close((err) => {
        if (err) {
          console.error('Database close failed:', err);
          reject(err);
        } else {
          console.log('Database connection closed');
          resolve();
        }
      });
    });
  }
}

module.exports = DatabaseService;
