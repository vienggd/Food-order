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

## Final decision (after the partner fixes and we re-test)
- Re-test version/date: TODO
- Decision: Accepted / Accepted with limitations / Not Accepted — TODO
- Open critical/major defects: TODO (must be none to accept)
- BLOCKED cases left: TODO (must be none to accept)
- Names and date: TODO
