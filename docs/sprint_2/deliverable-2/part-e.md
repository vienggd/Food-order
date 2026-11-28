# Deliverable 2, Part E: Integrated release candidate, readiness, process and reflection

Campus Café Pre-order — Team **Est** (`vienggd/Food-order`). Author: **vieng** (`vienggd`), Issue **#192**.

## E.0 Integrated release candidate, deployment and readiness (rubric Part E)

**Candidate on `main`.** The submitted candidate integrates Sprint 1 (`v0.1.0-sprint1`), the Lab 6 fixes (`39bda5e`), Sprint 2 with early Sprint 3 F-09/F-11 (`v0.2.0-sprint2` = `df6db99`) and the Lab 7 change C-1 (`704a66b`). It is tagged **`v0.3.0-rc1`** on the report commit.

| Step | Evidence | Result |
|---|---|---|
| Sprint 2 release PR `#210` (`sprint2` → `main`) | reviewed + merged by `NinjoMUDA`, CI `test-and-docker` | SUCCESS → `df6db99`, tag `v0.2.0-sprint2` |
| Deploy Sprint 2 | GitHub Actions *Deploy demo* run `46037590468` | SUCCESS → Cloud Run `food-order-00010-7vp`, `/api/ready` ready + db connected |
| Lab 7 release PR `#216` (`lab7` → `main`, after merging released `main` into `lab7` in `#211`) | CI `test-and-docker` | SUCCESS → `704a66b` |
| Deploy Lab 7 | *Deploy demo* run `46040158850` | SUCCESS → Cloud Run `food-order-00011-9nh` (bundle `index-CDaqMZLn.js`) |
| Build + full suite on the integrated `lab7` head before release | `npm run build`; `npm test` (real Postgres) | build OK; server **184/184**, client **9/9** pass, 0 failed, 0 skipped |
| Post-deploy checks, no login (28 Nov 00:21 UTC+7) | `curl` on the live URL | `/api/health` `{ok:true}`; `/api/ready` ready + db connected; anonymous `GET /api/orders`, `GET /api/operator/orders`, `POST /api/orders` → **401** |
| Post-deploy critical journey + persistence (signed in by hand, screenshots) | Lab 7 live checks L2–L8 | **PASS**, 28 Nov on `food-order-00011-9nh` (ninja signed in by hand, AI clicked; screenshots in `docs/labs/lab-07/evidence/live/`): L2 alice places 15 items → order #18 PLACED ฿925.00; L3 10 + 6 → 400 C-1 message, no order saved; L4 cart warns at 15 and disables +; L5 one line ×11 → 400 (max 10 per line); L6 order #13 from 26 Nov still lists and opens (persistence across releases); L7 staff accepts #18 (PLACED → ACCEPTED); L8 alice → operator API 403, bob → alice's #18 404 |

**Cross-feature checks.** The C-1 total (max 15 items) runs in the same handler as the Sprint 2 slot picker (F-09) and payment (F-08): TEST-L7-1..5 and the F-08/F-09 suites pass together on the merged head; the MenuPage merge kept both the 15-item warning and the slot picker (#211).

**Readiness review (28 Nov).** READY as a release candidate for the delivered scope: Sprint 1 + Sprint 2 complete and verified, F-09/F-11 implemented and tested, Lab 6 defects closed and accepted by EN-009_P3, Lab 7 C-1 live. Not yet in the candidate (disclosed, owners and dates in Part C §5): F-10 sales summary (vieng; implemented and tested on `sprint3`, PR #221) and F-12 login rate limit (vieng; PR #223 in review), F-09 picker E2E TEST-F09-15..17 and NFR-09 accessibility checks (ninja), deferred Lab 6 enhancements `#131/#133` (`#130` is fixed and closed). Setup and reproduction: Part B §B.1. Final release `v1.0.0`, UAT re-test and the ≤ 4-minute video by 13 Dec (Part C §5).

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
- **Project Board 4 & linking:** Every Issue starts in `Backlog`, transitions in order (`Backlog -> Specified -> Started -> PR Review -> Fixing (when needed) -> Done`), creates its branch with `gh issue develop --base sprint2`, and links its closing PR via GitHub GraphQL `addCloseIssueReferences` (since GitHub closing keywords only auto-link on the default branch `main`). Process note: Issue `#157` was linked to `PR #158` via `addCloseIssueReferences` cleanly, though its branch had been created before the Issue was opened (logged as a minor process gap in Part D).

## E.3 Team contributions (Sprint 1 -> Deliverable 2)

| Work area | `vieng` (Garunyapas Danpitakkul, `vienggd`) | `ninja` (Dechayut Panyawutvorakul, `NinjoMUDA`) |
|---|---|---|
| **Sprint 1** | `F-01` Auth, `F-04` Accept Queue, `srs.md`, `F-01/F-04` E2E, `PR #46` release (`v0.1.0-sprint1`) | `F-02` Menu, `F-03` Orders, `features.md` / `traceability.md`, SDS schema/API, `F-02/F-03` E2E |
| **Lab 5 & Lab 6** | Cloud Run + Cloud SQL CI/CD, Lab 6 test plan, UAT cases and handoff, triage and RED→GREEN fixes (`#121–#126, #128, #129, #132`), releases `PR #168/#181`, Part B runs `UAT-01/04/06` and re-tests `#151–#155` | Reviewed and merged the Lab 6 fix and release PRs (`#138` with substantive change requests, `#168`, `#181`), Lab 6 Part B UAT execution on the partner app (`EN-009_P3#126` Accepted), outgoing findings `#141–#148` |
| **Sprint 2** | Schema S2-1 (`#95`), `F-05` Menu Admin, `F-08` Payment + `BR-16` + `BR-15` (`#115, #136, #154`), `#132` port (`#176`) | `F-06` Cancel & Reject (`#120, #144`), `F-07` Fulfilment (`#144`), reviewed and merged every `vieng` Sprint 2 PR |
| **Lab 7** | TA approval record (`#108`), readiness checklist (`#109`, `#114`), reviewed contract `#103` (changes requested first) and the RED→GREEN PR `#112` after running the tests, release sync `#211` and release `#216` | Change request + impact, C-1 contract (`#103`), RED→fix→GREEN (`#112`), metrics and report (`#167`, `#189`, `#201`), living-doc fix `#214`, live checks L2–L8 |
| **Sprint 3 & D2** | `F-10` & `F-12` (rate limit) contracts (`#106`), reviewed and merged ninja's `F-06/F-07` and `F-09/F-11` contract PRs (`#102`, `#118`), `main -> sprint2` sync (`#191`), D2 Parts A, B, E + `@2x` screenshots + PDF generator (`#192`), `F-10` sales summary implemented test-first (PR #221: RED 8 of 9 failing → GREEN, approved by ninja), `F-12` rate limit (PR #223) | `F-09` & `F-11` contracts (`#118`), `F-09` cut-off/slots (`#147`), `F-11` filter/search (`#151, #158`), D2 Parts C & D + living docs v3 (`#190`), reviewed vieng's `F-10` (#221, approved) and `F-12` (#223, found a parallel-login race before merge), `F-09` picker E2E with a fixed clock (#226) and `NFR-09` axe/keyboard checks with fixes for #130/#131/#133 (#227), reviewed and merged the D2 final (#231) and the Lab 7 release (#232) |

## E.4 AI-use declaration

Both students used AI coding assistants (Claude Code sessions for `ninja` and `vieng`, plus Antigravity with Playwright browser tools for `vieng` during Lab 6 verification and Deliverable 2 drafting) strictly for drafting specs, test suites, implementation code, code-review checklists, and markdown assembly. Every change flowed through GitHub PRs reviewed and approved by the partner's side; no `SEED_PASSWORD`, tokens or keys are in commits, Issues or this PDF. One Lab 6 chat screenshot that showed a partner team's shared test password was caught in review by `ninja`'s side within minutes; the PR (`#212`) was closed, its branch deleted, and the submitted report shows the line blacked out.

## E.5 Known limitations and plan confirmation

1. **Remaining Sprint 3 scope:** `F-10` Sales Summary (`AC-10.1..10.9`), `F-12` login rate limiting (`NFR-08`, `AC-12.1..12.8`) & axe/keyboard checks (`NFR-09`), and `F-09` picker E2E (`TEST-F09-15..17`) are specified and scheduled in **Part C §5** (`29–30 Nov`); since then `F-10` is implemented and tested on `sprint3` (PR #221), `F-12` is in review (PR #223), and ninja's `F-09` E2E (#226) and `NFR-09` (#227) PRs are open.
2. **Sprint 2 release order:** `sprint2` was intentionally held on staging until EN-009_P3 signed the Lab 6 acceptance (`songt888#129`, 27 Nov), so `main` stayed stable for their re-test. It was then released the same night as `v0.2.0-sprint2` (`df6db99`, PR `#210`, Cloud Run `food-order-00010-7vp`); Lab 7 change C-1 followed as `food-order-00011-9nh`.
3. **Desktop Queue vs UI Spec S8:** Currently ships the 7-column semantic table (`Order | Status | Customer | Items | Placed | Total | Action`); team decision on keeping the semantic table or building the S8 card board is scheduled for `29 Nov`.
4. **Confirmed remaining schedule:** We confirm the **Part C §5** schedule (`vieng`: `F-10` + `F-12` rate limit `29–30 Nov`; `ninja`: `F-09` E2E + `NFR-09` axe `30 Nov`; final UAT/regression `12–13 Dec`; exam window `1–11 Dec` protected).
