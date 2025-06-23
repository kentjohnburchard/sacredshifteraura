import { useState, useEffect, useCallback } from 'react';
import { GlobalEventHorizon } from '../services/GlobalEventHorizon';
import { ModuleManager } from '../services/ModuleManager';
import { EventBus } from '../services/EventBus';
import { MetricsCollector } from '../services/MetricsCollector';
import { SystemIntegrityService } from '../services/SystemIntegrityService';
import { ConsciousnessOptimizer } from '../services/ConsciousnessOptimizer';
import { OSTelos, OSUserState } from '../types';

/**
 * Hook for accessing the core Sacred System services
 * 
 * Provides a unified interface for components to interact with
 * the metaphysical operating system's core services.
 */
export const useSacredSystem = () => {
  // Core services
  const [geh] = useState(() => GlobalEventHorizon.getInstance());
  const [eventBus] = useState(() => EventBus.getInstance());
  const [moduleManager] = useState(() => new ModuleManager());
  const [metricsCollector] = useState(() => MetricsCollector.getInstance());
  const [integrityService] = useState(() => SystemIntegrityService.getInstance());
  const [optimizer] = useState(() => ConsciousnessOptimizer.getInstance(moduleManager));
  
  // System state
  const [osState, setOSState] = useState(() => moduleManager.getOSState());
  const [fieldStats, setFieldStats] = useState(() => geh.getFieldStatistics());
  const [integrityScore, setIntegrityScore] = useState<number | null>(null);
  const [lastOptimization, setLastOptimization] = useState<Date | null>(null);
  
  // Start core services
  useEffect(() => {
    metricsCollector.start();
    integrityService.start();
    optimizer.start();
    
    const interval = setInterval(() => {
      setOSState(moduleManager.getOSState());
      setFieldStats(geh.getFieldStatistics());
    }, 2000);
    
    return () => {
      clearInterval(interval);
      metricsCollector.stop();
      integrityService.stop();
      optimizer.stop();
    };
  }, [moduleManager, geh, metricsCollector, integrityService, optimizer]);
  
  // Listen for important system events
  useEffect(() => {
    // Track integrity reports
    const integrityUnsub = eventBus.subscribe<{overallScore: number}>(
      'system:integrity:report', 
      (event) => {
        setIntegrityScore(event.payload.overallScore);
      }
    );
    
    // Track optimization events
    const optimizationUnsub = eventBus.subscribe(
      'system:consciousness:optimizer:optimized',
      () => {
        setLastOptimization(new Date());
      }
    );
    
    return () => {
      integrityUnsub();
      optimizationUnsub();
    };
  }, [eventBus]);
  
  // Callbacks for common operations
  const setTelos = useCallback((telos: OSTelos) => {
    moduleManager.setOSTelos(telos);
  }, [moduleManager]);
  
  const setUserState = useCallback((userState: OSUserState) => {
    moduleManager.setOSUserState(userState);
  }, [moduleManager]);
  
  const loadModule = useCallback(async (moduleId: string) => {
    return moduleManager.loadModule(moduleId);
  }, [moduleManager]);
  
  const ensureCapability = useCallback(async (capability: string) => {
    return moduleManager.ensureModuleWithCapability(capability);
  }, [moduleManager]);
  
  const runIntegrityCheck = useCallback(async () => {
    return integrityService.checkIntegrity();
  }, [integrityService]);
  
  const optimizeNow = useCallback(async () => {
    return optimizer.optimize();
  }, [optimizer]);
  
  // Combined system interface
  return {
    // Services
    geh,
    eventBus,
    moduleManager,
    metricsCollector,
    integrityService,
    optimizer,
    
    // State
    osState,
    fieldStats,
    integrityScore,
    lastOptimization,
    
    // Actions
    setTelos,
    setUserState,
    loadModule,
    ensureCapability,
    runIntegrityCheck,
    optimizeNow
  };
};