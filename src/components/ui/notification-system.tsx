import React, { useState, useEffect, useCallback, createContext, useContext } from 'react';
import { createPortal } from 'react-dom';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import { 
  X, 
  CheckCircle, 
  AlertCircle, 
  Info, 
  AlertTriangle,
  Clock,
  Volume2,
  VolumeX,
  Settings,
  Maximize2,
  Minimize2
} from 'lucide-react';
import { 
  DashboardNotification, 
  NotificationAction, 
  NotificationOptions,
  GlobalNotificationOptions,
  NotificationPosition,
  EnhancedDashboardError
} from '@/types/dashboard';

/**
 * Notification context for managing global state
 */
interface NotificationContextType {
  notifications: DashboardNotification[];
  addNotification: (notification: Omit<DashboardNotification, 'id' | 'timestamp'>) => string;
  removeNotification: (id: string) => void;
  clearAllNotifications: () => void;
  showSuccess: (message: string, options?: NotificationOptions) => void;
  showWarning: (message: string, options?: NotificationOptions) => void;
  showError: (error: EnhancedDashboardError | string, options?: NotificationOptions) => void;
  showInfo: (message: string, options?: NotificationOptions) => void;
  updateGlobalOptions: (options: Partial<GlobalNotificationOptions>) => void;
  globalOptions: GlobalNotificationOptions;
}

const NotificationContext = createContext<NotificationContextType | null>(null);

/**
 * Default global notification options
 */
const DEFAULT_GLOBAL_OPTIONS: GlobalNotificationOptions = {
  position: 'top-right',
  maxNotifications: 5,
  defaultDuration: 5000,
  enableSounds: false,
  enableAnimations: true
};

/**
 * Notification Provider Component
 */
export const NotificationProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [notifications, setNotifications] = useState<DashboardNotification[]>([]);
  const [globalOptions, setGlobalOptions] = useState<GlobalNotificationOptions>(DEFAULT_GLOBAL_OPTIONS);

  // Add notification
  const addNotification = useCallback((
    notification: Omit<DashboardNotification, 'id' | 'timestamp'>
  ): string => {
    const id = `notification_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    const newNotification: DashboardNotification = {
      ...notification,
      id,
      timestamp: new Date().toISOString()
    };

    setNotifications(prev => {
      const updated = [newNotification, ...prev];
      
      // Limit number of notifications
      if (updated.length > globalOptions.maxNotifications) {
        return updated.slice(0, globalOptions.maxNotifications);
      }
      
      return updated;
    });

    // Auto-remove non-persistent notifications
    if (!notification.persistent) {
      const duration = notification.type === 'error' ? 8000 : globalOptions.defaultDuration;
      setTimeout(() => {
        removeNotification(id);
      }, duration);
    }

    // Play sound if enabled
    if (globalOptions.enableSounds) {
      playNotificationSound(notification.type);
    }

    return id;
  }, [globalOptions]);

  // Remove notification
  const removeNotification = useCallback((id: string) => {
    setNotifications(prev => prev.filter(n => n.id !== id));
  }, []);

  // Clear all notifications
  const clearAllNotifications = useCallback(() => {
    setNotifications([]);
  }, []);

  // Convenience methods
  const showSuccess = useCallback((message: string, options?: NotificationOptions) => {
    addNotification({
      type: 'success',
      title: 'Success',
      message,
      persistent: options?.persistent || false,
      actions: options?.actions
    });
  }, [addNotification]);

  const showWarning = useCallback((message: string, options?: NotificationOptions) => {
    addNotification({
      type: 'warning',
      title: 'Warning',
      message,
      persistent: options?.persistent || false,
      actions: options?.actions
    });
  }, [addNotification]);

  const showError = useCallback((
    error: EnhancedDashboardError | string, 
    options?: NotificationOptions
  ) => {
    const message = typeof error === 'string' ? error : error.message;
    const title = typeof error === 'string' ? 'Error' : `${error.type} Error`;
    
    const actions: NotificationAction[] = [];
    
    // Add recovery actions for enhanced errors
    if (typeof error !== 'string' && error.recovery.actions.length > 0) {
      const primaryAction = error.recovery.actions[0];
      actions.push({
        label: primaryAction.label,
        action: primaryAction.action,
        style: 'primary'
      });
    }

    addNotification({
      type: 'error',
      title,
      message,
      persistent: options?.persistent || true, // Errors are persistent by default
      actions: [...actions, ...(options?.actions || [])],
      metadata: typeof error !== 'string' ? {
        source: 'error-handler',
        category: error.category,
        priority: error.severity === 'critical' ? 3 : error.severity === 'high' ? 2 : 1
      } : undefined
    });
  }, [addNotification]);

  const showInfo = useCallback((message: string, options?: NotificationOptions) => {
    addNotification({
      type: 'info',
      title: 'Information',
      message,
      persistent: options?.persistent || false,
      actions: options?.actions
    });
  }, [addNotification]);

  const updateGlobalOptions = useCallback((options: Partial<GlobalNotificationOptions>) => {
    setGlobalOptions(prev => ({ ...prev, ...options }));
  }, []);

  const contextValue: NotificationContextType = {
    notifications,
    addNotification,
    removeNotification,
    clearAllNotifications,
    showSuccess,
    showWarning,
    showError,
    showInfo,
    updateGlobalOptions,
    globalOptions
  };

  return (
    <NotificationContext.Provider value={contextValue}>
      {children}
      <NotificationContainer />
    </NotificationContext.Provider>
  );
};

/**
 * Hook to use notification system
 */
export const useNotifications = () => {
  const context = useContext(NotificationContext);
  if (!context) {
    throw new Error('useNotifications must be used within a NotificationProvider');
  }
  return context;
};

/**
 * Notification Container Component
 */
const NotificationContainer: React.FC = () => {
  const { notifications, globalOptions } = useNotifications();
  const [isMinimized, setIsMinimized] = useState(false);

  if (notifications.length === 0) return null;

  const containerClasses = cn(
    'notification-container',
    globalOptions.position,
    'flex flex-col space-y-2',
    isMinimized && 'opacity-50 hover:opacity-100 transition-opacity'
  );

  return createPortal(
    <div className={containerClasses}>
      {/* Container header for multiple notifications */}
      {notifications.length > 1 && (
        <NotificationHeader 
          count={notifications.length}
          isMinimized={isMinimized}
          onToggleMinimize={() => setIsMinimized(!isMinimized)}
        />
      )}
      
      {/* Notification items */}
      {(!isMinimized || notifications.length === 1) && notifications.map((notification, index) => (
        <NotificationItem 
          key={notification.id} 
          notification={notification}
          index={index}
          enableAnimations={globalOptions.enableAnimations}
        />
      ))}
    </div>,
    document.body
  );
};

/**
 * Notification Header Component
 */
const NotificationHeader: React.FC<{
  count: number;
  isMinimized: boolean;
  onToggleMinimize: () => void;
}> = ({ count, isMinimized, onToggleMinimize }) => {
  const { clearAllNotifications } = useNotifications();

  return (
    <Card className="p-2 bg-background/95 backdrop-blur-sm border-border/50">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <Badge variant="secondary" className="text-xs">
            {count} notifications
          </Badge>
        </div>
        
        <div className="flex items-center space-x-1">
          <Button
            variant="ghost"
            size="sm"
            onClick={onToggleMinimize}
            className="h-6 w-6 p-0"
          >
            {isMinimized ? (
              <Maximize2 className="h-3 w-3" />
            ) : (
              <Minimize2 className="h-3 w-3" />
            )}
          </Button>
          
          <Button
            variant="ghost"
            size="sm"
            onClick={clearAllNotifications}
            className="h-6 w-6 p-0"
          >
            <X className="h-3 w-3" />
          </Button>
        </div>
      </div>
    </Card>
  );
};

/**
 * Individual Notification Item Component
 */
const NotificationItem: React.FC<{
  notification: DashboardNotification;
  index: number;
  enableAnimations: boolean;
}> = ({ notification, index, enableAnimations }) => {
  const { removeNotification } = useNotifications();
  const [isVisible, setIsVisible] = useState(true);
  const [progress, setProgress] = useState(100);

  // Auto-hide progress for non-persistent notifications
  useEffect(() => {
    if (!notification.persistent) {
      const duration = notification.type === 'error' ? 8000 : 5000;
      const interval = 50; // Update every 50ms
      const decrement = (interval / duration) * 100;
      
      const timer = setInterval(() => {
        setProgress(prev => {
          const newProgress = prev - decrement;
          if (newProgress <= 0) {
            clearInterval(timer);
            handleClose();
            return 0;
          }
          return newProgress;
        });
      }, interval);

      return () => clearInterval(timer);
    }
  }, [notification.persistent, notification.type]);

  const handleClose = () => {
    if (enableAnimations) {
      setIsVisible(false);
      setTimeout(() => {
        removeNotification(notification.id);
      }, 300); // Match animation duration
    } else {
      removeNotification(notification.id);
    }
  };

  const getNotificationConfig = () => {
    switch (notification.type) {
      case 'success':
        return {
          icon: CheckCircle,
          iconColor: 'text-green-500',
          borderColor: 'border-green-500/20',
          bgColor: 'bg-green-50 dark:bg-green-900/10'
        };
      case 'warning':
        return {
          icon: AlertTriangle,
          iconColor: 'text-yellow-500',
          borderColor: 'border-yellow-500/20',
          bgColor: 'bg-yellow-50 dark:bg-yellow-900/10'
        };
      case 'error':
        return {
          icon: AlertCircle,
          iconColor: 'text-red-500',
          borderColor: 'border-red-500/20',
          bgColor: 'bg-red-50 dark:bg-red-900/10'
        };
      case 'info':
        return {
          icon: Info,
          iconColor: 'text-blue-500',
          borderColor: 'border-blue-500/20',
          bgColor: 'bg-blue-50 dark:bg-blue-900/10'
        };
    }
  };

  const config = getNotificationConfig();
  const Icon = config.icon;

  return (
    <Card className={cn(
      'notification-item relative overflow-hidden',
      'bg-background/95 backdrop-blur-sm border-border/50',
      config.borderColor,
      config.bgColor,
      enableAnimations && isVisible && 'animate-notification-enter',
      enableAnimations && !isVisible && 'animate-notification-exit',
      enableAnimations && `animate-delay-${Math.min(index * 100, 500)}`
    )}>
      {/* Progress bar for auto-hide */}
      {!notification.persistent && (
        <div className="absolute top-0 left-0 right-0 h-1 bg-gray-200 dark:bg-gray-700">
          <div 
            className="h-full bg-primary transition-all duration-50 ease-linear"
            style={{ width: `${progress}%` }}
          />
        </div>
      )}

      <div className="p-4">
        <div className="flex items-start space-x-3">
          {/* Icon */}
          <div className="flex-shrink-0">
            <Icon className={cn('h-5 w-5', config.iconColor)} />
          </div>

          {/* Content */}
          <div className="flex-1 min-w-0">
            <div className="flex items-center justify-between">
              <h4 className="text-sm font-medium text-foreground">
                {notification.title}
              </h4>
              
              <div className="flex items-center space-x-2">
                {/* Timestamp */}
                <div className="flex items-center space-x-1 text-xs text-muted-foreground">
                  <Clock className="h-3 w-3" />
                  <span>
                    {new Date(notification.timestamp).toLocaleTimeString()}
                  </span>
                </div>
                
                {/* Close button */}
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleClose}
                  className="h-6 w-6 p-0 hover:bg-background/50"
                >
                  <X className="h-3 w-3" />
                </Button>
              </div>
            </div>

            {/* Message */}
            <p className="mt-1 text-sm text-muted-foreground">
              {notification.message}
            </p>

            {/* Metadata */}
            {notification.metadata && (
              <div className="mt-2 flex items-center space-x-2">
                {notification.metadata.source && (
                  <Badge variant="outline" className="text-xs">
                    {notification.metadata.source}
                  </Badge>
                )}
                {notification.metadata.category && (
                  <Badge variant="secondary" className="text-xs">
                    {notification.metadata.category}
                  </Badge>
                )}
              </div>
            )}

            {/* Actions */}
            {notification.actions && notification.actions.length > 0 && (
              <div className="mt-3 flex items-center space-x-2">
                {notification.actions.map((action, actionIndex) => (
                  <Button
                    key={actionIndex}
                    variant={action.style === 'primary' ? 'default' : 
                            action.style === 'danger' ? 'destructive' : 'outline'}
                    size="sm"
                    onClick={() => {
                      action.action();
                      if (action.style !== 'secondary') {
                        handleClose();
                      }
                    }}
                    className="text-xs"
                  >
                    {action.label}
                  </Button>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </Card>
  );
};

/**
 * Notification Settings Component
 */
export const NotificationSettings: React.FC<{
  className?: string;
}> = ({ className }) => {
  const { globalOptions, updateGlobalOptions } = useNotifications();

  const positions: { value: NotificationPosition; label: string }[] = [
    { value: 'top-right', label: 'Top Right' },
    { value: 'top-left', label: 'Top Left' },
    { value: 'bottom-right', label: 'Bottom Right' },
    { value: 'bottom-left', label: 'Bottom Left' },
    { value: 'top-center', label: 'Top Center' },
    { value: 'bottom-center', label: 'Bottom Center' }
  ];

  return (
    <Card className={cn('p-4', className)}>
      <div className="space-y-4">
        <div className="flex items-center space-x-2">
          <Settings className="h-4 w-4" />
          <h3 className="text-sm font-medium">Notification Settings</h3>
        </div>

        {/* Position */}
        <div className="space-y-2">
          <label className="text-xs font-medium">Position</label>
          <select
            value={globalOptions.position}
            onChange={(e) => updateGlobalOptions({ position: e.target.value as NotificationPosition })}
            className="w-full text-xs border rounded px-2 py-1"
          >
            {positions.map(pos => (
              <option key={pos.value} value={pos.value}>
                {pos.label}
              </option>
            ))}
          </select>
        </div>

        {/* Max notifications */}
        <div className="space-y-2">
          <label className="text-xs font-medium">Max Notifications</label>
          <input
            type="number"
            min="1"
            max="10"
            value={globalOptions.maxNotifications}
            onChange={(e) => updateGlobalOptions({ maxNotifications: parseInt(e.target.value) })}
            className="w-full text-xs border rounded px-2 py-1"
          />
        </div>

        {/* Duration */}
        <div className="space-y-2">
          <label className="text-xs font-medium">Default Duration (ms)</label>
          <input
            type="number"
            min="1000"
            max="30000"
            step="1000"
            value={globalOptions.defaultDuration}
            onChange={(e) => updateGlobalOptions({ defaultDuration: parseInt(e.target.value) })}
            className="w-full text-xs border rounded px-2 py-1"
          />
        </div>

        {/* Toggles */}
        <div className="space-y-2">
          <label className="flex items-center space-x-2 text-xs">
            <input
              type="checkbox"
              checked={globalOptions.enableSounds}
              onChange={(e) => updateGlobalOptions({ enableSounds: e.target.checked })}
            />
            <Volume2 className="h-3 w-3" />
            <span>Enable Sounds</span>
          </label>

          <label className="flex items-center space-x-2 text-xs">
            <input
              type="checkbox"
              checked={globalOptions.enableAnimations}
              onChange={(e) => updateGlobalOptions({ enableAnimations: e.target.checked })}
            />
            <span>Enable Animations</span>
          </label>
        </div>
      </div>
    </Card>
  );
};

/**
 * Play notification sound
 */
const playNotificationSound = (type: DashboardNotification['type']) => {
  // Create audio context and play appropriate sound
  try {
    const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
    const oscillator = audioContext.createOscillator();
    const gainNode = audioContext.createGain();

    oscillator.connect(gainNode);
    gainNode.connect(audioContext.destination);

    // Different frequencies for different notification types
    const frequencies = {
      success: 800,
      info: 600,
      warning: 400,
      error: 300
    };

    oscillator.frequency.setValueAtTime(frequencies[type], audioContext.currentTime);
    oscillator.type = 'sine';

    gainNode.gain.setValueAtTime(0.1, audioContext.currentTime);
    gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.3);

    oscillator.start(audioContext.currentTime);
    oscillator.stop(audioContext.currentTime + 0.3);
  } catch (error) {
    console.warn('Could not play notification sound:', error);
  }
};

export default NotificationProvider;