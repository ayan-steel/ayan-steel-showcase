
# Phase 3 — Feature Expansion (zero data loss)

**Guarantee:** No existing product, image, category, brand, banner, or message row is modified, deleted, or reset. All work is additive: new tables, new columns with safe defaults, new pages, expanded admin UI. Existing `products`, `categories`, `brands`, `banners`, `messages` rows stay byte-for-byte intact.

---

## 1. Contact info update (sitewide)

Replace phone numbers everywhere with:
- Primary: **+91 97096 22371** (also WhatsApp)
- Secondary: **+91 62004 27779**

Touched files: `src/data/showroom.ts` (single source of truth — `CONTACT.phone`, `altPhone`, `whatsapp`). Header, footer, contact page, floating WhatsApp/Call buttons, product detail CTAs all read from there.

---

## 2. Database additions (additive migration, no data touched)

New columns on `public.products` (all nullable / defaults — existing rows unaffected):
- `length_cm numeric`, `breadth_cm numeric`, `width_cm numeric`, `height_cm numeric`
- `warranty text default '5 Years'`
- `rating numeric(2,1) default 4.8`
- `material text`

New tables (with proper GRANT + RLS, public SELECT on active rows, admin manage):
- `custom_work` — id, title, description, image_url, location, display_order, is_active, timestamps
- `videos` — id, title, description, video_type ('mp4'|'youtube'), video_url, thumbnail_url, display_order, is_active, timestamps
- `messages.subject text` column added (nullable)

No DROP, no UPDATE of existing rows.

---

## 3. Public site — new pages & routes

- **`/products/$slug`** — Product Details page:
  - Image gallery (up to 3 angles) with zoom-on-hover/click (CSS transform + lightbox dialog).
  - Name, price (kept visible everywhere as requested), description, dimensions table (L×B×W×H), warranty, star rating, specifications list, material.
  - CTAs: **Add to Cart**, **Buy Now** (→ WhatsApp order with cart contents), **WhatsApp**, **Call Now**, **Request a Quote** (opens dialog → saves to `messages`).
  - Quantity selector + Continue Shopping link.
  - Related Products row (same category, exclude current, limit 6).
  - Framer Motion entrance + image transitions.

- **`/categories/$slug`** — fix click-through: filters products by category name. (Existing `/categories` tile now links here. Also accept `?category=` on `/products` for safety.)

- **`/custom-work`** — replaces Brands link in nav. Brand pages remain accessible but hidden from nav.

- **`/cart`** — list, qty editor, remove, totals, "Send order on WhatsApp" (composes order message to primary number), Continue Shopping.

- **`/wishlist`** — localStorage-backed list, add/remove buttons on cards.

Search & filters on `/products` already exist; will add **Material** filter.

---

## 4. Shopping cart (no payments)

- Zustand store persisted to localStorage: `useCart` (items: id, name, price, image, qty), `useWishlist`.
- Header gets cart/wishlist icons with counts.
- "Buy Now" / cart checkout opens WhatsApp with formatted order: items, qtys, prices, total, customer placeholder.

---

## 5. Admin dashboard improvements

Products tab (existing form extended — same component, just more fields):
- Up to 3 image uploads with per-image preview, replace, delete buttons.
- Editable price, description, category (dropdown), brand, dimensions, warranty, rating (0–5), specifications (JSON or key/value rows), material.
- Existing products show unchanged data; new fields show defaults until edited.

Categories tab: already supports create/edit/delete. Add reorder + active toggle (already present).

New tabs:
- **Custom Work** — CRUD (image, title, description, location, order, active).
- **Videos** — CRUD (title, description, type, URL or MP4 upload, thumbnail upload, order, active).
- **Messages** — add Subject column display.

---

## 6. Custom Work section

- Replaces "Brands" entry in header/footer nav.
- Homepage section pulls from `custom_work` (active, ordered).
- `/custom-work` page: responsive masonry-ish grid with hover overlays, location badge.
- Old `/brands` route preserved but unlinked (so existing brand data stays accessible if needed later).

---

## 7. Video gallery

- `/videos` route reads from new `videos` table.
- MP4 files served from existing `showroom` storage bucket (signed URLs).
- YouTube videos embedded via iframe with thumbnail-click reveal for performance.
- Lazy-loaded, responsive grid, motion fade-in.

---

## 8. Contact page improvements

Form fields: Name, Phone, Email, Subject, Message. Validated with Zod. Saved to `messages.subject` + existing columns. Success toast + inline confirmation. Admin sees Subject column.

---

## 9. Performance pass

- `loading="lazy"` + `decoding="async"` on all `<img>` (already on most; sweep added).
- Video thumbnails preferred over autoplay.
- Signed URL caching memo per path.
- Route preloading on intent for product cards.

---

## Technical notes

- **No destructive SQL.** Migration is `ALTER TABLE … ADD COLUMN IF NOT EXISTS` + `CREATE TABLE IF NOT EXISTS` only.
- Cart/wishlist are client-only (localStorage). No new auth, no checkout backend.
- All new admin features gated by existing `has_role('admin')` check.
- Brand-related tables, data, and route remain in DB & code untouched; only the public nav link is swapped for Custom Work.

---

## Order of execution

1. Migration (new columns + 2 new tables + messages.subject).
2. Update `CONTACT` constants + sweep phone numbers.
3. Add cart/wishlist store, header icons, `/cart`, `/wishlist`.
4. Build `/products/$slug` with all CTAs + related products.
5. Build `/categories/$slug` and rewire category tiles + `/products` to link by category.
6. Build `/custom-work` page + nav swap; admin Custom Work tab.
7. Build `/videos` (live) + admin Videos tab.
8. Extend product admin form with new fields & 3-image manager.
9. Extend contact form with Subject; admin Messages shows Subject.
10. Final lazy-load / perf sweep + smoke test.

After your approval I'll run the migration first, then ship the code in batches.
