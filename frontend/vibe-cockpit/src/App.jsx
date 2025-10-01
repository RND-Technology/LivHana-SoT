import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import { Box, Container } from '@mui/material';

// Import Components
import Header from './components/Header';
import Sidebar from './components/Sidebar';
import Dashboard from './components/Dashboard';
import VoiceMode from './components/VoiceMode';
import VideoMode from './components/VideoMode';
import VibeCoding from './components/VibeCoding';
import AgentSwarm from './components/AgentSwarm';
import EmpireSystems from './components/EmpireSystems';
import PilotTraining from './components/PilotTraining';
import Settings from './components/Settings';
import EmpireDashboard from './components/EmpireDashboard'; // NEW EMPIRE DASHBOARD
import SquareRealProducts from './components/SquareRealProducts'; // REAL SQUARE PRODUCTS
import SquareLiveCockpit from './components/SquareLiveCockpit'; // SQUARE LIVE COCKPIT
import UltimateCockpit from './components/UltimateCockpit'; // 🚀 ULTIMATE CLOUD COCKPIT

// Import Context
import { AppProvider } from './context/AppContext';

// Create Theme
const theme = createTheme({
  palette: {
    mode: 'dark',
    primary: {
      main: '#16A34A',
      light: '#4ADE80',
      dark: '#15803D',
    },
    secondary: {
      main: '#F59E0B',
      light: '#FCD34D',
      dark: '#D97706',
    },
    background: {
      default: '#0F172A',
      paper: '#1E293B',
    },
    text: {
      primary: '#F8FAFC',
      secondary: '#94A3B8',
    },
  },
  typography: {
    fontFamily: '"Inter", "Roboto", "Helvetica", "Arial", sans-serif',
    h1: {
      fontSize: '3rem',
      fontWeight: 800,
      letterSpacing: '-0.02em',
    },
    h2: {
      fontSize: '2.25rem',
      fontWeight: 700,
      letterSpacing: '-0.01em',
    },
    h3: {
      fontSize: '1.875rem',
      fontWeight: 600,
    },
    h4: {
      fontSize: '1.5rem',
      fontWeight: 600,
    },
    h5: {
      fontSize: '1.25rem',
      fontWeight: 500,
    },
    h6: {
      fontSize: '1.125rem',
      fontWeight: 500,
    },
    body1: {
      fontSize: '1rem',
      lineHeight: 1.6,
    },
    body2: {
      fontSize: '0.875rem',
      lineHeight: 1.5,
    },
  },
  shape: {
    borderRadius: 12,
  },
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          borderRadius: 8,
          textTransform: 'none',
          fontWeight: 600,
          fontSize: '0.875rem',
          padding: '8px 16px',
        },
        contained: {
          boxShadow: '0 1px 3px rgba(0, 0, 0, 0.12), 0 1px 2px rgba(0, 0, 0, 0.24)',
          '&:hover': {
            boxShadow: '0 4px 6px rgba(0, 0, 0, 0.12), 0 2px 4px rgba(0, 0, 0, 0.24)',
          },
        },
      },
    },
    MuiCard: {
      styleOverrides: {
        root: {
          borderRadius: 16,
          boxShadow: '0 4px 6px rgba(0, 0, 0, 0.12), 0 2px 4px rgba(0, 0, 0, 0.24)',
          border: '1px solid rgba(148, 163, 184, 0.1)',
        },
      },
    },
    MuiDrawer: {
      styleOverrides: {
        paper: {
          backgroundImage: 'none',
          borderRight: '1px solid rgba(148, 163, 184, 0.1)',
        },
      },
    },
  },
});

function App() {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [currentView, setCurrentView] = useState('dashboard');
  const [voiceModeActive, setVoiceModeActive] = useState(false);
  const [videoModeActive, setVideoModeActive] = useState(false);

  // Handle voice mode toggle
  const toggleVoiceMode = () => {
    setVoiceModeActive(!voiceModeActive);
    setVideoModeActive(false); // Disable video when voice is enabled
  };

  // Handle video mode toggle
  const toggleVideoMode = () => {
    setVideoModeActive(!videoModeActive);
    setVoiceModeActive(false); // Disable voice when video is enabled
  };

  // Render current view
  const renderCurrentView = () => {
    switch (currentView) {
      case 'dashboard':
        return <Dashboard />;
      case 'voice-mode':
        return <VoiceMode />;
      case 'video-mode':
        return <VideoMode />;
      case 'vibe-coding':
        return <VibeCoding />;
      case 'agent-swarm':
        return <AgentSwarm />;
      case 'empire-systems':
        return <EmpireSystems />;
      case 'pilot-training':
        return <PilotTraining />;
      case 'settings':
        return <Settings />;
      default:
        return <Dashboard />;
    }
  };

  return (
    <AppProvider>
      <ThemeProvider theme={theme}>
        <CssBaseline />
        <Router>
          <Box sx={{ display: 'flex', height: '100vh' }}>
            {/* Header */}
            <Header
              sidebarOpen={sidebarOpen}
              setSidebarOpen={setSidebarOpen}
              voiceModeActive={voiceModeActive}
              videoModeActive={videoModeActive}
              toggleVoiceMode={toggleVoiceMode}
              toggleVideoMode={toggleVideoMode}
            />

            {/* Sidebar */}
            <Sidebar
              open={sidebarOpen}
              currentView={currentView}
              setCurrentView={setCurrentView}
            />

            {/* Main Content */}
            <Box
              component="main"
              sx={{
                flexGrow: 1,
                p: 3,
                background: 'linear-gradient(135deg, #0F172A 0%, #1E293B 50%, #0F172A 100%)',
                overflow: 'auto',
                transition: 'margin 0.3s ease',
                marginLeft: sidebarOpen ? 0 : '-240px',
              }}
            >
              <Container maxWidth="xl" sx={{ mt: 2 }}>
                <Routes>
                  <Route path="/" element={<UltimateCockpit />} /> {/* 🚀 ULTIMATE COCKPIT AS DEFAULT */}
                  <Route path="/ultimate" element={<UltimateCockpit />} /> {/* 🚀 DIRECT ACCESS */}
                  <Route path="/dashboard" element={<Dashboard />} />
                  <Route path="/voice" element={<VoiceMode />} />
                  <Route path="/video" element={<VideoMode />} />
                  <Route path="/vibe-coding" element={<VibeCoding />} />
                  <Route path="/agent-swarm" element={<AgentSwarm />} />
                  <Route path="/empire-systems" element={<EmpireSystems />} />
                  <Route path="/empire-dashboard" element={<EmpireDashboard />} /> {/* NEW ROUTE */}
                  <Route path="/products" element={<SquareRealProducts />} /> {/* REAL PRODUCTS */}
                  <Route path="/cockpit" element={<SquareLiveCockpit />} /> {/* LIVE COCKPIT */}
                  <Route path="/pilot-training" element={<PilotTraining />} />
                  <Route path="/settings" element={<Settings />} />
                </Routes>
              </Container>
            </Box>

            {/* Voice Mode Overlay */}
            {voiceModeActive && (
              <VoiceMode
                open={voiceModeActive}
                onClose={() => setVoiceModeActive(false)}
                voiceModeActive={voiceModeActive}
                toggleVoiceMode={toggleVoiceMode}
                agentStatus="ready"
                setAgentStatus={() => {}}
              />
            )}

            {/* Video Mode Overlay */}
            {videoModeActive && (
              <VideoMode
                open={videoModeActive}
                onClose={() => setVideoModeActive(false)}
                videoModeActive={videoModeActive}
                toggleVideoMode={toggleVideoMode}
                agentStatus="ready"
                setAgentStatus={() => {}}
              />
            )}
          </Box>
        </Router>
      </ThemeProvider>
    </AppProvider>
  );
}

export default App;
