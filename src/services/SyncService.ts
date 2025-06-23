import { v4 as uuidv4 } from 'uuid';
import localForage from 'localforage';
import { GlobalEventHorizon } from './GlobalEventHorizon';
import { SupabaseService } from './SupabaseService';
import { addSeconds, isPast } from 'date-fns';

interface SyncOperation {
  id: string;
  table: string;
  type: 'INSERT' | 'UPDATE' | 'DELETE';
  record: any;
  timestamp: string;
  retryCount: number;
  userId: string;
  status: 'pending' | 'in_progress' | 'completed' | 'failed';
  error?: string;
  localOnly?: boolean;
}

/**
 * SyncService - Manages data synchronization between local storage and Supabase
 * Provides offline-first capabilities and reliable sync operations
 */
export class SyncService {
  private static instance: SyncService;
  private geh: GlobalEventHorizon;
  private supabaseService: SupabaseService;
  private syncQueue: SyncOperation[] = [];
  private isProcessingQueue = false;
  private syncInterval: number | null = null;
  private isOnline = navigator.onLine;
  private userId: string | null = null;
  private localForage = localForage.createInstance({ name: 'sacred_shifter_sync' });
  private lastSyncTimestamp: Record<string, string> = {};
  
  private constructor() {
    this.geh = GlobalEventHorizon.getInstance();
    this.supabaseService = SupabaseService.getInstance();
    this.setupEventListeners();
  }
  
  public static getInstance(): SyncService {
    if (!SyncService.instance) {
      SyncService.instance = new SyncService();
    }
    return SyncService.instance;
  }
  
  /**
   * Initialize sync service for a specific user
   */
  public async initialize(userId: string): Promise<void> {
    this.userId = userId;
    
    // Load any pending operations from local storage
    await this.loadSyncQueue();
    
    // Start sync process
    this.startSyncProcess();
    
    // Load last sync timestamps
    await this.loadLastSyncTimestamps();
    
    this.geh.publish({
      type: 'sync:service:initialized',
      sourceId: 'SYNC_SERVICE',
      timestamp: new Date().toISOString(),
      payload: { 
        userId,
        pendingOperations: this.syncQueue.length,
        isOnline: this.isOnline
      },
      metadata: {},
      essenceLabels: ['sync:initialized', 'user:active', 'data:integrity']
    });
  }
  
  /**
   * Enqueue a sync operation
   */
  public async enqueueOperation(
    table: string,
    type: 'INSERT' | 'UPDATE' | 'DELETE',
    record: any,
    localOnly = false
  ): Promise<string> {
    if (!this.userId) {
      throw new Error('SyncService not initialized for a user');
    }
    
    const operation: SyncOperation = {
      id: uuidv4(),
      table,
      type,
      record,
      timestamp: new Date().toISOString(),
      retryCount: 0,
      userId: this.userId,
      status: 'pending',
      localOnly
    };
    
    this.syncQueue.push(operation);
    await this.saveSyncQueue();
    
    // If online and not already processing, start processing the queue
    if (this.isOnline && !this.isProcessingQueue) {
      this.processQueue();
    }
    
    this.geh.publish({
      type: 'sync:operation:enqueued',
      sourceId: 'SYNC_SERVICE',
      timestamp: new Date().toISOString(),
      payload: { 
        operationId: operation.id,
        table,
        type,
        queueLength: this.syncQueue.length
      },
      metadata: { localOnly },
      essenceLabels: ['sync:operation', 'data:change', 'queue:updated']
    });
    
    return operation.id;
  }
  
  /**
   * Process the sync queue
   */
  private async processQueue(): Promise<void> {
    if (this.isProcessingQueue || this.syncQueue.length === 0 || !this.isOnline) {
      return;
    }
    
    this.isProcessingQueue = true;
    
    try {
      // Sort operations by timestamp (oldest first)
      this.syncQueue.sort((a, b) => 
        new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime()
      );
      
      // Process operations in sequence
      for (let i = 0; i < this.syncQueue.length; i++) {
        const operation = this.syncQueue[i];
        
        // Skip completed operations and local-only operations
        if (operation.status === 'completed' || operation.localOnly) {
          continue;
        }
        
        // Skip operations already in progress
        if (operation.status === 'in_progress') {
          continue;
        }
        
        // Process operation
        operation.status = 'in_progress';
        await this.saveSyncQueue();
        
        try {
          await this.processSingleOperation(operation);
          
          // Operation successful
          operation.status = 'completed';
          
          this.geh.publish({
            type: 'sync:operation:completed',
            sourceId: 'SYNC_SERVICE',
            timestamp: new Date().toISOString(),
            payload: { 
              operationId: operation.id,
              table: operation.table,
              type: operation.type
            },
            metadata: {},
            essenceLabels: ['sync:operation', 'data:synchronized', 'operation:success']
          });
        } catch (error) {
          // Operation failed
          operation.status = 'failed';
          operation.error = (error as Error).message;
          operation.retryCount++;
          
          this.geh.publish({
            type: 'sync:operation:failed',
            sourceId: 'SYNC_SERVICE',
            timestamp: new Date().toISOString(),
            payload: { 
              operationId: operation.id,
              table: operation.table,
              type: operation.type,
              error: (error as Error).message,
              retryCount: operation.retryCount
            },
            metadata: {},
            essenceLabels: ['sync:operation', 'error:sync', 'operation:failed']
          });
          
          // Log sync error
          await this.logSyncError(operation, error as Error);
        }
        
        await this.saveSyncQueue();
      }
      
      // Clean up completed operations
      this.cleanupCompletedOperations();
      
      // Update last sync timestamp
      this.updateLastSyncTimestamp();
      
    } finally {
      this.isProcessingQueue = false;
      
      // If there are still pending operations, continue processing
      if (this.syncQueue.some(op => op.status === 'pending' || op.status === 'failed')) {
        window.setTimeout.bind(window)(() => this.processQueue(), 1000);
      }
    }
  }
  
  /**
   * Process a single sync operation
   */
  private async processSingleOperation(operation: SyncOperation): Promise<void> {
    const { table, type, record } = operation;
    const client = this.supabaseService.client;
    
    switch (type) {
      case 'INSERT':
        await client.from(table).insert(record);
        break;
        
      case 'UPDATE':
        if (!record.id) {
          throw new Error(`No ID provided for UPDATE operation on ${table}`);
        }
        await client.from(table).update(record).eq('id', record.id);
        break;
        
      case 'DELETE':
        if (!record.id) {
          throw new Error(`No ID provided for DELETE operation on ${table}`);
        }
        await client.from(table).delete().eq('id', record.id);
        break;
        
      default:
        throw new Error(`Unknown operation type: ${type}`);
    }
  }
  
  /**
   * Log sync error to Supabase for analytics
   */
  private async logSyncError(operation: SyncOperation, error: Error): Promise<void> {
    try {
      const client = this.supabaseService.client;
      
      await client.from('sync_logs').insert({
        user_id: this.userId,
        action: `${operation.type}:${operation.table}`,
        data_type: operation.table,
        status: 'failed',
        details: error.message
      });
    } catch (logError) {
      console.error('[SyncService] Failed to log sync error:', logError);
    }
  }
  
  /**
   * Clean up completed operations
   */
  private cleanupCompletedOperations(): void {
    // Remove completed operations
    this.syncQueue = this.syncQueue.filter(op => op.status !== 'completed');
    
    // For failed operations, requeue if retry count is less than 5
    this.syncQueue.forEach(op => {
      if (op.status === 'failed' && op.retryCount < 5) {
        op.status = 'pending';
      }
    });
    
    this.saveSyncQueue();
  }
  
  /**
   * Start the sync process
   */
  private startSyncProcess(): void {
    // Process queue immediately if there are pending operations
    if (this.syncQueue.some(op => op.status === 'pending')) {
      this.processQueue();
    }
    
    // Set up interval to check for pending operations
    if (this.syncInterval === null) {
      this.syncInterval = window.setInterval.bind(window)(() => {
        if (this.isOnline && !this.isProcessingQueue) {
          this.processQueue();
        }
      }, 30000); // Check every 30 seconds
    }
  }
  
  /**
   * Stop the sync process
   */
  public stopSyncProcess(): void {
    if (this.syncInterval !== null) {
      clearInterval(this.syncInterval);
      this.syncInterval = null;
    }
  }
  
  /**
   * Save sync queue to local storage
   */
  private async saveSyncQueue(): Promise<void> {
    await this.localForage.setItem('syncQueue', this.syncQueue);
  }
  
  /**
   * Load sync queue from local storage
   */
  private async loadSyncQueue(): Promise<void> {
    try {
      const queue = await this.localForage.getItem<SyncOperation[]>('syncQueue');
      if (queue) {
        this.syncQueue = queue.filter(op => op.userId === this.userId);
      }
    } catch (error) {
      console.error('[SyncService] Failed to load sync queue:', error);
      this.syncQueue = [];
    }
  }
  
  /**
   * Update last sync timestamp
   */
  private updateLastSyncTimestamp(): void {
    const now = new Date().toISOString();
    
    // Get unique tables from completed operations
    const tables = [...new Set(
      this.syncQueue
        .filter(op => op.status === 'completed')
        .map(op => op.table)
    )];
    
    // Update timestamps
    tables.forEach(table => {
      this.lastSyncTimestamp[table] = now;
    });
    
    // Save timestamps to local storage
    this.localForage.setItem('lastSyncTimestamp', this.lastSyncTimestamp);
  }
  
  /**
   * Load last sync timestamps from local storage
   */
  private async loadLastSyncTimestamps(): Promise<void> {
    try {
      const timestamps = await this.localForage.getItem<Record<string, string>>('lastSyncTimestamp');
      if (timestamps) {
        this.lastSyncTimestamp = timestamps;
      }
    } catch (error) {
      console.error('[SyncService] Failed to load last sync timestamps:', error);
      this.lastSyncTimestamp = {};
    }
  }
  
  /**
   * Get last sync timestamp for a table
   */
  public getLastSyncTimestamp(table: string): string | null {
    return this.lastSyncTimestamp[table] || null;
  }
  
  /**
   * Setup event listeners
   */
  private setupEventListeners(): void {
    // Listen for online/offline events
    window.addEventListener('online', () => {
      this.isOnline = true;
      
      this.geh.publish({
        type: 'sync:network:online',
        sourceId: 'SYNC_SERVICE',
        timestamp: new Date().toISOString(),
        payload: { pendingOperations: this.syncQueue.length },
        metadata: {},
        essenceLabels: ['sync:network', 'status:online', 'connectivity:restored']
      });
      
      // Process queue when coming back online
      if (!this.isProcessingQueue && this.syncQueue.length > 0) {
        this.processQueue();
      }
    });
    
    window.addEventListener('offline', () => {
      this.isOnline = false;
      
      this.geh.publish({
        type: 'sync:network:offline',
        sourceId: 'SYNC_SERVICE',
        timestamp: new Date().toISOString(),
        payload: { pendingOperations: this.syncQueue.length },
        metadata: {},
        essenceLabels: ['sync:network', 'status:offline', 'connectivity:lost']
      });
    });
    
    // Listen for user change events
    this.geh.subscribe('auth:user:*', (event) => {
      if (event.type === 'auth:user:signedOut') {
        // Stop sync process and clear queue when user signs out
        this.stopSyncProcess();
        this.syncQueue = [];
        this.saveSyncQueue();
        this.userId = null;
        
      } else if (event.type === 'auth:user:signedIn' && event.payload?.user?.id) {
        // Initialize sync service for new user
        this.initialize(event.payload.user.id);
      }
    });
  }
  
  /**
   * Full sync for a specific table
   */
  public async fullSync(table: string): Promise<void> {
    if (!this.userId) {
      throw new Error('SyncService not initialized for a user');
    }
    
    const client = this.supabaseService.client;
    const lastSync = this.getLastSyncTimestamp(table);
    
    try {
      // Fetch all changes since last sync
      let query = client.from(table).select('*').eq('user_id', this.userId);
      
      if (lastSync) {
        query = query.gt('updated_at', lastSync);
      }
      
      const { data, error } = await query;
      
      if (error) throw error;
      
      if (data && data.length > 0) {
        // Store data in local storage
        await this.localForage.setItem(`table:${table}`, data);
        
        // Update last sync timestamp
        this.lastSyncTimestamp[table] = new Date().toISOString();
        await this.localForage.setItem('lastSyncTimestamp', this.lastSyncTimestamp);
        
        this.geh.publish({
          type: 'sync:fullSync:completed',
          sourceId: 'SYNC_SERVICE',
          timestamp: new Date().toISOString(),
          payload: { 
            table,
            recordCount: data.length,
            lastSync: this.lastSyncTimestamp[table]
          },
          metadata: {},
          essenceLabels: ['sync:fullSync', 'data:refreshed', 'sync:complete']
        });
      }
    } catch (error) {
      console.error(`[SyncService] Full sync failed for table ${table}:`, error);
      
      this.geh.publish({
        type: 'sync:fullSync:failed',
        sourceId: 'SYNC_SERVICE',
        timestamp: new Date().toISOString(),
        payload: { 
          table,
          error: (error as Error).message
        },
        metadata: {},
        essenceLabels: ['sync:fullSync', 'error:sync', 'operation:failed']
      });
      
      throw error;
    }
  }
  
  /**
   * Get sync status
   */
  public getSyncStatus(): {
    pendingCount: number;
    failedCount: number;
    isOnline: boolean;
    isProcessing: boolean;
    lastSyncTimestamps: Record<string, string>;
  } {
    return {
      pendingCount: this.syncQueue.filter(op => op.status === 'pending').length,
      failedCount: this.syncQueue.filter(op => op.status === 'failed').length,
      isOnline: this.isOnline,
      isProcessing: this.isProcessingQueue,
      lastSyncTimestamps: { ...this.lastSyncTimestamp }
    };
  }
  
  /**
   * Force sync (process queue immediately)
   */
  public async forceSync(): Promise<void> {
    if (this.isOnline && !this.isProcessingQueue && this.syncQueue.length > 0) {
      await this.processQueue();
    }
  }
}