import React from 'react';
import { motion } from 'framer-motion';
import { useRSI } from '../../contexts/RSIContext';

interface ChakraAwareButtonProps {
  children: React.ReactNode;
  onClick?: () => void;
  className?: string;
  variant?: 'primary' | 'secondary' | 'outline';
  disabled?: boolean;
  icon?: React.ReactNode;
  chakraGlow?: boolean;
}

export const ChakraAwareButton: React.FC<ChakraAwareButtonProps> = ({
  children,
  onClick,
  className = '',
  variant = 'primary',
  disabled = false,
  icon,
  chakraGlow = true
}) => {
  const { soulState, userConsent, getAnimationStyle } = useRSI();
  
  // Only apply chakra styling if user has consented
  const applyChakraStyling = userConsent.allowChakraTheming && chakraGlow;
  
  // Get base styles based on variant
  const getBaseStyles = () => {
    switch (variant) {
      case 'primary':
        return applyChakraStyling
          ? 'bg-transparent border text-white hover:bg-opacity-30 chakra-glow'
          : 'bg-purple-600 text-white hover:bg-purple-700';
      case 'secondary':
        return applyChakraStyling
          ? 'bg-transparent border text-white hover:bg-opacity-20 chakra-glow'
          : 'bg-slate-700 text-white hover:bg-slate-600';
      case 'outline':
        return applyChakraStyling
          ? 'bg-transparent border text-white hover:bg-opacity-10 chakra-glow'
          : 'bg-transparent border border-gray-600 text-gray-300 hover:border-gray-500 hover:text-white';
      default:
        return 'bg-purple-600 text-white hover:bg-purple-700';
    }
  };
  
  // Get dynamic styles based on chakra
  const getDynamicStyles = () => {
    if (!applyChakraStyling) return {};
    
    return {
      backgroundColor: `var(--chakra-primary-color)20`,
      borderColor: `var(--chakra-primary-color)50`,
      color: variant === 'outline' ? 'var(--chakra-primary-color)' : 'white',
    };
  };
  
  return (
    <motion.button
      onClick={onClick}
      disabled={disabled}
      className={`px-4 py-2 rounded-lg transition-all flex items-center justify-center gap-2 ${getBaseStyles()} ${className}`}
      style={getDynamicStyles()}
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
      animate={applyChakraStyling ? { 
        boxShadow: [
          `0 0 5px var(--chakra-primary-color)30`,
          `0 0 10px var(--chakra-primary-color)50`,
          `0 0 5px var(--chakra-primary-color)30`
        ]
      } : {}}
      transition={{ 
        duration: 2,
        repeat: Infinity,
        ease: "easeInOut"
      }}
    >
      {icon && <span className="chakra-pulse">{icon}</span>}
      {children}
    </motion.button>
  );
};