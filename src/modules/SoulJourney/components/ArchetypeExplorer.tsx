import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { TarotArchetype, ArchetypeActivation } from '../SoulJourneyModule';
import { 
  Star, 
  Sparkles, 
  Flame, 
  Droplet, 
  Wind,
  Globe,
  Heart,
  User,
  Calendar,
  MessageSquare,
  ArrowRight,
  CheckCircle,
  Plus,
  X
} from 'lucide-react';

interface ArchetypeExplorerProps {
  archetypes: TarotArchetype[];
  activations: ArchetypeActivation[];
  onActivate: (archetypeKey: string, notes?: string) => void;
  isLoading: boolean;
  activeArchetype: TarotArchetype | null;
  onSelectArchetype: (archetype: TarotArchetype | null) => void;
}

export const ArchetypeExplorer: React.FC<ArchetypeExplorerProps> = ({
  archetypes,
  activations,
  onActivate,
  isLoading,
  activeArchetype,
  onSelectArchetype
}) => {
  const [activationNotes, setActivationNotes] = useState('');
  const [showActivationModal, setShowActivationModal] = useState(false);

  const getElementIcon = (element: string) => {
    switch (element) {
      case 'fire': return <Flame className="w-4 h-4 text-orange-400" />;
      case 'water': return <Droplet className="w-4 h-4 text-blue-400" />;
      case 'air': return <Wind className="w-4 h-4 text-cyan-400" />;
      case 'earth': return <Globe className="w-4 h-4 text-green-400" />;
      default: return <Star className="w-4 h-4 text-yellow-400" />;
    }
  };
  
  const getElementColor = (element: string) => {
    switch (element) {
      case 'fire': return 'bg-orange-900/20 border-orange-500/30 text-orange-300';
      case 'water': return 'bg-blue-900/20 border-blue-500/30 text-blue-300';
      case 'air': return 'bg-cyan-900/20 border-cyan-500/30 text-cyan-300';
      case 'earth': return 'bg-green-900/20 border-green-500/30 text-green-300';
      default: return 'bg-purple-900/20 border-purple-500/30 text-purple-300';
    }
  };

  const getChakraColor = (chakra: string) => {
    switch (chakra) {
      case 'root': return '#DC2626';
      case 'sacral': return '#EA580C';
      case 'solar_plexus': return '#FACC15';
      case 'heart': return '#22C55E';
      case 'throat': return '#3B82F6';
      case 'third_eye': return '#6366F1';
      case 'crown': return '#9333EA';
      default: return '#6B7280';
    }
  };
  
  const handleActivateClick = (archetype: TarotArchetype) => {
    onSelectArchetype(archetype);
    setShowActivationModal(true);
  };
  
  const confirmActivation = () => {
    if (activeArchetype) {
      onActivate(activeArchetype.key, activationNotes);
      setShowActivationModal(false);
      setActivationNotes('');
    }
  };
  
  const isActivated = (archetypeKey: string) => {
    return activations.some(a => a.archetype_key === archetypeKey);
  };
  
  const getActivationForArchetype = (archetypeKey: string) => {
    return activations.find(a => a.archetype_key === archetypeKey);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-slate-900/70 backdrop-blur-sm rounded-xl border border-purple-500/20 p-6">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-2xl font-bold text-white">Sacred Archetypes</h2>
            <p className="text-purple-300">Activate archetypes to unlock wisdom and align with soul frequencies</p>
          </div>
          
          <div className="p-3 bg-amber-900/20 text-amber-300 rounded-lg text-sm flex items-center gap-2">
            <Star className="w-4 h-4" />
            <span>{activations.length} Activations</span>
          </div>
        </div>
        
        {activations.length > 0 && (
          <div className="mb-6 p-4 bg-purple-900/20 rounded-lg border border-purple-500/30">
            <h3 className="text-lg font-medium text-white mb-3">Recent Activations</h3>
            
            <div className="space-y-2">
              {activations.slice(0, 3).map(activation => (
                <div 
                  key={activation.id} 
                  className="p-3 bg-slate-800/50 rounded-lg border border-gray-700 flex items-center justify-between"
                >
                  <div className="flex items-center gap-2">
                    <div className="p-2 bg-purple-900/30 rounded-full">
                      <Star className="w-4 h-4 text-purple-400" />
                    </div>
                    <div>
                      <h4 className="text-white font-medium">{activation.archetype_name}</h4>
                      <div className="text-xs text-gray-400">
                        {new Date(activation.activation_date!).toLocaleDateString()} • 
                        Integration Level: {activation.integration_level}/10
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-2">
                    <div className="text-sm px-2 py-1 rounded bg-blue-900/20 text-blue-300">
                      {activation.frequency_hz}Hz
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
      
      {/* Archetypes Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6">
        {archetypes.map(archetype => {
          const activated = isActivated(archetype.key);
          const activation = getActivationForArchetype(archetype.key);
          
          return (
            <motion.div
              key={archetype.key}
              className={`bg-slate-800/70 backdrop-blur-sm rounded-xl border ${
                activated 
                  ? 'border-amber-500/50' 
                  : 'border-gray-700 hover:border-purple-500/50'
              } overflow-hidden transition-all`}
              whileHover={{ scale: 1.02 }}
            >
              {/* Card Header */}
              <div className="p-4 border-b border-gray-700 relative">
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className="text-lg font-bold text-white">{archetype.name}</h3>
                    <div className="text-xs text-gray-400">#{archetype.number}</div>
                  </div>
                  
                  <div className={`flex items-center gap-1 px-2 py-1 rounded text-xs ${getElementColor(archetype.element)}`}>
                    {getElementIcon(archetype.element)}
                    {archetype.element.charAt(0).toUpperCase() + archetype.element.slice(1)}
                  </div>
                </div>
                
                {activated && (
                  <div className="absolute top-0 right-0 -mt-1 -mr-1 w-8 h-8">
                    <div className="absolute inset-0 bg-amber-500 rounded-bl-xl"></div>
                    <CheckCircle className="absolute top-1 right-1 w-4 h-4 text-white" />
                  </div>
                )}
              </div>
              
              {/* Card Body */}
              <div className="p-4">
                <div className="mb-3">
                  <div className="text-sm text-gray-400 mb-2">Resonant Frequency</div>
                  <div className="flex items-center gap-2">
                    <Sparkles className="w-4 h-4 text-purple-400" />
                    <span className="text-lg font-bold text-white">{archetype.frequency}Hz</span>
                    <div 
                      className="w-3 h-3 rounded-full" 
                      style={{ backgroundColor: getChakraColor(archetype.chakra) }}
                      title={`${archetype.chakra.replace('_', ' ')} chakra`}
                    ></div>
                  </div>
                </div>
                
                <div className="mb-3">
                  <p className="text-sm text-gray-300 line-clamp-3">
                    {archetype.description}
                  </p>
                </div>
                
                <div className="flex flex-wrap gap-1 mb-4">
                  {archetype.keywords.map((keyword, index) => (
                    <div key={index} className="px-2 py-1 bg-slate-700/50 rounded text-xs text-gray-300">
                      {keyword}
                    </div>
                  ))}
                </div>
                
                <div className="mt-auto">
                  {activated ? (
                    <button 
                      onClick={() => onSelectArchetype(archetype)}
                      className="w-full py-2 bg-amber-600/20 text-amber-300 border border-amber-500/30 rounded hover:bg-amber-600/30 transition-colors flex items-center justify-center gap-1"
                    >
                      <Star className="w-4 h-4" />
                      View Activation
                    </button>
                  ) : (
                    <button 
                      onClick={() => handleActivateClick(archetype)}
                      className="w-full py-2 bg-purple-600/20 text-purple-300 border border-purple-500/30 rounded hover:bg-purple-600/30 transition-colors flex items-center justify-center gap-1"
                    >
                      <Plus className="w-4 h-4" />
                      Activate Archetype
                    </button>
                  )}
                </div>
              </div>
            </motion.div>
          );
        })}
      </div>
      
      {/* Selected Archetype Details */}
      {activeArchetype && !showActivationModal && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
          className="bg-slate-900/70 backdrop-blur-sm rounded-xl border border-purple-500/20 p-6"
        >
          <div className="flex items-start justify-between mb-6">
            <div className="flex items-start gap-4">
              <div className={`p-3 rounded-lg ${getElementColor(activeArchetype.element)}`}>
                {getElementIcon(activeArchetype.element)}
              </div>
              
              <div>
                <h3 className="text-xl font-bold text-white">{activeArchetype.name}</h3>
                <div className="text-sm text-gray-400 mt-1 flex items-center gap-2">
                  <div className="text-purple-300">{activeArchetype.frequency}Hz</div>
                  <span>•</span>
                  <div className="capitalize">{activeArchetype.chakra.replace('_', ' ')} Chakra</div>
                  <span>•</span>
                  <div className="capitalize">{activeArchetype.element}</div>
                </div>
              </div>
            </div>
            
            <button
              onClick={() => onSelectArchetype(null)}
              className="p-1 text-gray-400 hover:text-white transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <p className="text-gray-300 mb-4">
                {activeArchetype.description}
              </p>
              
              <div className="space-y-4">
                <div>
                  <h4 className="text-white font-medium mb-2">Keywords</h4>
                  <div className="flex flex-wrap gap-2">
                    {activeArchetype.keywords.map((keyword, index) => (
                      <div key={index} className="px-3 py-1 bg-slate-700/50 rounded-full text-sm text-gray-300">
                        {keyword}
                      </div>
                    ))}
                  </div>
                </div>
                
                <div>
                  <h4 className="text-white font-medium mb-2">Consciousness Level</h4>
                  <div className="px-3 py-2 bg-purple-900/20 rounded-lg text-purple-300 capitalize">
                    {activeArchetype.consciousness_level}
                  </div>
                </div>
              </div>
            </div>
            
            <div>
              <div className="space-y-4">
                <div>
                  <h4 className="text-white font-medium mb-2">Light Aspects</h4>
                  <div className="space-y-1">
                    {activeArchetype.light_aspects.map((aspect, index) => (
                      <div key={index} className="flex items-center gap-2">
                        <Sparkles className="w-3 h-3 text-amber-400" />
                        <span className="text-gray-300 capitalize">{aspect}</span>
                      </div>
                    ))}
                  </div>
                </div>
                
                <div>
                  <h4 className="text-white font-medium mb-2">Shadow Aspects</h4>
                  <div className="space-y-1">
                    {activeArchetype.shadow_aspects.map((aspect, index) => (
                      <div key={index} className="flex items-center gap-2">
                        <Flame className="w-3 h-3 text-red-400" />
                        <span className="text-gray-300 capitalize">{aspect}</span>
                      </div>
                    ))}
                  </div>
                </div>
                
                {isActivated(activeArchetype.key) ? (
                  <div>
                    <h4 className="text-white font-medium mb-2">Your Activation</h4>
                    <div className="bg-amber-900/20 text-amber-300 p-3 rounded-lg">
                      <div className="flex items-center gap-2 mb-2">
                        <Calendar className="w-4 h-4" />
                        <span>{new Date(getActivationForArchetype(activeArchetype.key)?.activation_date!).toLocaleDateString()}</span>
                      </div>
                      {getActivationForArchetype(activeArchetype.key)?.activation_notes && (
                        <div className="text-sm">
                          {getActivationForArchetype(activeArchetype.key)?.activation_notes}
                        </div>
                      )}
                    </div>
                  </div>
                ) : (
                  <div className="flex justify-center mt-4">
                    <motion.button
                      onClick={() => handleActivateClick(activeArchetype)}
                      className="px-6 py-2 bg-gradient-to-r from-purple-600 to-indigo-600 text-white rounded-lg hover:from-purple-700 hover:to-indigo-700 transition-all flex items-center gap-2"
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                    >
                      <Sparkles className="w-4 h-4" />
                      Activate This Archetype
                    </motion.button>
                  </div>
                )}
              </div>
            </div>
          </div>
        </motion.div>
      )}
      
      {/* Activation Modal */}
      <AnimatePresence>
        {showActivationModal && activeArchetype && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
          >
            <motion.div
              initial={{ scale: 0.9, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.9, y: 20 }}
              className="bg-slate-900 rounded-xl border border-purple-500/20 p-6 max-w-lg w-full"
            >
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-xl font-bold text-white">Activate {activeArchetype.name}</h3>
                <button
                  onClick={() => setShowActivationModal(false)}
                  className="p-1 text-gray-400 hover:text-white transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
              
              <div className="mb-6">
                <p className="text-gray-300 mb-4">
                  You are about to activate the {activeArchetype.name} archetype, which resonates at {activeArchetype.frequency}Hz 
                  and connects with your {activeArchetype.chakra.replace('_', ' ')} chakra. This sacred activation will
                  integrate this archetype's wisdom into your consciousness.
                </p>
                
                <div className="p-3 bg-amber-900/20 text-amber-300 rounded-lg flex items-start gap-2 mb-4">
                  <Sparkles className="w-5 h-5 flex-shrink-0 mt-0.5" />
                  <div>
                    <div className="font-medium mb-1">Consciousness Expansion</div>
                    <div className="text-sm">
                      This activation will help you embody the qualities of {activeArchetype.light_aspects.join(', ')} 
                      and integrate the shadow aspects of {activeArchetype.shadow_aspects.join(', ')}.
                    </div>
                  </div>
                </div>
                
                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    <MessageSquare className="w-4 h-4 inline mr-2" />
                    Activation Intention (Optional)
                  </label>
                  <textarea
                    value={activationNotes}
                    onChange={(e) => setActivationNotes(e.target.value)}
                    placeholder="Set your personal intention for this archetype activation..."
                    className="w-full p-3 bg-slate-800 text-white rounded-lg border border-gray-600 focus:border-purple-400 focus:outline-none h-24"
                  />
                </div>
              </div>
              
              <div className="flex justify-end gap-3">
                <button
                  onClick={() => setShowActivationModal(false)}
                  className="px-4 py-2 bg-slate-800 text-gray-300 rounded-lg border border-gray-600 hover:bg-slate-700 transition-colors"
                >
                  Cancel
                </button>
                
                <motion.button
                  onClick={confirmActivation}
                  disabled={isLoading}
                  className="px-5 py-2 bg-gradient-to-r from-purple-600 to-indigo-600 text-white rounded-lg hover:from-purple-700 hover:to-indigo-700 transition-all flex items-center gap-2 disabled:opacity-50"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  {isLoading ? (
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  ) : (
                    <Sparkles className="w-4 h-4" />
                  )}
                  Activate Archetype
                </motion.button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};