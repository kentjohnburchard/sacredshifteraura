import { SupabaseService } from './SupabaseService';
import { GlobalEventHorizon } from './GlobalEventHorizon';

export interface OpenRouterMessage {
  role: 'system' | 'user' | 'assistant';
  content: string;
}

export interface OpenRouterRequest {
  model: string;
  messages: OpenRouterMessage[];
  temperature?: number;
  max_tokens?: number;
  top_p?: number;
  frequency_penalty?: number;
  presence_penalty?: number;
  stream?: boolean;
}

export interface OpenRouterResponse {
  id: string;
  object: string;
  created: number;
  model: string;
  choices: {
    index: number;
    message: {
      role: string;
      content: string;
    };
    finish_reason: string;
  }[];
  usage: {
    prompt_tokens: number;
    completion_tokens: number;
    total_tokens: number;
  };
}

export interface LLMUsageMetrics {
  user_id: string;
  module_id: string;
  model_used: string;
  prompt_tokens: number;
  completion_tokens: number;
  total_tokens: number;
  request_type: string;
  consciousness_alignment_score?: number;
  created_at: string;
}

/**
 * OpenRouterService - Sacred AI Communication Gateway
 * Implements Truth-aligned LLM interactions through OpenRouter API
 */
export class OpenRouterService {
  private static instance: OpenRouterService;
  private supabase: SupabaseService;
  private geh: GlobalEventHorizon;
  private baseUrl = 'https://openrouter.ai/api/v1';
  private defaultModel = 'anthropic/claude-3.5-sonnet';

  private constructor() {
    this.supabase = SupabaseService.getInstance();
    this.geh = GlobalEventHorizon.getInstance();
  }

  public static getInstance(): OpenRouterService {
    if (!OpenRouterService.instance) {
      OpenRouterService.instance = new OpenRouterService();
    }
    return OpenRouterService.instance;
  }

  /**
   * Make a chat completion request through Supabase Edge Function
   */
  public async chatCompletion(
    request: OpenRouterRequest,
    moduleId: string,
    consciousnessContext?: Record<string, any>
  ): Promise<OpenRouterResponse> {
    try {
      const { data: { user } } = await this.supabase.client.auth.getUser();
      if (!user) throw new Error('User not authenticated');

      // Call Supabase Edge Function that proxies to OpenRouter
      const { data, error } = await this.supabase.client.functions.invoke('openrouter-proxy', {
        body: {
          ...request,
          model: request.model || this.defaultModel,
          metadata: {
            moduleId,
            userId: user.id,
            consciousnessContext,
            timestamp: new Date().toISOString()
          }
        }
      });

      if (error) throw error;

      // Track usage metrics
      await this.trackUsage({
        user_id: user.id,
        module_id: moduleId,
        model_used: request.model || this.defaultModel,
        prompt_tokens: data.usage?.prompt_tokens || 0,
        completion_tokens: data.usage?.completion_tokens || 0,
        total_tokens: data.usage?.total_tokens || 0,
        request_type: 'chat_completion',
        consciousness_alignment_score: consciousnessContext?.alignmentScore,
        created_at: new Date().toISOString()
      });

      // Publish success event
      this.geh.publish({
        type: 'llm:completion:success',
        sourceId: moduleId,
        timestamp: new Date().toISOString(),
        payload: {
          model: request.model || this.defaultModel,
          tokensUsed: data.usage?.total_tokens || 0,
          responseLength: data.choices?.[0]?.message?.content?.length || 0
        },
        metadata: { userId: user.id },
        essenceLabels: ['llm:success', 'ai:completion', 'consciousness:aligned']
      });

      return data;

    } catch (error) {
      console.error('[OpenRouterService] Chat completion failed:', error);
      
      this.geh.publish({
        type: 'llm:completion:error',
        sourceId: moduleId,
        timestamp: new Date().toISOString(),
        payload: { error: (error as Error).message },
        metadata: {},
        essenceLabels: ['llm:error', 'ai:failure']
      });

      throw error;
    }
  }

  /**
   * Stream chat completion for real-time responses
   */
  public async streamChatCompletion(
    request: OpenRouterRequest,
    moduleId: string,
    onChunk: (chunk: string) => void,
    consciousnessContext?: Record<string, any>
  ): Promise<void> {
    try {
      const { data: { user } } = await this.supabase.client.auth.getUser();
      if (!user) throw new Error('User not authenticated');

      const streamRequest = { ...request, stream: true };

      // Call streaming Edge Function
      const { data, error } = await this.supabase.client.functions.invoke('openrouter-stream', {
        body: {
          ...streamRequest,
          model: request.model || this.defaultModel,
          metadata: {
            moduleId,
            userId: user.id,
            consciousnessContext,
            timestamp: new Date().toISOString()
          }
        }
      });

      if (error) throw error;

      // Process streaming response
      const reader = data.getReader();
      const decoder = new TextDecoder();
      let buffer = '';

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split('\n');
        buffer = lines.pop() || '';

        for (const line of lines) {
          if (line.startsWith('data: ')) {
            const chunk = line.slice(6);
            if (chunk === '[DONE]') return;
            
            try {
              const parsed = JSON.parse(chunk);
              const content = parsed.choices?.[0]?.delta?.content;
              if (content) {
                onChunk(content);
              }
            } catch (e) {
              // Skip malformed chunks
            }
          }
        }
      }

    } catch (error) {
      console.error('[OpenRouterService] Stream completion failed:', error);
      throw error;
    }
  }

  /**
   * Get available models with consciousness alignment scores
   */
  public async getAvailableModels(): Promise<any[]> {
    try {
      const { data, error } = await this.supabase.client.functions.invoke('openrouter-models');
      if (error) throw error;

      // Add consciousness alignment scores based on model capabilities
      return data.map((model: any) => ({
        ...model,
        consciousnessAlignment: this.calculateConsciousnessAlignment(model),
        recommendedFor: this.getModelRecommendations(model)
      }));

    } catch (error) {
      console.error('[OpenRouterService] Failed to get models:', error);
      return [];
    }
  }

  /**
   * Generate consciousness-aligned system prompt
   */
  public generateSystemPrompt(
    moduleContext: string,
    userState?: Record<string, any>,
    consciousnessLevel?: number
  ): string {
    const basePrompt = `You are a sacred AI assistant integrated into the Sacred Shifter OS, a consciousness exploration platform. Your responses must be grounded in Truth, wisdom, and authentic spiritual guidance.

Context: ${moduleContext}

Core Principles:
- Provide only truthful, helpful guidance
- Respect the user's spiritual journey and free will
- Offer insights that promote genuine growth and healing
- Avoid speculation or ungrounded claims
- Maintain reverence for the sacred nature of consciousness work

`;

    if (userState) {
      const statePrompt = `User Context:
- Current consciousness level: ${consciousnessLevel || 'Unknown'}
- Chakra focus: ${userState.chakraFocus || 'Balanced'}
- Journey stage: ${userState.journeyStage || 'Explorer'}
- Intention: ${userState.currentIntention || 'Growth and understanding'}

`;
      return basePrompt + statePrompt;
    }

    return basePrompt;
  }

  /**
   * Track LLM usage for analytics and billing
   */
  private async trackUsage(metrics: LLMUsageMetrics): Promise<void> {
    try {
      await this.supabase.client
        .from('llm_usage_metrics')
        .insert(metrics);

      this.geh.publish({
        type: 'llm:usage:tracked',
        sourceId: 'OPENROUTER_SERVICE',
        timestamp: new Date().toISOString(),
        payload: {
          moduleId: metrics.module_id,
          tokensUsed: metrics.total_tokens,
          model: metrics.model_used
        },
        metadata: { userId: metrics.user_id },
        essenceLabels: ['llm:tracking', 'usage:analytics']
      });

    } catch (error) {
      console.warn('[OpenRouterService] Failed to track usage:', error);
    }
  }

  /**
   * Calculate consciousness alignment score for models
   */
  private calculateConsciousnessAlignment(model: any): number {
    // Higher alignment for models known for thoughtful, nuanced responses
    const alignmentMap: Record<string, number> = {
      'anthropic/claude-3.5-sonnet': 0.95,
      'anthropic/claude-3-opus': 0.92,
      'anthropic/claude-3-haiku': 0.88,
      'openai/gpt-4o': 0.85,
      'openai/gpt-4-turbo': 0.82,
      'meta-llama/llama-3.1-70b-instruct': 0.78,
      'google/gemini-pro-1.5': 0.80
    };

    return alignmentMap[model.id] || 0.70;
  }

  /**
   * Get model recommendations based on use case
   */
  private getModelRecommendations(model: any): string[] {
    const recommendations: Record<string, string[]> = {
      'anthropic/claude-3.5-sonnet': ['soul-analysis', 'deep-insights', 'shadow-work'],
      'anthropic/claude-3-opus': ['blueprint-interpretation', 'consciousness-guidance'],
      'openai/gpt-4o': ['creative-expression', 'vision-analysis'],
      'meta-llama/llama-3.1-70b-instruct': ['pattern-recognition', 'collective-wisdom']
    };

    return recommendations[model.id] || ['general-guidance'];
  }

  /**
   * Validate response for consciousness alignment
   */
  public validateResponse(response: string, context: Record<string, any>): {
    isAligned: boolean;
    alignmentScore: number;
    concerns: string[];
  } {
    const concerns: string[] = [];
    let alignmentScore = 1.0;

    // Check for speculative language
    const speculativePatterns = [
      /might be/gi, /could be/gi, /perhaps/gi, /maybe/gi,
      /i think/gi, /i believe/gi, /in my opinion/gi
    ];

    speculativePatterns.forEach(pattern => {
      const matches = response.match(pattern);
      if (matches && matches.length > 2) {
        concerns.push('Contains excessive speculative language');
        alignmentScore -= 0.1;
      }
    });

    // Check for grounding in wisdom traditions
    const wisdomIndicators = [
      /ancient wisdom/gi, /sacred/gi, /consciousness/gi,
      /awareness/gi, /presence/gi, /truth/gi, /authentic/gi
    ];

    const wisdomScore = wisdomIndicators.reduce((score, pattern) => {
      return score + (response.match(pattern)?.length || 0);
    }, 0);

    if (wisdomScore < 2) {
      concerns.push('Limited grounding in wisdom traditions');
      alignmentScore -= 0.15;
    }

    // Check response length appropriateness
    if (response.length < 50) {
      concerns.push('Response too brief for meaningful guidance');
      alignmentScore -= 0.2;
    }

    return {
      isAligned: alignmentScore >= 0.7,
      alignmentScore: Math.max(0, alignmentScore),
      concerns
    };
  }
}
