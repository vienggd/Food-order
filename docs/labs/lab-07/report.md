# Lab 7 — Maintenance change C-1: at most 15 items per order

CPE 334 · Semester 1/2026 · Section 131 · group **Est** · Campus Café Pre-order (Food-order).
**DRAFT SKELETON.** Items marked PENDING are not done yet (release to `main`, deploy, live checks, final metrics). They must be filled before submission.

## Contents

| Part | Title | Points | Where |
|---|---|---|---|
| A | Change impact and contract | 25 | Issue [#96](https://github.com/vienggd/Food-order/issues/96), `docs/labs/lab-07/impact.md`, PR [#103](https://github.com/vienggd/Food-order/pull/103) |
| B | Implementation and regression-safe delivery | 50 | PR [#112](https://github.com/vienggd/Food-order/pull/112), `evidence/red.txt`, `green.txt`, `regression.txt`; live checks PENDING |
| C | Metrics | 15 | `docs/labs/lab-07/metrics.md` (snapshot 26 Nov; final values PENDING) |
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
| Version accepted in Lab 6 | PENDING (Lab 6 fixes) | PENDING | PENDING |
| Actual pre-change commit | `main` after Lab 5 | `b71cdb2` | done |
| Contract | contract PR #103 merged into `lab7` | `9d976df` | done 25 Nov |
| Test commit (RED) | TEST-L7-1..5 + `red.txt` | `1b9e604` | done 25 Nov |
| Contract follow-up | 20 lines no longer reachable | `41031b7` | done 25 Nov |
| Fix commit | C-1 server check + cart | `7de5285` | done 25 Nov |
| Release to `main` | PENDING | PENDING | PENDING (heads decide, after the TA answer) |
| Deployed revision | PENDING | PENDING | PENDING |
| Later-sprint changes | Sprint 2 and Lab 6 fixes arrive in `main` before this release; BR-01b is ported into the living docs in the release PR | | PENDING |

## Answer Part A: Change impact and contract

- Change request: Issue [#96](https://github.com/vienggd/Food-order/issues/96). Old rule BR-01: quantity 1–10 per line. New rule BR-01b: at most 15 items in total per order. Approved by **TA Prapatsorn Sangrod, 25 Nov 2026** (screenshots in `docs/labs/lab-07/evidence/ta-approval-1.png`, `-2.png`).
- Impact table, N/A reasons, what stays unchanged and the tests that protect it: `docs/labs/lab-07/impact.md`.
- Revised SRS BR-01, F-03 contract (BR-01b, AC-L7-01..04, TEST-L7-1..5) and traceability were reviewed and merged by vieng's side in PR #103 **before** any test or code commit.

## Answer Part B: Implementation and delivery

- RED: `docs/labs/lab-07/evidence/red.txt` — on code identical to `b71cdb2`, TEST-L7-3 (16 items), TEST-L7-4 and TEST-L7-5 fail because the rule is missing; TEST-L7-1 and -2 pass by design.
- GREEN: `evidence/green.txt` — all TEST-L7-1..5 pass after the fix (`7de5285`).
- Regression: `evidence/regression.txt` — server 78 / client 7 / E2E 26 passed, 0 failed, 0 skipped (before: 71 / 6). Three old tests got reachable numbers (20 lines are impossible now); see impact.md section 3.
- PR [#112](https://github.com/vienggd/Food-order/pull/112) reviewed by the other side, merged with a merge commit. CI: no CI runs on `lab7` PRs; the release PR runs it. PENDING
- Live checks on the deployed URL (15 items accepted, 16 refused with 400, cart blocks the 16th, customer still gets 403 on the staff queue): PENDING until the release is deployed.

## Answer Part C: Metrics

Snapshot 26 Nov 2026 13:45 (+07). Full definitions, scope, window and source lists: `docs/labs/lab-07/metrics.md`. Final values: PENDING (after the release).

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

- Release, deploy and live checks are not done yet (PENDING above).
- CI did not run on staging branch PRs, so test evidence is from local runs.
- The 15-item cap makes the old 20-line limit unreachable (kept in the schema).
