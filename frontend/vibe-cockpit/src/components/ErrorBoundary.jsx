import React from 'react';
import { Box, Button, Card, CardContent, Typography } from '@mui/material';
import { Error as ErrorIcon, Refresh, Home } from '@mui/icons-material';

/**
 * Error Boundary Component - Catches React rendering errors
 * P0 Critical: Prevents entire app crashes from component errors
 *
 * Features:
 * - Catches errors in child components
 * - Displays user-friendly error UI
 * - Provides recovery options (retry, go home)
 * - Logs errors to monitoring system
 * - Gracefully degrades instead of white screen
 */
class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
      errorInfo: null,
      errorCount: 0,
    };
  }

  static getDerivedStateFromError(error) {
    // Update state so the next render will show the fallback UI
    return { hasError: true };
  }

  componentDidCatch(error, errorInfo) {
    // Log error to monitoring service
    console.error('ErrorBoundary caught an error:', error, errorInfo);

    // Log to external monitoring service (Sentry, LogRocket, etc.)
    if (window.logErrorToService) {
      window.logErrorToService({
        error: error.toString(),
        errorInfo: errorInfo.componentStack,
        timestamp: new Date().toISOString(),
        userAgent: navigator.userAgent,
        url: window.location.href,
      });
    }

    this.setState({
      error,
      errorInfo,
      errorCount: this.state.errorCount + 1,
    });

    // Alert user if error keeps happening
    if (this.state.errorCount >= 3) {
      console.error('CRITICAL: Component error loop detected. Notifying support.');
      // TODO: Send critical alert to support team
    }
  }

  handleReset = () => {
    this.setState({
      hasError: false,
      error: null,
      errorInfo: null,
    });
  };

  handleGoHome = () => {
    window.location.href = '/';
  };

  render() {
    if (this.state.hasError) {
      const { componentName } = this.props;

      return (
        <Box
          sx={{
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            minHeight: '400px',
            p: 3,
          }}
        >
          <Card
            sx={{
              maxWidth: 600,
              background: 'linear-gradient(135deg, #1E293B 0%, #334155 100%)',
              border: '2px solid #EF4444',
              borderRadius: 2,
            }}
          >
            <CardContent sx={{ p: 4 }}>
              <Box display="flex" alignItems="center" mb={3}>
                <ErrorIcon sx={{ fontSize: 48, color: '#EF4444', mr: 2 }} />
                <Box>
                  <Typography variant="h5" fontWeight="bold" color="#EF4444">
                    Something went wrong
                  </Typography>
                  <Typography variant="body2" color="textSecondary">
                    {componentName ? `Error in ${componentName}` : 'Component error detected'}
                  </Typography>
                </Box>
              </Box>

              <Typography variant="body1" color="textPrimary" sx={{ mb: 2 }}>
                We encountered an unexpected error while rendering this component.
                Don't worry, your data is safe.
              </Typography>

              {process.env.NODE_ENV === 'development' && this.state.error && (
                <Box
                  sx={{
                    mt: 2,
                    mb: 2,
                    p: 2,
                    bgcolor: 'rgba(239, 68, 68, 0.1)',
                    borderRadius: 1,
                    border: '1px solid rgba(239, 68, 68, 0.3)',
                  }}
                >
                  <Typography variant="caption" color="#EF4444" sx={{ fontFamily: 'monospace', fontSize: '0.75rem' }}>
                    <strong>Error:</strong> {this.state.error.toString()}
                  </Typography>
                  {this.state.errorInfo && (
                    <Box mt={1}>
                      <Typography variant="caption" color="textSecondary" sx={{ fontFamily: 'monospace', fontSize: '0.7rem' }}>
                        {this.state.errorInfo.componentStack.slice(0, 200)}...
                      </Typography>
                    </Box>
                  )}
                </Box>
              )}

              <Box display="flex" gap={2} mt={3}>
                <Button
                  variant="contained"
                  startIcon={<Refresh />}
                  onClick={this.handleReset}
                  sx={{
                    bgcolor: '#16A34A',
                    '&:hover': { bgcolor: '#15803D' },
                  }}
                >
                  Try Again
                </Button>
                <Button
                  variant="outlined"
                  startIcon={<Home />}
                  onClick={this.handleGoHome}
                  sx={{
                    borderColor: '#94A3B8',
                    color: '#94A3B8',
                    '&:hover': { borderColor: '#F8FAFC', color: '#F8FAFC' },
                  }}
                >
                  Go Home
                </Button>
              </Box>

              <Typography variant="caption" color="textSecondary" sx={{ mt: 3, display: 'block' }}>
                Error ID: {Date.now().toString(36)}
                {this.state.errorCount > 1 && ` • Attempts: ${this.state.errorCount}`}
              </Typography>
            </CardContent>
          </Card>
        </Box>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
