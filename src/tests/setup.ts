/**
 * Test Setup Configuration
 * Configures Jest environment for dashboard testing
 */

import '@testing-library/jest-dom';

// Mock WebSocket for testing
global.WebSocket = jest.fn().mockImplementation(() => ({
  addEventListener: jest.fn(),
  removeEventListener: jest.fn(),
  send: jest.fn(),
  close: jest.fn(),
  readyState: WebSocket.CONNECTING,
  CONNECTING: 0,
  OPEN: 1,
  CLOSING: 2,
  CLOSED: 3,
}));

// Mock localStorage
const localStorageMock = {
  getItem: jest.fn(),
  setItem: jest.fn(),
  removeItem: jest.fn(),
  clear: jest.fn(),
};
global.localStorage = localStorageMock;

// Mock performance API
global.performance = {
  now: jest.fn(() => Date.now()),
  mark: jest.fn(),
  measure: jest.fn(),
  getEntriesByName: jest.fn(() => []),
  getEntriesByType: jest.fn(() => []),
  clearMarks: jest.fn(),
  clearMeasures: jest.fn(),
} as any;

// Mock console methods for cleaner test output
global.console = {
  ...console,
  warn: jest.fn(),
  error: jest.fn(),
  info: jest.fn(),
  debug: jest.fn(),
};

// Setup test timeout
jest.setTimeout(10000);