import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ActivityLogEntry } from '@/hooks/useDashboardData';
import { 
  Calendar, 
  Heart, 
  MessageCircle, 
  User, 
  CreditCard,
  Star,
  Clock
} from 'lucide-react';

interface ActivityHistoryProps {
  activities: ActivityLogEntry[];
  loading?: boolean;
}

export const ActivityHistory = ({ activities, loading }: ActivityHistoryProps) => {
  const getActivityIcon = (type: string) => {
    switch (type) {
      case 'booking_created':
        return <Calendar className="w-4 h-4 text-green-600" />;
      case 'booking_cancelled':
        return <Calendar className="w-4 h-4 text-red-600" />;
      case 'experience_saved':
        return <Heart className="w-4 h-4 text-pink-600" />;
      case 'message_sent':
        return <MessageCircle className="w-4 h-4 text-blue-600" />;
      case 'profile_update':
        return <User className="w-4 h-4 text-purple-600" />;
      case 'payment_completed':
        return <CreditCard className="w-4 h-4 text-green-600" />;
      case 'review_posted':
        return <Star className="w-4 h-4 text-yellow-600" />;
      default:
        return <Clock className="w-4 h-4 text-gray-600" />;
    }
  };

  const getActivityColor = (type: string) => {
    switch (type) {
      case 'booking_created':
      case 'payment_completed':
        return 'bg-green-100 text-green-800';
      case 'booking_cancelled':
        return 'bg-red-100 text-red-800';
      case 'experience_saved':
        return 'bg-pink-100 text-pink-800';
      case 'message_sent':
        return 'bg-blue-100 text-blue-800';
      case 'profile_update':
        return 'bg-purple-100 text-purple-800';
      case 'review_posted':
        return 'bg-yellow-100 text-yellow-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const formatActivityType = (type: string) => {
    return type.split('_').map(word => 
      word.charAt(0).toUpperCase() + word.slice(1)
    ).join(' ');
  };

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Recent Activity</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="flex items-center space-x-3 animate-pulse">
                <div className="w-10 h-10 bg-muted rounded-full"></div>
                <div className="flex-1 space-y-2">
                  <div className="h-4 bg-muted rounded w-3/4"></div>
                  <div className="h-3 bg-muted rounded w-1/2"></div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Recent Activity</CardTitle>
      </CardHeader>
      <CardContent>
        {activities.length > 0 ? (
          <div className="space-y-4">
            {activities.map((activity) => (
              <div key={activity.id} className="flex items-start space-x-3 pb-4 border-b last:border-b-0">
                <div className="w-10 h-10 rounded-full bg-muted flex items-center justify-center flex-shrink-0">
                  {getActivityIcon(activity.activity_type)}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between mb-1">
                    <Badge 
                      variant="secondary" 
                      className={getActivityColor(activity.activity_type)}
                    >
                      {formatActivityType(activity.activity_type)}
                    </Badge>
                    <span className="text-xs text-muted-foreground">
                      {new Date(activity.created_at).toLocaleDateString()}
                    </span>
                  </div>
                  <p className="text-sm text-foreground">
                    {activity.activity_description}
                  </p>
                  <span className="text-xs text-muted-foreground">
                    {new Date(activity.created_at).toLocaleTimeString()}
                  </span>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-8">
            <Clock className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-medium mb-2">No recent activity</h3>
            <p className="text-muted-foreground">
              Your activity history will appear here as you use the platform
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
};