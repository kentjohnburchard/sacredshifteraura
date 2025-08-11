import { createClient, SupabaseClient, RealtimeChannel } from '@supabase/supabase-js';
import { GlobalEventHorizon } from './GlobalEventHorizon';

export interface ModuleStateRecord {
  id: string;
  user_id: string;
  module_id: string;
  enabled: boolean;
  settings: Record<string, any>;
  created_at: string;
  updated_at: string;
}

export interface UserPreferenceRecord {
  id: string;
  user_id: string;
  preference_key: string;
  preference_value: Record<string, any>;
  created_at: string;
  updated_at: string;
}

export interface AnalyticsRecord {
  id: string;
  user_id: string;
  module_id: string;
  event_type: string;
  event_data: Record<string, any>;
  timestamp: string;
}

/**
 * SupabaseService - Cloud Sync and Real-time Data Management
 * Implements the Principle of Oneness through cloud-unified state
 */
export class SupabaseService {
  private static instance: SupabaseService;
  private _client: SupabaseClient;
  private geh: GlobalEventHorizon;
  private realtimeChannel: RealtimeChannel | null = null;
  private isConnected = false;
  private authStateSubscription: any = null;

  private constructor() {
    this._client = createClient(
      import.meta.env.VITE_SUPABASE_URL || '',
      import.meta.env.VITE_SUPABASE_ANON_KEY || ''
    );
    this.geh = GlobalEventHorizon.getInstance();
    this.setupAuthStateListener();
  }

  public static getInstance(): SupabaseService {
    if (!SupabaseService.instance) {
      SupabaseService.instance = new SupabaseService();
    }
    return SupabaseService.instance;
  }

  /**
   * Set up auth state listener to handle token refresh failures
   */
  private setupAuthStateListener(): void {
    this.authStateSubscription = this._client.auth.onAuthStateChange(async (event, session) => {
      console.log('[SupabaseService] Auth state change:', event);
      
      // Clean up realtime connections on auth failures
      if (event === 'TOKEN_REFRESHED_FAILED' || event === 'SIGNED_OUT' || event === 'USER_DELETED') {
        console.log('[SupabaseService] Cleaning up connections due to auth failure');
        await this.cleanup();
        
        this.geh.publish({
          type: 'supabase:auth:connectionCleaned',
          sourceId: 'SUPABASE_SERVICE',
          timestamp: new Date().toISOString(),
          payload: { event, reason: 'auth_failure' },
          metadata: { authEvent: event },
          essenceLabels: ['supabase:auth', 'connection:cleanup', 'security:session']
        });
      }
      
      // Reinitialize connections on successful sign in
      if (event === 'SIGNED_IN' && session?.user) {
        console.log('[SupabaseService] Reinitializing connections after sign in');
        await this.initializeRealtime(session.user.id);
      }
    });
  }

  /**
   * Initialize real-time subscriptions
   */
  public async initializeRealtime(userId: string): Promise<void> {
    if (this.realtimeChannel) {
      await this._client.removeChannel(this.realtimeChannel);
    }

    try {
      this.realtimeChannel = this._client
        .channel(`user_${userId}`)
        .on(
          'postgres_changes',
          {
            event: '*',
            schema: 'public',
            table: 'module_states',
            filter: `user_id=eq.${userId}`
          },
          (payload) => this.handleModuleStateChange(payload)
        )
        .on(
          'postgres_changes',
          {
            event: '*',
            schema: 'public', 
            table: 'user_preferences',
            filter: `user_id=eq.${userId}`
          },
          (payload) => this.handlePreferenceChange(payload)
        )
        .subscribe((status) => {
          console.log('[SupabaseService] Real-time subscription status:', status);
          this.isConnected = status === 'SUBSCRIBED';
          
          this.geh.publish({
            type: 'supabase:realtime:statusChanged',
            sourceId: 'SUPABASE_SERVICE',
            timestamp: new Date().toISOString(),
            payload: { status, connected: this.isConnected },
            metadata: { userId },
            essenceLabels: ['supabase:realtime', 'connection:status', 'cloud:sync']
          });
        });
    } catch (error) {
      console.error('[SupabaseService] Failed to initialize realtime:', error);
      this.isConnected = false;
    }
  }

  /**
   * Sync module states to cloud with better error handling
   */
  public async syncModuleStates(moduleStates: Record<string, boolean>): Promise<void> {
    try {
      const { data: { user }, error: userError } = await this._client.auth.getUser();
      
      if (userError || !user) {
        console.warn('[SupabaseService] User not authenticated for sync:', userError?.message);
        return; // Don't throw, just skip sync
      }

      console.log('[SupabaseService] Syncing module states to cloud:', moduleStates);

      const upsertPromises = Object.entries(moduleStates).map(([moduleId, enabled]) =>
        this._client
          .from('module_states')
          .upsert({
            user_id: user.id,
            module_id: moduleId,
            enabled,
            updated_at: new Date().toISOString()
          }, {
            onConflict: 'user_id,module_id'
          })
      );

      const results = await Promise.allSettled(upsertPromises);
      
      const failures = results.filter(r => r.status === 'rejected');
      if (failures.length > 0) {
        console.error('[SupabaseService] Some module states failed to sync:', failures);
        
        this.geh.publish({
          type: 'supabase:sync:partialFailure',
          sourceId: 'SUPABASE_SERVICE',
          timestamp: new Date().toISOString(),
          payload: { failures: failures.length, total: results.length },
          metadata: { userId: user.id },
          essenceLabels: ['supabase:sync', 'error:partial', 'cloud:sync']
        });
      } else {
        this.geh.publish({
          type: 'supabase:sync:moduleStatesComplete',
          sourceId: 'SUPABASE_SERVICE',
          timestamp: new Date().toISOString(),
          payload: { syncedCount: Object.keys(moduleStates).length },
          metadata: { userId: user.id },
          essenceLabels: ['supabase:sync', 'success:complete', 'cloud:sync']
        });
      }
    } catch (error) {
      console.error('[SupabaseService] Failed to sync module states:', error);
      // Don't throw - let the app continue working offline
    }
  }

  /**
   * Load module states from cloud with better error handling
   */
  public async loadModuleStates(): Promise<Record<string, boolean>> {
    try {
      const { data: { user }, error: userError } = await this._client.auth.getUser();
      
      if (userError || !user) {
        console.warn('[SupabaseService] User not authenticated for load:', userError?.message);
        return {}; // Return empty state instead of throwing
      }

      const { data, error } = await this._client
        .from('module_states')
        .select('module_id, enabled')
        .eq('user_id', user.id);

      if (error) {
        console.error('[SupabaseService] Failed to load module states:', error);
        return {}; // Return empty state instead of throwing
      }

      const moduleStates: Record<string, boolean> = {};
      data?.forEach(record => {
        moduleStates[record.module_id] = record.enabled;
      });

      console.log('[SupabaseService] Loaded module states from cloud:', moduleStates);

      this.geh.publish({
        type: 'supabase:load:moduleStatesComplete',
        sourceId: 'SUPABASE_SERVICE',
        timestamp: new Date().toISOString(),
        payload: { loadedCount: Object.keys(moduleStates).length },
        metadata: { userId: user.id },
        essenceLabels: ['supabase:load', 'success:complete', 'cloud:sync']
      });

      return moduleStates;
    } catch (error) {
      console.error('[SupabaseService] Failed to load module states:', error);
      return {}; // Return empty state instead of throwing
    }
  }

  /**
   * Save user preference with better error handling
   */
  public async savePreference(key: string, value: any): Promise<void> {
    try {
      const { data: { user }, error: userError } = await this._client.auth.getUser();
      
      if (userError || !user) {
        console.warn('[SupabaseService] User not authenticated for preference save:', userError?.message);
        return; // Don't throw, just skip save
      }

      const { error } = await this._client
        .from('user_preferences')
        .upsert({
          user_id: user.id,
          preference_key: key,
          preference_value: value,
          updated_at: new Date().toISOString()
        }, {
          onConflict: 'user_id,preference_key'
        });

      if (error) {
        console.error('[SupabaseService] Failed to save preference:', error);
        return; // Don't throw, just log error
      }

      this.geh.publish({
        type: 'supabase:preference:saved',
        sourceId: 'SUPABASE_SERVICE',
        timestamp: new Date().toISOString(),
        payload: { key, value },
        metadata: { userId: user.id },
        essenceLabels: ['supabase:preference', 'user:setting', 'cloud:sync']
      });
    } catch (error) {
      console.error('[SupabaseService] Failed to save preference:', error);
      // Don't throw - let the app continue working
    }
  }

  /**
   * Load user preference with better error handling
   */
  public async loadPreference(key: string): Promise<any> {
    try {
      const { data: { user }, error: userError } = await this._client.auth.getUser();
      
      if (userError || !user) {
        console.warn('[SupabaseService] User not authenticated for preference load:', userError?.message);
        return null; // Return null instead of throwing
      }

      const { data, error } = await this._client
        .from('user_preferences')
        .select('preference_value')
        .eq('user_id', user.id)
        .eq('preference_key', key)
        .single();

      if (error && error.code !== 'PGRST116') { // PGRST116 = no rows returned
        console.error('[SupabaseService] Failed to load preference:', error);
        return null; // Return null instead of throwing
      }

      return data?.preference_value || null;
    } catch (error) {
      console.error('[SupabaseService] Failed to load preference:', error);
      return null; // Return null instead of throwing
    }
  }

  /**
   * Track analytics event
   */
  public async trackAnalytics(moduleId: string, eventType: string, eventData: Record<string, any> = {}): Promise<void> {
    try {
      const { data: { user } } = await this._client.auth.getUser();
      if (!user) return; // Don't throw for analytics

      await this._client
        .from('module_analytics')
        .insert({
          user_id: user.id,
          module_id: moduleId,
          event_type: eventType,
          event_data: eventData,
          timestamp: new Date().toISOString()
        });

      this.geh.publish({
        type: 'supabase:analytics:tracked',
        sourceId: 'SUPABASE_SERVICE',
        timestamp: new Date().toISOString(),
        payload: { moduleId, eventType, eventData },
        metadata: { userId: user.id },
        essenceLabels: ['supabase:analytics', 'tracking:event', 'data:collection']
      });
    } catch (error) {
      console.warn('[SupabaseService] Analytics tracking failed (non-critical):', error);
    }
  }

  /**
   * Get analytics data
   */
  public async getAnalytics(moduleId?: string, timeRange?: { start: Date; end: Date }): Promise<AnalyticsRecord[]> {
    try {
      const { data: { user } } = await this._client.auth.getUser();
      if (!user) return []; // Return empty array instead of throwing

      let query = this._client
        .from('module_analytics')
        .select('*')
        .eq('user_id', user.id)
        .order('timestamp', { ascending: false });

      if (moduleId) {
        query = query.eq('module_id', moduleId);
      }

      if (timeRange) {
        query = query
          .gte('timestamp', timeRange.start.toISOString())
          .lte('timestamp', timeRange.end.toISOString());
      }

      const { data, error } = await query;

      if (error) {
        console.error('[SupabaseService] Failed to load analytics:', error);
        return []; // Return empty array instead of throwing
      }

      return data || [];
    } catch (error) {
      console.error('[SupabaseService] Failed to load analytics:', error);
      return []; // Return empty array instead of throwing
    }
  }

  /**
   * Handle real-time module state changes
   */
  private handleModuleStateChange(payload: any): void {
    console.log('[SupabaseService] Real-time module state change:', payload);

    this.geh.publish({
      type: 'supabase:realtime:moduleStateChanged',
      sourceId: 'SUPABASE_SERVICE',
      timestamp: new Date().toISOString(),
      payload: {
        eventType: payload.eventType,
        record: payload.new || payload.old,
        change: payload
      },
      metadata: { realtime: true },
      essenceLabels: ['supabase:realtime', 'module:state', 'cloud:sync']
    });
  }

  /**
   * Handle real-time preference changes
   */
  private handlePreferenceChange(payload: any): void {
    console.log('[SupabaseService] Real-time preference change:', payload);

    this.geh.publish({
      type: 'supabase:realtime:preferenceChanged',
      sourceId: 'SUPABASE_SERVICE',
      timestamp: new Date().toISOString(),
      payload: {
        eventType: payload.eventType,
        record: payload.new || payload.old,
        change: payload
      },
      metadata: { realtime: true },
      essenceLabels: ['supabase:realtime', 'user:preference', 'cloud:sync']
    });
  }

  /**
   * Get connection status
   */
  public isRealtimeConnected(): boolean {
    return this.isConnected;
  }

  /**
   * Cleanup connections
   */
  public async cleanup(): Promise<void> {
    if (this.realtimeChannel) {
      await this._client.removeChannel(this.realtimeChannel);
      this.realtimeChannel = null;
    }
    this.isConnected = false;
    
    console.log('[SupabaseService] Connections cleaned up');
  }

  /**
   * Cleanup on service destruction
   */
  public destroy(): void {
    if (this.authStateSubscription) {
      this.authStateSubscription.subscription?.unsubscribe();
      this.authStateSubscription = null;
    }
    this.cleanup();
  }

  /**
   * Get Supabase client (for advanced usage)
   */
  public get client(): SupabaseClient {
    return this._client;
  }
}