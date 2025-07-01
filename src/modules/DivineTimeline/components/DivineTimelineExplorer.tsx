import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../../../contexts/AuthContext';
import { SupabaseService } from '../../../services/SupabaseService';
import { TimelineNode, TimelinePath, TimelineReflection, TimelineActivation } from '../DivineTimelineModule';
import { TimelineVisualizer } from './TimelineVisualizer';
import { NodeDetailsPanel } from './NodeDetailsPanel';
import { PathSelector } from './PathSelector';
import { TimelineActivator } from './TimelineActivator';
import { ReflectionJournal } from './ReflectionJournal';
import { HelpButton } from '../../../components/HelpButton';
import {
  Clock,
  CornerUpRight,
  Calendar,
  Star,
  Sparkles,
  Target,
  Brain,
  ArrowRight,
  RefreshCw,
  AlertTriangle,
  Compass,
  Map
} from 'lucide-react';

type TimelineView = 'overview' | 'node-details' | 'path' | 'activation' | 'reflection' | 'journal';

export const DivineTimelineExplorer: React.FC = () => {
  const { user } = useAuth();
  const supabase = SupabaseService.getInstance().client;
  
  const [activeView, setActiveView] = useState<TimelineView>('overview');
  const [timelineNodes, setTimelineNodes] = useState<TimelineNode[]>([]);
  const [timelinePaths, setTimelinePaths] = useState<TimelinePath[]>([]);
  const [selectedNode, setSelectedNode] = useState<TimelineNode | null>(null);
  const [selectedPath, setSelectedPath] = useState<TimelinePath | null>(null);
  const [reflections, setReflections] = useState<TimelineReflection[]>([]);
  const [activations, setActivations] = useState<TimelineActivation[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [analyzeResults, setAnalyzeResults] = useState<Record<string, any> | null>(null);
  
  useEffect(() => {
    if (user?.id) {
      loadTimeline();
    }
  }, [user?.id]);
  
  const loadTimeline = async () => {
    if (!user?.id) return;
    
    setIsLoading(true);
    setError(null);
    
    try {
      console.log('[DivineTimelineExplorer] Loading timeline data...');
      
      // Check if timeline exists
      const { data: existingNodes, error: nodesError } = await supabase
        .from('timeline_nodes')
        .select('*')
        .eq('user_id', user.id);
      
      if (nodesError) throw nodesError;
      
      console.log('[DivineTimelineExplorer] Fetched nodes:', existingNodes?.length || 0);
      
      if (existingNodes && existingNodes.length > 0) {
        // Timeline exists, load it
        setTimelineNodes(existingNodes);
        
        // Load paths
        const { data: pathsData, error: pathsError } = await supabase
          .from('timeline_paths')
          .select('*')
          .eq('user_id', user.id);
        
        if (pathsError) throw pathsError;
        
        console.log('[DivineTimelineExplorer] Fetched paths:', pathsData?.length || 0);
        setTimelinePaths(pathsData || []);
        
        // Load reflections
        const { data: reflectionsData, error: reflectionsError } = await supabase
          .from('timeline_reflections')
          .select('*')
          .eq('user_id', user.id);
        
        if (reflectionsError) throw reflectionsError;
        
        console.log('[DivineTimelineExplorer] Fetched reflections:', reflectionsData?.length || 0);
        setReflections(reflectionsData || []);
        
        // Load activations
        const { data: activationsData, error: activationsError } = await supabase
          .from('timeline_activations')
          .select('*')
          .eq('user_id', user.id);
        
        if (activationsError) throw activationsError;
        
        console.log('[DivineTimelineExplorer] Fetched activations:', activationsData?.length || 0);
        setActivations(activationsData || []);
        
        // Analyze trends
        await analyzeConsciousnessTrends();
      } else {
        // No timeline, need to generate one
        setTimelineNodes([]);
        setTimelinePaths([]);
      }
    } catch (err) {
      console.error('Error loading timeline data:', err);
      setError('Failed to load your divine timeline. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };
  
  const renderEmptyState = () => (
    <div className="bg-slate-900/70 backdrop-blur-sm rounded-xl border border-purple-500/20 p-8">
      <div className="text-center max-w-md mx-auto">
        <div className="relative mb-6">
          <div className="w-24 h-24 mx-auto bg-gradient-to-br from-purple-600/20 to-indigo-600/20 rounded-full flex items-center justify-center">
            <Map className="w-12 h-12 text-purple-400" />
          </div>
          <div className="absolute inset-0 w-24 h-24 mx-auto border-2 border-purple-400/30 rounded-full animate-pulse"></div>
        </div>
        
        <h3 className="text-xl font-bold text-white mb-3">Your Divine Timeline Awaits</h3>
        <p className="text-gray-400 mb-6">
          Discover your spiritual evolution path and potential future scenarios. 
          Generate your personalized timeline to explore past insights, present awareness, and future possibilities.
        </p>
        
        <div className="space-y-4 mb-6">
          <div className="flex items-center gap-3 text-sm text-gray-300">
            <div className="p-1 bg-purple-600/20 rounded-full">
              <Target className="w-4 h-4 text-purple-400" />
            </div>
            <span>Explore consciousness expansion nodes</span>
          </div>
          <div className="flex items-center gap-3 text-sm text-gray-300">
            <div className="p-1 bg-indigo-600/20 rounded-full">
              <CornerUpRight className="w-4 h-4 text-indigo-400" />
            </div>
            <span>Navigate multiple evolutionary paths</span>
          </div>
          <div className="flex items-center gap-3 text-sm text-gray-300">
            <div className="p-1 bg-cyan-600/20 rounded-full">
              <Star className="w-4 h-4 text-cyan-400" />
            </div>
            <span>Activate future potentials through intention</span>
          </div>
        </div>
        
        <button
          onClick={generateTimeline}
          disabled={isGenerating}
          className="w-full px-6 py-3 bg-gradient-to-r from-purple-600 to-indigo-600 text-white rounded-lg hover:from-purple-700 hover:to-indigo-700 transition-all flex items-center justify-center gap-3 disabled:opacity-50 font-medium"
        >
          {isGenerating ? (
            <>
              <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
              Mapping Your Timeline...
            </>
          ) : (
            <>
              <Sparkles className="w-5 h-5" />
              Generate My Divine Timeline
            </>
          )}
        </button>
        
        <p className="text-xs text-gray-500 mt-4">
          This will create a personalized map of your spiritual evolution based on consciousness principles.
        </p>
      </div>
    </div>
  );
  
  const generateTimeline = async () => {
    if (!user?.id) return;
    
    setIsGenerating(true);
    setError(null);
    
    try {
      console.log('[DivineTimelineExplorer] Generating new timeline...');
      
      // Generate a set of nodes representing past, present, and future points
      const presentNode: Partial<TimelineNode> = {
        user_id: user.id,
        title: 'Current Awareness',
        description: 'Your present state of consciousness and spiritual awareness',
        timeline_position: 'present',
        probability: 100,
        consciousness_level: 50,
        chakra_focus: 'heart',
        time_distance: 0,
        is_pivot_point: true,
        is_activated: true
      };
      
      // Create present node
      const { data: presentData, error: presentError } = await supabase
        .from('timeline_nodes')
        .insert(presentNode)
        .select()
        .single();
      
      if (presentError) throw presentError;
      console.log('[DivineTimelineExplorer] Created present node:', presentData);
      
      // Create past nodes
      const pastNodes = [
        {
          user_id: user.id,
          title: 'Spiritual Awakening',
          description: 'The initial call to your spiritual journey that opened your awareness',
          timeline_position: 'past' as const,
          probability: 100,
          consciousness_level: 30,
          chakra_focus: 'third-eye',
          time_distance: -90, // 3 months ago
          is_pivot_point: true,
          is_activated: true
        },
        {
          user_id: user.id,
          title: 'Heart Opening',
          description: 'A significant emotional healing that expanded your capacity for compassion',
          timeline_position: 'past' as const,
          probability: 100,
          consciousness_level: 40,
          chakra_focus: 'heart',
          time_distance: -30, // 1 month ago
          is_pivot_point: false,
          is_activated: true
        }
      ];
      
      const { data: pastData, error: pastError } = await supabase
        .from('timeline_nodes')
        .insert(pastNodes)
        .select();
      
      if (pastError) throw pastError;
      console.log('[DivineTimelineExplorer] Created past nodes:', pastData?.length || 0);
      
      // Create future nodes
      const futureNodes = [
        // Optimal path nodes
        {
          user_id: user.id,
          title: 'Sacred Integration',
          description: 'Integration of spiritual insights into daily consciousness',
          timeline_position: 'future' as const,
          probability: 85,
          consciousness_level: 60,
          chakra_focus: 'solar',
          time_distance: 30, // 1 month ahead
          guidance: 'Focus on grounding spiritual insights through daily practice and journaling',
          is_pivot_point: false,
          is_activated: false
        },
        {
          user_id: user.id,
          title: 'Higher Self Connection',
          description: 'Establishing a clear channel to your higher self guidance',
          timeline_position: 'future' as const,
          probability: 70,
          consciousness_level: 75,
          chakra_focus: 'crown',
          time_distance: 90, // 3 months ahead
          guidance: 'Develop a meditation practice focused on crown chakra activation and higher self communication',
          is_pivot_point: true,
          is_activated: false
        },
        {
          user_id: user.id,
          title: 'Divine Purpose Activation',
          description: 'Clear recognition and embodiment of your divine purpose',
          timeline_position: 'future' as const,
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
          user_id: user.id,
          title: 'Shadow Integration',
          description: 'Confronting and integrating shadow aspects of yourself',
          timeline_position: 'future' as const,
          probability: 50,
          consciousness_level: 65,
          chakra_focus: 'sacral',
          time_distance: 45, // 1.5 months ahead
          guidance: 'Be willing to face uncomfortable emotions and patterns with compassion',
          is_pivot_point: true,
          is_activated: false
        },
        {
          user_id: user.id,
          title: 'Spiritual Test',
          description: 'A challenging situation that tests your spiritual growth and commitment',
          timeline_position: 'future' as const,
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
          user_id: user.id,
          title: 'Kundalini Awakening',
          description: 'Activation of the kundalini energy and rapid consciousness expansion',
          timeline_position: 'future' as const,
          probability: 30,
          consciousness_level: 90,
          chakra_focus: 'crown',
          time_distance: 270, // 9 months ahead
          guidance: 'Prepare your energetic system through purification practices and proper grounding',
          is_pivot_point: true,
          is_activated: false
        },
        {
          user_id: user.id,
          title: 'Cosmic Consciousness',
          description: 'Expansion into unity consciousness and cosmic awareness',
          timeline_position: 'future' as const,
          probability: 20,
          consciousness_level: 95,
          chakra_focus: 'crown',
          time_distance: 365, // 1 year ahead
          guidance: 'Balance expanded awareness with practical grounding and embodiment',
          is_pivot_point: false,
          is_activated: false
        }
      ];
      
      const { data: futureData, error: futureError } = await supabase
        .from('timeline_nodes')
        .insert(futureNodes)
        .select();
      
      if (futureError) throw futureError;
      console.log('[DivineTimelineExplorer] Created future nodes:', futureData?.length || 0);
      
      // Combine all nodes
      const allNodes = [presentData, ...(pastData || []), ...(futureData || [])];
      setTimelineNodes(allNodes);
      
      // Create timeline paths
      await createTimelinePaths(user.id, allNodes);
      
      // Load complete timeline
      await loadTimeline();
      
    } catch (err) {
      console.error('Error generating timeline:', err);
      setError('Failed to generate your divine timeline. Please try again.');
    } finally {
      setIsGenerating(false);
    }
  };
  
  const createTimelinePaths = async (userId: string, nodes: TimelineNode[]) => {
    try {
      console.log('[DivineTimelineExplorer] Creating timeline paths...');
      
      // Find the present node
      const presentNode = nodes.find(n => n.timeline_position === 'present');
      if (!presentNode) return;
      
      // Organize future nodes by probability
      const futureNodes = nodes.filter(n => n.timeline_position === 'future');
      const optimalNodes = futureNodes.filter(n => n.probability >= 60);
      const challengeNodes = futureNodes.filter(n => n.probability < 60 && n.probability >= 40);
      const transcendentNodes = futureNodes.filter(n => n.probability < 40);
      
      // Create path objects
      const paths: Partial<TimelinePath>[] = [
        {
          user_id: userId,
          title: 'Optimal Evolution',
          description: 'The most balanced path for your consciousness evolution with steady growth',
          nodes: [presentNode.id, ...optimalNodes.map(n => n.id)],
          probability: 70,
          path_type: 'optimal',
          consciousness_delta: 35 // From 50 to 85
        },
        {
          user_id: userId,
          title: 'Shadow Integration',
          description: 'A challenging but transformative path requiring deep shadow work',
          nodes: [presentNode.id, ...challengeNodes.map(n => n.id)],
          probability: 45,
          path_type: 'challenge',
          consciousness_delta: 20 // From 50 to 70
        }
      ];
      
      // Add transcendent path if there are nodes for it
      if (transcendentNodes.length > 0) {
        paths.push({
          user_id: userId,
          title: 'Cosmic Awakening',
          description: 'A rare and profound path leading to extraordinary expansion of consciousness',
          nodes: [presentNode.id, ...transcendentNodes.map(n => n.id)],
          probability: 25,
          path_type: 'transcendent',
          consciousness_delta: 45 // From 50 to 95
        });
      }
      
      // Insert paths into database
      const { data, error } = await supabase
        .from('timeline_paths')
        .insert(paths)
        .select();
      
      if (error) throw error;
      console.log('[DivineTimelineExplorer] Created timeline paths:', data?.length || 0);
      
      setTimelinePaths(data);
      
    } catch (err) {
      console.error('Error creating timeline paths:', err);
      throw err;
    }
  };
  
  const activateTimelineNode = async (nodeId: string, activationType: string, details: string) => {
    if (!user?.id || !nodeId) return;
    
    setIsLoading(true);
    setError(null);
    
    try {
      console.log(`[DivineTimelineExplorer] Activating node: ${nodeId}`);
      // Create activation record
      const { data: activationData, error: activationError } = await supabase
        .from('timeline_activations')
        .insert({
          user_id: user.id,
          node_id: nodeId,
          activation_type: activationType,
          activation_details: details
        })
        .select()
        .single();
      
      if (activationError) throw activationError;
      
      // Update node to activated state
      const { error: nodeError } = await supabase
        .from('timeline_nodes')
        .update({ is_activated: true })
        .eq('id', nodeId)
        .eq('user_id', user.id);
      
      if (nodeError) throw nodeError;
      
      console.log('[DivineTimelineExplorer] Node activated successfully');
      
      // Refresh data
      await loadTimeline();
      
      // If this was the selected node, update it
      if (selectedNode && selectedNode.id === nodeId) {
        const updatedNode = timelineNodes.find(n => n.id === nodeId);
        if (updatedNode) {
          setSelectedNode({
            ...updatedNode,
            is_activated: true
          });
        }
      }
      
      // Add the new activation to the list
      setActivations(prev => [activationData, ...prev]);
      
      // Switch to reflection view
      setActiveView('reflection');
    } catch (err) {
      console.error('Error activating timeline node:', err);
      setError('Failed to activate timeline node. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };
  
  const addReflection = async (text: string) => {
    if (!user?.id || !selectedNode) return;
    
    setIsLoading(true);
    setError(null);
    
    try {
      console.log(`[DivineTimelineExplorer] Adding reflection for node: ${selectedNode.id}`);
      
      // Calculate consciousness shift (simple simulation)
      const wordCount = text.split(' ').length;
      const consciousnessShift = Math.min(10, Math.max(1, Math.floor(wordCount / 20)));
      
      const { data, error } = await supabase
        .from('timeline_reflections')
        .insert({
          user_id: user.id,
          node_id: selectedNode.id,
          reflection_text: text,
          consciousness_shift: consciousnessShift
        })
        .select()
        .single();
      
      if (error) throw error;
      
      console.log('[DivineTimelineExplorer] Reflection added successfully');
      
      // Add to reflections list
      setReflections(prev => [data, ...prev]);
      
      // Reload timeline to update consciousness levels
      await loadTimeline();
      
      // Switch back to node details
      setActiveView('node-details');
    } catch (err) {
      console.error('Error adding reflection:', err);
      setError('Failed to save your reflection. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };
  
  const analyzeConsciousnessTrends = async () => {
    if (!user?.id || timelineNodes.length === 0) return;
    
    setIsLoading(true);
    
    try {
      console.log('[DivineTimelineExplorer] Analyzing consciousness trends...');
      
      // Get all activated nodes
      const activatedNodes = timelineNodes.filter(node => node.is_activated);
      
      // Simple trend analysis
      const consciousnessLevels = activatedNodes.map(node => node.consciousness_level);
      const totalReflectionShift = reflections.reduce((sum, r) => sum + r.consciousness_shift, 0);
      const averageLevel = consciousnessLevels.reduce((sum, level) => sum + level, 0) / 
        (consciousnessLevels.length || 1);
      
      const nodeDates = activatedNodes.map(node => {
        const date = new Date();
        date.setDate(date.getDate() + node.time_distance);
        return date.toISOString().split('T')[0];
      });
      
      const results = {
        consciousnessLevels,
        nodeDates,
        averageLevel,
        totalReflectionShift,
        reflectionsCount: reflections.length,
        activatedNodesCount: activatedNodes.length,
        trend: consciousnessLevels.length > 1 ? 
          (consciousnessLevels[consciousnessLevels.length - 1] - consciousnessLevels[0]) : 0
      };
      
      console.log('[DivineTimelineExplorer] Analysis results:', results);
      setAnalyzeResults(results);
    } catch (err) {
      console.error('Error analyzing consciousness trends:', err);
    } finally {
      setIsLoading(false);
    }
  };
  
  const handleNodeClick = (node: TimelineNode) => {
    setSelectedNode(node);
    setActiveView('node-details');
  };
  
  const handlePathClick = (path: TimelinePath) => {
    setSelectedPath(path);
    setActiveView('path');
  };
  
  const handleActivateClick = () => {
    if (selectedNode) {
      setActiveView('activation');
    }
  };
  
  const getNodeReflections = (nodeId: string) => {
    return reflections.filter(r => r.node_id === nodeId);
  };
  
  const getNodeActivations = (nodeId: string) => {
    return activations.filter(a => a.node_id === nodeId);
  };

  const renderTimelineHeader = () => (
    <div className="bg-slate-900/70 backdrop-blur-sm rounded-xl border border-purple-500/20 p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-2xl font-bold text-white flex items-center gap-2">
            <Map className="w-6 h-6 text-purple-400" />
            Divine Timeline
          </h2>
          <p className="text-purple-300">Navigate your potential futures and consciousness evolution</p>
        </div>
        
        <div className="flex items-center gap-3">
          <HelpButton moduleType="divine-timeline" />
          
          {timelineNodes.length > 0 && (
            <button
              onClick={analyzeConsciousnessTrends}
              className="p-2 text-gray-400 hover:text-white transition-colors"
              title="Analyze Consciousness Trends"
            >
              <Brain className="w-5 h-5" />
            </button>
          )}
          
          {timelineNodes.length > 0 && (
            <button 
              onClick={() => setActiveView('journal')}
              className="px-3 py-1 bg-purple-600/20 text-purple-300 rounded border border-purple-500/30 hover:bg-purple-600/30 transition-colors text-sm"
            >
              Reflection Journal
            </button>
          )}
          
          {timelineNodes.length === 0 && (
            <button
              onClick={generateTimeline}
              disabled={isGenerating}
              className="px-4 py-2 bg-gradient-to-r from-purple-600 to-indigo-600 text-white rounded-lg hover:from-purple-700 hover:to-indigo-700 transition-all flex items-center gap-2 disabled:opacity-50"
            >
              {isGenerating ? (
                <>
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  Generating...
                </>
              ) : (
                <>
                  <Sparkles className="w-5 h-5" />
                  Generate Timeline
                </>
              )}
            </button>
          )}
        </div>
      </div>
      
      {/* Navigation tabs for different views */}
      {timelineNodes.length > 0 && (
        <div className="flex border-b border-gray-700 mb-4 overflow-x-auto pb-1">
          <button
            onClick={() => setActiveView('overview')}
            className={`px-4 py-2 whitespace-nowrap font-medium ${
              activeView === 'overview'
                ? 'text-purple-400 border-b-2 border-purple-400'
                : 'text-gray-400 hover:text-white'
            }`}
          >
            <Map className="w-4 h-4 inline mr-1" />
            Timeline
          </button>
          
          {selectedNode && (
            <button
              onClick={() => setActiveView('node-details')}
              className={`px-4 py-2 whitespace-nowrap font-medium ${
                activeView === 'node-details'
                  ? 'text-purple-400 border-b-2 border-purple-400'
                  : 'text-gray-400 hover:text-white'
              }`}
            >
              <Target className="w-4 h-4 inline mr-1" />
              Node Details
            </button>
          )}
          
          {selectedPath && (
            <button
              onClick={() => setActiveView('path')}
              className={`px-4 py-2 whitespace-nowrap font-medium ${
                activeView === 'path'
                  ? 'text-purple-400 border-b-2 border-purple-400'
                  : 'text-gray-400 hover:text-white'
              }`}
            >
              <CornerUpRight className="w-4 h-4 inline mr-1" />
              Path Details
            </button>
          )}
          
          <button
            onClick={() => setActiveView('journal')}
            className={`px-4 py-2 whitespace-nowrap font-medium ${
              activeView === 'journal'
                ? 'text-purple-400 border-b-2 border-purple-400'
                : 'text-gray-400 hover:text-white'
            }`}
          >
            <Calendar className="w-4 h-4 inline mr-1" />
            Reflection Journal
          </button>
        </div>
      )}
      
      {/* Error display */}
      <AnimatePresence>
        {error && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="bg-red-900/20 text-red-300 p-3 rounded-lg mb-4 flex items-center gap-2"
          >
            <AlertTriangle className="w-4 h-4" />
            <div>{error}</div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );

  // If no nodes, show empty state with generation option
  if (timelineNodes.length === 0 && !isLoading) {
    return (
      <div className="space-y-6">
        {renderTimelineHeader()}
        {renderEmptyState()}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {renderTimelineHeader()}
      
      {isLoading ? (
        <div className="bg-slate-900/70 backdrop-blur-sm rounded-xl border border-purple-500/20 p-8 text-center">
          <div className="relative">
            <div className="w-16 h-16 border-4 border-purple-400/30 border-t-purple-400 rounded-full animate-spin mx-auto mb-4"></div>
            <div className="absolute inset-0 w-16 h-16 border-4 border-cyan-400/20 border-b-cyan-400 rounded-full animate-spin mx-auto" style={{ animationDirection: 'reverse', animationDuration: '1.5s' }}></div>
          </div>
          <p className="text-purple-300">
            {isGenerating ? 'Mapping your divine timeline...' : 'Loading timeline data...'}
          </p>
        </div>
      ) : (
        <AnimatePresence mode="wait">
          {activeView === 'overview' && (
            <motion.div
              key="overview"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.3 }}
            >
              <TimelineVisualizer 
                nodes={timelineNodes} 
                paths={timelinePaths} 
                onNodeClick={handleNodeClick}
                onPathClick={handlePathClick}
                analyzeResults={analyzeResults}
              />
              
              {/* Path Overview Cards */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-6">
                {timelinePaths.map(path => (
                  <motion.div
                    key={path.id}
                    className="bg-slate-800/70 backdrop-blur-sm rounded-lg border border-gray-700 hover:border-purple-500/30 p-4 cursor-pointer"
                    whileHover={{ scale: 1.02 }}
                    onClick={() => handlePathClick(path)}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <h3 className="font-medium text-white">{path.title}</h3>
                      <div className="text-xs px-2 py-1 rounded-full bg-purple-900/20 text-purple-300">
                        {path.probability}% Probable
                      </div>
                    </div>
                    
                    <p className="text-gray-400 text-sm mb-3">{path.description}</p>
                    
                    <div className="flex justify-between items-center text-xs text-gray-500">
                      <div>
                        <span className="text-purple-300">+{path.consciousness_delta}</span> consciousness
                      </div>
                      <div className="text-purple-300">
                        {path.nodes.length} nodes
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            </motion.div>
          )}
          
          {activeView === 'node-details' && selectedNode && (
            <motion.div
              key="node-details"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.3 }}
            >
              <NodeDetailsPanel 
                node={selectedNode}
                reflections={getNodeReflections(selectedNode.id)}
                activations={getNodeActivations(selectedNode.id)}
                onActivate={handleActivateClick}
                onBack={() => setActiveView('overview')}
              />
            </motion.div>
          )}
          
          {activeView === 'path' && selectedPath && (
            <motion.div
              key="path"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.3 }}
            >
              <PathSelector
                path={selectedPath}
                nodes={timelineNodes.filter(node => selectedPath.nodes.includes(node.id))}
                onNodeClick={handleNodeClick}
                onBack={() => setActiveView('overview')}
              />
            </motion.div>
          )}
          
          {activeView === 'activation' && selectedNode && (
            <motion.div
              key="activation"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.3 }}
            >
              <TimelineActivator
                node={selectedNode}
                onActivate={activateTimelineNode}
                onCancel={() => setActiveView('node-details')}
                isLoading={isLoading}
              />
            </motion.div>
          )}
          
          {activeView === 'reflection' && selectedNode && (
            <motion.div
              key="reflection"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.3 }}
            >
              <ReflectionJournal
                node={selectedNode}
                onSubmit={addReflection}
                onCancel={() => setActiveView('node-details')}
                isLoading={isLoading}
              />
            </motion.div>
          )}
          
          {activeView === 'journal' && (
            <motion.div
              key="journal-all"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.3 }}
            >
              <div className="bg-slate-900/70 backdrop-blur-sm rounded-xl border border-purple-500/20 p-6">
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-lg font-semibold text-white">Reflection Journal</h3>
                  <button
                    onClick={() => setActiveView('overview')}
                    className="px-3 py-1 bg-slate-800 text-gray-300 rounded-lg hover:bg-slate-700 transition-colors text-sm"
                  >
                    Back to Timeline
                  </button>
                </div>
                
                {reflections.length === 0 ? (
                  <div className="text-center py-8 text-gray-500">
                    <Calendar className="w-8 h-8 mx-auto mb-2 opacity-50" />
                    <p>No reflections yet. Activate timeline nodes to add reflections.</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {reflections.map(reflection => {
                      const node = timelineNodes.find(n => n.id === reflection.node_id);
                      return (
                        <div 
                          key={reflection.id}
                          className="bg-slate-800/50 rounded-lg border border-gray-700 p-4"
                        >
                          <div className="flex items-start justify-between mb-3">
                            <div className="flex items-center gap-2">
                              <div className="p-2 bg-purple-900/20 rounded-full">
                                <Target className="w-4 h-4 text-purple-400" />
                              </div>
                              <div>
                                <h4 className="text-white font-medium">{node?.title || 'Unknown Node'}</h4>
                                <div className="text-xs text-gray-400">{new Date(reflection.created_at!).toLocaleString()}</div>
                              </div>
                            </div>
                            <div className="px-2 py-1 bg-green-900/20 text-green-300 rounded text-xs">
                              +{reflection.consciousness_shift} Consciousness
                            </div>
                          </div>
                          
                          <div className="mt-2 ml-9 pl-3 border-l border-purple-500/30">
                            <div className="text-sm text-gray-300">"{reflection.reflection_text}"</div>
                          </div>
                          
                          <button
                            onClick={() => {
                              if (node) {
                                setSelectedNode(node);
                                setActiveView('node-details');
                              }
                            }}
                            className="mt-3 text-purple-400 hover:text-purple-300 text-xs flex items-center gap-1"
                          >
                            <ArrowRight className="w-3 h-3" />
                            View Node
                          </button>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      )}
    </div>
  );
};