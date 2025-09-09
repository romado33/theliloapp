import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.7.1';
import { Resend } from "npm:resend@4.0.0";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface BookingEmailRequest {
  bookingId: string;
  type: 'confirmation' | 'cancellation';
}

// Input validation schema
const validateBookingEmailRequest = (data: any): { valid: boolean; error?: string } => {
  if (!data || typeof data !== 'object') {
    return { valid: false, error: 'Invalid request body' };
  }

  if (!data.bookingId || typeof data.bookingId !== 'string') {
    return { valid: false, error: 'Valid bookingId is required' };
  }

  if (!data.type || !['confirmation', 'cancellation'].includes(data.type)) {
    return { valid: false, error: 'Valid type (confirmation or cancellation) is required' };
  }

  // Basic UUID validation
  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
  if (!uuidRegex.test(data.bookingId)) {
    return { valid: false, error: 'Invalid bookingId format' };
  }

  return { valid: true };
};

const resend = new Resend(Deno.env.get('RESEND_API_KEY'));
const supabase = createClient(
  Deno.env.get('SUPABASE_URL') ?? '',
  Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
);

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const rawData = await req.json();
    
    // Validate input
    const validation = validateBookingEmailRequest(rawData);
    if (!validation.valid) {
      console.error('Validation error:', validation.error);
      return new Response(
        JSON.stringify({ error: validation.error }),
        { 
          status: 400, 
          headers: { "Content-Type": "application/json", ...corsHeaders } 
        }
      );
    }
    
    const { bookingId, type }: BookingEmailRequest = rawData;

    console.log(`Processing ${type} email for booking ${bookingId}`);

    // Fetch booking details with experience and profile info
    const { data: booking, error } = await supabase
      .from('bookings')
      .select(`
        *,
        experience:experiences (
          title,
          location,
          address,
          duration_hours,
          host_id,
          profiles:host_id (
            first_name,
            last_name,
            email
          )
        ),
        guest:profiles!guest_id (
          first_name,
          last_name,
          email
        )
      `)
      .eq('id', bookingId)
      .single();

    if (error || !booking) {
      console.error('Booking not found:', error);
      throw new Error('Booking not found');
    }

    const guestEmail = booking.guest?.email || booking.guest_contact_info?.email;
    const hostEmail = booking.experience?.profiles?.email;
    const guestName = booking.guest?.first_name || 'Guest';
    const hostName = booking.experience?.profiles?.first_name || 'Host';

    if (!guestEmail) {
      throw new Error('Guest email not found');
    }

    const formatDate = (dateString: string) => {
      return new Date(dateString).toLocaleDateString('en-US', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
    };

    if (type === 'confirmation') {
      // Send confirmation email to guest
      const guestConfirmationHtml = `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h1 style="color: #2563eb; margin-bottom: 24px;">Booking Confirmed! 🎉</h1>
          
          <p>Hi ${guestName},</p>
          
          <p>Great news! Your booking has been confirmed. Here are the details:</p>
          
          <div style="background: #f8fafc; padding: 20px; border-radius: 8px; margin: 20px 0;">
            <h2 style="margin-top: 0; color: #1e293b;">${booking.experience?.title}</h2>
            <p><strong>Date & Time:</strong> ${formatDate(booking.booking_date)}</p>
            <p><strong>Duration:</strong> ${booking.experience?.duration_hours} hours</p>
            <p><strong>Location:</strong> ${booking.experience?.location}</p>
            ${booking.experience?.address ? `<p><strong>Address:</strong> ${booking.experience.address}</p>` : ''}
            <p><strong>Number of Guests:</strong> ${booking.guest_count}</p>
            <p><strong>Total Price:</strong> $${booking.total_price}</p>
            ${booking.special_requests ? `<p><strong>Special Requests:</strong> ${booking.special_requests}</p>` : ''}
          </div>
          
          <h3>What to expect:</h3>
          <p>Your host ${hostName} will contact you soon with more details about the experience.</p>
          
          <p>If you have any questions, feel free to reach out to us.</p>
          
          <p>Have a wonderful experience!</p>
          
          <hr style="margin: 30px 0; border: none; border-top: 1px solid #e2e8f0;">
          <p style="color: #64748b; font-size: 14px;">
            This is an automated message. Please do not reply to this email.
          </p>
        </div>
      `;

      await resend.emails.send({
        from: 'Experience Bookings <bookings@resend.dev>',
        to: [guestEmail],
        subject: `Booking Confirmed: ${booking.experience?.title}`,
        html: guestConfirmationHtml,
      });

      // Send notification to host if email available
      if (hostEmail) {
        const hostNotificationHtml = `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <h1 style="color: #2563eb; margin-bottom: 24px;">New Booking Received! 🎉</h1>
            
            <p>Hi ${hostName},</p>
            
            <p>You have a new booking for your experience:</p>
            
            <div style="background: #f8fafc; padding: 20px; border-radius: 8px; margin: 20px 0;">
              <h2 style="margin-top: 0; color: #1e293b;">${booking.experience?.title}</h2>
              <p><strong>Guest:</strong> ${guestName}</p>
              <p><strong>Date & Time:</strong> ${formatDate(booking.booking_date)}</p>
              <p><strong>Number of Guests:</strong> ${booking.guest_count}</p>
              <p><strong>Total Earnings:</strong> $${booking.total_price}</p>
              ${booking.special_requests ? `<p><strong>Special Requests:</strong> ${booking.special_requests}</p>` : ''}
            </div>
            
            <p>Please reach out to your guest to confirm any additional details.</p>
            
            <hr style="margin: 30px 0; border: none; border-top: 1px solid #e2e8f0;">
            <p style="color: #64748b; font-size: 14px;">
              This is an automated message. Please do not reply to this email.
            </p>
          </div>
        `;

        await resend.emails.send({
          from: 'Experience Bookings <bookings@resend.dev>',
          to: [hostEmail],
          subject: `New Booking: ${booking.experience?.title}`,
          html: hostNotificationHtml,
        });
      }

    } else if (type === 'cancellation') {
      // Send cancellation email to guest
      const cancellationHtml = `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h1 style="color: #dc2626; margin-bottom: 24px;">Booking Cancelled</h1>
          
          <p>Hi ${guestName},</p>
          
          <p>Your booking has been cancelled. Here are the details:</p>
          
          <div style="background: #fef2f2; padding: 20px; border-radius: 8px; margin: 20px 0;">
            <h2 style="margin-top: 0; color: #1e293b;">${booking.experience?.title}</h2>
            <p><strong>Original Date:</strong> ${formatDate(booking.booking_date)}</p>
            <p><strong>Cancelled Amount:</strong> $${booking.total_price}</p>
          </div>
          
          <p>If you cancelled this booking, no further action is needed. If this was cancelled in error, please contact us immediately.</p>
          
          <p>We hope to see you again soon for another amazing experience!</p>
          
          <hr style="margin: 30px 0; border: none; border-top: 1px solid #e2e8f0;">
          <p style="color: #64748b; font-size: 14px;">
            This is an automated message. Please do not reply to this email.
          </p>
        </div>
      `;

      await resend.emails.send({
        from: 'Experience Bookings <bookings@resend.dev>',
        to: [guestEmail],
        subject: `Booking Cancelled: ${booking.experience?.title}`,
        html: cancellationHtml,
      });

      // Notify host of cancellation
      if (hostEmail) {
        const hostCancellationHtml = `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <h1 style="color: #dc2626; margin-bottom: 24px;">Booking Cancelled</h1>
            
            <p>Hi ${hostName},</p>
            
            <p>A booking for your experience has been cancelled:</p>
            
            <div style="background: #fef2f2; padding: 20px; border-radius: 8px; margin: 20px 0;">
              <h2 style="margin-top: 0; color: #1e293b;">${booking.experience?.title}</h2>
              <p><strong>Guest:</strong> ${guestName}</p>
              <p><strong>Original Date:</strong> ${formatDate(booking.booking_date)}</p>
              <p><strong>Cancelled Amount:</strong> $${booking.total_price}</p>
            </div>
            
            <p>The slot is now available for new bookings.</p>
            
            <hr style="margin: 30px 0; border: none; border-top: 1px solid #e2e8f0;">
            <p style="color: #64748b; font-size: 14px;">
              This is an automated message. Please do not reply to this email.
            </p>
          </div>
        `;

        await resend.emails.send({
          from: 'Experience Bookings <bookings@resend.dev>',
          to: [hostEmail],
          subject: `Booking Cancelled: ${booking.experience?.title}`,
          html: hostCancellationHtml,
        });
      }
    }

    console.log(`${type} email sent successfully for booking ${bookingId}`);

    return new Response(
      JSON.stringify({ success: true, message: `${type} email sent successfully` }),
      {
        status: 200,
        headers: { 'Content-Type': 'application/json', ...corsHeaders },
      }
    );

  } catch (error: any) {
    console.error('Error sending email:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        status: 500,
        headers: { 'Content-Type': 'application/json', ...corsHeaders },
      }
    );
  }
});