/**
 * ⚙️ SETTINGS PANEL - Texas Takeover Settings
 * 
 * Features:
 * - System configuration
 * - User preferences
 * - Security settings
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
  TextField,
  Switch,
  FormControlLabel,
  Slider,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Divider,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  Avatar,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions
} from '@mui/material';
import {
  Settings,
  Security,
  Palette,
  VolumeUp,
  Notifications,
  Language,
  Storage,
  Network,
  Person,
  Lock,
  Visibility,
  VisibilityOff,
  Save,
  Refresh,
  Restore,
  Info
} from '@mui/icons-material';
import { motion } from 'framer-motion';

const SettingsPanel = () => {
  const [settings, setSettings] = useState({
    // General Settings
    theme: 'texas-takeover',
    language: 'en',
    timezone: 'America/Chicago',
    
    // Display Settings
    fontSize: 14,
    compactMode: false,
    showAnimations: true,
    
    // Audio Settings
    volume: 70,
    soundEffects: true,
    voiceEnabled: true,
    
    // Notification Settings
    notifications: true,
    emailNotifications: true,
    pushNotifications: false,
    
    // Security Settings
    twoFactorAuth: false,
    sessionTimeout: 30,
    autoLogout: true,
    
    // Privacy Settings
    dataCollection: true,
    analytics: true,
    crashReporting: true
  });

  const [showPassword, setShowPassword] = useState(false);
  const [password, setPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [saveStatus, setSaveStatus] = useState('idle');
  const [error, setError] = useState(null);

  // Load settings from localStorage
  useEffect(() => {
    const savedSettings = localStorage.getItem('texas-takeover-settings');
    if (savedSettings) {
      setSettings(JSON.parse(savedSettings));
    }
  }, []);

  // Save settings to localStorage
  const saveSettings = () => {
    try {
      localStorage.setItem('texas-takeover-settings', JSON.stringify(settings));
      setSaveStatus('saved');
      setTimeout(() => setSaveStatus('idle'), 2000);
    } catch (err) {
      setError('Failed to save settings');
      setSaveStatus('error');
    }
  };

  // Reset settings to default
  const resetSettings = () => {
    setSettings({
      theme: 'texas-takeover',
      language: 'en',
      timezone: 'America/Chicago',
      fontSize: 14,
      compactMode: false,
      showAnimations: true,
      volume: 70,
      soundEffects: true,
      voiceEnabled: true,
      notifications: true,
      emailNotifications: true,
      pushNotifications: false,
      twoFactorAuth: false,
      sessionTimeout: 30,
      autoLogout: true,
      dataCollection: true,
      analytics: true,
      crashReporting: true
    });
    saveSettings();
  };

  // Update setting
  const updateSetting = (key, value) => {
    setSettings(prev => ({ ...prev, [key]: value }));
  };

  // Change password
  const changePassword = () => {
    if (newPassword !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }
    if (newPassword.length < 8) {
      setError('Password must be at least 8 characters');
      return;
    }
    
    // Simulate password change
    setSaveStatus('saving');
    setTimeout(() => {
      setPassword('');
      setNewPassword('');
      setConfirmPassword('');
      setSaveStatus('saved');
      setTimeout(() => setSaveStatus('idle'), 2000);
    }, 1000);
  };

  const getSaveStatusColor = () => {
    switch (saveStatus) {
      case 'saving': return '#F59E0B';
      case 'saved': return '#16A34A';
      case 'error': return '#DC2626';
      default: return '#64748B';
    }
  };

  const getSaveStatusText = () => {
    switch (saveStatus) {
      case 'saving': return 'Saving...';
      case 'saved': return 'Saved';
      case 'error': return 'Error';
      default: return 'Ready';
    }
  };

  return (
    <Box sx={{ p: 3 }}>
      {/* Header */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Box>
          <Typography variant="h4" sx={{ color: '#DC2626', fontWeight: 'bold' }}>
            ⚙️ Settings
          </Typography>
          <Typography variant="body1" sx={{ color: '#64748B' }}>
            Texas Takeover System Configuration
          </Typography>
        </Box>
        
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <Chip 
            label={getSaveStatusText()} 
            sx={{ bgcolor: getSaveStatusColor(), color: 'white' }}
            size="small" 
          />
          <Button
            variant="contained"
            startIcon={<Save />}
            onClick={saveSettings}
            sx={{ bgcolor: '#16A34A', '&:hover': { bgcolor: '#15803D' } }}
          >
            Save
          </Button>
        </Box>
      </Box>

      {/* Error Alert */}
      {error && (
        <Alert severity="error" sx={{ mb: 3 }} onClose={() => setError(null)}>
          {error}
        </Alert>
      )}

      <Grid container spacing={3}>
        {/* General Settings */}
        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Typography variant="h6" sx={{ mb: 2, display: 'flex', alignItems: 'center', gap: 1 }}>
                <Settings />
                General Settings
              </Typography>
              
              <Grid container spacing={2}>
                <Grid item xs={12}>
                  <FormControl fullWidth>
                    <InputLabel>Theme</InputLabel>
                    <Select
                      value={settings.theme}
                      onChange={(e) => updateSetting('theme', e.target.value)}
                      label="Theme"
                    >
                      <MenuItem value="texas-takeover">Texas Takeover</MenuItem>
                      <MenuItem value="dark">Dark Mode</MenuItem>
                      <MenuItem value="light">Light Mode</MenuItem>
                      <MenuItem value="auto">Auto</MenuItem>
                    </Select>
                  </FormControl>
                </Grid>
                
                <Grid item xs={12}>
                  <FormControl fullWidth>
                    <InputLabel>Language</InputLabel>
                    <Select
                      value={settings.language}
                      onChange={(e) => updateSetting('language', e.target.value)}
                      label="Language"
                    >
                      <MenuItem value="en">English</MenuItem>
                      <MenuItem value="es">Español</MenuItem>
                      <MenuItem value="fr">Français</MenuItem>
                    </Select>
                  </FormControl>
                </Grid>
                
                <Grid item xs={12}>
                  <FormControl fullWidth>
                    <InputLabel>Timezone</InputLabel>
                    <Select
                      value={settings.timezone}
                      onChange={(e) => updateSetting('timezone', e.target.value)}
                      label="Timezone"
                    >
                      <MenuItem value="America/Chicago">Central Time</MenuItem>
                      <MenuItem value="America/New_York">Eastern Time</MenuItem>
                      <MenuItem value="America/Denver">Mountain Time</MenuItem>
                      <MenuItem value="America/Los_Angeles">Pacific Time</MenuItem>
                    </Select>
                  </FormControl>
                </Grid>
                
                <Grid item xs={12}>
                  <Typography variant="body2" sx={{ mb: 1 }}>
                    Font Size: {settings.fontSize}px
                  </Typography>
                  <Slider
                    value={settings.fontSize}
                    onChange={(e, value) => updateSetting('fontSize', value)}
                    min={12}
                    max={20}
                    step={1}
                    marks={[
                      { value: 12, label: '12px' },
                      { value: 16, label: '16px' },
                      { value: 20, label: '20px' }
                    ]}
                  />
                </Grid>
                
                <Grid item xs={12}>
                  <FormControlLabel
                    control={
                      <Switch
                        checked={settings.compactMode}
                        onChange={(e) => updateSetting('compactMode', e.target.checked)}
                      />
                    }
                    label="Compact Mode"
                  />
                </Grid>
                
                <Grid item xs={12}>
                  <FormControlLabel
                    control={
                      <Switch
                        checked={settings.showAnimations}
                        onChange={(e) => updateSetting('showAnimations', e.target.checked)}
                      />
                    }
                    label="Show Animations"
                  />
                </Grid>
              </Grid>
            </CardContent>
          </Card>
        </Grid>

        {/* Audio Settings */}
        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Typography variant="h6" sx={{ mb: 2, display: 'flex', alignItems: 'center', gap: 1 }}>
                <VolumeUp />
                Audio Settings
              </Typography>
              
              <Grid container spacing={2}>
                <Grid item xs={12}>
                  <Typography variant="body2" sx={{ mb: 1 }}>
                    Volume: {settings.volume}%
                  </Typography>
                  <Slider
                    value={settings.volume}
                    onChange={(e, value) => updateSetting('volume', value)}
                    min={0}
                    max={100}
                    step={5}
                    marks={[
                      { value: 0, label: '0%' },
                      { value: 50, label: '50%' },
                      { value: 100, label: '100%' }
                    ]}
                  />
                </Grid>
                
                <Grid item xs={12}>
                  <FormControlLabel
                    control={
                      <Switch
                        checked={settings.soundEffects}
                        onChange={(e) => updateSetting('soundEffects', e.target.checked)}
                      />
                    }
                    label="Sound Effects"
                  />
                </Grid>
                
                <Grid item xs={12}>
                  <FormControlLabel
                    control={
                      <Switch
                        checked={settings.voiceEnabled}
                        onChange={(e) => updateSetting('voiceEnabled', e.target.checked)}
                      />
                    }
                    label="Voice Synthesis"
                  />
                </Grid>
              </Grid>
            </CardContent>
          </Card>
        </Grid>

        {/* Notification Settings */}
        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Typography variant="h6" sx={{ mb: 2, display: 'flex', alignItems: 'center', gap: 1 }}>
                <Notifications />
                Notification Settings
              </Typography>
              
              <Grid container spacing={2}>
                <Grid item xs={12}>
                  <FormControlLabel
                    control={
                      <Switch
                        checked={settings.notifications}
                        onChange={(e) => updateSetting('notifications', e.target.checked)}
                      />
                    }
                    label="System Notifications"
                  />
                </Grid>
                
                <Grid item xs={12}>
                  <FormControlLabel
                    control={
                      <Switch
                        checked={settings.emailNotifications}
                        onChange={(e) => updateSetting('emailNotifications', e.target.checked)}
                      />
                    }
                    label="Email Notifications"
                  />
                </Grid>
                
                <Grid item xs={12}>
                  <FormControlLabel
                    control={
                      <Switch
                        checked={settings.pushNotifications}
                        onChange={(e) => updateSetting('pushNotifications', e.target.checked)}
                      />
                    }
                    label="Push Notifications"
                  />
                </Grid>
              </Grid>
            </CardContent>
          </Card>
        </Grid>

        {/* Security Settings */}
        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Typography variant="h6" sx={{ mb: 2, display: 'flex', alignItems: 'center', gap: 1 }}>
                <Security />
                Security Settings
              </Typography>
              
              <Grid container spacing={2}>
                <Grid item xs={12}>
                  <FormControlLabel
                    control={
                      <Switch
                        checked={settings.twoFactorAuth}
                        onChange={(e) => updateSetting('twoFactorAuth', e.target.checked)}
                      />
                    }
                    label="Two-Factor Authentication"
                  />
                </Grid>
                
                <Grid item xs={12}>
                  <Typography variant="body2" sx={{ mb: 1 }}>
                    Session Timeout: {settings.sessionTimeout} minutes
                  </Typography>
                  <Slider
                    value={settings.sessionTimeout}
                    onChange={(e, value) => updateSetting('sessionTimeout', value)}
                    min={5}
                    max={120}
                    step={5}
                    marks={[
                      { value: 5, label: '5m' },
                      { value: 30, label: '30m' },
                      { value: 120, label: '2h' }
                    ]}
                  />
                </Grid>
                
                <Grid item xs={12}>
                  <FormControlLabel
                    control={
                      <Switch
                        checked={settings.autoLogout}
                        onChange={(e) => updateSetting('autoLogout', e.target.checked)}
                      />
                    }
                    label="Auto Logout"
                  />
                </Grid>
              </Grid>
            </CardContent>
          </Card>
        </Grid>

        {/* Privacy Settings */}
        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Typography variant="h6" sx={{ mb: 2, display: 'flex', alignItems: 'center', gap: 1 }}>
                <Lock />
                Privacy Settings
              </Typography>
              
              <Grid container spacing={2}>
                <Grid item xs={12}>
                  <FormControlLabel
                    control={
                      <Switch
                        checked={settings.dataCollection}
                        onChange={(e) => updateSetting('dataCollection', e.target.checked)}
                      />
                    }
                    label="Data Collection"
                  />
                </Grid>
                
                <Grid item xs={12}>
                  <FormControlLabel
                    control={
                      <Switch
                        checked={settings.analytics}
                        onChange={(e) => updateSetting('analytics', e.target.checked)}
                      />
                    }
                    label="Analytics"
                  />
                </Grid>
                
                <Grid item xs={12}>
                  <FormControlLabel
                    control={
                      <Switch
                        checked={settings.crashReporting}
                        onChange={(e) => updateSetting('crashReporting', e.target.checked)}
                      />
                    }
                    label="Crash Reporting"
                  />
                </Grid>
              </Grid>
            </CardContent>
          </Card>
        </Grid>

        {/* Account Settings */}
        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Typography variant="h6" sx={{ mb: 2, display: 'flex', alignItems: 'center', gap: 1 }}>
                <Person />
                Account Settings
              </Typography>
              
              <Grid container spacing={2}>
                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    label="Current Password"
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    InputProps={{
                      endAdornment: (
                        <IconButton
                          onClick={() => setShowPassword(!showPassword)}
                          edge="end"
                        >
                          {showPassword ? <VisibilityOff /> : <Visibility />}
                        </IconButton>
                      )
                    }}
                  />
                </Grid>
                
                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    label="New Password"
                    type="password"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                  />
                </Grid>
                
                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    label="Confirm Password"
                    type="password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                  />
                </Grid>
                
                <Grid item xs={12}>
                  <Button
                    variant="contained"
                    onClick={changePassword}
                    disabled={!password || !newPassword || !confirmPassword}
                    sx={{ bgcolor: '#DC2626', '&:hover': { bgcolor: '#B91C1C' } }}
                  >
                    Change Password
                  </Button>
                </Grid>
              </Grid>
            </CardContent>
          </Card>
        </Grid>

        {/* System Info */}
        <Grid item xs={12}>
          <Card>
            <CardContent>
              <Typography variant="h6" sx={{ mb: 2, display: 'flex', alignItems: 'center', gap: 1 }}>
                <Info />
                System Information
              </Typography>
              
              <Grid container spacing={2}>
                <Grid item xs={12} md={4}>
                  <Paper sx={{ p: 2, textAlign: 'center', bgcolor: '#F0F9FF' }}>
                    <Typography variant="subtitle2" sx={{ color: '#1E40AF' }}>
                      Version
                    </Typography>
                    <Typography variant="h6" sx={{ color: '#1E40AF' }}>
                      2.1.0
                    </Typography>
                  </Paper>
                </Grid>
                
                <Grid item xs={12} md={4}>
                  <Paper sx={{ p: 2, textAlign: 'center', bgcolor: '#F0FDF4' }}>
                    <Typography variant="subtitle2" sx={{ color: '#166534' }}>
                      Last Updated
                    </Typography>
                    <Typography variant="h6" sx={{ color: '#166534' }}>
                      {new Date().toLocaleDateString()}
                    </Typography>
                  </Paper>
                </Grid>
                
                <Grid item xs={12} md={4}>
                  <Paper sx={{ p: 2, textAlign: 'center', bgcolor: '#FFFBEB' }}>
                    <Typography variant="subtitle2" sx={{ color: '#92400E' }}>
                      Status
                    </Typography>
                    <Typography variant="h6" sx={{ color: '#92400E' }}>
                      Operational
                    </Typography>
                  </Paper>
                </Grid>
              </Grid>
              
              <Box sx={{ mt: 2, display: 'flex', gap: 1 }}>
                <Button
                  variant="outlined"
                  startIcon={<Restore />}
                  onClick={resetSettings}
                >
                  Reset to Default
                </Button>
                <Button
                  variant="outlined"
                  startIcon={<Refresh />}
                  onClick={() => window.location.reload()}
                >
                  Refresh Page
                </Button>
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Box>
  );
};

export default SettingsPanel;
