/**
 * Unit Tests for WebSocketManager Service
 *
 * @jest-environment jsdom
 */

import { WebSocketManager, DEFAULT_WEBSOCKET_CONFIG } from '../../services/websocket-manager';

// A more controllable mock WebSocket
class MockWebSocket {
  static instances: MockWebSocket[] = [];

  // WebSocket states
  static CONNECTING = 0;
  static OPEN = 1;
  static CLOSING = 2;
  static CLOSED = 3;

  // Public properties
  url: string;
  protocols?: string[];
  readyState: number = MockWebSocket.CONNECTING;

  // Event handlers
  onopen: ((event: Event) => void) | null = null;
  onclose: ((event: CloseEvent) => void) | null = null;
  onerror: ((event: Event) => void) | null = null;
  onmessage: ((event: MessageEvent) => void) | null = null;

  // Mock-specific properties
  sentMessages: any[] = [];

  constructor(url: string, protocols?: string[]) {
    this.url = url;
    this.protocols = protocols;
    MockWebSocket.instances.push(this);
  }

  // Mock-specific methods for test control
  _open() {
    this.readyState = MockWebSocket.OPEN;
    this.dispatchEvent(new Event('open'));
    if (this.onopen) this.onopen(new Event('open'));
  }

  _error(error?: Event) {
    this.readyState = MockWebSocket.CLOSED;
    const errorEvent = error || new Event('error');
    this.dispatchEvent(errorEvent);
    if (this.onerror) this.onerror(errorEvent);
  }

  _close(code = 1000, reason = 'Normal closure') {
    this.readyState = MockWebSocket.CLOSED;
    const closeEvent = new CloseEvent('close', { code, reason });
    this.dispatchEvent(closeEvent);
    if (this.onclose) this.onclose(closeEvent);
  }

  _receiveMessage(data: any) {
    const messageEvent = new MessageEvent('message', { data: JSON.stringify(data) });
    this.dispatchEvent(messageEvent);
    if (this.onmessage) this.onmessage(messageEvent);
  }

  // WebSocket API methods
  send(data: any) {
    if (this.readyState !== MockWebSocket.OPEN) {
      throw new Error('WebSocket is not open');
    }
    this.sentMessages.push(JSON.parse(data));
  }

  close(code?: number, reason?: string) {
    this.readyState = MockWebSocket.CLOSING;
    this._close(code, reason);
  }

  // Event listener implementation
  private listeners: { [type: string]: (EventListenerOrEventListenerObject | null)[] } = {};

  addEventListener(type: string, listener: EventListenerOrEventListenerObject | null, options?: boolean | AddEventListenerOptions): void {
    if (!this.listeners[type]) {
      this.listeners[type] = [];
    }
    this.listeners[type].push(listener);
  }

  removeEventListener(type: string, listener: EventListenerOrEventListenerObject | null, options?: boolean | EventListenerOptions): void {
    if (this.listeners[type]) {
      this.listeners[type] = this.listeners[type].filter(l => l !== listener);
    }
  }

  dispatchEvent(event: Event): boolean {
    const listenerList = this.listeners[event.type];
    if (listenerList) {
      listenerList.forEach(listener => {
        if (typeof listener === 'function') {
          listener(event);
        }
      });
    }
    return true;
  }
}

// Global setup
let webSocketSpy: jest.SpyInstance;

beforeEach(() => {
  MockWebSocket.instances = [];
  webSocketSpy = jest.spyOn(global, 'WebSocket').mockImplementation(
    (url: string, protocols?: string | string[]) => new MockWebSocket(url, Array.isArray(protocols) ? protocols : (protocols ? [protocols] : undefined)) as any
  );
});

afterEach(() => {
  webSocketSpy.mockRestore();
  jest.useRealTimers();
});


describe('WebSocketManager', () => {
  let wsManager: WebSocketManager;
  const testUrl = 'ws://localhost:8080/test';
  // Speed up tests by reducing delays and attempts
  const config = {
    ...DEFAULT_WEBSOCKET_CONFIG,
    url: testUrl,
    heartbeatInterval: 500,
    reconnectStrategy: {
      ...DEFAULT_WEBSOCKET_CONFIG.reconnectStrategy,
      initialDelay: 100,
      maxAttempts: 3
    }
  };

  beforeEach(() => {
    wsManager = new WebSocketManager(config);
  });

  afterEach(() => {
    wsManager.disconnect();
  });

  // --- Connection Management ---
  describe('Connection Management', () => {
    it('should connect successfully', async () => {
      const connectPromise = wsManager.connect();
      expect(wsManager.getConnectionStatus()).toBe('connecting');

      expect(MockWebSocket.instances.length).toBe(1);
      const mockWs = MockWebSocket.instances[0];
      mockWs._open();

      await expect(connectPromise).resolves.toBeUndefined();
      expect(wsManager.getConnectionStatus()).toBe('connected');
    });

    it('should handle connection failure', async () => {
      const connectPromise = wsManager.connect();
      
      const mockWs = MockWebSocket.instances[0];
      mockWs._error();

      await expect(connectPromise).rejects.toThrow('WebSocket connection error');
      expect(wsManager.getConnectionStatus()).toBe('error');
    });

    it('should disconnect cleanly', async () => {
      const connectPromise = wsManager.connect();
      MockWebSocket.instances[0]._open();
      await connectPromise;

      expect(wsManager.getConnectionStatus()).toBe('connected');

      wsManager.disconnect();
      
      expect(wsManager.getConnectionStatus()).toBe('disconnected');
      expect(MockWebSocket.instances[0].readyState).toBe(MockWebSocket.CLOSED);
    });
  });

  // --- Reconnection Logic ---
  describe('Reconnection Logic', () => {
    beforeEach(() => {
      jest.useFakeTimers();
    });

    it('should attempt to reconnect on abnormal closure', async () => {
      // Mock reconnect to prevent timer complexity in this specific test
      const reconnectSpy = jest.spyOn(wsManager, 'reconnect').mockImplementation(async () => {});
      
      const connectPromise = wsManager.connect();
      MockWebSocket.instances[0]._open();
      await connectPromise;

      // Simulate abnormal closure
      MockWebSocket.instances[0]._close(1006, 'Abnormal Closure');
      
      expect(wsManager.getConnectionStatus()).toBe('disconnected');
      expect(reconnectSpy).toHaveBeenCalledTimes(1);
      reconnectSpy.mockRestore();
    });

    it('should use exponential backoff for reconnection attempts', async () => {
      const connectPromise = wsManager.connect();
      MockWebSocket.instances[0]._open();
      await connectPromise;

      // First reconnect attempt
      MockWebSocket.instances[0]._close(1006);
      expect(webSocketSpy).toHaveBeenCalledTimes(1);
      
      // Fast-forward for the first delay
      await jest.advanceTimersByTimeAsync(config.reconnectStrategy.initialDelay + 1);
      expect(webSocketSpy).toHaveBeenCalledTimes(2);

      // The second connection attempt should also fail, this time with an error, which should also trigger a reconnect.
      MockWebSocket.instances[1]._error();
      
      const secondDelay = config.reconnectStrategy.initialDelay * config.reconnectStrategy.backoffMultiplier;
      await jest.advanceTimersByTimeAsync(secondDelay + 1);
      expect(webSocketSpy).toHaveBeenCalledTimes(3);
    });

    it('should stop reconnecting after max attempts', async () => {
      const connectPromise = wsManager.connect();
      const initialWs = MockWebSocket.instances[0];
      initialWs._open();
      await connectPromise;

      // Close the first connection to start the reconnect cycle
      initialWs._close(1006);

      // Trigger max attempts
      for (let i = 0; i < config.reconnectStrategy.maxAttempts; i++) {
        const delay = config.reconnectStrategy.initialDelay * Math.pow(config.reconnectStrategy.backoffMultiplier, i);
        await jest.advanceTimersByTimeAsync(delay + 1);

        expect(webSocketSpy).toHaveBeenCalledTimes(i + 2);

        // The new connection attempt fails
        const newWs = MockWebSocket.instances[i + 1];
        newWs._error();
      }
      
      // After all attempts, the status should be 'error'
      await jest.runAllTimersAsync(); // Allow final state update to process
      expect(wsManager.getConnectionStatus()).toBe('error');

      // And no more connections should be attempted
      await jest.advanceTimersByTimeAsync(config.reconnectStrategy.maxDelay * 2);
      expect(webSocketSpy).toHaveBeenCalledTimes(config.reconnectStrategy.maxAttempts + 1);
    });
  });

  // --- Subscription Management ---
  describe('Subscription Management', () => {
    it('should send a subscription message and receive updates', async () => {
      const callback = jest.fn();
      
      const connectPromise = wsManager.connect();
      const mockWs = MockWebSocket.instances[0];
      mockWs._open();
      await connectPromise;

      expect(wsManager.getConnectionStatus()).toBe('connected');
      wsManager.subscribe('metrics_update', callback);

      expect(mockWs.sentMessages.length).toBe(1);
      expect(mockWs.sentMessages[0].type).toBe('subscribe');

      const message = { type: 'metrics_update', data: { cpu: 50 } };
      mockWs._receiveMessage(message);
      expect(callback).toHaveBeenCalledWith(message.data, expect.objectContaining(message));
    });

    it('should stop receiving updates after unsubscribing', async () => {
      const callback = jest.fn();

      const connectPromise = wsManager.connect();
      const mockWs = MockWebSocket.instances[0];
      mockWs._open();
      await connectPromise;
      
      const subscriptionId = wsManager.subscribe('transaction_update', callback);
      wsManager.unsubscribe(subscriptionId);

      expect(mockWs.sentMessages.length).toBe(2);
      expect(mockWs.sentMessages[1].type).toBe('unsubscribe');

      const message = { type: 'transaction_update', data: { id: '123' } };
      mockWs._receiveMessage(message);

      expect(callback).not.toHaveBeenCalled();
    });
  });

  // --- Heartbeat and Connection Quality ---
  describe('Heartbeat and Connection Quality', () => {
    beforeEach(() => {
      jest.useFakeTimers();
    });

    it('should send heartbeats at the configured interval', async () => {
      const connectPromise = wsManager.connect();
      const mockWs = MockWebSocket.instances[0];
      mockWs._open();
      await connectPromise;

      expect(mockWs.sentMessages.length).toBe(0);

      await jest.advanceTimersByTimeAsync(config.heartbeatInterval + 1);
      expect(mockWs.sentMessages.length).toBe(1);
      expect(mockWs.sentMessages[0].type).toBe('heartbeat');
    });

    it('should update connection quality based on heartbeat latency', async () => {
      const connectPromise = wsManager.connect();
      const mockWs = MockWebSocket.instances[0];
      mockWs._open();
      await connectPromise;

      // Send the first heartbeat
      await jest.advanceTimersByTimeAsync(config.heartbeatInterval + 1);
      expect(mockWs.sentMessages.length).toBe(1);
      const sentHeartbeat = mockWs.sentMessages[0];
      
      // Simulate receiving a response after 50ms
      const now = Date.now();
      const dateNowSpy = jest.spyOn(Date, 'now').mockReturnValue(now + 50);

      const goodResponse = { type: 'heartbeat_reply', data: { timestamp: sentHeartbeat.data.timestamp } };
      mockWs._receiveMessage(goodResponse);
      
      const metrics = wsManager.getConnectionMetrics();
      expect(metrics.latency).toBeCloseTo(50, -1);
      expect(wsManager.getConnectionQuality()).toBe('excellent');
      
      dateNowSpy.mockRestore();
    });
  });

  // --- Event Listeners ---
  describe('Event Listeners', () => {
    it('should emit statusChange events', async () => {
      const statusListener = jest.fn();
      wsManager.addEventListener('statusChange', statusListener);

      const connectPromise = wsManager.connect();
      expect(statusListener).toHaveBeenCalledWith({ status: 'connecting' });
      
      MockWebSocket.instances[0]._open();
      await connectPromise;
      expect(statusListener).toHaveBeenCalledWith({ status: 'connected' });

      wsManager.disconnect();
      expect(statusListener).toHaveBeenCalledWith({ status: 'disconnected' });
    });
  });
});
