import React, { useState, useEffect, Suspense, lazy } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import { Box, Container, CircularProgress } from '@mui/material';

// Import Critical Components (loaded immediately)
import Header from './components/Header';
import Sidebar from './components/Sidebar';

// Import Context
import { AppProvider } from './context/AppContext';

// Lazy Load Route Components (loaded on demand)
const Dashboard = lazy(() => import('./components/Dashboard'));
const VoiceMode = lazy(() => import('./components/VoiceMode'));
const VideoMode = lazy(() => import('./components/VideoMode'));
const VibeCoding = lazy(() => import('./components/VibeCoding'));
const AgentSwarm = lazy(() => import('./components/AgentSwarm'));
const EmpireSystems = lazy(() => import('./components/EmpireSystems'));
const PilotTraining = lazy(() => import('./components/PilotTraining'));
const Settings = lazy(() => import('./components/Settings'));
const EmpireDashboard = lazy(() => import('./components/EmpireDashboard'));
const SquareRealProducts = lazy(() => import('./components/SquareRealProducts'));
const SquareLiveCockpit = lazy(() => import('./components/SquareLiveCockpit'));
const UltimateCockpit = lazy(() => import('./components/UltimateCockpit'));

// Loading Component
const LoadingFallback = () => (
  <Box
    sx={{
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
      minHeight: '60vh',
      flexDirection: 'column',
      gap: 2,
    }}
  >
    <CircularProgress size={60} sx={{ color: '#16A34A' }} />
    <Box sx={{ color: '#94A3B8', fontSize: '0.875rem' }}>Loading component...</Box>
  </Box>
);

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

  return (
    <AppProvider>
      <ThemeProvider theme={theme}>
        <CssBaseline />
        <Router
          future={{
            v7_startTransition: true,
            v7_relativeSplatPath: true
          }}
        >
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
            />

            {/* Main Content */}
            <Box
              component="main"
              sx={{
                flexGrow: 1,
                p: 3,
                pt: '80px', // Account for fixed header height
                background: 'linear-gradient(135deg, #0F172A 0%, #1E293B 50%, #0F172A 100%)',
                overflow: 'auto',
                transition: 'margin 0.3s ease',
                marginLeft: sidebarOpen ? 0 : '-240px',
                minHeight: '100vh',
              }}
            >
              <Container maxWidth="xl" sx={{ mt: 2 }}>
                <Suspense fallback={<LoadingFallback />}>
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
                </Suspense>
              </Container>
            </Box>

            {/* Voice Mode Overlay */}
            {voiceModeActive && (
              <Suspense fallback={null}>
                <VoiceMode
                  open={voiceModeActive}
                  onClose={() => setVoiceModeActive(false)}
                  voiceModeActive={voiceModeActive}
                  toggleVoiceMode={toggleVoiceMode}
                  agentStatus="ready"
                  setAgentStatus={() => {}}
                />
              </Suspense>
            )}

            {/* Video Mode Overlay */}
            {videoModeActive && (
              <Suspense fallback={null}>
                <VideoMode
                  open={videoModeActive}
                  onClose={() => setVideoModeActive(false)}
                  videoModeActive={videoModeActive}
                  toggleVideoMode={toggleVideoMode}
                  agentStatus="ready"
                  setAgentStatus={() => {}}
                />
              </Suspense>
            )}
          </Box>
        </Router>
      </ThemeProvider>
    </AppProvider>
  );
}

export default App;
