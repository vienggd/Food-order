# F-07 Order fulfilment (preparing, ready, picked up) — engineering contract

Sprint 2. Issue: to be created (contract), then the code Issue. Owner: ninja. Reviewer: vieng. Branch `sprint2-ninja` (PR base `sprint2`).
Definition of Done: [`../../sprint_1/sprints/sprint-1/definition-of-done.md`](../../sprint_1/sprints/sprint-1/definition-of-done.md) (same checks; staging branch is `sprint2`, tag `v0.2.0-sprint2`). Status: **Specified** (committed before any F-07 code).

## 1. Feature and requirements

| Linked | Text (short) |
|---|---|
| FR-17 | Operator moves an accepted order step by step: PREPARING → READY → PICKED_UP |
| FR-18 | Operator sees all open orders (PLACED, ACCEPTED, PREPARING, READY) in one queue; the customer sees the current step |
| BR-13 | ACCEPTED → PREPARING → READY → PICKED_UP, one step at a time; no skipping, no going back (409); OPERATOR only (customer 403) |
| BR-15 | (F-08) PICKED_UP needs payment PAID. **Not in F-07**: vieng adds it to the advance route after F-07 merges (see section 9) |
| BR-07 | (Sprint 1) races decided by the database |
| FR-04, NFR-03 | Roles from the session; shared error format |

Depends on: schema PR S2-1 (`preparing_at`, `ready_at`, `picked_up_at`), F-01, F-03 (order JSON), F-04 (`transitions.ts`, queue). F-07 tests insert orders directly in the test database, with payment PAID where they move to PICKED_UP, so F-07 does not wait for F-08 code.

## 2. Behaviour

### Order status transitions (`server/src/orders/transitions.ts`)
| From | Allowed to |
|---|---|
| PLACED | ACCEPTED (F-04), REJECTED, CANCELLED (F-06) |
| ACCEPTED | **PREPARING** |
| PREPARING | **READY** |
| READY | **PICKED_UP** |
| PICKED_UP, REJECTED, CANCELLED | — (final) |

`nextStep(status)` returns the one next step of the fulfilment chain (ACCEPTED → PREPARING → READY → PICKED_UP) or `null` for every other status.

### Workflow — advance
1. Operator opens `/operator/orders`; each open card shows only its next button: **Start preparing** (ACCEPTED), **Mark ready** (PREPARING), **Mark picked up** (READY).
2. Client calls `POST /api/operator/orders/:id/advance` with `{ "from": "<status shown on the card>" }`.
3. Server validates `:id` and `from` (400), takes the one target `nextStep(from)`, then runs one conditional update: `UPDATE orders SET status = :next, <step>_at = now() WHERE id = :id AND status = :from`. `<step>_at` is `preparing_at`, `ready_at` or `picked_up_at`.
4. 1 row → 200 with the order. 0 rows → read the order: missing → 404; otherwise 409 (status unchanged).
5. Card moves to the next column/tab (or leaves the queue after PICKED_UP). The customer sees the new step on `/orders/:id` after refresh.

Why `from` is sent: if two staff members look at the same card, the second press must not move the order two steps. The request means "move this order from X"; if the order is no longer X, it is 409.

### Queue (`GET /api/operator/orders`)
- `status` is a comma-separated list of open statuses: `PLACED`, `ACCEPTED`, `PREPARING`, `READY`. Missing means `PLACED` (Sprint 1 behaviour). Any other value (`PICKED_UP`, `REJECTED`, `CANCELLED`, `nonsense`, an empty list, a list with an empty part like `PLACED,,READY`) → 400 VALIDATION_ERROR.
- Order: oldest `createdAt` first, ties by id (as Sprint 1). Items add `customer: { id, name }`. One call loads the whole board.

### Rules, validation, boundaries
- `:id` positive whole number up to 2147483647, else 400.
- `from` is required and must be one of `ACCEPTED`, `PREPARING`, `READY`; anything else (`PLACED`, `PICKED_UP`, `nonsense`, missing, a number) → 400 VALIDATION_ERROR with `details.field = "from"`. Validation (400) runs before the state check.
- 409 `INVALID_STATE`, `details: { status }` = current status:
  - the order has moved on (its status is later in the chain than `from`) → "Order #N is already PREPARING. Another staff member moved it." (the word is the current status)
  - otherwise (order is PLACED, REJECTED or CANCELLED) → "Order #N is PLACED, so it can't be moved to the next step." (word follows the status)
- No skipping and no going back: there is no way to ask for READY directly from ACCEPTED, and no route moves an order backwards.
- Two advance requests for the same step at the same time → exactly one 200, the other 409 (the conditional update decides). 20 parallel advances → exactly one 200.
- Order JSON gains `preparingAt`, `readyAt`, `pickedUpAt` (ISO 8601 or null) on every order endpoint.
- A PICKED_UP order can no longer be cancelled (F-06 409) and leaves the queue.

### Permissions
| Endpoint | Anonymous | CUSTOMER | OPERATOR |
|---|---|---|---|
| `POST /api/operator/orders/:id/advance` | 401 | 403 | ✔ any order (rules above) |
| `GET /api/operator/orders?status=…` | 401 | 403 | ✔ all customers' orders |

## 3. UI

Per [`../ui/ui-spec.md`](../ui/ui-spec.md) S8 (queue) and S6/S7 (customer view, display only), and the design pages.
- **S8 queue:** phone tabs **New** (PLACED) · **In progress** (ACCEPTED + PREPARING) · **Ready** (READY) with counts, selected tab kept in the URL (`?tab=new|progress|ready`); desktop board with columns Placed · Accepted · Preparing · Ready and counts. One call `GET /api/operator/orders?status=PLACED,ACCEPTED,PREPARING,READY`.
- Buttons per card: only the next step (table in ui-spec S8). READY with unpaid payment shows **Mark picked up** disabled with "Waiting for payment. The customer pays in the app." (the disabled state needs `paymentStatus`; it comes with F-08, until then the button is enabled).
- Busy: only that card locks ("Starting…", "Marking ready…", "Marking picked up…"). Toasts "Order #N is now Preparing.", "Order #N is ready.", "Order #N picked up." 409 → red "Not moved." + server text, then reload.
- **S6/S7 customer:** the tracker (Placed → Accepted → Preparing → Ready → Picked up) and the badge show all seven statuses; texts under the title per status as in ui-spec S6.

## 4. API

| Method + path | Request | Success | Errors |
|---|---|---|---|
| `POST /api/operator/orders/:id/advance` | cookie `sid` (OPERATOR), `{ from }` | 200 order with the new `status` and its `…At` set | 400 VALIDATION_ERROR (id, from) · 401 · 403 · 404 NOT_FOUND "Order not found." · 409 INVALID_STATE |
| `GET /api/operator/orders?status=PLACED,ACCEPTED,PREPARING,READY` | cookie `sid` (OPERATOR) | 200 array of orders with `customer`, oldest first | 400 VALIDATION_ERROR · 401 · 403 |

Order JSON adds `preparingAt`, `readyAt`, `pickedUpAt`.

## 5. Data

Uses the S2-1 migration (`preparing_at`, `ready_at`, `picked_up_at`). No new migration. The existing index `(status, created_at)` serves the queue.

## 6. Acceptance criteria

| ID | Given / when | Then |
|---|---|---|
| AC-F07-01 | An ACCEPTED order; operator advances with `from: "ACCEPTED"` | 200 `status: "PREPARING"`, `preparingAt` set; DB row PREPARING |
| AC-F07-02 | The order is PREPARING; advance with `from: "PREPARING"` | 200 READY, `readyAt` set |
| AC-F07-03 | The order is READY (payment PAID, seeded); advance with `from: "READY"` | 200 PICKED_UP, `pickedUpAt` set; the order is not in the queue any more |
| AC-F07-04 | Walk one order ACCEPTED → PREPARING → READY → PICKED_UP | Each step is a separate 200; the three times are set in order |
| AC-F07-05 | Orders in PLACED, REJECTED, CANCELLED; advance with `from: "ACCEPTED"` | 409 "Order #N is PLACED, so it can't be moved to the next step." (word follows the status); row unchanged |
| AC-F07-06 | A PICKED_UP order; advance with `from: "READY"` | 409 "Order #N is already PICKED_UP. Another staff member moved it."; row unchanged (no going back, no repeat) |
| AC-F07-07 | An ACCEPTED order; advance with `from: "READY"` (skip) | 409 (order is not READY); row stays ACCEPTED. `from: "PLACED"`, `"PICKED_UP"`, `"nonsense"`, missing, a number → 400 |
| AC-F07-08 | A PREPARING order; a second operator advances with the old `from: "ACCEPTED"` | 409 "Order #N is already PREPARING. Another staff member moved it."; row stays PREPARING (not moved twice) |
| AC-F07-09 | One ACCEPTED order; 20 advance requests with `from: "ACCEPTED"` at the same time (BR-07, NFR-04) | Exactly one 200 and nineteen 409; order PREPARING once |
| AC-F07-10 | Advance id 999999; id `abc`; id 3000000000 | 404; 400; 400 (never 500) |
| AC-F07-11 | Customer session; no session — on advance | 403 FORBIDDEN (BR-13); 401 UNAUTHENTICATED; order unchanged |
| AC-F07-12 | Open orders in all four statuses, one PICKED_UP, one REJECTED, one CANCELLED; `GET …?status=PLACED,ACCEPTED,PREPARING,READY` | Only the four open orders, oldest first, each with `customer` and `lines` |
| AC-F07-13 | `?status=` missing / `PLACED` / `READY` / `PICKED_UP` / `CANCELLED` / `nonsense` / empty / `PLACED,,READY` | Missing and `PLACED` → PLACED orders only; `READY` → READY only; the rest → 400 VALIDATION_ERROR |
| AC-F07-14 | A customer reads their order after each step | `GET /api/orders/:id` shows the new status and the `…At` time |
| AC-F07-15 | `canTransition` and `nextStep` | ACCEPTED → PREPARING, PREPARING → READY, READY → PICKED_UP true; ACCEPTED → READY, READY → PREPARING, PICKED_UP → anything, PLACED → PREPARING false; `nextStep` as in section 2 |
| AC-F07-16 | UI: operator opens the queue with orders in all four statuses | Four columns (desktop) or three tabs with counts (phone); each card shows only its next button |
| AC-F07-17 | UI: operator presses **Start preparing**, then **Mark ready**, then **Mark picked up** | Each press: card locks, toast, card moves; after the last the card leaves the queue |
| AC-F07-18 | UI: another staff member moved the order after the page loaded; operator presses the old button | "Order #N is already …" message and the list reloads with the order in its right place |
| AC-F07-19 | UI: customer opens the order after each step | The tracker and badge show the current step |

## 7. Test specification

Levels as in F-01 (unit / API with real Postgres / E2E). The test ID is at the start of each test name. Orders are inserted directly in the test database; orders that move to PICKED_UP are seeded with payment PAID.

| Test ID | AC | Level | Precondition / input | Action | Expected |
|---|---|---|---|---|---|
| TEST-F07-01 | AC-F07-01 | API | ACCEPTED order | POST advance `{from:"ACCEPTED"}` as staff | 200 PREPARING + preparingAt; DB row |
| TEST-F07-02 | AC-F07-02 | API | PREPARING order | POST advance `{from:"PREPARING"}` | 200 READY + readyAt |
| TEST-F07-03 | AC-F07-03 | API | READY order, payment PAID | POST advance `{from:"READY"}`; GET queue | 200 PICKED_UP + pickedUpAt; queue empty |
| TEST-F07-04 | AC-F07-04 | API | ACCEPTED order, PAID | three advances in a row | 200, 200, 200; times set in order; final PICKED_UP |
| TEST-F07-05 | AC-F07-05 | API | PLACED, REJECTED, CANCELLED orders | POST advance `{from:"ACCEPTED"}` on each | 409 with each text; DB unchanged |
| TEST-F07-06 | AC-F07-06 | API | PICKED_UP order | POST advance `{from:"READY"}` | 409 "already PICKED_UP…"; DB unchanged |
| TEST-F07-07 | AC-F07-07 | API | ACCEPTED order | `{from:"READY"}`; `{from:"PLACED"}`, `"PICKED_UP"`, `"nonsense"`, missing, `5` | 409; then 400 ×5; DB still ACCEPTED |
| TEST-F07-08 | AC-F07-08 | API | PREPARING order | POST advance `{from:"ACCEPTED"}` | 409 "already PREPARING…"; DB still PREPARING, readyAt null |
| TEST-F07-09 | AC-F07-09 | API | ACCEPTED order | 20 POST advance `{from:"ACCEPTED"}` in parallel (`Promise.all`) | one 200, nineteen 409; DB PREPARING |
| TEST-F07-10 | AC-F07-10 | API | Seed | POST advance 999999, `abc`, 3000000000 with a valid body | 404, 400, 400 |
| TEST-F07-11 | AC-F07-11 | API | ACCEPTED order | POST advance as alice; anonymous | 403; 401; DB ACCEPTED |
| TEST-F07-12 | AC-F07-12 | API | 7 orders (4 open, PICKED_UP, REJECTED, CANCELLED) with different `createdAt` | GET queue with the four statuses | 4 orders oldest first; customer + lines present |
| TEST-F07-13 | AC-F07-13 | API | As 12 | GET with each `status` value of the AC | as in the AC |
| TEST-F07-14 | AC-F07-14 | API | ACCEPTED order of alice | advance once; GET order as alice | status PREPARING and `preparingAt` in the JSON |
| TEST-F07-15 | AC-F07-15 | unit | — | `canTransition` for every pair of the 7 statuses; `nextStep` for each status | true only for the table in section 2; nextStep as specified |
| TEST-F07-16 | AC-F07-16 | E2E | One order per open status | Log in as staff | Columns/tabs with counts; one next button per card |
| TEST-F07-17 | AC-F07-17 | E2E | ACCEPTED order, payment PAID (seeded) | Start preparing → Mark ready → Mark picked up | Toasts as in section 3; card leaves after the last |
| TEST-F07-18 | AC-F07-18 | E2E | ACCEPTED order, staff page loaded; order set to PREPARING directly in the database | Press **Start preparing** | "already PREPARING" message; list reloads, card under Preparing |
| TEST-F07-19 | AC-F07-19 | E2E | As 17 | After each step, log in as alice and open the order | Badge and tracker show the step |

TDD: TEST-F07-01..15 are committed failing first (`[red]`, `docs/sprint_2/evidence/tdd/F-07-red.txt`), then the code (`[green]`, `F-07-green.txt`). E2E tests come with the UI part.

## 8. Definition of Done

See the Sprint 1 [`definition-of-done.md`](../../sprint_1/sprints/sprint-1/definition-of-done.md). F-07 specific: TEST-F07-09 runs in every test run (not skipped); root `npm run build` and all tests green before the PR.

## 9. Layers with no change

- Schema and migration: none (S2-1 already has the columns).
- Auth and sessions, menu, order placement: unchanged; the place-order code is not edited.
- Accept (F-04) and cancel/reject (F-06): same routes and texts.
- **Sprint 1 test update:** AC-F04-03 / TEST-F04-03 said `?status=ACCEPTED` → 400. Since F-07 the four open statuses are valid, so that test changes to use `PICKED_UP` and `nonsense` (still 400). This is recorded in the F-04 version history (v1.3) in the same PR as the F-07 code.
- Payment: BR-15 (PICKED_UP needs PAID, 409 "Order #N is not paid yet.") is added to the advance route by vieng's F-08 work after F-07 merges; the paid check is part of the same conditional update. Until then F-07 does not look at payment fields.
- Router mounts in `server/src/app.ts`: `/api/operator` already exists; no new mount.

## 10. Version history

| Date | Version | Change | Why |
|---|---|---|---|
| 25 Nov 2026 | 1 | First contract | Before implementation (contract before code). `from` in the advance body added so a stale second press cannot move an order two steps (ui-spec sketch had no body) |
