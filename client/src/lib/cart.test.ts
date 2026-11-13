import { describe, it, expect } from "vitest";
import { canAddFromMenu, cartReducer, emptyCart, MAX_LINES, type Cart } from "./cart";

const item = (id: number, price = 1000) => ({ id, name: `Item ${id}`, price });
const apply = (cart: Cart, ...actions: Parameters<typeof cartReducer>[1][]) => actions.reduce(cartReducer, cart);

describe("cartReducer", () => {
  it("TEST-F03-17 adding the same item twice gives one line with quantity 2", () => {
    const cart = apply(emptyCart, { type: "add", item: item(1) }, { type: "add", item: item(1) }, { type: "add", item: item(2) });
    expect(cart.lines).toHaveLength(2);
    expect(cart.lines[0]).toMatchObject({ menuItemId: 1, quantity: 2 });
    expect(cart.lines[1]).toMatchObject({ menuItemId: 2, quantity: 1 });
  });

  it("TEST-F03-18 quantity is clamped to 1-10 and a 21st different item is refused", () => {
    let cart = apply(emptyCart, { type: "add", item: item(1) });
    expect(apply(cart, { type: "setQty", menuItemId: 1, quantity: 0 }).lines[0].quantity).toBe(1);
    expect(apply(cart, { type: "setQty", menuItemId: 1, quantity: 11 }).lines[0].quantity).toBe(10);
    expect(apply(cart, { type: "setQty", menuItemId: 1, quantity: 2.7 }).lines[0].quantity).toBe(2);
    cart = apply(cart, { type: "setQty", menuItemId: 1, quantity: 10 }, { type: "add", item: item(1) });
    expect(cart.lines[0].quantity).toBe(10); // + at 10 does nothing

    let full = emptyCart;
    for (let i = 1; i <= MAX_LINES; i++) full = apply(full, { type: "add", item: item(i) });
    expect(full.lines).toHaveLength(20);
    expect(apply(full, { type: "add", item: item(21) }).lines).toHaveLength(20);
  });

  it("remove deletes the line; clear empties the cart; estimated total is price x qty", () => {
    const cart = apply(emptyCart, { type: "add", item: item(1, 6500) }, { type: "add", item: item(1, 6500) }, { type: "add", item: item(2, 5000) });
    expect(cart.lines.reduce((s, l) => s + l.price * l.quantity, 0)).toBe(18000);
    expect(apply(cart, { type: "remove", menuItemId: 1 }).lines.map((l) => l.menuItemId)).toEqual([2]);
    expect(apply(cart, { type: "clear" }).lines).toEqual([]);
  });

  it("TEST-F03-23 at 20 lines every menu + is disabled", () => {
    let cart = emptyCart;
    for (let i = 1; i < MAX_LINES; i++) cart = apply(cart, { type: "add", item: item(i) });
    expect(canAddFromMenu(cart)).toBe(true);
    cart = apply(cart, { type: "add", item: item(MAX_LINES) });
    expect(canAddFromMenu(cart)).toBe(false);
  });
});
