import React from 'react';
import {
  Drawer,
  List,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Box,
  Typography,
  Divider,
  Chip,
} from '@mui/material';
import {
  Dashboard,
  VolumeUp,
  Videocam,
  Code,
  MilitaryTech,
  Business,
  School,
  Settings,
  Cloud,
  TrendingUp,
  Security,
} from '@mui/icons-material';
import { motion } from 'framer-motion';

const Sidebar = ({ open, currentView, setCurrentView }) => {
  const menuItems = [
    {
      id: 'dashboard',
      label: 'Empire Dashboard',
      icon: <Dashboard />,
      color: '#16A34A',
    },
    {
      id: 'voice-mode',
      label: 'Voice Mode',
      icon: <VolumeUp />,
      color: '#F59E0B',
      badge: 'ElevenLabs',
    },
    {
      id: 'video-mode',
      label: 'Video Mode',
      icon: <Videocam />,
      color: '#3B82F6',
    },
    {
      id: 'vibe-coding',
      label: 'Vibe Coding',
      icon: <Code />,
      color: '#8B5CF6',
    },
    {
      id: 'agent-swarm',
      label: 'Agent Swarm',
      icon: <MilitaryTech />,
      color: '#EF4444',
      badge: '1072 Agents',
    },
    {
      id: 'empire-systems',
      label: 'Empire Systems',
      icon: <Business />,
      color: '#10B981',
    },
    {
      id: 'pilot-training',
      label: 'Pilot Training',
      icon: <School />,
      color: '#F97316',
    },
  ];

  const handleMenuClick = (viewId) => {
    setCurrentView(viewId);
  };

  return (
    <Drawer
      variant="persistent"
      anchor="left"
      open={open}
      sx={{
        width: 280,
        flexShrink: 0,
        '& .MuiDrawer-paper': {
          width: 280,
          boxSizing: 'border-box',
          background: 'linear-gradient(180deg, #1E293B 0%, #334155 100%)',
          borderRight: '1px solid rgba(148, 163, 184, 0.1)',
          paddingTop: '64px', // Account for header
        },
      }}
    >
      <Box sx={{ p: 2 }}>
        {/* Logo */}
        <Box sx={{ textAlign: 'center', mb: 3 }}>
          <Typography
            variant="h5"
            component={motion.div}
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            sx={{
              background: 'linear-gradient(135deg, #16A34A 0%, #F59E0B 100%)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              backgroundClip: 'text',
              fontWeight: 800,
              mb: 1,
            }}
          >
            🚀 LIVHANA
          </Typography>
          <Typography variant="body2" color="textSecondary">
            Sovereign AI Empire
          </Typography>
          <Chip
            label="LIVE"
            color="success"
            size="small"
            sx={{ mt: 1, fontWeight: 'bold' }}
          />
        </Box>

        <Divider sx={{ borderColor: 'rgba(148, 163, 184, 0.1)', mb: 2 }} />

        {/* Menu Items */}
        <List>
          {menuItems.map((item, index) => (
            <ListItem key={item.id} disablePadding sx={{ mb: 1 }}>
              <ListItemButton
                onClick={() => handleMenuClick(item.id)}
                selected={currentView === item.id}
                component={motion.div}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                sx={{
                  borderRadius: 2,
                  backgroundColor: currentView === item.id
                    ? `${item.color}20`
                    : 'transparent',
                  '&:hover': {
                    backgroundColor: `${item.color}15`,
                  },
                  '&.Mui-selected': {
                    backgroundColor: `${item.color}20`,
                    '& .MuiListItemIcon-root': {
                      color: item.color,
                    },
                    '& .MuiTypography-root': {
                      color: item.color,
                      fontWeight: 600,
                    },
                  },
                  mb: 1,
                }}
              >
                <ListItemIcon
                  sx={{
                    color: currentView === item.id ? item.color : '#94A3B8',
                    minWidth: 40,
                  }}
                >
                  {item.icon}
                </ListItemIcon>
                <ListItemText
                  primary={item.label}
                  secondary={item.badge && (
                    <Chip
                      label={item.badge}
                      size="small"
                      sx={{
                        height: 16,
                        fontSize: '0.6rem',
                        backgroundColor: item.color,
                        color: 'white',
                      }}
                    />
                  )}
                  sx={{
                    '& .MuiListItemText-primary': {
                      color: currentView === item.id ? item.color : '#F8FAFC',
                      fontWeight: currentView === item.id ? 600 : 400,
                    },
                    '& .MuiListItemText-secondary': {
                      marginTop: 0,
                    },
                  }}
                />
              </ListItemButton>
            </ListItem>
          ))}
        </List>

        <Divider sx={{ borderColor: 'rgba(148, 163, 184, 0.1)', my: 2 }} />

        {/* System Status */}
        <Box sx={{ p: 2, backgroundColor: 'rgba(30, 41, 59, 0.5)', borderRadius: 2 }}>
          <Typography variant="body2" color="textSecondary" gutterBottom>
            System Status
          </Typography>

          <Box display="flex" justifyContent="space-between" alignItems="center" mb={1}>
            <Typography variant="body2" color="textSecondary">
              Agent Network
            </Typography>
            <Chip
              label="1072 Active"
              size="small"
              color="success"
              sx={{ fontSize: '0.7rem' }}
            />
          </Box>

          <Box display="flex" justifyContent="space-between" alignItems="center" mb={1}>
            <Typography variant="body2" color="textSecondary">
              API Status
            </Typography>
            <Chip
              label="Online"
              size="small"
              color="success"
              sx={{ fontSize: '0.7rem' }}
            />
          </Box>

          <Box display="flex" justifyContent="space-between" alignItems="center" mb={1}>
            <Typography variant="body2" color="textSecondary">
              MCP Server
            </Typography>
            <Chip
              label="Connected"
              size="small"
              color="success"
              sx={{ fontSize: '0.7rem' }}
            />
          </Box>

          <Box display="flex" justifyContent="space-between" alignItems="center">
            <Typography variant="body2" color="textSecondary">
              Compliance
            </Typography>
            <Chip
              label="DSHS #690"
              size="small"
              color="primary"
              sx={{ fontSize: '0.7rem' }}
            />
          </Box>
        </Box>

        <Divider sx={{ borderColor: 'rgba(148, 163, 184, 0.1)', my: 2 }} />

        {/* Mission Timer */}
        <Box sx={{ p: 2, backgroundColor: 'rgba(245, 158, 11, 0.1)', borderRadius: 2 }}>
          <Typography variant="body2" color="secondary" gutterBottom fontWeight="bold">
            🎯 E2E Mission Status
          </Typography>
          <Typography variant="body2" color="textSecondary" gutterBottom>
            48 Hours to Complete Empire
          </Typography>
          <Box display="flex" justifyContent="space-between" alignItems="center">
            <Typography variant="body2" color="success.main" fontWeight="bold">
              ON TRACK
            </Typography>
            <Typography variant="body2" color="textSecondary">
              100% Complete
            </Typography>
          </Box>
        </Box>
      </Box>
    </Drawer>
  );
};

export default Sidebar;
