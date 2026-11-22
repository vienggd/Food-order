# Lab 5 deployment — Campus Café Pre-order

## Stack

React + Vite + TypeScript (`client/`) and Node 24 + Express 5 + TypeScript + Prisma (`server/`), PostgreSQL 16.
In production one container runs Express, which serves both `/api/*` and the built React app (`client/dist`).

## Environment variables

Every variable the app reads. Real values are never committed; `server/.env.example` has placeholders only.
The client reads no environment variables (it calls `/api` on the same origin).

| Name | Purpose | Secret? | Where the value comes from |
|---|---|---|---|
| `DATABASE_URL` | Database connection for the app, migrations and seed | Yes | Local: `server/.env`. Cloud: Secret Manager |
| `TEST_DATABASE_URL` | Local test database (`*_test`, wiped by tests) | No (local only) | Local: `server/.env`. CI: workflow env |
| `SEED_PASSWORD` | Password of the seeded accounts (alice, bob, staff) | Yes | Local: `server/.env`. Cloud: Secret Manager. CI: throwaway value |
| `SMOKE_PASSWORD` | Optional. Password of `smoke@cafe.test`, created by the seed only when set | Yes | Cloud: Secret Manager |
| `PORT` | Port the server listens on (default 3000) | No | Cloud Run sets it |
| `NODE_ENV` | `production` turns on the secure session cookie | No | Docker image / Cloud Run |
| `CLIENT_DIST` | Optional. Folder of the built React app (default `../client/dist`) | No | Default is used |

## Local commands

| Step | Command |
|---|---|
| Install | `npm ci` |
| Database | `npm run db:up` |
| Migrate | `npm run db:migrate` |
| Seed | `npm run db:seed` (or `node dist/prisma/seed.js` after a build, in `server/`) |
| Test | `npm test` |
| Build | `npm run build` |
| Run (production mode) | `npm run build`, then in `server/`: `NODE_ENV=production npm start`, open http://localhost:3000 |
| Health | `GET /api/health` → `{ ok: true }`; `GET /api/ready` → `{ status: "ready", db: "connected" }` or 503 |

## Docker

One image from the root `Dockerfile` (Node 24 alpine, non-root `node` user, port 3000): Express serves `/api/*` and the built React app.
The same image runs the migration job: `npx prisma migrate deploy && node dist/prisma/seed.js` (both safe to run twice).
We use only the root image, not the kit's separate `server/Dockerfile`, `client/Dockerfile` and `nginx.conf`: one image is what Cloud Run runs, and the session cookie stays on one origin.

| Step | Command |
|---|---|
| Build the image | `docker build -t food-order .` |
| Run everything locally (db + migrate + app) | `SEED_PASSWORD=<your choice> docker compose --profile app up --build -d`, open http://localhost:3000 |
| Check | `curl http://localhost:3000/api/ready` → `{"status":"ready","db":"connected"}` |
| Stop (data kept in volume `pgdata`) | `docker compose --profile app down` |
| Start again | `docker compose --profile app up -d` |
| Delete local data | `docker compose --profile app down -v` |

`npm run db:up` still starts only the database, for development and tests.
