import { Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Menu, X, ShoppingBag, Heart } from "lucide-react";
import { useCart, useWishlist } from "@/lib/cart-store";

const NAV = [
  { to: "/", label: "Home" },
  { to: "/products", label: "Products" },
  { to: "/categories", label: "Categories" },
  { to: "/custom-work", label: "Custom Work" },
  { to: "/gallery", label: "Gallery" },
  { to: "/videos", label: "Videos" },
  { to: "/repair-services", label: "Repair" },
  { to: "/about", label: "About" },
  { to: "/contact", label: "Contact" },
] as const;

export function SiteHeader() {
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);
  const cartCount = useCart((s) => s.items.reduce((n, i) => n + i.qty, 0));
  const wishCount = useWishlist((s) => s.ids.length);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 16);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <header
      className={`fixed inset-x-0 top-0 z-50 transition-all duration-500 ${
        scrolled ? "glass-panel shadow-[var(--shadow-soft)]" : "bg-transparent"
      }`}
    >
      <div className="container-luxe flex h-18 items-center justify-between py-4">
        <Link to="/" className="flex items-center gap-2.5 group">
          <span className="grid h-10 w-10 place-items-center rounded-full bg-foreground text-background font-display text-lg transition-transform group-hover:scale-105">A</span>
          <span className="flex flex-col leading-none">
            <span className="font-display text-lg tracking-tight">Ayan Steel</span>
            <span className="text-[10px] uppercase tracking-[0.25em] text-muted-foreground">Katihar</span>
          </span>
        </Link>

        <nav className="hidden lg:flex items-center gap-7">
          {NAV.map((item) => (
            <Link
              key={item.to}
              to={item.to}
              className="text-sm text-foreground/80 hover:text-foreground transition-colors gold-underline"
              activeProps={{ className: "text-foreground font-medium" }}
              activeOptions={{ exact: item.to === "/" }}
            >
              {item.label}
            </Link>
          ))}
        </nav>

        <div className="flex items-center gap-2">
          <Link to="/wishlist" aria-label="Wishlist" className="relative grid h-10 w-10 place-items-center rounded-full hover:bg-foreground/5 transition">
            <Heart className="h-5 w-5" />
            {wishCount > 0 && (
              <span className="absolute -top-0.5 -right-0.5 grid h-4 min-w-4 px-1 place-items-center rounded-full bg-accent text-accent-foreground text-[10px] font-medium">{wishCount}</span>
            )}
          </Link>
          <Link to="/cart" aria-label="Cart" className="relative grid h-10 w-10 place-items-center rounded-full hover:bg-foreground/5 transition">
            <ShoppingBag className="h-5 w-5" />
            {cartCount > 0 && (
              <span className="absolute -top-0.5 -right-0.5 grid h-4 min-w-4 px-1 place-items-center rounded-full bg-accent text-accent-foreground text-[10px] font-medium">{cartCount}</span>
            )}
          </Link>

          <Link
            to="/contact"
            className="hidden lg:inline-flex items-center rounded-full bg-foreground px-5 py-2.5 text-sm font-medium text-background transition-all hover:scale-[1.03] hover:shadow-[var(--shadow-luxe)] ml-2"
          >
            Visit Showroom
          </Link>

          <button
            aria-label="Toggle menu"
            onClick={() => setOpen((v) => !v)}
            className="lg:hidden grid h-10 w-10 place-items-center rounded-full bg-foreground/5 hover:bg-foreground/10"
          >
            {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>
      </div>

      {open && (
        <div className="lg:hidden glass-panel border-t border-border animate-fade-in">
          <nav className="container-luxe flex flex-col py-4">
            {NAV.map((item) => (
              <Link
                key={item.to}
                to={item.to}
                onClick={() => setOpen(false)}
                className="py-3 text-base text-foreground/80 hover:text-foreground border-b border-border/40 last:border-0"
                activeProps={{ className: "text-foreground font-medium" }}
                activeOptions={{ exact: item.to === "/" }}
              >
                {item.label}
              </Link>
            ))}
          </nav>
        </div>
      )}
    </header>
  );
}
