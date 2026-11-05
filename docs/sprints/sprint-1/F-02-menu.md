# F-02 Browse menu — feature contract

Sprint 1 · Issue #3 · Owner: ninja (B) · Reviewer: vieng (A)
Status: Specified (committed before any F-02 code)

## 1. Feature and linked requirements

A logged-in customer sees the café menu: every item with its name and price. Sold-out items stay visible but are greyed out and cannot be added to the cart.

| Type | IDs |
|---|---|
| Functional | FR-05 view menu with price and availability; FR-04 role check on the endpoint |
| Business rules | BR-03 (sold-out items cannot be ordered — shown here, enforced again by F-03 on submit) |
| Non-functional | NFR-02 prices only from the server, NFR-03 error format, NFR-05 tests first, NFR-06 loading/empty/error states, phone + desktop |
| Depends on | #1 setup (`menu_items` table, seed), F-01 (session and `requireRole`) |

## 2. Behaviour, workflow and permissions

1. Customer opens `/menu` (their home page after login).
2. The app calls `GET /api/menu`.
3. The server checks the session (F-01) and the role, reads all rows of `menu_items` ordered by `id`, and returns them.
4. The app shows each item; items with `isAvailable = false` are greyed with a **Sold out** badge and a disabled **+** button.
5. Adding to the cart (client-side cart) is part of F-03.

| Who | `GET /api/menu` |
|---|---|
| Not logged in / session expired | 401 `UNAUTHENTICATED` |
| CUSTOMER | 200 |
| OPERATOR | 403 `FORBIDDEN` (operators manage the menu with F-05 in Sprint 2) |

Rules:
- Prices are integers in satang, returned exactly as stored. The client only formats them (`6500` → `฿65.00`).
- Sold-out items are **included** in the response (not filtered out), so the customer sees what exists.
- The menu is read-only in Sprint 1.

## 3. UI (screen S2, menu list part)

Source: `docs/ui/ui-spec.md` S2 and `docs/ui/design/Menu.html`, `DesktopMenu.html`.

- Banner: "Order ahead. Skip the line." / "Coffee and snacks from ฿35. Pickup ASAP at the counter."
- Phone: one row per item. Desktop: 3-column cards.
- Each item: name, price `฿xx.xx`, round **+** button with accessible label "Add `<item name>`".
- Sold out: greyed, **Sold out** badge, + disabled.
- In cart (from F-03): "In cart · N" badge.

| State | What the user sees |
|---|---|
| Loading | Grey placeholder rows; no + buttons |
| Empty (0 items) | "Nothing on the menu yet. Please check back later." |
| Error (network / 500) | "Couldn't load the menu. Check your connection." + **Reload menu** |
| 401 | Shared rule: clear user, go to `/login`, "Your session has ended. Please log in again." |
| 403 | Shared rule: go to own home, "You don't have access to that page." |
| Success | Menu list as above |

## 4. API

### `GET /api/menu`

Request: no body, no query. Session cookie required.

Response 200:

```json
{
  "items": [
    { "id": 1, "name": "Latte", "price": 6500, "isAvailable": true },
    { "id": 4, "name": "Croissant", "price": 4500, "isAvailable": false }
  ]
}
```

- `items` is ordered by `id` ascending; empty array when there are no rows.
- Only these four fields are returned.

Errors (shared shape `{ error: { code, message, details } }`):

| HTTP | code | When |
|---|---|---|
| 401 | `UNAUTHENTICATED` | No session cookie, unknown or expired session |
| 403 | `FORBIDDEN` | Logged in as OPERATOR |
| 500 | `INTERNAL_ERROR` | Unexpected error (no stack trace) |

## 5. Data

No schema change. Reads `menu_items` (`id`, `name`, `price` Int satang, `is_available` Boolean) created in #1. Seed has 6 items, one sold out (Croissant).

## 6. Acceptance criteria

| ID | Given / When / Then |
|---|---|
| AC-F02-01 | Given a logged-in customer, when they request the menu, then they get 200 and every menu item with `id`, `name`, `price` (integer satang) and `isAvailable`, ordered by `id`. |
| AC-F02-02 | Given an item marked sold out, when the menu is requested, then that item is still in the list with `isAvailable: false`. |
| AC-F02-03 | Given no session (or an expired one), when the menu is requested, then the server answers 401 `UNAUTHENTICATED` in the shared error shape. |
| AC-F02-04 | Given a logged-in operator, when they request the menu, then the server answers 403 `FORBIDDEN`. |
| AC-F02-05 | Given an empty `menu_items` table, when a customer requests the menu, then they get 200 with `items: []`. |
| AC-F02-06 | Given the customer opens `/menu`, then each item shows its name and price as `฿xx.xx`, and a sold-out item is greyed with a **Sold out** badge and a disabled + button. |
| AC-F02-07 | Given the menu request fails (network or 500), then the page shows "Couldn't load the menu. Check your connection." and **Reload menu** loads it again. |

## 7. Test specification

| Test ID | AC | Level | Precondition / input | Action | Expected |
|---|---|---|---|---|---|
| TEST-F02-01 | AC-F02-01 | API | Seeded DB; logged in as alice (CUSTOMER) | `GET /api/menu` | 200; 6 items; ids ascending; each has exactly `id, name, price, isAvailable`; every `price` is a positive integer; Latte price = 6500 |
| TEST-F02-02 | AC-F02-02 | API | Seeded DB (Croissant sold out); logged in as alice | `GET /api/menu` | Croissant present with `isAvailable: false`; other 5 `true` |
| TEST-F02-03 | AC-F02-03 | API | No cookie | `GET /api/menu` | 401, `error.code = UNAUTHENTICATED`, `message` is a string |
| TEST-F02-04 | AC-F02-03 | API | Session row with `expiresAt` in the past | `GET /api/menu` with that cookie | 401 `UNAUTHENTICATED` |
| TEST-F02-05 | AC-F02-04 | API | Logged in as staff (OPERATOR) | `GET /api/menu` | 403, `error.code = FORBIDDEN` |
| TEST-F02-06 | AC-F02-05 | API | Users seeded, `menu_items` empty; logged in as alice | `GET /api/menu` | 200, `{ items: [] }` |
| TEST-F02-07 | AC-F02-06 | unit | `formatBaht(6500)`, `formatBaht(15500)`, `formatBaht(0)`, `formatBaht(5)` | call | `฿65.00`, `฿155.00`, `฿0.00`, `฿0.05` |
| TEST-F02-08 | AC-F02-06 | E2E | Seeded DB; log in as alice in the browser | open `/menu` | Latte shows `฿65.00`; Croissant shows **Sold out** and its "Add Croissant" button is disabled |
| TEST-F02-09 | AC-F02-07 | E2E | Logged in as alice; `/api/menu` answered with 500 (route mocked) | open `/menu`, then click **Reload menu** after the mock is removed | Error text shown; after reload the menu list appears |

Tests are written first and must fail before the code exists (`[red]` commit, output saved in `docs/evidence/tdd/`), then pass (`[green]` commit). Test names start with the test ID, e.g. `it("TEST-F02-01 ...")`.

## 8. Definition of Done

Shared checklist: [`definition-of-done.md`](definition-of-done.md). F-02 extra evidence: red and green test output for TEST-F02-01..06, E2E run for TEST-F02-08..09, screenshot of `/menu` on phone and desktop with the sold-out item.

## 9. Version history

| Version | Date | Change | By |
|---|---|---|---|
| 1 | 6 Nov 2026 | First version, before implementation | ninja |
