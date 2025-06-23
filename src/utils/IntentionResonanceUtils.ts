import { SharedIntentionRecord } from '../services/SupabaseService';
import { FrequencyUtils } from './FrequencyUtils';

export const IntentionResonanceUtils = {
  calculateResonanceScore(
    a: SharedIntentionRecord,
    b: SharedIntentionRecord
  ): number {
    let score = 0;

    // 1. Essence label overlap
    const overlap = a.essence_labels?.filter(label => b.essence_labels?.includes(label)) || [];
    const essenceScore = (overlap.length / Math.max((a.essence_labels?.length || 1), 1)) * 40; // up to 40 points

    // 2. Chakra alignment (exact match or adjacency)
    let chakraScore = 0;
    if (a.chakra_focus && b.chakra_focus) {
      chakraScore = a.chakra_focus === b.chakra_focus ? 30 : areChakrasAdjacent(a.chakra_focus, b.chakra_focus) ? 15 : 0;
    }

    // 3. Frequency proximity
    let frequencyScore = 0;
    if (a.frequency_hz && b.frequency_hz) {
      const distance = Math.abs(a.frequency_hz - b.frequency_hz);
      frequencyScore = Math.max(0, 30 - distance); // lose 1 point per Hz diff
    }

    score = essenceScore + chakraScore + frequencyScore;
    return Math.round(score);
  }
};

const chakraOrder = ['root', 'sacral', 'solar', 'heart', 'throat', 'third_eye', 'crown'];
function areChakrasAdjacent(c1: string, c2: string) {
  const i1 = chakraOrder.indexOf(c1);
  const i2 = chakraOrder.indexOf(c2);
  return Math.abs(i1 - i2) === 1;
}