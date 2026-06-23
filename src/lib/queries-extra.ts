import { queryOptions } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export type CustomWork = {
  id: string;
  title: string;
  description: string | null;
  image: string | null;
  location: string | null;
};

export type VideoItem = {
  id: string;
  title: string;
  description: string | null;
  type: "mp4" | "youtube";
  url: string;
  thumbnail: string | null;
};

export const customWorkQuery = queryOptions({
  queryKey: ["showroom", "custom_work"],
  queryFn: async (): Promise<CustomWork[]> => {
    const { data, error } = await supabase
      .from("custom_work")
      .select("id, title, description, image_url, location")
      .eq("is_active", true)
      .order("display_order")
      .order("created_at", { ascending: false });
    if (error) throw error;
    return (data ?? []).map((r) => ({
      id: r.id, title: r.title, description: r.description,
      image: r.image_url, location: r.location,
    }));
  },
  staleTime: 60_000,
});

export const videosQuery = queryOptions({
  queryKey: ["showroom", "videos"],
  queryFn: async (): Promise<VideoItem[]> => {
    const { data, error } = await supabase
      .from("videos")
      .select("id, title, description, video_type, video_url, thumbnail_url")
      .eq("is_active", true)
      .order("display_order")
      .order("created_at", { ascending: false });
    if (error) throw error;
    return (data ?? []).map((r) => ({
      id: r.id, title: r.title, description: r.description,
      type: (r.video_type === "mp4" ? "mp4" : "youtube") as "mp4" | "youtube",
      url: r.video_url, thumbnail: r.thumbnail_url,
    }));
  },
  staleTime: 60_000,
});

export function youtubeIdFromUrl(url: string): string | null {
  try {
    const u = new URL(url);
    if (u.hostname.includes("youtu.be")) return u.pathname.slice(1).split("/")[0] || null;
    if (u.hostname.includes("youtube.com")) {
      if (u.pathname.startsWith("/embed/")) return u.pathname.split("/")[2] || null;
      if (u.pathname.startsWith("/shorts/")) return u.pathname.split("/")[2] || null;
      return u.searchParams.get("v");
    }
  } catch { /* noop */ }
  return null;
}
