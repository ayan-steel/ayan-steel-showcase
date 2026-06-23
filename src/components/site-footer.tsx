import { Link } from "@tanstack/react-router";
import { Instagram, Phone, MapPin, Clock } from "lucide-react";
import { CONTACT } from "@/data/showroom";

export function SiteFooter() {
  return (
    <footer className="mt-24 bg-foreground text-background">
      <div className="container-luxe py-16 grid gap-12 md:grid-cols-2 lg:grid-cols-4">
        <div>
          <div className="flex items-center gap-2.5">
            <span className="grid h-10 w-10 place-items-center rounded-full bg-background text-foreground font-display text-lg">A</span>
            <div className="leading-tight">
              <div className="font-display text-xl">Ayan Steel</div>
              <div className="text-[10px] uppercase tracking-[0.25em] text-background/60">Premium Furniture</div>
            </div>
          </div>
          <p className="mt-5 text-sm text-background/70 leading-relaxed">
            {CONTACT.tagline}. A trusted name in Katihar for steel and wooden furniture spanning home, office, hospitality and institutional needs.
          </p>
        </div>

        <div>
          <h4 className="font-display text-base mb-4">Explore</h4>
          <ul className="space-y-2.5 text-sm text-background/70">
            {[
              ["/products", "Products"],
              ["/categories", "Categories"],
              ["/custom-work", "Custom Work"],
              ["/gallery", "Gallery"],
              ["/videos", "Videos"],
              ["/about", "About Us"],
            ].map(([to, label]) => (
              <li key={to}>
                <Link to={to} className="hover:text-accent transition-colors">{label}</Link>
              </li>
            ))}
          </ul>
        </div>

        <div>
          <h4 className="font-display text-base mb-4">Visit</h4>
          <ul className="space-y-3 text-sm text-background/70">
            <li className="flex gap-2.5">
              <MapPin className="h-4 w-4 mt-0.5 shrink-0 text-accent" />
              <span>{CONTACT.address}</span>
            </li>
            <li className="flex gap-2.5">
              <Phone className="h-4 w-4 mt-0.5 shrink-0 text-accent" />
              <span>
                <a href={`tel:${CONTACT.phoneRaw}`} className="block hover:text-accent">{CONTACT.phone}</a>
                <a href={`tel:${CONTACT.altPhoneRaw}`} className="block hover:text-accent">{CONTACT.altPhone}</a>
              </span>
            </li>
            <li className="flex gap-2.5">
              <Clock className="h-4 w-4 mt-0.5 shrink-0 text-accent" />
              <span>
                {CONTACT.hours.map((h) => (
                  <span key={h.day} className="block">{h.day}: {h.time}</span>
                ))}
              </span>
            </li>
          </ul>
        </div>

        <div>
          <h4 className="font-display text-base mb-4">Connect</h4>
          <a href={CONTACT.instagramUrl} target="_blank" rel="noreferrer" className="inline-flex items-center gap-2 text-sm text-background/80 hover:text-accent transition-colors">
            <Instagram className="h-4 w-4" /> @{CONTACT.instagram}
          </a>
          <div className="mt-5 flex flex-wrap gap-2">
            <Link to="/privacy" className="text-xs text-background/60 hover:text-accent">Privacy</Link>
            <span className="text-background/30">•</span>
            <Link to="/terms" className="text-xs text-background/60 hover:text-accent">Terms</Link>
            <span className="text-background/30">•</span>
            <Link to="/faq" className="text-xs text-background/60 hover:text-accent">FAQ</Link>
          </div>
        </div>
      </div>

      <div className="border-t border-background/10">
        <div className="container-luxe py-6 flex flex-col md:flex-row items-center justify-between gap-2 text-xs text-background/50">
          <div>© {new Date().getFullYear()} Ayan Steel. All rights reserved.</div>
          <div>Crafted with care in Katihar, Bihar.</div>
        </div>
      </div>
    </footer>
  );
}
