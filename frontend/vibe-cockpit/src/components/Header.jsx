/**
 * Optimized: 2025-10-03
 * RPM: 2.6.4.2.frontend-vibe-cockpit-components
 * Session: Dual-AI Mission - Sonnet Frontend Sweep
 */
import React from 'react';
import {
  AppBar,
  Toolbar,
  IconButton,
  Typography,
  Box,
  Avatar,
  Button,
  Badge,
  Tooltip,
} from '@mui/material';
import {
  Menu,
  Notifications,
  Settings,
  AccountCircle,
  VolumeUp,
  Videocam,
  Dashboard,
} from '@mui/icons-material';
import { motion } from 'framer-motion';

const Header = ({
  sidebarOpen,
  setSidebarOpen,
  voiceModeActive,
  videoModeActive,
  toggleVoiceMode,
  toggleVideoMode,
}) => {
  return (
    <AppBar
      position="fixed"
      sx={{
        zIndex: 1100,
        background: 'linear-gradient(135deg, #1E293B 0%, #334155 100%)',
        backdropFilter: 'blur(10px)',
        borderBottom: '1px solid rgba(148, 163, 184, 0.1)',
        boxShadow: '0 1px 3px rgba(0, 0, 0, 0.12), 0 1px 2px rgba(0, 0, 0, 0.24)',
      }}
    >
      <Toolbar>
        <IconButton
          color="inherit"
          aria-label="toggle drawer"
          onClick={() => setSidebarOpen(!sidebarOpen)}
          edge="start"
          sx={{ mr: 2 }}
        >
          <Menu />
        </IconButton>

        <Box sx={{ display: 'flex', alignItems: 'center', flexGrow: 1 }}>
          <Typography
            variant="h6"
            component={motion.div}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            sx={{
              background: 'linear-gradient(135deg, #16A34A 0%, #F59E0B 100%)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              backgroundClip: 'text',
              fontWeight: 800,
              mr: 2,
            }}
          >
            🚀 LivHana Empire Cockpit
          </Typography>

          <Badge
            badgeContent="LIVE"
            color="success"
            sx={{
              '& .MuiBadge-badge': {
                backgroundColor: '#16A34A',
                color: 'white',
                fontWeight: 'bold',
                fontSize: '0.7rem',
              },
            }}
          >
            <Typography variant="body2" color="textSecondary">
              1072 Agents Active
            </Typography>
          </Badge>
        </Box>

        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <Tooltip title="Voice Mode">
            <IconButton
              color={voiceModeActive ? 'primary' : 'inherit'}
              onClick={toggleVoiceMode}
              sx={{
                backgroundColor: voiceModeActive ? 'rgba(22, 163, 74, 0.1)' : 'transparent',
                '&:hover': {
                  backgroundColor: 'rgba(22, 163, 74, 0.2)',
                },
              }}
            >
              <VolumeUp />
            </IconButton>
          </Tooltip>

          <Tooltip title="Video Mode">
            <IconButton
              color={videoModeActive ? 'secondary' : 'inherit'}
              onClick={toggleVideoMode}
              sx={{
                backgroundColor: videoModeActive ? 'rgba(245, 158, 11, 0.1)' : 'transparent',
                '&:hover': {
                  backgroundColor: 'rgba(245, 158, 11, 0.2)',
                },
              }}
            >
              <Videocam />
            </IconButton>
          </Tooltip>

          <Tooltip title="Notifications">
            <IconButton color="inherit">
              <Badge badgeContent={3} color="error">
                <Notifications />
              </Badge>
            </IconButton>
          </Tooltip>

          <Tooltip title="Settings">
            <IconButton color="inherit">
              <Settings />
            </IconButton>
          </Tooltip>

          <Avatar
            sx={{
              bgcolor: '#16A34A',
              width: 32,
              height: 32,
              ml: 1,
            }}
          >
            <AccountCircle />
          </Avatar>
        </Box>
      </Toolbar>
    </AppBar>
  );
};

export default Header;

// Optimized: 2025-10-02
