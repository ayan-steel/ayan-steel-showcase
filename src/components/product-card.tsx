import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { ArrowUpRight, Heart } from "lucide-react";
import { Link } from "@tanstack/react-router";
import { getSignedUrl } from "@/lib/storage";
import type { ShowroomProduct } from "@/lib/showroom-queries";
import { useWishlist } from "@/lib/cart-store";

export function ProductCard({ product, index = 0 }: { product: ShowroomProduct; index?: number }) {
  const [src, setSrc] = useState("");
  const wished = useWishlist((s) => s.ids.includes(product.id));
  const toggle = useWishlist((s) => s.toggle);

  useEffect(() => {
    let alive = true;
    if (!product.image) { setSrc(""); return; }
    getSignedUrl(product.image).then((u) => { if (alive) setSrc(u); });
    return () => { alive = false; };
  }, [product.image]);

  const displayPrice = product.salePrice ?? product.price;

  return (
    <motion.article
      initial={{ opacity: 0, y: 24 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-80px" }}
      transition={{ duration: 0.6, delay: index * 0.06, ease: [0.22, 1, 0.36, 1] }}
      className="group relative overflow-hidden rounded-3xl bg-card border border-border/60 shadow-[var(--shadow-soft)] hover:shadow-[var(--shadow-luxe)] transition-all duration-500"
    >
      <Link
        to="/products/$slug"
        params={{ slug: product.slug }}
        className="block"
        aria-label={`View ${product.name}`}
      >
        <div className="relative aspect-[4/5] overflow-hidden bg-secondary">
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
          {product.badge && (
            <span className="absolute left-4 top-4 rounded-full bg-foreground/90 backdrop-blur px-3 py-1 text-[10px] uppercase tracking-[0.18em] text-background">
              {product.badge}
            </span>
          )}
          <div className="absolute inset-0 bg-gradient-to-t from-foreground/40 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
          <div className="absolute right-4 bottom-4 grid h-11 w-11 place-items-center rounded-full bg-background/95 text-foreground translate-y-3 opacity-0 group-hover:translate-y-0 group-hover:opacity-100 transition-all duration-500">
            <ArrowUpRight className="h-5 w-5" />
          </div>
        </div>

        <div className="p-5">
          <div className="flex items-center justify-between gap-3">
            <span className="text-[11px] uppercase tracking-[0.18em] text-muted-foreground">
              {product.category}
            </span>
            <span className="text-[11px] text-muted-foreground">{product.brand}</span>
          </div>
          <h3 className="mt-2 font-display text-xl leading-tight">{product.name}</h3>
          {displayPrice !== null && (
            <div className="mt-3 flex items-baseline gap-2">
              <span className="text-lg font-medium">
                ₹{displayPrice.toLocaleString("en-IN")}
              </span>
              {product.salePrice && product.price && (
                <span className="text-sm text-muted-foreground line-through">
                  ₹{product.price.toLocaleString("en-IN")}
                </span>
              )}
            </div>
          )}
        </div>
      </Link>

      <button
        type="button"
        onClick={(e) => { e.preventDefault(); e.stopPropagation(); toggle(product.id); }}
        aria-label={wished ? "Remove from wishlist" : "Add to wishlist"}
        className="absolute right-4 top-4 grid h-9 w-9 place-items-center rounded-full bg-background/90 backdrop-blur text-foreground transition hover:scale-110"
      >
        <Heart className={`h-4 w-4 ${wished ? "fill-current text-rose-500" : ""}`} />
      </button>
    </motion.article>
  );
}
