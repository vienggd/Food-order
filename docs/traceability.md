# Traceability matrix — Campus Café Pre-order

> **Living document.** Version 3 — 27 Nov 2026 (Deliverable 2, part D, Issue #186). Features: [`features.md`](features.md). Requirements: [`srs.md`](srs.md). System design: [`system-sds.md`](system-sds.md). The Sprint 1 copy is frozen in `sprint_1/`.

How to read a row: requirement → feature → sprint → acceptance criteria (from the feature contract) → planned test IDs (from the contract's test specification) → actual test file(s) → result and version.

**Version tested.** Every Result in sections 1–3 and 5 comes from one run on `sprint2` at commit `d10fac1` (27 Nov 2026): `npm run build` ok; server `npx vitest run` **177 passed**; client `npx vitest run` **8 passed**; `npx playwright test` **67 passed, 7 skipped, 0 failed** (phone and desktop). Test IDs were matched to the test names in the run output (`TEST-…` is part of every test title), so a row says Pass only when a test with that ID ran and passed. The 7 skipped are Lab 6 tests written for one viewport only; no row depends on a skipped test. Sprint 1 rows were first run on `f3acfc9` (tag `v0.1.0-sprint1`, 6 Nov) and pass again on `d10fac1`. Nothing from Sprint 2 or Sprint 3 is released on `main` yet, so "Pass" means passes on the staging branch `sprint2`.

**Not covered yet (shown honestly):** FR-17 and BR-17..19 (F-10), NFR-08, BR-20 and BR-21 (F-12), and NFR-09 have no code and no test. FR-16 is missing TEST-F09-15..17. See section 4.

## 1. Business rules

| Req | Rule (short) | Feature | Sprint | AC | Planned tests | Actual file(s) | Result and version |
|---|---|---|---|---|---|---|---|
| BR-01 | Quantity per line is a whole number 1–10 | F-03 | 1 | AC-F03-02, AC-F03-12 | TEST-F03-02, -03 (API); -18 (unit) | `orders.test.ts`, `cart.test.ts` | Pass on `sprint2` `d10fac1` |
| BR-02 | 1–20 lines, no duplicate menu item | F-03 | 1 | AC-F03-03, AC-F03-12 | TEST-F03-04, -05, -06, -07 (API); -17, -18, -23 (unit) | `orders.test.ts`, `cart.test.ts` | Pass on `sprint2` `d10fac1` |
| BR-03 | Every item exists and is available, else nothing is saved | F-02, F-03 | 1 | AC-F02-02, AC-F02-06, AC-F03-04, AC-F03-11 | TEST-F02-02 (API), -08 (E2E); TEST-F03-08, -09 (API), -20 (E2E) | `menu.test.ts`, `menu.spec.ts`, `orders.test.ts`, `orders.spec.ts` | Pass on `sprint2` `d10fac1` |
| BR-04 | Server calculates the total; price/total in request → 400 | F-03 | 1 | AC-F03-01, AC-F03-05 | TEST-F03-01, -10 (API) | `orders.test.ts` | Pass on `sprint2` `d10fac1` |
| BR-05 | Order line keeps item name and unit price at order time | F-03 | 1 | AC-F03-06 | TEST-F03-11 (API) | `orders.test.ts` | Pass on `sprint2` `d10fac1` |
| BR-06 | Only a PLACED order can be accepted, else 409 | F-04 | 1 | AC-F04-05, AC-F04-06, AC-F04-10 | TEST-F04-05, -06 (API); -10 (unit) | `operator.test.ts`, `transitions.test.ts` | Pass on `sprint2` `d10fac1` |
| BR-07 | Two operators accept at once → one 200, one 409 | F-04 | 1 | AC-F04-07, AC-F04-13 | TEST-F04-07 (API, 20 parallel); -13 (E2E) | `operator.test.ts`, `queue.spec.ts` | Pass on `sprint2` `d10fac1` |
| BR-08 | Menu name 1–60 characters, unique ignoring case | F-05 | 2 | AC-5.3, AC-5.4, AC-5.5, AC-5.17 | TEST-5.3, -5.4, -5.5 (API); -5.17 (E2E) | `menu-management.test.ts`, `menu-admin.spec.ts` | Pass on `sprint2` `d10fac1` |
| BR-09 | Menu price whole satang 1–100000 | F-05 | 2 | AC-5.6, AC-5.7 | TEST-5.6, -5.7 (API) | `menu-management.test.ts` | Pass on `sprint2` `d10fac1` |
| BR-10 | Sold out / price edit affects new orders only | F-05 | 2 | AC-5.8, AC-5.9, AC-5.10 | TEST-5.8, -5.9, -5.10 (API) | `menu-management.test.ts` | Pass on `sprint2` `d10fac1` |
| BR-11 | Customer cancels own order only while PLACED | F-06 | 2 | AC-F06-01..06 | TEST-F06-01..06 (API) | `cancel-reject.test.ts` | Pass on `sprint2` `d10fac1` |
| BR-12 | Reject only PLACED, reason 3–200, accept/reject race | F-06 | 2 | AC-F06-07..14 | TEST-F06-07..14 (API) | `cancel-reject.test.ts` | Pass on `sprint2` `d10fac1` |
| BR-13 | One step at a time ACCEPTED→PREPARING→READY→PICKED_UP | F-07 | 2 | AC-F07-01..15 | TEST-F07-01..15 (API, unit) | `fulfilment.test.ts` | Pass on `sprint2` `d10fac1` |
| BR-14 | Pay own order once; not CANCELLED/REJECTED/PICKED_UP | F-08 | 2 | AC-8.1..AC-8.10, AC-8.16 | TEST-8.1..8.10 (API); -8.16 (E2E) | `payments.test.ts`, `payment.spec.ts` | Pass on `sprint2` `d10fac1` |
| BR-15 | PICKED_UP needs payment PAID | F-08 (in F-07 route) | 2 | AC-8.14, AC-8.15, AC-8.17 | TEST-8.14, -8.15 (API); -8.17 (E2E) | `payments.test.ts`, `payment.spec.ts` | Pass on `sprint2` `d10fac1` |
| BR-16 | Cancel/reject of a PAID order → REFUNDED | F-08 (in F-06 routes) | 2 | AC-8.11, AC-8.12, AC-8.13 | TEST-8.11..8.13 (API) | `payments.test.ts` | Pass on `sprint2` `d10fac1` |
| BR-17 | Only PICKED_UP and PAID orders count as sales | F-10 | 3 | AC-10.1, AC-10.2 | TEST-10.1, -10.2 (API) | — | Not implemented. TEST-10.x not written (F-10) |
| BR-18 | Sales days are Asia/Bangkok days | F-10 | 3 | AC-10.3 | TEST-10.3 (API) | — | Not implemented. TEST-10.x not written (F-10) |
| BR-19 | Top 3 items by quantity, ties by name | F-10 | 3 | AC-10.4 | TEST-10.4 (API) | — | Not implemented. TEST-10.x not written (F-10) |
| BR-20 | Successful login clears failed count | F-12 | 3 | AC-12.5 | TEST-12.5 (API) | — | Not implemented. TEST-12.x not written (F-12) |
| BR-21 | Failed logins counted per email | F-12 | 3 | AC-12.3, AC-12.7 | TEST-12.3, -12.7 (API) | — | Not implemented. TEST-12.x not written (F-12) |
| BR-22 | Pickup slots 15 min apart in 08:00–16:45 (today, Bangkok) | F-09 | 3 | AC-F09-01, -05, -07, -12 | TEST-F09-01, -05, -07, -12 (API) | `pickup-slots.test.ts` | Pass on `sprint2` `d10fac1` |
| BR-23 | Orders for a pickup slot close 15 min before start | F-09 | 3 | AC-F09-02, -03, -04, -06 | TEST-F09-02, -03, -04, -06 (API) | `pickup-slots.test.ts` | Pass on `sprint2` `d10fac1` |
| BR-24 | Slot capacity 10; cancelled/rejected free space; ASAP excluded | F-09 | 3 | AC-F09-08..11 | TEST-F09-08..11 (API) | `pickup-slots.test.ts` | Pass on `sprint2` `d10fac1` |
| BR-25 | A customer only ever gets their own orders, filtered or not | F-11 | 3 | AC-F11-04 | TEST-F11-04 (API) | `order-filter.test.ts` | Pass on `sprint2` `d10fac1` |
| BR-26 | Operator search `q` matches the order number exactly, or part of the customer name, ignoring case | F-11 | 3 | AC-F11-07..09, AC-F11-12, AC-F11-14 | TEST-F11-07, -08, -09, -12, -14 (API); -17 (E2E) | `order-search.test.ts`, `order-search.spec.ts` | Pass on `sprint2` `d10fac1` |
| BR-27 | Filters combine with AND; no match is an empty list, not an error | F-11 | 3 | AC-F11-06, AC-F11-10, AC-F11-13 | TEST-F11-06, -10, -13 (API) | `order-filter.test.ts`, `order-search.test.ts` | Pass on `sprint2` `d10fac1` |

## 2. Functional requirements

IDs agreed with the SRS author in chat on 6 Nov 2026.

| Req | Requirement (short) | Feature | Sprint | AC | Planned tests | Actual file(s) | Result and version |
|---|---|---|---|---|---|---|---|
| FR-01 | Log in with email + password | F-01 | 1 | AC-F01-01..05, AC-F01-12, AC-F01-13 | TEST-F01-01..05 (API); -12, -13 (E2E) | `auth.test.ts`, `auth.spec.ts` | Pass on `sprint2` `d10fac1` |
| FR-02 | Log out | F-01 | 1 | AC-F01-09, AC-F01-12 | TEST-F01-09 (API); -12 (E2E) | `auth.test.ts`, `auth.spec.ts` | Pass on `sprint2` `d10fac1` |
| FR-03 | Show current user and send to role home | F-01 | 1 | AC-F01-06, AC-F01-07, AC-F01-12, AC-F01-14 | TEST-F01-06, -07 (API); -12, -14 (E2E) | `auth.test.ts`, `auth.spec.ts` | Pass on `sprint2` `d10fac1` |
| FR-04 | Server checks role on every protected endpoint | F-01 (used by F-02..F-04) | 1 | AC-F01-10, AC-F01-14, AC-F02-03, AC-F02-04, AC-F03-09, AC-F04-09 | TEST-F01-10 (API), -14 (E2E); TEST-F02-03..05; TEST-F03-15, -16; TEST-F04-09 (API) | `auth.test.ts`, `auth.spec.ts`, `menu.test.ts`, `orders.test.ts`, `operator.test.ts` | Pass on `sprint2` `d10fac1` |
| FR-05 | View menu with price and availability | F-02 | 1 | AC-F02-01, -02, -05, -06, -07 | TEST-F02-01, -02, -06 (API); -07 (unit); -08, -09 (E2E) | `menu.test.ts`, `money.test.ts`, `menu.spec.ts` | Pass on `sprint2` `d10fac1` |
| FR-06 | Place an order | F-03 | 1 | AC-F03-01..05, AC-F03-10..12 | TEST-F03-01..10 (API); -17, -18 (unit); -19, -20 (E2E) | `orders.test.ts`, `cart.test.ts`, `orders.spec.ts` | Pass on `sprint2` `d10fac1` |
| FR-07 | List my orders | F-03 | 1 | AC-F03-07, AC-F03-10 | TEST-F03-12 (API); -19 (E2E) | `orders.test.ts`, `orders.spec.ts` | Pass on `sprint2` `d10fac1` |
| FR-08 | View my order detail | F-03 | 1 | AC-F03-06, AC-F03-08, AC-F03-10 | TEST-F03-11, -13, -14, -21, -22 (API); -19 (E2E) | `orders.test.ts`, `orders.spec.ts` | Pass on `sprint2` `d10fac1` |
| FR-09 | Operator queue of PLACED orders, oldest first | F-04 | 1 | AC-F04-01..03, AC-F04-11 | TEST-F04-01..03 (API); -11 (E2E) | `operator.test.ts`, `queue.spec.ts` | Pass on `sprint2` `d10fac1` |
| FR-10 | Accept an order | F-04 | 1 | AC-F04-04..08, AC-F04-12, AC-F04-13 | TEST-F04-04..08, -14 (API); -12, -13 (E2E) | `operator.test.ts`, `queue.spec.ts` | Pass on `sprint2` `d10fac1` |
| FR-11 | Menu management | F-05 | 2 | AC-5.1..AC-5.17 | TEST-5.1..5.14 (API); -5.15..5.17 (E2E) | `menu-management.test.ts`, `menu-admin.spec.ts` | Pass on `sprint2` `d10fac1` |
| FR-12 | Customer cancel | F-06 | 2 | AC-F06-01..06, AC-F06-16..18 | TEST-F06-01..06 (API); -16 (unit); -17, -18 (E2E) | `cancel-reject.test.ts`, `cancel-reject.spec.ts` | Pass on `sprint2` `d10fac1` |
| FR-13 | Operator reject with reason | F-06 | 2 | AC-F06-07..15, AC-F06-19..21 | TEST-F06-07..15 (API); -19..21 (E2E) | `cancel-reject.test.ts`, `cancel-reject.spec.ts` | Pass on `sprint2` `d10fac1` |
| FR-14 | Fulfilment PREPARING → READY → PICKED_UP | F-07 | 2 | AC-F07-01..19 | TEST-F07-01..15 (API, unit); -16..19 (E2E) | `fulfilment.test.ts`, `fulfilment.spec.ts` | Pass on `sprint2` `d10fac1` |
| FR-15 | Simulated payment | F-08 | 2 | AC-8.1..AC-8.18 | TEST-8.1..8.18 | `payments.test.ts`, `payment.spec.ts` | Pass on `sprint2` `d10fac1` |
| FR-16 | Pickup time slots | F-09 | 3 | AC-F09-01..17 | TEST-F09-01..14 (API); -15..17 (E2E) | `pickup-slots.test.ts` | Partly: TEST-F09-01..14 Pass on `sprint2` `d10fac1`; TEST-F09-15..17 (E2E) not written |
| FR-17 | Sales summary | F-10 | 3 | AC-10.1..10.9 | TEST-10.1..10.8 (API); -10.9 (E2E) | — | Not implemented. TEST-10.x not written (F-10) |
| FR-18 | Order search / filter | F-11 | 3 | AC-F11-01..17 | TEST-F11-01..15 (API); -16, -17 (E2E) | `order-filter.test.ts`, `order-search.test.ts`, `order-filter.spec.ts`, `order-search.spec.ts` | Pass on `sprint2` `d10fac1` |

## 3. Non-functional requirements

| Req | Requirement (short) | Feature | Sprint | AC | Planned verification | Actual file / measurement | Result and version |
|---|---|---|---|---|---|---|---|
| NFR-01 | bcrypt passwords, httpOnly session cookie, 8 h expiry | F-01 | 1 | AC-F01-01, -08, -09, -11; setup AC-1.2 | TEST-F01-01, -08, -09 (API), -11 (unit); seed.test.ts AC-1.2 (bcrypt hash) | `auth.test.ts`, `seed.test.ts` | Pass on `sprint2` `d10fac1` |
| NFR-02 | Role and prices only from server; no stack traces | F-01, F-03 | 1 | AC-F01-04, -06; AC-F03-05, -08; setup AC-1.5 | TEST-F01-04, -06; TEST-F03-10, -14 (API); app.test.ts "no stack trace" | `auth.test.ts`, `orders.test.ts`, `app.test.ts` | Pass on `sprint2` `d10fac1` |
| NFR-03 | One error format, codes 400/401/403/404/409 | F-01..F-04 | 1 | setup AC-1.4, AC-1.5; every error AC | app.test.ts (AC-1.5); every API test asserts `error.code` | `app.test.ts` and the `error.code` assertion in every API test file | Pass on `sprint2` `d10fac1` |
| NFR-04 | One transaction per order; safe concurrent accept | F-03, F-04 | 1 | AC-F03-04, AC-F04-07 | TEST-F03-03..10 (0 orders and 0 lines after rejection); TEST-F04-07 (20 parallel accepts) | `orders.test.ts`, `operator.test.ts` | Pass on `sprint2` `d10fac1` |
| NFR-05 | Automated unit, API and end-to-end tests; tests first | F-01..F-04 | 1 | all Sprint 1 AC | All tests above; red/green output in `docs/sprint_1/evidence/tdd/` (F-01..F-04) | all test files; RED/GREEN output in `docs/sprint_1/evidence/tdd/` and `docs/sprint_2/evidence/tdd/` | Pass on `sprint2` `d10fac1` |
| NFR-06 | Loading, empty and error states; phone and desktop | F-01..F-04 | 1 | AC-F01-13, AC-F02-07, AC-F03-10, -11, -13, AC-F04-11 | E2E on phone 375 px and desktop 1280 px (22 runs; TEST-F03-24 phone tab order); screenshots in `docs/sprint_1/evidence/screenshots/` | `orders.spec.ts` | Pass for Sprint 1 to 3 screens that exist (E2E phone 375 px and desktop 1280 px); axe and keyboard part belongs to NFR-09 (`d10fac1`) |
| NFR-07 | One container, settings from env, no secrets in Git | all | 1 | — | Manual: `server/.env.example` placeholders only; `git grep` for the seed password: no match (6 Nov 2026). Container in Lab 5 | `server/.env.example`, `git grep` | Manual check, pass (6 Nov 2026; re-checked 27 Nov: `git grep` for the seed password finds no match) |
| NFR-08 | Login rate limit | F-12 | 3 | AC-12.1..12.8 | TEST-12.1..12.7 (API); -12.8 (E2E) | — | Not implemented. TEST-12.1..12.7 not written (F-12) |
| NFR-09 | Accessibility | F-12 | 3 | F-12 contract (no critical/serious axe issues; keyboard navigation) | Playwright + axe check; manual keyboard check | — | Not implemented. axe + keyboard check not written (F-12) |

## 4. Coverage check and gaps

- Every FR/BR/NFR maps to a feature: **yes** (FR-01..FR-18, BR-01..BR-27, NFR-01..NFR-09).
- Acceptance criteria in the feature contracts: **173** (Sprint 1: 47; Sprint 2: F-05 17, F-06 21, F-07 19, F-08 18; Sprint 3: F-09 17, F-10 9, F-11 17, F-12 8). **153 are implemented and their tests passed** on `d10fac1`. **20 are not verified**: AC-F09-15..17 (picker E2E tests not written; the picker code exists), AC-10.1..10.9 (F-10 not implemented), AC-12.1..12.8 (F-12 not implemented). The per-AC table is in section 5.
- Distinct test IDs that exist in the code and passed on `d10fac1`: 177, including 10 Lab 5/6 regression IDs (`TEST-L5-7`, `TEST-L6-121..132`) that belong to the Lab 6 register, not to this matrix.
- Planned final verification: TEST-F09-15..17, TEST-10.1..10.9, TEST-12.1..12.8, the NFR-09 axe and keyboard check, and a full re-run on the release commit (dates in `docs/sprint_2/deliverable-2/part-c.md`, section 5).
- Only manual check: NFR-07 (secrets and configuration).
- BR-25..BR-27 (F-11) were missing from the SRS and from this matrix before version 3. This audit found them and they are added.

| Test files | Level | IDs |
|---|---|---|
| `server/tests/auth.test.ts` | API (+ unit TEST-F01-11) | TEST-F01-01..11 |
| `server/tests/menu.test.ts` | API | TEST-F02-01..06 |
| `server/tests/orders.test.ts` | API | TEST-F03-01..16, -21, -22 |
| `server/tests/operator.test.ts`, `transitions.test.ts` | API, unit | TEST-F04-01..09, -14; -10; TEST-F06-16 |
| `server/tests/app.test.ts`, `seed.test.ts`, `cloud.test.ts` | API, DB | setup AC-1.2..1.5 (#1); cloud configuration (Lab 5) |
| `client/src/lib/money.test.ts`, `cart.test.ts`, `price.test.ts` | unit | TEST-F02-07, TEST-F03-17, -18, -23; price conversion for the F-05 form |
| `server/tests/menu-management.test.ts` | API | TEST-5.1..5.14 |
| `server/tests/cancel-reject.test.ts` | API | TEST-F06-01..15 |
| `server/tests/fulfilment.test.ts` | API | TEST-F07-01..15 |
| `server/tests/payments.test.ts` | API | TEST-8.1..8.15 |
| `server/tests/pickup-slots.test.ts` | API | TEST-F09-01..14 |
| `server/tests/order-filter.test.ts`, `order-search.test.ts` | API | TEST-F11-01..06; TEST-F11-07..15 |
| `e2e/auth.spec.ts`, `menu.spec.ts`, `orders.spec.ts`, `queue.spec.ts` | E2E | TEST-F01-12..14, TEST-F02-08..09, TEST-F03-19..20, -24, TEST-F04-11..13 |
| `e2e/menu-admin.spec.ts`, `payment.spec.ts` | E2E | TEST-5.15..5.17; TEST-8.16..8.18 |
| `e2e/cancel-reject.spec.ts`, `fulfilment.spec.ts` | E2E | TEST-F06-17..21; TEST-F07-16..19 |
| `e2e/order-filter.spec.ts`, `order-search.spec.ts` | E2E | TEST-F11-16; TEST-F11-17 |
| `e2e/lab6-fixes.spec.ts` | E2E | TEST-L6-121..132 (Lab 6 regressions) |

## 5. Acceptance criteria status (every AC)

"Implemented" means the behaviour exists in the code on `sprint2` `d10fac1`. "Verification" says whether the planned test ran. Result is Pass only if every listed test ran and passed.

### F-01 (`docs/sprint_1/sprints/sprint-1\F-01-auth.md`)

| AC | Test IDs | Level | Implemented | Verification | Result |
|---|---|---|---|---|---|
| AC-F01-01 | TEST-F01-01 | API | Yes | Ran | Pass |
| AC-F01-02 | TEST-F01-02 | API | Yes | Ran | Pass |
| AC-F01-03 | TEST-F01-03 | API | Yes | Ran | Pass |
| AC-F01-04 | TEST-F01-04 | API | Yes | Ran | Pass |
| AC-F01-05 | TEST-F01-05 | API | Yes | Ran | Pass |
| AC-F01-06 | TEST-F01-06 | API | Yes | Ran | Pass |
| AC-F01-07 | TEST-F01-07 | API | Yes | Ran | Pass |
| AC-F01-08 | TEST-F01-08 | API | Yes | Ran | Pass |
| AC-F01-09 | TEST-F01-09 | API | Yes | Ran | Pass |
| AC-F01-10 | TEST-F01-10 | API | Yes | Ran | Pass |
| AC-F01-11 | TEST-F01-11 | unit | Yes | Ran | Pass |
| AC-F01-12 | TEST-F01-12 | E2E | Yes | Ran | Pass |
| AC-F01-13 | TEST-F01-13 | E2E | Yes | Ran | Pass |
| AC-F01-14 | TEST-F01-14 | E2E | Yes | Ran | Pass |

### F-02 (`docs/sprint_1/sprints/sprint-1\F-02-menu.md`)

| AC | Test IDs | Level | Implemented | Verification | Result |
|---|---|---|---|---|---|
| AC-F02-01 | TEST-F02-01 | API | Yes | Ran | Pass |
| AC-F02-02 | TEST-F02-02 | API | Yes | Ran | Pass |
| AC-F02-03 | TEST-F02-03, TEST-F02-04 | API | Yes | Ran | Pass |
| AC-F02-04 | TEST-F02-05 | API | Yes | Ran | Pass |
| AC-F02-05 | TEST-F02-06 | API | Yes | Ran | Pass |
| AC-F02-06 | TEST-F02-07, TEST-F02-08 | E2E,unit | Yes | Ran | Pass |
| AC-F02-07 | TEST-F02-09 | E2E | Yes | Ran | Pass |

### F-03 (`docs/sprint_1/sprints/sprint-1\F-03-orders.md`)

| AC | Test IDs | Level | Implemented | Verification | Result |
|---|---|---|---|---|---|
| AC-F03-01 | TEST-F03-01, TEST-F03-17 | API,unit | Yes | Ran | Pass |
| AC-F03-02 | TEST-F03-02, TEST-F03-03, TEST-F03-22 | API | Yes | Ran | Pass |
| AC-F03-03 | TEST-F03-04, TEST-F03-05, TEST-F03-06, TEST-F03-07 | API | Yes | Ran | Pass |
| AC-F03-04 | TEST-F03-08, TEST-F03-09 | API | Yes | Ran | Pass |
| AC-F03-05 | TEST-F03-10 | API | Yes | Ran | Pass |
| AC-F03-06 | TEST-F03-11 | API | Yes | Ran | Pass |
| AC-F03-07 | TEST-F03-12 | API | Yes | Ran | Pass |
| AC-F03-08 | TEST-F03-13, TEST-F03-14, TEST-F03-21, TEST-F03-22 | API | Yes | Ran | Pass |
| AC-F03-09 | TEST-F03-15, TEST-F03-16 | API | Yes | Ran | Pass |
| AC-F03-10 | TEST-F03-19 | E2E | Yes | Ran | Pass |
| AC-F03-11 | TEST-F03-20 | E2E | Yes | Ran | Pass |
| AC-F03-12 | TEST-F03-18, TEST-F03-23 | unit | Yes | Ran | Pass |
| AC-F03-13 | TEST-F03-24 | E2E | Yes | Ran | Pass |

### F-04 (`docs/sprint_1/sprints/sprint-1\F-04-accept.md`)

| AC | Test IDs | Level | Implemented | Verification | Result |
|---|---|---|---|---|---|
| AC-F04-01 | TEST-F04-01 | API | Yes | Ran | Pass |
| AC-F04-02 | TEST-F04-02 | API | Yes | Ran | Pass |
| AC-F04-03 | TEST-F04-03 | API | Yes | Ran | Pass |
| AC-F04-04 | TEST-F04-04 | API | Yes | Ran | Pass |
| AC-F04-05 | TEST-F04-05 | API | Yes | Ran | Pass |
| AC-F04-06 | TEST-F04-06 | API | Yes | Ran | Pass |
| AC-F04-07 | TEST-F04-07 | API | Yes | Ran | Pass |
| AC-F04-08 | TEST-F04-08, TEST-F04-14 | API | Yes | Ran | Pass |
| AC-F04-09 | TEST-F04-09 | API | Yes | Ran | Pass |
| AC-F04-10 | TEST-F04-10 | unit | Yes | Ran | Pass |
| AC-F04-11 | TEST-F04-11 | E2E | Yes | Ran | Pass |
| AC-F04-12 | TEST-F04-12 | E2E | Yes | Ran | Pass |
| AC-F04-13 | TEST-F04-13 | E2E | Yes | Ran | Pass |

### F-05 (`docs/sprint_2/sprints\F-05-menu-management.md`)

| AC | Test IDs | Level | Implemented | Verification | Result |
|---|---|---|---|---|---|
| AC-5.1 | TEST-5.1 | API | Yes | Ran | Pass |
| AC-5.2 | TEST-5.2 | API | Yes | Ran | Pass |
| AC-5.3 | TEST-5.3 | API | Yes | Ran | Pass |
| AC-5.4 | TEST-5.4 | API | Yes | Ran | Pass |
| AC-5.5 | TEST-5.5 | API | Yes | Ran | Pass |
| AC-5.6 | TEST-5.6 | API | Yes | Ran | Pass |
| AC-5.7 | TEST-5.7 | API | Yes | Ran | Pass |
| AC-5.8 | TEST-5.8 | API | Yes | Ran | Pass |
| AC-5.9 | TEST-5.9 | API | Yes | Ran | Pass |
| AC-5.10 | TEST-5.10 | API | Yes | Ran | Pass |
| AC-5.11 | TEST-5.11 | API | Yes | Ran | Pass |
| AC-5.12 | TEST-5.12 | API | Yes | Ran | Pass |
| AC-5.13 | TEST-5.13 | API | Yes | Ran | Pass |
| AC-5.14 | TEST-5.14 | API | Yes | Ran | Pass |
| AC-5.15 | TEST-5.15 | E2E | Yes | Ran | Pass |
| AC-5.16 | TEST-5.16 | E2E | Yes | Ran | Pass |
| AC-5.17 | TEST-5.17 | E2E | Yes | Ran | Pass |

### F-06 (`docs/sprint_2/sprints\F-06-cancel-reject.md`)

| AC | Test IDs | Level | Implemented | Verification | Result |
|---|---|---|---|---|---|
| AC-F06-01 | TEST-F06-01 | API | Yes | Ran | Pass |
| AC-F06-02 | TEST-F06-02 | API | Yes | Ran | Pass |
| AC-F06-03 | TEST-F06-03 | API | Yes | Ran | Pass |
| AC-F06-04 | TEST-F06-04 | API | Yes | Ran | Pass |
| AC-F06-05 | TEST-F06-05 | API | Yes | Ran | Pass |
| AC-F06-06 | TEST-F06-06 | API | Yes | Ran | Pass |
| AC-F06-07 | TEST-F06-07 | API | Yes | Ran | Pass |
| AC-F06-08 | TEST-F06-08 | API | Yes | Ran | Pass |
| AC-F06-09 | TEST-F06-09 | API | Yes | Ran | Pass |
| AC-F06-10 | TEST-F06-10 | API | Yes | Ran | Pass |
| AC-F06-11 | TEST-F06-11 | API | Yes | Ran | Pass |
| AC-F06-12 | TEST-F06-12 | API | Yes | Ran | Pass |
| AC-F06-13 | TEST-F06-13 | API | Yes | Ran | Pass |
| AC-F06-14 | TEST-F06-14 | API | Yes | Ran | Pass |
| AC-F06-15 | TEST-F06-15 | API | Yes | Ran | Pass |
| AC-F06-16 | TEST-F06-16 | unit | Yes | Ran | Pass |
| AC-F06-17 | TEST-F06-17 | E2E | Yes | Ran | Pass |
| AC-F06-18 | TEST-F06-18 | E2E | Yes | Ran | Pass |
| AC-F06-19 | TEST-F06-19 | E2E | Yes | Ran | Pass |
| AC-F06-20 | TEST-F06-20 | E2E | Yes | Ran | Pass |
| AC-F06-21 | TEST-F06-21 | E2E | Yes | Ran | Pass |

### F-07 (`docs/sprint_2/sprints\F-07-fulfilment.md`)

| AC | Test IDs | Level | Implemented | Verification | Result |
|---|---|---|---|---|---|
| AC-F07-01 | TEST-F07-01 | API | Yes | Ran | Pass |
| AC-F07-02 | TEST-F07-02 | API | Yes | Ran | Pass |
| AC-F07-03 | TEST-F07-03 | API | Yes | Ran | Pass |
| AC-F07-04 | TEST-F07-04 | API | Yes | Ran | Pass |
| AC-F07-05 | TEST-F07-05 | API | Yes | Ran | Pass |
| AC-F07-06 | TEST-F07-06 | API | Yes | Ran | Pass |
| AC-F07-07 | TEST-F07-07 | API | Yes | Ran | Pass |
| AC-F07-08 | TEST-F07-08 | API | Yes | Ran | Pass |
| AC-F07-09 | TEST-F07-09 | API | Yes | Ran | Pass |
| AC-F07-10 | TEST-F07-10 | API | Yes | Ran | Pass |
| AC-F07-11 | TEST-F07-11 | API | Yes | Ran | Pass |
| AC-F07-12 | TEST-F07-12 | API | Yes | Ran | Pass |
| AC-F07-13 | TEST-F07-13 | API | Yes | Ran | Pass |
| AC-F07-14 | TEST-F07-14 | API | Yes | Ran | Pass |
| AC-F07-15 | TEST-F07-15 | unit | Yes | Ran | Pass |
| AC-F07-16 | TEST-F07-16 | E2E | Yes | Ran | Pass |
| AC-F07-17 | TEST-F07-17 | E2E | Yes | Ran | Pass |
| AC-F07-18 | TEST-F07-18 | E2E | Yes | Ran | Pass |
| AC-F07-19 | TEST-F07-19 | E2E | Yes | Ran | Pass |

### F-08 (`docs/sprint_2/sprints\F-08-payment.md`)

| AC | Test IDs | Level | Implemented | Verification | Result |
|---|---|---|---|---|---|
| AC-8.1 | TEST-8.1 | API | Yes | Ran | Pass |
| AC-8.2 | TEST-8.2 | API | Yes | Ran | Pass |
| AC-8.3 | TEST-8.3 | API | Yes | Ran | Pass |
| AC-8.4 | TEST-8.4 | API | Yes | Ran | Pass |
| AC-8.5 | TEST-8.5 | API | Yes | Ran | Pass |
| AC-8.6 | TEST-8.6 | API | Yes | Ran | Pass |
| AC-8.7 | TEST-8.7 | API | Yes | Ran | Pass |
| AC-8.8 | TEST-8.8 | API | Yes | Ran | Pass |
| AC-8.9 | TEST-8.9 | API | Yes | Ran | Pass |
| AC-8.10 | TEST-8.10 | API | Yes | Ran | Pass |
| AC-8.11 | TEST-8.11 | API | Yes | Ran | Pass |
| AC-8.12 | TEST-8.12 | API | Yes | Ran | Pass |
| AC-8.13 | TEST-8.13 | API | Yes | Ran | Pass |
| AC-8.14 | TEST-8.14 | API | Yes | Ran | Pass |
| AC-8.15 | TEST-8.15 | API | Yes | Ran | Pass |
| AC-8.16 | TEST-8.16 | E2E | Yes | Ran | Pass |
| AC-8.17 | TEST-8.17 | E2E | Yes | Ran | Pass |
| AC-8.18 | TEST-8.18 | E2E | Yes | Ran | Pass |

### F-09 (`docs/sprint_2/sprints\F-09-pickup-slots.md`)

| AC | Test IDs | Level | Implemented | Verification | Result |
|---|---|---|---|---|---|
| AC-F09-01 | TEST-F09-01 | API | Yes | Ran | Pass |
| AC-F09-02 | TEST-F09-02 | API | Yes | Ran | Pass |
| AC-F09-03 | TEST-F09-03 | API | Yes | Ran | Pass |
| AC-F09-04 | TEST-F09-04 | API | Yes | Ran | Pass |
| AC-F09-05 | TEST-F09-05 | API | Yes | Ran | Pass |
| AC-F09-06 | TEST-F09-06 | API | Yes | Ran | Pass |
| AC-F09-07 | TEST-F09-07 | API | Yes | Ran | Pass |
| AC-F09-08 | TEST-F09-08 | API | Yes | Ran | Pass |
| AC-F09-09 | TEST-F09-09 | API | Yes | Ran | Pass |
| AC-F09-10 | TEST-F09-10 | API | Yes | Ran | Pass |
| AC-F09-11 | TEST-F09-11 | API | Yes | Ran | Pass |
| AC-F09-12 | TEST-F09-12 | API | Yes | Ran | Pass |
| AC-F09-13 | TEST-F09-13 | API | Yes | Ran | Pass |
| AC-F09-14 | TEST-F09-14 | API | Yes | Ran | Pass |
| AC-F09-15 | TEST-F09-15 | E2E | Partly | Not run (test not written) | Missing: TEST-F09-15 |
| AC-F09-16 | TEST-F09-16 | E2E | Partly | Not run (test not written) | Missing: TEST-F09-16 |
| AC-F09-17 | TEST-F09-17 | E2E | Partly | Not run (test not written) | Missing: TEST-F09-17 |

### F-10 (`docs/sprint_2/sprints\F-10-sales-summary.md`)

| AC | Test IDs | Level | Implemented | Verification | Result |
|---|---|---|---|---|---|
| AC-10.1 | TEST-10.1 | API | No | Not run (test not written) | Missing: TEST-10.1 |
| AC-10.2 | TEST-10.2 | API | No | Not run (test not written) | Missing: TEST-10.2 |
| AC-10.3 | TEST-10.3 | API | No | Not run (test not written) | Missing: TEST-10.3 |
| AC-10.4 | TEST-10.4 | API | No | Not run (test not written) | Missing: TEST-10.4 |
| AC-10.5 | TEST-10.5 | API | No | Not run (test not written) | Missing: TEST-10.5 |
| AC-10.6 | TEST-10.6 | API | No | Not run (test not written) | Missing: TEST-10.6 |
| AC-10.7 | TEST-10.7 | API | No | Not run (test not written) | Missing: TEST-10.7 |
| AC-10.8 | TEST-10.8 | API | No | Not run (test not written) | Missing: TEST-10.8 |
| AC-10.9 | TEST-10.9 | E2E | No | Not run (test not written) | Missing: TEST-10.9 |

### F-11 (`docs/sprint_2/sprints\F-11-search-filter.md`)

| AC | Test IDs | Level | Implemented | Verification | Result |
|---|---|---|---|---|---|
| AC-F11-01 | TEST-F11-01 | API | Yes | Ran | Pass |
| AC-F11-02 | TEST-F11-02 | API | Yes | Ran | Pass |
| AC-F11-03 | TEST-F11-03 | API | Yes | Ran | Pass |
| AC-F11-04 | TEST-F11-04 | API | Yes | Ran | Pass |
| AC-F11-05 | TEST-F11-05 | API | Yes | Ran | Pass |
| AC-F11-06 | TEST-F11-06 | API | Yes | Ran | Pass |
| AC-F11-07 | TEST-F11-07 | API | Yes | Ran | Pass |
| AC-F11-08 | TEST-F11-08 | API | Yes | Ran | Pass |
| AC-F11-09 | TEST-F11-09 | API | Yes | Ran | Pass |
| AC-F11-10 | TEST-F11-10 | API | Yes | Ran | Pass |
| AC-F11-11 | TEST-F11-11 | API | Yes | Ran | Pass |
| AC-F11-12 | TEST-F11-12 | API | Yes | Ran | Pass |
| AC-F11-13 | TEST-F11-13 | API | Yes | Ran | Pass |
| AC-F11-14 | TEST-F11-14 | API | Yes | Ran | Pass |
| AC-F11-15 | TEST-F11-15 | API | Yes | Ran | Pass |
| AC-F11-16 | TEST-F11-16 | E2E | Yes | Ran | Pass |
| AC-F11-17 | TEST-F11-17 | E2E | Yes | Ran | Pass |

### F-12 (`docs/sprint_2/sprints\F-12-hardening.md`)

| AC | Test IDs | Level | Implemented | Verification | Result |
|---|---|---|---|---|---|
| AC-12.1 | TEST-12.1 | API | No | Not run (test not written) | Missing: TEST-12.1 |
| AC-12.2 | TEST-12.2 | API | No | Not run (test not written) | Missing: TEST-12.2 |
| AC-12.3 | TEST-12.3 | API | No | Not run (test not written) | Missing: TEST-12.3 |
| AC-12.4 | TEST-12.4 | API | No | Not run (test not written) | Missing: TEST-12.4 |
| AC-12.5 | TEST-12.5 | API | No | Not run (test not written) | Missing: TEST-12.5 |
| AC-12.6 | TEST-12.6 | API | No | Not run (test not written) | Missing: TEST-12.6 |
| AC-12.7 | TEST-12.7 | API | No | Not run (test not written) | Missing: TEST-12.7 |
| AC-12.8 | TEST-12.8 | E2E | No | Not run (test not written) | Missing: TEST-12.8 |

## Change log

| Date | Change | Why |
|---|---|---|
| 6 Nov 2026 | First draft (business rules mapped) | Deliverable 1 part B |
| 6 Nov 2026 | AC, test IDs and results for all Sprint 1 rows (#28) | AC-B3 |
| 6 Nov 2026 | Added TEST-F03-22, TEST-F03-23, TEST-F04-14 (recheck #37) | Bug fix and ui-spec alignment |
| 13 Nov 2026 | Added AC-F03-13 / TEST-F03-24 phone tab order (#47) | QA finding on release PR #46 |
| 21 Nov 2026 | Coverage count corrected: 61 test IDs (14 + 9 + 24 + 14), was written as 62 (#53, review on #54) | Counting error |
| 25 Nov 2026 | Added BR-08..BR-21 and Sprint 2 rows with actual results (F-05, F-08 part 1); F-06, F-07, F-10, F-12 shown as planned | Deliverable 2 part D |
| 26 Nov 2026 | Added BR-22..BR-24 (F-09), filled AC/TEST IDs for F-06/F-07/F-09/F-10/F-11/F-12, updated F-06 server results (PR #120) and BR-16 status (PR #136) | Sync traceability with merged PRs #102, #118, #120 (S2-8b) |
| 27 Nov 2026 | Version 3 (Issue #186): added BR-25..BR-27 (F-11, were missing); added the "Actual file(s)" column; every result re-derived from one run on `sprint2` `d10fac1`; F-06..F-09 and F-11 rows moved from Planned to Pass; F-10, F-12, NFR-08, NFR-09 shown as not implemented; per-AC status table added | Deliverable 2 part D audit |
