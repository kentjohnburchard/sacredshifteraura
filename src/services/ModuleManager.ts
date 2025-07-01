import { 
  ModuleManifest, 
  IModule, 
  ModuleInfo, 
  OSTelos, 
  OSUserState, 
  ModuleErrorSummary, 
  ModuleActivitySummary,
  GESemanticEvent,
  ModuleState
} from '../types';
import { LabelProcessor } from './LabelProcessor';
import { GlobalEventHorizon } from './GlobalEventHorizon';
import { ModuleRegistry } from './ModuleRegistry';
import { ModuleToggleService } from './ModuleToggleService';

/**
 * ModuleManager - The Core Orchestrator and Observing Self
 * Enhanced with dynamic module toggle support
 */
export class ModuleManager {
  private modules: Map<string, ModuleInfo> = new Map();
  private labelProcessor: LabelProcessor;
  private geh: GlobalEventHorizon;
  private registry: ModuleRegistry;
  private toggleService: ModuleToggleService;
  private currentTelos: OSTelos | null = null;
  private currentUserState: OSUserState | null = null;
  private unsubscribeFunctions: (() => void)[] = [];
  
  // Configuration constants
  private readonly MIN_INTEGRITY_SCORE_FOR_LOAD = 0.6;
  private readonly IDLE_TIMEOUT_MS = 5 * 60 * 1000; // 5 minutes
  private readonly PURGE_CYCLE_INTERVAL_MS = 2 * 60 * 1000; // 2 minutes
  private readonly INTEGRITY_DEGRADATION_PER_ERROR = 0.05;
  private readonly CRITICAL_INTEGRITY_THRESHOLD = 0.3;

  constructor() {
    this.labelProcessor = new LabelProcessor();
    this.geh = GlobalEventHorizon.getInstance();
    this.registry = new ModuleRegistry();
    this.toggleService = ModuleToggleService.getInstance();
    this.setupEventListeners();
    this.startPurgeCycle();
    this.initializeToggleService();
  }

  /**
   * Initialize the toggle service
   */
  private async initializeToggleService(): Promise<void> {
    await this.toggleService.initializeFromStorage();
  }

  /**
   * Set the OS's current purpose (Telos)
   */
  public setOSTelos(telos: OSTelos): void {
    const previousTelos = this.currentTelos;
    this.currentTelos = telos;
    
    console.log(`[ModuleManager] OS Telos changing to: ${telos.id} (Priority: ${telos.priority})`);
    
    this.geh.publish({
      type: 'os:telos:changed',
      sourceId: 'OS_CORE',
      timestamp: new Date().toISOString(),
      payload: { 
        previousTelos: previousTelos?.id || null, 
        newTelos: telos.id,
        priority: telos.priority 
      },
      metadata: { description: telos.description },
      essenceLabels: telos.essenceLabels
    });

    // Realign modules with new Telos
    this.realignModulesWithTelos();
  }

  /**
   * Update user state and realign Telos accordingly
   */
  public setOSUserState(userState: OSUserState): void {
    this.currentUserState = userState;
    
    this.geh.publish({
      type: 'os:user:stateChanged',
      sourceId: 'OS_CORE',
      timestamp: new Date().toISOString(),
      payload: { userId: userState.id, context: userState.currentContext },
      metadata: { userName: userState.name },
      essenceLabels: userState.essenceLabels
    });

    // Automatically realign Telos based on user state
    this.realignTelosBasedOnUserState();
  }

  /**
   * Ensure a module with specific capability is loaded and active
   */
  public async ensureModuleWithCapability(capability: string): Promise<IModule | null> {
    console.log(`[ModuleManager] Ensuring module with capability: ${capability}`);
    
    // Find already loaded module with this capability
    for (const [moduleId, moduleInfo] of this.modules.entries()) {
      if (moduleInfo.manifest.capabilities.includes(capability) && 
          moduleInfo.state === ModuleState.ACTIVE) {
        console.log(`[ModuleManager] Found active module with capability: ${moduleInfo.manifest.name}`);
        return moduleInfo.instance || null;
      }
    }

    // Find candidate modules
    let candidates = this.registry.findModulesByCapability(capability);
    
    if (candidates.length === 0) {
      console.warn(`[ModuleManager] No modules found with capability: ${capability}`);
      return null;
    }

    // Filter and sort by Telos alignment and integrity
    if (this.currentTelos) {
      console.log(`[ModuleManager] Filtering '${capability}' candidates by current Telos: ${this.currentTelos.id}`);
      
      candidates = candidates
        .filter(manifest => manifest.integrityScore >= this.MIN_INTEGRITY_SCORE_FOR_LOAD)
        .sort((a, b) => {
          // Primary sort: Telos alignment
          const aTelosAlignment = this.getTelosAlignmentScore(a);
          const bTelosAlignment = this.getTelosAlignmentScore(b);
          if (aTelosAlignment !== bTelosAlignment) {
            return bTelosAlignment - aTelosAlignment;
          }

          // Secondary sort: Label resonance with current Telos
          const aResonance = this.labelProcessor.getResonanceScore(a.essenceLabels, this.currentTelos!.essenceLabels);
          const bResonance = this.labelProcessor.getResonanceScore(b.essenceLabels, this.currentTelos!.essenceLabels);
          if (aResonance !== bResonance) {
            return bResonance - aResonance;
          }

          // Tertiary sort: Integrity score
          return b.integrityScore - a.integrityScore;
        });
    }

    const bestCandidate = candidates[0];
    console.log(`[ModuleManager] Discovered manifest for '${capability}' (Telos-aligned & high integrity if applicable): ${bestCandidate.name}. Loading...`);

    return await this.loadModule(bestCandidate.id);
  }

  /**
   * Load a module by ID
   */
  public async loadModule(moduleId: string): Promise<IModule | null> {
    // Check if module is disabled by toggle
    if (!this.toggleService.isEnabled(moduleId)) {
      console.warn(`[ModuleManager] Rejecting module load - disabled by toggle: ${moduleId}`);
      
      this.geh.publish({
        type: 'os:module:loadRejected',
        sourceId: 'OS_CORE',
        timestamp: new Date().toISOString(),
        payload: { moduleId, reason: 'disabled_by_toggle' },
        metadata: { moduleId },
        essenceLabels: ['module:blocked', 'toggle:disabled']
      });
      
      return null;
    }

    const manifest = this.registry.getManifest(moduleId);
    if (!manifest) {
      console.error(`[ModuleManager] Module manifest not found: ${moduleId}`);
      return null;
    }

    // Check integrity threshold
    if (manifest.integrityScore < this.MIN_INTEGRITY_SCORE_FOR_LOAD) {
      console.warn(`[ModuleManager] Rejecting module load due to low integrity: ${manifest.name} (${manifest.integrityScore})`);
      
      this.geh.publish({
        type: 'os:module:loadRejected',
        sourceId: 'OS_CORE',
        timestamp: new Date().toISOString(),
        payload: { moduleId, reason: 'low_integrity', integrityScore: manifest.integrityScore },
        metadata: { moduleName: manifest.name },
        essenceLabels: manifest.essenceLabels
      });
      
      return null;
    }

    // Check if already loaded
    const existingModule = this.modules.get(moduleId);
    if (existingModule) {
      if (existingModule.state === ModuleState.ACTIVE) {
        return existingModule.instance || null;
      } else if (existingModule.state === ModuleState.DEACTIVATED && existingModule.instance) {
        await this.activateModule(moduleId);
        return existingModule.instance;
      }
    }

    console.log(`[ModuleManager] Loading module: ${manifest.name} (v${manifest.version}) (Integrity: ${manifest.integrityScore})...`);

    this.geh.publish({
      type: 'os:module:loadAttempt',
      sourceId: 'OS_CORE',
      timestamp: new Date().toISOString(),
      payload: { moduleId, version: manifest.version },
      metadata: { moduleName: manifest.name, integrityScore: manifest.integrityScore },
      essenceLabels: manifest.essenceLabels
    });

    try {
      // Create concrete module instance using registry
      const moduleInstance = this.registry.createModuleInstance(moduleId);
      if (!moduleInstance) {
        throw new Error(`Failed to create module instance: ${moduleId}`);
      }
      
      const moduleInfo: ModuleInfo = {
        manifest,
        instance: moduleInstance,
        state: ModuleState.REGISTERED,
        lastActivityTimestamp: Date.now(),
        loadTimestamp: Date.now()
      };

      this.modules.set(moduleId, moduleInfo);

      // Initialize and activate
      moduleInfo.state = ModuleState.LOADED;
      await moduleInstance.initialize();
      moduleInfo.state = ModuleState.ACTIVE;
      await moduleInstance.activate();

      console.log(`[ModuleManager] Successfully loaded and activated: ${manifest.name}`);
      
      this.geh.publish({
        type: 'os:module:loaded',
        sourceId: 'OS_CORE',
        timestamp: new Date().toISOString(),
        payload: { moduleId, version: manifest.version, state: moduleInfo.state },
        metadata: { moduleName: manifest.name },
        essenceLabels: manifest.essenceLabels
      });

      return moduleInstance;

    } catch (error) {
      console.error(`[ModuleManager] Failed to load module: ${manifest.name}`, error);
      
      // Set module to error state if it exists
      const moduleInfo = this.modules.get(moduleId);
      if (moduleInfo) {
        moduleInfo.state = ModuleState.ERROR;
      }
      
      this.geh.publish({
        type: 'os:module:loadFailed',
        sourceId: 'OS_CORE',
        timestamp: new Date().toISOString(),
        payload: { moduleId, error: (error as Error).message },
        metadata: { moduleName: manifest.name },
        essenceLabels: manifest.essenceLabels
      });

      return null;
    }
  }

  /**
   * Get current OS state summary
   */
  public getOSState() {
    const moduleStates = new Map<string, number>();
    let totalResourceFootprint = 0;

    for (const moduleInfo of this.modules.values()) {
      const state = moduleInfo.state;
      moduleStates.set(state, (moduleStates.get(state) || 0) + 1);
      
      if (state === ModuleState.ACTIVE || state === ModuleState.LOADED) {
        totalResourceFootprint += moduleInfo.manifest.resourceFootprintMB;
      }
    }

    return {
      currentTelos: this.currentTelos,
      currentUserState: this.currentUserState,
      totalModules: this.modules.size,
      moduleStates: Object.fromEntries(moduleStates),
      totalResourceFootprintMB: totalResourceFootprint,
      fieldStatistics: this.geh.getFieldStatistics()
    };
  }

  /**
   * Get module error summary from Akashic Record
   */
  public getModuleErrorSummary(timeframeHours: number = 24): ModuleErrorSummary[] {
    const cutoffTime = new Date(Date.now() - (timeframeHours * 60 * 60 * 1000)).toISOString();
    
    const errorEvents = this.geh.queryAkashicRecord({
      types: ['module:error', 'os:module:loadFailed'],
      timeRange: { start: cutoffTime, end: new Date().toISOString() }
    });

    const errorsByModule = new Map<string, { count: number; lastTimestamp: string; manifest?: ModuleManifest }>();

    errorEvents.forEach(event => {
      const moduleId = event.payload?.moduleId || event.sourceId;
      if (!errorsByModule.has(moduleId)) {
        errorsByModule.set(moduleId, { count: 0, lastTimestamp: event.timestamp });
      }
      const entry = errorsByModule.get(moduleId)!;
      entry.count++;
      if (new Date(event.timestamp) > new Date(entry.lastTimestamp)) {
        entry.lastTimestamp = event.timestamp;
      }
    });

    return Array.from(errorsByModule.entries()).map(([moduleId, data]) => {
      const moduleInfo = this.modules.get(moduleId);
      const manifest = moduleInfo?.manifest || this.registry.getManifest(moduleId);
      
      return {
        moduleId,
        moduleName: manifest?.name || 'Unknown Module',
        errorCount: data.count,
        lastErrorTimestamp: data.lastTimestamp,
        currentIntegrityScore: manifest?.integrityScore || 0,
        status: data.count > 10 ? 'critical' : data.count > 3 ? 'degraded' : 'stable'
      };
    }).sort((a, b) => b.errorCount - a.errorCount);
  }

  /**
   * Get module activity summary from Akashic Record
   */
  public getModuleActivitySummary(timeframeHours: number = 24): ModuleActivitySummary[] {
    const cutoffTime = new Date(Date.now() - (timeframeHours * 60 * 60 * 1000)).toISOString();
    
    const activityEvents = this.geh.queryAkashicRecord({
      types: ['module:heartbeat', 'user:action', 'data:operation'],
      timeRange: { start: cutoffTime, end: new Date().toISOString() }
    });

    const activityByModule = new Map<string, { 
      heartbeat: number; 
      userAction: number; 
      dataOperation: number; 
      lastTimestamp: string;
      manifest?: ModuleManifest;
    }>();

    activityEvents.forEach(event => {
      const moduleId = event.sourceId;
      if (!activityByModule.has(moduleId)) {
        activityByModule.set(moduleId, { 
          heartbeat: 0, 
          userAction: 0, 
          dataOperation: 0, 
          lastTimestamp: event.timestamp 
        });
      }
      
      const entry = activityByModule.get(moduleId)!;
      
      if (event.type === 'module:heartbeat') entry.heartbeat++;
      else if (event.type === 'user:action') entry.userAction++;
      else if (event.type === 'data:operation') entry.dataOperation++;
      
      if (new Date(event.timestamp) > new Date(entry.lastTimestamp)) {
        entry.lastTimestamp = event.timestamp;
      }
    });

    return Array.from(activityByModule.entries()).map(([moduleId, data]) => {
      const moduleInfo = this.modules.get(moduleId);
      const manifest = moduleInfo?.manifest || this.registry.getManifest(moduleId);
      const totalActivity = data.heartbeat + data.userAction + data.dataOperation;
      
      return {
        moduleId,
        moduleName: manifest?.name || 'Unknown Module',
        heartbeatCount: data.heartbeat,
        userActionCount: data.userAction,
        dataOperationCount: data.dataOperation,
        lastActivityTimestamp: data.lastTimestamp,
        currentState: totalActivity > 50 ? 'active' : totalActivity > 10 ? 'dormant' : 'idle'
      };
    }).sort((a, b) => {
      const aTotal = a.heartbeatCount + a.userActionCount + a.dataOperationCount;
      const bTotal = b.heartbeatCount + b.userActionCount + b.dataOperationCount;
      return bTotal - aTotal;
    });
  }

  private setupEventListeners(): void {
    // Listen for module toggle changes
    this.unsubscribeFunctions.push(
      this.toggleService.subscribeToChanges((moduleId, enabled) => this.handleModuleToggle(moduleId, enabled))
    );

    // Listen for module errors and adjust integrity
    this.unsubscribeFunctions.push(
      this.geh.subscribe('module:*:error', (event) => this.handleModuleError(event))
    );

    // Listen for resource warnings
    this.unsubscribeFunctions.push(
      this.geh.subscribe('os:resource:lowMemory', () => this.handleLowMemory())
    );

    // Listen for general activity to update timestamps
    this.unsubscribeFunctions.push(
      this.geh.subscribe('*', (event) => this.handleAnyEventForActivityUpdate(event))
    );

    // Listen for Telos changes
    this.unsubscribeFunctions.push(
      this.geh.subscribe('os:telos:changed', (event) => this.handleTelosChanged(event))
    );
  }

  private async handleModuleToggle(moduleId: string, enabled: boolean): Promise<void> {
    const moduleInfo = this.modules.get(moduleId);
    
    if (enabled) {
      // Module was enabled
      if (!moduleInfo) {
        console.log(`[ModuleManager] Module enabled but not loaded: ${moduleId}`);
        // Don't auto-load, let normal capability-based loading handle it
      } else if (moduleInfo.state === ModuleState.DISABLED) {
        console.log(`[ModuleManager] Re-activating enabled module: ${moduleId}`);
        await this.activateModule(moduleId);
      }
    } else {
      // Module was disabled
      if (moduleInfo && moduleInfo.state === ModuleState.ACTIVE) {
        console.log(`[ModuleManager] Deactivating disabled module: ${moduleId}`);
        await this.deactivateModule(moduleId);
        moduleInfo.state = ModuleState.DISABLED;
      }
    }
  }

  private async realignTelosBasedOnUserState(): void {
    if (!this.currentUserState) return;

    const availableTelos = this.registry.getAllTelosOptions();
    if (availableTelos.length === 0) return;

    // Find the most resonant Telos based on user state
    let bestTelos: OSTelos | null = null;
    let bestScore = -1;

    console.log(`[ModuleManager] Realigning Telos based on User State: ${this.currentUserState.name} (Context: ${this.currentUserState.currentContext})`);
    console.log(`[ModuleManager] User State Labels: [${this.currentUserState.essenceLabels.join(', ')}]`);

    for (const telos of availableTelos) {
      const resonanceScore = this.labelProcessor.getResonanceScore(
        this.currentUserState.essenceLabels, 
        telos.essenceLabels
      );
      
      // Combine resonance with priority (weighted)
      const combinedScore = resonanceScore + (telos.priority / 100);

      if (combinedScore > bestScore) {
        bestScore = combinedScore;
        bestTelos = telos;
      }
    }

    if (bestTelos && bestTelos.id !== this.currentTelos?.id) {
      console.log(`[ModuleManager] Auto-selecting Telos: ${bestTelos.id} (Resonance Score: ${bestScore})`);
      this.setOSTelos(bestTelos);
    }
  }

  private realignModulesWithTelos(): void {
    // Deactivate modules that are no longer aligned with current Telos
    for (const [moduleId, moduleInfo] of this.modules.entries()) {
      if (moduleInfo.state === ModuleState.ACTIVE && this.currentTelos) {
        const alignmentScore = this.getTelosAlignmentScore(moduleInfo.manifest);
        const resonanceScore = this.labelProcessor.getResonanceScore(
          moduleInfo.manifest.essenceLabels, 
          this.currentTelos.essenceLabels
        );

        // If module has poor alignment and resonance, consider deactivation
        if (alignmentScore < 0.3 && resonanceScore === 0) {
          console.log(`[ModuleManager] Deactivating misaligned module: ${moduleInfo.manifest.name}`);
          this.deactivateModule(moduleId);
        }
      }
    }
  }

  private getTelosAlignmentScore(manifest: ModuleManifest): number {
    if (!this.currentTelos) return 0;
    
    const alignment = manifest.telosAlignment[this.currentTelos.id];
    if (alignment === "primary") return 1.0;
    if (typeof alignment === "number") return alignment;
    return 0;
  }

  private async activateModule(moduleId: string): Promise<void> {
    const moduleInfo = this.modules.get(moduleId);
    if (!moduleInfo || !moduleInfo.instance) return;

    try {
      await moduleInfo.instance.activate();
      moduleInfo.state = ModuleState.ACTIVE;
      moduleInfo.lastActivityTimestamp = Date.now();
      
      this.geh.publish({
        type: 'os:module:activated',
        sourceId: 'OS_CORE',
        timestamp: new Date().toISOString(),
        payload: { moduleId },
        metadata: { moduleName: moduleInfo.manifest.name },
        essenceLabels: moduleInfo.manifest.essenceLabels
      });
    } catch (error) {
      console.error(`[ModuleManager] Failed to activate module: ${moduleInfo.manifest.name}`, error);
      moduleInfo.state = ModuleState.ERROR;
    }
  }

  private async deactivateModule(moduleId: string): Promise<void> {
    const moduleInfo = this.modules.get(moduleId);
    if (!moduleInfo || !moduleInfo.instance) return;

    try {
      await moduleInfo.instance.deactivate();
      moduleInfo.state = ModuleState.DEACTIVATED;
      
      this.geh.publish({
        type: 'os:module:deactivated',
        sourceId: 'OS_CORE',
        timestamp: new Date().toISOString(),
        payload: { moduleId },
        metadata: { moduleName: moduleInfo.manifest.name },
        essenceLabels: moduleInfo.manifest.essenceLabels
      });
    } catch (error) {
      console.error(`[ModuleManager] Failed to deactivate module: ${moduleInfo.manifest.name}`, error);
    }
  }

  private async destroyModule(moduleId: string): Promise<void> {
    const moduleInfo = this.modules.get(moduleId);
    if (!moduleInfo) return;

    try {
      if (moduleInfo.instance) {
        await moduleInfo.instance.destroy();
      }
      
      this.geh.publish({
        type: 'os:module:destroyed',
        sourceId: 'OS_CORE',
        timestamp: new Date().toISOString(),
        payload: { moduleId },
        metadata: { moduleName: moduleInfo.manifest.name },
        essenceLabels: moduleInfo.manifest.essenceLabels
      });

      this.modules.delete(moduleId);
    } catch (error) {
      console.error(`[ModuleManager] Failed to destroy module: ${moduleInfo.manifest.name}`, error);
    }
  }

  private handleModuleError(event: GESemanticEvent): void {
    const moduleId = event.payload?.moduleId || event.sourceId;
    const manifest = this.registry.getManifest(moduleId);
    
    if (manifest) {
      // Reduce integrity score (karmic adjustment)
      manifest.integrityScore = Math.max(0, manifest.integrityScore - this.INTEGRITY_DEGRADATION_PER_ERROR);
      
      console.warn(`[ModuleManager] Module error detected for: ${manifest.name}. Integrity now: ${manifest.integrityScore}`);

      // Quarantine if integrity is critically low
      if (manifest.integrityScore < this.CRITICAL_INTEGRITY_THRESHOLD) {
        console.error(`[ModuleManager] Quarantining module due to critical integrity: ${manifest.name}`);
        this.destroyModule(moduleId);
      }
    }
  }

  private handleLowMemory(): void {
    console.warn(`[ModuleManager] Low memory warning received. Initiating conspansion contraction...`);
    
    // Sort modules by priority for deactivation (lowest priority first)
    const candidates = Array.from(this.modules.entries())
      .filter(([_, info]) => info.state === ModuleState.ACTIVE)
      .sort(([_, a], [__, b]) => {
        // Prioritize keeping modules aligned with current Telos
        if (this.currentTelos) {
          const aAlignment = this.getTelosAlignmentScore(a.manifest);
          const bAlignment = this.getTelosAlignmentScore(b.manifest);
          if (aAlignment !== bAlignment) return aAlignment - bAlignment;
        }
        
        // Then by resource footprint (higher footprint = higher priority for deactivation)
        return b.manifest.resourceFootprintMB - a.manifest.resourceFootprintMB;
      });

    // Deactivate up to 50% of active modules
    const toDeactivate = Math.ceil(candidates.length * 0.5);
    
    for (let i = 0; i < toDeactivate && i < candidates.length; i++) {
      const [moduleId, moduleInfo] = candidates[i];
      console.log(`[ModuleManager] Deactivating for memory: ${moduleInfo.manifest.name}`);
      this.deactivateModule(moduleId);
    }
  }

  private handleAnyEventForActivityUpdate(event: GESemanticEvent): void {
    const moduleInfo = this.modules.get(event.sourceId);
    if (moduleInfo) {
      moduleInfo.lastActivityTimestamp = Date.now();
      
      // Clear idle timer if exists
      if (moduleInfo.idleTimerId) {
        clearTimeout(moduleInfo.idleTimerId);
        moduleInfo.idleTimerId = undefined;
      }
      
      // Set new idle timer
      moduleInfo.idleTimerId = setTimeout(() => {
        if (moduleInfo.state === ModuleState.ACTIVE) {
          console.log(`[ModuleManager] Module idle timeout: ${moduleInfo.manifest.name}`);
          this.deactivateModule(event.sourceId);
        }
      }, this.IDLE_TIMEOUT_MS) as any;
    }
  }

  private handleTelosChanged(event: GESemanticEvent): void {
    console.log(`[ModuleManager] Observed Telos change: ${event.payload.newTelos}`);
  }

  private startPurgeCycle(): void {
    setInterval(() => {
      this.purgeCycle();
    }, this.PURGE_CYCLE_INTERVAL_MS);
  }

  private purgeCycle(): void {
    const now = Date.now();
    const purgeThreshold = 10 * 60 * 1000; // 10 minutes of dormancy

    for (const [moduleId, moduleInfo] of this.modules.entries()) {
      if (moduleInfo.state === ModuleState.DEACTIVATED && 
          (now - moduleInfo.lastActivityTimestamp) > purgeThreshold) {
        
        // Check if module is critical for current Telos
        const isCriticalForTelos = this.currentTelos && 
          this.getTelosAlignmentScore(moduleInfo.manifest) > 0.8;
        
        if (!isCriticalForTelos) {
          console.log(`[ModuleManager] Purging dormant module: ${moduleInfo.manifest.name}`);
          this.destroyModule(moduleId);
        }
      }
    }
  }

  public destroy(): void {
    // Clean up all subscriptions
    this.unsubscribeFunctions.forEach(unsubscribe => unsubscribe());
    this.unsubscribeFunctions = [];
    
    // Destroy all modules
    Array.from(this.modules.keys()).forEach(moduleId => {
      this.destroyModule(moduleId);
    });
  }
}