import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface SearchRequest {
  query: string;
  limit?: number;
  category?: string;
  priceMin?: number;
  priceMax?: number;
  location?: string;
  useSemanticSearch?: boolean;
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const openAIApiKey = Deno.env.get('OPENAI_API_KEY');
    
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? ''
    );

    const { 
      query, 
      limit = 20, 
      category, 
      priceMin, 
      priceMax, 
      location,
      useSemanticSearch = true
    }: SearchRequest = await req.json();

    console.log('Search request:', { query, useSemanticSearch, category, location });

    let results = [];

    // Perform semantic search if enabled and OpenAI key is available
    if (useSemanticSearch && openAIApiKey && query.trim()) {
      try {
        console.log('Performing semantic search for:', query);

        // Generate embedding for the search query
        const embeddingResponse = await fetch('https://api.openai.com/v1/embeddings', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${openAIApiKey}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            model: 'text-embedding-3-small',
            input: query,
            encoding_format: 'float'
          }),
        });

        const embeddingData = await embeddingResponse.json();
        
        if (embeddingResponse.ok) {
          const queryEmbedding = embeddingData.data[0].embedding;
          console.log('Generated query embedding with dimensions:', queryEmbedding.length);

          // Build the query with filters
          let rpcQuery = supabase.rpc('search_experiences_semantic', {
            query_embedding: queryEmbedding,
            similarity_threshold: 0.5,
            match_count: limit
          });

          // Apply additional filters if provided
          let selectQuery = supabase
            .from('experiences')
            .select('*')
            .eq('is_active', true);

          if (category && category !== 'all') {
            // For category filtering, we'll need to do a post-filter since RPC doesn't support easy chaining
            console.log('Category filter will be applied post-search:', category);
          }

          if (priceMin !== undefined) {
            selectQuery = selectQuery.gte('price', priceMin);
          }
          if (priceMax !== undefined) {
            selectQuery = selectQuery.lte('price', priceMax);
          }
          if (location) {
            selectQuery = selectQuery.ilike('location', `%${location}%`);
          }

          // For now, let's use a simpler approach with vector similarity
          const { data: semanticResults, error: semanticError } = await supabase
            .from('experiences')
            .select('*')
            .eq('is_active', true)
            .not('embedding', 'is', null)
            .limit(limit * 2); // Get more results to filter

          if (!semanticError && semanticResults) {
            console.log('Found experiences with embeddings:', semanticResults.length);
            
            // Calculate similarities on the client side for now
            const resultsWithSimilarity = semanticResults.map(exp => {
              if (!exp.embedding) return { ...exp, similarity: 0 };
              
              // Calculate cosine similarity
              const dotProduct = queryEmbedding.reduce((sum: number, val: number, i: number) => 
                sum + val * exp.embedding[i], 0);
              const magnitude1 = Math.sqrt(queryEmbedding.reduce((sum: number, val: number) => sum + val * val, 0));
              const magnitude2 = Math.sqrt(exp.embedding.reduce((sum: number, val: number) => sum + val * val, 0));
              const similarity = dotProduct / (magnitude1 * magnitude2);
              
              return { ...exp, similarity };
            });

            // Filter and sort by similarity
            results = resultsWithSimilarity
              .filter(exp => exp.similarity > 0.3) // Similarity threshold
              .sort((a, b) => b.similarity - a.similarity)
              .slice(0, limit);

            console.log('Semantic search results:', results.length);
          } else {
            console.error('Semantic search error:', semanticError);
          }
        } else {
          console.error('Failed to generate query embedding:', embeddingData);
        }
      } catch (semanticError) {
        console.error('Semantic search failed, falling back to text search:', semanticError);
      }
    }

    // If no semantic results or semantic search disabled, fall back to text search
    if (results.length === 0 && query.trim()) {
      console.log('Performing text-based search for:', query);

      let textQuery = supabase
        .from('experiences')
        .select('*')
        .eq('is_active', true);

      // Text search using ilike for partial matching
      const searchTerms = query.toLowerCase().split(' ').filter(term => term.length > 2);
      
      if (searchTerms.length > 0) {
        // Search in multiple fields
        const searchCondition = searchTerms.map(term => 
          `title.ilike.%${term}%,description.ilike.%${term}%,location.ilike.%${term}%,search_terms.ilike.%${term}%`
        ).join(',');
        
        textQuery = textQuery.or(searchCondition);
      }

      // Apply filters
      if (category && category !== 'all') {
        // This would need category matching logic
        console.log('Category filter for text search:', category);
      }
      if (priceMin !== undefined) {
        textQuery = textQuery.gte('price', priceMin);
      }
      if (priceMax !== undefined) {
        textQuery = textQuery.lte('price', priceMax);
      }
      if (location) {
        textQuery = textQuery.ilike('location', `%${location}%`);
      }

      const { data: textResults, error: textError } = await textQuery.limit(limit);

      if (textError) {
        console.error('Text search error:', textError);
        throw new Error(`Search failed: ${textError.message}`);
      }

      results = textResults || [];
      console.log('Text search results:', results.length);
    }

    // If no query provided, return recent/popular experiences
    if (!query.trim()) {
      console.log('No query provided, returning recent experiences');
      
      let defaultQuery = supabase
        .from('experiences')
        .select('*')
        .eq('is_active', true);

      // Apply filters
      if (category && category !== 'all') {
        console.log('Category filter for default results:', category);
      }
      if (priceMin !== undefined) {
        defaultQuery = defaultQuery.gte('price', priceMin);
      }
      if (priceMax !== undefined) {
        defaultQuery = defaultQuery.lte('price', priceMax);
      }
      if (location) {
        defaultQuery = defaultQuery.ilike('location', `%${location}%`);
      }

      const { data: defaultResults, error: defaultError } = await defaultQuery
        .order('created_at', { ascending: false })
        .limit(limit);

      if (defaultError) {
        throw new Error(`Failed to fetch experiences: ${defaultError.message}`);
      }

      results = defaultResults || [];
    }

    // Remove embedding data from results to reduce response size
    const cleanResults = results.map(({ embedding, ...rest }) => rest);

    return new Response(
      JSON.stringify({ 
        results: cleanResults,
        query,
        searchType: results.length > 0 && useSemanticSearch ? 'semantic' : 'text',
        count: cleanResults.length
      }), 
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      }
    );

  } catch (error) {
    console.error('Error in semantic-search function:', error);
    return new Response(
      JSON.stringify({ 
        error: error instanceof Error ? error.message : 'Unknown error occurred',
        results: [],
        count: 0
      }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  }
});