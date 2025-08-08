/**
 * Feature Flags Configuration
 * Manages gradual rollout of new features and A/B testing
 */

export interface FeatureFlags {
  // Real-time features
  enableWebSocket: boolean;
  enablePollingFallback: boolean;
  enableBandwidthOptimization: boolean;
  
  // Analytics features
  enableAdvancedAnalytics: boolean;
  enablePredictiveAnalytics: boolean;
  enableAnomalyDetection: boolean;
  
  // UI features
  enableAnimations: boolean;
  enableRealTimeIndicators: boolean;
  enableNotificationSystem: boolean;
  enableDashboardSettings: boolean;
  
  // Error handling
  enableEnhancedErrorHandling: boolean;
  enableCircuitBreaker: boolean;
  enableErrorRecovery: boolean;
  
  // Performance features
  enableServiceWorker: boolean;
  enableLazyLoading: boolean;
  enableCodeSplitting: boolean;
  
  // Experimental features
  enableBetaFeatures: boolean;
  enableDebugMode: boolean;
  enablePerformanceMonitoring: boolean;
}

export const defaultFeatureFlags: FeatureFlags = {
  // Real-time features - stable
  enableWebSocket: true,
  enablePollingFallback: true,
  enableBandwidthOptimization: true,
  
  // Analytics features - stable
  enableAdvancedAnalytics: true,
  enablePredictiveAnalytics: true,
  enableAnomalyDetection: true,
  
  // UI features - stable
  enableAnimations: true,
  enableRealTimeIndicators: true,
  enableNotificationSystem: true,
  enableDashboardSettings: true,
  
  // Error handling - stable
  enableEnhancedErrorHandling: true,
  enableCircuitBreaker: true,
  enableErrorRecovery: true,
  
  // Performance features - gradual rollout
  enableServiceWorker: false,
  enableLazyLoading: true,
  enableCodeSplitting: true,
  
  // Experimental features - disabled by default
  enableBetaFeatures: false,
  enableDebugMode: process.env.NODE_ENV === 'development',
  enablePerformanceMonitoring: process.env.NODE_ENV === 'production',
};

export class FeatureFlagManager {
  private flags: FeatureFlags;
  private userId?: string;
  private environment: string;
  
  constructor(userId?: string) {
    this.userId = userId;
    this.environment = process.env.NODE_ENV || 'development';
    this.flags = { ...defaultFeatureFlags };
    this.loadFlags();
  }
  
  private async loadFlags(): Promise<void> {
    try {
      // Load from remote configuration service
      const response = await fetch('/api/feature-flags', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userId: this.userId,
          environment: this.environment,
          version: process.env.REACT_APP_VERSION,
        }),
      });
      
      if (response.ok) {
        const remoteFlags = await response.json();
        this.flags = { ...this.flags, ...remoteFlags };
      }
    } catch (error) {
      console.warn('Failed to load remote feature flags, using defaults:', error);
    }
    
    // Load from localStorage for development overrides
    this.loadLocalOverrides();
  }
  
  private loadLocalOverrides(): void {
    try {
      const localFlags = localStorage.getItem('feature-flags-override');
      if (localFlags) {
        const overrides = JSON.parse(localFlags);
        this.flags = { ...this.flags, ...overrides };
      }
    } catch (error) {
      console.warn('Failed to load local feature flag overrides:', error);
    }
  }
  
  public isEnabled(flag: keyof FeatureFlags): boolean {
    return this.flags[flag] ?? false;
  }
  
  public getFlags(): FeatureFlags {
    return { ...this.flags };
  }
  
  public setFlag(flag: keyof FeatureFlags, value: boolean): void {
    this.flags[flag] = value;
    this.saveLocalOverrides();
  }
  
  private saveLocalOverrides(): void {
    try {
      const overrides = Object.keys(this.flags).reduce((acc, key) => {
        const flagKey = key as keyof FeatureFlags;
        if (this.flags[flagKey] !== defaultFeatureFlags[flagKey]) {
          acc[flagKey] = this.flags[flagKey];
        }
        return acc;
      }, {} as Partial<FeatureFlags>);
      
      localStorage.setItem('feature-flags-override', JSON.stringify(overrides));
    } catch (error) {
      console.warn('Failed to save local feature flag overrides:', error);
    }
  }
  
  public async refreshFlags(): Promise<void> {
    await this.loadFlags();
  }
  
  // A/B testing support
  public getVariant(experimentName: string): string {
    if (!this.userId) return 'control';
    
    // Simple hash-based assignment
    const hash = this.hashString(`${experimentName}-${this.userId}`);
    const bucket = hash % 100;
    
    // Example: 50/50 split
    return bucket < 50 ? 'control' : 'treatment';
  }
  
  private hashString(str: string): number {
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
      const char = str.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash; // Convert to 32-bit integer
    }
    return Math.abs(hash);
  }
  
  // Gradual rollout support
  public isInRollout(feature: string, percentage: number): boolean {
    if (!this.userId) return false;
    
    const hash = this.hashString(`${feature}-rollout-${this.userId}`);
    const bucket = hash % 100;
    
    return bucket < percentage;
  }
}

// Global instance
export const featureFlagManager = new FeatureFlagManager();

// React hook for feature flags
export const useFeatureFlag = (flag: keyof FeatureFlags): boolean => {
  const [isEnabled, setIsEnabled] = React.useState(
    featureFlagManager.isEnabled(flag)
  );
  
  React.useEffect(() => {
    const checkFlag = () => {
      setIsEnabled(featureFlagManager.isEnabled(flag));
    };
    
    // Check periodically for updates
    const interval = setInterval(checkFlag, 30000); // 30 seconds
    
    return () => clearInterval(interval);
  }, [flag]);
  
  return isEnabled;
};

// React hook for A/B testing
export const useExperiment = (experimentName: string): string => {
  const [variant, setVariant] = React.useState(
    featureFlagManager.getVariant(experimentName)
  );
  
  React.useEffect(() => {
    setVariant(featureFlagManager.getVariant(experimentName));
  }, [experimentName]);
  
  return variant;
};

// Feature flag component wrapper
interface FeatureGateProps {
  flag: keyof FeatureFlags;
  children: React.ReactNode;
  fallback?: React.ReactNode;
}

export const FeatureGate: React.FC<FeatureGateProps> = ({ 
  flag, 
  children, 
  fallback = null 
}) => {
  const isEnabled = useFeatureFlag(flag);
  
  return isEnabled ? <>{children}</> : <>{fallback}</>;
};

// Experiment component wrapper
interface ExperimentProps {
  name: string;
  children: {
    control: React.ReactNode;
    treatment: React.ReactNode;
  };
}

export const Experiment: React.FC<ExperimentProps> = ({ name, children }) => {
  const variant = useExperiment(name);
  
  return <>{children[variant as keyof typeof children] || children.control}</>;
};