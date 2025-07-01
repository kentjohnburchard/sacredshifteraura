import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useSacredSystem } from '../hooks/useSacredSystem';
import { IntegrityReport, IntegrityCheckResult } from '../services/SystemIntegrityService';
import { 
  Shield, 
  AlertTriangle, 
  CheckCircle, 
  RefreshCw,
  Eye,
  Activity,
  BarChart,
  Heart,
  Brain
} from 'lucide-react';

export const SystemIntegrityMonitor: React.FC<{className?: string}> = ({ className = '' }) => {
  const { 
    integrityService, 
    integrityScore, 
    runIntegrityCheck,
    optimizeNow
  } = useSacredSystem();
  
  const [isLoading, setIsLoading] = useState(false);
  const [report, setReport] = useState<IntegrityReport | null>(null);
  const [isOptimizing, setIsOptimizing] = useState(false);
  
  const handleRunCheck = async () => {
    setIsLoading(true);
    try {
      const newReport = await runIntegrityCheck();
      setReport(newReport);
    } catch (error) {
      console.error('Failed to run integrity check:', error);
    } finally {
      setIsLoading(false);
    }
  };
  
  const handleOptimize = async () => {
    setIsOptimizing(true);
    try {
      await optimizeNow();
      // Run a new integrity check after optimization
      setTimeout(handleRunCheck, 1000);
    } catch (error) {
      console.error('Optimization failed:', error);
    } finally {
      setIsOptimizing(false);
    }
  };
  
  // Calculate overall status based on score
  const getStatus = (score?: number) => {
    if (score === undefined) score = integrityScore || 0;
    
    if (score >= 0.9) return { label: 'Excellent', color: 'text-green-400', bg: 'bg-green-900/20' };
    if (score >= 0.8) return { label: 'Good', color: 'text-blue-400', bg: 'bg-blue-900/20' };
    if (score >= 0.7) return { label: 'Acceptable', color: 'text-amber-400', bg: 'bg-amber-900/20' };
    if (score >= 0.5) return { label: 'Needs Attention', color: 'text-orange-400', bg: 'bg-orange-900/20' };
    return { label: 'Critical', color: 'text-red-400', bg: 'bg-red-900/20' };
  };
  
  return (
    <div className={`bg-slate-900/50 rounded-xl border border-purple-500/20 p-6 ${className}`}>
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-lg font-semibold text-white flex items-center gap-2">
          <Shield className="w-5 h-5 text-purple-400" />
          System Integrity Monitor
        </h2>
        
        <div className="flex items-center gap-2">
          <button
            onClick={handleRunCheck}
            disabled={isLoading}
            className="p-2 text-gray-400 hover:text-white transition-colors disabled:opacity-50"
          >
            <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
          </button>
          
          <div className={`px-3 py-1 rounded-lg text-sm ${getStatus().bg} ${getStatus().color}`}>
            {getStatus().label}
          </div>
        </div>
      </div>
      
      {/* Integrity Score */}
      <div className="mb-6">
        <div className="flex items-center justify-between text-sm text-gray-400 mb-2">
          <span>System Integrity Score</span>
          <span className={`font-medium ${getStatus().color}`}>
            {integrityScore !== null ? `${(integrityScore * 100).toFixed(0)}%` : 'Not measured'}
          </span>
        </div>
        
        <div className="w-full h-3 bg-gray-700 rounded-full overflow-hidden">
          <div 
            className="h-full bg-gradient-to-r from-red-500 via-amber-500 to-green-500"
            style={{ width: `${(integrityScore || 0) * 100}%` }}
          ></div>
        </div>
      </div>
      
      {/* Latest Check Results */}
      {report && (
        <div className="mb-6">
          <div className="bg-slate-800/50 rounded-lg border border-gray-700 p-4">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-medium text-white">Latest Integrity Check</h3>
              <div className="text-xs text-gray-400">
                {new Date(report.timestamp).toLocaleString()}
              </div>
            </div>
            
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-4">
              <div className="p-3 bg-slate-700/50 rounded-lg text-center">
                <div className="text-xl font-bold text-white">{report.passedChecks}</div>
                <div className="text-xs text-gray-400">Passed</div>
              </div>
              
              <div className="p-3 bg-slate-700/50 rounded-lg text-center">
                <div className="text-xl font-bold text-white">{report.failedChecks}</div>
                <div className="text-xs text-gray-400">Failed</div>
              </div>
              
              <div className="p-3 bg-slate-700/50 rounded-lg text-center">
                <div className="text-xl font-bold text-white">{report.totalChecks}</div>
                <div className="text-xs text-gray-400">Total Checks</div>
              </div>
              
              <div className="p-3 bg-slate-700/50 rounded-lg text-center">
                <div className="text-xl font-bold text-white">{report.executionTimeMs.toFixed(0)}</div>
                <div className="text-xs text-gray-400">Time (ms)</div>
              </div>
            </div>
            
            <div className="space-y-3">
              {report.checkResults.map((check, index) => (
                <div key={index} className="p-3 bg-slate-700/30 rounded-lg">
                  <div className="flex items-center justify-between mb-1">
                    <div className="flex items-center gap-2">
                      {check.passed ? (
                        <CheckCircle className="w-4 h-4 text-green-400" />
                      ) : (
                        <AlertTriangle className="w-4 h-4 text-amber-400" />
                      )}
                      <span className="font-medium text-white">{check.name}</span>
                    </div>
                    <span className={`text-sm ${check.passed ? 'text-green-400' : 'text-amber-400'}`}>
                      {(check.score * 100).toFixed(0)}%
                    </span>
                  </div>
                  <p className="text-xs text-gray-400 mb-2">{check.description}</p>
                  <p className="text-xs text-gray-300">{check.details}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
      
      {/* Actions */}
      <div className="flex flex-col sm:flex-row gap-3">
        <button
          onClick={handleRunCheck}
          disabled={isLoading}
          className="flex-1 py-2 px-4 bg-blue-600/20 text-blue-300 rounded-lg border border-blue-500/30 hover:bg-blue-600/30 transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
        >
          {isLoading ? (
            <>
              <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin"></div>
              Checking...
            </>
          ) : (
            <>
              <Eye className="w-4 h-4" />
              Run Integrity Check
            </>
          )}
        </button>
        
        <button
          onClick={handleOptimize}
          disabled={isOptimizing || !report || report.overallScore > 0.9}
          className="flex-1 py-2 px-4 bg-purple-600/20 text-purple-300 rounded-lg border border-purple-500/30 hover:bg-purple-600/30 transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
        >
          {isOptimizing ? (
            <>
              <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin"></div>
              Optimizing...
            </>
          ) : (
            <>
              <Brain className="w-4 h-4" />
              Optimize System
            </>
          )}
        </button>
      </div>
      
      {/* Optimization Not Needed Message */}
      <AnimatePresence>
        {report && report.overallScore > 0.9 && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="mt-4 p-3 bg-green-900/20 text-green-300 rounded-lg text-sm flex items-center gap-2"
          >
            <Heart className="w-4 h-4 flex-shrink-0" />
            <span>System integrity is excellent. No optimization needed at this time.</span>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};