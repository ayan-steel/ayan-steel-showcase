import { createFileRoute, Link } from "@tanstack/react-router";
import { motion } from "framer-motion";
import { CATEGORIES, PRODUCTS } from "@/data/showroom";

export const Route = createFileRoute("/categories")({
  head: () => ({
    meta: [
      { title: "Categories — Ayan Steel" },
      { name: "description", content: "Explore furniture and steel categories at Ayan Steel — almirahs, sofas, chairs, dining, office, hospital and custom furniture." },
    ],
  }),
  component: CategoriesPage,
});

function CategoriesPage() {
  return (
    <section className="container-luxe py-16 md:py-24">
      <header className="max-w-2xl">
        <span className="text-[11px] uppercase tracking-[0.3em] text-walnut">Browse</span>
        <h1 className="mt-3 font-display text-5xl md:text-6xl leading-[1.02]">Categories</h1>
        <p className="mt-4 text-muted-foreground">Nineteen specialised collections — pick a starting point.</p>
      </header>

      <div className="mt-12 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {CATEGORIES.map((c, i) => {
          const sample = PRODUCTS.find((p) => p.category === c);
          return (
            <motion.div
              key={c}
              initial={{ opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.4, delay: i * 0.03 }}
            >
              <Link
                to="/products"
                className="group relative block overflow-hidden rounded-3xl border border-border bg-card aspect-[5/4] hover:shadow-[var(--shadow-luxe)] transition-all"
              >
                {sample ? (
                  <img src={sample.image} alt={c} loading="lazy" className="absolute inset-0 h-full w-full object-cover transition-transform duration-[1200ms] group-hover:scale-105" />
                ) : (
                  <div className="absolute inset-0 bg-gradient-to-br from-secondary to-muted" />
                )}
                <div className="absolute inset-0 bg-gradient-to-t from-foreground/85 via-foreground/30 to-transparent" />
                <div className="absolute inset-0 flex flex-col justify-end p-6 text-background">
                  <h3 className="font-display text-2xl">{c}</h3>
                  <span className="mt-1 text-xs uppercase tracking-[0.2em] text-background/70">Explore →</span>
                </div>
              </Link>
            </motion.div>
          );
        })}
      </div>
    </section>
  );
}
