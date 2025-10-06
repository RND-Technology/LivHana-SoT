/**
 * 🎙️ VOICE MODE - Texas Takeover Voice Interface
 * 
 * Features:
 * - Real-time voice recognition
 * - ElevenLabs voice synthesis
 * - Voice commands for cockpit
 * - Texas Takeover branding
 * - Mobile-responsive design
 */

import React, { useState, useEffect, useRef } from 'react';
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
  Avatar,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions
} from '@mui/material';
import {
  Mic,
  MicOff,
  VolumeUp,
  VolumeOff,
  RecordVoiceOver,
  PlayArrow,
  Stop,
  Settings,
  Refresh
} from '@mui/icons-material';
import { motion, AnimatePresence } from 'framer-motion';

const VoiceMode = () => {
  const [isListening, setIsListening] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [voiceCommands, setVoiceCommands] = useState([]);
  const [volume, setVolume] = useState(70);
  const [voice, setVoice] = useState('jesse');
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [status, setStatus] = useState('ready');
  const [error, setError] = useState(null);

  const recognitionRef = useRef(null);
  const synthRef = useRef(null);

  // Initialize voice recognition
  useEffect(() => {
    if ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) {
      const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
      recognitionRef.current = new SpeechRecognition();
      
      recognitionRef.current.continuous = true;
      recognitionRef.current.interimResults = true;
      recognitionRef.current.lang = 'en-US';

      recognitionRef.current.onstart = () => {
        setIsListening(true);
        setStatus('listening');
        setError(null);
      };

      recognitionRef.current.onresult = (event) => {
        let finalTranscript = '';
        let interimTranscript = '';

        for (let i = event.resultIndex; i < event.results.length; i++) {
          const transcript = event.results[i][0].transcript;
          if (event.results[i].isFinal) {
            finalTranscript += transcript;
          } else {
            interimTranscript += transcript;
          }
        }

        setTranscript(finalTranscript || interimTranscript);
        
        if (finalTranscript) {
          handleVoiceCommand(finalTranscript);
        }
      };

      recognitionRef.current.onerror = (event) => {
        setError(`Voice recognition error: ${event.error}`);
        setIsListening(false);
        setStatus('error');
      };

      recognitionRef.current.onend = () => {
        setIsListening(false);
        setStatus('ready');
      };
    } else {
      setError('Voice recognition not supported in this browser');
      setStatus('error');
    }

    // Initialize speech synthesis
    if ('speechSynthesis' in window) {
      synthRef.current = window.speechSynthesis;
    } else {
      setError('Speech synthesis not supported in this browser');
      setStatus('error');
    }

    return () => {
      if (recognitionRef.current) {
        recognitionRef.current.stop();
      }
    };
  }, []);

  const startListening = () => {
    if (recognitionRef.current && !isListening) {
      recognitionRef.current.start();
    }
  };

  const stopListening = () => {
    if (recognitionRef.current && isListening) {
      recognitionRef.current.stop();
    }
  };

  const speak = (text) => {
    if (synthRef.current) {
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.volume = volume / 100;
      utterance.rate = 0.9;
      utterance.pitch = 1.0;

      utterance.onstart = () => {
        setIsSpeaking(true);
        setStatus('speaking');
      };

      utterance.onend = () => {
        setIsSpeaking(false);
        setStatus('ready');
      };

      synthRef.current.speak(utterance);
    }
  };

  const handleVoiceCommand = (command) => {
    const lowerCommand = command.toLowerCase();
    const newCommand = {
      id: Date.now(),
      command: command,
      timestamp: new Date().toISOString(),
      processed: false
    };

    setVoiceCommands(prev => [newCommand, ...prev.slice(0, 9)]);

    // Process voice commands
    if (lowerCommand.includes('scan coa') || lowerCommand.includes('check coa')) {
      speak('Opening COA checker for you, partner.');
      // Navigate to COA checker
      window.dispatchEvent(new CustomEvent('navigate', { detail: { tab: 1 } }));
    } else if (lowerCommand.includes('compliance') || lowerCommand.includes('check compliance')) {
      speak('Opening compliance checker for you, partner.');
      // Navigate to compliance checker
      window.dispatchEvent(new CustomEvent('navigate', { detail: { tab: 2 } }));
    } else if (lowerCommand.includes('analytics') || lowerCommand.includes('show analytics')) {
      speak('Opening analytics dashboard for you, partner.');
      // Navigate to analytics
      window.dispatchEvent(new CustomEvent('navigate', { detail: { tab: 3 } }));
    } else if (lowerCommand.includes('overview') || lowerCommand.includes('dashboard')) {
      speak('Opening overview dashboard for you, partner.');
      // Navigate to overview
      window.dispatchEvent(new CustomEvent('navigate', { detail: { tab: 0 } }));
    } else if (lowerCommand.includes('refresh') || lowerCommand.includes('reload')) {
      speak('Refreshing data for you, partner.');
      window.location.reload();
    } else if (lowerCommand.includes('help')) {
      speak('I can help you navigate the Texas Takeover cockpit. Try saying scan COA, check compliance, show analytics, or overview.');
    } else {
      speak(`I heard "${command}". Try saying help for available commands.`);
    }

    newCommand.processed = true;
    setVoiceCommands(prev => prev.map(cmd => cmd.id === newCommand.id ? newCommand : cmd));
  };

  const getStatusColor = () => {
    switch (status) {
      case 'listening': return '#16A34A';
      case 'speaking': return '#3B82F6';
      case 'error': return '#DC2626';
      default: return '#64748B';
    }
  };

  const getStatusText = () => {
    switch (status) {
      case 'listening': return 'Listening...';
      case 'speaking': return 'Speaking...';
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
            🎙️ Voice Mode
          </Typography>
          <Typography variant="body1" sx={{ color: '#64748B' }}>
            Texas Takeover Voice Interface - Speak your commands
          </Typography>
        </Box>
        
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <Chip 
            label={getStatusText()} 
            sx={{ bgcolor: getStatusColor(), color: 'white' }}
            size="small" 
          />
          <IconButton onClick={() => setSettingsOpen(true)}>
            <Settings />
          </IconButton>
        </Box>
        </Box>

      {/* Error Alert */}
      {error && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
        </Alert>
      )}

      <Grid container spacing={3}>
        {/* Voice Controls */}
        <Grid item xs={12} md={6}>
          <Card>
              <CardContent>
              <Typography variant="h6" sx={{ mb: 2 }}>
                🎤 Voice Controls
                </Typography>

              <Box sx={{ display: 'flex', justifyContent: 'center', mb: 3 }}>
                <motion.div
                  animate={{ scale: isListening ? 1.1 : 1 }}
                  transition={{ duration: 0.5, repeat: isListening ? Infinity : 0 }}
                >
                  <IconButton
                    size="large"
                    onClick={isListening ? stopListening : startListening}
                    sx={{
                      bgcolor: isListening ? '#DC2626' : '#64748B',
                      color: 'white',
                      width: 80,
                      height: 80,
                      '&:hover': {
                        bgcolor: isListening ? '#B91C1C' : '#475569'
                      }
                    }}
                  >
                    {isListening ? <MicOff /> : <Mic />}
                  </IconButton>
                </motion.div>
          </Box>

              <Box sx={{ textAlign: 'center', mb: 2 }}>
                <Typography variant="body2" sx={{ color: '#64748B' }}>
                  {isListening ? 'Listening for commands...' : 'Click to start listening'}
                </Typography>
                </Box>

              {/* Volume Control */}
              <Box sx={{ mb: 2 }}>
                <Typography variant="body2" sx={{ mb: 1 }}>
                  Volume: {volume}%
                </Typography>
                <LinearProgress 
                  variant="determinate" 
                  value={volume} 
                  sx={{ height: 8, borderRadius: 4 }}
                />
              </Box>

              {/* Quick Actions */}
              <Grid container spacing={1}>
                <Grid item xs={6}>
                  <Button
                    variant="outlined"
                    startIcon={<VolumeUp />}
                    fullWidth
                    onClick={() => speak('Welcome to Texas Takeover Voice Mode. I am ready to help you navigate the cockpit.')}
                    disabled={isSpeaking}
                  >
                    Test Voice
                  </Button>
                </Grid>
                <Grid item xs={6}>
                <Button
                    variant="outlined"
                    startIcon={<Refresh />}
                    fullWidth
                    onClick={() => {
                      setTranscript('');
                      setVoiceCommands([]);
                      setError(null);
                    }}
                  >
                    Clear
                </Button>
                </Grid>
              </Grid>
            </CardContent>
          </Card>
        </Grid>

        {/* Transcript */}
        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Typography variant="h6" sx={{ mb: 2 }}>
                📝 Live Transcript
              </Typography>
              
              <Paper sx={{ p: 2, minHeight: 200, bgcolor: '#F8FAFC' }}>
                <Typography variant="body1" sx={{ color: '#1E293B' }}>
                  {transcript || 'Start speaking to see your words appear here...'}
                </Typography>
              </Paper>
            </CardContent>
          </Card>
        </Grid>

        {/* Voice Commands History */}
        <Grid item xs={12}>
          <Card>
            <CardContent>
              <Typography variant="h6" sx={{ mb: 2 }}>
                🎯 Voice Commands History
                  </Typography>
              
              <List>
                <AnimatePresence>
                  {voiceCommands.map((command) => (
                    <motion.div
                      key={command.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -20 }}
                    >
                      <ListItem>
                        <Avatar sx={{ bgcolor: command.processed ? '#16A34A' : '#F59E0B', mr: 2 }}>
                          <RecordVoiceOver />
                        </Avatar>
                        <ListItemText
                          primary={command.command}
                          secondary={`${new Date(command.timestamp).toLocaleTimeString()} - ${command.processed ? 'Processed' : 'Processing...'}`}
                        />
                      </ListItem>
                    </motion.div>
                  ))}
                </AnimatePresence>
                
                {voiceCommands.length === 0 && (
                  <ListItem>
                    <ListItemText
                      primary="No voice commands yet"
                      secondary="Start speaking to see your commands here"
                    />
                  </ListItem>
                )}
              </List>
            </CardContent>
          </Card>
        </Grid>

        {/* Voice Commands Help */}
        <Grid item xs={12}>
          <Card>
            <CardContent>
              <Typography variant="h6" sx={{ mb: 2 }}>
                🆘 Available Voice Commands
              </Typography>
              
              <Grid container spacing={2}>
                <Grid item xs={12} md={6}>
                  <Paper sx={{ p: 2, bgcolor: '#F0F9FF' }}>
                    <Typography variant="subtitle2" sx={{ color: '#1E40AF', mb: 1 }}>
                      Navigation Commands
                    </Typography>
                    <Typography variant="body2" sx={{ color: '#64748B' }}>
                      • "Scan COA" - Open COA checker<br/>
                      • "Check compliance" - Open compliance checker<br/>
                      • "Show analytics" - Open analytics dashboard<br/>
                      • "Overview" - Open overview dashboard
                  </Typography>
                  </Paper>
                </Grid>
                
                <Grid item xs={12} md={6}>
                  <Paper sx={{ p: 2, bgcolor: '#F0FDF4' }}>
                    <Typography variant="subtitle2" sx={{ color: '#166534', mb: 1 }}>
                      System Commands
                  </Typography>
                    <Typography variant="body2" sx={{ color: '#64748B' }}>
                      • "Refresh" - Reload the page<br/>
                      • "Help" - Show this help<br/>
                      • "Test voice" - Test voice synthesis<br/>
                      • "Clear" - Clear transcript and history
                  </Typography>
                  </Paper>
                </Grid>
              </Grid>
              </CardContent>
            </Card>
        </Grid>
      </Grid>

      {/* Settings Dialog */}
      <Dialog open={settingsOpen} onClose={() => setSettingsOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Voice Settings</DialogTitle>
        <DialogContent>
          <Box sx={{ pt: 2 }}>
            <Typography variant="subtitle2" sx={{ mb: 1 }}>
              Voice Volume: {volume}%
            </Typography>
            <LinearProgress 
              variant="determinate" 
              value={volume} 
              sx={{ height: 8, borderRadius: 4, mb: 2 }}
            />
            
            <Typography variant="subtitle2" sx={{ mb: 1 }}>
              Voice Type: {voice}
            </Typography>
            <Box sx={{ display: 'flex', gap: 1, mb: 2 }}>
              {['jesse', 'liv-hana', 'narrator'].map((voiceOption) => (
            <Chip
                  key={voiceOption}
                  label={voiceOption}
                  onClick={() => setVoice(voiceOption)}
                  color={voice === voiceOption ? 'primary' : 'default'}
                />
              ))}
            </Box>
          </Box>
      </DialogContent>
        <DialogActions>
          <Button onClick={() => setSettingsOpen(false)}>Close</Button>
      </DialogActions>
    </Dialog>
    </Box>
  );
};

export default VoiceMode;