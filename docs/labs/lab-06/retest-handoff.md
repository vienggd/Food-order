# Lab 6 Part D — Re-test handoff for UAT Team EN-009_P3

- **Product team:** Est, section 131 — Garunyapas Danpitakkul (vieng), Dechayut Panyawutvorakul (ninja)
- **UAT team:** EN-009_P3 — Kirakit Kingkaew, Nattakit Prasertsak
- **Original tested version:** commit `b71cdb2` (`https://food-order-d4jdyxqbca-as.a.run.app`)
- **Fix PR / commits:** PR `#138` (`lab6-vieng` → `lab6`), RED `cd56600` → GREEN `c576273`; `#132` initial `d1bf95c` → `2e291c8`, followed by `#132` table-header alignment fix PR `#174` (RED `63beafe` → GREEN `b5bddb9`)
- **Corrected `main` commit:** `39bda5e` (PR `#181`, merged `2026-11-27 03:19 UTC+7`; previous `163fdb7` / PR `#168` fixed `#121–#129`)
- **Deployed Cloud Run revision:** `food-order-00009-jd9` (bundle `index-DbdmxBc6.js` / `index--AGnC0Oj.css`, `/api/ready` OK; previous `food-order-00008-v6c` verified for `#121–#129`)
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
| #132 (EX-05) | Desktop queue used `<ul>` instead of `<table>` | On desktop (`1280 px`), log in as OPERATOR with at least one PLACED order. | Order queue renders a semantic `<table>` with column headers matching its columns. | First `163fdb7` / `food-order-00008-v6c`: **FAIL** (Nattakit 27 Nov `00:41`, Kirakit `03:05` — 6 `<th>` vs 7 `<td>`). Re-tested on `39bda5e` / `food-order-00009-jd9`: **PASS** (Kirakit, 27 Nov `03:32 UTC+7`, manual `1280×800`: 7 `scope="col"` headers aligned within 2 px with 7 cells across 4 rows; `songt888` `retest-132-0305.md`). |

## Affected Sprint 1 cases & pending records

1. **Re-run affected cases on the deployed fix version:** `UAT-01`, `UAT-03`, `UAT-04`, `UAT-05` all **PASS** on `163fdb7` / `food-order-00008-v6c` (Nattakit & Kirakit, `2026-11-27 00:18–01:45 UTC+7`; only `#132` re-tested afterward on `39bda5e` / `food-order-00009-jd9` and passed at `03:32 UTC+7`).
2. **Outstanding initial-run rows:** Received Kirakit Kingkaew (A)'s formal `UAT-01`, `UAT-03`, and `UAT-05` rows (`b71cdb2`, `2026-11-25 22:23–22:33 UTC+7`, all **PASS**) from EN-009_P3's [`uat-execution.md`](https://github.com/songt888/event-registration-system/blob/main/docs/labs/lab-06/uat-execution.md).
3. **Out of Sprint 1 re-test scope:** `#130`, `#131`, and `#133` (focus move into phone cart, `aria-describedby` login errors, clearing login email error before resubmit) were triaged as Sprint 3 `F-12` (`NFR-09`) enhancements in [`triage.md`](triage.md) and placed in Board 4 `Backlog`; EN-009_P3 explicitly accepted this deferral on all three Issues.

## Independent Sprint 1 acceptance decision (filled by EN-009_P3)

- **Corrected version tested:** commit `<main SHA>` / Cloud Run revision `<revision>`
- **Testers & date:** `<Kirakit Kingkaew, Nattakit Prasertsak>` — `<YYYY-MM-DD>`
- **Decision (pick one):** `[ ] Accepted` · `[ ] Accepted with explicitly documented minor limitations` · `[ ] Not Accepted`
- **Conditions / notes (if any):** `<list any remaining minor limitations or failed checks>`
