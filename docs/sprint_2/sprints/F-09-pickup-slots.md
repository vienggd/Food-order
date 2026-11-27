# F-09 Pickup time slots and order cut-off — engineering contract (Sprint 3)

Sprint 3. Issue: to be created (contract). Owner: ninja. Reviewer: vieng. Status: **Specified** (contract committed before any F-09 code). The cut-off rule and a minimal slot picker are built for the Deliverable 2 candidate (N-13); the rest of the screen polish is Sprint 3.
Definition of Done: [`../../sprint_1/sprints/sprint-1/definition-of-done.md`](../../sprint_1/sprints/sprint-1/definition-of-done.md).

## 1. Feature and requirements

| Linked | Text (short) |
|---|---|
| FR-16 | A customer chooses a pickup slot instead of ASAP; orders for a slot close at a cut-off before it |
| BR-22 | Slots are 15 minutes apart, inside opening hours, today only (Asia/Bangkok) |
| BR-23 | Orders for a slot close 15 minutes before the slot starts |
| BR-24 | A slot holds at most 10 orders; cancelled and rejected orders do not count |
| BR-04, NFR-03 | (Sprint 1) server decides everything; shared error format |

Depends on: F-03 (place order), F-06 (cancelled/rejected orders free a place). **Coordination:** Lab 7 (change C-1, max 15 items) edits the place-order validation block in `server/src/orders/routes.ts`; F-09 adds its own checks after that block and does not edit it.

## 2. Behaviour

### Fixed values (constants in one file `server/src/orders/slots.ts`)
| Name | Value |
|---|---|
| Time zone | Asia/Bangkok (UTC+7, no daylight saving) |
| Opening hours | 08:00 to 17:00 every day (assumption AS-04, to confirm with the café) |
| Slot starts | 08:00, 08:15, 08:30 … 16:45 (36 slots; the last one starts 16:45 and ends at closing 17:00) |
| Cut-off | slot start minus 15 minutes (slot 08:30 closes at 08:15:00) |
| Capacity | 10 orders per slot |

### Workflow
1. Customer opens the cart; the page calls `GET /api/slots`; the picker lists today's slots, each open or closed (past cut-off) or full, with **ASAP** still available as the default choice.
2. Customer picks a slot and presses **Place order** → `POST /api/orders` with the usual body plus `pickupSlot` (ISO 8601 UTC, the exact slot start, e.g. `2026-11-28T03:30:00.000Z` = 10:30 Bangkok).
3. Server (after the Sprint 1 and Lab 7 checks): checks the slot is valid and still open, then in **one transaction** takes a per-slot lock (`pg_advisory_xact_lock` on the slot time), counts the slot's active orders and inserts the order only if the count is below 10. The lock makes 20 parallel orders for the last place give exactly one success.
4. Order JSON shows `pickupSlot` (ISO 8601 or `null` for ASAP); the order detail and the operator queue show "Pickup 10:30" or "Pickup ASAP".

### Cut-off boundaries (exact, server clock; tests replace the clock)
For a slot starting at S: the order is accepted while `now < S − 15 min`.
| Time of the request (S = 10:30:00) | Result |
|---|---|
| 10:14:59 (cut-off minus 1 s) | accepted |
| 10:15:00 (exactly the cut-off) | 400 VALIDATION_ERROR, `details.field = "pickupSlot"`, "This pickup slot is closed. Pick a later slot." |
| 10:15:01 and any later time | 400 same |
| 10:29:59 and after the start | 400 same |

### Rules, validation, boundaries
- `pickupSlot` is optional; missing or `null` means ASAP (all Sprint 1 requests keep working).
- Any of these → 400 VALIDATION_ERROR with `details.field = "pickupSlot"`: not a string or not a valid date; not exactly a slot start (e.g. 10:20, or seconds not 00); before 08:00 or at/after 17:00 Bangkok time; a different day than today; at or after its cut-off (message above). A request for the first slot of the day (08:00) at 07:45:00 or later is closed the same way; at 07:44:59 it is accepted.
- Capacity: the 11th order for a slot → 409 INVALID_STATE "This pickup slot is full. Pick another slot." with `details: { pickupSlot }`. Orders in CANCELLED or REJECTED do not count, so a cancelled order frees its place. ASAP orders (`null`) never count.
- A full or closed slot changes nothing: no order and no lines are saved.
- Validation order: Sprint 1/Lab 7 body checks (400) → slot format and cut-off (400) → capacity (409).
- Operators see the slot in the queue and can accept any order regardless of the cut-off (the cut-off only closes new orders).
- `GET /api/slots` is read-only and the same for every logged-in customer; the server never trusts the client's idea of "now".

### Permissions
| Endpoint | Anonymous | CUSTOMER | OPERATOR |
|---|---|---|---|
| `GET /api/slots` | 401 | ✔ | 403 |
| `POST /api/orders` with `pickupSlot` | 401 | ✔ | 403 (as Sprint 1) |

## 3. UI
Per the Sprint 1 cart screen plus a **Pickup time** control (minimal in N-13): a list or select with "ASAP" first, then one row per slot with the time ("10:30"), a closed slot disabled with "Closed", a full slot disabled with "Full". Server errors (400 slot closed, 409 slot full) show under the control and reload the slot list; the cart keeps its lines. Full design polish is later work.

## 4. API

| Method + path | Request | Success | Errors |
|---|---|---|---|
| `GET /api/slots` | cookie `sid` (CUSTOMER) | 200 `[ { start, state: "open" \| "closed" \| "full", remaining } ]` for today's 36 slots in time order; `remaining` = 10 minus active orders (0 when full or closed) | 401 · 403 |
| `POST /api/orders` | usual body + optional `pickupSlot` | 201 order with `pickupSlot` | 400 VALIDATION_ERROR · 409 INVALID_STATE (slot full) · 401 · 403 |

## 5. Data
New migration `add_order_pickup_slot`: `orders.pickup_slot TIMESTAMP NULL` and an index `(pickup_slot)`. Existing rows stay `NULL` (ASAP). Money and other fields unchanged.

## 6. Acceptance criteria

| ID | Given / when | Then |
|---|---|---|
| AC-F09-01 | Clock 10:00:00, slot 10:30; customer orders with that slot | 201; the order has `pickupSlot` 10:30 |
| AC-F09-02 | Clock 10:14:59, slot 10:30 | 201 (one second before the cut-off) |
| AC-F09-03 | Clock 10:15:00, slot 10:30 | 400, `details.field = "pickupSlot"`, slot-closed text; nothing saved |
| AC-F09-04 | Clock 10:15:01 and 10:30:01, slot 10:30 | 400 each |
| AC-F09-05 | Slot 10:20 (not a slot start); 10:30:30 (seconds); 07:45 (before opening); 17:00 and 17:15 (at/after closing); tomorrow 10:30; yesterday; `"abc"`; `123` | 400 each; nothing saved |
| AC-F09-06 | Slot 08:00 with clock 07:44:59 and 07:45:00 | 201; 400 |
| AC-F09-07 | Slot 16:45 with clock 16:29:59 | 201 (last slot) |
| AC-F09-08 | A slot already holding 10 active orders; an 11th order | 409 INVALID_STATE "This pickup slot is full…"; nothing saved; count stays 10 |
| AC-F09-09 | A full slot, then one of its orders is cancelled or rejected | a new order for the slot gets 201 |
| AC-F09-10 | A slot with 9 active orders; 20 orders for it at the same time | exactly one 201 and nineteen 409; count is 10 |
| AC-F09-11 | An order without `pickupSlot` and one with `null` | 201 each, `pickupSlot: null`; they do not count toward any slot |
| AC-F09-12 | `GET /api/slots` at clock 10:15:00 with slot 10:30 holding 10 orders and slot 10:45 holding 3 | 36 slots in order; 10:15 and earlier closed; 10:30 closed (past cut-off wins over full); 10:45 open with `remaining` 7; a later full slot shows `full` |
| AC-F09-13 | Operator session; no session — on `GET /api/slots` | 403; 401 |
| AC-F09-14 | The order detail and the operator queue for a slot order and an ASAP order | show `pickupSlot` / null |
| AC-F09-15 | UI: customer opens the cart | picker lists ASAP and the slots; closed and full ones are disabled |
| AC-F09-16 | UI: customer picks 10:30 and places the order | Order detail shows "Pickup 10:30" |
| AC-F09-17 | UI: slot filled by someone else after the page loaded; customer places the order | The 409 text under the picker, slots reload, cart kept |

## 7. Test specification

Levels as in F-01 (unit / API with real Postgres / E2E). The test ID is at the start of each test name. API tests replace the server clock with a fixed time (`createApp({ now })`); E2E tests use slots far enough ahead of the real clock or a fixed server clock set by an environment variable for the test run only.

| Test ID | AC | Level | Precondition / input | Action | Expected |
|---|---|---|---|---|---|
| TEST-F09-01 | AC-F09-01 | API | Clock 10:00:00, alice, valid lines | POST order with slot 10:30 | 201, `pickupSlot` 10:30 |
| TEST-F09-02 | AC-F09-02 | API | Clock 10:14:59 | POST order slot 10:30 | 201 |
| TEST-F09-03 | AC-F09-03 | API | Clock 10:15:00 | POST order slot 10:30 | 400 field pickupSlot; no order row |
| TEST-F09-04 | AC-F09-04 | API | Clock 10:15:01, then 10:30:01 | POST order slot 10:30 | 400, 400 |
| TEST-F09-05 | AC-F09-05 | API | Clock 07:00 | the 9 invalid values of the AC | 400 each; no order row |
| TEST-F09-06 | AC-F09-06 | API | Clock 07:44:59, then 07:45:00 | POST slot 08:00 | 201; 400 |
| TEST-F09-07 | AC-F09-07 | API | Clock 16:29:59 | POST slot 16:45 | 201 |
| TEST-F09-08 | AC-F09-08 | API | 10 PLACED orders in slot 10:30 | POST an 11th | 409; count 10 |
| TEST-F09-09 | AC-F09-09 | API | 10 orders; set one to CANCELLED, another test: REJECTED | POST an order | 201 |
| TEST-F09-10 | AC-F09-10 | API | 9 orders in the slot | 20 POST in parallel (`Promise.all`) | one 201, nineteen 409; count 10 |
| TEST-F09-11 | AC-F09-11 | API | Slot 10:30 holding 10 orders | POST without `pickupSlot`; POST with `null` | 201, 201 with null; slot count still 10 |
| TEST-F09-12 | AC-F09-12 | API | Clock 10:15:00; slot data as in the AC | GET slots | as in the AC |
| TEST-F09-13 | AC-F09-13 | API | Seed | GET slots as staff; anonymous | 403; 401 |
| TEST-F09-14 | AC-F09-14 | API | Slot order and ASAP order | GET order, GET queue | `pickupSlot` value / null |
| TEST-F09-15 | AC-F09-15 | E2E | Fixed server clock 10:00 | Alice opens the cart | ASAP + slots; 10:00..10:15 closed |
| TEST-F09-16 | AC-F09-16 | E2E | As 15 | Pick 10:30, Place order | Order detail "Pickup 10:30" |
| TEST-F09-17 | AC-F09-17 | E2E | As 15; slot 10:30 then filled to 10 orders in the database | Place order for 10:30 | 409 text under the picker; cart kept |

TDD: TEST-F09-01..13 are committed failing first (`docs/sprint_2/evidence/tdd/F-09-red.txt`), then the code (`F-09-green.txt`). N-13 builds the cut-off rule (TEST-F09-01..07, 11) and the minimal picker first; capacity (08..10, 12) follows if time allows and is marked planned until run.

## 8. Definition of Done
See the Sprint 1 [`definition-of-done.md`](../../sprint_1/sprints/sprint-1/definition-of-done.md). F-09 specific: the boundary tests TEST-F09-02, -03 and -06 run in every test run (not skipped); root `npm run build` and all tests green before the PR.

## 9. Layers with no change
Auth, menu, payment, cancel/reject, fulfilment: unchanged. The Lab 7 place-order validation block is not edited. Order total, lines and BR-01..BR-05 are unchanged.

## 10. Version history

| Date | Version | Change | Why |
|---|---|---|---|
| 25 Nov 2026 | 1 | First contract | Sprint 3 contract for Deliverable 2 part C (before implementation) |
