import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/hooks/useAuth';
import { Clock, Users, MapPin, DollarSign, Camera } from 'lucide-react';

interface FormData {
  title: string;
  description: string;
  location: string;
  address: string;
  price: string;
  duration_hours: string;
  max_guests: string;
  category_id: string;
  what_included: string[];
  what_to_bring: string[];
  cancellation_policy: string;
}

export const HostExperienceForm = ({ onSuccess }: { onSuccess?: () => void }) => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState<FormData>({
    title: '',
    description: '',
    location: '',
    address: '',
    price: '',
    duration_hours: '',
    max_guests: '',
    category_id: '',
    what_included: [],
    what_to_bring: [],
    cancellation_policy: ''
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    setLoading(true);
    try {
      const { error } = await supabase
        .from('experiences')
        .insert({
          host_id: user.id,
          title: formData.title,
          description: formData.description,
          location: formData.location,
          address: formData.address,
          price: parseFloat(formData.price),
          duration_hours: parseInt(formData.duration_hours),
          max_guests: parseInt(formData.max_guests),
          category_id: formData.category_id || null,
          what_included: formData.what_included,
          what_to_bring: formData.what_to_bring,
          cancellation_policy: formData.cancellation_policy,
          status: 'submitted',
          is_active: false // Inactive until approved
        });

      if (error) throw error;

      toast({
        title: "Experience Submitted!",
        description: "Your experience has been submitted for review. You'll be notified once it's approved."
      });

      // Reset form
      setFormData({
        title: '', description: '', location: '', address: '', price: '',
        duration_hours: '', max_guests: '', category_id: '', 
        what_included: [], what_to_bring: [], cancellation_policy: ''
      });

      onSuccess?.();
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const updateField = (field: keyof FormData, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
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
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-4">
            <div>
              <Label htmlFor="title">Experience Title *</Label>
              <Input
                id="title"
                value={formData.title}
                onChange={(e) => updateField('title', e.target.value)}
                placeholder="Farm Visit & Animal Feeding"
                required
              />
            </div>

            <div>
              <Label htmlFor="description">Description *</Label>
              <Textarea
                id="description"
                value={formData.description}
                onChange={(e) => updateField('description', e.target.value)}
                placeholder="Describe your experience, what makes it special, and what families can expect..."
                rows={4}
                required
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
                  value={formData.location}
                  onChange={(e) => updateField('location', e.target.value)}
                  placeholder="Ottawa, ON"
                  required
                />
              </div>

              <div>
                <Label htmlFor="address">Full Address</Label>
                <Input
                  id="address"
                  value={formData.address}
                  onChange={(e) => updateField('address', e.target.value)}
                  placeholder="123 Farm Road, Ottawa, ON"
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
                  value={formData.price}
                  onChange={(e) => updateField('price', e.target.value)}
                  placeholder="25.00"
                  required
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
                  value={formData.duration_hours}
                  onChange={(e) => updateField('duration_hours', e.target.value)}
                  placeholder="2"
                  required
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
                  value={formData.max_guests}
                  onChange={(e) => updateField('max_guests', e.target.value)}
                  placeholder="8"
                  required
                />
              </div>
            </div>

            <div>
              <Label htmlFor="cancellation_policy">Cancellation Policy</Label>
              <Textarea
                id="cancellation_policy"
                value={formData.cancellation_policy}
                onChange={(e) => updateField('cancellation_policy', e.target.value)}
                placeholder="Free cancellation 24 hours before the experience..."
                rows={2}
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