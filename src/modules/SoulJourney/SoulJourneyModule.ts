import { IModule, ModuleManifest, GESemanticEvent } from '../../types';
import { GlobalEventHorizon } from '../../services/GlobalEventHorizon';
import { FrequencyUtils } from '../../utils/FrequencyUtils';
import { SupabaseService } from '../../services/SupabaseService';
import { SoulJourneyExplorer } from './components/SoulJourneyExplorer';

export interface ArchetypeActivation {
  id?: string;
  user_id?: string;
  archetype_key: string;
  archetype_name: string;
  activation_date?: string;
  frequency_hz?: number;
  chakra_resonance?: string;
  activation_notes?: string;
  wisdom_received?: string;
  integration_level?: number;
  created_at?: string;
}

export interface FrequencySignature {
  id?: string;
  user_id?: string;
  dominant_frequency: number;
  harmonic_pattern: Record<string, any>;
  chakra_alignment: Record<string, number>;
  resonance_score: number;
  created_at?: string;
  updated_at?: string;
}

export interface SoulJourneySession {
  id?: string;
  user_id?: string;
  journey_type: string;
  frequencies_used: number[];
  duration_minutes: number;
  consciousness_expansion_level?: number;
  insights_gained?: string;
  created_at?: string;
}

export interface TarotArchetype {
  key: string;
  name: string;
  element: string;
  number: number;
  chakra: string;
  frequency: number;
  keywords: string[];
  description: string;
  consciousness_level: string;
  shadow_aspects: string[];
  light_aspects: string[];
}

export class SoulJourneyModule implements IModule {
  private manifest: ModuleManifest;
  private geh: GlobalEventHorizon;
  private supabase: SupabaseService;
  private isInitialized = false;
  private isActive = false;
  private tarotArchetypes: Map<string, TarotArchetype> = new Map();

  constructor(manifest: ModuleManifest) {
    this.manifest = manifest;
    this.geh = GlobalEventHorizon.getInstance();
    this.supabase = SupabaseService.getInstance();
    this.initializeArchetypes();
  }

  getManifest(): ModuleManifest {
    return this.manifest;
  }

  async initialize(): Promise<void> {
    if (this.isInitialized) return;

    this.geh.publish({
      type: 'module:soul-journey:initializing',
      sourceId: this.manifest.id,
      timestamp: new Date().toISOString(),
      payload: { status: 'starting' },
      metadata: { moduleName: this.manifest.name },
      essenceLabels: ['module:initialization', 'soul:journey', 'consciousness:expansion']
    });
    
    this.isInitialized = true;

    this.geh.publish({
      type: 'module:soul-journey:initialized',
      sourceId: this.manifest.id,
      timestamp: new Date().toISOString(),
      payload: { status: 'ready' },
      metadata: { moduleName: this.manifest.name },
      essenceLabels: ['module:ready', 'soul:journey', 'consciousness:expansion']
    });
  }

  async activate(): Promise<void> {
    if (!this.isInitialized) {
      throw new Error('Module must be initialized before activation');
    }

    this.isActive = true;

    this.geh.publish({
      type: 'module:soul-journey:activated',
      sourceId: this.manifest.id,
      timestamp: new Date().toISOString(),
      payload: { status: 'active', features: ['frequency-analysis', 'archetype-activation', 'soul-journey'] },
      metadata: { moduleName: this.manifest.name },
      essenceLabels: ['module:active', 'soul:journey', 'consciousness:expansion']
    });
  }

  async deactivate(): Promise<void> {
    this.isActive = false;

    this.geh.publish({
      type: 'module:soul-journey:deactivated',
      sourceId: this.manifest.id,
      timestamp: new Date().toISOString(),
      payload: { status: 'dormant' },
      metadata: { moduleName: this.manifest.name },
      essenceLabels: ['module:dormant', 'soul:journey', 'consciousness:paused']
    });
  }

  async destroy(): Promise<void> {
    this.isActive = false;
    this.isInitialized = false;

    this.geh.publish({
      type: 'module:soul-journey:destroyed',
      sourceId: this.manifest.id,
      timestamp: new Date().toISOString(),
      payload: { status: 'destroyed' },
      metadata: { moduleName: this.manifest.name },
      essenceLabels: ['module:destroyed', 'soul:journey', 'resources:released']
    });
  }

  ping(): boolean {
    return this.isActive;
  }

  getExposedItems(): Record<string, any> {
    return {
      FrequencyAnalyzer: {
        analyzeFrequencySignature: (userId: string) => this.analyzeFrequencySignature(userId),
        getFrequencySignature: (userId: string) => this.getFrequencySignature(userId),
        calculateFrequencyResonance: (freq1: number, freq2: number) => FrequencyUtils.calculateResonance(freq1, freq2)
      },
      ArchetypeActivator: {
        getAllArchetypes: () => Array.from(this.tarotArchetypes.values()),
        getArchetype: (key: string) => this.tarotArchetypes.get(key),
        activateArchetype: (userId: string, archetypeKey: string, notes?: string) => 
          this.activateArchetype(userId, archetypeKey, notes),
        getUserActivations: (userId: string) => this.getUserActivations(userId)
      },
      SoulJourneyService: {
        startJourney: (userId: string, journeyType: string, frequencies: number[]) => 
          this.startJourney(userId, journeyType, frequencies),
        completeJourney: (sessionId: string, expansionLevel: number, insights: string) => 
          this.completeJourney(sessionId, expansionLevel, insights),
        getUserJourneys: (userId: string) => this.getUserJourneys(userId)
      },
      // Expose React component
      Component: () => SoulJourneyExplorer
    };
  }

  private initializeArchetypes(): void {
    const archetypes: TarotArchetype[] = [
      {
        key: 'fool',
        name: 'The Fool',
        element: 'air',
        number: 0,
        chakra: 'crown',
        frequency: 963,
        keywords: ['beginnings', 'innocence', 'spontaneity', 'free spirit'],
        description: 'The Fool represents new beginnings, faith in the future, and innocence. It encourages taking a leap of faith and following your heart.',
        consciousness_level: 'cosmic awareness',
        shadow_aspects: ['recklessness', 'naivety', 'foolishness'],
        light_aspects: ['purity', 'trust', 'optimism', 'adventure']
      },
      {
        key: 'magician',
        name: 'The Magician',
        element: 'air',
        number: 1,
        chakra: 'third-eye',
        frequency: 852,
        keywords: ['manifestation', 'power', 'action', 'creation'],
        description: 'The Magician represents the ability to manifest your desires using focused intention, spiritual power, and practical tools.',
        consciousness_level: 'manifestation consciousness',
        shadow_aspects: ['manipulation', 'trickery', 'wasted talent'],
        light_aspects: ['willpower', 'creation', 'concentration', 'skill']
      },
      {
        key: 'high_priestess',
        name: 'The High Priestess',
        element: 'water',
        number: 2,
        chakra: 'third-eye',
        frequency: 852,
        keywords: ['intuition', 'unconscious', 'divine feminine', 'inner voice'],
        description: 'The High Priestess represents intuition, sacred knowledge, divine feminine, and the subconscious mind.',
        consciousness_level: 'intuitive awareness',
        shadow_aspects: ['secrets', 'disconnection', 'repressed feelings'],
        light_aspects: ['intuition', 'wisdom', 'mystery', 'spirituality']
      },
      {
        key: 'empress',
        name: 'The Empress',
        element: 'earth',
        number: 3,
        chakra: 'heart',
        frequency: 639,
        keywords: ['abundance', 'nurturing', 'fertility', 'creation'],
        description: 'The Empress represents divine feminine, abundance, nurturing, and connection with nature and body.',
        consciousness_level: 'creative abundance',
        shadow_aspects: ['smothering', 'dependence', 'self-indulgence'],
        light_aspects: ['nurturing', 'abundance', 'sensuality', 'fertility']
      },
      {
        key: 'emperor',
        name: 'The Emperor',
        element: 'fire',
        number: 4,
        chakra: 'solar',
        frequency: 528,
        keywords: ['authority', 'structure', 'control', 'leadership'],
        description: 'The Emperor represents stability, structure, authority, and regulation. It encourages creating order out of chaos.',
        consciousness_level: 'ordered leadership',
        shadow_aspects: ['domination', 'rigidity', 'coldness'],
        light_aspects: ['structure', 'protection', 'stability', 'rationality']
      },
      {
        key: 'hierophant',
        name: 'The Hierophant',
        element: 'earth',
        number: 5,
        chakra: 'throat',
        frequency: 741,
        keywords: ['tradition', 'conformity', 'morality', 'ethics'],
        description: 'The Hierophant represents tradition, spirituality, and initiation. It connects the divine with the earthly realm.',
        consciousness_level: 'spiritual initiation',
        shadow_aspects: ['dogma', 'inflexibility', 'judgment'],
        light_aspects: ['tradition', 'spiritual wisdom', 'guidance', 'education']
      },
      {
        key: 'lovers',
        name: 'The Lovers',
        element: 'air',
        number: 6,
        chakra: 'heart',
        frequency: 639,
        keywords: ['love', 'harmony', 'choices', 'alignment'],
        description: 'The Lovers represents connections, alignment, and choices from the heart. It symbolizes perfect union, harmony of opposites.',
        consciousness_level: 'heart-centered union',
        shadow_aspects: ['indecision', 'separation', 'disharmony'],
        light_aspects: ['love', 'harmony', 'alignment', 'choices']
      },
      {
        key: 'chariot',
        name: 'The Chariot',
        element: 'water',
        number: 7,
        chakra: 'solar',
        frequency: 528,
        keywords: ['determination', 'willpower', 'victory', 'control'],
        description: 'The Chariot represents overcoming challenges through willpower, determination, and maintaining control over opposing forces.',
        consciousness_level: 'directed will',
        shadow_aspects: ['aggression', 'recklessness', 'lack of direction'],
        light_aspects: ['willpower', 'determination', 'direction', 'focus']
      }
    ];

    archetypes.forEach(archetype => {
      this.tarotArchetypes.set(archetype.key, archetype);
    });
  }

  private async analyzeFrequencySignature(userId: string): Promise<FrequencySignature> {
    // In a real implementation, this would analyze user data patterns
    // Here we create a simulated frequency signature
    
    const dominantFrequency = [396, 417, 528, 639, 741, 852, 963][Math.floor(Math.random() * 7)];
    
    // Calculate harmonics based on golden ratio and frequency relationships
    const harmonicPattern = {
      primaryHarmonic: dominantFrequency,
      secondaryHarmonic: dominantFrequency * FrequencyUtils.GOLDEN_RATIO,
      tertiaryHarmonic: dominantFrequency * 2, // Octave
      resonantPattern: ['fibonacci', 'golden', 'octave'][Math.floor(Math.random() * 3)]
    };
    
    // Create chakra alignment profile
    const chakraAlignment: Record<string, number> = {
      root: Math.random() * 100,
      sacral: Math.random() * 100,
      solar: Math.random() * 100,
      heart: Math.random() * 100,
      throat: Math.random() * 100,
      'third-eye': Math.random() * 100,
      crown: Math.random() * 100
    };
    
    // Find the closest chakra to the dominant frequency
    const dominantChakra = FrequencyUtils.getClosestChakra(dominantFrequency);
    chakraAlignment[dominantChakra] += 50; // Boost the dominant chakra
    
    // Normalize values to 0-100 scale
    const maxValue = Math.max(...Object.values(chakraAlignment));
    Object.keys(chakraAlignment).forEach(chakra => {
      chakraAlignment[chakra] = Math.min(100, (chakraAlignment[chakra] / maxValue) * 100);
    });
    
    // Calculate overall resonance score
    const resonanceScore = Math.floor(Math.random() * 50) + 50; // 50-100
    
    // Create signature object
    const signature: FrequencySignature = {
      user_id: userId,
      dominant_frequency: dominantFrequency,
      harmonic_pattern: harmonicPattern,
      chakra_alignment: chakraAlignment,
      resonance_score: resonanceScore
    };
    
    try {
      // Check if a frequency signature already exists for this user
      const { data: existingSignature, error: checkError } = await this.supabase.client
        .from('frequency_signatures')
        .select('id')
        .eq('user_id', userId)
        .maybeSingle();
      
      if (checkError) {
        console.error('[SoulJourneyModule] Error checking existing signature:', checkError);
        throw checkError;
      }
      
      let data;
      if (existingSignature) {
        // Update existing record
        const { data: updateData, error: updateError } = await this.supabase.client
          .from('frequency_signatures')
          .update({
            dominant_frequency: dominantFrequency,
            harmonic_pattern: harmonicPattern,
            chakra_alignment: chakraAlignment,
            resonance_score: resonanceScore,
            updated_at: new Date().toISOString()
          })
          .eq('user_id', userId)
          .select()
          .single();
        
        if (updateError) throw updateError;
        data = updateData;
      } else {
        // Insert new record
        const { data: insertData, error: insertError } = await this.supabase.client
          .from('frequency_signatures')
          .insert({
            user_id: userId,
            dominant_frequency: dominantFrequency,
            harmonic_pattern: harmonicPattern,
            chakra_alignment: chakraAlignment,
            resonance_score: resonanceScore
          })
          .select()
          .single();
        
        if (insertError) throw insertError;
        data = insertData;
      }
      
      // Publish event
      this.geh.publish({
        type: 'soul:journey:frequency:analyzed',
        sourceId: this.manifest.id,
        timestamp: new Date().toISOString(),
        payload: { 
          userId, 
          dominantFrequency,
          resonanceScore
        },
        metadata: { moduleId: this.manifest.id },
        essenceLabels: ['soul:frequency', 'analysis:complete', 'consciousness:expansion']
      });
      
      return signature;
      
    } catch (error) {
      console.error('[SoulJourneyModule] Failed to save frequency signature:', error);
      return signature;
    }
  }

  private async getFrequencySignature(userId: string): Promise<FrequencySignature | null> {
    try {
      const { data, error } = await this.supabase.client
        .from('frequency_signatures')
        .select('*')
        .eq('user_id', userId)
        .maybeSingle();
        
      if (error) {
        console.error('[SoulJourneyModule] Error getting frequency signature:', error);
        return null;
      }
      
      return data;
    } catch (error) {
      console.error('[SoulJourneyModule] Failed to get frequency signature:', error);
      return null;
    }
  }

  private async activateArchetype(userId: string, archetypeKey: string, notes?: string): Promise<ArchetypeActivation | null> {
    const archetype = this.tarotArchetypes.get(archetypeKey);
    if (!archetype) {
      console.error(`[SoulJourneyModule] Archetype not found: ${archetypeKey}`);
      return null;
    }
    
    const activation: ArchetypeActivation = {
      user_id: userId,
      archetype_key: archetypeKey,
      archetype_name: archetype.name,
      frequency_hz: archetype.frequency,
      chakra_resonance: archetype.chakra,
      activation_notes: notes || '',
      wisdom_received: `Connecting with the essence of ${archetype.name}: ${archetype.description}`,
      integration_level: Math.floor(Math.random() * 10) + 1 // 1-10
    };
    
    try {
      const { data, error } = await this.supabase.client
        .from('archetype_activations')
        .insert(activation)
        .select()
        .single();
        
      if (error) throw error;
      
      // Publish event
      this.geh.publish({
        type: 'soul:journey:archetype:activated',
        sourceId: this.manifest.id,
        timestamp: new Date().toISOString(),
        payload: { 
          userId,
          archetypeKey,
          archetypeName: archetype.name,
          chakra: archetype.chakra,
          frequency: archetype.frequency
        },
        metadata: { moduleId: this.manifest.id },
        essenceLabels: ['soul:archetype', 'activation:complete', 'consciousness:expansion', 'frequency:attunement']
      });
      
      return data;
      
    } catch (error) {
      console.error('[SoulJourneyModule] Failed to save archetype activation:', error);
      return null;
    }
  }

  private async getUserActivations(userId: string): Promise<ArchetypeActivation[]> {
    try {
      const { data, error } = await this.supabase.client
        .from('archetype_activations')
        .select('*')
        .eq('user_id', userId)
        .order('activation_date', { ascending: false });
        
      if (error) throw error;
      
      return data || [];
    } catch (error) {
      console.error('[SoulJourneyModule] Failed to get user activations:', error);
      return [];
    }
  }

  private async startJourney(userId: string, journeyType: string, frequencies: number[]): Promise<SoulJourneySession | null> {
    const session: SoulJourneySession = {
      user_id: userId,
      journey_type: journeyType,
      frequencies_used: frequencies,
      duration_minutes: 0 // Will be updated on completion
    };
    
    try {
      const { data, error } = await this.supabase.client
        .from('soul_journey_sessions')
        .insert(session)
        .select()
        .single();
        
      if (error) throw error;
      
      // Publish event
      this.geh.publish({
        type: 'soul:journey:session:started',
        sourceId: this.manifest.id,
        timestamp: new Date().toISOString(),
        payload: { 
          userId,
          sessionId: data.id,
          journeyType,
          frequencies
        },
        metadata: { moduleId: this.manifest.id },
        essenceLabels: ['soul:journey', 'session:started', 'consciousness:expansion']
      });
      
      return data;
      
    } catch (error) {
      console.error('[SoulJourneyModule] Failed to start journey session:', error);
      return null;
    }
  }

  private async completeJourney(sessionId: string, expansionLevel: number, insights: string): Promise<SoulJourneySession | null> {
    try {
      // Calculate duration based on start time
      const { data: sessionData, error: sessionError } = await this.supabase.client
        .from('soul_journey_sessions')
        .select('created_at, user_id')
        .eq('id', sessionId)
        .single();
        
      if (sessionError) throw sessionError;
      
      const startTime = new Date(sessionData.created_at);
      const endTime = new Date();
      const durationMinutes = Math.round((endTime.getTime() - startTime.getTime()) / 60000);
      
      const { data, error } = await this.supabase.client
        .from('soul_journey_sessions')
        .update({
          duration_minutes: durationMinutes,
          consciousness_expansion_level: expansionLevel,
          insights_gained: insights
        })
        .eq('id', sessionId)
        .select()
        .single();
        
      if (error) throw error;
      
      // Publish event
      this.geh.publish({
        type: 'soul:journey:session:completed',
        sourceId: this.manifest.id,
        timestamp: new Date().toISOString(),
        payload: { 
          sessionId,
          userId: sessionData.user_id,
          durationMinutes,
          expansionLevel
        },
        metadata: { moduleId: this.manifest.id },
        essenceLabels: ['soul:journey', 'session:completed', 'consciousness:expanded']
      });
      
      return data;
      
    } catch (error) {
      console.error('[SoulJourneyModule] Failed to complete journey session:', error);
      return null;
    }
  }

  private async getUserJourneys(userId: string): Promise<SoulJourneySession[]> {
    try {
      const { data, error } = await this.supabase.client
        .from('soul_journey_sessions')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false });
        
      if (error) throw error;
      
      return data || [];
    } catch (error) {
      console.error('[SoulJourneyModule] Failed to get user journeys:', error);
      return [];
    }
  }
}