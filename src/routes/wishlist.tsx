import { createFileRoute, Link } from "@tanstack/react-router";
import { useSuspenseQuery } from "@tanstack/react-query";
import { Heart } from "lucide-react";
import { useWishlist } from "@/lib/cart-store";
import { productsQuery } from "@/lib/showroom-queries";
import { ProductCard } from "@/components/product-card";
import { Button } from "@/components/ui/button";
import { ErrorState } from "@/components/error-state";

export const Route = createFileRoute("/wishlist")({
  ssr: false,
  head: () => ({ meta: [{ title: "Wishlist — Ayan Steel" }, { name: "robots", content: "noindex" }] }),
  loader: ({ context }) => { context.queryClient.ensureQueryData(productsQuery); },
  errorComponent: ({ error }) => <ErrorState title="We couldn't load your wishlist" error={error} />,
  component: WishlistPage,
});

function WishlistPage() {
  const ids = useWishlist((s) => s.ids);
  const { data: products } = useSuspenseQuery(productsQuery);
  const items = products.filter((p) => ids.includes(p.id));
  return (
    <section className="container-luxe py-12 md:py-16">
      <header className="max-w-2xl">
        <span className="text-[11px] uppercase tracking-[0.3em] text-walnut">Saved</span>
        <h1 className="mt-3 font-display text-5xl leading-[1.02]">Wishlist</h1>
      </header>
      {items.length === 0 ? (
        <div className="mt-12 grid place-items-center rounded-3xl border border-dashed border-border p-16 text-center">
          <Heart className="h-10 w-10 text-muted-foreground" />
          <p className="mt-4 text-muted-foreground">Nothing saved yet.</p>
          <Link to="/products" className="mt-6"><Button size="lg" className="rounded-full">Browse Products</Button></Link>
        </div>
      ) : (
        <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {items.map((p, i) => <ProductCard key={p.id} product={p} index={i} />)}
        </div>
      )}
    </section>
  );
}
