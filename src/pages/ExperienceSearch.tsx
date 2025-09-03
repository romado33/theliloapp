import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import CategoryFilter from '@/components/CategoryFilter';
import ExperienceCard from '@/components/ExperienceCard';
import { Search, Filter, MapPin, Calendar, Users } from 'lucide-react';

// Mock data for search results
const mockSearchResults = [
  {
    id: "1",
    title: "Family Farm Visit & Animal Feeding",
    image: "/placeholder-farm.jpg",
    category: "Nature & Animals",
    price: 25,
    duration: "2 hours",
    rating: 4.9,
    reviewCount: 156,
    location: "Kanata, Ottawa",
    hostName: "Sarah Johnson",
    maxGuests: 8,
    isNew: false,
  },
  {
    id: "2", 
    title: "Pottery Making for Kids",
    image: "/placeholder-pottery.jpg",
    category: "Arts & Crafts",
    price: 35,
    duration: "1.5 hours", 
    rating: 4.7,
    reviewCount: 89,
    location: "Downtown Ottawa",
    hostName: "Michael Chen",
    maxGuests: 6,
    isNew: true,
  },
];

const ExperienceSearch = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [showFilters, setShowFilters] = useState(false);

  const filteredResults = mockSearchResults.filter(experience => {
    const matchesSearch = experience.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         experience.location.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = selectedCategory === 'all' || 
                           experience.category.toLowerCase().includes(selectedCategory.toLowerCase());
    
    return matchesSearch && matchesCategory;
  });

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-brand-navy mb-2">
          Find Local Experiences
        </h1>
        <p className="text-muted-foreground">
          Discover amazing activities perfect for families with young children in Ottawa
        </p>
      </div>

      {/* Search Bar */}
      <Card className="mb-8">
        <CardContent className="p-6">
          <div className="flex flex-col lg:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
              <Input
                placeholder="Search by activity, location, or keywords..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
            
            <div className="flex gap-2">
              <Button
                variant="outline"
                onClick={() => setShowFilters(!showFilters)}
                className="gap-2"
              >
                <Filter className="w-4 h-4" />
                Filters
              </Button>
              
              <Button variant="brand" className="gap-2">
                <Search className="w-4 h-4" />
                Search
              </Button>
            </div>
          </div>

          {/* Advanced Filters */}
          {showFilters && (
            <div className="mt-6 p-4 bg-muted/50 rounded-lg">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="text-sm font-medium mb-2 block">Location</label>
                  <div className="relative">
                    <MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
                    <Input placeholder="Ottawa, ON" className="pl-10" />
                  </div>
                </div>
                
                <div>
                  <label className="text-sm font-medium mb-2 block">Date</label>
                  <div className="relative">
                    <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
                    <Input type="date" className="pl-10" />
                  </div>
                </div>
                
                <div>
                  <label className="text-sm font-medium mb-2 block">Group Size</label>
                  <div className="relative">
                    <Users className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
                    <Input type="number" placeholder="4 people" className="pl-10" />
                  </div>
                </div>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Category Filter */}
      <div className="mb-8">
        <h2 className="text-xl font-semibold mb-4">Browse by Category</h2>
        <CategoryFilter 
          selectedCategory={selectedCategory}
          onCategoryChange={setSelectedCategory}
        />
      </div>

      {/* Results */}
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h2 className="text-xl font-semibold">
            {selectedCategory === 'all' ? 'All Experiences' : `${selectedCategory} Experiences`}
          </h2>
          <p className="text-muted-foreground">
            {filteredResults.length} experience{filteredResults.length !== 1 ? 's' : ''} found
          </p>
        </div>
        
        <Badge variant="secondary" className="gap-1">
          <MapPin className="w-3 h-3" />
          Ottawa Area
        </Badge>
      </div>

      {/* Results Grid */}
      {filteredResults.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredResults.map((experience) => (
            <ExperienceCard key={experience.id} {...experience} />
          ))}
        </div>
      ) : (
        <Card className="p-12 text-center">
          <CardContent>
            <Search className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-medium mb-2">No experiences found</h3>
            <p className="text-muted-foreground mb-4">
              Try adjusting your search terms or filters to find more results.
            </p>
            <Button 
              variant="outline" 
              onClick={() => {
                setSearchQuery('');
                setSelectedCategory('all');
              }}
            >
              Clear all filters
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Quick Actions */}
      <div className="mt-12 text-center">
        <Card className="bg-gradient-brand text-white">
          <CardHeader>
            <CardTitle>Can't find what you're looking for?</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="mb-4">
              Let us know what type of experience you'd like to see in Ottawa
            </p>
            <Button variant="secondary" className="bg-white text-brand-navy hover:bg-white/90">
              Request an Experience
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default ExperienceSearch;