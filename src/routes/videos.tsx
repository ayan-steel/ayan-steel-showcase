import { createFileRoute } from "@tanstack/react-router";
import { Play } from "lucide-react";
import { PRODUCTS } from "@/data/showroom";

export const Route = createFileRoute("/videos")({
  head: () => ({
    meta: [
      { title: "Product Videos — Ayan Steel" },
      { name: "description", content: "Watch product walkthroughs and showroom tours from Ayan Steel." },
    ],
  }),
  component: VideosPage,
});

function VideosPage() {
  return (
    <section className="container-luxe py-16 md:py-24">
      <header className="max-w-2xl">
        <span className="text-[11px] uppercase tracking-[0.3em] text-walnut">Watch</span>
        <h1 className="mt-3 font-display text-5xl md:text-6xl leading-[1.02]">Product Videos</h1>
        <p className="mt-4 text-muted-foreground">
          Walkthroughs of featured pieces and tours of our Katihar showroom. Videos will appear here once uploaded from the admin panel.
        </p>
      </header>

      <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {PRODUCTS.slice(0, 6).map((p) => (
          <article
            key={p.id}
            className="group relative overflow-hidden rounded-3xl border border-border bg-card aspect-video"
          >
            <img src={p.image} alt={p.name} loading="lazy" className="absolute inset-0 h-full w-full object-cover" />
            <div className="absolute inset-0 bg-gradient-to-t from-foreground/80 via-foreground/30 to-transparent" />
            <div className="absolute inset-0 grid place-items-center">
              <div className="grid h-16 w-16 place-items-center rounded-full bg-background/95 text-foreground transition-transform group-hover:scale-110 shadow-[var(--shadow-luxe)]">
                <Play className="h-6 w-6 fill-current" />
              </div>
            </div>
            <div className="absolute inset-x-0 bottom-0 p-5 text-background">
              <h3 className="font-display text-lg">{p.name}</h3>
              <p className="text-xs uppercase tracking-[0.18em] text-background/70">{p.category}</p>
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}
