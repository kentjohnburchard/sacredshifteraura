import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useRSI } from '../../contexts/RSIContext';
import { useChakra } from '../../contexts/ChakraContext';
import { 
  Shield, 
  Zap, 
  Target, 
  Heart, 
  MessageCircle, 
  Brain, 
  Sparkles,
  X,
  Calendar,
  Clipboard,
  Settings,
  User,
  Music,
  Map
} from 'lucide-react';

interface ChakraNavigationMapProps {
  onNavigate: (module: string) => void;
  isOpen: boolean;
  onClose: () => void;
}

export const ChakraNavigationMap: React.FC<ChakraNavigationMapProps> = ({ 
  onNavigate, 
  isOpen,
  onClose
}) => {
  const { soulState } = useRSI();
  const { getChakraColor } = useChakra();
  const [hoveredChakra, setHoveredChakra] = useState<string | null>(null);
  
  // Chakra module mapping
  const chakraModules = {
    root: [
      { id: 'system-integrity', name: 'System Integrity', icon: Shield, description: 'Ensure system security and stability' },
      { id: 'system-metrics', name: 'System Metrics', icon: Zap, description: 'Monitor system performance and health' }
    ],
    sacral: [
      { id: 'sacred-events', name: 'Sacred Events', icon: Calendar, description: 'Create and join spiritual gatherings' },
      { id: 'soul-journey', name: 'Soul Journey', icon: Music, description: 'Explore sacred sound and frequency healing' }
    ],
    solar: [
      { id: 'tasks', name: 'Sacred Tasks', icon: Clipboard, description: 'Align your actions with your soul purpose' },
      { id: 'module-toggle', name: 'Module Control', icon: Settings, description: 'Manage system modules and capabilities' }
    ],
    heart: [
      { id: 'circles', name: 'Sacred Circles', icon: Heart, description: 'Connect with your soul tribe' },
      { id: 'user-profile', name: 'Soul Profile', icon: User, description: 'View and manage your spiritual profile' }
    ],
    throat: [
      { id: 'messages', name: 'Sacred Messages', icon: MessageCircle, description: 'Communicate with your soul tribe' }
    ],
    'third-eye': [
      { id: 'divine-timeline', name: 'Divine Timeline', icon: Map, description: 'Navigate your potential futures' },
      { id: 'consciousness', name: 'Consciousness', icon: Brain, description: 'Explore your inner landscape' }
    ],
    crown: [
      { id: 'soul-blueprint', name: 'Soul Blueprint', icon: Sparkles, description: 'Discover your unique soul signature' },
      { id: 'telos', name: 'Divine Purpose', icon: Target, description: 'Align with your highest purpose' }
    ]
  };
  
  // Get modules for a specific chakra
  const getModulesForChakra = (chakra: string) => {
    return chakraModules[chakra as keyof typeof chakraModules] || [];
  };
  
  // Handle module selection
  const handleModuleSelect = (moduleId: string) => {
    onNavigate(moduleId);
    onClose();
  };
  
  // Get chakra position in the temple map
  const getChakraPosition = (chakra: string): { top: string; left: string } => {
    switch (chakra) {
      case 'root':
        return { top: '85%', left: '50%' };
      case 'sacral':
        return { top: '75%', left: '50%' };
      case 'solar':
        return { top: '65%', left: '50%' };
      case 'heart':
        return { top: '50%', left: '50%' };
      case 'throat':
        return { top: '35%', left: '50%' };
      case 'third-eye':
        return { top: '25%', left: '50%' };
      case 'crown':
        return { top: '15%', left: '50%' };
      default:
        return { top: '50%', left: '50%' };
    }
  };
  
  if (!isOpen) return null;
  
  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center"
      >
        <motion.div
          initial={{ scale: 0.9 }}
          animate={{ scale: 1 }}
          exit={{ scale: 0.9 }}
          className="relative w-full max-w-4xl h-[80vh] bg-slate-900/90 rounded-xl border border-purple-500/20 overflow-hidden"
        >
          {/* Close button */}
          <button
            onClick={onClose}
            className="absolute top-4 right-4 p-2 text-gray-400 hover:text-white z-10"
          >
            <X className="w-5 h-5" />
          </button>
          
          {/* Title */}
          <div className="text-center pt-6 pb-2">
            <h2 className="text-2xl font-bold text-white">Inner Temple Navigation</h2>
            <p className="text-purple-300">Navigate through your sacred energy centers</p>
          </div>
          
          {/* Temple map */}
          <div className="relative w-full h-[calc(80vh-80px)]">
            {/* Central pillar */}
            <div 
              className="absolute left-1/2 top-[15%] bottom-[15%] w-1 -translate-x-1/2"
              style={{ 
                background: 'linear-gradient(to bottom, #9333EA, #6366F1, #3B82F6, #22C55E, #FACC15, #EA580C, #DC2626)' 
              }}
            ></div>
            
            {/* Chakra nodes */}
            {Object.keys(chakraModules).map((chakra) => {
              const position = getChakraPosition(chakra);
              const isActive = soulState.dominantChakra === chakra;
              const isHovered = hoveredChakra === chakra;
              const chakraColor = getChakraColor(chakra as any);
              
              return (
                <div 
                  key={chakra}
                  className="absolute transform -translate-x-1/2 -translate-y-1/2"
                  style={{ 
                    top: position.top, 
                    left: position.left,
                    zIndex: isHovered ? 20 : 10
                  }}
                >
                  {/* Chakra node */}
                  <motion.div
                    className={`w-12 h-12 rounded-full flex items-center justify-center cursor-pointer ${isActive ? 'chakra-glow' : ''}`}
                    style={{ 
                      backgroundColor: `${chakraColor}30`,
                      borderColor: chakraColor,
                      borderWidth: isActive ? 2 : 0
                    }}
                    whileHover={{ scale: 1.2 }}
                    onHoverStart={() => setHoveredChakra(chakra)}
                    onHoverEnd={() => setHoveredChakra(null)}
                  >
                    <div 
                      className="w-8 h-8 rounded-full"
                      style={{ backgroundColor: chakraColor }}
                    ></div>
                  </motion.div>
                  
                  {/* Chakra label */}
                  <div 
                    className="absolute top-full left-1/2 transform -translate-x-1/2 mt-2 text-xs font-medium capitalize whitespace-nowrap"
                    style={{ color: chakraColor }}
                  >
                    {chakra.replace('-', ' ')}
                  </div>
                  
                  {/* Module options (shown on hover) */}
                  <AnimatePresence>
                    {isHovered && (
                      <motion.div
                        initial={{ opacity: 0, scale: 0.8 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.8 }}
                        className="absolute left-16 top-0 bg-slate-800/90 backdrop-blur-sm rounded-lg border shadow-lg p-3 min-w-[200px] z-20"
                        style={{ borderColor: `${chakraColor}50` }}
                      >
                        <h3 
                          className="text-sm font-medium mb-2 capitalize"
                          style={{ color: chakraColor }}
                        >
                          {chakra.replace('-', ' ')} Center
                        </h3>
                        
                        <div className="space-y-2">
                          {getModulesForChakra(chakra).map((module) => (
                            <motion.button
                              key={module.id}
                              className="w-full flex items-center gap-2 p-2 rounded-lg text-left text-sm hover:bg-slate-700/50 transition-colors"
                              onClick={() => handleModuleSelect(module.id)}
                              whileHover={{ x: 5 }}
                            >
                              <div 
                                className="p-1 rounded-full"
                                style={{ backgroundColor: `${chakraColor}20` }}
                              >
                                <module.icon className="w-4 h-4" style={{ color: chakraColor }} />
                              </div>
                              <div>
                                <div className="text-white">{module.name}</div>
                                <div className="text-xs text-gray-400">{module.description}</div>
                              </div>
                            </motion.button>
                          ))}
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              );
            })}
            
            {/* Active chakra highlight */}
            <div 
              className="absolute transform -translate-x-1/2 -translate-y-1/2 pointer-events-none"
              style={{ 
                top: getChakraPosition(soulState.dominantChakra).top, 
                left: getChakraPosition(soulState.dominantChakra).left,
                zIndex: 5
              }}
            >
              <motion.div
                className="w-20 h-20 rounded-full opacity-20"
                style={{ 
                  backgroundColor: getChakraColor(soulState.dominantChakra as any)
                }}
                animate={{ 
                  scale: [1, 1.2, 1],
                  opacity: [0.2, 0.3, 0.2]
                }}
                transition={{
                  duration: 3,
                  repeat: Infinity,
                  ease: "easeInOut"
                }}
              />
            </div>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};