import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { useSuspenseQuery } from "@tanstack/react-query";
import { ChevronLeft } from "lucide-react";
import { categoriesQuery, productsQuery } from "@/lib/showroom-queries";
import { ProductCard } from "@/components/product-card";
import { ErrorState, NotFoundState } from "@/components/error-state";
import { PageHeaderSkeleton, ProductGridSkeleton } from "@/components/skeletons";

export const Route = createFileRoute("/categories/$slug")({
  head: ({ params }) => ({
    meta: [
      { title: `${params.slug.replace(/-/g, " ")} — Ayan Steel` },
      { name: "description", content: "Browse this category at Ayan Steel showroom, Katihar." },
    ],
  }),
  loader: ({ context }) => {
    context.queryClient.ensureQueryData(categoriesQuery);
    context.queryClient.ensureQueryData(productsQuery);
  },
  pendingMs: 0,
  pendingComponent: () => (
    <section className="container-luxe py-16 md:py-24">
      <PageHeaderSkeleton />
      <div className="mt-8"><ProductGridSkeleton count={6} /></div>
    </section>
  ),
  errorComponent: ({ error }) => <ErrorState title="We couldn't load this category" error={error} />,
  notFoundComponent: () => <NotFoundState />,
  component: CategoryPage,
});

function CategoryPage() {
  const { slug } = Route.useParams();
  const { data: categories } = useSuspenseQuery(categoriesQuery);
  const { data: products } = useSuspenseQuery(productsQuery);

  const category = categories.find((c) => c.slug === slug);
  if (!category) throw notFound();

  const filtered = products.filter((p) => p.category === category.name);

  return (
    <section className="container-luxe py-12 md:py-16">
      <Link to="/categories" className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground">
        <ChevronLeft className="h-4 w-4" /> All Categories
      </Link>

      <header className="mt-6 max-w-2xl">
        <span className="text-[11px] uppercase tracking-[0.3em] text-walnut">Category</span>
        <h1 className="mt-3 font-display text-5xl md:text-6xl leading-[1.02]">{category.name}</h1>
        {category.description && (
          <p className="mt-4 text-muted-foreground">{category.description}</p>
        )}
        <p className="mt-2 text-sm text-muted-foreground">{filtered.length} product{filtered.length !== 1 ? "s" : ""}</p>
      </header>

      {filtered.length === 0 ? (
        <div className="mt-16 rounded-3xl border border-dashed border-border p-16 text-center text-muted-foreground">
          No products in this category yet.{" "}
          <Link to="/products" className="underline">See all products →</Link>
        </div>
      ) : (
        <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {filtered.map((p, i) => <ProductCard key={p.id} product={p} index={i} />)}
        </div>
      )}
    </section>
  );
}
