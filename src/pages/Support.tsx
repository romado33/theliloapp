import { useState } from "react";
import { useForm, type FieldErrors } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { useToast } from "@/hooks/use-toast";
import { sanitizeString } from "@/lib/sanitize";
import { 
  HelpCircle, 
  MessageCircle, 
  Phone, 
  Mail, 
  Search,
  ChevronDown,
  ChevronRight,
  Book,
  Users,
  CreditCard,
  Shield
} from 'lucide-react';

const Support = () => {
  const { toast } = useToast();
  const [searchQuery, setSearchQuery] = useState("");
  const [expandedFAQ, setExpandedFAQ] = useState<number | null>(null);
  const [loading, setLoading] = useState(false);

  const contactSchema = z.object({
    email: z.string().email('Valid email is required'),
    subject: z.string().min(1, 'Subject is required'),
    message: z.string().min(1, 'Message is required')
  });

  type ContactFormValues = z.infer<typeof contactSchema>;

  const contactForm = useForm<ContactFormValues>({
    resolver: zodResolver(contactSchema),
    defaultValues: { email: "", subject: "", message: "" }
  });

  const categories = [
    { icon: Book, title: "Bookings", count: 12 },
    { icon: Users, title: "Account", count: 8 },
    { icon: CreditCard, title: "Payments", count: 6 },
    { icon: Shield, title: "Safety", count: 5 }
  ];

  const faqs = [
    {
      category: "Bookings",
      question: "How do I book an experience?",
      answer: "Browse experiences, select your preferred date and time, choose the number of guests, and complete the booking process with payment. You'll receive a confirmation email with all the details."
    },
    {
      category: "Bookings", 
      question: "Can I cancel or modify my booking?",
      answer: "Yes, you can cancel or modify bookings according to the experience's cancellation policy. Check your booking details or contact the host directly for specific terms."
    },
    {
      category: "Bookings",
      question: "What if the weather is bad on the day of my experience?",
      answer: "Most outdoor experiences have weather policies. Check with your host about rescheduling options or indoor alternatives."
    },
    {
      category: "Account",
      question: "How do I become a host?",
      answer: "Switch to host mode in your profile, complete the host verification process, and create your first experience listing. We'll guide you through each step."
    },
    {
      category: "Account",
      question: "How do I update my profile information?",
      answer: "Go to Settings > Profile to update your personal information, profile picture, and preferences."
    },
    {
      category: "Payments",
      question: "When will I be charged for my booking?",
      answer: "You'll be charged immediately upon booking confirmation. For experiences over $200, you may have the option to pay in installments."
    },
    {
      category: "Payments",
      question: "What payment methods do you accept?",
      answer: "We accept all major credit cards, debit cards, PayPal, and Apple Pay for secure transactions."
    },
    {
      category: "Safety",
      question: "How do you ensure the safety of experiences?",
      answer: "All hosts are verified, experiences are reviewed, and we have safety guidelines in place. Report any concerns immediately through our platform."
    }
  ];

  const filteredFAQs = faqs.filter(faq =>
    faq.question.toLowerCase().includes(searchQuery.toLowerCase()) ||
    faq.answer.toLowerCase().includes(searchQuery.toLowerCase()) ||
    faq.category.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleSubmitContact = async (values: ContactFormValues) => {
    setLoading(true);

    const sanitized = {
      email: sanitizeString(values.email),
      subject: sanitizeString(values.subject),
      message: sanitizeString(values.message)
    };
    void sanitized;

    // Simulate form submission
    await new Promise(resolve => setTimeout(resolve, 1500));

    toast({
      title: "Message sent successfully",
      description: "We'll get back to you within 24 hours."
    });

    contactForm.reset();
    setLoading(false);
  };

  const handleContactError = (errors: FieldErrors<ContactFormValues>) => {
    const message = Object.values(errors)
      .map((err) => err?.message as string)
      .filter(Boolean)
      .join('\n');
    toast({ title: 'Validation Error', description: message, variant: 'destructive' });
  };

  return (
    <div className="container mx-auto px-4 py-8 max-w-6xl">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-lilo-navy mb-2">Help & Support</h1>
        <p className="text-muted-foreground">
          Get help with your LiLo experience - we're here to help!
        </p>
      </div>

      {/* Search Bar */}
      <div className="mb-8">
        <div className="relative max-w-md">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
          <Input
            placeholder="Search help articles..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>
      </div>

      {/* Categories */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        {categories.map((category) => (
          <Card key={category.title} className="cursor-pointer hover:shadow-lg transition-shadow">
            <CardContent className="p-4 text-center">
              <category.icon className="w-8 h-8 mx-auto mb-2 text-lilo-navy" />
              <h3 className="font-medium text-sm">{category.title}</h3>
              <Badge variant="secondary" className="mt-1 text-xs">
                {category.count} articles
              </Badge>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* FAQ Section */}
        <div className="lg:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <HelpCircle className="w-5 h-5" />
                Frequently Asked Questions
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {filteredFAQs.map((faq, index) => (
                  <div key={index} className="border border-border rounded-lg">
                    <button
                      onClick={() => setExpandedFAQ(expandedFAQ === index ? null : index)}
                      className="w-full p-4 text-left flex items-center justify-between hover:bg-muted/50 transition-colors"
                    >
                      <div>
                        <Badge variant="outline" className="mb-2 text-xs">
                          {faq.category}
                        </Badge>
                        <h4 className="font-medium">{faq.question}</h4>
                      </div>
                      {expandedFAQ === index ? (
                        <ChevronDown className="w-4 h-4 text-muted-foreground" />
                      ) : (
                        <ChevronRight className="w-4 h-4 text-muted-foreground" />
                      )}
                    </button>
                    {expandedFAQ === index && (
                      <div className="px-4 pb-4">
                        <p className="text-sm text-muted-foreground leading-relaxed">
                          {faq.answer}
                        </p>
                      </div>
                    )}
                  </div>
                ))}

                {filteredFAQs.length === 0 && (
                  <div className="text-center py-8 text-muted-foreground">
                    <HelpCircle className="w-12 h-12 mx-auto mb-4 opacity-50" />
                    <p>No articles found matching your search.</p>
                    <p className="text-sm">Try different keywords or contact us directly.</p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Contact Section */}
        <div className="space-y-6">
          {/* Contact Form */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <MessageCircle className="w-5 h-5" />
                Contact Us
              </CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={contactForm.handleSubmit(handleSubmitContact, handleContactError)} className="space-y-4">
                <div>
                  <label className="text-sm font-medium mb-2 block">Your Email</label>
                  <Input
                    type="email"
                    placeholder="your@email.com"
                    required
                    {...contactForm.register('email')}
                  />
                </div>

                <div>
                  <label className="text-sm font-medium mb-2 block">Subject</label>
                  <Input
                    placeholder="How can we help you?"
                    required
                    {...contactForm.register('subject')}
                  />
                </div>

                <div>
                  <label className="text-sm font-medium mb-2 block">Message</label>
                  <Textarea
                    placeholder="Describe your question or issue..."
                    rows={4}
                    required
                    {...contactForm.register('message')}
                  />
                </div>

                <Button type="submit" className="w-full" disabled={loading}>
                  {loading ? "Sending..." : "Send Message"}
                </Button>
              </form>
            </CardContent>
          </Card>

          {/* Contact Info */}
          <Card>
            <CardHeader>
              <CardTitle>Other Ways to Reach Us</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center gap-3 p-3 border border-border rounded-lg">
                <Phone className="w-5 h-5 text-lilo-soft-blue" />
                <div>
                  <p className="font-medium text-sm">Phone Support</p>
                  <p className="text-sm text-muted-foreground">1-800-LILO-HELP</p>
                  <p className="text-xs text-muted-foreground">Mon-Fri, 9 AM - 6 PM EST</p>
                </div>
              </div>
              
              <div className="flex items-center gap-3 p-3 border border-border rounded-lg">
                <Mail className="w-5 h-5 text-lilo-soft-green" />
                <div>
                  <p className="font-medium text-sm">Email Support</p>
                  <p className="text-sm text-muted-foreground">support@livelocal.app</p>
                  <p className="text-xs text-muted-foreground">Response within 24 hours</p>
                </div>
              </div>

              <div className="p-4 bg-muted/30 rounded-lg">
                <h4 className="font-medium text-sm mb-2">Emergency Support</h4>
                <p className="text-xs text-muted-foreground">
                  For urgent safety issues during an experience, call our 24/7 emergency line: 
                  <strong className="block mt-1">1-800-EMERGENCY</strong>
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default Support;