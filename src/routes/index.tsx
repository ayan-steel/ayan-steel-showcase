import { createFileRoute, Link } from "@tanstack/react-router";
import { useSuspenseQuery } from "@tanstack/react-query";
import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { ArrowRight, Sparkles, Truck, ShieldCheck, Wrench, Star, MapPin } from "lucide-react";
import heroImage from "@/assets/hero-showroom.jpg";
import { ErrorState, NotFoundState } from "@/components/error-state";
import { HeroSkeleton, ProductGridSkeleton, ChipGridSkeleton, PageHeaderSkeleton } from "@/components/skeletons";
import { TESTIMONIALS, CONTACT } from "@/data/showroom";
import { ProductCard } from "@/components/product-card";
import {
  featuredProductsQuery,
  categoriesQuery,
  type ShowroomProduct,
  type ShowroomCategory,
} from "@/lib/showroom-queries";
import { customWorkQuery, type CustomWork } from "@/lib/queries-extra";
import { getSignedUrl } from "@/lib/storage";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Ayan Steel — Premium Furniture Showroom in Katihar, Bihar" },
      { name: "description", content: "Discover steel almirahs, executive chairs, sofas, dining tables and custom furniture at Ayan Steel — Katihar's premium furniture showroom." },
      { property: "og:title", content: "Ayan Steel — Premium Furniture Showroom" },
      { property: "og:description", content: "Premium furniture and steel solutions in Katihar, Bihar." },
    ],
    links: [{ rel: "preload", as: "image", href: heroImage, fetchpriority: "high" }],
  }),
  loader: ({ context }) => {
    context.queryClient.ensureQueryData(featuredProductsQuery);
    context.queryClient.ensureQueryData(categoriesQuery);
    context.queryClient.ensureQueryData(customWorkQuery);
  },
  pendingMs: 0,
  pendingComponent: HomePending,
  errorComponent: ({ error }) => <ErrorState title="We couldn't load the showroom" error={error} />,
  notFoundComponent: () => <NotFoundState />,
  component: Home,
});

function HomePending() {
  return (
    <>
      <HeroSkeleton />
      <section className="container-luxe py-24 md:py-32">
        <PageHeaderSkeleton />
        <div className="mt-12"><ProductGridSkeleton count={3} /></div>
      </section>
      <section className="bg-foreground py-24 md:py-32">
        <div className="container-luxe">
          <PageHeaderSkeleton />
          <div className="mt-12"><ChipGridSkeleton /></div>
        </div>
      </section>
    </>
  );
}

function Home() {
  const { data: featured } = useSuspenseQuery(featuredProductsQuery);
  const { data: categories } = useSuspenseQuery(categoriesQuery);
  const { data: customWork } = useSuspenseQuery(customWorkQuery);
  return (
    <>
      <Hero />
      <Marquee />
      <Featured products={featured} />
      <CategoriesSection categories={categories} />
      <WhyUs />
      <CustomWorkSection projects={customWork} />
      <Testimonials />
      <ContactCta />
    </>
  );
}

function Hero() {
  return (
    <section className="relative -mt-20 min-h-[100svh] overflow-hidden">
      <img
        src={heroImage}
        alt="Ayan Steel luxury furniture showroom"
        width={1920}
        height={1080}
        fetchPriority="high"
        className="absolute inset-0 h-full w-full object-cover"
      />
      <div className="absolute inset-0 bg-gradient-to-b from-foreground/30 via-foreground/40 to-foreground/70" />

      <div className="container-luxe relative flex min-h-[100svh] flex-col justify-end pb-24 pt-32 text-background">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1, ease: [0.22, 1, 0.36, 1] }}
          className="max-w-3xl"
        >
          <span className="inline-flex items-center gap-2 rounded-full border border-background/30 bg-background/10 backdrop-blur px-4 py-1.5 text-xs uppercase tracking-[0.25em]">
            <Sparkles className="h-3.5 w-3.5 text-accent" />
            Est. Katihar · Premium Showroom
          </span>
          <h1 className="mt-6 font-display text-5xl sm:text-6xl md:text-7xl lg:text-8xl leading-[0.95] text-balance-tight">
            Furniture that <em className="not-italic text-accent">defines</em> your space.
          </h1>
          <p className="mt-6 max-w-xl text-base md:text-lg text-background/80 leading-relaxed">
            Steel almirahs, executive seating, dining sets, sofas and custom-built pieces —
            curated from India's most trusted brands and our own atelier.
          </p>
          <div className="mt-8 flex flex-wrap gap-3">
            <Link
              to="/products"
              className="inline-flex items-center gap-2 rounded-full bg-background px-6 py-3.5 text-sm font-medium text-foreground transition-all hover:scale-[1.03] hover:shadow-[var(--shadow-gold)]"
            >
              Explore Collection <ArrowRight className="h-4 w-4" />
            </Link>
            <Link
              to="/contact"
              className="inline-flex items-center gap-2 rounded-full border border-background/30 bg-background/5 backdrop-blur px-6 py-3.5 text-sm font-medium text-background transition-all hover:bg-background/15"
            >
              <MapPin className="h-4 w-4" /> Visit Showroom
            </Link>
          </div>
        </motion.div>
      </div>

      <motion.div
        initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 1.2 }}
        className="absolute bottom-6 left-1/2 -translate-x-1/2 text-[10px] uppercase tracking-[0.3em] text-background/60"
      >
        Scroll
      </motion.div>
    </section>
  );
}

function Marquee() {
  const items = ["Free Delivery in Katihar", "1-Year Workmanship Warranty", "EMI Available", "Custom Furniture", "19+ Categories", "Trusted Since Years"];
  return (
    <div className="border-y border-border bg-secondary/40 py-4 overflow-hidden">
      <div className="flex gap-12 animate-[scroll_40s_linear_infinite] whitespace-nowrap">
        {[...items, ...items, ...items].map((it, i) => (
          <span key={i} className="text-xs uppercase tracking-[0.25em] text-muted-foreground flex items-center gap-12">
            <span className="h-1 w-1 rounded-full bg-accent" /> {it}
          </span>
        ))}
      </div>
      <style>{`@keyframes scroll { from{transform:translateX(0)} to{transform:translateX(-33.333%)} }`}</style>
    </div>
  );
}

function SectionHeader({ eyebrow, title, sub }: { eyebrow: string; title: string; sub?: string }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-60px" }}
      transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
      className="mb-12 max-w-2xl"
    >
      <span className="text-[11px] uppercase tracking-[0.3em] text-walnut">{eyebrow}</span>
      <h2 className="mt-3 font-display text-4xl md:text-5xl leading-[1.05] text-balance-tight">{title}</h2>
      {sub && <p className="mt-4 text-muted-foreground leading-relaxed">{sub}</p>}
    </motion.div>
  );
}

function Featured({ products }: { products: ShowroomProduct[] }) {
  return (
    <section className="container-luxe py-24 md:py-32">
      <div className="flex items-end justify-between gap-6 flex-wrap">
        <SectionHeader
          eyebrow="Featured Collection"
          title="Hand-picked pieces, this season."
          sub="A rotating selection of bestsellers, new arrivals and showroom favourites."
        />
        <Link to="/products" className="text-sm font-medium hover:text-walnut gold-underline">
          See all products →
        </Link>
      </div>
      {products.length === 0 ? (
        <div className="rounded-3xl border border-dashed border-border p-16 text-center text-muted-foreground">
          No featured products yet. Add some from the admin dashboard.
        </div>
      ) : (
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {products.map((p, i) => <ProductCard key={p.id} product={p} index={i} />)}
        </div>
      )}
    </section>
  );
}

function CategoriesSection({ categories }: { categories: ShowroomCategory[] }) {
  return (
    <section className="bg-foreground text-background py-24 md:py-32">
      <div className="container-luxe">
        <SectionHeader
          eyebrow="Shop by Category"
          title="From steel almirahs to walnut dining."
          sub="Carefully curated categories — there's a piece for every room and every purpose."
        />
        {categories.length === 0 ? (
          <p className="text-background/60">No categories yet.</p>
        ) : (
          <div className="grid gap-3 grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
            {categories.map((c, i) => (
              <motion.div
                key={c.id}
                initial={{ opacity: 0, y: 16 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.4, delay: i * 0.03 }}
              >
                <Link
                  to="/categories"
                  className="group block rounded-2xl border border-background/15 bg-background/[0.04] px-4 py-5 text-sm hover:bg-background/10 hover:border-accent/40 transition-all"
                >
                  <div className="flex items-center justify-between">
                    <span>{c.name}</span>
                    <ArrowRight className="h-3.5 w-3.5 opacity-0 group-hover:opacity-100 group-hover:translate-x-0.5 transition-all text-accent" />
                  </div>
                </Link>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}

function WhyUs() {
  const items = [
    { icon: ShieldCheck, title: "Trusted Quality", text: "Authentic brand-stocked merchandise and our own atelier-grade craftsmanship." },
    { icon: Truck, title: "Local Delivery", text: "Free delivery and installation across Katihar and surrounding districts." },
    { icon: Wrench, title: "Custom Built", text: "Bespoke dimensions, finishes and materials — built to your room." },
    { icon: Sparkles, title: "Honest Pricing", text: "Showroom prices that respect your budget. EMI options on most items." },
  ];
  return (
    <section className="container-luxe py-24 md:py-32">
      <SectionHeader eyebrow="Why Ayan Steel" title="A showroom built on trust." />
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        {items.map((it, i) => (
          <motion.div
            key={it.title}
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: i * 0.08 }}
            className="rounded-3xl border border-border bg-card p-7 hover:shadow-[var(--shadow-luxe)] hover:-translate-y-1 transition-all duration-500"
          >
            <div className="grid h-12 w-12 place-items-center rounded-2xl bg-foreground text-background">
              <it.icon className="h-5 w-5" />
            </div>
            <h3 className="mt-5 font-display text-xl">{it.title}</h3>
            <p className="mt-2 text-sm text-muted-foreground leading-relaxed">{it.text}</p>
          </motion.div>
        ))}
      </div>
    </section>
  );
}

function Brands({ brands }: { brands: ShowroomBrand[] }) {
  return (
    <section className="container-luxe pb-24 md:pb-32">
      <SectionHeader eyebrow="Brands We Carry" title="Names you already trust." />
      {brands.length === 0 ? (
        <p className="text-muted-foreground">No brands yet.</p>
      ) : (
        <div className="grid gap-3 grid-cols-2 md:grid-cols-4">
          {brands.map((b) => (
            <div key={b.id} className="rounded-2xl border border-border bg-card px-6 py-8 text-center font-display text-lg hover:border-accent transition-colors">
              {b.name}
            </div>
          ))}
        </div>
      )}
    </section>
  );
}

function Testimonials() {
  return (
    <section className="bg-secondary/50 py-24 md:py-32 border-y border-border">
      <div className="container-luxe">
        <SectionHeader eyebrow="From Our Customers" title="Stories from across Katihar." />
        <div className="grid gap-6 md:grid-cols-3">
          {TESTIMONIALS.map((t, i) => (
            <motion.blockquote
              key={t.name}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: i * 0.1 }}
              className="rounded-3xl bg-background p-8 border border-border"
            >
              <div className="flex gap-0.5 text-accent">
                {Array.from({ length: 5 }).map((_, i) => <Star key={i} className="h-4 w-4 fill-current" />)}
              </div>
              <p className="mt-4 font-display text-xl leading-snug">"{t.quote}"</p>
              <footer className="mt-6 text-sm">
                <div className="font-medium">{t.name}</div>
                <div className="text-muted-foreground">{t.role}</div>
              </footer>
            </motion.blockquote>
          ))}
        </div>
      </div>
    </section>
  );
}

function ContactCta() {
  return (
    <section className="container-luxe py-24 md:py-32">
      <div className="rounded-[2rem] bg-foreground text-background overflow-hidden grid lg:grid-cols-2">
        <div className="p-10 md:p-16">
          <span className="text-[11px] uppercase tracking-[0.3em] text-accent">Visit Us</span>
          <h2 className="mt-3 font-display text-4xl md:text-5xl">Come see it in person.</h2>
          <p className="mt-4 text-background/70 max-w-md leading-relaxed">
            Showroom visits are the best way to experience the craftsmanship. Walk in any day
            during business hours — chai included.
          </p>
          <div className="mt-8 space-y-2 text-sm">
            <div className="text-background/80">{CONTACT.address}</div>
            <div>
              <a href={`tel:${CONTACT.phone}`} className="text-accent hover:underline">{CONTACT.phone}</a>
              <span className="text-background/40"> · </span>
              <a href={`tel:${CONTACT.altPhone}`} className="text-accent hover:underline">{CONTACT.altPhone}</a>
            </div>
          </div>
          <div className="mt-8 flex gap-3">
            <Link to="/contact" className="rounded-full bg-background text-foreground px-6 py-3 text-sm font-medium hover:scale-[1.03] transition">
              Get directions
            </Link>
            <a href={`https://wa.me/${CONTACT.whatsapp}`} target="_blank" rel="noreferrer" className="rounded-full border border-background/30 px-6 py-3 text-sm font-medium hover:bg-background/10 transition">
              WhatsApp us
            </a>
          </div>
        </div>
        <div className="bg-background/5 border-l border-background/10 min-h-[300px]">
          <iframe
            title="Ayan Steel location"
            src={`https://www.google.com/maps?q=${encodeURIComponent(CONTACT.mapsQuery)}&output=embed`}
            className="h-full w-full min-h-[300px] grayscale"
            loading="lazy"
          />
        </div>
      </div>
    </section>
  );
}
