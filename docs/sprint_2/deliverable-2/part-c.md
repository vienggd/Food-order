# Deliverable 2, Part C: Sprint 3 contracts and working progress

Campus Café Pre-order. Issue #186. Author: ninja (NinjoMUDA). Reviewer: vieng (vienggd).
Tested version: `sprint2` at `d10fac1` (27 Nov 2026), the staging branch. Nothing from Sprint 3 is on `main` yet (`main` = `39bda5e`; live Cloud Run revision `food-order-00008-v6c` = Lab 6 release `163fdb7`).

Status words: **Planned** (in a plan) → **Specified** (contract merged) → **In progress** (some code) → **Implemented** (code merged in `sprint2`) → **Tested** (its test ran and passed; command and commit named) → **Accepted** (released on `main`). A test that does not exist is never counted.

## 1. Sprint 3 contracts

All four contracts were merged in `sprint2` before their code (contract before code). Each has the linked FR/BR/NFR, workflow, validation and permissions, UI, API, data, numbered AC, test specification (ID, level, setup, action, expected result) and Definition of Done.

| Feature | Contract file | Contract PR (merged 25 Nov) | Requirements | AC | Test IDs |
|---|---|---|---|---|---|
| F-09 Pickup slots + cut-off | `docs/sprint_2/sprints/F-09-pickup-slots.md` | #118 | FR-16, BR-22, BR-23, BR-24 | AC-F09-01..17 | TEST-F09-01..17 |
| F-10 Sales summary | `docs/sprint_2/sprints/F-10-sales-summary.md` | #106 | FR-17, BR-17, BR-18, BR-19 | AC-10.1..10.9 | TEST-10.1..10.9 |
| F-11 Order search / filter | `docs/sprint_2/sprints/F-11-search-filter.md` | #118 | FR-18, BR-25, BR-26, BR-27 | AC-F11-01..17 | TEST-F11-01..17 |
| F-12 Hardening: login rate limit, error states, accessibility | `docs/sprint_2/sprints/F-12-hardening.md` | #106 | NFR-08, NFR-09, BR-20, BR-21 | AC-12.1..12.8 and the NFR-09 checks | TEST-12.1..12.8 |

These four contracts cover every baseline requirement that is not in Sprint 1 or Sprint 2 (FR-16..FR-18, NFR-08, NFR-09, BR-17..BR-27). Revisions are kept in each contract's version history.

## 2. Status summary

| Feature | Status on `sprint2` `d10fac1` | AC implemented | AC with a passing test | AC without a test |
|---|---|---|---|---|
| F-09 | **Implemented, tested for the server rules**; UI picker implemented, UI tests missing | AC-F09-01..14; AC-F09-15..17 (minimal picker) | AC-F09-01..14 | AC-F09-15, -16, -17 |
| F-10 | **Specified** only. No code | none | none | AC-10.1..10.9 |
| F-11 | **Implemented and tested** (customer filter and operator search) | AC-F11-01..17 | AC-F11-01..17 | none |
| F-12 | **Specified** only. No code | none | none | AC-12.1..12.8, NFR-09 checks |

Meaningful Sprint 3 rules and workflows implemented and tested on a real PostgreSQL database: the **F-09 pickup-slot cut-off rule** (BR-23) with capacity (BR-24), and **F-11 order search and filter**.

## 3. Implemented progress with tests

Commands: `cd server; npx vitest run` (real PostgreSQL 16 in Docker, database `cafe_sprint2_test`), `cd client; npx vitest run`, and `npx playwright test` (phone 375 px and desktop 1280 px projects).
Result on `d10fac1`: server **177 passed**; client **8 passed**; Playwright **67 passed, 7 skipped, 0 failed**. The 7 skipped are Lab 6 regression tests that are written for only one of the two viewports (TEST-L6-123 and TEST-L6-129 are skipped on desktop; TEST-L6-122, -124, -125, -126, -132 are skipped on phone). None is a Sprint 3 test.

### 3.1 F-09 pickup slots and cut-off rule (owner ninja, Issue #146, PR #147)

What it does: a customer picks ASAP or a slot (today, Asia/Bangkok, 08:00 to 16:45, every 15 minutes). The server closes a slot 15 minutes before its start (10:14:59 is accepted, 10:15:00 gets 400) and allows at most 10 active orders per slot (the 11th gets 409; cancelled and rejected orders free their place). The capacity check runs inside the order transaction under a per-slot `pg_advisory_xact_lock`, so 20 parallel orders for one slot give exactly the free places. New column `orders.pickup_slot` (migration `20261126072525_add_order_pickup_slot`). `GET /api/slots` lists the slots with `closed` and `full` flags.

| Test IDs | Level | File | AC | What it proves | Result |
|---|---|---|---|---|---|
| TEST-F09-01..07 | API | `server/tests/pickup-slots.test.ts` | AC-F09-01..07 | slot saved on the order; cut-off at 10:14:59 / 10:15:00 / 10:15:01; invalid slots (not a slot start, seconds, before 08:00, 17:00, tomorrow, yesterday, text, number) → 400; first and last slot | Pass |
| TEST-F09-08..11 | API (DB) | same | AC-F09-08..11 | 11th order → 409 and nothing saved; cancel frees a place; 20 parallel orders on a slot with 9 → one 201 and nineteen 409; ASAP orders do not count | Pass |
| TEST-F09-12 | API | same | AC-F09-12 | slot list at clock 10:15:00 with closed and full flags | Pass |
| TEST-F09-13 | API | same | AC-F09-13 | operator 403, anonymous 401 on `GET /api/slots` | Pass |
| TEST-F09-14 | API | same | AC-F09-14 | order detail and operator queue show `pickupSlot` or null | Pass |

TDD evidence (files in `docs/sprint_2/evidence/tdd/`):
- RED commit `57cfe44` "test(F-09): [red] cut-off, capacity and slot list tests TEST-F09-01..14". `F-09-red.txt`: the test file cannot load because `src/orders/slots.ts` does not exist (0 tests ran).
- GREEN commit `eb5fcde` "feat(F-09): [green] pickup slots, cut-off, capacity, slot list and minimal picker; migration". `F-09-green.txt`: `pickup-slots.test.ts` 14 tests pass; server 131 passed; client 8 passed; Playwright 34 passed on that branch.
- Review: PR #147 first got CHANGES_REQUESTED from vieng (an E2E run had overwritten the Sprint 1 screenshots). Fixed on the same branch, re-reviewed, APPROVED, merged 26 Nov (merge commit `54f92ae`).

### 3.2 F-11 order search and filter (owner ninja, Issues #150 and #157, PRs #151 and #158)

What it does: a customer filters "My orders" by status (`GET /api/orders?status=READY` or a list; chips in the UI keep the status in the URL). An operator searches `GET /api/operator/orders?q=…&status=…`: `q` is an order number (exact; a leading `#` is ignored) or part of a customer name (ignoring case), combined with the status filter by AND; all 7 statuses are valid; at most 200 orders, oldest first; a blank `q` or one over 60 characters gets 400.

| Test IDs | Level | File | AC | What it proves | Result |
|---|---|---|---|---|---|
| TEST-F11-01..06 | API | `server/tests/order-filter.test.ts` | AC-F11-01..06 | customer status filter, lists, bad status → 400, own orders only | Pass |
| TEST-F11-07..15 | API | `server/tests/order-search.test.ts` | AC-F11-07..15 | order number exact (12 does not match 120); `#` ignored; name part, any case; q AND status; all 7 statuses; blank or long q → 400; `%` is plain text; 60 characters ok; 200 limit, oldest first; customer 403, anonymous 401 | Pass |
| TEST-F11-16 | E2E | `e2e/order-filter.spec.ts` | AC-F11-16 | Ready chip puts the status in the URL and shows only Ready orders | Pass (phone and desktop) |
| TEST-F11-17 | E2E | `e2e/order-search.spec.ts` | AC-F11-17 | operator searches "ali" + Ready, then a no-match text, then Clear restores the queue | Pass (phone and desktop) |

TDD evidence:
- Customer filter: RED `95c0801` (`F-11-red.txt`: 5 failed, 1 passed) → GREEN `74ad38c` (`F-11-green.txt`: server 138, client 8, Playwright 54).
- Operator search, server: RED `99cb5d5` (`F-11-operator-red.txt`: 8 failed) → GREEN `5a7eec6` (`F-11-operator-green.txt`: server 163).
- Operator search, UI: RED `c2b746d` (`F-11-operator-ui-red.txt`: 2 failed, search box not found) → GREEN `7ac4ec4` (`F-11-operator-ui-green.txt`: server 163, client 8, Playwright 58).
- **A defect found by a test:** TEST-F11-12 showed that Prisma `contains` passes `%` and `_` to SQL `LIKE` without escaping, so searching `%` returned every order. Fixed in `5a7eec6` by escaping `\`, `%` and `_` in `server/src/operator/routes.ts`.
- Two older tests were adjusted, not weakened: TEST-F04-03 and TEST-F07-13 used `status=PICKED_UP` as an invalid value; since F-11 all 7 statuses are valid, they now use `nonsense` and `placed` and still expect 400.
- Review: PR #151 and PR #158 approved by vieng and merged 26 Nov (`32c9d56`, `975c230`).

## 4. Known gaps in the implemented Sprint 3 work

| Gap | Detail |
|---|---|
| F-09 UI tests | TEST-F09-15..17 (E2E picker with a fixed server clock) are specified but **not written**. The picker is a plain `<select>` in the cart (`client/src/components/SlotPicker.tsx`). Closed and full slots are disabled there, but this is not tested. |
| Desktop operator board | ui-spec S8 shows a 4-column board on desktop; the shipped desktop view is the tabbed table (Lab 6 fix #132 made it a semantic table). Open design difference, to decide with vieng. |

## 5. Remaining work to 13 December

Rule from the handout: the product should be substantially complete by 29 Nov; exams are 1–11 Dec, so main workflows are not left for the last days. Owners and dates are **proposed by ninja and need vieng's confirmation** in the sprint2 chat. "Tested commit" is the last commit on which the passing part ran.

| Feature / AC or defect | Current status and tested commit | Missing AC, verification or fix | Owner | Target date | Depends on |
|---|---|---|---|---|---|
| F-09 AC-F09-15..17 (picker UI) | Picker implemented; AC-F09-01..14 pass on `d10fac1`; UI not tested | Write TEST-F09-15, -16, -17 (RED first); fix the picker if they fail: disabled closed and full slots, "Pickup 10:30" on detail, 409 text under the picker with cart kept | ninja | 29 Nov | server clock hook (exists) |
| F-10 Sales summary, AC-10.1..10.9 | Specified (contract #106). No code | Whole feature: `GET /api/operator/sales`, `/operator/sales` page, nav link, TEST-10.1..10.9 (RED first), evidence file | vieng (contract owner); ninja reviews | server 29 Nov, UI 30 Nov | F-07 `pickedUpAt` (done), F-08 `paymentStatus` (done) |
| F-12 login rate limit, AC-12.1..12.8, BR-20, BR-21, NFR-08 | Specified (contract #106). No code | Failure counter per email, 429 + `Retry-After`, UI lock message, TEST-12.1..12.8 | vieng | 30 Nov | none |
| F-12 error states and accessibility, NFR-09 | Specified. Loading, empty and error states already exist on the Sprint 1 and 2 screens and are tested by E2E | Playwright + axe check on login, menu, cart, orders, order detail, operator queue and menu admin (no serious or critical violations); keyboard check of the reject and cancel dialogs; record the results | ninja | 30 Nov | none |
| Desktop operator board (ui-spec S8) | Not built; the tabbed table ships | Decide: build the 4-column board, or revise ui-spec S8 with a recorded reason | ninja + vieng | decide 29 Nov; build, if chosen, 30 Nov | none |
| Lab 6 UAT re-test (9 fixes) | Fixes merged on `main` and `sprint2`; the re-test of the live revision is running | Record the outcome per fix in the change register | vieng (re-test), ninja (own fixes) | 29 Nov | live revision `food-order-00008-v6c` |
| Sprint 2 + 3 release to `main` and GCP deploy | `sprint2` is ahead of `main`; vieng holds `main` until the Lab 6 re-test is done | Release PR `sprint2` → `main`, tag, deploy through the Lab 5 pipeline, post-deploy check of login → order → accept → pay → pick up, and persistence | vieng decides; ninja reviews | 30 Nov | all rows above merged |
| Final traceability and regression | Part D matrix shows gaps for F-10, F-12, AC-F09-15..17 | Re-run the full suite on the release commit; update the matrix to Pass; NFR checks | ninja + vieng | 12 Dec | release done |
| Final video (≤ 4 min), UAT re-tests, final release | Not started | Record the video, final UAT, tag | both | 12–13 Dec | previous rows |

Exam period 1–11 Dec: only bounded fixes for defects found in UAT; no new feature work.
