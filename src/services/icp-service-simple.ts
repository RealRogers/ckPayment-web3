import { 
  MetricsData, 
  ConfigData, 
  WebhookData, 
  DashboardError 
} from '@/types/dashboard';
import { mockDataService } from './mock-data';

/**
 * Simplified ICP Service that uses mock data
 * This ensures the dashboard works immediately without requiring ICP setup
 */
export class ICPService {
  private config: {
    canisterId?: string;
    timeout?: number;
    retryAttempts?: number;
  };

  constructor(config: { canisterId?: string; timeout?: number; retryAttempts?: number } = {}) {
    this.config = {
      canisterId: 'demo-canister',
      timeout: 10000,
      retryAttempts: 3,
      ...config
    };
  }

  /**
   * Get dashboard statistics (using mock data for now)
   */
  async getStats(): Promise<MetricsData> {
    // Simulate network delay
    await mockDataService.simulateNetworkDelay(500, 1500);
    
    // For demo purposes, always return mock data
    return mockDataService.generateMetricsData();
  }

  /**
   * Get configuration data (using mock data for now)
   */
  async getConfig(): Promise<ConfigData> {
    // Simulate network delay
    await mockDataService.simulateNetworkDelay(300, 1000);
    
    // For demo purposes, always return mock data
    return mockDataService.generateConfigData();
  }

  /**
   * Get webhooks data (using mock data for now)
   */
  async getWebhooks(): Promise<WebhookData[]> {
    // Simulate network delay
    await mockDataService.simulateNetworkDelay(400, 1200);
    
    // For demo purposes, always return mock data
    return mockDataService.generateWebhooksData();
  }

  /**
   * Update configuration (simulated)
   */
  async updateConfig(config: Partial<ConfigData>): Promise<void> {
    await mockDataService.simulateNetworkDelay(800, 1500);
    // In a real implementation, this would update the canister
    console.log('Configuration updated:', config);
  }

  /**
   * Create a new webhook (simulated)
   */
  async createWebhook(webhook: Omit<WebhookData, 'id' | 'createdAt' | 'logs'>): Promise<WebhookData> {
    await mockDataService.simulateNetworkDelay(600, 1200);
    
    // Generate a new webhook with mock data
    return {
      ...webhook,
      id: `webhook_${Math.random().toString(36).substring(2, 10)}`,
      createdAt: new Date().toISOString(),
      logs: [],
    };
  }

  /**
   * Update an existing webhook (simulated)
   */
  async updateWebhook(id: string, webhook: Partial<WebhookData>): Promise<void> {
    await mockDataService.simulateNetworkDelay(500, 1000);
    console.log('Webhook updated:', id, webhook);
  }

  /**
   * Delete a webhook (simulated)
   */
  async deleteWebhook(id: string): Promise<void> {
    await mockDataService.simulateNetworkDelay(300, 800);
    console.log('Webhook deleted:', id);
  }

  /**
   * Test connection (always returns true for demo)
   */
  async testConnection(): Promise<boolean> {
    await mockDataService.simulateNetworkDelay(200, 500);
    return true;
  }
}

// Export a default instance
export const icpService = new ICPService();

// Export factory function for custom configurations
export const createICPService = (config: { canisterId?: string; timeout?: number; retryAttempts?: number }) => 
  new ICPService(config);