import React from 'react';
import ScrollIndicator from './ScrollIndicator';
import ScrollIndicatorErrorBoundary from './ScrollIndicatorErrorBoundary';

/**
 * ScrollIndicator component wrapped with error boundary for graceful failure handling
 */
const ScrollIndicatorWithErrorBoundary: React.FC = () => {
  return (
    <ScrollIndicatorErrorBoundary
      onError={(error, errorInfo) => {
        // Log error to monitoring service in production
        if (process.env.NODE_ENV === 'production') {
          // Example: logErrorToService(error, errorInfo);
          console.error('ScrollIndicator failed:', error);
        }
      }}
    >
      <ScrollIndicator />
    </ScrollIndicatorErrorBoundary>
  );
};

export default ScrollIndicatorWithErrorBoundary;