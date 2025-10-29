import { useState, useEffect } from 'react';
import { useQuery, useMutation } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Calendar, Clock, Users, MapPin } from 'lucide-react';

interface QuickBookModalProps {
  isOpen: boolean;
  onClose: () => void;
  experienceId: string;
  experienceTitle: string;
  experiencePrice: number;
  experienceLocation: string;
}

interface TimeSlot {
  id: string;
  start_time: string;
  end_time: string;
  available_spots: number;
}

const QuickBookModal = ({
  isOpen,
  onClose,
  experienceId,
  experienceTitle,
  experiencePrice,
  experienceLocation,
}: QuickBookModalProps) => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [selectedSlot, setSelectedSlot] = useState<string>('');
  const [guestCount, setGuestCount] = useState(1);
  const [contactInfo, setContactInfo] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
  });
  const [specialRequests, setSpecialRequests] = useState('');
  const {
    data: timeSlots = [],
    isLoading: slotsLoading,
    error: slotsError,
  } = useQuery({
    queryKey: ['availability', experienceId],
    enabled: isOpen,
    staleTime: 1000 * 60 * 5,
    gcTime: 1000 * 60 * 30,
    retry: 1,
    queryFn: async () => {
      const { data, error } = await supabase
        .from('availability')
        .select('*')
        .eq('experience_id', experienceId)
        .eq('is_available', true)
        .gte('available_spots', 1)
        .gte('start_time', new Date().toISOString())
        .order('start_time', { ascending: true })
        .limit(5);
      if (error) throw error;
      return data as TimeSlot[];
    },
  });

  // Fetch user profile and auto-fill contact info
  const { data: userProfile } = useQuery({
    queryKey: ['profile', user?.id],
    enabled: !!user?.id && isOpen,
    queryFn: async () => {
      const { data, error } = await supabase
        .from('profiles')
        .select('first_name, last_name, email, phone')
        .eq('id', user!.id)
        .single();
      if (error) throw error;
      return data;
    },
  });

  useEffect(() => {
    if (isOpen && userProfile) {
      setContactInfo({
        firstName: userProfile.first_name || '',
        lastName: userProfile.last_name || '',
        email: userProfile.email || user?.email || '',
        phone: userProfile.phone || '',
      });
    }
  }, [isOpen, userProfile, user]);

  useEffect(() => {
    if (slotsError) {
      toast({
        title: "Error",
        description: "Unable to load available time slots.",
        variant: "destructive",
      });
    }
  }, [slotsError, toast]);

  const formatDateTime = (dateString: string) => {
    const date = new Date(dateString);
    return {
      date: date.toLocaleDateString('en-US', { 
        weekday: 'short', 
        month: 'short', 
        day: 'numeric' 
      }),
      time: date.toLocaleTimeString('en-US', { 
        hour: '2-digit', 
        minute: '2-digit' 
      })
    };
  };

  const bookingMutation = useMutation({
    retry: 1,
    mutationFn: async ({ selectedTimeSlot }: { selectedTimeSlot: TimeSlot }) => {
      // Call create-payment edge function for server-side price calculation
      const { data, error } = await supabase.functions.invoke('create-payment', {
        body: {
          experienceId: experienceId,
          bookingDate: selectedTimeSlot.start_time,
          guestCount: guestCount,
          guestContactInfo: contactInfo,
          specialRequests: specialRequests || null
        }
      });
      if (error) throw error;
      return data;
    },
    onSuccess: (data) => {
      // Redirect to Stripe checkout
      if (data?.url) {
        window.location.href = data.url;
      } else {
        toast({
          title: "Booking initiated",
          description: "Redirecting to payment...",
        });
        onClose();
      }
    },
    onError: () => {
      toast({
        title: "Booking failed",
        description: "There was an error processing your booking. Please try again.",
        variant: "destructive",
      });
    },
  });

  const handleBooking = () => {
    if (!user) {
      toast({
        title: "Sign in required",
        description: "Please sign in to book an experience.",
        variant: "destructive",
      });
      return;
    }

    if (!selectedSlot) {
      toast({
        title: "Time slot required",
        description: "Please select a time slot.",
        variant: "destructive",
      });
      return;
    }

    if (!contactInfo.firstName || !contactInfo.lastName || !contactInfo.email) {
      toast({
        title: "Contact information required",
        description: "Please fill in all required contact information.",
        variant: "destructive",
      });
      return;
    }

    const selectedTimeSlot = timeSlots.find(slot => slot.id === selectedSlot);
    if (!selectedTimeSlot) {
      toast({
        title: "Invalid time slot",
        description: "Please select a valid time slot.",
        variant: "destructive",
      });
      return;
    }

    bookingMutation.mutate({ selectedTimeSlot });
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-md max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Calendar className="w-5 h-5 text-primary" />
            Quick Book
          </DialogTitle>
          <DialogDescription>
            Book {experienceTitle} - ${experiencePrice} per person
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {/* Location */}
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <MapPin className="w-4 h-4" />
            <span>{experienceLocation}</span>
          </div>

          {/* Time Slot Selection */}
            <div>
              <Label className="text-sm font-medium">Choose Time Slot</Label>
              <div className="space-y-2 mt-2">
                {slotsLoading ? (
                  <p className="text-sm text-muted-foreground">Loading slots...</p>
                ) : timeSlots.length === 0 ? (
                  <p className="text-sm text-muted-foreground">No available slots found</p>
                ) : (
                  timeSlots.map((slot) => {
                  const { date, time } = formatDateTime(slot.start_time);
                  return (
                    <button
                      key={slot.id}
                      type="button"
                      onClick={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        setSelectedSlot(slot.id);
                      }}
                      className={`w-full p-3 rounded-lg border text-left transition-colors ${
                        selectedSlot === slot.id
                          ? 'border-primary bg-primary/10'
                          : 'border-border hover:border-primary/50'
                      }`}
                    >
                      <div className="flex justify-between items-center">
                        <div>
                          <p className="font-medium text-sm">{date}</p>
                          <p className="text-sm text-muted-foreground flex items-center gap-1">
                            <Clock className="w-3 h-3" />
                            {time}
                          </p>
                        </div>
                        <Badge variant="secondary" className="text-xs">
                          {slot.available_spots} spots
                        </Badge>
                      </div>
                    </button>
                  );
                })
              )}
            </div>
          </div>

          {/* Guest Count */}
          <div>
            <Label className="text-sm font-medium">Number of Guests</Label>
            <div className="flex items-center justify-between border border-border rounded-lg p-3 mt-2">
              <span className="text-sm flex items-center gap-2">
                <Users className="w-4 h-4" />
                Adults & Children
              </span>
              <div className="flex items-center gap-3">
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={() => setGuestCount(Math.max(1, guestCount - 1))}
                  disabled={guestCount <= 1}
                >
                  -
                </Button>
                <span className="w-8 text-center">{guestCount}</span>
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={() => setGuestCount(guestCount + 1)}
                >
                  +
                </Button>
              </div>
            </div>
          </div>

          {/* Contact Information */}
          <div className="space-y-3">
            <Label className="text-sm font-medium">Contact Information</Label>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label htmlFor="firstName" className="text-xs text-muted-foreground">First Name *</Label>
                <Input
                  id="firstName"
                  value={contactInfo.firstName}
                  onChange={(e) => setContactInfo(prev => ({ ...prev, firstName: e.target.value }))}
                  className="mt-1"
                />
              </div>
              <div>
                <Label htmlFor="lastName" className="text-xs text-muted-foreground">Last Name *</Label>
                <Input
                  id="lastName"
                  value={contactInfo.lastName}
                  onChange={(e) => setContactInfo(prev => ({ ...prev, lastName: e.target.value }))}
                  className="mt-1"
                />
              </div>
            </div>
            <div>
              <Label htmlFor="email" className="text-xs text-muted-foreground">Email *</Label>
              <Input
                id="email"
                type="email"
                value={contactInfo.email}
                onChange={(e) => setContactInfo(prev => ({ ...prev, email: e.target.value }))}
                className="mt-1"
              />
            </div>
            <div>
              <Label htmlFor="phone" className="text-xs text-muted-foreground">Phone</Label>
              <Input
                id="phone"
                type="tel"
                value={contactInfo.phone}
                onChange={(e) => setContactInfo(prev => ({ ...prev, phone: e.target.value }))}
                className="mt-1"
              />
            </div>
          </div>

          {/* Special Requests */}
          <div>
            <Label htmlFor="requests" className="text-sm font-medium">Special Requests (Optional)</Label>
            <Textarea
              id="requests"
              value={specialRequests}
              onChange={(e) => setSpecialRequests(e.target.value)}
              placeholder="Any dietary restrictions, accessibility needs, or special requests..."
              className="mt-2 min-h-[60px]"
            />
          </div>

          {/* Price Summary */}
          <div className="border-t pt-3">
            <div className="flex justify-between text-sm mb-2">
              <span>${experiencePrice} × {guestCount} guest{guestCount > 1 ? 's' : ''}</span>
              <span>${experiencePrice * guestCount}</span>
            </div>
            <div className="flex justify-between font-medium">
              <span>Total</span>
              <span>${experiencePrice * guestCount}</span>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-2 pt-2">
            <Button variant="outline" onClick={onClose} className="flex-1">
              Cancel
            </Button>
              <Button
                onClick={handleBooking}
                disabled={bookingMutation.isPending || !selectedSlot || timeSlots.length === 0}
                className="flex-1"
              >
                {bookingMutation.isPending ? 'Booking...' : 'Book Now'}
              </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default QuickBookModal;