import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ModuleToggleService } from '../services/ModuleToggleService';
import { GlobalEventHorizon } from '../services/GlobalEventHorizon';
import { 
  Cloud, 
  CloudOff, 
  Wifi, 
  WifiOff, 
  RefreshCw,
  CheckCircle,
  AlertTriangle,
  Loader2
} from 'lucide-react';

export const CloudSyncStatus: React.FC = () => {
  const [toggleService] = useState(() => ModuleToggleService.getInstance());
  const [geh] = useState(() => GlobalEventHorizon.getInstance());
  
  const [syncStatus, setSyncStatus] = useState(() => toggleService.getCloudSyncStatus());
  const [lastSyncTime, setLastSyncTime] = useState<Date | null>(null);
  const [syncEvents, setSyncEvents] = useState<string[]>([]);
  const [isForcingSync, setIsForcingSync] = useState(false);

  useEffect(() => {
    // Update status periodically
    const interval = setInterval(() => {
      setSyncStatus(toggleService.getCloudSyncStatus());
    }, 2000);

    // Listen for sync events
    const unsubscribeSync = geh.subscribe('module:toggle:cloudSync*', (event) => {
      if (event.type.includes('Complete')) {
        setLastSyncTime(new Date());
      }
      
      setSyncEvents(prev => [
        `${event.type.split(':').pop()}: ${event.payload?.message || 'Success'}`,
        ...prev.slice(0, 4) // Keep last 5 events
      ]);
    });

    const unsubscribeRealtime = geh.subscribe('supabase:realtime:*', (event) => {
      setSyncEvents(prev => [
        `Realtime: ${event.type.split(':').pop()}`,
        ...prev.slice(0, 4)
      ]);
      
      // If status changed, update it immediately
      if (event.type === 'supabase:realtime:statusChanged') {
        setSyncStatus(toggleService.getCloudSyncStatus());
      }
    });

    return () => {
      clearInterval(interval);
      unsubscribeSync();
      unsubscribeRealtime();
    };
  }, [toggleService, geh]);

  const handleForceSync = async () => {
    if (isForcingSync) return;
    
    try {
      setIsForcingSync(true);
      await toggleService.forceCloudSync();
      setLastSyncTime(new Date());
    } catch (error) {
      console.error('Force sync failed:', error);
      setSyncEvents(prev => [
        `Sync error: ${(error as Error).message}`,
        ...prev.slice(0, 4)
      ]);
    } finally {
      setIsForcingSync(false);
    }
  };

  const getStatusIcon = () => {
    if (syncStatus.syncing || isForcingSync) return <Loader2 className="w-4 h-4 animate-spin text-blue-400" />;
    if (!syncStatus.enabled) return <CloudOff className="w-4 h-4 text-gray-400" />;
    if (!syncStatus.connected) return <WifiOff className="w-4 h-4 text-red-400" />;
    return <CheckCircle className="w-4 h-4 text-green-400" />;
  };

  const getStatusText = () => {
    if (syncStatus.syncing || isForcingSync) return 'Syncing...';
    if (!syncStatus.enabled) return 'Cloud Sync Disabled';
    if (!syncStatus.connected) return 'Connection Lost';
    return 'Connected';
  };

  const getStatusColor = () => {
    if (syncStatus.syncing || isForcingSync) return 'text-blue-400 bg-blue-900/20';
    if (!syncStatus.enabled) return 'text-gray-400 bg-gray-900/20';
    if (!syncStatus.connected) return 'text-red-400 bg-red-900/20';
    return 'text-green-400 bg-green-900/20';
  };

  return (
    <div className="bg-slate-900/50 rounded-lg border border-purple-500/20 p-4">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <Cloud className="w-4 h-4 text-purple-400" />
          <span className="text-sm font-medium text-white">Cloud Sync</span>
        </div>
        
        <div className="flex items-center gap-2">
          {syncStatus.enabled && (
            <button
              onClick={handleForceSync}
              disabled={syncStatus.syncing || isForcingSync}
              className="p-1 text-gray-400 hover:text-white transition-colors disabled:opacity-50"
              title="Force sync"
            >
              <RefreshCw className={`w-3 h-3 ${(syncStatus.syncing || isForcingSync) ? 'animate-spin' : ''}`} />
            </button>
          )}
          
          <div className={`flex items-center gap-1 px-2 py-1 rounded text-xs font-medium ${getStatusColor()}`}>
            {getStatusIcon()}
            {getStatusText()}
          </div>
        </div>
      </div>

      {lastSyncTime && (
        <div className="text-xs text-gray-400 mb-2">
          Last sync: {lastSyncTime.toLocaleTimeString()}
        </div>
      )}

      <AnimatePresence>
        {syncEvents.length > 0 && (
          <motion.div
            className="space-y-1 max-h-20 overflow-y-auto scrollbar-thin scrollbar-track-slate-800 scrollbar-thumb-purple-500/30"
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
          >
            {syncEvents.map((event, index) => (
              <motion.div
                key={index}
                className="text-xs text-gray-500 truncate"
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.05 }}
              >
                {event}
              </motion.div>
            ))}
          </motion.div>
        )}
      </AnimatePresence>

      {!syncStatus.enabled && (
        <div className="mt-2 text-xs text-amber-400 flex items-center gap-1">
          <AlertTriangle className="w-3 h-3" />
          Sign in to enable cloud sync
        </div>
      )}
    </div>
  );
};