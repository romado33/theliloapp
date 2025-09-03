import { useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import Header from "@/components/Header";
import ExperienceCard from "@/components/ExperienceCard";
import CategoryFilter from "@/components/CategoryFilter";
import { Search, MapPin, TrendingUp, Heart } from "lucide-react";
import heroImage from "@/assets/hero-image.jpg";
import potteryClass from "@/assets/pottery-class.jpg";
import farmersMarket from "@/assets/farmers-market.jpg";
import cookingClass from "@/assets/cooking-class.jpg";

const mockExperiences = [
  {
    id: "1",
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
    id: "2",
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
    id: "3",
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
  const [searchQuery, setSearchQuery] = useState("");
  const { user } = useAuth();

  const filteredExperiences = mockExperiences.filter(experience => {
    const matchesCategory = selectedCategory === "all" || 
      experience.category.toLowerCase().includes(selectedCategory);
    const matchesSearch = experience.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      experience.category.toLowerCase().includes(searchQuery.toLowerCase());
    
    return matchesCategory && matchesSearch;
  });

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
        
        <div className="relative z-10 text-center max-w-4xl mx-auto px-4 py-20">
          <div className="animate-fade-in">
            <h1 className="text-5xl md:text-7xl font-bold mb-6 leading-tight">
              Live <span className="bg-gradient-hero bg-clip-text text-transparent">Local</span>
            </h1>
            <p className="text-xl md:text-2xl text-muted-foreground mb-8 max-w-2xl mx-auto">
              Discover unique experiences in your neighborhood. Connect with local businesses and create unforgettable memories.
            </p>
            
            {/* Hero Search */}
            <div className="flex flex-col sm:flex-row gap-4 max-w-xl mx-auto mb-8">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-5 h-5" />
                <Input 
                  placeholder="What would you like to try?" 
                  className="pl-12 h-12 text-lg bg-background/90 backdrop-blur-sm border-2 border-primary/20 focus:border-primary"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
              <Button size="lg" variant="hero" className="h-12 px-8 text-lg">
                <MapPin className="w-5 h-5" />
                Explore
              </Button>
            </div>
            
            <div className="flex flex-wrap justify-center gap-4 text-sm text-muted-foreground">
              <div className="flex items-center gap-1">
                <TrendingUp className="w-4 h-4" />
                <span>500+ local experiences</span>
              </div>
              <div className="flex items-center gap-1">
                <Heart className="w-4 h-4" />
                <span>Trusted by locals</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Main Content */}
      <section className="container mx-auto px-4 py-12">
        <div className="space-y-8">
          {/* Categories */}
          <div className="animate-slide-up">
            <h2 className="text-2xl font-bold mb-4">Browse by Category</h2>
            <CategoryFilter 
              selectedCategory={selectedCategory}
              onCategoryChange={setSelectedCategory}
            />
          </div>

          {/* Featured Experiences */}
          <div className="animate-slide-up">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold">
                {selectedCategory === "all" ? "Featured Experiences" : `${selectedCategory} Experiences`}
              </h2>
              <Button variant="ghost" className="text-primary hover:text-primary-dark">
                View all
              </Button>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredExperiences.map((experience, index) => (
                <div 
                  key={experience.id}
                  className="animate-fade-in"
                  style={{ animationDelay: `${index * 0.1}s` }}
                >
                  <ExperienceCard {...experience} />
                </div>
              ))}
            </div>
            
            {filteredExperiences.length === 0 && (
              <div className="text-center py-12">
                <p className="text-muted-foreground text-lg">
                  No experiences found for "{searchQuery || selectedCategory}". Try a different search or category.
                </p>
              </div>
            )}
          </div>

          {/* CTA Section */}
          <div className="bg-gradient-accent rounded-2xl p-8 md:p-12 text-center text-white animate-fade-in">
            <h3 className="text-3xl font-bold mb-4">Share Your Passion</h3>
            <p className="text-xl mb-6 opacity-90">
              Turn your skills into income by hosting experiences in your community
            </p>
            <Button size="lg" variant="secondary" className="bg-background text-foreground hover:bg-background/90">
              Become a Host
            </Button>
          </div>
        </div>
      </section>
      
      {/* Footer */}
      <footer className="bg-card/50 border-t border-border mt-20">
        <div className="container mx-auto px-4 py-8">
          <div className="text-center text-muted-foreground">
            <div className="flex items-center justify-center mb-4">
              <img 
                src="/lovable-uploads/6dfadda4-fb06-470c-940d-2bccb95a8f8f.png" 
                alt="Lilo - Live Local" 
                className="h-12 w-auto opacity-70"
              />
            </div>
            <p>Connecting communities through local experiences</p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Index;