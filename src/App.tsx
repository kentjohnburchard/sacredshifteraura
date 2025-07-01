import React, { useState, useEffect } from 'react';
import Header from './components/Header';
import EventStream from './components/EventStream';
import ModuleOrchestrator from './components/ModuleOrchestrator';
import ConsciousnessMonitor from './components/ConsciousnessMonitor';
import UserDashboard from './components/UserDashboard';
import { ModuleTogglePanel } from './components/ModuleTogglePanel';
import { SystemIntegrityMonitor } from './components/SystemIntegrityMonitor';
import { SystemMetricsPanel } from './components/SystemMetricsPanel';
import { ModuleManager } from './services/ModuleManager';
import { GlobalEventHorizon } from './services/GlobalEventHorizon';
import { MetricsCollector } from './services/MetricsCollector';
import { SystemIntegrityService } from './services/SystemIntegrityService';
import { ConsciousnessOptimizer } from './services/ConsciousnessOptimizer';
import { EventBus } from './services/EventBus';
import { AuthProvider } from './contexts/AuthContext';
import { ChakraProvider } from './contexts/ChakraContext';
import { XPProvider } from './contexts/XPProvider';
import { SacredCircleProvider } from './contexts/SacredCircleContext';
import { AuthWrapper } from './components/AuthWrapper';
import { AdminAccessControl } from './components/AdminAccessControl';
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
  Lock
} from 'lucide-react';

function App() {
  // Core system services
  const [moduleManager] = useState(() => new ModuleManager());
  const [geh] = useState(() => GlobalEventHorizon.getInstance());
  const [eventBus] = useState(() => EventBus.getInstance());
  const [metricsCollector] = useState(() => MetricsCollector.getInstance());
  const [integrityService] = useState(() => SystemIntegrityService.getInstance());
  const [optimizer] = useState(() => ConsciousnessOptimizer.getInstance(moduleManager));
  
  const [activeTab, setActiveTab] = useState<'orchestration' | 'consciousness' | 'events' | 'circle' | 'toggle' | 'marketplace' | 'developer' | 'analytics' | 'integrity' | 'metrics'>('orchestration');
  const [isUserMode, setIsUserMode] = useState(true); // Default to user mode
  
  // Dynamic component loading states
  const [circleComponent, setCircleComponent] = useState<React.ComponentType | null>(null);
  const [eventsComponent, setEventsComponent] = useState<React.ComponentType | null>(null);
  const [marketplaceComponent, setMarketplaceComponent] = useState<React.ComponentType | null>(null);
  const [developerComponent, setDeveloperComponent] = useState<React.ComponentType | null>(null);
  const [analyticsComponent, setAnalyticsComponent] = useState<React.ComponentType | null>(null);
  const [isLoadingComponents, setIsLoadingComponents] = useState(false);

  useEffect(() => {
    // Initialize core system services
    metricsCollector.start();
    integrityService.start();
    optimizer.start();
    
    // Initialize OS with default consciousness expansion Telos
    const initializeOS = async () => {
      // Publish system startup event via EventBus for better type safety
      eventBus.publish(
        'os:system:startup',
        'SACRED_SHIFTER_CORE',
        { 
          version: '1.0.0', 
          mode: 'consciousness_evolution_mode' 
        },
        ['system:core', 'consciousness:awakening', 'os:initialization', 'sacred:shifter'],
        { startup_time: Date.now() }
      );

      // Set initial user state to trigger Telos selection
      moduleManager.setOSUserState({
        id: 'system-init',
        name: 'Sacred Shifter Initialization',
        currentContext: 'startup',
        essenceLabels: ['consciousness:expansion', 'awareness:heightened', 'user:transcendence', 'soul:awakening']
      });

      // Simulate some background spiritual activity
      const activityInterval = setInterval(() => {
        const activities = [
          { type: 'module:heartbeat', source: 'com.metaphysical-os.modules.authentication', labels: ['system:health', 'module:active', 'consciousness:pulse'] },
          { type: 'data:operation', source: 'com.metaphysical-os.modules.data-harmonizer', labels: ['data:flow', 'processing:harmonic', 'frequency:alignment'] },
          { type: 'user:action', source: 'com.metaphysical-os.modules.sacred-circle', labels: ['user:interaction', 'community:resonance', 'soul:connection'] }
        ];

        const activity = activities[Math.floor(Math.random() * activities.length)];
        eventBus.publish(
          activity.type,
          activity.source,
          { simulated: true, sacred_shifter: true },
          activity.labels,
          { background_activity: true }
        );
      }, 3000 + Math.random() * 2000); // Random interval between 3-5 seconds

      return () => clearInterval(activityInterval);
    };

    const cleanup = initializeOS();
    
    return () => {
      cleanup.then(fn => fn && fn());
      metricsCollector.stop();
      integrityService.stop();
      optimizer.stop();
    };
  }, [moduleManager, geh, eventBus, metricsCollector, integrityService, optimizer]);

  // Dynamic component loading for admin tabs
  useEffect(() => {
    if (!isUserMode && (activeTab === 'circle' || activeTab === 'events' || activeTab === 'marketplace' || activeTab === 'developer' || activeTab === 'analytics')) {
      const loadComponent = async () => {
        setIsLoadingComponents(true);
        
        try {
          if (activeTab === 'circle') {
            const module = await moduleManager.ensureModuleWithCapability('social-interaction');
            if (module) {
              const exposedItems = module.getExposedItems();
              if (exposedItems.Component && typeof exposedItems.Component === 'function') {
                const ComponentFunction = exposedItems.Component();
                setCircleComponent(() => ComponentFunction);
              }
            }
          } else if (activeTab === 'events') {
            const module = await moduleManager.ensureModuleWithCapability('event-management');
            if (module) {
              const exposedItems = module.getExposedItems();
              if (exposedItems.Component && typeof exposedItems.Component === 'function') {
                const ComponentFunction = exposedItems.Component();
                setEventsComponent(() => ComponentFunction);
              }
            }
          } else if (activeTab === 'marketplace') {
            // Import the marketplace component
            const { ModuleMarketplace } = await import('./components/marketplace');
            setMarketplaceComponent(() => ModuleMarketplace);
          } else if (activeTab === 'developer') {
            // Import the developer component
            const { ModuleDeveloperKit } = await import('./components/developer');
            setDeveloperComponent(() => ModuleDeveloperKit);
          } else if (activeTab === 'analytics') {
            // Import the analytics component
            const { ModuleAnalytics } = await import('./components/developer');
            setAnalyticsComponent(() => ModuleAnalytics);
          }
        } catch (error) {
          console.error('Failed to load dynamic component:', error);
        } finally {
          setIsLoadingComponents(false);
        }
      };

      loadComponent();
    }
  }, [activeTab, isUserMode, moduleManager]);

  const tabs = [
    { id: 'orchestration', label: 'Module Orchestration', icon: Activity, adminOnly: false },
    { id: 'consciousness', label: 'Self-Reflection', icon: Eye, adminOnly: false },
    { id: 'events', label: 'Event Horizon', icon: Zap, adminOnly: false },
    { id: 'circle', label: 'Sacred Circle', icon: Users, adminOnly: false },
    { id: 'marketplace', label: 'Module Store', icon: Store, adminOnly: false },
    { id: 'developer', label: 'Developer Tools', icon: Code, adminOnly: true },
    { id: 'analytics', label: 'Analytics', icon: BarChart, adminOnly: true },
    { id: 'integrity', label: 'System Integrity', icon: Shield, adminOnly: true },
    { id: 'metrics', label: 'Performance Metrics', icon: Gauge, adminOnly: true },
    { id: 'toggle', label: 'Module Control', icon: Settings, adminOnly: true }
  ];

  const renderModuleLockedFallback = (moduleType: string) => (
    <div className="bg-slate-900/50 rounded-xl border border-purple-500/20 p-8 text-center">
      <div className="w-16 h-16 bg-red-600/20 rounded-full mx-auto mb-4 flex items-center justify-center">
        <Zap className="w-8 h-8 text-red-400" />
      </div>
      <h3 className="text-lg font-semibold text-white mb-2">Module Unavailable</h3>
      <p className="text-gray-400 mb-4">
        The {moduleType} module is currently disabled or not loaded.
      </p>
      <p className="text-sm text-purple-300">
        Check the Module Control panel to enable the required modules.
      </p>
    </div>
  );

  const renderAdminAccessDenied = (moduleType: string) => (
    <div className="bg-slate-900/50 rounded-xl border border-red-500/20 p-8 text-center">
      <div className="w-16 h-16 bg-red-600/20 rounded-full mx-auto mb-4 flex items-center justify-center">
        <ShieldAlert className="w-8 h-8 text-red-400" />
      </div>
      <h3 className="text-lg font-semibold text-white mb-2">Admin Access Required</h3>
      <p className="text-gray-400 mb-4">
        The {moduleType} module is restricted to system administrators only.
      </p>
      <p className="text-sm text-amber-300">
        <Lock className="w-4 h-4 inline-block mr-1" />
        Please contact an administrator for access.
      </p>
    </div>
  );

  return (
    <AuthProvider>
      <ChakraProvider>
        <XPProvider>
          <SacredCircleProvider>
            <AuthWrapper>
              <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900/20 to-slate-900">
                <Header isUserMode={isUserMode} onToggleMode={() => setIsUserMode(!isUserMode)} />
                
                {isUserMode ? (
                  <UserDashboard moduleManager={moduleManager} />
                ) : (
                  <main className="container mx-auto px-6 py-8">
                    {/* Admin Tab Navigation */}
                    <div className="flex justify-center mb-8">
                      <div className="bg-slate-900/50 rounded-xl p-2 border border-purple-500/20 overflow-x-auto">
                        <div className="flex">
                          {tabs.map((tab) => {
                            const Icon = tab.icon;
                            const tabButton = (
                              <button
                                key={tab.id}
                                onClick={() => setActiveTab(tab.id as any)}
                                className={`px-6 py-3 rounded-lg font-medium transition-all duration-200 flex items-center gap-2 whitespace-nowrap ${
                                  activeTab === tab.id
                                    ? 'bg-purple-600 text-white shadow-lg shadow-purple-600/25'
                                    : 'text-gray-400 hover:text-white hover:bg-slate-800/50'
                                }`}
                              >
                                <Icon className="w-4 h-4" />
                                {tab.label}
                                {tab.adminOnly && <Lock className="w-3 h-3 ml-1 text-amber-400" />}
                              </button>
                            );
                            
                            return tab.adminOnly ? (
                              <AdminAccessControl key={tab.id}>
                                {tabButton}
                              </AdminAccessControl>
                            ) : tabButton;
                          })}
                        </div>
                      </div>
                    </div>

                    {/* Admin Tab Content */}
                    <div className="space-y-8">
                      {activeTab === 'orchestration' && (
                        <div className="space-y-8">
                          <ModuleOrchestrator moduleManager={moduleManager} />
                          
                          <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
                            <div className="xl:col-span-2">
                              <EventStream className="h-full" />
                            </div>
                            <div>
                              <ConsciousnessMonitor moduleManager={moduleManager} className="h-full" />
                            </div>
                          </div>
                        </div>
                      )}

                      {activeTab === 'consciousness' && (
                        <div className="grid grid-cols-1 xl:grid-cols-2 gap-8">
                          <ConsciousnessMonitor moduleManager={moduleManager} className="h-full" />
                          <EventStream className="h-full" />
                        </div>
                      )}

                      {activeTab === 'events' && (
                        <div className="grid grid-cols-1 gap-8">
                          <EventStream className="h-full" />
                          
                          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                            <ModuleOrchestrator moduleManager={moduleManager} />
                            <ConsciousnessMonitor moduleManager={moduleManager} />
                          </div>
                        </div>
                      )}

                      {activeTab === 'circle' && (
                        <div>
                          {isLoadingComponents ? (
                            <div className="bg-slate-900/50 rounded-xl border border-purple-500/20 p-8 text-center">
                              <div className="w-16 h-16 border-4 border-purple-400/30 border-t-purple-400 rounded-full animate-spin mx-auto mb-4"></div>
                              <p className="text-purple-300">Loading Sacred Circle...</p>
                            </div>
                          ) : circleComponent ? (
                            React.createElement(circleComponent)
                          ) : (
                            renderModuleLockedFallback('Sacred Circle')
                          )}
                        </div>
                      )}

                      {activeTab === 'marketplace' && (
                        <div>
                          {isLoadingComponents ? (
                            <div className="bg-slate-900/50 rounded-xl border border-purple-500/20 p-8 text-center">
                              <div className="w-16 h-16 border-4 border-purple-400/30 border-t-purple-400 rounded-full animate-spin mx-auto mb-4"></div>
                              <p className="text-purple-300">Loading Module Marketplace...</p>
                            </div>
                          ) : marketplaceComponent ? (
                            React.createElement(marketplaceComponent)
                          ) : (
                            renderModuleLockedFallback('Module Marketplace')
                          )}
                        </div>
                      )}

                      {activeTab === 'developer' && (
                        <AdminAccessControl fallbackComponent={renderAdminAccessDenied('Developer Tools')}>
                          <div>
                            {isLoadingComponents ? (
                              <div className="bg-slate-900/50 rounded-xl border border-purple-500/20 p-8 text-center">
                                <div className="w-16 h-16 border-4 border-purple-400/30 border-t-purple-400 rounded-full animate-spin mx-auto mb-4"></div>
                                <p className="text-purple-300">Loading Developer Tools...</p>
                              </div>
                            ) : developerComponent ? (
                              React.createElement(developerComponent)
                            ) : (
                              renderModuleLockedFallback('Developer Tools')
                            )}
                          </div>
                        </AdminAccessControl>
                      )}

                      {activeTab === 'analytics' && (
                        <AdminAccessControl fallbackComponent={renderAdminAccessDenied('Analytics')}>
                          <div>
                            {isLoadingComponents ? (
                              <div className="bg-slate-900/50 rounded-xl border border-purple-500/20 p-8 text-center">
                                <div className="w-16 h-16 border-4 border-purple-400/30 border-t-purple-400 rounded-full animate-spin mx-auto mb-4"></div>
                                <p className="text-purple-300">Loading Analytics...</p>
                              </div>
                            ) : analyticsComponent ? (
                              React.createElement(analyticsComponent)
                            ) : (
                              renderModuleLockedFallback('Analytics')
                            )}
                          </div>
                        </AdminAccessControl>
                      )}

                      {activeTab === 'integrity' && (
                        <AdminAccessControl fallbackComponent={renderAdminAccessDenied('System Integrity')}>
                          <div className="grid grid-cols-1 gap-8">
                            <SystemIntegrityMonitor />
                          </div>
                        </AdminAccessControl>
                      )}

                      {activeTab === 'metrics' && (
                        <AdminAccessControl fallbackComponent={renderAdminAccessDenied('Performance Metrics')}>
                          <div className="grid grid-cols-1 gap-8">
                            <SystemMetricsPanel />
                          </div>
                        </AdminAccessControl>
                      )}

                      {activeTab === 'toggle' && (
                        <AdminAccessControl fallbackComponent={renderAdminAccessDenied('Module Control')}>
                          <ModuleTogglePanel />
                        </AdminAccessControl>
                      )}
                    </div>

                    {/* Sacred Geometry Background Elements */}
                    <div className="fixed inset-0 pointer-events-none overflow-hidden">
                      <div className="absolute top-1/4 left-1/4 w-64 h-64 border border-purple-500/10 rounded-full animate-spin-slow"></div>
                      <div className="absolute bottom-1/4 right-1/4 w-48 h-48 border border-cyan-500/10 rotate-45 animate-pulse"></div>
                      <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-96 h-96 border border-amber-500/5 rounded-full"></div>
                    </div>
                  </main>
                )}
              </div>
            </AuthWrapper>
          </SacredCircleProvider>
        </XPProvider>
      </ChakraProvider>
    </AuthProvider>
  );
}

export default App;