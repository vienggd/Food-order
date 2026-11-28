# UI Spec — Sprint 2 (Campus Café Pre-order)

Screens for **F-05 menu management**, **F-06 cancel / reject**, **F-07 fulfilment** and **F-08 simulated payment**. Design pages (phone with every state, plus desktop): [`design/index.html`](design/index.html). Everything not changed here stays as in [`../../sprint_1/ui/ui-spec.md`](../../sprint_1/ui/ui-spec.md) (login, menu + cart, shared layout, the error table). When a design page and this file disagree, this file wins.

Rule IDs (BR-08 … BR-16) follow `docs/PLAN.md` section 4. API paths are a sketch; the feature contracts make them final.

Not designed on purpose: the Lab 7 rule "at most 15 items per order" (not approved yet).

---

## Visual design

Same look as Sprint 1: Fraunces for headings, Plus Jakarta Sans for text, the same colour tokens, cards, pill buttons, hover/press motion and focus ring.

- The design pages load no fonts or files from outside; without the fonts installed they fall back to Georgia / Segoe UI. The app keeps loading the real fonts.
- **New: danger button** `#9B2C1F` (white text) for "Reject order" and "Cancel order" in a confirm step; the first, non-final button is the outlined version (white with a red border).
- **New: Pay button** in sienna `#D4874A` with dark text, so paying never looks like a danger action.

### Status badges

Order badges have a **round** dot, payment badges a **square** dot. Every badge shows its word, so colour is never the only signal.

| Status | Label | Background / text | Meaning |
|---|---|---|---|
| `PLACED` | Placed | `#F2DDC4` / `#6B3410` | Waiting for the café |
| `ACCEPTED` | Accepted | `#DCE5D6` / `#24402F` | Café accepted it |
| `PREPARING` | Preparing | `#E0B07A` / `#2B1B14` | Being made |
| `READY` | Ready | `#2F4A3A` / `#FFFFFF` | Ready at the counter |
| `PICKED_UP` | Picked up | `#E9E2D8` / `#4A3B30` | Collected, finished |
| `REJECTED` | Rejected | `#FDE3E0` / `#7A1C12` | Café said no, with a reason |
| `CANCELLED` | Cancelled | `#EDE6DE` / `#5B4E42` | Customer cancelled |
| payment `UNPAID` | Unpaid | white, `#D9B48E` border / `#6B3410` | Not paid yet |
| payment `PAID` | Paid | `#E2F2E6` / `#1E5631` | Paid (simulated) |
| payment `REFUNDED` | Refunded | `#DDE6EF` / `#23415E` | Money returned (simulated) |

---

## Navigation

| Route | Role | Screen | New in Sprint 2 |
|---|---|---|---|
| `/orders` | CUSTOMER | My orders | All 7 statuses + payment badge |
| `/orders/:id` | CUSTOMER | Order detail | Status tracker, Pay (simulated), Cancel |
| `/operator/orders` | OPERATOR | Order queue (operator home) | Tabs New / In progress / Ready (phone), board (desktop); Reject; next-step buttons |
| `/operator/menu` | OPERATOR | Menu items | **New screen** |

- **Customer** navigation is unchanged: Menu · Cart · My orders.
- **Operator** navigation now has two links: **Queue** and **Menu**. Phone: bottom tab bar with both. Desktop: sidebar with "Order queue" (with a count of open orders) and "Menu items".
- A customer opening `/operator/menu` gets the Sprint 1 403 behaviour (back to `/menu`, "You don't have access to that page.").

---

## Shared UI behaviour (additions)

**Who can do what.** The UI shows a button only when the order's status allows it. The server checks again and answers 409 if the order changed in the meantime.

| Action | Who | Allowed when | Rule |
|---|---|---|---|
| Cancel order | customer, own order | status `PLACED` | BR-11 |
| Accept order | operator | status `PLACED` | Sprint 1 (BR-06/07) |
| Reject order (with reason) | operator | status `PLACED` | BR-12 |
| Next step (Start preparing / Mark ready) | operator | `ACCEPTED` → `PREPARING` → `READY` | BR-13 |
| Mark picked up | operator | `READY` **and** payment `PAID` | BR-13, BR-15 |
| Pay (simulated) | customer, own order | payment `UNPAID` and status is `PLACED`, `ACCEPTED`, `PREPARING` or `READY` | BR-14 |
| Refund | nobody (automatic) | a `PAID` order becomes `CANCELLED` or `REJECTED` → payment `REFUNDED` | BR-16 |

**Confirm before final actions.** Cancel and Reject always ask first. Phone: a bottom sheet. Desktop: a centred dialog (Esc closes). The safe choice ("Keep order", "Back") is on the left; the danger button is on the right. Focus starts on the safe choice.

**One request at a time.** While a request runs, that card's or form's buttons are disabled and the label changes ("Cancelling…", "Rejecting…", "Paying…", "Starting…", "Saving…"). While paying, Cancel is hidden, so the two can't cross.

**Success toast.** A short dark toast after an action ("Order #1040 rejected. The customer can see your reason."). It disappears after 4 seconds and is announced to screen readers (`role="status"`). Phone: above the tab bar; desktop: top right.

**409 conflicts.** Shown as a red message at the top of the screen, written as "**Not …**" + the server's `error.message`, then the data reloads. Nothing the user typed is lost.

**Simulated payment.** Every payment card has a dark "Simulated" tag and the text "Practice payment for this project: no real money moves and no card details are asked." Amounts read "(simulated)". There are no card fields.

### Messages

Client checks are only for convenience; the server is the source of truth and its `error.message` is what the UI shows. Suggested server texts:

| When | Code | Message |
|---|---|---|
| Customer cancels, but the order is no longer PLACED | 409 `INVALID_STATE` | "This order was already accepted, so it can't be cancelled." (or "…already rejected…") |
| Operator accepts or rejects, but the customer cancelled first | 409 | "Order #N was already cancelled by the customer." |
| Operator rejects, but another operator accepted first | 409 | "Order #N was already accepted by another staff member." |
| Operator moves a step that another operator already moved | 409 | "Order #N is already PREPARING. Another staff member moved it." |
| Operator marks picked up, but the order is not paid | 409 | "Order #N is not paid yet." |
| Customer pays a cancelled or rejected order | 409 | "This order was cancelled, so it can't be paid." |
| Customer pays twice | 409 | "This order is already paid." |
| Reject reason missing, too short or too long | 400 `VALIDATION_ERROR` | "Reason must be 3–200 characters." |
| Menu name empty or too long | 400 | "Name must be 1–60 characters." |
| Menu name already used | 400 (details.field = `name`) | "A menu item named "Latte" already exists." |
| Menu price out of range or not whole satang | 400 (details.field = `price`) | "Price must be between ฿0.01 and ฿1,000.00." |

---

## S6 — Order detail (customer, updated)

- **Purpose:** follow one order; pay for it (simulated); cancel it while the café hasn't accepted it.
- **Role:** CUSTOMER (own orders only; other orders → 404 as in Sprint 1).
- **Route:** `/orders/:id`
- **Features / rules:** F-06 (BR-11), F-07 (shows BR-13 steps), F-08 (BR-14, BR-15, BR-16); still BR-04 and BR-05 from Sprint 1.
- **API:**
  - `GET /api/orders/:id` → adds `paymentStatus`, `paidAt`, `refundedAt`, `cancelledAt`, `rejectedAt`, `rejectReason` and a time per step.
  - `POST /api/orders/:id/cancel` → the updated order.
  - `POST /api/orders/:id/pay` (no body; amount = order total on the server) → the updated order.
- **Fields shown:** "← My orders"; Refresh status (icon button); order number + status badge; placed time; "Pickup ASAP"; **status tracker** (Placed → Accepted → Preparing → Ready → Picked up, done steps filled green, current step ringed orange); lines (name, unit price × qty, line total) and **Total**; **Payment card** (Simulated tag, payment badge, then Pay button / paid time / refund note); **Cancel area** (only while PLACED).
- **What shows per status:**

  | Status | Under the title | Payment card | Cancel |
  |---|---|---|---|
  | PLACED | "Waiting for the café to accept your order." | Pay ฿xx.xx (simulated), or "Paid ฿xx.xx at hh:mm (simulated)" | **Cancel order** (outlined red). If paid, the text adds "Your payment will be refunded (simulated)." |
  | ACCEPTED | "Accepted. The café will start making it soon." | Pay, or paid | — |
  | PREPARING | "Your order is being prepared." | Pay, or paid | — |
  | READY, unpaid | Orange note: "**Your order is ready.** Pay first, then pick it up at the counter." | **Pay** | — |
  | READY, paid | Green note: "**Ready!** Show order #N at the counter." | Paid | — |
  | PICKED_UP | Green note: "Picked up at hh:mm. Enjoy!" | Paid | — |
  | CANCELLED | Card "You cancelled this order", time (replaces the tracker) | "Nothing to pay." or "Refunded ฿xx.xx at hh:mm (simulated), because the order was cancelled." | — |
  | REJECTED | Red card "The café rejected this order", **Reason: "…"** word for word, time | "Nothing to pay." or "Refunded … because the order was rejected." | — |

- **States:**
  - Loading: placeholder blocks.
  - 404: as Sprint 1 ("Order not found." + Back to my orders).
  - Confirm cancel: sheet/dialog "Cancel order #N?" / "You can't undo this." (+ refund sentence if paid) / **Keep order** · **Cancel order**.
  - Cancelling… / Paying…: buttons locked.
  - Success: toast "Order #N cancelled." or "Paid ฿xx.xx (simulated)."; the page shows the new status.
  - 409: red "Not cancelled." / "Not paid." message + server text, then reload (the button disappears if no longer allowed).
  - Network error: Sprint 1 fallback.

## S7 — My orders (customer, updated)

- **Purpose:** see all my orders and where each one is.
- **Role:** CUSTOMER. **Route:** `/orders`. **Features:** F-03, F-06, F-07, F-08 (display only).
- **API:** `GET /api/orders` → adds `paymentStatus` per order.
- **Fields shown (newest first):** order number, placed time, item count, **status badge** and **payment badge**, total. Card (phone) or table row (desktop) opens `/orders/:id`. **Refresh list** button.
- **States:** unchanged from Sprint 1: loading placeholders; empty "No orders yet. Your orders will show up here." + **Browse the menu**; error "Couldn't load your orders." + **Reload orders**.

## S8 — Order queue (operator, updated)

- **Purpose:** handle every open order from new to picked up.
- **Role:** OPERATOR. **Route:** `/operator/orders` (operator home).
- **Features / rules:** F-04 (accept), F-06 (reject, BR-12), F-07 (BR-13), F-08 (BR-15).
- **API:**
  - `GET /api/operator/orders?status=PLACED,ACCEPTED,PREPARING,READY` → open orders, oldest first, with `paymentStatus`. (Sketch: one call with a status list, or one call per tab.)
  - `POST /api/operator/orders/:id/accept` (Sprint 1).
  - `POST /api/operator/orders/:id/reject` `{ reason }` → the updated order.
  - `POST /api/operator/orders/:id/advance` → moves exactly one step; returns the updated order.
- **Layout:**
  - **Phone:** a 3-part switch with counts: **New** (PLACED) · **In progress** (ACCEPTED + PREPARING) · **Ready** (READY). The selected tab is kept in the URL (`?tab=new|progress|ready`).
  - **Desktop (revised 28 Nov 2026, as shipped):** the same **New / In progress / Ready** switch as on the phone, and below it one semantic table (`<table>` with `<th scope="col">`) with 7 columns: **Order | Status | Customer | Items | Placed | Total | Action**, one row per order, the next action in the last column. The phone shows each row as a card. **Refresh queue** button at the top. A search form (order number or customer name, status, **Search**, **Clear**; F-11) sits above the switch.
  - **Why the 4-column card board was dropped:** both teams agreed to revise this spec instead of building it (DEC-12 (`srs.md`)). The table is already built and tested (phone 375 px and desktop 1280 px E2E; TEST-L6-132 checks that the 7 headers line up with the 7 cells), it passes the axe check and the keyboard checks in PR #227 (TEST-A11Y-01..08), and it is the lower risk before the exam period 1–11 Dec. The earlier board sketch is kept in `design/desktop-operator-queue.html` for history.
- **Card fields:** order number · customer name, placed time, items summary, status badge + payment badge, total, then **only the next action**:

  | Status | Buttons |
  |---|---|
  | PLACED | **Reject** (outlined red) · **Accept order** |
  | ACCEPTED | **Start preparing** |
  | PREPARING | **Mark ready** |
  | READY, paid | **Mark picked up** |
  | READY, unpaid | **Mark picked up** disabled, with "Waiting for payment. The customer pays in the app." under it |

- **Reject sheet/dialog:** title "Reject order #N?"; order summary; textarea **"Reason (the customer will see this)"** with counter "n / 200" and hint "3–200 characters"; **Back** · **Reject order**. Client check before sending: under 3 characters → "Write at least 3 characters."; over 200 → "Keep it to 200 characters or fewer." The server checks again (400).
- **States:**
  - Loading: placeholder cards.
  - Empty tab/column: "No new orders. New orders appear here when you refresh." (phone) / "Nothing here" (board column).
  - Error: "Couldn't load orders." + **Reload queue**.
  - Busy: only the card being changed is locked ("Accepting…", "Rejecting…", "Starting…", "Marking ready…", "Marking picked up…").
  - Success toasts: "Order #N accepted.", "Order #N rejected. The customer can see your reason.", "Order #N is now Preparing.", "Order #N is ready.", "Order #N picked up." Picked-up, rejected and cancelled orders leave the queue.
  - 409: red message ("**Not accepted.** / **Not rejected.** / **Not moved.**" + server text), then the queue reloads.
- **No auto-refresh** in Sprint 2 (same as Sprint 1); the Refresh button and reloads after every action keep it current.

## S9 — Menu items (operator, new)

- **Purpose:** keep the menu right: add items, fix names and prices, mark items sold out.
- **Role:** OPERATOR. **Route:** `/operator/menu`.
- **Features / rules:** F-05; BR-08 (name 1–60 characters, unique), BR-09 (price whole satang 1–100000 = ฿0.01–฿1,000.00), BR-10 (sold out affects new orders only; placed orders keep their snapshot, BR-05).
- **API:**
  - `GET /api/operator/menu` → all items, including sold-out ones: `{ id, name, price, isAvailable }`.
  - `POST /api/operator/menu` `{ name, price, isAvailable }` → the new item.
  - `PATCH /api/operator/menu/:id` with any of `{ name, price, isAvailable }` → the updated item.
- **List fields:** name (+ grey "Sold out" badge when sold out), price `฿xx.xx`, **Sold out** switch (red when on; saves at once with PATCH `{ isAvailable }`), **Edit** button. **Add item** button at the top. Phone: one card per item. Desktop: table with the add/edit form in a panel beside it.
- **Form fields (add and edit):** **Name** (counter "n / 60", hint "1–60 characters, must be unique"); **Price** with a "฿" prefix, typed in baht with up to 2 decimals and sent as satang (฿55.00 → `5500`), hint "฿0.01 – ฿1,000.00"; **Sold out** switch with "Affects new orders only. Orders already placed keep their items."; edit adds the note "Changing the price does not change orders already placed: they keep the price they were ordered at." Buttons: **Add item** / **Save changes** (desktop also **Cancel**).
- **Validation (client, before sending):** "Name is required." · "Name must be 60 characters or fewer." · "Enter a price between ฿0.01 and ฿1,000.00." · "Use at most 2 decimal places." Names are trimmed before sending.
- **States:**
  - Loading: placeholder rows.
  - Empty: "No menu items yet. Add the first item customers can order."
  - Error: "Couldn't load the menu." + **Reload menu**.
  - Saving…: form button locked.
  - Success: back to the list with toast "Latte saved." / "Chai latte added."; switch toast "Croissant is sold out for new orders." / "Croissant is back on the menu."
  - Switch fails: the switch flips back and the error shows.
  - 400 from the server: red box "Item not saved. Fix the marked field." + the server message under the field named in `error.details`; typed values are kept.

---

## Traceability

| Screen | Route | Features | Business rules |
|---|---|---|---|
| S6 Order detail | `/orders/:id` | F-03, F-06, F-07, F-08 | BR-04, BR-05, BR-11, BR-13 (display), BR-14, BR-15, BR-16 |
| S7 My orders | `/orders` | F-03, F-06, F-07, F-08 | — (display only) |
| S8 Order queue | `/operator/orders` | F-04, F-06, F-07, F-08 | BR-06, BR-07, BR-12, BR-13, BR-15 |
| S9 Menu items | `/operator/menu` | F-05 | BR-05 (snapshot note), BR-08, BR-09, BR-10 |

## Design pages

| Page | Shows |
|---|---|
| `design/index.html` | Screen links, order and payment status flows, badges, the who-can-do-what table, shared patterns |
| `design/phone-customer-order.html` | S6: every status, cancel confirm, paying, refunds, 409s |
| `design/phone-customer-orders.html` | S7: loading, empty, error, list with all badges |
| `design/phone-operator-queue.html` | S8: tabs, reject sheet and validation, next steps, unpaid pickup, 409s |
| `design/phone-operator-menu.html` | S9: list, sold-out switch, add/edit, validation, duplicate name |
| `design/desktop-customer-orders.html` | S6 + S7 side by side, cancel dialog, ready-unpaid, rejected |
| `design/desktop-operator-queue.html` | S8 board sketch (not built; the desktop ships the 7-column table, see S8), reject dialog, 409 |
| `design/desktop-operator-menu.html` | S9 table + edit panel, duplicate name |

Every page fits from 320 px to 1440 px wide with no sideways scrolling (checked in the browser).

## Assumptions to confirm in the contracts

1. Duplicate menu name returns **400 `VALIDATION_ERROR`** with `details.field = "name"` (it is a bad input, not a state conflict). If the contract picks 409, the UI shows it the same way.
2. The operator queue loads open orders with one call and a status list; one call per tab works the same in the UI.
3. Pickup of an unpaid order is blocked in the UI and refused by the server with **409** (`INVALID_STATE`).
4. Refunds are only shown; there is no separate refund screen or button.
