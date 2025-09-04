import { useState, useEffect } from 'react';
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

interface SearchFilters {
  category: string;
  priceMin: number;
  priceMax: number;
  location: string;
  useSemanticSearch: boolean;
}

interface SearchResult {
  id: string;
  title: string;
  description: string;
  price: number;
  duration_hours: number;
  location: string;
  image_urls?: string[];
  similarity?: number;
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
  const [loading, setLoading] = useState(false);
  const [searchType, setSearchType] = useState<'semantic' | 'text'>('semantic');
  const [showFilterPanel, setShowFilterPanel] = useState(false);
  const { toast } = useToast();

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

  const performSearch = async (searchQuery: string = query, searchFilters: SearchFilters = filters) => {
    if (!searchQuery.trim() && searchFilters.category === 'all' && !searchFilters.location) {
      // Load default experiences if no search criteria
      loadDefaultExperiences();
      return;
    }

    setLoading(true);
    try {
      console.log('Performing search with:', { searchQuery, searchFilters });

      const { data, error } = await supabase.functions.invoke('semantic-search', {
        body: {
          query: searchQuery,
          limit: 20,
          category: searchFilters.category !== 'all' ? searchFilters.category : undefined,
          priceMin: searchFilters.priceMin,
          priceMax: searchFilters.priceMax,
          location: searchFilters.location || undefined,
          useSemanticSearch: searchFilters.useSemanticSearch,
        }
      });

      if (error) {
        console.error('Search error:', error);
        throw new Error('Search failed');
      }

      const searchResults = data?.results || [];
      setResults(searchResults);
      setSearchType(data?.searchType || 'text');
      
      onResultsChange?.(searchResults);

      if (searchResults.length === 0 && searchQuery.trim()) {
        toast({
          title: "No results found",
          description: `No experiences match "${searchQuery}". Try different keywords or remove filters.`,
          variant: "default",
        });
      }

      console.log(`Search completed: ${searchResults.length} results using ${data?.searchType} search`);

    } catch (error) {
      console.error('Search error:', error);
      toast({
        title: "Search failed",
        description: "There was an error performing the search. Please try again.",
        variant: "destructive",
      });
      
      // Fallback to default experiences
      loadDefaultExperiences();
    } finally {
      setLoading(false);
    }
  };

  const loadDefaultExperiences = async () => {
    try {
      const { data, error } = await supabase
        .from('experiences')
        .select('*')
        .eq('is_active', true)
        .order('created_at', { ascending: false })
        .limit(12);

      if (error) throw error;

      setResults(data || []);
      onResultsChange?.(data || []);
      setSearchType('text');
    } catch (error) {
      console.error('Error loading default experiences:', error);
    }
  };

  // Load default experiences on mount
  useEffect(() => {
    loadDefaultExperiences();
  }, []);

  const handleSearch = () => {
    performSearch();
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSearch();
    }
  };

  const clearSearch = () => {
    setQuery('');
    setResults([]);
    loadDefaultExperiences();
    onResultsChange?.([]);
  };

  const updateFilter = <K extends keyof SearchFilters>(
    key: K, 
    value: SearchFilters[K]
  ) => {
    const newFilters = { ...filters, [key]: value };
    setFilters(newFilters);
    
    // Auto-search when filters change
    if (query.trim() || newFilters.category !== 'all' || newFilters.location) {
      performSearch(query, newFilters);
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
    performSearch(query, defaultFilters);
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
              variant="outline"
              onClick={() => setShowFilterPanel(!showFilterPanel)}
              className={hasActiveFilters ? 'border-primary' : ''}
            >
              <Filter className="w-4 h-4" />
              {hasActiveFilters && (
                <Badge variant="secondary" className="ml-2 h-5 px-1 text-xs">
                  Active
                </Badge>
              )}
            </Button>
          )}
        </div>

        {/* Search Type Indicator */}
        {(query.trim() || hasActiveFilters) && (
          <div className="flex items-center gap-2 mt-2">
            <Badge 
              variant={searchType === 'semantic' ? 'default' : 'secondary'}
              className="text-xs"
            >
              {searchType === 'semantic' ? (
                <>
                  <Sparkles className="w-3 h-3 mr-1" />
                  Semantic Search
                </>
              ) : (
                'Text Search'
              )}
            </Badge>
            <span className="text-sm text-muted-foreground">
              {results.length} result{results.length !== 1 ? 's' : ''}
            </span>
          </div>
        )}
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

      {/* Results */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {results.map((result) => (
          <ExperienceCard
            key={result.id}
            id={result.id}
            title={result.title}
            image={result.image_urls?.[0] || '/placeholder.svg'}
            category="Experience" // You might want to add category to the results
            price={result.price}
            duration={`${result.duration_hours} hours`}
            rating={4.5} // You might want to calculate this from reviews
            reviewCount={0} // You might want to get this from reviews
            location={result.location}
            hostName="Local Host" // You might want to join with profiles
            maxGuests={6} // You might want to add this to results
          />
        ))}
      </div>

      {/* Empty State */}
      {!loading && results.length === 0 && query.trim() && (
        <div className="text-center py-12">
          <div className="w-24 h-24 mx-auto mb-4 bg-muted rounded-full flex items-center justify-center">
            <Search className="w-12 h-12 text-muted-foreground" />
          </div>
          <h3 className="text-lg font-semibold mb-2">No experiences found</h3>
          <p className="text-muted-foreground mb-4">
            We couldn't find any experiences matching "{query}".
          </p>
          <div className="space-x-2">
            <Button variant="outline" onClick={clearSearch}>
              Clear Search
            </Button>
            <Button onClick={() => setShowFilterPanel(!showFilterPanel)}>
              Adjust Filters
            </Button>
          </div>
        </div>
      )}
    </div>
  );
};

export default SearchInterface;