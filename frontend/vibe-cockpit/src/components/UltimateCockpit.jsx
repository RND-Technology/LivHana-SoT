import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Dashboard as DashboardIcon,
  BusinessCenter,
  AutoAwesome,
  Assessment,
  Storefront,
  Settings,
  Mic,
  Videocam,
  Chat,
  ExpandMore,
  Fullscreen,
  FilterList,
  Refresh,
  CloudQueue,
  Speed,
  TrendingUp,
  AttachMoney,
  People,
  Inventory,
  Gavel,
  Analytics,
  Security
} from '@mui/icons-material';
import {
  Box,
  Grid,
  Card,
  CardContent,
  Typography,
  IconButton,
  Chip,
  LinearProgress,
  Tooltip,
  ButtonGroup,
  Button,
  Drawer,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Collapse,
  Menu,
  MenuItem
} from '@mui/material';

// Import existing dashboards
import Dashboard from './Dashboard';
import ExecutiveDashboard from './ExecutiveDashboard';
import EmpireDashboard from './EmpireDashboard';
import SquareLiveCockpit from './SquareLiveCockpit';
import AutonomousAgentDashboard from './AutonomousAgentDashboard';

/**
 * 🚀 ULTIMATE CLOUD COCKPIT - Better than Odoo
 *
 * Features:
 * - Unified dashboard hub with ALL business layers
 * - 1-2 click drill-down to any layer
 * - Voice + Video + Text reasoning integration
 * - Data-rich widgets at fingertips
 * - Real-time performance monitoring
 * - Customizable layouts with drag-drop (future)
 *
 * Philosophy: "Catch all the data, drill to any layer, always peak performance"
 */

const UltimateCockpit = () => {
  // State management
  const [activeLayer, setActiveLayer] = useState('overview');
  const [reasoningMode, setReasoningMode] = useState('text'); // voice, video, text
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [liveData, setLiveData] = useState({});
  const [loading, setLoading] = useState(false);
  const [expandedLayers, setExpandedLayers] = useState({});
  const [filterMenu, setFilterMenu] = useState(null);
  const [customizeMode, setCustomizeMode] = useState(false);

  // Business layers structure
  const businessLayers = {
    overview: {
      name: 'Empire Overview',
      icon: <BusinessCenter />,
      color: '#10B981',
      component: null, // Custom overview
      metrics: ['revenue', 'customers', 'orders', 'compliance']
    },
    executive: {
      name: 'Executive Intelligence',
      icon: <Assessment />,
      color: '#3B82F6',
      component: ExecutiveDashboard,
      metrics: ['revenue', 'services', 'alerts', 'analytics']
    },
    empire: {
      name: 'Empire Operations',
      icon: <DashboardIcon />,
      color: '#8B5CF6',
      component: EmpireDashboard,
      metrics: ['engines', 'domains', 'products', 'vision']
    },
    square: {
      name: 'Square Live Cockpit',
      icon: <Storefront />,
      color: '#F59E0B',
      component: SquareLiveCockpit,
      metrics: ['transactions', 'inventory', 'customers', 'compliance']
    },
    autonomous: {
      name: 'AI Agent Swarm',
      icon: <AutoAwesome />,
      color: '#EC4899',
      component: AutonomousAgentDashboard,
      metrics: ['agents', 'tasks', 'learning', 'performance']
    },
    main: {
      name: 'Core Dashboard',
      icon: <Speed />,
      color: '#14B8A6',
      component: Dashboard,
      metrics: ['system', 'health', 'queues', 'logs']
    }
  };

  // Sub-layers for drill-down
  const subLayers = {
    revenue: {
      name: 'Revenue Analytics',
      icon: <AttachMoney />,
      views: ['daily', 'weekly', 'monthly', 'yearly', 'forecasts']
    },
    customers: {
      name: 'Customer Intelligence',
      icon: <People />,
      views: ['acquisition', 'retention', 'lifetime_value', 'segments']
    },
    inventory: {
      name: 'Inventory Management',
      icon: <Inventory />,
      views: ['stock_levels', 'low_stock', 'reorder', 'suppliers']
    },
    compliance: {
      name: 'Compliance Center',
      icon: <Gavel />,
      views: ['licenses', 'age_verification', 'coa_status', 'audits']
    },
    analytics: {
      name: 'Deep Analytics',
      icon: <Analytics />,
      views: ['trends', 'predictions', 'cohorts', 'attribution']
    }
  };

  // Fetch live data from all services
  const fetchLiveData = useCallback(async () => {
    setLoading(true);
    try {
      const BASE_URL = 'http://localhost';

      // Parallel fetch from all services
      const [integration, reasoning, crisis] = await Promise.all([
        fetch(`${BASE_URL}:3005/api/bigquery/dashboard`).then(r => r.json()).catch(() => ({})),
        fetch(`${BASE_URL}:4002/health`).then(r => r.json()).catch(() => ({})),
        fetch(`${BASE_URL}:5001/api/crisis/analytics`).then(r => r.json()).catch(() => ({}))
      ]);

      setLiveData({
        revenue: integration.revenue || 0,
        customers: integration.customers || 0,
        orders: integration.orders || 0,
        reasoning: reasoning.status || 'unknown',
        crisisConsults: crisis.totalConsultations || 0,
        timestamp: new Date().toISOString()
      });
    } catch (error) {
      console.error('Live data fetch error:', error);
    } finally {
      setLoading(false);
    }
  }, []);

  // Auto-refresh every 30 seconds
  useEffect(() => {
    fetchLiveData();
    const interval = setInterval(fetchLiveData, 30000);
    return () => clearInterval(interval);
  }, [fetchLiveData]);

  // Toggle layer expansion
  const toggleLayer = (layer) => {
    setExpandedLayers(prev => ({
      ...prev,
      [layer]: !prev[layer]
    }));
  };

  // Render reasoning mode selector
  const ReasoningModeSelector = () => (
    <Box sx={{ display: 'flex', gap: 1, mb: 2 }}>
      <Tooltip title="Voice Mode - Speak your commands">
        <IconButton
          onClick={() => setReasoningMode('voice')}
          sx={{
            bgcolor: reasoningMode === 'voice' ? '#10B981' : 'transparent',
            color: reasoningMode === 'voice' ? 'white' : '#94A3B8',
            '&:hover': { bgcolor: '#059669' }
          }}
        >
          <Mic />
        </IconButton>
      </Tooltip>

      <Tooltip title="Video Mode - Visual analysis">
        <IconButton
          onClick={() => setReasoningMode('video')}
          sx={{
            bgcolor: reasoningMode === 'video' ? '#3B82F6' : 'transparent',
            color: reasoningMode === 'video' ? 'white' : '#94A3B8',
            '&:hover': { bgcolor: '#2563EB' }
          }}
        >
          <Videocam />
        </IconButton>
      </Tooltip>

      <Tooltip title="Text Mode - Type your queries">
        <IconButton
          onClick={() => setReasoningMode('text')}
          sx={{
            bgcolor: reasoningMode === 'text' ? '#8B5CF6' : 'transparent',
            color: reasoningMode === 'text' ? 'white' : '#94A3B8',
            '&:hover': { bgcolor: '#7C3AED' }
          }}
        >
          <Chat />
        </IconButton>
      </Tooltip>
    </Box>
  );

  // Render quick metrics cards
  const QuickMetricCard = ({ title, value, icon, color, trend }) => (
    <motion.div
      whileHover={{ scale: 1.02, y: -2 }}
      transition={{ type: 'spring', stiffness: 300 }}
    >
      <Card
        sx={{
          background: `linear-gradient(135deg, ${color}15 0%, ${color}05 100%)`,
          border: `1px solid ${color}30`,
          cursor: 'pointer'
        }}
      >
        <CardContent>
          <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
            <Box sx={{ color, mr: 1 }}>{icon}</Box>
            <Typography variant="body2" sx={{ color: '#94A3B8' }}>
              {title}
            </Typography>
          </Box>
          <Typography variant="h4" sx={{ color: 'white', fontWeight: 'bold', mb: 0.5 }}>
            {value}
          </Typography>
          {trend && (
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
              <TrendingUp sx={{ fontSize: 16, color: '#10B981' }} />
              <Typography variant="caption" sx={{ color: '#10B981' }}>
                {trend}
              </Typography>
            </Box>
          )}
        </CardContent>
      </Card>
    </motion.div>
  );

  // Render layer navigation sidebar
  const LayerSidebar = () => (
    <Drawer
      variant="permanent"
      open={sidebarOpen}
      sx={{
        width: sidebarOpen ? 280 : 64,
        flexShrink: 0,
        '& .MuiDrawer-paper': {
          width: sidebarOpen ? 280 : 64,
          boxSizing: 'border-box',
          bgcolor: '#0F172A',
          borderRight: '1px solid #334155',
          transition: 'width 0.3s'
        }
      }}
    >
      <Box sx={{ p: 2, borderBottom: '1px solid #334155' }}>
        <Typography
          variant="h6"
          sx={{
            color: '#10B981',
            fontWeight: 'bold',
            display: sidebarOpen ? 'block' : 'none'
          }}
        >
          🚀 LivHana Empire
        </Typography>
        <Typography
          variant="caption"
          sx={{
            color: '#64748B',
            display: sidebarOpen ? 'block' : 'none'
          }}
        >
          Ultimate Cloud Cockpit
        </Typography>
      </Box>

      <List>
        {Object.entries(businessLayers).map(([key, layer]) => (
          <React.Fragment key={key}>
            <ListItem
              button
              selected={activeLayer === key}
              onClick={() => {
                setActiveLayer(key);
                if (!sidebarOpen) setSidebarOpen(true);
              }}
              sx={{
                '&.Mui-selected': {
                  bgcolor: `${layer.color}20`,
                  borderLeft: `3px solid ${layer.color}`
                }
              }}
            >
              <ListItemIcon sx={{ color: layer.color, minWidth: sidebarOpen ? 40 : 'auto' }}>
                {layer.icon}
              </ListItemIcon>
              {sidebarOpen && (
                <ListItemText
                  primary={layer.name}
                  primaryTypographyProps={{
                    sx: { color: 'white', fontSize: '0.9rem' }
                  }}
                />
              )}
              {sidebarOpen && layer.metrics && (
                <IconButton
                  size="small"
                  onClick={(e) => {
                    e.stopPropagation();
                    toggleLayer(key);
                  }}
                >
                  <ExpandMore
                    sx={{
                      color: '#64748B',
                      transform: expandedLayers[key] ? 'rotate(180deg)' : 'rotate(0deg)',
                      transition: 'transform 0.3s'
                    }}
                  />
                </IconButton>
              )}
            </ListItem>

            {/* Sub-layer drill-down */}
            {sidebarOpen && (
              <Collapse in={expandedLayers[key]} timeout="auto" unmountOnExit>
                <List component="div" disablePadding>
                  {layer.metrics?.map((metric) => (
                    <ListItem
                      key={metric}
                      button
                      sx={{ pl: 4 }}
                      onClick={() => {
                        setActiveLayer(`${key}.${metric}`);
                      }}
                    >
                      <ListItemIcon sx={{ minWidth: 30 }}>
                        {subLayers[metric]?.icon}
                      </ListItemIcon>
                      <ListItemText
                        primary={subLayers[metric]?.name || metric}
                        primaryTypographyProps={{
                          sx: { color: '#94A3B8', fontSize: '0.85rem' }
                        }}
                      />
                    </ListItem>
                  ))}
                </List>
              </Collapse>
            )}
          </React.Fragment>
        ))}
      </List>

      {/* Sidebar toggle button */}
      <Box sx={{ position: 'absolute', bottom: 16, left: sidebarOpen ? 16 : 8 }}>
        <IconButton
          onClick={() => setSidebarOpen(!sidebarOpen)}
          sx={{ color: '#64748B' }}
        >
          <FilterList />
        </IconButton>
      </Box>
    </Drawer>
  );

  // Render overview layer (custom unified view)
  const OverviewLayer = () => (
    <Box>
      {/* Top metrics */}
      <Grid container spacing={2} sx={{ mb: 3 }}>
        <Grid item xs={12} sm={6} md={3}>
          <QuickMetricCard
            title="Today's Revenue"
            value={`$${(liveData.revenue || 0).toLocaleString()}`}
            icon={<AttachMoney />}
            color="#10B981"
            trend={liveData.revenueTrend || "No data"}
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <QuickMetricCard
            title="Active Customers"
            value={(liveData.customers || 0).toLocaleString()}
            icon={<People />}
            color="#3B82F6"
            trend={liveData.customersTrend || "No data"}
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <QuickMetricCard
            title="Total Orders"
            value={(liveData.orders || 0).toLocaleString()}
            icon={<Storefront />}
            color="#F59E0B"
            trend={liveData.ordersTrend || "No data"}
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <QuickMetricCard
            title="Crisis Consults"
            value={(liveData.crisisConsults || 0).toLocaleString()}
            icon={<Security />}
            color="#EC4899"
            trend={liveData.consultsTrend || "No data"}
          />
        </Grid>
      </Grid>

      {/* Quick access to all layers */}
      <Typography variant="h6" sx={{ color: 'white', mb: 2, fontWeight: 'bold' }}>
        🎯 Quick Access - All Business Layers
      </Typography>
      <Grid container spacing={2}>
        {Object.entries(businessLayers).filter(([key]) => key !== 'overview').map(([key, layer]) => (
          <Grid item xs={12} sm={6} md={4} key={key}>
            <motion.div
              whileHover={{ scale: 1.03, y: -4 }}
              whileTap={{ scale: 0.98 }}
            >
              <Card
                onClick={() => setActiveLayer(key)}
                sx={{
                  background: `linear-gradient(135deg, ${layer.color}20 0%, ${layer.color}05 100%)`,
                  border: `1px solid ${layer.color}40`,
                  cursor: 'pointer',
                  transition: 'all 0.3s'
                }}
              >
                <CardContent>
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                    <Box sx={{ color: layer.color, mr: 2, fontSize: 32 }}>
                      {layer.icon}
                    </Box>
                    <Typography variant="h6" sx={{ color: 'white', fontWeight: 'bold' }}>
                      {layer.name}
                    </Typography>
                  </Box>
                  <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                    {layer.metrics?.map((metric) => (
                      <Chip
                        key={metric}
                        label={metric}
                        size="small"
                        sx={{
                          bgcolor: `${layer.color}15`,
                          color: layer.color,
                          fontSize: '0.75rem'
                        }}
                      />
                    ))}
                  </Box>
                </CardContent>
              </Card>
            </motion.div>
          </Grid>
        ))}
      </Grid>
    </Box>
  );

  // Render active layer content
  const renderLayerContent = () => {
    // Check if drilling into sub-layer
    if (activeLayer.includes('.')) {
      const [mainLayer, subLayer] = activeLayer.split('.');
      return (
        <Box>
          <Typography variant="h5" sx={{ color: 'white', mb: 2 }}>
            {subLayers[subLayer]?.name || subLayer}
          </Typography>
          <Typography variant="body2" sx={{ color: '#94A3B8', mb: 3 }}>
            Deep dive into {subLayer} - Real-time data and analytics
          </Typography>
          {/* TODO: Render specific sub-layer component */}
          <Card sx={{ bgcolor: '#1E293B', p: 3 }}>
            <Typography sx={{ color: 'white' }}>
              Sub-layer view for {subLayer} coming soon...
            </Typography>
          </Card>
        </Box>
      );
    }

    // Render main layer
    if (activeLayer === 'overview') {
      return <OverviewLayer />;
    }

    const layer = businessLayers[activeLayer];
    if (layer && layer.component) {
      const LayerComponent = layer.component;
      return <LayerComponent />;
    }

    return <OverviewLayer />;
  };

  return (
    <Box sx={{ display: 'flex', minHeight: '100vh', bgcolor: '#0F172A' }}>
      {/* Sidebar navigation */}
      <LayerSidebar />

      {/* Main content area */}
      <Box
        sx={{
          flexGrow: 1,
          p: 3,
          ml: sidebarOpen ? 0 : 0,
          transition: 'margin 0.3s'
        }}
      >
        {/* Top toolbar */}
        <Box sx={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          mb: 3,
          pb: 2,
          borderBottom: '1px solid #334155'
        }}>
          <Box>
            <Typography variant="h4" sx={{ color: 'white', fontWeight: 'bold' }}>
              {businessLayers[activeLayer.split('.')[0]]?.name || 'Empire Overview'}
            </Typography>
            <Typography variant="body2" sx={{ color: '#64748B' }}>
              Real-time intelligence • {new Date().toLocaleString()} • Mode: {reasoningMode.toUpperCase()}
            </Typography>
          </Box>

          <Box sx={{ display: 'flex', gap: 2, alignItems: 'center' }}>
            {/* Reasoning mode selector */}
            <ReasoningModeSelector />

            {/* Action buttons */}
            <Tooltip title="Refresh data">
              <IconButton
                onClick={fetchLiveData}
                sx={{ color: '#64748B' }}
                disabled={loading}
              >
                <Refresh sx={{ animation: loading ? 'spin 1s linear infinite' : 'none' }} />
              </IconButton>
            </Tooltip>

            <Tooltip title="Fullscreen">
              <IconButton sx={{ color: '#64748B' }}>
                <Fullscreen />
              </IconButton>
            </Tooltip>

            <Tooltip title="Customize">
              <IconButton
                onClick={() => setCustomizeMode(!customizeMode)}
                sx={{ color: customizeMode ? '#10B981' : '#64748B' }}
              >
                <Settings />
              </IconButton>
            </Tooltip>

            <Chip
              icon={<CloudQueue />}
              label="LIVE"
              sx={{
                bgcolor: '#10B98120',
                color: '#10B981',
                fontWeight: 'bold',
                animation: 'pulse 2s infinite'
              }}
            />
          </Box>
        </Box>

        {/* Loading indicator */}
        {loading && <LinearProgress sx={{ mb: 2 }} />}

        {/* Layer content */}
        <AnimatePresence mode="wait">
          <motion.div
            key={activeLayer}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.3 }}
          >
            {renderLayerContent()}
          </motion.div>
        </AnimatePresence>

        {/* Customize mode overlay */}
        {customizeMode && (
          <Box
            sx={{
              position: 'fixed',
              top: 0,
              right: 0,
              width: 300,
              height: '100vh',
              bgcolor: '#1E293B',
              borderLeft: '1px solid #334155',
              p: 3,
              zIndex: 1000
            }}
          >
            <Typography variant="h6" sx={{ color: 'white', mb: 2 }}>
              🎨 Customize Cockpit
            </Typography>
            <Typography variant="body2" sx={{ color: '#94A3B8', mb: 2 }}>
              Drag widgets, change layouts, set preferences - Coming soon!
            </Typography>
            <Button
              fullWidth
              variant="outlined"
              onClick={() => setCustomizeMode(false)}
            >
              Close
            </Button>
          </Box>
        )}
      </Box>

      {/* Global styles for animations */}
      <style>{`
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
        @keyframes pulse {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.5; }
        }
      `}</style>
    </Box>
  );
};

export default UltimateCockpit;

// Optimized: 2025-10-02
