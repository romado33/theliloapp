-- Fix remaining function search path security warning

-- Fix the update_chat_conversation_updated_at function
CREATE OR REPLACE FUNCTION public.update_chat_conversation_updated_at()
RETURNS trigger
LANGUAGE plpgsql
SET search_path = public
AS $function$
BEGIN
  UPDATE public.chat_conversations 
  SET updated_at = now() 
  WHERE id = NEW.conversation_id;
  RETURN NEW;
END;
$function$;