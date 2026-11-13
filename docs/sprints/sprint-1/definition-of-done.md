# Product Definition of Done — Sprint 1

Applies to every Sprint 1 feature (F-01..F-04) and to the Sprint 1 release. A feature is **Done** only when every line below is true **and shown by evidence** (a test run, a commit, a PR, a screenshot) — not because someone (or an AI agent) says so.

## Feature is Done when

| # | Check | Evidence |
|---|---|---|
| 1 | Contract (this folder) was committed **before** the feature code, and any later change is in its version history with a reason | Git history: contract commit date < first code commit |
| 2 | Every behaviour in the contract is implemented (API, data, UI), or the gap is listed as known incomplete work | Contract vs code review in the PR |
| 3 | Every acceptance criterion has at least one planned test in the contract's test specification | Test spec table |
| 4 | Rule work used TDD: the test failed first, then passed after the code | `[red]` / `[green]` commits + `docs/evidence/tdd/<feature>-red.txt` and `-green.txt` |
| 5 | All automated tests pass (`npm test`; E2E for the feature when its screens exist); none are skipped, disabled or weakened to pass | Test output in the PR description |
| 6 | Access is enforced on the server: 401 without a session, 403 for the wrong role, 404 for another user's record | API tests |
| 7 | Errors use `{ error: { code, message, details } }`; no stack traces or secrets in responses, logs or Git | API tests + review |
| 8 | Code builds and type-checks (`npm run build`) | Build output |
| 9 | A PR into `sprint-1` with "Closes #n", linked to its Issue (branch + PR in "Development"), reviewed and **approved by the partner** with a specific comment, merged with a merge commit by the partner | GitHub PR page |
| 10 | README, `.env.example` and docs are up to date with any new command, variable or decision | PR diff |
| 11 | Board card moved through every column to Done; Issue closed with a comment | Project board |

## Sprint 1 release is Done when

| # | Check | Evidence |
|---|---|---|
| R1 | F-01..F-04 and Docs A–D are Done (above) | Board, closed Issues |
| R2 | On `sprint-1`: fresh install → migrate → seed → `npm test` and `npm run test:e2e` pass; build passes | Saved output with the tested commit id |
| R3 | Traceability: every Sprint 1 AC maps to a test ID, test file/name and result | `docs/traceability.md` + `docs/evidence/ac-results.md` (generated) |
| R4 | Both students rechecked everything on `sprint-1` and agree it is done | Chat / PR comment from both |
| R5 | vieng decides the merge into `main` and the tag `v0.1.0-sprint1` (AIs do not do this on their own) | Release PR + tag |
| R6 | Known incomplete work and any failed or skipped test are written down | Part F of the PDF |

## Version history

| Date | Version | Change | Why |
|---|---|---|---|
| 6 Nov 2026 | 1 | First version | Sprint 1 contracts |
| 6 Nov 2026 | 1.1 | R3 also points to the generated per-AC results file | Recheck #38 |
