import { createClient, SupabaseClient, RealtimeChannel } from '@supabase/supabase-js';
import { GlobalEventHorizon } from './GlobalEventHorizon';
import { IntentionResonanceUtils } from '../utils/IntentionResonanceUtils'; // CORRECTED: Changed to relative path

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

// New interface for SharedIntentionRecord
export interface SharedIntentionRecord {
  id?: string; // Optional for creation, as Supabase generates it
  user_id: string;
  title: string; // Added title field
  description?: string;
  essence_labels?: string[];
  chakra_focus?: string;
  frequency_hz?: number;
  target_outcome?: string;
  current_resonance_score?: number;
  status?: string;
  created_at?: string; // Optional for creation, as Supabase sets it
  updated_at?: string; // Optional for creation, as Supabase sets it, but can be explicitly set on update
  is_public?: boolean; // Added is_public field
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
  private subscriptionChannels: Map<string, RealtimeChannel> = new Map();
  private retryTimers: Map<string, ReturnType<typeof setTimeout>> = new Map(); // Corrected type
  private maxRetries = 5;
  private retryDelayMs = 1000; // Start with 1 second, will increase exponentially

  private constructor() {
    const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || '';
    const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || '';

    if (!supabaseUrl || !supabaseAnonKey) {
      console.error('Missing Supabase environment variables. Make sure VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY are set.');
    }

    this._client = createClient(supabaseUrl, supabaseAnonKey, {
      auth: {
        persistSession: true,
        autoRefreshToken: true,
        storageKey: 'sacred_shifter_auth'
      },
      global: {
        headers: {
          'x-application-name': 'SacredShifter',
          'x-application-version': '1.0.0'
        }
      },
      realtime: {
        params: {
          eventsPerSecond: 10
        }
      }
    });

    this.geh = GlobalEventHorizon.getInstance();
    this.setupConnectionListener();
  }

  public static getInstance(): SupabaseService {
    if (!SupabaseService.instance) {
      SupabaseService.instance = new SupabaseService();
    }
    return SupabaseService.instance;
  }

  /**
   * Initialize real-time subscriptions for user-specific data
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
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'sacred_tasks',
          filter: `user_id=eq.${userId}`
        },
        (payload) => this.handleTableChange('sacred_tasks', payload)
      )
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'sacred_blueprints',
          filter: `user_id=eq.${userId}`
        },
        (payload) => this.handleTableChange('sacred_blueprints', payload)
      )
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'shared_intentions', // NEW: Add shared_intentions table
          filter: `user_id=eq.${userId}`
        },
        (payload) => this.handleTableChange('shared_intentions', payload)
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
   * Subscribe to table changes for a specific user
   */
  public async subscribeToTable(
    table: string,
    userId: string,
    callback: (payload: any) => void
  ): Promise<() => void> {
    const channelKey = `${table}_${userId}`;

    // Close existing channel if any
    if (this.subscriptionChannels.has(channelKey)) {
      await this._client.removeChannel(this.subscriptionChannels.get(channelKey)!);
    }

    const channel = this._client
      .channel(channelKey)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: table,
          filter: `user_id=eq.${userId}`
        },
        callback
      )
      .subscribe((status) => {
        console.log(`[SupabaseService] Subscription to ${table} status:`, status);

        if (status === 'SUBSCRIBED') {
          this.geh.publish({
            type: 'supabase:subscription:active',
            sourceId: 'SUPABASE_SERVICE',
            timestamp: new Date().toISOString(),
            payload: { table, status },
            metadata: { userId },
            essenceLabels: ['supabase:subscription', 'table:listening', 'realtime:active']
          });
        }
      });

    this.subscriptionChannels.set(channelKey, channel);

    // Return unsubscribe function
    return async () => {
      if (this.subscriptionChannels.has(channelKey)) {
        await this._client.removeChannel(this.subscriptionChannels.get(channelKey)!);
        this.subscriptionChannels.delete(channelKey);
      }
    };
  }

  /**
   * Handle generic table change events
   */
  private handleTableChange(table: string, payload: any): void {
    this.geh.publish({
      type: `supabase:${table}:changed`,
      sourceId: 'SUPABASE_SERVICE',
      timestamp: new Date().toISOString(),
      payload: {
        eventType: payload.eventType,
        record: payload.new || payload.old,
        change: payload
      },
      metadata: { realtime: true, table },
      essenceLabels: ['supabase:realtime', 'data:updated', 'cloud:sync']
    });
  }

  /**
   * Sync module states to cloud with retry logic
   */
  public async syncModuleStates(moduleStates: Record<string, boolean>): Promise<void> {
    try {
      const { data: { user } = {} } = await this._client.auth.getUser(); // Destructure with default empty object
      if (!user) throw new Error('User not authenticated');

      console.log('[SupabaseService] Syncing module states to cloud:', moduleStates);

      const upsertPromises = Object.entries(moduleStates).map(([moduleId, enabled]) =>
        this._client // Removed the `retryOperation` wrapper here as it's handled internally by `upsert`
          .from('module_states')
          .upsert({
            user_id: user.id,
            module_id: moduleId,
            enabled,
            updated_at: new Date().toISOString()
          }, {
            onConflict: 'user_id,module_id'
          })
      ); // Removed the `retryOperation` call

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
   * Retry a database operation with exponential backoff
   */
  private async retryOperation<T>(
    operation: () => Promise<{ data: T | null; error: any }>, // Modified to return data and error
    maxRetries = this.maxRetries
  ): Promise<T> {
    let retryCount = 0;
    let lastError: Error | null = null;

    while (retryCount < maxRetries) {
      try {
        const { data, error } = await operation();
        if (error) {
          throw error;
        }
        return data as T; // Cast data to T
      } catch (error) {
        lastError = error as Error;
        retryCount++;
        console.warn(`[SupabaseService] Retry attempt ${retryCount}/${maxRetries} for operation. Error:`, (error as Error).message);

        // If this is the last retry, throw the error
        if (retryCount >= maxRetries) {
          throw error;
        }

        // Wait with exponential backoff before retrying
        const delay = this.retryDelayMs * Math.pow(2, retryCount - 1);
        await new Promise(resolve => setTimeout(resolve, delay)); // Use setTimeout directly
      }
    }

    // This should never happen, but TypeScript needs it
    throw lastError || new Error('Unknown error during retry');
  }

  /**
   * Load module states from cloud with caching
   */
  public async loadModuleStates(): Promise<Record<string, boolean>> {
    try {
      const { data: { user } } = await this._client.auth.getUser();
      if (!user) throw new Error('User not authenticated');

      // First try to get from localStorage cache
      const cachedStates = this.getCachedModuleStates();
      if (cachedStates) {
        console.log('[SupabaseService] Using cached module states');
      }

      // Fetch from Supabase
      const { data, error } = await this._client
        .from('module_states')
        .select('module_id, enabled')
        .eq('user_id', user.id);

      if (error) {
        console.error('[SupabaseService] Failed to load module states:', error);
        // Return cached data if available, otherwise throw
        if (cachedStates) return cachedStates;
        throw error;
      }

      const moduleStates: Record<string, boolean> = {};
      data?.forEach(record => {
        moduleStates[record.module_id] = record.enabled;
      });

      console.log('[SupabaseService] Loaded module states from cloud:', moduleStates);

      // Update cache
      this.cacheModuleStates(moduleStates);

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
      // Try to return cached data if available
      const cachedStates = this.getCachedModuleStates();
      if (cachedStates) return cachedStates;
      throw error;
    }
  }

  /**
   * Cache module states in localStorage
   */
  private cacheModuleStates(states: Record<string, boolean>): void {
    try {
      localStorage.setItem('sacred_shifter_module_states_cache', JSON.stringify({
        states,
        timestamp: new Date().toISOString()
      }));
    } catch (error) {
      console.warn('[SupabaseService] Failed to cache module states:', error);
    }
  }

  /**
   * Get cached module states from localStorage
   */
  private getCachedModuleStates(): Record<string, boolean> | null {
    try {
      const cache = localStorage.getItem('sacred_shifter_module_states_cache');
      if (!cache) return null;

      const { states, timestamp } = JSON.parse(cache);

      // Cache is valid for 1 day
      const cacheDate = new Date(timestamp);
      const now = new Date();
      const oneDayInMs = 24 * 60 * 60 * 1000;

      if ((now.getTime() - cacheDate.getTime()) > oneDayInMs) {
        return null; // Cache expired
      }

      return states;
    } catch (error) {
      console.warn('[SupabaseService] Failed to get cached module states:', error);
      return null;
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
   * Setup connection status listener
   */
  private setupConnectionListener(): void {
    // Set up periodic connection check
    setInterval(() => {
      this._client.auth.getSession().then(({ data, error }) => {
        if (error || !data.session) {
          if (this.isConnected) {
            this.isConnected = false;
            this.geh.publish({
              type: 'supabase:connection:lost',
              sourceId: 'SUPABASE_SERVICE',
              timestamp: new Date().toISOString(),
              payload: { reason: error?.message || 'Session expired' },
              metadata: {},
              essenceLabels: ['supabase:connection', 'status:disconnected', 'cloud:sync']
            });
          }
        } else {
          if (!this.isConnected) {
            this.isConnected = true;
            this.geh.publish({
              type: 'supabase:connection:restored',
              sourceId: 'SUPABASE_SERVICE',
              timestamp: new Date().toISOString(),
              payload: { sessionExpiresAt: data.session?.expires_at },
              metadata: {},
              essenceLabels: ['supabase:connection', 'status:connected', 'cloud:sync']
            });
          }
        }
      });
    }, 30000); // Check every 30 seconds
  }

  /**
   * Save user preference with retry logic
   */
  public async savePreference(key: string, value: any): Promise<void> {
    try {
      const { data: { user } } = await this._client.auth.getUser();
      if (!user) throw new Error('User not authenticated');

      await this.retryOperation(() =>
        this._client
          .from('user_preferences')
          .upsert({
            user_id: user.id,
            preference_key: key,
            preference_value: value,
            updated_at: new Date().toISOString()
          }, {
            onConflict: 'user_id,preference_key'
          })
      );

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
   * Track analytics event with retry logic
   */
  public async trackAnalytics(moduleId: string, eventType: string, eventData: Record<string, any> = {}): Promise<void> {
    try {
      const { data: { user } } = await this._client.auth.getUser();
      if (!user) return; // Don't throw for analytics

      await this.retryOperation(() =>
        this._client
          .from('module_analytics')
          .insert({
            user_id: user.id,
            module_id: moduleId,
            event_type: eventType,
            event_data: eventData,
            timestamp: new Date().toISOString()
          }), 3 // Only retry 3 times for analytics
      );

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
   * Get connection status
   */
  public isRealtimeConnected(): boolean {
    return this.isConnected;
  }

  /**
   * Cleanup all connections and subscriptions
   */
  public async cleanup(): Promise<void> {
    // Remove all real-time subscriptions
    if (this.realtimeChannel) {
      await this._client.removeChannel(this.realtimeChannel);
      this.realtimeChannel = null;
    }

    // Remove all table subscriptions
    for (const channel of this.subscriptionChannels.values()) {
      await this._client.removeChannel(channel);
    }
    this.subscriptionChannels.clear();

    // Clear any pending retry timers
    for (const timer of this.retryTimers.values()) {
      clearTimeout(timer);
    }
    this.retryTimers.clear();

    this.isConnected = false;
  }

  /**
   * Get Supabase client (for advanced usage)
   */
  public get client(): SupabaseClient {
    return this._client;
  }

  /**
   * Create a caching wrapper for a Supabase query
   */
  public createCachingQuery<T>(
    queryFn: () => Promise<{ data: T | null; error: Error | null }>,
    cacheKey: string,
    ttlMinutes: number = 30
  ): () => Promise<T> {
    return async () => {
      // Try to get from cache first
      try {
        const cached = localStorage.getItem(`sacred_shifter_cache:${cacheKey}`);
        if (cached) {
          const { data, timestamp } = JSON.parse(cached);
          const cacheDate = new Date(timestamp);
          const expirationDate = new Date(cacheDate.getTime() + ttlMinutes * 60 * 1000);

          // If cache is still valid, return it
          if (new Date() < expirationDate) {
            return data as T;
          }
        }
      } catch (error) {
        console.warn(`[SupabaseService] Cache retrieval failed for ${cacheKey}:`, error);
      }

      // If no valid cache, execute query
      const { data, error } = await queryFn();

      if (error) {
        throw error;
      }

      if (data) {
        // Cache the result
        try {
          localStorage.setItem(`sacred_shifter_cache:${cacheKey}`, JSON.stringify({
            data,
            timestamp: new Date().toISOString()
          }));
        } catch (error) {
          console.warn(`[SupabaseService] Cache storage failed for ${cacheKey}:`, error);
        }

        return data;
      }

      throw new Error('No data returned from query');
    };
  }

  /**
   * New methods for 'shared_intentions' table
   */

  /**
   * Creates a new shared intention.
   * @param intention The intention object to insert (user_id and title are required).
   * @returns The newly created SharedIntentionRecord.
   */
  public async createSharedIntention(intention: Omit<SharedIntentionRecord, 'id' | 'created_at' | 'updated_at'>): Promise<SharedIntentionRecord> {
    try {
      const { data: { user } } = await this._client.auth.getUser();
      if (!user) throw new Error('User not authenticated');

      const intentionWithUserId = { ...intention, user_id: user.id };

      const { data, error } = await this.retryOperation(() =>
        this._client
          .from('shared_intentions')
          .insert(intentionWithUserId)
          .select()
          .single()
      );

      if (error) {
        console.error('[SupabaseService] Failed to create shared intention:', error);
        throw error;
      }

      this.geh.publish({
        type: 'supabase:sharedIntention:created',
        sourceId: 'SUPABASE_SERVICE',
        timestamp: new Date().toISOString(),
        payload: data,
        metadata: { userId: user.id },
        essenceLabels: ['supabase:crud', 'shared:intention', 'create:success']
      });

      return data;
    } catch (error) {
      console.error('[SupabaseService] Error in createSharedIntention:', error);
      throw error;
    }
  }

  /**
   * Fetches a single shared intention by its ID.
   * @param id The ID of the shared intention to fetch.
   * @returns The SharedIntentionRecord if found, null otherwise.
   */
  public async getSharedIntention(id: string): Promise<SharedIntentionRecord | null> {
    try {
      const { data: { user } } = await this._client.auth.getUser();
      if (!user) throw new Error('User not authenticated');

      const { data, error } = await this.retryOperation(() =>
        this._client
          .from('shared_intentions')
          .select('*')
          .eq('id', id)
          .single()
      );

      if (error && error.code !== 'PGRST116') { // PGRST116 means "No rows found"
        console.error('[SupabaseService] Failed to get shared intention:', error);
        throw error;
      }

      if (data) {
        this.geh.publish({
          type: 'supabase:sharedIntention:retrieved',
          sourceId: 'SUPABASE_SERVICE',
          timestamp: new Date().toISOString(),
          payload: data,
          metadata: { userId: user.id, intentionId: id },
          essenceLabels: ['supabase:crud', 'shared:intention', 'read:success']
        });
      }

      return data;
    } catch (error) {
      console.error('[SupabaseService] Error in getSharedIntention:', error);
      throw error;
    }
  }

  /**
   * Retrieves all shared intentions contributed by the current user.
   * @returns An array of SharedIntentionRecord.
   */
  public async getUserSharedIntentions(): Promise<SharedIntentionRecord[]> {
    try {
      const { data: { user } } = await this._client.auth.getUser();
      if (!user) throw new Error('User not authenticated');

      const { data, error } = await this.retryOperation(() =>
        this._client
          .from('shared_intentions')
          .select('*')
          .eq('user_id', user.id)
          .order('created_at', { ascending: false })
      );

      if (error) {
        console.error('[SupabaseService] Failed to get user shared intentions:', error);
        throw error;
      }

      this.geh.publish({
        type: 'supabase:sharedIntention:userRetrieved',
        sourceId: 'SUPABASE_SERVICE',
        timestamp: new Date().toISOString(),
        payload: { count: data?.length || 0 },
        metadata: { userId: user.id },
        essenceLabels: ['supabase:crud', 'shared:intention', 'read:all:success']
      });

      return data || [];
    } catch (error) {
      console.error('[SupabaseService] Error in getUserSharedIntentions:', error);
      throw error;
    }
  }

  /**
   * Updates an existing shared intention.
   * @param id The ID of the intention to update.
   * @param updates The partial intention object with fields to update.
   * @returns The updated SharedIntentionRecord.
   */
  public async updateSharedIntention(id: string, updates: Partial<Omit<SharedIntentionRecord, 'id' | 'user_id' | 'created_at'>>): Promise<SharedIntentionRecord> {
    try {
      const { data: { user } } = await this._client.auth.getUser();
      if (!user) throw new Error('User not authenticated');

      // Add updated_at timestamp
      const updatePayload = { ...updates, updated_at: new Date().toISOString() };

      const { data, error } = await this.retryOperation(() =>
        this._client
          .from('shared_intentions')
          .update(updatePayload)
          .eq('id', id)
          .eq('user_id', user.id) // Ensure only the owner can update
          .select()
          .single()
      );

      if (error) {
        console.error('[SupabaseService] Failed to update shared intention:', error);
        throw error;
      }
      if (!data) {
        throw new Error('Shared intention not found or not authorized to update.');
      }

      this.geh.publish({
        type: 'supabase:sharedIntention:updated',
        sourceId: 'SUPABASE_SERVICE',
        timestamp: new Date().toISOString(),
        payload: data,
        metadata: { userId: user.id, intentionId: id },
        essenceLabels: ['supabase:crud', 'shared:intention', 'update:success']
      });

      return data;
    } catch (error) {
      console.error('[SupabaseService] Error in updateSharedIntention:', error);
      throw error;
    }
  }

  /**
   * Deletes a shared intention by its ID.
   * @param id The ID of the intention to delete.
   * @returns True if deletion was successful, false otherwise.
   */
  public async deleteSharedIntention(id: string): Promise<boolean> {
    try {
      const { data: { user } } = await this._client.auth.getUser();
      if (!user) throw new Error('User not authenticated');

      const { error, count } = await this.retryOperation(() =>
        this._client
          .from('shared_intentions')
          .delete()
          .eq('id', id)
          .eq('user_id', user.id) // Ensure only the owner can delete
          .select() // Use select to get count of deleted rows
          .single()
      );

      if (error) {
        console.error('[SupabaseService] Failed to delete shared intention:', error);
        throw error;
      }

      const success = !!count; // If count is 1, it means a row was deleted

      this.geh.publish({
        type: 'supabase:sharedIntention:deleted',
        sourceId: 'SUPABASE_SERVICE',
        timestamp: new Date().toISOString(),
        payload: { intentionId: id, success },
        metadata: { userId: user.id },
        essenceLabels: ['supabase:crud', 'shared:intention', 'delete:success']
      });

      return success;
    } catch (error) {
      console.error('[SupabaseService] Error in deleteSharedIntention:', error);
      throw error;
    }
  }

  /**
   * Creates a connection between two shared intentions and calculates their resonance score.
   * @param intention1Id The ID of the first intention.
   * @param intention2Id The ID of the second intention.
   * @returns The newly created intention connection record.
   */
  public async createIntentionConnection(intention1Id: string, intention2Id: string) {
    // Ensure user is authenticated before proceeding
    const { data: { user } } = await this._client.auth.getUser();
    if (!user) throw new Error('User not authenticated');

    // Fetch both intentions concurrently
    const [intention1, intention2] = await Promise.all([
      this.getSharedIntention(intention1Id),
      this.getSharedIntention(intention2Id)
    ]);

    // Check if both intentions exist
    if (!intention1) {
      throw new Error(`Intention with ID ${intention1Id} not found.`);
    }
    if (!intention2) {
      throw new Error(`Intention with ID ${intention2Id} not found.`);
    }

    // Calculate resonance score using the utility function
    const score = IntentionResonanceUtils.calculateResonanceScore(intention1, intention2);

    // Insert the new intention connection into the 'intention_connections' table
    const { data, error } = await this._client
      .from('intention_connections')
      .insert({
        intention_id_1: intention1Id,
        intention_id_2: intention2Id,
        connection_type: 'user_defined', // Assuming a fixed connection type for now
        resonance_score: score
      })
      .select()
      .single();

    if (error) {
      console.error('[SupabaseService] Failed to create intention connection:', error);
      throw error;
    }

    // Optionally update current_resonance_score on the shared_intentions.
    // This part is crucial for keeping intention records up-to-date with their latest connection scores.
    await Promise.all([
      this.updateSharedIntention(intention1Id, { current_resonance_score: score }),
      this.updateSharedIntention(intention2Id, { current_resonance_score: score })
    ]);

    // Publish event to GlobalEventHorizon for real-time updates and logging
    this.geh.publish({
      type: 'supabase:intentionConnection:created',
      sourceId: 'SUPABASE_SERVICE',
      timestamp: new Date().toISOString(),
      payload: data,
      metadata: { userId: user.id, intention1Id, intention2Id, resonanceScore: score },
      essenceLabels: ['supabase:crud', 'intention:connection', 'create:success']
    });

    return data;
  }
}
