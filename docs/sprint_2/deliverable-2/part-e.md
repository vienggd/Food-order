# Deliverable 2, Part E: Engineering process, collaboration, and reflection

Campus Café Pre-order — Team **Est** (`vienggd/Food-order`). Author: **vieng** (`vienggd`), Issue **#192**.

## E.1 Contract-before-code & TDD workflow in Sprint 2 / Sprint 3

Both students enforced strict **contract before code** and **red-before-green TDD** on every Sprint 2 and implemented Sprint 3 feature. Engineering contracts (`docs/sprint_2/sprints/F-05..F-12.md`) were reviewed and merged into `sprint2` before any application code or migration touched a feature branch.

| Feature | Contract PR | RED evidence (`docs/sprint_2/evidence/tdd/`) | GREEN evidence (`docs/sprint_2/evidence/tdd/`) | Result |
|---|---|---|---|---|
| `F-05` Menu admin | `#95` (Issue `#88`) | `F-05-red.txt` (`12 failed` on `menu-management.test.ts`) | `F-05-green.txt` (`14/14` API tests pass) | Merged `#113` |
| `F-06` Cancel & reject | `#102` (Issue `#97`) | `F-06-red.txt` (`13 failed`), `F-06-ui-red.txt` (`10 failed`) | `F-06-green.txt` (`112` server), `F-06-ui-green.txt` (`44` E2E) | Merged `#120`, `#144` |
| `F-07` Fulfilment | `#102` (Issue `#97`) | `F-07-red.txt` (`14 failed`), `F-07-ui-red.txt` (`8 failed`) | `F-07-green.txt` (`132` server), `F-07-ui-green.txt` (`52` E2E) | Merged `#144` |
| `F-08` Payment + `BR-16` + `BR-15` | `#95` (Issue `#89`) | `F-08-red.txt` (`9 failed`), `F-08-br16-red.txt` (`3 failed`), `F-08-br15-red.txt` (`2 failed`) | `F-08-green.txt` (`11`), `F-08-br16-green.txt` (`16`), `F-08-br15-green.txt` (`154` server, `56` E2E) | Merged `#115`, `#136`, `#154` |
| `F-09` Pickup slots & cut-off | `#118` | `F-09-red.txt` (failed loading missing `slots.js`) | `F-09-green.txt` (`131` server incl. `14` slot tests, `8` client, `34` E2E) | Merged `#147` |
| `F-11` Order search & filter | `#118` | `F-11-red.txt` (`5 failed`), `F-11-operator-red.txt` (`8 failed`), `F-11-operator-ui-red.txt` (`2 failed`) | `F-11-green.txt` (`138` server), `F-11-operator-green.txt` (`163` server), `F-11-operator-ui-green.txt` (`58` E2E) | Merged `#151`, `#158` |

## E.2 GitHub board workflow, reviews, and merge discipline

- **Staging & protected `main`:** All Sprint 2/3 feature work merges into staging `sprint2` using **normal merge commits** (`gh pr merge --merge`, never squash) so contract commits, RED test commits, and GREEN implementation commits remain intact in history.
- **No self-approvals:** Every PR is reviewed by the partner (`vienggd` or `NinjoMUDA`) with an explicit `"What I checked: ..."` review comment verifying `npm run build`, server/client Vitest, and Playwright E2E locally against Postgres before merging. Reviews caught real bugs prior to merge (e.g., `PR #144` and `PR #147` caught Playwright runs overwriting Sprint 1 screenshots -> `CHANGES_REQUESTED`, restored before approval; `TEST-F11-12` caught unescaped SQL `LIKE` wildcards `%`/`_` in Prisma search -> fixed before green merge `#158`).
- **Project Board 4 & linking:** Every Issue starts in `Backlog`, transitions in order (`Backlog -> Specified -> Started -> PR Review -> Fixing (when needed) -> Done`), creates its branch with `gh issue develop --base sprint2`, and links its closing PR via GitHub GraphQL `addCloseIssueReferences` (since GitHub closing keywords only auto-link on the default branch `main`). Wait note: Issue `#157` was linked to `PR #158` via `addCloseIssueReferences` cleanly, though its branch had been created before the Issue was opened (logged as a minor process gap in Part D).

## E.3 Team contributions (Sprint 1 -> Deliverable 2 draft)

| Work area | `vieng` (Garunyapas Danpitakkul, `vienggd`) | `ninja` (Dechayut Panyawutvorakul, `NinjoMUDA`) |
|---|---|---|
| **Sprint 1** | `F-01` Auth, `F-04` Accept Queue, `srs.md`, `F-01/F-04` E2E, `PR #46` release (`v0.1.0-sprint1`) | `F-02` Menu, `F-03` Orders, `features.md` / `traceability.md`, SDS schema/API, `F-02/F-03` E2E |
| **Lab 5 & Lab 6** | Cloud Run + Cloud SQL CI/CD, Lab 6 test plan/triage/fixes (`#121–#126, #128, #129, #132`), `PR #168/#181` | Reviewed release PRs, Lab 6 Part B UAT execution on partner app (`EN-009_P3#126` Accepted), `#141–#148` |
| **Sprint 2** | Schema S2-1 (`#95`), `F-05` Menu Admin, `F-08` Payment + `BR-16` + `BR-15` (`#115, #136, #154`), `#132` port (`#176`) | `F-06` Cancel & Reject (`#120, #144`), `F-07` Fulfilment (`#144`), reviewed all `vieng` PRs |
| **Sprint 3 & D2** | `F-10` & `F-12` (rate limit) contracts (`#106`), `main -> sprint2` sync (`#191`), D2 Parts A, B, E + `@2x` screenshots + PDF generator (`#192`) | `F-09` & `F-11` contracts (`#118`), `F-09` cut-off/slots (`#147`), `F-11` filter/search (`#151, #158`), D2 Parts C & D + living docs v3 (`#190`) |

## E.4 AI-use declaration

Both students used AI coding assistants (Claude Code sessions for `ninja` and `vieng`, plus Antigravity with Playwright browser tools for `vieng` during Lab 6 verification and Deliverable 2 drafting) strictly for drafting specs, test suites, implementation code, code-review checklists, and markdown assembly. Every change flowed through GitHub PRs reviewed and approved by the partner's side; no secrets, tokens, or `SEED_PASSWORD` values were stored in commits, Issues, or PDFs.

## E.5 Known limitations and plan confirmation

1. **Unimplemented Sprint 3 scope:** `F-10` Sales Summary (`AC-10.1..10.9`), `F-12` login rate limiting (`NFR-08`, `AC-12.1..12.8`) & axe/keyboard checks (`NFR-09`), and `F-09` picker E2E (`TEST-F09-15..17`) remain specified and scheduled in **Part C §5** (`29–30 Nov`).
2. **Sprint 2 release to `main` (`v0.2.0-sprint2`) PENDING:** Intentionally held on staging `sprint2` so `main` (`39bda5e`, `food-order-00009-jd9`) remains clean for EN-009_P3 final Lab 6 sign-off; once signed off, `sprint2 -> main` will deploy all Sprint 2 + `F-09`/`F-11` changes together.
3. **Desktop Queue vs UI Spec S8:** Currently ships the 7-column semantic table (`Order | Status | Customer | Items | Placed | Total | Action`); team decision on keeping the semantic table or building the S8 card board is scheduled for `29 Nov`.
4. **Confirmed remaining schedule:** We confirm the **Part C §5** schedule (`vieng`: `F-10` + `F-12` rate limit `29–30 Nov`; `ninja`: `F-09` E2E + `NFR-09` axe `30 Nov`; final UAT/regression `12–13 Dec`; exam window `1–11 Dec` protected).
