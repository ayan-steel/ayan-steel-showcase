import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { useSuspenseQuery } from "@tanstack/react-query";
import { motion, AnimatePresence } from "framer-motion";
import { X } from "lucide-react";
import { productsQuery, type ShowroomProduct } from "@/lib/showroom-queries";
import { getSignedUrl } from "@/lib/storage";
import { ErrorState, NotFoundState } from "@/components/error-state";
import { PageHeaderSkeleton } from "@/components/skeletons";
import { Skeleton } from "@/components/ui/skeleton";

export const Route = createFileRoute("/gallery")({
  head: () => ({
    meta: [
      { title: "Gallery — Ayan Steel" },
      { name: "description", content: "A visual gallery of furniture and showroom moments from Ayan Steel, Katihar." },
    ],
  }),
  loader: ({ context }) => { context.queryClient.ensureQueryData(productsQuery); },
  pendingMs: 0,
  pendingComponent: () => (
    <section className="container-luxe py-16 md:py-24">
      <PageHeaderSkeleton />
      <div className="mt-12 columns-2 md:columns-3 lg:columns-4 gap-4 [&>*]:mb-4">
        {[280, 360, 220, 320, 260, 340, 300, 240].map((h, i) => (
          <Skeleton key={i} className="w-full rounded-2xl" style={{ height: h }} />
        ))}
      </div>
    </section>
  ),
  errorComponent: ({ error }) => <ErrorState title="We couldn't load the gallery" error={error} />,
  notFoundComponent: () => <NotFoundState />,
  component: GalleryPage,
});

function GalleryThumb({ path, name, onClick, index }: { path: string; name: string; onClick: (url: string) => void; index: number }) {
  const [src, setSrc] = useState("");
  useEffect(() => {
    let alive = true;
    getSignedUrl(path).then((u) => { if (alive) setSrc(u); });
    return () => { alive = false; };
  }, [path]);
  if (!src) return null;
  return (
    <motion.button
      initial={{ opacity: 0, y: 16 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.4, delay: (index % 8) * 0.05 }}
      onClick={() => onClick(src)}
      className="group block w-full overflow-hidden rounded-2xl border border-border bg-card"
    >
      <img src={src} alt={name} loading="lazy" className="w-full transition-transform duration-[1200ms] group-hover:scale-110" />
    </motion.button>
  );
}

function GalleryPage() {
  const { data: products } = useSuspenseQuery(productsQuery);
  const items: { key: string; path: string; name: string }[] = [];
  products.forEach((p: ShowroomProduct) => {
    p.images.forEach((path, i) => items.push({ key: `${p.id}-${i}`, path, name: p.name }));
  });
  const [active, setActive] = useState<string | null>(null);

  return (
    <section className="container-luxe py-16 md:py-24">
      <header className="max-w-2xl">
        <span className="text-[11px] uppercase tracking-[0.3em] text-walnut">Visuals</span>
        <h1 className="mt-3 font-display text-5xl md:text-6xl leading-[1.02]">Gallery</h1>
        <p className="mt-4 text-muted-foreground">Click any image to view it full size.</p>
      </header>

      {items.length === 0 ? (
        <div className="mt-16 rounded-3xl border border-dashed border-border p-16 text-center text-muted-foreground">
          The gallery will fill up as products are added from the admin dashboard.
        </div>
      ) : (
        <div className="mt-12 columns-2 md:columns-3 lg:columns-4 gap-4 [&>*]:mb-4">
          {items.map((it, i) => (
            <GalleryThumb key={it.key} path={it.path} name={it.name} onClick={setActive} index={i} />
          ))}
        </div>
      )}

      <AnimatePresence>
        {active && (
          <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            onClick={() => setActive(null)}
            className="fixed inset-0 z-[60] grid place-items-center bg-foreground/90 backdrop-blur-sm p-6"
          >
            <button
              className="absolute right-6 top-6 grid h-11 w-11 place-items-center rounded-full bg-background text-foreground"
              onClick={() => setActive(null)}
              aria-label="Close"
            >
              <X className="h-5 w-5" />
            </button>
            <motion.img
              initial={{ scale: 0.92 }} animate={{ scale: 1 }} exit={{ scale: 0.92 }}
              transition={{ duration: 0.3 }}
              src={active}
              alt=""
              className="max-h-[90vh] max-w-[92vw] rounded-2xl shadow-2xl"
              onClick={(e) => e.stopPropagation()}
            />
          </motion.div>
        )}
      </AnimatePresence>
    </section>
  );
}
