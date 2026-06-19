import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/privacy")({
  head: () => ({
    meta: [
      { title: "Privacy Policy — Ayan Steel" },
      { name: "description", content: "How Ayan Steel handles your information." },
    ],
  }),
  component: () => (
    <section className="container-luxe py-16 md:py-24 max-w-3xl">
      <h1 className="font-display text-5xl md:text-6xl">Privacy Policy</h1>
      <div className="mt-10 space-y-5 text-muted-foreground leading-relaxed">
        <p>Ayan Steel respects your privacy. We collect only the information you choose to share with us — typically your name, phone number and message when you contact us through this website.</p>
        <p>We use this information solely to respond to your enquiry, process orders or schedule a showroom visit. We do not sell or share your personal information with third parties.</p>
        <p>This site may use cookies for analytics and to improve your experience. You can disable cookies in your browser settings at any time.</p>
        <p>For questions about this policy, please reach out via our Contact page.</p>
      </div>
    </section>
  ),
});
