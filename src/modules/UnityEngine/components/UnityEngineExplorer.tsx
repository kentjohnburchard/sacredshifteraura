import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../../../contexts/AuthContext';
import { SupabaseService } from '../../../services/SupabaseService';
import { VisionNode, Connection, VisionBoard } from '../UnityEngineModule';
import { VisionNodeCreator } from './VisionNodeCreator';
import { ConnectionsVisualizer } from './ConnectionsVisualizer';
import { VisionBoardView } from './VisionBoardView';
import { UnityWebInteraction } from './UnityWebInteraction';
import { CoherenceBeacon } from './CoherenceBeacon';
import { HelpButton } from '../../../components/HelpButton';
import { Sparkles, Network, Code as Nodes, Globe, HeartHandshake, Layout, Plus, Search, Filter, Settings, Users, Clock, Gauge, Lightbulb, RefreshCw, AlertTriangle } from 'lucide-react';

type UnityView = 'nodes' | 'connections' | 'vision-board' | 'unity-web' | 'coherence-beacon' | 'create-node';

export const UnityEngineExplorer: React.FC = () => {
  const { user } = useAuth();
  const supabase = SupabaseService.getInstance().client;
  
  const [activeView, setActiveView] = useState<UnityView>('nodes');
  const [visionNodes, setVisionNodes] = useState<VisionNode[]>([]);
  const [connections, setConnections] = useState<Connection[]>([]);
  const [visionBoards, setVisionBoards] = useState<VisionBoard[]>([]);
  const [selectedNode, setSelectedNode] = useState<VisionNode | null>(null);
  const [selectedBoard, setSelectedBoard] = useState<VisionBoard | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // Load initial data
  useEffect(() => {
    if (user?.id) {
      loadUserData();
    }
  }, [user?.id]);
  
  const loadUserData = async () => {
    setIsLoading(true);
    setError(null);
    
    try {
      // Load nodes
      const { data: nodesData, error: nodesError } = await supabase
        .from('unity_vision_nodes')
        .select('*')
        .eq('user_id', user?.id)
        .order('created_at', { ascending: false });
      
      if (nodesError) throw nodesError;
      setVisionNodes(nodesData || []);
      
      // Load connections for user's nodes
      if (nodesData && nodesData.length > 0) {
        const nodeIds = nodesData.map(node => node.id);
        const { data: connectionsData, error: connectionsError } = await supabase
          .from('unity_connections')
          .select('*')
          .or(`source_node_id.in.(${nodeIds.join(',')}),target_node_id.in.(${nodeIds.join(',')})`);
          
        if (connectionsError) throw connectionsError;
        setConnections(connectionsData || []);
      }
      
      // Load vision boards
      const { data: boardsData, error: boardsError } = await supabase
        .from('unity_vision_boards')
        .select('*')
        .eq('user_id', user?.id)
        .order('created_at', { ascending: false });
        
      if (boardsError) throw boardsError;
      setVisionBoards(boardsData || []);
      
    } catch (error) {
      console.error('Error loading Unity Engine data:', error);
      setError('Failed to load Unity Engine data. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };
  
  const handleNodeCreated = (node: VisionNode) => {
    setVisionNodes(prev => [node, ...prev]);
    setActiveView('nodes');
  };
  
  const handleNodeSelected = (node: VisionNode) => {
    setSelectedNode(node);
  };
  
  const handleBoardSelected = (board: VisionBoard) => {
    setSelectedBoard(board);
    setActiveView('vision-board');
  };
  
  const handleConnectionCreated = (connection: Connection) => {
    setConnections(prev => [...prev, connection]);
  };
  
  const handleRefresh = () => {
    loadUserData();
  };

  return (
    <div className="space-y-6">
      {/* Header with navigation */}
      <div className="bg-slate-900/70 backdrop-blur-sm rounded-xl border border-purple-500/20 p-6">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-indigo-600 rounded-xl flex items-center justify-center">
              <Nodes className="w-5 h-5 text-white" />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-white">Unity Engine</h2>
              <p className="text-purple-300">Cross-pollinate ideas, create connections, and elevate consciousness</p>
            </div>
          </div>
          
          <div className="flex items-center gap-2">
            <button
              onClick={handleRefresh}
              className="p-2 text-gray-400 hover:text-white transition-colors"
              title="Refresh data"
            >
              <RefreshCw className="w-4 h-4" />
            </button>
            <HelpButton moduleType="overview" />
          </div>
        </div>
        
        <div className="flex items-center gap-4 overflow-x-auto pb-2">
          <button
            onClick={() => setActiveView('nodes')}
            className={`px-4 py-2 rounded-lg flex items-center gap-2 transition-colors ${
              activeView === 'nodes'
                ? 'bg-purple-600 text-white'
                : 'text-gray-400 hover:text-white hover:bg-slate-800/50'
            }`}
          >
            <Nodes className="w-4 h-4" />
            <span>Vision Nodes</span>
          </button>
          
          <button
            onClick={() => setActiveView('connections')}
            className={`px-4 py-2 rounded-lg flex items-center gap-2 transition-colors ${
              activeView === 'connections'
                ? 'bg-purple-600 text-white'
                : 'text-gray-400 hover:text-white hover:bg-slate-800/50'
            }`}
          >
            <Network className="w-4 h-4" />
            <span>Connections</span>
          </button>
          
          <button
            onClick={() => setActiveView('vision-board')}
            className={`px-4 py-2 rounded-lg flex items-center gap-2 transition-colors ${
              activeView === 'vision-board'
                ? 'bg-purple-600 text-white'
                : 'text-gray-400 hover:text-white hover:bg-slate-800/50'
            }`}
          >
            <Layout className="w-4 h-4" />
            <span>Vision Board</span>
          </button>
          
          <button
            onClick={() => setActiveView('unity-web')}
            className={`px-4 py-2 rounded-lg flex items-center gap-2 transition-colors ${
              activeView === 'unity-web'
                ? 'bg-purple-600 text-white'
                : 'text-gray-400 hover:text-white hover:bg-slate-800/50'
            }`}
          >
            <Globe className="w-4 h-4" />
            <span>Unity Web</span>
          </button>
          
          <button
            onClick={() => setActiveView('coherence-beacon')}
            className={`px-4 py-2 rounded-lg flex items-center gap-2 transition-colors ${
              activeView === 'coherence-beacon'
                ? 'bg-purple-600 text-white'
                : 'text-gray-400 hover:text-white hover:bg-slate-800/50'
            }`}
          >
            <HeartHandshake className="w-4 h-4" />
            <span>Coherence Beacon</span>
          </button>
          
          <button
            onClick={() => setActiveView('create-node')}
            className="px-4 py-2 bg-green-600/20 text-green-300 rounded-lg hover:bg-green-600/30 transition-colors flex items-center gap-2 ml-auto"
          >
            <Plus className="w-4 h-4" />
            <span>Create New</span>
          </button>
        </div>
      </div>
      
      {/* Error message */}
      <AnimatePresence>
        {error && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="bg-red-900/20 text-red-300 p-4 rounded-lg flex items-start gap-2"
          >
            <AlertTriangle className="w-5 h-5 flex-shrink-0" />
            <div>{error}</div>
          </motion.div>
        )}
      </AnimatePresence>
      
      {/* Main Content */}
      <div className="min-h-[400px] relative">
        {isLoading ? (
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="w-16 h-16 border-4 border-purple-400/30 border-t-purple-400 rounded-full animate-spin"></div>
            <div className="ml-4 text-purple-300">Loading Unity Engine data...</div>
          </div>
        ) : (
          <AnimatePresence mode="wait">
            {activeView === 'nodes' && (
              <motion.div
                key="nodes-view"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.3 }}
                className="space-y-6"
              >
                {visionNodes.length === 0 ? (
                  <div className="bg-slate-900/70 backdrop-blur-sm rounded-xl border border-purple-500/20 p-8 text-center">
                    <Lightbulb className="w-16 h-16 mx-auto mb-4 text-amber-400 opacity-50" />
                    <h3 className="text-xl font-bold text-white mb-2">Create Your First Vision Node</h3>
                    <p className="text-gray-300 mb-6 max-w-md mx-auto">
                      Vision nodes are seeds of consciousness that you can nurture, connect, and share with others. 
                      Start by creating your first node.
                    </p>
                    <button
                      onClick={() => setActiveView('create-node')}
                      className="px-6 py-3 bg-gradient-to-r from-purple-600 to-indigo-600 text-white rounded-lg hover:from-purple-700 hover:to-indigo-700 transition-all"
                    >
                      <Plus className="w-5 h-5 mr-2 inline-block" />
                      Create Vision Node
                    </button>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {visionNodes.map(node => (
                      <motion.div
                        key={node.id}
                        className="bg-slate-800/50 backdrop-blur-sm rounded-lg border border-purple-500/20 overflow-hidden hover:border-purple-400 transition-all cursor-pointer"
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        onClick={() => handleNodeSelected(node)}
                      >
                        {/* Node media preview or default image */}
                        <div className="h-40 bg-gradient-to-br from-purple-900/30 to-indigo-900/30 relative flex items-center justify-center overflow-hidden">
                          {node.media_url ? (
                            <img src={node.media_url} alt={node.title} className="w-full h-full object-cover" />
                          ) : (
                            <div className="p-4 rounded-full bg-purple-500/20 border border-purple-500/40">
                              <Sparkles className="w-8 h-8 text-purple-400" />
                            </div>
                          )}
                          
                          {/* Frequency indicator */}
                          <div className="absolute bottom-2 right-2 px-2 py-1 bg-slate-900/80 rounded-full text-xs text-purple-300">
                            {node.frequency_hz}Hz
                          </div>
                        </div>
                        
                        {/* Node content */}
                        <div className="p-4">
                          <h3 className="text-lg font-semibold text-white mb-1">{node.title}</h3>
                          
                          {node.description && (
                            <p className="text-gray-400 text-sm mb-3 line-clamp-2">{node.description}</p>
                          )}
                          
                          <div className="flex flex-wrap gap-2 mb-3">
                            {node.tags?.slice(0, 3).map((tag, index) => (
                              <div key={index} className="px-2 py-1 bg-slate-700/50 rounded-full text-xs text-gray-300">
                                {tag}
                              </div>
                            ))}
                            {(node.tags?.length || 0) > 3 && (
                              <div className="px-2 py-1 bg-slate-700/50 rounded-full text-xs text-gray-400">
                                +{node.tags!.length - 3} more
                              </div>
                            )}
                          </div>
                          
                          <div className="flex items-center justify-between text-xs">
                            <div className="flex items-center gap-1">
                              {node.is_public ? (
                                <Globe className="w-3 h-3 text-green-400" />
                              ) : (
                                <Users className="w-3 h-3 text-gray-400" />
                              )}
                              <span className="text-gray-400">{node.is_public ? 'Public' : 'Private'}</span>
                            </div>
                            
                            <div className="flex items-center gap-1 text-gray-400">
                              <Clock className="w-3 h-3" />
                              <span>{new Date(node.created_at!).toLocaleDateString()}</span>
                            </div>
                            
                            <div className="flex items-center gap-1">
                              <Gauge className="w-3 h-3 text-purple-400" />
                              <span className="text-purple-300">{node.resonance_score}/100</span>
                            </div>
                          </div>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                )}
              </motion.div>
            )}
            
            {activeView === 'connections' && (
              <motion.div
                key="connections-view"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.3 }}
              >
                <ConnectionsVisualizer 
                  nodes={visionNodes} 
                  connections={connections} 
                  onNodeSelected={handleNodeSelected}
                  onConnectionCreated={handleConnectionCreated}
                />
              </motion.div>
            )}
            
            {activeView === 'vision-board' && (
              <motion.div
                key="vision-board-view"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.3 }}
              >
                <VisionBoardView 
                  boards={visionBoards} 
                  nodes={visionNodes}
                  selectedBoard={selectedBoard}
                  onBoardSelected={handleBoardSelected}
                  onNodeSelected={handleNodeSelected}
                  onBoardsUpdated={boards => setVisionBoards(boards)}
                />
              </motion.div>
            )}
            
            {activeView === 'unity-web' && (
              <motion.div
                key="unity-web-view"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.3 }}
              >
                <UnityWebInteraction 
                  userNodes={visionNodes}
                  onNodeSelected={handleNodeSelected}
                />
              </motion.div>
            )}
            
            {activeView === 'coherence-beacon' && (
              <motion.div
                key="coherence-view"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.3 }}
              >
                <CoherenceBeacon 
                  nodes={visionNodes}
                  onNodeSelected={handleNodeSelected}
                />
              </motion.div>
            )}
            
            {activeView === 'create-node' && (
              <motion.div
                key="create-node-view"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.3 }}
              >
                <VisionNodeCreator 
                  onNodeCreated={handleNodeCreated}
                  onCancel={() => setActiveView('nodes')}
                />
              </motion.div>
            )}
          </AnimatePresence>
        )}
      </div>
    </div>
  );
};