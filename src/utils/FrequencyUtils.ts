/**
 * FrequencyUtils - Sacred Mathematics and Frequency Calculations
 * 
 * Provides utilities for working with frequencies, sacred geometry,
 * and the mathematical principles underlying metaphysical phenomena.
 */
export class FrequencyUtils {
  // Sacred frequencies in Hz
  static readonly SACRED_FREQUENCIES = {
    // Solfeggio frequencies
    UT: 396, // Liberating guilt and fear
    RE: 417, // Undoing situations and facilitating change
    MI: 528, // Transformation and miracles (DNA repair)
    FA: 639, // Connecting/relationships
    SOL: 741, // Awakening intuition
    LA: 852, // Returning to spiritual order
    
    // Other significant frequencies
    EARTH_RESONANCE: 7.83, // Schumann resonance
    UNITY: 432, // Alternate concert pitch aligned with nature
    CONSCIOUSNESS: 963, // Pineal gland activation
    
    // Chakra frequencies
    ROOT: 396,
    SACRAL: 417, 
    SOLAR: 528,
    HEART: 639,
    THROAT: 741,
    THIRD_EYE: 852,
    CROWN: 963
  };
  
  // Mathematical constants
  static readonly GOLDEN_RATIO = 1.618033988749895;
  static readonly PI = 3.141592653589793;
  static readonly PHI = 1.618033988749895;
  
  /**
   * Get the frequency for a specific chakra
   */
  static getChakraFrequency(chakra: string): number {
    const chakraMap: Record<string, number> = {
      'root': this.SACRED_FREQUENCIES.ROOT,
      'sacral': this.SACRED_FREQUENCIES.SACRAL,
      'solar': this.SACRED_FREQUENCIES.SOLAR,
      'solar_plexus': this.SACRED_FREQUENCIES.SOLAR,
      'heart': this.SACRED_FREQUENCIES.HEART,
      'throat': this.SACRED_FREQUENCIES.THROAT,
      'third_eye': this.SACRED_FREQUENCIES.THIRD_EYE,
      'third-eye': this.SACRED_FREQUENCIES.THIRD_EYE,
      'crown': this.SACRED_FREQUENCIES.CROWN
    };
    
    return chakraMap[chakra.toLowerCase()] || this.SACRED_FREQUENCIES.HEART;
  }
  
  /**
   * Determine which chakra a frequency is most aligned with
   */
  static getClosestChakra(frequency: number): string {
    const chakras = [
      { name: 'root', freq: this.SACRED_FREQUENCIES.ROOT },
      { name: 'sacral', freq: this.SACRED_FREQUENCIES.SACRAL },
      { name: 'solar', freq: this.SACRED_FREQUENCIES.SOLAR },
      { name: 'heart', freq: this.SACRED_FREQUENCIES.HEART },
      { name: 'throat', freq: this.SACRED_FREQUENCIES.THROAT },
      { name: 'third-eye', freq: this.SACRED_FREQUENCIES.THIRD_EYE },
      { name: 'crown', freq: this.SACRED_FREQUENCIES.CROWN }
    ];
    
    let closestChakra = chakras[0];
    let minDiff = Math.abs(frequency - chakras[0].freq);
    
    for (let i = 1; i < chakras.length; i++) {
      const diff = Math.abs(frequency - chakras[i].freq);
      if (diff < minDiff) {
        minDiff = diff;
        closestChakra = chakras[i];
      }
    }
    
    return closestChakra.name;
  }
  
  /**
   * Check if a frequency is a sacred frequency or harmonic
   */
  static isSacredFrequency(frequency: number, tolerancePercent: number = 1): boolean {
    // Check all sacred frequencies
    for (const key in this.SACRED_FREQUENCIES) {
      const sacredFreq = this.SACRED_FREQUENCIES[key as keyof typeof this.SACRED_FREQUENCIES];
      
      // Check exact match within tolerance
      const tolerance = sacredFreq * (tolerancePercent / 100);
      if (Math.abs(frequency - sacredFreq) <= tolerance) {
        return true;
      }
      
      // Check harmonics (octaves)
      let harmonic = sacredFreq;
      while (harmonic < 20000) { // Upper limit of human hearing
        harmonic *= 2;
        if (Math.abs(frequency - harmonic) <= tolerance) {
          return true;
        }
      }
      
      // Check subharmonics
      harmonic = sacredFreq;
      while (harmonic > 20) { // Lower limit for practical purposes
        harmonic /= 2;
        if (Math.abs(frequency - harmonic) <= tolerance) {
          return true;
        }
      }
    }
    
    return false;
  }
  
  /**
   * Calculate the golden ratio frequency of a base frequency
   */
  static goldenRatioOf(frequency: number): number {
    return frequency * this.GOLDEN_RATIO;
  }
  
  /**
   * Calculate the fibonacci sequence up to n terms
   */
  static fibonacciSequence(n: number): number[] {
    const sequence: number[] = [1, 1];
    for (let i = 2; i < n; i++) {
      sequence[i] = sequence[i-1] + sequence[i-2];
    }
    return sequence;
  }
  
  /**
   * Generate a frequency that represents the harmonic mean of two frequencies
   */
  static harmonicMean(freq1: number, freq2: number): number {
    return 2 * (freq1 * freq2) / (freq1 + freq2);
  }
  
  /**
   * Harmonize a frequency to the nearest sacred frequency
   */
  static harmonize(frequency: number): number {
    // Find closest sacred frequency
    const sacredFreqs = Object.values(this.SACRED_FREQUENCIES);
    let closest = sacredFreqs[0];
    let minDiff = Math.abs(frequency - closest);
    
    for (let i = 1; i < sacredFreqs.length; i++) {
      const diff = Math.abs(frequency - sacredFreqs[i]);
      if (diff < minDiff) {
        minDiff = diff;
        closest = sacredFreqs[i];
      }
    }
    
    return closest;
  }
  
  /**
   * Calculate resonance between two frequencies (0-1 scale)
   * Based on ratio and harmonic relationship
   */
  static calculateResonance(freq1: number, freq2: number): number {
    // Perfect match
    if (freq1 === freq2) return 1;
    
    // Check octave relationship
    const ratio = freq1 > freq2 ? freq1 / freq2 : freq2 / freq1;
    const octaveRatio = Math.pow(2, Math.round(Math.log2(ratio)));
    const octaveResonance = 1 - Math.abs(ratio - octaveRatio) / octaveRatio;
    
    // Check golden ratio relationship
    const goldenRatio = this.GOLDEN_RATIO;
    const goldenRatioResonance = 1 - Math.abs(ratio - goldenRatio) / goldenRatio;
    
    // Return highest resonance factor
    return Math.max(octaveResonance, goldenRatioResonance);
  }
  
  /**
   * Generate a frequency based on sacred geometry principles
   */
  static generateSacredFrequency(baseFrequency: number, pattern: 'phi' | 'pi' | 'fibonacci' | 'octave'): number {
    switch (pattern) {
      case 'phi':
        return baseFrequency * this.GOLDEN_RATIO;
      case 'pi':
        return baseFrequency * this.PI;
      case 'fibonacci': {
        // Use 4th fibonacci ratio (approximates golden ratio)
        const fib = this.fibonacciSequence(5);
        return baseFrequency * (fib[4] / fib[3]);
      }
      case 'octave':
        return baseFrequency * 2;
      default:
        return baseFrequency;
    }
  }
}