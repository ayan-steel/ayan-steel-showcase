import { useRouter } from "@tanstack/react-router";
import { AlertTriangle, RefreshCw, Home } from "lucide-react";
import { Link } from "@tanstack/react-router";

export function ErrorState({
  title = "Something went wrong",
  message,
  error,
}: {
  title?: string;
  message?: string;
  error?: Error;
}) {
  const router = useRouter();
  const detail =
    message ??
    "We couldn't load this page right now. Please check your connection and try again.";

  return (
    <section className="container-luxe py-24 md:py-32">
      <div className="mx-auto max-w-xl rounded-3xl border border-border bg-card p-10 text-center">
        <div className="mx-auto grid h-14 w-14 place-items-center rounded-2xl bg-foreground text-background">
          <AlertTriangle className="h-6 w-6 text-accent" />
        </div>
        <h1 className="mt-6 font-display text-3xl md:text-4xl">{title}</h1>
        <p className="mt-3 text-muted-foreground leading-relaxed">{detail}</p>
        {error?.message && (
          <p className="mt-4 rounded-xl bg-secondary/60 px-4 py-2 text-xs text-muted-foreground break-words">
            {error.message}
          </p>
        )}
        <div className="mt-8 flex flex-wrap justify-center gap-3">
          <button
            onClick={() => router.invalidate()}
            className="inline-flex items-center gap-2 rounded-full bg-foreground text-background px-6 py-3 text-sm font-medium hover:scale-[1.03] transition"
          >
            <RefreshCw className="h-4 w-4" /> Try again
          </button>
          <Link
            to="/"
            className="inline-flex items-center gap-2 rounded-full border border-border px-6 py-3 text-sm font-medium hover:bg-secondary transition"
          >
            <Home className="h-4 w-4" /> Go home
          </Link>
        </div>
      </div>
    </section>
  );
}

export function NotFoundState({ message = "We couldn't find what you were looking for." }: { message?: string }) {
  return (
    <section className="container-luxe py-24 md:py-32 text-center">
      <span className="text-[11px] uppercase tracking-[0.3em] text-walnut">404</span>
      <h1 className="mt-3 font-display text-5xl md:text-6xl">Not found</h1>
      <p className="mt-4 text-muted-foreground">{message}</p>
      <Link
        to="/"
        className="mt-8 inline-flex items-center gap-2 rounded-full bg-foreground text-background px-6 py-3 text-sm font-medium hover:scale-[1.03] transition"
      >
        <Home className="h-4 w-4" /> Back home
      </Link>
    </section>
  );
}
