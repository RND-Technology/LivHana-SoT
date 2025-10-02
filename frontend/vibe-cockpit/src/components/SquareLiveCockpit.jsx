import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import axios from 'axios';
import { 
  LineChart, Line, BarChart, Bar, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
  Area, AreaChart
} from 'recharts';

const SquareLiveCockpit = () => {
  const [liveData, setLiveData] = useState({
    metrics: {
      todayRevenue: 0,
      weekRevenue: 0,
      monthRevenue: 0,
      yearRevenue: 0,
      totalTransactions: 0,
      totalCustomers: 0,
      avgOrderValue: 0
    },
    topProducts: [],
    recentTransactions: [],
    historicalData: [],
    lastUpdate: null,
    mode: 'unknown'
  });
  
  const [loading, setLoading] = useState(true);
  const [refreshInterval, setRefreshInterval] = useState(5000);
  const [selectedView, setSelectedView] = useState('dashboard');

  // REAL-TIME DATA FETCH FROM BIGQUERY!
  const fetchLiveData = async () => {
    try {
      const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3005';
      
      // Parallel requests for SPEED!
      const [dashboard, historical, products] = await Promise.all([
        axios.get(`${API_URL}/api/bigquery/dashboard`),
        axios.get(`${API_URL}/api/bigquery/historical`),
        axios.get(`${API_URL}/api/bigquery/products`)
      ]);

      setLiveData({
        ...dashboard.data,
        historicalData: historical.data.historical || [],
        dailyData: historical.data.daily || [],
        monthlyData: historical.data.monthly || [],
        catalog: products.data.products || [],
        topSellers: products.data.topSellers || [],
        mode: dashboard.data.mode
      });
      
      setLoading(false);
    } catch (error) {
      console.error('Failed to fetch BigQuery data:', error);
      setLoading(false);
    }
  };

  // Auto-refresh every 5 seconds
  useEffect(() => {
    fetchLiveData();
    const interval = setInterval(fetchLiveData, refreshInterval);
    return () => clearInterval(interval);
  }, [refreshInterval]);

  // Animated Revenue Counter
  const AnimatedRevenue = ({ value, label, color }) => {
    const [displayValue, setDisplayValue] = useState(0);
    
    useEffect(() => {
      const duration = 1000;
      const steps = 50;
      const increment = value / steps;
      let current = 0;
      
      const timer = setInterval(() => {
        current += increment;
        if (current >= value) {
          current = value;
          clearInterval(timer);
        }
        setDisplayValue(current);
      }, duration / steps);
      
      return () => clearInterval(timer);
    }, [value]);

    return (
      <motion.div 
        className="bg-gradient-to-br from-gray-900 to-black rounded-xl p-6 border-2"
        style={{ borderColor: color }}
        whileHover={{ scale: 1.02, boxShadow: `0 0 30px ${color}50` }}
      >
        <p className="text-gray-400 text-sm mb-2">{label}</p>
        <div className="text-4xl font-bold text-white">
          ${displayValue.toLocaleString('en-US', { maximumFractionDigits: 0 })}
        </div>
        {label === 'TODAY' && liveData.metrics.todayRevenue > 1000 && (
          <div className="mt-2 text-green-400 text-sm animate-pulse">
            🔥 ON FIRE!
          </div>
        )}
      </motion.div>
    );
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <motion.div 
          animate={{ rotate: 360 }}
          transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
          className="text-6xl"
        >
          💰
        </motion.div>
        <p className="ml-4 text-2xl text-green-400">Loading BigQuery Data...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black text-white p-6">
      {/* Header */}
      <motion.div 
        className="mb-8"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-5xl font-bold bg-gradient-to-r from-green-400 to-cyan-500 bg-clip-text text-transparent">
              SQUARE LIVE COCKPIT - BIGQUERY POWERED
            </h1>
            <p className="text-gray-400 mt-2">
              Real Data Since July 2023 | Updates Every {refreshInterval/1000}s | 
              Last Update: {new Date(liveData.lastUpdate).toLocaleTimeString()} | Mode: {liveData.mode || 'mock'}
            </p>
          </div>
          
          <div className="flex items-center space-x-4">
            <select 
              value={refreshInterval}
              onChange={(e) => setRefreshInterval(Number(e.target.value))}
              className="bg-gray-900 text-green-400 px-4 py-2 rounded-lg border border-green-500"
            >
              <option value={1000}>1 sec</option>
              <option value={5000}>5 sec</option>
              <option value={10000}>10 sec</option>
              <option value={30000}>30 sec</option>
            </select>
            
            <motion.button
              onClick={fetchLiveData}
              className="px-6 py-3 bg-gradient-to-r from-green-500 to-cyan-500 text-black font-bold rounded-lg"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              REFRESH NOW
            </motion.button>
          </div>
        </div>
      </motion.div>

      {/* View Selector */}
      <div className="flex space-x-4 mb-8">
        {['dashboard', 'transactions', 'products', 'analytics', 'leaderboard'].map(view => (
          <motion.button
            key={view}
            onClick={() => setSelectedView(view)}
            className={`px-6 py-3 rounded-lg font-semibold transition-all ${
              selectedView === view 
                ? 'bg-gradient-to-r from-green-500 to-cyan-500 text-black' 
                : 'bg-gray-800 text-gray-400 hover:bg-gray-700'
            }`}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            {view.toUpperCase()}
          </motion.button>
        ))}
      </div>

      <AnimatePresence mode="wait">
        {/* DASHBOARD VIEW */}
        {selectedView === 'dashboard' && (
          <motion.div
            key="dashboard"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            {/* Revenue Metrics */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
              <AnimatedRevenue value={liveData.metrics.todayRevenue} label="TODAY" color="#10b981" />
              <AnimatedRevenue value={liveData.metrics.weekRevenue} label="THIS WEEK" color="#06b6d4" />
              <AnimatedRevenue value={liveData.metrics.monthRevenue} label="THIS MONTH" color="#8b5cf6" />
              <AnimatedRevenue value={liveData.metrics.yearRevenue} label="YEAR TO DATE" color="#f59e0b" />
            </div>

            {/* Key Metrics */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
              <motion.div className="bg-gray-900 rounded-xl p-6 border border-gray-700">
                <p className="text-gray-400 text-sm">Total Transactions</p>
                <p className="text-3xl font-bold text-white">{liveData.metrics.totalTransactions.toLocaleString()}</p>
              </motion.div>
              <motion.div className="bg-gray-900 rounded-xl p-6 border border-gray-700">
                <p className="text-gray-400 text-sm">Total Customers</p>
                <p className="text-3xl font-bold text-white">{liveData.metrics.totalCustomers.toLocaleString()}</p>
              </motion.div>
              <motion.div className="bg-gray-900 rounded-xl p-6 border border-gray-700">
                <p className="text-gray-400 text-sm">Avg Order Value</p>
                <p className="text-3xl font-bold text-white">${liveData.metrics.avgOrderValue.toFixed(2)}</p>
              </motion.div>
            </div>

            {/* Revenue Chart */}
            <motion.div className="bg-gray-900 rounded-xl p-6 border border-gray-700">
              <h3 className="text-xl font-bold text-green-400 mb-4">Revenue Trend (30 Days)</h3>
              <ResponsiveContainer width="100%" height={300}>
                <AreaChart data={liveData.historicalData.slice(-30)}>
                  <defs>
                    <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#10b981" stopOpacity={0.8}/>
                      <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                  <XAxis dataKey="date" stroke="#9ca3af" />
                  <YAxis stroke="#9ca3af" />
                  <Tooltip 
                    contentStyle={{ backgroundColor: '#111827', border: '1px solid #10b981' }}
                    labelStyle={{ color: '#10b981' }}
                  />
                  <Area 
                    type="monotone" 
                    dataKey="revenue" 
                    stroke="#10b981" 
                    fillOpacity={1} 
                    fill="url(#colorRevenue)" 
                  />
                </AreaChart>
              </ResponsiveContainer>
            </motion.div>
          </motion.div>
        )}

        {/* TRANSACTIONS VIEW */}
        {selectedView === 'transactions' && (
          <motion.div
            key="transactions"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <div className="bg-gray-900 rounded-xl p-6 border border-gray-700">
              <h3 className="text-xl font-bold text-green-400 mb-4">Recent Transactions (Live)</h3>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-gray-700">
                      <th className="text-left py-2 text-gray-400">Time</th>
                      <th className="text-left py-2 text-gray-400">Transaction ID</th>
                      <th className="text-left py-2 text-gray-400">Amount</th>
                      <th className="text-left py-2 text-gray-400">Status</th>
                      <th className="text-left py-2 text-gray-400">Customer</th>
                    </tr>
                  </thead>
                  <tbody>
                    {liveData.recentTransactions.map((tx, idx) => (
                      <motion.tr 
                        key={tx.id}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: idx * 0.05 }}
                        className="border-b border-gray-800"
                      >
                        <td className="py-2 text-sm">{new Date(tx.created_at).toLocaleTimeString()}</td>
                        <td className="py-2 text-sm font-mono text-gray-400">{tx.id.slice(-8)}</td>
                        <td className="py-2 text-lg font-bold text-green-400">${tx.amount.toFixed(2)}</td>
                        <td className="py-2">
                          <span className={`px-2 py-1 rounded text-xs ${
                            tx.status === 'COMPLETED' ? 'bg-green-900 text-green-300' : 'bg-yellow-900 text-yellow-300'
                          }`}>
                            {tx.status}
                          </span>
                        </td>
                        <td className="py-2 text-sm text-gray-400">{tx.customer_id?.slice(-8) || 'Guest'}</td>
                      </motion.tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </motion.div>
        )}

        {/* PRODUCTS VIEW */}
        {selectedView === 'products' && (
          <motion.div
            key="products"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <div className="bg-gray-900 rounded-xl p-6 border border-gray-700">
              <h3 className="text-xl font-bold text-green-400 mb-4">Top Selling Products</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {liveData.topProducts.slice(0, 9).map((product, idx) => (
                  <motion.div
                    key={product.name}
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: idx * 0.05 }}
                    className="bg-black rounded-lg p-4 border border-gray-700"
                  >
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-2xl font-bold text-cyan-400">#{idx + 1}</span>
                      <span className="text-green-400 font-bold">${product.revenue.toFixed(0)}</span>
                    </div>
                    <p className="text-white font-semibold">{product.name}</p>
                    <div className="mt-2 text-sm text-gray-400">
                      <span>{product.transactions} sales</span>
                      <span className="mx-2">•</span>
                      <span>{product.units} units</span>
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>
          </motion.div>
        )}

        {/* ANALYTICS VIEW */}
        {selectedView === 'analytics' && (
          <motion.div
            key="analytics"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="grid grid-cols-1 lg:grid-cols-2 gap-6"
          >
            {/* Daily Revenue Bar Chart */}
            <div className="bg-gray-900 rounded-xl p-6 border border-gray-700">
              <h3 className="text-xl font-bold text-green-400 mb-4">Daily Revenue (Last 7 Days)</h3>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={liveData.historicalData.slice(-7)}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                  <XAxis dataKey="date" stroke="#9ca3af" />
                  <YAxis stroke="#9ca3af" />
                  <Tooltip 
                    contentStyle={{ backgroundColor: '#111827', border: '1px solid #10b981' }}
                  />
                  <Bar dataKey="revenue" fill="#10b981" />
                </BarChart>
              </ResponsiveContainer>
            </div>

            {/* Customer Growth Line Chart */}
            <div className="bg-gray-900 rounded-xl p-6 border border-gray-700">
              <h3 className="text-xl font-bold text-cyan-400 mb-4">Customer Growth</h3>
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={liveData.historicalData.slice(-30)}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                  <XAxis dataKey="date" stroke="#9ca3af" />
                  <YAxis stroke="#9ca3af" />
                  <Tooltip 
                    contentStyle={{ backgroundColor: '#111827', border: '1px solid #06b6d4' }}
                  />
                  <Line 
                    type="monotone" 
                    dataKey="customers" 
                    stroke="#06b6d4" 
                    strokeWidth={2}
                    dot={false}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>

            {/* ROI Calculator */}
            <div className="bg-gray-900 rounded-xl p-6 border border-gray-700 lg:col-span-2">
              <h3 className="text-xl font-bold text-yellow-400 mb-4">ROI Performance</h3>
              <div className="grid grid-cols-4 gap-4">
                <div className="text-center">
                  <p className="text-gray-400 text-sm">Initial Investment</p>
                  <p className="text-2xl font-bold">$50,000</p>
                </div>
                <div className="text-center">
                  <p className="text-gray-400 text-sm">Total Revenue</p>
                  <p className="text-2xl font-bold text-green-400">
                    ${liveData.metrics.yearRevenue.toLocaleString()}
                  </p>
                </div>
                <div className="text-center">
                  <p className="text-gray-400 text-sm">Net Profit</p>
                  <p className="text-2xl font-bold text-cyan-400">
                    ${(liveData.metrics.yearRevenue - 50000).toLocaleString()}
                  </p>
                </div>
                <div className="text-center">
                  <p className="text-gray-400 text-sm">ROI</p>
                  <p className="text-2xl font-bold text-yellow-400">
                    {((liveData.metrics.yearRevenue - 50000) / 50000 * 100).toFixed(1)}%
                  </p>
                </div>
              </div>
            </div>
          </motion.div>
        )}

        {/* LEADERBOARD VIEW */}
        {selectedView === 'leaderboard' && (
          <motion.div
            key="leaderboard"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="grid grid-cols-1 lg:grid-cols-3 gap-6"
          >
            {/* Top Products */}
            <div className="bg-gray-900 rounded-xl p-6 border border-green-500">
              <h3 className="text-xl font-bold text-green-400 mb-4">🏆 TOP PRODUCTS</h3>
              {liveData.topProducts.slice(0, 5).map((product, idx) => (
                <div key={product.name} className="flex items-center justify-between py-2 border-b border-gray-800">
                  <div className="flex items-center">
                    <span className="text-2xl mr-3">
                      {idx === 0 ? '🥇' : idx === 1 ? '🥈' : idx === 2 ? '🥉' : `#${idx + 1}`}
                    </span>
                    <span className="text-white">{product.name}</span>
                  </div>
                  <span className="text-green-400 font-bold">${product.revenue.toFixed(0)}</span>
                </div>
              ))}
            </div>

            {/* Best Days */}
            <div className="bg-gray-900 rounded-xl p-6 border border-cyan-500">
              <h3 className="text-xl font-bold text-cyan-400 mb-4">📅 BEST DAYS</h3>
              {liveData.dailyData?.slice(0, 5).map((day, idx) => (
                <div key={day.date} className="flex items-center justify-between py-2 border-b border-gray-800">
                  <div className="flex items-center">
                    <span className="text-2xl mr-3">
                      {idx === 0 ? '🔥' : '📈'}
                    </span>
                    <span className="text-white">{day.date}</span>
                  </div>
                  <span className="text-cyan-400 font-bold">${day.revenue.toFixed(0)}</span>
                </div>
              ))}
            </div>

            {/* Best Months */}
            <div className="bg-gray-900 rounded-xl p-6 border border-purple-500">
              <h3 className="text-xl font-bold text-purple-400 mb-4">📊 BEST MONTHS</h3>
              {liveData.monthlyData?.slice(0, 5).map((month, idx) => (
                <div key={month.month} className="flex items-center justify-between py-2 border-b border-gray-800">
                  <div className="flex items-center">
                    <span className="text-2xl mr-3">
                      {idx === 0 ? '💰' : '📆'}
                    </span>
                    <span className="text-white">{new Date(month.month).toLocaleDateString('en-US', { month: 'short', year: 'numeric' })}</span>
                  </div>
                  <span className="text-purple-400 font-bold">${month.revenue.toFixed(0)}</span>
                </div>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Footer Status Bar */}
      <motion.div 
        className="mt-12 p-4 bg-gradient-to-r from-gray-900 to-gray-800 rounded-lg border border-gray-700"
        animate={{ opacity: [0.5, 1, 0.5] }}
        transition={{ duration: 2, repeat: Infinity }}
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <span className="text-green-400">● BIGQUERY LIVE</span>
            <span className="text-gray-400">|</span>
            <span className="text-cyan-400">SQUARE SYNCED</span>
            <span className="text-gray-400">|</span>
            <span className="text-yellow-400">TIER-1 OPERATIONAL</span>
          </div>
          <div className="text-gray-400 text-sm">
            Data Pipeline: Square → BigQuery → Cache → Dashboard | Latency: &lt;1s
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default SquareLiveCockpit;

// Optimized: 2025-10-02
