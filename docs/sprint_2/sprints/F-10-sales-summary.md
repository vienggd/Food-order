# F-10 Sales summary — engineering contract (Sprint 3)

Sprint 3. Issue #92 (contract). Owner: vieng. Reviewer: ninja. Status: **Specified** (contract only; code in Sprint 3, after Deliverable 2).
Definition of Done: [`../../sprint_1/sprints/sprint-1/definition-of-done.md`](../../sprint_1/sprints/sprint-1/definition-of-done.md).

## 1. Feature and requirements

| Linked | Text (short) |
|---|---|
| FR-17 | Operator sees order count and sales total per day and the best-selling items |
| BR-17 | Only orders with `paymentStatus = PAID` and status PICKED_UP count as sales |
| BR-18 | Days are Asia/Bangkok calendar days, by `pickedUpAt` |
| BR-19 | Top items: best 3 by quantity sold; ties by item name |
| NFR-03, FR-04 | Shared error format; OPERATOR only |

Depends on: F-07 (`pickedUpAt`), F-08 (`paymentStatus`), schema S2-1. BR-17..19 are new Sprint 3 rules.

## 2. Behaviour

### Workflow
1. Operator opens `/operator/sales` → `GET /api/operator/sales?from=YYYY-MM-DD&to=YYYY-MM-DD` (both optional; default: last 7 days including today).
2. Server counts only orders that are PICKED_UP **and** PAID (refunded, cancelled, rejected, unpaid and open orders are left out).
3. Response: one row per day with data (newest first) and the top 3 items for the range.

### Rules, validation, boundaries
- `from` and `to`: valid dates `YYYY-MM-DD`, `from` ≤ `to`, range at most 92 days; otherwise 400 VALIDATION_ERROR.
- Totals come from `orders.total` (satang) and quantities from `order_lines.quantity`, which are the order-time snapshots (BR-05): a later price edit does not change past sales.
- A day without sales is not listed. No orders in range → `days: []`, `topItems: []`.
- Top items: fewer than 3 items sold → fewer rows.

### Permissions
| Endpoint | Anonymous | CUSTOMER | OPERATOR |
|---|---|---|---|
| `GET /api/operator/sales` | 401 | 403 | ✔ |

## 3. UI — Sales summary (`/operator/sales`)
Operator navigation gets a third link **Sales**. Shows a date range (two date inputs + **Show**), number cards (Orders, Sales total), a table per day (Date, Orders, Sales), and **Top 3 items** (name, quantity). States: loading, empty "No sales in this period.", error + **Reload**, 400 message under the date fields. Exact design is drawn in Sprint 3 and added to the UI spec.

## 4. API

| Method + path | Request | Success | Errors |
|---|---|---|---|
| `GET /api/operator/sales?from&to` | cookie `sid` (OPERATOR) | 200 `{ from, to, days: [{ date, orderCount, salesTotal }], topItems: [{ menuItemId, name, quantity }] }` | 400 VALIDATION_ERROR · 401 · 403 |

## 5. Data
No new table or migration. Queries read `orders` (`status`, `payment_status`, `picked_up_at`, `total`) and `order_lines`. If the query is slow, add an index on `(status, payment_status, picked_up_at)` in a later migration.

## 6. Layers with no change
Order placement, payment, fulfilment, menu, login.

## 7. Acceptance criteria

| ID | Given / when | Then |
|---|---|---|
| AC-10.1 | PICKED_UP + PAID orders on two days | one row per day with correct count and total |
| AC-10.2 | Also CANCELLED, REJECTED, unpaid-READY and REFUNDED orders | not counted |
| AC-10.3 | Orders at 23:30 and 00:30 Bangkok time | counted on their own Bangkok days |
| AC-10.4 | Items sold: Latte 5, Croissant 3, Mocha 3, Tea 1 | top 3 = Latte, Croissant, Mocha (tie by name) |
| AC-10.5 | Price edited after a sale | past sale total unchanged |
| AC-10.6 | `from` after `to`, bad date, range over 92 days | 400 |
| AC-10.7 | No sales in range | 200 with empty lists |
| AC-10.8 | Customer; no session | 403; 401 |
| AC-10.9 | UI: operator opens Sales with sales | cards, per-day table and top 3 shown; empty state otherwise |

## 8. Test specification

| Test ID | AC | Level | Precondition / input | Action | Expected |
|---|---|---|---|---|---|
| TEST-10.1 | AC-10.1 | API | orders inserted on 2 days | GET sales | 2 rows, correct sums |
| TEST-10.2 | AC-10.2 | API | one order per excluded state | GET sales | none counted |
| TEST-10.3 | AC-10.3 | API | `pickedUpAt` 16:30Z and 17:30Z the same UTC day | GET sales | 2 different days |
| TEST-10.4 | AC-10.4 | API | line quantities as in AC | GET sales | top 3 order as stated |
| TEST-10.5 | AC-10.5 | API | sale, then PATCH menu price | GET sales | total unchanged |
| TEST-10.6 | AC-10.6 | API | bad queries | GET sales | 400 each |
| TEST-10.7 | AC-10.7 | API | no orders | GET sales | empty lists |
| TEST-10.8 | AC-10.8 | API | seed | as alice, anonymous | 403, 401 |
| TEST-10.9 | AC-10.9 | E2E | seeded sales | staff opens Sales | content as stated |

TDD: TEST-10.1..10.8 committed failing first, then code.

## 9. Definition of Done
Sprint 1 definition of done. Status when this contract is merged: **planned** (not implemented).

## 10. Version history

| Date | Version | Change | Why |
|---|---|---|---|
| 25 Nov 2026 | 1 | First contract | Sprint 3 contracts for Deliverable 2 part C (Issue #92) |
