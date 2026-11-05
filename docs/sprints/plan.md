# Three-sprint plan — Campus Café Pre-order

Deliverable 1, part D. Issue #9. Source of decisions: [`docs/PLAN.md`](../PLAN.md).
Version 1 — 6 Nov 2026. Changes after this are recorded in the change log at the bottom, not by rewriting this text.

## 1. Sprint goals and dates

| Sprint | Due (23:59) | Goal | Features | Release tag |
|---|---|---|---|---|
| 1 | Sun 8 Nov 2026 | A customer can log in, order from the menu and see the order; staff can accept it. Login and roles are enforced by the server. | F-01, F-02, F-03, F-04 | `v0.1.0-sprint1` |
| 2 | Sun 29 Nov 2026 | The café can run a full day: edit the menu, cancel or reject orders, move orders through preparation to pick-up, and record (simulated) payment. | F-05, F-06, F-07, F-08 | `v0.2.0-sprint2` |
| 3 | Sun 13 Dec 2026 | Finish and harden: pickup time slots, sales summary, order search, rate limit, error states and accessibility. | F-09, F-10, F-11, F-12 | `v1.0.0` |

Course labs use the same app: Lab 5 (Docker, CI/CD, Google Cloud deploy) due 15 Nov, Lab 6 (cross-team user acceptance testing) due 22 Nov, Lab 7 (maintenance change) due 29 Nov. Lab work is planned inside Sprint 2 time but kept in its own issues.

## 2. Features by sprint

| ID | Feature | Sprint | Owner | Depends on |
|---|---|---|---|---|
| F-01 | Login, logout, "who am I" (CUSTOMER, OPERATOR) | 1 | A (vieng) | #1 setup |
| F-02 | Browse menu (sold-out items greyed out) | 1 | B (ninja) | F-01 |
| F-03 | Place order, my orders, order detail | 1 | B (ninja) | F-01, F-02 |
| F-04 | Operator queue + accept order | 1 | A (vieng) | F-01, F-03 |
| F-05 | Menu management + sold-out toggle | 2 | to agree | F-02 |
| F-06 | Customer cancel / operator reject with reason | 2 | to agree | F-04 |
| F-07 | Fulfilment: PREPARING → READY → PICKED_UP | 2 | to agree | F-04 |
| F-08 | Simulated payment (UNPAID → PAID → REFUNDED) | 2 | to agree | F-03, F-06 |
| F-09 | Pickup time slots + order cut-off | 3 | to agree | F-03 |
| F-10 | Sales summary | 3 | to agree | F-07, F-08 |
| F-11 | Order search / filter | 3 | to agree | F-03, F-07 |
| F-12 | Hardening: login rate limit, error states, accessibility | 3 | both | all |

Sprint 2 and 3 owners are agreed at the start of each sprint; each person keeps a mix of backend, frontend, tests and docs.

## 3. Dependencies

```
#1 setup (schema, seed, skeleton)
   └─ F-01 login ─┬─ F-02 menu ── F-03 order ── F-04 accept
                  │                  │              ├─ F-06 cancel/reject ─┐
                  │                  │              └─ F-07 fulfilment ────┼─ F-10 sales summary
                  │                  ├─ F-08 payment ◄─────────────────────┘
                  │                  ├─ F-09 pickup slots
                  │                  └─ F-11 search
                  └─ F-05 menu management (needs F-02)
F-12 hardening runs last, across everything.
```

Notes:
- F-03 and F-04 share the order status table. Sprint 1 builds only `PLACED → ACCEPTED` with a transition table and `canTransition()`; F-06 and F-07 add rows to the same table instead of new code paths.
- F-02 and F-03 can be built in parallel with F-01 by using a test login helper; they are merged after F-01.

## 4. Sprint 1 — why it is feasible

Scope is the smallest slice the course asks for (spec section 6, theme 4): login with two roles, a seeded menu, one order transaction, one state change, and tested business rules BR-01..BR-07.

| Task | Issue | Owner | When |
|---|---|---|---|
| Schema, seed, skeleton, test setup | #1 | both | Fri night |
| Doc A SRS | #6 | A | Fri night draft, Sat final |
| Doc B features + traceability | #7 | B | Fri night draft, Sun final (needs test IDs) |
| Doc C system SDS | #8 | A: auth, roles, config; B: data model, API | Fri night draft, Sat final |
| Doc D this plan | #9 | B | Fri night |
| Contracts (SDS, AC, test spec, Definition of Done) F-01..F-04 | #2–#5 | owner of each feature | Sat morning, committed before code |
| Tests first, then code, F-01..F-04 | #2–#5 | owner of each feature | Sat afternoon / night |
| End-to-end tests (Playwright) | #10 | A | Sun morning |
| Release PR `sprint-1` → `main`, tag | #11 | A | Sun afternoon |
| PDF, screenshots, test output | #11 | B | Sun evening, submit by ~21:00 |

Every pull request is reviewed and merged by the other person, so both must be online Saturday and Sunday (agreed in chat 6 Nov).

## 5. Remaining work after Sprint 1

- Sprint 2: F-05..F-08, plus Lab 5 (container, CI with a required check, deploy from `main`) and Lab 6 fixes.
- Sprint 3: F-09..F-12, Lab 7 change, regression tests, final report and demo video.
- Contracts for Sprint 2 features are written at the start of Sprint 2; Sprint 3 contracts are due with Deliverable 2 (29 Nov).

## 6. Risks

| Risk | Effect | What we do |
|---|---|---|
| Only one weekend for Sprint 1 | Late or untested features | Keep Sprint 1 to F-01..F-04; no extra features |
| Reviews need the partner online | Pull requests wait | Agreed weekend times; small pull requests |
| Two staff accept at once (BR-07) | Order accepted twice | Conditional update `where status = PLACED` + concurrency test |
| Exam period 1–11 Dec | Sprint 3 squeezed | Product mostly done by 29 Nov; after that only fixes |
| Cloud costs / access (Lab 5) | Deploy blocked | Budget alert; follow the Lab 5 starter files |

## Change log

| Date | Change | Why |
|---|---|---|
| 6 Nov 2026 | First version | Deliverable 1 part D |
