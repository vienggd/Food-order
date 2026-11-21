# UI Spec — Sprint 1 (Campus Café Pre-order)

Final screens (mobile with every state, plus desktop): [`design/index.html`](design/index.html), exported from the Claude Design canvas. First low-fidelity sketch: [`wireframes.html`](wireframes.html). This file covers screens, navigation, and the states each screen must handle; when a screen and this file disagree, this file wins.

## Visual design

- **Fonts** (Google Fonts): headings and the brand in **Fraunces** (600); everything else in **Plus Jakarta Sans** (400–800).
- **Colours:**

  | Token | Hex | Used for |
  |---|---|---|
  | forest | `#2F4A3A` | primary buttons, headings, active nav, accepted status |
  | espresso | `#2B1B14` | body text, dark cart bar, desktop sidebar |
  | beige | `#F3EBDD` | app background |
  | cashmere | `#FAF5EC` | page background outside the app |
  | sienna | `#D4874A` | "+" add buttons, badges, cart count (dark text on it) |
  | caramel | `#E0B07A` | highlights on dark green or espresso |
  | muted | `#6E5E4F` | secondary text |
  | placed | `#F2DDC4` / `#6B3410` | PLACED status pill (background / text) |
  | error | `#FDE3E0` / `#7A1C12` | error boxes |
  | success | `#E2F2E6` / `#1E5631` | success boxes |

- **Shapes:** white cards with soft shadows and 20px corners on phones (16px on desktop); pill-shaped buttons; inputs 14px corners.
- **Motion:** buttons lift 1px on hover and press in on click; order cards lift 2px. An orange focus ring shows for keyboard users. All motion turns off under "reduce motion".
- **Photos:** two stand-in café photos (credits on `design/index.html`). Menu items have no photos in Sprint 1 (the menu has no image field).

Conventions:
- Money is stored as integer satang and shown as `฿xx.xx` (e.g. `15500` → `฿155.00`).
- Times are shown in local time: today → `10:15`, yesterday → `Yesterday 12:02`, older → `3 Nov 09:40`.
- Pickup is always "ASAP" in Sprint 1 (pickup slots come in Sprint 3).
- Auth endpoint paths (`/api/auth/login`, `/api/auth/logout`, `/api/auth/me`) are assumed here; change them if the API contract names them differently.

---

## Navigation

```
/login ──(login OK)──► GET /api/auth/me
                          ├─ CUSTOMER ─► /menu ──(Place order)──► /orders/:id
                          │                ▲                          ▲
                          │                └──── header ──── /orders ─┘ (click row)
                          └─ OPERATOR ─► /operator/orders
```

| Route | Role | Screen |
|---|---|---|
| `/login` | public | Login |
| `/menu` | CUSTOMER | Menu + cart (customer home) |
| `/orders` | CUSTOMER | My orders |
| `/orders/:id` | CUSTOMER | Order detail |
| `/operator/orders` | OPERATOR | Order queue (operator home) |
| `/` | any | Redirects: not logged in → `/login`; customer → `/menu`; operator → `/operator/orders` |
| anything else | any | "Page not found" + Go home |

Route guard: on app start the client calls `GET /api/auth/me`. No session → `/login`. A route for the other role → redirect to the user's own home with "You don't have access to that page."

---

## Shared UI behaviour

**Shared layout** (every screen except Login)
- **Phone:** a top bar with "Hey, `<name>`", the brand and a role chip, plus a **Log out** icon button. A bottom tab bar: CUSTOMER sees **Menu · Cart · My orders** (Cart is a raised centre button with the number of cart lines; it opens the cart view on `/menu`); OPERATOR sees **Order queue**.
- **Desktop:** a dark sidebar on the left with the brand, the same role-based links (current page highlighted in green, the cart count next to Menu), the user's name and role, and **Log out** at the bottom. Above the content: a breadcrumb ("Pre-order / Menu") and the page title.
- Name and role come from `GET /api/auth/me`.
- Log out → `POST /api/auth/logout`; the button shows a spinner / "Logging out…" (disabled). Whatever the result, clear the client user and go to `/login`.
- While `/me` is loading, show placeholders and no links.

**Loading** — lists show grey placeholder rows; action buttons are disabled and change label ("Logging in…", "Placing order…", "Accepting…"). This also prevents double-submits.

**Empty** — a white card with a bold one-line title, a short sentence and, where useful, a next step (e.g. "Browse the menu").

**Button labels** — always a verb and an object: "Reload menu", "Refresh queue", "Accept order", "Place order".

**Errors** — every API error has the shape `{ error: { code, message, details } }`.

| Code | HTTP | What the UI does |
|---|---|---|
| `VALIDATION_ERROR` | 400 | Show `error.message` in an error box at the top of the form/cart. If `error.details` names fields or items, also mark those fields/lines. User input is kept. |
| `UNAUTHENTICATED` | 401 | On `/login`: show "Incorrect email or password." On any other screen: session has expired → clear the user, go to `/login`, show "Your session has ended. Please log in again." |
| `FORBIDDEN` | 403 | Redirect to the user's own home and show "You don't have access to that page." |
| `NOT_FOUND` | 404 | Show a "not found" empty state with a back link (e.g. "Order not found." → Back to my orders). Used for missing ids **and** other customers' orders, so the UI can't tell them apart. |
| `INVALID_STATE` | 409 | Show `error.message` (e.g. "Already accepted by another staff member."), then reload the data, because what's on screen is out of date. |
| no `{error}` body (network down, 500, timeout) | — | "Something went wrong. Please try again." + **Try again** button. |

Rule of thumb: the UI shows the server's `message` text; it does not invent its own except for the network fallback and the generic 401/403 notes above. Client-side checks are only for convenience; the server is the source of truth.

---

## S1 — Login

- **Purpose:** sign in with a seeded account. No self-registration (no sign-up link).
- **Role:** public.
- **Route:** `/login`
- **Feature:** F-01
- **API:** `POST /api/auth/login` `{ email, password }` → sets httpOnly session cookie; then `GET /api/auth/me` → `{ id, name, role }`.
- **Fields:** Email (text), Password (password), **Log in** button.
- **States:**
  - Default: empty form (focus on Email).
  - Loading: button "Logging in…", disabled.
  - Error 401: error box "Incorrect email or password." — same text for unknown email and wrong password, so attackers can't find valid emails. Password cleared, email kept.
  - Error network/500: "Something went wrong. Please try again."
  - Success: redirect — CUSTOMER → `/menu`, OPERATOR → `/operator/orders`. If already logged in when opening `/login`, redirect the same way.
  - Session expired (arrived from a 401 elsewhere): info box "Your session has ended. Please log in again."
- **Validation (client, before sending):** "Email is required." / "Enter a valid email." / "Password is required."

## S2 — Menu + cart

- **Purpose:** browse the menu, build a cart, place an order.
- **Role:** CUSTOMER.
- **Route:** `/menu` (customer home)
- **Features / rules:** F-02 (browse), F-03 (place order); BR-01, BR-02, BR-03, BR-04.
- **API:**
  - `GET /api/menu` → items `{ id, name, price, isAvailable }`.
  - `POST /api/orders` with body `{ items: [{ menuItemId, quantity }] }` — **never prices** (BR-04; server returns 400 if prices are sent). Response: the created order (incl. `id` and server total).
- **Fields shown:**
  - Banner: "Order ahead. Skip the line." and "Coffee and snacks from ฿35. Pickup ASAP at the counter."
  - Menu list (phone: one row per item; desktop: 3-column cards): item name, price `฿xx.xx`, round **+** button (label "Add `<item>`" for screen readers). An item already in the cart shows an "In cart · N" badge. Sold-out items (`isAvailable = false`) are greyed, show a **Sold out** badge, and + is disabled.
  - Cart: one line per item with name, quantity stepper (− qty +), line subtotal, remove (✕); "Pickup: ASAP"; "Estimated total"; **Place order →** button. On a phone the cart is its own view, opened from the dark "2 items · ฿155.00 · View cart →" bar or the Cart tab, and closed with ✕. On desktop the cart is always shown as a panel on the right.
- **States:**
  - Loading: placeholder rows.
  - Empty menu: "Nothing on the menu yet. Please check back later."
  - Error loading menu: "Couldn't load the menu. Check your connection." + **Reload menu**.
  - Empty cart: "Your cart is empty. Add something from the menu." Place order disabled.
  - Submitting: "Placing order…", steppers and button disabled.
  - Error 400 from server: show `error.message` (e.g. "Order not placed. 'Croissant' is no longer available."). Nothing was saved (all-or-nothing, BR-03). Reload the menu so sold-out flags are fresh, and mark the bad cart line(s) using `error.details`. Cart is kept so the user can remove the line and retry.
  - Success: clear the cart, go to `/orders/:id`, show "Order #N placed!". The detail page shows the **server-calculated** total.
- **Validation (client):**
  - BR-01: quantity is a whole number 1–10. Stepper − disabled at 1 ("Min 1 — use ✕ to remove."), + disabled at 10 ("Max 10 per item."). Typed values are clamped.
  - BR-02: at most 20 lines, no duplicates. Pressing Add on an item already in the cart adds +1 to that line instead of a new line. At 20 lines, Add is disabled with "Cart is full (20 different items max)."
  - BR-03: sold-out items can't be added. The server still re-checks on submit (the item may sell out after the page loaded).
  - BR-04: the cart total is labelled "Estimated" — the client calculates it only for display.

## S3 — My orders

- **Purpose:** see my past and current orders.
- **Role:** CUSTOMER.
- **Route:** `/orders`
- **Feature:** F-03
- **API:** `GET /api/orders` → only the logged-in customer's orders.
- **Fields shown (newest first):** order number `#1042`, placed time, item count, status pill (`PLACED` orange, `ACCEPTED` green; later sprints add more), total `฿xx.xx`. Phone: one card per order; desktop: a table on the left with the selected order's detail on the right. The whole card/row is clickable → `/orders/:id`. **Refresh list** button (no auto-polling in Sprint 1).
- **States:**
  - Loading: placeholder cards.
  - Empty: "No orders yet. Your orders will show up here." + **Browse the menu**.
  - Error: "Couldn't load your orders." + **Reload orders**.
  - Success: table as above.

## S4 — Order detail

- **Purpose:** confirm what was ordered and see its status.
- **Role:** CUSTOMER.
- **Route:** `/orders/:id`
- **Features / rules:** F-03; shows results of BR-04 (server total) and BR-05 (snapshot).
- **API:** `GET /api/orders/:id`.
- **Fields shown:** "← My orders" link; order number; status badge; placed time; "Pickup: ASAP"; line table — item name, unit price, × qty, line total; **Total** (from server). Under the total, a status hint ("Waiting for the café to accept your order." / "Accepted — being prepared soon.") and **Refresh status**. Desktop also shows a small status timeline: Placed (time) → Accepted (time, or "Waiting for the café").
- **Snapshot (BR-05):** name and unit price come from the order line, not the current menu, so they stay the same even if the menu price changes later.
- **States:**
  - Loading: placeholder rows.
  - 404: "Order not found." + Back to my orders (covers another customer's order too).
  - Error (other): "Couldn't load this order." + **Reload order**.
  - Success: as above. When arriving straight from Place order, also show "Order #N placed!".

## S5 — Operator order queue

- **Purpose:** see new orders and accept them.
- **Role:** OPERATOR (one shop; every operator sees all orders).
- **Route:** `/operator/orders` (operator home)
- **Features / rules:** F-04; BR-06, BR-07.
- **API:**
  - `GET /api/operator/orders?status=PLACED`
  - `POST /api/operator/orders/:id/accept`
- **Fields shown (oldest first = first come, first served):** order number, customer name, placed time, items summary ("Latte ×2, Croissant ×1"), total, **Accept order** button. Heading "New orders" with the count in an orange badge. **Refresh queue** button. Phone: one card per order. Desktop: four number cards on top (Waiting orders, Oldest waiting in minutes, Items to make, Queue value), all worked out on the client from the same list, then the orders as a table.
- **States:**
  - Loading: placeholder rows.
  - Empty: "No new orders. New orders appear here when you refresh."
  - Error loading: "Couldn't load orders." + **Reload queue**.
  - Accepting: only that card's button shows "Accepting…" (disabled); other cards stay usable.
  - Success: "Order #N accepted." The card leaves the list (it's no longer PLACED).
  - Error 409 `INVALID_STATE` (BR-06 / BR-07): "Order #N: Already accepted by another staff member." Then reload the list automatically; the card disappears. Two staff pressing Accept at once → exactly one sees success, the other sees this message.
  - Error 404: "Order #N no longer exists." + reload list.
- **Validation:** none (no inputs). Double-accept is prevented by disabling the button while the request runs; the server is still the real guard (BR-07).

---

## Traceability

| Screen | Route | Features | Business rules |
|---|---|---|---|
| Shared header / guards | all | F-01 | — |
| S1 Login | `/login` | F-01 | — |
| S2 Menu + cart | `/menu` | F-02, F-03 | BR-01, BR-02, BR-03, BR-04 |
| S3 My orders | `/orders` | F-03 | — |
| S4 Order detail | `/orders/:id` | F-03 | BR-04, BR-05 |
| S5 Operator queue | `/operator/orders` | F-04 | BR-06, BR-07 |
