const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

Deno.serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const { prompt, pixelArt = false, style = 'fantasy map', size = '1024x1024' } = await req.json()

    if (!prompt) {
      return new Response(
        JSON.stringify({ error: 'Prompt is required' }),
        { 
          status: 400, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      )
    }

    // Check if OpenAI API key is available
    const openaiApiKey = Deno.env.get('OPENAI_API_KEY')
    
    if (!openaiApiKey) {
      // Return placeholder image when API key is not configured
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

    // Enhanced prompt for better map generation
    const styleModifier = pixelArt ? '2D pixel art style, 16-bit retro gaming aesthetic, crisp pixels, medieval fantasy' : 'detailed fantasy art style, high quality'
    const enhancedPrompt = `Create a detailed fantasy tabletop RPG map: ${prompt}. Style: top-down view, ${styleModifier}, detailed terrain, clear landmarks, suitable for D&D campaigns. ${pixelArt ? 'Pixel art, retro gaming style, sharp pixels, no anti-aliasing.' : 'High quality fantasy art.'}`
    
    console.log('Enhanced prompt:', enhancedPrompt)

    try {
      const response = await fetch('https://api.openai.com/v1/images/generations', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${openaiApiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          prompt: enhancedPrompt,
          n: 1,
          size: size,
          quality: pixelArt ? 'standard' : 'hd',
          style: 'natural'
        }),
      })

      if (!response.ok) {
        throw new Error(`OpenAI API error: ${response.status} ${response.statusText}`)
      }

      const data = await response.json()
      const imageUrl = data.data[0]?.url

      if (!imageUrl) {
        throw new Error('No image URL returned from OpenAI API')
      }

      return new Response(
        JSON.stringify({ 
          imageUrl,
          prompt,
          message: `Map generated successfully with OpenAI${pixelArt ? ' in pixel art style' : ''}`
        }),
        { 
          status: 200, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      )

    } catch (apiError) {
      console.error('OpenAI API error:', apiError)
      
      // Fallback to placeholder when OpenAI API fails
      const placeholderUrl = `https://picsum.photos/1024/768?random=${Date.now()}`
      
      return new Response(
        JSON.stringify({ 
          imageUrl: placeholderUrl,
          prompt: prompt,
          message: 'Using placeholder image due to OpenAI API error',
          error: apiError.message
        }),
        { 
          status: 200, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      )
    }

  } catch (error) {
    console.error('Edge function error:', error)
    
    // Final fallback
    const placeholderUrl = `https://picsum.photos/1024/768?random=${Date.now()}`
    
    return new Response(
      JSON.stringify({ 
        imageUrl: placeholderUrl,
        prompt: 'fallback',
        message: 'Using placeholder image due to function error',
        error: error.message
      }),
      { 
        status: 200, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    )
  }
})