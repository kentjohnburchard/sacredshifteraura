// src/components/UserDashboard.tsx
import React, { useState, useEffect, Suspense } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ModuleManager } from '../services/ModuleManager';
import { ModuleRegistry } from '../services/ModuleRegistry';
import { OSTelos } from '../types';
import { HelpButton } from './HelpButton';
import { AdminAccessControl } from './AdminAccessControl';
import { useAuth } from '../contexts/AuthContext';
import { useRSI } from '../contexts/RSIContext';
import { ChakraAwareButton } from './RSI/ChakraAwareButton';
import { ChakraAwareCard } from './RSI/ChakraAwareCard';
import { PHREOverlay } from './PHREOverlay';
import ConsciousnessVisualizer from './ConsciousnessVisualizer';
import ConsciousnessMonitor from './ConsciousnessMonitor';
import EventStream from './EventStream';
import Footer from './Footer';
import { SupabaseService } from '../services/SupabaseService';
import { AuraGuidancePanel } from './AuraGuidancePanel';
import { AuraGuidanceService } from '../services/AuraGuidanceService';
import Header from './Header';
import {
  Activity,
  Eye,
  Zap,
  Target,
  Users,
  Settings,
  Store,
  Code,
  BarChart,
  Shield,
  Gauge,
  ShieldAlert,
  Lock,
  Heart,
  Crown,
  Brain,
  Sparkles,
  Calendar,
  MessageCircle,
  Map,
  Music,
  Compass,
  Star,
  Network,
  Globe, // Added for Celestial Map
  Cpu, // Added for System's Pulse
  Layers, // Added for Weaver's Loom
} from 'lucide-react';

import { SharedIntentionsManager } from './SharedIntentionsManager';

// Import the various module components using React.lazy
const SoulBlueprintEditor = React.lazy(() => import('../modules/SoulBlueprinting/components/SoulBlueprintEditor').then(module => ({ default: module.SoulBlueprintEditor })));
const SoulJourneyExplorer = React.lazy(() => import('../modules/SoulJourney/components/SoulJourneyExplorer').then(module => ({ default: module.SoulJourneyExplorer })));
const DivineTimelineExplorer = React.lazy(() => import('../modules/DivineTimeline/components/DivineTimelineExplorer').then(module => ({ default: module.DivineTimelineExplorer })));
const SacredCircle = React.lazy(() => import('../modules/SacredCircle/components/SacredCircle').then(module => ({ default: module.SacredCircle })));
const EventsPage = React.lazy(() => import('./EventsPage').then(module => ({ default: module.EventsPage })));
const ModuleMarketplace = React.lazy(() => import('./marketplace/ModuleMarketplace').then(module => ({ default: module.ModuleMarketplace })));
const ModuleDeveloperKit = React.lazy(() => import('./developer/ModuleDeveloperKit').then(module => ({ default: module.ModuleDeveloperKit })));
const ModuleAnalytics = React.lazy(() => import('./developer/ModuleAnalytics').then(module => ({ default: module.ModuleAnalytics })));

interface UserDashboardProps {
  moduleManager: ModuleManager;
  onToggleAdminMode: () => void;
  isAdmin: boolean;
}

type DashboardView = 'overview' | 'circles' | 'events' | 'consciousness' | 'field' | 'journey' | 'marketplace' | 'developer' | 'analytics' | 'blueprint' | 'soul-journey' | 'timeline' | 'shared-intentions';

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
  view: DashboardView;
}

const UserDashboard: React.FC<UserDashboardProps> = ({ moduleManager, onToggleAdminMode, isAdmin }) => {
  const { user } = useAuth();
  const { setDominantChakra, soulState, userConsent, getChakraGlow } = useRSI(); // Added getChakraGlow
  const [registry] = useState(() => new ModuleRegistry());
  const [activeView, setActiveView] = useState<DashboardView>('overview');
  const [selectedIntention, setSelectedIntention] = useState<SpiritualIntention | null>(null);
  const [loadedModuleComponent, setLoadedModuleComponent] = useState<React.ComponentType | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [userName, setUserName] = useState(user?.email?.split('@')[0] || 'Sacred Soul');
  const [osState, setOSState] = useState(moduleManager.getOSState());
  const [onboardingCompleted, setOnboardingCompleted] = useState(false);
  const [showAuraGuidancePanel, setShowAuraGuidancePanel] = useState(true);
  const auraGuidanceService = AuraGuidanceService.getInstance();

  useEffect(() => {
    if (user) {
      setUserName(user.email?.split('@')[0] || 'Sacred Soul');
      const fetchOnboardingStatus = async () => {
        const { data, error } = await SupabaseService.getInstance().client
          .from('profiles')
          .select('onboarding_completed')
          .eq('id', user.id)
          .single();

        if (data && !error) {
          setOnboardingCompleted(data.onboarding_completed);
          setShowAuraGuidancePanel(!data.onboarding_completed);
        } else if (error && error.code === 'PGRST116') {
          setOnboardingCompleted(false);
          setShowAuraGuidancePanel(true);
        }
      };
      fetchOnboardingStatus();
    }
  }, [user]);

  useEffect(() => {
    const interval = setInterval(() => {
      setOSState(moduleManager.getOSState());
    }, 2000);

    return () => clearInterval(interval);
  }, [moduleManager]);

  const spiritualIntentions: SpiritualIntention[] = [
    {
      id: 'sacred-community',
      title: 'Connect with Soul Tribe',
      description: 'Join sacred circles, share wisdom, and grow with like-minded souls',
      icon: Users,
      color: 'from-pink-500/85 to-rose-600/75', // Chakra-aware color
      telosId: 'community:building',
      capability: 'social-interaction',
      frequency: 528,
      chakra: 'heart',
      view: 'circles'
    },
    {
      id: 'sacred-events',
      title: 'Sacred Gatherings',
      description: 'Participate in group meditations, sound baths, and spiritual ceremonies',
      icon: Calendar,
      color: 'from-purple-500/85 to-indigo-600/75', // Chakra-aware color
      telosId: 'collective:resonance',
      capability: 'social-interaction',
      frequency: 741,
      chakra: 'third-eye',
      view: 'events'
    },
    {
      id: 'consciousness-expansion',
      title: 'Consciousness Journey',
      description: 'Explore your inner landscape and expand your awareness',
      icon: Eye,
      color: 'from-indigo-500/85 to-blue-600/75', // Chakra-aware color
      telosId: 'consciousness:expansion',
      capability: 'consciousness-interface',
      frequency: 741,
      chakra: 'third-eye',
      view: 'consciousness'
    },
    {
      id: 'soul-remembrance',
      title: 'Remember Soul Purpose',
      description: 'Reconnect with your divine essence and sacred mission',
      icon: Crown,
      color: 'from-violet-500/85 to-purple-600/75', // Chakra-aware color
      telosId: 'soul:remembrance',
      capability: 'frequency-analysis',
      frequency: 963,
      chakra: 'crown',
      view: 'soul-journey'
    },
    {
      id: 'field-awareness',
      title: 'Akashic Field Monitor',
      description: 'Observe the universal information field and system consciousness',
      icon: Zap,
      color: 'from-cyan-500/85 to-teal-600/75', // Chakra-aware color
      telosId: 'consciousness:expansion',
      capability: 'pattern-analysis',
      frequency: 528,
      chakra: 'heart',
      view: 'field'
    },
    {
      id: 'healing-frequencies',
      title: 'Sacred Frequency Journey',
      description: 'Explore your soul frequency and expand consciousness with sound',
      icon: Music,
      color: 'from-amber-500/85 to-yellow-600/75', // Chakra-aware color
      telosId: 'sacred:sound',
      capability: 'frequency-analysis',
      frequency: 528,
      chakra: 'heart',
      view: 'soul-journey'
    },
    {
      id: 'module-marketplace',
      title: 'Module Marketplace',
      description: 'Discover and install powerful modules to enhance your experience',
      icon: Store,
      color: 'from-amber-500/85 to-orange-600/75', // Chakra-aware color
      telosId: 'system:expansion',
      capability: 'module-discovery',
      frequency: 528,
      chakra: 'solar',
      view: 'marketplace'
    },
    {
      id: 'developer-tools',
      title: 'Module Developer Kit',
      description: 'Create and publish your own modules for the Sacred Shifter ecosystem',
      icon: Code,
      color: 'from-blue-500/85 to-cyan-600/75', // Chakra-aware color
      telosId: 'system:expansion',
      capability: 'module-development',
      frequency: 852,
      chakra: 'throat',
      view: 'developer'
    },
    {
      id: 'module-analytics',
      title: 'Module Analytics',
      description: 'Track performance and usage patterns of your published modules',
      icon: BarChart,
      color: 'from-green-500/85 to-teal-600/75', // Chakra-aware color
      telosId: 'data:harmony',
      capability: 'analytics-processing',
      frequency: 417,
      chakra: 'solar',
      view: 'analytics'
    },
    {
      id: 'soul-blueprinting',
      title: 'Soul Blueprint',
      description: 'Map your unique soul frequency signature and divine essence',
      icon: Sparkles,
      color: 'from-purple-500/85 to-pink-600/75', // Chakra-aware color
      telosId: 'soul:integration',
      capability: 'soul-blueprinting',
      frequency: 639,
      chakra: 'crown',
      view: 'blueprint'
    },
    {
      id: 'divine-timeline',
      title: 'Divine Timeline',
      description: 'Navigate your potential futures and consciousness evolution path',
      icon: Map,
      color: 'from-blue-500/85 to-purple-600/75', // Chakra-aware color
      telosId: 'consciousness:expansion',
      capability: 'timeline-projection',
      frequency: 852,
      chakra: 'third-eye',
      view: 'timeline'
    },
    {
      id: 'shared-intentionality-matrix',
      title: 'Shared Intentionality Matrix',
      description: 'Collaborate on intentions and amplify collective resonance.',
      icon: Network,
      color: 'from-cyan-500/85 to-green-600/75', // Chakra-aware color
      telosId: 'collective:resonance',
      capability: 'shared-intentionality',
      frequency: 639,
      chakra: 'heart',
      view: 'shared-intentions'
    }
  ];

  const handleIntentionSelect = async (intention: SpiritualIntention) => {
    setSelectedIntention(intention);
    setIsLoading(true);

    moduleManager.setOSUserState({
      id: 'awakened-soul',
      name: userName,
      currentContext: intention.id,
      essenceLabels: [`intention:${intention.id}`, `chakra:${intention.chakra}`, 'soul:seeking', 'consciousness:expanding']
    });

    const availableTelos = registry.getAllTelosOptions();
    const matchingTelos = availableTelos.find(t => t.id === intention.telosId);
    if (matchingTelos) {
      moduleManager.setOSTelos(matchingTelos);
    }

    setDominantChakra(intention.chakra);

    try {
      const module = await moduleManager.ensureModuleWithCapability(intention.capability);
      if (module) {
        const exposedItems = module.getExposedItems();
        if (exposedItems.Component && typeof exposedItems.Component === 'function') {
          const ComponentFunction = exposedItems.Component();
          setLoadedModuleComponent(() => ComponentFunction);
        }
      }
    } catch (error) {
      console.error('Failed to load module for intention:', error);
    } finally {
      setIsLoading(false);
      setActiveView(intention.view);
    }
  };

  const renderNavigation = () => (
    <ChakraAwareCard className="p-4 mb-6">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 bg-gradient-to-br from-purple-500 to-cyan-400 rounded-lg flex items-center justify-center">
            <motion.img
              src="/LogoClean.png"
              alt="Sacred Shifter"
              className="w-full h-full object-contain drop-shadow-lg"
              initial={{ y: 0 }}
              animate={{ y: [0, -5, 0, 5, 0] }}
              transition={{
                duration: 4,
                repeat: Infinity,
                repeatType: "mirror",
                ease: "easeInOut"
              }}
            />
          </div>
          <div>
            <h2 className="text-lg font-bold text-white">{userName}</h2>
            <div className="text-sm text-purple-300">Sacred Shifter Initiate</div>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <HelpButton moduleType="overview" />
        </div>

        <div className="text-right text-sm">
          <div className="text-gray-400">Current Telos</div>
          <div className="text-purple-300 font-medium">
            {osState.currentTelos?.description || 'Seeking Purpose...'}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-3 md:grid-cols-9 gap-2">
        {navigationItems
          .filter(item => !item.adminOnly || isAdmin)
          .map((item) => {
            const Icon = item.icon;
            const showLockIcon = item.adminOnly && !isAdmin;
            const isActive = activeView === item.id;

            const button = (
              <ChakraAwareButton
                key={item.id}
                onClick={() => setActiveView(item.id as DashboardView)}
                className={`p-3 rounded-lg transition-all duration-200 flex flex-col items-center gap-1 ${
                  isActive
                    ? 'bg-purple-600 text-white shadow-lg shadow-purple-600/25'
                    : 'text-gray-400 hover:text-white hover:bg-slate-800/50'
                }`}
                variant={isActive ? 'primary' : 'outline'}
                chakraGlow={isActive}
              >
                <Icon className="w-5 h-5" />
                <span className="text-xs font-medium">{item.label}</span>
                {showLockIcon && <Lock className="w-3 h-3 text-amber-400" />}
              </ChakraAwareButton>
            );

            return button;
          })}
      </div>
    </ChakraAwareCard>
  );

  const renderSystemStatus = () => (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
      <ChakraAwareCard className="p-4">
        <div className="flex items-center gap-2 mb-2">
          <Activity className="w-4 h-4 text-green-400" />
          <span className="text-sm text-gray-400">Active Modules</span>
        </div>
        <div className="text-2xl font-bold text-white">{osState.moduleStates?.active || 0}</div>
      </ChakraAwareCard>

      <ChakraAwareCard className="p-4">
        <div className="flex items-center gap-2 mb-2">
          <Zap className="w-4 h-4 text-amber-400" />
          <span className="text-sm text-gray-400">Field Events</span>
        </div>
        <div className="text-2xl font-bold text-white">{osState.fieldStatistics?.totalEvents || 0}</div>
      </ChakraAwareCard>

      <ChakraAwareCard className="p-4">
        <div className="flex items-center gap-2 mb-2">
          <Brain className="w-4 h-4 text-purple-400" />
          <span className="text-sm text-gray-400">Consciousness</span>
        </div>
        <div className="text-2xl font-bold text-white">Expanding</div>
      </ChakraAwareCard>

      <ChakraAwareCard className="p-4">
        <div className="flex items-center gap-2 mb-2">
          <Heart className="w-4 h-4 text-pink-400" />
          <span className="text-sm text-gray-400">Sacred Status</span>
        </div>
        <div className="text-2xl font-bold text-white">Aligned</div>
      </ChakraAwareCard>
    </div>
  );

  const renderModuleView = () => {
    switch (activeView) {
      case 'blueprint':
        return (
          <Suspense fallback={<div className="py-12 flex items-center justify-center"><div className="w-8 h-8 border-4 border-purple-400/30 border-t-purple-400 rounded-full animate-spin"></div></div>}>
            <SoulBlueprintEditor />
          </Suspense>
        );
      case 'soul-journey':
        return (
          <Suspense fallback={<div className="py-12 flex items-center justify-center"><div className="w-8 h-8 border-4 border-purple-400/30 border-t-purple-400 rounded-full animate-spin"></div></div>}>
            <SoulJourneyExplorer />
          </Suspense>
        );
      case 'timeline':
        return (
          <Suspense fallback={<div className="py-12 flex items-center justify-center"><div className="w-8 h-8 border-4 border-purple-400/30 border-t-purple-400 rounded-full animate-spin"></div></div>}>
            <DivineTimelineExplorer />
          </Suspense>
        );
      case 'circles':
        return (
          <Suspense fallback={<div className="py-12 flex items-center justify-center"><div className="w-8 h-8 border-4 border-purple-400/30 border-t-purple-400 rounded-full animate-spin"></div></div>}>
            <SacredCircle />
          </Suspense>
        );
      case 'events':
        return (
          <Suspense fallback={<div className="py-12 flex items-center justify-center"><div className="w-8 h-8 border-4 border-purple-400/30 border-t-purple-400 rounded-full animate-spin"></div></div>}>
            <EventsPage />
          </Suspense>
        );
      case 'field':
        return (
          <AdminAccessControl fallbackComponent={
            <ChakraAwareCard className="p-6 text-center">
              <ShieldAlert className="w-16 h-16 mx-auto mb-4 text-red-400 opacity-50" />
              <h2 className="text-xl font-bold text-white mb-2">Admin Access Required</h2>
              <p className="text-gray-300 mb-4">
                The Akashic Field Monitor is restricted to system administrators only.
              </p>
            </ChakraAwareCard>
          }>
            <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
              <div className="xl:col-span-2">
                <EventStream className="h-full" />
              </div>
              <div>
                <ConsciousnessMonitor moduleManager={moduleManager} className="h-full" />
              </div>
            </div>
          </AdminAccessControl>
        );
      case 'consciousness':
        return (
          <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
            <ConsciousnessMonitor moduleManager={moduleManager} className="h-full" />
            <div className="space-y-6">
              <ChakraAwareCard className="p-6">
                <h3 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
                  <Brain className="w-5 h-5 text-purple-400" />
                  Consciousness Expansion Tools
                </h3>

                <div className="space-y-4">
                  <ChakraAwareButton
                    variant="outline"
                    className="w-full p-4 text-left"
                    icon={<Eye className="w-5 h-5 text-indigo-400" />}
                  >
                    <div>
                      <h4 className="font-medium text-white">Third Eye Activation</h4>
                      <p className="text-sm text-gray-400">741Hz frequency meditation</p>
                    </div>
                  </ChakraAwareButton>

                  <ChakraAwareButton
                    variant="outline"
                    className="w-full p-4 text-left"
                    icon={<Heart className="w-5 h-5 text-green-400" />}
                  >
                    <div>
                      <h4 className="font-medium text-white">Heart Coherence</h4>
                      <p className="text-sm text-gray-400">528Hz love frequency</p>
                    </div>
                  </ChakraAwareButton>

                  <ChakraAwareButton
                    variant="outline"
                    className="w-full p-4 text-left"
                    icon={<Crown className="w-5 h-5 text-purple-400" />}
                  >
                    <div>
                      <h4 className="font-medium text-white">Crown Opening</h4>
                      <p className="text-sm text-gray-400">963Hz divine connection</p>
                    </div>
                  </ChakraAwareButton>
                </div>
              </ChakraAwareCard>

              {loadedModuleComponent && (
                <ChakraAwareCard className="p-6">
                  <h3 className="text-xl font-bold text-white mb-4">Active Module Interface</h3>
                  {React.createElement(loadedModuleComponent)}
                </ChakraAwareCard>
              )}
            </div>
          </div>
        );
      case 'marketplace':
        return (
          <Suspense fallback={<div className="py-12 flex items-center justify-center"><div className="w-8 h-8 border-4 border-purple-400/30 border-t-purple-400 rounded-full animate-spin"></div></div>}>
            <ModuleMarketplace />
          </Suspense>
        );
      case 'developer':
        return (
          <AdminAccessControl fallbackComponent={
            <ChakraAwareCard className="p-6 text-center">
              <ShieldAlert className="w-16 h-16 mx-auto mb-4 text-red-400 opacity-50" />
              <h2 className="text-xl font-bold text-white mb-2">Admin Access Required</h2>
              <p className="text-gray-300 mb-4">
                The Developer Tools are restricted to system administrators only.
              </p>
            </ChakraAwareCard>
          }>
            <Suspense fallback={<div className="py-12 flex items-center justify-center"><div className="w-8 h-8 border-4 border-purple-400/30 border-t-purple-400 rounded-full animate-spin"></div></div>}>
              <ModuleDeveloperKit />
            </Suspense>
          </AdminAccessControl>
        );
      case 'analytics':
        return (
          <AdminAccessControl fallbackComponent={
            <ChakraAwareCard className="p-6 text-center">
              <ShieldAlert className="w-16 h-16 mx-auto mb-4 text-red-400 opacity-50" />
              <h2 className="text-xl font-bold text-white mb-2">Admin Access Required</h2>
              <p className="text-gray-300 mb-4">
                The Analytics module is restricted to system administrators only.
              </p>
            </ChakraAwareCard>
          }>
            <Suspense fallback={<div className="py-12 flex items-center justify-center"><div className="w-8 h-8 border-4 border-purple-400/30 border-t-purple-400 rounded-full animate-spin"></div></div>}>
              <ModuleAnalytics />
            </Suspense>
          </AdminAccessControl>
        );
      case 'shared-intentions':
        return (
          <motion.div
            key="shared-intentions"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.3 }}
          >
            <SharedIntentionsManager />
          </motion.div>
        );
      case 'journey':
        return (
          <ChakraAwareCard className="p-8 text-center">
            <Crown className="w-16 h-16 mx-auto mb-6 text-amber-400" />
            <h2 className="text-3xl font-bold text-white mb-4">Soul Journey Module</h2>
            <p className="text-purple-300 mb-8 max-w-2xl mx-auto">
              Your personal journey of soul remembrance and divine purpose discovery.
              This sacred space will guide you through archetypal activations and wisdom integration.
            </p>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <ChakraAwareCard className="p-6">
                <Star className="w-8 h-8 mx-auto mb-4 text-amber-400" />
                <h3 className="text-lg font-bold text-white mb-2">Tarot Guidance</h3>
                <p className="text-gray-400 text-sm">Receive divine guidance through sacred archetypal wisdom</p>
              </ChakraAwareCard>

              <ChakraAwareCard className="p-6">
                <Compass className="w-8 h-8 mx-auto mb-4 text-cyan-400" />
                <h3 className="text-lg font-bold text-white mb-2">Purpose Discovery</h3>
                <p className="text-gray-400 text-sm">Uncover your soul's mission and divine calling</p>
              </ChakraAwareCard>

              <ChakraAwareCard className="p-6">
                <Target className="w-8 h-8 mx-auto mb-4 text-green-400" />
                <h3 className="text-lg font-bold text-white mb-2">Sacred Practices</h3>
                <p className="text-gray-400 text-sm">Integrate daily rituals aligned with your path</p>
              </ChakraAwareCard>
            </div>

            <ChakraAwareButton
              onClick={() => handleIntentionSelect(spiritualIntentions.find(i => i.id === 'soul-remembrance')!)}
              className="mt-8 px-8 py-4 font-bold"
              icon={<Sparkles className="w-5 h-5" />}
            >
              Begin Soul Quest
            </ChakraAwareButton>
          </ChakraAwareCard>
        );
      default:
        return renderLandingPage();
    }
  };

  const navigationItems = [
    { id: 'overview', label: 'Sacred Overview', icon: Compass, adminOnly: false },
    { id: 'circles', label: 'Soul Circles', icon: Users, adminOnly: false },
    { id: 'events', label: 'Sacred Events', icon: Calendar, adminOnly: false },
    { id: 'consciousness', label: 'Inner Journey', icon: Brain, adminOnly: false },
    { id: 'field', label: 'Akashic Field', icon: Activity, adminOnly: true },
    { id: 'journey', label: 'Soul Quest', icon: Star, adminOnly: false },
    { id: 'soul-journey', label: 'Frequency Journey', icon: Music, adminOnly: false },
    { id: 'timeline', label: 'Divine Timeline', icon: Map, adminOnly: false },
    { id: 'shared-intentions', label: 'Shared Matrix', icon: Network, adminOnly: false },
    { id: 'marketplace', label: 'Module Store', icon: Store, adminOnly: false },
    { id: 'developer', label: 'Developer Tools', icon: Code, adminOnly: true },
    { id: 'analytics', label: 'Analytics', icon: BarChart, adminOnly: true },
    { id: 'blueprint', label: 'Soul Blueprint', icon: Sparkles, adminOnly: false }
  ];

  const renderLandingPage = () => {
    return (
      <div className="text-center mb-12 px-4">
        {/* Welcome Section */}
        <div className="mb-8">
          <motion.img
            src="/LogoClean.png"
            alt="Sacred Shifter"
            className="w-84 h-84 mx-auto invert"
            initial={{ y: 0 }}
            animate={{ y: [0, -15, 0, 15, 0] }}
            transition={{
              duration: 5,
              repeat: Infinity,
              repeatType: "mirror",
              ease: "easeInOut"
            }}
          />

          <h1 className="text-4xl font-bold mt-6 bg-gradient-to-r from-white via-purple-200 to-cyan-200 bg-clip-text text-transparent">
            Sanctum Dashboard
          </h1>

          <p className="text-xl text-purple-300 mt-2 mb-4">
            Your Divine Interface for Consciousness Evolution
          </p>

          <div className="text-sm text-gray-400 tracking-wide italic">
            Choose your sacred path, awakened soul 🌌
          </div>
        </div>

        {/* User Name Input */}
        <div className="max-w-sm mx-auto mb-8">
          <input
            type="text"
            value={userName}
            onChange={(e) => setUserName(e.target.value)}
            placeholder="What shall we call you, beautiful soul?"
            className="w-full p-3 bg-slate-800/50 backdrop-blur-sm text-white rounded-lg border border-purple-500/30 focus:border-purple-400 focus:outline-none text-center"
          />
        </div>

        {showAuraGuidancePanel && (
          <div className="mb-8">
            <AuraGuidancePanel
              userId={user?.id || ''}
              isNewUser={!onboardingCompleted}
              soulState={soulState}
              userConsent={userConsent || { allowGuidanceSuggestions: true }}
              onNavigateToView={setActiveView}
              onDismiss={() => setShowAuraGuidancePanel(false)}
            />
          </div>
        )}

        {/* Sacred Spheres (Spiritual Intentions) Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-6 mb-8">
          {spiritualIntentions
            .filter(intention => !['module-analytics', 'developer-tools'].includes(intention.id) || isAdmin)
            .map((intention) => {
              const IntentionIcon = intention.icon;
              return (
                <ChakraAwareCard
                  key={intention.id}
                  onClick={() => handleIntentionSelect(intention)}
                  className="group relative overflow-hidden p-6 rounded-2xl cursor-pointer transition-all duration-500 hover:scale-102"
                  chakraType={intention.chakra as any} // Ensure ChakraAwareCard knows which chakra color to use
                  glowOnHover={true}
                >
                  {/* Dynamic background gradient reflecting intention color */}
                  <div className={`absolute inset-0 bg-gradient-to-br ${intention.color} opacity-30 group-hover:opacity-60 transition-opacity duration-300 rounded-2xl`}></div>

                  {/* Pulsating border effect on hover */}
                  <div className="absolute inset-0 rounded-2xl border border-white/5 group-hover:border-white/20 transition-all duration-700 group-hover:animate-pulse-slow"></div>

                  <div className="relative z-10 text-left">
                    <div className="flex items-center gap-3 mb-4">
                      <IntentionIcon className="w-8 h-8 text-white drop-shadow-lg" />
                      <h3 className="text-xl font-bold text-white drop-shadow-lg">{intention.title}</h3>
                    </div>

                    <p className="text-white/90 mb-4 leading-relaxed text-sm">
                      {intention.description}
                    </p>

                    <div className="grid grid-cols-2 gap-2 text-sm">
                      <div className="bg-white/10 backdrop-blur-sm rounded-lg p-2 text-center border border-white/5">
                        <div className="text-white/70">Frequency</div>
                        <div className="text-white font-bold">{intention.frequency} Hz</div>
                      </div>
                      <div className="bg-white/10 backdrop-blur-sm rounded-lg p-2 text-center border border-white/5">
                        <div className="text-white/70">Chakra</div>
                        <div className="text-white font-bold text-xs capitalize">{intention.chakra.replace('-', ' ')}</div>
                      </div>
                    </div>
                  </div>
                </ChakraAwareCard>
              );
            })}
        </div>

        {/* Loading State */}
        {isLoading && (
          <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center rounded-xl z-20"> {/* Increased z-index */}
            <div className="text-center">
              <div className="relative">
                <div className="w-16 h-16 border-4 border-purple-400/30 border-t-purple-400 rounded-full animate-spin"></div>
                <div className="absolute inset-0 w-16 h-16 border-4 border-cyan-400/20 border-b-cyan-400 rounded-full animate-spin mx-auto" style={{ animationDirection: 'reverse', animationDuration: '1.5s' }}></div>
              </div>
              <p className="text-purple-300 mt-4">Aligning with your sacred intention...</p>
              <p className="text-purple-400/70 text-sm mt-2">Opening cosmic channels...</p>
            </div>
          </div>
        )}

        {/* Akashic Veil Quick Access Panel (NEW) */}
        <ChakraAwareCard className="p-6 mt-8">
          <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
            <Layers className="w-5 h-5 text-cyan-400" />
            Akashic Veils (Quick Access)
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <ChakraAwareButton
              onClick={() => console.log("Celestial Map Clicked - Trigger Modal/Navigation")} // Placeholder action
              variant="outline"
              className="p-4 text-center group"
              icon={<Globe className="w-6 h-6 text-indigo-400 group-hover:text-indigo-300" />}
            >
              <div className="text-sm font-medium">Celestial Map</div>
              <div className="text-xs text-gray-400">Cosmic Overview</div>
            </ChakraAwareButton>

            <ChakraAwareButton
              onClick={() => console.log("System's Pulse Clicked - Trigger Modal/Navigation")} // Placeholder action
              variant="outline"
              className="p-4 text-center group"
              icon={<Cpu className="w-6 h-6 text-rose-400 group-hover:text-rose-300" />}
            >
              <div className="text-sm font-medium">System's Pulse</div>
              <div className="text-xs text-gray-400">Energetic Flow</div>
            </ChakraAwareButton>

            <ChakraAwareButton
              onClick={() => console.log("Weaver's Loom Clicked - Trigger Modal/Navigation")} // Placeholder action
              variant="outline"
              className="p-4 text-center group"
              icon={<Layers className="w-6 h-6 text-green-400 group-hover:text-green-300" />}
            >
              <div className="text-sm font-medium">Weaver's Loom</div>
              <div className="text-xs text-gray-400">Reality Manifestation</div>
            </ChakraAwareButton>
          </div>
        </ChakraAwareCard>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-gradient-to-r from-purple-900/10 via-purple-900/40 to-slate-900 relative overflow-hidden">
      <Header isUserMode={true} onToggleMode={onToggleAdminMode} isAdmin={isAdmin} />
      <div className="absolute inset-0 z-0">
        {activeView === 'soul-journey' && (
          <ConsciousnessVisualizer
            intention="healing-frequencies"
            frequency={528}
            intensity={0.6}
          />
        )}
        {activeView === 'blueprint' && (
          <ConsciousnessVisualizer
            intention="soul-blueprinting"
            frequency={639}
            intensity={0.6}
          />
        )}
        {activeView === 'timeline' && (
          <ConsciousnessVisualizer
            intention="soul-remembrance"
            frequency={852}
            intensity={0.5}
          />
        )}
        {activeView === 'circles' && (
          <ConsciousnessVisualizer
            intention="sacred-community"
            frequency={528}
            intensity={0.4}
          />
        )}
        {activeView === 'events' && (
          <ConsciousnessVisualizer
            intention="sacred-events"
            frequency={741}
            intensity={0.4}
          />
        )}
        {activeView === 'field' && (
          <ConsciousnessVisualizer
            intention="field-awareness"
            frequency={528}
            intensity={0.5}
          />
        )}
        {activeView === 'marketplace' && (
          <ConsciousnessVisualizer
            intention="module-marketplace"
            frequency={528}
            intensity={0.4}
          />
        )}
        {activeView === 'developer' && (
          <ConsciousnessVisualizer
            intention="developer-tools"
            frequency={852}
            intensity={0.4}
          />
        )}
        {activeView === 'analytics' && (
          <ConsciousnessVisualizer
            intention="module-analytics"
            frequency={417}
            intensity={0.4}
          />
        )}
        {activeView === 'shared-intentions' && (
          <ConsciousnessVisualizer
            intention="shared-intentionality-matrix"
            frequency={639}
            intensity={0.5}
          />
        )}
      </div>

      <main className="container mx-auto px-6 py-8 relative z-10">
        {renderNavigation()}
        {renderSystemStatus()}
        <AnimatePresence mode="wait">
          <motion.div
            key={activeView}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.3 }}
          >
            {renderModuleView()}
          </motion.div>
        </AnimatePresence>
      </main>

      <PHREOverlay />
      <Footer />
    </div>
  );
};

export default UserDashboard;