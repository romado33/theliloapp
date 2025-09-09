import { useState } from 'react';
import { useForm, type FieldErrors } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/hooks/useAuth';
import { PhotoUpload } from '@/components/PhotoUpload';
import { Clock, Users, MapPin, DollarSign, Camera } from 'lucide-react';
import { experienceSchema } from '@/lib/validation';
import { sanitizeString } from '@/lib/sanitize';

type ExperienceFormValues = z.infer<typeof experienceSchema>;

export const HostExperienceForm = ({ onSuccess }: { onSuccess?: () => void }) => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [photos, setPhotos] = useState<string[]>([]);
  const [showPhotoSection, setShowPhotoSection] = useState(false);

  const form = useForm<ExperienceFormValues>({
    resolver: zodResolver(experienceSchema),
    defaultValues: {
      title: '',
      description: '',
      location: '',
      address: '',
      price: 0,
      duration_hours: 1,
      max_guests: 1,
      cancellation_policy: ''
    }
  });

  const onSubmit = async (values: ExperienceFormValues) => {
    if (!user) return;
    setLoading(true);
    try {
      const sanitized = {
        title: sanitizeString(values.title),
        description: sanitizeString(values.description),
        location: sanitizeString(values.location),
        address: sanitizeString(values.address || ''),
        price: values.price,
        duration_hours: values.duration_hours,
        max_guests: values.max_guests,
        category_id: null as string | null,
        what_included: [] as string[],
        what_to_bring: [] as string[],
        cancellation_policy: sanitizeString(values.cancellation_policy || ''),
        image_urls: photos
      };

      const { error } = await supabase
        .from('experiences')
        .insert({
          host_id: user.id,
          ...sanitized,
          status: 'submitted',
          is_active: false
        });

      if (error) throw error;

      toast({
        title: 'Experience Submitted!',
        description: "Your experience has been submitted for review. You'll be notified once it's approved."
      });

      form.reset();
      onSuccess?.();
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message,
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  };

  const onError = (errors: FieldErrors<ExperienceFormValues>) => {
    const message = Object.values(errors)
      .map((err) => err?.message as string)
      .filter(Boolean)
      .join('\n');
    toast({ title: 'Validation Error', description: message, variant: 'destructive' });
  };

  return (
    <Card className="w-full max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle className="flex items-center space-x-2">
          <span>Share Your Local Experience</span>
          <Badge variant="outline" className="text-xs">
            Community Host
          </Badge>
        </CardTitle>
        <p className="text-sm text-muted-foreground mt-2">
          Connect with Ottawa families by sharing your skills, farm, workshop, or local knowledge
        </p>
      </CardHeader>
      
      <CardContent>
        <form onSubmit={form.handleSubmit(onSubmit, onError)} className="space-y-6">
          <div className="space-y-4">
            <div>
              <Label htmlFor="title">Experience Title *</Label>
              <Input
                id="title"
                placeholder="e.g., Feed Animals & Learn About Farm Life"
                required
                {...form.register('title')}
              />
            </div>

            <div>
              <Label htmlFor="description">Description *</Label>
              <Textarea
                id="description"
                placeholder="Describe your experience: What will families do? What makes it special? What can kids expect to learn or discover?"
                rows={4}
                required
                {...form.register('description')}
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="location" className="flex items-center space-x-1">
                  <MapPin className="w-4 h-4" />
                  <span>Location *</span>
                </Label>
                <Input
                  id="location"
                  placeholder="Ottawa, ON"
                  required
                  {...form.register('location')}
                />
              </div>

              <div>
                <Label htmlFor="address">Full Address</Label>
                <Input
                  id="address"
                  placeholder="123 Farm Road, Ottawa, ON"
                  {...form.register('address')}
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <Label htmlFor="price" className="flex items-center space-x-1">
                  <DollarSign className="w-4 h-4" />
                  <span>Price per Person *</span>
                </Label>
                <Input
                  id="price"
                  type="number"
                  step="0.01"
                  placeholder="25.00"
                  required
                  {...form.register('price', { valueAsNumber: true })}
                />
              </div>

              <div>
                <Label htmlFor="duration" className="flex items-center space-x-1">
                  <Clock className="w-4 h-4" />
                  <span>Duration (hours) *</span>
                </Label>
                <Input
                  id="duration"
                  type="number"
                  placeholder="2"
                  required
                  {...form.register('duration_hours', { valueAsNumber: true })}
                />
              </div>

              <div>
                <Label htmlFor="max_guests" className="flex items-center space-x-1">
                  <Users className="w-4 h-4" />
                  <span>Max Guests *</span>
                </Label>
                <Input
                  id="max_guests"
                  type="number"
                  placeholder="8"
                  required
                  {...form.register('max_guests', { valueAsNumber: true })}
                />
              </div>
            </div>

            <div>
              <Label htmlFor="cancellation_policy">Cancellation Policy</Label>
              <Textarea
                id="cancellation_policy"
                placeholder="Free cancellation 24 hours before the experience..."
                rows={2}
                {...form.register('cancellation_policy')}
              />
            </div>
          </div>

          <div className="flex flex-col sm:flex-row gap-4">
            <Button type="submit" disabled={loading} className="flex-1">
              {loading ? "Submitting..." : "Submit for Review"}
            </Button>
            
            <Button 
              type="button" 
              variant="outline" 
              className="flex-1"
              onClick={() => setShowPhotoSection(!showPhotoSection)}
            >
              <Camera className="w-4 h-4 mr-2" />
              {showPhotoSection ? 'Hide Photos' : 'Add Photos'}
            </Button>
          </div>

          {/* Photo Upload Section */}
          {showPhotoSection && (
            <PhotoUpload
              onPhotosChange={setPhotos}
              maxPhotos={5}
            />
          )}

          <div className="text-sm text-muted-foreground bg-muted p-3 rounded-md">
            <strong>What happens next?</strong>
            <ol className="list-decimal list-inside mt-2 space-y-1">
              <li>We'll review your experience to ensure it's family-friendly and safe</li>
              <li>Our team may contact you to discuss safety protocols and logistics</li>
              <li>Once approved, you can add photos and set your availability</li>
              <li>Local Ottawa families will discover and book your experience</li>
              <li>Build lasting connections with your community while earning income</li>
            </ol>
          </div>
        </form>
      </CardContent>
    </Card>
  );
};