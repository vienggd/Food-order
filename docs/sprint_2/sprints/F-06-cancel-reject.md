# F-06 Cancel and reject order — engineering contract

Sprint 2. Issue: to be created (contract), then the code Issue. Owner: ninja. Reviewer: vieng. Branch `sprint2-ninja` (PR base `sprint2`).
Definition of Done: [`../../sprint_1/sprints/sprint-1/definition-of-done.md`](../../sprint_1/sprints/sprint-1/definition-of-done.md) (same checks; staging branch is `sprint2`, tag `v0.2.0-sprint2`). Status: **Specified** (committed before any F-06 code).

## 1. Feature and requirements

| Linked | Text (short) |
|---|---|
| FR-15 | Customer cancels own order before the café accepts it |
| FR-16 | Operator rejects an order with a reason; the customer sees the reason |
| BR-11 | Customer cancels own order only while PLACED; someone else's order → 404; after accept → 409 |
| BR-12 | Operator rejects only while PLACED; reason 3–200 characters, shown to the customer |
| BR-06, BR-07 | (Sprint 1) accept needs PLACED; races decided by the database |
| BR-16 | (F-08) cancel or reject of a PAID order also sets payment REFUNDED. **Not in F-06**: vieng adds it after F-06 merges (sync S2) |
| FR-04, NFR-03 | Roles from the session; shared error format |

Depends on: schema PR S2-1 (`cancelled_at`, `rejected_at`, `reject_reason`), F-01 (`requireRole`), F-03 (order JSON), F-04 (`transitions.ts`, accept). F-06 tests insert orders directly in the test database and use UNPAID orders only.

## 2. Behaviour

### Order status transitions (`server/src/orders/transitions.ts`)
PLACED gains two targets. Nothing else changes.

| From | Allowed to |
|---|---|
| PLACED | ACCEPTED (F-04), **REJECTED**, **CANCELLED** (F-06) |
| ACCEPTED, PREPARING, READY | — here (F-07 adds the steps) |
| PICKED_UP, REJECTED, CANCELLED | — (final) |

### Workflow — cancel (customer)
1. Customer opens `/orders/:id` (status PLACED) and presses **Cancel order**; a confirm sheet/dialog asks "Cancel order #N?" (**Keep order** / **Cancel order**).
2. Client calls `POST /api/orders/:id/cancel` (no body).
3. Server runs one conditional update: `UPDATE orders SET status = 'CANCELLED', cancelled_at = now() WHERE id = :id AND customer_id = :me AND status IN (statuses that may move to CANCELLED)`.
4. 1 row → 200 with the order. 0 rows → read the order with `id` and `customer_id = :me`: none (missing, or someone else's) → 404 "Order not found."; otherwise 409 (status unchanged, see texts below).
5. Page shows the new status and the toast "Order #N cancelled."

### Workflow — reject (operator)
1. Operator presses **Reject** on a PLACED card; the dialog asks for a reason (counter n / 200).
2. Client calls `POST /api/operator/orders/:id/reject` with `{ "reason": "…" }`.
3. Server validates `:id` and the body first (400), then runs one conditional update: `UPDATE orders SET status = 'REJECTED', rejected_at = now(), reject_reason = :reason WHERE id = :id AND status IN (statuses that may move to REJECTED)`.
4. 1 row → 200 with the order. 0 rows → read the order: missing → 404; otherwise 409 (status unchanged, reason not saved).
5. The card leaves the queue; toast "Order #N rejected. The customer can see your reason." The customer sees the reason word for word on `/orders/:id`.

### Rules, validation, boundaries
- `:id` must be a positive whole number up to 2147483647, else 400 (`dbId`).
- `reason` is required, a string, trimmed on the server; **3–200 characters after trimming**, else 400 VALIDATION_ERROR "Reason must be 3–200 characters." with `details.field = "reason"`. 2 and 201 characters fail; 3 and 200 pass. The saved reason is the trimmed text and is shown as plain text (never as HTML).
- Validation (400) runs before the state check: a bad reason on a non-PLACED order is 400.
- 409 texts (`details: { status }` = current status):
  - cancel, status ACCEPTED / PREPARING / READY / PICKED_UP → "This order was already accepted, so it can't be cancelled."; REJECTED → "This order was already rejected, so it can't be cancelled."; CANCELLED → "This order is already cancelled."
  - reject, status CANCELLED → "Order #N was already cancelled by the customer."; ACCEPTED / PREPARING / READY / PICKED_UP → "Order #N was already accepted by another staff member."; REJECTED → "Order #N was already rejected."
- The accept route (F-04) keeps its Sprint 1 messages; only reject uses the cancelled-by-customer text.
- Races are decided by the database: the conditional update is atomic. Reject and accept sent together → exactly one 200 and one 409; cancel and accept together → exactly one 200 and one 409; the final status matches the 200. A rejected or cancelled order can never become ACCEPTED, and the other way round.
- Order JSON gains `cancelledAt`, `rejectedAt`, `rejectReason` (ISO 8601 or null) on every order endpoint, the operator queue included.

### Permissions
| Endpoint | Anonymous | CUSTOMER | OPERATOR |
|---|---|---|---|
| `POST /api/orders/:id/cancel` | 401 | ✔ own order (someone else's → 404, never 403) | 403 |
| `POST /api/operator/orders/:id/reject` | 401 | 403 | ✔ any order (rules above) |

## 3. UI

Per [`../ui/ui-spec.md`](../ui/ui-spec.md) S6 and S8 and the phone/desktop design pages.
- **S6 `/orders/:id`:** **Cancel order** (outlined red) only while PLACED; confirm sheet (phone) / dialog (desktop, Esc closes) with focus on **Keep order**; "Cancelling…" locks the button; toast "Order #N cancelled."; 409 → red "Not cancelled." + server text, then reload. CANCELLED shows the card "You cancelled this order" + time. REJECTED shows the red card "The café rejected this order", **Reason: "…"** and time.
- **S8 `/operator/orders`:** **Reject** (outlined red) next to **Accept order** on PLACED cards; reject sheet/dialog "Reject order #N?" with the textarea, counter "n / 200", hint "3–200 characters", **Back** · **Reject order**; client messages "Write at least 3 characters." / "Keep it to 200 characters or fewer."; "Rejecting…" locks that card; 409 → "Not rejected." + server text, then reload; rejected orders leave the queue.
- Refund texts in the cards come with F-08.

## 4. API

Order JSON adds `cancelledAt`, `rejectedAt`, `rejectReason`.

| Method + path | Request | Success | Errors |
|---|---|---|---|
| `POST /api/orders/:id/cancel` | cookie `sid` (CUSTOMER), no body | 200 order with `status: "CANCELLED"`, `cancelledAt` set | 400 (bad id) · 401 · 403 · 404 NOT_FOUND "Order not found." · 409 INVALID_STATE |
| `POST /api/operator/orders/:id/reject` | cookie `sid` (OPERATOR), `{ reason }` | 200 order with `status: "REJECTED"`, `rejectedAt`, `rejectReason` set | 400 VALIDATION_ERROR (bad id, reason) · 401 · 403 · 404 · 409 INVALID_STATE |

## 5. Data

Uses the S2-1 migration (`cancelled_at`, `rejected_at`, `reject_reason`). No new migration. The existing index `(status, created_at)` is enough.

## 6. Acceptance criteria

| ID | Given / when | Then |
|---|---|---|
| AC-F06-01 | A PLACED order of alice; alice cancels it | 200 `status: "CANCELLED"`, `cancelledAt` set; DB row CANCELLED; not in the operator queue |
| AC-F06-02 | An order of alice in ACCEPTED, PREPARING, READY, PICKED_UP; alice cancels (BR-11) | 409 INVALID_STATE "This order was already accepted, so it can't be cancelled."; row unchanged |
| AC-F06-03 | A REJECTED order and a CANCELLED order of alice; alice cancels | 409 with the REJECTED / CANCELLED text; row unchanged |
| AC-F06-04 | A PLACED order of bob; alice cancels it | 404 NOT_FOUND "Order not found."; order still PLACED (same answer as an order that does not exist) |
| AC-F06-05 | Cancel id 999999; id `abc`; id 3000000000 | 404; 400; 400 (never 500) |
| AC-F06-06 | Operator session; no session — on cancel | 403 FORBIDDEN; 401 UNAUTHENTICATED; order unchanged |
| AC-F06-07 | A PLACED order; operator rejects with reason "Out of milk" | 200 `status: "REJECTED"`, `rejectedAt` set, `rejectReason: "Out of milk"`; DB row REJECTED; not in the queue |
| AC-F06-08 | Reason of 2, 3, 200 and 201 characters; `"   ab   "`; missing; empty; a number | 400; 200; 200; 400; 400 (2 after trimming); 400; 400; 400. Every 400 leaves the order PLACED and the reason empty |
| AC-F06-09 | Reason `"  Out of milk  "` | Saved and returned as `"Out of milk"` |
| AC-F06-10 | An ACCEPTED order, a CANCELLED order, a REJECTED order; operator rejects with a valid reason | 409 each with its text; row unchanged; the old `rejectReason` is not overwritten |
| AC-F06-11 | One PLACED order; accept and reject sent at the same time (BR-12, NFR-04) | Exactly one 200 and one 409; the DB status matches the 200 |
| AC-F06-12 | One PLACED order; accept and cancel sent at the same time | Exactly one 200 and one 409; the DB status matches the 200 |
| AC-F06-13 | Reject id 999999; id `abc`; id 3000000000 | 404; 400; 400 |
| AC-F06-14 | Customer session; no session — on reject | 403; 401; order unchanged |
| AC-F06-15 | A rejected order of alice; alice reads `GET /api/orders/:id` and `GET /api/orders` | The reason is in the JSON word for word; bob gets 404 for the order |
| AC-F06-16 | `canTransition` | PLACED → REJECTED and PLACED → CANCELLED true; PLACED → ACCEPTED true; ACCEPTED → CANCELLED, REJECTED → ACCEPTED, CANCELLED → PLACED and every other pair false |
| AC-F06-17 | UI: customer opens a PLACED order, presses **Cancel order**, then **Keep order** | Sheet closes; order still PLACED |
| AC-F06-18 | UI: customer presses **Cancel order**, then **Cancel order** in the sheet | "Cancelling…", then "Order #N cancelled."; status CANCELLED; no Cancel button |
| AC-F06-19 | UI: operator opens Reject, types 2 characters, presses **Reject order** | "Write at least 3 characters."; nothing sent |
| AC-F06-20 | UI: operator rejects with "Out of milk"; customer opens the order | Card leaves the queue with a toast; customer sees the reason "Out of milk" |
| AC-F06-21 | UI: order cancelled after the operator page loaded; operator presses **Accept order** (one order) or **Reject order** (another) | Accept: "Only PLACED orders can be accepted."; Reject: "Order #N was already cancelled by the customer."; the list reloads without them |

## 7. Test specification

Levels as in F-01 (unit / API with real Postgres / E2E). The test ID is at the start of each test name. Orders are inserted directly in the test database.

| Test ID | AC | Level | Precondition / input | Action | Expected |
|---|---|---|---|---|---|
| TEST-F06-01 | AC-F06-01 | API | alice PLACED order | POST cancel as alice; GET queue as staff | 200 CANCELLED + cancelledAt; DB CANCELLED; queue empty |
| TEST-F06-02 | AC-F06-02 | API | alice orders in ACCEPTED, PREPARING, READY, PICKED_UP | POST cancel on each | 409 with text; DB unchanged |
| TEST-F06-03 | AC-F06-03 | API | alice REJECTED and CANCELLED orders | POST cancel on each | 409 with each text; DB unchanged |
| TEST-F06-04 | AC-F06-04 | API | bob PLACED order | POST cancel as alice | 404 "Order not found."; DB PLACED; body equals the 404 for id 999999 |
| TEST-F06-05 | AC-F06-05 | API | Seed | POST cancel 999999, `abc`, 3000000000 | 404, 400, 400 |
| TEST-F06-06 | AC-F06-06 | API | alice PLACED order | POST cancel as staff; anonymous | 403; 401; DB PLACED |
| TEST-F06-07 | AC-F06-07 | API | PLACED order | POST reject `{reason:"Out of milk"}` as staff; GET queue | 200 REJECTED + rejectedAt + reason; DB row; queue empty |
| TEST-F06-08 | AC-F06-08 | API | A new PLACED order for each input | reasons of 2, 3, 200, 201 chars, `"   ab   "`, missing, empty, `123` | 400, 200, 200, 400, 400, 400, 400, 400; failed ones leave PLACED and null reason |
| TEST-F06-09 | AC-F06-09 | API | PLACED order | reason `"  Out of milk  "` | Response and DB reason are `"Out of milk"` |
| TEST-F06-10 | AC-F06-10 | API | orders in ACCEPTED, CANCELLED, REJECTED (reason "first") | POST reject with "second reason" | 409 each with text; DB status unchanged, reason still "first" |
| TEST-F06-11 | AC-F06-11 | API | A new PLACED order per round | accept + reject in parallel, 10 rounds | each round: one 200 and one 409; DB status equals the winner |
| TEST-F06-12 | AC-F06-12 | API | A new PLACED order per round | accept + cancel in parallel, 10 rounds | each round: one 200, one 409; DB equals the winner |
| TEST-F06-13 | AC-F06-13 | API | Seed | POST reject 999999, `abc`, 3000000000 with a valid reason | 404, 400, 400 |
| TEST-F06-14 | AC-F06-14 | API | PLACED order | POST reject as alice; anonymous | 403; 401; DB PLACED |
| TEST-F06-15 | AC-F06-15 | API | REJECTED order of alice with a reason | GET order and list as alice; GET order as bob | reason in the JSON; bob 404 |
| TEST-F06-16 | AC-F06-16 | unit | — | `canTransition` for every (from, to) pair of the 7 statuses | true only for PLACED → ACCEPTED, REJECTED, CANCELLED |
| TEST-F06-17 | AC-F06-17 | E2E | Seed; alice PLACED order | Log in as alice; Cancel order → Keep order | Order still PLACED |
| TEST-F06-18 | AC-F06-18 | E2E | As 17 | Cancel order → Cancel order | "Order #N cancelled."; badge Cancelled; no Cancel button |
| TEST-F06-19 | AC-F06-19 | E2E | PLACED order | Staff: Reject; type "ab"; Reject order | "Write at least 3 characters."; order still PLACED |
| TEST-F06-20 | AC-F06-20 | E2E | PLACED order | Staff rejects with "Out of milk"; log in as alice and open the order | Toast; card gone; alice sees the reason |
| TEST-F06-21 | AC-F06-21 | E2E | Two PLACED orders, staff page loaded; both then set to CANCELLED directly in the database | Press Accept order on one, Reject (valid reason) on the other | Accept text and Reject text as in the AC; list reloads without them |

TDD: TEST-F06-01..16 are committed failing first (`[red]`, `docs/sprint_2/evidence/tdd/F-06-red.txt`), then the code (`[green]`, `F-06-green.txt`). E2E tests come with the UI part.

## 8. Definition of Done

See the Sprint 1 [`definition-of-done.md`](../../sprint_1/sprints/sprint-1/definition-of-done.md). F-06 specific: TEST-F06-11 and TEST-F06-12 run in every test run (not skipped) because they are the evidence for BR-12 and the race rule. Root `npm run build` and all tests green before the PR.

## 9. Layers with no change

- Schema and migration: none (S2-1 already has the columns).
- Auth and sessions (F-01), menu (F-02), order placement (F-03): unchanged; the place-order code is not edited.
- Accept (F-04): same route and texts; it only uses the new transitions table.
- Payment: BR-16 refund on cancel/reject is added by F-08 after F-06 merges. Until then cancel and reject do not touch payment fields.
- Router mounts in `server/src/app.ts`: `/api/orders` and `/api/operator` already exist; no new mount.

## 10. Version history

| Date | Version | Change | Why |
|---|---|---|---|
| 25 Nov 2026 | 1 | First contract | Before implementation (contract before code) |
