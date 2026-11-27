# Lab 6 — Independent User Acceptance Testing (UAT)

CPE 334 · Semester 1/2026 · Section 131 · group **Est** · Theme 4 (Ordering system) · Campus Café Pre-order (`Food-order`).
Staging branch for all Lab 6 work: **`lab6`**. Corrected fixes are deployed on `main` (`39bda5e` / `food-order-00009-jd9`) with `9/9` partner re-tests **PASS** and **EN-009_P3**'s signed **Accepted** decision recorded on [`songt888/event-registration-system#129`](https://github.com/songt888/event-registration-system/issues/129) (`2026-11-27`).

## Contents

| Part | Role | Title | Key files & PRs | Evidence IDs | Pages |
|---|---|---|---|---|---|
| — | Both | Team, staging branch (`lab6`), version & contribution tables | `docs/labs/lab-06/report.md` (Issue [#101](https://github.com/vienggd/Food-order/issues/101)) | `v0.1.0-sprint1`, `b71cdb2` | 1–3, 21–23 |
| **A** | Product team | Test plan, UAT cases (`UAT-01..06`), and handoff pack | `docs/labs/lab-06/test-plan.md`, `uat-cases.md`, `handoff.md` (PR [#107](https://github.com/vienggd/Food-order/pull/107)) | Accounts `CUSTOMER-A`, `CUSTOMER-B`, `OPERATOR` (no passwords) | 4; App. A1–A3 pp. 24–28 |
| **B** | UAT team | Testing partner **EN-009_P3** (`event-registration-system`) | [`part-b-uat-team.md`](part-b-uat-team.md), [`execution-partner.md`](execution-partner.md) (PRs [#105](https://github.com/vienggd/Food-order/pull/105), [#111](https://github.com/vienggd/Food-order/pull/111), [#140](https://github.com/vienggd/Food-order/pull/140), [#149](https://github.com/vienggd/Food-order/pull/149), [#153](https://github.com/vienggd/Food-order/pull/153), [#156](https://github.com/vienggd/Food-order/pull/156)) | Outgoing `#141–#148`, `#151–#155`; `B-*-GD.png` & `HQ-*.png` (`X1–X7` not run) | 5–8; App. B1–B3 pp. 29–42 |
| **C** | Product team | Partner findings triage (`#121–#133`) & RED→GREEN fixes | [`triage.md`](triage.md), `docs/labs/lab-06/evidence/` (`red.txt`, `green.txt`, `regression.txt`), PR [#138](https://github.com/vienggd/Food-order/pull/138) | `TEST-L6-121..132`; Partner B `UAT-02/04/06` PASS | 9–10; App. C1–C6 pp. 43–54 |
| **D** | Product team | Fix verification, re-test handoff & final acceptance | [`retest-handoff.md`](retest-handoff.md), Issue `#101` | `9/9` fixes + `UAT-01/03/04/05` PASS (`39bda5e` / `food-order-00009-jd9`); **Accepted** (`songt888#129`) | 11; App. D1 pp. 55–56 |
| **E** | Both | Communication between the two teams (Discord group chat) | `docs/labs/lab-06/communication/chat-01..16.png` | Release handoffs, re-test requests, decisions | 12–20 |

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
| **Est (`Food-order`)** Lab 6 triage & defect fixes | PR `#138` (RED `cd56600` / `d1bf95c` -> GREEN `c576273` / `2e291c8`, merge `8356adb`) | `lab6` | Merged into `lab6` & deployed to `main` (`PR #168`, `PR #181`) |
| **Est (`Food-order`)** corrected `main` release | `39bda5e` (PR `#181`, merged `2026-11-27 03:19 UTC+7`; includes `#132` fix after `163fdb7`) | `main` | Merged into `main` |
| **Est (`Food-order`)** deployed revision for re-test | `food-order-00009-jd9` (`index-DbdmxBc6.js`, `/api/ready` OK; previous `food-order-00008-v6c`) | Cloud Run | Deployed; **9/9 fixes + UAT-01/03/04/05 PASS** (`#132` PASS at `03:32 UTC+7`) |
| **Est (`Food-order`)** partner acceptance decision | **Accepted** ([`songt888#129`](https://github.com/songt888/event-registration-system/issues/129)) | `retest-handoff.md` | Signed by Kirakit (A) & Nattakit (B), 27 Nov 2026 (0 conditions) |
| **EN-009_P3 (`event-registration-system`)** under test | tag `v0.1.2-lab5` (`04e8590`, Cloud Run `s47a6b53b-00005-5l7`) | Partner repo / Cloud Run | Initial UAT done (`UAT-01..06` PASS, 13 findings `#141–#148`, `#151–#155`) |
| **EN-009_P3** fixed release for re-test (`RT-F02`, `#141–#161`) | `v0.1.3-lab6` / `502d2a6` / `s47a6b53b-00006-7bv` (`index-CcXia3Aw.js`) | Partner Cloud Run | **Accepted** by team Est on [`songt888#126`](https://github.com/songt888/event-registration-system/issues/126#issuecomment-7202511583) (`13/13` findings & `6/6` UAT cases PASS) |

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
Prior to the official Part B partner execution rows above, vieng executed an automated Playwright (`2×` DPR) pre-check of `UAT-01..06` plus a 6-viewport UX/UI sweep (`1440×900`, `1280×800`, `768×1024`, `375×812`, `320×568`, `812×375`). All six partner UAT cases passed on synthetic events `UAT-GD-01-1757` (`33ab4cbb-93e8-4019-bf8a-4e25ead6ff03`), `UAT-GD-02-1757` (`03e93701-36dd-4b7a-a334-003aa68516e0`), and `UAT-GD-05-1757` (`5204ff4b-f85c-4403-96f8-0027163a7212`) without touching seeded demo events; the 6-ratio sweep recorded 0 page errors, 0 server 5xx responses, confirmed mobile tables scroll internally (`overflow-x: auto`, `0 px` page overflow), re-verified filed issues `#141`, `#146`, `#151`, `#154`, and `#155`, and found no additional non-duplicate defects beyond `#141–#148` and `#151–#155`. All official Part B execution logs and screenshots are recorded in tables **B3–B7** above (AI-driven runs on the students' requests; see **B8**).

## Answer Part C: Triage of partner findings and defect fixes (`Food-order`)

### Received findings (`13` Issues: `9` fixed/closed, `3` open in Backlog, `1` closed duplicate)
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
- **Kirakit Kingkaew (A) (`UAT-01, UAT-03, UAT-05`):** `2026-11-25 22:23–22:33 UTC+7`, manual in Claude built-in browser (checked by B; `UAT-03` steps 3–4 & `UAT-05` signed-out `/orders` carried from earlier Codex Computer Use run): `UAT-01` **PASS** (order `#11`, Latte ×2 + Americano ×1 = `฿185.00`, accepted to `ACCEPTED`), `UAT-03` **PASS** (wrong-role redirects on `/operator/orders` and `/menu`, `CUSTOMER-B` sees `"Order not found."` on `#11`, `#11` unchanged), `UAT-05` **PASS** (wrong password `"Incorrect email or password."` clears password & keeps email; Log out + Back/reload stays `/login`). Recorded in EN-009_P3's [`uat-execution.md`](https://github.com/songt888/event-registration-system/blob/main/docs/labs/lab-06/uat-execution.md).

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
| Corrected `main` commit | `39bda5e` (PR `#181`; preceded by `163fdb7` / PR `#168`) |
| Deployed Cloud Run revision | `food-order-00009-jd9` (`index-DbdmxBc6.js`, `/api/ready` OK; `#121–#129` verified on `food-order-00008-v6c`) |
| Partner re-test execution (`#123`, other 8 fixes, `UAT-01/03/04/05`) | **9/9 fixes PASS & UAT-01/03/04/05 all PASS** (`#121–#129` PASS on `163fdb7` / `food-order-00008-v6c` by Nattakit & Kirakit `00:18–01:45 UTC+7`; `#132` fixed in PR `#174`/`#181` and verified **PASS** on `39bda5e` / `food-order-00009-jd9` by Kirakit `03:32 UTC+7`; Sprint 3 deferral of `#130/#131/#133` accepted). |
| Independent acceptance decision by EN-009_P3 (`Accepted` / `Accepted with limitations` / `Not Accepted`) | **Accepted** — signed by Kirakit Kingkaew (A) & Nattakit Prasertsak (B), 2026-11-27 ([`songt888/event-registration-system#129`](https://github.com/songt888/event-registration-system/issues/129)): 9/9 defects PASS (incl. `#123` major, `#132` by A `03:32` `#191` & B `03:34` `#192`, full 9-defect regression `#192`), `UAT-01/03/04/05` PASS (`#186/#187`), 0 open defects, `#130/#131/#133` deferred enhancements (no condition). |

## Team communication between Est and EN-009_P3

Both teams coordinated Lab 6 in one Discord group chat (4 members: vieng and ninja for Est; song and kakakaka for EN-009_P3). The group was used to hand over each release (version, commit, Cloud Run revision, URL, release notes), ask for re-tests of named Issues, report re-test results, and send the signed acceptance decisions. One partner message (25 Nov, chat 13) contained the shared test-account password; it is blacked out in the screenshot below, and EN-009_P3 was asked to change it. Unrelated older messages (a 29 Oct call, a 23 Nov chat) are cropped out. The screenshots below are cropped to the message area only, in the order they were taken.

![Chat 1 of 16 — Discord group "Est × EN-009_P3" (members: vieng, ninja/DBNN, song, kakakaka), 25–27 Nov 2026](communication/chat-01.png)

![Chat 2 of 16 — Discord group "Est × EN-009_P3" (members: vieng, ninja/DBNN, song, kakakaka), 25–27 Nov 2026](communication/chat-02.png)

![Chat 3 of 16 — Discord group "Est × EN-009_P3" (members: vieng, ninja/DBNN, song, kakakaka), 25–27 Nov 2026](communication/chat-03.png)

![Chat 4 of 16 — Discord group "Est × EN-009_P3" (members: vieng, ninja/DBNN, song, kakakaka), 25–27 Nov 2026](communication/chat-04.png)

![Chat 5 of 16 — Discord group "Est × EN-009_P3" (members: vieng, ninja/DBNN, song, kakakaka), 25–27 Nov 2026](communication/chat-05.png)

![Chat 6 of 16 — Discord group "Est × EN-009_P3" (members: vieng, ninja/DBNN, song, kakakaka), 25–27 Nov 2026](communication/chat-06.png)

![Chat 7 of 16 — Discord group "Est × EN-009_P3" (members: vieng, ninja/DBNN, song, kakakaka), 25–27 Nov 2026](communication/chat-07.png)

![Chat 8 of 16 — Discord group "Est × EN-009_P3" (members: vieng, ninja/DBNN, song, kakakaka), 25–27 Nov 2026](communication/chat-08.png)

![Chat 9 of 16 — Discord group "Est × EN-009_P3" (members: vieng, ninja/DBNN, song, kakakaka), 25–27 Nov 2026](communication/chat-09.png)

![Chat 10 of 16 — Discord group "Est × EN-009_P3" (members: vieng, ninja/DBNN, song, kakakaka), 25–27 Nov 2026](communication/chat-10.png)

![Chat 11 of 16 — Discord group "Est × EN-009_P3" (members: vieng, ninja/DBNN, song, kakakaka), 25–27 Nov 2026](communication/chat-11.png)

![Chat 12 of 16 — Discord group "Est × EN-009_P3" (members: vieng, ninja/DBNN, song, kakakaka), 25–27 Nov 2026](communication/chat-12.png)

![Chat 13 of 16 — Discord group "Est × EN-009_P3" (members: vieng, ninja/DBNN, song, kakakaka), 25–27 Nov 2026](communication/chat-13.png)

![Chat 14 of 16 — Discord group "Est × EN-009_P3" (members: vieng, ninja/DBNN, song, kakakaka), 25–27 Nov 2026](communication/chat-14.png)

![Chat 15 of 16 — Discord group "Est × EN-009_P3" (members: vieng, ninja/DBNN, song, kakakaka), 25–27 Nov 2026](communication/chat-15.png)

![Chat 16 of 16 — Discord group "Est × EN-009_P3" (members: vieng, ninja/DBNN, song, kakakaka), 25–27 Nov 2026](communication/chat-16.png)

## Contribution

| Work item | Owner | Reviewer / verifier |
|---|---|---|
| Part A (`uat-cases.md`, `test-plan.md`, `handoff.md`) & Part C (`triage.md`, RED/GREEN fixes PR `#138`, `retest-handoff.md`) & Part D / Report (`#101`) | `vieng` | `ninja` (reviewed/merged PRs `#107`, `#138`) |
| Part B (`execution-partner.md`, outgoing `#141–#148`, extra case `X8`, `part-b-uat-team.md`), Part B `UAT-02/03/05` & `v0.1.3-lab6` re-tests (AI-driven with ninja sign-in), PR reviews on `lab6` | `ninja` |
| Part B `UAT-01/04/06` runs and `#151–#155` re-tests (AI-driven on vieng's request), Section E team communication with EN-009_P3, releases to `main` (PRs `#168`, `#181`) | `vieng` | `ninja` (reviewed/merged) | `vieng` (reviewed/merged PRs `#105`, `#111`, `#140`, `#149`, `#153`, `#156`; added `#151–#155` & `#141/#142` comments) |

## AI use

Both students used AI assistants (Claude worker sessions and Antigravity + Playwright Chromium) to draft `uat-cases.md`, `triage.md`, `part-b-uat-team.md`, `report.md`, reproducing RED→GREEN regression tests (`TEST-L6-121..132`), PDF scripts, and browser UAT / multi-viewport audits on the partner app. Every PR was reviewed and merged by the other student's side, and all triage and `Accepted` sign-off decisions belong to the students. No account passwords, tokens or session secrets appear in this report: one partner chat message that contained a shared test password is blacked out in Section E, and test accounts were always exchanged privately.

## Limitations

- All 9 accepted fixes are deployed on `main` (`39bda5e` / `food-order-00009-jd9`), `9/9` partner re-tests pass, team Est posted `Accepted` on `songt888#126`, and EN-009_P3 signed `Accepted` on `songt888#129` (`2026-11-27`). Issue `#101` is closed and its board card is Done.
- GitHub Actions CI runs on pull requests into `main` (and `lab-5`), not into `lab6`. Fixes on `lab6` were therefore verified with full local real-Postgres and Playwright runs (`docs/labs/lab-06/evidence/`), and CI `test-and-docker` then passed on both release PRs `#168` and `#181` before deploy (Appendix C6).
- Part B test runs on EN-009_P3's app were driven by an AI browser on the students' request, with the students choosing the cases and owning every PASS/FAIL and the final decision (ninja signed in by hand for his runs); each execution row states exactly how it was run.

## Appendices

These appendices put the assessed material directly in this PDF (handout §4.1). Linked files are the same files in `docs/labs/lab-06/` on branch `lab6`.

### Appendix A1 — Complete UAT cases we sent to EN-009_P3 (Part A)

<!-- INCLUDE: uat-cases.md -->

### Appendix A2 — Handoff pack we sent (Part A)

<!-- INCLUDE: handoff.md -->

### Appendix A3 — Test plan (Part A)

<!-- INCLUDE: test-plan.md -->

### Appendix B1 — Our execution of EN-009_P3's cases (Part B)

<!-- INCLUDE: execution-partner.md -->

### Appendix B2 — Outgoing findings we reported to EN-009_P3 (Part B)

<!-- INCLUDE: outgoing-issues-draft.md -->

### Appendix B3 — Selected screenshot evidence of our UAT on EN-009_P3 (Part B)

![B-UAT01-s08 — Part B normal journey on EN-009_P3 (UAT-01): Participant 3 registered, 2 of 3 places left. v0.1.2-lab5 / 04e8590, 26 Nov 21:29 UTC+7, expected = actual, PASS](screenshots-partner/B-UAT01-s08-GD.png)

![B-UAT06-s03 — Part B rejected sign-in (UAT-06): wrong password shows "Email or password is incorrect.", stays on /login, nothing disclosed. v0.1.2-lab5, 26 Nov 21:28 UTC+7, PASS](screenshots-partner/B-UAT06-s03-GD.png)

![HQ-UAT03-s2 — Part B forbidden ownership (UAT-03): Organizer Two denied another organizer's event; protected data not shown. v0.1.3-lab6 / 502d2a6, PASS](screenshots-partner/HQ-UAT03-s2-O2-denied.png)

![HQ-UAT02-s8 — Part B business rule (UAT-02): Participant 4 refused, "This event has no places left." v0.1.3-lab6, PASS](screenshots-partner/HQ-UAT02-s8-P4-no-places-left.png)

![B-UAT04-s09 — Part B persistence (UAT-04): registration still ACTIVE in the organizer roster after redeploy to s47a6b53b-00006-7bv, 27 Nov 00:20 UTC+7, PASS](screenshots-partner/B-UAT04-s09-roster-GD.png)

![HQ-143-b — Part B re-test of our outgoing finding #143 on v0.1.3-lab6: refused registration no longer changes the places count (2 of 3). PASS](screenshots-partner/HQ-143-b-tabA-refused-and-2of3.png)

### Appendix C1 — Triage of the findings EN-009_P3 sent us (Part C)

<!-- INCLUDE: triage.md -->

### Appendix C2 — RED output before the fixes (Part C)

```text
RED run, 26 Nov 2026, on lab6 baseline commit e1057b7 (b71cdb2 app code before Lab 6 fixes).

== Server API: cd server && npx vitest run tests/orders.test.ts tests/operator.test.ts ==
   × F-03 GET /api/orders and /api/orders/:id > TEST-L6-121 rejects non-decimal/coerced id 0x1 with 400 VALIDATION_ERROR 768ms
     → expected 200 to be 400 // Object.is equality
   × F-03 GET /api/orders and /api/orders/:id > TEST-L6-121 rejects non-decimal/coerced id 1e0 with 400 VALIDATION_ERROR 1172ms
     → expected 200 to be 400 // Object.is equality
   × F-03 GET /api/orders and /api/orders/:id > TEST-L6-121 rejects non-decimal/coerced id 1.0 with 400 VALIDATION_ERROR 798ms
     → expected 200 to be 400 // Object.is equality
   × F-03 GET /api/orders and /api/orders/:id > TEST-L6-121 rejects non-decimal/coerced id +1 with 400 VALIDATION_ERROR 973ms
     → expected 200 to be 400 // Object.is equality
   × F-03 GET /api/orders and /api/orders/:id > TEST-L6-121 rejects non-decimal/coerced id 0b1 with 400 VALIDATION_ERROR 1240ms
     → expected 200 to be 400 // Object.is equality
   × F-03 GET /api/orders and /api/orders/:id > TEST-L6-121 rejects non-decimal/coerced id 0o1 with 400 VALIDATION_ERROR 991ms
     → expected 200 to be 400 // Object.is equality
   × F-03 GET /api/orders and /api/orders/:id > TEST-L6-121 rejects non-decimal/coerced id %201 with 400 VALIDATION_ERROR 878ms
     → expected 200 to be 400 // Object.is equality
   × F-04 accept > TEST-L6-121 accept rejects non-decimal/coerced id 0x1 with 400 VALIDATION_ERROR 501ms
     → expected 200 to be 400 // Object.is equality
   × F-04 accept > TEST-L6-121 accept rejects non-decimal/coerced id 1e0 with 400 VALIDATION_ERROR 420ms
     → expected 200 to be 400 // Object.is equality
   × F-04 accept > TEST-L6-121 accept rejects non-decimal/coerced id 1.0 with 400 VALIDATION_ERROR 529ms
     → expected 200 to be 400 // Object.is equality
   × F-04 accept > TEST-L6-121 accept rejects non-decimal/coerced id +1 with 400 VALIDATION_ERROR 630ms
     → expected 200 to be 400 // Object.is equality
   × F-04 accept > TEST-L6-121 accept rejects non-decimal/coerced id 0b1 with 400 VALIDATION_ERROR 402ms
     → expected 200 to be 400 // Object.is equality
   × F-04 accept > TEST-L6-121 accept rejects non-decimal/coerced id 0o1 with 400 VALIDATION_ERROR 418ms
     → expected 200 to be 400 // Object.is equality
   × F-04 accept > TEST-L6-121 accept rejects non-decimal/coerced id %201 with 400 VALIDATION_ERROR 810ms
     → expected 200 to be 400 // Object.is equality
 Test Files  2 failed (2)
      Tests  14 failed | 40 passed (54)

== E2E: npx playwright test e2e/lab6-fixes.spec.ts ==
  x   1 [phone] › e2e\lab6-fixes.spec.ts:11:7 › TEST-L6-123 phone cart bar does not cover the last menu item (#123)
      Expected: <= 676, Received: 701.140625
  x   6 [phone] › e2e\lab6-fixes.spec.ts:120:7 › TEST-L6-128 cart badge counts cart lines rather than total item quantities (#128)
      Expected: "Cart (1)", Received: "Cart (2)"
  x   7 [phone] › e2e\lab6-fixes.spec.ts:139:7 › TEST-L6-129 phone top bar displays Campus Café brand without horizontal overflow (#129)
      Expected substring: "Campus Café", Received string: "Hey, AliceCustomerLog out"
  x   9 [desktop] › e2e\lab6-fixes.spec.ts:32:7 › TEST-L6-122 access warning clears on logout and on next navigation (#122)
      getByText("You don't have access to that page.") Expected: 0, Received: 1
  x  10 [desktop] › e2e\lab6-fixes.spec.ts:56:7 › TEST-L6-124 Order placed banner disappears after reload and after status becomes ACCEPTED (#124)
      getByText("Order #2 placed!") Expected: 0, Received: 1
  x  11 [desktop] › e2e\lab6-fixes.spec.ts:83:7 › TEST-L6-125 desktop split view keeps list status synced when Refresh status runs (#125)
      locator('.order-list button').filter({ hasText: '#1' }) Expected substring: "ACCEPTED", Received: "#100:56 · 1 itemPLACED฿65.00"
  x  12 [desktop] › e2e\lab6-fixes.spec.ts:101:7 › TEST-L6-126 login 400 shows server validation message instead of generic network error (#126)
      Expected substring: not "Something went wrong", Received: "Something went wrong. Please try again."
  x  13 [desktop] › e2e\lab6-fixes.spec.ts:120:7 › TEST-L6-128 cart badge counts cart lines rather than total item quantities (#128)
      Expected: "1", Received: "2"
  8 failed (0 passed, 6 skipped project-specific tests)

== Additional E2E RED (#132 / EX-05, 26 Nov 2026): npx playwright test e2e/lab6-fixes.spec.ts -g TEST-L6-132 ==
  1) [desktop] › e2e\lab6-fixes.spec.ts:149:7 › Lab 6 UAT defect regressions › TEST-L6-132 desktop operator queue uses a semantic table with column headers (#132)
    Error: expect(locator).toBeVisible() failed
    Locator: getByRole('table')
    Expected: visible
    Error: element(s) not found
  1 failed (1 skipped project-specific test)
```

### Appendix C3 — GREEN output and full regression after the fixes (Part C)

```text
GREEN run, 26 Nov 2026, after fixes for UAT defects #121-#126, #128, #129 (follows RED commit cd56600).

== Server API: cd server && npx vitest run tests/orders.test.ts tests/operator.test.ts ==
 ✓ tests/orders.test.ts (37 tests) 16354ms
   ✓ F-03 GET /api/orders and /api/orders/:id > TEST-L6-121 rejects non-decimal/coerced id 0x1 with 400 VALIDATION_ERROR  448ms
   ✓ F-03 GET /api/orders and /api/orders/:id > TEST-L6-121 rejects non-decimal/coerced id 1e0 with 400 VALIDATION_ERROR  450ms
   ✓ F-03 GET /api/orders and /api/orders/:id > TEST-L6-121 rejects non-decimal/coerced id 1.0 with 400 VALIDATION_ERROR  504ms
   ✓ F-03 GET /api/orders and /api/orders/:id > TEST-L6-121 rejects non-decimal/coerced id +1 with 400 VALIDATION_ERROR  468ms
   ✓ F-03 GET /api/orders and /api/orders/:id > TEST-L6-121 rejects non-decimal/coerced id 0b1 with 400 VALIDATION_ERROR  520ms
   ✓ F-03 GET /api/orders and /api/orders/:id > TEST-L6-121 rejects non-decimal/coerced id 0o1 with 400 VALIDATION_ERROR  635ms
   ✓ F-03 GET /api/orders and /api/orders/:id > TEST-L6-121 rejects non-decimal/coerced id %201 with 400 VALIDATION_ERROR  477ms
 ✓ tests/operator.test.ts (17 tests) 8026ms
   ✓ F-04 accept > TEST-L6-121 accept rejects non-decimal/coerced id 0x1..%201 with 400 VALIDATION_ERROR (all 7 passed)
 Test Files  2 passed (2)
      Tests  54 passed (54)

== E2E: npx playwright test e2e/lab6-fixes.spec.ts ==
  ok  1 [phone] › e2e\lab6-fixes.spec.ts:11:7 › TEST-L6-123 phone cart bar does not cover the last menu item (#123) (1.2s)
  ok  6 [phone] › e2e\lab6-fixes.spec.ts:120:7 › TEST-L6-128 cart badge counts cart lines rather than total item quantities (#128) (895ms)
  ok  7 [phone] › e2e\lab6-fixes.spec.ts:139:7 › TEST-L6-129 phone top bar displays Campus Café brand without horizontal overflow (#129) (747ms)
  ok  9 [desktop] › e2e\lab6-fixes.spec.ts:32:7 › TEST-L6-122 access warning clears on logout and on next navigation (#122) (1.6s)
  ok 10 [desktop] › e2e\lab6-fixes.spec.ts:56:7 › TEST-L6-124 Order placed banner disappears after reload and after status becomes ACCEPTED (#124) (1.3s)
  ok 11 [desktop] › e2e\lab6-fixes.spec.ts:83:7 › TEST-L6-125 desktop split view keeps list status synced when Refresh status runs (#125) (987ms)
  ok 12 [desktop] › e2e\lab6-fixes.spec.ts:101:7 › TEST-L6-126 login 400 shows server validation message instead of generic network error (#126) (890ms)
  ok 13 [desktop] › e2e\lab6-fixes.spec.ts:120:7 › TEST-L6-128 cart badge counts cart lines rather than total item quantities (#128) (884ms)
  6 skipped (viewport-specific tests skipped on the other project)
  8 passed (24.2s)

== Additional E2E GREEN (#132 / EX-05, 26 Nov 2026, follows RED d1bf95c): npx playwright test e2e/lab6-fixes.spec.ts e2e/queue.spec.ts ==
  ok [desktop] › e2e\lab6-fixes.spec.ts:149:7 › TEST-L6-132 desktop operator queue uses a semantic table with column headers (#132)
  ok [phone+desktop] › e2e\queue.spec.ts:14,26,35 › TEST-F04-11..13
  15 passed (37.3s), 7 skipped (viewport-specific skips in lab6-fixes.spec.ts), 0 failed
```

```text
Regression run, 26 Nov 2026, after Lab 6 fixes for #121-#126, #128, #129, #132 (semantic table) on lab6-vieng.
Baseline before Lab 6 fixes (e1057b7 / b71cdb2 code): server 8 files / 71 tests pass, client 3 files / 6 tests pass.

== Build: npm run build ==
- server: prisma generate && tsc -> exit 0
- client: tsc --noEmit && vite build -> exit 0 (52 modules, 1.46s)

== Unit / API tests: npm test ==
- server: Test Files 8 passed (8), Tests 85 passed (85), 0 failed, 0 skipped
- client: Test Files 3 passed (3), Tests 6 passed (6), 0 failed, 0 skipped

== Full Playwright E2E: npx playwright test ==
- 33 passed (59.7s), 7 skipped (viewport-specific skips in e2e/lab6-fixes.spec.ts), 0 failed
- Covers all Sprint 1 journeys (auth, menu, orders, operator queue) on phone (375px) + desktop (1280px) plus all 9 Lab 6 defect regression tests (#121-#126, #128, #129, #132).
```

### Appendix C4 — Review text of the fix PR #138 (Part C)

```text
PR #138 (lab6 fixes) — reviews and comments as on GitHub

Title: L6-03/04: Triage UAT findings (#121-#133) and fix accepted defects (RED->GREEN)
Author: vienggd  Merged by: NinjoMUDA at 2026-11-26T08:48:43Z

Review by NinjoMUDA (CHANGES_REQUESTED) at 2026-11-26T06:46:25Z:
Build on PR head: npm ci + npm run build OK. I could NOT run the DB tests/E2E myself (Docker not running here); I read the RED/GREEN/regression evidence instead: RED fails for the reported behaviour (expected 200 to be 400, Cart (2) vs Cart (1), overlap 701>676), not compile errors; GREEN 8 passed; regression 85+6 unit, 32 E2E.

Please fix before merge:
1. EX-05 (#132) is wrongly an enhancement. F-04 section UI line 59 says the desktop queue is 'the orders as a table (Order, Customer, Items, Placed, Total, Action), as in DesktopQueue.html', and the F-04 changelog v1.2 (6 Nov) says 'desktop queue is a table, no longer UI debt'. The triage reason 'already logged as UI debt' is the old v1.1 text. client/src/pages/QueuePage.tsx still renders ul + aria-hidden headrow. That is a broken written rule: reclassify as defect (minor), fix test-first (RED then GREEN) or keep it as an accepted known defect with a reason, but do not call it an enhancement.
2. Wrong contract cites (decision may stay, quote the right line): #125/F4 cites AC-F03-07, but AC-F03-07 is 'list only own orders, newest first'; cite the ui-spec S3/S4 text instead. #123/F2 cites AC-F02-06, which is price/Sold-out display; the real basis is NFR-06 (works at 375 px) and AC-F02-06 only for 'add button reachable'. #126/F6 cites AC-F01-04 (API validation); the UI line is the ui-spec Errors table.
3. ID EX-01 is used twice (umbrella #127 and the focus item #130). Give the focus item a distinct source ID so the table is traceable.
4. #121 status says 'Fixing on lab6' but the table says fixed in #138; make Status consistent.
5. #130/#131/#133 as enhancement look fine (no Sprint 1 line asks for focus move, aria-describedby, clear-on-change; NFR-09 is Sprint 3). Keep, with the F-12 issue link if one exists.
6. Retest-handoff/Partner decision stay TBD; fine. Do not claim acceptance until A's rows UAT-01/03/05 arrive.

Review by NinjoMUDA (APPROVED) at 2026-11-26T08:48:40Z:
Re-checked. All 4 points fixed: #132 now a defect with RED d1bf95c (getByRole('table') not found, real behaviour failure) then GREEN 2e291c8 (QueuePage uses table + th scope=col); cites for #123/#125/#126 corrected; #127 umbrella id fixed; #121 status consistent. npm ci + npm run build OK on PR head. DB tests/E2E not run by me (Docker off); I rely on the evidence files (85 server + 6 client, Playwright 33 passed/7 skipped).
Follow-up: partner decision stays TBD until A's UAT-01/03/05 rows and the post-deploy re-test; do not claim acceptance before.

Comment by vienggd at 2026-11-26T08:47:39Z:
Addressed all review points in RED d1bf95c -> GREEN 2e291c8:
1. EX-05 (#132) reclassified as minor defect (per F-04 §3 UI & v1.2) and fixed test-first: TEST-L6-132 failed RED on ul (d1bf95c) -> converted QueuePage.tsx desktop queue to semantic <table> with <th> column headers while preserving the phone card grid (2e291c8), linked #132 to this PR.
2. Fixed triage.md contract cites for #123 (NFR-06 + AC-F02-06 reachable +), #125 (ui-spec S3/S4, removed AC-F03-07), and #126 (ui-spec Errors table; API 400 already satisfies AC-F01-04).
3. Renamed #127 Finding ID to 'Umbrella (#127)' so EX-01 is used only on #130.
4. Updated #121 Status to 'Fixed in PR #138'.
5. #130/#131/#133 enhancements now reference Sprint 3 docs/sprint_2/sprints/F-12-polish-a11y.md (NFR-09; no Sprint 3 implementation Issue yet).
6. Updated retest-handoff.md with all 9 fixed defects and kept partner decision TBD until A's UAT-01/03/05 rows and post-deploy retest.
Verification after 2e291c8: npm run build exit 0; npm test 85 server + 6 client; targeted E2E (lab6-fixes + queue) 15 passed / 7 skipped; full Playwright 33 passed / 7 skipped; Sprint 1 screenshots clean. Ready for re-review.

Comment by NinjoMUDA at 2026-11-26T08:48:47Z:
Merged after approval. Follow-ups: deploy the merged version, send retest-handoff.md to EN-009_P3, record their decision.
```

### Appendix C5 — Code diff of the fixes (Part C)

```text
Code changes of the accepted-defect fixes: PR #138 into lab6 and the #132 fix PR #174. Source .ts/.tsx files only (CSS left out for length); the tests are in Appendix C2/C3.

diff --git a/client/src/App.tsx b/client/src/App.tsx
index e626150..351e6a8 100644
--- a/client/src/App.tsx
+++ b/client/src/App.tsx
@@ -1,4 +1,5 @@
-import { Link, Navigate, Route, Routes } from "react-router-dom";
+import { useEffect, useRef } from "react";
+import { Link, Navigate, Route, Routes, useLocation } from "react-router-dom";
 import { homeFor, useAuth } from "./auth";
 import { RequireRole } from "./Layout";
 import { LoginPage } from "./pages/LoginPage";
@@ -26,7 +27,23 @@ function NotFound() {
 
 export function App() {
   // key: a new user gets a new, empty cart.
-  const { user } = useAuth();
+  const { user, notice, noticeTarget, setNotice } = useAuth();
+  const { pathname } = useLocation();
+  const shownOnRef = useRef<string | null>(null);
+
+  useEffect(() => {
+    if (!notice) {
+      shownOnRef.current = null;
+      return;
+    }
+    const expected = noticeTarget ?? pathname;
+    if (pathname === expected) {
+      shownOnRef.current = expected;
+    } else if (shownOnRef.current !== null && pathname !== shownOnRef.current) {
+      setNotice(null);
+    }
+  }, [notice, noticeTarget, pathname, setNotice]);
+
   return (
     <CartProvider key={user?.id ?? 0}>
     <Routes>
diff --git a/client/src/Layout.tsx b/client/src/Layout.tsx
index 15c818f..622860c 100644
--- a/client/src/Layout.tsx
+++ b/client/src/Layout.tsx
@@ -13,7 +13,7 @@ const LINKS: Record<Role, { to: string; label: string }[]> = {
 
 function WrongRole({ home }: { home: string }) {
   const { setNotice } = useAuth();
-  useEffect(() => setNotice("You don't have access to that page."), [setNotice]);
+  useEffect(() => setNotice("You don't have access to that page.", home), [home, setNotice]);
   return <Navigate to={home} replace />;
 }
 
@@ -37,7 +37,7 @@ export function RequireRole({ role, title, children }: { role: Role; title: stri
 
   const links = LINKS[user.role];
   const clearNotice = () => setNotice(null); // a notice is for one redirect, not every page after it
-  const cartCount = cart.lines.reduce((n, l) => n + l.quantity, 0);
+  const cartCount = cart.lines.length;
   const roleChip = user.role === "OPERATOR" ? "Operator" : "Customer";
   const logoutButton = (cls: string) => (
     <button className={cls} onClick={doLogout} disabled={leaving}>
@@ -67,6 +67,7 @@ export function RequireRole({ role, title, children }: { role: Role; title: stri
 
       <header className="top">
         <div>
+          <p className="brand small">Campus Café</p>
           <p className="hey">Hey, {user.name}</p>
           <p className="role">{roleChip}</p>
         </div>
diff --git a/client/src/auth.tsx b/client/src/auth.tsx
index 7748e55..55e75f4 100644
--- a/client/src/auth.tsx
+++ b/client/src/auth.tsx
@@ -10,7 +10,8 @@ type Auth = {
   user: User | null;
   loading: boolean;
   notice: string | null; // one-off message shown on the next screen
-  setNotice: (n: string | null) => void;
+  noticeTarget: string | null;
+  setNotice: (n: string | null, targetPath?: string) => void;
   login: (email: string, password: string) => Promise<User>;
   logout: () => Promise<void>;
 };
@@ -20,7 +21,11 @@ const AuthContext = createContext<Auth | null>(null);
 export function AuthProvider({ children }: { children: ReactNode }) {
   const [user, setUser] = useState<User | null>(null);
   const [loading, setLoading] = useState(true);
-  const [notice, setNotice] = useState<string | null>(null);
+  const [noticeState, setNoticeState] = useState<{ text: string; targetPath: string | null } | null>(null);
+
+  const setNotice = useCallback((n: string | null, targetPath?: string) => {
+    setNoticeState(n ? { text: n, targetPath: targetPath ?? null } : null);
+  }, []);
 
   useEffect(() => {
     api<User>("/api/auth/me")
@@ -29,24 +34,37 @@ export function AuthProvider({ children }: { children: ReactNode }) {
       .finally(() => setLoading(false));
     setUnauthorizedHandler(() => {
       setUser(null);
-      setNotice("Your session has ended. Please log in again.");
+      setNotice("Your session has ended. Please log in again.", "/login");
     });
-  }, []);
+  }, [setNotice]);
 
   const login = useCallback(async (email: string, password: string) => {
     const u = await api<User>("/api/auth/login", { method: "POST", body: { email, password } });
     setUser(u);
-    setNotice(null);
+    setNoticeState(null);
     return u;
   }, []);
 
   const logout = useCallback(async () => {
     await api("/api/auth/logout", { method: "POST" }).catch(() => {});
     setUser(null); // whatever the result, the client forgets the user
+    setNoticeState(null);
   }, []);
 
   return (
-    <AuthContext.Provider value={{ user, loading, notice, setNotice, login, logout }}>{children}</AuthContext.Provider>
+    <AuthContext.Provider
+      value={{
+        user,
+        loading,
+        notice: noticeState?.text ?? null,
+        noticeTarget: noticeState?.targetPath ?? null,
+        setNotice,
+        login,
+        logout,
+      }}
+    >
+      {children}
+    </AuthContext.Provider>
   );
 }
 
diff --git a/client/src/pages/LoginPage.tsx b/client/src/pages/LoginPage.tsx
index 507998d..f8d3809 100644
--- a/client/src/pages/LoginPage.tsx
+++ b/client/src/pages/LoginPage.tsx
@@ -32,7 +32,13 @@ export function LoginPage() {
       navigate(homeFor(u.role), { replace: true });
     } catch (err) {
       setPassword("");
-      setError(err instanceof ApiError && err.status === 401 ? "Incorrect email or password." : NETWORK_MESSAGE);
+      setError(
+        err instanceof ApiError && err.status === 401
+          ? "Incorrect email or password."
+          : err instanceof ApiError && err.status === 400
+            ? err.message
+            : NETWORK_MESSAGE,
+      );
       setBusy(false);
     }
   }
diff --git a/client/src/pages/OrdersPage.tsx b/client/src/pages/OrdersPage.tsx
index bed2a6e..498165a 100644
--- a/client/src/pages/OrdersPage.tsx
+++ b/client/src/pages/OrdersPage.tsx
@@ -1,4 +1,4 @@
-import { useCallback, useEffect, useState } from "react";
+import { useCallback, useEffect, useRef, useState } from "react";
 import { Link, useLocation, useNavigate, useParams } from "react-router-dom";
 import { api, ApiError } from "../api";
 import { formatBaht } from "../lib/money";
@@ -23,14 +23,15 @@ function Skeletons() {
 // Phone: the list, or the detail when an order is open.
 export function OrdersSplit() {
   const { id } = useParams();
+  const [synced, setSynced] = useState<{ id: number; status: OrderStatus } | null>(null);
   return (
     <div className={"orders-split" + (id ? " has-detail" : "")}>
       <section className="split-list">
-        <OrdersPage selectedId={id} />
+        <OrdersPage selectedId={id} synced={synced} />
       </section>
       <section className="split-detail">
         {id ? (
-          <OrderDetailPage key={id} />
+          <OrderDetailPage key={id} onLoaded={(o) => setSynced({ id: o.id, status: o.status })} />
         ) : (
           <div className="empty">
             <p className="muted">Select an order to see its details.</p>
@@ -42,7 +43,13 @@ export function OrdersSplit() {
 }
 
 // S3 My orders (F-03): own orders, newest first. Refresh by hand (no polling in Sprint 1).
-export function OrdersPage({ selectedId }: { selectedId?: string }) {
+export function OrdersPage({
+  selectedId,
+  synced,
+}: {
+  selectedId?: string;
+  synced?: { id: number; status: OrderStatus } | null;
+}) {
   const [orders, setOrders] = useState<OrderSummary[] | "loading" | "error">("loading");
   const navigate = useNavigate();
   const load = useCallback(() => {
@@ -95,7 +102,7 @@ export function OrdersPage({ selectedId }: { selectedId?: string }) {
               <span className="muted">
                 {formatPlacedTime(o.createdAt)} · {o.itemCount} {o.itemCount === 1 ? "item" : "items"}
               </span>
-              <StatusPill status={o.status} />
+              <StatusPill status={synced && synced.id === o.id ? synced.status : o.status} />
               <strong>{formatBaht(o.total)}</strong>
             </button>
           </li>
@@ -111,16 +118,28 @@ const HINT: Partial<Record<OrderStatus, string>> = {
 };
 
 // S4 Order detail (F-03): lines and total come from the order itself (BR-05), never from the menu.
-export function OrderDetailPage() {
+export function OrderDetailPage({ onLoaded }: { onLoaded?: (order: Order) => void }) {
   const { id } = useParams();
   const location = useLocation();
-  const justPlaced = (location.state as { placed?: boolean } | null)?.placed;
+  const navigate = useNavigate();
+  const [justPlaced] = useState(() => Boolean((location.state as { placed?: boolean } | null)?.placed));
   const [order, setOrder] = useState<Order | "loading" | "notfound" | "error">("loading");
+  const onLoadedRef = useRef(onLoaded);
+  onLoadedRef.current = onLoaded;
+
+  useEffect(() => {
+    if ((location.state as { placed?: boolean } | null)?.placed) {
+      navigate(location.pathname, { replace: true, state: null });
+    }
+  }, [location.pathname, location.state, navigate]);
 
   const load = useCallback(() => {
     setOrder("loading");
     api<Order>(`/api/orders/${id}`)
-      .then(setOrder)
+      .then((o) => {
+        setOrder(o);
+        onLoadedRef.current?.(o);
+      })
       .catch((e) => setOrder(e instanceof ApiError && (e.status === 404 || e.status === 400) ? "notfound" : "error"));
   }, [id]);
   useEffect(load, [load]);
@@ -151,7 +170,7 @@ export function OrderDetailPage() {
   return (
     <div className="order-detail">
       {back}
-      {justPlaced && (
+      {justPlaced && order.status === "PLACED" && (
         <div className="msg success" role="status">
           Order #{order.id} placed!
         </div>
diff --git a/client/src/pages/QueuePage.tsx b/client/src/pages/QueuePage.tsx
index a08f3f0..169c5b4 100644
--- a/client/src/pages/QueuePage.tsx
+++ b/client/src/pages/QueuePage.tsx
@@ -109,30 +109,40 @@ export function QueuePage() {
           <p className="muted">New orders appear here when you refresh.</p>
         </div>
       ) : (
-        // Phone: one card per order. Desktop: the same items laid out as table rows (styles.css).
-        <ul className="queue">
-          <li className="queue-headrow" aria-hidden="true">
-            <span>Order</span>
-            <span>Customer</span>
-            <span>Items</span>
-            <span>Placed</span>
-            <span>Total</span>
-            <span>Action</span>
-          </li>
-          {orders.map((o) => (
-            <li className="card order-card" key={o.id} data-testid={`order-${o.id}`}>
-              <span className="q-no order-no">#{o.id}</span>
-              <span className="q-pill pill placed">PLACED</span>
-              <span className="q-who">{o.customer.name}</span>
-              <span className="q-time muted">{formatPlacedTime(o.createdAt)}</span>
-              <span className="q-items muted">{items(o)}</span>
-              <strong className="q-total">{baht(o.total)}</strong>
-              <button className="q-action btn small" disabled={busyId === o.id} onClick={() => accept(o.id)}>
-                {busyId === o.id ? "Accepting…" : "Accept order"}
-              </button>
-            </li>
-          ))}
-        </ul>
+        // Phone: one card per order (CSS grid). Desktop: semantic table (styles.css).
+        <table className="queue">
+          <thead>
+            <tr className="queue-headrow">
+              <th scope="col">Order</th>
+              <th scope="col">Customer</th>
+              <th scope="col">Items</th>
+              <th scope="col">Placed</th>
+              <th scope="col">Total</th>
+              <th scope="col">Action</th>
+            </tr>
+          </thead>
+          <tbody>
+            {orders.map((o) => (
+              <tr className="card order-card" key={o.id} data-testid={`order-${o.id}`}>
+                <td className="q-no order-no">#{o.id}</td>
+                <td className="q-pill">
+                  <span className="pill placed">PLACED</span>
+                </td>
+                <td className="q-who">{o.customer.name}</td>
+                <td className="q-items muted">{items(o)}</td>
+                <td className="q-time muted">{formatPlacedTime(o.createdAt)}</td>
+                <td className="q-total">
+                  <strong>{baht(o.total)}</strong>
+                </td>
+                <td className="q-action">
+                  <button className="btn small" disabled={busyId === o.id} onClick={() => accept(o.id)}>
+                    {busyId === o.id ? "Accepting…" : "Accept order"}
+                  </button>
+                </td>
+              </tr>
+            ))}
+          </tbody>
+        </table>
       )}
     </section>
   );
diff --git a/server/src/ids.ts b/server/src/ids.ts
index 8f2368b..1762a66 100644
--- a/server/src/ids.ts
+++ b/server/src/ids.ts
@@ -2,4 +2,8 @@ import { z } from "zod";
 
 // Database ids are Postgres `int`: 1..2147483647. A larger number would make Prisma throw (500), so reject it here (400).
 export const MAX_DB_ID = 2147483647;
-export const dbId = z.coerce.number().int().min(1).max(MAX_DB_ID);
+export const dbId = z
+  .string()
+  .regex(/^[1-9]\d*$/, "Invalid id.")
+  .transform(Number)
+  .pipe(z.number().int().min(1).max(MAX_DB_ID));

=== PR #174 (#132 desktop queue table) ===
diff --git a/client/src/pages/QueuePage.tsx b/client/src/pages/QueuePage.tsx
index 169c5b4..31cc29c 100644
--- a/client/src/pages/QueuePage.tsx
+++ b/client/src/pages/QueuePage.tsx
@@ -114,6 +114,7 @@ export function QueuePage() {
           <thead>
             <tr className="queue-headrow">
               <th scope="col">Order</th>
+              <th scope="col">Status</th>
               <th scope="col">Customer</th>
               <th scope="col">Items</th>
               <th scope="col">Placed</th>
```

### Appendix C6 — Review, CI and deploy evidence of the fixes (Part C/D)

```text
CI / review / deploy evidence for the Lab 6 fixes (from GitHub, gh CLI)

PR #138 L6-03/04: Triage UAT findings (#121-#133) and fix accepted defects (RED->GREEN)
  into lab6, merged by NinjoMUDA at 2026-11-26T08:48:43Z, merge commit 8356adb
  reviews: NinjoMUDA CHANGES_REQUESTED, NinjoMUDA APPROVED
  checks: 
PR #174 fix(lab6): add Status header to desktop queue table (#132)
  into lab6, merged by NinjoMUDA at 2026-11-26T19:13:35Z, merge commit 4a136c8
  reviews: NinjoMUDA APPROVED
  checks: 
PR #168 Release Lab 6: Sprint 1 defect fixes (#138) and UAT execution records
  into main, merged by NinjoMUDA at 2026-11-26T16:36:25Z, merge commit 163fdb7
  reviews: NinjoMUDA APPROVED
  checks: test-and-docker=SUCCESS
PR #181 release(lab6): deploy #132 desktop queue Status header fix and Lab 6 retest docs
  into main, merged by NinjoMUDA at 2026-11-26T20:19:31Z, merge commit 39bda5e
  reviews: NinjoMUDA APPROVED
  checks: test-and-docker=SUCCESS

Deploy runs on main (GitHub Actions "Deploy demo"):
  163fdb7 (PR #168): run 45860319259 success, 2026-11-26T16:36Z -> Cloud Run food-order-00008-v6c
  39bda5e (PR #181): run 45890211288 success, 2026-11-26T20:19Z -> Cloud Run food-order-00009-jd9 (/api/ready ok)
```

### Appendix D1 — Re-test handoff and EN-009_P3's signed acceptance (Part D)

<!-- INCLUDE: retest-handoff.md -->

