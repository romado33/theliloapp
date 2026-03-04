import { useState, useEffect, useMemo } from "react";
import { useNavigate, Link } from "react-router-dom";
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
import { useBatchRatings } from "@/hooks/useReviews";
import { TrendingUp, Heart, Database } from "lucide-react";
import heroImage from "@/assets/hero-image.jpg";
import type { SearchResult } from "@/types";
import { getImageFromUrl } from "@/lib/imageMap";
import { supabase } from "@/integrations/supabase/client";

const Index = () => {
  const navigate = useNavigate();
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [searchResults, setSearchResults] = useState<SearchResult[]>([]);
  const { user, profile, loading, currentRole } = useAuth();
  const { recommendations, loading: recommendationsLoading } = useRecommendations();

  // Fetch real experiences from DB
  const [experiences, setExperiences] = useState<any[]>([]);
  const [experiencesLoading, setExperiencesLoading] = useState(true);

  useEffect(() => {
    const fetchExperiences = async () => {
      try {
        const { data, error } = await supabase
          .from('experiences')
          .select(`
            id, title, location, price, duration_hours, max_guests, image_urls,
            categories ( name ),
            profiles ( first_name )
          `)
          .eq('is_active', true)
          .limit(12);

        if (!error && data) {
          setExperiences(data);
        }
      } catch (e) {
        console.error('Failed to fetch experiences:', e);
      } finally {
        setExperiencesLoading(false);
      }
    };
    fetchExperiences();
  }, []);

  const handleSearchResults = (results: SearchResult[]) => {
    setSearchResults(results);
  };

  useEffect(() => {
    if (user && profile && currentRole === 'host') {
      navigate('/host');
    }
  }, [user, profile, currentRole, navigate]);

  if (user && profile && !profile.onboarded && !profile.is_host) {
    return <WelcomeScreen onComplete={() => navigate(0)} />;
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-lilo-green/20 via-background to-lilo-blue/20 flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-lilo-green"></div>
      </div>
    );
  }

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
            
            <FeaturedExperiencesGrid 
              searchResults={searchResults}
              dbExperiences={experiences}
              selectedCategory={selectedCategory}
              isLoading={experiencesLoading}
            />
          </div>

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
            <div className="mt-4 flex justify-center gap-6 text-sm">
              <Link to="/privacy" className="hover:text-lilo-green transition-colors">Privacy Policy</Link>
              <Link to="/terms" className="hover:text-lilo-green transition-colors">Terms of Service</Link>
              <Link to="/support" className="hover:text-lilo-green transition-colors">Help Center</Link>
            </div>
            <div className="mt-2 text-sm">
              <span className="bg-gradient-brand bg-clip-text text-transparent font-semibold">Neighbors helping neighbors discover more</span>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

// Separate component for featured experiences - batches all ratings in ONE request
interface FeaturedExperiencesGridProps {
  searchResults: SearchResult[];
  dbExperiences: any[];
  selectedCategory: string;
  isLoading: boolean;
}

const FeaturedExperiencesGrid = ({ searchResults, dbExperiences, selectedCategory, isLoading }: FeaturedExperiencesGridProps) => {
  const experienceIds = useMemo(() => {
    if (searchResults.length > 0) {
      return searchResults.map(e => e.id);
    }
    return dbExperiences
      .filter(e => selectedCategory === "all" || (e.categories?.name || '').toLowerCase().includes(selectedCategory))
      .map(e => e.id);
  }, [searchResults, dbExperiences, selectedCategory]);

  const { ratings } = useBatchRatings(experienceIds);

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 px-4">
        {[...Array(4)].map((_, i) => (
          <div key={i} className="animate-pulse bg-muted rounded-lg h-72"></div>
        ))}
      </div>
    );
  }

  if (searchResults.length > 0) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-6 px-4">
        {searchResults.map((experience, index) => {
          const ratingData = ratings[experience.id];
          return (
            <div 
              key={experience.id}
              className="animate-fade-in"
              style={{ animationDelay: `${index * 0.1}s` }}
            >
              <ExperienceCard 
                id={experience.id}
                title={experience.title}
                image={getImageFromUrl(experience.image_urls?.[0] || '/placeholder-experience.jpg')}
                category={(experience as any).categories?.name || "Experience"}
                price={experience.price}
                duration={`${experience.duration_hours || 2} hours`}
                rating={ratingData?.rating || 0}
                reviewCount={ratingData?.count || 0}
                location={experience.location}
                hostName={(experience as any).profiles?.first_name || "Local Host"}
                maxGuests={experience.max_guests || 6}
                isNew={false}
              />
            </div>
          );
        })}
      </div>
    );
  }

  const filtered = dbExperiences.filter(experience => 
    selectedCategory === "all" || (experience.categories?.name || '').toLowerCase().includes(selectedCategory)
  );

  if (filtered.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-muted-foreground text-lg">
          {selectedCategory !== "all" 
            ? "No experiences found for the selected category. Try a different search or category."
            : "No experiences available yet. Check back soon!"}
        </p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-6 px-4">
      {filtered.map((experience, index) => {
        const ratingData = ratings[experience.id];
        return (
          <div 
            key={experience.id}
            className="animate-fade-in"
            style={{ animationDelay: `${index * 0.1}s` }}
          >
            <ExperienceCard 
              id={experience.id}
              title={experience.title}
              image={getImageFromUrl(experience.image_urls?.[0] || '/placeholder.svg')}
              category={experience.categories?.name || "Experience"}
              price={experience.price}
              duration={`${experience.duration_hours} hours`}
              rating={ratingData?.rating || 0}
              reviewCount={ratingData?.count || 0}
              location={experience.location}
              hostName={experience.profiles?.first_name || "Local Host"}
              maxGuests={experience.max_guests}
            />
          </div>
        );
      })}
    </div>
  );
};

export default Index;
