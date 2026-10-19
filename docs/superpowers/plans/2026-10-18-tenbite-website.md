# TenBite Website Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build the TenBite picnic-themed danusan ordering site — a 2-page React SPA backed entirely by a Google Spreadsheet through an Apps Script Web App, with no database.

**Architecture:** React 19 + Vite SPA with `react-router-dom`. All product/settings data and order submission flow through one Apps Script endpoint (`?action=bootstrap` for read, `POST` for order). Cart lives in React Context + `useReducer`, persisted to `localStorage`. Visual identity is a bespoke picnic theme (gingham, cork board, wood plates, price stars) built with plain CSS variables + hand-authored SVG — no CSS framework, because the design is entirely custom illustration and Tailwind would fight it.

**Tech Stack:** React 19, Vite 8, react-router-dom 7, plain CSS (custom properties), hand-authored SVG assets.

**Spec:** `config/prd.md` (requirements), `config/design.md` (visual design)

## Global Constraints

- Endpoint: `VITE_APPS_SCRIPT_URL` in `.env`; value `https://script.google.com/macros/s/AKfycbykUnYfVxYWz_gr91AFgmh1MPmdeHcUYusqkrNZdqX5-N8fVMwfkb_iozYkg7rJXZeW/exec`
- Read via `GET ?action=bootstrap` → `{ ok, products: [...], settings: {...} }` (one network call; `action=products` and `action=settings` also exist)
- Products response fields: `id, nama, harga, deskripsi, gambar, stok, urutan`. `aktif` is filtered server-side.
- POST body must be `Content-Type: text/plain;charset=utf-8` with a JSON string body — this avoids a CORS preflight that Apps Script cannot answer. The 302 to `script.googleusercontent.com` is followed automatically by `fetch`; CORS is `access-control-allow-origin: *` on both hops.
- POST body shape: `{ nama, kelas, no_telp, catatan, metode_bayar, items: [{ id, qty }], website }`. `website` is the honeypot — must be sent as `""`.
- Server error codes: `VALIDASI_GAGAL`, `STOK_TIDAK_CUKUP`, `PRODUK_TIDAK_DITEMUKAN`, `TOKO_TUTUP`, `SPAM_TERDETEKSI`, `SERVER_ERROR`, `AKSI_TIDAK_DIKENAL`
- Server success response: `{ ok: true, orderId, total }`
- **Server caps qty at 1–99 per item** ("Jumlah harus bilangan bulat 1–99"), regardless of stock. Client stepper max = `min(stok, 99)`.
- Server is authoritative: it recomputes `total` from the `Products` sheet and validates all fields. Client validation exists only for UX.
- Language: Bahasa Indonesia throughout the UI.
- Mobile-first from 360px to 1440px. Touch targets ≥ 44×44px. WCAG AA contrast. Honour `prefers-reduced-motion`.
- All decoration carries `aria-hidden="true"`. All product images have `alt` = product name.
- `catatan` max 200 chars, `nama` 2–50 chars, `kelas` max 20 chars, `no_telp` 9–15 digits matching `08…` or `+628…`.

## Review Focus

The spec does not state behaviour for these; each gets a test in its owning task.

1. **Product photo missing.** `gambar` is empty for all six products today, and a plain `<img src="">` renders a broken icon. A reasonable person expects a finished-looking product, not a broken image. Handled by `ProductImage` fallback chain.
2. **Product found but `stok` is 0 or missing.** `/product/:id` for an out-of-stock item must still render the page with ordering disabled, not crash or show "not found".
3. **Cart holds an item whose price/stock changed in the sheet.** Restoring `localStorage` must not blind-trust cached prices — totals must be recomputed from freshly fetched products, and vanished/inactive products dropped from the cart.
4. **Double-submit.** A double-tap on "Pesan Sekarang" on a slow connection must produce exactly one order row.
5. **Server rejects with `STOK_TIDAK_CUKUP` after client said OK.** The form must keep the user's typed data and surface the server's message verbatim, not clear the form or show a generic failure.

## File Structure

```
.env                                   VITE_APPS_SCRIPT_URL
index.html                             lang=id, fonts, meta
vercel.json, public/_redirects         SPA fallback for static hosts
public/favicon.svg                     TenBite mark
public/uploads/bg-garden.svg           garden backdrop
public/uploads/chef.svg                 chef character
public/uploads/chef-hat.svg             chef hat
public/uploads/basket.svg               strawberry picnic basket
public/uploads/wood.jpg                 wood plate texture (data-URI-free SVG)
public/uploads/products/{id}.svg        fallback food doodles (6)
public/uploads/qris-placeholder.svg     shown when qris.png absent
src/main.jsx                            bootstrap React + router
src/App.jsx                             routes + CartProvider + layout
src/styles/tokens.css                   design tokens, gingham, fonts
src/styles/base.css                     reset, typography, focus, a11y
src/styles/app.css                      component styles
src/api/sheets.js                       getBootstrap(), submitOrder()
src/hooks/useBootstrap.js               loading/error/retry state
src/context/CartContext.jsx             reducer + localStorage + reconcile
src/utils/format.js                     formatRupiah, formatShortPrice
src/utils/validate.js                   validateOrder()
src/utils/whatsapp.js                   buildWaLink()
src/components/Header.jsx               logo, "59" badge, chef decor
src/components/Banner.jsx               settings banner_text
src/components/ProductCard.jsx          plate + star + label + buttons
src/components/ProductImage.jsx         fallback chain
src/components/WoodPlate.jsx            circular wood frame
src/components/PriceStar.jsx            5-point star badge
src/components/NameLabel.jsx            cream script label
src/components/StickyNote.jsx           promo note
src/components/GinghamBorder.jsx        divider
src/components/ContactCard.jsx          WhatsApp + form links
src/components/Footer.jsx               gingham + basket
src/components/CartFab.jsx              floating button + badge
src/components/CartDrawer.jsx           items, stepper, checkout
src/components/OrderForm.jsx            shared form
src/components/PaymentOption.jsx        radio cards
src/components/QrisPanel.jsx            QRIS image + amount
src/components/SuccessModal.jsx         order code + WhatsApp
src/components/Skeleton.jsx             loading placeholders
src/components/ErrorState.jsx           error + retry
src/pages/ProductListPage.jsx           route /
src/pages/ProductDetailPage.jsx         route /product/:id
```

---

### Task 1: Foundation — config, tokens, fonts, assets

**Files:**
- Create: `.env`, `src/styles/tokens.css`, `src/styles/base.css`, `vercel.json`, `public/_redirects`, `public/favicon.svg`
- Delete: `src/App.css`, `src/assets/react.svg`, `src/assets/vite.svg`, `src/assets/hero.png`, `public/icons.svg`
- Modify: `index.html`

**Interfaces:**
- Produces: CSS custom properties `--color-olive`, `--color-olive-dark`, `--color-lime-cream`, `--color-cream`, `--color-cream-dark`, `--color-gingham-red`, `--color-cork`, `--color-wood`, `--color-wood-dark`, `--color-star`, `--color-star-border`, `--color-sticky`, `--color-ink`, `--color-success`, `--color-danger`, `--radius-card`, `--shadow-soft`; utility class `.gingham` and `.receipt-rule`.

- [ ] **Step 1:** Write `.env` with `VITE_APPS_SCRIPT_URL`, and `.env.example` documenting it.
- [ ] **Step 2:** Write `src/styles/tokens.css` with the exact hex values from design.md §2/§4 plus the `.gingham` pattern from §4.
- [ ] **Step 3:** Write `src/styles/base.css`: box-sizing reset, `--color-ink` body text, `:focus-visible` 3px olive outline, `@media (prefers-reduced-motion: reduce)` killing non-essential animation, `.sr-only`.
- [ ] **Step 4:** Load Google Fonts in `index.html`: Lobster Two 700 italic, Fredoka 400/600/700, Nunito 400/600/700, Caveat 700. Set `lang="id"` and the TenBite title/description.
- [ ] **Step 5:** Write `vercel.json` and `public/_redirects` with SPA rewrites to `/index.html`.
- [ ] **Step 6:** Verify `npm run build` succeeds. Then delete the unused Vite demo assets.

---

### Task 2: Static assets

**Files:**
- Create: `public/uploads/bg-garden.svg`, `chef.svg`, `chef-hat.svg`, `basket.svg`, `qris-placeholder.svg`, `receipt.svg`
- Create: `public/uploads/products/{samyang-roll,nasi-ayam-geprek,es-jelly-lumut-coklat,brownies-coklat,roti-gulung-sosis,risol-aneka-rasa}.svg`

**Interfaces:**
- Produces: static paths `/uploads/bg-garden.svg`, `/uploads/chef.svg`, `/uploads/chef-hat.svg`, `/uploads/basket.svg`, `/uploads/qris-placeholder.svg`, `/uploads/receipt.svg`, `/uploads/products/<id>.svg`. Product doodles are keyed by product `id` and consumed by `ProductImage`.

- [ ] **Step 1:** Hand-author `bg-garden.svg` — soft sky, blurred tree canopies, grass, warm light. Must be low-detail so it stays under 4 KB and reads as a blurred photo at `filter: blur(4px)`.
- [ ] **Step 2:** Author the six product doodles in a consistent amateur-but-charming line-and-fill style on a plate-friendly square canvas. Each must be visually distinguishable.
- [ ] **Step 3:** Author `chef.svg`, `chef-hat.svg`, `basket.svg`, `receipt.svg`, `qris-placeholder.svg`.
- [ ] **Step 4:** Verify every SVG parses (no unclosed tags) and total added weight is under 60 KB.

---

### Task 3: Data layer

**Files:**
- Create: `src/api/sheets.js`, `src/hooks/useBootstrap.js`, `src/utils/format.js`, `src/utils/whatsapp.js`

**Interfaces:**
- Produces:
  - `getBootstrap(): Promise<{ products: Product[], settings: Settings }>` — throws `Error` with a Bahasa Indonesia message on failure.
  - `submitOrder(payload: OrderPayload): Promise<{ orderId: string, total: number }>` — throws `Error` whose `code` property is the server's error code and whose `message` is the server's message verbatim.
  - `useBootstrap(): { products, settings, loading, error, reload }`
  - `formatRupiah(n: number): string` → `"Rp10.000"`
  - `formatShortPrice(n: number): string` → `"10k"`, `"11k"`, `"5k"`, `"12,5k"` for non-thousands
  - `buildWaLink(phone: string, message: string): string`
  - `Product = { id, nama, harga, deskripsi, gambar, stok, urutan }`, `Settings = { edition_label, banner_text, sticky_title, sticky_body, contact_name, contact_phone, contact_form_url, store_open }`

- [ ] **Step 1:** Write `formatRupiah` and `formatShortPrice` in `src/utils/format.js`.
- [ ] **Step 2:** Write `src/api/sheets.js`. `getBootstrap` hits `?action=bootstrap`, throws if `!json.ok`. `submitOrder` POSTs `JSON.stringify(payload)` with `Content-Type: text/plain;charset=utf-8`, and on `!json.ok` throws an `Error` carrying `json.error` as `.code` and `json.message` as the message. Coerce `harga`/`stok`/`urutan` with `Number()` and default `gambar` to `""` — the sheet returns them as strings on some rows.
- [ ] **Step 3:** Write `useBootstrap` — the whole hook is one `useEffect` on a `reloadKey` and one `useCallback` exposing `reload()`; `products`/`settings` stay at their last good values while a reload is in flight so a retry never blanks the page.
- [ ] **Step 4:** Write `buildWaLink` in `src/utils/whatsapp.js`: normalise an Indonesian number (`08…` → `628…`, `+62…` → `62…`, strip non-digits) and return `https://wa.me/<digits>?text=<encodeURIComponent(message)>`.
- [ ] **Step 5:** Verify against the live endpoint: `getBootstrap()` returns 6 products with numeric `harga`, and `submitOrder` with a honeypot-filled `website` rejects with code `SPAM_TERDETEKSI` (does not write a row).

---

### Task 4: Cart state

**Files:**
- Create: `src/context/CartContext.jsx`
- Modify: `src/App.jsx`

**Interfaces:**
- Produces: `CartProvider`, and `useCart(): { items, add(product, qty), setQty(id, qty), remove(id), clear(), count, total, reconcile(products) }` where `items` is `[{ id, nama, harga, gambar, stok, qty }]`. `count` is the sum of `qty`; `total` is the sum of `harga * qty`.
- `reconcile(products)` is called once per successful bootstrap load: it refreshes `harga`/`nama`/`stok` from the sheet, clamps `qty` to `min(stok, 99)`, and drops items whose `id` is gone or whose `stok` is 0.

- [ ] **Step 1:** Write the reducer with actions `ADD`, `SET_QTY`, `REMOVE`, `CLEAR`, `RECONCILE`. Persist to `localStorage` key `tenbite.cart.v1` on every change; read it lazily in `useReducer`'s initialiser inside a `try/catch` so corrupt JSON yields an empty cart instead of a white screen.
- [ ] **Step 2:** Clamp every `qty` write to `Math.min(Math.max(1, qty), Math.min(stok, 99))` in the reducer, so an out-of-range value can never reach `localStorage` or the server.
- [ ] **Step 3:** Write `reconcile` and call it from `App` in an effect that runs when `products` changes.
- [ ] **Step 4:** Test the clamp and the reconcile-drop rules with a throwaway `node -e` script against the reducer, then delete it. Assert: adding qty 500 of a `stok: 30` product stores 30; reconciling a cart holding a removed id drops it; reconciling a cart holding `stok: 0` drops it.

---

### Task 5: Product list page

**Files:**
- Create: `src/components/{Header,Banner,ProductCard,ProductImage,WoodPlate,PriceStar,NameLabel,GinghamBorder,Skeleton,ErrorState}.jsx`
- Create: `src/pages/ProductListPage.jsx`

**Interfaces:**
- Consumes: `useBootstrap()`, `useCart()`, `formatRupiah`, `formatShortPrice`
- Produces: `ProductCard({ product, index })`; `ProductImage({ product, alt })`; `WoodPlate({ children, size })`; `PriceStar({ value })`; `Skeleton()`; `ErrorState({ message, onRetry })`

- [ ] **Step 1:** Write `ProductImage`: render `<img>` with `src = product.gambar || '/uploads/products/<id>.svg'`, and an `onError` handler that swaps once to `/uploads/products/<id>.svg` and then to a neutral inline plate SVG. Guard against an error loop with a ref. `loading="lazy"`, `decoding="async"`, `alt` = product name. **Review Focus 1.**
- [ ] **Step 2:** Write `WoodPlate` (circle, 6px `--color-wood-dark` border, gingham square behind rotated -6°) and `PriceStar` (5-point SVG star, `--color-star` fill, `--color-star-border` stroke, price text in white with a brown outline, rotation derived from `index` so it is stable across renders — not `Math.random()`).
- [ ] **Step 3:** Write `ProductCard`. Desktop is a 2-column zig-zag (even index: star+plate left, label right; odd: mirrored). Mobile is one column. Out of stock → grayscale photo, rotated red "HABIS" stamp, both buttons `disabled`. **Review Focus 2.** Zig-zag is CSS `:nth-child` only — no JS layout branching.
- [ ] **Step 4:** Write `Header` — "T" in Lobster Two italic with lime-cream fill and olive outline, "enbite" in Fredoka 700, the `edition_label` badge on a silver plate, chef hat top-left, chef character top-right. Skip the school-logo pill: `logo-school-1.png`/`logo-school-2.png` do not exist and would render broken. `aria-hidden` on all decoration.
- [ ] **Step 5:** Write `Banner` (speech bubble, renders `settings.banner_text`, hidden when empty) and `GinghamBorder` (pure CSS, no asset).
- [ ] **Step 6:** Write `Skeleton` (six cork-board placeholder cards matching the real card's box model so there is no layout shift) and `ErrorState` (message + "Muat Ulang" button).
- [ ] **Step 7:** Write `ProductListPage`: header, banner, cork board grid of `ProductCard`, sticky note from settings, contact card, footer. `loading` → `Skeleton`, `error` → `ErrorState` with `reload` wired to "Muat Ulang". `padding-bottom: 96px` so the FAB never covers content.
- [ ] **Step 8:** Run `npm run dev` and check `/` at 360px, 768px, 1280px. Confirm 6 products, `10k` in stars, `Rp10.000` elsewhere.

---

### Task 6: Cart UI

**Files:**
- Create: `src/components/{CartFab,CartDrawer}.jsx`
- Modify: `src/App.jsx`, `src/pages/ProductListPage.jsx`

**Interfaces:**
- Consumes: `useCart()`
- Produces: `CartFab({ onClick, pulse })`; `CartDrawer({ open, onClose, onCheckout })`

- [ ] **Step 1:** Write `CartFab`: 64px circle, olive fill, gingham border, red count badge, `aria-label="Buka keranjang, N item"`. Bounce animation retriggered by a `pulse` prop that changes when `count` grows.
- [ ] **Step 2:** Write `CartDrawer` as a right slide-in on desktop and a bottom sheet below 640px, with a focus trap, `Esc` to close, backdrop click to close, `role="dialog"` + `aria-modal="true"`, and body scroll lock while open. Restore focus to the FAB on close.
- [ ] **Step 3:** Inside: item rows with circular thumbnail, name, unit price, `- 1 +` stepper (respecting the clamp), and a remove button with an `aria-label`. Dashed receipt rule, then Total. Sticky footer with the full-width **Pesan Semua** button, disabled when `count === 0`. Empty state uses `basket.svg` + "Keranjangmu masih kosong".
- [ ] **Step 4:** Wire "Pesan Semua" to open the checkout form with the whole cart as the order summary. **Review Focus 3** — the summary reads live cart state, so a `reconcile` that drops an item is reflected immediately.

---

### Task 7: Order form, payment, submission

**Files:**
- Create: `src/utils/validate.js`, `src/components/{OrderForm,PaymentOption,QrisPanel,SuccessModal}.jsx`
- Create: `src/pages/ProductDetailPage.jsx`

**Interfaces:**
- Produces:
  - `validateOrder(fields, { maxQty, requireQty }): { ok: boolean, errors: Record<string,string> }` with keys `nama | kelas | no_telp | jumlah | catatan | metode_bayar`. **`validateOrder` is the only place these rules live** — both pages call it.
  - `OrderForm({ mode, items, maxQty, settings, onSuccess })` where `mode` is `'single' | 'cart'`.
  - `PaymentOption({ value, onChange })`; `QrisPanel({ total })`; `SuccessModal({ result, items, total, settings, onClose })`

- [ ] **Step 1:** Write `validateOrder`. Rules from Global Constraints. Trim before checking length. Phone: strip spaces/dashes, then require `^(\+62|62|0)8\d{7,12}$` on the digits. `jumlah`: integer, `≥ 1`, `≤ min(maxQty, 99)`. Return one message per field in Bahasa Indonesia. Number the length checks so 50-char and 200-char limits are exact.
- [ ] **Step 2:** Write `PaymentOption`: two radio cards (QRIS / "Bayar di Tempat"), olive 3px border and a check mark when selected. Real `<input type="radio">` inside a `<label>` for keyboard and screen-reader support, visually hidden but focusable-with-visible-ring via `:focus-visible` on the label.
- [ ] **Step 3:** Write `QrisPanel`: total in large type above `/uploads/qris.png`, with `onError` swapping to `qris-placeholder.svg`, and the text "Scan lalu tekan Pesan Sekarang." Include the `onError` guard so a missing QRIS file never shows a broken image.
- [ ] **Step 4:** Write `OrderForm`. Controlled fields, `validateOrder` on submit and on blur per field. Honeypot `<input name="website">` hidden with `position:absolute; left:-9999px` plus `tabIndex={-1}` and `autoComplete="off"` — not `display:none`, so bots still fill it. Disable the submit button while `submitting` and guard with an in-flight ref so a double click cannot post twice. **Review Focus 4.** On server error show a red banner with the server's message verbatim and keep every field value. **Review Focus 5.** On success call `onSuccess(result)`.
- [ ] **Step 5:** Write `SuccessModal`: order code in large type, item summary, total, payment method, and a "Simpan kode pesanan ini" line. Buttons: **Konfirmasi via WhatsApp** (primary) and **Kembali Belanja**. On mount, call `window.open(waLink, '_blank', 'noopener')` once; if it returns `null` (popup blocked) keep the modal open with the WhatsApp button highlighted and a note to press it — the auto-redirect is best-effort, the button is the guarantee. Build the message from `settings.contact_phone` + order code + items + total.
- [ ] **Step 6:** Write `ProductDetailPage`. `useParams` `id` → find in `products`. Loading → skeleton; not found → "Produk tidak ditemukan" + back button. Two columns at ≥1024px, one below. Ordering UI disabled when `stok === 0`, but the page still renders. **Review Focus 2.** Include "Tambah ke Keranjang" as a secondary action. On success, show `SuccessModal`.
- [ ] **Step 7:** Write `App.jsx`: `BrowserRouter`, `CartProvider`, routes `/` and `/product/:id`, `CartFab` + `CartDrawer` mounted once at the app level so they persist across both routes, and `padding-bottom` on the main content.

---

### Task 8: Verification

- [ ] **Step 1:** `npm run lint` and `npm run build` both clean.
- [ ] **Step 2:** `npm run build && npm run preview`, then drive the built site with a headless browser: add to cart, reload to prove `localStorage` persistence, change qty, remove, checkout. Assert no console errors.
- [ ] **Step 3:** Submit exactly one real test order through the UI (user approved) with `items: [{ id: 'risol-aneka-rasa', qty: 1 }]`. Assert the response has `orderId` and `total: 5000`, and report the `orderId` so the user can delete the row.
- [ ] **Step 4:** Re-run `?action=bootstrap` and compare `stok` for `risol-aneka-rasa` against the pre-order value to determine and document whether the server decrements stock.
- [ ] **Step 5:** Test the API-down path: point `VITE_APPS_SCRIPT_URL` at a dead URL, confirm `ErrorState` renders with a working "Muat Ulang", and that a failed submit keeps the typed form values.
- [ ] **Step 6:** Update `README.md` with setup, the `.env` key, the `public/uploads/` photo drop-in convention, and the QRIS replacement path.
