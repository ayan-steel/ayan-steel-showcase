import { useEffect, useState } from "react";
import { Link } from "@tanstack/react-router";
import { getSignedUrl } from "@/lib/storage";
import type { ShowroomProduct } from "@/lib/showroom-queries";

function Card({ product, eager }: { product: ShowroomProduct; eager?: boolean }) {
  const [src, setSrc] = useState("");
  const [loaded, setLoaded] = useState(false);
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
      className="group relative block shrink-0 overflow-hidden rounded-2xl border border-border bg-secondary/40 w-[120px] h-[120px] sm:w-[160px] sm:h-[160px] md:w-[190px] md:h-[190px] mx-1.5 sm:mx-2"
    >
      {!loaded && (
        <div className="absolute inset-0 animate-pulse bg-gradient-to-br from-secondary to-muted" />
      )}
      {src && (
        <img
          src={src}
          alt={product.name}
          width={190}
          height={190}
          loading={eager ? "eager" : "lazy"}
          decoding="async"
          fetchPriority={eager ? "high" : "auto"}
          onLoad={() => setLoaded(true)}
          className={`h-full w-full object-contain p-3 transition-all duration-500 group-hover:scale-105 ${loaded ? "opacity-100" : "opacity-0"}`}
        />
      )}
    </Link>
  );
}

function Marquee({ items, reverse, eagerCount = 0 }: { items: ShowroomProduct[]; reverse?: boolean; eagerCount?: number }) {
  const loop = [...items, ...items];
  return (
    <div className="relative w-full overflow-hidden">
      <div
        className="flex w-max py-2 hover:[animation-play-state:paused]"
        style={{
          animation: `${reverse ? "marquee-rtl-reverse" : "marquee-rtl"} 70s linear infinite`,
          willChange: "transform",
        }}
      >
        {loop.map((p, i) => (
          <Card key={`${p.id}-${i}`} product={p} eager={i < eagerCount} />
        ))}
      </div>
    </div>
  );
}

export function FeaturedCarousel({ products }: { products: ShowroomProduct[] }) {
  const items = products.filter((p) => p.image);
  if (items.length === 0) return null;
  const base = items.length < 6 ? [...items, ...items, ...items] : items;

  return (
    <section className="w-full overflow-hidden py-10 md:py-16 space-y-4">
      <Marquee items={base} eagerCount={6} />
      <Marquee items={[...base].reverse()} reverse />
      <style>{`
        @keyframes marquee-rtl {
          from { transform: translate3d(0,0,0); }
          to { transform: translate3d(-50%,0,0); }
        }
        @keyframes marquee-rtl-reverse {
          from { transform: translate3d(-50%,0,0); }
          to { transform: translate3d(0,0,0); }
        }
      `}</style>
    </section>
  );
}
