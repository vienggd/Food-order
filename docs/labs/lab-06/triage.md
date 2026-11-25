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
| F1 / EX-08 | UAT-03 exploratory API, Nattakit, 25 Nov 2026 | Malformed order IDs (`0x2`, `2e0`, `2.0`, `+2`, `0b10`, `0o2`, `%202`) accepted instead of 400 | **defect** | AC-F03-08 & AC-F04-08: malformed order id gives `400 VALIDATION_ERROR` (`z.coerce.number()` accepts JS hex/scientific syntax) | minor (ownership still enforced; no cross-user data leak) | vieng | #121 | Fixing on `lab6` |
| F5 / EX-09 + EX-02 | UAT-03 step 1 & UAT-05, Kirakit & Nattakit, 25 Nov 2026 | Access warning persists on `/login` after logout and on `/orders/:id` after placing an order | **defect** | `ui-spec.md` Navigation & Shared layout: route-guard redirect notice is one-off for the target home screen, not shown on later screens or after logout | minor (misleading banner; no action blocked) | vieng | #122 | Fixing on `lab6` |
| F2 / EX-10 | UAT-01 phone (375×812), Nattakit, 25 Nov 2026 | Fixed `.cart-bar` overlaps the bottom menu item (name, price, and most of `+` covered) | **defect** | AC-F02-06 ("every available item can be seen and added") & NFR-06 (usable at 375 px) | **major** (release-blocking: last menu item is obstructed on phone) | vieng | #123 | Fixing on `lab6` |
| F3 / EX-11 | UAT-01 steps 4 & 7, Nattakit, 25 Nov 2026 | `"Order #N placed!"` stays after reload and remains above `ACCEPTED` after Refresh status | **defect** | `ui-spec.md` S4 Order detail: `"Order #N placed!"` is shown only when arriving straight from Place order, not after reload or later status updates | minor (confusing banner; order status itself is right) | vieng | #124 | Fixing on `lab6` |
| F4 / EX-12 | UAT-01 step 7 & UAT-04 step 6, Nattakit, 25 Nov 2026 | Desktop split view detail shows `ACCEPTED` after Refresh status while the left list still shows `PLACED` | **defect** | AC-F03-07 & `ui-spec.md` S3/S4: one screen should not display contradictory statuses for the same order | minor (visual inconsistency until list refresh/reload) | vieng | #125 | Fixing on `lab6` |
| F6 / EX-13 | UAT-05 (`a..b@cafe.test` / 201-char password), Nattakit, 25 Nov 2026 | Invalid login returning HTTP 400 shows `"Something went wrong. Please try again."` instead of server message | **defect** | `ui-spec.md` Errors table: `VALIDATION_ERROR` 400 displays `error.message` (network fallback is only for network/500) | minor (user is not shown what failed) | vieng | #126 | Fixing on `lab6` |
| EX-01, EX-03..07 (combined) | Exploratory testing, Kirakit, 25 Nov 2026 | Umbrella issue combining 6 exploratory items | **duplicate** (split) | Replaced by #128–#133 at product-side request; closed by `songt888` 25 Nov 2026 | — | — | #127 | Closed (superseded by #128–#133) |
| EX-04 | UAT-01 exploratory, Kirakit & Nattakit, 25 Nov 2026 | Phone Cart tab and desktop Menu badge count total item quantities instead of cart lines | **defect** | `ui-spec.md` Shared layout (line 62): `"Cart is a raised centre button with the number of cart lines"` | minor (ordering works; badge label mismatches spec) | vieng | #128 | Fixing on `lab6` |
| EX-06 | UAT-01 exploratory phone, Kirakit & Nattakit, 25 Nov 2026 | Phone top bar shows greeting, role chip, and Log out without the `Campus Café` brand | **defect** | `ui-spec.md` Shared layout (line 62): phone top bar includes `"Hey, <name>"`, the brand, role chip, and Log out | minor (cosmetic spec mismatch) | vieng | #129 | Fixing on `lab6` |
| EX-01 | UAT-01 exploratory 320 px, Kirakit & Nattakit, 25 Nov 2026 | Opening Cart on phone does not programmatically move keyboard focus into the cart panel | **enhancement** | Not specified in Sprint 1 contracts (`ui-spec.md` covers visible focus ring only); reported as feature request by UAT team | minor | ninja (Sprint 3 `F-12` / `NFR-09`) | #130 | Deferred to Sprint 3 (`F-12` Backlog) |
| EX-03 | UAT-05 exploratory, Kirakit & Nattakit, 25 Nov 2026 | Sign-in field errors lack `aria-describedby` and live region announcement | **enhancement** | Visible messages match `ui-spec.md` S1; assistive-tech attributes belong to Sprint 3 `NFR-09` (`F-12`), as noted in the report | minor | ninja (Sprint 3 `F-12` / `NFR-09`) | #131 | Deferred to Sprint 3 (`F-12` Backlog) |
| EX-05 | UAT-01 exploratory 1440 px, Kirakit & Nattakit, 25 Nov 2026 | Desktop order queue uses `UL` with `aria-hidden` header row instead of `<table>` | **enhancement** | Not required by Sprint 1 F-04 contract (already logged as UI debt in F-04); Sprint 3 `NFR-09` accessibility work | minor | ninja (Sprint 3 `F-12` / `NFR-09`) | #132 | Deferred to Sprint 3 (`F-12` Backlog) |
| EX-07 | UAT-05 exploratory, Kirakit & Nattakit, 25 Nov 2026 | Email validation error on `/login` remains visible after typing a valid email until resubmit | **enhancement** | `ui-spec.md` S1 defines validation texts on submit and does not specify clearing on blur/change | minor | ninja (Sprint 3 `F-12` / `NFR-09`) | #133 | Deferred to Sprint 3 (`F-12` Backlog) |

## Accepted defects

| Issue | Defect | RED test (on `b71cdb2`) | GREEN commit | PR | Re-test version | Partner decision |
|---|---|---|---|---|---|---|
| #121 | Reject non-decimal/coerced order ids (`0x2`, `2e0`, etc.) with 400 | `TEST-L6-121` (`orders.test.ts`, `operator.test.ts`; RED `cd56600`) | Fixed in PR (pending ninja review) | TBD | TBD | Pending re-test |
| #122 | Clear route-guard access notice on logout and subsequent navigation | `TEST-L6-122` (`e2e/lab6-fixes.spec.ts`; RED `cd56600`) | Fixed in PR (pending ninja review) | TBD | TBD | Pending re-test |
| #123 | Clear `.cart-bar` overlap over last menu item on phone (`max-width: 899px`) | `TEST-L6-123` (`e2e/lab6-fixes.spec.ts`; RED `cd56600`) | Fixed in PR (pending ninja review) | TBD | TBD | Pending re-test |
| #124 | Do not persist `"Order #N placed!"` across reload or non-PLACED statuses | `TEST-L6-124` (`e2e/lab6-fixes.spec.ts`; RED `cd56600`) | Fixed in PR (pending ninja review) | TBD | TBD | Pending re-test |
| #125 | Keep desktop My orders list status synced when detail view refreshes | `TEST-L6-125` (`e2e/lab6-fixes.spec.ts`; RED `cd56600`) | Fixed in PR (pending ninja review) | TBD | TBD | Pending re-test |
| #126 | Show server 400 `error.message` on login instead of generic network error | `TEST-L6-126` (`e2e/lab6-fixes.spec.ts`; RED `cd56600`) | Fixed in PR (pending ninja review) | TBD | TBD | Pending re-test |
| #128 | Count cart lines (not total quantity) in Cart tab and desktop Menu badge | `TEST-L6-128` (`e2e/lab6-fixes.spec.ts`; RED `cd56600`) | Fixed in PR (pending ninja review) | TBD | TBD | Pending re-test |
| #129 | Show `Campus Café` brand in phone top bar (`<header className="top">`) | `TEST-L6-129` (`e2e/lab6-fixes.spec.ts`; RED `cd56600`) | Fixed in PR (pending ninja review) | TBD | TBD | Pending re-test |
