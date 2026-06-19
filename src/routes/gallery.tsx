import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X } from "lucide-react";
import { PRODUCTS } from "@/data/showroom";

export const Route = createFileRoute("/gallery")({
  head: () => ({
    meta: [
      { title: "Gallery — Ayan Steel" },
      { name: "description", content: "A visual gallery of furniture and showroom moments from Ayan Steel, Katihar." },
    ],
  }),
  component: GalleryPage,
});

function GalleryPage() {
  // duplicate for masonry richness
  const images = [...PRODUCTS, ...PRODUCTS].map((p, i) => ({ ...p, key: `${p.id}-${i}` }));
  const [active, setActive] = useState<string | null>(null);

  return (
    <section className="container-luxe py-16 md:py-24">
      <header className="max-w-2xl">
        <span className="text-[11px] uppercase tracking-[0.3em] text-walnut">Visuals</span>
        <h1 className="mt-3 font-display text-5xl md:text-6xl leading-[1.02]">Gallery</h1>
        <p className="mt-4 text-muted-foreground">Click any image to view it full size.</p>
      </header>

      <div className="mt-12 columns-2 md:columns-3 lg:columns-4 gap-4 [&>*]:mb-4">
        {images.map((p, i) => (
          <motion.button
            key={p.key}
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.4, delay: (i % 8) * 0.05 }}
            onClick={() => setActive(p.image)}
            className="group block w-full overflow-hidden rounded-2xl border border-border bg-card"
          >
            <img
              src={p.image}
              alt={p.name}
              loading="lazy"
              className="w-full transition-transform duration-[1200ms] group-hover:scale-110"
            />
          </motion.button>
        ))}
      </div>

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
