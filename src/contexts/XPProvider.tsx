import React, { createContext, useContext, useState, ReactNode } from 'react';

interface XPContextType {
  xp: number;
  level: number;
  addXP: (amount: number) => void;
}

const XPContext = createContext<XPContextType | undefined>(undefined);

export const XPProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [xp, setXP] = useState(0);
  const [level, setLevel] = useState(1);

  const addXP = (amount: number) => {
    const newXP = xp + amount;
    setXP(newXP);
    
    // Simple level calculation
    const newLevel = Math.floor(newXP / 100) + 1;
    if (newLevel > level) {
      setLevel(newLevel);
    }
  };

  return (
    <XPContext.Provider value={{ xp, level, addXP }}>
      {children}
    </XPContext.Provider>
  );
};

export const useXP = () => {
  const context = useContext(XPContext);
  if (!context) {
    throw new Error('useXP must be used within XPProvider');
  }
  return context;
};