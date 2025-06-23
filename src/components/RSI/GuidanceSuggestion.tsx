import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useRSI } from '../../contexts/RSIContext';
import { EventBus } from '../../services/EventBus';
import { 
  Sparkles, 
  Heart, 
  Brain, 
  Zap, 
  X, 
  ArrowRight,
  Lightbulb
} from 'lucide-react';

interface GuidanceSuggestionProps {
  className?: string;
}

export const GuidanceSuggestion: React.FC<GuidanceSuggestionProps> = ({ className = '' }) => {
  const { soulState, userConsent, shouldShowGuidance, getGuidanceSuggestion, clearEgoPattern } = useRSI();
  const [eventBus] = useState(() => EventBus.getInstance());
  const [isVisible, setIsVisible] = useState(false);
  const [currentSuggestion, setCurrentSuggestion] = useState<string | null>(null);
  const [dismissedSuggestions, setDismissedSuggestions] = useState<Set<string>>(new Set());
  
  // Check if guidance should be shown
  useEffect(() => {
    if (shouldShowGuidance()) {
      const suggestion = getGuidanceSuggestion();
      
      // Only show if we have a suggestion and it hasn't been recently dismissed
      if (suggestion && !dismissedSuggestions.has(suggestion)) {
        setCurrentSuggestion(suggestion);
        setIsVisible(true);
      } else {
        setIsVisible(false);
      }
    } else {
      setIsVisible(false);
    }
  }, [shouldShowGuidance, getGuidanceSuggestion, soulState.activeEgoPatterns, dismissedSuggestions]);
  
  // Auto-hide after 10 seconds
  useEffect(() => {
    if (isVisible) {
      const timer = setTimeout(() => {
        setIsVisible(false);
      }, 10000);
      
      return () => clearTimeout(timer);
    }
  }, [isVisible, currentSuggestion]);
  
  // Helper function to map suggestion to module ID
  const getModuleIdForSuggestion = (suggestion: string): string => {
    // Map guidance suggestions to module IDs
    if (suggestion.includes("grounding practice")) return "soul-journey";
    if (suggestion.includes("surrender practice")) return "soul-journey";
    if (suggestion.includes("heart-centered approach")) return "soul-journey";
    if (suggestion.includes("grounding exercise")) return "soul-journey";
    if (suggestion.includes("flow with what is arising")) return "soul-journey";
    if (suggestion.includes("gentle attention")) return "soul-journey";
    if (suggestion.includes("already perfect")) return "soul-journey";
    if (suggestion.includes("unique journey")) return "circles";
    if (suggestion.includes("inner wisdom")) return "soul-blueprint";
    if (suggestion.includes("center yourself")) return "soul-journey";
    if (suggestion.includes("alignment")) return "soul-journey";
    
    // Chakra-based suggestions
    if (suggestion.includes("grounding practices")) return "soul-journey";
    if (suggestion.includes("creative expression")) return "soul-journey";
    if (suggestion.includes("setting intentions")) return "tasks";
    if (suggestion.includes("heart-opening")) return "soul-journey";
    if (suggestion.includes("expressing your truth")) return "circles";
    if (suggestion.includes("intuitive practices")) return "divine-timeline";
    if (suggestion.includes("meditation")) return "soul-journey";
    
    // Default fallbacks based on dominant chakra
    switch(soulState.dominantChakra) {
      case 'root':
      case 'sacral':
        return "soul-journey"; // Frequency healing is good for lower chakras
      case 'solar':
        return "tasks"; // Tasks are good for solar plexus (will)
      case 'heart':
        return "circles"; // Connection is good for heart
      case 'throat':
        return "circles"; // Communication is good for throat
      case 'third-eye':
        return "divine-timeline"; // Intuition is good for third eye
      case 'crown':
        return "soul-blueprint"; // Soul understanding is good for crown
      default:
        return "consciousness"; // Default to consciousness module
    }
  };
  
  const handleDismiss = () => {
    if (currentSuggestion) {
      // Add to dismissed suggestions
      setDismissedSuggestions(prev => new Set(prev).add(currentSuggestion));
      
      // Clear any active ego patterns
      if (soulState.activeEgoPatterns.length > 0) {
        clearEgoPattern(soulState.activeEgoPatterns[0]);
      }
    }
    
    setIsVisible(false);
  };
  
  const handleAccept = () => {
    if (currentSuggestion) {
      // Get the target module ID based on the suggestion
      const targetModuleId = getModuleIdForSuggestion(currentSuggestion);
      
      // Publish navigation event via EventBus
      eventBus.publish(
        'rsi:guidance:accepted',
        'RSI_GUIDANCE',
        { 
          moduleId: targetModuleId,
          suggestion: currentSuggestion 
        },
        ['rsi:guidance', 'navigation:request', 'user:assisted']
      );
      
      // Clear any active ego patterns
      if (soulState.activeEgoPatterns.length > 0) {
        clearEgoPattern(soulState.activeEgoPatterns[0]);
      }
    }
    
    setIsVisible(false);
  };
  
  // Get icon based on dominant chakra
  const getIcon = () => {
    switch (soulState.dominantChakra) {
      case 'root':
      case 'sacral':
      case 'solar':
        return <Zap className="w-5 h-5" />;
      case 'heart':
        return <Heart className="w-5 h-5" />;
      case 'throat':
      case 'third-eye':
        return <Brain className="w-5 h-5" />;
      case 'crown':
        return <Sparkles className="w-5 h-5" />;
      default:
        return <Lightbulb className="w-5 h-5" />;
    }
  };
  
  if (!isVisible || !currentSuggestion) {
    return null;
  }
  
  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -20 }}
        className={`fixed bottom-6 right-6 max-w-xs z-50 ${className}`}
      >
        <div 
          className="bg-slate-900/90 backdrop-blur-sm rounded-lg border p-4 shadow-lg chakra-card-glow"
          style={{ borderColor: `var(--chakra-primary-color)50` }}
        >
          <div className="flex items-start gap-3">
            <div 
              className="p-2 rounded-full chakra-glow"
              style={{ backgroundColor: `var(--chakra-primary-color)20` }}
            >
              {getIcon()}
            </div>
            
            <div className="flex-1">
              <p className="text-white">{currentSuggestion}</p>
              
              <div className="flex justify-end mt-3 gap-2">
                <button
                  onClick={handleDismiss}
                  className="p-1 text-gray-400 hover:text-white transition-colors"
                >
                  <X className="w-4 h-4" />
                </button>
                
                <button
                  onClick={handleAccept}
                  className="flex items-center gap-1 px-3 py-1 rounded-lg text-sm chakra-glow"
                  style={{ 
                    backgroundColor: `var(--chakra-primary-color)20`,
                    color: `var(--chakra-primary-color)` 
                  }}
                >
                  <span>Guide me</span>
                  <ArrowRight className="w-3 h-3" />
                </button>
              </div>
            </div>
          </div>
        </div>
      </motion.div>
    </AnimatePresence>
  );
};