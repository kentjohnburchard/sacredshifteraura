import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FrequencySignature, SoulJourneySession } from '../SoulJourneyModule';
import { FrequencyUtils } from '../../../utils/FrequencyUtils';
import { 
  Compass, 
  Play, 
  Pause, 
  Clock, 
  User, 
  Sparkles,
  Calendar,
  MessageSquare,
  ChevronRight,
  Brain,
  Heart,
  Target,
  X,
  Check,
  Star
} from 'lucide-react';

interface SoulJourneyGuideProps {
  frequencyData: FrequencySignature | null;
  journeySessions: SoulJourneySession[];
  onStartJourney: (journeyType: string, frequencies: number[]) => Promise<string | null>;
  onCompleteJourney: (sessionId: string, expansionLevel: number, insights: string) => void;
  isLoading: boolean;
}

export const SoulJourneyGuide: React.FC<SoulJourneyGuideProps> = ({
  frequencyData,
  journeySessions,
  onStartJourney,
  onCompleteJourney,
  isLoading
}) => {
  const [activeJourney, setActiveJourney] = useState<string | null>(null);
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [journeyInProgress, setJourneyInProgress] = useState(false);
  const [journeyTimeElapsed, setJourneyTimeElapsed] = useState(0);
  const [journeyTimer, setJourneyTimer] = useState<NodeJS.Timeout | null>(null);
  const [expansionLevel, setExpansionLevel] = useState(5);
  const [journeyInsights, setJourneyInsights] = useState('');
  const [showCompletionForm, setShowCompletionForm] = useState(false);
  
  const journeyTypes = [
    {
      id: 'soul-purpose',
      title: 'Soul Purpose Journey',
      description: 'Connect with your highest purpose and divine mission',
      duration: 15,
      frequency: frequencyData?.dominant_frequency || 639,
      chakra: 'crown',
      icon: Compass
    },
    {
      id: 'heart-expansion',
      title: 'Heart Expansion',
      description: 'Open and expand your heart consciousness to greater love',
      duration: 10,
      frequency: 639,
      chakra: 'heart',
      icon: Heart
    },
    {
      id: 'wisdom-activation',
      title: 'Wisdom Activation',
      description: 'Access ancient wisdom and expanded consciousness',
      duration: 20,
      frequency: 852,
      chakra: 'third_eye',
      icon: Brain
    },
    {
      id: 'sacred-integration',
      title: 'Sacred Integration',
      description: 'Integrate higher knowledge into your daily awareness',
      duration: 15,
      frequency: 528,
      chakra: 'solar_plexus',
      icon: Target
    }
  ];

  const startJourney = async (journey: typeof journeyTypes[0]) => {
    if (journeyInProgress) return;
    
    setActiveJourney(journey.id);
    
    // Calculate frequencies to use
    const frequencies = [
      journey.frequency,
      journey.frequency * FrequencyUtils.GOLDEN_RATIO,
      FrequencyUtils.getChakraFrequency(journey.chakra)
    ];
    
    const newSessionId = await onStartJourney(journey.id, frequencies);
    if (newSessionId) {
      setSessionId(newSessionId);
      setJourneyInProgress(true);
      setJourneyTimeElapsed(0);
      
      // Start timer
      const timer = setInterval(() => {
        setJourneyTimeElapsed(prev => prev + 1);
      }, 1000);
      
      setJourneyTimer(timer);
    }
  };
  
  const pauseJourney = () => {
    if (journeyTimer) {
      clearInterval(journeyTimer);
      setJourneyTimer(null);
    }
  };
  
  const resumeJourney = () => {
    if (!journeyTimer) {
      const timer = setInterval(() => {
        setJourneyTimeElapsed(prev => prev + 1);
      }, 1000);
      setJourneyTimer(timer);
    }
  };
  
  const completeJourney = () => {
    if (journeyTimer) {
      clearInterval(journeyTimer);
      setJourneyTimer(null);
    }
    
    setShowCompletionForm(true);
  };
  
  const submitCompletionForm = () => {
    if (sessionId) {
      onCompleteJourney(sessionId, expansionLevel, journeyInsights);
      
      // Reset state
      setJourneyInProgress(false);
      setActiveJourney(null);
      setSessionId(null);
      setJourneyTimeElapsed(0);
      setExpansionLevel(5);
      setJourneyInsights('');
      setShowCompletionForm(false);
    }
  };
  
  const cancelJourney = () => {
    if (journeyTimer) {
      clearInterval(journeyTimer);
      setJourneyTimer(null);
    }
    
    // Reset state
    setJourneyInProgress(false);
    setActiveJourney(null);
    setSessionId(null);
    setJourneyTimeElapsed(0);
    setShowCompletionForm(false);
  };
  
  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };
  
  const getActiveJourneyDetails = () => {
    return journeyTypes.find(journey => journey.id === activeJourney);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString();
  };

  return (
    <div className="space-y-6">
      <div className="bg-slate-900/70 backdrop-blur-sm rounded-xl border border-purple-500/20 p-6">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-2xl font-bold text-white">Soul Journey Guide</h2>
            <p className="text-purple-300">Embark on guided journeys to expand your consciousness</p>
          </div>
          
          <div className="p-3 bg-purple-900/20 text-purple-300 rounded-lg text-sm flex items-center gap-2">
            <Calendar className="w-4 h-4" />
            <span>{journeySessions.length} Journeys Completed</span>
          </div>
        </div>
        
        {journeyInProgress ? (
          <div className="p-6 bg-slate-800/50 rounded-lg border border-purple-500/30">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-3">
                <div className="p-3 bg-purple-900/30 rounded-full">
                  {(() => {
                    const activeDetails = getActiveJourneyDetails();
                    if (activeDetails?.icon) {
                      const IconComponent = activeDetails.icon;
                      return <IconComponent className="w-6 h-6 text-purple-400" />;
                    }
                    return null;
                  })()}
                </div>
                <div>
                  <h3 className="text-xl font-bold text-white">{getActiveJourneyDetails()?.title}</h3>
                  <div className="text-sm text-gray-400">{getActiveJourneyDetails()?.description}</div>
                </div>
              </div>
              
              <div className="text-2xl font-bold text-white">{formatTime(journeyTimeElapsed)}</div>
            </div>
            
            <div className="relative h-3 bg-gray-700 rounded-full mb-6">
              <motion.div
                className="absolute h-full bg-purple-500 rounded-full"
                initial={{ width: '0%' }}
                animate={{ width: `${(journeyTimeElapsed / (getActiveJourneyDetails()?.duration || 15) / 60) * 100}%` }}
                transition={{ duration: 1, ease: "easeInOut" }}
              />
            </div>
            
            <div className="flex justify-center gap-4">
              {journeyTimer ? (
                <button
                  onClick={pauseJourney}
                  className="p-3 bg-slate-700 text-white rounded-full"
                >
                  <Pause className="w-6 h-6" />
                </button>
              ) : (
                <button
                  onClick={resumeJourney}
                  className="p-3 bg-purple-600 text-white rounded-full"
                >
                  <Play className="w-6 h-6" />
                </button>
              )}
              
              <button
                onClick={completeJourney}
                className="px-5 py-3 bg-amber-600/20 text-amber-300 border border-amber-500/30 rounded-lg hover:bg-amber-600/30 transition-colors"
              >
                Complete Journey
              </button>
              
              <button
                onClick={cancelJourney}
                className="px-5 py-3 bg-slate-700/50 text-gray-300 border border-gray-600 rounded-lg hover:bg-slate-700 transition-colors"
              >
                Cancel
              </button>
            </div>
            
            <div className="mt-6 p-4 bg-slate-700/30 rounded-lg">
              <div className="flex items-center gap-2 mb-2">
                <Sparkles className="w-4 h-4 text-purple-400" />
                <h4 className="text-white font-medium">Current Frequencies</h4>
              </div>
              
              <div className="grid grid-cols-3 gap-2">
                <div className="p-2 bg-purple-900/20 text-purple-300 rounded text-center text-sm">
                  Primary: {getActiveJourneyDetails()?.frequency}Hz
                </div>
                <div className="p-2 bg-blue-900/20 text-blue-300 rounded text-center text-sm">
                  Harmonic: {Math.round(getActiveJourneyDetails()?.frequency! * FrequencyUtils.GOLDEN_RATIO)}Hz
                </div>
                <div className="p-2 bg-green-900/20 text-green-300 rounded text-center text-sm">
                  Chakra: {FrequencyUtils.getChakraFrequency(getActiveJourneyDetails()?.chakra!)}Hz
                </div>
              </div>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {journeyTypes.map((journey) => (
              <motion.div
                key={journey.id}
                className="p-6 bg-slate-800/50 rounded-lg border border-gray-700 hover:border-purple-500/50 transition-all cursor-pointer"
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => startJourney(journey)}
              >
                <div className="flex items-start gap-3 mb-3">
                  <div className="p-2 bg-purple-900/30 rounded-lg">
                    <journey.icon className="w-5 h-5 text-purple-400" />
                  </div>
                  
                  <div className="flex-1">
                    <h3 className="text-lg font-bold text-white">{journey.title}</h3>
                    <p className="text-gray-400 text-sm">{journey.description}</p>
                  </div>
                </div>
                
                <div className="flex justify-between text-sm">
                  <div className="flex items-center gap-1 text-gray-400">
                    <Clock className="w-4 h-4" />
                    {journey.duration} minutes
                  </div>
                  
                  <div className="flex items-center gap-1 text-purple-300">
                    <Sparkles className="w-4 h-4" />
                    {journey.frequency}Hz
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>
      
      {/* Journey History */}
      {journeySessions.length > 0 && (
        <div className="bg-slate-900/70 backdrop-blur-sm rounded-xl border border-purple-500/20 p-6">
          <h3 className="text-lg font-bold text-white mb-4">Your Journey History</h3>
          
          <div className="space-y-3">
            {journeySessions.slice(0, 5).map((session) => (
              <div 
                key={session.id} 
                className="p-4 bg-slate-800/50 rounded-lg border border-gray-700"
              >
                <div className="flex items-start justify-between mb-2">
                  <div className="flex items-start gap-3">
                    <div className="p-2 bg-purple-900/30 rounded-lg">
                      {session.journey_type === 'soul-purpose' ? (
                        <Compass className="w-4 h-4 text-purple-400" />
                      ) : session.journey_type === 'heart-expansion' ? (
                        <Heart className="w-4 h-4 text-pink-400" />
                      ) : session.journey_type === 'wisdom-activation' ? (
                        <Brain className="w-4 h-4 text-blue-400" />
                      ) : (
                        <Target className="w-4 h-4 text-amber-400" />
                      )}
                    </div>
                    
                    <div>
                      <h4 className="text-white font-medium">
                        {session.journey_type === 'soul-purpose'
                          ? 'Soul Purpose Journey'
                          : session.journey_type === 'heart-expansion'
                          ? 'Heart Expansion'
                          : session.journey_type === 'wisdom-activation'
                          ? 'Wisdom Activation'
                          : 'Sacred Integration'}
                      </h4>
                      <div className="flex items-center gap-2 text-xs text-gray-400">
                        <Calendar className="w-3 h-3" />
                        <span>{formatDate(session.created_at!)}</span>
                        <span>•</span>
                        <Clock className="w-3 h-3" />
                        <span>{session.duration_minutes} minutes</span>
                      </div>
                    </div>
                  </div>
                  
                  {session.consciousness_expansion_level && (
                    <div className="flex items-center gap-1 px-2 py-1 bg-purple-900/20 text-purple-300 rounded text-sm">
                      <Brain className="w-3 h-3" />
                      Level {session.consciousness_expansion_level}/10
                    </div>
                  )}
                </div>
                
                {session.insights_gained && (
                  <div className="mt-2 ml-9 pl-3 border-l border-purple-500/30">
                    <div className="text-sm text-gray-300">"{session.insights_gained}"</div>
                  </div>
                )}
                
                {session.frequencies_used && session.frequencies_used.length > 0 && (
                  <div className="mt-2 ml-9 flex flex-wrap gap-1">
                    {session.frequencies_used.map((freq, index) => (
                      <div key={index} className="px-2 py-1 bg-slate-700/50 rounded text-xs text-gray-300">
                        {freq}Hz
                      </div>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>
          
          {journeySessions.length > 5 && (
            <button className="mt-4 w-full py-2 bg-slate-800 text-gray-300 rounded-lg border border-gray-700 hover:bg-slate-700 transition-colors text-sm">
              View All Journeys
            </button>
          )}
        </div>
      )}
      
      {/* Journey Completion Modal */}
      <AnimatePresence>
        {showCompletionForm && (
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
                <h3 className="text-xl font-bold text-white">Journey Complete</h3>
                <button
                  onClick={cancelJourney}
                  className="p-1 text-gray-400 hover:text-white transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
              
              <div className="mb-6">
                <p className="text-gray-300 mb-4">
                  You've completed your {getActiveJourneyDetails()?.title} journey. 
                  Take a moment to integrate the experience and share your insights.
                </p>
                
                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Consciousness Expansion Level (1-10)
                  </label>
                  <input
                    type="range"
                    min="1"
                    max="10"
                    value={expansionLevel}
                    onChange={(e) => setExpansionLevel(parseInt(e.target.value))}
                    className="w-full"
                  />
                  <div className="flex justify-between text-xs text-gray-400 mt-1">
                    <span>Minimal</span>
                    <span>Moderate</span>
                    <span>Profound</span>
                  </div>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Insights & Reflections
                  </label>
                  <textarea
                    value={journeyInsights}
                    onChange={(e) => setJourneyInsights(e.target.value)}
                    placeholder="Share what you experienced or learned during this journey..."
                    className="w-full p-3 bg-slate-800 text-white rounded-lg border border-gray-600 focus:border-purple-400 focus:outline-none h-32"
                  />
                </div>
              </div>
              
              <div className="flex justify-end gap-3">
                <button
                  onClick={cancelJourney}
                  className="px-4 py-2 bg-slate-800 text-gray-300 rounded-lg border border-gray-600 hover:bg-slate-700 transition-colors"
                >
                  Skip
                </button>
                
                <motion.button
                  onClick={submitCompletionForm}
                  disabled={isLoading}
                  className="px-5 py-2 bg-gradient-to-r from-purple-600 to-indigo-600 text-white rounded-lg hover:from-purple-700 hover:to-indigo-700 transition-all flex items-center gap-2 disabled:opacity-50"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  {isLoading ? (
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  ) : (
                    <Check className="w-4 h-4" />
                  )}
                  Save Journey
                </motion.button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};