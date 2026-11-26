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
Empty cells are for the humans: tester, date/time, actual result, result, evidence. Do not copy their Expected text into Actual.

| Case ID | Category | Req / AC ref | Accounts | Inputs (from their pack) | Tester + team | Date/time | Version tested | Actual result | Result | Evidence ID |
|---|---|---|---|---|---|---|---|---|---|---|
| UAT-06 | Sign-in errors, signed-out access | F-01; AC-02, AC-03, AC-24 | none, Participant 3 | wrong password `wrong-password-1`; unknown email `nobody@example.com` | AI (Playwright @2x on vieng request, not by hand) | 2026-11-26 21:28:48–21:28:57 UTC+7 | `v0.1.2-lab5` / `04e8590` (`index-1Om9ndOl.js`, `index-Do0HBjsD.css`) | Signed-out `/` and `/my/registrations` both opened `/login` (`Demo running on Google Cloud Run.`). Both wrong password and unknown email displayed identical alert `Email or password is incorrect.` with empty password field and stayed on `/login`. Valid `Participant 3` login opened `/events` with taskbar `Participant 3 (Participant)`. | PASS | `B-UAT06-s01-GD.png` .. `B-UAT06-s05-GD.png` |
| UAT-01 | Normal journey | F-01..F-04; AC-01, AC-06, AC-25, AC-10, AC-12, AC-24 | Organizer One, Participant 3 | title `UAT-GD-01-2128`; location `UAT room 1`; tomorrow `2026-11-27 10:00`; capacity `3` | AI (Playwright @2x on vieng request, not by hand) | 2026-11-26 21:28:57–21:29:17 UTC+7 | same (`index-1Om9ndOl.js`) | `Organizer One` created `UAT-GD-01-2128` (`907631b5-9acd-4adf-b38f-5e6ad374ccca`) as `DRAFT` (`3 of 3`), published it (`PUBLISHED`, Publish button removed), then signed out. `Participant 3` saw `3 of 3 places left` on `/events` and event detail, registered (`You are registered for this event.`, `2 of 3 places left`), and confirmed `UAT-GD-01-2128` `ACTIVE` in `My registrations`. (UI side-notes already filed as `#141` horizontal overflow & `#146` stale `Draft saved.` banner.) | PASS | `B-UAT01-s01-GD.png` .. `B-UAT01-s09-GD.png` |
| UAT-04 | State / persistence | F-01, F-05, F-06; AC-04, AC-17, AC-19, AC-24 | Participant 3, Organizer One, Participant 4 | event `UAT-GD-01-2128` (`907631b5-9acd-4adf-b38f-5e6ad374ccca`) | AI (Playwright @2x on vieng request, not by hand) | 2026-11-26 21:29:17–21:29:35 UTC+7 | same (`index-1Om9ndOl.js`) | `Participant 3` `My registrations` showed `UAT-GD-01-2128` `ACTIVE`; after Logout, browser Back and `/my/registrations` opened `/login` without showing data; a fresh browser context opened `/login`. Re-signing in as `Participant 3` showed `ACTIVE` and `2 of 3 places left`. `Organizer One` roster showed `Participant 3`, `participant3@example.com`, `ACTIVE`, `11/26/2026, 9:29:15 PM`. `Participant 4` `My registrations` did not list `UAT-GD-01-2128`. Step 9 re-test awaits partner deploy. | PASS (s1–s8; s9 retest pending) | `B-UAT04-s01-GD.png` .. `B-UAT04-s08-GD.png` |
| UAT-02 | Business rule / boundary | F-02, F-04; BR-02, BR-03; AC-07, AC-29, AC-13, AC-14 | Organizer One, Participant 3, Participant 4 | capacity `0`; start yesterday; then capacity 1, tomorrow 10:00 | AI (Claude, built-in browser) on ninja's request; ninja signed in each account by hand, the AI did not type any password; not run by hand | 26 Nov 2026 21:36-21:49 UTC+7 | revision as per handoff (`v0.1.2-lab5` / `04e8590` / `s47a6b53b-00005-5l7`), not confirmed (app does not show it); partner said a `v0.1.3-lab6` fix is coming. URL https://s47a6b53b-4d7hbszvwq-as.a.run.app, viewport 1280x800 | Event UAT-DP-02-2136 (/events/99937b66-fe9e-431b-8a7f-8ebe5daade57), UAT room 2, starts 27 Nov 2026 10:00, capacity 1. 1 capacity 0: 'Number must be greater than or equal to 1' under Capacity + 'The request is invalid.', form stayed open - PASS. 2 capacity 1, start 25 Nov 10:00: 'The start time must be in the future.', nothing saved - PASS. 3 start 27 Nov 10:00: 'Draft "UAT-DP-02-2136" saved.', 1 of 1 row DRAFT, one row with that title - PASS. 4 Publish: row PUBLISHED, Publish button gone; 'Draft ... saved.' message stayed (same as our finding partner #146); Logout to Sign in - PASS. 5 Participant 3 opened event by URL (deviation: not via Events list), Register: 'You are registered for this event.', places 'Full' - PASS. 6 Register again: 'You are already registered for this event.', still 'Full' - PASS. 7 Participant 4 from Events list: 'Full', Register button still shown - PASS. 8 Register: 'This event has no places left.' - PASS. 9 My registrations: UAT-DP-02-2136 not listed (only seeded 'Hackathon planning (draft)' ACTIVE, not ours; observation) - PASS. 10 Organizer One Registrations: 'UAT-DP-02-2136: 1 registrations', only Participant 3 (participant3@example.com) ACTIVE, 26 Nov 2026 21:44:42 - PASS. | PASS (AI-run, not by hand) | B-UAT02-DP-01..10: screenshots in head session (low resolution), to be added |
| UAT-03 | Forbidden role / ownership | F-02, F-04, F-06; BR-05; AC-08, AC-20, AC-21, AC-33, AC-34 | Organizer One, Organizer Two, Participant 3 | Registrations page address of an Organizer One event | | | same | | | |
| UAT-05 | Draft hidden from participants | F-02, F-03; AC-10, AC-31, AC-32 | Organizer One, Participant 3 | title `UAT-<XX>-05-<HHMM>`; location `UAT room 5`; capacity 5; do not publish | | | same | | | |

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

## Extra exploratory cases X1-X8 (beyond UAT-01..06, run by hand tonight if time allows)
Proposed by ninja's head from a gap check of the six cases against their Sprint 1 contracts at `f5089dc`. Run by whoever finishes first. Do not copy Expected into Actual. Empty cells are for the humans.

| Case | Purpose | AC / contract | Accounts | Steps | Expected (their contract) | Tester + team | Date/time | Actual result | Result | Evidence ID |
|---|---|---|---|---|---|---|---|---|---|---|
| X1 | Capacity boundary | AC-06, AC-07 | Organizer One | 1. Create event with capacity 10000, future start, other fields valid. Save draft.<br>2. Create another with capacity 10001. Save draft.<br>3. Open My events. | AC-06: capacity 1 and 10000 with future start give a persisted DRAFT. AC-07: capacity above 10000 gives 400 VALIDATION_ERROR, no event stored. | | | | | |
| X2 | Text limits | f-02 section 3 (title/location 1..120 after trim, description 0..2000) | Organizer One | 1. Title of only spaces: Save draft.<br>2. Title of 121 chars: Save draft.<br>3. Description of 2001 chars: Save draft.<br>4. Title 120, location 120, description 2000 chars: Save draft (note: finding F-01 is about layout of this input). | Steps 1-3 refused, nothing saved. Step 4 accepted. | | | | | |
| X3 | Publish a draft whose start has passed | AC-30 | Organizer One | 1. Save a draft starting in about 3 minutes.<br>2. Wait until after the start time.<br>3. Click Publish on its row. | AC-30: 400 INVALID_START_TIME; DRAFT and publishedAt unchanged. The row stays DRAFT. | | | | | |
| X4 | Register after the event started | AC-28 | Organizer One, Participant 3 | 1. Organizer One saves and publishes an event starting in about 3 minutes.<br>2. Participant 3 opens it, waits until after the start, clicks Register.<br>3. Participant 3 opens My registrations; reopens the event page. | AC-28: registering for a PUBLISHED event whose startsAt is in the past returns 409 EVENT_STARTED and stores no row. The event page stays readable (f-02: a PUBLISHED event stays readable after its start). | | | | | |
| X5 | Another participant's registration by ID | AC-18 | Participant 3, Participant 4 | 1. As Participant 3 open /api/registrations/mine in the address bar; copy one registration id.<br>2. Sign out. Sign in as Participant 4. Open /api/registrations/<that id>. | AC-18: another participant's registration gives 404 NOT_FOUND, no data. | | | | | |
| X6 | Organizer B on organizer A's DRAFT event | AC-48 (vs AC-20 for PUBLISHED) | Organizer One, Organizer Two | 1. Organizer One saves a draft; note /organizer/events/<id>/registrations.<br>2. Sign out. Organizer Two opens that address. | AC-48: another organizer's DRAFT event gives 404 EVENT_NOT_FOUND, no data (AC-20 gives 403 FORBIDDEN for a PUBLISHED event). | | | | | |
| X7 | Organizer cannot see My registrations | AC-46 | Organizer One | 1. Open /my/registrations.<br>2. Open /api/registrations/mine. | AC-46: an organizer calling GET /api/registrations/mine gets 403 FORBIDDEN; the page shows the access message. | | | | | |
| X8 | Old session after logout | AC-04, AC-40 | Participant 3 | 1. Sign in; in a second tab open /api/me (shows the user).<br>2. Log out in tab 1.<br>3. Reload /api/me in tab 2. | AC-04: replaying the old cookie on /api/me returns 401. No user data. Also helps confirm finding F-02. | | | | | |

## Exploratory findings (outgoing reports, sent 26 Nov 2026 ~15:50)
Provenance: exploratory findings by ninja, tested 25 Nov 2026 21:40-21:46 UTC+7 using an AI computer-use browser session, NOT by hand by the students. The served revision was NOT confirmed at that time (their handoff says `v0.1.2-lab5` / `04e8590` / `s47a6b53b-00005-5l7`). They go beyond UAT-01..06. Sent as Issues on the partner repo on 26 Nov 2026 ~15:50 (links in the table); internal scope notes were removed from the sent text.
The six agreed cases UAT-01..06 are still to be run by hand by vieng + ninja in the 19:00-20:00 slot; these findings do not replace them. Account password is never written here.

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

| Issue | Summary | Proposed severity (from the Issue) | Partner triage |
|---|---|---|---|
| [#151](https://github.com/songt888/event-registration-system/issues/151) | At 320 px the 3-row taskbar covers Save draft; at 768-812 px Logout wraps to a second row | major | not recorded yet |
| [#152](https://github.com/songt888/event-registration-system/issues/152) | Create event / Publish stay on the page on 401 instead of redirecting to /login | minor | not recorded yet |
| [#153](https://github.com/songt888/event-registration-system/issues/153) | Participant on an unknown registrations URL sees Not found in 1 of 5 runs instead of 403 | minor | not recorded yet |
| [#154](https://github.com/songt888/event-registration-system/issues/154) | My events shows the Create event button to a participant above the 403 message | minor | not recorded yet |
| [#155](https://github.com/songt888/event-registration-system/issues/155) | Login 400 clears the password; blank capacity says >= 1 instead of required | minor | not recorded yet |

### Partner triage of Est's earlier findings (as seen on GitHub, to be confirmed)
| Our finding | Partner decision | Their fix Issue |
|---|---|---|
| F-02 [#142](https://github.com/songt888/event-registration-system/issues/142) | Accepted defect, major (they agree); owner Kirakit; reproduced by hand 26 Nov 16:07 | [#156](https://github.com/songt888/event-registration-system/issues/156) (L6-09) |
| F-03 [#143](https://github.com/songt888/event-registration-system/issues/143) | Enhancement, minor | [#157](https://github.com/songt888/event-registration-system/issues/157) (L6-10) |
| F-05 [#145](https://github.com/songt888/event-registration-system/issues/145) | Enhancement, minor | [#159](https://github.com/songt888/event-registration-system/issues/159) (L6-12) |
| F-06 [#146](https://github.com/songt888/event-registration-system/issues/146) | Enhancement, minor | [#158](https://github.com/songt888/event-registration-system/issues/158) (L6-11) |
| F-01 [#141](https://github.com/songt888/event-registration-system/issues/141) | no triage comment yet | [#161](https://github.com/songt888/event-registration-system/issues/161) (L6-13) |
| F-04 [#144](https://github.com/songt888/event-registration-system/issues/144), F-07 [#147](https://github.com/songt888/event-registration-system/issues/147), F-08 [#148](https://github.com/songt888/event-registration-system/issues/148) | no triage comment yet | none seen |

Our own classification of their triage (for the PDF) waits until the humans have re-tested. An enhancement label does not by itself close a finding: we judge it against their contract.

## Re-test of F-02 (#142) on the partner's new revision
To be done by hand tonight on the partner's fixed release (they plan `v0.1.3-lab6`). Do not start before their new revision name is confirmed; record it.

| Case ID | Req / contract | Tester + team | Date/time | Version tested (tag/commit + revision name) | Steps | Actual result | Result | Evidence ID |
|---|---|---|---|---|---|---|---|---|
| RT-F02 | their F-01 UI contract, Protected navigation (revoked session redirects to /login); AC-04, AC-40 | | | TODO: record revision name | 1. Participant 3 signs in, open tab A and tab B.<br>2. Logout in tab B.<br>3. In tab A click My registrations; then reload; then click Logout.<br>4. Repeat with Organizer One / My events. | | | |

## Final decision (after the partner fixes and we re-test)
- Re-test version/date: TODO
- Decision: Accepted / Accepted with limitations / Not Accepted — TODO
- Open critical/major defects: TODO (must be none to accept)
- BLOCKED cases left: TODO (must be none to accept)
- Names and date: TODO
