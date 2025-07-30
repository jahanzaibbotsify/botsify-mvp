/**
 * Performance monitoring and optimization utilities
 */

// Performance metrics
const performanceMetrics = {
  routeLoadTimes: new Map<string, number>(),
  componentLoadTimes: new Map<string, number>(),
  apiCallTimes: new Map<string, number>(),
  cacheHitRates: new Map<string, { hits: number; misses: number }>()
};

// Performance monitoring
export class PerformanceMonitor {
  private static instance: PerformanceMonitor;
  private startTimes = new Map<string, number>();

  static getInstance(): PerformanceMonitor {
    if (!PerformanceMonitor.instance) {
      PerformanceMonitor.instance = new PerformanceMonitor();
    }
    return PerformanceMonitor.instance;
  }

  startTimer(label: string): void {
    this.startTimes.set(label, performance.now());
  }

  endTimer(label: string): number {
    const startTime = this.startTimes.get(label);
    if (!startTime) {
      console.warn(`Timer '${label}' was not started`);
      return 0;
    }

    const duration = performance.now() - startTime;
    this.startTimes.delete(label);
    
    // Store metric
    performanceMetrics.routeLoadTimes.set(label, duration);
    
    // Log slow operations
    if (duration > 1000) {
      console.warn(`🐌 Slow operation detected: ${label} took ${duration.toFixed(2)}ms`);
    } else {
      console.log(`⚡ ${label} completed in ${duration.toFixed(2)}ms`);
    }
    
    return duration;
  }

  recordCacheHit(cacheName: string, hit: boolean): void {
    const current = performanceMetrics.cacheHitRates.get(cacheName) || { hits: 0, misses: 0 };
    
    if (hit) {
      current.hits++;
    } else {
      current.misses++;
    }
    
    performanceMetrics.cacheHitRates.set(cacheName, current);
  }

  getCacheHitRate(cacheName: string): number {
    const stats = performanceMetrics.cacheHitRates.get(cacheName);
    if (!stats || (stats.hits + stats.misses) === 0) return 0;
    return (stats.hits / (stats.hits + stats.misses)) * 100;
  }

  getAverageRouteLoadTime(): number {
    const times = Array.from(performanceMetrics.routeLoadTimes.values());
    if (times.length === 0) return 0;
    return times.reduce((sum, time) => sum + time, 0) / times.length;
  }

  logPerformanceReport(): void {
    console.group('📊 Performance Report');
    console.log(`Average route load time: ${this.getAverageRouteLoadTime().toFixed(2)}ms`);
    
    console.log('Cache hit rates:');
    performanceMetrics.cacheHitRates.forEach((stats, cacheName) => {
      const hitRate = this.getCacheHitRate(cacheName);
      console.log(`  ${cacheName}: ${hitRate.toFixed(1)}% (${stats.hits}/${stats.hits + stats.misses})`);
    });
    
    console.groupEnd();
  }
}

// Lazy loading utilities
export class LazyLoader {
  private static loadedComponents = new Set<string>();
  private static loadingPromises = new Map<string, Promise<any>>();

  static async loadComponent(componentPath: string): Promise<any> {
    // Return cached component if already loaded
    if (this.loadedComponents.has(componentPath)) {
      return import(componentPath);
    }

    // Return existing promise if already loading
    if (this.loadingPromises.has(componentPath)) {
      return this.loadingPromises.get(componentPath);
    }

    // Start loading
    const loadPromise = import(componentPath).then(component => {
      this.loadedComponents.add(componentPath);
      this.loadingPromises.delete(componentPath);
      return component;
    });

    this.loadingPromises.set(componentPath, loadPromise);
    return loadPromise;
  }

  static preloadComponent(componentPath: string): void {
    if (!this.loadedComponents.has(componentPath) && !this.loadingPromises.has(componentPath)) {
      this.loadComponent(componentPath);
    }
  }

  static isComponentLoaded(componentPath: string): boolean {
    return this.loadedComponents.has(componentPath);
  }
}

// Memory management utilities
export class MemoryManager {
  private static memoryThreshold = 50 * 1024 * 1024; // 50MB

  static checkMemoryUsage(): void {
    if ('memory' in performance) {
      const memory = (performance as any).memory;
      const usedMB = memory.usedJSHeapSize / 1024 / 1024;
      const totalMB = memory.totalJSHeapSize / 1024 / 1024;
      
      if (usedMB > this.memoryThreshold / 1024 / 1024) {
        console.warn(`⚠️ High memory usage: ${usedMB.toFixed(2)}MB / ${totalMB.toFixed(2)}MB`);
        this.suggestMemoryOptimizations();
      }
    }
  }

  private static suggestMemoryOptimizations(): void {
    console.log('💡 Memory optimization suggestions:');
    console.log('  - Clear component caches');
    console.log('  - Clear navigation caches');
    console.log('  - Clear store caches');
    console.log('  - Consider lazy loading more components');
  }

  static clearMemory(): void {
    // Clear various caches
    if (typeof window !== 'undefined') {
      // Clear component cache
      if ((window as any).componentCache) {
        (window as any).componentCache.clear();
      }
      
      // Clear navigation cache
      if ((window as any).navigationCache) {
        (window as any).navigationCache.clear();
      }
      
      // Clear store cache
      if ((window as any).storeCache) {
        (window as any).storeCache.clear();
      }
    }
  }
}

// Export singleton instances
export const performanceMonitor = PerformanceMonitor.getInstance();
export const lazyLoader = LazyLoader;
export const memoryManager = MemoryManager; 