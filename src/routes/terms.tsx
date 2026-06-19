import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/terms")({
  head: () => ({
    meta: [
      { title: "Terms & Conditions — Ayan Steel" },
      { name: "description", content: "Terms governing the use of the Ayan Steel website and the purchase of products." },
    ],
  }),
  component: () => (
    <section className="container-luxe py-16 md:py-24 max-w-3xl">
      <h1 className="font-display text-5xl md:text-6xl">Terms & Conditions</h1>
      <div className="mt-10 space-y-5 text-muted-foreground leading-relaxed">
        <p>By using the Ayan Steel website you agree to these terms. Product images, descriptions and prices are provided in good faith and are subject to change without notice.</p>
        <p>Custom and made-to-order products are non-returnable but are covered by our 1-year workmanship warranty against manufacturing defects.</p>
        <p>Delivery timelines are estimates. We will keep you informed of any delays. Risk passes to you on delivery and installation.</p>
        <p>All disputes are subject to the jurisdiction of Katihar, Bihar.</p>
      </div>
    </section>
  ),
});
