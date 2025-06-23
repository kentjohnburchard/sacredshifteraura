import { LabelProcessor } from '../services/LabelProcessor';
import { ModuleManifest, OSLabel } from '../types';

/**
 * CoherenceValidator - Validates semantic coherence
 * 
 * Implements the Super-Tautology principle by providing
 * validation functions for semantic labels and module manifests.
 */
export class CoherenceValidator {
  private static labelProcessor = new LabelProcessor();
  
  /**
   * Validate a module manifest for completeness and coherence
   */
  public static validateManifest(manifest: ModuleManifest): {
    isValid: boolean;
    issues: string[];
    integrityScore: number;
  } {
    const issues: string[] = [];
    
    // Check for required fields
    if (!manifest.id) issues.push('Missing module ID');
    if (!manifest.name) issues.push('Missing module name');
    if (!manifest.version) issues.push('Missing module version');
    
    // Check capabilities
    if (!manifest.capabilities || manifest.capabilities.length === 0) {
      issues.push('Module must declare at least one capability');
    }
    
    // Check essence labels
    if (!manifest.essenceLabels || manifest.essenceLabels.length === 0) {
      issues.push('Module must declare at least one essence label');
    } else {
      // Check for essence label dissonance
      const dissonance = this.labelProcessor.detectDissonance(manifest.essenceLabels);
      issues.push(...dissonance);
    }
    
    // Check telos alignment
    if (!manifest.telosAlignment || Object.keys(manifest.telosAlignment).length === 0) {
      issues.push('Module must declare at least one Telos alignment');
    }
    
    // Check resource footprint
    if (!manifest.resourceFootprintMB || manifest.resourceFootprintMB <= 0) {
      issues.push('Module must declare a positive resource footprint');
    } else if (manifest.resourceFootprintMB > 500) {
      issues.push('Resource footprint seems excessively high (>500MB)');
    }
    
    // Calculate integrity score based on issues
    const isValid = issues.length === 0;
    
    // Base score starts at 1.0 and is reduced for each issue
    let integrityScore = 1.0;
    
    // Severity multipliers for different issue types
    issues.forEach(issue => {
      if (issue.includes('Missing')) {
        integrityScore -= 0.2; // Critical issues
      } else if (issue.includes('must declare')) {
        integrityScore -= 0.1; // Important issues
      } else {
        integrityScore -= 0.05; // Minor issues
      }
    });
    
    // Ensure score is between 0 and 1
    integrityScore = Math.max(0, Math.min(1, integrityScore));
    
    return {
      isValid,
      issues,
      integrityScore
    };
  }
  
  /**
   * Validate event essence labels for semantic coherence
   */
  public static validateEventLabels(
    eventType: string,
    essenceLabels: OSLabel[]
  ): {
    isValid: boolean;
    issues: string[];
  } {
    const issues: string[] = [];
    
    // Check for minimum labels
    if (!essenceLabels || essenceLabels.length === 0) {
      issues.push('Event must have at least one essence label');
    }
    
    // Check for label format
    for (const label of essenceLabels) {
      if (typeof label !== 'string') {
        issues.push(`Label must be a string, got ${typeof label}`);
        continue;
      }
      
      if (!label.includes(':') && !['system', 'user', 'module', 'data'].includes(label)) {
        issues.push(`Label "${label}" should use domain:aspect format`);
      }
    }
    
    // Check for dissonance
    const dissonance = this.labelProcessor.detectDissonance(essenceLabels);
    issues.push(...dissonance);
    
    // Check for event type/label alignment
    const eventDomain = eventType.split(':')[0];
    if (eventDomain && !essenceLabels.some(label => label.startsWith(eventDomain))) {
      issues.push(`Event of type "${eventType}" should have at least one label in the "${eventDomain}" domain`);
    }
    
    return {
      isValid: issues.length === 0,
      issues
    };
  }
  
  /**
   * Validate Telos declarations for coherence
   */
  public static validateTelos(
    telosId: string,
    essenceLabels: OSLabel[],
    description?: string
  ): {
    isValid: boolean;
    issues: string[];
  } {
    const issues: string[] = [];
    
    // Check telos ID format
    if (!telosId.includes(':')) {
      issues.push(`Telos ID "${telosId}" should use domain:aspect format`);
    }
    
    // Check for minimum labels
    if (!essenceLabels || essenceLabels.length < 3) {
      issues.push('Telos should have at least 3 essence labels for proper alignment');
    }
    
    // Check for label dissonance
    const dissonance = this.labelProcessor.detectDissonance(essenceLabels);
    issues.push(...dissonance);
    
    // Check if telos ID is reflected in labels
    const [telosDomain, telosAspect] = telosId.split(':');
    if (telosDomain && telosAspect) {
      if (!essenceLabels.includes(`${telosDomain}:${telosAspect}`)) {
        issues.push(`Telos ID "${telosId}" should be included in its essence labels`);
      }
    }
    
    // Check description
    if (!description || description.length < 10) {
      issues.push('Telos should have a meaningful description');
    }
    
    return {
      isValid: issues.length === 0,
      issues
    };
  }
}