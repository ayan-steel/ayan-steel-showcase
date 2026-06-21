import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { useSuspenseQuery } from "@tanstack/react-query";
import { Play } from "lucide-react";
import { featuredProductsQuery, type ShowroomProduct } from "@/lib/showroom-queries";
import { getSignedUrl } from "@/lib/storage";
import { ErrorState, NotFoundState } from "@/components/error-state";
import { PageHeaderSkeleton, TileGridSkeleton } from "@/components/skeletons";

export const Route = createFileRoute("/videos")({
  head: () => ({
    meta: [
      { title: "Product Videos — Ayan Steel" },
      { name: "description", content: "Watch product walkthroughs and showroom tours from Ayan Steel." },
    ],
  }),
  loader: ({ context }) => { context.queryClient.ensureQueryData(featuredProductsQuery); },
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

function VideoTile({ product }: { product: ShowroomProduct }) {
  const [src, setSrc] = useState("");
  useEffect(() => {
    let alive = true;
    if (!product.image) return;
    getSignedUrl(product.image).then((u) => { if (alive) setSrc(u); });
    return () => { alive = false; };
  }, [product.image]);

  return (
    <article className="group relative overflow-hidden rounded-3xl border border-border bg-card aspect-video">
      {src ? (
        <img src={src} alt={product.name} loading="lazy" className="absolute inset-0 h-full w-full object-cover" />
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
        <h3 className="font-display text-lg">{product.name}</h3>
        <p className="text-xs uppercase tracking-[0.18em] text-background/70">{product.category}</p>
      </div>
    </article>
  );
}

function VideosPage() {
  const { data: featured } = useSuspenseQuery(featuredProductsQuery);
  return (
    <section className="container-luxe py-16 md:py-24">
      <header className="max-w-2xl">
        <span className="text-[11px] uppercase tracking-[0.3em] text-walnut">Watch</span>
        <h1 className="mt-3 font-display text-5xl md:text-6xl leading-[1.02]">Product Videos</h1>
        <p className="mt-4 text-muted-foreground">
          Walkthroughs of featured pieces and tours of our Katihar showroom.
        </p>
      </header>

      {featured.length === 0 ? (
        <div className="mt-16 rounded-3xl border border-dashed border-border p-16 text-center text-muted-foreground">
          Videos will appear here once featured products are added from the admin panel.
        </div>
      ) : (
        <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {featured.map((p) => <VideoTile key={p.id} product={p} />)}
        </div>
      )}
    </section>
  );
}
