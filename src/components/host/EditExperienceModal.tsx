import { useState, useEffect } from 'react';
import { useForm, type FieldErrors } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Clock, Users, MapPin, DollarSign, Camera } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { PhotoUpload } from '@/components/PhotoUpload';
import { experienceSchema } from '@/lib/validation';
import { sanitizeString } from '@/lib/sanitize';

interface Experience {
  id: string;
  title: string;
  description: string;
  location: string;
  address?: string;
  price: number;
  duration_hours: number;
  max_guests: number;
  cancellation_policy?: string;
  image_urls?: string[];
  is_active: boolean;
}

type ExperienceFormValues = z.infer<typeof experienceSchema>;

interface EditExperienceModalProps {
  experience: Experience | null;
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export const EditExperienceModal = ({ 
  experience, 
  isOpen, 
  onClose, 
  onSuccess 
}: EditExperienceModalProps) => {
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [photos, setPhotos] = useState<string[]>([]);
  const [showPhotoSection, setShowPhotoSection] = useState(false);
  const [isActive, setIsActive] = useState(false);

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

  // Update form when experience changes
  useEffect(() => {
    if (experience) {
      form.reset({
        title: experience.title,
        description: experience.description,
        location: experience.location,
        address: experience.address || '',
        price: experience.price,
        duration_hours: experience.duration_hours,
        max_guests: experience.max_guests,
        cancellation_policy: experience.cancellation_policy || ''
      });
      setPhotos(experience.image_urls || []);
      setIsActive(experience.is_active);
    }
  }, [experience, form]);

  const onSubmit = async (values: ExperienceFormValues) => {
    if (!experience) return;
    
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
        cancellation_policy: sanitizeString(values.cancellation_policy || ''),
        image_urls: photos,
        is_active: isActive
      };

      const { error } = await supabase
        .from('experiences')
        .update(sanitized)
        .eq('id', experience.id);

      if (error) throw error;

      toast({
        title: 'Experience Updated!',
        description: 'Your experience has been updated successfully.'
      });

      onSuccess();
      onClose();
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
    toast({ 
      title: 'Validation Error', 
      description: message, 
      variant: 'destructive' 
    });
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Edit Experience</DialogTitle>
        </DialogHeader>
        
        <form onSubmit={form.handleSubmit(onSubmit, onError)} className="space-y-6">
          {/* Active/Inactive Toggle */}
          <div className="flex items-center justify-between p-4 border rounded-lg">
            <div>
              <Label className="text-base font-medium">Experience Status</Label>
              <p className="text-sm text-muted-foreground">
                {isActive ? 'Guests can find and book this experience' : 'Experience is hidden from guests'}
              </p>
            </div>
            <Switch
              checked={isActive}
              onCheckedChange={setIsActive}
            />
          </div>

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
                placeholder="Describe your experience..."
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

          {/* Photo Management */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <Label className="text-base font-medium">Photos</Label>
              <Button 
                type="button" 
                variant="outline" 
                size="sm"
                onClick={() => setShowPhotoSection(!showPhotoSection)}
              >
                <Camera className="w-4 h-4 mr-2" />
                {showPhotoSection ? 'Hide' : 'Manage'} Photos
              </Button>
            </div>
            
            {showPhotoSection && (
              <PhotoUpload
                onPhotosChange={setPhotos}
                maxPhotos={5}
                existingPhotos={photos}
              />
            )}
            
            {photos.length > 0 && !showPhotoSection && (
              <p className="text-sm text-muted-foreground">
                {photos.length} photo{photos.length > 1 ? 's' : ''} uploaded
              </p>
            )}
          </div>

          <div className="flex space-x-3 pt-4 border-t">
            <Button 
              type="button" 
              variant="outline" 
              onClick={onClose}
              className="flex-1"
            >
              Cancel
            </Button>
            <Button 
              type="submit" 
              disabled={loading}
              className="flex-1"
            >
              {loading ? "Updating..." : "Update Experience"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};