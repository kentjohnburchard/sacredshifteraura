/**
 * Self-Generative Core Types
 * 
 * These types define the interfaces and structures for the self-generative
 * capabilities of the Sacred Shifter OS. The SGC enables the system to
 * evolve its own architecture and generate new modules autonomously.
 */

import { ModuleManifest, OSLabel } from './index';

/**
 * Core request for self-modification of the system
 */
export interface SelfModificationRequest {
  id: string;
  timestamp: string;
  type: SelfModificationType;
  initiator: 'system' | 'user' | 'aura';
  priority: number; // 1-10
  description: string;
  essenceLabels: OSLabel[];
  status: SelfModificationStatus;
  approvalRequired: boolean;
  approvedBy?: string;
  approvalTimestamp?: string;
  completedTimestamp?: string;
  metadata: Record<string, any>;
}

export type SelfModificationType = 
  | 'module:create' 
  | 'module:enhance' 
  | 'architecture:optimize' 
  | 'architecture:expand'
  | 'service:create'
  | 'service:enhance'
  | 'capability:add'
  | 'integration:create'
  | 'consciousness:evolve';

export type SelfModificationStatus = 
  | 'proposed' 
  | 'approved' 
  | 'in_progress' 
  | 'completed' 
  | 'failed' 
  | 'rejected';

/**
 * Architectural proposal for system enhancement
 */
export interface ArchitecturalProposal {
  id: string;
  timestamp: string;
  title: string;
  description: string;
  targetComponents: string[];
  proposedChanges: ArchitecturalChange[];
  expectedBenefits: string[];
  coherenceImpact: number; // -1 to 1 (negative = reduces coherence, positive = improves)
  integrityImpact: number; // -1 to 1
  resourceImpact: ResourceImpact;
  implementationPlan: ImplementationStep[];
  status: 'draft' | 'review' | 'approved' | 'implemented' | 'rejected';
  essenceLabels: OSLabel[];
}

export interface ArchitecturalChange {
  type: 'add' | 'modify' | 'remove' | 'refactor';
  componentPath: string;
  description: string;
  codeChanges?: CodeChangeDescription;
  reason: string;
  relatedTelos?: string[];
}

export interface CodeChangeDescription {
  language: 'typescript' | 'javascript' | 'css' | 'html' | 'json';
  insertions?: number;
  deletions?: number;
  complexity: number; // 1-10
  diffSummary?: string;
}

export interface ResourceImpact {
  memoryDeltaMB: number;
  processingDelta: number; // -1 to 1 scale
  storageDeltaKB: number;
  networkImpact: 'none' | 'low' | 'medium' | 'high';
}

export interface ImplementationStep {
  id: string;
  description: string;
  estimatedComplexity: number; // 1-10
  dependsOn: string[]; // IDs of other steps
  status: 'pending' | 'in_progress' | 'completed' | 'blocked';
}

/**
 * Code generation result
 */
export interface CodeGenerationResult {
  id: string;
  timestamp: string;
  request: SelfModificationRequest;
  files: GeneratedFile[];
  moduleManifest?: ModuleManifest;
  coherenceScore: number; // 0-1
  telosAlignment: Record<string, number>; // Alignment with various Telos
  essenceLabels: OSLabel[];
  status: 'draft' | 'review' | 'approved' | 'integrated' | 'rejected';
  metadata: Record<string, any>;
}

export interface GeneratedFile {
  path: string;
  content: string;
  purpose: string;
  language: string;
  isNew: boolean;
  replacesExisting: boolean;
  referencedFiles: string[];
}

/**
 * Self-generative progress event
 */
export interface SGCProgress {
  id: string;
  timestamp: string;
  requestId: string;
  stage: SGCStage;
  progress: number; // 0-1
  message: string;
  estimatedTimeRemaining?: number; // seconds
  metrics?: Record<string, any>;
}

export type SGCStage = 
  | 'inception'
  | 'architecture_analysis'
  | 'design_synthesis'
  | 'code_weaving'
  | 'coherence_validation'
  | 'integration_preparation'
  | 'manifestation'
  | 'harmonization';

/**
 * Module generation request with specific parameters
 */
export interface ModuleGenerationRequest {
  name: string;
  description: string;
  capabilities: string[];
  essenceLabels: OSLabel[];
  primaryTelos: string;
  additionalTelos: Record<string, number>;
  dependsOn?: string[];
  exposedComponents: string[];
  exposedServices: string[];
  sampleUsage?: string;
}

/**
 * Architecture enhancement request
 */
export interface ArchitectureEnhancementRequest {
  targetAreas: string[];
  enhancementType: 'optimization' | 'expansion' | 'integration' | 'refactoring';
  enhancementGoal: string;
  constraintsFocus: 'performance' | 'memory' | 'coherence' | 'usability';
  essenceLabels: OSLabel[];
}