# Lab 6 — Independent User Acceptance Testing (UAT)

CPE 334 · Semester 1/2026 · Section 131 · group **Est** · Campus Café Pre-order (`Food-order`).
**DRAFT SKELETON.** Items marked PENDING await tonight's manual human UAT run (`19:00–20:00`) and partner re-test after Saturday's fix release; they must be filled before final submission. Staging branch for all Lab 6 work: **`lab6`**.

## Contents

| Part | Role | Title | Key files & PRs | Evidence IDs |
|---|---|---|---|---|
| — | Both | Team, staging branch (`lab6`), version & contribution tables | `docs/labs/lab-06/report.md` (Issue [#101](https://github.com/vienggd/Food-order/issues/101)) | `v0.1.0-sprint1`, `b71cdb2` |
| **A** | Product team | Test plan, UAT cases (`UAT-01..06`), and handoff pack | `docs/labs/lab-06/test-plan.md`, `uat-cases.md`, `handoff.md` (PR [#107](https://github.com/vienggd/Food-order/pull/107)) | Accounts `CUSTOMER-A`, `CUSTOMER-B`, `OPERATOR` (no passwords) |
| **B** | UAT team | Testing partner **EN-009_P3** (`event-registration-system`) | [`part-b-uat-team.md`](part-b-uat-team.md), [`execution-partner.md`](execution-partner.md) (PRs [#105](https://github.com/vienggd/Food-order/pull/105), [#111](https://github.com/vienggd/Food-order/pull/111), [#140](https://github.com/vienggd/Food-order/pull/140), [#149](https://github.com/vienggd/Food-order/pull/149), [#153](https://github.com/vienggd/Food-order/pull/153), [#156](https://github.com/vienggd/Food-order/pull/156)) | Outgoing `#141–#148`, `#151–#155`; `B-<case>-s<step>-<XX>.png` (`PENDING`) |
| **C** | Product team | Partner findings triage (`#121–#133`) & RED→GREEN fixes | [`triage.md`](triage.md), `docs/labs/lab-06/evidence/` (`red.txt`, `green.txt`, `regression.txt`), PR [#138](https://github.com/vienggd/Food-order/pull/138) | `TEST-L6-121..132`; Partner B `UAT-02/04/06` PASS |
| **D** | Product team | Fix verification, re-test handoff & final acceptance | [`retest-handoff.md`](retest-handoff.md), Issue `#101` | __PARTNER_RETEST_EVIDENCE__ |

## Team

| | |
|---|---|
| Students (Team **Est**, sec 131) | **Garunyapas Danpitakkul** (`vieng`) — `67070503404` — GitHub [`vienggd`](https://github.com/vienggd)<br>**Dechayut Panyawutvorakul** (`ninja`) — `67070503414` — GitHub [`NinjoMUDA`](https://github.com/NinjoMUDA) |
| Our repository & staging branch | https://github.com/vienggd/Food-order · Lab 6 staging branch: **`lab6`** (PRs merge here before release to `main`) |
| Project board | https://github.com/users/vienggd/projects/4 |
| Partner team (**EN-009_P3**, sec 131) | **Kirakit Kingkaew** (`67070503460`, A) and **Nattakit Prasertsak** (`67070503413`, B) · Repo: https://github.com/songt888/event-registration-system |

## Version table

| App / milestone | Release / tag / commit | Where | Status |
|---|---|---|---|
| **Est (`Food-order`)** Sprint 1 baseline | tag `v0.1.0-sprint1` (`12c1052`) | `main` (ancestor) | Done |
| **Est (`Food-order`)** tested build in Lab 6 | commit `b71cdb2` (PR `#84` merge; `https://food-order-d4jdyxqbca-as.a.run.app`) | `main` | Tested by EN-009_P3 (25 Nov 2026) |
| **Est (`Food-order`)** Lab 6 triage & defect fixes | PR `#138` (RED `cd56600` / `d1bf95c` -> GREEN `c576273` / `2e291c8`, merge `8356adb`) | `lab6` | Merged into `lab6` (awaiting Sat deploy to `main`) |
| **Est (`Food-order`)** corrected `main` release | __CORRECTED_MAIN_COMMIT__ | `main` | PENDING |
| **Est (`Food-order`)** deployed revision for re-test | __DEPLOYED_REVISION__ | Cloud Run | PENDING |
| **Est (`Food-order`)** partner acceptance decision | __PARTNER_ACCEPTANCE__ | `retest-handoff.md` | PENDING |
| **EN-009_P3 (`event-registration-system`)** under test | tag `v0.1.2-lab5` (`04e8590`, Cloud Run `s47a6b53b-00005-5l7`) | Partner repo / Cloud Run | Under test (`UAT-01..06` + exploratory) |
| **EN-009_P3** fixed release for re-test (`RT-F02`, `#141–#161`) | __PARTNER_FIXED_REVISION__ | Partner Cloud Run | PENDING (planned `v0.1.3-lab6`) |

## Answer Part A: Product team test plan, UAT cases, and handoff pack

- **Plan & tester guide (`docs/labs/lab-06/test-plan.md`, PR [#107](https://github.com/vienggd/Food-order/pull/107)):** Defines Sprint 1 scope (`F-01..F-04`), entry criteria (`/api/ready` OK, private windows per role), step-by-step PASS/FAIL/BLOCKED rules, non-tamper screenshot rules, and defect reporting fields.
- **Six agreed UAT cases (`docs/labs/lab-06/uat-cases.md`):**
  - `UAT-01` Normal journey: place order (`Latte ×2 + Americano ×1`, `฿185.00`) as `CUSTOMER-A`, accept as `OPERATOR`, verify `ACCEPTED` after reload.
  - `UAT-02` Business rule boundaries: max quantity `10` per item (`BR-01`) and sold-out `Croissant` refused (`BR-03`).
  - `UAT-03` Forbidden role & ownership: customer blocked on `/operator/orders`, staff blocked from placing orders, foreign/malformed order IDs rejected (`AC-F01-14`, `AC-F03-08`).
  - `UAT-04` State persistence & double-accept race: order survives logout/new browser; stale second accept refuses with `409` `"Already accepted by another staff member."` (`BR-06`).
  - `UAT-05` Authentication: wrong password rejected, logout invalidates session (`AC-F01-02`, `AC-F01-09`, `AC-F01-13`).
  - `UAT-06` API integrity (optional): tampered `unitPrice` or `total` refused with `400 VALIDATION_ERROR` (`BR-04`, `AC-F03-05`).
- **Handoff (`docs/labs/lab-06/handoff.md`):** Live URL `https://food-order-d4jdyxqbca-as.a.run.app`, exact tested commit `b71cdb2`, and synthetic account labels only (`CUSTOMER-A`, `CUSTOMER-B`, `OPERATOR`). The shared password was sent privately and never appears in Git, Issues, or PDFs.

## Answer Part B: Est as UAT team for EN-009_P3

<!-- INCLUDE: part-b-uat-team.md -->

### AI-assisted UAT & multi-ratio pre-check note
Before tonight's 19:00 manual student session, vieng also executed an automated Playwright (`2×` DPR) pre-check of `UAT-01..06` plus a 6-viewport UX/UI sweep (`1440×900`, `1280×800`, `768×1024`, `375×812`, `320×568`, `812×375`). All six partner UAT cases passed on synthetic events UAT-GD-01-1757 (33ab4cbb-93e8-4019-bf8a-4e25ead6ff03), UAT-GD-02-1757 (03e93701-36dd-4b7a-a334-003aa68516e0), and UAT-GD-05-1757 (5204ff4b-f85c-4403-96f8-0027163a7212) without touching seeded demo events; the 6-ratio sweep recorded 0 page errors, 0 server 5xx responses, confirmed mobile tables scroll internally (overflow-x: auto, 0 px page overflow), re-verified filed issues #141, #146, #151, #154, and #155, and found no additional non-duplicate defects beyond #141–#148 and #151–#155. All official Part B execution logs in tables **B3–B4** and screenshot IDs **B7** remain reserved exclusively for tonight's manual student execution (`19:00–20:00`, UTC+7).

## Answer Part C: Triage of partner findings and defect fixes (`Food-order`)

### Received findings (`12` open Issues + `1` closed duplicate)
Full contract rationale and step/date provenance are recorded in [`triage.md`](triage.md). Tested build: commit `b71cdb2`.

| Finding | Issue | Reporter (25 Nov 2026) | Decision & severity | Fix summary (PR [#138](https://github.com/vienggd/Food-order/pull/138)) |
|---|---|---|---|---|
| `F2 / EX-10` | [#123](https://github.com/vienggd/Food-order/issues/123) | Nattakit (B), `375×812` | **defect · major** (`NFR-06`, `AC-F02-06`) | Increased phone menu bottom padding so `.cart-bar` never covers the last menu item or `+` button (`TEST-L6-123`). |
| `F1 / EX-08` | [#121](https://github.com/vienggd/Food-order/issues/121) | Nattakit (B), API | **defect · minor** (`AC-F03-08`, `AC-F04-08`) | Replaced permissive `z.coerce.number()` with strict `/^[1-9]\d*$/` check in `server/src/ids.ts`, rejecting `0x2`, `2e0`, `2.0`, `+2`, `0b10`, `0o2`, `%202` with `400 VALIDATION_ERROR` (`TEST-L6-121`). |
| `F5 / EX-09` | [#122](https://github.com/vienggd/Food-order/issues/122) | Kirakit & Nattakit | **defect · minor** (`AC-F01-14`, `ui-spec.md`) | Cleared one-off route-guard notice cleanly across logout and navigation (`TEST-L6-122`). |
| `F3 / EX-11` | [#124](https://github.com/vienggd/Food-order/issues/124) | Nattakit (B), UAT-01 | **defect · minor** (`AC-F03-10`, `ui-spec.md` S4) | Cleared location state so `"Order #N placed!"` disappears on reload and when status advances (`TEST-L6-124`). |
| `F4 / EX-12` | [#125](https://github.com/vienggd/Food-order/issues/125) | Nattakit (B), 1280 px | **defect · minor** (`ui-spec.md` S3/S4) | Re-fetched list when desktop split detail refreshes so both show `ACCEPTED` (`TEST-L6-125`). |
| `F6 / EX-13` | [#126](https://github.com/vienggd/Food-order/issues/126) | Nattakit (B), UAT-05 | **defect · minor** (`ui-spec.md` error table) | Surfaced server `400` `error.message` on login instead of `"Something went wrong. Please try again."` (`TEST-L6-126`). |
| `EX-04` | [#128](https://github.com/vienggd/Food-order/issues/128) | Kirakit & Nattakit | **defect · minor** (`ui-spec.md` line 62) | Changed phone Cart tab and desktop badge to count cart lines instead of summed quantities (`TEST-L6-128`). |
| `EX-06` | [#129](https://github.com/vienggd/Food-order/issues/129) | Kirakit & Nattakit | **defect · minor** (`ui-spec.md` line 62) | Added `Campus Café` brand to phone top bar (`<header className="top">`) with `0 px` overflow (`TEST-L6-129`). |
| `EX-05` | [#132](https://github.com/vienggd/Food-order/issues/132) | Kirakit & Nattakit | **defect · minor** (`F-04` §3 v1.2 line 59) | Converted desktop queue from `<ul>` + `aria-hidden` headrow to semantic `<table>` with `<th>` column headers (`TEST-L6-132`). |
| Umbrella | `#127` | Kirakit (A) | **duplicate** (split) | Superseded by `#128–#133`; closed by reporter 25 Nov. |
| `EX-01, EX-03, EX-07` | `#130, #131, #133` | Kirakit & Nattakit | **enhancement · minor** | Not required by Sprint 1 SRS/contracts; scheduled in Sprint 3 `F-12` Backlog (`ninja`). |

### Partner execution rows received so far (`b71cdb2`, 25 Nov 2026)
- **Nattakit Prasertsak (B) — `21:07–21:30` UTC+7:** `UAT-02` **PASS** (stepper stops at `10`, Croissant sold out), `UAT-04` **PASS** (persistence + double-accept `409` on Window 2), `UAT-06` **PASS** (`400 VALIDATION_ERROR` on tampered `unitPrice`/`total`). Cookie flags (`HttpOnly; Secure; SameSite=Lax; Max-Age=28800`) and live bundle (`index-DiHrQZz2.js`, `index-BPUDR1A9.css`) verified.
- **Kirakit Kingkaew (A) (`UAT-01, UAT-03, UAT-05`):** __PARTNER_A_ROWS__

### Fix & regression evidence (`lab6` branch, PR [#138](https://github.com/vienggd/Food-order/pull/138))
- **RED before fixes:** Commits `cd56600` (`14` server tests + `8` E2E failed on `TEST-L6-121..129`) and `d1bf95c` (`TEST-L6-132` failed on missing `<table>`); full log in `docs/labs/lab-06/evidence/red.txt`.
- **GREEN after fixes:** Commits `c576273` and `2e291c8` (`docs/labs/lab-06/evidence/green.txt`).
- **Full regression suite (`docs/labs/lab-06/evidence/regression.txt`):**
  - `npm run build`: exit `0` (server `tsc`, client `tsc --noEmit && vite build`).
  - `npm test`: server **85/85** passed (`8` files), client **6/6** passed (`3` files), `0` failed, `0` skipped.
  - `npx playwright test`: **33 passed**, `7` skipped (viewport-specific skips between `phone` & `desktop` in `lab6-fixes.spec.ts`), `0` failed.
  - `docs/sprint_1/evidence/screenshots/`: verified unchanged vs `main`.

## Answer Part D: Re-test handoff & final acceptance decision

[`retest-handoff.md`](retest-handoff.md) prepares all `9` fixed defects (`#123` major first, then `#121, #122, #124, #125, #126, #128, #129, #132`) plus affected Sprint 1 journeys (`UAT-01, UAT-03, UAT-04, UAT-05`) for EN-009_P3's verification once deployed to `main`.

| Re-test item | Recorded value |
|---|---|
| Corrected `main` commit | __CORRECTED_MAIN_COMMIT__ |
| Deployed Cloud Run revision | __DEPLOYED_REVISION__ |
| Partner re-test execution (`#123`, other 8 fixes, `UAT-01/03/04/05`) | __PARTNER_RETEST_RESULTS__ |
| Independent acceptance decision by EN-009_P3 (`Accepted` / `Accepted with limitations` / `Not Accepted`) | __PARTNER_ACCEPTANCE__ |

## Contribution

| Work item | Owner | Reviewer / verifier |
|---|---|---|
| Part A (`uat-cases.md`, `test-plan.md`, `handoff.md`) & Part C (`triage.md`, RED/GREEN fixes PR `#138`, `retest-handoff.md`) & Part D / Report (`#101`) | `vieng` | `ninja` (reviewed/merged PRs `#107`, `#138`) |
| Part B (`execution-partner.md`, outgoing `#141–#148`, extra cases `X1–X8`, `part-b-uat-team.md`), manual `UAT-02/03/05` (`19:00`), PR reviews on `lab6` | `ninja` | `vieng` (reviewed/merged PRs `#105`, `#111`, `#140`, `#149`, `#153`, `#156`; added `#151–#155` & `#141/#142` comments) |

## AI use

Both students used AI assistants (Claude worker sessions and Antigravity + Playwright Chromium) to draft `uat-cases.md`, `triage.md`, `part-b-uat-team.md`, `report.md`, reproducing RED→GREEN regression tests (`TEST-L6-121..132`), PDF scripts, and exploratory multi-viewport audits on the partner app. Every PR was reviewed and merged by the other student's side, and all official human UAT sessions (`19:00–20:00`) and triage/acceptance decisions belong to the students. No account passwords, tokens, or session secrets appear anywhere in the repo, Issues, or this report.

## Limitations

- This is a **pre-release draft skeleton** on branch `lab6`: manual student results from tonight's `19:00–20:00` slot, Saturday's `main` deploy/re-test commit & revision, and both teams' final acceptance decisions remain `PENDING` until executed and recorded.
- Existing `CI` triggers (`main` and `lab-5`), so `lab6` verification rests on real local Postgres + Playwright runs recorded in `docs/labs/lab-06/evidence/`.
