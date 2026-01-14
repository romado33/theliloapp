import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;

const handler = async (req: Request): Promise<Response> => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Get the user's JWT from the Authorization header
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) {
      throw new Error("No authorization header");
    }

    // Create a client with the user's JWT to verify identity
    const supabaseUser = createClient(supabaseUrl, Deno.env.get("SUPABASE_ANON_KEY")!, {
      global: { headers: { Authorization: authHeader } }
    });

    const { data: { user }, error: userError } = await supabaseUser.auth.getUser();
    if (userError || !user) {
      throw new Error("Invalid user token");
    }

    console.log(`Processing account deletion for user: ${user.id}`);

    // Create admin client for deletion operations
    const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey);

    // Delete user data in order (respecting foreign keys)
    // 1. Delete notifications
    await supabaseAdmin.from("notifications").delete().eq("user_id", user.id);
    
    // 2. Delete saved experiences
    await supabaseAdmin.from("saved_experiences").delete().eq("user_id", user.id);
    
    // 3. Delete activity log
    await supabaseAdmin.from("activity_log").delete().eq("user_id", user.id);
    
    // 4. Delete chat messages (as sender)
    await supabaseAdmin.from("chat_messages").delete().eq("sender_id", user.id);
    
    // 5. Delete chat conversations (as guest or host)
    await supabaseAdmin.from("chat_conversations").delete().eq("guest_id", user.id);
    await supabaseAdmin.from("chat_conversations").delete().eq("host_id", user.id);
    
    // 6. Delete messages
    await supabaseAdmin.from("messages").delete().eq("sender_id", user.id);
    await supabaseAdmin.from("messages").delete().eq("recipient_id", user.id);
    
    // 7. Delete reviews (as guest)
    await supabaseAdmin.from("reviews").delete().eq("guest_id", user.id);
    
    // 8. Delete bookings (as guest)
    await supabaseAdmin.from("bookings").delete().eq("guest_id", user.id);
    
    // 9. Delete campaign recipients
    await supabaseAdmin.from("campaign_recipients").delete().eq("user_id", user.id);
    
    // 10. Delete subscriptions
    await supabaseAdmin.from("subscriptions").delete().eq("user_id", user.id);
    
    // 11. Delete user roles
    await supabaseAdmin.from("user_roles").delete().eq("user_id", user.id);
    
    // 12. If user is a host, handle their experiences
    // First, delete availability for their experiences
    const { data: experiences } = await supabaseAdmin
      .from("experiences")
      .select("id")
      .eq("host_id", user.id);
    
    if (experiences && experiences.length > 0) {
      const experienceIds = experiences.map(e => e.id);
      
      // Delete related bookings' reviews
      await supabaseAdmin.from("reviews").delete().in("experience_id", experienceIds);
      
      // Delete bookings for these experiences
      await supabaseAdmin.from("bookings").delete().in("experience_id", experienceIds);
      
      // Delete availability
      await supabaseAdmin.from("availability").delete().in("experience_id", experienceIds);
      
      // Delete experience photos
      await supabaseAdmin.from("experience_photos").delete().in("experience_id", experienceIds);
      
      // Delete pricing suggestions
      await supabaseAdmin.from("pricing_suggestions").delete().in("experience_id", experienceIds);
      
      // Delete experiences
      await supabaseAdmin.from("experiences").delete().eq("host_id", user.id);
    }
    
    // 13. Delete email campaigns created by user
    await supabaseAdmin.from("email_campaigns").delete().eq("created_by", user.id);
    
    // 14. Delete profile
    await supabaseAdmin.from("profiles").delete().eq("id", user.id);
    
    // 15. Finally, delete the auth user
    const { error: deleteError } = await supabaseAdmin.auth.admin.deleteUser(user.id);
    
    if (deleteError) {
      console.error("Error deleting auth user:", deleteError);
      throw new Error("Failed to delete user account");
    }

    console.log(`Successfully deleted account for user: ${user.id}`);

    return new Response(
      JSON.stringify({ success: true, message: "Account deleted successfully" }),
      {
        status: 200,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      }
    );
  } catch (error: any) {
    console.error("Error deleting account:", error);
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
