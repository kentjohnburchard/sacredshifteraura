import { EventBus } from '../EventBus';
import { GlobalEventHorizon } from '../GlobalEventHorizon';
import { ModuleManager } from '../ModuleManager';
import { ModuleRegistry } from '../ModuleRegistry';
import { LabelProcessor } from '../LabelProcessor';
import { SystemIntegrityService } from '../SystemIntegrityService';
import { CoherenceValidator } from '../../utils/CoherenceValidator';
import { 
  ArchitecturalProposal,
  ArchitecturalChange,
  ResourceImpact,
  ImplementationStep
} from '../../types/sgc';
import { ModuleManifest } from '../../types';
import { v4 as uuidv4 } from 'uuid';

/**
 * ArchitecturalHarmonizer - System Architecture Evolution
 * 
 * Analyzes the current system architecture and proposes coherence-enhancing
 * improvements. This is the metacognitive aspect of the system that enables
 * structural self-awareness and evolution.
 */
export class ArchitecturalHarmonizer {
  private static instance: ArchitecturalHarmonizer;
  private eventBus: EventBus;
  private geh: GlobalEventHorizon;
  private moduleManager: ModuleManager;
  private registry: ModuleRegistry;
  private labelProcessor: LabelProcessor;
  private integrityService: SystemIntegrityService;
  
  private isActive = false;
  private analysisInterval: number | null = null;
  private activeProposals: Map<string, ArchitecturalProposal> = new Map();
  
  private constructor(moduleManager?: ModuleManager) {
    this.eventBus = EventBus.getInstance();
    this.geh = GlobalEventHorizon.getInstance();
    this.moduleManager = moduleManager || new ModuleManager();
    this.registry = new ModuleRegistry();
    this.labelProcessor = new LabelProcessor();
    this.integrityService = SystemIntegrityService.getInstance();
  }
  
  public static getInstance(moduleManager?: ModuleManager): ArchitecturalHarmonizer {
    if (!ArchitecturalHarmonizer.instance) {
      ArchitecturalHarmonizer.instance = new ArchitecturalHarmonizer(moduleManager);
    }
    return ArchitecturalHarmonizer.instance;
  }
  
  /**
   * Start the ArchitecturalHarmonizer
   */
  public start(): void {
    if (this.isActive) return;
    
    this.isActive = true;
    console.log('[ArchitecturalHarmonizer] Starting architectural analysis...');
    
    // Run initial analysis
    this.runArchitecturalAnalysis();
    
    // Set up recurring analysis
    this.analysisInterval = window.setInterval(() => {
      this.runArchitecturalAnalysis();
    }, 3600000); // Once per hour
    
    this.eventBus.publish(
      'sgc:harmonizer:started',
      'ARCHITECTURAL_HARMONIZER',
      { status: 'active' },
      ['sgc:system', 'architecture:analysis', 'system:self-awareness']
    );
  }
  
  /**
   * Stop the ArchitecturalHarmonizer
   */
  public stop(): void {
    if (!this.isActive) return;
    
    this.isActive = false;
    
    if (this.analysisInterval !== null) {
      clearInterval(this.analysisInterval);
      this.analysisInterval = null;
    }
    
    this.eventBus.publish(
      'sgc:harmonizer:stopped',
      'ARCHITECTURAL_HARMONIZER',
      { pendingProposals: this.activeProposals.size },
      ['sgc:system', 'architecture:dormant']
    );
  }
  
  /**
   * Run a full architectural analysis
   */
  public async runArchitecturalAnalysis(): Promise<void> {
    if (!this.isActive) return;
    
    try {
      console.log('[ArchitecturalHarmonizer] Running architectural analysis...');
      
      // Get current system state
      const osState = this.moduleManager.getOSState();
      
      // Get all known modules
      const allModules = this.registry.getAllKnownManifests();
      
      // Run integrity check
      const integrityReport = await this.integrityService.checkIntegrity();
      
      // Analyze module coherence
      const moduleCoherenceIssues = this.analyzeModuleCoherence(allModules);
      
      // Analyze architecture gaps
      const architectureGaps = this.analyzeArchitectureGaps(allModules, osState);
      
      // Analyze resource distribution
      const resourceIssues = this.analyzeResourceDistribution(allModules, osState);
      
      // Generate proposals based on findings
      if (moduleCoherenceIssues.length > 0) {
        await this.generateCoherenceProposal(moduleCoherenceIssues, integrityReport.overallScore);
      }
      
      if (architectureGaps.length > 0) {
        await this.generateArchitectureProposal(architectureGaps);
      }
      
      if (resourceIssues.length > 0) {
        await this.generateResourceProposal(resourceIssues);
      }
      
      // Publish analysis complete event
      this.eventBus.publish(
        'sgc:architecture:analyzed',
        'ARCHITECTURAL_HARMONIZER',
        { 
          coherenceIssues: moduleCoherenceIssues.length,
          architectureGaps: architectureGaps.length,
          resourceIssues: resourceIssues.length,
          systemIntegrity: integrityReport.overallScore,
          proposalsGenerated: this.activeProposals.size
        },
        ['sgc:architecture', 'analysis:complete', 'system:introspection']
      );
    } catch (error) {
      console.error('[ArchitecturalHarmonizer] Analysis error:', error);
      
      this.eventBus.publish(
        'sgc:architecture:error',
        'ARCHITECTURAL_HARMONIZER',
        { error: (error as Error).message },
        ['sgc:architecture', 'error:analysis', 'system:resilience']
      );
    }
  }
  
  /**
   * Analyze module coherence issues
   */
  private analyzeModuleCoherence(modules: ModuleManifest[]): CoherenceIssue[] {
    const issues: CoherenceIssue[] = [];
    
    // Check each module for coherence issues
    for (const module of modules) {
      const validation = CoherenceValidator.validateManifest(module);
      
      if (!validation.isValid) {
        issues.push({
          moduleId: module.id,
          moduleName: module.name,
          issues: validation.issues,
          integrityScore: validation.integrityScore,
          severity: validation.integrityScore < 0.5 ? 'high' : 'medium',
          suggestedFix: this.suggestCoherenceFix(validation.issues)
        });
      }
      
      // Check for semantic dissonance
      const dissonance = this.labelProcessor.detectDissonance(module.essenceLabels);
      if (dissonance.length > 0) {
        issues.push({
          moduleId: module.id,
          moduleName: module.name,
          issues: dissonance,
          integrityScore: module.integrityScore,
          severity: 'medium',
          suggestedFix: 'Resolve semantic label dissonance by ensuring labels are logically consistent'
        });
      }
      
      // Check for weak Telos alignment
      const telosKeys = Object.keys(module.telosAlignment);
      if (telosKeys.length === 0) {
        issues.push({
          moduleId: module.id,
          moduleName: module.name,
          issues: ['No Telos alignment declared'],
          integrityScore: module.integrityScore,
          severity: 'medium',
          suggestedFix: 'Add appropriate Telos alignments to the module manifest'
        });
      }
    }
    
    return issues;
  }
  
  /**
   * Analyze architecture gaps
   */
  private analyzeArchitectureGaps(modules: ModuleManifest[], osState: any): ArchitectureGap[] {
    const gaps: ArchitectureGap[] = [];
    
    // Collect all capabilities
    const availableCapabilities = new Set<string>();
    modules.forEach(module => {
      module.capabilities.forEach(capability => availableCapabilities.add(capability));
    });
    
    // Check for missing core capabilities
    const coreCapabilities = [
      'authentication-provider',
      'data-processing',
      'user-management',
      'system-integrity',
      'event-management'
    ];
    
    for (const capability of coreCapabilities) {
      if (!availableCapabilities.has(capability)) {
        gaps.push({
          type: 'missing-capability',
          description: `Missing core capability: ${capability}`,
          severity: 'high',
          suggestedSolution: `Create a module providing the ${capability} capability`,
          relatedComponents: []
        });
      }
    }
    
    // Check for architectural pattern gaps
    const patterns = this.detectArchitecturalPatterns(modules);
    
    // Check for missing Observer pattern
    if (!patterns.includes('observer')) {
      gaps.push({
        type: 'missing-pattern',
        description: 'Missing Observer pattern for event handling',
        severity: 'medium',
        suggestedSolution: 'Implement Observer pattern for improved event handling',
        relatedComponents: ['EventBus', 'GlobalEventHorizon']
      });
    }
    
    // Check for missing Factory pattern
    if (!patterns.includes('factory')) {
      gaps.push({
        type: 'missing-pattern',
        description: 'Missing Factory pattern for object creation',
        severity: 'medium',
        suggestedSolution: 'Implement Factory pattern for object creation',
        relatedComponents: ['ModuleRegistry']
      });
    }
    
    return gaps;
  }
  
  /**
   * Analyze resource distribution
   */
  private analyzeResourceDistribution(modules: ModuleManifest[], osState: any): ResourceIssue[] {
    const issues: ResourceIssue[] = [];
    
    // Check for high resource usage modules
    const highResourceModules = modules.filter(m => m.resourceFootprintMB > 100);
    if (highResourceModules.length > 0) {
      issues.push({
        type: 'high-resource-usage',
        description: `${highResourceModules.length} modules have high resource usage`,
        severity: 'medium',
        affectedModules: highResourceModules.map(m => m.id),
        suggestedSolution: 'Optimize high resource usage modules or split functionality'
      });
    }
    
    // Check for resource allocation imbalance
    const totalResources = modules.reduce((sum, m) => sum + m.resourceFootprintMB, 0);
    const avgResourcePerModule = totalResources / modules.length;
    
    const highDeviationModules = modules.filter(m => 
      m.resourceFootprintMB > avgResourcePerModule * 2
    );
    
    if (highDeviationModules.length > 0) {
      issues.push({
        type: 'resource-imbalance',
        description: 'Resource allocation is imbalanced across modules',
        severity: 'low',
        affectedModules: highDeviationModules.map(m => m.id),
        suggestedSolution: 'Redistribute functionality to balance resource usage'
      });
    }
    
    return issues;
  }
  
  /**
   * Generate a proposal to address coherence issues
   */
  private async generateCoherenceProposal(
    issues: CoherenceIssue[],
    systemIntegrity: number
  ): Promise<void> {
    const highSeverityIssues = issues.filter(i => i.severity === 'high');
    
    if (highSeverityIssues.length === 0 && systemIntegrity >= 0.8) {
      // No high severity issues and system integrity is good
      return;
    }
    
    // Create implementation steps
    const steps: ImplementationStep[] = [];
    
    // Group by module for more efficient implementation
    const moduleIssues = new Map<string, CoherenceIssue[]>();
    issues.forEach(issue => {
      if (!moduleIssues.has(issue.moduleId)) {
        moduleIssues.set(issue.moduleId, []);
      }
      moduleIssues.get(issue.moduleId)!.push(issue);
    });
    
    // Create steps for each module
    moduleIssues.forEach((moduleIssues, moduleId) => {
      const moduleName = moduleIssues[0]?.moduleName || moduleId;
      
      steps.push({
        id: uuidv4(),
        description: `Fix coherence issues in ${moduleName}`,
        estimatedComplexity: 4,
        dependsOn: [],
        status: 'pending'
      });
    });
    
    // Create validation step
    const validationStep: ImplementationStep = {
      id: uuidv4(),
      description: 'Validate coherence improvements',
      estimatedComplexity: 2,
      dependsOn: steps.map(s => s.id),
      status: 'pending'
    };
    
    steps.push(validationStep);
    
    // Create architectural changes
    const changes: ArchitecturalChange[] = issues.map(issue => ({
      type: 'modify',
      componentPath: `modules/${issue.moduleId}`,
      description: `Fix coherence issues in ${issue.moduleName}`,
      reason: issue.issues.join(', '),
      relatedTelos: []
    }));
    
    // Create resource impact
    const resourceImpact: ResourceImpact = {
      memoryDeltaMB: 0,
      processingDelta: 0.1, // Slight improvement in processing efficiency
      storageDeltaKB: 0,
      networkImpact: 'none'
    };
    
    // Create proposal
    const proposal: ArchitecturalProposal = {
      id: uuidv4(),
      timestamp: new Date().toISOString(),
      title: 'Coherence Enhancement Proposal',
      description: `Address ${issues.length} coherence issues across ${moduleIssues.size} modules`,
      targetComponents: Array.from(moduleIssues.keys()),
      proposedChanges: changes,
      expectedBenefits: [
        'Improved system coherence',
        'Higher module integrity scores',
        'Reduced semantic dissonance',
        'Better Telos alignment'
      ],
      coherenceImpact: 0.2, // Positive impact
      integrityImpact: 0.15, // Positive impact
      resourceImpact,
      implementationPlan: steps,
      status: 'draft',
      essenceLabels: [
        'sgc:proposal',
        'coherence:enhancement',
        'integrity:improvement',
        'architecture:refinement'
      ]
    };
    
    // Store proposal
    this.activeProposals.set(proposal.id, proposal);
    
    // Publish proposal event
    this.eventBus.publish(
      'sgc:proposal:created',
      'ARCHITECTURAL_HARMONIZER',
      { 
        proposalId: proposal.id,
        title: proposal.title,
        affectedComponents: proposal.targetComponents.length,
        coherenceImpact: proposal.coherenceImpact,
        status: proposal.status
      },
      ['sgc:proposal', 'coherence:enhancement', 'system:evolution']
    );
  }
  
  /**
   * Generate a proposal to address architecture gaps
   */
  private async generateArchitectureProposal(gaps: ArchitectureGap[]): Promise<void> {
    // Create implementation steps
    const steps: ImplementationStep[] = gaps.map(gap => ({
      id: uuidv4(),
      description: `Address ${gap.type}: ${gap.description}`,
      estimatedComplexity: gap.severity === 'high' ? 8 : gap.severity === 'medium' ? 5 : 3,
      dependsOn: [],
      status: 'pending'
    }));
    
    // Create architectural changes
    const changes: ArchitecturalChange[] = gaps.map(gap => ({
      type: gap.type.includes('missing') ? 'add' : 'modify',
      componentPath: gap.relatedComponents.length > 0 ? gap.relatedComponents[0] : 'system',
      description: gap.description,
      reason: gap.description,
      relatedTelos: []
    }));
    
    // Create resource impact
    const resourceImpact: ResourceImpact = {
      memoryDeltaMB: 5 * gaps.length, // Estimate 5MB per gap addressed
      processingDelta: 0.05, // Slight processing impact
      storageDeltaKB: 200 * gaps.length, // Estimate 200KB per gap addressed
      networkImpact: 'low'
    };
    
    // Create proposal
    const proposal: ArchitecturalProposal = {
      id: uuidv4(),
      timestamp: new Date().toISOString(),
      title: 'Architecture Enhancement Proposal',
      description: `Address ${gaps.length} architectural gaps`,
      targetComponents: gaps.flatMap(g => g.relatedComponents),
      proposedChanges: changes,
      expectedBenefits: [
        'Enhanced architectural patterns',
        'Improved capability coverage',
        'Better system resilience'
      ],
      coherenceImpact: 0.3, // Positive impact
      integrityImpact: 0.2, // Positive impact
      resourceImpact,
      implementationPlan: steps,
      status: 'draft',
      essenceLabels: [
        'sgc:proposal',
        'architecture:enhancement',
        'capability:expansion',
        'system:evolution'
      ]
    };
    
    // Store proposal
    this.activeProposals.set(proposal.id, proposal);
    
    // Publish proposal event
    this.eventBus.publish(
      'sgc:proposal:created',
      'ARCHITECTURAL_HARMONIZER',
      { 
        proposalId: proposal.id,
        title: proposal.title,
        affectedComponents: proposal.targetComponents.length,
        coherenceImpact: proposal.coherenceImpact,
        status: proposal.status
      },
      ['sgc:proposal', 'architecture:enhancement', 'system:evolution']
    );
  }
  
  /**
   * Generate a proposal to address resource issues
   */
  private async generateResourceProposal(issues: ResourceIssue[]): Promise<void> {
    // Create implementation steps
    const steps: ImplementationStep[] = issues.map(issue => ({
      id: uuidv4(),
      description: `Address ${issue.type}: ${issue.description}`,
      estimatedComplexity: issue.severity === 'high' ? 7 : issue.severity === 'medium' ? 5 : 3,
      dependsOn: [],
      status: 'pending'
    }));
    
    // Create architectural changes
    const changes: ArchitecturalChange[] = issues.map(issue => ({
      type: 'refactor',
      componentPath: issue.affectedModules[0] || 'system',
      description: issue.description,
      reason: issue.suggestedSolution,
      relatedTelos: []
    }));
    
    // Create resource impact
    const resourceImpact: ResourceImpact = {
      memoryDeltaMB: -20, // Negative means reduction (improvement)
      processingDelta: -0.1, // Negative means reduction (improvement)
      storageDeltaKB: 0,
      networkImpact: 'none'
    };
    
    // Create proposal
    const proposal: ArchitecturalProposal = {
      id: uuidv4(),
      timestamp: new Date().toISOString(),
      title: 'Resource Optimization Proposal',
      description: `Address ${issues.length} resource utilization issues`,
      targetComponents: issues.flatMap(i => i.affectedModules),
      proposedChanges: changes,
      expectedBenefits: [
        'Reduced resource footprint',
        'Improved system performance',
        'Better resource distribution'
      ],
      coherenceImpact: 0.1, // Small positive impact
      integrityImpact: 0.1, // Small positive impact
      resourceImpact,
      implementationPlan: steps,
      status: 'draft',
      essenceLabels: [
        'sgc:proposal',
        'resource:optimization',
        'performance:enhancement',
        'system:efficiency'
      ]
    };
    
    // Store proposal
    this.activeProposals.set(proposal.id, proposal);
    
    // Publish proposal event
    this.eventBus.publish(
      'sgc:proposal:created',
      'ARCHITECTURAL_HARMONIZER',
      { 
        proposalId: proposal.id,
        title: proposal.title,
        affectedComponents: proposal.targetComponents.length,
        resourceImpact: resourceImpact,
        status: proposal.status
      },
      ['sgc:proposal', 'resource:optimization', 'system:evolution']
    );
  }
  
  /**
   * Get all active architectural proposals
   */
  public getProposals(): ArchitecturalProposal[] {
    return Array.from(this.activeProposals.values());
  }
  
  /**
   * Get a specific proposal
   */
  public getProposal(proposalId: string): ArchitecturalProposal | undefined {
    return this.activeProposals.get(proposalId);
  }
  
  /**
   * Update proposal status
   */
  public updateProposalStatus(proposalId: string, status: 'draft' | 'review' | 'approved' | 'implemented' | 'rejected'): boolean {
    const proposal = this.activeProposals.get(proposalId);
    if (!proposal) {
      return false;
    }
    
    // Update status
    proposal.status = status;
    this.activeProposals.set(proposalId, proposal);
    
    // Publish status update event
    this.eventBus.publish(
      'sgc:proposal:statusUpdated',
      'ARCHITECTURAL_HARMONIZER',
      { 
        proposalId,
        status,
        title: proposal.title
      },
      ['sgc:proposal', 'status:updated', 'system:governance']
    );
    
    return true;
  }
  
  /**
   * Suggest fixes for coherence issues
   */
  private suggestCoherenceFix(issues: string[]): string {
    // Basic suggestions based on issue type
    if (issues.some(i => i.includes('Missing module ID'))) {
      return 'Add a unique module ID to the manifest';
    }
    
    if (issues.some(i => i.includes('must declare at least one capability'))) {
      return 'Add at least one capability to the module manifest';
    }
    
    if (issues.some(i => i.includes('must declare at least one essence label'))) {
      return 'Add meaningful essence labels to the module manifest';
    }
    
    if (issues.some(i => i.includes('must declare at least one Telos alignment'))) {
      return 'Add appropriate Telos alignments to the module manifest';
    }
    
    // Default suggestion
    return 'Review and address identified coherence issues in module manifest';
  }
  
  /**
   * Detect architectural patterns in modules
   */
  private detectArchitecturalPatterns(modules: ModuleManifest[]): string[] {
    const patterns: string[] = [];
    
    // Check for Observer pattern
    if (modules.some(m => m.capabilities.includes('event-management'))) {
      patterns.push('observer');
    }
    
    // Check for Factory pattern
    if (modules.some(m => m.capabilities.includes('object-creation'))) {
      patterns.push('factory');
    }
    
    // Check for Singleton pattern (all service modules)
    patterns.push('singleton');
    
    // Check for Strategy pattern
    if (modules.some(m => m.capabilities.includes('algorithm-selection'))) {
      patterns.push('strategy');
    }
    
    return patterns;
  }
}

/**
 * Coherence issue interface
 */
interface CoherenceIssue {
  moduleId: string;
  moduleName: string;
  issues: string[];
  integrityScore: number;
  severity: 'low' | 'medium' | 'high';
  suggestedFix: string;
}

/**
 * Architecture gap interface
 */
interface ArchitectureGap {
  type: 'missing-capability' | 'missing-pattern' | 'architectural-mismatch' | 'missing-integration';
  description: string;
  severity: 'low' | 'medium' | 'high';
  suggestedSolution: string;
  relatedComponents: string[];
}

/**
 * Resource issue interface
 */
interface ResourceIssue {
  type: 'high-resource-usage' | 'resource-imbalance' | 'resource-leak';
  description: string;
  severity: 'low' | 'medium' | 'high';
  affectedModules: string[];
  suggestedSolution: string;
}