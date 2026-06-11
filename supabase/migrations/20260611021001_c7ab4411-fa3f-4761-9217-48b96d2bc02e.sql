
-- Workflow status enum
DO $$ BEGIN
  CREATE TYPE public.workable_status AS ENUM ('Draft','Preparer','LeadReview','ApproverSignoff','Approved','Rejected');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

-- Generic helper: updated_at trigger already exists (public.update_updated_at_column)

-- ============ PIA RECORDS ============
CREATE TABLE IF NOT EXISTS public.pia_records (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  engagement_id uuid NOT NULL REFERENCES public.engagements(id) ON DELETE CASCADE,
  title text NOT NULL DEFAULT 'Untitled PIA',
  type text NOT NULL DEFAULT 'Full',
  dps_status text NOT NULL DEFAULT 'New',
  scope text NOT NULL DEFAULT 'Individual',
  data jsonb NOT NULL DEFAULT '{}'::jsonb,
  status public.workable_status NOT NULL DEFAULT 'Draft',
  review_history jsonb NOT NULL DEFAULT '[]'::jsonb,
  created_by uuid REFERENCES auth.users(id),
  updated_by uuid REFERENCES auth.users(id),
  version integer NOT NULL DEFAULT 1,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.pia_records TO authenticated;
GRANT ALL ON public.pia_records TO service_role;
ALTER TABLE public.pia_records ENABLE ROW LEVEL SECURITY;
CREATE POLICY "pia_records member access" ON public.pia_records FOR ALL TO authenticated
  USING (public.is_engagement_member(auth.uid(), engagement_id) OR public.has_role(auth.uid(),'Admin'))
  WITH CHECK (public.is_engagement_member(auth.uid(), engagement_id) OR public.has_role(auth.uid(),'Admin'));
CREATE TRIGGER pia_records_updated_at BEFORE UPDATE ON public.pia_records
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- ============ DRL ROWS ============
CREATE TABLE IF NOT EXISTS public.drl_rows (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  engagement_id uuid NOT NULL REFERENCES public.engagements(id) ON DELETE CASCADE,
  category text NOT NULL,
  fields jsonb NOT NULL DEFAULT '{}'::jsonb,
  owner text,
  assignment text[] NOT NULL DEFAULT '{}',
  status public.workable_status NOT NULL DEFAULT 'Draft',
  review_history jsonb NOT NULL DEFAULT '[]'::jsonb,
  created_by uuid REFERENCES auth.users(id),
  updated_by uuid REFERENCES auth.users(id),
  version integer NOT NULL DEFAULT 1,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.drl_rows TO authenticated;
GRANT ALL ON public.drl_rows TO service_role;
ALTER TABLE public.drl_rows ENABLE ROW LEVEL SECURITY;
CREATE POLICY "drl_rows member access" ON public.drl_rows FOR ALL TO authenticated
  USING (public.is_engagement_member(auth.uid(), engagement_id) OR public.has_role(auth.uid(),'Admin'))
  WITH CHECK (public.is_engagement_member(auth.uid(), engagement_id) OR public.has_role(auth.uid(),'Admin'));
CREATE TRIGGER drl_rows_updated_at BEFORE UPDATE ON public.drl_rows
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- ============ INSPECTION RECORDS ============
CREATE TABLE IF NOT EXISTS public.inspection_records (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  engagement_id uuid NOT NULL REFERENCES public.engagements(id) ON DELETE CASCADE,
  title text NOT NULL DEFAULT 'Physical Inspection',
  data jsonb NOT NULL DEFAULT '{}'::jsonb,
  status public.workable_status NOT NULL DEFAULT 'Draft',
  review_history jsonb NOT NULL DEFAULT '[]'::jsonb,
  created_by uuid REFERENCES auth.users(id),
  updated_by uuid REFERENCES auth.users(id),
  version integer NOT NULL DEFAULT 1,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.inspection_records TO authenticated;
GRANT ALL ON public.inspection_records TO service_role;
ALTER TABLE public.inspection_records ENABLE ROW LEVEL SECURITY;
CREATE POLICY "inspection_records member access" ON public.inspection_records FOR ALL TO authenticated
  USING (public.is_engagement_member(auth.uid(), engagement_id) OR public.has_role(auth.uid(),'Admin'))
  WITH CHECK (public.is_engagement_member(auth.uid(), engagement_id) OR public.has_role(auth.uid(),'Admin'));
CREATE TRIGGER inspection_records_updated_at BEFORE UPDATE ON public.inspection_records
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- ============ TSA RECORDS ============
CREATE TABLE IF NOT EXISTS public.tsa_records (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  engagement_id uuid NOT NULL REFERENCES public.engagements(id) ON DELETE CASCADE,
  title text NOT NULL DEFAULT 'Technical Security Assessment',
  data jsonb NOT NULL DEFAULT '{}'::jsonb,
  status public.workable_status NOT NULL DEFAULT 'Draft',
  review_history jsonb NOT NULL DEFAULT '[]'::jsonb,
  created_by uuid REFERENCES auth.users(id),
  updated_by uuid REFERENCES auth.users(id),
  version integer NOT NULL DEFAULT 1,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.tsa_records TO authenticated;
GRANT ALL ON public.tsa_records TO service_role;
ALTER TABLE public.tsa_records ENABLE ROW LEVEL SECURITY;
CREATE POLICY "tsa_records member access" ON public.tsa_records FOR ALL TO authenticated
  USING (public.is_engagement_member(auth.uid(), engagement_id) OR public.has_role(auth.uid(),'Admin'))
  WITH CHECK (public.is_engagement_member(auth.uid(), engagement_id) OR public.has_role(auth.uid(),'Admin'));
CREATE TRIGGER tsa_records_updated_at BEFORE UPDATE ON public.tsa_records
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- ============ ROPA RECORDS ============
CREATE TABLE IF NOT EXISTS public.ropa_records (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  engagement_id uuid NOT NULL REFERENCES public.engagements(id) ON DELETE CASCADE,
  title text NOT NULL DEFAULT 'ROPA',
  data jsonb NOT NULL DEFAULT '{}'::jsonb,
  status public.workable_status NOT NULL DEFAULT 'Draft',
  review_history jsonb NOT NULL DEFAULT '[]'::jsonb,
  created_by uuid REFERENCES auth.users(id),
  updated_by uuid REFERENCES auth.users(id),
  version integer NOT NULL DEFAULT 1,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.ropa_records TO authenticated;
GRANT ALL ON public.ropa_records TO service_role;
ALTER TABLE public.ropa_records ENABLE ROW LEVEL SECURITY;
CREATE POLICY "ropa_records member access" ON public.ropa_records FOR ALL TO authenticated
  USING (public.is_engagement_member(auth.uid(), engagement_id) OR public.has_role(auth.uid(),'Admin'))
  WITH CHECK (public.is_engagement_member(auth.uid(), engagement_id) OR public.has_role(auth.uid(),'Admin'));
CREATE TRIGGER ropa_records_updated_at BEFORE UPDATE ON public.ropa_records
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- ============ CHANGE LOG ============
CREATE TABLE IF NOT EXISTS public.change_log (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  table_name text NOT NULL,
  record_id uuid NOT NULL,
  engagement_id uuid,
  user_id uuid REFERENCES auth.users(id),
  user_email text,
  action text NOT NULL,
  field_path text,
  old_value jsonb,
  new_value jsonb,
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT ON public.change_log TO authenticated;
GRANT ALL ON public.change_log TO service_role;
ALTER TABLE public.change_log ENABLE ROW LEVEL SECURITY;
CREATE POLICY "change_log read by engagement member or admin" ON public.change_log FOR SELECT TO authenticated
  USING (
    public.has_role(auth.uid(),'Admin')
    OR (engagement_id IS NOT NULL AND public.is_engagement_member(auth.uid(), engagement_id))
    OR user_id = auth.uid()
  );
CREATE POLICY "change_log insert system" ON public.change_log FOR INSERT TO authenticated WITH CHECK (true);
CREATE INDEX IF NOT EXISTS change_log_record_idx ON public.change_log(table_name, record_id, created_at DESC);
CREATE INDEX IF NOT EXISTS change_log_engagement_idx ON public.change_log(engagement_id, created_at DESC);

-- ============ CHANGE LOG TRIGGER ============
CREATE OR REPLACE FUNCTION public.log_workable_change()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_uid uuid := auth.uid();
  v_email text;
  v_eng uuid;
  k text;
  old_v jsonb;
  new_v jsonb;
BEGIN
  SELECT email INTO v_email FROM public.profiles WHERE user_id = v_uid;

  IF TG_OP = 'INSERT' THEN
    v_eng := NEW.engagement_id;
    INSERT INTO public.change_log(table_name, record_id, engagement_id, user_id, user_email, action, field_path, old_value, new_value)
    VALUES (TG_TABLE_NAME, NEW.id, v_eng, v_uid, v_email, 'insert', NULL, NULL, to_jsonb(NEW));
    RETURN NEW;
  ELSIF TG_OP = 'DELETE' THEN
    v_eng := OLD.engagement_id;
    INSERT INTO public.change_log(table_name, record_id, engagement_id, user_id, user_email, action, field_path, old_value, new_value)
    VALUES (TG_TABLE_NAME, OLD.id, v_eng, v_uid, v_email, 'delete', NULL, to_jsonb(OLD), NULL);
    RETURN OLD;
  ELSE
    v_eng := NEW.engagement_id;
    -- Status change
    IF NEW.status IS DISTINCT FROM OLD.status THEN
      INSERT INTO public.change_log(table_name, record_id, engagement_id, user_id, user_email, action, field_path, old_value, new_value)
      VALUES (TG_TABLE_NAME, NEW.id, v_eng, v_uid, v_email, 'status_change', 'status', to_jsonb(OLD.status::text), to_jsonb(NEW.status::text));
    END IF;
    -- Diff top-level keys of data jsonb
    IF (to_jsonb(NEW) ? 'data') AND (NEW.data IS DISTINCT FROM OLD.data) THEN
      FOR k IN SELECT jsonb_object_keys(NEW.data) UNION SELECT jsonb_object_keys(OLD.data) LOOP
        old_v := OLD.data -> k;
        new_v := NEW.data -> k;
        IF old_v IS DISTINCT FROM new_v THEN
          INSERT INTO public.change_log(table_name, record_id, engagement_id, user_id, user_email, action, field_path, old_value, new_value)
          VALUES (TG_TABLE_NAME, NEW.id, v_eng, v_uid, v_email, 'update', 'data.' || k, old_v, new_v);
        END IF;
      END LOOP;
    END IF;
    -- For drl_rows: diff fields jsonb and scalar columns
    IF TG_TABLE_NAME = 'drl_rows' THEN
      IF NEW.fields IS DISTINCT FROM OLD.fields THEN
        FOR k IN SELECT jsonb_object_keys(NEW.fields) UNION SELECT jsonb_object_keys(OLD.fields) LOOP
          old_v := OLD.fields -> k;
          new_v := NEW.fields -> k;
          IF old_v IS DISTINCT FROM new_v THEN
            INSERT INTO public.change_log(table_name, record_id, engagement_id, user_id, user_email, action, field_path, old_value, new_value)
            VALUES (TG_TABLE_NAME, NEW.id, v_eng, v_uid, v_email, 'update', 'fields.' || k, old_v, new_v);
          END IF;
        END LOOP;
      END IF;
      IF NEW.owner IS DISTINCT FROM OLD.owner THEN
        INSERT INTO public.change_log(table_name, record_id, engagement_id, user_id, user_email, action, field_path, old_value, new_value)
        VALUES (TG_TABLE_NAME, NEW.id, v_eng, v_uid, v_email, 'update', 'owner', to_jsonb(OLD.owner), to_jsonb(NEW.owner));
      END IF;
      IF NEW.assignment IS DISTINCT FROM OLD.assignment THEN
        INSERT INTO public.change_log(table_name, record_id, engagement_id, user_id, user_email, action, field_path, old_value, new_value)
        VALUES (TG_TABLE_NAME, NEW.id, v_eng, v_uid, v_email, 'update', 'assignment', to_jsonb(OLD.assignment), to_jsonb(NEW.assignment));
      END IF;
    END IF;
    -- Title change (where applicable)
    IF (to_jsonb(NEW) ? 'title') AND (NEW.title IS DISTINCT FROM OLD.title) THEN
      INSERT INTO public.change_log(table_name, record_id, engagement_id, user_id, user_email, action, field_path, old_value, new_value)
      VALUES (TG_TABLE_NAME, NEW.id, v_eng, v_uid, v_email, 'update', 'title', to_jsonb(OLD.title), to_jsonb(NEW.title));
    END IF;
    RETURN NEW;
  END IF;
END;
$$;

CREATE TRIGGER pia_records_log AFTER INSERT OR UPDATE OR DELETE ON public.pia_records
  FOR EACH ROW EXECUTE FUNCTION public.log_workable_change();
CREATE TRIGGER drl_rows_log AFTER INSERT OR UPDATE OR DELETE ON public.drl_rows
  FOR EACH ROW EXECUTE FUNCTION public.log_workable_change();
CREATE TRIGGER inspection_records_log AFTER INSERT OR UPDATE OR DELETE ON public.inspection_records
  FOR EACH ROW EXECUTE FUNCTION public.log_workable_change();
CREATE TRIGGER tsa_records_log AFTER INSERT OR UPDATE OR DELETE ON public.tsa_records
  FOR EACH ROW EXECUTE FUNCTION public.log_workable_change();
CREATE TRIGGER ropa_records_log AFTER INSERT OR UPDATE OR DELETE ON public.ropa_records
  FOR EACH ROW EXECUTE FUNCTION public.log_workable_change();

-- ============ REALTIME ============
ALTER PUBLICATION supabase_realtime ADD TABLE public.pia_records;
ALTER PUBLICATION supabase_realtime ADD TABLE public.drl_rows;
ALTER PUBLICATION supabase_realtime ADD TABLE public.inspection_records;
ALTER PUBLICATION supabase_realtime ADD TABLE public.tsa_records;
ALTER PUBLICATION supabase_realtime ADD TABLE public.ropa_records;
ALTER PUBLICATION supabase_realtime ADD TABLE public.change_log;
