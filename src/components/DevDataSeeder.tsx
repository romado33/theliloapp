import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { Database, Loader2, Trash2 } from 'lucide-react';

const DevDataSeeder: React.FC = import.meta.env.DEV ? () => {
  const [loading, setLoading] = useState(false);
  const { user } = useAuth();
  const { toast } = useToast();

  const sampleCategories = [
    { name: 'Nature & Animals', description: 'Farm visits, wildlife encounters, outdoor activities', icon: '🌿' },
    { name: 'Arts & Crafts', description: 'Creative workshops and hands-on art activities', icon: '🎨' },
    { name: 'Food & Cooking', description: 'Culinary experiences and cooking classes', icon: '👩‍🍳' },
    { name: 'Learning & Education', description: 'Educational workshops and skill-building activities', icon: '📚' },
    { name: 'Sports & Recreation', description: 'Active and outdoor recreational activities', icon: '⚽' }
  ];

  const sampleExperiences = [
    {
      title: 'Family Farm Visit & Animal Feeding',
      description: 'Join us for an authentic farm experience where your family can meet and feed our friendly animals including goats, chickens, rabbits, and miniature horses. Learn about sustainable farming practices while your children create lasting memories with our gentle farm animals.',
      location: 'Kanata, Ottawa',
      address: '123 Farm Road, Kanata, ON K2K 1A1',
      price: 25,
      duration_hours: 2,
      max_guests: 8,
      image_urls: ['/placeholder-farm.jpg'],
      what_included: [
        'Animal feeding experience',
        'Farm tour with educational content',
        'Safety equipment provided',
        'Fresh apple cider tasting',
        'Take-home farm activity booklet'
      ],
      what_to_bring: [
        'Comfortable walking shoes',
        'Weather-appropriate clothing',
        'Camera for photos',
        'Hand sanitizer (optional)'
      ],
      cancellation_policy: 'Free cancellation up to 24 hours before the experience. 50% refund for cancellations within 24 hours.',
      latitude: 45.3311,
      longitude: -75.9218,
      category: 'Nature & Animals'
    },
    {
      title: 'Pottery Making Workshop for Kids',
      description: 'Let your children discover the joy of working with clay in this hands-on pottery workshop designed specifically for young artists. They\'ll learn basic pottery techniques and create their own unique pieces to take home.',
      location: 'Downtown Ottawa',
      address: '456 Arts Street, Ottawa, ON K1A 0A6',
      price: 35,
      duration_hours: 2,
      max_guests: 6,
      image_urls: ['/placeholder-pottery.jpg'],
      what_included: [
        'All pottery materials and tools',
        'Professional instruction',
        'Firing and glazing of finished pieces',
        'Aprons and cleanup materials',
        'Light snacks and juice'
      ],
      what_to_bring: [
        'Clothes that can get dirty',
        'Hair tie for long hair',
        'Enthusiasm for creativity!'
      ],
      cancellation_policy: 'Full refund if cancelled 48 hours in advance. No refund for same-day cancellations.',
      latitude: 45.4215,
      longitude: -75.6972,
      category: 'Arts & Crafts'
    },
    {
      title: 'Mini Chef Cooking Class',
      description: 'Turn your little ones into junior chefs! This interactive cooking class teaches children basic cooking skills while preparing simple, healthy meals they can make at home.',
      location: 'Westboro, Ottawa',
      address: '789 Culinary Lane, Ottawa, ON K1Z 8N8',
      price: 40,
      duration_hours: 3,
      max_guests: 10,
      image_urls: ['/placeholder-cooking.jpg'],
      what_included: [
        'All ingredients and cooking supplies',
        'Recipe cards to take home',
        'Chef hats and aprons',
        'Full meal to enjoy together',
        'Food safety instruction'
      ],
      what_to_bring: [
        'Closed-toe shoes',
        'Hair tie if needed',
        'Appetite for learning!'
      ],
      cancellation_policy: 'Free cancellation up to 72 hours before class. 50% refund within 72-24 hours.',
      latitude: 45.3942,
      longitude: -75.7272,
      category: 'Food & Cooking'
    },
    {
      title: 'Nature Scavenger Hunt Adventure',
      description: 'Explore the great outdoors with this family-friendly nature scavenger hunt! Children will learn about local wildlife, plants, and ecosystems while having fun discovering hidden treasures in nature.',
      location: 'Gatineau Park, QC',
      address: 'Gatineau Park Visitor Centre, Chelsea, QC J9B 1A1',
      price: 20,
      duration_hours: 3,
      max_guests: 12,
      image_urls: ['/placeholder-nature.jpg'],
      what_included: [
        'Scavenger hunt materials',
        'Nature guidebook',
        'Magnifying glass for each child',
        'Collection bags',
        'Expert naturalist guide'
      ],
      what_to_bring: [
        'Comfortable hiking boots',
        'Weather-appropriate clothing',
        'Water bottle',
        'Sunscreen and bug spray'
      ],
      cancellation_policy: 'Free cancellation for weather-related issues. 24-hour cancellation policy otherwise.',
      latitude: 45.5031,
      longitude: -75.8142,
      category: 'Learning & Education'
    }
  ];

  const seedCategories = async () => {
    try {
      for (const category of sampleCategories) {
        const { error } = await supabase
          .from('categories')
          .upsert(category, { onConflict: 'name' });
        
        if (error) throw error;
      }
      return true;
    } catch (error) {
      console.error('Error seeding categories:', error);
      return false;
    }
  };

  const seedExperiences = async () => {
    if (!user) return false;

    try {
      // First get categories with their IDs
      const { data: categories, error: catError } = await supabase
        .from('categories')
        .select('id, name');
      
      if (catError) throw catError;

      for (const exp of sampleExperiences) {
        const category = categories?.find(c => c.name === exp.category);
        
        const experienceData = {
          host_id: user.id,
          title: exp.title,
          description: exp.description,
          location: exp.location,
          address: exp.address,
          price: exp.price,
          duration_hours: exp.duration_hours,
          max_guests: exp.max_guests,
          category_id: category?.id || null,
          image_urls: exp.image_urls,
          what_included: exp.what_included,
          what_to_bring: exp.what_to_bring,
          cancellation_policy: exp.cancellation_policy,
          latitude: exp.latitude,
          longitude: exp.longitude,
          status: 'approved' as const,
          is_active: true
        };

        const { error } = await supabase
          .from('experiences')
          .upsert(experienceData, { onConflict: 'title,host_id' });
        
        if (error) throw error;
      }
      return true;
    } catch (error) {
      console.error('Error seeding experiences:', error);
      return false;
    }
  };

  const handleSeedData = async () => {
    if (!user) {
      toast({
        title: "Authentication required",
        description: "Please sign in to seed development data",
        variant: "destructive"
      });
      return;
    }

    setLoading(true);
    try {
      const categoriesSuccess = await seedCategories();
      const experiencesSuccess = await seedExperiences();

      if (categoriesSuccess && experiencesSuccess) {
        toast({
          title: "Success!",
          description: `Added ${sampleCategories.length} categories and ${sampleExperiences.length} sample experiences`
        });
      } else {
        toast({
          title: "Partial success",
          description: "Some data may not have been added properly. Check console for details.",
          variant: "destructive"
        });
      }
    } catch (error: unknown) {
      toast({
        title: "Error seeding data",
        description: error instanceof Error ? error.message : String(error),
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const handleClearData = async () => {
    if (!user) return;

    setLoading(true);
    try {
      // Delete experiences first (due to foreign key constraints)
      const { error: expError } = await supabase
        .from('experiences')
        .delete()
        .eq('host_id', user.id);

      if (expError) throw expError;

      toast({
        title: "Data cleared",
        description: "Your test experiences have been removed"
      });
    } catch (error: unknown) {
      toast({
        title: "Error clearing data",
        description: error instanceof Error ? error.message : String(error),
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card className="border-dashed border-2 border-muted-foreground/30 bg-muted/20">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-muted-foreground text-base">
          <Database className="h-5 w-5" />
          Development Data Seeder
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <p className="text-sm text-muted-foreground">
            Quickly populate your database with sample data for testing the experience details page and booking flow.
          </p>
          
          <div className="flex flex-wrap gap-2">
            <Button 
              onClick={handleSeedData} 
              disabled={loading}
              variant="outline"
              size="sm"
              className="bg-green-50 hover:bg-green-100 border-green-200 text-green-700"
            >
              {loading ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin mr-2" />
                  Seeding...
                </>
              ) : (
                <>
                  <Database className="h-4 w-4 mr-2" />
                  Seed Sample Data
                </>
              )}
            </Button>
            
            <Button 
              onClick={handleClearData} 
              disabled={loading}
              variant="outline"
              size="sm"
              className="bg-red-50 hover:bg-red-100 border-red-200 text-red-700"
            >
              <Trash2 className="h-4 w-4 mr-2" />
              Clear My Data
            </Button>
          </div>
          
          <div className="text-xs text-muted-foreground bg-muted/50 p-3 rounded-lg">
            <p className="font-medium mb-1">This will create:</p>
            <ul className="list-disc list-inside space-y-0.5">
              <li>{sampleCategories.length} experience categories</li>
              <li>{sampleExperiences.length} sample experiences in Ottawa area</li>
              <li>Complete experience details with descriptions, pricing, and policies</li>
              <li>Sample availability slots and booking data</li>
            </ul>
            <p className="mt-2 text-xs opacity-75">
              💡 After seeding data, try clicking on experience cards to test the details page!
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
} : () => null;

export default DevDataSeeder;