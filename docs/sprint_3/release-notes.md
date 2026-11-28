# Release notes — Sprint 3 (draft)

Status: **draft for the final delivery**, written on 28 Nov 2026 from `sprint3` at `a6c9645`. Nothing here is released: `main` and the live URL are not changed by Sprint 3 yet, and no tag is made. Version and tag are decided by vieng.

## What is new on `sprint3`

| Feature | What the user gets | PR | Contract |
|---|---|---|---|
| F-10 Sales summary | The operator opens **Sales** (`/operator/sales`): order count and sales total per Bangkok day for a date range (default: last 7 days, at most 92), and the top 3 items. Only orders that are PICKED_UP **and** PAID count (BR-17..BR-19). | #221 | `docs/sprint_2/sprints/F-10-sales-summary.md` |
| F-12 Login rate limit | After 5 failed logins for one email within 15 minutes, further attempts get a clear message ("Too many failed logins. Try again in N minutes.") and **Log in** stays disabled; the server answers 429 `RATE_LIMITED` with `Retry-After` (NFR-08, BR-20, BR-21). 20 parallel wrong logins cannot get past the limit (AC-12.9). | #223 | `docs/sprint_2/sprints/F-12-hardening.md` (v1.1) |
| F-09 pickup slots, UI tests | End-to-end tests for the slot picker (TEST-F09-15..17): slots show Closed or Full, and the order shows "Pickup 10:30". The tests use a frozen server clock that only exists outside production. | #226 | `docs/sprint_2/sprints/F-09-pickup-slots.md` |
| NFR-09 accessibility | An automated axe check on the login page, the customer screens and the operator screens, plus keyboard checks. Fixed: sold-out items had too little contrast; dialogs keep Tab inside and give focus back; the cart takes focus on a phone (#130); login errors are linked to their fields, announced and cleared when corrected (#131, #133). | #227 | NFR-09 in the SRS |

Database change: new table `login_failures` (migration `20261127173631_add_login_failures`). No other schema change.

## How it was built

- Contract before code for F-10 and F-12 (merged in PR #106 before any code); tests first (`[red]` commit, then `[green]`) with the outputs in `docs/sprint_2/evidence/tdd/` (`F-10-*`, `F-12-*`, `NFR-09-*`, `F-09-ui-*`).
- F-12 review found a real hole: 20 parallel wrong logins all got 401 because the count was read before the failure was saved. The contract was amended first (v1.1: AC-12.9, TEST-12.9), then a failing test, then the fix (a per-email advisory lock around count, password check and insert).
- Each PR was reviewed by the other student's side before merging with a merge commit.

## Tests (regression on `sprint3` `a6c9645`, fresh test database, real Postgres)

Full output: `docs/sprint_3/evidence/regression-a6c9645.txt`.

| Suite | Result |
|---|---|
| `npm run build` | OK |
| Server (Vitest + Supertest, 17 files) | 201 passed |
| Client (Vitest, 4 files) | 9 passed |
| Playwright (phone and desktop) | 95 passed, 8 skipped, **1 failed** (see known gaps) |

## Known gaps and things to say honestly

1. **One flaky E2E test.** TEST-A11Y-03 (desktop) failed once in the full run: its locator `getByRole("heading", { name: "Menu items" })` matched two headings. It passes when run alone and in earlier full runs. It is a test-selector problem, not a product bug; it should be fixed before the final regression is quoted as all green.
2. **8 skipped Playwright tests** are written for one viewport only and skip in the other project (for example TEST-A11Y-06, the phone-only cart focus test, skips on desktop).
3. **Not released.** Sprint 3 is on `sprint3` only. A release candidate, tag, deploy and a live check (login rate limit and sales on the live URL) are still to do and are vieng's decision.
4. **Rate limit is per email, not per IP** (BR-21, by design). An attacker rotating emails is not slowed by it. Failed-login rows are only removed by a successful login of that email; old rows are ignored but not deleted.
5. **Keyboard-only checking** is automated for dialogs, the cart and the login page; other screens are not covered by an automated keyboard test.
6. **Documents owned by the other side** (traceability matrix, feature list, UI spec S8) are updated by ninja; this file does not claim their status.

## Where to look

- Requirements and rules: `docs/srs.md` (BR-17..BR-21, status of NFR-08 and NFR-09)
- Design: `docs/system-sds.md` (6.1 login rate limit, 3.2 `login_failures`, 4.4 sales API, 7.1 `E2E_CLOCK_NOW`, 7.5 quality checks)
- Evidence: `docs/sprint_3/evidence/`, `docs/sprint_2/evidence/tdd/`
