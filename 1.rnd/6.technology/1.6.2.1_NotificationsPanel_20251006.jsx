/**
 * 🔔 NOTIFICATIONS PANEL - Texas Takeover Notifications
 * 
 * Features:
 * - Real-time notifications
 * - System alerts
 * - Compliance warnings
 * - Texas Takeover branding
 * - Mobile-responsive design
 */

import React, { useState, useEffect } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Button,
  IconButton,
  Chip,
  LinearProgress,
  Alert,
  Grid,
  Paper,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  Avatar,
  Badge,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Switch,
  FormControlLabel,
  Divider
} from '@mui/material';
import {
  Notifications,
  NotificationsOff,
  NotificationsActive,
  Warning,
  Error,
  CheckCircle,
  Info,
  Refresh,
  Settings,
  Clear,
  Delete,
  MarkEmailRead,
  MarkEmailUnread
} from '@mui/icons-material';
import { motion, AnimatePresence } from 'framer-motion';

const NotificationsPanel = () => {
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [notificationsEnabled, setNotificationsEnabled] = useState(true);
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [autoMarkRead, setAutoMarkRead] = useState(false);

  // Initialize notifications
  useEffect(() => {
    // Load initial notifications
    const initialNotifications = [
      {
        id: 1,
        title: 'COA Processing Complete',
        message: 'Texas Hemp Flower batch #TX2025001 processed successfully. THC content: 0.28%',
        type: 'success',
        timestamp: new Date(Date.now() - 2 * 60 * 1000).toISOString(),
        read: false,
        priority: 'high'
      },
      {
        id: 2,
        title: 'Compliance Warning',
        message: 'Product exceeds THC limit threshold. Review required for batch #TX2025002',
        type: 'warning',
        timestamp: new Date(Date.now() - 15 * 60 * 1000).toISOString(),
        read: false,
        priority: 'high'
      },
      {
        id: 3,
        title: 'System Update',
        message: 'Texas Takeover MVP updated to version 2.1.0. New features: Voice mode, Video mode, Chat interface',
        type: 'info',
        timestamp: new Date(Date.now() - 30 * 60 * 1000).toISOString(),
        read: true,
        priority: 'medium'
      },
      {
        id: 4,
        title: 'Revenue Milestone',
        message: 'Daily revenue target reached: $34,250. Great work, partner!',
        type: 'success',
        timestamp: new Date(Date.now() - 45 * 60 * 1000).toISOString(),
        read: true,
        priority: 'medium'
      },
      {
        id: 5,
        title: 'Age Verification Alert',
        message: 'Failed age verification attempt detected. IP: 192.168.1.100',
        type: 'error',
        timestamp: new Date(Date.now() - 60 * 60 * 1000).toISOString(),
        read: false,
        priority: 'high'
      }
    ];

    setNotifications(initialNotifications);
    setUnreadCount(initialNotifications.filter(n => !n.read).length);

    // Simulate real-time notifications
    const interval = setInterval(() => {
      const newNotification = {
        id: Date.now(),
        title: 'Live System Update',
        message: `System health: ${Math.floor(Math.random() * 100)}% - All services operational`,
        type: 'info',
        timestamp: new Date().toISOString(),
        read: false,
        priority: 'low'
      };

      setNotifications(prev => [newNotification, ...prev.slice(0, 19)]);
      setUnreadCount(prev => prev + 1);

      // Play notification sound
      if (soundEnabled && notificationsEnabled) {
        playNotificationSound();
      }
    }, 30000); // Every 30 seconds

    return () => clearInterval(interval);
  }, [soundEnabled, notificationsEnabled]);

  const playNotificationSound = () => {
    // Create a simple notification sound
    const audioContext = new (window.AudioContext || window.webkitAudioContext)();
    const oscillator = audioContext.createOscillator();
    const gainNode = audioContext.createGain();
    
    oscillator.connect(gainNode);
    gainNode.connect(audioContext.destination);
    
    oscillator.frequency.setValueAtTime(800, audioContext.currentTime);
    oscillator.frequency.setValueAtTime(600, audioContext.currentTime + 0.1);
    
    gainNode.gain.setValueAtTime(0.3, audioContext.currentTime);
    gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.2);
    
    oscillator.start(audioContext.currentTime);
    oscillator.stop(audioContext.currentTime + 0.2);
  };

  const markAsRead = (id) => {
    setNotifications(prev => 
      prev.map(notification => 
        notification.id === id 
          ? { ...notification, read: true }
          : notification
      )
    );
    setUnreadCount(prev => Math.max(0, prev - 1));
  };

  const markAllAsRead = () => {
    setNotifications(prev => 
      prev.map(notification => ({ ...notification, read: true }))
    );
    setUnreadCount(0);
  };

  const deleteNotification = (id) => {
    const notification = notifications.find(n => n.id === id);
    if (notification && !notification.read) {
      setUnreadCount(prev => Math.max(0, prev - 1));
    }
    setNotifications(prev => prev.filter(n => n.id !== id));
  };

  const clearAll = () => {
    setNotifications([]);
    setUnreadCount(0);
  };

  const getNotificationIcon = (type) => {
    switch (type) {
      case 'success': return <CheckCircle sx={{ color: '#16A34A' }} />;
      case 'warning': return <Warning sx={{ color: '#F59E0B' }} />;
      case 'error': return <Error sx={{ color: '#DC2626' }} />;
      case 'info': return <Info sx={{ color: '#3B82F6' }} />;
      default: return <Info sx={{ color: '#64748B' }} />;
    }
  };

  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'high': return '#DC2626';
      case 'medium': return '#F59E0B';
      case 'low': return '#16A34A';
      default: return '#64748B';
    }
  };

  const formatTimeAgo = (timestamp) => {
    const now = new Date();
    const time = new Date(timestamp);
    const diffInMinutes = Math.floor((now - time) / (1000 * 60));
    
    if (diffInMinutes < 1) return 'Just now';
    if (diffInMinutes < 60) return `${diffInMinutes}m ago`;
    if (diffInMinutes < 1440) return `${Math.floor(diffInMinutes / 60)}h ago`;
    return `${Math.floor(diffInMinutes / 1440)}d ago`;
  };

  return (
    <Box sx={{ p: 3 }}>
      {/* Header */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Box>
          <Typography variant="h4" sx={{ color: '#DC2626', fontWeight: 'bold' }}>
            🔔 Notifications
          </Typography>
          <Typography variant="body1" sx={{ color: '#64748B' }}>
            Texas Takeover System Alerts & Updates
          </Typography>
        </Box>
        
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <Badge badgeContent={unreadCount} color="error">
            <IconButton onClick={() => setSettingsOpen(true)}>
              <Settings />
            </IconButton>
          </Badge>
        </Box>
      </Box>

      {/* Quick Actions */}
      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <Typography variant="h6">
              Notification Center
            </Typography>
            
            <Box sx={{ display: 'flex', gap: 1 }}>
              <Button
                size="small"
                variant="outlined"
                startIcon={<MarkEmailRead />}
                onClick={markAllAsRead}
                disabled={unreadCount === 0}
              >
                Mark All Read
              </Button>
              <Button
                size="small"
                variant="outlined"
                startIcon={<Clear />}
                onClick={clearAll}
                disabled={notifications.length === 0}
              >
                Clear All
              </Button>
              <Button
                size="small"
                variant="outlined"
                startIcon={<Refresh />}
                onClick={() => window.location.reload()}
              >
                Refresh
              </Button>
            </Box>
          </Box>
          
          <Box sx={{ mt: 2, display: 'flex', alignItems: 'center', gap: 2 }}>
            <Chip
              label={`${unreadCount} Unread`}
              color="error"
              size="small"
            />
            <Chip
              label={`${notifications.length} Total`}
              color="default"
              size="small"
            />
            <Chip
              label={notificationsEnabled ? 'Enabled' : 'Disabled'}
              color={notificationsEnabled ? 'success' : 'default'}
              size="small"
            />
          </Box>
        </CardContent>
      </Card>

      {/* Notifications List */}
      <Card>
        <CardContent sx={{ p: 0 }}>
          <List>
            <AnimatePresence>
              {notifications.map((notification) => (
                <motion.div
                  key={notification.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                >
                  <ListItem
                    sx={{
                      bgcolor: notification.read ? 'transparent' : '#FEF2F2',
                      borderLeft: `4px solid ${getPriorityColor(notification.priority)}`,
                      '&:hover': { bgcolor: '#F8FAFC' }
                    }}
                  >
                    <ListItemIcon>
                      {getNotificationIcon(notification.type)}
                    </ListItemIcon>
                    
                    <ListItemText
                      primary={
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                          <Typography variant="subtitle1" sx={{ fontWeight: notification.read ? 'normal' : 'bold' }}>
                            {notification.title}
                          </Typography>
                          <Chip
                            label={notification.priority}
                            size="small"
                            sx={{ 
                              bgcolor: getPriorityColor(notification.priority),
                              color: 'white',
                              fontSize: '0.7rem'
                            }}
                          />
                        </Box>
                      }
                      secondary={
                        <Box>
                          <Typography variant="body2" sx={{ color: '#64748B', mb: 1 }}>
                            {notification.message}
                          </Typography>
                          <Typography variant="caption" sx={{ color: '#9CA3AF' }}>
                            {formatTimeAgo(notification.timestamp)}
                          </Typography>
                        </Box>
                      }
                    />
                    
                    <Box sx={{ display: 'flex', gap: 1 }}>
                      {!notification.read && (
                        <IconButton
                          size="small"
                          onClick={() => markAsRead(notification.id)}
                        >
                          <MarkEmailRead />
                        </IconButton>
                      )}
                      <IconButton
                        size="small"
                        onClick={() => deleteNotification(notification.id)}
                      >
                        <Delete />
                      </IconButton>
                    </Box>
                  </ListItem>
                  
                  <Divider />
                </motion.div>
              ))}
            </AnimatePresence>
            
            {notifications.length === 0 && (
              <ListItem>
                <ListItemText
                  primary="No notifications"
                  secondary="You're all caught up! New notifications will appear here."
                  sx={{ textAlign: 'center', py: 4 }}
                />
              </ListItem>
            )}
          </List>
        </CardContent>
      </Card>

      {/* Notification Types */}
      <Grid container spacing={2} sx={{ mt: 3 }}>
        <Grid item xs={12} md={3}>
          <Paper sx={{ p: 2, textAlign: 'center', bgcolor: '#F0FDF4' }}>
            <CheckCircle sx={{ color: '#16A34A', fontSize: 40, mb: 1 }} />
            <Typography variant="subtitle2" sx={{ color: '#166534' }}>
              Success
            </Typography>
            <Typography variant="body2" sx={{ color: '#64748B' }}>
              {notifications.filter(n => n.type === 'success').length} notifications
            </Typography>
          </Paper>
        </Grid>
        
        <Grid item xs={12} md={3}>
          <Paper sx={{ p: 2, textAlign: 'center', bgcolor: '#FFFBEB' }}>
            <Warning sx={{ color: '#F59E0B', fontSize: 40, mb: 1 }} />
            <Typography variant="subtitle2" sx={{ color: '#92400E' }}>
              Warning
            </Typography>
            <Typography variant="body2" sx={{ color: '#64748B' }}>
              {notifications.filter(n => n.type === 'warning').length} notifications
            </Typography>
          </Paper>
        </Grid>
        
        <Grid item xs={12} md={3}>
          <Paper sx={{ p: 2, textAlign: 'center', bgcolor: '#FEF2F2' }}>
            <Error sx={{ color: '#DC2626', fontSize: 40, mb: 1 }} />
            <Typography variant="subtitle2" sx={{ color: '#991B1B' }}>
              Error
            </Typography>
            <Typography variant="body2" sx={{ color: '#64748B' }}>
              {notifications.filter(n => n.type === 'error').length} notifications
            </Typography>
          </Paper>
        </Grid>
        
        <Grid item xs={12} md={3}>
          <Paper sx={{ p: 2, textAlign: 'center', bgcolor: '#EFF6FF' }}>
            <Info sx={{ color: '#3B82F6', fontSize: 40, mb: 1 }} />
            <Typography variant="subtitle2" sx={{ color: '#1E40AF' }}>
              Info
            </Typography>
            <Typography variant="body2" sx={{ color: '#64748B' }}>
              {notifications.filter(n => n.type === 'info').length} notifications
            </Typography>
          </Paper>
        </Grid>
      </Grid>

      {/* Settings Dialog */}
      <Dialog open={settingsOpen} onClose={() => setSettingsOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Notification Settings</DialogTitle>
        <DialogContent>
          <Box sx={{ pt: 2 }}>
            <FormControlLabel
              control={
                <Switch
                  checked={notificationsEnabled}
                  onChange={(e) => setNotificationsEnabled(e.target.checked)}
                />
              }
              label="Enable Notifications"
            />
            
            <FormControlLabel
              control={
                <Switch
                  checked={soundEnabled}
                  onChange={(e) => setSoundEnabled(e.target.checked)}
                  disabled={!notificationsEnabled}
                />
              }
              label="Notification Sounds"
            />
            
            <FormControlLabel
              control={
                <Switch
                  checked={autoMarkRead}
                  onChange={(e) => setAutoMarkRead(e.target.checked)}
                />
              }
              label="Auto-mark as Read"
            />
            
            <Typography variant="body2" sx={{ color: '#64748B', mt: 2 }}>
              Configure how you receive notifications from the Texas Takeover system. 
              Notifications include system alerts, compliance warnings, and important updates.
            </Typography>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setSettingsOpen(false)}>Close</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default NotificationsPanel;
