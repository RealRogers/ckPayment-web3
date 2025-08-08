/**
 * Test Utilities
 * Common utilities and helpers for testing dashboard components
 */

import React from 'react';
import { render, RenderOptions } from '@testing-library/react';
import { jest } from '@jest/globals';

// Mock providers for testing
const MockProviders: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  return (
    <div data-testid="mock-providers">
      {children}
    </div>
  );
};

// Custom render function with providers
const customRender = (
  ui: React.ReactElement,
  options?: Omit<RenderOptions, 'wrapper'>
) => render(ui, { wrapper: MockProviders, ...options });

// Mock data generators
export const generateMockTransaction = (overrides = {}) => ({
  id: 'mock-tx-1',
  hash: 'mock-hash-1',
  from: 'mock-user-1',
  to: 'mock-canister-1',
  amount: 100,
  timestamp: new Date('2024-01-01T10:00:00Z'),
  status: 'completed',
  cycleCost: 1000000,
  subnetId: 'subnet-1',
  canisterId: 'canister-1',
  executionTime: 50,
  memoryUsage: 1024,
  instructionCount: 5000,
  callHierarchy: [],
  ...overrides,
});

export const generateMockMetrics = (overrides = {}) => ({
  timestamp: new Date('2024-01-01T10:00:00Z'),
  totalTransactions: 100,
  successfulTransactions: 95,
  failedTransactions: 5,
  averageResponseTime: 150,
  totalVolume: 10000,
  activeUsers: 50,
  cyclesBurned: 5000000,
  cyclesBalance: 95000000,
  subnetMetrics: {
    'subnet-1': { uptime: 99.9, responseTime: 120, throughput: 1000 },
  },
  canisterHealth: {
    'canister-1': { memoryUsage: 70, cycleBalance: 10000000, status: 'running' },
  },
  ...overrides,
});

// Mock WebSocket for testing
export const createMockWebSocket = () => {
  const mockWs = {
    readyState: WebSocket.CONNECTING,
    addEventListener: jest.fn(),
    removeEventListener: jest.fn(),
    send: jest.fn(),
    close: jest.fn(),
    url: '',
    CONNECTING: 0,
    OPEN: 1,
    CLOSING: 2,
    CLOSED: 3,
  };

  // Helper to simulate connection
  mockWs.simulateOpen = () => {
    mockWs.readyState = WebSocket.OPEN;
    const openHandlers = mockWs.addEventListener.mock.calls
      .filter(call => call[0] === 'open')
      .map(call => call[1]);
    openHandlers.forEach(handler => handler(new Event('open')));
  };

  // Helper to simulate message
  mockWs.simulateMessage = (data: any) => {
    const messageHandlers = mockWs.addEventListener.mock.calls
      .filter(call => call[0] === 'message')
      .map(call => call[1]);
    messageHandlers.forEach(handler => 
      handler(new MessageEvent('message', { data: JSON.stringify(data) }))
    );
  };

  // Helper to simulate error
  mockWs.simulateError = () => {
    mockWs.readyState = WebSocket.CLOSED;
    const errorHandlers = mockWs.addEventListener.mock.calls
      .filter(call => call[0] === 'error')
      .map(call => call[1]);
    errorHandlers.forEach(handler => handler(new Event('error')));
  };

  // Helper to simulate close
  mockWs.simulateClose = (code = 1000, reason = '') => {
    mockWs.readyState = WebSocket.CLOSED;
    const closeHandlers = mockWs.addEventListener.mock.calls
      .filter(call => call[0] === 'close')
      .map(call => call[1]);
    closeHandlers.forEach(handler => 
      handler(new CloseEvent('close', { code, reason }))
    );
  };

  return mockWs;
};

// Mock fetch responses
export const createMockFetchResponse = (data: any, ok = true) => {
  return Promise.resolve({
    ok,
    status: ok ? 200 : 500,
    json: () => Promise.resolve(data),
    text: () => Promise.resolve(JSON.stringify(data)),
  });
};

// Test helpers for async operations
export const waitForNextTick = () => new Promise(resolve => setTimeout(resolve, 0));

export const advanceTimersAndFlush = async (ms: number) => {
  jest.advanceTimersByTime(ms);
  await waitForNextTick();
};

// Mock localStorage
export const createMockLocalStorage = () => {
  const store: { [key: string]: string } = {};
  
  return {
    getItem: jest.fn((key: string) => store[key] || null),
    setItem: jest.fn((key: string, value: string) => {
      store[key] = value;
    }),
    removeItem: jest.fn((key: string) => {
      delete store[key];
    }),
    clear: jest.fn(() => {
      Object.keys(store).forEach(key => delete store[key]);
    }),
    length: Object.keys(store).length,
    key: jest.fn((index: number) => Object.keys(store)[index] || null),
  };
};

// Mock performance API
export const createMockPerformance = () => ({
  now: jest.fn(() => Date.now()),
  mark: jest.fn(),
  measure: jest.fn(),
  getEntriesByName: jest.fn(() => []),
  getEntriesByType: jest.fn(() => []),
  clearMarks: jest.fn(),
  clearMeasures: jest.fn(),
});

// Error boundary for testing
export class TestErrorBoundary extends React.Component<
  { children: React.ReactNode },
  { hasError: boolean; error?: Error }
> {
  constructor(props: { children: React.ReactNode }) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error) {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('Test Error Boundary caught an error:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div data-testid="error-boundary">
          <h2>Something went wrong.</h2>
          <details>
            {this.state.error && this.state.error.toString()}
          </details>
        </div>
      );
    }

    return this.props.children;
  }
}

// Re-export everything from testing-library
export * from '@testing-library/react';

// Override render method
export { customRender as render };