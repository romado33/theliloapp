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
  userLatitude?: number;
  userLongitude?: number;
  maxDistanceKm?: number;
}

interface QueryUnderstanding {
  who: string;
  constraints: string[];
  preferences: string[];
  location_intent?: string;
  activity_type?: string;
}

interface SearchResult {
  id: string;
  title: string;
  description: string;
  why: string;
  score: number;
  metadata: Record<string, any>;
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
      useSemanticSearch = true,
      userLatitude,
      userLongitude,
      maxDistanceKm
    }: SearchRequest = await req.json();

    console.log('Search request:', { query, useSemanticSearch, category, location });

    let results = [];
    let queryUnderstanding: QueryUnderstanding | null = null;

    // Perform semantic search if enabled and OpenAI key is available
    if (useSemanticSearch && openAIApiKey && query.trim()) {
      try {
        console.log('Performing semantic search for:', query);

        // Step 1: Use OpenAI to understand the query
        const understandingResponse = await fetch('https://api.openai.com/v1/chat/completions', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${openAIApiKey}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            model: 'gpt-4o-mini',
            messages: [
              {
                role: 'system',
                content: 'You are an expert at understanding search queries for local experiences. Extract key information from user queries.'
              },
              {
                role: 'user',
                content: `Analyze this search query and extract structured information: "${query}"`
              }
            ],
            tools: [{
              type: 'function',
              function: {
                name: 'understand_query',
                description: 'Extract structured information from a search query',
                parameters: {
                  type: 'object',
                  properties: {
                    who: {
                      type: 'string',
                      description: 'Who is the experience for (e.g., family, couple, solo, kids)'
                    },
                    constraints: {
                      type: 'array',
                      items: { type: 'string' },
                      description: 'Hard requirements (e.g., stroller-friendly, wheelchair accessible, indoor, <30min away)'
                    },
                    preferences: {
                      type: 'array',
                      items: { type: 'string' },
                      description: 'Nice-to-have features (e.g., animals, hands-on, creative)'
                    },
                    location_intent: {
                      type: 'string',
                      description: 'Location or distance mentioned (e.g., nearby, within 30 min, in downtown)'
                    },
                    activity_type: {
                      type: 'string',
                      description: 'Type of activity (e.g., farm visit, cooking class, outdoor adventure)'
                    }
                  },
                  required: ['who', 'constraints', 'preferences']
                }
              }
            }],
            tool_choice: { type: 'function', function: { name: 'understand_query' } }
          }),
        });

        const understandingData = await understandingResponse.json();
        if (understandingData.choices?.[0]?.message?.tool_calls?.[0]) {
          const toolCall = understandingData.choices[0].message.tool_calls[0];
          queryUnderstanding = JSON.parse(toolCall.function.arguments);
          console.log('Query understanding:', queryUnderstanding);
        }

        // Step 2: Generate embedding for the search query
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
            
            // Calculate similarities and apply constraint filtering
            const resultsWithSimilarity = semanticResults.map(exp => {
              if (!exp.embedding) return { ...exp, similarity: 0, matches_constraints: false };
              
              // Calculate cosine similarity
              const dotProduct = queryEmbedding.reduce((sum: number, val: number, i: number) => 
                sum + val * exp.embedding[i], 0);
              const magnitude1 = Math.sqrt(queryEmbedding.reduce((sum: number, val: number) => sum + val * val, 0));
              const magnitude2 = Math.sqrt(exp.embedding.reduce((sum: number, val: number) => sum + val * val, 0));
              const similarity = dotProduct / (magnitude1 * magnitude2);
              
              // Check constraint matches
              let matches_constraints = true;
              let constraint_score = 0;
              
              if (queryUnderstanding) {
                const searchableText = [
                  exp.title,
                  exp.description,
                  exp.location,
                  ...(exp.what_included || []),
                  ...(exp.what_to_bring || [])
                ].join(' ').toLowerCase();
                
                // Check each constraint
                for (const constraint of queryUnderstanding.constraints) {
                  const constraintLower = constraint.toLowerCase();
                  if (constraintLower.includes('stroller') && searchableText.includes('stroller')) {
                    constraint_score += 0.2;
                  }
                  if (constraintLower.includes('wheelchair') && searchableText.includes('wheelchair')) {
                    constraint_score += 0.2;
                  }
                  if (constraintLower.includes('animal') && searchableText.includes('animal')) {
                    constraint_score += 0.15;
                  }
                  if (constraintLower.includes('indoor') && searchableText.includes('indoor')) {
                    constraint_score += 0.1;
                  }
                  if (constraintLower.includes('outdoor') && searchableText.includes('outdoor')) {
                    constraint_score += 0.1;
                  }
                }
                
                // Check preferences (bonus points)
                for (const pref of queryUnderstanding.preferences) {
                  const prefLower = pref.toLowerCase();
                  if (searchableText.includes(prefLower)) {
                    constraint_score += 0.05;
                  }
                }
              }
              
              // Calculate distance if user location provided
              let distance_km = null;
              if (userLatitude && userLongitude && exp.latitude && exp.longitude) {
                const R = 6371; // Earth's radius in km
                const dLat = (exp.latitude - userLatitude) * Math.PI / 180;
                const dLon = (exp.longitude - userLongitude) * Math.PI / 180;
                const a = Math.sin(dLat/2) * Math.sin(dLat/2) +
                         Math.cos(userLatitude * Math.PI / 180) * Math.cos(exp.latitude * Math.PI / 180) *
                         Math.sin(dLon/2) * Math.sin(dLon/2);
                const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
                distance_km = R * c;
              }
              
              // Boost score based on constraint matches
              const boosted_score = similarity + constraint_score;
              
              return { 
                ...exp, 
                similarity, 
                constraint_score,
                boosted_score,
                distance_km,
                matches_constraints 
              };
            });

            // Filter by distance if specified
            let filteredResults = resultsWithSimilarity;
            if (maxDistanceKm && userLatitude && userLongitude) {
              filteredResults = filteredResults.filter(exp => 
                exp.distance_km === null || exp.distance_km <= maxDistanceKm
              );
            }

            // Sort by boosted score
            results = filteredResults
              .filter(exp => exp.boosted_score > 0.3)
              .sort((a, b) => b.boosted_score - a.boosted_score)
              .slice(0, Math.min(limit * 2, 50)); // Get top 50 for re-ranking

            console.log('Semantic search results before re-ranking:', results.length);
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

    // Step 3: Use OpenAI Structured Outputs to explain results
    let shapedResults: SearchResult[] = [];
    
    if (results.length > 0 && openAIApiKey && useSemanticSearch) {
      try {
        const resultsForExplanation = results.slice(0, 10).map(r => ({
          id: r.id,
          title: r.title,
          description: r.description?.substring(0, 200),
          location: r.location,
          price: r.price,
          duration_hours: r.duration_hours,
          similarity: r.similarity || 0,
          constraint_score: r.constraint_score || 0,
          distance_km: r.distance_km
        }));

        const explanationResponse = await fetch('https://api.openai.com/v1/chat/completions', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${openAIApiKey}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            model: 'gpt-4o-mini',
            messages: [
              {
                role: 'system',
                content: 'You are an expert at explaining why search results are relevant. Be concise and specific.'
              },
              {
                role: 'user',
                content: `Original query: "${query}"\n\nQuery understanding: ${JSON.stringify(queryUnderstanding)}\n\nTop results: ${JSON.stringify(resultsForExplanation)}\n\nFor each result, explain why it matches the query in 1-2 sentences.`
              }
            ],
            tools: [{
              type: 'function',
              function: {
                name: 'explain_results',
                description: 'Explain why each search result is relevant',
                parameters: {
                  type: 'object',
                  properties: {
                    results: {
                      type: 'array',
                      items: {
                        type: 'object',
                        properties: {
                          id: { type: 'string' },
                          why: { type: 'string', description: 'Brief explanation of relevance' },
                          score: { type: 'number', description: 'Relevance score 0-1' }
                        },
                        required: ['id', 'why', 'score']
                      }
                    }
                  },
                  required: ['results']
                }
              }
            }],
            tool_choice: { type: 'function', function: { name: 'explain_results' } }
          }),
        });

        const explanationData = await explanationResponse.json();
        if (explanationData.choices?.[0]?.message?.tool_calls?.[0]) {
          const toolCall = explanationData.choices[0].message.tool_calls[0];
          const explanations = JSON.parse(toolCall.function.arguments);
          
          shapedResults = explanations.results.map((expl: any) => {
            const result = results.find(r => r.id === expl.id);
            return {
              ...result,
              why: expl.why,
              score: expl.score
            };
          });
          
          console.log('Results shaped with explanations:', shapedResults.length);
        }
      } catch (explainError) {
        console.error('Failed to generate explanations:', explainError);
        // Fall back to results without explanations
        shapedResults = results.map(r => ({
          ...r,
          why: 'Matches your search criteria',
          score: r.boosted_score || r.similarity || 0
        }));
      }
    } else {
      // No OpenAI or semantic search disabled
      shapedResults = results.map(r => ({
        ...r,
        why: 'Matches your search criteria',
        score: 0.5
      }));
    }

    // Remove embedding data from results to reduce response size
    const cleanResults = shapedResults.map(({ embedding, ...rest }) => rest);

    return new Response(
      JSON.stringify({ 
        query_understanding: queryUnderstanding,
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