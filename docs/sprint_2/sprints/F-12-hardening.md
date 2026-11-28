# F-12 Hardening: login rate limit — engineering contract (Sprint 3)

Sprint 3. Issue #93 (contract). Owner: vieng (rate limit); ninja adds error states and accessibility checks (NFR-09) in the same feature. Reviewer: ninja. Status: **Specified** (contract only; code in Sprint 3).
Definition of Done: [`../../sprint_1/sprints/sprint-1/definition-of-done.md`](../../sprint_1/sprints/sprint-1/definition-of-done.md).

## 1. Feature and requirements

| Linked | Text (short) |
|---|---|
| NFR-08 | After 5 failed logins for one email within 15 minutes, further attempts get 429 for 15 minutes |
| NFR-09 | Error states and accessibility (axe check in Playwright, no serious violations on the main screens) — ninja's part |
| BR-20 | A successful login clears that email's failed count |
| BR-21 | Counting is per email (lower-cased), not per IP |

Depends on: F-01 login. Adds error code `RATE_LIMITED` → HTTP 429.

## 2. Behaviour

### Workflow
1. `POST /api/auth/login` is called with an email and a wrong password (or unknown email). The server records one failure for that email.
2. Failure 1–5 → the normal 401 as in Sprint 1. When the **5th** failure is recorded, the lock starts.
3. While locked, any login attempt for that email (even with the right password) → 429 `RATE_LIMITED`, "Too many failed logins. Try again in N minutes." with `details: { retryAfterSeconds }` and header `Retry-After`.
4. The lock ends 15 minutes after the 5th failure; then the count starts again. Failures older than 15 minutes do not count.
5. A successful login (not locked) deletes that email's failures.

### Rules, validation, boundaries
- Unknown emails are counted too, so the answer does not show whether an account exists.
- Failures are kept in a database table so they survive a restart and work with more than one server instance.
- Failures count when they are less than 15 minutes old. The 5th failure within that time starts the lock; the lock lasts 15 minutes from that 5th failure (the 4th does not lock).
- Concurrency: counting and recording a failure happen in one database transaction that holds a per-email advisory lock (`pg_advisory_xact_lock`), so parallel requests for one email are handled one after the other and cannot pass the limit.
- Other endpoints are not limited in Sprint 3.

### Permissions
Public endpoint (no session needed). Limit applies to everyone.

## 3. UI
Login page shows the server message for 429 under the form ("Too many failed logins. Try again in N minutes.") and disables **Log in** for that time. No other screen changes. Error-state and axe work by ninja is listed in his own contract section.

## 4. API

| Method + path | Request | Success | Errors |
|---|---|---|---|
| `POST /api/auth/login` | `{ email, password }` | 200 (unchanged) | 400 · 401 (unchanged) · **429 RATE_LIMITED** with `Retry-After` |

## 5. Data
New migration (Sprint 3): table `login_failures(id, email, created_at)` with index `(email, created_at)`; rows older than 15 minutes are ignored and may be deleted on each login attempt for that email.

## 6. Layers with no change
Sessions, cookies, roles, every other route.

## 7. Acceptance criteria

| ID | Given / when | Then |
|---|---|---|
| AC-12.1 | 4 wrong passwords for alice | all 401; the 5th correct login still works |
| AC-12.2 | 5 wrong passwords for alice, then the correct password | 429 with `Retry-After`; no session set |
| AC-12.3 | Alice locked; bob logs in correctly | bob gets 200 (per email) |
| AC-12.4 | Alice locked; 15 minutes pass (clock moved in the test) | alice can log in again |
| AC-12.5 | 4 wrong passwords then a correct one, then 4 wrong again | never locked (BR-20) |
| AC-12.6 | 5 wrong logins for an unknown email | 429 after the 5th, same as a real one |
| AC-12.7 | Email written in different upper/lower case | counted as the same email |
| AC-12.8 | UI: locked login | message shown, button disabled |
| AC-12.9 | 20 wrong logins for one email sent at the same time | exactly 5 get 401 and 15 get 429; 5 failure rows are saved (a parallel burst cannot get past the limit) |

## 8. Test specification

| Test ID | AC | Level | Precondition / input | Action | Expected |
|---|---|---|---|---|---|
| TEST-12.1 | AC-12.1 | API | seed | 4 wrong, then correct | 401 ×4, then 200 |
| TEST-12.2 | AC-12.2 | API | seed | 5 wrong, then correct | 429 + Retry-After, no cookie |
| TEST-12.3 | AC-12.3 | API | alice locked | bob logs in | 200 |
| TEST-12.4 | AC-12.4 | API | alice locked; failure rows aged 15 min in the DB | alice logs in | 200 |
| TEST-12.5 | AC-12.5 | API | seed | 4 wrong, correct, 4 wrong | no 429 |
| TEST-12.6 | AC-12.6 | API | no such user | 5 wrong | 429 on the 5th |
| TEST-12.7 | AC-12.7 | API | seed | mixed-case emails ×5 | 429 |
| TEST-12.9 | AC-12.9 | API | seed | 20 wrong logins for alice in parallel (`Promise.all`) | five 401, fifteen 429; 5 rows in `login_failures` |
| TEST-12.8 | AC-12.8 | E2E | seed | 5 wrong logins in the UI | message; button disabled |

TDD: TEST-12.1..12.7 and TEST-12.9 committed failing first, then code.

## 9. Definition of Done
Sprint 1 definition of done. Status when this contract is merged: **planned** (not implemented). Failed or skipped tests must be listed.

## 10. Version history

| Date | Version | Change | Why |
|---|---|---|---|
| 25 Nov 2026 | 1 | First contract | Sprint 3 contracts for Deliverable 2 part C (Issue #93) |
| 28 Nov 2026 | 1.1 | Added AC-12.9 / TEST-12.9 and the concurrency rule | PR #223 review (ninja): 20 parallel wrong logins all got 401 |
