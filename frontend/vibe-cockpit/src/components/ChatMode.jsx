/**
 * 💬 CHAT MODE - Texas Takeover Chat Interface
 * 
 * Features:
 * - Real-time chat with AI
 * - Reasoning gateway integration
 * - Voice synthesis responses
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
  TextField,
  List,
  ListItem,
  ListItemText,
  Avatar,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Switch,
  FormControlLabel
} from '@mui/material';
import {
  Send,
  Mic,
  MicOff,
  VolumeUp,
  VolumeOff,
  Settings,
  Refresh,
  Chat,
  Person,
  SmartToy,
  AttachFile,
  EmojiEmotions
} from '@mui/icons-material';
import { motion, AnimatePresence } from 'framer-motion';

const ChatMode = () => {
  const [messages, setMessages] = useState([]);
  const [inputMessage, setInputMessage] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [status, setStatus] = useState('ready');
  const [error, setError] = useState(null);
  const [voiceEnabled, setVoiceEnabled] = useState(true);
  const [autoSpeak, setAutoSpeak] = useState(true);

  const messagesEndRef = useRef(null);
  const recognitionRef = useRef(null);
  const synthRef = useRef(null);

  // Initialize chat
  useEffect(() => {
    // Add welcome message
    setMessages([{
      id: 1,
      text: "Howdy partner! I'm your Texas Takeover AI assistant. I can help you with COA checking, compliance questions, analytics, and more. What can I do for you today?",
      sender: 'ai',
      timestamp: new Date().toISOString()
    }]);

    // Initialize voice recognition
    if ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) {
      const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
      recognitionRef.current = new SpeechRecognition();
      
      recognitionRef.current.continuous = false;
      recognitionRef.current.interimResults = false;
      recognitionRef.current.lang = 'en-US';

      recognitionRef.current.onresult = (event) => {
        const transcript = event.results[0][0].transcript;
        setInputMessage(transcript);
        setIsListening(false);
        setStatus('ready');
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
    }

    // Initialize speech synthesis
    if ('speechSynthesis' in window) {
      synthRef.current = window.speechSynthesis;
    }

    return () => {
      if (recognitionRef.current) {
        recognitionRef.current.stop();
      }
    };
  }, []);

  // Scroll to bottom when new messages arrive
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const sendMessage = async () => {
    if (!inputMessage.trim()) return;

    const userMessage = {
      id: Date.now(),
      text: inputMessage,
      sender: 'user',
      timestamp: new Date().toISOString()
    };

    setMessages(prev => [...prev, userMessage]);
    setInputMessage('');
    setIsTyping(true);
    setStatus('processing');

    try {
      // Simulate AI response
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      const aiResponse = generateAIResponse(inputMessage);
      
      const aiMessage = {
        id: Date.now() + 1,
        text: aiResponse,
        sender: 'ai',
        timestamp: new Date().toISOString()
      };

      setMessages(prev => [...prev, aiMessage]);
      setIsTyping(false);
      setStatus('ready');

      // Speak the response if voice is enabled
      if (voiceEnabled && autoSpeak) {
        speak(aiResponse);
      }

    } catch (err) {
      setError(`Chat error: ${err.message}`);
      setIsTyping(false);
      setStatus('error');
    }
  };

  const generateAIResponse = (userInput) => {
    const input = userInput.toLowerCase();
    
    if (input.includes('coa') || input.includes('certificate')) {
      return "I can help you with COA checking! Let me open the COA checker for you. You can scan documents, upload files, or check compliance status.";
    } else if (input.includes('compliance') || input.includes('legal')) {
      return "Compliance is crucial for Texas cannabis operations. I'll open the compliance checker where you can verify age requirements, THC limits, and regulatory compliance.";
    } else if (input.includes('analytics') || input.includes('revenue') || input.includes('sales')) {
      return "Let me show you the analytics dashboard with real-time revenue data, customer metrics, and performance insights for your Texas operations.";
    } else if (input.includes('help') || input.includes('what can you do')) {
      return "I can help you with:\n• COA checking and validation\n• Compliance verification\n• Analytics and reporting\n• Voice and video commands\n• General Texas cannabis questions\n\nJust ask me anything!";
    } else if (input.includes('texas') || input.includes('lone star')) {
      return "Everything's bigger in Texas, including our cannabis operations! We're leading the way with compliant, safe, and profitable cannabis business practices.";
    } else if (input.includes('voice') || input.includes('speak')) {
      return "Voice mode is active! You can speak to me using the microphone button, and I'll respond with voice synthesis. Try saying 'scan COA' or 'check compliance'.";
    } else if (input.includes('video') || input.includes('camera')) {
      return "Video mode lets you use your camera to scan COA documents, capture photos, and record videos for compliance documentation.";
    } else {
      return "I understand you're asking about: " + userInput + ". Let me help you with that. You can ask me about COA checking, compliance, analytics, or any Texas cannabis operations questions.";
    }
  };

  const speak = (text) => {
    if (synthRef.current && voiceEnabled) {
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.volume = 0.8;
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

  const startListening = () => {
    if (recognitionRef.current && !isListening) {
      recognitionRef.current.start();
      setIsListening(true);
      setStatus('listening');
    }
  };

  const stopListening = () => {
    if (recognitionRef.current && isListening) {
      recognitionRef.current.stop();
    }
  };

  const handleKeyPress = (event) => {
    if (event.key === 'Enter' && !event.shiftKey) {
      event.preventDefault();
      sendMessage();
    }
  };

  const getStatusColor = () => {
    switch (status) {
      case 'listening': return '#16A34A';
      case 'speaking': return '#3B82F6';
      case 'processing': return '#F59E0B';
      case 'error': return '#DC2626';
      default: return '#64748B';
    }
  };

  const getStatusText = () => {
    switch (status) {
      case 'listening': return 'Listening...';
      case 'speaking': return 'Speaking...';
      case 'processing': return 'Processing...';
      case 'error': return 'Error';
      default: return 'Ready';
    }
  };

  return (
    <Box sx={{ p: 3, height: '100vh', display: 'flex', flexDirection: 'column' }}>
      {/* Header */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Box>
          <Typography variant="h4" sx={{ color: '#DC2626', fontWeight: 'bold' }}>
            💬 Chat Mode
          </Typography>
          <Typography variant="body1" sx={{ color: '#64748B' }}>
            Texas Takeover AI Assistant - Chat with your Lone Star AI
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

      {/* Chat Messages */}
      <Card sx={{ flex: 1, mb: 3, overflow: 'hidden' }}>
        <CardContent sx={{ height: '100%', p: 0 }}>
          <List sx={{ height: '100%', overflow: 'auto', p: 2 }}>
            <AnimatePresence>
              {messages.map((message) => (
                <motion.div
                  key={message.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                >
                  <ListItem sx={{ 
                    justifyContent: message.sender === 'user' ? 'flex-end' : 'flex-start',
                    alignItems: 'flex-start',
                    mb: 2
                  }}>
                    <Box sx={{ 
                      maxWidth: '70%',
                      display: 'flex',
                      flexDirection: message.sender === 'user' ? 'row-reverse' : 'row',
                      alignItems: 'flex-start',
                      gap: 1
                    }}>
                      <Avatar sx={{ 
                        bgcolor: message.sender === 'user' ? '#DC2626' : '#3B82F6',
                        width: 32,
                        height: 32
                      }}>
                        {message.sender === 'user' ? <Person /> : <SmartToy />}
                      </Avatar>
                      
                      <Paper sx={{ 
                        p: 2,
                        bgcolor: message.sender === 'user' ? '#DC2626' : '#F8FAFC',
                        color: message.sender === 'user' ? 'white' : '#1E293B',
                        borderRadius: 2
                      }}>
                        <Typography variant="body1" sx={{ whiteSpace: 'pre-wrap' }}>
                          {message.text}
                        </Typography>
                        <Typography variant="caption" sx={{ 
                          color: message.sender === 'user' ? 'rgba(255,255,255,0.7)' : '#64748B',
                          mt: 1,
                          display: 'block'
                        }}>
                          {new Date(message.timestamp).toLocaleTimeString()}
                        </Typography>
                      </Paper>
                    </Box>
                  </ListItem>
                </motion.div>
              ))}
            </AnimatePresence>
            
            {isTyping && (
              <ListItem>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <Avatar sx={{ bgcolor: '#3B82F6', width: 32, height: 32 }}>
                    <SmartToy />
                  </Avatar>
                  <Paper sx={{ p: 2, bgcolor: '#F8FAFC' }}>
                    <Typography variant="body2" sx={{ color: '#64748B' }}>
                      AI is typing...
                    </Typography>
                    <LinearProgress sx={{ mt: 1 }} />
                  </Paper>
                </Box>
              </ListItem>
            )}
            
            <div ref={messagesEndRef} />
          </List>
        </CardContent>
      </Card>

      {/* Input Area */}
      <Card>
        <CardContent>
          <Box sx={{ display: 'flex', gap: 1, alignItems: 'flex-end' }}>
            <TextField
              fullWidth
              multiline
              maxRows={4}
              value={inputMessage}
              onChange={(e) => setInputMessage(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="Ask me anything about COA checking, compliance, analytics, or Texas cannabis operations..."
              variant="outlined"
              size="small"
            />
            
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
              <IconButton
                onClick={isListening ? stopListening : startListening}
                sx={{ 
                  bgcolor: isListening ? '#DC2626' : '#64748B',
                  color: 'white',
                  '&:hover': { bgcolor: isListening ? '#B91C1C' : '#475569' }
                }}
              >
                {isListening ? <MicOff /> : <Mic />}
              </IconButton>
              
              <IconButton
                onClick={sendMessage}
                disabled={!inputMessage.trim() || isTyping}
                sx={{ 
                  bgcolor: '#16A34A',
                  color: 'white',
                  '&:hover': { bgcolor: '#15803D' },
                  '&:disabled': { bgcolor: '#E5E7EB', color: '#9CA3AF' }
                }}
              >
                <Send />
              </IconButton>
            </Box>
          </Box>
          
          {/* Quick Actions */}
          <Box sx={{ mt: 2, display: 'flex', gap: 1, flexWrap: 'wrap' }}>
            <Button
              size="small"
              variant="outlined"
              onClick={() => setInputMessage('Help me scan a COA')}
              disabled={isTyping}
            >
              Scan COA
            </Button>
            <Button
              size="small"
              variant="outlined"
              onClick={() => setInputMessage('Check compliance status')}
              disabled={isTyping}
            >
              Check Compliance
            </Button>
            <Button
              size="small"
              variant="outlined"
              onClick={() => setInputMessage('Show me analytics')}
              disabled={isTyping}
            >
              Show Analytics
            </Button>
            <Button
              size="small"
              variant="outlined"
              onClick={() => setInputMessage('What can you do?')}
              disabled={isTyping}
            >
              Help
            </Button>
          </Box>
        </CardContent>
      </Card>

      {/* Settings Dialog */}
      <Dialog open={settingsOpen} onClose={() => setSettingsOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Chat Settings</DialogTitle>
        <DialogContent>
          <Box sx={{ pt: 2 }}>
            <FormControlLabel
              control={
                <Switch
                  checked={voiceEnabled}
                  onChange={(e) => setVoiceEnabled(e.target.checked)}
                />
              }
              label="Enable Voice Responses"
            />
            
            <FormControlLabel
              control={
                <Switch
                  checked={autoSpeak}
                  onChange={(e) => setAutoSpeak(e.target.checked)}
                  disabled={!voiceEnabled}
                />
              }
              label="Auto-speak AI Responses"
            />
            
            <Typography variant="body2" sx={{ color: '#64748B', mt: 2 }}>
              Voice features allow the AI to speak responses aloud. You can also use voice input by clicking the microphone button.
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

export default ChatMode;
