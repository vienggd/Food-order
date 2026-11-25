# Lab 7 — Change request L7-1 and impact analysis (team Est)

Status: **TA approved 25 Nov 2026.** Order of commits: contract, then RED test, then fix, then GREEN.

| Field | Value |
|---|---|
| Change ID | C-1 (Issue L7-1) |
| **TA approver + date** | Approved by TA Prapatsorn Sangrod, 25 Nov 2026 |
| Sprint 1 baseline | tag `v0.1.0-sprint1` |
| Actual pre-change commit | `main` `b71cdb2` (Lab 5, deployed to Cloud Run) |
| Backups if refused | C-2 LATE flag in the operator queue; C-3 minimum order ฿40 |

## 1. The change

| | Rule |
|---|---|
| Old (BR-01) | Each order line has quantity 1–10. |
| New | BR-01 stays. **Add BR-01b:** the whole order has at most **15 items in total** (sum of all line quantities). |
| Reason | One café counter cannot prepare very large pre-orders in time; a 15-item cap keeps queue time fair. |
| Scope | Place order (API + cart). Nothing else. |
| Out of scope | Old orders (kept as saved, even with more than 15 items), menu, operator accept, auth, roles, database. |

**Acceptance criteria (draft)**
- 14 items in total → 201 PLACED. 15 items → 201 PLACED.
- 16 items → 400 `VALIDATION_ERROR`, nothing saved.
- Per-line rule unchanged: a line with 11 → 400; 20 lines max; no duplicates.
- Cart shows a warning when the total reaches 15 and the + button is disabled, so a 16th item cannot be added.
- 16 → 400 `VALIDATION_ERROR`, message "An order can have at most 15 items in total", details `{ field: "lines", max: 15, total: 16 }`.

**Invalid cases:** 16 items in one line is already blocked by BR-01 (max 10); 16 as 10 + 6, 8 + 8, or 16 lines of 1 → 400. Total is the sum of quantities, not the number of lines.

**Access (unchanged):** only CUSTOMER can place orders (401 without session, 403 for operator). Operator still sees all orders. Error shape stays `{ error: { code, message, details } }`.

## 2. Impact table

| Req. ID | Feature | SRS / feature SDS / system SDS | AC | STS tests (existing → new) | Code modules |
|---|---|---|---|---|---|
| BR-01 (extended) | F-03 | `srs.md` §BR table (BR-01); `sprints/sprint-1/F-03-orders.md` rules table + AC-F03-02; `system-sds.md` §1.3 table row "BR-01, BR-02, BR-04", §1.4 step 3, §data `quantity` | AC-F03-02 (kept); new AC-L7-01..03 | TEST-F03-02, -03 (kept); new TEST-L7-1..3 (API) | `server/src/orders/routes.ts` (`placeBody` Zod schema block only) |
| FR-06 | F-03 | `srs.md` FR-06 text lists BR-01..BR-04; wording "all rules" already covers the new clause | AC-F03-01..05 (kept) | TEST-F03-01..10 (kept) | same |
| UI cart | F-03 | `ui-spec.md` cart; F-03 AC-F03-12 (stepper 1–10, 20 lines) | new AC-L7-04 | TEST-F03-17, -18, -23 (kept); new TEST-L7-4 (unit), TEST-L7-5 (E2E) | `client/src/lib/cart.ts`, `client/src/cart.tsx`, `client/src/pages/MenuPage.tsx` (warning only), `client/src/styles.css` if needed |

**Callers / layers**

| Layer | Impact |
|---|---|
| API validation | `POST /api/orders` Zod schema: add a total-quantity check (`.refine`/`superRefine` on `items`), so it fails with the same 400 `VALIDATION_ERROR`. |
| UI validation | Cart blocks + above 15 and warns at 15. The server stays the final check (NFR-02). |
| Roles | N/A — same `requireRole("CUSTOMER")`; no role or permission change. |
| Order editing | N/A (TA answer 4) — no edit after placing exists; if added later the same rule applies. |
| Persistence / DB | N/A — no new column or table; the sum is checked before the transaction. |
| Migration | N/A — no schema change, nothing to migrate. |
| History / old orders | N/A — old orders are not re-checked and still display normally (read paths unchanged). |
| Operator queue, accept, auth | N/A — not touched. |
| Docs touched | `srs.md` BR-01, F-03 contract AC, `system-sds.md` (rule table/flow), `traceability.md` rows BR-01 / FR-06. |

## 3. What must stay unchanged and which tests protect it

| Must stay unchanged | Protected by |
|---|---|
| Quantity 1 and 10 accepted; 0, 11, 1.5, -1, "2", null rejected | TEST-F03-02, TEST-F03-03 |
| 1–20 lines, no duplicate item | TEST-F03-04..07, TEST-F03-17 |
| Server total, price/total in request → 400 | TEST-F03-01, TEST-F03-10 |
| Sold-out/missing item → nothing saved | TEST-F03-08, -09 |
| Customer cannot open staff queue (403), anonymous 401 | TEST-F01-10, TEST-F04-09 |
| Operator accept flow and concurrency | `operator.test.ts` TEST-F04-01..14 |
| Old data/lists/detail unchanged | TEST-F03-12, -13, -14, -21, -22 |

Regression suites to run: `server/tests/orders.test.ts`, `operator.test.ts`, `auth.test.ts` (plus full `npm test`); `client` unit `cart.test.ts`.

### Old tests that need new numbers (found while writing the fix)
20 lines need at least 20 items, which is above the new limit of 15, so 20 lines can no longer be placed. The checks stay the same; only the numbers change. No test is removed or weakened.

| Old test | Old numbers | New numbers | Why |
|---|---|---|---|
| TEST-F03-05 (API, AC-F03-03) | 20 different lines ×1 → 201 | 15 different lines ×1 → 201 | 20 items > 15 |
| TEST-F03-06 (API) | 21 lines → 400 | unchanged (now also fails the total rule) | still protects the schema limit of 20 lines |
| TEST-F03-18 (unit) | build 20 lines with the reducer, 21st refused | 20-line cart built directly, 21st refused | the reducer stops at 15 items |
| TEST-F03-23 (unit) | `canAddFromMenu` true at 19 lines, false at 20 | true at 14 lines, false at 15 (and false for a 20-line cart) | the limit is reached at 15 items |

## 4. TA record
| Date | Event |
|---|---|
| 24 Nov | vieng sent the TA message. |
| 25 Nov | TA Prapatsorn Sangrod approved C-1 with the 4 answers recorded in Issue #96. |

## 5. RED / GREEN plan
1. **Test commit first:** TEST-L7-1..5 are committed before any fix (API tests in `server/tests/orders.test.ts`, unit test in `client/src/lib/cart.test.ts`, E2E in `e2e/orders.spec.ts`). The test commit changes no production code.
2. **RED:** run the new tests on the pre-change behaviour (this branch without the fix = `b71cdb2` code). Expected: TEST-L7-3 cases (a) 10+6 and (b) 8+8 (16 → 400 with the new message and details; case (c) a single line of 11 already passes on old code, it only guards BR-01), TEST-L7-4 (cart warning and cap at 15) and TEST-L7-5 (warning visible, + disabled) **fail because the rule is missing**, not because of a compile error. TEST-L7-1 (14) and TEST-L7-2 (15) **pass on the old code by design**: the old rule already accepts them; they guard the boundary against an over-strict fix. Output saved in `docs/labs/lab-07/evidence/red.txt` and committed before the fix.
3. **Fix:** total-quantity check in the `placeBody` schema block of `server/src/orders/routes.ts`; warning and cap in `client/src/lib/cart.ts` (+ cart UI).
4. **GREEN:** the same tests all pass → `docs/labs/lab-07/evidence/green.txt`.
5. **Regression:** full `orders`, `operator`, `auth` suites plus client unit tests, with command, version and pass/fail/skip counts → `docs/labs/lab-07/evidence/regression.txt`. No existing test is weakened.
