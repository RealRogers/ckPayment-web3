# API Documentation

Documentación completa de la API del ICP Dashboard, incluyendo servicios, hooks, componentes y interfaces.

## 📋 Tabla de Contenidos

- [Services API](#services-api)
- [React Hooks](#react-hooks)
- [Components API](#components-api)
- [Types & Interfaces](#types--interfaces)
- [Configuration](#configuration)
- [Error Codes](#error-codes)

## 🔧 Services API

### WebSocketManager

Gestiona conexiones WebSocket con reconexión automática y evaluación de calidad.

#### Constructor

```typescript
constructor(config?: WebSocketConfig)
```

#### Métodos

##### `connect(url: string): Promise<boolean>`

Establece conexión WebSocket.

```typescript
const wsManager = new WebSocketManager();
const connected = await wsManager.connect('ws://localhost:8080/ws');
```

**Parámetros:**
- `url` (string): URL del WebSocket endpoint

**Retorna:** `Promise<boolean>` - true si la conexión fue exitosa

##### `disconnect(): void`

Cierra la conexión WebSocket.

```typescript
wsManager.disconnect();
```

##### `subscribe(eventType: string, callback: Function): void`

Suscribe a eventos específicos.

```typescript
wsManager.subscribe('metrics', (data) => {
  console.log('New metrics:', data);
});
```

**Parámetros:**
- `eventType` (string): Tipo de evento ('metrics', 'transactions', 'errors')
- `callback` (Function): Función callback para manejar los datos

##### `unsubscribe(eventType: string, callback: Function): void`

Cancela suscripción a eventos.

```typescript
wsManager.unsubscribe('metrics', callbackFunction);
```

##### `isConnected(): boolean`

Verifica estado de conexión.

```typescript
const connected = wsManager.isConnected();
```

##### `getConnectionQuality(): ConnectionQuality`

Obtiene métricas de calidad de conexión.

```typescript
const quality = wsManager.getConnectionQuality();
// {
//   averageLatency: 50,
//   isStable: true,
//   disconnectionCount: 0,
//   lastDisconnection: null
// }
```

#### Eventos

##### `onError(callback: (error: Error) => void): void`

Maneja errores de conexión.

```typescript
wsManager.onError((error) => {
  console.error('WebSocket error:', error);
});
```

##### `onDisconnect(callback: () => void): void`

Maneja desconexiones.

```typescript
wsManager.onDisconnect(() => {
  console.log('WebSocket disconnected');
});
```

---

### ErrorHandlerService

Servicio para categorización y manejo de errores con recuperación automática.

#### Constructor

```typescript
constructor(config?: ErrorHandlerConfig)
```

#### Métodos

##### `handleError(error: Error, context?: ErrorContext): EnhancedDashboardError`

Procesa y categoriza errores.

```typescript
const errorHandler = new ErrorHandlerService();
const categorizedError = errorHandler.handleError(
  new Error('Network timeout'),
  {
    component: 'DataFetcher',
    operation: 'fetchMetrics',
    userId: 'user123'
  }
);
```

**Parámetros:**
- `error` (Error): Error original
- `context` (ErrorContext, opcional): Contexto adicional

**Retorna:** `EnhancedDashboardError` - Error categorizado con acciones de recuperación

##### `categorizeError(error: Error, context?: ErrorContext): EnhancedDashboardError`

Categoriza error sin logging.

```typescript
const categorized = errorHandler.categorizeError(error, context);
```

##### `getErrorStatistics(): ErrorStatistics`

Obtiene estadísticas de errores.

```typescript
const stats = errorHandler.getErrorStatistics();
// {
//   totalErrors: 25,
//   errorsByCategory: {
//     NETWORK: 10,
//     WEBSOCKET: 5,
//     CANISTER: 3
//   },
//   recentErrors: 5
// }
```

#### Configuración

```typescript
interface ErrorHandlerConfig {
  logLevel: 'debug' | 'info' | 'warn' | 'error';
  enableRecovery: boolean;
  circuitBreaker: {
    failureThreshold: number;
    resetTimeout: number;
  };
}
```

---

### MetricsCalculator

Servicio para cálculos avanzados de métricas y análisis predictivo.

#### Constructor

```typescript
constructor()
```

#### Métodos

##### `calculateCycleEfficiency(transactions: TransactionData[]): CycleEfficiency`

Calcula eficiencia de cycles.

```typescript
const calculator = new MetricsCalculator();
const efficiency = calculator.calculateCycleEfficiency(transactions);
// {
//   averageCyclesPerTransaction: 1500000,
//   averageCyclesPerInstruction: 200,
//   cycleEfficiencyScore: 85,
//   mostEfficientTransactions: [...],
//   wastedCycles: 500000,
//   wastePercentage: 10.5
// }
```

##### `calculatePerformanceAnalytics(transactions: TransactionData[], metrics: MetricsData[]): PerformanceAnalytics`

Calcula análisis de rendimiento.

```typescript
const analytics = calculator.calculatePerformanceAnalytics(transactions, metrics);
```

##### `analyzeTrends(metrics: MetricsData[]): TrendAnalysis`

Analiza tendencias en métricas.

```typescript
const trends = calculator.analyzeTrends(metrics);
// {
//   transactionVolume: {
//     trend: 'increasing',
//     changePercentage: 15.5,
//     isImproving: true
//   },
//   responseTime: {
//     trend: 'improving',
//     changePercentage: -8.2,
//     isImproving: true
//   }
// }
```

##### `detectAnomalies(transactions: TransactionData[], metrics: MetricsData[]): AnomalyDetection`

Detecta anomalías en los datos.

```typescript
const anomalies = calculator.detectAnomalies(transactions, metrics);
```

##### `generatePredictions(metrics: MetricsData[]): PredictiveAnalytics`

Genera predicciones basadas en datos históricos.

```typescript
const predictions = calculator.generatePredictions(metrics);
```

---

### RealTimeDataManager

Coordina actualizaciones en tiempo real entre WebSocket y polling.

#### Constructor

```typescript
constructor(config?: RealTimeConfig)
```

#### Métodos

##### `start(websocketUrl: string): Promise<void>`

Inicia el sistema de datos en tiempo real.

```typescript
const dataManager = new RealTimeDataManager();
await dataManager.start('ws://localhost:8080/ws');
```

##### `stop(): void`

Detiene el sistema.

```typescript
dataManager.stop();
```

##### `subscribe(eventType: string, callback: Function, options?: SubscriptionOptions): void`

Suscribe a actualizaciones de datos.

```typescript
dataManager.subscribe('metrics', (data) => {
  updateUI(data);
}, { priority: 'high' });
```

##### `configure(config: Partial<RealTimeConfig>): void`

Actualiza configuración.

```typescript
dataManager.configure({
  pollingInterval: 10000,
  enableBandwidthOptimization: true
});
```

##### `getCurrentMode(): 'websocket' | 'polling'`

Obtiene modo actual de conexión.

```typescript
const mode = dataManager.getCurrentMode();
```

##### `getPerformanceStats(): PerformanceStats`

Obtiene estadísticas de rendimiento.

```typescript
const stats = dataManager.getPerformanceStats();
```

#### Eventos

##### `onModeChange(callback: (change: ModeChange) => void): void`

Notifica cambios de modo.

```typescript
dataManager.onModeChange((change) => {
  console.log(`Mode changed from ${change.from} to ${change.to}`);
});
```

##### `onConnectionChange(callback: (status: ConnectionStatus) => void): void`

Notifica cambios de conexión.

```typescript
dataManager.onConnectionChange((status) => {
  updateConnectionIndicator(status);
});
```

---

## 🎣 React Hooks

### useRealTimeData

Hook para acceder a datos en tiempo real.

```typescript
const {
  data,
  isConnected,
  connectionMode,
  error,
  refresh
} = useRealTimeData<MetricsData>('metrics');
```

**Parámetros:**
- `eventType` (string): Tipo de datos a suscribir

**Retorna:**
- `data` (T | null): Datos más recientes
- `isConnected` (boolean): Estado de conexión
- `connectionMode` ('websocket' | 'polling'): Modo actual
- `error` (Error | null): Error actual si existe
- `refresh` (() => void): Función para refrescar datos manualmente

### useErrorHandler

Hook para manejo de errores.

```typescript
const { handleError, errors, clearErrors } = useErrorHandler();
```

**Retorna:**
- `handleError` ((error: Error, context?: ErrorContext) => void): Función para manejar errores
- `errors` (EnhancedDashboardError[]): Lista de errores actuales
- `clearErrors` (() => void): Función para limpiar errores

### useMetrics

Hook para cálculos de métricas.

```typescript
const {
  efficiency,
  analytics,
  trends,
  anomalies,
  predictions
} = useMetrics(transactions, metrics);
```

### useNotifications

Hook para sistema de notificaciones.

```typescript
const { notify, notifications, dismiss } = useNotifications();

// Mostrar notificación
notify({
  type: 'success',
  message: 'Data updated successfully',
  duration: 3000
});
```

---

## 🧩 Components API

### RealTimeIndicator

Componente para mostrar estado de conexión en tiempo real.

```typescript
interface RealTimeIndicatorProps {
  isConnected: boolean;
  mode: 'websocket' | 'polling';
  quality?: ConnectionQuality;
  className?: string;
}

<RealTimeIndicator
  isConnected={true}
  mode="websocket"
  quality={connectionQuality}
  className="custom-indicator"
/>
```

### AnimatedMetricCard

Tarjeta de métrica con animaciones.

```typescript
interface AnimatedMetricCardProps {
  title: string;
  value: number | string;
  unit?: string;
  trend?: 'up' | 'down' | 'stable';
  animationType?: AnimationType;
  onClick?: () => void;
}

<AnimatedMetricCard
  title="Total Transactions"
  value={1250}
  unit="txs"
  trend="up"
  animationType="slideIn"
  onClick={() => showDetails()}
/>
```

### NotificationSystem

Sistema de notificaciones toast.

```typescript
interface NotificationSystemProps {
  position?: 'top-right' | 'top-left' | 'bottom-right' | 'bottom-left';
  maxNotifications?: number;
  defaultDuration?: number;
}

<NotificationSystem
  position="top-right"
  maxNotifications={5}
  defaultDuration={4000}
/>
```

### DashboardSettings

Panel de configuración del dashboard.

```typescript
interface DashboardSettingsProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (config: DashboardConfiguration) => void;
  currentConfig: DashboardConfiguration;
}

<DashboardSettings
  isOpen={showSettings}
  onClose={() => setShowSettings(false)}
  onSave={handleSaveConfig}
  currentConfig={dashboardConfig}
/>
```

---

## 📝 Types & Interfaces

### Core Types

#### TransactionData

```typescript
interface TransactionData {
  id: string;
  hash: string;
  from: string;
  to: string;
  amount: number;
  timestamp: Date;
  status: 'pending' | 'completed' | 'failed';
  cycleCost: number;
  subnetId: string;
  canisterId: string;
  executionTime: number;
  memoryUsage: number;
  instructionCount: number;
  callHierarchy: InterCanisterCall[];
}
```

#### MetricsData

```typescript
interface MetricsData {
  timestamp: Date;
  totalTransactions: number;
  successfulTransactions: number;
  failedTransactions: number;
  averageResponseTime: number;
  totalVolume: number;
  activeUsers: number;
  cyclesBurned: number;
  cyclesBalance: number;
  subnetMetrics: Record<string, SubnetMetrics>;
  canisterHealth: Record<string, CanisterHealth>;
}
```

#### EnhancedDashboardError

```typescript
interface EnhancedDashboardError {
  errorId: string;
  message: string;
  category: ErrorCategory;
  severity: ErrorSeverity;
  timestamp: Date;
  context: ErrorContext;
  isRetryable: boolean;
  recoveryActions: RecoveryAction[];
  icpDetails?: ICPErrorDetails;
  originalError: Error;
}
```

### Configuration Types

#### DashboardConfiguration

```typescript
interface DashboardConfiguration {
  realTime: {
    enabled: boolean;
    websocketUrl: string;
    pollingInterval: number;
    maxReconnectAttempts: number;
  };
  ui: {
    theme: 'light' | 'dark' | 'auto';
    animations: boolean;
    reducedMotion: boolean;
    highContrast: boolean;
  };
  notifications: {
    enabled: boolean;
    position: NotificationPosition;
    duration: number;
    maxVisible: number;
  };
  analytics: {
    enabled: boolean;
    trackingLevel: 'basic' | 'detailed';
    retentionDays: number;
  };
}
```

---

## ⚙️ Configuration

### Environment Variables

```typescript
interface EnvironmentConfig {
  REACT_APP_WEBSOCKET_URL: string;
  REACT_APP_API_BASE_URL: string;
  REACT_APP_CANISTER_ID: string;
  REACT_APP_NETWORK: 'local' | 'testnet' | 'mainnet';
  REACT_APP_ENABLE_ANALYTICS: 'true' | 'false';
  REACT_APP_LOG_LEVEL: 'debug' | 'info' | 'warn' | 'error';
}
```

### Runtime Configuration

```typescript
// src/config/runtime.config.ts
export const runtimeConfig = {
  websocket: {
    reconnectInterval: 5000,
    maxReconnectAttempts: 5,
    heartbeatInterval: 30000,
  },
  polling: {
    interval: 30000,
    maxRetries: 3,
    backoffMultiplier: 1.5,
  },
  ui: {
    animationDuration: 300,
    throttleDelay: 100,
    debounceDelay: 300,
  },
  performance: {
    maxCacheSize: 1000,
    cacheExpiration: 300000, // 5 minutes
    batchSize: 50,
  }
};
```

---

## ❌ Error Codes

### Error Categories

| Código | Categoría | Descripción |
|--------|-----------|-------------|
| `NET_001` | NETWORK | Error de conectividad de red |
| `NET_002` | NETWORK | Timeout de red |
| `WS_001` | WEBSOCKET | Fallo de conexión WebSocket |
| `WS_002` | WEBSOCKET | Desconexión inesperada |
| `CAN_001` | CANISTER | Canister rechazó la llamada |
| `CAN_002` | CANISTER | Canister sin cycles |
| `AUTH_001` | AUTHENTICATION | Credenciales inválidas |
| `AUTH_002` | AUTHENTICATION | Sesión expirada |
| `VAL_001` | VALIDATION | Datos de entrada inválidos |
| `SYS_001` | SYSTEM | Error interno del sistema |
| `CONS_001` | CONSENSUS | Error de consenso de red |
| `PERF_001` | PERFORMANCE | Degradación de rendimiento |

### Recovery Actions

| Tipo | Descripción | Automático |
|------|-------------|------------|
| `retry` | Reintentar operación | ✅ |
| `fallback` | Cambiar a modo alternativo | ✅ |
| `automatic` | Recuperación automática | ✅ |
| `manual` | Acción manual requerida | ❌ |

---

## 📚 Ejemplos de Uso

### Configuración Básica

```typescript
import { 
  WebSocketManager, 
  RealTimeDataManager, 
  ErrorHandlerService 
} from './services';

// Configurar servicios
const wsManager = new WebSocketManager({
  reconnectInterval: 5000,
  maxReconnectAttempts: 3
});

const errorHandler = new ErrorHandlerService({
  logLevel: 'info',
  enableRecovery: true
});

const dataManager = new RealTimeDataManager({
  websocketManager: wsManager,
  errorHandler: errorHandler,
  pollingInterval: 30000
});

// Iniciar sistema
await dataManager.start('ws://localhost:8080/ws');

// Suscribirse a datos
dataManager.subscribe('metrics', (metrics) => {
  console.log('New metrics:', metrics);
});
```

### Manejo de Errores

```typescript
import { useErrorHandler } from './hooks';

function MyComponent() {
  const { handleError, errors } = useErrorHandler();

  const fetchData = async () => {
    try {
      const response = await fetch('/api/data');
      const data = await response.json();
      return data;
    } catch (error) {
      handleError(error, {
        component: 'MyComponent',
        operation: 'fetchData'
      });
    }
  };

  return (
    <div>
      {errors.map(error => (
        <ErrorNotification key={error.errorId} error={error} />
      ))}
    </div>
  );
}
```

---

**Versión API**: 1.0.0  
**Última actualización**: Enero 2025