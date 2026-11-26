# Final Delivery Part C — Final requirements and verification traceability (draft)

Campus Café Pre-order. Issue #193. Draft by ninja; reviewer vieng. Handout: `project_final_delivery_v1.pdf` section 3.3 (20 points).

**Status of this draft.** Every "Final result" cell is **PENDING** until the final release `v1.0.0` is tagged on `main`, deployed, and the full suite has run on that exact commit. The handout is explicit that an old passing run does not prove the final release. The "Checkpoint result" column keeps what Deliverable 2 measured on `sprint2` `d10fac1` (27 Nov 2026: build ok, server 177, client 8, Playwright 67 pass / 7 skipped / 0 failed) so history is visible, but it is never copied into the Final column.

Allowed final values (handout): `PASS`, `FAIL`, `SKIPPED`, `INCOMPLETE`, each with the commit. A planned check is never written as PASS.

## C0. What Part C of the PDF contains and where each piece lives

| Required in the PDF | Source in the repository | State |
|---|---|---|
| Final SRS | `docs/srs.md` (v3, 27 Nov 2026) | Update to v4 at release (status words, any scope change) |
| Feature inventory | `docs/features.md` (v3) | Update at release |
| System-Level SDS | `docs/system-sds.md` (v3) | Update at release (deployment section, F-10 and F-12 endpoints and `login_failures` table once built) |
| All feature contracts with AC and STS | `docs/sprint_1/sprints/sprint-1/F-01..F-04`, `docs/sprint_2/sprints/F-05..F-12` | Appendices; contract revisions stay in each file's version history |
| Requirement-to-verification matrix, whole baseline | `docs/traceability.md` (v3, generated from the test run) | Regenerate on the release commit; Sprint 1 and 2 rows are re-run, not copied |
| Remaining-features matrix and NFR checks | this file, sections C1 to C3 | Filled in on the release commit |

Detailed documents go into appendices of the same PDF with internal page references (handout section 4).

## C1. Requirements that were still open at the Deliverable 2 checkpoint

Same columns as the handout: requirement and feature, AC or target, actual verification, final result and version.

| Requirement and feature | AC or target | Actual verification (planned file) | Checkpoint result (`d10fac1`) | Final result and version |
|---|---|---|---|---|
| FR-16 pickup slots, F-09 | AC-F09-01..17 | `server/tests/pickup-slots.test.ts` (TEST-F09-01..14); `e2e/pickup-slots.spec.ts` (TEST-F09-15..17, planned) | PASS for 01..14; 15..17 NOT WRITTEN | PENDING |
| BR-22 slots 15 min apart, 08:00–16:45, today | AC-F09-01, -05, -07, -12 | TEST-F09-01, -05, -07, -12 | PASS | PENDING |
| BR-23 cut-off 15 min before start | AC-F09-02, -03, -04, -06 | TEST-F09-02, -03, -04, -06 | PASS | PENDING |
| BR-24 capacity 10, cancel frees, ASAP excluded | AC-F09-08..11 | TEST-F09-08..11 (incl. 20 parallel orders) | PASS | PENDING |
| FR-17 sales summary, F-10 | AC-10.1..10.9 | `server/tests/sales.test.ts` (TEST-10.1..10.8, planned); `e2e/sales.spec.ts` (TEST-10.9, planned) | NOT IMPLEMENTED | PENDING |
| BR-17 only PICKED_UP and PAID count | AC-10.1, AC-10.2 | TEST-10.1, -10.2 | NOT IMPLEMENTED | PENDING |
| BR-18 Asia/Bangkok sales days | AC-10.3 | TEST-10.3 | NOT IMPLEMENTED | PENDING |
| BR-19 top 3 items, ties by name | AC-10.4 | TEST-10.4 | NOT IMPLEMENTED | PENDING |
| FR-18 order search / filter, F-11 | AC-F11-01..17 | `order-filter.test.ts`, `order-search.test.ts`, `e2e/order-filter.spec.ts`, `e2e/order-search.spec.ts` | PASS (17/17) | PENDING |
| BR-25, BR-26, BR-27 search rules | AC-F11-04, -06..-10, -12..-14 | TEST-F11-04, -06..-10, -12..-14, -17 | PASS | PENDING |
| NFR-08 login rate limit, F-12 | AC-12.1..12.8: 5 failed logins per email in 15 min → 429 for 15 min | `server/tests/login-rate-limit.test.ts` (TEST-12.1..12.7, planned); `e2e/login-rate-limit.spec.ts` (TEST-12.8, planned) | NOT IMPLEMENTED | PENDING |
| BR-20 success clears the count; BR-21 counted per email | AC-12.5; AC-12.3, AC-12.7 | TEST-12.5; TEST-12.3, -12.7 | NOT IMPLEMENTED | PENDING |
| NFR-09 accessibility, F-12 | no critical or serious axe issues; keyboard only | C3 below (planned `e2e/a11y.spec.ts`) | NOT IMPLEMENTED | PENDING |

Sprint 1 and Sprint 2 requirements (FR-01..FR-15, BR-01..BR-16, NFR-01..NFR-07) are all PASS at the checkpoint in `docs/traceability.md`. They are **not** listed here again; the same file is regenerated on the release commit and its PASS/FAIL replaces the checkpoint results. If the release run differs, the differences are listed in the change log at the end of that file.

## C2. Acceptance criteria of the remaining features (F-09 to F-12)

Rows come from the contracts' test specifications. "Actual file" is the file that holds the test; "(planned, not written)" marks a file that does not exist yet.

| Feature | AC | Planned test | Level | Actual file | Checkpoint result (Deliverable 2, `d10fac1`, 27 Nov) | Final result and version |
|---|---|---|---|---|---|---|
| F-09 | AC-F09-01 | TEST-F09-01 | API | `pickup-slots.test.ts` | PASS on `d10fac1` | PENDING |
| F-09 | AC-F09-02 | TEST-F09-02 | API | `pickup-slots.test.ts` | PASS on `d10fac1` | PENDING |
| F-09 | AC-F09-03 | TEST-F09-03 | API | `pickup-slots.test.ts` | PASS on `d10fac1` | PENDING |
| F-09 | AC-F09-04 | TEST-F09-04 | API | `pickup-slots.test.ts` | PASS on `d10fac1` | PENDING |
| F-09 | AC-F09-05 | TEST-F09-05 | API | `pickup-slots.test.ts` | PASS on `d10fac1` | PENDING |
| F-09 | AC-F09-06 | TEST-F09-06 | API | `pickup-slots.test.ts` | PASS on `d10fac1` | PENDING |
| F-09 | AC-F09-07 | TEST-F09-07 | API | `pickup-slots.test.ts` | PASS on `d10fac1` | PENDING |
| F-09 | AC-F09-08 | TEST-F09-08 | API | `pickup-slots.test.ts` | PASS on `d10fac1` | PENDING |
| F-09 | AC-F09-09 | TEST-F09-09 | API | `pickup-slots.test.ts` | PASS on `d10fac1` | PENDING |
| F-09 | AC-F09-10 | TEST-F09-10 | API | `pickup-slots.test.ts` | PASS on `d10fac1` | PENDING |
| F-09 | AC-F09-11 | TEST-F09-11 | API | `pickup-slots.test.ts` | PASS on `d10fac1` | PENDING |
| F-09 | AC-F09-12 | TEST-F09-12 | API | `pickup-slots.test.ts` | PASS on `d10fac1` | PENDING |
| F-09 | AC-F09-13 | TEST-F09-13 | API | `pickup-slots.test.ts` | PASS on `d10fac1` | PENDING |
| F-09 | AC-F09-14 | TEST-F09-14 | API | `pickup-slots.test.ts` | PASS on `d10fac1` | PENDING |
| F-09 | AC-F09-15 | TEST-F09-15 | E2E | `e2e/pickup-slots.spec.ts` (planned, not written) | NOT WRITTEN (no test ran) | PENDING |
| F-09 | AC-F09-16 | TEST-F09-16 | E2E | `e2e/pickup-slots.spec.ts` (planned, not written) | NOT WRITTEN (no test ran) | PENDING |
| F-09 | AC-F09-17 | TEST-F09-17 | E2E | `e2e/pickup-slots.spec.ts` (planned, not written) | NOT WRITTEN (no test ran) | PENDING |
| F-10 | AC-10.1 | TEST-10.1 | API | `server/tests/sales.test.ts` (planned, not written) | NOT WRITTEN (no test ran) | PENDING |
| F-10 | AC-10.2 | TEST-10.2 | API | `server/tests/sales.test.ts` (planned, not written) | NOT WRITTEN (no test ran) | PENDING |
| F-10 | AC-10.3 | TEST-10.3 | API | `server/tests/sales.test.ts` (planned, not written) | NOT WRITTEN (no test ran) | PENDING |
| F-10 | AC-10.4 | TEST-10.4 | API | `server/tests/sales.test.ts` (planned, not written) | NOT WRITTEN (no test ran) | PENDING |
| F-10 | AC-10.5 | TEST-10.5 | API | `server/tests/sales.test.ts` (planned, not written) | NOT WRITTEN (no test ran) | PENDING |
| F-10 | AC-10.6 | TEST-10.6 | API | `server/tests/sales.test.ts` (planned, not written) | NOT WRITTEN (no test ran) | PENDING |
| F-10 | AC-10.7 | TEST-10.7 | API | `server/tests/sales.test.ts` (planned, not written) | NOT WRITTEN (no test ran) | PENDING |
| F-10 | AC-10.8 | TEST-10.8 | API | `server/tests/sales.test.ts` (planned, not written) | NOT WRITTEN (no test ran) | PENDING |
| F-10 | AC-10.9 | TEST-10.9 | E2E | `e2e/sales.spec.ts` (planned, not written) | NOT WRITTEN (no test ran) | PENDING |
| F-11 | AC-F11-01 | TEST-F11-01 | API | `order-filter.test.ts` | PASS on `d10fac1` | PENDING |
| F-11 | AC-F11-02 | TEST-F11-02 | API | `order-filter.test.ts` | PASS on `d10fac1` | PENDING |
| F-11 | AC-F11-03 | TEST-F11-03 | API | `order-filter.test.ts` | PASS on `d10fac1` | PENDING |
| F-11 | AC-F11-04 | TEST-F11-04 | API | `order-filter.test.ts` | PASS on `d10fac1` | PENDING |
| F-11 | AC-F11-05 | TEST-F11-05 | API | `order-filter.test.ts` | PASS on `d10fac1` | PENDING |
| F-11 | AC-F11-06 | TEST-F11-06 | API | `order-filter.test.ts` | PASS on `d10fac1` | PENDING |
| F-11 | AC-F11-07 | TEST-F11-07 | API | `order-search.test.ts` | PASS on `d10fac1` | PENDING |
| F-11 | AC-F11-08 | TEST-F11-08 | API | `order-search.test.ts` | PASS on `d10fac1` | PENDING |
| F-11 | AC-F11-09 | TEST-F11-09 | API | `order-search.test.ts` | PASS on `d10fac1` | PENDING |
| F-11 | AC-F11-10 | TEST-F11-10 | API | `order-search.test.ts` | PASS on `d10fac1` | PENDING |
| F-11 | AC-F11-11 | TEST-F11-11 | API | `order-search.test.ts` | PASS on `d10fac1` | PENDING |
| F-11 | AC-F11-12 | TEST-F11-12 | API | `order-search.test.ts` | PASS on `d10fac1` | PENDING |
| F-11 | AC-F11-13 | TEST-F11-13 | API | `order-search.test.ts` | PASS on `d10fac1` | PENDING |
| F-11 | AC-F11-14 | TEST-F11-14 | API | `order-search.test.ts` | PASS on `d10fac1` | PENDING |
| F-11 | AC-F11-15 | TEST-F11-15 | API | `order-search.test.ts` | PASS on `d10fac1` | PENDING |
| F-11 | AC-F11-16 | TEST-F11-16 | E2E | `order-filter.spec.ts` | PASS on `d10fac1` | PENDING |
| F-11 | AC-F11-17 | TEST-F11-17 | E2E | `order-search.spec.ts` | PASS on `d10fac1` | PENDING |
| F-12 | AC-12.1 | TEST-12.1 | API | `server/tests/login-rate-limit.test.ts` (planned, not written) | NOT WRITTEN (no test ran) | PENDING |
| F-12 | AC-12.2 | TEST-12.2 | API | `server/tests/login-rate-limit.test.ts` (planned, not written) | NOT WRITTEN (no test ran) | PENDING |
| F-12 | AC-12.3 | TEST-12.3 | API | `server/tests/login-rate-limit.test.ts` (planned, not written) | NOT WRITTEN (no test ran) | PENDING |
| F-12 | AC-12.4 | TEST-12.4 | API | `server/tests/login-rate-limit.test.ts` (planned, not written) | NOT WRITTEN (no test ran) | PENDING |
| F-12 | AC-12.5 | TEST-12.5 | API | `server/tests/login-rate-limit.test.ts` (planned, not written) | NOT WRITTEN (no test ran) | PENDING |
| F-12 | AC-12.6 | TEST-12.6 | API | `server/tests/login-rate-limit.test.ts` (planned, not written) | NOT WRITTEN (no test ran) | PENDING |
| F-12 | AC-12.7 | TEST-12.7 | API | `server/tests/login-rate-limit.test.ts` (planned, not written) | NOT WRITTEN (no test ran) | PENDING |
| F-12 | AC-12.8 | TEST-12.8 | E2E | `e2e/login-rate-limit.spec.ts` (planned, not written) | NOT WRITTEN (no test ran) | PENDING |

Counts at the checkpoint: 51 AC in F-09..F-12; 31 had a passing test (F-09 AC-01..14 and F-11 AC-01..17); 20 had no test.

## C3. NFR checks template

The handout asks to compare NFR results with the **measurable targets in our SRS** and says not to invent performance numbers the SRS never required. These targets are taken word for word from `docs/srs.md` section 6. Fill the last two columns on the release commit. "Measurement" must be a command output, a test ID, or an observed value, never an opinion.

Release commit: `PENDING` · Deployed revision: `PENDING` · Date: `PENDING` · Run by: `PENDING`

| NFR | Measurable target (SRS) | Method and command | Measurement (to fill) | Checkpoint result (`d10fac1`) | Final result and version |
|---|---|---|---|---|---|
| NFR-01 credentials and sessions | bcrypt hash (cost ≥ 10); session id random ≥ 128 bits in an httpOnly, SameSite=Lax cookie (Secure in production); expires 8 h after login; logout deletes it | `cd server; npx vitest run tests/auth.test.ts tests/seed.test.ts` (TEST-F01-01, -08, -09, -11; AC-1.2). Production: `curl -i` the live login and read `Set-Cookie` flags (use a synthetic account, never write the password in the PDF) | PENDING | PASS (auth and seed tests) | PENDING |
| NFR-02 server is the authority | 0 endpoints take user id, role, price or total from the request; other customer's order → 404 without data; no stack traces in errors | `npx vitest run tests/orders.test.ts tests/auth.test.ts tests/app.test.ts` (TEST-F01-04, -06; TEST-F03-10, -14; "no stack trace"). Add the access checks for every endpoint added after Sprint 1: 401 anonymous, 403 wrong role, 404 other customer (F-05..F-11 tests) | PENDING | PASS | PENDING |
| NFR-03 one error format | 100% of API errors use `{ error: { code, message, details } }` with the five codes | every API test asserts `error.code`; `app.test.ts`. For F-10 and F-12 the new error paths (400 range, 429) must be asserted too | PENDING | PASS for existing endpoints; F-10, F-12 not built | PENDING |
| NFR-04 data integrity | rejected order leaves 0 rows; 20 parallel accepts → exactly 1 success | TEST-F03-03..10, TEST-F04-07; extra concurrency checks that exist: TEST-F09-10 (slot), TEST-F06-xx and TEST-F07-xx races | PENDING | PASS | PENDING |
| NFR-05 automated tests, tests first | every AC maps to ≥ 1 automated test; all pass on the release commit; failing run saved before the code | final run output with counts; per-AC table regenerated in `docs/traceability.md`; RED/GREEN files in `docs/sprint_1/evidence/tdd/`, `docs/sprint_2/evidence/tdd/` (add F-10, F-12 files) | PENDING | 153 of 173 AC verified; 20 missing (section C2) | PENDING |
| NFR-06 usable states, phone and desktop | loading, empty, error states on every screen; works at 375 px and 1280 px without sideways scrolling | Playwright `phone` and `desktop` projects (`npx playwright test`); add the Sales screen (F-10) and slot picker states | PENDING | PASS for existing screens | PENDING |
| NFR-07 deployable and configurable | settings from env; 0 secrets in Git; one container serves the built React app | `git grep` for the seed password and any key pattern on the release commit; `docker build` of the root image; `curl <live>/api/health` and the built client served by the same URL | PENDING | PASS (Lab 5 deploy live; `git grep` clean on 27 Nov) | PENDING |
| NFR-08 login rate limit | after 5 failed logins for one email within 15 min, further attempts get 429 for 15 min | TEST-12.1..12.7 (API), TEST-12.8 (E2E) | PENDING | NOT IMPLEMENTED | PENDING |
| NFR-09 accessibility | no critical or serious axe issue on any Sprint 1–3 screen; works by keyboard only | planned `e2e/a11y.spec.ts`: `@axe-core/playwright` on login, menu + cart, my orders, order detail, operator queue, operator menu, sales; list violations by impact. Keyboard: Tab order, Enter/Escape on the cancel and reject dialogs, visible focus; record each screen's result | PENDING | NOT IMPLEMENTED | PENDING |

Pass rule for each NFR: the whole target holds. A partial pass is written as INCOMPLETE with the part that fails.

## C4. Access checks to record for endpoints added after Sprint 1

The handout requires actual access checks for later endpoints. On the release commit, record status codes (test IDs where they exist). Anonymous must get 401, the wrong role 403, and another customer's record 404.

| Endpoint | Anonymous 401 | Wrong role 403 | Other customer 404 | Test | Final result |
|---|---|---|---|---|---|
| `GET/POST/PATCH /api/operator/menu` (F-05) | yes | customer | n/a | menu-management tests | PENDING |
| `POST /api/orders/:id/cancel` (F-06) | yes | operator | yes | cancel-reject tests | PENDING |
| `POST /api/operator/orders/:id/reject`, `/advance` (F-06, F-07) | yes | customer | n/a | TEST-F06, TEST-F07-11 | PENDING |
| `POST /api/orders/:id/pay` (F-08) | yes | operator | yes | payments tests | PENDING |
| `GET /api/slots` (F-09) | yes | operator | n/a | TEST-F09-13 | PENDING |
| `GET /api/orders?status=`, `GET /api/operator/orders?q=` (F-11) | yes | operator / customer | other customer's orders never listed | TEST-F11-04, -15 | PENDING |
| `GET /api/operator/sales` (F-10) | yes | customer | n/a | TEST-10.8 (planned) | PENDING |
| `POST /api/auth/login` 429 (F-12) | n/a | n/a | n/a | TEST-12.2..12.7 (planned) | PENDING |

## C5. To do at release (checklist for the person running the final verification)

1. Tag `v1.0.0` on the `main` release commit; deploy; record the Cloud Run revision.
2. On that commit run: `npm run build`, `cd server; npx vitest run`, `cd client; npx vitest run`, `npx playwright test`; paste the counts.
3. Regenerate `docs/traceability.md` (requirement matrix and per-AC table) from that run.
4. Fill sections C1 to C4 above: replace PENDING with PASS, FAIL, SKIPPED or INCOMPLETE and the commit.
5. Any FAIL, SKIPPED or INCOMPLETE item goes into the defect and debt register (Part D) with severity and next action. Do not delete a requirement and do not weaken a test.
6. Update SRS, features and SDS to the released behaviour (change logs) and refresh the appendix page references.
