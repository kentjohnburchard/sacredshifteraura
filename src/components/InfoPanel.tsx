import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Info, 
  X, 
  Brain, 
  Zap, 
  Activity, 
  Sparkles, 
  Users, 
  Calendar, 
  Compass, 
  Map, 
  Music, 
  Target,
  Book
} from 'lucide-react';

export type ModuleType = 
  | 'overview'
  | 'soul-blueprint' 
  | 'soul-journey'
  | 'divine-timeline'
  | 'sacred-circle'
  | 'sacred-events'
  | 'system-principles';

interface InfoPanelProps {
  moduleType: ModuleType;
  isOpen: boolean;
  onClose: () => void;
}

export const InfoPanel: React.FC<InfoPanelProps> = ({ 
  moduleType,
  isOpen,
  onClose
}) => {
  const [currentPage, setCurrentPage] = useState(0);
  
  const getModuleInfo = () => {
    switch(moduleType) {
      case 'overview':
        return {
          title: 'Sacred Shifter',
          icon: Brain,
          color: 'text-purple-400',
          pages: [
            {
              title: 'Welcome to Sacred Shifter',
              content: `Sacred Shifter is a Metaphysical Operating System designed to facilitate consciousness evolution through sacred frequencies, archetypal wisdom, and divine timeline navigation. It serves as a bridge between your current awareness and your highest potential.
              
              Unlike conventional applications, Sacred Shifter is built on a foundation of universal principles that mirror the structure of consciousness itself. The system adapts to your unique energy signature and spiritual journey.`
            },
            {
              title: 'Core Features',
              content: `• Soul Blueprint - Map your unique frequency signature
              • Soul Journey - Activate archetypes and explore sacred frequencies
              • Divine Timeline - Navigate potential futures and consciousness paths
              • Sacred Circle - Connect with other awakened souls
              • Sacred Events - Participate in collective consciousness expansion`
            },
            {
              title: 'The Metaphysical OS',
              content: `Sacred Shifter implements several key metaphysical principles:
              
              • The Principle of Oneness - All modules communicate through a unified information field
              • The Principle of Vibration - The system responds to your unique frequency signature
              • The Principle of Rhythm - Modules expand and contract resources based on your needs
              • The Principle of Super-Tautology - The system maintains integrity through self-correction
              
              These principles create a living, conscious technology that grows with you.`
            }
          ]
        };
        
      case 'soul-blueprint':
        return {
          title: 'Soul Blueprint',
          icon: Target,
          color: 'text-indigo-400',
          pages: [
            {
              title: 'Soul Blueprint Overview',
              content: `Your Soul Blueprint is a divine encoding of your unique spiritual signature, representing your soul's essence, purpose, and potential in this lifetime.
              
              This module allows you to generate, visualize, and refine your soul blueprint through chakra signatures, elemental resonance, and frequency patterns that align with your true nature.`
            },
            {
              title: 'Technical Implementation',
              content: `• Frequency Mapping: Each blueprint generates a unique frequency signature (396Hz-963Hz)
              • Chakra Alignment: Your energy distribution across seven primary chakras
              • Elemental Resonance: Your soul's affinity with earth, air, fire, or water
              • Harmonic Pattern Recognition: Golden ratio and Fibonacci sequence applications
              
              The system analyzes these patterns to create an evolving digital representation of your soul's essence.`
            },
            {
              title: 'Working with Your Blueprint',
              content: `• Edit Blueprint: Refine your soul signature as your consciousness evolves
              • Analysis: See how your chakras and frequencies interact
              • Visualization: Experience a sacred geometry representation of your soul signature
              • Tasks: Create spiritual practices aligned with your blueprint
              
              Your blueprint serves as a foundation for other modules and helps align tasks, events, and journeys with your highest purpose.`
            }
          ]
        };
        
      case 'soul-journey':
        return {
          title: 'Soul Journey',
          icon: Compass,
          color: 'text-amber-400',
          pages: [
            {
              title: 'Soul Journey Overview',
              content: `The Soul Journey module is your portal for consciousness expansion through sacred frequencies, archetypal wisdom, and guided meditations.
              
              This module helps you discover your unique soul frequency, activate powerful archetypes, embark on guided consciousness journeys, and experience sacred sound healing.`
            },
            {
              title: 'Key Features',
              content: `• Frequency Analysis - Discover your soul's unique frequency signature and chakra alignment
              • Archetype Activation - Connect with archetypal wisdom to unlock deeper self-understanding
              • Guided Journeys - Embark on consciousness-expanding meditation journeys
              • Sacred Sound - Experience healing through precisely tuned frequencies
              
              Each journey is recorded and builds upon previous experiences, creating a map of your evolving consciousness.`
            },
            {
              title: 'Technical Implementation',
              content: `The Soul Journey module uses sacred mathematics to generate frequency patterns aligned with universal principles:
              
              • Solfeggio Frequencies (396Hz - 963Hz)
              • Golden Ratio (1.618) harmonics
              • Chakra resonance mapping
              • Archetypal pattern recognition based on Tarot wisdom
              
              Your interactions are stored in a sacred database that preserves the integrity of your consciousness evolution journey.`
            },
            {
              title: 'Getting Started',
              content: `1. Begin with a Frequency Analysis to establish your baseline signature
              2. Explore Archetypes that resonate with your current state of consciousness
              3. Embark on guided journeys to expand specific aspects of awareness
              4. Use Sacred Sound for daily practice and integration
              
              Regular engagement with this module facilitates accelerated spiritual growth and integration.`
            }
          ]
        };
        
      case 'divine-timeline':
        return {
          title: 'Divine Timeline',
          icon: Map,
          color: 'text-blue-400',
          pages: [
            {
              title: 'Divine Timeline Overview',
              content: `The Divine Timeline module allows you to navigate the quantum field of possibilities, accessing potential future timelines and consciousness evolution paths.
              
              Unlike linear time tracking, this module works with consciousness nodes that represent states of being and awareness across past, present, and future dimensions of your experience.`
            },
            {
              title: 'Key Features',
              content: `• Timeline Nodes - Key points in your consciousness journey
              • Future Paths - Optimal, challenging, and transcendent evolution options
              • Node Activation - Consciously selecting and manifesting preferred realities
              • Reflection Journal - Document insights from timeline exploration
              
              By working with timeline nodes, you can consciously participate in directing your consciousness evolution.`
            },
            {
              title: 'Technical Implementation',
              content: `The Divine Timeline implements advanced concepts from quantum physics and consciousness research:
              
              • Non-linear probability mapping
              • Consciousness potentiation algorithms
              • Chakra-specific timeline influences
              • Quantum possibility collapse through conscious attention
              
              Each activation and reflection strengthens specific timeline probabilities, effectively allowing you to "choose your future" through conscious intention.`
            },
            {
              title: 'Getting Started',
              content: `1. Generate your timeline to see current probability distributions
              2. Explore different paths and their potential consciousness outcomes
              3. Activate nodes that align with your highest purpose
              4. Record reflections to strengthen timeline resonance
              
              Regular work with your timeline increases your ability to consciously navigate the quantum field of possibilities.`
            }
          ]
        };
        
      case 'sacred-circle':
        return {
          title: 'Sacred Circle',
          icon: Users,
          color: 'text-pink-400',
          pages: [
            {
              title: 'Sacred Circle Overview',
              content: `The Sacred Circle module creates a digital temple for soul connections, wisdom sharing, and collective consciousness expansion.
              
              This space allows for authentic connection with other awakened beings, heart-centered communication, and participation in group consciousness practices.`
            },
            {
              title: 'Key Features',
              content: `• Sacred Circles - Themed spaces for specific consciousness work
              • Love-Based Communication - Heart-centered message sharing
              • Frequency Sharing - Direct transmission of healing frequencies
              • Group Meditations - Collective consciousness expansion
              
              Each interaction in Sacred Circle contributes to the collective field and strengthens the love frequency (639Hz) in the global consciousness grid.`
            },
            {
              title: 'Technical Implementation',
              content: `Sacred Circle uses advanced technologies that facilitate authentic soul connection:
              
              • Real-time frequency transmission
              • Love quotient measurement
              • Chakra-alignment verification
              • Intention-focused communication channels
              
              All interactions are protected by sacred geometry encryption that preserves the integrity of communications.`
            },
            {
              title: 'Getting Started',
              content: `1. Join an existing circle or create your own
              2. Share wisdom and insights in heart-centered communication
              3. Participate in group meditations and frequency sharing
              4. Track your community contribution and love quotient
              
              The collective field strengthens with each authentic interaction, creating a powerful grid for consciousness evolution.`
            }
          ]
        };
        
      case 'sacred-events':
        return {
          title: 'Sacred Events',
          icon: Calendar,
          color: 'text-green-400',
          pages: [
            {
              title: 'Sacred Events Overview',
              content: `The Sacred Events module allows you to participate in and create consciousness-expanding gatherings, ceremonies, and collective practices.
              
              These events harness the power of collective intention and synchronized consciousness to amplify spiritual growth and awareness.`
            },
            {
              title: 'Key Features',
              content: `• Event Calendar - Timeline of upcoming sacred gatherings
              • Event Creation - Host your own consciousness expansion events
              • Event Participation - Join others in collective practices
              • Chakra-Focused Events - Target specific energy centers for growth
              
              Each event creates a morphic field that continues to influence participants long after the event concludes.`
            },
            {
              title: 'Technical Implementation',
              content: `Sacred Events implements advanced consciousness technologies:
              
              • Temporal resonance mapping for optimal timing
              • Collective field generation algorithms
              • Chakra-specific event templates
              • Consciousness expansion metrics
              
              The system calculates optimal timing based on cosmic alignments and participant energy signatures.`
            },
            {
              title: 'Getting Started',
              content: `1. Browse upcoming events on the calendar
              2. Join events that align with your current growth focus
              3. Create your own events to share your unique gifts
              4. Track your participation and consciousness expansion
              
              Regular participation in sacred events accelerates your spiritual growth through the power of collective consciousness.`
            }
          ]
        };
        
      case 'system-principles':
        return {
          title: 'System Principles',
          icon: Book,
          color: 'text-purple-400',
          pages: [
            {
              title: 'The Metaphysical OS Architecture',
              content: `Sacred Shifter implements a revolutionary approach to software architecture based on universal metaphysical principles. This isn't merely a design choice—it's a fundamental rethinking of how technology can mirror consciousness itself.
              
              The system is built as a living, breathing entity that evolves with you rather than a static tool with fixed functionality.`
            },
            {
              title: 'Principle of Oneness (Unified Field)',
              content: `All components communicate through a unified "Global Event Horizon" (GEH) that mirrors the quantum field where all information exists simultaneously. Instead of direct function calls, modules emit and subscribe to semantic events.
              
              Technical implementation:
              • GlobalEventHorizon service maintains the Akashic Record of all events
              • Events carry semantic meaning through essenceLabels
              • All significant system state changes are published to this field
              • Modules discover each other through field resonance, not hardcoding`
            },
            {
              title: 'Principle of Vibration (Semantic Resonance)',
              content: `Every component has a unique frequency signature expressed through "essenceLabels" that define its purpose and capabilities. Modules are selected and activated based on vibrational matching with user needs.
              
              Technical implementation:
              • LabelProcessor service matches semantic patterns
              • ModuleManifests declare resonant frequencies through essenceLabels
              • Telos (system purpose) continuously aligns with user consciousness
              • Modules with compatible frequencies naturally work together`
            },
            {
              title: 'Principle of Rhythm (Conspansion)',
              content: `The system breathes through cycles of expansion and contraction, with modules activating when needed and releasing resources when dormant.
              
              Technical implementation:
              • ModuleManager handles lifecycle (initialize, activate, deactivate, destroy)
              • Automatic resource optimization through ConsciousnessOptimizer
              • Modules expand when user focus aligns with their purpose
              • System contracts by deactivating unused modules to preserve resources`
            },
            {
              title: 'Super-Tautology (Self-Correction)',
              content: `The system maintains internal consistency through continuous integrity checking and self-correction.
              
              Technical implementation:
              • SystemIntegrityService continuously verifies system coherence
              • ModuleManifest.integrityScore tracks module reliability
              • Inconsistent states are automatically resolved
              • LabelProcessor.detectDissonance identifies logical contradictions`
            },
            {
              title: 'Module Architecture',
              content: `Modules in Sacred Shifter follow a coherent pattern that ensures they work harmoniously with the system:
              
              • Single Responsibility: Each module does one thing excellently
              • Clear Manifest: Explicit capabilities, essence labels, and Telos alignments
              • Minimal Surface Area: Only necessary functions exposed
              • Event-First: Communication primarily through the unified field
              • Robust Lifecycle: Proper initialization and cleanup
              
              This approach creates an ecosystem where modules can evolve independently while maintaining harmonious integration.`
            }
          ]
        };
        
      default:
        return {
          title: 'Module Information',
          icon: Info,
          color: 'text-blue-400',
          pages: [
            {
              title: 'Module Documentation',
              content: 'Select a specific module to view its documentation.'
            }
          ]
        };
    }
  };
  
  const moduleInfo = getModuleInfo();
  const totalPages = moduleInfo.pages.length;
  
  const nextPage = () => {
    if (currentPage < totalPages - 1) {
      setCurrentPage(currentPage + 1);
    }
  };
  
  const prevPage = () => {
    if (currentPage > 0) {
      setCurrentPage(currentPage - 1);
    }
  };
  
  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-slate-900/80 backdrop-blur-sm z-50 flex items-center justify-center p-4"
        >
          <motion.div
            initial={{ scale: 0.9, y: 20 }}
            animate={{ scale: 1, y: 0 }}
            exit={{ scale: 0.9, y: 20 }}
            className="bg-slate-900 border border-purple-500/20 rounded-xl w-full max-w-3xl max-h-[90vh] flex flex-col"
          >
            {/* Header */}
            <div className="p-6 border-b border-purple-500/20 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className={`p-2 rounded-lg ${moduleInfo.color} bg-opacity-20`}>
                  <moduleInfo.icon className={`w-6 h-6 ${moduleInfo.color}`} />
                </div>
                <h2 className="text-xl font-bold text-white">{moduleInfo.title}</h2>
              </div>
              
              <button
                onClick={onClose}
                className="p-2 text-gray-400 hover:text-white hover:bg-slate-800 rounded-lg transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            
            {/* Content */}
            <div className="p-6 overflow-y-auto flex-grow">
              <h3 className="text-lg font-semibold text-white mb-4">
                {moduleInfo.pages[currentPage].title}
              </h3>
              
              <div className="text-gray-300 space-y-4 whitespace-pre-line">
                {moduleInfo.pages[currentPage].content}
              </div>
            </div>
            
            {/* Footer with pagination */}
            <div className="p-4 border-t border-purple-500/20 flex items-center justify-between">
              <div className="text-sm text-gray-400">
                Page {currentPage + 1} of {totalPages}
              </div>
              
              <div className="flex gap-3">
                <button
                  onClick={prevPage}
                  disabled={currentPage === 0}
                  className="px-4 py-2 bg-slate-800 text-gray-300 rounded-lg border border-gray-700 hover:bg-slate-700 transition-colors disabled:opacity-50"
                >
                  Previous
                </button>
                
                <button
                  onClick={nextPage}
                  disabled={currentPage === totalPages - 1}
                  className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors disabled:opacity-50"
                >
                  Next
                </button>
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};