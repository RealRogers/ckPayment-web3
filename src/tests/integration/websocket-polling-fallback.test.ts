/**
 * Integration Tests for WebSocket to Polling Fallback
 * Tests the complete fallback mechanism between WebSocket and polling modes
 */

import { RealTimeDataManager, DEFAULT_REALTIME_CONFIG } from '../../services/realtime-data-manager';
import { WebSocketManager } from '../../services/websocket-manager';

// Mock the WebSocketManager to control its behavior for this integration test
jest.mock('../../services/websocket-manager');

const MockedWebSocketManager = WebSocketManager as jest.MockedClass<typeof WebSocketManager>;

// Mock fetch for polling tests
global.fetch = jest.fn();

describe('WebSocket to Polling Fallback Integration', () => {
  let dataManager: RealTimeDataManager;

  beforeEach(() => {
    MockedWebSocketManager.mockClear();
    
    // Mock fetch responses for polling
    (global.fetch as jest.Mock).mockResolvedValue({
      ok: true,
      json: () => Promise.resolve({
        metrics: { value: 100, timestamp: Date.now() },
        transactions: [],
        errors: []
      })
    });
  });

  afterEach(() => {
    dataManager?.stopRealTimeUpdates();
  });

  describe('Seamless Fallback Transition', () => {
    test('should attempt to initialize polling when ws fails', async () => {
      // Arrange
      // Configure the mock to fail the connection
      MockedWebSocketManager.prototype.connect = jest.fn().mockRejectedValue(new Error('Connection failed'));
      
      dataManager = new RealTimeDataManager(DEFAULT_REALTIME_CONFIG);
      const pollingSpy = jest.spyOn(dataManager as any, 'initializePolling');

      // Act
      await dataManager.startRealTimeUpdates();
      
      // Assert
      expect(MockedWebSocketManager.prototype.connect).toHaveBeenCalled();
      expect(pollingSpy).toHaveBeenCalled();
    });
  });
});