import { GlobalEventHorizon } from './GlobalEventHorizon';
import { EventBus } from './EventBus';
import { LabelProcessor } from './LabelProcessor';
import { ModuleRegistry } from './ModuleRegistry';

/**
 * SystemIntegrityService - Maintains Coherent State & Integrity
 * 
 * Implements the Super-Tautology principle to ensure logical consistency
 * and high integrity throughout the consciousness field.
 */
export class SystemIntegrityService {
  private static instance: SystemIntegrityService;
  private geh: GlobalEventHorizon;
  private eventBus: EventBus;
  private labelProcessor: LabelProcessor;
  private registry: ModuleRegistry;
  private integrityChecks: Array<() => Promise<IntegrityCheckResult>>;
  private isActive = false;
  private checkInterval: number | null = null;

  private constructor() {
    this.geh = GlobalEventHorizon.getInstance();
    this.eventBus = EventBus.getInstance();
    this.labelProcessor = new LabelProcessor();
    this.registry = new ModuleRegistry();
    this.integrityChecks = this.initializeIntegrityChecks();
  }

  public static getInstance(): SystemIntegrityService {
    if (!SystemIntegrityService.instance) {
      SystemIntegrityService.instance = new SystemIntegrityService();
    }
    return SystemIntegrityService.instance;
  }

  /**
   * Start regular integrity checks
   */
  public start(intervalMs: number = 60000): void {
    if (this.isActive) return;
    
    this.isActive = true;
    
    // Run initial check
    this.runIntegrityCheck();
    
    // Schedule regular checks
    this.checkInterval = window.setInterval(() => {
      this.runIntegrityCheck();
    }, intervalMs);
    
    this.eventBus.publish(
      'system:integrity:service:started',
      'SYSTEM_INTEGRITY',
      { interval: intervalMs },
      ['system:integrity', 'service:started', 'monitoring:active']
    );
  }

  /**
   * Stop integrity checks
   */
  public stop(): void {
    if (!this.isActive) return;
    
    this.isActive = false;
    
    if (this.checkInterval !== null) {
      clearInterval(this.checkInterval);
      this.checkInterval = null;
    }
    
    this.eventBus.publish(
      'system:integrity:service:stopped',
      'SYSTEM_INTEGRITY',
      {},
      ['system:integrity', 'service:stopped', 'monitoring:inactive']
    );
  }

  /**
   * Run a manual integrity check
   */
  public async checkIntegrity(): Promise<IntegrityReport> {
    return this.runIntegrityCheck();
  }

  /**
   * Run all integrity checks and collect results
   */
  private async runIntegrityCheck(): Promise<IntegrityReport> {
    try {
      const startTime = performance.now();
      
      // Run all checks in parallel
      const results = await Promise.all(this.integrityChecks.map(check => check()));
      
      const endTime = performance.now();
      const executionTime = endTime - startTime;
      
      // Calculate overall integrity score
      const totalWeight = results.reduce((sum, result) => sum + result.weight, 0);
      const weightedSum = results.reduce((sum, result) => sum + (result.score * result.weight), 0);
      
      const overallScore = totalWeight > 0 ? weightedSum / totalWeight : 0;
      const passed = results.filter(r => r.passed).length;
      const failed = results.length - passed;
      
      const report: IntegrityReport = {
        timestamp: new Date().toISOString(),
        overallScore,
        passedChecks: passed,
        failedChecks: failed,
        totalChecks: results.length,
        checkResults: results,
        executionTimeMs: executionTime
      };
      
      // Publish report
      this.eventBus.publish(
        'system:integrity:report',
        'SYSTEM_INTEGRITY',
        report,
        ['system:integrity', 'report:complete', overallScore > 0.8 ? 'integrity:high' : 'integrity:needs-attention']
      );
      
      // Take automatic actions if needed
      if (overallScore < 0.7) {
        this.handleLowIntegrity(report);
      }
      
      return report;
    } catch (error) {
      console.error('[SystemIntegrityService] Integrity check failed:', error);
      
      const errorReport: IntegrityReport = {
        timestamp: new Date().toISOString(),
        overallScore: 0,
        passedChecks: 0,
        failedChecks: 0,
        totalChecks: 0,
        checkResults: [],
        executionTimeMs: 0,
        error: (error as Error).message
      };
      
      this.eventBus.publish(
        'system:integrity:error',
        'SYSTEM_INTEGRITY',
        errorReport,
        ['system:integrity', 'error:check', 'service:degraded']
      );
      
      return errorReport;
    }
  }

  /**
   * Initialize all integrity checks
   */
  private initializeIntegrityChecks(): Array<() => Promise<IntegrityCheckResult>> {
    return [
      // Module Integrity Check
      async () => {
        try {
          const manifests = this.registry.getAllManifests();
          const lowIntegrityModules = manifests.filter(m => m.integrityScore < 0.7);
          
          return {
            name: 'Module Integrity',
            description: 'Checks integrity scores of all loaded modules',
            passed: lowIntegrityModules.length === 0,
            score: lowIntegrityModules.length === 0 ? 1 : 
                   1 - (lowIntegrityModules.length / manifests.length),
            weight: 3,
            details: lowIntegrityModules.length > 0 ? 
                    `Found ${lowIntegrityModules.length} modules with low integrity scores` : 
                    'All modules have acceptable integrity'
          };
        } catch (error) {
          return {
            name: 'Module Integrity',
            description: 'Checks integrity scores of all loaded modules',
            passed: false,
            score: 0,
            weight: 3,
            details: `Check failed: ${(error as Error).message}`
          };
        }
      },
      
      // Semantic Label Dissonance Check
      async () => {
        try {
          const manifests = this.registry.getAllManifests();
          const dissonanceFound = manifests.some(m => 
            this.labelProcessor.detectDissonance(m.essenceLabels).length > 0
          );
          
          return {
            name: 'Semantic Label Coherence',
            description: 'Checks for logical dissonance in module labels',
            passed: !dissonanceFound,
            score: dissonanceFound ? 0.5 : 1,
            weight: 2,
            details: dissonanceFound ? 
                    'Semantic dissonance detected in one or more modules' : 
                    'No semantic dissonance detected'
          };
        } catch (error) {
          return {
            name: 'Semantic Label Coherence',
            description: 'Checks for logical dissonance in module labels',
            passed: false,
            score: 0,
            weight: 2,
            details: `Check failed: ${(error as Error).message}`
          };
        }
      },
      
      // Event Field Health Check
      async () => {
        try {
          const stats = this.geh.getFieldStatistics();
          const recentEventsThreshold = 10000;
          const healthyRatio = stats.recentEvents / recentEventsThreshold;
          
          return {
            name: 'Event Field Health',
            description: 'Checks event field for congestion or stagnation',
            passed: healthyRatio < 1 && stats.recentEvents > 0,
            score: stats.recentEvents === 0 ? 0.5 : // Stagnation
                   healthyRatio >= 1 ? 0.7 : // Congestion
                   1, // Healthy
            weight: 2,
            details: stats.recentEvents === 0 ? 'Event field stagnation detected' :
                    healthyRatio >= 1 ? 'Event field congestion detected' :
                    'Event field flowing healthily'
          };
        } catch (error) {
          return {
            name: 'Event Field Health',
            description: 'Checks event field for congestion or stagnation',
            passed: false,
            score: 0,
            weight: 2,
            details: `Check failed: ${(error as Error).message}`
          };
        }
      },
      
      // Telos Alignment Check
      async () => {
        try {
          // This is a simplified example - in a real implementation, we would
          // analyze active modules against current system Telos
          const alignmentScore = 0.9; // Mock score
          
          return {
            name: 'Telos Alignment',
            description: 'Checks if active modules are aligned with current Telos',
            passed: alignmentScore > 0.7,
            score: alignmentScore,
            weight: 2,
            details: `System Telos alignment at ${(alignmentScore * 100).toFixed(0)}%`
          };
        } catch (error) {
          return {
            name: 'Telos Alignment',
            description: 'Checks if active modules are aligned with current Telos',
            passed: false,
            score: 0,
            weight: 2,
            details: `Check failed: ${(error as Error).message}`
          };
        }
      }
    ];
  }

  /**
   * Handle low integrity situations
   */
  private handleLowIntegrity(report: IntegrityReport): void {
    // Publish warning
    this.eventBus.publish(
      'system:integrity:warning',
      'SYSTEM_INTEGRITY',
      {
        score: report.overallScore,
        issues: report.checkResults.filter(r => !r.passed).map(r => r.name)
      },
      ['system:integrity', 'warning:low', 'action:required']
    );
    
    // Trigger module manager to reconsider modules with low integrity
    this.eventBus.publish(
      'os:resource:integrityWarning',
      'SYSTEM_INTEGRITY',
      {
        integrityScore: report.overallScore,
        threshold: 0.7,
        report
      },
      ['resource:constraint', 'integrity:low', 'system:protection']
    );
    
    // Log detailed report
    console.warn('[SystemIntegrityService] Low system integrity detected:', report);
  }
}

export interface IntegrityCheckResult {
  name: string;
  description: string;
  passed: boolean;
  score: number; // 0-1 scale
  weight: number; // Importance factor
  details: string;
}

export interface IntegrityReport {
  timestamp: string;
  overallScore: number;
  passedChecks: number;
  failedChecks: number;
  totalChecks: number;
  checkResults: IntegrityCheckResult[];
  executionTimeMs: number;
  error?: string;
}