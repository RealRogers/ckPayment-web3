/**
 * Integration Tests for Error Recovery Workflows
 * Tests complete error handling and recovery processes across components
 */

import { ErrorHandlerService } from '../../services/error-handler';
import { RealTimeDataManager } from '../../services/realtime-data-manager';
import { NotificationSystem } from '../../components/ui/notification-system';
import { ErrorCategory, ErrorSeverity } from '../../types/dashboard';

describe('Error Recovery Workflow Integration', () => {
  let errorHandler: ErrorHandlerService;
  let dataManager: RealTimeDataManager;
  let notificationSystem: NotificationSystem;

  beforeEach(() => {
    errorHandler = new ErrorHandlerService();
    dataManager = new RealTimeDataManager();
    notificationSystem = new NotificationSystem();
    
    jest.clearAllMocks();
    jest.useFakeTimers();
  });

  afterEach(() => {
    dataManager.stop();
    jest.useRealTimers();
  });

  describe('Network Error Recovery', () => {
    test('should handle network failure with automatic retry and user notification', async () => {
      const errorCallback = jest.fn();
      const notificationCallback = jest.fn();
      
      errorHandler.onError(errorCallback);
      notificationSystem.onNotification(notificationCallback);

      // Simulate network error
      const networkError = new Error('Failed to fetch');
      const categorizedError = errorHandler.categorizeError(networkError, {
        component: 'DataFetcher',
        operation: 'fetchMetrics'
      });

      expect(categorizedError.category).toBe(ErrorCategory.NETWORK);
      expect(categorizedError.isRetryable).toBe(true);

      // Verify recovery actions are suggested
      const retryAction = categorizedError.recoveryActions.find(action => action.type === 'retry');
      expect(retryAction).toBeDefined();

      // Execute automatic retry
      if (retryAction && retryAction.action) {
        const retryResult = await retryAction.action();
        expect(retryResult).toBeDefined();
      }

      // Verify notification was triggered
      expect(notificationCallback).toHaveBeenCalledWith(
        expect.objectContaining({
          type: 'error',
          severity: 'high',
          message: expect.stringContaining('network')
        })
      );
    });

    test('should escalate to manual intervention after max retry attempts', async () => {
      const errorCallback = jest.fn();
      let retryCount = 0;

      // Mock fetch to always fail
      global.fetch = jest.fn().mockImplementation(() => {
        retryCount++;
        return Promise.reject(new Error('Network timeout'));
      });

      errorHandler.onError(errorCallback);

      // Simulate multiple network failures
      for (let i = 0; i < 5; i++) {
        const networkError = new Error('Network timeout');
        const categorizedError = errorHandler.categorizeError(networkError, {
          component: 'DataFetcher',
          operation: 'fetchMetrics',
          retryCount: i
        });

        // Execute retry if available
        const retryAction = categorizedError.recoveryActions.find(action => action.type === 'retry');
        if (retryAction && retryAction.action) {
          try {
            await retryAction.action();
          } catch (error) {
            // Expected to fail
          }
        }
      }

      expect(retryCount).toBe(5);
      expect(errorCallback).toHaveBeenCalledTimes(5);

      // Last error should suggest manual intervention
      const lastCall = errorCallback.mock.calls[4][0];
      const manualAction = lastCall.recoveryActions.find((action: any) => action.type === 'manual');
      expect(manualAction).toBeDefined();
      expect(manualAction.description).toContain('Check your internet connection');
    });
  });

  describe('WebSocket Error Recovery', () => {
    test('should handle WebSocket disconnection with automatic reconnection', async () => {
      const connectionCallback = jest.fn();
      const errorCallback = jest.fn();
      
      dataManager.onConnectionChange(connectionCallback);
      dataManager.onError(errorCallback);

      // Start data manager (will fail to connect)
      await dataManager.start('ws://localhost:9999/nonexistent');
      
      expect(dataManager.getCurrentMode()).toBe('polling');
      expect(connectionCallback).toHaveBeenCalledWith(
        expect.objectContaining({
          status: 'disconnected',
          mode: 'polling'
        })
      );

      // Simulate WebSocket becoming available
      let connectionAttempts = 0;
      (global as any).WebSocket = jest.fn().mockImplementation(() => {
        connectionAttempts++;
        const mockWs = {
          readyState: connectionAttempts <= 2 ? WebSocket.CLOSED : WebSocket.OPEN,
          addEventListener: jest.fn(),
          removeEventListener: jest.fn(),
          send: jest.fn(),
          close: jest.fn()
        };

        setTimeout(() => {
          if (connectionAttempts <= 2) {
            mockWs.addEventListener.mock.calls
              .filter(call => call[0] === 'error')
              .forEach(call => call[1]());
          } else {
            mockWs.readyState = WebSocket.OPEN;
            mockWs.addEventListener.mock.calls
              .filter(call => call[0] === 'open')
              .forEach(call => call[1]());
          }
        }, 10);

        return mockWs;
      });

      // Trigger reconnection attempts
      for (let i = 0; i < 5; i++) {
        jest.advanceTimersByTime(5000);
        await Promise.resolve();
      }

      expect(connectionAttempts).toBeGreaterThan(2);
      expect(dataManager.getCurrentMode()).toBe('websocket');
      expect(connectionCallback).toHaveBeenCalledWith(
        expect.objectContaining({
          status: 'connected',
          mode: 'websocket'
        })
      );
    });

    test('should fallback to polling when WebSocket repeatedly fails', async () => {
      const modeChangeCallback = jest.fn();
      const errorCallback = jest.fn();
      
      dataManager.onModeChange(modeChangeCallback);
      errorHandler.onError(errorCallback);

      // Configure limited reconnection attempts
      dataManager.configure({ maxReconnectAttempts: 2 });

      // Mock WebSocket to always fail
      (global as any).WebSocket = jest.fn().mockImplementation(() => {
        const mockWs = {
          readyState: WebSocket.CLOSED,
          addEventListener: jest.fn(),
          removeEventListener: jest.fn(),
          send: jest.fn(),
          close: jest.fn()
        };

        setTimeout(() => {
          mockWs.addEventListener.mock.calls
            .filter(call => call[0] === 'error')
            .forEach(call => call[1]());
        }, 10);

        return mockWs;
      });

      await dataManager.start('ws://localhost:8080/test');

      // Advance time to exhaust reconnection attempts
      for (let i = 0; i < 5; i++) {
        jest.advanceTimersByTime(10000);
        await Promise.resolve();
      }

      expect(dataManager.getCurrentMode()).toBe('polling');
      expect(modeChangeCallback).toHaveBeenCalledWith(
        expect.objectContaining({
          from: 'websocket',
          to: 'polling',
          reason: 'max_reconnect_attempts_exceeded'
        })
      );
    });
  });

  describe('Canister Error Recovery', () => {
    test('should handle canister rejection with appropriate user guidance', async () => {
      const errorCallback = jest.fn();
      const notificationCallback = jest.fn();
      
      errorHandler.onError(errorCallback);
      notificationSystem.onNotification(notificationCallback);

      // Simulate canister rejection
      const canisterError = new Error('Canister rdmx6-jaaaa-aaaah-qcaiq-cai rejected the call');
      const categorizedError = errorHandler.categorizeError(canisterError, {
        component: 'CanisterService',
        operation: 'queryMetrics',
        canisterId: 'rdmx6-jaaaa-aaaah-qcaiq-cai'
      });

      expect(categorizedError.category).toBe(ErrorCategory.CANISTER);
      expect(categorizedError.icpDetails?.canisterId).toBe('rdmx6-jaaaa-aaaah-qcaiq-cai');

      // Verify recovery suggestions
      const manualAction = categorizedError.recoveryActions.find(action => action.type === 'manual');
      expect(manualAction).toBeDefined();
      expect(manualAction?.description).toContain('canister');

      // Verify notification includes canister-specific information
      expect(notificationCallback).toHaveBeenCalledWith(
        expect.objectContaining({
          type: 'error',
          message: expect.stringContaining('rdmx6-jaaaa-aaaah-qcaiq-cai'),
          actions: expect.arrayContaining([
            expect.objectContaining({
              label: expect.stringContaining('Retry'),
              action: expect.any(Function)
            })
          ])
        })
      );
    });

    test('should handle cycle depletion with top-up guidance', async () => {
      const errorCallback = jest.fn();
      
      errorHandler.onError(errorCallback);

      const cycleError = new Error('Canister out of cycles');
      const categorizedError = errorHandler.categorizeError(cycleError, {
        component: 'CanisterService',
        operation: 'executeTransaction',
        canisterId: 'test-canister',
        cycleBalance: 0
      });

      expect(categorizedError.category).toBe(ErrorCategory.CANISTER);
      
      const topUpAction = categorizedError.recoveryActions.find(
        action => action.description.includes('cycles')
      );
      expect(topUpAction).toBeDefined();
      expect(topUpAction?.type).toBe('manual');
    });
  });

  describe('Circuit Breaker Integration', () => {
    test('should activate circuit breaker after repeated failures', async () => {
      const circuitBreakerCallback = jest.fn();
      const errorCallback = jest.fn();
      
      errorHandler.onCircuitBreakerChange(circuitBreakerCallback);
      errorHandler.onError(errorCallback);

      // Configure circuit breaker with low threshold for testing
      errorHandler.configure({
        circuitBreaker: {
          failureThreshold: 3,
          resetTimeout: 5000
        }
      });

      // Generate repeated failures
      for (let i = 0; i < 5; i++) {
        const error = new Error(`Network error ${i}`);
        errorHandler.handleError(error, {
          component: 'NetworkService',
          operation: 'fetchData'
        });
      }

      expect(circuitBreakerCallback).toHaveBeenCalledWith(
        expect.objectContaining({
          state: 'open',
          component: 'NetworkService',
          failureCount: 5
        })
      );

      // Verify subsequent calls are blocked
      const blockedError = new Error('Should be blocked');
      const result = errorHandler.handleError(blockedError, {
        component: 'NetworkService',
        operation: 'fetchData'
      });

      expect(result.isBlocked).toBe(true);
      expect(result.reason).toContain('circuit breaker');
    });

    test('should reset circuit breaker after timeout', async () => {
      const circuitBreakerCallback = jest.fn();
      
      errorHandler.onCircuitBreakerChange(circuitBreakerCallback);
      errorHandler.configure({
        circuitBreaker: {
          failureThreshold: 2,
          resetTimeout: 1000
        }
      });

      // Trigger circuit breaker
      for (let i = 0; i < 3; i++) {
        const error = new Error(`Error ${i}`);
        errorHandler.handleError(error, {
          component: 'TestService',
          operation: 'test'
        });
      }

      expect(circuitBreakerCallback).toHaveBeenCalledWith(
        expect.objectContaining({ state: 'open' })
      );

      // Advance time to trigger reset
      jest.advanceTimersByTime(1500);

      expect(circuitBreakerCallback).toHaveBeenCalledWith(
        expect.objectContaining({ state: 'half-open' })
      );

      // Successful operation should close circuit breaker
      const successfulOperation = jest.fn().mockResolvedValue('success');
      await successfulOperation();

      errorHandler.recordSuccess('TestService');

      expect(circuitBreakerCallback).toHaveBeenCalledWith(
        expect.objectContaining({ state: 'closed' })
      );
    });
  });

  describe('End-to-End Error Recovery', () => {
    test('should handle complete system failure and recovery', async () => {
      const systemEvents: any[] = [];
      const eventLogger = (event: any) => systemEvents.push({ ...event, timestamp: Date.now() });
      
      errorHandler.onError(eventLogger);
      dataManager.onError(eventLogger);
      dataManager.onModeChange(eventLogger);
      notificationSystem.onNotification(eventLogger);

      // Start system
      await dataManager.start('ws://localhost:9999/nonexistent');
      
      // Simulate cascade of failures
      
      // 1. Network failure
      global.fetch = jest.fn().mockRejectedValue(new Error('Network down'));
      jest.advanceTimersByTime(5000);
      await Promise.resolve();

      // 2. WebSocket connection attempts fail
      (global as any).WebSocket = jest.fn().mockImplementation(() => {
        const mockWs = {
          readyState: WebSocket.CLOSED,
          addEventListener: jest.fn(),
          removeEventListener: jest.fn(),
          send: jest.fn(),
          close: jest.fn()
        };
        setTimeout(() => {
          mockWs.addEventListener.mock.calls
            .filter(call => call[0] === 'error')
            .forEach(call => call[1]());
        }, 10);
        return mockWs;
      });

      jest.advanceTimersByTime(10000);
      await Promise.resolve();

      // 3. Multiple service errors
      for (let i = 0; i < 3; i++) {
        const serviceError = new Error(`Service ${i} failed`);
        errorHandler.handleError(serviceError, {
          component: `Service${i}`,
          operation: 'process'
        });
      }

      // Verify system is in degraded state
      expect(dataManager.getCurrentMode()).toBe('polling');
      expect(systemEvents.filter(e => e.type === 'error').length).toBeGreaterThan(3);

      // Simulate recovery
      
      // 1. Network comes back
      global.fetch = jest.fn().mockResolvedValue({
        ok: true,
        json: () => Promise.resolve({ metrics: { value: 100 } })
      });

      // 2. WebSocket becomes available
      (global as any).WebSocket = jest.fn().mockImplementation(() => {
        const mockWs = {
          readyState: WebSocket.OPEN,
          addEventListener: jest.fn(),
          removeEventListener: jest.fn(),
          send: jest.fn(),
          close: jest.fn()
        };
        setTimeout(() => {
          mockWs.addEventListener.mock.calls
            .filter(call => call[0] === 'open')
            .forEach(call => call[1]());
        }, 10);
        return mockWs;
      });

      jest.advanceTimersByTime(15000);
      await Promise.resolve();

      // Verify system recovery
      expect(dataManager.getCurrentMode()).toBe('websocket');
      expect(systemEvents.filter(e => e.from === 'polling' && e.to === 'websocket').length).toBe(1);

      // Verify recovery notifications
      const recoveryNotifications = systemEvents.filter(e => 
        e.type === 'success' || (e.message && e.message.includes('recovered'))
      );
      expect(recoveryNotifications.length).toBeGreaterThan(0);
    });
  });
});