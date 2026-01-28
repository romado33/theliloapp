import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import Stripe from "https://esm.sh/stripe@18.5.0";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.57.2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface VerifyPaymentRequest {
  sessionId: string;
  bookingId: string;
}

const handler = async (req: Request): Promise<Response> => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  const supabaseClient = createClient(
    Deno.env.get("SUPABASE_URL") ?? "",
    Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? ""
  );

  try {
    console.log("Starting verify-payment function");

    // Require authentication
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) {
      throw new Error('Authentication required');
    }

    const token = authHeader.replace("Bearer ", "");
    const { data: { user }, error: authError } = await supabaseClient.auth.getUser(token);
    
    if (authError || !user) {
      throw new Error('Invalid authentication');
    }

    const { sessionId, bookingId }: VerifyPaymentRequest = await req.json();

    console.log("Verifying payment:", { sessionId, bookingId });

    // Initialize Stripe
    const stripe = new Stripe(Deno.env.get("STRIPE_SECRET_KEY") || "", {
      apiVersion: "2025-08-27.basil",
    });

    // Retrieve the Stripe session
    const session = await stripe.checkout.sessions.retrieve(sessionId);

    if (session.payment_status !== 'paid') {
      throw new Error('Payment not completed');
    }

    console.log("Payment verified successfully");

    // Verify booking belongs to authenticated user before updating
    const { data: existingBooking } = await supabaseClient
      .from('bookings')
      .select('guest_id')
      .eq('id', bookingId)
      .single();

    if (!existingBooking || existingBooking.guest_id !== user.id) {
      throw new Error('Unauthorized: Booking does not belong to user');
    }

    // Update booking status to confirmed
    const { data: updatedBooking, error: updateError } = await supabaseClient
      .from('bookings')
      .update({ 
        status: 'confirmed',
        stripe_session_id: sessionId,
        updated_at: new Date().toISOString()
      })
      .eq('id', bookingId)
      .eq('guest_id', user.id) // Additional security check
      .select(`
        *,
        experiences (
          title,
          location,
          profiles:host_id (
            first_name,
            last_name,
            email
          )
        )
      `)
      .single();

    if (updateError) {
      console.error("Booking update error:", updateError);
      throw new Error('Failed to update booking status');
    }

    console.log("Booking updated to confirmed");

    // Send booking confirmation email
    const experience = updatedBooking.experiences;
    const hostName = `${experience.profiles?.first_name} ${experience.profiles?.last_name}`;
    
    // Determine customer email
    let customerEmail = updatedBooking.guest_contact_info?.email;
    if (!customerEmail && updatedBooking.guest_id) {
      // Get user email from auth
      const { data: userProfile } = await supabaseClient
        .from('profiles')
        .select('email')
        .eq('id', updatedBooking.guest_id)
        .single();
      
      customerEmail = userProfile?.email;
    }

    if (customerEmail) {
      console.log("Sending confirmation email to:", customerEmail);
      
      try {
        const emailResponse = await fetch(`${Deno.env.get("SUPABASE_URL")}/functions/v1/send-email`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${Deno.env.get("SUPABASE_ANON_KEY")}`,
          },
          body: JSON.stringify({
            type: 'booking_confirmation',
            to: customerEmail,
            data: {
              guestName: updatedBooking.guest_contact_info?.firstName || 'Guest',
              experienceTitle: experience.title,
              hostName,
              bookingDate: updatedBooking.booking_date,
              guestCount: updatedBooking.guest_count,
              totalPrice: updatedBooking.total_price,
              location: experience.location,
              bookingId: updatedBooking.id,
            },
          }),
        });

        if (!emailResponse.ok) {
          console.warn("Failed to send confirmation email, but booking is confirmed");
        } else {
          console.log("Confirmation email sent successfully");
        }
      } catch (emailError) {
        console.warn("Email sending failed:", emailError);
      }
    }

    return new Response(JSON.stringify({ 
      success: true, 
      booking: updatedBooking 
    }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 200,
    });
  } catch (error: any) {
    console.error("Error in verify-payment function:", error);
    return new Response(JSON.stringify({ error: error.message }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 500,
    });
  }
};

serve(handler);