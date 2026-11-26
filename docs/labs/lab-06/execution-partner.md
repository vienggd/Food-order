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

## Exploratory findings (DRAFT outgoing reports, not yet sent)
Provenance: exploratory findings by ninja, tested 25 Nov 2026 21:40-21:46 UTC+7 using an AI computer-use browser session, NOT by hand by the students. The served revision was NOT confirmed at that time (their handoff says `v0.1.2-lab5` / `04e8590` / `s47a6b53b-00005-5l7`). They go beyond UAT-01..06. DRAFT: no Issue has been opened on the partner repo; ninja must approve first.
The six agreed cases UAT-01..06 are still to be run by hand by vieng + ninja in the 19:00-20:00 slot; these findings do not replace them. Account password is never written here.

| ID | Account label | Summary | Proposed severity | Evidence | Scope note |
|---|---|---|---|---|---|
| F-01 | Organizer One | Very long title/location/description breaks the layout (Publish button pushed off screen) | major (proposed) | /events/6e0c7e76-9e33-4847-8026-a38ee9974084 | Contract line for 'no sideways scroll' not yet located in their SRS/SDS; check before sending. Unbroken 2000-char text is an extreme input, severity may drop to minor. |
| F-02 | Organizer One and Participant 3 (both roles) | After logout in another tab, the first tab keeps showing the account and menu | major (proposed) | none captured yet | STILL TO CHECK: whether tab A shows any protected data or only the stale header. If only the stale header, severity is minor; if protected data is shown, critical. |
| F-03 | Participant 3 | Places-left count stays stale after the registration is refused as duplicate | minor (proposed) | /events/649010dc-6a13-49b0-b29c-9e71803cad5c | Contract line to be found in their F-04 UI contract before sending. |
| F-04 | Organizer One | Description line breaks are lost on the event page | minor (proposed) | /events/649010dc-6a13-49b0-b29c-9e71803cad5c | Likely enhancement unless their contract says line breaks are kept. |
| F-05 | none (signed out) and Organizer One | Form errors are not exposed to assistive technology | minor (proposed) | DOM inspection, no screenshot | Accessibility. Their f-01 UI contract says 'show field validation' only; I grepped their SRS and did not find an accessibility requirement. Likely enhancement; confirm. |
| F-06 | Organizer One | 'Draft saved' message stays after the event is published | minor (proposed) | /events/c44b05e1-e3d2-46da-8d54-8664c940a03f | Contract line to be found in their F-02 UI contract before sending. |
| F-07 | Participant 3 | At 320 px the Restore button of the window decoration sticks out about 81 px | minor (proposed) | none captured yet | Their handoff section 5 says window buttons are decoration and out of tested scope: likely out of scope / enhancement. |
| F-08 | none (Not found page) | Minimize/Close buttons on the Not found page have no page name | minor (proposed) | none captured yet | Same as F-07: window buttons are decoration and out of tested scope per their handoff section 5. |

Full steps, expected and actual: `outgoing-issues-draft.md`.

## Final decision (after the partner fixes and we re-test)
- Re-test version/date: TODO
- Decision: Accepted / Accepted with limitations / Not Accepted — TODO
- Open critical/major defects: TODO (must be none to accept)
- BLOCKED cases left: TODO (must be none to accept)
- Names and date: TODO
