# Troubleshooting Guide

Guía completa para resolver problemas comunes del ICP Dashboard.

## 📋 Tabla de Contenidos

- [Problemas de Conexión](#problemas-de-conexión)
- [Problemas de Performance](#problemas-de-performance)
- [Errores de Deployment](#errores-de-deployment)
- [Problemas de UI](#problemas-de-ui)
- [Debugging Tools](#debugging-tools)
- [Logs y Monitoreo](#logs-y-monitoreo)

## 🔌 Problemas de Conexión

### WebSocket no conecta

**Síntomas:**
- Dashboard muestra "Disconnected"
- No hay actualizaciones en tiempo real
- Console muestra errores de WebSocket

**Diagnóstico:**
```bash
# Verificar URL del WebSocket
echo $REACT_APP_WEBSOCKET_URL

# Test de conectividad
curl -I $REACT_APP_WEBSOCKET_URL

# Test con wscat
wscat -c $REACT_APP_WEBSOCKET_URL
```

**Soluciones:**

1. **Verificar configuración:**
```bash
# .env.local
REACT_APP_WEBSOCKET_URL=ws://localhost:8080/ws
# o para HTTPS
REACT_APP_WEBSOCKET_URL=wss://api.example.com/ws
```

2. **Forzar modo polling:**
```javascript
// En el navegador
localStorage.setItem('force-polling-mode', 'true');
window.location.reload();
```

3. **Verificar proxy/firewall:**
```nginx
# nginx.conf
location /ws {
    proxy_pass http://backend;
    proxy_http_version 1.1;
    proxy_set_header Upgrade $http_upgrade;
    proxy_set_header Connection "upgrade";
    proxy_set_header Host $host;
    proxy_cache_bypass $http_upgrade;
}
```

### API endpoints no responden

**Síntomas:**
- Errores 404 o 500 en requests
- Datos no cargan
- Timeouts frecuentes

**Diagnóstico:**
```bash
# Test de API
curl -v http://localhost:3000/api/health
curl -v http://localhost:3000/api/metrics

# Verificar CORS
curl -H "Origin: http://localhost:3000" \
     -H "Access-Control-Request-Method: GET" \
     -H "Access-Control-Request-Headers: X-Requested-With" \
     -X OPTIONS \
     http://localhost:8080/api/metrics
```

**Soluciones:**

1. **Configurar proxy en desarrollo:**
```json
// package.json
{
  "proxy": "http://localhost:8080"
}
```

2. **Configurar CORS en backend:**
```javascript
// Express.js ejemplo
app.use(cors({
  origin: ['http://localhost:3000', 'https://dashboard.example.com'],
  credentials: true
}));
```

## ⚡ Problemas de Performance

### Dashboard lento

**Síntomas:**
- Carga inicial lenta
- Actualizaciones lentas
- UI no responsiva

**Diagnóstico:**
```bash
# Analizar bundle
npm run analyze

# Lighthouse audit
lighthouse http://localhost:3000 --output html

# Memory profiling
npm run test:memory
```

**Soluciones:**

1. **Optimizar bundle:**
```javascript
// webpack.config.js
module.exports = {
  optimization: {
    splitChunks: {
      chunks: 'all',
      cacheGroups: {
        vendor: {
          test: /[\\/]node_modules[\\/]/,
          name: 'vendors',
          chunks: 'all',
        }
      }
    }
  }
};
```

2. **Lazy loading:**
```typescript
// Componentes lazy
const Dashboard = React.lazy(() => import('./Dashboard'));
const Settings = React.lazy(() => import('./Settings'));

// En el componente
<Suspense fallback={<Loading />}>
  <Dashboard />
</Suspense>
```

3. **Reducir frecuencia de updates:**
```typescript
// Configuración temporal
const config = {
  realTime: {
    pollingInterval: 60000, // Aumentar intervalo
    enableBandwidthOptimization: true
  },
  ui: {
    animations: false // Desactivar animaciones
  }
};
```

### Memory leaks

**Síntomas:**
- Uso de memoria aumenta constantemente
- Browser se vuelve lento
- Crashes después de uso prolongado

**Diagnóstico:**
```javascript
// En DevTools Console
console.log('Memory usage:', performance.memory);

// Monitorear WebSocket connections
console.log('WebSocket state:', wsManager.getConnectionQuality());
```

**Soluciones:**

1. **Cleanup en useEffect:**
```typescript
useEffect(() => {
  const subscription = dataManager.subscribe('metrics', callback);
  
  return () => {
    subscription.unsubscribe();
  };
}, []);
```

2. **Limitar cache size:**
```typescript
// En MetricsCalculator
const MAX_CACHE_SIZE = 1000;
if (this.cache.size > MAX_CACHE_SIZE) {
  const oldestKey = this.cache.keys().next().value;
  this.cache.delete(oldestKey);
}
```

## 🚀 Errores de Deployment

### Build falla

**Síntomas:**
- `npm run build` falla
- TypeScript errors
- Missing dependencies

**Diagnóstico:**
```bash
# Verificar Node version
node --version
npm --version

# Limpiar cache
npm cache clean --force
rm -rf node_modules package-lock.json
npm install

# Type checking
npm run type-check
```

**Soluciones:**

1. **Actualizar dependencias:**
```bash
# Verificar outdated packages
npm outdated

# Actualizar
npm update

# O específico
npm install @types/react@latest
```

2. **Fix TypeScript errors:**
```typescript
// Tipos faltantes
declare module '*.svg' {
  const content: any;
  export default content;
}

// Strict mode fixes
interface Props {
  children?: React.ReactNode;
  className?: string;
}
```

### Docker build falla

**Síntomas:**
- Docker build errors
- Image size muy grande
- Runtime errors en container

**Diagnóstico:**
```bash
# Build con debug
docker build --no-cache --progress=plain .

# Verificar layers
docker history icp-dashboard:latest

# Test local
docker run -p 3000:80 icp-dashboard:latest
```

**Soluciones:**

1. **Multi-stage build:**
```dockerfile
# Build stage
FROM node:18-alpine AS builder
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production
COPY . .
RUN npm run build

# Production stage
FROM nginx:alpine
COPY --from=builder /app/build /usr/share/nginx/html
COPY nginx.conf /etc/nginx/nginx.conf
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
```

2. **Optimizar .dockerignore:**
```
node_modules
npm-debug.log
.git
.gitignore
README.md
.env
.nyc_output
coverage
.nyc_output
```

## 🎨 Problemas de UI

### Componentes no renderizan

**Síntomas:**
- Pantalla en blanco
- Componentes faltantes
- Console errors

**Diagnóstico:**
```javascript
// Error boundary
class ErrorBoundary extends React.Component {
  componentDidCatch(error, errorInfo) {
    console.error('Component error:', error, errorInfo);
  }
  
  render() {
    if (this.state.hasError) {
      return <h1>Something went wrong.</h1>;
    }
    return this.props.children;
  }
}
```

**Soluciones:**

1. **Verificar imports:**
```typescript
// Verificar paths
import { Dashboard } from './components/Dashboard';
import { useRealTimeData } from './hooks/useRealTimeData';

// Verificar exports
export { Dashboard };
export default Dashboard;
```

2. **Verificar props:**
```typescript
interface Props {
  data?: MetricsData;
  isLoading?: boolean;
}

const Component: React.FC<Props> = ({ 
  data = null, 
  isLoading = false 
}) => {
  if (isLoading) return <Loading />;
  if (!data) return <NoData />;
  
  return <div>{/* content */}</div>;
};
```

### Estilos no aplican

**Síntomas:**
- CSS no carga
- Estilos incorrectos
- Layout roto

**Diagnóstico:**
```bash
# Verificar CSS build
ls -la build/static/css/

# Verificar imports
grep -r "import.*css" src/
```

**Soluciones:**

1. **CSS Modules:**
```typescript
// Component.module.css
.container {
  padding: 1rem;
}

// Component.tsx
import styles from './Component.module.css';

const Component = () => (
  <div className={styles.container}>
    Content
  </div>
);
```

2. **Global styles:**
```css
/* src/index.css */
@import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600&display=swap');

* {
  box-sizing: border-box;
}

body {
  font-family: 'Inter', sans-serif;
  margin: 0;
  padding: 0;
}
```

## 🔧 Debugging Tools

### React DevTools

```javascript
// Instalar React DevTools extension
// Chrome: https://chrome.google.com/webstore/detail/react-developer-tools/

// Profiling
import { Profiler } from 'react';

const onRenderCallback = (id, phase, actualDuration) => {
  console.log('Render:', { id, phase, actualDuration });
};

<Profiler id="Dashboard" onRender={onRenderCallback}>
  <Dashboard />
</Profiler>
```

### Debug WebSocket

```javascript
// WebSocket debug
const wsManager = new WebSocketManager();
wsManager.onError((error) => {
  console.error('WebSocket error:', error);
});

wsManager.onDisconnect(() => {
  console.warn('WebSocket disconnected');
});

// Monitor connection quality
setInterval(() => {
  console.log('Connection quality:', wsManager.getConnectionQuality());
}, 10000);
```

### Performance monitoring

```javascript
// Performance marks
performance.mark('dashboard-start');
// ... código ...
performance.mark('dashboard-end');
performance.measure('dashboard-load', 'dashboard-start', 'dashboard-end');

// Memory monitoring
if ('memory' in performance) {
  console.log('Memory usage:', {
    used: performance.memory.usedJSHeapSize,
    total: performance.memory.totalJSHeapSize,
    limit: performance.memory.jsHeapSizeLimit
  });
}
```

## 📊 Logs y Monitoreo

### Configurar logging

```typescript
// src/utils/logger.ts
enum LogLevel {
  DEBUG = 0,
  INFO = 1,
  WARN = 2,
  ERROR = 3
}

class Logger {
  private level: LogLevel;
  
  constructor(level: LogLevel = LogLevel.INFO) {
    this.level = level;
  }
  
  debug(message: string, data?: any) {
    if (this.level <= LogLevel.DEBUG) {
      console.debug(`[DEBUG] ${message}`, data);
    }
  }
  
  info(message: string, data?: any) {
    if (this.level <= LogLevel.INFO) {
      console.info(`[INFO] ${message}`, data);
    }
  }
  
  warn(message: string, data?: any) {
    if (this.level <= LogLevel.WARN) {
      console.warn(`[WARN] ${message}`, data);
    }
  }
  
  error(message: string, error?: Error) {
    if (this.level <= LogLevel.ERROR) {
      console.error(`[ERROR] ${message}`, error);
    }
  }
}

export const logger = new Logger(
  process.env.NODE_ENV === 'development' ? LogLevel.DEBUG : LogLevel.INFO
);
```

### Monitoreo en producción

```javascript
// Sentry integration
import * as Sentry from '@sentry/react';

Sentry.init({
  dsn: process.env.REACT_APP_SENTRY_DSN,
  environment: process.env.NODE_ENV,
  beforeSend(event) {
    // Filter out non-critical errors
    if (event.exception) {
      const error = event.exception.values?.[0];
      if (error?.type === 'ChunkLoadError') {
        return null; // Don't send chunk load errors
      }
    }
    return event;
  }
});

// Custom error tracking
export const trackError = (error: Error, context?: any) => {
  Sentry.captureException(error, {
    contexts: { dashboard: context }
  });
};
```

### Health checks

```bash
#!/bin/bash
# scripts/health-check.sh

# Basic health check
curl -f http://localhost:3000/health || exit 1

# API health
curl -f http://localhost:3000/api/metrics || exit 1

# WebSocket health (if wscat available)
if command -v wscat > /dev/null; then
  timeout 5 wscat -c ws://localhost:3000/ws --close || echo "WebSocket check failed"
fi

echo "Health check passed"
```

## 🆘 Escalation

### Cuando contactar soporte

1. **Errores críticos** que afectan funcionalidad principal
2. **Performance issues** que no se resuelven con optimizaciones básicas
3. **Security vulnerabilities** detectadas
4. **Data corruption** o pérdida de datos

### Información a incluir

```bash
# Generar reporte de debug
cat > debug-report.txt << EOF
Dashboard Version: $(cat package.json | jq -r .version)
Node Version: $(node --version)
Browser: $(echo $USER_AGENT)
Environment: $(echo $NODE_ENV)
Timestamp: $(date -u +%Y-%m-%dT%H:%M:%SZ)

Error Details:
$(cat error.log | tail -50)

System Info:
$(uname -a)

Network Info:
$(curl -s http://localhost:3000/api/health)
EOF
```

### Contactos

- **Technical Support**: support@icp-dashboard.com
- **Emergency**: emergency@icp-dashboard.com
- **GitHub Issues**: https://github.com/your-org/icp-dashboard/issues

---

**Versión**: 1.0.0  
**Última actualización**: Enero 2025