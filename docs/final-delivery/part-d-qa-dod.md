# Final Delivery Part D — Quality assurance, UAT closure, and Definition of Done (draft)

Campus Café Pre-order — Team **Est** (`vienggd/Food-order`), Section **131**. Author: **vieng** (`vienggd`), Issue **#196**. Rubric: `final_project_delivery.pdf` §3.4 (20 pts).

> **Important rule (`final_project_delivery.pdf` §3.4 & §4):** Final Delivery test and UAT results **must be executed on the final tagged release commit `v1.0.0` on `main`**. Prior Sprint 1, Lab 6, Lab 7, and Deliverable 2 runs are recorded below for traceability only; all final-commit result cells remain **PENDING `v1.0.0`** until `v1.0.0` is tagged and tested end-to-end.

## D.1 Final release automated verification summary (`v1.0.0`)

| Check / Level | Command | Deliverable 2 checkpoint (`sprint2`, 27 Nov) | Final `v1.0.0` commit (`main`) result |
|---|---|---|---|
| TypeScript & Vite production build | `npm run build` | Exit `0` (verified on `sprint2`) | **PENDING `v1.0.0`** |
| Server API & integration suite | `cd server; npx vitest run` | `177 passed, 0 failed` (`15` files, real Postgres) | **PENDING `v1.0.0`** |
| Client unit tests | `cd client; npx vitest run` | `8 passed, 0 failed` (`4` files) | **PENDING `v1.0.0`** |
| Playwright E2E (`phone` + `desktop`) | `npx playwright test` | `67 passed, 7 skipped, 0 failed` (zero feature tests skipped) | **PENDING `v1.0.0`** |
| Axe accessibility & keyboard suite (`NFR-09`) | `npx playwright test e2e/a11y.spec.ts` | Not implemented yet (planned `30 Nov`) | **PENDING `v1.0.0`** |
| GitHub Actions CI & Deploy workflow | `ci-docker.yml` + `deploy.yml` | `main` Lab 6 deploy `45890211288` (`39bda5e`) success | **PENDING `v1.0.0`** |
| Live smoke + Cloud SQL persistence | `deploy/smoke_test.py` + pre/post redeploy order read-back | **PENDING `v1.0.0`** | **PENDING `v1.0.0`** |

## D.2 Lab 6 partner UAT closure (`EN-009_P3` vs `Food-order`)

Cross-team UAT ran with **EN-009_P3** (`Kirakit Kingkaew`, `Nattakit Prasertsak`) against our Lab 5/Lab 6 release:

- **Est testing EN-009_P3 (`songt888/event-registration-system`):** `UAT-01..06` and re-tests (`#141–#148`, `#151–#155`, `UAT-04` step 9 post-deploy persistence) **all PASS (`13/13` findings verified on `v0.1.3-lab6` / `502d2a6` / `s47a6b53b-00006-7bv`)**. Team Est posted official **`Accepted`** in [`songt888/event-registration-system#126`](https://github.com/songt888/event-registration-system/issues/126#issuecomment-7202511583).
- **EN-009_P3 testing Food-order (`Food-order` `#121–#133`):** All **9 accepted Lab 6 defects (`#121, #122, #123, #124, #125, #126, #128, #129, #132`)** were fixed, deployed to `main` (`163fdb7` -> `39bda5e`, live Cloud Run revision `food-order-00009-jd9`), **re-tested PASS** by Kirakit (ending with `#132` PASS on `39bda5e` at `2026-11-27 03:32 UTC+7`), and **closed to Board 4 `Done`**.
- **3 partner enhancement requests (`#130, #131, #133`)** were formally accepted by EN-009_P3 as Sprint 3 backlog deferrals and sit in Board 4 **`Backlog`**:
  - `#130` — Customer password reset / change UI & account recovery (note: Sprint 3 / final scope decision).
  - `#131` — Navigation ergonomics / Breadcrumb & back-navigation enhancement.
  - `#133` — Queue auto-refresh / notification polish on operator queue.
- **Final Lab 6 sign-off artifact:** Awaits Nattakit's signed `Accepted` block on `EN-009_P3#129` to close `#101`.

## D.3 Final UAT re-test plan on `v1.0.0`

Per `final_project_delivery.pdf` §3.4, Est will re-execute the Lab 6 UAT pack (`docs/labs/lab-06/uat-cases.md`, `UAT-01..06`) **plus new Sprint 2/3 & Lab 7 cases** directly on `https://food-order-d4jdyxqbca-as.a.run.app` (`v1.0.0`):

| Case ID | Scope | Executor (planned) | Result (`v1.0.0`) |
|---|---|---|---|
| `UAT-01`..`06` | Auth, menu/order create, role/ownership isolation, persistence across reload/session | **vieng** & **ninja** | **PENDING `v1.0.0`** |
| `UAT-S2-01` | Operator menu price edit + sold-out toggle + customer `F-08` Simulated Payment + `F-07` Advance to `PICKED_UP` (`BR-15`) | **vieng** & **ninja** | **PENDING `v1.0.0`** |
| `UAT-S2-02` | Customer cancel / operator reject on `PAID` order -> automatic `REFUNDED` (`BR-16`) | **vieng** & **ninja** | **PENDING `v1.0.0`** |
| `UAT-S3-01` | `F-09` pickup slot booking + cut-off (`BR-23`) + capacity (`BR-24`) + `F-11` filter/search + `F-10` sales total (`BR-17..19`) + `F-12` login `429` (`NFR-08`) + Lab 7 `15-item` cap | **vieng** & **ninja** | **PENDING `v1.0.0`** |
| `UAT-PERSIST` | Pre-redeploy paid order placed -> redeploy `v1.0.0` revision -> order & sales total preserved in Cloud SQL | **vieng** & **ninja** | **PENDING `v1.0.0`** |

## D.4 Open defect debt & known limitations register

| Item / ID | Severity | Source | Current state (`27 Nov`) | Planned disposition before `v1.0.0` |
|---|---|---|---|---|
| `F-10` Sales summary missing code | Major (unbuilt Sprint 3 scope) | Deliverable 2 Part D | Specified (`PR #106`); scheduled `29–30 Nov` (**vieng**) | Implement RED -> GREEN -> E2E before Sprint 3 freeze |
| `F-12` Login rate limit + NFR-09 A11y | Major (unbuilt Sprint 3 scope) | Deliverable 2 Part D | Specified (`PR #106`); rate limit (**vieng**), axe/keyboard (**ninja**) scheduled `30 Nov` | Implement + verify `0` serious/critical axe issues before freeze |
| `F-09` Picker E2E (`TEST-F09-15..17`) | Minor | Deliverable 2 Part C/D | API tests `14/14` pass; E2E spec missing; scheduled `29 Nov` (**ninja**) | Add fixed-clock Playwright picker tests |
| Desktop Queue S8 design diff | Cosmetic / Docs | Deliverable 2 Part C §4 | App ships 7-col semantic table; `ui-spec.md` S8 sketched cards | Decide with `ninja` on `29 Nov` & sync S8 spec |
| Issue `#157` branch dev-link missing | Process note | Deliverable 2 Part D §6 | `PR #158` linked & merged, branch created pre-issue | Keep recorded transparently; all new issues use `gh issue develop` |
| `#130, #131, #133` EN-009_P3 requests | Enhancement (Backlog) | Lab 6 UAT | Deferred cleanly to Sprint 3 Backlog with partner agreement | Review during Sprint 3 (`29–30 Nov`); document Won't-Fix vs Fixed |

## D.5 Final Definition of Done checklist (`definition-of-done.md` + Final Delivery)

| DoD Criterion | Verification requirement at `v1.0.0` | Status |
|---|---|---|
| All `F-01`..`F-12` contracts & Lab 7 `C-1` implemented on `main` | Merged into `main`, tagged `v1.0.0`, CI green | **PENDING `v1.0.0`** |
| Full automated suite passes on exact `v1.0.0` commit (`0` failed, `0` weakened assertions) | `npm run build`, server Vitest, client Vitest, Playwright E2E + axe clean | **PENDING `v1.0.0`** |
| Every FR/BR/NFR in `docs/traceability.md` & Part C verified on `v1.0.0` | Per-AC & NFR tables regenerated directly from `v1.0.0` run output | **PENDING `v1.0.0`** |
| Zero secrets / `SEED_PASSWORD` / tokens in repo, docs, or PDFs | `git grep` & review clean on `v1.0.0` | Verified on `sprint2` (`27 Nov`); re-verify **PENDING `v1.0.0`** |
| Live Cloud Run deployment healthy + Cloud SQL persistence proven across redeploy | `/api/ready = ok`, pre/post-redeploy order read-back | **PENDING `v1.0.0`** |
| Final Deliverable PDF & `<= 4 min` two-presenter YouTube video verified | PDF page/link audit clean; unlisted YouTube URL opens cleanly | **PENDING `v1.0.0`** |
