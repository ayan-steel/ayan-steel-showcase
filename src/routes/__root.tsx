import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import {
  Outlet,
  Link,
  createRootRouteWithContext,
  useRouter,
  HeadContent,
  Scripts,
} from "@tanstack/react-router";
import { useEffect, type ReactNode } from "react";

import "@fontsource/playfair-display/400.css";
import "@fontsource/playfair-display/500.css";
import "@fontsource/playfair-display/600.css";
import "@fontsource/inter/400.css";
import "@fontsource/inter/500.css";
import "@fontsource/inter/600.css";

import appCss from "../styles.css?url";
import { reportLovableError } from "../lib/lovable-error-reporting";
import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";
import { FloatingActions } from "@/components/floating-actions";
import { Toaster } from "@/components/ui/sonner";
import { useRouterState } from "@tanstack/react-router";

function NotFoundComponent() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4">
      <div className="max-w-md text-center">
        <h1 className="font-display text-7xl text-foreground">404</h1>
        <h2 className="mt-4 text-xl font-medium text-foreground">Page not found</h2>
        <p className="mt-2 text-sm text-muted-foreground">
          This piece isn't in our showroom. Let's get you home.
        </p>
        <div className="mt-6">
          <Link
            to="/"
            className="inline-flex items-center justify-center rounded-full bg-foreground px-5 py-2.5 text-sm font-medium text-background hover:scale-[1.03] transition-transform"
          >
            Back home
          </Link>
        </div>
      </div>
    </div>
  );
}

function ErrorComponent({ error, reset }: { error: Error; reset: () => void }) {
  console.error(error);
  const router = useRouter();
  useEffect(() => {
    reportLovableError(error, { boundary: "tanstack_root_error_component" });
  }, [error]);

  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4">
      <div className="max-w-md text-center">
        <h1 className="font-display text-2xl text-foreground">Something went wrong</h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Please refresh or head back home.
        </p>
        <div className="mt-6 flex flex-wrap justify-center gap-2">
          <button
            onClick={() => { router.invalidate(); reset(); }}
            className="rounded-full bg-foreground px-5 py-2.5 text-sm font-medium text-background"
          >
            Try again
          </button>
          <a href="/" className="rounded-full border border-border px-5 py-2.5 text-sm font-medium">
            Go home
          </a>
        </div>
      </div>
    </div>
  );
}

export const Route = createRootRouteWithContext<{ queryClient: QueryClient }>()({
  head: () => ({
    meta: [
      { charSet: "utf-8" },
      { name: "viewport", content: "width=device-width, initial-scale=1" },
      { title: "Ayan Steel — Premium Furniture & Steel Solutions, Katihar" },
      { name: "description", content: "Ayan Steel — premium furniture and steel showroom in Katihar, Bihar. Steel almirahs, executive chairs, sofas, dining tables, office and custom furniture from trusted brands." },
      { name: "author", content: "Ayan Steel" },
      { name: "theme-color", content: "#F5F1EA" },
      { property: "og:title", content: "Ayan Steel — Premium Furniture & Steel Solutions, Katihar" },
      { property: "og:description", content: "Ayan Steel — premium furniture and steel showroom in Katihar, Bihar. Steel almirahs, executive chairs, sofas, dining tables, office and custom furniture from trusted brands." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
      { name: "twitter:title", content: "Ayan Steel — Premium Furniture & Steel Solutions, Katihar" },
      { name: "twitter:description", content: "Ayan Steel — premium furniture and steel showroom in Katihar, Bihar. Steel almirahs, executive chairs, sofas, dining tables, office and custom furniture from trusted brands." },
      { property: "og:image", content: "https://pub-bb2e103a32db4e198524a2e9ed8f35b4.r2.dev/b6fbf320-f4b3-457c-9a32-a51b62c5fc97/id-preview-33903339--112c7938-c1cb-4be1-bec8-2636316d870d.lovable.app-1782373792451.png" },
      { name: "twitter:image", content: "https://pub-bb2e103a32db4e198524a2e9ed8f35b4.r2.dev/b6fbf320-f4b3-457c-9a32-a51b62c5fc97/id-preview-33903339--112c7938-c1cb-4be1-bec8-2636316d870d.lovable.app-1782373792451.png" },
    ],
    links: [{ rel: "stylesheet", href: appCss }],
  }),
  shellComponent: RootShell,
  component: RootComponent,
  notFoundComponent: NotFoundComponent,
  errorComponent: ErrorComponent,
});

function RootShell({ children }: { children: ReactNode }) {
  return (
    <html lang="en">
      <head><HeadContent /></head>
      <body>
        {children}
        <Scripts />
      </body>
    </html>
  );
}

function RootComponent() {
  const { queryClient } = Route.useRouteContext();
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  const chrome = !pathname.startsWith("/admin") && !pathname.startsWith("/auth");
  return (
    <QueryClientProvider client={queryClient}>
      {chrome && <SiteHeader />}
      <main className={chrome ? "min-h-screen pt-20" : "min-h-screen"}>
        <Outlet />
      </main>
      {chrome && <SiteFooter />}
      {chrome && <FloatingActions />}
      <Toaster richColors position="top-right" />
    </QueryClientProvider>
  );
}
