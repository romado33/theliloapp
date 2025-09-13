import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { 
  DollarSign, 
  TrendingUp, 
  Calendar, 
  Users, 
  Star,
  BarChart3,
  PieChart
} from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { format, subMonths, startOfMonth, endOfMonth, parseISO } from 'date-fns';

interface RevenueData {
  totalRevenue: number;
  monthlyRevenue: number;
  totalBookings: number;
  monthlyBookings: number;
  averageBookingValue: number;
  topExperience: {
    title: string;
    revenue: number;
    bookings: number;
  } | null;
  revenueByMonth: Array<{
    month: string;
    revenue: number;
    bookings: number;
  }>;
}

interface BookingStats {
  experience_id: string;
  experience_title: string;
  total_revenue: number;
  booking_count: number;
  average_rating: number;
  last_booking: string;
}

export const RevenueAnalytics = () => {
  const { user } = useAuth();
  const [revenueData, setRevenueData] = useState<RevenueData>({
    totalRevenue: 0,
    monthlyRevenue: 0,
    totalBookings: 0,
    monthlyBookings: 0,
    averageBookingValue: 0,
    topExperience: null,
    revenueByMonth: []
  });
  const [experienceStats, setExperienceStats] = useState<BookingStats[]>([]);
  const [selectedPeriod, setSelectedPeriod] = useState<string>('3months');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      fetchRevenueData();
    }
  }, [user, selectedPeriod]);

  const fetchRevenueData = async () => {
    try {
      setLoading(true);
      const now = new Date();
      const currentMonthStart = startOfMonth(now);
      const currentMonthEnd = endOfMonth(now);
      
      // Fetch all confirmed and completed bookings for host's experiences
      const { data: bookings, error: bookingsError } = await supabase
        .from('bookings')
        .select(`
          *,
          experience:experiences!inner(
            title,
            host_id
          )
        `)
        .eq('experience.host_id', user?.id)
        .in('status', ['confirmed', 'completed']);

      if (bookingsError) throw bookingsError;

      // Calculate total metrics
      const totalRevenue = bookings?.reduce((sum, booking) => sum + Number(booking.total_price), 0) || 0;
      const totalBookings = bookings?.length || 0;

      // Calculate monthly metrics
      const monthlyBookings = bookings?.filter(booking => {
        const bookingDate = parseISO(booking.created_at);
        return bookingDate >= currentMonthStart && bookingDate <= currentMonthEnd;
      }) || [];

      const monthlyRevenue = monthlyBookings.reduce((sum, booking) => sum + Number(booking.total_price), 0);

      // Calculate average booking value
      const averageBookingValue = totalBookings > 0 ? totalRevenue / totalBookings : 0;

      // Group by experience for top performer
      const experienceRevenue = bookings?.reduce((acc, booking) => {
        const expId = booking.experience_id;
        if (!acc[expId]) {
          acc[expId] = {
            title: booking.experience.title,
            revenue: 0,
            bookings: 0
          };
        }
        acc[expId].revenue += Number(booking.total_price);
        acc[expId].bookings += 1;
        return acc;
      }, {} as Record<string, { title: string; revenue: number; bookings: number }>) || {};

      const topExperience = Object.values(experienceRevenue).sort((a, b) => b.revenue - a.revenue)[0] || null;

      // Calculate revenue by month for the selected period
      const monthsBack = selectedPeriod === '3months' ? 3 : selectedPeriod === '6months' ? 6 : 12;
      const revenueByMonth = [];
      
      for (let i = monthsBack - 1; i >= 0; i--) {
        const monthStart = startOfMonth(subMonths(now, i));
        const monthEnd = endOfMonth(subMonths(now, i));
        
        const monthBookings = bookings?.filter(booking => {
          const bookingDate = parseISO(booking.created_at);
          return bookingDate >= monthStart && bookingDate <= monthEnd;
        }) || [];

        revenueByMonth.push({
          month: format(monthStart, 'MMM yyyy'),
          revenue: monthBookings.reduce((sum, booking) => sum + Number(booking.total_price), 0),
          bookings: monthBookings.length
        });
      }

      setRevenueData({
        totalRevenue,
        monthlyRevenue,
        totalBookings,
        monthlyBookings: monthlyBookings.length,
        averageBookingValue,
        topExperience,
        revenueByMonth
      });

      // Fetch experience statistics
      await fetchExperienceStats();

    } catch (error) {
      console.error('Error fetching revenue data:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchExperienceStats = async () => {
    try {
      const { data: stats, error } = await supabase
        .from('bookings')
        .select(`
          experience_id,
          total_price,
          created_at,
          experience:experiences!inner(
            title,
            host_id
          )
        `)
        .eq('experience.host_id', user?.id)
        .in('status', ['confirmed', 'completed']);

      if (error) throw error;

      // Group by experience and calculate stats
      const experienceGroups = stats?.reduce((acc, booking) => {
        const expId = booking.experience_id;
        if (!acc[expId]) {
          acc[expId] = {
            experience_id: expId,
            experience_title: booking.experience.title,
            total_revenue: 0,
            booking_count: 0,
            average_rating: 4.5, // Placeholder until reviews are implemented
            last_booking: booking.created_at
          };
        }
        acc[expId].total_revenue += Number(booking.total_price);
        acc[expId].booking_count += 1;
        if (booking.created_at > acc[expId].last_booking) {
          acc[expId].last_booking = booking.created_at;
        }
        return acc;
      }, {} as Record<string, BookingStats>) || {};

      setExperienceStats(Object.values(experienceGroups).sort((a, b) => b.total_revenue - a.total_revenue));

    } catch (error) {
      console.error('Error fetching experience stats:', error);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Revenue Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">${revenueData.totalRevenue.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">
              All-time earnings
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Monthly Revenue</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">${revenueData.monthlyRevenue.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">
              {format(new Date(), 'MMMM yyyy')}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Bookings</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{revenueData.totalBookings}</div>
            <p className="text-xs text-muted-foreground">
              {revenueData.monthlyBookings} this month
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Avg. Booking Value</CardTitle>
            <BarChart3 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">${revenueData.averageBookingValue.toFixed(0)}</div>
            <p className="text-xs text-muted-foreground">
              Per booking
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Analytics Tabs */}
      <Tabs defaultValue="revenue" className="space-y-4">
        <TabsList>
          <TabsTrigger value="revenue">Revenue Trends</TabsTrigger>
          <TabsTrigger value="experiences">Experience Performance</TabsTrigger>
          <TabsTrigger value="insights">Insights</TabsTrigger>
        </TabsList>

        <TabsContent value="revenue" className="space-y-4">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>Revenue by Month</CardTitle>
                <Select value={selectedPeriod} onValueChange={setSelectedPeriod}>
                  <SelectTrigger className="w-32">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="3months">3 Months</SelectItem>
                    <SelectItem value="6months">6 Months</SelectItem>
                    <SelectItem value="12months">12 Months</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardHeader>
            <CardContent>
              {revenueData.revenueByMonth.length > 0 ? (
                <div className="space-y-4">
                  {revenueData.revenueByMonth.map((month, index) => (
                    <div key={index} className="flex items-center justify-between p-3 border rounded-lg">
                      <div className="flex items-center space-x-3">
                        <Calendar className="w-4 h-4 text-muted-foreground" />
                        <span className="font-medium">{month.month}</span>
                      </div>
                      <div className="text-right">
                        <div className="font-bold">${month.revenue.toLocaleString()}</div>
                        <div className="text-sm text-muted-foreground">{month.bookings} bookings</div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <BarChart3 className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                  <p className="text-muted-foreground">No revenue data available</p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="experiences" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Experience Performance</CardTitle>
            </CardHeader>
            <CardContent>
              {experienceStats.length > 0 ? (
                <div className="space-y-4">
                  {experienceStats.map((exp) => (
                    <div key={exp.experience_id} className="p-4 border rounded-lg">
                      <div className="flex items-start justify-between mb-2">
                        <h4 className="font-semibold">{exp.experience_title}</h4>
                        <Badge variant="outline">{exp.booking_count} bookings</Badge>
                      </div>
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                        <div>
                          <span className="text-muted-foreground">Revenue</span>
                          <div className="font-medium">${exp.total_revenue.toLocaleString()}</div>
                        </div>
                        <div>
                          <span className="text-muted-foreground">Avg. per booking</span>
                          <div className="font-medium">${(exp.total_revenue / exp.booking_count).toFixed(0)}</div>
                        </div>
                        <div>
                          <span className="text-muted-foreground">Rating</span>
                          <div className="flex items-center space-x-1">
                            <Star className="w-4 h-4 fill-current text-yellow-500" />
                            <span className="font-medium">{exp.average_rating}</span>
                          </div>
                        </div>
                        <div>
                          <span className="text-muted-foreground">Last booking</span>
                          <div className="font-medium">{format(parseISO(exp.last_booking), 'MMM dd')}</div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <PieChart className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                  <p className="text-muted-foreground">No experience data available</p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="insights" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Top Performing Experience</CardTitle>
              </CardHeader>
              <CardContent>
                {revenueData.topExperience ? (
                  <div className="space-y-2">
                    <h4 className="font-semibold">{revenueData.topExperience.title}</h4>
                    <div className="text-sm text-muted-foreground space-y-1">
                      <div>Total Revenue: <span className="font-medium text-foreground">${revenueData.topExperience.revenue.toLocaleString()}</span></div>
                      <div>Total Bookings: <span className="font-medium text-foreground">{revenueData.topExperience.bookings}</span></div>
                      <div>Avg. per Booking: <span className="font-medium text-foreground">${(revenueData.topExperience.revenue / revenueData.topExperience.bookings).toFixed(0)}</span></div>
                    </div>
                  </div>
                ) : (
                  <p className="text-muted-foreground">No bookings yet</p>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Quick Stats</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3 text-sm">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Conversion Rate</span>
                    <span className="font-medium">Coming Soon</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Repeat Customers</span>
                    <span className="font-medium">Coming Soon</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Avg. Response Time</span>
                    <span className="font-medium">Coming Soon</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Cancellation Rate</span>
                    <span className="font-medium">Coming Soon</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};