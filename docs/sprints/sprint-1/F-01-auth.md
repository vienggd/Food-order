# F-01 Login, logout, current user — engineering contract

Sprint 1. Issue #2. Owner: A (vieng). Reviewer: B (ninja). Branch `feature/F-01-auth`.
Definition of Done: [`definition-of-done.md`](definition-of-done.md). Status: **Specified** (committed before any F-01 code).

## 1. Feature and requirements

| Linked | Text (short) |
|---|---|
| FR-01 | Log in with email + password, land on the role's home page |
| FR-02 | Log out; old session no longer works |
| FR-03 | Current user (name, role) for the header and redirects |
| FR-04 | Server checks session and role on every protected endpoint |
| NFR-01 | bcrypt hashes; random session id in httpOnly SameSite=Lax cookie (Secure in production); 8 h expiry; logout deletes it |
| NFR-02 | Role never taken from the request |
| NFR-03 | Shared error format |

Depends on: Issue #1 (schema `users`, `sessions`; seed accounts; `AppError`). Used by: F-02, F-03, F-04 (`requireAuth`, `requireRole`).

## 2. Behaviour

### Workflow
1. Visitor opens the app → client calls `GET /api/auth/me` → 401 → shows `/login`.
2. Visitor submits email + password → `POST /api/auth/login`.
3. Server lower-cases the email, finds the user, compares the password with the bcrypt hash.
4. Match → create `sessions` row (id = 32 random bytes, base64url; `expiresAt` = now + 8 h), set cookie `sid`, return the user. No match → 401, nothing created.
5. Client stores the returned user in memory and redirects: CUSTOMER → `/menu`, OPERATOR → `/operator/orders`.
6. Every protected request: `requireAuth` reads `sid` → loads session + user → not found or expired → 401 (expired row deleted). `requireRole(role)` → other role → 403.
7. Log out → `POST /api/auth/logout` → row deleted, cookie cleared → client goes to `/login`.

### Rules, validation, boundaries
- Body must be exactly `{ email, password }`: email a valid address, password a non-empty string (max 200 chars). Any other field (for example `role`) → 400. Nothing is created.
- Unknown email and wrong password give the **same** status and body.
- Session expiry is fixed at 8 h from login (not extended). `expiresAt <= now` counts as expired.
- Logout without a session is not an error (204).
- Response bodies never contain `passwordHash` or the session id.

### Permissions
| Endpoint | Anonymous | CUSTOMER | OPERATOR |
|---|---|---|---|
| `POST /api/auth/login` | ✔ | ✔ | ✔ |
| `POST /api/auth/logout` | ✔ (204, no-op) | ✔ | ✔ |
| `GET /api/auth/me` | 401 | ✔ own | ✔ own |

## 3. UI

Screens per [`../../ui/ui-spec.md`](../../ui/ui-spec.md) (S1 Login, shared layout, route guard).

| Part | Behaviour |
|---|---|
| S1 Login `/login` | Email, Password, **Log in**. Client checks: "Email is required." / "Enter a valid email." / "Password is required." Loading: "Logging in…" (disabled). 401: error box "Incorrect email or password.", password cleared, email kept. Network/500: "Something went wrong. Please try again." Already logged in → redirect to own home. Arrived after a 401 elsewhere: info box "Your session has ended. Please log in again." |
| Shared layout | Phone: top bar "Hey, `<name>`", role chip, Log out button; bottom tab bar by role. Desktop: dark sidebar with links by role, name and role, Log out. Log out shows "Logging out…", then always goes to `/login`. |
| Route guard | On start call `/api/auth/me`. No session → `/login`. Customer on an operator route (or the reverse) → own home with "You don't have access to that page." `/` → own home. Unknown path → "Page not found" + Go home. |

## 4. API

All errors use `{ error: { code, message, details } }`.

| Method + path | Request | Success | Errors |
|---|---|---|---|
| `POST /api/auth/login` | `{ "email": "alice@cafe.test", "password": "…" }` | 200 `{ "id": 1, "name": "Alice", "role": "CUSTOMER" }` + `Set-Cookie: sid=…; Path=/; Max-Age=28800; HttpOnly; SameSite=Lax` (+ `Secure` in production) | 400 VALIDATION_ERROR (bad/extra fields) · 401 UNAUTHENTICATED "Incorrect email or password." |
| `GET /api/auth/me` | cookie `sid` | 200 `{ "id", "name", "role" }` | 401 UNAUTHENTICATED "Not logged in." |
| `POST /api/auth/logout` | cookie `sid` (optional) | 204, cookie cleared | — |

Middleware for other features: `requireAuth` (401 "Not logged in.") and `requireRole("CUSTOMER" | "OPERATOR")` (401, or 403 FORBIDDEN "You don't have access to this.").

## 5. Data

No schema change. Uses `users` (email unique, `password_hash`, `role`) and `sessions` (`id` PK, `user_id` FK cascade, `expires_at`) from Issue #1 migration `init`. Seed accounts from Issue #1.

## 6. Acceptance criteria

| ID | Given / when | Then |
|---|---|---|
| AC-F01-01 | Seeded customer; POST login with correct email + password | 200 `{ id, name, role: "CUSTOMER" }`; cookie `sid` is HttpOnly, SameSite=Lax, Max-Age 28800; one `sessions` row for that user with `expiresAt` 8 h ± 1 min from now |
| AC-F01-02 | Correct email, wrong password | 401 UNAUTHENTICATED "Incorrect email or password."; no `Set-Cookie`; no session row |
| AC-F01-03 | Email that has no account | Same status and body as AC-F01-02; no session row |
| AC-F01-04 | Body missing password, invalid email, or with an extra field `role: "OPERATOR"` | 400 VALIDATION_ERROR; no session row |
| AC-F01-05 | Email typed in capitals `ALICE@CAFE.TEST` | Login succeeds as Alice |
| AC-F01-06 | Valid session; GET me | 200 `{ id, name, role }` only — no `passwordHash`, no session id |
| AC-F01-07 | GET me with no cookie, or with a made-up `sid` | 401 UNAUTHENTICATED |
| AC-F01-08 | Session whose `expiresAt` has passed; GET me | 401 and that session row is deleted |
| AC-F01-09 | Logged in; POST logout, then GET me with the old cookie | Logout 204 and cookie cleared; row deleted; then 401 |
| AC-F01-10 | A route protected by `requireRole("OPERATOR")` | Customer session → 403 FORBIDDEN; no session → 401; operator → 200 |
| AC-F01-11 | `NODE_ENV=production` | Session cookie also has `Secure` |
| AC-F01-12 | UI: customer logs in / operator logs in / user logs out | Customer lands on `/menu`, operator on `/operator/orders`; layout shows the user's name and role; after Log out the app shows `/login` and `/menu` redirects to `/login` |
| AC-F01-13 | UI: wrong password | Error "Incorrect email or password." shown; password field empty; email field keeps its value |
| AC-F01-14 | UI: not logged in opens `/menu`; customer opens `/operator/orders` | First → `/login`; second → `/menu` with "You don't have access to that page." |

## 7. Test specification

Level: **API** = Vitest + Supertest against the local `cafe_test` Postgres; **unit** = Vitest, no database; **E2E** = Playwright in a browser with the seeded database. The test ID is at the start of each test name.

| Test ID | AC | Level | Precondition / input | Action | Expected |
|---|---|---|---|---|---|
| TEST-F01-01 | AC-F01-01 | API | DB reset + seed (test password) | POST `/api/auth/login` alice + correct password | 200 body; cookie flags; 1 session row, expiry 8 h ± 1 min |
| TEST-F01-02 | AC-F01-02 | API | Seeded | POST login alice + wrong password | 401 body as specified; no `set-cookie`; 0 session rows |
| TEST-F01-03 | AC-F01-03 | API | Seeded | POST login `nobody@cafe.test` | Body equals TEST-F01-02 body; 0 session rows |
| TEST-F01-04 | AC-F01-04 | API | Seeded | POST login with (a) no password (b) `email: "not-an-email"` (c) extra `role` | 400 VALIDATION_ERROR each; 0 session rows |
| TEST-F01-05 | AC-F01-05 | API | Seeded | POST login `ALICE@CAFE.TEST` | 200, name Alice |
| TEST-F01-06 | AC-F01-06 | API | Logged in as staff | GET `/api/auth/me` with cookie | 200 `{ id, name: "Staff", role: "OPERATOR" }`, keys exactly id/name/role |
| TEST-F01-07 | AC-F01-07 | API | — | GET me (a) no cookie (b) `sid=made-up` | 401 UNAUTHENTICATED both |
| TEST-F01-08 | AC-F01-08 | API | Session row with `expiresAt` 1 s in the past | GET me with that `sid` | 401; row no longer exists |
| TEST-F01-09 | AC-F01-09 | API | Logged in as bob | POST logout; GET me with old cookie | 204 + cookie cleared; 0 rows for bob; then 401 |
| TEST-F01-10 | AC-F01-10 | API | Test-only route with `requireRole("OPERATOR")` | Call as customer, anonymous, operator | 403, 401, 200 |
| TEST-F01-11 | AC-F01-11 | unit | — | `sessionCookieOptions(true)` and `(false)` | `secure: true` / `secure: false`; both `httpOnly`, `sameSite: "lax"`, `maxAge` 8 h |
| TEST-F01-12 | AC-F01-12 | E2E | Seeded DB, app running | Log in as alice → check URL + name; log out → open `/menu`; log in as staff → check URL | `/menu` + "Alice"; `/login`; `/operator/orders` + "Staff" |
| TEST-F01-13 | AC-F01-13 | E2E | Seeded | Log in alice + wrong password | Error text visible; password input empty; email input = alice@cafe.test |
| TEST-F01-14 | AC-F01-14 | E2E | Seeded | Open `/menu` logged out; log in alice, open `/operator/orders` | `/login`; `/menu` + "You don't have access to that page." |

TDD: TEST-F01-01..11 are committed failing first (`[red]`, output saved to `docs/evidence/tdd/F-01-red.txt`), then the code that makes them pass (`[green]`, `F-01-green.txt`). E2E tests run in Issue #10 once the screens exist.

## 8. Definition of Done

See [`definition-of-done.md`](definition-of-done.md). F-01 specific: the middleware is used by F-02..F-04 endpoints.

## 9. Version history

| Date | Version | Change | Why |
|---|---|---|---|
| 6 Nov 2026 | 1 | First contract | Before implementation (Issue #2) |
