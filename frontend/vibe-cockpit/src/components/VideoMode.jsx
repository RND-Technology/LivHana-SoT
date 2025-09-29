import React, { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import {
  Dialog, DialogTitle, DialogContent, DialogActions, Button, Box, Typography,
  Card, CardContent, IconButton, Select, MenuItem, FormControl, InputLabel,
  Chip, Slider, Switch, FormControlLabel, Grid, Paper, Avatar
} from '@mui/material';
import {
  Videocam, VideocamOff, Mic, MicOff, ScreenShare, StopScreenShare,
  CallEnd, Settings, VolumeUp, VolumeDown, Person, Group,
  SignalWifi4Bar, SignalWifi0Bar, Refresh, Fullscreen, FullscreenExit
} from '@mui/icons-material';

const TURN_SERVER_URL = import.meta.env.REACT_APP_WEBRTC_TURN_SERVER || 'turn:openrelay.metered.ca:80';
const TURN_USERNAME = import.meta.env.REACT_APP_WEBRTC_TURN_USERNAME || 'openrelayproject';
const TURN_PASSWORD = import.meta.env.REACT_APP_WEBRTC_TURN_PASSWORD || 'openrelayproject';

const VideoMode = ({
  open,
  onClose,
  videoModeActive,
  toggleVideoMode,
  agentStatus,
  setAgentStatus
}) => {
  const [localStream, setLocalStream] = useState(null);
  const [remoteStream, setRemoteStream] = useState(null);
  const [isConnected, setIsConnected] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [isVideoOn, setIsVideoOn] = useState(true);
  const [isScreenSharing, setIsScreenSharing] = useState(false);
  const [videoQuality, setVideoQuality] = useState('high');
  const [participants, setParticipants] = useState([
    { id: 'liv-hana', name: 'Liv Hana AI', status: 'connected', avatar: '🤖' },
    { id: 'user', name: 'You', status: 'connected', avatar: '👤' }
  ]);
  const [connectionStatus, setConnectionStatus] = useState('disconnected');
  const [isFullscreen, setIsFullscreen] = useState(false);

  const localVideoRef = useRef(null);
  const remoteVideoRef = useRef(null);
  const peerConnectionRef = useRef(null);
  const screenShareStreamRef = useRef(null);

  const iceServers = useMemo(() => ({
    iceServers: [
      {
        urls: TURN_SERVER_URL,
        username: TURN_USERNAME,
        credential: TURN_PASSWORD
      },
      {
        urls: 'stun:stun.l.google.com:19302'
      }
    ]
  }), []);

  const startVideoCall = useCallback(async () => {
    if (isConnected) return;

    try {
      setConnectionStatus('connecting');
      setAgentStatus('connecting');

      // Get local media stream
      const stream = await navigator.mediaDevices.getUserMedia({
        video: videoQuality === 'high' ? { width: 1280, height: 720 } :
               videoQuality === 'medium' ? { width: 640, height: 480 } : { width: 320, height: 240 },
        audio: true
      });

      setLocalStream(stream);
      if (localVideoRef.current) {
        localVideoRef.current.srcObject = stream;
      }

      // Create peer connection
      const peerConnection = new RTCPeerConnection(iceServers);
      peerConnectionRef.current = peerConnection;

      // Add local stream
      stream.getTracks().forEach(track => {
        peerConnection.addTrack(track, stream);
      });

      // Handle remote stream
      peerConnection.ontrack = (event) => {
        const remoteStream = event.streams[0];
        setRemoteStream(remoteStream);
        if (remoteVideoRef.current) {
          remoteVideoRef.current.srcObject = remoteStream;
        }
      };

      // Handle ICE candidates
      peerConnection.onicecandidate = (event) => {
        if (event.candidate) {
          console.log('ICE candidate:', event.candidate);
          // In a real implementation, send to remote peer
        }
      };

      // Handle connection state
      peerConnection.onconnectionstatechange = () => {
        const state = peerConnection.connectionState;
        setConnectionStatus(state);

        if (state === 'connected') {
          setIsConnected(true);
          setAgentStatus('video-ready');
        } else if (state === 'disconnected' || state === 'failed' || state === 'closed') {
          setIsConnected(false);
          setAgentStatus('ready');
        }
      };

      // Create and set local description
      const offer = await peerConnection.createOffer();
      await peerConnection.setLocalDescription(offer);

      // In a real implementation, send offer to LivHana AI backend
      // For demo purposes, we'll simulate a connection
      setTimeout(() => {
        setConnectionStatus('connected');
        setIsConnected(true);
        setAgentStatus('video-ready');
      }, 2000);

    } catch (error) {
      console.error('Error starting video call:', error);
      setConnectionStatus('error');
      setAgentStatus('error');
    }
  }, [isConnected, videoQuality, iceServers, setConnectionStatus, setAgentStatus]);

  const endVideoCall = useCallback(() => {
    setIsConnected(false);
    setIsVideoOn(false);
    setIsMuted(false); // Reset mute state
    setIsScreenSharing(false);

    if (peerConnectionRef.current) {
      peerConnectionRef.current.close();
      peerConnectionRef.current = null;
    }

    if (localStream) {
      localStream.getTracks().forEach(track => track.stop());
      setLocalStream(null);
    }

    if (screenShareStreamRef.current) {
      screenShareStreamRef.current.getTracks().forEach(track => track.stop());
      screenShareStreamRef.current = null;
    }

    setRemoteStream(null);
    setConnectionStatus('disconnected');
    setAgentStatus('ready');
  }, [localStream, setIsConnected, setIsVideoOn, setIsMuted, setIsScreenSharing, setRemoteStream, setConnectionStatus, setAgentStatus]);

  const toggleMute = () => {
    if (localStream) {
      const audioTrack = localStream.getAudioTracks()[0];
      if (audioTrack) {
        audioTrack.enabled = !audioTrack.enabled;
        setIsMuted(!audioTrack.enabled);
      }
    }
  };

  const toggleVideo = () => {
    if (localStream) {
      const videoTrack = localStream.getVideoTracks()[0];
      if (videoTrack) {
        videoTrack.enabled = !videoTrack.enabled;
        setIsVideoOn(videoTrack.enabled);
      }
    }
  };

  const toggleScreenShare = useCallback(async () => {
    if (!isScreenSharing) {
      try {
        const screenStream = await navigator.mediaDevices.getDisplayMedia({
          video: true,
          audio: true
        });

        screenShareStreamRef.current = screenStream;

        if (peerConnectionRef.current) {
          const videoSender = peerConnectionRef.current.getSenders().find(s =>
            s.track && s.track.kind === 'video'
          );

          if (videoSender) {
            videoSender.replaceTrack(screenStream.getVideoTracks()[0]);
          }
        }

        setIsScreenSharing(true);

        // Handle screen share end
        screenStream.getVideoTracks()[0].addEventListener('ended', () => {
          stopScreenShare();
        });

      } catch (error) {
        console.error('Error starting screen share:', error);
      }
    } else {
      stopScreenShare();
    }
  }, [isScreenSharing, stopScreenShare]);

  const stopScreenShare = useCallback(() => {
    if (screenShareStreamRef.current) {
      screenShareStreamRef.current.getTracks().forEach(track => track.stop());
      screenShareStreamRef.current = null;
    }

    if (peerConnectionRef.current && localStream) {
      const videoSender = peerConnectionRef.current.getSenders().find(s =>
        s.track && s.track.kind === 'video'
      );

      if (videoSender) {
        videoSender.replaceTrack(localStream.getVideoTracks()[0]);
      }
    }

    setIsScreenSharing(false);

  }, [localStream]);

  const toggleFullscreen = useCallback(() => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen();
      setIsFullscreen(true);
    } else {
      document.exitFullscreen();
      setIsFullscreen(false);
    }
  }, []);

  useEffect(() => {
    if (videoModeActive && !isConnected) {
      startVideoCall();
    } else if (!videoModeActive) {
      endVideoCall();
    }

    return () => {
      endVideoCall();
    };
  }, [videoModeActive, endVideoCall, isConnected, startVideoCall]);

  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(!!document.fullscreenElement);
    };

    document.addEventListener('fullscreenchange', handleFullscreenChange);
    return () => document.removeEventListener('fullscreenchange', handleFullscreenChange);
  }, []);

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="xl"
      fullWidth
      fullScreen={isFullscreen}
      PaperProps={{
        sx: {
          backgroundColor: '#1a1a1a',
          color: 'white',
          minHeight: '600px',
          maxHeight: '90vh'
        }
      }}
    >
      <DialogTitle sx={{ color: '#F59E0B', fontWeight: 'bold', fontSize: '1.5rem' }}>
        <Box display="flex" alignItems="center" gap={2}>
          <Videocam sx={{ fontSize: 28 }} />
          Liv Hana Video Conference Center
        </Box>
      </DialogTitle>

      <DialogContent>
        {/* Video Area */}
        <Box sx={{ mb: 3 }}>
          <Grid container spacing={2} sx={{ height: '400px' }}>
            {/* Local Video */}
            <Grid item xs={12} md={6}>
              <Card sx={{ backgroundColor: '#2d2d2d', height: '100%' }}>
                <CardContent sx={{ p: 1, height: '100%' }}>
                  <Box sx={{ position: 'relative', width: '100%', height: '100%' }}>
                    <video
                      ref={localVideoRef}
                      autoPlay
                      muted
                      playsInline
                      style={{
                        width: '100%',
                        height: '100%',
                        objectFit: 'cover',
                        borderRadius: '8px',
                        transform: 'scaleX(-1)' // Mirror local video
                      }}
                    />
                    {!isVideoOn && (
                      <Box
                        sx={{
                          position: 'absolute',
                          top: 0,
                          left: 0,
                          right: 0,
                          bottom: 0,
                          backgroundColor: '#374151',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          borderRadius: '8px'
                        }}
                      >
                        <Typography variant="h3">📹</Typography>
                      </Box>
                    )}
                    <Box
                      sx={{
                        position: 'absolute',
                        bottom: 8,
                        left: 8,
                        backgroundColor: 'rgba(0,0,0,0.7)',
                        px: 1,
                        py: 0.5,
                        borderRadius: 1
                      }}
                    >
                      <Typography variant="caption" sx={{ color: 'white' }}>
                        You {isMuted && '🔇'}
                      </Typography>
                    </Box>
                  </Box>
                </CardContent>
              </Card>
            </Grid>

            {/* Remote Video */}
            <Grid item xs={12} md={6}>
              <Card sx={{ backgroundColor: '#2d2d2d', height: '100%' }}>
                <CardContent sx={{ p: 1, height: '100%' }}>
                  <Box sx={{ position: 'relative', width: '100%', height: '100%' }}>
                    {remoteStream ? (
                      <video
                        ref={remoteVideoRef}
                        autoPlay
                        playsInline
                        style={{
                          width: '100%',
                          height: '100%',
                          objectFit: 'cover',
                          borderRadius: '8px'
                        }}
                      />
                    ) : (
                      <Box
                        sx={{
                          width: '100%',
                          height: '100%',
                          background: 'linear-gradient(135deg, #F59E0B 0%, #16A34A 100%)',
                          display: 'flex',
                          flexDirection: 'column',
                          alignItems: 'center',
                          justifyContent: 'center',
                          borderRadius: '8px',
                          border: '2px solid rgba(245, 158, 11, 0.3)'
                        }}
                      >
                        <Typography variant="h2" sx={{ mb: 2 }}>🤖</Typography>
                        <Typography variant="h6">Liv Hana AI</Typography>
                        <Typography variant="body2" sx={{ opacity: 0.8 }}>
                          {connectionStatus === 'connecting' ? 'Connecting...' :
                           connectionStatus === 'connected' ? 'Connected' : 'Waiting...'}
                        </Typography>
                      </Box>
                    )}
                    <Box
                      sx={{
                        position: 'absolute',
                        bottom: 8,
                        left: 8,
                        backgroundColor: 'rgba(0,0,0,0.7)',
                        px: 1,
                        py: 0.5,
                        borderRadius: 1
                      }}
                    >
                      <Typography variant="caption" sx={{ color: 'white' }}>
                        Liv Hana AI
                      </Typography>
                    </Box>
                  </Box>
                </CardContent>
              </Card>
            </Grid>
          </Grid>
        </Box>

        {/* Controls */}
        <Box sx={{ mb: 3 }}>
          <Grid container spacing={2} alignItems="center">
            <Grid item xs={12} md={4}>
              <FormControl fullWidth size="small">
                <InputLabel sx={{ color: '#E5E7EB' }}>Video Quality</InputLabel>
                <Select
                  value={videoQuality}
                  onChange={(e) => setVideoQuality(e.target.value)}
                  sx={{
                    color: 'white',
                    '& .MuiSelect-icon': { color: '#F59E0B' },
                    '& .MuiOutlinedInput-notchedOutline': { borderColor: '#374151' }
                  }}
                >
                  <MenuItem value="low">Low (320x240)</MenuItem>
                  <MenuItem value="medium">Medium (640x480)</MenuItem>
                  <MenuItem value="high">High (1280x720)</MenuItem>
                </Select>
              </FormControl>
            </Grid>

            <Grid item xs={12} md={8}>
              <Box sx={{ display: 'flex', gap: 1, justifyContent: 'center', flexWrap: 'wrap' }}>
                <IconButton
                  onClick={toggleMute}
                  sx={{
                    backgroundColor: isMuted ? '#EF4444' : '#16A34A',
                    color: 'white',
                    '&:hover': { backgroundColor: isMuted ? '#DC2626' : '#15803D' }
                  }}
                >
                  {isMuted ? <MicOff /> : <Mic />}
                </IconButton>

                <IconButton
                  onClick={toggleVideo}
                  sx={{
                    backgroundColor: !isVideoOn ? '#EF4444' : '#16A34A',
                    color: 'white',
                    '&:hover': { backgroundColor: !isVideoOn ? '#DC2626' : '#15803D' }
                  }}
                >
                  {isVideoOn ? <Videocam /> : <VideocamOff />}
                </IconButton>

                <IconButton
                  onClick={toggleScreenShare}
                  sx={{
                    backgroundColor: isScreenSharing ? '#F59E0B' : '#16A34A',
                    color: 'white',
                    '&:hover': { backgroundColor: isScreenSharing ? '#D97706' : '#15803D' }
                  }}
                >
                  {isScreenSharing ? <StopScreenShare /> : <ScreenShare />}
                </IconButton>

                <IconButton
                  onClick={toggleFullscreen}
                  sx={{
                    backgroundColor: '#374151',
                    color: 'white',
                    '&:hover': { backgroundColor: '#4B5563' }
                  }}
                >
                  {isFullscreen ? <FullscreenExit /> : <Fullscreen />}
                </IconButton>

                <IconButton
                  onClick={endVideoCall}
                  sx={{
                    backgroundColor: '#EF4444',
                    color: 'white',
                    '&:hover': { backgroundColor: '#DC2626' }
                  }}
                >
                  <CallEnd />
                </IconButton>
              </Box>
            </Grid>
          </Grid>
        </Box>

        {/* Participants */}
        <Paper sx={{ p: 2, backgroundColor: '#374151' }}>
          <Box display="flex" alignItems="center" gap={2} mb={2}>
            <Group sx={{ color: '#16A34A' }} />
            <Typography variant="h6" sx={{ color: '#16A34A' }}>
              Participants ({participants.length})
            </Typography>
          </Box>
          <Box display="flex" gap={2} flexWrap="wrap">
            {participants.map((participant) => (
              <Box key={participant.id} display="flex" alignItems="center" gap={1}>
                <Avatar sx={{ bgcolor: participant.id === 'liv-hana' ? '#F59E0B' : '#16A34A' }}>
                  {participant.avatar}
                </Avatar>
                <Box>
                  <Typography variant="body2" fontWeight="medium">
                    {participant.name}
                  </Typography>
                  <Chip
                    label={participant.status}
                    size="small"
                    color={participant.status === 'connected' ? 'success' : 'default'}
                  />
                </Box>
              </Box>
            ))}
          </Box>
        </Paper>

        {/* Connection Status */}
        <Paper sx={{ mt: 2, p: 2, backgroundColor: '#374151' }}>
          <Box display="flex" alignItems="center" gap={2} justifyContent="space-between">
            <Box display="flex" alignItems="center" gap={2}>
              {connectionStatus === 'connected' ? (
                <SignalWifi4Bar sx={{ color: '#16A34A' }} />
              ) : connectionStatus === 'connecting' ? (
                <SignalWifi0Bar sx={{ color: '#F59E0B' }} />
              ) : (
                <SignalWifi0Bar sx={{ color: '#EF4444' }} />
              )}
              <Typography variant="body2">
                Connection: {connectionStatus === 'connected' ? 'Connected' :
                             connectionStatus === 'connecting' ? 'Connecting...' : 'Disconnected'}
              </Typography>
            </Box>

            <Box display="flex" alignItems="center" gap={2}>
              <Typography variant="body2" sx={{ color: '#16A34A' }}>
                Video Mode: {videoModeActive ? 'Active' : 'Inactive'}
              </Typography>
              <Typography variant="body2">
                Agent Status: {agentStatus}
              </Typography>
            </Box>
          </Box>
        </Paper>
      </DialogContent>

      <DialogActions sx={{ justifyContent: 'space-between', p: 3 }}>
        <Button
          onClick={onClose}
          variant="outlined"
          sx={{ borderColor: '#374151', color: '#E5E7EB' }}
        >
          Close
        </Button>

        <Box display="flex" gap={2}>
          <Button
            onClick={toggleVideoMode}
            variant="contained"
            startIcon={videoModeActive ? <VideocamOff /> : <Videocam />}
            sx={{
              backgroundColor: videoModeActive ? '#EF4444' : '#16A34A',
              '&:hover': {
                backgroundColor: videoModeActive ? '#DC2626' : '#15803D'
              }
            }}
          >
            {videoModeActive ? 'End Video Session' : 'Start Video Session'}
          </Button>
        </Box>
      </DialogActions>
    </Dialog>
  );
};

export default VideoMode;
