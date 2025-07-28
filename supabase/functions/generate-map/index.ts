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
    const { prompt, style = 'fantasy map', size = '1024x1024' } = await req.json()

    if (!prompt) {
      return new Response(
        JSON.stringify({ error: 'Prompt is required' }),
        { 
          status: 400, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      )
    }

    // Enhanced prompt for better map generation
    const enhancedPrompt = `Create a detailed fantasy tabletop RPG map: ${prompt}. Style: top-down view, detailed terrain, clear landmarks, suitable for D&D campaigns. High quality, fantasy art style.`

    // For this example, we'll use a placeholder service
    // In production, you would integrate with OpenAI DALL-E, Stability AI, or similar
    const response = await fetch('https://api.openai.com/v1/images/generations', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${Deno.env.get('OPENAI_API_KEY')}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        prompt: enhancedPrompt,
        n: 1,
        size: size,
        quality: 'standard',
        style: 'natural'
      }),
    })

    if (!response.ok) {
      // Fallback to a placeholder image service for demo purposes
      const placeholderUrl = `https://picsum.photos/1024/768?random=${Date.now()}`
      
      return new Response(
        JSON.stringify({ 
          imageUrl: placeholderUrl,
          prompt: prompt,
          message: 'Generated with placeholder service (OpenAI API key not configured)'
        }),
        { 
          status: 200, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      )
    }

    const data = await response.json()
    const imageUrl = data.data[0]?.url

    if (!imageUrl) {
      throw new Error('No image URL returned from AI service')
    }

    return new Response(
      JSON.stringify({ 
        imageUrl,
        prompt,
        message: 'Map generated successfully'
      }),
      { 
        status: 200, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    )

  } catch (error) {
    console.error('Error generating map:', error)
    
    // Fallback to placeholder for demo
    const placeholderUrl = `https://picsum.photos/1024/768?random=${Date.now()}`
    
    return new Response(
      JSON.stringify({ 
        imageUrl: placeholderUrl,
        prompt: 'fallback',
        message: 'Using placeholder image due to error',
        error: error.message
      }),
      { 
        status: 200, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    )
  }
})