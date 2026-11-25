# Lab 7 — Release readiness for change C-1 (vieng side)

Change: an order has at most **15 items in total** (BR-01b). Per-line 1–10 stays. Issue #96. TA approved 25 Nov 2026 (screenshots in `evidence/ta-approval-1.png`, `-2.png`).
Baseline: `main` `b71cdb2` (Sprint 1 version accepted in Lab 6).

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
| 7 | CI | PR checks green (`ci-docker.yml`) on the lab7 PRs | [ ] no CI checks ran on `lab7` PRs (workflows run on `main`); the test job in `deploy.yml` runs on the release push |
| 8 | Docs match | SRS BR-01, F-03 contract, system-sds, traceability say the same rule; traceability row moved from "Pending" to "Pass" | [x] PR 112 sets BR-01 to Pass |
| 9 | Migration | **None.** No schema change; the sum is checked in the API schema before the transaction. The migrate job runs but has nothing to apply | [x] by design (impact.md §2) |
| 10 | Old data | Orders saved before C-1 are not re-checked and still open normally (AC-L7-03) | [x] old-order tests TEST-F03-12/13/14/21/22 pass in the full run |
| 11 | No secrets in the change | `git diff lab7 -- .` has no `.env`, password or key | [x] no `.env` tracked on `lab7`; test passwords only in local `server/.env` |
| 12 | Review | Every Lab 7 PR approved by the other side, merge commit, no squash | [x] #103, #108, #109, #112 each approved by the other side and merged with merge commits |

## 2. Rollback plan

The change is code only (no migration, no data change), so rollback is safe and fast.

1. **Trigger:** after deploy, any live check in section 4 fails, or valid orders (≤ 15 items) are rejected, or the smoke test fails.
2. **Rollback:** run the `deploy` workflow manually (`workflow_dispatch`) with `image_tag` = full 40-char commit SHA of the previous good image (`b71cdb2…`, the Lab 5/6 image). This runs `deploy/release.sh` with `ROLLBACK=true`: verify image → update service. No migration, no seed.
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
| Deployed commit SHA | (fill in after deploy) |
| Service URL | (fill in after deploy) |
| Workflow run | (fill in after deploy) |

## 4. Live checks after deploy (customer account)

Use the seeded customer. Never write the password in the repo, the chat or the PDF.

| # | Check | Expected | Result |
|---|---|---|---|
| L1 | `GET /api/health` and `/api/ready` | ok, db connected | [ ] |
| L2 | Place an order with **15 items in total** (e.g. Latte ×10 + Americano ×5) | 201, status PLACED, order opens in My orders | [ ] |
| L3 | Place an order with **16 items** (Latte ×10 + Americano ×6) | 400 `VALIDATION_ERROR`, message "An order can have at most 15 items in total", details `{field: "lines", max: 15, total: 16}`; no new order in My orders | [ ] |
| L4 | In the UI add items until the cart total is 15 | Warning is shown; every + (menu and cart stepper) is disabled, so a 16th item cannot be added | [ ] |
| L5 | Per-line rule still holds: one line with quantity 11 | 400 | [ ] |
| L6 | Old orders (placed before the change) still list and open | unchanged | [ ] |
| L7 | Operator accepts the new 15-item order | PLACED → ACCEPTED works as before | [ ] |
| L8 | Preserved Sprint 1 access path: customer calls `GET /api/operator/orders`; anonymous calls `GET /api/orders`; bob opens alice's order | 403 `FORBIDDEN`, 401 `UNAUTHENTICATED`, 404 `NOT_FOUND`; no protected data leaked | [ ] |

Evidence for the PDF: for each live check keep the status code and response (curl output with the cookie hidden) or a screenshot, with date and time.

## 5. Defects by severity and status (maintained Sprint 1 scope)

- **Lab 7 change C-1 defects:** 0 defects found during implementation, unit/API/E2E verification, or review on `lab7` (`3c276b2`).
- **Sprint 1 UAT findings (pending triage on `lab6`):** 7 partner UAT findings (`#121`–`#127`) were reported on 25 Nov 2026 against the Lab 5/Sprint 1 baseline (`b71cdb2`). They are not yet triaged or fixed; every accepted critical/major defect must be resolved, deployed, and re-tested on `lab6` before `lab7` merges into `main`.

## 6. Technical debt

Deferred engineering work that creates future cost or risk (distinct from known incorrect behavior, which belongs in the defect list above):

| Item | Impact | Priority | Disposition / action |
|---|---|---|---|
| Duplicated `15`-item cap constant in `server/src/orders/routes.ts` and `client/src/lib/cart.ts` | A future limit change must update two files or client and server could drift | Medium | Guarded by `TEST-L7-1..5`; extract a shared constant/config if order limits expand in Sprint 3 (owner: vieng / ninja) |
| `ci-docker.yml` triggers on `main` PRs only, not on staging branches (`lab7`, `sprint2`, `lab6`) | Staging PRs rely on local test runs until the `main` release PR | Medium | Keep mandatory local `npm test` + `npm run test:e2e` on every PR; CI runs on the `main` release PR (owner: vieng) |
| Lab 7 contract changes live in `docs/sprint_1/*` on `lab7`, while living docs live in `docs/*` on `sprint2` | Merging `lab7` into `main` must carry BR-01b into living SRS, SDS, and traceability | Low | Port BR-01b into `docs/srs.md`, `docs/system-sds.md`, and `docs/traceability.md` in the `lab7` → `main` release PR (owner: ninja + vieng) |
| `e2e/helpers.ts` (`shot()`) writes all E2E screenshots into `docs/sprint_1/evidence/screenshots/` | Running Lab 7 E2E overwrites Sprint 1 PNGs unless restored manually | Low | Restore Sprint 1 PNGs after runs; parameterize the screenshot output directory before the final release (owner: vieng) |

## 7. Release readiness verdict (maintained Sprint 1 scope)

**Verdict: NOT READY** (as of 26 Nov 2026, pre-release). This assesses only the maintained Sprint 1 scope (change C-1 + preserved Sprint 1 behavior), not completion of the full three-sprint product.

Outstanding items required before `READY`:
1. **TA answer on Question 3** (permission to deploy newer versions to the Lab 5 Cloud Run URL while Lab 5 is graded) — owner: **vieng**.
2. **Lab 6 UAT triage, fixes, and partner re-test** for `#121`–`#127` (must reach `main` before `lab7`) — owner: **vieng + partner team**.
3. **Release integration & live verification:** merge `lab7` → `main` with CI green, deploy to Cloud Run, complete live checks `L1`–`L8`, and finalize metrics + Lab 7 PDF — owner: **vieng + ninja**.

## 8. Retrospective

- **What helped:** Reviewing the impact table and contract (PR #103) before writing code caught the unreachable 20-line cart tests early and kept the RED (`1b9e604`) → contract follow-up (`41031b7`) → fix (`7de5285`) sequence verifiable.
- **What hurt:** Running E2E locally overwrote Sprint 1 screenshots in `docs/sprint_1/evidence/screenshots/` (needing cleanup commit `8f6110f`), and CI does not trigger on staging branch PRs.
- **What will change for the final release:** Parameterize the screenshot path in `e2e/helpers.ts` and check `git status` for unintended screenshot diffs before every push (owner: vieng, Sprint 3 before 13 Dec).

## 9. Owner and notes

- vieng side: this file, live checks, review of ninja's RED / GREEN PRs.
- ninja side: change request, impact.md, contract, RED/GREEN code, metrics, Lab 7 PDF.
- Local test databases used: own names `cafe_l7`, `cafe_l7_test` on the shared Docker Postgres (port 5433); `server/.env` is not committed.
