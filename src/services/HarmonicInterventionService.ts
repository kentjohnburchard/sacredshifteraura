import { EventBus } from './EventBus';
import { GlobalEventHorizon } from './GlobalEventHorizon';
import { SystemSoulState } from '../contexts/RSIContext';
import { HarmonicIntervention } from '../types/phre';

/**
 * HarmonicInterventionService - Implements and manages interventions
 * 
 * Processes and applies harmonic interventions based on PHRE forecasts
 * to maintain system harmony and optimize user experience.
 */
export class HarmonicInterventionService {
  private static instance: HarmonicInterventionService;
  private eventBus: EventBus;
  private geh: GlobalEventHorizon;
  
  private activeInterventions: Map<string, HarmonicIntervention> = new Map();
  
  private constructor() {
    this.eventBus = EventBus.getInstance();
    this.geh = GlobalEventHorizon.getInstance();
  }
  
  public static getInstance(): HarmonicInterventionService {
    if (!HarmonicInterventionService.instance) {
      HarmonicInterventionService.instance = new HarmonicInterventionService();
    }
    return HarmonicInterventionService.instance;
  }
  
  /**
   * Process a suggested intervention
   */
  public async processIntervention(
    intervention: HarmonicIntervention,
    soulState: SystemSoulState
  ): Promise<boolean> {
    console.log(`[HarmonicInterventionService] Processing intervention: ${intervention.type}`, intervention);
    
    // Check if same intervention is already active
    const existingIntervention = Array.from(this.activeInterventions.values()).find(i => 
      i.type === intervention.type && 
      i.targetChakra === intervention.targetChakra
    );
    
    if (existingIntervention) {
      // Already processing this type of intervention
      console.log(`[HarmonicInterventionService] Similar intervention already active: ${existingIntervention.id}`);
      return false;
    }
    
    // Apply intervention based on type
    let success = false;
    
    if (intervention.autoApply) {
      // These intervention types can be automatically applied
      success = await this.applyIntervention(intervention, soulState);
    } else {
      // These intervention types require user consent/interaction
      success = await this.suggestIntervention(intervention, soulState);
    }
    
    if (success) {
      // Store as active intervention
      this.activeInterventions.set(intervention.id, {
        ...intervention,
        appliedTimestamp: new Date().toISOString()
      });
      
      // Schedule cleanup
      setTimeout(() => {
        this.completeIntervention(intervention.id);
      }, 5 * 60 * 1000); // Clean up after 5 minutes
    }
    
    return success;
  }
  
  /**
   * Apply an intervention automatically
   */
  private async applyIntervention(
    intervention: HarmonicIntervention,
    soulState: SystemSoulState
  ): Promise<boolean> {
    try {
      let result = false;
      
      switch (intervention.type) {
        case 'visual:harmony':
          result = await this.applyVisualHarmony(intervention, soulState);
          break;
          
        case 'frequency:adjustment':
          result = await this.applyFrequencyAdjustment(intervention, soulState);
          break;
          
        case 'chakra:balancing':
          result = await this.applyChakraBalancing(intervention, soulState);
          break;
          
        default:
          console.warn(`[HarmonicInterventionService] Unsupported auto-apply intervention type: ${intervention.type}`);
          return false;
      }
      
      if (result) {
        // Publish success event
        this.eventBus.publish(
          'phre:intervention:applied',
          'HARMONIC_INTERVENTION',
          { 
            interventionId: intervention.id,
            type: intervention.type,
            autoApplied: true
          },
          ['phre:intervention', 'harmony:applied', ...intervention.essenceLabels]
        );
      }
      
      return result;
    } catch (error) {
      console.error(`[HarmonicInterventionService] Error applying intervention: ${intervention.type}`, error);
      
      this.eventBus.publish(
        'phre:intervention:error',
        'HARMONIC_INTERVENTION',
        { 
          interventionId: intervention.id,
          type: intervention.type,
          error: (error as Error).message
        },
        ['phre:intervention', 'error:application', 'system:resilience']
      );
      
      return false;
    }
  }
  
  /**
   * Suggest an intervention to the user
   */
  private async suggestIntervention(
    intervention: HarmonicIntervention,
    soulState: SystemSoulState
  ): Promise<boolean> {
    // Publish suggestion event for UI components to pick up
    this.eventBus.publish(
      'phre:intervention:suggested',
      'HARMONIC_INTERVENTION',
      { 
        interventionId: intervention.id,
        type: intervention.type,
        description: intervention.description,
        suggestedAction: intervention.suggestedAction,
        targetChakra: intervention.targetChakra,
        targetFrequency: intervention.targetFrequency,
        associatedModule: intervention.associatedModule
      },
      ['phre:intervention', 'suggestion:offered', ...intervention.essenceLabels]
    );
    
    return true; // Successfully offered suggestion
  }
  
  /**
   * Mark an intervention as completed
   */
  public completeIntervention(interventionId: string): void {
    const intervention = this.activeInterventions.get(interventionId);
    if (!intervention) return;
    
    this.activeInterventions.delete(interventionId);
    
    this.eventBus.publish(
      'phre:intervention:completed',
      'HARMONIC_INTERVENTION',
      { 
        interventionId,
        type: intervention.type
      },
      ['phre:intervention', 'completion:success', ...intervention.essenceLabels]
    );
  }
  
  /**
   * Get all active interventions
   */
  public getActiveInterventions(): HarmonicIntervention[] {
    return Array.from(this.activeInterventions.values());
  }
  
  /**
   * Apply visual harmony intervention
   */
  private async applyVisualHarmony(
    intervention: HarmonicIntervention,
    soulState: SystemSoulState
  ): Promise<boolean> {
    // This would adjust UI visual elements for greater harmony
    // Since we can't directly modify the UI from a service,
    // we broadcast an event for UI components to respond to
    
    this.eventBus.publish(
      'phre:visual:harmonize',
      'HARMONIC_INTERVENTION',
      {
        interventionId: intervention.id,
        targetChakra: intervention.targetChakra || soulState.dominantChakra,
        intensity: 0.7 // 70% intensity for subtle effect
      },
      ['phre:visual', 'harmony:enhance', 'ui:adaptation']
    );
    
    return true;
  }
  
  /**
   * Apply frequency adjustment intervention
   */
  private async applyFrequencyAdjustment(
    intervention: HarmonicIntervention,
    soulState: SystemSoulState
  ): Promise<boolean> {
    const targetFreq = intervention.targetFrequency || soulState.dominantFrequency;
    
    this.eventBus.publish(
      'phre:frequency:adjust',
      'HARMONIC_INTERVENTION',
      {
        interventionId: intervention.id,
        currentFrequency: soulState.dominantFrequency,
        targetFrequency: targetFreq,
        transitionDuration: 3000 // 3 seconds for smooth transition
      },
      ['phre:frequency', 'adjustment:smooth', 'resonance:tuning']
    );
    
    return true;
  }
  
  /**
   * Apply chakra balancing intervention
   */
  private async applyChakraBalancing(
    intervention: HarmonicIntervention,
    soulState: SystemSoulState
  ): Promise<boolean> {
    // For automatic chakra balancing, we adjust the UI theme
    // to better align with the target chakra
    
    this.eventBus.publish(
      'phre:chakra:balance',
      'HARMONIC_INTERVENTION',
      {
        interventionId: intervention.id,
        targetChakra: intervention.targetChakra || soulState.dominantChakra,
        currentChakra: soulState.dominantChakra,
        transitionDuration: 2000 // 2 seconds for smooth transition
      },
      ['phre:chakra', 'balance:enhance', 'energy:harmony']
    );
    
    return true;
  }
  
  /**
   * Apply breath synchronization intervention
   */
  public async applyBreathSync(
    targetBreathRate: number = 6
  ): Promise<boolean> {
    this.eventBus.publish(
      'phre:breath:synchronize',
      'HARMONIC_INTERVENTION',
      {
        targetBreathRate,
        duration: 300, // 5 minutes in seconds
        subtle: true // Start subtly
      },
      ['phre:breath', 'sync:initiate', 'presence:enhance']
    );
    
    return true;
  }
  
  /**
   * Apply module suggestion intervention
   */
  public async applyModuleSuggestion(
    moduleId: string,
    reason: string
  ): Promise<boolean> {
    this.eventBus.publish(
      'phre:module:suggest',
      'HARMONIC_INTERVENTION',
      {
        moduleId,
        reason,
        priority: 5 // Medium priority
      },
      ['phre:module', 'suggestion:highlight', 'navigation:guide']
    );
    
    return true;
  }
}