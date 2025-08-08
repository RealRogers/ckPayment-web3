import { 
  SubnetInfo, 
  SubnetHealthScore, 
  ICPTransactionData, 
  ICPMetricsData 
} from '@/types/dashboard';

/**
 * Subnet health alert levels
 */
export type AlertLevel = 'info' | 'warning' | 'critical';

/**
 * Subnet health alert
 */
export interface SubnetHealthAlert {
  id: string;
  subnetId: string;
  level: AlertLevel;
  type: 'uptime' | 'performance' | 'consensus' | 'node_health' | 'capacity';
  title: string;
  message: string;
  timestamp: string;
  acknowledged: boolean;
  resolvedAt?: string;
  metadata: {
    currentValue: number;
    threshold: number;
    trend: 'improving' | 'degrading' | 'stable';
    affectedNodes?: string[];
    estimatedImpact: 'low' | 'medium' | 'high';
  };
}

/**
 * Health monitoring configuration
 */
export interface HealthMonitorConfig {
  alertThresholds: {
    uptime: number; // minimum uptime percentage
    responseTime: number; // maximum response time in ms
    errorRate: number; // maximum error rate percentage
    consensusHealth: number; // minimum consensus health percentage
    nodeHealth: number; // minimum node health percentage
  };
  monitoringInterval: number; // ms
  alertCooldown: number; // ms between similar alerts
  enablePredictiveAlerts: boolean;
  enableCapacityMonitoring: boolean;
}

/**
 * Subnet Health Monitor Service
 * Monitors subnet health, generates alerts, and provides performance analysis
 */
export class SubnetHealthMonitor {
  private static instance: SubnetHealthMonitor;
  private config: HealthMonitorConfig;
  private subnets = new Map<string, SubnetInfo>();
  private healthHistory = new Map<string, SubnetHealthScore[]>();
  private alerts = new Map<string, SubnetHealthAlert[]>();
  private monitoringTimer: NodeJS.Timeout | null = null;
  private alertCallbacks = new Set<(alert: SubnetHealthAlert) => void>();

  constructor(config: HealthMonitorConfig) {
    this.config = config;
  }

  static getInstance(config?: HealthMonitorConfig): SubnetHealthMonitor {
    if (!SubnetHealthMonitor.instance) {
      SubnetHealthMonitor.instance = new SubnetHealthMonitor(
        config || DEFAULT_HEALTH_MONITOR_CONFIG
      );
    }
    return SubnetHealthMonitor.instance;
  }

  /**
   * Start health monitoring
   */
  startMonitoring(): void {
    if (this.monitoringTimer) {
      console.warn('Health monitoring already started');
      return;
    }

    console.log('Starting subnet health monitoring...');
    
    this.monitoringTimer = setInterval(() => {
      this.performHealthCheck();
    }, this.config.monitoringInterval);

    // Perform initial health check
    this.performHealthCheck();
  }

  /**
   * Stop health monitoring
   */
  stopMonitoring(): void {
    if (this.monitoringTimer) {
      clearInterval(this.monitoringTimer);
      this.monitoringTimer = null;
      console.log('Subnet health monitoring stopped');
    }
  }

  /**
   * Register subnet for monitoring
   */
  registerSubnet(subnet: SubnetInfo): void {
    this.subnets.set(subnet.id, subnet);
    
    // Initialize empty history
    if (!this.healthHistory.has(subnet.id)) {
      this.healthHistory.set(subnet.id, []);
    }
    if (!this.alerts.has(subnet.id)) {
      this.alerts.set(subnet.id, []);
    }

    console.log(`Registered subnet ${subnet.id} for health monitoring`);
  }

  /**
   * Update subnet health score
   */
  updateSubnetHealth(subnetId: string, healthScore: SubnetHealthScore): void {
    const history = this.healthHistory.get(subnetId) || [];
    history.push(healthScore);
    
    // Keep only last 1000 entries
    if (history.length > 1000) {
      history.splice(0, history.length - 1000);
    }
    
    this.healthHistory.set(subnetId, history);
    
    // Check for alerts
    this.checkHealthAlerts(subnetId, healthScore);
  }

  /**
   * Get current health status for all subnets
   */
  getHealthStatus(): Map<string, SubnetHealthScore> {
    const status = new Map<string, SubnetHealthScore>();
    
    this.healthHistory.forEach((history, subnetId) => {
      if (history.length > 0) {
        status.set(subnetId, history[history.length - 1]);
      }
    });
    
    return status;
  }

  /**
   * Get active alerts for a subnet
   */
  getActiveAlerts(subnetId?: string): SubnetHealthAlert[] {
    if (subnetId) {
      return (this.alerts.get(subnetId) || []).filter(alert => !alert.acknowledged);
    }
    
    const allAlerts: SubnetHealthAlert[] = [];
    this.alerts.forEach(alerts => {
      allAlerts.push(...alerts.filter(alert => !alert.acknowledged));
    });
    
    return allAlerts.sort((a, b) => b.timestamp.localeCompare(a.timestamp));
  }

  /**
   * Subscribe to health alerts
   */
  onAlert(callback: (alert: SubnetHealthAlert) => void): () => void {
    this.alertCallbacks.add(callback);
    return () => this.alertCallbacks.delete(callback);
  }

  // ===== PRIVATE METHODS =====

  private performHealthCheck(): void {
    this.subnets.forEach((subnet, subnetId) => {
      try {
        // In a real implementation, this would fetch actual health data
        const healthScore = this.calculateMockHealthScore(subnetId);
        this.updateSubnetHealth(subnetId, healthScore);
      } catch (error) {
        console.error(`Health check failed for subnet ${subnetId}:`, error);
      }
    });
  }

  private checkHealthAlerts(subnetId: string, healthScore: SubnetHealthScore): void {
    const alerts: SubnetHealthAlert[] = [];

    // Check uptime alert
    if (healthScore.uptime < this.config.alertThresholds.uptime) {
      alerts.push(this.createAlert(subnetId, 'uptime', 'critical', 
        'Low Subnet Uptime',
        `Subnet uptime is ${healthScore.uptime.toFixed(1)}%, below threshold of ${this.config.alertThresholds.uptime}%`,
        healthScore.uptime,
        this.config.alertThresholds.uptime
      ));
    }

    // Check performance alerts
    if (healthScore.performance < 70) {
      alerts.push(this.createAlert(subnetId, 'performance', 'warning',
        'Poor Subnet Performance',
        `Subnet performance score is ${healthScore.performance}, indicating potential issues`,
        healthScore.performance,
        70
      ));
    }

    // Add alerts and notify callbacks
    alerts.forEach(alert => {
      this.addAlert(subnetId, alert);
      this.alertCallbacks.forEach(callback => {
        try {
          callback(alert);
        } catch (error) {
          console.error('Error in alert callback:', error);
        }
      });
    });
  }

  private createAlert(
    subnetId: string,
    type: SubnetHealthAlert['type'],
    level: AlertLevel,
    title: string,
    message: string,
    currentValue: number,
    threshold: number
  ): SubnetHealthAlert {
    return {
      id: `alert_${subnetId}_${type}_${Date.now()}`,
      subnetId,
      level,
      type,
      title,
      message,
      timestamp: new Date().toISOString(),
      acknowledged: false,
      metadata: {
        currentValue,
        threshold,
        trend: 'stable',
        estimatedImpact: level === 'critical' ? 'high' : 'medium'
      }
    };
  }

  private addAlert(subnetId: string, alert: SubnetHealthAlert): void {
    const alerts = this.alerts.get(subnetId) || [];
    
    // Check for cooldown period
    const recentSimilarAlert = alerts.find(a => 
      a.type === alert.type && 
      !a.acknowledged &&
      Date.now() - new Date(a.timestamp).getTime() < this.config.alertCooldown
    );

    if (!recentSimilarAlert) {
      alerts.push(alert);
      this.alerts.set(subnetId, alerts);
      console.log(`Alert created for subnet ${subnetId}: ${alert.title}`);
    }
  }

  private calculateMockHealthScore(subnetId: string): SubnetHealthScore {
    // Generate realistic mock health scores
    const uptime = 95 + Math.random() * 5; // 95-100%
    const responseTime = 70 + Math.random() * 25; // 70-95
    const throughput = 60 + Math.random() * 35; // 60-95
    const errorRate = 80 + Math.random() * 20; // 80-100
    const consensusHealth = 90 + Math.random() * 10; // 90-100
    const nodeHealth = 95 + Math.random() * 5; // 95-100

    const performance = (responseTime + throughput) / 2;
    const reliability = (errorRate + consensusHealth + nodeHealth) / 3;
    const overall = (uptime + performance + reliability) / 3;

    return {
      overall: Math.round(overall),
      uptime: Math.round(uptime),
      performance: Math.round(performance),
      reliability: Math.round(reliability),
      factors: {
        responseTime: Math.round(responseTime),
        throughput: Math.round(throughput),
        errorRate: Math.round(errorRate),
        consensusHealth: Math.round(consensusHealth),
        nodeHealth: Math.round(nodeHealth)
      },
      recommendations: []
    };
  }
}

/**
 * Default health monitoring configuration
 */
export const DEFAULT_HEALTH_MONITOR_CONFIG: HealthMonitorConfig = {
  alertThresholds: {
    uptime: 95, // 95%
    responseTime: 1000, // 1000ms
    errorRate: 5, // 5%
    consensusHealth: 90, // 90%
    nodeHealth: 95 // 95%
  },
  monitoringInterval: 60000, // 1 minute
  alertCooldown: 300000, // 5 minutes
  enablePredictiveAlerts: true,
  enableCapacityMonitoring: true
};

// Export singleton instance
export const subnetHealthMonitor = SubnetHealthMonitor.getInstance();