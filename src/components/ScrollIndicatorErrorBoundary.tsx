import React, { Component, ErrorInfo, ReactNode } from 'react';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
  onError?: (error: Error, errorInfo: ErrorInfo) => void;
}

interface State {
  hasError: boolean;
  error?: Error;
}

/**
 * Error boundary specifically for the ScrollIndicator component
 * Provides graceful degradation when scroll detection fails
 */
class ScrollIndicatorErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error): State {
    // Update state so the next render will show the fallback UI
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    // Log the error for debugging
    console.error('ScrollIndicator Error Boundary caught an error:', error, errorInfo);
    
    // Call the optional error handler
    this.props.onError?.(error, errorInfo);
    
    // In development, provide more detailed error information
    if (process.env.NODE_ENV === 'development') {
      console.group('ScrollIndicator Error Details');
      console.error('Error:', error);
      console.error('Component Stack:', errorInfo.componentStack);
      console.error('Error Boundary Stack:', errorInfo.errorBoundary);
      console.groupEnd();
    }
  }

  render() {
    if (this.state.hasError) {
      // Render fallback UI or nothing (graceful degradation)
      if (this.props.fallback) {
        return this.props.fallback;
      }
      
      // In development, show a helpful error message
      if (process.env.NODE_ENV === 'development') {
        return (
          <div 
            className="fixed right-6 top-1/2 transform -translate-y-1/2 z-40 hidden lg:block"
            style={{
              padding: '8px',
              backgroundColor: '#fee2e2',
              border: '1px solid #fecaca',
              borderRadius: '8px',
              fontSize: '12px',
              color: '#dc2626',
              maxWidth: '200px'
            }}
          >
            <div style={{ fontWeight: 'bold', marginBottom: '4px' }}>
              ScrollIndicator Error
            </div>
            <div style={{ fontSize: '11px' }}>
              {this.state.error?.message || 'Unknown error occurred'}
            </div>
          </div>
        );
      }
      
      // In production, fail silently (no scroll indicator)
      return null;
    }

    return this.props.children;
  }
}

export default ScrollIndicatorErrorBoundary;