# Lab 7 — Part C: metrics (team Est)

**Draft. Snapshot: 26 Nov 2026 13:45 (+07), data from `gh` (GitHub times are UTC). Final values are taken after the release to `main`.**
Window for all metrics: **24 Nov 2026 – 29 Nov 2026** (so far: 24–26 Nov). Repo: `vienggd/Food-order`.

| # | Metric | Definition | Scope | Snapshot value | Source |
|---|---|---|---|---|---|
| M1 | Completed Issues | Issues closed with reason COMPLETED in the window | all Issues in the repo | **14** (15 closed, 1 of them NOT_PLANNED = #127 replaced, not counted) → 14 / 15 = 93 % of closed Issues completed | list S1 |
| M2 | Merged pull requests | PRs with a merge commit in the window, by base branch | all PRs | **16** = 8 into `sprint2`, 5 into `lab7`, 3 into `lab6`; 0 into `main` | list S2 |
| M3 | Test results on one commit | Server (Vitest, real Postgres), client (Vitest), E2E (Playwright, phone + desktop): passed / failed / skipped on `lab7` head `3c276b2` | whole repo | server **78 / 0 / 0**, client **7 / 0 / 0**, E2E **26 / 0 / 0** (before C-1 on `b71cdb2`: 71 and 6; E2E ran on `7de5285` by ninja and on `3c276b2` by vieng) | `docs/labs/lab-07/evidence/regression.txt`; readiness.md row 6 |
| M4 | UAT defect status | Partner-team UAT findings (Issues titled "UAT finding", label `lab6`): open / total | findings opened 25 Nov | **12 open of 13** = 92 % open (1 closed: #127 split into #128–#133); 0 fixed yet | list S3 |
| M5 | CI run outcomes | GitHub Actions runs created in the window, success / failure | all workflows | **0 runs** (0 success, 0 failure). Last run was 22 Nov. CI starts only on PRs into `main` and `lab-5`, not on `lab6`, `lab7`, `sprint2` | list S4 |

## Source lists (embedded)
- **S1** closed in window (COMPLETED): #117, #110, #104, #99, #98, #97, #96, #94, #93, #92, #90, #89, #88, #87 (14); NOT_PLANNED: #127.
- **S2** merged PRs: into `sprint2`: #120, #118, #116, #115, #113, #106, #102, #95; into `lab7`: #114, #112, #109, #108, #103; into `lab6`: #111, #107, #105.
- **S3** UAT findings: open #121, #122, #123, #124, #125, #126, #128, #129, #130, #131, #132, #133; closed #127 (replaced by #128–#133).
- **S4** no runs after 22 Nov (last: run 45047616776, CI & Docker Build, success, 22 Nov).

Reconcile: M2 = 8 + 5 + 3 = 16; M4 = 12 open + 1 closed = 13; M1 14 + 1 = 15 closed.

## Interpretation (≤100 words)
Problem: 12 partner findings are still open and no CI ran this week, because CI only starts on PRs into `main`. So the first automatic test run for Lab 7 will be the release PR, late, and a failure there would be a surprise. Local runs (78 / 7 / 26, no failures) reduce the risk. Action: triage the 12 findings and open the release PR early so CI runs once before the deadline. Owner: vieng (ninja prepares the live checks and final numbers).
