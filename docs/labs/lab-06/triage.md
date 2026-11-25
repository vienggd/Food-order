# Lab 6 Part C — Triage of findings received on our app

Tested version: commit `b71cdb2` (Est, section 131). Testing team: EN-009_P3. Contracts: `docs/sprint_1/sprints/sprint-1/F-01..F-04`, SRS.
Empty until the partner's results arrive. Every finding gets a row, even "not a defect". If none: write "No findings received" with the date and the case IDs that passed.

## Rules for the decision
- **defect**: the app breaks a written rule (AC / BR / FR). Quote the contract line.
- **duplicate**: same cause as an earlier row (give its ID).
- **not a defect**: the app does what the contract says (quote it) or the case was run wrongly.
- **enhancement**: a wish that no contract line asks for. Never use this label for a broken rule.
- Severity by user impact: **critical** (cannot use the app, wrong or exposed data), **major** (rule or main flow broken), **minor** (wording, look).

## Table
| Finding ID | Source (case, step, who, date) | Summary | Decision | Reason (contract line) | Severity | Owner | Issue | Status |
|---|---|---|---|---|---|---|---|---|
| | | | | | | | | |

## Accepted defects
| Issue | Defect | RED test (on b71cdb2) | GREEN commit | PR | Re-test version | Partner decision |
|---|---|---|---|---|---|---|
| | | | | | | |

If there is no real defect, ask the TA for the controlled exercise on an isolated branch. Do not invent a defect.
