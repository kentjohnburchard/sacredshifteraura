import React, { useState, useEffect, Suspense } from 'react';
import { ModuleManager } from '../services/ModuleManager';
import { ModuleRegistry } from '../services/ModuleRegistry';
import { OSTelos } from '../types';
import { HelpButton } from './HelpButton';
import { AdminAccessControl } from './AdminAccessControl';
import { useAuth } from '../contexts/AuthContext';
import ConsciousnessVisualizer from './ConsciousnessVisualizer';
import ConsciousnessMonitor from './ConsciousnessMonitor';
import EventStream from './EventStream';
import { Heart, Eye, Compass, Star, Mountain, Waves, Sun, Moon, Users, Sparkles, Crown, Flower2, Target, Calendar, Activity, Brain, Zap, MessageCircle, Store, Code, BarChart, Music, Map, ShieldAlert, Lock, Code as Nodes } from 'lucide-react';

// Import the various module components using React.lazy
const SoulBlueprintEditor = React.lazy(() => import('../modules/SoulBlueprinting/components/SoulBlueprintEditor').then(module => ({ default: module.SoulBlueprintEditor })));
const SoulJourneyExplorer = React.lazy(() => import('../modules/SoulJourney/components/SoulJourneyExplorer').then(module => ({ default: module.SoulJourneyExplorer })));
const DivineTimelineExplorer = React.lazy(() => import('../modules/DivineTimeline/components/DivineTimelineExplorer').then(module => ({ default: module.DivineTimelineExplorer })));
const SacredCircle = React.lazy(() => import('../modules/SacredCircle/components/SacredCircle').then(module => ({ default: module.SacredCircle })));
const EventsPage = React.lazy(() => import('./EventsPage').then(module => ({ default: module.EventsPage })));
const ModuleMarketplace = React.lazy(() => import('./marketplace/ModuleMarketplace').then(module => ({ default: module.ModuleMarketplace })));
const ModuleDeveloperKit = React.lazy(() => import('./developer/ModuleDeveloperKit').then(module => ({ default: module.ModuleDeveloperKit })));
const ModuleAnalytics = React.lazy(() => import('./developer/ModuleAnalytics').then(module => ({ default: module.ModuleAnalytics })));
const UnityEngineExplorer = React.lazy(() => import('../modules/UnityEngine/components/UnityEngineExplorer').then(module => ({ default: module.UnityEngineExplorer })));

interface UserDashboardProps {
  moduleManager: ModuleManager;
}

type DashboardView = 'overview' | 'circles' | 'events' | 'consciousness' | 'field' | 'journey' | 'marketplace' | 'developer' | 'analytics' | 'blueprint' | 'soul-journey' | 'timeline' | 'unity-engine';

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

const UserDashboard: React.FC<UserDashboardProps> = ({ moduleManager }) => {
  const { user } = useAuth();
  const [registry] = useState(() => new ModuleRegistry());
  const [activeView, setActiveView] = useState<DashboardView>('overview');
  const [selectedIntention, setSelectedIntention] = useState<SpiritualIntention | null>(null);
  const [loadedModuleComponent, setLoadedModuleComponent] = useState<React.ComponentType | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [userName, setUserName] = useState(user?.email?.split('@')[0] || 'Sacred Soul');
  const [osState, setOSState] = useState(moduleManager.getOSState());

  useEffect(() => {
    if (user) {
      setUserName(user.email?.split('@')[0] || 'Sacred Soul');
    }
  }, [user]);

  // Define spiritual intentions that map to actual functionality
  const spiritualIntentions: SpiritualIntention[] = [
    {
      id: 'sacred-community',
      title: 'Connect with Soul Tribe',
      description: 'Join sacred circles, share wisdom, and grow with like-minded souls',
      icon: Users,
      color: 'from-pink-500/85 to-rose-600/75',
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
      color: 'from-purple-500/85 to-indigo-600/75',
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
      color: 'from-indigo-500/85 to-blue-600/75',
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
      color: 'from-violet-500/85 to-purple-600/75',
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
      color: 'from-cyan-500/85 to-teal-600/75',
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
      color: 'from-amber-500/85 to-yellow-600/75',
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
      color: 'from-amber-500/85 to-orange-600/75',
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
      color: 'from-blue-500/85 to-cyan-600/75',
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
      color: 'from-green-500/85 to-teal-600/75',
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
      color: 'from-purple-500/85 to-pink-600/75',
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
      color: 'from-blue-500/85 to-purple-600/75',
      telosId: 'consciousness:expansion',
      capability: 'timeline-projection',
      frequency: 852,
      chakra: 'third-eye',
      view: 'timeline'
    },
    {
      id: 'unity-engine',
      title: 'Unity Engine',
      description: 'Create, connect, and visualize ideas through sacred geometry',
      icon: Nodes,
      color: 'from-teal-500/85 to-emerald-600/75',
      telosId: 'unity:collective',
      capability: 'vision-nodes',
      frequency: 639,
      chakra: 'heart',
      view: 'unity-engine'
    }
  ];

  useEffect(() => {
    const interval = setInterval(() => {
      setOSState(moduleManager.getOSState());
    }, 2000);

    return () => clearInterval(interval);
  }, [moduleManager]);

  const handleIntentionSelect = async (intention: SpiritualIntention) => {
    setSelectedIntention(intention);
    setIsLoading(true);

    // Set user state based on intention
    moduleManager.setOSUserState({
      id: 'awakened-soul',
      name: userName,
      currentContext: intention.id,
      essenceLabels: [`intention:${intention.id}`, `chakra:${intention.chakra}`, 'soul:seeking', 'consciousness:expanding']
    });

    // Set OS Telos based on intention
    const availableTelos = registry.getAllTelosOptions();
    const matchingTelos = availableTelos.find(t => t.id === intention.telosId);
    if (matchingTelos) {
      moduleManager.setOSTelos(matchingTelos);
    }

    try {
      // Load the appropriate module
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

  // Filter out admin-only views for non-admin users
  const navigationItems = [
    { id: 'overview', label: 'Sacred Overview', icon: Compass, adminOnly: false },
    { id: 'circles', label: 'Soul Circles', icon: Users, adminOnly: false },
    { id: 'events', label: 'Sacred Events', icon: Calendar, adminOnly: false },
    { id: 'consciousness', label: 'Inner Journey', icon: Brain, adminOnly: false },
    { id: 'field', label: 'Akashic Field', icon: Activity, adminOnly: false },
    { id: 'journey', label: 'Soul Quest', icon: Star, adminOnly: false },
    { id: 'soul-journey', label: 'Frequency Journey', icon: Music, adminOnly: false },
    { id: 'timeline', label: 'Divine Timeline', icon: Map, adminOnly: false },
    { id: 'unity-engine', label: 'Unity Engine', icon: Nodes, adminOnly: false },
    { id: 'marketplace', label: 'Module Store', icon: Store, adminOnly: false },
    { id: 'developer', label: 'Developer Tools', icon: Code, adminOnly: true },
    { id: 'analytics', label: 'Analytics', icon: BarChart, adminOnly: true },
    { id: 'blueprint', label: 'Soul Blueprint', icon: Sparkles, adminOnly: false }
  ];

  const renderNavigation = () => (
    <div className="bg-slate-900/50 backdrop-blur-sm rounded-xl border border-purple-500/20 p-4 mb-6">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 bg-gradient-to-br from-purple-500 to-cyan-400 rounded-lg flex items-center justify-center">
            <Sparkles className="w-5 h-5 text-white" />
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
          .filter(item => !item.adminOnly || 
            (item.adminOnly && (
              <AdminAccessControl>
                {true}
              </AdminAccessControl>
            )))
          .map((item) => {
            const Icon = item.icon;
            const isAdminItem = item.adminOnly;
            
            const button = (
              <button
                key={item.id}
                onClick={() => setActiveView(item.id as DashboardView)}
                className={`p-3 rounded-lg transition-all duration-200 flex flex-col items-center gap-1 ${
                  activeView === item.id
                    ? 'bg-purple-600 text-white shadow-lg shadow-purple-600/25'
                    : 'text-gray-400 hover:text-white hover:bg-slate-800/50'
                }`}
              >
                <Icon className="w-5 h-5" />
                <span className="text-xs font-medium">{item.label}</span>
                {isAdminItem && <Lock className="w-3 h-3 text-amber-400" />}
              </button>
            );
            
            return isAdminItem ? (
              <AdminAccessControl key={item.id}>
                {button}
              </AdminAccessControl>
            ) : button;
          })}
      </div>
    </div>
  );

  const renderSystemStatus = () => (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
      <div className="bg-slate-900/50 backdrop-blur-sm rounded-lg border border-purple-500/20 p-4">
        <div className="flex items-center gap-2 mb-2">
          <Activity className="w-4 h-4 text-green-400" />
          <span className="text-sm text-gray-400">Active Modules</span>
        </div>
        <div className="text-2xl font-bold text-white">{osState.moduleStates?.active || 0}</div>
      </div>
      
      <div className="bg-slate-900/50 backdrop-blur-sm rounded-lg border border-purple-500/20 p-4">
        <div className="flex items-center gap-2 mb-2">
          <Zap className="w-4 h-4 text-amber-400" />
          <span className="text-sm text-gray-400">Field Events</span>
        </div>
        <div className="text-2xl font-bold text-white">{osState.fieldStatistics?.totalEvents || 0}</div>
      </div>
      
      <div className="bg-slate-900/50 backdrop-blur-sm rounded-lg border border-purple-500/20 p-4">
        <div className="flex items-center gap-2 mb-2">
          <Brain className="w-4 h-4 text-purple-400" />
          <span className="text-sm text-gray-400">Consciousness</span>
        </div>
        <div className="text-2xl font-bold text-white">Expanding</div>
      </div>
      
      <div className="bg-slate-900/50 backdrop-blur-sm rounded-lg border border-purple-500/20 p-4">
        <div className="flex items-center gap-2 mb-2">
          <Heart className="w-4 h-4 text-pink-400" />
          <span className="text-sm text-gray-400">Sacred Status</span>
        </div>
        <div className="text-2xl font-bold text-white">Aligned</div>
      </div>
    </div>
  );

  // Render module views based on navigation selection
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
      case 'unity-engine':
        return (
          <Suspense fallback={<div className="py-12 flex items-center justify-center"><div className="w-8 h-8 border-4 border-purple-400/30 border-t-purple-400 rounded-full animate-spin"></div></div>}>
            <UnityEngineExplorer />
          </Suspense>
        );
      case 'field':
        return (
          <AdminAccessControl fallbackComponent={
            <div className="bg-slate-900/70 backdrop-blur-sm rounded-xl border border-red-500/20 p-6 text-center">
              <ShieldAlert className="w-16 h-16 mx-auto mb-4 text-red-400 opacity-50" />
              <h2 className="text-xl font-bold text-white mb-2">Admin Access Required</h2>
              <p className="text-gray-300 mb-4">
                The Akashic Field Monitor is restricted to system administrators only.
              </p>
            </div>
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
              <div className="bg-slate-900/70 backdrop-blur-sm rounded-xl border border-purple-500/20 p-6">
                <h3 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
                  <Brain className="w-5 h-5 text-purple-400" />
                  Consciousness Expansion Tools
                </h3>
                
                <div className="space-y-4">
                  <button className="w-full p-4 bg-slate-800/50 rounded-lg border border-purple-500/20 hover:border-purple-400 transition-all text-left">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-indigo-600 rounded-lg flex items-center justify-center">
                        <Eye className="w-5 h-5 text-white" />
                      </div>
                      <div>
                        <h4 className="font-medium text-white">Third Eye Activation</h4>
                        <p className="text-sm text-gray-400">741Hz frequency meditation</p>
                      </div>
                    </div>
                  </button>
                  
                  <button className="w-full p-4 bg-slate-800/50 rounded-lg border border-purple-500/20 hover:border-purple-400 transition-all text-left">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-gradient-to-br from-emerald-500 to-green-600 rounded-lg flex items-center justify-center">
                        <Heart className="w-5 h-5 text-white" />
                      </div>
                      <div>
                        <h4 className="font-medium text-white">Heart Coherence</h4>
                        <p className="text-sm text-gray-400">528Hz love frequency</p>
                      </div>
                    </div>
                  </button>
                  
                  <button className="w-full p-4 bg-slate-800/50 rounded-lg border border-purple-500/20 hover:border-purple-400 transition-all text-left">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-gradient-to-br from-violet-500 to-purple-600 rounded-lg flex items-center justify-center">
                        <Crown className="w-5 h-5 text-white" />
                      </div>
                      <div>
                        <h4 className="font-medium text-white">Crown Opening</h4>
                        <p className="text-sm text-gray-400">963Hz divine connection</p>
                      </div>
                    </div>
                  </button>
                </div>
              </div>
              
              {loadedModuleComponent && (
                <div className="bg-slate-900/70 backdrop-blur-sm rounded-xl border border-purple-500/20 p-6">
                  <h3 className="text-xl font-bold text-white mb-4">Active Module Interface</h3>
                  {React.createElement(loadedModuleComponent)}
                </div>
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
            <div className="bg-slate-900/70 backdrop-blur-sm rounded-xl border border-red-500/20 p-6 text-center">
              <ShieldAlert className="w-16 h-16 mx-auto mb-4 text-red-400 opacity-50" />
              <h2 className="text-xl font-bold text-white mb-2">Admin Access Required</h2>
              <p className="text-gray-300 mb-4">
                The Developer Tools are restricted to system administrators only.
              </p>
            </div>
          }>
            <Suspense fallback={<div className="py-12 flex items-center justify-center"><div className="w-8 h-8 border-4 border-purple-400/30 border-t-purple-400 rounded-full animate-spin"></div></div>}>
              <ModuleDeveloperKit />
            </Suspense>
          </AdminAccessControl>
        );
      case 'analytics':
        return (
          <AdminAccessControl fallbackComponent={
            <div className="bg-slate-900/70 backdrop-blur-sm rounded-xl border border-red-500/20 p-6 text-center">
              <ShieldAlert className="w-16 h-16 mx-auto mb-4 text-red-400 opacity-50" />
              <h2 className="text-xl font-bold text-white mb-2">Admin Access Required</h2>
              <p className="text-gray-300 mb-4">
                The Analytics module is restricted to system administrators only.
              </p>
            </div>
          }>
            <Suspense fallback={<div className="py-12 flex items-center justify-center"><div className="w-8 h-8 border-4 border-purple-400/30 border-t-purple-400 rounded-full animate-spin"></div></div>}>
              <ModuleAnalytics />
            </Suspense>
          </AdminAccessControl>
        );
      case 'journey':
        return (
          <div className="bg-slate-900/70 backdrop-blur-sm rounded-xl border border-purple-500/20 p-8 text-center">
            <Crown className="w-16 h-16 mx-auto mb-6 text-amber-400" />
            <h2 className="text-3xl font-bold text-white mb-4">Soul Journey Module</h2>
            <p className="text-purple-300 mb-8 max-w-2xl mx-auto">
              Your personal journey of soul remembrance and divine purpose discovery. 
              This sacred space will guide you through archetypal activations and wisdom integration.
            </p>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="p-6 bg-slate-800/50 rounded-lg border border-purple-500/20">
                <Star className="w-8 h-8 mx-auto mb-4 text-amber-400" />
                <h3 className="text-lg font-bold text-white mb-2">Tarot Guidance</h3>
                <p className="text-gray-400 text-sm">Receive divine guidance through sacred archetypal wisdom</p>
              </div>
              
              <div className="p-6 bg-slate-800/50 rounded-lg border border-purple-500/20">
                <Compass className="w-8 h-8 mx-auto mb-4 text-cyan-400" />
                <h3 className="text-lg font-bold text-white mb-2">Purpose Discovery</h3>
                <p className="text-gray-400 text-sm">Uncover your soul's mission and divine calling</p>
              </div>
              
              <div className="p-6 bg-slate-800/50 rounded-lg border border-purple-500/20">
                <Mountain className="w-8 h-8 mx-auto mb-4 text-green-400" />
                <h3 className="text-lg font-bold text-white mb-2">Sacred Practices</h3>
                <p className="text-gray-400 text-sm">Integrate daily rituals aligned with your path</p>
              </div>
            </div>
            
            <button
              onClick={() => handleIntentionSelect(spiritualIntentions.find(i => i.id === 'soul-remembrance')!)}
              className="mt-8 px-8 py-4 bg-gradient-to-r from-violet-600 to-purple-600 text-white font-bold rounded-xl hover:from-violet-700 hover:to-purple-700 transition-all shadow-lg shadow-purple-500/25"
            >
              Begin Soul Quest
            </button>
          </div>
        );
      default:
        return renderLandingPage();
    }
  };

  // Landing Page with Sacred Intentions
  const renderLandingPage = () => {
    return (
      <div>
        {/* Welcome Section */}
        <div className="text-center mb-8">
          <div className="mb-6">
            <img src="/LogoClean.png" alt="Sacred Shifter" className="h-24 mx-auto mb-4" />
            <h1 className="text-4xl font-bold bg-gradient-to-r from-white via-purple-200 to-cyan-200 bg-clip-text text-transparent mb-2">
              Sacred Shifter Portal
            </h1>
            <p className="text-xl text-purple-300 mb-4">
              Your Divine Interface for Consciousness Evolution
            </p>
            <div className="text-gray-400">
              Choose your sacred path, awakened soul
            </div>
          </div>

          <div className="max-w-sm mx-auto mb-8">
            <input
              type="text"
              value={userName}
              onChange={(e) => setUserName(e.target.value)}
              placeholder="What shall we call you, beautiful soul?"
              className="w-full p-3 bg-slate-800/50 backdrop-blur-sm text-white rounded-lg border border-purple-500/30 focus:border-purple-400 focus:outline-none text-center"
            />
          </div>
        </div>

        {/* Sacred Paths Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-6 mb-8">
          {spiritualIntentions
            .filter(intention => !['module-analytics', 'developer-tools'].includes(intention.id) || 
              (
                <AdminAccessControl>
                  {true}
                </AdminAccessControl>
              ))
            .map((intention) => {
              const intentionCard = (
                <div
                  key={intention.id}
                  className="group relative overflow-hidden backdrop-blur-sm p-6 rounded-2xl cursor-pointer transition-all duration-500 hover:scale-102"
                  style={{
                    background: `linear-gradient(135deg, var(--tw-gradient-from), var(--tw-gradient-to))`
                  }}
                  onClick={() => handleIntentionSelect(intention)}
                >
                  {/* Chakra-aligned glow effect on hover */}
                  <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-all duration-700 rounded-2xl bg-gradient-to-br animate-pulse-slow">
                    <div className={`absolute inset-0 bg-gradient-to-br ${intention.color} blur-md opacity-40`}></div>
                  </div>
                  
                  {/* Glassmorphism layer */}
                  <div className="absolute inset-0 backdrop-blur-[2px] bg-slate-900/10 opacity-0 group-hover:opacity-100 transition-all duration-500 rounded-2xl"></div>
                  
                  <div className="absolute top-4 right-4 z-10">
                    <intention.icon className="w-8 h-8 text-white/80" />
                  </div>
                  
                  <div className="absolute inset-0 opacity-20">
                    {Array.from({ length: 8 }, (_, i) => (
                      <div
                        key={i}
                        className="absolute w-1 h-1 bg-white rounded-full animate-pulse"
                        style={{
                          left: `${20 + (i * 10)}%`,
                          top: `${30 + (i * 5)}%`,
                          animationDelay: `${i * 0.2}s`,
                          animationDuration: `${2 + i * 0.3}s`
                        }}
                      />
                    ))}
                  </div>
                  
                  <div className="relative z-10">
                    <div className="flex items-center gap-3 mb-4">
                      <intention.icon className="w-8 h-8 text-white drop-shadow-lg" />
                      <h3 className="text-xl font-bold text-white drop-shadow-lg">{intention.title}</h3>
                    </div>
                    
                    <p className="text-white/90 mb-4 leading-relaxed drop-shadow-sm">
                      {intention.description}
                    </p>
                    
                    <div className="grid grid-cols-2 gap-2 text-sm">
                      <div className="bg-white/20 backdrop-blur-sm rounded-lg p-2 text-center">
                        <div className="text-white/70">Frequency</div>
                        <div className="text-white font-bold">{intention.frequency} Hz</div>
                      </div>
                      <div className="bg-white/20 backdrop-blur-sm rounded-lg p-2 text-center">
                        <div className="text-white/70">Chakra</div>
                        <div className="text-white font-bold text-xs capitalize">{intention.chakra}</div>
                      </div>
                    </div>
                  </div>

                  {/* Subtle gradient overlay */}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/30 to-transparent group-hover:from-black/20 transition-all duration-500 rounded-2xl"></div>
                  
                  {/* Pulsing border effect */}
                  <div className="absolute inset-0 rounded-2xl border border-white/5 group-hover:border-white/20 transition-all duration-700"></div>
                </div>
              );
              
              return ['module-analytics', 'developer-tools'].includes(intention.id) ? (
                <AdminAccessControl key={intention.id}>
                  {intentionCard}
                </AdminAccessControl>
              ) : intentionCard;
            })}
        </div>

        {/* Loading State */}
        {isLoading && (
          <div className="text-center py-12">
            <div className="relative">
              <div className="w-16 h-16 border-4 border-purple-400/30 border-t-purple-400 rounded-full animate-spin mx-auto mb-4"></div>
              <div className="absolute inset-0 w-16 h-16 border-4 border-cyan-400/20 border-b-cyan-400 rounded-full animate-spin mx-auto" style={{ animationDirection: 'reverse', animationDuration: '1.5s' }}></div>
            </div>
            <p className="text-purple-300">Aligning with your sacred intention...</p>
            <p className="text-purple-400/70 text-sm mt-2">Opening cosmic channels...</p>
          </div>
        )}

        {/* Quick Access Panel */}
        <div className="bg-slate-900/50 backdrop-blur-sm rounded-xl border border-purple-500/20 p-6">
          <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-purple-400" />
            Quick Sacred Access
          </h3>
          
          <div className="grid grid-cols-2 md:grid-cols-6 gap-4">
            <button
              onClick={() => setActiveView('circles')}
              className="p-4 bg-slate-800/50 rounded-lg border border-purple-500/20 hover:border-purple-400 transition-all text-center group"
            >
              <Users className="w-6 h-6 mx-auto mb-2 text-purple-400 group-hover:text-purple-300" />
              <div className="text-sm font-medium text-white">Soul Circles</div>
              <div className="text-xs text-gray-400">Connect & Share</div>
            </button>
            
            <button
              onClick={() => setActiveView('events')}
              className="p-4 bg-slate-800/50 rounded-lg border border-purple-500/20 hover:border-purple-400 transition-all text-center group"
            >
              <Calendar className="w-6 h-6 mx-auto mb-2 text-purple-400 group-hover:text-purple-300" />
              <div className="text-sm font-medium text-white">Sacred Events</div>
              <div className="text-xs text-gray-400">Join Ceremonies</div>
            </button>
            
            <button
              onClick={() => setActiveView('soul-journey')}
              className="p-4 bg-slate-800/50 rounded-lg border border-purple-500/20 hover:border-purple-400 transition-all text-center group"
            >
              <Music className="w-6 h-6 mx-auto mb-2 text-purple-400 group-hover:text-purple-300" />
              <div className="text-sm font-medium text-white">Soul Frequency</div>
              <div className="text-xs text-gray-400">Sacred Sound Journey</div>
            </button>
            
            <button
              onClick={() => setActiveView('blueprint')}
              className="p-4 bg-slate-800/50 rounded-lg border border-purple-500/20 hover:border-purple-400 transition-all text-center group"
            >
              <Sparkles className="w-6 h-6 mx-auto mb-2 text-purple-400 group-hover:text-purple-300" />
              <div className="text-sm font-medium text-white">Soul Blueprint</div>
              <div className="text-xs text-gray-400">Divine Essence Map</div>
            </button>
            
            <button
              onClick={() => setActiveView('timeline')}
              className="p-4 bg-slate-800/50 rounded-lg border border-purple-500/20 hover:border-purple-400 transition-all text-center group"
            >
              <Map className="w-6 h-6 mx-auto mb-2 text-purple-400 group-hover:text-purple-300" />
              <div className="text-sm font-medium text-white">Divine Timeline</div>
              <div className="text-xs text-gray-400">Future Potential</div>
            </button>
            
            <button
              onClick={() => setActiveView('unity-engine')}
              className="p-4 bg-slate-800/50 rounded-lg border border-purple-500/20 hover:border-purple-400 transition-all text-center group"
            >
              <Nodes className="w-6 h-6 mx-auto mb-2 text-purple-400 group-hover:text-purple-300" />
              <div className="text-sm font-medium text-white">Unity Engine</div>
              <div className="text-xs text-gray-400">Connect Ideas</div>
            </button>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900/20 to-slate-900 relative overflow-hidden">
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
        {activeView === 'unity-engine' && (
          <ConsciousnessVisualizer 
            intention="unity-engine"
            frequency={639}
            intensity={0.5}
          />
        )}
      </div>
      
      <main className="container mx-auto px-6 py-8 relative z-10">
        {renderNavigation()}
        {renderSystemStatus()}
        {renderModuleView()}
      </main>
    </div>
  );
};

export default UserDashboard;