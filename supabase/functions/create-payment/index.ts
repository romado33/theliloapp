import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import Stripe from "https://esm.sh/stripe@18.5.0";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.57.2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface PaymentRequest {
  experienceId: string;
  bookingDate: string;
  guestCount: number;
  specialRequests?: string;
  guestContactInfo?: {
    email: string;
    phone?: string;
  };
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
    console.log("Starting create-payment function");

    // Require authentication for payment operations
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) {
      throw new Error('Authentication required');
    }

    const token = authHeader.replace("Bearer ", "");
    const { data: { user }, error: authError } = await supabaseClient.auth.getUser(token);
    
    if (authError || !user) {
      throw new Error('Invalid authentication');
    }

    console.log("Authenticated user:", user.email);

    const {
      experienceId,
      bookingDate,
      guestCount,
      specialRequests,
      guestContactInfo
    }: PaymentRequest = await req.json();

    console.log("Payment request received:", { experienceId, bookingDate, guestCount });

    // Get experience details
    const { data: experience, error: expError } = await supabaseClient
      .from('experiences')
      .select(`
        *,
        profiles:host_id (
          first_name,
          last_name,
          email
        )
      `)
      .eq('id', experienceId)
      .single();

    if (expError || !experience) {
      throw new Error('Experience not found');
    }

    console.log("Experience found:", experience.title);

    // Validate guest count
    if (guestCount < 1 || guestCount > experience.max_guests) {
      throw new Error(`Guest count must be between 1 and ${experience.max_guests}`);
    }

    // Calculate total price SERVER-SIDE (never trust client)
    const totalPrice = experience.price * guestCount;
    console.log("Server-calculated price:", totalPrice);

    // Initialize Stripe
    const stripe = new Stripe(Deno.env.get("STRIPE_SECRET_KEY") || "", {
      apiVersion: "2025-08-27.basil",
    });

    // Use authenticated user's email
    const customerEmail = user.email;
    if (!customerEmail) {
      throw new Error('User email not found');
    }

    // Check if Stripe customer exists
    const customers = await stripe.customers.list({ 
      email: customerEmail, 
      limit: 1 
    });
    
    let customerId;
    if (customers.data.length > 0) {
      customerId = customers.data[0].id;
      console.log("Existing customer found:", customerId);
    }

    // Create booking record with pending status
    const { data: booking, error: bookingError } = await supabaseClient
      .from('bookings')
      .insert({
        experience_id: experienceId,
        guest_id: user.id,
        booking_date: bookingDate,
        guest_count: guestCount,
        total_price: totalPrice, // Server-calculated price only
        status: 'pending',
        special_requests: specialRequests,
        guest_contact_info: guestContactInfo || { email: user.email },
        created_at: new Date().toISOString()
      })
      .select()
      .single();

    if (bookingError) {
      console.error("Booking creation error:", bookingError);
      throw new Error('Failed to create booking');
    }

    console.log("Booking created:", booking.id);

    // Create Stripe checkout session
    const session = await stripe.checkout.sessions.create({
      customer: customerId,
      customer_email: customerId ? undefined : customerEmail,
      line_items: [
        {
          price_data: {
            currency: 'usd',
            product_data: {
              name: experience.title,
              description: `Experience with ${experience.profiles?.first_name} ${experience.profiles?.last_name} on ${new Date(bookingDate).toLocaleDateString()}`,
            },
            unit_amount: Math.round(experience.price * 100), // Convert to cents
          },
          quantity: guestCount,
        },
      ],
      mode: "payment",
      success_url: `${req.headers.get("origin")}/booking-confirmation?booking_id=${booking.id}&session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${req.headers.get("origin")}/experience/${experienceId}?booking_cancelled=true`,
      metadata: {
        booking_id: booking.id,
        experience_id: experienceId,
      },
    });

    console.log("Stripe session created:", session.id);

    return new Response(JSON.stringify({ 
      url: session.url,
      booking_id: booking.id 
    }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 200,
    });
  } catch (error: any) {
    console.error("Error in create-payment function:", error);
    return new Response(JSON.stringify({ error: error.message }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 500,
    });
  }
};

serve(handler);