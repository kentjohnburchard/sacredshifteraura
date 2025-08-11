import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../../../contexts/AuthContext';
import { SupabaseService } from '../../../services/SupabaseService';
import { SoulBlueprint } from '../SoulBlueprintingModule';
import { TaskBlueprintManager } from './TaskBlueprintManager';
import { BlueprintTasksView } from './BlueprintTasksView';
import { HelpButton } from '../../../components/HelpButton';
import { 
  Brain, 
  Heart, 
  Star, 
  RefreshCw, 
  Save, 
  AlertTriangle, 
  Zap, 
  Droplet, 
  Flame, 
  Wind,
  BarChart,
  Sparkles,
  Lightbulb,
  Share,
  Info,
  Clipboard
} from 'lucide-react';

interface SoulBlueprintEditorProps {
  moduleService?: any; // Optional service passed from parent
}

export const SoulBlueprintEditor: React.FC<SoulBlueprintEditorProps> = ({ moduleService }) => {
  const { user } = useAuth();
  const [blueprint, setBlueprint] = useState<Partial<SoulBlueprint> | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [blueprintAnalysis, setBlueprintAnalysis] = useState<Record<string, any> | null>(null);
  const [activeTab, setActiveTab] = useState<'edit' | 'analysis' | 'visualization' | 'tasks'>('edit');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [saveSuccess, setSaveSuccess] = useState(false);

  // Mock service methods if not provided via props
  const service = moduleService || {
    getSoulBlueprint: async (userId: string) => {
      try {
        const supabase = SupabaseService.getInstance().client;
        const { data, error } = await supabase
          .from('sacred_blueprints')
          .select('*')
          .eq('user_id', userId)
          .single();
          
        if (error && error.code !== 'PGRST116') throw error;
        return data || null;
      } catch (err) {
        console.error('Error in getSoulBlueprint:', err);
        return null;
      }
    },
    saveSoulBlueprint: async (bp: any) => {
      try {
        const supabase = SupabaseService.getInstance().client;
        const now = new Date().toISOString();
        const blueprintToSave = {
          ...bp,
          updated_at: now,
          created_at: bp.created_at || now
        };
        
        const { data, error } = await supabase
          .from('sacred_blueprints')
          .upsert(blueprintToSave, { onConflict: 'user_id', returning: 'representation' });
        
        if (error) throw error;
        return data?.[0] || bp;
      } catch (err) {
        console.error('Error in saveSoulBlueprint:', err);
        return bp;
      }
    },
    generateNewBlueprint: async (userId: string) => {
      const newBlueprint = {
        user_id: userId,
        core_frequency: 639,
        elemental_resonance: 'water',
        chakra_signature: [60, 70, 65, 85, 75, 80, 65],
        emotional_profile: 'balanced',
        shadow_frequencies: 'minimal',
        blueprint_text: {
          mission: 'To explore consciousness and expand awareness',
          strengths: ['intuition', 'compassion', 'creativity'],
          challenges: ['focus', 'grounding'],
          evolution_path: 'heart-centered consciousness expansion'
        },
        astrological_synthesis: 'Solar-lunar balance with third eye emphasis'
      };
      
      try {
        const supabase = SupabaseService.getInstance().client;
        const now = new Date().toISOString();
        const blueprintToSave = {
          ...newBlueprint,
          created_at: now,
          updated_at: now
        };
        
        const { data, error } = await supabase
          .from('sacred_blueprints')
          .upsert(blueprintToSave, { onConflict: 'user_id', returning: 'representation' });
        
        if (error) throw error;
        return data?.[0] || newBlueprint;
      } catch (err) {
        console.error('Error in generateNewBlueprint:', err);
        return newBlueprint;
      }
    },
    analyzeBlueprint: (bp: any) => ({
      dominantChakras: ['Heart', 'Third Eye'],
      frequencyHarmony: 95,
      elementalAlignment: bp.elemental_resonance,
      evolution_level: 85,
      consciousness_pattern: 'Heart-Centered Being'
    })
  };

  useEffect(() => {
    if (user?.id) {
      loadBlueprint();
    }
  }, [user?.id]);

  const loadBlueprint = async () => {
    setIsLoading(true);
    setErrorMessage(null);
    
    try {
      const blueprint = await service.getSoulBlueprint(user?.id);
      console.log('Loaded blueprint:', blueprint);
      
      if (blueprint) {
        setBlueprint(blueprint);
        const analysis = await service.analyzeBlueprint(blueprint);
        setBlueprintAnalysis(analysis);
      } else {
        // No blueprint exists yet
        setBlueprint(null);
      }
    } catch (error) {
      console.error('Error loading soul blueprint:', error);
      setErrorMessage('Failed to load your soul blueprint. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const generateBlueprint = async () => {
    setIsGenerating(true);
    setErrorMessage(null);
    
    try {
      console.log('Generating new blueprint for user:', user?.id);
      const newBlueprint = await service.generateNewBlueprint(user?.id);
      console.log('Generated blueprint:', newBlueprint);
      
      setBlueprint(newBlueprint);
      
      const analysis = await service.analyzeBlueprint(newBlueprint);
      setBlueprintAnalysis(analysis);
      
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 3000);
    } catch (error) {
      console.error('Error generating soul blueprint:', error);
      setErrorMessage('Failed to generate your soul blueprint. Please try again.');
    } finally {
      setIsGenerating(false);
    }
  };

  const handleSave = async () => {
    if (!blueprint || !user) return;
    
    setIsSaving(true);
    setErrorMessage(null);
    
    try {
      console.log('Saving blueprint:', blueprint);
      const updated = await service.saveSoulBlueprint({
        ...blueprint,
        user_id: user.id
      });
      
      console.log('Saved blueprint:', updated);
      setBlueprint(updated);
      const analysis = await service.analyzeBlueprint(updated);
      setBlueprintAnalysis(analysis);
      
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 3000);
    } catch (error) {
      console.error('Error saving soul blueprint:', error);
      setErrorMessage('Failed to save your soul blueprint. Please try again.');
    } finally {
      setIsSaving(false);
    }
  };

  const handleChange = (field: string, value: any) => {
    setBlueprint(prev => prev ? ({ ...prev, [field]: value }) : null);
  };

  const handleBlueprintTextChange = (field: string, value: any) => {
    setBlueprint(prev => {
      if (!prev) return null;
      return {
        ...prev,
        blueprint_text: {
          ...prev.blueprint_text,
          [field]: value
        }
      };
    });
  };

  const handleChakraChange = (index: number, value: number) => {
    setBlueprint(prev => {
      if (!prev || !prev.chakra_signature) return prev;
      
      const newSignature = [...prev.chakra_signature];
      newSignature[index] = value;
      
      return {
        ...prev,
        chakra_signature: newSignature
      };
    });
  };

  const renderChakraInputs = () => {
    const chakraNames = ['Root', 'Sacral', 'Solar Plexus', 'Heart', 'Throat', 'Third Eye', 'Crown'];
    const chakraColors = ['#DC2626', '#EA580C', '#FACC15', '#22C55E', '#3B82F6', '#6366F1', '#9333EA'];
    
    if (!blueprint?.chakra_signature) return null;
    
    return (
      <div className="space-y-4">
        {chakraNames.map((name, index) => (
          <div key={index}>
            <div className="flex items-center justify-between mb-1">
              <label className="text-sm font-medium text-gray-300 flex items-center gap-2">
                <div className="w-3 h-3 rounded-full" style={{ backgroundColor: chakraColors[index] }}></div>
                {name} Chakra
              </label>
              <span className="text-sm text-white">{blueprint.chakra_signature[index]}</span>
            </div>
            <input
              type="range"
              min="0"
              max="100"
              value={blueprint.chakra_signature[index]}
              onChange={(e) => handleChakraChange(index, parseInt(e.target.value))}
              className="w-full"
              style={{ 
                accentColor: chakraColors[index],
              }}
            />
          </div>
        ))}
      </div>
    );
  };

  const renderAnalysis = () => {
    if (!blueprintAnalysis) return null;
    
    return (
      <div className="space-y-6">
        <div className="bg-slate-800/50 rounded-lg border border-gray-700 p-4">
          <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-amber-400" />
            Soul Consciousness Pattern
          </h3>
          
          <div className="p-4 bg-purple-900/20 rounded-lg border border-purple-500/30 text-center">
            <div className="text-2xl font-bold text-purple-300 mb-2">
              {blueprintAnalysis.consciousness_pattern || 'Balanced Explorer'}
            </div>
            <p className="text-gray-300">
              Your consciousness signature reveals a predominant pattern aligned with 
              higher awareness and spiritual insight.
            </p>
          </div>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="bg-slate-800/50 rounded-lg border border-gray-700 p-4">
            <h3 className="font-semibold text-white mb-3 flex items-center gap-2">
              <Zap className="w-4 h-4 text-yellow-400" />
              Dominant Chakras
            </h3>
            
            <div className="flex flex-wrap gap-2 mb-4">
              {blueprintAnalysis.dominantChakras?.map((chakra: string, i: number) => (
                <div key={i} className="px-3 py-1 bg-purple-500/20 text-purple-300 rounded-lg text-sm">
                  {chakra}
                </div>
              ))}
            </div>
            
            <div className="text-sm text-gray-400">
              These energy centers show heightened activity and influence in your consciousness.
            </div>
          </div>
          
          <div className="bg-slate-800/50 rounded-lg border border-gray-700 p-4">
            <h3 className="font-semibold text-white mb-3 flex items-center gap-2">
              <BarChart className="w-4 h-4 text-green-400" />
              Evolution Level
            </h3>
            
            <div className="w-full bg-gray-700 rounded-full h-4 mb-3">
              <div
                className="bg-gradient-to-r from-purple-500 to-indigo-500 h-4 rounded-full"
                style={{ width: `${blueprintAnalysis.evolution_level || 50}%` }}
              ></div>
            </div>
            
            <div className="flex items-center justify-between text-sm">
              <span className="text-gray-400">Evolution Score:</span>
              <span className="text-white font-medium">{blueprintAnalysis.evolution_level || 50}/100</span>
            </div>
          </div>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-slate-800/50 rounded-lg border border-gray-700 p-4">
            <h3 className="font-semibold text-white mb-2 flex items-center gap-2">
              <Lightbulb className="w-4 h-4 text-amber-400" />
              Frequency Harmony
            </h3>
            
            <div className="text-2xl font-bold text-white">
              {blueprintAnalysis.frequencyHarmony || 95}%
            </div>
            
            <div className="text-sm text-gray-400">
              Alignment with sacred frequencies
            </div>
          </div>
          
          <div className="bg-slate-800/50 rounded-lg border border-gray-700 p-4">
            <h3 className="font-semibold text-white mb-2 flex items-center gap-2">
              {blueprint?.elemental_resonance === 'water' && <Droplet className="w-4 h-4 text-blue-400" />}
              {blueprint?.elemental_resonance === 'fire' && <Flame className="w-4 h-4 text-orange-400" />}
              {blueprint?.elemental_resonance === 'earth' && <Zap className="w-4 h-4 text-green-400" />}
              {blueprint?.elemental_resonance === 'air' && <Wind className="w-4 h-4 text-cyan-400" />}
              Elemental Resonance
            </h3>
            
            <div className="text-2xl font-bold text-white capitalize">
              {blueprint?.elemental_resonance || 'Water'}
            </div>
            
            <div className="text-sm text-gray-400">
              Your primary elemental affinity
            </div>
          </div>
          
          <div className="bg-slate-800/50 rounded-lg border border-gray-700 p-4">
            <h3 className="font-semibold text-white mb-2 flex items-center gap-2">
              <Star className="w-4 h-4 text-purple-400" />
              Astrological Synthesis
            </h3>
            
            <div className="text-base font-medium text-white">
              {blueprint?.astrological_synthesis || 'Solar-Lunar Balance'}
            </div>
            
            <div className="text-sm text-gray-400">
              Cosmic influences on your soul
            </div>
          </div>
        </div>
      </div>
    );
  };

  const renderBlueprintVisualization = () => {
    if (!blueprint || !blueprintAnalysis) return null;
    
    // Calculate visualization parameters based on blueprint data
    const chakraData = blueprint.chakra_signature || [50, 50, 50, 50, 50, 50, 50];
    const chakraColors = ['#DC2626', '#EA580C', '#FACC15', '#22C55E', '#3B82F6', '#6366F1', '#9333EA'];
    const rotationAngle = (blueprint.core_frequency || 639) % 360;
    const evolutionLevel = blueprintAnalysis.evolution_level || 50;
    
    return (
      <div className="flex flex-col items-center justify-center py-8">
        <div className="relative w-80 h-80">
          {/* Rotating outer ring */}
          <motion.div
            className="absolute inset-0 border-4 border-purple-500/30 rounded-full"
            animate={{ rotate: 360 }}
            transition={{ duration: 60, repeat: Infinity, ease: "linear" }}
          ></motion.div>
          
          {/* Core frequency ring */}
          <motion.div
            className="absolute inset-4 border-2 border-blue-500/30 rounded-full"
            animate={{ rotate: -360, scale: [1, 1.05, 1] }}
            transition={{ 
              rotate: { duration: 40, repeat: Infinity, ease: "linear" },
              scale: { duration: 3, repeat: Infinity, ease: "easeInOut" }
            }}
          ></motion.div>
          
          {/* Element symbol */}
          <div className="absolute inset-0 flex items-center justify-center">
            {blueprint.elemental_resonance === 'water' && <Droplet className="w-12 h-12 text-blue-400" />}
            {blueprint.elemental_resonance === 'fire' && <Flame className="w-12 h-12 text-orange-400" />}
            {blueprint.elemental_resonance === 'earth' && <Zap className="w-12 h-12 text-green-400" />}
            {blueprint.elemental_resonance === 'air' && <Wind className="w-12 h-12 text-cyan-400" />}
          </div>
          
          {/* Chakra nodes */}
          {chakraData.map((value, index) => {
            const angle = (index / 7) * 2 * Math.PI;
            const radius = 100 + (value / 2);
            const x = radius * Math.cos(angle);
            const y = radius * Math.sin(angle);
            
            return (
              <motion.div
                key={index}
                className="absolute w-4 h-4 rounded-full"
                style={{
                  backgroundColor: chakraColors[index],
                  left: `calc(50% + ${x}px)`,
                  top: `calc(50% + ${y}px)`,
                  transform: 'translate(-50%, -50%)',
                  boxShadow: `0 0 10px ${chakraColors[index]}`
                }}
                animate={{
                  scale: [1, 1.2, 1],
                  opacity: [0.7, 1, 0.7]
                }}
                transition={{
                  duration: 2 + index,
                  repeat: Infinity,
                  repeatType: 'reverse'
                }}
              ></motion.div>
            );
          })}
          
          {/* Connecting lines */}
          <svg className="absolute inset-0 w-full h-full" style={{ transform: `rotate(${rotationAngle}deg)` }}>
            {chakraData.map((_, i) => {
              const nextIndex = (i + 1) % chakraData.length;
              const angle1 = (i / 7) * 2 * Math.PI;
              const angle2 = (nextIndex / 7) * 2 * Math.PI;
              const radius1 = 100 + (chakraData[i] / 2);
              const radius2 = 100 + (chakraData[nextIndex] / 2);
              const x1 = 160 + radius1 * Math.cos(angle1);
              const y1 = 160 + radius1 * Math.sin(angle1);
              const x2 = 160 + radius2 * Math.cos(angle2);
              const y2 = 160 + radius2 * Math.sin(angle2);
              
              return (
                <line
                  key={i}
                  x1={x1}
                  y1={y1}
                  x2={x2}
                  y2={y2}
                  stroke={`rgba(${(i * 40) % 255}, ${(i * 70) % 255}, ${(i * 120) % 255}, 0.3)`}
                  strokeWidth="1"
                />
              );
            })}
          </svg>
          
          {/* Evolution level indicator */}
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="w-16 h-16 rounded-full bg-purple-900/30 flex items-center justify-center">
              <div className="text-lg font-bold text-white">
                {evolutionLevel}
              </div>
            </div>
          </div>
        </div>
        
        <div className="mt-8 text-center">
          <h3 className="text-xl font-bold text-white mb-2">
            {blueprintAnalysis.consciousness_pattern || 'Balanced Explorer'}
          </h3>
          <p className="text-gray-300 max-w-lg">
            This visualization represents your unique soul blueprint, showing the relationship between your 
            chakra energies, elemental resonance, and consciousness pattern. The rotation 
            and movement reflect your core frequency of {blueprint.core_frequency || 639}Hz.
          </p>
        </div>
        
        <div className="mt-6 flex gap-4">
          <button 
            onClick={() => alert('Sharing functionality coming soon!')}
            className="px-4 py-2 bg-purple-600/20 text-purple-300 rounded border border-purple-500/30 hover:bg-purple-600/30 transition-colors flex items-center gap-2"
          >
            <Share className="w-4 h-4" />
            Share Visualization
          </button>
          
          <button 
            onClick={() => alert('Interpretation service will be available in the next update!')}
            className="px-4 py-2 bg-blue-600/20 text-blue-300 rounded border border-blue-500/30 hover:bg-blue-600/30 transition-colors flex items-center gap-2"
          >
            <Info className="w-4 h-4" />
            Interpret Blueprint
          </button>
        </div>
      </div>
    );
  };

  if (isLoading) {
    return (
      <div className="bg-slate-900/50 rounded-xl border border-purple-500/20 p-8 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-purple-400/30 border-t-purple-400 rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-purple-300">Loading your soul blueprint...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-slate-900/50 rounded-xl border border-purple-500/20 p-6">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-indigo-600 rounded-xl flex items-center justify-center">
              <Brain className="w-6 h-6 text-white" />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-white">Soul Blueprint</h2>
              <p className="text-purple-300">Your divine essence encoded in frequencies and patterns</p>
            </div>
          </div>
          
          <HelpButton moduleType="soul-blueprint" />
        </div>
        
        <div className="flex border-b border-gray-700 mb-4">
          <button
            onClick={() => setActiveTab('edit')}
            className={`px-4 py-2 font-medium ${
              activeTab === 'edit'
                ? 'text-purple-400 border-b-2 border-purple-400'
                : 'text-gray-400 hover:text-white'
            }`}
          >
            Edit Blueprint
          </button>
          <button
            onClick={() => setActiveTab('analysis')}
            className={`px-4 py-2 font-medium ${
              activeTab === 'analysis'
                ? 'text-purple-400 border-b-2 border-purple-400'
                : 'text-gray-400 hover:text-white'
            }`}
          >
            Analysis
          </button>
          <button
            onClick={() => setActiveTab('visualization')}
            className={`px-4 py-2 font-medium ${
              activeTab === 'visualization'
                ? 'text-purple-400 border-b-2 border-purple-400'
                : 'text-gray-400 hover:text-white'
            }`}
          >
            Sacred Visualization
          </button>
          <button
            onClick={() => setActiveTab('tasks')}
            className={`px-4 py-2 font-medium ${
              activeTab === 'tasks'
                ? 'text-purple-400 border-b-2 border-purple-400'
                : 'text-gray-400 hover:text-white'
            }`}
          >
            <div className="flex items-center gap-1">
              <Clipboard className="w-4 h-4" />
              Tasks
            </div>
          </button>
        </div>

        {/* Error message */}
        <AnimatePresence>
          {errorMessage && (
            <motion.div
              className="bg-red-900/20 text-red-300 px-4 py-3 rounded-lg flex items-start gap-3 mb-4"
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
            >
              <AlertTriangle className="w-5 h-5 text-red-400 flex-shrink-0 mt-0.5" />
              <div>{errorMessage}</div>
            </motion.div>
          )}
          
          {saveSuccess && (
            <motion.div
              className="bg-green-900/20 text-green-300 px-4 py-3 rounded-lg flex items-start gap-3 mb-4"
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
            >
              <Zap className="w-5 h-5 text-green-400 flex-shrink-0 mt-0.5" />
              <div>Your soul blueprint has been successfully saved.</div>
            </motion.div>
          )}
        </AnimatePresence>
        
        {/* Actions */}
        <div className="flex flex-wrap gap-2">
          {!blueprint && (
            <button
              onClick={generateBlueprint}
              disabled={isGenerating}
              className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors flex items-center gap-2 disabled:opacity-50"
            >
              {isGenerating ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  Generating...
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4" />
                  Generate Soul Blueprint
                </>
              )}
            </button>
          )}
          
          {blueprint && activeTab === 'edit' && (
            <>
              <button
                onClick={handleSave}
                disabled={isSaving}
                className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors flex items-center gap-2 disabled:opacity-50"
              >
                {isSaving ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    Saving...
                  </>
                ) : (
                  <>
                    <Save className="w-4 h-4" />
                    Save Blueprint
                  </>
                )}
              </button>
              
              <button
                onClick={generateBlueprint}
                disabled={isGenerating}
                className="px-4 py-2 bg-slate-800 text-gray-300 rounded-lg border border-gray-700 hover:bg-slate-700 transition-colors flex items-center gap-2 disabled:opacity-50"
              >
                {isGenerating ? (
                  <>
                    <div className="w-4 h-4 border-2 border-gray-300 border-t-transparent rounded-full animate-spin"></div>
                    Regenerating...
                  </>
                ) : (
                  <>
                    <RefreshCw className="w-4 h-4" />
                    Regenerate
                  </>
                )}
              </button>
            </>
          )}
          
          {blueprint && activeTab !== 'edit' && (
            <button
              onClick={() => setActiveTab('edit')}
              className="px-4 py-2 bg-slate-800 text-gray-300 rounded-lg border border-gray-700 hover:bg-slate-700 transition-colors flex items-center gap-2"
            >
              <Zap className="w-4 h-4" />
              Edit Blueprint
            </button>
          )}
        </div>
      </div>

      {/* Content Area */}
      {blueprint && (
        <div className="bg-slate-900/50 rounded-xl border border-purple-500/20 p-6">
          <AnimatePresence mode="wait">
            {activeTab === 'edit' && (
              <motion.div
                key="edit"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.3 }}
                className="space-y-6"
              >
                {/* Main Blueprint Fields */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Core Frequency */}
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2 flex items-center gap-2">
                      <Zap className="w-4 h-4 text-purple-400" />
                      Core Frequency (Hz)
                    </label>
                    <input
                      type="number"
                      value={blueprint.core_frequency || 639}
                      onChange={(e) => handleChange('core_frequency', parseFloat(e.target.value))}
                      min="0"
                      step="0.1"
                      className="w-full p-3 bg-slate-800 text-white rounded-lg border border-gray-600 focus:border-purple-400 focus:outline-none"
                    />
                    <p className="mt-2 text-xs text-gray-400">
                      Core resonant frequency of your soul's expression (432-963 Hz range for sacred frequencies)
                    </p>
                  </div>

                  {/* Elemental Resonance */}
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2 flex items-center gap-2">
                      <Droplet className="w-4 h-4 text-blue-400" />
                      Elemental Resonance
                    </label>
                    <select
                      value={blueprint.elemental_resonance || 'water'}
                      onChange={(e) => handleChange('elemental_resonance', e.target.value)}
                      className="w-full p-3 bg-slate-800 text-white rounded-lg border border-gray-600 focus:border-purple-400 focus:outline-none"
                    >
                      <option value="water">Water - Flowing & Intuitive</option>
                      <option value="fire">Fire - Passionate & Transformative</option>
                      <option value="earth">Earth - Grounded & Stable</option>
                      <option value="air">Air - Intellectual & Communicative</option>
                    </select>
                    <p className="mt-2 text-xs text-gray-400">
                      The primordial element that your soul most strongly resonates with
                    </p>
                  </div>
                </div>

                {/* Chakra Signature */}
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-4 flex items-center gap-2">
                    <Zap className="w-4 h-4 text-rainbow-chakra" />
                    Chakra Signature
                  </label>
                  {renderChakraInputs()}
                  <p className="mt-2 text-xs text-gray-400">
                    The energy distribution across your seven primary chakras (0-100 scale)
                  </p>
                </div>

                {/* Emotional Profile */}
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2 flex items-center gap-2">
                    <Heart className="w-4 h-4 text-pink-400" />
                    Emotional Profile
                  </label>
                  <select
                    value={blueprint.emotional_profile || 'balanced'}
                    onChange={(e) => handleChange('emotional_profile', e.target.value)}
                    className="w-full p-3 bg-slate-800 text-white rounded-lg border border-gray-600 focus:border-purple-400 focus:outline-none"
                  >
                    <option value="balanced">Balanced - Harmonious Emotional State</option>
                    <option value="evolving">Evolving - Growing Through Emotional Transformation</option>
                    <option value="healing">Healing - Recovering Emotional Equilibrium</option>
                    <option value="expanded">Expanded - Transcendent Emotional Awareness</option>
                    <option value="intensified">Intensified - Deep Emotional Processing</option>
                  </select>
                </div>

                {/* Shadow Frequencies */}
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2 flex items-center gap-2">
                    <AlertTriangle className="w-4 h-4 text-yellow-400" />
                    Shadow Frequencies
                  </label>
                  <select
                    value={blueprint.shadow_frequencies || 'minimal'}
                    onChange={(e) => handleChange('shadow_frequencies', e.target.value)}
                    className="w-full p-3 bg-slate-800 text-white rounded-lg border border-gray-600 focus:border-purple-400 focus:outline-none"
                  >
                    <option value="minimal">Minimal - Few shadow aspects present</option>
                    <option value="moderate">Moderate - Some shadow work in progress</option>
                    <option value="significant">Significant - Active shadow integration</option>
                    <option value="transforming">Transforming - Shadow being transmuted</option>
                    <option value="integrated">Integrated - Shadow work largely complete</option>
                  </select>
                  <p className="mt-2 text-xs text-gray-400">
                    The presence and state of shadow aspects in your soul blueprint
                  </p>
                </div>

                {/* Blueprint Text */}
                <div>
                  <h3 className="text-lg font-medium text-white mb-4 flex items-center gap-2">
                    <Star className="w-5 h-5 text-amber-400" />
                    Soul Mission & Purpose
                  </h3>
                  
                  <div className="space-y-4">
                    {/* Mission */}
                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-2">
                        Soul Mission
                      </label>
                      <textarea
                        value={blueprint.blueprint_text?.mission || ''}
                        onChange={(e) => handleBlueprintTextChange('mission', e.target.value)}
                        className="w-full p-3 bg-slate-800 text-white rounded-lg border border-gray-600 focus:border-purple-400 focus:outline-none h-24"
                        placeholder="Describe your soul's mission in this lifetime..."
                      />
                    </div>
                    
                    {/* Strengths */}
                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-2">
                        Soul Strengths
                      </label>
                      <input
                        type="text"
                        value={(blueprint.blueprint_text?.strengths || []).join(', ')}
                        onChange={(e) => handleBlueprintTextChange('strengths', e.target.value.split(', '))}
                        className="w-full p-3 bg-slate-800 text-white rounded-lg border border-gray-600 focus:border-purple-400 focus:outline-none"
                        placeholder="e.g., intuition, compassion, creativity (comma-separated)"
                      />
                    </div>
                    
                    {/* Challenges */}
                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-2">
                        Soul Challenges
                      </label>
                      <input
                        type="text"
                        value={(blueprint.blueprint_text?.challenges || []).join(', ')}
                        onChange={(e) => handleBlueprintTextChange('challenges', e.target.value.split(', '))}
                        className="w-full p-3 bg-slate-800 text-white rounded-lg border border-gray-600 focus:border-purple-400 focus:outline-none"
                        placeholder="e.g., focus, grounding (comma-separated)"
                      />
                    </div>
                    
                    {/* Evolution Path */}
                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-2">
                        Evolution Path
                      </label>
                      <input
                        type="text"
                        value={blueprint.blueprint_text?.evolution_path || ''}
                        onChange={(e) => handleBlueprintTextChange('evolution_path', e.target.value)}
                        className="w-full p-3 bg-slate-800 text-white rounded-lg border border-gray-600 focus:border-purple-400 focus:outline-none"
                        placeholder="Your soul's growth and evolution direction..."
                      />
                    </div>
                  </div>
                </div>

                {/* Astrological Synthesis */}
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2 flex items-center gap-2">
                    <Star className="w-4 h-4 text-amber-400" />
                    Astrological Synthesis
                  </label>
                  <textarea
                    value={blueprint.astrological_synthesis || ''}
                    onChange={(e) => handleChange('astrological_synthesis', e.target.value)}
                    className="w-full p-3 bg-slate-800 text-white rounded-lg border border-gray-600 focus:border-purple-400 focus:outline-none h-24"
                    placeholder="Describe how astrological influences affect your soul blueprint..."
                  />
                  <p className="mt-2 text-xs text-gray-400">
                    The cosmic influences and planetary energies that shape your soul's expression
                  </p>
                </div>
              </motion.div>
            )}

            {activeTab === 'analysis' && (
              <motion.div
                key="analysis"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.3 }}
              >
                {renderAnalysis()}
              </motion.div>
            )}

            {activeTab === 'visualization' && (
              <motion.div
                key="visualization"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.3 }}
              >
                {renderBlueprintVisualization()}
              </motion.div>
            )}

            {activeTab === 'tasks' && (
              <motion.div
                key="tasks"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.3 }}
              >
                {blueprint && <BlueprintTasksView blueprint={blueprint as SoulBlueprint} />}
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      )}

      {/* No Blueprint State */}
      {!blueprint && !isLoading && (
        <div className="bg-slate-900/50 rounded-xl border border-purple-500/20 p-8 text-center">
          <Brain className="w-16 h-16 mx-auto mb-6 text-purple-400 opacity-50" />
          <h3 className="text-xl font-bold text-white mb-3">Your Soul Blueprint Awaits</h3>
          <p className="text-gray-300 mb-6 max-w-md mx-auto">
            You haven't created your soul blueprint yet. Generate your blueprint to discover your
            soul's unique frequency pattern, chakra signature, and evolutionary path.
          </p>
          <button
            onClick={generateBlueprint}
            disabled={isGenerating}
            className="px-6 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors flex items-center gap-2 mx-auto disabled:opacity-50"
          >
            {isGenerating ? (
              <>
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                Generating Soul Blueprint...
              </>
            ) : (
              <>
                <Sparkles className="w-5 h-5" />
                Generate Soul Blueprint
              </>
            )}
          </button>
        </div>
      )}
    </div>
  );
};