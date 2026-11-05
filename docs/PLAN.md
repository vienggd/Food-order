# Project plan — Food-order (Campus Café Pre-order)

Read this first. It explains what we are building, what we already decided, and who does what.
The formal documents (SRS, SDS, etc.) will be written from this plan.

## 1. What we are building

A web app for **one campus café**. Customers order food before they arrive. Café staff (operators) see new orders and accept them.

- Course: CPE 334, Theme 4 (E-Commerce / Ordering). Pair work.
- Two roles: **CUSTOMER** and **OPERATOR**. All operators see all orders (one shop).
- Pickup is "ASAP" in Sprint 1. Pickup time slots come in Sprint 3.
- There is no sign-up page. Accounts come from the seed data.

## 2. Deadlines

| What | Due | Contents |
|---|---|---|
| **Deliverable 1 / Sprint 1** | **Sun 8 Nov 2026, 23:59** | Docs A–D, Sprint 1 contracts (E), working + tested Sprint 1 released on `main` (F), all in one PDF |
| Sprint 2 | Sun 29 Nov 2026 | F-05 to F-08 |
| Sprint 3 | Sun 13 Dec 2026 | F-09 to F-12 |

Deliverable 1 PDF parts:
- **A** SRS (requirements)
- **B** Feature inventory + traceability (requirement → feature → test)
- **C** System SDS (architecture, data model, API, auth, errors)
- **D** 3-sprint plan
- **E** Sprint 1 contracts per feature: feature SDS, acceptance criteria (AC), test spec (STS), definition of done (DoD)
- **F** Evidence: working Sprint 1 on `main`, test output, screenshots, release tag

## 3. Features by sprint

| ID | Feature | Sprint |
|---|---|---|
| F-01 | Login, logout, "who am I" (two roles) | 1 |
| F-02 | Browse menu (sold-out items greyed out) | 1 |
| F-03 | Place order, my orders, order detail | 1 |
| F-04 | Operator queue + accept order | 1 |
| F-05 | Menu management + sold-out toggle | 2 |
| F-06 | Customer cancel / operator reject with reason | 2 |
| F-07 | Fulfilment: PREPARING → READY → PICKED_UP | 2 |
| F-08 | Simulated payment | 2 |
| F-09 | Pickup time slots + order cut-off | 3 |
| F-10 | Sales summary | 3 |
| F-11 | Order search / filter | 3 |
| F-12 | Hardening: login rate limit, error states, accessibility | 3 |

## 4. Screens (Sprint 1)

| Screen | Route | Who | Feature |
|---|---|---|---|
| S1 Login | `/login` | anyone | F-01 |
| S2 Menu + cart | `/menu` | customer | F-02, F-03 |
| S3 My orders | `/orders` | customer | F-03 |
| S4 Order detail | `/orders/:id` | customer | F-03 |
| S5 Order queue | `/operator/orders` | operator | F-04 |

Details (every state: loading, empty, error, success): `docs/ui/ui-spec.md`.
Final screen designs: `docs/ui/design/index.html` (on `sprint-1`, from PR #13). Low-fi sketch: `docs/ui/wireframes.html`.

## 5. Technology

| Part | Choice |
|---|---|
| Frontend | React + Vite + TypeScript, React Router (`/client`) |
| Backend | Node 24 + Express + TypeScript, Zod for input checks (`/server`) |
| Database | PostgreSQL 16 + Prisma (migrations + seed) |
| Tests | Vitest + Supertest (unit + API tests against a real Postgres), Playwright (end-to-end in a browser) |
| Local run | Docker Compose starts Postgres |
| Production | One container: Express serves the built React app (Lab 5 style) |

## 6. Decisions we already made

### Login (F-01)
- Sessions are stored in a database table `sessions`. The browser gets a random session id in an **httpOnly cookie** (SameSite=Lax, Secure in production). Sessions last **8 hours**. Logout deletes the row.
- Passwords are hashed with **bcrypt**.
- The user's role always comes from the session on the server, **never** from what the browser sends.
- Unknown email and wrong password give the **same** error, so nobody can guess which emails exist.
- API: `POST /api/auth/login`, `POST /api/auth/logout`, `GET /api/auth/me`.
- Seeded accounts: `alice@cafe.test`, `bob@cafe.test` (customers), `staff@cafe.test` (operator). The password comes from the environment variable `SEED_PASSWORD`. It is **never** written in Git or the PDF.

### Orders
Full order life (whole product):

```
PLACED → ACCEPTED → PREPARING → READY → PICKED_UP
PLACED → REJECTED   (operator, with a reason)
PLACED → CANCELLED  (customer, before it is accepted)
```

Payment status is separate: UNPAID → PAID → REFUNDED (simulated, Sprint 2).
**Sprint 1 only builds PLACED → ACCEPTED**, using a transition table and a `canTransition()` function with unit tests.

### Business rules
| Rule | Meaning |
|---|---|
| BR-01 | Quantity per line is a whole number from 1 to 10 |
| BR-02 | An order has 1–20 lines, and the same menu item cannot appear twice (else 400) |
| BR-03 | Every item must exist and be available; otherwise reject the whole order and save nothing (one database transaction) |
| BR-04 | The server calculates the total from database prices. If the browser sends a price or total field, reply 400 |
| BR-05 | Each order line keeps a copy of the item name and unit price at order time |
| BR-06 | Only a PLACED order can be accepted; otherwise 409 |
| BR-07 | Two staff accepting at the same moment: exactly one gets 200, the other gets 409 (conditional update `where status = PLACED`) |

- Money is stored as whole numbers in **satang** (15500 = ฿155.00).
- Each menu item has `isAvailable` (true/false). The seed has one sold-out item.

### API errors
Every error looks like `{ "error": { "code", "message", "details" } }`. No stack traces.

| Code | HTTP | When |
|---|---|---|
| VALIDATION_ERROR | 400 | Bad input |
| UNAUTHENTICATED | 401 | Not logged in / session expired |
| FORBIDDEN | 403 | Wrong role |
| NOT_FOUND | 404 | Not there — also used for another customer's order |
| INVALID_STATE | 409 | Order is not in the right status |

### Sprint 1 API
| Method + path | Who | Feature |
|---|---|---|
| `POST /api/auth/login`, `POST /api/auth/logout`, `GET /api/auth/me` | anyone | F-01 |
| `GET /api/menu` | customer | F-02 |
| `POST /api/orders`, `GET /api/orders`, `GET /api/orders/:id` | customer | F-03 |
| `GET /api/operator/orders?status=PLACED`, `POST /api/operator/orders/:id/accept` | operator | F-04 |

## 7. How we work on GitHub

Full rules: `CLAUDE.md`. Short version:

- Branches: `main` (protected) ← `sprint-1` ← `feature/F-0x-...` or `docs/...`.
- Every task is an Issue on the [project board](https://github.com/users/vienggg/projects/4).
- Board columns: **Backlog → Specified → Started → PR Review → Fixing → Done**. Never skip a column.
- **Contract before code**: write the feature's SDS/AC/STS/DoD and commit it (card → Specified) before any code.
- **Tests first**: commit a failing test (`[red]`), then the code that makes it pass (`[green]`). Save the failing output in `docs/evidence/tdd/`.
- Pull requests go into `sprint-1`, not `main`. Write `Closes #<issue>` and link the issue to the PR.
- **Review**: the partner reviews, clicks **Approve**, merges (merge commit, never squash) and comments what they checked. Never approve or merge your own PR. The author replies to every review comment.
- Release: PR `sprint-1` → `main`, then tag `v0.1.0-sprint1`.

## 8. Who does what (proposed — change if you want)

| Together | Person A | Person B |
|---|---|---|
| Database schema, seed, project skeleton (Issue #1) | F-01 login, F-04 operator accept | F-02 menu, F-03 orders |
| | Doc A (SRS), SDS parts: auth, roles, config | Doc B (features + traceability), Doc D (sprint plan), SDS parts: data model, API |
| | Sunday: E2E tests + release PR | Sunday: PDF + screenshots |

Each person reviews the other's pull requests.

## 9. Weekend schedule (proposed)

| When | What |
|---|---|
| Fri night | Repo + board (done), skeleton, first drafts of docs A–D |
| Sat morning | Part E contracts for F-01..F-04, committed before code |
| Sat afternoon / night | Tests first, then code, for F-01..F-04; PRs into `sprint-1` |
| Sun morning | Playwright E2E tests, README run instructions |
| Sun afternoon | Release PR into `main`, tag, screenshots, test output |
| Sun evening | Build the PDF, submit by about 21:00 (deadline 23:59) |

## 10. Folder layout (planned)

```
/client            React app
/server            Express API
  /prisma          schema, migrations, seed
  /tests           unit + API tests
/docs
  PLAN.md          this file
  srs.md, features.md, traceability.md, system-sds.md
  sprints/plan.md
  sprints/sprint-1/F-01-*.md ... F-04-*.md   (contracts)
  evidence/        test output, screenshots, tdd/ red outputs
  ui/              ui-spec.md, wireframes.html, design/
docker-compose.yml
README.md
CLAUDE.md
```

## 11. AI use

We use Claude to draft the skeleton and documents and to help write failing tests first. We both review, change and commit everything through our own branches and PRs, and we must both be able to explain every part. We keep a short AI-use declaration for the PDF.
