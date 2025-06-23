import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { useAuth } from './AuthContext';
import { useChakra } from './ChakraContext';
import { GlobalEventHorizon } from '../services/GlobalEventHorizon';
import { EventBus } from '../services/EventBus';

// RSI Sensitivity Modes
export type RSISensitivityMode = 'light' | 'deep' | 'silent';

// Ego patterns that can be detected
export type EgoPattern = 
  | 'control_seeking' 
  | 'over_analysis' 
  | 'scattered_focus' 
  | 'resistance' 
  | 'avoidance'
  | 'perfectionism'
  | 'comparison'
  | 'self_doubt';

// User consent profile for RSI features
export interface UserConsentProfile {
  sensitivityMode: RSISensitivityMode;
  allowChakraTheming: boolean;
  allowEgoPatternDetection: boolean;
  allowBreathSynchronization: boolean;
  allowGuidanceSuggestions: boolean;
}

// System soul state tracking
export interface SystemSoulState {
  dominantChakra: string;
  secondaryChakra: string;
  dominantFrequency: number;
  coherenceLevel: number; // 0-100
  activeEgoPatterns: EgoPattern[];
  lastEgoPatternDetected?: {
    pattern: EgoPattern;
    timestamp: string;
    intensity: number; // 0-100
  };
  breathSyncActive: boolean;
  breathRate?: number; // breaths per minute
}

// RSI Theme properties
export interface RSITheme {
  primaryColor: string;
  secondaryColor: string;
  accentColor: string;
  glowIntensity: number; // 0-100
  animationSpeed: number; // 0-100
  pulseFrequency: number; // Hz
  backgroundPattern: 'flower_of_life' | 'sri_yantra' | 'metatrons_cube' | 'torus' | 'none';
}

// RSI Context interface
interface RSIContextType {
  // State
  userConsent: UserConsentProfile;
  soulState: SystemSoulState;
  theme: RSITheme;
  
  // Actions
  updateUserConsent: (consent: Partial<UserConsentProfile>) => void;
  detectEgoPattern: (pattern: EgoPattern, intensity?: number) => void;
  clearEgoPattern: (pattern: EgoPattern) => void;
  setDominantChakra: (chakra: string) => void;
  setCoherenceLevel: (level: number) => void;
  startBreathSync: (breathsPerMinute?: number) => void;
  stopBreathSync: () => void;
  
  // UI Helpers
  getChakraGlow: (element: string) => string;
  getAnimationStyle: (element: string) => React.CSSProperties;
  shouldShowGuidance: () => boolean;
  getGuidanceSuggestion: () => string | null;
}

// Default values
const defaultUserConsent: UserConsentProfile = {
  sensitivityMode: 'light',
  allowChakraTheming: true,
  allowEgoPatternDetection: true,
  allowBreathSynchronization: true,
  allowGuidanceSuggestions: true
};

const defaultSoulState: SystemSoulState = {
  dominantChakra: 'heart',
  secondaryChakra: 'third-eye',
  dominantFrequency: 639, // Heart chakra frequency
  coherenceLevel: 70,
  activeEgoPatterns: [],
  breathSyncActive: false
};

const defaultTheme: RSITheme = {
  primaryColor: '#8B5CF6', // Purple
  secondaryColor: '#6366F1', // Indigo
  accentColor: '#22C55E', // Green (heart chakra)
  glowIntensity: 50,
  animationSpeed: 50,
  pulseFrequency: 0.1, // Hz
  backgroundPattern: 'flower_of_life'
};

// Create context
const RSIContext = createContext<RSIContextType | undefined>(undefined);

// Provider component
export const RSIProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const { user } = useAuth();
  const { activeChakra, getChakraColor } = useChakra();
  const [geh] = useState(() => GlobalEventHorizon.getInstance());
  const [eventBus] = useState(() => EventBus.getInstance());
  
  const [userConsent, setUserConsent] = useState<UserConsentProfile>(defaultUserConsent);
  const [soulState, setSoulState] = useState<SystemSoulState>(defaultSoulState);
  const [theme, setTheme] = useState<RSITheme>(defaultTheme);
  
  // Set up event handler for soul state requests
  useEffect(() => {
    const handleSoulStateRequest = () => {
      return soulState;
    };
    
    eventBus.handleRequests('rsi:soulState:get', handleSoulStateRequest);
    
    // Publish a ready event to signal that the RSI is initialized and ready to respond to requests
    eventBus.publish(
      'rsi:ready',
      'RSI_CONTEXT',
      { status: 'ready' },
      ['rsi:status', 'system:ready', 'initialization:complete']
    );
    
    // Cleanup function to remove the handler when component unmounts
    return () => {
      // Note: EventBus should have a method to remove handlers
      // This is a placeholder - actual implementation depends on EventBus API
    };
  }, [eventBus, soulState]);
  
  // Load user consent from localStorage on init
  useEffect(() => {
    if (user) {
      try {
        const savedConsent = localStorage.getItem(`sacred_shifter_rsi_consent_${user.id}`);
        if (savedConsent) {
          setUserConsent(JSON.parse(savedConsent));
        }
      } catch (error) {
        console.error('Failed to load RSI consent settings:', error);
      }
    }
  }, [user]);
  
  // Update theme based on dominant chakra
  useEffect(() => {
    if (userConsent.allowChakraTheming) {
      updateThemeForChakra(soulState.dominantChakra);
    }
  }, [soulState.dominantChakra, userConsent.allowChakraTheming]);
  
  // Sync with active chakra from ChakraContext
  useEffect(() => {
    if (activeChakra && activeChakra !== soulState.dominantChakra) {
      setDominantChakra(activeChakra);
    }
  }, [activeChakra]);
  
  // Update user consent
  const updateUserConsent = (consent: Partial<UserConsentProfile>) => {
    const updatedConsent = { ...userConsent, ...consent };
    setUserConsent(updatedConsent);
    
    // Save to localStorage
    if (user) {
      localStorage.setItem(`sacred_shifter_rsi_consent_${user.id}`, JSON.stringify(updatedConsent));
    }
    
    // Publish event
    eventBus.publish(
      'rsi:consent:updated',
      'RSI_CONTEXT',
      { consent: updatedConsent },
      ['rsi:consent', 'user:preference', 'settings:updated']
    );
  };
  
  // Update theme based on chakra
  const updateThemeForChakra = (chakra: string) => {
    const chakraColor = getChakraColor(chakra as any);
    
    // Generate a complementary color
    const getComplementaryColor = (color: string) => {
      // Simple implementation - in a real app, use a proper color library
      const hex = color.replace('#', '');
      const r = parseInt(hex.substring(0, 2), 16);
      const g = parseInt(hex.substring(2, 4), 16);
      const b = parseInt(hex.substring(4, 6), 16);
      
      // Complementary color
      const rComp = 255 - r;
      const gComp = 255 - g;
      const bComp = 255 - b;
      
      return `#${rComp.toString(16).padStart(2, '0')}${gComp.toString(16).padStart(2, '0')}${bComp.toString(16).padStart(2, '0')}`;
    };
    
    // Get background pattern based on chakra
    const getBackgroundPattern = (chakra: string) => {
      switch (chakra) {
        case 'root': return 'metatrons_cube';
        case 'sacral': return 'flower_of_life';
        case 'solar': return 'sri_yantra';
        case 'heart': return 'flower_of_life';
        case 'throat': return 'torus';
        case 'third-eye': return 'sri_yantra';
        case 'crown': return 'metatrons_cube';
        default: return 'flower_of_life';
      }
    };
    
    // Get pulse frequency based on chakra
    const getPulseFrequency = (chakra: string) => {
      switch (chakra) {
        case 'root': return 0.05; // Slower, grounding
        case 'sacral': return 0.08;
        case 'solar': return 0.1;
        case 'heart': return 0.12;
        case 'throat': return 0.15;
        case 'third-eye': return 0.18;
        case 'crown': return 0.2; // Faster, ethereal
        default: return 0.1;
      }
    };
    
    setTheme({
      primaryColor: chakraColor,
      secondaryColor: getComplementaryColor(chakraColor),
      accentColor: chakraColor,
      glowIntensity: soulState.coherenceLevel,
      animationSpeed: 50 + (soulState.coherenceLevel / 2), // Higher coherence = faster animations
      pulseFrequency: getPulseFrequency(chakra),
      backgroundPattern: getBackgroundPattern(chakra) as any
    });
    
    // Publish theme change event
    eventBus.publish(
      'rsi:theme:updated',
      'RSI_CONTEXT',
      { 
        chakra,
        theme: {
          primaryColor: chakraColor,
          secondaryColor: getComplementaryColor(chakraColor),
          accentColor: chakraColor
        }
      },
      ['rsi:theme', 'chakra:resonance', 'ui:adaptation']
    );
  };
  
  // Detect ego pattern
  const detectEgoPattern = (pattern: EgoPattern, intensity: number = 70) => {
    if (!userConsent.allowEgoPatternDetection) return;
    
    // Add to active patterns if not already present
    if (!soulState.activeEgoPatterns.includes(pattern)) {
      const updatedPatterns = [...soulState.activeEgoPatterns, pattern];
      
      setSoulState(prev => ({
        ...prev,
        activeEgoPatterns: updatedPatterns,
        lastEgoPatternDetected: {
          pattern,
          timestamp: new Date().toISOString(),
          intensity
        }
      }));
      
      // Publish ego pattern detected event
      eventBus.publish(
        'rsi:egoPattern:detected',
        'RSI_CONTEXT',
        { 
          pattern,
          intensity,
          activePatterns: updatedPatterns
        },
        ['rsi:egoPattern', 'consciousness:awareness', 'pattern:detected']
      );
    }
  };
  
  // Clear ego pattern
  const clearEgoPattern = (pattern: EgoPattern) => {
    const updatedPatterns = soulState.activeEgoPatterns.filter(p => p !== pattern);
    
    setSoulState(prev => ({
      ...prev,
      activeEgoPatterns: updatedPatterns
    }));
    
    // Publish ego pattern cleared event
    eventBus.publish(
      'rsi:egoPattern:cleared',
      'RSI_CONTEXT',
      { 
        pattern,
        remainingPatterns: updatedPatterns
      },
      ['rsi:egoPattern', 'consciousness:awareness', 'pattern:cleared']
    );
  };
  
  // Set dominant chakra
  const setDominantChakra = (chakra: string) => {
    setSoulState(prev => ({
      ...prev,
      dominantChakra: chakra,
      secondaryChakra: prev.dominantChakra
    }));
    
    // Update frequency based on chakra
    const getFrequencyForChakra = (chakra: string): number => {
      switch (chakra) {
        case 'root': return 396;
        case 'sacral': return 417;
        case 'solar': return 528;
        case 'heart': return 639;
        case 'throat': return 741;
        case 'third-eye': return 852;
        case 'crown': return 963;
        default: return 639;
      }
    };
    
    setSoulState(prev => ({
      ...prev,
      dominantFrequency: getFrequencyForChakra(chakra)
    }));
    
    // Publish chakra change event
    eventBus.publish(
      'rsi:chakra:changed',
      'RSI_CONTEXT',
      { 
        chakra,
        previousChakra: soulState.dominantChakra,
        frequency: getFrequencyForChakra(chakra)
      },
      ['rsi:chakra', 'energy:shift', 'frequency:change']
    );
  };
  
  // Set coherence level
  const setCoherenceLevel = (level: number) => {
    // Ensure level is between 0-100
    const normalizedLevel = Math.max(0, Math.min(100, level));
    
    setSoulState(prev => ({
      ...prev,
      coherenceLevel: normalizedLevel
    }));
    
    // Update theme glow intensity
    setTheme(prev => ({
      ...prev,
      glowIntensity: normalizedLevel
    }));
    
    // Publish coherence change event
    eventBus.publish(
      'rsi:coherence:changed',
      'RSI_CONTEXT',
      { 
        level: normalizedLevel,
        previousLevel: soulState.coherenceLevel
      },
      ['rsi:coherence', 'consciousness:state', 'energy:quality']
    );
  };
  
  // Start breath synchronization
  const startBreathSync = (breathsPerMinute: number = 6) => {
    if (!userConsent.allowBreathSynchronization) return;
    
    setSoulState(prev => ({
      ...prev,
      breathSyncActive: true,
      breathRate: breathsPerMinute
    }));
    
    // Publish breath sync started event
    eventBus.publish(
      'rsi:breathSync:started',
      'RSI_CONTEXT',
      { 
        breathRate: breathsPerMinute
      },
      ['rsi:breathSync', 'meditation:support', 'ui:rhythm']
    );
  };
  
  // Stop breath synchronization
  const stopBreathSync = () => {
    setSoulState(prev => ({
      ...prev,
      breathSyncActive: false
    }));
    
    // Publish breath sync stopped event
    eventBus.publish(
      'rsi:breathSync:stopped',
      'RSI_CONTEXT',
      {},
      ['rsi:breathSync', 'meditation:complete', 'ui:rhythm']
    );
  };
  
  // Get chakra glow CSS for an element
  const getChakraGlow = (element: string) => {
    if (!userConsent.allowChakraTheming || userConsent.sensitivityMode === 'silent') {
      return '';
    }
    
    const intensity = theme.glowIntensity / 100;
    const color = theme.primaryColor;
    
    // Different elements get different glow styles
    switch (element) {
      case 'button':
        return `box-shadow: 0 0 ${5 * intensity}px ${color}, 0 0 ${10 * intensity}px ${color}30;`;
      case 'card':
        return `box-shadow: 0 0 ${10 * intensity}px ${color}30;`;
      case 'input':
        return `border-color: ${color}; box-shadow: 0 0 ${5 * intensity}px ${color}50;`;
      case 'icon':
        return `filter: drop-shadow(0 0 ${3 * intensity}px ${color});`;
      default:
        return `box-shadow: 0 0 ${5 * intensity}px ${color}50;`;
    }
  };
  
  // Get animation style for an element
  const getAnimationStyle = (element: string): React.CSSProperties => {
    if (!userConsent.allowChakraTheming || userConsent.sensitivityMode === 'silent') {
      return {};
    }
    
    const speed = theme.animationSpeed / 100;
    const breathActive = soulState.breathSyncActive;
    const breathRate = soulState.breathRate || 6; // breaths per minute
    const breathDuration = 60 / breathRate; // seconds per breath
    
    // Different elements get different animation styles
    switch (element) {
      case 'button':
        return breathActive 
          ? { 
              transition: 'all 0.3s ease',
              animation: `pulse ${breathDuration}s ease-in-out infinite`
            }
          : { 
              transition: 'all 0.3s ease',
              animation: `pulse ${2 / speed}s ease-in-out infinite`
            };
      case 'card':
        return breathActive
          ? { 
              transition: 'all 0.5s ease',
              animation: `cardGlow ${breathDuration}s ease-in-out infinite`
            }
          : {};
      case 'background':
        return breathActive
          ? { 
              transition: 'all 1s ease',
              animation: `backgroundPulse ${breathDuration}s ease-in-out infinite`
            }
          : { 
              transition: 'all 1s ease',
              animation: `backgroundPulse ${10 / speed}s ease-in-out infinite`
            };
      default:
        return {};
    }
  };
  
  // Determine if guidance should be shown
  const shouldShowGuidance = () => {
    if (!userConsent.allowGuidanceSuggestions) return false;
    if (userConsent.sensitivityMode === 'silent') return false;
    if (userConsent.sensitivityMode === 'light' && soulState.activeEgoPatterns.length === 0) return false;
    
    // In deep mode, show guidance more frequently
    if (userConsent.sensitivityMode === 'deep') return true;
    
    // In light mode, only show for active ego patterns
    return soulState.activeEgoPatterns.length > 0;
  };
  
  // Get guidance suggestion based on current state
  const getGuidanceSuggestion = (): string | null => {
    if (!shouldShowGuidance()) return null;
    
    // If there are active ego patterns, provide pattern-specific guidance
    if (soulState.activeEgoPatterns.length > 0) {
      const pattern = soulState.activeEgoPatterns[0];
      
      switch (pattern) {
        case 'control_seeking':
          return "Would you like to explore a surrender practice?";
        case 'over_analysis':
          return "Perhaps a heart-centered approach would offer balance?";
        case 'scattered_focus':
          return "Would you like to try a grounding exercise?";
        case 'resistance':
          return "What if you allowed yourself to flow with what is arising?";
        case 'avoidance':
          return "Is there something calling for your gentle attention?";
        case 'perfectionism':
          return "What if this moment is already perfect as it is?";
        case 'comparison':
          return "Your unique journey is sacred and incomparable.";
        case 'self_doubt':
          return "Would you like to connect with your inner wisdom?";
        default:
          return "Would you like a moment to center yourself?";
      }
    }
    
    // If coherence is low, offer coherence-building suggestion
    if (soulState.coherenceLevel < 50) {
      return "Would you like to take a moment for alignment?";
    }
    
    // Default chakra-based suggestions
    switch (soulState.dominantChakra) {
      case 'root':
        return "Grounding practices may support your current energy.";
      case 'sacral':
        return "Creative expression could amplify your current flow.";
      case 'solar':
        return "Setting intentions may align with your energy center.";
      case 'heart':
        return "Heart-opening practices may deepen your current resonance.";
      case 'throat':
        return "Expressing your truth may be especially powerful now.";
      case 'third-eye':
        return "Intuitive practices may enhance your current awareness.";
      case 'crown':
        return "Meditation may support your connection to higher consciousness.";
      default:
        return null;
    }
  };
  
  // Context value
  const contextValue: RSIContextType = {
    userConsent,
    soulState,
    theme,
    updateUserConsent,
    detectEgoPattern,
    clearEgoPattern,
    setDominantChakra,
    setCoherenceLevel,
    startBreathSync,
    stopBreathSync,
    getChakraGlow,
    getAnimationStyle,
    shouldShowGuidance,
    getGuidanceSuggestion
  };
  
  return (
    <RSIContext.Provider value={contextValue}>
      {children}
    </RSIContext.Provider>
  );
};

// Hook for using RSI context
export const useRSI = () => {
  const context = useContext(RSIContext);
  if (!context) {
    throw new Error('useRSI must be used within an RSIProvider');
  }
  return context;
};