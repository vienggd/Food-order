# Lab 6 Part C — Triage of findings received on our app

Tested version: commit `b71cdb2` (`https://food-order-d4jdyxqbca-as.a.run.app`, Est, section 131). Testing team: EN-009_P3 (Kirakit Kingkaew, Nattakit Prasertsak). Contracts: `docs/sprint_1/sprints/sprint-1/F-01..F-04`, `docs/sprint_1/srs.md`, `docs/sprint_1/ui/ui-spec.md`.
Triage date: 26 Nov 2026 (findings received 25 Nov 2026).

## Rules for the decision
- **defect**: the app breaks a written rule (AC / BR / FR / ui-spec). Quote the contract line.
- **duplicate**: same cause or superseded by split Issues (give the target IDs).
- **not a defect**: the app does what the contract says (quote it) or the case was run wrongly.
- **enhancement**: a wish that no contract line asks for. Never use this label for a broken rule.
- Severity by user impact: **critical** (cannot use the app, wrong or exposed data), **major** (rule or main flow broken), **minor** (wording, look, non-blocking UI polish).

## Table

| Finding ID | Source (case, step, who, date) | Summary | Decision | Reason (contract line) | Severity | Owner | Issue | Status |
|---|---|---|---|---|---|---|---|---|
| F1 / EX-08 | UAT-03 exploratory API, Nattakit, 25 Nov 2026 | Malformed order IDs (`0x2`, `2e0`, `2.0`, `+2`, `0b10`, `0o2`, `%202`) accepted instead of 400 | **defect** | AC-F03-08 & AC-F04-08: malformed order id gives `400 VALIDATION_ERROR` (`z.coerce.number()` accepts JS hex/scientific syntax) | minor (ownership still enforced; no cross-user data leak) | vieng | #121 | Fixed in PR #138 |
| F5 / EX-09 + EX-02 | UAT-03 step 1 & UAT-05, Kirakit & Nattakit, 25 Nov 2026 | Access warning persists on `/login` after logout and on `/orders/:id` after placing an order | **defect** | AC-F01-14 & `ui-spec.md` Navigation & Shared layout: route-guard redirect notice is one-off for the target home screen, not shown on later screens or after logout | minor (misleading banner; no action blocked) | vieng | #122 | Fixed in PR #138 |
| F2 / EX-10 | UAT-01 phone (375×812), Nattakit, 25 Nov 2026 | Fixed `.cart-bar` overlaps the bottom menu item (name, price, and most of `+` covered) | **defect** | NFR-06 (usable at 375 px) & AC-F02-06 (each available item shows name, price, and reachable `+` button) | **major** (release-blocking: last menu item is obstructed on phone) | vieng | #123 | Fixed in PR #138 |
| F3 / EX-11 | UAT-01 steps 4 & 7, Nattakit, 25 Nov 2026 | `"Order #N placed!"` stays after reload and remains above `ACCEPTED` after Refresh status | **defect** | AC-F03-10 & `ui-spec.md` S4 Order detail: `"Order #N placed!"` is shown only when arriving straight from Place order, not after reload or later status updates | minor (confusing banner; order status itself is right) | vieng | #124 | Fixed in PR #138 |
| F4 / EX-12 | UAT-01 step 7 & UAT-04 step 6, Nattakit, 25 Nov 2026 | Desktop split view detail shows `ACCEPTED` after Refresh status while the left list still shows `PLACED` | **defect** | `ui-spec.md` S3/S4 (desktop split view shows list and detail side by side for one order; both must agree on status) | minor (visual inconsistency until list refresh/reload) | vieng | #125 | Fixed in PR #138 |
| F6 / EX-13 | UAT-05 (`a..b@cafe.test` / 201-char password), Nattakit, 25 Nov 2026 | Invalid login returning HTTP 400 shows `"Something went wrong. Please try again."` instead of server message | **defect** | `ui-spec.md` Errors table (`VALIDATION_ERROR` 400 displays `error.message`; API 400 already satisfies AC-F01-04, UI broke the error table) | minor (user is not shown what failed) | vieng | #126 | Fixed in PR #138 |
| Umbrella (#127) | Exploratory testing, Kirakit, 25 Nov 2026 | Umbrella issue combining 6 exploratory items (later split into `#128–#133`) | **duplicate** (split) | Replaced by #128–#133 at product-side request; closed by `songt888` 25 Nov 2026 | — | — | #127 | Closed (superseded by #128–#133) |
| EX-04 | UAT-01 exploratory, Kirakit & Nattakit, 25 Nov 2026 | Phone Cart tab and desktop Menu badge count total item quantities instead of cart lines | **defect** | `ui-spec.md` Shared layout (line 62): `"Cart is a raised centre button with the number of cart lines"` | minor (ordering works; badge label mismatches spec) | vieng | #128 | Fixed in PR #138 |
| EX-06 | UAT-01 exploratory phone, Kirakit & Nattakit, 25 Nov 2026 | Phone top bar shows greeting, role chip, and Log out without the `Campus Café` brand | **defect** | `ui-spec.md` Shared layout (line 62): phone top bar includes `"Hey, <name>"`, the brand, role chip, and Log out | minor (cosmetic spec mismatch) | vieng | #129 | Fixed in PR #138 |
| EX-05 | UAT-01 exploratory 1440 px, Kirakit & Nattakit, 25 Nov 2026 | Desktop order queue uses `UL` with `aria-hidden` header row instead of `<table>` | **defect** | `F-04` §3 UI (line 59) & changelog v1.2 (6 Nov): `"the orders as a table (Order, Customer, Items, Placed, Total, Action)"`, no longer UI debt; `QueuePage.tsx` still rendered `<ul>` + `aria-hidden` headrow | minor (inaccessible headers to screen readers) | vieng | #132 | Fixed in PR #138 |
| EX-01 | UAT-01 exploratory 320 px, Kirakit & Nattakit, 25 Nov 2026 | Opening Cart on phone does not programmatically move keyboard focus into the cart panel | **enhancement** | Not specified in Sprint 1 contracts (`ui-spec.md` covers visible focus ring only); planned under Sprint 3 `F-12` (`docs/sprint_2/sprints/F-12-polish-a11y.md`, `NFR-09`, no Sprint 3 code Issue yet) | minor | ninja (Sprint 3 `F-12`) | #130 | Deferred to Sprint 3 (`F-12` Backlog) |
| EX-03 | UAT-05 exploratory, Kirakit & Nattakit, 25 Nov 2026 | Sign-in field errors lack `aria-describedby` and live region announcement | **enhancement** | Visible messages match `ui-spec.md` S1; assistive-tech attributes belong to Sprint 3 `F-12` (`docs/sprint_2/sprints/F-12-polish-a11y.md`, `NFR-09`, no Sprint 3 code Issue yet) | minor | ninja (Sprint 3 `F-12`) | #131 | Deferred to Sprint 3 (`F-12` Backlog) |
| EX-07 | UAT-05 exploratory, Kirakit & Nattakit, 25 Nov 2026 | Email validation error on `/login` remains visible after typing a valid email until resubmit | **enhancement** | `ui-spec.md` S1 defines validation texts on submit and does not specify clearing on blur/change; fits Sprint 3 `F-12` polish (`docs/sprint_2/sprints/F-12-polish-a11y.md`) | minor | ninja (Sprint 3 `F-12`) | #133 | Deferred to Sprint 3 (`F-12` Backlog) |

## Accepted defects

| Issue | Defect | RED test (on `b71cdb2`) | GREEN commit | PR | Re-test version | Partner decision |
|---|---|---|---|---|---|---|
| #121 | Reject non-decimal/coerced order ids (`0x2`, `2e0`, etc.) with 400 | `TEST-L6-121` (`orders.test.ts`, `operator.test.ts`; RED `cd56600`) | `c576273` | #138 | TBD | Pending re-test |
| #122 | Clear route-guard access notice on logout and subsequent navigation | `TEST-L6-122` (`e2e/lab6-fixes.spec.ts`; RED `cd56600`) | `c576273` | #138 | TBD | Pending re-test |
| #123 | Clear `.cart-bar` overlap over last menu item on phone (`max-width: 899px`) | `TEST-L6-123` (`e2e/lab6-fixes.spec.ts`; RED `cd56600`) | `c576273` | #138 | TBD | Pending re-test |
| #124 | Do not persist `"Order #N placed!"` across reload or non-PLACED statuses | `TEST-L6-124` (`e2e/lab6-fixes.spec.ts`; RED `cd56600`) | `c576273` | #138 | TBD | Pending re-test |
| #125 | Keep desktop My orders list status synced when detail view refreshes | `TEST-L6-125` (`e2e/lab6-fixes.spec.ts`; RED `cd56600`) | `c576273` | #138 | TBD | Pending re-test |
| #126 | Show server 400 `error.message` on login instead of generic network error | `TEST-L6-126` (`e2e/lab6-fixes.spec.ts`; RED `cd56600`) | `c576273` | #138 | TBD | Pending re-test |
| #128 | Count cart lines (not total quantity) in Cart tab and desktop Menu badge | `TEST-L6-128` (`e2e/lab6-fixes.spec.ts`; RED `cd56600`) | `c576273` | #138 | TBD | Pending re-test |
| #129 | Show `Campus Café` brand in phone top bar (`<header className="top">`) | `TEST-L6-129` (`e2e/lab6-fixes.spec.ts`; RED `cd56600`) | `c576273` | #138 | TBD | Pending re-test |
| #132 | Render desktop operator order queue as a semantic `<table>` with `<th>` column headers | `TEST-L6-132` (`e2e/lab6-fixes.spec.ts`; RED `d1bf95c`) | Fixed in PR #138 | #138 | TBD | Pending re-test |

## Partner UAT execution received (25 Nov 2026)

Summary from EN-009_P3's outgoing findings report (`UAT-findings-Est-EN033_(1).pdf`, reporter Nattakit Prasertsak [B] with Kirakit Kingkaew [A], tested on `b71cdb2` at `https://food-order-d4jdyxqbca-as.a.run.app`, 2026-11-25 21:07–21:30 UTC+7):

| Case | Tester | Time (UTC+7) | Actual result (recorded by Partner B) | Result |
|---|---|---|---|---|
| UAT-02 | Nattakit (B) | 21:11–21:12 | `K = 3`. Stepper stops at 10 (`+` disabled, typing 11 stays 10). Order `#5` placed: Thai Milk Tea ฿50.00 × 10 = ฿500.00, `PLACED`. Croissant greyed with `Sold out`, add button disabled. `My orders = 4 = K + 1`, none with Croissant. | PASS |
| UAT-04 | Nattakit (B) | 21:12–21:13 | `#P = 6` (Thai Milk Tea × 1, ฿50.00). Listed `PLACED` after logout/new browser. Window 1: `"Order #6 accepted."` Window 2 (not reloaded): `"Order #6: Already accepted by another staff member."`, list reloaded without `#6`. Customer sees `ACCEPTED`, ฿50.00. | PASS |
| UAT-06 | Nattakit (B) | 21:13–21:14 | `K = 5`, `LATTE_ID = 1`. Body with `unitPrice: 1` → `400 VALIDATION_ERROR`. Body with `total: 1` → `400 VALIDATION_ERROR`. `My orders` stayed 5. | PASS |

- **Additional checks & bundle verification (§4–§7 of Partner B's PDF):**
  - Cookie flags verified (`HttpOnly; Secure; SameSite=Lax; Max-Age=28800`); phone tabs read `Menu`, `Cart`, `My orders`; zero horizontal overflow at 375 px on menu/orders/detail; double-clicking Place order creates 1 order; deleted session redirects to `/login` with `"Your session has ended. Please log in again."`; quantity input normalizes `0`/`-3` → `1`, `99` → `10`, `5.5` → `5`; unknown path `/nope` shows `"Page not found"`.
  - Live bundle matched `b71cdb2`: `/assets/index-DiHrQZz2.js`, `/assets/index-BPUDR1A9.css`, `"Release 2 · now on Google Cloud"`.
  - Synthetic orders created by Partner B on live app: `#5`, `#6`, `#8`, `#9` (CUSTOMER-A; no other customer orders altered).
  - Partner AI disclosure: Claude Code `agent-browser` (headless Chromium) used alongside manual runs by B.
- **Pending from EN-009_P3:** Partner A (Kirakit Kingkaew)'s formal execution log rows for `UAT-01`, `UAT-03`, and `UAT-05` are still awaited (Kirakit's exploratory findings are already triaged above in `#122` and `#127` → `#128–#133`).
- **Next:** After PR `#138` merges and the fixed version is deployed to `main`, send [`retest-handoff.md`](retest-handoff.md) to EN-009_P3 for independent re-test and Sprint 1 acceptance sign-off.
