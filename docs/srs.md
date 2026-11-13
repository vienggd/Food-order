# Software Requirements Specification — Campus Café Pre-order

Deliverable 1, part A. Issue #6. Owner: A (vieng). Source of decisions: [`PLAN.md`](PLAN.md).
Requirement IDs are stable and match [`traceability.md`](traceability.md) and [`features.md`](features.md).
Version 1 — 6 Nov 2026. Later changes go in the change log at the bottom.

## 1. Problem and context

**Problem.** At lunch time students and staff queue at the campus café, order at the counter and then wait again while the food is made. The café cannot see demand before people arrive, and customers waste their short break waiting.

**Context.** One campus café (one shop, one menu, one queue). Customers order on their phone or laptop before they arrive and pick up when it is ready. Café staff see incoming orders in one shared queue and accept them in arrival order.

**Goal.** Customers order ahead and know the status of their order; staff see orders before customers arrive and work through them in order.

## 2. Actors and responsibilities

| Actor | Who | Responsibilities in the system |
|---|---|---|
| Customer (`CUSTOMER`) | Student or university staff member with a seeded account | Browse the menu, place orders, see own orders and their status; later cancel before acceptance and pay (simulated) |
| Operator (`OPERATOR`) | Café staff | See all new orders (one shop: every operator sees every order), accept them; later reject with a reason, move orders through preparation to pick-up, manage the menu and sold-out items, see sales |
| Anonymous visitor | Anyone not logged in | Can only open the login page |
| System | The server | Enforces login, roles, ownership and all business rules; calculates totals; keeps an order's lines unchanged after it is placed |

## 3. Scope

### In scope (whole product, 3 sprints)
- Login, logout and current-user identity with two roles (Sprint 1)
- Menu with prices and availability (Sprint 1); menu management and sold-out toggle (Sprint 2)
- Place an order, see own orders and order detail (Sprint 1)
- Operator order queue and accept (Sprint 1); reject, customer cancel, fulfilment PREPARING → READY → PICKED_UP (Sprint 2)
- Simulated payment status (Sprint 2)
- Pickup time slots with order cut-off, sales summary, order search/filter, hardening (Sprint 3)

### Explicit exclusions
- Self-registration, password recovery, account administration (seeded accounts only; allowed by the course brief)
- Real payment providers or storing card data (payment is simulated)
- More than one shop, delivery, loyalty points, discounts or coupons
- Item options (size, sugar level) and stock counts: an item is either available or sold out
- Push notifications, email or SMS; the customer refreshes the page to see status
- Native mobile apps (the web app works on phone and desktop browsers)

## 4. Functional requirements

Each requirement is observable through the UI and/or API. Detailed endpoints and acceptance criteria are in the feature contracts (`docs/sprints/sprint-1/`).

| ID | Requirement | Feature | Sprint |
|---|---|---|---|
| FR-01 | **Log in.** A user submits email and password. If they match a seeded account, the system starts a session and the user lands on their role's home page (customer → menu, operator → order queue). If not, the system shows "Incorrect email or password." and starts no session. | F-01 | 1 |
| FR-02 | **Log out.** A logged-in user logs out; the session ends on the server and any later request with the old session is treated as not logged in. | F-01 | 1 |
| FR-03 | **Current user.** The app can ask "who am I" and gets the user's name and role, or "not logged in". The UI shows name and role in the header and sends the user to their role's home page. | F-01 | 1 |
| FR-04 | **Role check on the server.** Every protected endpoint checks the session: no session → 401, wrong role → 403. The role always comes from the session, never from the request. | F-01 (used by F-02..F-04) | 1 |
| FR-05 | **View menu.** A customer sees every menu item with name and price in baht. Sold-out items are shown greyed out with "SOLD OUT" and cannot be added to the cart. | F-02 | 1 |
| FR-06 | **Place an order.** A customer sends a list of menu items and quantities. If all rules pass (BR-01..BR-04), the system saves the order as PLACED with its lines and a server-calculated total, and shows the order. If any rule fails, nothing is saved and the reason is shown. | F-03 | 1 |
| FR-07 | **List my orders.** A customer sees only their own orders, newest first, with order number, time, status and total. | F-03 | 1 |
| FR-08 | **My order detail.** A customer opens one of their orders and sees each line (name, unit price, quantity, line total), the total and the status. Another customer's order, or a missing id, shows "Order not found." | F-03 | 1 |
| FR-09 | **Operator queue.** An operator sees all PLACED orders, oldest first, with order number, customer name, time, items and total. | F-04 | 1 |
| FR-10 | **Accept an order.** An operator accepts a PLACED order; it becomes ACCEPTED and leaves the queue, and the customer sees ACCEPTED. | F-04 | 1 |
| FR-11 | **Menu management.** An operator adds and edits menu items (name, price) and marks an item sold out or available again. | F-05 | 2 |
| FR-12 | **Customer cancel.** A customer cancels their own order while it is still PLACED; it becomes CANCELLED. | F-06 | 2 |
| FR-13 | **Operator reject.** An operator rejects a PLACED order with a reason; it becomes REJECTED and the customer sees the reason. | F-06 | 2 |
| FR-14 | **Fulfilment.** An operator moves an order ACCEPTED → PREPARING → READY → PICKED_UP, one step at a time. | F-07 | 2 |
| FR-15 | **Simulated payment.** An order has a payment status UNPAID → PAID → REFUNDED, changed by a simulated payment step and by refunds of paid orders that are cancelled or rejected. | F-08 | 2 |
| FR-16 | **Pickup time slots.** A customer chooses a pickup slot instead of ASAP; orders for a slot close at a cut-off time before it. | F-09 | 3 |
| FR-17 | **Sales summary.** An operator sees order count and sales total per day and the best-selling items. | F-10 | 3 |
| FR-18 | **Search / filter.** Customers filter their orders by status; operators search orders by number, customer or status. | F-11 | 3 |

## 5. Business rules

Each rule is enforced by the server, whatever the client sends. Money is stored as whole satang (15500 = ฿155.00).

| ID | Rule | When broken |
|---|---|---|
| BR-01 | The quantity on each order line is a whole number from 1 to 10. | 400 VALIDATION_ERROR; nothing saved |
| BR-02 | An order has 1 to 20 lines, and the same menu item cannot appear on two lines. | 400 VALIDATION_ERROR; nothing saved |
| BR-03 | Every ordered item must exist and be available (not sold out) at the moment the order is placed. If any one item fails, the whole order is rejected and nothing is saved (one database transaction). | 400 VALIDATION_ERROR naming the bad item(s); no order and no lines stored |
| BR-04 | The server calculates the total from the database prices. A request that contains any price or total field is rejected. | 400 VALIDATION_ERROR; nothing saved |
| BR-05 | Each order line keeps a copy of the item name and unit price at the time the order was placed; later menu changes do not change existing orders. | — (checked by reading the order after a menu change) |
| BR-06 | Only an order with status PLACED can be accepted. | 409 INVALID_STATE; status unchanged |
| BR-07 | If two operators accept the same order at the same moment, exactly one succeeds and the other is told it was already accepted. | One 200, one 409 INVALID_STATE; order accepted once |

## 6. Non-functional requirements

| ID | Requirement | Measurable target | How we verify | Sprint |
|---|---|---|---|---|
| NFR-01 | **Credentials and sessions are protected.** | Passwords stored only as bcrypt hashes (cost ≥ 10). Session id is random (≥ 128 bits) in an httpOnly, SameSite=Lax cookie (Secure in production). Session expires 8 h after login; logout deletes it. | API tests: stored hash ≠ password; cookie flags; expired and logged-out sessions → 401 | 1 |
| NFR-02 | **The server is the authority.** | 0 endpoints take the user id, role, price or total from the request. Another customer's order returns 404 with no order data. Error responses never contain stack traces. | API tests for 401/403/404 per protected endpoint; test that a price field → 400; test that a 500 has no stack | 1 |
| NFR-03 | **One error format.** | 100% of API errors use `{ error: { code, message, details } }` with VALIDATION_ERROR 400, UNAUTHENTICATED 401, FORBIDDEN 403, NOT_FOUND 404, INVALID_STATE 409. | API tests assert code and shape on every error path | 1 |
| NFR-04 | **Data integrity.** | A rejected order leaves 0 rows. 20 parallel accepts of one order give exactly 1 success. | API/DB tests: row count after rejection; concurrency test | 1 |
| NFR-05 | **Automated tests, tests first.** | Every Sprint 1 acceptance criterion maps to ≥ 1 automated test; all pass on the release commit; rule tests have a failing run saved before the code. | Test run output on the release commit; red/green commits and saved output in `docs/evidence/tdd/` | 1 |
| NFR-06 | **Usable states on phone and desktop.** | Every Sprint 1 screen has loading, empty and error states as in `docs/ui/ui-spec.md`; works at 375 px and 1280 px wide without sideways scrolling. | End-to-end tests at both widths + screenshots | 1 |
| NFR-07 | **Deployable and configurable.** | All settings (database URL, seed password, port) come from environment variables; 0 secrets in Git; app runs as one container (Express serves the built React app). | Review + `git grep` for secrets each release; container build in Lab 5 | 1 (design), 2 (Lab 5) |
| NFR-08 | **Login rate limit.** | After 5 failed logins for one email within 15 minutes, further attempts get 429 for 15 minutes. | API test | 3 |
| NFR-09 | **Accessibility.** | Every Sprint 1–3 screen has no critical or serious issues in an automated accessibility check (axe), and works by keyboard only. | Playwright + axe check; manual keyboard check | 3 |

## 7. Assumptions

| ID | Assumption |
|---|---|
| AS-01 | There is one café and one shared queue; any operator may act on any order. |
| AS-02 | Accounts are seeded; the course does not require registration or password recovery. |
| AS-03 | Pickup is "as soon as possible" until pickup slots arrive in Sprint 3. |
| AS-04 | Prices are in Thai baht and do not include separate tax or service charges. |
| AS-05 | Customers refresh to see status changes; real-time updates are not needed. |
| AS-06 | Users have a modern browser (latest Chrome, Edge, Safari or Firefox). |

## 8. Decisions

| ID | Decision | Why |
|---|---|---|
| DEC-01 | Sessions in a database table with a random id in an httpOnly cookie, 8 h expiry (not JWT). | Logout really ends the session; the browser's script cannot read the cookie; simple to test. |
| DEC-02 | Same error for unknown email and wrong password. | Attackers cannot find which emails have accounts. |
| DEC-03 | Money as integer satang. | No rounding errors with decimals. |
| DEC-04 | Availability is a yes/no flag per item, not a stock count. | Matches how the café works (an item runs out); smallest version that works. |
| DEC-05 | Order statuses and allowed moves are kept in one transition table with `canTransition()`. Sprint 1 allows only PLACED → ACCEPTED. | Later sprints add rows instead of new code paths; easy to unit-test. |
| DEC-06 | Accept uses a conditional update `where status = PLACED`. | Two operators cannot both accept (BR-07) without locks. |
| DEC-07 | Another customer's order returns 404, not 403. | Does not reveal that the order exists. |
| DEC-08 | Payment status is separate from order status. | Paying and preparing are independent; keeps the order lifecycle simple. |

## 9. Questions and resolution

| ID | Question | Resolution |
|---|---|---|
| Q-01 | One café or many? | One café (AS-01). |
| Q-02 | Do operators only see orders they accepted? | No, one shared queue; all operators see all orders. |
| Q-03 | Choose a pickup time in Sprint 1? | No, ASAP in Sprint 1; slots in Sprint 3 (FR-16). |
| Q-04 | What happens if an item sells out while it is in a cart? | The server rejects the whole order on submit (BR-03); the UI reloads the menu and marks the line. |
| Q-05 | Can the client send the price to save a database lookup? | No, any price/total field is rejected (BR-04). |
| Q-06 | 403 or 404 for another customer's order? | 404 (DEC-07). |

## Change log

| Date | Version | Change | Why |
|---|---|---|---|
| 6 Nov 2026 | 1 | First version | Deliverable 1 part A |
