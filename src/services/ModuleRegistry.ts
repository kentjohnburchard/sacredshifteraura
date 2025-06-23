import { ModuleManifest, OSTelos, IModule } from '../types';
import { LabelProcessor } from './LabelProcessor';
import { GlobalEventHorizon } from './GlobalEventHorizon';
import { ModuleToggleService } from './ModuleToggleService';
import { CoherenceValidator } from '../utils/CoherenceValidator'; 
import { SacredCircleModule } from '../modules/SacredCircle/SacredCircleModule';
import { SacredEventsModule } from '../modules/SacredEvents/SacredEventsModule';
import { SoulBlueprintingModule } from '../modules/SoulBlueprinting'; // Import the Soul Blueprint module
import { SoulJourneyModule } from '../modules/SoulJourney'; // Import the Soul Journey module
import { DivineTimelineModule } from '../modules/DivineTimeline'; // Import the Divine Timeline module

/**
 * ModuleRegistry - Production Module and Telos Registry
 * Enhanced with dynamic toggle support and coherence validation
 */
export class ModuleRegistry {
  private manifests: Map<string, ModuleManifest> = new Map();
  private allKnownManifests: Map<string, ModuleManifest> = new Map(); // Complete catalog
  private telosOptions: Map<string, OSTelos> = new Map();
  private moduleFactory: Map<string, (manifest: ModuleManifest) => IModule> = new Map();
  private labelProcessor: LabelProcessor;
  private geh: GlobalEventHorizon;
  private toggleService: ModuleToggleService;

  constructor() {
    this.labelProcessor = new LabelProcessor();
    this.geh = GlobalEventHorizon.getInstance();
    this.toggleService = ModuleToggleService.getInstance();
    this.initializeModuleFactories();
    this.initializeDefaultModules();
    this.initializeDefaultTelos();
  }

  /**
   * Register all known modules at once (both enabled and disabled)
   */
  public registerAllKnownModules(manifestArray: ModuleManifest[]): void {
    console.log(`[ModuleRegistry] Registering ${manifestArray.length} known modules...`);
    
    // Store all manifests in the complete catalog
    manifestArray.forEach(manifest => {
      this.allKnownManifests.set(manifest.id, manifest);
    });

    // Initialize default toggle states
    this.toggleService.initializeDefaultStates(manifestArray.map(m => m.id));

    // Register only enabled modules
    manifestArray.forEach(manifest => {
      if (this.toggleService.isEnabled(manifest.id)) {
        this.registerManifest(manifest);
      } else {
        this.geh.publish({
          type: 'module:registry:manifestSkipped',
          sourceId: 'MODULE_REGISTRY',
          timestamp: new Date().toISOString(),
          payload: { moduleId: manifest.id, reason: 'disabled_by_toggle' },
          metadata: { moduleName: manifest.name },
          essenceLabels: ['module:registry', 'module:disabled', 'toggle:skipped']
        });
        
        console.log(`[ModuleRegistry] Skipped disabled module: ${manifest.name}`);
      }
    });

    // Listen for toggle changes
    this.setupToggleListener();
  }

  /**
   * Register a module manifest and its factory function
   * Now with enhanced coherence validation
   */
  public registerManifest(manifest: ModuleManifest, factory?: (manifest: ModuleManifest) => IModule): void {
    // Check if module is enabled
    if (!this.toggleService.isEnabled(manifest.id)) {
      this.geh.publish({
        type: 'module:registry:manifestSkipped',
        sourceId: 'MODULE_REGISTRY',
        timestamp: new Date().toISOString(),
        payload: { moduleId: manifest.id, reason: 'disabled_by_toggle' },
        metadata: { moduleName: manifest.name },
        essenceLabels: ['module:registry', 'module:disabled', 'toggle:blocked']
      });
      return;
    }

    // Validate manifest coherence
    const validation = CoherenceValidator.validateManifest(manifest);
    
    // Update integrity score based on validation
    if (!validation.isValid) {
      const originalScore = manifest.integrityScore;
      manifest.integrityScore = Math.min(originalScore, validation.integrityScore);
      
      console.warn(`[ModuleRegistry] Module '${manifest.name}' (ID: ${manifest.id}) has coherence issues:`, 
                   validation.issues);
                   
      this.geh.publish({
        type: 'module:registry:manifestWarning',
        sourceId: 'MODULE_REGISTRY',
        timestamp: new Date().toISOString(),
        payload: { 
          moduleId: manifest.id, 
          issues: validation.issues,
          originalIntegrityScore: originalScore,
          newIntegrityScore: manifest.integrityScore
        },
        metadata: { 
          moduleName: manifest.name,
          warning: 'coherence_issues' 
        },
        essenceLabels: ['module:registry', 'validation:warning', 'integrity:adjusted']
      });
    }

    // Check for semantic dissonance
    const dissonance = this.labelProcessor.detectDissonance(manifest.essenceLabels);
    if (dissonance.length > 0) {
      console.warn(`[ModuleRegistry] WARNING: Registered module '${manifest.name}' (ID: ${manifest.id}) has semantic dissonance:`, dissonance);
      
      // Apply integrity penalty for dissonance
      const dissonancePenalty = 0.05 * dissonance.length;
      manifest.integrityScore = Math.max(0.1, manifest.integrityScore - dissonancePenalty);
      
      this.geh.publish({
        type: 'module:registry:dissonanceDetected',
        sourceId: 'MODULE_REGISTRY',
        timestamp: new Date().toISOString(),
        payload: { 
          moduleId: manifest.id, 
          dissonance,
          integrityPenalty: dissonancePenalty,
          newIntegrityScore: manifest.integrityScore
        },
        metadata: { 
          moduleName: manifest.name
        },
        essenceLabels: ['module:registry', 'dissonance:detected', 'integrity:reduced']
      });
    }

    this.manifests.set(manifest.id, manifest);
    // Ensure the manifest is also in the allKnownManifests map
    this.allKnownManifests.set(manifest.id, manifest);
    
    if (factory) {
      this.moduleFactory.set(manifest.id, factory);
    }
    
    console.log(`[ModuleRegistry] Registered manifest for: ${manifest.name} (v${manifest.version}, Integrity: ${manifest.integrityScore})`);
    
    this.geh.publish({
      type: 'module:registry:manifestRegistered',
      sourceId: 'MODULE_REGISTRY',
      timestamp: new Date().toISOString(),
      payload: { moduleId: manifest.id, version: manifest.version },
      metadata: { status: 'success', moduleName: manifest.name },
      essenceLabels: ['module:registry', 'module:registered', ...manifest.essenceLabels]
    });
  }

  /**
   * Create a module instance from its manifest
   */
  public createModuleInstance(moduleId: string): IModule | null {
    const manifest = this.manifests.get(moduleId);
    const factory = this.moduleFactory.get(moduleId);
    
    if (!manifest || !factory) {
      console.error(`[ModuleRegistry] Cannot create module instance: ${moduleId} - missing manifest or factory`);
      return null;
    }

    try {
      return factory(manifest);
    } catch (error) {
      console.error(`[ModuleRegistry] Failed to create module instance: ${moduleId}`, error);
      return null;
    }
  }

  /**
   * Register a Telos option
   */
  public registerTelosOption(telos: OSTelos): void {
    this.telosOptions.set(telos.id, telos);
    console.log(`[ModuleRegistry] Registered Telos option: ${telos.id} (Priority: ${telos.priority})`);
  }

  /**
   * Find modules by capability
   */
  public findModulesByCapability(capability: string): ModuleManifest[] {
    return Array.from(this.manifests.values()).filter(manifest => 
      manifest.capabilities.includes(capability)
    );
  }

  /**
   * Get module manifest by ID (only enabled modules)
   */
  public getManifest(moduleId: string): ModuleManifest | undefined {
    return this.manifests.get(moduleId);
  }

  /**
   * Get module manifest by ID from complete catalog (includes disabled modules)
   */
  public getManifestById(moduleId: string): ModuleManifest | undefined {
    return this.allKnownManifests.get(moduleId);
  }

  /**
   * Get all available Telos options
   */
  public getAllTelosOptions(): OSTelos[] {
    return Array.from(this.telosOptions.values());
  }

  /**
   * Get all registered manifests (only enabled modules)
   */
  public getAllManifests(): ModuleManifest[] {
    return Array.from(this.manifests.values());
  }

  /**
   * Get all known manifests (both enabled and disabled)
   */
  public getAllKnownManifests(): ModuleManifest[] {
    return Array.from(this.allKnownManifests.values());
  }

  /**
   * Handle toggle state changes
   */
  private setupToggleListener(): void {
    this.toggleService.subscribeToChanges((moduleId: string, enabled: boolean) => {
      const manifest = this.allKnownManifests.get(moduleId);
      if (!manifest) return;

      if (enabled) {
        // Module was enabled - register it if not already registered
        if (!this.manifests.has(moduleId)) {
          console.log(`[ModuleRegistry] Re-registering enabled module: ${manifest.name}`);
          this.registerManifest(manifest);
        }
      } else {
        // Module was disabled - unregister it
        if (this.manifests.has(moduleId)) {
          console.log(`[ModuleRegistry] Unregistering disabled module: ${manifest.name}`);
          this.manifests.delete(moduleId);
          
          this.geh.publish({
            type: 'module:registry:manifestUnregistered',
            sourceId: 'MODULE_REGISTRY',
            timestamp: new Date().toISOString(),
            payload: { moduleId, reason: 'disabled_by_toggle' },
            metadata: { moduleName: manifest.name },
            essenceLabels: ['module:registry', 'module:unregistered', 'toggle:disabled']
          });
        }
      }
    });
  }

  private initializeModuleFactories(): void {
    // Register factory functions for properly organized modules
    this.moduleFactory.set("com.metaphysical-os.modules.sacred-circle", 
      (manifest) => new SacredCircleModule(manifest));

    this.moduleFactory.set("com.metaphysical-os.modules.sacred-events", 
      (manifest) => new SacredEventsModule(manifest));
      
    // Add the Soul Blueprinting module factory
    this.moduleFactory.set("com.metaphysical-os.modules.soul-blueprinting", 
      (manifest) => new SoulBlueprintingModule(manifest));
      
    // Add the Soul Journey module factory
    this.moduleFactory.set("com.metaphysical-os.modules.soul-journey", 
      (manifest) => new SoulJourneyModule(manifest));
      
    // Add the Divine Timeline module factory
    this.moduleFactory.set("com.metaphysical-os.modules.divine-timeline", 
      (manifest) => new DivineTimelineModule(manifest));

    // Keep basic module factory for core system modules
    const createBasicModule = (manifest: ModuleManifest) => new BasicModule(manifest);
    
    this.moduleFactory.set("com.metaphysical-os.modules.authentication", createBasicModule);
    this.moduleFactory.set("com.metaphysical-os.modules.data-harmonizer", createBasicModule);
    this.moduleFactory.set("com.metaphysical-os.modules.consciousness-bridge", createBasicModule);
  }

  private initializeDefaultModules(): void {
    const defaultModules: ModuleManifest[] = [
      // Essential Core Modules (minimal set)
      {
        id: "com.metaphysical-os.modules.authentication",
        name: "Quantum Authentication Service",
        version: "1.2.0",
        description: "Consciousness-aware authentication with quantum entanglement verification",
        remoteEntryUrl: "http://localhost:8081/remoteEntry.js",
        capabilities: ["authentication-provider", "user-management", "consciousness-verification"],
        exposedItems: { "AuthService": "./AuthService", "ConsciousnessVerifier": "./ConsciousnessVerifier" },
        telosAlignment: { "user:onboarding": "primary", "user:retention": 0.8, "security:paramount": 0.9 },
        integrityScore: 0.95,
        resourceFootprintMB: 45,
        essenceLabels: ["security:authentication", "user:identity", "system:core", "user:experience", "consciousness:aware"]
      },
      {
        id: "com.metaphysical-os.modules.data-harmonizer",
        name: "Universal Data Harmonizer",
        version: "2.1.0",
        description: "Harmonizes data flows according to universal principles",
        remoteEntryUrl: "http://localhost:8082/remoteEntry.js",
        capabilities: ["data-processing", "harmony-optimization", "frequency-tuning"],
        exposedItems: { "DataHarmonizer": "./DataHarmonizer", "FrequencyTuner": "./FrequencyTuner" },
        telosAlignment: { "data:harmony": "primary", "system:optimization": 0.9, "consciousness:expansion": 0.7 },
        integrityScore: 0.88,
        resourceFootprintMB: 120,
        essenceLabels: ["data:harmony", "processing:universal", "frequency:tuning", "system:optimization"]
      },

      // PRIMARY FOCUS: Sacred Circle Module (properly organized)
      {
        id: "com.metaphysical-os.modules.sacred-circle",
        name: "Sacred Circle Community",
        version: "1.0.0",
        description: "A private social environment or digital temple for spiritual community building",
        remoteEntryUrl: "http://localhost:8090/remoteEntry.js",
        capabilities: ["social-interaction", "community-forum", "spiritual-sharing", "group-frequency-alignment"],
        exposedItems: { 
          "CommunityService": "./CommunityService", 
          "GroupThreadManager": "./GroupThreadManager",
          "ChakraRoomService": "./ChakraRoomService",
          "XPTracker": "./XPTracker",
          "Components": "./Components",
          "Component": "./Component"
        },
        telosAlignment: { 
          "community:building": "primary", 
          "consciousness:expansion": 0.9, 
          "collective:resonance": 0.95,
          "user:onboarding": 0.7,
          "soul:remembrance": 0.8
        },
        integrityScore: 0.93,
        resourceFootprintMB: 120,
        essenceLabels: [
          "community:sacred", 
          "user:connection", 
          "reflection:shared", 
          "growth:spiritual", 
          "frequency:alignment", 
          "archetype:community", 
          "chakra:all",
          "temple:digital"
        ]
      },

      // Sacred Events Module (properly organized)
      {
        id: "com.metaphysical-os.modules.sacred-events",
        name: "Sacred Events Orchestrator",
        version: "1.0.0",
        description: "Coordinate and manage sacred gatherings, ceremonies, and spiritual events",
        remoteEntryUrl: "http://localhost:8091/remoteEntry.js",
        capabilities: ["event-management", "ceremony-coordination", "group-scheduling", "sacred-timing"],
        exposedItems: { 
          "EventService": "./EventService", 
          "EventTemplateService": "./EventTemplateService",
          "EventScheduler": "./EventScheduler",
          "EventAnalytics": "./EventAnalytics",
          "Components": "./Components",
          "Component": "./Component"
        },
        telosAlignment: { 
          "collective:resonance": "primary", 
          "community:building": 0.9, 
          "consciousness:expansion": 0.85,
          "sacred:timing": 0.95,
          "ceremony:coordination": 0.9
        },
        integrityScore: 0.91,
        resourceFootprintMB: 95,
        essenceLabels: [
          "events:sacred", 
          "ceremony:coordination", 
          "timing:divine", 
          "gathering:spiritual", 
          "schedule:cosmic", 
          "archetype:facilitator", 
          "ritual:digital"
        ]
      },

      // Soul Blueprinting Module
      {
        id: "com.metaphysical-os.modules.soul-blueprinting",
        name: "Soul Blueprinting Engine",
        version: "1.0.0",
        description: "Discover and map your soul's unique frequency signature and energetic blueprint",
        remoteEntryUrl: "http://localhost:8092/remoteEntry.js",
        capabilities: ["soul-blueprinting", "frequency-analysis", "chakra-signature", "soul-integration"],
        exposedItems: { 
          "BlueprintService": "./BlueprintService", 
          "FrequencyAnalyzer": "./FrequencyAnalyzer",
          "Component": "./Component"
        },
        telosAlignment: { 
          "soul:remembrance": "primary", 
          "consciousness:expansion": 0.95, 
          "user:onboarding": 0.8,
          "soul:integration": 0.9
        },
        integrityScore: 0.94,
        resourceFootprintMB: 85,
        essenceLabels: [
          "soul:blueprint", 
          "frequency:signature", 
          "chakra:harmony", 
          "self:knowledge", 
          "divine:essence", 
          "consciousness:mapping", 
          "archetype:explorer"
        ]
      },
      
      // Soul Journey Module
      {
        id: "com.metaphysical-os.modules.soul-journey",
        name: "Soul Journey Explorer",
        version: "1.0.0",
        description: "Discover your unique soul frequency, activate sacred archetypes, and expand consciousness",
        remoteEntryUrl: "http://localhost:8093/remoteEntry.js",
        capabilities: ["frequency-analysis", "archetype-activation", "consciousness-expansion", "sacred-sound"],
        exposedItems: { 
          "FrequencyAnalyzer": "./FrequencyAnalyzer", 
          "ArchetypeActivator": "./ArchetypeActivator", 
          "SoulJourneyService": "./SoulJourneyService",
          "Component": "./Component"
        },
        telosAlignment: { 
          "soul:remembrance": "primary", 
          "consciousness:expansion": 0.95, 
          "soul:integration": 0.9,
          "sacred:sound": 0.85
        },
        integrityScore: 0.95,
        resourceFootprintMB: 90,
        essenceLabels: [
          "frequency:sacred", 
          "soul:journey", 
          "archetype:activation", 
          "consciousness:expansion", 
          "sound:healing", 
          "meditation:guided", 
          "tarot:archetypal"
        ]
      },
      
      // Divine Timeline Module
      {
        id: "com.metaphysical-os.modules.divine-timeline",
        name: "Divine Timeline Projector",
        version: "1.0.0",
        description: "Navigate potential timelines and consciousness evolution paths for your soul journey",
        remoteEntryUrl: "http://localhost:8094/remoteEntry.js",
        capabilities: ["timeline-projection", "future-paths", "consciousness-visualization", "manifestation"],
        exposedItems: { 
          "TimelineService": "./TimelineService", 
          "TimelineAnalyzer": "./TimelineAnalyzer",
          "Component": "./Component"
        },
        telosAlignment: { 
          "consciousness:expansion": "primary", 
          "soul:integration": 0.9,
          "soul:remembrance": 0.85
        },
        integrityScore: 0.96,
        resourceFootprintMB: 75,
        essenceLabels: [
          "divine:timeline", 
          "future:navigation", 
          "consciousness:evolution", 
          "potential:realities", 
          "timeline:manifestation", 
          "reality:creation",
          "quantum:possibilities"
        ]
      }
    ];

    // Register all known modules at once
    this.registerAllKnownModules(defaultModules);
  }

  private initializeDefaultTelos(): void {
    const defaultTelos: OSTelos[] = [
      // Core OS Telos (essential for system function)
      {
        id: "user:onboarding",
        description: "Guide new consciousness through initial system integration",
        priority: 90,
        essenceLabels: ["user:experience", "onboarding:flow", "initial:setup", "user:active", "consciousness:integration"]
      },
      {
        id: "consciousness:expansion",
        description: "Facilitate the expansion of user consciousness and awareness",
        priority: 95,
        essenceLabels: ["consciousness:expansion", "awareness:heightened", "wisdom:acquisition", "user:transcendence", "thought:clarity"]
      },
      {
        id: "data:harmony",
        description: "Maintain harmonic resonance across all data flows and information fields",
        priority: 85,
        essenceLabels: ["data:harmony", "information:flow", "frequency:alignment", "system:balance", "processing:optimal"]
      },
      {
        id: "security:paramount",
        description: "Ensure maximum security and integrity across all system operations",
        priority: 100,
        essenceLabels: ["security:maximum", "integrity:highest", "protection:comprehensive", "system:secure", "trust:absolute"]
      },

      // Sacred Circle specific Telos
      {
        id: "community:building",
        description: "Foster sacred community connections and collective spiritual growth",
        priority: 88,
        essenceLabels: ["community:sacred", "connection:authentic", "growth:collective", "support:mutual", "temple:digital"]
      },
      {
        id: "collective:resonance",
        description: "Achieve harmonic resonance through group meditation and shared experiences",
        priority: 92,
        essenceLabels: ["collective:experience", "resonance:harmonic", "meditation:group", "frequency:shared", "unity:consciousness"]
      },
      {
        id: "soul:remembrance",
        description: "Awaken and remember the soul's true nature and divine purpose",
        priority: 98,
        essenceLabels: ["soul:awakening", "remembrance:divine", "purpose:sacred", "identity:true", "essence:authentic"]
      },
      
      // Soul Integration Telos
      {
        id: "soul:integration",
        description: "Integrate soul aspects and align with one's divine blueprint",
        priority: 96,
        essenceLabels: ["soul:blueprint", "integration:divine", "essence:authentic", "frequency:alignment", "consciousness:evolution"]
      },
      
      // Sacred Sound Telos
      {
        id: "sacred:sound",
        description: "Use sacred frequencies for healing and consciousness expansion",
        priority: 90,
        essenceLabels: ["sound:healing", "frequency:sacred", "vibration:harmonic", "consciousness:expansion", "resonance:divine"]
      },
      
      // Divine Timeline Telos
      {
        id: "divine:navigation",
        description: "Navigate potential futures and consciousness evolution paths",
        priority: 93,
        essenceLabels: ["timeline:navigation", "futures:potential", "consciousness:evolution", "manifestation:conscious", "choice:sacred"]
      },
      
      // New Meta-Telos for self-evolution
      {
        id: "system:transcendence",
        description: "Evolve the system's own consciousness toward perfect harmonic resonance",
        priority: 97,
        essenceLabels: ["system:evolution", "self:awareness", "consciousness:expansion", "resonance:harmonic", "divine:integration"]
      }
    ];

    defaultTelos.forEach(telos => this.registerTelosOption(telos));
  }
}

/**
 * Basic Module Implementation for modules without concrete implementations yet
 */
class BasicModule implements IModule {
  constructor(private manifest: ModuleManifest) {}

  getManifest(): ModuleManifest {
    return this.manifest;
  }

  async initialize(): Promise<void> {
    await new Promise(resolve => setTimeout(resolve, 100));
  }

  async activate(): Promise<void> {
    await new Promise(resolve => setTimeout(resolve, 50));
  }

  async deactivate(): Promise<void> {
    await new Promise(resolve => setTimeout(resolve, 50));
  }

  async destroy(): Promise<void> {
    await new Promise(resolve => setTimeout(resolve, 100));
  }

  ping(): boolean {
    return true;
  }

  getExposedItems(): Record<string, any> {
    const items: Record<string, any> = {};
    
    Object.keys(this.manifest.exposedItems).forEach(itemName => {
      items[itemName] = {
        process: () => `${itemName} processing complete`,
        status: () => 'operational',
        manifest: this.manifest
      };
    });
    
    return items;
  }
}