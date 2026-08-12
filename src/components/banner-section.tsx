import { useEffect, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { AnimatePresence, motion } from "framer-motion";
import { Link } from "@tanstack/react-router";
import { bannersQuery, type ShowroomBanner } from "@/lib/showroom-queries";
import { getSignedUrls } from "@/lib/storage";

const ROTATE_MS = 5000;

function BannerFrame({ children }: { children: React.ReactNode }) {
  return (
    <section className="container-luxe py-8 md:py-12">
      <div className="relative overflow-hidden rounded-[2rem] border border-border bg-secondary/50 aspect-[16/7] sm:aspect-[16/6] md:aspect-[21/6]">
        {children}
      </div>
    </section>
  );
}

export function BannerSection() {
  const { data: banners = [], isLoading } = useQuery(bannersQuery);
  const [urls, setUrls] = useState<string[]>([]);
  const [index, setIndex] = useState(0);

  useEffect(() => {
    let alive = true;
    if (!banners.length) { setUrls([]); return; }
    getSignedUrls(banners.map((b) => b.image)).then((u) => { if (alive) setUrls(u); });
    return () => { alive = false; };
  }, [banners]);

  const slides = banners
    .map((b, i) => ({ banner: b, url: urls[i] }))
    .filter((s) => !!s.url) as { banner: ShowroomBanner; url: string }[];

  useEffect(() => {
    if (slides.length < 2) return;
    const t = setInterval(() => setIndex((i) => (i + 1) % slides.length), ROTATE_MS);
    return () => clearInterval(t);
  }, [slides.length]);

  if (isLoading) {
    return (
      <BannerFrame>
        <div className="absolute inset-0 animate-pulse bg-gradient-to-br from-secondary to-muted" />
      </BannerFrame>
    );
  }

  if (!banners.length) return null;

  if (!slides.length) {
    return (
      <BannerFrame>
        <div className="absolute inset-0 bg-gradient-to-br from-secondary to-muted" />
      </BannerFrame>
    );
  }

  const active = slides[Math.min(index, slides.length - 1)];
  const inner = (
    <>
      <AnimatePresence mode="sync">
        <motion.img
          key={active.url}
          src={active.url}
          alt={active.banner.title || "Ayan Steel banner"}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.6 }}
          loading="eager"
          decoding="async"
          fetchPriority="high"
          className="absolute inset-0 h-full w-full object-cover"
        />
      </AnimatePresence>
      {(active.banner.title || active.banner.subtitle) && (
        <div className="absolute inset-0 bg-gradient-to-r from-foreground/60 via-foreground/20 to-transparent" />
      )}
      <div className="absolute inset-0 flex flex-col justify-center gap-1 p-6 md:p-12 text-background">
        {active.banner.title && (
          <h2 className="font-display text-2xl md:text-4xl leading-tight max-w-lg">{active.banner.title}</h2>
        )}
        {active.banner.subtitle && (
          <p className="text-sm md:text-base text-background/80 max-w-md">{active.banner.subtitle}</p>
        )}
      </div>
      {slides.length > 1 && (
        <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2">
          {slides.map((s, i) => (
            <button
              key={s.banner.id}
              aria-label={`Show banner ${i + 1}`}
              onClick={() => setIndex(i)}
              className={`h-1.5 rounded-full transition-all ${i === index ? "w-6 bg-background" : "w-1.5 bg-background/50"}`}
            />
          ))}
        </div>
      )}
      {/* Preload the next banner quietly */}
      {slides.length > 1 && (
        <img
          src={slides[(index + 1) % slides.length].url}
          alt=""
          aria-hidden
          loading="lazy"
          decoding="async"
          className="hidden"
        />
      )}
    </>
  );

  const link = active.banner.link;
  return (
    <BannerFrame>
      {link ? (
        link.startsWith("http") ? (
          <a href={link} target="_blank" rel="noreferrer" className="absolute inset-0 block">{inner}</a>
        ) : (
          <Link to={link as any} className="absolute inset-0 block">{inner}</Link>
        )
      ) : (
        inner
      )}
    </BannerFrame>
  );
}
