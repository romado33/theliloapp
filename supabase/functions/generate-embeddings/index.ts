import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface GenerateEmbeddingsRequest {
  experienceId?: string;
  text?: string;
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const openAIApiKey = Deno.env.get('OPENAI_API_KEY');
    if (!openAIApiKey) {
      throw new Error('OpenAI API key not found');
    }

    // Use service role key to bypass RLS for administrative tasks
    const supabaseAdmin = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    const { experienceId, text }: GenerateEmbeddingsRequest = await req.json();

    let textToEmbed = text;

    // If experienceId provided, fetch the experience data
    if (experienceId && !text) {
      const { data: experience, error } = await supabaseAdmin
        .from('experiences')
        .select('title, description, location, what_included, what_to_bring')
        .eq('id', experienceId)
        .single();

      if (error) {
        throw new Error(`Failed to fetch experience: ${error.message}`);
      }

      // Combine all text fields for embedding
      const includedText = experience.what_included ? experience.what_included.join(' ') : '';
      const bringText = experience.what_to_bring ? experience.what_to_bring.join(' ') : '';
      
      textToEmbed = `${experience.title} ${experience.description} ${experience.location} ${includedText} ${bringText}`.trim();
    }

    if (!textToEmbed) {
      throw new Error('No text provided for embedding generation');
    }

    console.log('Generating embedding for text:', textToEmbed.substring(0, 100) + '...');

    // Generate embedding using OpenAI
    const embeddingResponse = await fetch('https://api.openai.com/v1/embeddings', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${openAIApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'text-embedding-3-small',
        input: textToEmbed,
        encoding_format: 'float'
      }),
    });

    const embeddingData = await embeddingResponse.json();
    
    if (!embeddingResponse.ok) {
      console.error('OpenAI API error:', embeddingData);
      throw new Error(`OpenAI API error: ${embeddingData.error?.message || 'Unknown error'}`);
    }

    const embedding = embeddingData.data[0].embedding;
    console.log('Generated embedding with dimensions:', embedding.length);

    // If experienceId provided, update the experience with the embedding
    if (experienceId) {
      const { error: updateError } = await supabaseAdmin
        .from('experiences')
        .update({ embedding })
        .eq('id', experienceId);

      if (updateError) {
        console.error('Failed to update experience embedding:', updateError);
        throw new Error(`Failed to update experience: ${updateError.message}`);
      }

      console.log('Successfully updated experience embedding for ID:', experienceId);
    }

    return new Response(
      JSON.stringify({ 
        success: true, 
        embedding: experienceId ? null : embedding,
        message: experienceId ? 'Experience embedding updated' : 'Embedding generated'
      }), 
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      }
    );

  } catch (error) {
    console.error('Error in generate-embeddings function:', error);
    return new Response(
      JSON.stringify({ 
        error: error instanceof Error ? error.message : 'Unknown error occurred',
        success: false 
      }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  }
});