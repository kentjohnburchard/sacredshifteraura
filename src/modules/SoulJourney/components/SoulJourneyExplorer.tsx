import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../../../contexts/AuthContext';
import { useChakra } from '../../../contexts/ChakraContext';
import { FrequencyUtils } from '../../../utils/FrequencyUtils';
import { SupabaseService } from '../../../services/SupabaseService';
import { 
  FrequencySignature, 
  ArchetypeActivation, 
  SoulJourneySession,
  TarotArchetype
} from '../SoulJourneyModule';
import { FrequencyAnalyzer } from './FrequencyAnalyzer';
import { ArchetypeExplorer } from './ArchetypeExplorer';
import { SoulJourneyGuide } from './SoulJourneyGuide';
import { SacredSoundPlayer } from './SacredSoundPlayer';
import { HelpButton } from '../../../components/HelpButton';
import { 
  Sparkles, 
  Star, 
  Compass, 
  Music, 
  Activity,
  ArrowRight,
  Heart,
  Crown,
  Brain,
  Zap,
  AlertTriangle
} from 'lucide-react';

type JourneyTab = 'welcome' | 'frequency' | 'archetypes' | 'journey' | 'sound';

export const SoulJourneyExplorer: React.FC = () => {
  const { user } = useAuth();
  const { activeChakra, getChakraColor } = useChakra();
  const supabaseService = SupabaseService.getInstance();
  
  const [activeTab, setActiveTab] = useState<JourneyTab>('welcome');
  const [frequencyData, setFrequencyData] = useState<FrequencySignature | null>(null);
  const [archetypes, setArchetypes] = useState<TarotArchetype[]>([]);
  const [userActivations, setUserActivations] = useState<ArchetypeActivation[]>([]);
  const [journeySessions, setJourneySessions] = useState<SoulJourneySession[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [activeArchetype, setActiveArchetype] = useState<TarotArchetype | null>(null);
  const [selectedIntention, setSelectedIntention] = useState<SpiritualIntention | null>(null);
  
  useEffect(() => {
    loadInitialData();
  }, [user]);
  
  const loadInitialData = async () => {
    if (!user) return;
    
    setIsLoading(true);
    setError(null);
    
    try {
      // Get frequency data if exists - use maybeSingle() to handle no records gracefully
      const { data: frequencyData, error: frequencyError } = await supabaseService.client
        .from('frequency_signatures')
        .select('*')
        .eq('user_id', user.id)
        .maybeSingle();
      
      if (frequencyError) {
        console.error('Error fetching frequency data:', frequencyError);
      } else if (frequencyData) {
        setFrequencyData(frequencyData);
      }
      
      // Get user archetype activations
      const { data: activationData, error: activationError } = await supabaseService.client
        .from('archetype_activations')
        .select('*')
        .eq('user_id', user.id)
        .order('activation_date', { ascending: false });
      
      if (!activationError) {
        setUserActivations(activationData || []);
      }
      
      // Get user journey sessions
      const { data: sessionData, error: sessionError } = await supabaseService.client
        .from('soul_journey_sessions')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });
      
      if (!sessionError) {
        setJourneySessions(sessionData || []);
      }
      
      // Get available archetypes - normally this would come from the module
      // Here we'll use some mock data for demonstration
      const mockArchetypes: TarotArchetype[] = [
        {
          key: 'fool',
          name: 'The Fool',
          element: 'air',
          number: 0,
          chakra: 'crown',
          frequency: 963,
          keywords: ['beginnings', 'innocence', 'spontaneity', 'free spirit'],
          description: 'The Fool represents new beginnings, faith in the future, and innocence. It encourages taking a leap of faith and following your heart.',
          consciousness_level: 'cosmic awareness',
          shadow_aspects: ['recklessness', 'naivety', 'foolishness'],
          light_aspects: ['purity', 'trust', 'optimism', 'adventure']
        },
        {
          key: 'magician',
          name: 'The Magician',
          element: 'air',
          number: 1,
          chakra: 'third-eye',
          frequency: 852,
          keywords: ['manifestation', 'power', 'action', 'creation'],
          description: 'The Magician represents the ability to manifest your desires using focused intention, spiritual power, and practical tools.',
          consciousness_level: 'manifestation consciousness',
          shadow_aspects: ['manipulation', 'trickery', 'wasted talent'],
          light_aspects: ['willpower', 'creation', 'concentration', 'skill']
        },
        {
          key: 'high_priestess',
          name: 'The High Priestess',
          element: 'water',
          number: 2,
          chakra: 'third-eye',
          frequency: 852,
          keywords: ['intuition', 'unconscious', 'divine feminine', 'inner voice'],
          description: 'The High Priestess represents intuition, sacred knowledge, divine feminine, and the subconscious mind.',
          consciousness_level: 'intuitive awareness',
          shadow_aspects: ['secrets', 'disconnection', 'repressed feelings'],
          light_aspects: ['intuition', 'wisdom', 'mystery', 'spirituality']
        },
        {
          key: 'empress',
          name: 'The Empress',
          element: 'earth',
          number: 3,
          chakra: 'heart',
          frequency: 639,
          keywords: ['abundance', 'nurturing', 'fertility', 'creation'],
          description: 'The Empress represents divine feminine, abundance, nurturing, and connection with nature and body.',
          consciousness_level: 'creative abundance',
          shadow_aspects: ['smothering', 'dependence', 'self-indulgence'],
          light_aspects: ['nurturing', 'abundance', 'sensuality', 'fertility']
        },
        {
          key: 'emperor',
          name: 'The Emperor',
          element: 'fire',
          number: 4,
          chakra: 'solar',
          frequency: 528,
          keywords: ['authority', 'structure', 'control', 'leadership'],
          description: 'The Emperor represents stability, structure, authority, and regulation. It encourages creating order out of chaos.',
          consciousness_level: 'ordered leadership',
          shadow_aspects: ['domination', 'rigidity', 'coldness'],
          light_aspects: ['structure', 'protection', 'stability', 'rationality']
        },
        {
          key: 'hierophant',
          name: 'The Hierophant',
          element: 'earth',
          number: 5,
          chakra: 'throat',
          frequency: 741,
          keywords: ['tradition', 'conformity', 'morality', 'ethics'],
          description: 'The Hierophant represents tradition, spirituality, and initiation. It connects the divine with the earthly realm.',
          consciousness_level: 'spiritual initiation',
          shadow_aspects: ['dogma', 'inflexibility', 'judgment'],
          light_aspects: ['tradition', 'spiritual wisdom', 'guidance', 'education']
        },
        {
          key: 'lovers',
          name: 'The Lovers',
          element: 'air',
          number: 6,
          chakra: 'heart',
          frequency: 639,
          keywords: ['love', 'harmony', 'choices', 'alignment'],
          description: 'The Lovers represents connections, alignment, and choices from the heart. It symbolizes perfect union, harmony of opposites.',
          consciousness_level: 'heart-centered union',
          shadow_aspects: ['indecision', 'separation', 'disharmony'],
          light_aspects: ['love', 'harmony', 'alignment', 'choices']
        },
        {
          key: 'chariot',
          name: 'The Chariot',
          element: 'water',
          number: 7,
          chakra: 'solar',
          frequency: 528,
          keywords: ['determination', 'willpower', 'victory', 'control'],
          description: 'The Chariot represents overcoming challenges through willpower, determination, and maintaining control over opposing forces.',
          consciousness_level: 'directed will',
          shadow_aspects: ['aggression', 'recklessness', 'lack of direction'],
          light_aspects: ['willpower', 'determination', 'direction', 'focus']
        }
      ];
      
      setArchetypes(mockArchetypes);
      
    } catch (err) {
      console.error('Error loading initial data:', err);
      setError('Failed to load soul journey data. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };
  
  const analyzeFrequency = async () => {
    if (!user) return;
    
    setIsLoading(true);
    setError(null);
    
    try {
      // Generate a soul frequency signature
      const dominantFrequency = [396, 417, 528, 639, 741, 852, 963][Math.floor(Math.random() * 7)];
      
      // Create harmonics pattern
      const harmonicPattern = {
        primaryHarmonic: dominantFrequency,
        secondaryHarmonic: dominantFrequency * FrequencyUtils.GOLDEN_RATIO,
        tertiaryHarmonic: dominantFrequency * 2,
        resonantPattern: ['fibonacci', 'golden', 'octave'][Math.floor(Math.random() * 3)]
      };
      
      // Create chakra alignment profile
      const chakraAlignment: Record<string, number> = {
        root: Math.random() * 100,
        sacral: Math.random() * 100,
        solar: Math.random() * 100,
        heart: Math.random() * 100,
        throat: Math.random() * 100,
        'third-eye': Math.random() * 100,
        crown: Math.random() * 100
      };
      
      // Find the closest chakra to the dominant frequency
      const dominantChakra = FrequencyUtils.getClosestChakra(dominantFrequency);
      chakraAlignment[dominantChakra] += 50; // Boost the dominant chakra
      
      // Calculate resonance score
      const resonanceScore = Math.floor(Math.random() * 50) + 50; // 50-100
      
      // Check if a frequency signature already exists for this user
      const { data: existingSignature, error: checkError } = await supabaseService.client
        .from('frequency_signatures')
        .select('id')
        .eq('user_id', user.id)
        .maybeSingle();
      
      if (checkError) {
        console.error('Error checking existing signature:', checkError);
        throw checkError;
      }
      
      let data;
      if (existingSignature) {
        // Update existing record
        const { data: updateData, error: updateError } = await supabaseService.client
          .from('frequency_signatures')
          .update({
            dominant_frequency: dominantFrequency,
            harmonic_pattern: harmonicPattern,
            chakra_alignment: chakraAlignment,
            resonance_score: resonanceScore,
            updated_at: new Date().toISOString()
          })
          .eq('user_id', user.id)
          .select()
          .single();
        
        if (updateError) throw updateError;
        data = updateData;
      } else {
        // Insert new record
        const { data: insertData, error: insertError } = await supabaseService.client
          .from('frequency_signatures')
          .insert({
            user_id: user.id,
            dominant_frequency: dominantFrequency,
            harmonic_pattern: harmonicPattern,
            chakra_alignment: chakraAlignment,
            resonance_score: resonanceScore
          })
          .select()
          .single();
        
        if (insertError) throw insertError;
        data = insertData;
      }
      
      setFrequencyData(data);
    } catch (err) {
      console.error('Error analyzing frequency:', err);
      setError('Failed to analyze your soul frequency signature. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };
  
  const activateArchetype = async (archetypeKey: string, notes?: string) => {
    if (!user) return;
    
    setIsLoading(true);
    setError(null);
    
    try {
      const archetype = archetypes.find(a => a.key === archetypeKey);
      if (!archetype) throw new Error('Archetype not found');
      
      const activation: Partial<ArchetypeActivation> = {
        user_id: user.id,
        archetype_key: archetypeKey,
        archetype_name: archetype.name,
        frequency_hz: archetype.frequency,
        chakra_resonance: archetype.chakra,
        activation_notes: notes || '',
        wisdom_received: `Connecting with the essence of ${archetype.name}: ${archetype.description}`,
        integration_level: Math.floor(Math.random() * 10) + 1 // 1-10
      };
      
      const { data, error } = await supabaseService.client
        .from('archetype_activations')
        .insert(activation)
        .select()
        .single();
      
      if (error) throw error;
      
      setUserActivations(prev => [data, ...prev]);
      setActiveArchetype(archetype);
    } catch (err) {
      console.error('Error activating archetype:', err);
      setError('Failed to activate the archetype. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };
  
  const startJourneySession = async (journeyType: string, frequencies: number[]) => {
    if (!user) return;
    
    setIsLoading(true);
    setError(null);
    
    try {
      const session: Partial<SoulJourneySession> = {
        user_id: user.id,
        journey_type: journeyType,
        frequencies_used: frequencies,
        duration_minutes: 0 // Will be updated on completion
      };
      
      const { data, error } = await supabaseService.client
        .from('soul_journey_sessions')
        .insert(session)
        .select()
        .single();
      
      if (error) throw error;
      
      return data.id;
    } catch (err) {
      console.error('Error starting journey session:', err);
      setError('Failed to start journey session. Please try again.');
      return null;
    } finally {
      setIsLoading(false);
    }
  };
  
  const completeJourneySession = async (sessionId: string, expansionLevel: number, insights: string) => {
    if (!user) return;
    
    setIsLoading(true);
    setError(null);
    
    try {
      // Calculate duration based on start time
      const { data: sessionData, error: sessionError } = await supabaseService.client
        .from('soul_journey_sessions')
        .select('created_at')
        .eq('id', sessionId)
        .single();
      
      if (sessionError) throw sessionError;
      
      const startTime = new Date(sessionData.created_at);
      const endTime = new Date();
      const durationMinutes = Math.round((endTime.getTime() - startTime.getTime()) / 60000);
      
      const { data, error } = await supabaseService.client
        .from('soul_journey_sessions')
        .update({
          duration_minutes: durationMinutes,
          consciousness_expansion_level: expansionLevel,
          insights_gained: insights
        })
        .eq('id', sessionId)
        .select()
        .single();
      
      if (error) throw error;
      
      setJourneySessions(prev => [data, ...prev.filter(s => s.id !== sessionId)]);
    } catch (err) {
      console.error('Error completing journey session:', err);
      setError('Failed to save journey results. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };
  
  // Calculate soul journey stats
  const calculateJourneyStats = () => {
    if (journeySessions.length === 0) return null;
    
    const totalMinutes = journeySessions.reduce((sum, session) => sum + session.duration_minutes, 0);
    const avgExpansionLevel = journeySessions.reduce((sum, session) => sum + (session.consciousness_expansion_level || 0), 0) / journeySessions.length;
    const journeyTypes = journeySessions.reduce((acc, session) => {
      acc[session.journey_type] = (acc[session.journey_type] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);
    
    return {
      totalSessions: journeySessions.length,
      totalMinutes,
      avgExpansionLevel,
      journeyTypes
    };
  };
  
  const journeyStats = calculateJourneyStats();
  
  // Define spiritual intentions that map to actual functionality
  interface SpiritualIntention {
    id: string;
    title: string;
    description: string;
    icon: React.ComponentType<any>;
    color: string;
    telosId: string;
    capability: string;
    frequency: number;
    chakra: string;
    view: JourneyTab;
  }
  
  const spiritualIntentions: SpiritualIntention[] = [
    {
      id: 'frequency-analysis',
      title: 'Discover Soul Frequency',
      description: 'Analyze your unique soul frequency signature and chakra alignment',
      icon: Activity,
      color: 'from-cyan-500/85 to-blue-600/75',
      telosId: 'soul:remembrance',
      capability: 'frequency-analysis',
      frequency: 528,
      chakra: 'third-eye',
      view: 'frequency'
    },
    {
      id: 'archetype-activation',
      title: 'Activate Sacred Archetypes',
      description: 'Connect with archetypal wisdom to expand your consciousness',
      icon: Star,
      color: 'from-amber-500/85 to-orange-600/75',
      telosId: 'soul:remembrance',
      capability: 'archetype-activation',
      frequency: 639,
      chakra: 'heart',
      view: 'archetypes'
    },
    {
      id: 'sacred-journey',
      title: 'Guided Soul Journey',
      description: 'Embark on consciousness-expanding guided journeys',
      icon: Compass,
      color: 'from-purple-500/85 to-pink-600/75',
      telosId: 'consciousness:expansion',
      capability: 'soul-journey',
      frequency: 852,
      chakra: 'crown',
      view: 'journey'
    },
    {
      id: 'sacred-sound',
      title: 'Sacred Sound Healing',
      description: 'Experience sacred frequencies for healing and transformation',
      icon: Music,
      color: 'from-green-500/85 to-emerald-600/75',
      telosId: 'sacred:sound',
      capability: 'sacred-sound',
      frequency: 432,
      chakra: 'heart',
      view: 'sound'
    }
  ];
  
  const handleIntentionSelect = async (intention: SpiritualIntention) => {
    if (isLoading) return;
    
    setSelectedIntention(intention);
    setActiveTab(intention.view);
    
    // If frequency data doesn't exist, analyze it first for a better experience
    if (!frequencyData && intention.view !== 'frequency') {
      await analyzeFrequency();
    }
  };

  const renderWelcomeView = () => (
    <div className="space-y-6">
      <div className="bg-slate-900/70 backdrop-blur-sm rounded-xl border border-purple-500/20 p-8 text-center">
        <div className="mb-6">
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5 }}
            className="w-24 h-24 bg-gradient-to-br from-purple-500 to-indigo-600 rounded-full mx-auto flex items-center justify-center"
          >
            <Crown className="w-10 h-10 text-white" />
          </motion.div>
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2, duration: 0.5 }}
            className="text-3xl font-bold bg-gradient-to-r from-white via-purple-200 to-cyan-200 bg-clip-text text-transparent mt-4"
          >
            Your Soul Journey
          </motion.h1>
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.4, duration: 0.5 }}
            className="text-purple-300 max-w-2xl mx-auto mt-3"
          >
            Discover your unique soul frequency pattern, activate sacred archetypes, and
            expand your consciousness through guided sacred journeys.
          </motion.p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
          {spiritualIntentions.map((intention, index) => (
            <motion.div
              key={intention.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 + (index * 0.1), duration: 0.5 }}
              className="p-6 bg-slate-800/50 rounded-lg border border-purple-500/20"
            >
              <intention.icon className="w-10 h-10 text-purple-400 mx-auto mb-3" />
              <h3 className="text-lg font-bold text-white">{intention.title}</h3>
              <p className="text-gray-400 text-sm">{intention.description}</p>
            </motion.div>
          ))}
        </div>
        
        <div className="flex justify-center">
          {frequencyData ? (
            <div className="space-y-4">
              <div className="p-4 bg-purple-900/20 rounded-lg border border-purple-500/30 text-center">
                <div className="text-lg text-purple-300 font-medium flex items-center justify-center gap-2">
                  <Zap className="w-5 h-5" />
                  Your Soul Frequency: {frequencyData.dominant_frequency}Hz
                </div>
                <div className="text-sm text-purple-200">
                  Resonance Score: {frequencyData.resonance_score}/100
                </div>
              </div>
              
              <div className="flex flex-wrap justify-center gap-2">
                {spiritualIntentions.map((intention, index) => (
                  <motion.button
                    key={intention.id}
                    onClick={() => handleIntentionSelect(intention)}
                    className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    {intention.title}
                  </motion.button>
                ))}
              </div>
            </div>
          ) : (
            <motion.button
              onClick={() => handleIntentionSelect(spiritualIntentions[0])}
              className="px-6 py-3 bg-gradient-to-r from-purple-600 to-blue-600 text-white font-bold rounded-xl hover:from-purple-700 hover:to-blue-700 transition-all shadow-lg shadow-purple-500/25 flex items-center gap-2"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <Sparkles className="w-5 h-5" />
              Begin Soul Quest
            </motion.button>
          )}
        </div>
        
        {journeyStats && (
          <div className="mt-8 p-4 bg-slate-800/50 rounded-lg border border-slate-700">
            <h4 className="text-white font-medium mb-3">Your Soul Journey Stats</h4>
            <div className="grid grid-cols-3 gap-2 text-center">
              <div>
                <div className="text-xl font-bold text-purple-300">{journeyStats.totalSessions}</div>
                <div className="text-xs text-gray-400">Journeys</div>
              </div>
              <div>
                <div className="text-xl font-bold text-amber-300">{journeyStats.totalMinutes}</div>
                <div className="text-xs text-gray-400">Minutes</div>
              </div>
              <div>
                <div className="text-xl font-bold text-cyan-300">{journeyStats.avgExpansionLevel.toFixed(1)}</div>
                <div className="text-xs text-gray-400">Avg. Expansion</div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );

  return (
    <div className="space-y-6 relative">
      {/* Navigation */}
      <div className="bg-slate-900/50 rounded-xl border border-purple-500/20 p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <button
              onClick={() => setActiveTab('welcome')}
              className={`p-3 rounded-lg transition-all duration-200 flex flex-col items-center gap-1 ${
                activeTab === 'welcome'
                  ? 'bg-purple-600 text-white shadow-lg shadow-purple-600/25'
                  : 'text-gray-400 hover:text-white hover:bg-slate-800/50'
              }`}
            >
              <Sparkles className="w-5 h-5" />
              <span className="text-xs font-medium">Home</span>
            </button>

            <button
              onClick={() => setActiveTab('frequency')}
              className={`p-3 rounded-lg transition-all duration-200 flex flex-col items-center gap-1 ${
                activeTab === 'frequency'
                  ? 'bg-purple-600 text-white shadow-lg shadow-purple-600/25'
                  : 'text-gray-400 hover:text-white hover:bg-slate-800/50'
              }`}
            >
              <Activity className="w-5 h-5" />
              <span className="text-xs font-medium">Frequency</span>
            </button>

            <button
              onClick={() => setActiveTab('archetypes')}
              className={`p-3 rounded-lg transition-all duration-200 flex flex-col items-center gap-1 ${
                activeTab === 'archetypes'
                  ? 'bg-purple-600 text-white shadow-lg shadow-purple-600/25'
                  : 'text-gray-400 hover:text-white hover:bg-slate-800/50'
              }`}
            >
              <Star className="w-5 h-5" />
              <span className="text-xs font-medium">Archetypes</span>
            </button>

            <button
              onClick={() => setActiveTab('journey')}
              className={`p-3 rounded-lg transition-all duration-200 flex flex-col items-center gap-1 ${
                activeTab === 'journey'
                  ? 'bg-purple-600 text-white shadow-lg shadow-purple-600/25'
                  : 'text-gray-400 hover:text-white hover:bg-slate-800/50'
              }`}
            >
              <Compass className="w-5 h-5" />
              <span className="text-xs font-medium">Journey</span>
            </button>

            <button
              onClick={() => setActiveTab('sound')}
              className={`p-3 rounded-lg transition-all duration-200 flex flex-col items-center gap-1 ${
                activeTab === 'sound'
                  ? 'bg-purple-600 text-white shadow-lg shadow-purple-600/25'
                  : 'text-gray-400 hover:text-white hover:bg-slate-800/50'
              }`}
            >
              <Music className="w-5 h-5" />
              <span className="text-xs font-medium">Sacred Sound</span>
            </button>
          </div>
          
          <HelpButton moduleType="soul-journey" />
        </div>
      </div>
      
      {/* Error Message */}
      <AnimatePresence>
        {error && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="bg-red-900/20 text-red-300 p-4 rounded-lg flex items-start gap-2"
          >
            <AlertTriangle className="w-5 h-5 text-red-400 flex-shrink-0" />
            <div>{error}</div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Content */}
      <AnimatePresence mode="wait">
        {activeTab === 'welcome' && (
          <motion.div
            key="welcome"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.3 }}
          >
            {renderWelcomeView()}
          </motion.div>
        )}
        
        {activeTab === 'frequency' && (
          <motion.div
            key="frequency"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.3 }}
          >
            <FrequencyAnalyzer 
              frequencyData={frequencyData} 
              onAnalyze={analyzeFrequency} 
              isLoading={isLoading} 
            />
          </motion.div>
        )}
        
        {activeTab === 'archetypes' && (
          <motion.div
            key="archetypes"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.3 }}
          >
            <ArchetypeExplorer 
              archetypes={archetypes} 
              activations={userActivations}
              onActivate={activateArchetype}
              isLoading={isLoading}
              activeArchetype={activeArchetype}
              onSelectArchetype={setActiveArchetype}
            />
          </motion.div>
        )}
        
        {activeTab === 'journey' && (
          <motion.div
            key="journey"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.3 }}
          >
            <SoulJourneyGuide 
              frequencyData={frequencyData}
              journeySessions={journeySessions}
              onStartJourney={startJourneySession}
              onCompleteJourney={completeJourneySession}
              isLoading={isLoading}
            />
          </motion.div>
        )}
        
        {activeTab === 'sound' && (
          <motion.div
            key="sound"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.3 }}
          >
            <SacredSoundPlayer 
              frequencyData={frequencyData}
              chakraColors={getChakraColor}
            />
          </motion.div>
        )}
      </AnimatePresence>
      
      {/* Loading Overlay */}
      {isLoading && (
        <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center rounded-xl z-10">
          <div className="text-center">
            <div className="relative">
              <div className="w-16 h-16 border-4 border-purple-400/30 border-t-purple-400 rounded-full animate-spin mx-auto mb-4"></div>
              <div className="absolute inset-0 w-16 h-16 border-4 border-cyan-400/20 border-b-cyan-400 rounded-full animate-spin mx-auto" style={{ animationDirection: 'reverse', animationDuration: '1.5s' }}></div>
            </div>
            <p className="text-purple-300">Aligning soul frequencies...</p>
          </div>
        </div>
      )}
    </div>
  );
};
