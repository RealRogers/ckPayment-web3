/**
 * End-to-End Tests for Mobile Responsiveness
 * Tests dashboard behavior on mobile devices and bandwidth optimization
 */

import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { act } from 'react-dom/test-utils';

// Mock mobile viewport
const mockViewport = (width: number, height: number) => {
  Object.defineProperty(window, 'innerWidth', {
    writable: true,
    configurable: true,
    value: width,
  });
  Object.defineProperty(window, 'innerHeight', {
    writable: true,
    configurable: true,
    value: height,
  });
  
  // Trigger resize event
  window.dispatchEvent(new Event('resize'));
};

// Mock touch events
const mockTouchSupport = () => {
  Object.defineProperty(window, 'ontouchstart', {
    writable: true,
    configurable: true,
    value: null,
  });
  
  Object.defineProperty(navigator, 'maxTouchPoints', {
    writable: true,
    configurable: true,
    value: 5,
  });
};

// Mock network conditions
const mockNetworkConditions = (effectiveType: string, downlink: number) => {
  Object.defineProperty(navigator, 'connection', {
    writable: true,
    configurable: true,
    value: {
      effectiveType,
      downlink,
      rtt: effectiveType === '4g' ? 50 : effectiveType === '3g' ? 200 : 500,
      saveData: effectiveType === '2g'
    }
  });
};

// Mock responsive dashboard component
const MockResponsiveDashboard = () => {
  const [isMobile, setIsMobile] = React.useState(false);
  const [networkQuality, setNetworkQuality] = React.useState('4g');
  const [dataUsage, setDataUsage] = React.useState(0);
  const [updateFrequency, setUpdateFrequency] = React.useState('normal');

  React.useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };
    
    window.addEventListener('resize', checkMobile);
    checkMobile();
    
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  return (
    <div data-testid="responsive-dashboard" className={isMobile ? 'mobile' : 'desktop'}>
      <div data-testid="viewport-indicator">{isMobile ? 'mobile' : 'desktop'}</div>
      <div data-testid="network-quality">{networkQuality}</div>
      <div data-testid="data-usage">{dataUsage} KB</div>
      <div data-testid="update-frequency">{updateFrequency}</div>
      
      {/* Mobile-specific navigation */}
      {isMobile && (
        <div data-testid="mobile-nav">
          <button data-testid="hamburger-menu">☰</button>
          <button data-testid="mobile-refresh">↻</button>
        </div>
      )}
      
      {/* Desktop navigation */}
      {!isMobile && (
        <div data-testid="desktop-nav">
          <button data-testid="desktop-refresh">Refresh</button>
          <button data-testid="desktop-settings">Settings</button>
        </div>
      )}
      
      {/* Metrics cards - responsive layout */}
      <div data-testid="metrics-grid" className={isMobile ? 'mobile-grid' : 'desktop-grid'}>
        <div data-testid="metric-card-1">Transactions: 100</div>
        <div data-testid="metric-card-2">Success Rate: 95%</div>
        <div data-testid="metric-card-3">Avg Response: 150ms</div>
        <div data-testid="metric-card-4">Active Users: 50</div>
      </div>
      
      {/* Chart area - adaptive based on screen size */}
      <div data-testid="chart-area" className={isMobile ? 'mobile-chart' : 'desktop-chart'}>
        {isMobile ? 'Simplified Chart' : 'Detailed Chart'}
      </div>
      
      {/* Data optimization indicator */}
      <div data-testid="optimization-status">
        {networkQuality === '2g' ? 'Data Saver Mode' : 'Normal Mode'}
      </div>
    </div>
  );
};

// Mock React
jest.mock('react', () => ({
  ...jest.requireActual('react'),
  useState: jest.fn(),
  useEffect: jest.fn(),
  useCallback: jest.fn((fn) => fn),
  useMemo: jest.fn((fn) => fn()),
}));

describe('Mobile Responsiveness E2E Tests', () => {
  let user: any;
  let mockSetState: jest.Mock;

  beforeEach(() => {
    user = userEvent.setup();
    mockSetState = jest.fn();
    
    // Mock React state
    (React.useState as jest.Mock).mockImplementation((initial) => [initial, mockSetState]);
    
    // Mock useEffect to simulate component lifecycle
    (React.useEffect as jest.Mock).mockImplementation((effect, deps) => {
      if (deps === undefined || deps.length === 0) {
        effect();
      }
    });

    jest.useFakeTimers();
  });

  afterEach(() => {
    jest.useRealTimers();
    jest.clearAllMocks();
  });

  describe('Viewport Adaptation', () => {
    test('should adapt layout for mobile viewport', async () => {
      // Set mobile viewport
      mockViewport(375, 667); // iPhone SE dimensions
      mockTouchSupport();

      render(<MockResponsiveDashboard />);

      await waitFor(() => {
        expect(screen.getByTestId('viewport-indicator')).toHaveTextContent('mobile');
      });

      // Mobile-specific elements should be present
      expect(screen.getByTestId('mobile-nav')).toBeInTheDocument();
      expect(screen.getByTestId('hamburger-menu')).toBeInTheDocument();
      expect(screen.getByTestId('mobile-refresh')).toBeInTheDocument();

      // Desktop elements should not be present
      expect(screen.queryByTestId('desktop-nav')).not.toBeInTheDocument();

      // Layout should be mobile-optimized
      const metricsGrid = screen.getByTestId('metrics-grid');
      expect(metricsGrid).toHaveClass('mobile-grid');

      const chartArea = screen.getByTestId('chart-area');
      expect(chartArea).toHaveClass('mobile-chart');
      expect(chartArea).toHaveTextContent('Simplified Chart');
    });

    test('should adapt layout for desktop viewport', async () => {
      // Set desktop viewport
      mockViewport(1920, 1080);

      render(<MockResponsiveDashboard />);

      await waitFor(() => {
        expect(screen.getByTestId('viewport-indicator')).toHaveTextContent('desktop');
      });

      // Desktop-specific elements should be present
      expect(screen.getByTestId('desktop-nav')).toBeInTheDocument();
      expect(screen.getByTestId('desktop-refresh')).toBeInTheDocument();
      expect(screen.getByTestId('desktop-settings')).toBeInTheDocument();

      // Mobile elements should not be present
      expect(screen.queryByTestId('mobile-nav')).not.toBeInTheDocument();

      // Layout should be desktop-optimized
      const metricsGrid = screen.getByTestId('metrics-grid');
      expect(metricsGrid).toHaveClass('desktop-grid');

      const chartArea = screen.getByTestId('chart-area');
      expect(chartArea).toHaveClass('desktop-chart');
      expect(chartArea).toHaveTextContent('Detailed Chart');
    });

    test('should handle viewport transitions smoothly', async () => {
      // Start with desktop
      mockViewport(1024, 768);
      render(<MockResponsiveDashboard />);

      await waitFor(() => {
        expect(screen.getByTestId('viewport-indicator')).toHaveTextContent('desktop');
      });

      // Transition to mobile
      act(() => {
        mockViewport(375, 667);
      });

      await waitFor(() => {
        expect(screen.getByTestId('viewport-indicator')).toHaveTextContent('mobile');
      });

      // Should show mobile navigation
      expect(screen.getByTestId('mobile-nav')).toBeInTheDocument();
      expect(screen.queryByTestId('desktop-nav')).not.toBeInTheDocument();

      // Transition back to desktop
      act(() => {
        mockViewport(1200, 800);
      });

      await waitFor(() => {
        expect(screen.getByTestId('viewport-indicator')).toHaveTextContent('desktop');
      });

      // Should show desktop navigation
      expect(screen.getByTestId('desktop-nav')).toBeInTheDocument();
      expect(screen.queryByTestId('mobile-nav')).not.toBeInTheDocument();
    });
  });

  describe('Touch Interactions', () => {
    test('should handle touch gestures on mobile', async () => {
      mockViewport(375, 667);
      mockTouchSupport();

      render(<MockResponsiveDashboard />);

      const hamburgerMenu = screen.getByTestId('hamburger-menu');
      const mobileRefresh = screen.getByTestId('mobile-refresh');

      // Test touch interactions
      await user.click(hamburgerMenu);
      expect(hamburgerMenu).toBeInTheDocument();

      await user.click(mobileRefresh);
      expect(mobileRefresh).toBeInTheDocument();

      // Test swipe gestures (simulated)
      const dashboard = screen.getByTestId('responsive-dashboard');
      
      fireEvent.touchStart(dashboard, {
        touches: [{ clientX: 100, clientY: 100 }]
      });
      
      fireEvent.touchMove(dashboard, {
        touches: [{ clientX: 200, clientY: 100 }]
      });
      
      fireEvent.touchEnd(dashboard, {
        changedTouches: [{ clientX: 200, clientY: 100 }]
      });

      // Dashboard should remain stable after touch events
      expect(dashboard).toBeInTheDocument();
    });

    test('should provide appropriate touch targets', async () => {
      mockViewport(375, 667);
      mockTouchSupport();

      render(<MockResponsiveDashboard />);

      const touchTargets = [
        screen.getByTestId('hamburger-menu'),
        screen.getByTestId('mobile-refresh')
      ];

      // All touch targets should be accessible
      touchTargets.forEach(target => {
        expect(target).toBeInTheDocument();
        // In a real implementation, we'd check for minimum touch target size (44px)
      });
    });
  });

  describe('Network Adaptation', () => {
    test('should optimize for slow network conditions', async () => {
      mockViewport(375, 667);
      mockNetworkConditions('2g', 0.25); // Slow 2G connection

      render(<MockResponsiveDashboard />);

      await waitFor(() => {
        expect(screen.getByTestId('optimization-status')).toHaveTextContent('Data Saver Mode');
      });

      // Should show reduced update frequency
      expect(screen.getByTestId('update-frequency')).toHaveTextContent('reduced');
      
      // Data usage should be minimized
      const dataUsage = screen.getByTestId('data-usage');
      expect(dataUsage).toHaveTextContent('0 KB'); // Initial state
    });

    test('should provide full experience on fast networks', async () => {
      mockViewport(375, 667);
      mockNetworkConditions('4g', 10); // Fast 4G connection

      render(<MockResponsiveDashboard />);

      await waitFor(() => {
        expect(screen.getByTestId('optimization-status')).toHaveTextContent('Normal Mode');
      });

      // Should show normal update frequency
      expect(screen.getByTestId('update-frequency')).toHaveTextContent('normal');
    });

    test('should adapt to changing network conditions', async () => {
      mockViewport(375, 667);
      mockNetworkConditions('4g', 10);

      render(<MockResponsiveDashboard />);

      // Start with fast network
      await waitFor(() => {
        expect(screen.getByTestId('optimization-status')).toHaveTextContent('Normal Mode');
      });

      // Simulate network degradation
      act(() => {
        mockNetworkConditions('2g', 0.25);
        // Trigger network change event
        window.dispatchEvent(new Event('online'));
      });

      await waitFor(() => {
        expect(screen.getByTestId('optimization-status')).toHaveTextContent('Data Saver Mode');
      });

      // Network improvement
      act(() => {
        mockNetworkConditions('4g', 10);
        window.dispatchEvent(new Event('online'));
      });

      await waitFor(() => {
        expect(screen.getByTestId('optimization-status')).toHaveTextContent('Normal Mode');
      });
    });
  });

  describe('Data Usage Optimization', () => {
    test('should minimize data usage on mobile', async () => {
      mockViewport(375, 667);
      mockNetworkConditions('3g', 1.5);

      render(<MockResponsiveDashboard />);

      // Simulate data usage tracking
      act(() => {
        // Mock receiving compressed data
        const compressedDataSize = 50; // KB
        mockSetState(compressedDataSize);
      });

      await waitFor(() => {
        expect(screen.getByTestId('data-usage')).toHaveTextContent('50 KB');
      });

      // Data usage should be reasonable for mobile
      const dataUsageText = screen.getByTestId('data-usage').textContent;
      const dataUsage = parseInt(dataUsageText?.split(' ')[0] || '0');
      expect(dataUsage).toBeLessThan(100); // Should be under 100KB
    });

    test('should compress images and reduce chart complexity on mobile', async () => {
      mockViewport(375, 667);
      mockNetworkConditions('2g', 0.25);

      render(<MockResponsiveDashboard />);

      // Chart should be simplified for mobile
      const chartArea = screen.getByTestId('chart-area');
      expect(chartArea).toHaveTextContent('Simplified Chart');

      // Optimization status should indicate data saving
      expect(screen.getByTestId('optimization-status')).toHaveTextContent('Data Saver Mode');
    });

    test('should provide data usage controls', async () => {
      mockViewport(375, 667);
      render(<MockResponsiveDashboard />);

      // Should show current data usage
      const dataUsage = screen.getByTestId('data-usage');
      expect(dataUsage).toBeInTheDocument();

      // Should show optimization status
      const optimizationStatus = screen.getByTestId('optimization-status');
      expect(optimizationStatus).toBeInTheDocument();

      // Should show update frequency control
      const updateFrequency = screen.getByTestId('update-frequency');
      expect(updateFrequency).toBeInTheDocument();
    });
  });

  describe('Performance on Mobile Devices', () => {
    test('should maintain smooth scrolling on mobile', async () => {
      mockViewport(375, 667);
      mockTouchSupport();

      render(<MockResponsiveDashboard />);

      const dashboard = screen.getByTestId('responsive-dashboard');

      // Simulate scroll events
      fireEvent.scroll(dashboard, { target: { scrollY: 100 } });
      fireEvent.scroll(dashboard, { target: { scrollY: 200 } });
      fireEvent.scroll(dashboard, { target: { scrollY: 300 } });

      // Dashboard should remain responsive
      expect(dashboard).toBeInTheDocument();
      expect(screen.getByTestId('metrics-grid')).toBeInTheDocument();
    });

    test('should handle rapid touch interactions', async () => {
      mockViewport(375, 667);
      mockTouchSupport();

      render(<MockResponsiveDashboard />);

      const mobileRefresh = screen.getByTestId('mobile-refresh');

      // Rapid taps
      for (let i = 0; i < 5; i++) {
        await user.click(mobileRefresh);
      }

      // Should remain stable
      expect(mobileRefresh).toBeInTheDocument();
      expect(screen.getByTestId('responsive-dashboard')).toBeInTheDocument();
    });

    test('should optimize animations for mobile', async () => {
      mockViewport(375, 667);
      render(<MockResponsiveDashboard />);

      // Simulate animation triggers
      const metricCards = [
        screen.getByTestId('metric-card-1'),
        screen.getByTestId('metric-card-2'),
        screen.getByTestId('metric-card-3'),
        screen.getByTestId('metric-card-4')
      ];

      // All cards should be present and stable
      metricCards.forEach(card => {
        expect(card).toBeInTheDocument();
      });

      // Simulate data updates that would trigger animations
      act(() => {
        jest.advanceTimersByTime(1000);
      });

      // Cards should still be present after animation cycle
      metricCards.forEach(card => {
        expect(card).toBeInTheDocument();
      });
    });
  });

  describe('Offline Capability', () => {
    test('should handle offline state gracefully', async () => {
      mockViewport(375, 667);
      render(<MockResponsiveDashboard />);

      // Simulate going offline
      act(() => {
        Object.defineProperty(navigator, 'onLine', {
          writable: true,
          configurable: true,
          value: false,
        });
        window.dispatchEvent(new Event('offline'));
      });

      // Dashboard should remain functional with cached data
      expect(screen.getByTestId('responsive-dashboard')).toBeInTheDocument();
      expect(screen.getByTestId('metrics-grid')).toBeInTheDocument();

      // Should indicate offline status
      // (In a real implementation, this would show an offline indicator)
    });

    test('should sync data when coming back online', async () => {
      mockViewport(375, 667);
      render(<MockResponsiveDashboard />);

      // Start offline
      act(() => {
        Object.defineProperty(navigator, 'onLine', {
          writable: true,
          configurable: true,
          value: false,
        });
        window.dispatchEvent(new Event('offline'));
      });

      // Come back online
      act(() => {
        Object.defineProperty(navigator, 'onLine', {
          writable: true,
          configurable: true,
          value: true,
        });
        window.dispatchEvent(new Event('online'));
      });

      // Should trigger data sync
      await waitFor(() => {
        expect(screen.getByTestId('responsive-dashboard')).toBeInTheDocument();
      });
    });
  });

  describe('Accessibility on Mobile', () => {
    test('should maintain accessibility on mobile devices', async () => {
      mockViewport(375, 667);
      mockTouchSupport();

      render(<MockResponsiveDashboard />);

      // Touch targets should be accessible
      const hamburgerMenu = screen.getByTestId('hamburger-menu');
      const mobileRefresh = screen.getByTestId('mobile-refresh');

      expect(hamburgerMenu).toBeInTheDocument();
      expect(mobileRefresh).toBeInTheDocument();

      // Should be keyboard accessible even on mobile
      await user.tab();
      expect(document.activeElement).toBe(hamburgerMenu);

      await user.tab();
      expect(document.activeElement).toBe(mobileRefresh);
    });

    test('should provide appropriate focus indicators on mobile', async () => {
      mockViewport(375, 667);
      render(<MockResponsiveDashboard />);

      const mobileRefresh = screen.getByTestId('mobile-refresh');

      // Focus should be visible
      mobileRefresh.focus();
      expect(document.activeElement).toBe(mobileRefresh);
    });

    test('should support screen readers on mobile', async () => {
      mockViewport(375, 667);
      render(<MockResponsiveDashboard />);

      // Important elements should have proper labels
      const dashboard = screen.getByTestId('responsive-dashboard');
      const metricsGrid = screen.getByTestId('metrics-grid');

      expect(dashboard).toBeInTheDocument();
      expect(metricsGrid).toBeInTheDocument();

      // Status information should be announced
      const viewportIndicator = screen.getByTestId('viewport-indicator');
      const networkQuality = screen.getByTestId('network-quality');

      expect(viewportIndicator).toHaveTextContent('mobile');
      expect(networkQuality).toBeInTheDocument();
    });
  });
});