import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { WelcomeScreen } from "@/components/WelcomeScreen";
import ExperienceCard from "@/components/ExperienceCard";
import SearchInterface from "@/components/SearchInterface";
import CategoryFilter from "@/components/CategoryFilter";
import Header from "@/components/Header";
import { RecommendationCard } from "@/components/RecommendationCard";
import { PWAInstallPrompt } from "@/components/PWAInstallPrompt";
import { useRecommendations } from "@/hooks/useRecommendations";
import { TrendingUp, Heart, Database } from "lucide-react";
import heroImage from "@/assets/hero-image.jpg";
import potteryClass from "@/assets/pottery-class.jpg";
import farmersMarket from "@/assets/farmers-market.jpg";
import cookingClass from "@/assets/cooking-class.jpg";
import DevDataSeeder from "@/components/DevDataSeeder";
import type { SearchResult } from "@/types";

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
    title: "Feed Animals & Learn About Farm Life",
    image: potteryClass,
    category: "Farm & Animals",
    price: 35,
    duration: "2 hours",
    rating: 4.9,
    reviewCount: 47,
    location: "Manotick",
    hostName: "Sarah & Family Farm",
    maxGuests: 6,
    isNew: true,
  },
  {
    id: "550e8400-e29b-41d4-a716-446655440002",
    title: "Backyard Beekeeping Experience",
    image: farmersMarket,
    category: "Nature & Learning",
    price: 25,
    duration: "1.5 hours",
    rating: 4.9,
    reviewCount: 38,
    location: "Kanata",
    hostName: "The Johnson Family",
    maxGuests: 4,
  },
  {
    id: "550e8400-e29b-41d4-a716-446655440003",
    title: "Kids Pottery & Clay Making",
    image: cookingClass,
    category: "Arts & Crafts",
    price: 40,
    duration: "2 hours",
    rating: 4.8,
    reviewCount: 62,
    location: "Westboro",
    hostName: "Maya's Art Studio",
    maxGuests: 8,
  },
];

const Index = () => {
  const navigate = useNavigate();
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [searchResults, setSearchResults] = useState<SearchResult[]>([]);
  const [showHostForm, setShowHostForm] = useState(false);
  const { user, profile, loading, currentRole } = useAuth();
  const { recommendations, loading: recommendationsLoading } = useRecommendations();

  const handleSearchResults = (results: SearchResult[]) => {
    setSearchResults(results);
  };

  // Handle redirects in useEffect to avoid early hook calls
  useEffect(() => {
    if (user && profile && currentRole === 'host') {
      navigate('/host');
    }
  }, [user, profile, currentRole, navigate]);

  // Show welcome screen for logged-in users who haven't onboarded
  if (user && profile && !profile.onboarded) {
    return <WelcomeScreen onComplete={() => navigate(0)} />;
  }

  // Show loading screen while auth is loading
  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-lilo-green/20 via-background to-lilo-blue/20 flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-lilo-green"></div>
      </div>
    );
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
              <span className="hero-title-contrast">
                <span className="bg-gradient-brand bg-clip-text text-transparent">Live</span> <span className="bg-gradient-brand bg-clip-text text-transparent font-black">Local</span>
              </span>
            </h1>
            <p className="text-xl md:text-2xl text-lilo-navy/80 mb-8 max-w-2xl mx-auto">
              Connect with Ottawa neighbors who share authentic, family-friendly experiences. From local farms to artisan workshops.
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
                <span>Local Ottawa experiences</span>
              </div>
              <div className="flex items-center gap-1">
                <Heart className="w-4 h-4 text-lilo-yellow" />
                <span>Family-friendly & safe</span>
              </div>
              <div className="flex items-center gap-1">
                <Database className="w-4 h-4 text-lilo-blue" />
                <span>Verified community hosts</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Main Content */}
      <section className="px-6 py-12">
        <div className="space-y-8">
          {/* Recommendations Section */}
          {user && recommendations.length > 0 && (
            <div className="animate-slide-up container mx-auto">
              <h2 className="text-2xl font-bold mb-4">Recommended for You</h2>
              <p className="text-muted-foreground mb-6">
                Personalized experiences based on your preferences
              </p>
              
              {recommendationsLoading ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {[...Array(3)].map((_, i) => (
                    <div key={i} className="animate-pulse bg-muted rounded-lg h-64"></div>
                  ))}
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {recommendations.slice(0, 3).map((experience) => (
                    <RecommendationCard key={experience.id} experience={experience} />
                  ))}
                </div>
              )}
            </div>
          )}

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
              <DevDataSeeder />
            </div>
          )}

          {/* CTA Section */}
          <div className="bg-gradient-brand rounded-2xl p-8 md:p-12 text-center text-white animate-fade-in shadow-strong">
            <h3 className="text-3xl font-bold mb-4">Share Your Skills with Ottawa Families</h3>
            <p className="text-xl mb-6 opacity-95">
              Are you a local farmer, artisan, or maker? Share your passion with neighboring families and earn extra income.
            </p>
            <Button size="lg" variant="secondary" className="bg-white text-lilo-navy hover:bg-white/90 shadow-medium">
              Become a Community Host
            </Button>
          </div>
        </div>
      </section>
      
      <PWAInstallPrompt />
      
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
            <p className="font-medium">Supporting Ottawa families through authentic local connections</p>
            <div className="mt-2 text-sm">
              <span className="bg-gradient-brand bg-clip-text text-transparent font-semibold">Neighbors helping neighbors discover more</span>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Index;