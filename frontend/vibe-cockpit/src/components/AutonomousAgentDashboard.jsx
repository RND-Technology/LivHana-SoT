import React, { useState, useEffect, useRef } from 'react';
import {
  Box,
  Grid,
  Card,
  CardContent,
  CardHeader,
  Typography,
  TextField,
  Button,
  IconButton,
  Chip,
  Avatar,
  LinearProgress,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  ListItemSecondaryAction,
  Divider,
  Tab,
  Tabs,
  Alert,
  AlertTitle,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Switch,
  FormControlLabel,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Tooltip,
  Badge,
  CircularProgress,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Autocomplete,
} from '@mui/material';
import {
  PlayArrow,
  Stop,
  Cancel,
  CheckCircle,
  Error,
  Warning,
  Refresh,
  Delete,
  Edit,
  Visibility,
  GetApp,
  Undo,
  Settings,
  Timeline,
  TrendingUp,
  Speed,
  Security,
  BugReport,
  Assessment,
  Search,
  FilterList,
  ExpandMore,
  ThumbUp,
  ThumbDown,
  SmartToy,
  Psychology,
  CloudQueue,
  Storage,
  NetworkCheck,
  PowerSettingsNew,
  Block,
  Replay,
  Extension,
  Science,
} from '@mui/icons-material';
import { motion, AnimatePresence } from 'framer-motion';
import { Line, Bar, Doughnut } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  Title,
  Tooltip as ChartTooltip,
  Legend,
} from 'chart.js';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  Title,
  ChartTooltip,
  Legend
);

const AutonomousAgentDashboard = () => {
  // State Management
  const [activeTab, setActiveTab] = useState(0);
  const [taskDescription, setTaskDescription] = useState('');
  const [taskContext, setTaskContext] = useState({
    customerId: '',
    domain: '',
    priority: 'medium',
    requireApproval: true,
  });
  const [activeTasks, setActiveTasks] = useState([]);
  const [approvalQueue, setApprovalQueue] = useState([]);
  const [executionHistory, setExecutionHistory] = useState([]);
  const [agentStatus, setAgentStatus] = useState({
    online: true,
    currentLoad: 23,
    queueDepth: 5,
    errorRate: 0.02,
  });
  const [learnings, setLearnings] = useState({
    patterns: [],
    successRate: {},
    failureModes: [],
    suggestions: [],
  });
  const [capabilities, setCapabilities] = useState([]);
  const [improvements, setImprovements] = useState([]);
  const [metrics, setMetrics] = useState({
    tasksPerDay: [],
    successRateOverTime: [],
    performanceImprovements: [],
    apiCosts: [],
  });
  const [safetySettings, setSafetySettings] = useState({
    emergencyStop: false,
    approvalRequired: true,
    sandboxMode: false,
    rollbackEnabled: true,
  });
  const [selectedTask, setSelectedTask] = useState(null);
  const [streamMessages, setStreamMessages] = useState([]);
  const [filters, setFilters] = useState({
    status: 'all',
    dateRange: 'week',
    searchTerm: '',
  });

  const eventSourceRef = useRef(null);

  // SSE Connection for Real-Time Updates
  useEffect(() => {
    connectSSE();
    fetchInitialData();

    return () => {
      if (eventSourceRef.current) {
        eventSourceRef.current.close();
      }
    };
  }, []);

  const connectSSE = () => {
    const eventSource = new EventSource('/api/agent/stream');
    eventSourceRef.current = eventSource;

    eventSource.onmessage = (event) => {
      const data = JSON.parse(event.data);
      handleSSEMessage(data);
    };

    eventSource.onerror = (error) => {
      console.error('SSE Error:', error);
      // Reconnect after 5 seconds
      setTimeout(connectSSE, 5000);
    };
  };

  const handleSSEMessage = (data) => {
    switch (data.type) {
      case 'task_update':
        updateTask(data.taskId, data.update);
        break;
      case 'task_complete':
        completeTask(data.taskId, data.result);
        break;
      case 'approval_required':
        addToApprovalQueue(data.task);
        break;
      case 'learning_discovered':
        addLearning(data.learning);
        break;
      case 'status_update':
        updateAgentStatus(data.status);
        break;
      case 'stream_message':
        addStreamMessage(data.message);
        break;
      default:
        console.log('Unknown SSE message type:', data.type);
    }
  };

  const fetchInitialData = async () => {
    try {
      const [tasksRes, historyRes, capabilitiesRes, learnRes, metricsRes, improvRes] =
        await Promise.all([
          fetch('/api/agent/tasks'),
          fetch('/api/agent/history'),
          fetch('/api/agent/capabilities'),
          fetch('/api/agent/learnings'),
          fetch('/api/agent/metrics'),
          fetch('/api/agent/improvements'),
        ]);

      setActiveTasks(await tasksRes.json());
      setExecutionHistory(await historyRes.json());
      setCapabilities(await capabilitiesRes.json());
      setLearnings(await learnRes.json());
      setMetrics(await metricsRes.json());
      setImprovements(await improvRes.json());
    } catch (error) {
      console.error('Failed to fetch initial data:', error);
    }
  };

  // Task Execution
  const executeTask = async () => {
    if (!taskDescription.trim()) return;

    const task = {
      id: `task_${Date.now()}`,
      description: taskDescription,
      context: taskContext,
      status: 'pending',
      progress: 0,
      steps: [],
      startTime: new Date(),
    };

    try {
      const response = await fetch('/api/agent/execute', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(task),
      });

      if (response.ok) {
        setActiveTasks([...activeTasks, task]);
        setTaskDescription('');
        setStreamMessages([]);
      }
    } catch (error) {
      console.error('Failed to execute task:', error);
    }
  };

  const cancelTask = async (taskId) => {
    try {
      await fetch(`/api/agent/tasks/${taskId}/cancel`, { method: 'POST' });
      setActiveTasks(activeTasks.filter(t => t.id !== taskId));
    } catch (error) {
      console.error('Failed to cancel task:', error);
    }
  };

  const approveTask = async (taskId) => {
    try {
      await fetch(`/api/agent/tasks/${taskId}/approve`, { method: 'POST' });
      setApprovalQueue(approvalQueue.filter(t => t.id !== taskId));
    } catch (error) {
      console.error('Failed to approve task:', error);
    }
  };

  const rejectTask = async (taskId) => {
    try {
      await fetch(`/api/agent/tasks/${taskId}/reject`, { method: 'POST' });
      setApprovalQueue(approvalQueue.filter(t => t.id !== taskId));
    } catch (error) {
      console.error('Failed to reject task:', error);
    }
  };

  const rollbackChanges = async (count) => {
    if (!window.confirm(`Rollback last ${count} changes?`)) return;

    try {
      await fetch('/api/agent/rollback', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ count }),
      });
    } catch (error) {
      console.error('Failed to rollback:', error);
    }
  };

  const emergencyStop = async () => {
    if (!window.confirm('EMERGENCY STOP: This will halt all agent operations. Continue?')) return;

    try {
      await fetch('/api/agent/emergency-stop', { method: 'POST' });
      setSafetySettings({ ...safetySettings, emergencyStop: true });
      setActiveTasks([]);
    } catch (error) {
      console.error('Failed to execute emergency stop:', error);
    }
  };

  const testCapability = async (capability) => {
    try {
      const response = await fetch(`/api/agent/capabilities/${capability.id}/test`, {
        method: 'POST',
      });
      const result = await response.json();
      alert(`Test Result: ${result.success ? 'Success' : 'Failed'}\n${result.message}`);
    } catch (error) {
      console.error('Failed to test capability:', error);
    }
  };

  const exportHistory = () => {
    const data = JSON.stringify(executionHistory, null, 2);
    const blob = new Blob([data], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `agent-history-${Date.now()}.json`;
    a.click();
  };

  const replayTask = async (taskId) => {
    const task = executionHistory.find(t => t.id === taskId);
    if (!task) return;

    setTaskDescription(task.description);
    setTaskContext(task.context);
  };

  const updateTask = (taskId, update) => {
    setActiveTasks(activeTasks.map(t =>
      t.id === taskId ? { ...t, ...update } : t
    ));
  };

  const completeTask = (taskId, result) => {
    const task = activeTasks.find(t => t.id === taskId);
    if (task) {
      setExecutionHistory([{ ...task, ...result, endTime: new Date() }, ...executionHistory]);
      setActiveTasks(activeTasks.filter(t => t.id !== taskId));
    }
  };

  const addToApprovalQueue = (task) => {
    setApprovalQueue([...approvalQueue, task]);
  };

  const addLearning = (learning) => {
    setLearnings({
      ...learnings,
      patterns: [learning, ...learnings.patterns],
    });
  };

  const updateAgentStatus = (status) => {
    setAgentStatus({ ...agentStatus, ...status });
  };

  const addStreamMessage = (message) => {
    setStreamMessages(prev => [...prev, message]);
  };

  // Chart Data
  const tasksPerDayData = {
    labels: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
    datasets: [{
      label: 'Tasks Completed',
      data: [12, 19, 15, 25, 22, 18, 20],
      borderColor: '#16A34A',
      backgroundColor: 'rgba(22, 163, 74, 0.1)',
      tension: 0.4,
    }],
  };

  const successRateData = {
    labels: ['Week 1', 'Week 2', 'Week 3', 'Week 4'],
    datasets: [{
      label: 'Success Rate (%)',
      data: [85, 88, 92, 95],
      borderColor: '#3B82F6',
      backgroundColor: 'rgba(59, 130, 246, 0.1)',
      tension: 0.4,
    }],
  };

  const taskTypeDistribution = {
    labels: ['Data Processing', 'API Integration', 'Report Generation', 'System Maintenance', 'Other'],
    datasets: [{
      data: [30, 25, 20, 15, 10],
      backgroundColor: [
        '#16A34A',
        '#3B82F6',
        '#F59E0B',
        '#8B5CF6',
        '#EF4444',
      ],
    }],
  };

  const costData = {
    labels: ['Week 1', 'Week 2', 'Week 3', 'Week 4'],
    datasets: [{
      label: 'API Costs ($)',
      data: [45, 52, 48, 50],
      backgroundColor: '#F59E0B',
    }],
  };

  // Helper Functions
  const getStatusColor = (status) => {
    switch (status) {
      case 'running': return 'primary';
      case 'completed': return 'success';
      case 'failed': return 'error';
      case 'pending': return 'warning';
      default: return 'default';
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'running': return <PlayArrow />;
      case 'completed': return <CheckCircle />;
      case 'failed': return <Error />;
      case 'pending': return <Warning />;
      default: return <Stop />;
    }
  };

  const getRiskLevel = (risk) => {
    switch (risk) {
      case 'low': return { color: 'success', label: 'Low Risk' };
      case 'medium': return { color: 'warning', label: 'Medium Risk' };
      case 'high': return { color: 'error', label: 'High Risk' };
      default: return { color: 'default', label: 'Unknown' };
    }
  };

  // Tab Panels
  const TaskExecutionPanel = () => (
    <Grid container spacing={3}>
      <Grid item xs={12} md={8}>
        <Card>
          <CardHeader
            avatar={<Avatar sx={{ bgcolor: '#16A34A' }}><SmartToy /></Avatar>}
            title="Execute New Task"
            subheader="Describe the task for the autonomous agent"
          />
          <CardContent>
            <TextField
              fullWidth
              multiline
              rows={4}
              label="Task Description"
              placeholder="Example: Generate a comprehensive sales report for Q4 2024..."
              value={taskDescription}
              onChange={(e) => setTaskDescription(e.target.value)}
              sx={{ mb: 3 }}
            />

            <Grid container spacing={2} sx={{ mb: 3 }}>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Customer ID"
                  placeholder="CUST-12345"
                  value={taskContext.customerId}
                  onChange={(e) => setTaskContext({ ...taskContext, customerId: e.target.value })}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Domain"
                  placeholder="sales, operations, etc."
                  value={taskContext.domain}
                  onChange={(e) => setTaskContext({ ...taskContext, domain: e.target.value })}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <FormControl fullWidth>
                  <InputLabel>Priority</InputLabel>
                  <Select
                    value={taskContext.priority}
                    label="Priority"
                    onChange={(e) => setTaskContext({ ...taskContext, priority: e.target.value })}
                  >
                    <MenuItem value="low">Low</MenuItem>
                    <MenuItem value="medium">Medium</MenuItem>
                    <MenuItem value="high">High</MenuItem>
                    <MenuItem value="urgent">Urgent</MenuItem>
                  </Select>
                </FormControl>
              </Grid>
              <Grid item xs={12} sm={6}>
                <FormControlLabel
                  control={
                    <Switch
                      checked={taskContext.requireApproval}
                      onChange={(e) => setTaskContext({ ...taskContext, requireApproval: e.target.checked })}
                    />
                  }
                  label="Require Approval"
                />
              </Grid>
            </Grid>

            <Button
              variant="contained"
              size="large"
              startIcon={<PlayArrow />}
              onClick={executeTask}
              fullWidth
              disabled={!taskDescription.trim()}
              sx={{ bgcolor: '#16A34A', '&:hover': { bgcolor: '#15803D' } }}
            >
              Execute Task
            </Button>
          </CardContent>
        </Card>
      </Grid>

      <Grid item xs={12} md={4}>
        <Card sx={{ height: '100%' }}>
          <CardHeader
            avatar={<Avatar sx={{ bgcolor: '#3B82F6' }}><Timeline /></Avatar>}
            title="Real-Time Progress"
          />
          <CardContent>
            {streamMessages.length === 0 ? (
              <Box textAlign="center" py={4}>
                <Typography color="textSecondary">
                  No active execution
                </Typography>
              </Box>
            ) : (
              <List dense>
                {streamMessages.map((msg, idx) => (
                  <ListItem key={idx}>
                    <ListItemIcon>
                      <CheckCircle fontSize="small" color="success" />
                    </ListItemIcon>
                    <ListItemText
                      primary={msg.action}
                      secondary={msg.timestamp}
                    />
                  </ListItem>
                ))}
              </List>
            )}
          </CardContent>
        </Card>
      </Grid>
    </Grid>
  );

  const ActiveTasksList = () => (
    <Card>
      <CardHeader
        avatar={<Avatar sx={{ bgcolor: '#F59E0B' }}><Speed /></Avatar>}
        title="Active Tasks"
        subheader={`${activeTasks.length} tasks currently running`}
      />
      <CardContent>
        {activeTasks.length === 0 ? (
          <Box textAlign="center" py={4}>
            <Typography color="textSecondary">No active tasks</Typography>
          </Box>
        ) : (
          <List>
            {activeTasks.map((task) => (
              <motion.div
                key={task.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, x: -100 }}
              >
                <ListItem
                  sx={{
                    bgcolor: 'rgba(0,0,0,0.02)',
                    borderRadius: 2,
                    mb: 2,
                    border: '1px solid rgba(0,0,0,0.1)',
                  }}
                >
                  <ListItemIcon>
                    {getStatusIcon(task.status)}
                  </ListItemIcon>
                  <ListItemText
                    primary={task.description}
                    secondary={
                      <Box>
                        <Typography variant="caption" display="block">
                          Started: {new Date(task.startTime).toLocaleTimeString()}
                        </Typography>
                        <LinearProgress
                          variant="determinate"
                          value={task.progress || 0}
                          sx={{ mt: 1, mb: 1 }}
                        />
                        <Typography variant="caption">
                          Progress: {task.progress || 0}%
                        </Typography>
                        {task.steps && task.steps.length > 0 && (
                          <Box mt={1}>
                            {task.steps.map((step, idx) => (
                              <Chip
                                key={idx}
                                label={step}
                                size="small"
                                sx={{ mr: 0.5, mt: 0.5 }}
                              />
                            ))}
                          </Box>
                        )}
                      </Box>
                    }
                  />
                  <ListItemSecondaryAction>
                    <Tooltip title="Cancel Task">
                      <IconButton
                        edge="end"
                        onClick={() => cancelTask(task.id)}
                        color="error"
                      >
                        <Cancel />
                      </IconButton>
                    </Tooltip>
                  </ListItemSecondaryAction>
                </ListItem>
              </motion.div>
            ))}
          </List>
        )}
      </CardContent>
    </Card>
  );

  const ApprovalQueue = () => (
    <Card>
      <CardHeader
        avatar={
          <Badge badgeContent={approvalQueue.length} color="error">
            <Avatar sx={{ bgcolor: '#EF4444' }}><Warning /></Avatar>
          </Badge>
        }
        title="Approval Queue"
        subheader="Tasks awaiting your approval"
      />
      <CardContent>
        {approvalQueue.length === 0 ? (
          <Box textAlign="center" py={4}>
            <CheckCircle sx={{ fontSize: 60, color: '#16A34A', mb: 2 }} />
            <Typography color="textSecondary">
              No pending approvals
            </Typography>
          </Box>
        ) : (
          <List>
            {approvalQueue.map((task) => (
              <Card key={task.id} sx={{ mb: 2, bgcolor: '#FEF3C7' }}>
                <CardContent>
                  <Box display="flex" justifyContent="space-between" mb={2}>
                    <Typography variant="h6">{task.description}</Typography>
                    <Chip
                      label={getRiskLevel(task.risk).label}
                      color={getRiskLevel(task.risk).color}
                      size="small"
                    />
                  </Box>

                  <Typography variant="subtitle2" gutterBottom>
                    Proposed Changes:
                  </Typography>
                  <Paper variant="outlined" sx={{ p: 2, mb: 2, bgcolor: 'white' }}>
                    <pre style={{ margin: 0, fontSize: '0.85rem', whiteSpace: 'pre-wrap' }}>
                      {task.changes || 'No changes specified'}
                    </pre>
                  </Paper>

                  <Typography variant="subtitle2" gutterBottom>
                    Risk Assessment:
                  </Typography>
                  <Alert severity={getRiskLevel(task.risk).color} sx={{ mb: 2 }}>
                    {task.riskAssessment || 'Standard operation with minimal risk'}
                  </Alert>

                  <Box display="flex" gap={1}>
                    <Button
                      variant="contained"
                      color="success"
                      startIcon={<ThumbUp />}
                      onClick={() => approveTask(task.id)}
                      fullWidth
                    >
                      Approve
                    </Button>
                    <Button
                      variant="outlined"
                      color="error"
                      startIcon={<ThumbDown />}
                      onClick={() => rejectTask(task.id)}
                      fullWidth
                    >
                      Reject
                    </Button>
                  </Box>
                </CardContent>
              </Card>
            ))}
          </List>
        )}
      </CardContent>
    </Card>
  );

  const LearningsDashboard = () => (
    <Grid container spacing={3}>
      <Grid item xs={12} md={6}>
        <Card>
          <CardHeader
            avatar={<Avatar sx={{ bgcolor: '#8B5CF6' }}><Psychology /></Avatar>}
            title="Discovered Patterns"
          />
          <CardContent>
            <List>
              {learnings.patterns.map((pattern, idx) => (
                <ListItem key={idx}>
                  <ListItemIcon>
                    <Science color="primary" />
                  </ListItemIcon>
                  <ListItemText
                    primary={pattern.description}
                    secondary={`Confidence: ${pattern.confidence}%`}
                  />
                </ListItem>
              ))}
            </List>
          </CardContent>
        </Card>
      </Grid>

      <Grid item xs={12} md={6}>
        <Card>
          <CardHeader
            avatar={<Avatar sx={{ bgcolor: '#3B82F6' }}><Assessment /></Avatar>}
            title="Success Rate by Task Type"
          />
          <CardContent>
            <Box height={300}>
              <Doughnut
                data={taskTypeDistribution}
                options={{
                  responsive: true,
                  maintainAspectRatio: false,
                  plugins: {
                    legend: {
                      position: 'bottom',
                    },
                  },
                }}
              />
            </Box>
          </CardContent>
        </Card>
      </Grid>

      <Grid item xs={12} md={6}>
        <Card>
          <CardHeader
            avatar={<Avatar sx={{ bgcolor: '#EF4444' }}><BugReport /></Avatar>}
            title="Common Failure Modes"
          />
          <CardContent>
            <TableContainer>
              <Table size="small">
                <TableHead>
                  <TableRow>
                    <TableCell>Failure Type</TableCell>
                    <TableCell align="right">Occurrences</TableCell>
                    <TableCell align="right">Impact</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {learnings.failureModes.map((mode, idx) => (
                    <TableRow key={idx}>
                      <TableCell>{mode.type}</TableCell>
                      <TableCell align="right">{mode.count}</TableCell>
                      <TableCell align="right">
                        <Chip
                          label={mode.impact}
                          size="small"
                          color={mode.impact === 'High' ? 'error' : 'warning'}
                        />
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          </CardContent>
        </Card>
      </Grid>

      <Grid item xs={12} md={6}>
        <Card>
          <CardHeader
            avatar={<Avatar sx={{ bgcolor: '#16A34A' }}><TrendingUp /></Avatar>}
            title="Optimization Suggestions"
          />
          <CardContent>
            <List>
              {learnings.suggestions.map((suggestion, idx) => (
                <Alert key={idx} severity="info" sx={{ mb: 1 }}>
                  <AlertTitle>{suggestion.title}</AlertTitle>
                  {suggestion.description}
                </Alert>
              ))}
            </List>
          </CardContent>
        </Card>
      </Grid>
    </Grid>
  );

  const CapabilitiesBrowser = () => (
    <Grid container spacing={3}>
      {capabilities.map((capability) => (
        <Grid item xs={12} sm={6} md={4} key={capability.id}>
          <Card sx={{ height: '100%' }}>
            <CardHeader
              avatar={
                <Avatar sx={{ bgcolor: capability.color || '#3B82F6' }}>
                  <Extension />
                </Avatar>
              }
              title={capability.name}
              subheader={`Used ${capability.usageCount} times`}
              action={
                <Chip
                  label={capability.status}
                  size="small"
                  color={capability.status === 'active' ? 'success' : 'default'}
                />
              }
            />
            <CardContent>
              <Typography variant="body2" color="textSecondary" paragraph>
                {capability.description}
              </Typography>

              <Box display="flex" justifyContent="space-between" mb={2}>
                <Typography variant="caption" color="textSecondary">
                  Success Rate
                </Typography>
                <Typography variant="caption" fontWeight="bold">
                  {capability.successRate}%
                </Typography>
              </Box>
              <LinearProgress
                variant="determinate"
                value={capability.successRate}
                sx={{ mb: 2 }}
              />

              <Box display="flex" gap={1}>
                <Button
                  size="small"
                  variant="contained"
                  startIcon={<PlayArrow />}
                  onClick={() => testCapability(capability)}
                  fullWidth
                >
                  Test
                </Button>
                <Button
                  size="small"
                  variant="outlined"
                  startIcon={<Visibility />}
                  fullWidth
                >
                  Docs
                </Button>
              </Box>
            </CardContent>
          </Card>
        </Grid>
      ))}
    </Grid>
  );

  const ExecutionHistory = () => {
    const filteredHistory = executionHistory.filter(task => {
      if (filters.status !== 'all' && task.status !== filters.status) return false;
      if (filters.searchTerm && !task.description.toLowerCase().includes(filters.searchTerm.toLowerCase())) return false;
      return true;
    });

    return (
      <Card>
        <CardHeader
          avatar={<Avatar sx={{ bgcolor: '#8B5CF6' }}><Timeline /></Avatar>}
          title="Execution History"
          subheader={`${executionHistory.length} total tasks`}
          action={
            <Button startIcon={<GetApp />} onClick={exportHistory}>
              Export JSON
            </Button>
          }
        />
        <CardContent>
          <Box display="flex" gap={2} mb={3}>
            <TextField
              size="small"
              placeholder="Search tasks..."
              value={filters.searchTerm}
              onChange={(e) => setFilters({ ...filters, searchTerm: e.target.value })}
              InputProps={{
                startAdornment: <Search sx={{ mr: 1, color: 'action.disabled' }} />,
              }}
              sx={{ flexGrow: 1 }}
            />
            <FormControl size="small" sx={{ minWidth: 120 }}>
              <InputLabel>Status</InputLabel>
              <Select
                value={filters.status}
                label="Status"
                onChange={(e) => setFilters({ ...filters, status: e.target.value })}
              >
                <MenuItem value="all">All</MenuItem>
                <MenuItem value="completed">Completed</MenuItem>
                <MenuItem value="failed">Failed</MenuItem>
              </Select>
            </FormControl>
          </Box>

          <TableContainer component={Paper} variant="outlined">
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Task</TableCell>
                  <TableCell>Status</TableCell>
                  <TableCell>Duration</TableCell>
                  <TableCell>Started</TableCell>
                  <TableCell align="right">Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {filteredHistory.map((task) => (
                  <TableRow key={task.id} hover>
                    <TableCell>{task.description}</TableCell>
                    <TableCell>
                      <Chip
                        label={task.status}
                        color={getStatusColor(task.status)}
                        size="small"
                        icon={getStatusIcon(task.status)}
                      />
                    </TableCell>
                    <TableCell>
                      {task.duration ? `${task.duration}s` : 'N/A'}
                    </TableCell>
                    <TableCell>
                      {new Date(task.startTime).toLocaleString()}
                    </TableCell>
                    <TableCell align="right">
                      <Tooltip title="Replay Task">
                        <IconButton
                          size="small"
                          onClick={() => replayTask(task.id)}
                        >
                          <Replay />
                        </IconButton>
                      </Tooltip>
                      <Tooltip title="View Details">
                        <IconButton
                          size="small"
                          onClick={() => setSelectedTask(task)}
                        >
                          <Visibility />
                        </IconButton>
                      </Tooltip>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </CardContent>
      </Card>
    );
  };

  const SelfImprovementPanel = () => (
    <Card>
      <CardHeader
        avatar={<Avatar sx={{ bgcolor: '#F59E0B' }}><TrendingUp /></Avatar>}
        title="Self-Improvement Proposals"
        subheader="Agent-generated optimizations"
      />
      <CardContent>
        {improvements.length === 0 ? (
          <Box textAlign="center" py={4}>
            <Typography color="textSecondary">
              No pending improvements
            </Typography>
          </Box>
        ) : (
          improvements.map((improvement) => (
            <Accordion key={improvement.id}>
              <AccordionSummary expandIcon={<ExpandMore />}>
                <Box display="flex" alignItems="center" gap={2} width="100%">
                  <Typography variant="h6">{improvement.title}</Typography>
                  <Chip
                    label={improvement.status}
                    size="small"
                    color={improvement.status === 'pending' ? 'warning' : 'success'}
                  />
                </Box>
              </AccordionSummary>
              <AccordionDetails>
                <Typography paragraph>{improvement.description}</Typography>

                <Typography variant="subtitle2" gutterBottom>
                  Expected Impact:
                </Typography>
                <Box mb={2}>
                  <Chip label={`${improvement.speedup}x faster`} color="success" sx={{ mr: 1 }} />
                  <Chip label={`${improvement.costReduction}% cost reduction`} color="primary" sx={{ mr: 1 }} />
                  <Chip label={`${improvement.reliabilityImprovement}% more reliable`} color="info" />
                </Box>

                <Typography variant="subtitle2" gutterBottom>
                  Implementation Details:
                </Typography>
                <Paper variant="outlined" sx={{ p: 2, mb: 2, bgcolor: '#F9FAFB' }}>
                  <pre style={{ margin: 0, fontSize: '0.85rem', whiteSpace: 'pre-wrap' }}>
                    {improvement.implementation}
                  </pre>
                </Paper>

                {improvement.status === 'pending' && (
                  <Box display="flex" gap={1}>
                    <Button
                      variant="contained"
                      color="success"
                      startIcon={<ThumbUp />}
                      fullWidth
                    >
                      Approve & Implement
                    </Button>
                    <Button
                      variant="outlined"
                      color="error"
                      startIcon={<ThumbDown />}
                      fullWidth
                    >
                      Reject
                    </Button>
                  </Box>
                )}

                {improvement.status === 'implemented' && (
                  <Alert severity="success">
                    Implemented on {new Date(improvement.implementedAt).toLocaleString()}
                  </Alert>
                )}
              </AccordionDetails>
            </Accordion>
          ))
        )}
      </CardContent>
    </Card>
  );

  const SystemHealth = () => (
    <Grid container spacing={3}>
      <Grid item xs={12} md={3}>
        <Card>
          <CardContent>
            <Box display="flex" alignItems="center" justifyContent="space-between">
              <Box>
                <Typography variant="h6" color="textSecondary" gutterBottom>
                  Agent Status
                </Typography>
                <Chip
                  label={agentStatus.online ? 'Online' : 'Offline'}
                  color={agentStatus.online ? 'success' : 'error'}
                  icon={<PowerSettingsNew />}
                />
              </Box>
              <Avatar sx={{ bgcolor: agentStatus.online ? '#16A34A' : '#EF4444' }}>
                <SmartToy />
              </Avatar>
            </Box>
          </CardContent>
        </Card>
      </Grid>

      <Grid item xs={12} md={3}>
        <Card>
          <CardContent>
            <Box display="flex" alignItems="center" justifyContent="space-between">
              <Box>
                <Typography variant="h6" color="textSecondary" gutterBottom>
                  Current Load
                </Typography>
                <Typography variant="h4" fontWeight="bold">
                  {agentStatus.currentLoad}%
                </Typography>
              </Box>
              <Avatar sx={{ bgcolor: '#3B82F6' }}>
                <Speed />
              </Avatar>
            </Box>
            <LinearProgress
              variant="determinate"
              value={agentStatus.currentLoad}
              sx={{ mt: 2 }}
            />
          </CardContent>
        </Card>
      </Grid>

      <Grid item xs={12} md={3}>
        <Card>
          <CardContent>
            <Box display="flex" alignItems="center" justifyContent="space-between">
              <Box>
                <Typography variant="h6" color="textSecondary" gutterBottom>
                  Queue Depth
                </Typography>
                <Typography variant="h4" fontWeight="bold">
                  {agentStatus.queueDepth}
                </Typography>
              </Box>
              <Avatar sx={{ bgcolor: '#F59E0B' }}>
                <CloudQueue />
              </Avatar>
            </Box>
          </CardContent>
        </Card>
      </Grid>

      <Grid item xs={12} md={3}>
        <Card>
          <CardContent>
            <Box display="flex" alignItems="center" justifyContent="space-between">
              <Box>
                <Typography variant="h6" color="textSecondary" gutterBottom>
                  Error Rate
                </Typography>
                <Typography variant="h4" fontWeight="bold">
                  {(agentStatus.errorRate * 100).toFixed(2)}%
                </Typography>
              </Box>
              <Avatar sx={{ bgcolor: agentStatus.errorRate > 0.05 ? '#EF4444' : '#16A34A' }}>
                <NetworkCheck />
              </Avatar>
            </Box>
          </CardContent>
        </Card>
      </Grid>
    </Grid>
  );

  const SafetyControls = () => (
    <Card>
      <CardHeader
        avatar={<Avatar sx={{ bgcolor: '#EF4444' }}><Security /></Avatar>}
        title="Safety Controls"
        subheader="Critical agent operation controls"
      />
      <CardContent>
        <Alert severity="warning" sx={{ mb: 3 }}>
          <AlertTitle>Warning</AlertTitle>
          These controls affect critical agent operations. Use with caution.
        </Alert>

        <Grid container spacing={3}>
          <Grid item xs={12} md={6}>
            <Card variant="outlined" sx={{ bgcolor: '#FEE2E2', border: '2px solid #EF4444' }}>
              <CardContent>
                <Box display="flex" alignItems="center" justifyContent="space-between" mb={2}>
                  <Typography variant="h6" color="error">
                    Emergency Stop
                  </Typography>
                  <Block color="error" fontSize="large" />
                </Box>
                <Typography variant="body2" color="textSecondary" paragraph>
                  Immediately halt all agent operations and clear the task queue.
                </Typography>
                <Button
                  variant="contained"
                  color="error"
                  fullWidth
                  size="large"
                  startIcon={<Block />}
                  onClick={emergencyStop}
                  disabled={safetySettings.emergencyStop}
                >
                  {safetySettings.emergencyStop ? 'Already Stopped' : 'Emergency Stop'}
                </Button>
              </CardContent>
            </Card>
          </Grid>

          <Grid item xs={12} md={6}>
            <Card variant="outlined">
              <CardContent>
                <Box display="flex" alignItems="center" justifyContent="space-between" mb={2}>
                  <Typography variant="h6">
                    Rollback Changes
                  </Typography>
                  <Undo fontSize="large" color="primary" />
                </Box>
                <Typography variant="body2" color="textSecondary" paragraph>
                  Undo the last N changes made by the agent.
                </Typography>
                <Box display="flex" gap={1}>
                  <Button
                    variant="outlined"
                    onClick={() => rollbackChanges(1)}
                    fullWidth
                  >
                    Last 1
                  </Button>
                  <Button
                    variant="outlined"
                    onClick={() => rollbackChanges(5)}
                    fullWidth
                  >
                    Last 5
                  </Button>
                  <Button
                    variant="outlined"
                    onClick={() => rollbackChanges(10)}
                    fullWidth
                  >
                    Last 10
                  </Button>
                </Box>
              </CardContent>
            </Card>
          </Grid>

          <Grid item xs={12} md={4}>
            <Card variant="outlined">
              <CardContent>
                <FormControlLabel
                  control={
                    <Switch
                      checked={safetySettings.approvalRequired}
                      onChange={(e) => setSafetySettings({
                        ...safetySettings,
                        approvalRequired: e.target.checked
                      })}
                    />
                  }
                  label="Require Approval for All Tasks"
                />
                <Typography variant="caption" display="block" color="textSecondary">
                  All tasks will need manual approval before execution
                </Typography>
              </CardContent>
            </Card>
          </Grid>

          <Grid item xs={12} md={4}>
            <Card variant="outlined">
              <CardContent>
                <FormControlLabel
                  control={
                    <Switch
                      checked={safetySettings.sandboxMode}
                      onChange={(e) => setSafetySettings({
                        ...safetySettings,
                        sandboxMode: e.target.checked
                      })}
                    />
                  }
                  label="Sandbox Mode"
                />
                <Typography variant="caption" display="block" color="textSecondary">
                  Agent operates in isolated environment only
                </Typography>
              </CardContent>
            </Card>
          </Grid>

          <Grid item xs={12} md={4}>
            <Card variant="outlined">
              <CardContent>
                <FormControlLabel
                  control={
                    <Switch
                      checked={safetySettings.rollbackEnabled}
                      onChange={(e) => setSafetySettings({
                        ...safetySettings,
                        rollbackEnabled: e.target.checked
                      })}
                    />
                  }
                  label="Auto-Rollback on Failure"
                />
                <Typography variant="caption" display="block" color="textSecondary">
                  Automatically undo changes when errors occur
                </Typography>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      </CardContent>
    </Card>
  );

  const ChartsMetrics = () => (
    <Grid container spacing={3}>
      <Grid item xs={12} md={6}>
        <Card>
          <CardHeader
            title="Tasks Per Day"
            subheader="Daily task completion trends"
          />
          <CardContent>
            <Box height={300}>
              <Line
                data={tasksPerDayData}
                options={{
                  responsive: true,
                  maintainAspectRatio: false,
                  plugins: {
                    legend: {
                      display: false,
                    },
                  },
                }}
              />
            </Box>
          </CardContent>
        </Card>
      </Grid>

      <Grid item xs={12} md={6}>
        <Card>
          <CardHeader
            title="Success Rate Over Time"
            subheader="Weekly success rate improvements"
          />
          <CardContent>
            <Box height={300}>
              <Line
                data={successRateData}
                options={{
                  responsive: true,
                  maintainAspectRatio: false,
                  plugins: {
                    legend: {
                      display: false,
                    },
                  },
                  scales: {
                    y: {
                      min: 0,
                      max: 100,
                    },
                  },
                }}
              />
            </Box>
          </CardContent>
        </Card>
      </Grid>

      <Grid item xs={12} md={6}>
        <Card>
          <CardHeader
            title="API Usage Costs"
            subheader="Weekly cost tracking"
          />
          <CardContent>
            <Box height={300}>
              <Bar
                data={costData}
                options={{
                  responsive: true,
                  maintainAspectRatio: false,
                  plugins: {
                    legend: {
                      display: false,
                    },
                  },
                }}
              />
            </Box>
          </CardContent>
        </Card>
      </Grid>

      <Grid item xs={12} md={6}>
        <Card>
          <CardHeader
            title="Performance Summary"
            subheader="Key metrics at a glance"
          />
          <CardContent>
            <Grid container spacing={2}>
              <Grid item xs={6}>
                <Box textAlign="center" p={2}>
                  <Typography variant="h3" color="primary" fontWeight="bold">
                    156
                  </Typography>
                  <Typography variant="body2" color="textSecondary">
                    Tasks This Week
                  </Typography>
                </Box>
              </Grid>
              <Grid item xs={6}>
                <Box textAlign="center" p={2}>
                  <Typography variant="h3" color="success.main" fontWeight="bold">
                    95%
                  </Typography>
                  <Typography variant="body2" color="textSecondary">
                    Success Rate
                  </Typography>
                </Box>
              </Grid>
              <Grid item xs={6}>
                <Box textAlign="center" p={2}>
                  <Typography variant="h3" color="info.main" fontWeight="bold">
                    2.3s
                  </Typography>
                  <Typography variant="body2" color="textSecondary">
                    Avg Duration
                  </Typography>
                </Box>
              </Grid>
              <Grid item xs={6}>
                <Box textAlign="center" p={2}>
                  <Typography variant="h3" color="warning.main" fontWeight="bold">
                    $197
                  </Typography>
                  <Typography variant="body2" color="textSecondary">
                    Monthly Cost
                  </Typography>
                </Box>
              </Grid>
            </Grid>
          </CardContent>
        </Card>
      </Grid>
    </Grid>
  );

  return (
    <Box sx={{ p: 3 }}>
      {/* Header */}
      <Box mb={4}>
        <Typography
          variant="h3"
          component={motion.h3}
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          sx={{
            background: 'linear-gradient(135deg, #16A34A 0%, #3B82F6 100%)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            fontWeight: 800,
            mb: 1,
          }}
        >
          Autonomous Agent Control Center
        </Typography>
        <Typography variant="h6" color="textSecondary">
          Monitor, control, and optimize your autonomous agent operations
        </Typography>
      </Box>

      {/* Main Tabs */}
      <Paper sx={{ mb: 3 }}>
        <Tabs
          value={activeTab}
          onChange={(e, newValue) => setActiveTab(newValue)}
          variant="scrollable"
          scrollButtons="auto"
        >
          <Tab label="Execute Task" icon={<PlayArrow />} iconPosition="start" />
          <Tab label="Active Tasks" icon={<Speed />} iconPosition="start" />
          <Tab label="Approvals" icon={<Warning />} iconPosition="start" />
          <Tab label="Learnings" icon={<Psychology />} iconPosition="start" />
          <Tab label="Capabilities" icon={<Extension />} iconPosition="start" />
          <Tab label="History" icon={<Timeline />} iconPosition="start" />
          <Tab label="Improvements" icon={<TrendingUp />} iconPosition="start" />
          <Tab label="System Health" icon={<NetworkCheck />} iconPosition="start" />
          <Tab label="Safety" icon={<Security />} iconPosition="start" />
          <Tab label="Metrics" icon={<Assessment />} iconPosition="start" />
        </Tabs>
      </Paper>

      {/* Tab Content */}
      <AnimatePresence mode="wait">
        <motion.div
          key={activeTab}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
          transition={{ duration: 0.3 }}
        >
          {activeTab === 0 && <TaskExecutionPanel />}
          {activeTab === 1 && <ActiveTasksList />}
          {activeTab === 2 && <ApprovalQueue />}
          {activeTab === 3 && <LearningsDashboard />}
          {activeTab === 4 && <CapabilitiesBrowser />}
          {activeTab === 5 && <ExecutionHistory />}
          {activeTab === 6 && <SelfImprovementPanel />}
          {activeTab === 7 && <SystemHealth />}
          {activeTab === 8 && <SafetyControls />}
          {activeTab === 9 && <ChartsMetrics />}
        </motion.div>
      </AnimatePresence>

      {/* Task Details Dialog */}
      <Dialog
        open={!!selectedTask}
        onClose={() => setSelectedTask(null)}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>
          Task Details
          <IconButton
            onClick={() => setSelectedTask(null)}
            sx={{ position: 'absolute', right: 8, top: 8 }}
          >
            <Cancel />
          </IconButton>
        </DialogTitle>
        <DialogContent dividers>
          {selectedTask && (
            <Box>
              <Typography variant="h6" gutterBottom>
                {selectedTask.description}
              </Typography>
              <Grid container spacing={2} sx={{ mt: 2 }}>
                <Grid item xs={6}>
                  <Typography variant="caption" color="textSecondary">
                    Status
                  </Typography>
                  <Typography variant="body1">
                    <Chip
                      label={selectedTask.status}
                      color={getStatusColor(selectedTask.status)}
                      size="small"
                    />
                  </Typography>
                </Grid>
                <Grid item xs={6}>
                  <Typography variant="caption" color="textSecondary">
                    Duration
                  </Typography>
                  <Typography variant="body1">
                    {selectedTask.duration ? `${selectedTask.duration}s` : 'N/A'}
                  </Typography>
                </Grid>
                <Grid item xs={12}>
                  <Typography variant="caption" color="textSecondary">
                    Started
                  </Typography>
                  <Typography variant="body1">
                    {new Date(selectedTask.startTime).toLocaleString()}
                  </Typography>
                </Grid>
              </Grid>

              {selectedTask.result && (
                <Box mt={3}>
                  <Typography variant="subtitle2" gutterBottom>
                    Result:
                  </Typography>
                  <Paper variant="outlined" sx={{ p: 2, bgcolor: '#F9FAFB' }}>
                    <pre style={{ margin: 0, fontSize: '0.85rem', whiteSpace: 'pre-wrap' }}>
                      {JSON.stringify(selectedTask.result, null, 2)}
                    </pre>
                  </Paper>
                </Box>
              )}
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setSelectedTask(null)}>Close</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default AutonomousAgentDashboard;
