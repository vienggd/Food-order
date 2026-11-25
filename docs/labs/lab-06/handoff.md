# Lab 6 — handoff for the testing team

## Who
- Owning team: **Est**, section 131 — vieng and ninja.
- Testing team: **EN-009_P3** (Product Team of "Event Registration and Attendance System") — Kirakit Kingkaew and Nattakit Prasertsak. We test their app in turn (their repo: songt888/event-registration-system, tag `v0.1.2-lab5`, commit `04e8590`).

## What to test
- **Version:** commit `b71cdb2` (merge of PR #84, `lab-5` into `main`, the Lab 5 version). No tag points exactly at this commit. The nearest tag, `v0.1.0-sprint1` (commit `12c1052`, PR #46), is an older ancestor: do not use it as the version name. Write `b71cdb2` in every result row.
- **Live URL:** https://food-order-d4jdyxqbca-as.a.run.app
- **Scope:** F-01 login/logout, F-02 browse menu, F-03 place order + my orders + order detail, F-04 operator queue + accept order. Nothing else is promised (no cancel, payment, menu editing).
- **Contracts** (to judge expected results): public repo `vienggd/Food-order`, folder `docs/sprint_1/sprints/sprint-1/` (F-01..F-04), SRS in `docs/sprint_1/srs.md`.
- **Cases:** [`uat-cases.md`](uat-cases.md), UAT-01..06.

## Accounts (labels only)
| Label | Email | Role |
|---|---|---|
| CUSTOMER-A | alice@cafe.test | customer |
| CUSTOMER-B | bob@cafe.test | customer |
| OPERATOR | staff@cafe.test | café staff |

All three share one password. **vieng sends it privately.** It must not appear in this file, an Issue, the sheet or a screenshot. Do not use `smoke@cafe.test`.

## Setup before you start
1. Use a current Chrome or Edge. The first load can take a few seconds (cloud cold start).
2. Open `/api/ready` on the live URL; it should answer OK. If not, tell us before testing.
3. Use a separate private window for each account so sessions do not mix.
4. The live app is shared and orders you place stay. That is fine; write down the order numbers.

## Reset
There is no reset button. Tests do not change the seed menu. If the data looks wrong before you start (Croissant not sold out, prices differ), stop and message us; we check it. Do not try to fix it yourself.

## Order of cases
UAT-01 → 02 → 03 → 04 → 05 → 06. UAT-03 and UAT-04 use orders made in earlier cases. UAT-06 is optional: mark BLOCKED if you cannot run it.

## What to record
Per case: tester name, date/time, version `b71cdb2`, inputs used, **actual** result, PASS / FAIL / BLOCKED. Take screenshots of one normal case (UAT-01) and one rejected case (UAT-02 or UAT-03), and show that protected state did not change.

## How to report a bug
1. Write a row in our shared sheet: case ID, steps, expected, actual, severity by user impact (critical / major / minor), screenshot name, your name.
2. We open the Issue on our public repo `vienggd/Food-order` from your row and send you its number. You may open it yourselves instead (label `lab6`); then put the link in the sheet.
3. Never put passwords or tokens in the sheet, an Issue or a screenshot.
4. We answer every row (defect / duplicate / not a defect / enhancement, with a reason from our contract) in `docs/labs/lab-06/triage.md`.
