import React, { useState } from 'react';
import { Book } from 'lucide-react';
import { SystemPrinciplesExplainer } from './SystemPrinciplesExplainer';

export const PrinciplesButton: React.FC = () => {
  const [showPrinciples, setShowPrinciples] = useState(false);
  
  return (
    <>
      <button
        onClick={() => setShowPrinciples(true)}
        className="flex items-center gap-2 px-3 py-2 bg-purple-900/30 rounded-lg text-sm"
        title="Learn about the metaphysical principles"
      >
        <Book className="w-4 h-4 text-purple-400" />
        <span className="text-purple-300">System Principles</span>
      </button>
      
      <SystemPrinciplesExplainer 
        isOpen={showPrinciples}
        onClose={() => setShowPrinciples(false)}
      />
    </>
  );
};