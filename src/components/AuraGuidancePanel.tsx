// src/components/AuraGuidancePanel.tsx

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { AuraRecommendation } from '../types/aura';
import { AuraGuidanceService } from '../services/AuraGuidanceService';
import { SystemSoulState, UserConsentProfile } from '../contexts/RSIContext';
import * as LucideIcons from 'lucide-react'; // Import all Lucide icons

interface AuraGuidancePanelProps {
  userId: string;
  isNewUser: boolean;
  soulState: SystemSoulState;
  userConsent: UserConsentProfile | undefined; // This prop can be undefined or null initially
  onNavigateToView: (view: string) => void;
  onDismiss: () => void; // Callback to dismiss the panel
}

export const AuraGuidancePanel: React.FC<AuraGuidancePanelProps> = ({
  userId,
  isNewUser,
  soulState,
  userConsent, // It's passed here
  onNavigateToView,
  onDismiss,
}) => {
  const [recommendations, setRecommendations] = useState<AuraRecommendation[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const auraGuidanceService = AuraGuidanceService.getInstance();

  useEffect(() => {
    const fetchRecommendations = async () => {
      setIsLoading(true);
      // Safely access allowGuidanceSuggestions, defaulting to true if userConsent is undefined/null
      const allowSuggestions = userConsent?.allowGuidanceSuggestions ?? true;

      // Create a safe userConsent object, providing defaults if userConsent is undefined
      const safeUserConsent: UserConsentProfile = userConsent || {
        allowGuidanceSuggestions: true,
        // Add other required UserConsentProfile properties with safe defaults
        allowPersonalization: true,
        allowAnalytics: false,
        allowCloudSync: false,
      };

      const fetched = await auraGuidanceService.getRecommendations(
        userId,
        isNewUser,
        soulState,
        { ...safeUserConsent, allowGuidanceSuggestions: allowSuggestions } // Pass a safe userConsent object
      );
      setRecommendations(fetched);
      setIsLoading(false);
    };

    fetchRecommendations();
  }, [userId, isNewUser, soulState, userConsent]); // userConsent is now correctly a dependency

  const handleAction = (recommendation: AuraRecommendation) => {
    switch (recommendation.action.type) {
      case 'navigate':
        onNavigateToView(recommendation.action.target);
        break;
      case 'open_modal':
        // Implement modal opening logic here
        console.log('Open modal:', recommendation.action.target);
        break;
      case 'trigger_event':
        // Implement event triggering logic here
        console.log('Trigger event:', recommendation.action.target, recommendation.action.payload);
        break;
      default:
        console.warn('Unknown action type:', recommendation.action.type);
    }
    onDismiss(); // Dismiss panel after action
  };

  if (isLoading) {
    return (
      <div className="bg-slate-900/50 rounded-xl border border-purple-500/20 p-6 text-center">
        <div className="w-8 h-8 border-4 border-purple-400/30 border-t-purple-400 rounded-full animate-spin mx-auto mb-4"></div>
        <p className="text-purple-300">Aura is consulting the Akashic Records...</p>
      </div>
    );
  }

  if (recommendations.length === 0) {
    return null; // Don't render if no recommendations
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className="bg-gradient-to-br from-purple-900/30 to-indigo-900/30 rounded-xl border border-purple-500/20 p-6 relative overflow-hidden"
    >
      <button
        onClick={onDismiss}
        className="absolute top-3 right-3 p-1 text-gray-400 hover:text-white transition-colors"
        title="Dismiss guidance"
      >
        <LucideIcons.X className="w-5 h-5" />
      </button>

      <div className="flex items-center gap-4 mb-6">
        <div className="w-12 h-12 bg-purple-600/20 rounded-full flex items-center justify-center">
          <LucideIcons.Lightbulb className="w-6 h-6 text-purple-400" />
        </div>
        <div>
          <h2 className="text-xl font-bold text-white">Aura's Guidance</h2>
          <p className="text-purple-300">
            {isNewUser
              ? 'Welcome, new soul! Here are some recommended first steps:'
              : 'Aura has detected optimal pathways for your current journey:'}
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {recommendations.map((rec) => {
          const IconComponent = (LucideIcons as any)[rec.icon]; // Dynamically get icon component
          return (
            <motion.div
              key={rec.id}
              className="bg-slate-800/50 rounded-lg border border-gray-700 p-4 cursor-pointer hover:border-purple-500/50 transition-all"
              whileHover={{ scale: 1.02 }}
              onClick={() => handleAction(rec)}
            >
              <div className="flex items-start gap-3">
                {IconComponent && (
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center ${rec.color.replace('text-', 'bg-')}/20`}>
                    <IconComponent className={`w-5 h-5 ${rec.color}`} />
                  </div>
                )}
                <div className="flex-1">
                  <h3 className="font-semibold text-white mb-1">{rec.title}</h3>
                  <p className="text-gray-400 text-sm">{rec.description}</p>
                </div>
              </div>
            </motion.div>
          );
        })}
      </div>
    </motion.div>
  );
};