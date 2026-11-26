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
| Revision actually served during hand run | PENDING (record at start of the slot) |
| Fixed release for re-test | PENDING (partner plans `v0.1.3-lab6`; revision name to be recorded) |

## B3. The six agreed cases (run by hand, 26 Nov 19:00)
Split: vieng runs UAT-06, 01, 04; ninja runs UAT-02, 03, 05. Their order: 06, 01, 04, 02, 03, 05.

| Case | Category | Contract refs | Tester + team | Date/time | Actual result | Result | Evidence |
|---|---|---|---|---|---|---|---|
| UAT-06 | Sign-in errors, signed-out access | F-01; AC-02, AC-03, AC-24 | PENDING | PENDING | PENDING | PENDING | PENDING |
| UAT-01 | Normal journey | F-01..F-04; AC-01, AC-06, AC-25, AC-10, AC-12, AC-24 | PENDING | PENDING | PENDING | PENDING | PENDING |
| UAT-04 | State / persistence | F-01, F-05, F-06; AC-04, AC-17, AC-19, AC-24 | PENDING | PENDING | PENDING | PENDING | PENDING |
| UAT-02 | Business rule / boundary | F-02, F-04; BR-02, BR-03; AC-07, AC-29, AC-13, AC-14 | PENDING | PENDING | PENDING | PENDING | PENDING |
| UAT-03 | Forbidden role / ownership | F-02, F-04, F-06; BR-05; AC-08, AC-20, AC-21, AC-33, AC-34 | PENDING | PENDING | PENDING | PENDING | PENDING |
| UAT-05 | Draft hidden from participants | F-02, F-03; AC-10, AC-31, AC-32 | PENDING | PENDING | PENDING | PENDING | PENDING |

Result is PASS / FAIL / BLOCKED. BLOCKED is not PASS. A normal case (UAT-01) and a rejected case (UAT-02 or UAT-03) each get a screenshot, plus proof that the protected state did not change after the rejection.

## B4. Extra exploratory cases X1–X8 (beyond the six, if time allows)
Defined in `execution-partner.md` with steps and their AC text. All results PENDING.

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

| Our ID | Partner Issue | Summary | Our severity | Partner triage | Partner fix Issue |
|---|---|---|---|---|---|
| F-01 | #141 | Very long title/location/description breaks layout, Publish pushed off screen | major (proposed) | none seen | #161 (L6-13) |
| F-02 | #142 | After logout in another tab, first tab keeps account and menu | major | accepted defect, major | #156 (L6-09) |
| F-03 | #143 | Places-left stays stale after duplicate refusal | minor | enhancement, minor | #157 (L6-10) |
| F-04 | #144 | Description line breaks lost | minor | none seen | none seen |
| F-05 | #145 | Form errors not tied to fields (aria) | minor | enhancement, minor | #159 (L6-12) |
| F-06 | #146 | "Draft saved" stays after publish | minor | enhancement, minor | #158 (L6-11) |
| F-07 | #147 | Restore button sticks out at 320 px (window decoration) | minor | none seen | none seen |
| F-08 | #148 | Window buttons have no page name | minor | none seen | none seen |
| (vieng) | #151 | 320 px taskbar covers Save draft; Logout wraps at 768–812 px | major | none seen | none seen |
| (vieng) | #152 | Create event / Publish stay on page on 401 | minor | none seen | none seen |
| (vieng) | #153 | Unknown registrations URL shows Not found in 1 of 5 runs instead of 403 | minor | none seen | none seen |
| (vieng) | #154 | My events shows Create event button to a participant | minor | none seen | none seen |
| (vieng) | #155 | Login 400 clears password; blank capacity says ">= 1" | minor | none seen | none seen |

Our own view of their "enhancement" label: it does not close a finding; we judge each against their contract after the re-test. Their handoff says the window-decoration buttons are not in tested scope, so F-07 and F-08 may be out of scope.

## B6. Re-test of F-02 on the fixed release
Row RT-F02 in `execution-partner.md`: tab A/tab B logout check for Participant 3 and Organizer One. Version, tester, time, actual and result are PENDING until the partner confirms the new revision name. Final decision (Accepted / Accepted with limitations / Not accepted) is recorded only after that, with names and date. We do not claim acceptance while a critical or major defect is open or a case is BLOCKED.

## B7. Evidence IDs
- Folder: `docs/labs/lab-06/screenshots-partner/`.
- Name: `B-<case>-s<step>-<tester initials XX>.png`, e.g. `B-UAT02-s05-XX.png`; extra cases `B-X3-s03-XX.png`; re-test `B-RTF02-s03-XX.png`.
- Show the revision/URL in the shot where the page allows it. No password or token in any screenshot.
- A rejected case also needs a "before" and "after" shot showing the protected state did not change.

## B8. Honest note on how the findings were made
The 13 outgoing findings come from AI-driven exploratory checks (computer-use browser sessions, 25–26 Nov 2026), not from students clicking by hand; the served revision was not always confirmed at that time. Some were later reproduced by the partner by hand (for example F-02 on `s47a6b53b-00005-5l7`, 26 Nov 16:07). They go beyond the six agreed cases. The six official cases and any X cases recorded as results are run by hand by the students in the 19:00 slot, and only those hand results count as execution evidence in B3 and B4. Account passwords were shared privately and are not written anywhere in the repo.

## Limitations
- Partner triage and fix status change over time; this file shows what was seen on GitHub on 26 Nov 2026.
- Hand-run results, the served revision and the re-test decision are PENDING at the time of writing.
