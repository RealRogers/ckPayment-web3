# Deployment Guide

Guía completa para el despliegue del ICP Dashboard en diferentes entornos de producción.

## 📋 Tabla de Contenidos

- [Preparación para Producción](#preparación-para-producción)
- [Estrategias de Deployment](#estrategias-de-deployment)
- [Plataformas de Hosting](#plataformas-de-hosting)
- [Configuración de CI/CD](#configuración-de-cicd)
- [Monitoreo y Alertas](#monitoreo-y-alertas)
- [Rollback y Recovery](#rollback-y-recovery)
- [Performance Optimization](#performance-optimization)

## 🚀 Preparación para Producción

### Pre-deployment Checklist

- [ ] **Tests**: Todos los tests pasan (unit, integration, E2E)
- [ ] **Build**: Build de producción exitoso sin warnings
- [ ] **Environment Variables**: Variables configuradas correctamente
- [ ] **Security**: Secrets y API keys configurados
- [ ] **Performance**: Bundle size optimizado
- [ ] **Accessibility**: Tests de accesibilidad pasan
- [ ] **Browser Support**: Compatibilidad verificada
- [ ] **Mobile**: Responsive design validado

### Build para Producción

```bash
# Limpiar dependencias
rm -rf node_modules package-lock.json
npm install

# Ejecutar tests
npm run test:ci

# Type checking
npm run type-check

# Linting
npm run lint

# Build optimizado
npm run build

# Analizar bundle
npm run analyze
```

### Optimización del Build

```javascript
// webpack.config.js (si se usa eject)
const path = require('path');
const { BundleAnalyzerPlugin } = require('webpack-bundle-analyzer');

module.exports = {
  optimization: {
    splitChunks: {
      chunks: 'all',
      cacheGroups: {
        vendor: {
          test: /[\\/]node_modules[\\/]/,
          name: 'vendors',
          chunks: 'all',
        },
        common: {
          name: 'common',
          minChunks: 2,
          chunks: 'all',
        }
      }
    }
  },
  plugins: [
    process.env.ANALYZE && new BundleAnalyzerPlugin()
  ].filter(Boolean)
};
```

## 🎯 Estrategias de Deployment

### 1. Blue-Green Deployment

Despliegue con cero downtime usando dos entornos idénticos.

```yaml
# docker-compose.blue-green.yml
version: '3.8'
services:
  app-blue:
    image: icp-dashboard:blue
    ports:
      - "3000:3000"
    environment:
      - NODE_ENV=production
      - REACT_APP_VERSION=blue
    
  app-green:
    image: icp-dashboard:green
    ports:
      - "3001:3000"
    environment:
      - NODE_ENV=production
      - REACT_APP_VERSION=green
    
  nginx:
    image: nginx:alpine
    ports:
      - "80:80"
    volumes:
      - ./nginx.conf:/etc/nginx/nginx.conf
    depends_on:
      - app-blue
      - app-green
```

```bash
#!/bin/bash
# deploy-blue-green.sh

CURRENT_ENV=$(curl -s http://localhost/health | jq -r '.environment')
NEW_ENV=$([ "$CURRENT_ENV" = "blue" ] && echo "green" || echo "blue")

echo "Current environment: $CURRENT_ENV"
echo "Deploying to: $NEW_ENV"

# Build nueva imagen
docker build -t icp-dashboard:$NEW_ENV .

# Actualizar contenedor
docker-compose up -d app-$NEW_ENV

# Health check
for i in {1..30}; do
  if curl -f http://localhost:300$([ "$NEW_ENV" = "blue" ] && echo "0" || echo "1")/health; then
    echo "Health check passed"
    break
  fi
  sleep 10
done

# Switch traffic
sed -i "s/app-$CURRENT_ENV/app-$NEW_ENV/g" nginx.conf
docker-compose exec nginx nginx -s reload

echo "Deployment completed. Traffic switched to $NEW_ENV"
```

### 2. Rolling Deployment

Actualización gradual de instancias.

```yaml
# kubernetes/deployment.yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: icp-dashboard
spec:
  replicas: 3
  strategy:
    type: RollingUpdate
    rollingUpdate:
      maxUnavailable: 1
      maxSurge: 1
  selector:
    matchLabels:
      app: icp-dashboard
  template:
    metadata:
      labels:
        app: icp-dashboard
    spec:
      containers:
      - name: dashboard
        image: icp-dashboard:latest
        ports:
        - containerPort: 3000
        env:
        - name: NODE_ENV
          value: "production"
        livenessProbe:
          httpGet:
            path: /health
            port: 3000
          initialDelaySeconds: 30
          periodSeconds: 10
        readinessProbe:
          httpGet:
            path: /ready
            port: 3000
          initialDelaySeconds: 5
          periodSeconds: 5
```

### 3. Canary Deployment

Despliegue gradual con feature flags.

```typescript
// src/config/feature-flags.ts
export interface FeatureFlags {
  newDashboardUI: boolean;
  enhancedAnalytics: boolean;
  realTimeNotifications: boolean;
}

export const getFeatureFlags = async (): Promise<FeatureFlags> => {
  const response = await fetch('/api/feature-flags');
  return response.json();
};

// Uso en componentes
const FeatureGatedComponent = () => {
  const [flags, setFlags] = useState<FeatureFlags>();
  
  useEffect(() => {
    getFeatureFlags().then(setFlags);
  }, []);

  if (flags?.newDashboardUI) {
    return <NewDashboardUI />;
  }
  
  return <LegacyDashboardUI />;
};
```

## 🌐 Plataformas de Hosting

### Vercel

```json
// vercel.json
{
  "version": 2,
  "builds": [
    {
      "src": "package.json",
      "use": "@vercel/static-build",
      "config": {
        "distDir": "build"
      }
    }
  ],
  "routes": [
    {
      "src": "/static/(.*)",
      "headers": {
        "cache-control": "public, max-age=31536000, immutable"
      }
    },
    {
      "src": "/(.*)",
      "dest": "/index.html"
    }
  ],
  "env": {
    "REACT_APP_WEBSOCKET_URL": "@websocket_url",
    "REACT_APP_API_BASE_URL": "@api_base_url"
  }
}
```

```bash
# Deploy a Vercel
npm install -g vercel
vercel --prod

# Con variables de entorno
vercel env add REACT_APP_WEBSOCKET_URL production
vercel --prod
```

### Netlify

```toml
# netlify.toml
[build]
  publish = "build"
  command = "npm run build"

[build.environment]
  NODE_VERSION = "18"
  NPM_VERSION = "8"

[[redirects]]
  from = "/api/*"
  to = "https://api.icp-dashboard.com/:splat"
  status = 200

[[redirects]]
  from = "/*"
  to = "/index.html"
  status = 200

[[headers]]
  for = "/static/*"
  [headers.values]
    Cache-Control = "public, max-age=31536000, immutable"

[[headers]]
  for = "/*.js"
  [headers.values]
    Cache-Control = "public, max-age=31536000, immutable"
```

```bash
# Deploy a Netlify
npm install -g netlify-cli
netlify build
netlify deploy --prod --dir=build
```

### AWS S3 + CloudFront

```bash
#!/bin/bash
# deploy-aws.sh

BUCKET_NAME="icp-dashboard-prod"
DISTRIBUTION_ID="E1234567890123"

# Build
npm run build

# Sync a S3
aws s3 sync build/ s3://$BUCKET_NAME --delete

# Invalidar CloudFront cache
aws cloudfront create-invalidation \
  --distribution-id $DISTRIBUTION_ID \
  --paths "/*"

echo "Deployment completed"
```

```yaml
# cloudformation/infrastructure.yaml
AWSTemplateFormatVersion: '2010-09-09'
Resources:
  S3Bucket:
    Type: AWS::S3::Bucket
    Properties:
      BucketName: icp-dashboard-prod
      WebsiteConfiguration:
        IndexDocument: index.html
        ErrorDocument: index.html
      PublicAccessBlockConfiguration:
        BlockPublicAcls: false
        BlockPublicPolicy: false
        IgnorePublicAcls: false
        RestrictPublicBuckets: false

  CloudFrontDistribution:
    Type: AWS::CloudFront::Distribution
    Properties:
      DistributionConfig:
        Origins:
        - DomainName: !GetAtt S3Bucket.DomainName
          Id: S3Origin
          S3OriginConfig:
            OriginAccessIdentity: ''
        Enabled: true
        DefaultRootObject: index.html
        DefaultCacheBehavior:
          TargetOriginId: S3Origin
          ViewerProtocolPolicy: redirect-to-https
          Compress: true
          CachePolicyId: 4135ea2d-6df8-44a3-9df3-4b5a84be39ad
```

### Docker

```dockerfile
# Dockerfile
FROM node:18-alpine AS builder

WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production

COPY . .
RUN npm run build

FROM nginx:alpine
COPY --from=builder /app/build /usr/share/nginx/html
COPY nginx.conf /etc/nginx/nginx.conf

EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
```

```nginx
# nginx.conf
events {
    worker_connections 1024;
}

http {
    include       /etc/nginx/mime.types;
    default_type  application/octet-stream;
    
    gzip on;
    gzip_vary on;
    gzip_min_length 1024;
    gzip_types text/plain text/css application/json application/javascript text/xml application/xml application/xml+rss text/javascript;

    server {
        listen 80;
        server_name localhost;
        root /usr/share/nginx/html;
        index index.html;

        # Cache static assets
        location /static/ {
            expires 1y;
            add_header Cache-Control "public, immutable";
        }

        # API proxy
        location /api/ {
            proxy_pass http://api-server:8080/;
            proxy_set_header Host $host;
            proxy_set_header X-Real-IP $remote_addr;
        }

        # WebSocket proxy
        location /ws {
            proxy_pass http://websocket-server:8080;
            proxy_http_version 1.1;
            proxy_set_header Upgrade $http_upgrade;
            proxy_set_header Connection "upgrade";
            proxy_set_header Host $host;
        }

        # SPA fallback
        location / {
            try_files $uri $uri/ /index.html;
        }

        # Health check
        location /health {
            access_log off;
            return 200 "healthy\n";
            add_header Content-Type text/plain;
        }
    }
}
```

## 🔄 Configuración de CI/CD

### GitHub Actions

```yaml
# .github/workflows/deploy.yml
name: Deploy to Production

on:
  push:
    branches: [main]
  pull_request:
    branches: [main]

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
    - uses: actions/checkout@v3
    
    - name: Setup Node.js
      uses: actions/setup-node@v3
      with:
        node-version: '18'
        cache: 'npm'
    
    - name: Install dependencies
      run: npm ci
    
    - name: Run tests
      run: npm run test:ci
    
    - name: Run linting
      run: npm run lint
    
    - name: Type check
      run: npm run type-check
    
    - name: Build
      run: npm run build
    
    - name: Upload build artifacts
      uses: actions/upload-artifact@v3
      with:
        name: build-files
        path: build/

  deploy:
    needs: test
    runs-on: ubuntu-latest
    if: github.ref == 'refs/heads/main'
    
    steps:
    - uses: actions/checkout@v3
    
    - name: Download build artifacts
      uses: actions/download-artifact@v3
      with:
        name: build-files
        path: build/
    
    - name: Deploy to Vercel
      uses: amondnet/vercel-action@v20
      with:
        vercel-token: ${{ secrets.VERCEL_TOKEN }}
        vercel-org-id: ${{ secrets.ORG_ID }}
        vercel-project-id: ${{ secrets.PROJECT_ID }}
        vercel-args: '--prod'
```

### GitLab CI

```yaml
# .gitlab-ci.yml
stages:
  - test
  - build
  - deploy

variables:
  NODE_VERSION: "18"

cache:
  paths:
    - node_modules/

test:
  stage: test
  image: node:$NODE_VERSION
  script:
    - npm ci
    - npm run test:ci
    - npm run lint
    - npm run type-check
  coverage: '/Lines\s*:\s*(\d+\.\d+)%/'
  artifacts:
    reports:
      coverage_report:
        coverage_format: cobertura
        path: coverage/cobertura-coverage.xml

build:
  stage: build
  image: node:$NODE_VERSION
  script:
    - npm ci
    - npm run build
  artifacts:
    paths:
      - build/
    expire_in: 1 hour

deploy:
  stage: deploy
  image: alpine:latest
  before_script:
    - apk add --no-cache curl
  script:
    - curl -X POST "$WEBHOOK_URL" -H "Content-Type: application/json" -d '{"ref":"'$CI_COMMIT_REF_NAME'"}'
  only:
    - main
```

## 📊 Monitoreo y Alertas

### Health Checks

```typescript
// src/utils/health-check.ts
export interface HealthStatus {
  status: 'healthy' | 'degraded' | 'unhealthy';
  timestamp: Date;
  version: string;
  uptime: number;
  checks: {
    websocket: boolean;
    api: boolean;
    database: boolean;
  };
}

export const performHealthCheck = async (): Promise<HealthStatus> => {
  const startTime = performance.now();
  
  const checks = {
    websocket: await checkWebSocket(),
    api: await checkAPI(),
    database: await checkDatabase()
  };
  
  const allHealthy = Object.values(checks).every(Boolean);
  const someHealthy = Object.values(checks).some(Boolean);
  
  return {
    status: allHealthy ? 'healthy' : someHealthy ? 'degraded' : 'unhealthy',
    timestamp: new Date(),
    version: process.env.REACT_APP_VERSION || 'unknown',
    uptime: performance.now() - startTime,
    checks
  };
};
```

### Monitoring con Sentry

```typescript
// src/utils/monitoring.ts
import * as Sentry from '@sentry/react';

Sentry.init({
  dsn: process.env.REACT_APP_SENTRY_DSN,
  environment: process.env.NODE_ENV,
  tracesSampleRate: 1.0,
  integrations: [
    new Sentry.BrowserTracing(),
  ],
});

export const trackError = (error: Error, context?: any) => {
  Sentry.captureException(error, {
    contexts: {
      dashboard: context
    }
  });
};

export const trackPerformance = (name: string, duration: number) => {
  Sentry.addBreadcrumb({
    message: `Performance: ${name}`,
    level: 'info',
    data: { duration }
  });
};
```

### Alertas con Webhook

```typescript
// src/utils/alerts.ts
interface Alert {
  level: 'info' | 'warning' | 'error' | 'critical';
  message: string;
  component: string;
  timestamp: Date;
  metadata?: any;
}

export const sendAlert = async (alert: Alert) => {
  if (process.env.NODE_ENV !== 'production') return;
  
  try {
    await fetch(process.env.REACT_APP_WEBHOOK_URL!, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        text: `🚨 ${alert.level.toUpperCase()}: ${alert.message}`,
        attachments: [{
          color: getAlertColor(alert.level),
          fields: [
            { title: 'Component', value: alert.component, short: true },
            { title: 'Time', value: alert.timestamp.toISOString(), short: true },
            { title: 'Metadata', value: JSON.stringify(alert.metadata), short: false }
          ]
        }]
      })
    });
  } catch (error) {
    console.error('Failed to send alert:', error);
  }
};
```

## 🔄 Rollback y Recovery

### Automated Rollback

```bash
#!/bin/bash
# rollback.sh

PREVIOUS_VERSION=$(git log --oneline -n 2 | tail -1 | cut -d' ' -f1)
CURRENT_VERSION=$(git rev-parse HEAD)

echo "Rolling back from $CURRENT_VERSION to $PREVIOUS_VERSION"

# Revert to previous version
git checkout $PREVIOUS_VERSION

# Rebuild and deploy
npm run build
npm run deploy

# Notify team
curl -X POST "$SLACK_WEBHOOK" -H 'Content-type: application/json' \
  --data "{\"text\":\"🔄 Rollback completed: $CURRENT_VERSION → $PREVIOUS_VERSION\"}"
```

### Database Migration Rollback

```typescript
// src/utils/migration.ts
export const rollbackMigration = async (version: string) => {
  try {
    // Clear localStorage
    localStorage.clear();
    
    // Reset configuration
    const defaultConfig = await import('./config/default.json');
    localStorage.setItem('dashboard-config', JSON.stringify(defaultConfig));
    
    // Reload application
    window.location.reload();
    
  } catch (error) {
    console.error('Rollback failed:', error);
    throw error;
  }
};
```

## ⚡ Performance Optimization

### Bundle Optimization

```javascript
// webpack.config.js
const path = require('path');

module.exports = {
  optimization: {
    splitChunks: {
      chunks: 'all',
      cacheGroups: {
        vendor: {
          test: /[\\/]node_modules[\\/]/,
          name: 'vendors',
          chunks: 'all',
        },
        common: {
          name: 'common',
          minChunks: 2,
          chunks: 'all',
        }
      }
    },
    usedExports: true,
    sideEffects: false
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, 'src'),
    }
  }
};
```

### CDN Configuration

```javascript
// src/config/cdn.ts
export const CDN_CONFIG = {
  baseUrl: process.env.REACT_APP_CDN_URL || '',
  assets: {
    images: '/images',
    fonts: '/fonts',
    icons: '/icons'
  },
  cacheControl: {
    static: 'public, max-age=31536000, immutable',
    dynamic: 'public, max-age=3600'
  }
};

export const getCDNUrl = (path: string): string => {
  if (!CDN_CONFIG.baseUrl) return path;
  return `${CDN_CONFIG.baseUrl}${path}`;
};
```

### Service Worker

```javascript
// public/sw.js
const CACHE_NAME = 'icp-dashboard-v1';
const urlsToCache = [
  '/',
  '/static/js/bundle.js',
  '/static/css/main.css',
  '/manifest.json'
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => cache.addAll(urlsToCache))
  );
});

self.addEventListener('fetch', (event) => {
  event.respondWith(
    caches.match(event.request)
      .then((response) => {
        if (response) {
          return response;
        }
        return fetch(event.request);
      })
  );
});
```

## 🔒 Security

### Content Security Policy

```html
<!-- public/index.html -->
<meta http-equiv="Content-Security-Policy" content="
  default-src 'self';
  script-src 'self' 'unsafe-inline' https://cdn.jsdelivr.net;
  style-src 'self' 'unsafe-inline' https://fonts.googleapis.com;
  font-src 'self' https://fonts.gstatic.com;
  img-src 'self' data: https:;
  connect-src 'self' wss: https:;
  frame-ancestors 'none';
  base-uri 'self';
  form-action 'self';
">
```

### Environment Security

```bash
# .env.production
REACT_APP_WEBSOCKET_URL=wss://api.icp-dashboard.com/ws
REACT_APP_API_BASE_URL=https://api.icp-dashboard.com
REACT_APP_SENTRY_DSN=https://your-sentry-dsn
# No incluir secrets en variables REACT_APP_*
```

---

## 📚 Recursos Adicionales

- [Performance Guide](./performance.md)
- [Security Guide](./security.md)
- [Monitoring Guide](./monitoring.md)
- [Troubleshooting](./troubleshooting.md)

---

**Versión**: 1.0.0  
**Última actualización**: Enero 2025