import { OSLabel } from '../types';

/**
 * LabelProcessor - The Symbolic Language Processor
 * Implements the Principle of Vibration through semantic frequency matching
 */
export class LabelProcessor {
  /**
   * Check if any target label resonates with (is present in) required labels
   */
  public resonates(targetLabels: OSLabel[] | undefined, requiredLabels: OSLabel[]): boolean {
    if (!targetLabels || targetLabels.length === 0) return false;
    return requiredLabels.some(required => targetLabels.includes(required));
  }

  /**
   * Calculate resonance score - the degree of semantic overlap
   */
  public getResonanceScore(targetLabels: OSLabel[] | undefined, referenceLabels: OSLabel[]): number {
    if (!targetLabels || targetLabels.length === 0 || referenceLabels.length === 0) return 0;
    
    const targetSet = new Set(targetLabels);
    const matches = referenceLabels.filter(label => targetSet.has(label));
    return matches.length;
  }

  /**
   * Check if all query labels are satisfied by item labels
   */
  public satisfiesAll(itemLabels: OSLabel[] | undefined, queryLabels: OSLabel[]): boolean {
    if (!itemLabels || itemLabels.length === 0) return queryLabels.length === 0;
    const itemSet = new Set(itemLabels);
    return queryLabels.every(query => itemSet.has(query));
  }

  /**
   * Detect logical inconsistencies in label sets (Super-Tautology principle)
   */
  public detectDissonance(labels: OSLabel[] | undefined): string[] {
    const conflicts: string[] = [];
    if (!labels || labels.length === 0) return conflicts;

    const labelSet = new Set(labels);

    // Security posture conflicts
    if (labelSet.has("security:secure") && labelSet.has("security:vulnerable")) {
      conflicts.push("Conflicting security posture: cannot be both 'secure' and 'vulnerable'.");
    }

    // Performance conflicts
    if (labelSet.has("performance:fast") && labelSet.has("performance:slow")) {
      conflicts.push("Conflicting performance characteristics: cannot be both 'fast' and 'slow'.");
    }

    // State conflicts
    if (labelSet.has("state:active") && labelSet.has("state:inactive")) {
      conflicts.push("Conflicting states: cannot be both 'active' and 'inactive'.");
    }

    // Access level conflicts
    if (labelSet.has("access:public") && labelSet.has("access:private")) {
      conflicts.push("Conflicting access levels: cannot be both 'public' and 'private'.");
    }

    return conflicts;
  }

  /**
   * Extract domain from a label (e.g., "security:authentication" -> "security")
   */
  public getDomain(label: OSLabel): string {
    const colonIndex = label.indexOf(':');
    return colonIndex !== -1 ? label.substring(0, colonIndex) : label;
  }

  /**
   * Group labels by domain
   */
  public groupByDomain(labels: OSLabel[]): Record<string, OSLabel[]> {
    const groups: Record<string, OSLabel[]> = {};
    
    labels.forEach(label => {
      const domain = this.getDomain(label);
      if (!groups[domain]) {
        groups[domain] = [];
      }
      groups[domain].push(label);
    });

    return groups;
  }

  /**
   * Find the most resonant labels between two sets
   */
  public findResonantLabels(set1: OSLabel[], set2: OSLabel[]): OSLabel[] {
    const set2Labels = new Set(set2);
    return set1.filter(label => set2Labels.has(label));
  }
}