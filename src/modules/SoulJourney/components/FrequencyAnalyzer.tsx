import React from 'react';
import { motion } from 'framer-motion';
import { FrequencySignature } from '../SoulJourneyModule';
import { FrequencyUtils } from '../../../utils/FrequencyUtils';
import { 
  Activity, 
  Zap, 
  Heart, 
  Brain, 
  Sparkles, 
  RefreshCw,
  ArrowUpRight,
  BarChart3
} from 'lucide-react';

interface FrequencyAnalyzerProps {
  frequencyData: FrequencySignature | null;
  onAnalyze: () => void;
  isLoading: boolean;
}

export const FrequencyAnalyzer: React.FC<FrequencyAnalyzerProps> = ({ 
  frequencyData, 
  onAnalyze,
  isLoading 
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
  
  const getFrequencyDescription = (frequency: number) => {
    if (frequency === FrequencyUtils.SACRED_FREQUENCIES.ROOT) 
      return 'Root Chakra - Grounding & Survival';
    if (frequency === FrequencyUtils.SACRED_FREQUENCIES.SACRAL) 
      return 'Sacral Chakra - Creativity & Passion';
    if (frequency === FrequencyUtils.SACRED_FREQUENCIES.SOLAR) 
      return 'Solar Plexus - Transformation & Miracles';
    if (frequency === FrequencyUtils.SACRED_FREQUENCIES.HEART) 
      return 'Heart Chakra - Love & Relationships';
    if (frequency === FrequencyUtils.SACRED_FREQUENCIES.THROAT) 
      return 'Throat Chakra - Intuition & Expression';
    if (frequency === FrequencyUtils.SACRED_FREQUENCIES.THIRD_EYE) 
      return 'Third Eye - Spiritual Order & Wisdom';
    if (frequency === FrequencyUtils.SACRED_FREQUENCIES.CROWN) 
      return 'Crown Chakra - Cosmic Connection';
    
    return 'Custom Frequency';
  };
  
  const getFrequencyPattern = (pattern: string) => {
    switch (pattern) {
      case 'fibonacci': return 'Fibonacci Spiral - Expanding Consciousness';
      case 'golden': return 'Golden Ratio - Divine Proportion';
      case 'octave': return 'Octave Harmony - Dimensional Shift';
      default: return 'Harmonic Resonance';
    }
  };

  if (!frequencyData) {
    return (
      <div className="bg-slate-900/70 backdrop-blur-sm rounded-xl border border-purple-500/20 p-8 text-center">
        <div className="mb-6">
          <motion.div
            animate={{ 
              boxShadow: ['0 0 20px rgba(139, 92, 246, 0.3)', '0 0 40px rgba(139, 92, 246, 0.5)', '0 0 20px rgba(139, 92, 246, 0.3)'] 
            }}
            transition={{ duration: 3, repeat: Infinity }}
            className="w-24 h-24 bg-gradient-to-br from-purple-500 to-indigo-600 rounded-full mx-auto flex items-center justify-center"
          >
            <Activity className="w-10 h-10 text-white" />
          </motion.div>
          <h2 className="text-2xl font-bold text-white mt-4">Soul Frequency Analysis</h2>
          <p className="text-purple-300 max-w-2xl mx-auto mt-2">
            Discover your unique soul frequency pattern and chakra alignment. This analysis will reveal
            your resonant frequency and how it connects to your spiritual essence.
          </p>
        </div>
        
        <div className="max-w-xl mx-auto bg-slate-800/50 rounded-lg border border-purple-500/20 p-6 mb-6">
          <h3 className="text-lg font-medium text-white mb-4">What Soul Frequency Analysis Reveals:</h3>
          
          <div className="space-y-3 text-left">
            <div className="flex items-start gap-3">
              <div className="p-2 bg-purple-900/20 rounded-lg">
                <Zap className="w-5 h-5 text-purple-400" />
              </div>
              <div>
                <h4 className="text-white font-medium">Dominant Frequency</h4>
                <p className="text-gray-400 text-sm">Your soul's primary resonant frequency and its connection to sacred mathematics</p>
              </div>
            </div>
            
            <div className="flex items-start gap-3">
              <div className="p-2 bg-amber-900/20 rounded-lg">
                <Activity className="w-5 h-5 text-amber-400" />
              </div>
              <div>
                <h4 className="text-white font-medium">Chakra Alignment</h4>
                <p className="text-gray-400 text-sm">How your frequency distributes energy across your seven primary energy centers</p>
              </div>
            </div>
            
            <div className="flex items-start gap-3">
              <div className="p-2 bg-cyan-900/20 rounded-lg">
                <Brain className="w-5 h-5 text-cyan-400" />
              </div>
              <div>
                <h4 className="text-white font-medium">Harmonic Pattern</h4>
                <p className="text-gray-400 text-sm">The sacred geometric pattern of your frequency harmonics and resonance</p>
              </div>
            </div>
          </div>
        </div>
        
        <motion.button
          onClick={onAnalyze}
          disabled={isLoading}
          className="px-8 py-3 bg-gradient-to-r from-purple-600 to-indigo-600 text-white font-bold rounded-xl hover:from-purple-700 hover:to-indigo-700 transition-all shadow-lg shadow-purple-500/25 disabled:opacity-50"
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
        >
          {isLoading ? (
            <>
              <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin mr-2 inline-block"></div>
              Analyzing...
            </>
          ) : (
            <>
              <Sparkles className="w-5 h-5 mr-2 inline-block" />
              Begin Frequency Analysis
            </>
          )}
        </motion.button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="bg-slate-900/70 backdrop-blur-sm rounded-xl border border-purple-500/20 p-6">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-2xl font-bold text-white">Your Soul Frequency</h2>
            <p className="text-purple-300">Your unique frequency signature and chakra alignment</p>
          </div>
          
          <motion.button
            onClick={onAnalyze}
            disabled={isLoading}
            className="p-2 text-gray-400 hover:text-white hover:bg-slate-800 rounded transition-colors"
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            title="Refresh Analysis"
          >
            <RefreshCw className={`w-5 h-5 ${isLoading ? 'animate-spin' : ''}`} />
          </motion.button>
        </div>
        
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Frequency Card */}
          <div className="lg:col-span-2">
            <div className="bg-slate-800/50 rounded-lg border border-purple-500/20 p-6">
              <div className="flex items-center gap-3 mb-4">
                <div className="p-2 bg-purple-900/20 rounded-full">
                  <Zap className="w-6 h-6 text-purple-400" />
                </div>
                <h3 className="text-xl font-bold text-white">
                  {frequencyData.dominant_frequency}Hz
                </h3>
              </div>
              
              <p className="text-gray-300 mb-4">
                {getFrequencyDescription(frequencyData.dominant_frequency)}
              </p>
              
              <div className="grid grid-cols-2 gap-4 mb-4">
                <div>
                  <div className="text-sm text-gray-400">Harmonic Pattern</div>
                  <div className="text-white">
                    {getFrequencyPattern(frequencyData.harmonic_pattern.resonantPattern)}
                  </div>
                </div>
                
                <div>
                  <div className="text-sm text-gray-400">Resonance Score</div>
                  <div className="text-white flex items-center gap-1">
                    {frequencyData.resonance_score}/100
                    <ArrowUpRight className="w-4 h-4 text-green-400" />
                  </div>
                </div>
              </div>
              
              <div className="space-y-2">
                <div className="text-sm text-gray-400 mb-1">Harmonic Frequencies</div>
                <div className="flex flex-wrap gap-2">
                  <div className="px-3 py-1 bg-purple-900/20 text-purple-300 rounded-full text-sm">
                    Primary: {frequencyData.harmonic_pattern.primaryHarmonic.toFixed(2)}Hz
                  </div>
                  <div className="px-3 py-1 bg-indigo-900/20 text-indigo-300 rounded-full text-sm">
                    Secondary: {frequencyData.harmonic_pattern.secondaryHarmonic.toFixed(2)}Hz
                  </div>
                  <div className="px-3 py-1 bg-blue-900/20 text-blue-300 rounded-full text-sm">
                    Tertiary: {frequencyData.harmonic_pattern.tertiaryHarmonic.toFixed(2)}Hz
                  </div>
                </div>
              </div>
            </div>
          </div>
          
          {/* Chakra Alignment */}
          <div>
            <div className="bg-slate-800/50 rounded-lg border border-purple-500/20 p-6 h-full">
              <div className="flex items-center gap-3 mb-4">
                <div className="p-2 bg-cyan-900/20 rounded-full">
                  <Activity className="w-6 h-6 text-cyan-400" />
                </div>
                <h3 className="text-xl font-bold text-white">Chakra Alignment</h3>
              </div>
              
              <div className="space-y-3">
                {Object.entries(frequencyData.chakra_alignment).map(([chakra, value]) => (
                  <div key={chakra}>
                    <div className="flex items-center justify-between text-sm mb-1">
                      <span className="capitalize text-gray-300">{chakra.replace('-', ' ')}</span>
                      <span className="text-white">{Math.round(value)}%</span>
                    </div>
                    <div className="w-full h-2 bg-gray-700 rounded-full overflow-hidden">
                      <div 
                        className="h-full rounded-full"
                        style={{ 
                          width: `${value}%`, 
                          backgroundColor: getChakraColor(chakra) 
                        }}
                      ></div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
      
      {/* Frequency Visualization */}
      <div className="bg-slate-900/70 backdrop-blur-sm rounded-xl border border-purple-500/20 p-6">
        <div className="flex items-center gap-3 mb-6">
          <div className="p-2 bg-amber-900/20 rounded-full">
            <BarChart3 className="w-6 h-6 text-amber-400" />
          </div>
          <h3 className="text-xl font-bold text-white">Frequency Visualization</h3>
        </div>
        
        <div className="relative h-64 rounded-lg border border-gray-700 overflow-hidden bg-black/40">
          {/* Dominant Frequency Wave */}
          <svg width="100%" height="100%" viewBox="0 0 1000 300" preserveAspectRatio="none">
            <path
              d="M0,150 C50,100 100,50 150,150 C200,250 250,100 300,150 C350,200 400,50 450,150 C500,250 550,100 600,150 C650,200 700,50 750,150 C800,250 850,100 900,150 C950,200 1000,50 1000,150"
              fill="none"
              stroke="#A855F7"
              strokeWidth="3"
            />
            <path
              d="M0,150 C25,100 75,200 100,150 C125,100 175,200 200,150 C225,100 275,200 300,150 C325,100 375,200 400,150 C425,100 475,200 500,150 C525,100 575,200 600,150 C625,100 675,200 700,150 C725,100 775,200 800,150 C825,100 875,200 900,150 C925,100 975,200 1000,150"
              fill="none"
              stroke="#38BDF8"
              strokeWidth="2"
              strokeDasharray="5,5"
            />
            <path
              d="M0,150 C100,100 200,200 300,150 C400,100 500,200 600,150 C700,100 800,200 900,150"
              fill="none"
              stroke="#F97316"
              strokeWidth="1"
            />
          </svg>
          
          {/* Frequency Labels */}
          <div className="absolute top-2 left-4 text-sm font-mono text-white bg-black/40 p-1 rounded">
            {frequencyData.dominant_frequency}Hz
          </div>
          
          {/* Sacred Geometry Overlay */}
          <div className="absolute inset-0 flex items-center justify-center opacity-20">
            <div className="w-48 h-48 border-2 border-purple-500 rounded-full"></div>
            <div className="absolute w-96 h-96 border border-blue-500 rounded-full"></div>
            <div className="absolute w-64 h-64 border border-amber-500 rounded-full rotate-45"></div>
          </div>
        </div>
      </div>
      
      {/* Frequency Meaning */}
      <div className="bg-slate-900/70 backdrop-blur-sm rounded-xl border border-purple-500/20 p-6">
        <div className="flex items-center gap-3 mb-4">
          <div className="p-2 bg-green-900/20 rounded-full">
            <Heart className="w-6 h-6 text-green-400" />
          </div>
          <h3 className="text-xl font-bold text-white">Frequency Meaning</h3>
        </div>
        
        <p className="text-gray-300 mb-4">
          Your soul frequency of <span className="text-purple-300 font-semibold">{frequencyData.dominant_frequency}Hz</span> reveals 
          your core energetic essence and spiritual path. This sacred frequency resonates with your 
          <span className="text-cyan-300 font-semibold capitalize"> {FrequencyUtils.getClosestChakra(frequencyData.dominant_frequency).replace('-', ' ')}</span> chakra,
          indicating an emphasis on {frequencyData.dominant_frequency === 528 ? 'transformation and healing' : 
            frequencyData.dominant_frequency === 639 ? 'love and connection' :
            frequencyData.dominant_frequency === 741 ? 'expression and intuition' :
            frequencyData.dominant_frequency === 852 ? 'spiritual insight and wisdom' :
            frequencyData.dominant_frequency === 963 ? 'cosmic consciousness' :
            'foundational energy and stability'}.
        </p>
        
        <div className="p-4 bg-purple-900/20 rounded-lg border border-purple-500/30">
          <h4 className="text-white font-medium mb-2 flex items-center gap-2">
            <Brain className="w-4 h-4 text-purple-400" />
            Consciousness Expansion Opportunities
          </h4>
          <p className="text-purple-200 text-sm">
            With your frequency signature, you have unique potential to expand your consciousness through:
          </p>
          <ul className="mt-2 space-y-1 text-sm text-gray-300">
            <li className="flex items-center gap-2">
              <Sparkles className="w-3 h-3 text-amber-400" />
              Working with the {FrequencyUtils.getClosestChakra(frequencyData.dominant_frequency).replace('-', ' ')} chakra energies
            </li>
            <li className="flex items-center gap-2">
              <Sparkles className="w-3 h-3 text-amber-400" />
              Exploring {frequencyData.harmonic_pattern.resonantPattern} harmonic patterns in meditation
            </li>
            <li className="flex items-center gap-2">
              <Sparkles className="w-3 h-3 text-amber-400" />
              Activating archetypes that resonate with your frequency, especially 
              {frequencyData.dominant_frequency === 963 ? ' The Fool and High Priestess' : 
                frequencyData.dominant_frequency === 639 ? ' The Lovers and Empress' :
                frequencyData.dominant_frequency === 528 ? ' The Emperor and Star' : ' The Magician and Hermit'}
            </li>
          </ul>
        </div>
      </div>
    </div>
  );
};