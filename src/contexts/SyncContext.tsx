import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { SyncService } from '../services/SyncService';
import { useAuth } from './AuthContext';

interface SyncContextType {
  syncStatus: {
    pendingCount: number;
    failedCount: number;
    isOnline: boolean;
    isProcessing: boolean;
    lastSyncTimestamps: Record<string, string>;
  };
  fullSync: (table: string) => Promise<void>;
  forceSync: () => Promise<void>;
  enqueueOperation: (table: string, type: 'INSERT' | 'UPDATE' | 'DELETE', record: any, localOnly?: boolean) => Promise<string>;
}

const SyncContext = createContext<SyncContextType | undefined>(undefined);

export const useSyncContext = () => {
  const context = useContext(SyncContext);
  if (context === undefined) {
    throw new Error('useSyncContext must be used within a SyncProvider');
  }
  return context;
};

interface SyncProviderProps {
  children: ReactNode;
}

export const SyncProvider: React.FC<SyncProviderProps> = ({ children }) => {
  const syncService = SyncService.getInstance();
  const { user } = useAuth();
  const [syncStatus, setSyncStatus] = useState({
    pendingCount: 0,
    failedCount: 0,
    isOnline: navigator.onLine,
    isProcessing: false,
    lastSyncTimestamps: {} as Record<string, string>
  });

  // Initialize sync service when user changes
  useEffect(() => {
    if (user?.id) {
      syncService.initialize(user.id).catch(error => {
        console.error('[SyncContext] Failed to initialize sync service:', error);
      });
    }
  }, [user?.id]);

  // Update sync status periodically
  useEffect(() => {
    const updateStatus = () => {
      setSyncStatus(syncService.getSyncStatus());
    };

    // Initial update
    updateStatus();

    // Set up interval
    const interval = setInterval(updateStatus, 5000);

    // Clean up
    return () => clearInterval(interval);
  }, []);

  // Listen for online/offline events
  useEffect(() => {
    const handleOnline = () => {
      setSyncStatus(prev => ({ ...prev, isOnline: true }));
    };

    const handleOffline = () => {
      setSyncStatus(prev => ({ ...prev, isOnline: false }));
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  const fullSync = async (table: string) => {
    await syncService.fullSync(table);
    setSyncStatus(syncService.getSyncStatus());
  };

  const forceSync = async () => {
    await syncService.forceSync();
    setSyncStatus(syncService.getSyncStatus());
  };

  const enqueueOperation = async (
    table: string, 
    type: 'INSERT' | 'UPDATE' | 'DELETE', 
    record: any, 
    localOnly = false
  ) => {
    const operationId = await syncService.enqueueOperation(table, type, record, localOnly);
    setSyncStatus(syncService.getSyncStatus());
    return operationId;
  };

  return (
    <SyncContext.Provider
      value={{
        syncStatus,
        fullSync,
        forceSync,
        enqueueOperation
      }}
    >
      {children}
    </SyncContext.Provider>
  );
};