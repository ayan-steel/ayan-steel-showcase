import { useEffect, useState } from "react";
import { MessageCircle, Phone, ArrowUp } from "lucide-react";
import { CONTACT } from "@/data/showroom";

export function FloatingActions() {
  const [show, setShow] = useState(false);
  useEffect(() => {
    const onScroll = () => setShow(window.scrollY > 600);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <div className="fixed right-4 bottom-4 z-40 flex flex-col gap-3">
      <a
        href={`https://wa.me/${CONTACT.whatsapp}`}
        target="_blank" rel="noreferrer"
        aria-label="WhatsApp"
        className="grid h-13 w-13 place-items-center rounded-full bg-[#25D366] text-white shadow-[var(--shadow-luxe)] transition-transform hover:scale-110"
        style={{ height: 52, width: 52 }}
      >
        <MessageCircle className="h-5 w-5" />
      </a>
      <a
        href={`tel:${CONTACT.phoneRaw}`}
        aria-label="Call"
        className="grid place-items-center rounded-full bg-foreground text-background shadow-[var(--shadow-luxe)] transition-transform hover:scale-110"
        style={{ height: 52, width: 52 }}
      >
        <Phone className="h-5 w-5" />
      </a>
      {show && (
        <button
          onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
          aria-label="Back to top"
          className="grid place-items-center rounded-full bg-accent text-accent-foreground shadow-[var(--shadow-gold)] transition-transform hover:scale-110 animate-fade-in"
          style={{ height: 52, width: 52 }}
        >
          <ArrowUp className="h-5 w-5" />
        </button>
      )}
    </div>
  );
}
