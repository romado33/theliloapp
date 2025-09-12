import { useState, useEffect } from 'react';
import { useQuery, useMutation } from '@tanstack/react-query';
import { format, startOfDay, endOfDay } from 'date-fns';
import { supabase } from '@/integrations/supabase/client';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Calendar } from '@/components/ui/calendar';
import { Slider } from '@/components/ui/slider';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
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
  Loader2,
  Calendar as CalendarIcon,
  Map as MapIcon,
  Users,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import ExperienceCard from './ExperienceCard';
import Map from './Map';
import { useToast } from '@/hooks/use-toast';
import type { SearchResult } from '@/types';

interface AdvancedSearchFilters {
  category: string;
  priceMin: number;
  priceMax: number;
  location: string;
  latitude?: number;
  longitude?: number;
  radius: number;
  dateFrom?: Date;
  dateTo?: Date;
  guestCount: number;
  useSemanticSearch: boolean;
}

interface AdvancedSearchInterfaceProps {
  onResultsChange?: (results: SearchResult[]) => void;
  className?: string;
}

const AdvancedSearchInterface = ({
  onResultsChange,
  className = ""
}: AdvancedSearchInterfaceProps) => {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<SearchResult[]>([]);
  const [searchType, setSearchType] = useState<'semantic' | 'text'>('semantic');
  const [activeTab, setActiveTab] = useState('search');
  const { toast } = useToast();

  const [filters, setFilters] = useState<AdvancedSearchFilters>({
    category: 'all',
    priceMin: 0,
    priceMax: 500,
    location: '',
    radius: 25,
    guestCount: 1,
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

  // Get default experiences
  const {
    data: defaultExperiences = [],
    isLoading: defaultLoading,
    error: defaultError,
    refetch: refetchDefault,
  } = useQuery<SearchResult[]>({
    queryKey: ['default-experiences'],
    staleTime: 1000 * 60 * 5,
    gcTime: 1000 * 60 * 30,
    retry: 1,
    queryFn: async () => {
      const { data, error } = await supabase
        .from('experiences')
        .select('*')
        .eq('is_active', true)
        .order('created_at', { ascending: false })
        .limit(12);
      if (error) throw error;
      return data ?? [];
    },
  });

  useEffect(() => {
    setResults(defaultExperiences);
    onResultsChange?.(defaultExperiences);
  }, [defaultExperiences, onResultsChange]);

  // Search mutation
  const searchMutation = useMutation({
    mutationFn: async (searchFilters: AdvancedSearchFilters & { searchQuery: string }) => {
      // First, search for experiences
      const { data, error } = await supabase.functions.invoke('semantic-search', {
        body: {
          query: searchFilters.searchQuery,
          limit: 50,
          category: searchFilters.category !== 'all' ? searchFilters.category : undefined,
          priceMin: searchFilters.priceMin,
          priceMax: searchFilters.priceMax,
          location: searchFilters.location || undefined,
          useSemanticSearch: searchFilters.useSemanticSearch,
        },
      });

      if (error) throw error;
      let searchResults = data.results;

      // Filter by location/radius if specified
      if (searchFilters.latitude && searchFilters.longitude) {
        searchResults = searchResults.filter((exp: any) => {
          if (!exp.latitude || !exp.longitude) return false;
          
          const distance = calculateDistance(
            searchFilters.latitude!,
            searchFilters.longitude!,
            exp.latitude,
            exp.longitude
          );
          
          return distance <= searchFilters.radius;
        });
      }

      // Filter by availability if dates are specified
      if (searchFilters.dateFrom && searchFilters.dateTo) {
        const availabilityResults = await Promise.all(
          searchResults.map(async (exp: any) => {
            const { data: availability } = await supabase
              .from('availability')
              .select('*')
              .eq('experience_id', exp.id)
              .eq('is_available', true)
              .gte('available_spots', searchFilters.guestCount)
              .gte('start_time', startOfDay(searchFilters.dateFrom!).toISOString())
              .lt('start_time', endOfDay(searchFilters.dateTo!).toISOString());

            return availability && availability.length > 0 ? exp : null;
          })
        );

        searchResults = availabilityResults.filter(Boolean);
      }

      return { results: searchResults, searchType: data.searchType };
    },
    onSuccess: (data, variables) => {
      setResults(data.results);
      setSearchType(data.searchType);
      onResultsChange?.(data.results);
      
      if (data.results.length === 0 && variables.searchQuery.trim()) {
        toast({
          title: 'No results found',
          description: 'Try adjusting your search criteria or filters.',
          variant: 'default',
        });
      }
    },
    onError: () => {
      toast({
        title: 'Search failed',
        description: 'There was an error performing the search. Please try again.',
        variant: 'destructive',
      });
    },
  });

  // Helper function to calculate distance between two points
  const calculateDistance = (lat1: number, lon1: number, lat2: number, lon2: number): number => {
    const R = 6371; // Radius of the Earth in km
    const dLat = ((lat2 - lat1) * Math.PI) / 180;
    const dLon = ((lon2 - lon1) * Math.PI) / 180;
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos((lat1 * Math.PI) / 180) *
        Math.cos((lat2 * Math.PI) / 180) *
        Math.sin(dLon / 2) *
        Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
  };

  const handleSearch = () => {
    if (!query.trim() && !hasActiveFilters()) {
      setResults(defaultExperiences);
      onResultsChange?.(defaultExperiences);
      return;
    }
    
    searchMutation.mutate({ ...filters, searchQuery: query });
  };

  const updateFilter = <K extends keyof AdvancedSearchFilters>(
    key: K,
    value: AdvancedSearchFilters[K]
  ) => {
    const newFilters = { ...filters, [key]: value };
    setFilters(newFilters);
  };

  const handleLocationSelect = (location: { lat: number; lng: number; address: string }) => {
    updateFilter('latitude', location.lat);
    updateFilter('longitude', location.lng);
    updateFilter('location', location.address);
  };

  const hasActiveFilters = () => {
    return (
      filters.category !== 'all' ||
      filters.priceMin > 0 ||
      filters.priceMax < 500 ||
      filters.location.trim() !== '' ||
      filters.dateFrom ||
      filters.dateTo ||
      filters.guestCount > 1
    );
  };

  const clearFilters = () => {
    setFilters({
      category: 'all',
      priceMin: 0,
      priceMax: 500,
      location: '',
      radius: 25,
      guestCount: 1,
      useSemanticSearch: true,
    });
  };

  const loading = searchMutation.isPending || defaultLoading;

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Main Search Bar */}
      <Card>
        <CardContent className="p-6">
          <div className="flex gap-2 mb-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
              <Input
                type="text"
                placeholder="Search experiences..."
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
                className="pl-10 pr-10"
              />
              {query && (
                <button
                  onClick={() => setQuery('')}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-muted-foreground hover:text-foreground"
                >
                  <X className="w-4 h-4" />
                </button>
              )}
            </div>
            <Button onClick={handleSearch} disabled={loading}>
              {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Search className="w-4 h-4" />}
            </Button>
          </div>

          {/* Search Type & Results Count */}
          {(query.trim() || hasActiveFilters()) && (
            <div className="flex items-center gap-2">
              <Badge variant={searchType === 'semantic' ? 'default' : 'secondary'} className="text-xs">
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
        </CardContent>
      </Card>

      {/* Advanced Filters */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="search" className="flex items-center gap-2">
            <Filter className="w-4 h-4" />
            Filters
          </TabsTrigger>
          <TabsTrigger value="location" className="flex items-center gap-2">
            <MapIcon className="w-4 h-4" />
            Location
          </TabsTrigger>
          <TabsTrigger value="dates" className="flex items-center gap-2">
            <CalendarIcon className="w-4 h-4" />
            Dates
          </TabsTrigger>
        </TabsList>

        <TabsContent value="search" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                Search Filters
                {hasActiveFilters() && (
                  <Button variant="ghost" size="sm" onClick={clearFilters}>
                    Clear All
                  </Button>
                )}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {/* Category */}
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

                {/* Guest Count */}
                <div className="space-y-2">
                  <Label className="flex items-center gap-2">
                    <Users className="w-4 h-4" />
                    Guests: {filters.guestCount}
                  </Label>
                  <Slider
                    value={[filters.guestCount]}
                    onValueChange={([value]) => updateFilter('guestCount', value)}
                    max={20}
                    min={1}
                    step={1}
                    className="w-full"
                  />
                </div>

                {/* Price Range */}
                <div className="space-y-2">
                  <Label className="flex items-center gap-2">
                    <DollarSign className="w-4 h-4" />
                    Price: ${filters.priceMin} - ${filters.priceMax}
                  </Label>
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

              {/* Smart Search Toggle */}
              <div className="flex items-center space-x-2">
                <Switch
                  checked={filters.useSemanticSearch}
                  onCheckedChange={(checked) => updateFilter('useSemanticSearch', checked)}
                />
                <Label className="flex items-center gap-2">
                  <Sparkles className="w-4 h-4" />
                  Smart Search - Find experiences by meaning, not just keywords
                </Label>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="location">
          <Card>
            <CardHeader>
              <CardTitle>Location & Radius</CardTitle>
            </CardHeader>
            <CardContent>
              <Map
                onLocationSelect={handleLocationSelect}
                experiences={results}
                selectedRadius={filters.radius}
                onRadiusChange={(radius) => updateFilter('radius', radius)}
              />
              {filters.location && (
                <div className="mt-4 p-3 bg-muted rounded-lg">
                  <p className="text-sm">
                    <MapPin className="w-4 h-4 inline mr-1" />
                    Searching within {filters.radius}km of: {filters.location}
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="dates">
          <Card>
            <CardHeader>
              <CardTitle>Available Dates</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* From Date */}
                <div className="space-y-2">
                  <Label>From Date</Label>
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button
                        variant="outline"
                        className={cn(
                          "w-full justify-start text-left font-normal",
                          !filters.dateFrom && "text-muted-foreground"
                        )}
                      >
                        <CalendarIcon className="mr-2 h-4 w-4" />
                        {filters.dateFrom ? format(filters.dateFrom, "PPP") : "Select start date"}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0" align="start">
                      <Calendar
                        mode="single"
                        selected={filters.dateFrom}
                        onSelect={(date) => updateFilter('dateFrom', date)}
                        disabled={(date) => date < new Date()}
                        initialFocus
                        className="pointer-events-auto"
                      />
                    </PopoverContent>
                  </Popover>
                </div>

                {/* To Date */}
                <div className="space-y-2">
                  <Label>To Date</Label>
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button
                        variant="outline"
                        className={cn(
                          "w-full justify-start text-left font-normal",
                          !filters.dateTo && "text-muted-foreground"
                        )}
                      >
                        <CalendarIcon className="mr-2 h-4 w-4" />
                        {filters.dateTo ? format(filters.dateTo, "PPP") : "Select end date"}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0" align="start">
                      <Calendar
                        mode="single"
                        selected={filters.dateTo}
                        onSelect={(date) => updateFilter('dateTo', date)}
                        disabled={(date) => date < (filters.dateFrom || new Date())}
                        initialFocus
                        className="pointer-events-auto"
                      />
                    </PopoverContent>
                  </Popover>
                </div>
              </div>

              {filters.dateFrom && filters.dateTo && (
                <div className="p-3 bg-muted rounded-lg">
                  <p className="text-sm">
                    <CalendarIcon className="w-4 h-4 inline mr-1" />
                    Showing experiences available from {format(filters.dateFrom, "MMM d")} to {format(filters.dateTo, "MMM d, yyyy")}
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Results Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {results.map((result) => (
          <ExperienceCard
            key={result.id}
            id={result.id}
            title={result.title}
            image={result.image_urls?.[0] || '/placeholder.svg'}
            category="Experience"
            price={result.price}
            duration={`${result.duration_hours} hours`}
            rating={4.5}
            reviewCount={0}
            location={result.location}
            hostName="Local Host"
            maxGuests={6}
          />
        ))}
      </div>

      {/* Empty State */}
      {!loading && results.length === 0 && (query.trim() || hasActiveFilters()) && (
        <div className="text-center py-12">
          <div className="w-24 h-24 mx-auto mb-4 bg-muted rounded-full flex items-center justify-center">
            <Search className="w-12 h-12 text-muted-foreground" />
          </div>
          <h3 className="text-lg font-semibold mb-2">No experiences found</h3>
          <p className="text-muted-foreground mb-4">
            Try adjusting your search criteria or removing some filters.
          </p>
          <div className="space-x-2">
            <Button variant="outline" onClick={() => setQuery('')}>
              Clear Search
            </Button>
            <Button onClick={clearFilters}>
              Reset Filters
            </Button>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdvancedSearchInterface;