import React from 'react';
import { motion } from 'framer-motion';
import { useRSI } from '../../contexts/RSIContext';

interface ChakraAwareCardProps {
  children: React.ReactNode;
  className?: string;
  onClick?: () => void;
  chakraGlow?: boolean;
  pulseOnHover?: boolean;
}

export const ChakraAwareCard: React.FC<ChakraAwareCardProps> = ({
  children,
  className = '',
  onClick,
  chakraGlow = true,
  pulseOnHover = true
}) => {
  const { userConsent, getAnimationStyle } = useRSI();
  
  // Only apply chakra styling if user has consented
  const applyChakraStyling = userConsent.allowChakraTheming && chakraGlow;
  
  // Get dynamic styles based on chakra
  const getDynamicStyles = () => {
    if (!applyChakraStyling) return {};
    
    return {
      borderColor: `var(--chakra-primary-color)30`,
      boxShadow: `0 0 10px var(--chakra-primary-color)10`
    };
  };
  
  return (
    <motion.div
      className={`bg-slate-900/50 backdrop-blur-sm rounded-xl border border-purple-500/20 overflow-hidden ${className} ${applyChakraStyling ? 'chakra-card-glow' : ''}`}
      style={getDynamicStyles()}
      onClick={onClick}
      whileHover={pulseOnHover ? { scale: 1.02 } : {}}
      transition={{ duration: 0.3 }}
    >
      {children}
    </motion.div>
  );
};