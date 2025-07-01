import { GlobalEventHorizon } from './GlobalEventHorizon';
import { SupabaseService } from './SupabaseService';

/**
 * ModuleToggleService - Enhanced with Cloud Sync
 * Implements unified local + cloud state management
 */
export class ModuleToggleService {
  private static instance: ModuleToggleService;
  private moduleStates: Map<string, boolean> = new Map();
  private geh: GlobalEventHorizon;
  private supabase: SupabaseService;
  private readonly STORAGE_KEY = 'sacred-shifter-module-states';
  private cloudSyncEnabled = false;
  private syncInProgress = false;
  private subscribers: Array<(moduleId: string, enabled: boolean) => void> = [];

  private constructor() {
    this.geh = GlobalEventHorizon.getInstance();
    this.supabase = SupabaseService.getInstance();
    this.setupCloudSyncListeners();
  }

  public static getInstance(): ModuleToggleService {
    if (!ModuleToggleService.instance) {
      ModuleToggleService.instance = new ModuleToggleService();
    }
    return ModuleToggleService.instance;
  }

  /**
   * Initialize from storage (local first, then cloud sync)
   */
  public async initializeFromStorage(): Promise<void> {
    try {
      // 1. Load from localStorage first (immediate)
      await this.loadFromLocalStorage();

      // 2. Try to enable cloud sync
      await this.enableCloudSync();

      // 3. If cloud sync enabled, merge with cloud data
      if (this.cloudSyncEnabled) {
        await this.syncWithCloud();
      }
    } catch (error) {
      console.error('[ModuleToggleService] Failed to initialize from storage:', error);
      this.geh.publish({
        type: 'module:toggle:initializationError',
        sourceId: 'MODULE_TOGGLE_SERVICE',
        timestamp: new Date().toISOString(),
        payload: { error: (error as Error).message },
        metadata: { fallback: 'localStorage_only' },
        essenceLabels: ['module:toggle', 'initialization:error', 'fallback:local']
      });
    }
  }

  /**
   * Enable cloud synchronization
   */
  public async enableCloudSync(): Promise<boolean> {
    try {
      // Check if user is authenticated
      const { data: { user } } = await this.supabase.client.auth.getUser();
      if (!user) {
        console.log('[ModuleToggleService] Cloud sync disabled - user not authenticated');
        return false;
      }

      // Initialize real-time subscriptions
      await this.supabase.initializeRealtime(user.id);
      this.cloudSyncEnabled = true;

      console.log('[ModuleToggleService] Cloud sync enabled for user:', user.id);

      this.geh.publish({
        type: 'module:toggle:cloudSyncEnabled',
        sourceId: 'MODULE_TOGGLE_SERVICE',
        timestamp: new Date().toISOString(),
        payload: { userId: user.id },
        metadata: { realtime: true },
        essenceLabels: ['module:toggle', 'cloud:sync', 'realtime:enabled']
      });

      return true;
    } catch (error) {
      console.error('[ModuleToggleService] Failed to enable cloud sync:', error);
      this.cloudSyncEnabled = false;
      return false;
    }
  }

  /**
   * Sync with cloud (bidirectional merge)
   */
  private async syncWithCloud(): Promise<void> {
    if (!this.cloudSyncEnabled || this.syncInProgress) return;

    this.syncInProgress = true;
    console.log('[ModuleToggleService] Starting cloud sync...');

    try {
      // Load cloud states
      const cloudStates = await this.supabase.loadModuleStates();
      
      // Merge local and cloud states (cloud takes precedence for conflicts)
      const mergedStates = new Map<string, boolean>();
      
      // Start with local states
      this.moduleStates.forEach((enabled, moduleId) => {
        mergedStates.set(moduleId, enabled);
      });
      
      // Override with cloud states
      Object.entries(cloudStates).forEach(([moduleId, enabled]) => {
        mergedStates.set(moduleId, enabled);
      });

      // Check if there are differences
      const hasLocalChanges = Array.from(this.moduleStates.entries()).some(
        ([moduleId, enabled]) => cloudStates[moduleId] !== enabled
      );

      // Update local state
      this.moduleStates = mergedStates;
      this.persistLocalState();

      // If we had local-only changes, sync them to cloud
      if (hasLocalChanges) {
        await this.supabase.syncModuleStates(Object.fromEntries(mergedStates));
      }

      console.log('[ModuleToggleService] Cloud sync completed. Final state:', Object.fromEntries(mergedStates));

      this.geh.publish({
        type: 'module:toggle:cloudSyncComplete',
        sourceId: 'MODULE_TOGGLE_SERVICE',
        timestamp: new Date().toISOString(),
        payload: { 
          mergedCount: mergedStates.size,
          hadLocalChanges: hasLocalChanges 
        },
        metadata: { bidirectional: true },
        essenceLabels: ['module:toggle', 'cloud:sync', 'merge:complete']
      });

    } catch (error) {
      console.error('[ModuleToggleService] Cloud sync failed:', error);
      
      this.geh.publish({
        type: 'module:toggle:cloudSyncError',
        sourceId: 'MODULE_TOGGLE_SERVICE',
        timestamp: new Date().toISOString(),
        payload: { error: (error as Error).message },
        metadata: { fallback: 'local_only' },
        essenceLabels: ['module:toggle', 'cloud:sync', 'error:sync']
      });
    } finally {
      this.syncInProgress = false;
    }
  }

  /**
   * Load from localStorage only
   */
  private async loadFromLocalStorage(): Promise<void> {
    try {
      const stored = localStorage.getItem(this.STORAGE_KEY);
      if (stored) {
        const storedStates = JSON.parse(stored);
        this.moduleStates = new Map(Object.entries(storedStates));
        
        console.log('[ModuleToggleService] Loaded from localStorage:', Object.fromEntries(this.moduleStates));
      }
    } catch (error) {
      console.error('[ModuleToggleService] Failed to load from localStorage:', error);
    }
  }

  /**
   * Initialize default states for known modules
   */
  public initializeDefaultStates(moduleIds: string[]): void {
    let hasChanges = false;
    
    moduleIds.forEach(moduleId => {
      if (!this.moduleStates.has(moduleId)) {
        const defaultEnabled = !moduleId.includes('example') && !moduleId.includes('demo');
        this.moduleStates.set(moduleId, defaultEnabled);
        hasChanges = true;
        
        console.log(`[ModuleToggleService] Set default state for ${moduleId}: ${defaultEnabled}`);
      }
    });

    if (hasChanges) {
      this.persistState();
    }
  }

  /**
   * Check if a module is enabled
   */
  public isEnabled(moduleId: string): boolean {
    return this.moduleStates.get(moduleId) ?? true; // Default to enabled if not set
  }

  /**
   * Toggle a module's enabled state
   */
  public toggleModule(moduleId: string, enabled: boolean): void {
    const previousState = this.moduleStates.get(moduleId);
    this.moduleStates.set(moduleId, enabled);
    
    // Persist locally immediately
    this.persistLocalState();
    
    // Persist to cloud if available (async, non-blocking)
    if (this.cloudSyncEnabled) {
      this.syncToCloud().catch(error => {
        console.warn('[ModuleToggleService] Cloud sync failed for toggle, continuing with local state:', error);
      });
      
      // Track analytics
      this.supabase.trackAnalytics(moduleId, 'module_toggled', {
        enabled,
        previousState,
        source: 'user_action'
      }).catch(error => {
        console.warn('[ModuleToggleService] Analytics tracking failed:', error);
      });
    }

    console.log(`[ModuleToggleService] Toggled module ${moduleId}: ${previousState} -> ${enabled}`);

    // Publish event
    this.geh.publish({
      type: 'module:toggle:changed',
      sourceId: 'MODULE_TOGGLE_SERVICE',
      timestamp: new Date().toISOString(),
      payload: { 
        moduleId, 
        enabled, 
        previousState,
        action: enabled ? 'enable' : 'disable'
      },
      metadata: { 
        moduleName: moduleId.split('.').pop() || moduleId,
        userTriggered: true,
        cloudSyncEnabled: this.cloudSyncEnabled
      },
      essenceLabels: ['module:toggle', 'state:changed', enabled ? 'module:enable' : 'module:disable']
    });

    // Notify subscribers
    this.subscribers.forEach(callback => {
      try {
        callback(moduleId, enabled);
      } catch (error) {
        console.error('[ModuleToggleService] Error in subscriber callback:', error);
      }
    });
  }

  /**
   * Persist state (both local and cloud)
   */
  private persistState(): void {
    this.persistLocalState();
    
    if (this.cloudSyncEnabled) {
      this.syncToCloud().catch(error => {
        console.warn('[ModuleToggleService] Cloud persistence failed, local state preserved:', error);
      });
    }
  }

  /**
   * Persist to localStorage only
   */
  private persistLocalState(): void {
    try {
      const stateObject = Object.fromEntries(this.moduleStates);
      localStorage.setItem(this.STORAGE_KEY, JSON.stringify(stateObject));
    } catch (error) {
      console.error('[ModuleToggleService] Failed to persist to localStorage:', error);
    }
  }

  /**
   * Sync current state to cloud
   */
  private async syncToCloud(): Promise<void> {
    if (!this.cloudSyncEnabled || this.syncInProgress) return;
    
    try {
      const stateObject = Object.fromEntries(this.moduleStates);
      await this.supabase.syncModuleStates(stateObject);
    } catch (error) {
      console.error('[ModuleToggleService] Failed to sync to cloud:', error);
      throw error;
    }
  }

  /**
   * Setup cloud sync event listeners
   */
  private setupCloudSyncListeners(): void {
    // Listen for real-time module state changes from other devices
    this.geh.subscribe('supabase:realtime:moduleStateChanged', (event) => {
      if (event.payload?.record && !this.syncInProgress) {
        const { module_id, enabled } = event.payload.record;
        
        // Update local state from real-time change
        const previousState = this.moduleStates.get(module_id);
        if (previousState !== enabled) {
          this.moduleStates.set(module_id, enabled);
          this.persistLocalState();
          
          console.log(`[ModuleToggleService] Real-time update: ${module_id} -> ${enabled}`);
          
          this.geh.publish({
            type: 'module:toggle:realtimeSync',
            sourceId: 'MODULE_TOGGLE_SERVICE',
            timestamp: new Date().toISOString(),
            payload: { moduleId: module_id, enabled, previousState },
            metadata: { source: 'realtime', fromCloud: true },
            essenceLabels: ['module:toggle', 'realtime:sync', 'cloud:update']
          });
          
          // Notify subscribers
          this.subscribers.forEach(callback => {
            try {
              callback(module_id, enabled);
            } catch (error) {
              console.error('[ModuleToggleService] Error in subscriber callback:', error);
            }
          });
        }
      }
    });
  }

  /**
   * Get all module states
   */
  public getAllModuleStates(): Record<string, boolean> {
    return Object.fromEntries(this.moduleStates);
  }

  /**
   * Subscribe to toggle changes
   */
  public subscribeToChanges(callback: (moduleId: string, enabled: boolean) => void): () => void {
    this.subscribers.push(callback);
    
    return () => {
      const index = this.subscribers.indexOf(callback);
      if (index !== -1) {
        this.subscribers.splice(index, 1);
      }
    };
  }

  /**
   * Get cloud sync status
   */
  public getCloudSyncStatus(): { enabled: boolean; connected: boolean; syncing: boolean } {
    return {
      enabled: this.cloudSyncEnabled,
      connected: this.supabase.isRealtimeConnected(),
      syncing: this.syncInProgress
    };
  }

  /**
   * Force cloud sync
   */
  public async forceCloudSync(): Promise<void> {
    if (!this.cloudSyncEnabled) {
      throw new Error('Cloud sync is not enabled');
    }
    
    await this.syncWithCloud();
  }

  /**
   * Batch toggle multiple modules at once
   */
  public batchToggleModules(updates: Record<string, boolean>): void {
    const changes: Array<{ moduleId: string; enabled: boolean; previousState: boolean | undefined }> = [];
    
    Object.entries(updates).forEach(([moduleId, enabled]) => {
      const previousState = this.moduleStates.get(moduleId);
      if (previousState !== enabled) {
        this.moduleStates.set(moduleId, enabled);
        changes.push({ moduleId, enabled, previousState });
      }
    });

    if (changes.length > 0) {
      this.persistState();
      
      this.geh.publish({
        type: 'module:toggle:batchChanged',
        sourceId: 'MODULE_TOGGLE_SERVICE',
        timestamp: new Date().toISOString(),
        payload: { changes },
        metadata: { changeCount: changes.length, cloudSyncEnabled: this.cloudSyncEnabled },
        essenceLabels: ['module:toggle', 'batch:update', 'state:changed']
      });

      // Notify subscribers for each change
      changes.forEach(({ moduleId, enabled }) => {
        this.subscribers.forEach(callback => {
          try {
            callback(moduleId, enabled);
          } catch (error) {
            console.error('[ModuleToggleService] Error in subscriber callback:', error);
          }
        });

        this.geh.publish({
          type: 'module:toggle:changed',
          sourceId: 'MODULE_TOGGLE_SERVICE',
          timestamp: new Date().toISOString(),
          payload: { moduleId, enabled, action: enabled ? 'enable' : 'disable' },
          metadata: { batchOperation: true },
          essenceLabels: ['module:toggle', 'state:changed', enabled ? 'module:enable' : 'module:disable']
        });
      });
    }
  }

  /**
   * Reset all modules to enabled (emergency recovery)
   */
  public resetAllToEnabled(): void {
    const changes: string[] = [];
    
    this.moduleStates.forEach((enabled, moduleId) => {
      if (!enabled) {
        this.moduleStates.set(moduleId, true);
        changes.push(moduleId);
      }
    });

    if (changes.length > 0) {
      this.persistState();
      
      this.geh.publish({
        type: 'module:toggle:emergencyReset',
        sourceId: 'MODULE_TOGGLE_SERVICE',
        timestamp: new Date().toISOString(),
        payload: { enabledModules: changes },
        metadata: { recoveryOperation: true, cloudSyncEnabled: this.cloudSyncEnabled },
        essenceLabels: ['module:toggle', 'emergency:recovery', 'system:reset']
      });
      
      // Notify subscribers for each change
      changes.forEach(moduleId => {
        this.subscribers.forEach(callback => {
          try {
            callback(moduleId, true);
          } catch (error) {
            console.error('[ModuleToggleService] Error in subscriber callback:', error);
          }
        });
      });
    }
  }

  /**
   * Cleanup connections
   */
  public async cleanup(): Promise<void> {
    await this.supabase.cleanup();
    this.cloudSyncEnabled = false;
  }
}