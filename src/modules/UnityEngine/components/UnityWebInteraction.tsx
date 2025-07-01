import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../../../contexts/AuthContext';
import { SupabaseService } from '../../../services/SupabaseService';
import { VisionNode, Interaction } from '../UnityEngineModule';
import {
  Globe,
  Search,
  Tag,
  Filter,
  Heart,
  MessageSquare,
  AlertCircle,
  Sparkles,
  Send,
  RefreshCw,
  Users,
  Clock,
  ArrowUp,
  Zap
} from 'lucide-react';

interface UnityWebInteractionProps {
  userNodes: VisionNode[];
  onNodeSelected: (node: VisionNode) => void;
}

export const UnityWebInteraction: React.FC<UnityWebInteractionProps> = ({
  userNodes,
  onNodeSelected
}) => {
  const { user } = useAuth();
  const supabase = SupabaseService.getInstance().client;
  
  const [publicNodes, setPublicNodes] = useState<VisionNode[]>([]);
  const [interactions, setInteractions] = useState<Record<string, Interaction[]>>({});
  const [searchQuery, setSearchQuery] = useState('');
  const [chakraFilter, setChakraFilter] = useState('all');
  const [frequencyFilter, setFrequencyFilter] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedNode, setSelectedNode] = useState<VisionNode | null>(null);
  const [interactionContent, setInteractionContent] = useState('');
  const [interactionType, setInteractionType] = useState('resonate');
  
  // Load public nodes
  useEffect(() => {
    loadPublicNodes();
  }, []);
  
  const loadPublicNodes = async () => {
    setIsLoading(true);
    setError(null);
    
    try {
      const { data, error } = await supabase
        .from('unity_vision_nodes')
        .select('*')
        .eq('is_public', true)
        .order('resonance_score', { ascending: false })
        .limit(50);
        
      if (error) throw error;
      
      // Exclude user's own nodes
      const filteredNodes = data?.filter(node => 
        node.user_id !== user?.id
      ) || [];
      
      setPublicNodes(filteredNodes);
      
      // Load interactions for these nodes
      await loadInteractions(filteredNodes.map(n => n.id));
    } catch (err) {
      console.error('Error loading public nodes:', err);
      setError('Failed to load public nodes. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };
  
  const loadInteractions = async (nodeIds: string[]) => {
    if (nodeIds.length === 0 || !user?.id) return;
    
    try {
      const { data, error } = await supabase
        .from('unity_interactions')
        .select('*')
        .in('node_id', nodeIds);
        
      if (error) throw error;
      
      // Group interactions by node ID
      const grouped: Record<string, Interaction[]> = {};
      (data || []).forEach(interaction => {
        if (!grouped[interaction.node_id]) {
          grouped[interaction.node_id] = [];
        }
        grouped[interaction.node_id].push(interaction);
      });
      
      setInteractions(grouped);
    } catch (err) {
      console.error('Error loading interactions:', err);
    }
  };
  
  const handleCreateInteraction = async () => {
    if (!selectedNode || !user?.id || !interactionContent.trim()) return;
    
    try {
      const newInteraction = {
        user_id: user.id,
        node_id: selectedNode.id,
        interaction_type: interactionType,
        interaction_content: interactionContent,
        resonance_level: interactionType === 'resonate' ? 80 : 
                          interactionType === 'question' ? 50 : 
                          interactionType === 'amplify' ? 90 : 70
      };
      
      const { data, error } = await supabase
        .from('unity_interactions')
        .insert(newInteraction)
        .select()
        .single();
        
      if (error) throw error;
      
      // Add to interactions
      setInteractions(prev => ({
        ...prev,
        [selectedNode.id]: [...(prev[selectedNode.id] || []), data]
      }));
      
      // Clear form
      setInteractionContent('');
      
      // Update node resonance
      setTimeout(() => {
        loadPublicNodes();
      }, 1000);
    } catch (err) {
      console.error('Error creating interaction:', err);
    }
  };
  
  // Filter nodes based on search and filters
  const filteredNodes = publicNodes.filter(node => {
    // Search filter
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      if (!node.title.toLowerCase().includes(query) && 
          !(node.description || '').toLowerCase().includes(query) &&
          !node.tags?.some(tag => tag.toLowerCase().includes(query))) {
        return false;
      }
    }
    
    // Chakra filter
    if (chakraFilter !== 'all' && node.chakra_alignment !== chakraFilter) {
      return false;
    }
    
    // Frequency filter (with tolerance)
    if (frequencyFilter > 0) {
      const tolerance = 5;
      if (Math.abs(node.frequency_hz - frequencyFilter) > tolerance) {
        return false;
      }
    }
    
    return true;
  });
  
  const hasUserInteractedWith = (nodeId: string): boolean => {
    return interactions[nodeId]?.some(i => i.user_id === user?.id) || false;
  };
  
  const getInteractionCount = (nodeId: string): number => {
    return interactions[nodeId]?.length || 0;
  };
  
  const renderNodeDetail = () => {
    if (!selectedNode) return null;
    
    const nodeInteractions = interactions[selectedNode.id] || [];
    
    return (
      <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
        <div className="bg-slate-900 rounded-xl border border-purple-500/20 p-6 max-w-3xl w-full max-h-[90vh] overflow-y-auto">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-xl font-bold text-white">{selectedNode.title}</h3>
            <button
              onClick={() => setSelectedNode(null)}
              className="p-1 text-gray-400 hover:text-white transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
            <div className="md:col-span-2 space-y-4">
              {selectedNode.description && (
                <div>
                  <label className="block text-sm font-medium text-gray-400 mb-1">Description</label>
                  <p className="text-white">{selectedNode.description}</p>
                </div>
              )}
              
              <div className="flex flex-wrap gap-2">
                {selectedNode.tags?.map((tag, idx) => (
                  <div key={idx} className="px-3 py-1 bg-purple-900/20 text-purple-300 rounded-full">
                    {tag}
                  </div>
                ))}
              </div>
              
              {nodeInteractions.length > 0 && (
                <div>
                  <label className="block text-sm font-medium text-gray-400 mb-2">Interactions</label>
                  <div className="space-y-3 max-h-60 overflow-y-auto p-2">
                    {nodeInteractions.map(interaction => (
                      <div 
                        key={interaction.id} 
                        className="p-3 bg-slate-800 rounded-lg border border-gray-700"
                      >
                        <div className="flex items-center justify-between mb-1">
                          <div className="flex items-center gap-1 text-xs">
                            <Users className="w-3 h-3 text-gray-400" />
                            <span className="text-gray-400">
                              User {interaction.user_id.substring(0, 6)}
                            </span>
                          </div>
                          
                          <div className="text-xs px-2 py-1 bg-slate-700 rounded-full text-gray-300">
                            {interaction.interaction_type}
                          </div>
                        </div>
                        
                        {interaction.interaction_content && (
                          <p className="text-gray-300 text-sm">{interaction.interaction_content}</p>
                        )}
                        
                        <div className="flex justify-between items-center mt-2 text-xs">
                          <div className="text-gray-500">
                            {new Date(interaction.created_at!).toLocaleString()}
                          </div>
                          
                          <div className="flex items-center gap-1">
                            <Zap className="w-3 h-3 text-purple-400" />
                            <span className="text-purple-300">{interaction.resonance_level}</span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-400 mb-1">Frequency</label>
                <div className="text-xl font-bold text-purple-300 flex items-center gap-2">
                  <Zap className="w-5 h-5" />
                  {selectedNode.frequency_hz}Hz
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-400 mb-1">Chakra</label>
                <div className="text-lg font-bold text-purple-300 capitalize">
                  {selectedNode.chakra_alignment?.replace('_', ' ')}
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-400 mb-1">Resonance</label>
                <div className="flex items-center gap-2">
                  <div className="h-2 flex-grow bg-gray-700 rounded-full overflow-hidden">
                    <div 
                      className="h-full bg-gradient-to-r from-purple-500 to-indigo-500"
                      style={{ width: `${selectedNode.resonance_score}%` }}
                    ></div>
                  </div>
                  <div className="text-white font-bold">{selectedNode.resonance_score}</div>
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-400 mb-1">Created</label>
                <div className="text-gray-300">
                  {new Date(selectedNode.created_at!).toLocaleString()}
                </div>
              </div>
              
              <div className="pt-4 border-t border-gray-700 mt-4">
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Add Your Interaction
                </label>
                
                <div className="flex gap-2 mb-3">
                  <select
                    value={interactionType}
                    onChange={(e) => setInteractionType(e.target.value)}
                    className="p-2 bg-slate-800 text-white rounded-lg border border-gray-600 focus:border-purple-400 focus:outline-none"
                  >
                    <option value="resonate">Resonate</option>
                    <option value="amplify">Amplify</option>
                    <option value="evolve">Evolve</option>
                    <option value="question">Question</option>
                  </select>
                </div>
                
                <textarea
                  value={interactionContent}
                  onChange={(e) => setInteractionContent(e.target.value)}
                  placeholder="Share your thoughts..."
                  className="w-full p-3 bg-slate-800 text-white rounded-lg border border-gray-600 focus:border-purple-400 focus:outline-none h-24 mb-3"
                />
                
                <button
                  onClick={handleCreateInteraction}
                  disabled={!interactionContent.trim()}
                  className="w-full py-2 bg-gradient-to-r from-purple-600 to-indigo-600 text-white rounded-lg hover:from-purple-700 hover:to-indigo-700 transition-all flex items-center justify-center gap-2 disabled:opacity-50"
                >
                  <Send className="w-4 h-4" />
                  Send
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="space-y-6">
      <div className="bg-slate-900/70 backdrop-blur-sm rounded-xl border border-purple-500/20 p-6">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <Globe className="w-6 h-6 text-purple-400" />
            <h2 className="text-xl font-bold text-white">Unity Web Interaction</h2>
          </div>
          
          <div className="flex items-center gap-2">
            <button
              onClick={loadPublicNodes}
              className="p-2 text-gray-400 hover:text-white transition-colors"
              title="Refresh"
            >
              <RefreshCw className="w-4 h-4" />
            </button>
          </div>
        </div>
        
        {/* Search and filter */}
        <div className="flex flex-col md:flex-row gap-4 mb-6">
          <div className="relative flex-grow">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500 w-4 h-4" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search public vision nodes..."
              className="w-full pl-10 p-2 bg-slate-800 text-white rounded-lg border border-gray-600 focus:border-purple-400 focus:outline-none"
            />
          </div>
          
          <div className="flex gap-2">
            <select
              value={chakraFilter}
              onChange={(e) => setChakraFilter(e.target.value)}
              className="p-2 bg-slate-800 text-white rounded-lg border border-gray-600 focus:border-purple-400 focus:outline-none"
            >
              <option value="all">All Chakras</option>
              <option value="root">Root Chakra</option>
              <option value="sacral">Sacral Chakra</option>
              <option value="solar">Solar Plexus</option>
              <option value="heart">Heart Chakra</option>
              <option value="throat">Throat Chakra</option>
              <option value="third_eye">Third Eye</option>
              <option value="crown">Crown Chakra</option>
            </select>
            
            <select
              value={frequencyFilter}
              onChange={(e) => setFrequencyFilter(parseInt(e.target.value))}
              className="p-2 bg-slate-800 text-white rounded-lg border border-gray-600 focus:border-purple-400 focus:outline-none"
            >
              <option value="0">All Frequencies</option>
              <option value="396">396 Hz (UT)</option>
              <option value="417">417 Hz (RE)</option>
              <option value="528">528 Hz (MI)</option>
              <option value="639">639 Hz (FA)</option>
              <option value="741">741 Hz (SOL)</option>
              <option value="852">852 Hz (LA)</option>
              <option value="963">963 Hz (Cosmic)</option>
            </select>
          </div>
        </div>
        
        {isLoading ? (
          <div className="text-center py-8">
            <div className="w-12 h-12 border-4 border-purple-400/30 border-t-purple-400 rounded-full animate-spin mx-auto mb-4"></div>
            <p className="text-purple-300">Loading public vision nodes...</p>
          </div>
        ) : filteredNodes.length === 0 ? (
          <div className="text-center py-8">
            <Globe className="w-16 h-16 mx-auto mb-4 text-gray-500 opacity-50" />
            {searchQuery || chakraFilter !== 'all' || frequencyFilter > 0 ? (
              <>
                <p className="text-gray-300 mb-2">No nodes match your filters</p>
                <button
                  onClick={() => {
                    setSearchQuery('');
                    setChakraFilter('all');
                    setFrequencyFilter(0);
                  }}
                  className="text-purple-400 hover:text-purple-300 transition-colors"
                >
                  Clear Filters
                </button>
              </>
            ) : (
              <>
                <p className="text-gray-300 mb-2">No public nodes found</p>
                <p className="text-gray-500 text-sm">
                  Make your own vision nodes public to contribute to the Unity Web
                </p>
              </>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredNodes.map(node => {
              const interactionCount = getInteractionCount(node.id);
              const hasInteracted = hasUserInteractedWith(node.id);
              
              return (
                <motion.div
                  key={node.id}
                  className={`bg-slate-800/50 backdrop-blur-sm rounded-lg border overflow-hidden transition-all cursor-pointer ${
                    hasInteracted ? 'border-purple-500/40' : 'border-gray-700 hover:border-purple-500/20'
                  }`}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => setSelectedNode(node)}
                >
                  {/* Node header with frequency */}
                  <div className="p-4 border-b border-gray-700 bg-gradient-to-r from-slate-800/80 to-purple-900/20">
                    <div className="flex justify-between items-start">
                      <div>
                        <h3 className="font-bold text-white mb-1">{node.title}</h3>
                        <div className="flex items-center gap-2">
                          <div className="text-xs px-2 py-0.5 bg-purple-900/30 text-purple-300 rounded-full">
                            {node.frequency_hz}Hz
                          </div>
                          <div className="text-xs px-2 py-0.5 bg-slate-700/80 text-gray-300 rounded-full capitalize">
                            {node.chakra_alignment?.replace('_', ' ')}
                          </div>
                        </div>
                      </div>
                      
                      <div className="flex items-center gap-1">
                        <Sparkles className="w-4 h-4 text-amber-400" />
                        <span className="text-amber-300 text-sm">{node.resonance_score}</span>
                      </div>
                    </div>
                  </div>
                  
                  {/* Node content */}
                  <div className="p-4">
                    {node.description && (
                      <p className="text-gray-300 text-sm mb-3 line-clamp-2">{node.description}</p>
                    )}
                    
                    <div className="flex flex-wrap gap-1 mb-3">
                      {(node.tags || []).slice(0, 4).map((tag, idx) => (
                        <div key={idx} className="px-2 py-0.5 bg-slate-700 rounded-full text-xs text-gray-300">
                          {tag}
                        </div>
                      ))}
                      {(node.tags?.length || 0) > 4 && (
                        <div className="px-2 py-0.5 bg-slate-700 rounded-full text-xs text-gray-500">
                          +{(node.tags?.length || 0) - 4}
                        </div>
                      )}
                    </div>
                    
                    <div className="flex justify-between items-center text-xs">
                      <div className="flex items-center gap-1 text-gray-400">
                        <MessageSquare className="w-3 h-3" />
                        <span>{interactionCount} interactions</span>
                      </div>
                      
                      {hasInteracted && (
                        <div className="text-purple-300">You've interacted</div>
                      )}
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </div>
        )}
      </div>
      
      <AnimatePresence>
        {selectedNode && renderNodeDetail()}
      </AnimatePresence>
    </div>
  );
};