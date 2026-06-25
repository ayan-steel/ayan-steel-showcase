import { createFileRoute } from "@tanstack/react-router";
import { motion } from "framer-motion";

export const Route = createFileRoute("/about")({
  head: () => ({
    meta: [
      { title: "About Us — Ayan Steel" },
      { name: "description", content: "Ayan Steel is Katihar's premium furniture showroom — a family-run destination for steel and wooden furniture, custom built to your space." },
    ],
  }),
  component: AboutPage,
});

function AboutPage() {
  return (
    <>
      <section className="container-luxe py-16 md:py-24">
        <header className="max-w-3xl">
          <span className="text-[11px] uppercase tracking-[0.3em] text-walnut">Our Story</span>
          <h1 className="mt-3 font-display text-5xl md:text-7xl leading-[1.02] text-balance-tight">
            A showroom built on craft, trust, and quality.
          </h1>
        </header>

        <div className="mt-16 grid gap-12 lg:grid-cols-2 items-start">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="space-y-6 text-lg leading-relaxed text-muted-foreground"
          >
            <p>
              Ayan Steel was founded in Katihar with one quiet ambition: bring premium furniture
              within reach of every home, office and institution in our region — without compromise
              on quality.
            </p>
            <p>
              Whether you're furnishing a clinic, an office, a school or your dream home, our
              showroom team will help you choose, customise and install — with the kind of service
              you only get when the owner knows your name.
            </p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.15 }}
            className="grid grid-cols-2 gap-4"
          >
            {[
              ["19+", "Categories"],
              ["1000s", "Happy Customers"],
              ["1 yr", "Workmanship Warranty"],
              ["100%", "Quality Assured"],
            ].map(([n, l]) => (
              <div key={l} className="rounded-3xl border border-border bg-card p-8">
                <div className="font-display text-5xl text-walnut">{n}</div>
                <div className="mt-2 text-sm uppercase tracking-[0.2em] text-muted-foreground">{l}</div>
              </div>
            ))}
          </motion.div>
        </div>
      </section>
    </>
  );
}
