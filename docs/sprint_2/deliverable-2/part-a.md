# Deliverable 2, Part A: System summary and release status

Campus Café Pre-order — Team **Est** (`vienggd/Food-order`). Author: **vieng** (`vienggd`). Report commit: `__COMMIT__` on `main` (release `v0.2.0-sprint2` = `df6db99`).

## A.1 Executive summary

Campus Café Pre-order lets students and campus staff pre-order café drinks and snacks, pick ASAP or a bounded pickup slot, pay (simulated), and track preparation through counter pickup, while café operators manage daily menu availability, accept/reject incoming orders, and advance active orders through fulfilment.

Between Deliverable 1 (`v0.1.0-sprint1`) and this Deliverable 2:
- **Lab 5 cloud deployment & CI** shipped Docker multi-stage packaging, GitHub Actions CI + Cloud Run deploy, and managed PostgreSQL (Cloud SQL).
- **Lab 6 cross-team UAT & fixes** deployed all 9 verified defect fixes to `main` (`163fdb7` -> `39bda5e`, live revision `food-order-00009-jd9`, all 9/9 partner re-test findings **PASS**).
- **Sprint 2 (`F-05`..`F-08`)** is 100 % implemented and verified on `sprint2`, including cross-feature business rules `BR-15` (paid before pickup) and `BR-16` (automatic simulated refund on cancel/reject of paid orders).
- **Sprint 3 contracts (`F-09`..`F-12`)** are 100 % merged before code, and **two Sprint 3 features are already implemented ahead of schedule**: `F-09` pickup slots & cut-off rules (`TEST-F09-01..14` passing) and `F-11` customer status filters + operator order search (`TEST-F11-01..17` passing).

## A.2 Release snapshot (`gh` verified)

| Stage / Stream | Branch | Tag / Revision | Commit | Current state |
|---|---|---|---|---|
| Sprint 1 baseline | `main` | `v0.1.0-sprint1` (`PR #46`) | `12c1052` | Released & verified (`F-01`..`F-04`) |
| Lab 5 cloud & CI | `main` | PRs `#78, #80, #82, #84` | `b71cdb2` | Released; live Cloud Run URL & CI pipeline |
| Lab 6 UAT fixes | `main` | `food-order-00009-jd9` (PRs `#168, #181`) | `39bda5e` | **Released & PASS** (9/9 defects closed; EN-009_P3 signed **Accepted**, `songt888#129`) |
| Sprint 2 staging branch | `sprint2` | Integrated staging + synced `39bda5e` (`PR #191`) | `__COMMIT__` | **All tests pass locally** (`build` 0, server `177/177`, client `8/8`, E2E `67/7/0`) |
| **Sprint 2 release to `main`** | `sprint2 -> main` (PR `#210`) | **`v0.2.0-sprint2`** · `food-order-00010-7vp` | `df6db99` | **Released** 27 Nov 23:55 UTC+7: CI `test-and-docker` SUCCESS, *Deploy demo* run `46037590468` SUCCESS, `/api/ready` ready + db connected |

## A.3 Scope completion overview (vs SRS / Plan baseline)

| Sprint | Feature scope | Implemented on `sprint2` | Verified by tests |
|---|---|---|---|
| Sprint 1 | `F-01` Auth, `F-02` Menu, `F-03` Place Order, `F-04` Accept Queue | Yes (`F-01`..`F-04`) | Yes (61 Sprint 1 tests + Lab 6 regressions pass on `sprint2`) |
| Sprint 2 | `F-05` Menu Admin, `F-06` Cancel/Reject, `F-07` Fulfilment, `F-08` Payment/Refund/BR-15 | Yes (`F-05`..`F-08`, 75 AC) | Yes (all API, unit, and E2E tests pass on `sprint2`) |
| Sprint 3 | `F-09` Pickup Slots, `F-10` Sales Summary, `F-11` Search/Filter, `F-12` Rate Limit & A11y | **Partly ahead**: `F-09` (server + picker) & `F-11` (full); `F-10` & `F-12` specified | `F-11` 17/17 AC pass; `F-09` 14/14 server AC pass (`TEST-F09-15..17` pending); `F-10`/`F-12` pending |

## A.4 Key design decisions and risks heading into Sprint 3

1. **Main branch discipline during cross-team UAT:** Merging `main` (`39bda5e`) into `sprint2` (`PR #191`) ensures zero regression on Lab 6 fixes (including `#132` table alignment ported in `PR #176`), while keeping `main` untouched until EN-009_P3 finalizes Lab 6 sign-off.
2. **Exam window protection (`1–11 Dec`):** Remaining new feature code (`F-10` sales summary, `F-12` login rate limit + axe accessibility checks, and `F-09` picker E2E) is scheduled for `29–30 Nov` (detail in Part C §5) so exam week is reserved strictly for bounded bug fixes and final UAT.
3. **UI layout alignment check:** Desktop queue currently ships the 7-column semantic table across tabs (with search & status filter integrated cleanly), whereas `docs/sprint_2/ui/ui-spec.md` S8 sketched a multi-column board; team Est will finalize whether to keep the semantic table and update S8 on `29 Nov`.
