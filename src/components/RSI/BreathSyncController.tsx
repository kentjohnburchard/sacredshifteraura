import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useRSI } from '../../contexts/RSIContext';
import { 
  Wind, 
  Pause, 
  Play, 
  Plus, 
  Minus,
  X
} from 'lucide-react';

interface BreathSyncControllerProps {
  isOpen: boolean;
  onClose: () => void;
}

export const BreathSyncController: React.FC<BreathSyncControllerProps> = ({ 
  isOpen, 
  onClose 
}) => {
  const { soulState, startBreathSync, stopBreathSync } = useRSI();
  const [breathRate, setBreathRate] = useState(6); // Default 6 breaths per minute
  const [isActive, setIsActive] = useState(false);
  const [progress, setProgress] = useState(0);
  const [phase, setPhase] = useState<'inhale' | 'hold' | 'exhale' | 'rest'>('inhale');
  
  // Initialize from soulState
  useEffect(() => {
    if (soulState.breathSyncActive && soulState.breathRate) {
      setBreathRate(soulState.breathRate);
      setIsActive(true);
    } else {
      setIsActive(false);
    }
  }, [soulState.breathSyncActive, soulState.breathRate]);
  
  // Handle breath animation
  useEffect(() => {
    if (!isActive) return;
    
    const breathDuration = 60 / breathRate; // seconds per full breath cycle
    const inhaleDuration = breathDuration * 0.4; // 40% of cycle
    const holdDuration = breathDuration * 0.1; // 10% of cycle
    const exhaleDuration = breathDuration * 0.4; // 40% of cycle
    const restDuration = breathDuration * 0.1; // 10% of cycle
    
    let animationFrame: number;
    let lastTimestamp: number;
    let elapsedTime = 0;
    
    const animate = (timestamp: number) => {
      if (!lastTimestamp) {
        lastTimestamp = timestamp;
        animationFrame = requestAnimationFrame(animate);
        return;
      }
      
      const deltaTime = timestamp - lastTimestamp;
      lastTimestamp = timestamp;
      
      elapsedTime += deltaTime / 1000; // Convert to seconds
      
      // Calculate progress through the full breath cycle
      const cycleProgress = (elapsedTime % breathDuration) / breathDuration;
      setProgress(cycleProgress * 100);
      
      // Determine breath phase
      if (cycleProgress < inhaleDuration / breathDuration) {
        setPhase('inhale');
      } else if (cycleProgress < (inhaleDuration + holdDuration) / breathDuration) {
        setPhase('hold');
      } else if (cycleProgress < (inhaleDuration + holdDuration + exhaleDuration) / breathDuration) {
        setPhase('exhale');
      } else {
        setPhase('rest');
      }
      
      animationFrame = requestAnimationFrame(animate);
    };
    
    animationFrame = requestAnimationFrame(animate);
    
    return () => {
      cancelAnimationFrame(animationFrame);
    };
  }, [isActive, breathRate]);
  
  // Start/stop breath sync
  const toggleBreathSync = () => {
    if (isActive) {
      stopBreathSync();
      setIsActive(false);
    } else {
      startBreathSync(breathRate);
      setIsActive(true);
    }
  };
  
  // Adjust breath rate
  const adjustBreathRate = (delta: number) => {
    const newRate = Math.max(4, Math.min(12, breathRate + delta));
    setBreathRate(newRate);
    
    if (isActive) {
      startBreathSync(newRate);
    }
  };
  
  if (!isOpen) return null;
  
  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: 20 }}
        className="fixed bottom-6 left-6 z-50"
      >
        <div className="bg-slate-900/90 backdrop-blur-sm rounded-lg border border-purple-500/20 p-4 shadow-lg">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-medium text-white flex items-center gap-2">
              <Wind className="w-5 h-5 text-purple-400" />
              Breath Synchronization
            </h3>
            
            <button
              onClick={onClose}
              className="p-1 text-gray-400 hover:text-white transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
          
          {/* Breath visualization */}
          <div className="relative h-40 mb-4 flex items-center justify-center">
            <motion.div
              className="w-32 h-32 rounded-full bg-purple-500/10 border border-purple-500/30 flex items-center justify-center"
              animate={{
                scale: phase === 'inhale' ? 1.3 : 
                       phase === 'hold' ? 1.3 : 
                       phase === 'exhale' ? 1 : 1
              }}
              transition={{ duration: 0.5 }}
            >
              <motion.div
                className="w-24 h-24 rounded-full bg-purple-500/20 flex items-center justify-center"
                animate={{
                  scale: phase === 'inhale' ? 1.2 : 
                         phase === 'hold' ? 1.2 : 
                         phase === 'exhale' ? 0.9 : 0.9
                }}
                transition={{ duration: 0.5 }}
              >
                <div className="text-lg font-medium text-white capitalize">
                  {phase}
                </div>
              </motion.div>
            </motion.div>
            
            {/* Progress indicator */}
            <div className="absolute bottom-0 left-0 right-0 h-1 bg-gray-700 rounded-full overflow-hidden">
              <motion.div
                className="h-full bg-purple-500"
                style={{ width: `${progress}%` }}
              />
            </div>
          </div>
          
          {/* Controls */}
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <button
                onClick={() => adjustBreathRate(-1)}
                disabled={breathRate <= 4}
                className="p-2 text-gray-400 hover:text-white disabled:opacity-50 transition-colors"
              >
                <Minus className="w-4 h-4" />
              </button>
              
              <div className="text-white font-medium w-20 text-center">
                {breathRate} BPM
              </div>
              
              <button
                onClick={() => adjustBreathRate(1)}
                disabled={breathRate >= 12}
                className="p-2 text-gray-400 hover:text-white disabled:opacity-50 transition-colors"
              >
                <Plus className="w-4 h-4" />
              </button>
            </div>
            
            <button
              onClick={toggleBreathSync}
              className={`p-3 rounded-full ${
                isActive 
                  ? 'bg-purple-600 text-white' 
                  : 'bg-slate-700 text-gray-300'
              }`}
            >
              {isActive ? <Pause className="w-5 h-5" /> : <Play className="w-5 h-5" />}
            </button>
          </div>
          
          <div className="text-xs text-gray-400 text-center">
            {isActive ? 'Interface is synced with your breath' : 'Start to sync interface with your breath'}
          </div>
        </div>
      </motion.div>
    </AnimatePresence>
  );
};