/**
 * System Health Monitoring Service
 * Monitors dashboard performance, memory usage, connection quality, and system resources
 */

export interface SystemHealthMetrics {
  // Performance metrics
  performance: {
    renderTime: number; // milliseconds
    updateFrequency: number; // updates per second
    memoryUsage: number; // MB
    cpuUsage: number; // percentage (estimated)
    networkLatency: number; // milliseconds
    frameRate: number; // FPS
  };
  
  // Connection health
  connection: {
    websocketStatus: 'connected' | 'disconnected' | 'connecting' | 'error';
    websocketLatency: number; // milliseconds
    reconnectCount: number;
    dataFreshness: number; // seconds since last update
    bandwidthUsage: number; // bytes per second
    packetLoss: number; // percentage
  };
  
  // Browser/System resources
  system: {
    availableMemory: number; // MB
    usedMemory: number; // MB
    browserVersion: string;
    platform: string;
    screenResolution: string;
    devicePixelRatio: number;
    connectionType: string; // '4g', 'wifi', etc.
    isOnline: boolean;
  };
  
  // Dashboard-specific metrics
  dashboard: {
    componentCount: number;
    activeSubscriptions: number;
    cacheHitRate: number; // percentage
    errorCount: number;
    warningCount: number;
    lastErrorTime?: string;
    uptime: number; // seconds since dashboard load
  };
  
  // Quality scores (0-100)
  scores: {
    overall: number;
    performance: number;
    reliability: number;
    userExperience: number;
  };
}

export interface HealthAlert {
  id: string;
  type: 'performance' | 'memory' | 'connection' | 'error' | 'warning';
  severity: 'low' | 'medium' | 'high' | 'critical';
  title: string;
  message: string;
  timestamp: string;
  metric: string;
  currentValue: number;
  threshold: number;
  suggestions: string[];
}

export interface HealthThresholds {
  performance: {
    maxRenderTime: number; // ms
    minFrameRate: number; // FPS
    maxMemoryUsage: number; // MB
    maxLatency: number; // ms
  };
  connection: {
    maxReconnects: number;
    maxDataStaleness: number; // seconds
    maxPacketLoss: number; // percentage
  };
  system: {
    minAvailableMemory: number; // MB
    maxErrorRate: number; // errors per minute
  };
}

export class SystemHealthMonitor {
  private static instance: SystemHealthMonitor;
  private metrics: SystemHealthMetrics;
  private thresholds: HealthThresholds;
  private alerts: HealthAlert[] = [];
  private monitoringInterval: NodeJS.Timeout | null = null;
  private performanceObserver: PerformanceObserver | null = null;
  private startTime: number;
  private frameCount = 0;
  private lastFrameTime = 0;
  private renderTimes: number[] = [];
  private errorCount = 0;
  private warningCount = 0;
  private lastErrorTime?: string;
  private alertCallbacks = new Set<(alert: HealthAlert) => void>();

  constructor() {
    this.startTime = Date.now();
    this.thresholds = this.getDefaultThresholds();
    this.metrics = this.initializeMetrics();
    this.setupPerformanceObserver();
    this.setupEventListeners();
  }

  static getInstance(): SystemHealthMonitor {
    if (!SystemHealthMonitor.instance) {
      SystemHealthMonitor.instance = new SystemHealthMonitor();
    }
    return SystemHealthMonitor.instance;
  }

  /**
   * Start health monitoring
   */
  startMonitoring(interval = 5000): void {
    if (this.monitoringInterval) {
      console.warn('Health monitoring already started');
      return;
    }

    console.log('Starting system health monitoring...');
    
    this.monitoringInterval = setInterval(() => {
      this.updateMetrics();
      this.checkThresholds();
    }, interval);

    // Initial metrics update
    this.updateMetrics();
  }

  /**
   * Stop health monitoring
   */
  stopMonitoring(): void {
    if (this.monitoringInterval) {
      clearInterval(this.monitoringInterval);
      this.monitoringInterval = null;
      console.log('System health monitoring stopped');
    }

    if (this.performanceObserver) {
      this.performanceObserver.disconnect();
      this.performanceObserver = null;
    }
  }

  /**
   * Get current health metrics
   */
  getMetrics(): SystemHealthMetrics {
    return { ...this.metrics };
  }

  /**
   * Get health alerts
   */
  getAlerts(): HealthAlert[] {
    return [...this.alerts];
  }

  /**
   * Get active (unresolved) alerts
   */
  getActiveAlerts(): HealthAlert[] {
    return this.alerts.filter(alert => 
      Date.now() - new Date(alert.timestamp).getTime() < 300000 // Last 5 minutes
    );
  }

  /**
   * Clear specific alert
   */
  clearAlert(alertId: string): void {
    this.alerts = this.alerts.filter(alert => alert.id !== alertId);
  }

  /**
   * Clear all alerts
   */
  clearAllAlerts(): void {
    this.alerts = [];
  }

  /**
   * Update health thresholds
   */
  updateThresholds(newThresholds: Partial<HealthThresholds>): void {
    this.thresholds = { ...this.thresholds, ...newThresholds };
  }

  /**
   * Subscribe to health alerts
   */
  onAlert(callback: (alert: HealthAlert) => void): () => void {
    this.alertCallbacks.add(callback);
    return () => this.alertCallbacks.delete(callback);
  }

  /**
   * Record error for monitoring
   */
  recordError(error: Error, context?: string): void {
    this.errorCount++;
    this.lastErrorTime = new Date().toISOString();
    
    // Create error alert
    this.createAlert({
      type: 'error',
      severity: 'high',
      title: 'Application Error',
      message: `${error.message}${context ? ` (${context})` : ''}`,
      metric: 'errorCount',
      currentValue: this.errorCount,
      threshold: this.thresholds.system.maxErrorRate,
      suggestions: [
        'Check browser console for detailed error information',
        'Try refreshing the page',
        'Clear browser cache if errors persist'
      ]
    });
  }

  /**
   * Record warning for monitoring
   */
  recordWarning(message: string, context?: string): void {
    this.warningCount++;
    
    this.createAlert({
      type: 'warning',
      severity: 'medium',
      title: 'System Warning',
      message: `${message}${context ? ` (${context})` : ''}`,
      metric: 'warningCount',
      currentValue: this.warningCount,
      threshold: 10, // Arbitrary threshold for warnings
      suggestions: [
        'Monitor system performance',
        'Check network connection',
        'Review dashboard configuration'
      ]
    });
  }

  /**
   * Get system health report
   */
  getHealthReport(): {
    summary: string;
    status: 'excellent' | 'good' | 'fair' | 'poor' | 'critical';
    metrics: SystemHealthMetrics;
    alerts: HealthAlert[];
    recommendations: string[];
  } {
    const overallScore = this.metrics.scores.overall;
    
    let status: 'excellent' | 'good' | 'fair' | 'poor' | 'critical';
    let summary: string;
    
    if (overallScore >= 90) {
      status = 'excellent';
      summary = 'System is performing optimally with no issues detected.';
    } else if (overallScore >= 75) {
      status = 'good';
      summary = 'System is performing well with minor optimization opportunities.';
    } else if (overallScore >= 60) {
      status = 'fair';
      summary = 'System performance is acceptable but could be improved.';
    } else if (overallScore >= 40) {
      status = 'poor';
      summary = 'System performance issues detected that may affect user experience.';
    } else {
      status = 'critical';
      summary = 'Critical system issues detected requiring immediate attention.';
    }

    const recommendations = this.generateRecommendations();

    return {
      summary,
      status,
      metrics: this.metrics,
      alerts: this.getActiveAlerts(),
      recommendations
    };
  }

  // ===== PRIVATE METHODS =====

  private initializeMetrics(): SystemHealthMetrics {
    return {
      performance: {
        renderTime: 0,
        updateFrequency: 0,
        memoryUsage: 0,
        cpuUsage: 0,
        networkLatency: 0,
        frameRate: 60
      },
      connection: {
        websocketStatus: 'disconnected',
        websocketLatency: 0,
        reconnectCount: 0,
        dataFreshness: 0,
        bandwidthUsage: 0,
        packetLoss: 0
      },
      system: {
        availableMemory: 0,
        usedMemory: 0,
        browserVersion: navigator.userAgent,
        platform: navigator.platform,
        screenResolution: `${screen.width}x${screen.height}`,
        devicePixelRatio: window.devicePixelRatio,
        connectionType: this.getConnectionType(),
        isOnline: navigator.onLine
      },
      dashboard: {
        componentCount: 0,
        activeSubscriptions: 0,
        cacheHitRate: 0,
        errorCount: 0,
        warningCount: 0,
        uptime: 0
      },
      scores: {
        overall: 100,
        performance: 100,
        reliability: 100,
        userExperience: 100
      }
    };
  }

  private getDefaultThresholds(): HealthThresholds {
    return {
      performance: {
        maxRenderTime: 16, // 60 FPS = 16ms per frame
        minFrameRate: 30,
        maxMemoryUsage: 100, // MB
        maxLatency: 1000 // ms
      },
      connection: {
        maxReconnects: 5,
        maxDataStaleness: 30, // seconds
        maxPacketLoss: 5 // percentage
      },
      system: {
        minAvailableMemory: 100, // MB
        maxErrorRate: 5 // errors per minute
      }
    };
  }

  private setupPerformanceObserver(): void {
    if ('PerformanceObserver' in window) {
      try {
        this.performanceObserver = new PerformanceObserver((list) => {
          const entries = list.getEntries();
          
          entries.forEach(entry => {
            if (entry.entryType === 'measure') {
              this.renderTimes.push(entry.duration);
              
              // Keep only last 100 measurements
              if (this.renderTimes.length > 100) {
                this.renderTimes = this.renderTimes.slice(-100);
              }
            }
          });
        });

        this.performanceObserver.observe({ entryTypes: ['measure', 'navigation'] });
      } catch (error) {
        console.warn('Performance Observer not supported:', error);
      }
    }
  }

  private setupEventListeners(): void {
    // Online/offline status
    window.addEventListener('online', () => {
      this.metrics.system.isOnline = true;
    });

    window.addEventListener('offline', () => {
      this.metrics.system.isOnline = false;
      this.createAlert({
        type: 'connection',
        severity: 'high',
        title: 'Connection Lost',
        message: 'Internet connection is offline',
        metric: 'isOnline',
        currentValue: 0,
        threshold: 1,
        suggestions: [
          'Check your internet connection',
          'Try refreshing the page when connection is restored'
        ]
      });
    });

    // Unhandled errors
    window.addEventListener('error', (event) => {
      this.recordError(event.error || new Error(event.message), 'Global error handler');
    });

    // Unhandled promise rejections
    window.addEventListener('unhandledrejection', (event) => {
      this.recordError(new Error(event.reason), 'Unhandled promise rejection');
    });

    // Frame rate monitoring
    this.startFrameRateMonitoring();
  }

  private startFrameRateMonitoring(): void {
    const measureFrameRate = () => {
      const now = performance.now();
      
      if (this.lastFrameTime > 0) {
        const delta = now - this.lastFrameTime;
        this.frameCount++;
        
        // Calculate FPS every second
        if (this.frameCount >= 60) {
          const fps = 1000 / (delta / this.frameCount);
          this.metrics.performance.frameRate = Math.round(fps);
          this.frameCount = 0;
        }
      }
      
      this.lastFrameTime = now;
      requestAnimationFrame(measureFrameRate);
    };

    requestAnimationFrame(measureFrameRate);
  }

  private updateMetrics(): void {
    // Update performance metrics
    this.updatePerformanceMetrics();
    
    // Update system metrics
    this.updateSystemMetrics();
    
    // Update dashboard metrics
    this.updateDashboardMetrics();
    
    // Calculate health scores
    this.calculateHealthScores();
  }

  private updatePerformanceMetrics(): void {
    // Average render time
    if (this.renderTimes.length > 0) {
      const avgRenderTime = this.renderTimes.reduce((sum, time) => sum + time, 0) / this.renderTimes.length;
      this.metrics.performance.renderTime = Math.round(avgRenderTime * 100) / 100;
    }

    // Memory usage (if available)
    if ('memory' in performance) {
      const memory = (performance as any).memory;
      this.metrics.performance.memoryUsage = Math.round(memory.usedJSHeapSize / 1024 / 1024);
      this.metrics.system.usedMemory = Math.round(memory.usedJSHeapSize / 1024 / 1024);
      this.metrics.system.availableMemory = Math.round(memory.jsHeapSizeLimit / 1024 / 1024);
    }

    // Estimate CPU usage based on render times
    const avgRenderTime = this.metrics.performance.renderTime;
    this.metrics.performance.cpuUsage = Math.min(100, Math.round((avgRenderTime / 16) * 100));
  }

  private updateSystemMetrics(): void {
    this.metrics.system.isOnline = navigator.onLine;
    this.metrics.system.connectionType = this.getConnectionType();
  }

  private updateDashboardMetrics(): void {
    // Update uptime
    this.metrics.dashboard.uptime = Math.round((Date.now() - this.startTime) / 1000);
    
    // Update error and warning counts
    this.metrics.dashboard.errorCount = this.errorCount;
    this.metrics.dashboard.warningCount = this.warningCount;
    
    // Estimate component count (simplified)
    this.metrics.dashboard.componentCount = document.querySelectorAll('[data-component]').length || 
                                           document.querySelectorAll('.card, .metric-card, .chart').length;
  }

  private calculateHealthScores(): void {
    // Performance score (0-100)
    let performanceScore = 100;
    
    if (this.metrics.performance.renderTime > this.thresholds.performance.maxRenderTime) {
      performanceScore -= 20;
    }
    
    if (this.metrics.performance.frameRate < this.thresholds.performance.minFrameRate) {
      performanceScore -= 15;
    }
    
    if (this.metrics.performance.memoryUsage > this.thresholds.performance.maxMemoryUsage) {
      performanceScore -= 25;
    }
    
    // Reliability score (0-100)
    let reliabilityScore = 100;
    
    if (this.errorCount > 0) {
      reliabilityScore -= Math.min(50, this.errorCount * 10);
    }
    
    if (!this.metrics.system.isOnline) {
      reliabilityScore -= 30;
    }
    
    // User experience score (0-100)
    let userExperienceScore = 100;
    
    if (this.metrics.connection.dataFreshness > this.thresholds.connection.maxDataStaleness) {
      userExperienceScore -= 20;
    }
    
    if (this.warningCount > 5) {
      userExperienceScore -= 15;
    }
    
    // Overall score (weighted average)
    const overallScore = Math.round(
      (performanceScore * 0.4 + reliabilityScore * 0.4 + userExperienceScore * 0.2)
    );
    
    this.metrics.scores = {
      overall: Math.max(0, overallScore),
      performance: Math.max(0, performanceScore),
      reliability: Math.max(0, reliabilityScore),
      userExperience: Math.max(0, userExperienceScore)
    };
  }

  private checkThresholds(): void {
    // Check performance thresholds
    if (this.metrics.performance.renderTime > this.thresholds.performance.maxRenderTime) {
      this.createAlert({
        type: 'performance',
        severity: 'medium',
        title: 'Slow Rendering',
        message: `Render time (${this.metrics.performance.renderTime}ms) exceeds threshold`,
        metric: 'renderTime',
        currentValue: this.metrics.performance.renderTime,
        threshold: this.thresholds.performance.maxRenderTime,
        suggestions: [
          'Close unnecessary browser tabs',
          'Disable browser extensions',
          'Reduce dashboard complexity'
        ]
      });
    }

    // Check memory usage
    if (this.metrics.performance.memoryUsage > this.thresholds.performance.maxMemoryUsage) {
      this.createAlert({
        type: 'memory',
        severity: 'high',
        title: 'High Memory Usage',
        message: `Memory usage (${this.metrics.performance.memoryUsage}MB) is high`,
        metric: 'memoryUsage',
        currentValue: this.metrics.performance.memoryUsage,
        threshold: this.thresholds.performance.maxMemoryUsage,
        suggestions: [
          'Refresh the page to clear memory',
          'Close other browser tabs',
          'Reduce data retention period'
        ]
      });
    }

    // Check frame rate
    if (this.metrics.performance.frameRate < this.thresholds.performance.minFrameRate) {
      this.createAlert({
        type: 'performance',
        severity: 'medium',
        title: 'Low Frame Rate',
        message: `Frame rate (${this.metrics.performance.frameRate} FPS) is below optimal`,
        metric: 'frameRate',
        currentValue: this.metrics.performance.frameRate,
        threshold: this.thresholds.performance.minFrameRate,
        suggestions: [
          'Disable animations in settings',
          'Reduce chart complexity',
          'Close resource-intensive applications'
        ]
      });
    }
  }

  private createAlert(alertData: Omit<HealthAlert, 'id' | 'timestamp'>): void {
    // Check if similar alert already exists (avoid spam)
    const existingAlert = this.alerts.find(alert => 
      alert.type === alertData.type &&
      alert.metric === alertData.metric &&
      Date.now() - new Date(alert.timestamp).getTime() < 60000 // Within last minute
    );

    if (existingAlert) {
      return; // Don't create duplicate alerts
    }

    const alert: HealthAlert = {
      ...alertData,
      id: `alert_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      timestamp: new Date().toISOString()
    };

    this.alerts.push(alert);

    // Keep only last 50 alerts
    if (this.alerts.length > 50) {
      this.alerts = this.alerts.slice(-50);
    }

    // Notify listeners
    this.alertCallbacks.forEach(callback => {
      try {
        callback(alert);
      } catch (error) {
        console.error('Error in health alert callback:', error);
      }
    });
  }

  private getConnectionType(): string {
    if ('connection' in navigator) {
      const connection = (navigator as any).connection;
      return connection.effectiveType || connection.type || 'unknown';
    }
    return 'unknown';
  }

  private generateRecommendations(): string[] {
    const recommendations: string[] = [];
    const metrics = this.metrics;

    // Performance recommendations
    if (metrics.performance.renderTime > 20) {
      recommendations.push('Consider disabling animations to improve render performance');
    }

    if (metrics.performance.memoryUsage > 80) {
      recommendations.push('High memory usage detected - consider refreshing the page');
    }

    if (metrics.performance.frameRate < 30) {
      recommendations.push('Low frame rate detected - try closing other browser tabs');
    }

    // Connection recommendations
    if (!metrics.system.isOnline) {
      recommendations.push('No internet connection - dashboard will use cached data');
    }

    if (metrics.connection.dataFreshness > 60) {
      recommendations.push('Data is stale - check your connection or refresh the page');
    }

    // System recommendations
    if (metrics.system.availableMemory < 100) {
      recommendations.push('Low system memory - close unnecessary applications');
    }

    // Dashboard recommendations
    if (metrics.dashboard.errorCount > 5) {
      recommendations.push('Multiple errors detected - check browser console for details');
    }

    if (recommendations.length === 0) {
      recommendations.push('System is running optimally - no recommendations at this time');
    }

    return recommendations;
  }
}

// Export singleton instance
export const systemHealthMonitor = SystemHealthMonitor.getInstance();

// Export factory function for testing
export const createSystemHealthMonitor = () => new SystemHealthMonitor();