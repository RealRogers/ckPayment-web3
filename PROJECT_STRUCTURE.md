# Estructura del Proyecto - ICP Dashboard

## Resumen General

Este proyecto es una aplicación de dashboard para monitoreo del Internet Computer Protocol (ICP) construida con React, TypeScript y tecnologías modernas del ecosistema web.

## Stack Tecnológico

### Frontend Core
- **React 18** - Biblioteca principal de UI
- **TypeScript** - Tipado estático
- **Vite** - Herramienta de build y desarrollo
- **React Router DOM** - Enrutamiento

### Styling y UI
- **Tailwind CSS** - Framework de CSS utility-first
- **shadcn/ui** - Sistema de componentes
- **Lucide React** - Iconografía
- **Recharts** - Gráficos y visualizaciones

### Estado y Datos
- **React Query (@tanstack/react-query)** - Gestión de estado del servidor
- **Axios** - Cliente HTTP

### Desarrollo
- **ESLint** - Linting
- **PostCSS** - Procesamiento de CSS
- **TypeScript ESLint** - Linting específico para TS

## Estructura de Directorios

```
├── public/                 # Archivos estáticos
├── src/
│   ├── components/        # Componentes reutilizables
│   │   ├── ui/           # Componentes base de shadcn/ui
│   │   └── LandingPage.tsx
│   ├── hooks/            # Custom hooks
│   │   └── useICPData.ts
│   ├── lib/              # Utilidades y configuraciones
│   │   └── utils.ts
│   ├── pages/            # Páginas principales
│   │   ├── Dashboard.tsx
│   │   └── Index.tsx
│   ├── services/         # Servicios y APIs
│   │   └── icp-service.ts
│   ├── types/            # Definiciones de tipos
│   │   └── dashboard.ts
│   ├── App.tsx           # Componente raíz
│   ├── index.css         # Estilos globales
│   └── main.tsx          # Punto de entrada
├── components.json       # Configuración de shadcn/ui
├── package.json          # Dependencias y scripts
├── tailwind.config.ts    # Configuración de Tailwind
├── tsconfig.json         # Configuración de TypeScript
└── vite.config.ts        # Configuración de Vite
```

## Arquitectura de Componentes

### Páginas Principales
- **Index.tsx** - Página de inicio con LandingPage
- **Dashboard.tsx** - Dashboard principal con métricas de ICP

### Componentes UI
- **LandingPage** - Página de bienvenida con navegación al dashboard
- **shadcn/ui components** - Sistema de componentes consistente

### Hooks Personalizados
- **useICPData** - Hook para gestión de datos de ICP con React Query

### Servicios
- **icp-service** - Servicio para comunicación con APIs de ICP
  - Integración con APIs reales de ICP
  - Sistema de fallback con datos mock
  - Manejo de errores y timeouts

## Tipos de Datos

### Dashboard Types
```typescript
interface ICPMetrics {
  totalSupply: number;
  circulatingSupply: number;
  price: number;
  marketCap: number;
  volume24h: number;
  priceChange24h: number;
}

interface SubnetInfo {
  id: string;
  name: string;
  nodeCount: number;
  status: 'active' | 'inactive';
}

interface CanisterMetrics {
  totalCanisters: number;
  activeCanisters: number;
  cyclesConsumed: number;
}
```

## Configuraciones

### Vite Configuration
- Configuración optimizada para React
- Alias de rutas configurados
- Plugins para desarrollo

### Tailwind Configuration
- Tema personalizado con variables CSS
- Configuración de colores y tipografía
- Integración con shadcn/ui

### TypeScript Configuration
- Configuración estricta
- Resolución de módulos optimizada
- Soporte para JSX

## Características Principales

### 1. Dashboard de Métricas ICP
- Visualización de métricas en tiempo real
- Gráficos interactivos con Recharts
- Datos de subnets y canisters

### 2. Sistema de Datos Resiliente
- Integración con APIs oficiales de ICP
- Fallback automático a datos mock
- Manejo robusto de errores

### 3. UI Moderna y Responsiva
- Diseño basado en Tailwind CSS
- Componentes consistentes con shadcn/ui
- Experiencia de usuario optimizada

### 4. Arquitectura Escalable
- Separación clara de responsabilidades
- Hooks personalizados para lógica reutilizable
- Tipado fuerte con TypeScript

## Scripts Disponibles

```json
{
  "dev": "vite",
  "build": "tsc && vite build",
  "lint": "eslint . --ext ts,tsx --report-unused-disable-directives --max-warnings 0",
  "preview": "vite preview"
}
```

## Flujo de Datos

1. **Inicialización** - App.tsx configura React Query y enrutamiento
2. **Navegación** - React Router maneja las rutas
3. **Datos** - useICPData hook gestiona el estado con React Query
4. **Servicios** - icp-service maneja las llamadas a APIs
5. **UI** - Componentes renderizan datos con shadcn/ui

## Consideraciones de Desarrollo

### Performance
- React Query para caching inteligente
- Vite para builds optimizados
- Lazy loading donde sea apropiado

### Mantenibilidad
- Estructura modular clara
- Tipado estricto con TypeScript
- Separación de concerns

### Escalabilidad
- Arquitectura preparada para nuevas features
- Sistema de componentes extensible
- Configuración flexible