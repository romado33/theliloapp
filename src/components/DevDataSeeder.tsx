import { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Loader2, Database, Users, Star } from "lucide-react";

// Import the generated images
import pastaImage from "@/assets/pasta-making-class.jpg";
import potteryImage from "@/assets/pottery-workshop.jpg";
import waterfallImage from "@/assets/waterfall-hike.jpg";
import yogaImage from "@/assets/sunset-yoga.jpg";
import wineImage from "@/assets/wine-tasting.jpg";

const DevDataSeeder = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [isSeeding, setIsSeeding] = useState(false);
  const [seededData, setSeededData] = useState({
    experiences: 0,
    availability: 0,
    reviews: 0
  });

  const sampleExperiences = [
    {
      title: "Authentic Italian Pasta Making",
      description: "Learn to make fresh pasta from scratch in my cozy kitchen. We'll prepare three different pasta shapes and two classic sauces. Perfect for beginners and pasta lovers alike!",
      location: "San Francisco, CA",
      address: "123 Mission Street, San Francisco, CA 94105",
      price: 85.00,
      duration_hours: 3,
      max_guests: 6,
      image_urls: [pastaImage],
      what_included: ["All ingredients and equipment", "Recipe cards to take home", "Wine tasting", "Full meal to enjoy"],
      what_to_bring: ["Apron (optional)", "Camera for photos"],
      cancellation_policy: "Free cancellation up to 24 hours before the experience",
      latitude: 37.7749,
      longitude: -122.4194,
      category: "Cooking Classes"
    },
    {
      title: "Pottery Wheel Throwing Workshop",
      description: "Create your own ceramic bowl or mug on the pottery wheel. I'll guide you through the entire process from centering clay to shaping your piece. No experience needed!",
      location: "Portland, OR",
      address: "456 Alberta Street, Portland, OR 97211",
      price: 75.00,
      duration_hours: 2,
      max_guests: 4,
      image_urls: [potteryImage],
      what_included: ["All clay and tools", "Glazing and firing included", "Refreshments"],
      what_to_bring: ["Clothes you don't mind getting dirty", "Hair tie if you have long hair"],
      cancellation_policy: "48 hours cancellation policy",
      latitude: 45.5152,
      longitude: -122.6784,
      category: "Art & Crafts"
    },
    {
      title: "Hidden Waterfall Hiking Adventure",
      description: "Discover a secret waterfall just 30 minutes from downtown Denver. This moderate 4-mile hike offers stunning mountain views and ends at a beautiful swimming hole.",
      location: "Denver, CO",
      address: "Morrison, CO 80465",
      price: 45.00,
      duration_hours: 4,
      max_guests: 8,
      image_urls: [waterfallImage],
      what_included: ["Professional guide", "Safety equipment", "Snacks and water", "Photography tips"],
      what_to_bring: ["Hiking boots", "Water bottle", "Sun protection", "Swimwear (optional)"],
      cancellation_policy: "Weather dependent - full refund if cancelled due to conditions",
      latitude: 39.6403,
      longitude: -105.0781,
      category: "Outdoor Adventures"
    },
    {
      title: "Sunset Yoga & Meditation",
      description: "Join me for a peaceful yoga session as the sun sets over the city. We'll practice gentle flows followed by guided meditation. Perfect for all levels.",
      location: "Austin, TX",
      address: "Zilker Park, Austin, TX 78746",
      price: 35.00,
      duration_hours: 1,
      max_guests: 12,
      image_urls: [yogaImage],
      what_included: ["Yoga mats provided", "Meditation guidance", "Herbal tea after class"],
      what_to_bring: ["Comfortable clothing", "Water bottle", "Blanket for meditation"],
      cancellation_policy: "Free cancellation up to 2 hours before class",
      latitude: 30.2672,
      longitude: -97.7431,
      category: "Wellness & Fitness"
    },
    {
      title: "French Wine Tasting Experience",
      description: "Explore the world of French wines with a certified sommelier. We'll taste 6 different wines paired with artisanal cheeses and learn about terroir and tasting techniques.",
      location: "Napa Valley, CA",
      address: "789 Vineyard Lane, Napa, CA 94558",
      price: 120.00,
      duration_hours: 2,
      max_guests: 10,
      image_urls: [wineImage],
      what_included: ["6 wine tastings", "Cheese pairings", "Tasting notes", "Professional sommelier"],
      what_to_bring: ["Designated driver or transportation"],
      cancellation_policy: "Must be 21+. 24-hour cancellation policy",
      latitude: 38.2975,
      longitude: -122.2869,
      category: "Culinary Adventures"
    }
  ];

  const seedTestData = async () => {
    if (!user) {
      toast({
        title: "Authentication required",
        description: "Please sign in to seed test data",
        variant: "destructive"
      });
      return;
    }

    setIsSeeding(true);
    let experienceCount = 0;
    let availabilityCount = 0;

    try {
      // First, get categories
      const { data: categories } = await supabase
        .from('categories')
        .select('id, name');

      if (!categories) {
        throw new Error('Could not fetch categories');
      }

      // Create experiences
      for (const exp of sampleExperiences) {
        const category = categories.find(cat => cat.name === exp.category);
        if (!category) continue;

        const { data: experience, error: expError } = await supabase
          .from('experiences')
          .insert({
            host_id: user.id,
            category_id: category.id,
            title: exp.title,
            description: exp.description,
            location: exp.location,
            address: exp.address,
            price: exp.price,
            duration_hours: exp.duration_hours,
            max_guests: exp.max_guests,
            image_urls: exp.image_urls,
            what_included: exp.what_included,
            what_to_bring: exp.what_to_bring,
            cancellation_policy: exp.cancellation_policy,
            latitude: exp.latitude,
            longitude: exp.longitude
          })
          .select()
          .single();

        if (expError) {
          console.error('Error creating experience:', expError);
          continue;
        }

        experienceCount++;

        // Add availability slots for each experience
        const availabilitySlots = [
          {
            start_time: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000).toISOString(), // 2 days from now
            end_time: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000 + exp.duration_hours * 60 * 60 * 1000).toISOString(),
            available_spots: exp.max_guests
          },
          {
            start_time: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(), // 1 week from now
            end_time: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000 + exp.duration_hours * 60 * 60 * 1000).toISOString(),
            available_spots: exp.max_guests
          }
        ];

        for (const slot of availabilitySlots) {
          const { error: availError } = await supabase
            .from('availability')
            .insert({
              experience_id: experience.id,
              start_time: slot.start_time,
              end_time: slot.end_time,
              available_spots: slot.available_spots
            });

          if (!availError) availabilityCount++;
        }
      }

      setSeededData({
        experiences: experienceCount,
        availability: availabilityCount,
        reviews: 0
      });

      toast({
        title: "Test data seeded successfully!",
        description: `Created ${experienceCount} experiences with ${availabilityCount} availability slots`
      });

    } catch (error) {
      console.error('Error seeding data:', error);
      toast({
        title: "Error seeding data",
        description: error instanceof Error ? error.message : "An unexpected error occurred",
        variant: "destructive"
      });
    } finally {
      setIsSeeding(false);
    }
  };

  if (!user) {
    return (
      <Card className="w-full max-w-2xl mx-auto">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Database className="w-5 h-5" />
            Developer Data Seeder
          </CardTitle>
          <CardDescription>
            Sign in to populate your database with test experiences and data
          </CardDescription>
        </CardHeader>
      </Card>
    );
  }

  return (
    <Card className="w-full max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Database className="w-5 h-5" />
          Developer Data Seeder
        </CardTitle>
        <CardDescription>
          Quickly populate your database with test experiences, availability, and sample data
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-3 gap-4 text-center">
          <div className="p-3 bg-muted rounded-lg">
            <div className="text-2xl font-bold text-primary">{seededData.experiences}</div>
            <div className="text-sm text-muted-foreground">Experiences</div>
          </div>
          <div className="p-3 bg-muted rounded-lg">
            <div className="text-2xl font-bold text-primary">{seededData.availability}</div>
            <div className="text-sm text-muted-foreground">Time Slots</div>
          </div>
          <div className="p-3 bg-muted rounded-lg">
            <div className="text-2xl font-bold text-primary">{seededData.reviews}</div>
            <div className="text-sm text-muted-foreground">Reviews</div>
          </div>
        </div>

        <div className="space-y-2">
          <h4 className="font-medium">What will be created:</h4>
          <div className="flex flex-wrap gap-2">
            <Badge variant="outline">🍝 Pasta Making Class</Badge>
            <Badge variant="outline">🏺 Pottery Workshop</Badge>
            <Badge variant="outline">🥾 Waterfall Hiking</Badge>
            <Badge variant="outline">🧘 Sunset Yoga</Badge>
            <Badge variant="outline">🍷 Wine Tasting</Badge>
          </div>
        </div>

        <Button 
          onClick={seedTestData} 
          disabled={isSeeding}
          className="w-full"
          size="lg"
        >
          {isSeeding ? (
            <>
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              Seeding Test Data...
            </>
          ) : (
            <>
              <Database className="w-4 h-4 mr-2" />
              Seed Test Data
            </>
          )}
        </Button>

        <p className="text-sm text-muted-foreground">
          This will create 5 sample experiences with availability slots as the signed-in user. 
          Perfect for testing the app functionality!
        </p>
      </CardContent>
    </Card>
  );
};

export default DevDataSeeder;