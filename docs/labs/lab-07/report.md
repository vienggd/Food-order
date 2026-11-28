# Lab 7 — Maintenance change C-1: at most 15 items per order

CPE 334 · Semester 1/2026 · Section 131 · **Group EN-033_P4 (team Est)** · Campus Café Pre-order (Food-order).
**Status 28 Nov 2026 08:45 (+07).** Parts A–D are filled. C-1 is released to `main` (`704a66b`), deployed (revision `food-order-00011-9nh`) and live checks L1–L8 all passed. What is still open is listed under Limitations.

## Contents

| Part | Title | Points | Where |
|---|---|---|---|
| A | Change impact and contract | 25 | Issue [#96](https://github.com/vienggd/Food-order/issues/96), `docs/labs/lab-07/impact.md`, PR [#103](https://github.com/vienggd/Food-order/pull/103) |
| B | Implementation and regression-safe delivery | 50 | PR [#112](https://github.com/vienggd/Food-order/pull/112), `evidence/red.txt`, `green.txt`, `regression.txt`; live checks L1–L8 PASS (`evidence/live-checks.md`) |
| C | Metrics | 15 | `docs/labs/lab-07/metrics.md` (snapshot 28 Nov 08:45, after the release) |
| D | Readiness and retrospective | 10 | summary table below; details in `docs/labs/lab-07/readiness.md`; live-check evidence in `evidence/live/` |

## Team

| | |
|---|---|
| Students | **Garunyapas Danpitakkul** (vieng) — 67070503404 — GitHub [`vienggd`](https://github.com/vienggd)<br>**Dechayut Panyawutvorakul** (ninja) — 67070503414 — GitHub [`NinjoMUDA`](https://github.com/NinjoMUDA) |
| Repository | https://github.com/vienggd/Food-order |
| Board | https://github.com/users/vienggd/projects/4 |

## Version table

| Step | Version | Commit / id | Status |
|---|---|---|---|
| Sprint 1 baseline | tag `v0.1.0-sprint1` | tag on `main` | done |
| Version accepted in Lab 6 | Lab 6 release with the #132 fix: `main` merge of PR #181 | `39bda5e`, Cloud Run revision `food-order-00009-jd9` | done 26 Nov (Deploy demo run 45890211288, success) |
| Earlier Lab 6 release | Lab 6 release (PR #168) | `163fdb7`, revision `food-order-00008-v6c` | done 26 Nov (Deploy demo run 45860319259, success) |
| Actual pre-change commit | `main` after Lab 5 | `b71cdb2` | done |
| Contract | contract PR #103 merged into `lab7` | `9d976df` | done 25 Nov |
| Test commit (RED) | TEST-L7-1..5 + `red.txt` | `1b9e604` | done 25 Nov |
| Contract follow-up | 20 lines no longer reachable | `41031b7` | done 25 Nov |
| Fix commit | C-1 server check + cart | `7de5285` | done 25 Nov |
| Release to `main` | Lab 7 release PR #216 (`lab7` → `main`, merge commit) | `704a66b` | done 28 Nov 00:13 +07 (27 Nov 17:13:46 UTC) |
| Deployed revision | Cloud Run revision `food-order-00011-9nh`, bundle `assets/index-CDaqMZLn.js` | Deploy demo run `46040158850` | done, success (CI on the release PR: run `46039698561`, success) |
| Later-sprint changes | Sprint 2 was released to `main` first (`df6db99`, tag `v0.2.0-sprint2`, revision `food-order-00010-7vp`); `lab7` merged `main` in PR #211 and BR-01b was ported into the living docs (PR #211, #214) | `2bcf439` | done 27 Nov |

## Answer Part A: Change impact and contract

**Approved change.** Issue [#96](https://github.com/vienggd/Food-order/issues/96) (change request C-1). **TA Prapatsorn Sangrod approved it on 25 Nov 2026** (screenshots: `docs/labs/lab-07/evidence/ta-approval-1.png`, `ta-approval-2.png`). The four TA answers are recorded in #96 and in `impact.md` section 1.

| | Old rule | New rule |
|---|---|---|
| BR-01 | Quantity 1–10 on each order line | **Stays.** |
| BR-01b | (did not exist) | **New:** the sum of all line quantities in one order is at most 15. 14 and 15 are accepted (10 + 4, 10 + 5); 16 is refused (10 + 6, 8 + 8) |
| Error | — | 400 `VALIDATION_ERROR`, message "An order can have at most 15 items in total", `details { field: "lines", max: 15, total }` |
| Cart | + works up to 10 per line and 20 lines | warning at 15 and every + disabled, so a 16th item cannot be added |

**Impact (short).** Changed: SRS BR-01, F-03 contract, system SDS (rule table and flow step 3), traceability, `POST /api/orders`, the cart. Not changed (N/A with a reason each): database and migration (no new column), old orders (not re-checked), roles and access (401/403), operator queue, order editing (TA answer 4: not planned). Full table and what protects the unchanged parts: `docs/labs/lab-07/impact.md`.

**Contract diff (excerpt, PR [#103](https://github.com/vienggd/Food-order/pull/103), commit `c7f52fb`).**

```
+| BR-01b (Lab 7, C-1) | The sum of all `quantity` values in one order is at most 15 (10 + 5 ok, 10 + 6 rejected). Per-line 1-10 stays. | 400 VALIDATION_ERROR |
+| AC-L7-01 | When the quantities add up to 14 or 15 (e.g. 10 + 4, 10 + 5), then 201 PLACED. |
+| AC-L7-02 | When the quantities add up to 16 or more (10 + 6, 8 + 8), then 400 VALIDATION_ERROR, message "An order can have at most 15 items in total", details { field: "lines", max: 15, total }, and nothing is saved. |
+| AC-L7-03 | Per-line and per-order rules, roles (401/403) and old orders are unchanged. |
+| AC-L7-04 | In the cart, when the total reaches 15 a warning is shown and every + is disabled. |
+| TEST-L7-1 .. TEST-L7-5 | API (14 ok, 15 ok, 16 refused), unit (cart), E2E (warning and + disabled) |
```

**Review before code (timestamps, GitHub, UTC).** Reviewer: vieng (`vienggd`), author: ninja.

| Time | Event |
|---|---|
| 25 Nov 03:08:50 | PR #103 opened (contract only: docs, no test, no code) |
| 25 Nov 03:10:03 | vieng: **CHANGES_REQUESTED** |
| 25 Nov 03:10:20 | ninja replies: done in `beb05ae` (RED/GREEN plan added) |
| 25 Nov 03:11:35 | vieng: **APPROVED** |
| 25 Nov 03:11:40 | PR #103 merged into `lab7` |
| 25 Nov 03:15:14 | first test commit `1b9e604` (RED), 3 min 34 s **after** the contract merge |

vieng's review text (shortened): "Checked against the 4 TA answers and the Lab 7 rules. Answer 1: 15 = total of all items, 10+5 ok, 10+6 rejected, per-line 1-10 stays. Answer 2: 400 VALIDATION_ERROR, message and details as agreed. Answer 3: warning at 15 and + disabled. Answer 4: no order editing, N/A. [...] Needs change: the test plan does not say where the RED step runs; add a RED / GREEN plan and name where red.txt / green.txt are stored." After the fix: "Re-checked: section 5 RED/GREEN plan added."

## Answer Part B: Implementation and delivery

**Test set-up.** Real PostgreSQL (Vitest + Supertest, no mocks), Vitest for the cart, Playwright (phone and desktop) for the browser. Five new tests (TEST-L7-1..5):

| Test | Level | Input | Expected |
|---|---|---|---|
| TEST-L7-1 | API | Latte ×10 + Americano ×4 (14) | 201 |
| TEST-L7-2 | API | Latte ×10 + Americano ×5 (15) | 201 |
| TEST-L7-3 | API | (a) 10 + 6, (b) 8 + 8, also 10 + 10 (total 20) and 16 lines of 1; (c) one line of 11 | (a), (b): 400, the C-1 message, `details.total` = real sum, nothing saved; (c): 400 by the per-line rule |
| TEST-L7-4 | unit | cart at 14, then 15 | total never above 15, + refused at 15 |
| TEST-L7-5 | E2E | cart total 15 | warning visible, + disabled, Place order still works |

**RED (`1b9e604`, 25 Nov 10:15 +07).** Run on code identical to `main` `b71cdb2` (`git diff b71cdb2 --stat -- server/src client/src` = 0 lines). Excerpt of `evidence/red.txt`:

```
× TEST-L7-3 total 16 (10 + 6) is rejected ...   → expected 201 to be 400
× TEST-L7-3 total 16 (8 + 8) is rejected ...    → expected 201 to be 400
× TEST-L7-4 total never goes above 15 ...       → AssertionError: expected 19 to be 15
x TEST-L7-5 [phone] and [desktop]               → getByText(/at most 15 items in total/i) not found
```

They fail because the rule is missing, not because of a compile error. TEST-L7-1 and -2 (14 and 15 items) pass on old code by design: they protect the accepted range.

**Contract follow-up (`41031b7`).** With 15 items in total, 20 different lines can no longer be reached, so three old tests (TEST-F03-05, -18, -23) got reachable numbers. Agreed with vieng's side before the fix; no test deleted or weakened (impact.md section 3).

**GREEN (fix `7de5285`, 25 Nov 10:21 +07).** Server check (`server/src/orders/routes.ts`):

```ts
const MAX_ORDER_ITEMS = 15; // BR-01b
// ...
const total = items.reduce((n, i) => n + i.quantity, 0);
if (total > MAX_ORDER_ITEMS) {
  throw new AppError(400, "VALIDATION_ERROR", `An order can have at most ${MAX_ORDER_ITEMS} items in total`, {
    field: "lines", max: MAX_ORDER_ITEMS, total,
  });
}
```

Cart (`client/src/lib/cart.ts`): `MAX_ITEMS = 15`; `add` is refused at 15; `setQty` is capped by the other lines; `canAddFromMenu` and `atItemLimit` drive the disabled + and the warning in `MenuPage.tsx`. Excerpt of `evidence/green.txt`: server 37 passed (`orders.test.ts`), client 7 passed, TEST-L7-5 passed on phone and desktop.

**Regression (`evidence/regression.txt`).** Server **78**, client **7**, E2E **26** passed, 0 failed, 0 skipped (before the change: 71 and 6; orders, operator and auth suites: 58 passed). vieng ran `npm test` again on the PR head (78 and 7). Screenshots of the limit: `evidence/screenshots/L7-cart-limit-desktop.png`, `L7-cart-limit-phone.png`.

**PR review.** PR [#112](https://github.com/vienggd/Food-order/pull/112) (opened 25 Nov 03:21:20 UTC, merged 03:28:06 with a merge commit). vieng, APPROVED 03:28:02: "What I checked: commit order (RED 1b9e604, contract follow-up 41031b7, fix, then cleanup commits); red.txt shows only L7-3, L7-4, L7-5 failing on b71cdb2 code; I ran npm test on the latest head 93b2738: server 78 pass, client 7 pass. Fix returns 400 VALIDATION_ERROR with the agreed message and details; cart caps at 15, warns, disables +. Sprint 1 screenshots restored."

**Release, CI and live checks (done 28 Nov).**
- Release: PR #216 `lab7` → `main`, `main` `704a66b`, merged 28 Nov 00:13:46 +07. Before it, `lab7` merged the released Sprint 2 (PR #211, one conflict in `MenuPage.tsx`; I checked that the code diff against `main` is only C-1, build ok, server 184 and client 9 tests pass).
- CI on the release PR: `CI & Docker Build` run `46039698561`, success (npm test, build, Docker build; the first run `46039520267` was cancelled and re-run).
- Deployed revision: `food-order-00011-9nh`, Deploy demo run `46040158850`, success.
- Live checks on the deployed URL: all PASS, see Part D and `docs/labs/lab-07/evidence/live-checks.md`. Screenshots: `evidence/live/L2-order-18-placed.png`, `L4-cart-15-warning.png`, `L6-old-order-13.png`, `L7-staff-18-accepted.jpg`, `L8-bob-alice-order-404.jpg`.

## Answer Part C: Metrics

Snapshot **28 Nov 2026 08:45 (+07)**, after the release; window 24–29 Nov, data from `gh`. Full definitions, scope and source lists: `docs/labs/lab-07/metrics.md`.

| # | Metric | Value |
|---|---|---|
| M1 | Completed Issues | **63** (64 closed; #127 NOT_PLANNED) = 98 % |
| M2 | Merged PRs | **66** = 25 into `sprint2`, 22 into `lab6`, 13 into `lab7`, 6 into `main` |
| M3 | Tests | C-1 alone (`3c276b2`): server **78** / client **7** / E2E **26**, 0 failed, 0 skipped. With Sprint 2 merged (PR #211): server **184** / client **9** |
| M4 | UAT defect status | **9 of 9 accepted Lab 6 defects fixed, re-tested PASS and closed**; of the 3 deferred enhancements #130 is closed, #131 and #133 are still open |
| M5 | CI and deploy runs | **15 runs: 14 success, 0 failure, 1 cancelled (re-run, success)**; release PR #216 CI success; Deploy demo for `704a66b` success |

Interpretation: C-1 is released and verified: the release PR ran CI once (green), the deploy was green, live checks L1–L8 passed on `food-order-00011-9nh`, and no run failed in the window. Remaining risk: E2E is not part of CI, so the 26 E2E tests rest on local runs; #131 and #133 are open for Sprint 3. Action: add the E2E job to CI and schedule #131 and #133; owner vieng (CI), ninja (#131, #133).

## Answer Part D: Readiness and retrospective

Full checklist, rollback, defects, technical debt, verdict and retrospective: `docs/labs/lab-07/readiness.md` (vieng). Summary as of **28 Nov 2026 08:45 (+07)**, after the release and the live checks.

**Release checklist (readiness.md section 1)**

| # | Check | Status |
|---|---|---|
| 1 | Baseline green before the change (server 71, client 6) | done |
| 2 | Contract merged before any test or code (PR #103) | done |
| 3 | RED commit `1b9e604` before the fix `7de5285` | done |
| 4 | GREEN after the fix (`evidence/green.txt`) | done |
| 5 | Full regression: server 78, client 7, no test weakened | done |
| 6 | E2E: 26 passed, 0 failed, 0 skipped | done |
| 7 | CI | done: CI does not run on the staging PRs into `lab7`; on the release PR #216 run `46039698561` = success |
| 8 | Docs match (SRS, F-03 contract, SDS, traceability) | done |
| 9 | Migration | none needed (no schema change) |
| 10 | Old data: old orders still open normally | done |
| 11 | No secrets in the change | done |
| 12 | Every Lab 7 PR approved by the other side, merge commit | done |

**Rollback.** Code only, no migration, no data change. Run the `deploy` workflow manually with the full commit SHA of the previous good image (now the Sprint 2 release `df6db99`, revision `food-order-00010-7vp`), then check `/api/health`, `/api/ready` and the smoke test.

**Live checks after the deploy (readiness.md section 4; revision `food-order-00011-9nh`, 28 Nov 2026, +07; details in `evidence/live-checks.md`)**

| # | Check | Result | Time | Evidence |
|---|---|---|---|---|
| L1 | `/api/health` and `/api/ready` | PASS: ok; `{"status":"ready","db":"connected"}` | 28 Nov | response text |
| L2 | 15 items in total (Latte ×10 + Americano ×5) | PASS: 201, order #18 PLACED, total 92500 satang | 01:19:43 | `live/L2-order-18-placed.png`, `live/L2-L6-my-orders-list.png` |
| L3 | 16 items (10 + 6) | PASS: 400 `VALIDATION_ERROR`, "An order can have at most 15 items in total", details `{field:"lines",max:15,total:16}`; alice's orders 16 before and after | 00:52:18 | API response |
| L4 | Cart warns at 15 and disables every + | PASS: warning shown; all 6 Add buttons and cart + disabled | 01:19:39 | `live/L4-cart-15-menu.png`, `live/L4-cart-15-warning.png` |
| L5 | One line of 11 | PASS: 400 (`items.0.quantity`, max 10) | 00:52:18 | API response |
| L6 | Old order #13 (26 Nov) still lists and opens | PASS | 01:20:08 | `live/L6-old-order-13.png` |
| L7 | Staff accepts the 15-item order #18 | PASS: PLACED → ACCEPTED (`acceptedAt` 2026-11-28T01:39:21.738Z), toast "Order #18 accepted." | 08:39:21 | `live/L7-staff-queue-18-placed.jpg`, `live/L7-staff-accept-18-toast.jpg`, `live/L7-staff-18-accepted.jpg` |
| L8 | Access path | PASS: anonymous 401; alice on the staff queue 403 `FORBIDDEN` (00:52:08); bob on alice's order 404 `NOT_FOUND` (08:34:45) | see left | `live/L8-bob-alice-order-404.jpg` |

**Defects.** C-1: 0 defects found, also none in the live checks. Sprint 1 UAT findings: 9 of 9 accepted defects fixed, re-tested PASS and closed; 3 enhancements (#130, #131, #133) deferred to Sprint 3, of which #131 and #133 are still open (see Part C).

**Technical debt (readiness.md section 6).** The 15 limit is written twice (server and client), medium; CI does not start on staging-branch PRs, medium; BR-01b is now in the living docs (PR #211, #214), done; E2E screenshots overwrite the Sprint 1 PNGs, low.

**Verdict: READY and released** for the maintained scope (C-1 plus preserved Sprint 1 behaviour): release `704a66b` is deployed as `food-order-00011-9nh`, CI and Deploy demo are green, live checks L1–L8 PASS. Open: the TA answer on deploying to the Lab 5 URL (owner: vieng) and the Sprint 3 items below. Rollback target if ever needed: `df6db99` / `food-order-00010-7vp`.

**Retrospective (short).** Helped: reviewing the impact table and contract before any code caught the unreachable 20-line tests early. Hurt: a local E2E run overwrote the Sprint 1 screenshots (cleanup `8f6110f`), and CI does not start on staging branch PRs. Change for the final release: parameterize the screenshot folder and check `git status` for stray PNGs before every push.

## Contribution

| Work | Owner | Reviewer |
|---|---|---|
| Change request, impact, contract, RED/GREEN code, metrics, this report | ninja | vieng |
| Readiness, live-check evidence, reviews of all Lab 7 PRs | vieng | ninja |

## AI use

Both students used Claude (worker sessions) for drafts of the impact table, tests, code and this report. Every PR was reviewed and merged by the other student's side; the TA approval and decisions are the students'.

## Limitations

- Open items: the TA answer on deploying to the Lab 5 URL (owner: vieng); #131 and #133 (Sprint 3).
- CI did not run on the staging PRs into `lab7`, so their test evidence is from local runs; CI ran once on the release PR. E2E is not part of CI.
- Live-check results for L1, L3, L5 are API responses without a screenshot; the others have screenshots in `evidence/live/`.
- The 15-item cap makes the old 20-line limit unreachable (kept in the schema).
