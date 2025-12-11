import { createClient } from 'npm:@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization, X-Client-Info, Apikey',
};

Deno.serve(async (req: Request) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, {
      status: 200,
      headers: corsHeaders,
    });
  }

  try {
    const { businessId, elevenlabsApiKey } = await req.json();

    if (!businessId || !elevenlabsApiKey) {
      return new Response(
        JSON.stringify({ error: 'Missing businessId or elevenlabsApiKey' }),
        {
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      );
    }

    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    const { data: business, error: businessError } = await supabase
      .from('businesses')
      .select('elevenlabs_agent_id')
      .eq('id', businessId)
      .maybeSingle();

    if (businessError || !business || !business.elevenlabs_agent_id) {
      return new Response(
        JSON.stringify({ error: 'Business not found or no agent configured' }),
        {
          status: 404,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      );
    }

    const { data: content, error: contentError } = await supabase
      .from('business_content')
      .select('*')
      .eq('business_id', businessId)
      .order('created_at', { ascending: true });

    if (contentError) {
      return new Response(
        JSON.stringify({ error: 'Failed to fetch content' }),
        {
          status: 500,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      );
    }

    const compiledKnowledge = content
      .map((item) => {
        const header = `=== ${item.original_filename} ===\n`;
        return header + (item.extracted_text || '');
      })
      .join('\n\n');

    const elevenLabsResponse = await fetch(
      `https://api.elevenlabs.io/v1/convai/agents/${business.elevenlabs_agent_id}`,
      {
        method: 'PATCH',
        headers: {
          'xi-api-key': elevenlabsApiKey,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          conversation_config: {
            agent: {
              prompt: {
                prompt: compiledKnowledge,
              },
            },
          },
        }),
      }
    );

    if (!elevenLabsResponse.ok) {
      const errorText = await elevenLabsResponse.text();
      return new Response(
        JSON.stringify({
          error: 'Failed to update ElevenLabs agent',
          details: errorText,
        }),
        {
          status: 500,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      );
    }

    const result = await elevenLabsResponse.json();

    return new Response(
      JSON.stringify({
        success: true,
        message: 'Agent knowledge base updated successfully',
        contentLength: compiledKnowledge.length,
        itemsCount: content.length,
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  } catch (error) {
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  }
});
