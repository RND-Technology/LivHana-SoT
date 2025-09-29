import React, { useState, useRef, useEffect } from 'react';
import {
  Dialog, DialogTitle, DialogContent, DialogActions, Button, Box, Typography,
  Card, CardContent, IconButton, Select, MenuItem, FormControl, InputLabel,
  Chip, Slider, LinearProgress, CircularProgress, Paper, TextField
} from '@mui/material';
import {
  Mic, MicOff, VolumeUp, VolumeDown, Person, VoiceChat, Settings,
  PlayArrow, Stop, Refresh
} from '@mui/icons-material';
import { useReasoningJob } from '../hooks/useReasoningJob.js';
import { HealthBanner } from './HealthBanner.js';

const ELEVENLABS_BASE_URL = 'https://api.elevenlabs.io';
const ELEVENLABS_API_KEY = process.env.REACT_APP_ELEVENLABS_API_KEY || 'your_elevenlabs_api_key_here';

const voiceOptions = [
  {
    id: '21m00Tcm4TlvDq8ikWAM', // Rachel - Professional female voice
    name: 'Rachel',
    description: 'Professional, clear, and engaging female voice',
    gender: 'Female',
    age: '30-40',
    accent: 'American'
  },
  {
    id: 'AZnzlk1XvdvUeBnXmlld', // Domi - Warm female voice
    name: 'Domi',
    description: 'Warm, friendly, and approachable female voice',
    gender: 'Female',
    age: '25-35',
    accent: 'American'
  },
  {
    id: 'EXAVITQu4vr4xnSDxMaL', // Bella - Expressive female voice
    name: 'Bella',
    description: 'Expressive, dynamic, and engaging female voice',
    gender: 'Female',
    age: '20-30',
    accent: 'American'
  },
  {
    id: 'MF3mGyEYCl7XYWbV9V6O', // Elli - Young female voice
    name: 'Elli',
    description: 'Young, fresh, and vibrant female voice',
    gender: 'Female',
    age: '18-25',
    accent: 'American'
  }
];

const VoiceMode = ({
  open,
  onClose,
  voiceModeActive,
  toggleVoiceMode,
  agentStatus,
  setAgentStatus
}) => {
  const [selectedVoice, setSelectedVoice] = useState(() => {
    return localStorage.getItem('selectedVoice') || '21m00Tcm4TlvDq8ikWAM';
  });
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [audioLevel, setAudioLevel] = useState(50);
  const [stability, setStability] = useState(50);
  const [similarityBoost, setSimilarityBoost] = useState(80);
  const [isTesting, setIsTesting] = useState(false);
  const [reasoningPrompt, setReasoningPrompt] = useState('Summarize the latest operations status for Liv Hana.');
  const audioRef = useRef(null);
  const reasoning = useReasoningJob();
  const [healthStatus, setHealthStatus] = useState({
    voice: 'unknown',
    reasoning: 'unknown',
    queueDepth: 'unknown',
  });

  const currentVoice = voiceOptions.find(voice => voice.id === selectedVoice);

  useEffect(() => {
    localStorage.setItem('selectedVoice', selectedVoice);
  }, [selectedVoice]);

  useEffect(() => {
    if (reasoning.status === 'completed') {
      setHealthStatus((prev) => ({ ...prev, reasoning: 'healthy' }));
    }

    if (['failed', 'error', 'timeout'].includes(reasoning.status)) {
      setHealthStatus((prev) => ({ ...prev, reasoning: 'down' }));
    }

    if (reasoning.status === 'progress') {
      setHealthStatus((prev) => ({ ...prev, reasoning: 'degraded' }));
    }
  }, [reasoning.status]);

  useEffect(() => {
    let cancelled = false;

    const fetchQueueHealth = async () => {
      try {
        const data = await reasoning.fetchHealth();
        if (!cancelled) {
          setHealthStatus((prev) => ({
            ...prev,
            voice: data.voiceStatus ?? prev.voice,
            reasoning: data.reasoningStatus ?? prev.reasoning,
            queueDepth: data.queueDepth ?? prev.queueDepth,
          }));
        }
      } catch (error) {
        console.error('Failed to fetch voice mode health', error);
        if (!cancelled) {
          setHealthStatus((prev) => ({ ...prev, voice: 'down', reasoning: 'degraded' }));
        }
      }
    };

    fetchQueueHealth();
    const interval = setInterval(fetchQueueHealth, 30000);

    return () => {
      cancelled = true;
      clearInterval(interval);
    };
  }, [reasoning]);

  const handleVoiceChange = (event) => {
    setSelectedVoice(event.target.value);
  };

  const speakWithElevenLabs = async (text) => {
    if (!ELEVENLABS_API_KEY || ELEVENLABS_API_KEY === 'your_elevenlabs_api_key_here') {
      alert('Please add your ElevenLabs API key to .env.local file');
      return;
    }

    try {
      setIsSpeaking(true);
      setAgentStatus('speaking');
      setHealthStatus((prev) => ({ ...prev, voice: 'healthy' }));

      const response = await fetch(`${ELEVENLABS_BASE_URL}/v1/text-to-speech/${selectedVoice}`, {
        method: 'POST',
        headers: {
          'Accept': 'audio/mpeg',
          'Content-Type': 'application/json',
          'xi-api-key': ELEVENLABS_API_KEY
        },
        body: JSON.stringify({
          text: text,
          model_id: 'eleven_monolingual_v1',
          voice_settings: {
            stability: stability / 100,
            similarity_boost: similarityBoost / 100
          }
        })
      });

      if (!response.ok) {
        throw new Error(`ElevenLabs API error: ${response.status} ${response.statusText}`);
      }

      const audioBlob = await response.blob();
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
      console.error('ElevenLabs TTS error:', error);
      setIsSpeaking(false);
      setAgentStatus('error');
      setHealthStatus((prev) => ({ ...prev, voice: 'down' }));
      alert(`Voice synthesis failed: ${error.message}`);
    }
  };

  const handleTestVoice = async () => {
    if (!ELEVENLABS_API_KEY || ELEVENLABS_API_KEY === 'your_elevenlabs_api_key_here') {
      alert('Please add your ElevenLabs API key to .env.local file');
      return;
    }

    setIsTesting(true);
    const testText = "Hello! This is a test of the ElevenLabs voice synthesis system. I'm speaking with the selected voice.";

    try {
      await speakWithElevenLabs(testText);
    } finally {
      setIsTesting(false);
    }
  };

  const handleStopSpeaking = () => {
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.currentTime = 0;
      setIsSpeaking(false);
      setAgentStatus('ready');
      setHealthStatus((prev) => ({ ...prev, voice: 'healthy' }));
    }
  };

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="md"
      fullWidth
      PaperProps={{
        sx: {
          backgroundColor: '#1a1a1a',
          color: 'white',
          minHeight: '600px'
        }
      }}
    >
      <DialogTitle sx={{ color: '#16A34A', fontWeight: 'bold', fontSize: '1.5rem' }}>
        <Box display="flex" alignItems="center" gap={2}>
          <VoiceChat sx={{ fontSize: 28 }} />
          Liv Hana Voice Mode Control Center
        </Box>
      </DialogTitle>

      <DialogContent>
        <Box sx={{ mb: 3 }}>
          <Typography variant="body1" sx={{ mb: 2, color: '#E5E7EB' }}>
            Configure Liv Hana's voice synthesis settings and test different voices in real-time.
          </Typography>
          <HealthBanner
            voiceStatus={healthStatus.voice}
            reasoningStatus={healthStatus.reasoning}
            queueDepth={healthStatus.queueDepth}
          />
        </Box>

        <Box sx={{ display: 'flex', gap: 3, flexDirection: { xs: 'column', md: 'row' } }}>

          {/* Voice Selection Panel */}
          <Box sx={{ flex: 1 }}>
            <Card sx={{ backgroundColor: '#2d2d2d', mb: 3 }}>
              <CardContent>
                <Typography variant="h6" sx={{ color: '#16A34A', mb: 2 }}>
                  Voice Selection
                </Typography>

                <FormControl fullWidth sx={{ mb: 2 }}>
                  <InputLabel sx={{ color: '#E5E7EB' }}>Select Voice</InputLabel>
                  <Select
                    value={selectedVoice}
                    onChange={handleVoiceChange}
                    sx={{
                      color: 'white',
                      '& .MuiSelect-icon': { color: '#16A34A' },
                      '& .MuiOutlinedInput-notchedOutline': { borderColor: '#374151' }
                    }}
                  >
                    {voiceOptions.map((voice) => (
                      <MenuItem key={voice.id} value={voice.id}>
                        <Box display="flex" alignItems="center" gap={1} sx={{ width: '100%' }}>
                          <Person sx={{ fontSize: 16, color: '#16A34A' }} />
                          <Box sx={{ flex: 1 }}>
                            <Typography variant="body2" fontWeight="medium">
                              {voice.name}
                            </Typography>
                            <Typography variant="caption" color="textSecondary">
                              {voice.description}
                            </Typography>
                          </Box>
                          <Chip
                            label={voice.gender}
                            size="small"
                            sx={{
                              ml: 'auto',
                              height: 16,
                              fontSize: '0.7rem',
                              backgroundColor: voice.gender === 'Female' ? 'rgba(245, 158, 11, 0.2)' : 'rgba(22, 163, 74, 0.2)',
                              color: voice.gender === 'Female' ? '#F59E0B' : '#16A34A',
                            }}
                          />
                        </Box>
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>

                {/* Current Voice Details */}
                {currentVoice && (
                  <Card sx={{ backgroundColor: '#374151', p: 2 }}>
                    <Typography variant="h6" sx={{ color: '#16A34A', mb: 1 }}>
                      Current Voice: {currentVoice.name}
                    </Typography>
                    <Typography variant="body2" sx={{ mb: 1 }}>
                      {currentVoice.description}
                    </Typography>
                    <Box display="flex" gap={1} flexWrap="wrap">
                      <Chip label={`Gender: ${currentVoice.gender}`} size="small" />
                      <Chip label={`Age: ${currentVoice.age}`} size="small" />
                      <Chip label={`Accent: ${currentVoice.accent}`} size="small" />
                    </Box>
                  </Card>
                )}
              </CardContent>
            </Card>
          </Box>

          {/* Voice Settings Panel */}
          <Box sx={{ flex: 1 }}>
            <Card sx={{ backgroundColor: '#2d2d2d' }}>
              <CardContent>
                <Typography variant="h6" sx={{ color: '#16A34A', mb: 2 }}>
                  Voice Settings
                </Typography>

                <Box sx={{ mb: 3 }}>
                  <Box display="flex" justifyContent="space-between" mb={1}>
                    <Typography variant="body2">Audio Level</Typography>
                    <Typography variant="body2">{audioLevel}%</Typography>
                  </Box>
                  <Slider
                    value={audioLevel}
                    onChange={(_, value) => setAudioLevel(value)}
                    min={0}
                    max={100}
                    sx={{ color: '#16A34A' }}
                  />
                </Box>

                <Box sx={{ mb: 3 }}>
                  <Box display="flex" justifyContent="space-between" mb={1}>
                    <Typography variant="body2">Stability</Typography>
                    <Typography variant="body2">{stability}%</Typography>
                  </Box>
                  <Slider
                    value={stability}
                    onChange={(_, value) => setStability(value)}
                    min={0}
                    max={100}
                    sx={{ color: '#16A34A' }}
                  />
                </Box>

                <Box sx={{ mb: 3 }}>
                  <Box display="flex" justifyContent="space-between" mb={1}>
                    <Typography variant="body2">Similarity Boost</Typography>
                    <Typography variant="body2">{similarityBoost}%</Typography>
                  </Box>
                  <Slider
                    value={similarityBoost}
                    onChange={(_, value) => setSimilarityBoost(value)}
                    min={0}
                    max={100}
                    sx={{ color: '#16A34A' }}
                  />
                </Box>
              </CardContent>
            </Card>
          </Box>

          {/* Reasoning Job Status Panel */}
          <Box sx={{ flex: 1 }}>
            <Card sx={{ backgroundColor: '#2d2d2d', mb: 3 }}>
              <CardContent>
                <Typography variant="h6" sx={{ color: '#16A34A', mb: 2 }}>
                  Reasoning Job Status
                </Typography>
                <TextField
                  label="Reasoning Prompt"
                  value={reasoningPrompt}
                  onChange={(event) => setReasoningPrompt(event.target.value)}
                  multiline
                  minRows={3}
                  fullWidth
                  sx={{ mb: 2 }}
                  inputProps={{ 'data-testid': 'reasoning-prompt-input' }}
                />
                <Button
                  variant="contained"
                  color="primary"
                  sx={{ mb: 2, backgroundColor: '#16A34A', '&:hover': { backgroundColor: '#15803D' } }}
                  onClick={async () => {
                    try {
                      await reasoning.submitJob({ prompt: reasoningPrompt, sessionId: 'voice-mode', metadata: { source: 'voice-panel' } });
                    } catch (error) {
                      console.error('Failed to submit reasoning job', error);
                    }
                  }}
                  disabled={['submitting', 'queued', 'progress'].includes(reasoning.status)}
                  data-testid="reasoning-submit-button"
                >
                  {reasoning.status === 'submitting' ? 'Submitting…' : 'Request Reasoning'}
                </Button>
                <Typography variant="body2" sx={{ color: '#E5E7EB', mb: 1 }} data-testid="reasoning-status-text">
                  Status: {reasoning.status}
                </Typography>
                {reasoning.jobId && (
                  <Typography variant="body2" sx={{ color: '#9CA3AF', mb: 1 }} data-testid="reasoning-job-id">
                    Job ID: {reasoning.jobId}
                  </Typography>
                )}
                {reasoning.error && (
                  <Typography variant="body2" sx={{ color: '#F87171', mb: 1 }} data-testid="reasoning-error">
                    Error: {reasoning.error}
                  </Typography>
                )}
                {reasoning.result?.partial && (
                  <Typography variant="body2" sx={{ color: '#E5E7EB', mb: 1 }} data-testid="reasoning-partial">
                    Partial: {reasoning.result.partial}
                  </Typography>
                )}
                {reasoning.result?.final && (
                  <Typography variant="body2" sx={{ color: '#16A34A', mb: 1 }} data-testid="reasoning-final">
                    Final: {reasoning.result.final}
                  </Typography>
                )}
                <Button
                  variant="outlined"
                  color="primary"
                  sx={{ mt: 2, borderColor: '#16A34A', color: '#16A34A' }}
                  onClick={reasoning.reset}
                  data-testid="reasoning-reset-button"
                >
                  Reset
                </Button>
              </CardContent>
            </Card>
          </Box>
        </Box>

        {/* Test Controls */}
        <Box sx={{ mt: 3, display: 'flex', gap: 2, justifyContent: 'center', flexWrap: 'wrap' }}>
          <Button
            variant="contained"
            startIcon={isTesting ? <CircularProgress size={20} /> : <PlayArrow />}
            onClick={handleTestVoice}
            disabled={isSpeaking || isTesting}
            sx={{
              backgroundColor: '#16A34A',
              '&:hover': { backgroundColor: '#15803D' },
              minWidth: 200
            }}
            data-testid="test-voice-button"
          >
            {isTesting ? 'Testing Voice...' : `Test ${currentVoice?.name || 'Voice'}`}
          </Button>

          <Button
            variant="outlined"
            startIcon={<Stop />}
            onClick={handleStopSpeaking}
            disabled={!isSpeaking}
            sx={{
              borderColor: '#EF4444',
              color: '#EF4444',
              '&:hover': { borderColor: '#DC2626', color: '#DC2626' },
              minWidth: 150
            }}
            data-testid="stop-speaking-button"
          >
            Stop Speaking
          </Button>
        </Box>

        {/* Status Display */}
        <Paper sx={{ mt: 3, p: 2, backgroundColor: '#374151' }} data-testid="voice-mode-status">
          <Typography variant="h6" sx={{ color: '#16A34A', mb: 1 }}>
            System Status
          </Typography>
          <Box display="flex" alignItems="center" gap={2} flexWrap="wrap">
            <Chip
              label={`Voice Mode: ${voiceModeActive ? 'Active' : 'Inactive'}`}
              color={voiceModeActive ? 'success' : 'default'}
            />
            <Chip
              label={`Agent Status: ${agentStatus}`}
              color={agentStatus === 'ready' ? 'success' : agentStatus === 'speaking' ? 'warning' : 'error'}
            />
            <Chip
              label={`Reasoning Status: ${reasoning.status}`}
              color={['completed', 'idle'].includes(reasoning.status) ? 'success' : reasoning.status === 'error' ? 'error' : 'warning'}
              data-testid="reasoning-status-chip"
            />
            <Chip
              label={`API Key: ${ELEVENLABS_API_KEY && ELEVENLABS_API_KEY !== 'your_elevenlabs_api_key_here' ? 'Configured' : 'Missing'}`}
              color={ELEVENLABS_API_KEY && ELEVENLABS_API_KEY !== 'your_elevenlabs_api_key_here' ? 'success' : 'error'}
            />
          </Box>
        </Paper>
      </DialogContent>

      <DialogActions sx={{ justifyContent: 'space-between', p: 3 }}>
        <Button
          onClick={onClose}
          variant="outlined"
          sx={{ borderColor: '#374151', color: '#E5E7EB' }}
          data-testid="close-voice-mode"
        >
          Close
        </Button>

        <Box display="flex" gap={2}>
          <Button
            onClick={toggleVoiceMode}
            variant="contained"
            startIcon={voiceModeActive ? <MicOff /> : <Mic />}
            sx={{
              backgroundColor: voiceModeActive ? '#EF4444' : '#16A34A',
              '&:hover': {
                backgroundColor: voiceModeActive ? '#DC2626' : '#15803D'
              }
            }}
            data-testid="toggle-voice-mode"
          >
            {voiceModeActive ? 'Disable Voice Mode' : 'Enable Voice Mode'}
          </Button>
        </Box>
      </DialogActions>
    </Dialog>
  );
};

export default VoiceMode;
