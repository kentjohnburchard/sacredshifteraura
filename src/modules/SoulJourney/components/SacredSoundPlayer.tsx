import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FrequencySignature } from '../SoulJourneyModule';
import { FrequencyUtils } from '../../../utils/FrequencyUtils';
import { 
  Music, 
  Play, 
  Pause, 
  SkipBack, 
  SkipForward,
  Heart,
  Brain,
  Sparkles,
  Zap,
  Flame,
  Droplet,
  Wind,
  Globe,
  Plus,
  Volume2,
  Volume1,
  VolumeX,
  Star,
  X
} from 'lucide-react';

interface SacredSoundPlayerProps {
  frequencyData: FrequencySignature | null;
  chakraColors: (chakra: string) => string;
}

interface SacredSound {
  id: string;
  name: string;
  frequency: number;
  chakra: string;
  duration: number;
  description: string;
}

export const SacredSoundPlayer: React.FC<SacredSoundPlayerProps> = ({
  frequencyData,
  chakraColors
}) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentSoundIndex, setCurrentSoundIndex] = useState(0);
  const [volume, setVolume] = useState(0.5);
  const [currentTime, setCurrentTime] = useState(0);
  const [isCustomFrequency, setIsCustomFrequency] = useState(false);
  const [customFrequency, setCustomFrequency] = useState(432);
  const [showAddCustom, setShowAddCustom] = useState(false);
  
  const audioContext = useRef<AudioContext | null>(null);
  const oscillator = useRef<OscillatorNode | null>(null);
  const gainNode = useRef<GainNode | null>(null);
  const animationFrame = useRef<number | null>(null);
  const startTime = useRef<number>(0);
  
  // Predefined sacred sounds
  const sacredSounds: SacredSound[] = [
    {
      id: 'solfeggio-ut',
      name: 'Liberation',
      frequency: 396,
      chakra: 'root',
      duration: 180,
      description: 'UT frequency for liberating fear and guilt'
    },
    {
      id: 'solfeggio-re',
      name: 'Transformation',
      frequency: 417,
      chakra: 'sacral',
      duration: 180,
      description: 'RE frequency for undoing situations and facilitating change'
    },
    {
      id: 'solfeggio-mi',
      name: 'Miracles',
      frequency: 528,
      chakra: 'solar',
      duration: 180,
      description: 'MI frequency for transformation and miracles (DNA repair)'
    },
    {
      id: 'solfeggio-fa',
      name: 'Connection',
      frequency: 639,
      chakra: 'heart',
      duration: 180,
      description: 'FA frequency for connecting and relationships'
    },
    {
      id: 'solfeggio-sol',
      name: 'Intuition',
      frequency: 741,
      chakra: 'throat',
      duration: 180,
      description: 'SOL frequency for awakening intuition'
    },
    {
      id: 'solfeggio-la',
      name: 'Cosmic Order',
      frequency: 852,
      chakra: 'third-eye',
      duration: 180,
      description: 'LA frequency for returning to spiritual order'
    },
    {
      id: 'solfeggio-cosmic',
      name: 'Cosmic Connection',
      frequency: 963,
      chakra: 'crown',
      duration: 180,
      description: 'Frequency for cosmic consciousness and universal oneness'
    }
  ];
  
  // Add custom frequency if frequencyData exists
  useEffect(() => {
    if (frequencyData) {
      setCustomFrequency(frequencyData.dominant_frequency);
    }
  }, [frequencyData]);
  
  // Initialize audio context
  useEffect(() => {
    return () => {
      if (oscillator.current) {
        oscillator.current.stop();
        oscillator.current.disconnect();
      }
      if (gainNode.current) {
        gainNode.current.disconnect();
      }
      if (animationFrame.current) {
        cancelAnimationFrame(animationFrame.current);
      }
    };
  }, []);
  
  const getCurrentSound = (): SacredSound => {
    if (isCustomFrequency) {
      return {
        id: 'custom',
        name: 'Soul Frequency',
        frequency: customFrequency,
        chakra: FrequencyUtils.getClosestChakra(customFrequency),
        duration: 180,
        description: 'Your personal soul frequency'
      };
    }
    
    return sacredSounds[currentSoundIndex];
  };
  
  const togglePlay = () => {
    if (isPlaying) {
      stopSound();
    } else {
      playSound();
    }
  };
  
  const playSound = () => {
    if (audioContext.current === null) {
      audioContext.current = new (window.AudioContext || (window as any).webkitAudioContext)();
    }
    
    if (oscillator.current) {
      oscillator.current.stop();
      oscillator.current.disconnect();
    }
    
    if (gainNode.current) {
      gainNode.current.disconnect();
    }
    
    // Create nodes
    oscillator.current = audioContext.current.createOscillator();
    gainNode.current = audioContext.current.createGain();
    
    // Configure oscillator
    oscillator.current.type = 'sine';
    oscillator.current.frequency.value = getCurrentSound().frequency;
    
    // Configure gain (volume)
    gainNode.current.gain.value = volume;
    
    // Connect nodes
    oscillator.current.connect(gainNode.current);
    gainNode.current.connect(audioContext.current.destination);
    
    // Start oscillator
    oscillator.current.start();
    setIsPlaying(true);
    startTime.current = Date.now();
    
    // Start time tracking
    setCurrentTime(0);
    if (animationFrame.current) {
      cancelAnimationFrame(animationFrame.current);
    }
    updateTime();
  };
  
  const stopSound = () => {
    if (oscillator.current) {
      oscillator.current.stop();
      oscillator.current.disconnect();
      oscillator.current = null;
    }
    
    if (animationFrame.current) {
      cancelAnimationFrame(animationFrame.current);
      animationFrame.current = null;
    }
    
    setIsPlaying(false);
  };
  
  const updateTime = () => {
    setCurrentTime(Math.floor((Date.now() - startTime.current) / 1000));
    animationFrame.current = requestAnimationFrame(updateTime);
    
    // Auto-stop after duration
    if (currentTime >= getCurrentSound().duration) {
      stopSound();
      setCurrentTime(0);
    }
  };
  
  const handleVolumeChange = (newVolume: number) => {
    setVolume(newVolume);
    if (gainNode.current) {
      gainNode.current.gain.value = newVolume;
    }
  };
  
  const nextSound = () => {
    if (isPlaying) stopSound();
    setCurrentSoundIndex((currentSoundIndex + 1) % sacredSounds.length);
    setIsCustomFrequency(false);
  };
  
  const prevSound = () => {
    if (isPlaying) stopSound();
    setCurrentSoundIndex((currentSoundIndex - 1 + sacredSounds.length) % sacredSounds.length);
    setIsCustomFrequency(false);
  };
  
  const selectCustomFrequency = () => {
    if (isPlaying) stopSound();
    setIsCustomFrequency(true);
  };
  
  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };
  
  const calculateProgress = () => {
    const current = getCurrentSound();
    return (currentTime / current.duration) * 100;
  };

  const getChakraIcon = (chakra: string) => {
    switch (chakra) {
      case 'root': return <Flame className="w-5 h-5" style={{ color: chakraColors('root') }} />;
      case 'sacral': return <Droplet className="w-5 h-5" style={{ color: chakraColors('sacral') }} />;
      case 'solar': return <Sparkles className="w-5 h-5" style={{ color: chakraColors('solar') }} />;
      case 'heart': return <Heart className="w-5 h-5" style={{ color: chakraColors('heart') }} />;
      case 'throat': return <Zap className="w-5 h-5" style={{ color: chakraColors('throat') }} />;
      case 'third-eye': return <Brain className="w-5 h-5" style={{ color: chakraColors('third-eye') }} />;
      case 'crown': return <Star className="w-5 h-5" style={{ color: chakraColors('crown') }} />;
      default: return <Sparkles className="w-5 h-5" style={{ color: chakraColors('heart') }} />;
    }
  };

  return (
    <div className="space-y-6">
      <div className="bg-slate-900/70 backdrop-blur-sm rounded-xl border border-purple-500/20 overflow-hidden">
        {/* Header with waveform visualization */}
        <div className="relative h-48 bg-gradient-to-b from-purple-900/30 to-slate-900/90 flex items-center justify-center">
          {/* Sacred geometry background */}
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="w-64 h-64 border border-purple-500/20 rounded-full"></div>
            <div className="absolute w-48 h-48 border border-indigo-500/20 rounded-full"></div>
            <div className="absolute w-32 h-32 border border-blue-500/20 rounded-full"></div>
            <div className="absolute w-96 h-96 border border-purple-500/10 rounded-full animate-spin-slow"></div>
          </div>
          
          {/* Sound wave visualization */}
          <div className="absolute inset-x-0 top-0 h-full">
            <svg width="100%" height="100%" preserveAspectRatio="none">
              <motion.path
                d="M0,100 C50,120 100,80 150,100 C200,120 250,80 300,100 C350,120 400,80 450,100 C500,120 550,80 600,100"
                fill="none"
                stroke="#A855F7"
                strokeWidth="2"
                strokeLinecap="round"
                initial={{ pathLength: 0, opacity: 0 }}
                animate={{ 
                  pathLength: isPlaying ? 1 : 0, 
                  opacity: isPlaying ? 0.3 : 0,
                  pathOffset: isPlaying ? 1 : 0
                }}
                transition={{
                  pathLength: { duration: 2, ease: "linear" },
                  opacity: { duration: 0.5 },
                  pathOffset: { 
                    repeat: Infinity,
                    repeatType: "loop",
                    duration: 10,
                    ease: "linear"
                  }
                }}
              />
              <motion.path
                d="M0,100 C30,90 60,110 90,100 C120,90 150,110 180,100 C210,90 240,110 270,100 C300,90 330,110 360,100"
                fill="none"
                stroke="#38BDF8"
                strokeWidth="1.5"
                strokeLinecap="round"
                initial={{ pathLength: 0, opacity: 0 }}
                animate={{ 
                  pathLength: isPlaying ? 1 : 0, 
                  opacity: isPlaying ? 0.5 : 0,
                  pathOffset: isPlaying ? 1 : 0
                }}
                transition={{
                  pathLength: { duration: 1.5, ease: "linear" },
                  opacity: { duration: 0.5 },
                  pathOffset: { 
                    repeat: Infinity,
                    repeatType: "loop",
                    duration: 8,
                    ease: "linear"
                  }
                }}
              />
            </svg>
          </div>
          
          <div className="flex flex-col items-center justify-center z-10">
            <motion.div
              animate={{ scale: isPlaying ? [1, 1.05, 1] : 1 }}
              transition={{ repeat: Infinity, duration: 2 }}
              className="flex flex-col items-center"
            >
              {getChakraIcon(getCurrentSound().chakra)}
              <div className="text-3xl font-bold bg-gradient-to-r from-white via-purple-200 to-blue-200 bg-clip-text text-transparent mt-3">
                {getCurrentSound().frequency}Hz
              </div>
              <div className="text-xl text-purple-300 mt-1">
                {getCurrentSound().name}
              </div>
              <div className="text-xs text-gray-400 mt-2 max-w-md text-center px-4">
                {getCurrentSound().description}
              </div>
            </motion.div>
          </div>
        </div>
        
        {/* Player controls */}
        <div className="p-6 border-t border-purple-500/20 bg-gradient-to-t from-slate-900 to-slate-900/50">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <button 
                onClick={prevSound}
                className="p-2 text-gray-400 hover:text-white transition-colors"
                disabled={isCustomFrequency}
              >
                <SkipBack className="w-5 h-5" />
              </button>
              
              <button
                onClick={togglePlay}
                className={`p-4 rounded-full transition-all ${
                  isPlaying 
                    ? 'bg-purple-600 text-white hover:bg-purple-700' 
                    : 'bg-slate-800 text-gray-200 hover:bg-slate-700'
                }`}
              >
                {isPlaying ? (
                  <Pause className="w-6 h-6" />
                ) : (
                  <Play className="w-6 h-6" />
                )}
              </button>
              
              <button 
                onClick={nextSound}
                className="p-2 text-gray-400 hover:text-white transition-colors"
                disabled={isCustomFrequency}
              >
                <SkipForward className="w-5 h-5" />
              </button>
              
              <div className="text-sm text-gray-400">
                {formatTime(currentTime)} / {formatTime(getCurrentSound().duration)}
              </div>
            </div>
            
            <div className="flex items-center gap-4 w-full md:w-auto">
              <button
                onClick={() => setShowAddCustom(!showAddCustom)}
                className="p-2 text-gray-400 hover:text-white transition-colors"
              >
                <Plus className="w-5 h-5" />
              </button>
              
              {frequencyData && (
                <button
                  onClick={selectCustomFrequency}
                  className={`px-3 py-1 text-sm rounded ${
                    isCustomFrequency 
                      ? 'bg-amber-600/20 text-amber-300 border border-amber-500/30' 
                      : 'bg-slate-800 text-gray-300 border border-gray-700 hover:bg-slate-700'
                  }`}
                >
                  {frequencyData.dominant_frequency}Hz (Your Frequency)
                </button>
              )}
              
              <div className="flex items-center gap-2 w-full md:w-auto">
                <button
                  onClick={() => handleVolumeChange(0)}
                  className="text-gray-400 hover:text-white"
                >
                  <VolumeX className="w-4 h-4" />
                </button>
                
                <input
                  type="range"
                  min="0"
                  max="1"
                  step="0.01"
                  value={volume}
                  onChange={(e) => handleVolumeChange(parseFloat(e.target.value))}
                  className="w-24 md:w-32"
                />
                
                <button
                  onClick={() => handleVolumeChange(1)}
                  className="text-gray-400 hover:text-white"
                >
                  <Volume2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
          
          {/* Progress bar */}
          <div className="mt-4 h-1.5 bg-gray-700 rounded-full overflow-hidden">
            <motion.div
              className="h-full bg-purple-500"
              style={{ width: `${calculateProgress()}%` }}
            ></motion.div>
          </div>
        </div>
      </div>
      
      {/* Sound Library */}
      <div className="bg-slate-900/70 backdrop-blur-sm rounded-xl border border-purple-500/20 p-6">
        <h3 className="text-lg font-bold text-white mb-4">Sacred Frequency Library</h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {sacredSounds.map((sound, index) => (
            <div
              key={sound.id}
              className={`p-3 rounded-lg border flex items-center gap-3 cursor-pointer transition-all ${
                currentSoundIndex === index && !isCustomFrequency
                  ? 'bg-purple-900/20 border-purple-500/30'
                  : 'bg-slate-800/50 border-gray-700 hover:border-purple-500/50'
              }`}
              onClick={() => {
                if (isPlaying) stopSound();
                setCurrentSoundIndex(index);
                setIsCustomFrequency(false);
              }}
            >
              <div className="p-2 rounded-full" style={{ backgroundColor: `${chakraColors(sound.chakra)}20` }}>
                {getChakraIcon(sound.chakra)}
              </div>
              
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between">
                  <h4 className="text-white font-medium truncate">{sound.name}</h4>
                  <div className="text-purple-300 text-sm">{sound.frequency}Hz</div>
                </div>
                <p className="text-gray-400 text-xs truncate">{sound.description}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
      
      {/* Custom Frequency Modal */}
      <AnimatePresence>
        {showAddCustom && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
          >
            <motion.div
              initial={{ scale: 0.9, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.9, y: 20 }}
              className="bg-slate-900 rounded-xl border border-purple-500/20 p-6 max-w-md w-full"
            >
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-xl font-bold text-white">Custom Frequency</h3>
                <button
                  onClick={() => setShowAddCustom(false)}
                  className="p-1 text-gray-400 hover:text-white transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
              
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Frequency (Hz)
                </label>
                <input
                  type="number"
                  value={customFrequency}
                  onChange={(e) => setCustomFrequency(Number(e.target.value))}
                  min="20"
                  max="20000"
                  step="0.1"
                  className="w-full p-3 bg-slate-800 text-white rounded-lg border border-gray-600 focus:border-purple-400 focus:outline-none"
                />
                
                <div className="mt-4 p-3 bg-purple-900/20 rounded-lg">
                  <div className="flex items-center gap-2 mb-1">
                    <Zap className="w-4 h-4 text-purple-400" />
                    <span className="text-white font-medium">Frequency Information</span>
                  </div>
                  <div className="text-sm text-purple-200">
                    Closest chakra: <span className="font-medium capitalize">{FrequencyUtils.getClosestChakra(customFrequency).replace('-', ' ')}</span>
                  </div>
                  <div className="text-sm text-purple-200">
                    {FrequencyUtils.isSacredFrequency(customFrequency, 5) 
                      ? "This is a sacred frequency or harmonic!" 
                      : "This is not a standard sacred frequency."}
                  </div>
                </div>
              </div>
              
              <div className="flex justify-end gap-3">
                <button
                  onClick={() => setShowAddCustom(false)}
                  className="px-4 py-2 bg-slate-800 text-gray-300 rounded-lg border border-gray-600 hover:bg-slate-700 transition-colors"
                >
                  Cancel
                </button>
                
                <motion.button
                  onClick={() => {
                    if (isPlaying) stopSound();
                    setIsCustomFrequency(true);
                    setShowAddCustom(false);
                  }}
                  className="px-5 py-2 bg-gradient-to-r from-purple-600 to-indigo-600 text-white rounded-lg hover:from-purple-700 hover:to-indigo-700 transition-all flex items-center gap-2"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <Music className="w-4 h-4" />
                  Play Frequency
                </motion.button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};