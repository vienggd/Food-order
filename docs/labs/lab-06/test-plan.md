# Lab 6 — Test plan and tester instructions (team Est)

For the team that tests our app. Read this first, then [`handoff.md`](handoff.md) (version, URL, accounts) and [`uat-cases.md`](uat-cases.md) (the cases).

## 1. Goal
Check, as real users, that our Sprint 1 café pre-order app does what its contracts promise: log in, see the menu, place an order, and let staff accept it. You judge only what you can see and do. You do not need to read the code.

## 2. Scope
| In scope | Out of scope |
|---|---|
| F-01 login / logout, F-02 menu, F-03 place order + my orders + order detail, F-04 operator queue + accept | cancel, reject, payment, menu editing, pickup times, search, speed or load tests |

## 3. Who does what
| Role | Who | Task |
|---|---|---|
| Testers | the partner team (2 or more students, at least two take part) | run every case, record results, report bugs |
| Product owner | vieng (Est) | sends passwords privately, answers questions, triages bugs |
| Deputy | ninja (Est) | reviews our documents, helps with triage |

## 4. Schedule (Est-29NOV)
| When | What |
|---|---|
| Wed | we send this pack; you confirm you can run the cases without asking us questions |
| Wed–Thu | you run UAT-01..06 and report findings |
| Fri | we triage every finding and answer in writing |
| Sat | we send a fixed version if there are real defects; you re-run the failed cases and record a decision |

Exact dates and times: TBD (vieng fills in).

## 5. Before you start (entry criteria)
- You have the live URL, the three account labels and the password (sent privately).
- `/api/ready` on the live URL answers OK.
- You read the setup part of the handoff and have separate private windows for each account.

## 6. How to run a case
1. Open `uat-cases.md` and take the next case. Run the cases in order.
2. Do the numbered steps exactly. Use the given inputs; do not invent others.
3. After each step compare what you see with **Expected**. Quote texts exactly.
4. Decide the result:
   - **PASS** — every expected result matched.
   - **FAIL** — something did not match. Write what you actually saw.
   - **BLOCKED** — you could not finish (a step before failed, the site is down, you lack a tool). Say why.
5. Do not copy the expected result into the actual-result column.
6. Screenshot one normal case (UAT-01) and one rejected case (UAT-02 or UAT-03). Also show that protected state did not change (for example order `#A` is the same before and after UAT-03).

## 7. Result sheet (one row per case)
| Case | Tester | Date / time | Version | Inputs used | Actual result | PASS / FAIL / BLOCKED | Screenshot |
|---|---|---|---|---|---|---|---|
| UAT-01 | | | b71cdb2 | | | | |
| UAT-02 | | | b71cdb2 | | | | |
| UAT-03 | | | b71cdb2 | | | | |
| UAT-04 | | | b71cdb2 | | | | |
| UAT-05 | | | b71cdb2 | | | | |
| UAT-06 | | | b71cdb2 | | | | |

## 8. Reporting a bug
Write one row in our shared sheet per problem (we open the Issue on `vienggd/Food-order`, or you may open it with label `lab6`):
- case ID and step number
- steps to reproduce (short, numbered)
- expected result and actual result
- severity by user impact: **critical** (user cannot use the app or data is wrong or exposed), **major** (a rule or main flow is broken, a workaround exists), **minor** (wording, look, small slip)
- screenshot name, your name, date

Never put passwords, tokens or personal data in a bug report or screenshot. Use only the test accounts.

## 9. What we do with your findings
We answer each row with one of: **defect** (the app breaks its contract), **duplicate**, **not a defect** (the app does what its contract says), **enhancement** (a wish beyond the contract), each with a reason, severity, owner and status, in `triage.md`. Real defects are fixed test-first and you re-test.

## 10. Finish (exit criteria)
- Every case has a result with tester, time, version and actual result.
- Every finding is in the sheet.
- After the fix round, you record **Accepted**, **Accepted with limitations** or **Not accepted** with names, version and date. We do not claim acceptance while a critical or major defect is open or a case is BLOCKED.

## 11. Risks and limits
| Risk | What we do |
|---|---|
| Live app is shared, orders stay | write down order numbers; tests do not need a clean database |
| Cold start makes the first page slow | wait up to 30 seconds, then retry once |
| Site is down | mark BLOCKED, tell us, do not retry in a loop |
| Password leaked in a screenshot | tell us at once; we change it |
