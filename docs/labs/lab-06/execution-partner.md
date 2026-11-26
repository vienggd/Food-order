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
| UAT-06 | Sign-in errors, signed-out access | F-01; AC-02, AC-03, AC-24 | none, Participant 3 | wrong password `wrong-password-1`; unknown email `nobody@example.com` | | | `v0.1.2-lab5` / `04e8590` / `s47a6b53b-00005-5l7` | | | |
| UAT-01 | Normal journey | F-01..F-04; AC-01, AC-06, AC-25, AC-10, AC-12, AC-24 | Organizer One, Participant 3 | title `UAT-<XX>-01-<HHMM>`; location `UAT room 1`; tomorrow 10:00; capacity 3 | | | same | | | |
| UAT-04 | State / persistence | F-01, F-05, F-06; AC-04, AC-17, AC-19, AC-24 | Participant 3, Organizer One, Participant 4 | event from UAT-01 | | | same | | | |
| UAT-02 | Business rule / boundary | F-02, F-04; BR-02, BR-03; AC-07, AC-29, AC-13, AC-14 | Organizer One, Participant 3, Participant 4 | capacity `0`; start yesterday; then capacity 1, tomorrow 10:00 | | | same | | | |
| UAT-03 | Forbidden role / ownership | F-02, F-04, F-06; BR-05; AC-08, AC-20, AC-21, AC-33, AC-34 | Organizer One, Organizer Two, Participant 3 | Registrations page address of an Organizer One event | | | same | | | |
| UAT-05 | Draft hidden from participants | F-02, F-03; AC-10, AC-31, AC-32 | Organizer One, Participant 3 | title `UAT-<XX>-05-<HHMM>`; location `UAT room 5`; capacity 5; do not publish | | | same | | | |

Planned split for the 26 Nov 19:00-20:00 slot: vieng runs UAT-06, 01, 04; ninja runs UAT-02, 03, 05 (UAT-03 can use the event from UAT-02). Tester, date/time, actual result, result and evidence stay empty until they are done.

Per-step actual results (if one line is not enough) go under this table as `UAT-xx step n: ...`.

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

## Final decision (after the partner fixes and we re-test)
- Re-test version/date: TODO
- Decision: Accepted / Accepted with limitations / Not Accepted — TODO
- Open critical/major defects: TODO (must be none to accept)
- BLOCKED cases left: TODO (must be none to accept)
- Names and date: TODO
