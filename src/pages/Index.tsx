import { useState, lazy, Suspense } from "react";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { WelcomeScreen } from "@/components/WelcomeScreen";
import ExperienceCard from "@/components/ExperienceCard";
import SearchInterface from "@/components/SearchInterface";
import CategoryFilter from "@/components/CategoryFilter";
import Header from "@/components/Header";
import { TrendingUp, Heart, Database } from "lucide-react";
import heroImage from "@/assets/hero-image.jpg";
import potteryClass from "@/assets/pottery-class.jpg";
import farmersMarket from "@/assets/farmers-market.jpg";
import cookingClass from "@/assets/cooking-class.jpg";
import type { SearchResult } from "@/types";

const DevDataSeeder = import.meta.env.DEV
  ? lazy(() => import("@/components/DevDataSeeder"))
  : (): null => null;

// Map placeholder URLs to actual assets - simplified approach  
const getImageFromUrl = (url: string | undefined): string => {
  if (!url) return potteryClass;
  
  // Direct mapping without complex logic
  if (url === '/placeholder-cooking.jpg') return cookingClass;
  if (url === '/placeholder-pasta.jpg') return cookingClass; 
  if (url === '/placeholder-pottery.jpg') return potteryClass;
  if (url === '/placeholder-workshop.jpg') return potteryClass;
  if (url === '/placeholder-yoga.jpg') return potteryClass;
  if (url === '/placeholder-hike.jpg') return farmersMarket;
  if (url === '/placeholder-wine.jpg') return farmersMarket;
  if (url === '/placeholder-market.jpg') return farmersMarket;
  if (url === '/placeholder-farm.jpg') return farmersMarket;
  if (url === '/placeholder-nature.jpg') return farmersMarket;
  
  return potteryClass; // fallback
};

// Mock experiences using imported assets directly
const mockExperiences = [
  {
    id: "550e8400-e29b-41d4-a716-446655440001",
    title: "Pottery Workshop for Beginners",
    image: potteryClass,
    category: "Arts & Crafts",
    price: 65,
    duration: "2 hours",
    rating: 4.8,
    reviewCount: 127,
    location: "Downtown",
    hostName: "Sarah Chen",
    maxGuests: 8,
    isNew: true,
  },
  {
    id: "550e8400-e29b-41d4-a716-446655440002",
    title: "Farmers Market Food Tour",
    image: farmersMarket,
    category: "Food & Drink",
    price: 45,
    duration: "3 hours",
    rating: 4.9,
    reviewCount: 203,
    location: "Market District",
    hostName: "Miguel Rodriguez",
    maxGuests: 12,
  },
  {
    id: "550e8400-e29b-41d4-a716-446655440003",
    title: "Italian Cooking Masterclass",
    image: cookingClass,
    category: "Food & Drink",
    price: 85,
    duration: "4 hours",
    rating: 4.7,
    reviewCount: 89,
    location: "Little Italy",
    hostName: "Chef Marco",
    maxGuests: 6,
  },
];

const Index = () => {
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [searchResults, setSearchResults] = useState<SearchResult[]>([]);
  const [showHostForm, setShowHostForm] = useState(false);
  const { user, profile, loading, currentRole } = useAuth();

  const handleSearchResults = (results: SearchResult[]) => {
    setSearchResults(results);
  };

  // Show welcome screen for logged-in users who haven't onboarded
  if (user && profile && !profile.onboarded) {
    return <WelcomeScreen onComplete={() => window.location.reload()} />;
  }

  // Show loading screen while auth is loading
  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-lilo-green/20 via-background to-lilo-blue/20 flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-lilo-green"></div>
      </div>
    );
  }

  // Host view - redirect to host dashboard
  if (user && profile && currentRole === 'host') {
    // Redirect to dedicated host dashboard
    window.location.href = '/host-dashboard';
    return null;
  }

  // Guest view - regular home page
  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      {/* Hero Section */}
      <section className="relative min-h-[70vh] flex items-center justify-center overflow-hidden">
        <div 
          className="absolute inset-0 bg-cover bg-center"
          style={{ backgroundImage: `url(${heroImage})` }}
        >
          <div className="absolute inset-0 bg-gradient-to-r from-background/80 via-background/60 to-background/80" />
        </div>
        
        <div className="relative z-10 text-center mx-auto px-4 py-20">
          <div className="animate-fade-in">
            <h1 className="text-5xl md:text-7xl font-bold mb-6 leading-tight">
              Live <span className="bg-gradient-brand bg-clip-text text-transparent">Local</span>
            </h1>
            <p className="text-xl md:text-2xl text-lilo-navy/80 mb-8 max-w-2xl mx-auto">
              Discover unique experiences in your neighborhood. Connect with local businesses and create unforgettable memories.
            </p>
            
            {/* Hero Search */}
            <SearchInterface 
              onResultsChange={handleSearchResults}
              showFilters={false}
              placeholder="What would you like to try?"
              className="w-full"
            />
            
            <div className="flex flex-wrap justify-center gap-4 text-sm text-lilo-navy/70">
              <div className="flex items-center gap-1">
                <TrendingUp className="w-4 h-4 text-lilo-green" />
                <span>500+ local experiences</span>
              </div>
              <div className="flex items-center gap-1">
                <Heart className="w-4 h-4 text-lilo-yellow" />
                <span>Trusted by locals</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Main Content */}
      <section className="px-6 py-12">
        <div className="space-y-8">
          {/* Categories */}
          <div className="animate-slide-up container mx-auto">
            <h2 className="text-2xl font-bold mb-4">Browse by Category</h2>
            <CategoryFilter 
              selectedCategory={selectedCategory}
              onCategoryChange={setSelectedCategory}
            />
          </div>

          {/* Featured Experiences */}
          <div className="animate-slide-up">
            <div className="flex items-center justify-between mb-6 container mx-auto px-4">
              <h2 className="text-2xl font-bold">
                {selectedCategory === "all" ? "Featured Experiences" : `${selectedCategory} Experiences`}
              </h2>
              <Button variant="ghost" className="text-primary hover:text-primary-dark">
                View all
              </Button>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-6 px-4">
              {searchResults.length > 0 ? (
                searchResults.map((experience, index) => (
                  <div 
                    key={experience.id}
                    className="animate-fade-in"
                    style={{ animationDelay: `${index * 0.1}s` }}
                  >
                     <ExperienceCard 
                       id={experience.id}
                       title={experience.title}
                       image={(() => {
                         const originalUrl = experience.image_urls?.[0];
                         const mappedUrl = getImageFromUrl(originalUrl);
                         return mappedUrl;
                       })()}
                        category="Experience"
                        price={experience.price}
                        duration={`${experience.duration_hours || 2} hours`}
                        rating={4.5}
                        reviewCount={0}
                        location={experience.location}
                        hostName="Local Host"
                        maxGuests={experience.max_guests || 6}
                        isNew={false}
                     />
                   </div>
                ))
              ) : (
                mockExperiences
                  .filter(experience => {
                    const matchesCategory = selectedCategory === "all" || 
                      experience.category.toLowerCase().includes(selectedCategory);
                    return matchesCategory;
                  })
                  .map((experience, index) => (
                    <div 
                      key={experience.id}
                      className="animate-fade-in"
                      style={{ animationDelay: `${index * 0.1}s` }}
                    >
                      <ExperienceCard {...experience} />
                    </div>
                  ))
              )}
            </div>
            
            {searchResults.length === 0 && selectedCategory !== "all" && (
              <div className="text-center py-12">
                <p className="text-muted-foreground text-lg">
                  No experiences found for the selected category. Try a different search or category.
                </p>
              </div>
            )}
          </div>

          {/* Developer Data Seeder - Only show when signed in */}
          {import.meta.env.DEV && user && (
            <div className="animate-fade-in">
              <div className="flex items-center gap-2 mb-6">
                <Database className="w-5 h-5" />
                <h2 className="text-2xl font-bold">Developer Tools</h2>
              </div>
              <Suspense fallback={null}>
                <DevDataSeeder />
              </Suspense>
            </div>
          )}

          {/* CTA Section */}
          <div className="bg-gradient-brand rounded-2xl p-8 md:p-12 text-center text-white animate-fade-in shadow-strong">
            <h3 className="text-3xl font-bold mb-4">Share Your Passion</h3>
            <p className="text-xl mb-6 opacity-95">
              Turn your skills into income by hosting experiences in your community
            </p>
            <Button size="lg" variant="secondary" className="bg-white text-lilo-navy hover:bg-white/90 shadow-medium">
              Become a Host
            </Button>
          </div>
        </div>
      </section>
      
      {/* Footer */}
      <footer className="bg-gradient-to-r from-lilo-green/5 via-lilo-blue/5 to-lilo-yellow/5 border-t border-lilo-green/20 mt-20">
        <div className="container mx-auto px-4 py-8">
          <div className="text-center text-lilo-navy/70">
            <div className="flex items-center justify-center mb-4 group">
              <div className="relative">
                <div className="absolute inset-0 bg-gradient-brand rounded-full opacity-10 group-hover:opacity-20 transition-opacity blur-lg"></div>
                <img 
                  src="/lovable-uploads/6dfadda4-fb06-470c-940d-2bccb95a8f8f.png" 
                  alt="LiLo - Live Local" 
                  className="h-12 w-auto relative z-10 group-hover:scale-105 transition-transform duration-300"
                />
              </div>
            </div>
            <p className="font-medium">Connecting communities through local experiences</p>
            <div className="mt-2 text-sm">
              <span className="bg-gradient-brand bg-clip-text text-transparent font-semibold">Live Local, Love Local</span>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Index;