import { useState, useEffect, useCallback, useRef } from 'react';
import { icpService, ICPService } from '@/services/icp-service-simple';
import { mockDataService } from '@/services/mock-data';
import { 
  DashboardData, 
  MetricsData, 
  ConfigData, 
  WebhookData, 
  DashboardError,
  LoadingState 
} from '@/types/dashboard';
import { DASHBOARD_CONFIG, ERROR_MESSAGES } from '@/utils/dashboard-constants';

interface UseICPDataOptions {
  canisterId?: string;
  refreshInterval?: number;
  enableAutoRefresh?: boolean;
  fallbackToMock?: boolean;
  retryAttempts?: number;
}

interface UseICPDataReturn {
  // Data
  data: DashboardData | null;
  metrics: MetricsData | null;
  config: ConfigData | null;
  webhooks: WebhookData[] | null;
  
  // Loading states
  loading: LoadingState;
  isLoading: boolean;
  
  // Error handling
  error: DashboardError | null;
  hasError: boolean;
  
  // Actions
  refetch: () => Promise<void>;
  refetchMetrics: () => Promise<void>;
  refetchConfig: () => Promise<void>;
  refetchWebhooks: () => Promise<void>;
  clearError: () => void;
  
  // Status
  lastRefresh: Date | null;
  isUsingMockData: boolean;
  connectionStatus: 'connected' | 'disconnected' | 'testing';
}

const DEFAULT_OPTIONS: Required<UseICPDataOptions> = {
  canisterId: '',
  refreshInterval: DASHBOARD_CONFIG.DEFAULT_REFRESH_INTERVAL,
  enableAutoRefresh: true,
  fallbackToMock: true,
  retryAttempts: 3,
};

/**
 * Custom hook for managing ICP dashboard data
 * Provides automatic fallback to mock data and comprehensive error handling
 */
export const useICPData = (options: UseICPDataOptions = {}): UseICPDataReturn => {
  const config = { ...DEFAULT_OPTIONS, ...options };
  
  // State management
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState<LoadingState>({
    metrics: false,
    config: false,
    webhooks: false,
    global: true,
  });
  const [error, setError] = useState<DashboardError | null>(null);
  const [lastRefresh, setLastRefresh] = useState<Date | null>(null);
  const [isUsingMockData, setIsUsingMockData] = useState<boolean>(false);
  const [connectionStatus, setConnectionStatus] = useState<'connected' | 'disconnected' | 'testing'>('testing');
  
  // Refs for cleanup and caching
  const refreshIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const abortControllerRef = useRef<AbortController | null>(null);
  const serviceRef = useRef<ICPService>(icpService);
  const retryCountRef = useRef<number>(0);

  // Initialize service with custom canister ID if provided
  useEffect(() => {
    if (config.canisterId) {
      serviceRef.current = new ICPService({ canisterId: config.canisterId });
    }
  }, [config.canisterId]);

  /**
   * Create a dashboard error object
   */
  const createError = useCallback((
    type: DashboardError['type'], 
    message: string, 
    details?: string
  ): DashboardError => ({
    type,
    message,
    details,
    retryable: type === 'network' || type === 'canister',
    timestamp: new Date().toISOString(),
    context: { canisterId: config.canisterId, retryCount: retryCountRef.current },
  }), [config.canisterId]);

  /**
   * Update loading state for specific data type
   */
  const updateLoadingState = useCallback((key: keyof LoadingState, value: boolean) => {
    setLoading(prev => {
      const newState = { ...prev, [key]: value };
      newState.global = Object.values(newState).some(loading => loading);
      return newState;
    });
  }, []);

  /**
   * Fetch data from ICP canister with fallback to mock data
   */
  const fetchData = useCallback(async <T>(
    fetchFunction: () => Promise<T>,
    mockFunction: () => T,
    dataType: keyof LoadingState,
    operationName: string
  ): Promise<T> => {
    updateLoadingState(dataType, true);
    
    try {
      // Test connection first (only once)
      if (connectionStatus === 'testing') {
        const isConnected = await serviceRef.current.testConnection();
        setConnectionStatus(isConnected ? 'connected' : 'disconnected');
        
        // If not connected, we'll use mock data
        if (!isConnected) {
          console.info('ICP canister not available, using mock data for demo');
        }
      }
      
      // Try to fetch from ICP canister
      const result = await fetchFunction();
      setIsUsingMockData(false);
      setConnectionStatus('connected');
      retryCountRef.current = 0;
      
      return result;
    } catch (err) {
      console.warn(`${operationName} failed:`, err);
      setConnectionStatus('disconnected');
      
      // Increment retry count
      retryCountRef.current++;
      
      if (config.fallbackToMock) {
        console.info(`Falling back to mock data for ${operationName}`);
        setIsUsingMockData(true);
        
        // Add realistic delay to simulate network request
        await mockDataService.simulateNetworkDelay(300, 800);
        
        return mockFunction();
      } else {
        // Create appropriate error based on the exception
        const errorMessage = err instanceof Error ? err.message : 'Unknown error occurred';
        let errorType: DashboardError['type'] = 'unknown';
        
        if (errorMessage.includes('network') || errorMessage.includes('fetch')) {
          errorType = 'network';
        } else if (errorMessage.includes('canister') || errorMessage.includes('agent')) {
          errorType = 'canister';
        }
        
        throw createError(errorType, ERROR_MESSAGES[errorType], errorMessage);
      }
    } finally {
      updateLoadingState(dataType, false);
    }
  }, [config.fallbackToMock, connectionStatus, createError, updateLoadingState]);

  /**
   * Fetch metrics data
   */
  const refetchMetrics = useCallback(async (): Promise<void> => {
    try {
      const metrics = await fetchData(
        () => serviceRef.current.getStats(),
        () => mockDataService.generateMetricsData(),
        'metrics',
        'getStats'
      );
      
      setData(prev => prev ? { ...prev, metrics } : { 
        metrics, 
        config: mockDataService.generateConfigData(), 
        webhooks: mockDataService.generateWebhooksData(),
        lastRefreshed: new Date().toISOString()
      });
    } catch (err) {
      setError(err as DashboardError);
    }
  }, [fetchData]);

  /**
   * Fetch configuration data
   */
  const refetchConfig = useCallback(async (): Promise<void> => {
    try {
      const config = await fetchData(
        () => serviceRef.current.getConfig(),
        () => mockDataService.generateConfigData(),
        'config',
        'getConfig'
      );
      
      setData(prev => prev ? { ...prev, config } : { 
        config, 
        metrics: mockDataService.generateMetricsData(), 
        webhooks: mockDataService.generateWebhooksData(),
        lastRefreshed: new Date().toISOString()
      });
    } catch (err) {
      setError(err as DashboardError);
    }
  }, [fetchData]);

  /**
   * Fetch webhooks data
   */
  const refetchWebhooks = useCallback(async (): Promise<void> => {
    try {
      const webhooks = await fetchData(
        () => serviceRef.current.getWebhooks(),
        () => mockDataService.generateWebhooksData(),
        'webhooks',
        'getWebhooks'
      );
      
      setData(prev => prev ? { ...prev, webhooks } : { 
        webhooks, 
        metrics: mockDataService.generateMetricsData(), 
        config: mockDataService.generateConfigData(),
        lastRefreshed: new Date().toISOString()
      });
    } catch (err) {
      setError(err as DashboardError);
    }
  }, [fetchData]);

  /**
   * Fetch all dashboard data
   */
  const refetch = useCallback(async (): Promise<void> => {
    // Cancel any ongoing requests
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }
    abortControllerRef.current = new AbortController();
    
    setError(null);
    updateLoadingState('global', true);
    
    try {
      // Update mock data base metrics for realistic evolution
      mockDataService.updateBaseMetrics();
      
      // Fetch all data concurrently
      const [metrics, config, webhooks] = await Promise.all([
        fetchData(
          () => serviceRef.current.getStats(),
          () => mockDataService.generateMetricsData(),
          'metrics',
          'getStats'
        ),
        fetchData(
          () => serviceRef.current.getConfig(),
          () => mockDataService.generateConfigData(),
          'config',
          'getConfig'
        ),
        fetchData(
          () => serviceRef.current.getWebhooks(),
          () => mockDataService.generateWebhooksData(),
          'webhooks',
          'getWebhooks'
        ),
      ]);
      
      const newData: DashboardData = {
        metrics,
        config,
        webhooks,
        lastRefreshed: new Date().toISOString(),
      };
      
      setData(newData);
      setLastRefresh(new Date());
      setError(null);
    } catch (err) {
      const dashboardError = err as DashboardError;
      setError(dashboardError);
      
      // If fallback is enabled and we don't have any data, load mock data
      if (config.fallbackToMock && !data) {
        const mockData = mockDataService.generateDashboardData();
        setData(mockData);
        setIsUsingMockData(true);
        setLastRefresh(new Date());
      }
    } finally {
      updateLoadingState('global', false);
    }
  }, [data, config.fallbackToMock, fetchData, updateLoadingState]);

  /**
   * Clear error state
   */
  const clearError = useCallback(() => {
    setError(null);
    retryCountRef.current = 0;
  }, []);

  /**
   * Set up auto-refresh interval
   */
  useEffect(() => {
    if (config.enableAutoRefresh && config.refreshInterval > 0) {
      refreshIntervalRef.current = setInterval(() => {
        if (!loading.global) {
          refetch();
        }
      }, config.refreshInterval);
      
      return () => {
        if (refreshIntervalRef.current) {
          clearInterval(refreshIntervalRef.current);
        }
      };
    }
  }, [config.enableAutoRefresh, config.refreshInterval, loading.global, refetch]);

  /**
   * Initial data fetch
   */
  useEffect(() => {
    refetch();
    
    // Cleanup function
    return () => {
      if (refreshIntervalRef.current) {
        clearInterval(refreshIntervalRef.current);
      }
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
    };
  }, []); // Only run on mount

  // Derived state
  const isLoading = loading.global;
  const hasError = error !== null;
  const metrics = data?.metrics || null;
  const configData = data?.config || null;
  const webhooks = data?.webhooks || null;

  return {
    // Data
    data,
    metrics,
    config: configData,
    webhooks,
    
    // Loading states
    loading,
    isLoading,
    
    // Error handling
    error,
    hasError,
    
    // Actions
    refetch,
    refetchMetrics,
    refetchConfig,
    refetchWebhooks,
    clearError,
    
    // Status
    lastRefresh,
    isUsingMockData,
    connectionStatus,
  };
};

/**
 * Hook for managing individual webhook operations
 */
export const useWebhookOperations = (canisterId?: string) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<DashboardError | null>(null);
  const serviceRef = useRef(canisterId ? new ICPService({ canisterId }) : icpService);

  const createWebhook = useCallback(async (webhook: Omit<WebhookData, 'id' | 'createdAt' | 'logs'>) => {
    setLoading(true);
    setError(null);
    
    try {
      const result = await serviceRef.current.createWebhook(webhook);
      return result;
    } catch (err) {
      const error: DashboardError = {
        type: 'canister',
        message: 'Failed to create webhook',
        details: err instanceof Error ? err.message : 'Unknown error',
        retryable: true,
        timestamp: new Date().toISOString(),
      };
      setError(error);
      throw error;
    } finally {
      setLoading(false);
    }
  }, []);

  const updateWebhook = useCallback(async (id: string, webhook: Partial<WebhookData>) => {
    setLoading(true);
    setError(null);
    
    try {
      await serviceRef.current.updateWebhook(id, webhook);
    } catch (err) {
      const error: DashboardError = {
        type: 'canister',
        message: 'Failed to update webhook',
        details: err instanceof Error ? err.message : 'Unknown error',
        retryable: true,
        timestamp: new Date().toISOString(),
      };
      setError(error);
      throw error;
    } finally {
      setLoading(false);
    }
  }, []);

  const deleteWebhook = useCallback(async (id: string) => {
    setLoading(true);
    setError(null);
    
    try {
      await serviceRef.current.deleteWebhook(id);
    } catch (err) {
      const error: DashboardError = {
        type: 'canister',
        message: 'Failed to delete webhook',
        details: err instanceof Error ? err.message : 'Unknown error',
        retryable: true,
        timestamp: new Date().toISOString(),
      };
      setError(error);
      throw error;
    } finally {
      setLoading(false);
    }
  }, []);

  return {
    createWebhook,
    updateWebhook,
    deleteWebhook,
    loading,
    error,
    clearError: () => setError(null),
  };
};