# F-08 Simulated payment — engineering contract

Sprint 2. Issue #89 (contract) and #91 (code). Owner: vieng. Reviewer: ninja. Branch `sprint2-vieng` (PR base `sprint2`).
Definition of Done: [`../../sprint_1/sprints/sprint-1/definition-of-done.md`](../../sprint_1/sprints/sprint-1/definition-of-done.md) (same checks; staging branch is `sprint2`, tag `v0.2.0-sprint2`). Status: **Specified** (committed before any F-08 code).

## 1. Feature and requirements

| Linked | Text (short) |
|---|---|
| FR-13 | Customer pays for own order (simulated, no real money, no card data) |
| FR-14 | Payment status (UNPAID / PAID / REFUNDED) shown to customer and operator |
| BR-14 | Own order only; UNPAID → PAID; refused (409) if the order is CANCELLED, REJECTED or PICKED_UP, or already PAID |
| BR-15 | An order can become PICKED_UP only when PAID (409 otherwise) |
| BR-16 | Cancel or reject of a PAID order sets payment REFUNDED in the same step |
| BR-04 | (Sprint 1) the amount is the order total kept on the server; the client sends no amount |
| NFR-03, FR-04 | Shared error format; CUSTOMER only for pay |

Depends on: schema PR S2-1 (`payment_status`, `paid_at`, `refunded_at`), F-01, F-03. **BR-16 waits for F-06** (cancel and reject routes); **BR-15 waits for F-07** (advance route). Both are added after those merge (see section 9).

## 2. Behaviour

### Payment status
| Order status | UNPAID | PAID | REFUNDED |
|---|---|---|---|
| PLACED, ACCEPTED, PREPARING, READY | can pay | — | — |
| PICKED_UP | not allowed (cannot happen: BR-15) | final | — |
| CANCELLED, REJECTED | stays UNPAID ("Nothing to pay.") | becomes REFUNDED (BR-16) | final |

Payment transitions: UNPAID → PAID (customer, BR-14); PAID → REFUNDED (automatic, BR-16). No other change; there is no refund button.

### Workflow — pay
1. Customer opens `/orders/:id` and presses **Pay ฿xx.xx (simulated)** → `POST /api/orders/:id/pay` (no body).
2. Server runs one conditional update: `UPDATE orders SET payment_status = 'PAID', paid_at = now() WHERE id = :id AND customer_id = :me AND payment_status = 'UNPAID' AND status IN ('PLACED','ACCEPTED','PREPARING','READY')`.
3. 1 row → 200 with the order. 0 rows → read the order: missing or not the caller's → 404; already PAID → 409 "This order is already paid."; CANCELLED / REJECTED / PICKED_UP → 409 "This order was cancelled, so it can't be paid." (word follows the status); REFUNDED → 409 with the cancelled/rejected text.
4. The page shows "Paid ฿xx.xx at hh:mm (simulated)" and a green Paid badge.

### Workflow — BR-16 (added after F-06)
Cancel and reject (F-06) set `payment_status = 'REFUNDED'`, `refunded_at = now()` in the **same conditional update or transaction** as the status change, only when the order was PAID. An UNPAID order stays UNPAID. If the status change fails (409), the payment is not touched.

### Workflow — BR-15 (added after F-07)
The advance route (F-07) refuses READY → PICKED_UP while `payment_status <> 'PAID'` with 409 `INVALID_STATE` "Order #N is not paid yet." The order stays READY. The check is part of the same conditional update (no separate read), so a payment cannot slip in between.

### Rules, validation, boundaries
- `:id` positive whole number up to 2147483647, else 400. Another customer's order → 404 (never 403, never reveals it exists). Operator calling pay → 403.
- Body is ignored; any amount sent is not used (amount = `order.total` on the server).
- Two pay requests at once → exactly one 200, the other 409 (the conditional update decides).
- Pay and cancel race: pay refused if the order is no longer cancellable-state, and a cancel that wins refunds nothing because nothing was paid; a pay that wins first makes the cancel refund it. Never PAID on a CANCELLED order.
- The Order JSON gains `paymentStatus`, `paidAt`, `refundedAt` (also on list endpoints, operator queue included).

### Permissions
| Endpoint | Anonymous | CUSTOMER | OPERATOR |
|---|---|---|---|
| `POST /api/orders/:id/pay` | 401 | ✔ own orders (others 404) | 403 |
| `GET /api/orders`, `GET /api/orders/:id` | 401 | ✔ own (now with payment fields) | 403 |
| `GET /api/operator/orders` | 401 | 403 | ✔ (now with `paymentStatus`) |

## 3. UI

Per [`../ui/ui-spec.md`](../ui/ui-spec.md) S6, S7, S8 and the phone/desktop designs.
- **PayButton** (sienna, dark text) in the Payment card of `/orders/:id`; label "Pay ฿xx.xx (simulated)"; "Paying…" while the request runs (Cancel is hidden then).
- Payment card shows the dark **Simulated** tag, the text "Practice payment for this project: no real money moves and no card details are asked." and no card fields.
- **Payment badges** (square dot, word always shown): Unpaid, Paid, Refunded; on `/orders`, `/orders/:id` and the operator queue cards.
- READY and unpaid: orange note "Your order is ready. Pay first, then pick it up at the counter."; operator card shows **Mark picked up** disabled with "Waiting for payment. The customer pays in the app."
- Success toast "Paid ฿xx.xx (simulated)."; 409 shows "Not paid." + the server text, then reloads.

## 4. API

Order JSON adds: `paymentStatus: "UNPAID" | "PAID" | "REFUNDED"`, `paidAt`, `refundedAt` (ISO 8601 or null).

| Method + path | Request | Success | Errors |
|---|---|---|---|
| `POST /api/orders/:id/pay` | cookie `sid` (CUSTOMER), no body | 200 order with `paymentStatus: "PAID"`, `paidAt` set | 400 (bad id) · 401 · 403 · 404 NOT_FOUND "Order not found." · 409 INVALID_STATE |

Error texts: "This order is already paid." · "This order was cancelled, so it can't be paid." · "This order was rejected, so it can't be paid." · "This order was already picked up." · "Order #N is not paid yet." (BR-15, from the advance route). `details: { status, paymentStatus }`.

## 5. Data

Uses the S2-1 migration (`payment_status` default UNPAID, `paid_at`, `refunded_at`). No new migration. Existing rows become UNPAID. The existing `(status, created_at)` index is enough.

## 6. Layers with no change

Login, menu (F-02/F-05), order placement (a new order starts UNPAID with no code change, from the column default), accept (F-04), `transitions.ts` table (payment is a separate field, not an order status).

## 7. Acceptance criteria

| ID | Given / when | Then |
|---|---|---|
| AC-8.1 | A PLACED order of alice, UNPAID; alice POSTs pay | 200, `paymentStatus: "PAID"`, `paidAt` set; DB row PAID; order status unchanged |
| AC-8.2 | A new order just placed | `paymentStatus` is `UNPAID` in the response and in `GET /api/orders` |
| AC-8.3 | Orders in ACCEPTED, PREPARING, READY (UNPAID) | Pay works on each (200) |
| AC-8.4 | Order CANCELLED, REJECTED or PICKED_UP (set directly in the DB), UNPAID | Pay → 409 INVALID_STATE; row unchanged |
| AC-8.5 | An already PAID order; pay again | 409 "This order is already paid."; `paidAt` unchanged |
| AC-8.6 | One UNPAID order; 10 pay requests at once | Exactly one 200 and nine 409; PAID once |
| AC-8.7 | Bob POSTs pay on alice's order; id 999999 | 404 NOT_FOUND both; alice's order unchanged |
| AC-8.8 | id `abc` or 3000000000 | 400 VALIDATION_ERROR (never 500) |
| AC-8.9 | No session; operator session | 401; 403; order unchanged |
| AC-8.10 | Body `{ amount: 1 }` sent | Ignored; response total equals the order total |
| AC-8.11 | (after F-06) PAID order, customer cancels | status CANCELLED, `paymentStatus: "REFUNDED"`, `refundedAt` set |
| AC-8.12 | (after F-06) PAID order, operator rejects | status REJECTED, `paymentStatus: "REFUNDED"` |
| AC-8.13 | (after F-06) UNPAID order cancelled | stays UNPAID, `refundedAt` null |
| AC-8.14 | (after F-07) READY and UNPAID; operator advances | 409 "Order #N is not paid yet."; stays READY |
| AC-8.15 | (after F-07) READY and PAID; operator advances | 200 PICKED_UP |
| AC-8.16 | UI: customer opens an unpaid PLACED order, presses Pay | "Paying…", then toast and green Paid badge; persists after reload |
| AC-8.17 | UI: operator queue, READY unpaid order | **Mark picked up** disabled with the waiting text; after the customer pays and Refresh, it is enabled |
| AC-8.18 | UI: payment card | Shows Simulated tag and note; no card input fields |

## 8. Test specification

Levels: unit / API (Vitest + Supertest, real Postgres) / E2E (Playwright). The test ID is at the start of each test name. Orders in special states are inserted directly in the test database (so F-08 does not wait for F-06/F-07 code).

| Test ID | AC | Level | Precondition / input | Action | Expected |
|---|---|---|---|---|---|
| TEST-8.1 | AC-8.1 | API | alice PLACED UNPAID | POST pay | 200 PAID, paidAt; DB PAID, status PLACED |
| TEST-8.2 | AC-8.2 | API | alice places order | read response and list | paymentStatus UNPAID |
| TEST-8.3 | AC-8.3 | API | ACCEPTED, PREPARING, READY orders | POST pay on each | 200 ×3 |
| TEST-8.4 | AC-8.4 | API | CANCELLED, REJECTED, PICKED_UP orders | POST pay | 409 ×3; rows unchanged |
| TEST-8.5 | AC-8.5 | API | PAID order | POST pay | 409 message; paidAt same |
| TEST-8.6 | AC-8.6 | API | one UNPAID order | 10 POST pay with `Promise.all` | one 200, nine 409 |
| TEST-8.7 | AC-8.7 | API | alice's order | bob pays it; pay 999999 | 404, 404; unchanged |
| TEST-8.8 | AC-8.8 | API | seed | pay `abc`, 3000000000 | 400, 400 |
| TEST-8.9 | AC-8.9 | API | alice's order | anonymous; staff | 401; 403 |
| TEST-8.10 | AC-8.10 | API | alice's order | POST pay with `{amount:1}` | 200; total unchanged |
| TEST-8.11 | AC-8.11 | API | PAID order (needs F-06) | alice cancels | CANCELLED + REFUNDED, refundedAt |
| TEST-8.12 | AC-8.12 | API | PAID order (needs F-06) | staff rejects | REJECTED + REFUNDED |
| TEST-8.13 | AC-8.13 | API | UNPAID order (needs F-06) | alice cancels | UNPAID, refundedAt null |
| TEST-8.14 | AC-8.14 | API | READY UNPAID (needs F-07) | staff advances | 409; READY |
| TEST-8.15 | AC-8.15 | API | READY PAID (needs F-07) | staff advances | 200 PICKED_UP |
| TEST-8.16 | AC-8.16 | E2E | alice, PLACED unpaid order | open order, press Pay, reload | toast; Paid badge persists |
| TEST-8.17 | AC-8.17 | E2E | READY unpaid order | staff opens queue; alice pays; staff refreshes | button disabled, then enabled |
| TEST-8.18 | AC-8.18 | E2E | order detail | read payment card | Simulated tag; no input fields |

TDD: TEST-8.1..8.10 are committed failing first (`[red]`, `docs/sprint_2/evidence/tdd/F-08-red.txt`), then the code (`[green]`, `F-08-green.txt`). TEST-8.11..8.13 get their own RED → GREEN after F-06 merges; TEST-8.14/8.15 after F-07 merges.

## 9. Definition of Done and order of work

See the Sprint 1 definition of done (linked above). F-08 specific:
- TEST-8.6 runs in every test run (not skipped); it is the evidence for the double-pay rule.
- Step 1 (now): pay route, badges, PayButton (AC-8.1..8.10, 8.16, 8.18).
- Step 2 (after F-06 merged into `sprint2`): BR-16 inside the cancel and reject updates. These are ninja's files, so vieng's worker posts a hand-off message first, and the change is a small PR reviewed by ninja's worker.
- Step 3 (after F-07 merged): BR-15 in the advance update, same hand-off rule (AC-8.14, 8.15, 8.17).

## 10. Version history

| Date | Version | Change | Why |
|---|---|---|---|
| 25 Nov 2026 | 1 | First contract | Before implementation (Issue #89) |
