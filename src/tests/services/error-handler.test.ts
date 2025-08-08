/**
 * Unit Tests for ErrorHandlerService
 * Tests error categorization, logging, and recovery suggestions
 */

import { ErrorHandlerService } from '../../services/error-handler';
import { EnhancedDashboardError, ErrorCategory, ErrorSeverity } from '../../types/dashboard';

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
      const categorized = errorHandler.categorizeError(networkError, { 
        component: 'DataFetcher',
        operation: 'fetchMetrics'
      });

      expect(categorized.category).toBe(ErrorCategory.NETWORK);
      expect(categorized.severity).toBe(ErrorSeverity.HIGH);
      expect(categorized.isRetryable).toBe(true);
    });

    test('should categorize WebSocket errors correctly', () => {
      const wsError = new Error('WebSocket connection failed');
      const categorized = errorHandler.categorizeError(wsError, {
        component: 'WebSocketManager',
        operation: 'connect'
      });

      expect(categorized.category).toBe(ErrorCategory.WEBSOCKET);
      expect(categorized.severity).toBe(ErrorSeverity.HIGH);
      expect(categorized.isRetryable).toBe(true);
    });

    test('should categorize canister errors correctly', () => {
      const canisterError = new Error('Canister rejected call');
      const categorized = errorHandler.categorizeError(canisterError, {
        component: 'CanisterService',
        operation: 'queryMetrics',
        canisterId: 'rdmx6-jaaaa-aaaah-qcaiq-cai'
      });

      expect(categorized.category).toBe(ErrorCategory.CANISTER);
      expect(categorized.severity).toBe(ErrorSeverity.MEDIUM);
      expect(categorized.icpDetails?.canisterId).toBe('rdmx6-jaaaa-aaaah-qcaiq-cai');
    });

    test('should categorize authentication errors correctly', () => {
      const authError = new Error('Unauthorized access');
      const categorized = errorHandler.categorizeError(authError, {
        component: 'AuthService',
        operation: 'authenticate'
      });

      expect(categorized.category).toBe(ErrorCategory.AUTHENTICATION);
      expect(categorized.severity).toBe(ErrorSeverity.HIGH);
      expect(categorized.isRetryable).toBe(false);
    });

    test('should categorize validation errors correctly', () => {
      const validationError = new Error('Invalid input format');
      const categorized = errorHandler.categorizeError(validationError, {
        component: 'FormValidator',
        operation: 'validateInput'
      });

      expect(categorized.category).toBe(ErrorCategory.VALIDATION);
      expect(categorized.severity).toBe(ErrorSeverity.LOW);
      expect(categorized.isRetryable).toBe(false);
    });

    test('should handle unknown errors as system errors', () => {
      const unknownError = new Error('Something went wrong');
      const categorized = errorHandler.categorizeError(unknownError, {
        component: 'UnknownComponent',
        operation: 'unknownOperation'
      });

      expect(categorized.category).toBe(ErrorCategory.SYSTEM);
      expect(categorized.severity).toBe(ErrorSeverity.MEDIUM);
    });
  });

  describe('Recovery Suggestions', () => {
    test('should provide network error recovery suggestions', () => {
      const networkError = new Error('Network timeout');
      const categorized = errorHandler.categorizeError(networkError, {
        component: 'DataFetcher',
        operation: 'fetchData'
      });

      expect(categorized.recoveryActions).toContainEqual(
        expect.objectContaining({
          type: 'retry',
          description: 'Retry the operation'
        })
      );

      expect(categorized.recoveryActions).toContainEqual(
        expect.objectContaining({
          type: 'manual',
          description: 'Check your internet connection'
        })
      );
    });

    test('should provide WebSocket error recovery suggestions', () => {
      const wsError = new Error('WebSocket disconnected');
      const categorized = errorHandler.categorizeError(wsError, {
        component: 'WebSocketManager',
        operation: 'maintain'
      });

      expect(categorized.recoveryActions).toContainEqual(
        expect.objectContaining({
          type: 'automatic',
          description: 'Attempting to reconnect automatically'
        })
      );

      expect(categorized.recoveryActions).toContainEqual(
        expect.objectContaining({
          type: 'fallback',
          description: 'Switching to polling mode'
        })
      );
    });

    test('should provide canister error recovery suggestions', () => {
      const canisterError = new Error('Canister out of cycles');
      const categorized = errorHandler.categorizeError(canisterError, {
        component: 'CanisterService',
        operation: 'call',
        canisterId: 'test-canister'
      });

      expect(categorized.recoveryActions).toContainEqual(
        expect.objectContaining({
          type: 'manual',
          description: 'Top up canister cycles'
        })
      );
    });

    test('should provide authentication error recovery suggestions', () => {
      const authError = new Error('Session expired');
      const categorized = errorHandler.categorizeError(authError, {
        component: 'AuthService',
        operation: 'validateSession'
      });

      expect(categorized.recoveryActions).toContainEqual(
        expect.objectContaining({
          type: 'manual',
          description: 'Please log in again'
        })
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

      expect(consoleSpy).toHaveBeenCalledWith(
        expect.stringContaining('[ERROR]'),
        expect.objectContaining({
          message: 'Test error',
          category: expect.any(String),
          severity: expect.any(String),
          context: expect.objectContaining(context),
          timestamp: expect.any(String)
        })
      );
    });

    test('should include stack trace in logs', () => {
      const error = new Error('Test error with stack');
      errorHandler.handleError(error, { component: 'Test' });

      expect(consoleSpy).toHaveBeenCalledWith(
        expect.anything(),
        expect.objectContaining({
          stack: expect.stringContaining('Error: Test error with stack')
        })
      );
    });

    test('should log different severity levels appropriately', () => {
      const criticalError = new Error('System failure');
      const warningError = new Error('Invalid input');

      // Mock console methods
      const consoleWarnSpy = jest.spyOn(console, 'warn').mockImplementation();
      const consoleInfoSpy = jest.spyOn(console, 'info').mockImplementation();

      errorHandler.handleError(criticalError, { 
        component: 'SystemCore',
        operation: 'initialize'
      });

      errorHandler.handleError(warningError, { 
        component: 'InputValidator',
        operation: 'validate'
      });

      // Critical errors should use console.error
      expect(consoleSpy).toHaveBeenCalled();

      consoleWarnSpy.mockRestore();
      consoleInfoSpy.mockRestore();
    });
  });

  describe('Error Statistics', () => {
    test('should track error statistics', () => {
      const error1 = new Error('Network error');
      const error2 = new Error('WebSocket error');
      const error3 = new Error('Another network error');

      errorHandler.handleError(error1, { component: 'NetworkService' });
      errorHandler.handleError(error2, { component: 'WebSocketManager' });
      errorHandler.handleError(error3, { component: 'NetworkService' });

      const stats = errorHandler.getErrorStatistics();

      expect(stats.totalErrors).toBe(3);
      expect(stats.errorsByCategory[ErrorCategory.NETWORK]).toBe(2);
      expect(stats.errorsByCategory[ErrorCategory.WEBSOCKET]).toBe(1);
    });

    test('should track error rates over time', () => {
      const error = new Error('Test error');
      
      // Generate errors over time
      for (let i = 0; i < 5; i++) {
        errorHandler.handleError(error, { component: 'TestComponent' });
      }

      const stats = errorHandler.getErrorStatistics();
      expect(stats.totalErrors).toBe(5);
      expect(stats.recentErrors).toBeGreaterThan(0);
    });

    test('should identify most common error patterns', () => {
      const networkError = new Error('Network timeout');
      const validationError = new Error('Invalid data');

      // Generate more network errors
      for (let i = 0; i < 3; i++) {
        errorHandler.handleError(networkError, { component: 'NetworkService' });
      }
      
      errorHandler.handleError(validationError, { component: 'Validator' });

      const stats = errorHandler.getErrorStatistics();
      expect(stats.errorsByCategory[ErrorCategory.NETWORK]).toBe(3);
      expect(stats.errorsByCategory[ErrorCategory.VALIDATION]).toBe(1);
    });
  });

  describe('Error Context Enhancement', () => {
    test('should enhance error context with additional metadata', () => {
      const error = new Error('Context test error');
      const context = {
        component: 'TestComponent',
        operation: 'testOperation',
        userId: 'user123',
        sessionId: 'session456'
      };

      const categorized = errorHandler.categorizeError(error, context);

      expect(categorized.context).toEqual(expect.objectContaining(context));
      expect(categorized.timestamp).toBeDefined();
      expect(categorized.errorId).toBeDefined();
    });

    test('should handle missing context gracefully', () => {
      const error = new Error('No context error');
      
      const categorized = errorHandler.categorizeError(error);

      expect(categorized.context).toEqual({});
      expect(categorized.category).toBeDefined();
      expect(categorized.severity).toBeDefined();
    });

    test('should preserve original error properties', () => {
      const originalError = new Error('Original error');
      originalError.name = 'CustomError';
      (originalError as any).customProperty = 'customValue';

      const categorized = errorHandler.categorizeError(originalError, {
        component: 'TestComponent'
      });

      expect(categorized.originalError).toBe(originalError);
      expect(categorized.message).toBe('Original error');
    });
  });
});