import React, { useState, useEffect } from 'react';
import {
  Box,
  Grid,
  Card,
  CardContent,
  Typography,
  Chip,
  LinearProgress,
  IconButton,
  Tooltip,
  Button,
  Tab,
  Tabs,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Slider,
  Alert,
  Divider,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
} from '@mui/material';
import {
  ExpandMore,
  Refresh,
  TrendingUp,
  CheckCircle,
  Target,
  EmojiEvents,
  Psychology,
  BusinessCenter,
  AttachMoney,
  Campaign,
  PointOfSale,
  Engineering,
  Groups,
  Description,
  Star,
  Pending,
  Assignment,
  Flag,
} from '@mui/icons-material';
import { motion } from 'framer-motion';
import { Radar, Line } from 'react-chartjs-2';

/**
 * 🎯 RPM VISIONEERING DASHBOARD
 *
 * Implements Jesse's proprietary "Remembering the Future" framework:
 * RPM → AOM → COI → RPM → HIGH FIVE
 *
 * Visualizes Wheel of Life progression: 0 → NOW → NEXT → 10
 * Across 8 AOM categories: Leadership, Operations, Marketing, Sales, Finance, Technology, Culture, SOP
 *
 * Integrated into vibe-cockpit as executive planning layer
 */

const RPMVisioneeringDashboard = () => {
  const [activeTab, setActiveTab] = useState(0);
  const [refreshing, setRefreshing] = useState(false);
  const [wheelScores, setWheelScores] = useState({
    leadership: { now: 6, next: 8, target: 10 },
    operations: { now: 5, next: 7.5, target: 10 },
    marketing: { now: 4, next: 7, target: 10 },
    sales: { now: 5, next: 7.5, target: 10 },
    finance: { now: 4, next: 7, target: 10 },
    technology: { now: 6, next: 8, target: 10 },
    culture: { now: 5, next: 7.5, target: 10 },
    sop: { now: 4, next: 7, target: 10 },
  });

  // Calculate NEXT level using Jesse's formula: (10 - NOW) / 2 + NOW
  const calculateNextLevel = (nowScore) => {
    return Math.round(((10 - nowScore) / 2 + nowScore) * 10) / 10;
  };

  // 8 AOM Categories with icons and colors
  const aomCategories = [
    { key: 'leadership', name: 'Leadership', icon: <EmojiEvents />, color: '#10B981', focus: 'Legislative testimony, thought leadership' },
    { key: 'operations', name: 'Operations', icon: <BusinessCenter />, color: '#3B82F6', focus: 'Veriff resolution, customer onboarding' },
    { key: 'marketing', name: 'Marketing', icon: <Campaign />, color: '#8B5CF6', focus: 'Conservative Texas messaging, HNC content' },
    { key: 'sales', name: 'Sales', icon: <PointOfSale />, color: '#F59E0B', focus: 'Lindy.ai calls, Dream 100 partnerships' },
    { key: 'finance', name: 'Finance', icon: <AttachMoney />, color: '#14B8A6', focus: '$100K recovery, $1M EBITDA target' },
    { key: 'technology', name: 'Technology', icon: <Engineering />, color: '#6366F1', focus: 'AI EA, voice pipeline, integrations' },
    { key: 'culture', name: 'Culture', icon: <Groups />, color: '#EC4899', focus: 'Family coordination, team alignment' },
    { key: 'sop', name: 'SOP', icon: <Description />, color: '#F97316', focus: 'Process docs, automation, quality' },
  ];

  // Current Q4 2025 RPM
  const currentRPM = {
    results: [
      'Cannabis sativa L testimony delivered April 7, 2025',
      '$100K monthly revenue recovered',
      'Digital sovereignty operational (10K daily calls)',
      'Family estate coordination plan finalized',
      'Conservative Texas coalition established',
    ],
    purpose: [
      'Transform conservative Texas mindset on hemp/cannabis',
      'Create generational wealth & family security',
      'Establish policy leadership in Cannabis sativa L reform',
      'Build systematic business empire',
      'Demonstrate responsible cannabis entrepreneurship',
    ],
    massiveActions: [
      'Veriff integration resolution',
      'Lightspeed conversion optimization',
      'Claude Code autonomous development',
      'Voice cloning pipeline deployment',
      'Dream 100 partnership outreach',
      'High Noon Cartoon content production',
      'Weekly RPM planning ritual',
    ],
  };

  // High Five Validation Status
  const highFiveStatus = {
    finger1: { name: 'RPM Alignment', status: 'validated', score: 95 },
    finger2: { name: 'AOM Mastery', status: 'inProgress', score: 75 },
    finger3: { name: 'COI Improvement', status: 'validated', score: 85 },
    finger4: { name: 'Execution Feasibility', status: 'validated', score: 90 },
    finger5: { name: 'Measurement Systems', status: 'inProgress', score: 80 },
  };

  // Wheel of Life Radar Chart Data
  const wheelRadarData = {
    labels: aomCategories.map((cat) => cat.name),
    datasets: [
      {
        label: 'NOW (Current)',
        data: aomCategories.map((cat) => wheelScores[cat.key].now),
        backgroundColor: 'rgba(59, 130, 246, 0.2)',
        borderColor: 'rgba(59, 130, 246, 1)',
        borderWidth: 2,
      },
      {
        label: 'NEXT (Target)',
        data: aomCategories.map((cat) => wheelScores[cat.key].next),
        backgroundColor: 'rgba(16, 185, 129, 0.2)',
        borderColor: 'rgba(16, 185, 129, 1)',
        borderWidth: 2,
      },
      {
        label: 'VISION (10)',
        data: aomCategories.map((cat) => 10),
        backgroundColor: 'rgba(245, 158, 11, 0.1)',
        borderColor: 'rgba(245, 158, 11, 0.5)',
        borderWidth: 1,
        borderDash: [5, 5],
      },
    ],
  };

  const wheelRadarOptions = {
    scales: {
      r: {
        min: 0,
        max: 10,
        ticks: {
          stepSize: 2,
          color: '#94A3B8',
        },
        grid: {
          color: 'rgba(148, 163, 184, 0.2)',
        },
        pointLabels: {
          color: '#F8FAFC',
          font: {
            size: 12,
            weight: 'bold',
          },
        },
      },
    },
    plugins: {
      legend: {
        labels: {
          color: '#F8FAFC',
        },
      },
    },
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    // In production: fetch from backend API
    setTimeout(() => setRefreshing(false), 1000);
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'validated':
        return <CheckCircle sx={{ color: '#10B981' }} />;
      case 'inProgress':
        return <Pending sx={{ color: '#F59E0B' }} />;
      default:
        return <Assignment sx={{ color: '#94A3B8' }} />;
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'validated':
        return '#10B981';
      case 'inProgress':
        return '#F59E0B';
      default:
        return '#94A3B8';
    }
  };

  return (
    <Box sx={{ p: 3 }}>
      {/* Header */}
      <Box sx={{ mb: 4, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Box>
          <Typography variant="h4" sx={{ fontWeight: 700, color: '#F8FAFC', display: 'flex', alignItems: 'center', gap: 1 }}>
            <Psychology sx={{ fontSize: 40, color: '#10B981' }} />
            RPM Visioneering Dashboard
          </Typography>
          <Typography variant="body2" sx={{ color: '#94A3B8', mt: 0.5 }}>
            "Remembering the Future" - Q4 2025 Planning & Execution Framework
          </Typography>
        </Box>
        <IconButton onClick={handleRefresh} disabled={refreshing} sx={{ color: '#10B981' }}>
          <Refresh sx={{ animation: refreshing ? 'spin 1s linear infinite' : 'none' }} />
        </IconButton>
      </Box>

      {/* Tabs */}
      <Tabs
        value={activeTab}
        onChange={(e, newValue) => setActiveTab(newValue)}
        sx={{
          mb: 3,
          '& .MuiTab-root': { color: '#94A3B8', fontWeight: 600 },
          '& .Mui-selected': { color: '#10B981' },
          '& .MuiTabs-indicator': { backgroundColor: '#10B981' },
        }}
      >
        <Tab label="RPM Overview" />
        <Tab label="AOM Wheel of Life" />
        <Tab label="COI Priorities" />
        <Tab label="High Five Validation" />
      </Tabs>

      {/* Tab 1: RPM Overview */}
      {activeTab === 0 && (
        <Grid container spacing={3}>
          {/* Results */}
          <Grid item xs={12} md={4}>
            <Card sx={{ height: '100%', background: 'linear-gradient(135deg, #1E293B 0%, #0F172A 100%)' }}>
              <CardContent>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
                  <Target sx={{ color: '#10B981', fontSize: 28 }} />
                  <Typography variant="h6" sx={{ color: '#F8FAFC', fontWeight: 700 }}>
                    Results (What)
                  </Typography>
                </Box>
                <List dense>
                  {currentRPM.results.map((result, index) => (
                    <ListItem key={index} sx={{ pl: 0 }}>
                      <ListItemIcon sx={{ minWidth: 32 }}>
                        <CheckCircle sx={{ color: '#10B981', fontSize: 20 }} />
                      </ListItemIcon>
                      <ListItemText
                        primary={result}
                        primaryTypographyProps={{
                          sx: { color: '#F8FAFC', fontSize: '0.875rem' },
                        }}
                      />
                    </ListItem>
                  ))}
                </List>
              </CardContent>
            </Card>
          </Grid>

          {/* Purpose */}
          <Grid item xs={12} md={4}>
            <Card sx={{ height: '100%', background: 'linear-gradient(135deg, #1E293B 0%, #0F172A 100%)' }}>
              <CardContent>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
                  <EmojiEvents sx={{ color: '#F59E0B', fontSize: 28 }} />
                  <Typography variant="h6" sx={{ color: '#F8FAFC', fontWeight: 700 }}>
                    Purpose (Why)
                  </Typography>
                </Box>
                <List dense>
                  {currentRPM.purpose.map((purpose, index) => (
                    <ListItem key={index} sx={{ pl: 0 }}>
                      <ListItemIcon sx={{ minWidth: 32 }}>
                        <Star sx={{ color: '#F59E0B', fontSize: 20 }} />
                      </ListItemIcon>
                      <ListItemText
                        primary={purpose}
                        primaryTypographyProps={{
                          sx: { color: '#F8FAFC', fontSize: '0.875rem' },
                        }}
                      />
                    </ListItem>
                  ))}
                </List>
              </CardContent>
            </Card>
          </Grid>

          {/* Massive Action */}
          <Grid item xs={12} md={4}>
            <Card sx={{ height: '100%', background: 'linear-gradient(135deg, #1E293B 0%, #0F172A 100%)' }}>
              <CardContent>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
                  <Flag sx={{ color: '#3B82F6', fontSize: 28 }} />
                  <Typography variant="h6" sx={{ color: '#F8FAFC', fontWeight: 700 }}>
                    Massive Action (How)
                  </Typography>
                </Box>
                <List dense>
                  {currentRPM.massiveActions.map((action, index) => (
                    <ListItem key={index} sx={{ pl: 0 }}>
                      <ListItemIcon sx={{ minWidth: 32 }}>
                        <Assignment sx={{ color: '#3B82F6', fontSize: 20 }} />
                      </ListItemIcon>
                      <ListItemText
                        primary={action}
                        primaryTypographyProps={{
                          sx: { color: '#F8FAFC', fontSize: '0.875rem' },
                        }}
                      />
                    </ListItem>
                  ))}
                </List>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      )}

      {/* Tab 2: AOM Wheel of Life */}
      {activeTab === 1 && (
        <Grid container spacing={3}>
          {/* Radar Chart */}
          <Grid item xs={12} md={6}>
            <Card sx={{ background: 'linear-gradient(135deg, #1E293B 0%, #0F172A 100%)' }}>
              <CardContent>
                <Typography variant="h6" sx={{ color: '#F8FAFC', fontWeight: 700, mb: 3 }}>
                  Wheel of Life - 8 AOM Categories
                </Typography>
                <Box sx={{ height: 400 }}>
                  <Radar data={wheelRadarData} options={wheelRadarOptions} />
                </Box>
                <Alert severity="info" sx={{ mt: 2, backgroundColor: 'rgba(59, 130, 246, 0.1)' }}>
                  <Typography variant="body2" sx={{ color: '#F8FAFC' }}>
                    <strong>Formula:</strong> NEXT = (10 - NOW) / 2 + NOW
                  </Typography>
                </Alert>
              </CardContent>
            </Card>
          </Grid>

          {/* Category Details */}
          <Grid item xs={12} md={6}>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
              {aomCategories.map((category) => (
                <Card key={category.key} sx={{ background: 'linear-gradient(135deg, #1E293B 0%, #0F172A 100%)' }}>
                  <CardContent>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
                      <Box sx={{ color: category.color }}>{category.icon}</Box>
                      <Typography variant="h6" sx={{ color: '#F8FAFC', fontWeight: 600 }}>
                        {category.name}
                      </Typography>
                    </Box>
                    <Box sx={{ display: 'flex', gap: 2, mb: 2 }}>
                      <Chip label={`NOW: ${wheelScores[category.key].now}`} size="small" sx={{ backgroundColor: '#3B82F6', color: '#FFF' }} />
                      <Chip label={`NEXT: ${wheelScores[category.key].next}`} size="small" sx={{ backgroundColor: '#10B981', color: '#FFF' }} />
                      <Chip label={`TARGET: ${wheelScores[category.key].target}`} size="small" sx={{ backgroundColor: '#F59E0B', color: '#FFF' }} />
                    </Box>
                    <Typography variant="body2" sx={{ color: '#94A3B8', fontSize: '0.8125rem', mb: 1 }}>
                      <strong>Q4 Focus:</strong> {category.focus}
                    </Typography>
                    <LinearProgress
                      variant="determinate"
                      value={(wheelScores[category.key].now / 10) * 100}
                      sx={{
                        height: 8,
                        borderRadius: 4,
                        backgroundColor: 'rgba(148, 163, 184, 0.2)',
                        '& .MuiLinearProgress-bar': {
                          backgroundColor: category.color,
                        },
                      }}
                    />
                  </CardContent>
                </Card>
              ))}
            </Box>
          </Grid>
        </Grid>
      )}

      {/* Tab 3: COI Priorities */}
      {activeTab === 2 && (
        <Grid container spacing={3}>
          <Grid item xs={12}>
            <Alert severity="warning" sx={{ mb: 3, backgroundColor: 'rgba(245, 158, 11, 0.1)' }}>
              <Typography variant="body1" sx={{ color: '#F8FAFC', fontWeight: 600 }}>
                Categories of Improvement (COI) - Q4 2025 Top 3 Priorities
              </Typography>
            </Alert>
          </Grid>

          {/* Top 3 COI Focus Areas */}
          {[
            { category: 'Operations', priority: 1, reason: 'Veriff integration crisis blocking $100K monthly revenue', actions: ['Resolve Veriff API issues', 'Restore customer onboarding flow', 'Implement backup verification'] },
            { category: 'Technology', priority: 2, reason: 'Voice pipeline & AI EA critical for digital sovereignty', actions: ['Deploy voice cloning (ElevenLabs)', 'Launch Lindy.ai 10K daily calls', 'Claude Code autonomous dev'] },
            { category: 'Marketing', priority: 3, reason: 'Conservative Texas messaging needed for revenue growth', actions: ['High Noon Cartoon viral content', 'Dream 100 partnership outreach', 'Anti-Patrick campaign messaging'] },
          ].map((item) => (
            <Grid item xs={12} md={4} key={item.priority}>
              <Card sx={{ height: '100%', background: 'linear-gradient(135deg, #1E293B 0%, #0F172A 100%)', border: '2px solid #F59E0B' }}>
                <CardContent>
                  <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
                    <Typography variant="h5" sx={{ color: '#F59E0B', fontWeight: 700 }}>
                      Priority #{item.priority}
                    </Typography>
                    <Chip label={item.category} sx={{ backgroundColor: '#F59E0B', color: '#FFF', fontWeight: 600 }} />
                  </Box>
                  <Typography variant="body1" sx={{ color: '#F8FAFC', fontWeight: 600, mb: 2 }}>
                    {item.reason}
                  </Typography>
                  <Divider sx={{ my: 2, backgroundColor: 'rgba(148, 163, 184, 0.2)' }} />
                  <Typography variant="body2" sx={{ color: '#94A3B8', fontWeight: 600, mb: 1 }}>
                    Action Items:
                  </Typography>
                  <List dense>
                    {item.actions.map((action, index) => (
                      <ListItem key={index} sx={{ pl: 0 }}>
                        <ListItemIcon sx={{ minWidth: 28 }}>
                          <CheckCircle sx={{ color: '#10B981', fontSize: 18 }} />
                        </ListItemIcon>
                        <ListItemText
                          primary={action}
                          primaryTypographyProps={{
                            sx: { color: '#F8FAFC', fontSize: '0.8125rem' },
                          }}
                        />
                      </ListItem>
                    ))}
                  </List>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>
      )}

      {/* Tab 4: High Five Validation */}
      {activeTab === 3 && (
        <Grid container spacing={3}>
          <Grid item xs={12}>
            <Alert severity="success" sx={{ mb: 3, backgroundColor: 'rgba(16, 185, 129, 0.1)' }}>
              <Typography variant="body1" sx={{ color: '#F8FAFC', fontWeight: 600 }}>
                High Five Validation - 5-Finger Reality Check Protocol
              </Typography>
            </Alert>
          </Grid>

          {Object.entries(highFiveStatus).map(([key, finger], index) => (
            <Grid item xs={12} md={6} lg={4} key={key}>
              <Card sx={{ background: 'linear-gradient(135deg, #1E293B 0%, #0F172A 100%)' }}>
                <CardContent>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
                    {getStatusIcon(finger.status)}
                    <Typography variant="h6" sx={{ color: '#F8FAFC', fontWeight: 700 }}>
                      Finger {index + 1}
                    </Typography>
                  </Box>
                  <Typography variant="body1" sx={{ color: '#F8FAFC', fontWeight: 600, mb: 2 }}>
                    {finger.name}
                  </Typography>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                    <LinearProgress
                      variant="determinate"
                      value={finger.score}
                      sx={{
                        flexGrow: 1,
                        height: 8,
                        borderRadius: 4,
                        backgroundColor: 'rgba(148, 163, 184, 0.2)',
                        '& .MuiLinearProgress-bar': {
                          backgroundColor: getStatusColor(finger.status),
                        },
                      }}
                    />
                    <Typography variant="body2" sx={{ color: '#F8FAFC', fontWeight: 600 }}>
                      {finger.score}%
                    </Typography>
                  </Box>
                  <Chip
                    label={finger.status === 'validated' ? 'VALIDATED' : 'IN PROGRESS'}
                    size="small"
                    sx={{
                      backgroundColor: getStatusColor(finger.status),
                      color: '#FFF',
                      fontWeight: 600,
                      mt: 1,
                    }}
                  />
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>
      )}
    </Box>
  );
};

export default RPMVisioneeringDashboard;

// Optimized: 2025-10-02
