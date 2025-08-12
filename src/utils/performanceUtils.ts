/**
 * Performance optimization utilities for the ScrollIndicator component
 */

/**
 * Creates a debounced function that delays invoking func until after wait milliseconds
 * have elapsed since the last time the debounced function was invoked
 */
export const debounce = <T extends (...args: any[]) => any>(
  func: T,
  wait: number,
  immediate: boolean = false
): ((...args: Parameters<T>) => void) => {
  let timeout: NodeJS.Timeout | null = null;
  
  return function executedFunction(...args: Parameters<T>) {
    const later = () => {
      timeout = null;
      if (!immediate) func(...args);
    };
    
    const callNow = immediate && !timeout;
    
    if (timeout) clearTimeout(timeout);
    timeout = setTimeout(later, wait);
    
    if (callNow) func(...args);
  };
};

/**
 * Creates a throttled function that only invokes func at most once per every wait milliseconds
 */
export const throttle = <T extends (...args: any[]) => any>(
  func: T,
  wait: number,
  options: { leading?: boolean; trailing?: boolean } = {}
): ((...args: Parameters<T>) => void) => {
  let timeout: NodeJS.Timeout | null = null;
  let previous = 0;
  const { leading = true, trailing = true } = options;
  
  return function executedFunction(...args: Parameters<T>) {
    const now = Date.now();
    
    if (!previous && !leading) previous = now;
    
    const remaining = wait - (now - previous);
    
    if (remaining <= 0 || remaining > wait) {
      if (timeout) {
        clearTimeout(timeout);
        timeout = null;
      }
      previous = now;
      func(...args);
    } else if (!timeout && trailing) {
      timeout = setTimeout(() => {
        previous = leading ? Date.now() : 0;
        timeout = null;
        func(...args);
      }, remaining);
    }
  };
};

/**
 * Creates a function that uses requestAnimationFrame for smooth animations
 */
export const rafThrottle = <T extends (...args: any[]) => any>(
  func: T
): ((...args: Parameters<T>) => void) => {
  let rafId: number | null = null;
  
  return function executedFunction(...args: Parameters<T>) {
    if (rafId) return;
    
    rafId = requestAnimationFrame(() => {
      func(...args);
      rafId = null;
    });
  };
};

/**
 * Memory-efficient cleanup manager for event listeners and observers
 */
export class CleanupManager {
  private cleanupFunctions: (() => void)[] = [];
  private isDestroyed = false;
  
  /**
   * Adds a cleanup function to be called when cleanup() is invoked
   */
  add(cleanupFn: () => void): void {
    if (this.isDestroyed) {
      console.warn('Attempting to add cleanup function to destroyed CleanupManager');
      return;
    }
    this.cleanupFunctions.push(cleanupFn);
  }
  
  /**
   * Adds an event listener and automatically manages its cleanup
   */
  addEventListener<K extends keyof WindowEventMap>(
    target: Window,
    type: K,
    listener: (this: Window, ev: WindowEventMap[K]) => any,
    options?: boolean | AddEventListenerOptions
  ): void;
  addEventListener<K extends keyof DocumentEventMap>(
    target: Document,
    type: K,
    listener: (this: Document, ev: DocumentEventMap[K]) => any,
    options?: boolean | AddEventListenerOptions
  ): void;
  addEventListener<K extends keyof HTMLElementEventMap>(
    target: HTMLElement,
    type: K,
    listener: (this: HTMLElement, ev: HTMLElementEventMap[K]) => any,
    options?: boolean | AddEventListenerOptions
  ): void;
  addEventListener(
    target: EventTarget,
    type: string,
    listener: EventListenerOrEventListenerObject,
    options?: boolean | AddEventListenerOptions
  ): void {
    target.addEventListener(type, listener, options);
    this.add(() => target.removeEventListener(type, listener, options));
  }
  
  /**
   * Adds an intersection observer and manages its cleanup
   */
  addIntersectionObserver(observer: IntersectionObserver): void {
    this.add(() => observer.disconnect());
  }
  
  /**
   * Adds a timeout and manages its cleanup
   */
  addTimeout(timeoutId: NodeJS.Timeout): void {
    this.add(() => clearTimeout(timeoutId));
  }
  
  /**
   * Adds an interval and manages its cleanup
   */
  addInterval(intervalId: NodeJS.Timeout): void {
    this.add(() => clearInterval(intervalId));
  }
  
  /**
   * Adds a requestAnimationFrame and manages its cleanup
   */
  addAnimationFrame(rafId: number): void {
    this.add(() => cancelAnimationFrame(rafId));
  }
  
  /**
   * Executes all cleanup functions and clears the list
   */
  cleanup(): void {
    if (this.isDestroyed) return;
    
    this.cleanupFunctions.forEach(cleanupFn => {
      try {
        cleanupFn();
      } catch (error) {
        console.error('Error during cleanup:', error);
      }
    });
    
    this.cleanupFunctions = [];
    this.isDestroyed = true;
  }
  
  /**
   * Returns the number of cleanup functions registered
   */
  get size(): number {
    return this.cleanupFunctions.length;
  }
  
  /**
   * Checks if the cleanup manager has been destroyed
   */
  get destroyed(): boolean {
    return this.isDestroyed;
  }
}

/**
 * Performance monitoring utilities
 */
export class PerformanceMonitor {
  private measurements: Map<string, number[]> = new Map();
  private enabled: boolean;
  
  constructor(enabled: boolean = process.env.NODE_ENV === 'development') {
    this.enabled = enabled;
  }
  
  /**
   * Starts a performance measurement
   */
  start(label: string): void {
    if (!this.enabled) return;
    performance.mark(`${label}-start`);
  }
  
  /**
   * Ends a performance measurement and records the duration
   */
  end(label: string): number | null {
    if (!this.enabled) return null;
    
    try {
      performance.mark(`${label}-end`);
      performance.measure(label, `${label}-start`, `${label}-end`);
      
      const measure = performance.getEntriesByName(label, 'measure')[0];
      const duration = measure?.duration || 0;
      
      // Store measurement
      if (!this.measurements.has(label)) {
        this.measurements.set(label, []);
      }
      this.measurements.get(label)!.push(duration);
      
      // Clean up marks and measures
      performance.clearMarks(`${label}-start`);
      performance.clearMarks(`${label}-end`);
      performance.clearMeasures(label);
      
      return duration;
    } catch (error) {
      console.warn('Performance measurement failed:', error);
      return null;
    }
  }
  
  /**
   * Gets average duration for a measurement label
   */
  getAverage(label: string): number {
    const measurements = this.measurements.get(label);
    if (!measurements || measurements.length === 0) return 0;
    
    return measurements.reduce((sum, duration) => sum + duration, 0) / measurements.length;
  }
  
  /**
   * Gets all measurements for a label
   */
  getMeasurements(label: string): number[] {
    return this.measurements.get(label) || [];
  }
  
  /**
   * Clears all measurements
   */
  clear(): void {
    this.measurements.clear();
  }
  
  /**
   * Logs performance summary to console
   */
  logSummary(): void {
    if (!this.enabled) return;
    
    console.group('ScrollIndicator Performance Summary');
    this.measurements.forEach((durations, label) => {
      const avg = this.getAverage(label);
      const min = Math.min(...durations);
      const max = Math.max(...durations);
      console.log(`${label}: avg=${avg.toFixed(2)}ms, min=${min.toFixed(2)}ms, max=${max.toFixed(2)}ms, count=${durations.length}`);
    });
    console.groupEnd();
  }
}

/**
 * Memory usage monitoring
 */
export const getMemoryUsage = (): {
  used: number;
  total: number;
  percentage: number;
} | null => {
  if ('memory' in performance) {
    const memory = (performance as any).memory;
    return {
      used: memory.usedJSHeapSize,
      total: memory.totalJSHeapSize,
      percentage: (memory.usedJSHeapSize / memory.totalJSHeapSize) * 100
    };
  }
  return null;
};

/**
 * Checks if the device has limited resources (mobile, low-end device)
 */
export const isLowEndDevice = (): boolean => {
  // Check for reduced motion preference
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
    return true;
  }
  
  // Check for save-data preference
  if ('connection' in navigator) {
    const connection = (navigator as any).connection;
    if (connection?.saveData) {
      return true;
    }
  }
  
  // Check device memory (if available)
  if ('deviceMemory' in navigator) {
    const deviceMemory = (navigator as any).deviceMemory;
    if (deviceMemory && deviceMemory < 4) { // Less than 4GB RAM
      return true;
    }
  }
  
  // Check hardware concurrency (CPU cores)
  if (navigator.hardwareConcurrency && navigator.hardwareConcurrency < 4) {
    return true;
  }
  
  return false;
};

/**
 * Adaptive performance configuration based on device capabilities
 */
export const getPerformanceConfig = () => {
  const isLowEnd = isLowEndDevice();
  
  return {
    debounceDelay: isLowEnd ? 200 : 100,
    throttleDelay: isLowEnd ? 32 : 16, // 30fps vs 60fps
    intersectionThreshold: isLowEnd ? [0, 0.5, 1] : [0, 0.1, 0.25, 0.5, 0.75, 0.9, 1],
    enablePerformanceMonitoring: !isLowEnd && process.env.NODE_ENV === 'development',
    maxCachedMeasurements: isLowEnd ? 10 : 50
  };
};