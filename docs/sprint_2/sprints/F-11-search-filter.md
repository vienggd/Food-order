# F-11 Order search and filter — engineering contract (Sprint 3)

Sprint 3. Issue: to be created (contract). Owner: ninja. Reviewer: vieng. Status: **Specified** (contract only; code later in Sprint 3).
Definition of Done: [`../../sprint_1/sprints/sprint-1/definition-of-done.md`](../../sprint_1/sprints/sprint-1/definition-of-done.md).

## 1. Feature and requirements

| Linked | Text (short) |
|---|---|
| FR-18 | Customers filter their orders by status; operators search orders by number, customer or status |
| BR-25 | A customer only ever gets their own orders, filtered or not |
| BR-26 | Operator search `q` matches the order number exactly, or part of the customer name (ignoring upper/lower case) |
| BR-27 | Filters combine with AND; no match is an empty list, not an error |
| FR-04, NFR-03 | Roles from the session; shared error format |

Depends on: F-03 (`GET /api/orders`), F-04 and F-07 (`GET /api/operator/orders`, status list), F-06/F-07 (all statuses exist).

## 2. Behaviour

### Customer filter — `GET /api/orders?status=…`
1. `status` is optional: one status or a comma-separated list of the 7 statuses (`PLACED`, `ACCEPTED`, `PREPARING`, `READY`, `PICKED_UP`, `REJECTED`, `CANCELLED`). Missing → all own orders (Sprint 1 behaviour).
2. Result: the caller's own orders in the list, newest first (as Sprint 1), with payment fields.
3. Any other value (`nonsense`, lower-case `placed`, an empty value, `PLACED,,READY`) → 400 VALIDATION_ERROR `details.field = "status"`.

### Operator search — `GET /api/operator/orders?status=…&q=…`
1. `status`: as F-07, but F-11 widens the allowed values to all 7 statuses (list allowed). Missing → `PLACED` (Sprint 1 behaviour, unchanged).
2. `q` (optional): trimmed, 1–60 characters, else 400 `details.field = "q"`. An optional leading `#` is ignored. If what is left is digits only and ≤ 2147483647, orders with that **id** match; every `q` also matches orders whose customer **name contains** `q` (case-insensitive; the characters `%` and `_` are plain characters, not wildcards). The two matches are OR-ed; then the status filter is applied (AND).
3. Result: oldest first (as the queue), `customer` included, **at most 200 orders**; `[]` when nothing matches.
4. The operator queue screen keeps its default (open orders, no `q`); search is an extra box with the status filter.

### Rules, validation, boundaries
- Filtering is done by the database query, never by loading everything and cutting in the client.
- `q` of 60 characters passes, 61 → 400; blank after trimming → 400 (an empty box in the UI sends no `q`).
- Searching never changes any order; no extra permission is needed beyond the existing ones.
- Another customer's orders can never appear in a customer's list, whatever the filter (BR-25).

### Permissions
| Endpoint | Anonymous | CUSTOMER | OPERATOR |
|---|---|---|---|
| `GET /api/orders?status=` | 401 | ✔ own orders only | 403 |
| `GET /api/operator/orders?status=&q=` | 401 | 403 | ✔ all customers' orders |

## 3. UI
- **My orders (`/orders`):** a row of status chips (All · Placed · Accepted · Preparing · Ready · Picked up · Rejected · Cancelled) above the list; the chosen chip is kept in the URL (`?status=READY`). Empty result: "No orders with this status." (differs from "No orders yet." for a customer with no orders at all).
- **Operator queue (`/operator/orders`):** a search box ("Order number or customer name") and a status select above the board; **Search** and **Clear** buttons; results list with the same cards. Empty: "No orders match your search." Error: "Couldn't search orders." + **Try again**. Typing does not search on every key; pressing Search or Enter does.
- Both lists keep the Sprint 1 loading, error and reload behaviour.

## 4. API

| Method + path | Request | Success | Errors |
|---|---|---|---|
| `GET /api/orders?status=` | cookie `sid` (CUSTOMER) | 200 own orders, newest first | 400 (status) · 401 · 403 |
| `GET /api/operator/orders?status=&q=` | cookie `sid` (OPERATOR) | 200 array of orders with `customer`, oldest first, at most 200 | 400 (status, q) · 401 · 403 |

## 5. Data
No new table or migration. Queries use `orders.status`, `orders.id`, `users.name` and the existing index `(status, created_at)`; if the name search is slow, a later migration may add an index on `lower(users.name)`.

## 6. Acceptance criteria

| ID | Given / when | Then |
|---|---|---|
| AC-F11-01 | alice has orders in PLACED, READY, CANCELLED; she asks `?status=READY` | only the READY order |
| AC-F11-02 | alice asks `?status=PLACED,CANCELLED` | the PLACED and CANCELLED orders, newest first |
| AC-F11-03 | alice asks with no `status` | all her orders (as Sprint 1) |
| AC-F11-04 | bob has READY orders; alice asks `?status=READY` | bob's orders are never in alice's list |
| AC-F11-05 | alice asks `?status=nonsense`, `placed`, empty, `PLACED,,READY` | 400 VALIDATION_ERROR `details.field = "status"` |
| AC-F11-06 | alice has no orders with the status asked | 200 `[]` |
| AC-F11-07 | Operator: orders #12 (alice), #13 (bob), #120 (alice); `?q=12` | only #12 (exact id match; #120 is not matched; no customer name contains "12") |
| AC-F11-08 | Operator: `?q=%23120` (that is `#120`) | #120 only |
| AC-F11-09 | Operator: `?q=ALI` and `?q=ali` | all of alice's orders both times (case-insensitive) |
| AC-F11-10 | Operator: `?q=ali&status=READY` | only alice's READY orders (AND) |
| AC-F11-11 | Operator: `?status=PICKED_UP`, `?status=REJECTED,CANCELLED` | those orders (all 7 statuses allowed since F-11); `nonsense` → 400 |
| AC-F11-12 | Operator: `?q=` (blank after trim), `q` of 61 characters, `q=%25` (a percent sign) | 400; 400; 200 `[]` (percent is plain text, not a wildcard) |
| AC-F11-13 | `q` of 60 characters; no match | 200 `[]` |
| AC-F11-14 | 201 matching orders in the database | at most 200 returned, oldest first |
| AC-F11-15 | Customer session; no session — on the operator search | 403; 401 |
| AC-F11-16 | UI: customer presses the Ready chip | URL has `?status=READY`; only READY orders; empty chip text as specified |
| AC-F11-17 | UI: operator types "ali", picks status Ready, presses Search; then Clear | Matching cards only; Clear restores the default queue |

## 7. Test specification

Levels as in F-01 (unit / API with real Postgres / E2E). The test ID is at the start of each test name. Orders are inserted directly in the test database.

| Test ID | AC | Level | Precondition / input | Action | Expected |
|---|---|---|---|---|---|
| TEST-F11-01 | AC-F11-01 | API | alice orders PLACED, READY, CANCELLED | GET `?status=READY` as alice | only READY |
| TEST-F11-02 | AC-F11-02 | API | As 01 | GET `?status=PLACED,CANCELLED` | two orders, newest first |
| TEST-F11-03 | AC-F11-03 | API | As 01 | GET no status | all three |
| TEST-F11-04 | AC-F11-04 | API | alice and bob both with READY | GET `?status=READY` as alice | no bob order |
| TEST-F11-05 | AC-F11-05 | API | Seed | the four bad values | 400 each, field status |
| TEST-F11-06 | AC-F11-06 | API | alice with only PLACED orders | GET `?status=PICKED_UP` | 200 `[]` |
| TEST-F11-07 | AC-F11-07 | API | orders 12 (alice), 13 (bob), 120 (alice) by explicit ids | GET `?q=12` as staff | [#12] |
| TEST-F11-08 | AC-F11-08 | API | As 07 | GET `?q=%23120` | [#120] |
| TEST-F11-09 | AC-F11-09 | API | alice and bob orders | GET `?q=ALI`, `?q=ali` | alice's orders both times |
| TEST-F11-10 | AC-F11-10 | API | alice READY and PLACED, bob READY | GET `?q=ali&status=READY` | alice's READY only |
| TEST-F11-11 | AC-F11-11 | API | one order per status | GET `?status=PICKED_UP`; `REJECTED,CANCELLED`; `nonsense` | 1 order; 2 orders; 400 |
| TEST-F11-12 | AC-F11-12 | API | Seed | `?q=` (blank), `q` of 61 chars, `?q=%25` | 400, 400, `[]` |
| TEST-F11-13 | AC-F11-13 | API | Seed | `q` of 60 chars | 200 `[]` |
| TEST-F11-14 | AC-F11-14 | API | 201 PLACED orders (bulk insert) | GET `?q=ali` as staff | 200 orders, oldest first, the first 200 by age |
| TEST-F11-15 | AC-F11-15 | API | Seed | GET with `q` as alice; anonymous | 403; 401 |
| TEST-F11-16 | AC-F11-16 | E2E | alice orders in 3 statuses | Log in; press the Ready chip | URL and list as stated |
| TEST-F11-17 | AC-F11-17 | E2E | alice and bob orders | Staff: type "ali", Ready, Search; Clear | filtered cards; default queue back |

TDD: TEST-F11-01..15 are committed failing first (`docs/sprint_2/evidence/tdd/F-11-red.txt`), then the code (`F-11-green.txt`). Status for Deliverable 2: contract only (planned).

## 8. Definition of Done
See the Sprint 1 [`definition-of-done.md`](../../sprint_1/sprints/sprint-1/definition-of-done.md). F-11 specific: the customer-isolation test TEST-F11-04 runs in every test run (not skipped); root `npm run build` and all tests green before the PR.

## 9. Layers with no change
Schema (no migration), auth, menu, order placement, payment, cancel/reject and fulfilment actions: unchanged. Only the two list routes gain query filters. Sprint 1 and F-07 tests that expect `status=ACCEPTED`/`PICKED_UP` to be 400 on the operator queue (TEST-F04-03, TEST-F07-13) are updated in the F-11 code PR to the new rule (all 7 statuses valid; `nonsense` still 400).

## 10. Version history

| Date | Version | Change | Why |
|---|---|---|---|
| 25 Nov 2026 | 1 | First contract | Sprint 3 contract for Deliverable 2 part C (before implementation) |
