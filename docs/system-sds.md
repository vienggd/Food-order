# System-Level Software Design Specification — Campus Café Pre-order

Deliverable 1, part C. Issue #8. Requirements: [`srs.md`](srs.md). Screens: [`ui/ui-spec.md`](ui/ui-spec.md).
Authors: A (vieng) sections 1, 2, 5, 6, 7; B (ninja) sections 3, 4.
Version 1 — 6 Nov 2026. Later changes go in the change log at the bottom.

## 1. Architecture

### 1.1 Stack

| Layer | Technology | Why |
|---|---|---|
| UI | React 19 + Vite + TypeScript, React Router | Course stack; fast dev server; typed props |
| API / application | Node 24 + Express 5 + TypeScript, Zod for input checks | Course stack (Lab 5 kit); Zod gives strict request schemas (BR-04) |
| Database | PostgreSQL 16 + Prisma 6 (schema, migrations, seed) | Real transactions and row-level conditional updates (BR-03, BR-07) |
| Tests | Vitest + Supertest (unit + API against real Postgres), Playwright (end-to-end) | Tests run against the same database engine as production |
| Packaging | One Docker image: Express serves the built React app and `/api` | Lab 5 starter kit layout; one origin, so the session cookie needs no CORS |

### 1.2 Components and responsibilities

```
 Browser (phone / desktop)
 ┌──────────────────────────────┐
 │ React app                    │  screens, cart, form checks for convenience only
 │  fetch('/api/...', cookie)   │
 └──────────────┬───────────────┘
                │ HTTPS, JSON, httpOnly session cookie
 ┌──────────────▼───────────────┐
 │ Express API (/api)           │
 │  1. requireAuth / requireRole│  who you are + what you may do   (FR-04)
 │  2. Zod schema               │  shape of the request            (BR-01, BR-02, BR-04)
 │  3. service / domain logic   │  rules, totals, transitions      (BR-03, BR-05, BR-06, BR-07)
 │  4. error handler            │  one error format, no stacks     (NFR-03)
 └──────────────┬───────────────┘
                │ Prisma (SQL, transactions)
 ┌──────────────▼───────────────┐
 │ PostgreSQL 16                │  users, sessions, menu_items, orders, order_lines
 │  constraints: unique email,  │  unique (order, menu item), FK ownership
 └──────────────────────────────┘
```

| Component | Does | Does not |
|---|---|---|
| React app | Shows screens and states; keeps the cart in memory; calls the API; shows `error.message` from the server | Decide prices, totals, roles or what a user may see — anything it checks is only for convenience |
| Express API | Authenticates every request from the session cookie; checks role and ownership; validates input; enforces all business rules; calculates totals; returns JSON | Trust any user id, role, price or total sent by the client |
| PostgreSQL | Stores data; guarantees uniqueness and foreign keys; runs each order in one transaction; makes "accept only if still PLACED" atomic | Hold business logic in triggers |

### 1.3 Where rules are enforced

| Rule | Enforced in | Backed up by |
|---|---|---|
| Logged in, role (FR-04) | `requireAuth` / `requireRole` middleware on every protected route | API tests for 401 and 403 |
| Ownership (FR-08) | Order queries always filter by `customerId = session user` | API test: other customer's order → 404 |
| BR-01, BR-02, BR-04 | Strict Zod schema on `POST /api/orders` | DB unique `(order_id, menu_item_id)` for BR-02 |
| BR-03 | Order service inside one Prisma transaction | Nothing saved on error (transaction rolls back) |
| BR-05 | Order service copies name and price into `order_lines` | Lines are never updated after insert |
| BR-06 | `canTransition(from, to)` + transition table | Conditional update |
| BR-07 | `updateMany where { id, status: PLACED }`; 0 rows updated → 409 | Concurrency API test |

### 1.4 Request flow example: place an order (F-03)

1. Browser sends `POST /api/orders` with `{ items: [{ menuItemId, quantity }] }` and the session cookie.
2. `requireRole('CUSTOMER')` loads the session; missing/expired → 401, operator → 403.
3. Zod strict schema checks BR-01, BR-02 and rejects any extra field such as `price` (BR-04) → 400.
4. In one transaction: load the items; any missing or sold out → 400, nothing saved (BR-03); compute the total from DB prices; insert the order and lines with copied name and price (BR-05).
5. Respond 201 with the saved order. The UI goes to `/orders/:id`.

### 1.5 Code layout

| Path | Contents |
|---|---|
| `client/src/` | React screens, router, API helper |
| `server/src/app.ts` | Builds the Express app: JSON, cookies, routes, 404, error handler |
| `server/src/errors.ts` | `AppError` and the shared error handler |
| `server/src/db.ts` | The one Prisma client |
| `server/src/<feature>/` | Routes and logic per feature (added by F-01..F-04) |
| `server/prisma/` | `schema.prisma`, `migrations/`, `seed.ts` |
| `server/tests/` | Vitest + Supertest tests; `helpers.ts` resets the test DB |
| `e2e/` | Playwright tests |

## 2. UI conventions

Full screen-by-screen states are in [`ui/ui-spec.md`](ui/ui-spec.md); final designs in `docs/ui/design/`.

### 2.1 Screens and navigation

| Screen | Route | Role | Features |
|---|---|---|---|
| S1 Login | `/login` | public | F-01 |
| S2 Menu + cart | `/menu` (customer home) | CUSTOMER | F-02, F-03 |
| S3 My orders | `/orders` | CUSTOMER | F-03 |
| S4 Order detail | `/orders/:id` | CUSTOMER | F-03 |
| S5 Order queue | `/operator/orders` (operator home) | OPERATOR | F-04 |
| Not found | any other path | any | — |

`/` redirects: not logged in → `/login`, customer → `/menu`, operator → `/operator/orders`.
**Route guard:** on start the app calls `GET /api/auth/me`. No session → `/login`. A route for the other role → own home with "You don't have access to that page." This only helps the user; the API still enforces every rule (section 5).

### 2.2 Shared behaviour

| State | Behaviour |
|---|---|
| Loading | Grey placeholder rows; the action button is disabled and its label changes ("Logging in…", "Placing order…", "Accepting…"), which also stops double submits |
| Empty | White card with a bold one-line title, a short sentence and a next step where useful ("No orders yet." + Browse the menu) |
| Validation (client) | Required/format checks and cart limits (qty 1–10, max 20 lines, sold-out items not addable). Convenience only; the server re-checks |
| Error from API | Show the server's `error.message`. 400 → error box, keep the user's input, mark fields/lines named in `details`. 401 → back to `/login` with "Your session has ended. Please log in again." 403 → own home with "You don't have access to that page." 404 → "not found" state with a back link. 409 → show message, reload the data |
| Network / 500 | "Something went wrong. Please try again." + Try again |
| Money / time | Integer satang shown as `฿xx.xx`; times local (`10:15`, `Yesterday 12:02`, `3 Nov 09:40`) |
| Layout | Phone: bottom tab bar; desktop: sidebar. Works from 375 px to 1280 px+ (NFR-06) |

## 3. Data model

Source of truth: `server/prisma/schema.prisma` and `server/prisma/migrations/` (Issue #1). Table and column names are snake_case in the database, camelCase in code.

### 3.1 Entities and relationships

```
users 1 ──── * sessions          (a user can be logged in on several devices)
users 1 ──── * orders            (customer_id; only CUSTOMER users place orders)
orders 1 ─── * order_lines       (1–20 lines per order, BR-02)
menu_items 1 ─ * order_lines     (menu_item_id; name and price are copied, BR-05)
```

### 3.2 Tables

| Table | Column | Type | Constraint / note |
|---|---|---|---|
| `users` | `id` | int | PK, auto |
| | `email` | text | **unique**; login looks it up case-insensitive |
| | `name` | text | shown in header and operator queue |
| | `password_hash` | text | bcrypt only, never plain text (NFR-01) |
| | `role` | enum `Role` | `CUSTOMER` \| `OPERATOR` |
| | `created_at` | timestamp | default now |
| `sessions` | `id` | text | PK; 32 random bytes, base64url; the cookie value |
| | `user_id` | int | FK → `users.id`, **on delete cascade**; indexed |
| | `expires_at` | timestamp | login + 8 h; expired rows are refused and deleted |
| | `created_at` | timestamp | default now |
| `menu_items` | `id` | int | PK, auto |
| | `name` | text | **unique** (seed upserts by name) |
| | `price` | int | satang, > 0 (seed and F-05 validation) |
| | `is_available` | boolean | default true; false = sold out (DEC-04) |
| `orders` | `id` | int | PK, auto; shown to users as `#id` |
| | `customer_id` | int | FK → `users.id`; indexed; ownership check (FR-08) |
| | `status` | enum `OrderStatus` | default `PLACED`; values below |
| | `total` | int | satang; written once by the server (BR-04) |
| | `created_at` | timestamp | default now; queue and list ordering |
| | `updated_at` | timestamp | set by Prisma on every update |
| | `accepted_at` | timestamp, null | set by F-04 when accepted (migration in F-04) |
| `order_lines` | `id` | int | PK, auto |
| | `order_id` | int | FK → `orders.id`, on delete cascade |
| | `menu_item_id` | int | FK → `menu_items.id` |
| | `name` | text | copy of the menu name at order time (BR-05) |
| | `unit_price` | int | copy of the menu price at order time, satang (BR-05) |
| | `quantity` | int | 1–10 (BR-01, checked by the API schema) |
| | | | **unique (`order_id`, `menu_item_id`)** — no duplicate item in one order (BR-02) |

Indexes: `orders (status, created_at)` for the operator queue (PLACED, oldest first); `orders (customer_id)` for "my orders"; `sessions (user_id)`.

### 3.3 Order status

```
PLACED ──accept──► ACCEPTED ──► PREPARING ──► READY ──► PICKED_UP     (F-04, then F-07)
PLACED ──reject──► REJECTED                                           (F-06)
PLACED ──cancel──► CANCELLED                                          (F-06)
```

The enum already holds every status so later sprints need no enum migration. Allowed moves live in one transition table read by `canTransition(from, to)` (DEC-05); Sprint 1 allows only `PLACED → ACCEPTED`. Payment status (F-08) will be a separate column (DEC-08).

### 3.4 Integrity rules kept by the database

| Rule | How |
|---|---|
| One account per email | unique `users.email` |
| Order line copies survive menu changes (BR-05) | `name` and `unit_price` stored on `order_lines`; never updated |
| No duplicate item per order (BR-02) | unique (`order_id`, `menu_item_id`) |
| No partial order (BR-03, NFR-04) | order + lines inserted in one transaction |
| Accept at most once (BR-07) | `UPDATE orders SET status='ACCEPTED' … WHERE id=? AND status='PLACED'`; 0 rows → 409 |
| Money exact (DEC-03) | integer satang everywhere; no floats |

### 3.5 Migrations and seed

- Every schema change is a Prisma migration committed with the feature (`prisma migrate dev` locally; `prisma migrate deploy` in tests and production). Migrations only add things, so an older app version still runs on a newer schema.
- Seed (`server/prisma/seed.ts`, upsert, safe to repeat): users alice, bob (CUSTOMER), staff (OPERATOR) with password from `SEED_PASSWORD`; menu Latte 6500, Americano 5500, Thai Milk Tea 5000, Croissant 4500 (sold out), Ham & Cheese Sandwich 7500, Basil Chicken Rice 8000.
- Tests use a separate local `*_test` database, emptied before each test (`resetDb`).

## 4. API conventions

### 4.1 General

| Topic | Convention |
|---|---|
| Base path | Everything under `/api`, same origin as the web app (no CORS) |
| Format | JSON request and response bodies, UTF-8; field names camelCase |
| Auth | `sid` httpOnly cookie (section 6); no tokens in headers or URLs |
| Money | Integer satang (`6500` = ฿65.00); the client only formats it |
| Time | ISO 8601 UTC strings (`2026-11-07T03:15:00.000Z`); the client shows local time |
| Ids | Positive whole numbers up to 2147483647 (Postgres `int`) in paths and bodies; anything else → 400 `VALIDATION_ERROR`, never 500 |
| Lists | Plain JSON arrays, in a fixed documented order |
| Input checks | Zod schemas with `.strict()`: unknown fields are rejected (stops clients sending `price`, `total`, `role`, `customerId` — BR-04, NFR-02) |
| Success codes | 200 read/update, 201 created, 204 no content (logout) |
| Unknown `/api/*` path | 404 `NOT_FOUND` |

### 4.2 Errors

Every error body is `{ "error": { "code", "message", "details" } }` (NFR-03). `message` is safe to show to the user; `details` is `null` or structured data the UI uses to mark fields or lines. No stack traces or SQL text are ever sent.

| HTTP | `code` | When | Example `details` |
|---|---|---|---|
| 400 | `VALIDATION_ERROR` | Bad JSON, schema failure, bad id, business-rule failure on create (BR-01..BR-04) | Zod issues `[{ path, message }]`, or `{ items: [{ menuItemId, reason: "SOLD_OUT" \| "NOT_FOUND" \| "DUPLICATE" }] }` |
| 401 | `UNAUTHENTICATED` | No / unknown / expired session; wrong email or password | `null` |
| 403 | `FORBIDDEN` | Logged in with the wrong role | `null` |
| 404 | `NOT_FOUND` | Record missing **or** owned by another customer (DEC-07); unknown path | `null` |
| 409 | `INVALID_STATE` | Status change not allowed now (BR-06, BR-07) | `{ status }` current status |
| 500 | `INTERNAL_ERROR` | Anything unexpected (logged on the server only) | `null` |

### 4.3 Shared JSON shapes

```jsonc
// User (login, me)
{ "id": 1, "name": "Alice", "role": "CUSTOMER" }

// Menu item
{ "id": 1, "name": "Latte", "price": 6500, "isAvailable": true }

// Order (POST /api/orders, GET /api/orders/:id, accept)
{
  "id": 7, "status": "PLACED", "total": 18000,
  "createdAt": "2026-11-07T03:15:00.000Z", "acceptedAt": null,
  "lines": [ { "menuItemId": 1, "name": "Latte", "unitPrice": 6500, "quantity": 2, "lineTotal": 13000 } ]
}

// Order summary (GET /api/orders list)
{ "id": 7, "status": "PLACED", "total": 18000, "itemCount": 3, "createdAt": "2026-11-07T03:15:00.000Z" }

// Queue order (GET /api/operator/orders): Order + customer
{ "...Order fields": "...", "customer": { "id": 1, "name": "Alice" } }
```

### 4.4 Sprint 1 endpoints

Details, all error cases and tests are in the feature contracts (`docs/sprints/sprint-1/F-0x-*.md`). Who may call each endpoint: section 5.2.

| Method + path | Request | Success | Errors | Feature |
|---|---|---|---|---|
| `POST /api/auth/login` | `{ email, password }` | 200 User + `Set-Cookie: sid` | 400, 401 | F-01 |
| `POST /api/auth/logout` | — | 204, cookie cleared | — | F-01 |
| `GET /api/auth/me` | — | 200 User | 401 | F-01 |
| `GET /api/health` | — | 200 `{ ok: true }` (public, for smoke tests) | — | #1 |
| `GET /api/menu` | — | 200 Menu item[] by `id` | 401, 403 | F-02 |
| `POST /api/orders` | `{ items: [{ menuItemId, quantity }] }` | 201 Order | 400, 401, 403 | F-03 |
| `GET /api/orders` | — | 200 Order summary[] newest first | 401, 403 | F-03 |
| `GET /api/orders/:id` | — | 200 Order | 400, 401, 403, 404 | F-03 |
| `GET /api/operator/orders?status=PLACED` | — | 200 Queue order[] oldest first | 400, 401, 403 | F-04 |
| `POST /api/operator/orders/:id/accept` | — | 200 Order (ACCEPTED, `acceptedAt` set) | 400, 401, 403, 404, 409 | F-04 |

Later sprints add endpoints with the same conventions (planned paths in section 5.2).

## 5. Access control

### 5.1 Principles
- The server decides who the user is (session cookie → `sessions` row → user) and what they may do. The role is never read from the request body, query or a client-side setting.
- Hiding a button in the UI is not authorization. Every protected endpoint has `requireAuth` or `requireRole`.
- No session or expired session → **401 UNAUTHENTICATED**. Logged in with the wrong role → **403 FORBIDDEN**. A customer asking for a record they do not own → **404 NOT_FOUND** (does not reveal it exists).

### 5.2 Role / permission matrix

✔ allowed · ✘ refused (code) · — not applicable

| Operation | Endpoint | Anonymous | CUSTOMER | OPERATOR | Records the user may access | Sprint |
|---|---|---|---|---|---|---|
| Log in | `POST /api/auth/login` | ✔ | ✔ | ✔ | — | 1 |
| Log out | `POST /api/auth/logout` | ✔ (no-op) | ✔ | ✔ | own session only | 1 |
| Who am I | `GET /api/auth/me` | ✘ 401 | ✔ | ✔ | own user (id, name, role) | 1 |
| View menu | `GET /api/menu` | ✘ 401 | ✔ | ✘ 403 | all menu items | 1 |
| Place order | `POST /api/orders` | ✘ 401 | ✔ | ✘ 403 | creates an order owned by the session user | 1 |
| List my orders | `GET /api/orders` | ✘ 401 | ✔ | ✘ 403 | only orders where `customerId` = session user | 1 |
| Order detail | `GET /api/orders/:id` | ✘ 401 | ✔ own; other's → 404 | ✘ 403 | only own orders | 1 |
| Order queue | `GET /api/operator/orders?status=PLACED` | ✘ 401 | ✘ 403 | ✔ | all orders (one shop) | 1 |
| Accept order | `POST /api/operator/orders/:id/accept` | ✘ 401 | ✘ 403 | ✔ | any PLACED order | 1 |
| Manage menu / sold-out | `/api/operator/menu…` | ✘ 401 | ✘ 403 | ✔ | all menu items | 2 |
| Cancel order | `POST /api/orders/:id/cancel` | ✘ 401 | ✔ own, PLACED only | ✘ 403 | own orders | 2 |
| Reject order | `POST /api/operator/orders/:id/reject` | ✘ 401 | ✘ 403 | ✔ | any PLACED order | 2 |
| Prepare / ready / picked up | `POST /api/operator/orders/:id/{prepare,ready,pickup}` | ✘ 401 | ✘ 403 | ✔ | any order in the right status | 2 |
| Pay (simulated) | `POST /api/orders/:id/pay` | ✘ 401 | ✔ own | ✘ 403 | own orders | 2 |
| Sales summary | `GET /api/operator/sales` | ✘ 401 | ✘ 403 | ✔ | all orders (totals only) | 3 |
| Search orders | `GET /api/orders?…` / `GET /api/operator/orders?…` | ✘ 401 | ✔ own | ✔ all | as above | 3 |

Sprint 2–3 paths are planned names; their feature contracts confirm them.

## 6. Authentication and sessions

| Topic | Design |
|---|---|
| Accounts | Seeded only (no sign-up). Seed creates `alice@cafe.test`, `bob@cafe.test` (CUSTOMER) and `staff@cafe.test` (OPERATOR). |
| Passwords | Stored as bcrypt hashes (cost 10, `bcryptjs`). The plain password is never stored or logged. The seed password comes from env `SEED_PASSWORD`. |
| Login `POST /api/auth/login` | Body `{ email, password }` (strict Zod). Find user by email (case-insensitive), compare with bcrypt. Unknown email and wrong password give the **same** 401 "Incorrect email or password." On success: create a `sessions` row with id = 32 random bytes (`crypto.randomBytes`, base64url), `expiresAt` = now + 8 h; set cookie `sid`; return `{ id, name, role }`. |
| Cookie | `sid`, `HttpOnly`, `SameSite=Lax`, `Path=/`, `Max-Age` 8 h, `Secure` when `NODE_ENV=production`. The browser's JavaScript cannot read it. |
| Each request | `requireAuth` reads `sid`, loads the session with its user. Missing, unknown or expired (`expiresAt` ≤ now) → 401; an expired row is deleted. The user (id, role) is attached to the request for later checks. |
| Current user `GET /api/auth/me` | Returns `{ id, name, role }` of the session user, or 401. |
| Logout `POST /api/auth/logout` | Deletes the session row and clears the cookie. Returns 204 even if there was no session. Any later request with the old cookie → 401. |
| Fixed expiry | 8 h from login, not extended by activity (simple to test, enough for a café shift). |
| Login rate limit | Sprint 3 (NFR-08). |

## 7. Configuration and deployment

### 7.1 Environment variables (`server/.env`, from `server/.env.example`)

| Variable | Used for | Local value | Production |
|---|---|---|---|
| `DATABASE_URL` | Prisma connection | `postgresql://cafe:cafe@localhost:5433/cafe` (Docker) | Cloud SQL connection, from Secret Manager |
| `TEST_DATABASE_URL` | Automated tests (must be local `*_test`) | `…/cafe_test` | not set |
| `SEED_PASSWORD` | Password of seeded accounts | chosen by each developer | Secret Manager; never shown on screen |
| `PORT` | HTTP port | 3000 | set by Cloud Run |
| `NODE_ENV` | `production` turns on the `Secure` cookie flag (Express serving the built client is added with the Dockerfile in Lab 5) | unset | `production` |

### 7.2 Secrets
- Real values live only in `server/.env` (git-ignored) locally and in **Secret Manager** in GCP.
- `.env.example` holds placeholders only. No secret is in Git, the client bundle, logs or the PDF.
- The client has no secrets: it only calls same-origin `/api`.
- Tests refuse to run against any database that is not local and named `*_test`.

### 7.3 Database setup
- Local: `docker compose up -d` (Postgres 16, port 5433, named volume `pgdata` so data survives restarts).
- Schema changes only through Prisma migrations in `server/prisma/migrations/`, committed to Git. `prisma migrate dev` locally, `prisma migrate deploy` in tests and production. Migrations are additive so a rollback of the app does not need a schema rollback.
- Seed (`npm run db:seed`) is repeatable (upsert): same 3 users and 6 menu items every time.

### 7.4 Planned GCP deployment (Lab 5, Sprint 2)

```
 GitHub (PR → required CI check; merge to main → deploy workflow)
     │ build image tagged with commit SHA
     ▼
 Artifact Registry ──► Cloud Run service (one container: Express + built React, port from $PORT)
                         │            ▲
                         │            └─ Secret Manager: DATABASE_URL, SEED_PASSWORD
                         ▼
                      Cloud SQL for PostgreSQL 16 (durable storage, daily backups)
 Cloud Run job "migrate": prisma migrate deploy + seed, run before each release
```

| Part | Plan |
|---|---|
| Image | Multi-stage Dockerfile (from the Lab 5 kit): build client, build server, final image with `node` non-root user. |
| Runtime | Cloud Run, region `asia-southeast1`. Stateless: sessions are in the database, so any instance can serve any request. |
| Storage | Cloud SQL PostgreSQL 16. No files on the container disk. |
| Releases | GitHub Actions: CI on every PR (tests + Docker build); on merge to `main` build, push, run migrate job, deploy by image digest, smoke test `/api/health`. Rollback = redeploy an earlier image. |
| Cost / safety | Budget alert first; teardown script after the course. |

## Change log

| Date | Version | Change | Why |
|---|---|---|---|
| 6 Nov 2026 | 1 | Sections 1, 2, 5, 6, 7 (A); 3, 4 placeholders for B | Deliverable 1 part C |
| 6 Nov 2026 | 1.1 | Sections 3 data model and 4 API conventions (B) | Deliverable 1 part C |
| 6 Nov 2026 | 1.2 | 2.2 empty-state wording matches ui-spec; 7.1 says serving the built client comes in Lab 5 | Recheck #38: doc must match the code |
| 6 Nov 2026 | 1.3 | 4.1 ids: upper bound 2147483647 (recheck #37: larger ids gave 500) | Bug fix |
