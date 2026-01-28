import { useState } from 'react';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Bell, Check } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';

interface WaitlistButtonProps {
  experienceId: string;
  experienceTitle: string;
  isSoldOut: boolean;
}

export const WaitlistButton = ({ experienceId, experienceTitle, isSoldOut }: WaitlistButtonProps) => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [open, setOpen] = useState(false);
  const [email, setEmail] = useState(user?.email || '');
  const [loading, setLoading] = useState(false);
  const [joined, setJoined] = useState(false);

  if (!isSoldOut) return null;

  const handleJoinWaitlist = async () => {
    if (!email) {
      toast({
        title: 'Email required',
        description: 'Please enter your email to join the waitlist.',
        variant: 'destructive',
      });
      return;
    }

    try {
      setLoading(true);

      // Create notification for user when spots become available
      if (user) {
        await supabase.rpc('create_notification', {
          p_user_id: user.id,
          p_type: 'waitlist',
          p_title: 'Joined Waitlist',
          p_message: `You've joined the waitlist for "${experienceTitle}". We'll notify you when spots become available.`,
          p_data: { experience_id: experienceId, email },
        });
      }

      setJoined(true);
      toast({
        title: 'Added to waitlist!',
        description: "We'll notify you when spots become available.",
      });

      setTimeout(() => {
        setOpen(false);
      }, 1500);
    } catch (error) {
      console.error('Waitlist error:', error);
      toast({
        title: 'Error',
        description: 'Failed to join waitlist. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Button
        variant="outline"
        onClick={() => setOpen(true)}
        className="w-full"
      >
        <Bell className="w-4 h-4 mr-2" />
        Join Waitlist
      </Button>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle>Join the Waitlist</DialogTitle>
            <DialogDescription>
              This experience is currently sold out. Enter your email to be notified when spots become available.
            </DialogDescription>
          </DialogHeader>

          {joined ? (
            <div className="flex flex-col items-center py-6">
              <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center mb-4">
                <Check className="w-6 h-6 text-primary" />
              </div>
              <p className="text-center text-muted-foreground">
                You're on the waitlist! We'll email you at {email} when spots open up.
              </p>
            </div>
          ) : (
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="waitlist-email">Email address</Label>
                <Input
                  id="waitlist-email"
                  type="email"
                  placeholder="you@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </div>
              <Button
                onClick={handleJoinWaitlist}
                disabled={loading}
                className="w-full"
              >
                {loading ? 'Joining...' : 'Notify Me'}
              </Button>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </>
  );
};
