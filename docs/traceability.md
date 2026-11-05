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

IDs agreed with the SRS author in chat on 6 Nov 2026.

| Req | Requirement (short) | Feature | Sprint | AC | Tests | Result |
|---|---|---|---|---|---|---|
| FR-01 | Log in with email + password | F-01 | 1 | TBD | TBD | — |
| FR-02 | Log out | F-01 | 1 | TBD | TBD | — |
| FR-03 | Show current user and send to role home | F-01 | 1 | TBD | TBD | — |
| FR-04 | Server checks role on every protected endpoint | F-01 (used by F-02..F-04) | 1 | TBD | TBD | — |
| FR-05 | View menu with price and availability | F-02 | 1 | TBD | TBD | — |
| FR-06 | Place an order | F-03 | 1 | TBD | TBD | — |
| FR-07 | List my orders | F-03 | 1 | TBD | TBD | — |
| FR-08 | View my order detail | F-03 | 1 | TBD | TBD | — |
| FR-09 | Operator queue of PLACED orders, oldest first | F-04 | 1 | TBD | TBD | — |
| FR-10 | Accept an order | F-04 | 1 | TBD | TBD | — |
| FR-11 | Menu management | F-05 | 2 | Sprint 2 contract | — | — |
| FR-12 | Customer cancel | F-06 | 2 | Sprint 2 contract | — | — |
| FR-13 | Operator reject with reason | F-06 | 2 | Sprint 2 contract | — | — |
| FR-14 | Fulfilment PREPARING → READY → PICKED_UP | F-07 | 2 | Sprint 2 contract | — | — |
| FR-15 | Simulated payment | F-08 | 2 | Sprint 2 contract | — | — |
| FR-16 | Pickup time slots | F-09 | 3 | Sprint 3 contract | — | — |
| FR-17 | Sales summary | F-10 | 3 | Sprint 3 contract | — | — |
| FR-18 | Order search / filter | F-11 | 3 | Sprint 3 contract | — | — |

## 3. Non-functional requirements

| Req | Requirement (short) | Feature | Sprint | How verified | Tests | Result |
|---|---|---|---|---|---|---|
| NFR-01 | bcrypt passwords, httpOnly session cookie, 8 h expiry | F-01 | 1 | API tests | TBD | — |
| NFR-02 | Role and prices only from server; no stack traces | F-01, F-03 | 1 | API tests | TBD | — |
| NFR-03 | One error format, codes 400/401/403/404/409 | F-01..F-04 | 1 | API tests | TBD | — |
| NFR-04 | One transaction per order; safe concurrent accept | F-03, F-04 | 1 | API tests (concurrency) | TBD | — |
| NFR-05 | Automated unit, API and end-to-end tests; tests first | F-01..F-04 | 1 | Test run + red/green commits | TBD | — |
| NFR-06 | Loading, empty and error states; phone and desktop | F-01..F-04 | 1 | End-to-end tests + screenshots | TBD | — |
| NFR-07 | One container, settings from env, no secrets in Git | all | 1 | Review + Lab 5 | TBD | — |
| NFR-08 | Login rate limit | F-12 | 3 | Sprint 3 contract | — | — |
| NFR-09 | Accessibility | F-12 | 3 | Sprint 3 contract | — | — |

## 4. Coverage check

- Every FR/BR/NFR has at least one feature: **yes** (FR-01..FR-18, BR-01..BR-07, NFR-01..NFR-09 all mapped). Recheck when the SRS is merged.
- Every Sprint 1 AC has at least one test: *to check when contracts are final*.
- Requirements out of scope are listed in the SRS with a reason.

## Change log

| Date | Change | Why |
|---|---|---|
| 6 Nov 2026 | First draft (business rules mapped) | Deliverable 1 part B |
