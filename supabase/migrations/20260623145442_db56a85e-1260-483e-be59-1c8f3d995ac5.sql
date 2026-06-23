
-- Additive only. No drops, no updates to existing rows.

ALTER TABLE public.products
  ADD COLUMN IF NOT EXISTS length_cm numeric,
  ADD COLUMN IF NOT EXISTS breadth_cm numeric,
  ADD COLUMN IF NOT EXISTS width_cm numeric,
  ADD COLUMN IF NOT EXISTS height_cm numeric,
  ADD COLUMN IF NOT EXISTS warranty text DEFAULT '5 Years',
  ADD COLUMN IF NOT EXISTS rating numeric(2,1) DEFAULT 4.8,
  ADD COLUMN IF NOT EXISTS material text;

ALTER TABLE public.messages
  ADD COLUMN IF NOT EXISTS subject text;

-- Custom Work
CREATE TABLE IF NOT EXISTS public.custom_work (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  description text,
  image_url text,
  location text,
  display_order integer NOT NULL DEFAULT 0,
  is_active boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

GRANT SELECT ON public.custom_work TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.custom_work TO authenticated;
GRANT ALL ON public.custom_work TO service_role;

ALTER TABLE public.custom_work ENABLE ROW LEVEL SECURITY;

CREATE POLICY "View active custom work" ON public.custom_work
  FOR SELECT
  USING (is_active = true OR public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins manage custom work" ON public.custom_work
  FOR ALL
  TO authenticated
  USING (public.has_role(auth.uid(), 'admin'))
  WITH CHECK (public.has_role(auth.uid(), 'admin'));

DROP TRIGGER IF EXISTS update_custom_work_updated_at ON public.custom_work;
CREATE TRIGGER update_custom_work_updated_at
  BEFORE UPDATE ON public.custom_work
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Videos
CREATE TABLE IF NOT EXISTS public.videos (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  description text,
  video_type text NOT NULL DEFAULT 'youtube',
  video_url text NOT NULL,
  thumbnail_url text,
  display_order integer NOT NULL DEFAULT 0,
  is_active boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

GRANT SELECT ON public.videos TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.videos TO authenticated;
GRANT ALL ON public.videos TO service_role;

ALTER TABLE public.videos ENABLE ROW LEVEL SECURITY;

CREATE POLICY "View active videos" ON public.videos
  FOR SELECT
  USING (is_active = true OR public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins manage videos" ON public.videos
  FOR ALL
  TO authenticated
  USING (public.has_role(auth.uid(), 'admin'))
  WITH CHECK (public.has_role(auth.uid(), 'admin'));

DROP TRIGGER IF EXISTS update_videos_updated_at ON public.videos;
CREATE TRIGGER update_videos_updated_at
  BEFORE UPDATE ON public.videos
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
