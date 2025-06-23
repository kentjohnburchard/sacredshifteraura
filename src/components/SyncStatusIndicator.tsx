import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useSyncContext } from '../contexts/SyncContext';
import {
  Cloud,
  CloudOff,
  RefreshCw,
  Check,
  AlertTriangle,
  Clock,
  Database
} from 'lucide-react';

export const SyncStatusIndicator: React.FC = () => {
  const { syncStatus, forceSync } = useSyncContext();

  const {
    pendingCount,
    failedCount,
    isOnline,
    isProcessing,
    lastSyncTimestamps
  } = syncStatus;

  // Calculate most recent sync timestamp
  const getLastSyncTime = () => {
    if (Object.keys(lastSyncTimestamps).length === 0) {
      return null;
    }
    
    return new Date(
      Math.max(
        ...Object.values(lastSyncTimestamps)
          .map(timestamp => new Date(timestamp).getTime())
      )
    );
  };

  const lastSync = getLastSyncTime();
  const hasPendingChanges = pendingCount > 0;
  const hasFailedChanges = failedCount > 0;

  const formatLastSyncTime = (date: Date) => {
    return date.toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' });
  };

  return (
    <div className="bg-slate-900/50 rounded-lg border border-purple-500/20 p-4">
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-2">
          {isOnline ? (
            <Cloud className="w-4 h-4 text-purple-400" />
          ) : (
            <CloudOff className="w-4 h-4 text-gray-400" />
          )}
          <span className="text-sm font-medium text-white">Cloud Sync</span>
        </div>
        
        <div className="flex items-center gap-2">
          <button
            onClick={() => forceSync()}
            disabled={!isOnline || isProcessing}
            className="p-1 text-gray-400 hover:text-white transition-colors disabled:opacity-50"
            title="Force sync"
          >
            <RefreshCw className={`w-3 h-3 ${isProcessing ? 'animate-spin' : ''}`} />
          </button>
          
          <div className={`px-2 py-1 rounded text-xs font-medium ${
            !isOnline ? 'bg-gray-500/20 text-gray-300' :
            hasFailedChanges ? 'bg-red-500/20 text-red-300' :
            hasPendingChanges ? 'bg-yellow-500/20 text-yellow-300' :
            isProcessing ? 'bg-blue-500/20 text-blue-300' :
            'bg-green-500/20 text-green-300'
          }`}>
            {!isOnline ? 'Offline' :
             hasFailedChanges ? 'Sync Failed' :
             hasPendingChanges ? 'Pending Changes' :
             isProcessing ? 'Syncing...' :
             'In Sync'}
          </div>
        </div>
      </div>

      <AnimatePresence>
        {(hasPendingChanges || hasFailedChanges || isProcessing) && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="mt-2 space-y-1"
          >
            {hasPendingChanges && (
              <div className="flex items-center justify-between text-xs">
                <div className="flex items-center gap-1 text-gray-400">
                  <Clock className="w-3 h-3" />
                  <span>Pending changes</span>
                </div>
                <span className="text-yellow-300">{pendingCount}</span>
              </div>
            )}
            
            {hasFailedChanges && (
              <div className="flex items-center justify-between text-xs">
                <div className="flex items-center gap-1 text-gray-400">
                  <AlertTriangle className="w-3 h-3" />
                  <span>Failed operations</span>
                </div>
                <span className="text-red-300">{failedCount}</span>
              </div>
            )}
            
            {isProcessing && (
              <div className="flex items-center justify-between text-xs">
                <div className="flex items-center gap-1 text-gray-400">
                  <Database className="w-3 h-3" />
                  <span>Syncing data...</span>
                </div>
                <RefreshCw className="w-3 h-3 text-blue-300 animate-spin" />
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>

      {lastSync && (
        <div className="text-xs text-gray-400 mt-2 flex items-center justify-between">
          <span>Last synced</span>
          <span className={isOnline ? 'text-green-300' : 'text-gray-500'}>
            {formatLastSyncTime(lastSync)}
          </span>
        </div>
      )}

      {!isOnline && (
        <div className="mt-2 text-xs text-yellow-400 flex items-center gap-1">
          <AlertTriangle className="w-3 h-3" />
          Working offline - changes will sync when online
        </div>
      )}
    </div>
  );
};