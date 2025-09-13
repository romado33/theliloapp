import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Textarea } from '@/components/ui/textarea';
import { Star, MessageSquare, User, ThumbsUp } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { useReviews } from '@/hooks/useReviews';
import { reviewSchema } from '@/lib/validation';
import { SecureDisplayText } from '@/components/SecureDisplayText';

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
  const { reviews, stats, loading, error, submitReview } = useReviews(experienceId);
  const [submitting, setSubmitting] = useState(false);
  const [newReview, setNewReview] = useState({
    rating: 0,
    comment: ''
  });

  // ... keep existing code (removed fetchReviews, calculateAverageRating, getRatingDistribution as they're now in the hook)

  const handleStarClick = (rating: number) => {
    setNewReview(prev => ({ ...prev, rating }));
  };

  const handleSubmitReview = async () => {
    if (!experienceId || !bookingId || newReview.rating === 0) {
      return;
    }

    setSubmitting(true);
    try {
      const validatedData = reviewSchema.parse({ 
        rating: newReview.rating, 
        comment: newReview.comment 
      });

      const success = await submitReview({
        rating: newReview.rating,
        comment: validatedData.comment || '',
        experienceId,
        bookingId
      });

      if (success) {
        setNewReview({ rating: 0, comment: '' });
      }
    } catch (error) {
      console.error('Review validation error:', error);
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

  if (error) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center py-8 text-center">
          <div>
            <p className="text-muted-foreground mb-2">Failed to load reviews</p>
            <p className="text-sm text-destructive">{error}</p>
          </div>
        </CardContent>
      </Card>
    );
  }

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
                {stats.averageRating}
              </div>
              <div className="flex justify-center mb-2">
                {renderStars(Math.round(stats.averageRating))}
              </div>
              <p className="text-muted-foreground">
                Based on {stats.totalReviews} reviews
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
                        width: `${stats.totalReviews > 0 ? (stats.distribution[rating as 1 | 2 | 3 | 4 | 5] / stats.totalReviews) * 100 : 0}%` 
                      }}
                    />
                  </div>
                  <span className="text-sm text-muted-foreground w-8">
                    {stats.distribution[rating as 1 | 2 | 3 | 4 | 5]}
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
              onClick={handleSubmitReview}
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
          reviews.map((review) => {
            const guestName = review.profiles 
              ? `${review.profiles.first_name || ''} ${review.profiles.last_name || ''}`.trim()
              : 'Anonymous Guest';

            return (
              <Card key={review.id}>
                <CardContent className="pt-6">
                  <div className="flex items-start gap-4">
                    <Avatar className="w-10 h-10">
                      <AvatarImage src={review.profiles?.avatar_url || ''} />
                      <AvatarFallback>
                        <User className="w-5 h-5" />
                      </AvatarFallback>
                    </Avatar>
                    
                    <div className="flex-1 space-y-2">
                      <div className="flex items-center justify-between">
                        <div>
                          <h4 className="font-medium">{guestName}</h4>
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
                      
                      {review.comment && (
                        <SecureDisplayText 
                          text={review.comment}
                          className="text-muted-foreground leading-relaxed"
                          maxLength={500}
                          allowLineBreaks={true}
                        />
                      )}
                      
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
            );
          })
        )}
      </div>
    </div>
  );
};