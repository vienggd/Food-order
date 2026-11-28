# Release notes — Sprint 3

Status: **Released**, 28 Nov 2026. Release PR #245 (`sprint3` → `main`, approved and merged by ninja's side) → `main` `17211cf`, tag **`v0.4.0-sprint3`**, Deploy demo run `46151557649` success → Cloud Run revision **`food-order-00019-gpq`** (`/api/ready` ready, db connected). `v1.0.0` is kept for the final delivery on 13 Dec.

## What is new on `sprint3`

| Feature | What the user gets | PR | Contract |
|---|---|---|---|
| F-10 Sales summary | The operator opens **Sales** (`/operator/sales`): order count and sales total per Bangkok day for a date range (default: last 7 days, at most 92), and the top 3 items. Only orders that are PICKED_UP **and** PAID count (BR-17..BR-19). | #221 | `docs/sprint_2/sprints/F-10-sales-summary.md` |
| F-12 Login rate limit | After 5 failed logins for one email within 15 minutes, further attempts get a clear message ("Too many failed logins. Try again in N minutes.") and **Log in** stays disabled; the server answers 429 `RATE_LIMITED` with `Retry-After` (NFR-08, BR-20, BR-21). 20 parallel wrong logins cannot get past the limit (AC-12.9). | #223 | `docs/sprint_2/sprints/F-12-hardening.md` (v1.1) |
| F-09 pickup slots, UI tests (the slot picker and server rules were released earlier in v0.2.0-sprint2) | End-to-end tests for the slot picker (TEST-F09-15..17): slots show Closed or Full, and the order shows "Pickup 10:30". The tests use a frozen server clock that only exists outside production. | #226 | `docs/sprint_2/sprints/F-09-pickup-slots.md` |
| NFR-09 accessibility | An automated axe check on the login page, the customer screens and the operator screens, plus keyboard checks. Fixed: sold-out items had too little contrast; dialogs keep Tab inside and give focus back; the cart takes focus on a phone (#130); login errors are linked to their fields, announced and cleared when corrected (#131, #133). | #227 | NFR-09 in the SRS |

Database change: new table `login_failures` (migration `20261127173631_add_login_failures`). No other schema change.

## How it was built

- Contract before code for F-10 and F-12 (merged in PR #106 before any code); tests first (`[red]` commit, then `[green]`) with the outputs in `docs/sprint_2/evidence/tdd/` (`F-10-*`, `F-12-*`, `NFR-09-*`, `F-09-ui-*`).
- F-12 review found a real hole: 20 parallel wrong logins all got 401 because the count was read before the failure was saved. The contract was amended first (v1.1: AC-12.9, TEST-12.9), then a failing test, then the fix (a per-email advisory lock around count, password check and insert).
- Each PR was reviewed by the other student's side before merging with a merge commit.

## Tests

**Final run on `sprint3` `0ec0cf7`** (ninja, 28 Nov 2026; separate worktree, clean `npm ci`, test databases dropped and recreated):

| Suite | Result |
|---|---|
| `npm run build` | OK |
| Server (Vitest + Supertest, 17 files) | 201 passed, 0 failed |
| Client (Vitest, 4 files) | 9 passed, 0 failed |
| Playwright (phone and desktop) | **96 passed, 8 skipped, 0 failed, 0 flaky** (3.7 min); TEST-A11Y-03 passes on both viewports |

**Earlier run on `sprint3` `a6c9645`** (vieng's side, fresh test database, real Postgres), kept as recorded. Full output: `docs/sprint_3/evidence/regression-a6c9645.txt`.

| Suite | Result |
|---|---|
| `npm run build` | OK |
| Server (Vitest + Supertest, 17 files) | 201 passed |
| Client (Vitest, 4 files) | 9 passed |
| Playwright (phone and desktop) | 95 passed, 8 skipped, **1 failed** (see known gaps) |

## Live checks after the release (revision `food-order-00019-gpq`, `main` `17211cf`, 28 Nov 2026)

No AI typed a password. vieng's side used only made-up emails (`*@example.test`), so no real account was locked; staff was signed in by hand by ninja.

| # | Check | Side | Result |
|---|---|---|---|
| S1 | `GET /api/health`, `/api/ready` | vieng | PASS: `{"ok":true}`; ready, db connected |
| S2 | Anonymous `GET /api/orders`, `GET /api/operator/sales` | vieng | PASS: both 401 |
| S3 | F-12: wrong logins for one made-up email | vieng | PASS: tries 1–5 → 401 `UNAUTHENTICATED`; tries 6–7 → 429 `RATE_LIMITED`, `Retry-After: 900`, "Too many failed logins. Try again in 15 minutes." |
| S4 | AC-12.9: 20 parallel wrong logins for a new made-up email (13:56 UTC) | vieng | PASS: exactly 5 × 401 and 15 × 429 |
| S5 | Staff session and sales API | ninja | PASS: `/api/auth/me` 200, role OPERATOR; `GET /api/operator/sales` 200 with default range 22–28 Nov, `days: []`, `topItems: []` |
| S6 | Sales page `/operator/sales` | ninja | PASS: default range, the note "Only orders that are picked up and paid count. Days are Bangkok days.", empty state "No sales in this period." (correct: all live orders are UNPAID) |
| S7 | Staff journey on order #18 (Alice, ฿925.00) | ninja | PASS: search 18 → Start preparing → Mark ready (toasts shown); **Mark picked up** stays disabled with "Waiting for payment. The customer pays in the app." (BR-15 holds); #18 left READY, UNPAID |
| S8 | Lab 6 re-test #131 (login errors linked and announced) and #133 (error clears) | ninja | PASS: `aria-describedby` + `role=alert`; error and `aria-invalid` clear after correcting; both Issues closed |

## Known gaps and things to say honestly

1. **One flaky E2E test, fixed and re-verified.** TEST-A11Y-03 (desktop) failed once in the regression run on `a6c9645`: its locator `getByRole("heading", { name: "Menu items" })` matched two headings. It was a test-selector problem, not a product bug. PR #239 (`2dd7f21`) fixed the locator on `sprint3`. The evidence file `regression-a6c9645.txt` is kept as recorded (it still shows the one failure); the final run on `0ec0cf7` above is all green (0 failed).
2. **8 skipped Playwright tests** are the single-viewport tests: TEST-L6-122..126, TEST-L6-129, TEST-L6-132 and TEST-A11Y-06. Each runs only in the viewport it was written for and skips in the other project.
3. **Sales shown live only in its empty state.** On the live data no order is both PAID and PICKED_UP, so `/operator/sales` correctly shows "No sales in this period." The non-empty totals and top 3 are proven by TEST-10.1..10.9 on `sprint3`; a live paid + picked-up order (two sign-ins by hand) is planned before the final video.
4. **Rate limit is per email, not per IP** (BR-21, by design). An attacker rotating emails is not slowed by it. Failed-login rows are only removed by a successful login of that email; old rows are ignored but not deleted.
5. **Keyboard-only checking** is automated for dialogs, the cart and the login page; other screens are not covered by an automated keyboard test.
6. **Documents owned by the other side** (traceability matrix, feature list, UI spec S8) are updated by ninja; this file does not claim their status.

## Where to look

- Requirements and rules: `docs/srs.md` (BR-17..BR-21, status of NFR-08 and NFR-09)
- Design: `docs/system-sds.md` (6.1 login rate limit, 3.2 `login_failures`, 4.4 sales API, 7.1 `E2E_CLOCK_NOW`, 7.5 quality checks)
- Evidence: `docs/sprint_3/evidence/`, `docs/sprint_2/evidence/tdd/`
