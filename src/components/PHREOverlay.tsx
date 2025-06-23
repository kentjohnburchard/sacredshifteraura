import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { PHREForecast, HarmonicIntervention } from '../types/phre';
import { EventBus } from '../services/EventBus';
import { PHREngine } from '../services/PHREngine';
import { useRSI } from '../contexts/RSIContext';
import { 
  Sparkles, 
  Activity, 
  Zap, 
  Eye, 
  Heart,
  Brain,
  ArrowRight,
  X,
  Star,
  Clock
} from 'lucide-react';

interface PHREOverlayProps {
  className?: string;
}

export const PHREOverlay: React.FC<PHREOverlayProps> = ({ className = '' }) => {
  const { soulState, userConsent } = useRSI();
  const [eventBus] = useState(() => EventBus.getInstance());
  const [phrEngine] = useState(() => PHREngine.getInstance());
  
  const [activeForecast, setActiveForecast] = useState<PHREForecast | null>(null);
  const [suggestedInterventions, setSuggestedInterventions] = useState<HarmonicIntervention[]>([]);
  const [showInterventions, setShowInterventions] = useState(false);
  const [pulseSize, setPulseSize] = useState(1);
  
  // Listen for PHRE forecasts and intervention suggestions
  useEffect(() => {
    const forecastSubscription = eventBus.subscribe('phre:forecast:generated', (event) => {
      const forecastId = event.payload?.forecastId;
      const forecast = phrEngine.getActiveForecast();
      
      if (forecast && forecast.id === forecastId) {
        setActiveForecast(forecast);
      }
    });
    
    const interventionSubscription = eventBus.subscribe('phre:intervention:suggested', (event) => {
      const intervention = event.payload;
      if (intervention) {
        setSuggestedInterventions(prev => [...prev, intervention]);
      }
    });
    
    return () => {
      forecastSubscription();
      interventionSubscription();
    };
  }, [eventBus, phrEngine]);
  
  // Create pulsing effect based on forecast and soul state
  useEffect(() => {
    if (!activeForecast) {
      // Default pulse if no forecast
      const pulseInterval = setInterval(() => {
        setPulseSize(prev => prev === 1 ? 1.05 : 1);
      }, 2000);
      
      return () => clearInterval(pulseInterval);
    }
    
    // Adjust pulse based on forecast type and probability
    let pulseFrequency = 2000; // Default 2 seconds
    let pulseIntensity = 0.05; // Default pulse size change
    
    if (activeForecast.type === 'frequency:shift:upcoming') {
      pulseFrequency = 1500; // Faster pulse for frequency shift
      pulseIntensity = 0.08; // More pronounced
    } else if (activeForecast.type === 'harmony:increasing') {
      pulseFrequency = 3000; // Slower, more gentle pulse
      pulseIntensity = 0.04; // Subtle pulse
    } else if (activeForecast.type === 'dissonance:potential') {
      pulseFrequency = 1200; // Fast pulse for alert
      pulseIntensity = 0.1; // More pronounced
    }
    
    // Scale by probability
    pulseFrequency = pulseFrequency * (1 / Math.max(0.5, activeForecast.probability));
    
    // Create pulse effect
    const pulseInterval = setInterval(() => {
      setPulseSize(prev => prev === 1 ? 1 + pulseIntensity : 1);
    }, pulseFrequency);
    
    return () => clearInterval(pulseInterval);
  }, [activeForecast]);
  
  // Dismiss old interventions after a while
  useEffect(() => {
    if (suggestedInterventions.length === 0) return;
    
    const timeout = setTimeout(() => {
      // Keep only recent interventions (last 5 minutes)
      const fiveMinutesAgo = new Date(Date.now() - 5 * 60 * 1000).toISOString();
      setSuggestedInterventions(prev => 
        prev.filter(i => !i.appliedTimestamp || i.appliedTimestamp > fiveMinutesAgo)
      );
    }, 60000); // Check every minute
    
    return () => clearTimeout(timeout);
  }, [suggestedInterventions]);
  
  // Handle intervention acceptance
  const handleAcceptIntervention = (intervention: HarmonicIntervention) => {
    // Mark as applied
    const updatedIntervention = {
      ...intervention,
      appliedTimestamp: new Date().toISOString()
    };
    
    // Update local state
    setSuggestedInterventions(prev => 
      prev.map(i => i.id === intervention.id ? updatedIntervention : i)
    );
    
    // Publish acceptance event
    eventBus.publish(
      'phre:intervention:accepted',
      'PHRE_OVERLAY',
      { 
        interventionId: intervention.id,
        type: intervention.type
      },
      ['phre:intervention', 'user:accepted', ...intervention.essenceLabels]
    );
    
    // If it's a module suggestion, navigate to that module
    if (intervention.type === 'module:suggestion' && intervention.associatedModule) {
      eventBus.publish(
        'rsi:guidance:accepted',
        'PHRE_OVERLAY',
        { 
          moduleId: intervention.associatedModule,
          source: 'phre:intervention'
        },
        ['rsi:guidance', 'navigation:request', 'phre:directed']
      );
    }
    
    // If it's a breath sync suggestion, start breath sync
    if (intervention.type === 'breath:synchronization') {
      eventBus.publish(
        'phre:breath:synchronize',
        'PHRE_OVERLAY',
        { 
          interventionId: intervention.id,
          requestSync: true 
        },
        ['phre:breath', 'sync:request', 'user:initiated']
      );
    }
  };
  
  // Handle intervention dismissal
  const handleDismissIntervention = (intervention: HarmonicIntervention) => {
    // Remove from local state
    setSuggestedInterventions(prev => 
      prev.filter(i => i.id !== intervention.id)
    );
    
    // Publish dismissal event
    eventBus.publish(
      'phre:intervention:dismissed',
      'PHRE_OVERLAY',
      { 
        interventionId: intervention.id,
        type: intervention.type
      },
      ['phre:intervention', 'user:dismissed', ...intervention.essenceLabels]
    );
  };
  
  // Don't show overlay if user has set silent mode
  if (userConsent.sensitivityMode === 'silent') {
    return null;
  }
  
  // Get icon for forecast type
  const getForecastIcon = (forecast: PHREForecast) => {
    switch (forecast.type) {
      case 'harmony:increasing':
        return <Heart className="w-5 h-5 text-green-400" />;
      case 'harmony:decreasing':
        return <Activity className="w-5 h-5 text-orange-400" />;
      case 'frequency:shift:upcoming':
        return <Zap className="w-5 h-5 text-blue-400" />;
      case 'resonance:opportunity':
        return <Star className="w-5 h-5 text-amber-400" />;
      case 'dissonance:potential':
        return <Activity className="w-5 h-5 text-red-400" />;
      case 'chakra:transition':
        return <Sparkles className="w-5 h-5 text-purple-400" />;
      case 'consciousness:expansion':
        return <Brain className="w-5 h-5 text-indigo-400" />;
      case 'pattern:emerging':
        return <Eye className="w-5 h-5 text-cyan-400" />;
      default:
        return <Sparkles className="w-5 h-5 text-purple-400" />;
    }
  };
  
  // Get color for forecast type
  const getForecastColor = (forecast: PHREForecast) => {
    switch (forecast.type) {
      case 'harmony:increasing':
        return 'bg-green-500/10 border-green-500/20 text-green-400';
      case 'harmony:decreasing':
        return 'bg-orange-500/10 border-orange-500/20 text-orange-400';
      case 'frequency:shift:upcoming':
        return 'bg-blue-500/10 border-blue-500/20 text-blue-400';
      case 'resonance:opportunity':
        return 'bg-amber-500/10 border-amber-500/20 text-amber-400';
      case 'dissonance:potential':
        return 'bg-red-500/10 border-red-500/20 text-red-400';
      case 'chakra:transition':
        return 'bg-purple-500/10 border-purple-500/20 text-purple-400';
      case 'consciousness:expansion':
        return 'bg-indigo-500/10 border-indigo-500/20 text-indigo-400';
      case 'pattern:emerging':
        return 'bg-cyan-500/10 border-cyan-500/20 text-cyan-400';
      default:
        return 'bg-purple-500/10 border-purple-500/20 text-purple-400';
    }
  };
  
  // Get icon for intervention type
  const getInterventionIcon = (intervention: HarmonicIntervention) => {
    switch (intervention.type) {
      case 'frequency:adjustment':
        return <Zap className="w-4 h-4 text-blue-400" />;
      case 'chakra:balancing':
        return <Sparkles className="w-4 h-4 text-purple-400" />;
      case 'guidance:offer':
        return <Brain className="w-4 h-4 text-indigo-400" />;
      case 'module:suggestion':
        return <ArrowRight className="w-4 h-4 text-amber-400" />;
      case 'breath:synchronization':
        return <Activity className="w-4 h-4 text-cyan-400" />;
      case 'visual:harmony':
        return <Eye className="w-4 h-4 text-green-400" />;
      case 'sound:harmony':
        return <Star className="w-4 h-4 text-pink-400" />;
      default:
        return <Star className="w-4 h-4 text-purple-400" />;
    }
  };
  
  // Render pulse indicator on the edge of the screen
  const renderPulseIndicator = () => {
    if (!activeForecast) return null;
    
    // Position in bottom right corner by default
    let position = { right: '16px', bottom: '16px' };
    
    // Adjust position based on chakra
    switch (soulState.dominantChakra) {
      case 'root':
        position = { right: '16px', bottom: '16px' };
        break;
      case 'sacral':
        position = { right: '16px', bottom: '48px' };
        break;
      case 'solar':
        position = { right: '16px', bottom: '80px' };
        break;
      case 'heart':
        position = { right: '16px', bottom: '112px' };
        break;
      case 'throat':
        position = { right: '16px', bottom: '144px' };
        break;
      case 'third-eye':
        position = { right: '16px', bottom: '176px' };
        break;
      case 'crown':
        position = { right: '16px', bottom: '208px' };
        break;
    }
    
    return (
      <motion.div 
        className={`fixed w-4 h-4 rounded-full ${getForecastColor(activeForecast)} z-40`}
        style={position}
        animate={{ 
          scale: pulseSize, 
          opacity: [0.8, 0.5, 0.8],
          boxShadow: [
            `0 0 5px var(--chakra-primary-color)30`,
            `0 0 10px var(--chakra-primary-color)50`,
            `0 0 5px var(--chakra-primary-color)30`
          ]
        }}
        transition={{
          duration: 2,
          repeat: Infinity,
          ease: "easeInOut"
        }}
        onClick={() => setShowInterventions(!showInterventions)}
      />
    );
  };
  
  return (
    <>
      {/* Pulse indicator */}
      {activeForecast && renderPulseIndicator()}
      
      {/* Interventions panel */}
      <AnimatePresence>
        {showInterventions && suggestedInterventions.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
            className={`fixed bottom-16 right-6 max-w-sm z-40 ${className}`}
          >
            <div className="bg-slate-900/90 backdrop-blur-sm rounded-lg border border-purple-500/20 p-4 shadow-lg">
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-white font-medium flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-purple-400" />
                  Harmonic Interventions
                </h3>
                <button
                  onClick={() => setShowInterventions(false)}
                  className="p-1 text-gray-400 hover:text-white transition-colors"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
              
              {/* Current forecast */}
              {activeForecast && (
                <div className={`p-3 rounded-lg border ${getForecastColor(activeForecast)} mb-3`}>
                  <div className="flex items-start gap-2">
                    {getForecastIcon(activeForecast)}
                    <div>
                      <div className="text-sm font-medium">
                        {activeForecast.description}
                      </div>
                      <div className="flex items-center mt-1 text-xs opacity-80">
                        <Clock className="w-3 h-3 mr-1" />
                        <span>
                          {Math.round(activeForecast.timeHorizon / 60)} min forecast
                        </span>
                        <span className="mx-2">•</span>
                        <span>
                          {Math.round(activeForecast.probability * 100)}% confidence
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              )}
              
              {/* Intervention suggestions */}
              <div className="space-y-2 max-h-64 overflow-y-auto pr-1">
                {suggestedInterventions.map((intervention) => (
                  <motion.div
                    key={intervention.id}
                    className="p-3 bg-slate-800/50 rounded-lg border border-gray-700 hover:border-purple-500/30 transition-all"
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: 10 }}
                  >
                    <div className="flex items-start gap-2">
                      <div className="p-1.5 bg-slate-700 rounded-full mt-0.5">
                        {getInterventionIcon(intervention)}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm text-white">
                          {intervention.suggestedAction}
                        </p>
                        <div className="flex items-center justify-between mt-2">
                          <div className="text-xs text-gray-400">
                            Priority: {intervention.priority}/10
                          </div>
                          <div className="flex items-center gap-2">
                            <button
                              onClick={() => handleDismissIntervention(intervention)}
                              className="p-1 text-gray-400 hover:text-white transition-colors"
                            >
                              <X className="w-3 h-3" />
                            </button>
                            <button
                              onClick={() => handleAcceptIntervention(intervention)}
                              className="px-2 py-1 bg-purple-600/20 text-purple-300 rounded border border-purple-500/30 hover:bg-purple-600/30 transition-colors text-xs"
                            >
                              Accept
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                ))}
                
                {suggestedInterventions.length === 0 && (
                  <div className="text-center py-3 text-gray-400">
                    <p>No active intervention suggestions</p>
                  </div>
                )}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};