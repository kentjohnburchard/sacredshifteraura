// src/App.tsx
import React, { useState, useEffect, Suspense } from 'react';
import { BrowserRouter as Router, Route, Routes, Navigate, useNavigate } from 'react-router-dom';

// Core Components
import UserDashboard from './components/UserDashboard';
import UserBenefitsPage from './components/UserBenefitsPage';
import EventStream from './components/EventStream';
import ModuleOrchestrator from './components/ModuleOrchestrator';
import ConsciousnessMonitor from './components/ConsciousnessMonitor';
import { ModuleTogglePanel } from './components/ModuleTogglePanel';
import { SystemIntegrityMonitor } from './components/SystemIntegrityMonitor';
import { SystemMetricsPanel } from './components/SystemMetricsPanel';
import { AuraGuidancePanel } from './components/AuraGuidancePanel';
import Header from './components/Header';
import Footer from './components/Footer';
import { SharedIntentionsManager } from './components/SharedIntentionsManager';

// Services
import { ModuleManager } from './services/ModuleManager';
import { GlobalEventHorizon } from './services/GlobalEventHorizon';
import { MetricsCollector } from './services/MetricsCollector';
// CORRECTED: Fixed the SystemIntegrityService import syntax
import { SystemIntegrityService } from './services/SystemIntegrityService';
import { ConsciousnessOptimizer } from './services/ConsciousnessOptimizer';
import { EventBus } from './services/EventBus';
import { PHREngine } from './services/PHREngine';
import { CodeWeavingEngine, ArchitecturalHarmonizer } from './services/self-generative-core';
import { SupabaseService } from './services/SupabaseService';

// Contexts
import { useAuth } from './contexts/AuthContext';
import { ChakraProvider } from './contexts/ChakraContext';
import { XPProvider } from './contexts/XPProvider';
import { SacredCircleProvider } from './contexts/SacredCircleContext';
import { SyncProvider } from './contexts/SyncContext';
import { RSIProvider } from './contexts/RSIContext';

// Wrappers & Overlays
import { AuthWrapper } from './components/AuthWrapper';
import { AdminAccessControl } from './components/AdminAccessControl';
import { RSIController } from './components/RSI/RSIController';
import { PHREOverlay } from './components/PHREOverlay';

// Icons
import {
  Activity, Eye, Zap, Users, Settings, Store, Code, BarChart, Shield, Gauge,
  ShieldAlert, Lock, MessageCircle, Heart, HardDrive, Cloud, Key
} from 'lucide-react';

// Hooks
import { usePresenceTracker } from './hooks/usePresenceTracker';

// Lazy-loaded Admin Components - Fixed to handle named exports properly
const ModuleMarketplace = React.lazy(() =>
  import('./components/marketplace/ModuleMarketplace').then(module => ({
    default: module.ModuleMarketplace || module.default
  }))
);
const ModuleDeveloperKit = React.lazy(() =>
  import('./components/developer/ModuleDeveloperKit').then(module => ({
    default: module.ModuleDeveloperKit || module.default
  }))
);
const ModuleAnalytics = React.lazy(() =>
  import('./components/developer/ModuleAnalytics').then(module => ({
    default: module.ModuleAnalytics || module.default
  }))
);
const SacredCircle = React.lazy(() =>
  import('./modules/SacredCircle/components/SacredCircle').then(module => ({
    default: module.SacredCircle || module.default
  }))
);
const EventsPage = React.lazy(() =>
  import('./components/EventsPage').then(module => ({
    default: module.default
  }))
);

// --- CRUCIAL FIX: Simplified the lazy import for GuardianProtocols ---
// This component uses 'export default GuardianProtocols;' so no .then() chain is needed.
const GuardianProtocols = React.lazy(() => import('./components/GuardianProtocols'));


// Protected Route Component
const ProtectedRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user, loading } = useAuth();
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-900 via-purple-900/20 to-slate-900 text-white">
        <div className="w-16 h-16 border-4 border-purple-400/30 border-t-purple-400 rounded-full animate-spin"></div>
        <p className="ml-4 text-purple-300">Authenticating...</p>
      </div>
    );
  }
  if (!user) return <Navigate to="/" replace />;
  return <>{children}</>;
};

// AppContent component: Handles application logic and routing within the Router context
const AppContent: React.FC<{
  moduleManager: ModuleManager;
  metricsCollector: MetricsCollector;
  integrityService: SystemIntegrityService;
  optimizer: ConsciousnessOptimizer;
  phrEngine: PHREngine;
  codeWeavingEngine: CodeWeavingEngine;
  architecturalHarmonizer: ArchitecturalHarmonizer;
  eventBus: EventBus;
  supabase: any; // Pass supabase client down
}> = ({
  moduleManager,
  metricsCollector,
  integrityService,
  optimizer,
  phrEngine,
  codeWeavingEngine,
  architecturalHarmonizer,
  eventBus,
  supabase, // Destructure supabase
}) => {
  const { user, isAdmin } = useAuth(); // Safely called inside Router context
  const navigate = useNavigate(); // Safely called inside Router context

  const [activeAdminTab, setActiveAdminTab] = useState<'orchestration' | 'consciousness' | 'events' | 'circle' | 'toggle' | 'marketplace' | 'developer' | 'analytics' | 'integrity' | 'metrics' | 'guardian-protocols' | 'shared-intentions'>('orchestration');

  usePresenceTracker(supabase, user?.id); // Safely called with `user` defined

  const handleToggleAdminMode = () => {
    if (isAdmin) {
      navigate('/admin');
    }
  };

  useEffect(() => {
    // Initialize and start various services
    metricsCollector.start();
    integrityService.start();
    optimizer.start();
    phrEngine.start();
    codeWeavingEngine.start();
    architecturalHarmonizer.start();

    const initializeOS = async () => {
      eventBus.publish('os:system:startup', 'SACRED_SHIFTER_CORE', { version: '1.0.0' }, ['system:core']);
      moduleManager.setOSUserState({
        id: 'system-init',
        name: 'Sacred Shifter Initialization',
        currentContext: 'startup',
        essenceLabels: ['consciousness:expansion']
      });

      // Simulate system activities
      const interval = setInterval(() => {
        const activities = [
          { type: 'module:heartbeat', source: 'com.metaphysical-os.modules.authentication', labels: ['system:health'] },
          { type: 'data:operation', source: 'com.metaphysical-os.modules.data-harmonizer', labels: ['data:flow'] },
          { type: 'user:action', source: 'com.metaphysical-os.modules.sacred-circle', labels: ['user:interaction'] }
        ];
        const activity = activities[Math.floor(Math.random() * activities.length)];
        eventBus.publish(activity.type, activity.source, { simulated: true }, activity.labels);
      }, 3000 + Math.random() * 2000);

      return () => clearInterval(interval);
    };

    const cleanup = initializeOS();

    // Cleanup function for when the component unmounts
    return () => {
      cleanup.then(fn => fn && fn()); // Ensure cleanup is called if it's a promise
      metricsCollector.stop();
      integrityService.stop();
      optimizer.stop();
      phrEngine.stop();
      codeWeavingEngine.stop();
      architecturalHarmonizer.stop();
    };
  }, []); // Empty dependency array means this effect runs once on mount and cleans up on unmount

  // Configuration for admin navigation tabs
  const adminTabs = [
    { id: 'orchestration', label: 'Module Orchestration', icon: Activity, adminOnly: false },
    { id: 'consciousness', label: 'Self-Reflection', icon: Eye, adminOnly: false },
    { id: 'events', label: 'Event Horizon', icon: Zap, adminOnly: false },
    { id: 'circle', label: 'Sacred Circle', icon: Users, adminOnly: false },
    { id: 'marketplace', label: 'Module Store', icon: Store, adminOnly: false },
    { id: 'shared-intentions', label: 'Shared Intentions', icon: Heart, adminOnly: false },
    { id: 'developer', label: 'Developer Tools', icon: Code, adminOnly: true },
    { id: 'analytics', label: 'Analytics', icon: BarChart, adminOnly: true },
    { id: 'integrity', label: 'System Integrity', icon: Shield, adminOnly: true },
    { id: 'metrics', label: 'Performance Metrics', icon: Gauge, adminOnly: true },
    { id: 'toggle', label: 'Module Control', icon: Settings, adminOnly: true },
    { id: 'guardian-protocols', label: 'Guardian Protocols', icon: Shield, adminOnly: true }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900/20 to-slate-900">
      <Routes>
        {/* New Landing Page */}
        <Route path="/" element={<UserBenefitsPage />} />

        {/* Dashboard (protected route for authenticated users) */}
        <Route path="/dashboard/*" element={
          <ProtectedRoute>
            <UserDashboard moduleManager={moduleManager} isAdmin={isAdmin} onToggleAdminMode={handleToggleAdminMode} />
            <RSIController onNavigate={(id) => setActiveAdminTab(id as any)} />
            <PHREOverlay />
          </ProtectedRoute>
        } />

        {/* Admin Panel (protected route, further restricted by AdminAccessControl) */}
        <Route path="/admin/*" element={
          <ProtectedRoute>
            <AdminAccessControl fallbackComponent={
              <div className="bg-slate-900 p-12 text-white text-center">
                <ShieldAlert className="w-8 h-8 mx-auto mb-4 text-red-400" />
                <h2 className="text-xl font-semibold mb-2">Admin Access Required</h2>
                <p>This area is restricted.</p>
              </div>
            }>
              <Header isUserMode={false} onToggleMode={() => navigate('/dashboard')} isAdmin={isAdmin} />
              <main className="container mx-auto px-6 py-8">
                {/* Admin Tabs Navigation */}
                <div className="flex gap-2 mb-6 overflow-x-auto pb-2">
                  {adminTabs.map(tab => {
                    const Icon = tab.icon;
                    // Show lock icon only if tab is adminOnly AND current user is NOT an admin
                    const showLockIcon = tab.adminOnly && !isAdmin;
                    const tabButton = (
                      <button
                        key={tab.id}
                        onClick={() => setActiveAdminTab(tab.id as any)}
                        className={`flex items-center gap-2 px-4 py-2 rounded-lg whitespace-nowrap ${
                          activeAdminTab === tab.id ? 'bg-purple-600 text-white' : 'bg-slate-800 text-gray-400 hover:bg-slate-700'
                        }`}
                      >
                        <Icon className="w-4 h-4" />
                        {tab.label}
                        {showLockIcon && <Lock className="w-3 h-3 text-amber-400 ml-1" />}
                      </button>
                    );
                    // Wrap with AdminAccessControl if the tab is truly admin-only and the user is not an admin,
                    // otherwise, just render the button. Note: AdminAccessControl around tabButton is probably
                    // not doing what you intend, as the *content* of the tab is already wrapped above.
                    // This specific usage of AdminAccessControl here might be redundant for showing the button
                    // if the whole /admin route is already guarded.
                    return tab.adminOnly && !isAdmin ? (
                      <AdminAccessControl key={tab.id}>{tabButton}</AdminAccessControl>
                    ) : tabButton;
                  })}
                </div>

                {/* Admin Content Area with Suspense for lazy-loaded components */}
                <Suspense fallback={<div className="text-purple-300">Loading admin content...</div>}>
                  {activeAdminTab === 'orchestration' && <ModuleOrchestrator moduleManager={moduleManager} />}
                  {activeAdminTab === 'consciousness' && <ConsciousnessMonitor moduleManager={moduleManager} />}
                  {activeAdminTab === 'events' && <EventsPage />}
                  {activeAdminTab === 'circle' && <SacredCircle />}
                  {activeAdminTab === 'marketplace' && <ModuleMarketplace />}
                  {activeAdminTab === 'shared-intentions' && <SharedIntentionsManager />}
                  {activeAdminTab === 'developer' && <ModuleDeveloperKit />}
                  {activeAdminTab === 'analytics' && <ModuleAnalytics />}
                  {activeAdminTab === 'integrity' && <SystemIntegrityMonitor />}
                  {activeAdminTab === 'metrics' && <SystemMetricsPanel />}
                  {activeAdminTab === 'toggle' && <ModuleTogglePanel />}
                  {activeAdminTab === 'guardian-protocols' && <GuardianProtocols />}
                </Suspense>
              </main>
              <Footer />
            </AdminAccessControl>
          </ProtectedRoute>
        } />

        {/* Catch-all route to redirect to home */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </div>
  );
};

// Main App component responsible for context providers and service initialization
function App() {
  // Initialize Supabase client
  const supabase = SupabaseService.getInstance().client;

  // Initialize all singleton services once here to be passed down
  const moduleManager = new ModuleManager();
  const geh = GlobalEventHorizon.getInstance(); // Not directly used in App, but initialized
  const eventBus = EventBus.getInstance();
  const metricsCollector = MetricsCollector.getInstance();
  const integrityService = SystemIntegrityService.getInstance();
  const optimizer = ConsciousnessOptimizer.getInstance(moduleManager);
  const phrEngine = PHREngine.getInstance();
  const codeWeavingEngine = CodeWeavingEngine.getInstance();
  const architecturalHarmonizer = ArchitecturalHarmonizer.getInstance(moduleManager);

  return (
    // Wrap the entire application with necessary context providers
    <ChakraProvider>
      <XPProvider>
        <SyncProvider>
          <SacredCircleProvider>
            <RSIProvider>
              <AuthWrapper>
                {/* Router needs to be within AuthWrapper and other contexts for hooks like useAuth, useNavigate to work */}
                <Router>
                  {/* AppContent receives all services as props */}
                  <AppContent
                    moduleManager={moduleManager}
                    metricsCollector={metricsCollector}
                    integrityService={integrityService}
                    optimizer={optimizer}
                    phrEngine={phrEngine}
                    codeWeavingEngine={codeWeavingEngine}
                    architecturalHarmonizer={architecturalHarmonizer}
                    eventBus={eventBus}
                    supabase={supabase}
                  />
                </Router>
              </AuthWrapper>
            </RSIProvider>
          </SacredCircleProvider>
        </SyncProvider>
      </XPProvider>
    </ChakraProvider>
  );
}

export default App;