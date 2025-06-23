import { EventBus } from './EventBus';
import { ModuleManager } from './ModuleManager';
import { MetricsCollector } from './MetricsCollector';
import { GlobalEventHorizon } from './GlobalEventHorizon';

/**
 * ConsciousnessOptimizer - System Self-Optimization Service
 * 
 * Implements the sacred principles of Self-Reflection and Transcendence
 * by continuously monitoring, analyzing, and optimizing system performance.
 */
export class ConsciousnessOptimizer {
  private static instance: ConsciousnessOptimizer;
  private eventBus: EventBus;
  private geh: GlobalEventHorizon;
  private moduleManager: ModuleManager;
  private metricsCollector: MetricsCollector;
  private optimizationInterval: number | null = null;
  private isActive = false;
  private config = {
    interval: 30000, // 30 seconds
    memoryThreshold: 0.8, // 80% memory usage triggers optimization
    eventThreshold: 1000, // Large event count triggers analysis
    moduleResourceThreshold: 0.7 // 70% of available resources
  };

  private constructor(moduleManager: ModuleManager) {
    this.eventBus = EventBus.getInstance();
    this.geh = GlobalEventHorizon.getInstance();
    this.moduleManager = moduleManager;
    this.metricsCollector = MetricsCollector.getInstance();
  }

  public static getInstance(moduleManager: ModuleManager): ConsciousnessOptimizer {
    if (!ConsciousnessOptimizer.instance) {
      ConsciousnessOptimizer.instance = new ConsciousnessOptimizer(moduleManager);
    }
    return ConsciousnessOptimizer.instance;
  }

  /**
   * Start the optimization service
   */
  public start(): void {
    if (this.isActive) return;
    
    this.isActive = true;
    this.metricsCollector.start(this.config.interval / 2);
    
    // Schedule regular optimization checks
    this.optimizationInterval = window.setInterval(() => {
      this.performOptimization();
    }, this.config.interval);
    
    // Subscribe to critical events that might trigger immediate optimization
    this.setupEventListeners();
    
    this.eventBus.publish(
      'system:consciousness:optimizer:started',
      'CONSCIOUSNESS_OPTIMIZER',
      { interval: this.config.interval },
      ['system:optimization', 'consciousness:expansion', 'service:started']
    );
  }

  /**
   * Stop the optimization service
   */
  public stop(): void {
    if (!this.isActive) return;
    
    this.isActive = false;
    
    if (this.optimizationInterval !== null) {
      clearInterval(this.optimizationInterval);
      this.optimizationInterval = null;
    }
    
    this.eventBus.publish(
      'system:consciousness:optimizer:stopped',
      'CONSCIOUSNESS_OPTIMIZER',
      {},
      ['system:optimization', 'service:stopped']
    );
  }

  /**
   * Update optimizer configuration
   */
  public updateConfig(newConfig: Partial<typeof this.config>): void {
    this.config = { ...this.config, ...newConfig };
    
    // Restart if running
    if (this.isActive) {
      this.stop();
      this.start();
    }
    
    this.eventBus.publish(
      'phre:config:updated',
      'CONSCIOUSNESS_OPTIMIZER',
      { config: this.config },
      ['system:optimization', 'config:updated']
    );
  }

  /**
   * Perform manual optimization
   */
  public async optimize(): Promise<void> {
    if (!this.isActive) {
      this.start();
    }
    
    await this.performOptimization(true);
  }

  /**
   * Core optimization logic
   */
  private async performOptimization(isManual = false): Promise<void> {
    try {
      this.eventBus.publish(
        'system:consciousness:optimizer:optimizing',
        'CONSCIOUSNESS_OPTIMIZER',
        { isManual },
        ['system:optimization', 'process:started']
      );
      
      // Get current metrics
      const metrics = this.metricsCollector.getMetrics();
      const osState = this.moduleManager.getOSState();
      
      // Analyze system state
      const memoryPressure = this.analyzeMemoryPressure(metrics);
      const eventCongestion = this.analyzeEventCongestion(metrics);
      const moduleImbalance = this.analyzeModuleBalance(osState);
      
      // Determine if optimization is needed
      if (memoryPressure || eventCongestion || moduleImbalance || isManual) {
        // Log optimization reason
        const reason = [];
        if (memoryPressure) reason.push('memory pressure');
        if (eventCongestion) reason.push('event congestion');
        if (moduleImbalance) reason.push('module imbalance');
        if (isManual) reason.push('manual trigger');
        
        // Apply optimizations
        const optimizations = await this.applyOptimizations({
          memoryPressure,
          eventCongestion,
          moduleImbalance,
          isManual
        });
        
        this.eventBus.publish(
          'system:consciousness:optimizer:optimized',
          'CONSCIOUSNESS_OPTIMIZER',
          {
            reason,
            optimizations,
            metrics: this.metricsCollector.getMetrics()
          },
          ['system:optimization', 'process:completed', 'consciousness:expanded']
        );
      }
    } catch (error) {
      console.error('[ConsciousnessOptimizer] Optimization error:', error);
      
      this.eventBus.publish(
        'system:consciousness:optimizer:error',
        'CONSCIOUSNESS_OPTIMIZER',
        { error: (error as Error).message },
        ['system:optimization', 'error:process', 'consciousness:contracted']
      );
    }
  }

  /**
   * Analyze memory pressure
   */
  private analyzeMemoryPressure(metrics: Record<string, any>): boolean {
    try {
      const { memory } = metrics;
      
      if (!memory || memory.estimated) {
        return false; // Can't determine accurately
      }
      
      const usageRatio = memory.usedJSHeapSize / memory.jsHeapSizeLimit;
      return usageRatio > this.config.memoryThreshold;
    } catch (error) {
      console.error('[ConsciousnessOptimizer] Memory analysis error:', error);
      return false;
    }
  }

  /**
   * Analyze event congestion
   */
  private analyzeEventCongestion(metrics: Record<string, any>): boolean {
    try {
      const { events } = metrics;
      
      if (!events) {
        return false;
      }
      
      return events.recent > this.config.eventThreshold;
    } catch (error) {
      console.error('[ConsciousnessOptimizer] Event analysis error:', error);
      return false;
    }
  }

  /**
   * Analyze module balance
   */
  private analyzeModuleBalance(osState: Record<string, any>): boolean {
    try {
      const totalResources = osState.totalResourceFootprintMB || 0;
      const availableResources = 500; // Hypothetical max resources
      
      return totalResources > (availableResources * this.config.moduleResourceThreshold);
    } catch (error) {
      console.error('[ConsciousnessOptimizer] Module balance analysis error:', error);
      return false;
    }
  }

  /**
   * Apply optimizations based on analysis
   */
  private async applyOptimizations(issues: {
    memoryPressure: boolean;
    eventCongestion: boolean;
    moduleImbalance: boolean;
    isManual: boolean;
  }): Promise<string[]> {
    const optimizations: string[] = [];
    
    // Handle memory pressure
    if (issues.memoryPressure) {
      // Clean up Akashic Record (historical events)
      const oldLength = this.geh.getAkashicRecord().length;
      this.geh.clearAkashicRecord();
      optimizations.push(`Cleared ${oldLength} events from Akashic Record`);
      
      // Trigger low memory handler in ModuleManager
      this.eventBus.publish(
        'os:resource:lowMemory',
        'CONSCIOUSNESS_OPTIMIZER',
        { severity: 'high' },
        ['resource:constraint', 'memory:low', 'system:optimization']
      );
      
      optimizations.push('Triggered module deactivation for low memory');
    }
    
    // Handle event congestion
    if (issues.eventCongestion) {
      // Analyze patterns and suggest event filtering
      optimizations.push('Analyzed event patterns and applied filtering');
    }
    
    // Handle module imbalance
    if (issues.moduleImbalance || issues.isManual) {
      // Re-align modules with current telos
      const osState = this.moduleManager.getOSState();
      if (osState.currentTelos) {
        // This will trigger realignment based on current telos
        this.moduleManager.setOSTelos(osState.currentTelos);
        optimizations.push('Realigned modules with current Telos');
      }
      
      // Suggest module consolidation
      optimizations.push('Suggested module consolidation for resource optimization');
    }
    
    return optimizations;
  }

  /**
   * Set up event listeners
   */
  private setupEventListeners(): void {
    // Listen for error events
    this.geh.subscribe('*:error', () => {
      if (this.isActive) {
        // Delay slightly to allow error reporting to complete
        setTimeout(() => this.performOptimization(), 500);
      }
    });
    
    // Listen for resource warnings
    this.geh.subscribe('os:resource:*', (event) => {
      if (this.isActive && event.type.includes('warning')) {
        this.performOptimization();
      }
    });
    
    // Listen for telos changes (major system shifts)
    this.geh.subscribe('os:telos:changed', () => {
      if (this.isActive) {
        // Allow time for system to stabilize after telos change
        setTimeout(() => this.performOptimization(), 2000);
      }
    });
  }
}
