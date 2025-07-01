import { IModule, ModuleManifest, GESemanticEvent } from '../../types';
import { GlobalEventHorizon } from '../../services/GlobalEventHorizon';
import { SupabaseService } from '../../services/SupabaseService';
import { UnityEngineExplorer } from './components/UnityEngineExplorer';

export interface VisionNode {
  id: string;
  user_id: string;
  title: string;
  description?: string;
  frequency_hz: number;
  chakra_alignment?: string;
  is_public: boolean;
  tags: string[];
  sacred_geometry_pattern: string;
  media_url?: string;
  location?: Record<string, any>;
  resonance_score: number;
  visualization_data?: Record<string, any>;
  created_at?: string;
  updated_at?: string;
}

export interface Connection {
  id: string;
  source_node_id: string;
  target_node_id: string;
  connection_type: string;
  connection_strength: number;
  connection_description?: string;
  created_at?: string;
  updated_at?: string;
}

export interface Interaction {
  id: string;
  user_id: string;
  node_id: string;
  interaction_type: string;
  interaction_content?: string;
  resonance_level: number;
  created_at?: string;
  updated_at?: string;
}

export interface CoherenceEvaluation {
  id: string;
  node_id: string;
  evaluator_id?: string;
  unity_score: number;
  authenticity_score: number;
  constructiveness_score: number;
  overall_coherence_score: number;
  evaluation_notes?: string;
  created_at?: string;
  updated_at?: string;
}

export interface VisionBoard {
  id: string;
  user_id: string;
  title: string;
  description?: string;
  timeline_start?: string;
  timeline_end?: string;
  is_public: boolean;
  board_theme: string;
  board_layout?: Record<string, any>;
  nodes: string[];
  created_at?: string;
  updated_at?: string;
}

export class UnityEngineModule implements IModule {
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
      type: 'module:unity-engine:initializing',
      sourceId: this.manifest.id,
      timestamp: new Date().toISOString(),
      payload: { status: 'starting' },
      metadata: { moduleName: this.manifest.name },
      essenceLabels: ['module:initialization', 'unity:engine', 'consciousness:collective']
    });
    
    this.isInitialized = true;

    this.geh.publish({
      type: 'module:unity-engine:initialized',
      sourceId: this.manifest.id,
      timestamp: new Date().toISOString(),
      payload: { status: 'ready' },
      metadata: { moduleName: this.manifest.name },
      essenceLabels: ['module:ready', 'unity:engine', 'consciousness:collective']
    });
  }

  async activate(): Promise<void> {
    if (!this.isInitialized) {
      throw new Error('Module must be initialized before activation');
    }

    this.isActive = true;

    this.geh.publish({
      type: 'module:unity-engine:activated',
      sourceId: this.manifest.id,
      timestamp: new Date().toISOString(),
      payload: { 
        status: 'active', 
        features: [
          'vision-nodes', 
          'connections-visualization', 
          'vision-board', 
          'unity-web', 
          'coherence-beacon'
        ] 
      },
      metadata: { moduleName: this.manifest.name },
      essenceLabels: ['module:active', 'unity:engine', 'collective:consciousness', 'sacred:connection']
    });
  }

  async deactivate(): Promise<void> {
    this.isActive = false;

    this.geh.publish({
      type: 'module:unity-engine:deactivated',
      sourceId: this.manifest.id,
      timestamp: new Date().toISOString(),
      payload: { status: 'dormant' },
      metadata: { moduleName: this.manifest.name },
      essenceLabels: ['module:dormant', 'unity:engine', 'consciousness:paused']
    });
  }

  async destroy(): Promise<void> {
    this.isActive = false;
    this.isInitialized = false;

    this.geh.publish({
      type: 'module:unity-engine:destroyed',
      sourceId: this.manifest.id,
      timestamp: new Date().toISOString(),
      payload: { status: 'destroyed' },
      metadata: { moduleName: this.manifest.name },
      essenceLabels: ['module:destroyed', 'unity:engine', 'resources:released']
    });
  }

  ping(): boolean {
    return this.isActive;
  }

  getExposedItems(): Record<string, any> {
    return {
      VisionNodeService: {
        getAllNodes: (userId: string) => this.getAllNodes(userId),
        getNodeById: (nodeId: string) => this.getNodeById(nodeId),
        createNode: (node: Partial<VisionNode>) => this.createNode(node),
        updateNode: (nodeId: string, updates: Partial<VisionNode>) => this.updateNode(nodeId, updates),
        deleteNode: (nodeId: string) => this.deleteNode(nodeId),
        getPublicNodes: (limit?: number) => this.getPublicNodes(limit),
        getNodesByFrequency: (frequency: number, tolerance: number) => this.getNodesByFrequency(frequency, tolerance),
        getNodesByChakra: (chakra: string) => this.getNodesByChakra(chakra),
        getNodesByTags: (tags: string[]) => this.getNodesByTags(tags)
      },
      ConnectionService: {
        getConnectionsForNode: (nodeId: string) => this.getConnectionsForNode(nodeId),
        createConnection: (connection: Partial<Connection>) => this.createConnection(connection),
        updateConnection: (connectionId: string, updates: Partial<Connection>) => this.updateConnection(connectionId, updates),
        deleteConnection: (connectionId: string) => this.deleteConnection(connectionId),
        getConnectionsByType: (type: string) => this.getConnectionsByType(type)
      },
      InteractionService: {
        getInteractionsForNode: (nodeId: string) => this.getInteractionsForNode(nodeId),
        createInteraction: (interaction: Partial<Interaction>) => this.createInteraction(interaction),
        deleteInteraction: (interactionId: string) => this.deleteInteraction(interactionId)
      },
      CoherenceService: {
        evaluateCoherence: (nodeId: string, evaluation: Partial<CoherenceEvaluation>) => this.evaluateCoherence(nodeId, evaluation),
        getEvaluationsForNode: (nodeId: string) => this.getEvaluationsForNode(nodeId),
        getOverallCoherence: (nodeId: string) => this.getOverallCoherence(nodeId)
      },
      VisionBoardService: {
        getUserBoards: (userId: string) => this.getUserBoards(userId),
        getBoardById: (boardId: string) => this.getBoardById(boardId),
        createBoard: (board: Partial<VisionBoard>) => this.createBoard(board),
        updateBoard: (boardId: string, updates: Partial<VisionBoard>) => this.updateBoard(boardId, updates),
        deleteBoard: (boardId: string) => this.deleteBoard(boardId),
        addNodesToBoard: (boardId: string, nodeIds: string[]) => this.addNodesToBoard(boardId, nodeIds),
        removeNodesFromBoard: (boardId: string, nodeIds: string[]) => this.removeNodesFromBoard(boardId, nodeIds)
      },
      UnityAnalytics: {
        getResonancePatterns: () => this.getResonancePatterns(),
        getUserResonanceReport: (userId: string) => this.getUserResonanceReport(userId),
        getCollectiveCoherenceStats: () => this.getCollectiveCoherenceStats()
      },
      Component: () => UnityEngineExplorer
    };
  }

  // Vision Node Service Methods
  private async getAllNodes(userId: string): Promise<VisionNode[]> {
    try {
      const { data, error } = await this.supabase.client
        .from('unity_vision_nodes')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('[UnityEngineModule] Error fetching nodes:', error);
      return [];
    }
  }

  private async getNodeById(nodeId: string): Promise<VisionNode | null> {
    try {
      const { data, error } = await this.supabase.client
        .from('unity_vision_nodes')
        .select('*')
        .eq('id', nodeId)
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      console.error(`[UnityEngineModule] Error fetching node ${nodeId}:`, error);
      return null;
    }
  }

  private async createNode(node: Partial<VisionNode>): Promise<VisionNode | null> {
    try {
      const { data, error } = await this.supabase.client
        .from('unity_vision_nodes')
        .insert(node)
        .select()
        .single();

      if (error) throw error;

      this.geh.publish({
        type: 'unity:node:created',
        sourceId: this.manifest.id,
        timestamp: new Date().toISOString(),
        payload: { nodeId: data.id, title: data.title },
        metadata: { userId: data.user_id, frequency: data.frequency_hz },
        essenceLabels: ['unity:creation', 'node:new', 'consciousness:vision']
      });

      return data;
    } catch (error) {
      console.error('[UnityEngineModule] Error creating node:', error);
      return null;
    }
  }

  private async updateNode(nodeId: string, updates: Partial<VisionNode>): Promise<VisionNode | null> {
    try {
      const { data, error } = await this.supabase.client
        .from('unity_vision_nodes')
        .update(updates)
        .eq('id', nodeId)
        .select()
        .single();

      if (error) throw error;

      this.geh.publish({
        type: 'unity:node:updated',
        sourceId: this.manifest.id,
        timestamp: new Date().toISOString(),
        payload: { nodeId, updates: Object.keys(updates) },
        metadata: { title: data.title },
        essenceLabels: ['unity:update', 'node:modified', 'consciousness:evolution']
      });

      return data;
    } catch (error) {
      console.error(`[UnityEngineModule] Error updating node ${nodeId}:`, error);
      return null;
    }
  }

  private async deleteNode(nodeId: string): Promise<boolean> {
    try {
      const { error } = await this.supabase.client
        .from('unity_vision_nodes')
        .delete()
        .eq('id', nodeId);

      if (error) throw error;

      this.geh.publish({
        type: 'unity:node:deleted',
        sourceId: this.manifest.id,
        timestamp: new Date().toISOString(),
        payload: { nodeId },
        metadata: {},
        essenceLabels: ['unity:deletion', 'node:removed']
      });

      return true;
    } catch (error) {
      console.error(`[UnityEngineModule] Error deleting node ${nodeId}:`, error);
      return false;
    }
  }

  private async getPublicNodes(limit: number = 50): Promise<VisionNode[]> {
    try {
      const { data, error } = await this.supabase.client
        .from('unity_vision_nodes')
        .select('*')
        .eq('is_public', true)
        .order('resonance_score', { ascending: false })
        .limit(limit);

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('[UnityEngineModule] Error fetching public nodes:', error);
      return [];
    }
  }

  private async getNodesByFrequency(frequency: number, tolerance: number = 10): Promise<VisionNode[]> {
    try {
      const { data, error } = await this.supabase.client
        .from('unity_vision_nodes')
        .select('*')
        .gte('frequency_hz', frequency - tolerance)
        .lte('frequency_hz', frequency + tolerance)
        .order('resonance_score', { ascending: false });

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error(`[UnityEngineModule] Error fetching nodes by frequency ${frequency}:`, error);
      return [];
    }
  }

  private async getNodesByChakra(chakra: string): Promise<VisionNode[]> {
    try {
      const { data, error } = await this.supabase.client
        .from('unity_vision_nodes')
        .select('*')
        .eq('chakra_alignment', chakra)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error(`[UnityEngineModule] Error fetching nodes by chakra ${chakra}:`, error);
      return [];
    }
  }

  private async getNodesByTags(tags: string[]): Promise<VisionNode[]> {
    try {
      const { data, error } = await this.supabase.client
        .from('unity_vision_nodes')
        .select('*')
        .contains('tags', tags)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error(`[UnityEngineModule] Error fetching nodes by tags:`, error);
      return [];
    }
  }

  // Connection Service Methods
  private async getConnectionsForNode(nodeId: string): Promise<Connection[]> {
    try {
      const { data, error } = await this.supabase.client
        .from('unity_connections')
        .select('*')
        .or(`source_node_id.eq.${nodeId},target_node_id.eq.${nodeId}`);

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error(`[UnityEngineModule] Error fetching connections for node ${nodeId}:`, error);
      return [];
    }
  }

  private async createConnection(connection: Partial<Connection>): Promise<Connection | null> {
    try {
      const { data, error } = await this.supabase.client
        .from('unity_connections')
        .insert(connection)
        .select()
        .single();

      if (error) throw error;

      this.geh.publish({
        type: 'unity:connection:created',
        sourceId: this.manifest.id,
        timestamp: new Date().toISOString(),
        payload: { 
          connectionId: data.id, 
          sourceId: data.source_node_id, 
          targetId: data.target_node_id 
        },
        metadata: { type: data.connection_type },
        essenceLabels: ['unity:connection', 'nodes:linked', 'consciousness:network']
      });

      return data;
    } catch (error) {
      console.error('[UnityEngineModule] Error creating connection:', error);
      return null;
    }
  }

  private async updateConnection(connectionId: string, updates: Partial<Connection>): Promise<Connection | null> {
    try {
      const { data, error } = await this.supabase.client
        .from('unity_connections')
        .update(updates)
        .eq('id', connectionId)
        .select()
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      console.error(`[UnityEngineModule] Error updating connection ${connectionId}:`, error);
      return null;
    }
  }

  private async deleteConnection(connectionId: string): Promise<boolean> {
    try {
      const { error } = await this.supabase.client
        .from('unity_connections')
        .delete()
        .eq('id', connectionId);

      if (error) throw error;
      return true;
    } catch (error) {
      console.error(`[UnityEngineModule] Error deleting connection ${connectionId}:`, error);
      return false;
    }
  }

  private async getConnectionsByType(type: string): Promise<Connection[]> {
    try {
      const { data, error } = await this.supabase.client
        .from('unity_connections')
        .select('*')
        .eq('connection_type', type)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error(`[UnityEngineModule] Error fetching connections by type ${type}:`, error);
      return [];
    }
  }

  // Interaction Service Methods
  private async getInteractionsForNode(nodeId: string): Promise<Interaction[]> {
    try {
      const { data, error } = await this.supabase.client
        .from('unity_interactions')
        .select('*')
        .eq('node_id', nodeId)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error(`[UnityEngineModule] Error fetching interactions for node ${nodeId}:`, error);
      return [];
    }
  }

  private async createInteraction(interaction: Partial<Interaction>): Promise<Interaction | null> {
    try {
      const { data, error } = await this.supabase.client
        .from('unity_interactions')
        .insert(interaction)
        .select()
        .single();

      if (error) throw error;

      this.geh.publish({
        type: 'unity:interaction:created',
        sourceId: this.manifest.id,
        timestamp: new Date().toISOString(),
        payload: { 
          interactionId: data.id, 
          nodeId: data.node_id, 
          type: data.interaction_type 
        },
        metadata: { userId: data.user_id },
        essenceLabels: ['unity:interaction', 'consciousness:connection', 'nodes:engagement']
      });

      return data;
    } catch (error) {
      console.error('[UnityEngineModule] Error creating interaction:', error);
      return null;
    }
  }

  private async deleteInteraction(interactionId: string): Promise<boolean> {
    try {
      const { error } = await this.supabase.client
        .from('unity_interactions')
        .delete()
        .eq('id', interactionId);

      if (error) throw error;
      return true;
    } catch (error) {
      console.error(`[UnityEngineModule] Error deleting interaction ${interactionId}:`, error);
      return false;
    }
  }

  // Coherence Service Methods
  private async evaluateCoherence(nodeId: string, evaluation: Partial<CoherenceEvaluation>): Promise<CoherenceEvaluation | null> {
    try {
      // Calculate overall coherence
      const unity = evaluation.unity_score || 0;
      const authenticity = evaluation.authenticity_score || 0;
      const constructiveness = evaluation.constructiveness_score || 0;
      
      const overall = Math.round((unity + authenticity + constructiveness) / 3);
      
      const fullEvaluation = {
        ...evaluation,
        node_id: nodeId,
        overall_coherence_score: overall
      };

      const { data, error } = await this.supabase.client
        .from('unity_coherence_evaluations')
        .insert(fullEvaluation)
        .select()
        .single();

      if (error) throw error;

      // Update node's resonance score based on evaluation
      await this.updateNodeResonanceScore(nodeId);

      this.geh.publish({
        type: 'unity:coherence:evaluated',
        sourceId: this.manifest.id,
        timestamp: new Date().toISOString(),
        payload: { 
          evaluationId: data.id, 
          nodeId: data.node_id, 
          overallScore: data.overall_coherence_score 
        },
        metadata: { evaluatorId: data.evaluator_id },
        essenceLabels: ['unity:coherence', 'consciousness:evaluation', 'nodes:resonance']
      });

      return data;
    } catch (error) {
      console.error(`[UnityEngineModule] Error evaluating coherence for node ${nodeId}:`, error);
      return null;
    }
  }

  private async getEvaluationsForNode(nodeId: string): Promise<CoherenceEvaluation[]> {
    try {
      const { data, error } = await this.supabase.client
        .from('unity_coherence_evaluations')
        .select('*')
        .eq('node_id', nodeId)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error(`[UnityEngineModule] Error fetching evaluations for node ${nodeId}:`, error);
      return [];
    }
  }

  private async getOverallCoherence(nodeId: string): Promise<number> {
    try {
      const { data, error } = await this.supabase.client
        .from('unity_coherence_evaluations')
        .select('overall_coherence_score')
        .eq('node_id', nodeId);

      if (error) throw error;
      
      if (!data || data.length === 0) return 0;
      
      const sum = data.reduce((acc, item) => acc + (item.overall_coherence_score || 0), 0);
      return Math.round(sum / data.length);
    } catch (error) {
      console.error(`[UnityEngineModule] Error calculating coherence for node ${nodeId}:`, error);
      return 0;
    }
  }

  private async updateNodeResonanceScore(nodeId: string): Promise<void> {
    try {
      const coherenceScore = await this.getOverallCoherence(nodeId);
      
      // Get interaction count
      const { count: interactionCount, error: countError } = await this.supabase.client
        .from('unity_interactions')
        .select('*', { count: 'exact', head: true })
        .eq('node_id', nodeId);
        
      if (countError) throw countError;
      
      // Calculate resonance score (combination of coherence and interaction level)
      const interactionFactor = Math.min(interactionCount || 0, 10) / 10; // Max out at 10 interactions
      const resonanceScore = Math.round(coherenceScore * 0.7 + interactionFactor * 100 * 0.3);
      
      // Update the node
      await this.supabase.client
        .from('unity_vision_nodes')
        .update({ resonance_score: resonanceScore })
        .eq('id', nodeId);
        
    } catch (error) {
      console.error(`[UnityEngineModule] Error updating node resonance for ${nodeId}:`, error);
    }
  }

  // Vision Board Service Methods
  private async getUserBoards(userId: string): Promise<VisionBoard[]> {
    try {
      const { data, error } = await this.supabase.client
        .from('unity_vision_boards')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error(`[UnityEngineModule] Error fetching vision boards for user ${userId}:`, error);
      return [];
    }
  }

  private async getBoardById(boardId: string): Promise<VisionBoard | null> {
    try {
      const { data, error } = await this.supabase.client
        .from('unity_vision_boards')
        .select('*')
        .eq('id', boardId)
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      console.error(`[UnityEngineModule] Error fetching vision board ${boardId}:`, error);
      return null;
    }
  }

  private async createBoard(board: Partial<VisionBoard>): Promise<VisionBoard | null> {
    try {
      const { data, error } = await this.supabase.client
        .from('unity_vision_boards')
        .insert(board)
        .select()
        .single();

      if (error) throw error;

      this.geh.publish({
        type: 'unity:visionBoard:created',
        sourceId: this.manifest.id,
        timestamp: new Date().toISOString(),
        payload: { boardId: data.id, title: data.title },
        metadata: { userId: data.user_id },
        essenceLabels: ['unity:creation', 'visionBoard:new', 'consciousness:mapping']
      });

      return data;
    } catch (error) {
      console.error('[UnityEngineModule] Error creating vision board:', error);
      return null;
    }
  }

  private async updateBoard(boardId: string, updates: Partial<VisionBoard>): Promise<VisionBoard | null> {
    try {
      const { data, error } = await this.supabase.client
        .from('unity_vision_boards')
        .update(updates)
        .eq('id', boardId)
        .select()
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      console.error(`[UnityEngineModule] Error updating vision board ${boardId}:`, error);
      return null;
    }
  }

  private async deleteBoard(boardId: string): Promise<boolean> {
    try {
      const { error } = await this.supabase.client
        .from('unity_vision_boards')
        .delete()
        .eq('id', boardId);

      if (error) throw error;
      return true;
    } catch (error) {
      console.error(`[UnityEngineModule] Error deleting vision board ${boardId}:`, error);
      return false;
    }
  }

  private async addNodesToBoard(boardId: string, nodeIds: string[]): Promise<VisionBoard | null> {
    try {
      // Get current board
      const { data: board, error: boardError } = await this.supabase.client
        .from('unity_vision_boards')
        .select('nodes')
        .eq('id', boardId)
        .single();
        
      if (boardError) throw boardError;
      
      // Combine current nodes with new nodes (no duplicates)
      const existingNodes = board.nodes || [];
      const allNodes = [...new Set([...existingNodes, ...nodeIds])];
      
      // Update board
      const { data, error } = await this.supabase.client
        .from('unity_vision_boards')
        .update({ nodes: allNodes })
        .eq('id', boardId)
        .select()
        .single();
        
      if (error) throw error;
      return data;
    } catch (error) {
      console.error(`[UnityEngineModule] Error adding nodes to board ${boardId}:`, error);
      return null;
    }
  }

  private async removeNodesFromBoard(boardId: string, nodeIds: string[]): Promise<VisionBoard | null> {
    try {
      // Get current board
      const { data: board, error: boardError } = await this.supabase.client
        .from('unity_vision_boards')
        .select('nodes')
        .eq('id', boardId)
        .single();
        
      if (boardError) throw boardError;
      
      // Remove specified nodes
      const existingNodes = board.nodes || [];
      const updatedNodes = existingNodes.filter(id => !nodeIds.includes(id));
      
      // Update board
      const { data, error } = await this.supabase.client
        .from('unity_vision_boards')
        .update({ nodes: updatedNodes })
        .eq('id', boardId)
        .select()
        .single();
        
      if (error) throw error;
      return data;
    } catch (error) {
      console.error(`[UnityEngineModule] Error removing nodes from board ${boardId}:`, error);
      return null;
    }
  }

  // Analytics Methods
  private async getResonancePatterns(): Promise<any[]> {
    try {
      const { data, error } = await this.supabase.client
        .from('unity_resonance_patterns')
        .select('*')
        .order('coherence_score', { ascending: false });
        
      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('[UnityEngineModule] Error fetching resonance patterns:', error);
      return [];
    }
  }

  private async getUserResonanceReport(userId: string): Promise<any> {
    try {
      // Get user nodes
      const { data: nodes, error: nodesError } = await this.supabase.client
        .from('unity_vision_nodes')
        .select('id, frequency_hz, chakra_alignment, resonance_score, tags')
        .eq('user_id', userId);
        
      if (nodesError) throw nodesError;
      
      // Get interactions
      const { data: interactions, error: interactionsError } = await this.supabase.client
        .from('unity_interactions')
        .select('interaction_type, resonance_level')
        .eq('user_id', userId);
        
      if (interactionsError) throw interactionsError;
      
      // Analyze frequencies
      const frequencies = nodes?.map(n => n.frequency_hz) || [];
      const averageFrequency = frequencies.length > 0 
        ? frequencies.reduce((a, b) => a + b, 0) / frequencies.length 
        : 0;
        
      // Analyze chakras
      const chakraCounts: Record<string, number> = {};
      nodes?.forEach(node => {
        if (node.chakra_alignment) {
          chakraCounts[node.chakra_alignment] = (chakraCounts[node.chakra_alignment] || 0) + 1;
        }
      });
      
      // Get dominant chakra
      const dominantChakra = Object.entries(chakraCounts)
        .sort((a, b) => b[1] - a[1])
        .map(entry => entry[0])[0] || null;
        
      // Analyze tags
      const tagCounts: Record<string, number> = {};
      nodes?.forEach(node => {
        node.tags?.forEach(tag => {
          tagCounts[tag] = (tagCounts[tag] || 0) + 1;
        });
      });
      
      // Get top tags
      const topTags = Object.entries(tagCounts)
        .sort((a, b) => b[1] - a[1])
        .slice(0, 5)
        .map(entry => entry[0]);
        
      // Calculate average resonance
      const resonanceScores = nodes?.map(n => n.resonance_score) || [];
      const averageResonance = resonanceScores.length > 0
        ? resonanceScores.reduce((a, b) => a + b, 0) / resonanceScores.length
        : 0;
        
      return {
        nodeCount: nodes?.length || 0,
        interactionCount: interactions?.length || 0,
        averageFrequency,
        dominantChakra,
        topTags,
        averageResonance
      };
    } catch (error) {
      console.error(`[UnityEngineModule] Error generating user resonance report for ${userId}:`, error);
      return {};
    }
  }

  private async getCollectiveCoherenceStats(): Promise<any> {
    try {
      // Get average coherence scores
      const { data: evaluations, error: evalError } = await this.supabase.client
        .from('unity_coherence_evaluations')
        .select('unity_score, authenticity_score, constructiveness_score, overall_coherence_score');
        
      if (evalError) throw evalError;
      
      if (!evaluations || evaluations.length === 0) {
        return {
          averageUnityScore: 0,
          averageAuthenticityScore: 0,
          averageConstructivenessScore: 0,
          averageOverallCoherence: 0,
          evaluationCount: 0
        };
      }
      
      const avgUnity = evaluations.reduce((sum, eval_) => sum + (eval_.unity_score || 0), 0) / evaluations.length;
      const avgAuthenticity = evaluations.reduce((sum, eval_) => sum + (eval_.authenticity_score || 0), 0) / evaluations.length;
      const avgConstructiveness = evaluations.reduce((sum, eval_) => sum + (eval_.constructiveness_score || 0), 0) / evaluations.length;
      const avgOverall = evaluations.reduce((sum, eval_) => sum + (eval_.overall_coherence_score || 0), 0) / evaluations.length;
      
      return {
        averageUnityScore: Math.round(avgUnity),
        averageAuthenticityScore: Math.round(avgAuthenticity),
        averageConstructivenessScore: Math.round(avgConstructiveness),
        averageOverallCoherence: Math.round(avgOverall),
        evaluationCount: evaluations.length
      };
    } catch (error) {
      console.error('[UnityEngineModule] Error fetching collective coherence stats:', error);
      return {
        averageUnityScore: 0,
        averageAuthenticityScore: 0,
        averageConstructivenessScore: 0,
        averageOverallCoherence: 0,
        evaluationCount: 0
      };
    }
  }
}