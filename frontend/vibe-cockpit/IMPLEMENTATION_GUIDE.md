# CONSOLIDATION IMPLEMENTATION GUIDE

**Detailed step-by-step instructions with code examples**

---

## PHASE 1: DELETE STUB COMPONENTS

### Step 1.1: Delete Files
```bash
cd /Users/jesseniesen/LivHana-Trinity-Local/LivHana-SoT/frontend/vibe-cockpit

# Delete stub components
rm src/components/VibeCoding.jsx
rm src/components/AgentSwarm.jsx
rm src/components/PilotTraining.jsx
```

### Step 1.2: Update App.jsx
**File:** `src/App.jsx`

**Remove these imports (lines 19, 20, 22):**
```javascript
// DELETE
const VibeCoding = lazy(() => import('./components/VibeCoding'));
const AgentSwarm = lazy(() => import('./components/AgentSwarm'));
const PilotTraining = lazy(() => import('./components/PilotTraining'));
```

**Remove these routes (lines 218, 219, 224):**
```javascript
// DELETE
<Route path="/vibe-coding" element={<ErrorBoundary componentName="VibeCoding"><VibeCoding /></ErrorBoundary>} />
<Route path="/agent-swarm" element={<ErrorBoundary componentName="AgentSwarm"><AgentSwarm /></ErrorBoundary>} />
<Route path="/pilot-training" element={<ErrorBoundary componentName="PilotTraining"><PilotTraining /></ErrorBoundary>} />
```

### Step 1.3: Update Sidebar.jsx
**File:** `src/components/Sidebar.jsx`

Find and remove navigation links for deleted components:
```javascript
// DELETE these menu items
{
  text: 'Vibe Coding',
  path: '/vibe-coding',
  icon: <Code />
},
{
  text: 'Agent Swarm',
  path: '/agent-swarm',
  icon: <Group />
},
{
  text: 'Pilot Training',
  path: '/pilot-training',
  icon: <School />
}
```

### Step 1.4: Verify
```bash
npm run build
# Should see 3 fewer chunks in output
# Verify no errors
```

---

## PHASE 2: CREATE UNIFIED API CLIENT

### Step 2.1: Create API Client File
**File:** `src/api/livhanaApiClient.js`

```javascript
/**
 * Unified LivHana API Client
 * Single source of truth for ALL backend communication
 */
import axios from 'axios';
import { getSessionToken } from '../utils/auth';

// Service endpoints
const SERVICES = {
  integration: import.meta.env.VITE_INTEGRATION_API || 'http://localhost:3005',
  cannabis: import.meta.env.VITE_CANNABIS_API || 'http://localhost:3003',
  payment: import.meta.env.VITE_PAYMENT_API || 'http://localhost:3004',
  voice: import.meta.env.VITE_VOICE_API || 'http://localhost:4001',
  reasoning: import.meta.env.VITE_REASONING_API || 'http://localhost:4002',
  product: import.meta.env.VITE_PRODUCT_API || 'http://localhost:3002',
};

// Create axios instance
const client = axios.create({
  timeout: 30000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor - add auth token
client.interceptors.request.use(
  (config) => {
    const token = getSessionToken();
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    config.headers['x-request-id'] = `req_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor - handle errors
client.interceptors.response.use(
  (response) => response.data,
  (error) => {
    if (error.response?.status === 401) {
      console.error('Authentication failed - clearing token');
      localStorage.removeItem('livhana_session_token');
    }

    const errorMessage = error.response?.data?.error || error.message;
    console.error('API Error:', errorMessage);
    return Promise.reject(new Error(errorMessage));
  }
);

// Helper to build URL with service
const buildUrl = (service, path) => {
  const baseUrl = SERVICES[service];
  return `${baseUrl}${path}`;
};

// Unified API methods
export const api = {
  // BigQuery endpoints (integration-service)
  bigquery: {
    dashboard: () => client.get(buildUrl('integration', '/api/bigquery/dashboard')),
    historical: () => client.get(buildUrl('integration', '/api/bigquery/historical')),
    products: () => client.get(buildUrl('integration', '/api/bigquery/products')),
    compliance: () => client.get(buildUrl('integration', '/api/compliance/metrics')),
  },

  // Health checks
  health: {
    integration: () => client.get(buildUrl('integration', '/health')),
    cannabis: () => client.get(buildUrl('cannabis', '/health')),
    payment: () => client.get(buildUrl('payment', '/health')),
    voice: () => client.get(buildUrl('voice', '/health')),
    reasoning: () => client.get(buildUrl('reasoning', '/health')),
    product: () => client.get(buildUrl('product', '/health')),

    // Get all health statuses in parallel
    all: async () => {
      const services = ['integration', 'cannabis', 'payment', 'voice', 'reasoning', 'product'];
      const results = await Promise.allSettled(
        services.map(service => api.health[service]())
      );

      return services.reduce((acc, service, idx) => {
        acc[service] = results[idx].status === 'fulfilled'
          ? { status: 'healthy', ...results[idx].value }
          : { status: 'unhealthy', error: results[idx].reason.message };
        return acc;
      }, {});
    },
  },

  // Reasoning endpoints
  reasoning: {
    enqueue: (data) => client.post(buildUrl('reasoning', '/api/reasoning/enqueue'), data),
    result: (jobId) => client.get(buildUrl('reasoning', `/api/reasoning/result/${jobId}`)),
    stream: (jobId) => {
      // EventSource for SSE
      const url = buildUrl('reasoning', `/api/reasoning/stream/${jobId}`);
      return new EventSource(url);
    },
  },

  // Voice endpoints
  voice: {
    synthesize: (data) => client.post(buildUrl('voice', '/api/elevenlabs/synthesize'), data, {
      responseType: 'blob',
      headers: { Accept: 'audio/mpeg' }
    }),
    healthVoiceMode: () => client.get(buildUrl('voice', '/health/voice-mode')),
  },

  // Autonomous agent endpoints
  autonomous: {
    execute: (task, context, requireApproval) =>
      client.post(buildUrl('reasoning', '/api/autonomous/execute'), {
        task, context, requireApproval
      }),
    getTask: (taskId) => client.get(buildUrl('reasoning', `/api/autonomous/tasks/${taskId}`)),
    getTasks: (params) => client.get(buildUrl('reasoning', '/api/autonomous/tasks'), { params }),
    cancelTask: (taskId) => client.delete(buildUrl('reasoning', `/api/autonomous/tasks/${taskId}`)),
    approve: (taskId, reason) =>
      client.post(buildUrl('reasoning', `/api/autonomous/approve/${taskId}`), {
        approved: true, reason
      }),
    reject: (taskId, reason) =>
      client.post(buildUrl('reasoning', `/api/autonomous/approve/${taskId}`), {
        approved: false, reason
      }),
  },
};

export default api;
```

### Step 2.2: Update ExecutiveDashboard.jsx
**File:** `src/components/ExecutiveDashboard.jsx`

**Replace lines 148-343 (all fetch functions) with:**
```javascript
import api from '../api/livhanaApiClient';

// ... inside component ...

// BEFORE: 6 separate fetch functions
// AFTER: Use unified API client

const fetchBigQueryData = async () => {
  try {
    const data = await api.bigquery.dashboard();

    if (data && data.metrics) {
      setRevenueMetrics({
        today: data.metrics.todayRevenue || 0,
        week: data.metrics.weekRevenue || 0,
        month: data.metrics.monthRevenue || 0,
        year: data.metrics.yearRevenue || 0,
      });
      // ... rest of state updates ...
    }
  } catch (err) {
    console.error('BigQuery fetch error:', err);
    setAlerts(prev => ({
      ...prev,
      system: [...prev.system, { message: 'Failed to fetch revenue data', severity: 'warning' }]
    }));
  }
};

const fetchHistoricalData = async () => {
  try {
    const data = await api.bigquery.historical();
    if (data && data.daily) {
      setRevenueHistory(data.daily.slice(0, 7).reverse());
    }
  } catch (err) {
    console.error('Historical data fetch error:', err);
  }
};

const fetchProductData = async () => {
  try {
    const data = await api.bigquery.products();
    if (data && data.products) {
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

const fetchServiceHealth = async () => {
  try {
    const healthData = await api.health.all();
    setServiceHealth(healthData);

    const systemAlerts = Object.entries(healthData)
      .filter(([_, health]) => health.status === 'unhealthy')
      .map(([service, health]) => ({
        message: `${service} is unreachable: ${health.error}`,
        severity: 'error',
      }));

    if (systemAlerts.length > 0) {
      setAlerts(prev => ({ ...prev, system: systemAlerts }));
    }
  } catch (err) {
    console.error('Health check failed:', err);
  }
};

const fetchComplianceData = async () => {
  try {
    const data = await api.bigquery.compliance();
    setComplianceMetrics({
      ageVerificationRate: data.metrics?.ageVerification?.successRate || 0,
      coaValidationRate: data.metrics?.productCompliance?.coaCoverage || 0,
      texasComplianceScore: data.metrics?.texasCompliance?.score || 0,
      activeLicenses: 1,
      expiringLicenses: [],
    });
  } catch (error) {
    console.error('Failed to fetch compliance data:', error);
    setComplianceMetrics({
      ageVerificationRate: null,
      coaValidationRate: null,
      activeLicenses: null,
      expiringLicenses: [],
    });
    setAlerts(prev => ({
      ...prev,
      system: [...prev.system, {
        message: 'Compliance data unavailable - service may be offline',
        severity: 'warning'
      }]
    }));
  }
};
```

### Step 2.3: Update SquareLiveCockpit.jsx
**File:** `src/components/SquareLiveCockpit.jsx`

**Replace lines 33-59 with:**
```javascript
import api from '../api/livhanaApiClient';

const fetchLiveData = async () => {
  try {
    const [dashboard, historical, products] = await Promise.all([
      api.bigquery.dashboard(),
      api.bigquery.historical(),
      api.bigquery.products()
    ]);

    setLiveData({
      ...dashboard,
      historicalData: historical.historical || [],
      dailyData: historical.daily || [],
      monthlyData: historical.monthly || [],
      catalog: products.products || [],
      topSellers: products.topSellers || [],
      mode: dashboard.mode
    });

    setLoading(false);
  } catch (error) {
    console.error('Failed to fetch BigQuery data:', error);
    setLoading(false);
  }
};
```

### Step 2.4: Update UltimateCockpit.jsx
**File:** `src/components/UltimateCockpit.jsx`

**Replace lines 157-182 with:**
```javascript
import api from '../api/livhanaApiClient';

const fetchLiveData = useCallback(async () => {
  setLoading(true);
  try {
    const [integration, reasoning, crisis] = await Promise.all([
      api.bigquery.dashboard(),
      api.health.reasoning(),
      fetch('http://localhost:5001/api/crisis/analytics').then(r => r.json()).catch(() => ({}))
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
```

### Step 2.5: Update VoiceMode.jsx
**File:** `src/components/VoiceMode.jsx`

**Replace lines 158-173 (speakWithElevenLabs function) with:**
```javascript
import api from '../api/livhanaApiClient';

const speakWithElevenLabs = async (text) => {
  try {
    setIsSpeaking(true);
    setAgentStatus('speaking');
    setHealthStatus((prev) => ({ ...prev, voice: 'healthy' }));

    const audioBlob = await api.voice.synthesize({
      text: text,
      voiceId: selectedVoice,
      voiceSettings: {
        stability: stability / 100,
        similarity_boost: similarityBoost / 100
      }
    });

    const audioUrl = URL.createObjectURL(audioBlob);
    const audio = new Audio(audioUrl);
    audioRef.current = audio;

    audio.onended = () => {
      setIsSpeaking(false);
      setAgentStatus('ready');
      setHealthStatus((prev) => ({ ...prev, voice: 'healthy' }));
      URL.revokeObjectURL(audioUrl);
    };

    audio.onerror = () => {
      console.error('Audio playback error');
      setIsSpeaking(false);
      setAgentStatus('error');
      setHealthStatus((prev) => ({ ...prev, voice: 'down' }));
      URL.revokeObjectURL(audioUrl);
    };

    await audio.play();

  } catch (error) {
    console.error('Voice TTS error:', error);
    setIsSpeaking(false);
    setAgentStatus('error');
    setHealthStatus((prev) => ({ ...prev, voice: 'down' }));

    if (error.message.includes('Authentication') || error.message.includes('Unauthorized')) {
      alert(`Authentication Error: ${error.message}\n\nPlease log in to use voice features.`);
    } else {
      alert(`Voice synthesis failed: ${error.message}`);
    }
  }
};
```

### Step 2.6: Delete autonomousApi.js
**Note:** After verifying everything works with the new API client

```bash
rm src/utils/autonomousApi.js
```

---

## PHASE 3: LIFT DATA FETCHING TO ULTIMATECOCKPIT

### Step 3.1: Refactor UltimateCockpit.jsx Data Layer
**File:** `src/components/UltimateCockpit.jsx`

**Add unified data state (after line 79):**
```javascript
const [unifiedData, setUnifiedData] = useState({
  bigquery: {
    metrics: {},
    historical: [],
    products: [],
    recentTransactions: [],
  },
  health: {},
  reasoning: {},
});
```

**Update fetchLiveData to fetch ALL data (replace lines 157-182):**
```javascript
const fetchLiveData = useCallback(async () => {
  setLoading(true);
  try {
    // Fetch all data in parallel
    const [bigqueryDashboard, bigqueryHistorical, bigqueryProducts, healthStatuses] = await Promise.all([
      api.bigquery.dashboard(),
      api.bigquery.historical(),
      api.bigquery.products(),
      api.health.all(),
    ]);

    // Unified state update
    setUnifiedData({
      bigquery: {
        metrics: bigqueryDashboard.metrics || {},
        recentTransactions: bigqueryDashboard.recentTransactions || [],
        historical: bigqueryHistorical.daily || [],
        products: bigqueryProducts.products || [],
        topProducts: bigqueryProducts.topSellers || [],
      },
      health: healthStatuses,
      reasoning: healthStatuses.reasoning || {},
    });

    // Legacy state for overview layer
    setLiveData({
      revenue: bigqueryDashboard.metrics?.todayRevenue || 0,
      customers: bigqueryDashboard.metrics?.totalCustomers || 0,
      orders: bigqueryDashboard.metrics?.totalTransactions || 0,
      reasoning: healthStatuses.reasoning?.status || 'unknown',
      crisisConsults: 0,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('Live data fetch error:', error);
  } finally {
    setLoading(false);
  }
}, []);
```

**Update renderLayerContent to pass data to children (around line 504):**
```javascript
const renderLayerContent = () => {
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
        <Card sx={{ bgcolor: '#1E293B', p: 3 }}>
          <Typography sx={{ color: 'white' }}>
            Sub-layer view for {subLayer} coming soon...
          </Typography>
        </Card>
      </Box>
    );
  }

  if (activeLayer === 'overview') {
    return <OverviewLayer />;
  }

  const layer = businessLayers[activeLayer];
  if (layer && layer.component) {
    const LayerComponent = layer.component;

    // Pass appropriate data to each component
    switch (activeLayer) {
      case 'executive':
        return <LayerComponent data={unifiedData} />;
      case 'empire':
        return <LayerComponent data={unifiedData.bigquery} />;
      case 'square':
        return <LayerComponent data={unifiedData.bigquery} />;
      case 'main':
        return <LayerComponent data={unifiedData} />;
      case 'autonomous':
        return <LayerComponent />;
      default:
        return <LayerComponent />;
    }
  }

  return <OverviewLayer />;
};
```

### Step 3.2: Refactor ExecutiveDashboard to Accept Props
**File:** `src/components/ExecutiveDashboard.jsx`

**Update component signature (line 79):**
```javascript
const ExecutiveDashboard = ({ data }) => {
  // Remove all fetch functions
  // Remove loading state (parent handles loading)
  // Use data from props instead of state
```

**Replace data fetching with prop usage:**
```javascript
// BEFORE: useState + useEffect + fetch functions
// AFTER: Derive from props

const revenueMetrics = data?.bigquery?.metrics
  ? {
      today: data.bigquery.metrics.todayRevenue || 0,
      week: data.bigquery.metrics.weekRevenue || 0,
      month: data.bigquery.metrics.monthRevenue || 0,
      year: data.bigquery.metrics.yearRevenue || 0,
    }
  : { today: 0, week: 0, month: 0, year: 0 };

const orderMetrics = data?.bigquery?.recentTransactions
  ? {
      today: data.bigquery.recentTransactions.filter(t => {
        const txDate = new Date(t.created_at);
        const dayAgo = Date.now() - 24 * 60 * 60 * 1000;
        return txDate.getTime() >= dayAgo;
      }).length || 0,
      total: data.bigquery.metrics?.totalTransactions || 0,
    }
  : { today: 0, total: 0 };

const topProducts = data?.bigquery?.products
  ?.filter(p => p.price > 0)
  ?.sort((a, b) => b.price - a.price)
  ?.slice(0, 5) || [];

const revenueHistory = data?.bigquery?.historical?.slice(0, 7).reverse() || [];
```

**Remove these sections:**
```javascript
// DELETE: All useState for data
// DELETE: All fetch functions (lines 148-395)
// DELETE: fetchAllData function
// DELETE: useEffect for data fetching
// KEEP: Loading/error from props, UI rendering
```

### Step 3.3: Refactor SquareLiveCockpit to Accept Props
**File:** `src/components/SquareLiveCockpit.jsx`

**Update component signature (line 10):**
```javascript
const SquareLiveCockpit = ({ data }) => {
  // Remove data state
  // Remove fetchLiveData
  // Use data from props
```

**Replace data fetching (lines 11-66) with:**
```javascript
// Derive from props
const liveData = {
  metrics: data?.metrics || {
    todayRevenue: 0,
    weekRevenue: 0,
    monthRevenue: 0,
    yearRevenue: 0,
    totalTransactions: 0,
    totalCustomers: 0,
    avgOrderValue: 0
  },
  topProducts: data?.topProducts || [],
  recentTransactions: data?.recentTransactions || [],
  historicalData: data?.historical || [],
  lastUpdate: new Date().toISOString(),
  mode: data?.mode || 'live'
};

// Remove useEffect for data fetching
// Keep refresh button to trigger parent refresh
```

### Step 3.4: Refactor EmpireDashboard to Accept Props
**File:** `src/components/EmpireDashboard.jsx`

**Update component signature (line 4):**
```javascript
const EmpireDashboard = ({ data }) => {
  // Use data from props for revenue metrics
  // Remove mock data, use real BigQuery data if available
```

**Replace lines 14-29 with:**
```javascript
const [liveMetrics, setLiveMetrics] = useState({
  dailyRevenue: data?.metrics?.todayRevenue || 0,
  activeEngines: 9,
  domainStatus: {},
  productViews: data?.metrics?.totalTransactions || 0
});

// Remove animation loop, use real data
useEffect(() => {
  if (data?.metrics?.todayRevenue) {
    setLiveMetrics(prev => ({
      ...prev,
      dailyRevenue: data.metrics.todayRevenue
    }));
  }
}, [data]);
```

---

## PHASE 4: CENTRALIZE STYLING

### Step 4.1: Create Styles File
**File:** `src/theme/styles.js`

```javascript
/**
 * Centralized Style Constants
 * Single source of truth for all component styling
 */

// Card Styles
export const cardStyles = {
  glass: {
    background: 'linear-gradient(135deg, #1E293B 0%, #334155 100%)',
    border: '1px solid rgba(148, 163, 184, 0.1)',
    borderRadius: 2,
  },

  glassHover: {
    background: 'linear-gradient(135deg, #1E293B 0%, #334155 100%)',
    border: '1px solid rgba(148, 163, 184, 0.1)',
    borderRadius: 2,
    cursor: 'pointer',
    transition: 'all 0.3s',
    '&:hover': {
      transform: 'translateY(-4px)',
      boxShadow: '0 8px 25px rgba(0, 0, 0, 0.15)',
    },
  },

  metric: {
    background: 'linear-gradient(135deg, #1E293B 0%, #334155 100%)',
    border: '1px solid rgba(148, 163, 184, 0.1)',
    borderRadius: 3,
  },
};

// Button Styles
export const buttonStyles = {
  primary: {
    backgroundColor: '#16A34A',
    color: 'white',
    '&:hover': { backgroundColor: '#15803D' },
    fontWeight: 600,
  },

  secondary: {
    backgroundColor: '#F59E0B',
    color: 'white',
    '&:hover': { backgroundColor: '#D97706' },
    fontWeight: 600,
  },

  danger: {
    backgroundColor: '#EF4444',
    color: 'white',
    '&:hover': { backgroundColor: '#DC2626' },
    fontWeight: 600,
  },

  outline: {
    borderColor: '#374151',
    color: '#E5E7EB',
    '&:hover': { borderColor: '#4B5563' },
  },
};

// Layout Styles
export const layoutStyles = {
  flexCenter: {
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
  },

  flexBetween: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
  },

  flexColumn: {
    display: 'flex',
    flexDirection: 'column',
  },

  fullHeight: {
    minHeight: '100vh',
  },

  container: {
    maxWidth: 'xl',
    mt: 2,
  },
};

// Typography Styles
export const textStyles = {
  gradient: (from, to) => ({
    background: `linear-gradient(135deg, ${from} 0%, ${to} 100%)`,
    WebkitBackgroundClip: 'text',
    WebkitTextFillColor: 'transparent',
    backgroundClip: 'text',
    fontWeight: 800,
  }),

  greenGradient: {
    background: 'linear-gradient(135deg, #16A34A 0%, #F59E0B 100%)',
    WebkitBackgroundClip: 'text',
    WebkitTextFillColor: 'transparent',
    backgroundClip: 'text',
    fontWeight: 800,
  },
};

// Icon Button Styles
export const iconButtonStyles = {
  primary: {
    backgroundColor: '#16A34A',
    color: 'white',
    '&:hover': { backgroundColor: '#15803D' },
  },

  danger: {
    backgroundColor: '#EF4444',
    color: 'white',
    '&:hover': { backgroundColor: '#DC2626' },
  },

  warning: {
    backgroundColor: '#F59E0B',
    color: 'white',
    '&:hover': { backgroundColor: '#D97706' },
  },

  neutral: {
    backgroundColor: '#374151',
    color: 'white',
    '&:hover': { backgroundColor: '#4B5563' },
  },
};

// Chip Styles
export const chipStyles = {
  success: {
    bgcolor: '#10B98120',
    color: '#10B981',
    fontWeight: 'bold',
  },

  warning: {
    bgcolor: '#F59E0B20',
    color: '#F59E0B',
    fontWeight: 'bold',
  },

  error: {
    bgcolor: '#EF444420',
    color: '#EF4444',
    fontWeight: 'bold',
  },

  info: {
    bgcolor: '#3B82F620',
    color: '#3B82F6',
    fontWeight: 'bold',
  },
};

// Paper/Container Styles
export const containerStyles = {
  dark: {
    backgroundColor: '#374151',
    p: 2,
    borderRadius: 1,
  },

  darker: {
    backgroundColor: '#1E293B',
    p: 3,
    borderRadius: 2,
  },
};

// Color Palette (for non-MUI components)
export const colors = {
  primary: '#16A34A',
  secondary: '#F59E0B',
  danger: '#EF4444',
  success: '#10B981',
  warning: '#F59E0B',
  info: '#3B82F6',
  purple: '#8B5CF6',
  cyan: '#06B6D4',

  // Grays
  gray50: '#F8FAFC',
  gray100: '#F1F5F9',
  gray200: '#E2E8F0',
  gray300: '#CBD5E1',
  gray400: '#94A3B8',
  gray500: '#64748B',
  gray600: '#475569',
  gray700: '#334155',
  gray800: '#1E293B',
  gray900: '#0F172A',
};

export default {
  cardStyles,
  buttonStyles,
  layoutStyles,
  textStyles,
  iconButtonStyles,
  chipStyles,
  containerStyles,
  colors,
};
```

### Step 4.2: Update Components to Use Centralized Styles

**Example: ExecutiveDashboard.jsx**

**Before:**
```javascript
<Card
  sx={{
    background: 'linear-gradient(135deg, #1E293B 0%, #334155 100%)',
    border: '1px solid rgba(148, 163, 184, 0.1)',
    borderRadius: 2,
  }}
>
```

**After:**
```javascript
import { cardStyles } from '../theme/styles';

<Card sx={cardStyles.glass}>
```

**Before:**
```javascript
<Button
  variant="contained"
  sx={{
    backgroundColor: '#16A34A',
    '&:hover': { backgroundColor: '#15803D' }
  }}
>
```

**After:**
```javascript
import { buttonStyles } from '../theme/styles';

<Button variant="contained" sx={buttonStyles.primary}>
```

### Step 4.3: Batch Update All Components

**Files to update:**
- `src/components/ExecutiveDashboard.jsx`
- `src/components/UltimateCockpit.jsx`
- `src/components/Dashboard.jsx`
- `src/components/VoiceMode.jsx`
- `src/components/VideoMode.jsx`
- `src/components/Sidebar.jsx`
- `src/components/Header.jsx`

**Search and replace patterns:**
```javascript
// Pattern 1: Glass cards
sx={{
  background: 'linear-gradient(135deg, #1E293B 0%, #334155 100%)',
  border: '1px solid rgba(148, 163, 184, 0.1)',
  borderRadius: 2,
}}
// Replace with: sx={cardStyles.glass}

// Pattern 2: Primary buttons
sx={{
  backgroundColor: '#16A34A',
  '&:hover': { backgroundColor: '#15803D' }
}}
// Replace with: sx={buttonStyles.primary}

// Pattern 3: Flex center
sx={{
  display: 'flex',
  justifyContent: 'center',
  alignItems: 'center',
}}
// Replace with: sx={layoutStyles.flexCenter}
```

---

## PHASE 5: UPDATE TESTS

### Step 5.1: Create API Client Tests
**File:** `src/api/livhanaApiClient.test.js`

```javascript
import { describe, it, expect, vi, beforeEach } from 'vitest';
import axios from 'axios';
import api from './livhanaApiClient';

vi.mock('axios');

describe('Unified API Client', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('BigQuery endpoints', () => {
    it('should fetch dashboard data', async () => {
      const mockData = { metrics: { todayRevenue: 1000 } };
      axios.get.mockResolvedValue({ data: mockData });

      const result = await api.bigquery.dashboard();

      expect(axios.get).toHaveBeenCalledWith(
        expect.stringContaining('/api/bigquery/dashboard')
      );
      expect(result).toEqual(mockData);
    });

    it('should fetch historical data', async () => {
      const mockData = { daily: [] };
      axios.get.mockResolvedValue({ data: mockData });

      const result = await api.bigquery.historical();

      expect(axios.get).toHaveBeenCalledWith(
        expect.stringContaining('/api/bigquery/historical')
      );
      expect(result).toEqual(mockData);
    });
  });

  describe('Health endpoints', () => {
    it('should fetch all health statuses', async () => {
      axios.get.mockResolvedValue({ data: { status: 'healthy' } });

      const result = await api.health.all();

      expect(result).toHaveProperty('integration');
      expect(result).toHaveProperty('reasoning');
      expect(result).toHaveProperty('voice');
    });

    it('should handle health check failures gracefully', async () => {
      axios.get.mockRejectedValue(new Error('Service unavailable'));

      const result = await api.health.all();

      expect(result.integration.status).toBe('unhealthy');
    });
  });

  describe('Error handling', () => {
    it('should handle 401 errors', async () => {
      const mockError = {
        response: { status: 401, data: { error: 'Unauthorized' } }
      };
      axios.get.mockRejectedValue(mockError);

      await expect(api.bigquery.dashboard()).rejects.toThrow('Unauthorized');
    });
  });
});
```

### Step 5.2: Update Component Tests

**File:** `src/components/ExecutiveDashboard.test.jsx`

```javascript
import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import ExecutiveDashboard from './ExecutiveDashboard';

describe('ExecutiveDashboard', () => {
  const mockData = {
    bigquery: {
      metrics: {
        todayRevenue: 1000,
        weekRevenue: 7000,
        monthRevenue: 30000,
        yearRevenue: 365000,
        totalTransactions: 100,
        totalCustomers: 50,
        avgOrderValue: 20,
      },
      recentTransactions: [],
      historical: [],
      products: [],
    },
    health: {
      integration: { status: 'healthy' },
      reasoning: { status: 'healthy' },
    },
  };

  it('should render revenue metrics from props', () => {
    render(<ExecutiveDashboard data={mockData} />);

    expect(screen.getByText('$1,000')).toBeInTheDocument();
    expect(screen.getByText('$7,000')).toBeInTheDocument();
    expect(screen.getByText('$30,000')).toBeInTheDocument();
  });

  it('should handle missing data gracefully', () => {
    render(<ExecutiveDashboard data={{}} />);

    expect(screen.getByText('$0')).toBeInTheDocument();
  });
});
```

---

## VERIFICATION CHECKLIST

### After Each Phase:

```bash
# 1. Verify build succeeds
npm run build

# 2. Check bundle size
du -sh dist/assets/

# 3. Run tests
npm run test

# 4. Run dev server and manually test
npm run dev

# 5. Check for console errors
# Open browser DevTools → Console
# Navigate through all routes
# Verify no errors or warnings
```

### Final Verification:

```bash
# Build production bundle
npm run build

# Verify bundle size target met
# Target: < 800KB total assets
du -sh dist/assets/

# Run all tests
npm run test

# Run E2E tests
npm run test:e2e

# Performance test
npm run preview
# Use Lighthouse in Chrome DevTools
# Target: Performance score > 90
```

---

## ROLLBACK PLAN

If consolidation causes issues:

```bash
# Revert to previous commit
git log --oneline | head -10
git revert <commit-hash>

# Or reset to before consolidation
git reset --hard <commit-before-consolidation>

# Rebuild
npm run build
```

---

## SUCCESS CRITERIA

- [ ] All stub components deleted
- [ ] Unified API client implemented
- [ ] All components use unified API client
- [ ] Data fetching lifted to UltimateCockpit
- [ ] Sub-dashboards accept data as props
- [ ] Centralized styles implemented
- [ ] 327 inline styles reduced to ~50 references
- [ ] Bundle size < 800KB
- [ ] All tests passing
- [ ] No console errors
- [ ] Performance score > 90
- [ ] Zero breaking changes for users

---

**IMPLEMENTATION COMPLETE. READY FOR EXECUTION.**
