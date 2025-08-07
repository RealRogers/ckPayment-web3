import { 
  MetricsData, 
  ConfigData, 
  WebhookData, 
  ChartDataPoint,
  ApiKeyConfig,
  EndpointConfig,
  WebhookLogEntry,
  AuditLogEntry,
  IPWhitelistEntry,
  DashboardData
} from '@/types/dashboard';

/**
 * Mock Data Generation Service
 * Provides realistic mock data for dashboard demonstration
 */
export class MockDataService {
  private static instance: MockDataService;
  private baseMetrics: Partial<MetricsData>;
  private lastGenerated: number = 0;
  private readonly CACHE_DURATION = 5000; // 5 seconds

  constructor() {
    // Initialize base metrics for consistent variations
    this.baseMetrics = {
      payments: 1247 + Math.floor(Math.random() * 500),
      errors: 23 + Math.floor(Math.random() * 20),
      transactions: 1270 + Math.floor(Math.random() * 520),
      revenue: 45678.90 + Math.random() * 10000,
      conversionRate: 3.2 + Math.random() * 2,
      activeUsers: 892 + Math.floor(Math.random() * 200),
    };
  }

  static getInstance(): MockDataService {
    if (!MockDataService.instance) {
      MockDataService.instance = new MockDataService();
    }
    return MockDataService.instance;
  }

  /**
   * Generate realistic metrics data with time-based variations
   */
  generateMetricsData(): MetricsData {
    const now = Date.now();
    
    // Add some variation to base metrics over time
    const timeVariation = Math.sin(now / 100000) * 0.1 + 1; // Slow oscillation
    const randomVariation = Math.random() * 0.2 + 0.9; // 90-110% variation
    
    const payments = Math.round((this.baseMetrics.payments || 1247) * timeVariation * randomVariation);
    const errors = Math.round((this.baseMetrics.errors || 23) * randomVariation);
    const transactions = payments + errors + Math.floor(Math.random() * 50);
    const revenue = (this.baseMetrics.revenue || 45678.90) * timeVariation * randomVariation;
    const activeUsers = Math.round((this.baseMetrics.activeUsers || 892) * timeVariation * randomVariation);
    
    return {
      payments,
      errors,
      transactions,
      revenue,
      conversionRate: Math.max(1.5, Math.min(6.0, (this.baseMetrics.conversionRate || 3.2) * randomVariation)),
      activeUsers,
      chartData: this.generateChartData(payments, errors, revenue, activeUsers),
      trends: {
        paymentsChange: (Math.random() - 0.5) * 20, // -10% to +10%
        errorsChange: (Math.random() - 0.5) * 10, // -5% to +5%
        revenueChange: (Math.random() - 0.5) * 15, // -7.5% to +7.5%
        usersChange: (Math.random() - 0.5) * 25, // -12.5% to +12.5%
      }
    };
  }

  /**
   * Generate realistic chart data for the last 30 days
   */
  private generateChartData(basePayments: number, baseErrors: number, baseRevenue: number, baseUsers: number): ChartDataPoint[] {
    const data: ChartDataPoint[] = [];
    const now = new Date();
    
    for (let i = 29; i >= 0; i--) {
      const date = new Date(now);
      date.setDate(date.getDate() - i);
      
      // Create realistic daily variations
      const dayOfWeek = date.getDay();
      const isWeekend = dayOfWeek === 0 || dayOfWeek === 6;
      const weekendMultiplier = isWeekend ? 0.7 : 1.0; // Lower activity on weekends
      
      // Add some trend over time (slight growth)
      const trendMultiplier = 1 + (29 - i) * 0.002; // 0.2% growth per day
      
      // Random daily variation
      const randomMultiplier = Math.random() * 0.4 + 0.8; // 80-120% of base
      
      const dailyMultiplier = weekendMultiplier * trendMultiplier * randomMultiplier;
      
      data.push({
        date: date.toISOString().split('T')[0],
        payments: Math.round((basePayments / 30) * dailyMultiplier),
        errors: Math.round((baseErrors / 30) * dailyMultiplier * (Math.random() * 0.5 + 0.75)),
        revenue: (baseRevenue / 30) * dailyMultiplier,
        users: Math.round((baseUsers / 30) * dailyMultiplier),
        timestamp: date.getTime(),
      });
    }
    
    return data;
  }

  /**
   * Generate mock configuration data
   */
  generateConfigData(): ConfigData {
    return {
      apiKeys: this.generateApiKeys(),
      canisterEndpoints: this.generateEndpoints(),
      notifications: {
        email: {
          enabled: true,
          address: 'developer@example.com',
          events: ['payment_completed', 'payment_failed', 'api_error'],
          verified: true,
        },
        webhook: {
          enabled: false,
          url: 'https://api.example.com/webhooks/notifications',
          events: ['payment_completed', 'webhook_failed'],
          secret: 'wh_secret_' + Math.random().toString(36).substring(7),
        },
        sms: {
          enabled: false,
          number: '+1234567890',
          events: ['security_alert'],
          verified: false,
        },
      },
      security: {
        twoFactorAuth: {
          enabled: Math.random() > 0.5,
          method: '2fa_app',
          backupCodes: Array.from({ length: 8 }, () => 
            Math.random().toString(36).substring(2, 8).toUpperCase()
          ),
        },
        ipWhitelist: {
          enabled: Math.random() > 0.7,
          addresses: this.generateIPWhitelist(),
        },
        sessionTimeout: 3600000, // 1 hour
        auditLog: {
          enabled: true,
          retentionDays: 90,
          events: this.generateAuditLog(),
        },
      },
      lastUpdated: new Date().toISOString(),
    };
  }

  /**
   * Generate mock API keys
   */
  private generateApiKeys(): ApiKeyConfig[] {
    const environments = ['development', 'staging', 'production'] as const;
    const permissions = ['read_metrics', 'write_config', 'manage_webhooks', 'admin_access', 'read_logs'] as const;
    const statuses = ['active', 'inactive', 'expired'] as const;
    
    return Array.from({ length: Math.floor(Math.random() * 5) + 3 }, (_, i) => {
      const env = environments[Math.floor(Math.random() * environments.length)];
      const createdDate = new Date(Date.now() - Math.random() * 90 * 24 * 60 * 60 * 1000);
      const lastUsedDate = new Date(Date.now() - Math.random() * 7 * 24 * 60 * 60 * 1000);
      
      return {
        id: `key_${Math.random().toString(36).substring(2, 10)}`,
        name: `${env.charAt(0).toUpperCase() + env.slice(1)} API Key ${i + 1}`,
        key: `ck_${env}_${Math.random().toString(36).substring(2, 20)}`,
        environment: env,
        createdAt: createdDate.toISOString(),
        lastUsed: lastUsedDate.toISOString(),
        permissions: permissions.slice(0, Math.floor(Math.random() * permissions.length) + 1),
        status: statuses[Math.floor(Math.random() * statuses.length)],
      };
    });
  }

  /**
   * Generate mock canister endpoints
   */
  private generateEndpoints(): EndpointConfig[] {
    const environments = ['development', 'staging', 'production'] as const;
    const statuses = ['active', 'inactive', 'error', 'testing'] as const;
    
    const baseEndpoints = [
      { name: 'Main Canister', path: 'main' },
      { name: 'Payment Processor', path: 'payments' },
      { name: 'User Management', path: 'users' },
      { name: 'Analytics Engine', path: 'analytics' },
    ];
    
    return baseEndpoints.flatMap(endpoint => 
      environments.map(env => ({
        id: `endpoint_${endpoint.path}_${env}`,
        name: `${endpoint.name} (${env})`,
        url: `https://${endpoint.path}-${env}.ic0.app`,
        environment: env,
        status: statuses[Math.floor(Math.random() * statuses.length)],
        lastChecked: new Date(Date.now() - Math.random() * 60 * 60 * 1000).toISOString(),
        responseTime: Math.random() * 1000 + 100, // 100-1100ms
        version: `v${Math.floor(Math.random() * 3) + 1}.${Math.floor(Math.random() * 10)}.${Math.floor(Math.random() * 10)}`,
      }))
    );
  }

  /**
   * Generate mock IP whitelist entries
   */
  private generateIPWhitelist(): IPWhitelistEntry[] {
    const ips = [
      '192.168.1.100',
      '10.0.0.50',
      '203.0.113.25',
      '198.51.100.75',
    ];
    
    return ips.map((ip, i) => ({
      id: `ip_${i + 1}`,
      address: ip,
      description: `Office Network ${i + 1}`,
      addedAt: new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000).toISOString(),
      lastUsed: Math.random() > 0.3 ? new Date(Date.now() - Math.random() * 7 * 24 * 60 * 60 * 1000).toISOString() : undefined,
    }));
  }

  /**
   * Generate mock audit log entries
   */
  private generateAuditLog(): AuditLogEntry[] {
    const actions = [
      'API key created',
      'Configuration updated',
      'Webhook created',
      'User login',
      'Password changed',
      'Webhook deleted',
      'Endpoint tested',
    ];
    
    const users = ['john.doe@example.com', 'jane.smith@example.com', 'admin@example.com'];
    const ips = ['192.168.1.100', '10.0.0.50', '203.0.113.25'];
    
    return Array.from({ length: Math.floor(Math.random() * 20) + 10 }, (_, i) => ({
      id: `audit_${i + 1}`,
      timestamp: new Date(Date.now() - Math.random() * 7 * 24 * 60 * 60 * 1000).toISOString(),
      action: actions[Math.floor(Math.random() * actions.length)],
      user: users[Math.floor(Math.random() * users.length)],
      ip: ips[Math.floor(Math.random() * ips.length)],
      details: {
        userAgent: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36',
        resource: Math.random() > 0.5 ? 'webhook_123' : 'api_key_456',
      },
    }));
  }

  /**
   * Generate mock webhook data
   */
  generateWebhooksData(): WebhookData[] {
    const events = ['payment.completed', 'payment.failed', 'user.created', 'transaction.created'] as const;
    const statuses = ['active', 'inactive', 'error', 'paused'] as const;
    
    const webhookNames = [
      'Payment Notifications',
      'User Registration Hook',
      'Transaction Logger',
      'Error Reporting',
      'Analytics Tracker',
      'Backup System',
    ];
    
    return Array.from({ length: Math.floor(Math.random() * 4) + 3 }, (_, i) => {
      const status = statuses[Math.floor(Math.random() * statuses.length)];
      const createdDate = new Date(Date.now() - Math.random() * 60 * 24 * 60 * 60 * 1000);
      const lastTriggered = new Date(Date.now() - Math.random() * 24 * 60 * 60 * 1000);
      
      return {
        id: `webhook_${Math.random().toString(36).substring(2, 10)}`,
        name: webhookNames[i] || `Webhook ${i + 1}`,
        url: `https://api.example${i + 1}.com/webhooks/receive`,
        events: events.slice(0, Math.floor(Math.random() * events.length) + 1),
        status,
        lastTriggered: lastTriggered.toISOString(),
        successRate: Math.random() * 30 + 70, // 70-100%
        responseTime: Math.random() * 500 + 100, // 100-600ms
        createdAt: createdDate.toISOString(),
        description: `Webhook for handling ${webhookNames[i]?.toLowerCase() || 'various events'}`,
        headers: {
          'Content-Type': 'application/json',
          'X-API-Key': `key_${Math.random().toString(36).substring(2, 10)}`,
        },
        retryConfig: {
          maxRetries: Math.floor(Math.random() * 3) + 3, // 3-5 retries
          retryDelay: Math.floor(Math.random() * 2000) + 1000, // 1-3 seconds
        },
        logs: this.generateWebhookLogs(),
      };
    });
  }

  /**
   * Generate mock webhook log entries
   */
  private generateWebhookLogs(): WebhookLogEntry[] {
    const events = ['payment.completed', 'payment.failed', 'user.created'];
    const statuses = ['success', 'failed', 'retry'] as const;
    const responseCodes = [200, 201, 400, 404, 500, 502, 503];
    
    return Array.from({ length: Math.floor(Math.random() * 15) + 5 }, (_, i) => {
      const status = statuses[Math.floor(Math.random() * statuses.length)];
      const responseCode = responseCodes[Math.floor(Math.random() * responseCodes.length)];
      
      return {
        id: `log_${i + 1}`,
        timestamp: new Date(Date.now() - Math.random() * 7 * 24 * 60 * 60 * 1000).toISOString(),
        event: events[Math.floor(Math.random() * events.length)],
        status,
        responseCode: status === 'success' ? 200 : responseCode,
        responseTime: Math.random() * 1000 + 50,
        error: status === 'failed' ? 'Connection timeout' : undefined,
        payload: {
          id: `txn_${Math.random().toString(36).substring(2, 10)}`,
          amount: Math.random() * 1000 + 10,
          currency: 'USD',
          timestamp: new Date().toISOString(),
        },
      };
    });
  }

  /**
   * Generate complete dashboard data
   */
  generateDashboardData(): DashboardData {
    return {
      metrics: this.generateMetricsData(),
      config: this.generateConfigData(),
      webhooks: this.generateWebhooksData(),
      lastRefreshed: new Date().toISOString(),
    };
  }

  /**
   * Add realistic delays to simulate network requests
   */
  async simulateNetworkDelay(minMs: number = 500, maxMs: number = 2000): Promise<void> {
    const delay = Math.random() * (maxMs - minMs) + minMs;
    return new Promise(resolve => setTimeout(resolve, delay));
  }

  /**
   * Simulate occasional network errors for testing error handling
   */
  simulateNetworkError(errorRate: number = 0.1): void {
    if (Math.random() < errorRate) {
      const errors = [
        'Network connection failed',
        'Request timeout',
        'Service temporarily unavailable',
        'Rate limit exceeded',
      ];
      throw new Error(errors[Math.floor(Math.random() * errors.length)]);
    }
  }

  /**
   * Update base metrics to create realistic data evolution
   */
  updateBaseMetrics(): void {
    const now = Date.now();
    if (now - this.lastGenerated > this.CACHE_DURATION) {
      // Gradually evolve the base metrics
      this.baseMetrics.payments = (this.baseMetrics.payments || 1247) + Math.floor(Math.random() * 10 - 5);
      this.baseMetrics.errors = Math.max(0, (this.baseMetrics.errors || 23) + Math.floor(Math.random() * 4 - 2));
      this.baseMetrics.revenue = (this.baseMetrics.revenue || 45678.90) + Math.random() * 1000 - 500;
      this.baseMetrics.activeUsers = (this.baseMetrics.activeUsers || 892) + Math.floor(Math.random() * 20 - 10);
      
      this.lastGenerated = now;
    }
  }
}

// Export singleton instance
export const mockDataService = MockDataService.getInstance();

// Export factory function for testing
export const createMockDataService = () => new MockDataService();