# Feature inventory — Campus Café Pre-order

Deliverable 1, part B (1 of 2). Issue #7. Traceability: [`traceability.md`](traceability.md). Sprint plan: [`sprints/plan.md`](sprints/plan.md).
Version 1 — 6 Nov 2026 (draft). Requirement IDs match the SRS (#6).

Roles: **CUSTOMER** (orders food), **OPERATOR** (café staff; one shop, sees all orders). Anonymous users can only reach `/login`.

## Summary

| ID | Feature | Sprint | Roles | Requirements | Business rules | Status |
|---|---|---|---|---|---|---|
| F-01 | Login, logout, "who am I" | 1 | anyone → CUSTOMER / OPERATOR | FR-01..FR-04, NFR-01, NFR-02 | — | Planned |
| F-02 | Browse menu | 1 | CUSTOMER | FR-05 | BR-03 (sold-out shown) | Planned |
| F-03 | Place order, my orders, order detail | 1 | CUSTOMER | FR-06..FR-08, NFR-04 | BR-01, BR-02, BR-03, BR-04, BR-05 | Planned |
| F-04 | Operator queue + accept order | 1 | OPERATOR | FR-09, FR-10, NFR-04 | BR-06, BR-07 | Planned |
| F-05 | Menu management + sold-out toggle | 2 | OPERATOR | FR-11 | to specify in Sprint 2 | Not started |
| F-06 | Customer cancel / operator reject with reason | 2 | CUSTOMER, OPERATOR | FR-12, FR-13 | to specify in Sprint 2 | Not started |
| F-07 | Fulfilment: PREPARING → READY → PICKED_UP | 2 | OPERATOR | FR-14 | to specify in Sprint 2 | Not started |
| F-08 | Simulated payment | 2 | CUSTOMER, OPERATOR | FR-15 | to specify in Sprint 2 | Not started |
| F-09 | Pickup time slots + order cut-off | 3 | CUSTOMER, OPERATOR | FR-16 | to specify in Sprint 3 | Not started |
| F-10 | Sales summary | 3 | OPERATOR | FR-17 | to specify in Sprint 3 | Not started |
| F-11 | Order search / filter | 3 | CUSTOMER, OPERATOR | FR-18 | to specify in Sprint 3 | Not started |
| F-12 | Hardening: login rate limit, error states, accessibility | 3 | all | NFR-08, NFR-09 | to specify in Sprint 3 | Not started |

All Sprint 1 features also follow NFR-03, NFR-05, NFR-06 and NFR-07.

Status values: Not started → Planned (in a sprint plan) → Specified (contract committed) → Implemented → Verified (tests pass on the release) → Released (tagged on `main`).

## Sprint 1 features

### F-01 Login, logout, "who am I"
- **What:** a seeded user logs in with email + password; the server creates a session; the app shows the user's name and role and sends them to their home page. Logout ends the session.
- **Screens:** S1 Login, shared header and route guards.
- **API:** `POST /api/auth/login`, `POST /api/auth/logout`, `GET /api/auth/me`.
- **Key decisions:** sessions in the `sessions` table, random id in an httpOnly cookie, 8 hours; bcrypt hashes; role always read from the session; same 401 message for unknown email and wrong password. No sign-up (seeded accounts only).
- **Issue / owner:** #2 / A (vieng). Contract: `docs/sprints/sprint-1/F-01-*.md`.

### F-02 Browse menu
- **What:** a customer sees every menu item with name and price; sold-out items are greyed out with a SOLD OUT badge and cannot be added.
- **Screens:** S2 Menu (menu list part).
- **API:** `GET /api/menu` → `{ id, name, price, isAvailable }`; price in satang.
- **Access:** CUSTOMER only (401 if not logged in, 403 for OPERATOR).
- **Issue / owner:** #3 / B (ninja). Contract: `docs/sprints/sprint-1/F-02-*.md`.

### F-03 Place order, my orders, order detail
- **What:** a customer builds a cart and places an order; the server checks every rule, calculates the total from database prices, and saves the order and its lines in one transaction. The customer can list their own orders and open one.
- **Screens:** S2 Menu (cart part), S3 My orders, S4 Order detail.
- **API:** `POST /api/orders` `{ items: [{ menuItemId, quantity }] }`, `GET /api/orders`, `GET /api/orders/:id`.
- **Rules:** BR-01 quantity 1–10; BR-02 1–20 lines, no duplicate item; BR-03 every item exists and is available, else nothing is saved; BR-04 server total, a price/total field in the request → 400; BR-05 each line keeps the item name and unit price at order time.
- **Access:** CUSTOMER only; another customer's order → 404 (same as a missing id).
- **Issue / owner:** #4 / B (ninja). Contract: `docs/sprints/sprint-1/F-03-*.md`.

### F-04 Operator queue + accept order
- **What:** an operator sees PLACED orders oldest first and accepts one; it becomes ACCEPTED and leaves the queue.
- **Screens:** S5 Operator order queue.
- **API:** `GET /api/operator/orders?status=PLACED`, `POST /api/operator/orders/:id/accept`.
- **Rules:** BR-06 only a PLACED order can be accepted (else 409); BR-07 two operators accepting at once → exactly one 200, the other 409 (conditional update `where status = PLACED`). Uses the order transition table and `canTransition()`.
- **Access:** OPERATOR only (403 for CUSTOMER).
- **Issue / owner:** #5 / A (vieng). Contract: `docs/sprints/sprint-1/F-04-*.md`.

## Shared groundwork (not a feature)
- Issue #1 setup: database schema (`users`, `sessions`, `menu_items`, `orders`, `order_lines`), seed data (2 customers, 1 operator, menu with one sold-out item; password from env `SEED_PASSWORD`), project skeleton and test setup. Used by all Sprint 1 features.
- Error shape for every feature: `{ error: { code, message, details } }` with VALIDATION_ERROR 400, UNAUTHENTICATED 401, FORBIDDEN 403, NOT_FOUND 404, INVALID_STATE 409.

## Change log

| Date | Change | Why |
|---|---|---|
| 6 Nov 2026 | First draft | Deliverable 1 part B |
