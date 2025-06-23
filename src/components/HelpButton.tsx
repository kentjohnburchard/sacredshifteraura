import React, { useState } from 'react';
import { Info } from 'lucide-react';
import { InfoPanel, ModuleType } from './InfoPanel';

interface HelpButtonProps {
  moduleType: ModuleType;
}

export const HelpButton: React.FC<HelpButtonProps> = ({ moduleType }) => {
  const [showInfo, setShowInfo] = useState(false);
  
  return (
    <>
      <button
        onClick={() => setShowInfo(true)}
        className="p-2 text-gray-400 hover:text-white hover:bg-slate-800/50 rounded-full transition-colors"
        title="View information about this module"
      >
        <Info className="w-5 h-5" />
      </button>
      
      <InfoPanel 
        moduleType={moduleType}
        isOpen={showInfo}
        onClose={() => setShowInfo(false)}
      />
    </>
  );
};