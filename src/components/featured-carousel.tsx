import { useEffect, useMemo, useRef, useState } from "react";
import { Link } from "@tanstack/react-router";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { getSignedUrl } from "@/lib/storage";
import type { ShowroomProduct } from "@/lib/showroom-queries";

const AUTO_MS = 4000;

function Slide({ product }: { product: ShowroomProduct }) {
  const [src, setSrc] = useState("");
  useEffect(() => {
    let alive = true;
    if (!product.image) { setSrc(""); return; }
    getSignedUrl(product.image).then((u) => { if (alive) setSrc(u); });
    return () => { alive = false; };
  }, [product.image]);

  return (
    <Link
      to="/products/$slug"
      params={{ slug: product.slug }}
      aria-label={`View ${product.name}`}
      className="group relative block h-full w-full flex-shrink-0 overflow-hidden rounded-3xl bg-secondary snap-center"
      style={{ flexBasis: "var(--slide-basis)" }}
    >
      {src ? (
        <img
          src={src}
          alt={product.name}
          loading="lazy"
          decoding="async"
          className="h-full w-full object-cover transition-transform duration-[1200ms] group-hover:scale-105"
        />
      ) : (
        <div className="absolute inset-0 bg-gradient-to-br from-secondary to-muted" />
      )}
    </Link>
  );
}

export function FeaturedCarousel({ products }: { products: ShowroomProduct[] }) {
  const items = useMemo(() => products.filter((p) => p.image), [products]);
  const trackRef = useRef<HTMLDivElement>(null);
  const [index, setIndex] = useState(0);
  const [paused, setPaused] = useState(false);
  const count = items.length;

  const scrollTo = (i: number) => {
    const track = trackRef.current;
    if (!track) return;
    const child = track.children[i] as HTMLElement | undefined;
    if (!child) return;
    track.scrollTo({ left: child.offsetLeft - track.offsetLeft, behavior: "smooth" });
    setIndex(i);
  };

  const next = () => scrollTo((index + 1) % Math.max(count, 1));
  const prev = () => scrollTo((index - 1 + Math.max(count, 1)) % Math.max(count, 1));

  useEffect(() => {
    if (paused || count <= 1) return;
    const id = window.setInterval(() => {
      setIndex((i) => {
        const nextI = (i + 1) % count;
        const track = trackRef.current;
        const child = track?.children[nextI] as HTMLElement | undefined;
        if (track && child) track.scrollTo({ left: child.offsetLeft - track.offsetLeft, behavior: "smooth" });
        return nextI;
      });
    }, AUTO_MS);
    return () => window.clearInterval(id);
  }, [paused, count]);

  // Track scroll to update active index on swipe
  useEffect(() => {
    const track = trackRef.current;
    if (!track) return;
    let raf = 0;
    const onScroll = () => {
      cancelAnimationFrame(raf);
      raf = requestAnimationFrame(() => {
        const children = Array.from(track.children) as HTMLElement[];
        const center = track.scrollLeft + track.clientWidth / 2;
        let best = 0;
        let bestDist = Infinity;
        children.forEach((c, i) => {
          const mid = c.offsetLeft - track.offsetLeft + c.clientWidth / 2;
          const d = Math.abs(mid - center);
          if (d < bestDist) { bestDist = d; best = i; }
        });
        setIndex(best);
      });
    };
    track.addEventListener("scroll", onScroll, { passive: true });
    return () => { track.removeEventListener("scroll", onScroll); cancelAnimationFrame(raf); };
  }, [count]);

  if (count === 0) return null;

  return (
    <section
      className="container-luxe py-10 md:py-16"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
    >
      <div
        className="relative"
        style={{
          // responsive slide width via CSS var
          ["--slide-basis" as any]: "100%",
        }}
      >
        <div
          ref={trackRef}
          className="flex gap-4 overflow-x-auto scroll-smooth snap-x snap-mandatory no-scrollbar [--slide-basis:100%] sm:[--slide-basis:calc((100%-1rem)/2)] lg:[--slide-basis:calc((100%-2rem)/3)]"
          style={{ scrollbarWidth: "none" }}
        >
          {items.map((p) => (
            <div key={p.id} className="h-[280px] sm:h-[360px] md:h-[440px] flex-shrink-0" style={{ flexBasis: "var(--slide-basis)" }}>
              <Slide product={p} />
            </div>
          ))}
        </div>

        {count > 1 && (
          <>
            <button
              type="button"
              onClick={prev}
              aria-label="Previous"
              className="absolute left-2 md:left-4 top-1/2 -translate-y-1/2 grid h-11 w-11 place-items-center rounded-full bg-background/90 backdrop-blur border border-border shadow-[var(--shadow-soft)] hover:scale-105 transition"
            >
              <ChevronLeft className="h-5 w-5" />
            </button>
            <button
              type="button"
              onClick={next}
              aria-label="Next"
              className="absolute right-2 md:right-4 top-1/2 -translate-y-1/2 grid h-11 w-11 place-items-center rounded-full bg-background/90 backdrop-blur border border-border shadow-[var(--shadow-soft)] hover:scale-105 transition"
            >
              <ChevronRight className="h-5 w-5" />
            </button>

            <div className="mt-5 flex justify-center gap-1.5">
              {items.map((_, i) => (
                <button
                  key={i}
                  type="button"
                  onClick={() => scrollTo(i)}
                  aria-label={`Go to slide ${i + 1}`}
                  className={`h-1.5 rounded-full transition-all ${i === index ? "w-6 bg-foreground" : "w-1.5 bg-foreground/30"}`}
                />
              ))}
            </div>
          </>
        )}
      </div>
      <style>{`.no-scrollbar::-webkit-scrollbar{display:none}`}</style>
    </section>
  );
}
