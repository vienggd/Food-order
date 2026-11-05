# Food-order — Campus Café Pre-order

CPE 334 group project (Theme 4: E-Commerce / Ordering). Customers pre-order food from the campus café; operators (staff) accept and prepare orders.

## Status

Sprint 1 in progress (due Sun 8 Nov 2026): login, menu, place order, operator accept.

## Docs

- **Start here — project plan:** [`docs/PLAN.md`](docs/PLAN.md) (what we build, decisions, sprints, who does what)
- Team workflow rules: [`CLAUDE.md`](CLAUDE.md)
- UI wireframes: [`docs/ui/wireframes.html`](docs/ui/wireframes.html)
- UI spec (screens, states, errors): [`docs/ui/ui-spec.md`](docs/ui/ui-spec.md)

## How we work

- `main` is protected: changes arrive only by pull request with 1 approval.
- Flow: `feature/F-0x-...` → `sprint-1` → `main` (merge commits, no squash).
- Each feature has a GitHub Issue (titled with its ID, e.g. `F-01`) on the project board.

## Run it locally

You need Node 24 and Docker Desktop (running).

```bash
npm install                              # 1. install packages (client + server)
cp server/.env.example server/.env       # 2. then set SEED_PASSWORD in server/.env
npm run db:up                            # 3. start Postgres 16 in Docker (port 5433)
npm run db:migrate                       # 4. create the tables
npm run db:seed                          # 5. add 3 accounts + the menu
npm run dev                              # 6. API on :3000, app on http://localhost:5173
npm test                                 # 7. server tests (uses the cafe_test database)
```

Seeded accounts: `alice@cafe.test`, `bob@cafe.test` (customers), `staff@cafe.test` (operator). Their password is the `SEED_PASSWORD` you chose; it is never stored in Git.

| Folder | What |
|---|---|
| `client/` | React + Vite + TypeScript app |
| `server/` | Express + TypeScript API; `prisma/` schema, migrations, seed; `tests/` Vitest + Supertest |
| `e2e/` | Playwright end-to-end tests (`npm run test:e2e`) |
| `docs/` | Plan, SRS, SDS, feature contracts, evidence |
