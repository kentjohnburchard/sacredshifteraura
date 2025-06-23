import { EventBus } from './EventBus';
import { GlobalEventHorizon } from './GlobalEventHorizon';
import { PHREPatternSynth } from './PHREPatternSynth';
import { HarmonicInterventionService } from './HarmonicInterventionService';
import { SystemSoulState } from '../contexts/RSIContext';
import { 
  PHREForecast, 
  PHREForecastType, 
  PHREPattern, 
  HarmonicIntervention,
  PHREConfig
} from '../types/phre';
import { v4 as uuidv4 } from 'uuid';

/**
 * PHREngine - Predictive Harmonic Resonance Engine
 * 
 * Core service for analyzing system state and forecasting future
 * harmonic states and potential interventions.
 */
export class PHREngine {
  private static instance: PHREngine;
  private eventBus: EventBus;
  private geh: GlobalEventHorizon;
  private patternSynth: PHREPatternSynth;
  private interventionService: HarmonicInterventionService;
  
  private isActive = false;
  private forecastInterval: number | null = null;
  private lastSoulState: SystemSoulState | null = null;
  private recognizedPatterns: Map<string, PHREPattern> = new Map();
  private activeForecast: PHREForecast | null = null;
  private rsiReady = false;
  
  // Configuration
  private config: PHREConfig = {
    enabled: true,
    forecastHorizon: 300, // 5 minutes
    sensitivityThreshold: 0.5,
    interventionThreshold: 0.7,
    userAutonomyLevel: 'guided',
    chakraSensitivity: {
      'root': 0.5,
      'sacral': 0.6,
      'solar': 0.6,
      'heart': 0.8,
      'throat': 0.7,
      'third-eye': 0.9,
      'crown': 1.0
    },
    prioritizedEssenceLabels: [
      'consciousness:expansion',
      'soul:integration',
      'harmony:resonance',
      'soul:blueprint',
      'heart:coherence'
    ]
  };
  
  private constructor() {
    this.eventBus = EventBus.getInstance();
    this.geh = GlobalEventHorizon.getInstance();
    this.patternSynth = PHREPatternSynth.getInstance();
    this.interventionService = HarmonicInterventionService.getInstance();
  }
  
  public static getInstance(): PHREngine {
    if (!PHREngine.instance) {
      PHREngine.instance = new PHREngine();
    }
    return PHREngine.instance;
  }
  
  /**
   * Start the PHRE engine
   */
  public start(): void {
    if (this.isActive || !this.config.enabled) return;
    
    this.isActive = true;
    console.log('[PHREngine] Starting Predictive Harmonic Resonance Engine');
    
    // Set up event listeners
    this.setupEventListeners();
    
    // Wait for RSI ready event before running initial forecast
    this.geh.subscribe('rsi:ready', () => {
      console.log('[PHREngine] RSI context is ready, running initial forecast');
      this.rsiReady = true;
      this.runForecast();
      
      // Set up recurring forecasts only after RSI is ready
      this.forecastInterval = window.setInterval(() => {
        this.runForecast();
      }, 30000); // Forecast every 30 seconds
    });
    
    // Publish start event
    this.eventBus.publish(
      'phre:engine:started',
      'PHRE_ENGINE',
      { config: this.config },
      ['phre:system', 'engine:started', 'consciousness:anticipation']
    );
  }
  
  /**
   * Stop the PHRE engine
   */
  public stop(): void {
    if (!this.isActive) return;
    
    this.isActive = false;
    
    if (this.forecastInterval !== null) {
      clearInterval(this.forecastInterval);
      this.forecastInterval = null;
    }
    
    this.eventBus.publish(
      'phre:engine:stopped',
      'PHRE_ENGINE',
      {},
      ['phre:system', 'engine:stopped', 'consciousness:present']
    );
  }
  
  /**
   * Update PHRE configuration
   */
  public updateConfig(config: Partial<PHREConfig>): void {
    this.config = { ...this.config, ...config };
    
    // Restart if active
    if (this.isActive) {
      this.stop();
      this.start();
    }
    
    this.eventBus.publish(
      'phre:config:updated',
      'PHRE_ENGINE',
      { config: this.config },
      ['phre:system', 'config:updated']
    );
  }
  
  /**
   * Get current configuration
   */
  public getConfig(): PHREConfig {
    return { ...this.config };
  }
  
  /**
   * Get active forecast
   */
  public getActiveForecast(): PHREForecast | null {
    return this.activeForecast;
  }
  
  /**
   * Run a forecast cycle
   */
  public async runForecast(): Promise<PHREForecast | null> {
    if (!this.isActive || !this.rsiReady) return null;
    
    try {
      console.log('[PHREngine] Running forecast cycle');
      
      // 1. Get current system state
      const soulState = await this.getCurrentSoulState();
      if (!soulState) return null;
      
      // 2. Analyze recent events from Global Event Horizon
      const recentEvents = this.geh.queryAkashicRecord({
        timeRange: {
          start: new Date(Date.now() - 5 * 60 * 1000).toISOString(), // Last 5 minutes
          end: new Date().toISOString()
        },
        limit: 100
      });
      
      // 3. Detect patterns using Pattern Synthesizer
      const patterns = this.patternSynth.analyzePatterns(recentEvents, soulState);
      
      // Add newly recognized patterns
      patterns.forEach(pattern => {
        if (!this.recognizedPatterns.has(pattern.id)) {
          this.recognizedPatterns.set(pattern.id, pattern);
          
          // Publish pattern recognition event
          this.eventBus.publish(
            'phre:pattern:recognized',
            'PHRE_ENGINE',
            { 
              patternId: pattern.id,
              patternName: pattern.name,
              confidenceScore: pattern.confidenceScore
            },
            ['phre:pattern', 'recognition:new', ...pattern.essenceLabels]
          );
        }
      });
      
      // 4. Generate forecast
      const forecast = this.generateForecast(soulState, patterns, recentEvents);
      if (forecast) {
        this.activeForecast = forecast;
        
        // 5. Publish forecast event
        this.eventBus.publish(
          'phre:forecast:generated',
          'PHRE_ENGINE',
          { 
            forecastId: forecast.id,
            type: forecast.type,
            probability: forecast.probability,
            timeHorizon: forecast.timeHorizon,
            interventionCount: forecast.suggestedInterventions.length
          },
          ['phre:forecast', 'harmonic:anticipation', ...forecast.essenceLabels]
        );
        
        // 6. Process suggested interventions if probability is high enough
        if (forecast.probability >= this.config.interventionThreshold) {
          for (const intervention of forecast.suggestedInterventions) {
            await this.interventionService.processIntervention(intervention, soulState);
          }
        }
        
        // Remember last state
        this.lastSoulState = soulState;
        
        return forecast;
      }
    } catch (error) {
      console.error('[PHREngine] Forecast error:', error);
      
      this.eventBus.publish(
        'phre:forecast:error',
        'PHRE_ENGINE',
        { error: (error as Error).message },
        ['phre:forecast', 'error:process', 'system:resilience']
      );
    }
    
    return null;
  }
  
  /**
   * Generate a forecast based on current state and recognized patterns
   */
  private generateForecast(
    soulState: SystemSoulState,
    patterns: PHREPattern[],
    recentEvents: any[]
  ): PHREForecast | null {
    // Skip if no patterns detected
    if (patterns.length === 0) return null;
    
    // Sort patterns by confidence
    const sortedPatterns = [...patterns].sort((a, b) => 
      b.confidenceScore - a.confidenceScore
    );
    
    // Use the highest confidence pattern as primary basis for forecast
    const primaryPattern = sortedPatterns[0];
    
    // Determine forecast type based on patterns and state
    const forecastType = this.determineForecastType(primaryPattern, soulState);
    
    // Calculate probability based on pattern confidence and state coherence
    const probability = primaryPattern.confidenceScore * 
      (soulState.coherenceLevel / 100) * 
      this.config.chakraSensitivity[soulState.dominantChakra] || 0.5;
    
    // Generate suggested interventions
    const suggestedInterventions = this.generateInterventions(
      forecastType,
      probability,
      soulState,
      primaryPattern
    );
    
    // Create forecast
    const forecast: PHREForecast = {
      id: uuidv4(),
      timestamp: new Date().toISOString(),
      type: forecastType,
      probability,
      timeHorizon: this.config.forecastHorizon,
      description: this.generateForecastDescription(forecastType, soulState),
      associatedPatterns: patterns.map(p => p.id),
      suggestedInterventions,
      metadata: {
        dominantChakra: soulState.dominantChakra,
        dominantFrequency: soulState.dominantFrequency,
        coherenceLevel: soulState.coherenceLevel,
        activeEgoPatterns: soulState.activeEgoPatterns,
        eventCount: recentEvents.length
      },
      essenceLabels: [
        'phre:forecast',
        `chakra:${soulState.dominantChakra}`,
        'consciousness:anticipation',
        ...this.getForecastLabels(forecastType)
      ]
    };
    
    return forecast;
  }
  
  /**
   * Determine forecast type based on pattern and state
   */
  private determineForecastType(
    pattern: PHREPattern, 
    soulState: SystemSoulState
  ): PHREForecastType {
    // Check for chakra transition
    if (this.lastSoulState && this.lastSoulState.dominantChakra !== soulState.dominantChakra) {
      return 'chakra:transition';
    }
    
    // Check for harmony increasing/decreasing
    if (this.lastSoulState) {
      const coherenceDelta = soulState.coherenceLevel - this.lastSoulState.coherenceLevel;
      if (coherenceDelta > 5) return 'harmony:increasing';
      if (coherenceDelta < -5) return 'harmony:decreasing';
    }
    
    // Check for frequency shift
    if (pattern.name.includes('frequency') || pattern.name.includes('resonance')) {
      return 'frequency:shift:upcoming';
    }
    
    // Check for dissonance potential
    if (soulState.activeEgoPatterns.length > 0) {
      return 'dissonance:potential';
    }
    
    // Check for consciousness expansion
    if (pattern.confidenceScore > 0.8 && 
        pattern.chakraAssociation === 'third-eye' || 
        pattern.chakraAssociation === 'crown') {
      return 'consciousness:expansion';
    }
    
    // Default to pattern emerging
    return 'pattern:emerging';
  }
  
  /**
   * Generate forecast description
   */
  private generateForecastDescription(
    forecastType: PHREForecastType, 
    soulState: SystemSoulState
  ): string {
    switch (forecastType) {
      case 'harmony:increasing':
        return `Harmonic resonance is increasing, with ${soulState.dominantChakra} chakra energy becoming more coherent.`;
      case 'harmony:decreasing':
        return `Harmonic resonance is decreasing, potential dissonance detected in ${soulState.dominantChakra} chakra.`;
      case 'frequency:shift:upcoming':
        return `Frequency shift detected, moving toward ${soulState.dominantFrequency}Hz resonance.`;
      case 'resonance:opportunity':
        return `Opportunity for heightened resonance detected, optimum time for consciousness expansion.`;
      case 'dissonance:potential':
        return `Potential dissonance pattern emerging, gentle realignment suggested.`;
      case 'chakra:transition':
        return `Chakra energy transitioning from ${this.lastSoulState?.dominantChakra || 'previous'} to ${soulState.dominantChakra}.`;
      case 'consciousness:expansion':
        return `Consciousness expansion pattern detected, favorable conditions for spiritual growth.`;
      case 'pattern:emerging':
        return `New energetic pattern emerging, harmonizing with ${soulState.dominantChakra} chakra vibration.`;
      default:
        return 'Subtle shift in harmonic field detected.';
    }
  }
  
  /**
   * Generate appropriate interventions based on forecast
   */
  private generateInterventions(
    forecastType: PHREForecastType,
    probability: number,
    soulState: SystemSoulState,
    pattern: PHREPattern
  ): HarmonicIntervention[] {
    const interventions: HarmonicIntervention[] = [];
    
    // Only suggest interventions if probability is above threshold
    if (probability < this.config.sensitivityThreshold) {
      return [];
    }
    
    // Generate primary intervention based on forecast type
    let primaryIntervention: HarmonicIntervention | null = null;
    
    switch (forecastType) {
      case 'harmony:increasing':
        primaryIntervention = {
          id: uuidv4(),
          type: 'visual:harmony',
          priority: 4,
          description: 'Enhance visual harmony to amplify positive resonance',
          suggestedAction: 'Increase chakra glow intensity and synchronize UI animations',
          targetChakra: soulState.dominantChakra,
          autoApply: true,
          essenceLabels: ['visual:harmony', 'resonance:amplify', `chakra:${soulState.dominantChakra}`]
        };
        break;
        
      case 'harmony:decreasing':
        primaryIntervention = {
          id: uuidv4(),
          type: 'guidance:offer',
          priority: 7,
          description: 'Offer guidance to restore harmonic balance',
          suggestedAction: 'Present gentle suggestion for realignment practice',
          targetChakra: soulState.dominantChakra,
          associatedModule: 'soul-journey',
          autoApply: false,
          essenceLabels: ['guidance:harmony', 'balance:restore', `chakra:${soulState.dominantChakra}`]
        };
        break;
        
      case 'frequency:shift:upcoming':
        primaryIntervention = {
          id: uuidv4(),
          type: 'frequency:adjustment',
          priority: 6,
          description: 'Adjust interface frequency to align with upcoming shift',
          suggestedAction: 'Gradually transition UI elements and animations to new frequency',
          targetFrequency: soulState.dominantFrequency,
          autoApply: true,
          essenceLabels: ['frequency:shift', 'interface:harmony', 'anticipation:flow']
        };
        break;
        
      case 'resonance:opportunity':
        primaryIntervention = {
          id: uuidv4(),
          type: 'module:suggestion',
          priority: 5,
          description: 'Suggest optimal module for consciousness expansion',
          suggestedAction: 'Highlight Soul Journey or Divine Timeline module',
          associatedModule: pattern.chakraAssociation === 'third-eye' ? 'divine-timeline' : 'soul-journey',
          autoApply: false,
          essenceLabels: ['opportunity:highlight', 'module:suggestion', 'consciousness:expansion']
        };
        break;
        
      case 'dissonance:potential':
        primaryIntervention = {
          id: uuidv4(),
          type: 'breath:synchronization',
          priority: 8,
          description: 'Suggest breath synchronization to prevent dissonance',
          suggestedAction: 'Offer breath sync option with visualization',
          targetChakra: soulState.dominantChakra,
          autoApply: false,
          essenceLabels: ['breath:harmony', 'dissonance:prevention', 'consciousness:presence']
        };
        break;
        
      case 'chakra:transition':
        primaryIntervention = {
          id: uuidv4(),
          type: 'chakra:balancing',
          priority: 7,
          description: 'Facilitate smooth chakra transition',
          suggestedAction: 'Gradually transition UI colors and patterns to new chakra',
          targetChakra: soulState.dominantChakra,
          autoApply: true,
          essenceLabels: ['chakra:transition', 'energy:flow', 'interface:adaptation']
        };
        break;
        
      case 'consciousness:expansion':
        primaryIntervention = {
          id: uuidv4(),
          type: 'guidance:offer',
          priority: 9,
          description: 'Support consciousness expansion opportunity',
          suggestedAction: 'Suggest Soul Blueprint or Divine Timeline exploration',
          associatedModule: pattern.chakraAssociation === 'crown' ? 'soul-blueprint' : 'divine-timeline',
          autoApply: false,
          essenceLabels: ['consciousness:expansion', 'opportunity:guidance', 'evolution:support']
        };
        break;
        
      case 'pattern:emerging':
        primaryIntervention = {
          id: uuidv4(),
          type: 'visual:harmony',
          priority: 3,
          description: 'Subtly acknowledge emerging pattern',
          suggestedAction: 'Add gentle pulse animation to relevant UI elements',
          targetChakra: soulState.dominantChakra,
          autoApply: true,
          essenceLabels: ['pattern:acknowledgment', 'subtle:response', 'consciousness:awareness']
        };
        break;
    }
    
    // Add primary intervention if generated
    if (primaryIntervention) {
      interventions.push(primaryIntervention);
    }
    
    // Add secondary interventions based on soul state
    
    // If ego patterns are active, add an intervention
    if (soulState.activeEgoPatterns.length > 0) {
      interventions.push({
        id: uuidv4(),
        type: 'guidance:offer',
        priority: 6,
        description: 'Address active ego pattern',
        suggestedAction: `Offer guidance related to ${soulState.activeEgoPatterns[0]} pattern`,
        autoApply: false,
        essenceLabels: ['ego:pattern', 'guidance:gentle', 'consciousness:awareness']
      });
    }
    
    // If breath sync not active but could be helpful
    if (!soulState.breathSyncActive && forecastType !== 'dissonance:potential') {
      interventions.push({
        id: uuidv4(),
        type: 'breath:synchronization',
        priority: 4,
        description: 'Suggest breath synchronization for deeper presence',
        suggestedAction: 'Subtly highlight breath sync option',
        autoApply: false,
        essenceLabels: ['breath:awareness', 'presence:deepening', 'interface:harmony']
      });
    }
    
    return interventions;
  }
  
  /**
   * Get essence labels for a forecast type
   */
  private getForecastLabels(forecastType: PHREForecastType): string[] {
    switch (forecastType) {
      case 'harmony:increasing':
        return ['harmony:increasing', 'resonance:amplifying', 'energy:positive'];
      case 'harmony:decreasing':
        return ['harmony:decreasing', 'dissonance:potential', 'attention:needed'];
      case 'frequency:shift:upcoming':
        return ['frequency:shift', 'energy:transition', 'pattern:evolution'];
      case 'resonance:opportunity':
        return ['resonance:opportunity', 'potential:heightened', 'expansion:window'];
      case 'dissonance:potential':
        return ['dissonance:potential', 'pattern:challenging', 'growth:opportunity'];
      case 'chakra:transition':
        return ['chakra:transition', 'energy:shifting', 'consciousness:evolving'];
      case 'consciousness:expansion':
        return ['consciousness:expansion', 'awareness:heightened', 'evolution:active'];
      case 'pattern:emerging':
        return ['pattern:emerging', 'energy:forming', 'potential:development'];
      default:
        return ['phre:forecast', 'system:anticipation'];
    }
  }
  
  /**
   * Get current soul state
   */
  private async getCurrentSoulState(): Promise<SystemSoulState | null> {
    try {
      const result = await this.eventBus.request(
        'rsi:soulState:get',
        'PHRE_ENGINE',
        {},
        ['rsi:request', 'soulState:query']
      );
      
      return result;
    } catch (error) {
      console.error('[PHREngine] Failed to get soul state:', error);
      
      // Return a default state if we can't get the real one
      return this.lastSoulState || null;
    }
  }
  
  /**
   * Set up event listeners
   */
  private setupEventListeners(): void {
    // Listen for soul state changes
    this.geh.subscribe('rsi:*:changed', (event) => {
      if (this.isActive && this.rsiReady) {
        // If important state changes occur, run a new forecast
        if (event.type === 'rsi:chakra:changed' || 
            event.type === 'rsi:coherence:changed' || 
            event.type.includes('egoPattern')) {
          this.runForecast();
        }
      }
    });
    
    // Listen for user interaction patterns
    this.geh.subscribe('user:action', (event) => {
      // Pattern Synth will handle detailed analysis of user actions
      // We just need to ensure it's getting the data
    });
    
    // Listen for intervention results
    this.geh.subscribe('phre:intervention:*', (event) => {
      if (event.type === 'phre:intervention:applied' && this.rsiReady) {
        // If an intervention was successfully applied, update forecast
        this.runForecast();
      }
    });
  }
}