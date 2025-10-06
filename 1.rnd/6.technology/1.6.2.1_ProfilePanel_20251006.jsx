/**
 * 👤 PROFILE PANEL - Texas Takeover User Profile
 * 
 * Features:
 * - User profile management
 * - Account information
 * - Activity history
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
  Avatar,
  Divider,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Tabs,
  Tab,
  Badge
} from '@mui/material';
import {
  Person,
  Edit,
  Save,
  CameraAlt,
  Email,
  Phone,
  LocationOn,
  Business,
  CalendarToday,
  TrendingUp,
  Security,
  History,
  Star,
  Award,
  Group,
  AttachMoney,
  Speed,
  CheckCircle,
  Warning,
  Error
} from '@mui/icons-material';
import { motion } from 'framer-motion';

const ProfilePanel = () => {
  const [activeTab, setActiveTab] = useState(0);
  const [profile, setProfile] = useState({
    name: 'Jesse Niesen',
    title: 'CEO & Founder',
    email: 'jesse@reggieanddro.com',
    phone: '+1 (210) 555-0123',
    location: 'San Antonio, Texas',
    company: 'Reggie & Dro LLC',
    avatar: null,
    bio: 'Texas cannabis entrepreneur leading the Lone Star State\'s cannabis revolution. Founder of Reggie & Dro, Texas Takeover MVP, and advocate for cannabis freedom.',
    joinDate: '2024-01-15',
    lastActive: new Date().toISOString(),
    status: 'active'
  });

  const [editMode, setEditMode] = useState(false);
  const [saveStatus, setSaveStatus] = useState('idle');
  const [error, setError] = useState(null);
  const [avatarDialog, setAvatarDialog] = useState(false);

  // Mock user stats
  const [userStats] = useState({
    totalSessions: 1247,
    coaScanned: 89,
    complianceChecks: 156,
    revenueGenerated: 72226.88,
    avgSessionTime: 23.5,
    lastLogin: new Date().toISOString()
  });

  // Mock activity history
  const [activityHistory] = useState([
    {
      id: 1,
      action: 'COA Scanned',
      description: 'Texas Hemp Flower - Batch #TX2025001',
      timestamp: new Date(Date.now() - 5 * 60 * 1000).toISOString(),
      type: 'success'
    },
    {
      id: 2,
      action: 'Compliance Check',
      description: 'Age verification system updated',
      timestamp: new Date(Date.now() - 15 * 60 * 1000).toISOString(),
      type: 'info'
    },
    {
      id: 3,
      action: 'Revenue Milestone',
      description: 'Daily target reached: $34,250',
      timestamp: new Date(Date.now() - 30 * 60 * 1000).toISOString(),
      type: 'success'
    },
    {
      id: 4,
      action: 'System Update',
      description: 'Texas Takeover MVP updated to v2.1.0',
      timestamp: new Date(Date.now() - 45 * 60 * 1000).toISOString(),
      type: 'info'
    },
    {
      id: 5,
      action: 'Login',
      description: 'Successful login from San Antonio, TX',
      timestamp: new Date(Date.now() - 60 * 60 * 1000).toISOString(),
      type: 'info'
    }
  ]);

  const handleSave = () => {
    setSaveStatus('saving');
    setTimeout(() => {
      setSaveStatus('saved');
      setEditMode(false);
      setTimeout(() => setSaveStatus('idle'), 2000);
    }, 1000);
  };

  const handleCancel = () => {
    setEditMode(false);
    setError(null);
  };

  const getStatusColor = () => {
    switch (profile.status) {
      case 'active': return '#16A34A';
      case 'away': return '#F59E0B';
      case 'busy': return '#DC2626';
      default: return '#64748B';
    }
  };

  const getActivityIcon = (type) => {
    switch (type) {
      case 'success': return <CheckCircle sx={{ color: '#16A34A' }} />;
      case 'warning': return <Warning sx={{ color: '#F59E0B' }} />;
      case 'error': return <Error sx={{ color: '#DC2626' }} />;
      default: return <CheckCircle sx={{ color: '#3B82F6' }} />;
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

  const renderProfileInfo = () => (
    <Grid container spacing={3}>
      {/* Profile Header */}
      <Grid item xs={12}>
        <Card>
          <CardContent>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 3 }}>
              <Badge
                overlap="circular"
                anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
                badgeContent={
                  <Chip
                    label={profile.status}
                    size="small"
                    sx={{ bgcolor: getStatusColor(), color: 'white' }}
                  />
                }
              >
                <Avatar
                  sx={{ width: 120, height: 120, bgcolor: '#DC2626', fontSize: '3rem' }}
                >
                  {profile.name.split(' ').map(n => n[0]).join('')}
                </Avatar>
              </Badge>
              
              <Box sx={{ flex: 1 }}>
                <Typography variant="h4" sx={{ color: '#DC2626', fontWeight: 'bold' }}>
                  {profile.name}
                </Typography>
                <Typography variant="h6" sx={{ color: '#64748B', mb: 1 }}>
                  {profile.title}
                </Typography>
                <Typography variant="body1" sx={{ color: '#64748B', mb: 2 }}>
                  {profile.bio}
                </Typography>
                
                <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                  <Chip icon={<Email />} label={profile.email} size="small" />
                  <Chip icon={<Phone />} label={profile.phone} size="small" />
                  <Chip icon={<LocationOn />} label={profile.location} size="small" />
                  <Chip icon={<Business />} label={profile.company} size="small" />
                </Box>
              </Box>
              
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                <Button
                  variant="contained"
                  startIcon={<Edit />}
                  onClick={() => setEditMode(true)}
                  sx={{ bgcolor: '#DC2626', '&:hover': { bgcolor: '#B91C1C' } }}
                >
                  Edit Profile
                </Button>
                <Button
                  variant="outlined"
                  startIcon={<CameraAlt />}
                  onClick={() => setAvatarDialog(true)}
                >
                  Change Avatar
                </Button>
              </Box>
            </Box>
          </CardContent>
        </Card>
      </Grid>

      {/* User Stats */}
      <Grid item xs={12} md={6}>
        <Card>
          <CardContent>
            <Typography variant="h6" sx={{ mb: 2, display: 'flex', alignItems: 'center', gap: 1 }}>
              <TrendingUp />
              User Statistics
            </Typography>
            
            <Grid container spacing={2}>
              <Grid item xs={6}>
                <Paper sx={{ p: 2, textAlign: 'center', bgcolor: '#F0F9FF' }}>
                  <Typography variant="h4" sx={{ color: '#1E40AF' }}>
                    {userStats.totalSessions}
                  </Typography>
                  <Typography variant="body2" sx={{ color: '#64748B' }}>
                    Total Sessions
                  </Typography>
                </Paper>
              </Grid>
              
              <Grid item xs={6}>
                <Paper sx={{ p: 2, textAlign: 'center', bgcolor: '#F0FDF4' }}>
                  <Typography variant="h4" sx={{ color: '#166534' }}>
                    {userStats.coaScanned}
                  </Typography>
                  <Typography variant="body2" sx={{ color: '#64748B' }}>
                    COA Scanned
                  </Typography>
                </Paper>
              </Grid>
              
              <Grid item xs={6}>
                <Paper sx={{ p: 2, textAlign: 'center', bgcolor: '#FFFBEB' }}>
                  <Typography variant="h4" sx={{ color: '#92400E' }}>
                    {userStats.complianceChecks}
                  </Typography>
                  <Typography variant="body2" sx={{ color: '#64748B' }}>
                    Compliance Checks
                  </Typography>
                </Paper>
              </Grid>
              
              <Grid item xs={6}>
                <Paper sx={{ p: 2, textAlign: 'center', bgcolor: '#FEF2F2' }}>
                  <Typography variant="h4" sx={{ color: '#991B1B' }}>
                    ${userStats.revenueGenerated.toLocaleString()}
                  </Typography>
                  <Typography variant="body2" sx={{ color: '#64748B' }}>
                    Revenue Generated
                  </Typography>
                </Paper>
              </Grid>
            </Grid>
          </CardContent>
        </Card>
      </Grid>

      {/* Account Details */}
      <Grid item xs={12} md={6}>
        <Card>
          <CardContent>
            <Typography variant="h6" sx={{ mb: 2, display: 'flex', alignItems: 'center', gap: 1 }}>
              <Security />
              Account Details
            </Typography>
            
            <List>
              <ListItem>
                <ListItemIcon>
                  <CalendarToday />
                </ListItemIcon>
                <ListItemText
                  primary="Member Since"
                  secondary={new Date(profile.joinDate).toLocaleDateString()}
                />
              </ListItem>
              
              <ListItem>
                <ListItemIcon>
                  <Speed />
                </ListItemIcon>
                <ListItemText
                  primary="Average Session Time"
                  secondary={`${userStats.avgSessionTime} minutes`}
                />
              </ListItem>
              
              <ListItem>
                <ListItemIcon>
                  <CheckCircle />
                </ListItemIcon>
                <ListItemText
                  primary="Last Active"
                  secondary={formatTimeAgo(profile.lastActive)}
                />
              </ListItem>
              
              <ListItem>
                <ListItemIcon>
                  <Award />
                </ListItemIcon>
                <ListItemText
                  primary="Account Status"
                  secondary="Premium Member"
                />
              </ListItem>
            </List>
          </CardContent>
        </Card>
      </Grid>
    </Grid>
  );

  const renderActivityHistory = () => (
    <Card>
      <CardContent>
        <Typography variant="h6" sx={{ mb: 2, display: 'flex', alignItems: 'center', gap: 1 }}>
          <History />
          Recent Activity
        </Typography>
        
        <List>
          {activityHistory.map((activity) => (
            <motion.div
              key={activity.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
            >
              <ListItem>
                <ListItemIcon>
                  {getActivityIcon(activity.type)}
                </ListItemIcon>
                <ListItemText
                  primary={activity.action}
                  secondary={
                    <Box>
                      <Typography variant="body2" sx={{ color: '#64748B' }}>
                        {activity.description}
                      </Typography>
                      <Typography variant="caption" sx={{ color: '#9CA3AF' }}>
                        {formatTimeAgo(activity.timestamp)}
                      </Typography>
                    </Box>
                  }
                />
              </ListItem>
              <Divider />
            </motion.div>
          ))}
        </List>
      </CardContent>
    </Card>
  );

  const renderEditForm = () => (
    <Card>
      <CardContent>
        <Typography variant="h6" sx={{ mb: 2, display: 'flex', alignItems: 'center', gap: 1 }}>
          <Edit />
          Edit Profile
        </Typography>
        
        <Grid container spacing={2}>
          <Grid item xs={12} md={6}>
            <TextField
              fullWidth
              label="Full Name"
              value={profile.name}
              onChange={(e) => setProfile(prev => ({ ...prev, name: e.target.value }))}
            />
          </Grid>
          
          <Grid item xs={12} md={6}>
            <TextField
              fullWidth
              label="Title"
              value={profile.title}
              onChange={(e) => setProfile(prev => ({ ...prev, title: e.target.value }))}
            />
          </Grid>
          
          <Grid item xs={12} md={6}>
            <TextField
              fullWidth
              label="Email"
              value={profile.email}
              onChange={(e) => setProfile(prev => ({ ...prev, email: e.target.value }))}
            />
          </Grid>
          
          <Grid item xs={12} md={6}>
            <TextField
              fullWidth
              label="Phone"
              value={profile.phone}
              onChange={(e) => setProfile(prev => ({ ...prev, phone: e.target.value }))}
            />
          </Grid>
          
          <Grid item xs={12} md={6}>
            <TextField
              fullWidth
              label="Location"
              value={profile.location}
              onChange={(e) => setProfile(prev => ({ ...prev, location: e.target.value }))}
            />
          </Grid>
          
          <Grid item xs={12} md={6}>
            <TextField
              fullWidth
              label="Company"
              value={profile.company}
              onChange={(e) => setProfile(prev => ({ ...prev, company: e.target.value }))}
            />
          </Grid>
          
          <Grid item xs={12}>
            <TextField
              fullWidth
              multiline
              rows={4}
              label="Bio"
              value={profile.bio}
              onChange={(e) => setProfile(prev => ({ ...prev, bio: e.target.value }))}
            />
          </Grid>
          
          <Grid item xs={12}>
            <Box sx={{ display: 'flex', gap: 1 }}>
              <Button
                variant="contained"
                startIcon={<Save />}
                onClick={handleSave}
                sx={{ bgcolor: '#16A34A', '&:hover': { bgcolor: '#15803D' } }}
              >
                Save Changes
              </Button>
              <Button
                variant="outlined"
                onClick={handleCancel}
              >
                Cancel
              </Button>
            </Box>
          </Grid>
        </Grid>
      </CardContent>
    </Card>
  );

  return (
    <Box sx={{ p: 3 }}>
      {/* Header */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Box>
          <Typography variant="h4" sx={{ color: '#DC2626', fontWeight: 'bold' }}>
            👤 Profile
          </Typography>
          <Typography variant="body1" sx={{ color: '#64748B' }}>
            Texas Takeover User Profile & Account Management
          </Typography>
        </Box>
        
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <Chip 
            label={saveStatus === 'saved' ? 'Saved' : 'Ready'} 
            color={saveStatus === 'saved' ? 'success' : 'default'}
            size="small" 
          />
        </Box>
      </Box>

      {/* Error Alert */}
      {error && (
        <Alert severity="error" sx={{ mb: 3 }} onClose={() => setError(null)}>
          {error}
        </Alert>
      )}

      {/* Tabs */}
      <Paper sx={{ mb: 3 }}>
        <Tabs 
          value={activeTab} 
          onChange={(e, newValue) => setActiveTab(newValue)}
          variant="fullWidth"
        >
          <Tab label="Profile" icon={<Person />} iconPosition="start" />
          <Tab label="Activity" icon={<History />} iconPosition="start" />
          <Tab label="Edit" icon={<Edit />} iconPosition="start" />
        </Tabs>
      </Paper>

      {/* Tab Content */}
      <Box sx={{ minHeight: '60vh' }}>
        {activeTab === 0 && renderProfileInfo()}
        {activeTab === 1 && renderActivityHistory()}
        {activeTab === 2 && renderEditForm()}
      </Box>

      {/* Avatar Dialog */}
      <Dialog open={avatarDialog} onClose={() => setAvatarDialog(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Change Avatar</DialogTitle>
        <DialogContent>
          <Box sx={{ pt: 2, textAlign: 'center' }}>
            <Avatar
              sx={{ width: 120, height: 120, bgcolor: '#DC2626', fontSize: '3rem', mx: 'auto', mb: 2 }}
            >
              {profile.name.split(' ').map(n => n[0]).join('')}
            </Avatar>
            <Typography variant="body2" sx={{ color: '#64748B', mb: 2 }}>
              Avatar customization coming soon. For now, your initials are used as your avatar.
            </Typography>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setAvatarDialog(false)}>Close</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default ProfilePanel;
