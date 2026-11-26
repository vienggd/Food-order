# Lab 6 Part D — Re-test handoff for UAT Team EN-009_P3

- **Product team:** Est, section 131 — Garunyapas Danpitakkul (vieng), Dechayut Panyawutvorakul (ninja)
- **UAT team:** EN-009_P3 — Kirakit Kingkaew, Nattakit Prasertsak
- **Original tested version:** commit `b71cdb2` (`https://food-order-d4jdyxqbca-as.a.run.app`)
- **Fix PR / commits:** PR `#138` (`lab6-vieng` → `lab6`), RED `cd56600` → GREEN `c576273`; `#132` (`EX-05`) RED `d1bf95c` → GREEN in PR `#138`
- **Corrected `main` commit:** `163fdb7` (PR `#168`, merged `2026-11-26 23:36 UTC+7`)
- **Deployed Cloud Run revision:** `food-order-00008-v6c` (bundle `index-D6oQEALR.js` / `index-DIcaNBkg.css`, `/api/ready` OK)
- **Live URL:** https://food-order-d4jdyxqbca-as.a.run.app (use the same account labels as [`handoff.md`](handoff.md); no passwords here)

## Fixed defects to re-test

Start with `#123` (F2, the release-blocking **major** defect), then check the remaining eight minor defects:

| Issue / ID | Defect fixed | Short steps to reproduce | Expected result after fix | Actual / PASS or FAIL |
|---|---|---|---|---|
| #123 (F2, **major**) | Phone cart bar covered last menu item | At `375×812`, log in as CUSTOMER-A, add Latte, scroll to the bottom of `/menu`. | Basil Chicken Rice name, ฿80.00 price, and full `+` button sit clear above the fixed cart bar and are clickable. | **PASS** (Nattakit, 27 Nov `00:18 UTC+7`, Playwright on `163fdb7` / `food-order-00008-v6c`) |
| #121 (F1) | Malformed order IDs coerced as numbers | Log in as CUSTOMER-A and open `/orders/0x2` (or request `GET /api/orders/0x2`, `2e0`, `2.0`, `+2`, `0b10`, `0o2`, `%202`). | API returns `400 VALIDATION_ERROR`; UI shows `"Order not found."` (no order loaded). | **PASS** (Nattakit, 27 Nov `00:18 UTC+7`, Playwright on `163fdb7` / `food-order-00008-v6c`) |
| #122 (F5) | Access warning persisted across pages/logout | As CUSTOMER-A, visit `/operator/orders` → redirected to `/menu` with `"You don't have access to that page."`. Place an order, or log out to `/login`. | Banner clears on the next navigation/order detail page and never appears on `/login` after logout. | **PASS** (Nattakit, 27 Nov `00:18 UTC+7`, Playwright on `163fdb7` / `food-order-00008-v6c`) |
| #124 (F3) | `"Order #N placed!"` stayed on reload/ACCEPTED | Place an order (`#N`), reload `/orders/N`, then accept `#N` as OPERATOR and press **Refresh status**. | `"Order #N placed!"` is gone after reload and does not appear above `ACCEPTED`. | **PASS** (Nattakit, 27 Nov `00:19 UTC+7`, Playwright on `163fdb7` / `food-order-00008-v6c`) |
| #125 (F4) | Desktop list and detail disagreed on status | On desktop (`1280 px`), accept `#N` as OPERATOR, then click **Refresh status** on the customer's detail panel. | Both the left My orders row and the right detail panel show `ACCEPTED`. | **PASS** (Nattakit, 27 Nov `00:18 UTC+7`, Playwright on `163fdb7` / `food-order-00008-v6c`) |
| #126 (F6) | 400 validation on login showed network error | On `/login`, submit `a..b@cafe.test` or `alice@cafe.test` with a 201-character password. | Error box shows the server's 400 validation message, not `"Something went wrong. Please try again."`. | **PASS** (Nattakit, 27 Nov `00:18 UTC+7`, Playwright on `163fdb7` / `food-order-00008-v6c`) |
| #128 (EX-04) | Phone Cart badge counted total quantity | As CUSTOMER-A, add Latte ×2 (1 line). | Phone Cart tab shows `Cart (1)` (and desktop Menu cart badge shows `1`), counting cart lines. | **PASS** (Nattakit, 27 Nov `00:18 UTC+7`, Playwright on `163fdb7` / `food-order-00008-v6c`) |
| #129 (EX-06) | Phone top bar missed `Campus Café` brand | View `/menu` at `375×812` logged in as CUSTOMER-A. | Header shows `Campus Café` beside `"Hey, Alice"`, role chip, and `Log out`, with no horizontal overflow. | **PASS** (Nattakit, 27 Nov `00:18 UTC+7`, Playwright on `163fdb7` / `food-order-00008-v6c`) |
| #132 (EX-05) | Desktop queue used `<ul>` instead of `<table>` | On desktop (`1280 px`), log in as OPERATOR with at least one PLACED order. | Order queue renders a semantic `<table>` with column headers matching its columns. | **FAIL** (Nattakit, 27 Nov `00:41 UTC+7`, `163fdb7` / `food-order-00008-v6c`): 6 `<th>` headers vs 7 visible `<td>` cells because `table.queue .order-card td` overrode `.q-pill { display: none; }`, shifting headers after Order off by one column (`R-132-operator-table.png`). |

## Affected Sprint 1 cases & pending records

1. **Re-run affected cases on the deployed fix version:** `UAT-01`, `UAT-03`, `UAT-04`, `UAT-05` in [`uat-cases.md`](uat-cases.md) (focusing on the fixed steps above, plus a normal end-to-end journey).
2. **Outstanding initial-run rows:** Please include Partner A (Kirakit Kingkaew)'s formal execution rows (`UAT-01`, `UAT-03`, `UAT-05` from the initial `b71cdb2` test, if not sent separately) so both testers' results appear in our final Lab 6 report.
3. **Out of Sprint 1 re-test scope:** `#130`, `#131`, and `#133` (focus move into phone cart, `aria-describedby` login errors, clearing login email error before resubmit) were triaged as Sprint 3 `F-12` (`NFR-09`) enhancements in [`triage.md`](triage.md) and deferred to Backlog.

## Independent Sprint 1 acceptance decision (filled by EN-009_P3)

- **Corrected version tested:** commit `<main SHA>` / Cloud Run revision `<revision>`
- **Testers & date:** `<Kirakit Kingkaew, Nattakit Prasertsak>` — `<YYYY-MM-DD>`
- **Decision (pick one):** `[ ] Accepted` · `[ ] Accepted with explicitly documented minor limitations` · `[ ] Not Accepted`
- **Conditions / notes (if any):** `<list any remaining minor limitations or failed checks>`
