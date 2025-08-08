# Migration Guide

Guía completa para migrar desde versiones anteriores del dashboard ICP a la nueva versión con características en tiempo real.

## 📋 Tabla de Contenidos

- [Información General](#información-general)
- [Migración desde v0.x](#migración-desde-v0x)
- [Breaking Changes](#breaking-changes)
- [Migración de Datos](#migración-de-datos)
- [Migración de Configuración](#migración-de-configuración)
- [Migración de Componentes](#migración-de-componentes)
- [Testing de Migración](#testing-de-migración)
- [Rollback Plan](#rollback-plan)

## 📖 Información General

### ¿Qué hay de nuevo en v1.0?

- ⚡ **Sistema de tiempo real** con WebSocket y fallback a polling
- 📊 **Analytics avanzados** con análisis predictivo y detección de anomalías
- 🛡️ **Manejo robusto de errores** con categorización y recuperación automática
- 🎨 **UI mejorada** con animaciones y mejor accesibilidad
- ⚙️ **Sistema de configuración** avanzado con validación
- 🧪 **Suite de testing** completa con cobertura del 90%

### Compatibilidad

| Versión Anterior | Compatibilidad | Migración Automática | Notas |
|------------------|----------------|---------------------|-------|
| v0.9.x | ✅ Completa | ✅ Sí | Migración suave |
| v0.8.x | ⚠️ Parcial | ⚠️ Manual | Requiere ajustes |
| v0.7.x y anterior | ❌ Limitada | ❌ No | Migración completa |

## 🔄 Migración desde v0.x

### Pre-migración Checklist

- [ ] **Backup completo** de datos y configuración
- [ ] **Documentar customizaciones** existentes
- [ ] **Verificar dependencias** y compatibilidad
- [ ] **Planificar downtime** (si es necesario)
- [ ] **Preparar rollback plan**
- [ ] **Notificar usuarios** sobre cambios

### Paso 1: Preparación del Entorno

```bash
# Crear backup de la versión actual
cp -r dashboard-v0 dashboard-v0-backup

# Verificar versión actual
cat package.json | grep version

# Exportar configuración actual
npm run export-config > config-backup.json

# Exportar datos de usuario
npm run export-data > user-data-backup.json
```

### Paso 2: Instalación de v1.0

```bash
# Clonar nueva versión
git clone https://github.com/your-org/icp-dashboard.git dashboard-v1
cd dashboard-v1

# Instalar dependencias
npm install

# Copiar variables de entorno
cp ../dashboard-v0/.env.local .env.local
```

### Paso 3: Migración de Configuración

```typescript
// scripts/migrate-config.ts
import { readFileSync, writeFileSync } from 'fs';

interface LegacyConfig {
  apiUrl: string;
  refreshInterval: number;
  theme: string;
  notifications: boolean;
}

interface NewConfig {
  realTime: {
    enabled: boolean;
    websocketUrl: string;
    pollingInterval: number;
  };
  ui: {
    theme: 'light' | 'dark' | 'auto';
    animations: boolean;
  };
  notifications: {
    enabled: boolean;
    position: string;
  };
}

export const migrateConfig = (legacyConfig: LegacyConfig): NewConfig => {
  return {
    realTime: {
      enabled: true,
      websocketUrl: legacyConfig.apiUrl.replace('http', 'ws') + '/ws',
      pollingInterval: legacyConfig.refreshInterval || 30000,
    },
    ui: {
      theme: legacyConfig.theme as 'light' | 'dark' || 'auto',
      animations: true,
    },
    notifications: {
      enabled: legacyConfig.notifications ?? true,
      position: 'top-right',
    }
  };
};

// Ejecutar migración
const legacyConfig = JSON.parse(readFileSync('config-backup.json', 'utf8'));
const newConfig = migrateConfig(legacyConfig);
writeFileSync('src/config/migrated-config.json', JSON.stringify(newConfig, null, 2));
```

### Paso 4: Migración de Datos

```typescript
// scripts/migrate-data.ts
interface LegacyTransaction {
  id: string;
  from: string;
  to: string;
  amount: number;
  timestamp: string;
  status: string;
}

interface NewTransaction {
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
  callHierarchy: any[];
}

export const migrateTransaction = (legacy: LegacyTransaction): NewTransaction => {
  return {
    id: legacy.id,
    hash: `migrated-${legacy.id}`,
    from: legacy.from,
    to: legacy.to,
    amount: legacy.amount,
    timestamp: new Date(legacy.timestamp),
    status: legacy.status as 'pending' | 'completed' | 'failed',
    // Valores por defecto para nuevos campos
    cycleCost: 1000000, // Estimación
    subnetId: 'unknown',
    canisterId: legacy.to,
    executionTime: 50, // Estimación
    memoryUsage: 1024, // Estimación
    instructionCount: 5000, // Estimación
    callHierarchy: []
  };
};

// Migrar datos
const legacyData = JSON.parse(readFileSync('user-data-backup.json', 'utf8'));
const migratedData = {
  transactions: legacyData.transactions.map(migrateTransaction),
  metrics: legacyData.metrics || [],
  settings: migrateConfig(legacyData.settings || {})
};

writeFileSync('src/data/migrated-data.json', JSON.stringify(migratedData, null, 2));
```

### Paso 5: Actualización de Variables de Entorno

```bash
# .env.local (actualizar)
# Nuevas variables requeridas
REACT_APP_WEBSOCKET_URL=ws://localhost:8080/ws
REACT_APP_ENABLE_REAL_TIME=true
REACT_APP_ANALYTICS_ENABLED=true

# Variables existentes (mantener)
REACT_APP_API_BASE_URL=https://api.icp-dashboard.com
REACT_APP_CANISTER_ID=rdmx6-jaaaa-aaaah-qcaiq-cai

# Variables obsoletas (remover)
# REACT_APP_POLLING_INTERVAL - ahora se configura dinámicamente
# REACT_APP_LEGACY_MODE - ya no es necesario
```

## ⚠️ Breaking Changes

### API Changes

#### 1. Hook `useICPData` → `useRealTimeData`

**Antes (v0.x):**
```typescript
const { data, loading, error, refresh } = useICPData();
```

**Después (v1.0):**
```typescript
const { 
  data, 
  isConnected, 
  connectionMode, 
  error, 
  refresh 
} = useRealTimeData<MetricsData>('metrics');
```

#### 2. Configuración de Componentes

**Antes (v0.x):**
```typescript
<Dashboard 
  refreshInterval={30000}
  theme="dark"
  showNotifications={true}
/>
```

**Después (v1.0):**
```typescript
<Dashboard 
  config={{
    realTime: { enabled: true, pollingInterval: 30000 },
    ui: { theme: 'dark', animations: true },
    notifications: { enabled: true, position: 'top-right' }
  }}
/>
```

#### 3. Estructura de Datos

**Antes (v0.x):**
```typescript
interface Transaction {
  id: string;
  from: string;
  to: string;
  amount: number;
  timestamp: string;
  status: string;
}
```

**Después (v1.0):**
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

### Component Changes

#### 1. MetricsCard → AnimatedMetricCard

**Antes (v0.x):**
```typescript
<MetricsCard 
  title="Transactions"
  value={1250}
  unit="txs"
/>
```

**Después (v1.0):**
```typescript
<AnimatedMetricCard
  title="Transactions"
  value={1250}
  unit="txs"
  trend="up"
  animationType="slideIn"
/>
```

#### 2. ErrorDisplay → NotificationSystem

**Antes (v0.x):**
```typescript
<ErrorDisplay errors={errors} />
```

**Después (v1.0):**
```typescript
<NotificationSystem 
  position="top-right"
  maxNotifications={5}
/>
```

### Service Changes

#### 1. DataService → RealTimeDataManager

**Antes (v0.x):**
```typescript
const dataService = new DataService({
  apiUrl: 'https://api.example.com',
  refreshInterval: 30000
});

dataService.fetchData().then(data => {
  updateUI(data);
});
```

**Después (v1.0):**
```typescript
const dataManager = new RealTimeDataManager();

await dataManager.start('ws://localhost:8080/ws');

dataManager.subscribe('metrics', (data) => {
  updateUI(data);
});
```

## 🔧 Migración de Componentes Personalizados

### Actualizar Componentes Existentes

```typescript
// Antes (v0.x)
import React from 'react';
import { useICPData } from '../hooks/useICPData';

const CustomDashboard = () => {
  const { data, loading } = useICPData();
  
  if (loading) return <div>Loading...</div>;
  
  return (
    <div>
      <h1>Custom Dashboard</h1>
      <div>Transactions: {data?.transactions?.length}</div>
    </div>
  );
};
```

```typescript
// Después (v1.0)
import React from 'react';
import { useRealTimeData } from '../hooks/useRealTimeData';
import { RealTimeIndicator } from '../components/ui/RealTimeIndicator';

const CustomDashboard = () => {
  const { 
    data, 
    isConnected, 
    connectionMode, 
    error 
  } = useRealTimeData<MetricsData>('metrics');
  
  if (error) {
    return <ErrorBoundary error={error} />;
  }
  
  return (
    <div>
      <div className="header">
        <h1>Custom Dashboard</h1>
        <RealTimeIndicator 
          isConnected={isConnected}
          mode={connectionMode}
        />
      </div>
      <div>
        Transactions: {data?.totalTransactions || 0}
      </div>
    </div>
  );
};
```

### Migrar Hooks Personalizados

```typescript
// Antes (v0.x)
const useCustomMetrics = () => {
  const [metrics, setMetrics] = useState(null);
  const [loading, setLoading] = useState(true);
  
  useEffect(() => {
    const fetchMetrics = async () => {
      const data = await api.getMetrics();
      setMetrics(data);
      setLoading(false);
    };
    
    fetchMetrics();
    const interval = setInterval(fetchMetrics, 30000);
    
    return () => clearInterval(interval);
  }, []);
  
  return { metrics, loading };
};
```

```typescript
// Después (v1.0)
const useCustomMetrics = () => {
  const { data, isConnected, error } = useRealTimeData<MetricsData>('metrics');
  const [processedMetrics, setProcessedMetrics] = useState(null);
  
  useEffect(() => {
    if (data) {
      // Procesar métricas con nueva estructura
      const processed = {
        ...data,
        customCalculations: calculateCustomMetrics(data)
      };
      setProcessedMetrics(processed);
    }
  }, [data]);
  
  return { 
    metrics: processedMetrics, 
    isConnected, 
    error,
    loading: !data && !error 
  };
};
```

## 🧪 Testing de Migración

### Test de Migración de Datos

```typescript
// tests/migration/data-migration.test.ts
import { migrateTransaction } from '../../scripts/migrate-data';

describe('Data Migration', () => {
  test('should migrate legacy transaction correctly', () => {
    const legacyTransaction = {
      id: '123',
      from: 'user1',
      to: 'canister1',
      amount: 100,
      timestamp: '2024-01-01T10:00:00Z',
      status: 'completed'
    };
    
    const migrated = migrateTransaction(legacyTransaction);
    
    expect(migrated).toEqual({
      id: '123',
      hash: 'migrated-123',
      from: 'user1',
      to: 'canister1',
      amount: 100,
      timestamp: new Date('2024-01-01T10:00:00Z'),
      status: 'completed',
      cycleCost: 1000000,
      subnetId: 'unknown',
      canisterId: 'canister1',
      executionTime: 50,
      memoryUsage: 1024,
      instructionCount: 5000,
      callHierarchy: []
    });
  });
});
```

### Test de Compatibilidad

```typescript
// tests/migration/compatibility.test.ts
describe('Backward Compatibility', () => {
  test('should handle legacy API responses', async () => {
    const legacyResponse = {
      transactions: [/* legacy format */],
      metrics: {/* legacy format */}
    };
    
    const adapter = new LegacyAPIAdapter();
    const modernData = adapter.transform(legacyResponse);
    
    expect(modernData.transactions[0]).toHaveProperty('cycleCost');
    expect(modernData.transactions[0]).toHaveProperty('subnetId');
  });
});
```

### Script de Validación

```bash
#!/bin/bash
# validate-migration.sh

echo "🔍 Validating migration..."

# Verificar que los datos migrados son válidos
npm run validate-migrated-data

# Ejecutar tests de migración
npm run test:migration

# Verificar que la aplicación inicia correctamente
npm run build
npm run start &
SERVER_PID=$!

# Esperar a que el servidor inicie
sleep 10

# Verificar health check
if curl -f http://localhost:3000/health; then
  echo "✅ Migration validation successful"
else
  echo "❌ Migration validation failed"
  exit 1
fi

# Limpiar
kill $SERVER_PID
```

## 🔄 Rollback Plan

### Preparación para Rollback

```bash
# Crear script de rollback
cat > rollback.sh << 'EOF'
#!/bin/bash
echo "🔄 Starting rollback to v0.x..."

# Detener servicios actuales
pm2 stop dashboard-v1

# Restaurar versión anterior
cp -r dashboard-v0-backup/* dashboard-current/

# Restaurar configuración
cp config-backup.json dashboard-current/config.json

# Restaurar datos
cp user-data-backup.json dashboard-current/data.json

# Reinstalar dependencias
cd dashboard-current
npm install

# Iniciar versión anterior
pm2 start dashboard-v0

echo "✅ Rollback completed"
EOF

chmod +x rollback.sh
```

### Rollback Automático

```typescript
// src/utils/rollback-detector.ts
export class RollbackDetector {
  private errorCount = 0;
  private readonly maxErrors = 5;
  private readonly timeWindow = 300000; // 5 minutes
  
  reportError(error: Error) {
    this.errorCount++;
    
    if (this.errorCount >= this.maxErrors) {
      this.triggerRollback();
    }
    
    // Reset counter after time window
    setTimeout(() => {
      this.errorCount = Math.max(0, this.errorCount - 1);
    }, this.timeWindow);
  }
  
  private async triggerRollback() {
    console.warn('🚨 Too many errors detected, triggering rollback...');
    
    try {
      // Notificar al equipo
      await fetch('/api/alert', {
        method: 'POST',
        body: JSON.stringify({
          type: 'rollback_triggered',
          reason: 'excessive_errors',
          errorCount: this.errorCount
        })
      });
      
      // Ejecutar rollback
      window.location.href = '/rollback';
      
    } catch (rollbackError) {
      console.error('Rollback failed:', rollbackError);
    }
  }
}
```

## 📋 Post-Migration Checklist

### Verificación Funcional

- [ ] **Dashboard carga correctamente**
- [ ] **Datos históricos visibles**
- [ ] **Tiempo real funciona** (WebSocket + fallback)
- [ ] **Métricas calculan correctamente**
- [ ] **Errores se manejan apropiadamente**
- [ ] **Configuración se guarda**
- [ ] **Notificaciones funcionan**
- [ ] **Responsive design funciona**
- [ ] **Accesibilidad mantiene estándares**

### Verificación de Performance

```bash
# Lighthouse audit
npm install -g lighthouse
lighthouse http://localhost:3000 --output html --output-path ./lighthouse-report.html

# Bundle analysis
npm run analyze

# Memory usage test
npm run test:memory
```

### Monitoreo Post-Migration

```typescript
// src/utils/migration-monitor.ts
export class MigrationMonitor {
  private metrics = {
    loadTime: 0,
    errorRate: 0,
    userSatisfaction: 0
  };
  
  trackMigrationSuccess() {
    // Enviar métricas de éxito
    this.sendMetrics({
      event: 'migration_success',
      version: '1.0.0',
      timestamp: new Date(),
      metrics: this.metrics
    });
  }
  
  private async sendMetrics(data: any) {
    try {
      await fetch('/api/analytics', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      });
    } catch (error) {
      console.error('Failed to send migration metrics:', error);
    }
  }
}
```

## 🆘 Troubleshooting

### Problemas Comunes

#### 1. WebSocket no conecta después de migración

```bash
# Verificar configuración
echo $REACT_APP_WEBSOCKET_URL

# Verificar conectividad
curl -I $REACT_APP_WEBSOCKET_URL

# Solución temporal: forzar modo polling
localStorage.setItem('force-polling-mode', 'true');
```

#### 2. Datos no aparecen

```typescript
// Verificar migración de datos
const checkDataMigration = () => {
  const migratedData = localStorage.getItem('migrated-data');
  if (!migratedData) {
    console.error('Migration data not found');
    // Ejecutar migración manual
    runDataMigration();
  }
};
```

#### 3. Performance degradada

```typescript
// Verificar configuración de performance
const optimizeForMigration = () => {
  // Reducir frecuencia de actualizaciones temporalmente
  const config = {
    realTime: {
      pollingInterval: 60000, // Aumentar intervalo
      enableBandwidthOptimization: true
    },
    ui: {
      animations: false // Desactivar animaciones temporalmente
    }
  };
  
  updateConfiguration(config);
};
```

## 📞 Soporte

Si encuentras problemas durante la migración:

1. **Consulta los logs**: `npm run logs`
2. **Ejecuta diagnósticos**: `npm run diagnose`
3. **Contacta soporte**: migration-support@icp-dashboard.com
4. **Rollback si es necesario**: `./rollback.sh`

## 📚 Recursos Adicionales

- [API Documentation](./api.md)
- [Deployment Guide](./deployment.md)
- [Troubleshooting Guide](./troubleshooting.md)
- [Performance Guide](./performance.md)

---

**Versión**: 1.0.0  
**Última actualización**: Enero 2025