import { useEffect, useState } from "react";
import { Link } from "@tanstack/react-router";
import { getSignedUrl } from "@/lib/storage";
import type { ShowroomProduct } from "@/lib/showroom-queries";

function Card({ product }: { product: ShowroomProduct }) {
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
      className="group relative block shrink-0 overflow-hidden rounded-2xl border border-border bg-secondary/40 w-[150px] h-[150px] sm:w-[180px] sm:h-[180px] md:w-[200px] md:h-[200px] mx-2"
    >
      {src ? (
        <img
          src={src}
          alt={product.name}
          loading="lazy"
          decoding="async"
          className="h-full w-full object-contain p-3 transition-transform duration-500 group-hover:scale-105"
        />
      ) : (
        <div className="absolute inset-0 bg-gradient-to-br from-secondary to-muted" />
      )}
    </Link>
  );
}

function Marquee({ items, reverse }: { items: ShowroomProduct[]; reverse?: boolean }) {
  // duplicate for seamless loop
  const loop = [...items, ...items];
  return (
    <div className="group relative overflow-hidden">
      <div
        className="flex w-max py-2"
        style={{
          animation: `${reverse ? "marquee-rtl-reverse" : "marquee-rtl"} 40s linear infinite`,
          animationPlayState: "running",
        }}
        onMouseEnter={(e) => ((e.currentTarget as HTMLDivElement).style.animationPlayState = "paused")}
        onMouseLeave={(e) => ((e.currentTarget as HTMLDivElement).style.animationPlayState = "running")}
        onTouchStart={(e) => ((e.currentTarget as HTMLDivElement).style.animationPlayState = "paused")}
        onTouchEnd={(e) => ((e.currentTarget as HTMLDivElement).style.animationPlayState = "running")}
      >
        {loop.map((p, i) => (
          <Card key={`${p.id}-${i}`} product={p} />
        ))}
      </div>
    </div>
  );
}

export function FeaturedCarousel({ products }: { products: ShowroomProduct[] }) {
  const items = products.filter((p) => p.image);
  if (items.length === 0) return null;
  // ensure enough items for smooth scroll
  const base = items.length < 6 ? [...items, ...items, ...items] : items;

  return (
    <section className="container-luxe py-10 md:py-16 space-y-4">
      <Marquee items={base} />
      <Marquee items={[...base].reverse()} reverse />
      <style>{`
        @keyframes marquee-rtl {
          from { transform: translateX(0); }
          to { transform: translateX(-50%); }
        }
        @keyframes marquee-rtl-reverse {
          from { transform: translateX(-50%); }
          to { transform: translateX(0); }
        }
      `}</style>
    </section>
  );
}
