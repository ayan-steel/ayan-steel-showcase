import { createFileRoute } from "@tanstack/react-router";
import { useSuspenseQuery } from "@tanstack/react-query";
import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { MapPin } from "lucide-react";
import { customWorkQuery, type CustomWork } from "@/lib/queries-extra";
import { getSignedUrl } from "@/lib/storage";
import { ErrorState, NotFoundState } from "@/components/error-state";
import { PageHeaderSkeleton, TileGridSkeleton } from "@/components/skeletons";

export const Route = createFileRoute("/custom-work")({
  head: () => ({
    meta: [
      { title: "Custom Work — Ayan Steel" },
      { name: "description", content: "Bespoke furniture and steel projects crafted by Ayan Steel for homes, offices and institutions across Bihar." },
      { property: "og:title", content: "Custom Work — Ayan Steel" },
    ],
  }),
  loader: ({ context }) => { context.queryClient.ensureQueryData(customWorkQuery); },
  pendingMs: 0,
  pendingComponent: () => (
    <section className="container-luxe py-16 md:py-24">
      <PageHeaderSkeleton />
      <div className="mt-12"><TileGridSkeleton count={6} /></div>
    </section>
  ),
  errorComponent: ({ error }) => <ErrorState title="We couldn't load custom work" error={error} />,
  notFoundComponent: () => <NotFoundState />,
  component: CustomWorkPage,
});

function ProjectCard({ project, index }: { project: CustomWork; index: number }) {
  const [src, setSrc] = useState("");
  useEffect(() => {
    let alive = true;
    if (!project.image) { setSrc(""); return; }
    getSignedUrl(project.image).then((u) => { if (alive) setSrc(u); });
    return () => { alive = false; };
  }, [project.image]);
  return (
    <motion.article
      initial={{ opacity: 0, y: 24 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-80px" }}
      transition={{ duration: 0.6, delay: index * 0.05 }}
      className="group relative overflow-hidden rounded-3xl border border-border bg-card hover:shadow-[var(--shadow-luxe)] transition-all"
    >
      <div className="relative aspect-[4/3] overflow-hidden bg-secondary">
        {src ? (
          <img src={src} alt={project.title} loading="lazy" decoding="async" className="absolute inset-0 h-full w-full object-cover transition-transform duration-[1200ms] group-hover:scale-105" />
        ) : (
          <div className="absolute inset-0 bg-gradient-to-br from-secondary to-muted" />
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-foreground/70 via-transparent to-transparent opacity-90 group-hover:opacity-100 transition" />
        {project.location && (
          <span className="absolute left-4 top-4 inline-flex items-center gap-1 rounded-full bg-background/90 backdrop-blur px-3 py-1 text-xs">
            <MapPin className="h-3 w-3" /> {project.location}
          </span>
        )}
      </div>
      <div className="p-6">
        <h3 className="font-display text-2xl leading-tight">{project.title}</h3>
        {project.description && <p className="mt-2 text-sm text-muted-foreground leading-relaxed">{project.description}</p>}
      </div>
    </motion.article>
  );
}

function CustomWorkPage() {
  const { data: projects } = useSuspenseQuery(customWorkQuery);
  return (
    <section className="container-luxe py-16 md:py-24">
      <header className="max-w-2xl">
        <span className="text-[11px] uppercase tracking-[0.3em] text-walnut">Bespoke</span>
        <h1 className="mt-3 font-display text-5xl md:text-6xl leading-[1.02]">Custom Work</h1>
        <p className="mt-4 text-muted-foreground">
          Projects we've crafted for homes, offices, clinics and institutions across Bihar.
        </p>
      </header>

      {projects.length === 0 ? (
        <div className="mt-16 rounded-3xl border border-dashed border-border p-16 text-center text-muted-foreground">
          Custom work projects will appear here as the admin adds them.
        </div>
      ) : (
        <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {projects.map((p, i) => <ProjectCard key={p.id} project={p} index={i} />)}
        </div>
      )}
    </section>
  );
}
