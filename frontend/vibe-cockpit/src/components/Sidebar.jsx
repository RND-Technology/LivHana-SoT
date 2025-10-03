/**
 * Optimized: 2025-10-03
 * RPM: 2.6.4.2.frontend-vibe-cockpit-components
 * Session: Dual-AI Mission - Sonnet Frontend Sweep
 */
import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
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
  Settings as SettingsIcon,
  Cloud,
  TrendingUp,
  Security,
  Storefront,
  AutoAwesome,
  Psychology,
} from '@mui/icons-material';
import { motion } from 'framer-motion';

const Sidebar = ({ open }) => {
  const navigate = useNavigate();
  const location = useLocation();

  const menuItems = [
    {
      id: 'ultimate',
      path: '/ultimate',
      label: 'Ultimate Cockpit',
      icon: <Cloud />,
      color: '#10B981',
      badge: 'NEW',
    },
    {
      id: 'dashboard',
      path: '/dashboard',
      label: 'Core Dashboard',
      icon: <Dashboard />,
      color: '#16A34A',
    },
    {
      id: 'empire-dashboard',
      path: '/empire-dashboard',
      label: 'Empire Dashboard',
      icon: <Business />,
      color: '#8B5CF6',
    },
    {
      id: 'rpm-visioneering',
      path: '/rpm-visioneering',
      label: 'RPM Visioneering',
      icon: <Psychology />,
      color: '#10B981',
      badge: 'Q4 2025',
    },
    {
      id: 'voice',
      path: '/voice',
      label: 'Voice Mode',
      icon: <VolumeUp />,
      color: '#F59E0B',
      badge: 'ElevenLabs',
    },
    {
      id: 'video',
      path: '/video',
      label: 'Video Mode',
      icon: <Videocam />,
      color: '#3B82F6',
    },
    {
      id: 'vibe-coding',
      path: '/vibe-coding',
      label: 'Vibe Coding',
      icon: <Code />,
      color: '#8B5CF6',
    },
    {
      id: 'agent-swarm',
      path: '/agent-swarm',
      label: 'Agent Swarm',
      icon: <MilitaryTech />,
      color: '#EF4444',
      badge: '1072 Agents',
    },
    {
      id: 'products',
      path: '/products',
      label: 'Square Products',
      icon: <Storefront />,
      color: '#10B981',
    },
    {
      id: 'cockpit',
      path: '/cockpit',
      label: 'Square Live Cockpit',
      icon: <AutoAwesome />,
      color: '#F59E0B',
    },
    {
      id: 'empire-systems',
      path: '/empire-systems',
      label: 'Empire Systems',
      icon: <Business />,
      color: '#10B981',
    },
    {
      id: 'pilot-training',
      path: '/pilot-training',
      label: 'Pilot Training',
      icon: <School />,
      color: '#F97316',
    },
    {
      id: 'settings',
      path: '/settings',
      label: 'Settings',
      icon: <SettingsIcon />,
      color: '#64748B',
    },
  ];

  const handleMenuClick = (path) => {
    navigate(path);
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
          {menuItems.map((item, index) => {
            // Handle root path - both "/" and "/ultimate" should select Ultimate Cockpit
            const isSelected = location.pathname === item.path ||
                             (location.pathname === '/' && item.path === '/ultimate');
            return (
              <ListItem key={item.id} disablePadding sx={{ mb: 1 }}>
                <ListItemButton
                  onClick={() => handleMenuClick(item.path)}
                  selected={isSelected}
                  component={motion.div}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  sx={{
                    borderRadius: 2,
                    backgroundColor: isSelected
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
                      color: isSelected ? item.color : '#94A3B8',
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
                        color: isSelected ? item.color : '#F8FAFC',
                        fontWeight: isSelected ? 600 : 400,
                      },
                      '& .MuiListItemText-secondary': {
                        marginTop: 0,
                      },
                    }}
                  />
                </ListItemButton>
              </ListItem>
            );
          })}
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

// Optimized: 2025-10-02
