
-- Function: when a profile is created with admin@kpmg.com, auto-assign Admin role
CREATE OR REPLACE FUNCTION public.grant_admin_for_kpmg()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF lower(coalesce(NEW.email,'')) = 'admin@kpmg.com' THEN
    INSERT INTO public.user_roles (user_id, role)
    VALUES (NEW.user_id, 'Admin'::app_role)
    ON CONFLICT DO NOTHING;
  END IF;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_grant_admin_for_kpmg ON public.profiles;
CREATE TRIGGER trg_grant_admin_for_kpmg
AFTER INSERT ON public.profiles
FOR EACH ROW EXECUTE FUNCTION public.grant_admin_for_kpmg();

-- Backfill for any existing admin@kpmg.com profile
INSERT INTO public.user_roles (user_id, role)
SELECT user_id, 'Admin'::app_role FROM public.profiles
WHERE lower(email) = 'admin@kpmg.com'
ON CONFLICT DO NOTHING;
