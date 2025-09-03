import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { HelpCircle, MessageCircle, Phone, Mail } from 'lucide-react';

const Support = () => {
  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-brand-navy mb-2">Help & Support</h1>
        <p className="text-muted-foreground">
          Get help with your LiLo experience
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Contact Form */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <MessageCircle className="w-5 h-5" />
              Contact Us
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <label className="text-sm font-medium mb-2 block">Your Email</label>
              <Input placeholder="your@email.com" />
            </div>
            
            <div>
              <label className="text-sm font-medium mb-2 block">Subject</label>
              <Input placeholder="How can we help you?" />
            </div>
            
            <div>
              <label className="text-sm font-medium mb-2 block">Message</label>
              <Textarea 
                placeholder="Describe your question or issue..."
                rows={4}
              />
            </div>
            
            <Button variant="brand" className="w-full">
              Send Message
            </Button>
          </CardContent>
        </Card>

        {/* Quick Help */}
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <HelpCircle className="w-5 h-5" />
                Quick Help
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="p-3 border border-border rounded-lg">
                <h4 className="font-medium mb-1">How do I book an experience?</h4>
                <p className="text-sm text-muted-foreground">
                  Browse experiences, select your preferred date and time, and complete the booking process.
                </p>
              </div>
              
              <div className="p-3 border border-border rounded-lg">
                <h4 className="font-medium mb-1">What's the cancellation policy?</h4>
                <p className="text-sm text-muted-foreground">
                  Cancellation policies vary by experience. Check the experience details for specific terms.
                </p>
              </div>
              
              <div className="p-3 border border-border rounded-lg">
                <h4 className="font-medium mb-1">How do I become a host?</h4>
                <p className="text-sm text-muted-foreground">
                  Switch to host mode in your profile and create your first experience listing.
                </p>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Other Ways to Reach Us</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex items-center gap-3">
                <Phone className="w-4 h-4 text-brand-soft-blue" />
                <span className="text-sm">1-800-LILO-HELP</span>
              </div>
              <div className="flex items-center gap-3">
                <Mail className="w-4 h-4 text-brand-soft-green" />
                <span className="text-sm">support@livelocal.app</span>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default Support;