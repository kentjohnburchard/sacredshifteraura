import { GESemanticEvent } from '../types';
import { GlobalEventHorizon } from './GlobalEventHorizon';
import semver from 'semver';

/**
 * EventBus - Enhanced Event Pattern Router for Universal Coherence
 * 
 * Provides type-safe, pattern-matched event publication and subscription
 * while maintaining the Principle of Oneness through the GlobalEventHorizon.
 */
export class EventBus {
  private static instance: EventBus;
  private geh: GlobalEventHorizon;
  private version = '1.0.0';

  private constructor() {
    this.geh = GlobalEventHorizon.getInstance();
  }

  public static getInstance(): EventBus {
    if (!EventBus.instance) {
      EventBus.instance = new EventBus();
    }
    return EventBus.instance;
  }

  /**
   * Publish an event with improved type safety and error handling
   */
  public publish<T extends Record<string, any>>(
    type: string,
    sourceId: string,
    payload: T,
    essenceLabels: string[],
    metadata: Record<string, any> = {}
  ): void {
    try {
      // Validate event structure
      if (!type || !sourceId) {
        console.error('[EventBus] Invalid event parameters', { type, sourceId });
        return;
      }

      // Create event object
      const event: GESemanticEvent = {
        type,
        sourceId,
        timestamp: new Date().toISOString(),
        payload,
        metadata,
        essenceLabels
      };

      // Forward to Global Event Horizon
      this.geh.publish(event);
    } catch (error) {
      console.error('[EventBus] Failed to publish event:', error);
    }
  }

  /**
   * Subscribe to events with improved type handling
   * Returns unsubscribe function
   */
  public subscribe<T extends Record<string, any>>(
    pattern: string,
    callback: (event: GESemanticEvent & { payload: T }) => void
  ): () => void {
    return this.geh.subscribe(pattern, callback as any);
  }

  /**
   * Subscribe to events with version constraints
   * Only receives events that match semver requirements
   */
  public subscribeWithVersion<T extends Record<string, any>>(
    pattern: string,
    versionConstraint: string,
    callback: (event: GESemanticEvent & { payload: T }) => void
  ): () => void {
    return this.geh.subscribe(pattern, (event: GESemanticEvent) => {
      const eventVersion = event.metadata?.version || '0.0.0';
      if (semver.satisfies(eventVersion, versionConstraint)) {
        callback(event as any);
      }
    });
  }

  /**
   * Request-Response pattern implementation
   * Handles one-time responses to specific requests
   */
  public async request<T extends Record<string, any>, R extends Record<string, any>>(
    type: string,
    sourceId: string,
    payload: T,
    essenceLabels: string[],
    options: { timeout?: number; metadata?: Record<string, any> } = {}
  ): Promise<R> {
    return new Promise((resolve, reject) => {
      // Generate unique request ID
      const requestId = `req_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
      
      // Set up timeout
      const timeout = options.timeout || 5000;
      const timeoutId = setTimeout(() => {
        unsubscribe();
        reject(new Error(`Request timeout for ${type} after ${timeout}ms`));
      }, timeout);
      
      // Subscribe to response
      const responsePattern = `${type}:response:${requestId}`;
      const unsubscribe = this.geh.subscribe(responsePattern, (event) => {
        clearTimeout(timeoutId);
        unsubscribe();
        resolve(event.payload as R);
      });
      
      // Publish request
      this.publish(type, sourceId, { ...payload, requestId }, essenceLabels, {
        ...options.metadata,
        requestId,
        isRequest: true
      });
    });
  }

  /**
   * Handle requests and send responses
   * Sets up a request handler that automatically sends responses
   */
  public handleRequests<T extends Record<string, any>, R extends Record<string, any>>(
    pattern: string,
    handler: (payload: T, metadata: Record<string, any>) => Promise<R> | R
  ): () => void {
    return this.geh.subscribe(pattern, async (event: GESemanticEvent) => {
      // Only process requests
      if (!event.metadata?.isRequest) return;
      
      const requestId = event.metadata.requestId;
      if (!requestId) return;
      
      try {
        // Call handler with request payload
        const result = await handler(event.payload as T, event.metadata);
        
        // Publish response
        this.publish(
          `${event.type}:response:${requestId}`,
          event.sourceId,
          result,
          [...event.essenceLabels, 'response:success'],
          { ...event.metadata, isResponse: true }
        );
      } catch (error) {
        // Publish error response
        this.publish(
          `${event.type}:response:${requestId}`,
          event.sourceId,
          { error: (error as Error).message },
          [...event.essenceLabels, 'response:error'],
          { ...event.metadata, isResponse: true, isError: true }
        );
      }
    });
  }

  /**
   * Get system event statistics
   */
  public getEventStats(): Record<string, any> {
    return {
      systemVersion: this.version,
      fieldStats: this.geh.getFieldStatistics()
    };
  }
}