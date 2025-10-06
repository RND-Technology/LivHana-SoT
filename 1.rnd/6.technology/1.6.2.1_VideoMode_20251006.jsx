/**
 * 📹 VIDEO MODE - Texas Takeover Video Interface
 * 
 * Features:
 * - Camera access and recording
 * - Video processing
 * - COA scanning via camera
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
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Slider,
  Switch,
  FormControlLabel
} from '@mui/material';
import {
  Videocam,
  VideocamOff,
  PhotoCamera,
  Stop,
  PlayArrow,
  Pause,
  Settings,
  Refresh,
  Download,
  Upload,
  QrCode,
  CameraAlt
} from '@mui/icons-material';
import { motion, AnimatePresence } from 'framer-motion';

const VideoMode = () => {
  const [isRecording, setIsRecording] = useState(false);
  const [isStreaming, setIsStreaming] = useState(false);
  const [recordingTime, setRecordingTime] = useState(0);
  const [videoStream, setVideoStream] = useState(null);
  const [recordedChunks, setRecordedChunks] = useState([]);
  const [videoUrl, setVideoUrl] = useState(null);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [status, setStatus] = useState('ready');
  const [error, setError] = useState(null);
  const [cameraMode, setCameraMode] = useState('environment');
  const [quality, setQuality] = useState(720);
  const [autoScan, setAutoScan] = useState(true);

  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const mediaRecorderRef = useRef(null);
  const streamRef = useRef(null);
  const timerRef = useRef(null);

  // Initialize camera
  useEffect(() => {
    initializeCamera();
    return () => {
      stopCamera();
    };
  }, [cameraMode]);

  const initializeCamera = async () => {
    try {
      setStatus('initializing');
      setError(null);

      const constraints = {
        video: {
          facingMode: cameraMode,
          width: { ideal: quality },
          height: { ideal: quality * 0.75 }
        },
        audio: true
      };

      const stream = await navigator.mediaDevices.getUserMedia(constraints);
      streamRef.current = stream;
      setVideoStream(stream);

      if (videoRef.current) {
        videoRef.current.srcObject = stream;
      }

      setIsStreaming(true);
      setStatus('ready');
    } catch (err) {
      setError(`Camera error: ${err.message}`);
      setStatus('error');
    }
  };

  const stopCamera = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
    }
    setVideoStream(null);
    setIsStreaming(false);
    setIsRecording(false);
    setRecordingTime(0);
    if (timerRef.current) {
      clearInterval(timerRef.current);
    }
  };

  const startRecording = () => {
    if (!videoStream) return;

    try {
      const mediaRecorder = new MediaRecorder(videoStream, {
        mimeType: 'video/webm;codecs=vp9'
      });
      
      mediaRecorderRef.current = mediaRecorder;
      setRecordedChunks([]);

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          setRecordedChunks(prev => [...prev, event.data]);
        }
      };

      mediaRecorder.onstop = () => {
        const blob = new Blob(recordedChunks, { type: 'video/webm' });
        const url = URL.createObjectURL(blob);
        setVideoUrl(url);
      };

      mediaRecorder.start();
      setIsRecording(true);
      setStatus('recording');
      setRecordingTime(0);

      // Start timer
      timerRef.current = setInterval(() => {
        setRecordingTime(prev => prev + 1);
      }, 1000);

    } catch (err) {
      setError(`Recording error: ${err.message}`);
      setStatus('error');
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
      setStatus('ready');
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    }
  };

  const capturePhoto = () => {
    if (!videoRef.current || !canvasRef.current) return;

    const canvas = canvasRef.current;
    const video = videoRef.current;
    const context = canvas.getContext('2d');

    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    context.drawImage(video, 0, 0);

    const dataURL = canvas.toDataURL('image/png');
    
    // Download the image
    const link = document.createElement('a');
    link.download = `texas-takeover-photo-${Date.now()}.png`;
    link.href = dataURL;
    link.click();

    // If auto-scan is enabled, process the image
    if (autoScan) {
      processImageForCOA(dataURL);
    }
  };

  const processImageForCOA = async (imageData) => {
    try {
      setStatus('processing');
      
      // Simulate COA processing
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // Mock COA detection result
      const mockResult = {
        detected: Math.random() > 0.3,
        confidence: Math.random() * 100,
        text: 'Texas Hemp Flower - 0.28% THC - Batch #TX2025001'
      };

      if (mockResult.detected) {
        setStatus('success');
        // Navigate to COA checker with result
        window.dispatchEvent(new CustomEvent('navigate', { 
          detail: { 
            tab: 1, 
            coaResult: mockResult 
          } 
        }));
    } else {
        setStatus('ready');
        setError('No COA detected in image. Try again with better lighting.');
      }
    } catch (err) {
      setError(`COA processing error: ${err.message}`);
      setStatus('error');
    }
  };

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const getStatusColor = () => {
    switch (status) {
      case 'recording': return '#DC2626';
      case 'processing': return '#F59E0B';
      case 'success': return '#16A34A';
      case 'error': return '#DC2626';
      default: return '#64748B';
    }
  };

  const getStatusText = () => {
    switch (status) {
      case 'recording': return 'Recording...';
      case 'processing': return 'Processing...';
      case 'success': return 'Success';
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
            📹 Video Mode
          </Typography>
          <Typography variant="body1" sx={{ color: '#64748B' }}>
            Texas Takeover Video Interface - Camera-powered COA scanning
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
        <Alert severity="error" sx={{ mb: 3 }} onClose={() => setError(null)}>
          {error}
        </Alert>
      )}

      <Grid container spacing={3}>
        {/* Video Feed */}
        <Grid item xs={12} md={8}>
          <Card>
            <CardContent>
              <Typography variant="h6" sx={{ mb: 2 }}>
                📷 Camera Feed
              </Typography>
              
              <Box sx={{ position: 'relative', bgcolor: '#000', borderRadius: 2, overflow: 'hidden' }}>
                    <video
                  ref={videoRef}
                      autoPlay
                  playsInline
                      muted
                      style={{
                        width: '100%',
                    height: '400px',
                    objectFit: 'cover'
                  }}
                />
                
                {/* Recording Indicator */}
                {isRecording && (
                  <motion.div
                    animate={{ opacity: [1, 0.5, 1] }}
                    transition={{ duration: 1, repeat: Infinity }}
                    style={{
                      position: 'absolute',
                      top: 16,
                      left: 16,
                      bgcolor: '#DC2626',
                      color: 'white',
                      px: 2,
                      py: 1,
                      borderRadius: 1
                    }}
                  >
                    <Typography variant="body2" sx={{ fontWeight: 'bold' }}>
                      REC {formatTime(recordingTime)}
                    </Typography>
                  </motion.div>
                )}

                {/* COA Scan Overlay */}
                {autoScan && (
                      <Box
                        sx={{
                          position: 'absolute',
                      top: '50%',
                      left: '50%',
                      transform: 'translate(-50%, -50%)',
                      border: '2px dashed #16A34A',
                      width: '200px',
                      height: '150px',
                      borderRadius: 2,
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                      bgcolor: 'rgba(22, 163, 74, 0.1)'
                    }}
                  >
                    <QrCode sx={{ color: '#16A34A', fontSize: 40 }} />
                  </Box>
                )}
              </Box>

              {/* Hidden canvas for photo capture */}
              <canvas ref={canvasRef} style={{ display: 'none' }} />
                </CardContent>
              </Card>
            </Grid>

        {/* Controls */}
        <Grid item xs={12} md={4}>
          <Card>
            <CardContent>
              <Typography variant="h6" sx={{ mb: 2 }}>
                🎮 Video Controls
              </Typography>
              
              {/* Camera Controls */}
              <Box sx={{ mb: 3 }}>
                <Grid container spacing={1}>
                  <Grid item xs={6}>
                    <Button
                      variant="contained"
                      startIcon={isStreaming ? <VideocamOff /> : <Videocam />}
                      fullWidth
                      onClick={isStreaming ? stopCamera : initializeCamera}
                      sx={{ bgcolor: '#DC2626', '&:hover': { bgcolor: '#B91C1C' } }}
                    >
                      {isStreaming ? 'Stop Camera' : 'Start Camera'}
                    </Button>
                  </Grid>
                  <Grid item xs={6}>
                    <Button
                      variant="outlined"
                      startIcon={<PhotoCamera />}
                      fullWidth
                      onClick={capturePhoto}
                      disabled={!isStreaming}
                    >
                      Capture Photo
                    </Button>
            </Grid>
          </Grid>
        </Box>

              {/* Recording Controls */}
        <Box sx={{ mb: 3 }}>
                <Grid container spacing={1}>
                  <Grid item xs={6}>
                    <Button
                      variant="contained"
                      startIcon={isRecording ? <Stop /> : <PlayArrow />}
                      fullWidth
                      onClick={isRecording ? stopRecording : startRecording}
                      disabled={!isStreaming}
                      sx={{ bgcolor: '#F59E0B', '&:hover': { bgcolor: '#D97706' } }}
                    >
                      {isRecording ? 'Stop Recording' : 'Start Recording'}
                    </Button>
            </Grid>
                  <Grid item xs={6}>
                    <Button
                      variant="outlined"
                      startIcon={<CameraAlt />}
                      fullWidth
                      onClick={() => processImageForCOA('mock')}
                      disabled={!isStreaming}
                    >
                      Scan COA
                    </Button>
            </Grid>
          </Grid>
        </Box>

              {/* Settings */}
              <Box sx={{ mb: 2 }}>
                <FormControlLabel
                  control={
                    <Switch
                      checked={autoScan}
                      onChange={(e) => setAutoScan(e.target.checked)}
                    />
                  }
                  label="Auto-scan COA"
                  />
                </Box>

              {/* Status */}
              <Box sx={{ mb: 2 }}>
                <Typography variant="body2" sx={{ color: '#64748B', mb: 1 }}>
                  Camera Status: {isStreaming ? 'Active' : 'Inactive'}
                </Typography>
                <LinearProgress 
                  variant="determinate" 
                  value={isStreaming ? 100 : 0} 
                  sx={{ height: 8, borderRadius: 4 }}
                />
              </Box>

              {/* Quick Actions */}
              <Grid container spacing={1}>
                <Grid item xs={6}>
                  <Button
                    variant="outlined"
                    startIcon={<Refresh />}
                    fullWidth
                    onClick={() => {
                      stopCamera();
                      setTimeout(initializeCamera, 500);
                    }}
                  >
                    Restart
                  </Button>
                </Grid>
                <Grid item xs={6}>
                  <Button
                    variant="outlined"
                    startIcon={<Download />}
                    fullWidth
                    disabled={!videoUrl}
                    onClick={() => {
                      if (videoUrl) {
                        const link = document.createElement('a');
                        link.download = `texas-takeover-video-${Date.now()}.webm`;
                        link.href = videoUrl;
                        link.click();
                      }
                    }}
                  >
                    Download
                  </Button>
                </Grid>
              </Grid>
            </CardContent>
          </Card>
        </Grid>

        {/* COA Processing Results */}
        <Grid item xs={12}>
          <Card>
            <CardContent>
              <Typography variant="h6" sx={{ mb: 2 }}>
                📋 COA Processing Results
              </Typography>
              
              <Paper sx={{ p: 2, bgcolor: '#F8FAFC' }}>
                <Typography variant="body2" sx={{ color: '#64748B' }}>
                  {status === 'processing' ? 'Processing image for COA data...' :
                   status === 'success' ? 'COA detected successfully! Opening COA checker...' :
                   status === 'error' ? 'COA processing failed. Try again with better lighting.' :
                   'Capture a photo or start recording to process COA data.'}
                </Typography>
                
                {status === 'processing' && (
                  <LinearProgress sx={{ mt: 2 }} />
                )}
              </Paper>
            </CardContent>
          </Card>
        </Grid>

        {/* Video Features Help */}
        <Grid item xs={12}>
          <Card>
            <CardContent>
              <Typography variant="h6" sx={{ mb: 2 }}>
                🆘 Video Mode Features
              </Typography>
              
              <Grid container spacing={2}>
                <Grid item xs={12} md={6}>
                  <Paper sx={{ p: 2, bgcolor: '#F0F9FF' }}>
                    <Typography variant="subtitle2" sx={{ color: '#1E40AF', mb: 1 }}>
                      Camera Features
                    </Typography>
                    <Typography variant="body2" sx={{ color: '#64748B' }}>
                      • Real-time camera feed<br/>
                      • Photo capture<br/>
                      • Video recording<br/>
                      • Auto COA scanning
                    </Typography>
                  </Paper>
                </Grid>
                
                <Grid item xs={12} md={6}>
                  <Paper sx={{ p: 2, bgcolor: '#F0FDF4' }}>
                    <Typography variant="subtitle2" sx={{ color: '#166534', mb: 1 }}>
                      COA Processing
                    </Typography>
                    <Typography variant="body2" sx={{ color: '#64748B' }}>
                      • Automatic COA detection<br/>
                      • Text extraction<br/>
                      • Compliance checking<br/>
                      • Integration with COA checker
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
        <DialogTitle>Video Settings</DialogTitle>
        <DialogContent>
          <Box sx={{ pt: 2 }}>
            <Typography variant="subtitle2" sx={{ mb: 1 }}>
              Camera Mode: {cameraMode}
              </Typography>
            <Box sx={{ display: 'flex', gap: 1, mb: 2 }}>
              {['user', 'environment'].map((mode) => (
                <Chip
                  key={mode}
                  label={mode}
                  onClick={() => setCameraMode(mode)}
                  color={cameraMode === mode ? 'primary' : 'default'}
                />
              ))}
            </Box>
            
            <Typography variant="subtitle2" sx={{ mb: 1 }}>
              Video Quality: {quality}p
            </Typography>
            <Slider
              value={quality}
              onChange={(e, value) => setQuality(value)}
              min={480}
              max={1080}
              step={240}
              marks={[
                { value: 480, label: '480p' },
                { value: 720, label: '720p' },
                { value: 1080, label: '1080p' }
              ]}
              sx={{ mb: 2 }}
            />
          </Box>
      </DialogContent>
        <DialogActions>
          <Button onClick={() => setSettingsOpen(false)}>Close</Button>
      </DialogActions>
    </Dialog>
    </Box>
  );
};

export default VideoMode;