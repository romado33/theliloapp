import { ArrowLeft } from "lucide-react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";

const TermsOfService = () => {
  return (
    <div className="min-h-screen bg-background">
      <div className="container max-w-4xl py-8 px-4">
        <Link to="/">
          <Button variant="ghost" className="mb-6">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Home
          </Button>
        </Link>

        <h1 className="text-4xl font-bold mb-2">Terms of Service</h1>
        <p className="text-muted-foreground mb-8">Last updated: January 12, 2026</p>

        <div className="prose prose-gray dark:prose-invert max-w-none space-y-6">
          <section>
            <h2 className="text-2xl font-semibold mb-4">1. Acceptance of Terms</h2>
            <p className="text-muted-foreground">
              By accessing or using Lilo ("Platform"), you agree to be bound by these Terms of 
              Service ("Terms"). If you do not agree to these Terms, you may not use our Platform.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4">2. Description of Service</h2>
            <p className="text-muted-foreground">
              Lilo is a marketplace platform that connects hosts offering unique experiences 
              with guests seeking to book those experiences. We facilitate bookings and payments 
              but are not a party to the agreement between hosts and guests.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4">3. User Accounts</h2>
            <ul className="list-disc pl-6 text-muted-foreground space-y-2">
              <li>You must be at least 18 years old to create an account</li>
              <li>You are responsible for maintaining the security of your account</li>
              <li>You must provide accurate and complete information</li>
              <li>You may not transfer your account to another person</li>
              <li>We reserve the right to suspend or terminate accounts for violations</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4">4. Host Responsibilities</h2>
            <p className="text-muted-foreground mb-4">As a host, you agree to:</p>
            <ul className="list-disc pl-6 text-muted-foreground space-y-2">
              <li>Provide accurate descriptions of your experiences</li>
              <li>Honor all confirmed bookings</li>
              <li>Maintain appropriate licenses and permits</li>
              <li>Ensure the safety of guests during experiences</li>
              <li>Comply with all applicable laws and regulations</li>
              <li>Maintain adequate insurance coverage</li>
              <li>Respond to guest inquiries in a timely manner</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4">5. Guest Responsibilities</h2>
            <p className="text-muted-foreground mb-4">As a guest, you agree to:</p>
            <ul className="list-disc pl-6 text-muted-foreground space-y-2">
              <li>Provide accurate booking information</li>
              <li>Arrive on time for booked experiences</li>
              <li>Follow host instructions and safety guidelines</li>
              <li>Treat hosts and other guests with respect</li>
              <li>Pay all fees associated with your bookings</li>
              <li>Comply with cancellation policies</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4">6. Payments and Fees</h2>
            <ul className="list-disc pl-6 text-muted-foreground space-y-2">
              <li>All payments are processed through our secure payment provider (Stripe)</li>
              <li>Prices are displayed in the currency specified on the listing</li>
              <li>Service fees may apply to bookings</li>
              <li>Hosts receive payment according to our payout schedule</li>
              <li>Refunds are subject to the host's cancellation policy</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4">7. Cancellation Policy</h2>
            <p className="text-muted-foreground mb-4">
              Each experience has its own cancellation policy set by the host. Common policies include:
            </p>
            <ul className="list-disc pl-6 text-muted-foreground space-y-2">
              <li><strong>Flexible:</strong> Full refund up to 24 hours before the experience</li>
              <li><strong>Moderate:</strong> Full refund up to 5 days before the experience</li>
              <li><strong>Strict:</strong> 50% refund up to 7 days before the experience</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4">8. Prohibited Activities</h2>
            <p className="text-muted-foreground mb-4">You may not:</p>
            <ul className="list-disc pl-6 text-muted-foreground space-y-2">
              <li>Use the Platform for illegal purposes</li>
              <li>Harass, abuse, or harm other users</li>
              <li>Post false, misleading, or fraudulent content</li>
              <li>Attempt to circumvent Platform fees</li>
              <li>Scrape or collect user data without permission</li>
              <li>Impersonate another person or entity</li>
              <li>Interfere with the operation of the Platform</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4">9. Intellectual Property</h2>
            <p className="text-muted-foreground">
              The Platform and its original content, features, and functionality are owned by 
              Lilo and are protected by international copyright, trademark, and other 
              intellectual property laws.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4">10. Limitation of Liability</h2>
            <p className="text-muted-foreground">
              Lilo is not liable for any indirect, incidental, special, consequential, or 
              punitive damages arising from your use of the Platform. We are not responsible 
              for the actions, content, or conduct of hosts or guests.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4">11. Indemnification</h2>
            <p className="text-muted-foreground">
              You agree to indemnify and hold harmless Lilo, its affiliates, and their 
              respective officers, directors, employees, and agents from any claims, damages, 
              or expenses arising from your use of the Platform or violation of these Terms.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4">12. Dispute Resolution</h2>
            <p className="text-muted-foreground">
              Any disputes arising from these Terms or your use of the Platform shall be 
              resolved through binding arbitration, except where prohibited by law. You 
              waive the right to participate in class action lawsuits.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4">13. Modifications to Terms</h2>
            <p className="text-muted-foreground">
              We reserve the right to modify these Terms at any time. We will notify users 
              of material changes via email or Platform notification. Continued use of the 
              Platform after changes constitutes acceptance of the new Terms.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4">14. Governing Law</h2>
            <p className="text-muted-foreground">
              These Terms shall be governed by and construed in accordance with the laws of 
              the Province of Ontario, Canada, without regard to its conflict of law provisions.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4">15. Contact Information</h2>
            <p className="text-muted-foreground">
              For questions about these Terms, please contact us at:
            </p>
            <ul className="list-none text-muted-foreground mt-2">
              <li>Email: legal@lilo.app</li>
              <li>Address: Ottawa, Ontario, Canada</li>
            </ul>
          </section>
        </div>
      </div>
    </div>
  );
};

export default TermsOfService;
