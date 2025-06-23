import { IModule, ModuleManifest, GESemanticEvent } from '../../types';
import { GlobalEventHorizon } from '../../services/GlobalEventHorizon';
import { SupabaseService } from '../../services/SupabaseService';
import { DivineTimelineExplorer } from './components/DivineTimelineExplorer';

export interface TimelineNode {
  id: string;
  user_id?: string;
  title: string;
  description: string;
  timeline_position: 'past' | 'present' | 'future';
  probability: number;
  consciousness_level: number;
  chakra_focus: string;
  time_distance: number; // Days from present (negative=past, 0=present, positive=future)
  guidance?: string;
  parent_node_id?: string;
  is_pivot_point: boolean;
  is_activated: boolean;
  created_at?: string;
}

export interface TimelinePath {
  id: string;
  user_id?: string;
  title: string;
  description: string;
  nodes: string[];
  probability: number;
  path_type: 'optimal' | 'challenge' | 'shadow' | 'transcendent';
  consciousness_delta: number;
  created_at?: string;
}

export interface TimelineReflection {
  id: string;
  user_id?: string;
  node_id: string;
  reflection_text: string;
  consciousness_shift: number;
  created_at?: string;
}

export interface TimelineActivation {
  id: string;
  user_id?: string;
  node_id: string;
  activation_type: 'intention' | 'meditation' | 'synchronicity' | 'insight';
  activation_details: string;
  created_at?: string;
}

export class DivineTimelineModule implements IModule {
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
      type: 'module:divine-timeline:initializing',
      sourceId: this.manifest.id,
      timestamp: new Date().toISOString(),
      payload: { status: 'starting' },
      metadata: { moduleName: this.manifest.name },
      essenceLabels: ['module:initialization', 'divine:timeline', 'future:projection']
    });
    
    this.isInitialized = true;

    this.geh.publish({
      type: 'module:divine-timeline:initialized',
      sourceId: this.manifest.id,
      timestamp: new Date().toISOString(),
      payload: { status: 'ready' },
      metadata: { moduleName: this.manifest.name },
      essenceLabels: ['module:ready', 'divine:timeline', 'future:navigation']
    });
  }

  async activate(): Promise<void> {
    if (!this.isInitialized) {
      throw new Error('Module must be initialized before activation');
    }

    this.isActive = true;

    this.geh.publish({
      type: 'module:divine-timeline:activated',
      sourceId: this.manifest.id,
      timestamp: new Date().toISOString(),
      payload: { status: 'active', features: ['timeline-projection', 'future-paths', 'consciousness-visualization'] },
      metadata: { moduleName: this.manifest.name },
      essenceLabels: ['module:active', 'divine:timeline', 'future:accessible']
    });
  }

  async deactivate(): Promise<void> {
    this.isActive = false;

    this.geh.publish({
      type: 'module:divine-timeline:deactivated',
      sourceId: this.manifest.id,
      timestamp: new Date().toISOString(),
      payload: { status: 'dormant' },
      metadata: { moduleName: this.manifest.name },
      essenceLabels: ['module:dormant', 'divine:timeline', 'future:paused']
    });
  }

  async destroy(): Promise<void> {
    this.isActive = false;
    this.isInitialized = false;

    this.geh.publish({
      type: 'module:divine-timeline:destroyed',
      sourceId: this.manifest.id,
      timestamp: new Date().toISOString(),
      payload: { status: 'destroyed' },
      metadata: { moduleName: this.manifest.name },
      essenceLabels: ['module:destroyed', 'divine:timeline', 'resources:released']
    });
  }

  ping(): boolean {
    return this.isActive;
  }

  getExposedItems(): Record<string, any> {
    return {
      TimelineService: {
        generateTimeline: (userId: string) => this.generateTimeline(userId),
        getTimelineNodes: (userId: string) => this.getTimelineNodes(userId),
        getTimelinePaths: (userId: string) => this.getTimelinePaths(userId),
        activateTimelineNode: (userId: string, nodeId: string, activationType: string, details: string) => 
          this.activateTimelineNode(userId, nodeId, activationType, details),
        addReflection: (userId: string, nodeId: string, text: string) => 
          this.addReflection(userId, nodeId, text),
        getReflections: (userId: string, nodeId?: string) => 
          this.getReflections(userId, nodeId),
        getNodeActivations: (userId: string, nodeId: string) => 
          this.getNodeActivations(userId, nodeId)
      },
      TimelineAnalyzer: {
        analyzeConsciousnessTrends: (userId: string) => this.analyzeConsciousnessTrends(userId),
        calculateProbability: (userId: string, nodeId: string) => this.calculateProbability(userId, nodeId),
        getPotentialOutcomes: (userId: string, nodeId: string) => this.getPotentialOutcomes(userId, nodeId)
      },
      // Expose React component
      Component: () => DivineTimelineExplorer
    };
  }

  private async generateTimeline(userId: string): Promise<{ nodes: TimelineNode[], paths: TimelinePath[] }> {
    try {
      // First, check if user already has a timeline
      const existingNodes = await this.getTimelineNodes(userId);
      if (existingNodes.length > 0) {
        const existingPaths = await this.getTimelinePaths(userId);
        return { nodes: existingNodes, paths: existingPaths };
      }
      
      // Generate new timeline nodes and paths
      const newNodes = await this.createTimelineNodes(userId);
      const newPaths = await this.createTimelinePaths(userId, newNodes);
      
      return { nodes: newNodes, paths: newPaths };
    } catch (error) {
      console.error('[DivineTimelineModule] Failed to generate timeline:', error);
      return { nodes: [], paths: [] };
    }
  }
  
  private async createTimelineNodes(userId: string): Promise<TimelineNode[]> {
    // Generate nodes for past, present, and future
    const nodes: Partial<TimelineNode>[] = [
      // Present node (always at center)
      {
        user_id: userId,
        title: 'Current Awareness',
        description: 'Your present state of consciousness and spiritual awareness',
        timeline_position: 'present',
        probability: 100,
        consciousness_level: 50,
        chakra_focus: 'heart',
        time_distance: 0,
        is_pivot_point: true,
        is_activated: true
      },
      
      // Past nodes
      {
        user_id: userId,
        title: 'Spiritual Awakening',
        description: 'The initial call to your spiritual journey that opened your awareness',
        timeline_position: 'past',
        probability: 100,
        consciousness_level: 30,
        chakra_focus: 'third_eye',
        time_distance: -90, // 3 months ago
        is_pivot_point: true,
        is_activated: true
      },
      {
        user_id: userId,
        title: 'Heart Opening',
        description: 'A significant emotional healing that expanded your capacity for compassion',
        timeline_position: 'past',
        probability: 100,
        consciousness_level: 40,
        chakra_focus: 'heart',
        time_distance: -30, // 1 month ago
        is_pivot_point: false,
        is_activated: true
      },
      
      // Future nodes - optimal path
      {
        user_id: userId,
        title: 'Sacred Integration',
        description: 'Integration of spiritual insights into daily consciousness',
        timeline_position: 'future',
        probability: 85,
        consciousness_level: 60,
        chakra_focus: 'solar',
        time_distance: 30, // 1 month ahead
        guidance: 'Focus on grounding spiritual insights through daily practice and journaling',
        is_pivot_point: false,
        is_activated: false
      },
      {
        user_id: userId,
        title: 'Higher Self Connection',
        description: 'Establishing a clear channel to your higher self guidance',
        timeline_position: 'future',
        probability: 70,
        consciousness_level: 75,
        chakra_focus: 'crown',
        time_distance: 90, // 3 months ahead
        guidance: 'Develop a meditation practice focused on crown chakra activation and higher self communication',
        is_pivot_point: true,
        is_activated: false
      },
      {
        user_id: userId,
        title: 'Divine Purpose Activation',
        description: 'Clear recognition and embodiment of your divine purpose',
        timeline_position: 'future',
        probability: 60,
        consciousness_level: 85,
        chakra_focus: 'throat',
        time_distance: 180, // 6 months ahead
        guidance: 'Begin expressing your unique gifts and truth through service to others',
        is_pivot_point: false,
        is_activated: false
      },
      
      // Challenge path nodes
      {
        user_id: userId,
        title: 'Shadow Integration',
        description: 'Confronting and integrating shadow aspects of yourself',
        timeline_position: 'future',
        probability: 50,
        consciousness_level: 65,
        chakra_focus: 'sacral',
        time_distance: 45, // 1.5 months ahead
        guidance: 'Be willing to face uncomfortable emotions and patterns with compassion',
        is_pivot_point: true,
        is_activated: false
      },
      {
        user_id: userId,
        title: 'Spiritual Test',
        description: 'A challenging situation that tests your spiritual growth and commitment',
        timeline_position: 'future',
        probability: 40,
        consciousness_level: 70,
        chakra_focus: 'solar',
        time_distance: 120, // 4 months ahead
        guidance: 'Remember to maintain your practice during difficult times; this is when it\'s most important',
        is_pivot_point: false,
        is_activated: false
      },
      
      // Transcendent path nodes
      {
        user_id: userId,
        title: 'Kundalini Awakening',
        description: 'Activation of the kundalini energy and rapid consciousness expansion',
        timeline_position: 'future',
        probability: 30,
        consciousness_level: 90,
        chakra_focus: 'crown',
        time_distance: 270, // 9 months ahead
        guidance: 'Prepare your energetic system through purification practices and proper grounding',
        is_pivot_point: true,
        is_activated: false
      },
      {
        user_id: userId,
        title: 'Cosmic Consciousness',
        description: 'Expansion into unity consciousness and cosmic awareness',
        timeline_position: 'future',
        probability: 20,
        consciousness_level: 95,
        chakra_focus: 'crown',
        time_distance: 365, // 1 year ahead
        guidance: 'Balance expanded awareness with practical grounding and embodiment',
        is_pivot_point: false,
        is_activated: false
      }
    ];
    
    // Create nodes in the database
    const createdNodes: TimelineNode[] = [];
    
    for (const node of nodes) {
      const { data, error } = await this.supabase.client
        .from('timeline_nodes')
        .insert(node)
        .select()
        .single();
      
      if (error) {
        console.error('[DivineTimelineModule] Error creating node:', error);
        continue;
      }
      
      createdNodes.push(data);
      
      // Publish event for node creation
      this.geh.publish({
        type: 'divine:timeline:node:created',
        sourceId: this.manifest.id,
        timestamp: new Date().toISOString(),
        payload: {
          nodeId: data.id,
          title: data.title,
          position: data.timeline_position
        },
        metadata: {
          userId
        },
        essenceLabels: ['divine:timeline', 'node:creation', 'consciousness:mapping']
      });
    }
    
    return createdNodes;
  }
  
  private async createTimelinePaths(userId: string, nodes: TimelineNode[]): Promise<TimelinePath[]> {
    // Create paths between nodes
    const presentNode = nodes.find(n => n.timeline_position === 'present');
    if (!presentNode) return [];
    
    // Organize by position and find key nodes
    const futureNodes = nodes.filter(n => n.timeline_position === 'future');
    const optimalPath = futureNodes.filter(n => n.probability >= 60);
    const challengePath = futureNodes.filter(n => n.probability < 60 && n.probability >= 40);
    const transcendentPath = futureNodes.filter(n => n.probability < 40);
    
    // Create path objects
    const paths: Partial<TimelinePath>[] = [
      {
        user_id: userId,
        title: 'Optimal Evolution',
        description: 'The most balanced path for your consciousness evolution with steady growth',
        nodes: [presentNode.id, ...optimalPath.map(n => n.id)],
        probability: 70,
        path_type: 'optimal',
        consciousness_delta: 35 // From 50 to 85
      },
      {
        user_id: userId,
        title: 'Shadow Integration',
        description: 'A challenging but transformative path requiring deep shadow work',
        nodes: [presentNode.id, ...challengePath.map(n => n.id)],
        probability: 45,
        path_type: 'challenge',
        consciousness_delta: 20 // From 50 to 70
      }
    ];
    
    // Add transcendent path if there are nodes for it
    if (transcendentPath.length > 0) {
      paths.push({
        user_id: userId,
        title: 'Cosmic Awakening',
        description: 'A rare and profound path leading to extraordinary expansion of consciousness',
        nodes: [presentNode.id, ...transcendentPath.map(n => n.id)],
        probability: 25,
        path_type: 'transcendent',
        consciousness_delta: 45 // From 50 to 95
      });
    }
    
    // Insert paths into database
    const createdPaths: TimelinePath[] = [];
    
    for (const path of paths) {
      const { data, error } = await this.supabase.client
        .from('timeline_paths')
        .insert(path)
        .select()
        .single();
      
      if (error) {
        console.error('[DivineTimelineModule] Error creating path:', error);
        continue;
      }
      
      createdPaths.push(data);
      
      // Publish event for path creation
      this.geh.publish({
        type: 'divine:timeline:path:created',
        sourceId: this.manifest.id,
        timestamp: new Date().toISOString(),
        payload: {
          pathId: data.id,
          title: data.title,
          type: data.path_type
        },
        metadata: {
          userId
        },
        essenceLabels: ['divine:timeline', 'path:creation', 'future:navigation']
      });
    }
    
    return createdPaths;
  }

  private async getTimelineNodes(userId: string): Promise<TimelineNode[]> {
    try {
      const { data, error } = await this.supabase.client
        .from('timeline_nodes')
        .select('*')
        .eq('user_id', userId)
        .order('time_distance', { ascending: true });
      
      if (error) throw error;
      console.log('[DivineTimelineModule] Fetched timeline nodes:', data?.length || 0);
      
      return data || [];
    } catch (error) {
      console.error('[DivineTimelineModule] Failed to get timeline nodes:', error);
      return [];
    }
  }

  private async getTimelinePaths(userId: string): Promise<TimelinePath[]> {
    try {
      const { data, error } = await this.supabase.client
        .from('timeline_paths')
        .select('*')
        .eq('user_id', userId);
      
      if (error) throw error;
      console.log('[DivineTimelineModule] Fetched timeline paths:', data?.length || 0);
      
      return data || [];
    } catch (error) {
      console.error('[DivineTimelineModule] Failed to get timeline paths:', error);
      return [];
    }
  }

  private async activateTimelineNode(
    userId: string, 
    nodeId: string, 
    activationType: string,
    details: string
  ): Promise<TimelineActivation | null> {
    try {
      console.log(`[DivineTimelineModule] Activating timeline node: ${nodeId} (${activationType})`);
      
      // Create activation record
      const { data: activationData, error: activationError } = await this.supabase.client
        .from('timeline_activations')
        .insert({
          user_id: userId,
          node_id: nodeId,
          activation_type: activationType,
          activation_details: details
        })
        .select()
        .single();
      
      if (activationError) throw activationError;
      
      // Update node to activated state
      const { error: nodeError } = await this.supabase.client
        .from('timeline_nodes')
        .update({ is_activated: true })
        .eq('id', nodeId)
        .eq('user_id', userId);
      
      if (nodeError) throw nodeError;
      
      console.log('[DivineTimelineModule] Node activation completed successfully');
      
      // Publish activation event
      this.geh.publish({
        type: 'divine:timeline:node:activated',
        sourceId: this.manifest.id,
        timestamp: new Date().toISOString(),
        payload: {
          nodeId,
          activationType,
          userId
        },
        metadata: {},
        essenceLabels: ['divine:timeline', 'node:activation', 'consciousness:expansion']
      });
      
      return activationData;
    } catch (error) {
      console.error('[DivineTimelineModule] Failed to activate timeline node:', error);
      return null;
    }
  }

  private async addReflection(userId: string, nodeId: string, text: string): Promise<TimelineReflection | null> {
    try {
      console.log(`[DivineTimelineModule] Adding reflection for node: ${nodeId}`);
      
      // Calculate consciousness shift (simple simulation)
      const wordCount = text.split(' ').length;
      const consciousnessShift = Math.min(10, Math.max(1, Math.floor(wordCount / 20)));
      
      const { data, error } = await this.supabase.client
        .from('timeline_reflections')
        .insert({
          user_id: userId,
          node_id: nodeId,
          reflection_text: text,
          consciousness_shift: consciousnessShift
        })
        .select()
        .single();
      
      if (error) throw error;
      
      console.log('[DivineTimelineModule] Reflection added successfully:', data);
      
      // Publish reflection event
      this.geh.publish({
        type: 'divine:timeline:reflection:added',
        sourceId: this.manifest.id,
        timestamp: new Date().toISOString(),
        payload: {
          nodeId,
          userId,
          consciousnessShift
        },
        metadata: {},
        essenceLabels: ['divine:timeline', 'reflection:insight', 'consciousness:integration']
      });
      
      return data;
    } catch (error) {
      console.error('[DivineTimelineModule] Failed to add reflection:', error);
      return null;
    }
  }

  private async getReflections(userId: string, nodeId?: string): Promise<TimelineReflection[]> {
    try {
      let query = this.supabase.client
        .from('timeline_reflections')
        .select('*')
        .eq('user_id', userId);
      
      if (nodeId) {
        query = query.eq('node_id', nodeId);
      }
      
      const { data, error } = await query.order('created_at', { ascending: false });
      
      if (error) throw error;
      
      console.log(`[DivineTimelineModule] Fetched ${data?.length || 0} reflections`);
      return data || [];
    } catch (error) {
      console.error('[DivineTimelineModule] Failed to get reflections:', error);
      return [];
    }
  }

  private async getNodeActivations(userId: string, nodeId: string): Promise<TimelineActivation[]> {
    try {
      const { data, error } = await this.supabase.client
        .from('timeline_activations')
        .select('*')
        .eq('user_id', userId)
        .eq('node_id', nodeId)
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      
      return data || [];
    } catch (error) {
      console.error('[DivineTimelineModule] Failed to get node activations:', error);
      return [];
    }
  }
  
  // Analysis methods
  private async analyzeConsciousnessTrends(userId: string): Promise<any> {
    try {
      // Get all activated nodes
      const { data: nodes, error: nodesError } = await this.supabase.client
        .from('timeline_nodes')
        .select('*')
        .eq('user_id', userId)
        .eq('is_activated', true)
        .order('time_distance', { ascending: true });
      
      if (nodesError) throw nodesError;
      
      // Get all reflections
      const { data: reflections, error: reflectionsError } = await this.supabase.client
        .from('timeline_reflections')
        .select('*')
        .eq('user_id', userId);
      
      if (reflectionsError) throw reflectionsError;
      
      // Simple trend analysis
      const consciousnessLevels = nodes.map((node: TimelineNode) => node.consciousness_level);
      const totalReflectionShift = reflections.reduce((sum: number, r: TimelineReflection) => sum + r.consciousness_shift, 0);
      const averageLevel = consciousnessLevels.reduce((sum: number, level: number) => sum + level, 0) / 
        (consciousnessLevels.length || 1);
      
      const nodeDates = nodes.map((node: TimelineNode) => {
        const date = new Date();
        date.setDate(date.getDate() + node.time_distance);
        return date.toISOString().split('T')[0];
      });
      
      return {
        consciousnessLevels,
        nodeDates,
        averageLevel,
        totalReflectionShift,
        reflectionsCount: reflections.length,
        activatedNodesCount: nodes.length,
        trend: consciousnessLevels.length > 1 ? 
          (consciousnessLevels[consciousnessLevels.length - 1] - consciousnessLevels[0]) : 0
      };
    } catch (error) {
      console.error('[DivineTimelineModule] Failed to analyze consciousness trends:', error);
      return {};
    }
  }
  
  private async calculateProbability(userId: string, nodeId: string): Promise<number> {
    try {
      // Get the node
      const { data: node, error: nodeError } = await this.supabase.client
        .from('timeline_nodes')
        .select('*')
        .eq('id', nodeId)
        .single();
      
      if (nodeError) throw nodeError;
      
      // This is a simplified probability calculation
      // In a real implementation, we would consider many factors
      
      // Get related activations
      const { data: activations, error: activationsError } = await this.supabase.client
        .from('timeline_activations')
        .select('*')
        .eq('user_id', userId);
      
      if (activationsError) throw activationsError;
      
      // More activations generally increase probability
      const activationBoost = Math.min(15, activations.length * 2);
      
      // Adjust probability based on activations
      let adjustedProbability = node.probability + activationBoost;
      
      // Cap at 95% - future is never 100% certain
      adjustedProbability = Math.min(95, adjustedProbability);
      
      return adjustedProbability;
    } catch (error) {
      console.error('[DivineTimelineModule] Failed to calculate probability:', error);
      return 0;
    }
  }
  
  private async getPotentialOutcomes(userId: string, nodeId: string): Promise<any[]> {
    // This would find potential branches from this node
    // Simplified implementation for demo purposes
    return [
      {
        title: "Spiritual Integration",
        probability: 75,
        consciousness_increase: 15,
        description: "Deeply integrate this insight into your daily awareness"
      },
      {
        title: "Accelerated Growth",
        probability: 45,
        consciousness_increase: 25,
        description: "Experience rapid expansion but with potential challenges"
      },
      {
        title: "Gentle Evolution",
        probability: 85,
        consciousness_increase: 10,
        description: "Steady, balanced growth with minimal disruption"
      }
    ];
  }
}
