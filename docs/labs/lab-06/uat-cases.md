# Lab 6 — UAT cases for Campus Café Pre-order (Sprint 1)

Team **Est**, section 131 (vieng, ninja). Tested version: commit `b71cdb2` (see [`handoff.md`](handoff.md)).
Scope: F-01 login, F-02 menu, F-03 orders, F-04 operator queue + accept. Contracts: `docs/sprint_1/sprints/sprint-1/F-0x-*.md`.

## How to read this
- **Accounts** (labels only; passwords come privately): `CUSTOMER-A` = alice@cafe.test, `CUSTOMER-B` = bob@cafe.test, `OPERATOR` = staff@cafe.test.
- **Seed menu** (baht): Latte 65.00, Americano 55.00, Thai Milk Tea 50.00, Croissant 45.00 (**sold out**), Ham & Cheese Sandwich 75.00, Basil Chicken Rice 80.00.
- Run the cases **in order** UAT-01 → UAT-06. Order numbers (`#N`) differ on every run: write down the number you see.
- Record for every case: tester, date/time, actual result, PASS / FAIL / BLOCKED. Use one private window per account.
- Expected texts are copied from the app and contracts; compare them exactly.

| ID | Category | Purpose | Role(s) | Links |
|---|---|---|---|---|
| UAT-01 | Normal | Place an order and have staff accept it | CUSTOMER-A, OPERATOR | FR-06, FR-09, FR-10; AC-F03-01, AC-F03-10, AC-F04-04, AC-F04-12 |
| UAT-02 | Rule boundary | Quantity limit 10 and sold-out item | CUSTOMER-A | BR-01, BR-03; AC-F03-02, AC-F03-04, AC-F02-06 |
| UAT-03 | Forbidden / ownership | Wrong role and another customer's order | CUSTOMER-A, CUSTOMER-B, OPERATOR | AC-F01-14, AC-F03-08 |
| UAT-04 | State / persistence | Order survives a new session; double accept refused | CUSTOMER-A, OPERATOR | NFR-04, BR-06; AC-F03-07, AC-F04-05, AC-F04-13 |
| UAT-05 | Normal / state | Wrong password; log out ends the session | CUSTOMER-A | AC-F01-02, AC-F01-09, AC-F01-13 |
| UAT-06 | Forbidden (API, optional) | Tampered price / total is refused | CUSTOMER-A | BR-04; AC-F03-05 |

---

## UAT-01 — Place an order, staff accepts it (normal)
- **Purpose:** the main journey works end to end.
- **Role:** CUSTOMER-A, then OPERATOR.
- **Preconditions:** app is up; seed menu unchanged.
- **Inputs:** Latte ×2, Americano ×1.
1. In window 1 open the live URL and log in as CUSTOMER-A.
2. On the menu press **+** on Latte twice and **+** on Americano once.
3. Check the cart, then press **Place order →**.
4. Note the order number `#N`.
5. In window 2 log in as OPERATOR. Find order `#N` in the queue.
6. Press **Accept order** on `#N`.
7. In window 1 open **My orders**, then order `#N` (reload the page).

**Expected:**
- Step 1: customer lands on `/menu`; the header shows "Alice" and the role.
- Step 3: cart shows Latte ×2 and Americano ×1 on two lines.
- Step 4: URL `/orders/N`; text "Order #N placed!"; Latte ×2 at ฿65.00, Americano ×1 at ฿55.00; total **฿185.00**; status PLACED; hint "Waiting for the café to accept your order."
- Step 5: operator lands on `/operator/orders`; heading "New orders" with a count; the card for `#N` shows Alice, Latte ×2, Americano ×1, ฿185.00.
- Step 6: button shows "Accepting…", then "Order #N accepted." and the card disappears.
- Step 7: status ACCEPTED, hint "Accepted — being prepared soon."; total still ฿185.00.

## UAT-02 — Quantity limit and sold-out item (rule boundary)
- **Purpose:** boundary 10 / 11 and the sold-out rule.
- **Role:** CUSTOMER-A.
- **Preconditions:** logged in as CUSTOMER-A; empty cart; note the number of orders in My orders (`K`).
- **Inputs:** Thai Milk Tea ×10, then try ×11; Croissant.
1. Add Thai Milk Tea once, then raise the quantity to 10 with the stepper.
2. Try to raise it to 11.
3. Place the order with quantity 10.
4. Go back to the menu and look at Croissant.
5. Try to add Croissant.
6. Open My orders.

**Expected:**
- Steps 1–2: the stepper stops at **10**; it cannot go to 11.
- Step 3: order placed; total **฿500.00** (50.00 × 10); status PLACED.
- Step 4: Croissant is greyed with a **Sold out** badge.
- Step 5: its **+** (Add Croissant) button is disabled; nothing is added to the cart.
- Step 6: exactly **K + 1** orders; none contains Croissant.

## UAT-03 — Wrong role and another customer's order (forbidden / ownership)
- **Purpose:** roles and ownership are enforced, not only hidden.
- **Roles:** CUSTOMER-A, CUSTOMER-B, OPERATOR.
- **Preconditions:** CUSTOMER-A has an order from UAT-01, number `#A`. CUSTOMER-B has no order `#A`.
1. Log in as CUSTOMER-A. Type `/operator/orders` in the address bar.
2. Log out. Log in as CUSTOMER-B. Type `/orders/A` (use the real number).
3. Type `/orders/99999`.
4. Log out. Without logging in, open `/menu`.
5. Log in as OPERATOR. Type `/menu`.
6. Log in again as CUSTOMER-A and open order `#A`.

**Expected:**
- Step 1: you end on `/menu` with the message "You don't have access to that page."; the queue is not shown.
- Step 2: "Order not found." No lines, total or name belonging to Alice are visible.
- Step 3: the same "Order not found." as step 2.
- Step 4: you are sent to `/login`.
- Step 5: you end on `/operator/orders` with "You don't have access to that page."; no menu list.
- Step 6: order `#A` is unchanged (same status and total as in UAT-01).

## UAT-04 — Persistence and double accept (state)
- **Purpose:** saved state survives a new session; an order cannot be accepted twice.
- **Roles:** CUSTOMER-A, OPERATOR (two windows).
- **Preconditions:** CUSTOMER-A places a new order `#P` (Thai Milk Tea ×1, ฿50.00), status PLACED.
1. CUSTOMER-A logs out, closes the window, opens a new window and logs in again.
2. Open My orders, then order `#P`.
3. Open two operator windows, both logged in as OPERATOR and both showing `#P` in the queue.
4. In window 1 press **Accept order** on `#P`.
5. In window 2 (do not reload) press **Accept order** on `#P`.
6. CUSTOMER-A opens `#P` again.

**Expected:**
- Step 2: `#P` is listed as PLACED, ฿50.00, 1 item.
- Step 4: "Order #P accepted."
- Step 5: "Order #P: Already accepted by another staff member."; the list reloads and `#P` is gone.
- Step 6: status ACCEPTED; total ฿50.00.

## UAT-05 — Wrong password and log out (normal / state)
- **Purpose:** a failed login leaks nothing; a finished session cannot be reused.
- **Role:** CUSTOMER-A.
- **Preconditions:** logged out.
1. Open `/login`. Enter alice@cafe.test and a wrong password; press **Log in**.
2. Log in with the correct password.
3. Press **Log out**.
4. Press the browser **Back** button and reload; then type `/orders` in the address bar.

**Expected:**
- Step 1: "Incorrect email or password."; password field empty; email field still alice@cafe.test.
- Step 2: you land on `/menu`.
- Step 3: you are on `/login`.
- Step 4: no menu or orders are shown; you end on `/login`.

## UAT-06 — Tampered price or total (forbidden, API, optional)
- **Purpose:** the server decides the price (BR-04). Needs the browser console; if the tester cannot do it, mark **BLOCKED** and say why.
- **Role:** CUSTOMER-A.
- **Preconditions:** logged in as CUSTOMER-A; note `K` = orders in My orders; open `/api/menu` and note Latte's `id` (use it as `LATTE_ID`).
1. In the console run: `fetch('/api/orders',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({items:[{menuItemId:LATTE_ID,quantity:1,unitPrice:1}]})}).then(r=>r.json().then(b=>console.log(r.status,b)))`
2. Run it again with the body `JSON.stringify({total:1,items:[{menuItemId:LATTE_ID,quantity:1}]})`.
3. Open My orders.

**Expected:**
- Steps 1 and 2: status **400** and `error.code` = `VALIDATION_ERROR`.
- Step 3: still exactly `K` orders.
