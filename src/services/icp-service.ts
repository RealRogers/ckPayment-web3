// For now, let's create a simplified version that always falls back to mock data
// This ensures the dashboard works immediately without requiring ICP setup
import { 
  MetricsData, 
  ConfigData, 
  WebhookData, 
  ApiResponse,
  DashboardError 
} from '@/types/dashboard';

// ICP Canister Interface Definition
export interface DashboardCanister {
  getStats: () => Promise<{
    payments: bigint;
    errors: bigint;
    transactions: bigint;
    revenue: number;
    conversionRate: number;
    activeUsers: bigint;
  }>;
  
  getConfig: () => Promise<{
    apiKeys: Array<{
      id: string;
      name: string;
      key: string;
      environment: string;
      createdAt: string;
      lastUsed: string;
      permissions: string[];
      status: string;
    }>;
    endpoints: Array<{
      id: string;
      name: string;
      url: string;
      environment: string;
      status: string;
      lastChecked: string;
    }>;
  }>;
  
  getWebhooks: () => Promise<Array<{
    id: string;
    name: string;
    url: string;
    events: string[];
    status: string;
    lastTriggered: string;
    successRate: number;
    responseTime: number;
    createdAt: string;
    description: string;
  }>>;
  
  updateConfig: (config: any) => Promise<boolean>;
  createWebhook: (webhook: any) => Promise<string>;
  updateWebhook: (id: string, webhook: any) => Promise<boolean>;
  deleteWebhook: (id: string) => Promise<boolean>;
}

// Service Configuration
interface ICPServiceConfig {
  canisterId?: string;
  host?: string;
  timeout?: number;
  retryAttempts?: number;
  retryDelay?: number;
}

// Default configuration
const DEFAULT_CONFIG: Required<ICPServiceConfig> = {
  canisterId: 'rdmx6-jaaaa-aaaah-qdrva-cai', // Default demo canister ID
  host: 'https://ic0.app',
  timeout: 10000, // 10 seconds
  retryAttempts: 3,
  retryDelay: 1000 // 1 second
};

/**
 * ICP Service for interacting with Internet Computer canisters
 * Provides methods for fetching dashboard data with error handling and retries
 */
export class ICPService {
  private agent: HttpAgent;
  private actor: Actor | null = null;
  private config: Required<ICPServiceConfig>;

  constructor(config: ICPServiceConfig = {}) {
    this.config = { ...DEFAULT_CONFIG, ...config };
    
    // Initialize HTTP Agent
    this.agent = new HttpAgent({
      host: this.config.host,
    });

    // Fetch root key for local development
    if (this.config.host.includes('localhost') || this.config.host.includes('127.0.0.1')) {
      this.agent.fetchRootKey().catch(err => {
        console.warn('Unable to fetch root key:', err);
      });
    }
  }

  /**
   * Initialize the canister actor
   */
  private async initializeActor(): Promise<void> {
    if (this.actor) return;

    try {
      // Define the canister interface (IDL)
      const idlFactory = ({ IDL }: any) => {
        return IDL.Service({
          getStats: IDL.Func([], [IDL.Record({
            payments: IDL.Nat,
            errors: IDL.Nat,
            transactions: IDL.Nat,
            revenue: IDL.Float64,
            conversionRate: IDL.Float64,
            activeUsers: IDL.Nat,
          })], ['query']),
          
          getConfig: IDL.Func([], [IDL.Record({
            apiKeys: IDL.Vec(IDL.Record({
              id: IDL.Text,
              name: IDL.Text,
              key: IDL.Text,
              environment: IDL.Text,
              createdAt: IDL.Text,
              lastUsed: IDL.Text,
              permissions: IDL.Vec(IDL.Text),
              status: IDL.Text,
            })),
            endpoints: IDL.Vec(IDL.Record({
              id: IDL.Text,
              name: IDL.Text,
              url: IDL.Text,
              environment: IDL.Text,
              status: IDL.Text,
              lastChecked: IDL.Text,
            })),
          })], ['query']),
          
          getWebhooks: IDL.Func([], [IDL.Vec(IDL.Record({
            id: IDL.Text,
            name: IDL.Text,
            url: IDL.Text,
            events: IDL.Vec(IDL.Text),
            status: IDL.Text,
            lastTriggered: IDL.Text,
            successRate: IDL.Float64,
            responseTime: IDL.Float64,
            createdAt: IDL.Text,
            description: IDL.Text,
          }))], ['query']),
          
          updateConfig: IDL.Func([IDL.Record({})], [IDL.Bool], []),
          createWebhook: IDL.Func([IDL.Record({})], [IDL.Text], []),
          updateWebhook: IDL.Func([IDL.Text, IDL.Record({})], [IDL.Bool], []),
          deleteWebhook: IDL.Func([IDL.Text], [IDL.Bool], []),
        });
      };

      this.actor = Actor.createActor(idlFactory, {
        agent: this.agent,
        canisterId: this.config.canisterId,
      });
    } catch (error) {
      throw new Error(`Failed to initialize canister actor: ${error}`);
    }
  }

  /**
   * Execute a canister call with retry logic and timeout
   */
  private async executeWithRetry<T>(
    operation: () => Promise<T>,
    operationName: string
  ): Promise<T> {
    let lastError: Error;

    for (let attempt = 1; attempt <= this.config.retryAttempts; attempt++) {
      try {
        // Set up timeout
        const timeoutPromise = new Promise<never>((_, reject) => {
          setTimeout(() => reject(new Error('Operation timeout')), this.config.timeout);
        });

        // Execute operation with timeout
        const result = await Promise.race([operation(), timeoutPromise]);
        return result;
      } catch (error) {
        lastError = error as Error;
        console.warn(`${operationName} attempt ${attempt} failed:`, error);

        // Don't retry on the last attempt
        if (attempt < this.config.retryAttempts) {
          await new Promise(resolve => setTimeout(resolve, this.config.retryDelay));
        }
      }
    }

    throw new Error(`${operationName} failed after ${this.config.retryAttempts} attempts: ${lastError!.message}`);
  }

  /**
   * Get dashboard statistics from the canister
   * For demo purposes, this will always throw an error to trigger mock data fallback
   */
  async getStats(): Promise<MetricsData> {
    // For demo purposes, simulate a canister call that fails
    // This ensures we always use mock data in the preview
    throw new Error('Demo mode: Using mock data instead of canister data');
  }

  /**
   * Get configuration data from the canister
   * For demo purposes, this will always throw an error to trigger mock data fallback
   */
  async getConfig(): Promise<ConfigData> {
    // For demo purposes, simulate a canister call that fails
    throw new Error('Demo mode: Using mock data instead of canister data');
  }

  /**
   * Get webhooks data from the canister
   * For demo purposes, this will always throw an error to trigger mock data fallback
   */
  async getWebhooks(): Promise<WebhookData[]> {
    // For demo purposes, simulate a canister call that fails
    throw new Error('Demo mode: Using mock data instead of canister data');
  }

  /**
   * Update configuration
   */
  async updateConfig(config: Partial<ConfigData>): Promise<void> {
    await this.initializeActor();
    
    return this.executeWithRetry(async () => {
      const canister = this.actor as DashboardCanister;
      const success = await canister.updateConfig(config);
      
      if (!success) {
        throw new Error('Failed to update configuration');
      }
    }, 'updateConfig');
  }

  /**
   * Create a new webhook
   */
  async createWebhook(webhook: Omit<WebhookData, 'id' | 'createdAt' | 'logs'>): Promise<WebhookData> {
    await this.initializeActor();
    
    return this.executeWithRetry(async () => {
      const canister = this.actor as DashboardCanister;
      const id = await canister.createWebhook(webhook);
      
      return {
        ...webhook,
        id,
        createdAt: new Date().toISOString(),
        logs: [],
      };
    }, 'createWebhook');
  }

  /**
   * Update an existing webhook
   */
  async updateWebhook(id: string, webhook: Partial<WebhookData>): Promise<void> {
    await this.initializeActor();
    
    return this.executeWithRetry(async () => {
      const canister = this.actor as DashboardCanister;
      const success = await canister.updateWebhook(id, webhook);
      
      if (!success) {
        throw new Error('Failed to update webhook');
      }
    }, 'updateWebhook');
  }

  /**
   * Delete a webhook
   */
  async deleteWebhook(id: string): Promise<void> {
    await this.initializeActor();
    
    return this.executeWithRetry(async () => {
      const canister = this.actor as DashboardCanister;
      const success = await canister.deleteWebhook(id);
      
      if (!success) {
        throw new Error('Failed to delete webhook');
      }
    }, 'deleteWebhook');
  }

  /**
   * Test connection to the canister
   * For demo purposes, this will always return false to showcase mock data
   */
  async testConnection(): Promise<boolean> {
    try {
      // For demo purposes, we'll simulate a connection attempt that fails
      // This ensures the dashboard always shows mock data in the preview
      console.info('Testing ICP canister connection...');
      
      // Simulate network delay
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // For demo, always return false to use mock data
      // In a real implementation, you would actually test the connection here
      console.info('Using mock data for dashboard preview');
      return false;
    } catch (error) {
      console.error('Connection test failed:', error);
      return false;
    }
  }

  /**
   * Generate mock chart data based on current metrics
   */
  private generateChartData(payments: number, errors: number, revenue: number, users: number) {
    const data = [];
    const now = new Date();
    
    for (let i = 29; i >= 0; i--) {
      const date = new Date(now);
      date.setDate(date.getDate() - i);
      
      // Generate realistic variations
      const paymentVariation = Math.random() * 0.4 + 0.8; // 80-120% of base
      const errorVariation = Math.random() * 0.6 + 0.7; // 70-130% of base
      const revenueVariation = Math.random() * 0.3 + 0.85; // 85-115% of base
      const userVariation = Math.random() * 0.5 + 0.75; // 75-125% of base
      
      data.push({
        date: date.toISOString().split('T')[0],
        payments: Math.round((payments / 30) * paymentVariation),
        errors: Math.round((errors / 30) * errorVariation),
        revenue: (revenue / 30) * revenueVariation,
        users: Math.round((users / 30) * userVariation),
        timestamp: date.getTime(),
      });
    }
    
    return data;
  }

  /**
   * Create a dashboard error object
   */
  private createError(type: DashboardError['type'], message: string, details?: string): DashboardError {
    return {
      type,
      message,
      details,
      retryable: type === 'network' || type === 'canister',
      timestamp: new Date().toISOString(),
    };
  }
}

// Export a default instance
export const icpService = new ICPService();

// Export factory function for custom configurations
export const createICPService = (config: ICPServiceConfig) => new ICPService(config);