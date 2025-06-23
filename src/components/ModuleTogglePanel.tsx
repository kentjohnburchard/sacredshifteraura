import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ModuleToggleService } from '../services/ModuleToggleService';
import { ModuleRegistry } from '../services/ModuleRegistry';
import { GlobalEventHorizon } from '../services/GlobalEventHorizon';
import { CloudSyncStatus } from './CloudSyncStatus';
import { ModuleManifest } from '../types';
import { 
  Power, 
  Settings, 
  Info, 
  CheckCircle, 
  XCircle,
  AlertTriangle,
  Zap,
  Shield,
  Activity,
  RefreshCw,
  Filter,
  Search,
  Cloud,
  Loader
} from 'lucide-react';

export const ModuleTogglePanel: React.FC = () => {
  const [toggleService] = useState(() => ModuleToggleService.getInstance());
  const [registry] = useState(() => new ModuleRegistry());
  const [geh] = useState(() => GlobalEventHorizon.getInstance());
  
  const [modules, setModules] = useState<ModuleManifest[]>([]);
  const [moduleStates, setModuleStates] = useState<Record<string, boolean>>({});
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterType, setFilterType] = useState<'all' | 'enabled' | 'disabled'>('all');
  const [showDetails, setShowDetails] = useState<string | null>(null);

  useEffect(() => {
    const loadModules = async () => {
      setIsLoading(true);
      
      // Get all known modules (both enabled and disabled)
      const allModules = registry.getAllKnownManifests();
      setModules(allModules);
      
      // Get current toggle states
      const states = toggleService.getAllModuleStates();
      setModuleStates(states);
      
      setIsLoading(false);
    };

    loadModules();

    // Subscribe to toggle changes
    const unsubscribe = toggleService.subscribeToChanges((moduleId, enabled) => {
      setModuleStates(prev => ({ ...prev, [moduleId]: enabled }));
    });

    // Listen for registry changes
    const unsubscribeRegistry = geh.subscribe('module:registry:*', () => {
      // Refresh module list when registry changes
      const allModules = registry.getAllKnownManifests();
      setModules(allModules);
    });

    return () => {
      unsubscribe();
      unsubscribeRegistry();
    };
  }, [toggleService, registry, geh]);

  const handleToggle = (moduleId: string, enabled: boolean) => {
    toggleService.toggleModule(moduleId, enabled);
  };

  const handleBatchToggle = (action: 'enableAll' | 'disableAll' | 'reset') => {
    const updates: Record<string, boolean> = {};
    
    modules.forEach(module => {
      switch (action) {
        case 'enableAll':
          updates[module.id] = true;
          break;
        case 'disableAll':
          updates[module.id] = false;
          break;
        case 'reset':
          // Reset to defaults (enable non-example modules)
          updates[module.id] = !module.id.includes('example') && !module.id.includes('demo');
          break;
      }
    });

    toggleService.batchToggleModules(updates);
  };

  const getModuleStatus = (module: ModuleManifest) => {
    const enabled = moduleStates[module.id] ?? true;
    const integrity = module.integrityScore;
    
    if (!enabled) return { status: 'disabled', color: 'text-gray-400', icon: XCircle };
    if (integrity >= 0.9) return { status: 'excellent', color: 'text-green-400', icon: CheckCircle };
    if (integrity >= 0.7) return { status: 'good', color: 'text-blue-400', icon: Shield };
    if (integrity >= 0.5) return { status: 'degraded', color: 'text-yellow-400', icon: AlertTriangle };
    return { status: 'critical', color: 'text-red-400', icon: XCircle };
  };

  const getCapabilityColor = (capability: string) => {
    if (capability.includes('authentication')) return 'bg-blue-500/20 text-blue-300';
    if (capability.includes('social')) return 'bg-pink-500/20 text-pink-300';
    if (capability.includes('data')) return 'bg-green-500/20 text-green-300';
    if (capability.includes('event')) return 'bg-purple-500/20 text-purple-300';
    if (capability.includes('consciousness')) return 'bg-amber-500/20 text-amber-300';
    return 'bg-gray-500/20 text-gray-300';
  };

  const filteredModules = modules.filter(module => {
    // Search filter
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      if (!module.name.toLowerCase().includes(query) && 
          !module.description?.toLowerCase().includes(query) &&
          !module.id.toLowerCase().includes(query)) {
        return false;
      }
    }

    // Type filter
    const enabled = moduleStates[module.id] ?? true;
    if (filterType === 'enabled' && !enabled) return false;
    if (filterType === 'disabled' && enabled) return false;

    return true;
  });

  const stats = {
    total: modules.length,
    enabled: Object.values(moduleStates).filter(Boolean).length,
    disabled: Object.values(moduleStates).filter(s => !s).length,
    highIntegrity: modules.filter(m => m.integrityScore >= 0.9).length
  };

  if (isLoading) {
    return (
      <div className="bg-slate-900/50 rounded-xl border border-purple-500/20 p-6">
        <div className="flex items-center justify-center py-8">
          <div className="flex items-center gap-3">
            <RefreshCw className="w-5 h-5 text-purple-400 animate-spin" />
            <span className="text-purple-300">Loading module registry...</span>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="bg-slate-900/50 rounded-xl border border-purple-500/20 p-6">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <Settings className="w-6 h-6 text-purple-400" />
            <h2 className="text-xl font-bold text-white">Module Control Center</h2>
            <div className="px-3 py-1 bg-purple-500/20 text-purple-300 rounded-lg text-sm">
              Dynamic Registry
            </div>
          </div>
          
          <div className="flex items-center gap-2">
            <button
              onClick={() => handleBatchToggle('reset')}
              className="px-3 py-1 bg-amber-600/20 text-amber-300 rounded border border-amber-500/30 hover:bg-amber-600/30 transition-colors text-sm"
            >
              Reset to Defaults
            </button>
            <button
              onClick={() => handleBatchToggle('enableAll')}
              className="px-3 py-1 bg-green-600/20 text-green-300 rounded border border-green-500/30 hover:bg-green-600/30 transition-colors text-sm"
            >
              Enable All
            </button>
            <button
              onClick={() => handleBatchToggle('disableAll')}
              className="px-3 py-1 bg-red-600/20 text-red-300 rounded border border-red-500/30 hover:bg-red-600/30 transition-colors text-sm"
            >
              Disable All
            </button>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          <div className="bg-slate-800/50 rounded-lg p-3 border border-gray-700">
            <div className="flex items-center gap-2">
              <Activity className="w-4 h-4 text-blue-400" />
              <span className="text-sm text-gray-400">Total</span>
            </div>
            <div className="text-xl font-bold text-white">{stats.total}</div>
          </div>
          
          <div className="bg-slate-800/50 rounded-lg p-3 border border-gray-700">
            <div className="flex items-center gap-2">
              <CheckCircle className="w-4 h-4 text-green-400" />
              <span className="text-sm text-gray-400">Enabled</span>
            </div>
            <div className="text-xl font-bold text-green-400">{stats.enabled}</div>
          </div>
          
          <div className="bg-slate-800/50 rounded-lg p-3 border border-gray-700">
            <div className="flex items-center gap-2">
              <XCircle className="w-4 h-4 text-red-400" />
              <span className="text-sm text-gray-400">Disabled</span>
            </div>
            <div className="text-xl font-bold text-red-400">{stats.disabled}</div>
          </div>
          
          <div className="bg-slate-800/50 rounded-lg p-3 border border-gray-700">
            <div className="flex items-center gap-2">
              <Shield className="w-4 h-4 text-amber-400" />
              <span className="text-sm text-gray-400">High Integrity</span>
            </div>
            <div className="text-xl font-bold text-amber-400">{stats.highIntegrity}</div>
          </div>
        </div>

        {/* Filters */}
        <div className="flex items-center gap-4 mb-6">
          <div className="flex-1 relative">
            <Search className="w-4 h-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search modules..."
              className="w-full pl-10 pr-4 py-2 bg-slate-800 text-white rounded-lg border border-gray-600 focus:border-purple-400 focus:outline-none"
            />
          </div>
          
          <div className="flex items-center gap-2">
            <Filter className="w-4 h-4 text-gray-400" />
            <select
              value={filterType}
              onChange={(e) => setFilterType(e.target.value as any)}
              className="bg-slate-800 text-white rounded-lg border border-gray-600 focus:border-purple-400 focus:outline-none px-3 py-2"
            >
              <option value="all">All Modules</option>
              <option value="enabled">Enabled Only</option>
              <option value="disabled">Disabled Only</option>
            </select>
          </div>
        </div>

        {/* Module List */}
        <div className="space-y-3">
          <AnimatePresence>
            {filteredModules.map((module) => {
              const enabled = moduleStates[module.id] ?? true;
              const status = getModuleStatus(module);
              const StatusIcon = status.icon;

              return (
                <motion.div
                  key={module.id}
                  className="bg-slate-800/50 rounded-lg border border-gray-700 p-4"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  layout
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-3 mb-2">
                        <div className="flex items-center gap-2">
                          <StatusIcon className={`w-4 h-4 ${status.color}`} />
                          <h3 className="font-medium text-white">{module.name}</h3>
                          <span className="text-xs text-gray-400">v{module.version}</span>
                        </div>
                        
                        <div className="flex items-center gap-2 ml-auto">
                          <button
                            onClick={() => setShowDetails(showDetails === module.id ? null : module.id)}
                            className="p-1 text-gray-400 hover:text-white transition-colors"
                          >
                            <Info className="w-4 h-4" />
                          </button>
                          
                          <motion.button
                            onClick={() => handleToggle(module.id, !enabled)}
                            className={`relative w-12 h-6 rounded-full transition-colors ${
                              enabled ? 'bg-purple-600' : 'bg-gray-600'
                            }`}
                            whileTap={{ scale: 0.95 }}
                          >
                            <motion.div
                              className="absolute top-1 w-4 h-4 bg-white rounded-full shadow-md"
                              animate={{ x: enabled ? 24 : 4 }}
                              transition={{ type: "spring", stiffness: 500, damping: 30 }}
                            />
                          </motion.button>
                        </div>
                      </div>
                      
                      <p className="text-sm text-gray-400 mb-3">{module.description}</p>
                      
                      <div className="flex items-center gap-4 text-xs text-gray-500">
                        <div className="flex items-center gap-1">
                          <Zap className="w-3 h-3" />
                          <span>Integrity: {(module.integrityScore * 100).toFixed(0)}%</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <Activity className="w-3 h-3" />
                          <span>{module.resourceFootprintMB}MB</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <Power className="w-3 h-3" />
                          <span className={enabled ? 'text-green-400' : 'text-red-400'}>
                            {enabled ? 'Enabled' : 'Disabled'}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Expanded Details */}
                  <AnimatePresence>
                    {showDetails === module.id && (
                      <motion.div
                        className="mt-4 pt-4 border-t border-gray-700"
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                      >
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div>
                            <h4 className="text-sm font-medium text-white mb-2">Capabilities</h4>
                            <div className="flex flex-wrap gap-1">
                              {module.capabilities.map((capability) => (
                                <span
                                  key={capability}
                                  className={`px-2 py-1 rounded text-xs font-medium ${getCapabilityColor(capability)}`}
                                >
                                  {capability.replace('-', ' ')}
                                </span>
                              ))}
                            </div>
                          </div>
                          
                          <div>
                            <h4 className="text-sm font-medium text-white mb-2">Essence Labels</h4>
                            <div className="flex flex-wrap gap-1">
                              {module.essenceLabels.slice(0, 6).map((label) => (
                                <span
                                  key={label}
                                  className="px-2 py-1 bg-cyan-500/20 text-cyan-300 rounded text-xs"
                                >
                                  {label}
                                </span>
                              ))}
                              {module.essenceLabels.length > 6 && (
                                <span className="px-2 py-1 bg-gray-500/20 text-gray-400 rounded text-xs">
                                  +{module.essenceLabels.length - 6} more
                                </span>
                              )}
                            </div>
                          </div>
                        </div>
                        
                        <div className="mt-3 text-xs text-gray-500">
                          <strong>Module ID:</strong> {module.id}
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </motion.div>
              );
            })}
          </AnimatePresence>
        </div>

        {filteredModules.length === 0 && (
          <div className="text-center py-8 text-gray-400">
            <Settings className="w-8 h-8 mx-auto mb-2 opacity-50" />
            <p>No modules found matching your criteria</p>
          </div>
        )}
      </div>

      {/* Cloud Sync Status Panel */}
      <CloudSyncStatus />
    </div>
  );
};