# Lab 7 — Part C: metrics (team Est)

**Draft. Snapshot: 26 Nov 2026 17:45 (+07), data from `gh` (GitHub times are UTC). Final values are taken after the release to `main`.**
Window for all metrics: **24 Nov 2026 – 29 Nov 2026** (so far: 24–26 Nov, 17:45). Repo: `vienggd/Food-order`.

| # | Metric | Definition | Scope | Snapshot value | Source |
|---|---|---|---|---|---|
| M1 | Completed Issues | Issues closed with reason COMPLETED in the window | all Issues in the repo | **25** (26 closed, 1 of them NOT_PLANNED = #127 replaced, not counted) → 25 / 26 = 96 % of closed Issues completed | list S1 |
| M2 | Merged pull requests | PRs with a merge commit in the window, by base branch | all PRs | **28** = 14 into `sprint2`, 7 into `lab7`, 7 into `lab6`; 0 into `main` | list S2 |
| M3 | Test results on one commit | Server (Vitest, real Postgres), client (Vitest), E2E (Playwright, phone + desktop): passed / failed / skipped on `lab7` (last code change `3c276b2`; no code file changed after it, checked with `git diff 3c276b2 HEAD -- server client e2e` = empty) | whole repo | server **78 / 0 / 0**, client **7 / 0 / 0**, E2E **26 / 0 / 0** (before C-1 on `b71cdb2`: 71 and 6; E2E ran on `7de5285` by ninja and on `3c276b2` by vieng) | `docs/labs/lab-07/evidence/regression.txt`; readiness.md row 6 |
| M4 | UAT defect status | Partner-team UAT findings (Issues titled "UAT finding", label `lab6`): open / total | findings opened 25 Nov | **12 open of 13** = 92 % open (1 closed: #127 split into #128–#133); 0 fixed yet (fixes are in PR #138, merged into `lab6`, not yet in `main`) | list S3 |
| M5 | CI run outcomes | GitHub Actions runs created in the window, success / failure | all workflows | **0 runs** (0 success, 0 failure). Last run was 22 Nov. CI starts only on PRs into `main` and `lab-5`, not on `lab6`, `lab7`, `sprint2` | list S4 |

## Source lists (embedded)
- **S1** closed in window (COMPLETED, 25): #87, #88, #89, #90, #92, #93, #94, #96, #97, #98, #99, #100, #104, #110, #117, #119, #135, #139, #141, #143, #145, #146, #148, #150, #152; NOT_PLANNED: #127.
- **S2** merged PRs (28): into `sprint2` (14): #95, #102, #106, #113, #115, #116, #118, #120, #136, #137, #144, #147, #151, #154; into `lab7` (7): #103, #108, #109, #112, #114, #134, #142; into `lab6` (7): #105, #107, #111, #138, #140, #149, #153.
- **S3** UAT findings: open #121, #122, #123, #124, #125, #126, #128, #129, #130, #131, #132, #133; closed #127 (replaced by #128–#133).
- **S4** no runs after 22 Nov (last: run 45047616776, CI & Docker Build, success, 22 Nov).

Reconcile: M2 = 14 + 7 + 7 = 28; M4 = 12 open + 1 closed = 13; M1 25 + 1 = 26 closed.

## Interpretation (≤100 words)
Problem: 12 partner findings are still open and no CI ran this week, because CI only starts on PRs into `main`. So the first automatic test run for Lab 7 will be the release PR, late, and a failure there would be a surprise. Local runs (78 / 7 / 26, no failures) reduce the risk. Action: triage the 12 findings and open the release PR early so CI runs once before the deadline. Owner: vieng (ninja prepares the live checks and final numbers).
