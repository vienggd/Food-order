# Lab 6 Part B — Our UAT of the partner's app (execution sheet)

Empty sheet. Rows are filled only by the real testers (vieng, ninja) after the human slot. Never copy expected into actual. BLOCKED is not PASS.

## Partner product
- Partner team: EN-009_P3 (Kirakit Kingkaew, Nattakit Prasertsak), "Event Registration and Attendance System"
- App URL: https://s47a6b53b-4d7hbszvwq-as.a.run.app
- Repo: songt888/event-registration-system
- Version tested (tag/commit + deployed revision): tag `v0.1.2-lab5`, commit `04e8590`, Cloud Run revision `s47a6b53b-00005-5l7` (from their handoff)
- Account labels (no passwords): Organizer One (organizer1@example.com), Organizer Two (organizer2@example.com), Participant 3 (participant3@example.com), Participant 4 (participant4@example.com); password given privately, never written here
- Case pack received (date/link): received 25 Nov 2026: `docs/labs/lab-06/handoff.md` + `uat-cases.md` in songt888/event-registration-system at commit `f5089dc`. Their run order: UAT-06, 01, 04, 02, 03, 05

## Execution log
Source of steps and expected results: partner `uat-cases.md` (commit `f5089dc`). Run in their order: UAT-06, 01, 04, 02, 03, 05 (UAT-04 needs UAT-01 by the same tester; UAT-03 needs an event with a registration). Titles: `UAT-<initials>-<case>-<HHMM>`. Do not register for their existing demo events. Password comes privately.
Result = PASS / FAIL / BLOCKED. Evidence ID points to a file in `screenshots-partner/` (e.g. `B-UAT01-s08.png`).
Each row states who ran it (all runs were AI-driven on the students' requests, see part-b-uat-team.md B8). Do not copy their Expected text into Actual.

| Case ID | Category | Req / AC ref | Accounts | Inputs (from their pack) | Tester + team | Date/time | Version tested | Actual result | Result | Evidence ID |
|---|---|---|---|---|---|---|---|---|---|---|
| UAT-06 | Sign-in errors, signed-out access | F-01; AC-02, AC-03, AC-24 | none, Participant 3 | wrong password `wrong-password-1`; unknown email `nobody@example.com` | AI (Playwright @2x on vieng request, not by hand) | 2026-11-26 21:28:48–21:28:57 UTC+7 | `v0.1.2-lab5` / `04e8590` (`index-1Om9ndOl.js`, `index-Do0HBjsD.css`) | Signed-out `/` and `/my/registrations` both opened `/login` (`Demo running on Google Cloud Run.`). Both wrong password and unknown email displayed identical alert `Email or password is incorrect.` with empty password field and stayed on `/login`. Valid `Participant 3` login opened `/events` with taskbar `Participant 3 (Participant)`. | PASS | `B-UAT06-s01-GD.png` .. `B-UAT06-s05-GD.png` |
| UAT-01 | Normal journey | F-01..F-04; AC-01, AC-06, AC-25, AC-10, AC-12, AC-24 | Organizer One, Participant 3 | title `UAT-GD-01-2128`; location `UAT room 1`; tomorrow `2026-11-27 10:00`; capacity `3` | AI (Playwright @2x on vieng request, not by hand) | 2026-11-26 21:28:57–21:29:17 UTC+7 | same (`index-1Om9ndOl.js`) | `Organizer One` created `UAT-GD-01-2128` (`907631b5-9acd-4adf-b38f-5e6ad374ccca`) as `DRAFT` (`3 of 3`), published it (`PUBLISHED`, Publish button removed), then signed out. `Participant 3` saw `3 of 3 places left` on `/events` and event detail, registered (`You are registered for this event.`, `2 of 3 places left`), and confirmed `UAT-GD-01-2128` `ACTIVE` in `My registrations`. (UI side-notes already filed as `#141` horizontal overflow & `#146` stale `Draft saved.` banner.) | PASS | `B-UAT01-s01-GD.png` .. `B-UAT01-s09-GD.png` |
| UAT-04 | State / persistence | F-01, F-05, F-06; AC-04, AC-17, AC-19, AC-24 | Participant 3, Organizer One, Participant 4 | event `UAT-GD-01-2128` (`907631b5-9acd-4adf-b38f-5e6ad374ccca`) | AI (Playwright @2x on vieng request, not by hand) | 2026-11-26 21:29 UTC+7; step 9 re-verified 2026-11-27 00:20:19 UTC+7 | `v0.1.2-lab5` (`index-1Om9ndOl.js`); step 9 on `v0.1.3-lab6` / `502d2a6` / `s47a6b53b-00006-7bv` (`index-CcXia3Aw.js`) | `Participant 3` `My registrations` showed `UAT-GD-01-2128` `ACTIVE`; after Logout, browser Back and `/my/registrations` opened `/login` without showing data; a fresh browser context opened `/login`. Re-signing in as `Participant 3` showed `ACTIVE` and `2 of 3 places left`. `Organizer One` roster showed `Participant 3`, `participant3@example.com`, `ACTIVE`, `11/26/2026, 9:29:15 PM`. `Participant 4` `My registrations` did not list `UAT-GD-01-2128`. **Step 9 (after deploy to `s47a6b53b-00006-7bv`):** `UAT-GD-01-2128` stayed `ACTIVE` in `Participant 3` `My registrations`, `2 of 3 places left` on event detail, and `1 registrations` (`ACTIVE`) in `Organizer One`'s roster. | PASS | `B-UAT04-s01-GD.png` .. `B-UAT04-s09-roster-GD.png` |
| UAT-02 | Business rule / boundary | F-02, F-04; BR-02, BR-03; AC-07, AC-29, AC-13, AC-14 | Organizer One, Participant 3, Participant 4 | capacity `0`; start yesterday; then capacity 1, tomorrow 10:00 | AI (Claude, built-in browser) on ninja's request; ninja signed in each account by hand, the AI did not type any password; not run by hand | 26 Nov 2026 21:36-21:49 UTC+7 | revision as per handoff (`v0.1.2-lab5` / `04e8590` / `s47a6b53b-00005-5l7`), not confirmed (app does not show it); partner said a `v0.1.3-lab6` fix is coming. URL https://s47a6b53b-4d7hbszvwq-as.a.run.app, viewport 1280x800 | Event UAT-DP-02-2136 (/events/99937b66-fe9e-431b-8a7f-8ebe5daade57), UAT room 2, starts 27 Nov 2026 10:00, capacity 1. 1 capacity 0: 'Number must be greater than or equal to 1' under Capacity + 'The request is invalid.', form stayed open - PASS. 2 capacity 1, start 25 Nov 10:00: 'The start time must be in the future.', nothing saved - PASS. 3 start 27 Nov 10:00: 'Draft "UAT-DP-02-2136" saved.', 1 of 1 row DRAFT, one row with that title - PASS. 4 Publish: row PUBLISHED, Publish button gone; 'Draft ... saved.' message stayed (same as our finding partner #146); Logout to Sign in - PASS. 5 Participant 3 opened event by URL (deviation: not via Events list), Register: 'You are registered for this event.', places 'Full' - PASS. 6 Register again: 'You are already registered for this event.', still 'Full' - PASS. 7 Participant 4 from Events list: 'Full', Register button still shown - PASS. 8 Register: 'This event has no places left.' - PASS. 9 My registrations: UAT-DP-02-2136 not listed (only seeded 'Hackathon planning (draft)' ACTIVE, not ours; observation) - PASS. 10 Organizer One Registrations: 'UAT-DP-02-2136: 1 registrations', only Participant 3 (participant3@example.com) ACTIVE, 26 Nov 2026 21:44:42 - PASS. | PASS (AI-run, not by hand) | first-run screenshots (B-UAT02-DP-01..10) not saved in the repo; re-run evidence: HQ-UAT02-s7..s10-*.png |
| UAT-03 | Forbidden role / ownership | F-02, F-04, F-06; BR-05; AC-08, AC-20, AC-21, AC-33, AC-34 | Organizer One, Organizer Two, Participant 3 | Registrations page address of an Organizer One event | AI (Claude, built-in browser) on ninja's request; ninja signed in each account by hand, the AI did not type any password; not run by hand | 26 Nov 2026 21:55-22:13 UTC+7 | revision as per handoff (`v0.1.2-lab5` / `04e8590` / `s47a6b53b-00005-5l7`), not confirmed; viewport 1280x800 | Event UAT-DP-02-2136, address /organizer/events/99937b66-fe9e-431b-8a7f-8ebe5daade57/registrations. 1 Organizer One: 'UAT-DP-02-2136: 1 registrations', Participant 3, participant3@example.com, ACTIVE, 21:44:42 - PASS. 2 Organizer Two pastes address: 'You do not have access to this', no name/email/count - PASS. 3 Organizer Two My events: only 'Robotics club open day' - PASS. 4 Organizer Two opens event from Events: no Register button - PASS. 5 Participant 3 pastes address: 'You do not have access to this', no data - PASS. 6 Participant 3 /organizer/events: 'You do not have access to this.' + Try again, no event table - PASS (observation: Create event button shown above the message = partner #154). 7 Participant 3 /organizer/events/new, UAT-DP-03-2210, X, 27 Nov 10:00, capacity 5, Save draft: 'You do not have access to this.', form stayed, no 'Draft saved' - PASS. 8 Organizer One: same list as step 1; GET /api/events/mine has no UAT-DP-03 draft - PASS. | PASS (AI-run, not by hand) | first-run screenshots not saved in the repo (UAT-03 re-run: HQ-UAT03-*.png) |
| UAT-05 | Draft hidden from participants | F-02, F-03; AC-10, AC-31, AC-32 | Organizer One, Participant 3 | title `UAT-<XX>-05-<HHMM>`; location `UAT room 5`; capacity 5; do not publish | AI (Claude, built-in browser) on ninja's request; ninja signed in each account by hand, the AI did not type any password; not run by hand | 26 Nov 2026 22:13-22:17 UTC+7 | revision as per handoff (`v0.1.2-lab5` / `04e8590` / `s47a6b53b-00005-5l7`), not confirmed; viewport 1280x800 | 1 Organizer One saves UAT-DP-05-2213 (UAT room 5, 27 Nov 10:00, capacity 5), not published: 'Draft "UAT-DP-05-2213" saved.', row DRAFT 5 of 5 - PASS. 2 Owner opens /events/283525ef-3ec1-48ea-9177-2adb899d51f3: title/location/time/'5 of 5 places left', no Register button - PASS. 3 Participant 3 Events: not listed - PASS. 4 Participant 3 pastes the address: 'Not found', no title, location or Register button - PASS. | PASS (AI-run, not by hand) | first-run screenshots not saved in the repo |

Planned split: vieng's side UAT-06, 01, 04 (executed by an AI assistant using Playwright Chromium 1440x900 @2x on vieng's request at 21:28–21:29 UTC+7, NOT by vieng clicking by hand); ninja (the student) will run UAT-02, 03, 05 by hand. Zero `pageerror` events and zero HTTP `>= 500` responses occurred; `/api/health` returned `200 {"status":"ok"}`.

Per-step actual results (`vieng`, Playwright Chromium `1440×900` @ `2×` DPR, 26 Nov 2026, seed demo events and `Participant 1/2` untouched):
- `UAT-06 step 1`: Opening `/` signed out loaded `/login` with `"Demo running on Google Cloud Run."` (`B-UAT06-s01-GD.png`).
- `UAT-06 step 2`: Opening `/my/registrations` signed out redirected to `/login` (`B-UAT06-s02-GD.png`).
- `UAT-06 step 3`: Submitting `participant3@example.com` + `wrong-password-1` stayed on `/login`, cleared `#password` to `""`, and displayed `"Email or password is incorrect."` (`B-UAT06-s03-GD.png`).
- `UAT-06 step 4`: Submitting `nobody@example.com` + `wrong-password-1` stayed on `/login`, cleared `#password`, and displayed the exact same `"Email or password is incorrect."` alert (`B-UAT06-s04-GD.png`).
- `UAT-06 step 5`: Signing in as `Participant 3` landed on `/events` with taskbar `Events | My registrations | Participant 3 (Participant) | Sound on | Logout` (`B-UAT06-s05-GD.png`), then signed out cleanly.
- `UAT-01 step 1`: `Organizer One` signed in at `/` and landed on `/events` showing `My events` and `Organizer One (Organizer)` (`B-UAT01-s01-GD.png`).
- `UAT-01 step 2`: Clicked `My events` -> `Create event`; `/organizer/events/new` displayed `Title`, `Description`, `Location`, `Starts at (your local time)`, `Capacity`, and `Save draft` (`B-UAT01-s02-GD.png`).
- `UAT-01 step 3`: Filled `UAT-GD-01-2128` (`UAT normal journey`, `UAT room 1`, `2026-11-27T10:00`, `3`) and clicked `Save draft`; `/organizer/events` showed `Draft "UAT-GD-01-2128" saved.` and row `UAT-GD-01-2128 | 11/27/2026, 10:00:00 AM | UAT room 1 | 3 of 3 | DRAFT | Registrations | Publish` (`B-UAT01-s03-GD.png`, `B-UAT01-s03-actions-GD.png`; note horizontal overflow `#141`).
- `UAT-01 step 4`: Clicked `Publish`; row status updated to `PUBLISHED` and `Publish` button disappeared (`B-UAT01-s04-GD.png`, `B-UAT01-s04-left-GD.png`; stale `Draft "UAT-GD-01-2128" saved.` notice stayed per filed `#146`).
- `UAT-01 step 5`: Clicked `Logout`; returned to `/login` (`B-UAT01-s05-GD.png`).
- `UAT-01 step 6`: Signed in as `Participant 3`; `/events` listed `UAT-GD-01-2128` (`11/27/2026, 10:00:00 AM`, `UAT room 1`, `3 of 3 places left`) (`B-UAT01-s06-GD.png`).
- `UAT-01 step 7`: Opened `/events/907631b5-9acd-4adf-b38f-5e6ad374ccca`; displayed title, description, location, time, `3 of 3 places left`, and `Register` (`B-UAT01-s07-GD.png`).
- `UAT-01 step 8`: Clicked `Register`; displayed `"You are registered for this event."` and `2 of 3 places left` (`B-UAT01-s08-GD.png`).
- `UAT-01 step 9`: Clicked `My registrations`; table listed `UAT-GD-01-2128 | 11/27/2026, 10:00:00 AM | UAT room 1 | ACTIVE` (`B-UAT01-s09-GD.png`), then signed out.
- `UAT-04 step 1`: Signed in as `Participant 3`; `/my/registrations` listed `UAT-GD-01-2128` `ACTIVE` (`B-UAT04-s01-GD.png`).
- `UAT-04 step 2`: Clicked `Logout`; opened `/login` (`B-UAT04-s02-GD.png`).
- `UAT-04 step 3`: Browser Back and navigating directly to `/my/registrations` both landed on `/login` with zero registration text rendered (`B-UAT04-s03-GD.png`).
- `UAT-04 step 4`: Closed browser context completely and opened a clean browser context at `/`; loaded `/login` (`Sign in` visible) (`B-UAT04-s04-GD.png`).
- `UAT-04 step 5`: Signed in as `Participant 3` -> `My registrations`; `UAT-GD-01-2128` still appeared as `ACTIVE` (`B-UAT04-s05-GD.png`).
- `UAT-04 step 6`: Clicked `UAT-GD-01-2128`; detail page displayed `2 of 3 places left` (`B-UAT04-s06-GD.png`).
- `UAT-04 step 7`: Signed out, signed in as `Organizer One`, opened `My events` -> `Registrations` for `UAT-GD-01-2128`; header read `UAT-GD-01-2128: 1 registrations` and row showed `Participant 3 | participant3@example.com | ACTIVE | 11/26/2026, 9:29:15 PM` (`B-UAT04-s07-GD.png`).
- `UAT-04 step 8`: Signed out, signed in as `Participant 4`, opened `My registrations`; `UAT-GD-01-2128` was absent (`0` rows; only `Hackathon planning (draft)` shown) (`B-UAT04-s08-GD.png`).

Rule: a normal case and a rejected case each need a screenshot, plus proof that protected state did not change after the rejection.

## Findings (outgoing bug reports, one per defect)
| Field | Value |
|---|---|
| Issue ID (on partner repo) | |
| Product team | |
| Reporter | |
| Version | |
| Case / requirement | |
| Preconditions | |
| Steps | |
| Expected | |
| Actual | |
| Severity (by user impact: critical / major / minor) | |
| Evidence | |

(Copy the table for each finding. If none: write "No findings" with the case IDs that were all PASS.)

## Extra exploratory cases X1-X8 (beyond UAT-01..06; only X8 was run, X1-X7 NOT RUN)
Proposed by ninja's head from a gap check of the six cases against their Sprint 1 contracts at `f5089dc`. Do not copy Expected into Actual. Empty cells mean the case was not run.

| Case | Purpose | AC / contract | Accounts | Steps | Expected (their contract) | Tester + team | Date/time | Actual result | Result | Evidence ID |
|---|---|---|---|---|---|---|---|---|---|---|
| X1 | Capacity boundary | AC-06, AC-07 | Organizer One | 1. Create event with capacity 10000, future start, other fields valid. Save draft.<br>2. Create another with capacity 10001. Save draft.<br>3. Open My events. | AC-06: capacity 1 and 10000 with future start give a persisted DRAFT. AC-07: capacity above 10000 gives 400 VALIDATION_ERROR, no event stored. | | | | | |
| X2 | Text limits | f-02 section 3 (title/location 1..120 after trim, description 0..2000) | Organizer One | 1. Title of only spaces: Save draft.<br>2. Title of 121 chars: Save draft.<br>3. Description of 2001 chars: Save draft.<br>4. Title 120, location 120, description 2000 chars: Save draft (note: finding F-01 is about layout of this input). | Steps 1-3 refused, nothing saved. Step 4 accepted. | | | | | |
| X3 | Publish a draft whose start has passed | AC-30 | Organizer One | 1. Save a draft starting in about 3 minutes.<br>2. Wait until after the start time.<br>3. Click Publish on its row. | AC-30: 400 INVALID_START_TIME; DRAFT and publishedAt unchanged. The row stays DRAFT. | | | | | |
| X4 | Register after the event started | AC-28 | Organizer One, Participant 3 | 1. Organizer One saves and publishes an event starting in about 3 minutes.<br>2. Participant 3 opens it, waits until after the start, clicks Register.<br>3. Participant 3 opens My registrations; reopens the event page. | AC-28: registering for a PUBLISHED event whose startsAt is in the past returns 409 EVENT_STARTED and stores no row. The event page stays readable (f-02: a PUBLISHED event stays readable after its start). | | | | | |
| X5 | Another participant's registration by ID | AC-18 | Participant 3, Participant 4 | 1. As Participant 3 open /api/registrations/mine in the address bar; copy one registration id.<br>2. Sign out. Sign in as Participant 4. Open /api/registrations/<that id>. | AC-18: another participant's registration gives 404 NOT_FOUND, no data. | | | | | |
| X6 | Organizer B on organizer A's DRAFT event | AC-48 (vs AC-20 for PUBLISHED) | Organizer One, Organizer Two | 1. Organizer One saves a draft; note /organizer/events/<id>/registrations.<br>2. Sign out. Organizer Two opens that address. | AC-48: another organizer's DRAFT event gives 404 EVENT_NOT_FOUND, no data (AC-20 gives 403 FORBIDDEN for a PUBLISHED event). | | | | | |
| X7 | Organizer cannot see My registrations | AC-46 | Organizer One | 1. Open /my/registrations.<br>2. Open /api/registrations/mine. | AC-46: an organizer calling GET /api/registrations/mine gets 403 FORBIDDEN; the page shows the access message. | | | | | |
| X8 | Old session after logout | AC-04, AC-40 | Participant 3 | 1. Sign in; in a second tab open /api/me (shows the user).<br>2. Log out in tab 1.<br>3. Reload /api/me in tab 2. | AC-04: replaying the old cookie on /api/me returns 401. No user data. Also helps confirm finding F-02. | AI (Claude, built-in browser) on ninja's request; ninja signed in each account by hand, the AI did not type any password; not run by hand | 26 Nov 2026 22:17 UTC+7 | revision as per handoff (`v0.1.2-lab5` / `04e8590` / `s47a6b53b-00005-5l7`), not confirmed; viewport 1280x800 | Participant 3: GET /api/me 200 (Participant 3, PARTICIPANT); Logout to /login; GET /api/me again 401 UNAUTHENTICATED 'Please sign in.', no user data - PASS. Server revokes the session; supports that #142 is a client-side stale-UI problem, not a data leak. | PASS (AI-run, not by hand) | first-run screenshots not saved in the repo |

## Exploratory findings (outgoing reports, sent 26 Nov 2026 ~15:50)
Provenance: exploratory findings by ninja, tested 25 Nov 2026 21:40-21:46 UTC+7 using an AI computer-use browser session, NOT by hand by the students. The served revision was NOT confirmed at that time (their handoff says `v0.1.2-lab5` / `04e8590` / `s47a6b53b-00005-5l7`). They go beyond UAT-01..06. Sent as Issues on the partner repo on 26 Nov 2026 ~15:50 (links in the table); internal scope notes were removed from the sent text.
The six agreed cases UAT-01..06 were run on 26 Nov 2026 as AI-driven browser runs on the students' requests (not by hand) and re-tested on `v0.1.3-lab6`; these findings go beyond them. Account password is never written here.

| ID | Account label | Summary | Proposed severity | Evidence | Scope note |
|---|---|---|---|---|---|
| F-01 ([#141](https://github.com/songt888/event-registration-system/issues/141)) | Organizer One | Very long title/location/description breaks the layout (Publish button pushed off screen) | major (proposed) | /events/6e0c7e76-9e33-4847-8026-a38ee9974084 | Contract line for 'no sideways scroll' not yet located in their SRS/SDS; check before sending. Unbroken 2000-char text is an extreme input, severity may drop to minor. |
| F-02 ([#142](https://github.com/songt888/event-registration-system/issues/142)) | Organizer One and Participant 3 (both roles) | After logout in another tab, the first tab keeps showing the account and menu | major (proposed) | none captured yet | STILL TO CHECK: whether tab A shows any protected data or only the stale header. If only the stale header, severity is minor; if protected data is shown, critical. |
| F-03 ([#143](https://github.com/songt888/event-registration-system/issues/143)) | Participant 3 | Places-left count stays stale after the registration is refused as duplicate | minor (proposed) | /events/649010dc-6a13-49b0-b29c-9e71803cad5c | Contract line to be found in their F-04 UI contract before sending. |
| F-04 ([#144](https://github.com/songt888/event-registration-system/issues/144)) | Organizer One | Description line breaks are lost on the event page | minor (proposed) | /events/649010dc-6a13-49b0-b29c-9e71803cad5c | Likely enhancement unless their contract says line breaks are kept. |
| F-05 ([#145](https://github.com/songt888/event-registration-system/issues/145)) | none (signed out) and Organizer One | Form errors are not exposed to assistive technology | minor (proposed) | DOM inspection, no screenshot | Accessibility. Their f-01 UI contract says 'show field validation' only; I grepped their SRS and did not find an accessibility requirement. Likely enhancement; confirm. |
| F-06 ([#146](https://github.com/songt888/event-registration-system/issues/146)) | Organizer One | 'Draft saved' message stays after the event is published | minor (proposed) | /events/c44b05e1-e3d2-46da-8d54-8664c940a03f | Contract line to be found in their F-02 UI contract before sending. |
| F-07 ([#147](https://github.com/songt888/event-registration-system/issues/147)) | Participant 3 | At 320 px the Restore button of the window decoration sticks out about 81 px | minor (proposed) | none captured yet | Their handoff section 5 says window buttons are decoration and out of tested scope: likely out of scope / enhancement. |
| F-08 ([#148](https://github.com/songt888/event-registration-system/issues/148)) | none (Not found page) | Minimize/Close buttons on the Not found page have no page name | minor (proposed) | none captured yet | Same as F-07: window buttons are decoration and out of tested scope per their handoff section 5. |

Full text as drafted: `outgoing-issues-draft.md` (the sent text differs only by removed scope notes and a provenance footer).

## More findings, reporter Est (vieng), and partner triage (26 Nov 2026)
Five more Issues were opened on the partner repo by vieng's side. Reporter: Est (vieng). Tested version as in their handoff unless the Issue says otherwise.

| Issue | Summary | Proposed severity (from the Issue) | Partner triage | Re-test on `v0.1.3-lab6` (`502d2a6` / `s47a6b53b-00006-7bv`) |
|---|---|---|---|---|
| [#151](https://github.com/songt888/event-registration-system/issues/151) | At 320 px the 3-row taskbar covers Save draft; at 768-812 px Logout wraps to a second row | major | Enhancement, minor (fixed in #177 / AC-72; known limit: participant wrap 641–735 px in `f-01-auth.md` v1.6) | **PASS** at `320 px`, `768 px`, `812 px` (`vieng` AI-run Playwright `@2x`, `2026-11-27 00:21 UTC+7`; `0 px` overlap at `320×568`, 1-row `51 px` taskbar at `768`/`812`; `727 px` wrap observed `0 px` overlap). Evidence: `B-RT151-*-GD.png` |
| [#152](https://github.com/songt888/event-registration-system/issues/152) | Create event / Publish stay on the page on 401 instead of redirecting to /login | minor | Duplicate of #142 (fixed in #167 / AC-56) | **PASS** (`vieng` AI-run Playwright `@2x`, `2026-11-27 00:20 UTC+7`; Save draft `UAT-CHECK-401-ONLY` and Publish on `UAT-GD-RT01-0020` both got `1 × 401`, redirected cleanly to `/login`, stored nothing). Evidence: `B-RT152-s01-savedraft-GD.png`, `B-RT152-s02-publish-GD.png` |
| [#153](https://github.com/songt888/event-registration-system/issues/153) | Participant on an unknown registrations URL sees Not found in 1 of 5 runs instead of 403 | minor | Accepted defect, minor (fixed in #172 / AC-69) | **PASS** (`vieng` AI-run Playwright `@2x`, `2026-11-27 00:21 UTC+7`; `10/10` loads — 5× zero UUID + 5× DRAFT UUID — rendered `"You do not have access to this"`). Evidence: `B-RT153-403-GD.png` |
| [#154](https://github.com/songt888/event-registration-system/issues/154) | My events shows the Create event button to a participant above the 403 message | minor | Enhancement, minor (fixed in #175 / AC-71) | **PASS** (`vieng` AI-run Playwright `@2x`, `2026-11-27 00:21 UTC+7`; `0` Create event links/buttons shown). Evidence: `B-RT154-no-create-GD.png` |
| [#155](https://github.com/songt888/event-registration-system/issues/155) | Login 400 clears the password; blank capacity says >= 1 instead of required | minor | Enhancement, minor (fixed in #173 / AC-70) | **PASS** (`vieng` AI-run Playwright `@2x`, `2026-11-27 00:21 UTC+7`; Login 400 kept password verbatim; blank Capacity showed `"Capacity is required."` with ARIA link; `UAT-06` & `UAT-01` re-runs PASS). Evidence: `B-RT155-login400-GD.png`, `B-RT155-create-blank-GD.png`, `B-RTUAT06-401-GD.png`, `B-RTUAT01-*-GD.png` |

### Partner triage of Est's earlier findings (updated 27 Nov 2026)
| Our finding | Partner decision | Their fix Issue |
|---|---|---|
| F-02 [#142](https://github.com/songt888/event-registration-system/issues/142) | Accepted defect, major (they agree); owner Kirakit; reproduced by hand 26 Nov 16:07 | [#156](https://github.com/songt888/event-registration-system/issues/156) (L6-09) |
| F-03 [#143](https://github.com/songt888/event-registration-system/issues/143) | Enhancement, minor | [#157](https://github.com/songt888/event-registration-system/issues/157) (L6-10) |
| F-05 [#145](https://github.com/songt888/event-registration-system/issues/145) | Enhancement, minor | [#159](https://github.com/songt888/event-registration-system/issues/159) (L6-12) |
| F-06 [#146](https://github.com/songt888/event-registration-system/issues/146) | Enhancement, minor | [#158](https://github.com/songt888/event-registration-system/issues/158) (L6-11) |
| F-01 [#141](https://github.com/songt888/event-registration-system/issues/141) | Accepted defect, minor | [#161](https://github.com/songt888/event-registration-system/issues/161) (L6-13) |
| F-04 [#144](https://github.com/songt888/event-registration-system/issues/144), F-07 [#147](https://github.com/songt888/event-registration-system/issues/147), F-08 [#148](https://github.com/songt888/event-registration-system/issues/148) | Enhancement, minor (fixed in #163–#165 / PR #166) | #163, #164, #165 |

Our own classification of their triage (for the PDF) waits until both testers finish re-testing `#141–#148` and `#151–#155` against `v0.1.3-lab6`.

## Re-test of F-02 (#142) & #152 on the partner's new revision
Split agreement (Option A): `vieng` verified `RT-F02` two-tab flows alongside `#152` + `UAT-04` step 9 (`v0.1.3-lab6` / `502d2a6` / `s47a6b53b-00006-7bv`, bundle `index-CcXia3Aw.js`); `ninja` verifies `#141–#148` + `UAT-02`/`UAT-03` next.

| Case ID | Req / contract | Tester + team | Date/time | Version tested (tag/commit + revision name) | Steps | Actual result | Result | Evidence ID |
|---|---|---|---|---|---|---|---|---|
| RT-F02 | their F-01 UI contract, Protected navigation (revoked session redirects to /login); AC-04, AC-40, AC-56 | AI (Playwright @2x on vieng request, not by hand); ninja's side re-tested #142 on 27 Nov 02:15-02:46 UTC+7, PASS (see ninja re-test round) | 2026-11-27 00:20:45 UTC+7 | `v0.1.3-lab6` / `502d2a6` / `s47a6b53b-00006-7bv` (`index-CcXia3Aw.js`) | 1. Participant 3 signs in, open tab A and tab B.<br>2. Logout in tab B.<br>3. In tab A click My registrations; repeat clicking Logout.<br>4. Repeat with Organizer One (`/events` -> My events, Save draft, Publish). | **vieng side PASS:** Participant 3 Tab A `My registrations` and `Logout`, and Organizer One Tab A `Save draft`, `Publish`, and `My events` each hit `1 × 401` and redirected cleanly to `/login` with zero redirect loop, zero `"Logout failed"` banner, and zero saved changes (`UAT-CHECK-401-ONLY` not saved; `UAT-GD-RT01-0020` remained `DRAFT` after 401 Publish). Ninja's side confirmed `#142` separately (PASS). | PASS (`vieng` checks; `ninja` `#142` pending) | `B-RTF02-s01-p3-GD.png`, `B-RTF02-s02-p3-logout-GD.png`, `B-RTF02-s03-org-myevents-GD.png`, `B-RT152-s01-savedraft-GD.png`, `B-RT152-s02-publish-GD.png` |

### Re-test round by ninja's side (27 Nov 2026 02:15-02:46 UTC+7)
Tester: AI (Claude, built-in browser) on ninja's request; ninja signed in each account by hand, the AI did not type any password; not run by hand. Version: `v0.1.3-lab6` / `502d2a6` / `s47a6b53b-00006-7bv`. A comment was posted on each partner Issue #141-#148. Evidence IDs are the file names in `screenshots-partner/` (cropped to the page only).

| Finding | Result and actual |
|---|---|
| F-01 #141 | PASS: long text wraps; page width 1265 px in a 1280 px window (was about 22,800 px). HQ-141-long-text-wraps.png |
| F-02 #142 | PASS: tab A goes to /login after logout in tab B, no loop, 0 API calls in 4 s. HQ-142-a-tabA-signed-in.png, HQ-142-b-tabA-back-to-sign-in.png |
| F-03 #143 | PASS: tab A refused as duplicate and updates to 2 of 3 without reload. HQ-143-a-tabA-3of3-before.png, HQ-143-b-tabA-refused-and-2of3.png |
| F-04 #144 | PASS: 3 lines kept (pre-line). HQ-144-line-breaks-kept.png |
| F-05 #145 | PASS: sign-in and create-event fields have aria-invalid + aria-describedby pointing to the error text. HQ-145-create-event-field-errors.png |
| F-06 #146 | PASS: Draft-saved banner gone after Publish and after reload. HQ-146-a-draft-saved-banner.png, HQ-146-b-no-banner-after-publish.png |
| F-07 #147 | PASS: at 320 px the restore button is 0 px off screen. Observation: visible label is ellipsized, accessible name is full. No HQ file (small shot RT-147 not added) |
| F-08 #148 | PASS: window buttons now named 'Restore/Open window: Not found'. HQ-148-not-found-open-window.png |

UAT-02 re-run on event UAT-DP-02R-0218: all 10 steps PASS (HQ-UAT02-s7-P4-sees-Full.png, HQ-UAT02-s8-P4-no-places-left.png, HQ-UAT02-s9-P4-my-registrations.png, HQ-UAT02-s10-O1-registrations.png). UAT-03 re-run: all 8 steps PASS; participant create denied with UAT-DP-03R-0222 and no draft saved (HQ-UAT03-s2-O2-denied.png, HQ-UAT03-s3-O2-own-events-only.png, HQ-UAT03-s4-O2-no-register-button.png, HQ-UAT03-s8-O1-list-unchanged.png).


Evidence images are cropped to the page only (2554x1304, browser bar and Windows taskbar removed). Host for all: https://s47a6b53b-4d7hbszvwq-as.a.run.app, version as above. The time is the clock in the app's own taskbar where visible; the account is shown there too. Page per file (exact path only where it was recorded, otherwise the screen name):
- HQ-141-long-text-wraps: event detail page of the long-text event, Organizer One / participant view (path not recorded).
- HQ-142-a-tabA-signed-in: tab A signed in (Participant 3, path not recorded). HQ-142-b-tabA-back-to-sign-in: `/login` after logout in tab B.
- HQ-143-a / HQ-143-b: event detail page `UAT-DP-RT146-0240` (2 of 3 places left at 02:42 in the app taskbar), Participant 3; path `/events/<id>` not recorded.
- HQ-144-line-breaks-kept: event detail page with a 3-line description (path not recorded).
- HQ-145-create-event-field-errors: Create event form `/organizer/events/new`, field errors with aria links.
- HQ-146-a / HQ-146-b: My events `/organizer/events`, banner before and after Publish.
- HQ-148-not-found-open-window: Not found page, window buttons named 'Restore/Open window: Not found'.
- HQ-UAT02-s7, s8, s9: Participant 4 on event UAT-DP-02R-0218 (`/events/<id>`), then My registrations `/my/registrations`. HQ-UAT02-s10: Organizer One registrations page of that event.
- HQ-UAT03-s2, s3, s4: Organizer Two on the Organizer One registrations address `/organizer/events/<id>/registrations`, My events `/organizer/events`, event detail. HQ-UAT03-s8: Organizer One registrations list.

## Final decision (after the partner fixes and we re-test)
- Re-test version/date: `v0.1.3-lab6` / commit `502d2a6` / Cloud Run revision `s47a6b53b-00006-7bv` (bundle `index-CcXia3Aw.js`); `vieng` re-test `2026-11-27 00:20–00:23 UTC+7` (`#151–#155`, `UAT-04` s9, `RT-F02`, `UAT-01`, `UAT-06`), `ninja` re-test `2026-11-27 02:15–02:46 UTC+7` (`#141–#148`, `UAT-02`, `UAT-03`) — all **PASS** (AI-run on the students' requests; see sections above).
- Decision: **Accepted** (agreed jointly by both students and posted on [`songt888/event-registration-system#126`](https://github.com/songt888/event-registration-system/issues/126#issuecomment-7202511583))
- Non-blocking observations (no open defects): `#151` documented `641–735 px` participant taskbar wrap (`f-01-auth.md` v1.6, `"at 768 px and wider"`; all reported widths `320 / 768 / 812 px` pass with `0 px` overlap); `#147` visible `Restore` button label ellipsizes at `320 px` while fitting inside the viewport with its full accessible name.
- Open critical/major defects: `0` · Open minor defects: `0`
- BLOCKED cases left: `0`
- Names and date: Garunyapas Danpitakkul (`vieng`), Dechayut Panyawutvorakul (`ninja`) — **2026-11-27**
