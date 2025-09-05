import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ArrowLeft, Zap } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import SearchInterface from '@/components/SearchInterface';
import { useMutation } from '@tanstack/react-query';

interface SearchResult {
  id: string;
  title: string;
  description: string;
  price: number;
  duration_hours: number;
  location: string;
  image_urls?: string[];
}

const ExperienceSearch = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [results, setResults] = useState<SearchResult[]>([]);

  const generateEmbeddings = useMutation({
    retry: 1,
    mutationFn: async () => {
      const { data, error } = await supabase.functions.invoke('batch-generate-embeddings', {
        body: {}
      });
      if (error) throw new Error('Failed to generate embeddings');
      return data;
    },
    onSuccess: (data) => {
      toast({
        title: "Embeddings generated!",
        description: `Successfully processed ${data.processed} experiences. Semantic search is now enhanced!`,
      });
    },
    onError: () => {
      toast({
        title: "Error generating embeddings",
        description: "There was an error processing the experiences. Please try again.",
        variant: "destructive",
      });
    }
  });

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-4">
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={() => navigate('/')}
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Home
            </Button>
            <div>
              <h1 className="text-3xl font-bold">Search Experiences</h1>
              <p className="text-muted-foreground mt-1">
                Find the perfect local experience with our intelligent search
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <Badge variant="secondary" className="hidden md:flex">
              {results.length} results
            </Badge>
            <Button
              variant="outline"
              size="sm"
              onClick={() => generateEmbeddings.mutate()}
              disabled={generateEmbeddings.isPending}
              className="hidden md:flex"
            >
              <Zap className={`w-4 h-4 mr-2 ${generateEmbeddings.isPending ? 'animate-spin' : ''}`} />
              {generateEmbeddings.isPending ? 'Enhancing...' : 'Enhance Search'}
            </Button>
          </div>
        </div>

        {/* Search Interface */}
        <SearchInterface 
          onResultsChange={setResults}
          showFilters={true}
          placeholder="Search for cooking classes, pottery workshops, hiking tours..."
          className="w-full"
        />

        {/* Search Tips */}
        <div className="mt-12 bg-muted/30 rounded-lg p-6">
          <h3 className="text-lg font-semibold mb-4">🔍 Search Tips</h3>
          <div className="grid md:grid-cols-2 gap-4 text-sm text-muted-foreground">
            <div>
              <h4 className="font-medium text-foreground mb-2">Semantic Search</h4>
              <ul className="space-y-1">
                <li>• Try "learn cooking" instead of just "cooking class"</li>
                <li>• Search "creative workshop" to find arts and crafts</li>
                <li>• Use "outdoor adventure" for hiking and nature</li>
              </ul>
            </div>
            <div>
              <h4 className="font-medium text-foreground mb-2">Filters</h4>
              <ul className="space-y-1">
                <li>• Use price range to find experiences in your budget</li>
                <li>• Filter by location to find nearby experiences</li>
                <li>• Try different categories for varied results</li>
              </ul>
            </div>
          </div>
        </div>

        {/* Generate Embeddings Call-to-Action (Mobile) */}
        <div className="md:hidden mt-6 p-4 bg-primary/10 rounded-lg text-center">
          <h3 className="font-semibold mb-2">Enhance Your Search Experience</h3>
          <p className="text-sm text-muted-foreground mb-3">
            Generate semantic embeddings for smarter, more intuitive search results
          </p>
            <Button
              onClick={() => generateEmbeddings.mutate()}
              disabled={generateEmbeddings.isPending}
              size="sm"
            >
              <Zap className={`w-4 h-4 mr-2 ${generateEmbeddings.isPending ? 'animate-spin' : ''}`} />
              {generateEmbeddings.isPending ? 'Enhancing Search...' : 'Enhance Search'}
            </Button>
        </div>
      </div>
    </div>
  );
};

export default ExperienceSearch;