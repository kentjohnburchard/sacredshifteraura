import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../../../contexts/AuthContext';
import { SoulBlueprint } from '../SoulBlueprintingModule'; // Assuming this defines the full SoulBlueprint type
import { TaskBlueprintManager } from './TaskBlueprintManager'; // Unchanged, assumed external component
import { BlueprintTasksView } from './BlueprintTasksView'; // Unchanged, assumed external component
import { HelpButton } from '../../../components/HelpButton'; // Unchanged, assumed external component
import { SupabaseService } from '../../../services/SupabaseService'; // Import SupabaseService
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

// --- Type Definitions ---

// Define the shape of the analysis data
interface BlueprintAnalysis {
  dominantChakras: string[];
  frequencyHarmony: number;
  elementalAlignment: 'water' | 'fire' | 'earth' | 'air'; // More specific type
  evolution_level: number;
  consciousness_pattern: string;
}

// Define the interface for the service methods
interface SoulBlueprintService {
  getSoulBlueprint: (userId: string) => Promise<SoulBlueprint | null>;
  saveSoulBlueprint: (bp: Partial<SoulBlueprint>) => Promise<SoulBlueprint>;
  generateNewBlueprint: (userId: string) => Promise<SoulBlueprint>;
  analyzeBlueprint: (bp: Partial<SoulBlueprint>) => BlueprintAnalysis;
}

interface SoulBlueprintEditorProps {
  moduleService?: SoulBlueprintService; // Now uses the specific service interface
}

export const SoulBlueprintEditor: React.FC<SoulBlueprintEditorProps> = ({ moduleService }) => {
  const { user, loading: authLoading } = useAuth(); // Destructure authLoading as well

  const [blueprint, setBlueprint] = useState<SoulBlueprint | null>(null); // State now holds full SoulBlueprint or null
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [blueprintAnalysis, setBlueprintAnalysis] = useState<BlueprintAnalysis | null>(null); // Using specific interface
  const [activeTab, setActiveTab] = useState<'edit' | 'analysis' | 'visualization' | 'tasks'>('edit');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [saveSuccess, setSaveSuccess] = useState(false);

  // Use SupabaseService directly for blueprint operations
  const supabase = SupabaseService.getInstance().client;

  // Mock service methods if not provided via props
  // This 'service' now explicitly implements SoulBlueprintService
  const internalService: SoulBlueprintService = {
    getSoulBlueprint: async (userId: string) => {
      try {
        const { data, error } = await supabase
          .from('sacred_blueprints')
          .select('*')
          .eq('user_id', userId)
          .single();

        // PGRST116 means "No rows found" - not an error, just no blueprint yet
        if (error && error.code !== 'PGRST116') throw error;
        // Cast to SoulBlueprint, assuming the data matches the interface
        return (data as SoulBlueprint) || null;
      } catch (err) {
        console.error('Error in getSoulBlueprint:', err);
        setErrorMessage('Failed to fetch blueprint data.'); // More specific error feedback
        return null;
      }
    },
    saveSoulBlueprint: async (bp: Partial<SoulBlueprint>) => {
      try {
        const now = new Date().toISOString();
        const blueprintToSave = {
          ...bp,
          user_id: user?.id, // Ensure user_id is always present for upsert
          updated_at: now,
          created_at: bp.created_at || now
        };

        const { data, error } = await supabase
          .from('sacred_blueprints')
          .upsert(blueprintToSave, { onConflict: 'user_id', returning: 'representation' });

        if (error) throw error;
        // Supabase upsert returns an array. Assuming we only upsert one.
        if (data && data.length > 0) {
          return data[0] as SoulBlueprint;
        }
        // Fallback to the input blueprint if no data is returned, though data[0] is expected
        console.warn('Save operation returned no data, using input blueprint as fallback.');
        return blueprintToSave as SoulBlueprint; // Cast for type safety
      } catch (err) {
        console.error('Error in saveSoulBlueprint:', err);
        setErrorMessage('Failed to save blueprint data.');
        throw err; // Re-throw to be caught by the calling function
      }
    },
    generateNewBlueprint: async (userId: string) => {
      const now = new Date().toISOString();
      const newBlueprint: SoulBlueprint = { // Ensure this strictly matches the SoulBlueprint interface
        id: `gen-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`, // Generate a mock ID
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
        astrological_synthesis: 'Solar-lunar balance with third eye emphasis',
        created_at: now,
        updated_at: now
      };

      try {
        // Use upsert to either create or update based on user_id conflict
        const { data, error } = await supabase
          .from('sacred_blueprints')
          .upsert(newBlueprint, { onConflict: 'user_id', returning: 'representation' });

        if (error) throw error;
        if (data && data.length > 0) {
          return data[0] as SoulBlueprint;
        }
        console.warn('Generate operation returned no data, using generated blueprint as fallback.');
        return newBlueprint;
      } catch (err) {
        console.error('Error in generateNewBlueprint:', err);
        setErrorMessage('Failed to generate blueprint data.');
        throw err; // Re-throw to be caught by the calling function
      }
    },
    analyzeBlueprint: (bp: Partial<SoulBlueprint>): BlueprintAnalysis => {
      // Basic analysis based on blueprint properties
      const dominantChakras = (bp.chakra_signature || []).map((value, index) => {
        const chakraNames = ['Root', 'Sacral', 'Solar Plexus', 'Heart', 'Throat', 'Third Eye', 'Crown'];
        return value > 70 ? chakraNames[index] : null;
      }).filter(Boolean) as string[]; // Filter out nulls and cast to string[]

      return {
        dominantChakras: dominantChakras.length > 0 ? dominantChakras : ['Balanced'],
        frequencyHarmony: bp.core_frequency ? Math.min(100, Math.max(0, bp.core_frequency / 9.63)) : 50, // Example calculation
        elementalAlignment: bp.elemental_resonance || 'water',
        evolution_level: (bp.chakra_signature?.reduce((sum, val) => sum + val, 0) || 0) / 7 || 50, // Average chakra strength
        consciousness_pattern: bp.emotional_profile === 'expanded' ? 'Transcendent Being' : 'Heart-Centered Being'
      };
    }
  };

  // Determine which service to use (props.moduleService or internalService)
  const effectiveService = moduleService || internalService;

  useEffect(() => {
    // Only load blueprint if authentication is not loading and user is available
    if (!authLoading && user?.id) {
      loadBlueprint();
    } else if (!authLoading && !user?.id) {
      // If auth is done and no user, set loading to false to show "Generate Blueprint"
      setIsLoading(false);
    }
  }, [user?.id, authLoading]); // Depend on user.id and authLoading

  const loadBlueprint = async () => {
    setIsLoading(true);
    setErrorMessage(null);

    // Ensure user.id is available before proceeding
    if (!user?.id) {
      setErrorMessage('User not authenticated. Cannot load blueprint.');
      setIsLoading(false);
      return;
    }

    try {
      const fetchedBlueprint = await effectiveService.getSoulBlueprint(user.id);
      console.log('Loaded blueprint:', fetchedBlueprint);

      if (fetchedBlueprint) {
        setBlueprint(fetchedBlueprint);
        const analysis = effectiveService.analyzeBlueprint(fetchedBlueprint); // Pass the fetched blueprint
        setBlueprintAnalysis(analysis);
      } else {
        // No blueprint exists yet, allow generation
        setBlueprint(null);
        setBlueprintAnalysis(null); // Clear analysis if no blueprint
      }
    } catch (error) {
      console.error('Error loading soul blueprint:', error);
      // Error message already set by service or set here if needed
      setErrorMessage(errorMessage || 'Failed to load your soul blueprint. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const generateBlueprint = async () => {
    setIsGenerating(true);
    setErrorMessage(null);

    if (!user?.id) {
      setErrorMessage('User not authenticated. Cannot generate blueprint.');
      setIsGenerating(false);
      return;
    }

    try {
      console.log('Generating new blueprint for user:', user.id);
      const newBlueprint = await effectiveService.generateNewBlueprint(user.id);
      console.log('Generated blueprint:', newBlueprint);

      setBlueprint(newBlueprint);
      const analysis = effectiveService.analyzeBlueprint(newBlueprint);
      setBlueprintAnalysis(analysis);

      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 3000);
    } catch (error) {
      console.error('Error generating soul blueprint:', error);
      setErrorMessage(errorMessage || 'Failed to generate your soul blueprint. Please try again.');
    } finally {
      setIsGenerating(false);
    }
  };

  const handleSave = async () => {
    // Ensure blueprint and user exist before saving
    if (!blueprint || !user?.id) {
      setErrorMessage('No blueprint to save or user not authenticated.');
      return;
    }

    setIsSaving(true);
    setErrorMessage(null);

    try {
      console.log('Saving blueprint:', blueprint);
      // Pass the entire blueprint object, user_id will be added by the service
      const updatedBlueprint = await effectiveService.saveSoulBlueprint(blueprint);

      console.log('Saved blueprint:', updatedBlueprint);
      setBlueprint(updatedBlueprint);
      const analysis = effectiveService.analyzeBlueprint(updatedBlueprint);
      setBlueprintAnalysis(analysis);

      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 3000);
    } catch (error) {
      console.error('Error saving soul blueprint:', error);
      setErrorMessage(errorMessage || 'Failed to save your soul blueprint. Please try again.');
    } finally {
      setIsSaving(false);
    }
  };

  // Generic handler for top-level blueprint fields
  const handleChange = (field: keyof SoulBlueprint, value: any) => {
    setBlueprint(prev => {
      if (!prev) return null;
      // Basic type checking for common cases. More complex validation might be needed.
      if (field === 'core_frequency' && typeof value === 'string') {
        value = parseFloat(value);
      }
      return { ...prev, [field]: value };
    });
  };

  // Handler specifically for nested blueprint_text fields
  const handleBlueprintTextChange = (field: keyof SoulBlueprint['blueprint_text'], value: string | string[]) => {
    setBlueprint(prev => {
      if (!prev) return null;
      const currentBlueprintText = prev.blueprint_text || { // Ensure blueprint_text exists
        mission: '',
        strengths: [],
        challenges: [],
        evolution_path: ''
      };

      // Handle string array conversion for strengths/challenges if value is a string
      let processedValue: string | string[];
      if (field === 'strengths' || field === 'challenges') {
        processedValue = typeof value === 'string'
          ? value.split(',').map(s => s.trim()).filter(s => s) // Split, trim, and filter empty strings
          : value;
      } else {
        processedValue = value; // For mission, evolution_path
      }

      return {
        ...prev,
        blueprint_text: {
          ...currentBlueprintText,
          [field]: processedValue
        }
      };
    });
  };

  const handleChakraChange = (index: number, value: number) => {
    setBlueprint(prev => {
      if (!prev || !prev.chakra_signature) {
        // If chakra_signature is null/undefined, initialize it with default values
        const newSignature = Array(7).fill(50);
        newSignature[index] = value;
        return { ...prev, chakra_signature: newSignature } as SoulBlueprint; // Cast to ensure type
      }

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

    // Ensure blueprint and its chakra_signature are present before mapping
    const currentChakraSignature = blueprint?.chakra_signature;
    if (!currentChakraSignature || currentChakraSignature.length !== 7) {
      return (
        <p className="text-gray-400">
          Chakra signature data is missing or incomplete. Please generate a blueprint.
        </p>
      );
    }

    return (
      <div className="space-y-4">
        {chakraNames.map((name, index) => (
          <div key={index}>
            <div className="flex items-center justify-between mb-1">
              <label className="text-sm font-medium text-gray-300 flex items-center gap-2">
                <div className="w-3 h-3 rounded-full" style={{ backgroundColor: chakraColors[index] }}></div>
                {name} Chakra
              </label>
              <span className="text-sm text-white">{currentChakraSignature[index]}</span>
            </div>
            <input
              type="range"
              min="0"
              max="100"
              value={currentChakraSignature[index]}
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
    if (!blueprintAnalysis) return null; // Blueprint analysis must be present

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
              {blueprintAnalysis.elementalAlignment === 'water' && <Droplet className="w-4 h-4 text-blue-400" />}
              {blueprintAnalysis.elementalAlignment === 'fire' && <Flame className="w-4 h-4 text-orange-400" />}
              {blueprintAnalysis.elementalAlignment === 'earth' && <Zap className="w-4 h-4 text-green-400" />}
              {blueprintAnalysis.elementalAlignment === 'air' && <Wind className="w-4 h-4 text-cyan-400" />}
              Elemental Resonance
            </h3>

            <div className="text-2xl font-bold text-white capitalize">
              {blueprintAnalysis.elementalAlignment || 'Water'}
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

    // Use a guaranteed non-null chakraData
    const chakraData = blueprint.chakra_signature || Array(7).fill(50);
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
            const radius = 100 + (value / 2); // Chakra value affects radius
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
              const x1 = 160 + radius1 * Math.cos(angle1); // Center adjusted to 160 (half of 320px width)
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

  // Show loading spinner while authentication is loading or blueprint is loading
  if (authLoading || isLoading) {
    return (
      <div className="bg-slate-900/50 rounded-xl border border-purple-500/20 p-8 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-purple-400/30 border-t-purple-400 rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-purple-300">
            {authLoading ? 'Authenticating user...' : 'Loading your soul blueprint...'}
          </p>
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
              disabled={isGenerating || !user?.id} // Disable if no user
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
                disabled={isSaving || !user?.id} // Disable if no user
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
                disabled={isGenerating || !user?.id} // Disable if no user
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
                      onChange={(e) => handleChange('elemental_resonance', e.target.value as 'water' | 'fire' | 'earth' | 'air')} // Explicit cast
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
                    onChange={(e) => handleChange('emotional_profile', e.target.value as 'balanced' | 'evolving' | 'healing' | 'expanded' | 'intensified')} // Explicit cast
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
                    onChange={(e) => handleChange('shadow_frequencies', e.target.value as 'minimal' | 'moderate' | 'significant' | 'transforming' | 'integrated')} // Explicit cast
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
                        onChange={(e) => handleBlueprintTextChange('strengths', e.target.value)}
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
                        onChange={(e) => handleBlueprintTextChange('challenges', e.target.value)}
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
                {blueprint && <BlueprintTasksView blueprint={blueprint} />}
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
            disabled={isGenerating || !user?.id} // Disable if no user
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