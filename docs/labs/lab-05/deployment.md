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

## Changes from the reference (starter kit)

| Kit | Ours | Why |
|---|---|---|
| Names `toktickit*` | `food-order*`, database and user `cafe` | Our app |
| Separate `server/` and `client/` installs | One `npm ci` at the root | We use one npm workspace with one lock file |
| `ADMIN_PASSWORD`, `DEMO_USER_PASSWORD` secrets | `SEED_PASSWORD` (alice, bob, staff) and optional `SMOKE_PASSWORD` (`--smoke`) | Our seed reads only these |
| Migration `npm run prisma:seed` | `node dist/prisma/seed.js` (compiled) | No `tsx` or `.env` needed in the container |
| Smoke test: `/api/categories`, token login | `/api/menu` after a cookie login as `smoke@cafe.test`, then logout | Our menu needs a signed-in customer; our session is a cookie |
| `/api/health` → `{status: "ok"}` | `{ok: true}` | Kept from Sprint 1 (test AC-1.4) |
| Episode 6.2–6.3 in the Console | Same steps as `deploy/setup-github-access.sh` (dry run first) | Repeatable, and checked by an offline test in CI |

## Google Cloud

Project `cpe334-2026-team33`, region `asia-southeast1`. Public URL: https://food-order-d4jdyxqbca-as.a.run.app

| What | Name |
|---|---|
| Cloud Run service | `food-order` (min 0, max 3 instances, 512 MiB, port 3000, public) |
| Migration job | `food-order-migrate` (`npx prisma migrate deploy && node dist/prisma/seed.js`) |
| Artifact Registry repository / image | `food-order` / `food-order`, tag = full commit SHA |
| Cloud SQL | `food-order-pg` (PostgreSQL 16, `db-f1-micro`, enterprise edition, 10 GB, storage auto-increase off), database `cafe` |
| Secrets (Secret Manager) | `food-order-database-url`, `food-order-seed-password`, `food-order-smoke-password` |
| Runtime service account | `food-order-runner` (Cloud SQL Client; Secret Accessor on our secrets only) |
| Deployer service account | `food-order-deployer` (Cloud Run Developer; Artifact Registry Writer on our repository; Service Account User on the runner only; **no keys**) |
| Workload Identity | pool `github-actions`, provider `github-main`, only `vienggd/Food-order` (by ID), branch `main`, `deploy.yml`, environment `demo` |
| GitHub environment | `demo` (only `main` may deploy). Variables `GCP_PROJECT_ID`, `GCP_REGION`, `WIF_PROVIDER`, `WIF_SERVICE_ACCOUNT`, `SMOKE_EMAIL`; secret `SMOKE_PASSWORD` |

First setup (once, by the project Owner in Cloud Shell): `deploy/deploy.sh --smoke`, then
`deploy/setup-github-access.sh` — both with `DRY_RUN=1` first. Step by step: `docs/labs/lab-05/runbook.md`.
Done on 22 Nov 2026 from `main` `e3a4a84`. The gcloud CLI on Windows also works (Git Bash); there, call
`lib/gcloud.py` with the bundled Python, because `gcloud.cmd` breaks on arguments that contain spaces.
A new service account can take a few seconds before roles can be granted to it; if that step fails,
run the script again (it skips what already exists).

## CI (every pull request into `lab-5` and `main`)

`.github/workflows/ci-docker.yml`, job **`test-and-docker`**: offline deploy-script tests → `npm ci` →
`npm test` (server tests on a PostgreSQL 16 service) → `npm run build` → `docker build .`.
The ruleset `protect-main` (Active, empty bypass list) requires this check and one approval before merging into `main`.

## Release procedure

1. Issue (label `lab5`) → branch from the Issue → PR into `lab-5` → CI green → teammate review → merge commit.
2. Release PR `lab-5` → `main` → CI green → teammate approval → merge commit.
3. The push to `main` starts **Deploy demo** (`.github/workflows/deploy.yml`): CI again → keyless sign-in →
   build and push the image tagged with the commit SHA → `deploy/release.sh` (resolve the digest, run
   `food-order-migrate`, then point `food-order` at the same digest, 100% traffic) → `deploy/smoke_test.py`
   on the public URL. If the migration fails, the service is not changed.

### Which commit is running?

- The run summary of Deploy demo shows the image tag (= the commit SHA of `main`) and the digest.
- Cloud Run → `food-order` → Revisions → the newest revision's image shows the same digest, or:
  `gcloud run services describe food-order --region asia-southeast1 --format='value(spec.template.spec.containers[0].image)'`

### Rollback

Actions → Deploy demo → Run workflow → `image_tag` = full SHA of an earlier release. Tests, build and
migration are skipped; only the service is pointed back to that image. Run it again with the newer SHA to roll forward.
Data stays in Cloud SQL, so nothing is lost (migrations must stay backward compatible).
