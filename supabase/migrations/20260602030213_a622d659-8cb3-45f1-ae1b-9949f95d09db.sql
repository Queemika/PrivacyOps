-- Add Client role to enum
ALTER TYPE public.app_role ADD VALUE IF NOT EXISTS 'Client';

-- Trigger: auto-grant Client role to external (non-kpmg.com) emails on profile creation
CREATE OR REPLACE FUNCTION public.grant_client_for_external()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
BEGIN
  IF lower(coalesce(NEW.email,'')) NOT LIKE '%@kpmg.com' THEN
    INSERT INTO public.user_roles (user_id, role)
    VALUES (NEW.user_id, 'Client'::app_role)
    ON CONFLICT DO NOTHING;
  END IF;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS on_profile_external_client ON public.profiles;
CREATE TRIGGER on_profile_external_client
AFTER INSERT ON public.profiles
FOR EACH ROW EXECUTE FUNCTION public.grant_client_for_external();