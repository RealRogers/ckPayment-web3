import { DashboardConfig } from '@/components/ui/dashboard-settings';

/**
 * Configuration validation schema
 */
export interface ConfigValidationRule {
  path: string;
  type: 'string' | 'number' | 'boolean' | 'array' | 'object';
  required?: boolean;
  min?: number;
  max?: number;
  enum?: any[];
  validator?: (value: any) => boolean;
  errorMessage?: string;
}

/**
 * Configuration migration interface
 */
export interface ConfigMigration {
  version: string;
  migrate: (config: any) => any;
  description: string;
}

/**
 * Configuration backup metadata
 */
export interface ConfigBackup {
  id: string;
  timestamp: string;
  version: string;
  description: string;
  config: DashboardConfig;
  size: number; // bytes
  checksum: string;
}

/**
 * Configuration change event
 */
export interface ConfigChangeEvent {
  path: string;
  oldValue: any;
  newValue: any;
  timestamp: string;
  source: 'user' | 'system' | 'import' | 'migration';
}

/**
 * Configuration Manager Service
 * Handles configuration persistence, validation, migration, and backup
 */
export class ConfigurationManager {
  private static instance: ConfigurationManager;
  private config: DashboardConfig;
  private version = '1.0.0';
  private storageKey = 'dashboard-config';
  private backupKey = 'dashboard-config-backups';
  private changeListeners = new Set<(event: ConfigChangeEvent) => void>();
  private validationRules: ConfigValidationRule[] = [];
  private migrations: ConfigMigration[] = [];

  constructor() {
    this.config = this.getDefaultConfig();
    this.initializeValidationRules();
    this.initializeMigrations();
    this.loadConfiguration();
  }

  static getInstance(): ConfigurationManager {
    if (!ConfigurationManager.instance) {
      ConfigurationManager.instance = new ConfigurationManager();
    }
    return ConfigurationManager.instance;
  }

  /**
   * Get current configuration
   */
  getConfig(): DashboardConfig {
    return { ...this.config };
  }

  /**
   * Update configuration with validation
   */
  updateConfig(path: string, value: any, source: ConfigChangeEvent['source'] = 'user'): boolean {
    try {
      // Validate the change
      const validationResult = this.validateConfigChange(path, value);
      if (!validationResult.isValid) {
        console.error('Configuration validation failed:', validationResult.errors);
        return false;
      }

      // Get old value for change event
      const oldValue = this.getValueByPath(this.config, path);

      // Apply the change
      const newConfig = { ...this.config };
      this.setValueByPath(newConfig, path, value);

      // Validate entire configuration
      const fullValidation = this.validateConfiguration(newConfig);
      if (!fullValidation.isValid) {
        console.error('Full configuration validation failed:', fullValidation.errors);
        return false;
      }

      // Update configuration
      this.config = newConfig;

      // Create change event
      const changeEvent: ConfigChangeEvent = {
        path,
        oldValue,
        newValue: value,
        timestamp: new Date().toISOString(),
        source
      };

      // Notify listeners
      this.notifyChangeListeners(changeEvent);

      // Save to storage
      this.saveConfiguration();

      return true;
    } catch (error) {
      console.error('Failed to update configuration:', error);
      return false;
    }
  }

  /**
   * Bulk update configuration
   */
  updateMultiple(updates: { path: string; value: any }[], source: ConfigChangeEvent['source'] = 'user'): boolean {
    try {
      // Create backup before bulk update
      this.createBackup('Before bulk update');

      let success = true;
      const changeEvents: ConfigChangeEvent[] = [];

      for (const update of updates) {
        const validationResult = this.validateConfigChange(update.path, update.value);
        if (!validationResult.isValid) {
          console.error(`Validation failed for ${update.path}:`, validationResult.errors);
          success = false;
          continue;
        }

        const oldValue = this.getValueByPath(this.config, update.path);
        this.setValueByPath(this.config, update.path, update.value);

        changeEvents.push({
          path: update.path,
          oldValue,
          newValue: update.value,
          timestamp: new Date().toISOString(),
          source
        });
      }

      // Validate entire configuration
      const fullValidation = this.validateConfiguration(this.config);
      if (!fullValidation.isValid) {
        console.error('Full configuration validation failed:', fullValidation.errors);
        this.restoreFromBackup(); // Restore from backup
        return false;
      }

      // Notify all changes
      changeEvents.forEach(event => this.notifyChangeListeners(event));

      // Save configuration
      this.saveConfiguration();

      return success;
    } catch (error) {
      console.error('Failed to perform bulk update:', error);
      this.restoreFromBackup();
      return false;
    }
  }

  /**
   * Reset configuration to defaults
   */
  resetToDefaults(): boolean {
    try {
      this.createBackup('Before reset to defaults');
      
      const defaultConfig = this.getDefaultConfig();
      const oldConfig = { ...this.config };
      
      this.config = defaultConfig;
      
      // Notify reset event
      this.notifyChangeListeners({
        path: 'root',
        oldValue: oldConfig,
        newValue: defaultConfig,
        timestamp: new Date().toISOString(),
        source: 'system'
      });

      this.saveConfiguration();
      return true;
    } catch (error) {
      console.error('Failed to reset configuration:', error);
      return false;
    }
  }

  /**
   * Import configuration from JSON
   */
  importConfiguration(configJson: string, createBackup = true): { success: boolean; errors?: string[] } {
    try {
      if (createBackup) {
        this.createBackup('Before import');
      }

      const importedConfig = JSON.parse(configJson);
      
      // Migrate if necessary
      const migratedConfig = this.migrateConfiguration(importedConfig);
      
      // Validate imported configuration
      const validation = this.validateConfiguration(migratedConfig);
      if (!validation.isValid) {
        return { success: false, errors: validation.errors };
      }

      const oldConfig = { ...this.config };
      this.config = migratedConfig;

      // Notify import event
      this.notifyChangeListeners({
        path: 'root',
        oldValue: oldConfig,
        newValue: migratedConfig,
        timestamp: new Date().toISOString(),
        source: 'import'
      });

      this.saveConfiguration();
      return { success: true };
    } catch (error) {
      console.error('Failed to import configuration:', error);
      return { success: false, errors: [error instanceof Error ? error.message : 'Unknown error'] };
    }
  }

  /**
   * Export configuration to JSON
   */
  exportConfiguration(includeMetadata = true): string {
    const exportData = {
      version: this.version,
      timestamp: new Date().toISOString(),
      config: this.config
    };

    if (!includeMetadata) {
      return JSON.stringify(this.config, null, 2);
    }

    return JSON.stringify(exportData, null, 2);
  }

  /**
   * Create configuration backup
   */
  createBackup(description = 'Manual backup'): string {
    try {
      const backupId = `backup_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      const configJson = JSON.stringify(this.config);
      
      const backup: ConfigBackup = {
        id: backupId,
        timestamp: new Date().toISOString(),
        version: this.version,
        description,
        config: { ...this.config },
        size: new Blob([configJson]).size,
        checksum: this.calculateChecksum(configJson)
      };

      // Get existing backups
      const backups = this.getBackups();
      backups.push(backup);

      // Keep only last 10 backups
      const sortedBackups = backups
        .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
        .slice(0, 10);

      // Save backups
      localStorage.setItem(this.backupKey, JSON.stringify(sortedBackups));

      return backupId;
    } catch (error) {
      console.error('Failed to create backup:', error);
      return '';
    }
  }

  /**
   * Get all backups
   */
  getBackups(): ConfigBackup[] {
    try {
      const backupsJson = localStorage.getItem(this.backupKey);
      return backupsJson ? JSON.parse(backupsJson) : [];
    } catch (error) {
      console.error('Failed to load backups:', error);
      return [];
    }
  }

  /**
   * Restore from backup
   */
  restoreFromBackup(backupId?: string): boolean {
    try {
      const backups = this.getBackups();
      
      let backup: ConfigBackup | undefined;
      if (backupId) {
        backup = backups.find(b => b.id === backupId);
      } else {
        // Get most recent backup
        backup = backups.sort((a, b) => 
          new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
        )[0];
      }

      if (!backup) {
        console.error('No backup found');
        return false;
      }

      // Validate backup configuration
      const validation = this.validateConfiguration(backup.config);
      if (!validation.isValid) {
        console.error('Backup configuration is invalid:', validation.errors);
        return false;
      }

      const oldConfig = { ...this.config };
      this.config = backup.config;

      // Notify restore event
      this.notifyChangeListeners({
        path: 'root',
        oldValue: oldConfig,
        newValue: backup.config,
        timestamp: new Date().toISOString(),
        source: 'system'
      });

      this.saveConfiguration();
      return true;
    } catch (error) {
      console.error('Failed to restore from backup:', error);
      return false;
    }
  }

  /**
   * Delete backup
   */
  deleteBackup(backupId: string): boolean {
    try {
      const backups = this.getBackups();
      const filteredBackups = backups.filter(b => b.id !== backupId);
      
      localStorage.setItem(this.backupKey, JSON.stringify(filteredBackups));
      return true;
    } catch (error) {
      console.error('Failed to delete backup:', error);
      return false;
    }
  }

  /**
   * Subscribe to configuration changes
   */
  onChange(listener: (event: ConfigChangeEvent) => void): () => void {
    this.changeListeners.add(listener);
    return () => this.changeListeners.delete(listener);
  }

  /**
   * Get configuration schema for UI generation
   */
  getConfigSchema(): any {
    return {
      realTime: {
        type: 'object',
        properties: {
          enableWebSocket: { type: 'boolean', title: 'Enable WebSocket' },
          enablePollingFallback: { type: 'boolean', title: 'Enable Polling Fallback' },
          heartbeatInterval: { type: 'number', title: 'Heartbeat Interval (ms)', min: 5000, max: 120000 },
          pollingInterval: { type: 'number', title: 'Polling Interval (ms)', min: 1000, max: 30000 }
        }
      },
      display: {
        type: 'object',
        properties: {
          theme: { type: 'string', enum: ['light', 'dark', 'system'], title: 'Theme' },
          compactMode: { type: 'boolean', title: 'Compact Mode' },
          showAnimations: { type: 'boolean', title: 'Show Animations' },
          refreshRate: { type: 'number', title: 'Refresh Rate (seconds)', min: 5, max: 300 }
        }
      }
      // ... more schema definitions
    };
  }

  // ===== PRIVATE METHODS =====

  private getDefaultConfig(): DashboardConfig {
    return {
      realTime: {
        enableWebSocket: true,
        enablePollingFallback: true,
        heartbeatInterval: 30000,
        maxReconnectAttempts: 10,
        updateThrottling: {
          enabled: true,
          interval: 1000
        },
        bandwidthOptimization: true,
        pollingInterval: 5000
      },
      display: {
        theme: 'system',
        compactMode: false,
        showAnimations: true,
        showSparklines: true,
        refreshRate: 30,
        autoRefresh: true,
        showRealTimeIndicators: true,
        cardLayout: 'grid',
        density: 'comfortable'
      },
      performance: {
        enableVirtualization: true,
        maxDataPoints: 1000,
        cacheSize: 50,
        lazyLoading: true,
        prefetchData: true,
        optimizeForMobile: false
      },
      analytics: {
        enablePredictiveAnalytics: true,
        enableAnomalyDetection: true,
        retentionPeriod: 30,
        aggregationLevels: ['hour', 'day'],
        showAdvancedMetrics: true,
        enableBenchmarking: true
      },
      alerts: {
        enableDesktopNotifications: true,
        enableSounds: false,
        alertThresholds: {
          cycleUsage: 80,
          errorRate: 5,
          responseTime: 1000,
          uptime: 95
        },
        criticalAlertCooldown: 5
      }
    };
  }

  private initializeValidationRules(): void {
    this.validationRules = [
      {
        path: 'realTime.heartbeatInterval',
        type: 'number',
        min: 5000,
        max: 120000,
        errorMessage: 'Heartbeat interval must be between 5 and 120 seconds'
      },
      {
        path: 'realTime.pollingInterval',
        type: 'number',
        min: 1000,
        max: 30000,
        errorMessage: 'Polling interval must be between 1 and 30 seconds'
      },
      {
        path: 'display.theme',
        type: 'string',
        enum: ['light', 'dark', 'system'],
        errorMessage: 'Theme must be light, dark, or system'
      },
      {
        path: 'display.refreshRate',
        type: 'number',
        min: 5,
        max: 300,
        errorMessage: 'Refresh rate must be between 5 and 300 seconds'
      },
      {
        path: 'performance.maxDataPoints',
        type: 'number',
        min: 100,
        max: 10000,
        errorMessage: 'Max data points must be between 100 and 10,000'
      },
      {
        path: 'alerts.alertThresholds.cycleUsage',
        type: 'number',
        min: 10,
        max: 100,
        errorMessage: 'Cycle usage threshold must be between 10% and 100%'
      }
    ];
  }

  private initializeMigrations(): void {
    this.migrations = [
      {
        version: '1.0.0',
        description: 'Initial configuration version',
        migrate: (config: any) => config
      }
      // Add future migrations here
    ];
  }

  private loadConfiguration(): void {
    try {
      const savedConfig = localStorage.getItem(this.storageKey);
      if (savedConfig) {
        const parsed = JSON.parse(savedConfig);
        const migrated = this.migrateConfiguration(parsed);
        const validation = this.validateConfiguration(migrated);
        
        if (validation.isValid) {
          this.config = migrated;
        } else {
          console.warn('Saved configuration is invalid, using defaults:', validation.errors);
        }
      }
    } catch (error) {
      console.error('Failed to load configuration:', error);
    }
  }

  private saveConfiguration(): void {
    try {
      const configWithMetadata = {
        version: this.version,
        timestamp: new Date().toISOString(),
        config: this.config
      };
      
      localStorage.setItem(this.storageKey, JSON.stringify(configWithMetadata));
    } catch (error) {
      console.error('Failed to save configuration:', error);
    }
  }

  private validateConfiguration(config: any): { isValid: boolean; errors: string[] } {
    const errors: string[] = [];

    for (const rule of this.validationRules) {
      const value = this.getValueByPath(config, rule.path);
      const validation = this.validateValue(value, rule);
      
      if (!validation.isValid) {
        errors.push(validation.error || `Invalid value for ${rule.path}`);
      }
    }

    return { isValid: errors.length === 0, errors };
  }

  private validateConfigChange(path: string, value: any): { isValid: boolean; errors: string[] } {
    const rule = this.validationRules.find(r => r.path === path);
    if (!rule) {
      return { isValid: true, errors: [] };
    }

    const validation = this.validateValue(value, rule);
    return {
      isValid: validation.isValid,
      errors: validation.isValid ? [] : [validation.error || 'Validation failed']
    };
  }

  private validateValue(value: any, rule: ConfigValidationRule): { isValid: boolean; error?: string } {
    // Type validation
    if (typeof value !== rule.type) {
      return { isValid: false, error: rule.errorMessage || `Expected ${rule.type}, got ${typeof value}` };
    }

    // Range validation for numbers
    if (rule.type === 'number') {
      if (rule.min !== undefined && value < rule.min) {
        return { isValid: false, error: rule.errorMessage || `Value must be at least ${rule.min}` };
      }
      if (rule.max !== undefined && value > rule.max) {
        return { isValid: false, error: rule.errorMessage || `Value must be at most ${rule.max}` };
      }
    }

    // Enum validation
    if (rule.enum && !rule.enum.includes(value)) {
      return { isValid: false, error: rule.errorMessage || `Value must be one of: ${rule.enum.join(', ')}` };
    }

    // Custom validator
    if (rule.validator && !rule.validator(value)) {
      return { isValid: false, error: rule.errorMessage || 'Custom validation failed' };
    }

    return { isValid: true };
  }

  private migrateConfiguration(config: any): any {
    let migratedConfig = { ...config };
    
    // Apply migrations in order
    for (const migration of this.migrations) {
      try {
        migratedConfig = migration.migrate(migratedConfig);
      } catch (error) {
        console.error(`Migration ${migration.version} failed:`, error);
      }
    }

    return migratedConfig;
  }

  private getValueByPath(obj: any, path: string): any {
    return path.split('.').reduce((current, key) => current?.[key], obj);
  }

  private setValueByPath(obj: any, path: string, value: any): void {
    const keys = path.split('.');
    const lastKey = keys.pop()!;
    const target = keys.reduce((current, key) => {
      if (!(key in current)) {
        current[key] = {};
      }
      return current[key];
    }, obj);
    
    target[lastKey] = value;
  }

  private notifyChangeListeners(event: ConfigChangeEvent): void {
    this.changeListeners.forEach(listener => {
      try {
        listener(event);
      } catch (error) {
        console.error('Error in configuration change listener:', error);
      }
    });
  }

  private calculateChecksum(data: string): string {
    // Simple checksum calculation (in production, use a proper hash function)
    let hash = 0;
    for (let i = 0; i < data.length; i++) {
      const char = data.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash; // Convert to 32-bit integer
    }
    return hash.toString(16);
  }
}

// Export singleton instance
export const configurationManager = ConfigurationManager.getInstance();

// Export factory function for testing
export const createConfigurationManager = () => new ConfigurationManager();