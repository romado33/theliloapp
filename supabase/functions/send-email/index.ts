import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { Resend } from "https://esm.sh/resend@4.0.0";

const resend = new Resend(Deno.env.get("RESEND_API_KEY"));

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

type EmailType = 'booking_confirmation' | 'booking_cancellation' | 'booking_reminder' | 'booking_modified';

interface EmailRequest {
  type: EmailType;
  to: string;
  data: {
    bookingId?: string;
    experienceTitle?: string;
    hostName?: string;
    guestName?: string;
    bookingDate?: string;
    guestCount?: number;
    totalPrice?: number;
    location?: string;
    reminderHours?: number;
  };
}

function getEmailContent(type: EmailType, data: EmailRequest['data']): { subject: string; html: string } {
  const formattedDate = data.bookingDate 
    ? new Date(data.bookingDate).toLocaleDateString("en-US", {
        weekday: "long",
        year: "numeric",
        month: "long",
        day: "numeric",
        hour: "2-digit",
        minute: "2-digit"
      })
    : 'TBD';

  const baseStyles = `
    <style>
      .email-container { font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; }
      .header { border-bottom: 2px solid #4CAF50; padding-bottom: 10px; margin-bottom: 20px; }
      .details-box { background-color: #f9f9f9; padding: 20px; border-radius: 8px; margin: 20px 0; }
      .info-box { padding: 15px; border-radius: 8px; margin: 20px 0; }
      .green-box { background-color: #e8f5e9; }
      .blue-box { background-color: #e3f2fd; }
      .orange-box { background-color: #fff3e0; }
      .red-box { background-color: #ffebee; }
      .footer { text-align: center; margin-top: 30px; padding-top: 20px; border-top: 1px solid #eee; color: #888; font-size: 14px; }
    </style>
  `;

  switch (type) {
    case 'booking_confirmation':
      return {
        subject: `Booking Confirmed: ${data.experienceTitle}`,
        html: `
          ${baseStyles}
          <div class="email-container">
            <div class="header">
              <h1 style="color: #333;">🎉 Booking Confirmed!</h1>
            </div>
            
            <p>Hi ${data.guestName || 'there'},</p>
            <p>Great news! Your booking has been confirmed.</p>
            
            <div class="details-box">
              <h2 style="color: #4CAF50; margin-top: 0;">Experience Details</h2>
              <p><strong>Experience:</strong> ${data.experienceTitle}</p>
              <p><strong>Host:</strong> ${data.hostName}</p>
              <p><strong>Date & Time:</strong> ${formattedDate}</p>
              <p><strong>Location:</strong> ${data.location}</p>
              <p><strong>Guests:</strong> ${data.guestCount}</p>
              <p><strong>Total Paid:</strong> $${data.totalPrice?.toFixed(2)}</p>
              <p><strong>Booking ID:</strong> ${data.bookingId}</p>
            </div>

            <div class="info-box blue-box">
              <h3 style="color: #1976d2; margin-top: 0;">What's Next?</h3>
              <ul>
                <li>Your host may contact you with additional details</li>
                <li>Arrive at the location 10 minutes early</li>
                <li>Bring any required items mentioned in the experience</li>
              </ul>
            </div>

            <div class="footer">
              <p>Thank you for choosing Live Local!</p>
            </div>
          </div>
        `
      };

    case 'booking_cancellation':
      return {
        subject: `Booking Cancelled: ${data.experienceTitle}`,
        html: `
          ${baseStyles}
          <div class="email-container">
            <div class="header" style="border-color: #f44336;">
              <h1 style="color: #333;">Booking Cancelled</h1>
            </div>
            
            <p>Hi ${data.guestName || 'there'},</p>
            <p>Your booking has been cancelled as requested.</p>
            
            <div class="details-box">
              <h2 style="color: #f44336; margin-top: 0;">Cancelled Booking</h2>
              <p><strong>Experience:</strong> ${data.experienceTitle}</p>
              <p><strong>Original Date:</strong> ${formattedDate}</p>
              <p><strong>Booking ID:</strong> ${data.bookingId}</p>
            </div>

            <div class="info-box orange-box">
              <h3 style="color: #f57c00; margin-top: 0;">Refund Information</h3>
              <p>If eligible for a refund, it will be processed within 5-10 business days.</p>
            </div>

            <div class="footer">
              <p>We hope to see you again soon!</p>
            </div>
          </div>
        `
      };

    case 'booking_reminder':
      return {
        subject: `Reminder: ${data.experienceTitle} is coming up!`,
        html: `
          ${baseStyles}
          <div class="email-container">
            <div class="header" style="border-color: #2196F3;">
              <h1 style="color: #333;">⏰ Your Experience is Coming Up!</h1>
            </div>
            
            <p>Hi ${data.guestName || 'there'},</p>
            <p>This is a friendly reminder that your experience is in <strong>${data.reminderHours} hours</strong>!</p>
            
            <div class="details-box">
              <h2 style="color: #2196F3; margin-top: 0;">Experience Details</h2>
              <p><strong>Experience:</strong> ${data.experienceTitle}</p>
              <p><strong>Host:</strong> ${data.hostName}</p>
              <p><strong>Date & Time:</strong> ${formattedDate}</p>
              <p><strong>Location:</strong> ${data.location}</p>
              <p><strong>Guests:</strong> ${data.guestCount}</p>
            </div>

            <div class="info-box green-box">
              <h3 style="color: #388e3c; margin-top: 0;">Quick Checklist</h3>
              <ul>
                <li>✓ Check the location and plan your route</li>
                <li>✓ Arrive 10 minutes early</li>
                <li>✓ Bring any items mentioned in the experience</li>
                <li>✓ Have your booking ID ready: ${data.bookingId}</li>
              </ul>
            </div>

            <div class="footer">
              <p>Enjoy your experience!</p>
            </div>
          </div>
        `
      };

    case 'booking_modified':
      return {
        subject: `Booking Updated: ${data.experienceTitle}`,
        html: `
          ${baseStyles}
          <div class="email-container">
            <div class="header" style="border-color: #FF9800;">
              <h1 style="color: #333;">📝 Booking Updated</h1>
            </div>
            
            <p>Hi ${data.guestName || 'there'},</p>
            <p>Your booking has been successfully updated.</p>
            
            <div class="details-box">
              <h2 style="color: #FF9800; margin-top: 0;">Updated Details</h2>
              <p><strong>Experience:</strong> ${data.experienceTitle}</p>
              <p><strong>Host:</strong> ${data.hostName}</p>
              <p><strong>Date & Time:</strong> ${formattedDate}</p>
              <p><strong>Location:</strong> ${data.location}</p>
              <p><strong>Guests:</strong> ${data.guestCount}</p>
              <p><strong>Booking ID:</strong> ${data.bookingId}</p>
            </div>

            <div class="footer">
              <p>Thank you for using Live Local!</p>
            </div>
          </div>
        `
      };

    default:
      throw new Error(`Unknown email type: ${type}`);
  }
}

const handler = async (req: Request): Promise<Response> => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { type, to, data }: EmailRequest = await req.json();
    
    console.log(`Sending ${type} email to ${to}`);
    
    const { subject, html } = getEmailContent(type, data);

    const emailResponse = await resend.emails.send({
      from: "Live Local <onboarding@resend.dev>",
      to: [to],
      subject,
      html,
    });

    console.log("Email sent successfully:", emailResponse);

    return new Response(
      JSON.stringify({ success: true, emailId: emailResponse.data?.id }),
      {
        status: 200,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      }
    );
  } catch (error: any) {
    console.error("Error sending email:", error);
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
