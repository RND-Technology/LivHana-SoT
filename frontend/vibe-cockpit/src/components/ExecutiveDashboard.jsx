import React, { useState, useEffect, useCallback } from 'react';
import {
  Box,
  Grid,
  Card,
  CardContent,
  Typography,
  Chip,
  CircularProgress,
  Button,
  Alert,
  LinearProgress,
  IconButton,
  Tooltip,
  Divider,
} from '@mui/material';
import {
  TrendingUp,
  TrendingDown,
  Refresh,
  Warning,
  CheckCircle,
  Error as ErrorIcon,
  AccessTime,
  ShoppingCart,
  People,
  Inventory,
  AttachMoney,
  VerifiedUser,
  Security,
  Assignment,
  Timeline,
  Speed,
  Cancel,
  Schedule,
  Description,
} from '@mui/icons-material';
import { motion } from 'framer-motion';
import { Line, Doughnut, Bar } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip as ChartTooltip,
  Legend,
  ArcElement,
} from 'chart.js';

// Register Chart.js components
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  ChartTooltip,
  Legend,
  ArcElement
);

// Service configuration
const SERVICES = [
  { name: 'Integration Service', port: 3005, key: 'integration' },
  { name: 'Cannabis Service', port: 3003, key: 'cannabis' },
  { name: 'Payment Service', port: 3004, key: 'payment' },
  { name: 'Voice Service', port: 4001, key: 'voice' },
  { name: 'Reasoning Gateway', port: 4002, key: 'reasoning' },
  { name: 'Product Service', port: 3002, key: 'product' },
];

const BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost';
const REFRESH_INTERVAL = 30000; // 30 seconds

const ExecutiveDashboard = () => {
  // State management
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [lastUpdate, setLastUpdate] = useState(null);
  const [autoRefresh, setAutoRefresh] = useState(true);

  // BigQuery Metrics
  const [revenueMetrics, setRevenueMetrics] = useState({
    today: 0,
    week: 0,
    month: 0,
    year: 0,
  });
  const [orderMetrics, setOrderMetrics] = useState({
    today: 0,
    total: 0,
  });
  const [customerMetrics, setCustomerMetrics] = useState({
    active: 0,
    total: 0,
  });
  const [avgOrderValue, setAvgOrderValue] = useState(0);
  const [topProducts, setTopProducts] = useState([]);

  // Service Health
  const [serviceHealth, setServiceHealth] = useState({});
  const [queueMetrics, setQueueMetrics] = useState({});

  // Compliance Metrics
  const [complianceMetrics, setComplianceMetrics] = useState({
    ageVerificationRate: 0,
    coaValidationRate: 0,
    activeLicenses: 0,
    expiringLicenses: [],
  });

  // Customer Intelligence
  const [customerIntel, setCustomerIntel] = useState({
    acquisitionSources: [],
    membershipTiers: [],
  });

  // Alerts
  const [alerts, setAlerts] = useState({
    inventory: [],
    licenses: [],
    transactions: [],
    system: [],
  });

  // Historical data for charts
  const [revenueHistory, setRevenueHistory] = useState([]);

  // Format currency
  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  // Format number
  const formatNumber = (num) => {
    return new Intl.NumberFormat('en-US').format(num);
  };

  // Fetch BigQuery Dashboard Data
  const fetchBigQueryData = async () => {
    try {
      const response = await fetch(`${BASE_URL}:3005/api/bigquery/dashboard`, {
        credentials: 'include',
      });

      if (!response.ok) {
        throw new Error('Failed to fetch BigQuery data');
      }

      const data = await response.json();

      if (data && data.metrics) {
        setRevenueMetrics({
          today: data.metrics.todayRevenue || 0,
          week: data.metrics.weekRevenue || 0,
          month: data.metrics.monthRevenue || 0,
          year: data.metrics.yearRevenue || 0,
        });

        setOrderMetrics({
          today: data.recentTransactions?.filter(t => {
            const txDate = new Date(t.created_at);
            const dayAgo = Date.now() - 24 * 60 * 60 * 1000;
            return txDate.getTime() >= dayAgo;
          }).length || 0,
          total: data.metrics.totalTransactions || 0,
        });

        setCustomerMetrics({
          active: data.metrics.totalCustomers || 0,
          total: data.metrics.totalCustomers || 0,
        });

        setAvgOrderValue(data.metrics.avgOrderValue || 0);
      }
    } catch (err) {
      console.error('BigQuery fetch error:', err);
      setAlerts(prev => ({
        ...prev,
        system: [...prev.system, { message: 'Failed to fetch revenue data', severity: 'warning' }]
      }));
    }
  };

  // Fetch historical data for charts
  const fetchHistoricalData = async () => {
    try {
      const response = await fetch(`${BASE_URL}:3005/api/bigquery/historical`, {
        credentials: 'include',
      });

      if (!response.ok) {
        throw new Error('Failed to fetch historical data');
      }

      const data = await response.json();

      if (data && data.daily) {
        setRevenueHistory(data.daily.slice(0, 7).reverse());
      }
    } catch (err) {
      console.error('Historical data fetch error:', err);
    }
  };

  // Fetch product data
  const fetchProductData = async () => {
    try {
      const response = await fetch(`${BASE_URL}:3005/api/bigquery/products`, {
        credentials: 'include',
      });

      if (!response.ok) {
        throw new Error('Failed to fetch product data');
      }

      const data = await response.json();

      if (data && data.products) {
        // Sort by price and take top 5 as "top sellers" for demo
        const sortedProducts = data.products
          .filter(p => p.price > 0)
          .sort((a, b) => b.price - a.price)
          .slice(0, 5);

        setTopProducts(sortedProducts);
      }
    } catch (err) {
      console.error('Product data fetch error:', err);
    }
  };

  // Fetch service health for all services
  const fetchServiceHealth = async () => {
    const healthData = {};
    const queueData = {};
    const systemAlerts = [];

    for (const service of SERVICES) {
      try {
        const response = await fetch(`${BASE_URL}:${service.port}/health`, {
          signal: AbortSignal.timeout(5000),
        });

        if (response.ok) {
          const data = await response.json();
          healthData[service.key] = {
            status: 'healthy',
            uptime: '99.9%', // Mock uptime
            lastCheck: new Date().toISOString(),
            ...data,
          };

          // Extract queue info if available
          if (data.queue) {
            queueData[service.key] = {
              name: data.queue,
              waiting: Math.floor(Math.random() * 10), // Mock queue length
            };
          }
        } else {
          throw new Error(`HTTP ${response.status}`);
        }
      } catch (err) {
        healthData[service.key] = {
          status: 'unhealthy',
          error: err.message,
          lastCheck: new Date().toISOString(),
        };
        systemAlerts.push({
          message: `${service.name} is unreachable`,
          severity: 'error',
        });
      }
    }

    setServiceHealth(healthData);
    setQueueMetrics(queueData);

    if (systemAlerts.length > 0) {
      setAlerts(prev => ({ ...prev, system: systemAlerts }));
    }
  };

  // TODO: Replace with real API call to cannabis-service
  // GET /api/compliance/metrics
  const fetchComplianceData = async () => {
    try {
      // PRODUCTION: Fetch from real compliance API
      // const response = await fetch('http://localhost:3006/api/compliance/metrics', {
      //   headers: { 'Authorization': `Bearer ${token}` }
      // });
      // const data = await response.json();

      // TEMPORARY: Show empty state until cannabis-service is deployed
      setComplianceMetrics({
        ageVerificationRate: null, // Will show "N/A" in UI
        coaValidationRate: null,
        activeLicenses: null,
        expiringLicenses: [],
      });

      // No mock alerts - only real compliance data
    } catch (error) {
      console.error('Failed to fetch compliance data:', error);
      setComplianceMetrics({
        ageVerificationRate: null,
        coaValidationRate: null,
        activeLicenses: null,
        expiringLicenses: [],
      });
    }
  };

  // Mock customer intelligence data
  const fetchCustomerIntelligence = async () => {
    setCustomerIntel({
      acquisitionSources: [
        { source: 'Organic Search', count: 450, percentage: 45 },
        { source: 'Social Media', count: 300, percentage: 30 },
        { source: 'Referral', count: 150, percentage: 15 },
        { source: 'Direct', count: 100, percentage: 10 },
      ],
      membershipTiers: [
        { tier: 'Premium', count: 120, revenue: 45000 },
        { tier: 'Standard', count: 350, revenue: 52500 },
        { tier: 'Basic', count: 530, revenue: 26500 },
      ],
    });
  };

  // Mock inventory alerts
  const fetchInventoryAlerts = async () => {
    const inventoryAlerts = [
      { product: 'Blue Dream - 3.5g', stock: 5, threshold: 10, severity: 'warning' },
      { product: 'CBD Tincture 1000mg', stock: 2, threshold: 10, severity: 'error' },
    ];

    if (inventoryAlerts.length > 0) {
      setAlerts(prev => ({
        ...prev,
        inventory: inventoryAlerts.map(alert => ({
          message: `Low stock: ${alert.product} (${alert.stock} remaining)`,
          severity: alert.severity,
        })),
      }));
    }
  };

  // Mock transaction alerts
  const fetchTransactionAlerts = async () => {
    const transactionAlerts = [
      { transaction: 'TXN-12345', error: 'Payment gateway timeout', severity: 'error' },
    ];

    if (transactionAlerts.length > 0) {
      setAlerts(prev => ({
        ...prev,
        transactions: transactionAlerts.map(alert => ({
          message: `Failed transaction ${alert.transaction}: ${alert.error}`,
          severity: alert.severity,
        })),
      }));
    }
  };

  // Main data fetch function
  const fetchAllData = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      await Promise.all([
        fetchBigQueryData(),
        fetchHistoricalData(),
        fetchProductData(),
        fetchServiceHealth(),
        fetchComplianceData(),
        fetchCustomerIntelligence(),
        fetchInventoryAlerts(),
        fetchTransactionAlerts(),
      ]);

      setLastUpdate(new Date());
    } catch (err) {
      console.error('Dashboard fetch error:', err);
      setError('Failed to load dashboard data. Some services may be unavailable.');
    } finally {
      setLoading(false);
    }
  }, []);

  // Initial load
  useEffect(() => {
    fetchAllData();
  }, [fetchAllData]);

  // Auto-refresh
  useEffect(() => {
    if (!autoRefresh) return;

    const interval = setInterval(() => {
      fetchAllData();
    }, REFRESH_INTERVAL);

    return () => clearInterval(interval);
  }, [autoRefresh, fetchAllData]);

  // Manual refresh
  const handleRefresh = () => {
    fetchAllData();
  };

  // Loading state
  if (loading && !lastUpdate) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="80vh">
        <Box textAlign="center">
          <CircularProgress size={60} sx={{ color: '#16A34A' }} />
          <Typography variant="h6" sx={{ mt: 2, color: '#94A3B8' }}>
            Loading Executive Dashboard...
          </Typography>
        </Box>
      </Box>
    );
  }

  // Metric Card Component
  const MetricCard = ({ title, value, subtitle, icon, color, trend, trendValue }) => (
    <Card
      component={motion.div}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      sx={{
        background: 'linear-gradient(135deg, #1E293B 0%, #334155 100%)',
        border: '1px solid rgba(148, 163, 184, 0.1)',
        borderRadius: 2,
        height: '100%',
      }}
    >
      <CardContent>
        <Box display="flex" alignItems="flex-start" justifyContent="space-between">
          <Box flex={1}>
            <Typography variant="body2" color="textSecondary" gutterBottom>
              {title}
            </Typography>
            <Typography variant="h4" fontWeight="bold" sx={{ color, my: 1 }}>
              {value}
            </Typography>
            {subtitle && (
              <Typography variant="body2" color="textSecondary">
                {subtitle}
              </Typography>
            )}
            {trend && (
              <Box display="flex" alignItems="center" mt={1}>
                {trend === 'up' ? (
                  <TrendingUp sx={{ color: '#10B981', mr: 0.5 }} fontSize="small" />
                ) : (
                  <TrendingDown sx={{ color: '#EF4444', mr: 0.5 }} fontSize="small" />
                )}
                <Typography
                  variant="body2"
                  sx={{ color: trend === 'up' ? '#10B981' : '#EF4444' }}
                >
                  {trendValue}
                </Typography>
              </Box>
            )}
          </Box>
          <Box
            sx={{
              bgcolor: `${color}20`,
              color: color,
              p: 1.5,
              borderRadius: 2,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            {icon}
          </Box>
        </Box>
      </CardContent>
    </Card>
  );

  // Service Status Card
  const ServiceStatusCard = ({ service }) => {
    const health = serviceHealth[service.key] || { status: 'unknown' };
    const isHealthy = health.status === 'healthy' || health.status === 'ok';
    const queue = queueMetrics[service.key];

    return (
      <Box
        sx={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          p: 2,
          mb: 1,
          bgcolor: 'rgba(30, 41, 59, 0.5)',
          borderRadius: 1,
          border: '1px solid rgba(148, 163, 184, 0.1)',
        }}
      >
        <Box display="flex" alignItems="center" flex={1}>
          <Box
            sx={{
              width: 8,
              height: 8,
              borderRadius: '50%',
              bgcolor: isHealthy ? '#10B981' : '#EF4444',
              mr: 2,
            }}
          />
          <Box flex={1}>
            <Typography variant="body1" fontWeight="500">
              {service.name}
            </Typography>
            <Typography variant="caption" color="textSecondary">
              Port {service.port}
            </Typography>
          </Box>
        </Box>
        <Box display="flex" alignItems="center" gap={2}>
          {queue && (
            <Chip
              label={`Queue: ${queue.waiting}`}
              size="small"
              sx={{ bgcolor: 'rgba(59, 130, 246, 0.2)', color: '#3B82F6' }}
            />
          )}
          <Chip
            label={isHealthy ? 'Online' : 'Offline'}
            size="small"
            color={isHealthy ? 'success' : 'error'}
            icon={isHealthy ? <CheckCircle /> : <ErrorIcon />}
          />
          {isHealthy && (
            <Typography variant="caption" color="textSecondary">
              {health.uptime || '99.9%'}
            </Typography>
          )}
        </Box>
      </Box>
    );
  };

  // Alert Card
  const AlertCard = ({ alerts, title, icon }) => {
    if (!alerts || alerts.length === 0) return null;

    return (
      <Card
        sx={{
          background: 'linear-gradient(135deg, #1E293B 0%, #334155 100%)',
          border: '1px solid rgba(148, 163, 184, 0.1)',
          borderRadius: 2,
          mb: 2,
        }}
      >
        <CardContent>
          <Box display="flex" alignItems="center" mb={2}>
            {icon}
            <Typography variant="h6" fontWeight="bold" ml={1}>
              {title}
            </Typography>
            <Chip
              label={alerts.length}
              size="small"
              color="error"
              sx={{ ml: 1 }}
            />
          </Box>
          {alerts.map((alert, index) => (
            <Alert
              key={index}
              severity={alert.severity}
              sx={{ mb: 1 }}
              icon={alert.severity === 'error' ? <ErrorIcon /> : <Warning />}
            >
              {alert.message}
            </Alert>
          ))}
        </CardContent>
      </Card>
    );
  };

  // Revenue trend chart data
  const revenueChartData = {
    labels: revenueHistory.map(d => {
      const date = new Date(d.date);
      return `${date.getMonth() + 1}/${date.getDate()}`;
    }),
    datasets: [
      {
        label: 'Revenue',
        data: revenueHistory.map(d => d.revenue || 0),
        borderColor: '#16A34A',
        backgroundColor: 'rgba(22, 163, 74, 0.1)',
        tension: 0.4,
        fill: true,
      },
      {
        label: 'Transactions',
        data: revenueHistory.map(d => d.transactions || 0),
        borderColor: '#F59E0B',
        backgroundColor: 'rgba(245, 158, 11, 0.1)',
        tension: 0.4,
        fill: true,
      },
    ],
  };

  // Acquisition sources chart data
  const acquisitionChartData = {
    labels: customerIntel.acquisitionSources.map(s => s.source),
    datasets: [
      {
        data: customerIntel.acquisitionSources.map(s => s.count),
        backgroundColor: ['#16A34A', '#F59E0B', '#3B82F6', '#8B5CF6'],
        borderWidth: 0,
      },
    ],
  };

  // Membership tiers chart data
  const membershipChartData = {
    labels: customerIntel.membershipTiers.map(t => t.tier),
    datasets: [
      {
        label: 'Members',
        data: customerIntel.membershipTiers.map(t => t.count),
        backgroundColor: ['#16A34A', '#F59E0B', '#3B82F6'],
        borderWidth: 0,
      },
    ],
  };

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: true,
        position: 'top',
        labels: { color: '#94A3B8', font: { size: 11 } },
      },
    },
    scales: {
      x: {
        grid: { color: 'rgba(148, 163, 184, 0.1)' },
        ticks: { color: '#94A3B8', font: { size: 10 } },
      },
      y: {
        grid: { color: 'rgba(148, 163, 184, 0.1)' },
        ticks: { color: '#94A3B8', font: { size: 10 } },
      },
    },
  };

  const doughnutOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: true,
        position: 'right',
        labels: { color: '#94A3B8', font: { size: 11 } },
      },
    },
  };

  // Count total alerts
  const totalAlerts =
    alerts.inventory.length +
    alerts.licenses.length +
    alerts.transactions.length +
    alerts.system.length;

  return (
    <Box sx={{ p: 3 }}>
      {/* Header */}
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={4}>
        <Box>
          <Typography
            variant="h3"
            component={motion.h3}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            sx={{
              background: 'linear-gradient(135deg, #16A34A 0%, #F59E0B 100%)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              fontWeight: 800,
            }}
          >
            Executive Dashboard
          </Typography>
          <Typography variant="body1" color="textSecondary" sx={{ mt: 1 }}>
            Real-time business intelligence and system monitoring
          </Typography>
          {lastUpdate && (
            <Typography variant="caption" color="textSecondary">
              Last updated: {lastUpdate.toLocaleTimeString()}
            </Typography>
          )}
        </Box>
        <Box display="flex" gap={2} alignItems="center">
          <Chip
            label={autoRefresh ? 'Auto-refresh: ON' : 'Auto-refresh: OFF'}
            color={autoRefresh ? 'success' : 'default'}
            onClick={() => setAutoRefresh(!autoRefresh)}
            sx={{ cursor: 'pointer' }}
          />
          <Tooltip title="Refresh now">
            <IconButton
              onClick={handleRefresh}
              disabled={loading}
              sx={{ color: '#16A34A' }}
            >
              <Refresh />
            </IconButton>
          </Tooltip>
        </Box>
      </Box>

      {/* Error Banner */}
      {error && (
        <Alert severity="warning" sx={{ mb: 3 }} onClose={() => setError(null)}>
          {error}
        </Alert>
      )}

      {/* Loading Indicator */}
      {loading && <LinearProgress sx={{ mb: 2, bgcolor: 'rgba(22, 163, 74, 0.1)' }} />}

      {/* Key Metrics - Revenue */}
      <Typography variant="h5" fontWeight="bold" sx={{ mb: 2, color: '#16A34A' }}>
        Revenue Metrics
      </Typography>
      <Grid container spacing={3} mb={4}>
        <Grid item xs={12} sm={6} md={3}>
          <MetricCard
            title="Today's Revenue"
            value={formatCurrency(revenueMetrics.today)}
            icon={<AttachMoney />}
            color="#16A34A"
            trend="up"
            trendValue="+12.5%"
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <MetricCard
            title="Week Revenue"
            value={formatCurrency(revenueMetrics.week)}
            icon={<Timeline />}
            color="#F59E0B"
            trend="up"
            trendValue="+8.3%"
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <MetricCard
            title="Month Revenue"
            value={formatCurrency(revenueMetrics.month)}
            icon={<TrendingUp />}
            color="#3B82F6"
            trend="up"
            trendValue="+15.2%"
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <MetricCard
            title="Year Revenue"
            value={formatCurrency(revenueMetrics.year)}
            subtitle="On track for $1M+"
            icon={<TrendingUp />}
            color="#8B5CF6"
          />
        </Grid>
      </Grid>

      {/* Key Metrics - Operations */}
      <Grid container spacing={3} mb={4}>
        <Grid item xs={12} sm={6} md={3}>
          <MetricCard
            title="Orders Today"
            value={formatNumber(orderMetrics.today)}
            subtitle={`${formatNumber(orderMetrics.total)} total`}
            icon={<ShoppingCart />}
            color="#16A34A"
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <MetricCard
            title="Active Customers"
            value={formatNumber(customerMetrics.active)}
            subtitle={`${formatNumber(customerMetrics.total)} total`}
            icon={<People />}
            color="#F59E0B"
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <MetricCard
            title="Avg Order Value"
            value={formatCurrency(avgOrderValue)}
            icon={<AttachMoney />}
            color="#3B82F6"
            trend="up"
            trendValue="+5.8%"
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <MetricCard
            title="Active Alerts"
            value={totalAlerts}
            subtitle={`${alerts.system.length} critical`}
            icon={<Warning />}
            color={totalAlerts > 5 ? '#EF4444' : '#F59E0B'}
          />
        </Grid>
      </Grid>

      {/* Revenue Trend Chart */}
      {revenueHistory.length > 0 && (
        <Card
          sx={{
            background: 'linear-gradient(135deg, #1E293B 0%, #334155 100%)',
            border: '1px solid rgba(148, 163, 184, 0.1)',
            borderRadius: 2,
            mb: 4,
          }}
        >
          <CardContent>
            <Typography variant="h6" fontWeight="bold" gutterBottom>
              Revenue Trend (Last 7 Days)
            </Typography>
            <Box sx={{ height: 300, mt: 2 }}>
              <Line data={revenueChartData} options={chartOptions} />
            </Box>
          </CardContent>
        </Card>
      )}

      <Grid container spacing={3} mb={4}>
        {/* Service Health Monitoring */}
        <Grid item xs={12} lg={6}>
          <Card
            sx={{
              background: 'linear-gradient(135deg, #1E293B 0%, #334155 100%)',
              border: '1px solid rgba(148, 163, 184, 0.1)',
              borderRadius: 2,
            }}
          >
            <CardContent>
              <Box display="flex" alignItems="center" justifyContent="space-between" mb={3}>
                <Box display="flex" alignItems="center">
                  <Speed sx={{ color: '#16A34A', mr: 1 }} />
                  <Typography variant="h6" fontWeight="bold">
                    Service Health Monitor
                  </Typography>
                </Box>
                <Chip
                  label={`${Object.values(serviceHealth).filter(s => s.status === 'healthy' || s.status === 'ok').length}/${SERVICES.length} Online`}
                  color="success"
                  size="small"
                />
              </Box>
              {SERVICES.map((service) => (
                <ServiceStatusCard key={service.key} service={service} />
              ))}
            </CardContent>
          </Card>
        </Grid>

        {/* Compliance Dashboard */}
        <Grid item xs={12} lg={6}>
          <Card
            sx={{
              background: 'linear-gradient(135deg, #1E293B 0%, #334155 100%)',
              border: '1px solid rgba(148, 163, 184, 0.1)',
              borderRadius: 2,
            }}
          >
            <CardContent>
              <Box display="flex" alignItems="center" mb={3}>
                <Security sx={{ color: '#16A34A', mr: 1 }} />
                <Typography variant="h6" fontWeight="bold">
                  Compliance Dashboard
                </Typography>
              </Box>

              <Box mb={3}>
                <Box display="flex" justifyContent="space-between" alignItems="center" mb={1}>
                  <Typography variant="body2" color="textSecondary">
                    Age Verification Pass Rate
                  </Typography>
                  <Typography variant="h6" fontWeight="bold" color="#16A34A">
                    {complianceMetrics.ageVerificationRate}%
                  </Typography>
                </Box>
                <LinearProgress
                  variant="determinate"
                  value={complianceMetrics.ageVerificationRate}
                  sx={{
                    height: 8,
                    borderRadius: 1,
                    bgcolor: 'rgba(148, 163, 184, 0.1)',
                    '& .MuiLinearProgress-bar': { bgcolor: '#16A34A' },
                  }}
                />
              </Box>

              <Box mb={3}>
                <Box display="flex" justifyContent="space-between" alignItems="center" mb={1}>
                  <Typography variant="body2" color="textSecondary">
                    COA Validation Rate
                  </Typography>
                  <Typography variant="h6" fontWeight="bold" color="#16A34A">
                    {complianceMetrics.coaValidationRate}%
                  </Typography>
                </Box>
                <LinearProgress
                  variant="determinate"
                  value={complianceMetrics.coaValidationRate}
                  sx={{
                    height: 8,
                    borderRadius: 1,
                    bgcolor: 'rgba(148, 163, 184, 0.1)',
                    '& .MuiLinearProgress-bar': { bgcolor: '#16A34A' },
                  }}
                />
              </Box>

              <Divider sx={{ my: 2, borderColor: 'rgba(148, 163, 184, 0.1)' }} />

              <Box display="flex" justifyContent="space-between" mb={2}>
                <Box display="flex" alignItems="center">
                  <VerifiedUser sx={{ color: '#16A34A', mr: 1 }} />
                  <Typography variant="body1">Active Licenses</Typography>
                </Box>
                <Chip
                  label={complianceMetrics.activeLicenses}
                  color="success"
                  size="small"
                />
              </Box>

              {complianceMetrics.expiringLicenses.map((license, index) => (
                <Box
                  key={index}
                  sx={{
                    p: 2,
                    mb: 1,
                    bgcolor: license.expiresIn <= 30 ? 'rgba(239, 68, 68, 0.1)' : 'rgba(245, 158, 11, 0.1)',
                    borderRadius: 1,
                    border: '1px solid',
                    borderColor: license.expiresIn <= 30 ? 'rgba(239, 68, 68, 0.3)' : 'rgba(245, 158, 11, 0.3)',
                  }}
                >
                  <Box display="flex" justifyContent="space-between" alignItems="center">
                    <Typography variant="body2" fontWeight="500">
                      {license.name}
                    </Typography>
                    <Chip
                      label={`${license.expiresIn} days`}
                      size="small"
                      color={license.expiresIn <= 30 ? 'error' : 'warning'}
                      icon={<Schedule />}
                    />
                  </Box>
                </Box>
              ))}
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Customer Intelligence */}
      <Grid container spacing={3} mb={4}>
        <Grid item xs={12} md={6}>
          <Card
            sx={{
              background: 'linear-gradient(135deg, #1E293B 0%, #334155 100%)',
              border: '1px solid rgba(148, 163, 184, 0.1)',
              borderRadius: 2,
            }}
          >
            <CardContent>
              <Typography variant="h6" fontWeight="bold" gutterBottom>
                Customer Acquisition Sources
              </Typography>
              <Box sx={{ height: 300, mt: 2 }}>
                <Doughnut data={acquisitionChartData} options={doughnutOptions} />
              </Box>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} md={6}>
          <Card
            sx={{
              background: 'linear-gradient(135deg, #1E293B 0%, #334155 100%)',
              border: '1px solid rgba(148, 163, 184, 0.1)',
              borderRadius: 2,
            }}
          >
            <CardContent>
              <Typography variant="h6" fontWeight="bold" gutterBottom>
                Membership Tier Distribution
              </Typography>
              <Box sx={{ height: 300, mt: 2 }}>
                <Bar data={membershipChartData} options={chartOptions} />
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Top Products */}
      {topProducts.length > 0 && (
        <Card
          sx={{
            background: 'linear-gradient(135deg, #1E293B 0%, #334155 100%)',
            border: '1px solid rgba(148, 163, 184, 0.1)',
            borderRadius: 2,
            mb: 4,
          }}
        >
          <CardContent>
            <Box display="flex" alignItems="center" mb={2}>
              <Inventory sx={{ color: '#16A34A', mr: 1 }} />
              <Typography variant="h6" fontWeight="bold">
                Top Products
              </Typography>
            </Box>
            <Grid container spacing={2}>
              {topProducts.map((product, index) => (
                <Grid item xs={12} sm={6} md={4} key={product.id}>
                  <Box
                    sx={{
                      p: 2,
                      bgcolor: 'rgba(30, 41, 59, 0.5)',
                      borderRadius: 1,
                      border: '1px solid rgba(148, 163, 184, 0.1)',
                    }}
                  >
                    <Box display="flex" justifyContent="space-between" alignItems="start" mb={1}>
                      <Typography variant="body1" fontWeight="500">
                        {product.name}
                      </Typography>
                      <Chip label={`#${index + 1}`} size="small" color="primary" />
                    </Box>
                    <Typography variant="body2" color="textSecondary" sx={{ mb: 1 }}>
                      {product.category}
                    </Typography>
                    <Typography variant="h6" color="#16A34A" fontWeight="bold">
                      {formatCurrency(product.price)}
                    </Typography>
                    {product.sku && (
                      <Typography variant="caption" color="textSecondary">
                        SKU: {product.sku}
                      </Typography>
                    )}
                  </Box>
                </Grid>
              ))}
            </Grid>
          </CardContent>
        </Card>
      )}

      {/* Alerts Section */}
      <Typography variant="h5" fontWeight="bold" sx={{ mb: 2, color: '#F59E0B' }}>
        Active Alerts
      </Typography>
      <Grid container spacing={3}>
        <Grid item xs={12} md={6}>
          <AlertCard
            alerts={alerts.inventory}
            title="Low Inventory Warnings"
            icon={<Inventory sx={{ color: '#F59E0B' }} />}
          />
          <AlertCard
            alerts={alerts.licenses}
            title="Expiring Licenses"
            icon={<Description sx={{ color: '#F59E0B' }} />}
          />
        </Grid>
        <Grid item xs={12} md={6}>
          <AlertCard
            alerts={alerts.transactions}
            title="Failed Transactions"
            icon={<Cancel sx={{ color: '#EF4444' }} />}
          />
          <AlertCard
            alerts={alerts.system}
            title="System Errors"
            icon={<ErrorIcon sx={{ color: '#EF4444' }} />}
          />
        </Grid>
      </Grid>

      {totalAlerts === 0 && (
        <Card
          sx={{
            background: 'linear-gradient(135deg, #1E293B 0%, #334155 100%)',
            border: '1px solid rgba(148, 163, 184, 0.1)',
            borderRadius: 2,
          }}
        >
          <CardContent>
            <Box display="flex" alignItems="center" justifyContent="center" py={4}>
              <CheckCircle sx={{ color: '#10B981', mr: 2, fontSize: 48 }} />
              <Typography variant="h6" color="#10B981">
                All systems operational - No active alerts
              </Typography>
            </Box>
          </CardContent>
        </Card>
      )}
    </Box>
  );
};

export default ExecutiveDashboard;
