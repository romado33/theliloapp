import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Heart, MapPin, Users, Star } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface WelcomeScreenProps {
  onComplete: () => void;
}

export const WelcomeScreen = ({ onComplete }: WelcomeScreenProps) => {
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const handleGetStarted = async () => {
    setLoading(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('No user found');

      const { error } = await supabase
        .from('profiles')
        .update({ onboarded: true })
        .eq('id', user.id);

      if (error) throw error;

      toast({
        title: "Welcome to LiLo!",
        description: "You're all set to discover amazing local experiences."
      });

      onComplete();
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-brand-soft-green/20 via-background to-brand-soft-blue/20 flex items-center justify-center p-4">
      <Card className="w-full max-w-md mx-auto">
        <CardHeader className="text-center space-y-4">
          <div className="mx-auto w-16 h-16 bg-gradient-brand rounded-full flex items-center justify-center">
            <Heart className="w-8 h-8 text-white" />
          </div>
          <CardTitle className="text-2xl font-bold text-brand-navy">
            Welcome to LiLo!
          </CardTitle>
          <p className="text-muted-foreground">
            Discover authentic local experiences perfect for families with young children in Ottawa.
          </p>
        </CardHeader>
        
        <CardContent className="space-y-6">
          <div className="space-y-4">
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 bg-brand-soft-green/20 rounded-full flex items-center justify-center">
                <MapPin className="w-4 h-4 text-brand-soft-green" />
              </div>
              <span className="text-sm">Find local experiences near you</span>
            </div>
            
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 bg-brand-soft-blue/20 rounded-full flex items-center justify-center">
                <Users className="w-4 h-4 text-brand-soft-blue" />
              </div>
              <span className="text-sm">Small, family-friendly activities</span>
            </div>
            
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 bg-brand-golden-yellow/20 rounded-full flex items-center justify-center">
                <Star className="w-4 h-4 text-brand-golden-yellow" />
              </div>
              <span className="text-sm">Authentic, intimate experiences</span>
            </div>
          </div>

          <Button 
            variant="brand" 
            className="w-full" 
            onClick={handleGetStarted}
            disabled={loading}
          >
            {loading ? "Setting up your account..." : "Get Started"}
          </Button>
        </CardContent>
      </Card>
    </div>
  );
};