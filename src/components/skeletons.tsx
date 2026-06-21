import { Skeleton } from "@/components/ui/skeleton";

export function PageHeaderSkeleton() {
  return (
    <header className="max-w-2xl">
      <Skeleton className="h-3 w-24" />
      <Skeleton className="mt-4 h-12 w-72 md:h-16 md:w-96" />
      <Skeleton className="mt-5 h-4 w-full max-w-lg" />
    </header>
  );
}

export function ProductCardSkeleton() {
  return (
    <div className="rounded-3xl border border-border bg-card overflow-hidden">
      <Skeleton className="aspect-[4/5] w-full rounded-none" />
      <div className="p-5 space-y-3">
        <Skeleton className="h-3 w-20" />
        <Skeleton className="h-5 w-3/4" />
        <Skeleton className="h-4 w-24" />
      </div>
    </div>
  );
}

export function ProductGridSkeleton({ count = 6 }: { count?: number }) {
  return (
    <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
      {Array.from({ length: count }).map((_, i) => <ProductCardSkeleton key={i} />)}
    </div>
  );
}

export function TileGridSkeleton({ count = 6, aspect = "aspect-[5/4]" }: { count?: number; aspect?: string }) {
  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {Array.from({ length: count }).map((_, i) => (
        <Skeleton key={i} className={`${aspect} w-full rounded-3xl`} />
      ))}
    </div>
  );
}

export function ChipGridSkeleton({ count = 10 }: { count?: number }) {
  return (
    <div className="grid gap-3 grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
      {Array.from({ length: count }).map((_, i) => (
        <Skeleton key={i} className="h-14 rounded-2xl" />
      ))}
    </div>
  );
}

export function SectionSkeleton({ children }: { children: React.ReactNode }) {
  return (
    <section className="container-luxe py-16 md:py-24">
      <PageHeaderSkeleton />
      <div className="mt-12">{children}</div>
    </section>
  );
}

export function HeroSkeleton() {
  return (
    <section className="relative -mt-20 min-h-[100svh] bg-gradient-to-b from-secondary to-muted">
      <div className="container-luxe relative flex min-h-[100svh] flex-col justify-end pb-24 pt-32">
        <div className="max-w-3xl space-y-5">
          <Skeleton className="h-6 w-64 rounded-full" />
          <Skeleton className="h-20 w-full" />
          <Skeleton className="h-20 w-4/5" />
          <Skeleton className="h-5 w-full max-w-md" />
          <div className="flex gap-3 pt-4">
            <Skeleton className="h-12 w-44 rounded-full" />
            <Skeleton className="h-12 w-44 rounded-full" />
          </div>
        </div>
      </div>
    </section>
  );
}
