-- Fix function search path security warnings

-- Update existing functions to have proper search_path settings
-- These were flagged by the security linter as having mutable search paths

-- Fix update_experience_search_terms function
CREATE OR REPLACE FUNCTION public.update_experience_search_terms()
RETURNS trigger
LANGUAGE plpgsql
SET search_path = public
AS $function$
BEGIN
  NEW.search_terms = CONCAT_WS(' ', NEW.title, NEW.description, NEW.location,
    CASE WHEN NEW.what_included IS NOT NULL THEN array_to_string(NEW.what_included, ' ') ELSE '' END,
    CASE WHEN NEW.what_to_bring IS NOT NULL THEN array_to_string(NEW.what_to_bring, ' ') ELSE '' END
  );
  RETURN NEW;
END;
$function$;