import { createFileRoute } from "@tanstack/react-router";
import { useSuspenseQuery } from "@tanstack/react-query";
import { motion } from "framer-motion";
import { brandsQuery, productsQuery } from "@/lib/showroom-queries";

export const Route = createFileRoute("/brands")({
  head: () => ({
    meta: [
      { title: "Brands — Ayan Steel" },
      { name: "description", content: "The brands we carry at Ayan Steel's Katihar showroom." },
    ],
  }),
  loader: ({ context }) => {
    context.queryClient.ensureQueryData(brandsQuery);
    context.queryClient.ensureQueryData(productsQuery);
  },
  errorComponent: ({ error }) => <div className="container-luxe py-24 text-center text-muted-foreground">{error.message}</div>,
  notFoundComponent: () => <div className="container-luxe py-24 text-center">Not found.</div>,
  component: BrandsPage,
});

function BrandsPage() {
  const { data: brands } = useSuspenseQuery(brandsQuery);
  const { data: products } = useSuspenseQuery(productsQuery);

  return (
    <section className="container-luxe py-16 md:py-24">
      <header className="max-w-2xl">
        <span className="text-[11px] uppercase tracking-[0.3em] text-walnut">Trusted Partners</span>
        <h1 className="mt-3 font-display text-5xl md:text-6xl leading-[1.02]">Our Brands</h1>
        <p className="mt-4 text-muted-foreground">
          We stock India's most-loved furniture brands alongside our own atelier line.
        </p>
      </header>

      {brands.length === 0 ? (
        <div className="mt-16 rounded-3xl border border-dashed border-border p-16 text-center text-muted-foreground">
          No brands yet. Add some from the admin dashboard.
        </div>
      ) : (
        <div className="mt-12 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {brands.map((b, i) => {
            const count = products.filter((p) => p.brand === b.name).length;
            return (
              <motion.article
                key={b.id}
                initial={{ opacity: 0, y: 16 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.4, delay: i * 0.05 }}
                className="rounded-3xl border border-border bg-card p-8 hover:shadow-[var(--shadow-luxe)] hover:-translate-y-1 transition-all"
              >
                <h3 className="font-display text-2xl">{b.name}</h3>
                <p className="mt-2 text-sm text-muted-foreground">{count} product{count !== 1 ? "s" : ""} in store</p>
                <div className="mt-6 h-px bg-gradient-to-r from-accent/40 to-transparent" />
                <p className="mt-4 text-sm leading-relaxed text-muted-foreground">
                  {b.description ?? `Curated selections from ${b.name}, available at our Katihar showroom with full warranty and authorised service.`}
                </p>
              </motion.article>
            );
          })}
        </div>
      )}
    </section>
  );
}
