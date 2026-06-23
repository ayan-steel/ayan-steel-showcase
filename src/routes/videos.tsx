import { createFileRoute } from "@tanstack/react-router";
import { useSuspenseQuery } from "@tanstack/react-query";
import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Play, X } from "lucide-react";
import { videosQuery, youtubeIdFromUrl, type VideoItem } from "@/lib/queries-extra";
import { getSignedUrl } from "@/lib/storage";
import { ErrorState, NotFoundState } from "@/components/error-state";
import { PageHeaderSkeleton, TileGridSkeleton } from "@/components/skeletons";

export const Route = createFileRoute("/videos")({
  head: () => ({
    meta: [
      { title: "Product Videos — Ayan Steel" },
      { name: "description", content: "Watch product walkthroughs and showroom tours from Ayan Steel, Katihar." },
    ],
  }),
  loader: ({ context }) => { context.queryClient.ensureQueryData(videosQuery); },
  pendingMs: 0,
  pendingComponent: () => (
    <section className="container-luxe py-16 md:py-24">
      <PageHeaderSkeleton />
      <div className="mt-12"><TileGridSkeleton count={6} aspect="aspect-video" /></div>
    </section>
  ),
  errorComponent: ({ error }) => <ErrorState title="We couldn't load videos" error={error} />,
  notFoundComponent: () => <NotFoundState />,
  component: VideosPage,
});

function VideoTile({ video, onPlay, index }: { video: VideoItem; onPlay: (v: VideoItem) => void; index: number }) {
  const [thumb, setThumb] = useState("");
  useEffect(() => {
    let alive = true;
    async function load() {
      if (video.thumbnail) {
        const u = await getSignedUrl(video.thumbnail);
        if (alive) setThumb(u);
      } else if (video.type === "youtube") {
        const id = youtubeIdFromUrl(video.url);
        if (id && alive) setThumb(`https://i.ytimg.com/vi/${id}/hqdefault.jpg`);
      }
    }
    load();
    return () => { alive = false; };
  }, [video.id]);
  return (
    <motion.button
      initial={{ opacity: 0, y: 16 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.4, delay: (index % 6) * 0.05 }}
      onClick={() => onPlay(video)}
      className="group relative block overflow-hidden rounded-3xl border border-border bg-card aspect-video text-left w-full"
    >
      {thumb ? (
        <img src={thumb} alt={video.title} loading="lazy" decoding="async" className="absolute inset-0 h-full w-full object-cover transition-transform duration-[1200ms] group-hover:scale-105" />
      ) : (
        <div className="absolute inset-0 bg-gradient-to-br from-secondary to-muted" />
      )}
      <div className="absolute inset-0 bg-gradient-to-t from-foreground/80 via-foreground/30 to-transparent" />
      <div className="absolute inset-0 grid place-items-center">
        <div className="grid h-16 w-16 place-items-center rounded-full bg-background/95 text-foreground transition-transform group-hover:scale-110 shadow-[var(--shadow-luxe)]">
          <Play className="h-6 w-6 fill-current" />
        </div>
      </div>
      <div className="absolute inset-x-0 bottom-0 p-5 text-background">
        <h3 className="font-display text-lg leading-tight">{video.title}</h3>
        {video.description && <p className="text-xs text-background/80 line-clamp-1">{video.description}</p>}
      </div>
    </motion.button>
  );
}

function VideoModal({ video, onClose }: { video: VideoItem; onClose: () => void }) {
  const [src, setSrc] = useState("");
  useEffect(() => {
    let alive = true;
    if (video.type === "mp4") {
      getSignedUrl(video.url).then((u) => { if (alive) setSrc(u); });
    }
    return () => { alive = false; };
  }, [video.id]);

  const youtubeId = video.type === "youtube" ? youtubeIdFromUrl(video.url) : null;

  return (
    <motion.div
      initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
      onClick={onClose}
      className="fixed inset-0 z-[60] grid place-items-center bg-foreground/90 backdrop-blur-sm p-4"
    >
      <button onClick={onClose} className="absolute right-6 top-6 grid h-11 w-11 place-items-center rounded-full bg-background text-foreground" aria-label="Close">
        <X className="h-5 w-5" />
      </button>
      <motion.div
        initial={{ scale: 0.92 }} animate={{ scale: 1 }} exit={{ scale: 0.92 }}
        className="w-full max-w-5xl aspect-video rounded-2xl overflow-hidden bg-black shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        {video.type === "youtube" && youtubeId ? (
          <iframe
            src={`https://www.youtube.com/embed/${youtubeId}?autoplay=1`}
            title={video.title}
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
            className="h-full w-full"
          />
        ) : src ? (
          <video src={src} controls autoPlay className="h-full w-full" />
        ) : (
          <div className="h-full w-full grid place-items-center text-background/70">Loading…</div>
        )}
      </motion.div>
    </motion.div>
  );
}

function VideosPage() {
  const { data: videos } = useSuspenseQuery(videosQuery);
  const [playing, setPlaying] = useState<VideoItem | null>(null);
  return (
    <section className="container-luxe py-16 md:py-24">
      <header className="max-w-2xl">
        <span className="text-[11px] uppercase tracking-[0.3em] text-walnut">Watch</span>
        <h1 className="mt-3 font-display text-5xl md:text-6xl leading-[1.02]">Product Videos</h1>
        <p className="mt-4 text-muted-foreground">Walkthroughs of featured pieces and tours of our Katihar showroom.</p>
      </header>

      {videos.length === 0 ? (
        <div className="mt-16 rounded-3xl border border-dashed border-border p-16 text-center text-muted-foreground">
          Videos will appear here once the admin adds them.
        </div>
      ) : (
        <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {videos.map((v, i) => <VideoTile key={v.id} video={v} onPlay={setPlaying} index={i} />)}
        </div>
      )}

      <AnimatePresence>{playing && <VideoModal video={playing} onClose={() => setPlaying(null)} />}</AnimatePresence>
    </section>
  );
}
