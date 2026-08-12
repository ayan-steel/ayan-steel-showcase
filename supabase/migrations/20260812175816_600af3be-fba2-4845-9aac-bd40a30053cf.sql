CREATE INDEX IF NOT EXISTS idx_products_active_order ON public.products (is_active, display_order, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_products_featured ON public.products (is_active, is_featured, display_order);
CREATE INDEX IF NOT EXISTS idx_products_slug ON public.products (slug);
CREATE INDEX IF NOT EXISTS idx_banners_active_order ON public.banners (is_active, display_order);
CREATE INDEX IF NOT EXISTS idx_categories_active_order ON public.categories (is_active, display_order);
CREATE INDEX IF NOT EXISTS idx_custom_work_active_order ON public.custom_work (is_active, display_order);