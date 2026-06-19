import almirah from "@/assets/product-almirah.jpg";
import chair from "@/assets/product-chair.jpg";
import dining from "@/assets/product-dining.jpg";
import sofa from "@/assets/product-sofa.jpg";
import table from "@/assets/product-table.jpg";
import bookshelf from "@/assets/product-bookshelf.jpg";

export const CONTACT = {
  name: "Ayan Steel",
  tagline: "Premium Furniture & Steel Solutions",
  address: "Dehriya, Near Dehriya Masjid & Dehriya Post Office, Katihar, Bihar, India",
  phone: "8207608151",
  altPhone: "6200427779",
  whatsapp: "918207608151",
  instagram: "ayan_steel_katihar",
  instagramUrl: "https://instagram.com/ayan_steel_katihar",
  hours: [
    { day: "Monday – Saturday", time: "9:00 AM – 8:00 PM" },
    { day: "Sunday", time: "10:00 AM – 5:00 PM" },
  ],
  mapsQuery: "Ayan Steel Dehriya Katihar Bihar",
};

export const CATEGORIES = [
  "Steel Almirah", "Godrej Furniture", "Office Chair", "Office Table",
  "Executive Chair", "Computer Table", "Study Table", "Steel Rack",
  "Locker", "Bookshelf", "Bed", "Sofa", "Dining Table", "Wooden Furniture",
  "School Furniture", "Hospital Furniture", "Reception Furniture",
  "Storage Cabinet", "Custom Furniture",
];

export const BRANDS = [
  "Godrej Interio", "Nilkamal", "Featherlite", "Wipro Furniture",
  "Durian", "Damro", "HOF", "Ayan Steel Originals",
];

export type Product = {
  id: string;
  name: string;
  brand: string;
  category: string;
  price: number;
  salePrice?: number;
  image: string;
  badge?: string;
  description: string;
};

export const PRODUCTS: Product[] = [
  {
    id: "steel-almirah-pro",
    name: "Heritage Steel Almirah",
    brand: "Ayan Steel Originals",
    category: "Steel Almirah",
    price: 18900, salePrice: 15499,
    image: almirah, badge: "Best Seller",
    description: "Four-door brushed steel almirah with locker compartment and powder-coat finish.",
  },
  {
    id: "executive-leather",
    name: "Onyx Executive Chair",
    brand: "Featherlite",
    category: "Executive Chair",
    price: 22500, salePrice: 17999,
    image: chair, badge: "New",
    description: "Top-grain leather, polished aluminium base, multi-tilt mechanism.",
  },
  {
    id: "walnut-dining-6",
    name: "Walnut Six-Seater Dining",
    brand: "Durian",
    category: "Dining Table",
    price: 64000, salePrice: 52900,
    image: dining, badge: "Featured",
    description: "Solid walnut top with hand-finished chairs. Seats six comfortably.",
  },
  {
    id: "linen-lounge-sofa",
    name: "Linen Lounge 3-Seater",
    brand: "HOF",
    category: "Sofa",
    price: 48900, salePrice: 39900,
    image: sofa,
    description: "Boucle linen upholstery on a solid walnut frame with dense foam seats.",
  },
  {
    id: "atelier-study-desk",
    name: "Atelier Study Desk",
    brand: "Ayan Steel Originals",
    category: "Study Table",
    price: 14900, salePrice: 11900,
    image: table, badge: "New",
    description: "Sheesham wood desk with twin drawers and cable management.",
  },
  {
    id: "library-bookshelf",
    name: "Library Bookshelf",
    brand: "Godrej Interio",
    category: "Bookshelf",
    price: 26500,
    image: bookshelf,
    description: "Floor-to-ceiling walnut bookshelf with adjustable shelves.",
  },
];

export const TESTIMONIALS = [
  { name: "Rohit Kumar", role: "Homeowner, Katihar", quote: "The walnut dining set is stunning. Delivery was prompt and the finish is showroom-perfect." },
  { name: "Dr. Ayesha Khan", role: "Clinic Owner", quote: "We furnished our entire reception through Ayan Steel. Beautiful pieces, fair prices, real service." },
  { name: "Sandeep Jha", role: "Office Manager", quote: "Bulk order of executive chairs arrived on time and exceeded expectations. Highly recommend." },
];

export const FAQS = [
  { q: "Do you deliver across Bihar?", a: "Yes — we deliver across Katihar and surrounding districts. Long-distance delivery can be arranged on request." },
  { q: "Can I customise furniture?", a: "Absolutely. Our Custom Furniture category is built around your dimensions, finish and material preferences." },
  { q: "What is your return policy?", a: "Manufacturer defects are replaced within 7 days. Custom orders are non-returnable but covered by our 1-year workmanship warranty." },
  { q: "Do you offer EMI?", a: "Yes, EMI is available on most products through partner banks. Speak to us in-store for current offers." },
  { q: "Are showroom prices final?", a: "Showroom prices are our best value. We occasionally run festive offers — follow us on Instagram for announcements." },
];
