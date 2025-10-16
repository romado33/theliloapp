import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { Calendar, Clock } from 'lucide-react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

interface AvailabilitySlot {
  id: string;
  start_time: string;
  end_time: string;
  available_spots: number;
}

interface ModifyBookingDialogProps {
  booking: {
    id: string;
    experience_id: string;
    availability_id: string;
    booking_date: string;
    guest_count: number;
    special_requests?: string | null;
    experience: {
      max_guests: number;
    };
  } | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess: () => void;
}

export const ModifyBookingDialog = ({ booking, open, onOpenChange, onSuccess }: ModifyBookingDialogProps) => {
  const [guestCount, setGuestCount] = useState(booking?.guest_count || 1);
  const [specialRequests, setSpecialRequests] = useState(booking?.special_requests || '');
  const [selectedSlotId, setSelectedSlotId] = useState(booking?.availability_id || '');
  const [availableSlots, setAvailableSlots] = useState<AvailabilitySlot[]>([]);
  const [loadingSlots, setLoadingSlots] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    if (open && booking) {
      setGuestCount(booking.guest_count);
      setSpecialRequests(booking.special_requests || '');
      setSelectedSlotId(booking.availability_id);
      fetchAvailableSlots();
    }
  }, [open, booking]);

  const fetchAvailableSlots = async () => {
    if (!booking) return;

    try {
      setLoadingSlots(true);
      
      const { data, error } = await supabase
        .from('availability')
        .select('*')
        .eq('experience_id', booking.experience_id)
        .eq('is_available', true)
        .gte('start_time', new Date().toISOString())
        .order('start_time', { ascending: true })
        .limit(20);

      if (error) throw error;
      setAvailableSlots(data || []);
    } catch (error) {
      console.error('Error fetching slots:', error);
      toast({
        title: 'Error',
        description: 'Failed to load available time slots.',
        variant: 'destructive',
      });
    } finally {
      setLoadingSlots(false);
    }
  };

  const handleSubmit = async () => {
    if (!booking) return;

    try {
      setSubmitting(true);

      const selectedSlot = availableSlots.find(s => s.id === selectedSlotId);
      
      const { error } = await supabase
        .from('bookings')
        .update({
          availability_id: selectedSlotId,
          booking_date: selectedSlot?.start_time || booking.booking_date,
          guest_count: guestCount,
          special_requests: specialRequests || null,
        })
        .eq('id', booking.id);

      if (error) throw error;

      toast({
        title: 'Booking updated',
        description: 'Your booking has been successfully updated.',
      });

      onSuccess();
      onOpenChange(false);
    } catch (error) {
      console.error('Error updating booking:', error);
      toast({
        title: 'Error',
        description: 'Failed to update booking. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setSubmitting(false);
    }
  };

  const formatSlotTime = (slot: AvailabilitySlot) => {
    const start = new Date(slot.start_time);
    const end = new Date(slot.end_time);
    const date = start.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' });
    const timeRange = `${start.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' })} - ${end.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' })}`;
    return `${date} • ${timeRange} (${slot.available_spots} spots left)`;
  };

  if (!booking) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>Modify Booking</DialogTitle>
        </DialogHeader>
        
        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="time-slot" className="flex items-center gap-2">
              <Calendar className="w-4 h-4" />
              Select New Time Slot
            </Label>
            <Select 
              value={selectedSlotId} 
              onValueChange={setSelectedSlotId}
              disabled={loadingSlots}
            >
              <SelectTrigger id="time-slot">
                <SelectValue placeholder={loadingSlots ? "Loading slots..." : "Choose a time slot"} />
              </SelectTrigger>
              <SelectContent>
                {availableSlots.map((slot) => (
                  <SelectItem key={slot.id} value={slot.id}>
                    {formatSlotTime(slot)}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {availableSlots.length === 0 && !loadingSlots && (
              <p className="text-xs text-muted-foreground">
                No available time slots found
              </p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="guest-count">Number of Guests</Label>
            <Input
              id="guest-count"
              type="number"
              min={1}
              max={booking.experience.max_guests}
              value={guestCount}
              onChange={(e) => setGuestCount(Math.max(1, Math.min(booking.experience.max_guests, parseInt(e.target.value) || 1)))}
            />
            <p className="text-xs text-muted-foreground">
              Maximum {booking.experience.max_guests} guests
            </p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="special-requests">Special Requests</Label>
            <Textarea
              id="special-requests"
              placeholder="Any special requirements or requests?"
              value={specialRequests}
              onChange={(e) => setSpecialRequests(e.target.value)}
              rows={4}
            />
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)} disabled={submitting}>
            Cancel
          </Button>
          <Button onClick={handleSubmit} disabled={submitting || loadingSlots}>
            {submitting ? 'Updating...' : 'Update Booking'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
