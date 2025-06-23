import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { TimelineNode } from '../DivineTimelineModule';
import { 
  ArrowLeft, 
  Sparkles, 
  Brain, 
  Heart, 
  Compass, 
  Target,
  Lightbulb,
  Send,
  Zap
} from 'lucide-react';

interface TimelineActivatorProps {
  node: TimelineNode;
  onActivate: (nodeId: string, activationType: string, details: string) => Promise<void>;
  onCancel: () => void;
  isLoading: boolean;
}

export const TimelineActivator: React.FC<TimelineActivatorProps> = ({
  node,
  onActivate,
  onCancel,
  isLoading
}) => {
  const [activationType, setActivationType] = useState<string>('intention');
  const [details, setDetails] = useState<string>('');
  
  const activationTypes = [
    { 
      id: 'intention', 
      name: 'Sacred Intention', 
      description: 'Set a clear intention to manifest this node in your timeline',
      icon: Target,
      color: 'bg-purple-900/20 border-purple-500/30 text-purple-300'
    },
    { 
      id: 'meditation', 
      name: 'Meditation Practice', 
      description: 'Use meditation to connect with and activate this potential reality',
      icon: Brain,
      color: 'bg-blue-900/20 border-blue-500/30 text-blue-300'
    },
    { 
      id: 'synchronicity', 
      name: 'Synchronicity', 
      description: 'Document a meaningful coincidence related to this node',
      icon: Compass,
      color: 'bg-amber-900/20 border-amber-500/30 text-amber-300'
    },
    { 
      id: 'insight', 
      name: 'Divine Insight', 
      description: 'Record a spiritual insight or vision related to this node',
      icon: Lightbulb,
      color: 'bg-green-900/20 border-green-500/30 text-green-300'
    }
  ];
  
  const handleSubmit = async () => {
    if (!details.trim()) return;
    
    await onActivate(node.id, activationType, details);
  };

  return (
    <div className="bg-slate-900/70 backdrop-blur-sm rounded-xl border border-purple-500/20 p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <button
            onClick={onCancel}
            className="p-2 text-gray-400 hover:text-white transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          
          <div>
            <h2 className="text-xl font-bold text-white">Activate Timeline Node</h2>
            <div className="text-purple-300">{node.title}</div>
          </div>
        </div>
        
        <div className="p-2 bg-purple-900/30 rounded-full">
          <Sparkles className="w-5 h-5 text-purple-400" />
        </div>
      </div>
      
      <div className="p-4 bg-purple-900/20 rounded-lg border border-purple-500/30 mb-6">
        <div className="flex items-start gap-3">
          <Zap className="w-5 h-5 text-purple-400 flex-shrink-0 mt-1" />
          <div>
            <h3 className="text-white font-medium mb-1">About Timeline Activation</h3>
            <p className="text-purple-200 text-sm">
              Activating a timeline node is a sacred act of conscious co-creation with your future. 
              By focusing your awareness and intention on this potential reality, you increase the
              probability of it manifesting in your experience.
            </p>
          </div>
        </div>
      </div>
      
      {/* Activation type selection */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3 mb-6">
        {activationTypes.map(type => (
          <motion.div
            key={type.id}
            className={`p-4 rounded-lg border cursor-pointer transition-all ${
              activationType === type.id
                ? type.color
                : 'bg-slate-800/50 border-gray-700 hover:border-gray-600'
            }`}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => setActivationType(type.id)}
          >
            <div className="flex items-center justify-between mb-2">
              <type.icon className="w-5 h-5" />
              <div className={`w-4 h-4 rounded-full border ${
                activationType === type.id ? 'bg-current border-transparent' : 'border-gray-600'
              }`}></div>
            </div>
            <h3 className="font-medium text-white">{type.name}</h3>
            <p className="text-xs text-gray-400 mt-1">{type.description}</p>
          </motion.div>
        ))}
      </div>
      
      {/* Activation details */}
      <div className="mb-6">
        <label className="block text-sm font-medium text-gray-300 mb-2">
          Activation Details
        </label>
        <textarea
          value={details}
          onChange={e => setDetails(e.target.value)}
          placeholder={`Describe your ${activationType === 'intention' ? 'intention' : 
                              activationType === 'meditation' ? 'meditation experience' :
                              activationType === 'synchronicity' ? 'meaningful coincidence' :
                              'spiritual insight'} related to "${node.title}"...`}
          className="w-full p-3 bg-slate-800 text-white rounded-lg border border-gray-600 focus:border-purple-400 focus:outline-none h-32"
        />
      </div>
      
      {/* Node context reminder */}
      <div className="bg-slate-800/50 rounded-lg border border-gray-700 p-4 mb-6">
        <h3 className="text-white font-medium mb-3">Node Context</h3>
        <p className="text-gray-300 text-sm mb-2">{node.description}</p>
        {node.guidance && (
          <div className="text-sm text-purple-300 italic">
            Guidance: {node.guidance}
          </div>
        )}
      </div>
      
      {/* Action buttons */}
      <div className="flex justify-end gap-3">
        <button
          onClick={onCancel}
          className="px-4 py-2 bg-slate-800 text-gray-300 rounded-lg border border-gray-600 hover:bg-slate-700 transition-colors"
        >
          Cancel
        </button>
        
        <motion.button
          onClick={handleSubmit}
          disabled={isLoading || !details.trim()}
          className="px-5 py-2 bg-gradient-to-r from-purple-600 to-indigo-600 text-white rounded-lg hover:from-purple-700 hover:to-indigo-700 transition-all flex items-center gap-2 disabled:opacity-50"
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
        >
          {isLoading ? (
            <>
              <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
              Activating...
            </>
          ) : (
            <>
              <Sparkles className="w-4 h-4" />
              Activate Timeline
            </>
          )}
        </motion.button>
      </div>
    </div>
  );
};