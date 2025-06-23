import React, { useState, useEffect } from 'react';
import { useRSI } from '../../contexts/RSIContext';
import { EventBus } from '../../services/EventBus';
import { GuidanceSuggestion } from './GuidanceSuggestion';
import { ChakraThemeProvider } from './ChakraThemeProvider';
import { RSISettingsPanel } from './RSISettingsPanel';
import { BreathSyncController } from './BreathSyncController';
import { ChakraNavigationMap } from './ChakraNavigationMap';
import { 
  Settings, 
  Map, 
  Wind, 
  Zap,
  Eye
} from 'lucide-react';

interface RSIControllerProps {
  onNavigate: (module: string) => void;
}

export const RSIController: React.FC<RSIControllerProps> = ({ onNavigate }) => {
  const { soulState, userConsent, detectEgoPattern } = useRSI();
  const [eventBus] = useState(() => EventBus.getInstance());
  const [showSettings, setShowSettings] = useState(false);
  const [showBreathSync, setShowBreathSync] = useState(false);
  const [showNavigationMap, setShowNavigationMap] = useState(false);
  const [lastUserAction, setLastUserAction] = useState<Date | null>(null);
  const [userActionCount, setUserActionCount] = useState(0);
  
  // Setup EventBus subscription for guidance navigation and PHRE suggestions
  useEffect(() => {
    // Subscribe to guidance accepted events
    const guidanceSubscription = eventBus.subscribe('rsi:guidance:accepted', (event) => {
      const moduleId = event.payload?.moduleId;
      if (moduleId) {
        // Navigate to the requested module
        onNavigate(moduleId);
      }
    });
    
    // Subscribe to PHRE module suggestions
    const phreSubscription = eventBus.subscribe('phre:module:suggest', (event) => {
      const moduleId = event.payload?.moduleId;
      const reason = event.payload?.reason;
      
      if (moduleId) {
        console.log(`[RSIController] PHRE module suggestion: ${moduleId} (${reason})`);
        // Could display a UI notification here before navigating
      }
    });
    
    // Subscribe to PHRE breath synchronization requests
    const breathSyncSubscription = eventBus.subscribe('phre:breath:synchronize', (event) => {
      if (event.payload?.requestSync) {
        setShowBreathSync(true);
      }
    });
    
    return () => {
      guidanceSubscription();
      phreSubscription();
      breathSyncSubscription();
    };
  }, [eventBus, onNavigate]);
  
  // Track user actions to detect patterns
  useEffect(() => {
    const trackUserActions = () => {
      const now = new Date();
      setLastUserAction(now);
      setUserActionCount(prev => prev + 1);
      
      // Detect patterns based on user behavior
      if (lastUserAction) {
        const timeSinceLastAction = now.getTime() - lastUserAction.getTime();
        
        // Detect scattered focus (many rapid actions)
        if (timeSinceLastAction < 500 && userActionCount > 10) {
          detectEgoPattern('scattered_focus');
          setUserActionCount(0);
        }
        
        // Detect over-analysis (repeated actions in same area)
        if (timeSinceLastAction < 2000 && userActionCount > 15) {
          detectEgoPattern('over_analysis');
          setUserActionCount(0);
        }
      }
    };
    
    // Add event listeners for user actions
    document.addEventListener('click', trackUserActions);
    document.addEventListener('keydown', trackUserActions);
    
    return () => {
      document.removeEventListener('click', trackUserActions);
      document.removeEventListener('keydown', trackUserActions);
    };
  }, [lastUserAction, userActionCount, detectEgoPattern]);
  
  // Reset user action count periodically
  useEffect(() => {
    const resetInterval = setInterval(() => {
      setUserActionCount(0);
    }, 60000); // Reset every minute
    
    return () => clearInterval(resetInterval);
  }, []);
  
  return (
    <>
      {/* Apply chakra theming */}
      <ChakraThemeProvider>
        {/* Guidance suggestions */}
        <GuidanceSuggestion />
        
        {/* RSI Controls */}
        <div className="fixed bottom-6 left-6 z-40 flex flex-col gap-2">
          <button
            onClick={() => setShowNavigationMap(true)}
            className="p-3 bg-slate-900/80 backdrop-blur-sm rounded-full border border-purple-500/20 text-purple-400 hover:text-purple-300 transition-colors"
            title="Temple Navigation"
          >
            <Map className="w-5 h-5" />
          </button>
          
          <button
            onClick={() => setShowBreathSync(true)}
            className="p-3 bg-slate-900/80 backdrop-blur-sm rounded-full border border-purple-500/20 text-purple-400 hover:text-purple-300 transition-colors"
            title="Breath Synchronization"
          >
            <Wind className="w-5 h-5" />
          </button>
          
          <button
            onClick={() => setShowSettings(true)}
            className="p-3 bg-slate-900/80 backdrop-blur-sm rounded-full border border-purple-500/20 text-purple-400 hover:text-purple-300 transition-colors"
            title="Interface Sensitivity Settings"
          >
            <Settings className="w-5 h-5" />
          </button>
        </div>
        
        {/* Current state indicator */}
        {userConsent.sensitivityMode !== 'silent' && (
          <div className="fixed top-6 left-6 z-40">
            <div 
              className="p-2 bg-slate-900/80 backdrop-blur-sm rounded-full border chakra-glow"
              style={{ borderColor: `var(--chakra-primary-color)30` }}
              title={`Dominant Chakra: ${soulState.dominantChakra}`}
            >
              {soulState.dominantChakra === 'root' && <Zap className="w-4 h-4" style={{ color: 'var(--chakra-primary-color)' }} />}
              {soulState.dominantChakra === 'sacral' && <Zap className="w-4 h-4" style={{ color: 'var(--chakra-primary-color)' }} />}
              {soulState.dominantChakra === 'solar' && <Zap className="w-4 h-4" style={{ color: 'var(--chakra-primary-color)' }} />}
              {soulState.dominantChakra === 'heart' && <Zap className="w-4 h-4" style={{ color: 'var(--chakra-primary-color)' }} />}
              {soulState.dominantChakra === 'throat' && <Zap className="w-4 h-4" style={{ color: 'var(--chakra-primary-color)' }} />}
              {soulState.dominantChakra === 'third-eye' && <Eye className="w-4 h-4" style={{ color: 'var(--chakra-primary-color)' }} />}
              {soulState.dominantChakra === 'crown' && <Zap className="w-4 h-4" style={{ color: 'var(--chakra-primary-color)' }} />}
            </div>
          </div>
        )}
        
        {/* Settings Panel */}
        <RSISettingsPanel 
          isOpen={showSettings} 
          onClose={() => setShowSettings(false)} 
        />
        
        {/* Breath Sync Controller */}
        <BreathSyncController 
          isOpen={showBreathSync} 
          onClose={() => setShowBreathSync(false)} 
        />
        
        {/* Navigation Map */}
        <ChakraNavigationMap 
          isOpen={showNavigationMap} 
          onClose={() => setShowNavigationMap(false)}
          onNavigate={onNavigate}
        />
      </ChakraThemeProvider>
    </>
  );
};