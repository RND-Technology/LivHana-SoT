import React, { useState, useEffect, Suspense, lazy } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import { Box, Container, CircularProgress } from '@mui/material';

// Import Critical Components (loaded immediately)
import Header from './components/Header';
import Sidebar from './components/Sidebar';
import ErrorBoundary from './components/ErrorBoundary';

// Import Context
import { AppProvider } from './context/AppContext';

// Lazy Load Route Components (loaded on demand)
const Dashboard = lazy(() => import('./components/Dashboard'));
const VoiceMode = lazy(() => import('./components/VoiceMode'));
const VideoMode = lazy(() => import('./components/VideoMode'));
const EmpireSystems = lazy(() => import('./components/EmpireSystems'));
const Settings = lazy(() => import('./components/Settings'));
const EmpireDashboard = lazy(() => import('./components/EmpireDashboard'));
const SquareRealProducts = lazy(() => import('./components/SquareRealProducts'));
const SquareLiveCockpit = lazy(() => import('./components/SquareLiveCockpit'));
const UltimateCockpit = lazy(() => import('./components/UltimateCockpit'));
const TexasTakeoverMVP = lazy(() => import('./components/TexasTakeoverMVP'));
const RPMVisioneeringDashboard = lazy(() => import('./components/RPMVisioneeringDashboard'));
const LivHanaChatPanel = lazy(() => import('./components/LivHanaChatPanel'));

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
    <CircularProgress size={60} sx={{ color: '#DC2626' }} />
    <Box sx={{ color: '#94A3B8', fontSize: '0.875rem' }}>Loading component...</Box>
  </Box>
);

// Create Theme - Texas Takeover Colors
const theme = createTheme({
  palette: {
    mode: 'dark',
    primary: {
      main: '#DC2626', // Texas Red
      light: '#EF4444',
      dark: '#B91C1C',
    },
    secondary: {
      main: '#F59E0B', // Texas Gold
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
  const [chatPanelOpen, setChatPanelOpen] = useState(true); // Liv Hana Chat Panel

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

  // Handle chat panel toggle
  const toggleChatPanel = () => {
    setChatPanelOpen(!chatPanelOpen);
  };

  return (
    <ErrorBoundary componentName="App Root">
      <AppProvider>
        <ThemeProvider theme={theme}>
          <CssBaseline />
          <Router
            future={{
              v7_startTransition: true,
              v7_relativeSplatPath: true
            }}
          >
            {/* Header - fixed position */}
            <ErrorBoundary componentName="Header">
              <Header
                sidebarOpen={sidebarOpen}
                setSidebarOpen={setSidebarOpen}
                voiceModeActive={voiceModeActive}
                videoModeActive={videoModeActive}
                chatPanelOpen={chatPanelOpen}
                toggleVoiceMode={toggleVoiceMode}
                toggleVideoMode={toggleVideoMode}
                toggleChatPanel={toggleChatPanel}
              />
            </ErrorBoundary>

            {/* Content area - flex container below header */}
            <Box sx={{ display: 'flex', marginTop: '64px', height: 'calc(100vh - 64px)' }}>
              {/* Sidebar */}
              <ErrorBoundary componentName="Sidebar">
                <Sidebar
                  open={sidebarOpen}
                />
              </ErrorBoundary>

              {/* Main Content */}
              <Box
                component="main"
                sx={{
                  flexGrow: 1,
                  p: 3,
                  background: 'linear-gradient(135deg, #0F172A 0%, #1E293B 50%, #0F172A 100%)',
                  overflow: 'auto',
                  transition: 'margin 0.3s ease',
                  marginLeft: sidebarOpen ? 0 : '-280px',
                  width: sidebarOpen ? 'calc(100% - 280px)' : '100%',
                }}
              >
                <Container maxWidth="xl">
                  <ErrorBoundary componentName="Routes">
                    <Suspense fallback={<LoadingFallback />}>
                      <Routes>
                        <Route path="/" element={<ErrorBoundary componentName="TexasTakeoverMVP"><TexasTakeoverMVP /></ErrorBoundary>} />
                        <Route path="/texas-takeover" element={<ErrorBoundary componentName="TexasTakeoverMVP"><TexasTakeoverMVP /></ErrorBoundary>} />
                        <Route path="/ultimate" element={<ErrorBoundary componentName="UltimateCockpit"><UltimateCockpit /></ErrorBoundary>} />
                        <Route path="/dashboard" element={<ErrorBoundary componentName="Dashboard"><Dashboard /></ErrorBoundary>} />
                        <Route path="/voice" element={<ErrorBoundary componentName="VoiceMode"><VoiceMode /></ErrorBoundary>} />
                        <Route path="/video" element={<ErrorBoundary componentName="VideoMode"><VideoMode /></ErrorBoundary>} />
                        <Route path="/empire-systems" element={<ErrorBoundary componentName="EmpireSystems"><EmpireSystems /></ErrorBoundary>} />
                        <Route path="/empire-dashboard" element={<ErrorBoundary componentName="EmpireDashboard"><EmpireDashboard /></ErrorBoundary>} />
                        <Route path="/rpm-visioneering" element={<ErrorBoundary componentName="RPMVisioneeringDashboard"><RPMVisioneeringDashboard /></ErrorBoundary>} />
                        <Route path="/products" element={<ErrorBoundary componentName="SquareRealProducts"><SquareRealProducts /></ErrorBoundary>} />
                        <Route path="/cockpit" element={<ErrorBoundary componentName="SquareLiveCockpit"><SquareLiveCockpit /></ErrorBoundary>} />
                        <Route path="/settings" element={<ErrorBoundary componentName="Settings"><Settings /></ErrorBoundary>} />
                      </Routes>
                    </Suspense>
                  </ErrorBoundary>
                </Container>
              </Box>

              {/* Voice Mode Overlay */}
              {voiceModeActive && (
                <ErrorBoundary componentName="VoiceMode Overlay">
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
                </ErrorBoundary>
              )}

              {/* Video Mode Overlay */}
              {videoModeActive && (
                <ErrorBoundary componentName="VideoMode Overlay">
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
                </ErrorBoundary>
              )}

              {/* Liv Hana Chat Panel - Always accessible */}
              <ErrorBoundary componentName="LivHanaChatPanel">
                <Suspense fallback={null}>
                  <LivHanaChatPanel
                    open={chatPanelOpen}
                    onClose={() => setChatPanelOpen(false)}
                  />
                </Suspense>
              </ErrorBoundary>
            </Box>
          </Router>
        </ThemeProvider>
      </AppProvider>
    </ErrorBoundary>
  );
}

export default App;

// Optimized: 2025-10-02
