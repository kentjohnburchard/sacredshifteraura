import React, { useState, useEffect } from 'react';
import { ModuleManager } from '../services/ModuleManager';
import { ModuleErrorSummary, ModuleActivitySummary } from '../types';
import { 
  Brain, 
  Activity, 
  AlertTriangle, 
  TrendingUp, 
  Shield, 
  Zap,
  Eye,
  Clock,
  BarChart3
} from 'lucide-react';

interface ConsciousnessMonitorProps {
  moduleManager: ModuleManager;
  className?: string;
}

const ConsciousnessMonitor: React.FC<ConsciousnessMonitorProps> = ({ 
  moduleManager, 
  className = '' 
}) => {
  const [errorSummary, setErrorSummary] = useState<ModuleErrorSummary[]>([]);
  const [activitySummary, setActivitySummary] = useState<ModuleActivitySummary[]>([]);
  const [selectedTimeframe, setSelectedTimeframe] = useState<number>(24);
  const [reflectionMode, setReflectionMode] = useState<'errors' | 'activity'>('activity');

  useEffect(() => {
    const updateSummaries = () => {
      setErrorSummary(moduleManager.getModuleErrorSummary(selectedTimeframe));
      setActivitySummary(moduleManager.getModuleActivitySummary(selectedTimeframe));
    };

    updateSummaries();
    const interval = setInterval(updateSummaries, 5000);

    return () => clearInterval(interval);
  }, [moduleManager, selectedTimeframe]);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'stable': return 'text-green-400 bg-green-900/20';
      case 'degraded': return 'text-yellow-400 bg-yellow-900/20';
      case 'critical': return 'text-red-400 bg-red-900/20';
      case 'active': return 'text-green-400 bg-green-900/20';
      case 'dormant': return 'text-blue-400 bg-blue-900/20';
      case 'idle': return 'text-gray-400 bg-gray-900/20';
      default: return 'text-gray-400 bg-gray-900/20';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'stable': case 'active': return <Shield className="w-4 h-4" />;
      case 'degraded': case 'dormant': return <AlertTriangle className="w-4 h-4" />;
      case 'critical': case 'idle': return <Zap className="w-4 h-4" />;
      default: return <Activity className="w-4 h-4" />;
    }
  };

  const formatLastActivity = (timestamp: string) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / (1000 * 60));
    
    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffMins < 1440) return `${Math.floor(diffMins / 60)}h ago`;
    return `${Math.floor(diffMins / 1440)}d ago`;
  };

  return (
    <div className={`bg-slate-900/50 rounded-xl border border-purple-500/20 ${className}`}>
      <div className="p-6 border-b border-purple-500/20">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <Brain className="w-6 h-6 text-purple-400" />
            <h2 className="text-xl font-bold text-white">Self-Reflection</h2>
            <div className="px-3 py-1 bg-purple-500/20 text-purple-300 rounded-lg text-sm">
              Akashic Analysis
            </div>
          </div>
          
          <div className="flex items-center gap-2">
            <Eye className="w-4 h-4 text-purple-400" />
            <span className="text-sm text-purple-300">Observing Self</span>
          </div>
        </div>

        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <Clock className="w-4 h-4 text-gray-400" />
            <select
              value={selectedTimeframe}
              onChange={(e) => setSelectedTimeframe(Number(e.target.value))}
              className="bg-slate-800 border border-purple-500/30 rounded px-3 py-1 text-white text-sm focus:outline-none focus:border-purple-400"
            >
              <option value={1}>Last Hour</option>
              <option value={6}>Last 6 Hours</option>
              <option value={24}>Last 24 Hours</option>
              <option value={168}>Last Week</option>
            </select>
          </div>

          <div className="flex bg-slate-800 rounded-lg p-1">
            <button
              onClick={() => setReflectionMode('activity')}
              className={`px-3 py-1 rounded text-sm font-medium transition-colors ${
                reflectionMode === 'activity'
                  ? 'bg-purple-600 text-white'
                  : 'text-gray-400 hover:text-white'
              }`}
            >
              <Activity className="w-4 h-4 inline mr-1" />
              Activity
            </button>
            <button
              onClick={() => setReflectionMode('errors')}
              className={`px-3 py-1 rounded text-sm font-medium transition-colors ${
                reflectionMode === 'errors'
                  ? 'bg-purple-600 text-white'
                  : 'text-gray-400 hover:text-white'
              }`}
            >
              <AlertTriangle className="w-4 h-4 inline mr-1" />
              Errors
            </button>
          </div>
        </div>
      </div>

      <div className="p-6">
        {reflectionMode === 'activity' ? (
          <div className="space-y-4">
            <div className="flex items-center gap-2 mb-4">
              <TrendingUp className="w-5 h-5 text-green-400" />
              <h3 className="text-lg font-semibold text-white">Module Activity Patterns</h3>
            </div>
            
            {activitySummary.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                <BarChart3 className="w-8 h-8 mx-auto mb-2 opacity-50" />
                <p>No activity data available for the selected timeframe</p>
              </div>
            ) : (
              <div className="space-y-3">
                {activitySummary.map((summary) => {
                  const totalActivity = summary.heartbeatCount + summary.userActionCount + summary.dataOperationCount;
                  const statusColor = getStatusColor(summary.currentState);
                  
                  return (
                    <div
                      key={summary.moduleId}
                      className="bg-slate-800/50 rounded-lg p-4 border border-slate-700/50"
                    >
                      <div className="flex items-start justify-between mb-3">
                        <div>
                          <h4 className="font-medium text-white">{summary.moduleName}</h4>
                          <p className="text-sm text-gray-400 font-mono">{summary.moduleId}</p>
                        </div>
                        <div className={`px-3 py-1 rounded-lg text-sm font-medium flex items-center gap-1 ${statusColor}`}>
                          {getStatusIcon(summary.currentState)}
                          {summary.currentState}
                        </div>
                      </div>

                      <div className="grid grid-cols-3 gap-4 mb-3">
                        <div className="text-center">
                          <div className="text-2xl font-bold text-blue-400">{summary.heartbeatCount}</div>
                          <div className="text-xs text-gray-400">Heartbeats</div>
                        </div>
                        <div className="text-center">
                          <div className="text-2xl font-bold text-green-400">{summary.userActionCount}</div>
                          <div className="text-xs text-gray-400">User Actions</div>
                        </div>
                        <div className="text-center">
                          <div className="text-2xl font-bold text-purple-400">{summary.dataOperationCount}</div>
                          <div className="text-xs text-gray-400">Data Ops</div>
                        </div>
                      </div>

                      <div className="flex items-center justify-between text-sm">
                        <div className="text-gray-400">
                          Total Activity: <span className="text-white font-medium">{totalActivity}</span>
                        </div>
                        <div className="text-gray-400">
                          Last Activity: <span className="text-white">{formatLastActivity(summary.lastActivityTimestamp)}</span>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        ) : (
          <div className="space-y-4">
            <div className="flex items-center gap-2 mb-4">
              <AlertTriangle className="w-5 h-5 text-red-400" />
              <h3 className="text-lg font-semibold text-white">Error Analysis & Karma</h3>
            </div>
            
            {errorSummary.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                <Shield className="w-8 h-8 mx-auto mb-2 opacity-50" />
                <p>No errors detected - System integrity maintained</p>
              </div>
            ) : (
              <div className="space-y-3">
                {errorSummary.map((summary) => {
                  const statusColor = getStatusColor(summary.status);
                  
                  return (
                    <div
                      key={summary.moduleId}
                      className="bg-slate-800/50 rounded-lg p-4 border border-slate-700/50"
                    >
                      <div className="flex items-start justify-between mb-3">
                        <div>
                          <h4 className="font-medium text-white">{summary.moduleName}</h4>
                          <p className="text-sm text-gray-400 font-mono">{summary.moduleId}</p>
                        </div>
                        <div className={`px-3 py-1 rounded-lg text-sm font-medium flex items-center gap-1 ${statusColor}`}>
                          {getStatusIcon(summary.status)}
                          {summary.status}
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-4 mb-3">
                        <div className="text-center">
                          <div className="text-2xl font-bold text-red-400">{summary.errorCount}</div>
                          <div className="text-xs text-gray-400">Errors</div>
                        </div>
                        <div className="text-center">
                          <div className={`text-2xl font-bold ${
                            summary.currentIntegrityScore >= 0.8 ? 'text-green-400' :
                            summary.currentIntegrityScore >= 0.5 ? 'text-yellow-400' : 'text-red-400'
                          }`}>
                            {(summary.currentIntegrityScore * 100).toFixed(0)}%
                          </div>
                          <div className="text-xs text-gray-400">Integrity</div>
                        </div>
                      </div>

                      <div className="flex items-center justify-between text-sm">
                        <div className="text-gray-400">
                          Karmic Impact: <span className={`font-medium ${
                            summary.errorCount > 10 ? 'text-red-400' :
                            summary.errorCount > 3 ? 'text-yellow-400' : 'text-green-400'
                          }`}>
                            {summary.errorCount > 10 ? 'High' : summary.errorCount > 3 ? 'Medium' : 'Low'}
                          </span>
                        </div>
                        <div className="text-gray-400">
                          Last Error: <span className="text-white">{formatLastActivity(summary.lastErrorTimestamp)}</span>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default ConsciousnessMonitor;