# Lab 7 — Part C: metrics (team Est)

**Draft. Snapshot: 27 Nov 2026 04:00 (+07), data from `gh` (GitHub times are UTC). Final values are taken after the release to `main`.**
Window for all metrics: **24 Nov 2026 – 29 Nov 2026** (so far: 24–27 Nov, 04:00). Repo: `vienggd/Food-order`.

| # | Metric | Definition | Scope | Snapshot value | Source |
|---|---|---|---|---|---|
| M1 | Completed Issues | Issues closed with reason COMPLETED in the window | all Issues in the repo | **37** (38 closed, 1 of them NOT_PLANNED = #127 replaced, not counted) → 37 / 38 = 97 % of closed Issues completed | list S1 |
| M2 | Merged pull requests | PRs with a merge commit in the window, by base branch | all PRs | **44** = 17 into `sprint2`, 16 into `lab6`, 9 into `lab7`, 2 into `main` (#168 Lab 6 release, #181 Lab 6 release with the #132 fix) | list S2 |
| M3 | Test results on one commit | Server (Vitest, real Postgres), client (Vitest), E2E (Playwright, phone + desktop): passed / failed / skipped on `lab7` (last code change `3c276b2`; no code file changed after it, checked with `git diff 3c276b2 HEAD -- server client e2e` = empty) | whole repo | server **78 / 0 / 0**, client **7 / 0 / 0**, E2E **26 / 0 / 0** (before C-1 on `b71cdb2`: 71 and 6; E2E ran on `7de5285` by ninja and on `3c276b2` by vieng) | `docs/labs/lab-07/evidence/regression.txt`; readiness.md row 6 |
| M4 | UAT defect status | Partner-team UAT findings (Issues titled "UAT finding"): accepted defects fixed and re-tested PASS / accepted defects | findings opened 25 Nov (13 Issues #121–#133) | **9 of 9 accepted Lab 6 defects fixed and re-tested PASS** by EN-009_P3 (#121–#126, #128, #129, #132) = 100 %; **3 enhancements deferred to Sprint 3** (#130, #131, #133); #127 closed (split into #128–#133). Fixes: PR #138, in `main` since release `163fdb7` (#132 fix in `39bda5e`). The 12 finding Issues are still OPEN on GitHub (not closed yet) | list S3; `docs/labs/lab-06/` on `main` (report, retest-handoff, execution-partner); re-test result as reported by vieng's side |
| M5 | CI and deploy run outcomes | GitHub Actions runs created in the window, success / failure | all workflows | **4 runs: 4 success, 0 failure.** On `main`: Deploy demo `45860319259` for `163fdb7` and `45890211288` for `39bda5e`. On PRs into `main`: CI & Docker Build `45854432395` and `45889902392`. No run for `lab7` yet: CI starts only on PRs into `main` and `lab-5` | list S4 |

## Source lists (embedded)
- **S1** closed in window (COMPLETED, 37): #87, #88, #89, #90, #91, #92, #93, #94, #96, #97, #98, #99, #100, #104, #110, #117, #119, #135, #139, #141, #143, #145, #146, #148, #150, #152, #155, #157, #160, #162, #164, #166, #170, #171, #172, #177, #179; NOT_PLANNED: #127.
- **S2** merged PRs (44): into `sprint2` (17): #95, #102, #106, #113, #115, #116, #118, #120, #136, #137, #144, #147, #151, #154, #158, #169, #176; into `lab6` (16): #105, #107, #111, #138, #140, #149, #153, #156, #159, #161, #163, #165, #174, #175, #178, #180; into `lab7` (9): #103, #108, #109, #112, #114, #134, #142, #167, #173; into `main` (2): #168, #181.
- **S3** UAT findings: fixed and re-tested PASS (9): #121, #122, #123, #124, #125, #126, #128, #129, #132; deferred enhancements (3): #130, #131, #133; closed #127 (replaced by #128–#133).
- **S4** runs in the window (gh run list, UTC): 26 Nov 15:59 CI & Docker Build 45854432395 (PR into `main`, success); 26 Nov 16:36 Deploy demo 45860319259 on `main` `163fdb7` (success); 26 Nov 20:17 CI & Docker Build 45889902392 (PR into `main`, success); 26 Nov 20:19 Deploy demo 45890211288 on `main` `39bda5e` (success). Before the window: last run 22 Nov.

Reconcile: M2 = 17 + 16 + 9 + 2 = 44; M1 37 + 1 = 38 closed; M4 = 9 + 3 + 1 (#127) = 13 Issues; M5 = 2 CI + 2 deploy = 4.

## Interpretation (≤100 words)
Problem: all 9 accepted Lab 6 defects are fixed and re-tested PASS, and CI plus both deploys on `main` were green. The weak spot is that CI has not run on `lab7` yet and the Lab 7 change (C-1) is not in `main`: until the release PR runs CI and the live checks pass, C-1 rests on local runs (78 / 7 / 26, no failures). Also the 12 finding Issues are still open on GitHub, so the numbers and the board disagree. Action: release `lab7` soon, run the live checks, and close or label the finding Issues. Owner: vieng (ninja prepares the live checks and final numbers).
