import { createFileRoute, Link } from "@tanstack/react-router";
import { useSuspenseQuery } from "@tanstack/react-query";
import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { categoriesQuery, productsQuery } from "@/lib/showroom-queries";
import { getSignedUrl } from "@/lib/storage";
import { ErrorState, NotFoundState } from "@/components/error-state";
import { PageHeaderSkeleton, TileGridSkeleton } from "@/components/skeletons";

export const Route = createFileRoute("/categories")({
  head: () => ({
    meta: [
      { title: "Categories — Ayan Steel" },
      { name: "description", content: "Explore furniture and steel categories at Ayan Steel — almirahs, sofas, chairs, dining, office, hospital and custom furniture." },
    ],
  }),
  loader: ({ context }) => {
    context.queryClient.ensureQueryData(categoriesQuery);
    context.queryClient.ensureQueryData(productsQuery);
  },
  pendingMs: 0,
  pendingComponent: () => (
    <section className="container-luxe py-16 md:py-24">
      <PageHeaderSkeleton />
      <div className="mt-12"><TileGridSkeleton count={6} /></div>
    </section>
  ),
  errorComponent: ({ error }) => <ErrorState title="We couldn't load categories" error={error} />,
  notFoundComponent: () => <NotFoundState />,
  component: CategoriesPage,
});

function CategoryTile({ name, imagePath, index }: { name: string; imagePath: string | null; index: number }) {
  const [src, setSrc] = useState("");
  useEffect(() => {
    let alive = true;
    if (!imagePath) { setSrc(""); return; }
    getSignedUrl(imagePath).then((u) => { if (alive) setSrc(u); });
    return () => { alive = false; };
  }, [imagePath]);

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.4, delay: index * 0.03 }}
    >
      <Link
        to="/products"
        className="group relative block overflow-hidden rounded-3xl border border-border bg-card aspect-[5/4] hover:shadow-[var(--shadow-luxe)] transition-all"
      >
        {src ? (
          <img src={src} alt={name} loading="lazy" className="absolute inset-0 h-full w-full object-cover transition-transform duration-[1200ms] group-hover:scale-105" />
        ) : (
          <div className="absolute inset-0 bg-gradient-to-br from-secondary to-muted" />
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-foreground/85 via-foreground/30 to-transparent" />
        <div className="absolute inset-0 flex flex-col justify-end p-6 text-background">
          <h3 className="font-display text-2xl">{name}</h3>
          <span className="mt-1 text-xs uppercase tracking-[0.2em] text-background/70">Explore →</span>
        </div>
      </Link>
    </motion.div>
  );
}

function CategoriesPage() {
  const { data: categories } = useSuspenseQuery(categoriesQuery);
  const { data: products } = useSuspenseQuery(productsQuery);

  return (
    <section className="container-luxe py-16 md:py-24">
      <header className="max-w-2xl">
        <span className="text-[11px] uppercase tracking-[0.3em] text-walnut">Browse</span>
        <h1 className="mt-3 font-display text-5xl md:text-6xl leading-[1.02]">Categories</h1>
        <p className="mt-4 text-muted-foreground">Curated collections — pick a starting point.</p>
      </header>

      {categories.length === 0 ? (
        <div className="mt-16 rounded-3xl border border-dashed border-border p-16 text-center text-muted-foreground">
          No categories yet. Add some from the admin dashboard.
        </div>
      ) : (
        <div className="mt-12 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {categories.map((c, i) => {
            const sample = products.find((p) => p.category === c.name);
            const imagePath = c.image ?? sample?.image ?? null;
            return <CategoryTile key={c.id} name={c.name} imagePath={imagePath} index={i} />;
          })}
        </div>
      )}
    </section>
  );
}
