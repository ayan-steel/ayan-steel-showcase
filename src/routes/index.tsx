import { createFileRoute, Link } from "@tanstack/react-router";
import { useSuspenseQuery } from "@tanstack/react-query";
import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { ArrowRight, Sparkles, Truck, ShieldCheck, Wrench, Star, MapPin, BadgeIndianRupee, Store } from "lucide-react";
import heroImage from "@/assets/hero-showroom.jpg";
import { ErrorState, NotFoundState } from "@/components/error-state";
import { HeroSkeleton, ProductGridSkeleton, ChipGridSkeleton, PageHeaderSkeleton } from "@/components/skeletons";
import { TESTIMONIALS, CONTACT } from "@/data/showroom";
import { ProductCard } from "@/components/product-card";
import {
  homeProductsQuery,
  carouselProductsQuery,
  categoriesQuery,
  type ShowroomProduct,
  type ShowroomCategory,
} from "@/lib/showroom-queries";
import { customWorkQuery, type CustomWork } from "@/lib/queries-extra";
import { getSignedUrl } from "@/lib/storage";
import { FeaturedCarousel } from "@/components/featured-carousel";
import { BannerSection } from "@/components/banner-section";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Ayan Steel — Premium Furniture Showroom in Katihar, Bihar" },
      { name: "description", content: "Discover steel almirahs, executive chairs, sofas, dining tables and custom furniture at Ayan Steel — Katihar's premium furniture showroom." },
      { property: "og:title", content: "Ayan Steel — Premium Furniture Showroom" },
      { property: "og:description", content: "Premium furniture and steel solutions in Katihar, Bihar." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
    links: [{ rel: "preload", as: "image", href: heroImage, fetchpriority: "high" }],
  }),
  loader: ({ context }) => {
    context.queryClient.ensureQueryData(homeProductsQuery);
    context.queryClient.ensureQueryData(carouselProductsQuery);
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
        <div className="mt-12"><ProductGridSkeleton count={6} /></div>
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
  const { data: products } = useSuspenseQuery(homeProductsQuery);
  const { data: carouselProducts } = useSuspenseQuery(carouselProductsQuery);
  const { data: categories } = useSuspenseQuery(categoriesQuery);
  const { data: customWork } = useSuspenseQuery(customWorkQuery);
  return (
    <>
      <Hero />
      <Marquee />
      <Featured products={products} />
      <FeaturedCarousel products={carouselProducts} />
      <CategoriesSection categories={categories} />
      <WhyUs />
      <BannerSection />
      <CustomWorkCta />
      <CustomWorkSection projects={customWork} />
      <Testimonials />
      <ContactCta />
    </>
  );
}

function scrollToFeatured(e: React.MouseEvent) {
  e.preventDefault();
  document.getElementById("featured")?.scrollIntoView({ behavior: "smooth", block: "start" });
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
        className="hero-media absolute inset-0 h-full w-full object-cover"
      />
      <div className="hero-scrim absolute inset-0" />

      <div className="hero-ink container-luxe relative flex min-h-[100svh] flex-col justify-end pb-28 pt-32">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1, ease: [0.22, 1, 0.36, 1] }}
          className="max-w-3xl"
        >
          <span className="hero-chip inline-flex items-center gap-2 rounded-full border backdrop-blur px-4 py-1.5 text-xs uppercase tracking-[0.25em]">
            <Sparkles className="h-3.5 w-3.5 text-accent" />
            Est. Katihar · Premium Showroom
          </span>
          <h1 className="mt-6 font-display text-5xl sm:text-6xl md:text-7xl lg:text-8xl leading-[0.95] text-balance-tight">
            Furniture that <em className="not-italic text-accent">defines</em> your space.
          </h1>
          <p className="hero-dim mt-6 max-w-xl text-base md:text-lg leading-relaxed">
            Discover quality steel furniture, elegant designs and custom-made pieces
            crafted for modern homes and businesses.
          </p>
          <div className="mt-9 flex flex-wrap gap-3">
            <a
              href="#featured"
              onClick={scrollToFeatured}
              className="hero-btn inline-flex items-center gap-2 rounded-full px-7 py-3.5 text-sm font-medium transition-all hover:scale-[1.03] hover:shadow-[var(--shadow-gold)]"
            >
              Explore Products <ArrowRight className="h-4 w-4" />
            </a>
            <Link
              to="/contact"
              className="hero-chip inline-flex items-center gap-2 rounded-full border backdrop-blur px-7 py-3.5 text-sm font-medium transition-all"
            >
              <MapPin className="h-4 w-4" /> Visit Showroom
            </Link>
          </div>
        </motion.div>
      </div>

      <motion.div
        initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 1.2 }}
        className="hero-ink hero-dimmer absolute bottom-6 left-1/2 -translate-x-1/2 text-[10px] uppercase tracking-[0.3em]"
      >
        Scroll
      </motion.div>
    </section>
  );
}

function Marquee() {
  const items = ["Free Delivery in Katihar", "1-Year Workmanship Warranty", "EMI Available", "Custom Furniture", "19+ Categories", "Trusted Local Showroom"];
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

function SectionHeader({ eyebrow, title, sub, invert }: { eyebrow: string; title: string; sub?: string; invert?: boolean }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-60px" }}
      transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
      className="mb-12 max-w-2xl"
    >
      <span className={`text-[11px] uppercase tracking-[0.3em] ${invert ? "text-accent" : "text-walnut"}`}>{eyebrow}</span>
      <h2 className="mt-3 font-display text-4xl md:text-5xl leading-[1.05] text-balance-tight">{title}</h2>
      {sub && <p className={`mt-4 leading-relaxed ${invert ? "text-background/70" : "text-muted-foreground"}`}>{sub}</p>}
    </motion.div>
  );
}

function Featured({ products }: { products: ShowroomProduct[] }) {
  return (
    <section id="featured" className="container-luxe scroll-mt-24 py-20 md:py-28">
      <div className="flex items-end justify-between gap-6 flex-wrap">
        <SectionHeader
          eyebrow="Explore Our Collection"
          title="Featured pieces, ready to view."
          sub="Real showroom stock — tap any piece to see full specifications, dimensions and pricing."
        />
        <Link to="/products" className="text-sm font-medium hover:text-walnut gold-underline">
          See all products →
        </Link>
      </div>
      {products.length === 0 ? (
        <div className="rounded-3xl border border-dashed border-border p-16 text-center text-muted-foreground">
          No products yet. Add some from the admin dashboard.
        </div>
      ) : (
        <>
          <div className="grid gap-5 sm:gap-6 grid-cols-2 lg:grid-cols-4">
            {products.map((p, i) => <ProductCard key={p.id} product={p} index={i} />)}
          </div>
          <div className="mt-12 flex justify-center">
            <Link
              to="/products"
              className="inline-flex items-center gap-2 rounded-full bg-foreground px-8 py-4 text-sm font-medium text-background transition-all hover:scale-[1.03] hover:shadow-[var(--shadow-luxe)]"
            >
              View All Products <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </>
      )}
    </section>
  );
}

function CategoryTile({ category, index }: { category: ShowroomCategory; index: number }) {
  const [src, setSrc] = useState("");
  useEffect(() => {
    let alive = true;
    if (!category.image) { setSrc(""); return; }
    getSignedUrl(category.image).then((u) => { if (alive) setSrc(u); });
    return () => { alive = false; };
  }, [category.image]);

  return (
    <motion.div
      initial={{ opacity: 0, y: 18 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.5, delay: (index % 8) * 0.05 }}
    >
      <Link
        to="/categories/$slug"
        params={{ slug: category.slug }}
        className="group relative flex aspect-[4/3] flex-col justify-end overflow-hidden rounded-3xl border border-background/15 bg-background/[0.04] p-5 transition-all hover:border-accent/40"
      >
        {src ? (
          <img
            src={src}
            alt={category.name}
            loading="lazy"
            decoding="async"
            className="absolute inset-0 h-full w-full object-cover opacity-70 transition-transform duration-[1200ms] group-hover:scale-105"
          />
        ) : (
          <div className="absolute inset-0 bg-gradient-to-br from-background/10 to-background/[0.02]" />
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-foreground/85 via-foreground/25 to-transparent" />
        <div className="relative flex items-center justify-between gap-2">
          <span className="font-display text-lg leading-tight">{category.name}</span>
          <ArrowRight className="h-4 w-4 shrink-0 text-accent transition-transform group-hover:translate-x-0.5" />
        </div>
      </Link>
    </motion.div>
  );
}

function CategoriesSection({ categories }: { categories: ShowroomCategory[] }) {
  return (
    <section className="bg-foreground text-background py-24 md:py-32">
      <div className="container-luxe">
        <SectionHeader
          invert
          eyebrow="Browse by Category"
          title="From steel almirahs to walnut dining."
          sub="Carefully curated categories — there's a piece for every room and every purpose."
        />
        {categories.length === 0 ? (
          <p className="text-background/60">No categories yet.</p>
        ) : (
          <div className="grid gap-4 grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
            {categories.map((c, i) => <CategoryTile key={c.id} category={c} index={i} />)}
          </div>
        )}
      </div>
    </section>
  );
}

function WhyUs() {
  const items = [
    { icon: ShieldCheck, title: "Quality Steel Furniture", text: "Durable, well-finished steel and wood pieces built to last." },
    { icon: Wrench, title: "Custom Furniture Available", text: "Bespoke dimensions, finishes and materials — built to your room." },
    { icon: BadgeIndianRupee, title: "EMI Available", text: "Flexible EMI options on most items so budgets stay comfortable." },
    { icon: Sparkles, title: "Workmanship Warranty", text: "1-year workmanship warranty on our own atelier-built pieces." },
    { icon: Store, title: "Trusted Local Showroom", text: "Visit us in Katihar and see every piece in person before buying." },
    { icon: Truck, title: "Local Delivery", text: "Delivery and installation across Katihar and nearby districts." },
  ];
  return (
    <section className="container-luxe py-24 md:py-32">
      <SectionHeader eyebrow="Why Ayan Steel" title="A showroom built on trust." />
      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {items.map((it, i) => (
          <motion.div
            key={it.title}
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: i * 0.07 }}
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

function CustomWorkCta() {
  return (
    <section className="container-luxe pb-24 md:pb-32">
      <motion.div
        initial={{ opacity: 0, y: 24 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: "-80px" }}
        transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
        className="relative overflow-hidden rounded-[2rem] border border-border bg-secondary/50 px-8 py-14 md:px-16 md:py-20 text-center"
      >
        <div className="pointer-events-none absolute -right-24 -top-24 h-64 w-64 rounded-full bg-accent/15 blur-3xl" />
        <span className="text-[11px] uppercase tracking-[0.3em] text-walnut">Custom Furniture</span>
        <h2 className="mx-auto mt-3 max-w-2xl font-display text-4xl md:text-5xl leading-[1.05] text-balance-tight">
          Can't find what you're looking for?
        </h2>
        <p className="mx-auto mt-4 max-w-xl text-muted-foreground leading-relaxed">
          Get furniture designed specifically for your space and requirements — measured,
          finished and installed by our own team.
        </p>
        <div className="mt-8 flex flex-wrap justify-center gap-3">
          <Link to="/custom-work" className="inline-flex items-center gap-2 rounded-full bg-foreground px-7 py-3.5 text-sm font-medium text-background transition-all hover:scale-[1.03] hover:shadow-[var(--shadow-luxe)]">
            Request Custom Work <ArrowRight className="h-4 w-4" />
          </Link>
          <Link to="/contact" className="inline-flex items-center gap-2 rounded-full border border-border px-7 py-3.5 text-sm font-medium transition-all hover:bg-background">
            Contact Us
          </Link>
        </div>
      </motion.div>
    </section>
  );
}

function CustomWorkSection({ projects }: { projects: CustomWork[] }) {
  if (projects.length === 0) return null;
  return (
    <section className="container-luxe pb-24 md:pb-32">
      <div className="flex items-end justify-between gap-6 flex-wrap">
        <SectionHeader eyebrow="Custom Work" title="Built to your space." sub="Bespoke projects we've delivered for homes, offices, clinics and institutions." />
        <Link to="/custom-work" className="text-sm font-medium hover:text-walnut gold-underline">See all projects →</Link>
      </div>
      <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
        {projects.slice(0, 6).map((p, i) => <CustomWorkTile key={p.id} project={p} index={i} />)}
      </div>
    </section>
  );
}

function CustomWorkTile({ project, index }: { project: CustomWork; index: number }) {
  const [src, setSrc] = useState("");
  useEffect(() => {
    let alive = true;
    if (!project.image) { setSrc(""); return; }
    getSignedUrl(project.image).then((u) => { if (alive) setSrc(u); });
    return () => { alive = false; };
  }, [project.image]);
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}
      transition={{ duration: 0.5, delay: index * 0.05 }}
    >
      <Link to="/custom-work" className="group relative block overflow-hidden rounded-3xl border border-border bg-card aspect-[4/3] hover:shadow-[var(--shadow-luxe)] transition-all">
        {src ? (
          <img src={src} alt={project.title} loading="lazy" decoding="async" className="absolute inset-0 h-full w-full object-cover transition-transform duration-[1200ms] group-hover:scale-105" />
        ) : (
          <div className="absolute inset-0 bg-gradient-to-br from-secondary to-muted" />
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-foreground/80 via-transparent to-transparent" />
        <div className="absolute inset-x-0 bottom-0 p-5 text-background">
          <h3 className="font-display text-xl leading-tight">{project.title}</h3>
          {project.location && <p className="text-xs uppercase tracking-[0.2em] text-background/70 mt-1">{project.location}</p>}
        </div>
      </Link>
    </motion.div>
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
            during business hours.
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
