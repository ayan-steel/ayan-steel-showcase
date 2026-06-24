
-- Grants for existing public tables (RLS still enforces row access)
GRANT SELECT ON public.banners TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.banners TO authenticated;
GRANT ALL ON public.banners TO service_role;

GRANT SELECT ON public.brands TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.brands TO authenticated;
GRANT ALL ON public.brands TO service_role;

GRANT SELECT ON public.categories TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.categories TO authenticated;
GRANT ALL ON public.categories TO service_role;

GRANT SELECT ON public.custom_work TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.custom_work TO authenticated;
GRANT ALL ON public.custom_work TO service_role;

GRANT SELECT ON public.products TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.products TO authenticated;
GRANT ALL ON public.products TO service_role;

GRANT SELECT ON public.videos TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.videos TO authenticated;
GRANT ALL ON public.videos TO service_role;

GRANT INSERT ON public.messages TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.messages TO authenticated;
GRANT ALL ON public.messages TO service_role;

GRANT SELECT ON public.user_roles TO authenticated;
GRANT ALL ON public.user_roles TO service_role;

-- New: repair_services
CREATE TABLE IF NOT EXISTS public.repair_services (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  description text,
  before_image text,
  after_image text,
  display_order int NOT NULL DEFAULT 0,
  is_active boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

GRANT SELECT ON public.repair_services TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.repair_services TO authenticated;
GRANT ALL ON public.repair_services TO service_role;

ALTER TABLE public.repair_services ENABLE ROW LEVEL SECURITY;

CREATE POLICY "View active repair services" ON public.repair_services
  FOR SELECT TO public
  USING (is_active = true OR has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Admins manage repair services" ON public.repair_services
  FOR ALL TO authenticated
  USING (has_role(auth.uid(), 'admin'::app_role))
  WITH CHECK (has_role(auth.uid(), 'admin'::app_role));

CREATE TRIGGER update_repair_services_updated_at
  BEFORE UPDATE ON public.repair_services
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
