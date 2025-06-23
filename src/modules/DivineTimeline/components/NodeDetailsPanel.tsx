import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { TimelineNode, TimelineReflection, TimelineActivation } from '../DivineTimelineModule';
import { 
  ArrowLeft, 
  Target, 
  Sparkles, 
  Calendar, 
  Brain,
  Map,
  Compass,
  Clock,
  MessageSquare,
  User,
  Zap
} from 'lucide-react';

interface NodeDetailsPanelProps {
  node: TimelineNode;
  reflections: TimelineReflection[];
  activations: TimelineActivation[];
  onActivate: () => void;
  onBack: () => void;
}

export const NodeDetailsPanel: React.FC<NodeDetailsPanelProps> = ({
  node,
  reflections,
  activations,
  onActivate,
  onBack
}) => {
  const getChakraColor = (chakra: string) => {
    switch (chakra) {
      case 'root': return '#DC2626';
      case 'sacral': return '#EA580C';
      case 'solar': return '#FACC15';
      case 'heart': return '#22C55E';
      case 'throat': return '#3B82F6';
      case 'third-eye': return '#6366F1';
      case 'crown': return '#9333EA';
      default: return '#6B7280';
    }
  };

  const formatDate = (timeDistance: number) => {
    const today = new Date();
    const date = new Date();
    date.setDate(today.getDate() + timeDistance);
    
    return date.toLocaleDateString(undefined, {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };
  
  const getTimelineText = (position: string, timeDistance: number) => {
    if (position === 'present') {
      return 'Present Moment';
    } else if (position === 'past') {
      return `${Math.abs(timeDistance)} days ago`;
    } else {
      return `${timeDistance} days in the future`;
    }
  };

  return (
    <div className="bg-slate-900/70 backdrop-blur-sm rounded-xl border border-purple-500/20 p-6">
      {/* Header */}
      <div className="flex items-start justify-between mb-6">
        <div className="flex items-start gap-3">
          <button
            onClick={onBack}
            className="p-2 text-gray-400 hover:text-white transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-xl font-bold text-white">{node.title}</h2>
              {node.is_activated && (
                <div className="px-2 py-1 bg-green-900/20 text-green-300 rounded-lg text-xs">
                  Activated
                </div>
              )}
            </div>
            <div className="text-sm text-gray-400">
              {getTimelineText(node.timeline_position, node.time_distance)}
            </div>
          </div>
        </div>
        
        {node.timeline_position === 'future' && !node.is_activated && (
          <motion.button
            onClick={onActivate}
            className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors flex items-center gap-2"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <Sparkles className="w-4 h-4" />
            Activate Node
          </motion.button>
        )}
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main content */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-slate-800/50 rounded-lg border border-gray-700 p-6">
            <p className="text-white leading-relaxed mb-4">{node.description}</p>
            
            <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
              <div className="p-3 bg-slate-900/50 rounded-lg">
                <div className="text-xs text-gray-400 mb-1">Timeline Position</div>
                <div className="text-white font-medium capitalize">{node.timeline_position}</div>
              </div>
              
              <div className="p-3 bg-slate-900/50 rounded-lg">
                <div className="text-xs text-gray-400 mb-1">Consciousness Level</div>
                <div className="text-white font-medium">{node.consciousness_level}/100</div>
              </div>
              
              <div className="p-3 bg-slate-900/50 rounded-lg">
                <div className="text-xs text-gray-400 mb-1">Probability</div>
                <div className="text-white font-medium">{node.probability}%</div>
              </div>
            </div>
            
            {node.guidance && (
              <div className="mt-4 p-4 bg-purple-900/20 rounded-lg border border-purple-500/30">
                <div className="flex items-start gap-3">
                  <Compass className="w-5 h-5 text-purple-400 flex-shrink-0" />
                  <div>
                    <h4 className="text-white font-medium mb-1">Divine Guidance</h4>
                    <p className="text-purple-200 text-sm">{node.guidance}</p>
                  </div>
                </div>
              </div>
            )}
          </div>
          
          {/* Reflections */}
          <div className="bg-slate-800/50 rounded-lg border border-gray-700 p-6">
            <h3 className="text-lg font-medium text-white mb-4 flex items-center gap-2">
              <MessageSquare className="w-5 h-5 text-blue-400" />
              Reflections
            </h3>
            
            {reflections.length === 0 ? (
              <div className="text-center py-6 text-gray-400">
                {node.is_activated ? (
                  <p>No reflections yet. Add your thoughts about this node.</p>
                ) : (
                  <p>Activate this node to add reflections.</p>
                )}
              </div>
            ) : (
              <div className="space-y-4">
                {reflections.map(reflection => (
                  <div 
                    key={reflection.id}
                    className="p-4 bg-slate-700/40 rounded-lg border border-slate-600"
                  >
                    <div className="flex items-center justify-between mb-3">
                      <div className="text-xs text-gray-400">
                        {new Date(reflection.created_at!).toLocaleString()}
                      </div>
                      <div className="px-2 py-1 bg-green-900/20 text-green-300 rounded text-xs">
                        +{reflection.consciousness_shift} Consciousness
                      </div>
                    </div>
                    <p className="text-gray-300 text-sm">{reflection.reflection_text}</p>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
        
        {/* Sidebar */}
        <div className="space-y-6">
          <div className="bg-slate-800/50 rounded-lg border border-gray-700 p-6">
            <h3 className="text-lg font-medium text-white mb-4 flex items-center gap-2">
              <Target className="w-5 h-5 text-amber-400" />
              Node Details
            </h3>
            
            <div className="space-y-4">
              <div>
                <div className="text-sm text-gray-400 mb-1">Projected Date</div>
                <div className="text-white font-medium">{formatDate(node.time_distance)}</div>
              </div>
              
              <div>
                <div className="text-sm text-gray-400 mb-1">Chakra Focus</div>
                <div className="flex items-center gap-2">
                  <div 
                    className="w-4 h-4 rounded-full" 
                    style={{ backgroundColor: getChakraColor(node.chakra_focus) }}
                  ></div>
                  <span className="text-white font-medium capitalize">
                    {node.chakra_focus.replace('-', ' ')}
                  </span>
                </div>
              </div>
              
              <div>
                <div className="text-sm text-gray-400 mb-1">Node Type</div>
                <div className="text-white font-medium">
                  {node.is_pivot_point ? 'Pivot Point' : 'Evolution Point'}
                </div>
              </div>
              
              <div>
                <div className="text-sm text-gray-400 mb-1">Status</div>
                <div className="text-white font-medium">
                  {node.is_activated ? 'Activated' : 'Not Activated'}
                </div>
              </div>
            </div>
          </div>
          
          {/* Activation History */}
          {activations.length > 0 && (
            <div className="bg-slate-800/50 rounded-lg border border-gray-700 p-6">
              <h3 className="text-lg font-medium text-white mb-4 flex items-center gap-2">
                <Zap className="w-5 h-5 text-purple-400" />
                Activation History
              </h3>
              
              <div className="space-y-3">
                {activations.map(activation => (
                  <div 
                    key={activation.id}
                    className="p-3 bg-slate-700/40 rounded-lg"
                  >
                    <div className="flex items-center justify-between mb-2">
                      <div className="px-2 py-1 bg-purple-900/20 text-purple-300 rounded-lg text-xs capitalize">
                        {activation.activation_type}
                      </div>
                      <div className="text-xs text-gray-400">
                        {new Date(activation.created_at!).toLocaleString()}
                      </div>
                    </div>
                    <p className="text-sm text-gray-300">{activation.activation_details}</p>
                  </div>
                ))}
              </div>
            </div>
          )}
          
          {/* Statistical Info */}
          <div className="bg-slate-800/50 rounded-lg border border-gray-700 p-6">
            <div className="flex items-center gap-2 mb-4">
              <Brain className="w-5 h-5 text-cyan-400" />
              <h3 className="text-lg font-medium text-white">Consciousness</h3>
            </div>
            
            {/* Consciousness meter */}
            <div className="mb-4">
              <div className="flex items-center justify-between text-xs mb-1">
                <span className="text-gray-400">Level</span>
                <span className="text-white font-medium">{node.consciousness_level}/100</span>
              </div>
              <div className="h-2 bg-gray-700 rounded-full overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-blue-500 to-purple-500"
                  style={{ width: `${node.consciousness_level}%` }}
                ></div>
              </div>
            </div>
            
            {/* Timeline navigation */}
            {node.timeline_position !== 'present' && (
              <div className="flex items-center justify-between mt-6">
                <span className="text-xs text-gray-400">Timeline Distance</span>
                <span className="text-xs text-white">
                  {Math.abs(node.time_distance)} days {node.timeline_position === 'past' ? 'ago' : 'ahead'}
                </span>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};