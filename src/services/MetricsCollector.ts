import { GlobalEventHorizon } from './GlobalEventHorizon';
import { EventBus } from './EventBus';

/**
 * Metrics collection and monitoring service
 * Implements the Principle of Rhythm to track system vitality
 */
export class MetricsCollector {
  private static instance: MetricsCollector;
  private eventBus: EventBus;
  private geh: GlobalEventHorizon;
  private metrics: Record<string, any> = {};
  private collectionInterval: number | null = null;
  private isActive = false;

  private constructor() {
    this.eventBus = EventBus.getInstance();
    this.geh = GlobalEventHorizon.getInstance();
    this.setupEventListeners();
  }

  public static getInstance(): MetricsCollector {
    if (!MetricsCollector.instance) {
      MetricsCollector.instance = new MetricsCollector();
    }
    return MetricsCollector.instance;
  }

  /**
   * Start collecting metrics at specified interval
   */
  public start(intervalMs: number = 5000): void {
    if (this.isActive) return;
    
    this.isActive = true;
    this.collectMetrics();
    
    this.collectionInterval = window.setInterval(() => {
      this.collectMetrics();
    }, intervalMs);

    this.eventBus.publish(
      'metrics:collection:started',
      'METRICS_COLLECTOR',
      { interval: intervalMs },
      ['metrics:collection', 'system:monitoring', 'service:started']
    );
  }

  /**
   * Stop metrics collection
   */
  public stop(): void {
    if (!this.isActive) return;
    
    this.isActive = false;
    
    if (this.collectionInterval !== null) {
      clearInterval(this.collectionInterval);
      this.collectionInterval = null;
    }

    this.eventBus.publish(
      'metrics:collection:stopped',
      'METRICS_COLLECTOR',
      {},
      ['metrics:collection', 'system:monitoring', 'service:stopped']
    );
  }

  /**
   * Get current system metrics
   */
  public getMetrics(): Record<string, any> {
    return { ...this.metrics };
  }

  /**
   * Collect current system metrics
   */
  private collectMetrics(): void {
    try {
      // Get field statistics from GlobalEventHorizon
      const fieldStats = this.geh.getFieldStatistics();
      
      // Collect resource usage metrics
      const memoryUsage = this.getMemoryUsage();
      const timeMetrics = this.getTimeMetrics();
      const performanceMetrics = this.getPerformanceMetrics();
      
      // Update metrics object
      this.metrics = {
        timestamp: new Date().toISOString(),
        memory: memoryUsage,
        time: timeMetrics,
        performance: performanceMetrics,
        events: {
          total: fieldStats.totalEvents,
          recent: fieldStats.recentEvents,
          topTypes: fieldStats.topEventTypes,
          topLabels: fieldStats.topLabels
        }
      };
      
      // Publish metrics update event
      this.eventBus.publish(
        'metrics:updated',
        'METRICS_COLLECTOR',
        { metrics: this.metrics },
        ['metrics:collection', 'system:monitoring', 'data:updated']
      );
    } catch (error) {
      console.error('[MetricsCollector] Error collecting metrics:', error);
    }
  }

  /**
   * Get memory usage metrics
   */
  private getMemoryUsage(): Record<string, any> {
    // In browser environment, we can only get rough estimates
    const memoryInfo = (performance as any).memory || {};
    
    return {
      jsHeapSizeLimit: memoryInfo.jsHeapSizeLimit || 0,
      totalJSHeapSize: memoryInfo.totalJSHeapSize || 0,
      usedJSHeapSize: memoryInfo.usedJSHeapSize || 0,
      estimated: !memoryInfo.jsHeapSizeLimit
    };
  }

  /**
   * Get time-related metrics
   */
  private getTimeMetrics(): Record<string, any> {
    const now = Date.now();
    const timeOrigin = performance.timeOrigin || 0;
    
    return {
      now,
      uptime: now - timeOrigin,
      navigationStart: timeOrigin
    };
  }

  /**
   * Get performance metrics
   */
  private getPerformanceMetrics(): Record<string, any> {
    try {
      const paintMetrics = performance.getEntriesByType('paint');
      const navigationMetrics = performance.getEntriesByType('navigation')[0] || {};
      
      return {
        firstPaint: paintMetrics.find(entry => entry.name === 'first-paint')?.startTime || 0,
        firstContentfulPaint: paintMetrics.find(entry => entry.name === 'first-contentful-paint')?.startTime || 0,
        domComplete: (navigationMetrics as any).domComplete || 0,
        loadEventEnd: (navigationMetrics as any).loadEventEnd || 0
      };
    } catch (error) {
      console.error('[MetricsCollector] Error getting performance metrics:', error);
      return {};
    }
  }

  /**
   * Setup event listeners
   */
  private setupEventListeners(): void {
    // Listen for module lifecycle events
    this.geh.subscribe('module:*:*', (event) => {
      if (event.type.includes('activated') || event.type.includes('deactivated')) {
        this.collectMetrics();
      }
    });

    // Listen for error events
    this.geh.subscribe('*:error', () => {
      this.collectMetrics();
    });
  }
}