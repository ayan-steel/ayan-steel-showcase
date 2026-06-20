import { supabase } from "@/integrations/supabase/client";

const BUCKET = "showroom";
const cache = new Map<string, { url: string; expires: number }>();

export async function getSignedUrl(path: string | null | undefined): Promise<string> {
  if (!path) return "";
  if (path.startsWith("http") || path.startsWith("/")) return path;
  const cached = cache.get(path);
  if (cached && cached.expires > Date.now()) return cached.url;
  const { data, error } = await supabase.storage.from(BUCKET).createSignedUrl(path, 3600);
  if (error || !data) return "";
  cache.set(path, { url: data.signedUrl, expires: Date.now() + 3000 * 1000 });
  return data.signedUrl;
}

export async function uploadFile(file: File, folder: string): Promise<string> {
  const ext = file.name.split(".").pop() || "bin";
  const path = `${folder}/${crypto.randomUUID()}.${ext}`;
  const { error } = await supabase.storage.from(BUCKET).upload(path, file, {
    cacheControl: "3600",
    upsert: false,
  });
  if (error) throw error;
  return path;
}

export async function deleteFile(path: string): Promise<void> {
  if (!path || path.startsWith("http")) return;
  await supabase.storage.from(BUCKET).remove([path]);
}
