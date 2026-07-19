import { createFileRoute, Link } from "@tanstack/react-router";
import { useSuspenseQuery } from "@tanstack/react-query";
import { queryOptions } from "@tanstack/react-query";
import { motion } from "framer-motion";
import { Wrench, Phone, MessageCircle, ArrowUpRight } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { SignedImage } from "@/components/signed-image";
import { Button } from "@/components/ui/button";
import { ErrorState } from "@/components/error-state";
import { Skeleton } from "@/components/ui/skeleton";
import { CONTACT } from "@/data/showroom";

export type RepairService = {
  id: string;
  title: string;
  description: string | null;
  before_image: string | null;
  after_image: string | null;
};

export const repairServicesQuery = queryOptions({
  queryKey: ["showroom", "repair_services"],
  queryFn: async (): Promise<RepairService[]> => {
    const { data, error } = await supabase
      .from("repair_services")
      .select("id, title, description, before_image, after_image")
      .eq("is_active", true)
      .order("display_order", { ascending: true });
    if (error) throw error;
    return data ?? [];
  },
  staleTime: 60_000,
});

export const Route = createFileRoute("/repair-services")({
  head: () => ({
    meta: [
      { title: "Repair Services — Ayan Steel" },
      { name: "description", content: "Expert repair services for steel furniture, appliances, gates, and welding work in Katihar." },
      { property: "og:title", content: "Repair Services — Ayan Steel" },
      { property: "og:description", content: "Before & after photos of professional steel, appliance, and welding repair work." },
    ],
  }),
  loader: ({ context }) => context.queryClient.ensureQueryData(repairServicesQuery),
  pendingMs: 0,
  pendingComponent: () => (
    <section className="container-luxe py-16">
      <Skeleton className="h-10 w-72 mb-6" />
      <div className="grid gap-8 md:grid-cols-2">
        {Array.from({ length: 4 }).map((_, i) => <Skeleton key={i} className="aspect-[4/3] rounded-3xl" />)}
      </div>
    </section>
  ),
  errorComponent: ({ error }) => <ErrorState title="Couldn't load repair services" error={error} />,
  notFoundComponent: () => null,
  component: RepairServicesPage,
});

function RepairServicesPage() {
  const { data } = useSuspenseQuery(repairServicesQuery);

  return (
    <div className="container-luxe py-16 md:py-24">
      <motion.header
        initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}
        className="max-w-3xl"
      >
        <span className="inline-flex items-center gap-2 text-[11px] uppercase tracking-[0.25em] text-muted-foreground">
          <Wrench className="h-3.5 w-3.5" /> Repair Services
        </span>
        <h1 className="mt-3 font-display text-4xl md:text-5xl leading-tight">Restore. Repair. Renew.</h1>
        <p className="mt-4 text-muted-foreground leading-relaxed">
          Expert repair work for air coolers, refrigerators, washing machines, steel almirahs & racks, iron gates &
          doors, and all welding & steel body work. See real before-and-after results below.
        </p>
        <div className="mt-6 flex flex-wrap gap-2">
          <a href={`https://wa.me/${CONTACT.whatsapp}?text=${encodeURIComponent("Hi, I need a repair service.")}`} target="_blank" rel="noreferrer">
            <Button className="rounded-full bg-[#25D366] text-white hover:bg-[#1ebe57]"><MessageCircle className="h-4 w-4" /> WhatsApp Inquiry</Button>
          </a>
          <a href={`tel:${CONTACT.phoneRaw}`}>
            <Button variant="outline" className="rounded-full"><Phone className="h-4 w-4" /> Call Now</Button>
          </a>
        </div>
      </motion.header>

      {data.length === 0 ? (
        <p className="mt-16 text-center text-muted-foreground">No repair services published yet.</p>
      ) : (
        <div className="mt-12 grid gap-10 md:grid-cols-2">
          {data.map((s, i) => (
            <motion.div
              key={s.id}
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-80px" }}
              transition={{ duration: 0.5, delay: i * 0.05 }}
            >
              <Link
                to="/repair-services/$id"
                params={{ id: s.id }}
                className="group block rounded-3xl border border-border bg-card overflow-hidden shadow-[var(--shadow-soft)] hover:shadow-[var(--shadow-luxe)] transition-all duration-500"
              >
                <div className="grid grid-cols-2">
                  <BeforeAfter label="Before" path={s.before_image} />
                  <BeforeAfter label="After" path={s.after_image} accent />
                </div>
                <div className="p-5 flex items-start justify-between gap-3">
                  <div>
                    <h3 className="font-display text-xl">{s.title}</h3>
                    {s.description && <p className="mt-2 text-sm text-muted-foreground leading-relaxed line-clamp-2">{s.description}</p>}
                  </div>
                  <span className="grid h-9 w-9 shrink-0 place-items-center rounded-full bg-secondary text-foreground transition group-hover:bg-foreground group-hover:text-background">
                    <ArrowUpRight className="h-4 w-4" />
                  </span>
                </div>
              </Link>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
}

function BeforeAfter({ label, path, accent }: { label: string; path: string | null; accent?: boolean }) {
  return (
    <div className="relative aspect-[4/3] bg-secondary flex items-center justify-center p-4 sm:p-6">
      <SignedImage path={path} className="max-h-[80%] max-w-[80%] object-contain" alt={label} />
      <span className={`absolute left-3 top-3 rounded-full px-3 py-1 text-[10px] uppercase tracking-[0.18em] ${accent ? "bg-accent text-accent-foreground" : "bg-foreground/85 text-background"}`}>
        {label}
      </span>
    </div>
  );
}
