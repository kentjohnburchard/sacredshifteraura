import React, { createContext, useContext, useState, ReactNode } from 'react';

type ChakraType = 'root' | 'sacral' | 'solar' | 'heart' | 'throat' | 'third-eye' | 'crown';

interface ChakraContextType {
  activeChakra: ChakraType;
  setActiveChakra: (chakra: ChakraType) => void;
  frequency: number;
  getChakraColor: (chakra: ChakraType) => string;
}

const ChakraContext = createContext<ChakraContextType | undefined>(undefined);

const chakraColors: Record<ChakraType, string> = {
  root: '#DC2626',
  sacral: '#EA580C', 
  solar: '#FACC15',
  heart: '#22C55E',
  throat: '#3B82F6',
  'third-eye': '#6366F1',
  crown: '#9333EA'
};

const chakraFrequencies: Record<ChakraType, number> = {
  root: 194,
  sacral: 210,
  solar: 126,
  heart: 341,
  throat: 384,
  'third-eye': 426,
  crown: 963
};

export const ChakraProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [activeChakra, setActiveChakra] = useState<ChakraType>('heart');

  const getChakraColor = (chakra: ChakraType) => chakraColors[chakra];
  const frequency = chakraFrequencies[activeChakra];

  return (
    <ChakraContext.Provider value={{ 
      activeChakra, 
      setActiveChakra, 
      frequency,
      getChakraColor 
    }}>
      {children}
    </ChakraContext.Provider>
  );
};

export const useChakra = () => {
  const context = useContext(ChakraContext);
  if (!context) {
    throw new Error('useChakra must be used within ChakraProvider');
  }
  return context;
};