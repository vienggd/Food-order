# Traceability matrix — Campus Café Pre-order

Deliverable 1, part B (2 of 2). Issue #7. Features: [`features.md`](features.md). Requirements: `docs/sprint_1/srs.md` (#6).
Version 1 — 6 Nov 2026 (draft).

How to read a row: requirement → feature → sprint → acceptance criteria (from the feature contract) → test IDs (from the test spec) → result on the tested commit.
Sprint 1 AC and test IDs come from the contracts in `docs/sprint_1/sprints/sprint-1/` and match the test names (`it("TEST-…")`). **Result** = test run on commit `f3acfc9` (6 Nov 2026): `npm test` server 63/63 + client 5/5 passed, `npm run test:e2e` 20/20 passed (phone + desktop). Re-run on the final `sprint-1` commit before submission.

## 1. Business rules

| Req | Rule (short) | Feature | Sprint | AC | Tests | Result |
|---|---|---|---|---|---|---|
| BR-01 | Quantity per line is a whole number 1–10 | F-03 | 1 | AC-F03-02, AC-F03-12 | TEST-F03-02, -03 (API); -18 (unit) | Pass |
| BR-02 | 1–20 lines, no duplicate menu item | F-03 | 1 | AC-F03-03, AC-F03-12 | TEST-F03-04, -05, -06, -07 (API); -17, -18, -23 (unit) | Pass |
| BR-03 | Every item exists and is available, else nothing is saved | F-02, F-03 | 1 | AC-F02-02, AC-F02-06, AC-F03-04, AC-F03-11 | TEST-F02-02 (API), -08 (E2E); TEST-F03-08, -09 (API), -20 (E2E) | Pass |
| BR-04 | Server calculates the total; price/total in request → 400 | F-03 | 1 | AC-F03-01, AC-F03-05 | TEST-F03-01, -10 (API) | Pass |
| BR-05 | Order line keeps item name and unit price at order time | F-03 | 1 | AC-F03-06 | TEST-F03-11 (API) | Pass |
| BR-06 | Only a PLACED order can be accepted, else 409 | F-04 | 1 | AC-F04-05, AC-F04-06, AC-F04-10 | TEST-F04-05, -06 (API); -10 (unit) | Pass |
| BR-07 | Two operators accept at once → one 200, one 409 | F-04 | 1 | AC-F04-07, AC-F04-13 | TEST-F04-07 (API, 20 parallel); -13 (E2E) | Pass |
| BR-08 | Menu name 1–60 characters, unique ignoring case | F-05 | 2 | AC-5.3, AC-5.4, AC-5.5, AC-5.17 | TEST-5.3, -5.4, -5.5 (API); -5.17 (E2E) | Pass (branch run, 25 Nov 2026; not released) |
| BR-09 | Menu price whole satang 1–100000 | F-05 | 2 | AC-5.6, AC-5.7 | TEST-5.6, -5.7 (API) | Pass (branch run, 25 Nov 2026; not released) |
| BR-10 | Sold out / price edit affects new orders only | F-05 | 2 | AC-5.8, AC-5.9, AC-5.10 | TEST-5.8, -5.9, -5.10 (API) | Pass (branch run, 25 Nov 2026; not released) |
| BR-11 | Customer cancels own order only while PLACED | F-06 | 2 | AC-F06-01..06 | TEST-F06-01..06 (API) | Pass (branch run on `sprint2` 34c6e13, PR #120; not released) |
| BR-12 | Reject only PLACED, reason 3–200, accept/reject race | F-06 | 2 | AC-F06-07..14 | TEST-F06-07..14 (API) | Pass (branch run on `sprint2` 34c6e13, PR #120; not released) |
| BR-13 | One step at a time ACCEPTED→PREPARING→READY→PICKED_UP | F-07 | 2 | AC-F07-01..15 | TEST-F07-01..15 (API, unit) | Planned (not run) (contract merged in PR #102) |
| BR-14 | Pay own order once; not CANCELLED/REJECTED/PICKED_UP | F-08 | 2 | AC-8.1..AC-8.10, AC-8.16 | TEST-8.1..8.10 (API); -8.16 (E2E) | Pass (branch run, 25 Nov 2026; not released) |
| BR-15 | PICKED_UP needs payment PAID | F-08 (in F-07 route) | 2 | AC-8.14, AC-8.15, AC-8.17 | TEST-8.14, -8.15 (API); -8.17 (E2E) | Planned (not run) (waits for F-07 code) |
| BR-16 | Cancel/reject of a PAID order → REFUNDED | F-08 (in F-06 routes) | 2 | AC-8.11, AC-8.12, AC-8.13 | TEST-8.11..8.13 (API) | Implemented in PR #136 (passes on `sprint2-vieng`; pending merge into `sprint2`) |
| BR-17 | Only PICKED_UP and PAID orders count as sales | F-10 | 3 | AC-10.1, AC-10.2 | TEST-10.1, -10.2 (API) | Planned (not run) (Sprint 3, PR #106) |
| BR-18 | Sales days are Asia/Bangkok days | F-10 | 3 | AC-10.3 | TEST-10.3 (API) | Planned (not run) (Sprint 3, PR #106) |
| BR-19 | Top 3 items by quantity, ties by name | F-10 | 3 | AC-10.4 | TEST-10.4 (API) | Planned (not run) (Sprint 3, PR #106) |
| BR-20 | Successful login clears failed count | F-12 | 3 | AC-12.5 | TEST-12.5 (API) | Planned (not run) (Sprint 3, PR #106) |
| BR-21 | Failed logins counted per email | F-12 | 3 | AC-12.3, AC-12.7 | TEST-12.3, -12.7 (API) | Planned (not run) (Sprint 3, PR #106) |
| BR-22 | Pickup slots 15 min apart in 08:00–16:45 (today, Bangkok) | F-09 | 3 | AC-F09-01, -05, -07, -12 | TEST-F09-01, -05, -07, -12 (API) | Planned (not run) (Sprint 3, PR #118) |
| BR-23 | Orders for a pickup slot close 15 min before start | F-09 | 3 | AC-F09-02, -03, -04, -06 | TEST-F09-02, -03, -04, -06 (API) | Planned (not run) (Sprint 3, PR #118) |
| BR-24 | Slot capacity 10; cancelled/rejected free space; ASAP excluded | F-09 | 3 | AC-F09-08..11 | TEST-F09-08..11 (API) | Planned (not run) (Sprint 3, PR #118) |

## 2. Functional requirements

IDs agreed with the SRS author in chat on 6 Nov 2026.

| Req | Requirement (short) | Feature | Sprint | AC | Tests | Result |
|---|---|---|---|---|---|---|
| FR-01 | Log in with email + password | F-01 | 1 | AC-F01-01..05, AC-F01-12, AC-F01-13 | TEST-F01-01..05 (API); -12, -13 (E2E) | Pass |
| FR-02 | Log out | F-01 | 1 | AC-F01-09, AC-F01-12 | TEST-F01-09 (API); -12 (E2E) | Pass |
| FR-03 | Show current user and send to role home | F-01 | 1 | AC-F01-06, AC-F01-07, AC-F01-12, AC-F01-14 | TEST-F01-06, -07 (API); -12, -14 (E2E) | Pass |
| FR-04 | Server checks role on every protected endpoint | F-01 (used by F-02..F-04) | 1 | AC-F01-10, AC-F01-14, AC-F02-03, AC-F02-04, AC-F03-09, AC-F04-09 | TEST-F01-10 (API), -14 (E2E); TEST-F02-03..05; TEST-F03-15, -16; TEST-F04-09 (API) | Pass |
| FR-05 | View menu with price and availability | F-02 | 1 | AC-F02-01, -02, -05, -06, -07 | TEST-F02-01, -02, -06 (API); -07 (unit); -08, -09 (E2E) | Pass |
| FR-06 | Place an order | F-03 | 1 | AC-F03-01..05, AC-F03-10..12 | TEST-F03-01..10 (API); -17, -18 (unit); -19, -20 (E2E) | Pass |
| FR-07 | List my orders | F-03 | 1 | AC-F03-07, AC-F03-10 | TEST-F03-12 (API); -19 (E2E) | Pass |
| FR-08 | View my order detail | F-03 | 1 | AC-F03-06, AC-F03-08, AC-F03-10 | TEST-F03-11, -13, -14, -21, -22 (API); -19 (E2E) | Pass |
| FR-09 | Operator queue of PLACED orders, oldest first | F-04 | 1 | AC-F04-01..03, AC-F04-11 | TEST-F04-01..03 (API); -11 (E2E) | Pass |
| FR-10 | Accept an order | F-04 | 1 | AC-F04-04..08, AC-F04-12, AC-F04-13 | TEST-F04-04..08, -14 (API); -12, -13 (E2E) | Pass |
| FR-11 | Menu management | F-05 | 2 | AC-5.1..AC-5.17 | TEST-5.1..5.14 (API); -5.15..5.17 (E2E) | Pass (branch run, 25 Nov 2026; not released) |
| FR-12 | Customer cancel | F-06 | 2 | AC-F06-01..06, AC-F06-16..18 | TEST-F06-01..06 (API); -16 (unit); -17, -18 (E2E) | Partly run: TEST-F06-01..06, -16 pass on `sprint2` (34c6e13, PR #120); UI/E2E -17, -18 planned |
| FR-13 | Operator reject with reason | F-06 | 2 | AC-F06-07..15, AC-F06-19..21 | TEST-F06-07..15 (API); -19..21 (E2E) | Partly run: TEST-F06-07..15 pass on `sprint2` (34c6e13, PR #120); UI/E2E -19..21 planned |
| FR-14 | Fulfilment PREPARING → READY → PICKED_UP | F-07 | 2 | AC-F07-01..19 | TEST-F07-01..15 (API, unit); -16..19 (E2E) | Planned (not run) (contract merged in PR #102) |
| FR-15 | Simulated payment | F-08 | 2 | AC-8.1..AC-8.18 | TEST-8.1..8.18 | Partly run: 8.1–8.10, 8.16, 8.18 pass on `sprint2` (PR #115); 8.11–8.13 in PR #136; 8.14–8.15, 8.17 planned |
| FR-16 | Pickup time slots | F-09 | 3 | AC-F09-01..17 | TEST-F09-01..14 (API); -15..17 (E2E) | Planned (not run) (Sprint 3, contract PR #118) |
| FR-17 | Sales summary | F-10 | 3 | AC-10.1..10.9 | TEST-10.1..10.8 (API); -10.9 (E2E) | Planned (not run) (Sprint 3, contract PR #106) |
| FR-18 | Order search / filter | F-11 | 3 | AC-F11-01..17 | TEST-F11-01..15 (API); -16, -17 (E2E) | Planned (not run) (Sprint 3, contract PR #118) |

## 3. Non-functional requirements

| Req | Requirement (short) | Feature | Sprint | AC | How verified / tests | Result |
|---|---|---|---|---|---|---|
| NFR-01 | bcrypt passwords, httpOnly session cookie, 8 h expiry | F-01 | 1 | AC-F01-01, -08, -09, -11; setup AC-1.2 | TEST-F01-01, -08, -09 (API), -11 (unit); seed.test.ts AC-1.2 (bcrypt hash) | Pass |
| NFR-02 | Role and prices only from server; no stack traces | F-01, F-03 | 1 | AC-F01-04, -06; AC-F03-05, -08; setup AC-1.5 | TEST-F01-04, -06; TEST-F03-10, -14 (API); app.test.ts "no stack trace" | Pass |
| NFR-03 | One error format, codes 400/401/403/404/409 | F-01..F-04 | 1 | setup AC-1.4, AC-1.5; every error AC | app.test.ts (AC-1.5); every API test asserts `error.code` | Pass |
| NFR-04 | One transaction per order; safe concurrent accept | F-03, F-04 | 1 | AC-F03-04, AC-F04-07 | TEST-F03-03..10 (0 orders and 0 lines after rejection); TEST-F04-07 (20 parallel accepts) | Pass |
| NFR-05 | Automated unit, API and end-to-end tests; tests first | F-01..F-04 | 1 | all Sprint 1 AC | All tests above; red/green output in `docs/sprint_1/evidence/tdd/` (F-01..F-04) | Pass |
| NFR-06 | Loading, empty and error states; phone and desktop | F-01..F-04 | 1 | AC-F01-13, AC-F02-07, AC-F03-10, -11, -13, AC-F04-11 | E2E on phone 375 px and desktop 1280 px (22 runs; TEST-F03-24 phone tab order); screenshots in `docs/sprint_1/evidence/screenshots/` | Pass |
| NFR-07 | One container, settings from env, no secrets in Git | all | 1 | — | Manual: `server/.env.example` placeholders only; `git grep` for the seed password: no match (6 Nov 2026). Container in Lab 5 | Pass |
| NFR-08 | Login rate limit | F-12 | 3 | AC-12.1..12.8 | TEST-12.1..12.7 (API); -12.8 (E2E) | Planned (not run) (Sprint 3, contract PR #106) |
| NFR-09 | Accessibility | F-12 | 3 | F-12 contract (no critical/serious axe issues; keyboard navigation) | Playwright + axe check; manual keyboard check | Planned (not run) (Sprint 3) |

## 4. Coverage check

- Every FR/BR/NFR maps to a feature: **yes** (FR-01..FR-18, BR-01..BR-24, NFR-01..NFR-09).
- Every Sprint 1 AC appears in at least one row above: **yes** — AC-F01-01..14, AC-F02-01..07, AC-F03-01..13, AC-F04-01..13 (47 AC).
- Every Sprint 1 AC has at least one automated test: **yes** — 61 test IDs (TEST-F01-01..14, TEST-F02-01..09, TEST-F03-01..24, TEST-F04-01..14), all found in test names in `server/tests/`, `client/src/lib/`, `e2e/`.
- Sprint 2 and 3 (25 Nov 2026): AC and test IDs come from the contracts in `docs/sprint_2/sprints/`. A row says Pass only when the test ran; "Planned (not run)" means the test is specified but not written or not executed. Nothing from Sprint 2 is released yet.
- Only manual check: NFR-07 (secrets and configuration), documented above.

| Test files | Level | IDs |
|---|---|---|
| `server/tests/auth.test.ts` | API (+ unit TEST-F01-11) | TEST-F01-01..11 |
| `server/tests/menu.test.ts` | API | TEST-F02-01..06 |
| `server/tests/orders.test.ts` | API | TEST-F03-01..16, -21, -22 |
| `server/tests/operator.test.ts`, `transitions.test.ts` | API, unit | TEST-F04-01..09, -14; -10 |
| `server/tests/app.test.ts`, `seed.test.ts` | API, DB | setup AC-1.2..1.5 (#1) |
| `client/src/lib/money.test.ts`, `cart.test.ts` | unit | TEST-F02-07, TEST-F03-17, -18, -23 |
| `server/tests/menu-management.test.ts` | API | TEST-5.1..5.14 |
| `server/tests/cancel-reject.test.ts` | API | TEST-F06-01..15 (plus unit TEST-F06-16 in `transitions.test.ts`) |
| `server/tests/payments.test.ts` | API | TEST-8.1..8.10 (plus order JSON fields; TEST-8.11..8.13 in PR #136) |
| `client/src/lib/price.test.ts` | unit | price conversion for F-05 form |
| `e2e/menu-admin.spec.ts`, `payment.spec.ts` | E2E | TEST-5.15..5.17; TEST-8.16, -8.18 |
| `e2e/auth.spec.ts`, `menu.spec.ts`, `orders.spec.ts`, `queue.spec.ts` | E2E | TEST-F01-12..14, TEST-F02-08..09, TEST-F03-19..20, -24, TEST-F04-11..13 |

## Change log

| Date | Change | Why |
|---|---|---|
| 6 Nov 2026 | First draft (business rules mapped) | Deliverable 1 part B |
| 6 Nov 2026 | AC, test IDs and results for all Sprint 1 rows (#28) | AC-B3 |
| 6 Nov 2026 | Added TEST-F03-22, TEST-F03-23, TEST-F04-14 (recheck #37) | Bug fix and ui-spec alignment |
| 13 Nov 2026 | Added AC-F03-13 / TEST-F03-24 phone tab order (#47) | QA finding on release PR #46 |
| 21 Nov 2026 | Coverage count corrected: 61 test IDs (14 + 9 + 24 + 14), was written as 62 (#53, review on #54) | Counting error |
| 25 Nov 2026 | Added BR-08..BR-21 and Sprint 2 rows with actual results (F-05, F-08 part 1); F-06, F-07, F-10, F-12 shown as planned | Deliverable 2 part D |
| 26 Nov 2026 | Added BR-22..BR-24 (F-09), filled AC/TEST IDs for F-06/F-07/F-09/F-10/F-11/F-12, and updated F-06 server API test results (PR #120) and BR-16 status (PR #136) | Sync traceability with merged PRs #102, #118, #120 (S2-8b) |
