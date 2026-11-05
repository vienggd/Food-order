# Traceability matrix — Campus Café Pre-order

Deliverable 1, part B (2 of 2). Issue #7. Features: [`features.md`](features.md). Requirements: `docs/srs.md` (#6).
Version 1 — 6 Nov 2026 (draft).

How to read a row: requirement → feature → sprint → acceptance criteria (from the feature contract) → test IDs (from the test spec) → result on the tested commit.
Columns marked *TBD* are filled when the Sprint 1 contracts (#2–#5) are committed; results are filled from the test run on the release commit.

## 1. Business rules

| Req | Rule (short) | Feature | Sprint | AC | Tests | Result |
|---|---|---|---|---|---|---|
| BR-01 | Quantity per line is a whole number 1–10 | F-03 | 1 | TBD | TBD | — |
| BR-02 | 1–20 lines, no duplicate menu item | F-03 | 1 | TBD | TBD | — |
| BR-03 | Every item exists and is available, else nothing is saved | F-02, F-03 | 1 | TBD | TBD | — |
| BR-04 | Server calculates the total; price/total in request → 400 | F-03 | 1 | TBD | TBD | — |
| BR-05 | Order line keeps item name and unit price at order time | F-03 | 1 | TBD | TBD | — |
| BR-06 | Only a PLACED order can be accepted, else 409 | F-04 | 1 | TBD | TBD | — |
| BR-07 | Two operators accept at once → one 200, one 409 | F-04 | 1 | TBD | TBD | — |

## 2. Functional requirements

Filled from the SRS (#6) once its FR IDs are fixed.

| Req | Requirement (short) | Feature | Sprint | AC | Tests | Result |
|---|---|---|---|---|---|---|
| FR-xx | TBD | | | | | |

## 3. Non-functional requirements

| Req | Requirement (short) | Feature | Sprint | How verified | Tests | Result |
|---|---|---|---|---|---|---|
| NFR-xx | TBD | | | | | |

## 4. Coverage check

- Every FR/BR/NFR has at least one feature: *to check when SRS is final*.
- Every Sprint 1 AC has at least one test: *to check when contracts are final*.
- Requirements out of scope are listed in the SRS with a reason.

## Change log

| Date | Change | Why |
|---|---|---|
| 6 Nov 2026 | First draft (business rules mapped) | Deliverable 1 part B |
