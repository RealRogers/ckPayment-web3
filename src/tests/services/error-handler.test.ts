/**
 * Unit Tests for ErrorHandlerService
 * Tests error categorization, logging, and recovery suggestions
 */

import { ErrorHandlerService } from '../../services/error-handler';
import { EnhancedDashboardError } from '../../types/dashboard';

describe('ErrorHandlerService', () => {
  let errorHandler: ErrorHandlerService;
  let consoleSpy: jest.SpyInstance;

  beforeEach(() => {
    errorHandler = new ErrorHandlerService();
    consoleSpy = jest.spyOn(console, 'error').mockImplementation();
  });

  afterEach(() => {
    consoleSpy.mockRestore();
  });

  describe('Error Categorization', () => {
    test('should categorize network errors correctly', () => {
      const networkError = new Error('Failed to fetch');
      const handledError = errorHandler.handleError(networkError, {
        component: 'DataFetcher',
        operation: 'fetchMetrics'
      });

      expect(handledError.category).toBe('network');
      expect(handledError.severity).toBe('medium');
      expect(handledError.retryable).toBe(true);
    });

    test('should categorize WebSocket errors correctly', () => {
      const wsError = new Error('WebSocket connection failed');
      const handledError = errorHandler.handleError(wsError, {
        component: 'WebSocketManager',
        operation: 'connect'
      });

      expect(handledError.category).toBe('network');
      expect(handledError.severity).toBe('medium');
      expect(handledError.retryable).toBe(true);
    });

    test('should categorize canister errors correctly', () => {
      const canisterError = new Error('Canister rejected call');
      const handledError = errorHandler.handleError(canisterError, {
        component: 'CanisterService',
        operation: 'queryMetrics',
        canisterId: 'rdmx6-jaaaa-aaaah-qcaiq-cai'
      });

      expect(handledError.category).toBe('blockchain');
      expect(handledError.severity).toBe('medium');
      expect(handledError.context.canisterId).toBe('rdmx6-jaaaa-aaaah-qcaiq-cai');
    });

    test('should categorize authentication errors correctly', () => {
      const authError = new Error('Unauthorized access');
      const handledError = errorHandler.handleError(authError, {
        component: 'AuthService',
        operation: 'authenticate'
      });

      expect(handledError.category).toBe('user');
      expect(handledError.severity).toBe('high');
      expect(handledError.retryable).toBe(false);
    });

    test('should categorize validation errors correctly', () => {
      const validationError = new Error('Invalid input format');
      const handledError = errorHandler.handleError(validationError, {
        component: 'FormValidator',
        operation: 'validateInput'
      });

      expect(handledError.category).toBe('user');
      expect(handledError.severity).toBe('low');
      expect(handledError.retryable).toBe(false);
    });

    test('should handle unknown errors as system errors', () => {
      const unknownError = new Error('Something went wrong');
      const handledError = errorHandler.handleError(unknownError, {
        component: 'UnknownComponent',
        operation: 'unknownOperation'
      });

      expect(handledError.category).toBe('system');
      expect(handledError.severity).toBe('medium');
    });
  });

  describe('Recovery Suggestions', () => {
    test('should provide network error recovery suggestions', () => {
      const networkError = new Error('Network timeout');
      const handledError = errorHandler.handleError(networkError, {
        component: 'DataFetcher',
        operation: 'fetchData'
      });

      expect(handledError.recovery.actions).toEqual(
        expect.arrayContaining([
          expect.objectContaining({ type: 'retry' })
        ])
      );
    });

    test('should provide WebSocket error recovery suggestions', () => {
      const wsError = new Error('WebSocket disconnected');
      const handledError = errorHandler.handleError(wsError, {
        component: 'WebSocketManager',
        operation: 'maintain'
      });

      expect(handledError.recovery.actions).toEqual(
        expect.arrayContaining([
          expect.objectContaining({ type: 'reconnect' })
        ])
      );
    });

    test('should provide canister error recovery suggestions', () => {
      const canisterError = new Error('Canister out of cycles');
      const handledError = errorHandler.handleError(canisterError, {
        component: 'CanisterService',
        operation: 'call',
        canisterId: 'test-canister'
      });

      expect(handledError.recovery.actions).toEqual(
        expect.arrayContaining([
          expect.objectContaining({ label: 'Top Up Cycles' })
        ])
      );
    });

    test('should provide authentication error recovery suggestions', () => {
      const authError = new Error('Session expired');
      const handledError = errorHandler.handleError(authError, {
        component: 'AuthService',
        operation: 'validateSession'
      });

      expect(handledError.recovery.actions).toEqual(
        expect.arrayContaining([
          expect.objectContaining({ label: 'Re-authenticate' })
        ])
      );
    });
  });

  describe('Error Logging', () => {
    test('should log errors with structured format', () => {
      const error = new Error('Test error');
      const context = {
        component: 'TestComponent',
        operation: 'testOperation',
        userId: 'user123'
      };
      errorHandler.handleError(error, context);
      expect(consoleSpy).toHaveBeenCalled();
    });
  });

  describe('Error Statistics', () => {
    test('should track error statistics', () => {
      const error1 = new Error('Network error');
      errorHandler.handleError(error1, { component: 'NetworkService' });
      const stats = errorHandler.getErrorStats();
      expect(stats.totalErrors).toBe(1);
      expect(stats.errorsByType.get('network')).toBe(1);
    });
  });

  describe('Error Context Enhancement', () => {
    test('should enhance error context with additional metadata', () => {
      const error = new Error('Context test error');
      const context = {
        component: 'TestComponent',
        operation: 'testOperation',
        userId: 'user123'
      };
      const handledError = errorHandler.handleError(error, context);
      expect(handledError.context.component).toBe('TestComponent');
    });
  });
});