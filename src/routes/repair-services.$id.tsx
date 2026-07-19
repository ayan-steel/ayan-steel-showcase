import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { useSuspenseQuery, queryOptions } from "@tanstack/react-query";
import { motion } from "framer-motion";
import { ChevronLeft, Phone, MessageCircle, Wrench, ZoomIn } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { getSignedUrl } from "@/lib/storage";
import { ImageLightbox } from "@/components/image-lightbox";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { ErrorState, NotFoundState } from "@/components/error-state";
import { CONTACT } from "@/data/showroom";
import type { RepairService } from "./repair-services";

const repairServiceQuery = (id: string) =>
  queryOptions({
    queryKey: ["showroom", "repair_services", id],
    queryFn: async (): Promise<RepairService | null> => {
      const { data, error } = await supabase
        .from("repair_services")
        .select("id, title, description, before_image, after_image")
        .eq("id", id)
        .maybeSingle();
      if (error) throw error;
      return data;
    },
    staleTime: 60_000,
  });

export const Route = createFileRoute("/repair-services/$id")({
  head: ({ params }) => ({
    meta: [
      { title: `Repair Service — Ayan Steel` },
      { name: "description", content: "Before & after repair details — Ayan Steel, Katihar." },
    ],
  }),
  loader: async ({ context, params }) => {
    await context.queryClient.ensureQueryData(repairServiceQuery(params.id));
  },
  pendingMs: 0,
  pendingComponent: () => (
    <section className="container-luxe py-12">
      <Skeleton className="h-6 w-40" />
      <div className="mt-8 grid gap-6 md:grid-cols-2">
        <Skeleton className="aspect-[4/3] rounded-3xl" />
        <Skeleton className="aspect-[4/3] rounded-3xl" />
      </div>
      <Skeleton className="mt-8 h-32 w-full" />
    </section>
  ),
  errorComponent: ({ error }) => <ErrorState title="Couldn't load this service" error={error} />,
  notFoundComponent: () => <NotFoundState />,
  component: RepairDetail,
});

function RepairDetail() {
  const { id } = Route.useParams();
  const { data: service } = useSuspenseQuery(repairServiceQuery(id));
  const [zoomSrc, setZoomSrc] = useState<string | null>(null);
  if (!service) throw notFound();

  const waText = encodeURIComponent(`Hi, I'm interested in your "${service.title}" repair service.`);

  return (
    <div className="container-luxe py-10 md:py-16">
      <Link
        to="/repair-services"
        className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition"
      >
        <ChevronLeft className="h-4 w-4" /> Back to Repair Services
      </Link>

      <motion.header
        initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}
        className="mt-6 max-w-3xl"
      >
        <span className="inline-flex items-center gap-2 text-[11px] uppercase tracking-[0.25em] text-muted-foreground">
          <Wrench className="h-3.5 w-3.5" /> Repair Service
        </span>
        <h1 className="mt-3 font-display text-4xl md:text-5xl leading-tight">{service.title}</h1>
      </motion.header>

      <div className="mt-10 grid gap-6 md:grid-cols-2">
        <BeforeAfter label="Before" path={service.before_image} />
        <BeforeAfter label="After" path={service.after_image} accent />
      </div>

      {service.description && (
        <div className="mt-10 max-w-3xl">
          <h2 className="font-display text-2xl">About this repair</h2>
          <p className="mt-3 text-muted-foreground leading-relaxed whitespace-pre-line">
            {service.description}
          </p>
        </div>
      )}

      <div className="mt-10 flex flex-wrap gap-3">
        <a href={`https://wa.me/${CONTACT.whatsapp}?text=${waText}`} target="_blank" rel="noreferrer">
          <Button className="rounded-full bg-[#25D366] text-white hover:bg-[#1ebe57]">
            <MessageCircle className="h-4 w-4" /> WhatsApp Inquiry
          </Button>
        </a>
        <a href={`tel:${CONTACT.phoneRaw}`}>
          <Button variant="outline" className="rounded-full"><Phone className="h-4 w-4" /> Call Now</Button>
        </a>
        <a href={`tel:${CONTACT.altPhoneRaw}`}>
          <Button variant="outline" className="rounded-full"><Phone className="h-4 w-4" /> {CONTACT.altPhone}</Button>
        </a>
      </div>
    </div>
  );
}

function BeforeAfter({ label, path, accent }: { label: string; path: string | null; accent?: boolean }) {
  return (
    <div className="relative aspect-[4/3] overflow-hidden rounded-3xl bg-secondary border border-border flex items-center justify-center p-6 sm:p-8">
      <SignedImage path={path} className="max-h-[88%] max-w-[88%] object-contain p-2 sm:p-3" alt={label} />
      <span className={`absolute left-3 top-3 rounded-full px-3 py-1 text-[10px] uppercase tracking-[0.18em] ${accent ? "bg-accent text-accent-foreground" : "bg-foreground/85 text-background"}`}>
        {label}
      </span>
    </div>
  );
}
