import { useState } from 'react';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Flag, Check } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';

interface ReportContentButtonProps {
  contentType: 'experience' | 'review' | 'user';
  contentId: string;
  contentTitle?: string;
}

const REPORT_REASONS = [
  { value: 'inappropriate', label: 'Inappropriate content' },
  { value: 'misleading', label: 'Misleading or false information' },
  { value: 'spam', label: 'Spam or scam' },
  { value: 'safety', label: 'Safety concern' },
  { value: 'other', label: 'Other' },
];

export const ReportContentButton = ({ contentType, contentId, contentTitle }: ReportContentButtonProps) => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [open, setOpen] = useState(false);
  const [reason, setReason] = useState('');
  const [details, setDetails] = useState('');
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const handleSubmitReport = async () => {
    if (!reason) {
      toast({
        title: 'Reason required',
        description: 'Please select a reason for your report.',
        variant: 'destructive',
      });
      return;
    }

    if (!user) {
      toast({
        title: 'Sign in required',
        description: 'Please sign in to report content.',
        variant: 'destructive',
      });
      return;
    }

    try {
      setLoading(true);

      // Log the report as an activity
      await supabase.from('activity_log').insert({
        user_id: user.id,
        activity_type: 'report',
        activity_description: `Reported ${contentType}: ${reason}`,
        related_id: contentId,
      });

      // Create notification for admins (they can query activity_log for reports)
      
      setSubmitted(true);
      toast({
        title: 'Report submitted',
        description: 'Thank you for helping keep our community safe.',
      });

      setTimeout(() => {
        setOpen(false);
        setSubmitted(false);
        setReason('');
        setDetails('');
      }, 2000);
    } catch (error) {
      console.error('Report error:', error);
      toast({
        title: 'Error',
        description: 'Failed to submit report. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Button
        variant="ghost"
        size="sm"
        onClick={() => setOpen(true)}
        className="text-muted-foreground hover:text-destructive"
      >
        <Flag className="w-4 h-4 mr-1" />
        Report
      </Button>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Report {contentType}</DialogTitle>
            <DialogDescription>
              {contentTitle 
                ? `Report "${contentTitle}" for violating our community guidelines.`
                : 'Help us understand what\'s wrong with this content.'}
            </DialogDescription>
          </DialogHeader>

          {submitted ? (
            <div className="flex flex-col items-center py-8">
              <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center mb-4">
                <Check className="w-6 h-6 text-primary" />
              </div>
              <p className="text-center font-medium">Report Submitted</p>
              <p className="text-center text-sm text-muted-foreground mt-1">
                Our team will review this content shortly.
              </p>
            </div>
          ) : (
            <>
              <div className="space-y-4 py-4">
                <div className="space-y-3">
                  <Label>Why are you reporting this?</Label>
                  <RadioGroup value={reason} onValueChange={setReason}>
                    {REPORT_REASONS.map((option) => (
                      <div key={option.value} className="flex items-center space-x-2">
                        <RadioGroupItem value={option.value} id={option.value} />
                        <Label htmlFor={option.value} className="font-normal cursor-pointer">
                          {option.label}
                        </Label>
                      </div>
                    ))}
                  </RadioGroup>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="report-details">Additional details (optional)</Label>
                  <Textarea
                    id="report-details"
                    placeholder="Provide any additional context..."
                    value={details}
                    onChange={(e) => setDetails(e.target.value)}
                    rows={3}
                  />
                </div>
              </div>

              <DialogFooter>
                <Button variant="outline" onClick={() => setOpen(false)}>
                  Cancel
                </Button>
                <Button
                  onClick={handleSubmitReport}
                  disabled={loading || !reason}
                  variant="destructive"
                >
                  {loading ? 'Submitting...' : 'Submit Report'}
                </Button>
              </DialogFooter>
            </>
          )}
        </DialogContent>
      </Dialog>
    </>
  );
};
