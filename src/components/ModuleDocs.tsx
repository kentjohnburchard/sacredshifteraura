import React from 'react';
import { Book, Brain, Star, Compass, Map, Users, Calendar } from 'lucide-react';

interface ModuleDocProps {
  moduleName: string;
  className?: string;
}

export const ModuleDocs: React.FC<ModuleDocProps> = ({ 
  moduleName,
  className = ''
}) => {
  const getModuleContent = () => {
    switch(moduleName) {
      case 'soul-blueprint':
        return {
          icon: Brain,
          color: 'text-indigo-400',
          title: 'Soul Blueprint',
          description: `Map your unique soul frequency signature and divine essence through chakra alignment, elemental resonance, and frequency patterns. This module allows you to generate a digital representation of your soul's unique encoding and use it to align tasks and activities with your highest purpose.`,
          features: [
            'Generate your soul blueprint with unique frequency signature',
            'Visualize your chakra distribution and elemental resonance',
            'Analyze your consciousness pattern and evolution potential',
            'Create tasks aligned with your divine blueprint'
          ],
          technicalNote: `This module uses sacred mathematics including the golden ratio and Fibonacci sequences to generate harmonic resonance patterns that accurately reflect your soul's unique signature.`
        };
        
      case 'soul-journey':
        return {
          icon: Star,
          color: 'text-amber-400',
          title: 'Soul Journey',
          description: `Embark on a sacred journey of consciousness expansion through frequency analysis, archetype activation, guided journeys, and sound healing. This module helps you discover your soul's frequency, activate powerful archetypes, and use sacred sound for transformation.`,
          features: [
            'Discover your unique soul frequency signature',
            'Activate powerful spiritual archetypes',
            'Embark on guided consciousness expansion journeys', 
            'Experience healing through sacred sound frequencies'
          ],
          technicalNote: `The Soul Journey module implements Solfeggio frequencies (396-963Hz) and archetypal pattern recognition based on universal wisdom traditions.`
        };
        
      case 'divine-timeline':
        return {
          icon: Map,
          color: 'text-blue-400',
          title: 'Divine Timeline',
          description: `Navigate the quantum field of possibilities through timeline nodes representing potential consciousness states. Activate preferred futures through intention, meditation, and reflection to consciously participate in your evolution.`,
          features: [
            'Visualize multiple potential timeline paths',
            'Activate consciousness nodes through intention',
            'Navigate optimal, challenging, and transcendent paths',
            'Record insights through the reflection journal'
          ],
          technicalNote: `This module implements quantum possibility wave functions and consciousness probability mapping to create an interactive model of your potential future states.`
        };
        
      case 'sacred-circle':
        return {
          icon: Users,
          color: 'text-pink-400',
          title: 'Sacred Circle',
          description: `Create and participate in conscious communities for sharing wisdom, connecting with like-minded souls, and collective frequency amplification. This digital temple space facilitates authentic connection through heart-centered communication.`,
          features: [
            'Join themed sacred circles for specific consciousness work',
            'Share wisdom and insights in heart-centered communication',
            'Transmit healing frequencies directly to other participants',
            'Participate in collective consciousness expansion'
          ],
          technicalNote: `Sacred Circle implements real-time frequency transmission and love quotient measurements to create an authentic space for soul connection.`
        };
        
      case 'sacred-events':
        return {
          icon: Calendar,
          color: 'text-green-400',
          title: 'Sacred Events',
          description: `Participate in and create consciousness-expanding gatherings, ceremonies, and collective practices. These events harness the power of collective intention to amplify spiritual growth and awareness.`,
          features: [
            'Browse and join upcoming sacred gatherings',
            'Create your own consciousness expansion events',
            'Focus on specific chakra energies and intentions',
            'Track your participation and consciousness expansion'
          ],
          technicalNote: `Events module uses temporal resonance mapping to calculate optimal timing based on cosmic alignments and participant energy signatures.`
        };
        
      default:
        return {
          icon: Book,
          color: 'text-purple-400',
          title: 'Module Documentation',
          description: 'Select a specific module to view detailed documentation.',
          features: [],
          technicalNote: ''
        };
    }
  };

  const content = getModuleContent();
  const IconComponent = content.icon;
  
  return (
    <div className={`bg-slate-900/70 rounded-lg border border-purple-500/20 p-4 ${className}`}>
      <div className="flex items-center gap-3 mb-3">
        <div className={`p-2 rounded-lg bg-slate-800/70 ${content.color}`}>
          <IconComponent className={`w-5 h-5 ${content.color}`} />
        </div>
        <h3 className="text-lg font-semibold text-white">{content.title}</h3>
      </div>
      
      <p className="text-gray-300 mb-4 text-sm">
        {content.description}
      </p>
      
      {content.features.length > 0 && (
        <div className="mb-4">
          <h4 className="text-white font-medium mb-2 text-sm">Key Features:</h4>
          <ul className="space-y-1">
            {content.features.map((feature, index) => (
              <li key={index} className="text-gray-400 text-sm flex items-start gap-2">
                <span className="text-purple-400 mt-1">•</span>
                <span>{feature}</span>
              </li>
            ))}
          </ul>
        </div>
      )}
      
      {content.technicalNote && (
        <div className="text-xs text-gray-400 italic border-t border-gray-800 pt-3 mt-3">
          <strong className="text-purple-300">Technical Note:</strong> {content.technicalNote}
        </div>
      )}
    </div>
  );
};