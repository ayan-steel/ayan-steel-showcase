import { queryOptions } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export type ShowroomProduct = {
  id: string;
  slug: string;
  name: string;
  description: string | null;
  price: number | null;
  salePrice: number | null;
  image: string | null; // first image path (storage) or URL
  images: string[];
  brand: string;
  category: string;
  isFeatured: boolean;
  badge?: string;
};

export type ShowroomCategory = {
  id: string;
  name: string;
  slug: string;
  image: string | null;
  description: string | null;
};

export type ShowroomBrand = {
  id: string;
  name: string;
  slug: string;
  logo: string | null;
  description: string | null;
};

export type ShowroomBanner = {
  id: string;
  title: string;
  subtitle: string | null;
  image: string;
  link: string | null;
};

function mapProduct(row: any): ShowroomProduct {
  const images: string[] = Array.isArray(row.images) ? row.images : [];
  return {
    id: row.id,
    slug: row.slug,
    name: row.name,
    description: row.description,
    price: row.price,
    salePrice: row.sale_price,
    image: images[0] ?? null,
    images,
    brand: row.brand?.name ?? "",
    category: row.category?.name ?? "",
    isFeatured: !!row.is_featured,
    badge: row.is_featured ? "Featured" : !row.in_stock ? "Sold Out" : undefined,
  };
}

export const productsQuery = queryOptions({
  queryKey: ["showroom", "products"],
  queryFn: async (): Promise<ShowroomProduct[]> => {
    const { data, error } = await supabase
      .from("products")
      .select("*, brand:brands(name), category:categories(name)")
      .eq("is_active", true)
      .order("display_order", { ascending: true })
      .order("created_at", { ascending: false });
    if (error) throw error;
    return (data ?? []).map(mapProduct);
  },
  staleTime: 30_000,
});

export const featuredProductsQuery = queryOptions({
  queryKey: ["showroom", "products", "featured"],
  queryFn: async (): Promise<ShowroomProduct[]> => {
    const { data, error } = await supabase
      .from("products")
      .select("*, brand:brands(name), category:categories(name)")
      .eq("is_active", true)
      .eq("is_featured", true)
      .order("display_order", { ascending: true })
      .limit(6);
    if (error) throw error;
    return (data ?? []).map(mapProduct);
  },
  staleTime: 30_000,
});

export const categoriesQuery = queryOptions({
  queryKey: ["showroom", "categories"],
  queryFn: async (): Promise<ShowroomCategory[]> => {
    const { data, error } = await supabase
      .from("categories")
      .select("id, name, slug, image_url, description")
      .eq("is_active", true)
      .order("display_order", { ascending: true })
      .order("name", { ascending: true });
    if (error) throw error;
    return (data ?? []).map((c) => ({
      id: c.id, name: c.name, slug: c.slug,
      image: c.image_url, description: c.description,
    }));
  },
  staleTime: 60_000,
});

export const brandsQuery = queryOptions({
  queryKey: ["showroom", "brands"],
  queryFn: async (): Promise<ShowroomBrand[]> => {
    const { data, error } = await supabase
      .from("brands")
      .select("id, name, slug, logo_url, description")
      .eq("is_active", true)
      .order("display_order", { ascending: true })
      .order("name", { ascending: true });
    if (error) throw error;
    return (data ?? []).map((b) => ({
      id: b.id, name: b.name, slug: b.slug,
      logo: b.logo_url, description: b.description,
    }));
  },
  staleTime: 60_000,
});

export const bannersQuery = queryOptions({
  queryKey: ["showroom", "banners"],
  queryFn: async (): Promise<ShowroomBanner[]> => {
    const { data, error } = await supabase
      .from("banners")
      .select("id, title, subtitle, image_url, link_url")
      .eq("is_active", true)
      .order("display_order", { ascending: true });
    if (error) throw error;
    return (data ?? []).map((b) => ({
      id: b.id, title: b.title, subtitle: b.subtitle,
      image: b.image_url, link: b.link_url,
    }));
  },
  staleTime: 60_000,
});
