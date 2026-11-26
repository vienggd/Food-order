# Final Delivery Part B — Engineering process and team evidence (draft by ninja's side)

Source facts come from `gh` (IDs and dates as shown on GitHub, UTC). Rows marked PENDING are not finished yet and are filled only when they happen. Repo: https://github.com/vienggd/Food-order. Handout: Final Delivery section 3.2 and 4.2 (release/history table, two Issue/PR chains from different sprints, contributions, AI-use declaration).

## B1. Release / history table
| Step | Branch / tag | PR | Merged (UTC) | Commit on target | Notes |
|---|---|---|---|---|---|
| Sprint 1 release | `sprint-1` -> `main`, tag `v0.1.0-sprint1` | [#46](https://github.com/vienggd/Food-order/pull/46) (reviewed by ninja) | 2026-11-21 14:20 | `12c1052` | F-01..F-04 |
| Lab 5 releases | `lab-5` -> `main` | [#78](https://github.com/vienggd/Food-order/pull/78), [#80](https://github.com/vienggd/Food-order/pull/80), [#82](https://github.com/vienggd/Food-order/pull/82), [#84](https://github.com/vienggd/Food-order/pull/84) | 2026-11-22 (09:37, 13:37, 13:51, 16:55) | `e3a4a84`, `6cace22`, `ca0ce13`, `b71cdb2` | Docker, CI, deploy workflow, cloud URL, report |
| Lab 6 releases | `lab6` -> `main` | [#168](https://github.com/vienggd/Food-order/pull/168), [#181](https://github.com/vienggd/Food-order/pull/181) | 2026-11-26 16:36, 20:19 | `163fdb7`, `39bda5e` | 9 Sprint 1 defect fixes, then the #132 queue header fix |
| Sprint 2 staging | `sprint2` | many (e.g. [#102](https://github.com/vienggd/Food-order/pull/102), [#120](https://github.com/vienggd/Food-order/pull/120), [#144](https://github.com/vienggd/Food-order/pull/144)) | 2026-11-25 onward | `d10fac1` (tip when written) | F-05..F-08, F-10 contracts and code in progress; F-09, F-11, F-12 contracts merged |
| Sprint 2 release | `sprint2` -> `main` | PENDING | PENDING | PENDING | tag PENDING |
| Sprint 3 release / final tag | PENDING | PENDING | PENDING | PENDING | final submitted tag PENDING |

Merge rule used throughout: normal merge commits, never squash; author never approves own PR; protected `main` needs PR + 1 approval.

## B2. Issue/PR chain 1 — Sprint 1, F-03 Place order
| Link | ID / commit | Date (UTC) | Who |
|---|---|---|---|
| Issue | [#4](https://github.com/vienggd/Food-order/issues/4) F-03 Place order, my orders, order detail | created 2026-11-05 19:18 | ninja |
| Branch | `feature/F-03-orders` | | ninja |
| Contract before code | `3178514` (`docs/sprints/sprint-1/F-03-orders.md`); notes `b1c5f6a`, `2e843ae` (shared order JSON with F-04), all before code | 2026-11-05 | ninja |
| RED / GREEN (cart reducer) | `429919a` [red] TEST-F03-17..18 -> `6325a4e` [green] | 2026-11-05 | ninja |
| RED / GREEN (order API) | `e922626` [red] TEST-F03-01..16, 21 (29 failed) -> `13a2651` [green] (29 passed) | 2026-11-05 | ninja |
| Pull request | [#26](https://github.com/vienggd/Food-order/pull/26) into `sprint-1` ("Closes #4") | created 2026-11-05 20:59 | ninja |
| Review | vieng APPROVED 21:02: ran `npm test` (server 63, client 5), `npm run build`, and merged E2E branch locally (16 Playwright passed) | 2026-11-05 | vieng |
| Staging merge | #26 merged into `sprint-1`, merge commit `2244619`; Issue #4 closed 21:02 | 2026-11-05 21:02 | |
| Follow-up review with a real blocker | [#39](https://github.com/vienggd/Food-order/pull/39) (ninja): vieng CHANGES_REQUESTED 21:36 (`npm run build` failed, TS2345 in `server/src/orders/routes.ts`), fixed, APPROVED 23:42 | 2026-11-05 | vieng |
| Release PR | [#46](https://github.com/vienggd/Food-order/pull/46) `sprint-1` -> `main`, tag `v0.1.0-sprint1` | merged 2026-11-21 14:20 | vieng author, ninja approved |

## B3. Issue/PR chain 2 — Sprint 2, F-06 Cancel and reject
| Link | ID / commit | Date (UTC) | Who |
|---|---|---|---|
| Issue (contract) | [#97](https://github.com/vienggd/Food-order/issues/97) N-03 contracts F-06 and F-07 | 2026-11-25 | ninja |
| Contract PR | [#102](https://github.com/vienggd/Food-order/pull/102) into `sprint2`; `b90cd6a` docs only; vieng APPROVED 11:59 (BR-11/BR-12, races, error order checked) | merged 2026-11-25 11:59, `b191e39` | ninja / vieng |
| Issue (server) | [#119](https://github.com/vienggd/Food-order/issues/119) N-05 F-06 code (TDD) | 2026-11-25 | ninja |
| RED / GREEN (server) | `bd130ab` [red] TEST-F06-01..16 -> `95ea86f` [green]; server 112 tests | 2026-11-25 | ninja |
| PR (server) | [#120](https://github.com/vienggd/Food-order/pull/120) into `sprint2`; vieng APPROVED 17:39 (routes, transitions, order JSON, ownership 404) | merged 2026-11-25 17:39, `34c6e13` | ninja / vieng |
| Issue (UI) | [#143](https://github.com/vienggd/Food-order/issues/143) N-06 F-06 UI and E2E | 2026-11-26 | ninja |
| RED / GREEN (UI) | `bc38f92`, `344e8e8`, `9fbe191` [red] E2E TEST-F06-17..21 -> `41c8f94` [green] | 2026-11-26 | ninja |
| PR (UI, with F-07) | [#144](https://github.com/vienggd/Food-order/pull/144) into `sprint2`; vieng CHANGES_REQUESTED 08:34 (blocker: Sprint 1 screenshots overwritten), fixed in `edbb9a9`, APPROVED 09:03 | merged 2026-11-26 09:04, `9ac0288` | ninja / vieng |
| Release PR | `sprint2` -> `main` | PENDING | |

## B4. Contributions
| Area | ninja (Dechayut Panyawutvorakul, NinjoMUDA) | vieng (Garunyapas Danpitakkul, vienggd) |
|---|---|---|
| Sprint 1 | F-02 browse menu, F-03 orders, Docs B/D, SDS data/API | F-01 auth, F-04 accept, SRS, E2E for F-01/02/04, release PR |
| Sprint 2 | F-06 cancel/reject, F-07 fulfilment, contracts for F-09/F-11, F-09/F-11 code | F-05 menu management, F-08 payment, F-10/F-12 contracts, living docs |
| Lab 5 / Lab 6 | reviewed release PRs; Lab 6 Part B (UAT of partner app, 13 findings, re-test round) | Lab 5 cloud/CI, Lab 6 test plan, triage and fixes |
| Review | reviews vieng's PRs with a "What I checked" comment | same for ninja's PRs |
Sprint 3 and final-delivery rows: PENDING. Counts of PRs reviewed per student can be added from `gh pr list` once the last sprint is merged.

## B5. AI-use declaration (short)
Both students use Claude Code worker sessions (one per student) to draft contracts, tests, code and documents and to write review comments; vieng's side also used Antigravity with Playwright. Every PR is reviewed and merged by the other student's side. UAT runs recorded in Lab 6 that were AI-driven are labeled as such in their records. No passwords, tokens or secrets are stored in the repo, Issues or PDF.

## Open items before final
- Sprint 2 and Sprint 3 release PRs, final tag and dates.
- Confirm chain 2 is the best Sprint 2 sample once F-06 is on `main`.
- Contribution table: fill Sprint 3 rows.
