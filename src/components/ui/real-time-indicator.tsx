import React from 'react';
import { cn } from '@/lib/utils';
import { Badge } from '@/components/ui/badge';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { 
  Wifi, 
  WifiOff, 
  Clock, 
  Zap, 
  Activity,
  AlertCircle,
  CheckCircle,
  Loader2
} from 'lucide-react';

/**
 * Connection status types
 */
export type ConnectionStatus = 'connected' | 'disconnected' | 'connecting' | 'error';
export type ConnectionQuality = 'excellent' | 'good' | 'poor' | 'unstable';
export type DataFreshness = 'live' | 'recent' | 'stale' | 'offline';

/**
 * Real-time indicator props
 */
export interface RealTimeIndicatorProps {
  status: ConnectionStatus;
  quality?: ConnectionQuality;
  lastUpdate?: Date;
  updateFrequency?: number; // updates per minute
  dataFreshness?: DataFreshness;
  bandwidthUsage?: number; // bytes per second
  className?: string;
  showDetails?: boolean;
  size?: 'sm' | 'md' | 'lg';
}

/**
 * Connection status indicator component
 */
export const ConnectionStatusIndicator: React.FC<{
  status: ConnectionStatus;
  quality?: ConnectionQuality;
  size?: 'sm' | 'md' | 'lg';
  showLabel?: boolean;
}> = ({ status, quality, size = 'md', showLabel = true }) => {
  const getStatusConfig = () => {
    switch (status) {
      case 'connected':
        return {
          icon: Wifi,
          color: 'text-green-500',
          bgColor: 'bg-green-100 dark:bg-green-900/20',
          label: 'Connected',
          pulse: false
        };
      case 'connecting':
        return {
          icon: Loader2,
          color: 'text-yellow-500',
          bgColor: 'bg-yellow-100 dark:bg-yellow-900/20',
          label: 'Connecting',
          pulse: true
        };
      case 'disconnected':
        return {
          icon: WifiOff,
          color: 'text-gray-500',
          bgColor: 'bg-gray-100 dark:bg-gray-900/20',
          label: 'Disconnected',
          pulse: false
        };
      case 'error':
        return {
          icon: AlertCircle,
          color: 'text-red-500',
          bgColor: 'bg-red-100 dark:bg-red-900/20',
          label: 'Error',
          pulse: true
        };
    }
  };

  const getQualityColor = () => {
    if (!quality || status !== 'connected') return '';
    
    switch (quality) {
      case 'excellent':
        return 'border-green-400';
      case 'good':
        return 'border-blue-400';
      case 'poor':
        return 'border-yellow-400';
      case 'unstable':
        return 'border-red-400';
      default:
        return '';
    }
  };

  const config = getStatusConfig();
  const Icon = config.icon;
  
  const sizeClasses = {
    sm: 'w-4 h-4',
    md: 'w-5 h-5',
    lg: 'w-6 h-6'
  };

  return (
    <div className="flex items-center space-x-2">
      <div className={cn(
        'relative rounded-full p-1.5 border-2',
        config.bgColor,
        getQualityColor(),
        config.pulse && 'animate-pulse'
      )}>
        <Icon className={cn(
          sizeClasses[size],
          config.color,
          status === 'connecting' && 'animate-spin'
        )} />
        
        {/* Quality indicator dots */}
        {status === 'connected' && quality && (
          <div className="absolute -bottom-1 -right-1 flex space-x-0.5">
            {Array.from({ length: 3 }).map((_, i) => (
              <div
                key={i}
                className={cn(
                  'w-1 h-1 rounded-full',
                  i < (quality === 'excellent' ? 3 : quality === 'good' ? 2 : 1)
                    ? config.color.replace('text-', 'bg-')
                    : 'bg-gray-300'
                )}
              />
            ))}
          </div>
        )}
      </div>
      
      {showLabel && (
        <span className={cn(
          'text-sm font-medium',
          config.color
        )}>
          {config.label}
        </span>
      )}
    </div>
  );
};

/**
 * Data freshness indicator
 */
export const DataFreshnessIndicator: React.FC<{
  freshness: DataFreshness;
  lastUpdate?: Date;
  size?: 'sm' | 'md' | 'lg';
}> = ({ freshness, lastUpdate, size = 'md' }) => {
  const getFreshnessConfig = () => {
    switch (freshness) {
      case 'live':
        return {
          icon: Activity,
          color: 'text-green-500',
          bgColor: 'bg-green-100 dark:bg-green-900/20',
          label: 'Live',
          pulse: true
        };
      case 'recent':
        return {
          icon: CheckCircle,
          color: 'text-blue-500',
          bgColor: 'bg-blue-100 dark:bg-blue-900/20',
          label: 'Recent',
          pulse: false
        };
      case 'stale':
        return {
          icon: Clock,
          color: 'text-yellow-500',
          bgColor: 'bg-yellow-100 dark:bg-yellow-900/20',
          label: 'Stale',
          pulse: false
        };
      case 'offline':
        return {
          icon: WifiOff,
          color: 'text-gray-500',
          bgColor: 'bg-gray-100 dark:bg-gray-900/20',
          label: 'Offline',
          pulse: false
        };
    }
  };

  const config = getFreshnessConfig();
  const Icon = config.icon;
  
  const sizeClasses = {
    sm: 'w-3 h-3',
    md: 'w-4 h-4',
    lg: 'w-5 h-5'
  };

  const getTimeAgo = () => {
    if (!lastUpdate) return '';
    
    const now = new Date();
    const diff = now.getTime() - lastUpdate.getTime();
    const seconds = Math.floor(diff / 1000);
    const minutes = Math.floor(seconds / 60);
    const hours = Math.floor(minutes / 60);
    
    if (seconds < 60) return `${seconds}s ago`;
    if (minutes < 60) return `${minutes}m ago`;
    return `${hours}h ago`;
  };

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <div className="flex items-center space-x-1">
            <div className={cn(
              'rounded-full p-1',
              config.bgColor,
              config.pulse && 'animate-pulse'
            )}>
              <Icon className={cn(sizeClasses[size], config.color)} />
            </div>
            <span className={cn('text-xs', config.color)}>
              {config.label}
            </span>
          </div>
        </TooltipTrigger>
        <TooltipContent>
          <div className="text-sm">
            <div>Data freshness: {config.label}</div>
            {lastUpdate && <div>Last update: {getTimeAgo()}</div>}
          </div>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
};

/**
 * Update frequency indicator
 */
export const UpdateFrequencyIndicator: React.FC<{
  frequency: number; // updates per minute
  size?: 'sm' | 'md' | 'lg';
}> = ({ frequency, size = 'md' }) => {
  const getFrequencyLevel = () => {
    if (frequency >= 60) return 'high';
    if (frequency >= 10) return 'medium';
    if (frequency > 0) return 'low';
    return 'none';
  };

  const getFrequencyConfig = () => {
    const level = getFrequencyLevel();
    
    switch (level) {
      case 'high':
        return {
          color: 'text-green-500',
          bgColor: 'bg-green-100 dark:bg-green-900/20',
          label: 'High',
          bars: 3
        };
      case 'medium':
        return {
          color: 'text-blue-500',
          bgColor: 'bg-blue-100 dark:bg-blue-900/20',
          label: 'Medium',
          bars: 2
        };
      case 'low':
        return {
          color: 'text-yellow-500',
          bgColor: 'bg-yellow-100 dark:bg-yellow-900/20',
          label: 'Low',
          bars: 1
        };
      case 'none':
        return {
          color: 'text-gray-500',
          bgColor: 'bg-gray-100 dark:bg-gray-900/20',
          label: 'None',
          bars: 0
        };
    }
  };

  const config = getFrequencyConfig();
  
  const barSizes = {
    sm: ['w-0.5 h-2', 'w-0.5 h-3', 'w-0.5 h-4'],
    md: ['w-1 h-3', 'w-1 h-4', 'w-1 h-5'],
    lg: ['w-1.5 h-4', 'w-1.5 h-5', 'w-1.5 h-6']
  };

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <div className="flex items-center space-x-2">
            <div className={cn('rounded p-1', config.bgColor)}>
              <div className="flex items-end space-x-0.5">
                {Array.from({ length: 3 }).map((_, i) => (
                  <div
                    key={i}
                    className={cn(
                      barSizes[size][i],
                      'rounded-sm',
                      i < config.bars 
                        ? config.color.replace('text-', 'bg-')
                        : 'bg-gray-300 dark:bg-gray-600'
                    )}
                  />
                ))}
              </div>
            </div>
            <span className={cn('text-xs', config.color)}>
              {frequency > 0 ? `${frequency}/min` : 'No updates'}
            </span>
          </div>
        </TooltipTrigger>
        <TooltipContent>
          <div className="text-sm">
            <div>Update frequency: {config.label}</div>
            <div>{frequency} updates per minute</div>
          </div>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
};

/**
 * Bandwidth usage indicator
 */
export const BandwidthIndicator: React.FC<{
  usage: number; // bytes per second
  limit?: number; // bytes per second
  size?: 'sm' | 'md' | 'lg';
}> = ({ usage, limit, size = 'md' }) => {
  const formatBytes = (bytes: number) => {
    if (bytes === 0) return '0 B/s';
    
    const k = 1024;
    const sizes = ['B/s', 'KB/s', 'MB/s', 'GB/s'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    
    return `${parseFloat((bytes / Math.pow(k, i)).toFixed(1))} ${sizes[i]}`;
  };

  const getUsageLevel = () => {
    if (!limit) return 'normal';
    
    const percentage = (usage / limit) * 100;
    if (percentage >= 90) return 'critical';
    if (percentage >= 70) return 'high';
    if (percentage >= 40) return 'medium';
    return 'low';
  };

  const getUsageConfig = () => {
    const level = getUsageLevel();
    
    switch (level) {
      case 'critical':
        return {
          color: 'text-red-500',
          bgColor: 'bg-red-100 dark:bg-red-900/20',
          icon: AlertCircle
        };
      case 'high':
        return {
          color: 'text-yellow-500',
          bgColor: 'bg-yellow-100 dark:bg-yellow-900/20',
          icon: Zap
        };
      case 'medium':
        return {
          color: 'text-blue-500',
          bgColor: 'bg-blue-100 dark:bg-blue-900/20',
          icon: Activity
        };
      default:
        return {
          color: 'text-green-500',
          bgColor: 'bg-green-100 dark:bg-green-900/20',
          icon: CheckCircle
        };
    }
  };

  const config = getUsageConfig();
  const Icon = config.icon;
  
  const sizeClasses = {
    sm: 'w-3 h-3',
    md: 'w-4 h-4',
    lg: 'w-5 h-5'
  };

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <div className="flex items-center space-x-2">
            <div className={cn('rounded p-1', config.bgColor)}>
              <Icon className={cn(sizeClasses[size], config.color)} />
            </div>
            <span className={cn('text-xs', config.color)}>
              {formatBytes(usage)}
            </span>
          </div>
        </TooltipTrigger>
        <TooltipContent>
          <div className="text-sm">
            <div>Bandwidth usage: {formatBytes(usage)}</div>
            {limit && (
              <div>
                Limit: {formatBytes(limit)} ({Math.round((usage / limit) * 100)}%)
              </div>
            )}
          </div>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
};

/**
 * Main real-time indicator component
 */
export const RealTimeIndicator: React.FC<RealTimeIndicatorProps> = ({
  status,
  quality,
  lastUpdate,
  updateFrequency = 0,
  dataFreshness = 'offline',
  bandwidthUsage = 0,
  className,
  showDetails = true,
  size = 'md'
}) => {
  return (
    <div className={cn('flex items-center space-x-4', className)}>
      <ConnectionStatusIndicator 
        status={status} 
        quality={quality} 
        size={size}
        showLabel={showDetails}
      />
      
      {showDetails && (
        <>
          <DataFreshnessIndicator 
            freshness={dataFreshness} 
            lastUpdate={lastUpdate}
            size={size}
          />
          
          <UpdateFrequencyIndicator 
            frequency={updateFrequency}
            size={size}
          />
          
          {bandwidthUsage > 0 && (
            <BandwidthIndicator 
              usage={bandwidthUsage}
              size={size}
            />
          )}
        </>
      )}
    </div>
  );
};

/**
 * Compact real-time status badge
 */
export const RealTimeStatusBadge: React.FC<{
  status: ConnectionStatus;
  quality?: ConnectionQuality;
  isLive?: boolean;
}> = ({ status, quality, isLive = false }) => {
  const getVariant = () => {
    switch (status) {
      case 'connected':
        return isLive ? 'default' : 'secondary';
      case 'connecting':
        return 'outline';
      case 'disconnected':
        return 'secondary';
      case 'error':
        return 'destructive';
    }
  };

  const getLabel = () => {
    if (status === 'connected' && isLive) return 'Live';
    if (status === 'connected') return 'Connected';
    if (status === 'connecting') return 'Connecting...';
    if (status === 'disconnected') return 'Offline';
    return 'Error';
  };

  return (
    <Badge variant={getVariant()} className="flex items-center space-x-1">
      {isLive && status === 'connected' && (
        <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
      )}
      <span>{getLabel()}</span>
    </Badge>
  );
};