# Lab 5 report (draft for the PDF)

PDF name: `lab5_sec<section>_<group name>.pdf`. Headings stay exactly "Answer Part 0" … "Answer Part 4".
Links first; a screenshot only when a link cannot show it. Every screenshot gets a numbered caption:
what it shows, which check/requirement, and the commit/run/URL. Blur any secret.
`TODO` marks what we fill in on the day.

## Answer Part 0: Team and Evidence Index

- Team: TODO number · topic: Food-order (campus café pre-order)
- Members:

  | Name | Student ID | GitHub |
  |---|---|---|
  | vieng | TODO | `vienggd` |
  | ninja | TODO | `NinjoMUDA` |

- Repository (public): https://github.com/vienggd/Food-order
- Submitted release: commit TODO on `main` (release PR TODO)
- Public URL: TODO `https://food-order-….run.app` — serving commit TODO (Deploy demo run TODO)

### Contribution

| Issue | Work | Owner | Reviewer | PR |
|---|---|---|---|---|
| #61 | Lab 5 plan | vieng | ninja | TODO |
| #62 | GCP account, project, budget, teammate as Editor | vieng | ninja | — |
| #63 | Cloud-ready app (`/api/ready`, static React, env-only config) | ninja | vieng | TODO |
| #64 | Dockerfile, `.dockerignore`, compose | ninja | vieng | TODO |
| #65 | CI `test-and-docker`, deploy scripts | vieng | ninja | TODO |
| #66 | First deploy from Cloud Shell | vieng | ninja | — |
| #67 | WIF, `demo` environment, ruleset, prove the gate | vieng + ninja | other | TODO (gate PR) |
| #68 | `deploy.yml`, smoke test, visible change | vieng | ninja | TODO |
| #69 | Restart, rollback, roll forward | ninja | vieng | — |
| #70 | `deployment.md`, this report | both | — | TODO |
| #71 | Agent rule files | vieng | ninja | TODO |

### Evidence index

| Rubric part | Artifact / direct link | IDs / version | Verification result |
|---|---|---|---|
| 1. CI and quality gate | PR TODO + Actions run TODO | C-01, commit TODO | `test-and-docker` passed (N server, N client tests) |
| 1. CI and quality gate | PR TODO from `test/prove-gate` | C-02, commit TODO | check failed; merge blocked |
| 2. Docker and config | `Dockerfile`, `.dockerignore`, `server/.env.example`, `deployment.md` | C-03, commit TODO | fresh clone builds and runs; no secret in Git |
| 3. GCP deployment | Public URL; live workflow screenshots | C-04, release TODO | login, order, rejection work on the live URL |
| 3. GCP deployment | Persistence screenshots | C-05, release TODO | order present after restart and redeploy/rollback |
| 4. Release pipeline | Issue #68 → PR TODO → release PR TODO → Deploy demo run TODO | C-06, commit TODO | running revision digest = run summary |

## Answer Part 1: CI and Quality Gate

- CI workflow: [`.github/workflows/ci-docker.yml`](https://github.com/vienggd/Food-order/blob/main/.github/workflows/ci-docker.yml) — runs on every PR into `lab-5` and `main`: deploy-script tests, server + client tests against a real PostgreSQL 16 service, build, `docker build`.
- C-01 passing PR: TODO link + run link — TODO counts.
- Required check: ruleset `protect-main` (Active, empty bypass list, PR + 1 approval, `test-and-docker` required, up to date). Figure 1 TODO.
- C-02 blocked PR: TODO link. Figure 2 TODO: red `test-and-docker`, "Merging is blocked".

## Answer Part 2: Docker and Reproducible Configuration

- [`Dockerfile`](https://github.com/vienggd/Food-order/blob/main/Dockerfile), [`.dockerignore`](https://github.com/vienggd/Food-order/blob/main/.dockerignore), [`docker-compose.yml`](https://github.com/vienggd/Food-order/blob/main/docker-compose.yml): one image serves the API and the built React app on port 3000.
- C-03 fresh clone: TODO commands + output (`git clone` → `.env` from `.env.example` → `docker compose up --build` → `/api/ready` OK).
- [`server/.env.example`](https://github.com/vienggd/Food-order/blob/main/server/.env.example) and the env-var table in [`deployment.md`](https://github.com/vienggd/Food-order/blob/main/docs/labs/lab-05/deployment.md): placeholders only; secrets live in Secret Manager.

## Answer Part 3: GCP Deployment and Persistence

- Public URL: TODO. Project `cpe334-2026-team33`, region `asia-southeast1`; Cloud Run `food-order`, job `food-order-migrate`, Cloud SQL `food-order-pg` (PostgreSQL 16, storage auto-increase off).
- C-04 live workflow: Figures TODO (URL bar visible): sign in, place an order, one rejection.
- UI, API, database: `/api/health`, `/api/ready` (`db: connected`), smoke test output TODO.
- C-05 persistence: Figures TODO: order before; after restart; after rollback; after roll forward.

## Answer Part 4: Repeatable Release Pipeline

- Change: Issue #68 (label `lab5`) → PR TODO into `lab-5` with ninja's review TODO → release PR TODO into `main` → CI → Deploy demo run TODO.
- C-06: run summary shows image tag = commit TODO and digest TODO; Cloud Run revision shows the same digest (Figure TODO).
- Release procedure and how to find the running commit: [`deployment.md`](https://github.com/vienggd/Food-order/blob/main/docs/labs/lab-05/deployment.md) TODO section.
