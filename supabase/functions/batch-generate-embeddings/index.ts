import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

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

    console.log('Starting batch embedding generation...');

    // Fetch all experiences without embeddings
    const { data: experiences, error: fetchError } = await supabaseAdmin
      .from('experiences')
      .select('id, title, description, location, what_included, what_to_bring')
      .eq('is_active', true)
      .is('embedding', null);

    if (fetchError) {
      throw new Error(`Failed to fetch experiences: ${fetchError.message}`);
    }

    if (!experiences || experiences.length === 0) {
      return new Response(
        JSON.stringify({ 
          success: true, 
          message: 'No experiences need embedding generation',
          processed: 0
        }), 
        {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 200,
        }
      );
    }

    console.log(`Found ${experiences.length} experiences to process`);

    let processed = 0;
    let errors = 0;

    // Process experiences in batches to avoid rate limits
    const batchSize = 5;
    for (let i = 0; i < experiences.length; i += batchSize) {
      const batch = experiences.slice(i, i + batchSize);
      
      const batchPromises = batch.map(async (experience) => {
        try {
          // Combine all text fields for embedding
          const includedText = experience.what_included ? experience.what_included.join(' ') : '';
          const bringText = experience.what_to_bring ? experience.what_to_bring.join(' ') : '';
          
          const textToEmbed = `${experience.title} ${experience.description} ${experience.location} ${includedText} ${bringText}`.trim();

          console.log(`Processing experience ${experience.id}: ${experience.title}`);

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
            console.error(`OpenAI API error for experience ${experience.id}:`, embeddingData);
            throw new Error(`OpenAI API error: ${embeddingData.error?.message || 'Unknown error'}`);
          }

          const embedding = embeddingData.data[0].embedding;

          // Update the experience with the embedding
          const { error: updateError } = await supabaseAdmin
            .from('experiences')
            .update({ embedding })
            .eq('id', experience.id);

          if (updateError) {
            console.error(`Failed to update experience ${experience.id}:`, updateError);
            throw new Error(`Failed to update experience: ${updateError.message}`);
          }

          console.log(`Successfully processed experience ${experience.id}`);
          return { success: true, id: experience.id };
          
        } catch (error) {
          console.error(`Error processing experience ${experience.id}:`, error);
          return { success: false, id: experience.id, error: error.message };
        }
      });

      // Wait for batch to complete
      const batchResults = await Promise.all(batchPromises);
      
      // Count successes and failures
      batchResults.forEach(result => {
        if (result.success) {
          processed++;
        } else {
          errors++;
        }
      });

      console.log(`Batch ${Math.floor(i / batchSize) + 1} completed. Processed: ${processed}, Errors: ${errors}`);

      // Add a small delay between batches to respect rate limits
      if (i + batchSize < experiences.length) {
        await new Promise(resolve => setTimeout(resolve, 1000));
      }
    }

    console.log(`Batch processing completed. Successfully processed: ${processed}, Errors: ${errors}`);

    return new Response(
      JSON.stringify({ 
        success: true, 
        message: `Batch processing completed`,
        processed,
        errors,
        total: experiences.length
      }), 
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      }
    );

  } catch (error) {
    console.error('Error in batch-generate-embeddings function:', error);
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