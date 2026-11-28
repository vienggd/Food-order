# Lab 7 — Release readiness for change C-1 (vieng side)

Change: an order has at most **15 items in total** (BR-01b). Per-line 1–10 stays. Issue #96. TA approved 25 Nov 2026 (screenshots in `evidence/ta-approval-1.png`, `-2.png`).
Baseline before the change: `main` `b71cdb2` (Lab 5 release). Version accepted in Lab 6 and current `main`: `39bda5e` / Cloud Run revision `food-order-00009-jd9` (earlier Lab 6 release `163fdb7` / `food-order-00008-v6c`).

Status key: [x] done, [ ] not done yet. Fill in the "Result" column when the check is run.

## 1. Before release (checklist)

| # | Check | How | Result |
|---|---|---|---|
| 1 | Baseline is green before the change | `npm ci`, `npm run build`, `npm test` on the lab7 branch before the code commits | [x] 25 Nov: build ok; server 8 files / 71 tests pass; client 3 files / 6 tests pass |
| 2 | Contract merged before any test or code | PR #103 merged into `lab7` (approved by vieng side) | [x] |
| 3 | RED commit comes before the fix commit | `git log --oneline` on `lab7`: test commit, then fix commit; `evidence/red.txt` shows L7-3, -4, -5 failing for the right reason | [x] 25 Nov: RED commit 1b9e604 (tests + red.txt), contract follow-up 41031b7, then fix 7de5285; red.txt: TEST-L7-3 (both cases), -4, -5 fail on b71cdb2 code, -1/-2 pass by design |
| 4 | GREEN after the fix | `evidence/green.txt`: TEST-L7-1..5 all pass | [x] green.txt (PR 112) |
| 5 | Full regression | `evidence/regression.txt`: `npm test` (server orders, operator, auth + client unit), 0 failed, no test weakened | [x] regression.txt: server 8 files / 78 tests, client 3 files / 7 tests pass (before: 71 / 6); vieng re-ran `npm test` on head 93b2738, same numbers |
| 6 | E2E | `npm run test:e2e` incl. TEST-L7-5 (cart warning, + disabled, Place order still 201) | [x] ninja: 26 passed, 0 failed, 0 skipped; vieng re-ran on `3c276b2` (26 Nov): 26 passed, 0 failed, 0 skipped |
| 7 | CI | PR checks green (`ci-docker.yml`) on the lab7 PRs | [x] no CI on the staging PRs into `lab7` (by design); on the release PR #216 `CI & Docker Build` run 46039698561 (lab7 head `2f080a8`) = success (npm test, build, Docker build); a first run 46039520267 was cancelled and re-run |
| 8 | Docs match | SRS BR-01, F-03 contract, system-sds, traceability say the same rule; traceability row moved from "Pending" to "Pass" | [x] PR 112 sets BR-01 to Pass |
| 9 | Migration | **None.** No schema change; the sum is checked in the API schema before the transaction. The migrate job runs but has nothing to apply | [x] by design (impact.md §2) |
| 10 | Old data | Orders saved before C-1 are not re-checked and still open normally (AC-L7-03) | [x] old-order tests TEST-F03-12/13/14/21/22 pass in the full run |
| 11 | No secrets in the change | `git diff lab7 -- .` has no `.env`, password or key | [x] no `.env` tracked on `lab7`; test passwords only in local `server/.env` |
| 12 | Review | Every Lab 7 PR approved by the other side, merge commit, no squash | [x] #103, #108, #109, #112 each approved by the other side and merged with merge commits |

## 2. Rollback plan

The change is code only (no migration, no data change), so rollback is safe and fast.

1. **Trigger:** after deploy, any live check in section 4 fails, or valid orders (≤ 15 items) are rejected, or the smoke test fails.
2. **Rollback:** run the `deploy` workflow manually (`workflow_dispatch`) with `image_tag` = full 40-char commit SHA of the previous good image (`39bda5e1922a3bf07c5bfc0daec3359a9d396eed`, the Lab 6 release, revision `food-order-00009-jd9`). This runs `deploy/release.sh` with `ROLLBACK=true`: verify image → update service. No migration, no seed.
3. **Check after rollback:** `/api/health` ok, `/api/ready` db connected, smoke test passes, a 16-item order is accepted again (old behaviour).
4. Data: nothing to undo. Orders placed with the new rule are valid under the old rule too (≤ 15 items).

## 3. Deploy steps (for the heads, after the TA answer about the Lab 5 URL)

Do not deploy before the heads decide. Nothing goes to `main` until then.

1. All Lab 7 PRs merged into `lab7`; section 1 all ticked.
2. Heads open the release PR `lab7` → `main` (merge commit) and merge it after approval.
3. The push to `main` starts `.github/workflows/deploy.yml`: tests (`ci-docker.yml`) → build image → `release.sh` (migrate job, no-op) → update Cloud Run service → `smoke_test.py`.
4. Wait for the workflow to finish green. Write the service URL and the deployed commit SHA below.
5. Run section 4 live checks.

| Item | Value |
|---|---|
| Deployed commit SHA | `704a66b` (release PR #216, merged 28 Nov 00:13:46 +07) |
| Service URL | Cloud Run service `food-order`, revision `food-order-00011-9nh` (bundle `assets/index-CDaqMZLn.js`); URL not written here |
| Workflow run | Deploy demo `46040158850`, success (27 Nov 17:13:49 UTC) |

## 4. Live checks after deploy (customer account)

Use the seeded customer. Never write the password in the repo, the chat or the PDF.

| # | Check | Expected | Result |
|---|---|---|---|
| L1 | `GET /api/health` and `/api/ready` | ok, db connected | [x] PASS (vieng, 28 Nov): health ok; ready `{"status":"ready","db":"connected"}` |
| L2 | Place an order with **15 items in total** (e.g. Latte ×10 + Americano ×5) | 201, status PLACED, order opens in My orders | [x] PASS 01:19:43: order #18 PLACED, total 92500 satang, Latte ×10 + Americano ×5; `evidence/live/L2-order-18-placed.png` |
| L3 | Place an order with **16 items** (Latte ×10 + Americano ×6) | 400 `VALIDATION_ERROR`, message "An order can have at most 15 items in total", details `{field: "lines", max: 15, total: 16}`; no new order in My orders | [x] PASS 00:52:18: 400 `VALIDATION_ERROR`, the C-1 message, details `{field:"lines",max:15,total:16}`; alice's order count 16 before and after |
| L4 | In the UI add items until the cart total is 15 | Warning is shown; every + (menu and cart stepper) is disabled, so a 16th item cannot be added | [x] PASS 01:19:39: warning shown, all 6 Add buttons and cart + disabled; `evidence/live/L4-cart-15-menu.png`, `L4-cart-15-warning.png` |
| L5 | Per-line rule still holds: one line with quantity 11 | 400 | [x] PASS 00:52:18: 400 (`items.0.quantity`, max 10) |
| L6 | Old orders (placed before the change) still list and open | unchanged | [x] PASS 01:20:08: old order #13 (26 Nov, ACCEPTED) lists and opens; `evidence/live/L6-old-order-13.png` |
| L7 | Operator accepts the new 15-item order | PLACED → ACCEPTED works as before | [x] PASS 08:39:21: #18 PLACED → ACCEPTED (`acceptedAt` 2026-11-28T01:39:21.738Z), toast "Order #18 accepted."; `evidence/live/L7-staff-*.jpg` |
| L8 | Preserved Sprint 1 access path: customer calls `GET /api/operator/orders`; anonymous calls `GET /api/orders`; bob opens alice's order | 403 `FORBIDDEN`, 401 `UNAUTHENTICATED`, 404 `NOT_FOUND`; no protected data leaked | [x] PASS: anonymous → 401 (vieng); alice on the staff queue → 403 `FORBIDDEN` (00:52:08); bob on alice's order #18 → 404 `NOT_FOUND` (08:34:45); `evidence/live/L8-bob-alice-order-404.jpg` |

Results recorded 28 Nov 2026 in `evidence/live-checks.md` and `evidence/live/`. Evidence for the PDF: for each live check keep the status code and response (curl output with the cookie hidden) or a screenshot, with date and time.

## 5. Defects by severity and status (maintained Sprint 1 scope)

- **Lab 7 change C-1 defects:** 0 defects found during implementation, unit/API/E2E verification, or review on `lab7` (`3c276b2`).
- **Sprint 1 UAT findings (fixes in PR #138, in `main` since `163fdb7`; #132 fix in `39bda5e`):** 9 of 9 accepted defects (`#121`–`#126`, `#128`, `#129`, `#132`) fixed, re-tested PASS by the partner team and closed. The 3 enhancements deferred to Sprint 3: `#130` is closed on GitHub (27 Nov 16:55 UTC), `#131` and `#133` are still open; `#127` was closed `NOT_PLANNED` on 25 Nov and split into `#128`–`#133`.
- **Live checks (28 Nov):** 0 defects; L1–L8 PASS on revision `food-order-00011-9nh`.

## 6. Technical debt

Deferred engineering work that creates future cost or risk (distinct from known incorrect behavior, which belongs in the defect list above):

| Item | Impact | Priority | Disposition / action |
|---|---|---|---|
| Duplicated `15`-item cap constant in `server/src/orders/routes.ts` and `client/src/lib/cart.ts` | A future limit change must update two files or client and server could drift | Medium | Guarded by `TEST-L7-1..5`; extract a shared constant/config if order limits expand in Sprint 3 (owner: vieng / ninja) |
| `ci-docker.yml` triggers on `main` and `lab-5` PRs (and `workflow_call`), not on `lab7`, `sprint2`, or `lab6` | Staging PRs rely on local test runs until the `main` release PR | Medium | Keep mandatory local `npm test` + `npm run test:e2e` on every PR; CI runs on the `main` release PR (owner: vieng) |
| Lab 7 contract changes live in `docs/sprint_1/*` on `lab7`, while living docs live in `docs/*` on `sprint2` | Merging `lab7` into `main` must carry BR-01b into living SRS, SDS, and traceability | Low | Port BR-01b into `docs/srs.md`, `docs/system-sds.md`, and `docs/traceability.md` in the `lab7` → `main` release PR (owner: ninja + vieng) |
| `e2e/helpers.ts` (`shot()`) writes all E2E screenshots into `docs/sprint_1/evidence/screenshots/` | Running Lab 7 E2E overwrites Sprint 1 PNGs unless restored manually | Low | Restore Sprint 1 PNGs after runs; parameterize the screenshot output directory before the final release (owner: vieng) |

## 7. Release readiness verdict (maintained Sprint 1 scope)

**Verdict before the release: NOT READY** (as of 27 Nov 2026). **Updated 28 Nov 2026: READY and released** (see section 10). This assesses only the maintained Sprint 1 scope (change C-1 + preserved Sprint 1 behavior), not completion of the full three-sprint product.

Outstanding items required before `READY`:
1. **TA answer on Question 3** (permission to deploy newer versions to the Lab 5 Cloud Run URL while Lab 5 is graded) — owner: **vieng**.
2. ~~Lab 6 UAT triage, fixes, and partner re-test~~ — **done**: 9 of 9 accepted defects fixed, re-tested and in `main` (`39bda5e`); 3 enhancements deferred to Sprint 3.
3. ~~Release integration & live verification~~ — **done 28 Nov**: release PR #216, CI green, deployed as `food-order-00011-9nh`, live checks `L1`–`L8` PASS. Left: final metrics (done 28 Nov 08:45) and the Lab 7 PDF — owner: **ninja**.

## 8. Retrospective

- **What helped:** Reviewing the impact table and contract (PR #103) before writing code caught the unreachable 20-line cart tests early and kept the RED (`1b9e604`) → contract follow-up (`41031b7`) → fix (`7de5285`) sequence verifiable.
- **What hurt:** Running E2E locally overwrote Sprint 1 screenshots in `docs/sprint_1/evidence/screenshots/` (needing cleanup commit `8f6110f`), and CI does not trigger on staging branch PRs.
- **What will change for the final release:** Parameterize the screenshot path in `e2e/helpers.ts` and check `git status` for unintended screenshot diffs before every push (owner: vieng, Sprint 3 before 13 Dec).

## 9. Owner and notes

- vieng side: this file, live checks, review of ninja's RED / GREEN PRs.
- ninja side: change request, impact.md, contract, RED/GREEN code, metrics, Lab 7 PDF.
- Local test databases used: own names `cafe_l7`, `cafe_l7_test` on the shared Docker Postgres (port 5433); `server/.env` is not committed.

## 10. Post-release update (28 Nov 2026)

Release PR #216 merged (`main` `704a66b`), CI & Docker Build success on the release PR, Deploy demo success, revision `food-order-00011-9nh`. Live checks L1–L8 all PASS (section 4, `evidence/live-checks.md`). Sprint 2 was released first (`df6db99`, tag `v0.2.0-sprint2`, revision `food-order-00010-7vp`), and BR-01b is in the living docs (PR #211, #214). Open from section 7: the TA answer on Question 3 (owner: vieng).
