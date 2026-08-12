import { supabase } from "@/integrations/supabase/client";

const BUCKET = "showroom";
const TTL = 3600;
const cache = new Map<string, { url: string; expires: number }>();

// In-flight promises keyed by path so the same image is never signed twice.
const pending = new Map<string, Promise<string>>();

// Micro-batching: collect paths requested in the same tick and sign them in one request.
let queue: string[] = [];
let resolvers = new Map<string, ((url: string) => void)[]>();
let flushTimer: ReturnType<typeof setTimeout> | null = null;

async function flush() {
  flushTimer = null;
  const paths = queue;
  const waiters = resolvers;
  queue = [];
  resolvers = new Map();
  if (paths.length === 0) return;

  const finish = (path: string, url: string) => {
    if (url) cache.set(path, { url, expires: Date.now() + (TTL - 600) * 1000 });
    pending.delete(path);
    (waiters.get(path) ?? []).forEach((r) => r(url));
  };

  try {
    const { data, error } = await supabase.storage.from(BUCKET).createSignedUrls(paths, TTL);
    if (error || !data) {
      paths.forEach((p) => finish(p, ""));
      return;
    }
    const byPath = new Map<string, string>();
    data.forEach((d: any) => {
      if (d?.path && d?.signedUrl) byPath.set(d.path, d.signedUrl);
    });
    paths.forEach((p) => finish(p, byPath.get(p) ?? ""));
  } catch {
    paths.forEach((p) => finish(p, ""));
  }
}

export async function getSignedUrl(path: string | null | undefined): Promise<string> {
  if (!path) return "";
  if (path.startsWith("http") || path.startsWith("/") || path.startsWith("data:")) return path;

  const cached = cache.get(path);
  if (cached && cached.expires > Date.now()) return cached.url;

  const inFlight = pending.get(path);
  if (inFlight) return inFlight;

  const promise = new Promise<string>((resolve) => {
    const list = resolvers.get(path);
    if (list) {
      list.push(resolve);
    } else {
      resolvers.set(path, [resolve]);
      queue.push(path);
    }
    if (!flushTimer) flushTimer = setTimeout(flush, 16);
  });
  pending.set(path, promise);
  return promise;
}

export async function getSignedUrls(paths: (string | null | undefined)[]): Promise<string[]> {
  return Promise.all(paths.map((p) => getSignedUrl(p)));
}

export async function uploadFile(file: File, folder: string): Promise<string> {
  const ext = (file.name.split(".").pop() || "bin").toLowerCase();
  const path = `${folder}/${crypto.randomUUID()}.${ext}`;
  const { error } = await supabase.storage.from(BUCKET).upload(path, file, {
    cacheControl: "31536000",
    upsert: false,
  });
  if (error) throw error;
  return path;
}

export async function deleteFile(path: string): Promise<void> {
  if (!path || path.startsWith("http")) return;
  cache.delete(path);
  await supabase.storage.from(BUCKET).remove([path]);
}
