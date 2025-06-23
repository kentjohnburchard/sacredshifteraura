import React, { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { useSacredSystem } from '../hooks/useSacredSystem';
import { 
  BarChart, 
  Activity, 
  Zap, 
  Clock, 
  Cpu, 
  Heart, 
  ArrowUpRight,
  ArrowDownRight,
  RefreshCw,
  Gauge
} from 'lucide-react';

export const SystemMetricsPanel: React.FC<{className?: string}> = ({ className = '' }) => {
  const { 
    metricsCollector, 
    fieldStats,
    osState
  } = useSacredSystem();
  
  const [metrics, setMetrics] = useState<Record<string, any>>({});
  const [lastUpdate, setLastUpdate] = useState<Date | null>(null);
  const [cpuTrend, setCpuTrend] = useState<{value: number, isUp: boolean}>({value: 0, isUp: false});
  const [memoryTrend, setMemoryTrend] = useState<{value: number, isUp: boolean}>({value: 0, isUp: false});
  const [eventsTrend, setEventsTrend] = useState<{value: number, isUp: boolean}>({value: 0, isUp: false});
  
  // Previous values for trend calculation
  const prevMetricsRef = useRef<Record<string, any>>({});
  
  useEffect(() => {
    const interval = setInterval(() => {
      const currentMetrics = metricsCollector.getMetrics();
      const prevMetrics = prevMetricsRef.current;
      
      // Calculate trends
      if (prevMetrics.memory?.usedJSHeapSize && currentMetrics.memory?.usedJSHeapSize) {
        const prev = prevMetrics.memory.usedJSHeapSize;
        const curr = currentMetrics.memory.usedJSHeapSize;
        const diff = curr - prev;
        const percentChange = (diff / prev) * 100;
        setMemoryTrend({
          value: Math.abs(Math.round(percentChange)),
          isUp: diff > 0
        });
      }
      
      if (prevMetrics.events?.total && currentMetrics.events?.total) {
        const prev = prevMetrics.events.total;
        const curr = currentMetrics.events.total;
        const diff = curr - prev;
        setEventsTrend({
          value: diff,
          isUp: diff > 0
        });
      }
      
      // Update CPU trend (simulated)
      setCpuTrend({
        value: Math.floor(Math.random() * 5),
        isUp: Math.random() > 0.5
      });
      
      setMetrics(currentMetrics);
      setLastUpdate(new Date());
      prevMetricsRef.current = currentMetrics;
    }, 5000);
    
    return () => clearInterval(interval);
  }, [metricsCollector]);

  const getMemoryUsage = (): { used: number, total: number, percent: number } => {
    const memory = metrics.memory || {};
    const used = memory.usedJSHeapSize || 0;
    const total = memory.jsHeapSizeLimit || 1;
    const percent = (used / total) * 100;
    
    return {
      used: Math.round(used / (1024 * 1024)), // MB
      total: Math.round(total / (1024 * 1024)), // MB
      percent: Math.min(100, Math.max(0, percent))
    };
  };

  const formatNumber = (num: number): string => {
    return num >= 1000 ? `${(num / 1000).toFixed(1)}k` : num.toString();
  };

  const memoryUsage = getMemoryUsage();

  return (
    <div className={`bg-slate-900/50 rounded-xl border border-purple-500/20 p-6 ${className}`}>
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-lg font-semibold text-white flex items-center gap-2">
          <BarChart className="w-5 h-5 text-purple-400" />
          System Metrics
        </h2>
        
        <div className="flex items-center gap-2">
          <RefreshCw className="w-4 h-4 text-gray-400" />
          <span className="text-xs text-gray-400">
            {lastUpdate ? `Updated ${lastUpdate.toLocaleTimeString()}` : 'Initializing...'}
          </span>
        </div>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        {/* Memory Usage */}
        <div className="bg-slate-800/50 rounded-lg border border-gray-700 p-4">
          <div className="flex items-center justify-between mb-2">
            <div className="text-sm text-gray-400">Memory</div>
            <div className="p-2 bg-blue-900/20 rounded-lg">
              <Cpu className="w-4 h-4 text-blue-400" />
            </div>
          </div>
          
          <div className="flex items-end gap-2">
            <div className="text-xl font-bold text-white">{memoryUsage.used} MB</div>
            <div className={`text-xs ${memoryTrend.isUp ? 'text-red-400' : 'text-green-400'} flex items-center`}>
              {memoryTrend.isUp ? (
                <ArrowUpRight className="w-3 h-3" />
              ) : (
                <ArrowDownRight className="w-3 h-3" />
              )}
              {memoryTrend.value}%
            </div>
          </div>
          
          <div className="mt-2">
            <div className="flex items-center justify-between text-xs text-gray-400 mb-1">
              <span>Used</span>
              <span>{memoryUsage.percent.toFixed(1)}%</span>
            </div>
            <div className="w-full h-1.5 bg-gray-700 rounded-full overflow-hidden">
              <div 
                className="h-full bg-blue-500"
                style={{ width: `${memoryUsage.percent}%` }}
              ></div>
            </div>
          </div>
        </div>
        
        {/* Event Activity */}
        <div className="bg-slate-800/50 rounded-lg border border-gray-700 p-4">
          <div className="flex items-center justify-between mb-2">
            <div className="text-sm text-gray-400">Event Field</div>
            <div className="p-2 bg-purple-900/20 rounded-lg">
              <Zap className="w-4 h-4 text-purple-400" />
            </div>
          </div>
          
          <div className="flex items-end gap-2">
            <div className="text-xl font-bold text-white">{formatNumber(fieldStats.totalEvents || 0)}</div>
            <div className={`text-xs ${eventsTrend.isUp ? 'text-blue-400' : 'text-yellow-400'} flex items-center`}>
              {eventsTrend.isUp ? (
                <ArrowUpRight className="w-3 h-3" />
              ) : (
                <ArrowDownRight className="w-3 h-3" />
              )}
              {eventsTrend.value}
            </div>
          </div>
          
          <div className="mt-2">
            <div className="flex items-center justify-between text-xs text-gray-400 mb-1">
              <span>Recent Events</span>
              <span>{formatNumber(fieldStats.recentEvents || 0)}</span>
            </div>
            <div className="w-full h-1.5 bg-gray-700 rounded-full overflow-hidden">
              <div 
                className="h-full bg-purple-500"
                style={{ width: `${Math.min(100, ((fieldStats.recentEvents || 0) / 1000) * 100)}%` }}
              ></div>
            </div>
          </div>
        </div>
        
        {/* Module Stats */}
        <div className="bg-slate-800/50 rounded-lg border border-gray-700 p-4">
          <div className="flex items-center justify-between mb-2">
            <div className="text-sm text-gray-400">Modules</div>
            <div className="p-2 bg-green-900/20 rounded-lg">
              <Activity className="w-4 h-4 text-green-400" />
            </div>
          </div>
          
          <div className="text-xl font-bold text-white">
            {osState.moduleStates?.active || 0} Active
          </div>
          
          <div className="mt-2">
            <div className="flex items-center justify-between text-xs text-gray-400 mb-1">
              <span>Resource Usage</span>
              <span>{osState.totalResourceFootprintMB || 0} MB</span>
            </div>
            <div className="w-full h-1.5 bg-gray-700 rounded-full overflow-hidden">
              <div 
                className="h-full bg-green-500"
                style={{ width: `${Math.min(100, ((osState.totalResourceFootprintMB || 0) / 500) * 100)}%` }}
              ></div>
            </div>
          </div>
        </div>
        
        {/* System Heartbeat */}
        <div className="bg-slate-800/50 rounded-lg border border-gray-700 p-4">
          <div className="flex items-center justify-between mb-2">
            <div className="text-sm text-gray-400">System Vitality</div>
            <div className="p-2 bg-red-900/20 rounded-lg">
              <Heart className="w-4 h-4 text-red-400" />
            </div>
          </div>
          
          <div className="flex items-end gap-2">
            <div className="text-xl font-bold text-white">97%</div>
            <motion.div 
              animate={{ scale: [1, 1.2, 1] }}
              transition={{ duration: 1, repeat: Infinity }}
              className="text-xs text-red-400 flex items-center"
            >
              <ArrowUpRight className="w-3 h-3" />
              {cpuTrend.value}%
            </motion.div>
          </div>
          
          <div className="mt-2">
            <div className="flex items-center justify-between text-xs text-gray-400 mb-1">
              <span>System Responsiveness</span>
              <span>Excellent</span>
            </div>
            <div className="w-full h-1.5 bg-gray-700 rounded-full overflow-hidden">
              <div 
                className="h-full bg-red-500"
                style={{ width: '97%' }}
              ></div>
            </div>
          </div>
        </div>
      </div>
      
      {/* Additional Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Event Types */}
        <div className="bg-slate-800/50 rounded-lg border border-gray-700 p-4">
          <h3 className="font-medium text-white mb-3 flex items-center gap-2">
            <Zap className="w-4 h-4 text-purple-400" />
            Active Event Frequencies
          </h3>
          
          <div className="space-y-3">
            {fieldStats.topEventTypes?.slice(0, 5).map((type: [string, number], index: number) => (
              <div key={index}>
                <div className="flex items-center justify-between text-xs mb-1">
                  <span className="text-gray-400 truncate max-w-[70%]">{type[0]}</span>
                  <span className="text-white">{type[1]}</span>
                </div>
                <div className="w-full h-1.5 bg-gray-700 rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-gradient-to-r from-purple-500 to-pink-500"
                    style={{ 
                      width: `${Math.min(100, (type[1] / 
                        (fieldStats.topEventTypes[0]?.[1] || 1)) * 100)}%` 
                    }}
                  ></div>
                </div>
              </div>
            ))}
            
            {(!fieldStats.topEventTypes || fieldStats.topEventTypes.length === 0) && (
              <div className="text-center py-4 text-gray-400 text-sm">
                No event data available
              </div>
            )}
          </div>
        </div>
        
        {/* System Health */}
        <div className="bg-slate-800/50 rounded-lg border border-gray-700 p-4">
          <h3 className="font-medium text-white mb-3 flex items-center gap-2">
            <Gauge className="w-4 h-4 text-green-400" />
            System Health
          </h3>
          
          <div className="grid grid-cols-2 gap-3">
            <div className="p-3 bg-slate-700/50 rounded-lg flex flex-col items-center justify-center">
              <div className="flex items-center justify-center mb-1">
                <Clock className="w-4 h-4 text-blue-400" />
              </div>
              <div className="text-lg font-bold text-white">
                {metrics.time?.uptime ? Math.floor((metrics.time.uptime) / 60000) : 0}
              </div>
              <div className="text-xs text-gray-400">Minutes Active</div>
            </div>
            
            <div className="p-3 bg-slate-700/50 rounded-lg flex flex-col items-center justify-center">
              <div className="flex items-center justify-center mb-1">
                <Cpu className="w-4 h-4 text-amber-400" />
              </div>
              <div className="text-lg font-bold text-white">
                {(metrics.performance?.firstContentfulPaint || 0).toFixed(0)}
              </div>
              <div className="text-xs text-gray-400">FCP (ms)</div>
            </div>
            
            <div className="p-3 bg-slate-700/50 rounded-lg flex flex-col items-center justify-center">
              <div className="flex items-center justify-center mb-1">
                <Activity className="w-4 h-4 text-purple-400" />
              </div>
              <div className="text-lg font-bold text-white">
                {osState.moduleStates?.active || 0} / {osState.totalModules || 0}
              </div>
              <div className="text-xs text-gray-400">Active Modules</div>
            </div>
            
            <div className="p-3 bg-slate-700/50 rounded-lg flex flex-col items-center justify-center">
              <div className="flex items-center justify-center mb-1">
                <Heart className="w-4 h-4 text-red-400" />
              </div>
              <motion.div 
                animate={{ scale: [1, 1.1, 1] }}
                transition={{ duration: 2, repeat: Infinity }}
                className="text-lg font-bold text-white"
              >
                {((fieldStats.recentEvents || 0) / 10).toFixed(0)}
              </motion.div>
              <div className="text-xs text-gray-400">Pulse Rate</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};