import React from 'react';
import { motion } from 'framer-motion';
import { TimelineNode, TimelinePath } from '../DivineTimelineModule';
import { 
  ArrowLeft, 
  Map, 
  Target, 
  ArrowRight, 
  Brain,
  ChevronRight
} from 'lucide-react';

interface PathSelectorProps {
  path: TimelinePath;
  nodes: TimelineNode[];
  onNodeClick: (node: TimelineNode) => void;
  onBack: () => void;
}

export const PathSelector: React.FC<PathSelectorProps> = ({
  path,
  nodes,
  onNodeClick,
  onBack
}) => {
  // Sort nodes by time_distance
  const sortedNodes = [...nodes].sort((a, b) => a.time_distance - b.time_distance);
  
  // Get path type info
  const getPathTypeInfo = (type: string) => {
    switch (type) {
      case 'optimal':
        return {
          color: 'from-purple-500 to-indigo-600',
          textColor: 'text-purple-300',
          bgColor: 'bg-purple-900/20',
          borderColor: 'border-purple-500/30',
          description: 'A balanced path for steady consciousness growth'
        };
      case 'challenge':
        return {
          color: 'from-amber-500 to-orange-600',
          textColor: 'text-amber-300',
          bgColor: 'bg-amber-900/20',
          borderColor: 'border-amber-500/30',
          description: 'A challenging path requiring shadow work and deeper integration'
        };
      case 'shadow':
        return {
          color: 'from-red-500 to-pink-600',
          textColor: 'text-red-300',
          bgColor: 'bg-red-900/20',
          borderColor: 'border-red-500/30',
          description: 'A difficult path through shadow aspects of consciousness'
        };
      case 'transcendent':
        return {
          color: 'from-blue-500 to-cyan-600',
          textColor: 'text-blue-300',
          bgColor: 'bg-blue-900/20',
          borderColor: 'border-blue-500/30',
          description: 'A rare path of extraordinary consciousness expansion'
        };
      default:
        return {
          color: 'from-gray-500 to-slate-600',
          textColor: 'text-gray-300',
          bgColor: 'bg-gray-900/20',
          borderColor: 'border-gray-500/30',
          description: 'A timeline path for consciousness evolution'
        };
    }
  };
  
  const pathInfo = getPathTypeInfo(path.path_type);
  
  // Helper to get the total activated nodes count
  const getActivatedCount = () => {
    return nodes.filter(node => node.is_activated).length;
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
            <h2 className="text-xl font-bold text-white">{path.title}</h2>
            <div className="text-sm text-gray-400">{pathInfo.description}</div>
          </div>
        </div>
        
        <div className={`px-3 py-1 ${pathInfo.bgColor} ${pathInfo.textColor} rounded-lg text-sm flex items-center gap-2 border ${pathInfo.borderColor}`}>
          <Brain className="w-4 h-4" />
          +{path.consciousness_delta} Consciousness
        </div>
      </div>
      
      {/* Path details */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
        <div className="lg:col-span-2">
          <div className="bg-slate-800/50 rounded-lg border border-gray-700 p-6">
            <h3 className="text-lg font-medium text-white mb-4">Path Description</h3>
            <p className="text-gray-300 leading-relaxed">{path.description}</p>
            
            <div className="mt-6 grid grid-cols-2 md:grid-cols-3 gap-3">
              <div className="p-3 bg-slate-700/40 rounded-lg text-center">
                <div className="text-xl font-bold text-white">{path.probability}%</div>
                <div className="text-xs text-gray-400">Probability</div>
              </div>
              
              <div className="p-3 bg-slate-700/40 rounded-lg text-center">
                <div className="text-xl font-bold text-white">{nodes.length}</div>
                <div className="text-xs text-gray-400">Total Nodes</div>
              </div>
              
              <div className="p-3 bg-slate-700/40 rounded-lg text-center">
                <div className="text-xl font-bold text-white">{getActivatedCount()}/{nodes.length}</div>
                <div className="text-xs text-gray-400">Activated</div>
              </div>
            </div>
          </div>
        </div>
        
        <div>
          <div className="bg-slate-800/50 rounded-lg border border-gray-700 p-6">
            <h3 className="text-lg font-medium text-white mb-4">Path Journey</h3>
            
            <div className={`p-4 rounded-lg ${pathInfo.bgColor} ${pathInfo.textColor} mb-4 border ${pathInfo.borderColor}`}>
              <div className="flex items-center gap-2 mb-2">
                <Target className="w-4 h-4" />
                <h4 className="font-medium">Path Focus</h4>
              </div>
              <p className="text-sm">
                This {path.path_type} path focuses on 
                {path.path_type === 'optimal' ? ' balanced growth and integration' :
                 path.path_type === 'challenge' ? ' working through limitations and resistance' :
                 path.path_type === 'shadow' ? ' confronting shadow aspects of consciousness' :
                 ' extraordinary expansion beyond normal boundaries'}
              </p>
            </div>
            
            <div>
              <div className="flex items-center gap-2 mb-3">
                <Map className="w-4 h-4 text-amber-400" />
                <h4 className="text-white font-medium">Key Milestones</h4>
              </div>
              
              <div className="space-y-2">
                {nodes.filter(node => node.is_pivot_point).map(node => (
                  <div 
                    key={node.id}
                    className="text-sm flex items-center gap-2 cursor-pointer hover:text-purple-300 transition-colors"
                    onClick={() => onNodeClick(node)}
                  >
                    <ChevronRight className="w-4 h-4" />
                    <span>{node.title}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
      
      {/* Timeline nodes */}
      <div>
        <h3 className="text-lg font-medium text-white mb-4">Path Nodes</h3>
        
        <div className="relative">
          {/* Timeline connector */}
          <div className="absolute left-4 top-6 bottom-6 w-0.5 bg-purple-600/30 z-0" />
          
          <div className="space-y-4 relative z-10">
            {sortedNodes.map((node, index) => (
              <motion.div
                key={node.id}
                className={`flex items-start gap-4 p-4 rounded-lg border ${
                  node.is_activated 
                    ? 'bg-slate-800/80 border-purple-500/30' 
                    : 'bg-slate-800/50 border-gray-700'
                } hover:border-purple-500/50 transition-colors cursor-pointer`}
                onClick={() => onNodeClick(node)}
                whileHover={{ x: 4 }}
              >
                {/* Timeline node indicator */}
                <div className="relative">
                  <div 
                    className={`w-8 h-8 rounded-full flex items-center justify-center border-2 ${
                      node.is_activated 
                        ? 'bg-purple-500/20 border-purple-400' 
                        : 'bg-slate-700 border-gray-600'
                    }`}
                  >
                    <span className="text-xs font-medium">{index + 1}</span>
                  </div>
                </div>
                
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between mb-1">
                    <div className="flex items-center gap-2">
                      <h4 className="text-white font-medium">{node.title}</h4>
                      {node.is_pivot_point && (
                        <div className="px-2 py-0.5 bg-amber-900/20 text-amber-300 rounded text-xs">
                          Pivot Point
                        </div>
                      )}
                    </div>
                    
                    <div className="text-xs text-gray-400">
                      {Math.abs(node.time_distance)} days {node.time_distance < 0 ? 'ago' : 'ahead'}
                    </div>
                  </div>
                  
                  <p className="text-sm text-gray-400 mb-2">{node.description}</p>
                  
                  <div className="flex flex-wrap gap-2 text-xs">
                    <div className="px-2 py-1 bg-slate-700/50 rounded flex items-center gap-1">
                      <Brain className="w-3 h-3 text-purple-400" />
                      <span>Level {node.consciousness_level}</span>
                    </div>
                    
                    {node.timeline_position === 'future' && (
                      <div className="px-2 py-1 bg-slate-700/50 rounded flex items-center gap-1">
                        <Target className="w-3 h-3 text-amber-400" />
                        <span>{node.probability}% Probability</span>
                      </div>
                    )}
                    
                    {node.is_activated ? (
                      <div className="px-2 py-1 bg-green-900/20 text-green-300 rounded">
                        Activated
                      </div>
                    ) : node.timeline_position === 'future' ? (
                      <div className="px-2 py-1 bg-blue-900/20 text-blue-300 rounded">
                        Not Activated
                      </div>
                    ) : null}
                  </div>
                </div>
                
                <ArrowRight className="w-5 h-5 text-purple-400 flex-shrink-0 mt-1" />
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};