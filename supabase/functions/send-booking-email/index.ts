import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { Resend } from "npm:resend@4.0.0";

const resend = new Resend(Deno.env.get("RESEND_API_KEY"));

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface BookingEmailRequest {
  bookingId: string;
  customerEmail: string;
  experienceTitle: string;
  hostName: string;
  bookingDate: string;
  guestCount: number;
  totalPrice: number;
  location: string;
}

const handler = async (req: Request): Promise<Response> => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    console.log("Starting send-booking-email function");
    
    const {
      bookingId,
      customerEmail,
      experienceTitle,
      hostName,
      bookingDate,
      guestCount,
      totalPrice,
      location
    }: BookingEmailRequest = await req.json();

    console.log("Received booking email request:", { bookingId, customerEmail, experienceTitle });

    // Format the booking date
    const formattedDate = new Date(bookingDate).toLocaleDateString("en-US", {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
    });

    // Send confirmation email to customer
    const customerEmailResponse = await resend.emails.send({
      from: "Experience Bookings <onboarding@resend.dev>",
      to: [customerEmail],
      subject: `Booking Confirmed: ${experienceTitle}`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
          <h1 style="color: #333; border-bottom: 2px solid #4CAF50; padding-bottom: 10px;">
            🎉 Booking Confirmed!
          </h1>
          
          <div style="background-color: #f9f9f9; padding: 20px; border-radius: 8px; margin: 20px 0;">
            <h2 style="color: #4CAF50; margin-top: 0;">Experience Details</h2>
            <p><strong>Experience:</strong> ${experienceTitle}</p>
            <p><strong>Host:</strong> ${hostName}</p>
            <p><strong>Date:</strong> ${formattedDate}</p>
            <p><strong>Location:</strong> ${location}</p>
            <p><strong>Guests:</strong> ${guestCount}</p>
            <p><strong>Total Paid:</strong> $${totalPrice.toFixed(2)}</p>
            <p><strong>Booking ID:</strong> ${bookingId}</p>
          </div>

          <div style="background-color: #e3f2fd; padding: 15px; border-radius: 8px; margin: 20px 0;">
            <h3 style="color: #1976d2; margin-top: 0;">What's Next?</h3>
            <ul style="color: #555;">
              <li>Your host will contact you with additional details</li>
              <li>Check your email for any updates from ${hostName}</li>
              <li>Arrive at the location 10 minutes early</li>
              <li>Bring any required items mentioned in the experience description</li>
            </ul>
          </div>

          <div style="background-color: #fff3e0; padding: 15px; border-radius: 8px; margin: 20px 0;">
            <h3 style="color: #f57c00; margin-top: 0;">Need Help?</h3>
            <p style="color: #555;">
              If you have any questions about your booking, please contact us with your booking ID: <strong>${bookingId}</strong>
            </p>
          </div>

          <div style="text-align: center; margin-top: 30px; padding-top: 20px; border-top: 1px solid #eee;">
            <p style="color: #888; font-size: 14px;">
              Thank you for choosing our platform for your experience booking!
            </p>
          </div>
        </div>
      `,
    });

    console.log("Customer email sent successfully:", customerEmailResponse);

    return new Response(
      JSON.stringify({ 
        success: true, 
        customerEmailId: customerEmailResponse.data?.id 
      }), 
      {
        status: 200,
        headers: {
          "Content-Type": "application/json",
          ...corsHeaders,
        },
      }
    );
  } catch (error: any) {
    console.error("Error in send-booking-email function:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        status: 500,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      }
    );
  }
};

serve(handler);