// Core Type Definitions for Metaphysical OS
// Based on the Cognitive Theoretic Model of the Universe (CTMU)

export type OSLabel = string;

export interface GESemanticEvent {
  type: string;
  sourceId: string;
  payload: any;
  timestamp: string;
  correlationId?: string;
  causationId?: string;
  metadata?: Record<string, any>;
  essenceLabels: OSLabel[];
}

export interface ModuleManifest {
  id: string;
  name: string;
  version: string;
  description?: string;
  remoteEntryUrl?: string;
  capabilities: string[];
  exposedItems: Record<string, string>;
  telosAlignment: Record<string, string | number>;
  integrityScore: number;
  resourceFootprintMB: number;
  essenceLabels: OSLabel[];
}

export interface OSTelos {
  id: string;
  description: string;
  priority: number;
  essenceLabels: OSLabel[];
}

export interface OSUserState {
  id: string;
  name: string;
  currentContext: string;
  essenceLabels: OSLabel[];
}

export interface IModule {
  getManifest(): ModuleManifest;
  initialize(): Promise<void>;
  activate(): Promise<void>;
  deactivate(): Promise<void>;
  destroy(): Promise<void>;
  ping(): boolean;
  getExposedItems(): Record<string, any>;
}

// Enhanced Module State Enum
export enum ModuleState {
  REGISTERED = 'registered',
  LOADED = 'loaded', 
  ACTIVE = 'active',
  DEACTIVATED = 'deactivated',
  DISABLED = 'disabled',
  ERROR = 'error'
}

export interface ModuleInfo {
  manifest: ModuleManifest;
  instance?: IModule;
  state: ModuleState;
  lastActivityTimestamp: number;
  idleTimerId?: number;
  loadTimestamp?: number;
}

export interface ModuleErrorSummary {
  moduleId: string;
  moduleName: string;
  errorCount: number;
  lastErrorTimestamp: string;
  currentIntegrityScore: number;
  status: 'stable' | 'degraded' | 'critical';
}

export interface ModuleActivitySummary {
  moduleId: string;
  moduleName: string;
  heartbeatCount: number;
  userActionCount: number;
  dataOperationCount: number;
  lastActivityTimestamp: string;
  currentState: 'active' | 'dormant' | 'idle';
}

export interface AkashicQuery {
  types?: string[];
  sourceIds?: string[];
  timeRange?: {
    start: string;
    end: string;
  };
  essenceLabels?: OSLabel[];
  limit?: number;
}

// Re-export PHRE types
export * from './phre';

// Export Self-Generative Core types
export * from './sgc';
// src/types/index.ts

export * from './aura'; // Add this line
