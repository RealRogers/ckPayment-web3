# Design Document

## Overview

This design enhances the existing AnimatedBackground.tsx component to integrate with ICP (Internet Computer Protocol) and display animated token particles representing ckBTC and ckETH. The enhancement maintains the current hexagonal grid and particle system while adding SVG-based token icons, real-time canister data integration, and responsive performance optimization.

## Architecture

### Component Structure
```
AnimatedBackground
├── Canvas Management (existing)
├── Hexagon Grid (existing) 
├── Enhanced Particle System
│   ├── Token Particle Class (new)
│   ├── SVG Icon Rendering (new)
│   └── Connection Lines (existing)
├── ICP Integration Layer (new)
│   ├── Canister Client Setup
│   ├── Token Data Fetching
│   └── Rate Update Handling
└── Performance Optimization (enhanced)
```

### Data Flow
1. Component mounts → Initialize ICP agent
2. Fetch token data from canister → Update particle properties
3. Render loop → Draw hexagons, token particles with SVG icons, connections
4. Responsive updates → Adjust particle count and canvas size

## Components and Interfaces

### Enhanced Particle Class
```typescript
interface TokenData {
  symbol: string;
  rate: number;
  color: string;
  svgIcon: string;
}

class TokenParticle extends Particle {
  tokenType: 'ckBTC' | 'ckETH' | 'default';
  tokenData?: TokenData;
  svgIcon?: HTMLImageElement;
  pulsePhase: number;
  
  constructor(tokenType?: 'ckBTC' | 'ckETH');
  updateFromTokenData(data: TokenData): void;
  drawTokenIcon(ctx: CanvasRenderingContext2D): void;
}
```

### ICP Integration Interface
```typescript
interface ICPTokenService {
  agent: HttpAgent;
  canisterId: string;
  
  fetchTokenRates(): Promise<TokenData[]>;
  setupPeriodicUpdates(callback: (data: TokenData[]) => void): void;
  cleanup(): void;
}
```

### SVG Icon Management
```typescript
interface SVGIconManager {
  loadIcon(symbol: string): Promise<HTMLImageElement>;
  getIcon(symbol: string): HTMLImageElement | null;
  preloadIcons(symbols: string[]): Promise<void>;
}
```

## Data Models

### Token Data Structure
```typescript
type TokenSymbol = 'ckBTC' | 'ckETH';

interface TokenRate {
  symbol: TokenSymbol;
  usdRate: number;
  lastUpdated: number;
  change24h: number;
}

interface ParticleConfig {
  count: number;
  tokenRatio: {
    ckBTC: number;
    ckETH: number;
    default: number;
  };
  performance: {
    maxParticles: number;
    reducedMotion: boolean;
  };
}
```

### Canvas State Management
```typescript
interface CanvasState {
  particles: TokenParticle[];
  tokenData: Map<TokenSymbol, TokenData>;
  performanceMode: 'high' | 'medium' | 'low';
  lastUpdate: number;
}
```

## Error Handling

### Canister Connection Failures
- **Fallback Strategy**: Continue with default particle behavior
- **Retry Logic**: Exponential backoff for canister calls
- **User Experience**: No visual disruption, graceful degradation

### SVG Loading Failures
- **Default Icons**: Use colored circles as fallback
- **Async Loading**: Non-blocking icon loading with placeholder
- **Error Logging**: Console warnings for debugging

### Performance Issues
- **Adaptive Particle Count**: Reduce particles on low-end devices
- **Frame Rate Monitoring**: Adjust complexity based on FPS
- **Memory Management**: Proper cleanup of canvas resources

## Testing Strategy

### Unit Tests
- TokenParticle class methods
- SVG icon loading and caching
- Token data transformation utilities
- Performance optimization functions

### Integration Tests
- ICP canister communication
- Canvas rendering with token particles
- Responsive behavior across screen sizes
- Error handling scenarios

### Performance Tests
- Frame rate consistency with various particle counts
- Memory usage monitoring
- Canvas resize performance
- Token data update efficiency

### Visual Regression Tests
- Screenshot comparison for particle rendering
- SVG icon display accuracy
- Animation smoothness validation
- Cross-browser compatibility

## Implementation Details

### SVG Icon Integration
- **Loading Strategy**: Preload token SVG icons on component mount
- **Rendering Method**: Convert SVG to HTMLImageElement for canvas drawImage()
- **Caching**: Store loaded icons in Map for reuse
- **Fallback**: Colored circles if SVG loading fails

### ICP Canister Integration
- **Agent Setup**: Initialize HttpAgent with mainnet/local network
- **Mock Canister**: Create simple canister for demo with HTTPS outcalls
- **Data Format**: Return JSON with token symbols, rates, and metadata
- **Update Frequency**: Fetch rates every 30 seconds, update particles immediately

### Performance Optimizations
- **Particle Limits**: Max 60 particles on desktop, 30 on mobile
- **Selective Updates**: Only redraw changed particles
- **RAF Optimization**: Skip frames if performance drops below 30fps
- **Memory Cleanup**: Proper disposal of canvas contexts and event listeners

### Responsive Design
- **Breakpoint Detection**: Adjust particle count based on screen size
- **Touch Device Optimization**: Reduce animation complexity on mobile
- **High DPI Support**: Scale canvas for retina displays
- **Orientation Changes**: Recalculate particle positions on device rotation

## Dependencies

### New Dependencies Required
```json
{
  "@dfinity/agent": "^0.20.0",
  "@dfinity/candid": "^0.20.0"
}
```

### SVG Assets
- ckBTC icon SVG (Bitcoin-style icon with "ck" prefix)
- ckETH icon SVG (Ethereum-style icon with "ck" prefix)
- Fallback geometric shapes for loading states

## Configuration

### Environment Variables
```typescript
const ICP_CONFIG = {
  CANISTER_ID: process.env.VITE_TOKEN_CANISTER_ID || 'rdmx6-jaaaa-aaaah-qdrqq-cai',
  NETWORK: process.env.VITE_ICP_NETWORK || 'local',
  UPDATE_INTERVAL: 30000, // 30 seconds
};
```

### Performance Thresholds
```typescript
const PERFORMANCE_CONFIG = {
  HIGH_END: { particles: 60, connections: true, svgIcons: true },
  MEDIUM: { particles: 40, connections: true, svgIcons: true },
  LOW_END: { particles: 20, connections: false, svgIcons: false },
};
```