import React, { createContext, useContext, useReducer } from 'react';

const AppContext = createContext();

const initialState = {
  user: {
    name: 'Jesse Niesen',
    role: 'CEO',
    company: 'LivHana Sovereign AI',
  },
  empire: {
    agentsActive: 1072,
    systemsDeployed: 24,
    complianceStatus: 'DSHS #690 Compliant',
    missionStatus: 'E2E Complete',
  },
  settings: {
    theme: 'dark',
    voiceMode: false,
    videoMode: false,
    notifications: true,
  },
  realTime: {
    systemHealth: 100,
    agentCoordination: 99.9,
    responseTime: 45,
    uptime: '99.99%',
  },
};

function appReducer(state, action) {
  switch (action.type) {
    case 'SET_THEME':
      return { ...state, settings: { ...state.settings, theme: action.payload } };
    case 'TOGGLE_VOICE_MODE':
      return { ...state, settings: { ...state.settings, voiceMode: !state.settings.voiceMode } };
    case 'TOGGLE_VIDEO_MODE':
      return { ...state, settings: { ...state.settings, videoMode: !state.settings.videoMode } };
    case 'UPDATE_METRICS':
      return { ...state, realTime: { ...state.realTime, ...action.payload } };
    case 'SET_USER':
      return { ...state, user: { ...state.user, ...action.payload } };
    default:
      return state;
  }
}

export function AppProvider({ children }) {
  const [state, dispatch] = useReducer(appReducer, initialState);

  return (
    <AppContext.Provider value={{ state, dispatch }}>
      {children}
    </AppContext.Provider>
  );
}

export function useApp() {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
}
