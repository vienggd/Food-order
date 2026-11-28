# Lab 7 live checks L1–L8 (after the release)

Run on 28 Nov 2026 (times +07). Release: PR #216 `lab7` → `main`, merge commit `704a66b`, merged 28 Nov 00:13:46 (27 Nov 17:13:46 UTC). Deploy demo run `46040158850` success. Cloud Run revision `food-order-00011-9nh`, bundle `assets/index-CDaqMZLn.js`. Test accounts: seeded customers alice and bob, seeded staff (passwords are not written in the repo).

Results as reported by the testers (vieng and the head); screenshots are in `evidence/live/`.

| # | Check | Time | Result | Evidence |
|---|---|---|---|---|
| L1 | `GET /api/health`, `GET /api/ready` | 28 Nov | PASS: health ok; ready `{"status":"ready","db":"connected"}` (vieng) | response text above (no file) |
| L2 | alice places Latte ×10 + Americano ×5 (15 items) | 01:19:43 | PASS: order #18 PLACED, total 92500 satang (฿925.00) | `live/L2-order-18-placed.png`, `live/L2-L6-my-orders-list.png` (list shows "#18 … 15 items") |
| L3 | alice posts 10 + 6 items (16) | 00:52:18 | PASS: 400 `VALIDATION_ERROR`, message "An order can have at most 15 items in total", details `{field:"lines", max:15, total:16}`; alice's order count 16 before and 16 after (nothing saved) | API response (no file) |
| L4 | alice fills the cart to 15 in the UI | 01:19:39 | PASS: warning "Limit reached: an order can have at most 15 items in total."; all 6 Add buttons and the cart + are disabled | `live/L4-cart-15-menu.png`, `live/L4-cart-15-warning.png` |
| L5 | one line with quantity 11 | 00:52:18 | PASS: 400 (path `items.0.quantity`, max 10) | API response (no file) |
| L6 | old order #13 (26 Nov, ACCEPTED) | 01:20:08 | PASS: it is in the list and opens unchanged | `live/L6-old-order-13.png` |
| L7 | staff accepts #18 | 08:39:21 | PASS: PLACED → ACCEPTED (`acceptedAt` 2026-11-28T01:39:21.738Z), toast "Order #18 accepted.", #18 in the In progress tab | `live/L7-staff-queue-18-placed.jpg`, `live/L7-staff-accept-18-toast.jpg`, `live/L7-staff-18-accepted.jpg` |
| L8 | access path | see below | PASS: anonymous `GET /api/orders`, `GET /api/operator/orders`, `POST` → 401 (vieng); alice `GET /api/operator/orders` → 403 `FORBIDDEN` (00:52:08); bob `GET /api/orders/18` (alice's order) → 404 `NOT_FOUND` "Order not found." (08:34:45) | `live/L8-bob-alice-order-404.jpg` (UI "Order not found.") |

The screenshots show no password and no private data (demo accounts only).
