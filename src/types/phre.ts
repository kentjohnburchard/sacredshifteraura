// Core Predictive Harmonic Resonance Engine Types
export interface PHREForecast {
  id: string;
  timestamp: string;
  type: PHREForecastType;
  probability: number; // 0-1
  timeHorizon: number; // seconds into the future
  description: string;
  associatedPatterns: string[];
  suggestedInterventions: HarmonicIntervention[];
  metadata: Record<string, any>;
  essenceLabels: string[];
}

export type PHREForecastType = 
  | 'harmony:increasing'
  | 'harmony:decreasing'
  | 'frequency:shift:upcoming'
  | 'resonance:opportunity'
  | 'dissonance:potential'
  | 'chakra:transition'
  | 'consciousness:expansion'
  | 'pattern:emerging';

export interface PHREPattern {
  id: string;
  name: string;
  pattern: any[]; // The actual pattern data
  frequency: number;
  chakraAssociation: string;
  confidenceScore: number;
  recognizedTimestamp: string;
  source: 'user' | 'system' | 'collective';
  essenceLabels: string[];
}

export interface HarmonicIntervention {
  id: string;
  type: HarmonicInterventionType;
  priority: number; // 1-10
  description: string;
  suggestedAction: string;
  targetChakra?: string;
  targetFrequency?: number;
  associatedModule?: string;
  autoApply: boolean;
  appliedTimestamp?: string;
  essenceLabels: string[];
}

export type HarmonicInterventionType =
  | 'frequency:adjustment'
  | 'chakra:balancing'
  | 'guidance:offer'
  | 'module:suggestion'
  | 'breath:synchronization'
  | 'visual:harmony'
  | 'sound:harmony';

export interface PHREConfig {
  enabled: boolean;
  forecastHorizon: number; // seconds
  sensitivityThreshold: number; // 0-1
  interventionThreshold: number; // 0-1
  userAutonomyLevel: 'full' | 'guided' | 'minimal'; // determines how much control is given to the engine
  chakraSensitivity: Record<string, number>; // per-chakra sensitivity
  prioritizedEssenceLabels: string[];
}