import { useState, useEffect } from "react";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { HostExperienceForm } from "@/components/HostExperienceForm";
import { BookingManagement } from "@/components/host/BookingManagement";
import { AvailabilityCalendar } from "@/components/host/AvailabilityCalendar";
import { RevenueAnalytics } from "@/components/host/RevenueAnalytics";
import { EditExperienceModal } from "@/components/host/EditExperienceModal";
import { SubscriptionStatus } from "@/components/payment/SubscriptionStatus";
import { 
  Plus, 
  Eye, 
  Calendar, 
  DollarSign, 
  Users, 
  MessageSquare, 
  Star, 
  TrendingUp,
  Edit,
  Trash2,
  BarChart3,
  Settings,
  CreditCard
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { getImageFromUrl } from "@/lib/imageMap";
import { Link } from "react-router-dom";

interface Experience {
  id: string;
  title: string;
  description: string;
  price: number;
  duration_hours: number;
  max_guests: number;
  location: string;
  is_active: boolean;
  created_at: string;
  image_urls?: string[];
}

interface DashboardStats {
  totalExperiences: number;
  activeExperiences: number;
  totalBookings: number;
  monthlyEarnings: number;
  averageRating: number;
}

const HostDashboard = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  
  const [experiences, setExperiences] = useState<Experience[]>([]);
  const [stats, setStats] = useState<DashboardStats>({
    totalExperiences: 0,
    activeExperiences: 0,
    totalBookings: 0,
    monthlyEarnings: 0,
    averageRating: 0
  });
  const [loading, setLoading] = useState(true);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [activeTab, setActiveTab] = useState("overview");
  const [editingExperience, setEditingExperience] = useState<Experience | null>(null);

  useEffect(() => {
    if (user) {
      fetchHostData();
    }
  }, [user]);

  const fetchHostData = async () => {
    try {
      setLoading(true);
      
      // Fetch host's experiences
      const { data: experiencesData, error: experiencesError } = await supabase
        .from('experiences')
        .select('*')
        .eq('host_id', user?.id)
        .order('created_at', { ascending: false });

      if (experiencesError) throw experiencesError;

      setExperiences(experiencesData || []);

      // Fetch all bookings for total count
      const { data: allBookingsData, error: allBookingsError } = await supabase
        .from('bookings')
        .select(`
          id,
          experience:experiences!inner(host_id)
        `)
        .eq('experience.host_id', user?.id);

      if (allBookingsError) {
        console.warn('Error fetching all bookings:', allBookingsError);
      }

      // Fetch confirmed/completed bookings for revenue
      const { data: bookingsData, error: bookingsError } = await supabase
        .from('bookings')
        .select(`
          total_price,
          status,
          experience:experiences!inner(host_id)
        `)
        .eq('experience.host_id', user?.id)
        .in('status', ['confirmed', 'completed']);

      if (bookingsError) {
        console.warn('Error fetching bookings:', bookingsError);
      }

      // Calculate real stats
      const totalExperiences = experiencesData?.length || 0;
      const activeExperiences = experiencesData?.filter(exp => exp.is_active).length || 0;
      const totalBookings = allBookingsData?.length || 0;
      const monthlyEarnings = bookingsData?.reduce((sum, booking) => sum + Number(booking.total_price), 0) || 0;
      
      setStats({
        totalExperiences,
        activeExperiences,
        totalBookings,
        monthlyEarnings,
        averageRating: 4.5 // Placeholder until reviews are implemented
      });

    } catch (error) {
      console.error('Error fetching host data:', error);
      toast({
        title: "Error",
        description: "Failed to load dashboard data",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const toggleExperienceStatus = async (experienceId: string, currentStatus: boolean) => {
    try {
      const { error } = await supabase
        .from('experiences')
        .update({ is_active: !currentStatus })
        .eq('id', experienceId);

      if (error) throw error;

      await fetchHostData();
      
      toast({
        title: "Success",
        description: `Experience ${!currentStatus ? 'activated' : 'deactivated'} successfully`
      });
    } catch (error) {
      console.error('Error updating experience status:', error);
      toast({
        title: "Error",
        description: "Failed to update experience status",
        variant: "destructive"
      });
    }
  };

  const deleteExperience = async (experienceId: string) => {
    if (!confirm('Are you sure you want to delete this experience?')) return;

    try {
      const { error } = await supabase
        .from('experiences')
        .delete()
        .eq('id', experienceId);

      if (error) throw error;

      await fetchHostData();
      
      toast({
        title: "Success",
        description: "Experience deleted successfully"
      });
    } catch (error) {
      console.error('Error deleting experience:', error);
      toast({
        title: "Error",
        description: "Failed to delete experience",
        variant: "destructive"
      });
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold">Host Dashboard</h1>
            <p className="text-muted-foreground mt-2">
              Manage your experiences and track your success
            </p>
          </div>
          <Button 
            onClick={() => setShowCreateForm(true)}
            className="flex items-center gap-2"
          >
            <Plus className="w-4 h-4" />
            Create Experience
          </Button>
        </div>

        {/* Stats Overview */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6 mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Experiences</CardTitle>
              <Eye className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.totalExperiences}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Active Experiences</CardTitle>
              <Calendar className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.activeExperiences}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Bookings</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.totalBookings}</div>
              <p className="text-xs text-muted-foreground">Coming soon</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Monthly Earnings</CardTitle>
              <DollarSign className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">${stats.monthlyEarnings}</div>
              <p className="text-xs text-muted-foreground">Coming soon</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Average Rating</CardTitle>
              <Star className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.averageRating}</div>
              <p className="text-xs text-muted-foreground">5-star rating</p>
            </CardContent>
          </Card>
        </div>

        {/* Main Content Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-7">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="experiences">Experiences</TabsTrigger>
            <TabsTrigger value="bookings">Bookings</TabsTrigger>
            <TabsTrigger value="availability">Availability</TabsTrigger>
            <TabsTrigger value="analytics">Analytics</TabsTrigger>
            <TabsTrigger value="subscription">Subscription</TabsTrigger>
            <TabsTrigger value="messages">Messages</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="mt-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <TrendingUp className="w-5 h-5" />
                    Recent Activity
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="text-sm text-muted-foreground">
                      {experiences.length === 0 
                        ? "No experiences created yet. Create your first experience to start hosting!"
                        : "Your experiences are ready for bookings!"
                      }
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <MessageSquare className="w-5 h-5" />
                    Quick Actions
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <Button 
                      variant="outline" 
                      className="w-full justify-start"
                      onClick={() => setShowCreateForm(true)}
                    >
                      <Plus className="w-4 h-4 mr-2" />
                      Create New Experience
                    </Button>
                    <Button 
                      variant="outline" 
                      className="w-full justify-start"
                      onClick={() => setActiveTab("experiences")}
                    >
                      <Edit className="w-4 h-4 mr-2" />
                      Manage Experiences
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="experiences" className="mt-6">
            <div className="space-y-6">
              {experiences.length === 0 ? (
                <Card>
                  <CardContent className="flex flex-col items-center justify-center py-12">
                    <Calendar className="w-16 h-16 text-muted-foreground mb-4" />
                    <h3 className="text-lg font-semibold mb-2">No experiences yet</h3>
                    <p className="text-muted-foreground text-center mb-6">
                      Create your first experience to start hosting and earning
                    </p>
                    <Button onClick={() => setShowCreateForm(true)}>
                      <Plus className="w-4 h-4 mr-2" />
                      Create Your First Experience
                    </Button>
                  </CardContent>
                </Card>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {experiences.map((experience) => (
                    <Card key={experience.id} className="overflow-hidden">
                      <div className="aspect-video bg-muted relative">
                        {experience.image_urls?.[0] ? (
                          <img 
                            src={getImageFromUrl(experience.image_urls[0])} 
                            alt={experience.title}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-primary/20 to-secondary/20">
                            <Calendar className="w-12 h-12 text-muted-foreground" />
                          </div>
                        )}
                        <Badge 
                          variant={experience.is_active ? "default" : "secondary"}
                          className="absolute top-2 right-2"
                        >
                          {experience.is_active ? "Active" : "Inactive"}
                        </Badge>
                      </div>
                      <CardContent className="p-4">
                        <h3 className="font-semibold text-lg mb-2 line-clamp-2">
                          {experience.title}
                        </h3>
                        <p className="text-muted-foreground text-sm mb-4 line-clamp-3">
                          {experience.description}
                        </p>
                        <div className="space-y-2 text-sm">
                          <div className="flex justify-between">
                            <span>Price:</span>
                            <span className="font-medium">${experience.price}</span>
                          </div>
                          <div className="flex justify-between">
                            <span>Duration:</span>
                            <span>{experience.duration_hours} hours</span>
                          </div>
                          <div className="flex justify-between">
                            <span>Max Guests:</span>
                            <span>{experience.max_guests}</span>
                          </div>
                        </div>
                        <div className="flex gap-2 mt-4">
                          <Button 
                            variant="outline" 
                            size="sm"
                            onClick={() => setEditingExperience(experience)}
                          >
                            <Edit className="w-4 h-4 mr-1" />
                            Edit
                          </Button>
                          <Button 
                            variant="outline" 
                            size="sm" 
                            onClick={() => toggleExperienceStatus(experience.id, experience.is_active)}
                          >
                            {experience.is_active ? "Deactivate" : "Activate"}
                          </Button>
                          <Button 
                            variant="outline" 
                            size="sm"
                            onClick={() => deleteExperience(experience.id)}
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </div>
          </TabsContent>

          <TabsContent value="bookings" className="mt-6">
            <BookingManagement />
          </TabsContent>

          <TabsContent value="availability" className="mt-6">
            <AvailabilityCalendar />
          </TabsContent>

          <TabsContent value="analytics" className="mt-6">
            <RevenueAnalytics />
          </TabsContent>

          <TabsContent value="subscription" className="mt-6">
            <div className="max-w-2xl">
              <div className="mb-6">
                <h2 className="text-2xl font-bold flex items-center gap-2">
                  <CreditCard className="w-6 h-6" />
                  Your Subscription
                </h2>
                <p className="text-muted-foreground mt-1">
                  Manage your host subscription plan
                </p>
              </div>
              <SubscriptionStatus />
              <div className="mt-6">
                <Button asChild>
                  <Link to="/pricing">View All Plans</Link>
                </Button>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="messages" className="mt-6">
            <Card>
              <CardContent className="flex flex-col items-center justify-center py-12">
                <MessageSquare className="w-16 h-16 text-muted-foreground mb-4" />
                <h3 className="text-lg font-semibold mb-2">Messages Coming Soon</h3>
                <p className="text-muted-foreground text-center">
                  Guest messaging functionality will be available soon
                </p>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        {/* Create Experience Modal */}
        {showCreateForm && (
          <div className="fixed inset-0 bg-background/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <div className="bg-background border rounded-lg shadow-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
              <div className="p-6">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-2xl font-bold">Create New Experience</h2>
                  <Button 
                    variant="ghost" 
                    onClick={() => setShowCreateForm(false)}
                  >
                    ✕
                  </Button>
                </div>
                <HostExperienceForm 
                  onSuccess={() => {
                    setShowCreateForm(false);
                    fetchHostData();
                  }} 
                />
              </div>
            </div>
          </div>
        )}

        {/* Edit Experience Modal */}
        <EditExperienceModal
          experience={editingExperience}
          isOpen={!!editingExperience}
          onClose={() => setEditingExperience(null)}
          onSuccess={() => {
            fetchHostData();
            setEditingExperience(null);
          }}
        />
      </div>
    </div>
  );
};

export default HostDashboard;