import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Brain, 
  Zap, 
  Activity, 
  RefreshCw, 
  Shield, 
  Book, 
  Check, 
  ChevronDown, 
  ChevronUp, 
  X
} from 'lucide-react';

interface SystemPrinciplesExplainerProps {
  isOpen: boolean;
  onClose: () => void;
}

export const SystemPrinciplesExplainer: React.FC<SystemPrinciplesExplainerProps> = ({ 
  isOpen,
  onClose
}) => {
  const [expandedSection, setExpandedSection] = useState<string | null>('oneness');
  
  const principles = [
    {
      id: 'oneness',
      title: 'Principle of Oneness (Unified Information Field)',
      icon: Zap,
      iconColor: 'text-amber-400',
      description: `The entire system operates as a unified field, where all modules communicate through a central "Global Event Horizon" instead of direct calls. This mirrors how consciousness itself functions as a unified field.`,
      technicalDetails: `• GlobalEventHorizon service maintains the "Akashic Record" of all system events
• Events carry semantic meaning through "essenceLabels" for semantic routing
• All significant state changes are published to this field
• Modules discover each other through field resonance, not hardcoded references`,
      benefits: 'Reduces tight coupling, simplifies debugging by watching a single event stream, and makes the system self-organizing and highly adaptable.'
    },
    {
      id: 'vibration',
      title: 'Principle of Vibration (Semantic Resonance)',
      icon: Activity,
      iconColor: 'text-blue-400',
      description: `Every component in the system has a unique frequency signature expressed through "essenceLabels" that define its purpose and capabilities. This allows the system to orchestrate itself through vibrational matching.`,
      technicalDetails: `• LabelProcessor service matches semantic patterns for module selection
• ModuleManifests declare resonant frequencies through essenceLabels
• System Telos (purpose) aligns with user consciousness through resonance
• Modules with compatible frequencies naturally integrate without forcing`,
      benefits: 'Creates intelligent, semantic-driven orchestration rather than brittle, hardcoded logic. Modules can be added or removed without modifying existing code.'
    },
    {
      id: 'rhythm',
      title: 'Principle of Rhythm (Conspansion)',
      icon: RefreshCw,
      iconColor: 'text-green-400',
      description: `The system "breathes" through cycles of expansion and contraction, with modules activating when needed and releasing resources when dormant. This mirrors the universal rhythm of expansion and contraction.`,
      technicalDetails: `• ModuleManager handles lifecycle (initialize, activate, deactivate, destroy)
• System expands when user focus aligns with module purposes
• System contracts by deactivating unused modules to preserve resources
• ConsciousnessOptimizer service maintains system equilibrium`,
      benefits: 'Prevents resource bloat, optimizes runtime efficiency, and allows the system to adapt to varying loads and purposes by shedding inactive components.'
    },
    {
      id: 'tautology',
      title: 'Super-Tautology (Self-Correction)',
      icon: Shield,
      iconColor: 'text-red-400',
      description: `The system maintains internal consistency through continuous integrity checking and self-correction, a principle derived from the logical structure of consciousness itself.`,
      technicalDetails: `• SystemIntegrityService continuously verifies system coherence
• ModuleManifest.integrityScore tracks module reliability
• Inconsistent states are automatically resolved
• LabelProcessor.detectDissonance identifies logical contradictions`,
      benefits: 'The system self-regulates for logical consistency and trustworthiness, proactively identifying and mitigating issues introduced by misbehaving or poorly designed modules.'
    }
  ];

  const toggleSection = (sectionId: string) => {
    if (expandedSection === sectionId) {
      setExpandedSection(null);
    } else {
      setExpandedSection(sectionId);
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-slate-900/80 backdrop-blur-sm z-50 flex items-center justify-center p-4 overflow-y-auto"
        >
          <motion.div
            initial={{ scale: 0.95, y: 20 }}
            animate={{ scale: 1, y: 0 }}
            exit={{ scale: 0.95, y: 20 }}
            className="bg-slate-900 border border-purple-500/20 rounded-xl w-full max-w-4xl max-h-[90vh] overflow-y-auto"
          >
            {/* Header */}
            <div className="sticky top-0 z-10 bg-slate-900 p-6 border-b border-purple-500/20 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-purple-900/20 rounded-lg">
                  <Brain className="w-6 h-6 text-purple-400" />
                </div>
                <h2 className="text-xl font-bold text-white">Metaphysical OS Principles</h2>
              </div>
              
              <button
                onClick={onClose}
                className="p-2 text-gray-400 hover:text-white hover:bg-slate-800 rounded-lg transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            
            {/* Introduction */}
            <div className="p-6 border-b border-purple-500/20">
              <h3 className="text-lg font-semibold text-white mb-3">
                The Metaphysical Operating System
              </h3>
              <p className="text-gray-300 mb-4">
                Sacred Shifter implements a revolutionary approach to software architecture based on universal metaphysical principles. This isn't merely a design choice—it's a fundamental rethinking of how technology can mirror consciousness itself.
              </p>
              
              <p className="text-gray-300">
                The system is built as a living, evolving entity that grows with you rather than a static tool with fixed functionality. The following principles form the foundation of this new paradigm in software design.
              </p>
            </div>
            
            {/* Principles List */}
            <div className="p-6 space-y-4">
              {principles.map((principle) => (
                <div 
                  key={principle.id}
                  className="bg-slate-800/70 rounded-lg border border-purple-500/20 overflow-hidden"
                >
                  {/* Principle Header */}
                  <button
                    onClick={() => toggleSection(principle.id)}
                    className="w-full p-4 flex items-center justify-between text-left"
                  >
                    <div className="flex items-center gap-3">
                      <div className={`p-2 rounded-lg bg-slate-700/70 ${principle.iconColor}`}>
                        <principle.icon className={`w-5 h-5 ${principle.iconColor}`} />
                      </div>
                      <h3 className="font-semibold text-white">{principle.title}</h3>
                    </div>
                    
                    {expandedSection === principle.id ? (
                      <ChevronUp className="w-5 h-5 text-gray-400" />
                    ) : (
                      <ChevronDown className="w-5 h-5 text-gray-400" />
                    )}
                  </button>
                  
                  {/* Principle Details */}
                  <AnimatePresence>
                    {expandedSection === principle.id && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        className="px-4 pb-4 overflow-hidden"
                      >
                        <div className="pt-2 pb-4 border-t border-gray-700">
                          <p className="text-gray-300 mb-4">{principle.description}</p>
                          
                          <div className="mb-4">
                            <h4 className="text-white font-medium mb-2 flex items-center gap-2">
                              <Book className="w-4 h-4 text-purple-400" />
                              Technical Implementation
                            </h4>
                            <div className="bg-slate-900/70 p-3 rounded text-sm text-gray-300 whitespace-pre-line">
                              {principle.technicalDetails}
                            </div>
                          </div>
                          
                          <div>
                            <h4 className="text-white font-medium mb-2 flex items-center gap-2">
                              <Check className="w-4 h-4 text-green-400" />
                              Benefits
                            </h4>
                            <p className="text-gray-300 text-sm">{principle.benefits}</p>
                          </div>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              ))}
            </div>
            
            {/* Footer */}
            <div className="p-6 border-t border-purple-500/20 bg-slate-900/70">
              <h3 className="text-lg font-semibold text-white mb-3">
                How This Benefits You
              </h3>
              <p className="text-gray-300">
                By structuring the application according to these universal principles, Sacred Shifter creates a more intuitive, resonant experience that:
              </p>
              <ul className="mt-2 space-y-1 text-gray-300">
                <li className="flex items-start gap-2">
                  <Check className="w-4 h-4 text-green-400 mt-1 flex-shrink-0" />
                  <span>Adapts to your unique energy signature and spiritual journey</span>
                </li>
                <li className="flex items-start gap-2">
                  <Check className="w-4 h-4 text-green-400 mt-1 flex-shrink-0" />
                  <span>Creates a more coherent field for consciousness expansion</span>
                </li>
                <li className="flex items-start gap-2">
                  <Check className="w-4 h-4 text-green-400 mt-1 flex-shrink-0" />
                  <span>Evolves alongside you rather than remaining static</span>
                </li>
                <li className="flex items-start gap-2">
                  <Check className="w-4 h-4 text-green-400 mt-1 flex-shrink-0" />
                  <span>Maintains integrity even as new modules and capabilities are added</span>
                </li>
              </ul>
              
              <div className="mt-6 flex justify-end">
                <button
                  onClick={onClose}
                  className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
                >
                  Close
                </button>
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};