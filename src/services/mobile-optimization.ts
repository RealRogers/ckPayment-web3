/**
 * Mobile and Bandwidth Optimization Service
 * Provides adaptive optimizations for mobile devices and limited bandwidth connections
 */

export interface DeviceCapabilities {
  // Device characteristics
  isMobile: boolean;
  isTablet: boolean;
  isDesktop: boolean;
  screenSize: 'small' | 'medium' | 'large' | 'xlarge';
  orientation: 'portrait' | 'landscape';
  touchSupport: boolean;
  
  // Performance characteristics
  deviceMemory: number; // GB (estimated)
  hardwareConcurrency: number; // CPU cores
  maxTouchPoints: number;
  
  // Network characteristics
  connectionType: 'slow-2g' | '2g' | '3g' | '4g' | 'wifi' | 'unknown';
  effectiveType: string;
  downlink: number; // Mbps
  rtt: number; // milliseconds
  saveData: boolean; // User has enabled data saver
}

export interface OptimizationSettings {
  // Data optimization
  dataCompression: boolean;
  imageOptimization: boolean;
  lazyLoading: boolean;
  prefetching: boolean;
  caching: {
    enabled: boolean;
    maxSize: number; // MB
    ttl: number; // seconds
  };
  
  // UI optimization
  reducedAnimations: boolean;
  simplifiedCharts: boolean;
  compactLayout: boolean;
  virtualScrolling: boolean;
  
  // Update optimization
  updateFrequency: number; // milliseconds
  batchUpdates: boolean;
  deltaUpdates: boolean;
  
  // Feature toggles
  disableRealTime: boolean;
  disableNotifications: boolean;
  disableAdvancedAnalytics: boolean;
}

export interface BandwidthUsage {
  current: number; // bytes per second
  average: number; // bytes per second
  peak: number; // bytes per second
  total: number; // total bytes transferred
  compressed: number; // bytes saved through compression
  efficiency: number; // compression ratio (0-1)
}

export interface OptimizationRecommendations {
  priority: 'low' | 'medium' | 'high' | 'critical';
  category: 'performance' | 'data' | 'battery' | 'user-experience';
  title: string;
  description: string;
  impact: string; // Expected improvement
  action: () => void;
  autoApply: boolean;
}

export class MobileOptimizationService {
  private static instance: MobileOptimizationService;
  private deviceCapabilities: DeviceCapabilities;
  private optimizationSettings: OptimizationSettings;
  private bandwidthUsage: BandwidthUsage;
  private dataTransferLog: { timestamp: number; bytes: number; compressed: boolean }[] = [];
  private optimizationCallbacks = new Set<(settings: OptimizationSettings) => void>();
  private bandwidthMonitorInterval: NodeJS.Timeout | null = null;

  constructor() {
    this.deviceCapabilities = this.detectDeviceCapabilities();
    this.optimizationSettings = this.generateOptimalSettings();
    this.bandwidthUsage = this.initializeBandwidthUsage();
    this.startBandwidthMonitoring();
    this.setupEventListeners();
  }

  static getInstance(): MobileOptimizationService {
    if (!MobileOptimizationService.instance) {
      MobileOptimizationService.instance = new MobileOptimizationService();
    }
    return MobileOptimizationService.instance;
  }

  /**
   * Get current device capabilities
   */
  getDeviceCapabilities(): DeviceCapabilities {
    return { ...this.deviceCapabilities };
  }

  /**
   * Get current optimization settings
   */
  getOptimizationSettings(): OptimizationSettings {
    return { ...this.optimizationSettings };
  }

  /**
   * Update optimization settings
   */
  updateOptimizationSettings(updates: Partial<OptimizationSettings>): void {
    this.optimizationSettings = { ...this.optimizationSettings, ...updates };
    this.notifyOptimizationChange();
    this.saveSettings();
  }

  /**
   * Get bandwidth usage statistics
   */
  getBandwidthUsage(): BandwidthUsage {
    return { ...this.bandwidthUsage };
  }

  /**
   * Record data transfer for bandwidth monitoring
   */
  recordDataTransfer(bytes: number, compressed = false): void {
    const now = Date.now();
    this.dataTransferLog.push({ timestamp: now, bytes, compressed });
    
    // Keep only last hour of data
    const oneHourAgo = now - 60 * 60 * 1000;
    this.dataTransferLog = this.dataTransferLog.filter(entry => entry.timestamp > oneHourAgo);
    
    // Update bandwidth usage
    this.updateBandwidthUsage();
  }

  /**
   * Get optimization recommendations
   */
  getOptimizationRecommendations(): OptimizationRecommendations[] {
    const recommendations: OptimizationRecommendations[] = [];
    const capabilities = this.deviceCapabilities;
    const settings = this.optimizationSettings;
    const bandwidth = this.bandwidthUsage;

    // Data usage recommendations
    if (capabilities.saveData && !settings.dataCompression) {
      recommendations.push({
        priority: 'high',
        category: 'data',
        title: 'Enable Data Compression',
        description: 'User has data saver enabled. Compress data transfers to reduce usage.',
        impact: 'Reduce data usage by 30-50%',
        action: () => this.updateOptimizationSettings({ dataCompression: true }),
        autoApply: true
      });
    }

    // Performance recommendations for mobile
    if (capabilities.isMobile && !settings.reducedAnimations) {
      recommendations.push({
        priority: 'medium',
        category: 'performance',
        title: 'Reduce Animations',
        description: 'Mobile device detected. Reduce animations to improve performance.',
        impact: 'Improve frame rate by 15-25%',
        action: () => this.updateOptimizationSettings({ reducedAnimations: true }),
        autoApply: false
      });
    }

    // Low memory recommendations
    if (capabilities.deviceMemory < 2 && !settings.virtualScrolling) {
      recommendations.push({
        priority: 'high',
        category: 'performance',
        title: 'Enable Virtual Scrolling',
        description: 'Low device memory detected. Enable virtual scrolling for large lists.',
        impact: 'Reduce memory usage by 40-60%',
        action: () => this.updateOptimizationSettings({ virtualScrolling: true }),
        autoApply: true
      });
    }

    // Slow connection recommendations
    if (capabilities.connectionType === 'slow-2g' || capabilities.connectionType === '2g') {
      recommendations.push({
        priority: 'critical',
        category: 'data',
        title: 'Enable Offline Mode',
        description: 'Very slow connection detected. Enable offline mode with cached data.',
        impact: 'Improve loading time by 80%+',
        action: () => this.enableOfflineMode(),
        autoApply: false
      });
    }

    // High bandwidth usage recommendations
    if (bandwidth.current > 1024 * 1024) { // > 1MB/s
      recommendations.push({
        priority: 'medium',
        category: 'data',
        title: 'Optimize Data Updates',
        description: 'High bandwidth usage detected. Enable delta updates and batching.',
        impact: 'Reduce bandwidth usage by 20-40%',
        action: () => this.updateOptimizationSettings({ 
          deltaUpdates: true, 
          batchUpdates: true 
        }),
        autoApply: false
      });
    }

    // Battery optimization for mobile
    if (capabilities.isMobile && !settings.disableRealTime) {
      recommendations.push({
        priority: 'low',
        category: 'battery',
        title: 'Optimize for Battery',
        description: 'Reduce update frequency and disable real-time features to save battery.',
        impact: 'Extend battery life by 20-30%',
        action: () => this.optimizeForBattery(),
        autoApply: false
      });
    }

    return recommendations.sort((a, b) => {
      const priorityOrder = { critical: 4, high: 3, medium: 2, low: 1 };
      return priorityOrder[b.priority] - priorityOrder[a.priority];
    });
  }

  /**
   * Apply automatic optimizations based on device capabilities
   */
  applyAutomaticOptimizations(): void {
    const recommendations = this.getOptimizationRecommendations();
    const autoRecommendations = recommendations.filter(r => r.autoApply);
    
    console.log(`Applying ${autoRecommendations.length} automatic optimizations...`);
    
    autoRecommendations.forEach(recommendation => {
      try {
        recommendation.action();
        console.log(`Applied: ${recommendation.title}`);
      } catch (error) {
        console.error(`Failed to apply optimization: ${recommendation.title}`, error);
      }
    });
  }

  /**
   * Optimize for current network conditions
   */
  optimizeForNetwork(): void {
    const capabilities = this.deviceCapabilities;
    const updates: Partial<OptimizationSettings> = {};

    // Adjust based on connection type
    switch (capabilities.connectionType) {
      case 'slow-2g':
      case '2g':
        updates.dataCompression = true;
        updates.imageOptimization = true;
        updates.updateFrequency = 30000; // 30 seconds
        updates.disableRealTime = true;
        updates.simplifiedCharts = true;
        break;
        
      case '3g':
        updates.dataCompression = true;
        updates.updateFrequency = 15000; // 15 seconds
        updates.batchUpdates = true;
        break;
        
      case '4g':
      case 'wifi':
        updates.updateFrequency = 5000; // 5 seconds
        updates.prefetching = true;
        break;
    }

    // Apply save data preferences
    if (capabilities.saveData) {
      updates.dataCompression = true;
      updates.imageOptimization = true;
      updates.lazyLoading = true;
      updates.disableAdvancedAnalytics = true;
    }

    this.updateOptimizationSettings(updates);
  }

  /**
   * Optimize for mobile device
   */
  optimizeForMobile(): void {
    if (!this.deviceCapabilities.isMobile) return;

    const updates: Partial<OptimizationSettings> = {
      compactLayout: true,
      reducedAnimations: true,
      virtualScrolling: true,
      lazyLoading: true,
      batchUpdates: true
    };

    // Additional optimizations for small screens
    if (this.deviceCapabilities.screenSize === 'small') {
      updates.simplifiedCharts = true;
      updates.disableAdvancedAnalytics = true;
    }

    // Memory-based optimizations
    if (this.deviceCapabilities.deviceMemory < 2) {
      updates.caching = {
        enabled: true,
        maxSize: 10, // Smaller cache for low memory devices
        ttl: 300 // 5 minutes
      };
    }

    this.updateOptimizationSettings(updates);
  }

  /**
   * Subscribe to optimization changes
   */
  onOptimizationChange(callback: (settings: OptimizationSettings) => void): () => void {
    this.optimizationCallbacks.add(callback);
    return () => this.optimizationCallbacks.delete(callback);
  }

  /**
   * Get data compression ratio
   */
  getCompressionRatio(): number {
    const totalBytes = this.dataTransferLog.reduce((sum, entry) => sum + entry.bytes, 0);
    const compressedBytes = this.dataTransferLog
      .filter(entry => entry.compressed)
      .reduce((sum, entry) => sum + entry.bytes, 0);
    
    return totalBytes > 0 ? compressedBytes / totalBytes : 0;
  }

  /**
   * Estimate data savings
   */
  estimateDataSavings(): { 
    bytesPerHour: number; 
    bytesPerDay: number; 
    percentageSaved: number 
  } {
    const compressionRatio = this.getCompressionRatio();
    const hourlyUsage = this.bandwidthUsage.average * 3600; // bytes per hour
    
    const bytesPerHour = hourlyUsage * compressionRatio;
    const bytesPerDay = bytesPerHour * 24;
    const percentageSaved = compressionRatio * 100;

    return { bytesPerHour, bytesPerDay, percentageSaved };
  }

  // ===== PRIVATE METHODS =====

  private detectDeviceCapabilities(): DeviceCapabilities {
    const userAgent = navigator.userAgent.toLowerCase();
    const isMobile = /android|webos|iphone|ipad|ipod|blackberry|iemobile|opera mini/i.test(userAgent);
    const isTablet = /ipad|android(?!.*mobile)/i.test(userAgent);
    const isDesktop = !isMobile && !isTablet;

    // Screen size detection
    const screenWidth = window.screen.width;
    let screenSize: DeviceCapabilities['screenSize'];
    if (screenWidth < 640) screenSize = 'small';
    else if (screenWidth < 1024) screenSize = 'medium';
    else if (screenWidth < 1440) screenSize = 'large';
    else screenSize = 'xlarge';

    // Network information
    const connection = (navigator as any).connection || (navigator as any).mozConnection || (navigator as any).webkitConnection;
    const connectionType = connection?.effectiveType || 'unknown';
    const downlink = connection?.downlink || 0;
    const rtt = connection?.rtt || 0;
    const saveData = connection?.saveData || false;

    return {
      isMobile,
      isTablet,
      isDesktop,
      screenSize,
      orientation: window.innerHeight > window.innerWidth ? 'portrait' : 'landscape',
      touchSupport: 'ontouchstart' in window,
      deviceMemory: (navigator as any).deviceMemory || 4, // Default to 4GB
      hardwareConcurrency: navigator.hardwareConcurrency || 4,
      maxTouchPoints: navigator.maxTouchPoints || 0,
      connectionType: this.mapConnectionType(connectionType),
      effectiveType: connectionType,
      downlink,
      rtt,
      saveData
    };
  }

  private mapConnectionType(effectiveType: string): DeviceCapabilities['connectionType'] {
    switch (effectiveType) {
      case 'slow-2g': return 'slow-2g';
      case '2g': return '2g';
      case '3g': return '3g';
      case '4g': return '4g';
      default: return 'unknown';
    }
  }

  private generateOptimalSettings(): OptimizationSettings {
    const capabilities = this.deviceCapabilities;
    
    // Base settings
    const settings: OptimizationSettings = {
      dataCompression: false,
      imageOptimization: false,
      lazyLoading: true,
      prefetching: true,
      caching: {
        enabled: true,
        maxSize: 50,
        ttl: 600
      },
      reducedAnimations: false,
      simplifiedCharts: false,
      compactLayout: false,
      virtualScrolling: false,
      updateFrequency: 5000,
      batchUpdates: false,
      deltaUpdates: true,
      disableRealTime: false,
      disableNotifications: false,
      disableAdvancedAnalytics: false
    };

    // Apply device-specific optimizations
    if (capabilities.isMobile) {
      settings.compactLayout = true;
      settings.virtualScrolling = true;
      settings.batchUpdates = true;
    }

    // Apply connection-specific optimizations
    if (capabilities.connectionType === 'slow-2g' || capabilities.connectionType === '2g') {
      settings.dataCompression = true;
      settings.imageOptimization = true;
      settings.updateFrequency = 30000;
      settings.simplifiedCharts = true;
    }

    // Apply data saver optimizations
    if (capabilities.saveData) {
      settings.dataCompression = true;
      settings.imageOptimization = true;
      settings.lazyLoading = true;
      settings.prefetching = false;
    }

    // Apply memory-based optimizations
    if (capabilities.deviceMemory < 2) {
      settings.virtualScrolling = true;
      settings.caching.maxSize = 20;
      settings.disableAdvancedAnalytics = true;
    }

    return settings;
  }

  private initializeBandwidthUsage(): BandwidthUsage {
    return {
      current: 0,
      average: 0,
      peak: 0,
      total: 0,
      compressed: 0,
      efficiency: 0
    };
  }

  private startBandwidthMonitoring(): void {
    this.bandwidthMonitorInterval = setInterval(() => {
      this.updateBandwidthUsage();
    }, 1000); // Update every second
  }

  private updateBandwidthUsage(): void {
    const now = Date.now();
    const lastSecond = now - 1000;
    
    // Calculate current bandwidth (bytes per second)
    const recentTransfers = this.dataTransferLog.filter(entry => entry.timestamp > lastSecond);
    const currentBytes = recentTransfers.reduce((sum, entry) => sum + entry.bytes, 0);
    
    this.bandwidthUsage.current = currentBytes;
    
    // Update peak
    if (currentBytes > this.bandwidthUsage.peak) {
      this.bandwidthUsage.peak = currentBytes;
    }
    
    // Calculate average (last 5 minutes)
    const fiveMinutesAgo = now - 5 * 60 * 1000;
    const recentData = this.dataTransferLog.filter(entry => entry.timestamp > fiveMinutesAgo);
    
    if (recentData.length > 0) {
      const totalBytes = recentData.reduce((sum, entry) => sum + entry.bytes, 0);
      const timeSpan = (now - recentData[0].timestamp) / 1000; // seconds
      this.bandwidthUsage.average = timeSpan > 0 ? totalBytes / timeSpan : 0;
    }
    
    // Update totals
    this.bandwidthUsage.total = this.dataTransferLog.reduce((sum, entry) => sum + entry.bytes, 0);
    this.bandwidthUsage.compressed = this.dataTransferLog
      .filter(entry => entry.compressed)
      .reduce((sum, entry) => sum + entry.bytes, 0);
    
    // Calculate efficiency
    this.bandwidthUsage.efficiency = this.bandwidthUsage.total > 0 
      ? this.bandwidthUsage.compressed / this.bandwidthUsage.total 
      : 0;
  }

  private setupEventListeners(): void {
    // Orientation change
    window.addEventListener('orientationchange', () => {
      setTimeout(() => {
        this.deviceCapabilities.orientation = 
          window.innerHeight > window.innerWidth ? 'portrait' : 'landscape';
        this.optimizeForMobile();
      }, 100);
    });

    // Connection change
    if ('connection' in navigator) {
      const connection = (navigator as any).connection;
      connection.addEventListener('change', () => {
        this.deviceCapabilities = this.detectDeviceCapabilities();
        this.optimizeForNetwork();
      });
    }

    // Visibility change (for battery optimization)
    document.addEventListener('visibilitychange', () => {
      if (document.hidden && this.deviceCapabilities.isMobile) {
        // Reduce activity when page is hidden on mobile
        this.updateOptimizationSettings({
          updateFrequency: this.optimizationSettings.updateFrequency * 2
        });
      } else if (!document.hidden) {
        // Restore normal activity when page becomes visible
        this.optimizeForNetwork();
      }
    });
  }

  private enableOfflineMode(): void {
    this.updateOptimizationSettings({
      disableRealTime: true,
      caching: {
        enabled: true,
        maxSize: 100,
        ttl: 3600 // 1 hour
      },
      updateFrequency: 60000, // 1 minute
      dataCompression: true,
      lazyLoading: true,
      prefetching: false
    });
  }

  private optimizeForBattery(): void {
    this.updateOptimizationSettings({
      reducedAnimations: true,
      updateFrequency: 15000, // 15 seconds
      disableRealTime: true,
      simplifiedCharts: true,
      batchUpdates: true
    });
  }

  private notifyOptimizationChange(): void {
    this.optimizationCallbacks.forEach(callback => {
      try {
        callback(this.optimizationSettings);
      } catch (error) {
        console.error('Error in optimization change callback:', error);
      }
    });
  }

  private saveSettings(): void {
    try {
      localStorage.setItem('mobile-optimization-settings', JSON.stringify(this.optimizationSettings));
    } catch (error) {
      console.error('Failed to save optimization settings:', error);
    }
  }

  private loadSettings(): void {
    try {
      const saved = localStorage.getItem('mobile-optimization-settings');
      if (saved) {
        const parsed = JSON.parse(saved);
        this.optimizationSettings = { ...this.optimizationSettings, ...parsed };
      }
    } catch (error) {
      console.error('Failed to load optimization settings:', error);
    }
  }
}

// Export singleton instance
export const mobileOptimization = MobileOptimizationService.getInstance();

// Export factory function for testing
export const createMobileOptimizationService = () => new MobileOptimizationService();