import React, { useState, useEffect } from 'react';
import { ModuleInfo, OSTelos, OSUserState } from '../types';
import { ModuleManager } from '../services/ModuleManager';
import { ModuleRegistry } from '../services/ModuleRegistry';
import { 
  Activity, 
  Brain, 
  Target, 
  Users, 
  Zap, 
  Shield, 
  AlertTriangle,
  CheckCircle,
  XCircle,
  Pause,
  Play,
  Trash2
} from 'lucide-react';

interface ModuleOrchestratorProps {
  moduleManager: ModuleManager;
  className?: string;
}

const ModuleOrchestrator: React.FC<ModuleOrchestratorProps> = ({ moduleManager, className = '' }) => {
  const [osState, setOSState] = useState(moduleManager.getOSState());
  const [availableTelos, setAvailableTelos] = useState<OSTelos[]>([]);
  const [selectedUser, setSelectedUser] = useState<string>('');
  const [isLoading, setIsLoading] = useState(false);
  const [loadedModuleComponent, setLoadedModuleComponent] = useState<React.ComponentType | null>(null);
  const [activeModuleName, setActiveModuleName] = useState<string>('');

  // Mock user states for demonstration
  const mockUsers: OSUserState[] = [
    {
      id: 'user-1',
      name: 'Digital Nomad',
      currentContext: 'exploration',
      essenceLabels: ['user:experience', 'consciousness:expansion', 'freedom:seeking', 'user:active']
    },
    {
      id: 'user-2', 
      name: 'Security Analyst',
      currentContext: 'security_review',
      essenceLabels: ['security:paramount', 'analysis:deep', 'protection:comprehensive', 'system:secure']
    },
    {
      id: 'user-3',
      name: 'Data Scientist',
      currentContext: 'data_analysis',
      essenceLabels: ['data:harmony', 'analysis:pattern', 'wisdom:acquisition', 'processing:optimal']
    },
    {
      id: 'user-4',
      name: 'New User',
      currentContext: 'first_login',
      essenceLabels: ['user:experience', 'onboarding:flow', 'initial:setup', 'consciousness:integration']
    }
  ];

  useEffect(() => {
    const registry = new ModuleRegistry();
    setAvailableTelos(registry.getAllTelosOptions());

    const interval = setInterval(() => {
      setOSState(moduleManager.getOSState());
    }, 1000);

    return () => clearInterval(interval);
  }, [moduleManager]);

  const handleTelosChange = async (telosId: string) => {
    const telos = availableTelos.find(t => t.id === telosId);
    if (telos) {
      setIsLoading(true);
      moduleManager.setOSTelos(telos);
      
      // Simulate some time for the change to propagate
      setTimeout(() => {
        setOSState(moduleManager.getOSState());
        setIsLoading(false);
      }, 500);
    }
  };

  const handleUserChange = async (userId: string) => {
    const user = mockUsers.find(u => u.id === userId);
    if (user) {
      setSelectedUser(userId);
      setIsLoading(true);
      moduleManager.setOSUserState(user);
      
      setTimeout(() => {
        setOSState(moduleManager.getOSState());
        setIsLoading(false);
      }, 500);
    }
  };

  const handleCapabilityRequest = async (capability: string) => {
    setIsLoading(true);
    try {
      const module = await moduleManager.ensureModuleWithCapability(capability);
      if (module) {
        console.log('Module loaded:', module?.getManifest().name);
        
        // Get exposed items and look for a React component
        const exposedItems = module.getExposedItems();
        if (exposedItems.Component && typeof exposedItems.Component === 'function') {
          const ComponentFunction = exposedItems.Component();
          setLoadedModuleComponent(() => ComponentFunction);
          setActiveModuleName(module.getManifest().name);
        }
      }
    } catch (error) {
      console.error('Failed to load module:', error);
    } finally {
      setTimeout(() => {
        setOSState(moduleManager.getOSState());
        setIsLoading(false);
      }, 500);
    }
  };

  const getStateIcon = (state: string) => {
    switch (state) {
      case 'active': return <CheckCircle className="w-4 h-4 text-green-400" />;
      case 'dormant': return <Pause className="w-4 h-4 text-yellow-400" />;
      case 'initializing': return <Play className="w-4 h-4 text-blue-400" />;
      case 'quarantined': return <AlertTriangle className="w-4 h-4 text-red-400" />;
      case 'destroyed': return <XCircle className="w-4 h-4 text-gray-400" />;
      default: return <Activity className="w-4 h-4 text-gray-400" />;
    }
  };

  const getStateColor = (state: string) => {
    switch (state) {
      case 'active': return 'text-green-400 bg-green-900/20';
      case 'dormant': return 'text-yellow-400 bg-yellow-900/20';
      case 'initializing': return 'text-blue-400 bg-blue-900/20';
      case 'quarantined': return 'text-red-400 bg-red-900/20';
      case 'destroyed': return 'text-gray-400 bg-gray-900/20';
      default: return 'text-gray-400 bg-gray-900/20';
    }
  };

  return (
    <div className={`space-y-6 ${className}`}>
      {/* OS Consciousness Panel */}
      <div className="bg-slate-900/50 rounded-xl border border-purple-500/20 p-6">
        <div className="flex items-center gap-3 mb-6">
          <Brain className="w-6 h-6 text-purple-400" />
          <h2 className="text-xl font-bold text-white">OS Consciousness</h2>
          {isLoading && <div className="w-5 h-5 border-2 border-purple-400 border-t-transparent rounded-full animate-spin" />}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Current Telos */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-3">
              <Target className="w-4 h-4 inline mr-2" />
              Current Telos (Purpose)
            </label>
            <select
              value={osState.currentTelos?.id || ''}
              onChange={(e) => handleTelosChange(e.target.value)}
              className="w-full bg-slate-800 border border-purple-500/30 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-purple-400 transition-colors"
              disabled={isLoading}
            >
              <option value="">Select Purpose...</option>
              {availableTelos.map((telos) => (
                <option key={telos.id} value={telos.id}>
                  {telos.description} (Priority: {telos.priority})
                </option>
              ))}
            </select>
            
            {osState.currentTelos && (
              <div className="mt-3 p-3 bg-purple-900/30 rounded-lg">
                <div className="text-sm text-purple-300 mb-2">Essence Labels:</div>
                <div className="flex flex-wrap gap-1">
                  {osState.currentTelos.essenceLabels.map((label) => (
                    <span key={label} className="px-2 py-1 bg-purple-500/20 text-purple-300 rounded text-xs">
                      {label}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* User State */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-3">
              <Users className="w-4 h-4 inline mr-2" />
              Current User Context
            </label>
            <select
              value={selectedUser}
              onChange={(e) => handleUserChange(e.target.value)}
              className="w-full bg-slate-800 border border-purple-500/30 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-purple-400 transition-colors"
              disabled={isLoading}
            >
              <option value="">Select User Context...</option>
              {mockUsers.map((user) => (
                <option key={user.id} value={user.id}>
                  {user.name} - {user.currentContext}
                </option>
              ))}
            </select>

            {osState.currentUserState && (
              <div className="mt-3 p-3 bg-blue-900/30 rounded-lg">
                <div className="text-sm text-blue-300 mb-2">User Essence:</div>
                <div className="flex flex-wrap gap-1">
                  {osState.currentUserState.essenceLabels.map((label) => (
                    <span key={label} className="px-2 py-1 bg-blue-500/20 text-blue-300 rounded text-xs">
                      {label}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Module States Overview */}
      <div className="bg-slate-900/50 rounded-xl border border-purple-500/20 p-6">
        <div className="flex items-center gap-3 mb-6">
          <Activity className="w-6 h-6 text-purple-400" />
          <h2 className="text-xl font-bold text-white">Module Orchestration</h2>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-6">
          {Object.entries(osState.moduleStates).map(([state, count]) => (
            <div key={state} className={`p-4 rounded-lg border ${getStateColor(state)} border-current/20`}>
              <div className="flex items-center gap-2 mb-2">
                {getStateIcon(state)}
                <span className="font-medium capitalize">{state}</span>
              </div>
              <div className="text-2xl font-bold">{count}</div>
            </div>
          ))}
        </div>

        <div className="bg-slate-800/50 rounded-lg p-4 mb-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
            <div>
              <span className="text-gray-400">Total Modules:</span>
              <span className="ml-2 font-medium text-white">{osState.totalModules}</span>
            </div>
            <div>
              <span className="text-gray-400">Resource Usage:</span>
              <span className="ml-2 font-medium text-white">{osState.totalResourceFootprintMB} MB</span>
            </div>
            <div>
              <span className="text-gray-400">Field Events:</span>
              <span className="ml-2 font-medium text-white">{osState.fieldStatistics.totalEvents}</span>
            </div>
          </div>
        </div>

        {/* Capability Triggers */}
        <div>
          <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
            <Zap className="w-5 h-5 text-amber-400" />
            Load Module Capabilities
          </h3>
          
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
            {[
              'authentication-provider',
              'data-processing', 
              'consciousness-interface',
              'pattern-analysis',
              'reality-synthesis',
              'social-interaction'
            ].map((capability) => (
              <button
                key={capability}
                onClick={() => handleCapabilityRequest(capability)}
                disabled={isLoading}
                className="px-4 py-2 bg-amber-600/20 text-amber-300 rounded-lg border border-amber-500/30 hover:bg-amber-600/30 transition-colors disabled:opacity-50 text-sm font-medium"
              >
                {capability.replace('-', ' ')}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Render Loaded Module Component */}
      {loadedModuleComponent && (
        <div className="bg-slate-900/50 rounded-xl border border-purple-500/20 p-6">
          <div className="flex items-center gap-3 mb-6">
            <Brain className="w-6 h-6 text-purple-400" />
            <h2 className="text-xl font-bold text-white">Active Module: {activeModuleName}</h2>
            <button
              onClick={() => {
                setLoadedModuleComponent(null);
                setActiveModuleName('');
              }}
              className="ml-auto px-3 py-1 bg-red-600/20 text-red-300 rounded border border-red-500/30 hover:bg-red-600/30 transition-colors text-sm"
            >
              Close Module
            </button>
          </div>
          
          <div className="bg-slate-800/30 rounded-lg p-4">
            {React.createElement(loadedModuleComponent)}
          </div>
        </div>
      )}
    </div>
  );
};

export default ModuleOrchestrator;