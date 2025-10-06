/**
 * Liv Hana Chat Panel - BREAKTHROUGH VERSION
 *
 * Features:
 * - Voice transcription directly in chat (click-to-speak)
 * - File upload support
 * - Photo/image upload
 * - Expandable input area for max context
 * - Real-time reasoning integration
 * - Conversation history
 */
import React, { useState, useRef, useEffect } from 'react';
import {
  Box, Paper, TextField, IconButton, Button, Typography,
  Chip, Avatar, CircularProgress, Tooltip, Collapse, Badge,
  LinearProgress, Divider, Menu, MenuItem, ListItemIcon, ListItemText
} from '@mui/material';
import {
  Mic, MicOff, Send, AttachFile, Image as ImageIcon, ExpandMore, ExpandLess,
  Close, Delete, InsertDriveFile, VolumeUp, Refresh, MoreVert, ContentCopy
} from '@mui/icons-material';
import { useReasoningJob } from '../hooks/useReasoningJob';

const VOICE_SERVICE_BASE = import.meta.env.VITE_VOICE_API_BASE || 'http://localhost:4001/api';

const LivHanaChatPanel = ({ open, onClose }) => {
  // State management
  const [prompt, setPrompt] = useState('');
  const [isListening, setIsListening] = useState(false);
  const [isTranscribing, setIsTranscribing] = useState(false);
  const [conversation, setConversation] = useState([]);
  const [attachedFiles, setAttachedFiles] = useState([]);
  const [attachedImages, setAttachedImages] = useState([]);
  const [expanded, setExpanded] = useState(true);
  const [inputRows, setInputRows] = useState(4);
  const [contextMenu, setContextMenu] = useState(null);
  const [selectedMessageIndex, setSelectedMessageIndex] = useState(null);

  // Refs
  const mediaRecorderRef = useRef(null);
  const audioChunksRef = useRef([]);
  const fileInputRef = useRef(null);
  const imageInputRef = useRef(null);
  const conversationEndRef = useRef(null);

  // Reasoning hook
  const reasoning = useReasoningJob();

  // Auto-scroll to bottom
  useEffect(() => {
    conversationEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [conversation, reasoning.result]);

  // Add completed reasoning to conversation
  useEffect(() => {
    if (reasoning.status === 'completed' && reasoning.result?.final) {
      const lastMessage = conversation[conversation.length - 1];
      if (lastMessage?.type === 'response' && !lastMessage.text) {
        // Update existing placeholder
        setConversation(prev => {
          const updated = [...prev];
          updated[updated.length - 1] = {
            ...lastMessage,
            text: reasoning.result.final,
            timestamp: new Date().toISOString(),
            status: 'completed'
          };
          return updated;
        });
      }
    }
  }, [reasoning.status, reasoning.result?.final]);

  // Voice transcription
  const handleStartListening = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream, {
        mimeType: 'audio/webm;codecs=opus'
      });

      mediaRecorderRef.current = mediaRecorder;
      audioChunksRef.current = [];

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunksRef.current.push(event.data);
        }
      };

      mediaRecorder.onstop = async () => {
        stream.getTracks().forEach(track => track.stop());
        const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
        await transcribeAudio(audioBlob);
      };

      mediaRecorder.start();
      setIsListening(true);
    } catch (error) {
      console.error('Microphone error:', error);
      alert(`Microphone access failed: ${error.message}`);
    }
  };

  const handleStopListening = () => {
    if (mediaRecorderRef.current && mediaRecorderRef.current.state === 'recording') {
      mediaRecorderRef.current.stop();
      setIsListening(false);
    }
  };

  const transcribeAudio = async (audioBlob) => {
    setIsTranscribing(true);
    try {
      const formData = new FormData();
      formData.append('audio', audioBlob, 'recording.webm');

      const response = await fetch(`${VOICE_SERVICE_BASE}/whisper/transcribe`, {
        method: 'POST',
        body: formData
      });

      if (!response.ok) {
        throw new Error(`Transcription failed: ${response.status}`);
      }

      const result = await response.json();
      const transcribedText = result.text;

      // Append to existing prompt
      setPrompt(prev => prev ? `${prev}\n${transcribedText}` : transcribedText);
    } catch (error) {
      console.error('Transcription error:', error);
      alert(`Voice transcription failed: ${error.message}`);
    } finally {
      setIsTranscribing(false);
    }
  };

  // File upload
  const handleFileUpload = (event) => {
    const files = Array.from(event.target.files);
    setAttachedFiles(prev => [...prev, ...files]);
  };

  // Image upload
  const handleImageUpload = (event) => {
    const files = Array.from(event.target.files);
    files.forEach(file => {
      const reader = new FileReader();
      reader.onload = (e) => {
        setAttachedImages(prev => [...prev, {
          file,
          preview: e.target.result,
          name: file.name
        }]);
      };
      reader.readAsDataURL(file);
    });
  };

  // Remove attachment
  const removeFile = (index) => {
    setAttachedFiles(prev => prev.filter((_, i) => i !== index));
  };

  const removeImage = (index) => {
    setAttachedImages(prev => prev.filter((_, i) => i !== index));
  };

  // Submit message
  const handleSubmit = async () => {
    if (!prompt.trim() && attachedFiles.length === 0 && attachedImages.length === 0) {
      return;
    }

    // Add user message to conversation
    const userMessage = {
      type: 'user',
      text: prompt,
      files: [...attachedFiles],
      images: [...attachedImages],
      timestamp: new Date().toISOString()
    };
    setConversation(prev => [...prev, userMessage]);

    // Add placeholder for response
    const responsePlaceholder = {
      type: 'response',
      text: '',
      status: 'thinking',
      timestamp: new Date().toISOString()
    };
    setConversation(prev => [...prev, responsePlaceholder]);

    // Submit to reasoning engine
    try {
      await reasoning.submitJob({
        prompt: prompt,
        sessionId: 'chat-panel',
        metadata: {
          source: 'chat-panel',
          hasFiles: attachedFiles.length > 0,
          hasImages: attachedImages.length > 0
        }
      });
    } catch (error) {
      console.error('Failed to submit reasoning job:', error);
      setConversation(prev => {
        const updated = [...prev];
        updated[updated.length - 1] = {
          ...updated[updated.length - 1],
          text: `Error: ${error.message}`,
          status: 'error'
        };
        return updated;
      });
    }

    // Clear input
    setPrompt('');
    setAttachedFiles([]);
    setAttachedImages([]);
  };

  // Context menu
  const handleContextMenu = (event, index) => {
    event.preventDefault();
    setContextMenu({ mouseX: event.clientX, mouseY: event.clientY });
    setSelectedMessageIndex(index);
  };

  const handleCloseContextMenu = () => {
    setContextMenu(null);
    setSelectedMessageIndex(null);
  };

  const handleCopyMessage = () => {
    if (selectedMessageIndex !== null) {
      const message = conversation[selectedMessageIndex];
      navigator.clipboard.writeText(message.text);
    }
    handleCloseContextMenu();
  };

  const handleDeleteMessage = () => {
    if (selectedMessageIndex !== null) {
      setConversation(prev => prev.filter((_, i) => i !== selectedMessageIndex));
    }
    handleCloseContextMenu();
  };

  if (!open) return null;

  return (
    <Paper
      elevation={8}
      sx={{
        position: 'fixed',
        right: 16,
        bottom: 16,
        width: expanded ? 600 : 400,
        maxHeight: expanded ? '80vh' : '60vh',
        display: 'flex',
        flexDirection: 'column',
        bgcolor: '#1E293B',
        borderRadius: 3,
        overflow: 'hidden',
        transition: 'all 0.3s',
        zIndex: 1200,
        border: '2px solid #16A34A'
      }}
    >
      {/* Header */}
      <Box
        sx={{
          p: 2,
          bgcolor: '#16A34A',
          color: 'white',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between'
        }}
      >
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <Avatar sx={{ bgcolor: 'white', color: '#16A34A', width: 32, height: 32 }}>
            LH
          </Avatar>
          <Box>
            <Typography variant="subtitle1" fontWeight="bold">
              Liv Hana Assistant
            </Typography>
            <Typography variant="caption">
              {reasoning.status === 'progress' ? 'Thinking...' :
               reasoning.status === 'completed' ? 'Ready' :
               'Online'}
            </Typography>
          </Box>
        </Box>
        <Box>
          <IconButton size="small" onClick={() => setExpanded(!expanded)} sx={{ color: 'white' }}>
            {expanded ? <ExpandLess /> : <ExpandMore />}
          </IconButton>
          <IconButton size="small" onClick={onClose} sx={{ color: 'white' }}>
            <Close />
          </IconButton>
        </Box>
      </Box>

      {/* Conversation area */}
      <Box
        sx={{
          flexGrow: 1,
          overflow: 'auto',
          p: 2,
          bgcolor: '#0F172A',
          display: 'flex',
          flexDirection: 'column',
          gap: 2
        }}
      >
        {conversation.length === 0 && (
          <Box sx={{ textAlign: 'center', py: 4, color: '#64748B' }}>
            <Typography variant="h6" gutterBottom>
              👋 Hello! I'm Liv Hana
            </Typography>
            <Typography variant="body2">
              Ask me anything using text, voice, files, or images!
            </Typography>
          </Box>
        )}

        {conversation.map((message, index) => (
          <Box
            key={index}
            onContextMenu={(e) => handleContextMenu(e, index)}
            sx={{
              display: 'flex',
              justifyContent: message.type === 'user' ? 'flex-end' : 'flex-start'
            }}
          >
            <Paper
              sx={{
                p: 2,
                maxWidth: '75%',
                bgcolor: message.type === 'user' ? '#16A34A' : '#1E293B',
                color: 'white',
                borderRadius: 2
              }}
            >
              {message.text && (
                <Typography variant="body2" sx={{ whiteSpace: 'pre-wrap' }}>
                  {message.text}
                </Typography>
              )}

              {message.status === 'thinking' && !message.text && (
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <CircularProgress size={16} sx={{ color: '#16A34A' }} />
                  <Typography variant="caption" color="#64748B">
                    Reasoning...
                  </Typography>
                </Box>
              )}

              {message.files && message.files.length > 0 && (
                <Box sx={{ mt: 1, display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                  {message.files.map((file, i) => (
                    <Chip
                      key={i}
                      size="small"
                      icon={<InsertDriveFile />}
                      label={file.name}
                      sx={{ fontSize: '0.7rem' }}
                    />
                  ))}
                </Box>
              )}

              {message.images && message.images.length > 0 && (
                <Box sx={{ mt: 1, display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                  {message.images.map((img, i) => (
                    <img
                      key={i}
                      src={img.preview}
                      alt={img.name}
                      style={{ maxWidth: 100, maxHeight: 100, borderRadius: 4 }}
                    />
                  ))}
                </Box>
              )}

              <Typography variant="caption" sx={{ display: 'block', mt: 0.5, opacity: 0.7 }}>
                {new Date(message.timestamp).toLocaleTimeString()}
              </Typography>
            </Paper>
          </Box>
        ))}

        <div ref={conversationEndRef} />
      </Box>

      {/* Progress indicator */}
      {reasoning.status === 'progress' && (
        <LinearProgress sx={{ bgcolor: '#1E293B', '& .MuiLinearProgress-bar': { bgcolor: '#16A34A' } }} />
      )}

      {/* Attachments preview */}
      {(attachedFiles.length > 0 || attachedImages.length > 0) && (
        <Box sx={{ p: 1, bgcolor: '#1E293B', borderTop: '1px solid #334155' }}>
          <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
            {attachedFiles.map((file, index) => (
              <Chip
                key={`file-${index}`}
                icon={<InsertDriveFile />}
                label={file.name}
                onDelete={() => removeFile(index)}
                size="small"
                sx={{ bgcolor: '#334155', color: 'white' }}
              />
            ))}
            {attachedImages.map((img, index) => (
              <Badge
                key={`img-${index}`}
                badgeContent={
                  <IconButton
                    size="small"
                    onClick={() => removeImage(index)}
                    sx={{ bgcolor: '#EF4444', width: 16, height: 16, p: 0 }}
                  >
                    <Close sx={{ fontSize: 12, color: 'white' }} />
                  </IconButton>
                }
              >
                <img
                  src={img.preview}
                  alt={img.name}
                  style={{ width: 40, height: 40, borderRadius: 4, objectFit: 'cover' }}
                />
              </Badge>
            ))}
          </Box>
        </Box>
      )}

      {/* Input area */}
      <Box sx={{ p: 2, bgcolor: '#1E293B', borderTop: '2px solid #334155' }}>
        <TextField
          fullWidth
          multiline
          rows={inputRows}
          maxRows={12}
          value={prompt}
          onChange={(e) => setPrompt(e.target.value)}
          onKeyPress={(e) => {
            if (e.key === 'Enter' && !e.shiftKey) {
              e.preventDefault();
              handleSubmit();
            }
          }}
          placeholder="Ask Liv Hana anything... (Shift+Enter for new line)"
          disabled={isTranscribing || reasoning.status === 'submitting'}
          sx={{
            mb: 1,
            '& .MuiInputBase-root': {
              bgcolor: '#0F172A',
              color: 'white',
              fontSize: '0.9rem'
            },
            '& .MuiInputBase-input': {
              '&::placeholder': {
                color: '#64748B',
                opacity: 1
              }
            }
          }}
          InputProps={{
            endAdornment: (
              <Tooltip title={inputRows < 12 ? "Expand" : "Collapse"}>
                <IconButton
                  size="small"
                  onClick={() => setInputRows(prev => prev < 12 ? 12 : 4)}
                >
                  {inputRows < 12 ? <ExpandMore /> : <ExpandLess />}
                </IconButton>
              </Tooltip>
            )
          }}
        />

        {/* Action buttons */}
        <Box sx={{ display: 'flex', gap: 1, justifyContent: 'space-between', alignItems: 'center' }}>
          <Box sx={{ display: 'flex', gap: 0.5 }}>
            {/* Voice input */}
            <Tooltip title={isListening ? "Stop recording" : "Start voice input"}>
              <IconButton
                onClick={isListening ? handleStopListening : handleStartListening}
                disabled={isTranscribing || reasoning.status === 'submitting'}
                sx={{
                  color: isListening ? '#EF4444' : '#16A34A',
                  bgcolor: isListening ? 'rgba(239, 68, 68, 0.1)' : 'rgba(22, 163, 74, 0.1)',
                  '&:hover': { bgcolor: isListening ? 'rgba(239, 68, 68, 0.2)' : 'rgba(22, 163, 74, 0.2)' },
                  animation: isListening ? 'pulse 1.5s ease-in-out infinite' : 'none'
                }}
              >
                {isListening ? <MicOff /> : isTranscribing ? <CircularProgress size={20} /> : <Mic />}
              </IconButton>
            </Tooltip>

            {/* File upload */}
            <Tooltip title="Attach file">
              <IconButton
                onClick={() => fileInputRef.current?.click()}
                sx={{ color: '#64748B' }}
              >
                <AttachFile />
              </IconButton>
            </Tooltip>
            <input
              ref={fileInputRef}
              type="file"
              multiple
              hidden
              onChange={handleFileUpload}
            />

            {/* Image upload */}
            <Tooltip title="Attach image">
              <IconButton
                onClick={() => imageInputRef.current?.click()}
                sx={{ color: '#64748B' }}
              >
                <ImageIcon />
              </IconButton>
            </Tooltip>
            <input
              ref={imageInputRef}
              type="file"
              multiple
              accept="image/*"
              hidden
              onChange={handleImageUpload}
            />
          </Box>

          {/* Send button */}
          <Button
            variant="contained"
            endIcon={<Send />}
            onClick={handleSubmit}
            disabled={(!prompt.trim() && attachedFiles.length === 0 && attachedImages.length === 0) ||
                     reasoning.status === 'submitting'}
            sx={{
              bgcolor: '#16A34A',
              '&:hover': { bgcolor: '#15803D' },
              textTransform: 'none',
              fontWeight: 600
            }}
          >
            {reasoning.status === 'submitting' ? 'Sending...' : 'Send'}
          </Button>
        </Box>
      </Box>

      {/* Context menu */}
      <Menu
        open={contextMenu !== null}
        onClose={handleCloseContextMenu}
        anchorReference="anchorPosition"
        anchorPosition={
          contextMenu !== null
            ? { top: contextMenu.mouseY, left: contextMenu.mouseX }
            : undefined
        }
      >
        <MenuItem onClick={handleCopyMessage}>
          <ListItemIcon>
            <ContentCopy fontSize="small" />
          </ListItemIcon>
          <ListItemText>Copy</ListItemText>
        </MenuItem>
        <MenuItem onClick={handleDeleteMessage}>
          <ListItemIcon>
            <Delete fontSize="small" />
          </ListItemIcon>
          <ListItemText>Delete</ListItemText>
        </MenuItem>
      </Menu>

      {/* Pulse animation */}
      <style>{`
        @keyframes pulse {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.5; }
        }
      `}</style>
    </Paper>
  );
};

export default LivHanaChatPanel;
