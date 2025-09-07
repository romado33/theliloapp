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
import { Clock, Users, MapPin, DollarSign, Camera } from 'lucide-react';
import { sanitizeString } from '@/lib/sanitize';

const experienceSchema = z.object({
  title: z.string().min(1, 'Title is required'),
  description: z.string().min(1, 'Description is required'),
  location: z.string().min(1, 'Location is required'),
  address: z.string().optional(),
  price: z.preprocess((val) => Number(val), z.number().min(0, 'Price must be at least 0').max(10000, 'Price too high')),
  duration_hours: z.preprocess((val) => Number(val), z.number().min(1, 'Duration must be at least 1 hour').max(24, 'Duration too long')),
  max_guests: z.preprocess((val) => Number(val), z.number().min(1, 'At least 1 guest').max(100, 'Too many guests')),
  category_id: z.string().optional(),
  cancellation_policy: z.string().optional()
});

type ExperienceFormValues = z.infer<typeof experienceSchema>;

export const HostExperienceForm = ({ onSuccess }: { onSuccess?: () => void }) => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);

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
      category_id: '',
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
        category_id: values.category_id || null,
        what_included: [] as string[],
        what_to_bring: [] as string[],
        cancellation_policy: sanitizeString(values.cancellation_policy || '')
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
          <span>Create Your Experience</span>
          <Badge variant="outline" className="text-xs">
            Under Review
          </Badge>
        </CardTitle>
      </CardHeader>
      
      <CardContent>
        <form onSubmit={form.handleSubmit(onSubmit, onError)} className="space-y-6">
          <div className="space-y-4">
            <div>
              <Label htmlFor="title">Experience Title *</Label>
              <Input
                id="title"
                placeholder="Farm Visit & Animal Feeding"
                required
                {...form.register('title')}
              />
            </div>

            <div>
              <Label htmlFor="description">Description *</Label>
              <Textarea
                id="description"
                placeholder="Describe your experience, what makes it special, and what families can expect..."
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
            
            <Button type="button" variant="outline" className="flex-1">
              <Camera className="w-4 h-4 mr-2" />
              Add Photos Later
            </Button>
          </div>

          <div className="text-sm text-muted-foreground bg-muted p-3 rounded-md">
            <strong>What happens next?</strong>
            <ol className="list-decimal list-inside mt-2 space-y-1">
              <li>Your experience will be reviewed by our team</li>
              <li>We may contact you for additional information</li>
              <li>Once approved, you can add photos and set availability</li>
              <li>Your experience will go live for bookings</li>
            </ol>
          </div>
        </form>
      </CardContent>
    </Card>
  );
};