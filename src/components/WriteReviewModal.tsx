import { useState } from 'react';
import { Star, MessageSquare } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { useReviews } from '@/hooks/useReviews';

interface WriteReviewModalProps {
  isOpen: boolean;
  onClose: () => void;
  bookingId: string;
  experienceId: string;
  experienceTitle: string;
  onReviewSubmitted?: () => void;
}

export const WriteReviewModal = ({
  isOpen,
  onClose,
  bookingId,
  experienceId,
  experienceTitle,
  onReviewSubmitted
}: WriteReviewModalProps) => {
  const { submitReview } = useReviews(experienceId);
  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const handleStarClick = (starRating: number) => {
    setRating(starRating);
  };

  const handleSubmit = async () => {
    if (rating === 0) return;

    setSubmitting(true);
    try {
      const success = await submitReview({
        rating,
        comment,
        experienceId,
        bookingId
      });

      if (success) {
        setRating(0);
        setComment('');
        onClose();
        onReviewSubmitted?.();
      }
    } catch (error) {
      console.error('Error submitting review:', error);
    } finally {
      setSubmitting(false);
    }
  };

  const handleClose = () => {
    setRating(0);
    setComment('');
    onClose();
  };

  const renderStars = (currentRating: number, interactive = false) => {
    return Array.from({ length: 5 }, (_, i) => (
      <Star
        key={i}
        className={`w-6 h-6 ${
          i < currentRating 
            ? 'text-yellow-400 fill-current' 
            : 'text-gray-300'
        } ${interactive ? 'cursor-pointer hover:text-yellow-400 transition-colors' : ''}`}
        onClick={interactive ? () => handleStarClick(i + 1) : undefined}
      />
    ));
  };

  const getRatingText = (rating: number) => {
    switch (rating) {
      case 1: return 'Poor';
      case 2: return 'Fair';
      case 3: return 'Good';
      case 4: return 'Very Good';
      case 5: return 'Excellent';
      default: return '';
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <MessageSquare className="w-5 h-5" />
            Write a Review
          </DialogTitle>
          <DialogDescription>
            Share your experience with <strong>{experienceTitle}</strong>
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 py-4">
          {/* Rating Section */}
          <div>
            <label className="block text-sm font-medium mb-3">
              Overall Rating *
            </label>
            <div className="flex items-center gap-2 mb-2">
              {renderStars(rating, true)}
            </div>
            {rating > 0 && (
              <Badge variant="secondary" className="text-xs">
                {getRatingText(rating)}
              </Badge>
            )}
          </div>

          {/* Comment Section */}
          <div>
            <label className="block text-sm font-medium mb-2">
              Your Review
            </label>
            <Textarea
              placeholder="Tell others about your experience..."
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              rows={4}
              className="resize-none"
              maxLength={500}
            />
            <p className="text-xs text-muted-foreground mt-1">
              {comment.length}/500 characters
            </p>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-3 pt-2">
            <Button
              variant="outline"
              onClick={handleClose}
              className="flex-1"
              disabled={submitting}
            >
              Cancel
            </Button>
            <Button
              onClick={handleSubmit}
              disabled={rating === 0 || submitting}
              className="flex-1"
            >
              {submitting ? 'Submitting...' : 'Submit Review'}
            </Button>
          </div>

          {rating === 0 && (
            <p className="text-sm text-muted-foreground text-center">
              Please select a rating to submit your review
            </p>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};