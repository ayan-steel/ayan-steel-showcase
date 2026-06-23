import { create } from "zustand";
import { persist } from "zustand/middleware";
import { CONTACT } from "@/data/showroom";

export type CartItem = {
  id: string;
  slug: string;
  name: string;
  price: number;
  image: string | null;
  qty: number;
};

type CartState = {
  items: CartItem[];
  add: (item: Omit<CartItem, "qty">, qty?: number) => void;
  remove: (id: string) => void;
  setQty: (id: string, qty: number) => void;
  clear: () => void;
  total: () => number;
  count: () => number;
};

export const useCart = create<CartState>()(
  persist(
    (set, get) => ({
      items: [],
      add: (item, qty = 1) => set((s) => {
        const existing = s.items.find((i) => i.id === item.id);
        if (existing) {
          return { items: s.items.map((i) => i.id === item.id ? { ...i, qty: i.qty + qty } : i) };
        }
        return { items: [...s.items, { ...item, qty }] };
      }),
      remove: (id) => set((s) => ({ items: s.items.filter((i) => i.id !== id) })),
      setQty: (id, qty) => set((s) => ({
        items: s.items.map((i) => i.id === id ? { ...i, qty: Math.max(1, qty) } : i),
      })),
      clear: () => set({ items: [] }),
      total: () => get().items.reduce((sum, i) => sum + i.price * i.qty, 0),
      count: () => get().items.reduce((sum, i) => sum + i.qty, 0),
    }),
    { name: "ayan-cart" },
  ),
);

type WishlistState = {
  ids: string[];
  toggle: (id: string) => void;
  has: (id: string) => boolean;
  remove: (id: string) => void;
};

export const useWishlist = create<WishlistState>()(
  persist(
    (set, get) => ({
      ids: [],
      toggle: (id) => set((s) => ({
        ids: s.ids.includes(id) ? s.ids.filter((x) => x !== id) : [...s.ids, id],
      })),
      has: (id) => get().ids.includes(id),
      remove: (id) => set((s) => ({ ids: s.ids.filter((x) => x !== id) })),
    }),
    { name: "ayan-wishlist" },
  ),
);

export function buildWhatsAppOrder(items: CartItem[], customer?: { name?: string; phone?: string; note?: string }) {
  const lines: string[] = ["*New Order — Ayan Steel*", ""];
  items.forEach((i, idx) => {
    lines.push(`${idx + 1}. ${i.name} × ${i.qty} — ₹${(i.price * i.qty).toLocaleString("en-IN")}`);
  });
  const total = items.reduce((s, i) => s + i.price * i.qty, 0);
  lines.push("", `*Total: ₹${total.toLocaleString("en-IN")}*`);
  if (customer?.name) lines.push("", `Name: ${customer.name}`);
  if (customer?.phone) lines.push(`Phone: ${customer.phone}`);
  if (customer?.note) lines.push(`Note: ${customer.note}`);
  return `https://wa.me/${CONTACT.whatsapp}?text=${encodeURIComponent(lines.join("\n"))}`;
}

export function buildQuoteWhatsApp(productName: string, qty: number = 1) {
  const text = `Hi, I'd like a quote for *${productName}* (qty: ${qty}). Please share details.`;
  return `https://wa.me/${CONTACT.whatsapp}?text=${encodeURIComponent(text)}`;
}
