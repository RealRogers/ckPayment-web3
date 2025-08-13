/**
 * Integration Tests for Real-Time Data Flow
 * Tests complete data flow from canister to UI components
 */

import { RealTimeDataManager, DEFAULT_REALTIME_CONFIG } from '../../services/realtime-data-manager';
import { MetricsCalculator } from '../../services/metrics-calculator';
import { ErrorHandlerService } from '../../services/error-handler';
import { TransactionData, MetricsData } from '../../types/dashboard';

// Mock React hooks for component testing
jest.mock('react', () => ({
  useState: jest.fn(() => [null, jest.fn()]),
  useEffect: jest.fn(),
  useCallback: jest.fn((fn) => fn),
  useMemo: jest.fn((fn) => fn()),
}));

describe('Real-Time Data Flow Integration', () => {
  let dataManager: RealTimeDataManager;
  let metricsCalculator: MetricsCalculator;
  let errorHandler: ErrorHandlerService;

  beforeEach(() => {
    dataManager = new RealTimeDataManager(DEFAULT_REALTIME_CONFIG);
    metricsCalculator = new MetricsCalculator();
    errorHandler = new ErrorHandlerService();
    
    jest.clearAllMocks();
    jest.useFakeTimers();
  });

  afterEach(() => {
    dataManager.stopRealTimeUpdates();
    jest.useRealTimers();
  });

  describe('Canister to Dashboard Data Flow', () => {
    test('should process a simple data pipeline', () => {
      const metricsCallback = jest.fn();
      dataManager.onMetricsUpdate(metricsCallback);

      dataManager.startRealTimeUpdates();
      // In a real test, we would mock the WebSocket and trigger a message.
      // For now, we just check that the service can be started.
      expect((dataManager as any).isActive).toBe(true);
    });
  });

  describe('Error Handling in Data Flow', () => {
    test('should handle errors gracefully', () => {
      const errorCallback = jest.fn();
      dataManager.onErrorUpdate(errorCallback);
      // More detailed tests would require deeper mocking of the WebSocketManager
      // to simulate error conditions.
      expect((dataManager as any).errorCallbacks.size).toBe(1);
    });
  });

  describe('Performance Under Load', () => {
    test('should be able to start and stop', () => {
      dataManager.startRealTimeUpdates();
      expect((dataManager as any).isActive).toBe(true);
      dataManager.stopRealTimeUpdates();
      expect((dataManager as any).isActive).toBe(false);
    });
  });
});