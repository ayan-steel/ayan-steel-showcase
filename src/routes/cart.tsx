import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Minus, Plus, Trash2, ShoppingBag, MessageCircle } from "lucide-react";
import { useCart, buildWhatsAppOrder } from "@/lib/cart-store";
import { getSignedUrl } from "@/lib/storage";
import { Button } from "@/components/ui/button";

export const Route = createFileRoute("/cart")({
  ssr: false,
  head: () => ({ meta: [{ title: "Your Cart — Ayan Steel" }, { name: "robots", content: "noindex" }] }),
  component: CartPage,
});

function CartLine({ id }: { id: string }) {
  const item = useCart((s) => s.items.find((i) => i.id === id));
  const setQty = useCart((s) => s.setQty);
  const remove = useCart((s) => s.remove);
  const [src, setSrc] = useState("");
  useEffect(() => {
    let alive = true;
    if (item?.image) getSignedUrl(item.image).then((u) => { if (alive) setSrc(u); });
    return () => { alive = false; };
  }, [item?.image]);
  if (!item) return null;
  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, x: -20 }}
      className="flex gap-4 items-center rounded-2xl border border-border bg-card p-4"
    >
      <Link to="/products/$slug" params={{ slug: item.slug }} className="block h-20 w-20 shrink-0 overflow-hidden rounded-xl bg-secondary">
        {src ? <img src={src} alt={item.name} className="h-full w-full object-cover" /> : <div className="h-full w-full bg-muted" />}
      </Link>
      <div className="flex-1 min-w-0">
        <Link to="/products/$slug" params={{ slug: item.slug }} className="font-display text-lg leading-tight hover:underline">
          {item.name}
        </Link>
        <div className="mt-1 text-sm text-muted-foreground">₹{item.price.toLocaleString("en-IN")}</div>
      </div>
      <div className="inline-flex items-center rounded-full border border-border">
        <button onClick={() => setQty(item.id, item.qty - 1)} className="grid h-9 w-9 place-items-center hover:bg-muted rounded-l-full"><Minus className="h-3.5 w-3.5" /></button>
        <span className="w-8 text-center text-sm font-medium">{item.qty}</span>
        <button onClick={() => setQty(item.id, item.qty + 1)} className="grid h-9 w-9 place-items-center hover:bg-muted rounded-r-full"><Plus className="h-3.5 w-3.5" /></button>
      </div>
      <div className="w-24 text-right font-medium">₹{(item.price * item.qty).toLocaleString("en-IN")}</div>
      <button onClick={() => remove(item.id)} className="grid h-9 w-9 place-items-center rounded-full hover:bg-muted text-muted-foreground" aria-label="Remove">
        <Trash2 className="h-4 w-4" />
      </button>
    </motion.div>
  );
}

function CartPage() {
  const items = useCart((s) => s.items);
  const total = useCart((s) => s.total());
  const clear = useCart((s) => s.clear);

  return (
    <section className="container-luxe py-12 md:py-16">
      <header className="max-w-2xl">
        <span className="text-[11px] uppercase tracking-[0.3em] text-walnut">Cart</span>
        <h1 className="mt-3 font-display text-5xl leading-[1.02]">Your Cart</h1>
      </header>

      {items.length === 0 ? (
        <div className="mt-12 grid place-items-center rounded-3xl border border-dashed border-border p-16 text-center">
          <ShoppingBag className="h-10 w-10 text-muted-foreground" />
          <p className="mt-4 text-muted-foreground">Your cart is empty.</p>
          <Link to="/products" className="mt-6">
            <Button size="lg" className="rounded-full">Continue Shopping</Button>
          </Link>
        </div>
      ) : (
        <div className="mt-10 grid gap-10 lg:grid-cols-[1fr_360px]">
          <div className="space-y-3">
            <AnimatePresence>
              {items.map((i) => <CartLine key={i.id} id={i.id} />)}
            </AnimatePresence>
          </div>
          <aside className="h-fit rounded-3xl border border-border bg-card p-6 sticky top-24">
            <h2 className="font-display text-2xl">Order Summary</h2>
            <div className="mt-4 flex justify-between text-sm">
              <span className="text-muted-foreground">Subtotal</span>
              <span>₹{total.toLocaleString("en-IN")}</span>
            </div>
            <div className="mt-1 flex justify-between text-sm">
              <span className="text-muted-foreground">Delivery</span>
              <span>Calculated on confirmation</span>
            </div>
            <div className="mt-4 border-t border-border pt-4 flex justify-between font-display text-xl">
              <span>Total</span>
              <span>₹{total.toLocaleString("en-IN")}</span>
            </div>
            <a href={buildWhatsAppOrder(items)} target="_blank" rel="noreferrer" className="mt-6 block">
              <Button size="lg" className="w-full rounded-full bg-[#25D366] hover:bg-[#1ebe57] text-white">
                <MessageCircle className="h-4 w-4" /> Place Order via WhatsApp
              </Button>
            </a>
            <Link to="/products" className="mt-3 block">
              <Button size="lg" variant="outline" className="w-full rounded-full">Continue Shopping</Button>
            </Link>
            <button onClick={() => { if (confirm("Clear cart?")) clear(); }} className="mt-4 w-full text-sm text-muted-foreground hover:text-destructive">
              Clear cart
            </button>
          </aside>
        </div>
      )}
    </section>
  );
}
