# F-03 Place order, my orders, order detail — feature contract

Sprint 1 · Issue #4 · Owner: ninja (B) · Reviewer: vieng (A)
Status: Specified (committed before any F-03 code)

## 1. Feature and linked requirements

A customer builds a cart from the menu and places an order. The server checks every rule, calculates the total from database prices, and saves the order with its lines in one transaction. The customer can list their own orders and open one to see its lines, total and status.

| Type | IDs |
|---|---|
| Functional | FR-06 place an order, FR-07 list my orders, FR-08 view my order detail; FR-04 role check |
| Business rules | BR-01, BR-02, BR-03, BR-04, BR-05 |
| Non-functional | NFR-02 prices only from the server, NFR-03 error format, NFR-04 one transaction per order, NFR-05 tests first, NFR-06 states, phone + desktop |
| Depends on | #1 setup (`orders`, `order_lines`), F-01 (session, `requireRole`), F-02 (`GET /api/menu`, `formatBaht`) |
| Used by | F-04 (operator sees and accepts PLACED orders) |

## 2. Behaviour, workflow and permissions

### Place order
1. On `/menu` the customer adds items to a cart kept in the browser (client state only; not saved).
2. **Place order** sends `POST /api/orders` with only `menuItemId` and `quantity` per line.
3. The server, in this order:
   1. checks the session and role (401 / 403);
   2. validates the body shape with a strict schema (BR-01, BR-02, BR-04) → 400 on any problem;
   3. in **one database transaction**: loads the menu items, checks every item exists and is available (BR-03), calculates `unitPrice × quantity` per line and the total from database prices (BR-04), creates the order with status `PLACED` and its lines with a copy of `name` and `unitPrice` (BR-05);
   4. returns 201 with the created order.
4. If any check fails, nothing is saved (no order, no lines).
5. The app clears the cart and goes to `/orders/:id` with "Order #N placed!".

### My orders / order detail
- `GET /api/orders` returns only the logged-in customer's orders, newest first.
- `GET /api/orders/:id` returns the order only if it belongs to the logged-in customer. A missing id and another customer's order both give **404** with the same message, so a customer cannot tell whether someone else's order exists.

| Who | `POST /api/orders` | `GET /api/orders` | `GET /api/orders/:id` |
|---|---|---|---|
| Not logged in / expired | 401 | 401 | 401 |
| CUSTOMER | 201 / 400 | 200 (own only) | 200 own, 404 otherwise |
| OPERATOR | 403 | 403 | 403 (operators use F-04 endpoints) |

### Business rules (server is the source of truth; the client checks are only for convenience)

| Rule | Server check | Error |
|---|---|---|
| BR-01 | Each `quantity` is a whole number 1–10 | 400 `VALIDATION_ERROR` |
| BR-02 | `items` has 1–20 lines; no `menuItemId` appears twice | 400 `VALIDATION_ERROR` |
| BR-03 | Every `menuItemId` exists and `isAvailable = true`; else whole order rejected, nothing saved | 400 `VALIDATION_ERROR` |
| BR-04 | Total and line prices come from `menu_items`; any extra field (e.g. `price`, `unitPrice`, `total`) anywhere in the body is rejected | 400 `VALIDATION_ERROR` |
| BR-05 | `order_lines.name` and `order_lines.unit_price` are copied at order time and never re-read from the menu | — |

## 3. UI

Source: `docs/ui/ui-spec.md` S2 (cart), S3, S4 and `docs/ui/design/Menu.html`, `Orders.html`, `DesktopMenu.html`, `DesktopOrders.html`.

### S2 cart (on `/menu`)
- Line: name, stepper (− qty +), line subtotal, ✕ remove. "Pickup: ASAP". "Estimated total". **Place order →**.
- Phone: cart is its own view, opened from the "N items · ฿x · View cart →" bar or the Cart tab. Desktop: panel on the right.
- **+** on an item already in the cart adds 1 to that line (no duplicate line); the item shows "In cart · N".
- Stepper − disabled at 1 ("Min 1 — use ✕ to remove."), + disabled at 10 ("Max 10 per item."); typed values are clamped to 1–10.
- At 20 lines, + on a new item is disabled with "Cart is full (20 different items max)."

| State | What the user sees |
|---|---|
| Empty cart | "Your cart is empty. Add something from the menu." Place order disabled |
| Submitting | "Placing order…"; steppers and button disabled |
| 400 | `error.message` in an error box; menu reloaded; bad lines from `error.details.items` marked; cart kept |
| Network / 500 | "Something went wrong. Please try again." + **Try again**; cart kept |
| Success | Cart cleared → `/orders/:id` with "Order #N placed!" |

### S3 My orders (`/orders`)
- Newest first: `#id`, placed time, item count, status pill (`PLACED` orange, `ACCEPTED` green), total `฿xx.xx`. Whole card/row opens `/orders/:id`. **Refresh list**.
- Loading: placeholder cards. Empty: "No orders yet. Your orders will show up here." + **Browse the menu**. Error: "Couldn't load your orders." + **Reload orders**.

### S4 Order detail (`/orders/:id`)
- "← My orders", `#id`, status badge, placed time, "Pickup: ASAP", lines (name, unit price, × qty, line total), **Total** from the server, status hint ("Waiting for the café to accept your order." / "Accepted — being prepared soon."), **Refresh status**. Desktop timeline: Placed (time) → Accepted / "Waiting for the café".
- Loading: placeholder rows. 404: "Order not found." + Back to my orders. Error: "Couldn't load this order." + **Reload order**.

Times: today → `10:15`, yesterday → `Yesterday 12:02`, older → `3 Nov 09:40` (local time).

## 4. API

### `POST /api/orders`

Request (strict: no other keys allowed at any level):

```json
{ "items": [ { "menuItemId": 1, "quantity": 2 }, { "menuItemId": 3, "quantity": 1 } ] }
```

Response **201** — the created order (same shape as `GET /api/orders/:id`):

```json
{
  "id": 7,
  "status": "PLACED",
  "total": 18000,
  "createdAt": "2026-11-07T03:15:00.000Z",
  "lines": [
    { "menuItemId": 1, "name": "Latte", "unitPrice": 6500, "quantity": 2, "lineTotal": 13000 },
    { "menuItemId": 3, "name": "Thai Milk Tea", "unitPrice": 5000, "quantity": 1, "lineTotal": 5000 }
  ]
}
```

Errors:

| HTTP | code | When | `message` / `details` |
|---|---|---|---|
| 400 | `VALIDATION_ERROR` | Body shape wrong: missing/empty `items`, more than 20 lines, `quantity` not an integer 1–10, `menuItemId` not a positive integer, unknown key such as `price` or `total` | `message`: "Invalid request." (from the shared Zod handler); `details`: the list of problems with their path |
| 400 | `VALIDATION_ERROR` | Same `menuItemId` twice (BR-02) | "Order not placed. Each item can appear only once."; `details: { items: [{ menuItemId, reason: "DUPLICATE" }] }` |
| 400 | `VALIDATION_ERROR` | Item does not exist or is sold out (BR-03) | "Order not placed. 'Croissant' is no longer available." (names of all bad items, or "an item" when unknown); `details: { items: [{ menuItemId, reason: "NOT_FOUND" \| "SOLD_OUT" }] }` |
| 401 | `UNAUTHENTICATED` | No or expired session | |
| 403 | `FORBIDDEN` | OPERATOR | |

### `GET /api/orders`

Response 200: a plain array, newest first (`createdAt` desc, then `id` desc):

```json
[ { "id": 7, "status": "PLACED", "total": 18000, "itemCount": 3, "createdAt": "2026-11-07T03:15:00.000Z" } ]
```

`itemCount` = sum of quantities. Errors: 401, 403.

### `GET /api/orders/:id`

Response 200: same shape as the `POST` response (the shared order shape, also used by F-04). Errors: 401, 403, **400 `VALIDATION_ERROR`** when the id is not a positive whole number, **404 `NOT_FOUND` "Order not found."** when it does not exist or belongs to another customer.

## 5. Data

No schema change; uses tables from #1.

- `orders`: `customer_id` = session user, `status` = `PLACED`, `total` = server sum (Int satang), `created_at`.
- `order_lines`: `order_id`, `menu_item_id`, `name` and `unit_price` copied from `menu_items` at order time, `quantity`. Unique (`order_id`, `menu_item_id`) backs BR-02 in the database.
- The order and all its lines are written with one `prisma.$transaction`, so a failure leaves no partial order.

## 6. Acceptance criteria

| ID | Given / When / Then |
|---|---|
| AC-F03-01 | Given a logged-in customer and available items, when they place an order with 1–20 lines of quantity 1–10, then the server answers 201 with status `PLACED`, the lines, and a total equal to the sum of database price × quantity; the order and lines are saved. |
| AC-F03-02 | (BR-01) When any line has quantity 0, 11, a decimal, a negative number or a non-number, then 400 `VALIDATION_ERROR` and nothing is saved. Quantities 1 and 10 are accepted. |
| AC-F03-03 | (BR-02) When `items` is empty or has 21 lines, or the same item appears twice, then 400 `VALIDATION_ERROR` and nothing is saved. 20 different lines are accepted. |
| AC-F03-04 | (BR-03) When any item is sold out or does not exist, then 400 `VALIDATION_ERROR` naming the item(s) in `details.items`, and no order or line is saved, even if other lines were valid. |
| AC-F03-05 | (BR-04) When the request contains `price`, `unitPrice` or `total` (top level or in a line), then 400 `VALIDATION_ERROR` and nothing is saved; a valid order's total never depends on client values. |
| AC-F03-06 | (BR-05) Given a placed order, when the menu price or name changes later, then the order detail still shows the name, unit price and total from order time. |
| AC-F03-07 | When a customer lists orders, then they get only their own orders, newest first, with id, status, total, item count and time. |
| AC-F03-08 | When a customer opens their own order, then they get 200 with lines and total; when they open another customer's order or a missing id, then 404 `NOT_FOUND` with the same message; a malformed id (e.g. `abc`) gives 400 `VALIDATION_ERROR`. |
| AC-F03-09 | When not logged in, any F-03 endpoint answers 401; when logged in as operator, 403. |
| AC-F03-10 | In the browser, a customer adds items (adding the same item twice gives quantity 2 on one line), places the order, lands on `/orders/:id` with "Order #N placed!", and sees the server total. |
| AC-F03-11 | In the browser, when the server rejects the order with 400, the message is shown, the cart is kept, and the bad line is marked. |
| AC-F03-12 | In the cart, the stepper cannot go below 1 or above 10, and a 21st different item cannot be added. |

## 7. Test specification

Seed: alice, bob (CUSTOMER), staff (OPERATOR); Latte 6500 (id 1), Americano 5500, Thai Milk Tea 5000, Croissant 4500 sold out, Sandwich 7500, Basil Chicken Rice 8000. Tests that need 20+ items create extra menu rows.

| Test ID | AC | Level | Precondition / input | Action | Expected |
|---|---|---|---|---|---|
| TEST-F03-01 | AC-F03-01 | API | alice; Latte ×2, Thai Milk Tea ×1 | POST | 201; status PLACED; total 18000; 2 lines with name + unitPrice; 1 order and 2 lines in DB for alice |
| TEST-F03-02 | AC-F03-02 | API | alice; quantity 1 and 10 | POST | 201 |
| TEST-F03-03 | AC-F03-02 | API | alice; quantity 0, 11, 1.5, -1, "2" (one request each) | POST | each 400 `VALIDATION_ERROR`; order count unchanged |
| TEST-F03-04 | AC-F03-03 | API | alice; `items: []`; missing `items` | POST | 400; nothing saved |
| TEST-F03-05 | AC-F03-03 | API | alice; 20 different available items ×1 | POST | 201 with 20 lines |
| TEST-F03-06 | AC-F03-03 | API | alice; 21 different items | POST | 400; nothing saved |
| TEST-F03-07 | AC-F03-03 | API | alice; Latte ×1 twice | POST | 400; `details.items[0]` = `{ menuItemId: 1, reason: "DUPLICATE" }`; nothing saved |
| TEST-F03-08 | AC-F03-04 | API | alice; Latte ×1 + Croissant ×1 | POST | 400; message names Croissant; `reason: "SOLD_OUT"`; no order and no lines saved |
| TEST-F03-09 | AC-F03-04 | API | alice; menuItemId 9999 | POST | 400; `reason: "NOT_FOUND"`; nothing saved |
| TEST-F03-10 | AC-F03-05 | API | alice; line with `price: 1`; body with `total: 1`; line with `unitPrice: 1` | POST | each 400; nothing saved |
| TEST-F03-11 | AC-F03-06 | API | alice places Latte ×1; then Latte price set to 9900 and name to "Latte XL" in DB | GET `/api/orders/:id` | line name "Latte", unitPrice 6500, total 6500 |
| TEST-F03-12 | AC-F03-07 | API | alice has 2 orders, bob has 1 | alice GET `/api/orders` | 2 orders, newest first, both alice's; `itemCount` correct |
| TEST-F03-13 | AC-F03-08 | API | alice has order A | alice GET `/api/orders/A` | 200 with lines and total |
| TEST-F03-14 | AC-F03-08 | API | bob has order B | alice GET `/api/orders/B`; alice GET `/api/orders/99999` | both 404 `NOT_FOUND`, same message |
| TEST-F03-21 | AC-F03-08 | API | alice | GET `/api/orders/abc`, `/api/orders/0`, `/api/orders/-1` | each 400 `VALIDATION_ERROR` |
| TEST-F03-15 | AC-F03-09 | API | no cookie | POST, GET list, GET detail | all 401 |
| TEST-F03-16 | AC-F03-09 | API | staff (OPERATOR) | POST, GET list, GET detail | all 403; nothing saved |
| TEST-F03-17 | AC-F03-01 | unit | `cartReducer`: add Latte, add Latte, add Americano | apply | 2 lines; Latte qty 2 |
| TEST-F03-18 | AC-F03-12 | unit | `cartReducer`: set qty 0, 11, 2.7; add 21st item | apply | qty clamped to 1, 10, 2; 21st item refused |
| TEST-F03-19 | AC-F03-10 | E2E | alice logged in | add Latte twice + Thai Milk Tea, Place order | URL `/orders/N`; "Order #N placed!"; total ฿180.00; `/orders` lists it as PLACED |
| TEST-F03-20 | AC-F03-11 | E2E | alice logged in; Latte in cart; Latte set sold out in DB before submit | Place order | error message shown naming Latte; cart still has Latte; line marked |

Tests are written first and must fail before the code exists (`[red]` commit, output saved in `docs/evidence/tdd/`), then pass (`[green]` commit). Test names start with the test ID.

## 8. Definition of Done

Shared checklist: [`definition-of-done.md`](definition-of-done.md). F-03 extra evidence: red then green output for every BR test (TEST-F03-02..11), E2E run for TEST-F03-19..20, screenshots of cart, rejected order, My orders and order detail.

## 9. Version history

| Version | Date | Change | By |
|---|---|---|---|
| 1 | 6 Nov 2026 | First version, before implementation | ninja |
| 1.1 | 6 Nov 2026 | Shared order shape with F-04 agreed in chat: list is a plain array; malformed id → 400 (was 404). Still before implementation | ninja |

Open point for review: the desktop timeline shows "Accepted" without a time in Sprint 1, because `orders` has no `accepted_at` column. If F-04 adds one, S4 will show it.
