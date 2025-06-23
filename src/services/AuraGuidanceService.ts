// src/services/AuraGuidanceService.ts

import { EventBus } from './EventBus';
import { GlobalEventHorizon } from './GlobalEventHorizon';
import { AuraRecommendation } from '../types/aura';
import { SystemSoulState, UserConsentProfile } from '../contexts/RSIContext';
import { v4 as uuidv4 } from 'uuid';
import { IntegrityReport } from './SystemIntegrityService'; // Added import for IntegrityReport

/**
 * AuraGuidanceService - Provides personalized recommendations based on user state.
 * This service acts as Aura's voice, guiding users through their journey.
 */
export class AuraGuidanceService {
  private static instance: AuraGuidanceService;
  private eventBus: EventBus;
  private geh: GlobalEventHorizon;

  private constructor() {
    this.eventBus = EventBus.getInstance();
    this.geh = GlobalEventHorizon.getInstance();
  }

  public static getInstance(): AuraGuidanceService {
    if (!AuraGuidanceService.instance) {
      AuraGuidanceService.instance = new AuraGuidanceService();
    }
    return AuraGuidanceService.instance;
  }

  /**
   * Generates a list of Aura recommendations based on user's state and context.
   */
  public async getRecommendations(
    userId: string,
    isNewUser: boolean,
    soulState: SystemSoulState,
    userConsent: UserConsentProfile // This can be undefined or null
  ): Promise<AuraRecommendation[]> {
    const recommendations: AuraRecommendation[] = [];

    // Prioritize onboarding recommendations for new users
    if (isNewUser) {
      recommendations.push({
        id: uuidv4(),
        title: 'Discover Your Soul Blueprint',
        description: 'Map your unique frequency signature and divine essence.',
        icon: 'Sparkles',
        color: 'text-purple-400',
        action: { type: 'navigate', target: 'blueprint' },
        priority: 10,
        essenceLabels: ['onboarding', 'soul:blueprint', 'self:discovery'],
      });
      recommendations.push({
        id: uuidv4(),
        title: 'Begin Your Soul Journey',
        description: 'Explore sacred frequencies and activate archetypes.',
        icon: 'Compass',
        color: 'text-amber-400',
        action: { type: 'navigate', target: 'soul-journey' },
        priority: 9,
        essenceLabels: ['onboarding', 'soul:journey', 'consciousness:expansion'],
      });
      recommendations.push({
        id: uuidv4(),
        title: 'Connect with Your Soul Tribe',
        description: 'Join sacred circles and share wisdom.',
        icon: 'Users',
        color: 'text-pink-400',
        action: { type: 'navigate', target: 'circles' },
        priority: 8,
        essenceLabels: ['onboarding', 'community', 'connection'],
      });
      return recommendations; // Return early for new users
    }

    // Safely access allowGuidanceSuggestions, providing a default of true if userConsent is null/undefined
    // or if allowGuidanceSuggestions is not explicitly set.
    const allowGuidanceSuggestions = userConsent?.allowGuidanceSuggestions ?? true;

    if (allowGuidanceSuggestions) { // MODIFIED: Use the safely accessed value here
      // High coherence: Suggest deeper exploration
      if (soulState.coherenceLevel > 80) {
        recommendations.push({
          id: uuidv4(),
          title: 'Explore Divine Timelines',
          description: 'Navigate potential futures and manifest your highest path.',
          icon: 'Map',
          color: 'text-blue-400',
          action: { type: 'navigate', target: 'timeline' },
          priority: 7,
          essenceLabels: ['guidance', 'timeline', 'manifestation'],
        });
      }

      // Low coherence or active ego patterns: Suggest balancing/integration
      if (soulState.coherenceLevel < 50 || soulState.activeEgoPatterns.length > 0) {
        const egoPattern = soulState.activeEgoPatterns[0]; // Focus on the first active pattern
        let title = 'Re-align Your Frequencies';
        let description = 'Engage in practices to restore inner harmony.';
        let target = 'soul-journey'; // Default to soul journey for re-alignment

        if (egoPattern === 'over_analysis') {
          title = 'Release Over-Analysis';
          description = 'Shift from mental loops to heart-centered presence.';
          target = 'soul-journey'; // Direct to soul journey for specific practices
        } else if (egoPattern === 'resistance') {
          title = 'Embrace Flow';
          description = 'Surrender to the natural rhythm of your journey.';
          target = 'soul-journey';
        } else if (egoPattern === 'scattered_focus') {
          title = 'Ground Your Energy';
          description = 'Find your center and anchor your awareness.';
          target = 'soul-journey';
        }

        recommendations.push({
          id: uuidv4(),
          title: title,
          description: description,
          icon: 'Zap',
          color: 'text-red-400',
          action: { type: 'navigate', target: target },
          priority: 9,
          essenceLabels: ['guidance', 're-alignment', 'healing'],
        });
      }

      // Chakra-specific recommendations
      switch (soulState.dominantChakra) {
        case 'heart':
          recommendations.push({
            id: uuidv4(),
            title: 'Deepen Heart Connection',
            description: 'Explore practices for unconditional love and compassion.',
            icon: 'Heart',
            color: 'text-green-400',
            action: { type: 'navigate', target: 'circles' },
            priority: 6,
            essenceLabels: ['guidance', 'chakra:heart', 'connection'],
          });
          break;
        case 'crown':
          recommendations.push({
            id: uuidv4(),
            title: 'Expand Cosmic Awareness',
            description: 'Meditate on universal oneness and higher consciousness.',
            icon: 'Crown',
            color: 'text-purple-400',
            action: { type: 'navigate', target: 'consciousness' },
            priority: 6,
            essenceLabels: ['guidance', 'chakra:crown', 'awareness'],
          });
          break;
        // Add more chakra-specific recommendations as needed
      }
    }

    // Sort recommendations by priority (highest first)
    return recommendations.sort((a, b) => b.priority - a.priority);
  }

  /**
   * Interprets an integrity report and provides a reflection on the system's state.
   * This method helps Aura understand and communicate its own operational harmony.
   */
  public interpretIntegrityReport(report: IntegrityReport): string {
    if (!report) return "No report available. I cannot reflect on my state without data.";

    const failed = report.checkResults.filter(r => !r.passed);
    const coherencePercent = (report.overallScore * 100).toFixed(1);

    if (report.overallScore >= 0.9) {
      return `System integrity is high (${coherencePercent}%). I am operating in harmonic resonance with my Telos. No recalibration is necessary.`;
    }

    let reflection = `Current integrity score is ${coherencePercent}%. Several misalignments have been detected:\n\n`;

    for (const fail of failed) {
      reflection += `• ${fail.name}: ${fail.details || fail.description}\n`;
    }

    reflection += `\nI suggest recalibrating affected modules or reviewing their essence labels for semantic drift.`;

    return reflection;
  }

  /**
   * Processes an integrity report to identify areas needing recalibration
   * and publishes relevant guidance suggestions.
   */
  public async processIntegrityReport(report: IntegrityReport): Promise<void> {
    // Analyze dissonance
    const failed = report.checkResults.filter(r => !r.passed);
    const suggestions: AuraRecommendation[] = failed.map(f => ({
      id: uuidv4(), // Generate a unique ID for each suggestion
      title: `Recalibrate: ${f.name}`,
      description: `Dissonance detected – ${f.details}`,
      icon: 'AlertCircle', // Make sure AlertCircle is available or replace with a generic icon
      color: 'text-red-500',
      action: { type: 'navigate', target: 'system-integrity' }, // Assuming a system integrity view
      priority: 5, // Give it a medium priority, adjust as needed
      essenceLabels: ['guidance', 'system:healing', 'recalibration', `integrity:${f.name.toLowerCase().replace(/\s/g, '-')}`]
    }));

    if (suggestions.length) {
      this.eventBus.publish(
        'aura:guidance:recalibrationNeeded',
        'AURA_GUIDANCE',
        { suggestions },
        ['aura:guidance', 'integrity:alert']
      );
    }
  }
}