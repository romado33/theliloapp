import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Textarea } from '@/components/ui/textarea';
import { Star, MessageSquare, Calendar, User, ThumbsUp } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { reviewSchema } from '@/lib/validation';
import { SecureDisplayText } from '@/components/SecureDisplayText';

interface Review {
  id: string;
  rating: number;
  comment: string;
  created_at: string;
  guest_name: string;
  guest_avatar?: string;
  booking_id: string;
}

interface ReviewsSectionProps {
  experienceId?: string;
  showWriteReview?: boolean;
  bookingId?: string;
}

export const ReviewsSection = ({ 
  experienceId, 
  showWriteReview = false,
  bookingId 
}: ReviewsSectionProps) => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [newReview, setNewReview] = useState({
    rating: 0,
    comment: ''
  });

  useEffect(() => {
    if (experienceId) {
      fetchReviews();
    }
  }, [experienceId]);

  const fetchReviews = async () => {
    if (!experienceId) return;
    
    try {
      setLoading(true);
      
      // In a real app, you'd fetch from the reviews table
      // For now, using mock data
      const mockReviews: Review[] = [
        {
          id: '1',
          rating: 5,
          comment: "Absolutely amazing experience! The kids loved every moment, especially feeding the animals. Sarah was such a wonderful host and really made sure everyone felt included. Can't wait to come back!",
          created_at: '2024-01-15T10:00:00Z',
          guest_name: 'Emily Chen',
          guest_avatar: '',
          booking_id: 'booking-1'
        },
        {
          id: '2',
          rating: 4,
          comment: "Great family activity! The farm tour was educational and fun. Only minor issue was that it ran a bit longer than expected, but the kids didn't mind at all. Highly recommend for families with young children.",
          created_at: '2024-01-10T14:30:00Z',
          guest_name: 'Michael Rodriguez',
          guest_avatar: '',
          booking_id: 'booking-2'
        },
        {
          id: '3',
          rating: 5,
          comment: "Perfect way to spend a weekend afternoon! The pottery class was relaxing and the instructor was very patient with beginners. Loved taking home our creations.",
          created_at: '2024-01-08T16:15:00Z',
          guest_name: 'Jessica Smith',
          guest_avatar: '',
          booking_id: 'booking-3'
        }
      ];

      setReviews(mockReviews);
    } catch (error) {
      console.error('Error fetching reviews:', error);
    } finally {
      setLoading(false);
    }
  };

  const calculateAverageRating = () => {
    if (reviews.length === 0) return 0;
    const sum = reviews.reduce((acc, review) => acc + review.rating, 0);
    return (sum / reviews.length).toFixed(1);
  };

  const getRatingDistribution = () => {
    const distribution = { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 };
    reviews.forEach(review => {
      const rating = review.rating as 1 | 2 | 3 | 4 | 5;
      distribution[rating]++;
    });
    return distribution;
  };

  const handleStarClick = (rating: number) => {
    setNewReview(prev => ({ ...prev, rating }));
  };

  const submitReview = async () => {
    if (!user || !bookingId || newReview.rating === 0) {
      toast({
        title: 'Invalid review',
        description: 'Please provide a rating and ensure you have permission to review',
        variant: 'destructive'
      });
      return;
    }

    setSubmitting(true);
    try {
      // In a real app, you'd submit to the reviews table
      const reviewData = {
        booking_id: bookingId,
        guest_id: user.id,
        experience_id: experienceId,
        rating: newReview.rating,
        comment: reviewSchema.parse({ rating: newReview.rating, comment: newReview.comment }).comment
      };

      // Mock successful submission
      toast({
        title: 'Review submitted!',
        description: 'Thank you for your feedback'
      });

      setNewReview({ rating: 0, comment: '' });
      await fetchReviews(); // Refresh reviews

    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to submit review. Please try again.',
        variant: 'destructive'
      });
    } finally {
      setSubmitting(false);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const renderStars = (rating: number, interactive = false, size = 'w-4 h-4') => {
    return Array.from({ length: 5 }, (_, i) => (
      <Star
        key={i}
        className={`${size} ${
          i < rating 
            ? 'text-yellow-400 fill-current' 
            : 'text-gray-300'
        } ${interactive ? 'cursor-pointer hover:text-yellow-400' : ''}`}
        onClick={interactive ? () => handleStarClick(i + 1) : undefined}
      />
    ));
  };

  if (loading) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        </CardContent>
      </Card>
    );
  }

  const averageRating = calculateAverageRating();
  const distribution = getRatingDistribution();

  return (
    <div className="space-y-6">
      {/* Reviews Overview */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Star className="w-5 h-5 text-yellow-400" />
            Reviews & Ratings
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Overall Rating */}
            <div className="text-center">
              <div className="text-4xl font-bold text-primary mb-2">
                {averageRating}
              </div>
              <div className="flex justify-center mb-2">
                {renderStars(Math.round(parseFloat(averageRating.toString())))}
              </div>
              <p className="text-muted-foreground">
                Based on {reviews.length} reviews
              </p>
            </div>

            {/* Rating Distribution */}
            <div className="space-y-2">
              {[5, 4, 3, 2, 1].map(rating => (
                <div key={rating} className="flex items-center gap-2">
                  <span className="text-sm w-3">{rating}</span>
                  <Star className="w-3 h-3 text-yellow-400 fill-current" />
                  <div className="flex-1 bg-muted rounded-full h-2">
                    <div 
                      className="bg-yellow-400 h-2 rounded-full transition-all"
                      style={{ 
                        width: `${reviews.length > 0 ? (distribution[rating as 1 | 2 | 3 | 4 | 5] / reviews.length) * 100 : 0}%` 
                      }}
                    />
                  </div>
                  <span className="text-sm text-muted-foreground w-8">
                    {distribution[rating as 1 | 2 | 3 | 4 | 5]}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Write Review Form */}
      {showWriteReview && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <MessageSquare className="w-5 h-5" />
              Write a Review
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-2">
                Your Rating *
              </label>
              <div className="flex gap-1">
                {renderStars(newReview.rating, true, 'w-6 h-6')}
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">
                Your Review
              </label>
              <Textarea
                placeholder="Share your experience..."
                value={newReview.comment}
                onChange={(e) => setNewReview(prev => ({ ...prev, comment: e.target.value }))}
                rows={4}
              />
            </div>

            <Button 
              onClick={submitReview}
              disabled={submitting || newReview.rating === 0}
              className="w-full"
            >
              {submitting ? 'Submitting...' : 'Submit Review'}
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Reviews List */}
      <div className="space-y-4">
        {reviews.length === 0 ? (
          <Card>
            <CardContent className="flex flex-col items-center justify-center py-12 text-center">
              <MessageSquare className="w-16 h-16 text-muted-foreground mb-4" />
              <h3 className="font-medium mb-2">No reviews yet</h3>
              <p className="text-muted-foreground">
                Be the first to share your experience!
              </p>
            </CardContent>
          </Card>
        ) : (
          reviews.map((review) => (
            <Card key={review.id}>
              <CardContent className="pt-6">
                <div className="flex items-start gap-4">
                  <Avatar className="w-10 h-10">
                    <AvatarImage src={review.guest_avatar} />
                    <AvatarFallback>
                      <User className="w-5 h-5" />
                    </AvatarFallback>
                  </Avatar>
                  
                  <div className="flex-1 space-y-2">
                    <div className="flex items-center justify-between">
                      <div>
                        <h4 className="font-medium">{review.guest_name}</h4>
                        <div className="flex items-center gap-2">
                          <div className="flex">
                            {renderStars(review.rating)}
                          </div>
                          <span className="text-sm text-muted-foreground">
                            {formatDate(review.created_at)}
                          </span>
                        </div>
                      </div>
                      
                      <Badge variant="outline" className="text-xs">
                        Verified
                      </Badge>
                    </div>
                    
                    <SecureDisplayText 
                      text={review.comment}
                      className="text-muted-foreground leading-relaxed"
                      maxLength={500}
                      allowLineBreaks={true}
                    />
                    
                    <div className="flex items-center gap-4 pt-2">
                      <Button variant="ghost" size="sm" className="text-muted-foreground">
                        <ThumbsUp className="w-3 h-3 mr-1" />
                        Helpful
                      </Button>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  );
};