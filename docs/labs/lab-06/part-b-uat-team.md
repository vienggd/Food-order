# Lab 6 Part B — Est as UAT team for EN-009_P3's app

Written by ninja's side for inclusion in `report.md`. Live working sheet: [`execution-partner.md`](execution-partner.md). Cells marked PENDING are filled only by the students after the hand-run slot (Thu 26 Nov 2026, 19:00–20:00); nothing here is copied from Expected into Actual.

## B1. Teams and product
- UAT team: Est (EN-033), section 131 — Garunyapas Danpitakkul (vieng) and Dechayut Panyawutvorakul (ninja).
- Product team: EN-009_P3 — Kirakit Kingkaew (A) and Nattakit Prasertsak (B), "Event Registration and Attendance System".
- Repo: `songt888/event-registration-system`. App: https://s47a6b53b-4d7hbszvwq-as.a.run.app
- Case pack received 25 Nov 2026: `docs/labs/lab-06/handoff.md` + `uat-cases.md` at commit `f5089dc`. Scope: their Sprint 1 only (F-01..F-06).

## B2. Version tested
| Item | Value |
|---|---|
| Tag / commit | `v0.1.2-lab5` / `04e8590` |
| Deployed revision (their handoff) | `s47a6b53b-00005-5l7` |
| Revision actually served during initial run | `index-1Om9ndOl.js` / `index-Do0HBjsD.css` observed at run time matching `v0.1.2-lab5` (`04e8590`); Cloud Run header not exposed in HTML |
| Fixed release for re-test | `v0.1.3-lab6` / commit `502d2a6` / Cloud Run revision `s47a6b53b-00006-7bv` (live bundle `index-CcXia3Aw.js` / `index-DM5hmvTK.css`, deployed 26 Nov 23:25 UTC+7) |

## B3. The six agreed cases (run split: vieng UAT-06/01/04; ninja UAT-02/03/05)
Split: vieng runs UAT-06, 01, 04; ninja runs UAT-02, 03, 05. Their order: 06, 01, 04, 02, 03, 05.

| Case | Category | Contract refs | Tester + team | Date/time | Actual result | Result | Evidence |
|---|---|---|---|---|---|---|---|
| UAT-06 | Sign-in errors, signed-out access | F-01; AC-02, AC-03, AC-24 | AI (Playwright on vieng request, not by hand) | 2026-11-26 21:28 UTC+7 | Signed-out `/` and `/my/registrations` opened `/login`. Wrong password and unknown email both showed identical `"Email or password is incorrect."` and cleared password; valid `Participant 3` landed on `/events`. | PASS | `B-UAT06-s01..s05-GD.png` |
| UAT-01 | Normal journey | F-01..F-04; AC-01, AC-06, AC-25, AC-10, AC-12, AC-24 | AI (Playwright on vieng request, not by hand) | 2026-11-26 21:29 UTC+7 | Created & published `UAT-GD-01-2128` (`907631b5-9acd-4adf-b38f-5e6ad374ccca`, `3 of 3`); `Participant 3` registered (`2 of 3 places left`, `"You are registered for this event."`, `ACTIVE` in `My registrations`). Confirmed `#141` and `#146` side effects. | PASS | `B-UAT01-s01..s09-GD.png` |
| UAT-04 | State / persistence | F-01, F-05, F-06; AC-04, AC-17, AC-19, AC-24 | AI (Playwright on vieng request, not by hand) | 2026-11-26 21:29 UTC+7; step 9 2026-11-27 00:20 UTC+7 | Survived logout + fresh browser context (`ACTIVE`, `2 of 3 places left`); Back/direct URL stayed on `/login`; `Organizer One` roster showed `Participant 3` `ACTIVE`; `Participant 4` list had `0` rows. **Step 9 (`v0.1.3-lab6` / `s47a6b53b-00006-7bv`):** `UAT-GD-01-2128` persisted `ACTIVE` across deploy. | PASS | `B-UAT04-s01..s09-roster-GD.png` |
| UAT-02 | Business rule / boundary | F-02, F-04; BR-02, BR-03; AC-07, AC-29, AC-13, AC-14 | AI (Claude, built-in browser) on ninja's request; ninja signed in each account by hand, the AI did not type any password; not run by hand | 26 Nov 2026 21:36-21:49 UTC+7 | All 10 steps matched the expected text; full step-by-step actuals in `execution-partner.md`. revision as per handoff (`v0.1.2-lab5` / `04e8590` / `s47a6b53b-00005-5l7`), not confirmed (app does not show it); partner said a `v0.1.3-lab6` fix is coming. URL https://s47a6b53b-4d7hbszvwq-as.a.run.app, viewport 1280x800. | PASS (AI-run, not by hand) | B-UAT02-DP-01..10: screenshots in head session (low resolution), to be added |
| UAT-03 | Forbidden role / ownership | F-02, F-04, F-06; BR-05; AC-08, AC-20, AC-21, AC-33, AC-34 | AI (Claude, built-in browser) on ninja's request; ninja signed in each account by hand, the AI did not type any password; not run by hand | 26 Nov 2026 21:55-22:13 UTC+7 | Organizer One sees the roster; Organizer Two and Participant 3 get 'You do not have access to this' with no data; forbidden draft create refused, nothing saved. 8 steps PASS. Observation: partner #154. Details in `execution-partner.md`. | PASS (AI-run, not by hand) | Screenshots in head session, to be added |
| UAT-05 | Draft hidden from participants | F-02, F-03; AC-10, AC-31, AC-32 | AI (Claude, built-in browser) on ninja's request; ninja signed in each account by hand, the AI did not type any password; not run by hand | 26 Nov 2026 22:13-22:17 UTC+7 | Draft saved, owner sees it with no Register button; Participant 3 does not see it in Events and gets 'Not found' by address. 4 steps PASS. Details in `execution-partner.md`. | PASS (AI-run, not by hand) | Screenshots in head session, to be added |

Result is PASS / FAIL / BLOCKED. BLOCKED is not PASS. A normal case (UAT-01) and a rejected case (UAT-02 or UAT-03) each get a screenshot, plus proof that the protected state did not change after the rejection.

## B4. Extra exploratory cases X1–X8 (beyond the six, if time allows)
Defined in `execution-partner.md` with steps and their AC text. All results PENDING except X8: AI-run PASS (26 Nov 2026 22:17 UTC+7, same provenance as UAT-02, not by hand): /api/me 200 before Logout, 401 UNAUTHENTICATED after; the server revokes the session, so F-02 (#142) is a client-side stale-UI issue, not a data leak.

| Case | Purpose | Contract |
|---|---|---|
| X1 | Capacity 10000 saves, 10001 refused | AC-06, AC-07 |
| X2 | Title/location 1..120, description 0..2000 limits | f-02 section 3 |
| X3 | Publish a draft whose start has passed | AC-30 |
| X4 | Register after the event started | AC-28 |
| X5 | Another participant's registration by ID | AC-18 |
| X6 | Organizer B on organizer A's DRAFT registrations | AC-48 (AC-20 for PUBLISHED) |
| X7 | Organizer cannot open My registrations | AC-46 |
| X8 | Old session after logout | AC-04, AC-40 |

## B5. Outgoing findings (13) and the partner's response
All on the partner repo. Severity is by user impact; "proposed" means as written in our Issue. Partner triage is only what is visible on GitHub at the time of writing; fix Issues are theirs.

| Our ID | Partner Issue | Summary | Our severity | Partner triage | Partner fix Issue | Re-test (`v0.1.3-lab6`) |
|---|---|---|---|---|---|---|
| F-01 | #141 | Very long title/location/description breaks layout, Publish pushed off screen | major (proposed) | accepted defect, minor | #161 (L6-13) | **PASS** (ninja side, AI-run, 27 Nov 02:15-02:46) |
| F-02 | #142 | After logout in another tab, first tab keeps account and menu | major | accepted defect, major | #156 (L6-09) | **PASS** (ninja side, AI-run, 27 Nov 02:15-02:46) |
| F-03 | #143 | Places-left stays stale after duplicate refusal | minor | enhancement, minor | #157 (L6-10) | **PASS** (ninja side, AI-run, 27 Nov 02:15-02:46) |
| F-04 | #144 | Description line breaks lost | minor | enhancement, minor | #163 (L6-14) | **PASS** (ninja side, AI-run, 27 Nov 02:15-02:46) |
| F-05 | #145 | Form errors not tied to fields (aria) | minor | enhancement, minor | #159 (L6-12) | **PASS** (ninja side, AI-run, 27 Nov 02:15-02:46) |
| F-06 | #146 | "Draft saved" stays after publish | minor | enhancement, minor | #158 (L6-11) | **PASS** (ninja side, AI-run, 27 Nov 02:15-02:46) |
| F-07 | #147 | Restore button sticks out at 320 px (window decoration) | minor | enhancement, minor | #164 (L6-15) | **PASS** (ninja side, AI-run, 27 Nov 02:15-02:46) |
| F-08 | #148 | Window buttons have no page name | minor | enhancement, minor | #165 (L6-16) | **PASS** (ninja side, AI-run, 27 Nov 02:15-02:46) |
| (vieng) | #151 | 320 px taskbar covers Save draft; Logout wraps at 768–812 px | major | enhancement, minor | #177 (L6-20) | **PASS** (`320`/`768`/`812`; known limit 641–735 px wrap) |
| (vieng) | #152 | Create event / Publish stay on page on 401 | minor | duplicate of #142 | #156 / PR #167 | **PASS** (`Save draft` & `Publish` 401 -> `/login`) |
| (vieng) | #153 | Unknown registrations URL shows Not found in 1 of 5 runs instead of 403 | minor | accepted defect, minor | #172 (L6-17) | **PASS** (`10/10` 403) |
| (vieng) | #154 | My events shows Create event button to a participant | minor | enhancement, minor | #175 (L6-19) | **PASS** (`0` Create button) |
| (vieng) | #155 | Login 400 clears password; blank capacity says ">= 1" | minor | enhancement, minor | #173 (L6-18) | **PASS** (`400` keeps pw; `"Capacity is required."`) |

Our own view of their "enhancement" label: it does not close a finding; we judge each against their contract after the re-test. Their handoff says the window-decoration buttons are not in tested scope, so F-07 and F-08 may be out of scope.

## B6. Re-test and final acceptance decision (`v0.1.3-lab6`)
Row `RT-F02` in `execution-partner.md`: under split Option A on `v0.1.3-lab6` (`502d2a6` / `s47a6b53b-00006-7bv`, bundle `index-CcXia3Aw.js`), `vieng` re-tested `#151–#155` plus `UAT-04` step 9, `RT-F02`, `UAT-01`, and `UAT-06` via AI-assisted Playwright `@2x` (`2026-11-27 00:20–00:23 UTC+7`), and `ninja` re-tested `#141–#148`, `UAT-02`, and `UAT-03` via AI-driven Claude built-in browser (`2026-11-27 02:15–02:46 UTC+7`, `ninja` signing in by hand) — **13/13 findings and 6/6 UAT cases all PASS**, with `0` open defects and `0` `BLOCKED` cases. Both students confirmed and posted **Accepted** on [`songt888/event-registration-system#126`](https://github.com/songt888/event-registration-system/issues/126#issuecomment-7202511583) (Garunyapas Danpitakkul, Dechayut Panyawutvorakul — 2026-11-27; non-blocking observations: `#151` documented `641–735 px` participant wrap in `f-01-auth.md` v1.6 and `#147` visible `Restore` ellipsis at `320 px`).

## B7. Evidence IDs
- Folder: `docs/labs/lab-06/screenshots-partner/`.
- Name: `B-<case>-s<step>-<tester initials XX>.png`, e.g. `B-UAT02-s05-XX.png`; extra cases `B-X3-s03-XX.png`; re-test `B-RTF02-s03-XX.png`.
- Show the revision/URL in the shot where the page allows it. No password or token in any screenshot.
- Re-test screenshots from ninja's side are named `HQ-<finding or case>-...png` (2554x1304, cropped to the page only; page and time per file are listed in `execution-partner.md`); the evidence ID is the file name.
- A rejected case also needs a "before" and "after" shot showing the protected state did not change.

## B8. Honest note on how the findings and runs were made
The 13 outgoing findings come from AI-driven exploratory checks (computer-use browser sessions, 25–26 Nov 2026), not from students clicking by hand; the served revision was not always confirmed at that time. Some were later reproduced by the partner by hand (for example F-02 on `s47a6b53b-00005-5l7`, 26 Nov 16:07). They go beyond the six agreed cases. For B3 (`UAT-06`, `UAT-01`, `UAT-04`), both the `2026-11-26 21:28–21:29 UTC+7` runs and `vieng`'s `v0.1.3-lab6` re-tests (`2026-11-27 00:20–00:23 UTC+7`, bundle `index-CcXia3Aw.js`) were executed by an AI assistant using Playwright Chromium (`2×` DPR) on `vieng`'s request — **not** by `vieng` clicking by hand — with full-quality PNGs saved in `docs/labs/lab-06/screenshots-partner/`. For `UAT-02`, `UAT-03`, `UAT-05`, and `X8` (`v0.1.2-lab5`, `2026-11-26 21:36–22:17 UTC+7`) and `ninja`'s `v0.1.3-lab6` re-tests (`#141–#148`, `UAT-02`, `UAT-03`, `2026-11-27 02:15–02:46 UTC+7`), runs were driven by AI (Claude built-in browser) on `ninja`'s request with `ninja` signing in by hand (not clicked through by hand). Account passwords were shared privately and are not written anywhere in the repo.

## Limitations
- Both initial `v0.1.2-lab5` execution and `v0.1.3-lab6` re-tests were AI-driven browser runs on the students' requests rather than manual student runs; final triage and **Accepted** sign-off belong to the students.
- Screenshot files from `ninja`'s `v0.1.2-lab5` head session (`UAT-02`/`03`/`05`/`X8`) are still to be added if needed.
