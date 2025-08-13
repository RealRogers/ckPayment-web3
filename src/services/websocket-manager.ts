import { ICPTransactionData, ICPMetricsData, EnhancedDashboardError } from '@/types/dashboard';

/**
 * WebSocket connection states
 */
export type ConnectionStatus = 'connected' | 'connecting' | 'disconnected' | 'error';
export type ConnectionQuality = 'excellent' | 'good' | 'poor' | 'unstable';

/**
 * WebSocket event types for ICP dashboard
 */
export type WebSocketEventType = 
  | 'metrics_update'
  | 'transaction_update' 
  | 'error_update'
  | 'canister_status'
  | 'subnet_health'
  | 'cycle_alert'
  | 'subscribe'
  | 'unsubscribe'
  | 'heartbeat'
  | 'heartbeat_reply';

/**
 * Reconnection strategy configuration
 */
export interface ReconnectStrategy {
  maxAttempts: number;
  initialDelay: number;
  maxDelay: number;
  backoffMultiplier: number;
  jitterEnabled: boolean;
}

/**
 * WebSocket configuration options
 */
export interface WebSocketConfig {
  url: string;
  protocols?: string[];
  heartbeatInterval: number;
  reconnectStrategy: ReconnectStrategy;
  maxMessageSize: number;
  compressionEnabled: boolean;
  heartbeatEnabled?: boolean;
}

/**
 * WebSocket message structure
 */
export interface WebSocketMessage<T = any> {
  type: WebSocketEventType;
  timestamp: string;
  data: T;
  metadata?: {
    source: string;
    version: string;
    checksum?: string;
    compressed?: boolean;
  };
}

/**
 * Subscription callback function
 */
export type SubscriptionCallback<T = any> = (data: T, message: WebSocketMessage<T>) => void;

/**
 * Connection quality metrics
 */
export interface ConnectionMetrics {
  latency: number;
  messagesSent: number;
  messagesReceived: number;
  reconnectCount: number;
  lastReconnect?: Date;
  uptime: number;
  errorCount: number;
}

// Simple EventEmitter
class EventEmitter {
    private events: { [key: string]: Function[] } = {};

    public addEventListener(event: string, listener: Function): void {
        if (!this.events[event]) {
            this.events[event] = [];
        }
        this.events[event].push(listener);
    }

    public removeEventListener(event: string, listener: Function): void {
        if (!this.events[event]) return;
        this.events[event] = this.events[event].filter(l => l !== listener);
    }

    protected emit(event: string, data?: any): void {
        if (!this.events[event]) return;
        this.events[event].forEach(listener => listener(data));
    }
}


/**
 * WebSocket Manager for real-time ICP dashboard updates
 * Handles connection lifecycle, subscriptions, and automatic reconnection
 */
export class WebSocketManager extends EventEmitter {
  private ws: WebSocket | null = null;
  private config: WebSocketConfig;
  private subscriptions: { [id: string]: { channel: string, callback: Function } } = {};
  private connectionStatus: ConnectionStatus = 'disconnected';
  private reconnectAttempts = 0;
  private reconnectTimeoutId: ReturnType<typeof setTimeout> | null = null;
  private heartbeatIntervalId: ReturnType<typeof setInterval> | null = null;
  private lastHeartbeatTimestamp = 0;
  private connectionMetrics: ConnectionMetrics;
  private subscriptionCounter = 0;

  private connectionPromise?: {
    resolve: () => void;
    reject: (error: Error) => void;
  };

  constructor(config: WebSocketConfig) {
    super();
    this.config = config;
    this.connectionMetrics = {
      latency: 0,
      messagesSent: 0,
      messagesReceived: 0,
      reconnectCount: 0,
      uptime: 0,
      errorCount: 0,
    };
  }

  private log(...args: any[]) {
    // console.log('[WebSocketManager]', ...args);
  }

  public connect(canisterId?: string): Promise<void> {
    // Prevent multiple concurrent connection attempts
    if (this.connectionStatus === 'connecting') {
      return new Promise((resolve, reject) => {
        const checkStatus = () => {
          if (this.connectionStatus === 'connected') resolve();
          else if (this.connectionStatus === 'error' || this.connectionStatus === 'disconnected') reject(new Error('Connection failed during concurrent attempt.'));
          else setTimeout(checkStatus, 100);
        };
        checkStatus();
      });
    }

    return new Promise<void>((resolve, reject) => {
      this.connectionPromise = { resolve, reject };

      this.setConnectionStatus('connecting');
      const url = canisterId ? `${this.config.url}?canister=${canisterId}` : this.config.url;
      this.ws = new WebSocket(url, this.config.protocols);
      this.setupEventHandlers();
    });
  }

  private setupEventHandlers(): void {
    if (!this.ws) return;

    this.ws.addEventListener('open', () => {
      this.log('WebSocket connected');
      this.setConnectionStatus('connected');
      this.reconnectAttempts = 0;
      this.startHeartbeat();
      this.connectionPromise?.resolve();
    });

    this.ws.addEventListener('close', (event) => {
      this.log(`WebSocket closed: ${event.code} ${event.reason}`);
      this.stopHeartbeat();
      const wasConnected = this.connectionStatus === 'connected';
      this.setConnectionStatus('disconnected');

      if (event.code !== 1000 && wasConnected) {
        this.reconnect();
      } else if (!wasConnected && this.connectionPromise) {
        this.handleConnectionError(new Error(`WebSocket disconnected unexpectedly: ${event.code}`), false);
      }
    });

    this.ws.addEventListener('error', (event) => {
      this.log('WebSocket error:', event);
      const error = new Error('WebSocket connection error');
      this.handleConnectionError(error);
    });

    this.ws.addEventListener('message', (event) => {
      this.handleMessage(event);
    });
  }

  private handleConnectionError(error: Error, shouldReject = true) {
    this.log(error.message);
    this.connectionMetrics.errorCount++;
    this.setConnectionStatus('error');
    if (shouldReject) {
        this.connectionPromise?.reject(error);
    }
  }

  private handleMessage(event: MessageEvent) {
    this.connectionMetrics.messagesReceived++;
    const message = JSON.parse(event.data);

    if (message.type === 'heartbeat_reply') {
      this.connectionMetrics.latency = Date.now() - message.data.timestamp;
      return;
    }

    Object.values(this.subscriptions).forEach(sub => {
      if (sub.channel === message.type) {
        sub.callback(message.data, message);
      }
    });
  }

  public disconnect(): void {
    this.stopHeartbeat();
    if (this.reconnectTimeoutId) {
      clearTimeout(this.reconnectTimeoutId);
      this.reconnectTimeoutId = null;
    }
    if (this.ws) {
      this.ws.close(1000, 'Client disconnect');
    }
    this.setConnectionStatus('disconnected');
  }

  public reconnect(): void {
    if (this.reconnectAttempts >= this.config.reconnectStrategy.maxAttempts) {
      this.log('Max reconnection attempts reached.');
      this.handleConnectionError(new Error('Max reconnection attempts reached.'));
      return;
    }

    const delay = this.config.reconnectStrategy.initialDelay * Math.pow(this.config.reconnectStrategy.backoffMultiplier, this.reconnectAttempts);
    this.reconnectAttempts++;
    this.connectionMetrics.reconnectCount++;
    this.connectionMetrics.lastReconnect = new Date();

    this.log(`Reconnecting in ${Math.round(delay)}ms (attempt ${this.reconnectAttempts})`);

    this.reconnectTimeoutId = setTimeout(async () => {
      try {
        await this.connect();
      } catch (error) {
        this.log('Reconnection attempt failed.');
        // Only schedule the next reconnect if we are not already in a connecting state
        // to avoid race conditions.
        if (this.connectionStatus !== 'connecting') {
          this.reconnect();
        }
      }
    }, delay);
  }

  private setConnectionStatus(status: ConnectionStatus) {
    if (this.connectionStatus !== status) {
      this.connectionStatus = status;
      this.emit('statusChange', { status });
    }
  }

  private sendMessage(message: object) {
    if (this.connectionStatus === 'connected' && this.ws) {
      this.ws.send(JSON.stringify(message));
      this.connectionMetrics.messagesSent++;
    } else {
      this.log('Cannot send message, WebSocket not connected.');
    }
  }

  public subscribe(channel: string, callback: (data: any, message: any) => void): string {
    const id = `sub_${++this.subscriptionCounter}`;
    this.subscriptions[id] = { channel, callback };
    this.sendMessage({ type: 'subscribe', channel });
    return id;
  }

  public unsubscribe(id: string) {
    const channel = this.subscriptions[id]?.channel;
    if (channel) {
      delete this.subscriptions[id];
      this.sendMessage({ type: 'unsubscribe', channel });
    }
  }

  private startHeartbeat() {
    if (!this.config.heartbeatEnabled) return;
    this.stopHeartbeat();
    this.heartbeatIntervalId = setInterval(() => {
      this.sendMessage({ type: 'heartbeat', data: { timestamp: Date.now() } });
    }, this.config.heartbeatInterval);
  }

  private stopHeartbeat() {
    if (this.heartbeatIntervalId) {
      clearInterval(this.heartbeatIntervalId);
      this.heartbeatIntervalId = null;
    }
  }

  public getConnectionStatus(): ConnectionStatus {
    return this.connectionStatus;
  }

  public getConnectionMetrics(): ConnectionMetrics {
    return this.connectionMetrics;
  }

  public getConnectionQuality(): ConnectionQuality {
      const { latency } = this.connectionMetrics;
      if (latency < 150) return 'excellent';
      if (latency < 500) return 'good';
      if (latency < 1000) return 'poor';
      return 'unstable';
  }
}

export const DEFAULT_WEBSOCKET_CONFIG: WebSocketConfig = {
  url: 'wss://icpdashboard.com/api/v1/ws',
  protocols: [],
  heartbeatInterval: 15000,
  heartbeatEnabled: true,
  reconnectStrategy: {
    maxAttempts: 5,
    initialDelay: 1000,
    maxDelay: 30000,
    backoffMultiplier: 1.5,
    jitterEnabled: true,
  },
  maxMessageSize: 1024 * 1024,
  compressionEnabled: false,
};

export const createWebSocketManager = (config?: Partial<WebSocketConfig>): WebSocketManager => {
  const finalConfig = { ...DEFAULT_WEBSOCKET_CONFIG, ...config };
  return new WebSocketManager(finalConfig);
};