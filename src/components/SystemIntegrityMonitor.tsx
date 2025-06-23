import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useSacredSystem } from '../hooks/useSacredSystem';
import { IntegrityReport, IntegrityCheckResult } from '../services/SystemIntegrityService';
import { AuraGuidanceService } from '../services/AuraGuidanceService';
// REMOVED: import { ConsciousnessTimelineService } from '../services/ConsciousnessTimelineService';

import {
  Shield,
  AlertTriangle,
  CheckCircle,
  RefreshCw,
  Eye,
  Activity,
  BarChart,
  Heart,
  Brain,
  Smile, // Added Smile icon for good mood
  Meh,   // Added Meh for neutral/attention
  Frown  // Added Frown for critical
} from 'lucide-react';
import { SystemSoulState } from '../contexts/RSIContext'; // Import SystemSoulState if not already there

export const SystemIntegrityMonitor: React.FC<{className?: string}> = ({ className = '' }) => {
  const {
    integrityService,
    integrityScore,
    runIntegrityCheck,
    optimizeNow,
    soulState // <--- Assuming soulState is available from useSacredSystem
  } = useSacredSystem();

  const [isLoading, setIsLoading] = useState(false);
  const [report, setReport] = useState<IntegrityReport | null>(null);
  const [isOptimizing, setIsOptimizing] = useState(false);

  // Get service instances
  const aura = AuraGuidanceService.getInstance();
  // REMOVED: const consciousnessTimeline = ConsciousnessTimelineService.getInstance(); // No longer needed

  // Handler for running the integrity check
  const handleRunCheck = async () => {
    setIsLoading(true);
    try {
      const newReport = await runIntegrityCheck();
      setReport(newReport);

      // Removed all calls to consciousnessTimeline.logMilestone
      // If you had other logging/side effects that relied on this, they need a different solution
      // For now, these lines are gone as per your instruction.

    } catch (error) {
      console.error('Failed to run integrity check:', error);
      // Removed all calls to consciousnessTimeline.logMilestone
    } finally {
      setIsLoading(false);
    }
  };

  const handleOptimize = async () => {
    setIsOptimizing(true);
    try {
      await optimizeNow();
      // Run a new integrity check after optimization
      setTimeout(handleRunCheck, 1000); // Re-check after a brief delay
      // Removed all calls to consciousnessTimeline.logMilestone
    } catch (error) {
      console.error('Optimization failed:', error);
      // Removed all calls to consciousnessTimeline.logMilestone
    } finally {
      setIsOptimizing(false);
    }
  };

  // Initial check on component mount
  useEffect(() => {
    handleRunCheck();
  }, []);

  // Calculate overall status based on score
  const getStatus = (score?: number) => {
    if (score === undefined) score = integrityScore || 0;

    if (score >= 0.9) return { label: 'Excellent', color: 'text-green-400', bg: 'bg-green-900/20' };
    if (score >= 0.8) return { label: 'Good', color: 'text-blue-400', bg: 'bg-blue-900/20' };
    if (score >= 0.7) return { label: 'Acceptable', color: 'text-amber-400', bg: 'bg-amber-900/20' };
    if (score >= 0.5) return { label: 'Needs Attention', color: 'text-orange-400', bg: 'bg-orange-900/20' };
    return { label: 'Critical', color: 'text-red-400', bg: 'bg-red-900/20' };
  };

  // 2. Dynamic Iconography Based on Score for Aura's Reflection
  const getAuraMood = (score: number) => {
    if (score >= 0.9) return { icon: Smile, color: 'text-indigo-200' }; // Happy/content
    if (score >= 0.7) return { icon: Meh, color: 'text-amber-300' };   // Neutral/thinking
    return { icon: Frown, color: 'text-red-300' };                     // Worried/concerned
  };

  const auraMood = report ? getAuraMood(report.overallScore) : { icon: Brain, color: 'text-indigo-200' };
  const AuraMoodIcon = auraMood.icon; // Component for the icon

  // 4. Add Chakra Alignment Feedback
  const chakraFeedback = soulState?.dominantChakra ? ` ${
      soulState.dominantChakra.charAt(0).toUpperCase() + soulState.dominantChakra.slice(1)
    } Chakra Activation Detected – Integrating with coherence and compassion.` : '';

  const getChakraColor = (chakra: string) => {
    switch (chakra) {
      case 'root': return 'bg-red-700/30 text-red-300 border-red-500/30';
      case 'sacral': return 'bg-orange-700/30 text-orange-300 border-orange-500/30';
      case 'solar_plexus': return 'bg-yellow-700/30 text-yellow-300 border-yellow-500/30';
      case 'heart': return 'bg-green-700/30 text-green-300 border-green-500/30';
      case 'throat': return 'bg-blue-700/30 text-blue-300 border-blue-500/30';
      case 'third_eye': return 'bg-indigo-700/30 text-indigo-300 border-indigo-500/30';
      case 'crown': return 'bg-purple-700/30 text-purple-300 border-purple-500/30';
      default: return 'bg-gray-700/30 text-gray-300 border-gray-500/30';
    }
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

      {/* Aura's Reflection */}
      <AnimatePresence>
        {report && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
            transition={{ duration: 0.3 }}
            className={`mt-4 p-4 rounded-lg border
              ${report.overallScore >= 0.9
                ? 'bg-purple-900/20 text-purple-300 border-purple-500/30 animate-pulse-subtle' // 1. Aura Pulse Glow
                : 'bg-indigo-900/20 text-indigo-300 border-indigo-500/30'
              }`}
          >
            <h3 className={`font-semibold flex items-center gap-2 mb-2 ${auraMood.color}`}>
              <AuraMoodIcon className="w-4 h-4" /> {/* 2. Dynamic Iconography */}
              Aura's Reflection
            </h3>
            <pre className="whitespace-pre-wrap text-sm">{aura.interpretIntegrityReport(report)}</pre>

            {/* 4. Add Chakra Alignment Feedback */}
            {soulState?.dominantChakra && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                transition={{ delay: 0.2, duration: 0.3 }}
                className={`mt-3 p-2 rounded-md text-xs flex items-center gap-2 ${getChakraColor(soulState.dominantChakra)}`}
              >
                <Heart className="w-3 h-3 flex-shrink-0" /> {/* Can use a chakra-specific icon if available */}
                <span>{chakraFeedback}</span>
              </motion.div>
            )}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Actions */}
      <div className="flex flex-col sm:flex-row gap-3 mt-6">
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
          disabled={isOptimizing || (report && report.overallScore > 0.9)}
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