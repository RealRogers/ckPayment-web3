import { 
  EnhancedDashboardError, 
  DashboardErrorType, 
  ErrorContext, 
  RecoveryAction, 
  ErrorStats, 
  ErrorTrend 
} from '@/types/dashboard';

/**
 * Error Handler Service
 * Provides comprehensive error processing, categorization, and recovery
 */
export class ErrorHandlerService {
  private static instance: ErrorHandlerService;
  private errorHistory: EnhancedDashboardError[] = [];
  private errorStats: Map<DashboardErrorType, number> = new Map();
  private sessionId: string;
  private userId?: string;
  private maxHistorySize = 1000;

  constructor() {
    this.sessionId = this.generateSessionId();
    this.initializeErrorStats();
  }

  static getInstance(): ErrorHandlerService {
    if (!ErrorHandlerService.instance) {
      ErrorHandlerService.instance = new ErrorHandlerService();
    }
    return ErrorHandlerService.instance;
  }

  /**
   * Set user ID for error context
   */
  setUserId(userId: string): void {
    this.userId = userId;
  }

  /**
   * Handle and process an error
   */
  handleError(error: Error, context: ErrorContext): EnhancedDashboardError {
    const errorType = this.categorizeError(error);
    const severity = this.determineSeverity(error, errorType, context);
    const category = this.determineCategory(errorType);
    
    const enhancedError: EnhancedDashboardError = {
      // Base error properties
      type: errorType,
      message: error.message,
      details: error.stack,
      retryable: this.isRetryable(errorType),
      timestamp: new Date().toISOString(),
      
      // Enhanced properties
      severity,
      category,
      
      // ICP-specific error details
      canisterError: this.extractCanisterError(error, context),
      networkError: this.extractNetworkError(error, context),
      websocketError: this.extractWebSocketError(error),
      
      // Context information
      context: {
        userId: this.userId,
        sessionId: this.sessionId,
        canisterId: context.canisterId,
        subnetId: context.subnetId,
        timestamp: new Date().toISOString(),
        userAgent: navigator.userAgent,
        url: window.location.href,
        stackTrace: error.stack,
        breadcrumbs: this.getBreadcrumbs(context)
      },
      
      // Recovery information
      recovery: {
        suggested: true,
        actions: this.suggestRecovery(errorType, error, context),
        autoRetry: this.shouldAutoRetry(errorType),
        retryCount: 0,
        maxRetries: this.getMaxRetries(errorType)
      },
      
      // Error analytics
      analytics: this.calculateAnalytics(errorType, error.message)
    };

    // Store error in history
    this.addToHistory(enhancedError);
    
    // Update statistics
    this.updateStats(errorType);
    
    // Log error
    this.logError(enhancedError);
    
    return enhancedError;
  }

  /**
   * Categorize error type based on error characteristics
   */
  categorizeError(error: Error): DashboardErrorType {
    const message = error.message.toLowerCase();
    const stack = error.stack?.toLowerCase() || '';
    
    // Network errors
    if (message.includes('network') || message.includes('fetch') || 
        message.includes('timeout') || message.includes('connection')) {
      return 'network';
    }
    
    // WebSocket errors
    if (message.includes('websocket') || message.includes('ws') ||
        stack.includes('websocket')) {
      return 'websocket';
    }
    
    // ICP Canister errors
    if (message.includes('canister') || message.includes('agent') ||
        message.includes('replica') || message.includes('ic0.app')) {
      return 'canister';
    }
    
    // Authentication errors
    if (message.includes('auth') || message.includes('unauthorized') ||
        message.includes('forbidden') || message.includes('token')) {
      return 'authentication';
    }
    
    // Validation errors
    if (message.includes('validation') || message.includes('invalid') ||
        message.includes('required') || message.includes('format')) {
      return 'validation';
    }
    
    // Rate limiting
    if (message.includes('rate') || message.includes('limit') ||
        message.includes('throttle') || message.includes('quota')) {
      return 'rate_limit';
    }
    
    // Cycle-related errors
    if (message.includes('cycle') || message.includes('insufficient funds') ||
        message.includes('out of cycles')) {
      return 'cycles';
    }
    
    // Memory errors
    if (message.includes('memory') || message.includes('heap') ||
        message.includes('allocation')) {
      return 'memory';
    }
    
    // Subnet errors
    if (message.includes('subnet') || message.includes('consensus') ||
        message.includes('replica')) {
      return 'subnet';
    }
    
    return 'unknown';
  }

  /**
   * Determine error severity
   */
  determineSeverity(
    error: Error, 
    errorType: DashboardErrorType, 
    context: ErrorContext
  ): 'low' | 'medium' | 'high' | 'critical' {
    // Critical errors that break core functionality
    if (errorType === 'canister' && context.operation === 'payment') {
      return 'critical';
    }
    
    if (errorType === 'cycles' || errorType === 'memory') {
      return 'critical';
    }
    
    // High severity errors that significantly impact user experience
    if (errorType === 'authentication' || errorType === 'authorization') {
      return 'high';
    }
    
    if (errorType === 'subnet' || errorType === 'consensus') {
      return 'high';
    }
    
    // Medium severity errors that cause inconvenience
    if (errorType === 'network' || errorType === 'websocket') {
      return 'medium';
    }
    
    if (errorType === 'rate_limit') {
      return 'medium';
    }
    
    // Low severity errors that are minor issues
    if (errorType === 'validation') {
      return 'low';
    }
    
    return 'medium'; // Default
  }

  /**
   * Determine error category
   */
  private determineCategory(errorType: DashboardErrorType): 'user' | 'system' | 'network' | 'blockchain' {
    switch (errorType) {
      case 'validation':
      case 'authentication':
      case 'authorization':
        return 'user';
        
      case 'network':
      case 'websocket':
      case 'rate_limit':
        return 'network';
        
      case 'canister':
      case 'cycles':
      case 'subnet':
      case 'consensus':
        return 'blockchain';
        
      default:
        return 'system';
    }
  }

  /**
   * Suggest recovery actions for an error
   */
  suggestRecovery(
    errorType: DashboardErrorType, 
    error: Error, 
    context: ErrorContext
  ): RecoveryAction[] {
    const actions: RecoveryAction[] = [];
    
    switch (errorType) {
      case 'network':
        actions.push({
          type: 'retry',
          label: 'Retry Request',
          description: 'Attempt the request again',
          action: async () => this.retryOperation(context),
          priority: 1,
          automated: true
        });
        
        actions.push({
          type: 'refresh',
          label: 'Refresh Page',
          description: 'Reload the page to reset connection',
          action: async () => window.location.reload(),
          priority: 2,
          automated: false
        });
        break;
        
      case 'websocket':
        actions.push({
          type: 'reconnect',
          label: 'Reconnect WebSocket',
          description: 'Re-establish real-time connection',
          action: async () => this.reconnectWebSocket(),
          priority: 1,
          automated: true
        });
        
        actions.push({
          type: 'fallback',
          label: 'Use Polling',
          description: 'Switch to polling for updates',
          action: async () => this.enablePollingFallback(),
          priority: 2,
          automated: true
        });
        break;
        
      case 'canister':
        actions.push({
          type: 'retry',
          label: 'Retry Canister Call',
          description: 'Attempt the canister call again',
          action: async () => this.retryCanisterCall(context),
          priority: 1,
          automated: true
        });
        
        if (context.canisterId) {
          actions.push({
            type: 'fallback',
            label: 'Use Backup Canister',
            description: 'Switch to backup canister instance',
            action: async () => this.useBackupCanister(context.canisterId!),
            priority: 2,
            automated: false
          });
        }
        break;
        
      case 'authentication':
        actions.push({
          type: 'refresh',
          label: 'Re-authenticate',
          description: 'Log in again to refresh credentials',
          action: async () => this.reauthenticate(),
          priority: 1,
          automated: false
        });
        break;
        
      case 'cycles':
        actions.push({
          type: 'contact_support',
          label: 'Top Up Cycles',
          description: 'Add more cycles to your canister',
          action: async () => this.showCycleTopUpDialog(),
          priority: 1,
          automated: false
        });
        break;
        
      case 'validation':
        actions.push({
          type: 'retry',
          label: 'Fix Input',
          description: 'Correct the input and try again',
          action: async () => this.showValidationHelp(error.message),
          priority: 1,
          automated: false
        });
        break;
        
      default:
        actions.push({
          type: 'retry',
          label: 'Try Again',
          description: 'Attempt the operation again',
          action: async () => this.retryOperation(context),
          priority: 1,
          automated: false
        });
    }
    
    // Always add contact support as last resort
    actions.push({
      type: 'contact_support',
      label: 'Contact Support',
      description: 'Get help from our support team',
      action: async () => this.contactSupport(error, context),
      priority: 99,
      automated: false
    });
    
    return actions.sort((a, b) => a.priority - b.priority);
  }

  /**
   * Execute recovery action
   */
  async executeRecovery(action: RecoveryAction): Promise<boolean> {
    try {
      await action.action();
      console.log(`Recovery action executed: ${action.label}`);
      return true;
    } catch (error) {
      console.error(`Recovery action failed: ${action.label}`, error);
      return false;
    }
  }

  /**
   * Log error with structured information
   */
  logError(error: EnhancedDashboardError): void {
    // Console logging with structured data
    this.logToConsole(error);
    
    // External logging (if configured)
    this.logToExternal(error).catch(err => {
      console.warn('Failed to log to external service:', err);
    });
  }

  /**
   * Log to console with structured format
   */
  logToConsole(error: EnhancedDashboardError): void {
    const logLevel = this.getLogLevel(error.severity);
    const logData = {
      timestamp: error.timestamp,
      type: error.type,
      severity: error.severity,
      category: error.category,
      message: error.message,
      context: error.context,
      recovery: error.recovery.actions.map(a => a.label)
    };
    
    console[logLevel]('Dashboard Error:', logData);
    
    if (error.details) {
      console.groupCollapsed('Error Details');
      console.error(error.details);
      console.groupEnd();
    }
  }

  /**
   * Log to external service (Sentry-like)
   */
  async logToExternal(error: EnhancedDashboardError): Promise<void> {
    // In a real implementation, this would send to Sentry, LogRocket, etc.
    try {
      const payload = {
        timestamp: error.timestamp,
        level: error.severity,
        message: error.message,
        tags: {
          errorType: error.type,
          category: error.category,
          canisterId: error.context.canisterId,
          subnetId: error.context.subnetId
        },
        extra: {
          context: error.context,
          recovery: error.recovery,
          analytics: error.analytics
        },
        fingerprint: this.generateFingerprint(error)
      };
      
      // Simulate external logging
      console.debug('Would log to external service:', payload);
      
    } catch (err) {
      console.warn('External logging failed:', err);
    }
  }

  /**
   * Get error statistics
   */
  getErrorStats(): ErrorStats {
    const totalErrors = this.errorHistory.length;
    const errorsByType = new Map<DashboardErrorType, number>();
    const errorsBySeverity = new Map<string, number>();
    const errorsByCategory = new Map<string, number>();
    
    let criticalErrors = 0;
    let recurringErrors = 0;
    const resolutionTimes: number[] = [];
    
    this.errorHistory.forEach(error => {
      // Count by type
      const typeCount = errorsByType.get(error.type) || 0;
      errorsByType.set(error.type, typeCount + 1);
      
      // Count by severity
      const severityCount = errorsBySeverity.get(error.severity) || 0;
      errorsBySeverity.set(error.severity, severityCount + 1);
      
      // Count by category
      const categoryCount = errorsByCategory.get(error.category) || 0;
      errorsByCategory.set(error.category, categoryCount + 1);
      
      // Count critical errors
      if (error.severity === 'critical') {
        criticalErrors++;
      }
      
      // Check for recurring errors (simplified)
      if (error.analytics && error.analytics.frequency > 1) {
        recurringErrors++;
      }
    });
    
    const averageResolutionTime = resolutionTimes.length > 0 
      ? resolutionTimes.reduce((sum, time) => sum + time, 0) / resolutionTimes.length
      : 0;
    
    return {
      totalErrors,
      errorsByType,
      errorsBySeverity,
      errorsByCategory,
      averageResolutionTime,
      recurringErrors,
      criticalErrors
    };
  }

  /**
   * Get error trends over time
   */
  getErrorTrends(): ErrorTrend[] {
    const trends: ErrorTrend[] = [];
    const now = new Date();
    const oneDayAgo = new Date(now.getTime() - 24 * 60 * 60 * 1000);
    
    // Group errors by hour for the last 24 hours
    const hourlyGroups = new Map<string, EnhancedDashboardError[]>();
    
    this.errorHistory
      .filter(error => new Date(error.timestamp) >= oneDayAgo)
      .forEach(error => {
        const hour = new Date(error.timestamp).toISOString().slice(0, 13);
        const group = hourlyGroups.get(hour) || [];
        group.push(error);
        hourlyGroups.set(hour, group);
      });
    
    // Create trend data
    hourlyGroups.forEach((errors, hour) => {
      const errorsByType = new Map<DashboardErrorType, number>();
      
      errors.forEach(error => {
        const count = errorsByType.get(error.type) || 0;
        errorsByType.set(error.type, count + 1);
      });
      
      errorsByType.forEach((count, type) => {
        trends.push({
          timestamp: hour + ':00:00.000Z',
          errorCount: count,
          errorType: type,
          severity: this.getMostSevereSeverity(errors.filter(e => e.type === type)),
          resolved: false // Simplified - would track resolution in real implementation
        });
      });
    });
    
    return trends.sort((a, b) => a.timestamp.localeCompare(b.timestamp));
  }

  /**
   * Clear error history
   */
  clearHistory(): void {
    this.errorHistory = [];
    this.errorStats.clear();
    this.initializeErrorStats();
  }

  // ===== PRIVATE METHODS =====

  private generateSessionId(): string {
    return `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  private initializeErrorStats(): void {
    const errorTypes: DashboardErrorType[] = [
      'network', 'canister', 'validation', 'authentication', 
      'authorization', 'rate_limit', 'websocket', 'consensus', 
      'subnet', 'cycles', 'memory', 'unknown'
    ];
    
    errorTypes.forEach(type => {
      this.errorStats.set(type, 0);
    });
  }

  private addToHistory(error: EnhancedDashboardError): void {
    this.errorHistory.push(error);
    
    // Maintain history size limit
    if (this.errorHistory.length > this.maxHistorySize) {
      this.errorHistory = this.errorHistory.slice(-this.maxHistorySize);
    }
  }

  private updateStats(errorType: DashboardErrorType): void {
    const current = this.errorStats.get(errorType) || 0;
    this.errorStats.set(errorType, current + 1);
  }

  private getBreadcrumbs(context: ErrorContext): string[] {
    // In a real implementation, this would track user actions
    return [
      `Component: ${context.component}`,
      `Operation: ${context.operation}`,
      `Timestamp: ${new Date().toISOString()}`
    ];
  }

  private calculateAnalytics(errorType: DashboardErrorType, message: string) {
    // Simplified analytics calculation
    const similarErrors = this.errorHistory.filter(
      error => error.type === errorType && error.message === message
    );
    
    return {
      frequency: similarErrors.length + 1,
      impact: this.calculateImpact(errorType),
      affectedUsers: 1, // Simplified
      firstOccurrence: similarErrors.length > 0 
        ? similarErrors[0].timestamp 
        : new Date().toISOString(),
      lastOccurrence: new Date().toISOString()
    };
  }

  private calculateImpact(errorType: DashboardErrorType): 'low' | 'medium' | 'high' {
    switch (errorType) {
      case 'canister':
      case 'cycles':
      case 'authentication':
        return 'high';
      case 'network':
      case 'websocket':
      case 'subnet':
        return 'medium';
      default:
        return 'low';
    }
  }

  private extractCanisterError(error: Error, context: ErrorContext) {
    // Extract ICP canister-specific error information
    if (context.canisterId && error.message.includes('canister')) {
      return {
        code: this.extractErrorCode(error.message),
        message: error.message,
        canisterId: context.canisterId,
        methodName: context.operation
      };
    }
    return undefined;
  }

  private extractNetworkError(error: Error, context: ErrorContext) {
    if (error.message.includes('network') || error.message.includes('fetch')) {
      return {
        timeout: error.message.includes('timeout'),
        retryable: true,
        endpoint: context.additionalData?.endpoint || 'unknown'
      };
    }
    return undefined;
  }

  private extractWebSocketError(error: Error) {
    if (error.message.includes('websocket')) {
      return {
        code: 1006, // Default WebSocket close code
        reason: error.message,
        wasClean: false,
        reconnectAttempt: 0
      };
    }
    return undefined;
  }

  private extractErrorCode(message: string): number {
    const match = message.match(/code[:\s]+(\d+)/i);
    return match ? parseInt(match[1]) : 0;
  }

  private isRetryable(errorType: DashboardErrorType): boolean {
    return ['network', 'websocket', 'canister', 'rate_limit'].includes(errorType);
  }

  private shouldAutoRetry(errorType: DashboardErrorType): boolean {
    return ['network', 'websocket'].includes(errorType);
  }

  private getMaxRetries(errorType: DashboardErrorType): number {
    switch (errorType) {
      case 'network':
        return 3;
      case 'websocket':
        return 5;
      case 'canister':
        return 2;
      default:
        return 1;
    }
  }

  private getLogLevel(severity: string): 'error' | 'warn' | 'info' {
    switch (severity) {
      case 'critical':
      case 'high':
        return 'error';
      case 'medium':
        return 'warn';
      default:
        return 'info';
    }
  }

  private generateFingerprint(error: EnhancedDashboardError): string {
    // Create a unique fingerprint for grouping similar errors
    const components = [
      error.type,
      error.message.replace(/\d+/g, 'X'), // Replace numbers with X
      error.context.component,
      error.context.operation
    ];
    
    return components.join('|');
  }

  private getMostSevereSeverity(errors: EnhancedDashboardError[]): string {
    const severityOrder = ['low', 'medium', 'high', 'critical'];
    let maxSeverity = 'low';
    
    errors.forEach(error => {
      if (severityOrder.indexOf(error.severity) > severityOrder.indexOf(maxSeverity)) {
        maxSeverity = error.severity;
      }
    });
    
    return maxSeverity;
  }

  // Recovery action implementations
  private async retryOperation(context: ErrorContext): Promise<void> {
    console.log('Retrying operation:', context.operation);
    // Implementation would depend on the specific operation
  }

  private async reconnectWebSocket(): Promise<void> {
    console.log('Reconnecting WebSocket...');
    // Implementation would reconnect the WebSocket
  }

  private async enablePollingFallback(): Promise<void> {
    console.log('Enabling polling fallback...');
    // Implementation would switch to polling mode
  }

  private async retryCanisterCall(context: ErrorContext): Promise<void> {
    console.log('Retrying canister call:', context.canisterId);
    // Implementation would retry the canister call
  }

  private async useBackupCanister(canisterId: string): Promise<void> {
    console.log('Switching to backup canister:', canisterId);
    // Implementation would switch to backup canister
  }

  private async reauthenticate(): Promise<void> {
    console.log('Re-authenticating user...');
    // Implementation would trigger re-authentication flow
  }

  private async showCycleTopUpDialog(): Promise<void> {
    console.log('Showing cycle top-up dialog...');
    // Implementation would show cycle management UI
  }

  private async showValidationHelp(message: string): Promise<void> {
    console.log('Showing validation help:', message);
    // Implementation would show validation guidance
  }

  private async contactSupport(error: Error, context: ErrorContext): Promise<void> {
    console.log('Contacting support for error:', error.message);
    // Implementation would open support channel
  }
}

// Export singleton instance
export const errorHandler = ErrorHandlerService.getInstance();

// Export factory function for testing
export const createErrorHandler = () => new ErrorHandlerService();