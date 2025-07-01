import { GESemanticEvent, AkashicQuery } from '../types';

/**
 * GlobalEventHorizon - The Unified Information Field
 * Implements the Principle of Oneness through universal event broadcasting
 */
export class GlobalEventHorizon {
  private static instance: GlobalEventHorizon;
  private subscribers: Map<string, ((event: GESemanticEvent) => void)[]> = new Map();
  private akashicRecord: GESemanticEvent[] = [];
  private eventCounter = 0;

  private constructor() {}

  public static getInstance(): GlobalEventHorizon {
    if (!GlobalEventHorizon.instance) {
      GlobalEventHorizon.instance = new GlobalEventHorizon();
    }
    return GlobalEventHorizon.instance;
  }

  /**
   * Publish an event to the Unified Information Field
   */
  public publish(event: GESemanticEvent): void {
    // Add to Akashic Record (immutable history)
    this.akashicRecord.push(event);
    this.eventCounter++;

    // Notify all subscribers matching the event type
    const typeSubscribers = this.subscribers.get(event.type) || [];
    const wildcardSubscribers = this.subscribers.get('*') || [];
    
    // Handle pattern matching (e.g., "module:*:error")
    const patternSubscribers: ((event: GESemanticEvent) => void)[] = [];
    for (const [pattern, subscribers] of this.subscribers.entries()) {
      if (pattern.includes('*') && this.matchesPattern(event.type, pattern)) {
        patternSubscribers.push(...subscribers);
      }
    }

    [...typeSubscribers, ...wildcardSubscribers, ...patternSubscribers].forEach(callback => {
      try {
        callback(event);
      } catch (error) {
        console.error('Error in event subscriber:', error);
      }
    });
  }

  /**
   * Subscribe to events on specific frequencies (types)
   */
  public subscribe(eventType: string, callback: (event: GESemanticEvent) => void): () => void {
    if (!this.subscribers.has(eventType)) {
      this.subscribers.set(eventType, []);
    }
    this.subscribers.get(eventType)!.push(callback);

    // Return unsubscribe function
    return () => {
      const subscribers = this.subscribers.get(eventType);
      if (subscribers) {
        const index = subscribers.indexOf(callback);
        if (index > -1) {
          subscribers.splice(index, 1);
        }
      }
    };
  }

  /**
   * Query the Akashic Record for historical patterns
   */
  public queryAkashicRecord(query: AkashicQuery = {}): GESemanticEvent[] {
    let results = [...this.akashicRecord];

    // Filter by event types
    if (query.types && query.types.length > 0) {
      results = results.filter(event => query.types!.includes(event.type));
    }

    // Filter by source IDs
    if (query.sourceIds && query.sourceIds.length > 0) {
      results = results.filter(event => query.sourceIds!.includes(event.sourceId));
    }

    // Filter by time range
    if (query.timeRange) {
      const startTime = new Date(query.timeRange.start).getTime();
      const endTime = new Date(query.timeRange.end).getTime();
      results = results.filter(event => {
        const eventTime = new Date(event.timestamp).getTime();
        return eventTime >= startTime && eventTime <= endTime;
      });
    }

    // Filter by essence labels
    if (query.essenceLabels && query.essenceLabels.length > 0) {
      results = results.filter(event => {
        return query.essenceLabels!.some(label => event.essenceLabels.includes(label));
      });
    }

    // Apply limit
    if (query.limit && query.limit > 0) {
      results = results.slice(-query.limit); // Get most recent
    }

    return results.sort((a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime());
  }

  /**
   * Get real-time statistics about the information field
   */
  public getFieldStatistics() {
    const now = Date.now();
    const oneHourAgo = now - (60 * 60 * 1000);
    const recentEvents = this.akashicRecord.filter(event => 
      new Date(event.timestamp).getTime() > oneHourAgo
    );

    const eventTypes = new Map<string, number>();
    const sourceCounts = new Map<string, number>();
    const labelCounts = new Map<string, number>();

    recentEvents.forEach(event => {
      // Count event types
      eventTypes.set(event.type, (eventTypes.get(event.type) || 0) + 1);
      
      // Count sources
      sourceCounts.set(event.sourceId, (sourceCounts.get(event.sourceId) || 0) + 1);
      
      // Count labels
      event.essenceLabels.forEach(label => {
        labelCounts.set(label, (labelCounts.get(label) || 0) + 1);
      });
    });

    return {
      totalEvents: this.akashicRecord.length,
      recentEvents: recentEvents.length,
      activeSubscribers: Array.from(this.subscribers.values()).reduce((sum, subs) => sum + subs.length, 0),
      topEventTypes: Array.from(eventTypes.entries()).sort((a, b) => b[1] - a[1]).slice(0, 5),
      topSources: Array.from(sourceCounts.entries()).sort((a, b) => b[1] - a[1]).slice(0, 5),
      topLabels: Array.from(labelCounts.entries()).sort((a, b) => b[1] - a[1]).slice(0, 10)
    };
  }

  /**
   * Clear the Akashic Record (use with caution - breaks causal chains)
   */
  public clearAkashicRecord(): void {
    this.akashicRecord = [];
    this.eventCounter = 0;
  }

  private matchesPattern(eventType: string, pattern: string): boolean {
    const regex = new RegExp('^' + pattern.replace(/\*/g, '.*') + '$');
    return regex.test(eventType);
  }

  /**
   * Get the complete Akashic Record (read-only)
   */
  public getAkashicRecord(): readonly GESemanticEvent[] {
    return this.akashicRecord;
  }
}