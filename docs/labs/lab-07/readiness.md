# Lab 7 — Release readiness for change C-1 (vieng side)

Change: an order has at most **15 items in total** (BR-01b). Per-line 1–10 stays. Issue #96. TA approved 25 Nov 2026 (screenshots in `evidence/ta-approval-1.png`, `-2.png`).
Baseline: `main` `b71cdb2` (Sprint 1 version accepted in Lab 6).

Status key: [x] done, [ ] not done yet. Fill in the "Result" column when the check is run.

## 1. Before release (checklist)

| # | Check | How | Result |
|---|---|---|---|
| 1 | Baseline is green before the change | `npm ci`, `npm run build`, `npm test` on the lab7 branch before the code commits | [x] 25 Nov: build ok; server 8 files / 71 tests pass; client 3 files / 6 tests pass |
| 2 | Contract merged before any test or code | PR #103 merged into `lab7` (approved by vieng side) | [x] |
| 3 | RED commit comes before the fix commit | `git log --oneline` on `lab7`: test commit, then fix commit; `evidence/red.txt` shows L7-3, -4, -5 failing for the right reason | [ ] |
| 4 | GREEN after the fix | `evidence/green.txt`: TEST-L7-1..5 all pass | [ ] |
| 5 | Full regression | `evidence/regression.txt`: `npm test` (server orders, operator, auth + client unit), 0 failed, no test weakened | [ ] |
| 6 | E2E | `npm run test:e2e` incl. TEST-L7-5 (cart warning, + disabled, Place order still 201) | [ ] |
| 7 | CI | PR checks green (`ci-docker.yml`) on the lab7 PRs | [ ] |
| 8 | Docs match | SRS BR-01, F-03 contract, system-sds, traceability say the same rule; traceability row moved from "Pending" to "Pass" | [ ] |
| 9 | Migration | **None.** No schema change; the sum is checked in the API schema before the transaction. The migrate job runs but has nothing to apply | [x] by design (impact.md §2) |
| 10 | Old data | Orders saved before C-1 are not re-checked and still open normally (AC-L7-03) | [ ] checked in regression (TEST-F03-12/13/14/21/22) |
| 11 | No secrets in the change | `git diff lab7 -- .` has no `.env`, password or key | [ ] |
| 12 | Review | Every Lab 7 PR approved by the other side, merge commit, no squash | [ ] |

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

Evidence for the PDF: for each live check keep the status code and response (curl output with the cookie hidden) or a screenshot, with date and time.

## 5. Owner and notes

- vieng side: this file, live checks, review of ninja's RED / GREEN PRs.
- ninja side: change request, impact.md, contract, RED/GREEN code, metrics, Lab 7 PDF.
- Local test databases used: own names `cafe_l7`, `cafe_l7_test` on the shared Docker Postgres (port 5433); `server/.env` is not committed.
