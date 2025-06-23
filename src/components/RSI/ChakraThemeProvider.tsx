import React, { useEffect } from 'react';
import { useRSI } from '../../contexts/RSIContext';
import { useChakra } from '../../contexts/ChakraContext';

/**
 * ChakraThemeProvider - Applies chakra-based theming to the application
 * This component injects dynamic CSS variables and styles based on the active chakra
 */
export const ChakraThemeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { soulState, theme, userConsent } = useRSI();
  const { getChakraColor } = useChakra();
  
  useEffect(() => {
    if (!userConsent.allowChakraTheming) return;
    
    // Get the root element to apply CSS variables
    const root = document.documentElement;
    
    // Set CSS variables based on theme
    root.style.setProperty('--chakra-primary-color', theme.primaryColor);
    root.style.setProperty('--chakra-secondary-color', theme.secondaryColor);
    root.style.setProperty('--chakra-accent-color', theme.accentColor);
    root.style.setProperty('--chakra-glow-intensity', `${theme.glowIntensity}%`);
    root.style.setProperty('--chakra-animation-speed', `${theme.animationSpeed}%`);
    root.style.setProperty('--chakra-pulse-frequency', `${theme.pulseFrequency}Hz`);
    
    // Set animation durations based on pulse frequency
    const pulseDuration = 1 / theme.pulseFrequency;
    root.style.setProperty('--chakra-pulse-duration', `${pulseDuration}s`);
    
    // Set breath sync animation if active
    if (soulState.breathSyncActive && soulState.breathRate) {
      const breathDuration = 60 / soulState.breathRate; // seconds per breath
      root.style.setProperty('--breath-duration', `${breathDuration}s`);
      
      // Add breath animation class to body
      document.body.classList.add('breath-sync-active');
    } else {
      document.body.classList.remove('breath-sync-active');
    }
    
    // Inject keyframe animations if they don't exist
    if (!document.getElementById('rsi-animations')) {
      const style = document.createElement('style');
      style.id = 'rsi-animations';
      
      // Define keyframe animations
      style.innerHTML = `
        @keyframes chakraGlow {
          0%, 100% { box-shadow: 0 0 5px var(--chakra-primary-color), 0 0 10px var(--chakra-primary-color)30; }
          50% { box-shadow: 0 0 10px var(--chakra-primary-color), 0 0 20px var(--chakra-primary-color)50; }
        }
        
        @keyframes chakraPulse {
          0%, 100% { transform: scale(1); opacity: 1; }
          50% { transform: scale(1.05); opacity: 0.9; }
        }
        
        @keyframes breathIn {
          0% { transform: scale(1); }
          40% { transform: scale(1.05); }
          100% { transform: scale(1); }
        }
        
        @keyframes breathOut {
          0% { transform: scale(1); }
          40% { transform: scale(0.95); }
          100% { transform: scale(1); }
        }
        
        @keyframes backgroundPulse {
          0%, 100% { background-position: 0% 50%; }
          50% { background-position: 100% 50%; }
        }
        
        @keyframes cardGlow {
          0%, 100% { box-shadow: 0 0 5px var(--chakra-primary-color)30; }
          50% { box-shadow: 0 0 15px var(--chakra-primary-color)50; }
        }
        
        .chakra-glow {
          animation: chakraGlow var(--chakra-pulse-duration) infinite ease-in-out;
        }
        
        .chakra-pulse {
          animation: chakraPulse var(--chakra-pulse-duration) infinite ease-in-out;
        }
        
        .breath-in {
          animation: breathIn var(--breath-duration) infinite ease-in-out;
        }
        
        .breath-out {
          animation: breathOut var(--breath-duration) infinite ease-in-out;
        }
        
        .chakra-bg-pulse {
          background: linear-gradient(270deg, var(--chakra-primary-color)10, var(--chakra-secondary-color)10);
          background-size: 200% 200%;
          animation: backgroundPulse 10s ease infinite;
        }
        
        .chakra-card-glow {
          animation: cardGlow var(--chakra-pulse-duration) infinite ease-in-out;
        }
      `;
      
      document.head.appendChild(style);
    }
    
    // Apply chakra-specific background pattern
    const applyBackgroundPattern = () => {
      const patternClass = `bg-pattern-${theme.backgroundPattern}`;
      
      // Remove any existing pattern classes
      document.body.classList.remove(
        'bg-pattern-flower_of_life',
        'bg-pattern-sri_yantra',
        'bg-pattern-metatrons_cube',
        'bg-pattern-torus'
      );
      
      // Add new pattern class if not 'none'
      if (theme.backgroundPattern !== 'none') {
        document.body.classList.add(patternClass);
      }
    };
    
    applyBackgroundPattern();
    
    // Cleanup function
    return () => {
      // Reset CSS variables
      root.style.removeProperty('--chakra-primary-color');
      root.style.removeProperty('--chakra-secondary-color');
      root.style.removeProperty('--chakra-accent-color');
      root.style.removeProperty('--chakra-glow-intensity');
      root.style.removeProperty('--chakra-animation-speed');
      root.style.removeProperty('--chakra-pulse-frequency');
      root.style.removeProperty('--chakra-pulse-duration');
      root.style.removeProperty('--breath-duration');
      
      // Remove breath sync class
      document.body.classList.remove('breath-sync-active');
      
      // Remove background pattern classes
      document.body.classList.remove(
        'bg-pattern-flower_of_life',
        'bg-pattern-sri_yantra',
        'bg-pattern-metatrons_cube',
        'bg-pattern-torus'
      );
    };
  }, [theme, soulState, userConsent.allowChakraTheming, getChakraColor]);
  
  return <>{children}</>;
};