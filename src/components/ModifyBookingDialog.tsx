import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface ModifyBookingDialogProps {
  booking: {
    id: string;
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
  const [submitting, setSubmitting] = useState(false);
  const { toast } = useToast();

  const handleSubmit = async () => {
    if (!booking) return;

    try {
      setSubmitting(true);

      const { error } = await supabase
        .from('bookings')
        .update({
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

  if (!booking) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Modify Booking</DialogTitle>
        </DialogHeader>
        
        <div className="space-y-4 py-4">
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
          <Button onClick={handleSubmit} disabled={submitting}>
            {submitting ? 'Updating...' : 'Update Booking'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
