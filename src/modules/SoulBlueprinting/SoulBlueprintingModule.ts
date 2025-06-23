import { IModule, ModuleManifest, GESemanticEvent } from '../../types';
import { GlobalEventHorizon } from '../../services/GlobalEventHorizon';
import { SupabaseService } from '../../services/SupabaseService';
import { SoulBlueprintEditor } from './components/SoulBlueprintEditor';

export interface SoulBlueprint {
  id: string;
  user_id: string;
  core_frequency: number;
  elemental_resonance: string;
  chakra_signature: number[];
  emotional_profile?: string;
  shadow_frequencies?: string;
  blueprint_text: any;
  astrological_synthesis?: string;
  created_at?: string;
  updated_at?: string;
}

export class SoulBlueprintingModule implements IModule {
  private manifest: ModuleManifest;
  private geh: GlobalEventHorizon;
  private supabase: SupabaseService;
  private isInitialized = false;
  private isActive = false;

  constructor(manifest: ModuleManifest) {
    this.manifest = manifest;
    this.geh = GlobalEventHorizon.getInstance();
    this.supabase = SupabaseService.getInstance();
  }

  getManifest(): ModuleManifest {
    return this.manifest;
  }

  async initialize(): Promise<void> {
    if (this.isInitialized) return;

    this.geh.publish({
      type: 'module:soul-blueprinting:initializing',
      sourceId: this.manifest.id,
      timestamp: new Date().toISOString(),
      payload: { status: 'starting' },
      metadata: { moduleName: this.manifest.name },
      essenceLabels: ['module:initialization', 'soul:blueprinting', 'frequency:alignment']
    });
    
    this.isInitialized = true;

    this.geh.publish({
      type: 'module:soul-blueprinting:initialized',
      sourceId: this.manifest.id,
      timestamp: new Date().toISOString(),
      payload: { status: 'ready' },
      metadata: { moduleName: this.manifest.name },
      essenceLabels: ['module:ready', 'soul:blueprint', 'consciousness:expansion']
    });
  }

  async activate(): Promise<void> {
    if (!this.isInitialized) {
      throw new Error('Module must be initialized before activation');
    }

    this.isActive = true;

    this.geh.publish({
      type: 'module:soul-blueprinting:activated',
      sourceId: this.manifest.id,
      timestamp: new Date().toISOString(),
      payload: { status: 'active', features: ['soul-blueprint', 'frequency-analysis', 'chakra-signature'] },
      metadata: { moduleName: this.manifest.name },
      essenceLabels: ['module:active', 'soul:blueprint', 'essence:divine', 'self:understanding']
    });
  }

  async deactivate(): Promise<void> {
    this.isActive = false;

    this.geh.publish({
      type: 'module:soul-blueprinting:deactivated',
      sourceId: this.manifest.id,
      timestamp: new Date().toISOString(),
      payload: { status: 'dormant' },
      metadata: { moduleName: this.manifest.name },
      essenceLabels: ['module:dormant', 'soul:blueprint', 'paused:temporarily']
    });
  }

  async destroy(): Promise<void> {
    this.isActive = false;
    this.isInitialized = false;

    this.geh.publish({
      type: 'module:soul-blueprinting:destroyed',
      sourceId: this.manifest.id,
      timestamp: new Date().toISOString(),
      payload: { status: 'destroyed' },
      metadata: { moduleName: this.manifest.name },
      essenceLabels: ['module:destroyed', 'soul:blueprint', 'resources:released']
    });
  }

  ping(): boolean {
    return this.isActive;
  }

  getExposedItems(): Record<string, any> {
    return {
      BlueprintService: {
        getSoulBlueprint: (userId: string) => this.getSoulBlueprint(userId),
        saveSoulBlueprint: (blueprint: Partial<SoulBlueprint>) => this.saveSoulBlueprint(blueprint),
        generateNewBlueprint: (userId: string) => this.generateNewBlueprint(userId),
        analyzeBlueprint: (blueprint: SoulBlueprint) => this.analyzeBlueprint(blueprint)
      },
      FrequencyAnalyzer: {
        analyzeChakraSignature: (signature: number[]) => this.analyzeChakraSignature(signature),
        getElementalResonance: (frequency: number) => this.getElementalResonance(frequency),
        harmonizeFrequencies: (frequencies: number[]) => this.harmonizeFrequencies(frequencies)
      },
      Component: () => SoulBlueprintEditor
    };
  }

  // Soul Blueprint CRUD operations
  private async getSoulBlueprint(userId: string): Promise<SoulBlueprint | null> {
    try {
      const { data, error } = await this.supabase.client
        .from('sacred_blueprints')
        .select('*')
        .eq('user_id', userId)
        .single();

      if (error) {
        if (error.code === 'PGRST116') { // No rows returned
          // User doesn't have a blueprint yet
          return null;
        }
        throw error;
      }

      // Log the retrieved blueprint for debugging
      console.log('[SoulBlueprintingModule] Retrieved blueprint:', data);
      return data;
    } catch (error) {
      console.error('[SoulBlueprintingModule] Error fetching blueprint:', error);
      this.geh.publish({
        type: 'module:soul-blueprinting:error',
        sourceId: this.manifest.id,
        timestamp: new Date().toISOString(),
        payload: { error: (error as Error).message, operation: 'getSoulBlueprint' },
        metadata: { userId },
        essenceLabels: ['error:database', 'soul:blueprint', 'operation:read']
      });
      return null;
    }
  }

  private async saveSoulBlueprint(blueprint: Partial<SoulBlueprint>): Promise<SoulBlueprint | null> {
    try {
      const { user_id } = blueprint;
      
      if (!user_id) {
        throw new Error('User ID is required');
      }
      
      // Check if blueprint exists
      const existingBlueprint = await this.getSoulBlueprint(user_id);
      
      let operation: 'insert' | 'update' = existingBlueprint ? 'update' : 'insert';
      const now = new Date().toISOString();
      
      // Add updated_at timestamp
      const blueprintData = {
        ...blueprint,
        updated_at: now
      };
      
      // For insert, add created_at
      if (operation === 'insert') {
        blueprintData.created_at = now;
      }

      console.log(`[SoulBlueprintingModule] ${operation === 'insert' ? 'Inserting' : 'Updating'} blueprint:`, blueprintData);

      const { data, error } = await this.supabase.client
        .from('sacred_blueprints')
        .upsert(blueprintData, { 
          onConflict: 'user_id',
          returning: 'representation'
        });

      if (error) throw error;

      console.log('[SoulBlueprintingModule] Save blueprint result:', data);

      this.geh.publish({
        type: `module:soul-blueprinting:blueprint:${operation}d`,
        sourceId: this.manifest.id,
        timestamp: new Date().toISOString(),
        payload: { 
          userId: user_id, 
          operation,
          blueprintId: data?.[0]?.id
        },
        metadata: { frequency: blueprint.core_frequency },
        essenceLabels: ['soul:blueprint', `operation:${operation}`, 'consciousness:evolution']
      });

      return data?.[0] || null;
    } catch (error) {
      console.error('[SoulBlueprintingModule] Error saving blueprint:', error);
      this.geh.publish({
        type: 'module:soul-blueprinting:error',
        sourceId: this.manifest.id,
        timestamp: new Date().toISOString(),
        payload: { error: (error as Error).message, operation: 'saveSoulBlueprint' },
        metadata: { userId: blueprint.user_id },
        essenceLabels: ['error:database', 'soul:blueprint', 'operation:save']
      });
      return null;
    }
  }

  private async generateNewBlueprint(userId: string): Promise<SoulBlueprint> {
    // Default values for a new soul blueprint
    const defaultBlueprint: Partial<SoulBlueprint> = {
      user_id: userId,
      core_frequency: 639, // Love frequency (528) with higher harmonic
      elemental_resonance: 'water',
      chakra_signature: [60, 70, 65, 85, 75, 80, 65], // Root to Crown
      emotional_profile: 'balanced',
      shadow_frequencies: 'minimal',
      blueprint_text: {
        mission: 'To explore consciousness and expand awareness',
        strengths: ['intuition', 'compassion', 'creativity'],
        challenges: ['focus', 'grounding'],
        evolution_path: 'heart-centered consciousness expansion'
      },
      astrological_synthesis: 'Solar-lunar balance with third eye emphasis'
    };

    console.log('[SoulBlueprintingModule] Generating new blueprint for user:', userId);
    const savedBlueprint = await this.saveSoulBlueprint(defaultBlueprint);
    
    this.geh.publish({
      type: 'module:soul-blueprinting:blueprint:generated',
      sourceId: this.manifest.id,
      timestamp: new Date().toISOString(),
      payload: { userId, blueprintId: savedBlueprint?.id },
      metadata: { frequency: defaultBlueprint.core_frequency },
      essenceLabels: ['soul:blueprint', 'generation:new', 'consciousness:inception']
    });

    return savedBlueprint || defaultBlueprint as SoulBlueprint;
  }

  // Analysis and utilities
  private analyzeBlueprint(blueprint: SoulBlueprint): Record<string, any> {
    // Placeholder for complex blueprint analysis
    const dominantChakras = this.getDominantChakras(blueprint.chakra_signature);
    const frequencyHarmony = this.calculateFrequencyHarmony(blueprint.core_frequency);
    
    return {
      dominantChakras,
      frequencyHarmony,
      elementalAlignment: blueprint.elemental_resonance,
      evolution_level: this.calculateEvolutionLevel(blueprint),
      consciousness_pattern: this.determineConsciousnessPattern(blueprint)
    };
  }

  private analyzeChakraSignature(signature: number[]): Record<string, any> {
    const chakraNames = ['Root', 'Sacral', 'Solar Plexus', 'Heart', 'Throat', 'Third Eye', 'Crown'];
    const analysis: Record<string, any> = {};
    
    // Calculate balance
    const avg = signature.reduce((sum, val) => sum + val, 0) / signature.length;
    const deviation = Math.sqrt(signature.reduce((sum, val) => sum + Math.pow(val - avg, 2), 0) / signature.length);
    
    analysis.balance = deviation < 10 ? 'highly balanced' : deviation < 20 ? 'moderately balanced' : 'imbalanced';
    
    // Identify strongest and weakest
    const max = Math.max(...signature);
    const min = Math.min(...signature);
    analysis.dominant = chakraNames[signature.indexOf(max)];
    analysis.recessive = chakraNames[signature.indexOf(min)];
    
    // Suggest focus areas
    analysis.focusAreas = signature
      .map((val, i) => ({ chakra: chakraNames[i], value: val }))
      .filter(c => c.value < avg)
      .map(c => c.chakra);
    
    return analysis;
  }
  
  private getElementalResonance(frequency: number): string {
    // Map frequencies to elemental resonances
    if (frequency < 396) return 'earth';
    if (frequency < 528) return 'water';
    if (frequency < 741) return 'fire';
    return 'air';
  }
  
  private harmonizeFrequencies(frequencies: number[]): number[] {
    // Placeholder for frequency harmonization algorithm
    // In a real implementation, this would apply sacred geometry principles
    return frequencies.map(f => Math.round(f * 1.618) / 1.618); // Golden ratio adjustment
  }

  private getDominantChakras(signature: number[]): string[] {
    const chakraNames = ['Root', 'Sacral', 'Solar Plexus', 'Heart', 'Throat', 'Third Eye', 'Crown'];
    const avg = signature.reduce((sum, val) => sum + val, 0) / signature.length;
    
    // Get chakras with above average energy
    return signature
      .map((val, i) => ({ chakra: chakraNames[i], value: val }))
      .filter(c => c.value > avg + 5)
      .map(c => c.chakra);
  }
  
  private calculateFrequencyHarmony(frequency: number): number {
    // Check how close the frequency is to sacred frequencies
    const sacredFrequencies = [396, 417, 528, 639, 741, 852, 963];
    const closestFreq = sacredFrequencies.reduce((prev, curr) => 
      Math.abs(curr - frequency) < Math.abs(prev - frequency) ? curr : prev
    );
    
    const deviation = Math.abs(frequency - closestFreq);
    return Math.max(0, 100 - (deviation * 5)); // 0-100 scale
  }
  
  private calculateEvolutionLevel(blueprint: SoulBlueprint): number {
    // Calculate evolutionary level based on various factors
    const chakraBalance = this.getChakraBalance(blueprint.chakra_signature);
    const frequencyAlignment = this.calculateFrequencyHarmony(blueprint.core_frequency);
    const emotionalFactor = blueprint.emotional_profile === 'balanced' ? 100 : 
                            blueprint.emotional_profile === 'evolving' ? 75 : 50;
    
    return Math.round((chakraBalance + frequencyAlignment + emotionalFactor) / 3);
  }
  
  private getChakraBalance(signature: number[]): number {
    const avg = signature.reduce((sum, val) => sum + val, 0) / signature.length;
    const deviation = Math.sqrt(signature.reduce((sum, val) => sum + Math.pow(val - avg, 2), 0) / signature.length);
    
    // Higher score for more balanced chakras (less deviation)
    return Math.max(0, 100 - (deviation * 2));
  }
  
  private determineConsciousnessPattern(blueprint: SoulBlueprint): string {
    const dominantChakras = this.getDominantChakras(blueprint.chakra_signature);
    
    if (dominantChakras.includes('Crown') && dominantChakras.includes('Third Eye')) {
      return 'Cosmic Awareness';
    } else if (dominantChakras.includes('Heart') && dominantChakras.includes('Throat')) {
      return 'Compassionate Communicator';
    } else if (dominantChakras.includes('Solar Plexus') && dominantChakras.includes('Sacral')) {
      return 'Creative Power';
    } else if (dominantChakras.includes('Root') && dominantChakras.includes('Solar Plexus')) {
      return 'Grounded Warrior';
    } else if (dominantChakras.includes('Heart')) {
      return 'Heart-Centered Being';
    } else if (dominantChakras.includes('Third Eye')) {
      return 'Visionary Seer';
    } else {
      return 'Balanced Explorer';
    }
  }
}
