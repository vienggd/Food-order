# F-05 Menu management — engineering contract

Sprint 2. Issue #88 (contract) and #90 (code). Owner: vieng. Reviewer: ninja. Branch `sprint2-vieng` (PR base `sprint2`).
Definition of Done: [`../../sprint_1/sprints/sprint-1/definition-of-done.md`](../../sprint_1/sprints/sprint-1/definition-of-done.md) (same checks; staging branch is `sprint2`, tag `v0.2.0-sprint2`). Status: **Specified** (committed before any F-05 code).

## 1. Feature and requirements

| Linked | Text (short) |
|---|---|
| FR-11 | Operator adds and edits menu items (name, price) and marks an item sold out or available again |
| BR-08 | Name 1–60 characters after trimming, unique (ignoring upper/lower case) |
| BR-09 | Price is a whole number of satang from 1 to 100000 (฿0.01–฿1,000.00) |
| BR-10 | Sold out affects new orders only; placed orders keep their lines (BR-05 snapshot) |
| BR-05 | (Sprint 1) order lines are copies of name and price at order time |
| NFR-03, FR-04 | Shared error format; OPERATOR only |
| — | Seeding again never overwrites an operator's price or availability edit |

Depends on: Sprint 1 schema (`MenuItem`), F-01 (`requireRole("OPERATOR")`), F-03 (order placement already refuses sold-out items).

## 2. Behaviour

### Workflow
1. Operator opens `/operator/menu` → `GET /api/operator/menu` lists every item (sold-out included), ordered by `id`.
2. **Add item**: form (name, price in baht, sold-out switch) → `POST /api/operator/menu` → the new item (201).
3. **Edit**: `PATCH /api/operator/menu/:id` with any of `name`, `price`, `isAvailable` → the updated item.
4. **Sold out switch**: saves at once with `PATCH { isAvailable }`.
5. Customers read the same data from the existing `GET /api/menu`; edits show there on the next load.

### Rules, validation, boundaries
- `name`: string, trimmed, 1–60 characters; empty or longer → 400; a name equal (ignoring upper/lower case) to another item's name → 400 `details.field = "name"`. An item may keep its own name on PATCH.
- `price`: integer, 1 ≤ price ≤ 100000; a decimal, string, 0, negative or 100001 → 400 `details.field = "price"`.
- `isAvailable`: boolean (default `true` on POST).
- PATCH body must contain at least one known field; unknown fields or an empty body → 400. `:id` positive whole number up to 2147483647, else 400; no such item → 404.
- BR-10: changing `isAvailable` or `price` never changes any existing order line. New orders use the current price and are refused (400, Sprint 1 `SOLD_OUT` behaviour) while the item is sold out.
- Items are never deleted in Sprint 2 (order lines point to them).
- Seed: `prisma.menuItem.upsert(... update: {})` already leaves an existing item untouched, so an edited price or availability is kept. Known limit: if the operator renames a seeded item, running the seed again creates the original name again (the seed matches by name).

### Permissions
| Endpoint | Anonymous | CUSTOMER | OPERATOR |
|---|---|---|---|
| `GET /api/operator/menu` | 401 | 403 | ✔ |
| `POST /api/operator/menu` | 401 | 403 | ✔ |
| `PATCH /api/operator/menu/:id` | 401 | 403 | ✔ |
| `GET /api/menu` (Sprint 1) | ✔ | ✔ | ✔ (unchanged) |

## 3. UI — S9 Menu items (`/operator/menu`)

Per [`../ui/ui-spec.md`](../ui/ui-spec.md) S9 and designs `desktop-operator-menu.html`, `phone-operator-menu.html`.
- List: name (+ "Sold out" badge), price `฿xx.xx`, **Sold out** switch, **Edit**; **Add item** button. Phone: cards; desktop: table + form panel.
- Form: Name (counter n / 60), Price in baht (up to 2 decimals, sent as satang), Sold out switch, notes about new-orders-only and unchanged placed orders.
- States: loading, empty, load error + **Reload menu**, saving, success toast, switch failure flips back, 400 shows the server message under the named field and keeps typed values.
- Operator navigation gets a second link **Menu** (next to **Queue**). A customer opening `/operator/menu` is sent to `/menu` with "You don't have access to that page." (Sprint 1 behaviour).

## 4. API

Item JSON: `{ id, name, price, isAvailable }`; price in satang.

| Method + path | Request | Success | Errors |
|---|---|---|---|
| `GET /api/operator/menu` | cookie `sid` (OPERATOR) | 200 `[ item ]` ordered by id | 401 · 403 |
| `POST /api/operator/menu` | `{ name, price, isAvailable? }` | 201 item | 400 VALIDATION_ERROR (`details.field`) · 401 · 403 |
| `PATCH /api/operator/menu/:id` | any of `{ name, price, isAvailable }` (at least one) | 200 item | 400 · 401 · 403 · 404 NOT_FOUND "Menu item not found." |

Messages (from the UI spec): "Name must be 1–60 characters." · "A menu item named "Latte" already exists." · "Price must be between ฿0.01 and ฿1,000.00."

## 5. Data

No schema change: `menu_items(id, name UNIQUE, price, is_available)` already exists. Case-insensitive uniqueness is checked in the route (`findFirst` with `mode: "insensitive"`); the existing unique index still stops an exact duplicate if two requests race (a unique-violation is mapped to the same 400).

## 6. Layers with no change

`GET /api/menu`, order placement (already refuses sold-out items and copies name and price), `orders` / `order_lines` tables, login, transitions.

## 7. Acceptance criteria

| ID | Given / when | Then |
|---|---|---|
| AC-5.1 | Operator GETs `/api/operator/menu` with one item sold out | All items returned, including the sold-out one, with `isAvailable` |
| AC-5.2 | Operator POSTs a valid name and price | 201 with the item; it appears in `GET /api/menu` |
| AC-5.3 | POST name empty, spaces only, or 61 characters | 400 `details.field = "name"`; nothing saved |
| AC-5.4 | POST name of 1 character and name of exactly 60 characters | 201 for both (boundary) |
| AC-5.5 | POST or PATCH a name equal to another item's (also "latte" vs "Latte") | 400 `details.field = "name"`; item unchanged |
| AC-5.6 | POST price 0, -1, 100001, 55.5, "55" | 400 `details.field = "price"`; nothing saved |
| AC-5.7 | POST price 1 and price 100000 | 201 for both (boundary) |
| AC-5.8 | PATCH `{ isAvailable: false }`, then a customer places an order with that item | PATCH 200; order refused 400 (BR-10) |
| AC-5.9 | PATCH `{ isAvailable: true }` again | Customer can order the item again |
| AC-5.10 | An order was placed with Latte at 15500; operator PATCHes the price to 17000 | Old order's line still shows 15500 and the old total; a new order uses 17000 (BR-05, BR-10) |
| AC-5.11 | PATCH with empty body, unknown field, id `abc` or 3000000000 | 400 (never 500) |
| AC-5.12 | PATCH id 999999 | 404 NOT_FOUND |
| AC-5.13 | Customer session; no session — on all three endpoints | 403 FORBIDDEN; 401 UNAUTHENTICATED; data unchanged |
| AC-5.14 | Operator edits a seeded item's price; the seed runs again | The edited price is kept |
| AC-5.15 | UI: operator opens Menu with items | List with price and sold-out switches; **Add item** visible |
| AC-5.16 | UI: operator edits a price and toggles sold out | Toast "… saved." and "… is sold out for new orders."; values persist after reload |
| AC-5.17 | UI: duplicate name | Message under the Name field; typed values kept |

## 8. Test specification

Levels: unit / API (Vitest + Supertest, real Postgres) / E2E (Playwright). The test ID is at the start of each test name.

| Test ID | AC | Level | Precondition / input | Action | Expected |
|---|---|---|---|---|---|
| TEST-5.1 | AC-5.1 | API | Seed; one item set sold out | GET operator menu as staff | all items incl. sold-out |
| TEST-5.2 | AC-5.2 | API | Seed | POST valid item; GET `/api/menu` | 201; item listed |
| TEST-5.3 | AC-5.3 | API | Seed | POST `""`, `"   "`, 61 characters | 400 field name; item count unchanged |
| TEST-5.4 | AC-5.4 | API | Seed | POST 1-char and 60-char names | 201, 201 |
| TEST-5.5 | AC-5.5 | API | Seed has Latte | POST "latte"; PATCH another item to "Latte" | 400, 400 |
| TEST-5.6 | AC-5.6 | API | Seed | POST price 0, -1, 100001, 55.5, "55" | 400 field price |
| TEST-5.7 | AC-5.7 | API | Seed | POST price 1, 100000 | 201, 201 |
| TEST-5.8 | AC-5.8 | API | Seed | PATCH sold out; alice POSTs order with it | 200; 400 |
| TEST-5.9 | AC-5.9 | API | Item sold out | PATCH available; alice orders it | 200; 201 |
| TEST-5.10 | AC-5.10 | API | Alice's order with Latte exists | PATCH price; GET alice's order; place new order | old line 15500 and old total; new line 17000 |
| TEST-5.11 | AC-5.11 | API | Seed | PATCH `{}`, `{foo:1}`, id `abc`, id 3000000000 | 400 each |
| TEST-5.12 | AC-5.12 | API | Seed | PATCH 999999 | 404 |
| TEST-5.13 | AC-5.13 | API | Seed | three endpoints as alice and anonymous | 403 / 401; item unchanged |
| TEST-5.14 | AC-5.14 | API | Seed run, price edited | run seed again | edited price kept |
| TEST-5.15 | AC-5.15 | E2E | Seed | Staff logs in, opens Menu | list, switches, Add item |
| TEST-5.16 | AC-5.16 | E2E | As 15 | Edit price, toggle sold out, reload | toasts; values persist |
| TEST-5.17 | AC-5.17 | E2E | As 15 | Add item named "Latte" | message under Name; fields kept |

TDD: TEST-5.1..5.14 are committed failing first (`[red]`, `docs/sprint_2/evidence/tdd/F-05-red.txt`), then the code (`[green]`, `F-05-green.txt`).

## 9. Definition of Done

See the Sprint 1 definition of done (linked above). F-05 specific: TEST-5.10 runs in every test run (not skipped) because it is the evidence for BR-05 / BR-10.

## 10. Version history

| Date | Version | Change | Why |
|---|---|---|---|
| 25 Nov 2026 | 1 | First contract | Before implementation (Issue #88) |
