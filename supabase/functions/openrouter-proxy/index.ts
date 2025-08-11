import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    // Verify user authentication
    const authHeader = req.headers.get('Authorization')
    if (!authHeader) {
      throw new Error('No authorization header')
    }

    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? '',
      {
        global: {
          headers: { Authorization: authHeader },
        },
      }
    )

    const { data: { user }, error: authError } = await supabaseClient.auth.getUser()
    if (authError || !user) {
      throw new Error('Authentication failed')
    }

    // Get request body
    const requestBody = await req.json()
    const { model, messages, temperature, max_tokens, metadata } = requestBody

    // Validate request
    if (!messages || !Array.isArray(messages)) {
      throw new Error('Invalid messages format')
    }

    // Get OpenRouter API key from secrets
    const openRouterKey = Deno.env.get('OPENROUTER_API_KEY')
    if (!openRouterKey) {
      throw new Error('OpenRouter API key not configured')
    }

    // Prepare OpenRouter request
    const openRouterRequest = {
      model: model || 'anthropic/claude-3.5-sonnet',
      messages,
      temperature: temperature || 0.7,
      max_tokens: max_tokens || 1000,
    }

    // Make request to OpenRouter
    const openRouterResponse = await fetch('https://openrouter.ai/api/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${openRouterKey}`,
        'Content-Type': 'application/json',
        'HTTP-Referer': 'https://sacredshifter.com',
        'X-Title': 'Sacred Shifter OS'
      },
      body: JSON.stringify(openRouterRequest)
    })

    if (!openRouterResponse.ok) {
      const errorText = await openRouterResponse.text()
      console.error('OpenRouter API error:', errorText)
      throw new Error(`OpenRouter API error: ${openRouterResponse.status}`)
    }

    const responseData = await openRouterResponse.json()

    // Log usage for analytics (optional)
    if (metadata) {
      try {
        await supabaseClient
          .from('llm_usage_logs')
          .insert({
            user_id: user.id,
            module_id: metadata.moduleId,
            model_used: model || 'anthropic/claude-3.5-sonnet',
            prompt_tokens: responseData.usage?.prompt_tokens || 0,
            completion_tokens: responseData.usage?.completion_tokens || 0,
            total_tokens: responseData.usage?.total_tokens || 0,
            request_metadata: metadata,
            created_at: new Date().toISOString()
          })
      } catch (logError) {
        console.warn('Failed to log usage:', logError)
        // Don't fail the request if logging fails
      }
    }

    return new Response(JSON.stringify(responseData), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })

  } catch (error) {
    console.error('OpenRouter proxy error:', error)
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    )
  }
})
