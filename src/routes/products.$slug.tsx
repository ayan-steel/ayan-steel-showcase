import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useEffect, useMemo, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Phone, MessageCircle, ShoppingCart, Zap, FileText, Star, ChevronLeft, Heart, Minus, Plus, X, ZoomIn } from "lucide-react";
import { productBySlugQuery, productsQuery, type ShowroomProduct } from "@/lib/showroom-queries";
import { getSignedUrl } from "@/lib/storage";
import { CONTACT } from "@/data/showroom";
import { useCart, useWishlist, buildQuoteWhatsApp, buildWhatsAppOrder } from "@/lib/cart-store";
import { ProductCard } from "@/components/product-card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { ErrorState, NotFoundState } from "@/components/error-state";
import { Skeleton } from "@/components/ui/skeleton";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export const Route = createFileRoute("/products/$slug")({
  head: ({ params }) => ({
    meta: [
      { title: `${params.slug.replace(/-/g, " ")} — Ayan Steel` },
      { name: "description", content: "Premium furniture from Ayan Steel, Katihar." },
    ],
  }),
  loader: ({ context, params }) => {
    context.queryClient.prefetchQuery(productBySlugQuery(params.slug));
    context.queryClient.prefetchQuery(productsQuery);
  },
  pendingMs: 0,
  pendingComponent: () => (
    <section className="container-luxe py-12">
      <Skeleton className="h-6 w-40" />
      <div className="mt-8 grid gap-10 lg:grid-cols-2">
        <Skeleton className="aspect-square rounded-3xl" />
        <div className="space-y-4">
          <Skeleton className="h-10 w-3/4" />
          <Skeleton className="h-6 w-1/3" />
          <Skeleton className="h-24 w-full" />
          <Skeleton className="h-12 w-full" />
        </div>
      </div>
    </section>
  ),
  errorComponent: ({ error }) => <ErrorState title="We couldn't load this product" error={error} />,
  notFoundComponent: () => <ProductNotFound />,
  component: ProductDetailPage,
});

function ProductDetailPage() {
  const { slug } = Route.useParams();
  const { data: all = [] } = useQuery(productsQuery);
  const productQuery = useQuery({
    ...productBySlugQuery(slug),
    placeholderData: () => all.find((p) => p.slug === slug || p.id === slug),
  });

  const product = productQuery.data;

  const related = useMemo(() => {
    if (!product) return [];
    const sameCategory = all.filter((p) => p.category === product.category && p.id !== product.id);
    const fallback = all.filter((p) => p.id !== product.id);
    return (sameCategory.length > 0 ? sameCategory : fallback).slice(0, 6);
  }, [all, product]);

  if (productQuery.isLoading) return <ProductDetailSkeleton />;
  if (productQuery.isError) return <ErrorState title="We couldn't load this product" error={productQuery.error} />;
  if (!product) return <ProductNotFound />;

  return (
    <div className="container-luxe py-8 md:py-12">
      <Link to="/products" className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground">
        <ChevronLeft className="h-4 w-4" /> Continue Shopping
      </Link>

      <div className="mt-6 grid gap-10 lg:grid-cols-[1.1fr_1fr]">
        <Gallery product={product} />
        <Details product={product} />
      </div>

      {Object.keys(product.specs || {}).length > 0 && (
        <section className="mt-16">
          <h2 className="font-display text-3xl">Specifications</h2>
          <div className="mt-6 grid gap-2 sm:grid-cols-2 max-w-3xl">
            {Object.entries(product.specs).map(([k, v]) => (
              <div key={k} className="flex justify-between gap-4 rounded-xl border border-border bg-card px-4 py-3 text-sm">
                <span className="text-muted-foreground">{k}</span>
                <span className="font-medium text-right">{String(v)}</span>
              </div>
            ))}
          </div>
        </section>
      )}

      {related.length > 0 && (
        <section className="mt-20">
          <h2 className="font-display text-3xl">Related Products</h2>
          <div className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {related.map((p, i) => <ProductCard key={p.id} product={p} index={i} />)}
          </div>
        </section>
      )}
    </div>
  );
}

function ProductDetailSkeleton() {
  return (
    <section className="container-luxe py-8 md:py-12">
      <Skeleton className="h-6 w-40" />
      <div className="mt-6 grid gap-10 lg:grid-cols-[1.1fr_1fr]">
        <div>
          <Skeleton className="aspect-square rounded-3xl" />
          <div className="mt-4 grid grid-cols-3 gap-3">
            <Skeleton className="aspect-square rounded-2xl" />
            <Skeleton className="aspect-square rounded-2xl" />
            <Skeleton className="aspect-square rounded-2xl" />
          </div>
        </div>
        <div className="space-y-4">
          <Skeleton className="h-4 w-40" />
          <Skeleton className="h-12 w-4/5" />
          <Skeleton className="h-5 w-32" />
          <Skeleton className="h-10 w-44" />
          <Skeleton className="h-24 w-full" />
          <Skeleton className="h-36 w-full rounded-2xl" />
          <div className="grid gap-2 sm:grid-cols-2">
            <Skeleton className="h-12 rounded-full" />
            <Skeleton className="h-12 rounded-full" />
            <Skeleton className="h-12 rounded-full" />
            <Skeleton className="h-12 rounded-full" />
          </div>
        </div>
      </div>
    </section>
  );
}

function ProductNotFound() {
  return (
    <NotFoundState message="Product Not Found. We couldn't find this product in the showroom catalogue." />
  );
}

function Gallery({ product }: { product: ShowroomProduct }) {
  const imgs = useMemo(() => {
    const paths = product.images.filter(Boolean).slice(0, 3);
    return Array.from({ length: 3 }, (_, i) => paths[i] ?? null);
  }, [product.images]);
  const [active, setActive] = useState(0);
  const [urls, setUrls] = useState<string[]>([]);
  const [lightbox, setLightbox] = useState(false);
  const [zoom, setZoom] = useState(false);

  useEffect(() => {
    let alive = true;
    Promise.all(imgs.map((p) => p ? getSignedUrl(p) : Promise.resolve("")))
      .then((res) => { if (alive) setUrls(res); });
    return () => { alive = false; };
  }, [imgs]);

  const current = urls[active] || "";

  return (
    <div>
      <motion.div
        layout
        className="relative aspect-square overflow-hidden rounded-3xl border border-border bg-secondary"
        onClick={() => current && setZoom((z) => !z)}
      >
        {current ? (
          <motion.img
            key={current}
            initial={{ opacity: 0 }} animate={{ opacity: 1 }}
            src={current}
            alt={product.name}
            className={`absolute inset-0 h-full w-full object-cover transition-transform duration-500 ${zoom ? "scale-150 cursor-zoom-out" : "cursor-zoom-in"}`}
          />
        ) : (
          <ImageFallback label="Large product image" />
        )}
        {current && (
          <button
            onClick={(e) => { e.stopPropagation(); setLightbox(true); }}
            className="absolute right-4 top-4 grid h-10 w-10 place-items-center rounded-full bg-background/90 backdrop-blur"
            aria-label="View full size"
          >
            <ZoomIn className="h-4 w-4" />
          </button>
        )}
      </motion.div>
      <div className="mt-4 grid grid-cols-3 gap-3">
        {imgs.map((_, i) => (
          <button
            key={i}
            onClick={() => { setActive(i); setZoom(false); }}
            className={`relative aspect-square overflow-hidden rounded-2xl border-2 transition ${i === active ? "border-accent" : "border-border hover:border-foreground/40"}`}
          >
            {urls[i] ? (
              <img src={urls[i]} alt={`${product.name} gallery image ${i + 1}`} className="absolute inset-0 h-full w-full object-cover" loading="lazy" />
            ) : (
              <ImageFallback label={`Gallery image ${i + 1}`} compact />
            )}
          </button>
        ))}
      </div>

      <AnimatePresence>
        {lightbox && current && (
          <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            onClick={() => setLightbox(false)}
            className="fixed inset-0 z-[60] grid place-items-center bg-foreground/90 backdrop-blur-sm p-6"
          >
            <button className="absolute right-6 top-6 grid h-11 w-11 place-items-center rounded-full bg-background text-foreground" aria-label="Close">
              <X className="h-5 w-5" />
            </button>
            <motion.img
              initial={{ scale: 0.92 }} animate={{ scale: 1 }} exit={{ scale: 0.92 }}
              src={current}
              alt={product.name}
              className="max-h-[90vh] max-w-[92vw] rounded-2xl shadow-2xl"
              onClick={(e) => e.stopPropagation()}
            />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

function ImageFallback({ label, compact = false }: { label: string; compact?: boolean }) {
  return (
    <div className="absolute inset-0 grid place-items-center bg-gradient-to-br from-secondary to-muted p-4 text-center">
      <div>
        {!compact && <p className="font-display text-2xl text-foreground">{label}</p>}
        <p className={compact ? "text-[10px] leading-snug text-muted-foreground" : "mt-2 text-sm text-muted-foreground"}>
          Information will be updated soon
        </p>
      </div>
    </div>
  );
}

function Details({ product }: { product: ShowroomProduct }) {
  const price = product.salePrice ?? product.price ?? 0;
  const hasPrice = price > 0;
  const [qty, setQty] = useState(1);
  const [quoteOpen, setQuoteOpen] = useState(false);
  const navigate = useNavigate();
  const add = useCart((s) => s.add);
  const wished = useWishlist((s) => s.ids.includes(product.id));
  const toggleWish = useWishlist((s) => s.toggle);
  const rating = product.rating ?? 4.8;

  function addToCart() {
    add({ id: product.id, slug: product.slug, name: product.name, price, image: product.image }, qty);
    toast.success(`${product.name} added to cart`);
  }
  function buyNow() {
    const url = buildWhatsAppOrder([{ id: product.id, slug: product.slug, name: product.name, price, image: product.image, qty }]);
    window.open(url, "_blank");
  }

  const dimensionRows = [
    ["Length", product.length_cm],
    ["Width", product.width_cm ?? product.breadth_cm],
    ["Height", product.height_cm],
  ] as const;
  const pendingText = "Information will be updated soon";

  return (
    <div>
      <div className="flex items-center justify-between gap-3">
        <span className="text-[11px] uppercase tracking-[0.2em] text-muted-foreground">
          {product.category || "Product"} {product.brand && `· ${product.brand}`}
        </span>
        <button
          onClick={() => toggleWish(product.id)}
          className="grid h-10 w-10 place-items-center rounded-full border border-border hover:border-rose-400 transition"
          aria-label="Wishlist"
        >
          <Heart className={`h-4 w-4 ${wished ? "fill-current text-rose-500" : ""}`} />
        </button>
      </div>

      <h1 className="mt-2 font-display text-4xl md:text-5xl leading-tight">{product.name}</h1>

      <div className="mt-3 flex items-center gap-2">
        <div className="flex">
          {Array.from({ length: 5 }).map((_, i) => (
            <Star key={i} className={`h-4 w-4 ${i < Math.round(rating) ? "fill-accent text-accent" : "text-muted-foreground/30"}`} />
          ))}
        </div>
        <span className="text-sm text-muted-foreground">{rating.toFixed(1)} / 5</span>
      </div>

      <div className="mt-5 flex items-baseline gap-3">
        <span className="font-display text-4xl">
          {hasPrice ? `₹${price.toLocaleString("en-IN")}` : pendingText}
        </span>
        {product.salePrice && product.price && (
          <span className="text-lg text-muted-foreground line-through">₹{product.price.toLocaleString("en-IN")}</span>
        )}
      </div>

      <p className="mt-5 text-muted-foreground leading-relaxed">
        {product.description?.trim() || pendingText}
      </p>

      <dl className="mt-6 grid grid-cols-1 gap-x-6 gap-y-3 text-sm rounded-2xl border border-border bg-card p-5 sm:grid-cols-2">
        {dimensionRows.map(([k, v]) => (
          <div key={k} className="flex justify-between gap-4">
            <dt className="text-muted-foreground">{k}</dt>
            <dd className="font-medium text-right">{v != null ? `${v} cm` : pendingText}</dd>
          </div>
        ))}
        <div className="flex justify-between gap-4 sm:col-span-2 pt-2 border-t border-border">
          <dt className="text-muted-foreground">Warranty</dt>
          <dd className="font-medium text-right">{product.warranty?.trim() || "5 Years"}</dd>
        </div>
        <div className="flex justify-between gap-4 sm:col-span-2">
          <dt className="text-muted-foreground">Material</dt>
          <dd className="font-medium text-right">{product.material?.trim() || pendingText}</dd>
        </div>
      </dl>

      {/* Qty */}
      <div className="mt-6 flex items-center gap-4">
        <span className="text-sm text-muted-foreground">Quantity</span>
        <div className="inline-flex items-center rounded-full border border-border">
          <button onClick={() => setQty((q) => Math.max(1, q - 1))} className="grid h-10 w-10 place-items-center hover:bg-muted rounded-l-full" aria-label="Decrease">
            <Minus className="h-3.5 w-3.5" />
          </button>
          <span className="w-10 text-center font-medium">{qty}</span>
          <button onClick={() => setQty((q) => q + 1)} className="grid h-10 w-10 place-items-center hover:bg-muted rounded-r-full" aria-label="Increase">
            <Plus className="h-3.5 w-3.5" />
          </button>
        </div>
      </div>

      {/* CTAs */}
      <div className="mt-6 grid gap-2 sm:grid-cols-2">
        <Button size="lg" onClick={addToCart} className="rounded-full"><ShoppingCart className="h-4 w-4" /> Add to Cart</Button>
        <Button size="lg" variant="default" onClick={buyNow} className="rounded-full bg-accent text-accent-foreground hover:bg-accent/90"><Zap className="h-4 w-4" /> Buy Now</Button>
        <a href={buildQuoteWhatsApp(product.name, qty)} target="_blank" rel="noreferrer">
          <Button size="lg" variant="outline" className="w-full rounded-full bg-[#25D366] text-white border-transparent hover:bg-[#1ebe57] hover:text-white"><MessageCircle className="h-4 w-4" /> WhatsApp</Button>
        </a>
        <a href={`tel:${CONTACT.phoneRaw}`}>
          <Button size="lg" variant="outline" className="w-full rounded-full"><Phone className="h-4 w-4" /> Call Now</Button>
        </a>
        <Button size="lg" variant="secondary" onClick={() => setQuoteOpen(true)} className="rounded-full sm:col-span-2"><FileText className="h-4 w-4" /> Request a Quote</Button>
      </div>

      <p className="mt-5 rounded-2xl border border-dashed border-border bg-muted/40 px-4 py-3 text-sm text-muted-foreground">
        Note: Customers can choose their preferred color during their showroom visit, subject to availability.
      </p>

      <div className="mt-5 flex flex-wrap gap-3">
        <Link to="/products" className="inline-flex items-center gap-1 rounded-full border border-border px-4 py-2 text-sm hover:bg-muted transition">
          <ChevronLeft className="h-4 w-4" /> Back to Products
        </Link>
        <button onClick={() => navigate({ to: "/cart" })} className="text-sm text-muted-foreground hover:text-foreground underline-offset-4 hover:underline self-center">
          View cart →
        </button>
      </div>

      <QuoteDialog open={quoteOpen} onClose={() => setQuoteOpen(false)} product={product} qty={qty} />
    </div>
  );
}

function QuoteDialog({ open, onClose, product, qty }: { open: boolean; onClose: () => void; product: ShowroomProduct; qty: number }) {
  const [form, setForm] = useState({ name: "", phone: "", email: "", note: "" });
  const [busy, setBusy] = useState(false);
  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    try {
      const { error } = await supabase.from("messages").insert({
        name: form.name.trim() || "Anonymous",
        email: form.email.trim() || `${form.phone}@phone.local`,
        phone: form.phone.trim() || null,
        subject: `Quote request: ${product.name} × ${qty}`,
        message: form.note.trim() || `Please send a quote for ${product.name} (qty: ${qty}).`,
      });
      if (error) throw error;
      toast.success("Quote request sent. We'll be in touch.");
      onClose();
      setForm({ name: "", phone: "", email: "", note: "" });
    } catch (err: any) { toast.error(err?.message || "Failed to send"); }
    finally { setBusy(false); }
  }
  return (
    <Dialog open={open} onOpenChange={(v) => !v && onClose()}>
      <DialogContent>
        <DialogHeader><DialogTitle>Request a Quote — {product.name}</DialogTitle></DialogHeader>
        <form onSubmit={submit} className="space-y-3">
          <div><Label>Name *</Label><Input required value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} maxLength={100} /></div>
          <div><Label>Phone *</Label><Input required type="tel" value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} maxLength={30} /></div>
          <div><Label>Email (optional)</Label><Input type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} maxLength={255} /></div>
          <div><Label>Note</Label><Textarea rows={3} value={form.note} onChange={(e) => setForm({ ...form, note: e.target.value })} maxLength={2000} /></div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={onClose}>Cancel</Button>
            <Button type="submit" disabled={busy}>{busy ? "Sending…" : "Send Request"}</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
