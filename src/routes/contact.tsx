import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { Phone, MessageCircle, MapPin, Clock, Instagram, Send } from "lucide-react";
import { CONTACT } from "@/data/showroom";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export const Route = createFileRoute("/contact")({
  head: () => ({
    meta: [
      { title: "Contact — Ayan Steel, Katihar" },
      { name: "description", content: "Visit Ayan Steel showroom in Dehriya, Katihar. Call, WhatsApp or send us a message." },
    ],
  }),
  component: ContactPage,
});

function ContactPage() {
  const [sent, setSent] = useState(false);
  const [busy, setBusy] = useState(false);
  const [form, setForm] = useState({ name: "", phone: "", email: "", subject: "", message: "" });

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    try {
      const { error } = await supabase.from("messages").insert({
        name: form.name.trim(),
        email: form.email.trim() || `${form.phone}@phone.local`,
        phone: form.phone.trim() || null,
        subject: form.subject.trim() || null,
        message: form.message.trim(),
      });
      if (error) throw error;
      setSent(true);
      toast.success("Message sent. We'll be in touch shortly.");
      setForm({ name: "", phone: "", email: "", subject: "", message: "" });
    } catch (err: any) {
      toast.error(err?.message || "Could not send message");
    } finally {
      setBusy(false);
    }
  }
  return (
    <section className="container-luxe py-16 md:py-24">
      <header className="max-w-2xl">
        <span className="text-[11px] uppercase tracking-[0.3em] text-walnut">Get in Touch</span>
        <h1 className="mt-3 font-display text-5xl md:text-6xl leading-[1.02]">Contact Us</h1>
        <p className="mt-4 text-muted-foreground">
          Visit the showroom, call, or drop us a note. We typically reply within an hour during business hours.
        </p>
      </header>

      <div className="mt-12 grid gap-8 lg:grid-cols-[1fr_1.2fr]">
        <div className="space-y-4">
          <InfoCard icon={MapPin} title="Showroom">{CONTACT.address}</InfoCard>
          <InfoCard icon={Phone} title="Call">
            <a href={`tel:${CONTACT.phoneRaw}`} className="block hover:text-walnut">{CONTACT.phone}</a>
            <a href={`tel:${CONTACT.altPhoneRaw}`} className="block hover:text-walnut">{CONTACT.altPhone}</a>
          </InfoCard>
          <InfoCard icon={MessageCircle} title="WhatsApp">
            <a href={`https://wa.me/${CONTACT.whatsapp}`} target="_blank" rel="noreferrer" className="hover:text-walnut">
              Chat with us on WhatsApp
            </a>
          </InfoCard>
          <InfoCard icon={Instagram} title="Instagram">
            <a href={CONTACT.instagramUrl} target="_blank" rel="noreferrer" className="hover:text-walnut">@{CONTACT.instagram}</a>
          </InfoCard>
          <InfoCard icon={Clock} title="Business Hours">
            {CONTACT.hours.map((h) => (<div key={h.day}>{h.day} · {h.time}</div>))}
          </InfoCard>
        </div>

        <div className="rounded-[2rem] overflow-hidden border border-border bg-card">
          <div className="aspect-[16/10]">
            <iframe
              title="Map"
              src={`https://www.google.com/maps?q=${encodeURIComponent(CONTACT.mapsQuery)}&output=embed`}
              className="h-full w-full"
              loading="lazy"
            />
          </div>
          <form className="p-8 space-y-4" onSubmit={onSubmit}>
            <h2 className="font-display text-2xl">Send a message</h2>
            <div className="grid gap-4 sm:grid-cols-2">
              <input required placeholder="Your name" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} maxLength={100} className="rounded-full border border-border bg-background px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-accent/40" />
              <input required type="tel" placeholder="Phone" value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} maxLength={30} className="rounded-full border border-border bg-background px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-accent/40" />
            </div>
            <input type="email" placeholder="Email (optional)" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} maxLength={255} className="w-full rounded-full border border-border bg-background px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-accent/40" />
            <input placeholder="Subject" value={form.subject} onChange={(e) => setForm({ ...form, subject: e.target.value })} maxLength={200} className="w-full rounded-full border border-border bg-background px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-accent/40" />
            <textarea required rows={4} placeholder="What are you looking for?" value={form.message} onChange={(e) => setForm({ ...form, message: e.target.value })} maxLength={2000} className="w-full rounded-2xl border border-border bg-background px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-accent/40" />
            <button
              type="submit"
              disabled={busy}
              className="inline-flex items-center gap-2 rounded-full bg-foreground px-6 py-3 text-sm font-medium text-background hover:scale-[1.03] transition disabled:opacity-50"
            >
              <Send className="h-4 w-4" /> {busy ? "Sending…" : sent ? "Thank you!" : "Send Message"}
            </button>
            {sent && <p className="text-sm text-muted-foreground">We'll get back to you shortly.</p>}
          </form>
        </div>
      </div>
    </section>
  );
}

function InfoCard({ icon: Icon, title, children }: { icon: any; title: string; children: React.ReactNode }) {
  return (
    <div className="rounded-3xl border border-border bg-card p-6 flex gap-4">
      <div className="grid h-11 w-11 shrink-0 place-items-center rounded-2xl bg-foreground text-background">
        <Icon className="h-5 w-5" />
      </div>
      <div>
        <div className="text-[11px] uppercase tracking-[0.2em] text-muted-foreground">{title}</div>
        <div className="mt-1 text-sm leading-relaxed">{children}</div>
      </div>
    </div>
  );
}
