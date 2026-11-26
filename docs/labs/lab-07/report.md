# Lab 7 — Maintenance change C-1: at most 15 items per order

CPE 334 · Semester 1/2026 · Section 131 · group **Est** · Campus Café Pre-order (Food-order).
**DRAFT.** Parts A–C are filled with the evidence that exists on 26 Nov. Items marked PENDING are not done yet (release to `main`, CI run on `main`, deployed revision, live checks, final metrics). They must be filled before submission.

## Contents

| Part | Title | Points | Where |
|---|---|---|---|
| A | Change impact and contract | 25 | Issue [#96](https://github.com/vienggd/Food-order/issues/96), `docs/labs/lab-07/impact.md`, PR [#103](https://github.com/vienggd/Food-order/pull/103) |
| B | Implementation and regression-safe delivery | 50 | PR [#112](https://github.com/vienggd/Food-order/pull/112), `evidence/red.txt`, `green.txt`, `regression.txt`; live checks PENDING |
| C | Metrics | 15 | `docs/labs/lab-07/metrics.md` (snapshot 26 Nov 17:45; final values PENDING) |
| D | Readiness and retrospective | 10 | `docs/labs/lab-07/readiness.md` (verdict NOT READY until release and live checks) |

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
| Release to `main` | PENDING | PENDING | PENDING (heads decide, after the TA answer) |
| Deployed revision | PENDING | PENDING | PENDING |
| Later-sprint changes | Sprint 2 and Lab 6 fixes arrive in `main` before this release; BR-01b is ported into the living docs in the release PR | | PENDING |

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

**Not done yet (PENDING).**
- Release of `lab7` to `main`: PENDING (heads decide, after the TA answer; Sprint 2 and Lab 6 fixes merge first).
- CI run on the `main` release PR: PENDING (no CI runs on `lab7` PRs; workflows start on PRs into `main`).
- Deployed revision: PENDING.
- Live checks on the deployed URL (15 items accepted, 16 refused with 400, cart blocks the 16th, customer still gets 403 on the staff queue): PENDING.

## Answer Part C: Metrics

Snapshot **27 Nov 2026 04:00 (+07)**, window 24–29 Nov, data from `gh`. Full definitions, scope and source lists: `docs/labs/lab-07/metrics.md`.

| # | Metric | Snapshot value |
|---|---|---|
| M1 | Completed Issues | **37** (38 closed; #127 NOT_PLANNED) = 97 % |
| M2 | Merged PRs | **44** = 17 into `sprint2`, 16 into `lab6`, 9 into `lab7`, 2 into `main` |
| M3 | Tests on `lab7` | server **78** / client **7** / E2E **26**; 0 failed, 0 skipped |
| M4 | UAT defect status | **9 of 9 accepted Lab 6 defects fixed and re-tested PASS** (#121–#126, #128, #129, #132); 3 enhancements deferred to Sprint 3 (#130, #131, #133); the 12 finding Issues are still open on GitHub |
| M5 | CI and deploy runs | **4 success, 0 failure**: Deploy demo `45860319259` (`163fdb7`) and `45890211288` (`39bda5e`) on `main`, plus 2 CI runs on PRs into `main`; none for `lab7` yet |

Interpretation: the 9 accepted Lab 6 defects are fixed and re-tested, and CI plus both `main` deploys were green; but CI has not run on `lab7` yet and C-1 is not in `main`, so C-1 rests on local runs (78 / 7 / 26) until the release PR. Action: release `lab7`, run the live checks, close or label the 12 finding Issues; owner vieng. Final values: PENDING (after the Lab 7 release).

## Answer Part D: Readiness and retrospective

Checklist, rollback, defects, technical debt, verdict and retrospective: `docs/labs/lab-07/readiness.md` (vieng). Current verdict: NOT READY until the release, deploy and live checks are done.

## Contribution

| Work | Owner | Reviewer |
|---|---|---|
| Change request, impact, contract, RED/GREEN code, metrics, this report | ninja | vieng |
| Readiness, live-check evidence, reviews of all Lab 7 PRs | vieng | ninja |

## AI use

Both students used Claude (worker sessions) for drafts of the impact table, tests, code and this report. Every PR was reviewed and merged by the other student's side; the TA approval and decisions are the students'.

## Limitations

- Release, CI run on `main`, deploy and live checks are not done yet (PENDING above).
- CI did not run on staging branch PRs, so test evidence is from local runs.
- The 15-item cap makes the old 20-line limit unreachable (kept in the schema).
