# Sprint 1 engineering history

Commit ids and times come from `git log` (time zone +07:00, 6 Nov 2026). Full history: `git log --graph sprint-1`.

## Contract → failing test → code

For each feature the contract (design, AC, test spec) was committed first, then the tests failing (`[red]`, output saved), then the code that made them pass (`[green]`, output saved).

| Feature | Contract `[spec]` | Tests fail `[red]` | Code passes `[green]` | Saved output |
|---|---|---|---|---|
| F-01 Login (vieng) | `e187cf8` 03:35 | `d0d4eb9` 03:38 — 11 failed | `eebaf41` 03:39 — 11 passed | `tdd/F-01-red.txt`, `tdd/F-01-green.txt` |
| F-02 Menu (ninja) | `6e25979` 03:35 | `3376cd3` 03:45 — 6 failed | `2816f63` 03:46 — 6 passed | `tdd/F-02-red.txt`, `tdd/F-02-green.txt` |
| F-03 Orders (ninja) | `3178514` 03:36 | `e922626` 03:50 — 29 failed | `13a2651` 03:57 — 29 passed | `tdd/F-03-red.txt`, `tdd/F-03-green.txt` |
| F-04 Accept (vieng) | `92470d8` 03:37 | `463f459` 03:46 — 10 failed | `f729818` 03:48 — 10 passed | `tdd/F-04-red.txt`, `tdd/F-04-green.txt` |

Client logic was done the same way: `formatBaht` (F-02) and the cart reducer (F-03) each have red and green output in `docs/evidence/tdd/`.

## Issues, branches, pull requests and reviews

Every feature and document has an Issue, a branch made from the Issue (`gh issue develop`), and a PR into the staging branch `sprint-1`. The other student reviewed, approved with a written check, and merged with a merge commit.

| Issue | Branch | PR | Author | Approved + merged by |
|---|---|---|---|---|
| #1 Setup | `feature/setup-skeleton` | #18 | vieng | ninja |
| #2 F-01 Login | `feature/F-01-auth` | #22 | vieng | ninja |
| #3 F-02 Menu | `feature/F-02-menu` | #23 | ninja | vieng |
| #4 F-03 Orders | `feature/F-03-orders` | #26 | ninja | vieng |
| #5 F-04 Accept | `feature/F-04-accept` | #24 | vieng | ninja |
| #6 Doc A SRS | `docs/A-srs` | #19 | vieng | ninja |
| #7 Doc B Features + traceability | `docs/B-features-traceability` | #17 | ninja | vieng |
| #28 Doc B traceability AC/test columns | `docs/B-traceability-tests` | #29 | ninja | vieng |
| #8 Doc C System SDS | `docs/C-system-sds`, `docs/C-sds-data-api` | #20, #21 | vieng (#20), ninja (#21) | ninja (#20), vieng (#21) |
| #9 Doc D Sprint plan | `docs/D-sprint-plan` | #16 | ninja | vieng |
| #10 E2E tests | `feature/e2e-tests`, `feature/F-03-e2e` | #25, #27 | vieng (#25), ninja (#27) | ninja (#25), vieng (#27) |
| #11 Evidence | `docs/sprint-1-evidence` | this PR | vieng | ninja |

Examples of substantive review findings that led to changes:
- #18 (ninja): tests failed if `db:migrate` was skipped → `postinstall: prisma generate` added (`bd502d0`), reply on the PR.
- F-04 branch (ninja, in chat before the PR): Vite cache folder was committed → removed and ignored (`a640b6a`).
- #26 (vieng): code comment style `ponytail:` → `shortcut:`; renamed in #27.

## Known exceptions

All of these happened during setup (6 Nov, 02:18–02:48), before the review rule and branch protection were in use, and touch documents only — no application code. Every PR from #16 on was reviewed and approved by the other student.
- PR #13 (final UI design, into `sprint-1`) was merged by its author without a review, before `sprint-1` was protected.
- PR #15 (CLAUDE.md link command, into `main`) was merged by its author without a review.
- Direct pushes by the repo owner that skipped a PR: `5f85976` (UI wireframes, README, .gitignore) and `810c7e3` (CLAUDE.md) to `main` before it was protected; `2797462` (PLAN.md, review rule) to `main` with the owner bypass; `d92baf0` (merge of `main` into `sprint-1` to start the sprint from the same docs) with the owner bypass.
- `feature/F-03-e2e` is linked to #10 through PR #27; the branch itself still needs linking under "Development" on the website (GitHub does not allow linking an existing branch by command).
