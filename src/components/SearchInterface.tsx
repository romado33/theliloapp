import { useState, useEffect, useMemo } from 'react';
import { useQuery, useMutation } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { Slider } from '@/components/ui/slider';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { 
  Search, 
  Filter, 
  MapPin, 
  DollarSign, 
  Sparkles,
  X,
  Loader2
} from 'lucide-react';
import ExperienceCard from './ExperienceCard';
import { useToast } from '@/hooks/use-toast';
import { useBatchRatings } from '@/hooks/useReviews';
import type { SearchResult } from '@/types';

interface SearchFilters {
  category: string;
  priceMin: number;
  priceMax: number;
  location: string;
  useSemanticSearch: boolean;
}

interface SearchInterfaceProps {
  onResultsChange?: (results: SearchResult[]) => void;
  showFilters?: boolean;
  placeholder?: string;
  className?: string;
}

const SearchInterface = ({
  onResultsChange,
  showFilters = true,
  placeholder = "Search experiences...",
  className = ""
}: SearchInterfaceProps) => {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<SearchResult[]>([]);
  const [searchType, setSearchType] = useState<'semantic' | 'text'>('semantic');
  const [showFilterPanel, setShowFilterPanel] = useState(false);
  const [queryUnderstanding, setQueryUnderstanding] = useState<any>(null);
  const [userLocation, setUserLocation] = useState<{lat: number, lng: number} | null>(null);
  const { toast } = useToast();

  // Get user location for distance-based search
  useEffect(() => {
    if ('geolocation' in navigator) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setUserLocation({
            lat: position.coords.latitude,
            lng: position.coords.longitude
          });
        },
        (error) => {
          console.log('Location access denied:', error);
        }
      );
    }
  }, []);

  const [filters, setFilters] = useState<SearchFilters>({
    category: 'all',
    priceMin: 0,
    priceMax: 500,
    location: '',
    useSemanticSearch: true,
  });

  const categories = [
    { value: 'all', label: 'All Categories' },
    { value: 'food-drink', label: 'Food & Drink' },
    { value: 'arts-crafts', label: 'Arts & Crafts' },
    { value: 'wellness', label: 'Wellness' },
    { value: 'outdoor', label: 'Outdoor' },
    { value: 'culture', label: 'Culture' },
    { value: 'learning', label: 'Learning' },
  ];

  const {
    data: defaultExperiences = [],
    isLoading: defaultLoading,
    error: defaultError,
    refetch: refetchDefault,
  } = useQuery<SearchResult[]>({
    queryKey: ['default-experiences'],
    staleTime: 1000 * 60 * 10, // 10 min stale time - reduces refetches
    gcTime: 1000 * 60 * 60, // 1 hour cache - keeps data longer
    retry: 1,
    refetchOnWindowFocus: false, // Prevent refetch on tab switch
    queryFn: async (): Promise<SearchResult[]> => {
      // Select only needed columns to reduce egress
      const { data, error } = await supabase
        .from('experiences')
        .select(`
          id,
          title,
          description,
          location,
          price,
          duration_hours,
          max_guests,
          image_urls,
          host_id,
          category_id,
          is_active,
          created_at,
          categories (name)
        `)
        .eq('is_active', true)
        .order('created_at', { ascending: false })
        .limit(12);
      if (error) throw error;
      
      // Get host profiles separately to avoid ambiguous join
      const hostIds = [...new Set((data || []).map(e => e.host_id))];
      const hostMap = new Map<string, string>();
      
      if (hostIds.length > 0) {
        const hostPromises = hostIds.map(id => 
          supabase.rpc('get_public_host_profile', { host_user_id: id })
        );
        const hostResults = await Promise.all(hostPromises);
        hostResults.forEach((result, idx) => {
          if (result.data && result.data.length > 0) {
            hostMap.set(hostIds[idx], result.data[0].first_name || 'Host');
          }
        });
      }
      
      // Transform to SearchResult with minimal data
      return (data || []).map(exp => ({
        ...exp,
        profiles: { first_name: hostMap.get(exp.host_id) || 'Local Host' }
      })) as unknown as SearchResult[];
    },
  });

  useEffect(() => {
    setResults(defaultExperiences);
    onResultsChange?.(defaultExperiences);
    setSearchType('text');
  }, [defaultExperiences, onResultsChange]);

  useEffect(() => {
    if (defaultError) {
      toast({
        title: 'Error loading experiences',
        description: 'Could not load default experiences.',
        variant: 'destructive',
      });
    }
  }, [defaultError, toast]);

  interface SearchResponse {
    results: SearchResult[];
    searchType: 'semantic' | 'text';
    query_understanding?: {
      who: string;
      constraints: string[];
      preferences: string[];
      location_intent?: string;
      activity_type?: string;
    };
  }

  const searchMutation = useMutation<
    SearchResponse,
    Error,
    { searchQuery: string; searchFilters: SearchFilters }
  >({
    retry: 1,
    mutationFn: async ({ searchQuery, searchFilters }) => {
      const { data, error } = await supabase.functions.invoke<SearchResponse>('semantic-search', {
        body: {
          query: searchQuery,
          limit: 20,
          category: searchFilters.category !== 'all' ? searchFilters.category : undefined,
          priceMin: searchFilters.priceMin,
          priceMax: searchFilters.priceMax,
          location: searchFilters.location || undefined,
          useSemanticSearch: searchFilters.useSemanticSearch,
          userLatitude: userLocation?.lat,
          userLongitude: userLocation?.lng,
          maxDistanceKm: 50, // Default 50km radius
        },
      });
      if (error) throw error;
      return data;
    },
    onSuccess: (data, variables) => {
      const searchResults = data.results;
      setResults(searchResults);
      setSearchType(data.searchType);
      setQueryUnderstanding(data.query_understanding);
      onResultsChange?.(searchResults);
      if (searchResults.length === 0 && variables.searchQuery.trim()) {
        toast({
          title: 'No results found',
          description: `No experiences match "${variables.searchQuery}". Try different keywords or remove filters.`,
          variant: 'default',
        });
      } else if (data.query_understanding && searchResults.length > 0) {
        toast({
          title: '✨ Smart search activated',
          description: `Found ${searchResults.length} experiences for ${data.query_understanding.who || 'you'}`,
        });
      }
    },
    onError: () => {
      toast({
        title: 'Search failed',
        description: 'There was an error performing the search. Please try again.',
        variant: 'destructive',
      });
      refetchDefault();
    },
  });

  const loading = searchMutation.isPending || defaultLoading;

  const handleSearch = () => {
    if (!query.trim() && filters.category === 'all' && !filters.location) {
      if (defaultExperiences.length === 0) {
        refetchDefault();
      } else {
        setResults(defaultExperiences);
        onResultsChange?.(defaultExperiences);
      }
      return;
    }
    searchMutation.mutate({ searchQuery: query, searchFilters: filters });
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSearch();
    }
  };

  const clearSearch = () => {
    setQuery('');
    setResults(defaultExperiences);
    onResultsChange?.(defaultExperiences);
  };

  const updateFilter = <K extends keyof SearchFilters>(
    key: K, 
    value: SearchFilters[K]
  ) => {
    const newFilters = { ...filters, [key]: value };
    setFilters(newFilters);
    
    // Auto-search when filters change
    if (query.trim() || newFilters.category !== 'all' || newFilters.location) {
      searchMutation.mutate({ searchQuery: query, searchFilters: newFilters });
    } else {
      setResults(defaultExperiences);
      onResultsChange?.(defaultExperiences);
    }
  };

  const clearFilters = () => {
    const defaultFilters: SearchFilters = {
      category: 'all',
      priceMin: 0,
      priceMax: 500,
      location: '',
      useSemanticSearch: true,
    };
    setFilters(defaultFilters);
    if (query.trim()) {
      searchMutation.mutate({ searchQuery: query, searchFilters: defaultFilters });
    } else {
      setResults(defaultExperiences);
      onResultsChange?.(defaultExperiences);
    }
  };

  const hasActiveFilters = filters.category !== 'all' || 
                          filters.priceMin > 0 || 
                          filters.priceMax < 500 || 
                          filters.location.trim() !== '';

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Search Bar */}
      <div className="relative">
        <div className="flex gap-2">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
            <Input
              type="text"
              placeholder={placeholder}
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onKeyPress={handleKeyPress}
              className="pl-10 pr-10"
            />
            {query && (
              <button
                onClick={clearSearch}
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-muted-foreground hover:text-foreground"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>
          <Button onClick={handleSearch} disabled={loading}>
            {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Search className="w-4 h-4" />}
          </Button>
          {showFilters && (
            <Button
              variant={showFilterPanel ? 'default' : 'outline'}
              onClick={() => setShowFilterPanel(!showFilterPanel)}
            >
              <Filter className="w-4 h-4 mr-2" />
              Filters
              {hasActiveFilters && (
                <Badge variant="secondary" className="ml-2 h-5 w-5 p-0 flex items-center justify-center">
                  !
                </Badge>
              )}
            </Button>
          )}
        </div>

        {/* Query Understanding Display */}
        {queryUnderstanding && query && (
          <Card className="mt-3 bg-primary/5 border-primary/20">
            <CardContent className="p-4">
              <div className="flex items-start gap-3">
                <Sparkles className="w-5 h-5 text-primary mt-1" />
                <div className="flex-1 space-y-2">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-medium">Smart Search Understanding:</span>
                    {queryUnderstanding.who && (
                      <Badge variant="secondary" className="text-xs">
                        For: {queryUnderstanding.who}
                      </Badge>
                    )}
                  </div>
                  {queryUnderstanding.constraints.length > 0 && (
                    <div className="flex flex-wrap gap-1">
                      <span className="text-xs text-muted-foreground">Requirements:</span>
                      {queryUnderstanding.constraints.map((constraint: string, idx: number) => (
                        <Badge key={idx} variant="outline" className="text-xs">
                          {constraint}
                        </Badge>
                      ))}
                    </div>
                  )}
                  {queryUnderstanding.preferences.length > 0 && (
                    <div className="flex flex-wrap gap-1">
                      <span className="text-xs text-muted-foreground">Preferences:</span>
                      {queryUnderstanding.preferences.map((pref: string, idx: number) => (
                        <Badge key={idx} variant="secondary" className="text-xs">
                          {pref}
                        </Badge>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Search Type Indicator */}
        <div className="flex items-center justify-between mt-2 text-sm text-muted-foreground">
          <div className="flex items-center gap-2">
            {searchType === 'semantic' && filters.useSemanticSearch && (
              <Badge variant="secondary" className="text-xs">
                <Sparkles className="w-3 h-3 mr-1" />
                AI Search
              </Badge>
            )}
            <span>{results.length} results</span>
          </div>
        </div>
      </div>

      {/* Filter Panel */}
      {showFilters && showFilterPanel && (
        <Card>
          <CardContent className="p-4 space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold">Filters</h3>
              {hasActiveFilters && (
                <Button variant="ghost" size="sm" onClick={clearFilters}>
                  Clear All
                </Button>
              )}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {/* Category Filter */}
              <div className="space-y-2">
                <Label>Category</Label>
                <Select
                  value={filters.category}
                  onValueChange={(value) => updateFilter('category', value)}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {categories.map((category) => (
                      <SelectItem key={category.value} value={category.value}>
                        {category.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Location Filter */}
              <div className="space-y-2">
                <Label>Location</Label>
                <div className="relative">
                  <MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
                  <Input
                    type="text"
                    placeholder="Enter location..."
                    value={filters.location}
                    onChange={(e) => updateFilter('location', e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>

              {/* Price Range Filter */}
              <div className="space-y-2">
                <Label className="flex items-center gap-2">
                  <DollarSign className="w-4 h-4" />
                  Price Range: ${filters.priceMin} - ${filters.priceMax}
                </Label>
                <div className="space-y-2">
                  <Slider
                    value={[filters.priceMin, filters.priceMax]}
                    onValueChange={([min, max]) => {
                      updateFilter('priceMin', min);
                      updateFilter('priceMax', max);
                    }}
                    max={500}
                    step={10}
                    className="w-full"
                  />
                </div>
              </div>

              {/* Search Type Toggle */}
              <div className="space-y-2">
                <Label className="flex items-center gap-2">
                  <Sparkles className="w-4 h-4" />
                  Smart Search
                </Label>
                <div className="flex items-center space-x-2">
                  <Switch
                    checked={filters.useSemanticSearch}
                    onCheckedChange={(checked) => updateFilter('useSemanticSearch', checked)}
                  />
                  <Label className="text-sm text-muted-foreground">
                    Find experiences by meaning, not just keywords
                  </Label>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Results with batch ratings */}
      <ResultsGrid results={results} />
    </div>
  );
};

// Separate component to batch ratings fetch for all visible results
const ResultsGrid = ({ results }: { results: SearchResult[] }) => {
  const experienceIds = useMemo(() => results.map(r => r.id), [results]);
  const { ratings } = useBatchRatings(experienceIds);
  
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {results.map((result: any) => {
        const ratingData = ratings[result.id];
        return (
          <ExperienceCard
            key={result.id}
            id={result.id}
            title={result.title}
            image={result.image_urls?.[0] || '/placeholder.svg'}
            category={result.categories?.name || "Experience"}
            price={result.price}
            duration={`${result.duration_hours} hours`}
            rating={ratingData?.rating || 0}
            reviewCount={ratingData?.count || 0}
            location={result.location}
            hostName={result.profiles?.first_name || "Local Host"}
            maxGuests={result.max_guests || 6}
            why={result.why}
            score={result.score}
          />
        );
      })}
    </div>
  );
};

export default SearchInterface;