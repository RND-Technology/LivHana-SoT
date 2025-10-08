// ============================================
// REAL-TIME REVENUE DASHBOARD API
// $100K Path Visualization Endpoints
// ============================================
// Created: 2025-10-07
// Purpose: Serve analytics data to dashboard frontend
// Latency: <60s data refresh
// ============================================

import express from 'express';
import { BigQuery } from '@google-cloud/bigquery';
import cors from 'cors';

const app = express();
const bigquery = new BigQuery({
  projectId: process.env.GCP_PROJECT_ID || 'livhana-sot'
});

// Middleware
app.use(cors());
app.use(express.json());

// ============================================
// 1. REVENUE DASHBOARD ENDPOINTS
// ============================================

/**
 * GET /api/v1/dashboard/revenue/realtime
 * Real-time revenue metrics (today)
 */
app.get('/api/v1/dashboard/revenue/realtime', async (req, res) => {
  try {
    const query = `SELECT * FROM \`commerce.realtime_revenue_today\` LIMIT 1`;
    const [rows] = await bigquery.query(query);

    res.json({
      success: true,
      data: rows[0] || {
        today: new Date().toISOString().split('T')[0],
        revenue_today: 0,
        transactions_today: 0,
        customers_today: 0,
        avg_transaction_today: 0,
        revenue_per_hour: 0,
        projected_daily_revenue: 0,
        revenue_yesterday: 0,
        growth_vs_yesterday_percent: 0,
        last_updated: new Date().toISOString()
      },
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('❌ Realtime revenue query failed:', error.message);
    res.status(500).json({
      success: false,
      error: error.message,
      timestamp: new Date().toISOString()
    });
  }
});

/**
 * GET /api/v1/dashboard/revenue/monthly
 * Monthly revenue trend (last 12 months)
 */
app.get('/api/v1/dashboard/revenue/monthly', async (req, res) => {
  try {
    const query = `
      SELECT * FROM \`commerce.monthly_revenue_trend\`
      ORDER BY month DESC
      LIMIT 12
    `;
    const [rows] = await bigquery.query(query);

    res.json({
      success: true,
      data: rows,
      count: rows.length,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('❌ Monthly revenue query failed:', error.message);
    res.status(500).json({
      success: false,
      error: error.message,
      timestamp: new Date().toISOString()
    });
  }
});

/**
 * GET /api/v1/dashboard/revenue/daily
 * Daily revenue summary (last 90 days)
 */
app.get('/api/v1/dashboard/revenue/daily', async (req, res) => {
  try {
    const days = parseInt(req.query.days) || 90;

    const query = `
      SELECT
        revenue_date,
        total_transactions,
        gross_revenue_usd,
        avg_transaction_value,
        unique_customers,
        completed_revenue,
        last_updated
      FROM \`commerce.daily_revenue_summary\`
      WHERE revenue_date >= DATE_SUB(CURRENT_DATE(), INTERVAL ${days} DAY)
      GROUP BY revenue_date, total_transactions, gross_revenue_usd,
               avg_transaction_value, unique_customers, completed_revenue, last_updated
      ORDER BY revenue_date DESC
    `;
    const [rows] = await bigquery.query(query);

    res.json({
      success: true,
      data: rows,
      count: rows.length,
      period_days: days,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('❌ Daily revenue query failed:', error.message);
    res.status(500).json({
      success: false,
      error: error.message,
      timestamp: new Date().toISOString()
    });
  }
});

/**
 * GET /api/v1/dashboard/revenue/summary
 * Key metrics summary for dashboard header
 */
app.get('/api/v1/dashboard/revenue/summary', async (req, res) => {
  try {
    const query = `SELECT * FROM \`commerce.dashboard_metrics_summary\` LIMIT 1`;
    const [rows] = await bigquery.query(query);

    const summary = rows[0] || {
      current_month_revenue: 0,
      previous_month_revenue: 0,
      today_revenue: 0,
      yesterday_revenue: 0,
      current_month_customers: 0,
      target_achievement_percent: 0,
      last_updated: new Date().toISOString()
    };

    res.json({
      success: true,
      data: {
        ...summary,
        target_revenue: 100000,
        gap_to_target: 100000 - (summary.current_month_revenue || 0),
        growth_vs_last_month_percent: summary.previous_month_revenue
          ? ((summary.current_month_revenue - summary.previous_month_revenue) /
             summary.previous_month_revenue * 100).toFixed(2)
          : 0
      },
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('❌ Summary query failed:', error.message);
    res.status(500).json({
      success: false,
      error: error.message,
      timestamp: new Date().toISOString()
    });
  }
});

// ============================================
// 2. CUSTOMER LTV ENDPOINTS
// ============================================

/**
 * GET /api/v1/dashboard/customers/segments
 * Customer segmentation summary (RFM)
 */
app.get('/api/v1/dashboard/customers/segments', async (req, res) => {
  try {
    const query = `
      SELECT * FROM \`commerce.customer_segment_summary\`
      ORDER BY segment_revenue DESC
    `;
    const [rows] = await bigquery.query(query);

    res.json({
      success: true,
      data: rows,
      count: rows.length,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('❌ Customer segments query failed:', error.message);
    res.status(500).json({
      success: false,
      error: error.message,
      timestamp: new Date().toISOString()
    });
  }
});

/**
 * GET /api/v1/dashboard/customers/high-value
 * Top 20% high-value customers
 */
app.get('/api/v1/dashboard/customers/high-value', async (req, res) => {
  try {
    const limit = parseInt(req.query.limit) || 50;

    const query = `
      SELECT * FROM \`commerce.high_value_customers\`
      ORDER BY total_revenue DESC
      LIMIT ${limit}
    `;
    const [rows] = await bigquery.query(query);

    res.json({
      success: true,
      data: rows,
      count: rows.length,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('❌ High-value customers query failed:', error.message);
    res.status(500).json({
      success: false,
      error: error.message,
      timestamp: new Date().toISOString()
    });
  }
});

/**
 * GET /api/v1/dashboard/customers/at-risk
 * At-risk customers (churn prediction)
 */
app.get('/api/v1/dashboard/customers/at-risk', async (req, res) => {
  try {
    const riskLevel = req.query.risk || 'HIGH_RISK';

    const query = `
      SELECT * FROM \`commerce.at_risk_customers\`
      WHERE risk_category = '${riskLevel}'
      ORDER BY churn_risk_score DESC, total_spent DESC
      LIMIT 100
    `;
    const [rows] = await bigquery.query(query);

    res.json({
      success: true,
      data: rows,
      count: rows.length,
      risk_level: riskLevel,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('❌ At-risk customers query failed:', error.message);
    res.status(500).json({
      success: false,
      error: error.message,
      timestamp: new Date().toISOString()
    });
  }
});

/**
 * GET /api/v1/dashboard/customers/ltv-leaderboard
 * Customer lifetime value leaderboard
 */
app.get('/api/v1/dashboard/customers/ltv-leaderboard', async (req, res) => {
  try {
    const limit = parseInt(req.query.limit) || 100;

    const query = `
      SELECT * FROM \`commerce.ltv_leaderboard\`
      ORDER BY lifetime_value DESC
      LIMIT ${limit}
    `;
    const [rows] = await bigquery.query(query);

    res.json({
      success: true,
      data: rows,
      count: rows.length,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('❌ LTV leaderboard query failed:', error.message);
    res.status(500).json({
      success: false,
      error: error.message,
      timestamp: new Date().toISOString()
    });
  }
});

// ============================================
// 3. RE-ORDER PREDICTION ENDPOINTS
// ============================================

/**
 * GET /api/v1/dashboard/predictions/reorders
 * Upcoming re-order predictions (next 7 days)
 */
app.get('/api/v1/dashboard/predictions/reorders', async (req, res) => {
  try {
    const query = `
      SELECT * FROM \`commerce.reorder_triggers_upcoming\`
      ORDER BY urgency_score DESC
      LIMIT 200
    `;
    const [rows] = await bigquery.query(query);

    res.json({
      success: true,
      data: rows,
      count: rows.length,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('❌ Re-order predictions query failed:', error.message);
    res.status(500).json({
      success: false,
      error: error.message,
      timestamp: new Date().toISOString()
    });
  }
});

/**
 * GET /api/v1/dashboard/predictions/model-performance
 * Re-order model performance metrics
 */
app.get('/api/v1/dashboard/predictions/model-performance', async (req, res) => {
  try {
    const query = `SELECT * FROM \`commerce.reorder_model_performance\``;
    const [rows] = await bigquery.query(query);

    res.json({
      success: true,
      data: rows,
      count: rows.length,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('❌ Model performance query failed:', error.message);
    res.status(500).json({
      success: false,
      error: error.message,
      timestamp: new Date().toISOString()
    });
  }
});

/**
 * GET /api/v1/dashboard/predictions/product-recommendations/:customerId
 * Personalized product recommendations for customer
 */
app.get('/api/v1/dashboard/predictions/product-recommendations/:customerId', async (req, res) => {
  try {
    const { customerId } = req.params;

    const query = `
      SELECT * FROM \`commerce.customer_product_recommendations\`
      WHERE customer_id = '${customerId}'
      ORDER BY recommendation_rank ASC
      LIMIT 5
    `;
    const [rows] = await bigquery.query(query);

    res.json({
      success: true,
      data: rows,
      count: rows.length,
      customer_id: customerId,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('❌ Product recommendations query failed:', error.message);
    res.status(500).json({
      success: false,
      error: error.message,
      timestamp: new Date().toISOString()
    });
  }
});

// ============================================
// 4. PRODUCT PERFORMANCE ENDPOINTS
// ============================================

/**
 * GET /api/v1/dashboard/products/performance
 * Product performance ranking
 */
app.get('/api/v1/dashboard/products/performance', async (req, res) => {
  try {
    const limit = parseInt(req.query.limit) || 50;

    const query = `
      SELECT * FROM \`commerce.product_performance_ranking\`
      ORDER BY performance_score ASC
      LIMIT ${limit}
    `;
    const [rows] = await bigquery.query(query);

    res.json({
      success: true,
      data: rows,
      count: rows.length,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('❌ Product performance query failed:', error.message);
    res.status(500).json({
      success: false,
      error: error.message,
      timestamp: new Date().toISOString()
    });
  }
});

/**
 * GET /api/v1/dashboard/products/top-sellers
 * Top 20 best sellers (last 7 days)
 */
app.get('/api/v1/dashboard/products/top-sellers', async (req, res) => {
  try {
    const query = `SELECT * FROM \`commerce.top_sellers_weekly\` LIMIT 20`;
    const [rows] = await bigquery.query(query);

    res.json({
      success: true,
      data: rows,
      count: rows.length,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('❌ Top sellers query failed:', error.message);
    res.status(500).json({
      success: false,
      error: error.message,
      timestamp: new Date().toISOString()
    });
  }
});

/**
 * GET /api/v1/dashboard/products/demand-forecast
 * Product demand forecast (next 30 days)
 */
app.get('/api/v1/dashboard/products/demand-forecast', async (req, res) => {
  try {
    const limit = parseInt(req.query.limit) || 50;

    const query = `
      SELECT * FROM \`commerce.product_demand_forecast\`
      ORDER BY avg_daily_sales DESC
      LIMIT ${limit}
    `;
    const [rows] = await bigquery.query(query);

    res.json({
      success: true,
      data: rows,
      count: rows.length,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('❌ Demand forecast query failed:', error.message);
    res.status(500).json({
      success: false,
      error: error.message,
      timestamp: new Date().toISOString()
    });
  }
});

// ============================================
// 5. $100K PATH VISUALIZATION
// ============================================

/**
 * GET /api/v1/dashboard/path-to-100k
 * Revenue path to $100K/month target
 */
app.get('/api/v1/dashboard/path-to-100k', async (req, res) => {
  try {
    const query = `
      SELECT * FROM \`commerce.revenue_path_to_100k\`
      ORDER BY month DESC
    `;
    const [rows] = await bigquery.query(query);

    // Calculate trajectory
    const currentMonth = rows[0];
    const target = 100000;
    const gap = target - (currentMonth?.actual_revenue || 0);
    const monthsToTarget = currentMonth?.months_to_target || 0;

    res.json({
      success: true,
      data: rows,
      summary: {
        current_month: currentMonth?.month,
        current_revenue: currentMonth?.actual_revenue || 0,
        target_revenue: target,
        gap_amount: gap,
        gap_percent: ((gap / target) * 100).toFixed(2),
        achievement_percent: currentMonth?.target_achievement_percent || 0,
        projected_next_month: currentMonth?.projected_next_month || 0,
        estimated_months_to_target: monthsToTarget
      },
      count: rows.length,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('❌ Path to 100K query failed:', error.message);
    res.status(500).json({
      success: false,
      error: error.message,
      timestamp: new Date().toISOString()
    });
  }
});

// ============================================
// 6. CONTENT ENGAGEMENT CORRELATION
// ============================================

/**
 * GET /api/v1/dashboard/content/sales-correlation
 * YouTube/News content impact on sales
 */
app.get('/api/v1/dashboard/content/sales-correlation', async (req, res) => {
  try {
    const days = parseInt(req.query.days) || 30;

    const query = `
      SELECT * FROM \`commerce.content_sales_correlation\`
      WHERE content_date >= DATE_SUB(CURRENT_DATE(), INTERVAL ${days} DAY)
      ORDER BY content_date DESC
    `;
    const [rows] = await bigquery.query(query);

    res.json({
      success: true,
      data: rows,
      count: rows.length,
      period_days: days,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('❌ Content correlation query failed:', error.message);
    res.status(500).json({
      success: false,
      error: error.message,
      timestamp: new Date().toISOString()
    });
  }
});

/**
 * GET /api/v1/dashboard/delivery/cost-analysis
 * Delivery cost savings tracker
 */
app.get('/api/v1/dashboard/delivery/cost-analysis', async (req, res) => {
  try {
    const days = parseInt(req.query.days) || 30;

    const query = `
      SELECT * FROM \`commerce.delivery_cost_analysis\`
      WHERE delivery_date >= DATE_SUB(CURRENT_DATE(), INTERVAL ${days} DAY)
      ORDER BY delivery_date DESC
    `;
    const [rows] = await bigquery.query(query);

    res.json({
      success: true,
      data: rows,
      count: rows.length,
      period_days: days,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('❌ Delivery cost query failed:', error.message);
    res.status(500).json({
      success: false,
      error: error.message,
      timestamp: new Date().toISOString()
    });
  }
});

// ============================================
// HEALTH CHECK
// ============================================

app.get('/health', (req, res) => {
  res.json({
    status: 'healthy',
    service: 'analytics-dashboard-api',
    version: '1.0.0',
    timestamp: new Date().toISOString(),
    message: 'Real-time analytics dashboard operational'
  });
});

// ============================================
// START SERVER
// ============================================

const PORT = process.env.PORT || 8080;
app.listen(PORT, () => {
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log('📊 Analytics Dashboard API');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log(`✅ Listening on port ${PORT}`);
  console.log(`🔗 Health: http://localhost:${PORT}/health`);
  console.log(`📈 Revenue API: http://localhost:${PORT}/api/v1/dashboard/revenue/*`);
  console.log(`👥 Customer API: http://localhost:${PORT}/api/v1/dashboard/customers/*`);
  console.log(`🔮 Predictions API: http://localhost:${PORT}/api/v1/dashboard/predictions/*`);
  console.log(`📦 Products API: http://localhost:${PORT}/api/v1/dashboard/products/*`);
  console.log(`🎯 Path to 100K: http://localhost:${PORT}/api/v1/dashboard/path-to-100k`);
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
});

export default app;

// Optimized: 2025-10-07
// Last updated: 2025-10-07
