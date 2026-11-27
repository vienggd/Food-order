# Lab 7 contract — change C-1 (at most 15 items per order)

This is the Lab 7 contract for change C-1, kept here so `main` holds it next to the Lab 7 report. On branch `lab7` it was first written into the Sprint 1 F-03 contract (PR #103, commit history shows contract → RED → GREEN); those Sprint 1 copies are frozen as submitted for Deliverable 1, so on `main` the rule lives in the living docs (`docs/srs.md`, `docs/system-sds.md`, `docs/traceability.md`, `docs/features.md`) and in this file.

Approved by the TA, Prapatsorn Sangrod, 25 Nov 2026 (Issue #96, screenshots in `evidence/`).

## Rules, errors, acceptance criteria and tests (as added to F-03 on `lab7`)

| Item | Text |
|---|---|
| BR-01b (Lab 7, C-1) | The sum of all `quantity` values in one order is at most 15 (10 + 5 ok, 10 + 6 rejected). Per-line 1–10 stays. | 400 `VALIDATION_ERROR` |
| 400 | `VALIDATION_ERROR` | Total quantity over 15 (BR-01b) | "An order can have at most 15 items in total"; `details: { field: "lines", max: 15, total: 16 }` (`total` = the real sum) |
| AC-F03-03 | (BR-02) When `items` is empty or has 21 lines, or the same item appears twice, then 400 `VALIDATION_ERROR` and nothing is saved. Different lines are accepted up to the 15-item total (15 lines of ×1; since Lab 7 / C-1 the schema limit of 20 lines is no longer reachable, see BR-01b). |
| AC-F03-12 | In the cart, the stepper cannot go below 1 or above 10, and at 15 items in total (C-1) no + on the menu adds anything (a new item cannot be added; lines already in the cart change only with their stepper, never above 15 in total). A cart object with 20 lines is still refused a 21st item. |
| AC-L7-01 | (BR-01b, C-1) When the quantities add up to 14 or 15 (e.g. 10 + 4, 10 + 5), then 201 `PLACED`. |
| AC-L7-02 | (BR-01b) When the quantities add up to 16 or more (10 + 6, 8 + 8), then 400 `VALIDATION_ERROR`, message "An order can have at most 15 items in total", `details { field: "lines", max: 15, total }`, and nothing is saved. |
| AC-L7-03 | The per-line and per-order rules, roles (401/403) and old orders are unchanged; orders saved before C-1 are listed and opened as before. |
| AC-L7-04 | In the cart, when the total reaches 15 a warning is shown and every + (menu and stepper) is disabled, so a 16th item cannot be added; below 15 the + works as before. |
| TEST-F03-05 | AC-F03-03 | API | alice; 15 different available items ×1 (was 20; 20 lines need 20 items, more than the C-1 limit) | POST | 201 with 15 lines |
| TEST-F03-18 | AC-F03-12 | unit | `cartReducer`: set qty 0, 11, 2.7; add to a 20-line cart object built directly (not by the reducer, which stops at 15 items) | apply | qty clamped to 1, 10, 2; 21st item refused |
| TEST-F03-23 | AC-F03-12 | unit | `canAddFromMenu(cart)` with 14 and 15 lines of ×1 (was 19 and 20 lines) | call | true at 14, false at 15 (every menu + disabled by the C-1 limit); a directly built 20-line cart is also false |
| TEST-L7-1 | AC-L7-01 | API | alice; Latte ×10 + Americano ×4 (total 14) | POST | 201; 2 lines saved |
| TEST-L7-2 | AC-L7-01 | API | alice; Latte ×10 + Americano ×5 (total 15) | POST | 201 |
| TEST-L7-3 | AC-L7-02, AC-L7-03 | API | alice; (a) Latte ×10 + Americano ×6; (b) Latte ×8 + Americano ×8; (c) Latte ×11 | POST (one request each) | (a), (b): 400 `VALIDATION_ERROR`, message "An order can have at most 15 items in total", `details` `{ field: "lines", max: 15, total: 16 }`; (c): 400 (per-line rule still applies); order count unchanged |
| TEST-L7-4 | AC-L7-04 | unit | cart with total 14, then 15 | add / setQty towards 16 | warning flag true at 15; total never above 15; add and + refused at 15 |
| TEST-L7-5 | AC-L7-04 | E2E | alice logged in; cart total 15 | look at cart, press + | warning visible; + disabled; Place order still works (201) |
| 1.4 | 25 Nov 2026 | Lab 7 change C-1: BR-01b (at most 15 items in total), AC-L7-01..04, TEST-L7-1..5; contract before test and code; TA approved 25 Nov (Issue #96) | ninja |
| 1.5 | 25 Nov 2026 | C-1 follow-up: 20 lines can no longer be placed (20 items > 15). AC-F03-03, AC-F03-12, TEST-F03-05, -18, -23 use reachable numbers (15 lines; 20-line cart built directly). Same checks, no test weakened. BR-02 limit 20 stays in the schema | ninja |
