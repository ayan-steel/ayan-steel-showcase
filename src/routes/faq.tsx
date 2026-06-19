import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { Plus, Minus } from "lucide-react";
import { FAQS } from "@/data/showroom";

export const Route = createFileRoute("/faq")({
  head: () => ({
    meta: [
      { title: "FAQ — Ayan Steel" },
      { name: "description", content: "Frequently asked questions about delivery, customisation, returns and EMI at Ayan Steel." },
    ],
  }),
  component: FaqPage,
});

function FaqPage() {
  const [open, setOpen] = useState<number | null>(0);
  return (
    <section className="container-luxe py-16 md:py-24 max-w-3xl">
      <header>
        <span className="text-[11px] uppercase tracking-[0.3em] text-walnut">Help</span>
        <h1 className="mt-3 font-display text-5xl md:text-6xl leading-[1.02]">FAQ</h1>
      </header>
      <div className="mt-12 space-y-3">
        {FAQS.map((f, i) => (
          <div key={i} className="rounded-3xl border border-border bg-card overflow-hidden">
            <button
              onClick={() => setOpen(open === i ? null : i)}
              className="w-full flex items-center justify-between gap-4 p-6 text-left"
            >
              <span className="font-display text-lg">{f.q}</span>
              {open === i ? <Minus className="h-5 w-5 text-walnut" /> : <Plus className="h-5 w-5 text-walnut" />}
            </button>
            {open === i && (
              <div className="px-6 pb-6 text-muted-foreground leading-relaxed animate-fade-in">{f.a}</div>
            )}
          </div>
        ))}
      </div>
    </section>
  );
}
