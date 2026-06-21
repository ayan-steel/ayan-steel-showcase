import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { useSuspenseQuery } from "@tanstack/react-query";
import { Search } from "lucide-react";
import { ProductCard } from "@/components/product-card";
import { productsQuery, categoriesQuery, brandsQuery } from "@/lib/showroom-queries";
import { ErrorState, NotFoundState } from "@/components/error-state";
import { ProductGridSkeleton, PageHeaderSkeleton } from "@/components/skeletons";
import { Skeleton } from "@/components/ui/skeleton";

export const Route = createFileRoute("/products")({
  head: () => ({
    meta: [
      { title: "All Products — Ayan Steel" },
      { name: "description", content: "Browse the full collection of furniture and steel products at Ayan Steel — filter by category, brand and price." },
    ],
  }),
  loader: ({ context }) => {
    context.queryClient.ensureQueryData(productsQuery);
    context.queryClient.ensureQueryData(categoriesQuery);
    context.queryClient.ensureQueryData(brandsQuery);
  },
  pendingMs: 0,
  pendingComponent: () => (
    <section className="container-luxe py-16 md:py-24">
      <PageHeaderSkeleton />
      <div className="mt-10 grid gap-3 md:grid-cols-[1fr_auto_auto_auto]">
        <Skeleton className="h-12 rounded-full" />
        <Skeleton className="h-12 w-32 rounded-full" />
        <Skeleton className="h-12 w-32 rounded-full" />
        <Skeleton className="h-12 w-40 rounded-full" />
      </div>
      <div className="mt-8"><ProductGridSkeleton count={6} /></div>
    </section>
  ),
  errorComponent: ({ error }) => <ErrorState title="We couldn't load the catalogue" error={error} />,
  notFoundComponent: () => <NotFoundState />,
  component: ProductsPage,
});

function ProductsPage() {
  const { data: products } = useSuspenseQuery(productsQuery);
  const { data: categories } = useSuspenseQuery(categoriesQuery);
  const { data: brands } = useSuspenseQuery(brandsQuery);

  const [q, setQ] = useState("");
  const [cat, setCat] = useState<string>("All");
  const [brand, setBrand] = useState<string>("All");
  const [sort, setSort] = useState<"featured" | "lowhigh" | "highlow">("featured");

  const filtered = useMemo(() => {
    let list = products.filter((p) => {
      if (cat !== "All" && p.category !== cat) return false;
      if (brand !== "All" && p.brand !== brand) return false;
      if (q && !`${p.name} ${p.brand} ${p.category}`.toLowerCase().includes(q.toLowerCase())) return false;
      return true;
    });
    const priceOf = (p: typeof products[number]) => (p.salePrice ?? p.price ?? 0);
    if (sort === "lowhigh") list = [...list].sort((a, b) => priceOf(a) - priceOf(b));
    if (sort === "highlow") list = [...list].sort((a, b) => priceOf(b) - priceOf(a));
    return list;
  }, [products, q, cat, brand, sort]);

  return (
    <section className="container-luxe py-16 md:py-24">
      <header className="max-w-2xl">
        <span className="text-[11px] uppercase tracking-[0.3em] text-walnut">Catalogue</span>
        <h1 className="mt-3 font-display text-5xl md:text-6xl leading-[1.02]">All Products</h1>
        <p className="mt-4 text-muted-foreground">
          Search by name, filter by category or brand, and sort to your taste.
        </p>
      </header>

      <div className="mt-10 grid gap-3 md:grid-cols-[1fr_auto_auto_auto]">
        <label className="relative">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <input
            value={q} onChange={(e) => setQ(e.target.value)}
            placeholder="Search products…"
            className="w-full rounded-full border border-border bg-card pl-11 pr-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-accent/40"
          />
        </label>
        <Select label="Category" value={cat} onChange={setCat} options={["All", ...categories.map((c) => c.name)]} />
        <Select label="Brand" value={brand} onChange={setBrand} options={["All", ...brands.map((b) => b.name)]} />
        <Select
          label="Sort"
          value={sort}
          onChange={(v) => setSort(v as typeof sort)}
          options={[["featured", "Featured"], ["lowhigh", "Price: Low to High"], ["highlow", "Price: High to Low"]]}
        />
      </div>

      <div className="mt-4 text-sm text-muted-foreground">{filtered.length} result{filtered.length !== 1 ? "s" : ""}</div>

      <div className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {filtered.map((p, i) => <ProductCard key={p.id} product={p} index={i} />)}
      </div>
      {filtered.length === 0 && (
        <div className="mt-16 rounded-3xl border border-dashed border-border p-16 text-center text-muted-foreground">
          {products.length === 0 ? "No products yet. Add some from the admin dashboard." : "No products match your filters."}
        </div>
      )}
    </section>
  );
}

function Select({ value, onChange, options, label }: {
  value: string; onChange: (v: string) => void;
  options: (string | [string, string])[]; label: string;
}) {
  return (
    <select
      aria-label={label}
      value={value}
      onChange={(e) => onChange(e.target.value)}
      className="rounded-full border border-border bg-card px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-accent/40"
    >
      {options.map((o) => {
        const [v, l] = Array.isArray(o) ? o : [o, o];
        return <option key={v} value={v}>{label}: {l}</option>;
      })}
    </select>
  );
}
