# Full-score plan to the end of the course — Food-order (Campus Café Pre-order)

For **vieng** (`vienggd`, V) and **ninja** (`NinjoMUDA`, N). Version 2 — 24 Nov 2026.
Sources: `docs/to do/` (Deliverable 2, Lab 6, Lab 7 handouts), the master spec `group_work_specs_v1.pdf`, `CLAUDE.md`.
Sprint 2 UI is designed in `docs/sprint_2/ui/` (start at `design/index.html`).

---

## 1. Deadlines and points

| Work | Due | Points | Section |
|---|---|---|---|
| **Lab 6** — cross-team UAT + defect management (Sprint 1 scope) | **Sun 29 Nov 23:59** (moved by the TA) | 100 lab | §4 |
| **Lab 7** — one approved change to a Sprint 1 rule + metrics + readiness | **Sun 29 Nov 23:59** | 100 lab | §5 |
| **Deliverable 2** — Sprint 2 complete + Sprint 3 contracts and progress + deployed candidate | **Sun 29 Nov 23:59** | 70 project | §6 |
| **Final delivery** — complete product, final QA, video ≤10 min, 1-page summary | **Sun 13 Dec 23:59** | 100 project | §7 |

We submit all three on 29 Nov by **21:00** (3 h buffer). Exams 1–11 Dec: only light work then.

---

## 2. Conditions and decisions (the plan is correct only if these hold)

| # | Condition / decision | Who | Status |
|---|---|---|---|
| C1 | TA approves the Lab 7 change **C-1** (BR-01 + "at most 15 items per order"; backups C-2 LATE flag in queue, C-3 minimum order ฿40) **before any Lab 7 code** | V asks, TA | ☐ |
| C2 | A **Lab 6 partner team** tests our app by Thu and re-tests our fixes by Sat–Sun; we test theirs | V finds | ☐ |
| C3 | V agrees to **release to `main` again** (Lab 5 version kept forever by tag `v0.1.1-lab5` on `b71cdb2`); one line to the TA | V | ☐ |
| C4 | TA OK to run Lab 6, Lab 7, D2 **in parallel** (Lab 7 baseline = the Sprint 1 version the UAT partner accepted) | V asks, TA | ☐ |
| C5 | ninja agrees with this split and the sync points | V + N | ☐ |

One TA message covers C1, C3, C4 (draft in §10).

---

## 3. How the work runs in parallel

### 3.1 Branches and releases (one pipeline, no shortcuts)

```
feature/F-0x-*  fix/L6-*  feature/L7-*  docs/*
        └──────────────┬──────────────┘
                       ▼
                    sprint-2 ──release PR (reviewed)──► main ──► Deploy demo (GCP)
```

- **Everything** this week (Sprint 2, Lab 6 fixes, Lab 7 change, F-09) goes through `sprint-2`, each with its **own Issue and label** (`sprint-2`, `lab6`, `lab7`) so each PDF points to its own evidence. (Lab 6 §3.4 and Lab 7 §3.2 require branches from sprint staging; the spec allows lab work inside a sprint if kept separate.)
- Releases: **Fri** `v0.2.0-sprint2` (original Sprint 2 release, kept identifiable) → **Sat** `v0.3.0-rc1` (Lab 6 fixes + Lab 7 + F-09). Tags are never moved.
- **Warn the partner team before every deploy** (Lab 6 §2). They test `b71cdb2` on Wed–Thu, before the first release.
- After 29 Nov: `sprint-3` from `main` → `v1.0.0` on 12 Dec.

### 3.2 What can and cannot run at the same time

| Work | Parallel? | How clashes are avoided |
|---|---|---|
| Contracts (each feature its own file) | ✅ | separate files |
| **Sprint 2 schema** (columns for F-06/F-07/F-08 + `PaymentStatus`) | ❌ once, first | one PR by V, reviewed by N (sync S1) |
| F-05 (V) ‖ F-06 then F-07 (N) | ✅ | different files; F-06 and F-07 both edit `transitions.ts` + queue page, so N does them in order |
| F-08 (V) ‖ F-06 (N) | ✅ | payment in new files (`server/src/payments/`, `PayButton`); refund rule BR-16 after F-06 merges (S2) |
| Lab 7 change (N) ‖ Sprint 2 | ✅ | touches only order validation + cart; own Issue `lab7` |
| Lab 6 UAT pack (V) ‖ features | ✅ | docs only |
| Releases / deploys | ❌ one at a time | S3, S4 |
| Three PDFs | ✅ | one owner each, the other proof-reads |

### 3.3 Sync points

| 🔁 | When | What | Needs |
|---|---|---|---|
| S1 | Tue 24 night | schema PR merged into `sprint-2` | V writes, N reviews |
| S2 | Thu 26 | F-06 merged → V adds BR-16 refund | N |
| S3 | Fri 27 eve | **release `v0.2.0-sprint2`** + deploy | F-05..F-08 merged, all green, partner warned |
| S4 | Sat 28 eve | **release `v0.3.0-rc1`** + deploy + E2E regression | Lab 6 fixes, Lab 7, F-09 merged, partner warned |
| S5 | Sun 29 by 21:00 | both read all three PDFs → submit | everything |

---

## 4. Lab 6 — full score (100)

| Part | Pts | What earns the points | Our evidence | Owner |
|---|---|---|---|---|
| A UAT preparation & handoff | 20 | ≥4 executable cases with ID, FR/AC link, purpose, role, preconditions, synthetic inputs, numbered steps, exact expected results; categories **normal / rule-boundary / forbidden role-ownership / state-persistence**; handoff states tag + commit + revision, URL, scope, account **labels** (no passwords), setup/reset, sequence | `docs/labs/lab-06/uat-cases.md` UAT-01..06 + `handoff.md` | V (N reviews) |
| B Independent execution (of the partner's app) | 25 | **every** agreed case run; tester name, date/time, version, inputs, **actual** result (not copied), PASS/FAIL/**BLOCKED**; both of us take part; screenshots for a normal and a rejected case, and proof protected state did not change | `docs/labs/lab-06/execution-partner.md` + screenshots | V + N |
| C Defect reporting & triage | 20 | outgoing bug reports (Issue on their repo: steps, expected/actual, severity by user impact, evidence); **table of every finding received** (even "none"): defect / duplicate / not-defect / enhancement with a reason from our contract; severity, owner, status | `docs/labs/lab-06/triage.md` | V |
| D Resolution & independent re-test | 35 | per accepted defect: Issue → **RED test on the tested version** → GREEN → regression → PR from `sprint-2` with real review → CI → release → deploy → smoke; partner re-tests and records **Accepted / Accepted with limitations / Not Accepted** with names, version, date. If no real defect: TA's **controlled exercise** on an isolated branch (never invent one) | Issues `lab6`, PRs, test output, version table, partner's signed decision | V fixes, N reviews |

Never: test our own app as "independent", claim acceptance with open critical/major defects or BLOCKED cases, relabel a broken rule as an enhancement.
PDF `lab6_sec131_Est.pdf`: contents table A–D with pages + evidence IDs, version table, contribution table, AI-use note, limitations.

UAT cases (draft): **UAT-01** alice: Latte×2 + Americano×1 → ฿185.00 → PLACED → staff accepts → alice sees ACCEPTED · **UAT-02** qty 10 ok / 11 refused; sold-out Croissant cannot be ordered, nothing saved · **UAT-03** alice opens staff queue → refused; alice opens bob's order → not found · **UAT-04** order still there after log out/in; second accept → "already accepted" · **UAT-05** logout ends the session · **UAT-06** tampered price/total refused (API, optional).

---

## 5. Lab 7 — full score (100)

| Part | Pts | What earns the points | Our evidence | Owner |
|---|---|---|---|---|
| A Change impact & contract | 25 | Issue/change request: old rule (BR-01 1–10 per line), new rule (+ ≤15 items per order), reason, scope, AC (14 ok, 15 ok, 16 → 400 `VALIDATION_ERROR`, cart warns at 15), invalid cases, access unchanged; **TA approver + date**; Sprint 1 baseline + actual pre-change commit; **impact table** (FR-06, BR-01, F-03 contract, SRS/SDS sections, AC, STS IDs, `orders/routes.ts`, `client/src/lib/cart.ts`, cart UI, tests) with **N/A reasons** (no migration, old orders unchanged); what must stay unchanged + which tests protect it; revised SRS/contract/STS **reviewed by V before code** (commit dates) | Issue L7-1, `docs/labs/lab-07/impact.md`, contract PR | N (V reviews) |
| B Implementation & regression-safe delivery | 50 | new test with boundary **fails on the pre-change code because the rule is missing** (saved output + commit); same test passes after the change; code diff; selected regression suite (orders, operator, auth) with reason, command, version, pass/fail/skip counts; no weakened tests; PR with real review → CI → `sprint-2` → release → deploy; **live checks** of the new rule and a preserved Sprint 1 path (customer still can't open the staff queue), real outcomes not just a green icon | test output files, PR, Actions runs, live screenshots | N (V reviews) |
| C Metrics | 15 | **5 dated metrics** with definition, scope, window/snapshot, value, source ID; compact source lists embedded (≥2 reconcilable without links); percentages show numerator/denominator; **≤100 words**: one concrete problem/risk + action + owner | completed Issues, merged PRs, test counts on the release commit, UAT defects opened/resolved, CI runs success/fail (window 24–29 Nov) | N |
| D Readiness & retro | 10 | checklist: deployed version, defects by severity/status, test results incl. failed/skipped, tech debt table (item, impact, priority, action), config/secrets, docs, deploy/smoke; **READY / NOT READY** for the maintained Sprint 1 scope with reasons; 3 retro answers (helped / hurt / will change + next action) | `docs/labs/lab-07/readiness.md` | V |

PDF `lab7_sec131_Est.pdf`: contents table A–D, version table (Sprint 1 baseline → version accepted in Lab 6 → pre-change commit → test commit → fix commit → release → revision; later-sprint changes named), contribution table, AI-use note, limitations.

---

## 6. Deliverable 2 — full score (70)

| Part | Pts | What earns the points | Owner |
|---|---|---|---|
| A Sprint 1 continuity | 5 | `v0.1.0-sprint1` journey works on the candidate (E2E + screenshots); change/defect register (ID, source, requirement, decision, status, fix release, re-test) for Lab 5/6/7 findings; baseline revisions with reasons | V |
| B Sprint 2 | 25 | **every** F-05..F-08 contract (FR/BR/NFR, SDS + workflow, UI/API/data, validation/errors/boundaries/permissions, numbered AC, STS, DoD, "no change" layers stated) **committed before code**; TDD red/green; completion table (AC → implementation → executed test → result → release `v0.2.0-sprint2`); unit + API/DB + E2E incl. negative/boundary/persistence/new access paths; Issues → branches → reviewed PRs → staging → release | V: F-05, F-08 · N: F-06, F-07 |
| C Sprint 3 | 15 | contracts/AC/STS for **all** F-09..F-12; **F-09 cut-off rule implemented and tested** in the candidate; status per item: planned / in progress / implemented / tested / accepted; remaining-work table (feature/AC, status, missing, owner, date ≤ 13 Dec) | V: F-10, F-12 · N: F-09, F-11 |
| D Traceability | 10 | updated **living** SRS, feature list, System SDS; one matrix FR/BR/NFR → feature → sprint → AC → planned test → actual file/test → result + version; gaps and "planned" shown honestly (never "done" for an unrun test) | V (N reviews) |
| E Release candidate | 15 | `v0.3.0-rc1` on `main`: build, full suite, E2E, cross-feature checks (price edit vs old order snapshot, refund vs cancel, PICKED_UP needs PAID), failed/skipped disclosed; deployed revision = tag/commit = CI run; post-deploy journey + persistence; Docker/env/migrations current; readiness review; dated plan to 13 Dec | V + N |

PDF must include: cover (names, IDs, theme, repo, tag/commit, URL + version), **navigation table with page numbers**, two test excerpts (one rule, one access) with output, TDD red/green, **two Issue/PR chains**, program demos (2 Sprint 2 features + F-09 + Sprint 1 continuity) with AC/role/steps/expected/actual/version and **API evidence** for a forbidden operation, setup summary, no secrets.

### Sprint 2 rules to put in the contracts

| Feature | New rules | API |
|---|---|---|
| F-05 Menu management (V) | BR-08 name 1–60 chars, unique · BR-09 price 1–100000 satang · BR-10 sold-out affects new orders only (BR-05 snapshot kept) · seed never overwrites operator edits | `GET/POST /api/operator/menu`, `PATCH /api/operator/menu/:id` |
| F-06 Cancel / reject (N) | BR-11 customer cancels own order only while PLACED · BR-12 reject only while PLACED, reason 3–200 chars, shown to customer · race with accept → one wins (409) | `POST /api/orders/:id/cancel`, `POST /api/operator/orders/:id/reject` |
| F-07 Fulfilment (N) | BR-13 one step ACCEPTED→PREPARING→READY→PICKED_UP, no skip/back (409), operators only | `POST /api/operator/orders/:id/advance` |
| F-08 Payment (V) | BR-14 own order UNPAID→PAID, not if CANCELLED/REJECTED/PICKED_UP · BR-15 PICKED_UP requires PAID · BR-16 cancel/reject of a PAID order → REFUNDED | `POST /api/orders/:id/pay` |

---

## 7. Final delivery — full score (100), 13 Dec

| Part | Pts | Plan |
|---|---|---|
| Final working product | 35 | F-09 slots + cut-off, F-10 sales summary (PAID/PICKED_UP only, top 3), F-11 search/filter, F-12 rate limit (429), error states, accessibility (axe in Playwright); all permissions/persistence intact |
| Process & team evidence | 15 | same Issue → PR → review → staging → release chain; contribution table |
| Final traceability | 20 | complete matrix requirement → feature → AC → test → final result |
| Final QA & DoD | 20 | full regression + E2E on the final commit, UAT re-tests, defect status, deployed `v1.0.0`, reproducible setup, known debt |
| Video | 8 | ≤10 min, **both on camera**: live journeys, one rejected rule, one access case, architecture, test/CI, one requirement-to-test chain |
| Release summary | 2 | one page: scope, version/commit, links, completion, limitations, team |

---

## 8. Timeline (V = vieng, N = ninja, P = partner team)

| Day | Sprint 2 / D2 | Lab 6 | Lab 7 |
|---|---|---|---|
| **Tue 24 am** | Pre-start check: local copy, tests, live app, CI, ruleset (V) | — | — |
| **Tue 24** | tag `v0.1.1-lab5`, `sprint-2`, labels, Issues (V) · setup PR: plan, `.gitignore` (`docs/to do/`), `CLAUDE.md` (`sprint-2`), living docs + Sprint 2 UI (V, N reviews) · **schema PR S1** (V) · contracts F-05, F-08 (V) · F-06, F-07 (N) | **find P**, agree test days (V) | **TA message** C1 + C3 + C4 (V) |
| **Wed 25** | F-05 (V) · F-06 (N) · review each other's contracts | UAT pack + handoff → P (V) · **P tests our app on `b71cdb2`** | change-request Issue + impact table (N) |
| **Thu 26** | F-08 (V) · F-07 (N) · S2 refund rule (V) | **we test P's app** (V + N) | contract + STS PR (N) → **V reviews before code** · approval recorded |
| **Fri 27** | contracts F-10, F-12 (V) · F-09, F-11 (N) · warn P → **S3 `v0.2.0-sprint2`** | triage all findings (V) · report P's bugs on their repo (V + N) | RED → GREEN → regression counts → PR (N) |
| **Sat 28** | F-09 cut-off (N) · living SRS/features/SDS/traceability (V) · warn P → **S4 `v0.3.0-rc1`** + E2E | fixes from `sprint-2` RED → GREEN (V) → in rc1 · **P re-tests**, records decision · we re-test P's fixes | live checks (N) · metrics (N) · readiness + debt (V) · retro (both) |
| **Sun 29** | **D2 PDF** (V, N proof-reads) | **Lab 6 PDF** (V product side, N tester side) | **Lab 7 PDF** (N, V proof-reads) |
| **Sun 29 21:00** | 📤 **submit all three** (V) | | |
| 30 Nov | `sprint-3` · F-10 (V) · F-11 (N) | late re-tests if any | — |
| 1–11 Dec | F-12 light (V rate limit, N errors + a11y) | — | — |
| 12–13 Dec | `v1.0.0`, final report (V), traceability + summary (N), **video (both)** → 📤 **submit 13 Dec** | — | — |

---

## 9. Point-losing mistakes to avoid (checked before every submission)

- Code committed **before** its contract (D2 B, Lab 7 A) — always a contract commit + review first.
- RED test that fails for the wrong reason (typo, broken fixture).
- "Done" / "PASS" for a test that never ran; copying expected into actual; BLOCKED counted as pass.
- Screenshots without evidence ID, role, version, expected/actual; UI screenshot used as the only proof of backend protection.
- Secrets or passwords in Git, PDF, screenshots or Issues.
- Missing links: every Issue → branch **and** PR; author approving own PR; squash merges.
- Weakening/deleting old tests to make a change pass.
- Mixing Lab 7 change with unrelated Sprint 2 work in one PR.
- Moving or deleting tags/branches; tearing down GCP before grading ends.

---

## 10. TA message (draft — V sends)

> Hello, this is team Est (sec 131, Food-order). Three questions:
> 1. **Lab 7 change approval:** we propose changing Sprint 1 rule BR-01 (quantity 1–10 per line) to also limit the whole order to at most 15 items (15 accepted, 16 rejected with a validation error; the cart warns at 15). Old orders are unaffected; access rules unchanged. May we proceed? (Backups if you prefer: flag orders older than 15 min as LATE in the operator queue; or a minimum order of ฿40.00.)
> 2. Since Lab 6, Lab 7 and Deliverable 2 are all due 29 Nov, may we run them in parallel, using the Sprint 1 version our UAT partner accepts as the Lab 7 baseline?
> 3. Our Lab 5 submission names release `b71cdb2` (tag `v0.1.1-lab5`). Is it OK to deploy newer releases to the same URL for Labs 6–7 and Deliverable 2?
> Thank you.

---

## 11. vieng — full task list

Every task: Issue on the board → branch from the Issue (base `sprint-2`) → tests first → PR → **ninja reviews and merges** → card to Done (CLAUDE.md). "Done when" = what must be true and saved as evidence.

| ID | Day | Task (exact steps) | Waits for | Reviewer | Done when / evidence |
|---|---|---|---|---|---|
| V-01 | Tue | **Pre-start check**: update local `main`; `npm ci`; `npm test` (server + client); `npm run build`; live `/api/ready` and login page; last CI + Deploy demo runs on `main` green; ruleset `protect-main` active | — | — | all green, written in the setup Issue; anything red reported before new work |
| V-02 | Tue | Send the **TA message** (§10); screenshot it | — | — | message sent; replies later recorded in L6/L7 Issues (approver + date) |
| V-03 | Tue | Find the **Lab 6 partner team**: agree test window Wed–Thu, re-test Sat, how to send accounts privately, names + IDs of all four students | — | — | partner named in the Lab 6 Issue; dates agreed |
| V-04 | Tue | Tag `v0.1.1-lab5` on `b71cdb2`; create `sprint-2` from `main`; labels `sprint-2`, `lab6`, `lab7`; create all Issues (V-xx and N-xx with a branch) on the board Backlog → Specified | V-01 | — | tag + branch on GitHub; Issues on board |
| V-05 | Tue | **Setup PR** `docs/S2-0-setup`: commit `docs/PLAN.md`; `.gitignore` += `docs/to do/`; `CLAUDE.md` staging `sprint-2` + labels + living-doc paths; copy SRS/features/system-SDS/traceability to `docs/srs.md`, `docs/features.md`, `docs/system-sds.md`, `docs/traceability.md` (living); note "frozen as submitted for Deliverable 1" at the top of the `docs/sprint_1/` copies; commit `docs/sprint_2/ui/` | V-04 | N | PR merged into `sprint-2`; `git ls-files "docs/to do"` empty |
| V-06 | Tue night | **Schema PR (S1)** `feature/S2-1-schema`: Prisma enum `PaymentStatus {UNPAID PAID REFUNDED}`; `Order` += `rejectReason`, `cancelledAt`, `rejectedAt`, `preparingAt`, `readyAt`, `pickedUpAt`, `paymentStatus` (default UNPAID), `paidAt`, `refundedAt`; one migration; seed unchanged | V-04 | N | migration applies on a fresh DB; all existing tests green in CI |
| V-07 | Tue | **Contracts F-05 + F-08** in `docs/sprint_2/sprints/F-05-menu-management.md`, `F-08-payment.md` (same sections as Sprint 1: FR/BR/NFR, workflow, UI from `docs/sprint_2/ui/ui-spec.md`, API, data, errors/permissions, AC-5.x / AC-8.x, STS TEST-5.x / TEST-8.x with level/input/expected, DoD, "no change" layers). F-08 also owns **BR-15** (PICKED_UP needs PAID) | V-05 | N | contract PR merged **before** any F-05/F-08 code |
| V-08 | Wed | Review ninja's F-06/F-07 contracts with specific comments | N-03 | — | review text on the PR |
| V-09 | Wed | **Lab 6 UAT pack**: `docs/labs/lab-06/uat-cases.md` (UAT-01..06 in full format, §4) + `handoff.md` (version `b71cdb2` + revision, URL, scope F-01..F-04, account labels, setup/reset, order of cases); send to the partner; passwords only privately | V-03 | N | partner confirms they can run the cases without asking questions |
| V-10 | Wed | **F-05 TDD**: tests first (operator list/add/edit/toggle, BR-08 name rules, BR-09 price rules, customer → 403, no login → 401, sold-out item refused in new orders, **old order keeps its snapshot after a price edit** (BR-05 cross-feature), seed keeps operator edits) → RED commit → routes `server/src/operator/menu.ts` + operator Menu page (design `desktop-operator-menu.html` / `phone-operator-menu.html`) → GREEN → E2E: staff edits price + toggles sold out | V-06, V-07 | N | PR merged; red/green outputs saved |
| V-11 | Thu | **F-08 TDD**: `server/src/payments/routes.ts` `POST /api/orders/:id/pay` (own order only → others 404; UNPAID → PAID; refused for CANCELLED/REJECTED/PICKED_UP → 409; double pay → 409); `PayButton` + payment badges; E2E. After **S2**: BR-16 refund on cancel/reject (RED → GREEN). After N-07: BR-15 check in `advance` (RED → GREEN) | V-06, V-07, N-05, N-07 | N | PR(s) merged; cross-feature tests green |
| V-12 | Thu | Review ninja's F-06, F-07 and **Lab 7 contract (before his code)** | N-05, N-07, N-08 | — | review text on each PR |
| V-13 | Thu–Fri | **UAT Team** with ninja on the partner's app: every case; per row tester, time, version, inputs, **actual**, PASS/FAIL/BLOCKED; screenshots (normal + rejected case, protected state unchanged); bugs as Issues on **their** repo | partner's pack | — | `docs/labs/lab-06/execution-partner.md` + screenshots |
| V-14 | Fri | **Triage** every finding on our app in `docs/labs/lab-06/triage.md` (defect / duplicate / not-defect / enhancement, reason from our contract, severity by user impact, owner, status); `lab6` bug Issue per accepted defect | partner's results | N | table complete (or "no findings" with date) |
| V-15 | Fri | **Sprint 3 contracts F-10, F-12** (`docs/sprint_2/sprints/F-10-*.md`, `F-12-*.md`) | — | N | PR merged |
| V-16 | Fri eve | **S3 release**: warn the partner; release PR `sprint-2` → `main` (ninja merges); tag `v0.2.0-sprint2`; watch Deploy demo; smoke + live journey; note revision | V-10, V-11, N-05, N-07 | N | tag on GitHub; revision = tag commit |
| V-17 | Sat | **Lab 6 fixes** per accepted defect: RED test reproducing it (on the tested behavior) → fix → GREEN → regression → PR from `sprint-2`; send the partner the new version + cases to re-run; collect their **decision**. No real defect → ask the TA for the controlled exercise | V-14 | N | partner's decision recorded with names, version, date |
| V-18 | Sat | **Living docs**: `docs/srs.md` (FR-11..15, BR-08..16, NFR status), `docs/features.md` (statuses), `docs/system-sds.md` (schema, APIs, permission matrix), `docs/traceability.md` (requirement → feature → sprint → AC → planned test → actual file/test → result + version, gaps shown); change-log rows | V-16 | N | PR merged |
| V-19 | Sat eve | **S4 release candidate** with ninja: warn partner; release PR; tag `v0.3.0-rc1`; deploy; E2E regression on rc1; post-deploy: journey, persistence, forbidden API call | V-17, N-10, N-13 | N | tag; deploy run green; checks saved |
| V-20 | Sat | Lab 7 **readiness checklist + tech-debt table** (`docs/labs/lab-07/readiness.md`); 3 retro answers with ninja | V-19 | N | READY / NOT READY stated with reasons |
| V-21 | Sun | **Deliverable 2 PDF** (§6): cover, navigation table with pages, Parts A–E, test excerpts, two Issue/PR chains, demos, setup summary; reuse `scripts/evidence.mjs` / `report-pdf.mjs` | V-18, V-19 | N proof-reads | PDF builds; no secrets (text search) |
| V-22 | Sun | **Lab 6 PDF** product side (Parts A, C, D, version table, decision); merge ninja's Part B | V-17 | N | one PDF, contents table A–D |
| V-23 | Sun | Proof-read Lab 7 PDF; **submit all three on LEB2 by 21:00**; screenshot of submission | V-21, V-22, N-16 | — | 3 submissions confirmed |
| V-24 | 30 Nov | Create `sprint-3`; **F-10 sales summary** TDD (PAID/PICKED_UP only, per day, top 3) | V-23 | N | PR merged |
| V-25 | 1–11 Dec | **F-12 rate limit** (NFR-08: 5 failed logins / 15 min → 429) TDD | V-24 | N | PR merged |
| V-26 | 12–13 Dec | Final regression, release `v1.0.0`, final report PDF; **video** with ninja; **submit 13 Dec** | all | N | final submission confirmed |

---

## 12. ninja — full task list

| ID | Day | Task (exact steps) | Waits for | Reviewer | Done when / evidence |
|---|---|---|---|---|---|
| N-01 | Tue | Read this plan, agree the split (C5); local setup: update `main`, `npm ci`, `docker compose up -d db`, `npm test` green | — | — | "agreed" in the chat / setup Issue |
| N-02 | Tue | Review vieng's **setup PR** and **schema PR (S1)**; merge after approval | V-05, V-06 | — | review text; both merged into `sprint-2` |
| N-03 | Tue | **Contracts F-06 + F-07** in `docs/sprint_2/sprints/F-06-cancel-reject.md`, `F-07-fulfilment.md`: BR-11, BR-12 (+ accept/reject race), BR-13; AC-6.x / AC-7.x; STS TEST-6.x / TEST-7.x; UI from `docs/sprint_2/ui/ui-spec.md`; DoD | V-05 | V | contract PR merged **before** F-06/F-07 code |
| N-04 | Wed | Review vieng's F-05 / F-08 contracts with specific comments | V-07 | — | review text |
| N-05 | Wed | **F-06 TDD**: transitions PLACED → CANCELLED / REJECTED; `POST /api/orders/:id/cancel` (own only → others 404; after accept → 409); `POST /api/operator/orders/:id/reject` (reason 3–200 → else 400; customer → 403); **reject vs accept at the same time → one 200, one 409**; customer sees reason; cancel confirm + reject dialog (design `phone-customer-order.html`, `desktop-operator-queue.html`); E2E | V-06, N-03 | V | PR merged (**S2**: tell vieng) |
| N-06 | Wed | **Lab 7 change request** Issue L7-1 (label `lab7`): old/new rule, reason, scope, AC, invalid cases, access, Sprint 1 baseline + pre-change commit; **impact table** `docs/labs/lab-07/impact.md` with N/A reasons and what must stay unchanged | V-02 (TA reply) | V | Issue + impact table; TA approver + date recorded when it arrives |
| N-07 | Thu | **F-07 TDD**: `POST /api/operator/orders/:id/advance`: ACCEPTED → PREPARING → READY → PICKED_UP one step; skip / backwards / someone else moved it → 409; customer → 403; queue step buttons (design `desktop-operator-queue.html`); E2E. (BR-15 PICKED_UP needs PAID is added by vieng in V-11) | N-05 | V | PR merged |
| N-08 | Thu | **Lab 7 contract PR**: revise SRS BR-01, F-03 contract AC, STS (TEST-L7-1..: 14 ok, 15 ok, 16 → 400, cart warning at 15, preserved rules) → **vieng reviews before any code** | N-06, TA approval | V | PR merged; commit time before the test/code commits |
| N-09 | Thu–Fri | **UAT Team** with vieng on the partner's app (same as V-13); write our tester-side section | partner's pack | — | `docs/labs/lab-06/execution-partner.md` |
| N-10 | Fri | **Lab 7 RED → GREEN**: commit the new test, run it on the pre-change `sprint-2` commit, save output `docs/labs/lab-07/evidence/red.txt` (fails because the rule is missing); implement Zod refine in `server/src/orders/routes.ts` + cart warning in `client/src/lib/cart.ts`; same test → `green.txt`; run orders/operator/auth suites, save counts; PR | N-08 | V | PR merged; red/green/regression outputs saved |
| N-11 | Fri | **Sprint 3 contracts F-09, F-11** (F-09: 15-min slots in opening hours, orders close 15 min before the slot, capacity 10; boundary times written exactly) | — | V | PR merged |
| N-12 | Fri | Review vieng's F-08 PR and Lab 6 triage table | V-11, V-14 | — | review text |
| N-13 | Sat | **F-09 cut-off rule TDD** (server rule + minimal slot picker): before cut-off ok, at/after cut-off → 400, full slot → 409; E2E | N-11 | V | PR merged (goes into rc1) |
| N-14 | Sat | **Lab 7 live checks** on rc1: 15 items ok, 16 refused (API response + UI), preserved: customer → staff queue 403; screenshots with URL + revision | V-19 | — | `docs/labs/lab-07/evidence/` |
| N-15 | Sat | **Lab 7 metrics** (window 24–29 Nov, via `gh`): completed Issues, merged PRs, test counts on the rc1 commit, UAT defects opened/resolved, CI runs success/fail; definitions, sources, embedded lists; ≤100-word interpretation + action + owner | V-19 | V | `docs/labs/lab-07/metrics.md` |
| N-16 | Sun | **Lab 7 PDF** (§5, version table incl. the Lab 6 accepted version); Lab 6 **Part B** section; proof-read D2 | N-14, N-15, V-20 | V proof-reads | PDF builds; no secrets |
| N-17 | 30 Nov | **F-11 search / filter** TDD (customer by status, operator by number / name / status) | V-24 | V | PR merged |
| N-18 | 1–11 Dec | **F-12** error states + accessibility (axe check in Playwright) | N-17 | V | PR merged |
| N-19 | 12–13 Dec | Final traceability, 1-page release summary; **video** with vieng | all | V | submitted |

Totals: vieng 26 tasks, ninja 19 tasks; shared: UAT of the partner's app, both releases, Lab 6 PDF, retro, video.
