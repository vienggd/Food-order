# Deliverable 2, Part D: Updated requirements and test traceability

Campus Café Pre-order. Issue #186. Author: ninja (NinjoMUDA). Reviewer: vieng (vienggd).
Audited against `sprint2` at `d10fac1` (27 Nov 2026). The living documents are the source; the PDF embeds them in full:

| Document | File | Version after this audit |
|---|---|---|
| Software Requirements Specification | `docs/srs.md` | 3 (27 Nov 2026) |
| Feature inventory | `docs/features.md` | 3 (27 Nov 2026) |
| System-Level SDS | `docs/system-sds.md` | 3 (27 Nov 2026) |
| Traceability matrix (requirement → feature → sprint → AC → planned test → actual file → result and version) | `docs/traceability.md` | 3 (27 Nov 2026) |

## 1. What the audit compared

I read each document against the code on `sprint2` (routes in `server/src`, Prisma schema and migrations, client routes in `client/src/App.tsx`, the test files in `server/tests`, `client/src`, `e2e`) and against one fresh run of the whole suite on `d10fac1`:

| Command | Result |
|---|---|
| `npm run build` (root: server `tsc`, client `tsc` + `vite build`) | ok |
| `cd server; npx vitest run` | 177 passed, 0 failed (15 files) |
| `cd client; npx vitest run` | 8 passed, 0 failed (4 files) |
| `npx playwright test` (phone 375 px + desktop 1280 px) | 67 passed, 7 skipped, 0 failed |

Every `TEST-…` ID in the four feature families' test specifications was looked up in the test titles of that run. The per-requirement matrix and the per-AC table in `docs/traceability.md` (sections 1–3 and 5) are generated from that lookup, not typed by hand.

## 2. Findings and what changed

| # | Finding in the old documents | Where | Fix |
|---|---|---|---|
| 1 | BR-25, BR-26, BR-27 (F-11) existed only in the F-11 contract. They were missing from the SRS and the matrix. | `srs.md`, `traceability.md` | Added to both (rows BR-25..BR-27, tested by TEST-F11-04, -06..-10, -12..-14, -17). |
| 2 | BR-22..BR-24 said "planned"; F-09 is implemented and its 14 server tests pass. | `srs.md` | Marked implemented. |
| 3 | The matrix said "Planned (not run)" for F-06 UI, F-07, BR-15, F-08 part 2, F-09, F-11, although the code is merged and the tests pass. | `traceability.md` | Every result re-derived from the run on `d10fac1`; rows changed from Planned to Pass. |
| 4 | The matrix had one "Tests" column mixing planned and actual tests. | `traceability.md` | Split into "Planned tests" and "Actual file(s)"; added a per-AC table (173 AC) with Implemented, Verification and Result. |
| 5 | The SDS endpoint table said F-07, F-09, F-11 were "contract only"; the `GET /api/slots` response shape (`{ slots: […] }`) did not match the code and the F-09 contract (`[ { start, state, remaining } ]`). | `system-sds.md` 4.4 | Statuses and shape corrected; `pickupSlot` added to the order request. |
| 6 | The SDS data model had no `orders.pickup_slot` column and no note on the slot lock. | `system-sds.md` 3.2 | Added with the migration name. |
| 7 | The SDS screens list had S5 only for F-04 and no menu-admin screen. | `system-sds.md` 2.1 | S2–S5 list the Sprint 2/3 features; S6 `/operator/menu` added. |
| 8 | The SDS said "Planned GCP deployment"; the service is live since Lab 5. | `system-sds.md` 7.4 | Now states the live revision `food-order-00009-jd9` (= `main` `39bda5e`) and that Sprint 2/3 code is not deployed yet. |
| 9 | The SRS decision DEC-05 said "Sprint 1 allows only PLACED → ACCEPTED". | `srs.md` | Reworded; DEC-09 (advance carries `from`), DEC-10 (slot lock), DEC-11 (LIKE escaping) recorded. |
| 10 | The feature inventory still listed F-06, F-07 as "In progress/Specified" and F-11 with no business rules. | `features.md` | Statuses updated; F-11 now lists BR-25..BR-27. |

## 3. Approved baseline changes since version 1 (with rationale)

| Date | Change | Why | Where recorded |
|---|---|---|---|
| 25 Nov | Added FR-11..FR-18, BR-08..BR-21 for Sprint 2/3 features | Sprint 2/3 contracts | SRS change log v2 |
| 26 Nov | Added BR-22..BR-24 (pickup slots) | F-09 contract (PR #118) | SRS change log v2.1 |
| 27 Nov | Added BR-25..BR-27 (search/filter) | Missing in v2, found by this audit | SRS change log v3 |
| 26 Nov | `status` values accepted by the operator list widened from the 4 open statuses to all 7 | F-11 search needs closed orders; TEST-F04-03 and TEST-F07-13 now use `nonsense` / `placed` as the invalid values | F-11 contract; Part C section 3.2 |
| 26 Nov | Advance route requires paid orders for READY → PICKED_UP in the same update (BR-15) | Closes a race between paying and picking up | F-08 contract; DEC-09 |
| 26 Nov | Search escapes `%` and `_` | TEST-F11-12 found that a percent sign matched every order | DEC-11 |

## 4. Coverage and honest status

From `docs/traceability.md` section 4:

- 173 acceptance criteria in the contracts; **153 implemented and verified (Pass)** on `d10fac1`; **20 not verified**.
- Not verified: AC-F09-15..17 (picker UI; test not written), AC-10.1..10.9 (F-10, no code), AC-12.1..12.8 (F-12, no code).
- Requirements with no code and no test yet: FR-17, BR-17, BR-18, BR-19 (F-10); NFR-08, BR-20, BR-21 (F-12); NFR-09 (axe and keyboard check).
- FR-16 is partly verified (server rules pass, picker E2E missing).
- NFR-07 is a manual check (no secrets in Git); it is the only requirement verified by hand.
- Nothing from Sprint 2 or 3 is on `main`; "Pass" means on the staging branch. Planned final verification and dates: Part C section 5.

## 5. Two selected test excerpts

### 5.1 Domain rule: the pickup-slot cut-off (TEST-F09-02, TEST-F09-03; BR-23; AC-F09-02, AC-F09-03)

File `server/tests/pickup-slots.test.ts`. The server clock is replaced by a fixed Bangkok time, so the test is exact to the second. Real PostgreSQL, seeded users.

```ts
const DAY = "2026-11-28";
const bkk = (hhmmss: string) => new Date(`${DAY}T${hhmmss}+07:00`); // a Bangkok clock time on the test day
const at = (hhmmss: string) => { clock.now = () => bkk(hhmmss); };
const slot = (hhmm: string) => bkk(`${hhmm}:00`).toISOString();

it("TEST-F09-02 one second before the cut-off is accepted", async () => {
  at("10:14:59");
  expect((await place({ pickupSlot: slot("10:30") })).status).toBe(201);
});

it("TEST-F09-03 exactly at the cut-off is refused (400) and nothing is saved", async () => {
  at("10:15:00");
  const res = await place({ pickupSlot: slot("10:30") });
  expect(res.status).toBe(400);
  expect(res.body.error).toMatchObject({ code: "VALIDATION_ERROR", message: "This pickup slot is closed. Pick a later slot.", details: { field: "pickupSlot" } });
  expect(await prisma.order.count()).toBe(0);
});
```

Execution on `d10fac1` (`cd server; npx vitest run`): both tests pass; `tests/pickup-slots.test.ts` 14 tests passed; whole server suite 177 passed.
History: the test was written first (RED commit `57cfe44`, `docs/sprint_2/evidence/tdd/F-09-red.txt`), then the rule (GREEN commit `eb5fcde`, `F-09-green.txt`).

### 5.2 Access restriction: operator search is for operators only (TEST-F11-15; FR-04; AC-F11-15)

File `server/tests/order-search.test.ts`. Same real database; the customer session is a real login cookie.

```ts
const search = (query: string, cookie = staff) =>
  request(app).get(`/api/operator/orders${query}`).set("Cookie", cookie);

it("TEST-F11-15 customer gets 403, anonymous gets 401", async () => {
  expect((await search("?q=ali", alice)).status).toBe(403);
  expect((await request(app).get("/api/operator/orders?q=ali")).status).toBe(401);
});
```

Execution on `d10fac1`: passes (`tests/order-search.test.ts` 9 tests passed). Related access tests with the same shape: TEST-F07-11 (advance), TEST-F09-13 (slots, reversed roles: operator 403).

## 6. Two Issue / PR chains (Sprint 3 work)

Both chains are ninja's feature with vieng as reviewer; merge by vieng with a merge commit (no squash); staging branch is `sprint2`. IDs and times are from GitHub (UTC).

### Chain 1: F-09 pickup slots and cut-off (Issue #146 → PR #147)

| Step | What | When (UTC) |
|---|---|---|
| Contract | PR #118 merged: `F-09-pickup-slots.md` | 25 Nov |
| Issue | #146 "N-13: F-09 pickup slots, cut-off rule (TDD) and minimal slot picker", board Backlog → Specified → Started | 26 Nov 07:32 |
| Branch | `sprint3-ninja-f09` from `sprint2` | 26 Nov |
| RED | commit `57cfe44` test(F-09): [red] TEST-F09-01..14 | 26 Nov |
| GREEN | commit `eb5fcde` feat(F-09): [green] slots, cut-off, capacity, picker, migration | 26 Nov |
| PR | #147 into `sprint2` by NinjoMUDA | 26 Nov 07:32 |
| Review 1 | vieng **CHANGES_REQUESTED** 08:34: code looks clean, but an E2E run had modified 18 submitted Sprint 1 screenshots; restore them and merge `sprint2` if conflicts appear after #144 | 26 Nov 08:34 |
| Fix | screenshots restored (`git checkout origin/sprint2 -- docs/sprint_1/evidence/screenshots`), `sprint2` merged (`17a8a12`), conflict in `client/src/lib/orders.ts` resolved | 26 Nov |
| Review 2 | vieng **APPROVED** 10:23 after checking screenshots, conflict resolution, slot rules, advisory lock, migration, tests | 26 Nov 10:23 |
| Merge | merge commit `54f92ae` into `sprint2` | 26 Nov 10:23 |
| Close | Issue #146 closed, card Done | 26 Nov 10:23 |
| Links | Issue #146 shows PR #147 as closing reference (GraphQL `addCloseIssueReferences`, since the base is not the default branch) | |
| Release | not released: `sprint2` → `main` is planned after the Lab 6 re-test (Part C section 5) | |

### Chain 2: F-11 operator search (Issue #157 → PR #158)

| Step | What | When (UTC) |
|---|---|---|
| Contract | PR #118 merged: `F-11-search-filter.md` | 25 Nov |
| Issue | #157 "N-15: F-11 operator search (order number, customer name, status)" | 26 Nov 11:02 |
| Branch | `sprint3-ninja-f11-operator` from `sprint2` (after vieng's BR-15 PR #154, because both change `operator/routes.ts` and `QueuePage.tsx`) | 26 Nov |
| RED | `99cb5d5` server tests TEST-F11-07..15 (8 fail); `c2b746d` E2E TEST-F11-17 (fails: search box missing) | 26 Nov |
| GREEN | `5a7eec6` server (163 tests pass; LIKE escaping added after TEST-F11-12 failed); `7ac4ec4` UI (Playwright 58 pass) | 26 Nov |
| PR | #158 into `sprint2` by NinjoMUDA | 26 Nov 11:02 |
| Review | vieng **APPROVED** 13:39, re-ran build, server 163, client 8, Playwright 58 | 26 Nov 13:39 |
| Merge | merge commit `975c230` into `sprint2` | 26 Nov 13:39 |
| Close | Issue #157 closed, card Done | 26 Nov 13:39 |
| Links | PR #158 linked to Issue #157 (`closedByPullRequestsReferences` shows #158). vieng noted that no `gh issue develop` branch link exists on #157, because the branch was created before the issue; this is a known gap. | |
| Release | not released yet (as above) | |
