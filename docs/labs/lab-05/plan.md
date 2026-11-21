# Lab 5 plan — Docker, CI/CD and GCP deployment (Food-order)

For **vieng** (`vienggd`) and **ninja** (`NinjoMUDA`). Read this before starting any Lab 5 Issue.
Sources (in `docs/labs/lab-05/Lab5/`, kept on our laptops only, ignored by Git):
`01_SE_Lab_5_updated (1).pdf` (handout, the rules), `03_Student-Guide-...pdf`
(Episodes 0–10, the how-to), `02_lab5-starter-kit.zip` (template files for TokTickIT).
If the guide or kit disagrees with the handout, **the handout wins**.

---

## 0. Deadline

The handout said Sun 15 Nov 2026; the TA has moved the due date. New due date: **____** (fill in).
Plan for **2 working days** of work anyway, so we have buffer.

---

## 1. What Lab 5 asks for (in one picture)

```
feature branch ──PR──▶ lab-5 (staging) ──release PR──▶ main ──auto──▶ GCP Cloud Run
      │                     │                           │                │
   CI runs              CI runs                     CI runs again    smoke test
 (tests + docker)    + teammate review          + build image       on public URL
                                                + migrate DB
```

- The app runs on Google Cloud at a **public URL**, with the database in **Cloud SQL** (data survives restarts).
- Every Pull Request runs **build + tests**. A failing check **blocks the merge** into `main`.
- Merging into `main` **deploys automatically**, and we can show **which commit** is running.

### Rubric (100 points)

| Part | Points | What the TA wants to see |
|---|---|---|
| 1. CI and quality gate | 30 | CI workflow file; a passing PR (C-01); the ruleset on `main`; a failing PR from a temporary branch that cannot merge (C-02) |
| 2. Docker and config | 20 | `Dockerfile`, `.dockerignore`; fresh clone builds and runs (C-03); `.env.example` + env-var table, no secrets in Git |
| 3. GCP deployment and persistence | 35 | Public URL; sign in + place order + one rejection on the live URL (C-04); data still there after restart and redeploy (C-05) |
| 4. Repeatable release pipeline | 15 | One labelled change: Issue → PR into `lab-5` with real review → release PR → CI → auto deploy; running revision = release commit (C-06) |

### Requirements we must meet (R-01 to R-12, short version)

| ID | Requirement | How we meet it |
|---|---|---|
| R-01 | Docker; fresh clone builds a working container | Root `Dockerfile` (one image: React + Express) + `docker-compose.yml` |
| R-02 | Every setting from env vars, documented, no secret in Git | `server/.env.example` + table in `deployment.md` |
| R-03 | Public URL on GCP, full workflow works | Cloud Run service `food-order` |
| R-04 | Data survives restart and redeploy | Cloud SQL Postgres; sessions already in DB |
| R-05 | Build + tests on every PR | `.github/workflows/ci-docker.yml`, job `test-and-docker` |
| R-06 | Failed check blocks merge | GitHub ruleset `protect-main` + proof PR `test/prove-gate` |
| R-07 | Deploy from `main` through a pipeline | `.github/workflows/deploy.yml` |
| R-08 | Know which commit runs; documented procedure | Image tag = full commit SHA; `deployment.md` |
| R-09 | Issues, board, branches, PRs into staging, teammate review, release PR | Same flow as Sprint 1 (CLAUDE.md), staging = `lab-5` |
| R-10 | Label Lab 5 Issues/PRs, never rewrite history | Label **`lab5`** on every Lab 5 Issue and PR |
| R-11 | Both members do everything; name both in pair work | Split below; reviews always by the other person |
| R-12 | Repo public | Already public ✅ (keep it public until grading ends) |

---

## 2. Where we are now (checked 21 Nov)

| Thing | Status |
|---|---|
| Sprint 1 release | ✅ `v0.1.0-sprint1` on `main` |
| Repo public | ✅ `vienggd/Food-order` (moved from `vienggg`; old URL still redirects) |
| Secret scanning + push protection | ✅ already on |
| Staging branch for Lab 5 | ✅ `lab-5` created from `main`, pushed, and up to date with `main` (includes #58 docs move and #60) |
| GCP account and project (Ep. 0–1) | ✅ done by **vieng** (Owner): Free Trial, project, budget alert. Still to do: add ninja as **Editor** if not done, and record it in Issue L5-1 with screenshots |
| Sessions stored in the database | ✅ (`sessions` table) |
| Server reads `PORT` | ✅ `server/src/index.ts` |
| Seed passwords from env (`SEED_PASSWORD`), seed safe to rerun | ✅ (upserts) |
| No dev shortcuts / role picker | ✅ |
| `/api/health` | ✅ returns `{ ok: true }` |
| `/api/ready` (checks the DB) | ❌ **missing** |
| Express serves the built React app (one container) | ❌ **missing** — today React only runs through Vite dev server |
| Seed runnable inside a container | ❌ seed script uses `tsx --env-file=.env` (no `.env` in the cloud) |
| Server tests runnable in CI | ❌ `tests/env.ts` and `global-setup.ts` call `process.loadEnvFile(".env")`, which **crashes** if `.env` is missing |
| Dockerfile / `.dockerignore` | ❌ none (compose only starts Postgres) |
| `.github/workflows/` | ❌ none |
| `main` protection | ⚠️ old-style branch protection, 1 approval, **no required check**, and admins can probably bypass it (PR #15 merged into `main` with no approval). Lab 5 needs a **ruleset** with an empty bypass list. |
| Label `lab5` | ❌ not created yet |
| Lab 5 course files | ✅ moved to `docs/labs/lab-05/Lab5/` and ignored by Git (`.gitignore`: `docs/labs/*/Lab*/`) |
| `CLAUDE.md` / `AGENTS.md` | ⚠️ owner fixed to `vienggd` in #60, but the staging line still says `sprint-1` → add `lab-5` (L5-10). `AGENTS.md` is untracked |

---

## 3. Decisions (normal choices already picked — change any before we start)

| Topic | Choice | Why |
|---|---|---|
| Staging branch | `lab-5` | The guide's `staging`; matches our `sprint-1` naming |
| Region | `asia-southeast1` (Singapore) | Closest to Thailand, used by the guide |
| GCP project ID | `cpe334-food-order` (add a number if taken) | Course code + app name, as the guide asks |
| Resource names | see table below | Rename every `toktickit` in the kit to `food-order` the same way everywhere |
| Container layout | **One image**: Express serves `/api/*` and the built React files | What the kit does; one Cloud Run service; same origin, so the session cookie just works |
| Secrets | `food-order-database-url`, `food-order-seed-password` (and optional `food-order-smoke-password`) in Secret Manager | Our app needs only `DATABASE_URL` and `SEED_PASSWORD`; the kit's admin/demo passwords map to `SEED_PASSWORD` |
| Demo accounts in the cloud | Yes: alice, bob, staff with a **generated** `SEED_PASSWORD` | Lab 6 partner team needs them; share the password privately, never on screen |
| Smoke test | `/api/health`, `/api/ready`, `/`, then **login as a smoke customer → `/api/menu` → logout** (cookie, not token) | Our menu needs a login, and the kit's login check uses a token we don't have |
| Smoke account | New seeded customer `smoke@cafe.test`, password from env `SMOKE_PASSWORD` (seeded only if set) | Guide says use a dedicated lowest-role account, not a demo account |
| Health response | Keep `{ ok: true }`; change the smoke check to match | Avoids changing a Sprint 1 test (AC-1.4) |
| Image tag | Full commit SHA, deploy by digest | Kit default; gives R-08 for free |
| Migrations | Separate Cloud Run job `food-order-migrate`: `prisma migrate deploy` + compiled seed | Kit default; must be safe to run twice (ours are) |
| Cloud Run scaling | min 0, max 3, 512 MiB | Cost control |
| Cloud SQL | `db-f1-micro`, `--edition=enterprise`, 10 GB, auto-increase **off** | Cheapest; handout says add `--edition=enterprise` for PG16 |
| Rollback (Ep. 8) | Do it (recommended, cheap, good evidence) | Strong proof for persistence (C-05) |

### Resource names

| What | Kit (TokTickIT) | Ours |
|---|---|---|
| Cloud Run service | `toktickit` | `food-order` |
| Migration job | `toktickit-migrate` | `food-order-migrate` |
| Artifact Registry repo / image | `toktickit/toktickit` | `food-order/food-order` |
| Cloud SQL instance | `toktickit-pg` | `food-order-pg` |
| Database / DB user | `toktickit` | `cafe` / `cafe` |
| Runtime service account | `toktickit-runner` | `food-order-runner` |
| Deployer service account | `toktickit-deployer` | `food-order-deployer` |
| WIF pool / provider | `github-actions` / `github-main` | same |
| GitHub environment | `demo` | `demo` (keep) |
| Required check (CI job) | `test-and-docker` | `test-and-docker` (keep) |
| Ruleset | `protect-main` | `protect-main` |

### Who owns what

- **vieng owns the GCP project** (Owner) and is the GitHub repo admin. Only the Owner can grant **IAM** roles, so vieng runs Ep. 5 and 6.2–6.3; only the repo admin can change Settings, so vieng runs 6.4–6.5.
- **ninja** (GCP **Editor**, repo collaborator) therefore takes most of the **code** work (cloud-ready, Docker, CI, deploy pipeline) and the rollback runs, so both of us still touch every part (R-11). Every PR is reviewed by the other person.
- Fill in the GCP **Project ID** here once (not secret): `__________`.

---

## 4. Issues, owners and order

Every Issue: label `lab5` (+ `setup` or `docs`), added to the board in **Backlog**, then moved column by column (CLAUDE.md flow). Console/Settings work still gets an Issue, closed with a screenshot (no secrets in it).
Owners alternate so **both** of us touch Docker, CI, GCP and review (R-11). The reviewer is always the other person.

| # | Issue (guide episode) | Owner | Reviewer | Branch | Done when |
|---|---|---|---|---|---|
| L5-0 (#61) | This plan + tidy course files (`.gitignore`) | vieng | ninja | `docs/L5-0-plan` (exists locally) | Plan merged into `lab-5`; course PDFs/zip not in Git |
| L5-1 (#62) | GCP Free Trial, project, add teammate as Editor, budget alert (Ep. 1) | vieng | ninja | none (Console) | ✅ done — still create the Issue and close it with screenshots: Credits USD 300, billing `True`, budget, ninja listed as Editor (no secrets) |
| L5-2 (#63) | Make the app cloud-ready (Ep. 2) | ninja | vieng | `feature/L5-2-cloud-ready` | `/api/ready`; Express serves React in production; seed runs without `.env`; tests run without `.env`; `.env.example` complete; first `deployment.md`; tests pass |
| L5-3 (#64) | Docker (Ep. 3) | ninja | vieng | `feature/L5-3-docker` | `docker compose up --build` starts db + migrate + app; health/ready OK; login works; an order survives `down` / `up` |
| L5-4 (#65) | CI on Pull Requests (Ep. 4) | vieng | ninja | `feature/L5-4-ci` | `test-and-docker` runs and passes on the PR into `lab-5`; first release PR `lab-5 → main` passes too |
| L5-5 (#66) | First deploy to GCP from Cloud Shell (Ep. 5) | vieng | ninja | none (script; `deploy/deploy.sh` adapted in L5-4) | Dry run read; URL loads; `/api/ready` OK; can sign in; storage auto-increase off |
| L5-6 (#67) | Connect GitHub to GCP + merge gate (Ep. 6) | vieng (6.1–6.5), ninja (6.6 prove gate) | other | `test/prove-gate` (throwaway) | `demo` env + 4 variables; WIF provider; deployer has **no keys**; ruleset Active, empty bypass, `test-and-docker` required; ninja's failing PR blocked (C-02) |
| L5-7 (#68) | Auto deploy + smoke test + visible change (Ep. 7) | ninja (deploy.yml), vieng (visible change) | other | `feature/L5-7-auto-deploy`, `feature/L5-7-deploy-proof` | Two green "Deploy demo" runs; second one shows a visible change on the URL; revision digest = run summary (C-06) |
| L5-8 (#69) | Persistence, rollback, roll forward (Ep. 8) | ninja | vieng | none (Actions + app) | Order created → restart + rollback to release A → still there → roll forward → still there (C-05) |
| L5-9 (#70) | `deployment.md` final + evidence + PDF (Sec. 4.3, 12) | both (pair) | — | `docs/L5-9-report` | PDF `lab5_sec<section>_<group>.pdf` with Answer Part 0–4 and evidence index |
| L5-10 (#71) | Update `CLAUDE.md`/`AGENTS.md` (staging `lab-5`) | vieng | ninja | `docs/L5-10-agent-rules` | Both AI-agent rule files name `lab-5` as the Lab 5 staging branch |

### Order (what blocks what)

```
L5-0 plan, L5-1 ✅ GCP, L5-10 (small, any time)
L5-2 cloud-ready ─▶ L5-3 docker ─▶ L5-4 CI ─▶ release #1 to main ─▶ L5-5 first deploy ─▶ L5-6 gate ─▶ L5-7 auto deploy ─▶ L5-8 rollback ─▶ L5-9 PDF
```
Costs start at **L5-5** (Cloud SQL), so do L5-5 → L5-8 close together, ideally the same day.

### Two-day schedule

| When | vieng | ninja |
|---|---|---|
| Day 1 morning | Create label `lab5` + all Issues; L5-0, L5-1 evidence, L5-10; review L5-2 | **L5-2** cloud-ready |
| Day 1 afternoon | **L5-4** CI (+ adapt `deploy/` scripts); review L5-3 | **L5-3** Docker; review L5-4 |
| Day 1 evening | release PR #1 `lab-5 → main` (ninja approves) | approve release #1 |
| Day 2 morning | **L5-5** first deploy; **L5-6.1–6.5** (WIF, env, ruleset) | **L5-6.6** prove the gate; start **L5-7** deploy.yml |
| Day 2 afternoon | L5-7 visible change + release #3; review | **L5-7** release #2; **L5-8** rollback |
| Day 2 evening | **L5-9** PDF together; both re-check the Definition of Done | same |

---

## 5. Code changes in detail (what L5-2, L5-3, L5-4, L5-7 must change)

### L5-2 cloud-ready (tests first where it is code)
1. `GET /api/ready` → `SELECT 1` via Prisma; `200 { status: "ready", db: "connected" }`, or `503 { status: "not_ready" }`. Add a Supertest test (and a unit test for the 503 path with a failing DB stub).
2. Production static serving in `server/src/app.ts`: when `NODE_ENV=production`, serve `client/dist` (path from env `CLIENT_DIST`, default `../client/dist`) and send `index.html` for any non-`/api` GET (React Router). Keep `/api` 404 JSON as is. Test: with a temp dist folder, `/` returns HTML and `/menu` returns `index.html`.
3. `app.set("trust proxy", 1)` (Cloud Run is behind Google's proxy; needed for correct `req.secure`/IPs, harmless locally).
4. Seed in the container: run the compiled file `node dist/prisma/seed.js` (already compiled by `tsc`), and change the `prisma.seed` script to `tsx --env-file-if-exists=.env prisma/seed.ts` so it also works with no `.env`.
5. Seed must not undo operator changes in later sprints: on update, keep `isAvailable` and `price` as they are in production (create-only for menu fields). Add/adjust the seed test. Optional `smoke@cafe.test` customer when `SMOKE_PASSWORD` is set.
6. Tests without `.env`: in `tests/env.ts` and `tests/global-setup.ts`, only load `.env` if it exists (`existsSync` check), so CI can pass `TEST_DATABASE_URL` as a normal env var.
7. `server/.env.example`: list every variable the app reads, with comments: `DATABASE_URL`, `TEST_DATABASE_URL`, `SEED_PASSWORD`, `SMOKE_PASSWORD` (optional), `PORT`, `NODE_ENV`, `CLIENT_DIST` (optional), `TZ`.
8. First `docs/labs/lab-05/deployment.md` (stack, env-var table, local commands). Copy the six-point checklist from guide 2.2 into the PR description with notes.

### L5-3 Docker
- Our repo is an **npm workspace** with **one root `package-lock.json`**; the kit runs `npm ci` inside `server/` and `client/` separately. Ours must copy the root `package.json` + `package-lock.json` + both workspace `package.json` files, then `npm ci` at the root.
- Root `Dockerfile` (3 stages): build client → build server (`prisma generate && tsc`) → slim runtime on `node:24-alpine` with `openssl`, non-root `node` user, `CMD ["node", "dist/src/index.js"]`, `PORT=3000`.
- `.dockerignore`: `node_modules`, `**/.env`, `.git`, `docs`, `e2e`, `test-results`, `playwright-report`, `**/dist`.
- `docker-compose.yml`: keep `db` (port 5433 on our laptops), add `migrate` (runs `npx prisma migrate deploy && node dist/prisma/seed.js`, needs `SEED_PASSWORD` from the shell/`.env`, no default real password) and `app` (port 3000, depends on `migrate` finishing). We use the **single root image** for both `migrate` and `app`, so we skip the kit's separate `server/Dockerfile`, `client/Dockerfile` and `nginx.conf` — write that choice in `deployment.md`.
- Local check: `docker compose up --build -d`, `docker compose ps -a` (migrate `exited (0)`), `curl.exe --fail http://localhost:3000/api/ready`, log in, place an order, `docker compose down`, `up -d`, order still there.

### L5-4 CI (`.github/workflows/ci-docker.yml`)
- Triggers: `pull_request` into `[main, lab-5]`, plus `workflow_call` and `workflow_dispatch` (keep both).
- Keep job name **`test-and-docker`**, `permissions: contents: read`, `concurrency`.
- Steps: checkout → Node 24 (`npm` cache) → Python 3 + deploy script tests → `npm ci` at root → Postgres 16 service (`cafe/cafe`, DB `cafe_test`) → `TEST_DATABASE_URL=postgresql://cafe:cafe@localhost:5432/cafe_test` and `SEED_PASSWORD=ci-only-not-secret` → `npm test --workspaces` → `npm run build` → `docker build .` (no push).
- Optional (not required): Playwright E2E job. Leave out at first; add later if CI time allows.
- Pin each action to a full commit SHA (copy the SHAs the kit uses) and copy `.github/dependabot.yml`.
- Copy the whole kit `deploy/` folder now (CI runs its offline tests), renamed to our names.

### L5-7 deploy pipeline
- Copy `.github/workflows/deploy.yml`; set `SERVICE_NAME: food-order`, `MIGRATE_JOB_NAME: food-order-migrate`, image path `food-order/food-order`. Keep `environment: demo`, the `if:` conditions, and the `image_tag` rollback input unchanged.
- `deploy/release.sh`: same renames (defaults + both image paths).
- `deploy/smoke_test.py`: `/api/health` expects `ok == true`; `/api/ready` expects `db == "connected"`; `/` expects HTML; replace `/api/categories` with login (`SMOKE_EMAIL` / `SMOKE_PASSWORD`, cookie jar) → `GET /api/menu` non-empty → `POST /api/auth/logout`. Update `deploy/tests/test_smoke.py` to match.
- `deploy/deploy.sh`: renames; DB URL format `postgresql://cafe:PASS@localhost/cafe?host=/cloudsql/PROJECT:REGION:food-order-pg`; secrets = DB URL + `SEED_PASSWORD` (+ optional `SMOKE_PASSWORD`); migration args `-c,npx prisma migrate deploy && node dist/prisma/seed.js`; `--port 3000`; drop the admin-email message (we have no admin).
- `deploy/teardown.sh`: renames (used only after grading).
- Visible change for 7.7 (vieng): e.g. a small footer "Campus Café · release 2" on the login page, with its test updated.

---

## 6. Evidence we must collect (for the PDF)

Take screenshots **while** doing each step, not afterwards. Crop, keep text readable, **blur any secret**, and number each caption like: *"Figure 3. C-02 (R-06): PR #NN from `test/prove-gate`; `test-and-docker` failed and merging is blocked. Commit abc1234."*

| Check | Evidence | From Issue |
|---|---|---|
| C-01 passing PR | PR link + Actions run link + test summary (counts) | L5-4 |
| C-02 blocked PR | PR link; screenshot of red check + "Merging is blocked"; ruleset screenshot | L5-6 |
| C-03 fresh clone | Commands + output of `git clone` → `.env` from `.env.example` → `docker compose up --build` → ready OK | L5-3 |
| C-04 live workflow | Screenshots with URL bar: login, place order, one rejection (e.g. 403 customer on operator queue, or sold-out item rejected) | L5-5 / L5-7 |
| C-05 persistence | Order shown before and after restart **and** after redeploy/rollback | L5-8 |
| C-06 release | Issue → PR into `lab-5` (with specific review) → release PR → Deploy demo run → Cloud Run revision digest = run summary SHA | L5-7 |
| GCP setup | Billing credits, budget, Cloud SQL (auto-increase off), Secret Manager names only, runner roles, deployer **no keys** | L5-1, L5-5, L5-6 |

PDF: `lab5_sec<section>_<group name>.pdf`, headings **Answer Part 0** to **Answer Part 4**, links first, screenshots only when a link can't show it. Part 0 = team, IDs, GitHub usernames, repo link, release tag/commit, URL + serving commit, contribution table, evidence index. We can reuse `scripts/evidence.mjs` (Sprint 1) to render it.

---

## 7. Safety rules (both of us, and both AI agents)

- **Never** paste a password, `DATABASE_URL`, key or token into a chat, Issue, commit, screenshot or the PDF. Check `git status` and the diff before every commit. If a secret leaks: change it at once (DB user password **and** the secret version), redeploy, tell a TA.
- **Never** create a JSON key for a service account.
- AI agents may **propose** `gcloud` commands; a human reads each one and runs it. AI agents never change billing, IAM or the database on their own.
- Do not click **Upgrade** or pay a prepayment in GCP.
- Cloud SQL costs money every hour it exists (~USD 14–18/month total). Keep the service **running until grading ends** (handout), then pause (Ep. 9) or tear down (Ep. 10) only after the instructor says so.
- When a deploy fails: read the failed step's log first, then fix. Give an AI agent the log excerpt and ask for the cause before asking for a fix.

---

## 8. Definition of Done for Lab 5 (tick all before submitting)

- [ ] A fresh clone builds and runs; every setting comes from env vars; no secret in the repo, image, logs or PDF
- [ ] The public URL serves the latest release from `main`; the workflow works there; we can show the running commit
- [ ] Data survived a restart and a redeploy
- [ ] CI runs on every PR into `lab-5` and `main`; a failing required check blocks the merge
- [ ] The latest release reached `main` through reviewed PRs and was deployed by the pipeline
- [ ] Repo is public
- [ ] `deployment.md` and the evidence index are complete; either of us can explain any step
- [ ] PDF named `lab5_sec<section>_<group name>.pdf`
