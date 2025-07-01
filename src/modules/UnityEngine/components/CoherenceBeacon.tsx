import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../../../contexts/AuthContext';
import { SupabaseService } from '../../../services/SupabaseService';
import { VisionNode, CoherenceEvaluation } from '../UnityEngineModule';
import {
  HeartHandshake,
  Sparkles,
  ArrowRight,
  X,
  Save,
  Shield,
  Heart,
  CheckCircle,
  Search,
  Gauge,
  Zap,
  RefreshCw,
  Filter,
  AlertTriangle
} from 'lucide-react';

interface CoherenceBeaconProps {
  nodes: VisionNode[];
  onNodeSelected: (node: VisionNode) => void;
}

export const CoherenceBeacon: React.FC<CoherenceBeaconProps> = ({
  nodes,
  onNodeSelected
}) => {
  const { user } = useAuth();
  const supabase = SupabaseService.getInstance().client;
  
  const [publicNodes, setPublicNodes] = useState<VisionNode[]>([]);
  const [evaluations, setEvaluations] = useState<Record<string, CoherenceEvaluation[]>>({});
  const [selectedNode, setSelectedNode] = useState<VisionNode | null>(null);
  const [evaluationData, setEvaluationData] = useState<Partial<CoherenceEvaluation>>({
    unity_score: 70,
    authenticity_score: 70,
    constructiveness_score: 70,
    evaluation_notes: ''
  });
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [stats, setStats] = useState<{
    averageUnity: number;
    averageAuthenticity: number;
    averageConstructiveness: number;
    averageOverall: number;
    totalEvaluations: number;
  }>({
    averageUnity: 0,
    averageAuthenticity: 0,
    averageConstructiveness: 0,
    averageOverall: 0,
    totalEvaluations: 0
  });
  const [searchQuery, setSearchQuery] = useState('');
  const [showHighCoherence, setShowHighCoherence] = useState(false);
  
  // Load public nodes for evaluation
  useEffect(() => {
    loadPublicNodes();
  }, []);
  
  const loadPublicNodes = async () => {
    setIsLoading(true);
    setError(null);
    
    try {
      // Load public nodes
      const { data: nodeData, error: nodeError } = await supabase
        .from('unity_vision_nodes')
        .select('*')
        .eq('is_public', true)
        .order('created_at', { ascending: false })
        .limit(50);
        
      if (nodeError) throw nodeError;
      
      setPublicNodes(nodeData || []);
      
      // Load evaluations for these nodes
      if (nodeData && nodeData.length > 0) {
        await loadEvaluations(nodeData.map(n => n.id));
      }
      
      // Load global coherence stats
      await loadCoherenceStats();
    } catch (err) {
      console.error('Error loading public nodes for coherence evaluation:', err);
      setError('Failed to load nodes for coherence evaluation. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };
  
  const loadEvaluations = async (nodeIds: string[]) => {
    try {
      const { data, error } = await supabase
        .from('unity_coherence_evaluations')
        .select('*')
        .in('node_id', nodeIds);
        
      if (error) throw error;
      
      // Group evaluations by node ID
      const grouped: Record<string, CoherenceEvaluation[]> = {};
      (data || []).forEach(eval_ => {
        if (!grouped[eval_.node_id]) {
          grouped[eval_.node_id] = [];
        }
        grouped[eval_.node_id].push(eval_);
      });
      
      setEvaluations(grouped);
    } catch (err) {
      console.error('Error loading evaluations:', err);
    }
  };
  
  const loadCoherenceStats = async () => {
    try {
      const { data, error } = await supabase
        .from('unity_coherence_evaluations')
        .select('unity_score, authenticity_score, constructiveness_score, overall_coherence_score');
        
      if (error) throw error;
      
      if (data && data.length > 0) {
        const sumUnity = data.reduce((sum, eval_) => sum + (eval_.unity_score || 0), 0);
        const sumAuthenticity = data.reduce((sum, eval_) => sum + (eval_.authenticity_score || 0), 0);
        const sumConstructiveness = data.reduce((sum, eval_) => sum + (eval_.constructiveness_score || 0), 0);
        const sumOverall = data.reduce((sum, eval_) => sum + (eval_.overall_coherence_score || 0), 0);
        
        setStats({
          averageUnity: Math.round(sumUnity / data.length),
          averageAuthenticity: Math.round(sumAuthenticity / data.length),
          averageConstructiveness: Math.round(sumConstructiveness / data.length),
          averageOverall: Math.round(sumOverall / data.length),
          totalEvaluations: data.length
        });
      }
    } catch (err) {
      console.error('Error loading coherence stats:', err);
    }
  };
  
  const handleSubmitEvaluation = async () => {
    if (!selectedNode || !user?.id) return;
    
    try {
      const evaluation = {
        ...evaluationData,
        node_id: selectedNode.id,
        evaluator_id: user.id
      };
      
      const { data, error } = await supabase
        .from('unity_coherence_evaluations')
        .insert(evaluation)
        .select()
        .single();
        
      if (error) throw error;
      
      // Add to evaluations
      setEvaluations(prev => ({
        ...prev,
        [selectedNode.id]: [...(prev[selectedNode.id] || []), data]
      }));
      
      // Clear form
      setEvaluationData({
        unity_score: 70,
        authenticity_score: 70,
        constructiveness_score: 70,
        evaluation_notes: ''
      });
      
      // Close detail view
      setSelectedNode(null);
      
      // Refresh to update resonance scores
      setTimeout(loadPublicNodes, 1000);
    } catch (err) {
      console.error('Error submitting evaluation:', err);
      setError('Failed to submit evaluation. Please try again.');
    }
  };
  
  const calculateAverageCoherence = (nodeId: string): number => {
    const nodeEvals = evaluations[nodeId] || [];
    if (nodeEvals.length === 0) return 0;
    
    const sum = nodeEvals.reduce((total, eval_) => total + (eval_.overall_coherence_score || 0), 0);
    return Math.round(sum / nodeEvals.length);
  };
  
  const hasUserEvaluated = (nodeId: string): boolean => {
    return (evaluations[nodeId] || []).some(eval_ => eval_.evaluator_id === user?.id);
  };
  
  const getCoherenceLevel = (score: number): string => {
    if (score >= 85) return 'Very High';
    if (score >= 70) return 'High';
    if (score >= 50) return 'Moderate';
    if (score >= 30) return 'Low';
    return 'Very Low';
  };
  
  const getCoherenceColor = (score: number): string => {
    if (score >= 85) return 'text-green-400';
    if (score >= 70) return 'text-green-300';
    if (score >= 50) return 'text-amber-300';
    if (score >= 30) return 'text-orange-400';
    return 'text-red-400';
  };
  
  // Filter nodes
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
    
    // High coherence filter
    if (showHighCoherence) {
      const coherenceScore = calculateAverageCoherence(node.id);
      if (coherenceScore < 70) {
        return false;
      }
    }
    
    return true;
  });
  
  // Sort by coherence score
  const sortedNodes = [...filteredNodes].sort((a, b) => {
    const aCoherence = calculateAverageCoherence(a.id);
    const bCoherence = calculateAverageCoherence(b.id);
    return bCoherence - aCoherence;
  });
  
  const renderNodeDetail = () => {
    if (!selectedNode) return null;
    
    const nodeEvaluations = evaluations[selectedNode.id] || [];
    const userHasEvaluated = hasUserEvaluated(selectedNode.id);
    const averageCoherence = calculateAverageCoherence(selectedNode.id);
    
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
              
              {nodeEvaluations.length > 0 && (
                <div>
                  <label className="block text-sm font-medium text-gray-400 mb-2">Previous Evaluations</label>
                  <div className="space-y-3 max-h-60 overflow-y-auto p-2">
                    {nodeEvaluations.map(eval_ => (
                      <div 
                        key={eval_.id} 
                        className="p-3 bg-slate-800 rounded-lg border border-gray-700"
                      >
                        <div className="grid grid-cols-3 gap-2 mb-2">
                          <div>
                            <div className="text-xs text-gray-400">Unity</div>
                            <div className="text-white">{eval_.unity_score}%</div>
                          </div>
                          <div>
                            <div className="text-xs text-gray-400">Authenticity</div>
                            <div className="text-white">{eval_.authenticity_score}%</div>
                          </div>
                          <div>
                            <div className="text-xs text-gray-400">Constructiveness</div>
                            <div className="text-white">{eval_.constructiveness_score}%</div>
                          </div>
                        </div>
                        
                        {eval_.evaluation_notes && (
                          <p className="text-gray-300 text-sm">{eval_.evaluation_notes}</p>
                        )}
                        
                        <div className="flex justify-between items-center mt-2 text-xs">
                          <div className="text-gray-500">
                            {new Date(eval_.created_at!).toLocaleString()}
                          </div>
                          
                          <div className="flex items-center gap-1">
                            <Gauge className="w-3 h-3 text-purple-400" />
                            <span className="text-purple-300">{eval_.overall_coherence_score}% Overall</span>
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
                <div className="text-xl font-bold text-purple-300">{selectedNode.frequency_hz}Hz</div>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-400 mb-1">Chakra</label>
                <div className="text-lg font-bold text-purple-300 capitalize">
                  {selectedNode.chakra_alignment?.replace('_', ' ')}
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-400 mb-1">Coherence Level</label>
                <div className={`text-lg font-bold ${getCoherenceColor(averageCoherence)}`}>
                  {getCoherenceLevel(averageCoherence)} ({averageCoherence}%)
                </div>
              </div>
              
              {nodeEvaluations.length > 0 ? (
                <div className="bg-purple-900/20 p-4 rounded-lg border border-purple-500/30">
                  <h4 className="text-white font-medium mb-2 flex items-center gap-2">
                    <Sparkles className="w-4 h-4 text-purple-400" />
                    Coherence Analysis
                  </h4>
                  <p className="text-purple-200 text-sm">
                    This vision has been evaluated by {nodeEvaluations.length} beacon participants and 
                    has an overall coherence score of {averageCoherence}%.
                  </p>
                </div>
              ) : (
                <div className="bg-amber-900/20 p-4 rounded-lg border border-amber-500/30">
                  <h4 className="text-amber-300 font-medium mb-2 flex items-center gap-2">
                    <AlertTriangle className="w-4 h-4" />
                    Not Yet Evaluated
                  </h4>
                  <p className="text-amber-200 text-sm">
                    This vision has not been evaluated yet. Be the first to assess its coherence.
                  </p>
                </div>
              )}
              
              {!userHasEvaluated && (
                <div className="pt-4 border-t border-gray-700 mt-4">
                  <h4 className="text-white font-medium mb-3">Evaluate Coherence</h4>
                  
                  <div className="space-y-4 mb-4">
                    <div>
                      <label className="block text-sm text-gray-300 mb-1 flex justify-between">
                        <span>Unity (Brings People Together)</span>
                        <span>{evaluationData.unity_score}%</span>
                      </label>
                      <input
                        type="range"
                        min="0"
                        max="100"
                        value={evaluationData.unity_score}
                        onChange={(e) => setEvaluationData({...evaluationData, unity_score: parseInt(e.target.value)})}
                        className="w-full"
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm text-gray-300 mb-1 flex justify-between">
                        <span>Authenticity</span>
                        <span>{evaluationData.authenticity_score}%</span>
                      </label>
                      <input
                        type="range"
                        min="0"
                        max="100"
                        value={evaluationData.authenticity_score}
                        onChange={(e) => setEvaluationData({...evaluationData, authenticity_score: parseInt(e.target.value)})}
                        className="w-full"
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm text-gray-300 mb-1 flex justify-between">
                        <span>Constructiveness</span>
                        <span>{evaluationData.constructiveness_score}%</span>
                      </label>
                      <input
                        type="range"
                        min="0"
                        max="100"
                        value={evaluationData.constructiveness_score}
                        onChange={(e) => setEvaluationData({...evaluationData, constructiveness_score: parseInt(e.target.value)})}
                        className="w-full"
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm text-gray-300 mb-1">
                        Notes (Optional)
                      </label>
                      <textarea
                        value={evaluationData.evaluation_notes || ''}
                        onChange={(e) => setEvaluationData({...evaluationData, evaluation_notes: e.target.value})}
                        placeholder="Any additional observations..."
                        className="w-full p-3 bg-slate-800 text-white rounded-lg border border-gray-600 focus:border-purple-400 focus:outline-none h-20"
                      />
                    </div>
                  </div>
                  
                  <button
                    onClick={handleSubmitEvaluation}
                    className="w-full py-2 bg-gradient-to-r from-purple-600 to-indigo-600 text-white rounded-lg hover:from-purple-700 hover:to-indigo-700 transition-all flex items-center justify-center gap-2"
                  >
                    <Save className="w-4 h-4" />
                    Submit Evaluation
                  </button>
                </div>
              )}
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
            <HeartHandshake className="w-6 h-6 text-purple-400" />
            <h2 className="text-xl font-bold text-white">Coherence Beacon</h2>
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
        
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <div className="bg-slate-800/50 p-4 rounded-lg border border-gray-700">
            <div className="text-2xl font-bold text-purple-300">{stats.averageUnity}%</div>
            <div className="text-sm text-gray-400">Avg. Unity Score</div>
          </div>
          
          <div className="bg-slate-800/50 p-4 rounded-lg border border-gray-700">
            <div className="text-2xl font-bold text-purple-300">{stats.averageAuthenticity}%</div>
            <div className="text-sm text-gray-400">Avg. Authenticity</div>
          </div>
          
          <div className="bg-slate-800/50 p-4 rounded-lg border border-gray-700">
            <div className="text-2xl font-bold text-purple-300">{stats.averageConstructiveness}%</div>
            <div className="text-sm text-gray-400">Avg. Constructiveness</div>
          </div>
          
          <div className="bg-slate-800/50 p-4 rounded-lg border border-gray-700">
            <div className="text-2xl font-bold text-purple-300">{stats.totalEvaluations}</div>
            <div className="text-sm text-gray-400">Total Evaluations</div>
          </div>
        </div>
        
        <div className="bg-purple-900/20 rounded-lg border border-purple-500/30 p-4 mb-6">
          <h3 className="text-white font-medium mb-2 flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-purple-400" />
            About the Coherence Beacon
          </h3>
          <p className="text-purple-200 text-sm">
            The Coherence Beacon evaluates content for unity, authenticity, and constructiveness.
            Help identify and promote visions that bring people together rather than dividing them.
            Your evaluations contribute to a more coherent collective consciousness.
          </p>
        </div>
        
        {/* Search and filter */}
        <div className="flex flex-col md:flex-row gap-4 mb-6">
          <div className="relative flex-grow">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500 w-4 h-4" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search nodes to evaluate..."
              className="w-full pl-10 p-2 bg-slate-800 text-white rounded-lg border border-gray-600 focus:border-purple-400 focus:outline-none"
            />
          </div>
          
          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              id="high-coherence"
              checked={showHighCoherence}
              onChange={(e) => setShowHighCoherence(e.target.checked)}
              className="mr-1 rounded"
            />
            <label htmlFor="high-coherence" className="text-sm text-gray-300">
              Show High Coherence Only
            </label>
          </div>
        </div>
        
        {/* Nodes for evaluation */}
        {isLoading ? (
          <div className="text-center py-8">
            <div className="w-12 h-12 border-4 border-purple-400/30 border-t-purple-400 rounded-full animate-spin mx-auto mb-4"></div>
            <p className="text-purple-300">Loading nodes for evaluation...</p>
          </div>
        ) : sortedNodes.length === 0 ? (
          <div className="text-center py-8">
            <HeartHandshake className="w-16 h-16 mx-auto mb-4 text-gray-500 opacity-50" />
            <p className="text-gray-300 mb-2">No nodes available for evaluation</p>
            {searchQuery || showHighCoherence ? (
              <button
                onClick={() => {
                  setSearchQuery('');
                  setShowHighCoherence(false);
                }}
                className="text-purple-400 hover:text-purple-300 transition-colors"
              >
                Clear Filters
              </button>
            ) : (
              <p className="text-gray-500 text-sm">
                Make your vision nodes public to allow others to evaluate them
              </p>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {sortedNodes.map(node => {
              const coherenceScore = calculateAverageCoherence(node.id);
              const userEvaluated = hasUserEvaluated(node.id);
              const evaluationCount = (evaluations[node.id] || []).length;
              
              return (
                <motion.div
                  key={node.id}
                  className={`bg-slate-800/50 backdrop-blur-sm rounded-lg border overflow-hidden transition-all cursor-pointer ${
                    userEvaluated 
                      ? 'border-green-500/40' 
                      : coherenceScore >= 70 
                        ? 'border-purple-500/40' 
                        : 'border-gray-700 hover:border-purple-500/20'
                  }`}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => setSelectedNode(node)}
                >
                  {/* Coherence indicator */}
                  <div className="h-1.5 w-full bg-gray-700">
                    <div 
                      className="h-full bg-gradient-to-r from-purple-500 to-indigo-500"
                      style={{ width: `${coherenceScore}%` }}
                    ></div>
                  </div>
                  
                  {/* Node content */}
                  <div className="p-4">
                    <div className="flex justify-between items-start mb-2">
                      <h3 className="font-bold text-white">{node.title}</h3>
                      
                      <div className={`px-2 py-1 rounded-full text-xs font-medium ${getCoherenceColor(coherenceScore)} bg-slate-800`}>
                        {coherenceScore}%
                      </div>
                    </div>
                    
                    {node.description && (
                      <p className="text-gray-300 text-sm mb-3 line-clamp-2">{node.description}</p>
                    )}
                    
                    <div className="flex flex-wrap gap-1 mb-3">
                      {(node.tags || []).slice(0, 3).map((tag, idx) => (
                        <div key={idx} className="px-2 py-0.5 bg-slate-700 rounded-full text-xs text-gray-300">
                          {tag}
                        </div>
                      ))}
                    </div>
                    
                    <div className="flex justify-between items-center text-xs">
                      <div className="flex items-center gap-1 text-gray-400">
                        <Shield className="w-3 h-3" />
                        <span>{evaluationCount} evaluations</span>
                      </div>
                      
                      {userEvaluated ? (
                        <div className="text-green-400 flex items-center gap-1">
                          <CheckCircle className="w-3 h-3" />
                          Evaluated
                        </div>
                      ) : (
                        <div className="text-purple-300">Evaluate now</div>
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