/**
 * Deployment Monitoring Service
 * Monitors deployment health and triggers rollback if needed
 */

export interface DeploymentMetrics {
  version: string;
  deploymentTime: Date;
  errorRate: number;
  responseTime: number;
  userSatisfaction: number;
  crashRate: number;
  memoryUsage: number;
  cpuUsage: number;
}

export interface HealthCheck {
  name: string;
  status: 'healthy' | 'degraded' | 'unhealthy';
  responseTime: number;
  error?: string;
  timestamp: Date;
}

export interface DeploymentAlert {
  level: 'info' | 'warning' | 'error' | 'critical';
  message: string;
  metric: string;
  value: number;
  threshold: number;
  timestamp: Date;
}

export class DeploymentMonitor {
  private metrics: DeploymentMetrics;
  private healthChecks: Map<string, HealthCheck> = new Map();
  private alertThresholds = {
    errorRate: 5, // 5%
    responseTime: 2000, // 2 seconds
    crashRate: 1, // 1%
    memoryUsage: 80, // 80%
    cpuUsage: 80, // 80%
  };
  private alertCallbacks: ((alert: DeploymentAlert) => void)[] = [];
  private rollbackCallbacks: (() => void)[] = [];
  
  constructor() {
    this.metrics = {
      version: process.env.REACT_APP_VERSION || 'unknown',
      deploymentTime: new Date(),
      errorRate: 0,
      responseTime: 0,
      userSatisfaction: 100,
      crashRate: 0,
      memoryUsage: 0,
      cpuUsage: 0,
    };
    
    this.startMonitoring();
  }
  
  private startMonitoring(): void {
    // Monitor every 30 seconds
    setInterval(() => {
      this.collectMetrics();
      this.runHealthChecks();
      this.evaluateAlerts();
    }, 30000);
    
    // Initial health check
    setTimeout(() => {
      this.runHealthChecks();
    }, 5000);
  }
  
  private async collectMetrics(): Promise<void> {
    try {
      // Collect performance metrics
      const performanceEntries = performance.getEntriesByType('navigation');
      if (performanceEntries.length > 0) {
        const navigation = performanceEntries[0] as PerformanceNavigationTiming;
        this.metrics.responseTime = navigation.loadEventEnd - navigation.loadEventStart;
      }
      
      // Collect memory usage (if available)
      if ('memory' in performance) {
        const memory = (performance as any).memory;
        this.metrics.memoryUsage = (memory.usedJSHeapSize / memory.jsHeapSizeLimit) * 100;
      }
      
      // Send metrics to monitoring service
      await this.sendMetrics();
      
    } catch (error) {
      console.error('Failed to collect deployment metrics:', error);
    }
  }
  
  private async runHealthChecks(): Promise<void> {
    const checks = [
      this.checkWebSocketHealth(),
      this.checkAPIHealth(),
      this.checkDatabaseHealth(),
      this.checkExternalServicesHealth(),
    ];
    
    const results = await Promise.allSettled(checks);
    
    results.forEach((result, index) => {
      if (result.status === 'fulfilled') {
        const checkName = ['websocket', 'api', 'database', 'external'][index];
        this.healthChecks.set(checkName, result.value);
      }
    });
  }
  
  private async checkWebSocketHealth(): Promise<HealthCheck> {
    const startTime = performance.now();
    
    try {
      // Test WebSocket connection
      const ws = new WebSocket(process.env.REACT_APP_WEBSOCKET_URL || '');
      
      return new Promise((resolve) => {
        const timeout = setTimeout(() => {
          ws.close();
          resolve({
            name: 'websocket',
            status: 'unhealthy',
            responseTime: performance.now() - startTime,
            error: 'Connection timeout',
            timestamp: new Date(),
          });
        }, 5000);
        
        ws.onopen = () => {
          clearTimeout(timeout);
          ws.close();
          resolve({
            name: 'websocket',
            status: 'healthy',
            responseTime: performance.now() - startTime,
            timestamp: new Date(),
          });
        };
        
        ws.onerror = () => {
          clearTimeout(timeout);
          resolve({
            name: 'websocket',
            status: 'unhealthy',
            responseTime: performance.now() - startTime,
            error: 'Connection failed',
            timestamp: new Date(),
          });
        };
      });
    } catch (error) {
      return {
        name: 'websocket',
        status: 'unhealthy',
        responseTime: performance.now() - startTime,
        error: error instanceof Error ? error.message : 'Unknown error',
        timestamp: new Date(),
      };
    }
  }
  
  private async checkAPIHealth(): Promise<HealthCheck> {
    const startTime = performance.now();
    
    try {
      const response = await fetch('/api/health', {
        method: 'GET',
        timeout: 5000,
      } as any);
      
      const responseTime = performance.now() - startTime;
      
      if (response.ok) {
        return {
          name: 'api',
          status: 'healthy',
          responseTime,
          timestamp: new Date(),
        };
      } else {
        return {
          name: 'api',
          status: 'degraded',
          responseTime,
          error: `HTTP ${response.status}`,
          timestamp: new Date(),
        };
      }
    } catch (error) {
      return {
        name: 'api',
        status: 'unhealthy',
        responseTime: performance.now() - startTime,
        error: error instanceof Error ? error.message : 'Unknown error',
        timestamp: new Date(),
      };
    }
  }
  
  private async checkDatabaseHealth(): Promise<HealthCheck> {
    const startTime = performance.now();
    
    try {
      // Check if localStorage is accessible
      localStorage.setItem('health-check', 'test');
      localStorage.removeItem('health-check');
      
      return {
        name: 'database',
        status: 'healthy',
        responseTime: performance.now() - startTime,
        timestamp: new Date(),
      };
    } catch (error) {
      return {
        name: 'database',
        status: 'unhealthy',
        responseTime: performance.now() - startTime,
        error: 'Storage not accessible',
        timestamp: new Date(),
      };
    }
  }
  
  private async checkExternalServicesHealth(): Promise<HealthCheck> {
    const startTime = performance.now();
    
    try {
      // Check external dependencies
      const checks = await Promise.allSettled([
        fetch('/api/canister/health'),
        fetch('/api/subnet/health'),
      ]);
      
      const failedChecks = checks.filter(check => check.status === 'rejected').length;
      const responseTime = performance.now() - startTime;
      
      if (failedChecks === 0) {
        return {
          name: 'external',
          status: 'healthy',
          responseTime,
          timestamp: new Date(),
        };
      } else if (failedChecks < checks.length) {
        return {
          name: 'external',
          status: 'degraded',
          responseTime,
          error: `${failedChecks} services unavailable`,
          timestamp: new Date(),
        };
      } else {
        return {
          name: 'external',
          status: 'unhealthy',
          responseTime,
          error: 'All external services unavailable',
          timestamp: new Date(),
        };
      }
    } catch (error) {
      return {
        name: 'external',
        status: 'unhealthy',
        responseTime: performance.now() - startTime,
        error: error instanceof Error ? error.message : 'Unknown error',
        timestamp: new Date(),
      };
    }
  }
  
  private evaluateAlerts(): void {
    // Check error rate
    if (this.metrics.errorRate > this.alertThresholds.errorRate) {
      this.sendAlert({
        level: 'error',
        message: 'High error rate detected',
        metric: 'errorRate',
        value: this.metrics.errorRate,
        threshold: this.alertThresholds.errorRate,
        timestamp: new Date(),
      });
    }
    
    // Check response time
    if (this.metrics.responseTime > this.alertThresholds.responseTime) {
      this.sendAlert({
        level: 'warning',
        message: 'High response time detected',
        metric: 'responseTime',
        value: this.metrics.responseTime,
        threshold: this.alertThresholds.responseTime,
        timestamp: new Date(),
      });
    }
    
    // Check crash rate
    if (this.metrics.crashRate > this.alertThresholds.crashRate) {
      this.sendAlert({
        level: 'critical',
        message: 'High crash rate detected',
        metric: 'crashRate',
        value: this.metrics.crashRate,
        threshold: this.alertThresholds.crashRate,
        timestamp: new Date(),
      });
      
      // Consider rollback
      this.considerRollback();
    }
    
    // Check memory usage
    if (this.metrics.memoryUsage > this.alertThresholds.memoryUsage) {
      this.sendAlert({
        level: 'warning',
        message: 'High memory usage detected',
        metric: 'memoryUsage',
        value: this.metrics.memoryUsage,
        threshold: this.alertThresholds.memoryUsage,
        timestamp: new Date(),
      });
    }
    
    // Check health checks
    this.healthChecks.forEach((check) => {
      if (check.status === 'unhealthy') {
        this.sendAlert({
          level: 'error',
          message: `Health check failed: ${check.name}`,
          metric: check.name,
          value: 0,
          threshold: 1,
          timestamp: new Date(),
        });
      }
    });
  }
  
  private sendAlert(alert: DeploymentAlert): void {
    console.warn('Deployment Alert:', alert);
    
    this.alertCallbacks.forEach(callback => {
      try {
        callback(alert);
      } catch (error) {
        console.error('Alert callback failed:', error);
      }
    });
    
    // Send to external monitoring service
    this.sendAlertToService(alert);
  }
  
  private async sendAlertToService(alert: DeploymentAlert): Promise<void> {
    try {
      await fetch('/api/alerts', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(alert),
      });
    } catch (error) {
      console.error('Failed to send alert to service:', error);
    }
  }
  
  private considerRollback(): void {
    const unhealthyChecks = Array.from(this.healthChecks.values())
      .filter(check => check.status === 'unhealthy').length;
    
    const totalChecks = this.healthChecks.size;
    const unhealthyPercentage = (unhealthyChecks / totalChecks) * 100;
    
    // Trigger rollback if more than 50% of health checks are failing
    if (unhealthyPercentage > 50) {
      console.error('🚨 Critical deployment issues detected, triggering rollback...');
      
      this.sendAlert({
        level: 'critical',
        message: 'Automatic rollback triggered due to deployment issues',
        metric: 'healthChecks',
        value: unhealthyPercentage,
        threshold: 50,
        timestamp: new Date(),
      });
      
      this.triggerRollback();
    }
  }
  
  private triggerRollback(): void {
    this.rollbackCallbacks.forEach(callback => {
      try {
        callback();
      } catch (error) {
        console.error('Rollback callback failed:', error);
      }
    });
    
    // Redirect to rollback endpoint
    window.location.href = '/rollback';
  }
  
  private async sendMetrics(): Promise<void> {
    try {
      await fetch('/api/metrics', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(this.metrics),
      });
    } catch (error) {
      console.error('Failed to send metrics:', error);
    }
  }
  
  // Public methods
  public recordError(): void {
    // Increment error count and recalculate rate
    this.metrics.errorRate = Math.min(this.metrics.errorRate + 0.1, 100);
  }
  
  public recordCrash(): void {
    this.metrics.crashRate = Math.min(this.metrics.crashRate + 0.1, 100);
  }
  
  public getMetrics(): DeploymentMetrics {
    return { ...this.metrics };
  }
  
  public getHealthChecks(): HealthCheck[] {
    return Array.from(this.healthChecks.values());
  }
  
  public onAlert(callback: (alert: DeploymentAlert) => void): void {
    this.alertCallbacks.push(callback);
  }
  
  public onRollback(callback: () => void): void {
    this.rollbackCallbacks.push(callback);
  }
  
  public setAlertThreshold(metric: keyof typeof this.alertThresholds, value: number): void {
    this.alertThresholds[metric] = value;
  }
}

// Global instance
export const deploymentMonitor = new DeploymentMonitor();

// React hook for deployment status
export const useDeploymentStatus = () => {
  const [metrics, setMetrics] = React.useState(deploymentMonitor.getMetrics());
  const [healthChecks, setHealthChecks] = React.useState(deploymentMonitor.getHealthChecks());
  const [alerts, setAlerts] = React.useState<DeploymentAlert[]>([]);
  
  React.useEffect(() => {
    const updateStatus = () => {
      setMetrics(deploymentMonitor.getMetrics());
      setHealthChecks(deploymentMonitor.getHealthChecks());
    };
    
    const handleAlert = (alert: DeploymentAlert) => {
      setAlerts(prev => [...prev.slice(-9), alert]); // Keep last 10 alerts
    };
    
    deploymentMonitor.onAlert(handleAlert);
    
    const interval = setInterval(updateStatus, 5000);
    
    return () => {
      clearInterval(interval);
    };
  }, []);
  
  return {
    metrics,
    healthChecks,
    alerts,
    isHealthy: healthChecks.every(check => check.status === 'healthy'),
  };
};