import { GESemanticEvent } from '../types';
import { SystemSoulState, EgoPattern } from '../contexts/RSIContext';
import { PHREPattern } from '../types/phre';
import { GlobalEventHorizon } from './GlobalEventHorizon';
import { EventBus } from './EventBus';
import { v4 as uuidv4 } from 'uuid';

/**
 * PHREPatternSynth - Pattern Recognition and Synthesis Service
 * 
 * Analyzes event patterns and soul states to recognize meaningful patterns
 * that can be used for forecasting and resonance optimization.
 */
export class PHREPatternSynth {
  private static instance: PHREPatternSynth;
  private eventBus: EventBus;
  private geh: GlobalEventHorizon;
  
  // Pattern history for time series analysis
  private patternHistory: Map<string, any[]> = new Map();
  private knownPatterns: Map<string, PatternTemplate> = new Map();
  
  private constructor() {
    this.eventBus = EventBus.getInstance();
    this.geh = GlobalEventHorizon.getInstance();
    this.initializePatternTemplates();
  }
  
  public static getInstance(): PHREPatternSynth {
    if (!PHREPatternSynth.instance) {
      PHREPatternSynth.instance = new PHREPatternSynth();
    }
    return PHREPatternSynth.instance;
  }
  
  /**
   * Analyze patterns from recent events and soul state
   */
  public analyzePatterns(
    events: GESemanticEvent[],
    soulState: SystemSoulState
  ): PHREPattern[] {
    const recognizedPatterns: PHREPattern[] = [];
    
    // Update pattern history
    this.updatePatternHistory(events, soulState);
    
    // Apply each pattern recognition algorithm
    for (const [patternName, template] of this.knownPatterns.entries()) {
      const match = this.matchPattern(template, events, soulState);
      
      if (match.isMatch && match.confidenceScore > 0.5) {
        recognizedPatterns.push({
          id: `pattern_${patternName}_${Date.now()}`,
          name: template.name,
          pattern: match.matchedSequence,
          frequency: this.calculatePatternFrequency(match.matchedSequence, template),
          chakraAssociation: this.determinePatternChakra(template, soulState),
          confidenceScore: match.confidenceScore,
          recognizedTimestamp: new Date().toISOString(),
          source: template.source,
          essenceLabels: template.essenceLabels
        });
      }
    }
    
    // If we have ego patterns in soul state, add those as patterns too
    if (soulState.activeEgoPatterns.length > 0) {
      soulState.activeEgoPatterns.forEach(egoPattern => {
        // Create a pattern from ego pattern
        const egoPatternTemplate = this.createEgoPatternTemplate(egoPattern);
        
        recognizedPatterns.push({
          id: `pattern_ego_${egoPattern}_${Date.now()}`,
          name: `Ego Pattern: ${this.formatEgoPatternName(egoPattern)}`,
          pattern: [],  // No sequence needed for ego patterns
          frequency: this.getEgoPatternFrequency(egoPattern),
          chakraAssociation: this.getEgoPatternChakra(egoPattern),
          confidenceScore: 0.85, // Ego patterns are directly detected, so high confidence
          recognizedTimestamp: new Date().toISOString(),
          source: 'user',
          essenceLabels: [
            'ego:pattern', 
            `pattern:${egoPattern}`, 
            'consciousness:limitation',
            'growth:opportunity'
          ]
        });
      });
    }
    
    // Add the current chakra state as a pattern
    recognizedPatterns.push({
      id: `pattern_chakra_${soulState.dominantChakra}_${Date.now()}`,
      name: `${this.formatChakraName(soulState.dominantChakra)} Chakra Dominance`,
      pattern: [],
      frequency: soulState.dominantFrequency,
      chakraAssociation: soulState.dominantChakra,
      confidenceScore: 0.95,
      recognizedTimestamp: new Date().toISOString(),
      source: 'system',
      essenceLabels: [
        'chakra:dominance', 
        `chakra:${soulState.dominantChakra}`, 
        'energy:focus', 
        'consciousness:state'
      ]
    });
    
    // Add the coherence level as a pattern
    const coherenceLevel = soulState.coherenceLevel;
    if (coherenceLevel > 80) {
      recognizedPatterns.push({
        id: `pattern_coherence_high_${Date.now()}`,
        name: 'High Coherence State',
        pattern: [],
        frequency: soulState.dominantFrequency,
        chakraAssociation: soulState.dominantChakra,
        confidenceScore: coherenceLevel / 100,
        recognizedTimestamp: new Date().toISOString(),
        source: 'system',
        essenceLabels: [
          'coherence:high', 
          'harmony:established', 
          'resonance:optimal', 
          'consciousness:clarity'
        ]
      });
    } else if (coherenceLevel < 40) {
      recognizedPatterns.push({
        id: `pattern_coherence_low_${Date.now()}`,
        name: 'Low Coherence State',
        pattern: [],
        frequency: soulState.dominantFrequency,
        chakraAssociation: soulState.dominantChakra,
        confidenceScore: (100 - coherenceLevel) / 100,
        recognizedTimestamp: new Date().toISOString(),
        source: 'system',
        essenceLabels: [
          'coherence:low', 
          'dissonance:present', 
          'harmony:seeking', 
          'consciousness:clouded'
        ]
      });
    }
    
    return recognizedPatterns;
  }
  
  /**
   * Initialize known pattern templates
   */
  private initializePatternTemplates(): void {
    // Breathing pattern
    this.knownPatterns.set('breathing_rhythm', {
      name: 'Breathing Rhythm Pattern',
      type: 'temporal',
      source: 'user',
      condition: (events) => events.some(e => e.type.includes('breath')),
      matchFunction: this.matchBreathingPattern.bind(this),
      frequency: 0.1, // Hz, typical breathing frequency
      chakraMapping: {
        'default': 'heart'
      },
      essenceLabels: ['breath:rhythm', 'presence:grounding', 'consciousness:embodied']
    });
    
    // Chakra transition pattern
    this.knownPatterns.set('chakra_transition', {
      name: 'Chakra Transition Pattern',
      type: 'state',
      source: 'system',
      condition: (_, soulState, lastSoulState) => 
        lastSoulState && soulState.dominantChakra !== lastSoulState.dominantChakra,
      matchFunction: this.matchChakraTransition.bind(this),
      frequency: 0.05, // Hz, slow transition frequency
      chakraMapping: {
        'default': 'third-eye' // Third eye perceives transitions
      },
      essenceLabels: ['chakra:transition', 'energy:shifting', 'consciousness:evolving']
    });
    
    // Module switching pattern
    this.knownPatterns.set('module_switching', {
      name: 'Module Exploration Pattern',
      type: 'behavioral',
      source: 'user',
      condition: (events) => events.some(e => e.type.includes('navigation')),
      matchFunction: this.matchModuleSwitching.bind(this),
      frequency: 0.2, // Hz, typical interaction frequency
      chakraMapping: {
        'default': 'third-eye',
        'frequent': 'solar',
        'searching': 'crown'
      },
      essenceLabels: ['navigation:pattern', 'exploration:consciousness', 'seeking:wisdom']
    });
    
    // Deep focus pattern
    this.knownPatterns.set('deep_focus', {
      name: 'Deep Focus Pattern',
      type: 'behavioral',
      source: 'user',
      condition: (events) => events.length > 10,
      matchFunction: this.matchDeepFocus.bind(this),
      frequency: 0.3, // Hz, focused attention
      chakraMapping: {
        'default': 'third-eye'
      },
      essenceLabels: ['focus:deep', 'attention:sustained', 'consciousness:directed']
    });
    
    // Harmonic resonance pattern
    this.knownPatterns.set('harmonic_resonance', {
      name: 'Harmonic Resonance Pattern',
      type: 'energetic',
      source: 'system',
      condition: (_, soulState) => soulState.coherenceLevel > 70,
      matchFunction: this.matchHarmonicResonance.bind(this),
      frequency: 0.15, // Hz, gentle harmonic pulse
      chakraMapping: {
        'default': 'heart',
        'high': 'crown'
      },
      essenceLabels: ['resonance:harmonic', 'coherence:high', 'field:unified', 'consciousness:expanded']
    });
  }
  
  /**
   * Update pattern history with new events and state
   */
  private updatePatternHistory(
    events: GESemanticEvent[],
    soulState: SystemSoulState
  ): void {
    // Update event history
    const eventHistory = this.patternHistory.get('events') || [];
    this.patternHistory.set('events', [...eventHistory, ...events].slice(-1000));
    
    // Update soul state history
    const stateHistory = this.patternHistory.get('soulState') || [];
    this.patternHistory.set('soulState', [...stateHistory, soulState].slice(-100));
  }
  
  /**
   * Match a pattern template against events and state
   */
  private matchPattern(
    template: PatternTemplate,
    events: GESemanticEvent[],
    soulState: SystemSoulState
  ): PatternMatchResult {
    // Check condition first
    const lastSoulState = (this.patternHistory.get('soulState') || []).slice(-1)[0];
    if (!template.condition(events, soulState, lastSoulState)) {
      return { isMatch: false, confidenceScore: 0, matchedSequence: [] };
    }
    
    // Apply match function
    return template.matchFunction(events, soulState, this.patternHistory);
  }
  
  /**
   * Calculate pattern frequency
   */
  private calculatePatternFrequency(
    matchedSequence: any[],
    template: PatternTemplate
  ): number {
    // Use template base frequency by default
    let frequency = template.frequency;
    
    // Adjust based on sequence if applicable
    if (matchedSequence.length > 0 && template.type === 'temporal') {
      // For temporal patterns, we can calculate frequency from timestamps
      try {
        const timestamps = matchedSequence
          .filter(item => item.timestamp)
          .map(item => new Date(item.timestamp).getTime());
        
        if (timestamps.length > 1) {
          // Calculate average time between events
          const intervals = [];
          for (let i = 1; i < timestamps.length; i++) {
            intervals.push(timestamps[i] - timestamps[i - 1]);
          }
          
          const avgInterval = intervals.reduce((sum, val) => sum + val, 0) / intervals.length;
          const calculatedFreq = 1000 / avgInterval; // Convert ms to Hz
          
          // Blend with template frequency for stability
          frequency = (calculatedFreq + template.frequency) / 2;
        }
      } catch (error) {
        console.warn('[PHREPatternSynth] Error calculating frequency:', error);
      }
    }
    
    return frequency;
  }
  
  /**
   * Determine chakra association for pattern
   */
  private determinePatternChakra(
    template: PatternTemplate, 
    soulState: SystemSoulState
  ): string {
    const mapping = template.chakraMapping;
    
    // Determine which key to use in the mapping
    let key: string = 'default';
    
    // For chakra transition pattern
    if (template.name === 'Chakra Transition Pattern') {
      key = 'default';
    }
    
    // For module switching pattern
    else if (template.name === 'Module Exploration Pattern') {
      // Analyze switching frequency
      const eventHistory = this.patternHistory.get('events') || [];
      const navigationEvents = eventHistory
        .filter(e => e.type.includes('navigation'))
        .slice(-10);
      
      if (navigationEvents.length > 5) {
        key = 'frequent';
      } else if (navigationEvents.some(e => e.type.includes('search'))) {
        key = 'searching';
      }
    }
    
    // For harmonic resonance pattern
    else if (template.name === 'Harmonic Resonance Pattern') {
      key = soulState.coherenceLevel > 85 ? 'high' : 'default';
    }
    
    // Use the key to look up chakra, or fallback to dominantChakra
    return mapping[key] || soulState.dominantChakra;
  }
  
  // Pattern matching functions
  
  /**
   * Match breathing pattern
   */
  private matchBreathingPattern(
    events: GESemanticEvent[],
    soulState: SystemSoulState,
    history: Map<string, any[]>
  ): PatternMatchResult {
    const breathEvents = events.filter(e => e.type.includes('breath'));
    
    if (breathEvents.length < 3) {
      return { isMatch: false, confidenceScore: 0, matchedSequence: [] };
    }
    
    // Check for rhythmic pattern
    const intervals: number[] = [];
    for (let i = 1; i < breathEvents.length; i++) {
      const t1 = new Date(breathEvents[i-1].timestamp).getTime();
      const t2 = new Date(breathEvents[i].timestamp).getTime();
      intervals.push(t2 - t1);
    }
    
    // Calculate average interval and deviation
    const avgInterval = intervals.reduce((sum, val) => sum + val, 0) / intervals.length;
    const deviation = Math.sqrt(
      intervals.reduce((sum, val) => sum + Math.pow(val - avgInterval, 2), 0) / intervals.length
    );
    
    // Calculate regularity (lower deviation = more regular)
    const regularity = Math.max(0, 1 - (deviation / avgInterval));
    
    // Pattern matches if regularity is high enough
    const isMatch = regularity > 0.6;
    
    return {
      isMatch,
      confidenceScore: regularity,
      matchedSequence: breathEvents
    };
  }
  
  /**
   * Match chakra transition
   */
  private matchChakraTransition(
    events: GESemanticEvent[],
    soulState: SystemSoulState,
    history: Map<string, any[]>
  ): PatternMatchResult {
    const stateHistory = history.get('soulState') || [];
    
    if (stateHistory.length < 2) {
      return { isMatch: false, confidenceScore: 0, matchedSequence: [] };
    }
    
    const lastState = stateHistory[stateHistory.length - 2]; // Previous state
    
    // Check if chakra changed
    const chakraChanged = lastState && 
                         lastState.dominantChakra !== soulState.dominantChakra;
    
    // Calculate confidence based on how much time has passed and coherence
    let confidenceScore = 0;
    if (chakraChanged) {
      // Higher score for higher coherence level
      confidenceScore = soulState.coherenceLevel / 100;
    }
    
    return {
      isMatch: chakraChanged,
      confidenceScore,
      matchedSequence: [lastState, soulState]
    };
  }
  
  /**
   * Match module switching pattern
   */
  private matchModuleSwitching(
    events: GESemanticEvent[],
    soulState: SystemSoulState,
    history: Map<string, any[]>
  ): PatternMatchResult {
    const navigationEvents = events.filter(e => 
      e.type.includes('navigation') || e.type.includes('view:changed')
    );
    
    if (navigationEvents.length < 2) {
      return { isMatch: false, confidenceScore: 0, matchedSequence: [] };
    }
    
    // Check for patterns in navigation
    const moduleSequence = navigationEvents.map(e => e.payload?.moduleId || e.payload?.view);
    const uniqueModules = new Set(moduleSequence).size;
    
    // Calculate confidence based on exploration pattern
    // - Low if just switching between same 1-2 modules
    // - Higher if exploring multiple modules methodically
    // - Lower if randomly jumping around
    
    let confidenceScore = 0;
    let patternType = 'random';
    
    if (uniqueModules === 1) {
      confidenceScore = 0.2; // Low confidence for single module
      patternType = 'focused';
    } else if (uniqueModules === 2 && moduleSequence.length >= 4) {
      // Check for alternating pattern (A-B-A-B)
      let isAlternating = true;
      for (let i = 0; i < moduleSequence.length - 2; i += 2) {
        if (moduleSequence[i] !== moduleSequence[i+2]) {
          isAlternating = false;
          break;
        }
      }
      
      if (isAlternating) {
        confidenceScore = 0.7;
        patternType = 'comparing';
      } else {
        confidenceScore = 0.4;
        patternType = 'focused_switching';
      }
    } else if (uniqueModules > 2) {
      // Check for methodical exploration
      const visitsPerModule: Record<string, number> = {};
      moduleSequence.forEach(module => {
        if (module) {
          visitsPerModule[module] = (visitsPerModule[module] || 0) + 1;
        }
      });
      
      const visitCounts = Object.values(visitsPerModule);
      const maxVisits = Math.max(...visitCounts);
      const minVisits = Math.min(...visitCounts);
      
      if (maxVisits - minVisits <= 1) {
        // Even exploration across modules
        confidenceScore = 0.8;
        patternType = 'methodical_exploration';
      } else {
        // Uneven but still exploring
        confidenceScore = 0.6;
        patternType = 'uneven_exploration';
      }
    }
    
    return {
      isMatch: confidenceScore > 0.3,
      confidenceScore,
      matchedSequence: navigationEvents.map(e => ({
        timestamp: e.timestamp,
        module: e.payload?.moduleId || e.payload?.view,
        patternType
      }))
    };
  }
  
  /**
   * Match deep focus pattern
   */
  private matchDeepFocus(
    events: GESemanticEvent[],
    soulState: SystemSoulState,
    history: Map<string, any[]>
  ): PatternMatchResult {
    // Look for sustained activity in a single module/context
    const moduleEvents = events.filter(e => 
      e.type.includes('module') || e.type.includes('user:action')
    );
    
    if (moduleEvents.length < 5) {
      return { isMatch: false, confidenceScore: 0, matchedSequence: [] };
    }
    
    // Extract modules/contexts from events
    const modules = new Set<string>();
    moduleEvents.forEach(e => {
      if (e.sourceId) modules.add(e.sourceId);
      if (e.payload?.moduleId) modules.add(e.payload.moduleId);
    });
    
    // If activity is concentrated in 1-2 modules, it might be deep focus
    let confidenceScore = 0;
    if (modules.size === 1) {
      // Single module focus
      confidenceScore = 0.8;
    } else if (modules.size === 2) {
      // Focused on related modules perhaps
      confidenceScore = 0.6;
    } else {
      // Too scattered for deep focus
      confidenceScore = 0.3;
    }
    
    // Adjust for coherence level
    confidenceScore = confidenceScore * (soulState.coherenceLevel / 100);
    
    return {
      isMatch: confidenceScore > 0.5,
      confidenceScore,
      matchedSequence: moduleEvents.map(e => ({
        timestamp: e.timestamp,
        module: e.sourceId || e.payload?.moduleId,
        type: e.type
      }))
    };
  }
  
  /**
   * Match harmonic resonance
   */
  private matchHarmonicResonance(
    events: GESemanticEvent[],
    soulState: SystemSoulState,
    history: Map<string, any[]>
  ): PatternMatchResult {
    // Harmonic resonance is primarily indicated by high coherence
    const coherence = soulState.coherenceLevel;
    
    if (coherence < 70) {
      return { isMatch: false, confidenceScore: 0, matchedSequence: [] };
    }
    
    // Look at the flow of events for harmonic patterns
    const recentEvents = events.slice(-20);
    
    // Calculate timing intervals between events
    const intervals: number[] = [];
    for (let i = 1; i < recentEvents.length; i++) {
      const t1 = new Date(recentEvents[i-1].timestamp).getTime();
      const t2 = new Date(recentEvents[i].timestamp).getTime();
      intervals.push(t2 - t1);
    }
    
    if (intervals.length < 3) {
      return { 
        isMatch: true, // Minimal match based on coherence alone
        confidenceScore: coherence / 100,
        matchedSequence: []
      };
    }
    
    // Check if intervals form a harmonic pattern
    // (e.g., following golden ratio or Fibonacci sequence)
    const harmonicScore = this.calculateHarmonicScore(intervals);
    
    // Combine coherence and harmonic scores
    const combinedScore = (coherence / 100 + harmonicScore) / 2;
    
    return {
      isMatch: combinedScore > 0.6,
      confidenceScore: combinedScore,
      matchedSequence: recentEvents.map(e => ({
        timestamp: e.timestamp,
        type: e.type
      }))
    };
  }
  
  /**
   * Calculate harmonic score for a sequence of intervals
   */
  private calculateHarmonicScore(intervals: number[]): number {
    if (intervals.length < 2) return 0;
    
    // Golden ratio
    const PHI = 1.618033988749895;
    
    // Calculate ratios between consecutive intervals
    const ratios: number[] = [];
    for (let i = 1; i < intervals.length; i++) {
      if (intervals[i-1] === 0) continue; // Avoid division by zero
      ratios.push(intervals[i] / intervals[i-1]);
    }
    
    if (ratios.length === 0) return 0;
    
    // Calculate how close ratios are to golden ratio or other harmonic values
    const harmonicDistances = ratios.map(ratio => {
      // Check distance to golden ratio
      const phiDistance = Math.abs(ratio - PHI) / PHI;
      
      // Check distance to simple fractions (1/2, 1/3, 2/3, etc.)
      const fractionDistances = [
        Math.abs(ratio - 0.5) / 0.5, // 1/2
        Math.abs(ratio - 2) / 2,     // 2/1
        Math.abs(ratio - 0.333) / 0.333, // 1/3
        Math.abs(ratio - 3) / 3      // 3/1
      ];
      
      // Return minimum distance (closest match)
      return Math.min(phiDistance, ...fractionDistances);
    });
    
    // Average the distances and convert to a score (lower distance = higher score)
    const avgDistance = harmonicDistances.reduce((sum, val) => sum + val, 0) / 
                       harmonicDistances.length;
    
    // Convert to score (0-1)
    return Math.max(0, 1 - avgDistance);
  }
  
  /**
   * Create ego pattern template
   */
  private createEgoPatternTemplate(egoPattern: EgoPattern): PatternTemplate {
    return {
      name: `Ego Pattern: ${this.formatEgoPatternName(egoPattern)}`,
      type: 'behavioral',
      source: 'user',
      condition: () => true, // Always matches since we already know the pattern is active
      matchFunction: () => ({ 
        isMatch: true, 
        confidenceScore: 0.85, 
        matchedSequence: [] 
      }),
      frequency: this.getEgoPatternFrequency(egoPattern),
      chakraMapping: {
        'default': this.getEgoPatternChakra(egoPattern)
      },
      essenceLabels: [
        'ego:pattern',
        `pattern:${egoPattern}`,
        'consciousness:limitation',
        'growth:opportunity'
      ]
    };
  }
  
  /**
   * Format ego pattern name for display
   */
  private formatEgoPatternName(pattern: EgoPattern): string {
    return pattern
      .split('_')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ');
  }
  
  /**
   * Format chakra name for display
   */
  private formatChakraName(chakra: string): string {
    return chakra
      .split('-')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ');
  }
  
  /**
   * Get frequency associated with ego pattern
   */
  private getEgoPatternFrequency(pattern: EgoPattern): number {
    switch (pattern) {
      case 'control_seeking': return 0.6; // Higher frequency, more active
      case 'over_analysis': return 0.8; // Very high mental activity
      case 'scattered_focus': return 0.9; // Rapid, scattered energy
      case 'resistance': return 0.4; // Lower, blocked energy
      case 'avoidance': return 0.3; // Low, withdrawing energy
      case 'perfectionism': return 0.7; // Higher, active correction
      case 'comparison': return 0.5; // Medium, evaluative energy
      case 'self_doubt': return 0.4; // Lower, hesitant energy
      default: return 0.5;
    }
  }
  
  /**
   * Get chakra associated with ego pattern
   */
  private getEgoPatternChakra(pattern: EgoPattern): string {
    switch (pattern) {
      case 'control_seeking': return 'solar'; // Solar plexus (power)
      case 'over_analysis': return 'third-eye'; // Third eye (thought)
      case 'scattered_focus': return 'throat'; // Throat (expression)
      case 'resistance': return 'root'; // Root (security)
      case 'avoidance': return 'sacral'; // Sacral (emotions)
      case 'perfectionism': return 'solar'; // Solar plexus (achievement)
      case 'comparison': return 'solar'; // Solar plexus (self-worth)
      case 'self_doubt': return 'sacral'; // Sacral (self-value)
      default: return 'solar';
    }
  }
}

/**
 * Pattern template interface
 */
interface PatternTemplate {
  name: string;
  type: 'temporal' | 'energetic' | 'behavioral' | 'state';
  source: 'user' | 'system' | 'collective';
  condition: (events: GESemanticEvent[], soulState?: SystemSoulState, lastState?: SystemSoulState) => boolean;
  matchFunction: (events: GESemanticEvent[], soulState: SystemSoulState, history: Map<string, any[]>) => PatternMatchResult;
  frequency: number;
  chakraMapping: Record<string, string>;
  essenceLabels: string[];
}

/**
 * Pattern match result interface
 */
interface PatternMatchResult {
  isMatch: boolean;
  confidenceScore: number; // 0-1
  matchedSequence: any[];
}