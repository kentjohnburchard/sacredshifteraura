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

  private constructor() {
    this._client = createClient(
      import.meta.env.VITE_SUPABASE_URL || '',
      import.meta.env.VITE_SUPABASE_ANON_KEY || ''
    );
    this.geh = GlobalEventHorizon.getInstance();
  }

  public static getInstance(): SupabaseService {
    if (!SupabaseService.instance) {
      SupabaseService.instance = new SupabaseService();
    }
    return SupabaseService.instance;
  }

  /**
   * Initialize real-time subscriptions
   */
  public async initializeRealtime(userId: string): Promise<void> {
    if (this.realtimeChannel) {
      await this._client.removeChannel(this.realtimeChannel);
    }

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
  }

  /**
   * Sync module states to cloud
   */
  public async syncModuleStates(moduleStates: Record<string, boolean>): Promise<void> {
    try {
      const { data: { user } } = await this._client.auth.getUser();
      if (!user) throw new Error('User not authenticated');

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
      throw error;
    }
  }

  /**
   * Load module states from cloud
   */
  public async loadModuleStates(): Promise<Record<string, boolean>> {
    try {
      const { data: { user } } = await this._client.auth.getUser();
      if (!user) throw new Error('User not authenticated');

      const { data, error } = await this._client
        .from('module_states')
        .select('module_id, enabled')
        .eq('user_id', user.id);

      if (error) {
        console.error('[SupabaseService] Failed to load module states:', error);
        throw error;
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
      throw error;
    }
  }

  /**
   * Save user preference
   */
  public async savePreference(key: string, value: any): Promise<void> {
    try {
      const { data: { user } } = await this._client.auth.getUser();
      if (!user) throw new Error('User not authenticated');

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
        throw error;
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
      throw error;
    }
  }

  /**
   * Load user preference
   */
  public async loadPreference(key: string): Promise<any> {
    try {
      const { data: { user } } = await this._client.auth.getUser();
      if (!user) throw new Error('User not authenticated');

      const { data, error } = await this._client
        .from('user_preferences')
        .select('preference_value')
        .eq('user_id', user.id)
        .eq('preference_key', key)
        .single();

      if (error && error.code !== 'PGRST116') { // PGRST116 = no rows returned
        console.error('[SupabaseService] Failed to load preference:', error);
        throw error;
      }

      return data?.preference_value || null;
    } catch (error) {
      console.error('[SupabaseService] Failed to load preference:', error);
      throw error;
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
      if (!user) throw new Error('User not authenticated');

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
        throw error;
      }

      return data || [];
    } catch (error) {
      console.error('[SupabaseService] Failed to load analytics:', error);
      throw error;
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
  }

  /**
   * Get Supabase client (for advanced usage)
   */
  public get client(): SupabaseClient {
    return this._client;
  }
}