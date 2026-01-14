import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { Resend } from "https://esm.sh/resend@4.0.0";

const resend = new Resend(Deno.env.get("RESEND_API_KEY"));

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;

/**
 * This function is meant to be called via cron job (e.g., every hour)
 * It finds bookings that are coming up in 24 hours and 2 hours
 * and sends reminder emails to guests
 */
const handler = async (req: Request): Promise<Response> => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabase = createClient(supabaseUrl, supabaseServiceKey);
    
    const now = new Date();
    
    // Find bookings in the next 24-25 hours (for 24h reminder)
    const in24Hours = new Date(now.getTime() + 24 * 60 * 60 * 1000);
    const in25Hours = new Date(now.getTime() + 25 * 60 * 60 * 1000);
    
    // Find bookings in the next 2-3 hours (for 2h reminder)
    const in2Hours = new Date(now.getTime() + 2 * 60 * 60 * 1000);
    const in3Hours = new Date(now.getTime() + 3 * 60 * 60 * 1000);

    // Get bookings for 24h reminder
    const { data: bookings24h, error: error24h } = await supabase
      .from("bookings")
      .select(`
        id,
        booking_date,
        guest_count,
        guest_id,
        experience:experiences (
          title,
          location,
          host_id
        ),
        guest:profiles!bookings_guest_id_fkey (
          email,
          first_name
        )
      `)
      .eq("status", "confirmed")
      .gte("booking_date", in24Hours.toISOString())
      .lt("booking_date", in25Hours.toISOString());

    if (error24h) {
      console.error("Error fetching 24h bookings:", error24h);
    }

    // Get bookings for 2h reminder
    const { data: bookings2h, error: error2h } = await supabase
      .from("bookings")
      .select(`
        id,
        booking_date,
        guest_count,
        guest_id,
        experience:experiences (
          title,
          location,
          host_id
        ),
        guest:profiles!bookings_guest_id_fkey (
          email,
          first_name
        )
      `)
      .eq("status", "confirmed")
      .gte("booking_date", in2Hours.toISOString())
      .lt("booking_date", in3Hours.toISOString());

    if (error2h) {
      console.error("Error fetching 2h bookings:", error2h);
    }

    const emailsSent: string[] = [];
    const errors: string[] = [];

    // Helper function to get host name
    async function getHostName(hostId: string): Promise<string> {
      const { data } = await supabase
        .from("profiles")
        .select("first_name, last_name")
        .eq("id", hostId)
        .single();
      return data ? `${data.first_name || ''} ${data.last_name || ''}`.trim() : 'Your Host';
    }

    // Send 24h reminders
    for (const booking of bookings24h || []) {
      if (!booking.guest?.email) continue;
      
      try {
        const hostName = await getHostName(booking.experience.host_id);
        
        const formattedDate = new Date(booking.booking_date).toLocaleDateString("en-US", {
          weekday: "long",
          year: "numeric",
          month: "long",
          day: "numeric",
          hour: "2-digit",
          minute: "2-digit"
        });

        await resend.emails.send({
          from: "Live Local <onboarding@resend.dev>",
          to: [booking.guest.email],
          subject: `Reminder: ${booking.experience.title} is tomorrow!`,
          html: `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
              <h1 style="color: #333; border-bottom: 2px solid #2196F3; padding-bottom: 10px;">
                ⏰ Your Experience is Tomorrow!
              </h1>
              
              <p>Hi ${booking.guest.first_name || 'there'},</p>
              <p>This is a friendly reminder that your experience is in <strong>24 hours</strong>!</p>
              
              <div style="background-color: #f9f9f9; padding: 20px; border-radius: 8px; margin: 20px 0;">
                <h2 style="color: #2196F3; margin-top: 0;">Experience Details</h2>
                <p><strong>Experience:</strong> ${booking.experience.title}</p>
                <p><strong>Host:</strong> ${hostName}</p>
                <p><strong>Date & Time:</strong> ${formattedDate}</p>
                <p><strong>Location:</strong> ${booking.experience.location}</p>
                <p><strong>Guests:</strong> ${booking.guest_count}</p>
              </div>

              <div style="background-color: #e8f5e9; padding: 15px; border-radius: 8px; margin: 20px 0;">
                <h3 style="color: #388e3c; margin-top: 0;">Quick Checklist</h3>
                <ul>
                  <li>✓ Check the location and plan your route</li>
                  <li>✓ Arrive 10 minutes early</li>
                  <li>✓ Have your booking ID ready: ${booking.id}</li>
                </ul>
              </div>

              <p style="color: #888; font-size: 14px; text-align: center; margin-top: 30px;">
                Enjoy your experience!
              </p>
            </div>
          `,
        });

        emailsSent.push(`24h reminder to ${booking.guest.email}`);
      } catch (err) {
        errors.push(`Failed 24h reminder for booking ${booking.id}: ${err}`);
      }
    }

    // Send 2h reminders
    for (const booking of bookings2h || []) {
      if (!booking.guest?.email) continue;
      
      try {
        const hostName = await getHostName(booking.experience.host_id);
        
        const formattedDate = new Date(booking.booking_date).toLocaleDateString("en-US", {
          weekday: "long",
          year: "numeric",
          month: "long",
          day: "numeric",
          hour: "2-digit",
          minute: "2-digit"
        });

        await resend.emails.send({
          from: "Live Local <onboarding@resend.dev>",
          to: [booking.guest.email],
          subject: `Starting Soon: ${booking.experience.title}`,
          html: `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
              <h1 style="color: #333; border-bottom: 2px solid #FF9800; padding-bottom: 10px;">
                🚀 Your Experience Starts in 2 Hours!
              </h1>
              
              <p>Hi ${booking.guest.first_name || 'there'},</p>
              <p>Your experience is starting very soon!</p>
              
              <div style="background-color: #fff3e0; padding: 20px; border-radius: 8px; margin: 20px 0;">
                <h2 style="color: #FF9800; margin-top: 0;">Experience Details</h2>
                <p><strong>Experience:</strong> ${booking.experience.title}</p>
                <p><strong>Host:</strong> ${hostName}</p>
                <p><strong>Time:</strong> ${formattedDate}</p>
                <p><strong>Location:</strong> ${booking.experience.location}</p>
              </div>

              <div style="background-color: #e3f2fd; padding: 15px; border-radius: 8px; margin: 20px 0;">
                <h3 style="color: #1976d2; margin-top: 0;">📍 Don't forget!</h3>
                <p style="margin: 0;">Head to: <strong>${booking.experience.location}</strong></p>
                <p style="margin-top: 10px;">Booking ID: <strong>${booking.id}</strong></p>
              </div>

              <p style="color: #888; font-size: 14px; text-align: center; margin-top: 30px;">
                Have a great time!
              </p>
            </div>
          `,
        });

        emailsSent.push(`2h reminder to ${booking.guest.email}`);
      } catch (err) {
        errors.push(`Failed 2h reminder for booking ${booking.id}: ${err}`);
      }
    }

    console.log(`Sent ${emailsSent.length} reminder emails`);
    if (errors.length > 0) {
      console.error("Errors:", errors);
    }

    return new Response(
      JSON.stringify({ 
        success: true, 
        emailsSent: emailsSent.length,
        emails: emailsSent,
        errors 
      }),
      {
        status: 200,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      }
    );
  } catch (error: any) {
    console.error("Error in send-booking-reminders:", error);
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
