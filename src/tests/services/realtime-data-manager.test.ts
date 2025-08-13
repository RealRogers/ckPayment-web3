/**
 * Unit Tests for RealTimeDataManager Service
 * Tests real-time data coordination, fallback mechanisms, and update throttling
 */

import { RealTimeDataManager, DEFAULT_REALTIME_CONFIG } from '../../services/realtime-data-manager';
import { WebSocketManager } from '../../services/websocket-manager';

// Mock the entire WebSocketManager module
jest.mock('../../services/websocket-manager');

const MockedWebSocketManager = WebSocketManager as jest.MockedClass<typeof WebSocketManager>;

describe('RealTimeDataManager', () => {
  let dataManager: RealTimeDataManager;

  beforeEach(() => {
    // Clears all instances and calls to constructor and all methods:
    MockedWebSocketManager.mockClear();
    jest.useFakeTimers();
  });

  afterEach(() => {
    dataManager?.stopRealTimeUpdates();
    jest.useRealTimers();
  });

  describe('Initialization and Configuration', () => {
    test('should initialize but not be active', () => {
      dataManager = new RealTimeDataManager(DEFAULT_REALTIME_CONFIG);
      expect((dataManager as any).isActive).toBe(false);
    });

    test('should start real-time updates and connect via WebSocket', async () => {
      dataManager = new RealTimeDataManager(DEFAULT_REALTIME_CONFIG);
      await dataManager.startRealTimeUpdates('test-canister');

      expect((dataManager as any).isActive).toBe(true);
      expect((dataManager as any).canisterId).toBe('test-canister');

      // Check that a WebSocketManager instance was created and connect was called
      expect(MockedWebSocketManager).toHaveBeenCalledTimes(1);
      const mockWsInstance = MockedWebSocketManager.mock.instances[0];
      expect(mockWsInstance.connect).toHaveBeenCalledWith('test-canister');
    });
  });

  describe('WebSocket Mode Operations', () => {
    beforeEach(async () => {
        dataManager = new RealTimeDataManager(DEFAULT_REALTIME_CONFIG);
        await dataManager.startRealTimeUpdates();
    });

    test('should register metrics update callback', () => {
      const callback = jest.fn();
      dataManager.onMetricsUpdate(callback);
      expect((dataManager as any).metricsCallbacks.size).toBe(1);
    });

    test('should register transaction update callback', () => {
      const callback = jest.fn();
      dataManager.onTransactionUpdate(callback);
      expect((dataManager as any).transactionCallbacks.size).toBe(1);
    });

    test('should register error update callback', () => {
      const callback = jest.fn();
      dataManager.onErrorUpdate(callback);
      expect((dataManager as any).errorCallbacks.size).toBe(1);
    });
  });

  describe('Fallback Mechanisms', () => {
    test('should initialize polling when WebSocket connection fails', async () => {
      // Mock connect to reject
      MockedWebSocketManager.prototype.connect = jest.fn().mockRejectedValue(new Error('Connection failed'));
      
      dataManager = new RealTimeDataManager(DEFAULT_REALTIME_CONFIG);
      const pollingSpy = jest.spyOn(dataManager as any, 'initializePolling');
      
      await dataManager.startRealTimeUpdates();
      
      expect(MockedWebSocketManager.prototype.connect).toHaveBeenCalled();
      expect(pollingSpy).toHaveBeenCalled();
    });

    test('should not initialize polling if fallback is disabled', async () => {
        MockedWebSocketManager.prototype.connect = jest.fn().mockRejectedValue(new Error('Connection failed'));

        const config = { ...DEFAULT_REALTIME_CONFIG, enablePollingFallback: false };
        dataManager = new RealTimeDataManager(config);
        const pollingSpy = jest.spyOn(dataManager as any, 'initializePolling');

        await dataManager.startRealTimeUpdates();

        expect(MockedWebSocketManager.prototype.connect).toHaveBeenCalled();
        expect(pollingSpy).not.toHaveBeenCalled();
      });
  });

  describe('Bandwidth Optimization', () => {
    beforeEach(() => {
        dataManager = new RealTimeDataManager(DEFAULT_REALTIME_CONFIG);
    });

    test('should be enabled by default in the config', () => {
      expect((dataManager as any).config.bandwidthOptimization).toBe(true);
    });

    test('should allow enabling/disabling bandwidth optimization', () => {
      dataManager.setBandwidthOptimization(false);
      expect((dataManager as any).config.bandwidthOptimization).toBe(false);
      expect((dataManager as any).bandwidthSettings.enabled).toBe(false);

      dataManager.setBandwidthOptimization(true);
      expect((dataManager as any).config.bandwidthOptimization).toBe(true);
      expect((dataManager as any).bandwidthSettings.enabled).toBe(true);
    });
  });

  describe('Data Validation and Error Handling', () => {
    test('should have error callbacks set', () => {
      dataManager = new RealTimeDataManager(DEFAULT_REALTIME_CONFIG);
      const callback = jest.fn();
      dataManager.onErrorUpdate(callback);
      expect((dataManager as any).errorCallbacks.size).toBe(1);
    });
  });

  describe('Performance Monitoring', () => {
    test('should get connection health', () => {
      dataManager = new RealTimeDataManager(DEFAULT_REALTIME_CONFIG);
      const health = dataManager.getConnectionHealth();
      expect(health).toHaveProperty('websocketStatus');
      expect(health).toHaveProperty('pollingStatus');
      expect(health.errorCount).toBe(0);
    });
  });
});