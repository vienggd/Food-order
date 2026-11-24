# Head plan: Lab 6 + Lab 7 + Sprint 2 (team COOKS)

Plan name: **COOKS-29NOV**. All three are due **Sun 29 Nov 23:59**; we submit by **21:00**.
Details, rubrics and rules (BR-08..BR-16, UAT-01..06) stay in `docs/PLAN.md`. This file is the agreed run plan.

## 1. Projects

| Project | Goal | Done when | How we test it |
|---|---|---|---|
| **sprint2** | F-05 menu management, F-06 cancel/reject, F-07 fulfilment steps, F-08 payment; Sprint 3 contracts F-09..F-12; living SRS/SDS/traceability; Deliverable 2 PDF | all 4 features merged with contract-before-code history, CI green, deployed, tag `v0.2.0-sprint2`, D2 PDF ready | Vitest + Supertest (real Postgres) per AC, Playwright E2E per feature, check on the live URL |
| **lab6** | UAT of our app by the partner team, and our UAT of theirs | our pack sent, partner results triaged, accepted defects fixed and re-tested, our execution sheet of their app, Lab 6 PDF | humans run the cases; AIs prepare sheets, data, screenshot folders |
| **lab7** | Maintenance change C-1: order total at most 15 items (backups C-2 LATE flag, C-3 minimum ฿40) | TA approval recorded, impact table, contract reviewed before code, RED on `b71cdb2` then GREEN, regression green, deployed, 5 metrics, Lab 7 PDF | Vitest boundary tests (15 ok, 16 → 400), cart warning E2E, live check |

## 2. Branches

- Project branches from `main` (`b71cdb2`): `lab6`, `lab7`, `sprint2`. vieng's head creates them.
- Worker branches: `lab6-vieng`, `lab7-vieng`, `sprint2-vieng` (vieng's head); `lab6-ninja`, `lab7-ninja`, `sprint2-ninja` (ninja's head, after ours are pushed).
- One Issue per task on board 4. Each task = one PR from the worker branch into its project branch, linked to the Issue by command. After a PR merges, the worker merges the project branch back into its worker branch before the next task.
- The other side's worker reviews and merges every PR (author never approves own). Merge commits only.
- Heads merge project → `main` only when the project is fully done and tested on BOTH sides. Order:
  1. **sprint2** — Fri 27 night, only after the partner's UAT window has closed (so they test a stable `b71cdb2`). Tag `v0.2.0-sprint2` (vieng okays the tag).
  2. **lab6** — Sat 28, after the partner re-tests our fixes. `lab6` merges `main` first.
  3. **lab7** — Sat 28 night, last. `lab7` merges `main` first (merge commit, no rebase). RED test was already recorded on `b71cdb2`.
  (Changed from "lab6 first": Lab 6 cannot be fully done until the Sat re-test.)

## 3. Who does what (file ownership)

### sprint2
| vieng side | ninja side |
|---|---|
| Schema PR first: `server/prisma/schema.prisma` + one migration (payment status, reject reason, step timestamps) | Contracts F-06, F-07 (`docs/sprint_2/sprints/F-06-*.md`, `F-07-*.md`) |
| Contracts F-05, F-08 | F-06 code: cancel route in `server/src/orders/routes.ts` **below** the place-order schema block; reject route in `server/src/operator/routes.ts`; `server/src/orders/transitions.ts` |
| F-05 code: `server/src/operator/menu.ts`, operator Menu page | F-07 code: advance route in `server/src/operator/routes.ts`, queue page; tests seed PAID orders directly |
| F-08 code: `server/src/payments/*`, `PayButton`, badges; BR-16 after F-06 merges; BR-15 check added to advance after F-07 merges (hand-off message first) | Contracts F-09, F-11 + F-09 cut-off code |
| `server/src/app.ts` router mounts (ninja asks vieng's worker) | — |
| Contracts F-10, F-12; living docs `docs/srs.md`, `features.md`, `system-sds.md`, `traceability.md`; D2 PDF | Final traceability check, metrics for D2 |

### lab6
| vieng side | ninja side |
|---|---|
| `docs/labs/lab-06/uat-cases.md`, `handoff.md` (send to partner) | `docs/labs/lab-06/execution-partner.md` + screenshots folder (our test of their app) |
| `triage.md` + fixes of accepted defects (bug Issue each, from `lab6`) | Lab 6 Part B (tester) text for the PDF |
| Lab 6 PDF | review of every lab6 PR |

### lab7
| vieng side | ninja side |
|---|---|
| Review contract **before** code; review every lab7 PR | Change request, `docs/labs/lab-07/impact.md`, contract |
| `docs/labs/lab-07/readiness.md`, live-check evidence after deploy | RED / GREEN code: place-order schema block in `server/src/orders/routes.ts` + `client/src/lib/cart.ts`; `evidence/red.txt`, `green.txt` |
| — | `metrics.md`, Lab 7 PDF |

Shared file rule: `server/src/orders/routes.ts` — lab7 touches only the place-order schema block; F-06 adds new routes below it.

## 4. Workers (same on both sides)

| Chat | Model | Effort | Why |
|---|---|---|---|
| sprint2 | sonnet | medium | hardest code, but tokens are short on both sides (see section 8); tests catch mistakes |
| lab7 | sonnet | medium | one small rule, but strict order: contract → review → RED → GREEN |
| lab6 | sonnet | low | sheets, triage, small fixes (not haiku: real bug fixes possible) |

Skills for all: ponytail, karpathy-guidelines, test-driven-development, systematic-debugging, verification-before-completion.

## 5. Milestones

| When | Milestone |
|---|---|
| Tue 24 night | START; branches + Issues; schema PR opened; TA message sent |
| Wed 25 | schema merged; contracts F-05..F-08 merged; Lab 6 pack sent to partner (needs partner by **Wed noon**); Lab 7 change request + impact |
| Thu 26 | F-05, F-06 merged; F-07, F-08 in review; Lab 7 contract reviewed; TA fallback at noon; **human UAT slot 19:00–20:00** (vieng + ninja test partner app) |
| Fri 27 | partner results triaged; Lab 7 RED/GREEN; sprint2 done both sides → `main` + `v0.2.0-sprint2` |
| Sat 28 | lab6 fixes re-tested → `main`; lab7 → `main`, live checks, metrics |
| Sun 29 | PDFs (D2, Lab 6, Lab 7) checked by both; vieng and ninja submit by 21:00 |

## 6. Risks and answers

| Risk | Answer |
|---|---|
| No Lab 6 partner team | vieng finds one by Wed noon; heads ping at 10:00 Wed; without one, Lab 6 cannot pass |
| TA does not approve Lab 7 in time | no reply by Thu noon → contract + RED anyway, record the wait; switch to C-2/C-3 if told |
| Deploys change the Lab 5 URL | nothing merges to `main` before the TA answers question 3, or before Fri night |
| Same file in lab7 and F-06 | block rule in §3; lab7 merges `main` before its PR |
| Tight time | sprint2 code first; Sprint 3 contracts are text only; heads check worker chats every 30 min |
| Humans needed | UAT slot Thu, submissions Sun, TA message, partner — listed for vieng/ninja below |

## 7. Human-only tasks
- vieng: send TA message (tonight), find partner team (Wed noon), UAT slot Thu 19:00, okay release tags, submit Sun.
- ninja: UAT slot Thu 19:00, approve the plan, submit Sun.

## 8. Token limits: stay awake, wake each other

Facts (vieng side, checked 24 Nov 23:50): Pro plan; 5-hour limit 91% used (resets 25 Nov 03:00); weekly 68% used (resets Fri 27 Nov 20:00). All sessions of one account share the same limit, so when it runs out the head AND all 3 workers on that side stop together.

Save tokens
- Both sides: sprint2 worker **sonnet/medium** (not opus/high). vieng: lab6 worker starts Wed, lab7-vieng Thu. ninja: only sprint2-ninja until Wed, lab7-ninja Wed, lab6-ninja Thu (after ninja weekly reset Thu 08:00).
- Budgets 24 Nov: ninja weekly 83% (resets Thu 08:00), vieng weekly 68% (resets Fri 20:00). Handover rule: after Thu 08:00, if vieng weekly is over 90%, ninja side takes vieng's text tasks (F-10/F-12 contracts, living docs) so vieng tokens go to F-05/F-08 code.
- Short chat posts; each worker listens only to its own chat; heads read worker chats with `limit=10`.
- Compact a session at 60% context. No screenshots unless needed for a report.

Never lose work
- Commit and push after every green step. After every step post `UPDATE` with `Next:` — the chat + git log is the state to resume from.

Watch
- Each head checks its account usage every 30 min (`get_usage`). At 80% of the 5-hour limit: workers finish the current step, push, post `UPDATE: pausing for token limit - resets <time>`. At 95%: stop.
- Each head has a recurring timer (every 30 min) that checks worker chats and sessions, and wakes any worker that is idle with work left.

Wake up
- Own worker stopped (limit reset, or crashed): its head sends it "continue from your last UPDATE".
- A whole side stopped (head silent 30+ min, no `pausing` message): the other head posts `UPDATE: <side> looks asleep` and tells its human, who messages the other human. After the reset the timer on the sleeping side fires and resumes by itself.
- While one side sleeps, the other side keeps going on its own files only. Reviews wait (author never approves own). Near a deadline (Sat 12:00 or later) and asleep 2h+, the awake head may take over a blocked task after posting what it takes.
