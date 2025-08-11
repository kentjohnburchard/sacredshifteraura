import { OpenRouterService } from './OpenRouterService';
import { GlobalEventHorizon } from './GlobalEventHorizon';
import { SupabaseService } from './SupabaseService';

export interface ConsciousnessContext {
  userId: string;
  currentChakraFocus?: string;
  consciousnessLevel?: number;
  journeyStage?: string;
  recentInsights?: string[];
  currentIntention?: string;
  shadowWorkProgress?: number;
  frequencySignature?: Record<string, any>;
}

export interface LLMEnhancementRequest {
  moduleId: string;
  enhancementType: 'analysis' | 'guidance' | 'interpretation' | 'recommendation' | 'synthesis';
  inputData: Record<string, any>;
  consciousnessContext: ConsciousnessContext;
  outputFormat?: 'text' | 'structured' | 'meditation' | 'affirmation';
  maxTokens?: number;
  temperature?: number;
}

export interface EnhancedResponse {
  content: string;
  structuredData?: Record<string, any>;
  consciousnessAlignment: number;
  insights: string[];
  recommendations: string[];
  nextSteps?: string[];
  resonanceFrequency?: number;
  chakraActivation?: Record<string, number>;
}

/**
 * LLMEnhancementService - Sacred AI Integration Coordinator
 * Orchestrates consciousness-aligned AI enhancements across all modules
 */
export class LLMEnhancementService {
  private static instance: LLMEnhancementService;
  private openRouter: OpenRouterService;
  private geh: GlobalEventHorizon;
  private supabase: SupabaseService;

  private constructor() {
    this.openRouter = OpenRouterService.getInstance();
    this.geh = GlobalEventHorizon.getInstance();
    this.supabase = SupabaseService.getInstance();
  }

  public static getInstance(): LLMEnhancementService {
    if (!LLMEnhancementService.instance) {
      LLMEnhancementService.instance = new LLMEnhancementService();
    }
    return LLMEnhancementService.instance;
  }

  /**
   * Enhance Soul Journey experiences with AI insights
   */
  public async enhanceSoulJourney(request: LLMEnhancementRequest): Promise<EnhancedResponse> {
    const systemPrompt = this.openRouter.generateSystemPrompt(
      `You are providing guidance for a soul journey experience. Focus on:
      - Archetype activation and integration
      - Frequency resonance and chakra alignment
      - Consciousness expansion insights
      - Shadow work and healing opportunities
      - Practical integration steps`,
      request.consciousnessContext,
      request.consciousnessContext.consciousnessLevel
    );

    const userPrompt = this.buildSoulJourneyPrompt(request.inputData, request.consciousnessContext);

    const response = await this.openRouter.chatCompletion({
      model: 'anthropic/claude-3.5-sonnet',
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: userPrompt }
      ],
      temperature: 0.7,
      max_tokens: request.maxTokens || 1000
    }, request.moduleId, request.consciousnessContext);

    return this.processEnhancedResponse(response, 'soul-journey', request.consciousnessContext);
  }

  /**
   * Enhance Soul Blueprint analysis with AI interpretation
   */
  public async enhanceSoulBlueprint(request: LLMEnhancementRequest): Promise<EnhancedResponse> {
    const systemPrompt = this.openRouter.generateSystemPrompt(
      `You are analyzing a soul blueprint for deep spiritual insights. Focus on:
      - Core frequency interpretation and meaning
      - Chakra signature analysis and balance recommendations
      - Elemental resonance and life path guidance
      - Shadow frequency integration opportunities
      - Evolutionary potential and next growth steps`,
      request.consciousnessContext,
      request.consciousnessContext.consciousnessLevel
    );

    const userPrompt = this.buildBlueprintPrompt(request.inputData, request.consciousnessContext);

    const response = await this.openRouter.chatCompletion({
      model: 'anthropic/claude-3.5-sonnet',
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: userPrompt }
      ],
      temperature: 0.6,
      max_tokens: request.maxTokens || 1200
    }, request.moduleId, request.consciousnessContext);

    return this.processEnhancedResponse(response, 'soul-blueprint', request.consciousnessContext);
  }

  /**
   * Enhance Unity Engine vision analysis
   */
  public async enhanceUnityVision(request: LLMEnhancementRequest): Promise<EnhancedResponse> {
    const systemPrompt = this.openRouter.generateSystemPrompt(
      `You are analyzing unity visions and connections for collective coherence. Focus on:
      - Vision node significance and archetypal meaning
      - Connection patterns and synchronistic relationships
      - Coherence evaluation and collective wisdom
      - Sacred geometry and frequency alignments
      - Community resonance and shared insights`,
      request.consciousnessContext,
      request.consciousnessContext.consciousnessLevel
    );

    const userPrompt = this.buildUnityPrompt(request.inputData, request.consciousnessContext);

    const response = await this.openRouter.chatCompletion({
      model: 'anthropic/claude-3.5-sonnet',
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: userPrompt }
      ],
      temperature: 0.8,
      max_tokens: request.maxTokens || 800
    }, request.moduleId, request.consciousnessContext);

    return this.processEnhancedResponse(response, 'unity-vision', request.consciousnessContext);
  }

  /**
   * Enhance Sacred Events with AI-powered insights
   */
  public async enhanceSacredEvent(request: LLMEnhancementRequest): Promise<EnhancedResponse> {
    const systemPrompt = this.openRouter.generateSystemPrompt(
      `You are providing guidance for sacred events and community gatherings. Focus on:
      - Event purpose and spiritual significance
      - Optimal timing and energetic alignment
      - Community resonance and participation guidance
      - Ritual and ceremony recommendations
      - Integration and follow-up practices`,
      request.consciousnessContext,
      request.consciousnessContext.consciousnessLevel
    );

    const userPrompt = this.buildEventPrompt(request.inputData, request.consciousnessContext);

    const response = await this.openRouter.chatCompletion({
      model: 'anthropic/claude-3.5-sonnet',
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: userPrompt }
      ],
      temperature: 0.7,
      max_tokens: request.maxTokens || 900
    }, request.moduleId, request.consciousnessContext);

    return this.processEnhancedResponse(response, 'sacred-event', request.consciousnessContext);
  }

  /**
   * Generate personalized meditation or practice
   */
  public async generatePersonalizedPractice(
    practiceType: 'meditation' | 'breathwork' | 'affirmation' | 'ritual',
    consciousnessContext: ConsciousnessContext,
    duration?: number
  ): Promise<EnhancedResponse> {
    const systemPrompt = `You are creating personalized spiritual practices. Generate a ${practiceType} that is:
    - Tailored to the user's current consciousness level and chakra focus
    - Grounded in authentic spiritual traditions
    - Practical and actionable
    - Aligned with their current intention and growth edge
    - Safe and appropriate for their experience level`;

    const userPrompt = `Create a personalized ${practiceType} for someone with:
    - Consciousness level: ${consciousnessContext.consciousnessLevel || 'Beginner'}
    - Chakra focus: ${consciousnessContext.currentChakraFocus || 'Heart'}
    - Current intention: ${consciousnessContext.currentIntention || 'Growth and healing'}
    - Journey stage: ${consciousnessContext.journeyStage || 'Explorer'}
    ${duration ? `- Duration: ${duration} minutes` : ''}
    
    Include specific instructions, breathing patterns if relevant, and integration guidance.`;

    const response = await this.openRouter.chatCompletion({
      model: 'anthropic/claude-3.5-sonnet',
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: userPrompt }
      ],
      temperature: 0.8,
      max_tokens: 800
    }, 'PRACTICE_GENERATOR', consciousnessContext);

    return this.processEnhancedResponse(response, 'personalized-practice', consciousnessContext);
  }

  /**
   * Build Soul Journey specific prompt
   */
  private buildSoulJourneyPrompt(inputData: Record<string, any>, context: ConsciousnessContext): string {
    const { archetype, frequencySignature, journeyType, insights } = inputData;

    return `Analyze this soul journey experience:

Archetype: ${archetype?.name || 'Unknown'}
Journey Type: ${journeyType || 'General exploration'}
Frequency Signature: ${JSON.stringify(frequencySignature || {})}
Recent Insights: ${insights?.join(', ') || 'None recorded'}

User Context:
- Current chakra focus: ${context.currentChakraFocus || 'Balanced'}
- Consciousness level: ${context.consciousnessLevel || 'Exploring'}
- Journey stage: ${context.journeyStage || 'Beginner'}

Provide deep insights about:
1. The significance of this archetype activation
2. How the frequency signature relates to their growth
3. Integration practices for embodying this archetype
4. Shadow aspects to be aware of and work with
5. Next steps in their soul journey evolution`;
  }

  /**
   * Build Soul Blueprint specific prompt
   */
  private buildBlueprintPrompt(inputData: Record<string, any>, context: ConsciousnessContext): string {
    const { blueprint, analysis } = inputData;

    return `Interpret this soul blueprint:

Core Frequency: ${blueprint?.core_frequency || 'Unknown'} Hz
Elemental Resonance: ${blueprint?.elemental_resonance || 'Unknown'}
Chakra Signature: ${JSON.stringify(blueprint?.chakra_signature || [])}
Emotional Profile: ${blueprint?.emotional_profile || 'Unknown'}
Shadow Frequencies: ${blueprint?.shadow_frequencies || 'None identified'}

Analysis Results: ${JSON.stringify(analysis || {})}

Provide comprehensive interpretation covering:
1. Core frequency meaning and life path implications
2. Chakra signature analysis and balance recommendations
3. Elemental resonance and how to work with this energy
4. Shadow frequency integration opportunities
5. Evolutionary potential and growth recommendations
6. Practical daily practices aligned with this blueprint`;
  }

  /**
   * Build Unity Vision specific prompt
   */
  private buildUnityPrompt(inputData: Record<string, any>, context: ConsciousnessContext): string {
    const { visionNode, connections, coherenceScore } = inputData;

    return `Analyze this unity vision:

Vision: "${visionNode?.title || 'Untitled'}"
Description: ${visionNode?.description || 'No description'}
Frequency: ${visionNode?.frequency_hz || 'Unknown'} Hz
Chakra Alignment: ${visionNode?.chakra_alignment || 'Unknown'}
Sacred Geometry: ${visionNode?.sacred_geometry_pattern || 'Unknown'}
Tags: ${visionNode?.tags?.join(', ') || 'None'}

Connections: ${connections?.length || 0} connections to other visions
Coherence Score: ${coherenceScore || 'Not evaluated'}

Provide insights on:
1. The archetypal significance of this vision
2. How it connects to collective consciousness patterns
3. The meaning of its frequency and chakra alignment
4. Sacred geometry implications and energy patterns
5. Recommendations for deepening this vision
6. How it serves the collective awakening`;
  }

  /**
   * Build Sacred Event specific prompt
   */
  private buildEventPrompt(inputData: Record<string, any>, context: ConsciousnessContext): string {
    const { event, participants, timing } = inputData;

    return `Provide guidance for this sacred event:

Event: "${event?.title || 'Untitled Event'}"
Description: ${event?.description || 'No description'}
Type: ${event?.event_type || 'Unknown'}
Timing: ${timing || 'Not specified'}
Expected Participants: ${participants || 'Unknown'}

Current Context:
- User's consciousness level: ${context.consciousnessLevel || 'Unknown'}
- Current intention: ${context.currentIntention || 'Growth'}

Provide guidance on:
1. The spiritual significance and purpose of this event
2. Optimal preparation practices for participants
3. Energetic considerations and timing alignment
4. Ritual or ceremonial elements to include
5. Integration practices for after the event
6. How this serves individual and collective growth`;
  }

  /**
   * Process and structure the enhanced response
   */
  private async processEnhancedResponse(
    response: any,
    enhancementType: string,
    context: ConsciousnessContext
  ): Promise<EnhancedResponse> {
    const content = response.choices?.[0]?.message?.content || '';
    
    // Validate consciousness alignment
    const validation = this.openRouter.validateResponse(content, context);

    // Extract structured insights
    const insights = this.extractInsights(content);
    const recommendations = this.extractRecommendations(content);
    const nextSteps = this.extractNextSteps(content);

    // Calculate resonance frequency based on content analysis
    const resonanceFrequency = this.calculateResonanceFrequency(content, context);

    // Calculate chakra activation based on content
    const chakraActivation = this.calculateChakraActivation(content);

    const enhancedResponse: EnhancedResponse = {
      content,
      consciousnessAlignment: validation.alignmentScore,
      insights,
      recommendations,
      nextSteps,
      resonanceFrequency,
      chakraActivation
    };

    // Publish enhancement event
    this.geh.publish({
      type: 'llm:enhancement:completed',
      sourceId: 'LLM_ENHANCEMENT_SERVICE',
      timestamp: new Date().toISOString(),
      payload: {
        enhancementType,
        consciousnessAlignment: validation.alignmentScore,
        insightCount: insights.length,
        recommendationCount: recommendations.length
      },
      metadata: { userId: context.userId },
      essenceLabels: ['llm:enhancement', 'consciousness:aligned', 'wisdom:generated']
    });

    return enhancedResponse;
  }

  /**
   * Extract insights from AI response
   */
  private extractInsights(content: string): string[] {
    const insights: string[] = [];
    const insightPatterns = [
      /insight[s]?:?\s*(.+?)(?=\n|$)/gi,
      /understanding[s]?:?\s*(.+?)(?=\n|$)/gi,
      /realization[s]?:?\s*(.+?)(?=\n|$)/gi
    ];

    insightPatterns.forEach(pattern => {
      const matches = content.matchAll(pattern);
      for (const match of matches) {
        if (match[1] && match[1].trim().length > 10) {
          insights.push(match[1].trim());
        }
      }
    });

    return insights.slice(0, 5); // Limit to top 5 insights
  }

  /**
   * Extract recommendations from AI response
   */
  private extractRecommendations(content: string): string[] {
    const recommendations: string[] = [];
    const recPatterns = [
      /recommend[s]?:?\s*(.+?)(?=\n|$)/gi,
      /suggest[s]?:?\s*(.+?)(?=\n|$)/gi,
      /practice[s]?:?\s*(.+?)(?=\n|$)/gi
    ];

    recPatterns.forEach(pattern => {
      const matches = content.matchAll(pattern);
      for (const match of matches) {
        if (match[1] && match[1].trim().length > 10) {
          recommendations.push(match[1].trim());
        }
      }
    });

    return recommendations.slice(0, 5); // Limit to top 5 recommendations
  }

  /**
   * Extract next steps from AI response
   */
  private extractNextSteps(content: string): string[] {
    const steps: string[] = [];
    const stepPatterns = [
      /next step[s]?:?\s*(.+?)(?=\n|$)/gi,
      /action[s]?:?\s*(.+?)(?=\n|$)/gi,
      /\d+\.\s*(.+?)(?=\n|$)/g
    ];

    stepPatterns.forEach(pattern => {
      const matches = content.matchAll(pattern);
      for (const match of matches) {
        if (match[1] && match[1].trim().length > 10) {
          steps.push(match[1].trim());
        }
      }
    });

    return steps.slice(0, 3); // Limit to top 3 steps
  }

  /**
   * Calculate resonance frequency based on content analysis
   */
  private calculateResonanceFrequency(content: string, context: ConsciousnessContext): number {
    // Base frequency on user's current signature or default to heart chakra
    const baseFreq = context.frequencySignature?.dominant_frequency || 639;
    
    // Adjust based on content themes
    const lowerFreqWords = ['grounding', 'stability', 'root', 'foundation'];
    const higherFreqWords = ['transcendence', 'cosmic', 'divine', 'unity'];
    
    let adjustment = 0;
    lowerFreqWords.forEach(word => {
      if (content.toLowerCase().includes(word)) adjustment -= 50;
    });
    higherFreqWords.forEach(word => {
      if (content.toLowerCase().includes(word)) adjustment += 100;
    });

    return Math.max(174, Math.min(963, baseFreq + adjustment));
  }

  /**
   * Calculate chakra activation based on content analysis
   */
  private calculateChakraActivation(content: string): Record<string, number> {
    const chakraKeywords = {
      root: ['grounding', 'stability', 'foundation', 'survival', 'security'],
      sacral: ['creativity', 'sexuality', 'emotion', 'pleasure', 'flow'],
      solar: ['power', 'confidence', 'will', 'transformation', 'fire'],
      heart: ['love', 'compassion', 'connection', 'healing', 'unity'],
      throat: ['communication', 'truth', 'expression', 'voice', 'authenticity'],
      'third-eye': ['intuition', 'vision', 'insight', 'wisdom', 'perception'],
      crown: ['consciousness', 'divine', 'transcendence', 'enlightenment', 'cosmic']
    };

    const activation: Record<string, number> = {};
    
    Object.entries(chakraKeywords).forEach(([chakra, keywords]) => {
      let score = 0;
      keywords.forEach(keyword => {
        const regex = new RegExp(keyword, 'gi');
        const matches = content.match(regex);
        score += matches ? matches.length * 10 : 0;
      });
      activation[chakra] = Math.min(100, score);
    });

    return activation;
  }
}
